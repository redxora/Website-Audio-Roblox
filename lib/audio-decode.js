export async function decodeAudioSamples(context, buffer, channel = 0) {
    const audioBuffer = await context.decodeAudioData(buffer.slice(0));
    const channelIndex = Math.min(channel, audioBuffer.numberOfChannels - 1);
    return audioBuffer.getChannelData(channelIndex);
}
export async function decodeAudioChannels(context, buffer) {
    const audioBuffer = await context.decodeAudioData(buffer.slice(0));
    return Array.from({ length: audioBuffer.numberOfChannels }, (_, channel) => audioBuffer.getChannelData(channel));
}
