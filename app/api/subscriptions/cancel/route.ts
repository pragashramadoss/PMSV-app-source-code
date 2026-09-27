import {readBoundedJson} from '@/lib/request-json';
import {env} from 'cloudflare:workers';
import {hash,sameOrigin} from '@/lib/subscription-validation';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Open your private management link to remove the request.'},{status:403});
 try{const d=await readBoundedJson(request,256) as {token:unknown};if(typeof d.token!=='string'||!/^[a-f0-9-]{72}$/.test(d.token))return Response.json({error:'This management link is invalid.'},{status:400});
  if(!env.DB)throw Error();await env.DB.prepare('DELETE FROM subscriptions WHERE cancel_token_hash = ?').bind(await hash(d.token)).run();
  return Response.json({removed:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Unable to remove the request. Please try again.'},{status:503})}
}
