import {cp,mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','wordpress/vite.config.mjs'],{stdio:'inherit'});if(result.status)process.exit(result.status);
const target=path.join(root,'wordpress/plugin');await cp('public',target+'/public',{recursive:true});

const auditDir=path.join(target,'public/audits');
const auditShell=`
<aside class="pmsv-audit-nav" aria-label="PMSV workspace">
  <div class="nav-caption">WORKSPACE</div>
  <a class="workspace-link" href="../updates"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2.5"/><path d="M8 7h6M8 11h6"/></svg></span><span>Food Safety/Quality<br>Updates</span></a>
  <a class="workspace-link active" href="index.html" aria-current="page"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span><span>Food Safety/Quality<br>Audits</span></a>
  <a class="workspace-link" href="../blogs"><span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H9a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H2z"/><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H15a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h7z"/></svg></span><span>Food Safety/Quality<br>Blogs</span></a>
  <div class="nav-bottom"><img src="../brand/pmsv-family.png?v=0.5.6" alt="PMSV family logo"><span>PMSV<small>Food Safety &amp; Quality Forum</small></span></div>
</aside>
<div class="pmsv-audit-masthead">
  <a class="pmsv-audit-brand" href="../">
    <span class="pmsv-audit-brand-logo"><img src="../brand/pmsv-family.png?v=0.5.6" alt="PMSV family logo"></span>
    <span><span class="pmsv-audit-brand-name">PMSV <span>Food Safety &amp; Quality Forum</span></span><span class="pmsv-audit-brand-sub">FOOD SAFETY · QUALITY · EXCELLENCE</span></span>
  </a>
  <a class="pmsv-audit-home" href="../">← Back to Forum Home</a>
</div>`;
async function integrateAudits(dir){
  let entries=[];try{entries=await readdir(dir,{withFileTypes:true})}catch{return}
  for(const e of entries){
    if(e.isDirectory())continue;
    if(!e.name.endsWith('.html'))continue;
    const file=path.join(dir,e.name);let html=await readFile(file,'utf8');
    if(!/<body(?:\s|>)/i.test(html))continue;
    html=html
      .replace(/<link rel="stylesheet" href="audit-forum\.css[^"]*">/gi,'')
      .replace(/<script src="forum-shell\.js[^"]*"><\/script>/gi,'')
      .replace(/app-ui\.css\?v=\d+/g,'app-ui.css?v=20')
      .replace(/audit-ui\.js\?v=\d+/g,'audit-ui.js?v=20')
      .replace(/checklist-ui\.js\?v=\d+/g,'checklist-ui.js?v=20')
      .replace(/hygiene-checklist-ui\.js\?v=\d+/g,'hygiene-checklist-ui.js?v=20');
    if(!html.includes('audit-forum.css?v=20'))html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="audit-forum.css?v=20"></head>');
    html=html.replace(/<body([^>]*)>/i,(m,attrs)=>{
      const clean=attrs.replace(/\sclass=(["'])(.*?)\1/i,(x,q,cls)=>' class='+q+(cls+' pmsv-audit-integrated').trim()+q);
      return /\sclass=/.test(clean)?'<body'+clean+'>':'<body'+clean+' class="pmsv-audit-integrated">';
    });
    if(!html.includes('class="pmsv-audit-nav"'))html=html.replace(/<body[^>]*>/i,m=>m+auditShell);
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
        const r=await nativeFetch(root+'/archive-seed.json',{cache:'no-store'});
        const news=await r.json();
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
