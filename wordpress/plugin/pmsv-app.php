<?php
/**
 * Plugin Name: PMSV Food Safety & Quality Forum
 * Description: PMSV Food Safety & Quality Forum production application.
 * Version: 1.0.4
 * Requires PHP: 8.1
 * Author: PMSV Group
 */
if (!defined('ABSPATH')) exit;
define('PMSV_WP_DIR', __DIR__ . '/');
// Production mode: the PMSV application owns the public site root while WordPress admin/API remain available.
function pmsv_wp_base() { return ''; }
require_once PMSV_WP_DIR . 'includes/security.php';
require_once PMSV_WP_DIR . 'includes/storage.php';
require_once PMSV_WP_DIR . 'includes/push.php';
register_activation_hook(__FILE__, 'pmsv_wp_install');
add_action('template_redirect', function () {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
    $base = pmsv_wp_base();

    // Never take over WordPress administration, login, REST/API, cron or direct core/plugin assets.
    foreach (['/wp-admin','/wp-login.php','/wp-json','/xmlrpc.php','/wp-cron.php','/wp-content','/wp-includes'] as $reserved) {
        if ($path === $reserved || str_starts_with($path, $reserved . '/')) return;
    }
    if ($base !== '' && $path !== $base && !str_starts_with($path, $base . '/')) return;
    $route = $base === '' ? $path : (substr($path, strlen($base)) ?: '/');
    header("Content-Security-Policy: object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    if (str_starts_with($route, '/api/')) { pmsv_wp_api(substr($route, 5)); exit; }
    if ($route === '/manifest.webmanifest') {
        $manifest = json_decode(file_get_contents(PMSV_WP_DIR . 'public/manifest.webmanifest'), true);
        foreach (['id','start_url','scope'] as $key) $manifest[$key] = $base . '/';
        $manifest['prefer_related_applications'] = false;
        $icon_base = trailingslashit(plugins_url('public', __FILE__));
        foreach ($manifest['icons'] as &$icon) $icon['src'] = $icon_base . ltrim($icon['src'], '/');
        header('Content-Type: application/manifest+json'); header('Cache-Control: no-cache, must-revalidate'); echo wp_json_encode($manifest); exit;
    }
    if ($route === '/sw.js') {
        header('Content-Type: application/javascript'); header('Cache-Control: no-cache');
        header('Service-Worker-Allowed: ' . $base . '/');
        $sw = file_get_contents(PMSV_WP_DIR . 'public/sw.js');
        $sw = preg_replace("/pmsv-offline-v\\d+/", 'pmsv-wp-v1.0.4', $sw);
        echo preg_replace_callback("~(['\"])(/[^'\"]*)\\1~", fn($m) => $m[1] . $base . $m[2] . $m[1], $sw); exit;
    }
    // Exact packaged public files only; never PHP, source files or arbitrary paths.
    $relative = ltrim($route, '/');
    $allowed = json_decode(file_get_contents(PMSV_WP_DIR . 'public-files.json'), true);
    if (in_array($relative, $allowed, true)) {
        $ext = pathinfo($relative, PATHINFO_EXTENSION);
        $types = ['png'=>'image/png','jpg'=>'image/jpeg','jpeg'=>'image/jpeg','webp'=>'image/webp','svg'=>'image/svg+xml','html'=>'text/html; charset=UTF-8','css'=>'text/css; charset=UTF-8','js'=>'application/javascript; charset=UTF-8','json'=>'application/json'];
        header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
        header('Cache-Control: no-cache, must-revalidate');
        status_header(200);
        if ($ext === 'html') {
            $html = str_replace('href="/"', 'href="' . esc_attr($base) . '/"', file_get_contents(PMSV_WP_DIR . 'public/' . $relative));
            // WordPress.com may intercept virtual .css/.js paths before WordPress routing.
            // Audit pages therefore load their packaged static assets directly from the plugin directory,
            // while navigation links continue to use the isolated /pmsv-app-review routes.
            if (str_starts_with($relative, 'audits/')) {
                $audit_assets = trailingslashit(plugins_url('public/audits', __FILE__));
                $public_assets = trailingslashit(plugins_url('public', __FILE__));
                $html = preg_replace_callback(
                    '~\\b(href|src)=(["\\\'])(?!https?:|data:|blob:|/|#)([^"\\\']+\\.(?:css|js|png|jpe?g|webp|svg))(\\?[^"\\\']*)?\\2~i',
                    function ($m) use ($audit_assets, $public_assets) {
                        $path = $m[3];
                        $query = $m[4] ?? '';
                        if (str_starts_with($path, '../')) {
                            $url = $public_assets . ltrim(substr($path, 3), '/');
                        } else {
                            $url = $audit_assets . ltrim($path, './');
                        }
                        return $m[1] . '=' . $m[2] . esc_url($url . $query) . $m[2];
                    },
                    $html
                );
            }
            echo $html;
        } else readfile(PMSV_WP_DIR . 'public/' . $relative);
        exit;
    }
    $routes = json_decode(file_get_contents(PMSV_WP_DIR . 'routes.json'), true);
    $normalized = rtrim($route, '/') ?: '/';
    $dynamic_blog = preg_match('~^/blogs/[a-z0-9][a-z0-9-]{0,79}$~', $normalized) === 1;
    status_header(in_array($normalized, $routes, true) || $dynamic_blog ? 200 : 404);
    nocache_headers();
    $manifest = json_decode(file_get_contents(PMSV_WP_DIR . 'assets/.vite/manifest.json'), true)['index.html'];
    $assets = trailingslashit(plugins_url('assets', __FILE__));
    $public = trailingslashit(plugins_url('public', __FILE__));
    ?><!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#3155d9"><meta name="apple-mobile-web-app-capable" content="yes"><title>PMSV Food Safety & Quality Forum</title><link rel="manifest" href="<?php echo esc_url($base . '/manifest.webmanifest'); ?>"><link rel="icon" href="/wp-content/plugins/pmsv-original-app-preview/public/icons/pmsv-family-64.png"><link rel="apple-touch-icon" href="/wp-content/plugins/pmsv-original-app-preview/public/icons/pmsv-family-192.png"><?php foreach($manifest['css'] ?? [] as $css): ?><link rel="stylesheet" href="<?php echo esc_url($assets . $css . '?v=1.0.4'); ?>"><?php endforeach; ?></head><body class="antialiased"><div id="root"></div><script>window.PMSV=<?php echo wp_json_encode(['base'=>$base,'publicBase'=>$public], JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT); ?>;window.PMSV.installPrompt=null;if('serviceWorker' in navigator){navigator.serviceWorker.register((window.PMSV.base||'')+'/sw.js',{scope:(window.PMSV.base||'')+'/',updateViaCache:'none'}).catch(function(){});}window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.PMSV.installPrompt=e;window.dispatchEvent(new Event('pmsv-install-available'));});window.addEventListener('appinstalled',function(){window.PMSV.installPrompt=null;});</script><script type="module" src="<?php echo esc_url($assets . $manifest['file'] . '?v=1.0.4'); ?>"></script></body></html><?php
    exit;
}, 0);
function pmsv_wp_reply($body, $status=200) { status_header($status); nocache_headers(); header('Content-Type: application/json'); echo wp_json_encode($body); }
function pmsv_wp_api($route) {
    $method = $_SERVER['REQUEST_METHOD'];
    try {
        if ($route==='news' && $method==='GET') return pmsv_wp_reply(['news'=>pmsv_wp_archive()]);
        if ($route==='updater' && $method==='GET') return pmsv_wp_reply(get_option('pmsv_wp_updater', ['active'=>false]));
        if ($route==='push/latest' && $method==='GET') {
            $news = pmsv_wp_archive(); usort($news, fn($a,$b)=>strcmp($b['firstSeen'],$a['firstSeen']));
            return pmsv_wp_reply(['title'=>'PMSV Food Safety & Quality Forum','body'=>$news[0]['title']??'New food safety updates are available.','url'=>pmsv_wp_base().'/','tag'=>'pmsv-news']);
        }
        if ($route==='push' && $method==='GET') return pmsv_wp_reply(['publicKey'=>pmsv_wp_keys()['publicKey']]);
        if ($route==='push' && in_array($method,['POST','DELETE'],true)) return pmsv_wp_change_push($method==='DELETE');
        if (in_array($route,['updater','push/dispatch'],true) && $method==='POST') {
            if (!pmsv_wp_authorized()) return pmsv_wp_reply(['error'=>'Publisher authorization required.'],401);
            return $route==='updater' ? pmsv_wp_ingest() : pmsv_wp_reply(pmsv_wp_dispatch());
        }
        if ($route==='subscriptions' && $method==='POST') return pmsv_wp_reply(['error'=>'Email and WhatsApp subscriptions have been discontinued. Use app notifications instead.'],410);
        // Legacy personal subscriptions must be securely migrated before cancellation is enabled.
        if ($route==='subscriptions/cancel') return pmsv_wp_reply(['error'=>'Legacy cancellation is unavailable in this migration preview. Contact PMSV support.'],503);
        pmsv_wp_reply(['error'=>'Not found'],404);
    } catch (Throwable $e) { pmsv_wp_reply(['error'=>'Service temporarily unavailable. Please try again.'],503); }
}
