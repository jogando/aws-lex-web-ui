function RemoteClass () {

}
 
RemoteClass.prototype.setControlHost = function(ref) {
    this.controlHost = ref;
    
    var script = document.createElement('script');
    var self = this;
    script.onload = function () {
        self.onSdkLoad();
    };
    script.src = "https://sdk.amazonaws.com/js/aws-sdk-2.41.0.min.js";
    
    document.head.appendChild(script);
};

RemoteClass.prototype.onSdkLoad = function(ref) {
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    // Provide your Pool Id here
        IdentityPoolId: 'us-east-1:XXXXX',
    });

    var lexruntime = new AWS.LexRuntime();
    var lexUserId = 'chatbot-demo' + Date.now();
    var sessionAttributes = {};

}

