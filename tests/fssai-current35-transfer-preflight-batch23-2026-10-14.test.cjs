"use strict";
/* Real Chromium on actual PMSV UI: export → preview → confirm, tamper,
 * stale storage, invalid JSON, duplicate case, zero false compliance pass. */
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const {chromium}=require("playwright");
const port=18877;
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory","fssai-product-helper-preview-01"],{stdio:"ignore"});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",x=>errors.push(x.message));
  let loaded=false;
  for(let i=0;i<30;i++){
   try{let r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
    if(r?.ok()){loaded=true;break}}catch(_){await sleep(200)}
  }
  assert(loaded,"PMSV test HTTP origin unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   (pmsvB22StartupState==="READY"||pmsvB22StartupState==="INTEGRITY_BLOCKED"),
   null,{timeout:90000});
  const initial=await page.evaluate(()=>({
   ready:pmsvB23Ready(),ledger:pmsv498Ledger?.records?.length,
   pending:pmsv498Ledger?.first_source_pending,status:pmsvB22StartupState
  }));
  assert.equal(initial.ready,true,"B23 chain not valid "+JSON.stringify(initial));
  assert.equal(initial.ledger,533);assert.equal(initial.pending,35);
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB15EnsureDashboard();pmsvB20Ensure();
   pmsvB21Refresh();pmsvB23Ensure();
  });
  await page.locator("#pmsv-b14-review-index summary").click();
  await page.locator("[data-pmsv-b14-select]").selectOption("99-99-1-trehalose");
  await page.locator("#pmsv-b14-review-index [data-pmsv-b14-field=source_article]").fill("Existing local CTR article draft");
  const base=await page.evaluate(()=>({
   value:pmsvB14Read()["99-99-1-trehalose"].source_article,
   keys:[pmsvB14StorageKey,pmsvB5StorageKey,pmsvB15ClaimsKey].map(k=>localStorage.getItem(k)),
   packet:pmsvB15PacketForTransfer()
  }));
  assert.equal(base.value,"Existing local CTR article draft");
  const target=base.packet.review_queue.records.find(r=>r.product.catalog_id==="99-99-1-trehalose");
  target.reviewer_record.source_article="Foods not specified";
  target.reviewer_record.analyte="Lead";
  target.reviewer_record.source_url="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
  const pick=page.locator("#pmsv-b15-transfer-panel [data-pmsv-b15-import-file]");
  const previewBtn=page.locator("#pmsv-b15-transfer-panel [data-pmsv-b15-import]");
  const confirmBtn=page.locator("#pmsv-b15-transfer-panel [data-pmsv-b23-confirm]");
  await page.locator("#pmsv-b15-transfer-panel summary").first().click();
  const load=async payload=>{
   await pick.setInputFiles({name:"PMSV-test-drafts.json",mimeType:"application/json",
    buffer:Buffer.from(typeof payload==="string"?payload:JSON.stringify(payload))});
   await previewBtn.click();
  };
  // Invalid JSON cannot mutate browser storage or show confirmation.
  await load("{invalid");
  await page.waitForFunction(()=>pmsvB23LastResult==="REJECTED");
  assert.equal(await confirmBtn.isVisible(),false);
  assert.equal(await page.evaluate(()=>pmsvB14Read()["99-99-1-trehalose"].source_article),base.value);
  // Forged approval is rejected before persistence.
  const forged=structuredClone(base.packet);
  forged.review_queue.records.find(r=>r.product.catalog_id==="99-99-1-trehalose").finished_product_compliance_approved=true;
  await load(forged);
  await page.waitForFunction(()=>pmsvB23LastResult==="REJECTED");
  assert.equal(await page.evaluate(()=>pmsvB14Read()["99-99-1-trehalose"].source_article),base.value);
  // Duplicate-case packet rejection, no evidence writes.
  const dup=structuredClone(base.packet);
  dup.review_queue.records[1]=structuredClone(dup.review_queue.records[0]);
  await load(dup);
  await page.waitForFunction(()=>pmsvB23LastResult==="REJECTED");
  // Valid transfer: preview only, show actual overwritten-draft count.
  await load(base.packet);
  await page.waitForFunction(()=>pmsvB23LastResult==="PREVIEW_READY");
  assert.equal(await confirmBtn.isVisible(),true);
  const info=await page.evaluate(()=>({state:pmsvB23LastResult,
   old:pmsvB14Read()["99-99-1-trehalose"].source_article,
   changed:pmsvB23Pending?.info.changed_drafts,
   approved:pmsvB21Data.results.independent_legal_approvals
  }));
  assert.equal(info.old,base.value,"Preflight must not overwrite reviewer drafts");
  assert(info.changed>=1,"Preflight should identify conflict with an existing draft");
  assert.equal(info.approved,0);
  // Batch24 requires explicit case selection before confirming any restore.
  assert.equal(await confirmBtn.isDisabled(),true,"No import should be preselected");
  await page.locator('[data-pmsv-b24-case="99-99-1-trehalose"]').check();
  assert.equal(await confirmBtn.isEnabled(),true);
  // Modify saved evidence between preview and confirm: must be rejected.
  await page.evaluate(()=>localStorage.setItem(pmsvB14StorageKey,localStorage.getItem(pmsvB14StorageKey)+" "));
  await confirmBtn.click();
  assert.equal(await page.evaluate(()=>pmsvB23LastResult),"STALE_REJECTED");
  assert.equal(await page.evaluate(()=>pmsvB14Read()["99-99-1-trehalose"].source_article),base.value);
  // New preview then explicit consent succeeds; generic metal fallback remains flagged.
  await previewBtn.click();
  await page.waitForFunction(()=>pmsvB23LastResult==="PREVIEW_READY");
  assert.equal(await confirmBtn.isDisabled(),true);
  await page.locator('[data-pmsv-b24-case="99-99-1-trehalose"]').check();
  await confirmBtn.click();
  await page.waitForFunction(()=>pmsvB23LastResult==="IMPORTED_UNVERIFIED");
  const result=await page.evaluate(()=>({
   article:pmsvB14Read()["99-99-1-trehalose"].source_article,
   status:pmsvB21All().find(x=>x.id==="99-99-1-trehalose")?.status,
   code:pmsvB20All().find(x=>x.id==="99-99-1-trehalose")?.issues?.map(x=>x.code),
   ledger:pmsv498Ledger.records.length,
   pending:pmsv498Ledger.first_source_pending,
   approvals:pmsvB21Data.results.independent_legal_approvals,
   passes:pmsvB21Data.results.lot_passes
  }));
  assert.equal(result.article,"Foods not specified");
  assert(result.code.includes("GENERIC_METAL_FALLBACK"));
  assert.equal(result.status,"ARTICLE_SCOPE_REVIEW_REQUIRED");
  assert.equal(result.ledger,533);assert.equal(result.pending,35);
  assert.equal(result.approvals,0);assert.equal(result.passes,0);
  assert.equal(errors.filter(x=>/pmsvB2[123]|pmsvB15/.test(x)).length,0,
   "Runtime page errors: "+errors.slice(0,5).join(" | "));
  console.log("Batch23 Chromium verified unverified transfer preview, tamper rejection, stale check and consent",JSON.stringify(result));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(err=>{console.error(err);process.exitCode=1;server.kill("SIGTERM")});
