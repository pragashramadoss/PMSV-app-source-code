"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),
 {spawn}=require("node:child_process"),{chromium}=require("playwright");
const dir="fssai-product-helper-preview-01",p=x=>path.join(dir,x);
const read=x=>JSON.parse(fs.readFileSync(p("data/rules/"+x),"utf8"));
const d=read("fssai-current35-original-gazette-subjects-batch61-2026-10-17.json"),
 b59=read("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json"),
 b60=read("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json");
const ui=fs.readFileSync(p("fssai-current35-original-gazette-subjects-batch61-2026-10-17.js"),"utf8");
const html=fs.readFileSync(p("index.html"),"utf8");
function hash(v){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(v)){let z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(ui.includes('const digest="'+hash(d)+'"'));
assert.equal(d.pinned_b59_digest,hash(b59));
assert.equal(d.pinned_b60_digest,hash(b60));
assert(html.indexOf("original-gazette-subjects-batch61")>html.indexOf("remaining20-legal-scope-review-batch60"));
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest|WebSocket)/.test(ui));
assert.equal(d.kind,"PMSV_BATCH61_ORIGINAL_GAZETTE_TIME_AND_SUBJECT_AUDIT");
const t=d.totals,old=new Map(b59.cases.map(c=>[c.catalogue_id,c]));
assert.equal(t.catalogue,533);assert.equal(t.conditional_source_matched,498);
assert.equal(t.open_cases,35);assert.equal(t.p0,13);assert.equal(t.p1,22);
assert.equal(t.original_notice_documents,5);assert.equal(t.original_english_pdf_direct_inspected,2);
assert.equal(t.original_official_indexed_not_full_page_inspected,3);
assert.equal(t.documented_source_subjects,8);assert.equal(t.identity_standard_subjects,6);
assert.equal(t.related_ctr_articles_not_exact_commodities,2);
assert.equal(t.other_cases_no_primary_topic_anchor,27);assert.equal(t.original_request_ids,175);
assert.equal(t.b59_related_source_comparison_cases,15);assert.equal(t.b60_researched_pending_cases,20);
for(const key of ["product_specific_legal_limits_approved","actually_signed_case_applicability",
 "manufacturer_lot_identities_confirmed","lab_method_scope_approved",
 "original_lot_coas_received","product_passes","owner_requests_sent"])assert.equal(t[key],0);
assert.equal(t.wordpress_changed,false);
const gaz=new Map(d.original_notices.map(x=>[x.id,x]));
assert.equal(gaz.size,5);
assert.equal(gaz.get("CTR24").commencement_status_or_date,"2025-04-01");
assert.equal(gaz.get("CTR24").effective_as_of_2026_10_17,true);
assert.equal(gaz.get("CTR26").commencement_status_or_date,"2026-12-01");
assert.equal(gaz.get("CTR26").effective_as_of_2026_10_17,false);
assert.equal(gaz.get("CTR24").verification,"FSSAI_ORIGINAL_ENGLISH_PDF_PAGES_DIRECTLY_INSPECTED");
assert.equal(gaz.get("CTR20").verification,"FSSAI_ORIGINAL_GAZETTE_INDEXED_FULL_PAGES_NOT_READ");
const allIDs=new Set(),selected=new Set(),same=new Set();let identity=0,ctr=0,p0=0,p1=0,partB60=0;
for(const c of d.cases){
 const x=old.get(c.catalogue_id);assert(x);assert(!same.has(c.catalogue_id));same.add(c.catalogue_id);
 assert.equal(c.rank,x.rank);assert.equal(c.priority,x.priority);
 assert.equal(c.product_name,x.product_name);assert.equal(c.analyte,x.analyte);
 assert.equal(c.original_legal_gate,x.original_legal_gate);
 assert.deepEqual(c.original_request_ids,x.original_request_ids);
 assert.equal(c.b59_research_state,x.source_row_state);
 assert.equal(c.was_in_b60_pending20,x.reference===null);
 for(const id of c.original_request_ids){assert(!allIDs.has(id));allIDs.add(id);}
 for(const key of ["actual_as_sold_identity_authenticated","legal_case_article_approved",
  "numeric_ctr_comparator_approved","method_lab_scope_approved","lot_pass","product_released"])assert.equal(c[key],false);
 if(c.priority==="P0")p0++;else p1++;
 if(c.was_in_b60_pending20)partB60++;
 if(c.original_gazette_subject_source_id){
  assert(gaz.has(c.original_gazette_subject_source_id));selected.add(c.rank);
  if(c.source_review_status==="ORIGINAL_FPSFA_PRODUCT_IDENTITY_SUBJECT_ONLY")identity++;
  else {ctr++;assert(["ORIGINAL_CTR_COFFEE_ROW_NOT_MIXTURE","ORIGINAL_CTR_HONEY_MRPL_NOT_ROYAL_JELLY"].includes(c.source_review_status));}
 }else assert.equal(c.source_review_status,"ORIGINAL_FRAMEWORK_KNOWN_EXACT_CASE_ARTICLE_NOT_CONFIRMED");
}
assert.equal(allIDs.size,175);assert.equal(same.size,35);
assert.equal(p0,13);assert.equal(p1,22);assert.equal(partB60,20);
assert.equal(identity,6);assert.equal(ctr,2);
assert.deepEqual([...selected].sort((a,b)=>a-b),[2,7,11,14,15,16,17,31]);
assert.equal(d.source_text_findings.length,3);
assert(d.source_text_findings.every(x=>x.exact_product_application===false));
assert.equal(d.source_text_findings.find(x=>x.rank===2).published_other_article_only,"5 µg/kg Ochratoxin A");
assert.equal(d.hold_rules.hold_all_35,true);assert.equal(d.hold_rules.allow_product_pass,false);
assert.equal(d.hold_rules.may_2026_ctr_effective_at_snapshot,false);
const server=spawn("python3",["-m","http.server","18961","--directory",dir,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=x=>new Promise(r=>setTimeout(r,x));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let started=false;for(let i=0;i<40;i++){try{
   const r=await page.goto("http://127.0.0.1:18961/",{waitUntil:"domcontentloaded",timeout:12000});
   if(r?.ok()){started=true;break;}}catch(_){await nap(250)}}
  assert(started,"Preview HTTP startup");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended review is opt-in; verify source chain and zero regulatory approvals.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Core integrity fail-closed");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Extended documentary source integrity must validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
    // Batch72: B70 intentionally defers B23-B68 overlays. Load only after
  // verified core startup, as a real reviewer would, with no mocked FSSAI data.
  assert.equal(await page.evaluate(()=>pmsvB22StartupState),"READY");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,
    "Extended source data must pass original source/lab/lot guards");
await page.waitForFunction(()=>window.pmsvB61OriginalGazette?.valid(),null,{timeout:90000});
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();});
  const panel=page.locator("#pmsv-b61-original-gazette-audit");
  await panel.evaluate(el=>el.open=true);
  assert.equal(await panel.locator("[data-pmsv-b61-rows] tr").count(),35);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB61OriginalGazette.getCounts()),{
   cases:35,subjects:8,identity:6,ctr:2,pending:27,caseLimits:0,lotPasses:0});
  for(const [k,n] of [["CTR",2],["IDENTITY",6],["PENDING",27]]){
   await panel.locator("[data-pmsv-b61-scope]").selectOption(k);
   assert.equal(await panel.locator("[data-pmsv-b61-rows] tr").count(),n);
  }
  await panel.locator("[data-pmsv-b61-scope]").selectOption("ALL");
  await panel.locator("[data-pmsv-b61-priority]").selectOption("P0");
  assert.equal(await panel.locator("[data-pmsv-b61-rows] tr").count(),13);
  await panel.locator("[data-pmsv-b61-priority]").selectOption("P1");
  assert.equal(await panel.locator("[data-pmsv-b61-rows] tr").count(),22);
  await panel.locator("[data-pmsv-b61-priority]").selectOption("ALL");
  const csv=await page.evaluate(()=>window.pmsvB61OriginalGazette.csv());
  assert.equal(csv.trim().split(/\r?\n/).length,36);
  assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false","false","false"')));
  assert.equal(errors.length,0,"JavaScript errors "+errors.join("; "));
  console.log("Batch61 PASS: 35 held products, 175 original IDs, 5 source gazettes, 8 source-subject anchors (6 FPSFA + 2 CTR), zero release.");
 }catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
