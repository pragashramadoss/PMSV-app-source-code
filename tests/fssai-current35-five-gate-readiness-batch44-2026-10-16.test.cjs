"use strict";
/* Batch44 — 35 dossiers, 5 independent evidence gates each, 175 UNSENT checks.
   Chromium verifies official source citation, filters, CSV, draft text and no compliance PASS. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",rules=path.join(base,"data","rules");
const rd=s=>JSON.parse(fs.readFileSync(path.join(rules,s),"utf8"));
const d=rd("fssai-current35-five-gate-readiness-batch44-2026-10-16.json"),
 b43=rd("fssai-current35-metals-consultation-provenance-batch43-2026-10-16.json"),
 b41=rd("fssai-current35-evidence-intake-handoff-batch41-2026-10-16.json");
const source=fs.readFileSync(path.join(base,"fssai-current35-five-gate-readiness-batch44-2026-10-16.js"),"utf8"),
 index=fs.readFileSync(path.join(base,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(source.includes('const pmsvB44Expected="'+digest(d)+'"'));
assert(index.includes('fssai-current35-five-gate-readiness-batch44-2026-10-16.js?v=20261016-b44'));
assert.equal(d.kind,"PMSV_CURRENT35_EVIDENCE_GATES_AFTER_METHOD_AUTHORITY_CHECK_BATCH44");
assert.equal(d.environment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.as_of,"2026-10-16");
const c=d.counts;
assert.deepEqual([c.catalogue,c.conditional_first_source_matches,c.exact_ctr_pending,
 c.gated_cases,c.documentary_readiness_gates,c.gates_per_case,c.trace_metal_cases_with_consultation_hold,
 c.nonmetal_cases_with_analyte_hold,c.seven_ambiguous_2024_methods,
 c.official_method_source_findings],[533,498,35,35,175,5,27,8,7,5]);
for(const key of ["authority_gate_requests","market_identity_gate_requests","ctr_article_gate_requests","laboratory_method_gate_requests","lot_signoff_gate_requests"])assert.equal(c[key],35);
for(const key of ["current_confirmed_final_adoption_of_draft","method_authority_selected","evidence_request_sent",
 "supplier_documents_verified","signed_legal_ctr_approvals","actual_lot_lab_passes"])assert.equal(c[key],0);
assert.equal(c.wordpress_changed,false);
const s=d.method_authority_status;
assert.equal(s.official_2024_consultation_document_verified,true);
assert.equal(s.draft_52_page_notified_for_stakeholder_comments,true);
assert.equal(s.finalisation_order_for_52_page_pdf_verified,false);
assert.equal(s.supersession_precedence_between_52p_and_61p_verified,false);
assert.equal(s.listed_generic_manual_on_metals_in_current_FSSAI_methods_index,true);
assert.equal(s.mandatory_adoption_orders_listed_separately_in_official_index,true);
assert.equal(s.not_found_means_does_not_exist,false);
assert.equal(d.official_source_urls.notice,b43.primary_source_chain[0].url);
assert.equal(d.official_source_urls.draft,b43.primary_source_chain[2].url);
assert.equal(d.official_source_urls.trace,b43.primary_source_chain[3].url);
assert.equal(d.primary_source_findings.length,5);
assert.equal(d.gate_definitions.length,5);
assert.equal(d.case_gate_dossiers.length,35);
assert.equal(d.request_rows.length,175);
assert.deepEqual(d.results,{legacy_B41_B43_unchanged:true,new_actual_documents_received:0,
 real_laboratories_contacted:0,no_source_adoption_inferred:true,no_lab_pass_inferred:true,
 no_ctr_limit_transferred:true,wordpress_unchanged:true});
const codes=["SOURCE_VERSION_AND_METHOD_AUTHORITY","COMMERCIAL_ARTICLE_IDENTITY","LEGAL_CTR_ARTICLE_AND_ANALYTE","LAB_MATRIX_METHOD_AND_LOQ","LOT_COA_AND_INDEPENDENT_SIGNOFF"];
assert.deepEqual(d.gate_definitions.map(x=>x.code),codes);
const prev=new Map(b43.affected_cases.map(x=>[x.catalog_id,x])),
 b41p=new Map(b41.packets.map(x=>[x.catalogue_id,x]));
const caseIds=new Set(),requests=new Set(),freq={};let metals=0;
for(const x of d.case_gate_dossiers){
 const a=prev.get(x.catalogue_id),p=b41p.get(x.catalogue_id);
 assert(a&&p,x.catalogue_id);
 assert(!caseIds.has(x.catalogue_id));caseIds.add(x.catalogue_id);
 for(const k of ["rank","product_name","fssr","fcs","analyte"])assert.equal(x[k],a[k]);
 assert.equal(x.analyte_family,a.family);
 assert.equal(x.priority,a.case_priority);
 assert.equal(x.method_authority_hold,a.existing_hold);
 assert.equal(x.matrix_exception_context,p.method_scope_exception);
 assert.equal(x.legal_article_context,p.product_scope_exception);
 assert.deepEqual(x.existing_four_request_ids,a.linked_four_request_ids);
 assert.equal(x.new_five_gate_ids.length,5);
 for(let i=0;i<5;i++)assert.equal(x.new_five_gate_ids[i],"PMSV44-"+String(x.rank).padStart(2,"0")+"-"+String(i+1).padStart(2,"0"));
 for(const key of ["source_version_approved","commercial_identity_verified","legal_ctr_article_signed",
 "matrix_lab_method_validated","actual_lot_approved"])assert.equal(x[key],false);
 assert.equal(x.gate_status,"FIVE_INDEPENDENT_EVIDENCE_GATES_OPEN");
 if(x.analyte_family==="TRACE_METALS")metals++;
}
assert.equal(caseIds.size,35);assert.equal(metals,27);
for(const r of d.request_rows){
 assert(!requests.has(r.request_id));requests.add(r.request_id);
 assert(caseIds.has(r.catalogue_id));
 assert(codes.includes(r.gate_code));
 assert.equal(r.task_state,"UNSENT_REVIEW_TEMPLATE");
 assert.equal(r.lab_or_supplier_assignee,"");
 assert.equal(r.due_date,"");
 assert.equal(r.document_received,false);
 assert.equal(r.signed_review_completed,false);
 assert.equal(r.approved_method_selected,false);
 assert.equal(r.numeric_ctr_applied,false);
 assert.equal(r.lot_compliance_pass,false);
 assert(r.source_url.startsWith("https://"));
 assert(r.exact_evidence_required.length>60);
 freq[r.gate_code]=(freq[r.gate_code]||0)+1;
}
assert.equal(requests.size,175);
assert(codes.every(x=>freq[x]===35));
assert(d.request_rows.filter(x=>x.gate_code===codes[0]&&x.analyte_family==="TRACE_METALS")
 .every(x=>/consultation/i.test(x.exact_evidence_required)));
const port=18944,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const nap=t=>new Promise(done=>setTimeout(done,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const context=await browser.newContext({acceptDownloads:true,permissions:["clipboard-read","clipboard-write"]});
  const page=await context.newPage(),pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
  let opened=false;
  for(let k=0;k<40;k++)try{const res=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});if(res?.ok()){opened=true;break}}catch(_){await nap(150)}
  assert(opened,"FSSAI browser preview cannot start");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: test explicit opt-in full evidence loading, not deprecated eager startup.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Core integrity fail-closed");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full documentary evidence chain must validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB44Valid()),"Batch44 source integrity or upstream 533 catalogue check failed");
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB44Refresh()});
  const panel=page.locator("#pmsv-b44-five-gate-readiness");
  assert.equal(await panel.locator("[data-pmsv-b44-rows] tr").count(),175);
  assert.match(await panel.innerText(),/notified for.*comments|consultation attachment/i);
  await panel.locator("[data-pmsv-b44-gate]").selectOption("SOURCE_VERSION_AND_METHOD_AUTHORITY");
  assert.equal(await panel.locator("[data-pmsv-b44-rows] tr").count(),35);
  await panel.locator("[data-pmsv-b44-family]").selectOption("METALS");
  assert.equal(await panel.locator("[data-pmsv-b44-rows] tr").count(),27);
  await panel.locator("[data-pmsv-b44-family]").selectOption("NONMETALS");
  assert.equal(await panel.locator("[data-pmsv-b44-rows] tr").count(),8);
  await panel.locator("[data-pmsv-b44-family]").selectOption("ALL");
  await panel.locator("[data-pmsv-b44-gate]").selectOption("LAB_MATRIX_METHOD_AND_LOQ");
  assert.equal(await panel.locator("[data-pmsv-b44-rows] tr").count(),35);
  await panel.locator("[data-pmsv-b44-search]").fill("cocoa mass");
  assert.equal(await panel.locator("[data-pmsv-b44-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b44-select]").click();
  const detail=await panel.locator("[data-pmsv-b44-detail]").innerText();
  assert.match(detail,/UNSENT DRAFT/);
  assert.match(detail,/method|scope|lab/i);
  const request=await page.evaluate(()=>pmsvB44RequestText(pmsvB44Rows()[0]));
  assert(request.includes("NOT SENT / NOT APPROVED"));
  assert(request.includes("June 26, 2024"));
  assert(request.includes("no actual")||request.includes("No actual"));
  await panel.locator("[data-pmsv-b44-search]").fill("");
  const oneCsv=await page.evaluate(()=>pmsvB44CSV(pmsvB44Rows()));
  assert.equal(oneCsv.trim().split(/\r?\n/).length,36);
  const filtered=page.waitForEvent("download");
  await panel.locator('[data-pmsv-b44-export="FILTERED"]').click();
  const f=await filtered,fc=fs.readFileSync(await f.path(),"utf8");
  assert.equal(fc.trim().split(/\r?\n/).length,36);
  assert(fc.includes("UNSENT_REVIEW_TEMPLATE"));
  await panel.locator("[data-pmsv-b44-gate]").selectOption("ALL");
  assert.equal(await panel.locator("[data-pmsv-b44-rows] tr").count(),175);
  const all=page.waitForEvent("download");
  await panel.locator('[data-pmsv-b44-export="ALL"]').click();
  const downloaded=await all,content=fs.readFileSync(await downloaded.path(),"utf8");
  assert.equal(content.trim().split(/\r?\n/).length,176);
  assert(content.includes("PMSV44-35-05"));
  assert(!content.includes("PASSED_REGULATORY"));
  assert.equal(pageErrors.filter(x=>/pmsvB44/.test(x)).length,0,pageErrors.join("\n"));
  console.log("B44 CHROMIUM VERIFIED: 175 unsent evidence gates / 35 CTR pending; 27 metal method holds and 8 nonmetal; CSV exports and preview filters; 0 compliance PASS");
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
