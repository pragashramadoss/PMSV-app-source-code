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
  <a class="workspace-link" href="../updates"><span class="nav-icon">📰</span><span>Food Safety/Quality<br>Updates</span></a>
  <a class="workspace-link active" href="index.html" aria-current="page"><span class="nav-icon">✓</span><span>Food Safety/Quality<br>Audits</span></a>
  <a class="workspace-link" href="../blogs"><span class="nav-icon">✎</span><span>Food Safety/Quality<br>Blogs</span></a>
  <div class="nav-bottom"><img src="../brand/pmsv-family.png?v=0.5.5" alt="PMSV family logo"><span>PMSV<small>Food Safety &amp; Quality Forum</small></span></div>
</aside>
<div class="pmsv-audit-masthead">
  <a class="pmsv-audit-brand" href="../">
    <span class="pmsv-audit-brand-logo"><img src="../brand/pmsv-family.png?v=0.5.5" alt="PMSV family logo"></span>
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

async function files(dir,base=''){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const name=base+e.name;if(e.isDirectory())out.push(...await files(dir+'/'+e.name,name+'/'));else out.push(name);}return out;}
await writeFile(target+'/public-files.json',JSON.stringify(await files('public')));
const bodies=JSON.parse(await readFile('data/professional-sources.json','utf8'));
const routes=['/','/updates','/regulatory','/news','/quality','/excellence','/certifications','/blogs','/about','/privacy','/subscriptions/manage',...['india','us','eu','uk','australia'].map(x=>'/regulatory/'+x),'/news/india','/news/global'];
for(const b of bodies)for(const t of b.topics)routes.push('/'+t+'/'+b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''));
await writeFile(target+'/routes.json',JSON.stringify(routes,null,2));
await writeFile(target+'/SOURCE.json',JSON.stringify({repository:'pragashramadoss/PMSV-app-source-code',auditSource:'pragashramadoss/pmsv-fssai-audit',auditIntegration:'bundled-from-github-at-build',releaseStatus:'preview-not-approved-for-production',routes:routes.length},null,2));
console.log('PMSV WordPress preview packaged:',routes.length,'routes; audit tools are bundled from the separate GitHub project when public/audits is populated.');
