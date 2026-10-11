#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const byId=new Map(catalogue.map(p=>[p.id,p]));
const rows=manifest.records.filter(r=>r.exact_subtype_transfer_safeguard_2026_10_11);
const bySource=Object.groupBy?Object.groupBy(rows,r=>r.regulatory_family):rows.reduce((a,r)=>((a[r.regulatory_family]??=[]).push(r),a),{});
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const start=html.indexOf("function pendingContaminantReviewNotice(p){");
const end=html.indexOf("function renderProductContaminants(){",start);
const ctx=vm.createContext({contaminantsPendingReviewDb:manifest,esc});
vm.runInContext(html.slice(start,end),ctx);
const notice=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
test("28 exact identity-linked transfer safeguards reconcile with unchanged 533/407/126 baseline",()=>{
  assert.equal(catalogue.length,533);
  assert.equal(manifest.pending,126);
  assert.equal(manifest.records.length,126);
  assert.equal(manifest.verified_evidence_added,138);
  assert.equal(manifest.full_compliance_achieved,0);
  assert.equal(rows.length,28);
  assert.equal(new Set(rows.map(r=>r.catalog_id)).size,28);
  assert.deepEqual(["2.4","2.8","2.11"].map(k=>bySource[k]?.length||0),[12,11,5]);
  assert.equal(manifest.exact_subtype_transfer_safeguard_batch_2026_10_11.first_exact_ctr_evidence_added,0);
  assert.equal(manifest.exact_subtype_transfer_safeguard_batch_2026_10_11.compliance_passes,0);
});
test("No review-only qualitative or product-standard criterion transfers to a numeric CTR limit",()=>{
 for(const r of rows){
  const q=r.exact_subtype_transfer_safeguard_2026_10_11,p=byId.get(r.catalog_id);
  assert.ok(p,r.catalog_id);
  assert.equal(q.catalog_id,p.id);
  assert.equal(q.product_name,p.name);
  assert.equal(q.catalogue_fssr,p.fssr);
  assert.equal(q.source_chapter,r.regulatory_family);
  assert.match(q.official_standard_url,/^https:\/\/(www\.)?fssai\.gov\.in\//);
  assert.match(q.ctr_source,/^https:\/\/fssai\.gov\.in\//);
  assert.ok(q.verified_identity_or_standard.length>15);
  assert.ok(q.prohibited_limit_transfer.length>30);
  assert.equal(q.first_exact_ctr_source_claimed,false);
  assert.equal(q.automatically_applied,false);
  assert.equal(q.compliance_approved,false);
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
  if(q.source_pdf_page_one_based===null)assert.equal(q.verification_level,"scope_only_pending_specific_source_page_confirmation");
  else assert.ok(Number.isInteger(q.source_pdf_page_one_based)&&q.source_pdf_page_one_based>0);
  const markup=notice(p);
  assert.match(markup,/11 October exact subtype transfer safeguard — NOT APPLIED/);
  assert.ok(markup.includes(esc(q.prohibited_limit_transfer)),p.id);
  assert.match(markup,/No numeric CTR finished-product limit auto-applied/);
  if(q.chapter_specific_quality_not_ctr_limit){
    const v=q.chapter_specific_quality_not_ctr_limit;
    assert.ok(v.value>0&&["<=",">="].includes(v.operator),p.id);
    assert.match(markup,/NOT a contaminant or pesticide MRL/);
    assert.ok(markup.includes(String(v.value)),p.id);
    assert.match(markup,/does not establish a tested sample result/);
  }
 }
});
test("Officially different product standards and chemical ash bases never collapse into one profile",()=>{
 const flakes=rows.find(r=>r.catalog_id==="06-06-3-fruit-vegetable-cereal-flakes");
 assert.equal(flakes.fssr,"2.4.35");
 const f=flakes.exact_subtype_transfer_safeguard_2026_10_11;
 assert.match(f.verified_identity_or_standard,/2\.3\.20/);
 assert.match(f.prohibited_limit_transfer,/routing mismatch/);
 assert.match(notice(byId.get(flakes.catalog_id)),/FSSAI named-standard routing discrepancy/);
 const cube=rows.find(r=>r.catalog_id==="11-11-1-cube-sugar");
 const c=cube.exact_subtype_transfer_safeguard_2026_10_11;
 assert.match(c.verified_identity_or_standard,/TOTAL ash/);
 assert.match(c.prohibited_limit_transfer,/sulphated ash/);
 assert.equal(c.chapter_specific_quality_not_ctr_limit.value,0.03);
 assert.match(notice(byId.get(cube.catalog_id)),/NOT a contaminant or pesticide MRL/);
 const papads=rows.filter(r=>r.product_name==="Papad");
 assert.equal(papads.length,2);
 assert.deepEqual(papads.map(r=>byId.get(r.catalog_id)?.fcs).sort(),["06.7","15.1"]);
 for(const id of ["06-06-4-macaroni-products-pasta-products","06-06-4-macaroni-products-instant-noodle","06-06-2-custard-powder","11-11-1-icing-sugar"]){
  assert.ok(rows.some(r=>r.catalog_id===id),id);
 }
});
test("Safeguards disappear if underlying selected product identity or standard changes",()=>{
 for(const r of rows){
  const p=byId.get(r.catalog_id);
  const spoof={...p,fssr:"0.0.0"};
  assert.match(notice(spoof),/identity mismatch/);
  assert.doesNotMatch(notice(spoof),/11 October exact subtype transfer safeguard/);
 }
 const coveredIds=new Set(rows.map(r=>r.catalog_id));
 const untouched=catalogue.find(p=>!coveredIds.has(p.id)&&!manifest.records.some(r=>r.catalog_id===p.id));
 assert.ok(untouched);
 assert.equal(notice(untouched),"");
});
