$(function () {
    $(".dest").on("click", function () {
        buscar($(this).data("destino"), $(this).data("nombre"));
    });

    $("#otro-bt").on("click", function (e) {
        e.preventDefault();
        console.log($("#otro-txt").val());
        if ($("#otro-txt").val() == "") {
            $("#listado").text("Introduce url donde buscar archivos mp3");
        } else {
            buscar($("#otro-txt").val(), $("#otro-txt").val() );
            $("#otro-txt").val("");
        }
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
        		$("#spinnerDiv").addClass("hide");
                //console.log(data);
				$("#listado").append("<h3>" + nombre + "</h3>");
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
});
