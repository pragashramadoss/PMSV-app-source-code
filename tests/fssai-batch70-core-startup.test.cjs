"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const b22=fs.readFileSync(root+"/fssai-current35-browser-review-integrity-batch22-2026-10-14.js","utf8");
const b70=fs.readFileSync(root+"/fssai-current35-core-startup-batch70-2026-10-17.js","utf8");
const index=fs.readFileSync(root+"/index.html","utf8");
assert(b22.includes("const pmsvB22CoreProofLoader=pmsvLoadPositiveSourceProof"));
assert(b22.includes("await pmsvB22CoreProofLoader();"));
assert(!b22.includes("await pmsvLoadPositiveSourceProof();"));
assert(index.indexOf("core-startup-batch70")>index.indexOf("remaining12-p1-lead-batch68"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|WebSocket)/.test(b70));
assert(b70.includes("state==="+'"'+"INTEGRITY_BLOCKED"+'"'));
const server=spawn("python3",["-m","http.server","18971","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let i=0;i<30;i++){
   try{
    const response=await page.goto("http://127.0.0.1:18971/",{waitUntil:"domcontentloaded",timeout:12000});
    if(response?.ok()){loaded=true;break;}
   }catch(_){await nap(250);}
  }
  assert(loaded,"Full preview root failed to respond");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
    ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:50000});
  const snapshot=await page.evaluate(()=>({
   core:pmsvB22StartupState,
   b21:typeof pmsvB21Valid==="function"&&pmsvB21Valid(),
   b14:typeof pmsvB14Valid==="function"&&pmsvB14Valid(),
   panel:!!document.getElementById("pmsv-b70-startup-gates"),
   btn:!!document.querySelector("[data-pmsv-b70-load]"),
   extended:window.pmsvB70ExtendedResearch?.getState()?.extended,
   b68Loaded:window.pmsvB68RemainingLeadP1?.valid()===true,
  }));
  console.log("B70_CORE_STARTUP_STATE "+JSON.stringify(snapshot));
  assert.equal(snapshot.core,"READY","Core B22 integrity blocked; do not claim success");
  assert.equal(snapshot.b21,true);assert.equal(snapshot.b14,true);
  assert.equal(snapshot.panel,true);assert.equal(snapshot.btn,true);
  assert.equal(snapshot.extended,"NOT_REQUESTED");
  assert.equal(snapshot.b68Loaded,false);
  assert.equal(errors.length,0,"Browser startup page exceptions: "+errors.slice(0,5).join("|"));
  // Do not trigger large research chain here: it has its own immutable B69 CI audit.
  console.log("B70_CORE_E2E_PASS: core loads without eagerly validating all 68 research overlays. Extended research not approved or loaded.");
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill();});
