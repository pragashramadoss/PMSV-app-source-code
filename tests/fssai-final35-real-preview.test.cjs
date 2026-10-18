"use strict";
/* Real PMSV full-preview mobile/browser/loaded source check, separate from synthetic fixture. */
const assert=require("node:assert/strict"),fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const idx=fs.readFileSync(root+"/index.html","utf8");
assert(idx.includes("fssai-final35-legal-review-2026-10-18.js"));
const server=spawn("python3",["-m","http.server","18979","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  let opened=false;
  for(let i=0;i<35;i++)try{const r=await page.goto("http://127.0.0.1:18979/",{waitUntil:"domcontentloaded",timeout:12000});if(r?.ok()){opened=true;break}}catch(_){await nap(200)}
  assert(opened,"Could not start full PMSV preview");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:60000});
  const before=await page.evaluate(()=>({core:pmsvB22StartupState,extended:window.pmsvB70ExtendedResearch.getState().extended,register:!!document.getElementById("pmsv-final35-legal-review")}));
  assert.equal(before.core,"READY");assert.equal(before.extended,"NOT_REQUESTED");
  assert.equal(before.register,true,"Batch76 anchor must exist before substantive register can install");
  assert.equal(await page.evaluate(()=>pmsvFinal35LegalReview.verified()),false);
  await page.evaluate(()=>window.pmsvB70ExtendedResearch.request());
  const full=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(full.extended,"READY","Extended original-source chain must be verified before review");
  await page.locator('button[data-tab="standard"]').click();
  await page.locator("#pmsv-b70-startup-gates").evaluate(el=>{el.open=true});
  await page.locator("#pmsv-final35-legal-review").evaluate(el=>{el.open=true});
  assert.equal(await page.evaluate(()=>pmsvFinal35LegalReview.load()),true);
  assert.equal(await page.locator("#pmsv-final35-legal-review [data-f35-rows] tr").count(),35);
  assert.equal(await page.locator("#pmsv-final35-legal-review [data-f35-rows] td details").count(),35);
  assert.equal(await page.locator("[data-f35-analyte] option").count(),10);
  await page.locator("[data-f35-analyte]").selectOption("Aflatoxins");
  assert.equal(await page.locator("[data-f35-rows] tr").count(),2);
  await page.locator("[data-f35-analyte]").selectOption("ALL");
  await page.locator("[data-f35-identity]").selectOption("NO");
  assert.equal(await page.locator("[data-f35-rows] tr").count(),7);
  await page.locator("[data-f35-identity]").selectOption("ALL");
  await page.locator("[data-f35-priority]").selectOption("P0");
  assert.equal(await page.locator("[data-f35-rows] tr").count(),13);
  const state=await page.evaluate(()=>pmsvB70ExtendedResearch.getState());
  assert.equal(state.caseApprovals,0);assert.equal(state.labPasses,0);assert.equal(state.productReleases,0);
  const width=await page.locator("#pmsv-final35-legal-review").evaluate(el=>({width:el.getBoundingClientRect().width,screen:window.innerWidth}));
  assert(width.width<=width.screen,"Mobile register must not overflow mobile viewport");
  assert.deepEqual(errors,[],"Full preview script errors detected");
  console.log("FINAL35_REAL_PREVIEW_PASS: 390px, core/extended READY, 35 held cases, 9 analytes, 28/7 identity, zero approvals");
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error("FINAL35_REAL_PREVIEW_FAIL",e);process.exitCode=1;server.kill()});