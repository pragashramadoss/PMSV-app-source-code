"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),app="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,app+"data/rules/"+p),"utf8"));
const doc=read("fssai-final-46-current-111-source-boundary-2026-10-12.json"),prior=read("fssai-65-current-111-finished-source-decision-matrix-2026-10-12.json"),
 queue=read("fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"),
 ctr=read("contaminants-v9-core.json");
const moduleJs=fs.readFileSync(path.join(root,app+"fssai-final-46-current-111-source-boundary.js"),"utf8");
function digest(x){let a=0x811c9dc5,b=0x9747b28c,s=JSON.stringify(x);
 for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function context(){
 const ctx={console,pmsvCurrent65Matrix:prior,pmsv2026Current111Queue:queue,
 contaminantsDb:ctr,pmsv2026Current422Valid:()=>true,pmsv2026Decision111Valid:()=>true,
 pmsvCurrent65Valid:()=>true,pmsvReviewSnapshotDigest:digest,pmsvLoadPositiveSourceProof:async()=>{},
 pmsv2026Current111ProofHtml:()=>'<div>Existing pending evidence</div>',esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")};
 vm.createContext(ctx);vm.runInContext(moduleJs,ctx);ctx.pmsvCurrent46BoundaryDb=doc;return ctx;
}
test("65 + 46 official source dossiers represent exactly all 111 current first-source pending identities",()=>{
 const set=new Set([...prior.records,...doc.records].map(x=>x.catalog_id));
 assert.equal(prior.records.length,65);assert.equal(doc.records.length,46);assert.equal(set.size,111);
 assert.deepEqual(set,new Set(queue.review_records.map(x=>x.catalog_id)));
 assert.equal(doc.partial_exact_evidence,422);assert.equal(doc.first_source_pending,111);
 assert.equal(vm.runInContext("pmsvCurrent46BoundaryValid()",context()),true);
});
test("All 46 finished-product CTR assignments remain withheld",()=>{
 for(const x of doc.records){
  assert.equal(x.official_finished_ctr_article_verified,false);
  assert.equal(x.numeric_compliance_limit_auto_applied,false);
  assert.equal(x.regulatory_clearance,false);assert.equal(x.analytical_lot_pass,false);
  assert.match(x.fssai_source,/fssai\.gov\.in/);
 }
});
test("Research-only claims shown with authentic official sources and prior decision unchanged",()=>{
 const ctx=context(),id="18-18-1-starch-based-sweets";
 const x=queue.review_records.find(x=>x.catalog_id===id);
 const html=vm.runInContext("pmsv2026Current111ProofHtml("+JSON.stringify({id,name:x.product_name,fssr:x.fssr,fcs:x.fcs})+")",ctx);
 assert.match(html,/Existing pending evidence/);
 assert.match(html,/Further official identity review/);
 assert.match(html,/NO FINISHED CTR NUMERIC SOURCE OR LABORATORY PASS/);
 assert.match(html,/Forbidden limit transfer/);
});
test("Altered identity, candidate, source or coverage fails closed",()=>{
 const ctx=context();
 ctx.pmsvCurrent46BoundaryDb=structuredClone(doc);ctx.pmsvCurrent46BoundaryDb.records[0].product_name="tampered";
 assert.equal(vm.runInContext("pmsvCurrent46BoundaryValid()",ctx),false);
 ctx.pmsvCurrent46BoundaryDb=structuredClone(doc);ctx.pmsvCurrent46BoundaryDb.records[0].known_named_article_candidates_research_only.push("lead-milks");
 assert.equal(vm.runInContext("pmsvCurrent46BoundaryValid()",ctx),false);
 ctx.pmsvCurrent46BoundaryDb=doc;
 assert.equal(vm.runInContext("pmsvCurrent46BoundaryValid()",ctx),true);
});
test("Current 46 extension loaded after earlier 65, with regression workflow",()=>{
 const h=fs.readFileSync(path.join(root,app+"index.html"),"utf8");
 assert.ok(h.indexOf('src="./fssai-65-current-111-finished-source-decision-matrix.js')>0);
 assert.ok(h.indexOf('src="./fssai-final-46-current-111-source-boundary.js')>h.indexOf('src="./fssai-65-current-111-finished-source-decision-matrix.js'));
 const w=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.ok(w.includes("fssai-final-46-current-111-source-boundary-2026-10-12.test.cjs"));
});
