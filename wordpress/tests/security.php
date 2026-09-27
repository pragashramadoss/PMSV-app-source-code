<?php
define('ABSPATH',__DIR__);function wp_parse_url($s,$component=-1){return parse_url($s,$component);}function wp_json_encode($v){return json_encode($v);}function get_option($k,$default=false){return $GLOBALS['options'][$k]??$default;}function add_option($k,$v){$GLOBALS['options'][$k]??=$v;}function get_transient($k){return false;}
require __DIR__.'/../plugin/includes/security.php';require __DIR__.'/../plugin/includes/storage.php';require __DIR__.'/../plugin/includes/push.php';
function verify($v,$message){if(!$v)throw new Exception($message);}
foreach(['http://fcm.googleapis.com/longlonglong','https://evil.com/longlonglong','https://user@fcm.googleapis.com/longlonglong','https://fcm.googleapis.com:444/longlonglong','https://fcm.googleapis.com/longlonglong#x','https://fcm.googleapis.com.evil.com/longlonglong'] as $u)verify(!pmsv_wp_endpoint($u),'Unsafe endpoint '.$u);
verify(pmsv_wp_endpoint('https://fcm.googleapis.com/fcm/send/test-address'),'Valid endpoint');
$_SERVER['HTTP_AUTHORIZATION']='Bearer fake.fake.fake';verify(!pmsv_wp_authorized(),'Invalid token rejected');
$sources=json_decode(file_get_contents(__DIR__.'/../plugin/updater-sources.json'),true);
$n=['title'=>'Test regulatory notification','published'=>'2026-09-01','url'=>'https://www.fssai.gov.in/upload/test.pdf','tab'=>'fssai','region'=>'india','source'=>'FSSAI notifications','sourceType'=>'Official source','summary'=>'','category'=>'Notification'];
// Build a known valid source instead of assuming a production source label.
$s=[['name'=>'Known regulator','url'=>'https://example.org','tab'=>'fssai','region'=>'india']];$n['source']='Known regulator';$n['url']='https://example.org/notice';verify(pmsv_wp_valid_item($n,$s),'Known source accepted');
foreach(['https://example.org.evil.test/notice','https://user@example.org/notice','javascript:alert(1)'] as $url){$bad=$n;$bad['url']=$url;verify(!pmsv_wp_valid_item($bad,$s),'Unknown source rejected');}
$bad=$n;$bad['published']='2026-02-30';verify(!pmsv_wp_valid_item($bad,$s),'Invalid calendar day rejected');
$keys=pmsv_wp_keys();verify(strlen(pmsv_wp_unb64($keys['publicKey']))===65,'P-256 public key length');
$header=pmsv_wp_vapid('https://fcm.googleapis.com/fcm/send/test-address',$keys);preg_match('/vapid t=([^,]+)/',$header,$m);$parts=explode('.',$m[1]);$raw=pmsv_wp_unb64($parts[2]);verify(strlen($raw)===64,'JOSE signature length');
$der=pmsv_wp_der(48,pmsv_wp_integer(substr($raw,0,32)).pmsv_wp_integer(substr($raw,32)));
$pub=openssl_pkey_get_details(openssl_pkey_get_private($keys['privateKey']))['key'];verify(openssl_verify($parts[0].'.'.$parts[1],$der,$pub,OPENSSL_ALGO_SHA256)===1,'VAPID signature verifies');
$claims=json_decode(pmsv_wp_unb64($parts[1]),true);verify($claims['sub']==='mailto:Pragash.ramadoss@gmail.com','No old hosting VAPID subject');
echo "PASS PHP endpoint validation, updater rejection, source/date validation and VAPID cryptographic round trip.\n";
