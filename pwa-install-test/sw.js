const CACHE='pmsv-install-test-v2';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{
   const url=new URL(event.request.url);
   const scope=new URL(self.registration.scope);
   if(url.pathname===scope.pathname||url.pathname===scope.pathname.replace(/\/$/,'')||!url.pathname.endsWith('/index.html')){
    const target=new URL('index.html',scope);
    target.search=url.search;
    try{return await fetch(target.toString(),{cache:'no-store'});}catch{}
   }
   try{return await fetch(event.request,{cache:'no-store'});}catch{}
   return new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMSV</title><body style="font-family:system-ui;padding:32px"><h1>PMSV</h1><p>Please reconnect and reopen the app.</p></body>',{headers:{'Content-Type':'text/html; charset=UTF-8'}});
  })());
 }
});
self.addEventListener('push',event=>{event.waitUntil(self.registration.showNotification('PMSV',{body:'Test notification from PMSV.'}));});
