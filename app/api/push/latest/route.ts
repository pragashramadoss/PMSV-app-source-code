import {readArchive} from '@/db/archive';
export const dynamic='force-dynamic';
export async function GET(){try{const news=await readArchive();const latest=[...news].sort((a,b)=>Date.parse(String(b.firstSeen))-Date.parse(String(a.firstSeen)))[0];return Response.json({title:'PMSV Food Safety Updates',body:latest?.title||'New food safety updates are available.',url:'/',tag:'pmsv-news'},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Updates temporarily unavailable'},{status:503})}}
