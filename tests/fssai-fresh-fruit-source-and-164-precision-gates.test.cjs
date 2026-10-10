"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const pending=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const from=html.indexOf("function sourcePinnedFreshFruitCommodityEvidence(p){");
const to=html.indexOf("function sourcePinnedDriedFruitMalathion(p){",from);
assert.ok(from>=0&&to>from);
const ctx=vm.createContext({contaminantsDb:db,standardSearchIndexDb:{products:catalogue},esc:x=>String(x)});
vm.runInContext(html.slice(from,to),ctx);
const evidence=p=>vm.runInContext("sourcePinnedFreshFruitCommodityEvidence("+JSON.stringify(p)+")",ctx);
test("Three exact fresh fruit FoSCoS commodities match the current official Fruits pesticide source row without auto-applying MRLs",()=>{
 const x=db.chapter_special_fresh_fruits_pesticide_article_v9;
 assert.equal(x.source_version,db.source_version);
 assert.equal(x.official_source_url,db.official_sources[0].url);
 assert.equal(x.article,"Fruits");assert.equal(x.source_pesticide,"2,4-Dichlorophenoxy Acetic Acid");
 assert.equal(x.source_mrl,"2");assert.equal(x.unit,"mg/kg");
 assert.equal(x.identity_rows.length,3);assert.equal(x.finished_food_mrl_auto_applied,false);
 assert.equal(x.full_compliance_verified,false);assert.equal(x.processing_factor_assessed,false);
 assert.equal(pending.pending,156);assert.equal(pending.verified_evidence_added,108);
 const names=x.identity_rows.map(r=>r.product_name);
 assert.deepEqual(names,["Untreated fresh fruit","Surface-treated fresh fruit","Peeled or cut, minimally processed fruit"]);
 for(const item of x.identity_rows){
  const p=catalogue.find(y=>y.id===item.catalog_id);
  assert.ok(p&&p.name===item.product_name&&p.fcs===item.fcs);
  assert.ok(!pending.records.some(y=>y.catalog_id===p.id));
  const match=evidence(p);assert.ok(match,item.catalog_id);
  assert.equal(match.article,"Fruits");assert.equal(match.pesticide,"2,4-Dichlorophenoxy Acetic Acid");
  assert.equal(match.source_mrl,"2");assert.equal(match.auto_apply,false);
  assert.equal(match.full_compliance_verified,false);
  assert.equal(evidence({...p,name:p.name+" spoof"}),null);
  assert.equal(evidence({...p,fcs:"04.1.2.4"}),null);
 }
});
test("Unrelated frozen, processed and dried foods cannot inherit the Fresh Fruits commodity match",()=>{
 const x=db.chapter_special_fresh_fruits_pesticide_article_v9;
 for(const form of x.excluded_related_forms){
  const p=catalogue.find(z=>z.name===form);assert.ok(p,form);
  assert.equal(evidence(p),null,form);
 }
});
test("Source PDF URL or changed current Fruits MRL row fails closed",()=>{
 const p=catalogue.find(x=>x.id==="04-04-1-untreated-fresh-fruit");
 const tampered=structuredClone(db);
 tampered.residue_mrls.pesticides.find(x=>x.name==="2,4-Dichlorophenoxy Acetic Acid").rows.find(x=>x.food==="Fruits").mrl="50";
 ctx.contaminantsDb=tampered;assert.equal(evidence(p),null);
 const changed=structuredClone(db);
 changed.chapter_special_fresh_fruits_pesticide_article_v9.official_source_url="https://unofficial.example";
 ctx.contaminantsDb=changed;assert.equal(evidence(p),null);
 ctx.contaminantsDb=db;assert.ok(evidence(p));
});
test("All 156 pending identities have individualized non-numeric form, matrix and amendment review gates",()=>{
 assert.equal(pending.records.length,156);
 assert.equal(pending.precision_applicability_review_summary_2026_10_10.pending_individual_reviews,164);
 assert.equal(pending.full_compliance_achieved,0);
 const byId=new Map(catalogue.map(x=>[x.id,x]));
 const ids=new Set();
 for(const row of pending.records){
  assert.ok(!ids.has(row.catalog_id));ids.add(row.catalog_id);
  const p=byId.get(row.catalog_id),v=row.precision_applicability_review_2026_10_10;
  assert.ok(p&&v&&v.catalog_id===p.id&&v.product_name===p.name&&v.fssr===p.fssr&&v.fcs===p.fcs);
  assert.equal(v.source_article_confirmed_unconditionally,false,p.id);
  assert.equal(v.source_candidates_are_review_only,true,p.id);
  assert.equal(v.numeric_limits_automatically_applied,false,p.id);
  assert.equal(v.official_effective_amendments_reconciled,false,p.id);
  assert.equal(v.other_contaminant_residue_coverage_complete,false,p.id);
  assert.ok(v.required_qualification_checks.length>=4,p.id);
  assert.equal(row.auto_apply_numeric_limit,false,p.id);
  assert.equal(row.unconditional_compliance_pass,false,p.id);
 }
});
test("Pending-product UI presents per-product source matrix gates without turning source candidates into compliance values",()=>{
 const a=html.indexOf("function pendingContaminantReviewNotice(p){");
 const b=html.indexOf("function renderProductContaminants(){",a);
 assert.ok(a>0&&b>a);
 const cx=vm.createContext({contaminantsPendingReviewDb:pending,esc:x=>String(x)});
 vm.runInContext(html.slice(a,b),cx);
 const p=catalogue.find(x=>x.id==="05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake");
 const v=vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",cx);
 assert.match(v,/Exact product identity and matrix gates/);
 assert.match(v,/Cocoa powder dry fat-free metal basis/);
 assert.match(v,/No product-specific numerical compliance pass/);
 assert.match(v,/NOT APPLIED/);
 assert.equal(vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(catalogue.find(x=>x.id==="04-04-1-untreated-fresh-fruit"))+")",cx),"");
});
