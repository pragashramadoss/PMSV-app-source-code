"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const products=read(base+"standard-search-index-v1.json").products;
const official=read(base+"rules/contaminants-v9-core.json");
const manifest=read(base+"rules/contaminants-v9-unresolved-264-review-v1.json");
const four=read(base+"rules/fssai-4-exact-composite-soup-source-evidence-v1.json");
const coconut=read(base+"rules/solvent-extracted-coconut-flour-hexane-exact-v1.json");
const c4=read(base+"rules/chapter-2-4-cereals-v1.json");
const special=read(base+"rules/special-regulatory-routes-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const byId=new Map(products.map(x=>[x.id,x]));
const ids=[...four.matched.map(x=>x.catalog_id),coconut.catalog_id];
test("Exactly five source-backed new partial identities moved from 161 unresolved to 156 historically, now 146, with 533 preserved and no compliance PASS",()=>{
 assert.equal(products.length,533);
 assert.equal(manifest.pending,146);assert.equal(manifest.count,146);
 assert.equal(manifest.verified_evidence_added,118);
 assert.equal(manifest.records.length,146);
 assert.equal(manifest.full_compliance_achieved,0);
 assert.equal(new Set(ids).size,5);
 assert.equal(manifest.current_snapshot_summary_2026_10_10.exact_partial_evidence,387);
 for(const id of ids)assert.ok(!manifest.records.some(x=>x.catalog_id===id),"Partial source not reconciled: "+id);
});
test("Four exact FSSAI composite B1 and finished soup Saffrole articles source-locked by product/FCSR/category and version",()=>{
 assert.equal(four.matched.length,4);
 assert.equal(four.allowed_auto_pass_count,0);
 assert.equal(four.official_source,official.official_sources[0].url);
 for(const x of four.matched){
  const p=byId.get(x.catalog_id);
  assert.ok(p && p.name===x.product_name&&p.fssr===x.fssr&&p.fcs===x.fcs);
  assert.equal(x.finished_product_numeric_limit_auto_applied,false);
  assert.equal(x.other_contaminants_and_pesticides_verified,false);
  assert.equal(x.full_compliance_claim,false);
  if(x.source_group==="aflatoxin_b1"){
   assert.equal(x.article,"Food product containing any of the above mentioned food articles");
   assert.equal(x.limit,10);assert.equal(x.unit,"µg/kg");
   assert.ok(official.crop_contaminants.aflatoxin_b1.rules.some(y=>y.article===x.article&&Number(y.limit)===x.limit));
  }else{
   assert.equal(x.contaminant,"Saffrole");assert.equal(x.article,"Soups and sauces");
   assert.equal(x.limit,10);assert.equal(x.unit,"ppm");
   assert.ok(official.naturally_occurring_toxic_substances.saffrole.some(y=>y.article===x.article&&Number(y.limit)===10));
   assert.match(x.applicability_note,/Dry powder versus reconstituted/);
  }
 }
 assert.deepEqual(four.matched.filter(x=>x.fssr==="").map(x=>x.fcs).sort(),["18.1.2.1","18.1.2.2"]);
 for(const rec of four.matched.filter(x=>x.fssr==="")){
  const route=special.routes.find(y=>y.product_id===rec.catalog_id);
  assert.ok(route&&route.official_source===rec.official_standard_source&&route.category_code===rec.fcs);
 }
 for(const id of four.excluded_ids){assert.ok(byId.has(id));assert.ok(!ids.includes(id))}
});
test("Official solvent extracted coconut flour source is independently exact, different from coconut milk or oil and NOT a pesticide MRL",()=>{
 const p=byId.get(coconut.catalog_id);
 const st=c4.standards.find(s=>s.key==="2.4.13(4)");
 assert.ok(p&&p.name===coconut.product_name&&p.fssr===coconut.fssr&&p.fcs===coconut.fcs);
 assert.equal(st.name,p.name);assert.equal(st.source_url,coconut.official_source_url);
 assert.equal(st.residual_solvent_limits.length,1);
 assert.deepEqual(st.residual_solvent_limits[0],{parameter:"Food-grade hexane",operator:"<=",value:10,unit:"ppm"});
 assert.equal(coconut.chemical_residue,"Food-grade hexane");assert.equal(coconut.max,10);
 assert.equal(coconut.compliance_approval,false);
 assert.equal(coconut.automatic_cross_product_inheritance,false);
 for(const name of coconut.excluded_non_equivalent_foods) assert.ok(products.some(p=>p.name===name));
});
test("Helper display source integrity gates block stale identity, source values and unrelated products",()=>{
 const start=html.indexOf("function sourcePinnedCoconutFlourHexaneHtml(p){");
 const end=html.indexOf("function exactSupplementalResidueReviewHtml(p){",start);
 assert.ok(start>0&&end>start);
 const context=vm.createContext({
  fourCompositeSourcesDb:structuredClone(four),coconutFlourHexaneDb:structuredClone(coconut),
  contaminantsDb:structuredClone(official),esc:x=>String(x)
 });
 vm.runInContext(html.slice(start,end),context);
 const composite=p=>vm.runInContext("sourcePinnedCompositeOrSoupPartialHtml("+JSON.stringify(p)+")",context);
 const flour=p=>vm.runInContext("sourcePinnedCoconutFlourHexaneHtml("+JSON.stringify(p)+")",context);
 for(const x of four.matched){
  const output=composite(byId.get(x.catalog_id));
  assert.match(output,/NOT APPLIED/);assert.match(output,/no compliance PASS/i);
  assert.match(output,new RegExp(x.contaminant));assert.match(output,/10/);
 }
 assert.match(flour(byId.get(coconut.catalog_id)),/Food-grade hexane ≤10 ppm/);
 assert.equal(flour(byId.get("04-04-1-desiccated-coconut")),"");
 assert.equal(composite(byId.get("18-18-1-starch-based-sweets")),"");
 context.fourCompositeSourcesDb.matched[0].limit=100;
 assert.match(composite(byId.get(four.matched[0].catalog_id)),/withheld/i);
 context.coconutFlourHexaneDb.max=100;
 assert.match(flour(byId.get(coconut.catalog_id)),/withheld/i);
 assert.match(html,/contaminants-v9-unresolved-264-review-v1\.json\?v=20261010-nots-146/);
});
test("Generated product readiness audit identifies five partial exact source rows without issuing a finished food compliance PASS",()=>{
 const report=read("audit-output/fssai-product-readiness-audit.json");
 assert.equal(report.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,387);
 for(const id of ids){
  const x=report.products.find(y=>y.id===id);
  assert.ok(x,id);
  assert.equal(x.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
  assert.equal(x.compliance_decision,"not_established_by_route_evidence");
  if(id===coconut.catalog_id)assert.equal(x.contaminant_evidence_index.exact_coconut_flour_residual_hexane.compliance_approval,false);
  else assert.equal(x.contaminant_evidence_index.exact_composite_food_or_soup_source_v9.full_compliance_claim,false);
 }
});
