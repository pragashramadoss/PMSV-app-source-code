"use strict";
/* Batch39: real official analytical method exclusions, not lab or legal pass. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",dir=path.join(base,"data","rules");
const read=x=>JSON.parse(fs.readFileSync(path.join(dir,x),"utf8"));
const d=read("fssai-current35-method-scope-exceptions-batch39-2026-10-16.json");
const prior=read("fssai-current35-analytical-evidence-packets-batch38-2026-10-16.json");
const js=fs.readFileSync(path.join(base,"fssai-current35-method-scope-exceptions-batch39-2026-10-16.js"),"utf8");
const index=fs.readFileSync(path.join(base,"index.html"),"utf8");
function hash(x){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(x)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(js.includes('const pmsvB39Expected="'+hash(d)+'"'));
assert(index.includes('fssai-current35-method-scope-exceptions-batch39-2026-10-16.js?v=20261016-b39'));
assert.equal(d.kind,"PMSV_CURRENT35_ANALYTICAL_METHOD_SCOPE_EXCEPTIONS_BATCH39");
assert.equal(d.deployment,"GITHUB_PAGES_PREVIEW_ONLY");
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,d.counts.exact_ctr_cases_pending,d.counts.screened_analytical_packets],[533,498,35,35]);
assert.deepEqual([d.counts.metal_records,d.counts.other_records,d.counts.specific_exception_records,d.counts.generic_method_validation_records,d.counts.verified_primary_method_cards],[27,8,13,22,5]);
assert.equal(d.counts.method_select_approved,0);assert.equal(d.counts.legal_ctr_approvals,0);
assert.equal(d.counts.lot_laboratory_passes,0);assert.equal(d.counts.wordpress_changed,false);
assert.deepEqual(d.results,{canonical_ledger_unchanged:true,b38_packet_count_retained:35,method_approvals_auto_added:0,legal_scope_pass_auto_added:0,actual_lot_pass_auto_added:0,wordpress_unchanged:true});
assert.equal(d.method_cards.length,5);
assert.equal(new Set(d.method_cards.map(x=>x.id)).size,5);
assert.equal(d.source_provenance.scope_checked,true);
const m=new Map(d.method_cards.map(x=>[x.id,x]));
const f001=m.get("FSSAI_09_001_2024"),f003=m.get("FSSAI_09_003_2024"),f005=m.get("FSSAI_09_005_2024"),f006=m.get("FSSAI_09_006_2024"),f010=m.get("FSSAI_0_010_2023");
assert.equal(f001.documented_approx_capability_mg_per_kg.Lead,0.4);
assert.equal(f001.documented_approx_capability_mg_per_kg.Copper,3);
assert(f001.exclusions.includes("Fat content >=40%"));
assert(f001.exclusions.includes("Milk powder"));
assert.equal(f005.documented_approx_capability_mg_per_kg.Lead,0.04);
assert(f005.matrix_scope.includes("dry matter"));
assert.deepEqual(f006.target_analytes,["Chromium"]);
assert(f006.matrix_scope.includes("nickel and tellurium are internal standards"));
assert(f003.matrix_scope.includes("Ni/Cr/Pb/Cu"));
assert(f010.exclusions.includes("Lead not a listed analyte"));
for(const x of d.method_cards){
 assert.equal(x.source_pdf,d.official_primary_manual);
 assert.equal(x.primary_text_and_page_verified,true);
 assert.equal(x.capability_is_not_verified_lab_loq,true);
 assert.equal(x.automatic_method_assignment,false);
 assert.equal(x.actual_lab_validation_confirmed,false);
}
const original=new Map(prior.evidence_packets.map(x=>[x.catalog_id,x]));
const unique=new Set();let special=0,metals=0;
for(const x of d.case_gates){
 const o=original.get(x.catalog_id);assert(o,x.catalog_id);assert(!unique.has(x.catalog_id));unique.add(x.catalog_id);
 for(const k of ["rank","product_name","fssr","fcs","reviewed_analyte","analyte_family"])assert.equal(x[k],o[k]);
 assert.equal(x.prior_blocker,o.primary_blocker);assert.equal(x.source_ctr_comparator,o.prior_ctr_comparator);
 assert.equal(x.lab_request.length,5);assert(x.check_tags.length>=1);
 assert.equal(x.method_candidate_not_approval,true);
 assert(x.candidate_method_ids_for_manual_check_only.every(id=>m.has(id)&&id!=="FSSAI_09_006_2024"));
 for(const k of ["marketed_matrix_documents_received","legal_article_approved","method_selected_and_validated","measured_quantitative_result_entered","regulatory_pass"])assert.equal(x[k],false);
 if(x.analyte_family==="TRACE_METALS")metals++;
 if(x.focus==="MATRIX_METHOD_EXCEPTION_OR_LEGAL_CATEGORY")special++;
}
assert.equal(unique.size,35);assert.equal(special,13);assert.equal(metals,27);
const cocoa=d.case_gates.find(x=>x.catalog_id.includes("cocoa-mass-or-cocoa"));
const nickel=d.case_gates.find(x=>x.catalog_id.startsWith("11-11-6-polyols"));
const misri=d.case_gates.find(x=>x.catalog_id==="11-11-1-misri");
const colostrum=d.case_gates.find(x=>x.catalog_id.includes("colostrum-and"));
assert(cocoa.check_tags.includes("POTENTIAL_HIGH_FAT"));
assert(nickel.check_tags.includes("NICKEL_INTERNAL_STANDARD_TRAP"));
assert.deepEqual(nickel.candidate_method_ids_for_manual_check_only,["FSSAI_09_003_2024"]);
assert(misri.check_tags.includes("CHROMIUM_SCOPE_NOT_MISRI"));
assert(colostrum.check_tags.includes("DAIRY_LEAD_NOT_MINERAL_PANEL"));
const port=18939,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];page.on("pageerror",x=>errors.push(x.message));
  let opened=false;
  for(let i=0;i<40;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){opened=true;break}
  }catch(_){await sleep(180)}
  assert(opened,"Preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended review is opt-in; verify source chain and zero regulatory approvals.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Core integrity fail-closed");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Extended documentary source integrity must validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB39Valid()),"Batch39 browser integrity failed");
  const stat=await page.evaluate(()=>({products:pmsv498Ledger.records.length,conditional:pmsv498Ledger.partial_exact,pending:pmsv498Ledger.first_source_pending,cases:pmsvB39Data.case_gates.length,special:pmsvB39Data.case_gates.filter(x=>x.focus==="MATRIX_METHOD_EXCEPTION_OR_LEGAL_CATEGORY").length,approvals:pmsvB39Data.counts.method_select_approved}));
  assert.deepEqual(stat,{products:533,conditional:498,pending:35,cases:35,special:13,approvals:0});
  // B42 supersedes the now-unsafe B39 standalone method UI: verify quarantine,
  // while preserving all 35 upstream B39 case/matrix checks and 5 source records.
  assert.equal(await page.locator("#pmsv-b39-method-exceptions").count(),0,
   "Conflicting B39 method-number display must remain quarantined");
  assert.equal(await page.evaluate(()=>pmsvB42Valid()),true,"Corrected method collision guard must validate");
  const safer=page.locator("#pmsv-b42-dual-manual-conflict");
  assert.equal(await safer.locator("[data-pmsv-b42-rows] tr").count(),35);
  assert.equal(await page.evaluate(()=>pmsvB42Data.counts.legally_approved_ctr_articles),0);
  assert.equal(errors.filter(x=>/pmsvB39/.test(x)).length,0,errors.join("\n"));
  console.log("B39 CHROMIUM VERIFIED: 35 method screening cases, 13 exceptions, 5 official methods, 27 metals, 533/498/35, zero PASS",JSON.stringify(stat));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
