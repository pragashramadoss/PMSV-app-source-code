"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/",dir=root+"data/rules/";
const json=n=>JSON.parse(fs.readFileSync(dir+n,"utf8"));
const d=json("fssai-current35-review-readiness-bridge-batch21-2026-10-14.json"),b14=json("fssai-current35-adjudication-workbench-batch14-2026-10-13.json"),
 b17=json("fssai-current35-legal-source-conflicts-batch17-2026-10-14.json"),
 b20=json("fssai-current35-review-draft-source-audit-batch20-2026-10-14.json"),
 ledger=json("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const source=fs.readFileSync(root+"fssai-current35-review-readiness-bridge-batch21-2026-10-14.js","utf8");
function digest(x){const s=JSON.stringify(x);let a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
const forms={},receipts={};let commits=0;
function setup(){
 const ctx={
 pmsvB20Valid:()=>true,pmsvB16Digest:digest,pmsvB17Data:b17,pmsvB14Data:b14,pmsvB20Data:b20,pmsv498Ledger:ledger,
 pmsvLoadPositiveSourceProof:async()=>{},pmsvB20Ensure:()=>{},pmsvB15CommitTransfer:p=>{commits++;return p?.ok===true},
 pmsvB14Read:()=>forms,pmsvB5Read:()=>receipts,
 pmsvB14OfficialUrl:url=>/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(url),
 pmsvB14Esc:y=>String(y??"").replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z])),
 pmsvB20All:()=>b14.cases.map(x=>({id:x.catalog_id,product_name:x.product_name,
 status:forms[x.catalog_id]?"DOCUMENTARY_DRAFT_UNVERIFIED":"NOT_STARTED",issues:[]}))
 };
 vm.createContext(ctx);vm.runInContext(source,ctx);ctx.pmsvB21Data=d;return ctx;
}
test("All 35 canonical IDs and 3+7+1+24 legal-research strata preserved",()=>{
 const c=setup();assert.equal(c.pmsvB21Valid(),true);
 assert.equal(d.cases.length,35);
 assert.deepEqual(d.cases.map(x=>x.catalog_id),b14.cases.map(x=>x.catalog_id));
 assert.equal(d.research_only_prior_conditional,3);assert.equal(d.research_only_previous_seven,7);
 assert.equal(d.research_only_coffee_candidate,1);assert.equal(d.without_additional_named_research,24);
 assert.equal(ledger.records.length,533);assert.equal(ledger.first_source_pending,35);
});
test("Empty browser evidence is NOT STARTED; no false verified PASS",()=>{
 for(const k of Object.keys(forms))delete forms[k];for(const k of Object.keys(receipts))delete receipts[k];
 const c=setup(),a=c.pmsvB21All();assert.equal(a.length,35);
 assert(a.every(x=>x.status==="NOT_STARTED"&&x.receipts===0&&!x.legal_source_approved&&!x.lab_pass));
 assert.equal(c.pmsvB21Stats(a).NOT_STARTED,35);
});
test("Risky packaged-water article rejected for legal-scope challenge",()=>{
 const c=setup(),id="purified-vending-water";
 const f={source_article:"Packaged drinking water",finished_identity:"vended product",analyte:"Lead",
  analytical_basis:"as sold",document_reference:"Record",reviewer:"Independent pending",source_url:"https://fssai.gov.in/pdf"};
 const flags=[{code:"PACKAGED_WATER_NOT_VENDED",level:"ARTICLE_SCOPE_CHALLENGE"}];
 const r=c.pmsvB21Assess(id,f,[true,true,true,true],{id,status:"NEEDS_ARTICLE_CHALLENGE_REVIEW",issues:flags});
 assert.equal(r.status,"ARTICLE_SCOPE_REVIEW_REQUIRED");
 assert.equal(r.issues[0].code,"PACKAGED_WATER_NOT_VENDED");
 assert.equal(r.legal_source_approved,false);
});
test("Unlinked FSSAI homepage flagged for exact CTR document review",()=>{
 const c=setup(),id="99-99-1-trehalose",form={source_article:"Some exact article",finished_identity:"Trehalose",
 analyte:"Lead",analytical_basis:"finished sample",document_reference:"lot",reviewer:"QA",source_url:"https://fssai.gov.in/faq"};
 const row=c.pmsvB21Assess(id,form,[true,true,true,true],{id,status:"DOCUMENTARY_DRAFT_UNVERIFIED",issues:[]});
 assert.equal(row.status,"ARTICLE_SCOPE_REVIEW_REQUIRED");
 assert(row.issues.some(x=>x.code==="OFFICIAL_SOURCE_LINK_NEEDS_CTR_ARTICLE_CHECK"));
});
test("Complete draft is PREPARED, NEVER legally approved or lab PASSED",()=>{
 const c=setup(),id="99-99-1-trehalose",form={source_article:"Independently proposed named article",
 finished_identity:"Food-grade trehalose",analyte:"Lead",analytical_basis:"as sold",document_reference:"Legal memo",
 reviewer:"QA",source_url:d.ctr_source};
 const risk={id,status:"DOCUMENTARY_DRAFT_UNVERIFIED",issues:[]};
 const a=c.pmsvB21Assess(id,form,[true,true,true,true],risk);
 assert.equal(a.status,"REVIEW_PACKET_PREPARED_UNVERIFIED");
 assert.equal(a.documentary_approved,false);assert.equal(a.legal_source_approved,false);assert.equal(a.lab_pass,false);
 const b=c.pmsvB21Assess(id,{...form,reviewer:""},[true,true,true,true],risk);
 assert.equal(b.status,"EVIDENCE_INCOMPLETE");assert(b.missing_fields.includes("reviewer"));
});
test("Fallback is never first-exact-source; no numerical or future FSSAI promotion",()=>{
 const c=setup(),id="99-99-1-trehalose",form={source_article:"Foods not specified",
 finished_identity:"Trehalose",analyte:"Lead",analytical_basis:"solid",document_reference:"Memo",
 reviewer:"Reviewer",source_url:d.ctr_source};
 const risk={id,status:"NEEDS_ARTICLE_CHALLENGE_REVIEW",issues:[{code:"GENERIC_METAL_FALLBACK",level:"NAMED_ARTICLE_PRIORITY"}]};
 assert.equal(c.pmsvB21Assess(id,form,[true,true,true,true],risk).status,"ARTICLE_SCOPE_REVIEW_REQUIRED");
 assert.equal(d.future_amendment_auto_activated,false);assert.equal(d.results.new_numeric_thresholds,0);
 assert.equal(d.results.independent_legal_approvals,0);
});
test("Import triggers refresh; failed import does not claim success",()=>{
 const c=setup();
 assert.equal(c.pmsvB15CommitTransfer({ok:false}),false);
 assert.equal(c.pmsvB15CommitTransfer({ok:true}),true);
 assert.equal(commits>=2,true);
});
test("Safe CSV, prioritization, and preview-only activation",()=>{
 for(const k of Object.keys(forms))delete forms[k];for(const k of Object.keys(receipts))delete receipts[k];
 const c=setup(),all=c.pmsvB21All();
 assert.equal(c.pmsvB21Csv(all).trim().split("\r\n").length,36);
 assert.equal(c.pmsvB21Sorted(all).length,35);
 assert.match(c.pmsvB21DashboardHtml(),/Open evidence/);
 assert.doesNotMatch(c.pmsvB21Csv(all),/free.text.private.notes/i);
 const bad=structuredClone(d);bad.cases[0].numeric_limit_approved=true;c.pmsvB21Data=bad;
 assert.equal(c.pmsvB21Valid(),false);
 const h=fs.readFileSync(root+"index.html","utf8");
 assert.equal(h.split("fssai-current35-review-readiness-bridge-batch21-2026-10-14.js").length,2);
 assert(h.indexOf("fssai-current35-review-readiness-bridge-batch21-2026-10-14.js")>h.indexOf("fssai-current35-review-draft-source-audit-batch20-2026-10-14.js"));
});
