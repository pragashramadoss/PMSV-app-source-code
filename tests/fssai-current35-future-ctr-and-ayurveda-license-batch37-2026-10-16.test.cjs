"use strict";
/* Batch37: future Gazette date lock, all 35 CTR cases, 2 Ayurveda licence gates.
 * Chromium E2E assures no Oct 2026 threshold promotion. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",dir=path.join(root,"data","rules");
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),"utf8"));
const d=read("fssai-current35-future-amendment-and-ayurveda-license-batch37-2026-10-16.json");
const prior=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json");
const b36=read("fssai-current35-operative-precedence-batch36-2026-10-16.json");
const code=fs.readFileSync(path.join(root,"fssai-current35-future-amendment-and-ayurveda-license-batch37-2026-10-16.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(obj){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(obj)){let z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(code.includes('const pmsvB37Expected="'+digest(d)+'"'));
assert(index.includes("fssai-current35-future-amendment-and-ayurveda-license-batch37-2026-10-16.js?v=20261016-b37"));
assert.equal(d.kind,"PMSV_CURRENT35_CTR_2026_FUTURE_COMMENCEMENT_AND_AYU_LICENSE_BATCH37");
assert.equal(d.environment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.quality_research_only,true);
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,
 d.counts.exact_ctr_scope_pending,d.counts.forward_scoped_cases_reviewed,
 d.counts.unresolved_formula_or_chemical_identity,
 d.counts.future_amendment_named_article_changes,
 d.counts.ayurveda_manufacturer_licensing_routes],[533,498,35,35,9,8,2]);
for(const x of ["current_named_article_approvals","future_articles_promoted_to_current",
 "confirmed_real_licenses","laboratory_lot_passes"])assert.equal(d.counts[x],0);
assert.equal(d.counts.wordpress_changed,false);
assert.equal(d.results.master_ledger_modified,false);
assert.equal(d.results.wordpress_modified,false);
assert.equal(d.results.added_current_ctr_articles,0);
assert.equal(d.results.added_future_approvals,0);
assert.equal(d.results.verified_lot_conformity,0);
assert.equal(d.statutory_source.gazette_id,"CG-DL-E-25052026-272840");
assert.equal(d.statutory_source.published_on,"2026-05-25");
assert.equal(d.statutory_source.effective_from,"2026-12-01");
assert.equal(d.statutory_source.operative_as_of_review,false);
assert.equal(d.statutory_source.original_pdf_directly_inspected,false);
assert.equal(d.statutory_source.original_gazette_pdf,"https://egazette.gov.in/WriteReadData/2026/272840.pdf");
assert.equal(prior.cases.length,35);
const known=new Map(prior.cases.map(x=>[x.catalog_id,x]));
assert.equal(known.size,35);
assert.equal(d.case_screening.length,35);
const sourcePending=new Set(b36.cases.map(x=>x.catalog_id));assert.equal(sourcePending.size,9);
let unknown=0;
const unique=new Set();
for(const c of d.case_screening){
 const prev=known.get(c.catalog_id);assert(prev,c.catalog_id);
 assert(!unique.has(c.catalog_id));unique.add(c.catalog_id);
 for(const k of ["rank","product_name"])assert.equal(c[k],prev[k]);
 assert.equal(c.previous_ctr_article,prev.reviewed_comparator_article);
 assert.equal(c.previous_ctr_analyte,prev.reviewed_analyte);
 assert.equal(c.future_amendment_article_ids_assigned.length,0);
 assert.equal(c.does_not_prove_future_scope_not_applicable,true);
 for(const f of ["present_ctr_scope_approved","future_ctr_auto_applied",
  "current_ctr_numeric_limit_from_future_gazette","regulatory_lot_pass"])assert.equal(c[f],false);
 if(sourcePending.has(c.catalog_id)){
  unknown++;assert.equal(c.future_amendment_review,"ACTUAL_FORMULA_OR_SUBSTANCE_NOT_KNOWN_SCREENER");
 }else assert.equal(c.future_amendment_review,"NO_DIRECT_MATCH_OF_PENDING_CATALOGUE_NAME_TO_EIGHT_CHANGED_ARTICLES");
}
assert.equal(unique.size,35);assert.equal(unknown,9);
assert.equal(d.amendment_rows.length,8);
assert.equal(new Set(d.amendment_rows.map(x=>x.id)).size,8);
for(const r of d.amendment_rows){
 assert.equal(r.effective_from,"2026-12-01");assert.equal(r.in_force_as_of_review,false);
 assert.equal(r.numeric_auto_application,false);assert.equal(r.finished_product_scope_approved,false);
 assert.equal(r.compliance_pass,false);
 assert.equal(r.source_original_gazette,d.statutory_source.original_gazette_pdf);
}
assert.equal(d.amendment_rows.find(x=>x.id==="ARSENIC_FISH_OIL").future_level_inorganic_arsenic_mg_per_kg,0.1);
assert.equal(d.ayurveda_licensing.length,2);
assert(d.ayurveda_licensing.every(x=>
 x.manufacturer_license_route==="CENTRAL_LICENCE"&&
 x.reference_subcategory==="102.1 AYURVEDA_AAHARA_CATEGORY_A"&&
 x.standardized_list_product_no_extra_approval_letter_if_exact_identity===true&&
 x.additional_hq_approval_for_category_b===true&&
 x.actual_fo_scos_license_verified===false&&
 x.actual_standardized_product_selection_verified===false&&
 x.approved_ctr_limit===false&&x.lab_compliance_pass===false));
const port=18937,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const delay=n=>new Promise(done=>setTimeout(done,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let i=0;i<40;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){loaded=true;break}
  }catch(_){await delay(150)}
  assert(loaded,"Preview server failed");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
    ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended documentary evidence is intentionally user-requested, not startup-loaded.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core integrity blocks");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full source chain must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB37Valid()),"Batch37 upstream integrity invalid");
  const stat=await page.evaluate(()=>({
   catalogue:pmsv498Ledger.records.length,
   conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   amendments:pmsvB37Data.amendment_rows.length,
   cases:pmsvB37Data.case_screening.length,
   license:pmsvB37Data.ayurveda_licensing.length,
   currentPromotions:pmsvB37Data.counts.future_articles_promoted_to_current
  }));
  assert.deepEqual(stat,{catalogue:533,conditional:498,pending:35,
   amendments:8,cases:35,license:2,currentPromotions:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB37Refresh();
  });
  const panel=page.locator("#pmsv-b37-future-ctr-review");
  assert.equal(await panel.locator("[data-pmsv-b37-cases] tr").count(),35);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b37-tab]").selectOption("UNKNOWN");
  assert.equal(await panel.locator("[data-pmsv-b37-cases] tr").count(),9);
  await panel.locator("[data-pmsv-b37-find]").fill("sajji");
  assert.equal(await panel.locator("[data-pmsv-b37-cases] tr").count(),1);
  await panel.locator("[data-pmsv-b37-open]").first().click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),"99-99-1-sajji-khar");
  await panel.locator("[data-pmsv-b37-find]").fill("");
  await panel.locator("[data-pmsv-b37-tab]").selectOption("OTHER");
  assert.equal(await panel.locator("[data-pmsv-b37-cases] tr").count(),26);
  await panel.locator("[data-pmsv-b37-tab]").selectOption("ALL");
  assert.equal(await panel.locator("[data-pmsv-b37-cases] tr").count(),35);
  const future=panel.locator("[data-pmsv-b37-future-rows]");
  assert.equal(await future.locator("tr").count(),8);
  await panel.locator("details").first().locator("summary").click();
  await panel.locator("[data-pmsv-b37-future]").fill("arsenic");
  assert.equal(await future.locator("tr").count(),1);
  await panel.locator("[data-pmsv-b37-future]").fill("");
  assert.equal(await future.locator("tr").count(),8);
  assert.equal(errors.filter(x=>/pmsvB37/.test(x)).length,0,errors.join("\n"));
  console.log("B37 CHROMIUM VERIFIED: 35 screened, 8 Dec-2026 changes, 2 Ayurveda Central Licence paths; 533/498/35, 0 legal promotions",JSON.stringify(stat));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
