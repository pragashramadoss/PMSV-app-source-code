'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const artifacts=process.env.PMSV_BROWSER_ARTIFACTS||path.join(root,'test-artifacts','helper-20261114');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.md':'text/plain','.css':'text/css'};
const server=http.createServer((req,res)=>{
 try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 }catch(error){res.writeHead(404).end('Not found');}
});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/fssai-helper/';
 const launch={headless:true,args:['--no-sandbox']};
 if(process.env.PMSV_BROWSER_EXECUTABLE)launch.executablePath=process.env.PMSV_BROWSER_EXECUTABLE;
 browser=await chromium.launch(launch);fs.mkdirSync(artifacts,{recursive:true});
 const page=await browser.newPage({acceptDownloads:true});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 assert.equal(await page.evaluate(()=>PMSV_HELPER_TEST.getCatalogue().length),533);
 assert.equal(await page.locator('#focusedTotal').textContent(),'137');
 assert.equal(await page.locator('#remainingFocusedTotal').textContent(),'0');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 assert.equal(await page.locator('#reviewResults article').count(),137);
 await page.locator('#reviewFilter').selectOption('remaining');
 assert.equal(await page.locator('#reviewResults article').count(),0);
 const download=page.waitForEvent('download');await page.locator('#exportReviewJSON').click();
 const file=await download;const data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));
 assert.equal(data.records.length,137,'Export must retain all records while display is filtered.');
 assert.equal(data.legalProductApprovals,0);assert.equal(data.sourceVerificationRequiresLotReport,false);
 await page.locator('#reviewFilter').selectOption('focused');assert.equal(await page.locator('#reviewResults article').count(),137);
 await page.locator('#reviewSearch').fill('2.3.13');assert.equal(await page.locator('#reviewResults article').count(),1);
 await page.locator('[data-review-product]').click();
 assert.equal(await page.locator('#finder').isVisible(),true);
 assert.match(await page.locator('#productDetail').textContent(),/R68/);
 assert.match(await page.locator('#productDetail').textContent(),/Exact CTR article decision: OPEN/);
 await page.evaluate(()=>PMSV_HELPER_TEST.selectProduct('102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk'));
 assert.match(await page.locator('#productDetail').textContent(),/R69/);
 assert.match(await page.locator('#productDetail').textContent(),/discrepancy is confirmed visually, not resolved/);
 assert.match(await page.locator('#currencyWatch').textContent(),/2028-07-01/);
 assert.match(await page.locator('#gazetteReviewSummary').textContent(),/382 metal entries and 27 crop-contaminant entries/);
 assert.equal(data.originalGazetteReview.futureChanges.length,9,'Full export must include all future source changes.');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#gazetteReviewSummary summary').click();
 assert.equal(await page.locator('#gazetteReviewSummary li').count(),9);
 assert.match(await page.locator('#gazetteReviewSummary').textContent(),/not been activated/);
 const sourceReport=await page.request.get(base+data.originalGazetteReview.report);
 assert.equal(sourceReport.status(),200);
 assert.match(await sourceReport.text(),/382 metal-table entries and 27 crop-contaminant entries/);
 assert.match(await page.locator('#residueReviewSummary').textContent(),/1,098 pesticide entries and 358 veterinary entries/);
 assert.equal(data.residueGazetteReview.findings.length,8,'Export must retain residue-source findings.');
 await page.locator('#residueReviewSummary summary').click();
 assert.equal(await page.locator('#residueReviewSummary li').count(),8);
 const residueReport=await page.request.get(base+data.residueGazetteReview.report);
 assert.equal(residueReport.status(),200);
 assert.match(await residueReport.text(),/137 product-specific CTR decisions remain open/);
 const rendered=await page.evaluate(()=>{
  let total=0;for(const row of PMSV_HELPER_TEST.getCatalogue()){
   if(!PMSV_HELPER_TEST.selectProduct(row.id))throw Error('Product did not open: '+row.id);
   if(!document.getElementById('productDetail').textContent.includes('NOT A COMPLIANCE APPROVAL'))throw Error('Missing status: '+row.id);
   total++;
  }return total;
 });assert.equal(rendered,533);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  for(const view of ['overview','finder','verification','cases','methods','sources']){
   await page.evaluate(name=>PMSV_HELPER_TEST.setView(name),view);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,view+' overflows at '+width);
  }
  await page.evaluate(()=>PMSV_HELPER_TEST.setView('verification'));
  await page.screenshot({path:path.join(artifacts,'review-'+width+'.png'),fullPage:false});
  // Sticky page navigation can overlay the middle of a tall element-only capture.
  // Keep normal viewport screenshots above; hide navigation only for this crop.
  if(width===390||width===1440)await page.locator('#gazetteReviewSummary').screenshot({path:path.join(artifacts,'original-gazette-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
  if(width===390||width===1440)await page.locator('#residueReviewSummary').screenshot({path:path.join(artifacts,'residue-sources-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.goto(base+'#%E0%A4%A',{waitUntil:'networkidle'});
 await page.locator('#overview').waitFor({state:'visible'});
 assert.equal(await page.locator('#overview').isVisible(),true,'Malformed hash must not break startup');
 assert.equal(await page.evaluate(()=>PMSV_HELPER_TEST.getCatalogue().length),533);
 for(const fixture of ['missing','duplicate']){
  const damaged=await browser.newPage();
  await damaged.route('**/full-catalogue-533.js*',route=>fixture==='missing'?route.abort():route.fulfill({contentType:'text/javascript',body:'window.PMSV_CATALOGUE=Array.from({length:533},()=>({id:"duplicate",product:"Duplicate"}));'}));
  await damaged.goto(base+'#finder',{waitUntil:'networkidle'});
  assert.equal(await damaged.evaluate(()=>PMSV_HELPER_TEST.getCatalogue().length),0);
  assert.equal(await damaged.locator('#downloadCatalogue').isDisabled(),true);
  assert.equal(await damaged.locator('#exportReviewJSON').isDisabled(),true);
  assert.equal(await damaged.locator('#productTotal').textContent(),'0');
  assert.match(await damaged.locator('#finder [role="alert"]').textContent(),/unavailable|duplicated/);
  await damaged.close();
 }
 assert.deepEqual(errors,[]);
 const result={passed:true,catalogueRowsRendered:533,reviewCases:137,focused:137,remaining:0,originalGazetteMetalRows:382,originalGazetteCropRows:27,futureChangesVisibleAndExported:9,sourceReportReachable:true,residuePesticideRows:1098,residueVeterinaryRows:358,residueFindingsVisibleAndExported:8,residueReportReachable:true,widths:[320,390,1440],views:6,partialCatalogueRejected:true,duplicateCatalogueRejected:true,malformedHashHandled:true,fullFilteredExport:137,pageErrors:errors,nativeAndroidTested:false};
 fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
