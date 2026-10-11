"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const index=read(base+"standard-search-index-v1.json").products;
const standard=read(base+"rules/chapter-2-4-cereals-v1.json");
const c=read(base+"rules/contaminants-v9-core.json");
const m=read(base+"rules/fssai-eight-cereal-bakery-papad-quality-and-commodity-guards-2026-10-11.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const st=html.indexOf("function verifiedEightCerealQualityScope(p){");
const en=html.indexOf("function verifiedSugarChromiumSourceScope(p){",st);
assert.ok(st>=0&&en>st);
const ctx=vm.createContext({eightCerealQualityDb:m,contaminantsDb:c,chapterRuleDbs:[standard],
 standardSearchIndexDb:{products:index},
 esc:x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")});
vm.runInContext(html.slice(st,en),ctx);
const obj=id=>index.find(x=>x.id===id),verify=p=>vm.runInContext("verifiedEightCerealQualityScope("+JSON.stringify(p)+")",ctx);
const show=p=>vm.runInContext("eightCerealQualityScopeHtml("+JSON.stringify(p)+")",ctx);
test("All 8 exact FoSCoS identities remain in the first-exact contaminant queue; 19 FSSR quality rows are separately grounded",()=>{
 assert.equal(index.length,533);assert.equal(m.all_reviewed_products,8);
 assert.equal(m.records.length,6);assert.equal(m.grain_exclusion_records.length,2);
 assert.equal(m.qualified_quality_criteria_count,19);
 assert.equal(m.added_first_exact_contaminant_coverage,0);assert.equal(m.full_product_compliance_passes,0);
 assert.equal(m.records.reduce((n,x)=>n+x.criteria.length,0),19);
 const ids=new Set();
 for(const x of [...m.records,...m.grain_exclusion_records]){
  assert.ok(!ids.has(x.catalog_id));ids.add(x.catalog_id);
  const p=obj(x.catalog_id);assert.ok(p,x.catalog_id);
  assert.equal(p.name,x.product_name);assert.equal(p.fssr,x.fssr);assert.equal(p.fcs,x.fcs);
  assert.ok(verify(p),"Official rule absent or wrong "+p.id);
  assert.equal(x.first_exact_contaminant_evidence_added,false);
  assert.equal(show({...p,name:"Different product"}).includes("quality requirements"),false);
 }
 assert.equal(ids.size,8);
});
test("Version 4 source quality correctly distinguishes pasta, fried/no-fried noodles, Biscuit, Wafer and two Papad FCS categories",()=>{
 const b=m.records.filter(x=>x.fssr==="2.4.15(1)");
 const pp=m.records.filter(x=>x.fssr==="2.4.40");
 const pasta=m.records.find(x=>x.catalog_id==="06-06-4-macaroni-products-pasta-products");
 const noodles=m.records.find(x=>x.catalog_id==="06-06-4-macaroni-products-instant-noodle");
 assert.equal(b.length,2);assert.equal(pp.length,2);
 for(const row of b){
  assert.deepEqual(row.criteria.map(x=>x.value),[0.1,2]);
  assert.match(show(obj(row.catalog_id)),/NOT CTR MRLs/);
 }
 for(const row of pp){
  assert.deepEqual(row.criteria.map(x=>x.value),[15,0.25,0.2,100]);
  assert.match(show(obj(row.catalog_id)),/Uric acid/);
 }
 assert.deepEqual(pasta.criteria.map(x=>x.value),[12.5,0.1]);
 assert.deepEqual(noodles.criteria.filter(x=>/— fried/.test(x.variant)).map(x=>x.value),[10,0.3,2]);
 assert.deepEqual(noodles.criteria.filter(x=>/— non-fried/.test(x.variant)).map(x=>x.value),[13,0.3]);
 assert.equal(noodles.requires_fried_or_nonfried_confirmation,true);
 assert.match(show(obj(noodles.catalog_id)),/Choose actual noodle processing/);
 assert.match(show(obj(noodles.catalog_id)),/Fried versus non-fried/);
});
test("Quinoa excluded from cereal-grain Lead 0.2 mg/kg; Chia oilseed B1 10 µg/kg must remain unassigned",()=>{
 const quinoa=obj("06-06-1-quinoa"),chia=obj("06-06-1-chia-seeds");
 assert.ok(verify(quinoa));assert.ok(verify(chia));
 assert.match(show(quinoa),/explicitly EXCLUDES quinoa/);
 assert.match(show(chia),/Do not infer that oilseed Aflatoxin B1/);
 assert.match(show(quinoa),/NOT AUTO-APPLIED/);
 assert.match(show(chia),/NOT AUTO-APPLIED/);
 for(const x of m.grain_exclusion_records)assert.equal(x.auto_apply_source_limit,false);
});
test("Changed standard number/source/variant and changed Version IX lead value all WITHHOLD review values",()=>{
 const biscuit=obj("07-07-2-biscuit"),quinoa=obj("06-06-1-quinoa");
 const originalChapter=ctx.chapterRuleDbs,originalCtr=ctx.contaminantsDb;
 ctx.chapterRuleDbs=structuredClone([standard]);
 ctx.chapterRuleDbs[0].standards.find(x=>x.key==="2.4.15(1)").official_2025_qualified_quality.criteria[0].value=10;
 assert.equal(verify(biscuit),null);assert.match(show(biscuit),/WITHHELD/);
 ctx.chapterRuleDbs=structuredClone([standard]);
 ctx.chapterRuleDbs[0].official_sources=[];
 assert.equal(verify(biscuit),null);
 ctx.chapterRuleDbs=originalChapter;
 ctx.contaminantsDb=structuredClone(c);
 ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Cereal grains, except buckwheat, canihua and quinoa").limit=12;
 assert.equal(verify(quinoa),null);assert.match(show(quinoa),/WITHHELD/);
 ctx.contaminantsDb=originalCtr;
 assert.ok(verify(biscuit));
 assert.ok(verify(quinoa));
});
test("Generated readiness audit does not confuse 8 quality/exclusion reviews with exact contaminants",()=>{
 const a=read("audit-output/fssai-product-readiness-audit.json");
 assert.equal(a.products.length,533);
 assert.equal(a.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,410);
 assert.equal(a.summary.counts.chapter_2_4_2025_quality_review_and_commodity_guard.official_quality_only,6);
 assert.equal(a.summary.counts.chapter_2_4_2025_quality_review_and_commodity_guard.botanical_metal_or_aflatoxin_source_exclusion,2);
 for(const row of [...m.records,...m.grain_exclusion_records]){
   const arow=a.products.find(p=>p.id===row.catalog_id);
   assert.ok(arow);
   assert.notEqual(arow.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
   assert.equal(arow.chapter_2_4_quality_and_mrl_exclusion_review.first_exact_contaminant_source_promoted,false);
   assert.equal(arow.chapter_2_4_quality_and_mrl_exclusion_review.full_compliance_pass,false);
   assert.equal(arow.compliance_decision,"not_established_by_route_evidence");
 }
 const ledger=read("audit-output/fssai-live-first-source-ledger-533.json");
 assert.equal(ledger.partial_first_source_evidence,410);
 assert.equal(ledger.unresolved_first_source_gaps,123);
});
