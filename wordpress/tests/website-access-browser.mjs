import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const plugin=path.resolve('wordpress/plugin');
const manifest=JSON.parse(await readFile(plugin+'/assets/.vite/manifest.json','utf8'))['index.html'];
const shell=`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><script>window.PMSV={base:'',publicBase:'/public/'};</script>${manifest.css.map(p=>`<link rel="stylesheet" href="/assets/${p}">`).join('')}</head><body><div id="root"></div><script type="module" src="/assets/${manifest.file}"></script></body></html>`;
const story={id:'bookmark-qa',tab:'general',region:'india',title:'A practical food safety update',summary:'Original article details remain in Bookmarks even after the live feed changes.',published:'2026-11-15',category:'Food safety',source:'QA source',url:'https://example.org/food-safety-update',sourceType:'Original article',firstSeen:'2026-11-15',verifiedAt:'2026-11-15'};
let feed=[story];
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(['/','/downloads','/downloads/','/about','/privacy','/discussions','/bookmarks','/news/india','/updates'].includes(url.pathname)){res.setHeader('Content-Type','text/html');res.end(shell);return;}
 if(url.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(url.pathname==='/api/news'?{news:feed}:{active:false}));return;}
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
const savePage=page=>page.getByRole('button',{name:'Save bookmark: this page',exact:true});
const saveStory=page=>page.getByRole('button',{name:'Save bookmark: '+story.title,exact:true});
const removeStory=page=>page.getByRole('button',{name:'Remove bookmark: '+story.title,exact:true});
const count=async(page,n)=>{await page.waitForFunction(n=>document.querySelectorAll('.saved-card').length===n,n);};
async function newPage(options={}){
 const context=await browser.newContext(options);
 const page=await context.newPage();
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
 await saveStory(page).waitFor();
 assert.equal(await page.getByRole('link',{name:/download.*app|download PMSV|install PMSV/i}).count(),0);
 assert.equal(await page.locator('a[href*="/downloads"],a[href*="pmsv_android"],link[rel="manifest"]').count(),0);
 assert.equal(await page.evaluate(()=>window.permissionRequests),0);
 await checkLayout(page);
 await savePage(page).click();
 await page.getByRole('button',{name:'Remove bookmark: this page',exact:true}).waitFor();
 assert.equal(await page.getByRole('dialog').count(),0);
 await saveStory(page).click();
 await removeStory(page).waitFor();
 assert.equal(page.url(),base+'/');
 assert.equal(await removeStory(page).getAttribute('aria-pressed'),'true');
 await page.screenshot({path:'wordpress/test-results/website-desktop.png',fullPage:true});
 await page.reload();
 await removeStory(page).waitFor();
 await page.goto(base+'/news/india');
 await removeStory(page).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pmsv-bookmarks-v1')).items.length),2);
 await page.locator('.primary-nav').getByRole('link',{name:'Bookmarks',exact:true}).click();
 await page.getByRole('heading',{name:'Bookmarks',exact:true}).waitFor();
 await count(page,2);
 assert.equal(await page.getByRole('link',{name:'Open: '+story.title}).getAttribute('href'),story.url);
 assert.equal(await page.getByRole('link',{name:'Open: '+story.title}).getAttribute('target'),'_blank');
 await page.getByLabel('Search bookmarks',{exact:true}).fill('practical');await count(page,1);
 await page.getByLabel('Search bookmarks',{exact:true}).fill('missing result');
 await page.getByRole('heading',{name:'No matching bookmarks'}).waitFor();
 await page.getByRole('button',{name:'Show all bookmarks'}).click();await count(page,2);
 await page.getByRole('button',{name:'Pages',exact:true}).click();await count(page,1);
 await page.getByRole('button',{name:'Articles',exact:true}).click();await count(page,1);
 await page.getByRole('button',{name:'All',exact:true}).click();await count(page,2);
 await page.screenshot({path:'wordpress/test-results/bookmarks-desktop.png',fullPage:true});
 await page.context().route(story.url,route=>route.fulfill({contentType:'text/html',body:'<h1>Original article</h1>'}));
 const [original]=await Promise.all([page.waitForEvent('popup'),page.getByRole('link',{name:'Open: '+story.title}).click()]);
 await original.getByRole('heading',{name:'Original article'}).waitFor();assert.equal(original.url(),story.url);await original.close();
 // Feed changes and API failure cannot erase locally saved snapshots.
 feed=[];
 await page.route('**/api/news',route=>route.abort());
 await page.reload();await count(page,2);
 assert(await page.getByText(story.summary,{exact:true}).isVisible());
 await page.unroute('**/api/news');feed=[story];
 const tab=await page.context().newPage();
 await tab.goto(base+'/');await removeStory(tab).waitFor();
 await removeStory(page).click();await count(page,1);await saveStory(tab).waitFor();
 await saveStory(tab).click();await count(page,2);
 await tab.close();
 await page.getByRole('link',{name:'Open: Welcome to the Forum · PMSV',exact:true}).click();
 await page.getByRole('heading',{name:'Welcome to the Forum',exact:true}).waitFor();
 await removeStory(page).waitFor();
 // Notifications still ask only after an explicit Allow action.
 await page.getByRole('button',{name:'Turn on website notifications'}).click();
 await page.getByRole('dialog',{name:'Website notifications'}).waitFor();
 assert.equal(await page.evaluate(()=>window.permissionRequests),0);
 await page.getByRole('button',{name:'Allow notifications',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Notifications are blocked for this website.'}).waitFor();
 assert.equal(await page.evaluate(()=>window.permissionRequests),1);
 await page.getByText('1.0.29',{exact:true}).waitFor();
 await page.keyboard.press('Escape');
 for(const route of ['/downloads','/downloads/']){
  await page.goto(base+route+'?old=1#android');
  await page.getByRole('heading',{name:'Welcome to the Forum',exact:true}).waitFor();
  assert.equal(page.url(),base+'/');
 }
 // Closing and reopening a tab in the same browser retains the list.
 const context=page.context();await page.close();
 const reopened=await context.newPage();await reopened.goto(base+'/bookmarks');await count(reopened,2);
 await removeStory(reopened).click();
 await reopened.getByRole('button',{name:'Remove bookmark: Welcome to the Forum · PMSV',exact:true}).click();
 await reopened.getByRole('heading',{name:'No bookmarks yet'}).waitFor();
 await reopened.reload();await reopened.getByRole('heading',{name:'No bookmarks yet'}).waitFor();
 const android=await newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'});
 await android.goto(base+'/');await saveStory(android).click();await removeStory(android).waitFor();
 await savePage(android).click();
 await android.getByRole('button',{name:'Remove bookmark: this page',exact:true}).waitFor();
 await checkLayout(android);await android.screenshot({path:'wordpress/test-results/website-android.png',fullPage:true});
 await android.goto(base+'/bookmarks');await count(android,2);await checkLayout(android);
 await android.screenshot({path:'wordpress/test-results/bookmarks-android.png',fullPage:true});
 await android.setViewportSize({width:320,height:700});await checkLayout(android);
 await android.screenshot({path:'wordpress/test-results/bookmarks-320.png',fullPage:true});
 await android.goto(base+'/');await removeStory(android).waitFor();await checkLayout(android);
 const iphone=await newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
 await iphone.addInitScript(()=>{delete window.Notification;delete window.PushManager;});
 await iphone.goto(base+'/');await saveStory(iphone).click();await removeStory(iphone).waitFor();
 await iphone.getByRole('button',{name:'Turn on website notifications'}).click();
 await iphone.getByText('Notifications are unavailable in an iPhone or iPad browser tab.',{exact:false}).waitFor();
 assert.equal(await iphone.getByRole('button',{name:'Allow notifications',exact:true}).count(),0);
 await checkLayout(iphone);
 const blocked=await newPage();
 await blocked.addInitScript(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='pmsv-bookmarks-v1')throw new DOMException('Storage full','QuotaExceededError');return set.call(this,key,value);};});
 await blocked.goto(base+'/');await saveStory(blocked).click();
 await blocked.getByRole('alert').filter({hasText:'Bookmarks are unavailable'}).waitFor();
 assert.equal(await saveStory(blocked).getAttribute('aria-pressed'),'false');
 assert.equal(await blocked.evaluate(()=>localStorage.getItem('pmsv-bookmarks-v1')),null);
 const corrupt=await newPage();
 await corrupt.addInitScript(()=>localStorage.setItem('pmsv-bookmarks-v1','{corrupt'));
 await corrupt.goto(base+'/');await saveStory(corrupt).click();
 await corrupt.getByRole('alert').filter({hasText:'They have not been changed.'}).waitFor();
 assert.equal(await corrupt.evaluate(()=>localStorage.getItem('pmsv-bookmarks-v1')),'{corrupt');
 assert.deepEqual(errors,[]);
 console.log('PASS one-tap page/article saving; no instruction dialog; reload and reopened-tab persistence; cross-tab updates; feed-independent snapshots; original links; search and filters; remove and empty states; failed-write honesty; corrupt-data preservation; notification permission regression; retired downloads; 390px and 320px layouts; no JavaScript errors.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
