const CACHE='pmsv-offline-v5';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('pmsv-')).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate')event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMSV Offline</title><body style="font-family:system-ui;padding:32px"><h1>PMSV</h1><p>You are offline. Reconnect and try again.</p></body>',{headers:{'Content-Type':'text/html; charset=UTF-8'}})))});
function pmsvTarget(raw){
 try{
  const target=new URL(raw||'/',self.location.origin);
  return target.origin===self.location.origin?target.href:new URL('/',self.location.origin).href;
 }catch{return new URL('/',self.location.origin).href}
}
self.addEventListener('push',event=>{event.waitUntil((async()=>{
 let alert={title:'PMSV Food Safety & Quality Forum',body:'New food safety updates are available.',url:'/updates',tag:'pmsv-news'};
 try{
  const latest=new URL('/api/push/latest',self.location.origin);latest.searchParams.set('t',Date.now().toString());
  const response=await fetch(latest.href,{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(10000)});
  if(response.ok){const data=await response.json();if(data&&typeof data==='object')alert={...alert,...data}}
 }catch{}
 const target=pmsvTarget(alert.url);
 await self.registration.showNotification(alert.title||'PMSV Food Safety & Quality Forum',{
  body:alert.body||'New food safety updates are available.',
  icon:'/icons/pmsv-family-192.png',
  badge:'/icons/badge.png',
  tag:alert.tag||'pmsv-news',
  data:{url:target},
  renotify:true
 });
})())});
function pmsvIsAppWindow(client){
 return new Promise(resolve=>{
  const channel=new MessageChannel();
  let finished=false;
  const finish=value=>{
   if(finished)return;finished=true;
   clearTimeout(timer);channel.port1.close();channel.port2.close();resolve(value);
  };
  const timer=setTimeout(()=>finish(false),350);
  channel.port1.onmessage=event=>finish(event.data?.type==='PMSV_WINDOW_CONTEXT'&&event.data.installed===true);
  try{client.postMessage({type:'PMSV_WINDOW_CONTEXT'},[channel.port2])}catch{finish(false)}
 });
}
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=pmsvTarget(event.notification.data?.url||'/');
 event.waitUntil((async()=>{
  // A same-origin Chrome tab is not necessarily the installed app window.
  let windows=[];
  try{windows=await self.clients.matchAll({type:'window',includeUncontrolled:true})}catch{}
  const sameOrigin=windows.filter(client=>{
   try{return new URL(client.url).origin===self.location.origin}catch{return false}
  });
  const contexts=await Promise.all(sameOrigin.map(async client=>({client,installed:await pmsvIsAppWindow(client)})));
  const installed=contexts.filter(context=>context.installed).map(context=>context.client);
  let app=installed.find(client=>client.url===target)||installed[0];
  if(app){
   if(app.url!==target&&typeof app.navigate==='function'){
    try{app=await app.navigate(target)||app}catch{}
   }
   try{await app.focus();return}catch{}
  }
  // Let the browser use its installed-app launch handling before choosing a web tab.
  // Android TWA cold starts also require the APK's notification delegation service.
  try{
   const opened=await self.clients.openWindow(target);
   if(opened){if(typeof opened.focus==='function')await opened.focus();return}
  }catch{}
  const fallback=sameOrigin.find(client=>client.url===target)||sameOrigin[0];
  if(fallback){
   try{const next=fallback.url!==target&&fallback.navigate?await fallback.navigate(target):fallback;await (next||fallback).focus()}catch{}
  }
 })());
});
