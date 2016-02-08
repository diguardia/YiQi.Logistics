var libs = {
    getToken: function() {
        return window.localStorage["token"];
    },
    
    setToken: function (token) {
        return window.localStorage["token"] = token;
    },
    
    enableDebug: function () {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }

}