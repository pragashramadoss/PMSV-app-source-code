<?php
define('ABSPATH',__DIR__);define('ARRAY_A','ARRAY_A');define('DAY_IN_SECONDS',86400);
$GLOBALS['options']=[];$GLOBALS['origin']=true;$GLOBALS['body']=[];
function get_option($k,$d=false){return $GLOBALS['options'][$k]??$d;}
function update_option($k,$v,$autoload=false){$GLOBALS['options'][$k]=$v;return true;}
function wp_parse_url($u){return parse_url($u);}
function wp_json_encode($v){return json_encode($v);}
function wp_strip_all_tags($v){return strip_tags($v);}
function wp_salt($v){return 'test-only-'.$v;}
function is_ssl(){return true;}
function pmsv_wp_origin(){return $GLOBALS['origin'];}
function pmsv_wp_body($max){return $GLOBALS['body'];}
function pmsv_wp_digest($v){return hash('sha256',$v);}
function pmsv_wp_b64($v){return rtrim(strtr(base64_encode($v),'+/','-_'),'=');}
function pmsv_wp_table($suffix){return 'test_'.$suffix;}
function pmsv_wp_endpoint($v){return is_string($v)&&str_starts_with($v,'https://fcm.googleapis.com/fcm/send/');}
function pmsv_wp_reply($body,$status=200){return ['status'=>$status,'body'=>$body];}
function pmsv_wp_base(){return '';}
function is_wp_error($r){return $r instanceof Exception;}
function wp_remote_retrieve_body($r){return $r['body']??'';}
function wp_remote_retrieve_response_code($r){return $r['code'];}
function wp_safe_remote_post($url,$args){$GLOBALS['sent']++;return $GLOBALS['provider'];}
function wp_next_scheduled($hook){return false;}
function wp_schedule_single_event($time,$hook){return true;}
function pmsv_wp_archive(){return [['title'=>'Today food safety headline','published'=>(new DateTimeImmutable('now',new DateTimeZone('Asia/Kolkata')))->format('Y-m-d'),'firstSeen'=>gmdate('c',time()-1),'tab'=>'fssai','url'=>'https://www.fssai.gov.in/test.pdf']];}
class TestDB {
 public $last_error='';public $devices=[];public $queries=[];public $transfers=0;
 function prepare($sql,...$args){return [$sql,$args];}
 function get_row($q,$mode){return $this->devices[$q[1][0]]??null;}
 function get_var($q){
  [$sql,$args]=is_array($q)?$q:[$q,[]];
  if(str_contains($sql,'SELECT attempts'))return 1;
  if(str_contains($sql,'SELECT token_hash'))return $this->devices[$args[0]]['token_hash']??null;
  $rows=$this->devices;
  if(str_contains($sql,'refresh_required=1'))return count(array_filter($rows,fn($r)=>$r['refresh_required']===1));
  $rows=array_filter($rows,fn($r)=>$r['seen_at']<$args[0]&&$r['refresh_required']===0);
  return count(array_filter($rows,fn($r)=>str_contains($sql,'retry_at>')?$r['retry_at']>$args[1]:$r['retry_at']<=$args[1]));
 }
 function get_results($q,$mode){
  [$sql,$args]=$q;
  return array_values(array_filter($this->devices,fn($r)=>$r['seen_at']<$args[0]&&$r['retry_at']<=$args[1]&&(!str_contains($sql,'refresh_required=0')||$r['refresh_required']===0)));
 }
 function query($q){
  $this->queries[]=$q;[$sql,$args]=is_array($q)?$q:[$q,[]];
  if(str_starts_with($sql,'INSERT IGNORE INTO test_devices')){
   [$id,$endpoint,$token,$now]=$args;
   $this->devices[$id]??=['id'=>$id,'endpoint'=>$endpoint,'token_hash'=>$token,'seen_at'=>$now,'retry_at'=>0,'refresh_required'=>0];
  }elseif(str_starts_with($sql,'UPDATE test_devices SET seen_at=')){
   if(str_contains($sql,'retry_at=')){
    [$seen,$retry,$id,$old,$now]=$args;
    if($this->devices[$id]['seen_at']!==$old)return 0;
    $this->devices[$id]['seen_at']=$seen;$this->devices[$id]['retry_at']=$retry;
   }else{$this->devices[$args[1]]['seen_at']=$args[0];}
  }elseif(str_starts_with($sql,'UPDATE test_devices SET retry_at=0'))$this->devices[$args[0]]['retry_at']=0;
  elseif(str_starts_with($sql,'DELETE FROM test_devices WHERE id='))unset($this->devices[$args[0]]);
  elseif(str_starts_with($sql,'INSERT IGNORE INTO test_question_watchers'))$this->transfers++;
  return 1;
 }
 function update($table,$values,$where,$formats=[],$whereFormats=[]){$this->devices[$where['id']]=array_merge($this->devices[$where['id']],$values);return 1;}
 function delete($table,$where,$formats=[]){if($table==='test_devices')unset($this->devices[$where['id']]);return 1;}
}
require __DIR__.'/../plugin/includes/push.php';
function check($value,$name){if(!$value)throw new RuntimeException($name);}
function device($endpoint,$token){$id=hash('sha256',$endpoint);return ['id'=>$id,'endpoint'=>$endpoint,'token_hash'=>hash('sha256',$token),'seen_at'=>0,'retry_at'=>0,'refresh_required'=>0];}
$oldEndpoint='https://fcm.googleapis.com/fcm/send/test-old';$newEndpoint='https://fcm.googleapis.com/fcm/send/test-new';$token=str_repeat('a',64);$newToken=str_repeat('b',64);
$wpdb=new TestDB();$old=device($oldEndpoint,$token);$wpdb->devices[$old['id']]=$old;
$GLOBALS['provider']=['code'=>403,'body'=>'VAPID public key does not match registration. PRIVATE_ENDPOINT_SENTINEL'];$GLOBALS['sent']=0;
$result=pmsv_wp_dispatch();
check($result['failed']===1&&$result['refreshRequired']===1,'403 marks exactly the failed device for renewal');
check($result['remaining']===0&&$result['pendingRetries']===0&&!$result['retryScheduled'],'authorization rejection does not cause retry loop');
check(($result['failureReasons']['vapid_key_mismatch']??0)===1,'specific provider reason is classified');
check(!str_contains(json_encode($result),'PRIVATE_ENDPOINT_SENTINEL'),'raw provider content is never returned');
pmsv_wp_dispatch();check($GLOBALS['sent']===1,'rejected registration is held until its owner renews it');
$GLOBALS['body']=['endpoint'=>$oldEndpoint,'token'=>$token];$result=pmsv_wp_change_push(false);
check($result['body']['refreshRequired']===true,'authenticated browser is told renewal is required');
$GLOBALS['body']=['endpoint'=>$newEndpoint,'token'=>$newToken,'previous'=>['endpoint'=>$oldEndpoint,'token'=>str_repeat('x',64)]];
$result=pmsv_wp_change_push(false);check($result['status']===409&&$wpdb->transfers===0,'wrong previous token cannot transfer private answer alerts');
$GLOBALS['body']['previous']['token']=$token;$result=pmsv_wp_change_push(false);
check($result['status']===200&&$result['body']['enabled'],'replacement becomes enabled');
check(!isset($wpdb->devices[$old['id']])&&$wpdb->transfers===1,'verified replacement transfers watchers and removes old device');
check(in_array('COMMIT',$wpdb->queries,true),'transfer commits as a transaction');
$wpdb=new TestDB();$old=device($oldEndpoint,$token);$wpdb->devices[$old['id']]=$old;
$GLOBALS['body']=['endpoint'=>$oldEndpoint,'token'=>$token];$result=pmsv_wp_test_push();
check($result['status']===409&&$result['body']['code']==='subscription_refresh_required','test failure directs a bounded client repair');
check($wpdb->devices[$old['id']]['refresh_required']===1,'test failure marks only its device');
foreach([['code'=>503,'body'=>'outage'],['code'=>429,'body'=>'rate limit']] as $provider){
 check(!pmsv_wp_push_requires_refresh($provider['code'],pmsv_wp_push_failure_reason($provider,$provider['code'])),'transient failures do not replace a valid subscription');
}
check(pmsv_wp_push_failure_reason(['body'=>'Invalid JWT token expired'],401)==='vapid_expired','expired signing token is distinguished');
check(pmsv_wp_push_failure_reason(['body'=>'Invalid signature'],403)==='vapid_signature_rejected','signature failure is distinguished');
echo "PASS push recovery, ownership, bounded dispatch, alert transfer and private-response redaction.\n";
