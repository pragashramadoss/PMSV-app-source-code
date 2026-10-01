'use client';
import {useEffect,useState} from 'react';
import {Bell,BellRing,Download} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';

type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
type PMSVWindow=Window&{PMSV?:{base?:string;publicBase?:string;installPrompt?:InstallEvent|null}};

function basePath(){
 const base=((window as PMSVWindow).PMSV?.base||'').replace(/\/$/,'');
 return base;
}
function appUrl(path:string){
 const base=basePath();
 return base+(path.startsWith('/')?path:'/'+path);
}
function pushKey(value:string){
 const clean=value.replace(/-/g,'+').replace(/_/g,'/');
 const padded=clean+'='.repeat((4-clean.length%4)%4);
 const raw=atob(padded);
 return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
async function registerPmsvServiceWorker(){
 const reg=await navigator.serviceWorker.register(appUrl('/?pmsv-sw=1&v=1.0.17'),{scope:appUrl('/'),updateViaCache:'none'});
 await navigator.serviceWorker.ready;
 return reg;
}

async function postSubscription(sub:PushSubscription,token:string){
 const result=await fetch(appUrl('/api/push'),{
  method:'POST',
  credentials:'same-origin',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({endpoint:sub.endpoint,token}),
  signal:AbortSignal.timeout(12000)
 });
 const data=await result.json().catch(()=>({})) as {error?:string};
 if(!result.ok)throw Object.assign(Error(data.error||'Could not save notification subscription.'),{status:result.status});
 return true;
}
async function prepareGrantedSubscription(){
 if(!window.isSecureContext||!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))return null;
 if(Notification.permission!=='granted'||localStorage.getItem('pmsv-push-preference')==='off')return null;
 const reg=await registerPmsvServiceWorker();
 const response=await fetch(appUrl('/api/push'),{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(12000)});
 const config=await response.json().catch(()=>({})) as {publicKey?:string;error?:string};
 if(!response.ok||!config.publicKey)throw Error(config.error||'Could not prepare notifications.');
 let sub=await reg.pushManager.getSubscription();
 let token=localStorage.getItem('pmsv-push-token');
 if(sub&&!token){await sub.unsubscribe();sub=null}
 if(!token){token=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem('pmsv-push-token',token)}
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKey(config.publicKey)});
 try{await postSubscription(sub,token)}
 catch(e){
  if((e as Error&{status?:number}).status!==409)throw e;
  await sub.unsubscribe().catch(()=>{});
  token=crypto.randomUUID()+crypto.randomUUID();
  localStorage.setItem('pmsv-push-token',token);
  sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKey(config.publicKey)});
  await postSubscription(sub,token);
 }
 localStorage.setItem('pmsv-push-preference','on');
 localStorage.setItem('pmsv-push-sync-v2',String(Date.now()));
 return {reg,sub,token};
}

export default function AppNotifications(){
 const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[supported,setSupported]=useState(false),[installed,setInstalled]=useState(false),[install,setInstall]=useState<InstallEvent|null>(null);

 useEffect(()=>{
  const standalone=matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
  setInstalled(standalone);
  setSupported(window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window);

  const cached=(window as PMSVWindow).PMSV?.installPrompt||null;
  if(cached)setInstall(cached);

  const onPrompt=(e:Event)=>{
   e.preventDefault();
   const event=e as InstallEvent;
   if((window as PMSVWindow).PMSV)(window as PMSVWindow).PMSV!.installPrompt=event;
   setInstall(event);
  };
  const onAvailable=()=>{
   const event=(window as PMSVWindow).PMSV?.installPrompt||null;
   if(event)setInstall(event);
  };
  const onInstalled=()=>{
   setInstalled(true);
   setInstall(null);
   if((window as PMSVWindow).PMSV)(window as PMSVWindow).PMSV!.installPrompt=null;
  };

  window.addEventListener('beforeinstallprompt',onPrompt);
  window.addEventListener('pmsv-install-available',onAvailable);
  window.addEventListener('appinstalled',onInstalled);

  let cancelled=false;
  const syncExisting=async(force=false)=>{
   try{
    if(!('Notification' in window)||Notification.permission!=='granted'||localStorage.getItem('pmsv-push-preference')==='off'){if(!cancelled)setEnabled(false);return}
    const last=Number(localStorage.getItem('pmsv-push-sync-v2')||0);
    if(!force&&Date.now()-last<6*60*60*1000){
     const reg=await registerPmsvServiceWorker();
     const sub=await reg.pushManager.getSubscription();
     if(!cancelled)setEnabled(Boolean(sub&&localStorage.getItem('pmsv-push-token')));
     return;
    }
    const synced=await prepareGrantedSubscription();
    if(!cancelled)setEnabled(Boolean(synced));
   }catch{if(!cancelled)setEnabled(false)}
  };
  void syncExisting(true);
  const onVisible=()=>{if(document.visibilityState==='visible')void syncExisting(false)};
  const onOnline=()=>{void syncExisting(false)};
  document.addEventListener('visibilitychange',onVisible);
  window.addEventListener('online',onOnline);

  return()=>{
   cancelled=true;
   window.removeEventListener('beforeinstallprompt',onPrompt);
   window.removeEventListener('pmsv-install-available',onAvailable);
   window.removeEventListener('appinstalled',onInstalled);
   document.removeEventListener('visibilitychange',onVisible);
   window.removeEventListener('online',onOnline);
  };
 },[]);

 async function installApp(){
  setMessage('');
  const event=install||(window as PMSVWindow).PMSV?.installPrompt||null;
  if(!event){setMessage('Install is not ready yet.');return}
  try{
   // Chrome requires prompt() to run directly from the user's click.
   // Do not await service-worker/network work before calling it.
   await event.prompt();
   const choice=await event.userChoice;
   if(choice.outcome==='accepted'){
    setInstall(null);
    if((window as PMSVWindow).PMSV)(window as PMSVWindow).PMSV!.installPrompt=null;
   }
  }catch{setMessage('Install could not start. Please try again.')}
 }

 async function enable(){
  setBusy(true);setMessage('');let created:PushSubscription|null=null;
  try{
   if(!window.isSecureContext)throw Error('Notifications require HTTPS.');
   if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('Notifications are not supported by this browser.');

   const permission=await Notification.requestPermission();
   if(permission!=='granted')throw Error(permission==='denied'?'Notifications are blocked by the browser.':'Notification permission was not granted.');

   localStorage.removeItem('pmsv-push-preference');
   const synced=await prepareGrantedSubscription();
   if(!synced)throw Error('Could not prepare notifications.');
   created=null;
   setEnabled(true);
   setMessage('Notifications are on.');
  }catch(e){
   if(created)await created.unsubscribe().catch(()=>{});
   setEnabled(false);
   setMessage(e instanceof Error?e.message:'Could not turn on notifications.');
  }finally{setBusy(false)}
 }

 async function testNotification(){
  setBusy(true);setMessage('');
  try{
   const synced=await prepareGrantedSubscription();
   if(!synced)throw Error('Turn on notifications first.');
   setEnabled(true);
   const result=await fetch(appUrl('/api/push/test'),{
    method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({endpoint:synced.sub.endpoint,token:synced.token}),
    signal:AbortSignal.timeout(12000)
   });
   const data=await result.json().catch(()=>({})) as {error?:string};
   if(!result.ok)throw Error(data.error||'Test notification could not be sent.');
   setMessage('Test notification sent. It may take a few seconds to appear.');
  }catch(e){setMessage(e instanceof Error?e.message:'Test notification could not be sent.')}
  finally{setBusy(false)}
 }

 async function disable(){
  setBusy(true);setMessage('');
  try{
   const reg=await registerPmsvServiceWorker();
   const sub=await reg.pushManager.getSubscription();
   if(sub){
    const token=localStorage.getItem('pmsv-push-token');
    try{
     await fetch(appUrl('/api/push'),{
      method:'DELETE',
      credentials:'same-origin',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({endpoint:sub.endpoint,token}),
      signal:AbortSignal.timeout(8000)
     });
    }catch{}
    await sub.unsubscribe();
   }
   localStorage.setItem('pmsv-push-preference','off');
   localStorage.removeItem('pmsv-push-sync-v2');
   setEnabled(false);
   setMessage('Notifications are off.');
  }catch{setMessage('Could not turn off notifications.')}finally{setBusy(false)}
 }

 return <><div className="app-notification-actions">{!installed&&install&&<button onClick={()=>{void installApp()}} aria-label="Install PMSV"><Download size={18}/><span>Install app</span></button>}<button onClick={()=>setOpen(true)} aria-label={enabled?'Manage app notifications':'Turn on app notifications'}>{enabled?<BellRing size={19}/>:<Bell size={19}/>}<span>{enabled?'Notifications on':'Notifications'}</span></button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="subscription-dialog"><DialogHeader><DialogTitle>App notifications</DialogTitle><DialogDescription>Turn on alerts for new PMSV updates.</DialogDescription></DialogHeader>{supported?<><button className="subscription-submit" disabled={busy} onClick={()=>{void (enabled?disable():enable())}}>{busy?'Saving…':enabled?'Turn off notifications':'Allow notifications'}</button>{enabled&&<button className="subscription-submit notification-test" disabled={busy} onClick={()=>{void testNotification()}}>Send test notification</button>}</>:<p className="push-status">Notifications are not supported by this browser.</p>}<p role="status" className="push-status">{message}</p></DialogContent></Dialog></>;
}
