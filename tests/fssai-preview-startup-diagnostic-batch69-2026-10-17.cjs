"use strict";
/* Diagnostic, never a full-app passing test. Avoid 90-second silent hangs. */
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const server=spawn("python3",["-m","http.server","18969","--directory","fssai-product-helper-preview-01","--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[],failed=[],requests={started:0,finished:0};
  page.on("pageerror",e=>errors.push(String(e.message).slice(0,260)));
  page.on("request",()=>requests.started++);
  page.on("requestfinished",()=>requests.finished++);
  page.on("requestfailed",r=>failed.push([r.url().slice(0,140),r.failure()?.errorText]));
  let ok=false;
  for(let i=0;i<35;i++){
   try{const res=await page.goto("http://127.0.0.1:18969/",{waitUntil:"domcontentloaded",timeout:9000});
    if(res?.ok()){ok=true;break;}}
   catch(_){await nap(200);}
  }
  if(!ok){console.log("B69_DIAG_PAGE_NOT_AVAILABLE");return;}
  const snapshots=[];
  const sample=async elapsed=>{
   const info=await page.evaluate(()=>({
    documentReady:document.readyState,
    b22:typeof pmsvB22StartupState==="undefined"?"UNDEFINED":String(pmsvB22StartupState),
    pmsvSourceLoader:typeof pmsvLoadPositiveSourceProof,
    b59:typeof window.pmsvB59CTRSourceCrosswalk,
    b63:typeof window.pmsvB63CocoaMisri,
    b64:typeof window.pmsvB64OriginalLawCases,
    b68:typeof window.pmsvB68RemainingLeadP1,
    panel63:!!document.getElementById("pmsv-b63-cocoa-sugar-specifics"),
    panel64:!!document.getElementById("pmsv-b64-three-originals"),
    panel68:!!document.getElementById("pmsv-b68-lead-source-review"),
    scriptCount:document.scripts.length
   }));
   snapshots.push({elapsed_seconds:elapsed,...info,requests:{...requests},pageErrors:errors.length,failedRequests:failed.length});
  };
  await sample(0);await nap(8000);await sample(8);await nap(8000);await sample(16);await nap(8000);await sample(24);
  console.log("B69_DIAG_SNAPSHOTS "+JSON.stringify(snapshots));
  console.log("B69_DIAG_PAGE_ERRORS "+JSON.stringify(errors.slice(0,7)));
  console.log("B69_DIAG_FAILED_REQUESTS "+JSON.stringify(failed.slice(0,7)));
  const last=snapshots.at(-1);
  console.log(last.b22==="READY"&&last.panel63&&last.panel64&&last.panel68?
    "B69_DIAG_STARTUP_INDICATORS_VISIBLE_BUT_NOT_FULL_E2E_CERTIFICATION":
    "B69_DIAG_FULL_PREVIEW_NOT_CERTIFIED_CHECK_CHAIN_STATE");
  console.log("B69_DIAGNOSTIC_ONLY_IS_NOT_A_SUCCESSFUL_FULL_APP_INTEGRATION_TEST");
 }catch(e){console.error("B69_DIAG_INTERNAL_ERROR",String(e));}
 finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error("B69_DIAG_FATAL",String(e));server.kill();});
