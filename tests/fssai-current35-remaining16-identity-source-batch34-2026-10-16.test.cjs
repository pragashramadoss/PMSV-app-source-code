"use strict";
/* Regression: Batch34 covers exactly the 16 remaining catalogue cases,
   7 authentic named sources, 9 identity blockers, 0 legal CTR promotions. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",folder=path.join(root,"data","rules");
const read=name=>JSON.parse(fs.readFileSync(path.join(folder,name),"utf8"));
const d=read("fssai-current35-remaining16-identity-source-review-batch34-2026-10-16.json");
const canon=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json");
const priors=[
 "fssai-current35-product-identity-first-sources-batch29-2026-10-16.json",
 "fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.json",
 "fssai-current35-three-commodity-standards-batch31-2026-10-16.json",
 "fssai-current35-egg-colostrum-gazette-batch32-2026-10-16.json",
 "fssai-current35-four-sugar-lactose-tamarind-standards-batch33-2026-10-16.json"
].flatMap(f=>read(f).cases);
const script=fs.readFileSync(path.join(root,"fssai-current35-remaining16-identity-source-review-batch34-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(x){
 const s=JSON.stringify(x);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
assert(script.includes('const pmsvB34Expected="'+digest(d)+'"'));
assert(html.includes('fssai-current35-remaining16-identity-source-review-batch34-2026-10-16.js?v=20261016-b34'));
assert.equal(d.kind,"PMSV_CURRENT35_REMAINING16_OFFICIAL_PRODUCT_IDENTITY_REVIEW_BATCH34");
assert.equal(d.quality_evidence_only,true);
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,
 d.counts.ctr_exact_article_cases_pending,d.counts.previous_named_product_dossiers,
 d.counts.reviewed_remaining_cases,d.counts.new_named_product_standard_sources,
 d.counts.named_product_dossier_total,d.counts.identity_material_gaps_remaining],
 [533,498,35,19,16,7,26,9]);
for(const x of ["new_ctr_article_matches","finished_ctr_limits_approved","actual_lot_passes"])assert.equal(d.counts[x],0);
assert.equal(d.counts.wordpress_changed,false);
assert.equal(d.results.canonical_ledger_modified,false);
assert.equal(d.results.wordpress_modified,false);
assert.equal(d.results.legal_ctr_scope_approvals,0);
assert.equal(d.results.finished_ctr_article_applicability_confirmations,0);
assert.equal(d.results.real_lot_laboratory_passes,0);
assert.equal(canon.cases.length,35);
assert.equal(priors.length,19);assert.equal(new Set(priors.map(x=>x.catalog_id)).size,19);
const prior=new Set(priors.map(x=>x.catalog_id));
const expected=canon.cases.filter(x=>!prior.has(x.catalog_id));
assert.equal(expected.length,16);
const seen=new Set(),reference=new Map(canon.cases.map(x=>[x.catalog_id,x]));
for(const c of d.cases){
 const b=reference.get(c.catalog_id);assert(b,c.catalog_id);
 assert(!prior.has(c.catalog_id)&&!seen.has(c.catalog_id));seen.add(c.catalog_id);
 for(const k of ["rank","product_name","fssr","fcs","primary_blocker"])assert.equal(c[k],b[k]);
 assert.equal(c.old_documentary_gate,b.specific_document_to_obtain);
 assert.equal(c.existing_ctr_comparator,b.reviewed_comparator_article);
 assert.equal(c.existing_ctr_analyte,b.reviewed_analyte);
 for(const k of ["finished_lot_identity_verified","lab_report_verified",
  "ctr_exact_finished_article_approved","approved_finished_numeric_ctr_limit","regulatory_pass"])assert.equal(c[k],false);
 if(c.named_product_standard_found){
  assert(c.clause&&c.source_url&&c.source_kind);
  assert.match(c.source_url,/^https:\/\/(?:www\.|stg-old\.|foscos\.)?fssai\.gov\.in\//);
 }else{
  assert.equal(c.clause,null);assert.equal(c.source_url,null);assert.equal(c.qa.length,0);
 }
}
assert.equal(seen.size,16);
assert.equal(d.cases.filter(x=>x.named_product_standard_found).length,7);
assert.equal(d.cases.filter(x=>!x.named_product_standard_found).length,9);
const get=id=>{const x=d.cases.find(c=>c.catalog_id===id);assert(x,id);return x;};
assert.equal(get("04-04-2-cocoa-beans").clause,"2.3.54");
assert.deepEqual(get("04-04-2-cocoa-beans").qa.map(q=>q.value),[8,4,8,2,4]);
assert.equal(get("04-04-1-frozen-fruits-fruit-products").qa[0].value,-18);
assert.equal(get("06-06-2-arrowroot").qa.length,0);
assert.equal(get("10-10-2-egg-powder").clause,"2.5.3(3)");
assert.equal(get("formulated-supplements-children").qa[0].value,24);
assert.equal(get("100-100-royal-jelly").qa[0].value,1.4);
const port=18934,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const pause=n=>new Promise(resolve=>setTimeout(resolve,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let i=0;i<40;i++){
   try{const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
    if(r?.ok()){loaded=true;break}
   }catch(_){await pause(150)}
  }
  assert(loaded,"PMSV preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80 migration: the live preview intentionally defers extended documentary research.
  // Explicitly load and revalidate the real source chain before legacy deep-panel assertions.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core source integrity is blocked");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full evidence research must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB34Valid()),"B34 digest/source validation failed in Chromium");
  const status=await page.evaluate(()=>({
   cases:pmsvB34Data.cases.length,
   named:pmsvB34Data.cases.filter(x=>x.named_product_standard_found).length,
   gaps:pmsvB34Data.cases.filter(x=>!x.named_product_standard_found).length,
   products:pmsv498Ledger.records.length,
   conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   approved:pmsvB34Data.counts.finished_ctr_limits_approved
  }));
  assert.deepEqual(status,{cases:16,named:7,gaps:9,products:533,conditional:498,pending:35,approved:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB34Refresh();
  });
  const panel=page.locator("#pmsv-b34-remaining16-sources");
  assert.equal(await panel.locator("[data-pmsv-b34-rows] tr").count(),16);
  await panel.locator("summary").click();
  await panel.locator("[data-pmsv-b34-status]").selectOption("NAMED");
  assert.equal(await panel.locator("[data-pmsv-b34-rows] tr").count(),7);
  await panel.locator("[data-pmsv-b34-search]").fill("cocoa");
  assert.equal(await panel.locator("[data-pmsv-b34-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b34-open]").first().click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),"04-04-2-cocoa-beans");
  await panel.locator("[data-pmsv-b34-search]").fill("");
  await panel.locator("[data-pmsv-b34-status]").selectOption("GAPS");
  assert.equal(await panel.locator("[data-pmsv-b34-rows] tr").count(),9);
  await panel.locator("[data-pmsv-b34-status]").selectOption("ALL");
  assert.equal(await panel.locator("[data-pmsv-b34-rows] tr").count(),16);
  assert.equal(errors.filter(x=>/pmsvB34/.test(x)).length,0,errors.join("\n"));
  console.log("B34 CHROMIUM VERIFIED: 16 reviewed, 7 FSSR identities, 9 blocked; 533/498/35; zero CTR approvals",JSON.stringify(status));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(err=>{console.error(err);process.exitCode=1;server.kill("SIGTERM")});
