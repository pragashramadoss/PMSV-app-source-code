"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b99=fs.readFileSync(root+"pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js","utf8");
const b100=fs.readFileSync(root+"pmsv-batch100-independent-review-exception-register-2026-10-25.js","utf8");
const index=fs.readFileSync(root+"index.html","utf8");
assert(index.includes("pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js"));
assert(b99.includes("pmsv-batch100-independent-review-exception-register-2026-10-25.js"));
assert(!index.includes("pmsv-batch100-independent-review-exception-register-2026-10-25.js"),
 "Batch100 is loaded through Batch99, avoiding a global HTML/index update");
const registry=new Map();
class E{
 constructor(tag){this.tagName=tag.toUpperCase();this.attrs={};this.children=[];this.textContent="";this.inserted=null;}
 setAttribute(k,v){this.attrs[k]=String(v);if(k==="id"){this.id=String(v);registry.set(this.id,this)}}
 appendChild(x){this.children.push(x);return x}
 insertAdjacentElement(place,x){this.inserted={place,node:x};x.parentElement=this.parentElement;return x}
 querySelector(){return null}
}
const anchor=new E("details"),outer=new E("details");
anchor.setAttribute("id","pmsv-b98-source-handoff");
outer.setAttribute("id","pmsv-b70-startup-gates");
const section=new E("section");section.setAttribute("id","standard");
anchor.parentElement=outer;outer.parentElement=section;
const head=new E("head");
const document={
 readyState:"complete",head,body:new E("body"),addEventListener(){},
 getElementById:id=>registry.get(id)||null,
 createElement:tag=>new E(tag),
 createTextNode:s=>({textContent:String(s)})
};
const window={};
const ctx=vm.createContext({window,document,console,setTimeout});
vm.runInContext(b99,ctx);
const audit=registry.get("pmsv-b99-downstream-audit");
assert(audit);
assert.equal(outer.inserted?.node,audit);
assert.equal(outer.inserted?.place,"afterend");
assert.equal(anchor.inserted,null,"Batch99 must no longer be hidden inside a closed Batch70 panel");
assert.equal(head.children.filter(x=>x.id==="pmsv-b100-module").length,1);
vm.runInContext(b100,ctx);
const exceptions=registry.get("pmsv-b100-exception-register");
assert(exceptions);
assert.equal(audit.inserted?.node,exceptions);
assert.equal(audit.inserted?.place,"afterend");
assert.equal(exceptions.parentElement,section,"Batch100 must be accessible from the Product Standard tab");
assert.equal(head.children.filter(x=>x.id==="pmsv-b100-css").length,1);
assert(!/caseApprovals\s*:\s*[1-9]/.test(b100));
let resolve;
(async()=>{
 const tick=()=>new Promise(r=>setTimeout(r,0));
 let resolveB98;
 window.pmsvB98Handoff={loadVerifiedCases:()=>new Promise(r=>{resolveB98=r})};
 const auditFirst=window.pmsvB99DownstreamAudit.load();
 assert.equal(await window.pmsvB99DownstreamAudit.load(),false,"duplicate Batch99 audit suppressed");
 await tick();
 assert.equal(typeof resolveB98,"function","Batch99 verification resumes after yielding browser click");
 resolveB98(false);
 assert.equal(await auditFirst,false);
 window.pmsvB99DownstreamAudit={loadVerifiedRows:()=>new Promise(r=>{resolve=r})};
 const first=window.pmsvB100Exceptions.load();
 assert.equal(await window.pmsvB100Exceptions.load(),false,"duplicate source-loading request suppressed");
 await tick();
 assert.equal(typeof resolve,"function","Batch100 verification resumes after yielding browser click");
 resolve(false);
 assert.equal(await first,false);
 const follow=window.pmsvB100Exceptions.load();
 await tick();
 assert.equal(typeof resolve,"function");
 resolve(false);
 assert.equal(await follow,false,"retry is possible after failed upstream source checks");
 console.log("Batch101 PASS: evidence-review panels visible outside collapsed Batch70, only one lazy loader, reentrant load prevented, fail-closed retry supported.");
})().catch(err=>{console.error(err);process.exitCode=1});
