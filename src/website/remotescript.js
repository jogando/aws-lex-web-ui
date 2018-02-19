//https://aws.amazon.com/blogs/machine-learning/capturing-voice-input-in-a-browser/
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

RemoteClass.prototype.onSdkLoad = function () {
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        // Provide your Pool Id here
        IdentityPoolId: 'us-east-1:f40ca8b1-d79a-43a9-9316-ee4ab3e76d37',
    });

    var script = document.createElement('script');
    var self = this;
    script.onload = function () {
        self.onAudioControlLoad();
    };
    script.src = "https://rawgit.com/awslabs/aws-lex-browser-audio-capture/master/dist/aws-lex-audio.js";

    document.head.appendChild(script);
}

RemoteClass.prototype.onAudioControlLoad = function () {
    var audioControl = new LexAudio.audioControl();

    var script = document.createElement('script');
    var self = this;
    script.onload = function () {
        self.onRendererLoad();
    };
    script.src = "https://rawgit.com/jogando/aws-lex-web-ui/master/src/website/renderer.js";

    document.head.appendChild(script);
}

RemoteClass.prototype.onRendererLoad = function () {
    //var waveform = window.Waveform();
    var message = document.getElementsByClassName('message-box')[0];
    var config, conversation;
    message.textContent = 'Passive';
    document.getElementsByClassName('audio-control')[0].onclick = function () {
        config = {
            lexConfig: { botName: "ReportCreator" }
        };
        conversation = new LexAudio.conversation(config, function (state) {
            message.textContent = state + '...';
            if (state === 'Listening') {
                console.log("listening");
                //waveform.prepCanvas();
            }
            if (state === 'Sending') {
                console.log("sending");
                //waveform.clearCanvas();
            }
        }, function (data) {
            console.log('Transcript: ', data.inputTranscript, ", Response: ", data.message);
        }, function (error) {
            message.textContent = error;
        }, function (timeDomain, bufferLength) {
            //waveform.visualizeAudioBuffer(timeDomain, bufferLength);
        });
        conversation.advanceConversation();
    };
}
