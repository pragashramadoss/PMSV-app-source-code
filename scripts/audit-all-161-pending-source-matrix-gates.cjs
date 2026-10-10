#!/usr/bin/env node
"use strict";
/**
 * PMSV exact-evidence applicability audit.
 * A regulatory check is a documented source/matrix gate, NEVER an automatic
 * finished-product clearance, no-applicable-limit decision or lab test.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const catalog=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const byId=new Map(catalog.map(x=>[x.id,x]));
assert.equal(catalog.length,533);
assert.equal(m.records.length,157);assert.equal(m.count,157);assert.equal(m.pending,157);
assert.equal(m.verified_evidence_added,107);assert.equal(m.full_compliance_achieved,0);
assert.equal(new Set(m.records.map(x=>x.catalog_id)).size,157);
const groups={chapter_2_3:0,previous_81:0,final_17:0},families={},checkpoints=[];
const currentDate="2026-10-10";
for(const item of m.records){
 const p=byId.get(item.catalog_id);
 assert.ok(p,"Unrecognised catalogue identity "+item.catalog_id);
 assert.equal(item.product_name,p.name,item.catalog_id);
 assert.equal(item.fssr,p.fssr,item.catalog_id);
 assert.equal(item.auto_apply_numeric_limit,false,item.catalog_id);
 assert.equal(item.unconditional_compliance_pass,false,item.catalog_id);
 assert.equal(item.exemption_asserted,false,item.catalog_id);
 const a=item.chapter_2_3_targeted_evidence_review_2026_10_10;
 const b=item.next_family_subtype_review_2026_10_10;
 const c=item.last_unresolved_families_source_scope_review_2026_10_10;
 const active=[!!a,!!b,!!c].filter(Boolean).length;
 assert.equal(active,1,"Exactly one detailed review must match "+item.catalog_id);
 let detail,kind;
 if(a){
  kind="chapter_2_3";detail=a;
  assert.equal(item.regulatory_family,"2.3");
  assert.equal(a.numeric_limit_auto_applied,false);
  assert.equal(a.legal_compliance_pass,false);
  assert.equal(a.source_article_unconditionally_confirmed,false);
  assert.ok(a.product_specific_gate.length>30&&a.nontransferable_lookalike_article.length>30);
  assert.match(a.source_urls.official_version_ix_contaminants,/fssai\.gov\.in/);
 }else if(b){
  kind="previous_81";detail=b;
  assert.equal(b.named_article_applied_to_finished_product,false);
  assert.equal(b.numeric_limit_auto_applied,false);
  assert.equal(b.legal_compliance_pass,false);
  assert.ok(b.first_required_verification.length>20&&b.specific_prohibited_inheritance.length>20);
  assert.match(b.source_regulatory_standard_url,/fssai\.gov\.in/);
 }else{
  kind="final_17";detail=c;
  assert.equal(c.auto_apply_numeric_limit,false);
  assert.equal(c.full_compliance_granted,false);
  assert.equal(c.product_specific_metal_pesticide_vet_panel_complete,false);
  assert.ok(c.requires_check.length>20&&c.prohibited_lookalike_inheritance.length>25);
  assert.match(c.official_standard_source_url,/fssai\.gov\.in/);
 }
 assert.equal(detail.catalog_id,p.id);
 assert.equal(detail.product_name,p.name);
 assert.equal(detail.fssr,p.fssr);
 groups[kind]++;
 families[item.regulatory_family]=(families[item.regulatory_family]||0)+1;
 const special=item.specific_source_commodity_subtype_review_2026_10_10;
 if(special){
  assert.ok(["04-04-1-dates","08-08-1-fresh-or-chilled-rabbit-meat","08-08-2-frozen-rabbit-meat"].includes(p.id));
  assert.equal(special.review_only,true);assert.equal(special.automatically_applied,false);
  assert.equal(special.intentionally_retains_pending_status,true);
  assert.equal(special.product_specific_complete_panel,false);
  assert.ok(special.condition.length>80);
  if(p.id==="04-04-1-dates"){
   assert.equal(p.fssr,"2.3.47(4)");assert.equal(special.source_article,"Dried fruits");
   assert.equal(special.pesticide,"Malathion");assert.equal(special.source_mrl,8);
   assert.equal(special.unit,"mg/kg");
  }else{
   assert.equal(p.fssr,"2.5.2(6)");
   assert.equal(special.species,"Oryctolagus cuniculus");
   assert.equal(special.source_article,"Meat and Meat products");
   assert.equal(special.pesticide,"Imidacloprid");
   assert.equal(special.source_mrl,0.1);assert.equal(special.unit,"mg/kg");
  }
 }
 const mismatch=item.cross_chapter_identical_product_name_discrepancy_2026_10_10;
 if(mismatch){
  assert.equal(p.id,"06-06-3-fruit-vegetable-cereal-flakes");
  assert.equal(mismatch.current_catalogue_fssr,"2.4.35");
  assert.equal(mismatch.source_exact_standard_fssr,"2.3.20");
  assert.equal(mismatch.numeric_rule_from_2_4_35_to_be_withheld_until_product_recipe_confirmation,true);
  assert.equal(mismatch.authorizes_new_compliance_pass,false);
 }
 checkpoints.push({
  catalog_id:p.id,product_name:p.name,fssr:p.fssr,fcs:p.fcs,
  family:item.regulatory_family,review_kind:kind,
  subcategory_or_matrix:detail.review_bucket||detail.review_type||detail.identity_scope,
  source_identity_review_complete:true,
  full_contaminant_review_complete:false,
  pesticide_mrl_panel_complete:false,
  source_amendments_reconciled:false,
  applied_numeric_limit:false,
  product_compliance_pass:false,
  conditional_commodity_reference:special?{
   pesticide:special.pesticide,article:special.source_article,reference:special.source_mrl,
   unit:special.unit,applied:false}:null,
  unresolved_exact_fssr_clash:!!mismatch
 });
}
assert.deepEqual(groups,{chapter_2_3:61,previous_81:79,final_17:17});
assert.equal(Object.values(families).reduce((a,b)=>a+b,0),157);
assert.equal(checkpoints.filter(x=>x.conditional_commodity_reference).length,3);
assert.equal(checkpoints.filter(x=>x.unresolved_exact_fssr_clash).length,1);
const result={
 schema_version:"1.0",as_of:currentDate,products_total:533,
 partial_exact_evidence:376,pending_exact_source_evidence:157,
 documented_detailed_source_identity_applicability_reviews:157,
 disposition_buckets:groups,regulatory_families:families,
 source_qualifications_not_numeric_approvals:true,
 exact_regulatory_route_mismatches_requiring_resolution:1,
 conditional_source_references_not_applied:3,
 legal_compliance_passes_claimed:0,
 warning:"Scope review evidence does not establish safety, source amendment completeness or laboratory compliance. Official source and ingredient recipe must be confirmed before applying numerical limits.",
 checkpoints
};
const out=path.join(root,"audit-output");
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"fssai-157-detailed-source-applicability-reconciliation.json"),JSON.stringify(result,null,2)+"\n");
console.log("PASS: all 157 pending products have exclusive detailed identity+matrix gates (61+79+17); 3 conditional numeric commodity references NOT APPLIED; one cross-chapter product discrepancy flagged; 0 compliance approvals.");
