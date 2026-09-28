const CACHE='pmsv-pages-test-v3';
const APP_ROOT='/PMSV-app-source-code/';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{
   try{return await fetch(event.request,{cache:'no-store'});}
   catch{
    return fetch(APP_ROOT,{cache:'no-store'});
   }
  })());
 }
});
self.addEventListener('push',event=>{
 event.waitUntil(self.registration.showNotification('PMSV',{body:'Test notification from PMSV.'}));
});
