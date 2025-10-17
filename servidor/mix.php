<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Intentar leer JSON puro
$input = json_decode(file_get_contents('php://input'), true);

// Si no hay JSON, intentar leer como form-data
if (!$input) {
    if (isset($_POST['prog'])) {
        $input = [
            'pag' => isset($_POST['pag']) ? intval($_POST['pag']) : 0,
            'prog' => json_decode($_POST['prog'], true)
        ];
    } else {
        echo json_encode(['error' => 'JSON o POST inválido']);
        exit;
    }
}

// Validar estructura
if (!isset($input['prog']) || !is_array($input['prog'])) {
    echo json_encode(['error' => 'Falta el campo "prog" o no es un array']);
    exit;
}

$page = isset($input['pag']) ? intval($input['pag']) : 0;
$programas = $input['prog'];
$episodes = [];

// Iterar sobre cada programa
foreach ($programas as $prog) {
    if (empty($prog['url']) || empty($prog['name'])) continue;

    $url = $prog['url'];
    $name = $prog['name'];

    // Llamar a index.php
    $res = @file_get_contents("https://salvacam.x10.mx/playPod/index.php?url=" . urlencode($url) . "&pag=" . $page);
    if ($res === false) continue;

    $data = json_decode($res, true);

    // Si index.php devuelve directamente un array de episodios
    if (isset($data['episodes']) && is_array($data['episodes'])) {
        $epis = $data['episodes'];
    } elseif (is_array($data)) {
        // o directamente un array plano
        $epis = $data;
    } else {
        continue;
    }

    // Añadir todos los episodios
    foreach ($epis as $ep) {
        $guid = '';

        if ($page == 0 && isset($ep['guid'])){
            $guid = $ep['guid'];
        }

        $episodes[] = [
            'title' => $ep['title'] ?? '',
            'url' => $ep['url'] ?? '',
            'name' => $name,
            'guid' => $guid,
            'duration' => $ep['duration'] ?? '',
            'timestamp' => $ep['timestamp'] ?? 0
        ];
    }
}

// Ordenar por timestamp descendente
usort($episodes, fn($a, $b) => ($b['timestamp'] ?? 0) <=> ($a['timestamp'] ?? 0));

// Eliminar timestamp antes de devolver
foreach ($episodes as &$ep) unset($ep['timestamp']);

echo json_encode($episodes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
