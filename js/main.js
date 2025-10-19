$(function () {

	var episodios =  JSON.parse(localStorage.getItem("_playpod_episodios"));
	var escuchados =  JSON.parse(localStorage.getItem("_playpod_escuchados"));
	if (escuchados == null) {
		escuchados = [];
	}
	var comprobarOidos = [];
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
	var paginacion = 0;

	var isLoading = 0;

    function deleteEpisodio(id) {    	
	    if (customConfirm("¿Estás seguro de que eliminar el episodio?")) {
	    	episodios.splice(id, 1);
			localStorage.setItem("_playpod_episodios", JSON.stringify(episodios));
			actualizarProgramas();
			paginacion = 1;
	    	cargarEpisodios();
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
			paginacion = 1;
	    	cargarEpisodios();
			$('#config').scrollTop(0);
    	}
    }

	function actualizarProgramas() {
		$("#programasConfig").text("");
		for (var i = 0; i < episodios.length; i++) {
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

		$(".deleteE").on("click", function () {
	        deleteEpisodio($(this).data("id"));
	    });

		$(".editE").on("click", function () {
	        editEpisodio($(this).data("id"));
	    });
		$("#listado").text("");
	}

    function play(cadena, titleAudio, min, guid) {
		$("#play").removeClass("play");
        $("#audio").attr("src", cadena);
        $("#audio").attr("autoplay", "");
		$("#audio")[0].currentTime = min;
		$("#audio")[0].title = titleAudio;
        $("#titulo").remove();
        $("#audioDiv").prepend("<span id='titulo'>" + titleAudio + "</span>");
        localStorage.setItem("_playpod_mp3", cadena);
    	$("#playLast")[0].dataset.mp3 = localStorage.getItem("_playpod_mp3");
        localStorage.setItem("_playpod_title", titleAudio);
    	$("#playLast")[0].dataset.podcast = localStorage.getItem("_playpod_title");
    	$("#lastPodcast").html(localStorage.getItem("_playpod_title"));
    	localStorage.setItem("_playpod_time", min);    	
    	$("#lastTime").html(parseInt(parseInt($("#audio")[0].currentTime)/60));
		$("#playLast")[0].dataset.min = localStorage.getItem("_playpod_time");

    	if (escuchados == null) {
    		escuchados = [];    		
    	}
		if (guid != "" && escuchados.indexOf(guid) === -1) {
    		escuchados.push(guid);
			localStorage.setItem("_playpod_escuchados", JSON.stringify(escuchados));
		}
    	window.scrollTo(0, 0);
    }
    
	function myTimer() {
		if ($("#audio")[0].duration > 0) {
			localStorage.setItem("_playpod_time", parseInt($("#audio")[0].currentTime));
    		$("#lastTime").html(parseInt(localStorage.getItem("_playpod_time")/60));
    		$("#playLast")[0].dataset.min = localStorage.getItem("_playpod_time");
		}
  	}

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

	function dibujarEpisodios(dataEpisodios) {
		if (paginacion <= 1) {
			comprobarOidos = [];
		}
		$("#spinnerDiv").addClass("hide");
		/*
		duration: "52:29"
		name:"Radio Fitness"
		title:"Ayudar Mejor y Peligros de la Empatía, con Pablo Melchor"
		url:"https://traffic.libsyn.com/fitnessrevolucionario/Episodio457.mp3"
		*/
		if (dataEpisodios.length > 0) {  
			if (paginacion <= 1) {
				localStorage.setItem("_playpod_data", JSON.stringify(dataEpisodios));
			}

			for (var i = 0; i < dataEpisodios.length; i++) {

	            var nombrePista = dataEpisodios[i].title + " <i>{ " + dataEpisodios[i].name +  " }</i> ";
	            var nombrePistaMostrar = dataEpisodios[i].title + " <i>{ " + dataEpisodios[i].name +  " }</i> " + dataEpisodios[i].duration;
	            var escuchado = "";
	            if (dataEpisodios[i].guid != "") {
	            	comprobarOidos.push(dataEpisodios[i].guid);
					if (escuchados.indexOf(dataEpisodios[i].guid) === -1) {					    		
	            		escuchado = "oir";
					}
	            }
				$("#listado").append("<div class='justify-between'><div style='width:90%'>"
					+"<button class='btn btn-sm smooth pista " + escuchado + "' data-pista='" + i 
					+ "' data-nombre='" + nombrePista + "' data-url='" + dataEpisodios[i].url 
					+ "' data-guid='" + dataEpisodios[i].guid  +"'> "
					+ nombrePistaMostrar + "</button></div>"
					+ " <div><button class='btn btn-sm smooth marcarOido " + escuchado 
					+ "' data-guid='" + dataEpisodios[i].guid  +"' style='padding:5px;'>"
					+ " </button> </div></div>");
			}


			$(".marcarOido").on("click", function (x) {
		    	if (escuchados == null) {
		    		escuchados = [];    		
		    	} 	
				$(x.target).removeClass('oir');
				$(x.target).parent().removeClass('oir');
				$('.pista.oir[data-guid="' + x.target.dataset.guid + '"]').removeClass('oir');
				if (escuchados.indexOf(x.target.dataset.guid) === -1) {
					escuchados.push(x.target.dataset.guid);
					localStorage.setItem("_playpod_escuchados", JSON.stringify(escuchados));
				}
			});
			
			$(".pista").on("click", function (x) {
				$(x.target).removeClass('oir');
				var url = x.target.dataset.url;
				var nombre = x.target.dataset.nombre;
				var guid = x.target.dataset.guid;
				if (x.target.dataset.url == null) {
					url  = $(x.target).parent()[0].dataset.url;
					nombre  = $(x.target).parent()[0].dataset.nombre;
					guid  = $(x.target).parent()[0].dataset.guid;
				} 
				play(url, nombre, 0, guid);
			});

			escuchados = escuchados.filter(item => comprobarOidos.includes(item));
			localStorage.setItem("_playpod_escuchados", JSON.stringify(escuchados));

			paginacion++;
		}
	}

	function cargarEpisodios() {
        $("#spinnerDiv").removeClass("hide");
		var datosGuardados = JSON.parse(localStorage.getItem("_playpod_data"));
		if (paginacion == 0 && datosGuardados != null) {
			dibujarEpisodios(datosGuardados);
		} else {
			$.ajax({
				type: 'POST',
				url: "https://salvacam.x10.mx/playPod/mix.php",
				//url: "servidor/mix.php",
			  	data: { 
				    pag: (paginacion - 1), 
				    prog: JSON.stringify(episodios)
				},
				dataType: 'json',
				success: function(data) {
					if (paginacion == 1) {
						$("#listado").text("");
    					window.scrollTo(0, 0);
					}
					dibujarEpisodios(data);
				},
				error: function(xhr, type) {
	        		$("#spinnerDiv").addClass("hide");
					$("#listado").append("<h5>No hay audios</h5>");
				}
			});
		}
	}

	function cargarMas() {
		const details = document.getElementById('episodioList');
		if (details.open && !$('#config').hasClass('show') ) {
		    cargarEpisodios();
		}
	}

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

	$(window).on('scroll', function() {
	  const scrollTop = $(window).scrollTop();
	  const windowHeight = $(window).height();
	  const documentHeight = $(document).height();

	  if (scrollTop + windowHeight >= documentHeight - 50) {
	    if (isLoading == 0) {
	      isLoading = 1;
	      cargarMas();
	      setTimeout(() => isLoading = 0, 500);
	    }
	  }
	});

    $('#configToggle').on('click', function() {
        $('#config').toggleClass('show');
    	$('body').toggleClass('noscroll');
    });

	$("#darkMode").on("change", function () {
		$("body").toggleClass("dark");
        localStorage.setItem("_playpod_dark", $('#darkMode').is(':checked'));
	});

	$("#resetOidos").on("click", function () {
		escuchados = [];
		localStorage.setItem("_playpod_escuchados", JSON.stringify(escuchados));
		$("#listado").text("");
		paginacion = 1;
	    cargarEpisodios();
	});

    $("#otro-bt").on("click", function (e) {
        if ($("#otro-txt").val() == "" || $("#otro-name").val() == "") {
			customAlert("Introduce nombre y rss");
        } else {
			episodios.push({url: $("#otro-txt").val(),
				name: $("#otro-name").val()});
			localStorage.setItem("_playpod_episodios", JSON.stringify(episodios));
			actualizarProgramas();
			paginacion = 1;
	    	cargarEpisodios();
		}
    });

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
					paginacion = 1;
	    			cargarEpisodios();
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

	$("#play").on("click", function () {
		if ($('audio')[0].src != '') {
			if($('audio')[0].paused) {
				$('audio')[0].play();
				$("#play").removeClass("play");
			} else {
				$('audio')[0].pause();
				$("#play").addClass("play");
			}	
		}
	});
	
	$("#rewind").on("click", function () {
		$('audio')[0].currentTime = Math.max($('audio')[0].currentTime - 10, 0);
	});
	
	$("#forward").on("click", function () {
		$('audio')[0].currentTime = Math.min($('audio')[0].currentTime + 10, $('audio')[0].duration);
	});	

	$("#playLast").on("click", function (x) {
		play(x.target.dataset.mp3, x.target.dataset.podcast,x.target.dataset.min, '');
	});

	$("#oidoTodos").on("click", function (x) {
		escuchados = comprobarOidos;
		localStorage.setItem("_playpod_escuchados", JSON.stringify(escuchados));		
		$('.oir').removeClass('oir');
	});

	window.addEventListener('online', actualizarAvisoConexion);
	window.addEventListener('offline', actualizarAvisoConexion);
 
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

	actualizarAvisoConexion();

    setInterval(myTimer, 30000);

	actualizarProgramas();
	cargarEpisodios();
	
	if ('serviceWorker' in navigator) {
	  navigator.serviceWorker.register('./sw.js')
	    .then(() => console.log('Service Worker registrado'))
	    .catch(err => console.error('SW fallo:', err));
	}

});
