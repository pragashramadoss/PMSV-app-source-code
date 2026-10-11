#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const m=load(base+"rules/fssai-v9-two-subtype-exact-metal-articles-2026-10-11.json");
const ix=load(base+"standard-search-index-v1.json").products;
const core=load(base+"rules/contaminants-v9-core.json");
assert.equal(core.source_version,m.source_version);
assert.deepEqual([m.baseline_partial_count,m.baseline_unresolved_count,m.new_partial_count,m.expected_partial_count_after,m.expected_first_exact_pending_after],[410,123,2,412,121]);
assert.equal(m.records.length,2);assert.equal(ix.length,533);
assert.equal(m.dried_mix_frozen_inheritance_permitted,false);
assert.equal(m.dehydrated_onion_5_mgkg_inheritance_permitted,false);
const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function sourceRows(metal,article,value,unit){
 const rows=core.metal_article_rules_v9[metal]||[];
 assert.equal(rows.filter(x=>x.row_type==="exact"&&normalize(x.article)===normalize(article)
  &&Number(x.limit)===value&&String(x.unit)===(unit==="mg/kg on dry matter basis"?"mg/kg":unit)).length,1,metal+":"+article);
}
for(const rec of m.records){
 const p=ix.find(x=>x.id===rec.catalog_id);assert.ok(p&&p.name===rec.product_name&&p.fssr===rec.fssr&&p.fcs===rec.fcs);
 assert.equal(rec.partially_identified_qualified_finished_forms,true);
 assert.equal(rec.exact_subtype_select_required,true);
 assert.equal(rec.unconditional_finished_product_limit_auto_apply,false);
 assert.equal(rec.full_contaminant_panel_complete,false);
 assert.equal(rec.lab_compliance_pass,false);
 for(const sub of rec.branches){
  assert.ok(sub.selector&&sub.requires.length>=3);
  assert.equal(sub.numeric_auto_apply,false);assert.equal(sub.lab_result_pass,false);
  if(sub.lead_article)sourceRows("Lead",sub.lead_article,sub.lead_limit,sub.lead_unit);
  if(sub.arsenic_article)sourceRows("Arsenic",sub.arsenic_article,sub.arsenic_limit,sub.arsenic_unit);
 }
}
console.log("PASS: two first exact partial candidates source-pinned to 4 named metal article checks, no numeric auto application");
