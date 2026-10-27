"use strict";
/* Batch110 controlled comparison: serve original and exact-string-cache digest
 * variants to isolated real Chromium mobile contexts on the SAME CI runner.
 * No data, draft, or regulation is changed by this test. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18981;
const source=fs.readFileSync(root+"/fssai-source-proof-panels.js","utf8");
const start=source.indexOf("/* Batch110: a three-kind content-exact cache.");
const end=source.indexOf("var pmsvBeforeSnapshotLedgerProof",start);
assert(start>0&&end>start,"Only the known Batch110 optimization may be varied");
const cacheBlock=source.slice(start,end);
const originalBlock=`function pmsvReviewSnapshotDigest(x){
 const s=JSON.stringify(x);
 if(typeof s!=='string')return '';
 let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){
  const ch=s.charCodeAt(i);
  a=Math.imul(a^ch,16777619);
  b=Math.imul(b^ch,2246822519);
 }
 return (a>>>0).toString(16).padStart(8,'0')+
   (b>>>0).toString(16).padStart(8,'0');
}
function pmsvReviewSnapshotIntact(kind,document){
 const expected=pmsvReviewSnapshotDigests[kind];
 return typeof expected==='string'&&expected.length===16&&
   !!document&&pmsvReviewSnapshotDigest(document)===expected;
}
`;
const baselineSource=source.slice(0,start)+originalBlock+source.slice(end);
const server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function measure(browser,variant,rate){
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/fssai-source-proof-panels.js*",route=>route.fulfill({
  status:200,contentType:"text/javascript; charset=utf-8",body:variant==="baseline"?baselineSource:source
 }));
 const cdp=await ctx.newCDPSession(page);
 await cdp.send("Emulation.setCPUThrottlingRate",{rate});
 try{
  let opened=false;
  for(let i=0;i<30;i++){
   try{
    const response=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:30000});
    if(response?.ok()){opened=true;break}
   }catch(_){await nap(200)}
  }
  assert(opened,"Local preview unavailable");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:180000,polling:200});
  const result=await page.evaluate(()=>({
   core:pmsvB22StartupState,
   visible:document.querySelector("[data-pmsv-b70-core]")?.textContent,
   ready_ms:Math.round(performance.now()),
   proof_ms:pmsvB22Stats.core_proof_ms,
   cases:document.querySelectorAll("[data-pmsv-b21-open]").length,
   extended:window.pmsvB70ExtendedResearch?.getState()?.extended,
   releases:window.pmsvB70ExtendedResearch?.getState()?.productReleases
  }));
  assert.equal(result.core,"READY");
  assert.equal(result.visible,"READY");assert.equal(result.cases,35);
  assert.equal(result.extended,"NOT_REQUESTED");assert.equal(result.releases,0);
  assert.deepEqual(errors,[]);
  return {variant,cpu_rate:rate,...result};
 }finally{await ctx.close()}
}
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  // Alternate variant order to reduce systematic thermal/warm-up bias.
  const runs=[];
  for(const [variant,rate] of [["baseline",1],["cached",1],["cached",4],["baseline",4]]){
   const sample=await measure(browser,variant,rate);
   runs.push(sample);console.log("PMSV_B110_AB_SAMPLE "+JSON.stringify(sample));
  }
  const b1=runs.find(x=>x.variant==="baseline"&&x.cpu_rate===1).ready_ms;
  const c1=runs.find(x=>x.variant==="cached"&&x.cpu_rate===1).ready_ms;
  const b4=runs.find(x=>x.variant==="baseline"&&x.cpu_rate===4).ready_ms;
  const c4=runs.find(x=>x.variant==="cached"&&x.cpu_rate===4).ready_ms;
  const summary={test:"PMSV_BATCH110_SAME_RUNNER_AB",runs,
   normal_cache_to_baseline:+(c1/b1).toFixed(3),
   slow_cache_to_baseline:+(c4/b4).toFixed(3),
   note:"Ratios under 1 favor cached digest; all source gates remain intact"};
  fs.writeFileSync("pmsv-batch110-same-runner-ab.json",JSON.stringify(summary,null,2)+"\n");
  console.log("PMSV_B110_AB_RESULT "+JSON.stringify(summary));
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error("PMSV_B110_AB_FAILED",e);process.exitCode=1;server.kill()});
