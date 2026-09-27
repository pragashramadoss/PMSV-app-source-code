'use client';
import {useEffect,useState} from 'react';
import {Bell,BellRing,Download} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function AppNotifications(){
 const [open,setOpen]=useState(false),[enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[supported,setSupported]=useState(false),[installed,setInstalled]=useState(false),[install,setInstall]=useState<InstallEvent|null>(null);
 useEffect(()=>{
  const standalone=matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;setInstalled(standalone);
  setSupported('serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(async reg=>{
   if(!('PushManager' in window)||!('Notification' in window))return;
   const sub=await reg.pushManager.getSubscription(),token=localStorage.getItem('pmsv-push-token');
   let preference=localStorage.getItem('pmsv-push-preference');
   // Preserve opt-outs made before the explicit preference was introduced.
   if(!preference&&token&&!sub){preference='off';localStorage.setItem('pmsv-push-preference','off')}
   if(preference==='off'){if(sub)await disable();return;}
   if(Notification.permission==='granted'){
    if(sub&&token&&preference==='on')setEnabled(true);
    else await enable(false);
   }
   else if(Notification.permission==='default'&&!localStorage.getItem('pmsv-push-prompt-shown')){
    localStorage.setItem('pmsv-push-prompt-shown','true');setOpen(true);
   }
  }).catch(()=>{});
  const prompt=(e:Event)=>{e.preventDefault();setInstall(e as InstallEvent)};const done=()=>{setInstalled(true);setInstall(null)};
  window.addEventListener('beforeinstallprompt',prompt);window.addEventListener('appinstalled',done);return()=>{window.removeEventListener('beforeinstallprompt',prompt);window.removeEventListener('appinstalled',done)};
 },[]);
 async function enable(askPermission=true){
  setBusy(true);setMessage('');let created:PushSubscription|null=null;
  try{
   // Invoke directly from the button, before network awaits, for Safari's user gesture requirement.
   const permission=askPermission?await Notification.requestPermission():Notification.permission;if(permission!=='granted')throw Error('Notifications are blocked or were not allowed. You can allow them in your browser or phone notification settings.');
   const reg=await navigator.serviceWorker.ready;const response=await fetch('/api/push',{signal:AbortSignal.timeout(10000)});const config=await response.json() as {publicKey:string;error?:string};if(!response.ok)throw Error(config.error);
   let sub=await reg.pushManager.getSubscription(),token=localStorage.getItem('pmsv-push-token');
   if(sub&&!token){await sub.unsubscribe();sub=null}
   if(!token){token=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem('pmsv-push-token',token)}
   if(!sub){const key=Uint8Array.from(atob(config.publicKey.replace(/-/g,'+').replace(/_/g,'/')),(c:string)=>c.charCodeAt(0));sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});created=sub}
   const result=await fetch('/api/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:sub.endpoint,token}),signal:AbortSignal.timeout(10000)});const data=await result.json() as {error?:string};if(!result.ok)throw Error(data.error);
   localStorage.setItem('pmsv-push-preference','on');setEnabled(true);setMessage('Notifications are enabled for this device. Alerts follow successful publication and notification delivery.');
  }catch(e){if(created)await created.unsubscribe().catch(()=>{});setMessage(e instanceof Error?e.message:'Could not turn on notifications. Try again.')}finally{setBusy(false)}
 }
 async function disable(){
  setBusy(true);setMessage('');
  try{
   localStorage.setItem('pmsv-push-preference','off');
   const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();
   let serverRemoved=true;
   if(sub){
    // Revocation at the browser must still run when the server is unreachable.
    try{const response=await fetch('/api/push',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:sub.endpoint,token:localStorage.getItem('pmsv-push-token')}),signal:AbortSignal.timeout(8000)});serverRemoved=response.ok}catch{serverRemoved=false}
    await sub.unsubscribe();
    if(await reg.pushManager.getSubscription())throw Error('Your browser could not turn notifications off. Please block them in device settings.');
   }
   setEnabled(false);setMessage(serverRemoved?'Notifications are off on this device.':'Notifications are off on this device. Server cleanup is pending; the expired push address will be removed after a delivery attempt.');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not turn off notifications. Please use device settings.')}finally{setBusy(false)}
 }
 async function installApp(){if(install){await install.prompt();const choice=await install.userChoice;if(choice.outcome==='accepted')setInstall(null)}else setMessage('Android: open this app in Chrome, then use the browser menu → Install app or Add to Home screen. iPhone/iPad: open in Safari → Share → Add to Home Screen, then launch it from your Home Screen.')}
 return <><div className="app-notification-actions">{!installed&&<button onClick={()=>{setOpen(true);void installApp()}}><Download size={18}/><span>Install app</span></button>}<button onClick={()=>setOpen(true)} aria-label={enabled?'Manage app notifications':'Turn on app notifications'}>{enabled?<BellRing size={19}/>:<Bell size={19}/>}<span>{enabled?'Notifications on':'Notifications'}</span></button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="subscription-dialog"><DialogHeader><DialogTitle>App notifications</DialogTitle><DialogDescription>Notifications stay on after you allow them, unless you turn them off. Tap an alert to open the latest updates.</DialogDescription></DialogHeader><p className="push-privacy">No email, phone number or sign-in needed. We store this browser’s push address to deliver alerts. You can turn them off here at any time.</p>{!installed&&<div className="push-install"><strong>Keep PMSV on your Home Screen</strong><p>On iPhone and iPad, install and open the Home Screen app before enabling notifications.</p><button onClick={installApp}><Download size={17}/>Install app / instructions</button></div>}{supported?<><button className="subscription-submit" disabled={busy} onClick={()=>{void (enabled?disable():enable())}}>{busy?'Saving…':enabled?'Turn off notifications':'Allow notifications'}</button>{!enabled&&<button className="text-button" disabled={busy} onClick={()=>{void disable()}}>Keep notifications off</button>}</>:<p>This browser does not offer app notifications here. Try Chrome on Android or open the installed Home Screen app on iPhone/iPad.</p>}<p role="status" className="push-status">{message}</p><p className="subscription-privacy">Alerts follow successful daily updates. Device settings, connectivity and browser support can affect delivery. Older stories are not sent when you first subscribe.</p></DialogContent></Dialog></>;
}
