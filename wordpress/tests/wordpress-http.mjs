import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'../..');
const cli=process.env.PMSV_PLAYGROUND_CLI||path.resolve(root,'../pmsv-test-tools/node_modules/.bin/wp-playground-cli');
const server=spawn(cli,['start','--path='+root+'/wordpress/plugin','--port=9410','--skip-browser','--no-login','--reset','--site-url=http://127.0.0.1:9410'],{stdio:['ignore','pipe','pipe']});
const base='http://127.0.0.1:9410/pmsv-app-review';
let ready=false;
const timeout=setTimeout(()=>{console.error('WordPress startup timeout');server.kill();process.exitCode=1;},120000);
server.stderr.on('data',d=>process.stderr.write(d));
server.stdout.on('data',async d=>{if(ready||!String(d).includes('Ready!'))return;ready=true;clearTimeout(timeout);
 try{
  let news=await fetch(base+'/api/news',{redirect:'manual'});if(news.status===302){console.log('Initial Playground redirect',news.headers.get('location'));news=await fetch(base+'/api/news',{redirect:'manual'});}if(news.status>=300&&news.status<400)throw new Error('Unexpected redirect: '+news.status+' '+JSON.stringify([...news.headers]));assert.equal(news.status,200);const data=await news.json();assert.equal(data.news.length,605);
  const routes=JSON.parse(await readFile(root+'/wordpress/plugin/routes.json','utf8'));
  for(const route of routes){const r=await fetch(base+route);assert.equal(r.status,200,route);const html=await r.text();assert(html.includes('window.PMSV='),route);assert(!html.includes('/themes/'),route);assert(html.includes('id="root"'),route);}
  assert.equal((await fetch(base+'/unknown')).status,404);
  for(const route of ['/api/updater','/api/push/dispatch'])assert.equal((await fetch(base+route,{method:'POST',body:'{}'})).status,401,route);
  assert.equal((await fetch(base+'/api/push',{method:'POST',headers:{Origin:'https://evil.test'},body:'{}'})).status,403);
  console.log('PASS HTTP: 605 archive records, 32 route shells, unknown-route 404, theme CSS isolation, unauthorized publishing and foreign-origin rejection.');
  const pushResponse=await fetch(base+'/api/push');const push=await pushResponse.json();assert.equal(pushResponse.status,200,JSON.stringify(push));assert.equal(Buffer.from(push.publicKey,'base64url').length,65);
  const token='a'.repeat(64),endpoint='https://fcm.googleapis.com/fcm/send/pmsv-test-only-not-a-device';
  const options={method:'POST',headers:{Origin:'http://127.0.0.1:9410','Content-Type':'application/json'},body:JSON.stringify({endpoint,token})};
  let r=await fetch(base+'/api/push',options);assert.equal(r.status,200);assert.equal((await r.json()).enabled,true);
  r=await fetch(base+'/api/push',{...options,body:JSON.stringify({endpoint,token:'b'.repeat(64)})});assert.equal(r.status,409);
  r=await fetch(base+'/api/push',{...options,method:'DELETE'});assert.equal(r.status,200);assert.equal((await r.json()).enabled,false);
  const manifest=await (await fetch(base+'/manifest.webmanifest')).json();assert.equal(manifest.scope,'/pmsv-app-review/');
  const sw=await (await fetch(base+'/sw.js')).text();assert(sw.includes('/pmsv-app-review/api/push/latest'));assert(sw.includes("scope")===false);
  const offline=await (await fetch(base+'/offline.html')).text();assert(offline.includes('href="/pmsv-app-review/"'));
  console.log('PASS WordPress HTTP integration: 32 routes, 605 archive records, unknown-route 404, no theme CSS, unauthorized publisher rejection, cross-origin rejection, push key/registration/token-conflict/removal, manifest, SW and offline paths. No push was dispatched.');
 }catch(e){console.error(e);process.exitCode=1;}finally{server.kill();}
});
