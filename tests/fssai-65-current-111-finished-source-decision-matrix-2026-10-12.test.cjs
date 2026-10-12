"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),app="fssai-product-helper-preview-01/";
const data=n=>JSON.parse(fs.readFileSync(path.join(root,app+"data/rules/"+n),"utf8"));
const m=data("fssai-65-current-111-finished-source-decision-matrix-2026-10-12.json");
const q=data("fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json");
const ledger=data("fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json");
const core=data("contaminants-v9-core.json");
const src=fs.readFileSync(path.join(root,app+"fssai-65-current-111-finished-source-decision-matrix.js"),"utf8");
function digest(x){
 const s=JSON.stringify(x);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519);}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function context(){
 const ctx={console,contaminantsDb:core,pmsv2026Current111Queue:q,
 pmsv2026Current422Ledger:ledger,pmsv2026Current422Valid:()=>true,
 pmsv2026Decision111Valid:()=>true,pmsvReviewSnapshotDigest:digest,
 pmsvLoadPositiveSourceProof:async()=>{},
 pmsv2026Current111ProofHtml:()=>'<div>Existing pending decision</div>',
 esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")};
 vm.createContext(ctx);vm.runInContext(src,ctx);ctx.pmsvCurrent65Matrix=m;return ctx;
}
test("65 unique pending product identities and 533/422/111 conserved",()=>{
 assert.equal(m.records.length,65);
 assert.equal(new Set(m.records.map(x=>x.catalog_id)).size,65);
 assert.equal(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,111);
 assert.equal(ledger.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,422);
 assert.equal(m.first_source_promotions,0);assert.equal(m.complete_compliance_approvals,0);
 assert.equal(vm.runInContext("pmsvCurrent65Valid()",context()),true);
});
test("65 evidence packets never approve finished food automatically",()=>{
 for(const x of m.records){
  assert.equal(x.exact_finished_article_first_source_verified,false);
  assert.equal(x.numeric_finished_limit_auto_applied,false);
  assert.equal(x.tested_lot_pass,false);
  assert.equal(x.full_regulatory_compliance_pass,false);
  assert.match(x.official_finished_product_source,/fssai\.gov\.in/);
 }
});
test("UI preserves conditional source scopes and already available current decision",()=>{
 const ctx=context();
 const id="11-11-1-dried-glucose-syrup",x=ledger.records.find(v=>v.catalog_id===id);
 const html=vm.runInContext("pmsv2026Current111ProofHtml("+JSON.stringify({id,name:x.product_name,fssr:x.fssr,fcs:x.fcs})+")",ctx);
 assert.match(html,/Existing pending decision/);
 assert.match(html,/Additional individually verified source boundary/);
 assert.match(html,/RESEARCH ONLY/);
 assert.match(html,/sulphated ash/);
 assert.match(html,/NO NUMERIC LIMIT OR COMPLIANCE PASS/);
});
test("Fail-closed on modified limits, identity, source or roster",()=>{
 const ctx=context();
 ctx.pmsvCurrent65Matrix=structuredClone(m);
 ctx.pmsvCurrent65Matrix.records[0].product_name="Corrupted";
 assert.equal(vm.runInContext("pmsvCurrent65Valid()",ctx),false);
 ctx.pmsvCurrent65Matrix=m;assert.equal(vm.runInContext("pmsvCurrent65Valid()",ctx),true);
 ctx.pmsv2026Current422Ledger=structuredClone(ledger);
 ctx.pmsv2026Current422Ledger.records.find(x=>x.catalog_id===m.records[0].catalog_id).source_status="PARTIAL_EXACT_SOURCE_MATCH";
 assert.equal(vm.runInContext("pmsvCurrent65Valid()",ctx),false);
});
test("Integrated load order after current 111 decision and FSSAI workflow regression",()=>{
 const html=fs.readFileSync(path.join(root,app+"index.html"),"utf8");
 const old=html.indexOf('src="./fssai-current-111-decision-gates.js');
 const newer=html.indexOf('src="./fssai-65-current-111-finished-source-decision-matrix.js');
 assert.ok(old>0&&newer>old);
 const workflow=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(workflow,/fssai-65-current-111-finished-source-decision-matrix-2026-10-12\.test\.cjs/);
});
