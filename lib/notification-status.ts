export const NOTIFICATION_VERSION='1.0.25';
export type NotificationCheck={label:string;value:string};

export function installedNotificationContext(){
 if(['standalone','fullscreen','minimal-ui'].some(mode=>window.matchMedia(`(display-mode: ${mode})`).matches))return true;
 if((navigator as Navigator&{standalone?:boolean}).standalone===true)return true;
 try{const referrer=new URL(document.referrer);return referrer.protocol==='android-app:'&&referrer.hostname==='com.pmsvgroup.foodsafety'}catch{return false}
}

// Invoke from the user's gesture, before any network or service-worker awaits.
export function requestNotificationPermission():Promise<NotificationPermission>{
 return Notification.permission==='granted'?Promise.resolve('granted'):Notification.requestPermission();
}

async function bounded<T>(work:Promise<T>):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([work,new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),4000)})])}
 finally{if(timer!==undefined)clearTimeout(timer)}
}

// Read-only, on-device diagnostics. Never include subscription endpoints, ownership
// tokens, keys, full referrers, user agents, or browsing history in the result.
export async function readNotificationStatus(base:string):Promise<NotificationCheck[]>{
 const checks:NotificationCheck[]=[
  {label:'PMSV website',value:NOTIFICATION_VERSION},
  {label:'Opened as',value:installedNotificationContext()?'Installed app':'Browser tab'},
  {label:'Secure connection',value:window.isSecureContext?'Yes':'No'},
  {label:'Notification permission',value:'Notification' in window?Notification.permission:'Unsupported'}
 ];
 try{checks.push({label:'Permission service',value:navigator.permissions?(await bounded(navigator.permissions.query({name:'notifications'}))).state:'Unavailable'})}
 catch{checks.push({label:'Permission service',value:'Unavailable'})}
 try{checks.push({label:'PMSV alerts preference',value:localStorage.getItem('pmsv-push-preference')==='off'?'Off':'Not switched off'})}
 catch{checks.push({label:'PMSV alerts preference',value:'Storage unavailable'})}
 let reg:ServiceWorkerRegistration|undefined;
 try{reg='serviceWorker' in navigator?await bounded(navigator.serviceWorker.getRegistration(base+'/')):undefined;
  checks.push({label:'Notification service',value:reg?.active?'Active':reg?'Starting':'Not registered'})}
 catch{checks.push({label:'Notification service',value:'Unavailable'})}
 let sub:PushSubscription|null=null;
 if(reg?.pushManager){
  try{sub=await bounded(reg.pushManager.getSubscription());checks.push({label:'Push registration',value:sub?'Present':'Missing'})}
  catch{checks.push({label:'Push registration',value:'Unavailable'})}
 }else checks.push({label:'Push registration',value:'Unavailable'});
 let key:Uint8Array|undefined;
 try{
  const response=await fetch(base+'/api/push',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(4000)});
  const data=await response.json() as {publicKey?:string};
  if(!response.ok||!data.publicKey)throw Error('unavailable');
  const clean=data.publicKey.replace(/-/g,'+').replace(/_/g,'/');
  key=Uint8Array.from(atob(clean+'='.repeat((4-clean.length%4)%4)),c=>c.charCodeAt(0));
  if(key.length!==65||key[0]!==4)throw Error('invalid');
  checks.push({label:'PMSV push server',value:'Reachable'});
 }catch{key=undefined;checks.push({label:'PMSV push server',value:'Unavailable'})}
 if(key&&sub){
  const oldKey=sub.options.applicationServerKey;
  const matches=Boolean(oldKey&&oldKey.byteLength===key.length&&new Uint8Array(oldKey).every((byte,i)=>byte===key![i]));
  checks.push({label:'Registration key',value:matches?'Matches':'Needs repair'});
 }
 if(key&&reg?.pushManager){
  try{checks.push({label:'Push permission',value:await bounded(reg.pushManager.permissionState({userVisibleOnly:true,applicationServerKey:key as BufferSource}))})}
  catch{checks.push({label:'Push permission',value:'Unavailable'})}
 }
 return checks;
}
