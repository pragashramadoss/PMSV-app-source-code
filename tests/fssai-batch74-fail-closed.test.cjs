"use strict";
/* B74 fail-closed status/links fixture without downloading source packs. */
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const script=fs.readFileSync("fssai-product-helper-preview-01/fssai-batch74-mobile-evidence-review-2026-10-17.js","utf8");
(async()=>{const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:375,height:812}});
  await page.setContent('<html><head></head><body><details id="pmsv-b70-startup-gates"><span data-pmsv-b70-state>Not requested</span><span data-pmsv-b70-core>READY</span><p data-pmsv-b70-message>HEL D</p></details></body></html>');
  await page.evaluate(()=>{window.fixture={core:"READY",extended:"NOT_REQUESTED"};
   window.pmsvB70ExtendedResearch={getState:()=>({...window.fixture})};});
  await page.addScriptTag({content:script});
  const read=()=>page.evaluate(()=>window.pmsvB74MobileReview.read());
  let x=await read();assert.equal(x.linksEnabled,false);assert.equal(x.panelsVisible,0);
  await page.evaluate(()=>{window.fixture.extended="LOADING";});
  x=await read();assert.equal(x.linksEnabled,false);
  await page.evaluate(()=>{for(const id of ["pmsv-b63-cocoa-sugar-specifics","pmsv-b64-three-originals","pmsv-b65-four-matrix-classifications","pmsv-b66-nutra-source-audit","pmsv-b67-six-matrix-review","pmsv-b68-lead-source-review"]){
   const el=document.createElement("details");el.id=id;
   el.innerHTML="<summary>Research</summary><table><tr><th>Case</th></tr><tr><td>HELD</td></tr></table>";document.body.appendChild(el);
  }window.fixture.extended="INTEGRITY_BLOCKED";});
  x=await read();assert.equal(x.panelsVisible,6);assert.equal(x.linksEnabled,false,"Six visible panels must not mean approval");
  await page.evaluate(()=>{window.fixture.extended="READY";});
  x=await read();assert.equal(x.linksEnabled,true);
  assert.equal(await page.locator("#pmsv-b74-review nav a:visible").count(),6);
  await page.evaluate(()=>{window.fixture.core="INTEGRITY_BLOCKED";});
  x=await read();assert.equal(x.linksEnabled,false);
  await page.evaluate(()=>{window.fixture.core="READY";document.getElementById("pmsv-b68-lead-source-review").remove();});
  x=await read();assert.equal(x.linksEnabled,false,"Missing source section must block nav");
  assert.equal(await page.locator("#pmsv-b74-review nav a:visible").count(),0);
  await page.evaluate(()=>{window.fixture.extended="READY";});
  x=await read();assert.equal(x.productReleases,0);
  console.log("B74_FAIL_CLOSED_PASS: visible-but-blocked, missing source, core failure, no approval.");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});