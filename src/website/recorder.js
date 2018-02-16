// Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
var recording, node = source.context.createScriptProcessor(4096, 1, 1);

/**
 * The onaudioprocess event handler of the ScriptProcessorNode interface. It is the EventHandler to be 
 * called for the audioprocess event that is dispatched to ScriptProcessorNode node types. 
 * @param {AudioProcessingEvent} audioProcessingEvent - The audio processing event.
 */
node.onaudioprocess = function (audioProcessingEvent) {
    if (!recording) {
        return;
    }

    worker.postMessage({
        command: 'record',
        buffer: [
            audioProcessingEvent.inputBuffer.getChannelData(0),
        ]
    });
};

/**
 * Sets recording to true.
 */
var record = function () {
    recording = true;
};

/**
 * Sets recording to false.
 */
var stop = function () {
    recording = false;
};