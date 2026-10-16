"use strict";
/* B42: catch FSSAI-hosted duplicate 09.xxx:2024 method identities and sanitise legacy 140 request export. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",dir=path.join(base,"data","rules");
const load=n=>JSON.parse(fs.readFileSync(path.join(dir,n),"utf8"));
const d=load("fssai-current35-dual-manual-method-conflict-batch42-2026-10-16.json");
const b39=load("fssai-current35-method-scope-exceptions-batch39-2026-10-16.json");
const b41=load("fssai-current35-evidence-intake-handoff-batch41-2026-10-16.json");
const ui=fs.readFileSync(path.join(base,"fssai-current35-dual-manual-method-conflict-batch42-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
function digest(obj){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(obj)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(ui.includes('const pmsvB42Expected="'+digest(d)+'"'));
assert(html.includes('fssai-current35-dual-manual-method-conflict-batch42-2026-10-16.js?v=20261016-b42'));
assert.equal(d.schema_version,"1.0");
assert.equal(d.kind,"PMSV_CURRENT35_DUAL_OFFICIAL_TRACE_MANUAL_COLLISION_B42");
assert.equal(d.as_of,"2026-10-16");
assert.equal(d.environment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.research_disposition,"MANUAL_METHOD_IDENTITY_CONFLICT_NOT_A_FINAL_METHOD_SELECTION");
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,d.counts.exact_ctr_cases_pending,
 d.counts.method_ids_colliding_across_official_hosted_manuals,d.counts.additional_trace_only_method_numbers,
 d.counts.trace_metals_on_method_version_hold,d.counts.other_cases_on_compound_matrix_evidence_hold,
 d.counts.all_cases_touched,d.counts.linked_document_requests,d.counts.lab_request_rows_sanitized_on_export],
 [533,498,35,7,3,27,8,35,140,35]);
assert.equal(d.counts.source_manually_selected_or_superseded,false);
assert.equal(d.counts.legally_approved_ctr_articles,0);
assert.equal(d.counts.real_laboratory_lot_passes,0);
assert.equal(d.counts.wordpress_changed,false);
assert.deepEqual(d.results,{master_ledger_unchanged:true,existing_batch39_41_sources_preserved:true,
 source_competition_unresolved:true,csv_method_footnotes_required:true,
 no_unqualified_method_id_in_exported_requests:true,zero_current_ctr_approvals:true,
 no_regulatory_pass:true,wordpress_unchanged:true});
assert.equal(d.source_evidence.length,3);
const old="https://fssai.gov.in/upload/uploadfiles/files/MANUAL_FOR_ANALYSIS_OF_METALS_dt_18_04_2024.pdf";
const newer="https://www.fssai.gov.in/upload/uploadfiles/files/Manual%20of%20Methods%20of%20Analysis%20of%20Foods-%20Metals%20and%20Minerals.pdf";
assert.equal(d.source_evidence[0].url,old);assert.equal(d.source_evidence[1].url,newer);
assert.equal(d.source_evidence[0].pdf_page_count,61);
assert.equal(d.source_evidence[1].pdf_page_count,52);
assert.equal(d.conflict_method_cards.length,7);
assert.equal(d.one_sided_trace_method_cards.length,3);
for(let i=0;i<7;i++){
 const x=d.conflict_method_cards[i];
 assert.equal(x.method_number,"FSSAI 09."+String(i+1).padStart(3,"0")+":2024");
 assert.equal(x.trace_elements_manual.url,old);
 assert.equal(x.metals_and_minerals_manual.url,newer);
 assert.notEqual(x.trace_elements_manual.title,x.metals_and_minerals_manual.title);
 assert.equal(x.method_identity_consistent_across_manuals,false);
 assert.equal(x.source_priority_established,false);
 assert.equal(x.allow_method_number_only,false);
 assert.equal(x.require_full_pdf_title_method_title_version_scope_and_lab_confirmation,true);
}
assert.match(d.conflict_method_cards[0].trace_elements_manual.title,/AAS/);
assert.match(d.conflict_method_cards[0].metals_and_minerals_manual.title,/ICP-OES/);
assert.match(d.conflict_method_cards[2].trace_elements_manual.title,/food/i);
assert.match(d.conflict_method_cards[2].metals_and_minerals_manual.title,/water/i);
assert.match(d.conflict_method_cards[4].trace_elements_manual.title,/Pb/);
assert.match(d.conflict_method_cards[4].metals_and_minerals_manual.title,/Cr/);
assert.deepEqual(d.one_sided_trace_method_cards.map(x=>x.method_number),
 ["FSSAI 09.008:2024","FSSAI 09.009:2024","FSSAI 09.010:2024"]);
const methods=new Map(b39.case_gates.map(x=>[x.catalog_id,x]));
const requests=new Map(b41.packets.map(x=>[x.catalogue_id,x]));
assert.equal(methods.size,35);assert.equal(requests.size,35);assert.equal(b41.requests.length,140);
let metals=0,others=0;
const unique=new Set();
for(const x of d.product_method_holds){
 const m=methods.get(x.catalog_id),p=requests.get(x.catalog_id);
 assert(m&&p,x.catalog_id);assert(!unique.has(x.catalog_id));unique.add(x.catalog_id);
 assert.equal(x.rank,m.rank);assert.equal(x.product_name,p.product_name);
 assert.equal(x.analyte,m.reviewed_analyte);
 assert.equal(x.analyte_family,m.analyte_family);
 assert.deepEqual(x.previously_suggested_manual_codes,m.candidate_method_ids_for_manual_check_only);
 assert.deepEqual(x.four_request_ids,p.workstreams.map(x=>x.request_id));
 assert.equal(x.manual_version_confirmed,false);
 assert.equal(x.applicable_manual_adoption_order_verified,false);
 assert.equal(x.laboratory_method_and_scope_verified,false);
 assert.equal(x.commercial_sample_tested,false);
 assert.equal(x.legal_ctr_article_pass,false);
 if(x.analyte_family==="TRACE_METALS"){
  metals++;assert.equal(x.hold,"MANUAL_METHOD_NUMBER_CONFLICT_HOLD");
 }else{others++;assert.equal(x.hold,"MATRIX_AND_COMPOUND_DOCUMENTARY_HOLD")}
}
assert.equal(unique.size,35);assert.equal(metals,27);assert.equal(others,8);
assert.equal(b39.method_cards.length,5);
const port=18942,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const wait=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const context=await browser.newContext({acceptDownloads:true,permissions:["clipboard-read","clipboard-write"]});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let opened=false;
  for(let i=0;i<45;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){opened=true;break}
  }catch(_){await wait(130)}
  assert(opened,"Preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB42Valid()),"Batch42 source identity checksum not valid");
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB42Refresh()});
  const panel=page.locator("#pmsv-b42-dual-manual-conflict");
  assert.equal(await panel.locator("[data-pmsv-b42-rows] tr").count(),35);
  assert.equal(await page.locator("#pmsv-b39-method-exceptions").count(),0,
   "Old contradictory methods panel should be quarantined");
  assert.equal(await panel.locator("details").first().locator("tbody tr").count(),7);
  await panel.locator("[data-pmsv-b42-view]").selectOption("METALS");
  assert.equal(await panel.locator("[data-pmsv-b42-rows] tr").count(),27);
  await panel.locator("[data-pmsv-b42-view]").selectOption("OTHER");
  assert.equal(await panel.locator("[data-pmsv-b42-rows] tr").count(),8);
  await panel.locator("[data-pmsv-b42-view]").selectOption("ALL");
  await panel.locator("[data-pmsv-b42-search]").fill("cocoa mass");
  assert.equal(await panel.locator("[data-pmsv-b42-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b42-search]").fill("");
  const b41panel=page.locator("#pmsv-b41-documentary-handoff");
  assert.equal(await b41panel.locator("[data-pmsv-b41-rows] tr").count(),140);
  await b41panel.locator("summary").first().click();
  const oldBefore=await page.evaluate(()=>pmsvB41Data.requests
   .filter(x=>x.workstream==="LAB_METHOD_AND_SCOPE"&&x.method_candidate_or_validation_note.includes("FSSAI_09_")).length);
  assert(oldBefore>0,"Historical method codes should exist to prove sanitizer really operates");
  const filtered=await page.evaluate(()=>{
   const old=pmsvB41Data.requests[0];
   return {originalHasLegacy:pmsvB41Data.requests.some(x=>/FSSAI_09_/.test(x.method_candidate_or_validation_note)),
    csv:pmsvB41CSV(pmsvB41Data.requests)};
  });
  assert(filtered.originalHasLegacy);
  assert(!/FSSAI_09_\d{3}_2024|\b09\.00\d(?:\:2024)?\b/.test(filtered.csv),
   "CSV must not carry an unqualified method number");
  assert(filtered.csv.includes("UNRESOLVED FSSAI 2024 METHOD-NUMBER COLLISION"));
  assert.equal(filtered.csv.trim().split(/\r?\n/).length,141);
  const dlPromise=page.waitForEvent("download");
  await b41panel.locator('[data-pmsv-b41-export="ALL"]').click();
  const download=await dlPromise;
  const csv=fs.readFileSync(await download.path(),"utf8");
  assert.equal(csv.trim().split(/\r?\n/).length,141);
  assert(!/FSSAI_09_\d{3}_2024|\b09\.00\d\b/.test(csv));
  assert(csv.includes("UNRESOLVED FSSAI 2024 METHOD-NUMBER COLLISION"));
  await b41panel.locator("[data-pmsv-b41-stream]").selectOption("LAB_METHOD_AND_SCOPE");
  await b41panel.locator("[data-pmsv-b41-query]").fill("cocoa mass");
  assert.equal(await b41panel.locator("[data-pmsv-b41-rows] tr").count(),1);
  await b41panel.locator("[data-pmsv-b41-show]").first().click();
  const selected=await page.evaluate(()=>pmsvB41RequestText(pmsvB41Filtered()[0]));
  assert(selected.includes("METHOD IDENTITY ON HOLD"));
  assert(!selected.includes("FSSAI_09_001_2024"));
  const stats=await page.evaluate(()=>({
   products:pmsv498Ledger.records.length,conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   metalHold:pmsvB42Data.product_method_holds.filter(x=>x.hold==="MANUAL_METHOD_NUMBER_CONFLICT_HOLD").length,
   caseTotal:pmsvB42Data.product_method_holds.length,approvals:pmsvB42Data.counts.legally_approved_ctr_articles
  }));
  assert.deepEqual(stats,{products:533,conditional:498,pending:35,metalHold:27,caseTotal:35,approvals:0});
  assert.equal(errors.filter(e=>/pmsvB42/.test(e)).length,0,errors.join("\n"));
  console.log("B42 CHROMIUM VERIFIED: 7 conflicting official method IDs, 27 metal holds, 35 dossiers, all 140 CSV requests sanitized; 0 legal PASS",JSON.stringify(stats));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
