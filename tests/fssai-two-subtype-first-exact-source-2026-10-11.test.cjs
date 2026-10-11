"use strict";const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),pre="fssai-product-helper-preview-01/data/",read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const m=read(pre+"rules/fssai-v9-two-subtype-exact-metal-articles-2026-10-11.json"),ix=read(pre+"standard-search-index-v1.json").products;
test("Two qualified product-identities have proven exact source articles but no finished product automatic PASS",()=>{
 assert.deepEqual([m.new_partial_count,m.expected_partial_count_after,m.expected_first_exact_pending_after],[2,412,121]);
 assert.equal(m.records.length,2);
 for(const r of m.records){const p=ix.find(x=>x.id===r.catalog_id);assert.ok(p);
  assert.deepEqual([r.product_name,r.fssr,r.fcs],[p.name,p.fssr,p.fcs]);
  assert.equal(r.unconditional_finished_product_limit_auto_apply,false);
  assert.equal(r.lab_compliance_pass,false);
 }
});
test("Dried ice cream mix cannot inherit the finished frozen confection 1/0.5 mg per kg articles",()=>{
 const r=m.records.find(x=>x.case_id==="ice_cream");const frozen=r.branches.find(x=>x.selector==="ready_to_eat_frozen"),dry=r.branches.find(x=>x.selector==="dried_ice_cream_mix");
 assert.ok(frozen&&dry);assert.deepEqual([frozen.lead_limit,frozen.arsenic_limit],[1,0.5]);
 assert.equal(dry.lead_limit,null);assert.equal(dry.arsenic_limit,null);
 assert.equal(m.dried_mix_frozen_inheritance_permitted,false);
});
test("Dehydrated onion 10 dry-basis differs from other dried vegetable 5 as written by FSSAI Version IX",()=>{
 const x=m.records.find(x=>x.case_id==="dehydrated_vegetables");
 const onion=x.branches.find(y=>y.selector==="onion_only_dehydrated"),non=x.branches.find(y=>y.selector==="non_onion_dehydrated_vegetables");
 assert.ok(onion&&non);assert.equal(onion.lead_limit,10);assert.equal(non.lead_limit,5);
 assert.match(onion.lead_unit,/dry matter basis/);assert.equal(non.lead_unit,"mg/kg");
 assert.equal(m.dehydrated_onion_5_mgkg_inheritance_permitted,false);
});
