var app =
    {
        requests: [],
        // Prod
        SCHEMA_ID: 91,
        SERVER_URL: "http://me.yiqi.com.ar/", 
        // Desa
        //SCHEMA_ID: 41,
        //SERVER_URL: "http://localhost:5001/", 
        username: "",
        password: "", // Mejor un token

        ENTITY_PEDIDO_ID: 9,
        ENTITY_PEDIDO_USA_ID: 21,
        newGuideNumber: 0,
        newGuideId: 0,

        init: function () {
            app.loadStaticData();
            app.showLogin();
        },

        showLogin: function () {
            $("#divLogin").show();
            $("#divLinksHeaders").hide();
            $("#divMain").hide();
            $("#divSentConfirmation").hide();
            $("#divHistory").hide();
            $("#divErrorLogin").hide();
            $("#loginUsername").val("");
            $("#loginPassword").val("");
            $("#loginUsername").focus();
            $("#divTally").hide();
        },

        showMain: function () {
            $("#divLogin").hide();
            $("#divMain").show();
            $("#divLinksHeaders").show();
            $("#divTally").hide();
        },

        showTally: function () {
            $("#divMain").hide();
            $("#divTally").show();
        },

        loadStaticData: function () {/*
            $.each(paises, function () {
                $("[name=PEDI_COUNTRY_CODE]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
                $("[name=PEDI_MANUFACTURER_COUNTRY]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
                $("[name=PEDU_COUNTRY]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
                $("[name=PEDU_CONSIGNEE_COUNTRY]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
            });*/
        },

        login: function () {
           // app.showMain();
            $("#butLogin").hide();
            $("#divErrorLogin").hide();
            $("#loadingLogin").show();
            
            $.ajax({url: app.SERVER_URL + "Token",
                         data: {userName: $("#loginUsername").val(),
                                password: $("#loginPassword").val(),
                                grant_type: "password"
                               },
                type: "POST",
                }).done(function (data) {
                    // TODO: Mejor un token
                    app.username = $("#loginUsername").val();
                    app.password = $("#loginPassword").val();
                    $("#butLogin").show();
                    $("#loadingLogin").hide();
                    if (data) {
                        app.showMain();
                    } else {
                        $("#divErrorLogin").show();
                        $("#divErrorLogin").text("Usuario o contraseña inválidos");
                    }
                })
                .fail(function (jqXHR, textStatus) {
                            $("#butLogin").show();
                            $("#loadingLogin").hide();
                            $("#divErrorLogin").show();
                            $("#divErrorLogin").text("No es posible establecer la conexión");
                });
        },

        logout: function () {
            app.username = "";
            app.password = "";
            app.showLogin();
        },

        import: function () {
            var fileElem = document.getElementById("fileElem");
            fileElem.click();
        },

        handleFiles: function (files) {
            $("#divErrorImportMasive").hide();
            var file = files[0];
            var data = new FormData();
            data.append('file-0', file);
            data.append("schemaId", app.SCHEMA_ID);
            data.append("payload", JSON.stringify({ entityId: (app.isUSA() ? app.ENTITY_PEDIDO_USA_ID : app.ENTITY_PEDIDO_ID), username: app.username, password: app.password }));
            $(".sendingGuide").show();
            app.callRPC({
                url: "/api/instancesapi/UploadAndImportExcel",
                contentType: false, //"application/octet-stream", //file.type,
                serializeData: false,
                data: data,
                post: true,
                callback: function (data) {
                    $(".sendingGuide").hide();
                    var arr = data.split("|");
                    if (arr[0] == "OK") {
                        app.newGuideId = null;//c.newId;						
                        app.showSentConfirmation();
                    } else {
                        var error = arr[1].split("-   at")[0];
                        $("#divErrorImportMasive").show();
                        $("#divErrorImportMasive").html(error.replace(/\n/g, "<br>"));
                    }
                },
                errorCallback: function (error) {
                    $(".sendingGuide").hide();
                    error = error.split("-   at")[0];
                    $("#divErrorImportMasive").show();
                    //				$("#mainError").html(c.error.replace(/\n/g, "<br>"));
                    $("#divErrorImportMasive").html(error.replace(/\n/g, "<br>"));
                }
            })
        },

        callRPC: function (p) {
            var type;

            if (p.post == null) { p.post = false; }
            if (p.post) {
                type = "POST";
            } else {
                type = "GET";
            }

            $.ajax({url: app.SERVER_URL + p.url,
                data: (p.post ? JSON.stringify(p.data) : p.data),
                type: type,
                dataType: 'json'
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
        },

        capturePhoto: function (i) {
            try {
                navigator.camera.getPicture(function () { $(i).addClass("btn-success"); }, function () { alert("error"); });
            }
            catch (ex)
            { alert(ex); }
        }
    }

$(function () { app.init(); });