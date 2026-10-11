"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const m=load(base+"rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const i=load(base+"standard-search-index-v1.json").products;
const prev=load(base+"rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const ref=new Map(m.verified_source_rows.map(x=>[x.id,x]));
test("All 121 unresolved identities have individual exact identity and evidence blockers, not approvals",()=>{
 assert.deepEqual([m.catalogue_count,m.prior_partial_exact,m.unresolved_first_source,m.exact_source_promotions,m.full_compliance_approvals],[533,412,121,0,0]);
 assert.equal(i.length,533);assert.equal(prev.unresolved_first_exact_catalog_ids.length,121);
 assert.equal(m.records.length,121);assert.equal(new Set(m.records.map(r=>r.catalog_id)).size,121);
 assert.deepEqual(new Set(m.records.map(r=>r.catalog_id)),new Set(prev.unresolved_first_exact_catalog_ids));
 const products=new Map(i.map(p=>[p.id,p]));
 for(const x of m.records){
  const p=products.get(x.catalog_id);assert.ok(p,x.catalog_id);
  assert.equal(x.product_name,p.name);assert.equal(x.fssr,p.fssr);assert.equal(x.fcs,p.fcs);
  assert.equal(x.status,"FIRST_EXACT_SOURCE_PENDING_REVIEW_ONLY");
  assert.ok(x.exact_finished_form_questions.length>=3);
  assert.ok(x.exact_finished_form_questions.some(s=>s.includes("sample basis")));
  assert.equal(x.signed_product_article_match,false);
  assert.equal(x.source_references_auto_applied,false);
  assert.equal(x.lab_compliance_pass,false);
  assert.equal(new Set(x.named_article_references_review_only).size,x.named_article_references_review_only.length);
  for(const id of x.named_article_references_review_only)assert.ok(ref.has(id),x.catalog_id+":"+id);
 }
 assert.equal(m.review_summary.identities,121);
 assert.equal(m.review_summary.with_candidates+m.review_summary.without_candidates,121);
 assert.equal(m.review_summary.conditional_article_links,m.records.reduce((n,r)=>n+r.named_article_references_review_only.length,0));
 assert.equal(m.review_summary.distinct_source_articles_referenced,new Set(m.records.flatMap(x=>x.named_article_references_review_only)).size);
});
test("Official source-article references retain exact numeric unit and analytical qualification, without automatic transfer",()=>{
 assert.equal(m.official_sources_only,true);
 assert.equal(m.verified_source_rows.length,20);
 assert.match(m.official_contaminants_url,/^https:\/\/fssai\.gov\.in\/.*_IX\.pdf$/);
 const exact={ "lead-tartaric":[2,"mg/kg"],"arsenic-tartaric":[3,"mg/kg"],
 "arsenic-fruit-pulp":[0.2,"mg/kg"],"lead-cocoa-powder":[5,"mg/kg"],
 "lead-milks":[0.02,"mg/kg"],"lead-canned-fruit-cocktail":[1,"mg/kg"],
 "lead-canned-mushrooms":[1,"mg/kg"],"lead-minarine":[0.1,"mg/kg"],
 "nickel-hydrogenated-fat":[1.5,"mg/kg"],"pesticide-eggs-24d":[0.05,"mg/kg"],
 "agaric-mushroom":[100,"ppm"],"aflatoxin-b1-composite":[10,"µg/kg"],
 "total-aflatoxins-composite":[20,"µg/kg"],"lead-packaged-water":[0.01,"mg/L"],
 "lead-sugars-high-ash":[5,"mg/kg"],"lead-hard-sugar":[2,"mg/kg"],
 "lead-dehydrated-onions":[10,"mg/kg"],"lead-canned-non-onion-dried-vegetable":[5,"mg/kg"],
 "pesticide-milled-grains-24d":[0.01,"mg/kg"],"pesticide-fruits-24d":[2,"mg/kg"]};
 assert.deepEqual(new Set(ref.keys()),new Set(Object.keys(exact)));
 for(const [k,[val,unit]] of Object.entries(exact)){
  const x=ref.get(k);assert.equal(x.limit,val,k);assert.equal(x.unit,unit,k);assert.ok(x.article.length>3&&x.basis.length>10);
  assert.ok(x.pdf_page>=2&&x.pdf_page<=16);
 }
 assert.match(ref.get("lead-cocoa-powder").basis,/fat-free/);
 assert.match(ref.get("arsenic-tartaric").basis,/optical isomer/);
 assert.match(ref.get("nickel-hydrogenated-fat").basis,/hydrogenation/);
 assert.match(ref.get("lead-dehydrated-onions").basis,/dry matter/);
});
test("Cross-family false matches are explicitly withheld, including optical isomer, cans, egg shell, sugar ash and dairy",()=>{
 const get=id=>m.records.find(p=>p.catalog_id===id);
 const cases=[
 ["99-99-1-acidity-regulators-l-tartaric-acid","arsenic-tartaric","optically pure"],
 ["04-04-2-dried-fungi","lead-canned-mushrooms","actually canned"],
 ["04-04-1-coconut-milk-non-dairy","lead-milks","plant analogues"],
 ["11-11-1-dried-glucose-syrup","lead-sugars-high-ash","≤1%"],
 ["10-10-2-egg-powder","pesticide-eggs-24d","shell-free"],
 ["04-04-1-thermally-processed-fruit-salad-cocktail-mix","lead-canned-fruit-cocktail","canned"],
 ["02-02-2-fat-spread","nickel-hydrogenated-fat","hydrogenated"],
 ["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake","lead-cocoa-powder","cocoa beans"],
 ["purified-vending-water","lead-packaged-water","dispensed"],
 ["06-06-7-papad","aflatoxin-b1-composite","ingredient"]
 ];
 for(const [id,refId,phrase] of cases){
  const x=get(id);assert.ok(x,id);assert.ok(x.named_article_references_review_only.includes(refId),id);
  assert.match(x.exact_finished_form_questions.join(" "),new RegExp(phrase,"i"),id);
  assert.equal(x.source_references_auto_applied,false);
 }
});
