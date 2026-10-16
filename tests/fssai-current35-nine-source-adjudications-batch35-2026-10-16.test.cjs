"use strict";
/* Batch35: verify documentary routes and physical Chromium behaviour;
   no official status/recipe is transformed into CTR or lot compliance. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",folder=path.join(root,"data","rules");
const read=f=>JSON.parse(fs.readFileSync(path.join(folder,f),"utf8"));
const d=read("fssai-current35-nine-source-adjudications-batch35-2026-10-16.json");
const b34=read("fssai-current35-remaining16-identity-source-review-batch34-2026-10-16.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-nine-source-adjudications-batch35-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const x of JSON.stringify(o)){let z=x.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(js.includes('const pmsvB35Digest="'+digest(d)+'"'),"digest mismatch");
assert(html.includes("fssai-current35-nine-source-adjudications-batch35-2026-10-16.js?v=20261016-b35"));
assert.equal(d.kind,"PMSV_CURRENT35_NINE_DOCUMENTARY_SOURCE_ROUTES_BATCH35");
assert.equal(d.deployment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.quality_evidence_only,true);
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,d.counts.exact_ctr_cases_pending,
 d.counts.existing_fssr_standards,d.counts.reexamined_identity_cases,
 d.counts.classical_recipe_sources_found,d.counts.closed_withdrawn_application_alerts,
 d.counts.umbrella_entries_still_unspecified,d.counts.unverified_actual_product_lots],
 [533,498,35,26,9,2,1,6,9]);
for(const x of ["finished_ctr_limits_approved","lab_passes"])assert.equal(d.counts[x],0);
assert.equal(d.counts.wordpress_changed,false);
assert.equal(d.results.wordpress_modified,false);
assert.equal(d.results.canonical_ledger_modified,false);
assert.equal(d.results.approved_ctr_exact_article_scope,0);
assert.equal(d.results.assumed_authorizations,0);
const gaps=b34.cases.filter(x=>!x.named_product_standard_found);
assert.equal(gaps.length,9);
const ref=new Map(gaps.map(x=>[x.catalog_id,x]));const seen=new Set();
const Y="EXACT_AYURVEDA_RECIPE_REFERENCE_FOUND_LOT_PENDING";
const C="CLOSED_WITHDRAWN_APPLICATIONS_NOT_APPROVAL";
const U="CLASS_OR_SCHEDULE_ONLY_UNIQUE_FINISHED_IDENTITY_PENDING";
for(const x of d.records){
 const v=ref.get(x.catalog_id);assert(v,"unmatched "+x.catalog_id);
 assert(!seen.has(x.catalog_id));seen.add(x.catalog_id);
 for(const k of ["rank","product_name","fssr","fcs"])assert.equal(x[k],v[k]);
 assert.equal(x.prior_blocker,v.primary_blocker);
 assert(x.documentary_checklist.length>=4);
 assert(x.source_refs.every(s=>/^https:\/\/(?:www\.|fcstraining\.|stg-old\.)?fssai\.gov\.in\//.test(s.url)));
 for(const k of ["actual_market_product_recipe_confirmed","market_lot_lab_verified",
 "legal_finished_product_authorization_approved","ctr_exact_article_scope_confirmed",
 "finished_ctr_numeric_limit_applied","compliance_pass"])assert.equal(x[k],false);
}
assert.equal(seen.size,9);
const kind=k=>d.records.filter(x=>x.source_class===k);
assert.equal(kind(Y).length,2);assert.equal(kind(C).length,1);assert.equal(kind(U).length,6);
const sajji=kind(C)[0];assert.equal(sajji.product_name,"Sajji Khar");
assert.equal(sajji.application_status,"CLOSED_OR_WITHDRAWN");
assert.equal(sajji.application_ids.length,4);assert.equal(sajji.not_a_general_ban,true);
assert(sajji.source_refs.some(z=>z.type==="OFFICIAL_APPLICATION_STATUS"));
const milk=d.records.find(x=>x.catalog_id.includes("ksheerapaka"));
const coconut=d.records.find(x=>x.catalog_id.includes("narikela-ksheerika"));
assert.deepEqual(milk.recipe.ingredients.map(x=>x.name),["Buffalo milk","Aromatic flowers","Water","Sugar"]);
assert.equal(milk.recipe.ingredients[0].amount,"Equal to water in method");
assert.equal(coconut.recipe.ingredients.length,2);
assert.equal(coconut.recipe.ingredients[1].name,"Milk");
assert(milk.recipe.published_best_use.includes("classical compendium"));
assert(coconut.recipe.published_best_use.includes("classical compendium"));
const port=18935,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const pause=ms=>new Promise(ok=>setTimeout(ok,ms));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let launched=false;
  for(let i=0;i<40;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){launched=true;break}
  }catch(_){await pause(150)}
  assert(launched,"Browser source unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB35Valid()),"Source integrity not valid in browser");
  const state=await page.evaluate(()=>({
   total:pmsvB35Data.records.length,
   recipes:pmsvB35Data.records.filter(x=>x.source_class===pmsvB35Y).length,
   withdrawn:pmsvB35Data.records.filter(x=>x.source_class===pmsvB35C).length,
   undefinedClasses:pmsvB35Data.records.filter(x=>x.source_class===pmsvB35U).length,
   catalogue:pmsv498Ledger.records.length,
   conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   approvals:pmsvB35Data.counts.finished_ctr_limits_approved
  }));
  assert.deepEqual(state,{total:9,recipes:2,withdrawn:1,undefinedClasses:6,catalogue:533,conditional:498,pending:35,approvals:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB35Refresh();
  });
  const p=page.locator("#pmsv-b35-nine-source-routes");
  assert.equal(await p.locator("[data-pmsv-b35-rows] tr").count(),9);
  await p.locator("summary").click();
  await p.locator("[data-pmsv-b35-kind]").selectOption(Y);
  assert.equal(await p.locator("[data-pmsv-b35-rows] tr").count(),2);
  await p.locator("[data-pmsv-b35-query]").fill("ksheerapaka");
  assert.equal(await p.locator("[data-pmsv-b35-rows] tr").count(),1);
  await p.locator("[data-pmsv-b35-open]").first().click();
  const id=await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue();
  assert.equal(id,"102-102-1-14-7-ksheerapaka-mystic-milk-quartet");
  await p.locator("[data-pmsv-b35-query]").fill("");
  await p.locator("[data-pmsv-b35-kind]").selectOption(C);
  assert.equal(await p.locator("[data-pmsv-b35-rows] tr").count(),1);
  assert.match(await p.locator("[data-pmsv-b35-rows]").innerText(),/closed\/withdrawn/i);
  await p.locator("[data-pmsv-b35-kind]").selectOption(U);
  assert.equal(await p.locator("[data-pmsv-b35-rows] tr").count(),6);
  await p.locator("[data-pmsv-b35-kind]").selectOption("ALL");
  assert.equal(await p.locator("[data-pmsv-b35-rows] tr").count(),9);
  assert.equal(errors.filter(x=>/pmsvB35/.test(x)).length,0,errors.join("\n"));
  console.log("B35 CHROMIUM VERIFIED nine source routes; 2 exact recipes, 1 CLOSED, 6 classes, 533/498/35, 0 CTR approvals",JSON.stringify(state));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
