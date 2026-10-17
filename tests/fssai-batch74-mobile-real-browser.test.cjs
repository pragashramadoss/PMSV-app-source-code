"use strict";
/* Batch74 real Chromium: preview core, mobile viewport, full opt-in, zero approvals. */
const assert=require("node:assert/strict"),fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const idx=fs.readFileSync(root+"/index.html","utf8");
const b74=fs.readFileSync(root+"/fssai-batch74-mobile-evidence-review-2026-10-17.js","utf8");
assert(idx.includes('fssai-batch74-mobile-evidence-review-2026-10-17.js'));
assert(idx.indexOf('fssai-batch74-mobile-evidence-review-2026-10-17.js')>idx.indexOf('fssai-current35-core-startup-batch70-2026-10-17.js'));
assert(!/(sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|fetch\s*\(|XMLHttpRequest)/.test(b74));
const server=spawn("python3",["-m","http.server","18974","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  let opened=false;
  for(let n=0;n<35;n++)try{
   let r=await page.goto("http://127.0.0.1:18974/",{waitUntil:"domcontentloaded",timeout:12000});
   if(r?.ok()){opened=true;break;}
  }catch(_){await nap(200);}
  assert(opened,"Could not open full preview");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:60000});
  const before=await page.evaluate(()=>({core:pmsvB22StartupState,mobile:window.pmsvB74MobileReview?.read(),b21:pmsvB21Valid()}));
  assert.equal(before.core,"READY");assert.equal(before.b21,true);
  assert.equal(before.mobile.extended,"NOT_REQUESTED");
  assert.equal(before.mobile.linksEnabled,false);
  assert.equal(await page.locator("#pmsv-b74-review nav a:visible").count(),0);
  assert.equal(await page.locator("#pmsv-b74-review progress").getAttribute("max"),"6");
  await page.evaluate(()=>window.pmsvB70ExtendedResearch.request());
  const after=await page.evaluate(()=>({
   mobile:window.pmsvB74MobileReview.read(),
   source:window.pmsvB70ExtendedResearch.getState(),
   cases:window.pmsvB59CTRSourceCrosswalk.getAllCases()
  }));
  assert.equal(after.source.extended,"READY");
  assert.equal(after.mobile.panelsVisible,6);
  assert.equal(after.mobile.linksEnabled,true);
  assert.equal(await page.locator("#pmsv-b74-review nav a:visible").count(),6);
  assert.equal(after.cases.length,35);
  assert.equal(new Set(after.cases.flatMap(c=>c.original_request_ids)).size,175);
  for(const c of after.cases){
   assert.equal(c.case_signed_legal_applicability,false);
   assert.equal(c.method_and_lab_scope_approved,false);
   assert.equal(c.representative_lot_pass,false);
  }
  assert.equal(after.mobile.caseApprovals,0);
  assert.equal(after.mobile.labPasses,0);
  assert.equal(after.mobile.productReleases,0);
  assert.equal(await page.locator("#pmsv-b74-review nav a").first().evaluate(el=>getComputedStyle(el).minHeight),"44px");
  await page.locator('[data-pmsv-b74-jump="pmsv-b68-lead-source-review"]').click();
  assert.equal(await page.locator("#pmsv-b68-lead-source-review").evaluate(el=>el.open),true);
  assert(await page.locator(".pmsv-b74-scroll-area").count()>=6,"Tables are not keyboard-scrollable");
  const mobileWidth=await page.evaluate(()=>({box:document.querySelector("#pmsv-b74-review").getBoundingClientRect().width,viewport:innerWidth}));
  assert(mobileWidth.box<=mobileWidth.viewport,"B74 panel spills past mobile viewport");
  assert.deepEqual(errors,[],"Browser errors detected");
  console.log("B74_MOBILE_E2E_PASS: 390px view, verified core, 6 review links, 6 table regions, 35 HELD, 175 IDs, 0 approvals");
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error("B74_MOBILE_E2E_FAIL",e);process.exitCode=1;server.kill();});