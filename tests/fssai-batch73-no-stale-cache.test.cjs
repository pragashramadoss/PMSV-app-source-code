"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const src=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-validation-graph-batch73-2026-10-17.js","utf8");
assert(!/(setTimeout|localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|fetch\(|Promise\.resolve)/.test(src),
 "Cache cannot escape one synchronous call or create side effects");
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage();
  await page.setContent("<!doctype html><html><body>Batch73 synthetic integrity fixtures</body></html>");
  await page.evaluate(()=>{
   const names=["pmsvB58OwnerOutreach","pmsvB59CTRSourceCrosswalk",
    "pmsvB60LegalScope","pmsvB61OriginalGazette","pmsvB62IdentitySupersession",
    "pmsvB63CocoaMisri","pmsvB64OriginalLawCases","pmsvB65FourFoodMatrices",
    "pmsvB66NutraIngredientAudit","pmsvB67SixMatrixEvidence","pmsvB68RemainingLeadP1"];
   window.__fixture={good:true,calls:{}};
   names.forEach((key,i)=>{
    const id="B"+(i===0?58:i+58);
    window[key]={valid:()=>{
     window.__fixture.calls[key]=(window.__fixture.calls[key]||0)+1;
     if(key==="pmsvB58OwnerOutreach")return window.__fixture.good;
     if(i===2)return window.pmsvB59CTRSourceCrosswalk.valid()&&window.pmsvB58OwnerOutreach.valid();
     if(i===10)return window.pmsvB67SixMatrixEvidence.valid()&&window.pmsvB59CTRSourceCrosswalk.valid();
     return i?window[names[i-1]].valid():true;
    }};
   });
  });
  await page.addScriptTag({content:src});
  let r=await page.evaluate(()=>({
   first:window.pmsvB73ValidationGraph.validateAll(),
   calls:{...window.__fixture.calls},
   stats:window.pmsvB73ValidationGraph.stats()
  }));
  assert.equal(r.first,true);
  assert.equal(r.calls.pmsvB58OwnerOutreach,1,"Ancestor was unnecessarily rechecked");
  assert(r.stats.nestedCacheHits>0,"Expected cache hit inside same synchronous cycle");
  assert.equal(r.stats.cacheActive,false);
  r=await page.evaluate(()=>{
   window.__fixture.good=false;
   return {next:window.pmsvB73ValidationGraph.validateAll(),
    direct:window.pmsvB58OwnerOutreach.valid(),
    stats:window.pmsvB73ValidationGraph.stats()};
  });
  assert.equal(r.next,false,"Tampered upstream proof reused stale true");
  assert.equal(r.direct,false);
  assert.equal(r.stats.cacheActive,false);
  await page.evaluate(()=>{window.__fixture.good=true;});
  r=await page.evaluate(()=>window.pmsvB73ValidationGraph.validateAll());
  assert.equal(r,true,"Recovery must reread corrected evidence");
  console.log("B73_SYNC_CACHE_TAMPER_PASS: one ancestor validation per root, mutation caught next call, no cross-event cache.");
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
