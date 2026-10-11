#!/usr/bin/env node
"use strict";
// FSSR product-standard quality is NOT a contaminants/toxins/pesticide MRL.
// 49 references across 6 first-CTR-source-pending identities must fail closed.
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const home="fssai-product-helper-preview-01/";
const manifest=read(home+"data/rules/fssai-six-pending-chapter-quality-source-2026-10-11.json");
const index=read(home+"data/standard-search-index-v1.json").products;
const modules=[
 "chapter-2-1-dairy-v1.json","chapter-2-4-cereals-v1.json",
 "chapter-2-8-sweetening-honey-v1.json","chapter-2-7-sweets-confectionery-v1.json"
].map(f=>read(home+"data/rules/"+f));
const html=fs.readFileSync(path.join(root,home+"index.html"),"utf8");
const start=html.indexOf("function verifiedSixPendingChapterQuality(p){");
const end=html.indexOf("function sourcePinnedTwoSubtypeMetalEvidenceHtml(p){",start+40);
assert.ok(start>0&&end>start,"UI source-checked chapter-quality functions present");
const esc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
function runtime(){
 const ctx=vm.createContext({sixPendingQualityDb:structuredClone(manifest),chapterRuleDbs:structuredClone(modules),esc});
 vm.runInContext(html.slice(start,end),ctx);return ctx;
}
const prod=id=>index.find(x=>x.id===id);
test("Official-source manifest preserves 533 = 412 partial + 121 awaiting first exact CTR source",()=>{
 assert.equal(index.length,533);
 assert.equal(manifest.source_reviewed_identity_count,6);
 assert.equal(manifest.source_criteria_count,49);
 assert.equal(manifest.catalogue_count,533);
 assert.equal(manifest.partial_exact_ctr,412);
 assert.equal(manifest.pending_first_exact_ctr,121);
 assert.equal(manifest.full_compliance_passes,0);
 assert.equal(manifest.all_quality_values_not_contaminant_mrl,true);
 assert.equal(manifest.records.length,6);
 assert.equal(new Set(manifest.records.map(r=>r.catalog_id)).size,6);
 assert.equal(manifest.records.reduce((n,r)=>n+r.quality_criteria.length,0),49);
});
test("Each of 49 FSSR benchmarks matches its exact chapter-standard row and subtype",()=>{
 const ctx=runtime();
 for(const r of manifest.records){
  const p=prod(r.catalog_id);assert.ok(p);
  assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);assert.equal(r.fcs,p.fcs);
  assert.match(r.source_standard_url,/^https:\/\/(www\.)?fssai\.gov\.in\//);
  assert.equal(r.auto_apply_to_contaminant_engine,false);
  assert.equal(r.contaminant_pesticide_first_source_promoted,false);
  assert.equal(r.full_lab_compliance_pass,false);
  assert.ok(ctx.verifiedSixPendingChapterQuality(p),"Source gate failed for "+r.catalog_id);
  const shown=ctx.sourcePinnedSixPendingChapterQualityHtml(p);
  assert.match(shown,/Official FSSR product quality/);
  assert.match(shown,/NOT contaminant MRLs/);
  assert.match(shown,/No source promotion, contaminant compliance decision/);
  assert.ok(shown.includes(String(r.quality_criteria.length)+" source criteria"));
 }
 assert.equal(ctx.sourcePinnedSixPendingChapterQualityHtml(prod("05-05-1-chocolate")),"");
});
test("FSSAI 1 May 2025 colostrum amendment explicitly requires IgG 1.8% and powder 8.5%",()=>{
 const dairy=modules.find(m=>m.chapter==="2.1");
 const standard=dairy.standards.find(s=>s.key==="2.1.23");
 assert.deepEqual(standard.composition.map(x=>x.immunoglobulins_g_igg_min_pct),[1.8,8.5]);
 assert.ok(standard.composition.every(x=>!Object.hasOwn(x,"immunoglobulins_min_pct")));
 assert.equal(standard.verified_2025_igg_amendment.effective_from,"2025-05-01");
 assert.equal(standard.verified_2025_igg_amendment.require_igg_specific_test,true);
 assert.equal(standard.verified_2025_igg_amendment.quality_only_not_contaminant_mrl,true);
 const ctx=runtime(),p=prod("100-100-cow-or-buffalo-colostrum-and-colostrum-products");
 assert.match(ctx.sourcePinnedSixPendingChapterQualityHtml(p),/Immunoglobulins-G \(IgG\)/);
});
test("Source drift for a different product still withholds all six panels",()=>{
 const ctx=runtime(),p=prod("11-11-1-edible-lactose");
 ctx.chapterRuleDbs.find(x=>x.chapter==="2.7").standards.find(x=>x.key==="2.7.8").variants[0].moisture_max_pct=100;
 assert.match(ctx.sourcePinnedSixPendingChapterQualityHtml(p),/WITHHELD/);
});
test("Wrong identity, FoSCoS code, source numeric value and unofficial domain fail closed",()=>{
 const p=prod("06-06-2-custard-powder"),ctx=runtime();
 assert.match(ctx.sourcePinnedSixPendingChapterQualityHtml({...p,fcs:"06.2.9"}),/WITHHELD/);
 const old=ctx.sixPendingQualityDb;
 for(const edit of [
  x=>x.records.find(r=>r.catalog_id===p.id).quality_criteria[0].value=999,
  x=>x.records.find(r=>r.catalog_id===p.id).source_standard_url="https://example.com/standard.pdf",
  x=>x.records.find(r=>r.catalog_id===p.id).source_standard_url="https://www.fssai.gov.in/food-law/regulations/compendium/food-products-standards",
  x=>x.records.find(r=>r.catalog_id===p.id).full_lab_compliance_pass=true,
  x=>x.records[1].source_snapshot[1].immunoglobulins_g_igg_min_pct=12.5,
  x=>x.partial_exact_ctr=533
 ]){
  ctx.sixPendingQualityDb=structuredClone(manifest);edit(ctx.sixPendingQualityDb);
  assert.match(ctx.sourcePinnedSixPendingChapterQualityHtml(p),/WITHHELD/);
 }
 ctx.sixPendingQualityDb=old;
});
test("Two separate Khandsari variants and cocoa mass/cake matrix bases remain visible",()=>{
 const ctx=runtime();
 const kh=ctx.sourcePinnedSixPendingChapterQualityHtml(prod("11-11-1-khandsari-sugar"));
 assert.match(kh,/Khandsari Sugar \(Sulphur Sugar\)/);
 assert.match(kh,/Khandsari Sugar \(Desi\)/);
 const cocoa=ctx.sourcePinnedSixPendingChapterQualityHtml(prod("05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake"));
 assert.match(cocoa,/Cocoa Mass \/ Cocoa or Chocolate Liquor/);
 assert.match(cocoa,/Cocoa Cake/);
 assert.match(cocoa,/fat-free/);
});
test("Screen loads source manifest and renders it only as a quality-reference panel",()=>{
 assert.match(html,/fssai-six-pending-chapter-quality-source-2026-10-11\.json/);
 assert.match(html,/\+sourcePinnedSixPendingChapterQualityHtml\(p\)/);
 assert.match(html,/sixPendingQualityDb=null/);
 assert.doesNotMatch(html.slice(start,end),/\bcompliance_decision\s*=|\bstatus\s*=\s*['"]pass/);
});
