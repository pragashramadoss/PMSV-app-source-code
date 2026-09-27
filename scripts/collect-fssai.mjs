// Read public FSSAI publication data without executing remote JavaScript.
// Merge into the archive; never delete stories when a source is empty or unavailable.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import ts from 'typescript';
const origin='https://www.fssai.gov.in';
const collectedAt=new Date().toISOString();
const today=collectedAt.slice(0,10);
const newsPath=new URL('../data/news.json',import.meta.url);
const previous=JSON.parse(await fs.readFile(newsPath,'utf8'));
const priorByUrl=new Map(previous.map(n=>[new URL(n.url).href,n]));
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`Source returned ${r.status}`);return r.text()}
let code;
if(process.argv[2]==='--from')code=await fs.readFile(process.argv[3],'utf8');
else{const html=await get(origin);const match=html.match(/src="([^" ]*\/assets\/[^" ]+\.js)"/);if(!match)throw Error('FSSAI source structure changed; archive preserved');code=await get(new URL(match[1],origin).href)}
const docs=[];
for(const match of code.matchAll(/\{"category":"[^{}]+?"kind":"[^" ]+"\}/g)){try{docs.push(JSON.parse(match[0]))}catch{}}
if(docs.length<10)throw Error('FSSAI publications could not be read; archive preserved');
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const byTitle=new Map(docs.map(x=>[norm(x.title),x]));
function date(s){const m=s?.match(/^(\d{2})-(\d{2})-(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:null}
const candidates=[];
function add(title,published,url,category){
 if(!published||published<'2025-01'||published>today||!title||!url||url==='#')return;
 url=new URL(url,origin).href;
 if(!/^https?:$/.test(new URL(url).protocol))return;
 const id=priorByUrl.get(url)?.id||crypto.createHash('sha256').update(url+'|'+title).digest('hex').slice(0,24);
 candidates.push({id,tab:'fssai',region:'india',title,summary:'',published,category,source:'FSSAI',url,sourceType:category==='Press release'?'Official press release':'Official document',firstSeen:collectedAt,verifiedAt:collectedAt});
}
for(const d of docs){if(['Vacancy','Tenders','Internship'].includes(d.category)||d.href==='#'||d.kind==='internal')continue;add(d.title,date(d.date),d.href,d.category==='Press Note'?'Press release':d.category)}
function literal(n){
 if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))return n.text;
 if(ts.isArrayLiteralExpression(n))return n.elements.map(literal);
 if(ts.isObjectLiteralExpression(n)){const o={};for(const p of n.properties){if(!ts.isPropertyAssignment(p))throw Error();const key=ts.isIdentifier(p.name)||ts.isStringLiteral(p.name)?p.name.text:null;if(!key)throw Error();o[key]=literal(p.initializer)}return o;}
 if(ts.isNumericLiteral(n))return Number(n.text);
 throw Error('Non-data expression');
}
const ast=ts.createSourceFile('remote-data.js',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
function visit(n){
 if(ts.isVariableDeclaration(n)&&n.initializer&&ts.isArrayLiteralExpression(n.initializer)){
  try{const months=literal(n.initializer);if(months.length&&months[0]?.month&&Array.isArray(months[0].items)){
   for(const month of months){const md=new Date('1 '+month.month+' UTC');if(!Number.isFinite(+md))continue;
    for(const item of month.items){const link=item.links?.find(l=>l.label==='English')||item.links?.[0];if(!link)continue;
     const published=date(byTitle.get(norm(item.title))?.date)||md.toISOString().slice(0,7);
     add(item.title,published,link.href||(link.file?'/docs/latest/press/'+link.file:null),'Press release');
    }
   }
  }}catch{}
 }
 ts.forEachChild(n,visit);
}
visit(ast);
const merged=new Map(previous.map(n=>[n.id,n]));
for(const n of candidates){const old=merged.get(n.id);merged.set(n.id,old?{...n,tab:old.tab,region:old.region,published:old.published.length>n.published.length?old.published:n.published,summary:old.summary,firstSeen:old.firstSeen}:n)}
await fs.writeFile(newsPath,JSON.stringify([...merged.values()],null,2)+'\n');
console.log(JSON.stringify({fssaiCandidates:candidates.length,total:merged.size,newItems:merged.size-previous.length,checkedAt:new Date().toISOString()}));
// The daily editor updates status.json only after the complete multi-source check.
