"use strict";
/* Batch82 quick immutable 22 P1 + 110 gate cross-source non-approval verification. */
const assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const read=name=>JSON.parse(fs.readFileSync(root+"data/rules/"+name+".json","utf8"));
const d=read("fssai-batch82-p1-22-original-evidence-desk-2026-10-19");
const b54=read("fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16");
const b56=read("fssai-current35-175-proof-reference-triage-batch56-2026-10-16");
const b59=read("fssai-current35-reference-row-nontransfer-batch59-2026-10-17");
const final=read("fssai-final35-legal-candidate-audit-2026-10-17");
const script=fs.readFileSync(root+"fssai-batch82-p1-original-evidence-desk-2026-10-19.js","utf8");
const html=fs.readFileSync(root+"index.html","utf8");
const digest=o=>{let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(o)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");};
assert.equal(digest(d),"86a20e46b3333653");
assert(script.includes('const PIN="'+digest(d)+'"'));
assert(html.includes("fssai-batch82-p1-original-evidence-desk-2026-10-19.js?v=20261019-b82"));
assert(html.indexOf("p0-original-source-briefs-2026-10-18.js")<html.indexOf("fssai-batch82-p1-original-evidence-desk"));
assert.deepEqual(d.source_digests,{
 b54:digest(b54),b59:digest(b59),final35:digest(final),b56:digest(b56)
});
assert.equal(d.kind,"PMSV_BATCH82_P1_22_CASE_110_ORIGINAL_DOCUMENTARY_EVIDENCE_REVIEW_NO_APPROVAL");
assert.equal(d.assembled_on,"2026-10-19");
assert.equal(d.source_research_as_of,"2026-10-17");
assert.equal(d.environment,"GH_PAGES_FSSAI_PREVIEW_ONLY");
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|XMLHttpRequest)/.test(script));
assert.equal(d.notes.length,4);
assert.deepEqual(d.totals,{
 catalogue:533,conditional_sources:498,original_held_cases:35,p0_unchanged:13,p1_cases:22,
 p1_original_request_ids:110,p0_original_request_ids:65,all_original_request_ids:175,
 published_identity_only:16,unspecified_formulation:6,requested:0,documents_received:0,
 legal_limits_approved:0,laboratory_methods_approved:0,lot_coas:0,releases:0,wordpress_changed:false
});
const prev54=new Map(b54.p1_dossiers.map(c=>[c.catalogue_id,c]));
const prev59=new Map(b59.cases.map(c=>[c.catalogue_id,c]));
const prev56=new Map(b56.cases.map(c=>[c.catalogue_id,c]));
const prevFinal=new Map(final.rows.map(c=>[c.case_id,c]));
let named=0,unspecified=0;const ids=new Set(),cases=new Set(),types={},gates=new Set();
for(const c of d.rows){
 const a=prev54.get(c.case_id),b=prev59.get(c.case_id),z=prev56.get(c.case_id),f=prevFinal.get(c.case_id);
 assert(a&&b&&z&&f,c.case_id);assert.equal(c.priority,"P1");
 assert(!cases.has(c.case_id));cases.add(c.case_id);
 assert.equal(c.rank,a.rank);assert.equal(c.rank,b.rank);assert.equal(c.rank,f.rank);
 assert.equal(c.product,a.product_name);assert.equal(c.product,b.product_name);assert.equal(c.product,f.product);
 assert.equal(c.analyte,a.analyte);assert.equal(c.analyte,f.analyte);
 assert.equal(c.analyte_family,a.analyte_family);
 assert.equal(c.identity_source_class,a.source_evidence.evidence_class);
 assert.equal(c.identity_standard_url,a.source_evidence.source_url);
 assert.equal(c.identity_status,a.identity_status);
 assert.equal(c.identity_research_note,a.source_evidence.summary);
 assert.equal(c.identity_is_only_published_reference,a.source_evidence.primary_product_identity_source_only);
 assert.equal(c.marketed_identity_proof_needed,a.actual_market_identity_and_composition_needed);
 assert.equal(c.legal_scope_nontransfer_reason,a.cTR_comparator_exclusion);
 assert.equal(c.exact_legal_question,f.exact_source_decision_question);
 assert.equal(c.current_research_url,f.official_source_research_URL);
 assert.equal(c.laboratory_matrix_method_proof_needed,a.required_accredited_assay_proof);
 assert.equal(c.source_comparator_is_not_a_case_limit,true);
 assert.equal(c.release,"HELD");assert.equal(c.legal_article_signed,false);
 assert.equal(c.marketed_identity_authenticated,false);assert.equal(c.method_and_nabl_scope_signed,false);
 assert.equal(c.actual_lot_coa_received,false);
 if(c.identity_status==="PUBLISHED_PRODUCT_STANDARD_ONLY_COMMERCIAL_COMPLIANCE_UNVERIFIED")named++;
 else if(c.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED")unspecified++;
 else assert.fail("Unknown identity state");
 types[c.analyte_family]=(types[c.analyte_family]||0)+1;
 assert.equal(c.documentary_requests.length,5);
 for(let i=0;i<5;i++){
  const g=c.documentary_requests[i],aG=a.original_five_documentary_requests[i],zG=z.gates[i];
  assert.equal(g.request_id,aG.request_id);
  assert.equal(g.request_id,zG.request_id);
  assert.equal(g.request_id,b.original_request_ids[i]);
  assert.equal(g.request_id,f.original_documentary_request_IDs.split(" | ")[i]);
  assert.equal(g.owner_role,aG.owner_role);assert.equal(g.required_evidence,aG.evidence_required);
  assert.equal(g.request_state,"NOT_SENT");assert.equal(g.document_state,"NOT_RECEIVED");
  assert.equal(g.authentication_state,"NOT_AUTHENTICATED");
  assert(!ids.has(g.request_id));ids.add(g.request_id);
 }
}
assert.deepEqual([cases.size,ids.size,named,unspecified],[22,110,16,6]);
assert.deepEqual(types,{MYCOTOXINS:3,UNSPECIFIED_RESIDUE:1,TRACE_METALS:15,PESTICIDE_RESIDUES:3});
for(const c of b56.cases)for(const g of c.gates)gates.add(g.request_id);
assert.equal(gates.size,175);assert([...ids].every(id=>gates.has(id)));
assert.equal(new Set([...prev59.keys()].filter(id=>prev59.get(id).priority==="P0")).size,13);
assert.equal(final.totals.regulatory_approvals,0);assert.equal(final.totals.lot_releases,0);
console.log("B82 P1 SOURCE PASS: 22 held products, 110 unique original P1 requests, 16 named identity research + 6 unidentified; 0 documents/sends/approvals/lab CoAs/releases.");
