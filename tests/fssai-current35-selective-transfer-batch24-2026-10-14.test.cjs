"use strict";
/* Full Chromium integration of B15/B23/B24. A 35-case packet must not
 * erase unselected local reviewer drafts or conditional claim checkboxes. */
const assert=require("node:assert/strict"),{spawn}=require("node:child_process");
const {chromium}=require("playwright");
const port=18878,child=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory","fssai-product-helper-preview-01"],{stdio:"ignore"});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let attempt=0;attempt<35;attempt++){
   try{let response=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:12000});
    if(response?.ok()){loaded=true;break}}catch(_){await sleep(150)}
  }
  assert(loaded,"Cannot start PMSV static browser origin");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB24Valid()),"B24 source integrity or startup blocked");
  await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB15EnsureDashboard();pmsvB20Ensure();pmsvB21Refresh();pmsvB23Ensure();
  });
  await page.locator("#pmsv-b14-review-index summary").click();
  const selector=page.locator("[data-pmsv-b14-select]");
  await selector.selectOption("99-99-1-trehalose");
  await page.locator("#pmsv-b14-review-index [data-pmsv-b14-field=source_article]").fill("LOCAL TREHALOSE EVIDENCE");
  await selector.selectOption("100-100-royal-jelly");
  await page.locator("#pmsv-b14-review-index [data-pmsv-b14-field=source_article]").fill("LOCAL ROYAL JELLY SOURCE - DO NOT OVERWRITE");
  const obj=await page.evaluate(()=>{
   const snapshot=pmsvB15PacketForTransfer();
   const byId=new Map(snapshot.review_queue.records.map(x=>[x.product.catalog_id,x]));
   byId.get("99-99-1-trehalose").reviewer_record.source_article="IMPORTED TREHALOSE SOURCE";
   byId.get("100-100-royal-jelly").reviewer_record.source_article="IMPORTED ROYAL JELLY SOURCE";
   byId.get("coffee-chicory-mixture").reviewer_record.source_article="IMPORTED COFFEE SOURCE";
   snapshot.candidate_claims[0].condition_claims[0]=true;
   return snapshot;
  });
  const panel=page.locator("#pmsv-b15-transfer-panel");
  await panel.locator("summary").first().click();
  const picker=panel.locator("[data-pmsv-b15-import-file]");
  const confirm=panel.locator("[data-pmsv-b23-confirm]");
  async function preview(){
   await picker.setInputFiles({name:"PMSV-35-unverified-drafts.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(obj))});
   await panel.locator("[data-pmsv-b15-import]").click();
   await page.waitForFunction(()=>pmsvB23LastResult==="PREVIEW_READY");
  }
  await preview();
  const start=await page.evaluate(()=>({
   cases:document.querySelectorAll("[data-pmsv-b24-case]").length,
   choices:[...document.querySelectorAll("[data-pmsv-b24-case]")].filter(x=>x.checked).length,
   disabled:document.querySelector("[data-pmsv-b23-confirm]")?.disabled,
   trehalose:pmsvB14Read()["99-99-1-trehalose"]?.source_article
  }));
  assert.equal(start.cases,35);assert.equal(start.choices,0);assert.equal(start.disabled,true);
  assert.equal(start.trehalose,"LOCAL TREHALOSE EVIDENCE");
  // Explicitly restore trehalose and coffee. The competing royal-jelly draft
  // and all unselected blank records remain exactly intact.
  await panel.locator('[data-pmsv-b24-case="99-99-1-trehalose"]').check();
  await panel.locator('[data-pmsv-b24-case="coffee-chicory-mixture"]').check();
  assert.equal(await confirm.isEnabled(),true);
  await confirm.click();
  await page.waitForFunction(()=>pmsvB24LastResult==="SELECTIVE_IMPORT_COMPLETE");
  const after=await page.evaluate(()=>({
   trehalose:pmsvB14Read()["99-99-1-trehalose"]?.source_article,
   jelly:pmsvB14Read()["100-100-royal-jelly"]?.source_article,
   coffee:pmsvB14Read()["coffee-chicory-mixture"]?.source_article,
   claim:pmsvB15ClaimsRead()[pmsvB15Data.candidate_routes[0].catalog_id][0],
   pending:pmsv498Ledger.first_source_pending,
   legal:pmsvB21Data.results.independent_legal_approvals
  }));
  assert.equal(after.trehalose,"IMPORTED TREHALOSE SOURCE");
  assert.equal(after.jelly,"LOCAL ROYAL JELLY SOURCE - DO NOT OVERWRITE");
  assert.equal(after.coffee,"IMPORTED COFFEE SOURCE");
  assert.equal(after.claim,false,"Conditional claims must be opt-in");
  assert.equal(after.pending,35);assert.equal(after.legal,0);
  // Second preview: no case chosen, only optional conditional claims selected.
  await preview();
  assert.equal(await confirm.isDisabled(),true);
  await panel.locator("[data-pmsv-b24-claims]").check();
  await confirm.click();
  await page.waitForFunction(()=>pmsvB24LastResult==="SELECTIVE_IMPORT_COMPLETE");
  const second=await page.evaluate(()=>({
   jelly:pmsvB14Read()["100-100-royal-jelly"]?.source_article,
   claim:pmsvB15ClaimsRead()[pmsvB15Data.candidate_routes[0].catalog_id][0],
   approvals:pmsvB21Data.results.independent_legal_approvals,
   passes:pmsvB21Data.results.lot_passes
  }));
  assert.equal(second.jelly,after.jelly);assert.equal(second.claim,true);
  assert.equal(second.approvals,0);assert.equal(second.passes,0);
  // Third preview: select-new-only never selects an overwrite.
  await preview();
  await panel.locator('[data-pmsv-b24-action="new"]').click();
  const final=await page.evaluate(()=>({
   selected:[...document.querySelectorAll("[data-pmsv-b24-case]:checked")].map(x=>x.getAttribute("data-pmsv-b24-case")),
   trehalose:pmsvB14Read()["99-99-1-trehalose"]?.source_article,
   jelly:pmsvB14Read()["100-100-royal-jelly"]?.source_article,
   total:pmsv498Ledger.records.length,pending:pmsv498Ledger.first_source_pending
  }));
  assert(!final.selected.includes("100-100-royal-jelly"));
  assert(!final.selected.includes("99-99-1-trehalose"));
  assert.equal(final.trehalose,after.trehalose);assert.equal(final.jelly,after.jelly);
  assert.equal(final.total,533);assert.equal(final.pending,35);
  assert.equal(errors.filter(x=>/pmsvB2[234]|pmsvB15/.test(x)).length,0,
   "Browser source errors: "+errors.slice(0,5).join("; "));
  console.log("Batch24 selective transfer real Chromium PASS",JSON.stringify({start,after,second,final}));
 }finally{if(browser)await browser.close();child.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;child.kill("SIGTERM")});
