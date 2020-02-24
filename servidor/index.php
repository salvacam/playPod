<?php
//header('Content-Type: application/json');
header('Content-Type: text/plain');
header("access-control-allow-origin: *");
/*
if (isset($_POST["url"])) { 
    $url = $_POST["url"];*/
if (isset($_GET["url"])) { 
    $url = $_GET["url"];
    /*
    $c = curl_init();
    curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($c, CURLOPT_URL, $url);
    $page = curl_exec($c);
    curl_close($c);
    */
    $page = file_get_contents($url);

    if ($page) {
      //  var_dump($page);
        $array = array();
        //$posinicial = strpos($page, 'href');
        $posinicial = strpos($page, '<enclosure url="');
        //$posfinal = strpos($page, "\"", $posinicial + 6);
        $posfinal = strpos($page, "\" length", $posinicial);
        while ($posinicial) {
            //$aux = substr($page, $posinicial + 6, $posfinal - ($posinicial + 6));
            $aux = substr($page, $posinicial + 16, $posfinal - ($posinicial + 16));            
            $array[] = $aux;
            //if (substr($aux, strlen($aux) - 4) == ".mp3") {
            if (substr($aux, strlen($aux) - 4) == "http://ivoox") {
                $array[] = $aux;
            }

            //$posinicial = strpos($page, 'href', $posinicial + 6);
            //$posfinal = strpos($page, "\"", $posinicial + 6);

        $posinicial = strpos($page, '<enclosure url="', $posinicial + 10);
        //$posfinal = strpos($page, "\"", $posinicial + 6);
        $posfinal = strpos($page, "\" length", $posinicial);
        }
        $salida = '[';
        foreach ($array as $key => $value) {
            $salida .= '{"r": "' . $value . '"},';
            //$salida .= $value ;
        }
        $salida = substr($salida, 0, -1);
        if ($salida !== "["){
            echo $salida . ']';   // hay mp3 devuelve array con las url     
        } else {
            echo '{"r":0}'; // ningun mp3         
        }
    } else {
        echo '{"r":-2}'; // parametro no es una url
    }
} else {
    echo '{"r":-1}'; // no hay parametro
}