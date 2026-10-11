"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const prefix="fssai-product-helper-preview-01/data/";
const evidence=read(prefix+"rules/fssai-20-pending-exact-chapter-quality-2026-10-11.json");
const index=read(prefix+"standard-search-index-v1.json").products;
const modules=[
 "chapter-2-3-fruit-vegetable-v1.json",
 "chapter-2-7-sweets-confectionery-v1.json",
 "chapter-2-8-sweetening-honey-v1.json",
 "chapter-2-11-other-food-products-v1.json"
].map(x=>read(prefix+"rules/"+x));
const byId=new Map(index.map(x=>[x.id,x]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function verifiedChapterQualityOnly(p){"),b=html.indexOf("function pendingContaminantReviewNotice(p){",a);
assert.ok(a>0&&b>a);
const ctx=vm.createContext({chapterQuality20Db:evidence,chapterRuleDbs:modules,esc:v=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);
const show=p=>vm.runInContext("sourcePinnedChapterQualityHtml("+JSON.stringify(p)+")",ctx);
const verify=p=>vm.runInContext("verifiedChapterQualityOnly("+JSON.stringify(p)+")",ctx);
test("20 unique exact FSSR product quality references = 75 rows; never counted as CTR source evidence",()=>{
 assert.equal(index.length,533);assert.equal(evidence.records.length,20);
 assert.equal(new Set(evidence.records.map(x=>x.catalog_id)).size,20);
 assert.equal(evidence.product_count,20);assert.equal(evidence.source_quality_rows,75);
 assert.equal(evidence.prior_live_partial_exact_contaminant_evidence,409);
 assert.equal(evidence.prior_live_unresolved_contaminant_evidence,124);
 assert.equal(evidence.compliance_passes,0);assert.equal(evidence.automatic_contaminant_limits,0);
 assert.equal(evidence.records.reduce((n,x)=>n+x.quality_criteria.length+x.qualified_packing_media_brix.length,0),75);
 for(const row of evidence.records){
  const p=byId.get(row.catalog_id);assert.ok(p,row.catalog_id);
  assert.equal(p.name,row.product_name);assert.equal(p.fssr,row.fssr);assert.equal(p.fcs,row.fcs);
  assert.equal(row.automatic_numeric_pass,false);assert.equal(row.compliance_assessment_enabled,false);
  assert.equal(row.lab_sample_not_evaluated,true);assert.equal(row.other_contaminants_pesticides_not_verified,true);
  assert.match(row.official_chapter_source,/^https:\/\/(?:www\.)?fssai\.gov\.in\//);
  assert.ok(verify(p),"Chapter source must match "+row.catalog_id);
  const visible=show(p);
  assert.match(visible,/NOT CONTAMINANT MRLs/);
  assert.match(visible,/No product-compliance PASS is issued/);
  assert.match(visible,/source criteria/);
  for(const q of row.quality_criteria)assert.ok(visible.includes(String(q.value)),q.parameter);
  assert.doesNotMatch(show({...p,fssr:"made-up-standard"}),/source criteria/);
 }
});
test("2.3.2 has eight separately qualified sugar-added packing-medium Brix bands and five article-specific quality limits",()=>{
 const p=byId.get("04-04-1-thermally-processed-fruit-salad-cocktail-mix");
 assert.ok(p);const r=evidence.records.find(x=>x.catalog_id===p.id);assert.ok(r);
 assert.equal(r.fssr,"2.3.2");assert.equal(r.quality_criteria.length,5);
 assert.equal(r.qualified_packing_media_brix.length,8);
 const q=r.quality_criteria;
 assert.ok(q.some(x=>x.parameter.startsWith("Blemished")&&x.value===2&&x.unit==="pieces per 100 g drained fruit"));
 assert.ok(q.some(x=>x.parameter.startsWith("Peel")&&x.value===6.5));
 assert.ok(q.some(x=>x.parameter.startsWith("Minimum container")&&x.value===90));
 assert.ok(q.some(x=>x.parameter==="Minimum drained weight"&&x.value===50&&/water/.test(x.unit)));
 const bands=r.qualified_packing_media_brix;
 assert.equal(bands.filter(x=>x.cut_out_strength_max_brix===null&&x.cut_out_strength_min_brix===22).length,2);
 assert.equal(bands.filter(x=>x.medium_family==="fruit_juice_added_sugars").length,4);
 assert.equal(bands.filter(x=>x.medium_family==="water_or_water_juice_added_sugars").length,4);
 for(const q of bands)assert.equal(q.automatically_applied,false);
 assert.match(show(p),/packing-medium family and sugar-added class confirmation/);
});
test("Fail closed on changed source value, wrong source URL, missing chapter and product name drift",()=>{
 const p=byId.get("04-04-2-cocoa-beans");
 assert.ok(p);assert.ok(verify(p));
 const original=ctx.chapterRuleDbs;
 ctx.chapterRuleDbs=structuredClone(modules);
 const st=ctx.chapterRuleDbs[0].standards.find(x=>x.key==="2.3.54");
 st.composition[0].value=999;
 assert.equal(verify(p),null);assert.match(show(p),/WITHHELD/);
 assert.doesNotMatch(show(p),/8 % by mass/);
 ctx.chapterRuleDbs=structuredClone(modules);
 const fruit=ctx.chapterRuleDbs[0].standards.find(x=>x.key==="2.3.2");
 fruit.source_pinned_conditional_quality_v2_2024.packing_media_cutout_strength[0].cut_out_strength_min_brix=888;
 const salad=byId.get("04-04-1-thermally-processed-fruit-salad-cocktail-mix");
 assert.equal(verify(salad),null);assert.match(show(salad),/WITHHELD/);
 ctx.chapterRuleDbs=structuredClone(modules);
 ctx.chapterRuleDbs[0].standards.find(x=>x.key==="2.3.2").source_pinned_conditional_quality_v2_2024.source_url="https://example.com/no";
 assert.equal(verify(salad),null);
 ctx.chapterRuleDbs=[];
 assert.equal(verify(p),null);
 ctx.chapterRuleDbs=original;
 assert.equal(verify({...p,name:"Cocoa Powder"}),null);
 assert.ok(verify(p));
});
test("Generated readiness audit keeps 410/123 ledger; 20 quality reviews with one separate B1 partial",()=>{
 const report=read("audit-output/fssai-product-readiness-audit.json");
 assert.equal(report.products.length,533);
 assert.equal(report.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,410);
 assert.equal(report.summary.counts.chapter_fssr_2026_10_11_20_quality_only.exact_source_quality_not_ctr,20);
 for(const r of evidence.records){
  const p=report.products.find(x=>x.id===r.catalog_id);
  assert.ok(p,r.catalog_id);
  if(r.catalog_id==="06-06-3-fruit-vegetable-cereal-flakes"){
    assert.equal(p.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
    assert.equal(p.contaminant_evidence_index.exact_fruit_vegetable_cereal_flakes_composite_b1.limit,10);
  }else assert.notEqual(p.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage",r.catalog_id);
  assert.equal(p.source_pinned_chapter_quality_review_2026_10_11.quality_numeric_rows,r.quality_criteria.length);
  assert.equal(p.source_pinned_chapter_quality_review_2026_10_11.qualified_packing_media_subtypes,r.qualified_packing_media_brix.length);
  assert.equal(p.source_pinned_chapter_quality_review_2026_10_11.lab_compliance_pass,false);
  assert.equal(p.compliance_decision,"not_established_by_route_evidence");
 }
});
