"use strict";
/* Real Chromium: verify Batch31 2025 FSSR chapter text, 3 finished identities,
 * 20 product-quality specs and unchanged 35 CTR source adjudications. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",rules=path.join(root,"data","rules");
const read=p=>JSON.parse(fs.readFileSync(path.join(rules,p),"utf8"));
const b31=read("fssai-current35-three-commodity-standards-batch31-2026-10-16.json"),
 b30=read("fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.json"),
 b29=read("fssai-current35-product-identity-first-sources-batch29-2026-10-16.json"),
 b26=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json");
function digest(x){
 const s=JSON.stringify(x);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
const js=fs.readFileSync(path.join(root,"fssai-current35-three-commodity-standards-batch31-2026-10-16.js"),"utf8");
assert(js.includes('const pmsvB31Expected="'+digest(b31)+'"'),"B31 official source checksum mismatch");
assert.equal(b31.cases.length,3);assert.equal(b31.exact_quality_items,20);
assert.equal(b31.master_ledger,533);assert.equal(b31.conditional_first_source_references,498);
assert.equal(b31.pending_exact_ctr_article_scope,35);
assert.equal(b31.earlier_named_fssr_standards,10);
assert.equal(b31.additional_named_fssr_standards,3);
assert.equal(b31.total_positive_product_standards,13);
assert.equal(b31.new_ctr_article_match_count,0);
assert.equal(b31.approved_finished_numeric_ctr_limit_count,0);
assert.equal(b31.real_laboratory_pass_count,0);
assert.equal(b31.wordpress_modified,false);
assert.equal(b31.future_ctr_amendment_auto_applied,false);
const prev=new Set([...b29.cases,...b30.cases].map(x=>x.catalog_id));
const legal=new Map(b26.cases.map(x=>[x.catalog_id,x]));
let n=0,seen=new Set();
for(const c of b31.cases){
 assert(!prev.has(c.catalog_id),c.catalog_id);assert(!seen.has(c.catalog_id));seen.add(c.catalog_id);
 const original=legal.get(c.catalog_id);assert(original,c.catalog_id);
 for(const k of ["product_name","fssr","fcs"])assert.equal(c[k],original[k]);
 assert.match(c.source_pdf,/^https:\/\/www\.fssai\.gov\.in\/upload\/uploadfiles\/files\/Chapter%202_[34]_/);
 assert(c.legal_product_standard&&c.official_description&&c.documentary_evidence_required);
 assert.equal(c.published_standard_located,true);
 assert.equal(c.finished_product_identity_confirmed,false);
 assert.equal(c.laboratory_coa_verified,false);
 assert.equal(c.ctr_contaminant_article_approved,false);
 assert.equal(c.compliance_approved,false);
 n+=c.checks.length;
 for(const v of c.checks){
  assert(v.name&&["minimum","maximum"].includes(v.relation));
  assert(Number.isFinite(v.value)&&v.value>=0);
  assert(v.unit&&v.analytical_basis&&v.applicable_product);
 }
}
assert.equal(n,20);
const get=(id,name)=>b31.cases.find(x=>x.catalog_id.includes(id)).checks.find(x=>x.name===name);
assert.equal(get("coconut-milk-powder","Moisture").value,2.5);
assert.equal(get("coconut-milk-powder","Fat").value,60);
assert.equal(get("coconut-milk-powder","Free fatty acids of extracted fat").value,0.2);
assert.equal(get("water-chestnut-flour","Protein content").value,9);
assert.equal(get("water-chestnut-flour","Uric acid").value,100);
assert.equal(get("chia-seeds","Moisture").value,11.5);
assert.equal(get("chia-seeds","Mineral impurities").value,0.25);
assert.equal(get("chia-seeds","Impurities of animal origin").value,0.1);
assert.equal(get("chia-seeds","1000-grain weight lower").value,1.2);
assert.equal(get("chia-seeds","1000-grain weight upper").value,1.6);
const port=18897,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const pause=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let served=false;
  for(let i=0;i<35;i++){try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){served=true;break}
  }catch(_){await pause(160)}}
  assert(served,"Batch31 browser preview did not start");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
    ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80 migration: the live preview intentionally defers extended documentary research.
  // Explicitly load and revalidate the real source chain before legacy deep-panel assertions.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core source integrity is blocked");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full evidence research must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB31Valid()),"Batch31 source checksum or case identity failure");
  const status=await page.evaluate(()=>({
    named:pmsvB31Data.cases.length,
    qualities:pmsvB31Data.cases.reduce((s,c)=>s+c.checks.length,0),
    master:pmsv498Ledger.records.length,
    partial:pmsv498Ledger.partial_exact,
    pending:pmsv498Ledger.first_source_pending,
    promotions:pmsvB31Data.new_ctr_article_match_count
  }));
  assert.deepEqual(status,{named:3,qualities:20,master:533,partial:498,pending:35,promotions:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB31Refresh();
  });
  const panel=page.locator("#pmsv-b31-commodity-standards");
  assert.equal(await panel.locator("[data-pmsv-b31-rows] tr").count(),3);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b31-search]").fill("chia");
  assert.equal(await panel.locator("[data-pmsv-b31-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b31-open]").click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),"06-06-1-chia-seeds");
  await panel.locator("[data-pmsv-b31-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b31-rows] tr").count(),3);
  assert.equal(errors.filter(s=>/pmsvB31/.test(s)).length,0,errors.join("\n"));
  console.log("B31 CHROMIUM PASS",JSON.stringify(status));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
