"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=f=>JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/",f),"utf8"));
const m=read("rules/contaminants-v9-unresolved-264-review-v1.json"),core=read("rules/contaminants-v9-core.json"),catalog=read("standard-search-index-v1.json").products;
const reviewed=m.records.filter(x=>x.conditional_article_branch_matrix_2026_10_11),idMap=new Map(catalog.map(x=>[x.id,x]));
const source="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);
const show=x=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(x)+")",ctx);
test("46 distinct still-unresolved products have source-row and applicability gates; 533=407+126 unchanged",()=>{
 assert.equal(catalog.length,533);assert.equal(m.records.length,126);assert.equal(m.pending,126);assert.equal(m.current_snapshot_summary_2026_10_10.exact_partial_evidence,407);
 assert.equal(reviewed.length,46);assert.equal(new Set(reviewed.map(x=>x.catalog_id)).size,46);assert.equal(m.full_compliance_achieved,0);
 assert.deepEqual(m.conditional_article_branch_review_2026_10_11.product_subgroups,{
  sulphated_ash_sugar_identity:10,fungi_species_and_can:10,canned_as_sold_packaging:12,pulp_and_fruit_identity:7,food_identity_and_ingredient_matrix:7
 });
 for(const p of reviewed){const r=p.conditional_article_branch_matrix_2026_10_11,c=idMap.get(p.catalog_id);assert.ok(c&&p.fssr===c.fssr);
  assert.equal(r.catalog_id,c.id);assert.equal(r.product_name,c.name);assert.equal(r.fssr,c.fssr);assert.equal(r.official_source_url,source);
  assert.equal(r.source_qualifying_questions.length,5);assert.equal(new Set(r.source_qualifying_questions).size,5);
  for(const flag of ["exact_finished_product_eligibility_verified","any_numeric_finished_product_limit_applied","pesticide_mrl_panel_complete","amendments_fully_reconciled","lab_sample_compliance_pass","full_regulatory_compliance_pass"])assert.equal(r[flag],false);
  assert.equal(p.auto_apply_numeric_limit,false);assert.equal(p.unconditional_compliance_pass,false);
 }
});
test("All source numbers and article labels match official FSSAI vIX stored exact rows; no default-row promotion",()=>{
 let count=0;
 for(const p of reviewed)for(const x of p.conditional_article_branch_matrix_2026_10_11.conditional_or_excluded_source_rows){
  const matching=(core.metal_article_rules_v9[x.metal]||[]).filter(z=>z.row_type==="exact"&&norm(z.article)===norm(x.official_named_article)&&Number(z.limit)===x.official_reference_limit&&z.unit===x.unit);
  assert.equal(matching.length,1,p.catalog_id+" "+x.official_named_article);
  assert.equal(x.source_document,source);assert.equal(x.unit,"mg/kg");assert.equal(x.automatically_assigned_as_finished_product_limit,false);
  assert.equal(x.finished_product_compliance_approved,false);assert.ok(x.finished_product_qualification.length>45);
  assert.ok(!/foods not specified/i.test(x.official_named_article),"Generic defaults must not be counted as exact");
  count++;
 }
 assert.equal(count,m.conditional_article_branch_review_2026_10_11.official_named_source_row_references);
 assert.ok(count>=80);
});
test("Sugar sulphated-ash branches remain distinct, dried glucose >1 percent row excluded",()=>{
 const get=n=>reviewed.find(p=>p.product_name===n).conditional_article_branch_matrix_2026_10_11;
 const high=get("Cube Sugar").conditional_or_excluded_source_rows;
 assert.equal(high.length,2);assert.deepEqual(high.map(x=>x.official_reference_limit),[5,0.5]);
 const dried=get("Dried Glucose Syrup").conditional_or_excluded_source_rows;
 assert.equal(dried.length,1);assert.equal(dried[0].official_reference_limit,5);assert.match(dried[0].applicability,/excluded/);
 const fermented=reviewed.find(p=>p.product_name==="Dried fungi");
 assert.equal(fermented.conditional_article_branch_matrix_2026_10_11.conditional_or_excluded_source_rows.length,2);
 const cocoa=reviewed.find(p=>p.product_name==="Cocoa mass or Cocoa/Chocolate Liquor and Cocoa Cake").conditional_article_branch_matrix_2026_10_11;
 assert.ok(cocoa.conditional_or_excluded_source_rows.every(x=>x.applicability==="prohibited_transfer_cocoa_powder_article"));
});
test("Named conditional articles visible ONLY for matching unresolved FSSR product; never presented as PASS",()=>{
 for(const row of reviewed){const p=idMap.get(row.catalog_id),notice=show(p);
  assert.match(notice,/11 October conditional named-article source checks — NOT APPLIED/);
  assert.match(notice,/No automatic numeric PASS/);
  assert.match(notice,/source reference only — NOT APPLIED/);
  assert.doesNotMatch(show({...p,fssr:"changed-standard"}),/conditional named-article source checks/);
 }
 const untouched=catalog.find(p=>!m.records.some(r=>r.catalog_id===p.id));assert.ok(untouched);assert.equal(show(untouched),"");
});
