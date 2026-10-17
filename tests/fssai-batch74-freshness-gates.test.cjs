"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const src=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-core-startup-batch70-2026-10-17.js","utf8");
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket)/.test(src));
const ids=["pmsv-b63-cocoa-sugar-specifics","pmsv-b64-three-originals","pmsv-b65-four-matrix-classifications",
 "pmsv-b66-nutra-source-audit","pmsv-b67-six-matrix-review","pmsv-b68-lead-source-review"];
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage();
  await page.setContent("<!doctype html><html><body><div id='selectedProductStandardContent'></div></body></html>");
  await page.evaluate(panelIds=>{
   window.__fixture={valid:true,cases:Array.from({length:35},(_,i)=>({
    original_request_ids:Array.from({length:5},(_,j)=>"B74-ORIGINAL-"+i+"-"+j),
    case_signed_legal_applicability:false,actual_market_material_authenticated:false,
    method_and_lab_scope_approved:false,representative_lot_pass:false
   }))};
   window.pmsvB22StartupState="READY";
   window.pmsvB21Valid=()=>true;
   window.pmsvLoadPositiveSourceProof=async()=>{};
   window.pmsvB59CTRSourceCrosswalk={valid:()=>window.__fixture.valid,
    getAllCases:()=>window.__fixture.valid?window.__fixture.cases:[]};
   ["pmsvB63CocoaMisri","pmsvB64OriginalLawCases","pmsvB65FourFoodMatrices",
    "pmsvB66NutraIngredientAudit","pmsvB67SixMatrixEvidence","pmsvB68RemainingLeadP1"]
   .forEach(key=>window[key]={valid:()=>window.__fixture.valid});
   panelIds.forEach(id=>{const e=document.createElement("div");e.id=id;document.body.append(e);});
  },ids);
  await page.addScriptTag({content:src});
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true);
  let s=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(s.extended,"READY");assert.equal(s.all35Held,true);
  assert.equal(s.caseApprovals,0);assert.equal(s.productReleases,0);
  // A changed original signed-source validator must invalidate READY on the next independent read.
  await page.evaluate(()=>window.__fixture.valid=false);
  s=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(s.extended,"INTEGRITY_BLOCKED");
  assert.equal(s.all35Held,false);assert.match(s.error,/B74 recheck/);
  await page.evaluate(()=>window.__fixture.valid=true);
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true);
  // Missing research panel cannot pass even if all source digests still report good.
  await page.locator("#pmsv-b64-three-originals").evaluate(e=>e.remove());
  s=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(s.extended,"INTEGRITY_BLOCKED");
  assert.equal(s.sourcePanelsVisible,0);
  await page.evaluate(()=>window.__fixture.cases[0].case_signed_legal_applicability=true);
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.researchValid()),false);
  assert.equal(await page.locator("[data-pmsv-b74-recheck]").count(),1);
  console.log("B74_FRESHNESS_FAIL_CLOSED_PASS: stale source, missing panel, false case approval rejected; 175 originals.");
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
