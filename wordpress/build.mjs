import {cp,mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','wordpress/vite.config.mjs'],{stdio:'inherit'});if(result.status)process.exit(result.status);
const target=path.join(root,'wordpress/plugin');await cp('public',target+'/public',{recursive:true});
async function files(dir,base=''){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const name=base+e.name;if(e.isDirectory())out.push(...await files(dir+'/'+e.name,name+'/'));else out.push(name);}return out;}
await writeFile(target+'/public-files.json',JSON.stringify(await files('public')));
const bodies=JSON.parse(await readFile('data/professional-sources.json','utf8'));
const routes=['/','/regulatory','/news','/quality','/excellence','/certifications','/blogs','/privacy','/subscriptions/manage',...['india','us','eu','uk','australia'].map(x=>'/regulatory/'+x),'/news/india','/news/global'];
for(const b of bodies)for(const t of b.topics)routes.push('/'+t+'/'+b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''));
await writeFile(target+'/routes.json',JSON.stringify(routes,null,2));
await writeFile(target+'/SOURCE.json',JSON.stringify({repository:'pragashramadoss/PMSV-app-source-code',commit:'77f5225c109e85a4412b95f39739d37170d89c02',auditIntegrated:false,releaseStatus:'preview-not-approved-for-production',routes:routes.length},null,2));
console.log('Original source packaged:',routes.length,'routes; no audit code.');
