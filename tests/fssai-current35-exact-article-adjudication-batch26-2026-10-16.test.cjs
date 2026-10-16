"use strict";
/* Batch 26: no fabricated exact contaminant sources; 35 documentary blockers.
 * Real Chromium checks the live preview, 35-case ledger and safe actions. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const rules=JSON.parse(fs.readFileSync(path.join("fssai-product-helper-preview-01","data","rules","fssai-current35-exact-article-adjudication-batch26-2026-10-16.json"),"utf8"));
const known=JSON.parse(fs.readFileSync(path.join("fssai-product-helper-preview-01","data","rules","fssai-current35-adjudication-workbench-batch14-2026-10-13.json"),"utf8"));
assert.equal(rules.kind,"PMSV_CURRENT35_EXACT_ARTICLE_SOURCE_DECISION_BATCH26");
assert.equal(rules.cases.length,35);
assert.equal(new Set(rules.cases.map(x=>x.catalog_id)).size,35);
assert.equal(rules.coverage.catalogue,533);
assert.equal(rules.coverage.conditional_first_source_matches,498);
assert.equal(rules.coverage.finished_first_source_pending,35);
assert.equal(rules.coverage.direct_unconditional_article_matches_proven,0);
assert.equal(rules.results.source_promotions,0);
assert.equal(rules.results.legal_approvals,0);
assert.equal(rules.results.lot_passes,0);
assert.equal(rules.results.wordpress_modified,false);
assert.equal(rules.future_amendment_applied,false);
for(let i=0;i<35;i++){
 const x=rules.cases[i],b=known.cases[i];
 assert.equal(x.catalog_id,b.catalog_id);
 assert.equal(x.product_name,b.product_name);
 assert.equal(x.fssr,b.fssr);
 assert.equal(x.fcs,b.fcs);
 assert.equal(x.primary_blocker,b.primary_blocker);
 assert.deepEqual(x.documentary_slots,b.document_slots);
 assert.match(x.official_ctr,/^https:\/\/fssai\.gov\.in\/upload\//);
 assert.match(x.official_finished_identity_url,/^https:\/\/(www\.)?fssai\.gov\.in\//);
 assert.equal(x.result,"NO_EXACT_FINISHED_ARTICLE_APPROVAL");
 assert.equal(x.confirmed_finished_numeric_limit,false);
 assert.equal(x.independent_legal_signoff,false);
 assert.equal(x.lot_lab_pass,false);
 assert(x.legal_scope_obstacle.length>25);
 assert(x.specific_document_to_obtain.length>20);
}
const comparisons=[
 ["04-04-2-cocoa-beans","Cocoa powder (dry fat-free basis)"],
 ["coffee-chicory-mixture","Coffee"],
 ["11-11-1-misri","Refined sugar"],
 ["11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th","Sorbitol"],
 ["100-100-silver-leaf-chandi-ka-warq","Foods not specified (metal-specific fallback)"]
];
for(const [id,expected] of comparisons){
 const found=rules.cases.find(x=>x.catalog_id===id);
 assert(found, "Missing decisive exact article comparator "+id);
 assert.equal(found.reviewed_comparator_article,expected);
 assert.equal(found.confirmed_finished_numeric_limit,false);
}
const port=18889,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory","fssai-product-helper-preview-01"],{stdio:"ignore"});
const sleep=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let opened=false;
  for(let i=0;i<35;i++){try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:14000});
   if(r?.ok()){opened=true;break}
  }catch(_){await sleep(180)}}
  assert(opened,"Cannot serve the complete PMSV preview");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB26Valid()),"B26 official source identity verification blocked");
  const status=await page.evaluate(()=>({
   catalogue:pmsv498Ledger.records.length,
   conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   rows:document.querySelectorAll("[data-pmsv-b26-rows] tr").length,
   legal:pmsvB26Data.results.legal_approvals,
   passes:pmsvB26Data.results.lot_passes
  }));
  assert.deepEqual(status,{catalogue:533,conditional:498,pending:35,rows:35,legal:0,passes:0});
  const panel=page.locator("#pmsv-b26-exact-article-adjudication");
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b26-search]").fill("silver leaf");
  assert.equal(await panel.locator("[data-pmsv-b26-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b26-open]").click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),"100-100-silver-leaf-chandi-ka-warq");
  await panel.locator("[data-pmsv-b26-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b26-rows] tr").count(),35);
  const proof=await page.evaluate(()=>({
   x:pmsvB26Data.cases.find(x=>x.catalog_id==="05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake"),
   result:pmsv498Ledger.first_source_pending
  }));
  assert(proof.x.legal_scope_obstacle.includes("different fat/matrix"));
  assert.equal(proof.x.confirmed_finished_numeric_limit,false);
  assert.equal(proof.result,35);
  assert.equal(errors.filter(s=>/pmsvB26/.test(s)).length,0,errors.join(" / "));
  console.log("B26 VERIFIED 35 exact CTR research comparators and browser actions",JSON.stringify(status));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
