"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),app="fssai-product-helper-preview-01/";
const read=n=>JSON.parse(fs.readFileSync(path.join(root,app+"data/rules/"+n),"utf8"));
const m=read("fssai-live-111-official-article-crosswalk-2026-10-12.json");
const q=read("fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json");
const ledger=read("fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json");
const c=read("contaminants-v9-core.json");
const proof=fs.readFileSync(path.join(root,app+"fssai-source-proof-panels.js"),"utf8");
const moduleText=fs.readFileSync(path.join(root,app+"fssai-live-111-official-article-crosswalk.js"),"utf8");
function context(){
 const ctx={console,contaminantsDb:c,pmsv2026Current111Queue:q,
   pmsv2026Current422Ledger:ledger,pmsvLive111ReferenceDb:m,
   pmsv2026Current422Valid:()=>true,
   pmsvLoadPositiveSourceProof:async()=>{},
   sourcePinned121ResearchProofHtml:()=>'<div>Historical review</div>',
   pmsv2026Current422Html:()=>'<div>Correct current partial source status</div>',
   pmsvCurrent116ProofChecklistHtml:()=>'<div>Old 116 local checklist</div>',
   esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(ctx);
 for(const [a,b] of [["function pmsvProofSourceMatch","function sourcePinned121ResearchProofHtml"],
  ["function pmsvReviewSnapshotDigest","function pmsvReviewSnapshotIntact"]]){
  const start=proof.indexOf(a),end=proof.indexOf(b,start);
  assert.ok(start>0&&end>start);
  vm.runInContext(proof.slice(start,end),ctx);
 }
 vm.runInContext(moduleText,ctx);
 // Module declarations initialize the load state to null. Inject the authenticated
 // fixture AFTER evaluating the module, exactly as the browser fetch does.
 ctx.pmsvLive111ReferenceDb=m;
 return ctx;
}
test("Current 533/422/111 legal status conserved and no reassignment",()=>{
 assert.equal(m.catalogue,533);assert.equal(m.partial_first_source,422);
 assert.equal(m.pending_first_source,111);assert.equal(q.review_records.length,111);
 assert.equal(ledger.records.length,533);
 assert.equal(ledger.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,422);
 assert.equal(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,111);
 assert.equal(m.new_automatic_product_promotions,0);
 assert.equal(m.finished_product_numeric_auto_applied,false);
 assert.equal(m.laboratory_pass,false);assert.equal(m.compliance_pass,false);
});
test("Entire 111 queue crosswalk reconciles 87 referenced products, 24 no references, 114 candidate links, 32 authenticated named rows, no ambiguous references",()=>{
 const refs=[...new Set(q.review_records.flatMap(x=>x.referenced_articles_review_only||[]))];
 assert.equal(refs.length,29);
 assert.equal(q.review_records.filter(x=>x.referenced_articles_review_only.length).length,87);
 assert.equal(q.review_records.reduce((n,x)=>n+x.referenced_articles_review_only.length,0),114);
 assert.equal(m.references.length,29);
 assert.equal(m.references.filter(x=>x.source_id).length,28);
 assert.equal(m.references.find(x=>x.key==="Hard boiled sugar confectionery").source_rows.length,4);
 assert.equal(m.references.filter(x=>!x.source_id).length,1);
 assert.equal(m.distinct_named_source_rows,32);assert.equal(m.ambiguous_reference_labels,0);
 assert.deepEqual(new Set(m.references.map(x=>x.key)),new Set(refs));
 assert.equal(m.references.find(x=>x.key==="Hard boiled sugar confectionery").state,
   "OFFICIAL_MULTI_ANALYTE_SOURCE_ROWS_REFERENCE_ONLY");
});
test("Every row is verified against the actual loaded FSSAI source table; never implies product applicability",()=>{
 const ctx=context();
 assert.equal(vm.runInContext("pmsvLive111ReferenceValid()",ctx),true);
 for(const x of m.references)assert.equal(x.finished_article_applicability_verified,false);
 for(const r of q.review_records){
  assert.equal(r.first_exact_source_verified,false);
  assert.equal(r.finished_food_laboratory_pass,false);
  assert.equal(r.numeric_finished_food_limit_auto_applied,false);
 }
});
test("Live helper shows conditional official references without applying them",()=>{
 const ctx=context();
 const id="04-04-2-dried-fungi";
 const r=ledger.records.find(x=>x.catalog_id===id);
 const p={id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs};
 const html=vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(p)+")",ctx);
 assert.match(html,/Current 111-queue source-row crosscheck/);
 assert.match(html,/NOT APPLIED TO THIS FINISHED PRODUCT/);
 assert.match(html,/422 partial source matches \/ 111 pending/);
 assert.doesNotMatch(html,/laboratory PASS achieved|CERTIFIED COMPLIANT/);
 const local=vm.runInContext("pmsvCurrent116ProofChecklistHtml("+JSON.stringify(p)+")",ctx);
 assert.match(local,/Old 116 local checklist/);
});
test("Five already promoted identities never show stale 116-item local pending banners",()=>{
 const ctx=context();
 for(const id of q.promoted_catalog_ids){
  const row=ledger.records.find(x=>x.catalog_id===id);
  const p={id:row.catalog_id,name:row.product_name,fssr:row.fssr,fcs:row.fcs};
  assert.equal(vm.runInContext("pmsvCurrent116ProofChecklistHtml("+JSON.stringify(p)+")",ctx),"");
  const html=vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(p)+")",ctx);
  assert.match(html,/Correct current partial source status/);
  assert.doesNotMatch(html,/Historical review/);
 }
});
test("All numerical reference values fail closed on core table tampering or injected JSON changes",()=>{
 const ctx=context();
 ctx.pmsvLive111ReferenceDb=structuredClone(m);
 ctx.pmsvLive111ReferenceDb.references.find(x=>x.key==="lead-milks").limit=0.2;
 assert.equal(vm.runInContext("pmsvLive111ReferenceValid()",ctx),false);
 const p=ledger.records.find(x=>x.catalog_id==="04-04-2-dried-fungi");
 assert.match(vm.runInContext("pmsvLive111ReferencesHtml("+JSON.stringify({id:p.catalog_id,name:p.product_name,fssr:p.fssr,fcs:p.fcs})+")",ctx),/withheld/);
 ctx.pmsvLive111ReferenceDb=m;
 assert.equal(vm.runInContext("pmsvLive111ReferenceValid()",ctx),true);
 ctx.contaminantsDb=structuredClone(c);
 const lead=ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Canned mushrooms");
 lead.limit=99;
 assert.equal(vm.runInContext("pmsvLive111ReferenceValid()",ctx),false);
});
test("Live extension integrated after canonical 422/111 source ledger",()=>{
 const html=fs.readFileSync(path.join(root,app+"index.html"),"utf8");
 const old=html.indexOf('src="./fssai-first-source-current-422-111.js');
 const newer=html.indexOf('src="./fssai-live-111-official-article-crosswalk.js');
 assert.ok(old>0&&newer>old);
 const yml=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(yml,/fssai-live-111-official-article-crosswalk-2026-10-12\.test\.cjs/);
});

test("Hard-boiled sugar confectionery references all four exact Version IX metal rows without assigning Indian sweet applicability",()=>{
 const ctx=context(), multi=m.references.find(x=>x.key==="Hard boiled sugar confectionery");
 assert.deepEqual(multi.source_rows.map(x=>x.analyte),["Lead","Copper","Arsenic","Tin"]);
 assert.deepEqual(multi.source_rows.map(x=>x.limit),[2,5,1,5]);
 for(const x of multi.source_rows)assert.equal(x.finished_article_applicability_verified,false);
 const row=ledger.records.find(x=>x.catalog_id==="18-18-1-indian-confections");
 const html=vm.runInContext("pmsvLive111ReferencesHtml("+JSON.stringify({id:row.catalog_id,name:row.product_name,fssr:row.fssr,fcs:row.fcs})+")",ctx);
 for(const key of ["Lead","Copper","Arsenic","Tin"])assert.match(html,new RegExp(key));
 assert.match(html,/NOT APPLIED TO THIS FINISHED PRODUCT/);
 ctx.pmsvLive111ReferenceDb=structuredClone(m);
 ctx.pmsvLive111ReferenceDb.references.find(x=>x.key==="Hard boiled sugar confectionery").source_rows[1].limit=99;
 assert.equal(vm.runInContext("pmsvLive111ReferenceValid()",ctx),false);
});
