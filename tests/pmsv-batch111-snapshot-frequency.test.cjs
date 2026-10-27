"use strict";
/* PMSV Batch111: profile exact fingerprint invocation frequency by kind on
 * real mobile Chromium. Route-only instrumentation; NEVER shipped to users.
 * Every integrity gate still executes; no source/rule/review state is altered. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {spawn}=require("node:child_process");
const {chromium}=require("playwright");
const root="fssai-product-helper-preview-01",port=18982;
const source=fs.readFileSync(root+"/fssai-source-proof-panels.js","utf8");
assert(source.includes("function pmsvReviewSnapshotIntact(kind,document)"),
 "Instrument only the recognized original integrity check");
const meter=`
;(function(){
 "use strict";
 const original=pmsvReviewSnapshotIntact;
 const counts=Object.create(null);
 pmsvReviewSnapshotIntact=function(kind,document){
  const started=performance.now();
  const valid=original(kind,document);
  const elapsed=performance.now()-started;
  const rec=counts[kind]||(counts[kind]={calls:0,elapsed_ms:0,
   max_ms:0,failed:0,first_call_stacks:[]});
  rec.calls++;
  rec.elapsed_ms+=elapsed;
  rec.max_ms=Math.max(rec.max_ms,elapsed);
  if(!valid)rec.failed++;
  if(rec.first_call_stacks.length<3)
   rec.first_call_stacks.push(String(new Error().stack||"").split("\\n").slice(1,8));
  return valid;
 };
 window.__pmsvB111Meter={
  snapshot:()=>Object.fromEntries(Object.entries(counts).map(([key,row])=>
   [key,{...row,elapsed_ms:Math.round(row.elapsed_ms),
    max_ms:Math.round(row.max_ms)}]))
 };
})();
`;
const server=spawn("python3",["-m","http.server",String(port),
 "--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(r=>setTimeout(r,ms));
async function run(browser,cpu_rate){
 const context=await browser.newContext({viewport:{width:390,height:844},
  deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.route("**/fssai-source-proof-panels.js*",route=>
  route.fulfill({status:200,contentType:"text/javascript; charset=utf-8",
   body:source+meter}));
 const cdp=await context.newCDPSession(page);
 await cdp.send("Emulation.setCPUThrottlingRate",{rate:cpu_rate});
 try{
  let opened=false;
  for(let retry=0;retry<30;retry++){
   try{
    const r=await page.goto("http://127.0.0.1:"+port+"/",
     {waitUntil:"domcontentloaded",timeout:30000});
    if(r?.ok()){opened=true;break;}
   }catch(_){await nap(200)}
  }
  assert(opened,"Local preview unavailable");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(
   window.pmsvB22StartupState),null,{timeout:180000,polling:200});
  const measured=await page.evaluate(()=>{
   const get=()=>window.__pmsvB111Meter.snapshot();
   const before=get();
   const untouched=pmsvReviewSnapshotIntact("ledger",pmsvCurrent533SourceLedger);
   const afterFreshCheck=get();
   const changed=JSON.parse(JSON.stringify(pmsvCurrent533SourceLedger));
   changed.records[0].product_name+=" (changed)";
   const tamperRejected=pmsvReviewSnapshotIntact("ledger",changed)===false;
   return {core:pmsvB22StartupState,
    visible:document.querySelector("[data-pmsv-b70-core]")?.textContent,
    elapsed_ms:Math.round(performance.now()),
    cases:document.querySelectorAll("[data-pmsv-b21-open]").length,
    extended:window.pmsvB70ExtendedResearch?.getState()?.extended,
    releases:window.pmsvB70ExtendedResearch?.getState()?.productReleases,
    before,afterFreshCheck,tamperRejected,untouched};
  });
  assert.equal(measured.core,"READY");
  assert.equal(measured.visible,"READY");
  assert.equal(measured.cases,35);
  assert.equal(measured.extended,"NOT_REQUESTED");
  assert.equal(measured.releases,0);
  assert(measured.untouched,"Current source has exact original digest");
  assert(measured.tamperRejected,"Changed source must be rejected");
  assert.equal(measured.afterFreshCheck.ledger.calls,measured.before.ledger.calls+1,
   "Independent later check must execute anew");
  assert.deepEqual(errors,[]);
  return {cpu_rate,...measured};
 }finally{await context.close()}
}
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const runs=[];
  for(const rate of [1,4]){
   const r=await run(browser,rate);runs.push(r);
   console.log("PMSV_B111_SNAPSHOT_SAMPLE "+JSON.stringify(r));
  }
  const result={test:"PMSV_BATCH111_SNAPSHOT_INVOCATIONS",runs,
   source_status:"UNCHANGED",commercial_cases_held:35,
   requests_not_sent:175,product_releases:0,
   purpose:"MEASUREMENT_ONLY_NO_INTEGRITY_BYPASS"};
  fs.writeFileSync("pmsv-batch111-snapshot-frequency.json",
   JSON.stringify(result,null,2)+"\n");
  console.log("PMSV_B111_SNAPSHOT_RESULT "+JSON.stringify(result));
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error("PMSV_B111_FAILED",e);
 process.exitCode=1;server.kill()});
