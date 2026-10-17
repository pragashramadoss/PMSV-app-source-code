"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const source=fs.readFileSync("fssai-product-helper-preview-01/fssai-batch75-original-evidence-workqueue-2026-10-17.js","utf8");
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|fetch\s*\(|XMLHttpRequest)/.test(source));
(async()=>{const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});try{
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.setContent('<html><head></head><body><details id="pmsv-b70-startup-gates" open><summary>Evidence</summary></details></body></html>');
await page.evaluate(()=>{
 const roles=["FSSAI_QA_DIVISION_AND_LAB_DIRECTOR","MANUFACTURER_OR_SUPPLIER_QA","REGULATORY_AFFAIRS_LEGAL","LABORATORY_TECHNICAL_MANAGER","SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"];
 window.__b75={good:true,phase:"NOT_REQUESTED"};
 window.__b75.cases=Array.from({length:35},(_,i)=>({
  catalogue_id:"product-"+i,rank:i+1,priority:i<13?"P0":"P1",
  product_name:"product "+i,analyte:"Lead",
  original_request_ids:roles.map((_,k)=>"B75-ORIG-"+i+"-"+k),
  case_signed_legal_applicability:false,actual_market_material_authenticated:false,
  method_and_lab_scope_approved:false,representative_lot_pass:false}));
 window.__b75.rows=window.__b75.cases.flatMap(c=>roles.map((role,k)=>({
  rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
  case_id:c.catalogue_id,request_id:c.original_request_ids[k],role,
  gate:"GATE_"+k,evidence:"Original file for "+c.product_name,
  dependencies:k<2?"":"UPSTREAM",routing:k<2?"REQUEST_PREPARATION_POSSIBLE":"WAIT_FOR_UPSTREAM_EVIDENCE",
  original_request_status:"NOT_SENT",original_document_status:"NOT_RECEIVED"})));
 window.pmsvB70ExtendedResearch={getState:()=>({core:"READY",extended:window.__b75.phase,
  all35Held:window.__b75.good,caseApprovals:0,labPasses:0,productReleases:0})};
 window.pmsvB58OwnerOutreach={valid:()=>window.__b75.good,records:()=>window.__b75.rows};
 window.pmsvB59CTRSourceCrosswalk={valid:()=>window.__b75.good,getAllCases:()=>window.__b75.cases};
});
await page.addScriptTag({content:source});
assert.equal(await page.locator("#pmsv-b75-workqueue").count(),1);
let status=await page.evaluate(()=>window.pmsvB75EvidenceQueue.refresh());
assert.equal(status,null);
assert.equal(await page.locator("[data-pmsv-b75-export]").isDisabled(),true);
await page.evaluate(()=>{window.__b75.phase="READY";});
status=await page.evaluate(()=>window.pmsvB75EvidenceQueue.refresh());
assert.equal(status.items,70);assert.equal(status.ready,70);assert.equal(status.dependent,105);
assert.equal(await page.locator("[data-pmsv-b75-rows] tr").count(),70);
await page.locator("[data-pmsv-b75-phase]").selectOption("ALL");
await page.locator("[data-pmsv-b75-apply]").click();
assert.equal(await page.locator("[data-pmsv-b75-rows] tr").count(),175);
const csv=await page.evaluate(()=>window.pmsvB75EvidenceQueue.previewCSV());
assert.equal(csv.split("\r\n").filter(Boolean).length,176);
await page.locator("[data-pmsv-b75-phase]").selectOption("DEPENDENT");
await page.locator("[data-pmsv-b75-apply]").click();
assert.equal(await page.locator("[data-pmsv-b75-rows] tr").count(),105);
await page.locator("[data-pmsv-b75-phase]").selectOption("ALL");
await page.locator("[data-pmsv-b75-role]").selectOption("LABORATORY_TECHNICAL_MANAGER");
await page.locator("[data-pmsv-b75-apply]").click();
assert.equal(await page.locator("[data-pmsv-b75-rows] tr").count(),35);
await page.locator("[data-pmsv-b75-role]").selectOption("ALL");
await page.locator("[data-pmsv-b75-priority]").selectOption("P0");
await page.locator("[data-pmsv-b75-apply]").click();
assert.equal(await page.locator("[data-pmsv-b75-rows] tr").count(),65);
await page.evaluate(()=>{window.__b75.rows[0].original_document_status="RECEIVED";});
assert.equal(await page.evaluate(()=>window.pmsvB75EvidenceQueue.refresh()),null,"Fabricated received document must block");
assert.equal(await page.locator("[data-pmsv-b75-rows] tr").count(),0);
assert.equal(await page.evaluate(()=>window.pmsvB75EvidenceQueue.previewCSV()),"");
await page.evaluate(()=>{window.__b75.rows[0].original_document_status="NOT_RECEIVED";window.__b75.phase="INTEGRITY_BLOCKED";});
assert.equal(await page.evaluate(()=>window.pmsvB75EvidenceQueue.refresh()),null);
await page.evaluate(()=>{window.__b75.phase="READY";window.__b75.cases[0].original_request_ids[0]="TAMPERED";});
assert.equal(await page.evaluate(()=>window.pmsvB75EvidenceQueue.refresh()),null);
console.log("B75_FIXTURE_PASS 35 HELD, 175 unique unsent IDs, 70 preparation, 105 dependent, filter + CSV + tamper rejection");
}finally{await browser.close();}})().catch(e=>{console.error("B75_FIXTURE_FAIL",e);process.exitCode=1;});