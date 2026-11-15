<?php
// Release integrity, persistence across plugin upgrades, and mobile download ranges.
$root = sys_get_temp_dir() . '/pmsv-download-test-' . bin2hex(random_bytes(6));
mkdir($root . '/plugin/android-release', 0700, true);
define('PMSV_WP_DIR', $root . '/plugin/');
function add_action(...$args) {}
function wp_upload_dir() { global $root; return ['basedir' => $root . '/uploads', 'error' => false]; }
function wp_mkdir_p($dir) { return is_dir($dir) || mkdir($dir, 0700, true); }
require __DIR__ . '/../plugin/includes/android-download.php';
function check($condition, $name) { if (!$condition) throw new RuntimeException($name); echo "PASS: $name\n"; }
$name = 'PMSV-2.1.0-Android.apk';
$bytes = 'signed installer fixture';
$release = ['filename' => $name, 'sha256' => hash('sha256', $bytes), 'size' => strlen($bytes), 'version' => '2.1.0'];
try {
    check(pmsv_wp_android_release() === null, 'missing release fails closed');
    file_put_contents(PMSV_WP_DIR . 'android-release.json', json_encode($release));
    check(pmsv_wp_android_release() === $release, 'valid release metadata');
    check(pmsv_wp_android_file($release) === null, 'missing installer is not served');
    file_put_contents(PMSV_WP_DIR . 'android-release/' . $name, 'incorrect bytes');
    check(pmsv_wp_android_file($release) === null, 'corrupt bundled installer is rejected');
    file_put_contents(PMSV_WP_DIR . 'android-release/' . $name, $bytes);
    $installed = pmsv_wp_android_file($release);
    check($installed === $root . '/uploads/pmsv-android/' . $name && file_get_contents($installed) === $bytes, 'verified installer copied to persistent uploads');
    unlink(PMSV_WP_DIR . 'android-release/' . $name);
    check(pmsv_wp_android_file($release) === $installed, 'installer survives plugin replacement');
    file_put_contents($installed, str_repeat('x', strlen($bytes)));
    check(pmsv_wp_android_file($release) === null, 'corrupt persisted installer is rejected');
    file_put_contents(PMSV_WP_DIR . 'android-release.json', json_encode(array_merge($release, ['filename' => '../private.apk'])));
    check(pmsv_wp_android_release() === null, 'path traversal is rejected');
    check(pmsv_wp_android_range('', 100) === [0,99,200], 'complete download');
    check(pmsv_wp_android_range('bytes=20-', 100) === [20,99,206], 'resume from offset');
    check(pmsv_wp_android_range('bytes=20-29', 100) === [20,29,206], 'bounded range');
    check(pmsv_wp_android_range('bytes=-10', 100) === [90,99,206], 'suffix range');
    check(pmsv_wp_android_range('bytes=90-200', 100) === [90,99,206], 'range capped at file size');
    foreach (['bytes=100-', 'bytes=30-20', 'bytes=-0', 'bytes=-', 'bytes=0-1,4-5', 'not a range'] as $range) {
        check(pmsv_wp_android_range($range, 100) === null, 'reject invalid range ' . $range);
    }
} finally {
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($files as $file) { $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname()); }
    rmdir($root);
}
