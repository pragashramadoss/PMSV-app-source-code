import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';

const source=stripTypeScriptTypes(await readFile(new URL('../../lib/notification-status.ts',import.meta.url),'utf8')).replace(/export /g,'');
function environment({permission='granted',requestResult='denied',pushPermission=permission,referrer='',mode='browser',keyMismatch=false,offline=false,noWorker=false,storageBlocked=false}={}){
 const key=new Uint8Array(65);key[0]=4;key[1]=19;
 const calls=[];
 const reg={active:{},pushManager:{
  getSubscription:async()=>({endpoint:'https://private.example/endpoint-secret',options:{applicationServerKey:keyMismatch?new Uint8Array(65).buffer:key.buffer}}),
  permissionState:async()=>pushPermission,
  subscribe:()=>{throw Error('Diagnostics must not subscribe')}
 }};
 const notification={permission,requestPermission(){calls.push('request');return Promise.resolve(requestResult)}};
 const context={window:{isSecureContext:true,Notification:notification,matchMedia:q=>({matches:q===`(display-mode: ${mode})`})},Notification:notification,
  document:{referrer},navigator:{permissions:{query:async()=>({state:permission==='default'?'prompt':permission})},serviceWorker:{getRegistration:async()=>noWorker?undefined:reg}},
  localStorage:{getItem(){if(storageBlocked)throw Error('blocked');return 'token-secret'}},
  URL,Uint8Array,AbortSignal,atob:s=>Buffer.from(s,'base64').toString('binary'),setTimeout,clearTimeout,
  fetch:async(url,options)=>{calls.push({url,options});if(offline)throw Error('endpoint-secret');return {ok:true,json:async()=>({publicKey:Buffer.from(key).toString('base64url')})}}
 };
 runInNewContext(source,context);
 return {context,calls,read:()=>context.readNotificationStatus('')};
}
test('already granted permission is reused without asking the browser again',async()=>{
 const e=environment();assert.equal(await e.context.requestNotificationPermission(),'granted');assert(!e.calls.includes('request'));
});
test('new permission request runs immediately in the click gesture and preserves denial',async()=>{
 const e=environment({permission:'default'});const result=e.context.requestNotificationPermission();
 assert(e.calls.includes('request'));assert.equal(await result,'denied');
});
test('diagnostics distinguish notification and push permission without changing either',async()=>{
 const e=environment({permission:'denied',pushPermission:'granted'});const checks=await e.read();
 assert.equal(checks.find(c=>c.label==='Notification permission').value,'denied');
 assert.equal(checks.find(c=>c.label==='Push permission').value,'granted');
 assert(!e.calls.includes('request'));assert(e.calls.filter(c=>typeof c==='object').every(c=>!c.options.method));
});
test('diagnostics show mismatched registration and omit identifiers and keys',async()=>{
 const e=environment({keyMismatch:true});const checks=await e.read();
 assert.equal(checks.find(c=>c.label==='Registration key').value,'Needs repair');
 assert(!JSON.stringify(checks).match(/private.example|endpoint-secret|token-secret|BBMA/));
});
test('missing worker, inaccessible storage and server error remain separately visible',async()=>{
 const checks=await environment({noWorker:true,storageBlocked:true,offline:true}).read();
 assert.equal(checks.find(c=>c.label==='Notification service').value,'Not registered');
 assert.equal(checks.find(c=>c.label==='PMSV push server').value,'Unavailable');
 assert.equal(checks.find(c=>c.label==='PMSV alerts preference').value,'Storage unavailable');
 assert(!JSON.stringify(checks).includes('endpoint-secret'));
});
test('Android app identity is exact and standalone modes are recognized',()=>{
 for(const opts of [{mode:'standalone'},{mode:'fullscreen'},{mode:'minimal-ui'},{referrer:'android-app://com.pmsvgroup.foodsafety/'}])
  assert.equal(environment(opts).context.installedNotificationContext(),true);
 for(const referrer of ['', 'https://com.pmsvgroup.foodsafety/', 'android-app://com.pmsvgroup.foodsafety.evil/'])
  assert.equal(environment({referrer}).context.installedNotificationContext(),false);
});
