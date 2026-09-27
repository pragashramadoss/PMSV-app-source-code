import sources from '@/data/professional-sources.json';
import type {News} from './news-model';
export const bodyId=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
export const professionalBodies=sources.map(s=>({...s,id:bodyId(s.name)}));
export function belongsToBody(n:News,body:typeof professionalBodies[number]){
 if(n.source===body.name||(n.tab==='certifications'&&n.source===body.name+' · Media coverage'))return true;
 try{return new URL(n.url).hostname.replace(/^www\./,'')===new URL(body.url).hostname.replace(/^www\./,'')}catch{return false}
}
