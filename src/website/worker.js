var recLength = 0,
    recBuffer = [];

function record(inputBuffer) {
    recBuffer.push(inputBuffer[0]);
    recLength += inputBuffer[0].length;
}

function exportBuffer() {
    // Merge
    var mergedBuffers = mergeBuffers(recBuffer, recLength);
    // Downsample
    var downsampledBuffer = downsampleBuffer(mergedBuffers, 16000);
    // Encode as a WAV
    var encodedWav = encodeWAV(downsampledBuffer);
    // Create Blob
    var audioBlob = new Blob([encodedWav], { type: 'application/octet-stream' });
    postMessage(audioBlob);
}

function mergeBuffers(bufferArray, recLength) {
    var result = new Float32Array(recLength);
    var offset = 0;
    for (var i = 0; i < bufferArray.length; i++) {
        result.set(bufferArray[i], offset);
        offset += bufferArray[i].length;
    }
    return result;
}

function downsampleBuffer(buffer) {
    if (16000 === sampleRate) {
        return buffer;
    }
    var sampleRateRatio = sampleRate / 16000;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0,
            count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}

function encodeWAV(samples) {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);

    return view;
  }