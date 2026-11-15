import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

const plugin=path.resolve('wordpress/plugin');
const manifest=JSON.parse(await readFile(plugin+'/assets/.vite/manifest.json','utf8'))['index.html'];
const shell=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script>window.PMSV={base:'',publicBase:'/public/'};</script>${manifest.css.map(p=>`<link rel="stylesheet" href="/assets/${p}">`).join('')}</head><body><div id="root"></div><script type="module" src="/assets/${manifest.file}"></script></body></html>`;
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/downloads'||url.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(shell);return;}
  if(url.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(url.pathname==='/api/news'?{news:[]}:{active:false}));return;}
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
try{
  const page=await browser.newPage({viewport:{width:1365,height:950}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/downloads');
  await page.getByRole('heading',{name:'Download PMSV',exact:true}).waitFor();
  for(const name of ['Android','iPhone & iPad','Windows PC','Mac'])assert.equal(await page.getByRole('heading',{name,exact:true}).count(),1);
  assert.equal(await page.locator('.download-action').count(),5);
  assert.equal(await page.getByRole('link',{name:'Download Android APK',exact:true}).getAttribute('href'),'/?pmsv_android=1');
  assert.equal(await page.getByRole('link',{name:'Download for Windows',exact:true}).getAttribute('href'),'https://github.com/pragashramadoss/PMSV-app-source-code/releases/download/desktop-v2.2.0/PMSV-2.2.0-Windows-x64-Preview.exe');
  assert(await page.locator('#mac').innerText().then(t=>t.includes('not Apple-notarized')));
  assert.equal(await page.locator('a[href*=".ipa"]').count(),0);
  await page.screenshot({path:'wordpress/test-results/downloads-desktop.png',fullPage:true});
  await page.getByRole('link',{name:'Set up on iPhone'}).click();
  assert.equal(new URL(page.url()).hash,'#iphone-install');
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/downloads');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:'wordpress/test-results/downloads-mobile.png',fullPage:true});
  await page.setViewportSize({width:320,height:700});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByText('Which Mac download should I choose?',{exact:true}).click();
  assert(await page.getByText('Open the Apple menu → About This Mac.',{exact:false}).isVisible());
  await page.goto(base+'/');
  await page.getByRole('link',{name:'Download PMSV for your device'}).click();
  await page.getByRole('heading',{name:'Download PMSV',exact:true}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/downloads');
  const iphone=await browser.newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
  await iphone.goto(base+'/downloads');await iphone.locator('#iphone.for-device').waitFor();
  const android=await browser.newPage({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36'});
  await android.goto(base+'/downloads');await android.locator('#android.for-device').waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS desktop, 390px and 320px layouts; all platforms; real download targets; iPhone guide; device hints; home navigation; no JavaScript errors.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
