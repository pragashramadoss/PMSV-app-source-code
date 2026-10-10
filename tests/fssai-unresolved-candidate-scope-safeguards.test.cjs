"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const data=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const index=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const byName=n=>data.records.filter(p=>p.product_name===n);
const candidate=p=>(p.version_ix_named_article_scope_review?.source_article_candidates_review_only||[]).map(x=>x.official_article);
test("All 167 unresolved identities remain unapproved and catalogue-linked after candidate scope review",()=>{
 assert.equal(index.length,533);assert.equal(data.records.length,167);assert.equal(data.pending,167);
 assert.equal(new Set(data.records.map(x=>x.catalog_id)).size,167);
 const ids=new Set(index.map(x=>x.id));
 for(const row of data.records){
  assert.ok(ids.has(row.catalog_id),row.catalog_id);
  assert.equal(row.auto_apply_numeric_limit,false,row.catalog_id);
  assert.equal(row.unconditional_compliance_pass,false,row.catalog_id);
  assert.equal(row.version_ix_named_article_scope_review.exact_identity_source_evidence_claimed,false,row.catalog_id);
  for(const article of row.version_ix_named_article_scope_review.source_article_candidates_review_only)
   assert.equal(article.finished_product_limit_applied,false,row.catalog_id);
 }
 assert.equal(data.records.filter(p=>candidate(p).length>0).length,43);
 assert.equal(data.scope_corrections_2026_10_10.inapplicable_review_only_candidates_removed,42);
});
test("Royal Jelly and stereoisomer-specific tartaric acid no longer inherit misleading lead candidates",()=>{
 for(const name of ["Royal Jelly","Acidity Regulators L(+/-)tartaric Acid"]) {
   assert.equal(byName(name).length,1,name);
   assert.deepEqual(candidate(byName(name)[0]),[],name);
 }
});
test("Dairy fat/derived-product pesticide source matches never imply a generic liquid-milk Lead article",()=>{
 const names=["Cow or Buffalo Colostrum and Colostrum Products","Edible Lactose"];
 for(const name of names){
  const rows=byName(name);assert.equal(rows.length,1,name);
  assert.ok(!candidate(rows[0]).some(x=>x.startsWith("Milks (")),name);
 }
 const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
 const source=db.chapter_2_1_additional_milk_commodity_evidence_v9;
 assert.equal(source.exact_products.length,20);
 assert.equal(source.article,"Milk and Milk products");
 assert.equal(source.auto_assign_numeric_pesticide_mrl,false);
 assert.equal(source.fat_based_residue_caveat_required,true);
 for(const name of ["Anhydrous milk fat","Butter","Butter oil","Cream","Dairy Permeate Powders","Dairy Whitener","Edible Casein Products","Fermented/cultured/sour cream","Malai","Milk fat","Milk Protein Concentrate"]){
  assert.equal(byName(name).length,0,name);
  assert.equal(source.exact_products.filter(x=>x.product_name===name).length,1,name);
 }
});
test("Sugar, infant and juice candidate scopes do not conflate finished forms",()=>{
 const sugars=["Bura Sugar","Cane jaggery or cane gur","Cube Sugar","Dried Glucose Syrup","Golden Syrup","Gur or Jaggery","Icing Sugar","Khandsari Sugar","Misri","Plantation White Sugar"];
 for(const name of sugars){const rows=byName(name);assert.equal(rows.length,1,name);assert.ok(candidate(rows[0]).every(x=>!x.startsWith("Anhydrous dextrose")),name);}
 const juice=["Concentrated Fruit Juice with Preservatives for industrial use only","Concentrated Vegetable Juice with Preservatives for industrial use only","Fruit Juice with Preservatives for Industrial Use only","Thermally Processed Concentrated Vegetable Juice Pulp/ Puree","Vegetable Juice with Preservatives for Industrial Use only"];
 for(const name of juice){const rows=byName(name);assert.equal(rows.length,1,name);assert.ok(candidate(rows[0]).every(x=>x!=="Fruit Juices (including nectars; ready to drink)"),name);}
 for(const row of data.records.filter(x=>x.regulatory_family==="special")) assert.ok(candidate(row).every(x=>x!=="Infant formula (ready to use)"),row.product_name);
 for(const name of ["Arrowroot","Chia Seeds"]){const rows=byName(name);assert.equal(rows.length,1,name);assert.ok(candidate(rows[0]).every(x=>x!=="Cereal and cereal products"),name);}
});
