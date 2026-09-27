const CACHE='pmsv-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')))});
self.addEventListener('push',event=>{event.waitUntil((async()=>{
 let alert={title:'PMSV Food Safety Updates',body:'New food safety updates are available. Open PMSV to read them.',url:'/',tag:'pmsv-news'};
 try{const response=await fetch('/api/push/latest',{cache:'no-store',signal:AbortSignal.timeout(7000)});if(response.ok)alert=await response.json()}catch{}
 await self.registration.showNotification(alert.title,{body:alert.body,icon:'/icons/pmsv-family-192.png',badge:'/icons/badge.png',tag:'pmsv-news',data:{url:'/'}});
})())});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.navigate('/');return client.focus()}}return self.clients.openWindow('/')})())});
