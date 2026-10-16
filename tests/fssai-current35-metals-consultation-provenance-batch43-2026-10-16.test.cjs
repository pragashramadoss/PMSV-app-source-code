"use strict";
/* Batch43: signed official consultation notice establishes publication-stage only;
   test source-grade safeguards + 35 pending cases + modified unsent lab CSV. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",dir=path.join(base,"data","rules");
const load=n=>JSON.parse(fs.readFileSync(path.join(dir,n),"utf8"));
const d=load("fssai-current35-metals-consultation-provenance-batch43-2026-10-16.json"),
 b42=load("fssai-current35-dual-manual-method-conflict-batch42-2026-10-16.json"),
 b41=load("fssai-current35-evidence-intake-handoff-batch41-2026-10-16.json"),
 js=fs.readFileSync(path.join(base,"fssai-current35-metals-consultation-provenance-batch43-2026-10-16.js"),"utf8"),
 html=fs.readFileSync(path.join(base,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(o)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(js.includes('const pmsvB43DigestExpected="'+digest(d)+'"'));
assert(html.includes("fssai-current35-metals-consultation-provenance-batch43-2026-10-16.js?v=20261016-b43"));
assert.equal(d.kind,"PMSV_CURRENT35_FSSAI_MANUAL_PUBLIC_CONSULTATION_PROVENANCE_BATCH43");
assert.equal(d.status_2024_publication_of_52_page_manual,"PANEL_APPROVED_FOR_PUBLIC_COMMENT_BEFORE_FINALISATION");
assert.equal(d.status_2026_10_16_52_page_final_adoption,"NOT_ESTABLISHED_BY_REVIEWED_SOURCES");
assert.equal(d.status_2026_10_16_61_page_operational_precedence,"NOT_ESTABLISHED_BY_REVIEWED_SOURCES");
assert.equal(d.manual_priority_auto_selected,false);
assert.deepEqual([
 d.counts.catalogue,d.counts.conditional_first_source_matches,d.counts.pending_ctr_cases,
 d.counts.colliding_2024_method_numbers,d.counts.consultation_2024_manual_pages,
 d.counts.separate_trace_manual_pages,d.counts.manual_source_status_classifications,
 d.counts.primary_official_provenance_checks,d.counts.unresolved_finalisation_adoption_decisions,
 d.counts.metals_cases_kept_on_hold,d.counts.nonmetal_cases_kept_on_hold,
 d.counts.existing_document_requests_guarded,d.counts.laboratory_method_requests_requiring_addendum,
 d.counts.specific_metals_notice_requests],
 [533,498,35,7,52,61,2,5,2,27,8,140,35,27]);
for(const z of ["actual_outreach_sent","formal_lab_method_adoptions_verified","legal_ctr_article_approvals","real_lab_lot_passes"])assert.equal(d.counts[z],0);
assert.equal(d.counts.wordpress_changed,false);
assert.deepEqual(d.results,{baseline_533_498_35_unchanged:true,b42_conflict_still_applies:true,historical_data_unedited:true,consultation_publication_status_evidence_added:true,final_adoption_not_yet_proved:true,no_lab_number_approvals:true,no_automatic_compliance_pass:true,wordpress_untouched:true});
const notice="https://fssai.gov.in/upload/uploadfiles/files/Notice%20for%20comments_26062024.pdf";
assert.equal(d.primary_source_chain.length,5);
assert.equal(d.primary_source_chain[0].url,notice);
assert.equal(d.primary_source_chain[0].page,1);
assert.equal(d.primary_source_chain[0].verified_primary_pdf,true);
assert.match(d.primary_source_chain[0].exact_key_meaning,/before its finalisation/);
assert.equal(d.primary_source_chain[1].verified_official_listing,true);
assert.equal(d.primary_source_chain[2].url,b42.source_evidence[1].url);
assert.equal(d.primary_source_chain[3].url,b42.source_evidence[0].url);
assert.equal(d.closure_evidence_requirements.length,6);
assert(d.closure_evidence_requirements.every(x=>x.verified===false));
assert.equal(d.colliding_method_ids.length,7);
for(let i=0;i<7;i++){
 const x=d.colliding_method_ids[i],b=b42.conflict_method_cards[i];
 assert.equal(x.method_number,b.method_number);
 assert.equal(x.consultation_52p_name,b.metals_and_minerals_manual.title);
 assert.equal(x.trace_61p_name,b.trace_elements_manual.title);
 assert.equal(x.consultation_classification_proven_as_at_2024_06_26,true);
 assert.equal(x.consultation_manual_adopted_after_2024,null);
 assert.equal(x.consultation_manual_adoption_status_after_2024,"UNKNOWN_NOT_VERIFIED");
 assert.equal(x.source_supersession_resolved,false);
 assert.equal(x.per_lab_approved_method,false);
}
assert.equal(d.csv_export_amendment.source_notice,notice);
assert(d.csv_export_amendment.proposed_lab_method_disclaimer.includes("before finalisation"));
assert.equal(d.csv_export_amendment.original_rows_and_csv_schema_preserved,true);
assert.equal(d.csv_export_amendment.all_request_statuses_remain_unsent,true);
const prior=new Map(b42.product_method_holds.map(x=>[x.catalog_id,x]));
const uniq=new Set();let metals=0,other=0;
for(const c of d.affected_cases){
 const b=prior.get(c.catalog_id);assert(b,c.catalog_id);
 assert(!uniq.has(c.catalog_id));uniq.add(c.catalog_id);
 assert.equal(c.rank,b.rank);assert.equal(c.product_name,b.product_name);
 assert.equal(c.analyte,b.analyte);assert.equal(c.family,b.analyte_family);
 assert.equal(c.existing_hold,b.hold);
 assert.equal(c.lab_scope_confirmation_needed,true);
 assert.equal(c.consultation_stage_record_proven,true);
 assert.equal(c.finalised_consultation_attachment_proven,false);
 assert.equal(c.trace_manual_approved_current_for_case,false);
 assert.equal(c.actual_lab_method_verified,false);
 assert.equal(c.ctr_legal_article_signed,false);
 assert.equal(c.real_lot_approved,false);
 assert.equal(c.request_draft_not_sent,true);
 assert.deepEqual(c.linked_four_request_ids,b.four_request_ids);
 if(c.family==="TRACE_METALS")metals++;else other++;
}
assert.equal(uniq.size,35);assert.equal(metals,27);assert.equal(other,8);
assert.equal(b41.requests.length,140);
const port=18943,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const context=await browser.newContext({acceptDownloads:true,permissions:["clipboard-read","clipboard-write"]});
  const page=await context.newPage(),errors=[];page.on("pageerror",x=>errors.push(x.message));
  let opened=false;
  for(let i=0;i<45;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){opened=true;break}
  }catch(_){await sleep(130)}
  assert(opened,"Local preview not available");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB43Valid()),"Batch43 signed notice, checksum or upstream identity mismatch");
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB43Refresh()});
  const panel=page.locator("#pmsv-b43-consultation-provenance");
  assert.equal(await panel.locator("[data-pmsv-b43-rows] tr").count(),35);
  assert.match(await panel.innerText(),/before finalisation/i);
  assert.match(await panel.innerText(),/not established/i);
  await panel.locator("[data-pmsv-b43-group]").selectOption("TRACE_METALS");
  assert.equal(await panel.locator("[data-pmsv-b43-rows] tr").count(),27);
  await panel.locator("[data-pmsv-b43-group]").selectOption("NONMETAL");
  assert.equal(await panel.locator("[data-pmsv-b43-rows] tr").count(),8);
  await panel.locator("[data-pmsv-b43-group]").selectOption("ALL");
  await panel.locator("[data-pmsv-b43-search]").fill("cocoa mass");
  assert.equal(await panel.locator("[data-pmsv-b43-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b43-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b43-rows] tr").count(),35);
  assert.equal(await page.locator("#pmsv-b39-method-exceptions").count(),0);
  const exported=await page.evaluate(()=>pmsvB41CSV(pmsvB41Data.requests));
  assert.equal(exported.trim().split(/\r?\n/).length,141);
  assert.equal((exported.match(/IMPORTANT PRIMARY FSSAI NOTICE:/g)||[]).length,70,
   "Each of 35 laboratory method requests needs disclaimer in method and evidence columns");
  assert(!/FSSAI_09_\d{3}_2024|\b09\.00\d\b/.test(exported));
  assert(exported.includes(notice));
  const labDraft=await page.evaluate(()=>{
   const r=pmsvB41Data.requests.find(x=>x.workstream==="LAB_METHOD_AND_SCOPE"&&x.catalogue_id.includes("cocoa-mass"));
   return pmsvB41RequestText(r);
  });
  assert(labDraft.includes("26 June 2024 public-comment notice"));
  assert(labDraft.includes("before finalisation"));
  assert(labDraft.includes(notice));
  assert(labDraft.includes("not a sent communication"));
  const b41=page.locator("#pmsv-b41-documentary-handoff");
  await b41.locator("summary").first().click();
  const promised=page.waitForEvent("download");
  await b41.locator('[data-pmsv-b41-export="ALL"]').click();
  const download=await promised;
  const csv=fs.readFileSync(await download.path(),"utf8");
  assert.equal(csv.trim().split(/\r?\n/).length,141);
  assert(csv.includes("before finalisation"));
  assert(csv.includes(notice));
  assert(!/FSSAI_09_\d{3}_2024|\b09\.00\d\b/.test(csv));
  const stats=await page.evaluate(()=>({
   total:pmsv498Ledger.records.length,conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,metals:pmsvB43Data.counts.metals_cases_kept_on_hold,
   sourceDecisions:pmsvB43Data.counts.formal_lab_method_adoptions_verified,
   requests:pmsvB41Data.requests.length
  }));
  assert.deepEqual(stats,{total:533,conditional:498,pending:35,metals:27,sourceDecisions:0,requests:140});
  assert.equal(errors.filter(x=>/pmsvB43/.test(x)).length,0,errors.join("\n"));
  console.log("B43 CHROMIUM VERIFIED: June 2024 FSSAI signed consultation provenance, 7 collision IDs, 27 metal holds, 140 safe evidence drafts, 533/498/35, 0 legal PASS",JSON.stringify(stats));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
