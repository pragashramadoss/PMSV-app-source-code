"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const dir="fssai-product-helper-preview-01/",rule=dir+"data/rules/";
const r=n=>JSON.parse(fs.readFileSync(rule+n,"utf8"));
const d=r("fssai-current35-sixteen-dossier-gates-batch19-2026-10-14.json");
const b18=r("fssai-current35-identity-quality-gates-batch18-2026-10-14.json");
const b14=r("fssai-current35-adjudication-workbench-batch14-2026-10-13.json");
const queue=r("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=r("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const script=fs.readFileSync(dir+"fssai-current35-sixteen-dossier-gates-batch19-2026-10-14.js","utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const n=ch.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
function ctx(){
 const x={pmsvB18Valid:()=>true,pmsvB16Digest:digest,pmsvB18Data:b18,pmsvB14Data:b14,pmsv35Queue:queue,pmsv498Ledger:ledger,
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"<span>prior</span>",
 pmsvB14Esc:y=>String(y??"").replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]))};
 vm.createContext(x);vm.runInContext(script,x);x.pmsvB19Data=d;return x;
}
test("Baseline 533/498/35 preserved, no new compliance decisions",()=>{
 const c=ctx();assert.equal(c.pmsvB19Valid(),true);
 assert.equal(ledger.records.length,533);assert.equal(ledger.first_source_pending,35);
 for(const k of ["new_exact_source_promotions","contaminant_limit_approvals","lot_passes","full_food_passes"])assert.equal(d.results[k],0);
 assert.equal(d.results.wordpress_changed,false);assert.equal(d.results.canonical_ledger_changed,false);
});
test("All 16 exact original IDs and 64 documentary requirements",()=>{
 const old=b18.covered_24.filter(x=>x.evidence_focus==="EXISTING_B14_SIGNED_SOURCE_ACTION");
 assert.deepEqual(d.cases.map(x=>x.catalog_id),old.map(x=>x.catalog_id));
 assert.equal(d.cases.length,16);assert.equal(new Set(d.cases.map(x=>x.catalog_id)).size,16);
 assert.equal(d.cases.reduce((s,x)=>s+x.document_requests.length,0),64);
 assert(d.cases.every(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING"&&!x.legal_approved&&!x.evidence_received&&!x.lab_pass));
});
test("Current trehalose GMP and 1.5 / 0.05 product quality criteria, not older use ranges",()=>{
 const x=d.cases.find(x=>x.catalog_id==="99-99-1-trehalose");
 assert.match(x.documented_official_identity,/1\.5%/);assert.match(x.documented_official_identity,/0\.05%/);
 assert.match(x.forbidden_automatic_transfer,/superseded/);
 assert.equal(d.retired_trehalose_fixed_food_use_percentages,true);
 assert.equal(d.trehalose_current_use,"GMP EXCEPT INFANT FOOD");
});
test("Cocoa sweetened finished product and dried glucose source non-transfer",()=>{
 const a=d.cases.find(x=>x.catalog_id==="05-05-1-dry-mixtures-of-cocoa-and-sugars");
 const b=d.cases.find(x=>x.catalog_id==="11-11-1-dried-glucose-syrup");
 assert.match(a.documented_official_identity,/7%/);
 assert.match(a.forbidden_automatic_transfer,/cannot automatically/);
 assert.match(b.forbidden_automatic_transfer,/incompatible/);
});
test("Exact product display, fail-closed and CSV export",()=>{
 const c=ctx(),p=b14.cases.find(x=>x.catalog_id==="99-99-1-trehalose");
 assert.match(c.pmsvB19Html({id:p.catalog_id,name:p.product_name,fssr:p.fssr,fcs:p.fcs}),/FIRST EXACT SOURCE PENDING/);
 assert.match(c.pmsvB19Html({id:p.catalog_id,name:"wrong",fssr:p.fssr,fcs:p.fcs}),/identity mismatch/);
 assert.equal(c.pmsvB19Html({id:"not-listed",name:"not listed"}),"");
 assert.equal(c.pmsvB19Csv().trim().split("\r\n").length,17);
 assert.match(c.pmsvB19Workbench(),/64 questions/);
 const altered=structuredClone(d);altered.cases[0].numeric_ctr_limit_applied=true;
 c.pmsvB19Data=altered;assert.equal(c.pmsvB19Valid(),false);
});
test("Script inserted after Batch18 in preview only, future amendment inactive",()=>{
 const h=fs.readFileSync(dir+"index.html","utf8"),n="fssai-current35-sixteen-dossier-gates-batch19-2026-10-14.js";
 assert.equal(h.split(n).length,2);assert(h.indexOf(n)>h.indexOf("fssai-current35-identity-quality-gates-batch18-2026-10-14.js"));
 assert.equal(d.future_amendment_effective,"2026-12-01");assert.equal(d.future_amendment_applied,false);
});
