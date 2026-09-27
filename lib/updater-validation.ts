import sources from '@/data/updater-sources.json';
export type UpdateItem={title:string;published:string;url:string;tab:string;region:string;source:string;sourceType:string;summary:string;category:string};
export function validUpdate(n:UpdateItem){
 if(!n||!['title','published','url','tab','region','source','sourceType','summary','category'].every(k=>typeof n[k as keyof UpdateItem]==='string'))return false;
 if(n.title.length<(n.tab==='blogs'?1:12)||n.title.length>800||n.summary.length>600||n.url.length>2000||n.category.length>100||n.sourceType.length>80)return false;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(n.published)||!Number.isFinite(Date.parse(n.published))||new Date(n.published).toISOString().slice(0,10)!==n.published)return false;
 if(n.published<'2025-01-01'||n.published>new Date().toISOString().slice(0,10))return false;
 try{const u=new URL(n.url);if(u.protocol!=='https:'||u.username||u.password||u.hash||u.port)return false;
  const media=sources.find(s=>s.tab==='certifications'&&n.tab===s.tab&&n.region===s.region&&n.source===s.name+' · Media coverage'&&'mediaHosts' in s&&Array.isArray(s.mediaHosts)&&s.mediaHosts.includes(u.hostname));
  if(media)return n.sourceType==='Media report · '+u.hostname&&n.category===media.category.split(' · ')[0]+' · '+media.name+' coverage';
  const source=sources.find(s=>s.name===n.source&&s.tab===n.tab&&s.region===n.region&&(new URL(s.url).hostname.replace(/^www\./,'')===u.hostname.replace(/^www\./,'')||('allowedHosts' in s&&Array.isArray(s.allowedHosts)&&s.allowedHosts.includes(u.hostname))));
  if(!source)return false;
  if("postPath" in source&&typeof source.postPath==="string"&&!new RegExp(source.postPath,"i").test(u.pathname))return false;
  if(n.tab==='certifications'&&(!/^(Quality|Food safety|Excellence) · /.test(n.category)||!new RegExp(source.filter||'standard|scheme','i').test(n.title)))return false;
  return true;
 }catch{return false}
}
