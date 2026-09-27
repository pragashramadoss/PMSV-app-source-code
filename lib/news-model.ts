export type News={id:string;tab:string;region?:string;title:string;summary:string;published:string;category:string;source:string;url:string;sourceType:string;firstSeen:string;verifiedAt:string;tags?:string[]};
export const regions=[
 {id:'india',code:'IN',name:'India',agency:'FSSAI',description:'Food Safety and Standards Authority of India',detail:'Official FSSAI website notifications, advisories, orders and press releases.'},
 {id:'us',code:'US',name:'United States',agency:'US FDA',description:'U.S. Food and Drug Administration',detail:'FDA food-program announcements, guidance, recalls and food safety news from the United States.'},
 {id:'eu',code:'EU',name:'European Union',agency:'European Commission · EFSA',description:'Food legislation and scientific assessments',detail:'EU food-policy announcements and EFSA assessments. Scientific opinions and consultations are labelled separately from adopted requirements.'},
 {id:'uk',code:'UK',name:'United Kingdom',agency:'FSA · Food Standards Scotland',description:'UK food safety authorities',detail:'Food Standards Agency and Food Standards Scotland updates, recalls, enforcement and food safety news.'},
 {id:'australia',code:'AU',name:'Australia',agency:'FSANZ · State authorities',description:'Food Standards Australia New Zealand',detail:'FSANZ standards announcements and Australian food safety news. FSANZ is a joint Australia–New Zealand standards body.'}
];
export type View={kind:'home'|'updates'|'regulatory'|'country'|'news'|'feed'|'topic'|'blogs'|'blog-tag';region?:string;topic?:string;body?:string;tag?:string};
export function regionName(id:string){return regions.find(r=>r.id===id)?.name||(id==='global'?'International':id)}
export function blogTagSlug(tag:string){return tag.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'uncategorized'}
export function blogTags(n:News){const tags=Array.isArray(n.tags)?n.tags.filter(t=>typeof t==='string'&&t.trim()).map(t=>t.trim()):[];return tags.length?Array.from(new Set(tags)):['Uncategorized']}
export function isFssaiWebsite(n:News){try{return /(^|\.)fssai\.gov\.in$/.test(new URL(n.url).hostname)}catch{return false}}
export function classifyNews(n:News):News{
 if((n.region||'india')!=='india'||!['general','fssai'].includes(n.tab))return n;
 return {...n,tab:isFssaiWebsite(n)?'fssai':'general'};
}
export function isFoodNews(n:News){return (n.region||'india')==='india'?classifyNews(n).tab==='general': !['quality','excellence','certifications','blogs'].includes(n.tab)&&(n.tab==='general'||/press|recall|outbreak|scientific|enforcement|media|news/i.test(n.category))}
export function safeSourceUrl(value:unknown):value is string {
 if(typeof value!=='string')return false;
 try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}
}
export function selectNews(news:News[],region='all',kind='all',query=''){
 const searchText=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=searchText(query.trim());
 const inRegion=(n:News)=>region==='all'||(region==='global'?(n.region||'india')!=='india':(n.region||'india')===region);
 const filtered=news.map(classifyNews).filter(n=>safeSourceUrl(n.url)&&inRegion(n)&&(kind==='all'||(kind==='official'?n.tab==='fssai':kind==='news'?isFoodNews(n):kind==='regulatory'?n.tab==='fssai':n.tab===kind))&&searchText(`${n.title} ${n.summary} ${n.source} ${n.category} ${n.published} ${regionName(n.region||'india')}`).includes(q)).sort((a,b)=>b.published.localeCompare(a.published)||a.title.localeCompare(b.title));
 const seen=new Set<string>();return filtered.filter(n=>{let key=n.url;try{const u=new URL(n.url);u.hash='';key=u.href}catch{}if(seen.has(key))return false;seen.add(key);return true});
}
export function dateLabel(s:string){return new Date((s.length===7?s+'-01':s)+'T12:00:00Z').toLocaleDateString('en-IN',{...(s.length===7?{}:{day:'numeric' as const}),month:'short',year:'numeric'})}

export function indiaToday(now=new Date()){
 return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function dailyHighlights(items:News[],today=indiaToday()){
 const sorted=selectNews(items);
 if(!sorted.length)return [];
 const current=sorted.filter(n=>n.published===today);
 const displayDay=current.length?today:sorted[0].published;
 const dayItems=sorted.filter(n=>n.published===displayDay);
 return [...dayItems,...sorted.filter(n=>n.published<displayDay).slice(0,Math.max(0,3-dayItems.length))];
}

export function sectionHighlights(items:News[],view:View,today=indiaToday()){
 const tab=view.kind==='home'||view.kind==='updates'?null:view.kind==='regulatory'?'fssai':view.kind==='news'||view.kind==='feed'?'general':view.kind==='blogs'||view.kind==='blog-tag'?'blogs':view.kind==='topic'?view.topic:null;
 return dailyHighlights(tab?items.map(classifyNews).filter(n=>n.tab===tab):items,today);
}
