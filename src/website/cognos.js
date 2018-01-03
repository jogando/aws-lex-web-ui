jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

$.loadScript("https://raw.githubusercontent.com/jogando/aws-lex-web-ui/master/src/website/cognosremote.js", function(){
    console.log("script loaded...");
});