"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b22=fs.readFileSync(root+"fssai-current35-browser-review-integrity-batch22-2026-10-14.js","utf8");
const b70=fs.readFileSync(root+"fssai-current35-core-startup-batch70-2026-10-17.js","utf8");
async function run(valid){
 const listeners=new Map(),nodes={};
 for(const sel of ["[data-pmsv-b70-core]","[data-pmsv-b70-state]","[data-pmsv-b70-load]","[data-pmsv-b70-message]"]){
  nodes[sel]={textContent:"",disabled:false};
 }
 const panel={querySelector:s=>nodes[s]||null};
 const document={
  readyState:"loading",
  getElementById:id=>id==="pmsv-b70-startup-gates"?panel:null,
  addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn)},
  dispatchEvent(e){for(const fn of listeners.get(e.type)||[])fn(e);return true}
 };
 const ctx=vm.createContext({document,window:{addEventListener(){}},Event:class{constructor(type){this.type=type}},
  pmsvContaminantsLoadPromise:Promise.resolve(),
  pmsvB21Valid:()=>valid,
  pmsvB20Render:()=>"",pmsvB20RenderVerified:()=>"",
  pmsvB21Refresh:()=>{},pmsvB21RefreshVerified:()=>{},
  pmsvB20Ensure:()=>{},pmsvB14CaseHtml:()=>"",
  pmsvB14Esc:x=>String(x),pmsvLoadPositiveSourceProof:async()=>{}
 });
 vm.runInContext(b22,ctx);vm.runInContext(b70,ctx);
 const readyHandlers=listeners.get("DOMContentLoaded")||[];
 assert.equal(readyHandlers.length,2,"B22 loader and B70 display must register");
 const pending=readyHandlers[0]();
 readyHandlers[1]();
 assert.equal(nodes["[data-pmsv-b70-core]"].textContent,"RUNNING",
  "Visible panel begins with current cold loading state");
 await pending;
 const expected=valid?"READY":"INTEGRITY_BLOCKED";
 assert.equal(ctx.pmsvB22StartupState,expected);
 assert.equal(nodes["[data-pmsv-b70-core]"].textContent,expected,
  "Settled event must refresh the visible status without a user click");
 assert.equal(ctx.window.pmsvB70ExtendedResearch.getState().core,expected);
 assert.equal(ctx.window.pmsvB70ExtendedResearch.getState().productReleases,0);
 assert.equal(ctx.window.pmsvB70ExtendedResearch.getState().labPasses,0);
 assert.equal(nodes["[data-pmsv-b70-load]"].disabled,false);
}
(async()=>{
 await run(true);await run(false);
 assert(b22.includes('new Event("pmsv-core-startup-settled")'));
 assert(b70.includes('addEventListener("pmsv-core-startup-settled",status)'));
 console.log("Batch108 PASS: real core transition refreshes stale RUNNING panel for READY or blocked; no unverified release.");
})().catch(e=>{console.error(e);process.exitCode=1});
