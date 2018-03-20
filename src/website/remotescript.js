//
var remoteClass;
function RemoteClass() {

}

RemoteClass.prototype.setControlHost = function (ref) {
    remoteClass = this;
    this.controlHost = ref;

    var script = document.createElement('script');
    var self = this;
    script.onload = function () {
        self.onSdkLoad();
    };
    script.src = "https://sdk.amazonaws.com/js/aws-sdk-2.41.0.min.js";

    document.head.appendChild(script);
};

var myRecorder;

RemoteClass.prototype.onSdkLoad = function () {
    /*AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        // Provide your Pool Id here
        IdentityPoolId: 'us-east-1:f40ca8b1-d79a-43a9-9316-ee4ab3e76d37',
    });*/

    myRecorder = new Recorder();
    myRecorder.init();
}

function Recorder() {
    var _this = this;

    this.state = {
        recordStyle: "idle",
        audioURL: ""
    };

    //variables
    this.recorder = {};
    this.status = "";
    this.audioContext = new AudioContext();
    this.userAudio = {};
    this.lexAudio = {};

    //configurations
    var AWSConfig = new AWS.CognitoIdentityCredentials({ IdentityPoolId: 'us-east-1:cdb1aaa3-ebc7-4f7b-b749-b483873d7847' });
    var LexConfig = new AWS.Config({
        credentials: AWSConfig,
        region: 'us-east-1',
    });

    AWS.config.update({
        credentials: AWSConfig,
        region: 'us-east-1'
    });

    this.lexruntime = new AWS.LexRuntime();

    this.record = this.record.bind(this);
    this.stop = this.stop.bind(this);
    this.action = this.action.bind(this);
    this.sendToServer = this.sendToServer.bind(this);
    this.state = {
        recorder: 'idle'
    };
}

Recorder.prototype.init = function () {
    var _this = this;

    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(
        function onSuccess(stream) {

            var data = [];

            _this.recorder = new MediaRecorder(stream);
            //_this.userAudio = document.getElementsByClassName('user-speech')[0];
            //_this.lexAudio = document.getElementsByClassName('lex-speech')[0];

            _this.recorder.ondataavailable = function (e) {
                data.push(e.data);
            };

            _this.recorder.onerror = function (e) {
                throw e.error || new Error(e.name);
            }

            _this.recorder.onstart = function (e) {
                data = [];
            }

            _this.recorder.onstop = function (e) {

                var blobData = new Blob(data, { type: 'audio/x-l16' });

                //_this.userAudio.src = window.URL.createObjectURL(blobData);

                var reader = new FileReader();

                reader.onload = function () {

                    _this.audioContext.decodeAudioData(reader.result, function (buffer) {

                        _this.reSample(buffer, 16000, function (newBuffer) {

                            var arrayBuffer = _this.convertFloat32ToInt16(newBuffer.getChannelData(0));
                            _this.sendToServer(_this.convertFloat32ToInt16(newBuffer.getChannelData(0)));

                        });
                    });
                };
                reader.readAsArrayBuffer(blobData);
            }

        })
        .catch(function onError(error) {
            console.log(error.message);
        });
    this.updateStatus("idle");
};

Recorder.prototype.updateStatus = function (status) {
    this.status = status;

    var btnMain = document.getElementsByClassName("btnMain")[0];

    switch(status){
        case "recording":
            btnMain.disabled = false;
            btnMain.value = "Stop";
            btnMain.onclick = this.stop;
            break;
        case "idle":
            btnMain.disabled = false;
            btnMain.value = "Record";
            btnMain.onclick = this.record;
            break;
        case "loading":
            btnMain.disabled = true;
            break;
    }
}

Recorder.prototype.record = function () {
    this.recorder.start();
    this.updateStatus("recording");
    /*this.setState({
        recorder: 'recording'
    });*/
};

Recorder.prototype.stop = function () {
    this.recorder.stop();
    this.updateStatus("recording");
    /*this.setState({
        recorder: 'idle'
    });*/
};

Recorder.prototype.action = function () {
    console.log(this.state.recorder);
    switch (this.state.recorder) {
        case 'idle': this.record(); break;
        case 'recording': this.stop(); break;
    }
};

Recorder.prototype.reSample = function (audioBuffer, targetSampleRate, onComplete) {
    var channel = audioBuffer.numberOfChannels;
    var samples = audioBuffer.length * targetSampleRate / audioBuffer.sampleRate;

    var offlineContext = new OfflineAudioContext(channel, samples, targetSampleRate);
    var bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = audioBuffer;

    bufferSource.connect(offlineContext.destination);
    bufferSource.start(0);
    offlineContext.startRendering().then(function (renderedBuffer) {
        onComplete(renderedBuffer);
    })
};

Recorder.prototype.convertFloat32ToInt16 = function (buffer) {
    var l = buffer.length;
    var buf = new Int16Array(l);
    while (l--) {
        buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
    }
    return buf.buffer;
};

Recorder.prototype.sendToServer = function (audioData) {
    this.handleResponse(null);
    var _this = this;
    var params = {
        botAlias: '$LATEST', /* required */
        botName: 'BI_ReportingAssistant', /* required */
        contentType: 'audio/x-l16; sample-rate=16000; channel-count=1', /* required */
        inputStream: audioData, /* required */
        userId: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', /* required */
        accept: 'audio/mpeg'
    };

    this.updateStatus("loading");
    this.lexruntime.postContent(params, function (err, data) {
        _this.updateStatus("idle");
        
        if (err) console.log('ERROR!', err, err.stack); // an error occurred
        else {
            _this.handleResponse(data,_this);
            var uInt8Array = new Uint8Array(data.audioStream);
            var arrayBuffer = uInt8Array.buffer;
            var blob = new Blob([arrayBuffer]);
            var url = URL.createObjectURL(blob);
            //_this.lexAudio.src = url;
            //_this.lexAudio.play();
            //_this.setState({ 'lexResponseText': data.message });
        }
    });
}

Recorder.prototype.parseSlotContent = function (value) {
    var words = value.split(" ");
    var result = [];

    var skipWords = ["and",","];

    for(var i=0;i<words.length;i++){
        if(skipWords.indexOf(words[i])>-1){
            continue;
        }
        result.push(words[i]);
    }

    return result;
}

Recorder.prototype.handleResponse = function (data,_this) {
    var transcriptElmnt = document.getElementsByClassName("lex-response-transcript")[0];
    data && data.inputTranscript ? transcriptElmnt.innerHTML = "<b>Transcript:</b>&nbsp;"+data.inputTranscript : transcriptElmnt.innerHTML = "";

    var intentElmnt = document.getElementsByClassName("lex-response-intent")[0];
    data && data.intentName ? intentElmnt.innerHTML = "<b>Intent:</b>&nbsp;"+data.intentName : intentElmnt.innerHTML = "";

    var messageElmnt = document.getElementsByClassName("lex-response")[0];
    data && data.message ? messageElmnt.innerHTML = "<hr/><b>Response:</b>" + data.message : messageElmnt.innerHTML = "";

    document.getElementsByClassName("lex-response-slot")[0].innerHTML = "";
    if(data && data.slots){
        var html = "<b>Slots</b><br/>";
        for (var property in data.slots) {
            if (data.slots.hasOwnProperty(property)) {
                var values = JSON.stringify(_this.parseSlotContent(data.slots[property]));
                html += property + ": "+ values;
                html += "<br/>";
            }
        }

        document.getElementsByClassName("lex-response-slot")[0].innerHTML = html;
    }
}