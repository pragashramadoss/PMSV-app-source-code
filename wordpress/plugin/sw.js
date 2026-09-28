self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate')event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMSV Offline</title><body style="font-family:system-ui;padding:32px"><h1>PMSV</h1><p>You are offline. Reconnect and try again.</p></body>',{headers:{'Content-Type':'text/html; charset=UTF-8'}})))});
