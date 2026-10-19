"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),
 {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const load=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=load("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const original=load("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=fs.readFileSync(path.join(root,"fssai-current35-reference-row-nontransfer-batch59-2026-10-17.js"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v).split("")){const z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(js.includes('const pinned="'+digest(d)+'"'),"B59 pin not matching source dataset");
assert(html.includes("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.js?v=20261017-b59"));
assert(html.indexOf("reference-row-nontransfer-batch59")>html.indexOf("owner-outreach-batch58"));
assert(!/(localStorage|sessionStorage|indexedDB|WebSocket|sendBeacon|XMLHttpRequest)/.test(js));
const t=d.totals;
assert.equal(t.catalogue,533);assert.equal(t.first_source_conditional,498);
assert.equal(t.open_ctr_cases,35);assert.equal(t.p0,13);assert.equal(t.p1,22);
assert.equal(t.original_five_gate_request_ids,175);assert.equal(t.preparatory_unsent_requests,70);
assert.equal(t.dependent_unsent_requests,105);
assert.equal(t.comparator_research_rows,15);assert.equal(t.pending_case_research,20);
assert.equal(t.legally_signed_case_limits,0);assert.equal(t.lab_validated_lot_passes,0);
assert.equal(t.original_gazette_authenticated_for_case,0);assert.equal(t.wordpress_changed,false);
assert.equal(d.future_gazette_source.url,"https://fssai.gov.in/upload/uploadfiles/files/272840.pdf");
assert.equal(d.future_gazette_source.commencement_date,"2026-12-01");
assert.equal(d.future_gazette_source.effective_as_of_review,false);
assert.equal(d.future_gazette_source.case_specific_limit_signed,false);
assert.equal(d.cases.length,35);
const originals=new Map(original.cases.map(c=>[c.catalogue_id,c]));
let comparator=0,pending=0,p0=0,p1=0;
const seen=new Set(),allRequests=new Set();
for(const c of d.cases){
 const o=originals.get(c.catalogue_id);assert(o,"Unknown case "+c.catalogue_id);
 assert(!seen.has(c.catalogue_id),"Duplicated "+c.catalogue_id);seen.add(c.catalogue_id);
 assert.equal(c.rank,o.rank);assert.equal(c.product_name,o.product_name);
 assert.equal(c.analyte,o.analyte);assert.equal(c.original_legal_gate,o.original_legal_gate);
 assert.deepEqual(c.original_request_ids,o.gates.map(g=>g.request_id));
 c.original_request_ids.forEach(id=>allRequests.add(id));
 if(c.priority==="P0")p0++;else p1++;
 assert.equal(c.actual_market_material_authenticated,false);
 assert.equal(c.case_signed_legal_applicability,false);
 assert.equal(c.method_and_lab_scope_approved,false);
 assert.equal(c.representative_lot_pass,false);
 if(c.reference){
  comparator++;
  assert.equal(c.source_row_state,"SOURCE_ROW_FOUND_BUT_COMMODITY_OR_SUBTYPE_NOT_VERIFIED");
  assert.equal(c.reference.source_analyte,c.analyte);
  assert.equal(c.reference.source_url,d.official_compendium_url);
  assert(c.reference.pdf_page_1_based>=1);
  assert(c.reference.nontransfer_reason.length>=20);
  assert.equal(c.reference.current_original_gazette_authenticated,false);
  assert.equal(c.reference.exact_as_sold_commodity_applies,false);
  assert.equal(c.reference.case_specific_signed_limit,false);
 }else{
  pending++;assert.equal(c.source_row_state,"NO_COMPARATOR_SELECTED_THIS_BATCH");
 }
}
assert.equal(comparator,15);assert.equal(pending,20);assert.equal(p0,13);assert.equal(p1,22);
assert.equal(allRequests.size,175);
const cocoa=[8,9,10].map(rank=>d.cases.find(c=>c.rank===rank));
assert(cocoa.every(c=>c.reference?.source_article==="Cocoa powder"&&c.reference?.pdf_page_1_based===3));
assert.equal(d.cases.find(c=>c.rank===1).reference.source_article,"Packaged drinking water (other than mineral water)");
assert.equal(d.cases.find(c=>c.rank===20).reference.source_article,"Refined sugar");
assert.equal(d.cases.find(c=>c.rank===21).reference.source_article,"Sorbitol");
const server=spawn("python3",["-m","http.server","18959","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(done=>setTimeout(done,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let online=false;
  for(let i=0;i<50;i++)try{
   const r=await page.goto("http://127.0.0.1:18959/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){online=true;break;}
  }catch(_){await nap(200)}
  assert(online,"B59 preview server startup");
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
await page.waitForFunction(()=>window.pmsvB59CTRSourceCrosswalk?.valid(),null,{timeout:90000});
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();});
  const panel=page.locator("#pmsv-b59-ctr-nontransfer");
  await panel.evaluate(el=>el.open=true);
  assert.equal(await panel.locator("[data-pmsv-b59-rows] tr").count(),35);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB59CTRSourceCrosswalk.getCounts()),{
   cases:35,referenced:15,pending:20,approved:0,lot_pass:0});
  assert.match(await panel.innerText(),/All 35 cases remain on hold/);
  assert.match(await panel.innerText(),/not a negative legal finding/);
  await panel.locator("[data-pmsv-b59-research]").selectOption("REFERENCED");
  assert.equal(await panel.locator("[data-pmsv-b59-rows] tr").count(),15);
  await panel.locator("[data-pmsv-b59-research]").selectOption("PENDING");
  assert.equal(await panel.locator("[data-pmsv-b59-rows] tr").count(),20);
  await panel.locator("[data-pmsv-b59-research]").selectOption("ALL");
  await panel.locator("[data-pmsv-b59-priority]").selectOption("P0");
  assert.equal(await panel.locator("[data-pmsv-b59-rows] tr").count(),13);
  await panel.locator("[data-pmsv-b59-priority]").selectOption("P1");
  assert.equal(await panel.locator("[data-pmsv-b59-rows] tr").count(),22);
  await panel.locator("[data-pmsv-b59-priority]").selectOption("ALL");
  const csv=await page.evaluate(()=>window.pmsvB59CTRSourceCrosswalk.csv());
  assert.equal(csv.trim().split(/\r?\n/).length,36);
  assert(csv.includes("comparator_as_published_NOT_case_limit"));
  assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false"')));
  assert.equal(errors.length,0,"Browser errors: "+errors.join("; "));
  console.log("Batch59 PASS: official compendium comparator non-transfer 15/35, 20 unsourced pending, 175 gate lineage, zero approved products or lot PASS.");
 }catch(e){console.error(e);process.exitCode=1;}
 finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
