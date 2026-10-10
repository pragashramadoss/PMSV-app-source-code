#!/usr/bin/env node
"use strict";
// The official May 2026 notification commences on 1 December 2026.
// Product identity watch != current applicability or regulatory compliance.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const watch=load("fssai-product-helper-preview-01/data/rules/contaminants-2026-deferred-amendment-v1.json");
const v9=load("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const products=load("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const ids=new Set(products.map(p=>p.id));
const official="https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf";

test("Deferred amendment is pinned to an official FSSAI Gazette with future commencement",()=>{
 assert.equal(watch.source.url,official);
 assert.equal(watch.source.authority,"FSSAI / Gazette of India");
 assert.equal(watch.gazette_id,"CG-DL-E-25052026-272840");
 assert.equal(watch.publication_date,"2026-05-25");
 assert.equal(watch.effective_date,"2026-12-01");
 assert.equal(watch.status,"gazetted_deferred_commencement");
 assert.equal(v9.source_version,"Version IX (03.02.2026)");
});

test("All future-watch identities are actual products and never auto-applied",()=>{
 assert.equal(products.length,533);
 assert.equal(new Set(products.map(p=>p.id)).size,533);
 assert.equal(watch.changes.length,5);
 assert.equal(watch.runtime_policy.all_changes_auto_apply,false);
 assert.equal(watch.runtime_policy.amended_limits_added_to_current_v9_tables,false);
 assert.equal(watch.runtime_policy.automatic_compliance_pass,false);
 const all=new Set();
 for(const group of watch.changes){
   assert.ok(group.id&&group.section&&group.change&&group.review_scope);
   assert.ok(group.catalog_ids.length>0);
   assert.equal(new Set(group.catalog_ids).size,group.catalog_ids.length);
   assert.ok(group.contaminants_to_revalidate.length>0);
   for(const id of group.catalog_ids){assert.ok(ids.has(id),"Unknown watch identity "+id);all.add(id);}
   for(const candidate of [group.future_reference_value,...(group.future_reference_values||[])].filter(Boolean))
     assert.equal(candidate.auto_apply,false,"Future numeric candidate must remain non-executable");
 }
 assert.equal(all.size,31);
});

test("Fish-oil, pulse-flour and spice trigger scopes remain distinct",()=>{
 const byId=id=>watch.changes.find(x=>x.id===id);
 assert.deepEqual(byId("fish_oil_inorganic_arsenic").catalog_ids,["02-02-1-fish-oil"]);
 assert.ok(byId("pulse_metal_article_expansion").catalog_ids.includes("06-06-2-besan"));
 assert.ok(byId("mace_nutmeg_saffrole").catalog_ids.includes("12-12-2-nutmeg-jaiphal"));
 assert.ok(!byId("fish_oil_inorganic_arsenic").catalog_ids.includes("09-09-2-frozen-finfish"));
 assert.ok(!byId("seafood_veterinary_drug_residues").catalog_ids.includes("99-99-1-gelatin-from-fish-processing-waste"));
});

test("February 2026 current metal table stays separate from prospective expanded articles",()=>{
 const metal=v9.metal_article_rules_v9;
 assert.ok(metal.Lead.some(x=>x.article==="Pulses"&&x.limit===0.2&&x.unit==="mg/kg"));
 assert.ok(metal.Cadmium.some(x=>x.article==="Pulses, excluding soybean dry"&&x.limit===0.1&&x.unit==="mg/kg"));
 assert.ok(!metal.Lead.some(x=>x.article==="Pulses and Pulse flours"));
 assert.ok(!metal.Cadmium.some(x=>x.article==="Pulses and Pulse flours, excluding soybean dry"));
 assert.ok(!metal.Arsenic.some(x=>x.article==="Fish Oil"&&x.limit===0.1));
});
