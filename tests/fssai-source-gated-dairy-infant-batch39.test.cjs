"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const idx=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const pending=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const from=html.indexOf("function sourcePinnedNamedMilkProductMrl(p){");
const to=html.indexOf("function productBaselineContaminantRules(p){",from);
assert.ok(from>0&&to>from);
const ctx=vm.createContext({contaminantsDb:db,standardSearchIndexDb:{products:idx},esc:x=>String(x)});
vm.runInContext(html.slice(from,to),ctx);
const milk=p=>vm.runInContext("sourcePinnedNamedMilkProductMrl("+JSON.stringify(p)+")",ctx);
const infant=p=>Array.from(vm.runInContext("sourcePinnedInfantFoodMetalRules("+JSON.stringify(p)+")",ctx),x=>[x.contaminant,x.limit,x.unit]);
test("33 named cheese/fermented milk products have exact catalogue commodity references, never a cheese MRL PASS",()=>{
 const proof=db.chapter_2_1_verified_milk_products_mrl_v9;
 assert.equal(proof.verified_product_identities.length,33);
 assert.equal(proof.cheese_count,27);assert.equal(proof.fermented_count,6);
 assert.equal(proof.auto_apply_cheese,false);assert.equal(proof.full_compliance_verified,false);
 assert.equal(pending.pending,157);assert.equal(pending.verified_evidence_added,107);
 for(const r of proof.verified_product_identities){
  const p=idx.find(x=>x.id===r.catalog_id);assert.ok(p,r.catalog_id);
  const result=milk(p);assert.ok(result,p.name);assert.equal(result.compliance_pass,false);
  assert.equal(result.article,"Milk and Milk products");
  assert.equal(result.pesticide,"Acetamiprid");assert.equal(result.mrl,"0.02");
  assert.ok(!pending.records.some(x=>x.catalog_id===p.id));
  assert.equal(milk({...p,name:p.name+" changed"}),null);
  assert.equal(milk({...p,fcs:"99.9"}),null);
 }
});
test("Six exact infant-food identities have two independent metal sources, without generic or ready-formula lead",()=>{
 const proof=db.chapter_13_verified_infant_food_metals_v9;
 assert.equal(proof.verified_product_identities.length,6);
 for(const r of proof.verified_product_identities){
  const p=idx.find(x=>x.id===r.catalog_id);assert.ok(p);
  assert.deepEqual(infant(p),[["Arsenic",0.05,"mg/kg"],["Cadmium",0.1,"mg/kg"]]);
  assert.deepEqual(infant({...p,name:p.name+" spoof"}),[]);
  assert.deepEqual(infant({...p,fcs:"13.3"}),[]);
  assert.ok(!pending.records.some(x=>x.catalog_id===p.id));
 }
 assert.equal(proof.lead_0_2_not_auto_assigned,true);
 assert.equal(proof.ready_formula_lead_0_02_not_auto_assigned,true);
 const other=idx.find(x=>x.id==="formulated-supplements-children");
 if(other)assert.deepEqual(infant(other),[]);
});
test("Changed source rows, numbers or catalogue identity fail closed",()=>{
 const p=idx.find(x=>x.id==="13-13-1-follow-up-formula");
 const q=idx.find(x=>x.id==="01-01-6-cheddar-cheese");
 const a=structuredClone(db);
 a.metal_article_rules_v9.Arsenic.find(x=>x.article==="Infant milk substitute and Infant foods").limit=99;
 ctx.contaminantsDb=a;assert.deepEqual(infant(p),[]);
 const c=structuredClone(db);
 c.residue_mrls.pesticides.find(x=>x.name==="Acetamiprid").rows.find(x=>x.food==="Milk and Milk products").mrl="1.9";
 ctx.contaminantsDb=c;assert.equal(milk(q),null);
 ctx.contaminantsDb=db;assert.equal(infant(p).length,2);assert.ok(milk(q));
});
