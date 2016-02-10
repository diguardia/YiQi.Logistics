var libs = {
    getToken: function() {
        return window.localStorage["token"];
    },
    
    setToken: function (token) {
        return window.localStorage["token"] = token;
    },
    
            callRPC: function (p) {
            var type;

            if (p.post == null) { p.post = false; }
            if (p.post) {
                type = "POST";
            } else {
                type = "GET";
            }
            var token = libs.getToken();
            var headers = {};
            if (token) {
                headers.Authorization = 'Bearer ' + token;
            }

            $.ajax({
                url: app.SERVER_URL + p.url,
                data: (p.post && p.processData == null ? JSON.stringify(p.data) : p.data),
                type: type,
                dataType: 'json',
                headers: headers,
                processData: p.processData == null ? true : p.processData,
                contentType: p.contentType == null ? "application/json; charset=utf-8" : p.contentType
            }).done(function (result) {
                p.callback(result);
            })
                .fail(function (jqXHR, textStatus) {
                    console.log(jqXHR, textStatus);
                    if (p.errorCallback != null) {
                        p.errorCallback(textStatus);
                    }
                    else {
                        //                windowsManagement.manageError(jqXHR.status, p.windowId, jqXHR.responseText);
                    }
                });
        }   

}