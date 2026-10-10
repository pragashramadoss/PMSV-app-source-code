#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const manifest=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-5-meat-eggs-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const byId=new Map(catalogue.map(p=>[p.id,p]));
test("All 156 current identities have exactly one of the three separately-audited source scope reviews",()=>{
 assert.equal(manifest.pending,156);assert.equal(manifest.records.length,156);
 assert.equal(manifest.verified_evidence_added,108);assert.equal(manifest.full_compliance_achieved,0);
 assert.equal(manifest.last_unresolved_families_source_scope_review_summary_2026_10_10.reviewed,17);
 const groups={chapter_2_3:0,previous_81:0,final_17:0};
 for(const row of manifest.records){
  const p=byId.get(row.catalog_id);assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr,row.catalog_id);
  const a=row.chapter_2_3_targeted_evidence_review_2026_10_10;
  const b=row.next_family_subtype_review_2026_10_10;
  const c=row.last_unresolved_families_source_scope_review_2026_10_10;
  assert.equal([!!a,!!b,!!c].filter(Boolean).length,1,row.catalog_id);
  if(a)groups.chapter_2_3++;
  if(b)groups.previous_81++;
  if(c)groups.final_17++;
  assert.equal(row.unconditional_compliance_pass,false);
  assert.equal(row.auto_apply_numeric_limit,false);
 }
 assert.deepEqual(groups,{chapter_2_3:61,previous_81:78,final_17:17});
});
test("The standalone machine-readable source-matrix reconciliation regenerates 156 exact identities without compliance results",()=>{
 cp.execFileSync(process.execPath,["scripts/audit-all-161-pending-source-matrix-gates.cjs"],{cwd:root,stdio:"pipe"});
 const doc=read("audit-output/fssai-156-detailed-source-applicability-reconciliation.json");
 assert.equal(doc.products_total,533);assert.equal(doc.partial_exact_evidence,377);
 assert.equal(doc.pending_exact_source_evidence,156);
 assert.equal(doc.checkpoints.length,156);
 assert.deepEqual(doc.disposition_buckets,{chapter_2_3:61,previous_81:78,final_17:17});
 assert.equal(doc.conditional_source_references_not_applied,3);
 assert.equal(doc.exact_regulatory_route_mismatches_requiring_resolution,1);
 assert.equal(doc.legal_compliance_passes_claimed,0);
 assert.ok(doc.checkpoints.every(p=>!p.applied_numeric_limit&&!p.product_compliance_pass&&!p.pesticide_mrl_panel_complete));
});
test("Dates and fresh/frozen rabbit meat show conditional pesticide source references only; no automatic product MRL",()=>{
 const ids=["04-04-1-dates","08-08-1-fresh-or-chilled-rabbit-meat","08-08-2-frozen-rabbit-meat"];
 const refs=manifest.records.filter(x=>ids.includes(x.catalog_id));
 assert.equal(refs.length,3);
 const a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
 assert.ok(a>0&&b>a);
 const ctx=vm.createContext({contaminantsPendingReviewDb:manifest,esc:String});
 vm.runInContext(html.slice(a,b),ctx);
 for(const item of refs){
  const q=item.specific_source_commodity_subtype_review_2026_10_10;
  assert.equal(q.automatically_applied,false);
  assert.equal(q.review_only,true);
  const str=vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(byId.get(item.catalog_id))+")",ctx);
  assert.match(str,/NOT APPLIED/);
  assert.match(str,/conditional, NOT APPLIED/);
  assert.match(str,new RegExp(q.pesticide));
 }
 for(const p of manifest.records.filter(x=>x.last_unresolved_families_source_scope_review_2026_10_10)){
  const content=vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(byId.get(p.catalog_id))+")",ctx);
  assert.match(content,/Further source-specific product safeguards/);
  assert.match(content,/Excluded inference/);
 }
 const cereal=byId.get("06-06-3-fruit-vegetable-cereal-flakes");
 assert.match(vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(cereal)+")",ctx),/2\.3\.20/);
 assert.match(vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(cereal)+")",ctx),/Do not infer cereal-based contaminant compliance/);
});
test("Frozen and liquid egg standards show exact chemical quality maxima, not pesticide MRLs",()=>{
 const a=html.indexOf("function exactEggStandardChemicalCriteriaHtml(p){"),b=html.indexOf("function pendingContaminantReviewNotice(p){",a);
 assert.ok(a>=0&&b>a);
 const ctx=vm.createContext({chapterRuleDbs:[structuredClone(chapter)],esc:String});
 vm.runInContext(html.slice(a,b),ctx);
 const view=p=>vm.runInContext("exactEggStandardChemicalCriteriaHtml("+JSON.stringify(p)+")",ctx);
 for(const id of ["10-10-2-frozen-egg-products","10-10-2-liquid-egg-products"]){
  const p=byId.get(id),v=view(p);
  assert.match(v,/Beta-hydroxybutyric acid/);
  assert.match(v,/10 mg\/kg/);
  assert.match(v,/1000 mg\/kg/);
  assert.match(v,/25 mg\/kg/);
  assert.match(v,/Not pesticide MRLs/);
  assert.match(v,/not.*FSSAI Version IX commodity pesticide MRLs/);
 }
 assert.equal(view(byId.get("10-10-2-egg-powder")),"");
 assert.equal(view(byId.get("10-10-3-pickled-eggs")),"");
 const tampered=structuredClone(chapter);
 tampered.standards.find(x=>x.key==="2.5.3(2)").common_composition.find(x=>x.parameter==="Lactic acid").value=2000;
 ctx.chapterRuleDbs=[tampered];
 assert.match(view(byId.get("10-10-2-frozen-egg-products")),/Withhold numbers/);
 assert.match(view(byId.get("10-10-2-liquid-egg-products")),/10 mg\/kg/);
});
test("Current 156-item review loader uses immutable identity/count conservation, not historical 228 condition",()=>{
 assert.ok(html.includes("data.verified_evidence_added+269+data.pending!==533"));
 assert.ok(html.includes("ids.size!==data.count"));
 assert.ok(!html.includes("data.count!==228"));
 assert.ok(html.includes("source_specific")||html.includes("last_unresolved_families_source_scope_review_2026_10_10"));
});
