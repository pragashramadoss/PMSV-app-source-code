<?php
if (!defined('ABSPATH')) exit;

function pmsv_wp_audit_email_allowed_origin() {
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    $site=wp_parse_url(home_url());
    $own=$site['scheme'].'://'.$site['host'].(isset($site['port'])?':'.$site['port']:'');
    return in_array($origin,[$own,'https://pragashramadoss.github.io'],true);
}
function pmsv_wp_audit_email_cors() {
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    if(pmsv_wp_audit_email_allowed_origin()){
        header('Access-Control-Allow-Origin: '.$origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
}
function pmsv_wp_audit_email_preflight() {
    pmsv_wp_audit_email_cors();
    if(!pmsv_wp_audit_email_allowed_origin()){status_header(403);return;}
    status_header(204);
}
function pmsv_wp_audit_email_rate_ok() {
    global $wpdb;
    $now=(int)floor(microtime(true)*1000);
    $limits=pmsv_wp_table('limits');
    $id=hash_hmac('sha256','audit-email:'.floor($now/3600000).':'.($_SERVER['REMOTE_ADDR']??'shared'),wp_salt('auth'));
    $wpdb->query($wpdb->prepare("DELETE FROM $limits WHERE expires_at < %d",$now));
    $wpdb->query($wpdb->prepare("INSERT INTO $limits (id,attempts,expires_at) VALUES (%s,1,%d) ON DUPLICATE KEY UPDATE attempts=attempts+1",$id,$now+7200000));
    if($wpdb->last_error)throw new RuntimeException('Rate limit unavailable');
    return (int)$wpdb->get_var($wpdb->prepare("SELECT attempts FROM $limits WHERE id=%s",$id))<=8;
}
function pmsv_wp_audit_allowed_html($html) {
    $allowed=[
        'h1'=>[],'h2'=>[],'h3'=>[],'h4'=>[],'p'=>[],'br'=>[],'hr'=>[],
        'b'=>[],'strong'=>[],'em'=>[],'i'=>[],'small'=>[],'span'=>[],'div'=>[],
        'table'=>['border'=>true,'cellspacing'=>true,'cellpadding'=>true,'width'=>true],
        'thead'=>[],'tbody'=>[],'tfoot'=>[],'tr'=>[],'th'=>['colspan'=>true,'rowspan'=>true],
        'td'=>['colspan'=>true,'rowspan'=>true],'ul'=>[],'ol'=>[],'li'=>[]
    ];
    return wp_kses((string)$html,$allowed);
}
function pmsv_wp_audit_safe_csv($csv) {
    $lines=preg_split('/\r\n|\n|\r/',(string)$csv);
    $out=[];
    foreach($lines as $line){
        if($line===''){ $out[]=''; continue; }
        $row=str_getcsv($line);
        $safe=[];
        foreach($row as $cell){
            $cell=(string)$cell;
            if(preg_match('/^[=+\-@]/',$cell))$cell="'".$cell;
            $safe[]='"'.str_replace('"','""',$cell).'"';
        }
        $out[]=implode(',',$safe);
    }
    return implode("\r\n",$out);
}
function pmsv_wp_audit_ascii($s) {
    $s=wp_strip_all_tags((string)$s);
    $x=function_exists('iconv')?@iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$s):false;
    if($x!==false)$s=$x;
    return preg_replace('/[^\x20-\x7E\n\r\t]/',' ',$s);
}
function pmsv_wp_audit_pdf_escape($s) {
    return str_replace(['\\','(',')'],['\\\\','\\(','\\)'],$s);
}
function pmsv_wp_audit_pdf($text) {
    $text=pmsv_wp_audit_ascii($text);
    $raw=preg_split('/\r\n|\n|\r/',$text);
    $lines=[];
    foreach($raw as $line){
        $wrapped=wordwrap(trim($line),92,"\n",true);
        foreach(explode("\n",$wrapped) as $w)$lines[]=$w;
    }
    if(!$lines)$lines=['PMSV Audit Report'];
    $pages=array_chunk($lines,54);
    $objects=[1=>'<< /Type /Catalog /Pages 2 0 R >>',3=>'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
    $kids=[];
    foreach($pages as $i=>$page){
        $p=4+$i*2;$c=5+$i*2;$kids[]=$p.' 0 R';
        $ops=[];
        foreach($page as $line)$ops[]='('.pmsv_wp_audit_pdf_escape($line).') Tj T*';
        $stream='BT /F1 9 Tf 40 750 Td 12 TL '.implode(' ',$ops).' ET';
        $objects[$p]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents '.$c.' 0 R >>';
        $objects[$c]='<< /Length '.strlen($stream)." >>\nstream\n".$stream."\nendstream";
    }
    $objects[2]='<< /Type /Pages /Kids ['.implode(' ',$kids).'] /Count '.count($pages).' >>';
    ksort($objects);$size=max(array_keys($objects))+1;
    $pdf="%PDF-1.4\n";$offsets=[0=>0];
    for($i=1;$i<$size;$i++){ $offsets[$i]=strlen($pdf);$pdf.=$i." 0 obj\n".$objects[$i]."\nendobj\n"; }
    $xref=strlen($pdf);
    $pdf.="xref\n0 ".$size."\n0000000000 65535 f \n";
    for($i=1;$i<$size;$i++)$pdf.=str_pad((string)$offsets[$i],10,'0',STR_PAD_LEFT)." 00000 n \n";
    $pdf.="trailer\n<< /Size ".$size." /Root 1 0 R >>\nstartxref\n".$xref."\n%%EOF";
    return $pdf;
}
function pmsv_wp_audit_shared_link($title,$html) {
    $token=bin2hex(random_bytes(24));
    set_transient('pmsv_audit_share_'.$token,['title'=>$title,'html'=>$html],7*DAY_IN_SECONDS);
    return [$token,add_query_arg('pmsv_report',$token,home_url('/'))];
}
function pmsv_wp_serve_shared_audit($token) {
    if(!is_string($token)||!preg_match('/^[a-f0-9]{48}$/',$token)){status_header(404);echo 'Report not found.';return;}
    $data=get_transient('pmsv_audit_share_'.$token);
    if(!is_array($data)){status_header(410);nocache_headers();header('Content-Type: text/html; charset=UTF-8');echo '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Report expired</title><body style="font-family:system-ui;padding:32px"><h1>Report link expired</h1><p>This PMSV report link is no longer available.</p></body>';return;}
    status_header(200);nocache_headers();
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    header('Content-Type: text/html; charset=UTF-8');
    $title=esc_html($data['title']??'PMSV Audit Report');
    $html=$data['html']??'';
    echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'.$title.'</title><style>body{font-family:Arial,sans-serif;max-width:1200px;margin:0 auto;padding:24px;color:#17231f}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #b9c7c1;padding:7px;vertical-align:top}th{background:#eaf4f0}h1,h2,h3{color:#1f3f77}.expiry{background:#f4f7fb;border:1px solid #dce4ef;border-radius:10px;padding:10px 12px;margin-bottom:18px;font-size:13px}</style></head><body><div class="expiry">Private PMSV report link. This link expires automatically after 7 days.</div>'.$html.'</body></html>';
}
function pmsv_wp_audit_email() {
    pmsv_wp_audit_email_cors();
    if(!pmsv_wp_audit_email_allowed_origin())return pmsv_wp_reply(['error'=>'Open PMSV to email reports.'],403);
    if(!pmsv_wp_audit_email_rate_ok())return pmsv_wp_reply(['error'=>'Too many report emails. Please try again later.'],429);
    try{
        $d=pmsv_wp_body(380000);
        $to=is_string($d['to']??null)?trim($d['to']):'';
        $format=$d['format']??'';
        $kind=$d['kind']??'';
        $subject=is_string($d['subject']??null)?sanitize_text_field($d['subject']):'';
        $html=is_string($d['html']??null)?$d['html']:'';
        $text=is_string($d['text']??null)?$d['text']:'';
        $csv=is_string($d['csv']??null)?$d['csv']:'';
        if(!is_email($to)||strlen($to)>254)throw new RuntimeException('email');
        if(!in_array($format,['pdf','word','excel'],true)||!in_array($kind,['audit','nc'],true))throw new RuntimeException('format');
        if($subject===''||strlen($subject)>180||strlen($html)<20||strlen($html)>180000||strlen($text)<20||strlen($text)>100000||strlen($csv)>180000)throw new RuntimeException('content');
    }catch(Throwable $e){return pmsv_wp_reply(['error'=>'Invalid report email request.'],400);}

    $safe_html=pmsv_wp_audit_allowed_html($html);
    [$token,$link]=pmsv_wp_audit_shared_link($subject,$safe_html);
    $base=sanitize_file_name(preg_replace('/\s+/','-',trim($subject)));
    if($base==='')$base='PMSV-Audit-Report';

    if($format==='pdf'){
        $filename=$base.'.pdf';$bytes=pmsv_wp_audit_pdf($text);
    }elseif($format==='word'){
        $filename=$base.'.doc';
        $bytes='<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial}table{border-collapse:collapse;width:100%}th,td{border:1px solid #777;padding:6px;vertical-align:top}th{background:#eaf4f0}</style></head><body>'.$safe_html.'</body></html>';
    }else{
        $filename=$base.'.csv';$bytes="\xEF\xBB\xBF".pmsv_wp_audit_safe_csv($csv);
    }

    $dir=get_temp_dir();
    $filename=wp_unique_filename($dir,$filename);
    $path=trailingslashit($dir).$filename;
    if(file_put_contents($path,$bytes)===false){delete_transient('pmsv_audit_share_'.$token);return pmsv_wp_reply(['error'=>'Could not prepare the attachment.'],500);}

    $body="Please find the PMSV ".($kind==='nc'?'NC report':'audit report')." attached.\n\nView the report online for 7 days:\n".$link."\n\nPMSV Audits:\n".home_url('/audits/index.html');
    $sent=wp_mail($to,$subject,$body,['Content-Type: text/plain; charset=UTF-8'],[$path]);
    @unlink($path);
    if(!$sent){delete_transient('pmsv_audit_share_'.$token);return pmsv_wp_reply(['error'=>'Email delivery could not be started. Please try again.'],502);}
    return pmsv_wp_reply(['sent'=>true,'reportUrl'=>$link,'expiresInDays'=>7]);
}
