<?php
/* 
$allowed_origin = 'https://salvacam.js.org';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== $allowed_origin) {
    http_response_code(403);
    echo json_encode(['error' => 'Origen no permitido']);
    exit;
}

header("Access-Control-Allow-Origin: $allowed_origin");
*/
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');


$cacheDir = __DIR__ . '/cache/feeds/';

if (!is_dir($cacheDir)) {
    echo json_encode(['status' => 'error', 'message' => 'La carpeta de caché no existe.']);
    exit;
}

// --- Eliminar archivos dentro de la carpeta ---
$deleted = 0;
$errors = [];

$files = glob($cacheDir . '*'); // todos los archivos dentro
foreach ($files as $file) {
    if (is_file($file)) {
        if (@unlink($file)) {
            $deleted++;
        } else {
            $errors[] = basename($file);
        }
    }
}

// --- Respuesta ---
if (empty($errors)) {
    echo json_encode(['status' => 'ok', 'deleted' => $deleted]);
} else {
    echo json_encode([
        'status' => 'partial',
        'deleted' => $deleted,
        'errors' => $errors
    ]);
}
?>
