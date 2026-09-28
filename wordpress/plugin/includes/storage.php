<?php
if (!defined('ABSPATH')) exit;
function pmsv_wp_table($suffix) { global $wpdb; return $wpdb->prefix.'pmsv_app_'.$suffix; }
function pmsv_wp_install() {
    global $wpdb; require_once ABSPATH.'wp-admin/includes/upgrade.php'; $charset=$wpdb->get_charset_collate();
    $news=pmsv_wp_table('news');$devices=pmsv_wp_table('devices');$limits=pmsv_wp_table('limits');
    dbDelta("CREATE TABLE $news (id varchar(100) NOT NULL, url_hash char(64) NOT NULL, title_hash char(64) NOT NULL, published varchar(10) NOT NULL, first_seen varchar(32) NOT NULL, payload longtext NOT NULL, PRIMARY KEY (id), KEY url_hash (url_hash), KEY title_hash (title_hash), KEY published (published)) $charset;");
    // Preserve separate source records even when they share a document URL.
    $indexes=$wpdb->get_results("SHOW INDEX FROM $news");
    foreach($indexes as $index)if($index->Key_name==='url_hash' && (int)$index->Non_unique===0){
        $wpdb->query("ALTER TABLE $news DROP INDEX url_hash");
        $wpdb->query("CREATE INDEX url_hash ON $news (url_hash)");
    }
    dbDelta("CREATE TABLE $devices (id varchar(64) NOT NULL, endpoint text NOT NULL, token_hash varchar(64) NOT NULL, seen_at bigint NOT NULL, retry_at bigint NOT NULL DEFAULT 0, PRIMARY KEY (id), KEY seen_at (seen_at)) $charset;");
    dbDelta("CREATE TABLE $limits (id varchar(64) NOT NULL, attempts int NOT NULL, expires_at bigint NOT NULL, PRIMARY KEY (id)) $charset;");
    // Seed is a read-only export of real news, never sample data. Re-activation cannot overwrite newer records.
    $rows=json_decode(file_get_contents(PMSV_WP_DIR.'archive-seed.json'),true,512,JSON_THROW_ON_ERROR);
    foreach($rows as $n)pmsv_wp_insert($n);
    add_option('pmsv_wp_schema',1,'',false);
}
function pmsv_wp_insert($n) {
    global $wpdb; $t=pmsv_wp_table('news');
    $result=$wpdb->query($wpdb->prepare("INSERT IGNORE INTO $t (id,url_hash,title_hash,published,first_seen,payload) VALUES (%s,%s,%s,%s,%s,%s)",$n['id'],hash('sha256',$n['url']),hash('sha256',strtolower($n['title'])),$n['published'],$n['firstSeen'],wp_json_encode($n)));
    if($result===false)throw new RuntimeException('Archive insert failed');return $result;
}
function pmsv_wp_summary_is_useful($title,$summary) {
    $title=trim(wp_strip_all_tags((string)$title));$summary=trim(wp_strip_all_tags((string)$summary));
    if(strlen($summary)<45)return false;
    $norm=function($s){$s=strtolower($s);$s=preg_replace('/[^a-z0-9]+/',' ',$s);return trim($s);};
    $t=$norm($title);$s=$norm($summary);
    if($s===''||$s===$t)return false;
    $boiler=preg_replace('/^(?:the\s+)?[^:]{1,80}\s+(?:reported on|published an? update on|shared an? update on)\s*:\s*/i','',$summary);
    if(rtrim($norm($boiler),' .')===rtrim($t,' .'))return false;
    return true;
}
function pmsv_wp_with_summary($n) {
    if(!is_array($n))return $n;
    $title=(string)($n['title']??'');$summary=(string)($n['summary']??'');
    if(pmsv_wp_summary_is_useful($title,$summary))return $n;
    $n['summary']='';
    return $n;
}
function pmsv_wp_native_blogs() {
    $posts=get_posts(['post_type'=>'post','post_status'=>'publish','numberposts'=>-1,'orderby'=>'date','order'=>'DESC','suppress_filters'=>false]);
    $items=[];
    foreach($posts as $post){
        $tags=wp_get_post_tags($post->ID,['fields'=>'names']);
        $tags=is_array($tags)?array_values(array_filter(array_map('wp_strip_all_tags',$tags))):[];
        $excerpt=has_excerpt($post)?get_the_excerpt($post):wp_trim_words(wp_strip_all_tags($post->post_content),55,'…');
        $items[]=[
            'id'=>'wp-blog-'.$post->ID,'tab'=>'blogs','region'=>'global',
            'title'=>wp_strip_all_tags(get_the_title($post)),'summary'=>wp_strip_all_tags($excerpt),
            'published'=>get_post_time('Y-m-d',true,$post),'category'=>$tags[0]??'Uncategorized','tags'=>$tags,
            'source'=>'Pragash Ramadoss','url'=>get_permalink($post),'sourceType'=>'Author blog',
            'firstSeen'=>get_post_time('c',true,$post),'verifiedAt'=>get_post_modified_time('c',true,$post)
        ];
    }
    return $items;
}
function pmsv_wp_archive() {
    global $wpdb;$t=pmsv_wp_table('news');$rows=$wpdb->get_col("SELECT payload FROM $t ORDER BY published DESC");
    if($wpdb->last_error)throw new RuntimeException('Archive read failed');
    $news=array_map(fn($r)=>pmsv_wp_with_summary(json_decode($r,true,512,JSON_THROW_ON_ERROR)),$rows);
    $news=array_values(array_filter($news,fn($n)=>($n['tab']??'')!=='blogs'));
    $news=array_merge($news,pmsv_wp_native_blogs());
    usort($news,fn($a,$b)=>strcmp($b['published'],$a['published'])?:strcmp($a['title'],$b['title']));return $news;
}
function pmsv_wp_valid_item($n,$sources) {
    if(!is_array($n))return false;
    foreach(['title','published','url','tab','region','source','sourceType','summary','category'] as $k)if(!is_string($n[$k]??null))return false;
    if(isset($n['tags'])){if(!is_array($n['tags'])||count($n['tags'])>20)return false;foreach($n['tags'] as $tag)if(!is_string($tag)||$tag===''||strlen($tag)>300)return false;}
    if(strlen($n['title'])<($n['tab']==='blogs'?1:12)||strlen($n['title'])>2400||strlen($n['summary'])>1800||strlen($n['url'])>2000||strlen($n['category'])>300||strlen($n['sourceType'])>240)return false;
    if(!preg_match('/^\d{4}-\d{2}-\d{2}$/',$n['published'])||!checkdate((int)substr($n['published'],5,2),(int)substr($n['published'],8,2),(int)substr($n['published'],0,4))||$n['published']<'2025-01-01'||$n['published']>gmdate('Y-m-d'))return false;
    $u=wp_parse_url($n['url']);if(!is_array($u)||($u['scheme']??'')!=='https'||isset($u['user'])||isset($u['pass'])||isset($u['port'])||isset($u['fragment']))return false;
    foreach($sources as $s){
        if($s['tab']!==$n['tab']||$s['region']!==$n['region'])continue;
        if($n['tab']==='certifications'&&$n['source']===$s['name'].' · Media coverage'&&in_array($u['host'],$s['mediaHosts']??[],true))return $n['sourceType']==='Media report · '.$u['host']&&$n['category']===explode(' · ',$s['category'])[0].' · '.$s['name'].' coverage';
        if($s['name']!==$n['source'])continue;
        $host=wp_parse_url($s['url'],PHP_URL_HOST);
        if(preg_replace('/^www\./','',$host)!==preg_replace('/^www\./','',$u['host'])&&!in_array($u['host'],$s['allowedHosts']??[],true))continue;
        if(isset($s['postPath'])&&!preg_match('~'.str_replace('~','\\~',$s['postPath']).'~i',$u['path']??''))return false;
        if($n['tab']==='certifications'&&(!preg_match('/^(Quality|Food safety|Excellence) · /',$n['category'])||!preg_match('~'.str_replace('~','\\~',$s['filter']??'standard|scheme').'~i',$n['title'])))return false;
        return true;
    }return false;
}
function pmsv_wp_ingest() {
    try{$data=pmsv_wp_body(250000);$sources=json_decode(file_get_contents(PMSV_WP_DIR.'updater-sources.json'),true);
        if(!isset($data['items'],$data['checks'])||!is_array($data['items'])||!is_array($data['checks'])||count($data['items'])>40||count($data['checks'])>count($sources))throw new RuntimeException();
        foreach($data['items'] as $n)if(!pmsv_wp_valid_item($n,$sources))throw new RuntimeException();
        foreach($data['checks'] as $c){$known=false;foreach($sources as $s)if(($c['name']??'')===$s['name']&&($c['tab']??'')===$s['tab']&&($c['region']??'')===$s['region'])$known=true;
            if(!$known||!in_array($c['status']??'',['ok','partial','error'],true)||!is_string($c['detail']??null)||strlen($c['detail'])>900||!is_int($c['items']??null)||$c['items']<0||!is_string($c['checkedAt']??null)||strtotime($c['checkedAt'])===false)throw new RuntimeException();}
    }catch(Throwable $e){return pmsv_wp_reply(['error'=>'Invalid update batch'],400);}
    global $wpdb;$t=pmsv_wp_table('news');$now=gmdate('Y-m-d\TH:i:s.000\Z');$added=0;$updated=0;
    foreach($data['items'] as $n){
        $existing=$wpdb->get_row($wpdb->prepare("SELECT id,payload FROM $t WHERE url_hash=%s OR title_hash=%s LIMIT 1",hash('sha256',$n['url']),hash('sha256',strtolower($n['title']))),ARRAY_A);
        if($existing){
            $old=json_decode($existing['payload'],true);$changed=false;
            if(is_array($old)){
                // Enrich an existing story instead of discarding better metadata merely because its URL already exists.
                if(trim((string)($old['summary']??''))===''&&trim((string)($n['summary']??''))!==''){$old['summary']=$n['summary'];$changed=true;}
                if(($n['tab']??'')==='blogs'&&!empty($n['tags'])){
                    if(($old['tags']??[])!==$n['tags']){$old['tags']=$n['tags'];$changed=true;}
                    if(($old['category']??'')!==$n['category']){$old['category']=$n['category'];$changed=true;}
                }
                if($changed){
                    $old['verifiedAt']=$now;
                    $result=$wpdb->update($t,['payload'=>wp_json_encode($old)],['id'=>$existing['id']],['%s'],['%s']);
                    if($result!==false)$updated++;
                }
            }
            continue;
        }
        $n['id']='auto-'.substr(pmsv_wp_digest($n['url']),0,24);$n['firstSeen']=$now;$n['verifiedAt']=$now;$added+=pmsv_wp_insert($n);
    }
    if($data['checks']){$old=get_option('pmsv_wp_updater',[]);$success=false;foreach($data['checks'] as $c)if($c['status']!=='error'&&$c['items']>0)$success=true;
        update_option('pmsv_wp_updater',['active'=>$success||($old['active']??false),'lastAttemptAt'=>$now,'lastSuccessfulAt'=>$success?$now:($old['lastSuccessfulAt']??null),'checks'=>$data['checks']],false);}
    return pmsv_wp_reply(['added'=>$added,'updated'=>$updated,'received'=>count($data['items'])]);
}
