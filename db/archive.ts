import {env} from 'cloudflare:workers';
import news from '@/data/news.json';
import {digest} from '@/lib/push-protocol';
export async function readArchive(){
 const db=env.DB;
 if(!db)throw new Error('Archive database unavailable');
 const version='archive-v2:'+await digest(JSON.stringify(news));
 const imported=await db.prepare('SELECT id FROM editions WHERE id = ?').bind(version).first();
 if(!imported){
  for(let i=0;i<news.length;i+=40){
   await db.batch(news.slice(i,i+40).map(n=>db.prepare(`INSERT INTO news_archive (id,tab,region,title,summary,published,category,source,url,source_type,first_seen,verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET region=excluded.region,tab=excluded.tab,title=excluded.title,summary=excluded.summary,published=excluded.published,category=excluded.category,url=excluded.url,source=excluded.source,source_type=excluded.source_type,verified_at=excluded.verified_at`).bind(n.id,n.tab,n.region||'india',n.title,n.summary,n.published,n.category,n.source,n.url,n.sourceType,n.firstSeen,n.verifiedAt)));
  }
  await db.prepare('INSERT OR IGNORE INTO editions (id,imported_at) VALUES (?,?)').bind(version,new Date().toISOString()).run();
 }
 const rows=await db.prepare('SELECT id,tab,region,title,summary,published,category,source,url,source_type AS sourceType,first_seen AS firstSeen,verified_at AS verifiedAt FROM news_archive ORDER BY published DESC,title ASC').all();
 return rows.results;
}
