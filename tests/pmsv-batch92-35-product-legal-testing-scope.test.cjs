"use strict";
const a=require("node:assert/strict"),fs=require("node:fs");
const obj=JSON.parse(fs.readFileSync("fssai-product-helper-preview-01/data/rules/pmsv-final35-legal-test-scope-review-batch92-2026-10-20.json","utf8"));
const b=JSON.parse(fs.readFileSync("fssai-product-helper-preview-01/data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json","utf8"));
const m=new Map(b.cases.map(x=>[x.case_id,x]));
a.equal(obj.records.length,35);a.equal(obj.totals.original_documentary_requests,175);
const ids=new Set(),proof=new Set();
for(const x of obj.records){const p=m.get(x.catalogue_id);a(p);a.equal(p.product,x.product);a.equal(p.analyte,x.analyte);a.equal(x.source_desk_review,"CLOSED_2026_10_20");a(!ids.has(x.catalogue_id));ids.add(x.catalogue_id);a.equal(x.original_evidence_request_ids.length,5);for(const id of x.original_evidence_request_ids){a(!proof.has(id));proof.add(id)}a.equal(x.current_product_applicable_numeric_limit,"NOT_SIGNED");a.equal(x.valid_lab_method_and_scope,"NOT_SIGNED");a.equal(x.representative_lot_coa,"NOT_RECEIVED");a.equal(x.lot_regulatory_PASS,"NOT_DETERMINED");a.equal(x.QA_lot_release,"HELD");a.equal(x.product_approval,"NO");a(x.product_specific_lab_method_requirements.length>25);a(x.product_specific_legal_applicability_decision.length>25);}
a.equal(proof.size,175);a.equal(ids.size,35);
a.deepEqual([obj.totals.signed_product_legal_limits,obj.totals.approved_lab_methods,obj.totals.actual_lot_COAs,obj.totals.lot_PASS,obj.totals.released_lots],[0,0,0,0,0]);
console.log("Batch92 PASS: 35 product-specific scopes, 175 IDs, legal testing & QA approval all HELD.");
