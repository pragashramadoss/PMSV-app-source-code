"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const catalog=load(base+"standard-search-index-v1.json").products;
const src=load(base+"rules/fssai-nine-sugar-refined-chromium-scope-2026-10-11.json");
const standards=[
  load(base+"rules/chapter-2-8-sweetening-honey-v1.json"),
  load(base+"rules/chapter-2-1-dairy-v1.json")
];
const contaminants=load(base+"rules/contaminants-v9-core.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const from=html.indexOf("function verifiedSugarChromiumSourceScope(p){");
const to=html.indexOf("function verifiedSugarSulphiteReference(p){",from);
assert.ok(from>0&&to>from);
const ctx=vm.createContext({sugarChromiumScopeDb:src,contaminantsDb:contaminants,chapterRuleDbs:standards,
 esc:s=>String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")});
vm.runInContext(html.slice(from,to),ctx);
const verify=p=>vm.runInContext("verifiedSugarChromiumSourceScope("+JSON.stringify(p)+")",ctx);
const show=p=>vm.runInContext("sugarChromiumScopeHtml("+JSON.stringify(p)+")",ctx);
test("Nine distinct Chapter 2.8 or 2.1 sugar identities do not gain an automatic refined-sugar metal limit",()=>{
 assert.equal(catalog.length,533);assert.equal(src.records.length,9);
 assert.equal(new Set(src.records.map(x=>x.catalog_id)).size,9);
 assert.equal(src.promoted_first_exact_finished_product_ctr_identities,0);
 assert.equal(src.full_compliance_passes,0);
 assert.equal(src.refined_input_conditional_products,1);
 assert.equal(src.disallowed_direct_inheritances,8);
 assert.equal(src.chromium_article,"Refined sugar");
 assert.equal(src.chromium_limit,0.02);assert.equal(src.chromium_unit,"mg/kg");
 assert.equal(contaminants.source_version,src.source_version);
 for(const r of src.records){
  const p=catalog.find(p=>p.id===r.catalog_id);assert.ok(p);
  assert.equal(p.name,r.product_name);assert.equal(p.fssr,r.fssr);assert.equal(p.fcs,r.fcs);
  assert.equal(r.refined_sugar_chromium_auto_apply,false);
  assert.equal(r.current_first_exact_ctr_product_evidence,false);
  assert.ok(verify(p),"Authoritative source must reconcile "+p.id);
  const html=show(p);
  assert.match(html,/NOT AUTOMATICALLY APPLIED/);
  assert.match(html,/not an approved finished-product Chromium MRL/);
  assert.match(html,/Zero compliance PASS/);
 }
});
test("Only cube sugar FSSR 2.8.1(5) is manufactured necessarily from refined crystallised sugar",()=>{
 const r=src.records.filter(x=>x.refined_sugar_input_possible);
 assert.equal(r.length,1);
 assert.equal(r[0].catalog_id,"11-11-1-cube-sugar");
 assert.match(r[0].source_record_definition,/manufactured from refined crystallised sugar/i);
 assert.equal(standards[0].standards.find(x=>x.key==="2.8.1(5)").composition.find(x=>x.parameter==="Total ash").value,0.03);
 assert.match(show(catalog.find(x=>x.id===r[0].catalog_id)),/additives/);
 for(const id of ["11-11-1-icing-sugar","11-11-1-plantation-white-sugar","11-11-1-misri","11-11-1-edible-lactose"])
   assert.equal(src.records.find(x=>x.catalog_id===id).refined_sugar_input_possible,false);
});
test("Any source numeric/identity/module drift blocks even conditional display",()=>{
 const p=catalog.find(x=>x.id==="11-11-1-cube-sugar");
 const baseline=ctx.contaminantsDb;
 ctx.contaminantsDb=structuredClone(contaminants);
 ctx.contaminantsDb.metal_article_rules_v9.Chromium.find(x=>x.article==="Refined sugar").limit=0.2;
 assert.equal(verify(p),null);assert.match(show(p),/WITHHELD/);
 ctx.contaminantsDb=baseline;
 const modules=ctx.chapterRuleDbs;
 ctx.chapterRuleDbs=structuredClone(standards);
 ctx.chapterRuleDbs[0].standards.find(x=>x.key==="2.8.1(5)").definition="from raw sugar";
 assert.equal(verify(p),null);
 ctx.chapterRuleDbs=[];
 assert.equal(verify(p),null);
 ctx.chapterRuleDbs=modules;
 assert.equal(verify({...p,fssr:"2.8.1(1)"}),null);
 assert.equal(verify({...p,name:"Icing Sugar"}),null);
 assert.ok(verify(p));
});
test("Audit keeps 412 partial/121 unresolved with all nine sugar Chromium references unpromoted",()=>{
 const report=load("audit-output/fssai-product-readiness-audit.json");
 assert.equal(report.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,412);
 assert.equal(report.summary.counts.chapter_2_8_nine_sugar_chromium_scope_review.cube_refined_input_conditional_not_applied,1);
 assert.equal(report.summary.counts.chapter_2_8_nine_sugar_chromium_scope_review.direct_transfer_excluded,8);
 for(const r of src.records){
  const p=report.products.find(x=>x.id===r.catalog_id);
  assert.notEqual(p.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage",r.catalog_id);
  assert.equal(p.refined_sugar_chromium_scope_review.finished_product_numeric_auto_applied,false);
  assert.equal(p.refined_sugar_chromium_scope_review.first_exact_evidence_claimed,false);
  assert.equal(p.compliance_decision,"not_established_by_route_evidence");
 }
 const ledger=load("audit-output/fssai-live-first-source-ledger-533.json");
 assert.equal(ledger.partial_first_source_evidence,412);
 assert.equal(ledger.unresolved_first_source_gaps,121);
});


test("Dried Glucose Syrup FSSR sulphated ash <=1% excludes conditional Lead 5 mg/kg article requiring >1%",()=>{
 const row=src.records.find(x=>x.catalog_id==="11-11-1-dried-glucose-syrup");
 const p=catalog.find(x=>x.id===row.catalog_id),q=row.conditional_lead_5_mg_ash_exclusion;
 assert.ok(q);
 assert.equal(q.sulphated_ash_fssr_max_pct,1);
 assert.equal(q.conditional_ctr_article_min_pct_strictly_greater_than,1);
 assert.equal(q.conditional_lead_limit_mgkg,5);
 assert.equal(q.source_article_condition_mathematically_excluded_by_standard,true);
 assert.equal(q.finished_product_lead_mrl_auto_assigned,false);
 assert.equal(q.no_universal_lead_exemption_asserted,true);
 const st=standards[0].standards.find(x=>x.key==="2.8.7");
 assert.ok(st.composition.some(x=>x.parameter==="Sulphated ash"
   &&x.operator==="<="&&x.value===1&&x.unit==="% by weight"));
 assert.ok(contaminants.metal_article_rules_v9.Lead.some(x=>x.article===q.conditional_ctr_named_article
   &&x.limit===5&&x.unit==="mg/kg"));
 assert.ok(verify(p));
 assert.match(show(p),/Lead 5 mg\/kg source article EXCLUDED by ash threshold/);
 assert.match(show(p),/No automatic lead assignment or universal lead exemption/);
});
test("Wrong FSSR ash, changed Lead article source, or missing conditional exclusion fails closed",()=>{
 const p=catalog.find(x=>x.id==="11-11-1-dried-glucose-syrup");
 const original=ctx.chapterRuleDbs,metal=ctx.contaminantsDb,sugar=ctx.sugarChromiumScopeDb;
 ctx.chapterRuleDbs=structuredClone(standards);
 ctx.chapterRuleDbs[0].standards.find(x=>x.key==="2.8.7").composition.find(x=>x.parameter==="Sulphated ash").value=1.2;
 assert.equal(verify(p),null);assert.match(show(p),/WITHHELD/);
 ctx.chapterRuleDbs=original;
 ctx.contaminantsDb=structuredClone(contaminants);
 ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article===src.records.find(x=>x.catalog_id===p.id).conditional_lead_5_mg_ash_exclusion.conditional_ctr_named_article).limit=99;
 assert.equal(verify(p),null);
 ctx.contaminantsDb=metal;
 ctx.sugarChromiumScopeDb=structuredClone(src);
 delete ctx.sugarChromiumScopeDb.records.find(x=>x.catalog_id===p.id).conditional_lead_5_mg_ash_exclusion;
 assert.equal(verify(p),null);
 ctx.sugarChromiumScopeDb=sugar;
 assert.ok(verify(p));
});
test("Dried glucose Lead threshold review is an exclusion, not a contaminant clearance",()=>{
 const a=load("audit-output/fssai-product-readiness-audit.json");
 const row=a.products.find(x=>x.id==="11-11-1-dried-glucose-syrup");
 assert.equal(row.refined_sugar_chromium_scope_review.dried_glucose_conditional_lead_ash_exclusion.article_limit,5);
 assert.equal(row.refined_sugar_chromium_scope_review.dried_glucose_conditional_lead_ash_exclusion.fssr_sulphated_ash_max_pct,1);
 assert.equal(row.refined_sugar_chromium_scope_review.dried_glucose_conditional_lead_ash_exclusion.auto_apply,false);
 assert.equal(a.summary.counts.chapter_2_8_dried_glucose_sulphated_ash_lead["5_mgkg_conditional_article_excluded_by_fssr_1pct_max"],1);
 assert.notEqual(row.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
 assert.equal(row.compliance_decision,"not_established_by_route_evidence");
});
