"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),path=require("node:path"),
 {chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=read("fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.json");
const b59=read("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const b62=read("fssai-current35-identity-supersession-batch62-2026-10-17.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function hash(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(js.includes('const pin="'+hash(d)+'"'),"Source data digest does not match");
assert.equal(d.ancestor_b59_digest,hash(b59));assert.equal(d.ancestor_b62_digest,hash(b62));
assert(html.indexOf("cocoa-sugar-identity-batch63")>html.indexOf("identity-supersession-batch62"));
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest|WebSocket)/.test(js));
assert.equal(d.kind,"PMSV_BATCH63_COCOA_SUGAR_EXACT_IDENTITY_VS_CTR_TRANSFER_BLOCK");
const old=new Map(b59.cases.map(x=>[x.rank,x])),t=d.totals;
assert.equal(t.catalogue,533);assert.equal(t.conditionally_first_source_matched,498);
assert.equal(t.unchanged_open_ctr_cases,35);assert.equal(t.open_p0,13);assert.equal(t.open_p1,22);
assert.equal(t.original_evidence_requests_unchanged,175);
assert.equal(t.b59_related_ctr_comparators_unchanged,15);
assert.equal(t.b60_original_research_unchanged,20);assert.equal(t.b61_primary_subject_findings_unchanged,8);
assert.equal(t.b62_specific_identity_reviews_unchanged,6);
assert.equal(t.newly_detailed_identity_cases,4);assert.equal(t.cocoa_identity_cases,3);
assert.equal(t.misri_identity_cases,1);assert.equal(t.unaffected_held_cases,31);
assert.equal(t.new_original_evidence_request_ids_covered,20);
for(const k of ["signed_original_ctr_case_article_approvals","actual_manufacturer_boms_received",
 "accredited_contaminant_lab_scope_approvals","lot_passes",
 "original_2018_full_text_gazette_authentications"])assert.equal(t[k],0);
assert.equal(t.wordpress_changed,false);
const seen=new Set(),req=new Set();
for(const c of d.cases){
 const a=old.get(c.rank);assert(a,"Unknown rank");
 assert(!seen.has(c.rank));seen.add(c.rank);
 assert.equal(c.priority,"P0");assert.equal(c.product_name,a.product_name);
 assert.equal(c.analyte,a.analyte);assert.equal(c.original_legal_gate,a.original_legal_gate);
 assert.equal(c.catalogue_id,a.catalogue_id);
 assert.deepEqual(c.original_five_gate_ids,a.original_request_ids);
 assert.equal(c.published_product_identity_source_verified,"OFFICIAL_FSSAI_HOSTED_COMPILED_PRODUCT_STANDARD_SECTION");
 for(const field of ["primary_product_identity_gazette_original_fulltext_authenticated",
   "marketplace_product_form_evidenced","signed_operative_ctr_case_limit",
   "selected_lab_scope_for_contaminant_verified","representative_lot_pass","product_released"])
   assert.equal(c[field],false);
 for(const id of c.original_five_gate_ids){assert(!req.has(id));req.add(id);}
}
assert.deepEqual([...seen].sort((a,b)=>a-b),[8,9,10,20]);
assert.equal(req.size,20);
assert.match(d.cases.find(x=>x.rank===8).identity_text_compiled_reference_only,/8%/);
assert.match(d.cases.find(x=>x.rank===9).identity_text_compiled_reference_only,/32%/);
assert.match(d.cases.find(x=>x.rank===10).identity_text_compiled_reference_only,/47–60%/);
assert.match(d.cases.find(x=>x.rank===20).identity_text_compiled_reference_only,/palmyrah/);
assert.equal(d.method_sources.length,2);
assert.equal(d.method_sources[0].not_target,"Lead");
assert.equal(d.method_sources[1].not_target,"Chromium");
assert.equal(d.strict_gates.entire_thirty_five_held,true);
assert.equal(d.strict_gates.no_automatic_cocoa_powder_lead_limit_to_beans_mass_or_mixes,true);
assert.equal(d.strict_gates.no_refined_sugar_chromium_limit_to_misri,true);

(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setContent('<!doctype html><html><body><div id="pmsv-b62-supersession-review"></div></body></html>');
  await page.evaluate(({dataset,baseline})=>{
   window.pmsvB14Digest=v=>{let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){const n=ch.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");};
   window.pmsvB62IdentitySupersession={valid:()=>true};
   window.pmsvB59CTRSourceCrosswalk={valid:()=>true,getAllCases:()=>baseline};
   window.pmsvLoadPositiveSourceProof=async()=>{};
   window.fetch=async()=>({ok:true,json:async()=>dataset});
  },{dataset:d,baseline:b59.cases});
  await page.addScriptTag({content:js});
  await page.evaluate(()=>window.pmsvLoadPositiveSourceProof());
  const panel=page.locator("#pmsv-b63-cocoa-sugar-specifics");
  assert.equal(await panel.count(),1);await panel.evaluate(el=>el.open=true);
  assert.equal(await page.evaluate(()=>window.pmsvB63CocoaMisri.valid()),true);
  assert.equal(await panel.locator("[data-pmsv-b63-rows] tr").count(),4);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB63CocoaMisri.getCounts()),
    {all:4,cocoa:3,misri:1,originalEvidence:0,approvedCTR:0,accreditedLab:0,lotPasses:0,all35Held:true});
  await panel.locator("[data-pmsv-b63-family]").selectOption("COCOA");
  assert.equal(await panel.locator("[data-pmsv-b63-rows] tr").count(),3);
  await panel.locator("[data-pmsv-b63-family]").selectOption("MISRI");
  assert.equal(await panel.locator("[data-pmsv-b63-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b63-family]").selectOption("ALL");
  await panel.locator("[data-pmsv-b63-search]").fill("palmyrah");
  assert.equal(await panel.locator("[data-pmsv-b63-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b63-search]").fill("");
  const csv=await page.evaluate(()=>window.pmsvB63CocoaMisri.csv());
  assert.equal(csv.trim().split(/\r?\n/).length,5);
  assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false","false"')));
  const pending=page.waitForEvent("download");
  await panel.locator("[data-pmsv-b63-export]").click();
  assert.match((await pending).suggestedFilename(),/B63.*\.csv/);
  await page.evaluate(()=>{window.pmsvB59CTRSourceCrosswalk.getAllCases().find(x=>x.rank===8).catalogue_id="TAMPERED";});
  assert.equal(await page.evaluate(()=>window.pmsvB63CocoaMisri.valid()),false);
  assert.equal(await page.evaluate(()=>window.pmsvB63CocoaMisri.csv()),"");
  assert.deepEqual(errors,[]);
  console.log("Batch63 PASS (isolated Chromium): 4 P0, original 20 request IDs; filters, CSV, spoofed ancestor fails closed. Full preview startup is NOT certified.");
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
