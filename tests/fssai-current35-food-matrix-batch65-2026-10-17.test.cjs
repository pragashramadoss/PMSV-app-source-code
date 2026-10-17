"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const dir="fssai-product-helper-preview-01";
const rd=n=>JSON.parse(fs.readFileSync(path.join(dir,"data/rules",n),"utf8"));
const d=rd("fssai-current35-food-matrix-classification-batch65-2026-10-17.json");
const b59=rd("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const b64=rd("fssai-current35-vending-children-polyols-batch64-2026-10-17.json");
const script=fs.readFileSync(path.join(dir,"fssai-current35-food-matrix-classification-batch65-2026-10-17.js"),"utf8");
const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
function hash(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){let n=ch.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(script.includes('const pin="'+hash(d)+'"'),"B65 digest mismatch");
assert.equal(d.ancestor_b59_digest,hash(b59));assert.equal(d.ancestor_b64_digest,hash(b64));
assert(html.indexOf("food-matrix-classification-batch65")>html.indexOf("vending-children-polyols-batch64"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|WebSocket)/.test(script));
assert.equal(d.kind,"PMSV_BATCH65_FOUR_P0_EXACT_FOOD_ARTICLE_COMPOSITE_NONTRANSFER");
const t=d.totals,p=new Map(b59.cases.map(x=>[x.rank,x])),seen=new Set(),ids=new Set();
assert.equal(t.catalogue,533);assert.equal(t.conditional_first_source_matched,498);
assert.equal(t.original_open_ctr_cases,35);assert.equal(t.p0_open,13);assert.equal(t.p1_open,22);
assert.equal(t.researched_p0_cases,4);assert.equal(t.other_held_cases_unmodified,31);
assert.equal(t.original_requests_all,175);assert.equal(t.original_requests_in_this_batch,20);
assert.equal(t.distinct_colostrum_from_plain_milk,1);
assert.equal(t.ayurveda_composite_recipe_distinctions,2);
assert.equal(t.earlier_vs_newer_ayurveda_recipe_presentation_difference,1);
for(const name of ["validated_case_ctr_numeric_limits","confirmed_commercial_products",
 "actual_coas","approved_lab_scopes","lot_passes"])assert.equal(t[name],0);
assert.equal(t.wordpress_modified,false);
for(const c of d.cases){
 const orig=p.get(c.rank);assert(orig&&c.priority==="P0");
 assert(!seen.has(c.rank));seen.add(c.rank);
 assert.equal(c.product_name,orig.product_name);assert.equal(c.analyte,orig.analyte);
 assert.equal(c.catalogue_id,orig.catalogue_id);assert.equal(c.original_legal_gate,orig.original_legal_gate);
 assert.deepEqual(c.original_five_request_ids,orig.original_request_ids);
 assert(c.source.startsWith("https://")&&c.confirmed_identity&&c.scope_exclusion);
 for(const k of ["operative_case_ctr_gazette_authenticated","actual_manufacturer_product_confirmed",
  "signed_analyte_commodity_numeric_maximum","lab_scope_and_method_approved",
  "representative_lot_coa_pass","commercial_product_released"])assert.equal(c[k],false);
 for(const id of c.original_five_request_ids){assert(!ids.has(id));ids.add(id);}
}
assert.deepEqual([...seen].sort((a,b)=>a-b),[6,30,33,34]);assert.equal(ids.size,20);
assert.match(d.cases.find(c=>c.rank===30).confirmed_identity,/free from colostrum/);
assert.match(d.cases.find(c=>c.rank===33).confirmed_identity,/cow milk/);
assert.match(d.cases.find(c=>c.rank===34).confirmed_identity,/buffalo milk/);
assert.equal(d.published_version_conflict.older_presentation,"Pana/Drinkable");
assert.equal(d.published_version_conflict.newer_order_presentation,"Ashita/Eatable");
assert.equal(d.holds.all_35_retained,true);
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setContent('<!doctype html><html><body><div id="pmsv-b64-three-originals"></div></body></html>');
  await page.evaluate(({data,sourceCases})=>{
   window.pmsvB14Digest=v=>{let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(v)){let n=c.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");};
   window.pmsvB59CTRSourceCrosswalk={valid:()=>true,getAllCases:()=>sourceCases};
   window.pmsvLoadPositiveSourceProof=async()=>{};
   window.fetch=async()=>({ok:true,json:async()=>data});
  },{data:d,sourceCases:b59.cases});
  await page.addScriptTag({content:script});
  await page.evaluate(()=>window.pmsvLoadPositiveSourceProof());
  const root=page.locator("#pmsv-b65-four-matrix-classifications");
  await root.evaluate(el=>el.open=true);
  assert.equal(await page.evaluate(()=>window.pmsvB65FourFoodMatrices.valid()),true);
  assert.equal(await root.locator("[data-pmsv-b65-rows] tr").count(),4);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB65FourFoodMatrices.getCounts()),{
   cases:4,colostrum:1,tamarind:1,ayurveda:2,originalRequests:20,
   approvedLegalMaxima:0,testedLotPasses:0,all35Held:true});
  await root.locator("[data-pmsv-b65-type]").selectOption("COLOSTRUM_DISTINCT_FROM_NORMAL_MILK");
  assert.equal(await root.locator("[data-pmsv-b65-rows] tr").count(),1);
  await root.locator("[data-pmsv-b65-type]").selectOption("ALL");
  await root.locator("[data-pmsv-b65-search]").fill("buffalo milk");
  assert.equal(await root.locator("[data-pmsv-b65-rows] tr").count(),1);
  await root.locator("[data-pmsv-b65-search]").fill("");
  const csv=await page.evaluate(()=>window.pmsvB65FourFoodMatrices.csv());
  assert.equal(csv.trim().split(/\r?\n/).length,5);
  assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false","false"')));
  assert.equal(errors.length,0,"Browser exceptions: "+errors.join(" | "));
  console.log("Batch65 PASS (isolated Chromium component): four P0 exact matrices, 20 immutable requests, search/filter and CSV, zero legal or lot release. Full integrated app startup requires separate verification.");
 }catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});