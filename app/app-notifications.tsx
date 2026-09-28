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
 const reg=await navigator.serviceWorker.register(appUrl('/sw.js'),{scope:appUrl('/'),updateViaCache:'none'});
 await navigator.serviceWorker.ready;
 return reg;
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

  if('serviceWorker' in navigator){
   registerPmsvServiceWorker().then(async reg=>{
    if(!('PushManager' in window)||!('Notification' in window))return;
    const sub=await reg.pushManager.getSubscription();
    const token=localStorage.getItem('pmsv-push-token');
    if(sub&&token&&Notification.permission==='granted')setEnabled(true);
   }).catch(()=>{});
  }

  return()=>{
   window.removeEventListener('beforeinstallprompt',onPrompt);
   window.removeEventListener('pmsv-install-available',onAvailable);
   window.removeEventListener('appinstalled',onInstalled);
  };
 },[]);

 async function installApp(){
  setMessage('');
  try{
   if('serviceWorker' in navigator)await registerPmsvServiceWorker();
   let event=install||(window as PMSVWindow).PMSV?.installPrompt||null;
   if(!event){
    event=await new Promise<InstallEvent|null>(resolve=>{
     const ready=()=>{
      window.removeEventListener('pmsv-install-available',ready);
      resolve((window as PMSVWindow).PMSV?.installPrompt||null);
     };
     window.addEventListener('pmsv-install-available',ready,{once:true});
     window.setTimeout(()=>{
      window.removeEventListener('pmsv-install-available',ready);
      resolve((window as PMSVWindow).PMSV?.installPrompt||null);
     },3500);
    });
   }
   if(!event){setMessage('Install is not ready yet. Please refresh once and try again.');return}
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

   const reg=await registerPmsvServiceWorker();
   const response=await fetch(appUrl('/api/push'),{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(12000)});
   const config=await response.json().catch(()=>({})) as {publicKey?:string;error?:string};
   if(!response.ok||!config.publicKey)throw Error(config.error||'Could not prepare notifications.');

   let sub=await reg.pushManager.getSubscription();
   let token=localStorage.getItem('pmsv-push-token');
   if(sub&&!token){await sub.unsubscribe();sub=null}
   if(!token){
    token=crypto.randomUUID()+crypto.randomUUID();
    localStorage.setItem('pmsv-push-token',token);
   }
   if(!sub){
    sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKey(config.publicKey)});
    created=sub;
   }

   const result=await fetch(appUrl('/api/push'),{
    method:'POST',
    credentials:'same-origin',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({endpoint:sub.endpoint,token}),
    signal:AbortSignal.timeout(12000)
   });
   const data=await result.json().catch(()=>({})) as {error?:string};
   if(!result.ok)throw Error(data.error||'Could not save notification subscription.');

   localStorage.setItem('pmsv-push-preference','on');
   setEnabled(true);
   setMessage('Notifications are on.');
  }catch(e){
   if(created)await created.unsubscribe().catch(()=>{});
   setEnabled(false);
   setMessage(e instanceof Error?e.message:'Could not turn on notifications.');
  }finally{setBusy(false)}
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
   setEnabled(false);
   setMessage('Notifications are off.');
  }catch{setMessage('Could not turn off notifications.')}finally{setBusy(false)}
 }

 return <><div className="app-notification-actions">{!installed&&<button onClick={()=>{void installApp()}} aria-label="Install PMSV"><Download size={18}/><span>Install app</span></button>}<button onClick={()=>setOpen(true)} aria-label={enabled?'Manage app notifications':'Turn on app notifications'}>{enabled?<BellRing size={19}/>:<Bell size={19}/>}<span>{enabled?'Notifications on':'Notifications'}</span></button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="subscription-dialog"><DialogHeader><DialogTitle>App notifications</DialogTitle><DialogDescription>Turn on alerts for new PMSV updates.</DialogDescription></DialogHeader>{supported?<button className="subscription-submit" disabled={busy} onClick={()=>{void (enabled?disable():enable())}}>{busy?'Saving…':enabled?'Turn off notifications':'Allow notifications'}</button>:<p className="push-status">Notifications are not supported by this browser.</p>}<p role="status" className="push-status">{message}</p></DialogContent></Dialog></>;
}
