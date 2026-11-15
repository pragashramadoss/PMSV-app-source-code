<?php
// The signed installer is copied once to uploads, so normal plugin updates do not remove it.
function pmsv_wp_android_release() {
    $config = json_decode((string)@file_get_contents(PMSV_WP_DIR . 'android-release.json'), true);
    if (!is_array($config) || !preg_match('/^PMSV-\d+\.\d+\.\d+-Android\.apk$/D', $config['filename'] ?? '') ||
        !preg_match('/^[a-f0-9]{64}$/D', $config['sha256'] ?? '') ||
        !preg_match('/^\d+\.\d+\.\d+$/D', $config['version'] ?? '') || (int)($config['size'] ?? 0) < 1) return null;
    return $config;
}

function pmsv_wp_android_file($release) {
    $uploads = wp_upload_dir();
    if (!empty($uploads['error'])) return null;
    $directory = $uploads['basedir'] . '/pmsv-android';
    $destination = $directory . '/' . $release['filename'];
    $valid = static function($path) use ($release) {
        clearstatcache(true, $path);
        return is_file($path) && filesize($path) === (int)$release['size'] &&
            hash_equals($release['sha256'], (string)hash_file('sha256', $path));
    };
    if ($valid($destination)) return $destination;
    $bundled = PMSV_WP_DIR . 'android-release/' . $release['filename'];
    if (!$valid($bundled) || !wp_mkdir_p($directory)) return null;
    $temporary = tempnam($directory, '.pmsv-');
    if ($temporary === false) return null;
    if (!copy($bundled, $temporary) || !$valid($temporary) || !rename($temporary, $destination)) {
        @unlink($temporary);
        return null;
    }
    chmod($destination, 0644);
    return $destination;
}

// A single HTTP byte range supports interrupted mobile downloads; malformed ranges fail closed.
function pmsv_wp_android_range($header, $size) {
    if ($header === '') return [0, $size - 1, 200];
    if (!preg_match('/^bytes=(\d*)-(\d*)$/D', $header, $matches) || ($matches[1] === '' && $matches[2] === '')) return null;
    if ($matches[1] === '') {
        $suffix = (int)$matches[2];
        if ($suffix < 1) return null;
        return [max(0, $size - $suffix), $size - 1, 206];
    }
    $start = (int)$matches[1];
    $end = $matches[2] === '' ? $size - 1 : min((int)$matches[2], $size - 1);
    return $start >= $size || $end < $start ? null : [$start, $end, 206];
}

function pmsv_wp_android_download() {
    if (!isset($_GET['pmsv_android'])) return;
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, ['GET', 'HEAD'], true)) {
        status_header(405); header('Allow: GET, HEAD'); exit;
    }
    $release = pmsv_wp_android_release();
    $file = $release ? pmsv_wp_android_file($release) : null;
    if (!$file) {
        nocache_headers();
        wp_die('The Android download is temporarily unavailable. Please try again shortly.', 'PMSV Android download', ['response' => 503]);
    }
    if ($_GET['pmsv_android'] === 'info') {
        nocache_headers();
        wp_send_json($release + ['download_url' => home_url('/?pmsv_android=1')]);
    }
    $size = filesize($file);
    $range = pmsv_wp_android_range($_SERVER['HTTP_RANGE'] ?? '', $size);
    if (!$range) {
        status_header(416); header('Content-Range: bytes */' . $size); exit;
    }
    [$start, $end, $status] = $range;
    @ini_set('zlib.output_compression', 'Off');
    while (ob_get_level()) ob_end_clean();
    status_header($status);
    header('Content-Type: application/vnd.android.package-archive');
    header('Content-Disposition: attachment; filename="' . $release['filename'] . '"');
    header('Content-Length: ' . ($end - $start + 1));
    header('Accept-Ranges: bytes');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-PMSV-Version: ' . $release['version']);
    if ($status === 206) header("Content-Range: bytes $start-$end/$size");
    if ($method === 'HEAD') exit;
    $handle = fopen($file, 'rb');
    fseek($handle, $start);
    $remaining = $end - $start + 1;
    while ($remaining > 0 && !feof($handle)) {
        $chunk = fread($handle, min(1048576, $remaining));
        if ($chunk === false || $chunk === '') break;
        echo $chunk;
        $remaining -= strlen($chunk);
    }
    fclose($handle);
    exit;
}
add_action('template_redirect', 'pmsv_wp_android_download', 0);
