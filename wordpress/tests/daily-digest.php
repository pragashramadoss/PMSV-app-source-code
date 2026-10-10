<?php
define('ABSPATH', __DIR__);
function wp_strip_all_tags($s){return strip_tags($s);}
function pmsv_wp_base(){return '';}
require __DIR__.'/../plugin/includes/push.php';
function check($ok,$label){if(!$ok)throw new RuntimeException($label);echo "PASS: $label\n";}
function row($title,$day,$seen,$extra=[]){return array_merge(['title'=>$title,'published'=>$day,'firstSeen'=>$seen,'tab'=>'general','url'=>'https://example.test/'.rawurlencode($title)],$extra);}
$now=new DateTimeImmutable('2026-10-10T03:14:00Z');
$rows=[
 row('Old story imported today','2026-10-09','2026-10-10T03:13:00Z'),
 row('First headline','2026-10-10','2026-10-10T03:12:00Z'),
 row('Second headline','2026-10-10','2026-10-10T03:11:00Z'),
 row('Third headline','2026-10-10','2026-10-10T03:10:00Z'),
 row('Fourth headline','2026-10-10','2026-10-10T03:09:00Z'),
 row('Future headline','2026-10-11','2026-10-10T03:14:00Z'),
 row('Blog post','2026-10-10','2026-10-10T03:14:00Z',['tab'=>'blogs'])
];
$d=pmsv_wp_daily_digest($rows,$now);
check($d['title']==='PMSV — 10 Oct 2026 News','Indian calendar date in title');
check($d['headlines']===['First headline','Second headline','Third headline'],'top three excludes old, future and blogs');
check($d['body']==="1. First headline\n2. Second headline\n3. Third headline",'three numbered headlines');
check($d['cutoff']===strtotime('2026-10-10T03:12:00Z')*1000,'old import cannot advance dispatch cutoff');
$d=pmsv_wp_daily_digest([$rows[0],$rows[1]],$now);
check($d['count']===1 && !str_contains($d['body'],'Old story'),'no old-news padding');
$d=pmsv_wp_daily_digest([$rows[0]],$now);
check($d['count']===0 && $d['cutoff']===0,'empty day has no dispatchable digest');
$d=pmsv_wp_daily_digest([$rows[1],$rows[1],$rows[2]],$now);
check($d['count']===2,'duplicate headlines removed');
$d=pmsv_wp_daily_digest($rows,new DateTimeImmutable('2026-10-09T18:31:00Z'));
check($d['date']==='2026-10-10','IST midnight before UTC midnight');
$d=pmsv_wp_daily_digest($rows,new DateTimeImmutable('2026-10-10T18:29:00Z'));
check($d['ttl']===60,'queued push expires at Indian midnight');
$d=pmsv_wp_daily_digest($rows,new DateTimeImmutable('2026-10-10T18:30:00Z'));
check($d['date']==='2026-10-11' && $d['headlines']===['Future headline'],'next Indian day changes digest');
echo "Daily notification checks passed.\n";
