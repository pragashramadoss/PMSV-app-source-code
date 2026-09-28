const CACHE='pmsv-pages-test-v4';
const APP_ROOT='/PMSV-app-source-code/';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{
   const url=new URL(event.request.url);
   if(url.origin!==self.location.origin)return fetch(event.request);
   if(url.pathname.startsWith(APP_ROOT+'audits/')||url.pathname.startsWith(APP_ROOT+'public/')){
    return fetch(event.request,{cache:'no-store'});
   }
   try{
    const direct=await fetch(event.request,{cache:'no-store'});
    if(direct.ok)return direct;
   }catch{}
   return fetch(APP_ROOT+'index.html',{cache:'no-store'});
  })());
 }
});
self.addEventListener('push',event=>{
 event.waitUntil(self.registration.showNotification('PMSV',{body:'Test notification from PMSV.'}));
});
