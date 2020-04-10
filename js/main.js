$(function () {
    var lista;
    $(".dest").on("click", function () {
        buscar($(this).data("destino"), $(this).data("nombre"));
    });
    $("#otro-bt").on("click", function (e) {
        e.preventDefault();
        console.log($("#otro-txt").val());
        if ($("#otro-txt").val() == "") {
            $("#listado").text("Introduce url donde buscar archivos mp3");
        } else {
            buscar($("#otro-txt").val(), limpiaUrl($("#otro-txt").val()));
            $("#otro-txt").val("");
        }
    });
    function limpiaUrl(cadena) {
        var pos = cadena.lastIndexOf("/");
        return cadena.substring(pos + 1);
    }
    function play(cadena, pos) {
        $("#audio").attr("src", cadena);
        $("#audio").attr("autoplay", "");
        $("#audio").on("ended", function () {
            if (pos < lista.length - 1) {
                play(lista[pos + 1].r, pos + 1);
            } else {
                play(lista[0].r, 0);
            }
        });
        $("#titulo").remove();
        $("#audioDiv").prepend("<span data-pos='" + pos + "' id='titulo'>" + limpiaUrl(cadena) + "</span>");
    }
    function buscar(url, nombre) {
		$.ajax({
			type: 'GET',
			//url: "https://calcicolous-moonlig.000webhostapp.com/podcast/index.php?url=" + encodeURI(url),
			url: "https://playpod.herokuapp.com/index.php?url=" + encodeURI(url),
			//url: "servidor/index.php?url=" + encodeURI(url),
			dataType: 'json',
			success: function(data){
				lista = data;
                console.log(data);
                pos = 0;
				$("#listado").text("");
				$("#listado").append("<h3>" + nombre + "</h3>");
				if (data.length > 0) {

                	console.log(data);
                	data.reverse();                    
                    $(".botones").removeClass("none");
                    $(".botones").addClass("visto");
					for (var i = 0; i < data.length; i++) {
						$("#listado").append("<button class='pure-button pista' data-pista='" + i + "'>" + limpiaUrl(data[i].r) + "</button><br/>");
					}
					play(data[0].r, 0);
					$(".pista").on("click", function () {
						play(data[$(this).data("pista")].r, $(this).data("pista"));
					});
					$("#atras").on("click", function () {
						var pos = $("#titulo").data("pos");
						if (pos > 0) {
							play(data[pos - 1].r, pos - 1);
						} else {
							play(data[data.length - 1].r, data.length - 1);
						}
					});
					$("#adelante").on("click", function () {
						var pos = $("#titulo").data("pos");
						if (pos < data.length - 1) {
							play(data[pos + 1].r, pos + 1);
						} else {
							play(data[0].r, 0);
						}
					});
				} else {
					$("#listado").append("<h5>No hay mp3</h5>");
				}
			},
			error: function(xhr, type){
				$("#listado").append("<h5>No hay mp3</h5>");
			}
		});
    }
});
