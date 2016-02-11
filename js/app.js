var app=
    {
        // Prod
        SCHEMA_ID: 35, // SPF
        SERVER_URL: "http://me.yiqi.com.ar/", 
        ENTITY_TALLY_ID: 861,

        // Desa
        //SCHEMA_ID: 2,
        //SERVER_URL: "http://localhost:5001/", 
        //ENTITY_TALLY_ID: 64,

        init: function () {
            app.loadStaticData();
            if (app.checkToken(function () { app.showMain() }, function () { app.showLogin() }));
        },

        showLogin:function () {
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

        showMain: function (msg) {
            $("#divLogin").hide();
            $("#divMain").show();
            $("#divLinksHeaders").show();
            $("#divTally").hide();

            if (msg) {
                $("#mainMsg").show();
                $("#mainMsg").text(msg);
            } else {
                $("#mainMsg").hide();
            }
            app.images = {};
        },

        showTally: function () {
            $("#divMain").hide();
            $("#divTally").show();
            $("#tallyError").hide();
        },

        checkToken: function (ok, noOk) {
            var token = libs.getToken();
            if (!token) { noOk(); }// No tenía token
            else { libs.callRPC({ url: "/api/accountapi/nop", callback: ok, errorCallback: noOk }); }
        },

        loadStaticData:function () {
//            $.each(paises, function () {
//                $("[name=PEDI_COUNTRY_CODE]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
//               $("[name=PEDI_MANUFACTURER_COUNTRY]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
//                $("[name=PEDU_COUNTRY]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
//                $("[name=PEDU_CONSIGNEE_COUNTRY]").append("<option value='" + this.Code + "'>" + this.Name + "</option>");
//            });
        },

        login: function () {
            // app.showMain();
            $("#butLogin").hide();
            $("#divErrorLogin").hide();
            $("#loadingLogin").show();

            $.ajax({
                url: app.SERVER_URL + "token",
                data: {
                    userName: $("#loginUsername").val(),
                    password: $("#loginPassword").val(),
                    grant_type: "password"
                },
                type: "POST",
            }).done(function (data) {
                libs.setToken(data.access_token);
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
                    $("#divErrorLogin").text("No es posible establecer la conexión " + textStatus);
                });
        },

        logout: function () {
            app.username = "";
            app.password = "";
            app.showLogin();
        },

        submitTally: function () {
            $("#tallyError").hide();
            libs.callRPC(
                {
                    url: "api/instancesapi/SaveInstanceFull"
                    , data: {
                        schemaId: app.SCHEMA_ID
                        , entityName: "TALLY"
                        , json: JSON.stringify({
                            TALL_CHOFER: $("#tChofer").val(),
                            TALL_CLIE_ID_CLIE: $("#tCliente").val(),
                            TALL_PUERTO: $("#tPuerto").val(),
                            TALL_FECHA_DE_RECEPCION: $("#tFechaRecepcion").val(),
                            TALL_NRO_DE_REMITO: $("#tRto").val(),
                            TALL_PRECINTOS: $("#tPrecintos").val(),
                            //TALL_TIUN_ID_TIUN: $("#tTipoDeUnidad").val(),
                            TALL_NRO_CONTENEDOR: $("#tNroContenedor").val(),
                            TALL_CANT_BULTOS_SEGUN_RE: $("#tBultosSegunRTOPL").val(), // esto es una formula, hay que agregar un atributo nuevo?
                            TALL_PATENTES: $("#tPatentes").val(),
                            //TALL_PALLETS: $("#tPallets").val()//esto tambien es una formula
                        })                        
                         , jsonNewFiles: JSON.stringify(app.images)
                        , jsonRemovedFiles: JSON.stringify([])
                    }
                    , callback:function (c) { 
                        if (c.ok) {
                            app.showMain("Tally subido con éxito"); 
                        } else {
                            $("#tallyError").text(c.error);
                            $("#tallyError").show();
                        }
                    }
                    , errorCallback: function (e) {
                        $("#tallyError").text("Error al subir el tally " + e);
                        $("#tallyError").show();
                    }
                });
        },

        capturePhoto: function (imgBut) {
            try {
                navigator.camera.getPicture(
                    function (fileURI) {
                        window.resolveLocalFileSystemURI(fileURI,
                            function (fileEntry) {
                                app.uploadFile(fileEntry.file(), imgBut);

                            },
                            function (e) { alert("Error subiendo la foto " + e); });

                    }
                    , function () { alert("error"); }
                    , { destinationType: window.Camera.DestinationType.FILE_URI }
                    );
            }
            catch (ex) { alert(ex); }
        },

        uploadFile: function (file, imgBut) {
            var data = new FormData();
            data.append('file-0', file);
            data.append("schemaId", app.SCHEMA_ID);
            data.append("payload", JSON.stringify({ entityId: app.ENTITY_TALLY_ID }));

            libs.callRPC({
                url: "/api/instancesapi/SaveFile",
                contentType: false,
                processData: false,
                data: data,
                post: true,
                callback: function (data) {
                    app.images[imgBut.id] = file.name;
                    $(imgBut).addClass("btn-success");
                },
                errorCallback: function (error) {
                    $(imgBut).addClass("btn-alert");
                }
            });
        }
    }

$( function () {app.init(); });

function handleFiles(files) {
    var file = files[0];
    app.uploadFile(file, $("#TALL_FOTO_1")[0]);
}