"use strict";
/* B29: verify exact named FSSR quality article text and non-CTR semantics,
 * including live browser reviewer navigation and unpromoted CTR queue. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const dir="fssai-product-helper-preview-01",folder=path.join(dir,"data","rules");
const read=file=>JSON.parse(fs.readFileSync(path.join(folder,file),"utf8"));
const current=read("fssai-current35-product-identity-first-sources-batch29-2026-10-16.json");
const queue=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json");
const before=read("fssai-current35-remaining22-source-compare-batch28-2026-10-16.json");
function digest(v){
 const s=JSON.stringify(v);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
const file=fs.readFileSync(path.join(dir,"fssai-current35-product-identity-first-sources-batch29-2026-10-16.js"),"utf8");
assert(file.includes('const pmsvB29Expected="'+digest(current)+'"'));
assert.equal(current.cases.length,7);
assert.equal(current.coverage.product_standards_found,7);
assert.equal(current.coverage.quality_spec_entries,21);
assert.equal(current.coverage.first_exact_ctr_source_pending,35);
assert.equal(current.coverage.ctr_source_promotions,0);
assert.equal(current.coverage.regulatory_compliance_approvals,0);
assert.equal(current.coverage.lab_lot_pass,0);
assert.equal(current.results.wordpress_modified,false);
assert.equal(before.reconciliation.first_exact_source_pending,35);
const source=new Map(queue.cases.map(c=>[c.catalog_id,c]));
let counts=0,ids=new Set();
for(const c of current.cases){
 assert(!ids.has(c.catalog_id),c.catalog_id);ids.add(c.catalog_id);
 const q=source.get(c.catalog_id);assert(q);
 for(const k of ["product_name","fssr","fcs"])assert.equal(c[k],q[k]);
 assert.match(c.official_product_standard_source,/^https:\/\/(?:www\.)?fssai\.gov\.in\/upload\/uploadfiles\/files\//);
 assert(c.official_fssr_clause);
 assert.equal(c.published_identity_standard_found,true);
 assert.equal(c.actual_lot_tested,false);
 assert.equal(c.contaminant_article_verified,false);
 assert.equal(c.first_exact_ctr_source_pending,true);
 assert.equal(c.compliance_approved,false);
 assert(c.decision_evidence.length>20);
 counts+=c.product_standard_requirements.length;
 for(const z of c.product_standard_requirements){
  assert(z.parameter&&z.unit&&z.basis);
  assert(["min","max","required"].includes(z.comparison));
  if(z.comparison==="required")assert.equal(z.value,null);
  else assert(Number.isFinite(z.value));
 }
}
assert.equal(counts,21);
const find=(s,k)=>{const c=current.cases.find(x=>x.catalog_id.includes(s));assert(c,s);const n=c.product_standard_requirements.find(r=>r.parameter===k);assert(n,k);return n;};
assert.deepEqual([find("silver-leaf","Silver foil weight").value,find("silver-leaf","Silver fineness").value],[2.8,999]);
assert.deepEqual([find("trehalose","Loss on drying").value,find("trehalose","Total ash").value],[1.5,0.05]);
assert.equal(find("catechu","Ash insoluble in HCl").value,0.5);
assert.equal(find("carob","Tannin content upper").value,0.15);
assert.equal(find("dietary-fibre","Average degree of polymerization upper").value,25);
assert.equal(find("coffee-chicory","Coffee mass fraction").value,51);
assert.equal(find("purified-vending","Visual clarity without sediments").value,null);
const port=18895,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",dir],{stdio:"ignore"});
const sleep=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let i=0;i<40;i++){try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:14000});
   if(r?.ok()){loaded=true;break}
  }catch(_){await sleep(150)}}
  assert(loaded,"Preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80 migration: the live preview intentionally defers extended documentary research.
  // Explicitly load and revalidate the real source chain before legacy deep-panel assertions.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core source integrity is blocked");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full evidence research must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB29Valid()),"B29 source standards integrity failure");
  const pre=await page.evaluate(()=>({
   cases:pmsvB29Data.cases.length,
   requirements:pmsvB29Data.cases.flatMap(x=>x.product_standard_requirements).length,
   catalogue:pmsv498Ledger.records.length,
   conditional:pmsv498Ledger.partial_exact,
   pending:pmsv498Ledger.first_source_pending,
   approvals:pmsvB29Data.coverage.regulatory_compliance_approvals
  }));
  assert.deepEqual(pre,{cases:7,requirements:21,catalogue:533,conditional:498,pending:35,approvals:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB29Refresh();
  });
  const panel=page.locator("#pmsv-b29-exact-fssr-product-standards");
  assert.equal(await panel.locator("[data-pmsv-b29-rows] tr").count(),7);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b29-search]").fill("trehalose");
  assert.equal(await panel.locator("[data-pmsv-b29-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b29-open]").click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),"99-99-1-trehalose");
  await panel.locator("[data-pmsv-b29-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b29-rows] tr").count(),7);
  assert.equal(errors.filter(s=>/pmsvB29/.test(s)).length,0,errors.join("\n"));
  console.log("B29 CHROMIUM PRODUCT-STANDARD PASS",JSON.stringify(pre));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
