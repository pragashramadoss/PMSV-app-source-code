import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const origin='https://pmsvgroup.com';
const read=path=>readFile(resolve(root,path),'utf8');
const paths=['public/sw.js','wordpress/plugin/public/sw.js'];

function client(initialUrl,calls,installed=true){
 return {
  url:initialUrl,
  postMessage(message,ports){ports[0].postMessage({type:'PMSV_WINDOW_CONTEXT',installed})},
  async navigate(url){calls.push(['navigate',url]);this.url=url;return this},
  async focus(){calls.push(['focus',this.url]);return this}
 };
}

async function click(source,{existing=[],url='/updates'}={}){
 const calls=[],handlers=new Map();
 const appClients=existing.map(entry=>typeof entry==='string'?client(origin+entry,calls):client(origin+entry.path,calls,entry.installed));
 const self={
  location:{origin},
  addEventListener:(name,callback)=>handlers.set(name,callback),
  clients:{
   async matchAll(options){calls.push(['match',options.type,options.includeUncontrolled]);return appClients},
   async openWindow(target){calls.push(['open',target]);return client(target,calls)}
  }
 };
 runInNewContext(source,{self,URL,MessageChannel,setTimeout,clearTimeout},{filename:'pmsv-sw.js'});
 assert.equal(typeof handlers.get('notificationclick'),'function');
 let task;
 handlers.get('notificationclick')({
  notification:{data:{url},close(){calls.push(['close'])}},
  waitUntil(promise){task=promise}
 });
 assert.ok(task,'click must call event.waitUntil');
 await task;
 return calls;
}

test('packaged WordPress service worker matches the canonical public worker',async()=>{
 assert.equal(await read(paths[0]),await read(paths[1]));
});

for(const file of paths){
 test(file+': focus existing PMSV app instead of opening Chrome',async()=>{
  const calls=await click(await read(file),{existing:['/'],url:'/updates'});
  assert.deepEqual(calls,[
   ['close'],['match','window',true],
   ['navigate',origin+'/updates'],['focus',origin+'/updates']
  ]);
  assert(!calls.some(([action])=>action==='open'));
 });
 test(file+': focus a matching app window without extra navigation',async()=>{
  const calls=await click(await read(file),{existing:['/updates'],url:'/updates'});
  assert.deepEqual(calls,[
   ['close'],['match','window',true],['focus',origin+'/updates']
  ]);
 });
 test(file+': safely open a same-origin route if no app client exists',async()=>{
  const calls=await click(await read(file),{url:'/discussions/12#answer-3'});
  assert.deepEqual(calls,[
   ['close'],['match','window',true],
   ['open',origin+'/discussions/12#answer-3'],
   ['focus',origin+'/discussions/12#answer-3']
  ]);
 });
 test(file+': refuse an off-origin notification click target',async()=>{
  const calls=await click(await read(file),{url:'https://external.example/redirect'});
  assert(calls.some(([action,target])=>action==='open'&&target===origin+'/'));
  assert(!calls.some(([,target])=>typeof target==='string'&&target.includes('external.example')));
 });
}

for(const file of paths){
 test(file+': installed app wins over an exact-match browser tab',async()=>{
  const calls=await click(await read(file),{existing:[{path:'/updates',installed:false},{path:'/audits/index.html',installed:true}],url:'/updates'});
  assert(calls.some(([action,url])=>action==='navigate'&&url===origin+'/updates'));
  assert(!calls.some(([action])=>action==='open'));
 });
 test(file+': browser tab does not hijack an installed-app launch',async()=>{
  const calls=await click(await read(file),{existing:[{path:'/updates',installed:false}],url:'/updates'});
  assert(calls.some(([action])=>action==='open'));
 });
}

test('all app display modes and the exact Android package are recognized',async()=>{
 const source=await read('public/pmsv-window-context.js');
 for(const [standalone,referrer,want] of [[true,'',true],[false,'android-app://com.pmsvgroup.foodsafety',true],[false,'android-app://com.pmsvgroup.foodsafety.evil',false],[false,'https://pmsvgroup.com/',false]]){
  let handler,result;
  const navigator={serviceWorker:{addEventListener(name,fn){handler=fn}}};
  runInNewContext(source,{navigator,matchMedia:()=>({matches:standalone}),document:{referrer},URL});
  handler({data:{type:'PMSV_WINDOW_CONTEXT'},ports:[{postMessage(data){result=data}}]});
  assert.equal(result.installed,want);
 }
});
