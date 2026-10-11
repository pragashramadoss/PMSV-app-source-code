#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const dir=path.join(root,"fssai-product-helper-preview-01/data");
const get=p=>JSON.parse(fs.readFileSync(path.join(dir,p),"utf8"));
const catalog=get("standard-search-index-v1.json").products;
const baseline=get("rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const twenty=get("rules/fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json");
const fourteen=get("rules/fssai-14-sugar-egg-confection-source-gates-2026-10-11.json");
const byId=new Map(catalog.map(p=>[p.id,p]));
const unresolved=new Set(baseline.records.map(p=>p.catalog_id));
assert.equal(catalog.length,533);
assert.equal(unresolved.size,121);
assert.equal(twenty.review_products,20);
assert.equal(twenty.records.length,20);
assert.equal(twenty.positive_conditional_branches,25);
assert.equal(twenty.source_articles.length,11);
assert.equal(twenty.partial_evidence,415);
assert.equal(twenty.pending_first_exact,118);
assert.equal(twenty.finished_compliance_passes,0);
assert.equal(twenty.no_new_unconditional_first_source_promotions,true);
assert.equal(fourteen.records.length,14);
assert.equal(fourteen.current_partial,415);
assert.equal(fourteen.current_pending,118);
const keys=new Set(twenty.source_articles.map(a=>a.key));
assert.equal(keys.size,11);
for(const a of twenty.source_articles){
 assert.ok(a.article&&a.metal&&a.matrix);
 assert.ok(Number.isFinite(a.value)&&a.value>0);
 assert.ok(["mg/kg","ppm"].includes(a.unit));
}
const visited=new Set;
let branches=0,refs=0;
for(const p of twenty.records){
 assert.ok(!visited.has(p.catalog_id),"Duplicate conditional identity");
 visited.add(p.catalog_id);
 const canonical=byId.get(p.catalog_id);
 assert.ok(canonical,"Unknown identity "+p.catalog_id);
 assert.ok(unresolved.has(p.catalog_id),"Cannot reclassify resolved identity as pending");
 assert.equal(canonical.name,p.name);
 assert.equal(canonical.fssr,p.fssr);
 assert.equal(canonical.fcs,p.fcs);
 assert.equal(p.unconditional_finished_article_promotion,false);
 assert.equal(p.numeric_auto_apply,false);
 assert.equal(p.no_sample_compliance_pass,true);
 assert.equal(p.default,"unverified");
 assert.ok(p.branches.length);
 const branchIds=new Set;
 for(const b of p.branches){
  assert.ok(!branchIds.has(b.id));branchIds.add(b.id);
  assert.ok(b.requires.length>0,"Missing proof requirements");
  assert.ok(b.article_keys.length>0);
  branches++;
  for(const k of b.article_keys){assert.ok(keys.has(k),"Unknown source row "+k);refs++;}
 }
}
assert.equal(branches,twenty.positive_conditional_branches);
assert.equal(refs,twenty.verified_branch_article_links);
for(const p of fourteen.records){
 assert.ok(byId.has(p.catalog_id));
 assert.ok(unresolved.has(p.catalog_id));
 assert.equal(p.source_positive_finished_article,false);
 assert.equal(p.full_lot_compliance_pass,false);
 assert.ok(p.positive_proof_needed);
}
console.log("PASS: 20 conditional identities, "+branches+" branches, "+refs+" source-row links; 14 sugar/egg/confection gates");
console.log("PASS: 533 catalogue / 415 partial / 118 unresolved; no conditional-to-compliance promotion");
