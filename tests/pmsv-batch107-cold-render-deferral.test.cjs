"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const dir="fssai-product-helper-preview-01/";
const file=n=>fs.readFileSync(dir+n,"utf8");
const b20=file("fssai-current35-review-draft-source-audit-batch20-2026-10-14.js");
const b21=file("fssai-current35-review-readiness-bridge-batch21-2026-10-14.js");
const b22=file("fssai-current35-browser-review-integrity-batch22-2026-10-14.js");
const makeContext=x=>vm.createContext(x);
(async()=>{
 let sourceChecks=0,render20=0,render21=0;
 const ctx=makeContext({
  document:{readyState:"loading",addEventListener(){},getElementById(){return null}},
  window:{addEventListener(){}},
  pmsvB21Valid:()=>{sourceChecks++;return true},
  pmsvB20Render:()=>{throw Error("B22 repeated public source validation")},
  pmsvB20RenderVerified:()=>{render20++;return '<details id="pmsv-b20-audit"></details>'},
  pmsvB21Refresh:()=>{throw Error("B22 repeated public B21 validation")},
  pmsvB21RefreshVerified:()=>{render21++},
  pmsvB20Ensure:()=>{},pmsvB14CaseHtml:()=>"",
  pmsvB14Esc:x=>String(x),pmsvLoadPositiveSourceProof:async()=>{}
 });
 vm.runInContext(b22,ctx);
 assert.equal(ctx.pmsvB22Sync(),true);
 assert.equal(sourceChecks,1,"One full source graph per explicit B22 sync");
 assert.equal(render20,1);assert.equal(render21,1);
 const stats=vm.runInContext("pmsvB22Stats",ctx);
 assert.equal(stats.syncs,1);
 ctx.pmsvB21Valid=()=>false;
 assert.equal(ctx.pmsvB22Sync(),false,"Tampered source must block a new sync");
 assert.equal(render20,1);assert.equal(render21,1);
 assert.equal(stats.syncs,1);
 for(const [source,label] of [[b20,"B20"],[b21,"B21"]]){
  assert(source.includes('pmsvB22StartupState!=="RUNNING"'),label+" missing cold-start render deferral");
  assert(source.includes('if(!pmsvB'+(label==="B20"?"20":"21")+'Valid())'),label+" public verifier removed");
 }
 // The original fetch+digest check still executes during the cold phase.
 const b20ctx=makeContext({
  pmsvLoadPositiveSourceProof:async()=>{},
  pmsvB14Read:()=>({}),pmsvB5Read:()=>({}),pmsvB14Esc:x=>String(x),
  fetch:async()=>({ok:true,json:async()=>({})}),
  pmsvB22StartupState:"RUNNING"
 });
 vm.runInContext(b20,b20ctx);
 let b20Validations=0,b20Renders=0;
 b20ctx.pmsvB20Valid=()=>{b20Validations++;return true};
 b20ctx.pmsvB20Ensure=()=>{b20Renders++};
 await b20ctx.pmsvLoadPositiveSourceProof();
 assert.equal(b20Validations,1,"Cold B20 proof still validated");
 assert.equal(b20Renders,0,"Cold B20 DOM rendering deferred");
 b20ctx.pmsvB22StartupState="READY";
 await b20ctx.pmsvLoadPositiveSourceProof();
 assert.equal(b20Renders,1,"Explicit later B20 reload renders");
 const b21ctx=makeContext({
  pmsvLoadPositiveSourceProof:async()=>{},
  pmsvB20Ensure:()=>{},pmsvB15CommitTransfer:()=>false,
  pmsvB14Read:()=>({}),pmsvB5Read:()=>({}),
  pmsvB14Esc:x=>String(x),
  fetch:async()=>({ok:true,json:async()=>({})}),
  pmsvB22StartupState:"RUNNING"
 });
 vm.runInContext(b21,b21ctx);
 let b21Validations=0,b21Renders=0;
 b21ctx.pmsvB21Valid=()=>{b21Validations++;return true};
 b21ctx.pmsvB21Refresh=()=>{b21Renders++};
 await b21ctx.pmsvLoadPositiveSourceProof();
 assert.equal(b21Validations,1,"Cold B21 proof still validated");
 assert.equal(b21Renders,0,"Cold B21 DOM rendering deferred");
 b21ctx.pmsvB22StartupState="READY";
 await b21ctx.pmsvLoadPositiveSourceProof();
 assert.equal(b21Renders,1,"Explicit later B21 reload renders");
 console.log("Batch107 PASS: core cold render de-duplicated, one explicit source verification, tamper fail-closed, later refresh intact.");
})().catch(e=>{console.error(e);process.exitCode=1});
