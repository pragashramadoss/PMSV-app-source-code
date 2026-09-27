import {authorizedUpdater} from '@/lib/github-updater-auth';
import {env} from 'cloudflare:workers';
import {dispatch} from '@/db/push';
import {authorizedDispatch} from '@/lib/dispatch-auth';
export const dynamic='force-dynamic';
// Private publication operation. Reading news and device opt-in remain public.
export async function POST(request:Request){
 if(!await authorizedDispatch(request,env.PMSV_DISPATCH_SECRET)&&!await authorizedUpdater(request))return Response.json({error:'Publisher authorization required.'},{status:401,headers:{'Cache-Control':'no-store'}});
 try{return Response.json(await dispatch(),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Notification delivery temporarily unavailable.'},{status:503})}
}
