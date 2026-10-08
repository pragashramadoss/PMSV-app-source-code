const CACHE='pmsv-offline-v3';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('pmsv-')).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);const helper=url.origin===self.location.origin&&url.pathname.includes('/fssai-product-helper-preview-01/');if(event.request.mode==='navigate'||helper)event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>event.request.mode==='navigate'?new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMSV Offline</title><body style="font-family:system-ui;padding:32px"><h1>PMSV</h1><p>You are offline. Reconnect and try again.</p></body>',{headers:{'Content-Type':'text/html; charset=UTF-8'}}):Response.error()))});
self.addEventListener('push',event=>{event.waitUntil((async()=>{
 let alert={title:'PMSV Food Safety & Quality Forum',body:'New PMSV updates are available.',url:'/',tag:'pmsv-news'};
 try{const response=await fetch('/api/push/latest',{cache:'no-store',signal:AbortSignal.timeout(7000)});if(response.ok)alert=await response.json()}catch{}
 await self.registration.showNotification(alert.title,{body:alert.body,icon:'/icons/pmsv-family-192.png',badge:'/icons/badge.png',tag:'pmsv-news',data:{url:alert.url||'/'}});
})())});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=event.notification.data?.url||'/';const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.navigate(url);return client.focus()}}return self.clients.openWindow(url)})())});
