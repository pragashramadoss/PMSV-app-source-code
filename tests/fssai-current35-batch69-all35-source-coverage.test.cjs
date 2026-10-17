"use strict";
/* Batch69: fully independent 35-case documentary research coverage audit.
   A research route is NOT a legal signoff, method approval, supplier evidence or release. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const dir="fssai-product-helper-preview-01";
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,"data/rules",name),"utf8"));
const sources={
 B59:"fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json",
 B60:"fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json",
 B62:"fssai-current35-identity-supersession-batch62-2026-10-17.json",
 B63:"fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.json",
 B64:"fssai-current35-vending-children-polyols-batch64-2026-10-17.json",
 B65:"fssai-current35-food-matrix-classification-batch65-2026-10-17.json",
 B66:"fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.json",
 B67:"fssai-current35-six-matrix-evidence-batch67-2026-10-17.json",
 B68:"fssai-current35-remaining12-p1-lead-batch68-2026-10-17.json"
};
const v=Object.fromEntries(Object.entries(sources).map(([k,name])=>[k,read(name)]));
function digest(obj){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(obj)){const n=c.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
const expectedPins=JSON.parse(fs.readFileSync("tests/fssai-batch69-source-pins-2026-10-17.json","utf8"));
for(const [k,expected] of Object.entries(expectedPins)){assert.equal(digest(v[k]),expected,k+" data modified without Batch69 audit refresh");}
for(const k of ["B62","B63","B64","B65","B66","B67","B68"]){
 const text=fs.readFileSync(path.join(dir,sources[k].replace(/\.json$/,".js").replace(/^fssai-current35-(identity-supersession|cocoa-sugar-identity|vending-children-polyols|food-matrix-classification|nutra-ingredient-scope|six-matrix-evidence|remaining12-p1-lead)-/,"fssai-current35-$1-")),"utf8");
 assert(text.includes(expectedPins[k]),k+" source integrity pin absent");
}
const b59=v.B59,t=b59.totals;
assert.equal(t.catalogue,533);assert.equal(t.first_source_conditional,498);
assert.equal(t.open_ctr_cases,35);assert.equal(t.p0,13);assert.equal(t.p1,22);
assert.equal(t.original_five_gate_request_ids,175);assert.equal(t.legally_signed_case_limits,0);
assert.equal(t.lab_validated_lot_passes,0);assert.equal(t.documents_received,0);assert.equal(t.wordpress_changed,false);
assert.equal(b59.cases.length,35);
const baseline=new Map(b59.cases.map(x=>[x.rank,x]));assert.equal(baseline.size,35);
const allIds=new Set();
for(const c of b59.cases){
 assert.equal(c.original_request_ids.length,5);
 for(const id of c.original_request_ids){assert(!allIds.has(id),id);allIds.add(id);}
 for(const k of ["case_signed_legal_applicability","actual_market_material_authenticated","method_and_lab_scope_approved","representative_lot_pass"])assert.equal(c[k],false);
}
assert.equal(allIds.size,175);
const assignments=[
 {batch:"B63",priority:"P0",ranks:[8,9,10,20],req:"original_five_gate_ids",gate:"original_legal_gate",
  checks:["primary_product_identity_gazette_original_fulltext_authenticated","marketplace_product_form_evidenced","signed_operative_ctr_case_limit","selected_lab_scope_for_contaminant_verified","representative_lot_pass","product_released"]},
 {batch:"B64",priority:"P0",ranks:[1,3,21],req:"original_five_gate_ids",gate:"original_legal_gate",
  checks:["actual_manufacturer_article_authenticated","signed_applicable_ctr_limit","method_lab_scope_authenticated","representative_lot_pass","product_released"]},
 {batch:"B65",priority:"P0",ranks:[6,30,33,34],req:"original_five_request_ids",gate:"original_legal_gate",
  checks:["operative_case_ctr_gazette_authenticated","actual_manufacturer_product_confirmed","signed_analyte_commodity_numeric_maximum","lab_scope_and_method_approved","representative_lot_coa_pass","commercial_product_released"]},
 {batch:"B62",priority:"P0",ranks:[7],req:"immutable_five_request_ids",gate:"original_gate",product:"product",
  checks:["signed_ctr_limit_received","manufacturer_bom_received","accredited_lab_scope_verified","lot_pass"]},
 {batch:"B67",priority:"P0",ranks:[31],req:"original_request_ids",gate:"original_legal_gate",
  checks:["identity_verified","operative_case_rule_signed","case_numeric_limit_approved","lab_analyte_matrix_scope_approved","lot_coa_received","lot_pass","case_released"]},
 {batch:"B66",priority:"P1",ranks:[25,26,27,28,29],req:"original_five_gate_ids",gate:"original_ctr_gate_id",
  checks:["actual_named_chemical_or_ingredient_proven","original_current_gazette_commodity_application_authenticated","legal_case_numeric_contaminant_limit_approved","nabl_method_analyte_matrix_scope_verified","actual_lot_coa_received","lot_pass","case_released"]},
 {batch:"B67",priority:"P1",ranks:[2,4,13,16,17],req:"original_request_ids",gate:"original_legal_gate",
  checks:["identity_verified","operative_case_rule_signed","case_numeric_limit_approved","lab_analyte_matrix_scope_approved","lot_coa_received","lot_pass","case_released"]},
 {batch:"B68",priority:"P1",ranks:[5,11,12,14,15,18,19,22,23,24,32,35],req:"original_request_ids",gate:"original_legal_gate",
  checks:["authenticated_as_sold_material","operative_exact_article_legal_signoff","case_specific_numeric_lead_limit_approved","nabl_lead_method_matrix_scope_verified","original_lot_coa_received","lot_pass","case_released"]}
];
const assigned=new Map();
for(const group of assignments){
 const source=new Map(v[group.batch].cases.map(x=>[x.rank,x]));
 assert.equal(source.size,v[group.batch].cases.length);
 for(const rank of group.ranks){
  assert(!assigned.has(rank),"Case assigned multiple primary reviews: "+rank);
  const c=source.get(rank),base=baseline.get(rank);
  assert(c&&base,"Missing case "+rank+" in "+group.batch);
  assert.equal(base.priority,group.priority);
  assert.equal(c.priority,base.priority);
  assert.equal(c[group.product||"product_name"],base.product_name);
  if("analyte" in c)assert.equal(c.analyte,base.analyte);
  if("catalogue_id" in c)assert.equal(c.catalogue_id,base.catalogue_id);
  assert.equal(c[group.gate],base.original_legal_gate);
  assert.deepEqual(c[group.req],base.original_request_ids);
  for(const check of group.checks)assert.equal(c[check],false,group.batch+" #"+rank+": "+check);
  assigned.set(rank,{batch:group.batch,priority:c.priority,product:base.product_name,analyte:base.analyte,
   gate:base.original_legal_gate,original_ids:base.original_request_ids});
 }
}
assert.equal(assigned.size,35);
assert.deepEqual([...assigned.keys()].sort((a,b)=>a-b),[...baseline.keys()].sort((a,b)=>a-b));
assert.equal([...assigned.values()].filter(x=>x.priority==="P0").length,13);
assert.equal([...assigned.values()].filter(x=>x.priority==="P1").length,22);
assert.equal(v.B68.totals.research_routed_all_p1,22);
assert.equal(v.B68.totals.regulatory_approved_p1,0);
const rows=[...assigned].sort(([a],[b])=>a-b).map(([rank,x])=>({
 rank,priority:x.priority,product:x.product,analyte:x.analyte,primary_research_batch:x.batch,
 original_legal_gate:x.gate,original_five_evidence_ids:x.original_ids.join(" | "),
 source_research_status:"RESEARCHED_NOT_APPROVED",identity_proven:false,
 original_operative_case_gazette_signed:false,numeric_contaminant_limit_approved:false,
 nabl_analyte_method_matrix_approved:false,original_lot_coa_received:false,lot_pass:false,release:false
}));
const out="test-artifacts/fssai-batch69";fs.mkdirSync(out,{recursive:true});
const report={kind:"PMSV_BATCH69_ALL35_RESEARCH_COVERAGE_NOT_APPROVAL",as_of:"2026-10-17",source_pins:expectedPins,
 totals:{catalogue:533,conditional_first_source_matches:498,reviewed_not_cleared:35,p0:13,p1:22,
 immutable_original_evidence_requests:175,approved_numeric_limits:0,accredited_method_scope_approvals:0,
 actual_lot_coas:0,product_releases:0},cases:rows};
fs.writeFileSync(path.join(out,"35-research-coverage-no-approval.json"),JSON.stringify(report,null,2)+"\n");
const fields=Object.keys(rows[0]),q=x=>{let v=String(x??"");if(/^\s*[=+\-@]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
fs.writeFileSync(path.join(out,"35-research-coverage-no-approval.csv"),"\uFEFF"+[fields.map(q).join(","),...rows.map(row=>fields.map(k=>q(row[k])).join(","))].join("\r\n")+"\r\n");
console.log("BATCH69_COVERAGE_PASS 35 unique ranks, P0=13/P1=22, immutable 175 source/lab/lot IDs, research NOT approval; reports generated.");
