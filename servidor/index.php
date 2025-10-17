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


// Función para formatear la duración
function formatDuration($durationStr) {
    if (empty($durationStr)) {
        return '';
    }

    // Si es un número, asumimos que son segundos
    if (is_numeric($durationStr)) {
        $seconds = intval($durationStr);
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $seconds = $seconds % 60;
        if ($hours > 0) {
            return sprintf("%02d:%02d:%02d", $hours, $minutes, $seconds);
        } else {
            return sprintf("%02d:%02d", $minutes, $seconds);
        }
    }

    // Si contiene dos puntos, puede ser HH:MM:SS o MM:SS
    if (strpos($durationStr, ':') !== false) {
        $parts = explode(':', $durationStr);
        $numParts = count($parts);
        if ($numParts === 2) {
            // MM:SS
            $minutes = intval($parts[0]);
            $seconds = intval($parts[1]);
            $hours = 0;
            if ($minutes >= 60) {
                $hours = floor($minutes / 60);
                $minutes = $minutes % 60;
                return sprintf("%02d:%02d:%02d", $hours, $minutes, $seconds);
            } else {
                return sprintf("%02d:%02d", $minutes, $seconds);
            }
        } else if ($numParts === 3) {
            // HH:MM:SS
            if (strpos($parts[0], '.') !== false) {
                // Caso especial: horas decimales (como "1.8666666666666667:00:00")
                $hoursDecimal = floatval($parts[0]);
                $hours = floor($hoursDecimal);
                $minutes = round(($hoursDecimal - $hours) * 60);
                $seconds = intval($parts[2]);
                // Aseguramos que los minutos no excedan 59
                if ($minutes >= 60) {
                    $hours += floor($minutes / 60);
                    $minutes = $minutes % 60;
                }
                return sprintf("%02d:%02d:%02d", $hours, $minutes, $seconds);
            } else {
                // Formato normal HH:MM:SS
                $hours = intval($parts[0]);
                $minutes = intval($parts[1]);
                $seconds = intval($parts[2]);
                return sprintf("%02d:%02d:%02d", $hours, $minutes, $seconds);
            }
        }
    }

    // Si no coincide con ningún formato, devolvemos la cadena original
    return $durationStr;
}

// Configuración
$cacheTime = 18 * 60 * 60; // 18 horas
$cacheDir = 'cache/feeds/';
$perPage = 5;

// Obtener la URL del feed desde el parámetro
if (!isset($_GET['url']) || empty($_GET['url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetro "url" requerido']);
    exit;
}

$targetUrl = $_GET['url'];

// Validar URL
if (!filter_var($targetUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['error' => 'URL no válida']);
    exit;
}

// Parámetro opcional de paginación
$page = isset($_GET['pag']) ? intval($_GET['pag']) : null;
if ($page !== null && $page < 0) $page = 0;

// Crear nombre de archivo de caché seguro
$cacheFile = $cacheDir . 'feed_' . md5($targetUrl) . '.json';

// Crear directorio de caché si no existe
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

// Verificar caché
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $cachedData = json_decode(file_get_contents($cacheFile), true);
    
    // aplicar paginación solo a la salida, no al archivo
    if ($page !== null) {
        $start = $page * $perPage;
        $pagedEpisodes = array_slice($cachedData, $start, $perPage);
        echo json_encode($pagedEpisodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }
    echo json_encode($cachedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Obtener datos frescos
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $targetUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true, // Mejor para producción
    CURLOPT_SSL_VERIFYHOST => 2
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_error($ch) || !$response || $httpCode !== 200) {
    // Si hay error pero existe caché, usar caché aunque esté expirado
    if (file_exists($cacheFile)) {
        $cachedData = json_decode(file_get_contents($cacheFile), true);
        $cachedData['cached'] = true;
        $cachedData['error'] = 'Usando caché por error: ' . curl_error($ch);
        echo json_encode($cachedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        curl_close($ch);
        exit;
    }
    
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo obtener el feed',
        'curlError' => curl_error($ch),
        'httpCode' => $httpCode
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Parsear XML y extraer datos
$xml = simplexml_load_string($response);
$episodes = [];

if ($xml) {
    $channelTitle = (string)$xml->channel->title;
    $channelDescription = (string)$xml->channel->description;
    
    foreach ($xml->channel->item as $item) {
        if (isset($item->enclosure)) {
            $url = (string)$item->enclosure['url'];
            // Buscar cualquier archivo de audio, no solo MP3
            if (preg_match('/\.(mp3|m4a|wav|ogg|aac)$/i', $url)) {
                $pubDate = (string)$item->pubDate;
                $timestamp = strtotime($pubDate);
                
                $episodes[] = [
                    'title' => (string)$item->title,
                    'url' => $url,
                    'guid' => (string)$item->guid,
                    'date' => $pubDate,
                    'timestamp' => $timestamp,
                    'dateReadable' => date('d/m/Y H:i', $timestamp),
                    'duration' => formatDuration((string)$item->children('itunes', true)->duration),
                ];
            }
        }
    }
}

// Ordenar por fecha (más nuevos primero)
usort($episodes, function($a, $b) {
    return $b['timestamp'] - $a['timestamp'];
});

// Guardar en caché
file_put_contents($cacheFile, json_encode($episodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));


// Aplicar paginación si corresponde
if ($page !== null) {
    $start = $page * $perPage;
    $pagedEpisodes = array_slice($episodes, $start, $perPage);
    // Enviar respuesta
    echo json_encode($pagedEpisodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Enviar respuesta
echo json_encode($episodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>