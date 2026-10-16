"use strict";
/* Batch38: 35 analytical evidence packets, source-manual priority and two future rule locks. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",dir=path.join(base,"data","rules");
const read=x=>JSON.parse(fs.readFileSync(path.join(dir,x),"utf8"));
const d=read("fssai-current35-analytical-evidence-packets-batch38-2026-10-16.json"),
 b26=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json"),
 b37=read("fssai-current35-future-amendment-and-ayurveda-license-batch37-2026-10-16.json");
const js=fs.readFileSync(path.join(base,"fssai-current35-analytical-evidence-packets-batch38-2026-10-16.js"),"utf8"),
 html=fs.readFileSync(path.join(base,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(o)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(js.includes('const pmsvB38Expected="'+digest(d)+'"'));
assert(html.includes("fssai-current35-analytical-evidence-packets-batch38-2026-10-16.js?v=20261016-b38"));
assert.equal(d.kind,"PMSV_CURRENT35_ANALYTICAL_EVIDENCE_READY_PACKETS_BATCH38");
assert.equal(d.as_of,"2026-10-16");
assert.equal(d.deployment,"GITHUB_PAGES_PREVIEW_ONLY");
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,d.counts.exact_ctr_cases_pending,d.counts.packets],[533,498,35,35]);
assert.deepEqual([d.counts.metal,d.counts.mycotoxin,d.counts.pesticide,d.counts.veterinary,d.counts.unspecified_residue],[27,3,3,1,1]);
assert.equal(d.counts.current_ctr_approvals,0);
assert.equal(d.counts.actual_lab_reports_verified,0);
assert.equal(d.counts.lab_compliance_passes,0);
assert.equal(d.counts.wordpress_changed,false);
assert.deepEqual(d.results,{source_ledger_unchanged:true,auto_scope_assignments:0,automatic_numeric_limit_transfers:0,actual_lab_passes:0,wordpress_unchanged:true});
assert.deepEqual(d.legislation_commencements.map(x=>({id:x.id,date:x.commencement,status:x.legal_status_as_of_2026_10_16,primary:x.primary_pdf_text_verified})),[
 {id:"FUTURE_CTR_2026",date:"2026-12-01",status:"PUBLISHED_NOT_IN_FORCE",primary:false},
 {id:"FUTURE_LAB_2027",date:"2027-04-01",status:"PUBLISHED_NOT_IN_FORCE",primary:false}
]);
assert(d.legislation_commencements[1].disposition.includes("not apply those new legal obligations early"));
assert(d.legislation_commencements[1].disposition.includes("routine internal QA"));
assert(d.analysis_method_groups.every(x=>x.official_methods_portal==="https://fssai.gov.in/food-testing/manuals-methods-analysis"));
assert(d.analysis_method_groups.find(x=>x.family==="TRACE_METALS").source_hint.includes("Metals%20and%20Minerals.pdf"));
const refs=new Map(b26.cases.map(x=>[x.catalog_id,x])), seen=new Set();
const family={"Lead":"TRACE_METALS","Copper":"TRACE_METALS","Chromium":"TRACE_METALS","Nickel":"TRACE_METALS","Ochratoxin A":"MYCOTOXINS","Aflatoxins":"MYCOTOXINS","Pesticide MRLs":"PESTICIDE_RESIDUES","Antibiotics":"VETERINARY_DRUG_RESIDUES","Residues":"UNSPECIFIED_RESIDUE"};
const tally={};
for(const x of d.evidence_packets){
 const p=refs.get(x.catalog_id);assert(p,x.catalog_id);assert(!seen.has(x.catalog_id));seen.add(x.catalog_id);
 for(const k of ["rank","product_name","fssr","fcs"])assert.equal(x[k],p[k]);
 assert.equal(x.prior_ctr_comparator,p.reviewed_comparator_article);
 assert.equal(x.reviewed_analyte,p.reviewed_analyte);
 assert.equal(x.primary_blocker,p.primary_blocker);
 assert.equal(x.product_legal_obstacle,p.legal_scope_obstacle);
 assert.equal(x.prior_ctr_pdf_page_zero_based,p.ctr_pdf_page_zero_based);
 assert.equal(x.analyte_family,family[x.reviewed_analyte]);
 assert.equal(x.documentary_requests.length,5);assert.equal(x.required_fields.length,10);
 assert.equal(x.documentary_requests[0],p.specific_document_to_obtain);
 assert(x.documentary_requests[4].includes("traceability")||x.documentary_requests[4].includes("chain of custody"));
 assert(x.required_fields.includes("current_ctr_article_and_basis_signed"));
 assert(x.required_fields.includes("lab_method_version_scope_and_loq"));
 for(const k of ["analysis_result_recorded","marketed_product_documented","exact_ctr_article_signed","method_validated_for_matrix","report_received","regulatory_compliance_pass"])assert.equal(x[k],false);
 tally[x.analyte_family]=(tally[x.analyte_family]||0)+1;
}
assert.equal(seen.size,35);assert.deepEqual(tally,{"TRACE_METALS":27,"MYCOTOXINS":3,"PESTICIDE_RESIDUES":3,"VETERINARY_DRUG_RESIDUES":1,"UNSPECIFIED_RESIDUE":1});
assert.equal(b37.counts.exact_ctr_scope_pending,35);
const port=18938,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];page.on("pageerror",x=>errors.push(x.message));
  let opened=false;
  for(let i=0;i<45;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){opened=true;break}
  }catch(_){await sleep(120)}
  assert(opened,"Preview localhost unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB38Valid()),"Batch38 integrity check failed");
  const state=await page.evaluate(()=>({
   productCount:pmsv498Ledger.records.length,conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,packets:pmsvB38Data.evidence_packets.length,
   metals:pmsvB38Data.evidence_packets.filter(x=>x.analyte_family==="TRACE_METALS").length,
   newPasses:pmsvB38Data.counts.lab_compliance_passes
  }));
  assert.deepEqual(state,{productCount:533,conditional:498,pending:35,packets:35,metals:27,newPasses:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB38Refresh();
  });
  const panel=page.locator("#pmsv-b38-evidence-packets");
  assert.equal(await panel.locator("[data-pmsv-b38-list] tr").count(),35);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b38-family]").selectOption("TRACE_METALS");
  assert.equal(await panel.locator("[data-pmsv-b38-list] tr").count(),27);
  await panel.locator("[data-pmsv-b38-search]").fill("cocoa");
  assert((await panel.locator("[data-pmsv-b38-list] tr").count())>0);
  await panel.locator("[data-pmsv-b38-search]").fill("");
  await panel.locator("[data-pmsv-b38-family]").selectOption("MYCOTOXINS");
  assert.equal(await panel.locator("[data-pmsv-b38-list] tr").count(),3);
  await panel.locator("[data-pmsv-b38-family]").selectOption("PESTICIDE_RESIDUES");
  assert.equal(await panel.locator("[data-pmsv-b38-list] tr").count(),3);
  await panel.locator("[data-pmsv-b38-family]").selectOption("VETERINARY_DRUG_RESIDUES");
  assert.equal(await panel.locator("[data-pmsv-b38-list] tr").count(),1);
  await panel.locator("[data-pmsv-b38-family]").selectOption("UNSPECIFIED_RESIDUE");
  assert.equal(await panel.locator("[data-pmsv-b38-list] tr").count(),1);
  await panel.locator("[data-pmsv-b38-family]").selectOption("ALL");
  await panel.locator("[data-pmsv-b38-search]").fill("Cocoa Beans");
  assert.equal(await panel.locator("[data-pmsv-b38-list] tr").count(),1);
  await panel.locator("[data-pmsv-b38-open]").click();
  const selected=await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue();
  assert.equal(selected,"04-04-2-cocoa-beans");
  assert.equal(errors.filter(x=>/pmsvB38/.test(x)).length,0,errors.join("\n"));
  console.log("B38 CHROMIUM VERIFIED: 35 method evidence packets, 27 metals / 3 mycotoxins / 3 pesticides / 1 veterinary / 1 undefined; Dec-2026 and Apr-2027 locks; 533/498/35, 0 PASS",JSON.stringify(state));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
