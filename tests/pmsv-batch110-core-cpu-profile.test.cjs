"use strict";
/* Batch110: read-only V8 CPU sampling of the actual 4x-slowed, 390px cold core.
 * The profile describes performance only; it cannot release a product. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {spawn}=require("node:child_process");
const {chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18980;
const server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 let browser,context;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const cdp=await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval",{interval:1000});
  await cdp.send("Profiler.start");
  let opened=false;
  for(let i=0;i<30;i++){
   try{
    const response=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:30000});
    if(response?.ok()){opened=true;break}
   }catch(_){await nap(200)}
  }
  assert(opened,"Could not open local mobile preview");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:180000,polling:200});
  const state=await page.evaluate(()=>({
   core:pmsvB22StartupState,
   visible_core:document.querySelector("[data-pmsv-b70-core]")?.textContent,
   cases:document.querySelectorAll("[data-pmsv-b21-open]").length,
   core_start_ms:pmsvB22Stats.core_start_ms,
   core_proof_ms:pmsvB22Stats.core_proof_ms,
   elapsed_ms:Math.round(performance.now()),
   extended:window.pmsvB70ExtendedResearch?.getState()?.extended,
   releases:window.pmsvB70ExtendedResearch?.getState()?.productReleases
  }));
  const {profile}=await cdp.send("Profiler.stop");
  assert.equal(state.core,"READY");assert.equal(state.visible_core,"READY");
  assert.equal(state.cases,35);assert.equal(state.extended,"NOT_REQUESTED");
  assert.equal(state.releases,0);assert.deepEqual(errors,[]);
  const byId=new Map(profile.nodes.map(n=>[n.id,n]));
  const samples=profile.samples||[],deltas=profile.timeDeltas||[];
  const totals=new Map();
  for(let i=0;i<samples.length;i++){
   const node=byId.get(samples[i]);if(!node)continue;
   const frame=node.callFrame||{},name=frame.functionName||"(anonymous)";
   const url=String(frame.url||"").replace(/^.*\/fssai-product-helper-preview-01\//,"");
   const key=name+"|"+url;
   const hit=totals.get(key)||{name,url,samples:0,estimated_ms:0};
   hit.samples++;
   hit.estimated_ms+=(deltas[i]||1000)/1000;
   totals.set(key,hit);
  }
  const rank=[...totals.values()].sort((a,b)=>b.samples-a.samples);
  const totalSamples=Math.max(samples.length,1);
  const summarized=rank.slice(0,30).map(x=>({...x,share_pct:+(100*x.samples/totalSamples).toFixed(1),estimated_ms:Math.round(x.estimated_ms)}));
  const regulatory=rank.filter(x=>/pmsv|fssai/i.test(x.name+" "+x.url)).slice(0,30)
   .map(x=>({...x,share_pct:+(100*x.samples/totalSamples).toFixed(1),estimated_ms:Math.round(x.estimated_ms)}));
  const result={test:"PMSV_BATCH110_CORE_CPU_FUNCTION_PROFILE",cpu_slowdown:4,viewport_width:390,
   state,samples:samples.length,top_functions:summarized,top_regulatory_functions:regulatory,
   status:"PROFILE_ONLY_NO_RELEASE",original_evidence_requests_unchanged:175};
  fs.writeFileSync("pmsv-batch110-cpu-profile.json",JSON.stringify(result,null,2)+"\n");
  console.log("PMSV_BATCH110_CORE_PROFILE "+JSON.stringify(result));
 }finally{if(context)await context.close();if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error("BATCH110_CORE_PROFILE_FAILED",e);process.exitCode=1;server.kill()});
