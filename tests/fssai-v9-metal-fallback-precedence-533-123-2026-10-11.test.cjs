"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const matrix=read("fssai-product-helper-preview-01/data/rules/fssai-v9-metal-fallback-precedence-2026-10-11.json"),core=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const report=read("audit-output/fssai-v9-all-533-methylmercury-and-121-fallback-source-review.json");
const keys={Lead:2.5,Copper:30,Arsenic:1.1,Tin:250,Cadmium:1.5,Mercury:1};
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
test("Six FSSAI Version IX fallback metal source rows are exactly recorded and not applied",()=>{
 assert.equal(matrix.source,"https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf");
 assert.equal(matrix.rows.length,7);
 for(const [metal,limit] of Object.entries(keys)){
  const row=matrix.rows.find(x=>x.metal===metal);
  assert.ok(row);assert.equal(row.limit,limit);assert.equal(row.row_type,"default");assert.equal(row.article,"Foods not specified");
  assert.equal(row.unit,"mg/kg");assert.equal(row.numeric_finished_product_compliance_auto_apply,false);
  const found=(core.metal_article_rules_v9[metal]||[]).filter(x=>x.row_type==="default"&&norm(x.article)==="foods not specified"&&x.limit===limit&&x.unit==="mg/kg");
  assert.equal(found.length,1,metal+" is not pinned to current source");
 }
});
test("Methyl Mercury is explicitly separate from total Mercury and is the all-foods rule",()=>{
 const row=matrix.rows.find(x=>x.id==="METHYLMERCURY_ALL_FOODS");
 assert.ok(row);
 assert.deepEqual([row.metal,row.article,row.limit,row.unit,row.row_type],["Methyl Mercury","All foods",0.25,"mg/kg","all_foods"]);
 const loaded=core.metal_article_rules_v9["Methyl Mercury"].filter(x=>x.row_type==="all_foods"&&norm(x.article)==="all foods");
 assert.equal(loaded.length,1);
 assert.equal(loaded[0].limit,0.25);
 assert.equal(loaded[0].unit,"mg/kg");
 assert.equal(matrix.methyl_mercury_requires_speciated_measurement_not_total_mercury,true);
 assert.equal(matrix.all_food_article_not_counted_as_exact_product_named_article,true);
});
test("All 533 and the exact 121 unresolved receive separate fail-closed source priority cases",()=>{
 assert.deepEqual([report.total_products,report.partial_exact_product_evidence,report.pending_exact_product_evidence,report.final_laboratory_compliance_passes],[533,412,121,0]);
 assert.equal(report.records.length,533);
 assert.equal(new Set(report.records.map(x=>x.catalog_id)).size,533);
 assert.equal(report.fallback_metal_article_review_checks,726);
 assert.equal(report.universal_all_foods_source_coverage,533);
 assert.equal(report.records.filter(x=>x.unresolved_first_exact_product_article).length,121);
 for(const x of report.records){
  assert.equal(x.methyl_mercury_source.contaminant,"Methyl Mercury");
  assert.equal(x.methyl_mercury_source.limit_mgkg,0.25);
  assert.equal(x.methyl_mercury_source.duplicate_total_mercury_compliance_asserted,false);
  assert.equal(x.methyl_mercury_source.sample_compliance_evaluated,false);
  assert.equal(x.fallback_review.length,x.unresolved_first_exact_product_article?6:0);
  for(const y of x.fallback_review){
   assert.equal(y.more_specific_named_article_hierarchy_resolved,false);
   assert.equal(y.automatically_applicable,false);
   assert.equal(y.counts_as_product_specific_exact_source,false);
   assert.equal(y.compliance_pass,false);
  }
  assert.equal(x.full_product_compliance_pass,false);
 }
});
