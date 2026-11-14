'use client';
import {useEffect,useState} from 'react';
import {Bell,BellRing,Download} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {installedNotificationContext,readNotificationStatus,requestNotificationPermission,type NotificationCheck} from '@/lib/notification-status';

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
 const reg=await navigator.serviceWorker.register(appUrl('/?pmsv-sw=1&v=1.0.25'),{scope:appUrl('/'),updateViaCache:'none'});
 await navigator.serviceWorker.ready;
 return reg;
}

async function postSubscription(sub:PushSubscription,token:string){
 const saved=localStorage.getItem('pmsv-push-replacement');
 const previous=saved?JSON.parse(saved) as {endpoint:string;token:string}:undefined;
 const result=await fetch(appUrl('/api/push'),{
  method:'POST',
  credentials:'same-origin',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({endpoint:sub.endpoint,token,...(previous?{previous}:{})}),
  signal:AbortSignal.timeout(12000)
 });
 const data=await result.json().catch(()=>({})) as {error?:string;refreshRequired?:boolean};
 if(!result.ok)throw Object.assign(Error(data.error||'Could not save notification subscription.'),{status:result.status});
 if(!data.refreshRequired)localStorage.removeItem('pmsv-push-replacement');
 return data;
}
async function renewSubscription(reg:ServiceWorkerRegistration,sub:PushSubscription|null,token:string|null,key:Uint8Array){
 // Keep ownership proof until the server has transferred discussion subscriptions.
 if(sub&&token&&!localStorage.getItem('pmsv-push-replacement'))localStorage.setItem('pmsv-push-replacement',JSON.stringify({endpoint:sub.endpoint,token}));
 if(sub&&!await sub.unsubscribe()){
  localStorage.removeItem('pmsv-push-replacement');
  throw Error('Notification subscription could not be refreshed. Try again.');
 }
 const nextToken=crypto.randomUUID()+crypto.randomUUID();
 localStorage.setItem('pmsv-push-token',nextToken);
 const next=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key as BufferSource});
 return {sub:next,token:nextToken};
}
async function prepareGrantedSubscription(forceRefresh=false){
 // Chrome tabs and the installed app share one subscription. Serialize renewal.
 const prepare=()=>prepareGrantedSubscriptionUnlocked(forceRefresh);
 return navigator.locks?navigator.locks.request('pmsv-push-registration',prepare):prepare();
}
async function prepareGrantedSubscriptionUnlocked(forceRefresh=false){
 if(!window.isSecureContext||!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))return null;
 if(Notification.permission!=='granted'||localStorage.getItem('pmsv-push-preference')==='off')return null;
 const reg=await registerPmsvServiceWorker();
 const response=await fetch(appUrl('/api/push'),{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(12000)});
 const config=await response.json().catch(()=>({})) as {publicKey?:string;error?:string};
 if(!response.ok||!config.publicKey)throw Error(config.error||'Could not prepare notifications.');
 const key=pushKey(config.publicKey);
 let sub=await reg.pushManager.getSubscription();
 let token=localStorage.getItem('pmsv-push-token');
 // An old browser subscription cannot receive a push signed with a new VAPID key.
 // The endpoint may still exist and pass POST registration, but the push provider rejects delivery.
 const oldKey=sub?.options.applicationServerKey;
 const keyMismatch=Boolean(sub&&(!oldKey||oldKey.byteLength!==key.byteLength||
  !new Uint8Array(oldKey).every((byte,i)=>byte===key[i])));
 if(sub&&(!token||keyMismatch||forceRefresh)){
  ({sub,token}=await renewSubscription(reg,sub,token,key));
 }
 if(!token){token=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem('pmsv-push-token',token)}
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
 try{
  const saved=await postSubscription(sub,token);
  if(saved.refreshRequired){
   ({sub,token}=await renewSubscription(reg,sub,token,key));
   const renewed=await postSubscription(sub,token);
   if(renewed.refreshRequired)throw Error('Push registration is still rejected after refresh. Please send a test.');
  }
 }
 catch(e){
  if((e as Error&{status?:number}).status!==409)throw e;
  // A lost local ownership token cannot migrate an older device's private alerts.
  localStorage.removeItem('pmsv-push-replacement');
  ({sub,token}=await renewSubscription(reg,sub,null,key));
  await postSubscription(sub,token);
 }
 localStorage.setItem('pmsv-push-preference','on');
 localStorage.setItem('pmsv-push-sync-v2',String(Date.now()));
 return {reg,sub,token};
}

// Called only from the question form's submit gesture. Permission is never requested
// silently, and the existing PMSV VAPID/device subscription is reused.
export async function subscribeToDiscussionAnswers():Promise<{endpoint:string;token:string}>{
 if(!window.isSecureContext||!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))
  throw Error('This browser does not support answer notifications.');
 const permission=await requestNotificationPermission();
 if(permission!=='granted')throw Error('Allow PMSV notifications, or untick the answer-alert checkbox to post without them.');
 localStorage.removeItem('pmsv-push-preference');
 const subscription=await prepareGrantedSubscription();
 if(!subscription)throw Error('Could not activate notifications. Untick the answer-alert checkbox to post without them.');
 return {endpoint:subscription.sub.endpoint,token:subscription.token};
}

export default function AppNotifications(){
 const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[supported,setSupported]=useState(false),[installed,setInstalled]=useState(false),[install,setInstall]=useState<InstallEvent|null>(null);
 const [checks,setChecks]=useState<NotificationCheck[]>([]),[checking,setChecking]=useState(false);

 useEffect(()=>{
  setInstalled(installedNotificationContext());
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
  const onFocus=()=>{void syncExisting(true)};
  let permissionStatus:PermissionStatus|undefined;
  const onPermissionChange=()=>{if(Notification.permission==='granted')setMessage('');void syncExisting(true)};
  if(navigator.permissions)void navigator.permissions.query({name:'notifications'}).then(status=>{
   if(cancelled)return;
   permissionStatus=status;
   status.addEventListener('change',onPermissionChange);
  }).catch(()=>{});
  document.addEventListener('visibilitychange',onVisible);
  window.addEventListener('online',onOnline);
  window.addEventListener('focus',onFocus);

  return()=>{
   cancelled=true;
   window.removeEventListener('beforeinstallprompt',onPrompt);
   window.removeEventListener('pmsv-install-available',onAvailable);
   window.removeEventListener('appinstalled',onInstalled);
   document.removeEventListener('visibilitychange',onVisible);
   window.removeEventListener('online',onOnline);
   window.removeEventListener('focus',onFocus);
   permissionStatus?.removeEventListener('change',onPermissionChange);
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
  setBusy(true);setMessage('');setChecks([]);
  try{
   if(!window.isSecureContext)throw Error('Notifications require HTTPS.');
   if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('Notifications are not supported by this browser.');

   const permission=await requestNotificationPermission();
   if(permission!=='granted'){
    void checkNotificationStatus(permission);
    throw Error(permission==='denied'?'This session reports notification permission as denied. If Android notifications are already allowed, the app and browser connection needs checking. See the status below.':'Notification permission was not granted.');
   }

   localStorage.removeItem('pmsv-push-preference');
   const synced=await prepareGrantedSubscription();
   if(!synced)throw Error('Could not prepare notifications.');
   setEnabled(true);
   setMessage('Notifications are on.');
  }catch(e){
   setEnabled(false);
   setMessage(e instanceof Error?e.message:'Could not turn on notifications.');
  }finally{setBusy(false)}
 }

 async function checkNotificationStatus(requestResult?:NotificationPermission){
  setChecking(true);
  try{
   const status=await readNotificationStatus(basePath());
   setChecks(requestResult?[{label:'Permission request result',value:requestResult},...status]:status);
  }catch{setChecks([{label:'Status check',value:'Could not complete. Reopen PMSV and try again.'}])}
  finally{setChecking(false)}
 }

 async function testNotification(repair=false){
  setBusy(true);setMessage('');
  try{
   let synced=await prepareGrantedSubscription(repair);
   if(!synced)throw Error('Turn on notifications first.');
   setEnabled(true);
   const send=async(subscription:NonNullable<typeof synced>)=>fetch(appUrl('/api/push/test'),{
    method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({endpoint:subscription.sub.endpoint,token:subscription.token}),
    signal:AbortSignal.timeout(12000)
   });
   let result=await send(synced);
   let data=await result.json().catch(()=>({})) as {error?:string;code?:string;reason?:string};
   if(!repair&&data.code==='subscription_refresh_required'){
    synced=await prepareGrantedSubscription(true);
    if(!synced)throw Error('Could not refresh notifications.');
    result=await send(synced);
    data=await result.json().catch(()=>({})) as typeof data;
   }
   if(!result.ok)throw Error((data.error||'Test notification could not be sent.')+(data.reason?' ('+data.reason+')':''));
   setMessage('Push provider accepted the test. Check whether it arrives on your phone.');
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
   localStorage.removeItem('pmsv-push-replacement');
   setEnabled(false);
   setMessage('Notifications are off.');
  }catch{setMessage('Could not turn off notifications.')}finally{setBusy(false)}
 }

 return <><div className="app-notification-actions">{!installed&&install&&<button onClick={()=>{void installApp()}} aria-label="Install PMSV"><Download size={18}/><span>Install app</span></button>}<button onClick={()=>setOpen(true)} aria-label={enabled?'Manage app notifications':'Turn on app notifications'}>{enabled?<BellRing size={19}/>:<Bell size={19}/>}<span>{enabled?'Notifications on':'Notifications'}</span></button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="subscription-dialog"><DialogHeader><DialogTitle>App notifications</DialogTitle><DialogDescription>Turn on alerts for new PMSV updates.</DialogDescription></DialogHeader>{supported?<><button className="subscription-submit" disabled={busy} onClick={()=>{void (enabled?disable():enable())}}>{busy?'Saving…':enabled?'Turn off notifications':'Allow notifications'}</button>{enabled&&<button className="subscription-submit notification-test" disabled={busy} onClick={()=>{void testNotification()}}>Send test notification</button>}{enabled&&<button className="subscription-submit notification-test" disabled={busy} onClick={()=>{void testNotification(true)}}>Repair and test notifications</button>}</>:<p className="push-status">Notifications are not supported by this browser.</p>}<p role="status" className="push-status">{message}</p><button className="subscription-submit notification-test" disabled={busy||checking} onClick={()=>{void checkNotificationStatus()}}>{checking?'Checking…':'Check notification status'}</button>{checks.length>0&&<div className="notification-checks"><p>These results stay on your device. Share a screenshot for support.</p><dl>{checks.map(check=><div key={check.label}><dt>{check.label}</dt><dd>{check.value}</dd></div>)}</dl><p>Installed Android app version: see Android App info. Website version above is separate.</p></div>}</DialogContent></Dialog></>;
}
