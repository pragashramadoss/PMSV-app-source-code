"use strict";
/* B40 current35: page-pinned 23 official CTR source rows, 35 pending legal contrasts,
 * original 10-record historical Batch40 preserved; no invented full compliance. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",dir=path.join(base,"data","rules");
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),"utf8"));
const d=read("fssai-current35-false-equivalence-article-crosswalk-batch40-2026-10-16.json");
const b26=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json");
const b39=read("fssai-current35-method-scope-exceptions-batch39-2026-10-16.json");
const historical=read("fssai-batch40-exact-commodity-and-conditional-scope-v1.json");
const code=fs.readFileSync(path.join(base,"fssai-current35-false-equivalence-crosswalk-batch40-2026-10-16.js"),"utf8");
const index=fs.readFileSync(path.join(base,"index.html"),"utf8");
function hash(o){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(o)){const n=c.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(code.includes('const pmsvB40Expected="'+hash(d)+'"'));
assert(index.includes("fssai-current35-false-equivalence-crosswalk-batch40-2026-10-16.js?v=20261016-b40"));
assert.equal(historical.rows.length,10,"Historical Batch40 changed");
assert.equal(historical.negative_controls.length,30,"Historical Batch40 controls changed");
assert.equal(d.kind,"PMSV_CURRENT35_EXACT_ARTICLE_FALSE_EQUIVALENCE_BATCH40");
assert.equal(d.deployment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.preexisting_historical_batch40_file_preserved,true);
assert.equal(d.source.compendium_not_legal_instrument,true);
assert.equal(d.source.original_gazette_amendment_controls_precedence,true);
assert.equal(d.source.scope_rows_source_checked_against_primary_pdf,true);
assert.equal(d.source.url,"https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf");
const n=d.counts;
assert.deepEqual([n.catalogue,n.conditional_first_source_matches,n.pending_ctr_article_decisions,
 n.adjudicated_comparator_contrasts,n.primary_ctr_source_rows,
 n.legal_scope_blocks,n.product_identity_blocks,n.process_matrix_blocks,n.substance_identity_blocks],
 [533,498,35,35,23,11,9,7,8]);
for(const z of ["commercial_products_verified","source_comparator_numeric_limits_transferred",
 "actual_signed_legal_article_decisions","lab_lot_passes"])assert.equal(n[z],0);
assert.equal(n.wordpress_changed,false);
assert.deepEqual(d.results,{historical_batch40_not_overwritten:true,canonical_533_ledger_unchanged:true,
 source_limits_not_auto_applied:true,legal_approval_count:0,lab_passes:0,wordpress_changed:false});
const src=new Map(d.comparator_rows.map(x=>[x.id,x]));
assert.equal(src.size,23);
for(const x of d.comparator_rows){
 assert.equal(x.source_url,d.source.url);
 assert(x.pdf_page_zero_based>=0&&x.pdf_page_zero_based<=55);
 assert.equal(x.finished_article_scope_confirmed,false);
 assert.equal(x.numeric_limit_applied_to_pending_case,false);
 assert.equal(x.laboratory_compliance_pass,false);
 assert(x.difference);
 assert(x.named_article);
}
assert.equal(src.get("LEAD_COCOA_POWDER").candidate_value,5);
assert.equal(src.get("LEAD_COCOA_POWDER").basis,"dry fat-free substance");
assert.equal(src.get("LEAD_WATER_PACKAGED").unit,"mg/L");
assert.equal(src.get("LEAD_INFANT_FORMULA").candidate_value,0.02);
assert.equal(src.get("LEAD_INFANT_FOODS").candidate_value,0.2);
assert.equal(src.get("OCHRATOXIN_COFFEE").candidate_value,5);
assert.equal(src.get("OCHRATOXIN_COFFEE").unit,"µg/kg");
assert.equal(src.get("NICKEL_SORBITOL").candidate_value,2);
assert.equal(src.get("CHROMIUM_REFINED_SUGAR").candidate_value,0.02);
assert.equal(src.get("AFLA_TOTAL_CONTAINS").candidate_value,20);
assert.equal(src.get("AFLA_B1_CONTAINS").candidate_value,10);
assert.equal(src.get("POTENTIAL_HONEY_VET").pdf_page_zero_based,39);
const old=new Map(b26.cases.map(c=>[c.catalog_id,c]));
const methods=new Map(b39.case_gates.map(c=>[c.catalog_id,c]));
const seen=new Set(),blocks={LEGAL_SCOPE:0,PRODUCT_IDENTITY:0,PROCESS_MATRIX:0,SUBSTANCE_ID:0};
for(const c of d.case_contrasts){
 const p=old.get(c.catalog_id),s=src.get(c.source_row_id),m=methods.get(c.catalog_id);
 assert(p&&s&&m,c.catalog_id);assert(!seen.has(c.catalog_id));seen.add(c.catalog_id);
 for(const k of ["rank","product_name","fssr","fcs"])assert.equal(c[k],p[k]);
 assert.equal(c.blocking_class,p.primary_blocker);
 assert.equal(c.prior_ctr_reviewed_analyte,p.reviewed_analyte);
 assert.equal(c.prior_ctr_comparator,p.reviewed_comparator_article);
 assert.equal(c.comparator_source_page_zero_based,s.pdf_page_zero_based);
 assert.equal(c.original_comparator_limit_for_research_only,s.candidate_value);
 assert.equal(c.original_comparator_unit,s.unit);
 assert.equal(c.must_collect.length,5);
 assert.equal(c.legal_pass,false);
 assert.equal(c.lot_lab_pass,false);
 assert.equal(c.exact_ctr_article_applicability_signed,false);
 assert.equal(c.lab_validated_for_this_matrix,false);
 assert.equal(c.commercial_identity_verified,false);
 assert.equal(c.candidate_limit_transferred,false);
 assert.equal(m.regulatory_pass,false);
 blocks[c.blocking_class]++;
}
assert.equal(seen.size,35);
assert.deepEqual(blocks,{LEGAL_SCOPE:11,PRODUCT_IDENTITY:9,PROCESS_MATRIX:7,SUBSTANCE_ID:8});
assert.equal(d.case_contrasts.filter(c=>c.source_row_id==="LEAD_COCOA_POWDER").length,4);
const cocoa=d.case_contrasts.find(c=>c.catalog_id.includes("cocoa-mass-or-cocoa"));
assert(cocoa.contrast_code==="COCOA_LIQUOR_VS_POWDER");
const caseHoney=d.case_contrasts.find(c=>c.catalog_id==="100-100-royal-jelly");
assert.equal(caseHoney.source_row_id,"POTENTIAL_HONEY_VET");
const port=18940,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
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
  }catch(_){await sleep(170)}
  assert(loaded,"Preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended documentary evidence is intentionally user-requested, not startup-loaded.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core integrity blocks");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full source chain must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB40Valid()),"B40 primary source, identity or digest integrity failed");
  const stat=await page.evaluate(()=>({
   catalogue:pmsv498Ledger.records.length,conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,comparators:pmsvB40Data.comparator_rows.length,
   cases:pmsvB40Data.case_contrasts.length,limits:pmsvB40Data.counts.source_comparator_numeric_limits_transferred
  }));
  assert.deepEqual(stat,{catalogue:533,conditional:498,pending:35,comparators:23,cases:35,limits:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB40Refresh();
  });
  const panel=page.locator("#pmsv-b40-current35-source-contrast");
  assert.equal(await panel.locator("[data-pmsv-b40-case-rows] tr").count(),35);
  assert.equal(await panel.locator("[data-pmsv-b40-source-rows] tr").count(),23);
  await panel.locator("summary").first().click();
  for(const [cat,cnt] of [["LEGAL_SCOPE",11],["PRODUCT_IDENTITY",9],["PROCESS_MATRIX",7],["SUBSTANCE_ID",8]]){
   await panel.locator("[data-pmsv-b40-filter]").selectOption(cat);
   assert.equal(await panel.locator("[data-pmsv-b40-case-rows] tr").count(),cnt);
  }
  await panel.locator("[data-pmsv-b40-filter]").selectOption("ALL");
  await panel.locator("[data-pmsv-b40-case-search]").fill("cocoa");
  assert((await panel.locator("[data-pmsv-b40-case-rows] tr").count())>=3);
  await panel.locator("[data-pmsv-b40-case-search]").fill("coffee-chicory");
  assert.equal(await panel.locator("[data-pmsv-b40-case-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b40-open]").first().click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),"coffee-chicory-mixture");
  await panel.locator("[data-pmsv-b40-case-search]").fill("");
  await panel.locator("details").first().locator("summary").click();
  await panel.locator("[data-pmsv-b40-comparator-search]").fill("aflatoxin");
  assert.equal(await panel.locator("[data-pmsv-b40-source-rows] tr").count(),2);
  await panel.locator("[data-pmsv-b40-comparator-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b40-source-rows] tr").count(),23);
  assert.equal(errors.filter(e=>/pmsvB40/.test(e)).length,0,errors.join("\n"));
  console.log("B40 CHROMIUM VERIFIED 35 official CTR false-equivalence checks, 23 source rows, 11/9/7/8 blockers, 533/498/35, 0 approvals",JSON.stringify(stat));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
