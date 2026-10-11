"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const base=path.join(root,"fssai-product-helper-preview-01");
const file=p=>JSON.parse(fs.readFileSync(path.join(base,"data",p),"utf8"));
const catalog=file("standard-search-index-v1.json").products;
const initial=file("rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const ayur=file("rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json");
const grain=file("rules/fssai-other-foodgrains-b1-first-source-2026-10-11.json");
const twenty=file("rules/fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json");
const fourteen=file("rules/fssai-14-sugar-egg-confection-source-gates-2026-10-11.json");
const review=file("rules/fssai-2026-10-11-cross-form-nontransfer-large-batch.json");
const core=file("rules/contaminants-v9-core.json");
const index=new Map(catalog.map(x=>[x.id,x]));
const original=new Map(initial.records.map(x=>[x.catalog_id,x]));
const matched=new Set([...ayur.records.map(x=>x.catalog_id),grain.catalog_id]);
const occupied=new Set([...twenty.records,...fourteen.records].map(x=>x.catalog_id));
const refs=new Map(initial.verified_source_rows.map(x=>[x.id,x]));
test("all 56 product-form scope decisions are identity-exact and conserve 415/118",()=>{
 assert.equal(catalog.length,533);assert.equal(original.size,121);
 assert.equal(review.product_catalogue,533);assert.equal(review.current_source_partial,415);assert.equal(review.current_source_pending,118);
 assert.equal(review.first_source_promotions,0);assert.equal(review.finished_food_compliance_passes,0);
 assert.equal(review.source_proof_kind,"PRIMARY_SOURCE_CONFIRMED_BUT_FINISHED_PRODUCT_LINK_BLOCKED");
 assert.equal(review.scoped_out_prior_twenty_and_fourteen,true);
 assert.equal(review.reviewed,56);assert.equal(review.records.length,56);
 assert.equal(review.groups.length,9);
 assert.equal(review.groups.reduce((sum,g)=>sum+g.reviewed,0),56);
 assert.equal(new Set(review.records.map(x=>x.catalog_id)).size,56);
 const counts=Object.fromEntries(review.groups.map(g=>[g.key,0]));
 for(const r of review.records){
  const product=index.get(r.catalog_id);
  assert.ok(product);assert.ok(original.has(r.catalog_id));
  assert.ok(!matched.has(r.catalog_id),"Resolved product must not regain pending status");
  assert.ok(!occupied.has(r.catalog_id),"Prior review group must not be double-counted");
  assert.equal(r.product_name,product.name);assert.equal(r.fssr,product.fssr);assert.equal(r.fcs,product.fcs);
  assert.equal(r.exact_finished_article_source_verified,false);
  assert.equal(r.automatic_numeric_limit,false);assert.equal(r.regulatory_sample_pass,false);
  assert.equal(r.complete_regulatory_compliance,false);
  assert.equal(r.review_result,"NAMED_REFERENCE_ONLY_NOT_AN_EXACT_FINISHED_PRODUCT_MATCH");
  assert.ok(r.why_reference_must_not_transfer.length>35);
  assert.ok(r.positive_matrix_proof_required.length>35);
  counts[r.group]=(counts[r.group]||0)+1;
  for(const id of r.source_reference_ids)assert.ok(refs.has(id),id);
 }
 for(const g of review.groups)assert.equal(counts[g.key],g.reviewed);
 assert.equal(review.records.filter(r=>r.product_name==="Analogue in the dairy context").length,8);
 assert.equal(review.records.filter(r=>r.product_name==="Papad").length,2);
});
test("every cross-form reference is a row independently pinned to official 2026 source",()=>{
 assert.equal(review.source_version,core.source_version);
 assert.equal(review.source_url,core.official_sources[0].url);
 assert.equal(refs.size,20);
 const norm=x=>String(x??"").toLowerCase().replace(/[^a-z0-9]+/g,"");
 for(const id of new Set(review.records.flatMap(r=>r.source_reference_ids))){
  const r=refs.get(id);
  assert.ok(r);assert.equal(r.official_source,review.source_url);
  assert.equal(r.automatic_finished_product_application,false);
  assert.equal(r.laboratory_compliance_pass,false);
  if(r.type==="metal"){
   const rows=core.metal_article_rules_v9[r.analyte]||[];
   assert.equal(rows.filter(x=>x.row_type==="exact"&&x.limit===r.limit&&x.unit===r.unit&&
    (norm(x.article)===norm(r.article)||r.id==="lead-packaged-water"&&norm(x.article).startsWith(norm(r.article)))&&
    (r.id!=="lead-milks"||x.condition===r.official_condition)).length,1,r.id);
  }else if(r.type==="pesticide"){
   const rows=(core.residue_mrls?.pesticides||[]).filter(x=>norm(x.name)===norm(r.analyte)).flatMap(x=>x.rows||[]);
   assert.equal(rows.filter(x=>norm(x.food)===norm(r.article)&&Number(x.mrl)===r.limit&&x.unit===r.unit).length,1,r.id);
  }else if(r.type==="crop"){
   const key=id==="aflatoxin-b1-composite"?"aflatoxin_b1":"total_aflatoxins";
   assert.equal((core.crop_contaminants?.[key]?.rules||[]).filter(x=>norm(x.article)===norm(r.article)&&Number(x.limit)===r.limit).length,1);
  }else assert.fail("Unexpected source row family "+r.type);
 }
});
test("live Helper renders only authenticated reviews, never an assigned numerical PASS",async()=>{
 const js=fs.readFileSync(path.join(base,"fssai-source-proof-panels.js"),"utf8");
 const fakeFiles=new Map([
  ["fssai-next121-positive-subtype-proof-2026-10-11.json",initial],
  ["fssai-next29-no-source-proof-dossiers-2026-10-11.json",file("rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json")],
  ["fssai-2026-10-11-cross-form-nontransfer-large-batch.json",review]
 ]);
 const context={contaminantsDb:core,
  sourcePriorityMetalDb:{partial_exact_count:412,pending_first_exact_count:121,unresolved_first_exact_catalog_ids:[...original.keys()]},
  esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"),
  fetch:async url=>{const key=[...fakeFiles.keys()].find(x=>url.includes(x));return key?{ok:true,json:async()=>fakeFiles.get(key)}:{ok:false};}};
 vm.createContext(context);vm.runInContext(js,context);
 await context.pmsvLoadPositiveSourceProof();
 assert.ok(context.pmsvCrossFormNonTransferDb);
 for(const r of review.records){
  const product=index.get(r.catalog_id);
  assert.equal(context.pmsvCrossFormSourceVerified(product),true,r.catalog_id);
  const rendered=context.pmsvCrossFormNonTransferHtml(product);
  assert.match(rendered,/FIRST EXACT-SOURCE STILL PENDING — NOT A COMPLIANCE PASS/);
  assert.match(rendered,/Positive finished-product evidence needed/);
  assert.doesNotMatch(rendered,/sample compliant|sample pass achieved|auto-applied limit/i);
 }
 const corrupted={...index.get(review.records[0].catalog_id),name:"Wrong catalogue identity"};
 assert.equal(context.pmsvCrossFormSourceVerified(corrupted),false);
 const wrongSource={...core,source_version:"Not official"};
 context.contaminantsDb=wrongSource;
 assert.equal(context.pmsvCrossFormSourceVerified(index.get(review.records[0].catalog_id)),false);
 assert.match(context.pmsvCrossFormNonTransferHtml(index.get(review.records[0].catalog_id)),/withheld/);
});
