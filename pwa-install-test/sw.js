const CACHE='pmsv-install-test-v1';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));});
self.addEventListener('push',event=>{event.waitUntil(self.registration.showNotification('PMSV',{body:'Test notification from PMSV.',icon:'../public/icons/pmsv-family-192.png'}));});
