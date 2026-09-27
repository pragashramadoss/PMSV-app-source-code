import {readBoundedJson} from '@/lib/request-json';
import {pushDB,signingKeys,rateLimit} from '@/db/push';
import {digest,validEndpoint} from '@/lib/push-protocol';
import {sameOrigin} from '@/lib/subscription-validation';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json({publicKey:(await signingKeys()).publicKey},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Notifications are temporarily unavailable.'},{status:503})}}
async function change(request:Request,remove=false){
 if(!sameOrigin(request))return Response.json({error:'Use this app to manage notifications.'},{status:403});
 try{
  const d=await readBoundedJson(request,4096) as {endpoint:unknown;token:unknown};
  if(!validEndpoint(d.endpoint)||typeof d.token!=='string'||d.token.length<32||d.token.length>150)throw Error('Invalid notification subscription');
  if(!await rateLimit(request))return Response.json({error:'Please try again later.'},{status:429});
  const db=pushDB(),id=await digest(d.endpoint),token=await digest(d.token);
  const old=await db.prepare('SELECT token_hash FROM push_devices WHERE id = ?').bind(id).first<{token_hash:string}>();
  if(old&&old.token_hash!==token)return Response.json({error:'Please reset notifications in your browser and try again.'},{status:409});
  if(remove)await db.prepare('DELETE FROM push_devices WHERE id = ? AND token_hash = ?').bind(id,token).run();
  else await db.prepare('INSERT OR IGNORE INTO push_devices (id,endpoint,token_hash,seen_at,retry_at) VALUES (?,?,?,?,0)').bind(id,d.endpoint,token,Date.now()).run();
  return Response.json({enabled:!remove},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Could not save notification settings. Please try again.'},{status:400})}
}
export const POST=(r:Request)=>change(r);
export const DELETE=(r:Request)=>change(r,true);
