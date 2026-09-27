import {env} from 'cloudflare:workers';
import {readArchive} from './archive';
import {authorization,encode,digest,validEndpoint} from '@/lib/push-protocol';
export function pushDB(){if(!env.DB)throw Error('Notifications unavailable');return env.DB}
export async function signingKeys(){
 const db=pushDB();let row=await db.prepare('SELECT value FROM push_settings WHERE id = ?').bind('vapid').first<{value:string}>();
 if(!row){const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const jwk=await crypto.subtle.exportKey('jwk',pair.privateKey);const publicKey=encode(new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey)));await db.prepare('INSERT OR IGNORE INTO push_settings (id,value) VALUES (?,?)').bind('vapid',JSON.stringify({jwk,publicKey})).run();row=await db.prepare('SELECT value FROM push_settings WHERE id = ?').bind('vapid').first<{value:string}>()}
 return JSON.parse(row!.value) as {jwk:JsonWebKey;publicKey:string};
}

export async function dispatch(limit=20){
 await readArchive();
 const db=pushDB(),now=Date.now();
 const latest=await db.prepare('SELECT MAX(first_seen) AS latest FROM news_archive').first<{latest:string|null}>();
 const cutoff=Date.parse(latest?.latest||'')||0;
 const rows=await db.prepare('SELECT id,endpoint,seen_at FROM push_devices WHERE seen_at < ? AND retry_at <= ? LIMIT ?').bind(cutoff,now,limit).all<{id:string;endpoint:string;seen_at:number}>();
 let accepted=0,failed=0;const keys=rows.results.length?await signingKeys():null;
 for(const row of rows.results){
  // Atomic cursor claim prevents repeated or concurrent publication triggers from spamming a device.
  const claim=await db.prepare('UPDATE push_devices SET seen_at = ?,retry_at = ? WHERE id = ? AND seen_at = ? AND retry_at <= ?').bind(cutoff,now+3600000,row.id,row.seen_at,now).run();if(!claim.meta.changes)continue;
  try{if(!validEndpoint(row.endpoint))throw Error('Invalid endpoint');
   const response=await fetch(row.endpoint,{method:'POST',redirect:'manual',headers:{Authorization:await authorization(row.endpoint,keys!.jwk,keys!.publicKey),TTL:'86400',Urgency:'normal','Content-Length':'0'},signal:AbortSignal.timeout(10000)});
   if(response.status===404||response.status===410){await db.prepare('DELETE FROM push_devices WHERE id = ?').bind(row.id).run();continue}
   if(!response.ok)throw Error('Push service declined');accepted++;
  }catch{failed++;await db.prepare('UPDATE push_devices SET seen_at = ? WHERE id = ? AND seen_at = ?').bind(row.seen_at,row.id,cutoff).run()}
 }
 const pending=await db.prepare('SELECT COUNT(*) AS count FROM push_devices WHERE seen_at < ? AND retry_at <= ?').bind(cutoff,Date.now()).first<{count:number}>();
 return {accepted,failed,remaining:pending?.count||0};
}
export async function rateLimit(request:Request){const now=Date.now();await pushDB().prepare('DELETE FROM subscription_limits WHERE expires_at < ?').bind(new Date(now).toISOString()).run();const id=await digest('push:'+Math.floor(now/3600000)+':'+(request.headers.get('cf-connecting-ip')||'shared'));const row=await pushDB().prepare('INSERT INTO subscription_limits (id,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(id,new Date(now+7200000).toISOString()).first<{attempts:number}>();return (row?.attempts||0)<=30}
