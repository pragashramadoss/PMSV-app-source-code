import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root=path.resolve(import.meta.dirname,'..');
function load(file,mocks={}){
 const absolute=path.resolve(root,file);
 const output=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 const req=(key)=>{if(key in mocks)return mocks[key];const target=key.startsWith('@/')?path.join(root,key.slice(2)):path.resolve(path.dirname(absolute),key);return load(path.relative(root,target+'.ts'),mocks)};
 new Function('require','module','exports',output)(req,module,module.exports);return module.exports;
}
let checks=0;
async function test(name,fn){await fn();checks++;console.log('PASS',name)}
const protocol=load('lib/push-protocol.ts');
await test('SSRF: disallow localhost, credentials, insecure and lookalike push URLs',()=>{
 for(const u of ['http://fcm.googleapis.com/long-endpoint','https://127.0.0.1/private','https://fcm.googleapis.com.evil.test/long-endpoint','https://user:pass@fcm.googleapis.com/long-endpoint','https://fcm.googleapis.com:444/long-endpoint'])assert.equal(protocol.validEndpoint(u),false);
 assert.equal(protocol.validEndpoint('https://fcm.googleapis.com/fcm/send/valid-endpoint'),true);
});
const auth=load('lib/dispatch-auth.ts');const secret='x'.repeat(48);
await test('Publisher authorization fails closed and validates bearer secret',async()=>{
 assert.equal(await auth.authorizedDispatch(new Request('https://app.test'),secret),false);
 assert.equal(await auth.authorizedDispatch(new Request('https://app.test',{headers:{authorization:'Bearer wrong'}}),secret),false);
 assert.equal(await auth.authorizedDispatch(new Request('https://app.test',{headers:{authorization:'Bearer '+secret}}),undefined),false);
 assert.equal(await auth.authorizedDispatch(new Request('https://app.test',{headers:{authorization:'Bearer '+secret}}),secret),true);
});
await test('Unauthorized dispatch never calls provider or database',async()=>{
 let called=false;const route=load('app/api/push/dispatch/route.ts',{'cloudflare:workers':{env:{PMSV_DISPATCH_SECRET:secret}},'@/db/push':{dispatch:()=>{called=true;throw Error('must not run')}}});
 const response=await route.POST(new Request('https://app.test/api/push/dispatch',{method:'POST'}));assert.equal(response.status,401);assert.equal(called,false);
});
const bounded=load('lib/request-json.ts');
await test('Request limit rejects oversized chunked payload without content length',async()=>{
 const stream=new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('x'.repeat(5000)));c.close()}});
 await assert.rejects(bounded.readBoundedJson(new Request('https://app.test',{method:'POST',body:stream,duplex:'half'}),4096));
 assert.deepEqual(await bounded.readBoundedJson(new Request('https://app.test',{method:'POST',body:'{"ok":true}'}),20),{ok:true});
});
const model=load('lib/news-model.ts');const news=JSON.parse(fs.readFileSync(path.join(root,'data/news.json')));
await test('Archive schema, unique IDs, valid dates and safe source URLs',()=>{
 assert.equal(new Set(news.map(n=>n.id)).size,news.length);
 for(const n of news){assert.ok(model.safeSourceUrl(n.url));assert.ok(/^\d{4}-\d{2}(-\d{2})?$/.test(n.published));assert.ok(Number.isFinite(Date.parse(n.firstSeen)));assert.ok(n.published<=new Date().toISOString().slice(0,10));}
});
await test('Search safely excludes executable URLs and preserves deduplication',()=>{
 const n=news[0];assert.equal(model.selectNews([{...n,url:'javascript:alert(1)'}]).length,0);
 assert.equal(model.selectNews([n,{...n,id:'duplicate'}]).length,1);
 assert.ok(model.selectNews(news,'all','all','BRCGS').length>0);
 assert.equal(model.selectNews(news,'all','all','<script>alert(1)</script>').length,0);
});
await test('All five sections and certification owners stay correctly isolated',()=>{
 for(const kind of ['quality','excellence','certifications'])for(const n of model.selectNews(news,'all',kind))assert.equal(n.tab,kind);
 for(const n of model.selectNews(news,'all','certifications')){assert.match(n.category,/^(Quality|Food safety|Excellence) · /);assert.ok(/(^|\.)(brcgs\.com|sqfi\.com|ifs-certification\.com|aibinternational\.com|iso\.org|fssc\.com)$/.test(new URL(n.url).hostname));}
 assert.equal(model.selectNews(news,'all','news').some(n=>['quality','excellence','certifications'].includes(n.tab)),false);
 assert.equal(model.selectNews(news).slice(0,3).length,3);
});
await test('CSRF rejects foreign or absent Origin',()=>{const {sameOrigin}=load('lib/subscription-validation.ts');assert.equal(sameOrigin(new Request('https://app.test/api/push')),false);assert.equal(sameOrigin(new Request('https://app.test/api/push',{headers:{origin:'https://evil.test'}})),false);assert.equal(sameOrigin(new Request('https://app.test/api/push',{headers:{origin:'https://app.test'}})),true)});
console.log(`${checks} security and functional regression groups passed; no real notifications sent.`);
