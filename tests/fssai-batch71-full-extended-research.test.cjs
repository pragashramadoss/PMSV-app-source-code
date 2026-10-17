"use strict";
/* Batch71 real preview: full opt-in path. Does NOT treat source review as approval. */
const fs=require("node:fs"),assert=require("node:assert/strict"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const source=fs.readFileSync(root+"/fssai-current35-transfer-preflight-batch23-2026-10-14.js","utf8");
const b70=fs.readFileSync(root+"/fssai-current35-core-startup-batch70-2026-10-17.js","utf8");
const html=fs.readFileSync(root+"/index.html","utf8");
assert(source.includes("B71_CORE_EVIDENCE_INTEGRITY_BLOCKED"));
assert(source.includes('if(typeof pmsvB21Valid!=="function"||!pmsvB21Valid())'));
assert(b70.includes("progressInterval=setInterval("));
assert(html.indexOf("core-startup-batch70")>html.indexOf("remaining12-p1-lead-batch68"));
assert(!/(sendBeacon|XMLHttpRequest|WebSocket)/.test(b70));
const server=spawn("python3",["-m","http.server","18972","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[],failure=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  page.on("requestfailed",r=>failure.push({url:r.url(),error:r.failure()?.errorText}));
  let loaded=false;
  for(let i=0;i<35;i++){
   try{const resp=await page.goto("http://127.0.0.1:18972/",{waitUntil:"domcontentloaded",timeout:11000});
   if(resp?.ok()){loaded=true;break;}}catch(_){await nap(200);}
  }
  assert(loaded,"B71 preview index unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:55000});
  const core=await page.evaluate(()=>({state:pmsvB22StartupState,
   b21:typeof pmsvB21Valid==="function"&&pmsvB21Valid(),
   b14:typeof pmsvB14Valid==="function"&&pmsvB14Valid(),
   extended:window.pmsvB70ExtendedResearch?.getState()?.extended}));
  console.log("B71_CORE "+JSON.stringify(core));
  assert.deepEqual(core,{state:"READY",b21:true,b14:true,extended:"NOT_REQUESTED"});
  // Execute same trusted function as the actual user click; no simulated validation services.
  await page.evaluate(()=>window.pmsvB70ExtendedResearch.request());
  const state=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  const verdict=await page.evaluate(()=>({
   actualSourceValidation:window.pmsvB70ExtendedResearch.researchValid(),
   b59:window.pmsvB59CTRSourceCrosswalk?.valid(),
   b63:window.pmsvB63CocoaMisri?.valid(),
   b64:window.pmsvB64OriginalLawCases?.valid(),
   b65:window.pmsvB65FourFoodMatrices?.valid(),
   b66:window.pmsvB66NutraIngredientAudit?.valid(),
   b67:window.pmsvB67SixMatrixEvidence?.valid(),
   b68:window.pmsvB68RemainingLeadP1?.valid(),
   allIds:window.pmsvB59CTRSourceCrosswalk?.getAllCases?.().flatMap(x=>x.original_request_ids).length,
   primary:document.querySelectorAll("#pmsv-b68-lead-source-review [data-pmsv-b68-rows] tr").length
  }));
  console.log("B71_EXTENDED_STATE "+JSON.stringify(state));
  console.log("B71_EXTENDED_VERDICT "+JSON.stringify(verdict));
  assert.equal(state.extended,"READY","Extended opt-in UI not READY");
  assert.equal(state.sourcePanelsVisible,6);
  assert.equal(state.requestsSent,0);
  assert.equal(state.caseApprovals,0);
  assert.equal(state.labPasses,0);
  assert.equal(state.productReleases,0);
  assert.deepEqual([verdict.actualSourceValidation,verdict.b59,verdict.b63,
   verdict.b64,verdict.b65,verdict.b66,verdict.b67,verdict.b68],[true,true,true,true,true,true,true,true]);
  assert.equal(verdict.allIds,175);assert.equal(verdict.primary,12);
  assert.equal(errors.length,0,"Browser page errors "+errors.slice(0,5).join(" | "));
  assert.equal(failure.length,0,"Network failures "+JSON.stringify(failure.slice(0,5)));
  console.log("B71_EXTENDED_INTEGRATION_PASS full opt-in preview tested; 35 held/175 unchanged; zero release.");
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error("B71_EXTENDED_INTEGRATION_FAIL",e);process.exitCode=1;server.kill();});
