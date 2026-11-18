<?php
// Run on a disposable WordPress install whose test database is configured in wp-config.php.
if (PHP_SAPI !== 'cli' || empty($argv[1])) exit("Usage: php push-storage.php /path/to/test-wordpress\n");
require rtrim($argv[1], '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/upgrade.php';
if (!defined('PMSV_WP_DIR')) require dirname(__DIR__) . '/plugin/pmsv-app.php';

global $wpdb;
$original = $wpdb->prefix;
$prefix = 'pmsvtest_' . bin2hex(random_bytes(6)) . '_';
$wpdb->set_prefix($prefix);
$table = pmsv_wp_table('devices');
$options = $wpdb->options;
function storage_check($ok, $label) {
    if (!$ok) throw new RuntimeException($label);
}
try {
    // Isolate both the WordPress upgrade marker and all plugin data.
    storage_check($wpdb->query("CREATE TABLE $options LIKE {$original}options") !== false, 'create test options');
    wp_cache_flush_runtime();
    update_option('pmsv_wp_schema', 5, false);
    storage_check($wpdb->query("CREATE TABLE $table (
        id varchar(64) PRIMARY KEY, endpoint text NOT NULL, token_hash varchar(64) NOT NULL,
        seen_at bigint NOT NULL, retry_at bigint NOT NULL DEFAULT 0
    )") !== false, 'create legacy table');
    $wpdb->insert($table, ['id'=>'test', 'endpoint'=>'fixture', 'token_hash'=>'saved', 'seen_at'=>17, 'retry_at'=>99]);
    foreach (['refresh_required', 'retry_at', 'both', 'complete'] as $state) {
        if ($state === 'retry_at' || $state === 'both') $wpdb->query("ALTER TABLE $table DROP COLUMN retry_at");
        if ($state === 'both') $wpdb->query("ALTER TABLE $table DROP COLUMN refresh_required");
        update_option('pmsv_wp_schema', 5, false);
        pmsv_wp_install();
        storage_check((int) get_option('pmsv_wp_schema') === PMSV_WP_SCHEMA_VERSION, "verified $state upgrade");
        $row = $wpdb->get_row("SELECT * FROM $table WHERE id='test'", ARRAY_A);
        storage_check($row && $row['token_hash'] === 'saved' && (int)$row['seen_at'] === 17, 'retain existing registration');
        storage_check((int)$row['retry_at'] === (in_array($state, ['refresh_required','complete'], true) ? 99 : 0), 'preserve retry or use default');
        storage_check((int)$row['refresh_required'] === (in_array($state, ['retry_at','complete'], true) ? 1 : 0), 'preserve refresh flag or use default');
        pmsv_wp_install();
        storage_check($row === $wpdb->get_row("SELECT * FROM $table WHERE id='test'", ARRAY_A), 'idempotent upgrade');
        $wpdb->update($table, ['refresh_required'=>1,'retry_at'=>99], ['id'=>'test']);
    }
    echo "PASS existing subscriptions across partial and completed WordPress schema upgrades\n";
} finally {
    $wpdb->query("DROP TABLE IF EXISTS $table, $options");
    $wpdb->set_prefix($original);
    wp_cache_flush_runtime();
}
