import {readArchive} from '@/db/archive';
export const dynamic='force-dynamic';
export async function GET(){
 try{return Response.json({news:await readArchive()},{headers:{'Cache-Control':'no-store'}})}
 catch(error){console.error('News archive read failed',error);return Response.json({error:'Archive temporarily unavailable'},{status:503})}
}
