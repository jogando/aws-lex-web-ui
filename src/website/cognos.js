jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

$.loadScript("http://localhost:8000/cognosremote.js", function(){
    console.log("script loaded...");
});