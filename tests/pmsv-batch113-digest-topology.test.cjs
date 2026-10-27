"use strict";
/* Batch113 read-only topology study: grouping repeated direct FSSAI digest
 * inquiries by immutable measurement identity and one synchronous JS turn.
 * It NEVER reuses a digest; no source, QA draft or user approval is modified. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),{spawn}=require("node:child_process"),
 {chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18984;
const source=fs.readFileSync(root+"/fssai-source-proof-panels.js","utf8");
assert(source.includes("function pmsvReviewSnapshotDigest(x)"),
 "The known digest function must be present");
const meter=`
;(function(){
 "use strict";
 const original=pmsvReviewSnapshotDigest;
 const ids=new WeakMap(),objects=new Map(),turns=new Map();
 let nextObject=0,nextTurn=0,activeTurn=null,calls=0,rejected=0,totalMs=0;
 function enterTurn(){
  if(activeTurn!==null)return activeTurn;
  const n=++nextTurn;activeTurn=n;
  queueMicrotask(()=>{if(activeTurn===n)activeTurn=null});
  return n;
 }
 pmsvReviewSnapshotDigest=function(x){
  const turn=enterTurn();
  let id="primitive";
  if(x!==null&&(typeof x==="object"||typeof x==="function")){
   id=ids.get(x);
   if(!id){
    id=++nextObject;ids.set(x,id);
    objects.set(id,{object_id:id,calls:0,turns:0,rows:Array.isArray(x.records)?
     x.records.length:null,keys:Object.keys(x).slice(0,5),
     caller:String(new Error().stack||"").split("\\n").slice(2,5)});
   }
  }
  const t=performance.now(),output=original(x);
  totalMs+=performance.now()-t;calls++;
  if(typeof output!=="string")rejected++;
  const o=objects.get(id);if(o)o.calls++;
  let row=turns.get(turn);
  if(!row){row={turn_id:turn,calls:0,objects:new Set(),repeated:0};turns.set(turn,row)}
  row.calls++;
  if(row.objects.has(id))row.repeated++;else{
   row.objects.add(id);if(o)o.turns++;
  }
  return output;
 };
 window.__pmsvB113Topology=()=>({
  calls,distinct_objects:objects.size,synchronous_turns:turns.size,
  estimated_digest_ms:Math.round(totalMs),rejected,
  repeats_in_same_turn:[...turns.values()].reduce((s,t)=>s+t.repeated,0),
  top_objects:[...objects.values()].sort((a,b)=>b.calls-a.calls).slice(0,18),
  top_turns:[...turns.values()].sort((a,b)=>b.calls-a.calls).slice(0,18)
   .map(t=>({turn_id:t.turn_id,calls:t.calls,distinct_objects:t.objects.size,
    repeated:t.repeated}))
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
   const before=window.__pmsvB113Topology();
   const old=pmsvReviewSnapshotDigest(pmsvCurrent533SourceLedger);
   const target=pmsvReviewSnapshotDigests.ledger;
   const changed=structuredClone(pmsvCurrent533SourceLedger);
   changed.records[0].product_name+=" [unauthorized edit]";
   const blocked=pmsvReviewSnapshotDigest(changed)!==target&&
    pmsvReviewSnapshotIntact("ledger",changed)===false;
   const after=window.__pmsvB113Topology();
   return {core:pmsvB22StartupState,
    visible:document.querySelector("[data-pmsv-b70-core]")?.textContent,
    elapsed_ms:Math.round(performance.now()),
    cases:document.querySelectorAll("[data-pmsv-b21-open]").length,
    extended:window.pmsvB70ExtendedResearch?.getState()?.extended,
    releases:window.pmsvB70ExtendedResearch?.getState()?.productReleases,
    original_pinned:old===target,altered_rejected:blocked,before,after};
  });
  assert.equal(result.core,"READY");assert.equal(result.visible,"READY");
  assert.equal(result.cases,35);assert.equal(result.extended,"NOT_REQUESTED");
  assert.equal(result.releases,0);assert.equal(result.original_pinned,true);
  assert.equal(result.altered_rejected,true);
  assert.equal(result.after.calls,result.before.calls+2);
  assert.deepEqual(errors,[]);
  const report={test:"PMSV_BATCH113_SYNCHRONOUS_DIGEST_TOPOLOGY",
   instrumentation:"MEASUREMENT_ONLY",rate:1,viewport:390,...result,
   cases_held:35,requests_outstanding:175,no_product_approvals:true};
  fs.writeFileSync("pmsv-batch113-digest-topology.json",
   JSON.stringify(report,null,2)+"\n");
  console.log("PMSV_B113_TOPOLOGY "+JSON.stringify(report));
 }finally{if(context)await context.close();if(browser)await browser.close();
  server.kill()}
})().catch(e=>{console.error("PMSV_B113_FAILED",e);
 process.exitCode=1;server.kill()});
