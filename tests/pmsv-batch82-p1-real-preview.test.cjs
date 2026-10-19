"use strict";
/* Live full-preview integration: no fixture for 533/498/35 or legal source graph. */
const assert=require("node:assert/strict"),fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",index=fs.readFileSync(root+"/index.html","utf8");
assert(index.includes("fssai-batch82-p1-original-evidence-desk-2026-10-19.js?v=20261019-b82"));
const server=spawn("python3",["-m","http.server","18982","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const sleep=t=>new Promise(r=>setTimeout(r,t));
(async()=>{let browser;try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 let started=false;for(let i=0;i<35;i++)try{
  const r=await page.goto("http://127.0.0.1:18982/",{waitUntil:"domcontentloaded",timeout:15000});
  if(r?.ok()){started=true;break}
 }catch(_){await sleep(200)}
 assert(started,"Local preview server unavailable");
 await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:90000});
 assert.equal(await page.evaluate(()=>pmsvB22StartupState),"READY");
 assert.equal(await page.evaluate(()=>pmsvB82P1Evidence.verified()),false,"No unconditional P1 source approval at startup");
 const loaded=await page.evaluate(()=>window.pmsvB70ExtendedResearch.request());
 assert.equal(loaded,true,"Explicit full evidence load must validate");
 assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState().extended),"READY");
 assert.equal(await page.evaluate(()=>pmsvFinal35LegalReview.load()),true);
 assert.equal(await page.evaluate(()=>pmsvB82P1Evidence.load()),true);
 await page.locator('button[data-tab="standard"]').click();
 await page.locator("#pmsv-final35-legal-review").evaluate(el=>{el.open=true});
 await page.locator("#pmsv-b82-p1-workbench").evaluate(el=>{
  // Disclosure panels are deeply nested in the real preview, unlike the synthetic test.
  // Open ancestors as a user would; hidden select controls must never be tested while collapsed.
  for(let n=el;n;n=n.parentElement)if(n.tagName==="DETAILS")n.open=true;
 });
 assert.equal(await page.locator('[data-pmsv-b82-filter="group"]').isVisible(),true,"Owner panel filters must be visible in the real mobile preview");
 assert.equal(await page.locator("#pmsv-b82-p1-workbench [data-pmsv-b82-rows] tr").count(),22);
 assert.equal(await page.locator("#pmsv-b82-p1-workbench [data-pmsv-b82-rows] details").count(),22);
 assert.equal(await page.locator("[data-pmsv-b82-filter='group'] option").count(),5);
 assert.equal((await page.evaluate(()=>pmsvB82P1Evidence.csv("REQUESTS"))).trim().split("\r\n").length,111);
 await page.locator('[data-pmsv-b82-filter="group"]').selectOption("MYCOTOXINS");
 assert.equal(await page.locator("[data-pmsv-b82-rows] tr").count(),3);
 await page.locator('[data-pmsv-b82-filter="group"]').selectOption("ALL");
 await page.locator('[data-pmsv-b82-filter="identity"]').selectOption("UNSPECIFIED");
 assert.equal(await page.locator("[data-pmsv-b82-rows] tr").count(),6);
 await page.locator('[data-pmsv-b82-filter="identity"]').selectOption("ALL");
 const status=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
 assert.deepEqual([status.caseApprovals,status.labPasses,status.productReleases],[0,0,0]);
 assert.equal(status.all35Held,true);
 const size=await page.locator("#pmsv-b82-p1-workbench").evaluate(e=>({outer:e.getBoundingClientRect().width,screen:window.innerWidth}));
 assert(size.outer<=size.screen,"Outer P1 table must fit phone viewport");
 assert.deepEqual(errors,[],"Real app runtime exceptions");
 console.log("B82 LIVE PREVIEW PASS: 390px viewport, 22 P1 dossiers/110 unique requests, all 35 HELD and 0 legal/lab/lot approvals.");
}finally{if(browser)await browser.close();server.kill()}})().catch(e=>{console.error("B82_P1_REAL_PREVIEW_FAIL",e);process.exitCode=1;server.kill()});
