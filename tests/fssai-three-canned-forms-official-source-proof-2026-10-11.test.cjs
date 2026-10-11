"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),pre="fssai-product-helper-preview-01/",load=x=>JSON.parse(fs.readFileSync(path.join(root,pre,x),"utf8"));
const fssr=load("data/rules/chapter-2-3-fruit-vegetable-v1.json");
const idx=load("data/standard-search-index-v1.json").products;
const data=load("data/rules/fssai-three-canned-finished-subtype-source-proof-2026-10-11.json");
const core=load("data/rules/contaminants-v9-core.json");
const tin=load("data/rules/fssai-v9-tin-conditional-source-matrix-2026-10-11.json");
const js=fs.readFileSync(path.join(root,pre,"fssai-three-canned-subtype-sources.js"),"utf8");
const html=fs.readFileSync(path.join(root,pre,"index.html"),"utf8");
const esc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const ctx=vm.createContext({contaminantsDb:core,esc});vm.runInContext(js,ctx);ctx.pmsvThreeCannedSubtypeDb=data;
const byId=new Map(idx.map(p=>[p.id,p]));
const show=id=>vm.runInContext("sourcePinnedThreeCannedVariantProofHtml("+JSON.stringify(byId.get(id))+")",ctx);
test("Three distinct FSSR Chapter 2.3 product standards expressly include canned, bottled, flexible and aseptic forms",()=>{
 assert.equal(data.records.length,3);
 assert.deepEqual([data.catalogue,data.partial_exact,data.remaining_first_exact,data.new_unconditional_first_source_products,data.full_finished_product_compliance_pass],[533,414,119,0,0]);
 for(const r of data.records){
  const p=byId.get(r.catalog_id),st=fssr.standards.find(x=>x.key===r.fssr);
  assert.ok(p&&st);
  assert.deepEqual([r.product_name,r.fssr,r.fcs],[p.name,p.fssr,p.fcs]);
  assert.ok(st.status==="structured_core");
  assert.equal(r.actual_manufacturer_finished_subtype_proven,false);
  assert.equal(r.first_exact_source_evidence_promoted,false);
  assert.equal(r.finished_product_limit_auto_applied,false);
  assert.equal(r.complete_contaminant_compliance,false);
  assert.equal(r.other_pack_forms.length,3);
 }
});
test("Eight separately named positive canned variants and 16 Lead/Tin numeric source rows agree with actual FSSAI tables",()=>{
 assert.equal(data.number_of_qualified_named_canned_forms,8);
 assert.equal(data.source_metal_rows_for_qualified_forms,16);
 const group=tin.named_source_rows.find(x=>x.id==="TIN_CANNED_FRUIT_GROUP");
 let count=0;
 for(const r of data.records)for(const x of r.subtype_source_rows){
  count++;assert.equal(x.lead_limit,1);assert.equal(x.tin_limit,250);
  assert.equal(x.lead_unit,"mg/kg");assert.equal(x.tin_unit,"mg/kg");
  assert.equal(x.tin_article,group.article);
  assert.equal(x.numeric_limit_auto_applied,false);
  assert.equal(x.requires_both_packaging_and_species_confirmation,true);
  assert.equal(vm.runInContext("pmsvCannedSubtypeSourceMatches("+JSON.stringify(x)+",contaminantsDb)",ctx),true,x.lead_article);
 }
 assert.equal(count,8);
});
test("All three actual Helper product screens show conditional Lead/Tin table without granting a product PASS",()=>{
 assert.match(html,/fssai-three-canned-subtype-sources\.js\?v=20261011-3canned/);
 assert.match(html,/pmsvLoadThreeCannedSubtypeProof/);
 assert.match(html,/sourcePinnedThreeCannedVariantProofHtml\(p\)/);
 for(const r of data.records){
  const out=show(r.catalog_id);
  assert.match(out,/Official FSSAI canned-form source articles/);
  assert.match(out,/NOT APPLIED/);
  assert.match(out,/No completed contaminant or laboratory PASS/);
  assert.match(out,/bottled, flexible and aseptic packs/);
  for(const form of r.subtype_source_rows)assert.ok(out.includes(esc(form.lead_article)));
 }
 assert.equal(show("04-04-2-dried-fungi"),"");
});
test("Changed regulatory limits, product name, or Tin article fails closed, never auto-applies",()=>{
 const id=data.records[0].catalog_id, p=byId.get(id);
 assert.match(show(id),/qualified subtypes/);
 assert.match(vm.runInContext("sourcePinnedThreeCannedVariantProofHtml("+JSON.stringify({...p,name:"Other food"})+")",ctx),/withheld/);
 const old=ctx.contaminantsDb;ctx.contaminantsDb=JSON.parse(JSON.stringify(core));
 const match=ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Canned fruit cocktail");
 assert.ok(match);match.limit=999;
 assert.match(show(id),/withheld/);ctx.contaminantsDb=old;
 const before=ctx.pmsvThreeCannedSubtypeDb;ctx.pmsvThreeCannedSubtypeDb=JSON.parse(JSON.stringify(data));
 ctx.pmsvThreeCannedSubtypeDb.records[1].subtype_source_rows[0].tin_limit=1;
 assert.match(show(id),/withheld/);ctx.pmsvThreeCannedSubtypeDb=before;
});

test("A locally selected subtype shows only a conditional article and never grants an automatic PASS",()=>{
 const id=data.records[0].catalog_id;
 const p=byId.get(id);
 ctx.selectedCatalogProductForContaminants=()=>p;
 ctx.renderProductContaminants=()=>{ctx.renderTriggered=(ctx.renderTriggered||0)+1;};
 assert.match(show(id),/Not yet confirmed/);
 vm.runInContext('pmsvSetCannedSubtypeForCurrentProduct("canned_fruit_cocktail")',ctx);
 const chosen=show(id);
 assert.match(chosen,/Manufacturer-declared matching article only/);
 assert.match(chosen,/NO COMPLIANCE PASS/);
 assert.match(chosen,/Selection is not documentary verification/);
 assert.ok(ctx.renderTriggered>=1);
 const other=data.records[1].catalog_id;
 assert.match(show(other),/Not yet confirmed/);
 vm.runInContext('pmsvSetCannedSubtypeForCurrentProduct("__not_canned__")',ctx);
 assert.match(show(id),/these canned-specific limits have not been assigned/);
 assert.doesNotMatch(show(id),/Manufacturer-declared matching article only/);
 vm.runInContext('pmsvSetCannedSubtypeForCurrentProduct("canned_mangoes")',ctx);
 assert.match(show(id),/Non-canned form/);
});
