define(["http://localhost:8000/remotescript.js"], function () {
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

 
    return Control;
});