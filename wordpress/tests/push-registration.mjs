import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';

const text=await readFile(new URL('../../app/app-notifications.tsx',import.meta.url),'utf8');
const helpers=stripTypeScriptTypes(text.slice(text.indexOf('type InstallEvent='),text.indexOf('// Called only')));
function environment({refresh=false,off=false,mismatch=false,permission='granted',renewalFails=false,postFails=false}={}){
 const entries=new Map([['pmsv-push-token','t'.repeat(64)]]);
 if(off)entries.set('pmsv-push-preference','off');
 const calls=[];let number=0;
 const key=new Uint8Array([4,1,2]);
 function subscription(endpoint,serverKey=key){return {endpoint,options:{applicationServerKey:serverKey.buffer},async unsubscribe(){calls.push('unsubscribe');current=null;return true}}}
 let current=subscription('https://fcm.googleapis.com/fcm/send/old',mismatch?new Uint8Array([4,9,9]):key);
 const reg={pushManager:{async getSubscription(){return current},async subscribe(){calls.push('subscribe');if(renewalFails)throw Error('offline');return current=subscription('https://fcm.googleapis.com/fcm/send/new'+(++number))}}};
 const storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};
 let locked=Promise.resolve();
 const navigator={serviceWorker:{register:async()=>reg,ready:Promise.resolve(reg)},locks:{request(name,fn){calls.push('lock');const result=locked.then(fn);locked=result.catch(()=>{});return result}}};
 const context={window:{isSecureContext:true,Notification:{},PushManager:{}},Notification:{permission},navigator,localStorage:storage,atob:s=>Buffer.from(s,'base64').toString('binary'),crypto:{randomUUID:()=>String(++number).padStart(36,'0')},Uint8Array,AbortSignal,Date,JSON,Error,
  async fetch(url,options={}){
   if(!options.method)return {ok:true,json:async()=>({publicKey:Buffer.from(key).toString('base64url')})};
   const body=JSON.parse(options.body);calls.push(body);
   if(postFails)throw Error('server unavailable');
   return {ok:true,json:async()=>({enabled:true,refreshRequired:refresh&&body.endpoint.endsWith('/old')})};
  }};
 runInNewContext(helpers,context);
 return {context,calls,entries,run:force=>context.prepareGrantedSubscription(force)};
}
test('provider-rejected subscription renews once and retains ownership proof',async()=>{
 const e=environment({refresh:true});const result=await e.run();
 assert(result.sub.endpoint.includes('/new'));
 assert.equal(e.calls.filter(x=>x==='unsubscribe').length,1);
 const posts=e.calls.filter(x=>typeof x==='object');
 assert.equal(posts[1].previous.endpoint,'https://fcm.googleapis.com/fcm/send/old');
 assert.equal(posts[1].previous.token,'t'.repeat(64));
 assert(!e.entries.has('pmsv-push-replacement'));
});
test('key mismatch refreshes even before provider rejection',async()=>{
 const e=environment({mismatch:true});await e.run();
 assert.equal(e.calls.filter(x=>x==='unsubscribe').length,1);
});
test('manual repair creates a new registration even with the same key',async()=>{
 const e=environment();await e.run(true);
 assert.equal(e.calls.filter(x=>x==='unsubscribe').length,1);
});
test('healthy registration is retained across serialized calls',async()=>{
 const e=environment();await Promise.all([e.run(),e.run()]);
 assert.equal(e.calls.filter(x=>x==='subscribe').length,0);
 assert.equal(e.calls.filter(x=>x==='lock').length,2);
});
test('explicit opt-out and denied permission do not create a subscription',async()=>{
 for(const opts of [{off:true},{permission:'denied'}]){
  const e=environment(opts);assert.equal(await e.run(),null);
  assert(!e.calls.some(x=>x==='subscribe'||typeof x==='object'));
 }
});
test('failed renewal retains proof for a later recovery attempt',async()=>{
 const e=environment({renewalFails:true});await assert.rejects(e.run(true),/offline/);
 assert.equal(JSON.parse(e.entries.get('pmsv-push-replacement')).endpoint,'https://fcm.googleapis.com/fcm/send/old');
});
test('failed server save keeps previous-device proof and does not loop',async()=>{
 const e=environment({postFails:true});await assert.rejects(e.run(true),/unavailable/);
 assert(e.entries.has('pmsv-push-replacement'));
 assert.equal(e.calls.filter(x=>x==='subscribe').length,1);
});
