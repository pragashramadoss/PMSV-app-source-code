"use strict";
/* Batch76 synthetic Chromium cross-file source identity and export boundaries. */
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const script=fs.readFileSync("fssai-product-helper-preview-01/fssai-batch76-case-dossier-2026-10-17.js","utf8");
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|WebSocket|fetch\s*\(|XMLHttpRequest)/.test(script));
(async()=>{const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent('<html><head></head><body><details id="pmsv-b70-startup-gates" open><section id="pmsv-b75-workqueue"></section></details></body></html>');
  await page.evaluate(()=>{
   const roles=["FSSAI_QA_DIVISION_AND_LAB_DIRECTOR","MANUFACTURER_OR_SUPPLIER_QA",
   "REGULATORY_AFFAIRS_LEGAL","LABORATORY_TECHNICAL_MANAGER",
   "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"];
   window.fixture={good:true,core:"READY",extended:"NOT_REQUESTED",cases:[],rows:[]};
   for(let i=0;i<35;i++){
    const c={catalogue_id:"C-"+i,rank:i+1,priority:i<13?"P0":"P1",
     product_name:i===0?"=Malicious formula cocoa":"Product "+i,analyte:"Lead",
     original_request_ids:roles.map((_,j)=>"ORG-"+i+"-"+j),
     case_signed_legal_applicability:false,actual_market_material_authenticated:false,
     method_and_lab_scope_approved:false,representative_lot_pass:false};
    window.fixture.cases.push(c);
    roles.forEach((role,j)=>window.fixture.rows.push({case_id:c.catalogue_id,rank:c.rank,
     priority:c.priority,product:c.product_name,analyte:c.analyte,request_id:c.original_request_ids[j],
     role,gate:"GATE_"+j,evidence:"Signed document needed",
     dependencies:j<2?"":"UPSTREAM_ORIGINAL_GAZETTE",routing:j<2?
      "REQUEST_PREPARATION_POSSIBLE":"WAIT_FOR_UPSTREAM_EVIDENCE",
     original_request_status:"NOT_SENT",original_document_status:"NOT_RECEIVED"}));
   }
   window.pmsvB70ExtendedResearch={getState:()=>({core:fixture.core,extended:fixture.extended,
    all35Held:fixture.good,caseApprovals:0,labPasses:0,productReleases:0})};
   window.pmsvB58OwnerOutreach={valid:()=>fixture.good,records:()=>fixture.rows};
   window.pmsvB59CTRSourceCrosswalk={valid:()=>fixture.good,getAllCases:()=>fixture.cases};
  });
  await page.addScriptTag({content:script});
  await page.locator("#pmsv-b76-case-dossier summary").click();
  assert.equal(await page.evaluate(()=>window.pmsvB76CaseDossier.refresh()),null);
  assert.equal(await page.locator('[data-pmsv-b76-action="csv"]').isDisabled(),true);
  await page.evaluate(()=>{fixture.extended="READY";});
  let s=await page.evaluate(()=>window.pmsvB76CaseDossier.refresh());
  assert.deepEqual({n:s.gates,prep:s.preparatory,dep:s.dependent,cases:s.totalCases,ids:s.originalRequestIDs},
   {n:5,prep:2,dep:3,cases:35,ids:175});
  assert.equal(await page.locator("#pmsv-b76-case-dossier [data-pmsv-b76-case] option").count(),35);
  assert.equal(await page.locator("#pmsv-b76-case-dossier tbody tr").count(),5);
  const csv=await page.evaluate(()=>window.pmsvB76CaseDossier.preview("csv"));
  assert.equal(csv.split("\r\n").filter(Boolean).length,6);
  assert(csv.includes("'=Malicious formula cocoa"),"Unsafe spreadsheet formula not escaped");
  const txt=await page.evaluate(()=>window.pmsvB76CaseDossier.preview("txt"));
  assert(txt.includes("UNSENT DRAFT")&&txt.includes("NOT_SENT | NOT_RECEIVED"));
  await page.locator("[data-pmsv-b76-priority]").selectOption("P1");
  assert.equal(await page.locator('[data-pmsv-b76-case] option').count(),22);
  await page.locator("[data-pmsv-b76-search]").fill("product 30");
  assert.equal(await page.locator('[data-pmsv-b76-case] option').count(),1);
  await page.evaluate(()=>{fixture.rows[0].original_document_status="RECEIVED";});
  assert.equal(await page.evaluate(()=>window.pmsvB76CaseDossier.refresh()),null);
  assert.equal(await page.locator('[data-pmsv-b76-action="csv"]').isDisabled(),true);
  assert.equal(await page.evaluate(()=>window.pmsvB76CaseDossier.preview("csv")),"");
  await page.evaluate(()=>{fixture.rows[0].original_document_status="NOT_RECEIVED";fixture.cases[0].representative_lot_pass=true;});
  assert.equal(await page.evaluate(()=>window.pmsvB76CaseDossier.refresh()),null);
  await page.evaluate(()=>{fixture.cases[0].representative_lot_pass=false;fixture.extended="INTEGRITY_BLOCKED";});
  assert.equal(await page.evaluate(()=>window.pmsvB76CaseDossier.refresh()),null);
  await page.evaluate(()=>{fixture.extended="READY";fixture.rows[7].request_id="DUPLICATE";});
  assert.equal(await page.evaluate(()=>window.pmsvB76CaseDossier.refresh()),null);
  console.log("B76_DOSSIER_PASS 35 HELD, 175 unique IDs, 5 roles/case, 70 prep/105 dependencies, formula safe, tamper fail closed");
 }finally{await browser.close();}
})().catch(e=>{console.error("B76_DOSSIER_FAIL",e);process.exitCode=1;});