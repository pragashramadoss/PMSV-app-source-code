import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..'),plugin=root+'/wordpress/plugin';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const routes=await json(plugin+'/routes.json');assert.equal(new Set(routes).size,routes.length);assert.equal(routes.length,32);
assert(!routes.some(r=>/audit|hygiene|inspection|nc-management/.test(r)));
execFileSync('git',['diff','--exit-code','77f5225','--','app','lib','components','public','data'],{cwd:root});
const seed=await json(plugin+'/archive-seed.json');assert.equal(seed.length,605);assert.equal(new Set(seed.map(n=>n.id)).size,seed.length);
for(const n of seed){for(const k of ['id','title','url','published','sourceType','firstSeen','verifiedAt'])assert.equal(typeof n[k],'string',k);assert(['https:','http:'].includes(new URL(n.url).protocol));}
const manifest=await json(plugin+'/assets/.vite/manifest.json');const js=await readFile(plugin+'/assets/'+manifest['index.html'].file,'utf8');
assert(!/chatgpt\.site|chatgpt\.com|api\.openai|cloudflare:workers|signin-with-chatgpt|modelContext/.test(js));
for(const p of await json(plugin+'/public-files.json'))assert.equal(Buffer.compare(await readFile(root+'/public/'+p),await readFile(plugin+'/public/'+p)),0,p);
assert(js.includes('window.PMSV.base'));assert(js.includes('Home'));assert(js.includes('Notifications'));
console.log('PASS 32 route inventory, no audits, original product-source parity, 605 real archive rows, original assets, WordPress bundle independence.');
