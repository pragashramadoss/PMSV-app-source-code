"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const index=JSON.parse(read("fssai-product-helper-preview-01/data/standard-search-index-v1.json")).products;
const manifest=JSON.parse(read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json"));
const html=read("fssai-product-helper-preview-01/index.html"),queue=read("FSSAI-CONTAMINANT-EVIDENCE-QUEUE-2026-10-10.md");
const byId=new Map(index.map(x=>[x.id,x]));
const queued=new Set([...queue.matchAll(/^\| [^|]+\| `([^`]+)` \|/gm)].map(m=>m[1]));
test("All 167 pending identities have accurate individual FSSAI review records with no exemption or PASS",()=>{
 assert.equal(queued.size,167);
 assert.equal(manifest.count,167);
 assert.equal(manifest.records.length,167);
 assert.deepEqual(new Set(manifest.records.map(x=>x.catalog_id)),queued);
 assert.equal(manifest.full_compliance_achieved,0);
 assert.equal(manifest.verified_evidence_added,97);
 for(const item of manifest.records){
  const product=byId.get(item.catalog_id);
  assert.ok(product,item.catalog_id);
  assert.equal(item.product_name,product.name,item.catalog_id);
  assert.equal(item.fssr,product.fssr,item.catalog_id);
  assert.equal(item.assessment_status,"exact_contaminant_evidence_not_yet_established");
  assert.equal(item.auto_apply_numeric_limit,false);
  assert.equal(item.unconditional_compliance_pass,false);
  assert.equal(item.exemption_asserted,false);
  assert.ok(item.review_requirements.length>=3);
  assert.match(item.official_source,/^https:\/\/fssai\.gov\.in\/upload\/uploadfiles\/files\/Comp_Contaminants_/);
 }
});
test("Risk-sensitive FSSAI product distinctions are individually documented",()=>{
 const requirements=id=>manifest.records.find(p=>p.catalog_id===id)?.review_requirements.join(" | ")||"";
 for(const [id,pattern] of [
   ["06-06-1-quinoa",/explicitly excluded/i],
   ["06-06-4-macaroni-products-instant-noodle",/legume or tuber/i],
   ["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake",/Cocoa Powder lead 5 mg\/kg/],
   ["02-02-2-fat-spread",/Nickel rule/i],
   ["100-100-royal-jelly",/Bees Wax 2 mg\/kg/],
   ["coffee-chicory-mixture",/coffee-only OTA/i],
   ["10-10-2-egg-powder",/shell-free/i],
   ["purified-vending-water",/2\.10\.9/]
 ]){
  assert.match(requirements(id),pattern,id);
 }
 assert.equal(requirements("04-04-2-peanut-butter"),"","Peanut Butter has moved from missing-exact to partial verified composite aflatoxin evidence");
});
test("Product Contaminants displays evidence gaps and cannot turn review notes into numeric limits",()=>{
 assert.match(html,/let contaminantsPendingReviewDb=null/);
 assert.match(html,/contaminants-v9-unresolved-264-review-v1\.json\?v=20261010-mango9/);
 assert.match(html,/el\.innerHTML=profileMsg\s*\+pendingContaminantReviewNotice\(p\)/);
 const start=html.indexOf("function pendingContaminantReviewNotice(p){");
 const end=html.indexOf("function renderProductContaminants(){",start);
 assert.ok(start>=0&&end>start);
 const ctx={contaminantsPendingReviewDb:manifest,esc:value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))};
 vm.runInNewContext(html.slice(start,end),ctx);
 let sample=byId.get("06-06-1-quinoa");
 const result=ctx.pendingContaminantReviewNotice(sample);
 assert.match(result,/Exact finished-product contaminant evidence still incomplete/);
 assert.match(result,/explicitly excluded/i);
 assert.match(result,/not an exemption/);
 assert.doesNotMatch(result,/compliance PASS|0\.2 mg\/kg as a limit/);
 const dairy=ctx.pendingContaminantReviewNotice(byId.get("01-01-5-milk-powders-and-cream-powder"));
 assert.equal(dairy,"","Partial dairy commodity evidence must leave the no-exact-source queue");
 assert.match(html,/Milk-powder Aflatoxin M1 subtype verification required/);
 assert.match(html,/sourcePinnedMilkPowderAflatoxinM1Rule\(p\)/);
 assert.match(html,/numeric MRL NOT applied/);
 const analogue=ctx.pendingContaminantReviewNotice(byId.get("01-01-3-analogue-in-the-dairy-context"));
 assert.match(analogue,/cannot inherit/i);
 assert.equal(ctx.pendingContaminantReviewNotice(byId.get("coffee")),"");
});

test("Every pending identity now has source-linked and explicitly conditional Version IX named-article review",()=>{
 assert.equal(manifest.source_row_scope_reviewed,236);
 assert.equal(manifest.pending,167);
 assert.equal(manifest.conditional_source_article_candidate_records,43);
 assert.ok(manifest.scope_article_reconciliation.includes(String(manifest.verified_evidence_added)),
    "Scope note must carry current verified-partial evidence count");
 assert.ok(manifest.scope_article_reconciliation.includes(String(manifest.pending)),
    "Scope note must carry current unresolved evidence count");
 const candidates=manifest.records.filter(x=>
   x.version_ix_named_article_scope_review.source_article_candidates_review_only.length>0);
 assert.equal(candidates.length,manifest.conditional_source_article_candidate_records);
 for(const row of manifest.records){
  const review=row.version_ix_named_article_scope_review;
  assert.ok(review,row.catalog_id);
  assert.equal(review.source,row.official_source,row.catalog_id);
  assert.equal(review.review_date,"2026-10-10");
  assert.equal(review.applies_numeric_limits_to_product,false,row.catalog_id);
  assert.equal(review.exact_identity_source_evidence_claimed,false,row.catalog_id);
  assert.equal(review.full_contaminant_and_residue_review_complete,false,row.catalog_id);
  assert.equal(review.current_amendments_fully_reconciled,false,row.catalog_id);
  assert.equal(row.auto_apply_numeric_limit,false,row.catalog_id);
  assert.equal(row.unconditional_compliance_pass,false,row.catalog_id);
  assert.ok(row.review_requirements.some(x=>x.includes("Version IX")||x.includes("Official Version IX")),row.catalog_id);
  for(const candidate of review.source_article_candidates_review_only){
    assert.equal(candidate.finished_product_limit_applied,false,row.catalog_id);
    assert.equal(candidate.source_document,row.official_source,row.catalog_id);
    assert.ok(candidate.condition_for_applicability.length>15,row.catalog_id);
    assert.ok(candidate.source_pdf_page_one_based>0,row.catalog_id);
  }
 }
 const quinoa=manifest.records.find(x=>x.product_name==="Quinoa");
 assert.equal(quinoa.version_ix_named_article_scope_review.review_disposition,"quinoa_explicit_lead_exclusion");
 assert.equal(quinoa.version_ix_named_article_scope_review.source_article_candidates_review_only.length,0);
 const milkPowder=manifest.records.find(x=>x.catalog_id==="01-01-5-milk-powders-and-cream-powder");
 assert.equal(milkPowder,undefined,"Milk powder retains separate conditional M1 checks, but now has partial dairy-commodity source evidence");
 const dairyAnalogue=manifest.records.find(x=>x.catalog_id==="01-01-3-analogue-in-the-dairy-context");
 assert.equal(dairyAnalogue.version_ix_named_article_scope_review.review_disposition,"dairy_analogue_is_not_automatically_milk");
 assert.deepEqual(dairyAnalogue.version_ix_named_article_scope_review.source_article_candidates_review_only,[]);
});

test("Published pending family summary reconciles exactly to all 167 catalogue IDs",()=>{
 const head=queue.split("## Unresolved by standard family")[1].split("## Exact unresolved identities")[0];
 const table=new Map([...head.matchAll(/^\| (2\.\d+|3\.3|special) \| (\d+) \|$/gm)].map(x=>[x[1],Number(x[2])]));
 const counts={};
 for(const r of manifest.records)counts[r.regulatory_family]=(counts[r.regulatory_family]||0)+1;
 assert.equal(table.size,Object.keys(counts).length);
 for(const [prefix,count] of Object.entries(counts))
   assert.equal(table.get(prefix),count,"Mismatched named family "+prefix);
 assert.equal([...table.values()].reduce((a,b)=>a+b,0),167);
});
