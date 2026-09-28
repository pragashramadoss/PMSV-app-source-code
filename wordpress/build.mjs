import {cp,mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','wordpress/vite.config.mjs'],{stdio:'inherit'});if(result.status)process.exit(result.status);
const target=path.join(root,'wordpress/plugin');await cp('public',target+'/public',{recursive:true});

const auditDir=path.join(target,'public/audits');
const auditWorkspacePages=new Set(['index.html','fssai-inspection-app.html','fssai-inspection.html','hygiene-rating-home.html','hygiene-rating-new.html']);
const scheduleChecklistPages=new Set(['general-manufacturing.html','milk-processing.html','meat-processing.html','fish-processing.html','slaughter-house.html','catering.html','retail.html','transport.html','storage-warehouse.html']);
const hygieneChecklistPages=new Set(['hygiene-rating.html','hygiene-rating-sweet-shop.html','hygiene-rating-meat.html']);

const auditShell=`
<aside class="pmsv-audit-nav" aria-label="PMSV workspace">
  <div class="nav-caption">WORKSPACE</div>
  <a class="workspace-link" href="../updates"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2.5"/><path d="M8 7h6M8 11h6"/></svg></span><span>Updates/News</span></a>
  <a class="workspace-link active" href="index.html" aria-current="page"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span><span>Audits</span></a>
  <a class="workspace-link" href="../blogs"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H9a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H2z"/><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H15a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h7z"/></svg></span><span>Blogs</span></a>
  <div class="nav-bottom"><img src="../brand/pmsv-family.png?v=0.5.14" alt="PMSV family logo"><span>PMSV<small>Food Safety &amp; Quality Forum</small></span></div>
</aside>
<div class="pmsv-audit-masthead">
  <a class="pmsv-audit-brand" href="../">
    <span class="pmsv-audit-brand-logo"><img src="../brand/pmsv-family.png?v=0.5.14" alt="PMSV family logo"></span>
    <span><span class="pmsv-audit-brand-name">PMSV <span>Food Safety &amp; Quality Forum</span></span><span class="pmsv-audit-brand-sub">FOOD SAFETY · QUALITY · EXCELLENCE</span></span>
  </a>
  <a class="pmsv-audit-home" href="../">← Back to Forum Home</a>
</div>`;

const scheduleScoring=`<section class="pmsv-rules"><h3>Scoring Table</h3><table class="rules-table"><thead><tr><th>Assessment</th><th>Normal Requirement</th><th>Critical Requirement (*)</th></tr></thead><tbody><tr><td><b>C — Compliance</b></td><td>2 marks</td><td>4 marks</td></tr><tr><td><b>PC — Partial Compliance</b></td><td>1 mark</td><td>Not permitted</td></tr><tr><td><b>NC — Non-Compliance</b></td><td>0 marks</td><td>0 marks</td></tr><tr><td><b>NA — Not Applicable</b></td><td colspan="2">Excluded from applicable maximum</td></tr></tbody></table></section>`;
const scheduleGrade=`<section class="grade-bottom"><h3>Rating / Grading Table</h3><table class="rules-table"><thead><tr><th>Score</th><th>Grade</th><th>Result</th></tr></thead><tbody><tr><td>90% and above</td><td><b>A+</b></td><td>Compliance – Exemplar</td></tr><tr><td>80% to &lt;90%</td><td><b>A</b></td><td>Compliance – Satisfactory</td></tr><tr><td>50% to &lt;80%</td><td><b>B</b></td><td>Needs Improvement</td></tr><tr><td>Below 50%</td><td><b>No Grade</b></td><td>Non Compliance</td></tr></tbody></table><div class="critical-note">Any NC against a Critical (*) requirement results in Non Compliance / No Grade irrespective of percentage score.</div></section>`;
const hygieneScoring=`<section class="hyg-rules"><h3>Scoring Table</h3><table class="rules-table"><thead><tr><th>Assessment</th><th>Normal Requirement</th><th>Critical Requirement (*)</th></tr></thead><tbody><tr><td><b>C — Compliance</b></td><td>2 marks</td><td>4 marks</td></tr><tr><td><b>PC — Partial Compliance</b></td><td>1 mark</td><td>Not permitted</td></tr><tr><td><b>NC — Non-Compliance</b></td><td>0 marks</td><td>0 marks</td></tr><tr><td><b>NA — Not Applicable</b></td><td colspan="2">Excluded from applicable maximum</td></tr></tbody></table></section>`;
const hygieneRating=`<section class="rating-bottom"><h3>Hygiene Rating</h3><table class="rating-table"><thead><tr><th>Rating</th><th>Category</th><th>Percentage Score</th></tr></thead><tbody><tr><td>5</td><td>Excellent</td><td>81–100%</td></tr><tr><td>4</td><td>Very Good</td><td>61–80%</td></tr><tr><td>3</td><td>Good</td><td>41–60%</td></tr><tr><td>2</td><td>Needs Improvement</td><td>21–40%</td></tr><tr><td>1</td><td>Poor</td><td>20% or below</td></tr></tbody></table><div class="critical-note">Failure of any Critical (*) requirement results in Non-Compliance and no Hygiene Rating.</div></section>`;

function staticRibbon(html,kind){
  const count=(html.match(/<span id=["']ans["']>0<\/span>\/(\d+)/i)||[])[1];
  if(!count)return html;
  const max=(html.match(/<span id=["']max["']>([^<]*)<\/span>/i)||[])[1]||'';
  const valueId=kind==='hygiene'?(html.includes('id="ratingOut"')?'ratingOut':'rating'):'grade';
  const valueLabel=kind==='hygiene'?'Rating':'Grade';
  const nativeControls=kind==='hygiene'?'<button id="save" class="pmsv-native-control" type="button" hidden>Save Draft</button><button id="reset" class="pmsv-native-control" type="button" hidden>Reset</button>':'';
  const ribbon=`<div class="scorebar"><div class="wrap"><span class="score-chip answered-chip"><span class="desktop-label">Answered </span><span class="mobile-label">Ans </span><span id="ans">0</span>/${count}</span><span class="score-chip score-value-chip"><span class="desktop-label">Score </span><span class="mobile-label">Scr </span><span id="score">0</span>/<span id="max">${max}</span> (<span id="pct">0%</span>)</span><span class="score-chip grade-chip"><span class="desktop-label">${valueLabel} </span><span class="mobile-label">${kind==='hygiene'?'Rat ':'Grd '}</span><span id="${valueId}">—</span></span><span class="score-chip critical-chip critical-ribbon"><span class="desktop-label">Critical NC </span><span class="mobile-label">CNC </span><span id="cnc">0</span></span>${nativeControls}<button class="pmsv-draft" type="button">Save</button><button class="pmsv-reset" type="button">Reset</button></div></div>`;
  return html.replace(/<div class=["'](?:scorebar|score)["']>\s*<div class=["']wrap["']>[\s\S]*?<\/div>\s*<\/div>/i,ribbon);
}
function cleanAuditText(value){
  return value.replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
}
function escapeAuditText(value){
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function stripLegacyScoringCards(html){
  html=html.replace(/<p\b[^>]*>\s*<b>Scoring:\s*<\/b>[\s\S]*?<\/p>/gi,'');
  return html.replace(/<section\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi,(full,inner)=>{
    let text=cleanAuditText(inner);
    if(!/\bScoring\s*:/i.test(text))return full;
    text=text.replace(/Scoring\s*:[\s\S]*?(?:Any critical NC\s*=\s*Non Compliance\s*\/\s*No Grade\.|Failure of any asterisk\s*\(\*\)\s*requirement results in Non-Compliance and no Hygiene Rating\.)/i,'').trim();
    return text?'<section class="card audit-source-note">'+escapeAuditText(text)+'</section>':'';
  });
}
function preRenderChecklist(html,kind){
  // Remove page-specific legacy visual CSS and scoring prose before first paint.
  html=html.replace(/<style>[\s\S]*?<\/style>/gi,'');
  html=stripLegacyScoringCards(html);
  html=staticRibbon(html,kind);
  if(kind==='schedule'){
    if(!html.includes('class="pmsv-rules"'))html=html.replace(/<div class=["']tablewrap["']>/i,scheduleScoring+'<div class="tablewrap">');
    if(!html.includes('class="grade-bottom"'))html=html.replace(/<button class=["']finish["'] id=["']finish["']/i,scheduleGrade+'<button class="finish" id="finish"');
  }else{
    if(!html.includes('class="hyg-rules"'))html=html.replace(/<div class=["']tablewrap["']>/i,hygieneScoring+'<div class="tablewrap">');
    if(!html.includes('class="rating-bottom"')){
      if(/<div class=["']actions["']>/i.test(html))html=html.replace(/<div class=["']actions["']>/i,hygieneRating+'<div class="actions">');
      else html=html.replace(/<button[^>]*id=["']finish["'][^>]*>/i,m=>hygieneRating+m);
    }
  }
  return html;
}
async function integrateAudits(dir){
  let entries=[];try{entries=await readdir(dir,{withFileTypes:true})}catch{return}
  for(const e of entries){
    if(e.isDirectory()||!e.name.endsWith('.html'))continue;
    const file=path.join(dir,e.name);let html=await readFile(file,'utf8');
    if(!/<body(?:\s|>)/i.test(html))continue;
    html=html
      .replace(/<link rel="stylesheet" href="audit-forum\.css[^"]*">/gi,'')
      .replace(/<script src="forum-shell\.js[^"]*"><\/script>/gi,'')
      .replace(/app-ui\.css\?v=\d+/g,'app-ui.css?v=35')
      .replace(/audit-ui\.js\?v=\d+/g,'audit-ui.js?v=35')
      .replace(/checklist-ui\.js\?v=\d+/g,'checklist-ui.js?v=35')
      .replace(/hygiene-checklist-ui\.js\?v=\d+/g,'hygiene-checklist-ui.js?v=35');
    if(scheduleChecklistPages.has(e.name))html=preRenderChecklist(html,'schedule');
    if(hygieneChecklistPages.has(e.name))html=preRenderChecklist(html,'hygiene');
    if(!html.includes('audit-forum.css?v=35'))html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="audit-forum.css?v=35"></head>');
    const deep=!auditWorkspacePages.has(e.name);
    html=html.replace(/<body([^>]*)>/i,(m,attrs)=>{
      const wanted='pmsv-audit-integrated'+(deep?' pmsv-audit-deep':'');
      const clean=attrs.replace(/\sclass=(["'])(.*?)\1/i,(x,q,cls)=>' class='+q+(cls+' '+wanted).trim()+q);
      return /\sclass=/.test(clean)?'<body'+clean+'>':'<body'+clean+' class="'+wanted+'">';
    });
    if(!deep&&!html.includes('class="pmsv-audit-nav"'))html=html.replace(/<body[^>]*>/i,m=>m+auditShell);
    await writeFile(file,html);
  }
}
await integrateAudits(auditDir);

// Browser-only GitHub preview. This is not used by WordPress; it lets the generated
// plugin UI be inspected directly from the repository before installation.
const previewManifest=JSON.parse(await readFile(path.join(target,'assets/.vite/manifest.json'),'utf8'))['index.html'];
const previewCss=(previewManifest.css||[]).map(css=>'<link rel="stylesheet" href="./'+css+'">').join('');
const previewHtml=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="theme-color" content="#3155d9"><title>PMSV Food Safety & Quality Forum — Build Preview</title>
<script>
(function(){
  const originalPath=location.pathname;
  const previewFile=location.origin+originalPath;
  const root=originalPath.replace(/\\/preview\\.html$/,'');
  const route=new URLSearchParams(location.search).get('route')||'/';
  const base=document.createElement('base');base.href=location.origin+root+'/assets/';document.head.appendChild(base);
  window.PMSV={base:root,publicBase:root+'/public/'};

  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    try{
      const raw=typeof input==='string'?input:input.url;
      const u=new URL(raw,location.origin);
      if(u.pathname===root+'/api/news'){
        const [r,b]=await Promise.all([nativeFetch(root+'/archive-seed.json',{cache:'no-store'}),nativeFetch(root+'/preview-blogs.json',{cache:'no-store'})]);
        let news=await r.json();const blogs=await b.json();
        const fallback=n=>{if(String(n.summary||'').trim())return n;const title=String(n.title||'').trim(),source=String(n.source||'PMSV source').trim();if(!title)return n;let summary;
          let m=title.match(/^Gazette Notification of\\s+(.+)$/i);if(m)summary=source+' published a Gazette notification concerning '+m[1].trim()+'.';
          else if((m=title.match(/^Advisory on\\s+(.+)$/i)))summary=source+' issued an advisory on '+m[1].trim()+'.';
          else if((m=title.match(/^Notification of\\s+(.+)$/i)))summary=source+' published a notification concerning '+m[1].trim()+'.';
          else if((m=title.match(/^Draft\\s+(.+)$/i)))summary=source+' published a draft update concerning '+m[1].trim()+'.';
          else if(n.tab==='general')summary=source+' reported on: '+title+'.';
          else if(source.toLowerCase().includes('linkedin'))summary=source+' shared an update on: '+title+'.';
          else summary=source+' published an update on: '+title+'.';
          return {...n,summary:summary.slice(0,520)}};
        news=news.filter(n=>n.tab!=='blogs').map(fallback).concat(Array.isArray(blogs)?blogs:[]);
        return new Response(JSON.stringify({news}),{status:200,headers:{'Content-Type':'application/json'}});
      }
      if(u.pathname===root+'/api/updater')return new Response(JSON.stringify({active:false,checks:[]}),{status:200,headers:{'Content-Type':'application/json'}});
      if(u.pathname===root+'/api/push')return new Response(JSON.stringify({error:'Preview only'}),{status:503,headers:{'Content-Type':'application/json'}});
    }catch(e){}
    return nativeFetch(input,init);
  };

  if(route.startsWith('/audits/')){location.replace(root+'/public'+route);return;}
  history.replaceState(null,'',root+(route==='/'?'/':route));

  function fixImage(img){
    const prefix='/wp-content/plugins/pmsv-original-app-preview/public/';
    const src=img.getAttribute&&img.getAttribute('src');
    if(src&&src.startsWith(prefix))img.setAttribute('src',root+'/public/'+src.slice(prefix.length));
  }
  new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{
    if(n.nodeType!==1)return;
    if(n.tagName==='IMG')fixImage(n);
    n.querySelectorAll&&n.querySelectorAll('img').forEach(fixImage);
  }))).observe(document.documentElement,{childList:true,subtree:true});

  document.addEventListener('click',function(e){
    const a=e.target.closest&&e.target.closest('a');if(!a)return;
    let u;try{u=new URL(a.href,location.origin)}catch{return}
    if(u.origin!==location.origin||!u.pathname.startsWith(root+'/'))return;
    const rel=u.pathname.slice(root.length)||'/';
    if(rel.startsWith('/public/')||rel.startsWith('/assets/')||rel==='/archive-seed.json')return;
    e.preventDefault();
    if(rel.startsWith('/audits/'))location.href=root+'/public'+rel;
    else location.href=previewFile+'?route='+encodeURIComponent(rel);
  },true);

  window.addEventListener('load',()=>history.replaceState(null,'',previewFile+'?route='+encodeURIComponent(route)));
})();
</script>
${previewCss}</head><body class="antialiased"><div id="root"></div><script type="module" src="./${previewManifest.file}"></script></body></html>`;
await writeFile(path.join(target,'preview.html'),previewHtml);

// When an audit is opened through the GitHub browser preview, keep its Workspace
// links inside the same preview instead of sending the user to non-existent raw paths.
for(const e of await readdir(auditDir,{withFileTypes:true})){
  if(e.isDirectory()||!e.name.endsWith('.html'))continue;
  const file=path.join(auditDir,e.name);let html=await readFile(file,'utf8');
  const bridge=`<script>(function(){if(location.hostname!=='raw.githack.com')return;const marker='/public/audits/',i=location.pathname.indexOf(marker);if(i<0)return;const root=location.pathname.slice(0,i),preview=root+'/preview.html';addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.workspace-link').forEach(a=>{const t=a.textContent||'';if(t.includes('Updates'))a.href=preview+'?route=%2Fupdates';else if(t.includes('Blogs'))a.href=preview+'?route=%2Fblogs';else if(t.includes('Audits'))a.href=root+'/public/audits/index.html'});document.querySelectorAll('.pmsv-audit-home,.pmsv-audit-brand').forEach(a=>a.href=preview+'?route=%2F')})})();</script>`;
  if(!html.includes("location.hostname!=='raw.githack.com'"))html=html.replace('</body>',bridge+'</body>');
  await writeFile(file,html);
}

async function files(dir,base=''){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const name=base+e.name;if(e.isDirectory())out.push(...await files(dir+'/'+e.name,name+'/'));else out.push(name);}return out;}
await writeFile(target+'/public-files.json',JSON.stringify(await files('public')));
const bodies=JSON.parse(await readFile('data/professional-sources.json','utf8'));
const routes=['/','/updates','/regulatory','/news','/quality','/excellence','/certifications','/blogs','/about','/privacy','/subscriptions/manage',...['india','us','eu','uk','australia'].map(x=>'/regulatory/'+x),'/news/india','/news/global'];
for(const b of bodies)for(const t of b.topics)routes.push('/'+t+'/'+b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''));
await writeFile(target+'/routes.json',JSON.stringify(routes,null,2));
await writeFile(target+'/SOURCE.json',JSON.stringify({repository:'pragashramadoss/PMSV-app-source-code',auditSource:'pragashramadoss/pmsv-fssai-audit',auditIntegration:'bundled-from-github-at-build',releaseStatus:'preview-not-approved-for-production',routes:routes.length},null,2));
console.log('PMSV WordPress preview packaged:',routes.length,'routes; audit tools are bundled from the separate GitHub project when public/audits is populated.');
