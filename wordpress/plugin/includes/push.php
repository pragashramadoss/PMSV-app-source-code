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
    $old=$wpdb->get_row($wpdb->prepare("SELECT token_hash,refresh_required FROM $t WHERE id=%s",$id),ARRAY_A);
    if($old&&!hash_equals($old['token_hash'],$token))return pmsv_wp_reply(['error'=>'Please reset notifications in your browser and try again.'],409);
    $previous=null;
    if(!$remove&&isset($d['previous'])){
        $p=$d['previous'];
        if(!is_array($p)||!pmsv_wp_endpoint($p['endpoint']??null)||!is_string($p['token']??null)||strlen($p['token'])<32||strlen($p['token'])>150)return pmsv_wp_reply(['error'=>'Invalid previous subscription'],400);
        $previous=pmsv_wp_digest($p['endpoint']);
        if($previous===$id)return pmsv_wp_reply(['error'=>'Replacement subscription must be new'],409);
        $owner=$wpdb->get_var($wpdb->prepare("SELECT token_hash FROM $t WHERE id=%s",$previous));
        if($owner&&!hash_equals($owner,pmsv_wp_digest($p['token'])))return pmsv_wp_reply(['error'=>'Previous subscription could not be verified'],409);
        if(!$owner)$previous=null;
    }
    if($remove)$result=$wpdb->query($wpdb->prepare("DELETE FROM $t WHERE id=%s AND token_hash=%s",$id,$token));
    else $result=$wpdb->query($wpdb->prepare("INSERT IGNORE INTO $t (id,endpoint,token_hash,seen_at,retry_at) VALUES (%s,%s,%s,%d,0)",$id,$d['endpoint'],$token,$now));
    if($result===false)throw new RuntimeException('Subscription write failed');
    // INSERT IGNORE can race another registration: recheck ownership before transfer.
    if(!$remove){
        $stored=$wpdb->get_var($wpdb->prepare("SELECT token_hash FROM $t WHERE id=%s",$id));
        if(!is_string($stored)||!hash_equals($stored,$token))return pmsv_wp_reply(['error'=>'Notification subscription needs to be refreshed.'],409);
    }
    if($previous)pmsv_wp_transfer_push_device($previous,$id);
    // Same-origin, HttpOnly cookie lets the service worker retrieve only this browser's
    // private queued answer alerts. The push itself remains payload-free.
    if($remove){
        $wpdb->delete(pmsv_wp_table('question_watchers'),['device_id'=>$id],['%s']);
        $wpdb->delete(pmsv_wp_table('push_alerts'),['device_id'=>$id],['%s']);
        pmsv_wp_push_device_cookie('',0);
    }else pmsv_wp_push_device_cookie($id.'.'.pmsv_wp_device_signature($id,$token),time()+90*DAY_IN_SECONDS);
    $refreshRequired=!$remove&&!empty($old['refresh_required']);
    return pmsv_wp_reply(['enabled'=>!$remove&&!$refreshRequired,'refreshRequired'=>$refreshRequired]);
}

/** Called only after both old and replacement device ownership have been verified. */
function pmsv_wp_transfer_push_device($previous,$id) {
    global $wpdb;
    $watch=pmsv_wp_table('question_watchers');$alerts=pmsv_wp_table('push_alerts');$devices=pmsv_wp_table('devices');
    $wpdb->query('START TRANSACTION');
    try {
        $queries=[
            $wpdb->prepare("INSERT IGNORE INTO $watch (question_id,device_id,created_at) SELECT question_id,%s,created_at FROM $watch WHERE device_id=%s",$id,$previous),
            $wpdb->prepare("UPDATE $alerts SET device_id=%s WHERE device_id=%s",$id,$previous),
            $wpdb->prepare("DELETE FROM $watch WHERE device_id=%s",$previous),
            $wpdb->prepare("DELETE FROM $devices WHERE id=%s",$previous)
        ];
        foreach($queries as $query)if($wpdb->query($query)===false)throw new RuntimeException('Subscription transfer failed');
        $wpdb->query('COMMIT');
    } catch(Throwable $e) {$wpdb->query('ROLLBACK');throw $e;}
}

/** Return an allowlisted reason only, never the provider's raw response or endpoint. */
function pmsv_wp_push_failure_reason($response,$code) {
    if(is_wp_error($response))return 'transport_error';
    $body=strtolower(substr((string)wp_remote_retrieve_body($response),0,16384));
    if(str_contains($body,'vapid')&&(str_contains($body,'mismatch')||str_contains($body,'do not correspond')||str_contains($body,'does not match')))return 'vapid_key_mismatch';
    if(str_contains($body,'expired')&&(str_contains($body,'jwt')||str_contains($body,'token')))return 'vapid_expired';
    if(str_contains($body,'signature')&&(str_contains($body,'invalid')||str_contains($body,'verify')))return 'vapid_signature_rejected';
    if(in_array($code,[401,403],true)||str_contains($body,'unauthorizedregistration'))return 'authorization_rejected';
    return $code?'http_'.$code:'transport_error';
}

function pmsv_wp_push_requires_refresh($code,$reason) {
    return in_array($code,[401,403],true)||$reason==='vapid_key_mismatch';
}

function pmsv_wp_mark_push_refresh($id) {
    global $wpdb;
    if($wpdb->update(pmsv_wp_table('devices'),['refresh_required'=>1],['id'=>$id],['%d'],['%s'])===false)throw new RuntimeException('Subscription state unavailable');
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
    if($code<200||$code>=300){
        $reason=pmsv_wp_push_failure_reason($r,$code);
        if(pmsv_wp_push_requires_refresh($code,$reason)){
            pmsv_wp_mark_push_refresh($id);
            return pmsv_wp_reply(['error'=>'The push provider rejected this registration. Refresh notifications and test again.','code'=>'subscription_refresh_required','reason'=>$reason],409);
        }
        return pmsv_wp_reply(['error'=>'Push provider did not accept the test notification.','reason'=>$reason],502);
    }
    return pmsv_wp_reply(['accepted'=>true]);
}
function pmsv_wp_daily_digest($news, $now=null) {
    $now=($now??new DateTimeImmutable('now'))->setTimezone(new DateTimeZone('Asia/Kolkata'));
    $day=$now->format('Y-m-d');
    $eligible=array_values(array_filter($news,fn($n)=>
        ($n['published']??'')===$day &&
        in_array($n['tab']??'',['general','fssai','quality','excellence','certifications'],true) &&
        trim((string)($n['title']??''))!==''
    ));
    usort($eligible,fn($a,$b)=>strcmp($b['firstSeen']??'',$a['firstSeen']??'')?:strcmp($a['title'],$b['title']));
    $headlines=[];$seenTitles=[];$seenUrls=[];$cutoff=0;
    foreach($eligible as $n) {
        $cutoff=max($cutoff,(int)((strtotime($n['firstSeen']??'')?:0)*1000));
        $title=trim(preg_replace('/\s+/u',' ',wp_strip_all_tags($n['title'])));
        $key=strtolower($title);$url=$n['url']??'';
        if(isset($seenTitles[$key])||($url!==''&&isset($seenUrls[$url])))continue;
        $seenTitles[$key]=true;if($url!=='')$seenUrls[$url]=true;
        if(count($headlines)<3)$headlines[]=$title;
    }
    $body=$headlines?implode("\n",array_map(fn($i,$h)=>($i+1).'. '.$h,array_keys($headlines),$headlines)):
        'No verified headlines published today are available yet.';
    return ['title'=>'PMSV — '.$now->format('j M Y').' News','body'=>$body,
        'url'=>pmsv_wp_base().'/','tag'=>'pmsv-news','date'=>$day,'headlines'=>$headlines,
        'count'=>count($headlines),'cutoff'=>$cutoff,
        'ttl'=>max(1,$now->modify('tomorrow')->setTime(0,0)->getTimestamp()-$now->getTimestamp())];
}

function pmsv_wp_retryable_push_status($code) {
    return $code===0 || $code===429 || ($code>=500 && $code<=599);
}

/** Schedule a bounded follow-up only for transient provider errors. WP-Cron requires site traffic. */
function pmsv_wp_schedule_push_retry() {
    $day=(new DateTimeImmutable('now',new DateTimeZone('Asia/Kolkata')))->format('Y-m-d');
    $state=get_option('pmsv_wp_push_retry_state',[]);
    $attempts=is_array($state)&&($state['day']??'')===$day?(int)($state['attempts']??0):0;
    if($attempts>=2)return false;
    if(wp_next_scheduled('pmsv_wp_retry_push'))return true;
    $scheduled=wp_schedule_single_event(time()+660,'pmsv_wp_retry_push');
    if($scheduled)update_option('pmsv_wp_push_retry_state',['day'=>$day,'attempts'=>$attempts+1],false);
    return (bool)$scheduled;
}

function pmsv_wp_dispatch() {
    global $wpdb;$t=pmsv_wp_table('devices');
    $digest=pmsv_wp_daily_digest(pmsv_wp_archive());
    if(!$digest['count'])return ['accepted'=>0,'failed'=>0,'remaining'=>0,'reason'=>'No headlines published today'];
    $cutoff=$digest['cutoff'];$now=(int)floor(microtime(true)*1000);
    $rows=$wpdb->get_results($wpdb->prepare("SELECT id,endpoint,seen_at FROM $t WHERE seen_at < %d AND retry_at <= %d AND refresh_required=0 LIMIT 20",$cutoff,$now),ARRAY_A);
    if($wpdb->last_error)throw new RuntimeException('Push read failed');
    $accepted=0;$failed=0;$expired=0;$retryable=0;$failureCodes=[];$failureReasons=[];$keys=$rows?pmsv_wp_keys():null;
    foreach($rows as $row){
        // Atomic claim prevents the main updater and a WordPress retry from sending twice.
        // An unsuccessful claim is eligible again after ten minutes, not immediately.
        $claim=$wpdb->query($wpdb->prepare("UPDATE $t SET seen_at=%d,retry_at=%d WHERE id=%s AND seen_at=%d AND retry_at<=%d",$cutoff,$now+600000,$row['id'],$row['seen_at'],$now));
        if(!$claim)continue;
        $reason='internal';$detail='internal';$canRetry=false;
        try{
            if(!pmsv_wp_endpoint($row['endpoint'])){$reason='invalid_endpoint';throw new RuntimeException('Invalid endpoint');}
            $r=wp_safe_remote_post($row['endpoint'],[
                'timeout'=>10,'redirection'=>0,
                'headers'=>['Authorization'=>pmsv_wp_vapid($row['endpoint'],$keys),
                    'TTL'=>(string)$digest['ttl'],'Urgency'=>'normal','Content-Length'=>'0'],
                'body'=>''
            ]);
            $code=is_wp_error($r)?0:(int)wp_remote_retrieve_response_code($r);
            if(in_array($code,[404,410],true)){$wpdb->delete($t,['id'=>$row['id']]);$expired++;continue;}
            if($code<200||$code>=300){
                $reason=$code?'http_'.$code:'transport_error';
                $detail=pmsv_wp_push_failure_reason($r,$code);
                if(pmsv_wp_push_requires_refresh($code,$detail))pmsv_wp_mark_push_refresh($row['id']);
                $canRetry=pmsv_wp_retryable_push_status($code);
                throw new RuntimeException('Provider declined');
            }
            $wpdb->query($wpdb->prepare("UPDATE $t SET retry_at=0 WHERE id=%s AND seen_at=%d",$row['id'],$cutoff));
            $accepted++;
        }catch(Throwable $e){
            $failed++;
            $failureCodes[$reason]=($failureCodes[$reason]??0)+1;
            $failureReasons[$detail]=($failureReasons[$detail]??0)+1;
            if($canRetry)$retryable++;
            // Restore only the unsent cursor; the retry clock stays in place.
            $wpdb->query($wpdb->prepare("UPDATE $t SET seen_at=%d WHERE id=%s AND seen_at=%d",$row['seen_at'],$row['id'],$cutoff));
        }
    }
    $checkedAt=(int)floor(microtime(true)*1000);
    $remaining=(int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $t WHERE seen_at<%d AND retry_at<=%d AND refresh_required=0",$cutoff,$checkedAt));
    $pendingRetries=(int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $t WHERE seen_at<%d AND retry_at>%d AND refresh_required=0",$cutoff,$checkedAt));
    $refreshRequired=(int)$wpdb->get_var("SELECT COUNT(*) FROM $t WHERE refresh_required=1");
    $retryScheduled=$retryable>0?pmsv_wp_schedule_push_retry():false;
    // Aggregate codes only: never return endpoints, device IDs, tokens or signing keys.
    return compact('accepted','failed','remaining','expired','pendingRetries','failureCodes','failureReasons','refreshRequired','retryScheduled');
}

/**
 * Discussion answer alerts reuse the registered VAPID subscription and never
 * send sensitive data to the third-party push provider.
 */
function pmsv_wp_device_signature($id,$token_hash) {
    return hash_hmac('sha256',$id.'|'.$token_hash,wp_salt('secure_auth'));
}
function pmsv_wp_push_device_cookie($value,$expiry) {
    setcookie('pmsv_push_device',$value,[
        'expires'=>$expiry,'path'=>'/','secure'=>is_ssl(),
        'httponly'=>true,'samesite'=>'Strict'
    ]);
}
function pmsv_wp_forum_verified_device($endpoint,$token) {
    if(!pmsv_wp_endpoint($endpoint)||!is_string($token)||strlen($token)<32||strlen($token)>150)return null;
    global $wpdb;
    $id=pmsv_wp_digest($endpoint);
    $expected=pmsv_wp_digest($token);
    $stored=$wpdb->get_var($wpdb->prepare("SELECT token_hash FROM ".pmsv_wp_table('devices')." WHERE id=%s",$id));
    return is_string($stored)&&hash_equals($stored,$expected)?$id:null;
}
function pmsv_wp_push_cookie_device() {
    $cookie=$_COOKIE['pmsv_push_device']??'';
    if(!is_string($cookie)||!preg_match('/^([a-f0-9]{64})\\.([a-f0-9]{64})$/D',$cookie,$parts))return null;
    global $wpdb;
    $id=$parts[1];
    $token_hash=$wpdb->get_var($wpdb->prepare("SELECT token_hash FROM ".pmsv_wp_table('devices')." WHERE id=%s",$id));
    if(!is_string($token_hash))return null;
    return hash_equals(pmsv_wp_device_signature($id,$token_hash),$parts[2])?$id:null;
}
function pmsv_wp_forum_push_inbox() {
    $id=pmsv_wp_push_cookie_device();
    if(!$id)return pmsv_wp_reply(['alert'=>null]);
    global $wpdb;
    $alerts=pmsv_wp_table('push_alerts');$q=pmsv_wp_table('questions');
    // Old failed deliveries should not turn a later daily news push into an old alert.
    $wpdb->query($wpdb->prepare("DELETE FROM $alerts WHERE created_at < %d",time()-DAY_IN_SECONDS));
    $row=$wpdb->get_row($wpdb->prepare(
        "SELECT a.id,a.question_id,a.answer_id,q.title FROM $alerts a JOIN $q q ON q.id=a.question_id WHERE a.device_id=%s AND q.status='published' ORDER BY a.id ASC LIMIT 1",$id
    ),ARRAY_A);
    if($wpdb->last_error)throw new RuntimeException('Discussion inbox unavailable');
    if(!$row)return pmsv_wp_reply(['alert'=>null]);
    $wpdb->delete($alerts,['id'=>(int)$row['id'],'device_id'=>$id],['%d','%s']);
    $title=wp_strip_all_tags($row['title']);
    return pmsv_wp_reply(['alert'=>[
        'title'=>'PMSV Discussions — New answer',
        'body'=>'Someone answered: '.mb_substr($title,0,110),
        'url'=>pmsv_wp_base().'/discussions/'.(int)$row['question_id'].'#answer-'.(int)$row['answer_id'],
        'tag'=>'pmsv-answer-'.(int)$row['answer_id']
    ]]);
}
function pmsv_wp_forum_push_answer($question_id,$answer_id) {
    global $wpdb;
    $watch=pmsv_wp_table('question_watchers');$devices=pmsv_wp_table('devices');
    $alerts=pmsv_wp_table('push_alerts');
    $rows=$wpdb->get_results($wpdb->prepare(
        "SELECT d.id,d.endpoint FROM $watch w INNER JOIN $devices d ON w.device_id=d.id WHERE w.question_id=%d AND d.refresh_required=0 LIMIT 5",$question_id
    ),ARRAY_A);
    if(!$rows||$wpdb->last_error)return;
    $keys=pmsv_wp_keys();
    foreach($rows as $row){
        if(!pmsv_wp_endpoint($row['endpoint']))continue;
        $wpdb->insert($alerts,[
            'device_id'=>$row['id'],'question_id'=>$question_id,
            'answer_id'=>$answer_id,'created_at'=>time()
        ],['%s','%d','%d','%d']);
        if(!$wpdb->insert_id)continue;
        $pending_id=(int)$wpdb->insert_id;
        $r=wp_safe_remote_post($row['endpoint'],[
            'timeout'=>6,'redirection'=>0,
            'headers'=>['Authorization'=>pmsv_wp_vapid($row['endpoint'],$keys),'TTL'=>'86400','Urgency'=>'normal','Content-Length'=>'0'],
            'body'=>''
        ]);
        $code=is_wp_error($r)?0:wp_remote_retrieve_response_code($r);
        if(pmsv_wp_push_requires_refresh($code,pmsv_wp_push_failure_reason($r,$code)))pmsv_wp_mark_push_refresh($row['id']);
        if(in_array($code,[404,410],true)){
            $wpdb->delete($devices,['id'=>$row['id']],['%s']);
            $wpdb->delete($watch,['device_id'=>$row['id']],['%s']);
        }
        if($code<200||$code>=300)$wpdb->delete($alerts,['id'=>$pending_id],['%d']);
    }
}
