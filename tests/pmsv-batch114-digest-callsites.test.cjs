"use strict";
/* Batch114: read-only sampled digest caller analysis plus same-turn mutation
 * safety. The original digest runs on EVERY call; instrumentation NEVER
 * caches decisions, alters source files or grants a commercial release. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),{spawn}=require("node:child_process"),
 {chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18985;
const source=fs.readFileSync(root+"/fssai-source-proof-panels.js","utf8");
assert(source.includes("function pmsvReviewSnapshotDigest(x)"));
const meter=`
;(function(){
 "use strict";
 const original=pmsvReviewSnapshotDigest;
 const byDirect=new Map(),byParent=new Map(),byPair=new Map();
 let calls=0,samples=0;
 const top=map=>[...map].sort((a,b)=>b[1]-a[1]).slice(0,22)
    .map(([site,count])=>({site,samples:count}));
 function clean(line){return String(line||"(unavailable)").trim()
   .replace(/https?:\\/\\/127\\.0\\.0\\.1:\\d+\\//g,"");}
 function inc(map,key){map.set(key,(map.get(key)||0)+1)}
 pmsvReviewSnapshotDigest=function(x){
  calls++;
  if(calls%7===0){
   const stack=String(new Error().stack||"").split("\\n");
   const direct=clean(stack[2]),parent=clean(stack[3]);
   inc(byDirect,direct);inc(byParent,parent);
   inc(byPair,direct+" <- "+parent);samples++;
  }
  return original(x);
 };
 window.__pmsvB114Callsites=()=>({
   digest_calls:calls,sampled_calls:samples,sample_stride:7,
   top_direct_callers:top(byDirect),top_parent_callers:top(byParent),
   top_direct_parent_pairs:top(byPair)
 });
})();
`;
const server=spawn("python3",["-m","http.server",String(port),
 "--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser,context;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  context=await browser.newContext({viewport:{width:390,height:844},
   deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("**/fssai-source-proof-panels.js*",route=>
   route.fulfill({status:200,contentType:"text/javascript; charset=utf-8",
    body:source+meter}));
  let opened=false;
  for(let retry=0;retry<30;retry++){
   try{const r=await page.goto("http://127.0.0.1:"+port+"/",
     {waitUntil:"domcontentloaded",timeout:30000});
    if(r?.ok()){opened=true;break}
   }catch(_){await nap(200)}
  }
  assert(opened,"Could not open preview");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(
   window.pmsvB22StartupState),null,{timeout:180000,polling:200});
  const result=await page.evaluate(()=>{
   const callsBefore=window.__pmsvB114Callsites();
   const clone=structuredClone(pmsvCurrent533SourceLedger);
   const initial=pmsvReviewSnapshotIntact("ledger",clone);
   const before=pmsvReviewSnapshotDigest(clone);
   const originalName=clone.records[0].product_name;
   // Deliberate mutation occurs AFTER a successful check in the SAME
   // synchronous browser evaluation; an identity-only cache would miss it.
   clone.records[0].product_name=originalName+" UNAUTHORIZED SAME-TURN EDIT";
   const after=pmsvReviewSnapshotDigest(clone);
   const rejected=pmsvReviewSnapshotIntact("ledger",clone)===false;
   clone.records[0].product_name=originalName;
   const restored=pmsvReviewSnapshotIntact("ledger",clone)===true;
   const callsAfter=window.__pmsvB114Callsites();
   return {core:pmsvB22StartupState,
    visible:document.querySelector("[data-pmsv-b70-core]")?.textContent,
    cases:document.querySelectorAll("[data-pmsv-b21-open]").length,
    extended:window.pmsvB70ExtendedResearch?.getState()?.extended,
    releases:window.pmsvB70ExtendedResearch?.getState()?.productReleases,
    mutation:{initial_pass:initial,altered_digest:before!==after,
     modified_rejected:rejected,restored_pass:restored},
    before:callsBefore,after:callsAfter};
  });
  assert.equal(result.core,"READY");assert.equal(result.visible,"READY");
  assert.equal(result.cases,35);
  assert.equal(result.extended,"NOT_REQUESTED");
  assert.equal(result.releases,0);
  for(const [key,value] of Object.entries(result.mutation))
   assert.equal(value,true,key+" safety check");
  assert.equal(result.after.digest_calls,result.before.digest_calls+2);
  assert(result.before.digest_calls>1000,"Expected real core validation");
  assert(result.before.sampled_calls>150,"Expected caller samples");
  assert(result.before.top_direct_callers.length>1);
  assert(result.before.top_parent_callers.length>1);
  assert.deepEqual(errors,[]);
  const report={test:"PMSV_BATCH114_DIRECT_AND_PARENT_DIGEST_CALLSITES",
   application_changed:false,sampling_only:true,viewport:390,
   cases_held:35,original_requests_unreceived:175,product_releases:0,
   ...result};
  fs.writeFileSync("pmsv-batch114-digest-callsites.json",
   JSON.stringify(report,null,2)+"\n");
  console.log("PMSV_B114_CALLSITES "+JSON.stringify(report));
 }finally{
  if(context)await context.close();
  if(browser)await browser.close();
  server.kill();
 }
})().catch(e=>{console.error("PMSV_B114_FAILED",e);
 process.exitCode=1;server.kill()});
