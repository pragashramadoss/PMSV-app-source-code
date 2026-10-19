"use strict";
/* Actual current 35-case identity; 20 published official CTR reference rows;
 * 22 remaining products must all remain unapproved and source pending. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),
{spawn}=require("node:child_process"),{chromium}=require("playwright");
const rules="fssai-product-helper-preview-01/data/rules/";
const read=p=>JSON.parse(fs.readFileSync(path.join(rules,p),"utf8"));
const d=read("fssai-current35-remaining22-source-compare-batch28-2026-10-16.json"),
b=read("fssai-current35-exact-article-adjudication-batch26-2026-10-16.json"),
old=read("fssai-current35-source-row-proof-register-batch27-2026-10-16.json");
function digest(v){const s=JSON.stringify(v);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
const js=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-remaining22-source-compare-batch28-2026-10-16.js","utf8");
assert(js.includes('const pmsvB28Expected="'+digest(d)+'"'),"B28 source fingerprint mismatch");
assert.equal(d.rows.length,20);assert.equal(d.cases.length,22);
assert.equal(d.reconciliation.catalogue,533);
assert.equal(d.reconciliation.conditional_first_source,498);
assert.equal(d.reconciliation.first_exact_source_pending,35);
assert.equal(d.reconciliation.official_article_promotions,0);
assert.equal(d.reconciliation.auto_limits,0);
assert.equal(d.reconciliation.legal_approvals,0);
assert.equal(d.reconciliation.lot_passes,0);
assert.equal(d.reconciliation.wordpress_modified,false);
assert.equal(d.future_amendment_applied,false);
const known=new Map(b.cases.map(x=>[x.catalog_id,x])),prior=new Set(old.rows.flatMap(x=>x.catalog_ids));
const rows=new Map(),used=new Set();
for(const z of d.rows){
 assert(!rows.has(z.id),z.id);rows.set(z.id,z);
 assert.equal(z.official_url,b.source_reference+"#page="+(z.pdf_page_zero_based+1));
 assert.equal(z.official_table_text_checked,true);
 assert.equal(z.finished_product_scope_proven,false);
 assert.equal(z.limit_applied,false);assert.equal(z.lot_pass,false);
 assert(z.transfer_disqualifier.length>35);
 for(const k of z.related_case_ids){assert(known.has(k)&&!prior.has(k),k);used.add(k)}
}
assert.equal(used.size,22);
const seen=new Set();
for(const c of d.cases){
 assert(!seen.has(c.catalog_id));seen.add(c.catalog_id);
 assert(!prior.has(c.catalog_id));const original=known.get(c.catalog_id);assert(original);
 for(const k of ["rank","product_name","fssr","fcs","primary_blocker"])assert.equal(c[k],original[k]);
 assert.equal(c.exact_article_status,"INDEPENDENT_ADJUDICATION_PENDING");
 assert.equal(c.direct_applicability_approved,false);
 assert.equal(c.numeric_limit_applied,false);assert.equal(c.lab_pass,false);
 assert(c.official_comparator_row_ids.length>=1);
 assert(c.official_comparator_row_ids.every(id=>rows.get(id)?.related_case_ids.includes(c.catalog_id)));
}
assert.equal(seen.size,22);
assert.equal(new Set([...seen,...prior]).size,35);
assert.equal(d.cases.filter(x=>x.decision_class.startsWith("GENERIC_OR_CONTAINER")).length,3);
const proof={
"CTR28-WATER-LEAD":["Lead",0.01,"mg/L",4],
"CTR28-WATER-COPPER":["Copper",0.05,"mg/L",6],
"CTR28-DAIRY-MILK-LEAD":["Lead",0.02,"mg/kg",4],
"CTR28-DAIRY-MILK-ARSENIC":["Arsenic",0.1,"mg/kg",8],
"CTR28-PULP-COPPER":["Copper",5,"mg/kg",6],
"CTR28-PULP-ARSENIC":["Arsenic",0.2,"mg/kg",9],
"CTR28-SALT-CADMIUM":["Cadmium",0.5,"mg/kg",11],
"CTR28-SODIUM-HYDROXIDE-MERCURY":["Mercury",1.5,"mg/kg",11],
"CTR28-ARSENIC-FALLBACK":["Arsenic",1.1,"mg/kg",8]
};
for(const [id,v] of Object.entries(proof)){
 const x=rows.get(id);assert(x,id);
 assert.deepEqual([x.analyte,x.source_limit,x.unit,x.pdf_page_zero_based],v);
}
const port=18894,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory","fssai-product-helper-preview-01"],{stdio:"ignore"});
const sleep=n=>new Promise(r=>setTimeout(r,n));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let n=0;n<40;n++)try{
   const response=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:14000});
   if(response?.ok()){loaded=true;break}
  }catch(_){await sleep(120)}
  assert(loaded,"FSSAI helper preview did not respond");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80 migration: the live preview intentionally defers extended documentary research.
  // Explicitly load and revalidate the real source chain before legacy deep-panel assertions.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Fail closed when core source integrity is blocked");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full evidence research must load and validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  assert(await page.evaluate(()=>pmsvB28Valid()),"Batch 28 source/case integrity blocked");
  const live=await page.evaluate(()=>({
   ledger:pmsv498Ledger.records.length,
   pending:pmsv498Ledger.first_source_pending,
   conditional:pmsv498Ledger.partial_exact,
   rows:pmsvB28Data.rows.length,
   cases:pmsvB28Data.cases.length,
   approvals:pmsvB28Data.reconciliation.legal_approvals
  }));
  assert.deepEqual(live,{ledger:533,pending:35,conditional:498,rows:20,cases:22,approvals:0});
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB28Refresh();
  });
  const panel=page.locator("#pmsv-b28-remaining22-panel");
  assert.equal(await panel.locator("[data-pmsv-b28-rows] tr").count(),22);
  await panel.locator("summary").first().click();
  await panel.locator("[data-pmsv-b28-search]").fill("colostrum");
  assert.equal(await panel.locator("[data-pmsv-b28-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b28-open]").click();
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-select]").inputValue(),
  "100-100-cow-or-buffalo-colostrum-and-colostrum-products");
  await panel.locator("[data-pmsv-b28-search]").fill("");
  await panel.locator("[data-pmsv-b28-filter]").selectOption("GENERIC_OR_CONTAINER_COMPARATOR_NOT_AN_EXACT_NAMED_FINISHED_FOOD");
  assert.equal(await panel.locator("[data-pmsv-b28-rows] tr").count(),3);
  await panel.locator("[data-pmsv-b28-filter]").selectOption("ALL");
  assert.equal(await panel.locator("[data-pmsv-b28-rows] tr").count(),22);
  assert.equal(errors.filter(x=>/pmsvB28/.test(x)).length,0,errors.slice(0,5).join(" | "));
  console.log("B28 REAL CHROMIUM PASS",JSON.stringify(live));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
