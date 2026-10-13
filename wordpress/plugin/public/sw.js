const CACHE='pmsv-offline-v6';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('pmsv-')).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate')event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMSV Offline</title><body style="font-family:system-ui;padding:32px"><h1>PMSV</h1><p>You are offline. Reconnect and try again.</p></body>',{headers:{'Content-Type':'text/html; charset=UTF-8'}})))});
function pmsvTarget(raw){try{const target=new URL(raw||'/updates',self.location.origin);return target.origin===self.location.origin?target.href:new URL('/updates',self.location.origin).href}catch{return new URL('/updates',self.location.origin).href}}
self.addEventListener('push',event=>{event.waitUntil((async()=>{
 let alert=null;
 // A same-origin HttpOnly device cookie identifies the pending question-answer alert.
 // Web Push provider sees only a zero-byte wake-up, not the question or its author.
 try{
  const inbox=new URL('/api/push/inbox',self.location.origin);inbox.searchParams.set('t',Date.now().toString());
  const response=await fetch(inbox.href,{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(10000)});
  if(response.ok){const data=await response.json();if(data&&data.alert)alert=data.alert}
 }catch{}
 if(!alert){
  alert={title:'PMSV Food Safety & Quality Forum',body:'New food safety updates are available.',url:'/updates',tag:'pmsv-news'};
  try{
   const latest=new URL('/api/push/latest',self.location.origin);latest.searchParams.set('t',Date.now().toString());
   const response=await fetch(latest.href,{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(10000)});
   if(response.ok){const data=await response.json();if(data&&typeof data==='object')alert={...alert,...data}}
  }catch{}
 }
 const target=pmsvTarget(alert.url);
 await self.registration.showNotification(alert.title||'PMSV Food Safety & Quality Forum',{
  body:alert.body||'New food safety updates are available.',
  icon:'/icons/pmsv-family-192.png',badge:'/icons/badge.png',
  tag:alert.tag||'pmsv-news',data:{url:target},renotify:true
 });
})())});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=pmsvTarget(event.notification.data&&event.notification.data.url);
 event.waitUntil((async()=>{
  try{
   const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   const existing=windows.find(w=>{try{return new URL(w.url).origin===self.location.origin}catch{return false}});
   if(existing){
    try{const navigated=await existing.navigate(target);if(navigated){await navigated.focus();return}}catch{}
   }
   const opened=await self.clients.openWindow(target);
   if(opened)await opened.focus();
  }catch{try{await self.clients.openWindow(target)}catch{}}
 })());
});
