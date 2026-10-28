const MAX_SECONDS = Math.max(30, Number.parseInt(process.env.NEXT_PUBLIC_MAX_AUDIO_DURATION_SECONDS || "600", 10) || 600);
const MAX_BYTES = Math.max(1, Number.parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || "80", 10) || 80) *
    1024 *
    1024;
const DEFAULT_SAMPLE_RATE = Math.max(8000, Number.parseInt(process.env.NEXT_PUBLIC_AUDIO_SAMPLE_RATE || "22050", 10) || 22050);
export function assertAllowedAudioUrl(raw) {
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        throw new Error("Masukkan URL audio yang valid.");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("URL audio harus menggunakan HTTP atau HTTPS.");
    }
    if (url.username || url.password) {
        throw new Error("URL dengan username/password tidak didukung.");
    }
    return url;
}
function writeAscii(view, offset, text) {
    for (let i = 0; i < text.length; i++) {
        view.setUint8(offset + i, text.charCodeAt(i));
    }
}
async function encodeWav(buffer, targetRate = DEFAULT_SAMPLE_RATE, speed = 1.0, volumeDb = 0, onProgress) {
    const sourceChannels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
    const effectiveSpeed = speed > 0 ? speed : 1.0;
    const length = Math.ceil((buffer.length * targetRate) / (buffer.sampleRate * effectiveSpeed));
    const bytes = 44 + length * 2;
    const volumeMultiplier = Math.pow(10, volumeDb / 20);
    if (bytes > MAX_BYTES) {
        throw new Error(`Hasil audio melewati batas ${Math.round(MAX_BYTES / (1024 * 1024))} MB. Gunakan audio yang lebih pendek.`);
    }
    const wav = new ArrayBuffer(bytes);
    const view = new DataView(wav);
    writeAscii(view, 0, "RIFF");
    view.setUint32(4, bytes - 8, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, length * 2, true);
    let lastYieldAt = 0;
    let lastPercent = -1;
    for (let i = 0; i < length; i++) {
        const src = Math.min(buffer.length - 1, Math.floor((i * buffer.sampleRate * effectiveSpeed) / targetRate));
        let sample = 0;
        for (const channel of sourceChannels) {
            sample += channel[src] || 0;
        }
        sample /= sourceChannels.length;
        sample *= volumeMultiplier;
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
        if (onProgress) {
            const percent = Math.floor(((i + 1) / length) * 100);
            if (percent !== lastPercent) {
                const now = performance.now();
                if (now - lastYieldAt > 60) {
                    lastYieldAt = now;
                    lastPercent = percent;
                    onProgress(percent);
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            }
        }
    }
    if (onProgress)
        onProgress(100);
    return new Blob([wav], { type: "audio/wav" });
}
export async function prepareAudio(input, options, onProgress) {
    let source;
    let name;
    let title;
    if (typeof input === "string") {
        const url = assertAllowedAudioUrl(input);
        onProgress?.({ stage: "extract", percent: null });
        const response = await fetch("/api/audio/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: url.toString() }),
        });
        if (!response.ok) {
            const errData = (await response.json().catch(() => ({})));
            throw new Error(typeof errData.error === "string"
                ? errData.error
                : `Failed to fetch audio from link (HTTP ${response.status}).`);
        }
        const totalBytes = Number(response.headers.get("content-length") || 0);
        if (response.body && totalBytes > 0) {
            const reader = response.body.getReader();
            const chunks = [];
            let received = 0;
            for (; ;) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (value) {
                    chunks.push(value);
                    received += value.length;
                    onProgress?.({
                        stage: "extract",
                        percent: Math.min(99, Math.floor((received / totalBytes) * 100)),
                    });
                }
            }
            source = new Blob(chunks, {
                type: response.headers.get("content-type") || "audio/mpeg",
            });
        }
        else {
            source = await response.blob();
        }
        name = response.headers.get("x-audio-name") || "audio-converted.webm";
        const rawTitleHeader = response.headers.get("x-audio-title");
        title = rawTitleHeader
            ? decodeURIComponent(rawTitleHeader)
            : name.replace(/\.[^.]+$/, "");
    }
    else {
        source = input;
        name = input.name;
        title = input.name.replace(/\.[^.]+$/, "");
    }
    if (!source.size) {
        throw new Error("Audio file is empty or unreadable. Please choose another file.");
    }
    if (source.size > MAX_BYTES) {
        throw new Error(`File audio maksimal ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`);
    }
    const AudioCtx = window.AudioContext ||
        window.webkitAudioContext;
    if (!AudioCtx) {
        throw new Error("Browser ini tidak mendukung pemrosesan audio.");
    }
    const context = new AudioCtx();
    try {
        onProgress?.({ stage: "decode", percent: null });
        const arrayBuf = await source.arrayBuffer();
        const decoded = await context.decodeAudioData(arrayBuf);
        const speed = typeof options?.speed === "number" && options.speed > 0 ? options.speed : 2.3;
        const volumeDb = typeof options?.volumeDb === "number" ? options.volumeDb : -8;
        const durationSeconds = decoded.duration / speed;
        if (!Number.isFinite(durationSeconds) ||
            durationSeconds <= 0 ||
            durationSeconds > MAX_SECONDS) {
            throw new Error(`Durasi audio maksimal ${Math.round(MAX_SECONDS / 60)} menit.`);
        }
        const blob = await encodeWav(decoded, DEFAULT_SAMPLE_RATE, speed, volumeDb, (percent) => {
            onProgress?.({ stage: "encode", percent });
        });
        return {
            blob,
            name: name.replace(/\.[^.]+$/, "") + ".wav",
            title,
            durationSeconds,
        };
    }
    catch (error) {
        if (error instanceof Error &&
            (error.message.includes("maksimal") || error.message.includes("MB"))) {
            throw error;
        }
        throw new Error("Browser tidak dapat membaca format audio ini. Coba file MP3 atau WAV.");
    }
    finally {
        await context.close().catch(() => undefined);
    }
}
export function downloadFile(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
