"use strict";
/* B33: four current FSSR product-quality standards, one high-ash source
 * exclusion, zero CTR source or lot approvals. Includes actual Chromium. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",folder=path.join(root,"data","rules");
const read=f=>JSON.parse(fs.readFileSync(path.join(folder,f),"utf8"));
const d=read("fssai-current35-four-sugar-lactose-tamarind-standards-batch33-2026-10-16.json"),
 earlier=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json");
const old=[
 "fssai-current35-product-identity-first-sources-batch29-2026-10-16.json",
 "fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.json",
 "fssai-current35-three-commodity-standards-batch31-2026-10-16.json",
 "fssai-current35-egg-colostrum-gazette-batch32-2026-10-16.json"
].flatMap(f=>read(f).cases.map(x=>x.catalog_id));
function dg(x){
 const s=JSON.stringify(x);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
const js=fs.readFileSync(path.join(root,"fssai-current35-four-sugar-lactose-tamarind-standards-batch33-2026-10-16.js"),"utf8");
assert(js.includes('const pmsvB33Expected="'+dg(d)+'"'));
assert.equal(d.kind,"PMSV_CURRENT35_SUGAR_LACTOSE_TAMARIND_PRODUCT_STANDARDS_BATCH33");
assert.equal(d.cases.length,4);assert.equal(old.length,15);assert.equal(new Set(old).size,15);
assert.deepEqual([d.counts.catalogue,d.counts.conditional_first_source_matches,
 d.counts.ctr_exact_article_cases_pending,d.counts.existing_named_fssr_standards,
 d.counts.total_named_product_standards,d.counts.quality_criteria],[533,498,35,15,19,17]);
assert.equal(d.counts.new_ctr_article_matches,0);
assert.equal(d.counts.finished_ctr_limits_approved,0);
assert.equal(d.counts.actual_lot_passes,0);
assert.equal(d.counts.wordpress_changed,false);
assert.equal(d.results.canonical_ledger_modified,false);
assert.equal(d.results.legal_ctr_scope_approvals,0);
const canonical=new Map(earlier.cases.map(x=>[x.catalog_id,x])),ids=new Set();
let count=0;
for(const c of d.cases){
 const b=canonical.get(c.catalog_id);assert(b,c.catalog_id);
 assert(!old.includes(c.catalog_id));assert(!ids.has(c.catalog_id));ids.add(c.catalog_id);
 for(const k of ["rank","product_name","fssr","fcs"])assert.equal(c[k],b[k]);
 assert.match(c.official_chapter_url,/^https:\/\/(?:stg-old\.)?fssai\.gov\.in\/upload\/uploadfiles\/files\//);
 assert.equal(c.named_product_standard_found,true);
 assert.equal(c.actual_lot_identity_verified,false);
 assert.equal(c.actual_lab_result_verified,false);
 assert.equal(c.ctr_exact_finished_article_approved,false);
 assert.equal(c.finished_numeric_ctr_limit_assigned,false);
 assert.equal(c.regulatory_compliance_pass,false);
 for(const q of c.quality_criteria){
  assert(q.name&&q.unit&&q.basis&&q.qualifier);
  assert(["min","max","qualitative"].includes(q.comparison));
  if(q.comparison==="qualitative")assert.equal(q.value,null);
  else assert(Number.isFinite(q.value)&&q.value>=0);
  count++;
 }
}
assert.equal(count,17);
function test(id,name){let c=d.cases.find(x=>x.catalog_id===id);assert(c,id);let q=c.quality_criteria.find(x=>x.name===name);assert(q,name);return q}
assert.deepEqual(["Total solids","Reducing sugars","Sulphated ash"].map(x=>test("11-11-1-dried-glucose-syrup",x).value),[93,20,1]);
assert.equal(test("11-11-1-edible-lactose","Lactose").value,99);
assert.equal(test("11-11-1-edible-lactose","Sulphated ash").value,0.3);
assert.equal(test("11-11-1-misri","Total ash").value,0.4);
assert.equal(test("11-11-1-misri","Total sugar expressed as sucrose").value,98);
assert.equal(test("04-04-1-seedless-tamarind","Residual tamarind seeds").value,0.5);
const syrup=d.cases.find(x=>x.catalog_id==="11-11-1-dried-glucose-syrup");
assert(syrup.legal_ctr_nontransfer_reason.includes(">1%")&&syrup.legal_ctr_nontransfer_reason.includes("excluded"));
const port=18903,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",root],{stdio:"ignore"});
const pause=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let i=0;i<40;i++)try{
   let r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:14000});
   if(r?.ok()){loaded=true;break}
  }catch(_){await pause(140)}
  assert(loaded,"PMSV preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
    ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB33Valid()),"B33 integrity or upstream check failed");
  const status=await page.evaluate(()=>({
    products:pmsvB33Data.cases.length,requirements:pmsvB33Data.cases.flatMap(x=>x.quality_criteria).length,
    catalogue:pmsv498Ledger.records.length,conditional:pmsv498Ledger.partial_exact,
    pending:pmsv498Ledger.first_source_pending,approved:pmsvB33Data.counts.finished_ctr_limits_approved
  }));
  assert.deepEqual(status,{products:4,requirements:17,catalogue:533,conditional:498,pending:35,approved:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB33Refresh();
  });
  const panel=page.locator("#pmsv-b33-product-source-proof");
  assert.equal(await panel.locator("[data-pmsv-b33-rows] tr").count(),4);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b33-search]").fill("sulphated ash");
  assert.equal(await panel.locator("[data-pmsv-b33-rows] tr").count(),3);
  await panel.locator("[data-pmsv-b33-open]").first().click();
  const choice=await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue();
  assert(["11-11-1-edible-lactose","11-11-1-dried-glucose-syrup"].includes(choice),choice);
  await panel.locator("[data-pmsv-b33-search]").fill("");
  assert.equal(await panel.locator("[data-pmsv-b33-rows] tr").count(),4);
  assert.equal(errors.filter(x=>/pmsvB33/.test(x)).length,0,errors.join("\n"));
  console.log("B33 CHROMIUM VERIFIED 4 named FSSR product standards, 17 criteria; high-ash comparison excluded; 533/498/35 unchanged",JSON.stringify(status));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
