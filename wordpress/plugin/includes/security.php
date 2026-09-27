<?php
if (!defined('ABSPATH')) exit;
function pmsv_wp_b64($s) { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function pmsv_wp_unb64($s) { return base64_decode(strtr($s, '-_', '+/'), true); }
function pmsv_wp_digest($s) { return pmsv_wp_b64(hash('sha256', $s, true)); }
function pmsv_wp_der($tag,$s) { $n=strlen($s); $len=$n<128?chr($n):chr(0x80+strlen(ltrim(pack('N',$n),"\0"))).ltrim(pack('N',$n),"\0"); return chr($tag).$len.$s; }
function pmsv_wp_integer($s) { $s=ltrim($s,"\0"); if($s==='' || ord($s[0])>127)$s="\0".$s; return pmsv_wp_der(2,$s); }
function pmsv_wp_authorized() {
    $auth=$_SERVER['HTTP_AUTHORIZATION']??'';
    if(!str_starts_with($auth,'Bearer ')||strlen($auth)>16000)return false;
    $parts=explode('.',substr($auth,7)); if(count($parts)!==3)return false;
    $h=json_decode(pmsv_wp_unb64($parts[0])?:'',true); $c=json_decode(pmsv_wp_unb64($parts[1])?:'',true); $now=time();
    $repo='pragashramadoss/pmsv-updater';
    if(($h['alg']??'')!=='RS256'||!is_string($h['kid']??null)||!is_array($c))return false;
    foreach(['iss'=>'https://token.actions.githubusercontent.com','aud'=>'pmsv-updater','repository'=>$repo,'repository_id'=>'1370842496','repository_owner_id'=>'329360973','ref'=>'refs/heads/main','workflow_ref'=>$repo.'/.github/workflows/update.yml@refs/heads/main'] as $k=>$v)if(($c[$k]??null)!==$v)return false;
    if(!in_array($c['event_name']??'', ['schedule','workflow_dispatch','push'],true))return false;
    foreach(['exp','nbf','iat'] as $k)if(!is_numeric($c[$k]??null))return false;
    if($c['exp']<=$now||$c['nbf']>$now+30||$c['iat']>$now+30||$now-$c['iat']>=600)return false;
    $keys=get_transient('pmsv_wp_oidc_keys');
    if(!$keys){$r=wp_safe_remote_get('https://token.actions.githubusercontent.com/.well-known/jwks',['timeout'=>10,'redirection'=>0]); if(is_wp_error($r)||wp_remote_retrieve_response_code($r)!==200)return false; $keys=json_decode(wp_remote_retrieve_body($r),true)['keys']??[]; set_transient('pmsv_wp_oidc_keys',$keys,300);}
    foreach($keys as $key)if(($key['kid']??'')===$h['kid']&&($key['kty']??'')==='RSA'){
        $der=pmsv_wp_der(0x30,pmsv_wp_integer(pmsv_wp_unb64($key['n'])).pmsv_wp_integer(pmsv_wp_unb64($key['e'])));
        $pem="-----BEGIN RSA PUBLIC KEY-----\n".chunk_split(base64_encode($der),64,"\n")."-----END RSA PUBLIC KEY-----\n";
        return openssl_verify($parts[0].'.'.$parts[1],pmsv_wp_unb64($parts[2]),$pem,OPENSSL_ALGO_SHA256)===1;
    } return false;
}
function pmsv_wp_body($max) {
    $raw=file_get_contents('php://input',false,null,0,$max+1);
    if(strlen($raw)>$max)throw new RuntimeException('Body too large');
    $data=json_decode($raw,true,32,JSON_THROW_ON_ERROR); if(!is_array($data))throw new RuntimeException('Invalid JSON'); return $data;
}
function pmsv_wp_origin() {
    $origin=$_SERVER['HTTP_ORIGIN']??''; $site=wp_parse_url(home_url());
    return $origin===($site['scheme'].'://'.$site['host'].(isset($site['port'])?':'.$site['port']:''));
}
function pmsv_wp_endpoint($value) {
    if(!is_string($value)||strlen($value)>2048)return false;
    $u=wp_parse_url($value); return is_array($u)&&($u['scheme']??'')==='https'&&!isset($u['user'])&&!isset($u['pass'])&&!isset($u['port'])&&!isset($u['fragment'])&&in_array($u['host']??'',['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'],true)&&strlen($u['path']??'')>10;
}
