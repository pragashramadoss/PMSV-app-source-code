import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { LocalNotifications } from '@capacitor/local-notifications';

type Reply = { status: number; data: any };
type Desktop = { platform:string; request:(path:string,method:string,body?:any)=>Promise<Reply>; save:(name:string,base64:string)=>Promise<boolean>; print:(html?:string)=>Promise<boolean>; notify:(title:string,body:string)=>Promise<boolean>; open:(url:string)=>Promise<void> };
const host = window as unknown as { pmsvDesktop?:Desktop; PMSV:any; __PMSV_TEST_OFFLINE__?:boolean };
host.PMSV = { ...(host.PMSV||{}), base:'', publicBase:'/', nativeApp:true };
const nativeFetch = window.fetch.bind(window);
const Print = registerPlugin<{printReport:(options:{html?:string})=>Promise<void>}>('PmsvPrint');
const apiAllowed = (p:string,m:string) => m==='GET' ? /^\/api\/(news|updater|discussions(?:\/[0-9]+)?)$/.test(p) : m==='POST' && /^\/api\/discussions(?:\/report|\/[0-9]+\/answers)?$/.test(p);
export const nativePlatform = host.pmsvDesktop?.platform || Capacitor.getPlatform();

async function iphoneRequest(path:string, method:string, body?:any):Promise<Reply> {
  try {
    if (host.__PMSV_TEST_OFFLINE__) throw Error('Offline test');
    const response = await CapacitorHttp.request({url:'https://pmsvgroup.com'+path,method,headers:{Accept:'application/json',...(method==='POST'?{'Content-Type':'application/json',Origin:'https://pmsvgroup.com'}:{})},data:body,responseType:'json',connectTimeout:15000,readTimeout:18000});
    if (path==='/api/news' && response.status===200 && Array.isArray(response.data?.news)) {
      await Filesystem.writeFile({path:'news-cache.json',directory:Directory.Data,data:JSON.stringify(response.data),encoding:Encoding.UTF8});
    }
    return {status:response.status,data:response.data};
  } catch {
    if (path==='/api/news') {
      let data; try { const cached=await Filesystem.readFile({path:'news-cache.json',directory:Directory.Data,encoding:Encoding.UTF8});data=JSON.parse(cached.data as string); }
      catch {data={news:await (await nativeFetch('/archive-seed.json')).json()};}
      return {status:200,data:{...data,offline:true}};
    }
    if (path==='/api/updater') return {status:200,data:{active:false,checks:[]}};
    return {status:503,data:{error:'Connect to the internet to use Discussions. Your saved audits remain on this device.'}};
  }
}
export async function appRequest(path:string, method='GET', body?:any):Promise<Reply> {
  if (!apiAllowed(path,method)) return {status:403,data:{error:'Use Download or Print to share this report from your device.'}};
  if (host.pmsvDesktop) return host.pmsvDesktop.request(path,method,body);
  if (Capacitor.isNativePlatform()) return iphoneRequest(path,method,body);
  // Browser preview of the packaged build uses the bundled archive only.
  if(path==='/api/news')return {status:200,data:{news:await (await nativeFetch('/archive-seed.json')).json(),offline:true}};
  return {status:503,data:{error:'This action needs the installed app.'}};
}
window.fetch = async(input:RequestInfo|URL,init?:RequestInit) => {
  const request=input instanceof Request?input:null;
  const u=new URL(request?request.url:String(input),location.href);
  if (u.origin===location.origin && u.pathname.startsWith('/api/')) {
    const method=(init?.method||request?.method||'GET').toUpperCase();
    let body:any=undefined;
    if(init?.body)body=JSON.parse(String(init.body));else if(request&&method!=='GET')body=await request.clone().json();
    const r=await appRequest(u.pathname,method,body);
    return new Response(JSON.stringify(r.data),{status:r.status,headers:{'Content-Type':'application/json'}});
  }
  return nativeFetch(input,init);
};

export async function openExternal(value:string) {
  const u=new URL(value);if(!['https:','mailto:'].includes(u.protocol)||u.username||u.password)throw Error('Unsupported link');
  if(host.pmsvDesktop)return host.pmsvDesktop.open(u.href);
  if(u.protocol==='https:'&&Capacitor.isNativePlatform())return Browser.open({url:u.href});
  location.href=u.href;
}
function base64(blob:Blob):Promise<string> {return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(Error('Could not read report'));r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(blob)});}
async function saveReport(url:string,name:string) {
  const data=await (await nativeFetch(url)).blob();if(data.size>20*1024*1024)throw Error('Report is too large');
  const bytes=await base64(data);const filename=String(name||'PMSV-report').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').slice(0,150);
  if(host.pmsvDesktop){await host.pmsvDesktop.save(filename,bytes);return;}
  if(Capacitor.isNativePlatform()){
    const r=await Filesystem.writeFile({path:'exports/'+filename,directory:Directory.Cache,recursive:true,data:bytes});
    await Share.share({title:'PMSV report',url:r.uri,dialogTitle:'Save or share your report'});return;
  }
}
document.addEventListener('click',event=>{
  const a=(event.target as Element)?.closest?.('a');if(!a)return;
  if(a.href.startsWith('blob:')||a.href.startsWith('data:')){event.preventDefault();void saveReport(a.href,a.download).catch(e=>alert(e.message));return;}
  let u:URL;try{u=new URL(a.href)}catch{return;}
  if(u.origin===location.origin&&/^\/fssai-license\/?$/.test(u.pathname)){event.preventDefault();location.href='/fssai-license/index.html';return;}
  if(u.origin!==location.origin && ['https:','mailto:'].includes(u.protocol)){event.preventDefault();void openExternal(u.href).catch(e=>alert(e.message));}
},true);
// Some existing reports create a detached download anchor and call click().
const clickAnchor=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){if(this.href.startsWith('blob:')||this.href.startsWith('data:')){void saveReport(this.href,this.download).catch(e=>alert(e.message));}else clickAnchor.call(this);};
const realOpen=window.open.bind(window);
window.open=((url?:string|URL,target?:string,features?:string)=>{
  if(!url){const frame=document.createElement('iframe');frame.style.cssText='position:fixed;left:-10000px;width:900px;height:1200px';document.body.appendChild(frame);const w=frame.contentWindow!;w.print=()=>{void printReport(w.document.documentElement.outerHTML).finally(()=>frame.remove());};return w;}
  const u=new URL(String(url),location.href);
  if(u.origin===location.origin){location.href=u.href;return null;}
  if(['https:','mailto:'].includes(u.protocol)){void openExternal(u.href);return null;}
  return null;
}) as typeof window.open;
export async function printReport(html?:string) {
  if(host.pmsvDesktop)return host.pmsvDesktop.print(html);
  if(Capacitor.isNativePlatform())return Print.printReport({html});
}
window.print=()=>{void printReport();};

const preference='pmsv-native-alerts';
export const alertsEnabled=()=>localStorage.getItem(preference)==='on';
export async function enableAlerts() {
  if(Capacitor.isNativePlatform()){
    let p=await LocalNotifications.checkPermissions();if(p.display!=='granted')p=await LocalNotifications.requestPermissions();
    if(p.display!=='granted')throw Error('Allow PMSV notifications in your device settings.');
  }
  localStorage.setItem(preference,'on');
}
export function disableAlerts(){localStorage.setItem(preference,'off');}
export async function sendNewsNotification() {
  const r=await appRequest('/api/news');const news=(r.data?.news||[]).filter((n:any)=>n.tab==='news').sort((a:any,b:any)=>String(b.published).localeCompare(String(a.published))).slice(0,3);
  if(!news.length)throw Error('No news is available yet. Connect to the internet and try again.');
  const title='PMSV — '+news[0].published.slice(0,10)+' News';const body=news.map((n:any,i:number)=>(i+1)+'. '+n.title).join('\n');
  if(host.pmsvDesktop){if(!await host.pmsvDesktop.notify(title,body))throw Error('Notifications are unavailable in this desktop session.');}
  else if(Capacitor.isNativePlatform())await LocalNotifications.schedule({notifications:[{id:2100,title,body,schedule:{at:new Date(Date.now()+1000)},extra:{route:'/updates'}}]});
  localStorage.setItem('pmsv-last-alert-news',news[0].id);return r.data.offline?'Sent from the saved news archive.':'Sent the latest available news.';
}
if(Capacitor.isNativePlatform())void LocalNotifications.addListener('localNotificationActionPerformed',()=>{location.href='/updates';});
setInterval(()=>{if(alertsEnabled()&&document.visibilityState==='visible')void appRequest('/api/news').then(r=>{const latest=(r.data.news||[]).filter((n:any)=>n.tab==='news').sort((a:any,b:any)=>String(b.published).localeCompare(String(a.published)))[0];if(latest&&!r.data.offline&&latest.id!==localStorage.getItem('pmsv-last-alert-news'))void sendNewsNotification();}).catch(()=>{});},15*60*1000);
