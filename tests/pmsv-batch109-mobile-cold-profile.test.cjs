"use strict";
/* PMSV Batch109: compare real 390px cold startup with native and 4x CPU slowdown.
 * Diagnostic only; no regulation/evidence status is inferred from elapsed time. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {spawn}=require("node:child_process");
const {chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18979;
const server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function profile(browser,rate){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 const cdp=await context.newCDPSession(page);
 await cdp.send("Emulation.setCPUThrottlingRate",{rate});
 try{
  let opened=false;
  for(let k=0;k<30;k++){
   try{
    const response=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:30000});
    if(response?.ok()){opened=true;break}
   }catch(_){await nap(200)}
  }
  assert(opened,"Unable to load local FSSAI preview");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:180000,polling:250});
  const result=await page.evaluate(()=>{
   const entries=performance.getEntriesByType("resource");
   const nav=performance.getEntriesByType("navigation")[0];
   return {
    core:pmsvB22StartupState,
    visible_core:document.querySelector("[data-pmsv-b70-core]")?.textContent,
    ready_at_ms:Math.round(performance.now()),
    dom_content_loaded_ms:Math.round(nav?.domContentLoadedEventEnd||0),
    core_start_ms:pmsvB22Stats.core_start_ms,
    core_proof_ms:pmsvB22Stats.core_proof_ms,
    loaded_resources:entries.length,
    last_resource_end_ms:Math.round(Math.max(0,...entries.map(x=>x.responseEnd))),
    cases:document.querySelectorAll("[data-pmsv-b21-open]").length,
    extended:window.pmsvB70ExtendedResearch?.getState()?.extended,
    approvals:window.pmsvB70ExtendedResearch?.getState()?.productReleases
   };
  });
  assert.equal(result.core,"READY","Original core source integrity must be READY");
  assert.equal(result.visible_core,"READY","Displayed state must follow verified verdict");
  assert.equal(result.cases,35,"All 35 local evidence controls must load");
  assert.equal(result.extended,"NOT_REQUESTED");
  assert.equal(result.approvals,0);
  assert.deepEqual(errors,[],"Browser exceptions during startup");
  return {cpu_slowdown:rate,...result};
 }finally{await context.close()}
}
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const normal=await profile(browser,1);
  const slow=await profile(browser,4);
  const summary={
   test:"PMSV_BATCH109_MOBILE_390_COLD_START",
   normal,slow,
   slowdown_ratio:Number((slow.ready_at_ms/Math.max(normal.ready_at_ms,1)).toFixed(2)),
   validation_policy:"NO_RELAXATION",
   released_products:0
  };
  fs.writeFileSync("pmsv-batch109-mobile-startup-metrics.json",JSON.stringify(summary,null,2)+"\n");
  console.log("PMSV_BATCH109_MOBILE_PROFILE "+JSON.stringify(summary));
 }finally{if(browser)await browser.close();server.kill()}
})().catch(error=>{console.error("BATCH109_MOBILE_PROFILE_FAILED",error);process.exitCode=1;server.kill()});
