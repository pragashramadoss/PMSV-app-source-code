"use strict";
/* Batch115 controlled comparison: original digest against exact-serialized WeakMap
 * variant in isolated real Chromium mobile contexts on the SAME CI runner.
 * No data, draft, or regulation is changed by this test. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18986;
const source=fs.readFileSync(root+"/fssai-source-proof-panels.js","utf8");
const digestBlock="function pmsvReviewSnapshotDigest(x){\n const s=JSON.stringify(x);\n return typeof s==='string'?pmsvReviewSnapshotHashSerialized(s):'';\n}";
const candidateDigestBlock="/* Batch115 candidate only: identity-indexed, EXACT-SERIALIZED-CONTENT WeakMap.\n * Every call still performs full JSON.stringify on the current object. The\n * stored fingerprint is reused ONLY if the latest serialization is identical.\n * No cross-identity transfer, version bypass, source approval or release. */\nconst pmsvWeakDigestMemo=new WeakMap();\nlet pmsvWeakDigestHits=0,pmsvWeakDigestMisses=0,pmsvWeakDigestInvalidations=0;\nfunction pmsvReviewSnapshotDigest(x){\n const s=JSON.stringify(x);\n if(typeof s!=='string')return '';\n const objectLike=x!==null&&(typeof x==='object'||typeof x==='function');\n const previous=objectLike?pmsvWeakDigestMemo.get(x):undefined;\n if(previous&&previous.serialized===s){\n  pmsvWeakDigestHits++;\n  return previous.digest;\n }\n if(previous)pmsvWeakDigestInvalidations++;\n const digest=pmsvReviewSnapshotHashSerialized(s);\n if(objectLike&&s.length<=1000000)pmsvWeakDigestMemo.set(x,{serialized:s,digest});\n pmsvWeakDigestMisses++;\n return digest;\n}";
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
   memo_hits:typeof pmsvWeakDigestHits==="undefined"?null:pmsvWeakDigestHits,
   memo_misses:typeof pmsvWeakDigestMisses==="undefined"?null:pmsvWeakDigestMisses,
   memo_invalidations:typeof pmsvWeakDigestInvalidations==="undefined"?null:
     pmsvWeakDigestInvalidations,
   same_object_changed_rejected:(()=>{
    const cloned=structuredClone(pmsvCurrent533SourceLedger);
    const initiallyCorrect=pmsvReviewSnapshotDigest(cloned)===pmsvReviewSnapshotDigests.ledger;
    const original=cloned.records[0].product_name;
    cloned.records[0].product_name=original+" [same-object unauthorized mutation]";
    const invalid=pmsvReviewSnapshotDigest(cloned)!==pmsvReviewSnapshotDigests.ledger&&
      pmsvReviewSnapshotIntact("ledger",cloned)===false;
    cloned.records[0].product_name=original;
    const restored=pmsvReviewSnapshotDigest(cloned)===pmsvReviewSnapshotDigests.ledger&&
      pmsvReviewSnapshotIntact("ledger",cloned)===true;
    return initiallyCorrect&&invalid&&restored;
   })()
  }));
  assert.equal(result.core,"READY");
  assert.equal(result.visible,"READY");assert.equal(result.cases,35);
  assert.equal(result.extended,"NOT_REQUESTED");assert.equal(result.releases,0);
  assert.equal(result.digest_original_matches,true);
  assert.equal(result.altered_digest_rejected,true);
  assert.equal(result.same_object_changed_rejected,true);
  if(variant==="candidate"){
   assert(result.memo_hits>0,"WeakMap must actually skip redundant hashes");
   assert(result.memo_misses>0);
   assert(result.memo_invalidations>0,"Same-object content change invalidates fingerprint");
  }
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
   runs.push(sample);console.log("PMSV_B115_AB_SAMPLE "+JSON.stringify(sample));
  }
  const b1=runs.find(x=>x.variant==="baseline"&&x.cpu_rate===1).ready_ms;
  const c1=runs.find(x=>x.variant==="candidate"&&x.cpu_rate===1).ready_ms;
  const b4=runs.find(x=>x.variant==="baseline"&&x.cpu_rate===4).ready_ms;
  const c4=runs.find(x=>x.variant==="candidate"&&x.cpu_rate===4).ready_ms;
  const summary={test:"PMSV_BATCH112_SAME_RUNNER_AB",runs,
   normal_candidate_to_baseline:+(c1/b1).toFixed(3),
   slow_candidate_to_baseline:+(c4/b4).toFixed(3),
   note:"Ratios under 1 favor exact-content WeakMap memo; all source gates remain intact"};
  fs.writeFileSync("pmsv-batch115-direct-digest-ab.json",JSON.stringify(summary,null,2)+"\n");
  console.log("PMSV_B115_AB_RESULT "+JSON.stringify(summary));
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error("PMSV_B115_AB_FAILED",e);process.exitCode=1;server.kill()});
