"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const rows=b56.cases.flatMap(c=>c.gates.map(g=>({
 rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
 case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,gate:g.gate_code,
 evidence:g.required_evidence,dependencies:g.dependency_codes.join(", "),
 routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
 original_request_status:g.immutable_request_state,original_document_status:g.immutable_document_state
})));
assert.equal(rows.length,175);
const document={readyState:"loading",addEventListener(){},getElementById(){return null}};
const window={
 pmsvB58OwnerOutreach:{valid:()=>true,records:()=>rows},
 pmsvB87Catalogue:{closureVerified:()=>true,load:async()=>true,
  closedResearchSummary:()=>({catalogue:533,public_source_desk_research_closed:35,
   public_source_desk_research_open:0,external_legal_and_lot_verification_held:35,
   signed_product_limits:0,validated_lab_lot_pass:0,product_releases:0})}
};
const context=vm.createContext({window,document,console,setTimeout});
const b98=fs.readFileSync(root+"pmsv-batch98-source-authentication-handoff-2026-10-25.js","utf8");
const b99=fs.readFileSync(root+"pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js","utf8");
vm.runInContext(b98,context);vm.runInContext(b99,context);
const review=window.pmsvB99DownstreamAudit,metadata=window.pmsvB98Handoff;
assert(review&&metadata&&review.sourceValid());
(async()=>{
 assert.equal(await review.load(),true);
 const original=review.rows();
 assert.equal(original.length,105);
 assert.equal(new Set(original.map(x=>x.request_id)).size,105);
 for(const role of ["REGULATORY_AFFAIRS_LEGAL","LABORATORY_TECHNICAL_MANAGER",
 "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"])
  assert.equal(original.filter(x=>x.role===role).length,35);
 assert(original.every(x=>x.original_evidence==="NOT_SENT_NOT_RECEIVED"&&
  x.commercial_decision==="HELD_NO_APPROVAL_OR_PASS"));
 assert.equal(review.csv().trim().split("\r\n").length,106);
 const chosen=original[0].case_id;
 const before=original.find(x=>x.case_id===chosen&&x.role==="REGULATORY_AFFAIRS_LEGAL");
 assert.equal(before.blocker,"MANUFACTURER_CONTROLLED_METADATA_MISSING");
 const doc={ref:"MFG-CONTROLLED-1",version:"V1",issue_date:"2026-10-20",
  sha256:"c".repeat(64),origin_check_ref:"EXTERNAL-ISSUER-1"};
 const empty={ref:"",version:"",issue_date:"",sha256:"",origin_check_ref:""};
 const draft={state:"DRAFT_READY",reference:"",date:""};
 const no={state:"NOT_PREPARED",reference:"",date:""};
 const first=metadata.save(chosen,{manufacturer:doc,method:empty,regulatory:draft,laboratory:no});
 assert.equal(first.ok,true);
 const inReview=review.rows().find(x=>x.case_id===chosen&&
  x.role==="REGULATORY_AFFAIRS_LEGAL");
 assert.equal(inReview.blocker,"REGULATORY_HANDOFF_UNAUTHENTICATED");
 assert.equal(inReview.commercial_decision,"HELD_NO_APPROVAL_OR_PASS");
 // Controlled-source revision invalidates the previous independent review draft.
 const second=metadata.save(chosen,{manufacturer:{...doc,version:"V2"},
  method:empty,regulatory:draft,laboratory:no});
 assert.equal(second.ok,true);assert.equal(second.reset,true);
 const stale=review.rows().filter(x=>x.case_id===chosen);
 assert.equal(stale.filter(x=>x.blocker==="SOURCE_REVISION_RESET_REVIEW_REQUIRED").length,2);
 assert.equal(stale.find(x=>x.role==="SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER")
  .blocker,"REPRESENTATIVE_LOT_AND_QA_RELEASE_PROOF_MISSING");
 assert.equal(review.csv().trim().split("\r\n").length,106);
 assert(!review.csv().includes('"PASS"'));
 // Original source tampering fails closed; no claimed evidence receipt.
 rows[0].original_document_status="RECEIVED";
 assert.equal(review.sourceValid(),false);
 assert.equal(review.rows().length,0);
 assert.equal(review.csv(),"");
 rows[0].original_document_status="NOT_RECEIVED";
 assert.equal(review.sourceValid(),true);
 assert(rows.every(x=>x.original_request_status==="NOT_SENT"&&
  x.original_document_status==="NOT_RECEIVED"));
 console.log("Batch99 PASS: 105 original downstream HELD gates, 35 per independent role, source-revision stale review detection, 0 legal/method/lot approvals.");
})().catch(e=>{console.error(e);process.exitCode=1;});
