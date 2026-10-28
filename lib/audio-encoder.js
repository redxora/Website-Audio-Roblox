"use client";
export const EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
export async function renderEditedAudioBuffer(opts) {
    const { inputBuffer, startTime, endTime, speedVal = 1, pitchSemitones = 0, volumePercent = 100, eqGains = [], fadeIn = false, fadeInSec = 0, fadeOut = false, fadeOutSec = 0, } = opts;
    const safeStart = Math.max(0, Math.min(startTime, inputBuffer.duration));
    const safeEnd = Math.max(safeStart + 0.05, Math.min(endTime, inputBuffer.duration));
    const rawDuration = Math.max(0.05, safeEnd - safeStart);
    const safeSpeed = Math.max(0.25, Math.min(4.0, speedVal || 1));
    const targetDuration = Math.max(0.05, rawDuration / safeSpeed);
    const sampleRate = inputBuffer.sampleRate || 44100;
    const numChannels = Math.min(2, Math.max(1, inputBuffer.numberOfChannels));
    const lengthInFrames = Math.max(1, Math.round(targetDuration * sampleRate));
    const OfflineAudioCtx = typeof window !== "undefined"
        ? window.OfflineAudioContext || window.webkitOfflineAudioContext
        : null;
    if (!OfflineAudioCtx) {
        throw new Error("OfflineAudioContext is not supported in this environment");
    }
    const offlineCtx = new OfflineAudioCtx(numChannels, lengthInFrames, sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = inputBuffer;
    source.playbackRate.value = safeSpeed;
    if (typeof source.detune !== "undefined") {
        source.detune.value = (pitchSemitones || 0) * 100;
    }
    const filterNodes = [];
    EQ_FREQUENCIES.forEach((freq, idx) => {
        const filter = offlineCtx.createBiquadFilter();
        if (idx === 0) {
            filter.type = "lowshelf";
        }
        else if (idx === EQ_FREQUENCIES.length - 1) {
            filter.type = "highshelf";
        }
        else {
            filter.type = "peaking";
            filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = eqGains[idx] || 0;
        filterNodes.push(filter);
    });
    for (let i = 0; i < filterNodes.length - 1; i++) {
        filterNodes[i].connect(filterNodes[i + 1]);
    }
    const gainNode = offlineCtx.createGain();
    const baseGain = Math.max(0, (volumePercent || 100) / 100);
    gainNode.gain.setValueAtTime(baseGain, 0);
    if (fadeIn && fadeInSec > 0) {
        const actualFadeIn = Math.min(fadeInSec, targetDuration / 2);
        gainNode.gain.setValueAtTime(0, 0);
        gainNode.gain.linearRampToValueAtTime(baseGain, actualFadeIn);
    }
    if (fadeOut && fadeOutSec > 0) {
        const actualFadeOut = Math.min(fadeOutSec, targetDuration / 2);
        const fadeOutStart = Math.max(0, targetDuration - actualFadeOut);
        gainNode.gain.setValueAtTime(baseGain, fadeOutStart);
        gainNode.gain.linearRampToValueAtTime(0, targetDuration);
    }
    if (filterNodes.length > 0) {
        source.connect(filterNodes[0]);
        filterNodes[filterNodes.length - 1].connect(gainNode);
    }
    else {
        source.connect(gainNode);
    }
    gainNode.connect(offlineCtx.destination);
    source.start(0, safeStart, rawDuration);
    return await offlineCtx.startRendering();
}
export async function audioBufferToWav(buffer, startSec = 0, endSec, onProgress) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const startSample = Math.max(0, Math.floor(startSec * sampleRate));
    const endSample = Math.min(buffer.length, Math.floor((endSec !== undefined ? endSec : buffer.duration) * sampleRate));
    const length = Math.max(0, endSample - startSample);
    const dataSize = length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);
    const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);
    let offset = 44;
    const channels = [];
    for (let c = 0; c < numChannels; c++) {
        channels.push(buffer.getChannelData(c));
    }
    const CHUNK_SIZE = 65536;
    for (let i = 0; i < length; i += CHUNK_SIZE) {
        const chunkEnd = Math.min(length, i + CHUNK_SIZE);
        for (let idx = i; idx < chunkEnd; idx++) {
            for (let c = 0; c < numChannels; c++) {
                let sample = channels[c][startSample + idx] || 0;
                sample = Math.max(-1, Math.min(1, sample));
                const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
                view.setInt16(offset, intSample, true);
                offset += 2;
            }
        }
        if (onProgress) {
            onProgress(Math.round((chunkEnd / length) * 100));
        }
        if (chunkEnd < length) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }
    return new Blob([view], { type: "audio/wav" });
}
async function loadLameJs() {
    if (typeof window === "undefined")
        return null;
    if (window.lamejs?.Mp3Encoder) {
        return window.lamejs;
    }
    return new Promise((resolve) => {
        const existing = document.querySelector('script[data-lamejs="true"]');
        if (existing) {
            if (window.lamejs?.Mp3Encoder) {
                return resolve(window.lamejs);
            }
            existing.addEventListener("load", () => resolve(window.lamejs));
            return;
        }
        const script = document.createElement("script");
        script.src = "/vendor/lame.min.js";
        script.setAttribute("data-lamejs", "true");
        script.onload = () => {
            resolve(window.lamejs);
        };
        script.onerror = () => {
            console.warn("Failed to load /vendor/lame.min.js");
            resolve(null);
        };
        document.head.appendChild(script);
    });
}
export async function audioBufferToMp3(buffer, startSec = 0, endSec, onProgress) {
    const lame = await loadLameJs();
    if (!lame || !lame.Mp3Encoder) {
        console.warn("Lamejs Mp3Encoder unavailable, falling back to WAV");
        return audioBufferToWav(buffer, startSec, endSec, onProgress);
    }
    const sampleRate = buffer.sampleRate;
    const channels = Math.min(2, Math.max(1, buffer.numberOfChannels));
    const encoder = new lame.Mp3Encoder(channels, sampleRate, 192);
    const from = Math.max(0, Math.floor(startSec * sampleRate));
    const to = Math.min(buffer.length, Math.floor((endSec !== undefined ? endSec : buffer.duration) * sampleRate));
    const left = buffer.getChannelData(0).subarray(from, to);
    const right = channels > 1 ? buffer.getChannelData(1).subarray(from, to) : left;
    const blockSize = 1152;
    const parts = [];
    const totalBlocks = Math.ceil(left.length / blockSize);
    for (let i = 0; i < left.length; i += blockSize) {
        const l = new Int16Array(blockSize);
        const r = new Int16Array(blockSize);
        for (let j = 0; j < blockSize; j++) {
            const ls = left[i + j] ?? 0;
            const rs = right[i + j] ?? 0;
            l[j] = Math.max(-1, Math.min(1, ls)) * 32767;
            r[j] = Math.max(-1, Math.min(1, rs)) * 32767;
        }
        const buf = channels === 1 ? encoder.encodeBuffer(l) : encoder.encodeBuffer(l, r);
        if (buf && buf.length > 0) {
            parts.push(new Uint8Array(buf));
        }
        const currentBlock = Math.floor(i / blockSize);
        if (currentBlock % 30 === 0) {
            if (onProgress) {
                onProgress(Math.round((currentBlock / totalBlocks) * 100));
            }
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }
    const tail = encoder.flush();
    if (tail && tail.length > 0) {
        parts.push(new Uint8Array(tail));
    }
    if (onProgress)
        onProgress(100);
    return new Blob(parts, { type: "audio/mpeg" });
}
