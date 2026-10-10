"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const master=read(base+"standard-search-index-v1.json");
const evidence=read(base+"rules/fssai-next10-exact-source-candidate-2026-10-10.json");
const review=read(base+"rules/fssai-full-136-identity-applicability-review-2026-10-10.json");
const pending=read(base+"rules/contaminants-v9-unresolved-264-review-v1.json");
const core=read(base+"rules/contaminants-v9-core.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const byId=new Map(master.products.map(x=>[x.id,x]));
const pendingIds=new Set(pending.records.map(x=>x.catalog_id));
const promoted=new Set(evidence.matched.map(x=>x.catalog_id));
test("Complete 136-identity review and 10 new first-source matches reconcile to 407/126 without product compliance",()=>{
 assert.equal(master.products.length,533);
 assert.equal(pending.records.length,126);assert.equal(pending.pending,126);assert.equal(pending.count,126);
 assert.equal(pending.verified_evidence_added,138);assert.equal(pending.full_compliance_achieved,0);
 assert.equal(269+pending.verified_evidence_added+pending.pending,533);
 assert.equal(pending.current_snapshot_summary_2026_10_10.exact_partial_evidence,407);
 assert.equal(review.records.length,136);assert.equal(review.products_individually_reconciled,136);
 assert.equal(review.source_pinned_partial_matches_new,10);
 assert.equal(review.retained_pending_source_gaps,126);
 assert.equal(evidence.matched.length,10);assert.equal(promoted.size,10);
 assert.equal(review.full_contaminant_compliance_passes,0);
 const history=new Set();
 for(const row of review.records){
  const p=byId.get(row.catalog_id);
  assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs,row.catalog_id);
  assert.ok(!history.has(p.id),"Duplicate 136 review identity "+p.id);history.add(p.id);
  assert.equal(row.numeric_limit_auto_applied_to_product,false);
  assert.equal(row.laboratory_sample_pass,false);
  assert.equal(row.finished_product_compliance_pass,false);
  assert.equal(row.legally_cleared_or_exempt,false);
  assert.ok(row.per_product_matrix_or_recipe_step.length>20);
  assert.ok(row.per_product_prohibited_inheritance.length>20);
  assert.equal(row.evidence_disposition,promoted.has(p.id)
   ?"partial_named_article_identity_source_only":"no_first_exact_named_article_yet");
 }
 assert.equal(history.size,136);
 for(const row of evidence.matched){
  const p=byId.get(row.catalog_id);assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs);
  assert.ok(history.has(row.catalog_id)&&!pendingIds.has(row.catalog_id));
  assert.equal(row.exact_catalogue_article_relationship_verified,true);
  assert.equal(row.source_article_fully_applicable_to_all_forms_or_recipes,false);
  assert.equal(row.ready_to_compare_sample_result,false);
  assert.equal(row.finished_product_numeric_pass,false);
  assert.equal(row.pesticide_panel_or_full_metal_panel_completed,false);
  assert.equal(row.current_amendments_fully_reconciled,false);
 }
 for(const id of evidence.negative_example_ids)assert.ok(!promoted.has(id));
 assert.equal(pendingIds.size,126);
 for(const id of pendingIds)assert.ok(history.has(id));
});
test("Version IX source entries for dates, B1 composites and metal article categories require real loaded table rows",()=>{
 const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 for(const r of evidence.matched){
  if(r.article_group==="dried_dates_malathion"){
   assert.equal(r.official_named_article,"Dried fruits");assert.equal(r.source_reference_limit,8);assert.equal(r.source_reference_unit,"mg/kg");
   assert.ok((core.residue_mrls?.pesticides||[]).filter(x=>/^Malathion/.test(x.name))
     .flatMap(x=>x.rows||[]).some(x=>x.food==="Dried fruits"&&Number(x.mrl)===8));
  }else if(r.article_group==="vanilla_dried_spice_lead"||r.article_group==="flavouring_premix_lead_dry_basis"){
   assert.equal(r.source_reference_limit,10);
   assert.ok((core.metal_article_rules_v9?.Lead||[]).some(x=>x.row_type==="exact"&&Number(x.limit)===10
      &&normalize(x.article).startsWith("dehydrated onions dried herbs and spices")
      &&normalize(x.article).includes("flavourings")));
  }else if(r.article_group==="harissa_spice_composite_b1"||r.article_group==="spice_mouth_freshener_composite_b1"){
   assert.equal(r.official_named_article,"Food product containing any of the above mentioned food articles");
   assert.equal(r.source_reference_limit,10);
   assert.ok((core.crop_contaminants?.aflatoxin_b1?.rules||[]).some(x=>x.article===r.official_named_article&&Number(x.limit)===10));
  }else if(r.article_group==="finished_frozen_confection_lead"){
   assert.equal(r.official_named_article,"Ice-cream, iced lollies and similar frozen confections");
   assert.equal(r.source_reference_limit,1);
   assert.ok((core.metal_article_rules_v9?.Lead||[]).some(x=>x.row_type==="exact"
     &&normalize(x.article)===normalize(r.official_named_article)&&Number(x.limit)===1));
  }else if(r.article_group==="instant_tea_lead_dry_basis"){
   assert.equal(r.official_named_article,"Tea");assert.equal(r.source_reference_limit,5);
   assert.ok((core.metal_article_rules_v9?.Lead||[]).some(x=>x.row_type==="exact"&&normalize(x.article)==="tea"&&Number(x.limit)===5));
  }else throw Error("Unexpected source group "+r.article_group);
 }
});
test("Generated 533-product audit includes exact ten partial source records and zero inferred legal approvals",()=>{
 const audit=read("audit-output/fssai-product-readiness-audit.json");
 assert.equal(audit.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,407);
 for(const x of evidence.matched){
  const row=audit.products.find(y=>y.id===x.catalog_id);assert.ok(row,x.catalog_id);
  assert.equal(row.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
  assert.equal(row.contaminant_evidence_index.exact_next10_source_article_v9.automatic_numeric_compliance_pass,false);
  assert.equal(row.contaminant_evidence_index.exact_next10_source_article_v9.full_product_compliance_verified,false);
  assert.equal(row.compliance_decision,"not_established_by_route_evidence");
 }
});
test("PMSV Helper shows new exact-source partial articles only for eligible identities and withholds tampered values",()=>{
 const a=html.indexOf("function sourcePinnedNext10PartialHtml(p){");
 const b=html.indexOf("function sourcePinnedCompositeOrSoupPartialHtml(p){",a);
 assert.ok(a>=0&&b>a);
 const ctx=vm.createContext({next10SourceDb:structuredClone(evidence),contaminantsDb:structuredClone(core),esc:x=>String(x)});
 vm.runInContext(html.slice(a,b),ctx);
 const show=id=>vm.runInContext("sourcePinnedNext10PartialHtml("+JSON.stringify(byId.get(id))+")",ctx);
 for(const x of evidence.matched){
  const output=show(x.catalog_id);
  assert.ok(output.includes("NOT APPLIED"),"Missing NOT APPLIED caveat "+x.catalog_id);
  assert.ok(output.includes("NO FINISHED-PRODUCT COMPLIANCE PASS"),"Missing pass prohibition "+x.catalog_id);
  assert.ok(output.includes(x.parameter),"Missing parameter "+x.catalog_id);
 }
 for(const id of evidence.negative_example_ids)assert.equal(show(id),"","Excluded product inherited a source "+id);
 const dates=byId.get("04-04-1-dates");
 assert.equal(show("04-04-1-date-paste"),"");
 const saved=structuredClone(evidence);
 ctx.next10SourceDb.matched.find(x=>x.catalog_id===dates.id).source_reference_limit=80;
 assert.match(show(dates.id),/withheld/);
 ctx.next10SourceDb=structuredClone(saved);
 const van=byId.get("04-04-1-vanilla-pods");
 ctx.next10SourceDb.matched.find(x=>x.catalog_id===van.id).product_name="Wrong vanilla";
 assert.match(show(van.id),/withheld/);
 ctx.next10SourceDb=structuredClone(saved);
 ctx.contaminantsDb.residue_mrls.pesticides.find(x=>/^Malathion/.test(x.name)).rows
  .find(x=>x.food==="Dried fruits").mrl="80";
 assert.match(show(dates.id),/withheld/);
 assert.match(html,/contaminants-v9-unresolved-264-review-v1\.json\?v=20261010-full136-126/);
});
