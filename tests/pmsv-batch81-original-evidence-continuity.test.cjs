"use strict";
/* Batch81 fast gate: authenticate all inherited original evidence IDs and
   research-only dispositions. No browser dependency or legal auto-approval. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root="fssai-product-helper-preview-01";
const dataDir=path.join(root,"data","rules");
const read=name=>JSON.parse(fs.readFileSync(path.join(dataDir,name+".json"),"utf8"));
const js=name=>fs.readFileSync(path.join(root,name+".js"),"utf8");
function digest(v){
 let a=0x811c9dc5,b=0x9747b28c;
 for(const ch of JSON.stringify(v)){const z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pin(scriptName,constant,value){
 assert(js(scriptName).includes('const '+constant+'="'+digest(value)+'"'),
  "Source digest mismatch for "+scriptName);
}
function noApproval(obj,fields,id){
 for(const field of fields)assert.equal(obj[field],false,id+": "+field+" must remain false");
}
const b56=read("fssai-current35-175-proof-reference-triage-batch56-2026-10-16");
const b59=read("fssai-current35-reference-row-nontransfer-batch59-2026-10-17");
const b60=read("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17");
const b54=read("fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16");
const f35=read("fssai-final35-legal-candidate-audit-2026-10-17");
const p0=read("fssai-final35-p0-original-notice-briefs-2026-10-18");
[
 ["fssai-current35-175-proof-reference-triage-batch56-2026-10-16","pmsvB56Expected",b56],
 ["fssai-current35-reference-row-nontransfer-batch59-2026-10-17","pinned",b59],
 ["fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17","expected",b60],
 ["fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16","pmsvB54Expected",b54],
 ["fssai-final35-legal-review-2026-10-18","PIN",f35],
 ["fssai-p0-original-source-briefs-2026-10-18","PIN",p0]
].forEach(x=>pin(...x));
assert.deepEqual(
 [b56.totals.catalogue,b56.totals.conditional_first_source_matches,b56.totals.open_ctr_cases,
  b56.totals.priority_p0,b56.totals.priority_p1,b56.totals.open_evidence_gates,
  b56.totals.received_documents,b56.totals.approved_ctr_articles,b56.totals.lot_passes],
 [533,498,35,13,22,175,0,0,0]);
const original=new Map(),requests=new Set(),p0IDs=new Set(),p1IDs=new Set();
for(const c of b56.cases){
 assert(!original.has(c.catalogue_id),"Duplicate original product");
 original.set(c.catalogue_id,c);
 assert.equal(c.gates.length,5);
 noApproval(c,["current_ctr_limit_signed","actual_market_product_verified","validated_laboratory_method","actual_lot_approved"],c.catalogue_id);
 for(const g of c.gates){
  assert(!requests.has(g.request_id),"Duplicate original gate: "+g.request_id);
  requests.add(g.request_id);
  assert.equal(g.immutable_request_state,"NOT_SENT");
  assert.equal(g.immutable_document_state,"NOT_RECEIVED");
  assert.equal(g.immutable_compliance_state,"NO_APPROVED_LIMIT_METHOD_OR_PASS");
 }
}
assert.equal(original.size,35);assert.equal(requests.size,175);
assert.deepEqual([b59.totals.comparator_research_rows,b59.totals.pending_case_research],[15,20]);
assert.deepEqual([b59.totals.legally_signed_case_limits,b59.totals.lab_validated_lot_passes,b59.totals.documents_received],[0,0,0]);
assert.equal(b59.future_gazette_source.effective_as_of_review,false);
assert.equal(b59.future_gazette_source.commencement_date,"2026-12-01");
const original59=new Set(),researchOnly=new Set(),unselected=new Set();
for(const c of b59.cases){
 const o=original.get(c.catalogue_id);assert(o,"Unknown B59 original "+c.catalogue_id);
 assert(!original59.has(c.catalogue_id));original59.add(c.catalogue_id);
 assert.deepEqual(c.original_request_ids,o.gates.map(g=>g.request_id));
 assert.equal(c.priority,o.priority);assert.equal(c.product_name,o.product_name);
 noApproval(c,["case_signed_legal_applicability","actual_market_material_authenticated",
 "method_and_lab_scope_approved","representative_lot_pass"],c.catalogue_id);
 if(c.reference){
  researchOnly.add(c.catalogue_id);
  noApproval(c.reference,["current_original_gazette_authenticated","exact_as_sold_commodity_applies","case_specific_signed_limit"],c.catalogue_id);
  assert.equal(c.reference.source_url,b59.official_compendium_url);
 }else unselected.add(c.catalogue_id);
}
assert.deepEqual([original59.size,researchOnly.size,unselected.size],[35,15,20]);
assert.equal(b60.totals.covered_existing_immutable_gate_ids,100);
assert.equal(b60.original_gazette_boundary.effective_on_review_date,false);
assert.equal(b60.original_gazette_boundary.commencement,"2026-12-01");
const routed=new Set(),routedRequests=new Set();
for(const c of b60.cases){
 const o=original.get(c.catalogue_id);assert(o);
 assert(unselected.has(c.catalogue_id),"B60 incorrectly reused a B59 source comparator");
 assert(!routed.has(c.catalogue_id));routed.add(c.catalogue_id);
 assert.deepEqual(c.immutable_five_original_request_ids,o.gates.map(g=>g.request_id));
 for(const id of c.immutable_five_original_request_ids){
  assert(!routedRequests.has(id));routedRequests.add(id);
 }
 assert.equal(c.source_review_result,"LEGAL_SCOPE_ROUTING_RESEARCH_ONLY");
 noApproval(c,["exact_case_specific_operative_gazette_verified",
 "exact_marketed_product_or_substance_identity_authenticated",
 "legally_applicable_numeric_maximum_signed","original_method_and_nabl_scope_verified",
 "original_lot_coa_received","case_released"],c.catalogue_id);
}
assert.equal(routed.size,20);assert.equal(routedRequests.size,100);
assert([...unselected].every(id=>routed.has(id)));
const p0cases=new Set();
for(const x of p0.rows){
 const o=original.get(x.case_id);assert(o&&o.priority==="P0");
 assert(!p0cases.has(x.case_id));p0cases.add(x.case_id);
 assert.equal(x.product,o.product_name);assert.equal(x.rank,o.rank);
 assert.equal(x.original_documentary_request_IDs,o.gates.map(g=>g.request_id).join(" | "));
 assert.equal(x.release,"HELD");
 noApproval(x,["exact_case_applicability_signed","method_and_matrix_scope_signed",
  "original_representative_lot_CoA_received"],x.case_id);
 for(const g of o.gates){assert(!p0IDs.has(g.request_id));p0IDs.add(g.request_id);}
}
const p1cases=new Set();
for(const x of b54.p1_dossiers){
 const o=original.get(x.catalogue_id);assert(o&&o.priority==="P1");
 assert(!p1cases.has(x.catalogue_id));p1cases.add(x.catalogue_id);
 assert.equal(x.rank,o.rank);assert.equal(x.product_name,o.product_name);
 assert.deepEqual(x.original_five_documentary_requests.map(g=>g.request_id),o.gates.map(g=>g.request_id));
 noApproval(x,["current_effective_ctr_article_signed","actual_manufacturer_product_verified",
  "analytical_method_approved","actual_lot_pass","current_2026_may_ctr_amendment_in_force",
  "on_or_after_2027_method_rule_applied_as_current"],x.catalogue_id);
 assert.equal(x.legal_limit_assigned_for_case,null);
 for(const g of x.original_five_documentary_requests){
  assert.equal(g.sent,false);assert.equal(g.received,false);assert.equal(g.signed,false);
  assert(!p1IDs.has(g.request_id));p1IDs.add(g.request_id);
 }
}
assert.deepEqual([p0cases.size,p1cases.size,p0IDs.size,p1IDs.size],[13,22,65,110]);
const allResearchIDs=new Set([...p0IDs,...p1IDs]);
assert.equal(allResearchIDs.size,175);
assert([...requests].every(id=>allResearchIDs.has(id)));
assert([...original.keys()].every(id=>p0cases.has(id)||p1cases.has(id)));
assert.equal(f35.rows.length,35);
const finalIDs=new Set();
for(const c of f35.rows){
 const o=original.get(c.case_id);assert(o,"Unknown final research case");
 assert(!finalIDs.has(c.case_id));finalIDs.add(c.case_id);
 assert.equal(c.product,o.product_name);assert.equal(c.priority,o.priority);
 assert.equal(c.original_documentary_request_IDs,o.gates.map(g=>g.request_id).join(" | "));
 assert.equal(c.current_assigned_legal_limit,"NOT_SIGNED");
 assert.equal(c.current_lab_method_scope,"NOT_SIGNED");
 assert.equal(c.actual_lot_CoA,"NOT_RECEIVED");
 assert.equal(c.release,"HELD");
}
assert.equal(finalIDs.size,35);
assert.deepEqual([f35.totals.regulatory_approvals,f35.totals.lab_method_scope_approvals,
 f35.totals.original_lot_coas,f35.totals.lot_releases,
 p0.totals.legal_applicability_signoffs,p0.totals.releases],[0,0,0,0,0,0]);
for(const name of [
 "fssai-current35-source-comparator-nontransfer-batch59-2026-10-17",
 "fssai-current35-remaining20-legal-scope-batch60-2026-10-17",
 "fssai-current35-original-gazette-subjects-batch61-2026-10-17"]){
 const t=fs.readFileSync(path.join("tests",name+".test.cjs"),"utf8");
 assert.equal((t.match(/pmsvB70ExtendedResearch\.request\s*\(/g)||[]).length,1,
  name+": duplicate full-source load call");
}
console.log("B81 FAST ORIGINAL-EVIDENCE PASS: 533/498/35, 15+20 research paths, 13 P0/65 IDs, 22 P1/110 IDs, 175 immutable IDs, 0 approvals/releases, all signed sources held.");
