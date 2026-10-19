"use strict";
/* B36: legal instrument precedence, nine real catalogue crosswalks,
 * no legacy Schedule auto-transfer or positive CTR/lot compliance. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",folder=path.join(root,"data","rules");
const read=f=>JSON.parse(fs.readFileSync(path.join(folder,f),"utf8"));
const d=read("fssai-current35-operative-precedence-batch36-2026-10-16.json"),
 prev=read("fssai-current35-nine-source-adjudications-batch35-2026-10-16.json");
const ui=fs.readFileSync(path.join(root,"fssai-current35-operative-precedence-batch36-2026-10-16.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
function hash(x){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(x)){const v=c.charCodeAt(0);a=Math.imul(a^v,16777619);b=Math.imul(b^v,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(ui.includes('const pmsvB36Expected="'+hash(d)+'"'));
assert(index.includes('fssai-current35-operative-precedence-batch36-2026-10-16.js?v=20261016-b36'));
assert.equal(d.kind,"PMSV_CURRENT35_NUTRA_PRECEDENCE_AND_NINE_CASE_REMAP_BATCH36");
assert.equal(d.deployment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.quality_research_only,true);
assert.equal(d.legal_documentation_research_only,true);
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,d.counts.exact_ctr_cases_pending,
 d.counts.nine_prior_documentary_cases,d.counts.precedence_rechecked_cases,
 d.counts.legacy_nutra_schedule_revisions,d.counts.ayurveda_recipe_checks,
 d.counts.sajji_application_not_approval],[533,498,35,9,9,2,2,1]);
for(const f of ["unique_finished_lot_identifications","finished_ctr_article_scope_approvals",
 "finished_numeric_ctr_limits_approved","actual_lot_lab_passes"])assert.equal(d.counts[f],0);
assert.equal(d.counts.wordpress_changed,false);
assert.equal(d.results.canonical_ledger_modified,false);
assert.equal(d.results.wordpress_modified,false);
assert.equal(d.results.auto_legal_permission_changes,0);
assert.equal(d.results.ctr_scope_approvals,0);
assert.equal(d.results.lab_conformity_signoffs,0);
assert.equal(d.legal_history.length,4);
const h=d.legal_history;
assert.deepEqual(h.map(x=>x.date),["2021-09-29","2022-03-29","2024-06-05","2024-08-30"]);
assert.deepEqual(h.map(x=>x.effective_from||null),[null,"2022-04-01","2024-01-01","2024-07-01"]);
assert.equal(h[1].role,"SECTION_16_5_INITIAL_OPERATIONAL_DIRECTION");
assert.equal(h[2].role,"REOPERATIONAL_DIRECTION_WITH_CODEX_GMP");
assert.equal(d.verified_regulatory_principles.length,5);
assert(d.verified_regulatory_principles.some(x=>x.id==="2022_SCHEDULE_I_IV"));
assert(d.verified_regulatory_principles.some(x=>x.id==="FPIVS_NOT_LICENCE"));
const prior=new Map(prev.records.map(x=>[x.catalog_id,x]));assert.equal(prior.size,9);
assert.equal(d.cases.length,9);
const seen=new Set();
for(const x of d.cases){
 const p=prior.get(x.catalog_id);assert(p,x.catalog_id);assert(!seen.has(x.catalog_id));
 seen.add(x.catalog_id);
 for(const k of ["product_name","rank","fssr","fcs"])assert.equal(x[k],p[k]);
 assert.equal(x.prior_source_class,p.source_class);
 assert.equal(x.documentary_actions.length,3);
 assert(x.source_refs.length>=2);
 assert(x.source_refs.every(s=>/^https:\/\/(?:www\.)?(?:fssai\.gov\.in|fpas\.fssai\.gov\.in)\//.test(s.url)));
 assert(x.guard);
 for(const k of ["actual_lot_identity_verified","complete_formula_verified",
 "source_precedence_signed_off","current_final_notification_checked_through_2026",
 "ctr_exact_finished_article_approved","finished_ctr_numeric_limit_assigned",
 "lot_lab_pass","regulatory_pass"])assert.equal(x[k],false);
}
assert.equal(seen.size,9);
const remapped=d.cases.filter(x=>x.legal_review_class.startsWith("LEGACY_NUTRA_"));
assert.equal(remapped.length,2);
assert(remapped.some(x=>x.catalog_id.includes("ingredients-listed-under-schedule-iv")));
assert(remapped.some(x=>x.catalog_id.includes("additives-va-vf")));
const milk=d.cases.find(x=>x.catalog_id.includes("ksheerapaka"));
assert.equal(milk.guard,"NO_INVENTED_FOUR_MILK_FORMULA");
const sj=d.cases.find(x=>x.catalog_id.includes("sajji-khar"));
assert.equal(sj.guard,"NO_APPLICATION_STATUS_PROMOTION");
const port=18936,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const pause=x=>new Promise(done=>setTimeout(done,x));
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
  }catch(_){await pause(130)}
  assert(loaded,"FSSAI preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended documentary evidence is intentionally user-requested, not startup-loaded.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core integrity blocks");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full source chain must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB36Valid()),"Batch36 legal source integrity or upstream failed");
  const state=await page.evaluate(()=>({
   reviewed:pmsvB36Data.cases.length,
   legacy:pmsvB36Data.cases.filter(c=>c.legal_review_class.startsWith("LEGACY_NUTRA_")).length,
   history:pmsvB36Data.legal_history.length,
   catalogue:pmsv498Ledger.records.length,
   conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   approved:pmsvB36Data.counts.finished_numeric_ctr_limits_approved
  }));
  assert.deepEqual(state,{reviewed:9,legacy:2,history:4,catalogue:533,conditional:498,pending:35,approved:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB36Refresh();
  });
  const panel=page.locator("#pmsv-b36-legal-precedence");
  assert.equal(await panel.locator("[data-pmsv-b36-rows] tr").count(),9);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b36-filter]").selectOption("LEGACY");
  assert.equal(await panel.locator("[data-pmsv-b36-rows] tr").count(),2);
  await panel.locator("[data-pmsv-b36-query]").fill("Schedule");
  assert.equal(await panel.locator("[data-pmsv-b36-rows] tr").count(),2);
  await panel.locator("[data-pmsv-b36-query]").fill("Schedule VIII");
  assert.equal(await panel.locator("[data-pmsv-b36-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b36-open]").first().click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),
   "99-99-7-ingredients-listed-under-schedule-iv-schedule-vi-and-schedule-viii-of-nutraceutica");
  await panel.locator("[data-pmsv-b36-query]").fill("");
  await panel.locator("[data-pmsv-b36-filter]").selectOption("AYURVEDA");
  assert.equal(await panel.locator("[data-pmsv-b36-rows] tr").count(),2);
  await panel.locator("[data-pmsv-b36-filter]").selectOption("OTHER");
  assert.equal(await panel.locator("[data-pmsv-b36-rows] tr").count(),5);
  await panel.locator("[data-pmsv-b36-filter]").selectOption("ALL");
  assert.equal(await panel.locator("[data-pmsv-b36-rows] tr").count(),9);
  assert.equal(errors.filter(x=>/pmsvB36/.test(x)).length,0,errors.join("\n"));
  console.log("B36 CHROMIUM VERIFIED: 9 legal-source gates, 2 legacy remaps, 4 timed authorities, 533/498/35, zero CTR approvals",JSON.stringify(state));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
