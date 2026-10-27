"use strict";
/* Batch112 controlled comparison: serve current code and bounded generic digest
 * variants to isolated real Chromium mobile contexts on the SAME CI runner.
 * No data, draft, or regulation is changed by this test. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18983;
const source=fs.readFileSync(root+"/fssai-source-proof-panels.js","utf8");
const digestBlock="function pmsvReviewSnapshotDigest(x){\n const s=JSON.stringify(x);\n return typeof s==='string'?pmsvReviewSnapshotHashSerialized(s):'';\n}";
const candidateDigestBlock="/* Batch112 candidate only: exact serialized JSON key, capped LRU.\n * Never bypasses serialization or changes canonical fingerprints. */\nconst pmsvGeneralDigestCache=new Map();\nlet pmsvGeneralDigestCachedChars=0;\nconst pmsvGeneralDigestCapacity=24,pmsvGeneralDigestMaxChars=8000000;\nfunction pmsvReviewSnapshotDigest(x){\n const s=JSON.stringify(x);\n if(typeof s!=='string')return '';\n const candidate=pmsvGeneralDigestCache.get(s);\n if(candidate!==undefined){\n  pmsvGeneralDigestCache.delete(s);pmsvGeneralDigestCache.set(s,candidate);\n  return candidate;\n }\n const digest=pmsvReviewSnapshotHashSerialized(s);\n if(s.length<=1000000){\n  pmsvGeneralDigestCache.set(s,digest);pmsvGeneralDigestCachedChars+=s.length;\n  while(pmsvGeneralDigestCache.size>pmsvGeneralDigestCapacity||\n        pmsvGeneralDigestCachedChars>pmsvGeneralDigestMaxChars){\n   const oldest=pmsvGeneralDigestCache.keys().next().value;\n   pmsvGeneralDigestCache.delete(oldest);\n   pmsvGeneralDigestCachedChars-=oldest.length;\n  }\n }\n return digest;\n}";
assert(source.includes(digestBlock),"Known source digest block must match exactly");
const candidateSource=source.replace(digestBlock,candidateDigestBlock);
const server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function measure(browser,variant,rate){
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/fssai-source-proof-panels.js*",route=>route.fulfill({
  status:200,contentType:"text/javascript; charset=utf-8",body:variant==="baseline"?source:candidateSource
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
   releases:window.pmsvB70ExtendedResearch?.getState()?.productReleases,
   digest_original_matches:pmsvReviewSnapshotDigest(pmsvCurrent533SourceLedger)===
    pmsvReviewSnapshotDigests.ledger,
   altered_digest_rejected:(()=>{
    const cloned=structuredClone(pmsvCurrent533SourceLedger);
    cloned.records[0].product_name+=" [tampered]";
    return pmsvReviewSnapshotDigest(cloned)!==pmsvReviewSnapshotDigests.ledger&&
           pmsvReviewSnapshotIntact("ledger",cloned)===false;
   })(),
   digest_cache_entries:typeof pmsvGeneralDigestCache==="undefined"?null:
     pmsvGeneralDigestCache.size,
   digest_cache_chars:typeof pmsvGeneralDigestCachedChars==="undefined"?null:
     pmsvGeneralDigestCachedChars
  }));
  assert.equal(result.core,"READY");
  assert.equal(result.visible,"READY");assert.equal(result.cases,35);
  assert.equal(result.extended,"NOT_REQUESTED");assert.equal(result.releases,0);
  assert.equal(result.digest_original_matches,true);
  assert.equal(result.altered_digest_rejected,true);
  if(result.digest_cache_entries!==null)assert(result.digest_cache_entries<=24);
  if(result.digest_cache_chars!==null)assert(result.digest_cache_chars<=8000000);
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
  for(const [variant,rate] of [["baseline",1],["candidate",1],["candidate",4],["baseline",4]]){
   const sample=await measure(browser,variant,rate);
   runs.push(sample);console.log("PMSV_B112_AB_SAMPLE "+JSON.stringify(sample));
  }
  const b1=runs.find(x=>x.variant==="baseline"&&x.cpu_rate===1).ready_ms;
  const c1=runs.find(x=>x.variant==="candidate"&&x.cpu_rate===1).ready_ms;
  const b4=runs.find(x=>x.variant==="baseline"&&x.cpu_rate===4).ready_ms;
  const c4=runs.find(x=>x.variant==="candidate"&&x.cpu_rate===4).ready_ms;
  const summary={test:"PMSV_BATCH112_SAME_RUNNER_AB",runs,
   normal_candidate_to_baseline:+(c1/b1).toFixed(3),
   slow_candidate_to_baseline:+(c4/b4).toFixed(3),
   note:"Ratios under 1 favor 24-entry exact-content digest LRU; all source gates remain intact"};
  fs.writeFileSync("pmsv-batch112-direct-digest-ab.json",JSON.stringify(summary,null,2)+"\n");
  console.log("PMSV_B112_AB_RESULT "+JSON.stringify(summary));
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error("PMSV_B112_AB_FAILED",e);process.exitCode=1;server.kill()});
