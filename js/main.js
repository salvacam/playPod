$(function () {

    $("#otro-bt").on("click", function (e) {
        if ($("#otro-txt").val() == "" || $("#otro-name").val() == "") {
			customAlert("Introduce nombre y rss");
        } else {
			episodios.push({url: $("#otro-txt").val(),
				name: $("#otro-name").val()});
			localStorage.setItem("_playpod_episodios", JSON.stringify(episodios));
			actualizarProgramas();
		}
    });

    function deleteEpisodio(id) {    	
	    if (customConfirm("¿Estás seguro de que eliminar el episodio?")) {
	    	episodios.splice(id, 1);
			localStorage.setItem("_playpod_episodios", JSON.stringify(episodios));
			actualizarProgramas();		
			$('#config').scrollTop(0);
		}
    }

    function editEpisodio(id) {
    	var nombre = $('input[name="nombre"][data-id="' + id + '"]').val();
    	var url = $('input[name="url"][data-id="' + id + '"]').val();
    	if (nombre == "" || url == "") {
			customAlert("Introduce nombre y rss");
        } else {
			episodios[id].url = url;
			episodios[id].name = nombre;
			localStorage.setItem("_playpod_episodios", JSON.stringify(episodios));
			actualizarProgramas();
			$('#config').scrollTop(0);
    	}
    }

	$('#jsonFile').on('change', function(e) {
	    var archivo = e.target.files[0];
	    if (!archivo) return;

	    var lector = new FileReader();
	    lector.onload = function(e) {
	        try {
	            var datos = JSON.parse(e.target.result);

	            if (!Array.isArray(datos)) {
	                throw new Error("El JSON no es un array");
	            }

	            var valido = datos.every(item => 
	                typeof item === 'object' &&
	                item !== null &&
	                'url' in item &&
	                'name' in item
	            );

	            if (!valido) {
	                throw new Error("Cada elemento debe ser un objeto con 'url' y 'name'");
	            }
    
			    if (customConfirm("¿Estás seguro de que guardar la lista subida?")) {			     
					episodios = datos;
					localStorage.setItem("_playpod_episodios", JSON.stringify(episodios));
					actualizarProgramas();
					$('#config').scrollTop(0);
				}
	        } catch(err) {
	            customAlert("Archivo JSON inválido: " + err.message);
	        }
	    };

	    lector.readAsText(archivo);
	});

	
	$('#uploadEpisodios').on('click', function() {
   	 $('#jsonFile').click(); // simula clic en el input oculto
	});

    $("#downloadEpisodios").on("click", function (e) {
		var json = JSON.stringify(episodios, null, 2);

		var blob = new Blob([json], { type: "application/json" });

		var url = URL.createObjectURL(blob);
		var a = $('<a>')
		  .attr('href', url)
		  .attr('download', 'plapPod.json')  
		  .appendTo('body');

		a[0].click(); 
		a.remove();   
		URL.revokeObjectURL(url);
    });

	$("#play").on("click", function (x) {
		if ($('audio')[0].src != '') {
			if($('audio')[0].paused) {
				$('audio')[0].play();
				$("#play").html("Pause");
			} else {
				$('audio')[0].pause();
				$("#play").html("Play");
			}	
		}
	});
    
	$("#darkMode").on("change", function () {
		$("body").toggleClass("dark");
        localStorage.setItem("_playpod_dark", $('#darkMode').is(':checked'));
	});
    
    $('#configToggle').on('click', function() {
        $('#config').toggleClass('show');
    	$('body').toggleClass('noscroll');
    });

    function play(cadena, titleAudio, min) {
        $("#audio").attr("src", cadena);
        $("#audio").attr("autoplay", "");
		$("#audio")[0].currentTime = min;
		$("#audio")[0].title = titleAudio;
        $("#titulo").remove();
        $("#audioDiv").prepend("<span id='titulo'>" + titleAudio + "</span>");
        localStorage.setItem("_playpod_mp3", cadena);
    	$("#playLast")[0].dataset.mp3 = localStorage.getItem("_playpod_mp3");
        localStorage.setItem("_playpod_title", titleAudio);
    	$("#lastPodcast").html(localStorage.getItem("_playpod_title"));
    	localStorage.setItem("_playpod_time", min);    	
    	$("#lastTime").html(parseInt(parseInt($("#audio")[0].currentTime)/60));
    	window.scrollTo(0, 0);
    }

    function buscar(url, nombre) {
        $("#spinnerDiv").removeClass("hide");
		$("#listado").text("");
		$.ajax({
			type: 'GET',
			url: "https://salvacam.x10.mx/playPod/index.php?url=" + encodeURI(url),
			//url: "servidor/index.php?url=" + encodeURI(url),
			dataType: 'json',
			success: function(data) {
        		$("#feedsList").removeAttr("open");        		
        		$("#episodioList").prop('open', true);;
        		$("#spinnerDiv").addClass("hide");
                //console.log(data);
				$("#listado").append("<h3 class='text-center'>" + nombre + "</h3>");
				if (data.length > 0) {              
                    $(".botones").removeClass("none");
                    $(".botones").addClass("visto");
					for (var i = 0; i < data.length; i++) {
						$("#listado").append("<button class='btn btn-sm smooth pista' data-pista='" + i + "'>" + data[i].title + " " + data[i].duration + "</button><br/>");
					}
					
					$(".pista").on("click", function () {
						play(data[$(this).data("pista")].url, data[$(this).data("pista")].title,0);
					});
				} else {
					$("#listado").append("<h5>No hay audios</h5>");
				}
			},
			error: function(xhr, type) {
        		$("#spinnerDiv").addClass("hide");
				$("#listado").append("<h5>No hay audios</h5>");
			}
		});
    }

    $("#playLast")[0].dataset.mp3 = localStorage.getItem("_playpod_mp3");
    $("#lastPodcast").html(localStorage.getItem("_playpod_title"));
    $("#playLast")[0].dataset.podcast = localStorage.getItem("_playpod_title");
	$("#lastTime").html(parseInt(localStorage.getItem("_playpod_time")/60));
	$("#playLast")[0].dataset.min = localStorage.getItem("_playpod_time");
	
	var darkMode = localStorage.getItem("_playpod_dark");
	if (darkMode != null && darkMode == "true") {
		$('#darkMode').prop('checked', true);		
		$("body").toggleClass("dark");
	}
	
	function myTimer() {
		if ($("#audio")[0].duration > 0) {
			localStorage.setItem("_playpod_time", parseInt($("#audio")[0].currentTime));
    		$("#lastTime").html(parseInt(localStorage.getItem("_playpod_time")/60));
    		$("#playLast")[0].dataset.min = localStorage.getItem("_playpod_time");
		}
  	}

	$("#playLast").on("click", function (x) {
		play(x.target.dataset.mp3, x.target.dataset.podcast,x.target.dataset.min);
	});

    setInterval(myTimer, 30000);


	function actualizarAvisoConexion() {
	  const aviso = document.getElementById('offline-warning');
	  if (navigator.onLine) {
	    aviso.style.display = 'none';
		$("#container").removeClass("hide");
	  } else {
	    aviso.style.display = 'block';
	    $("#container").addClass("hide");
	  }
	}

	// Detecta cambios de conexión
	window.addEventListener('online', actualizarAvisoConexion);
	window.addEventListener('offline', actualizarAvisoConexion);

	// Ejecuta al cargar la página
	actualizarAvisoConexion();

	function actualizarProgramas() {
		$("#botonesDest").text("");
		$("#programasConfig").text("");
		for (var i = 0; i < episodios.length; i++) {
			$("#botonesDest").append(" <button class='btn btn-sm smooth dest' data-destino='" 
				+ episodios[i].url + "' data-nombre='" + episodios[i].name 
				+ "''>" + episodios[i].name + "</button> ");

			$("#programasConfig").append(" <div><input data-id='" + i + "' name='nombre' type='text' class='smooth inputConfig' value='" 
				+ episodios[i].name + "'></div><br>" 
				+ "<div><input data-id='" + i + "' name='url' type='text' class='smooth inputConfig' value='"  
				+ episodios[i].url + "'></div><br>" 
	            + "<div class='text-right'>" 
	            + "<button data-id='" + i + "' class='btn btn-sm smooth editE'>" 
	            + "<img src='./img/edit.png' alt='Editar' width='30'></button>"
	            + "<button data-id='" + i + "' class='btn btn-sm smooth deleteE'>" 
	            + "<img src='./img/delete.png' alt='Editar' width='30'></button></div><br>");
		}

		$(".dest").on("click", function () {
	        buscar($(this).data("destino"), $(this).data("nombre"));
	    });

		$(".deleteE").on("click", function () {
	        deleteEpisodio($(this).data("id"));
	    });

		$(".editE").on("click", function () {
	        editEpisodio($(this).data("id"));
	    });
	}

	var episodios =  JSON.parse(localStorage.getItem("_playpod_episodios"));
	if (episodios == null){
		episodios = [ 
			{
				url: "https://api.rtve.es/api/programas/46690/audios.rss",
				name: "Fallo de sistema"
			},
			{
				url: "https://rigorycriterio.es/feeds/audio_teleindiscretos.rss.xml",
				name: "Teleindiscretos"
			},
			{
				url: "https://msdos.club/podfeed/feed.xml",
				name: "MS Dos club"
			},
			{
				url: "https://www.ivoox.com/feed_fg_f141937_filtro_1.xml",
				name: "El Mundo del Spectrum"
			},
			{
				url: "https://fitnessrevolucionario.com/feed/podcast",
				name: "Radio Fitness"
			},
			{
				url: "https://www.ivoox.com/feed_fg_f1302670_filtro_1.xml",
				name: "Construye tu Físico"
			}
		];
	}
	actualizarProgramas();

	function customAlert(message) {
	    return new Promise(function(resolve) {
	        $('#modalMessage').text(message);
	        $('#modalCancel').hide();
	        $('#modalOk').show();
	        $('#customModal').show();

	        $('#modalOk').off('click').on('click', function() {
	            $('#customModal').hide();
	            resolve();
	        });
	    });
	}
	
	function customConfirm(message) {
	    return new Promise(function(resolve) {
	        $('#modalMessage').text(message);
	        $('#modalCancel').show();
	        $('#modalOk').show();
	        $('#customModal').show();

	        $('#modalOk').off('click').on('click', function() {
	            $('#customModal').hide();
	            resolve(true);
	        });

	        $('#modalCancel').off('click').on('click', function() {
	            $('#customModal').hide();
	            resolve(false);
	        });
	    });
	}
	
	if ('serviceWorker' in navigator) {
	  navigator.serviceWorker.register('/sw.js')
	    .then(() => console.log('Service Worker registrado'))
	    .catch(err => console.error('SW fallo:', err));
	}

});
