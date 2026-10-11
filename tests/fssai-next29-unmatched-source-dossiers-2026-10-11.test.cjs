"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const d=read("fssai-product-helper-preview-01/data/rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json");
const prior=read("fssai-product-helper-preview-01/data/rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const products=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
test("Exactly 29 named products have individual no-safe-article research dossiers",()=>{
 assert.deepEqual([d.catalogue,d.partial_exact,d.pending_exact,d.unmatched,d.exact_promotions,d.finished_food_compliance_passes],[533,412,121,29,0,0]);
 const expect=new Set(prior.records.filter(r=>r.named_article_references_review_only.length===0).map(r=>r.catalog_id));
 assert.equal(d.records.length,29);assert.equal(expect.size,29);
 assert.deepEqual(new Set(d.records.map(r=>r.catalog_id)),expect);
 const cat=new Map(products.map(p=>[p.id,p]));
 for(const r of d.records){
  const p=cat.get(r.catalog_id);assert.ok(p,r.catalog_id);
  assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);assert.equal(r.fcs,p.fcs);
  assert.ok(r.risk_of_wrong_article_transfer.length>=40);
  assert.ok(r.positive_regulatory_source_evidence_to_obtain.length>=40);
  assert.equal(r.candidate_article_currently_safely_identified,false);
  assert.equal(r.number_auto_applied,false);assert.equal(r.compliance_pass,false);
  assert.equal(r.status,"IDENTITY_AND_ARTICLE_PROOF_UNRESOLVED");
 }
});
test("False equivalences for product grade, species and special formulations remain blocked",()=>{
 const get=id=>d.records.find(r=>r.catalog_id===id);
 const cases=[["06-06-2-carob-powder",/cocoa/i],["100-100-pan-masala",/arecanut/i],
 ["100-100-royal-jelly",/honey/i],["100-100-silver-leaf-chandi-ka-warq",/purity/i],
 ["12-12-1-salt-substitutes",/salt/i],["99-99-1-trehalose",/sulphated-ash/i],
 ["formulated-supplements-children",/infant/i],["08-08-1-fresh-or-chilled-rabbit-meat",/rabbit/i],
 ["99-99-1-mixture-preparations-premix-of-food-additives",/premix/i]];
 for(const [id,pattern] of cases){let r=get(id);assert.ok(r,id);assert.match(r.risk_of_wrong_article_transfer+" "+r.positive_regulatory_source_evidence_to_obtain,pattern,id);}
});
