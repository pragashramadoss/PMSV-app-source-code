"use strict";
/* Diagnostic only. A completed job is not proof that the full preview works.
   Keep only UI/error summaries; do not expose commercial source documents. */
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const server=spawn("python3",["-m","http.server","18965","--directory","fssai-product-helper-preview-01","--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[],blocked=[],logs=[];
  page.on("pageerror",e=>errors.push((e.stack||e.message).slice(0,600)));
  page.on("requestfailed",r=>blocked.push([r.url().slice(0,170),r.failure()?.errorText]));
  page.on("console",m=>{if(m.type()==="error")logs.push(m.text().slice(0,250))});
  let loaded=false;
  for(let i=0;i<35;i++)try{
   const x=await page.goto("http://127.0.0.1:18965/",{waitUntil:"domcontentloaded",timeout:9000});
   if(x?.ok()){loaded=true;break;}
  }catch(_){await nap(200)}
  if(!loaded){console.log("DIAG_PREVIEW_PAGE_UNAVAILABLE");return;}
  await nap(14000);
  const state=await page.evaluate(()=>({
   title:document.title,
   readyState:document.readyState,
   scriptCount:document.scripts.length,
   bodyChars:document.body?.textContent?.length||0,
   sourceLoader:typeof pmsvLoadPositiveSourceProof,
   b22State:typeof pmsvB22StartupState==="undefined"?"UNDEFINED":String(pmsvB22StartupState),
   b14Digest:typeof pmsvB14Digest,
   b59:typeof window.pmsvB59CTRSourceCrosswalk,
   b62:typeof window.pmsvB62IdentitySupersession,
   b63:typeof window.pmsvB63CocoaMisri,
   b64:typeof window.pmsvB64OriginalLawCases,
   b65:typeof window.pmsvB65FourFoodMatrices,
   b65panel:!!document.querySelector("#pmsv-b65-four-matrix-classifications")
  })); 
  console.log("DIAG_PREVIEW_STATE "+JSON.stringify(state));
  console.log("DIAG_JS_PAGE_ERRORS "+JSON.stringify(errors.slice(0,9)));
  console.log("DIAG_REQUEST_FAILURES "+JSON.stringify(blocked.slice(0,9)));
  console.log("DIAG_CONSOLE_ERRORS "+JSON.stringify(logs.slice(0,9)));
  console.log("DIAG_ONLY_NOT_FULL_E2E_PASS");
 }catch(e){console.error("DIAG_INTERNAL_FAILURE",String(e));}
 finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error("DIAG_FATAL",String(e));server.kill();});