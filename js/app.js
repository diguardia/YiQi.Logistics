var app =
    {
        requests: [],
        // Prod
        SCHEMA_ID: 91,
        SERVER_URL: "http://me.yiqi.com.ar/", 
        // Desa
        //SCHEMA_ID: 41,
        //SERVER_URL: "http://localhost:5001/", 
        ENTITY_TALLY_ID: 861,

        init: function () {
            app.loadStaticData();
            app.showLogin();
            libs.enableDebug();
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
            
            app.images = {};
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
                    libs.setToken(data.access_token);
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
                            $("#divErrorLogin").text("No es posible establecer la conexión " + textStatus);
                });
        },

        logout: function () {
            app.username = "";
            app.password = "";
            app.showLogin();
        },

        submitTally: function () {
            app.callRPC({url: "/instances"})    
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

            $.ajax({url: app.SERVER_URL + p.url,
                    data: (p.post && p.processData == null ? JSON.stringify(p.data) : p.data),
                    type: type,
                    dataType: 'json',
                    headers: headers,
                    processData: p.processData == null? true : p.processData,
                    contentType: p.contentType == null? "application/json; charset=utf-8": p.contentType
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

        capturePhoto: function (imgBut) {
            try {
                navigator.camera.getPicture(
                    function (image) {
                        app.images[imgBut.id] = image;  
                        $(imgBut).addClass("btn-success"); }, 
                    function () { alert("error"); }
                );
            }
            catch (ex)
            { alert(ex); }
        }
    }

$(function () { app.init(); });

function handleFiles(files) {
    
    		var file = files[0];
		var data = new FormData();
		data.append('file-0', file);
		data.append("schemaId", app.SCHEMA_ID);	
		data.append("payload", JSON.stringify ({entityId: app.ENTITY_TALLY_ID }) );

    app.callRPC({
			url: "/api/instancesapi/SaveFile",
			contentType: false, 
			processData: false,
			data: data,
			post: true,
			callback: function (data) {
				$(".sendingGuide").hide();	
				var arr = data.split("|");
				if (arr[0] == "OK") {
					app.newGuideId = null;//c.newId;						
					app.showSentConfirmation();
				} else {
					var error = arr[1].split ("-   at")[0];
					$("#divErrorImportMasive").show();
					$("#divErrorImportMasive").html(error.replace(/\n/g, "<br>"));
				}	
			},
			errorCallback: function (error) {
				$(".sendingGuide").hide();	
				error = error.split ("-   at")[0];
				$("#divErrorImportMasive").show();
//				$("#mainError").html(c.error.replace(/\n/g, "<br>"));
				$("#divErrorImportMasive").html(error.replace(/\n/g, "<br>"));
			}
		})
}