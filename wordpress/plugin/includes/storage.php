<?php
if (!defined('ABSPATH')) exit;
function pmsv_wp_table($suffix) { global $wpdb; return $wpdb->prefix.'pmsv_app_'.$suffix; }
function pmsv_wp_install() {
    global $wpdb; require_once ABSPATH.'wp-admin/includes/upgrade.php'; $charset=$wpdb->get_charset_collate();
    $news=pmsv_wp_table('news');$devices=pmsv_wp_table('devices');$limits=pmsv_wp_table('limits');$questions=pmsv_wp_table('questions');$answers=pmsv_wp_table('answers');$reports=pmsv_wp_table('reports');
    dbDelta("CREATE TABLE $news (id varchar(100) NOT NULL, url_hash char(64) NOT NULL, title_hash char(64) NOT NULL, published varchar(10) NOT NULL, first_seen varchar(32) NOT NULL, payload longtext NOT NULL, PRIMARY KEY (id), KEY url_hash (url_hash), KEY title_hash (title_hash), KEY published (published)) $charset;");
    // Preserve separate source records even when they share a document URL.
    $indexes=$wpdb->get_results("SHOW INDEX FROM $news");
    foreach($indexes as $index)if($index->Key_name==='url_hash' && (int)$index->Non_unique===0){
        $wpdb->query("ALTER TABLE $news DROP INDEX url_hash");
        $wpdb->query("CREATE INDEX url_hash ON $news (url_hash)");
    }
    dbDelta("CREATE TABLE $devices (id varchar(64) NOT NULL, endpoint text NOT NULL, token_hash varchar(64) NOT NULL, seen_at bigint NOT NULL, retry_at bigint NOT NULL DEFAULT 0, PRIMARY KEY (id), KEY seen_at (seen_at)) $charset;");
    dbDelta("CREATE TABLE $limits (id varchar(64) NOT NULL, attempts int NOT NULL, expires_at bigint NOT NULL, PRIMARY KEY (id)) $charset;");
    dbDelta("CREATE TABLE $questions (id bigint unsigned NOT NULL AUTO_INCREMENT, author varchar(80) NOT NULL, title varchar(190) NOT NULL, body text NOT NULL, category varchar(32) NOT NULL, created_at bigint NOT NULL, last_activity bigint NOT NULL, status varchar(20) NOT NULL DEFAULT 'published', fingerprint char(64) NOT NULL, PRIMARY KEY (id), KEY status_activity (status,last_activity), KEY category (category)) $charset;");
    dbDelta("CREATE TABLE $answers (id bigint unsigned NOT NULL AUTO_INCREMENT, question_id bigint unsigned NOT NULL, author varchar(80) NOT NULL, body text NOT NULL, created_at bigint NOT NULL, status varchar(20) NOT NULL DEFAULT 'published', fingerprint char(64) NOT NULL, PRIMARY KEY (id), KEY question_status (question_id,status), KEY created_at (created_at)) $charset;");
    dbDelta("CREATE TABLE $reports (id bigint unsigned NOT NULL AUTO_INCREMENT, target_type varchar(12) NOT NULL, target_id bigint unsigned NOT NULL, reason varchar(32) NOT NULL, created_at bigint NOT NULL, fingerprint char(64) NOT NULL, status varchar(20) NOT NULL DEFAULT 'open', PRIMARY KEY (id), UNIQUE KEY target_reporter (target_type,target_id,fingerprint), KEY target_status (target_type,target_id,status), KEY created_at (created_at)) $charset;");
    // Seed is a read-only export of real news, never sample data. Re-activation cannot overwrite newer records.
    $rows=json_decode(file_get_contents(PMSV_WP_DIR.'archive-seed.json'),true,512,JSON_THROW_ON_ERROR);
    foreach($rows as $n)pmsv_wp_insert($n);
    update_option('pmsv_wp_schema',3,false);
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


function pmsv_wp_forum_clean($value,$max) {
    if(!is_string($value))return '';
    $value=wp_strip_all_tags($value);
    $value=preg_replace("/\r\n?/", "\n", $value);
    $value=preg_replace("/[ \t]+/", " ", $value);
    $value=preg_replace("/\n{3,}/", "\n\n", $value);
    $value=trim($value);
    return strlen($value)>$max?substr($value,0,$max):$value;
}
function pmsv_wp_forum_fingerprint() {
    $ip=(string)($_SERVER['REMOTE_ADDR']??'');$ua=(string)($_SERVER['HTTP_USER_AGENT']??'');
    return hash('sha256',$ip.'|'.$ua.'|'.wp_salt('nonce'));
}
function pmsv_wp_forum_rate($action,$limit,$window) {
    global $wpdb;$t=pmsv_wp_table('limits');$now=(int)floor(microtime(true)*1000);
    $id='forum:'.substr(hash('sha256',$action.'|'.pmsv_wp_forum_fingerprint()),0,56);
    $wpdb->query($wpdb->prepare("DELETE FROM $t WHERE expires_at < %d",$now));
    $wpdb->query($wpdb->prepare("INSERT INTO $t (id,attempts,expires_at) VALUES (%s,1,%d) ON DUPLICATE KEY UPDATE attempts=attempts+1",$id,$now+($window*1000)));
    if($wpdb->last_error)throw new RuntimeException('Rate limit unavailable');
    return (int)$wpdb->get_var($wpdb->prepare("SELECT attempts FROM $t WHERE id=%s",$id))<=$limit;
}
function pmsv_wp_forum_disallowed($text) {
    if(preg_match('~(?:https?://|www\.|\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b)~i',$text))return true;
    if(preg_match('/(?:\+?\d[\s().-]*){8,}/',$text))return true;
    return preg_match('/\b(?:buy now|for sale|discount|promo(?:tion)? code|whatsapp|telegram|dm me|contact me|call me|crypto|bitcoin|casino|betting|loan offer|real estate|job vacancy|hiring now|affiliate|sponsored)\b/i',$text)===1;
}
function pmsv_wp_forum_relevant($category,$text) {
    $patterns=[
      'food-safety'=>'food safety|haccp|fssai|ccp\b|oprp\b|\bprp\b|allergen|hygiene|sanitation|pathogen|microbiolog|contaminat|pest control|recall|traceability|shelf life|\bgmp\b|\bghp\b|\bfsms\b|fssc|brcgs|\bsqf\b|ifs food|iso 22000|food fraud|taccp|vaccp|cleaning|disinfection|foreign body|foodborne|packaging|cold chain|temperature control|food plant|food factory|food manufacturing|dairy|meat|milk|bakery|biscuit|snack|noodle|spice|chocolate|confection',
      'quality'=>'quality management|quality assurance|quality control|\bqms\b|iso 9001|\bcapa\b|root cause|\brca\b|nonconform|deviation|defect|specification|supplier quality|customer complaint|calibration|inspection|audit|\bspc\b|control chart|process capability|\bcpk\b|\bppk\b|measurement system|\bmsa\b|gage r|first time right|cost of poor quality|\bcopq\b|sampling|acceptance criteria|verification|validation|quality',
      'process-excellence'=>'process excellence|continuous improvement|lean|six sigma|dmaic|kaizen|\b5s\b|\boee\b|value stream|\bvsm\b|\bsmed\b|takt|cycle time|\bfmea\b|poka.?yoke|\bdoe\b|process capability|\bcpk\b|\bppk\b|pareto|fishbone|hypothesis test|anova|regression|control chart|variation|waste reduction|standard work|bottleneck|throughput|process improvement'
    ];
    if(!isset($patterns[$category]))return false;
    return preg_match('~'.$patterns[$category].'~i',$text)===1;
}
function pmsv_wp_forum_question_row($r) {
    return ['id'=>(string)$r['id'],'title'=>$r['title'],'body'=>$r['body'],'category'=>$r['category'],'name'=>$r['author'],'createdAt'=>gmdate('c',(int)$r['created_at']),'answerCount'=>(int)($r['answer_count']??0),'lastActivityAt'=>gmdate('c',(int)$r['last_activity'])];
}
function pmsv_wp_forum_questions() {
    global $wpdb;$q=pmsv_wp_table('questions');$a=pmsv_wp_table('answers');
    $rows=$wpdb->get_results("SELECT q.*, (SELECT COUNT(*) FROM $a a WHERE a.question_id=q.id AND a.status='published') answer_count FROM $q q WHERE q.status='published' ORDER BY q.last_activity DESC LIMIT 100",ARRAY_A);
    if($wpdb->last_error)throw new RuntimeException('Discussion read failed');
    return array_map('pmsv_wp_forum_question_row',$rows);
}
function pmsv_wp_forum_detail($id) {
    global $wpdb;$q=pmsv_wp_table('questions');$a=pmsv_wp_table('answers');
    $row=$wpdb->get_row($wpdb->prepare("SELECT q.*, (SELECT COUNT(*) FROM $a a WHERE a.question_id=q.id AND a.status='published') answer_count FROM $q q WHERE q.id=%d AND q.status='published'",$id),ARRAY_A);
    if(!$row)return null;
    $answers=$wpdb->get_results($wpdb->prepare("SELECT id,question_id,author,body,created_at FROM $a WHERE question_id=%d AND status='published' ORDER BY created_at ASC",$id),ARRAY_A);
    if($wpdb->last_error)throw new RuntimeException('Discussion read failed');
    return ['question'=>pmsv_wp_forum_question_row($row),'answers'=>array_map(fn($r)=>['id'=>(string)$r['id'],'questionId'=>(string)$r['question_id'],'name'=>$r['author'],'body'=>$r['body'],'createdAt'=>gmdate('c',(int)$r['created_at'])],$answers)];
}
function pmsv_wp_forum_create_question() {
    if(!pmsv_wp_origin())return pmsv_wp_reply(['error'=>'Please post from the PMSV app.'],403);
    if(!pmsv_wp_forum_rate('question',5,3600))return pmsv_wp_reply(['error'=>'Too many questions. Please try again later.'],429);
    $d=pmsv_wp_body(12000);$name=pmsv_wp_forum_clean($d['name']??'',40);$title=pmsv_wp_forum_clean($d['title']??'',180);$body=pmsv_wp_forum_clean($d['body']??'',3000);$category=(string)($d['category']??'');
    if(strlen($name)<2||strlen($title)<12||strlen($body)<20||!in_array($category,['food-safety','quality','process-excellence'],true))return pmsv_wp_reply(['error'=>'Please complete the name, topic, title and question details.'],400);
    $all=$title.' '.$body;
    if(pmsv_wp_forum_disallowed($all))return pmsv_wp_reply(['error'=>'Links, contact details, advertisements and promotional content are not allowed.'],400);
    if(!pmsv_wp_forum_relevant($category,$all))return pmsv_wp_reply(['error'=>'This question does not appear to match the selected PMSV topic. Please keep discussions to Food Safety, Quality or Process Excellence.'],400);
    global $wpdb;$q=pmsv_wp_table('questions');$now=time();
    $ok=$wpdb->insert($q,['author'=>$name,'title'=>$title,'body'=>$body,'category'=>$category,'created_at'=>$now,'last_activity'=>$now,'status'=>'published','fingerprint'=>pmsv_wp_forum_fingerprint()],['%s','%s','%s','%s','%d','%d','%s','%s']);
    if(!$ok)throw new RuntimeException('Question insert failed');
    return pmsv_wp_reply(['id'=>(string)$wpdb->insert_id],201);
}
function pmsv_wp_forum_create_answer($id) {
    if(!pmsv_wp_origin())return pmsv_wp_reply(['error'=>'Please post from the PMSV app.'],403);
    if(!pmsv_wp_forum_rate('answer',20,3600))return pmsv_wp_reply(['error'=>'Too many answers. Please try again later.'],429);
    $detail=pmsv_wp_forum_detail($id);if(!$detail)return pmsv_wp_reply(['error'=>'Question not found.'],404);
    $d=pmsv_wp_body(7000);$name=pmsv_wp_forum_clean($d['name']??'',40);$body=pmsv_wp_forum_clean($d['body']??'',2000);
    if(strlen($name)<2||strlen($body)<5)return pmsv_wp_reply(['error'=>'Please enter your display name and answer.'],400);
    if(pmsv_wp_forum_disallowed($body))return pmsv_wp_reply(['error'=>'Links, contact details, advertisements and promotional content are not allowed.'],400);
    global $wpdb;$a=pmsv_wp_table('answers');$q=pmsv_wp_table('questions');$now=time();
    $ok=$wpdb->insert($a,['question_id'=>$id,'author'=>$name,'body'=>$body,'created_at'=>$now,'status'=>'published','fingerprint'=>pmsv_wp_forum_fingerprint()],['%d','%s','%s','%d','%s','%s']);
    if(!$ok)throw new RuntimeException('Answer insert failed');
    $wpdb->update($q,['last_activity'=>$now],['id'=>$id],['%d'],['%d']);
    return pmsv_wp_reply(['id'=>(string)$wpdb->insert_id],201);
}

function pmsv_wp_forum_create_report() {
    if(!pmsv_wp_origin())return pmsv_wp_reply(['error'=>'Please report from the PMSV app.'],403);
    if(!pmsv_wp_forum_rate('report',12,3600))return pmsv_wp_reply(['error'=>'Too many reports. Please try again later.'],429);
    $d=pmsv_wp_body(3000);
    $type=(string)($d['targetType']??'');$id=(int)($d['targetId']??0);$reason=(string)($d['reason']??'');
    if(!in_array($type,['question','answer'],true)||$id<1||!in_array($reason,['off-topic','spam','inappropriate','other'],true))return pmsv_wp_reply(['error'=>'Invalid report.'],400);
    global $wpdb;$table=$type==='question'?pmsv_wp_table('questions'):pmsv_wp_table('answers');
    $exists=(int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table WHERE id=%d AND status='published'",$id));
    if(!$exists)return pmsv_wp_reply(['error'=>'Item not found.'],404);
    $reports=pmsv_wp_table('reports');$fingerprint=pmsv_wp_forum_fingerprint();
    $wpdb->query($wpdb->prepare("INSERT IGNORE INTO $reports (target_type,target_id,reason,created_at,fingerprint,status) VALUES (%s,%d,%s,%d,%s,'open')",$type,$id,$reason,time(),$fingerprint));
    if($wpdb->last_error)throw new RuntimeException('Report insert failed');
    return pmsv_wp_reply(['reported'=>true],201);
}
