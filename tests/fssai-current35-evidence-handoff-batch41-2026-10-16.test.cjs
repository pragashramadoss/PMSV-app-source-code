"use strict";
/* Batch41 35 products * four supplier / legal / laboratory / QA document requests.
 * No tasks are actually sent, assigned, closed or legal approved. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",dir=path.join(base,"data","rules");
const read=s=>JSON.parse(fs.readFileSync(path.join(dir,s),"utf8"));
const d=read("fssai-current35-evidence-intake-handoff-batch41-2026-10-16.json"),
 b38=read("fssai-current35-analytical-evidence-packets-batch38-2026-10-16.json"),
 b39=read("fssai-current35-method-scope-exceptions-batch39-2026-10-16.json"),
 b40=read("fssai-current35-false-equivalence-article-crosswalk-batch40-2026-10-16.json");
const ui=fs.readFileSync(path.join(base,"fssai-current35-evidence-intake-handoff-batch41-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(o)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(ui.includes('const pmsvB41Expected="'+digest(d)+'"'));
assert(html.includes('fssai-current35-evidence-intake-handoff-batch41-2026-10-16.js?v=20261016-b41'));
assert.equal(d.kind,"PMSV_CURRENT35_EVIDENCE_INTAKE_HANDOFF_BATCH41");
assert.equal(d.deployment,"GH_PAGES_PREVIEW_ONLY");
const c=d.counts;
assert.deepEqual([c.catalogue,c.conditional_first_source_matches,c.exact_ctr_pending,c.evidence_packets,c.total_actionable_document_requests,c.request_workstreams,c.specific_method_exception_packets,c.general_method_scope_packets],[533,498,35,35,140,4,13,22]);
for(const k of ["identity_request_count","legal_article_request_count","laboratory_method_request_count","lot_sample_request_count","request_status_not_sent"])assert.equal(c[k],k==="request_status_not_sent"?140:35);
for(const k of ["actual_assignees_confirmed","actual_due_dates_confirmed","legal_scope_approvals","laboratory_reports_verified","lab_passes"])assert.equal(c[k],0);
assert.equal(c.wordpress_changed,false);
assert.deepEqual(d.results,{canonical_ledgers_unchanged:true,actual_requests_sent:0,actual_documents_received:0,external_provider_contacted:false,legal_limit_automatically_applied:false,actual_lab_passes:0,wordpress_modified:false});
assert.equal(d.source_refs.laboratories,"https://fssai.gov.in/food-testing/food-laboratories");
assert.equal(d.source_refs.methods,"https://www.fssai.gov.in/food-testing/manuals-methods-analysis");
assert.equal(d.source_refs.ctr,b40.source.url);
assert.equal(d.packets.length,35);assert.equal(d.requests.length,140);
assert.equal(d.csv_columns.length,17);
assert.deepEqual(d.workstream_definitions.map(x=>x.code),["PRODUCT_IDENTITY","LEGAL_CTR_APPLICABILITY","LAB_METHOD_AND_SCOPE","LOT_SAMPLE_AND_QA"]);
const r38=new Map(b38.evidence_packets.map(x=>[x.catalog_id,x]));
const r39=new Map(b39.case_gates.map(x=>[x.catalog_id,x]));
const r40=new Map(b40.case_contrasts.map(x=>[x.catalog_id,x]));
const seen=new Set(),tally={},priority={};
let specific=0;
for(const p of d.packets){
 const a=r38.get(p.catalogue_id),m=r39.get(p.catalogue_id),x=r40.get(p.catalogue_id);
 assert(a&&m&&x,p.catalogue_id);
 for(const [k,r] of [["rank","rank"],["product_name","product_name"],["fssr","fssr"],["fcs","fcs"]])assert.equal(p[k],x[r]);
 assert.equal(p.analyte_family,a.analyte_family);
 assert.equal(p.reviewed_analyte,x.prior_ctr_reviewed_analyte);
 assert.equal(p.regulatory_blocker,x.blocking_class);
 assert.equal(p.product_scope_exception,x.actual_vs_comparator_distinction);
 assert.equal(p.method_scope_exception,m.specific_reason);
 assert.equal(p.matrix_exception,m.focus==="MATRIX_METHOD_EXCEPTION_OR_LEGAL_CATEGORY");
 if(p.matrix_exception)specific++;
 assert.equal(p.workstreams.length,4);
 assert.equal(p.catalogue_status,"EXACT_CTR_ARTICLE_PENDING");
 for(const k of ["supplier_or_lot_documents_verified","lab_method_accreditation_verified","lab_report_verified","signed_legal_decision","pass"])assert.equal(p[k],false);
 for(let i=0;i<4;i++)assert.equal(p.workstreams[i].request_id,"PMSV41-"+String(p.rank).padStart(2,"0")+"-"+String(i+1).padStart(2,"0"));
}
assert.equal(specific,13);
const packetIndex=new Map(d.packets.map(x=>[x.catalogue_id,x]));
assert.equal(packetIndex.size,35);
for(const r of d.requests){
 const p=packetIndex.get(r.catalogue_id);assert(p,r.catalogue_id);
 assert.equal(r.catalogue_product,p.product_name);
 assert(!seen.has(r.request_id));seen.add(r.request_id);
 assert(p.workstreams.some(x=>x.request_id===r.request_id&&x.workstream===r.workstream));
 assert.equal(r.priority,p.case_priority);
 assert(["PRODUCT_IDENTITY","LEGAL_CTR_APPLICABILITY","LAB_METHOD_AND_SCOPE","LOT_SAMPLE_AND_QA"].includes(r.workstream));
 assert.equal(r.status,"NOT_REQUESTED_RESEARCH_TEMPLATE");
 assert.equal(r.assignee,"");assert.equal(r.due_date,"");
 assert(r.required_evidence.length>100);
 assert(r.completion_definition.length>30);
 assert(/^https:\/\//.test(r.source_url));
 tally[r.workstream]=(tally[r.workstream]||0)+1;
 priority[r.priority]=(priority[r.priority]||0)+1;
}
assert.equal(seen.size,140);
assert.deepEqual(tally,{PRODUCT_IDENTITY:35,LEGAL_CTR_APPLICABILITY:35,LAB_METHOD_AND_SCOPE:35,LOT_SAMPLE_AND_QA:35});
assert.deepEqual(priority,{P1_ORDINARY_SCOPE_GATING:88,P0_SPECIFIC_METHOD_RISK:52});
const cocoa=d.packets.find(x=>x.catalogue_id==="05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake");
assert(cocoa.method_scope_exception.includes("40% fat"));
assert(cocoa.workstreams.find(x=>x.workstream==="LAB_METHOD_AND_SCOPE").request_summary.includes("LOQ"));
const port=18941,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const delay=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const context=await browser.newContext({acceptDownloads:true,permissions:["clipboard-read","clipboard-write"]});
  const page=await context.newPage(),errors=[];page.on("pageerror",x=>errors.push(x.message));
  let opened=false;
  for(let i=0;i<40;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){opened=true;break}
  }catch(_){await delay(150)}
  assert(opened,"Local FSSAI preview not available");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended documentary evidence is intentionally user-requested, not startup-loaded.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core integrity blocks");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full source chain must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB41Valid()),"Batch41 upload integrity and upstream gates invalid");
  const stat=await page.evaluate(()=>({catalogue:pmsv498Ledger.records.length,conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   packets:pmsvB41Data.packets.length,requests:pmsvB41Data.requests.length,
   sent:pmsvB41Data.results.actual_requests_sent,pass:pmsvB41Data.counts.lab_passes}));
  assert.deepEqual(stat,{catalogue:533,conditional:498,pending:35,packets:35,requests:140,sent:0,pass:0});
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB41Refresh()});
  const panel=page.locator("#pmsv-b41-documentary-handoff");
  assert.equal(await panel.locator("[data-pmsv-b41-rows] tr").count(),140);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b41-stream]").selectOption("PRODUCT_IDENTITY");
  assert.equal(await panel.locator("[data-pmsv-b41-rows] tr").count(),35);
  await panel.locator("[data-pmsv-b41-stream]").selectOption("LAB_METHOD_AND_SCOPE");
  assert.equal(await panel.locator("[data-pmsv-b41-rows] tr").count(),35);
  await panel.locator("[data-pmsv-b41-priority]").selectOption("P0_SPECIFIC_METHOD_RISK");
  assert.equal(await panel.locator("[data-pmsv-b41-rows] tr").count(),13);
  await panel.locator("[data-pmsv-b41-query]").fill("cocoa mass");
  assert.equal(await panel.locator("[data-pmsv-b41-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b41-show]").click();
  assert.match(await panel.locator("[data-pmsv-b41-detail]").innerText(),/LOQ/);
  const row=await page.evaluate(()=>pmsvB41Filtered());
  assert.equal(row.length,1);
  const draft=await page.evaluate(()=>pmsvB41RequestText(pmsvB41Filtered()[0]));
  assert(draft.includes("not a sent communication"));
  assert(draft.includes("Cocoa mass")||draft.includes("Cocoa/Chocolate"));
  await panel.locator("[data-pmsv-b41-copy]").click();
  await page.waitForFunction(()=>{const z=document.querySelector("#pmsv-b41-documentary-handoff [data-pmsv-b41-copy-state]");return z&&z.textContent.length>0});
  assert.match(await panel.locator("[data-pmsv-b41-copy-state]").innerText(),/Draft request copied|Automatic copy not available/);
  const filteredPromise=page.waitForEvent("download");
  await panel.locator('[data-pmsv-b41-export="FILTERED"]').click();
  const filteredDl=await filteredPromise;
  assert(filteredDl.suggestedFilename().includes("filtered"));
  let contents=fs.readFileSync(await filteredDl.path(),"utf8");
  assert.equal(contents.trim().split(/\r?\n/).length,2);
  assert(contents.includes("PMSV41-10-03"));
  await panel.locator("[data-pmsv-b41-query]").fill("");
  await panel.locator("[data-pmsv-b41-stream]").selectOption("ALL");
  await panel.locator("[data-pmsv-b41-priority]").selectOption("ALL");
  assert.equal(await panel.locator("[data-pmsv-b41-rows] tr").count(),140);
  const allPromise=page.waitForEvent("download");
  await panel.locator('[data-pmsv-b41-export="ALL"]').click();
  const allDl=await allPromise;
  contents=fs.readFileSync(await allDl.path(),"utf8");
  assert.equal(contents.trim().split(/\r?\n/).length,141);
  assert(contents.includes("PMSV41-35-04"));
  assert(contents.includes("NOT_REQUESTED_RESEARCH_TEMPLATE"));
  assert(!contents.includes("PASSED_REGULATORY"));
  assert.equal(errors.filter(e=>/pmsvB41/.test(e)).length,0,errors.join("\n"));
  console.log("B41 CHROMIUM VERIFIED: 35 cases / 140 unsent evidence requests; 4 workstreams, 13 special method exceptions; CSV export and draft copy; 533/498/35 with 0 PASS",JSON.stringify(stat));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
