"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),
 {chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const load=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const data=load("fssai-current35-vending-children-polyols-batch64-2026-10-17.json");
const b59=load("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const b63=load("fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.json");
const panel=fs.readFileSync(path.join(root,"fssai-current35-vending-children-polyols-batch64-2026-10-17.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(panel.includes('const digest="'+digest(data)+'"'));
assert.equal(data.predecessor_b59_digest,digest(b59));
assert.equal(data.predecessor_b63_digest,digest(b63));
assert(html.indexOf("vending-children-polyols-batch64")>html.indexOf("cocoa-sugar-identity-batch63"));
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest|WebSocket)/.test(panel));
const t=data.totals;
assert.equal(data.kind,"PMSV_BATCH64_THREE_P0_ACTUAL_ORIGINAL_LAW_AND_DRAFT_SEPARATION");
assert.equal(t.catalogue,533);assert.equal(t.conditionally_matched,498);
assert.equal(t.open_ctr_cases,35);assert.equal(t.p0_total,13);assert.equal(t.p1_total,22);
assert.equal(t.reviewed_p0_cases,3);assert.equal(t.other_cases_unchanged,32);
assert.equal(t.unchanged_original_evidence_requests,175);
assert.equal(t.reviewed_original_request_ids,15);
assert.equal(t.original_2019_vending_water_class_clause_verified,1);
assert.equal(t.age_specific_children_standard_narrowed,1);
assert.equal(t.generic_polyol_class_versus_sorbitol_distinguished,1);
for(const k of ["draft_water_lead_limits_activated","packaged_water_lead_limits_transferred",
 "infant_food_lead_limits_transferred","sorbitol_nickel_class_limits_transferred",
 "commercial_products_identified","signed_case_ctr_legal_limits","accredited_lab_scopes","actual_lot_passes"])assert.equal(t[k],0);
assert.equal(t.wordpress_modified,false);
assert.equal(data.controls.final_2025_water_notice_authenticated,false);
assert.equal(data.controls.preserve_all_35_holds,true);
assert.equal(data.controls.no_draft_value_promoted,true);
assert.equal(data.controls.no_related_article_comparator_promoted,true);
const prior=new Map(b59.cases.map(c=>[c.rank,c])),found=new Set(),requests=new Set();
for(const c of data.cases){
 const p=prior.get(c.rank);assert(p,"Unexpected case "+c.rank);
 assert.equal(c.priority,"P0");assert(!found.has(c.rank));found.add(c.rank);
 assert.equal(c.product_name,p.product_name);assert.equal(c.analyte,p.analyte);
 assert.equal(c.catalogue_id,p.catalogue_id);assert.equal(c.original_legal_gate,p.original_legal_gate);
 assert.deepEqual(c.original_five_gate_ids,p.original_request_ids);
 assert(c.original_source.startsWith("https://")&&c.original_law_fact);
 for(const k of ["actual_manufacturer_article_authenticated","signed_applicable_ctr_limit",
  "method_lab_scope_authenticated","representative_lot_pass","product_released"])assert.equal(c[k],false);
 for(const id of c.original_five_gate_ids){assert(!requests.has(id));requests.add(id);}
}
assert.deepEqual([...found].sort((a,b)=>a-b),[1,3,21]);assert.equal(requests.size,15);
const water=data.cases.find(c=>c.rank===1);
assert(water.original_source.endsWith("Gazette_Notification_Drinking_Water_05_02_2019.pdf"));
assert.equal(water.original_source_status,"ORIGINAL_2019_ENACTED_GAZETTE_PAGE_4_VISUALLY_VERIFIED");
assert.equal(water.conflict_status,"2025_PROPOSAL_DRAFT_UNVERIFIED_AS_FINAL");
assert(/IS:10500/.test(water.original_law_fact));
const child=data.cases.find(c=>c.rank===3);
assert.equal(child.source_specific_age_or_substance,"Above 24 months through 36 months");
assert(child.prohibited_transfer.includes("infant"));
const polyol=data.cases.find(c=>c.rank===21);
assert(polyol.source_specific_age_or_substance.includes("Sorbitol only"));
assert(polyol.prohibited_transfer.includes("nickel"));

(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setContent('<!doctype html><html><body><div id="pmsv-b63-cocoa-sugar-specifics"></div></body></html>');
  await page.evaluate(({registry,baseline})=>{
   window.pmsvB14Digest=v=>{let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const n=ch.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");};
   window.pmsvB63CocoaMisri={valid:()=>true};
   window.pmsvB59CTRSourceCrosswalk={valid:()=>true,getAllCases:()=>baseline};
   window.pmsvLoadPositiveSourceProof=async()=>{};
   window.fetch=async()=>({ok:true,json:async()=>registry});
  },{registry:data,baseline:b59.cases});
  await page.addScriptTag({content:panel});
  await page.evaluate(()=>window.pmsvLoadPositiveSourceProof());
  const el=page.locator("#pmsv-b64-three-originals");
  assert.equal(await el.count(),1);await el.evaluate(x=>x.open=true);
  assert.equal(await page.evaluate(()=>window.pmsvB64OriginalLawCases.valid()),true);
  assert.equal(await el.locator("[data-pmsv-b64-rows] tr").count(),3);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB64OriginalLawCases.getCounts()),
   {cases:3,originalFinalWater:1,ageSpecificChildren:1,genericPolyolsGuard:1,
    draftApplied:0,legalPasses:0,lotPasses:0,originalIDs:15,all35Open:true});
  for(const id of [1,3,21]){
   await el.locator("[data-pmsv-b64-focus]").selectOption(String(id));
   assert.equal(await el.locator("[data-pmsv-b64-rows] tr").count(),1);
  }
  await el.locator("[data-pmsv-b64-focus]").selectOption("ALL");
  await el.locator("[data-pmsv-b64-search]").fill("Sorbitol");
  assert.equal(await el.locator("[data-pmsv-b64-rows] tr").count(),1);
  await el.locator("[data-pmsv-b64-search]").fill("");
  const csv=await page.evaluate(()=>window.pmsvB64OriginalLawCases.csv());
  assert.equal(csv.trim().split(/\r?\n/).length,4);
  assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false"')));
  const download=page.waitForEvent("download");
  await el.locator("[data-pmsv-b64-export]").click();
  assert.match((await download).suggestedFilename(),/B64.*\.csv/);
  await page.evaluate(()=>{window.pmsvB59CTRSourceCrosswalk.getAllCases().find(x=>x.rank===21).product_name="TAMPERED";});
  assert.equal(await page.evaluate(()=>window.pmsvB64OriginalLawCases.valid()),false);
  assert.equal(await page.evaluate(()=>window.pmsvB64OriginalLawCases.csv()),"");
  assert.deepEqual(errors,[]);
  console.log("Batch64 PASS (isolated Chromium): water final vs draft, child-age, sorbitol-only, 15 original IDs; NO product approvals. Full-preview startup not certified.");
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
