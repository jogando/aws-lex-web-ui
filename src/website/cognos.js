define(["https://rawgit.com/jogando/aws-lex-web-ui/master/src/website/remotescript.js"], function () {
    "use strict";
    

    function Control() {
    };

    Control.prototype.initialize = function (oControlHost, fnDoneInitializing) {
        this.m_oControlHost = oControlHost;

        fnDoneInitializing();
    };

    Control.prototype.destroy = function (oControlHost) {
        this.m_oControlHost = null;
    };

    Control.prototype.draw = function (oControlHost) {
        this.remoteClass = new RemoteClass();
        this.remoteClass.setControlHost(oControlHost);
    }

    Control.prototype.setData = function (oControlHost, oDataStore) {

    };


    return Control;
});