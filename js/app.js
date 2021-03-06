var app =
{
    // Prod
    SCHEMA_ID: 35, // SPF
    SERVER_URL: "https://me.yiqi.com.ar/",
    ENTITY_TALLY_ID: 861,
    ID_CLIENTE: 5160,
    CADP_ID_CLIENTE: 5615,
    ID_TIPO_UNIDAD: 5162,
    ENTITY_PROCESS_ID: 900,

    // Desa
    //SCHEMA_ID: 2,
    //SERVER_URL: "http://localhost:5001/", 
    //ENTITY_TALLY_ID: 64,

    FILE_COUNT: 27,
    CADP_FILE_COUNT: 18,
    formStart: null, // Hora que empieza la carga del formulario
    currentTallyId: null, // id del tally utilizado para las subidas parciales
    currentProcessId: null,//id de proceso utilizado para las subidas parciales

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
        $("#divProcess").hide();
    },

    showMain: function (msg) {
        if (!app.isStaticDataLoaded) {
            app.loadStaticData(function () { $("#divMain").show(); });
        } else {
            $("#divMain").show();
        }
        $("#divLogin").hide();
        $("#divLinksHeaders").show();
        $("#divTally").hide();
        $("#divProcess").hide();
        var date = new Date();
        $("#tFechaRecepcion").val(date.toISOString().split('T')[0]);

        if (msg) {
            $("#mainMsg").show();
            $("#mainMsg").text(msg);
        } else {
            $("#mainMsg").hide();
        }
        $("#labelTime").text(app.formatTime(new Date()));
        try { cordova.getAppVersion.getVersionNumber(function (version) { $("#labelVersion").text = version; }); } catch (x) { $("#labelVersion").text = x; }

        app.images = {};
    },

    showTally: function (mode) {
        $("#cabecera").text("Tally " + mode);
        $("#divMain").hide();
        $("#divTally").show();
        $("#tallyError").hide();
        $("#divTallyImages").hide();
        $("#butUploadTallyHeader").show();
        app.formStart = new Date();
        app.tallyMode = mode;

    },

    showProcess: function () {
        $("#divMain").hide();
        $("#divTally").hide();
        $("#divProcess").show();
        $("#processError").hide();
        $("#divProcessImages").hide();
        $("#butUploadProcessHeader").show();
        app.formStart = new Date();

    },
    showHideNroContenedor: function () {
        if ($("#tTipoDeVehiculo").val().indexOf("Contenedor") == 0) {
            $("#tNroContenedor").show();
            $("#tNroContenedor")[0].required = true;
        } else {
            $("#tNroContenedor").hide();
            $("#tNroContenedor")[0].required = false;
        }
    },

    checkToken: function (ok, noOk) {
        var token = libs.getToken();
        if (!token) { noOk(); }// No tenía token
        else { libs.callRPC({ url: "/api/accountapi/nop", callback: ok, errorCallback: noOk }); }
    },

    loadStaticData: function (callback) {
        $("#divSincronizing").show();
        for (i = 1; i <= app.FILE_COUNT; i++) {
            $("#TALL_FILE_" + i).addClass("btn");
            $("#TALL_FILE_" + i).addClass("btn-default");
            $("#TALL_FILE_" + i).removeClass("btn-danger");
            $("#TALL_FILE_" + i).removeClass("btn-success");
            $("#TALL_FILE_" + i).removeClass("btn-info");
            $("#TALL_FILE_" + i + "_P").hide();
            $("#TALL_FILE_" + i + "_P")[0].value = 0;
        }
        for (i = 1; i <= app.CADP_FILE_COUNT; i++) {
            $("#CADP_FILE_" + i).addClass("btn");
            $("#CADP_FILE_" + i).addClass("btn-default");
            $("#CADP_FILE_" + i).removeClass("btn-danger");
            $("#CADP_FILE_" + i).removeClass("btn-success");
            $("#CADP_FILE_" + i).removeClass("btn-info");
            $("#CADP_FILE_" + i + "_P").hide();
            $("#CADP_FILE_" + i + "_P")[0].value = 0;
        }
        libs.callRPC(
            {
                url: "/api/entitiesApi/GetRootDropdowns",
                data: { id: app.ENTITY_TALLY_ID, schemaId: app.SCHEMA_ID },
                callback: function (data) {
                    try {
                        $("#tCliente").append("<option style='display:none'>");
                        $.each(data[app.ID_CLIENTE], function () {
                            $("#tCliente").append("<option value='" + this.value + "'>" + this.text + "</option>");
                        });

                        $.each(data[app.ID_TIPO_UNIDAD], function () {
                            $("#tTipoDeUnidad").append("<option value='" + this.value + "'>" + this.text + "</option>");
                        });

                        libs.callRPC(
                            {
                                url: "/api/entitiesApi/GetRootDropdowns",
                                data: { id: app.ENTITY_PROCESS_ID, schemaId: app.SCHEMA_ID },
                                callback: function (data2) {
                                    try {
                                        if(data2.length != undefined || data2[app.CADP_ID_CLIENTE]!= undefined){
                                            $.each(data2[app.CADP_ID_CLIENTE], function () {
                                                $("#pCliente").append("<option value='" + this.value + "'>" + this.text + "</option>");
                                            });
                                        }

                                        $("#divSincronizing").hide();
                                        callback();

                                    }
                                    catch (ex) {
                                        alert("Error al cargar los datos sincronizados " + ex);
                                    }
                                },
                                errorCallback: function (error) {
                                    alert("Error al buscar datos sincronizados " + error);
                                }
                            });

                    }
                    catch (ex) {
                        alert("Error al cargar los datos sincronizados " + ex);
                    }
                },
                errorCallback: function (error) {
                    alert("Error al buscar datos sincronizados " + error);
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

    uploadTallyHeader: function () {
        app.currentTallyId = null;
        app.requiredHeaderImput(true);
        var upload = app.validateHeader();
        if (upload) {
            app.uploadTally(function (c) {
                $("#divTallyImages").show();
                $("#tallyError").hide();
                $("#butUploadTallyHeader").hide();
            })
        } else {
            $("#tallyError").show();
        }
    },

    validateHeader: function () {

        if ($("#tChofer").val() == "" || $("#tChofer").val == null) {
            $("#tallyError").text("Por favor completar Chofer");
        } else if ($("#tCliente").val() == "" || $("#tCliente").val == null) {
            $("#tallyError").text("Por favor completar Cliente");
        } else if ($("#tPuerto").val() == "" || $("#tPuerto").val == null) {
            $("#tallyError").text("Por favor completar Origen");
        } else if ($("#tRto").val() == "" || $("#tRto").val == null) {
            $("#tallyError").text("Por favor completar Nro de Remito");
        } else if ($("#tPrecintos").val() == "" || $("#tPrecintos").val == null) {
            $("#tallyError").text("Por favor completar Nro de Precinto");
        } else if ($("#tTipoDeVehiculo").val() == "" || $("#tTipoDeVehiculo").val == null) {
            $("#tallyError").text("Por favor completar Tipo de unidad");
        } else if ($("#tBultosSegunRTOPL").val() == "" || $("#tBultosSegunRTOPL").val == null) {
            $("#tallyError").text("Por favor completar Bultos Según Rto/Packing list");
        } else if ($("#tPatentes").val() == "" || $("#tPatentes").val == null) {
            $("#tallyError").text("Por favor completar Patente Tractor");
        }  else if ($("#tPatenteSemi").val() == "" || $("#tPatenteSemi").val == null) {
            $("#tallyError").text("Por favor completar Patente Semi");
        }
        else if ($("#tTipoDeVehiculo").val().indexOf("Contenedor") == 0 && ($("#tNroContenedor").val() == "" || $("#tNroContenedor").val == null))
        {
            $("#tallyError").text("Por favor completar Nro Contenedor");
            
        }
        else {
            return true;
        }
        return false;
    },

    requiredHeaderImput: function (b) {
        $("#tChofer")[0].required = b;
        $("#tCliente")[0].required = b;
        $("#tPuerto")[0].required = b;
        $("#tRto")[0].required = b;
        $("#tPrecintos")[0].required = b;
        $("#tTipoDeVehiculo")[0].required = b;
        $("#tBultosSegunRTOPL")[0].required = b;
        $("#tPatentes")[0].required = b;
        $("#tPatenteSemi")[0].required = b;
    },

    requiredImageImput: function (b) {
        $("#tBultosConObservaciones")[0].required = b;
        $("#tPallets")[0].required = b;
        $("#tBultosReales")[0].required = b;
    },

    uploadProcessHeader: function () {
        app.currentProcessId = null;
        app.uploadProcess(function (c) {
            $("#divProcessImages").show();
            $("#butUploadProcessHeader").hide();
        })
    },

    logout: function () {
        app.username = "";
        app.password = "";
        app.showLogin();
    },

    validateImages: function () {
        if ($("#tBultosReales").val() == "" || $("#tBultosReales").val == null) {
            $("#tallyError").text("Por favor completar Bultos reales");
        } else if ($("#tBultosConObservaciones").val() == "" || $("#tBultosConObservaciones").val == null) {
            $("#tallyError").text("Por favor completar Bultos con observaciones");
        } else if ($("#tPallets").val() == "" || $("#tPallets").val == null) {
            $("#tallyError").text("Por favor completar Pallets logrados");
        } else {
            return true;
        }
        return false;
    },

    submitTally: function () {
        $("#uploading").hide();
        if ($("#TALL_FILE_1").hasClass("btn-success") && $("#TALL_FILE_2").hasClass("btn-success") && $("#TALL_FILE_3").hasClass("btn-success") && $("#TALL_FILE_4").hasClass("btn-success") && $("#TALL_FILE_5").hasClass("btn-success") && $("#TALL_FILE_6").hasClass("btn-success") && $("#TALL_FILE_7").hasClass("btn-success")) {
            requiredImageImput(true);
            var upload = app.validateImages();
            if (upload) {

                app.uploadTally(function () {
                    app.showMain("Tally subido con éxito");
                    requiredHeaderImput(false);
                    $("#tChofer").removeAttr('value');
                    $("#tCliente").removeAttr('value');
                    $("#tPuerto").removeAttr('value');
                    var date = new Date();
                    $("#tFechaRecepcion").val(date.toISOString().split('T')[0]);
                    $("#tRto").removeAttr('value');
                    $("#tPrecintos").removeAttr('value');
                    $("#tTipoDeVehiculo").removeAttr('value');
                    $("#tNroContenedor").removeAttr('value');
                    $("#tNroContenedor")[0].required = false;
                    $("#tBultosSegunRTOPL").removeAttr('value');
                    $("#tBultosReales").removeAttr('value');
                    $("#tBultosConObservaciones").removeAttr('value');
                    $("#tPatentes").removeAttr('value');
                    $("#tPatenteSemi").removeAttr('value');
                    for (i = 1; i <= app.FILE_COUNT; i++) {
                        $("#TALL_FILE_" + i).addClass("btn-default");
                        $("#TALL_FILE_" + i).removeClass("btn-success");
                        $("#TALL_FILE_" + i).removeClass("btn-info");
                        $("#TALL_FILE_" + i).removeClass("btn-warning");
                        $("#TALL_FILE_" + i + "_P").hide();
                        $("#TALL_FILE_" + i + "_P")[0].value = 0;
                    }
                    $("#TALL_FILE_8Obs").val("");
                    $("#TALL_FILE_9Obs").val("");
                    $("#TALL_FILE_10Obs").val("");
                    $("#TALL_FILE_11Obs").val("");
                    $("#TALL_FILE_12Obs").val("");
                    $("#tPallets").removeAttr('value');
                    requiredImageImput(false);
                    $("#uploading").show();
                    $("#loadinguUpload").hide();
                    app.showHideNroContenedor();
                    $("#tallyError").text("");
                }
                );
            } else {
                $("#tallyError").show();
            }
        } else {
            $("#tallyError").text("Las imágenes: Camión Cerrado, Precinto, Al 100%,  Al  80%, Al 50%, Vacio y Remito son obligatorios");
            $("#tallyError").show();
            $("#uploading").show();
            $("#loadinguUpload").hide();
        }
    },

    submitProcess: function () {
        $("#uploadingProcess").hide();
        if ($("#CADP_FILE_1").hasClass("btn-success") && $("#CADP_FILE_2").hasClass("btn-success")) {
            app.uploadProcess(function () {
                app.showMain("Proceso subido con éxito");
                $("#pCliente").val("");
                $("#pTanda").val("");
                $("#pCarpeta").val("");
                $("#Estampilla")[0].checked = false;
                $("#Etiqueta")[0].checked = false;
                $("#Alarmado")[0].checked = false;
                $("#Plastiflecha")[0].checked = false;
                for (i = 1; i <= app.CADP_FILE_COUNT; i++) {
                    $("#CADP_FILE_" + i).addClass("btn-default");
                    $("#CADP_FILE_" + i).removeClass("btn-success");
                    $("#CADP_FILE_" + i).removeClass("btn-info");
                    $("#CADP_FILE_" + i).removeClass("btn-warning");
                    $("#CADP_FILE_" + i + "_P").hide();
                    $("#CADP_FILE_" + i + "_P")[0].value = 0;
                }
                for (i = 4; i <= app.CADP_FILE_COUNT; i++) {
                    $("#CADP_FILE_" + i + "Obs").val("");
                }


                $("#uploadingProcess").show();
                $("#loadinguUploadProcess").hide();
                app.showHideNroContenedor();
            }
            );
        } else {
            $("#processError").text("Las imágenes: Muesta y Control de Precios son obligatorias");
            $("#processError").show();
            $("#uploadingProcess").show();
            $("#loadinguUploadProcess").hide();
        }
    },

    uploadTally: function (callback) {
        $("#tallyError").hide();
        $("#loadinguUpload").show();

        var tally = {
            TALL_CHOFER: $("#tChofer").val(),
            CLIE_ID_CLIE: $("#tCliente").val(),
            TALL_PUERTO: $("#tPuerto").val(),
            TALL_FECHA_DE_RECEPCION: $("#tFechaRecepcion").val(),
            TALL_NRO_DE_REMITO: $("#tRto").val(),
            TALL_PRECINTOS: $("#tPrecintos").val(),
            TALL_TIPO_DE_VEHICULO: $("#tTipoDeVehiculo").val(),
            TALL_BULTOS_SEGUN_RTO: $("#tBultosSegunRTOPL").val(),
            TALL_PATENTES: $("#tPatentes").val(),
            TALL_PATENTE_SEMI: $("#tPatenteSemi").val(),
            TALL_OBSERVACION_1: $("#TALL_FILE_8Obs").val(),
            TALL_OBSERVACION_2: $("#TALL_FILE_9Obs").val(),
            TALL_OBSERVACION_3: $("#TALL_FILE_10Obs").val(),
            TALL_OBSERVACION_4: $("#TALL_FILE_11Obs").val(),
            TALL_OBSERVACION_5: $("#TALL_FILE_12Obs").val(),
            TALL_OBSERVACION_6: $("#TALL_FILE_13Obs").val(),
            TALL_OBSERVACION_7: $("#TALL_FILE_14Obs").val(),
            TALL_OBSERVACION_8: $("#TALL_FILE_15Obs").val(),
            TALL_OBSERVACION_9: $("#TALL_FILE_16Obs").val(),
            TALL_OBSERVACION_10: $("#TALL_FILE_17Obs").val(),
            TALL_OBSERVACION_11: $("#TALL_FILE_18Obs").val(),
            TALL_OBSERVACION_12: $("#TALL_FILE_19Obs").val(),
            TALL_OBSERVACION_13: $("#TALL_FILE_20Obs").val(),
            TALL_OBSERVACION_14: $("#TALL_FILE_21Obs").val(),
            TALL_OBSERVACION_15: $("#TALL_FILE_22Obs").val(),
            TALL_OBSERVACION_16: $("#TALL_FILE_23Obs").val(),
            TALL_OBSERVACION_17: $("#TALL_FILE_24Obs").val(),
            TALL_OBSERVACION_18: $("#TALL_FILE_25Obs").val(),
            TALL_OBSERVACION_19: $("#TALL_FILE_26Obs").val(),
            TALL_OBSERVACION_20: $("#TALL_FILE_27Obs").val(),
            TALL_INICIO_DE_DESCARGA: app.formatTime(app.formStart),
            TALL_FINALIZACION_DE_DESC: app.formatTime(new Date()),
            TALL_MODE: app.tallyMode
        };
        if ($("#tNroContenedor").val() != "" && $("#tNroContenedor").val() != null) {
            tally.TALL_NRO_CONTENEDOR = $("#tNroContenedor").val();
        }
        if ($("#tBultosReales").val() != "" && $("#tBultosReales").val() != null) {
            tally.TALL_BULTOS_REALES = $("#tBultosReales").val();
        }
        if ($("#tBultosConObservaciones").val() != "" && $("#tBultosConObservaciones").val() != null) {
            tally.TALL_BULTOS_CON_OBSERVACI= $("#tBultosConObservaciones").val();
        }
        if ($("#tPallets").val() != "" && $("#tPallets").val() != null) {
            tally.TALL_PALLETS= $("#tPallets").val();
        }


        if (app.currentTallyId) { tally.id = app.currentTallyId; }
        libs.callRPC(
            {
                url: "api/instancesapi/SaveInstanceFull"
                , data: {
                    schemaId: app.SCHEMA_ID
                    , entityName: "TALLY"
                    , json: JSON.stringify(tally)
                    , jsonNewFiles: JSON.stringify(app.images)
                    , jsonRemovedFiles: JSON.stringify([])
                    , async: false
                }
                , callback: function (c) {
                    $("#uploading").show();
                    $("#loadinguUpload").hide();
                    if (c.ok) {
                        app.currentTallyId = c.newId;
                        callback();
                    }
                    else {
                        $("#tallyError").html(c.error.replace(/\n/g, "<br>"));
                        $("#tallyError").show();
                    }
                }
                , errorCallback: function (e) {
                    $("#tallyError").text("Error al subir el tally " + e);
                    $("#tallyError").show();
                    $("#uploading").show();
                    $("#loadinguUpload").hide();
                }
            });
    },

    uploadProcess: function (callback) {
        $("#processError").hide();
        $("#loadinguUploadProcess").show();
        var process = {

            CLIE_ID_CLIE: $("#pCliente").val(),
            CADP_TANDA: $("#pTanda").val(),
            CADP_CARPETA: $("#pCarpeta").val(),
            CADP_ESTAMPILLA: $("#Estampilla")[0].checked,
            CADP_ETIQUETA: $("#Etiqueta")[0].checked,
            CADP_ALARMADO: $("#Alarmado")[0].checked,
            CADP_PLASTIFLECHA: $("#Plastiflecha").val(),
            CADP_OBSERVACION_14: $("#CADP_FILE_4Obs").val(),
            CADP_OBSERVACION_15: $("#CADP_FILE_5Obs").val(),
            CADP_OBSERVACION_1: $("#CADP_FILE_6Obs").val(),
            CADP_OBSERVACION_2: $("#CADP_FILE_7Obs").val(),
            CADP_OBSERVACION_3: $("#CADP_FILE_8Obs").val(),
            CADP_OBSERVACION_4: $("#CADP_FILE_9Obs").val(),
            CADP_OBSERVACION_5: $("#CADP_FILE_10Obs").val(),
            CADP_OBSERVACION_6: $("#CADP_FILE_11Obs").val(),
            CADP_OBSERVACION_7: $("#CADP_FILE_12Obs").val(),
            CADP_OBSERVACION_8: $("#CADP_FILE_13Obs").val(),
            CADP_OBSERVACION_9: $("#CADP_FILE_14Obs").val(),
            CADP_OBSERVACION_10: $("#CADP_FILE_15Obs").val(),
            CADP_OBSERVACION_11: $("#CADP_FILE_16Obs").val(),
            CADP_OBSERVACION_12: $("#CADP_FILE_17Obs").val(),
            CADP_OBSERVACION_13: $("#CADP_FILE_18Obs").val()


        };

        if (app.currentProcessId) { process.id = app.currentProcessId; }
        libs.callRPC(
            {
                url: "api/instancesapi/SaveInstanceFull"
                , data: {
                    schemaId: app.SCHEMA_ID
                    , entityName: "CARPETA_DE_PROCESO"
                    , json: JSON.stringify(process)
                    , jsonNewFiles: JSON.stringify(app.images)
                    , jsonRemovedFiles: JSON.stringify([])
                    , async: false
                }
                , callback: function (c) {
                    $("#uploadingProcess").show();
                    $("#loadinguUploadProcess").hide();
                    if (c.ok) {
                        app.currentProcessId = c.newId;
                        callback();
                    }
                    else {
                        $("#processError").html(c.error.replace(/\n/g, "<br>"));
                        $("#processError").show();
                    }
                }
                , errorCallback: function (e) {
                    $("#processError").text("Error al subir el proceso " + e);
                    $("#processError").show();
                    $("#uploadingProcess").show();
                    $("#loadinguUploadProcess").hide();
                }
            });
    },

    capturePhoto: function (imgBut, ToP) {
        $(imgBut).removeClass("btn-info");
        $(imgBut).addClass("btn-warning");

        try {
            navigator.camera.getPicture(
                function (fileURI) {
                    app.saveFile(fileURI, function (filePath) { app.uploadFilePG(filePath, imgBut, ToP); });
                }
                , function () { alert("error"); }
                , { destinationType: window.Camera.DestinationType.FILE_URI }
            );
        }
        catch (ex) { alert(ex); }
    },

    formatTime: function (d) {
        var m = d.getMinutes();
        if (m < 10) { m = "0" + m; }
        return d.getHours() + ":" + d.getMinutes();
    },

    saveFile: function (fileURI, callback) {
        window.resolveLocalFileSystemURI(fileURI, function (fileEntry) { app.saveFileEntry(fileEntry, callback); },
            function (x) { alert("Error al recuperar el fileEntry " + x); });
    },

    saveFileEntry: function (fileEntry, callback) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
            fileSystem.root.getDirectory("YiQi", { create: true },
                function (dataDir) {
                    var d = new Date(); var n = d.getTime(); var newFileName = n + ".jpg";
                    fileEntry.moveTo(dataDir, newFileName,
                        function () { callback(dataDir.toURL() + newFileName); },
                        function (e) { alert("Error al guardar la imagen en la galeria " + e); });
                },
                function (e) { alert("Error al recuperar la carpeta de guardado " + e); });
        }, function (e) { alert(e); });
    },
    /*
            // Método que puede servir para probarlo en el escritorio
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
                        $(imgBut).removeClass("btn-warning");
                        $(imgBut).addClass("btn-success");
                        app.uploadTally(function () {
                            delete app.images[imgBut.id];
                        });
                    },
                    errorCallback: function (error) {
                        $(imgBut).removeClass("btn-warning");
                        $(imgBut).addClass("btn-alert");
                    }
                });
            },
    */
    uploadFilePG: function (imageURI, imgBut, top) {
        $(imgBut).removeClass("btn-info");
        $(imgBut).addClass("btn-warning");
        $(imgBut).removeClass("btn-default");
        $(imgBut).removeClass("btn-success");
        $(imgBut).removeClass("btn-danger");
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
        $("#" + imgBut.id + "_P").show();
        $("#" + imgBut.id + "_P")[0].value = 0;
        ft.onprogress = function (e) { $("#" + imgBut.id + "_P")[0].value = (e.loaded / e.total) * 100.0; }

        ft.upload(imageURI, encodeURI(app.SERVER_URL + "api/instancesApi/SaveFile"),
            function (result) {
                $("#" + imgBut.id + "_P").hide();
                app.images[imgBut.id] = fileName;
                $(imgBut).removeClass("btn-warning");
                $(imgBut).addClass("btn-info");
                if (top == "T") {
                    app.uploadTally(function () {
                        $(imgBut).addClass("btn-success");
                        $(imgBut).removeClass("btn-info");
                        delete app.images[imgBut.id];
                    });
                } else if (top == "P") {
                    app.uploadProcess(function () {
                        $(imgBut).addClass("btn-success");
                        $(imgBut).removeClass("btn-info");
                        delete app.images[imgBut.id];
                    });
                }
            },
            function (error) {
                $("#" + imgBut.id + "_P").hide();
                $(imgBut).addClass("btn-danger");
                $(imgBut).removeClass("btn-warning");
                $(imgBut).removeClass("btn-info");
                setTimeout(function () { app.uploadFilePG(imageURI, imgBut, top); }, 1000 * 15);
                console.log(error);
                //                alert("Error al subir el archivo. Se reintentará en un minuto");
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