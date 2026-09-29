<?php
if (!defined('ABSPATH')) exit;
function pmsv_wp_keys() {
    $keys=get_option('pmsv_wp_vapid');
    if(is_array($keys)&&!empty($keys['privateKey'])&&!empty($keys['publicKey']))return $keys;
    // Prefer the host OpenSSL configuration. Fall back to the bundled minimal config only if needed.
    $options=['private_key_type'=>OPENSSL_KEYTYPE_EC,'curve_name'=>'prime256v1'];
    $key=openssl_pkey_new($options);
    if(!$key)$key=openssl_pkey_new($options+['config'=>__DIR__.'/openssl.cnf']);
    if(!$key)throw new RuntimeException('Notification key generation is unavailable');
    if(!openssl_pkey_export($key,$pem)) {
        if(!openssl_pkey_export($key,$pem,null,['config'=>__DIR__.'/openssl.cnf']))throw new RuntimeException('Notification key export failed');
    }
    $details=openssl_pkey_get_details($key);
    if(!is_array($details)||empty($details['ec']['x'])||empty($details['ec']['y']))throw new RuntimeException('Notification key details unavailable');
    $keys=['privateKey'=>$pem,'publicKey'=>pmsv_wp_b64("\x04".str_pad($details['ec']['x'],32,"\0",STR_PAD_LEFT).str_pad($details['ec']['y'],32,"\0",STR_PAD_LEFT))];
    update_option('pmsv_wp_vapid',$keys,false);
    return $keys;
}
function pmsv_wp_change_push($remove) {
    if(!pmsv_wp_origin())return pmsv_wp_reply(['error'=>'Use this app to manage notifications.'],403);
    try{$d=pmsv_wp_body(4096);if(!pmsv_wp_endpoint($d['endpoint']??null)||!is_string($d['token']??null)||strlen($d['token'])<32||strlen($d['token'])>150)throw new RuntimeException();}
    catch(Throwable $e){return pmsv_wp_reply(['error'=>'Invalid notification subscription'],400);}
    global $wpdb;$now=(int)floor(microtime(true)*1000);$t=pmsv_wp_table('devices');$limits=pmsv_wp_table('limits');
    // REMOTE_ADDR is server supplied. Never trust a browser supplied forwarding header.
    $rate=hash_hmac('sha256','push:'.floor($now/3600000).':'.($_SERVER['REMOTE_ADDR']??'shared'),wp_salt('auth'));
    $wpdb->query($wpdb->prepare("DELETE FROM $limits WHERE expires_at < %d",$now));
    $wpdb->query($wpdb->prepare("INSERT INTO $limits (id,attempts,expires_at) VALUES (%s,1,%d) ON DUPLICATE KEY UPDATE attempts=attempts+1",$rate,$now+7200000));
    if($wpdb->last_error)throw new RuntimeException('Rate limit unavailable');
    if((int)$wpdb->get_var($wpdb->prepare("SELECT attempts FROM $limits WHERE id=%s",$rate))>30)return pmsv_wp_reply(['error'=>'Please try again later.'],429);
    $id=pmsv_wp_digest($d['endpoint']);$token=pmsv_wp_digest($d['token']);
    $old=$wpdb->get_var($wpdb->prepare("SELECT token_hash FROM $t WHERE id=%s",$id));
    if($old&&!hash_equals($old,$token))return pmsv_wp_reply(['error'=>'Please reset notifications in your browser and try again.'],409);
    if($remove)$result=$wpdb->query($wpdb->prepare("DELETE FROM $t WHERE id=%s AND token_hash=%s",$id,$token));
    else $result=$wpdb->query($wpdb->prepare("INSERT IGNORE INTO $t (id,endpoint,token_hash,seen_at,retry_at) VALUES (%s,%s,%s,%d,0)",$id,$d['endpoint'],$token,$now));
    if($result===false)throw new RuntimeException('Subscription write failed');
    return pmsv_wp_reply(['enabled'=>!$remove]);
}
function pmsv_wp_vapid($endpoint,$keys) {
    $u=wp_parse_url($endpoint);$head=pmsv_wp_b64(wp_json_encode(['typ'=>'JWT','alg'=>'ES256']));
    $body=pmsv_wp_b64(wp_json_encode(['aud'=>'https://'.$u['host'],'exp'=>time()+3600,'sub'=>'mailto:Pragash.ramadoss@gmail.com']));
    if(!openssl_sign($head.'.'.$body,$der,$keys['privateKey'],OPENSSL_ALGO_SHA256))throw new RuntimeException('Signing failed');
    // OpenSSL DER sequence -> fixed-width JOSE R || S, P-256 only.
    if(ord($der[0])!==48||ord($der[2])!==2)throw new RuntimeException('Invalid ECDSA signature');
    $rl=ord($der[3]);$r=substr($der,4,$rl);$pos=4+$rl;
    if(ord($der[$pos])!==2)throw new RuntimeException('Invalid ECDSA signature');
    $sl=ord($der[$pos+1]);$s=substr($der,$pos+2,$sl);
    $raw=str_pad(ltrim($r,"\0"),32,"\0",STR_PAD_LEFT).str_pad(ltrim($s,"\0"),32,"\0",STR_PAD_LEFT);
    return 'vapid t='.$head.'.'.$body.'.'.pmsv_wp_b64($raw).', k='.$keys['publicKey'];
}
function pmsv_wp_test_push() {
    if(!pmsv_wp_origin())return pmsv_wp_reply(['error'=>'Use this app to test notifications.'],403);
    try{
        $d=pmsv_wp_body(4096);
        if(!pmsv_wp_endpoint($d['endpoint']??null)||!is_string($d['token']??null)||strlen($d['token'])<32||strlen($d['token'])>150)throw new RuntimeException();
    }catch(Throwable $e){return pmsv_wp_reply(['error'=>'Invalid notification subscription'],400);}
    global $wpdb;
    $now=(int)floor(microtime(true)*1000);
    $devices=pmsv_wp_table('devices');
    $limits=pmsv_wp_table('limits');
    $rate=hash_hmac('sha256','push-test:'.floor($now/3600000).':'.($_SERVER['REMOTE_ADDR']??'shared'),wp_salt('auth'));
    $wpdb->query($wpdb->prepare("DELETE FROM $limits WHERE expires_at < %d",$now));
    $wpdb->query($wpdb->prepare("INSERT INTO $limits (id,attempts,expires_at) VALUES (%s,1,%d) ON DUPLICATE KEY UPDATE attempts=attempts+1",$rate,$now+7200000));
    if($wpdb->last_error)throw new RuntimeException('Rate limit unavailable');
    if((int)$wpdb->get_var($wpdb->prepare("SELECT attempts FROM $limits WHERE id=%s",$rate))>5)return pmsv_wp_reply(['error'=>'Please wait before sending another test notification.'],429);

    $id=pmsv_wp_digest($d['endpoint']);
    $token=pmsv_wp_digest($d['token']);
    $row=$wpdb->get_row($wpdb->prepare("SELECT endpoint,token_hash FROM $devices WHERE id=%s",$id),ARRAY_A);
    if(!$row||empty($row['token_hash'])||!hash_equals($row['token_hash'],$token))return pmsv_wp_reply(['error'=>'Notification subscription needs to be refreshed.'],409);

    $keys=pmsv_wp_keys();
    $r=wp_safe_remote_post($row['endpoint'],[
        'timeout'=>10,
        'redirection'=>0,
        'headers'=>[
            'Authorization'=>pmsv_wp_vapid($row['endpoint'],$keys),
            'TTL'=>'60',
            'Urgency'=>'high',
            'Content-Length'=>'0'
        ],
        'body'=>''
    ]);
    $code=is_wp_error($r)?0:wp_remote_retrieve_response_code($r);
    if(in_array($code,[404,410],true)){
        $wpdb->delete($devices,['id'=>$id]);
        return pmsv_wp_reply(['error'=>'This device subscription expired. Open Notifications and turn it on again.'],410);
    }
    if($code<200||$code>=300)return pmsv_wp_reply(['error'=>'Push provider did not accept the test notification.'],502);
    return pmsv_wp_reply(['accepted'=>true]);
}
function pmsv_wp_dispatch() {
    global $wpdb;$t=pmsv_wp_table('devices');$news=pmsv_wp_table('news');$latest=$wpdb->get_var("SELECT MAX(first_seen) FROM $news");
    $cutoff=(int)round((strtotime($latest?:'')?:0)*1000);$now=(int)floor(microtime(true)*1000);
    $rows=$wpdb->get_results($wpdb->prepare("SELECT id,endpoint,seen_at FROM $t WHERE seen_at < %d AND retry_at <= %d LIMIT 20",$cutoff,$now),ARRAY_A);
    if($wpdb->last_error)throw new RuntimeException('Push read failed');
    $accepted=0;$failed=0;$keys=$rows?pmsv_wp_keys():null;
    foreach($rows as $row){
        $claim=$wpdb->query($wpdb->prepare("UPDATE $t SET seen_at=%d,retry_at=%d WHERE id=%s AND seen_at=%d AND retry_at<=%d",$cutoff,$now+3600000,$row['id'],$row['seen_at'],$now));if(!$claim)continue;
        try{
            if(!pmsv_wp_endpoint($row['endpoint']))throw new RuntimeException('Invalid endpoint');
            $r=wp_safe_remote_post($row['endpoint'],['timeout'=>10,'redirection'=>0,'headers'=>['Authorization'=>pmsv_wp_vapid($row['endpoint'],$keys),'TTL'=>'86400','Urgency'=>'normal','Content-Length'=>'0'],'body'=>'']);
            $code=is_wp_error($r)?0:wp_remote_retrieve_response_code($r);
            if(in_array($code,[404,410],true)){$wpdb->delete($t,['id'=>$row['id']]);continue;}
            if($code<200||$code>=300)throw new RuntimeException('Provider declined');
            $wpdb->query($wpdb->prepare("UPDATE $t SET retry_at=0 WHERE id=%s AND seen_at=%d",$row['id'],$cutoff));
            $accepted++;
        }catch(Throwable $e){$failed++;$wpdb->query($wpdb->prepare("UPDATE $t SET seen_at=%d WHERE id=%s AND seen_at=%d",$row['seen_at'],$row['id'],$cutoff));}
    }
    $remaining=(int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $t WHERE seen_at<%d AND retry_at<=%d",$cutoff,(int)floor(microtime(true)*1000)));
    return compact('accepted','failed','remaining');
}
