import {pushDB} from '@/db/push';
import {authorizedUpdater} from '@/lib/github-updater-auth';
import {readBoundedJson} from '@/lib/request-json';
import {validUpdate,type UpdateItem} from '@/lib/updater-validation';
import {digest} from '@/lib/push-protocol';
import {readArchive} from '@/db/archive';
import sources from '@/data/updater-sources.json';
export const dynamic='force-dynamic';
export async function GET(){
 try{const row=await pushDB().prepare('SELECT value FROM push_settings WHERE id = ?').bind('updater-status').first<{value:string}>();return Response.json(row?JSON.parse(row.value):{active:false},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Updater status unavailable'},{status:503})}
}
export async function POST(request:Request){
 if(!await authorizedUpdater(request))return Response.json({error:'Updater authorization required'},{status:401});
 let data:{items:UpdateItem[];checks:{name:string;tab:string;region:string;status:string;items:number;detail:string;checkedAt:string}[]};
 try{
  data=await readBoundedJson(request,250000) as typeof data;
  if(!data||!Array.isArray(data.items)||data.items.length>40||!data.items.every(validUpdate)||!Array.isArray(data.checks)||data.checks.length>sources.length)throw Error();
  for(const c of data.checks)if(!c||!sources.some(s=>s.name===c.name&&s.tab===c.tab&&s.region===c.region)||!['ok','partial','error'].includes(c.status)||typeof c.detail!=='string'||c.detail.length>300||!Number.isInteger(c.items)||c.items<0||typeof c.checkedAt!=='string'||!Number.isFinite(Date.parse(c.checkedAt)))throw Error();
 }catch{return Response.json({error:'Invalid update batch'},{status:400})}
 try{
  await readArchive(); // Import bundled history once, before any independent additions.
  const now=new Date().toISOString();
  const statements=await Promise.all(data.items.map(async n=>pushDB().prepare(`INSERT OR IGNORE INTO news_archive (id,tab,region,title,summary,published,category,source,url,source_type,first_seen,verified_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM news_archive WHERE url = ? OR lower(title) = lower(?))`).bind('auto-'+(await digest(new URL(n.url).href)).slice(0,24),n.tab,n.region,n.title,n.summary,n.published,n.category,n.source,n.url,n.sourceType,now,now,n.url,n.title)));
  const results=statements.length?await pushDB().batch(statements):[];
  const added=results.reduce((sum,r)=>sum+(r.meta.changes||0),0);
  if(data.checks.length){
   const previous=await pushDB().prepare('SELECT value FROM push_settings WHERE id = ?').bind('updater-status').first<{value:string}>();
   const old=previous?JSON.parse(previous.value):{};
   const success=data.checks.some(c=>c.status!=='error'&&c.items>0);
   const value={active:success||old.active===true,lastAttemptAt:now,lastSuccessfulAt:success?now:old.lastSuccessfulAt||null,checks:data.checks};
   await pushDB().prepare('INSERT INTO push_settings (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind('updater-status',JSON.stringify(value)).run();
  }
  return Response.json({added,received:data.items.length});
 }catch{return Response.json({error:'Archive write failed; retry this batch'},{status:503})}
}
