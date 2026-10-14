"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/",path=root+"data/rules/";
const get=n=>JSON.parse(fs.readFileSync(path+n,"utf8"));
const d=get("fssai-current35-review-draft-source-audit-batch20-2026-10-14.json");
const b14=get("fssai-current35-adjudication-workbench-batch14-2026-10-13.json");
const b10=get("fssai-current35-default-metals-and-allfoods-batch10-2026-10-13.json");
const queue=get("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=get("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const code=fs.readFileSync(root+"fssai-current35-review-draft-source-audit-batch20-2026-10-14.js","utf8");
function hash(o){let a=0x811c9dc5,b=0x9747b28c;for(let i=0,s=JSON.stringify(o);i<s.length;i++){let v=s.charCodeAt(i);a=Math.imul(a^v,16777619);b=Math.imul(b^v,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
function make(){
 const s={pmsvB19Valid:()=>true,pmsvB16Digest:hash,pmsvB14Data:b14,pmsvB10Data:b10,
 pmsv35Queue:queue,pmsv498Ledger:ledger,pmsvLoadPositiveSourceProof:async()=>{},
 pmsvB14Read:()=>({}),pmsvB5Read:()=>({}),pmsvB14OfficialUrl:url=>/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(url),
 pmsvB14Esc:y=>String(y??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))};
 vm.createContext(s);vm.runInContext(code,s);s.pmsvB20Data=d;return s;
}
test("35 identity-aligned official dossier rows and seven existing default metal references",()=>{
 const s=make();assert.equal(s.pmsvB20Valid(),true);
 assert.equal(d.cases.length,35);assert.equal(d.article_warning_rules.length,13);
 assert.equal(d.official_metal_rows.length,7);
 assert.deepEqual(d.cases.map(x=>x.catalog_id),b14.cases.map(x=>x.catalog_id));
 assert.equal(ledger.records.length,533);assert.equal(ledger.first_source_pending,35);
});
test("No invented source matches, no approved thresholds or laboratory pass",()=>{
 const r=d.results;
 for(const k of ["new_first_exact_matches","new_active_limits","verified_lot_results","full_compliance_passes"])assert.equal(r[k],0);
 assert.equal(r.canonical_ledger_modified,false);assert.equal(r.wordpress_modified,false);
 assert(d.official_metal_rows.every(x=>!x.automatic_limit));
 assert.equal(d.future_amendment_enabled,false);
});
test("Review actual draft: cocoa powder is NOT approved for cocoa mass; vial packaged water is NOT vending",()=>{
 const s=make(),form={source_article:"Cocoa powder",analyte:"Lead",source_url:"https://fssai.gov.in/paper",
 finished_identity:"cocoa mass",analytical_basis:"fat basis unclear",document_reference:"COA-1"};
 const a=s.pmsvB20Analyze("05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake",form,[true,true,true,true]);
 assert.equal(a.status,"NEEDS_ARTICLE_CHALLENGE_REVIEW");
 assert(a.issues.some(x=>x.code==="COCOA_POWDER_NOT_WHOLE_COCOA"));
 const b=s.pmsvB20Analyze("purified-vending-water",{...form,source_article:"Packaged drinking water"},[true,false,false,false]);
 assert(b.issues.some(x=>x.code==="PACKAGED_WATER_NOT_VENDED"));
});
test("General metal fallbacks require priority check; all-foods not exact article and analyte mismatch flagged",()=>{
 const s=make(),f={source_article:"Foods not specified",analyte:"Lead",source_url:"https://fssai.gov.in/CTR",
 finished_identity:"substance",analytical_basis:"finished sample",document_reference:"A1"};
 const a=s.pmsvB20Analyze("99-99-1-trehalose",f,[true,true,true,true]);
 assert(a.issues.some(x=>x.code==="GENERIC_METAL_FALLBACK"));
 const b=s.pmsvB20Analyze("99-99-1-trehalose",{...f,source_article:"All foods",analyte:"Arsenic"},[true,true,true,true]);
 assert(b.issues.some(x=>x.code==="ALL_FOODS_NOT_PRODUCT_ID"));
 assert(b.issues.some(x=>x.code==="ANALYTE_ARTICLE_MISMATCH"));
});
test("Empty and incomplete drafts remain unverified; expired/superseded sources get review flag",()=>{
 const s=make();
 assert.equal(s.pmsvB20Analyze("99-99-1-trehalose",{},[]).status,"NOT_STARTED");
 const w=s.pmsvB20Analyze("99-99-1-trehalose",{source_article:"0.5-20.0 per cent"},[]);
 assert(w.issues.some(x=>x.code==="TREHALOSE_OLD_USE_BANDS"));
 const complete={source_article:"Exact named article",analyte:"Lead",source_url:"https://fssai.gov.in/rule",
 finished_identity:"Documented",analytical_basis:"As sold",document_reference:"Report-1"};
 assert.equal(s.pmsvB20Analyze("99-99-1-trehalose",complete,[true,true,true,true]).status,"DOCUMENTARY_DRAFT_UNVERIFIED");
 assert.equal(s.pmsvB20Analyze("99-99-1-trehalose",complete,[true,true,true,true]).legal_approval,false);
});
test("35 row browser audit CSV, forged JSON rejection and index activation",()=>{
 const s=make();assert.equal(s.pmsvB20All().length,35);
 assert.equal(s.pmsvB20Csv(s.pmsvB20All()).trim().split("\r\n").length,36);
 assert.match(s.pmsvB20Render(),/35-case article-risk audit CSV/);
 const copy=structuredClone(d);copy.cases[0].lot_pass=true;s.pmsvB20Data=copy;
 assert.equal(s.pmsvB20Valid(),false);
 const h=fs.readFileSync(root+"index.html","utf8"),n="fssai-current35-review-draft-source-audit-batch20-2026-10-14.js";
 assert.equal(h.split(n).length,2);
 assert(h.indexOf(n)>h.indexOf("fssai-current35-sixteen-dossier-gates-batch19-2026-10-14.js"));
});
