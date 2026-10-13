"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const read=n=>JSON.parse(fs.readFileSync(root+"data/rules/"+n));
const data=read("fssai-current35-final13-positive-identity-evidence-batch13-2026-10-13.json");
const work=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const b12=read("fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
test("35 pending = 22 Batch12 +13 Batch13, no duplicate or missing identities",()=>{
 assert.equal(work.review_records.length,35);assert.equal(b12.cases.length,22);assert.equal(data.cases.length,13);
 const p=new Set(work.review_records.map(x=>x.catalog_id));
 const all=[...b12.cases,...data.cases].map(x=>x.catalog_id);
 assert.equal(new Set(all).size,35);assert.deepEqual(new Set(all),p);
});
test("Four named standards, seven FoSCoS grouped categories, two Ayurveda recipes",()=>{
 const counts={EXACT_FSSR_STANDARD:0,FOSCOS_CATEGORY_GROUP:0,OFFICIAL_AYURVEDA_RECIPE:0};
 for(const x of data.cases){
  assert.ok(Object.hasOwn(counts,x.source_tier));counts[x.source_tier]++;
  assert.ok(/^https:\/\/(?:www\.)?(?:fssai\.gov\.in|foscos\.fssai\.gov\.in)\//.test(x.official_source_url),x.catalog_id);
 }
 assert.deepEqual(counts,data.identity_tiers);
});
test("65 mandatory evidence items, every source first-exact pending",()=>{
 assert.equal(data.evidence_gates,65);
 assert.equal(data.cases.reduce((n,x)=>n+x.documentary_evidence_gates.length,0),65);
 for(const x of data.cases){
  assert.equal(x.documentary_evidence_gates.length,5);
  for(let i=0;i<5;i++){
   const g=x.documentary_evidence_gates[i];assert.equal(g.gate,i+1);
   assert.ok(g.question.length>20);assert.equal(g.received,false);assert.equal(g.officially_verified,false);
  }
  assert.equal(x.first_exact_named_CTR_source_verified,false);
  assert.equal(x.finished_food_numeric_limit_applied,false);
  assert.equal(x.verified_lot_lab_result,false);assert.equal(x.complete_food_compliance_pass,false);
 }
});
test("Positive official identity findings remain precise and do not transfer unrelated articles",()=>{
 const cases=new Map(data.cases.map(x=>[x.catalog_id,x]));
 assert.match(cases.get("formulated-supplements-children").positive_official_identity_finding,/24 months to 36 months/);
 assert.match(cases.get("04-04-1-frozen-fruits-fruit-products").positive_official_identity_finding,/-18°C/);
 assert.match(cases.get("04-04-1-seedless-tamarind").positive_official_identity_finding,/Tamarindus indica/);
 assert.match(cases.get("08-08-4-animal-casings").positive_official_identity_finding,/urinary bladder/);
 assert.match(cases.get("102-102-1-14-3-narikela-ksheerika-milky-coconut-delight").positive_official_identity_finding,/Cocos nucifera/);
 assert.match(cases.get("102-102-1-14-7-ksheerapaka-mystic-milk-quartet").positive_official_identity_finding,/buffalo milk/);
});
test("Canonical no-pass baseline and site isolation",()=>{
 assert.equal(ledger.first_source_pending,35);
 assert.equal(data.catalogue,533);assert.equal(data.conditional_first_source,498);assert.equal(data.first_source_pending,35);
 assert.equal(data.results.new_source_promotions,0);
 assert.equal(data.results.new_applied_finished_numeric_limits,0);
 assert.equal(data.results.new_verified_lot_results,0);assert.equal(data.results.new_regulatory_approvals,0);
 assert.equal(data.results.prior_ledger_mutated,false);assert.equal(data.results.wordpress_production_modified,false);
});
test("Batch13 module loaded after Batch12 on preview and nowhere on WordPress",()=>{
 const html=fs.readFileSync(root+"index.html","utf8"),s="fssai-current35-final13-positive-identity-evidence-batch13-2026-10-13.js";
 assert.equal(html.split(s).length,2);
 assert.ok(html.indexOf(s)>html.indexOf("fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.js"));
});
