"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/",dir=root+"data/rules/";
const read=n=>JSON.parse(fs.readFileSync(dir+n,"utf8"));
const d=read("fssai-current35-identity-quality-gates-batch18-2026-10-14.json");
const b17=read("fssai-current35-legal-source-conflicts-batch17-2026-10-14.json");
const b14=read("fssai-current35-adjudication-workbench-batch14-2026-10-13.json");
const q=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const code=fs.readFileSync(root+"fssai-current35-identity-quality-gates-batch18-2026-10-14.js","utf8");
function digest(obj){const s=JSON.stringify(obj);let a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
function ctx(){
 const s={pmsvB17Valid:()=>true,pmsvB16Digest:digest,pmsvB17Data:b17,pmsvB14Data:b14,pmsv35Queue:q,pmsv498Ledger:ledger,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"",pmsvB14Esc:v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))};
 vm.createContext(s);vm.runInContext(code,s);s.pmsvB18Data=d;return s;
}
test("Canonical 533/498/35 remains intact; full source approval and lot PASS zero",()=>{
 const c=ctx();assert.equal(c.pmsvB18Valid(),true);
 assert.equal(ledger.records.length,533);assert.equal(ledger.first_source_pending,35);
 for(const key of ["new_exact_source_promotions","numeric_ctr_limits_activated","lot_lab_passes","regulatory_passes"])assert.equal(d.results[key],0);
 assert.equal(d.results.canonical_ledger_changed,false);assert.equal(d.results.wordpress_production_changed,false);
});
test("All 24 are actual previous B17 no-candidate cases, eight focus and 16 others",()=>{
 assert.equal(d.covered_24.length,24);assert.equal(d.focus_8.length,8);
 assert.deepEqual(d.covered_24.map(x=>x.catalog_id),b17.all_pending_cases.filter(x=>x.research_state==="NO_SPECIFIC_NEW_CANDIDATE").map(x=>x.catalog_id));
 assert.equal(d.covered_24.filter(x=>x.evidence_focus==="B18_FSSR_IDENTITY_QUALITY_GATES").length,8);
 assert.equal(d.covered_24.filter(x=>x.evidence_focus==="EXISTING_B14_SIGNED_SOURCE_ACTION").length,16);
 for(const row of d.covered_24){assert.equal(row.numeric_limit_assigned,false);assert.equal(row.lab_pass,false);assert.equal(row.regulatory_pass,false);}
});
test("Eight official product definitions do not become metal/toxin or pesticide limits",()=>{
 const by=Object.fromEntries(d.focus_8.map(x=>[x.catalog_id,x]));
 assert.match(by["100-100-silver-leaf-chandi-ka-warq"].positive_fssr_identity_quality,/999\/1000/);
 assert.match(by["04-04-1-catechu-edible"].positive_fssr_identity_quality,/8%/);
 assert.match(by["06-06-2-carob-powder"].distinction_from_ctr,/not a sulphated-ash result/);
 assert.match(by["99-99-7-dietary-fibre-dextrin-soluble-fibre"].positive_fssr_identity_quality,/12–25/);
 assert.match(by["06-06-2-arrowroot"].positive_fssr_identity_quality,/rhizomes/);
 assert.match(by["06-06-2-water-chestnut-flour-singhare-ka-atta"].forbidden_automatic_article_transfer,/atta/);
 assert.match(by["04-04-1-coconut-milk-powder"].positive_fssr_identity_quality,/caseinate/);
 assert.match(by["04-04-2-cocoa-beans"].distinction_from_ctr,/NOT an aflatoxin/);
 assert.equal(d.focus_8.reduce((n,x)=>n+x.proof_requirements.length,0),32);
 for(const x of d.focus_8){
  assert.equal(x.quality_standard_is_ctr_limit,false);assert.equal(x.compliance_pass,false);
  assert.equal(x.numeric_contaminant_limit_assigned,false);
  assert.match(x.official_fssr_pdf,/^https:\/\/(?:www\.)?fssai\.gov\.in\//);
 }
});
test("Fail closed if source data says quality standard is contaminant approval",()=>{
 const c=ctx(),wrong=structuredClone(d);wrong.focus_8[0].quality_standard_is_ctr_limit=true;
 c.pmsvB18Data=wrong;assert.equal(c.pmsvB18Valid(),false);
 c.pmsvB18Data=d;
 const forged=structuredClone(d);forged.covered_24[3].catalog_id="wrong-id";
 c.pmsvB18Data=forged;assert.equal(c.pmsvB18Valid(),false);
});
test("Product panels and CSV export are complete, escaped and source-gated",()=>{
 const c=ctx();const p=b14.cases.find(x=>x.catalog_id==="100-100-silver-leaf-chandi-ka-warq");
 const html=c.pmsvB18Html({id:p.catalog_id,name:p.product_name,fssr:p.fssr,fcs:p.fcs});
 assert.match(html,/FIRST EXACT CONTAMINANT SOURCE STILL PENDING/);
 assert.match(html,/999\/1000/);
 assert.match(c.pmsvB18Html({id:p.catalog_id,name:"False item",fssr:p.fssr,fcs:p.fcs}),/identity mismatch/);
 const csv=c.pmsvB18CsvText();assert.equal(csv.trim().split("\r\n").length,25);
 assert.match(csv,/Silver leaf/i);assert.match(csv,/FIRST_EXACT_SOURCE_PENDING/);
 assert.match(c.pmsvB18MatrixHtml(),/24 pending named-article source worklist/);
});
test("Preview only; Batch18 loads after B17 and does not activate future rule",()=>{
 const html=fs.readFileSync(root+"index.html","utf8"),name="fssai-current35-identity-quality-gates-batch18-2026-10-14.js";
 assert.equal(html.split(name).length,2);assert.ok(html.indexOf(name)>html.indexOf("fssai-current35-legal-source-conflicts-batch17-2026-10-14.js"));
 assert.equal(d.future_ctr_amendment_effective,"2026-12-01");assert.equal(d.future_ctr_amendment_auto_applied,false);
});
