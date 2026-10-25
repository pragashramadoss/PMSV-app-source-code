"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const base="fssai-product-helper-preview-01/";
const document={readyState:"loading",addEventListener(){},getElementById(){return null}};
function boot(file,window){
 const context=vm.createContext({window,document,setTimeout,console});
 vm.runInContext(fs.readFileSync(base+file,"utf8"),context);
}
(async()=>{
 let b87=0;
 const w98={
  pmsvB58OwnerOutreach:{valid:()=>true,records:()=>[]},
  pmsvB87Catalogue:{closedResearchSummary:()=>{b87++;return{catalogue:533,
   public_source_desk_research_closed:35,public_source_desk_research_open:0,
   external_legal_and_lot_verification_held:35,signed_product_limits:0,
   validated_lab_lot_pass:0,product_releases:0}}}
 };
 boot("pmsv-batch98-source-authentication-handoff-2026-10-25.js",w98);
 const first98=w98.pmsvB98Handoff.load();
 assert.equal(b87,0,"Batch98 click must yield before full source verification");
 assert.equal(await w98.pmsvB98Handoff.load(),false,"Concurrent duplicate Batch98 validation suppressed");
 assert.equal(await first98,false,"Invalid frozen originals remain fail-closed");
 assert.equal(b87,1,"One actual source validation occurs after event dispatch");
 let count99=0;
 const w99={pmsvB98Handoff:{loadVerifiedCases:async()=>{count99++;return[]}}};
 boot("pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js",w99);
 const first99=w99.pmsvB99DownstreamAudit.load();
 assert.equal(count99,0,"Batch99 click must yield before upstream handoff");
 assert.equal(await w99.pmsvB99DownstreamAudit.load(),false,"Concurrent duplicate Batch99 load suppressed");
 assert.equal(await first99,false,"Unverified cases cannot create a ready audit");
 assert.equal(count99,1);
 let count100=0;
 const w100={pmsvB99DownstreamAudit:{loadVerifiedRows:async()=>{count100++;return[]}}};
 boot("pmsv-batch100-independent-review-exception-register-2026-10-25.js",w100);
 const first100=w100.pmsvB100Exceptions.load();
 assert.equal(count100,0,"Batch100 click must yield before upstream full graph validation");
 assert.equal(await w100.pmsvB100Exceptions.load(),false,"Duplicate Batch100 load suppressed");
 assert.equal(await first100,false,"Unverified original rows cannot open issue register");
 assert.equal(count100,1);
 assert.equal(w100.pmsvB100Exceptions.summary().approved,0);
 console.log("Batch104 PASS: 98/99/100 event-dispatch yields, reentrancy safety and fail-closed original evidence.");
})().catch(e=>{console.error(e);process.exitCode=1});
