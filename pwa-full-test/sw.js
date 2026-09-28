self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate')event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>new Response('<h1>PMSV offline</h1>',{headers:{'Content-Type':'text/html'}})))});
self.addEventListener('push',event=>{event.waitUntil(self.registration.showNotification('PMSV',{body:'Test notification from PMSV full preview.'}))});
