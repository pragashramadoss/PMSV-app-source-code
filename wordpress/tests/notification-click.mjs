import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const origin='https://pmsvgroup.com';
const read=path=>readFile(resolve(root,path),'utf8');
const paths=['public/sw.js','wordpress/plugin/public/sw.js'];

function client(initialUrl,calls){
 return {
  url:initialUrl,
  async navigate(url){calls.push(['navigate',url]);this.url=url;return this},
  async focus(){calls.push(['focus',this.url]);return this}
 };
}

async function click(source,{existing=[],url='/updates'}={}){
 const calls=[],handlers=new Map();
 const appClients=existing.map(path=>client(origin+path,calls));
 const self={
  location:{origin},
  addEventListener:(name,callback)=>handlers.set(name,callback),
  clients:{
   async matchAll(options){calls.push(['match',options.type,options.includeUncontrolled]);return appClients},
   async openWindow(target){calls.push(['open',target]);return client(target,calls)}
  }
 };
 runInNewContext(source,{self,URL},{filename:'pmsv-sw.js'});
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
