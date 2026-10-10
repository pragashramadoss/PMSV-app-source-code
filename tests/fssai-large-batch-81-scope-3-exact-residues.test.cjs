#!/usr/bin/env node
"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const manifest=read(base+"rules/contaminants-v9-unresolved-264-review-v1.json");
const catalog=read(base+"standard-search-index-v1.json").products;
const chapter29=read(base+"rules/chapter-2-9-salt-spices-condiments-v1.json");
const oleoresin=read(base+"rules/spice-oleoresin-2-9-32-residual-solvents-evidence-v1.json");
const goat=read(base+"rules/goat-muscle-veterinary-v9-exact-evidence-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const byId=new Map(catalog.map(x=>[x.id,x]));
const exactIds=[oleoresin.catalog_id,...goat.product_ids];
test("78 currently unresolved of original 81 source-gated identities, 42 differentiated types, no numeric product PASS",()=>{
 assert.equal(catalog.length,533);
 assert.equal(manifest.records.length,156);
 assert.equal(manifest.count,156);assert.equal(manifest.pending,156);
 assert.equal(manifest.verified_evidence_added,108);assert.equal(manifest.full_compliance_achieved,0);
 assert.equal(manifest.current_snapshot_summary_2026_10_10.exact_partial_evidence,377);
 const wanted={special:36,"2.1":14,"2.4":13,"2.8":11,"2.5":7};
 assert.deepEqual(manifest.next_family_subtype_review_summary_2026_10_10.by_family,wanted);
 const focus=manifest.records.filter(x=>x.next_family_subtype_review_2026_10_10);
 assert.equal(focus.length,78);
 const types=new Set();
 for(const record of focus){
   const data=record.next_family_subtype_review_2026_10_10,product=byId.get(record.catalog_id);
   assert.ok(product&&product.name===record.product_name&&product.fssr===record.fssr,record.catalog_id);
   assert.equal(data.catalog_id,product.id);
   assert.equal(data.product_name,product.name);assert.equal(data.fssr,product.fssr);
   assert.equal(data.named_article_applied_to_finished_product,false);
   assert.equal(data.numeric_limit_auto_applied,false);
   assert.equal(data.source_has_full_contaminant_coverage,false);
   assert.equal(data.pesticide_processing_factor_and_mrl_panel_verified,false);
   assert.equal(data.legal_compliance_pass,false);
   assert.ok(data.first_required_verification.length>=40&&data.specific_prohibited_inheritance.length>=35);
   assert.match(data.source_regulatory_standard_url,/^https:\/\/(?:www\.)?(?:fssai\.gov\.in|foscos\.fssai\.gov\.in)\//);
   types.add(data.review_type);
 }
 assert.equal(types.size,41);
 for(const id of exactIds)assert.ok(!manifest.records.some(x=>x.catalog_id===id),"Verified exact partial still in no-evidence queue "+id);
});
test("Spice Oleoresin processing solvent rows are exactly the official named FSSR standard, including 3 GMP-only solvents",()=>{
 const p=byId.get(oleoresin.catalog_id),standard=chapter29.standards.find(s=>s.key==="2.9.32");
 assert.equal(p.name,"SPICE OLEORESINS");assert.equal(p.fssr,"2.9.32");
 assert.equal(oleoresin.product_name,p.name);assert.equal(oleoresin.fssr,p.fssr);
 assert.equal(standard.name,"Spice Oleoresins");
 assert.deepEqual(oleoresin.residual_solvents_ppm,standard.solvent_residual_limits_ppm);
 assert.equal(Object.keys(oleoresin.residual_solvents_ppm).length,13);
 assert.equal(Object.values(oleoresin.residual_solvents_ppm).filter(x=>typeof x==="number").length,10);
 assert.equal(Object.values(oleoresin.residual_solvents_ppm).filter(x=>x==="GMP").length,3);
 assert.equal(oleoresin.all_contaminants_toxins_and_pesticides_verified,false);
});
test("Fresh/frozen goat-muscle partial evidence is species/tissue specific, never rabbit, sheep, egg or animal casing",()=>{
 assert.deepEqual(goat.product_ids,["08-08-1-fresh-or-chilled-chevon-or-goat-meat","08-08-2-frozen-chevon-or-goat-meat"]);
 const expected={Monensin:0.01,Neomycin:0.5,"Febantel/Fenbendazole/Oxyfendazole":0.1};
 assert.equal(goat.reference_rows.length,3);
 for(const id of goat.product_ids){
   const p=byId.get(id);assert.ok(p);assert.equal(p.fssr,goat.product_standard);
   assert.match(p.name,/Goat Meat/);
 }
 for(const row of goat.reference_rows){
   assert.equal(row.commodity,"Goat — Muscle");
   assert.equal(row.max,expected[row.drug]);assert.equal(row.unit,"mg/kg");
 }
 for(const id of ["08-08-1-fresh-or-chilled-rabbit-meat","08-08-2-frozen-rabbit-meat","08-08-4-animal-casings"]){
   assert.ok(!goat.product_ids.includes(id));
   assert.ok(manifest.records.some(x=>x.catalog_id===id));
 }
});
test("Helper displays the correct new partial-source panels, fail-closed source mismatch, and does not require 228 stale pending records",()=>{
 assert.ok(html.includes("data.verified_evidence_added+269+data.pending!==533"));
 assert.ok(!html.includes("data.count!==228"));
 assert.ok(html.includes("next_family_subtype_review_2026_10_10"));
 const a=html.indexOf("function exactSupplementalResidueReviewHtml(p){"),b=html.indexOf("function pendingContaminantReviewNotice(p){",a);
 assert.ok(a>0&&b>a);
 const ctx=vm.createContext({spiceOleoresinResiduesDb:structuredClone(oleoresin),
   goatMuscleVeterinaryResiduesDb:structuredClone(goat),esc:x=>String(x)});
 vm.runInContext(html.slice(a,b),ctx);
 const view=p=>vm.runInContext("exactSupplementalResidueReviewHtml("+JSON.stringify(p)+")",ctx);
 assert.match(view(byId.get(oleoresin.catalog_id)),/30 ppm/);
 assert.match(view(byId.get(oleoresin.catalog_id)),/GMP/);
 assert.match(view(byId.get(goat.product_ids[0])),/Neomycin/);
 assert.match(view(byId.get(goat.product_ids[1])),/Monensin/);
 assert.equal(view(byId.get("08-08-2-frozen-rabbit-meat")),"");
 const v=structuredClone(oleoresin);v.residual_solvents_ppm.acetone=300;ctx.spiceOleoresinResiduesDb=v;
 assert.match(view(byId.get(oleoresin.catalog_id)),/evidence unavailable or altered/i);
 const vg=structuredClone(goat);vg.reference_rows[0].max=2;ctx.goatMuscleVeterinaryResiduesDb=vg;
 assert.match(view(byId.get(goat.product_ids[0])),/integrity mismatch/i);
});
test("Audited official partial status agrees for all three promoted catalog identities",()=>{
 const audit=read("audit-output/fssai-product-readiness-audit.json");
 const status=new Map(audit.products.map(p=>[p.id,p.contaminant_evidence_index]));
 for(const id of exactIds){
   assert.equal(status.get(id).status,"some_exact_product_evidence_not_full_coverage",id);
 }
 assert.equal(status.get(oleoresin.catalog_id).exact_spice_oleoresin_solvent_residues.complete_contaminants_review,false);
 for(const id of goat.product_ids)assert.equal(status.get(id).exact_goat_muscle_veterinary_drugs.complete_veterinary_and_pesticide_panel,false);
 assert.equal(audit.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,377);
});
