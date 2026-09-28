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
async function serviceWorkerRegistration(){
 const existing=await navigator.serviceWorker.getRegistration(appUrl('/'));
 if(existing){void existing.update().catch(()=>{});return existing}
 return navigator.serviceWorker.register(appUrl('/sw.js'),{scope:appUrl('/'),updateViaCache:'none'});
}

export default function AppNotifications(){
 const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[supported,setSupported]=useState(false),[installed,setInstalled]=useState(false),[install,setInstall]=useState<InstallEvent|null>(null);

 useEffect(()=>{
  const standalone=matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
  setInstalled(standalone);
  setSupported(window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window);

  const cached=(window as PMSVWindow).PMSV?.installPrompt||null;
  if(cached)setInstall(cached);
  const prompt=(e:Event)=>{
   e.preventDefault();
   const event=e as InstallEvent;
   if((window as PMSVWindow).PMSV)(window as PMSVWindow).PMSV!.installPrompt=event;
   setInstall(event);
  };
  const available=()=>{
   const event=(window as PMSVWindow).PMSV?.installPrompt||null;
   if(event)setInstall(event);
  };
  const done=()=>{
   setInstalled(true);setInstall(null);
   if((window as PMSVWindow).PMSV)(window as PMSVWindow).PMSV!.installPrompt=null;
  };
  window.addEventListener('beforeinstallprompt',prompt);
  window.addEventListener('pmsv-install-available',available);
  window.addEventListener('appinstalled',done);

  if('serviceWorker' in navigator)serviceWorkerRegistration().then(async reg=>{
   if(!('PushManager' in window)||!('Notification' in window))return;
   const sub=await reg.pushManager.getSubscription(),token=localStorage.getItem('pmsv-push-token');
   let preference=localStorage.getItem('pmsv-push-preference');
   if(!preference&&token&&!sub){preference='off';localStorage.setItem('pmsv-push-preference','off')}
   if(preference==='off')return;
   if(Notification.permission==='granted'){
    if(sub&&token&&preference==='on')setEnabled(true);
    else if(preference==='on')await enable(false);
   }
  }).catch(()=>{});

  return()=>{
   window.removeEventListener('beforeinstallprompt',prompt);
   window.removeEventListener('pmsv-install-available',available);
   window.removeEventListener('appinstalled',done);
  };
 },[]);

 async function enable(askPermission=true){
  setBusy(true);setMessage('');let created:PushSubscription|null=null;
  try{
   if(!window.isSecureContext)throw Error('Notifications require the secure HTTPS version of PMSV.');
   if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('This browser does not support PMSV notifications.');
   const permission=askPermission?await Notification.requestPermission():Notification.permission;
   if(permission!=='granted')throw Error(permission==='denied'?'Notifications are blocked by the browser.':'Notification permission was not allowed.');
   const reg=await serviceWorkerRegistration();
   await navigator.serviceWorker.ready;
   const response=await fetch(appUrl('/api/push'),{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(12000)});
   const config=await response.json().catch(()=>({})) as {publicKey?:string;error?:string};
   if(!response.ok||!config.publicKey)throw Error(config.error||'PMSV could not prepare notifications. Please try again.');
   let sub=await reg.pushManager.getSubscription(),token=localStorage.getItem('pmsv-push-token');
   if(sub&&!token){await sub.unsubscribe();sub=null}
   if(!token){token=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem('pmsv-push-token',token)}
   if(!sub){sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKey(config.publicKey)});created=sub}
   const result=await fetch(appUrl('/api/push'),{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:sub.endpoint,token}),signal:AbortSignal.timeout(12000)});
   const data=await result.json().catch(()=>({})) as {error?:string};
   if(!result.ok)throw Error(data.error||'PMSV could not save this notification subscription.');
   localStorage.setItem('pmsv-push-preference','on');setEnabled(true);setMessage('Notifications are enabled for this device.');
  }catch(e){
   if(created)await created.unsubscribe().catch(()=>{});
   setEnabled(false);
   setMessage(e instanceof Error?e.message:'Could not turn on notifications. Try again.');
  }finally{setBusy(false)}
 }

 async function disable(){
  setBusy(true);setMessage('');
  try{
   localStorage.setItem('pmsv-push-preference','off');
   const reg=await serviceWorkerRegistration(),sub=await reg.pushManager.getSubscription();
   let serverRemoved=true;
   if(sub){
    try{
     const response=await fetch(appUrl('/api/push'),{method:'DELETE',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:sub.endpoint,token:localStorage.getItem('pmsv-push-token')}),signal:AbortSignal.timeout(8000)});
     serverRemoved=response.ok;
    }catch{serverRemoved=false}
    await sub.unsubscribe();
    if(await reg.pushManager.getSubscription())throw Error('Your browser could not turn notifications off. Please block them in device settings.');
   }
   setEnabled(false);setMessage(serverRemoved?'Notifications are off on this device.':'Notifications are off on this device. Server cleanup will complete after an expired delivery attempt.');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not turn off notifications. Please use device settings.')}finally{setBusy(false)}
 }

 async function installApp(){
  setMessage('');
  const event=install||(window as PMSVWindow).PMSV?.installPrompt||null;
  if(!event)return;
  try{
   await event.prompt();
   const choice=await event.userChoice;
   if(choice.outcome==='accepted'){
    setInstall(null);
    if((window as PMSVWindow).PMSV)(window as PMSVWindow).PMSV!.installPrompt=null;
   }
  }catch{}
 }

 return <><div className="app-notification-actions">{!installed&&install&&<button onClick={()=>{void installApp()}} aria-label="Install PMSV"><Download size={18}/><span>Install app</span></button>}<button onClick={()=>setOpen(true)} aria-label={enabled?'Manage app notifications':'Turn on app notifications'}>{enabled?<BellRing size={19}/>:<Bell size={19}/>}<span>{enabled?'Notifications on':'Notifications'}</span></button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="subscription-dialog"><DialogHeader><DialogTitle>App notifications</DialogTitle><DialogDescription>Turn on alerts for new PMSV updates.</DialogDescription></DialogHeader><p className="push-privacy">No email, phone number or sign-in is needed.</p>{supported&&Notification.permission!=='denied'?<><button className="subscription-submit" disabled={busy} onClick={()=>{void (enabled?disable():enable())}}>{busy?'Saving…':enabled?'Turn off notifications':'Allow notifications'}</button>{!enabled&&<button className="text-button" disabled={busy} onClick={()=>{void disable()}}>Keep notifications off</button>}</>:<p className="push-status">Notifications are blocked by the browser.</p>}<p role="status" className="push-status">{message}</p></DialogContent></Dialog></>;
}
