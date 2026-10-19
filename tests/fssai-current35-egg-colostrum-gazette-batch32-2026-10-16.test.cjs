"use strict";
/* Batch32: current notified 2024 Gazette egg/colostrum replaces old quality
 * criteria; the 35 CTR-source cases remain unverified. Real Chromium checks. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",dir=path.join(root,"data","rules");
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),"utf8"));
const d=read("fssai-current35-egg-colostrum-gazette-batch32-2026-10-16.json");
const cases=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json").cases;
const previous=[
 "fssai-current35-product-identity-first-sources-batch29-2026-10-16.json",
 "fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.json",
 "fssai-current35-three-commodity-standards-batch31-2026-10-16.json"
].flatMap(name=>read(name).cases.map(x=>x.catalog_id));
function hash(d){
 const s=JSON.stringify(d);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
const js=fs.readFileSync(path.join(root,"fssai-current35-egg-colostrum-gazette-batch32-2026-10-16.js"),"utf8");
assert(js.includes('const pmsvB32Expected="'+hash(d)+'"'),"Mismatch in checksum for official Gazette dataset");
assert.equal(d.cases.length,2);assert.equal(d.counts.total_named_fssr_product_standards,15);
assert.equal(d.counts.amended_composition_criteria,8);
assert.equal(d.operative_effective,"2025-05-01");
assert.equal(d.counts.canonical_catalogue,533);
assert.equal(d.counts.conditional_references,498);
assert.equal(d.counts.first_exact_ctr_pending,35);
assert.equal(d.counts.approved_ctr_promotions,0);
assert.equal(d.counts.lot_pass,0);
assert.equal(d.counts.wordpress_mutated,false);
assert.equal(d.results.canonical_ledger_modified,false);
assert.equal(d.results.legal_ctr_source_approvals,0);
assert.equal(d.results.wordpress_modified,false);
const truth=new Map(cases.map(x=>[x.catalog_id,x]));
for(const c of d.cases){
 const y=truth.get(c.catalog_id);
 assert(y,c.catalog_id);assert(!previous.includes(c.catalog_id));
 for(const x of ["product_name","fssr","fcs"])assert.equal(c[x],y[x]);
 assert.equal(c.positive_fssr_standard_located,true);
 assert.equal(c.finished_lot_variant_confirmed,false);
 assert.equal(c.real_lab_report_verified,false);
 assert.equal(c.ctr_contaminant_scope_approved,false);
 assert.equal(c.compliance_pass,false);
 assert.equal(c.official_amendment_url,d.official_gazette_url);
 assert(c.quality_requirements.every(q=>Number.isFinite(q.value)&&q.relation==="min"||q.relation==="max"));
}
const egg=d.cases.find(x=>x.catalog_id==="10-10-3-pickled-eggs");
const dairy=d.cases.find(x=>x.catalog_id==="100-100-cow-or-buffalo-colostrum-and-colostrum-products");
assert(egg&&dairy);
assert.equal(egg.quality_requirements.length,6);
assert.equal(dairy.quality_requirements.length,2);
const get=(c,v,n)=>c.quality_requirements.find(q=>q.variant===v&&q.parameter===n);
assert.deepEqual(["VINEGAR_BASED","OIL_BASED"].map(v=>[get(egg,v,"Acidity as acetic acid").value,
 get(egg,v,"Sodium chloride").value,get(egg,v,"Pickling solution pH").value]),[[0.8,3,3.2],[0.6,3,3.6]]);
assert.equal(get(dairy,"LIQUID_COLOSTRUM","Immunoglobulins-G (IgG)").value,1.8);
assert.equal(get(dairy,"COLOSTRUM_POWDER","Immunoglobulins-G (IgG)").value,8.5);
assert(!dairy.quality_requirements.some(x=>x.value===12.5));
const port=18898,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const sleep=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let served=false;
  for(let i=0;i<40;i++){try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:14000});
   if(r?.ok()){served=true;break}
  }catch(_){await sleep(150)}}
  assert(served,"PMSV preview not served");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
    ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80 migration: the live preview intentionally defers extended documentary research.
  // Explicitly load and revalidate the real source chain before legacy deep-panel assertions.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core source integrity is blocked");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full evidence research must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB32Valid()),"Batch32 integrity check blocked");
  const state=await page.evaluate(()=>({
   cases:pmsvB32Data.cases.length,
   rules:pmsvB32Data.cases.flatMap(c=>c.quality_requirements).length,
   catalogue:pmsv498Ledger.records.length,
   partial:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   approvals:pmsvB32Data.counts.approved_ctr_promotions
  }));
  assert.deepEqual(state,{cases:2,rules:8,catalogue:533,partial:498,pending:35,approvals:0});
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB32Refresh()});
  const panel=page.locator("#pmsv-b32-operative-gazette");
  assert.equal(await panel.locator("[data-pmsv-b32-rows] tr").count(),2);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b32-search]").fill("IgG");
  assert.equal(await panel.locator("[data-pmsv-b32-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b32-open]").click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),
    "100-100-cow-or-buffalo-colostrum-and-colostrum-products");
  await panel.locator("[data-pmsv-b32-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b32-rows] tr").count(),2);
  assert.equal(errors.filter(e=>/pmsvB32/.test(e)).length,0,errors.join("\n"));
  console.log("B32 CHROMIUM VALIDATED",JSON.stringify(state));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
