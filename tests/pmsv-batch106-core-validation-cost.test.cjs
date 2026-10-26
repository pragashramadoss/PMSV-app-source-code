"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
function load(filename,ctx){
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(root+filename,"utf8"),ctx);
 return ctx;
}
const ids=Array.from({length:35},(_,i)=>"HELD-"+String(i+1).padStart(2,"0"));
const b20=load("fssai-current35-review-draft-source-audit-batch20-2026-10-14.js",{
 pmsvLoadPositiveSourceProof:async()=>{},pmsvB14Read:()=>({}),pmsvB5Read:()=>({}),
 pmsvB14Esc:x=>String(x)
});
b20.pmsvB20Data={cases:ids.map(id=>({catalog_id:id,product_name:id})),article_warning_rules:[]};
let b20Checks=0;
b20.pmsvB20Valid=()=>{b20Checks++;return true};
assert.equal(b20.pmsvB20All().length,35);
assert.equal(b20Checks,1,"A 35-row B20 render must not recompute 35 full source graphs");
b20Checks=0;
assert.match(b20.pmsvB20Render(),/35-case article-risk audit/);
assert.equal(b20Checks,1,"B20 render verifies the original source once");
b20Checks=0;
assert.equal(b20.pmsvB20Analyze(ids[0],{},[]).status,"NOT_STARTED");
assert.equal(b20Checks,1,"Separate public case inquiry still verifies source");
b20.pmsvB20Valid=()=>false;
assert.equal(b20.pmsvB20All().length,0);
assert.equal(b20.pmsvB20Analyze(ids[0],{},[]),null);
assert.equal(b20.pmsvB20Render(),"");
const b21=load("fssai-current35-review-readiness-bridge-batch21-2026-10-14.js",{
 pmsvLoadPositiveSourceProof:async()=>{},pmsvB20Ensure:()=>{},
 pmsvB15CommitTransfer:()=>false,pmsvB14Read:()=>({}),pmsvB5Read:()=>({}),
 pmsvB14Esc:x=>String(x),
 pmsvB20All:()=>ids.map(id=>({id,status:"NOT_STARTED",issues:[]}))
});
b21.pmsvB21Data={cases:ids.map(id=>({
 catalog_id:id,product_name:id,priority:"P0",primary_blocker:"SOURCE_REQUIRED",
 prior_research_route:"NO_SPECIFIC_NEW_CANDIDATE"
}))};
let b21Checks=0;
b21.pmsvB21Valid=()=>{b21Checks++;return true};
assert.equal(b21.pmsvB21All().length,35);
assert.equal(b21Checks,1,"One B21 validation per public 35-row query");
b21Checks=0;
assert.match(b21.pmsvB21DashboardHtml(),/35 exact legal sources still pending/);
assert.equal(b21Checks,1,"B21 dashboard reuses a verified per-render row snapshot");
b21.pmsvB21Valid=()=>false;
assert.equal(b21.pmsvB21All().length,0);
assert.equal(b21.pmsvB21DashboardHtml(),"");
let b22Checks=0,b22Refreshes=0,proofLoads=0;
const b22=load("fssai-current35-browser-review-integrity-batch22-2026-10-14.js",{
 document:{readyState:"loading",addEventListener(){},getElementById(){return null}},
 window:{addEventListener(){}},pmsvB20Ensure:()=>{},
 pmsvB21Valid:()=>{b22Checks++;return true},
 pmsvB20Render:()=>"",pmsvB21Refresh:()=>{b22Refreshes++},
 pmsvB14CaseHtml:()=>"",pmsvB14Esc:x=>String(x),
 pmsvLoadPositiveSourceProof:async()=>{proofLoads++}
});
assert.equal(b22.pmsvB22Sync(),true);
assert.equal(b22Checks,1,"Public sync validates full source exactly once per action");
assert.equal(b22Refreshes,1,"No redundant dashboard refresh in same sync");
b22Checks=0;
b22.pmsvB20Ensure();
assert.equal(b22Checks,1,"Direct B20 refresh still checks original source");
b22Checks=0;
(async()=>{
 await b22.pmsvB22AfterStartup();
 assert.equal(b22.pmsvB22StartupState,"READY");
 assert.equal(proofLoads,0,"Already valid upstream data needs no reload");
 assert.equal(b22Checks,2,"Startup checks prior valid source and one final source decision, not a repeated sync graph");
 assert.equal(b22Refreshes,3,"One refresh each for public sync, direct B20 action and startup");
 const stats=vm.runInContext("pmsvB22Stats",b22);
 assert(Number.isFinite(stats.core_start_ms)&&stats.core_start_ms>=0);
 assert(Number.isFinite(stats.core_proof_ms)&&stats.core_proof_ms>=0);
 b22.pmsvB21Valid=()=>false;
 assert.equal(b22.pmsvB22Sync(),false,"A later separate invalid source blocks DOM sync");
 assert.equal(b22.pmsvB20Ensure(),undefined);
 assert.equal(stats.syncs,2);
 console.log("Batch106 PASS: B20/21 35-row scans one source decision per synchronous operation; B22 start/sync drops duplicate validators; public tamper gates fail closed.");
})().catch(e=>{console.error(e);process.exitCode=1});
