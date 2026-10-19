"use strict";
/* Batch30 3 newly located official FSSR product standards, 25 conditional
 * quality criteria; never imply actual batch PASS or CTR contaminant approval. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",dir=path.join(root,"data","rules");
const read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
const d=read("fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.json");
const b=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json");
const prev=read("fssai-current35-product-identity-first-sources-batch29-2026-10-16.json");
function dig(x){
 const s=JSON.stringify(x);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
const script=fs.readFileSync(path.join(root,"fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.js"),"utf8");
assert(script.includes('const pmsvB30Expected="'+dig(d)+'"'));
assert.equal(d.kind,"PMSV_CURRENT35_ADDITIONAL_THREE_EXACT_FSSR_STANDARDS_BATCH30");
assert.equal(d.cases.length,3);
assert.equal(d.counts.catalogue,533);
assert.equal(d.counts.conditional_source_references,498);
assert.equal(d.counts.pending_exact_ctr_first_sources,35);
assert.equal(d.counts.total_named_fssr_research_standards,10);
assert.equal(d.counts.source_quality_rules_checked,25);
assert.equal(d.counts.ctr_source_promotions,0);
assert.equal(d.counts.actual_lot_passes,0);
assert.equal(d.counts.wordPress_mutations,0);
assert.equal(d.results.independent_ctr_scope_decisions,0);
assert.equal(d.results.canonical_ledger_modified,false);
assert.equal(d.results.wordpress_modified,false);
assert.equal(prev.cases.length,7);
const used=new Set(prev.cases.map(x=>x.catalog_id)),known=new Map(b.cases.map(x=>[x.catalog_id,x]));
let rules=0;
for(const x of d.cases){
 assert(!used.has(x.catalog_id),x.catalog_id);
 used.add(x.catalog_id);
 const original=known.get(x.catalog_id);assert(original,x.catalog_id);
 for(const k of ["product_name","fssr","fcs"])assert.equal(x[k],original[k]);
 assert(["2.7.6","2.7.8","2.9.30(6)"].includes(x.official_clause));
 assert.match(x.official_fssr_source,/^https:\/\/stg-old\.fssai\.gov\.in\/upload\/uploadfiles\/files\//);
 assert.equal(x.exactly_named_fssr_standard_identified,true);
 assert.equal(x.finished_product_identity_verified,false);
 assert.equal(x.actual_batch_test_pass,false);
 assert.equal(x.ctr_scope_verified,false);
 assert.equal(x.approved_finished_ctr_limit,false);
 for(const r of x.requirements){
  assert(r.parameter&&r.unit&&r.finished_form&&r.analytical_basis&&r.qualification);
  assert(["min","max","max_exclusive","required"].includes(r.comparison));
  if(r.comparison==="required")assert.equal(r.value,null);
  else assert(Number.isFinite(r.value)&&r.value>=0);
  rules++;
 }
}
assert.equal(rules,25);
const matches=(name,property)=>d.cases.find(x=>x.catalog_id.includes(name)).requirements.filter(z=>z.parameter===property);
const fat=matches("cocoa-mass","Cocoa butter");assert.deepEqual(fat.map(x=>x.value),[47,60]);
const salt=matches("salt-substitutes","Sodium in finished salt substitute");assert.equal(salt[0].value,120);
const chocolate=matches("dry-mixtures","Cocoa powder in chocolate powder");assert.equal(chocolate[0].value,32);
const port=18896,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const sleep=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let ok=false;
  for(let i=0;i<35;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:14000});
   if(r?.ok()){ok=true;break}
  }catch(_){await sleep(140)}
  assert(ok,"preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80 migration: the live preview intentionally defers extended documentary research.
  // Explicitly load and revalidate the real source chain before legacy deep-panel assertions.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core source integrity is blocked");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full evidence research must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB30Valid()),"B30 FSSR legal-source identity verification blocked");
  const state=await page.evaluate(()=>({
   standardCases:pmsvB30Data.cases.length,
   criteria:pmsvB30Data.cases.reduce((a,c)=>a+c.requirements.length,0),
   canonical:pmsv498Ledger.records.length,
   conditional:pmsv498Ledger.partial_exact,
   unresolved:pmsv498Ledger.first_source_pending,
   approved:pmsvB30Data.counts.ctr_source_promotions
  }));
  assert.deepEqual(state,{standardCases:3,criteria:25,canonical:533,conditional:498,unresolved:35,approved:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB30Refresh();
  });
  const panel=page.locator("#pmsv-b30-fssr-cocoa-salt-variants");
  assert.equal(await panel.locator("[data-pmsv-b30-rows] tr").count(),3);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b30-search]").fill("magnesium");
  assert.equal(await panel.locator("[data-pmsv-b30-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b30-open]").click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),"12-12-1-salt-substitutes");
  await panel.locator("[data-pmsv-b30-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b30-rows] tr").count(),3);
  assert.equal(errors.filter(e=>/pmsvB30/.test(e)).length,0,errors.join("\n"));
  console.log("B30 CHROMIUM PASS",JSON.stringify(state));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
