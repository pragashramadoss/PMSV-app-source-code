import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const plugin=path.resolve('wordpress/plugin');
const manifest=JSON.parse(await readFile(plugin+'/assets/.vite/manifest.json','utf8'))['index.html'];
const shell=`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><script>window.PMSV={base:'',publicBase:'/public/'};</script>${manifest.css.map(p=>`<link rel="stylesheet" href="/assets/${p}">`).join('')}</head><body><div id="root"></div><script type="module" src="/assets/${manifest.file}"></script></body></html>`;
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(['/','/downloads','/downloads/','/about','/privacy','/discussions','/bookmarks','/bookmarks/','/updates','/news/india'].includes(url.pathname)){res.setHeader('Content-Type','text/html');res.end(shell);return;}
 if(url.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(url.pathname==='/api/news'?{news:[{id:'qa-story',tab:'general',region:'india',title:'Food safety and quality update',summary:'A public source article for website navigation verification.',published:'2026-11-15',category:'Food safety',source:'QA source',url:'https://example.org/food-safety',sourceType:'Original source',firstSeen:'2026-11-15',verifiedAt:'2026-11-15'}]}:{active:false}));return;}
 if(!url.pathname.startsWith('/assets/')&&!url.pathname.startsWith('/public/')){res.statusCode=404;res.end();return;}
 const file=path.resolve(plugin,'.'+url.pathname);
 if(!file.startsWith(plugin+path.sep)){res.statusCode=400;res.end();return;}
 try{const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'})[ext]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
await mkdir('wordpress/test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const checkLayout=async page=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
async function noInternalBookmarks(page){
 assert.equal(await page.getByRole('button',{name:/bookmark/i}).count(),0);
 assert.equal(await page.getByRole('link',{name:/bookmark/i}).count(),0);
 assert.equal(await page.locator('a[href*="/bookmarks"],.bookmark-save,.page-bookmark,.bookmarks-panel').count(),0);
}
async function newPage(options={}){
 const page=await browser.newPage(options);
 page.on('pageerror',error=>errors.push(error.message));
 return page;
}
try{
 const page=await newPage({viewport:{width:1365,height:950}});
 await page.addInitScript(()=>{
  window.permissionRequests=0;
  let permission='default';
  Object.defineProperty(Notification,'permission',{get:()=>permission});
  Notification.requestPermission=async()=>{window.permissionRequests++;permission='denied';return permission;};
 });
 await page.goto(base+'/');
 await page.getByRole('heading',{name:'Welcome to the Forum',exact:true}).waitFor();
 await page.getByRole('link',{name:/QA source/}).waitFor();
 await noInternalBookmarks(page);
 assert.equal(await page.getByRole('link',{name:/download.*app|download PMSV|install PMSV/i}).count(),0);
 assert.equal(await page.locator('a[href*="/downloads"],a[href*="pmsv_android"],link[rel="manifest"]').count(),0);
 assert.equal(await page.locator('.primary-nav>a').count(),5);
 assert.equal(await page.evaluate(()=>window.permissionRequests),0);
 await checkLayout(page);
 await page.screenshot({path:'wordpress/test-results/website-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Turn on website notifications'}).click();
 await page.getByRole('dialog',{name:'Website notifications'}).waitFor();
 assert.equal(await page.evaluate(()=>window.permissionRequests),0);
 await page.getByRole('button',{name:'Allow notifications',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Notifications are blocked for this website.'}).waitFor();
 assert.equal(await page.evaluate(()=>window.permissionRequests),1);
 await page.getByText('1.0.30',{exact:true}).waitFor();
 await page.keyboard.press('Escape');
 for(const route of ['/downloads','/downloads/','/bookmarks','/bookmarks/']){
  await page.goto(base+route+'?old=1#saved');
  await page.getByRole('heading',{name:'Welcome to the Forum',exact:true}).waitFor();
  assert.equal(page.url(),base+'/');await noInternalBookmarks(page);
 }
 for(const [route,heading] of [['/about','About me'],['/privacy','Privacy policy'],['/news/india','India food safety news'],['/updates','Updates/News'],['/discussions','Discussions']]){
  await page.goto(base+route);await page.getByRole('heading',{name:heading,exact:true}).waitFor();await noInternalBookmarks(page);
 }
 const android=await newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'});
 await android.goto(base+'/');await android.getByRole('link',{name:/QA source/}).waitFor();
 await noInternalBookmarks(android);await checkLayout(android);
 await android.screenshot({path:'wordpress/test-results/website-android.png',fullPage:true});
 await android.setViewportSize({width:320,height:700});await checkLayout(android);
 const iphone=await newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
 await iphone.addInitScript(()=>{delete window.Notification;delete window.PushManager;});
 await iphone.goto(base+'/');await iphone.getByRole('heading',{name:'Welcome to the Forum',exact:true}).waitFor();await noInternalBookmarks(iphone);
 await iphone.getByRole('button',{name:'Turn on website notifications'}).click();
 await iphone.getByText('Notifications are unavailable in an iPhone or iPad browser tab.',{exact:false}).waitFor();
 assert.equal(await iphone.getByRole('button',{name:'Allow notifications',exact:true}).count(),0);
 assert.equal(await iphone.getByRole('link',{name:/install|download/i}).count(),0);
 await checkLayout(iphone);
 assert.deepEqual(errors,[]);
 console.log('PASS no internal bookmark page or save/help controls; original five navigation items; retired bookmarks and downloads redirect home; unchanged notification permission flow; desktop, Android and iPhone layouts; no JavaScript errors.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
