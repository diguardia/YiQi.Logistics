var app =
    {
        // Prod
        SCHEMA_ID: 35, // SPF
        SERVER_URL: "http://me.yiqi.com.ar/",
        ENTITY_TALLY_ID: 861,
        ID_CLIENTE: 5160,
        ID_TIPO_UNIDAD: 5162,

        // Desa
        //SCHEMA_ID: 2,
        //SERVER_URL: "http://localhost:5001/", 
        //ENTITY_TALLY_ID: 64,

        init: function () { 
            if (app.checkToken(function () { app.showMain() }, function () { app.showLogin() }));
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

        showMain: function (msg) {
            if (!app.isStaticDataLoaded) {
                app.loadStaticData(function() {$("#divMain").show();});
            } else {
                $("#divMain").show();
            }
            $("#divLogin").hide();
            $("#divLinksHeaders").show();
            $("#divTally").hide();
            var date = new Date();
            $("#tFechaRecepcion").val(date.toISOString().split('T')[0]);

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

        loadStaticData: function (callback) {
            libs.callRPC(
                {
                    url: "/api/entitiesApi/GetRootDropdowns",
                    data: { id: app.ENTITY_TALLY_ID, schemaId: app.SCHEMA_ID },
                    callback: function (data) {

                        $.each(data[app.ID_CLIENTE], function () {
                                        $("#tCliente").append("<option value='" + this.value + "'>" + this.text + "</option>");
                                    });

                        $.each(data[app.ID_TIPO_UNIDAD], function () {
                            $("#tTipoDeUnidad").append("<option value='" + this.value + "'>" + this.text + "</option>");
                        });
                        callback();
                    }
                });

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
            $("#uploading").hide();
            $("#loadinguUpload").show();
            if ($("#TALL_FILE_1").hasClass("btn-success") && $("#TALL_FILE_2").hasClass("btn-success") && $("#TALL_FILE_3").hasClass("btn-success") && $("#TALL_FILE_4").hasClass("btn-success") && $("#TALL_FILE_5").hasClass("btn-success") && $("#TALL_FILE_6").hasClass("btn-success") && $("#TALL_FILE_7").hasClass("btn-success")) {
               
                libs.callRPC(
                    {
                        url: "api/instancesapi/SaveInstanceFull"
                        , data: {
                            schemaId: app.SCHEMA_ID
                            , entityName: "TALLY"
                            , json: JSON.stringify({
                                TALL_CHOFER: $("#tChofer").val(),
                                CLIE_ID_CLIE: $("#tCliente").val(),
                                TALL_PUERTO: $("#tPuerto").val(),
                                TALL_FECHA_DE_RECEPCION: $("#tFechaRecepcion").val(),
                                TALL_NRO_DE_REMITO: $("#tRto").val(),
                                TALL_PRECINTOS: $("#tPrecintos").val(),
                                TALL_TIPO_DE_VEHICULO: $("#tTipoDeVehiculo").val(),
                                TALL_NRO_CONTENEDOR: $("#tNroContenedor").val(),
                                TALL_BULTOS_SEGUN_RTO: $("#tBultosSegunRTOPL").val(),
                                TALL_PATENTES: $("#tPatentes").val(),
                                TALL_OBSERVACION_1: $("#TALL_FILE_8Obs").val(),
                                TALL_OBSERVACION_2: $("#TALL_FILE_9Obs").val(),
                                TALL_OBSERVACION_3: $("#TALL_FILE_10Obs").val(),
                                TALL_OBSERVACION_4: $("#TALL_FILE_11Obs").val(),
                                TALL_OBSERVACION_5: $("#TALL_FILE_12Obs").val()
                                //TALL_PALLETS: $("#tPallets").val()//esto tambien es una formula
                            })
                            , jsonNewFiles: JSON.stringify(app.images)
                            , jsonRemovedFiles: JSON.stringify([])
                        }
                        , callback: function (c) {
                            if (c.ok) {
                                app.showMain("Tally subido con éxito");

                                $("#tChofer").val("");
                                $("#tCliente").val("");
                                $("#tPuerto").val("");
                                var date = new Date();
                                $("#tFechaRecepcion").val(date.toISOString().split('T')[0]);

                                $("#tRto").val("");
                                $("#tPrecintos").val("");
                                $("#tTipoDeVehiculo").val("");
                                $("#tNroContenedor").val("");
                                $("#tBultosSegunRTOPL").val("");
                                $("#tPatentes").val("");
                                $("#TALL_FILE_1").addClass("btn-default");
                                $("#TALL_FILE_1").removeClass("btn-success");
                                $("#TALL_FILE_2").addClass("btn-default");
                                $("#TALL_FILE_2").removeClass("btn-success");
                                $("#TALL_FILE_3").addClass("btn-default");
                                $("#TALL_FILE_3").removeClass("btn-success");
                                $("#TALL_FILE_4").addClass("btn-default");
                                $("#TALL_FILE_4").removeClass("btn-success");
                                $("#TALL_FILE_5").addClass("btn-default");
                                $("#TALL_FILE_5").removeClass("btn-success");
                                $("#TALL_FILE_6").addClass("btn-default");
                                $("#TALL_FILE_6").removeClass("btn-success");
                                $("#TALL_FILE_7").addClass("btn-default");
                                $("#TALL_FILE_7").removeClass("btn-success");
                                $("#TALL_FILE_8Obs").val("");
                                $("#TALL_FILE_9Obs").val("");
                                $("#TALL_FILE_10Obs").val("");
                                $("#TALL_FILE_11Obs").val("");
                                $("#TALL_FILE_12Obs").val("");
                                //$("#tPallets").val()//esto tambien es una formula
 
                            } else {

                                $("#tallyError").html(c.error.replace(/\n/g, "<br>"));
                                $("#tallyError").show();
                                $("#loadinguUpload").show();
                                $("#uploading").hide();
                            }
                        }
                        , errorCallback: function (e) {

                            $("#tallyError").text("Error al subir el tally " + e);
                            $("#tallyError").show();
                            $("#loadinguUpload").show();
                            $("#uploading").hide();
                        }
                    });

            } else {
                $("#tallyError").text("Las imágenes: Camión Cerrado, Precinto, Abierto antes de atracar,  Al  80%, Al 50%, Vacio y Remito son obligatorios");
                $("#tallyError").show();
                $("#loadinguUpload").show();
                $("#uploading").hide();
            }
        },

        capturePhoto: function (imgBut) {
            try {
                navigator.camera.getPicture(
                    function (fileURI) {
                        app.uploadFilePG(fileURI, imgBut);
                        // window.resolveLocalFileSystemURI(fileURI,
                        //function (fileEntry) {
                        //    fileEntry.file(function (f) {app.uploadFilePG(f, imgBut);}, function (e) {alert (e); } );
                        //},
                        //function (e) { alert("Error subiendo la foto " + e); });
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
        },

        uploadFilePG: function (imageURI, imgBut) {
            var fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileName;
            //options.mimeType="image/jpeg";

            var params = new Object();
            params.schemaId = app.SCHEMA_ID;

            options.params = params;
            options.chunkedMode = false;

            var token = libs.getToken();
            var headers = {};
            if (token) {
                headers.Authorization = 'Bearer ' + token;
            }
            options.headers = headers;

            var ft = new FileTransfer();
            ft.upload(imageURI, encodeURI(app.SERVER_URL + "api/instancesApi/SaveFile"),
                function (result) {
                    app.images[imgBut.id] = fileName;
                    if ($(imgBut).hasClass("btn-default")) {
                        $(imgBut).removeClass("btn-default");
                    }
                    $(imgBut).addClass("btn-success");
                },
                function (error) {
                    alert("Error al subir el archivo");
                    $(imgBut).addClass("btn-alert");
                },
                options
                );
        }
    }

$(function () { app.init(); });

function handleFiles(files) {
    var file = files[0];
    app.uploadFile(file, $("#TALL_FOTO_1")[0]);
}