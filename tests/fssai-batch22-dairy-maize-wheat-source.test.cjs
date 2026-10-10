"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json"),idx=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const manifest=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const first=html.indexOf("function sourcePinnedAdditionalMilkCommodity(p){"),last=html.indexOf("function productBaselineContaminantRules(p){",first);
assert.ok(first>0&&last>first);
const ctx=vm.createContext({contaminantsDb:db,standardSearchIndexDb:{products:idx},esc:x=>String(x)});
vm.runInContext(html.slice(first,last),ctx);
const milk=p=>vm.runInContext("sourcePinnedAdditionalMilkCommodity("+JSON.stringify(p)+")",ctx);
const cereal=p=>vm.runInContext("sourcePinnedMaizeWheatB1("+JSON.stringify(p)+")",ctx);
test("20 named Chapter 2.1 dairy article identities have source-pinned commodity evidence, never direct MRL approval",()=>{
 const m=db.chapter_2_1_additional_milk_commodity_evidence_v9;
 assert.equal(m.exact_products.length,20);assert.equal(m.auto_assign_numeric_pesticide_mrl,false);
 assert.equal(m.full_compliance_verified,false);assert.equal(manifest.pending,167);
 assert.equal(manifest.verified_evidence_added,97);
 for(const record of m.exact_products){
  const p=idx.find(x=>x.id===record.catalog_id);assert.ok(p,record.catalog_id);
  const r=milk(p);assert.ok(r,p.id);assert.equal(r.reference_pesticide,"Acetamiprid");
  assert.equal(r.reference_mrl,"0.02");assert.equal(r.auto_apply,false);
  assert.equal(r.compliance_pass,false);
  assert.ok(!manifest.records.some(x=>x.catalog_id===p.id));
  assert.equal(milk({...p,name:p.name+" modified"}),null);
  assert.equal(milk({...p,fssr:"2.1.999"}),null);
 }
});
test("Excluded dairy analogues, frozen vegetable-oil desserts, pure lactose and colostrum cannot inherit dairy commodity reference",()=>{
 for(const x of idx.filter(p=>/analogue in the dairy context|frozen desserts or confections|edible lactose|colostrum/i.test(p.name))){
  assert.equal(milk(x),null,x.id);
 }
});
test("Exact maize-starch and wheat-protein standards have source-checked B1 at 10 µg/kg; no total-aflatoxin inheritance",()=>{
 const m=db.chapter_2_4_maize_wheat_b1_exact_v9;
 assert.equal(m.exact_products.length,2);assert.equal(m.total_aflatoxins_not_auto_assigned,true);
 for(const x of m.exact_products){
  const p=idx.find(z=>z.id===x.catalog_id);assert.ok(p);
  const r=cereal(p);assert.ok(r,p.id);assert.equal(r.contaminant,"Aflatoxin B1");
  assert.equal(r.limit,10);assert.equal(r.unit,"µg/kg");
  assert.ok(!manifest.records.some(z=>z.catalog_id===p.id));
  assert.equal(cereal({...p,name:p.name+" modified"}),null);
  assert.equal(cereal({...p,fssr:"2.4.99"}),null);
 }
 for(const id of ["07-07-2-biscuit","07-07-2-wafer-biscuit","06-06-2-arrowroot","06-06-2-custard-powder"]){
  const p=idx.find(x=>x.id===id);assert.ok(p);assert.equal(cereal(p),null,p.id);
 }
});
test("Changed official pesticide or B1 rows fail closed; neither changed unit nor changed document may certify",()=>{
 const p=idx.find(x=>x.id==="01-01-6-chhana-and-paneer"),q=idx.find(x=>x.id==="06-06-2-maize-starch");
 assert.ok(milk(p));assert.ok(cereal(q));
 const a=structuredClone(db);a.residue_mrls.pesticides.find(x=>x.name==="Acetamiprid").rows.find(x=>x.food==="Milk and Milk products").mrl="999";
 ctx.contaminantsDb=a;assert.equal(milk(p),null);
 const b=structuredClone(db);b.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Cereal and cereal products").limit=99;
 ctx.contaminantsDb=b;assert.equal(cereal(q),null);
 const c=structuredClone(db);c.chapter_2_4_maize_wheat_b1_exact_v9.unit="mg/kg";
 ctx.contaminantsDb=c;assert.equal(cereal(q),null);
 const d=structuredClone(db);d.chapter_2_1_additional_milk_commodity_evidence_v9.official_source_url="https://example.org/fake.pdf";
 ctx.contaminantsDb=d;assert.equal(milk(p),null);
 ctx.contaminantsDb=db;assert.ok(milk(p));assert.ok(cereal(q));
});
test("UI exposes review-only dairy source and preserves cereal numerical integrity without compliance claims",()=>{
 assert.match(html,/additionalMilkCommodityReviewHtml\(p\)/);
 assert.match(html,/\+additionalMilkCommodityReview/);
 assert.match(html,/NOT auto-applied|numeric MRL NOT applied/);
 assert.match(html,/total-aflatoxins inference or pesticide\/full compliance PASS/);
});
