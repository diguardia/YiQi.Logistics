var libs = {
    getToken: function() {
        return window.localStorage["token"];
    },
    
    setToken: function (token) {
        return window.localStorage["token"] = token;
    }
    

}