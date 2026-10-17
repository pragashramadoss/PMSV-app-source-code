"use strict";
/* FINAL35: independent regression on source identity, 175 historical requests,
 * research-only candidate status and zero real regulatory/lot approvals.
 * No network, Playwright, UI or source approval dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const root="fssai-product-helper-preview-01/data/rules/";
const asJSON=name=>JSON.parse(fs.readFileSync(root+name,"utf8"));
const core=asJSON("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const original=asJSON("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json");
const summary=asJSON("fssai-final35-product-disposition-2026-10-17.json");
const legal=asJSON("fssai-final35-legal-candidate-audit-2026-10-17.json");
const rows=legal.rows,baseCases=new Map(core.cases.map(c=>[c.catalogue_id,c]));
const from56=new Map(original.cases.map(c=>[c.catalogue_id,c]));
const fromFinal=new Map(summary.cases.map(c=>[c.case_id,c]));
assert.equal(legal.kind,"PMSV_FINAL35_LEGAL_CANDIDATE_RESEARCH_NOT_APPROVAL");
assert.equal(rows.length,35);assert.equal(baseCases.size,35);assert.equal(from56.size,35);
assert.equal(fromFinal.size,35);
assert.equal(original.totals.preparatory_requests,70);
assert.equal(original.totals.dependent_evidence_gates,105);
assert.equal(original.totals.received_documents,0);
assert.equal(original.totals.approved_ctr_articles,0);
assert.equal(original.totals.lab_method_scope_approved,0);
assert.equal(original.totals.lot_passes,0);
assert.equal(core.totals.legally_signed_case_limits,0);
assert.equal(core.totals.lab_validated_lot_passes,0);
const ids=new Set(),categories=new Map();
let p0=0,p1=0,ready=0,dependent=0,lead=0,identityFound=0,identityMissing=0,unnamed=0;
for(const c of rows){
 const before=baseCases.get(c.case_id),originalCase=from56.get(c.case_id),final=fromFinal.get(c.case_id);
 assert(before&&originalCase&&final,"Unknown original case "+c.case_id);
 assert.equal(c.rank,before.rank);assert.equal(c.rank,originalCase.rank);
 assert.equal(c.product,before.product_name);assert.equal(c.analyte,before.analyte);
 assert.equal(c.priority,before.priority);assert.equal(c.priority,originalCase.priority);
 assert.equal(c.quoted_other_article_only,before.reference?.source_article||"");
 assert.equal(c.release,"HELD");assert.equal(c.current_assigned_legal_limit,"NOT_SIGNED");
 assert.equal(c.current_lab_method_scope,"NOT_SIGNED");
 assert.equal(c.actual_market_material,"NOT_AUTHENTICATED");
 assert.equal(c.actual_lot_CoA,"NOT_RECEIVED");
 assert.equal(c.original_notice_applies_to_actual_finished_product,false);
 assert.equal(c.laboratory_required_method_adoption_status,"UNRESOLVED");
 assert.equal(c.official_2026_lab_original_notification_contents_verified,false);
 assert.equal(c.published_identity_NOT_actual_sold_product_confirmation,true);
 assert.equal(c.current_assigned_legal_limit==="NOT_SIGNED",true);
 assert.equal(final.product_released,"NO");assert.equal(final.lot_PASS,"NO");
 assert.equal(final.signed_current_case_limit,"NOT_VERIFIED");
 if(c.analyte==="Lead"){lead++;assert.equal(c.potential_suitable_ICPMS_Pb_primary_method,"POTENTIAL_BUT_NOT_ADOPTED_FOR_CASE");}
 if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else assert.fail("Invalid case priority");
 if(c.published_named_product_standard_located)identityFound++;else identityMissing++;
 if(!c.published_named_product_standard_located&&
   [21,24,25,26,27,28,29].includes(c.rank))unnamed++;
 categories.set(c.scope_question_type,(categories.get(c.scope_question_type)||0)+1);
 assert.equal(originalCase.gates.length,5);
 let localReady=0,localDependent=0;
 const expected=c.original_documentary_request_IDs.split(" | ");
 assert.deepEqual(expected,before.original_request_ids);
 assert.deepEqual(expected,originalCase.gates.map(g=>g.request_id));
 for(const g of originalCase.gates){
  assert(!ids.has(g.request_id),"Historical request ID reused "+g.request_id);
  ids.add(g.request_id);
  assert.equal(g.immutable_request_state,"NOT_SENT");
  assert.equal(g.immutable_document_state,"NOT_RECEIVED");
  assert.equal(g.immutable_compliance_state,"NO_APPROVED_LIMIT_METHOD_OR_PASS");
  if(g.dependency_codes.length===0){ready++;localReady++;}
  else {dependent++;localDependent++;}
 }
 assert.equal(localReady,2,"Each case must preserve two preparatory requests");
 assert.equal(localDependent,3,"Each case must preserve three dependent requests");
}
assert.equal(p0,13);assert.equal(p1,22);assert.equal(lead,24);
assert.equal(identityFound,28);assert.equal(identityMissing,7);assert.equal(unnamed,7);
assert.equal(ids.size,175);assert.equal(ready,70);assert.equal(dependent,105);
assert.equal(rows.filter(x=>x.quoted_other_article_only!=="").length,15);
const b18=rows.find(x=>x.rank===18),b21=rows.find(x=>x.rank===21);
assert.equal(b18.high_ash_lead_row_incompatible_with_standard_conforming_DGS,true);
assert.equal(b21.sorbitol_nickel_limit_excluded_from_generic_group_by_label,true);
const two=rows.find(x=>x.rank===2),thirtyOne=rows.find(x=>x.rank===31);
assert.equal(two.original_notice_applies_to_actual_finished_product,false);
assert.equal(thirtyOne.original_notice_applies_to_actual_finished_product,false);
assert.equal(rows.filter(x=>x.NSF_application_closed_withdrawn_entries_count!==undefined).length,2);
assert.equal(legal.identity_reference_verification.published_named_product_identity_sources,28);
// Parse the actual downloadable CSV, including quoted delimiters.
const csv=fs.readFileSync(root+"fssai-final35-legal-candidate-audit-2026-10-17.csv","utf8").trimEnd().split(/\r?\n/);
function parse(s){let a=[],v="",quote=false;for(let i=0;i<s.length;i++){
 const c=s[i];if(c==='"'){if(quote&&s[i+1]==='"'){v+='"';i++;}else quote=!quote;}
 else if(c===','&&!quote){a.push(v);v="";}else v+=c;}a.push(v);return a;}
assert.equal(csv.length,36,"CSV must contain exactly 35 unique source rows");
const columns=parse(csv[0]);assert(columns.includes("original_documentary_request_IDs"));
assert(columns.includes("current_assigned_legal_limit"));
const key=Object.fromEntries(columns.map((x,i)=>[x,i]));
for(let i=1;i<csv.length;i++){
 const vals=parse(csv[i]);
 assert.equal(vals.length,columns.length,"Row "+i+" columns mismatch");
 assert.equal(Number(vals[key.rank]),rows[i-1].rank);
 assert.equal(vals[key.case_id],rows[i-1].case_id);
 assert.equal(vals[key.release],"HELD");
 assert.equal(vals[key.current_assigned_legal_limit],"NOT_SIGNED");
 assert.equal(vals[key.original_documentary_request_IDs],rows[i-1].original_documentary_request_IDs);
}
console.log("FINAL35_INTEGRITY_PASS: 35 cases (13/22), 175 unique historical IDs, 70/105 requests, 28 identity sources, 7 class unknowns, 24 lead cases, CSV aligned, zero releases.");
