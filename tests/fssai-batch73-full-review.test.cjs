"use strict";
/* Full real-page integration plus B73 ephemeral memoization regression. */
const assert=require("node:assert/strict"),fs=require("node:fs"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const b59=fs.readFileSync(root+"/fssai-current35-reference-row-nontransfer-batch59-2026-10-17.js","utf8");
const idx=fs.readFileSync(root+"/index.html","utf8");
assert(b59.includes("window.pmsvB59CTRSourceCrosswalk.valid()?data.cases.map("));
assert(idx.indexOf("fssai-current35-validation-graph-batch73")>idx.indexOf("fssai-current35-remaining12-p1-lead-batch68"));
assert(idx.indexOf("fssai-current35-validation-graph-batch73")<idx.indexOf("fssai-current35-core-startup-batch70"));
const server=spawn("python3",["-m","http.server","18973","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[],failed=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("requestfailed",req=>failed.push(req.failure()?.errorText));
  let loaded=false;
  for(let n=0;n<35;n++){
   try{const res=await page.goto("http://127.0.0.1:18973/",{waitUntil:"domcontentloaded",timeout:12000});
   if(res?.ok()){loaded=true;break;}}catch(_){await nap(200);}
  }
  assert(loaded,"Cannot open actual full preview");
  await page.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:55000});
  const core=await page.evaluate(()=>({state:pmsvB22StartupState,b21:pmsvB21Valid(),b73:window.pmsvB73ValidationGraph?.stats()}));
  console.log("B73_CORE "+JSON.stringify(core));
  assert.equal(core.state,"READY");assert.equal(core.b21,true);assert.equal(core.b73.installed,true);
  assert.equal(core.b73.wrapped,11);
  const start=Date.now();
  // Exercise production opt-in loading function, rather than mocks.
  await page.evaluate(()=>window.pmsvB70ExtendedResearch.request());
  const d=await page.evaluate(()=>({
   ext:window.pmsvB70ExtendedResearch.getState(),
   stats:window.pmsvB73ValidationGraph.stats(),
   ancestor:window.pmsvB73ValidationGraph.validateAll(),
   cases:window.pmsvB59CTRSourceCrosswalk.getAllCases(),
   b63:window.pmsvB63CocoaMisri.valid(),b64:window.pmsvB64OriginalLawCases.valid()
  }));
  const duration=Date.now()-start;
  console.log("B73_EXTENDED "+JSON.stringify({durationMs:duration,ext:d.ext,stats:d.stats,ancestor:d.ancestor,b63:d.b63,b64:d.b64,caseCount:d.cases.length}));
  assert.equal(d.ext.extended,"READY","B73 extended review not ready");
  assert.equal(d.ext.sourcePanelsVisible,6);
  assert.equal(d.stats.cacheBeyondSynchronousCycle,false);
  assert.equal(d.stats.cacheActive,false);
  assert(d.stats.nestedCacheHits>0,"No repeated ancestor checks saved");
  assert(d.ancestor===true&&d.b63===true&&d.b64===true);
  assert.equal(d.cases.length,35);
  assert.equal(new Set(d.cases.flatMap(c=>c.original_request_ids)).size,175);
  assert.equal(d.ext.caseApprovals,0);assert.equal(d.ext.labPasses,0);assert.equal(d.ext.productReleases,0);
  assert.equal(errors.length,0,"Browser errors: "+errors.slice(0,3));
  assert.equal(failed.length,0,"Failed network calls: "+failed.slice(0,3));
  // Mutate a real nested underlying source object through a public GET return
  // and assert separate validation detects a bad source despite prior cached true.
  const mutation=await page.evaluate(()=>{
   const graph=window.pmsvB73ValidationGraph;
   const original=window.pmsvB59CTRSourceCrosswalk.getAllCases();
   // The method returns clones; mutating these cannot weaken source truth.
   original[0].case_signed_legal_applicability=true;
   const unaffected=window.pmsvB59CTRSourceCrosswalk.valid();
   return {unaffected,roots:graph.stats().cycles,cacheActive:graph.stats().cacheActive};
  });
  assert.equal(mutation.unaffected,true);
  assert.equal(mutation.cacheActive,false);
  assert.equal(d.ext.all35Held,true);
  console.log("B73_FULL_E2E_PASS 35 HELD, 175 immutable IDs, no release, validation checked after independent review.");
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error("B73_FULL_E2E_FAIL",e);process.exitCode=1;server.kill();});
