"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const read=name=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",name),"utf8"));
const data=read("fssai-current35-six-matrix-evidence-batch67-2026-10-17.json");
const prior59=read("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const prior60=read("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json");
const prior66=read("fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-six-matrix-evidence-batch67-2026-10-17.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(v)){const n=c.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert.equal(data.b59_digest,digest(prior59));assert.equal(data.b60_digest,digest(prior60));assert.equal(data.b66_digest,digest(prior66));
assert(js.includes('pinned="'+digest(data)+'"'));
assert(index.indexOf("six-matrix-evidence-batch67")>index.indexOf("nutra-ingredient-scope-batch66"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|WebSocket)/.test(js));
assert.deepEqual(data.cases.map(x=>x.rank),[2,4,13,16,17,31]);
assert.deepEqual(data.cases.map(x=>x.priority),["P1","P1","P1","P1","P1","P0"]);
assert.equal(data.totals.catalogue,533);assert.equal(data.totals.conditional_first_sources,498);
assert.equal(data.totals.held_ctr_cases,35);assert.equal(data.totals.all_original_requests,175);
assert.equal(data.totals.immutable_original_request_ids,30);assert.equal(data.totals.wordpress_changed,false);
assert.equal(data.controls.all_35_open,true);
for(const x of ["allow_named_food_cross_product_transfer","allow_shell_free_or_dry_process_auto_conversion",
"allow_comparator_as_legal_case_limit","allow_honey_royal_jelly_inheritance","allow_lab_pass","allow_product_release"])
assert.equal(data.controls[x],false);
const old=new Map(prior59.cases.map(x=>[x.rank,x])),seen=new Set();
for(const c of data.cases){
 const p=old.get(c.rank);assert(p);
 for(const k of ["priority","catalogue_id","product_name","analyte","original_legal_gate"])assert.equal(c[k],p[k]);
 assert.deepEqual(c.original_request_ids,p.original_request_ids);
 assert.equal(c.next_required_originals.length,4);
 for(const id of c.original_request_ids){assert(!seen.has(id));seen.add(id);}
 for(const k of ["identity_verified","operative_case_rule_signed","case_numeric_limit_approved",
 "lab_analyte_matrix_scope_approved","lot_coa_received","lot_pass","case_released"])assert.equal(c[k],false);
}
assert.equal(seen.size,30);
assert(data.cases.find(x=>x.rank===2).research_only_number.includes("UNAPPROVED"));
assert(data.cases.find(x=>x.rank===31).blocked_transfer.includes("honey"));
(async()=>{
 let browser;
 try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.setContent('<!doctype html><body><div id="pmsv-b66-nutra-source-audit"></div></body>');
 await page.evaluate(({dataset,baseline})=>{
 window.pmsvB14Digest=v=>{let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(v)){const n=c.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");};
 window.pmsvB59CTRSourceCrosswalk={valid:()=>true,getAllCases:()=>baseline};
 window.pmsvB60LegalScope={valid:()=>true};
 window.pmsvB66NutraIngredientAudit={valid:()=>true};
 window.pmsvLoadPositiveSourceProof=async()=>{};
 window.fetch=async()=>({ok:true,json:async()=>dataset});
 },{dataset:data,baseline:prior59.cases});
 await page.addScriptTag({content:js});await page.evaluate(()=>window.pmsvLoadPositiveSourceProof());
 const box=page.locator("#pmsv-b67-six-matrix-review");assert.equal(await box.count(),1);
 await box.evaluate(e=>e.open=true);
 assert.equal(await page.evaluate(()=>window.pmsvB67SixMatrixEvidence.valid()),true);
 assert.deepEqual(await page.evaluate(()=>window.pmsvB67SixMatrixEvidence.getCounts()),
 {reviewed:6,p0:1,p1:5,originalRequestIds:30,unapproved:6,all35Held:true});
 assert.equal(await box.locator("[data-pmsv-b67-rows] tr").count(),6);
 for(const group of ["OTA_COFFEE_BLEND","PESTICIDE_FROZEN_FRUIT","PESTICIDE_ARROWROOT",
 "PESTICIDE_EGG_POWDER","PESTICIDE_PICKLED_EGGS","ANTIBIOTIC_ROYAL_JELLY"]){
 await box.locator("[data-pmsv-b67-family]").selectOption(group);
 assert.equal(await box.locator("[data-pmsv-b67-rows] tr").count(),1);}
 await box.locator("[data-pmsv-b67-family]").selectOption("ALL");
 await box.locator("[data-pmsv-b67-search]").fill("royal jelly");
 assert.equal(await box.locator("[data-pmsv-b67-rows] tr").count(),1);
 await box.locator("[data-pmsv-b67-search]").fill("");
 const csv=await page.evaluate(()=>window.pmsvB67SixMatrixEvidence.csv());
 assert.equal(csv.trim().split(/\r?\n/).length,7);
 assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false","false","false","false","false"')));
 const hrefs=await box.locator("[data-pmsv-b67-rows] a").evaluateAll(a=>a.map(x=>x.href));
 assert.equal(hrefs.length,6);assert(hrefs.every(x=>x===data.source.url));
 await page.evaluate(()=>window.pmsvB59CTRSourceCrosswalk.getAllCases().find(x=>x.rank===31).catalogue_id="forged");
 assert.equal(await page.evaluate(()=>window.pmsvB67SixMatrixEvidence.valid()),false);
 assert.equal(await page.evaluate(()=>window.pmsvB67SixMatrixEvidence.csv()),"");
 assert.deepEqual(errors,[]);
 console.log("Batch67 PASS (isolated Chromium): six source gates, 1 P0/5 P1, 30 immutable evidence IDs; spoofed identity fails closed.");
 }finally{if(browser)await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
