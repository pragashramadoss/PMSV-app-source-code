"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const data=read("fssai-product-helper-preview-01/data/rules/fssai-batch40-exact-commodity-and-conditional-scope-v1.json");
const pending=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const master=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json");
const contaminant=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const routes=read("fssai-product-helper-preview-01/data/rules/special-regulatory-routes-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const mp=new Map(master.products.map(x=>[x.id,x])),unresolved=new Set(pending.records.map(x=>x.catalog_id));
test("Exactly ten distinct official product/commodity source matches reduce current pending to 136 with 533 identities retained",()=>{
 assert.equal(master.products.length,533);
 assert.equal(data.rows.length,10);assert.equal(data.negative_controls.length,30);
 assert.equal(data.batch_reviewed,40);assert.equal(data.complete_legal_compliance_passes,0);
 assert.equal(pending.count,136);assert.equal(pending.records.length,136);
 assert.equal(pending.pending,136);assert.equal(pending.verified_evidence_added,128);
 assert.equal(pending.current_snapshot_summary_2026_10_10.exact_partial_evidence,397);
 assert.equal(pending.full_compliance_achieved,0);
 const ids=new Set();
 for(const rec of data.rows){
  const p=mp.get(rec.catalog_id);
  assert.ok(p&&p.name===rec.product_name&&p.fssr===rec.fssr&&p.fcs===rec.fcs);
  assert.equal(rec.version_ix_source,data.source);
  assert.equal(rec.exact_catalogue_identity_matched,true);
  assert.equal(rec.version_ix_source_article_confirmed,true);
  assert.equal(rec.source_article_applicability_to_supplied_finished_matrix_unconditionally_established,false);
  assert.equal(rec.finished_product_numeric_limit_auto_applied,false);
  assert.equal(rec.full_pesticide_contaminant_or_amendment_coverage,false);
  assert.equal(rec.legal_compliance_pass,false);
  assert.ok(!ids.has(p.id));ids.add(p.id);
  assert.ok(!unresolved.has(p.id),"Promoted exact source still unresolved "+p.id);
  if(rec.source_family==="milk"){
   const r=routes.routes.find(x=>x.product_id===p.id);
   assert.ok(r&&r.category_code===p.fcs&&r.official_source===rec.identity_source);
   assert.ok(p.fcs.startsWith("18.1.1."));
  }
 }
 assert.equal(ids.size,10);
 const controls=new Set();
 for(const rec of data.negative_controls){
  const p=mp.get(rec.catalog_id);assert.ok(p&&p.name===rec.product_name);
  assert.ok(unresolved.has(rec.catalog_id),"Non-promoted control removed: "+rec.catalog_id);
  assert.equal(rec.source_matched_exact_product_article,false);
  assert.equal(rec.auto_apply_numeric_limit,false);
  assert.equal(rec.finished_product_compliance_pass,false);
  assert.ok(!ids.has(rec.catalog_id)&&!controls.has(rec.catalog_id));
  controls.add(rec.catalog_id);
 }
 assert.equal(controls.size,30);
});
test("Every exact article reference is pinned to loaded official Version IX row, not hand-authored display numbers",()=>{
 for(const rec of data.rows){
  const a=rec.official_FSSAI_article_references;
  assert.ok(a.length>=1);
  for(const x of a){
   if(rec.source_family==="milk"){
    assert.equal(x.group,"Acetamiprid");assert.equal(x.article,"Milk and Milk products");
    assert.equal(x.value,0.02);assert.equal(x.unit,"mg/kg");
    assert.equal((contaminant.residue_mrls.pesticides||[]).filter(y=>y.name==="Acetamiprid")
       .flatMap(y=>y.rows||[]).filter(y=>y.food===x.article&&y.mrl==="0.02").length,1);
   }else if(rec.source_family==="juice"){
    assert.equal(x.group,"Lead");assert.equal(x.value,1);assert.equal(x.unit,"mg/kg");
    const norm=v=>String(v).toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    assert.equal((contaminant.metal_article_rules_v9.Lead||[])
      .filter(y=>y.row_type==="exact"&&norm(y.article)===norm(x.article)
      &&Number(y.limit)===x.value&&y.unit===x.unit).length,1);
   }else if(rec.source_family==="spice"){
    assert.equal(x.article,"Spices/Spice Mix");assert.equal(x.unit,"µg/kg");
    const key=x.group==="Aflatoxin B1"?"aflatoxin_b1":"total_aflatoxins";
    const group=contaminant.crop_contaminants[key];
    assert.ok(group&&group.rules.some(y=>y.article===x.article
      &&Number(y.limit)===x.value&&String(y.unit||group.unit)===x.unit));
   }else if(rec.source_family==="bev"){
    assert.equal(x.group,"Saffrole");assert.equal(x.article,"Non-alcoholic beverages");
    assert.equal(x.value,10);assert.equal(x.unit,"ppm");
    assert.ok(contaminant.naturally_occurring_toxic_substances.saffrole
      .some(y=>y.article===x.article&&y.limit===10&&y.unit==="ppm"));
   }else throw Error("Unexpected batch40 family "+rec.source_family);
  }
 }
});
test("The 533-product audit counts all 10 source matches as partial, not contaminant or finished-food PASS",()=>{
 const audit=read("audit-output/fssai-product-readiness-audit.json");
 assert.equal(audit.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,397);
 for(const row of data.rows){
  const p=audit.products.find(x=>x.id===row.catalog_id);
  assert.ok(p,row.catalog_id);
  assert.equal(p.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
  assert.equal(p.contaminant_evidence_index.exact_batch40_source_evidence_v9.full_compliance_pass,false);
  assert.equal(p.contaminant_evidence_index.exact_batch40_source_evidence_v9.numeric_limit_auto_applied,false);
  assert.equal(p.compliance_decision,"not_established_by_route_evidence");
 }
});
test("Helper refuses modified source limits and wrong product identity",()=>{
 const a=html.indexOf("function sourcePinnedBatch40PartialHtml(p){"),
 b=html.indexOf("function sourcePinnedCompositeOrSoupPartialHtml(p){",a);
 assert.ok(a>=0&&b>a);
 const ctx=vm.createContext({batch40SourceDb:structuredClone(data),contaminantsDb:structuredClone(contaminant),esc:v=>String(v)});
 vm.runInContext(html.slice(a,b),ctx);
 const display=id=>vm.runInContext("sourcePinnedBatch40PartialHtml("+JSON.stringify(mp.get(id))+")",ctx);
 for(const rec of data.rows){
  const result=display(rec.catalog_id);
  assert.match(result,/NOT APPLIED/);assert.match(result,/Not a product-compliance PASS/);
  assert.ok(result.includes(rec.official_FSSAI_article_references[0].group));
 }
 for(const rec of data.negative_controls)assert.equal(display(rec.catalog_id),"","Negative identity inherited source");
 const target=data.rows[0].catalog_id;
 ctx.batch40SourceDb.rows[0].official_FSSAI_article_references[0].value=400;
 assert.match(display(target),/withheld/);
 ctx.batch40SourceDb=structuredClone(data);
 ctx.contaminantsDb.residue_mrls.pesticides.find(x=>x.name==="Acetamiprid").rows
   .find(x=>x.food==="Milk and Milk products").mrl="500";
 assert.match(display(target),/withheld/);
 assert.match(html,/batch40-136/);
});
