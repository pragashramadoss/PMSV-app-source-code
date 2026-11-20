'use client';
import {useEffect,useState} from 'react';
import {Bell,BellRing} from 'lucide-react';
import {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {readNotificationStatus,requestNotificationPermission,type NotificationCheck} from '@/lib/notification-status';

type PMSVWindow=Window&{PMSV?:{base?:string;publicBase?:string}};

function basePath(){
 if(typeof window==='undefined')return '';
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
 const reg=await navigator.serviceWorker.register(appUrl('/?pmsv-sw=1&v=1.0.34'),{scope:appUrl('/'),updateViaCache:'none'});
 await navigator.serviceWorker.ready;
 return reg;
}

function dailyNewsInApp(){
 try{return localStorage.getItem('pmsv-daily-delivery')==='app'}catch{return false}
}

let pendingRegistration:Promise<unknown>=Promise.resolve();
function registrationLock<T>(work:()=>Promise<T>){
 if(navigator.locks)return navigator.locks.request('pmsv-push-registration',work);
 const result=pendingRegistration.then(work);
 pendingRegistration=result.catch(()=>{});
 return result;
}

async function postSubscription(sub:PushSubscription,token:string,dailyNews?:boolean){
 const saved=localStorage.getItem('pmsv-push-replacement');
 const previous=saved?JSON.parse(saved) as {endpoint:string;token:string}:undefined;
 const previousChoice=localStorage.getItem('pmsv-daily-delivery');
 const result=await fetch(appUrl('/api/push'),{
  method:'POST',
  credentials:'same-origin',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({endpoint:sub.endpoint,token,dailyNews,newDailyNews:previousChoice==='app'?false:undefined,...(previous?{previous}:{})}),
  signal:AbortSignal.timeout(12000)
 });
 const data=await result.json().catch(()=>({})) as {error?:string;refreshRequired?:boolean;dailyNews?:boolean};
 if(!result.ok)throw Object.assign(Error(data.error||'Could not save notification subscription.'),{status:result.status});
 if(dailyNews!==undefined && data.dailyNews!==dailyNews)throw Error('The website could not confirm the daily news setting. Please try again.');
 if(!data.refreshRequired && typeof data.dailyNews==='boolean' && (dailyNews!==undefined||localStorage.getItem('pmsv-daily-delivery')===previousChoice)){
  localStorage.setItem('pmsv-daily-delivery',data.dailyNews?'browser':'app');
 }
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
async function prepareGrantedSubscription(forceRefresh=false,dailyNews?:boolean,forReplies=false){
 return registrationLock(()=>prepareGrantedSubscriptionUnlocked(forceRefresh,dailyNews,forReplies));
}
async function prepareGrantedSubscriptionUnlocked(forceRefresh=false,dailyNews?:boolean,forReplies=false){
 if(!window.isSecureContext||!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))return null;
 if(Notification.permission!=='granted'||localStorage.getItem('pmsv-push-preference')==='off')return null;
 const reg=await registerPmsvServiceWorker();
 let sub=await reg.pushManager.getSubscription();
 if(!sub && dailyNewsInApp() && dailyNews!==true && !forReplies && !localStorage.getItem('pmsv-push-replacement'))return null;
 const response=await fetch(appUrl('/api/push'),{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(12000)});
 const config=await response.json().catch(()=>({})) as {publicKey?:string;error?:string};
 if(!response.ok||!config.publicKey)throw Error(config.error||'Could not prepare notifications.');
 const key=pushKey(config.publicKey);
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
  const saved=await postSubscription(sub,token,dailyNews);
  if(saved.refreshRequired){
   ({sub,token}=await renewSubscription(reg,sub,token,key));
   const renewed=await postSubscription(sub,token,dailyNews);
   if(renewed.refreshRequired)throw Error('Push registration is still rejected after refresh. Please send a test.');
  }
 }
 catch(e){
  if((e as Error&{status?:number}).status!==409)throw e;
  // A lost local ownership token cannot migrate an older device's private alerts.
  localStorage.removeItem('pmsv-push-replacement');
  ({sub,token}=await renewSubscription(reg,sub,null,key));
  await postSubscription(sub,token,dailyNews);
 }
 localStorage.setItem('pmsv-push-preference','on');
 localStorage.setItem('pmsv-push-sync-v2',String(Date.now()));
 return {reg,sub,token};
}

async function useAppForDailyNews(){
 return registrationLock(async()=>{
  const reg=await navigator.serviceWorker.getRegistration(appUrl('/'));
  const sub=await reg?.pushManager.getSubscription();
  let browserSubscription=Boolean(sub);
  const saved=localStorage.getItem('pmsv-push-replacement');
  const previous=saved?JSON.parse(saved) as {endpoint:string;token:string}:null;
  const subscriptions=new Map<string,string|null>();
  if(previous)subscriptions.set(previous.endpoint,previous.token);
  if(sub)subscriptions.set(sub.endpoint,localStorage.getItem('pmsv-push-token')||subscriptions.get(sub.endpoint)||null);
  for(const [endpoint,token] of subscriptions){
   const response=await fetch(appUrl('/api/push/delivery'),{
    method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({endpoint,token,dailyNews:false}),signal:AbortSignal.timeout(12000)
   });
   const result=await response.json().catch(()=>({})) as {dailyNews?:boolean;error?:string};
   if(response.status===409 && endpoint===sub?.endpoint){
    // Local ownership proof was lost. The browser can revoke its own endpoint.
    const removed=await sub.unsubscribe();
    if(removed||!await reg?.pushManager.getSubscription()){
     localStorage.removeItem('pmsv-push-token');
     if(previous?.endpoint===endpoint)localStorage.removeItem('pmsv-push-replacement');
     browserSubscription=false;
     continue;
    }
   }
   if(!response.ok||result.dailyNews!==false)throw Error(result.error||'Could not switch daily news to the app. Please try again.');
  }
  localStorage.setItem('pmsv-daily-delivery','app');
  return browserSubscription;
 });
}

// Called only from the question form's submit gesture. Permission is never requested
// silently, and the existing PMSV VAPID/device subscription is reused.
export async function subscribeToDiscussionAnswers():Promise<{endpoint:string;token:string}>{
 if(!window.isSecureContext||!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))
  throw Error('This browser does not support answer notifications.');
 const permission=await requestNotificationPermission();
 if(permission!=='granted')throw Error('Allow PMSV notifications, or untick the answer-alert checkbox to post without them.');
 localStorage.removeItem('pmsv-push-preference');
 const subscription=await prepareGrantedSubscription(false,undefined,true);
 if(!subscription)throw Error('Could not activate notifications. Untick the answer-alert checkbox to post without them.');
 return {endpoint:subscription.sub.endpoint,token:subscription.token};
}

export default function AppNotifications(){
 const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[supported,setSupported]=useState(false),[appleMobile,setAppleMobile]=useState(false);
 const [checks,setChecks]=useState<NotificationCheck[]>([]),[checking,setChecking]=useState(false);
 const [android,setAndroid]=useState(false),[appDaily,setAppDaily]=useState(false);

 useEffect(()=>{
  setSupported(window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window);
  setAppleMobile(/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1));
  setAndroid(/Android/i.test(navigator.userAgent)||(navigator as Navigator&{userAgentData?:{platform?:string}}).userAgentData?.platform==='Android');
  const readDelivery=()=>setAppDaily(dailyNewsInApp());
  const openSettingsLink=()=>{if(window.location.hash==='#notifications')setOpen(true)};
  readDelivery();openSettingsLink();
  window.addEventListener('storage',readDelivery);
  window.addEventListener('hashchange',openSettingsLink);

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
    if(!cancelled){setEnabled(Boolean(synced));readDelivery()}
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
   window.removeEventListener('storage',readDelivery);
   window.removeEventListener('hashchange',openSettingsLink);
   document.removeEventListener('visibilitychange',onVisible);
   window.removeEventListener('online',onOnline);
   window.removeEventListener('focus',onFocus);
   permissionStatus?.removeEventListener('change',onPermissionChange);
  };
 },[]);

 async function enable(switchToBrowser=false){
  setBusy(true);setMessage('');setChecks([]);
  try{
   if(!window.isSecureContext)throw Error('Notifications require HTTPS.');
   if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('Notifications are not supported by this browser.');

   const permission=await requestNotificationPermission();
   if(permission!=='granted'){
    void checkNotificationStatus(permission);
    throw Error(permission==='denied'?'Notifications are blocked for this website. Open your browser’s site settings for PMSV, allow notifications, then try again.':'Notification permission was not granted.');
   }

   localStorage.removeItem('pmsv-push-preference');
   const synced=await prepareGrantedSubscription(false,switchToBrowser?true:undefined);
   if(!synced)throw Error('Could not prepare notifications.');
   setEnabled(true);
   setAppDaily(dailyNewsInApp());
   setMessage('Notifications are on.');
  }catch(e){
   setEnabled(false);
   setMessage(e instanceof Error?e.message:'Could not turn on notifications.');
  }finally{setBusy(false)}
 }

 async function chooseApp(){
  setBusy(true);setMessage('');setChecks([]);
  try{
   const browserSubscription=await useAppForDailyNews();
   setEnabled(browserSubscription);
   setAppDaily(true);
   setMessage('This browser will skip the daily news alert.');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not save the daily news setting. Please try again.')}
  finally{setBusy(false)}
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
   setMessage('Push provider accepted the test. Check whether it arrives on your device.');
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

 return <Dialog open={open} onOpenChange={setOpen}>
  <div className="app-notification-actions">
   <DialogTrigger asChild><button type="button" aria-label={enabled||appDaily?'Manage website notifications':'Turn on website notifications'} title="Website notifications">{enabled||appDaily?<BellRing size={19} aria-hidden="true"/>:<Bell size={19} aria-hidden="true"/>}<span>{appDaily?'Notifications':enabled?'Notifications on':'Notifications'}</span></button></DialogTrigger>
  </div>
  <DialogContent className="subscription-dialog">
   <DialogHeader>
    <DialogTitle>Website notifications</DialogTitle>
    <DialogDescription>{appDaily?'Your PMSV app is selected for daily news on this phone.':'Get alerts for new PMSV updates in this browser.'}</DialogDescription>
   </DialogHeader>
   {supported?<>
    {android&&!appDaily&&<>
     <p className="push-status">Already receiving daily news in the PMSV Android app?</p>
     <button className="subscription-submit" disabled={busy} onClick={()=>{void chooseApp()}}>Use PMSV app only</button>
    </>}
    {appDaily?<>
     <p className="push-status">To move daily news back here, first turn off daily news in the app.</p>
     <button className="subscription-submit notification-test" disabled={busy} onClick={()=>{void enable(true)}}>Use this browser for daily news</button>
     {enabled&&<button className="subscription-submit notification-test" disabled={busy} onClick={()=>{void disable()}}>Turn off browser reply alerts</button>}
    </>:<>
     <button className="subscription-submit" disabled={busy} onClick={()=>{void (enabled?disable():enable())}}>{busy?'Saving…':enabled?'Turn off notifications':'Allow notifications'}</button>
     {enabled&&<>
      <button className="subscription-submit notification-test" disabled={busy} onClick={()=>{void testNotification()}}>Send test notification</button>
      <button className="subscription-submit notification-test" disabled={busy} onClick={()=>{void testNotification(true)}}>Repair and test notifications</button>
     </>}
    </>}
   </>:<p className="push-status">{appleMobile?'Notifications are unavailable in an iPhone or iPad browser tab. You can still visit PMSV for updates.':'Notifications are not supported by this browser. You can still visit PMSV for updates.'}</p>}
   <p role="status" className="push-status">{message}</p>
   <button className="subscription-submit notification-test" disabled={busy||checking} onClick={()=>{void checkNotificationStatus()}}>{checking?'Checking…':'Check notification status'}</button>
   {checks.length>0&&<div className="notification-checks"><p>These results stay on your device. Share a screenshot for support.</p><dl>{checks.map(check=><div key={check.label}><dt>{check.label}</dt><dd>{check.value}</dd></div>)}</dl></div>}
  </DialogContent>
 </Dialog>;
}
