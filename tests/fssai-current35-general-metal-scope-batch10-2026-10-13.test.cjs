"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=read("fssai-current35-default-metals-and-allfoods-batch10-2026-10-13.json");
const b9=read("fssai-current35-positive-named-ctr-candidate-gates-batch9-2026-10-13.json");
const queue=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const src=fs.readFileSync(path.join(root,"fssai-current35-general-metal-source-batch10-2026-10-13.js"),"utf8");
const product=q=>({id:q.catalog_id,name:q.product_name,fssr:q.fssr,fcs:q.fcs});
function context(data=structuredClone(d)){
 const c={pmsvB9Data:b9,pmsv35Queue:queue,pmsv498Ledger:ledger,
 pmsvB9Valid:()=>true,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"<span>previous source evidence</span>"};
 vm.createContext(c);vm.runInContext(src,c);c.pmsvB10Data=data;return c;
}
test("245 official current metal-scope gates are exact IDs from the 533 product 498/35 ledger",()=>{
 const c=context();assert.equal(c.pmsvB10Valid(),true);
 assert.equal(ledger.catalogue,533);assert.equal(ledger.partial_exact,498);
 assert.equal(ledger.first_source_pending,35);assert.equal(queue.review_records.length,35);
 assert.equal(d.product_checks.length,35);assert.equal(d.rule_count,7);
 assert.equal(d.case_rule_checks_total,245);
 assert.deepEqual(d.product_checks.map(x=>x.catalog_id),queue.review_records.map(x=>x.catalog_id));
 assert.deepEqual(new Set(d.product_checks.map(x=>x.catalog_id)),
  new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id)));
 for(const p of d.product_checks){
   assert.equal(p.rule_checks.length,7);
   assert.equal(p.source_status,"FIRST_EXACT_SOURCE_PENDING");
   assert.equal(p.full_regulatory_compliance_approval,false);
 }
});
test("six metal-specific generic defaults and the all-food methylmercury entry are not confused",()=>{
 const expected=[
  ["PB_DEFAULT","Lead","Foods not specified",2.5,3],
  ["CU_DEFAULT","Copper","Foods not specified",30,6],
  ["AS_DEFAULT","Arsenic","Foods not specified",1.1,8],
  ["SN_DEFAULT","Tin","Foods not specified",250,10],
  ["CD_DEFAULT","Cadmium","Foods not specified",1.5,11],
  ["HG_DEFAULT","Mercury","Foods not specified",1,11],
  ["MEHG_ALL","Methyl Mercury (calculated as the element)","All foods",0.25,11]
 ];
 assert.equal(d.official_rule_rows.length,7);
 for(let i=0;i<7;i++){
  const r=d.official_rule_rows[i],row=expected[i];
  assert.equal(r.id,row[0]);assert.equal(r.metal,row[1]);
  assert.equal(r.legal_article,row[2]);assert.equal(r.published_reference_value,row[3]);
  assert.equal(r.pdf_page_zero_based,row[4]);assert.equal(r.unit,"mg/kg");
  assert.equal(r.scope_type,i===6?"EXPLICIT_ALL_FOODS_ARTICLE":"METAL_SPECIFIC_DEFAULT_AFTER_EXACT_ROW_CHECK");
  assert.equal(r.official_primary_source,d.ctr_primary_source);
  assert.equal(r.numeric_finished_product_limit_automatically_assigned,false);
 }
});
test("every current product displays seven reference-only rows with clear legal gate warnings",()=>{
 const c=context();let rendered=0,rows=0;
 for(const q of queue.review_records){
  const h=c.pmsvB10Html(product(q));
  assert.match(h,/Batch 10/);
  assert.match(h,/Named finished-product article still pending/);
  assert.match(h,/not approved limits or completed sample tests/);
  assert.equal((h.match(/<tr>/g)||[]).length,8);
  assert.match(h,/Express all-foods article; no finished lot result or complete PASS/);
  rows+=7;rendered++;
  assert.match(c.sourcePinned121ResearchProofHtml(product(q)),/previous source evidence/);
 }
 assert.equal(rendered,35);assert.equal(rows,245);
 assert.equal(c.pmsvB10Html({id:"not-in-queue",name:"Else",fssr:"",fcs:""}),"");
});
test("all three prior exact conditional route identifiers are conserved unchanged",()=>{
 let candidates=0;
 for(let i=0;i<35;i++){
  const x=d.product_checks[i],r=b9.cases[i];
  assert.deepEqual(x.pending_named_ctr_routes,r.targeted_candidate_routes);
  candidates+=x.pending_named_ctr_routes.length;
  for(const v of x.rule_checks){
   assert.equal(v.limit_active_as_product_threshold,false);
   assert.equal(v.named_finished_product_match_approved,false);
   assert.equal(v.finished_lot_lab_pass,false);
   assert.equal(v.no_specific_competing_article_confirmed,false);
  }
 }
 assert.equal(candidates,3);
 assert.equal(d.first_source_promotions,0);
 assert.equal(d.full_contaminant_panels_cleared,0);
 assert.equal(d.automated_numeric_limit_assignments,0);
 assert.equal(d.sample_lot_lab_passes,0);
 assert.equal(d.finished_food_compliance_approvals,0);
 assert.equal(d.original_ledger_mutated,false);
});
test("altered numerical thresholds, article identities, source, date and sample approval fail closed",()=>{
 const mutations={
  lead:x=>x.official_rule_rows[0].published_reference_value=3.5,
  methylHg:x=>x.official_rule_rows[6].published_reference_value=1,
  article:x=>x.official_rule_rows[0].legal_article="Other foods",
  product:x=>x.product_checks[0].catalog_id="WRONG",
  assigned:x=>x.product_checks[0].rule_checks[0].limit_active_as_product_threshold=true,
  approved:x=>x.finished_food_compliance_approvals=1,
  source:x=>x.ctr_primary_source="https://another.example",
  effective:x=>x.future_commencement="2026-10-13",
  gate:x=>x.product_checks[0].rule_checks.pop(),
  competing:x=>x.product_checks[0].rule_checks[0].no_specific_competing_article_confirmed=true
 };
 for(const [name,mutate] of Object.entries(mutations)){
   const x=structuredClone(d);mutate(x);
   const c=context(x);
   assert.equal(c.pmsvB10Valid(),false,name);
   assert.match(c.pmsvB10Html(product(queue.review_records[0])),/coverage check unavailable/);
 }
});
test("Batch10 is loaded after Batch9, before nutrition, exactly once",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const name="fssai-current35-general-metal-source-batch10-2026-10-13.js";
 assert.ok(h.indexOf(name)>h.indexOf("fssai-current35-positive-source-gates-batch9-2026-10-13.js"));
 assert.ok(h.indexOf(name)<h.indexOf("fssai-nutrition-v476.js"));
 assert.equal(h.split(name).length-1,1);
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
 new vm.Script(src);
});
