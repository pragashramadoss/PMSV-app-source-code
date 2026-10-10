"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const proof=load("fssai-product-helper-preview-01/data/rules/fssai-25-beverage-confectionery-fungi-v9-source-evidence-2026-10-10.json");
const live=load("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const master=load("fssai-product-helper-preview-01/data/standard-search-index-v1.json");
const core=load("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const before=load("fssai-product-helper-preview-01/data/rules/fssai-26-cross-family-condition-review-2026-10-10.json");
const later=load("fssai-product-helper-preview-01/data/rules/fssai-next10-exact-source-candidate-2026-10-10.json");
const laterIds=new Set(later.matched.map(x=>x.catalog_id));
assert.equal(master.products.length,533);
assert.equal(proof.matched.length,10);
assert.equal(proof.conditional_review_only.length,15);
assert.equal(proof.total_reviewed,25);
assert.equal(proof.verified_identity_article_matches,10);
assert.equal(proof.full_product_compliance_passes,0);
assert.equal(live.records.length,126);
assert.equal(live.count,126);
assert.equal(live.pending,126);
assert.equal(new Set(live.records.map(x=>x.catalog_id)).size,126);
assert.equal(live.current_snapshot_summary_2026_10_10.exact_partial_evidence,407);
const pending=new Set(live.records.map(x=>x.catalog_id));
const index=new Map(master.products.map(x=>[x.id,x]));
const matched=new Set();
for(const row of proof.matched){
 const p=index.get(row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs);
 assert.equal(row.official_contaminants_source,proof.official_contaminants_source);
 assert.equal(row.source_row_verified,true);
 assert.equal(row.finished_food_compliance_pass,false);
 assert.equal(row.complete_contaminant_panel_verified,false);
 assert.equal(row.auto_apply_numeric_finished_food_limit,false);
 assert.ok(!pending.has(row.catalog_id),"Source matched row still unresolved "+row.catalog_id);
 assert.ok(!matched.has(row.catalog_id));
 matched.add(row.catalog_id);
 const expected=row.source_group==="saffrole"
  ? {article:"Non-alcoholic beverages",limit:10,unit:"ppm",fssr:/^2\.3\./,fcs:/^14\.1\.4\./}
  : {article:"Confectionery",limit:5,unit:"ppm",fssr:/^2\.7\./,fcs:/^(05\.1\.3|05\.3)$/};
 assert.equal(row.article,expected.article);
 assert.equal(row.limit,expected.limit);
 assert.equal(row.unit,expected.unit);
 assert.match(p.fssr,expected.fssr);
 assert.match(p.fcs,expected.fcs);
 assert.equal((core.naturally_occurring_toxic_substances[row.source_group]||[])
   .filter(x=>x.article===expected.article&&x.limit===expected.limit&&x.unit===expected.unit).length,1);
}
assert.equal(matched.size,10);
const conditional=new Set();
for(const row of proof.conditional_review_only){
 const p=index.get(row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs);
 if(!pending.has(p.id)){
  const matchedLater=later.matched.find(x=>x.catalog_id===p.id);
  assert.ok(matchedLater&&matchedLater.article_group==="finished_frozen_confection_lead",
    "Historical review-only product without current evidence: "+p.id);
  assert.equal(matchedLater.finished_product_numeric_pass,false);
  assert.equal(matchedLater.source_article_fully_applicable_to_all_forms_or_recipes,false);
  assert.equal(matchedLater.current_amendments_fully_reconciled,false);
}
 assert.equal(row.source_match_to_specific_finished_product_confirmed,false);
 assert.equal(row.compliance_pass,false);
 assert.equal(row.auto_apply_numeric_limit,false);
 assert.ok(!matched.has(p.id)&&!conditional.has(p.id));
 conditional.add(p.id);
}
assert.equal(conditional.size,15);
assert.equal(proof.conditional_review_only.filter(x=>pending.has(x.catalog_id)).length,13);
assert.equal(proof.conditional_review_only.filter(x=>laterIds.has(x.catalog_id)).length,2);
for(const id of proof.excluded_inheritance)assert.ok(!matched.has(id));
assert.equal(before.count,26);
assert.equal(before.records.filter(x=>pending.has(x.catalog_id)).length,22);
assert.equal(before.records.filter(x=>matched.has(x.catalog_id)).length,2);
console.log("PASS: 10 exact family articles + 15 conditional scope reviews; 126 unresolved / 407 partial / zero compliance passes");

const vm=require("node:vm");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const start=html.indexOf("function sourcePinnedBeverageConfectioneryNotsHtml(p){");
const end=html.indexOf("function sourcePinnedCompositeOrSoupPartialHtml(p){",start);
assert.ok(start>=0&&end>start,"Helper must contain new NOTS source-locked display");
const ctx=vm.createContext({contaminantsDb:structuredClone(core),crossFamilyNOTSDb:structuredClone(proof),esc:x=>String(x)});
vm.runInContext(html.slice(start,end),ctx);
const display=id=>vm.runInContext("sourcePinnedBeverageConfectioneryNotsHtml("+JSON.stringify(index.get(id))+")",ctx);
for(const row of proof.matched){
  const shown=display(row.catalog_id);
  assert.ok(shown.includes(row.contaminant),"Missing matched source parameter: "+row.catalog_id);
  assert.ok(shown.includes("No compliance PASS"));
  assert.ok(shown.includes("NOT APPLIED"));
}
for(const id of proof.excluded_inheritance)assert.equal(display(id),"","Inherited excluded NOTS identity "+id);
const preserved=structuredClone(proof);
ctx.crossFamilyNOTSDb.matched[0].limit=1000;
assert.ok(display(proof.matched[0].catalog_id).includes("withheld"),"Modified source candidate must be blocked");
ctx.crossFamilyNOTSDb=preserved;
ctx.contaminantsDb.naturally_occurring_toxic_substances.saffrole.find(x=>x.article==="Non-alcoholic beverages").limit=1000;
assert.ok(display(proof.matched[0].catalog_id).includes("withheld"),"Modified loaded official source table must be blocked");
assert.ok(html.includes("contaminants-v9-unresolved-264-review-v1.json?v=20261010-full136-126"));
console.log("PASS: Helper gates reject wrong identity, modified candidate and modified master NOTS source; no sample PASS");
