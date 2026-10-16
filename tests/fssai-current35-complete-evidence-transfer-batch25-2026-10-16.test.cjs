"use strict";
/* Real Chromium end-to-end Batch25 regression against the full FSSAI Helper.
 * B25 references/notes must never silently replace unselected local evidence. */
const assert=require("node:assert/strict"),{spawn}=require("node:child_process");
const {chromium}=require("playwright"),port=18883;
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory","fssai-product-helper-preview-01"],{stdio:"ignore"});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let loaded=false;
  for(let n=0;n<40;n++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:14000});
   if(r?.ok()){loaded=true;break}
  }catch(_){await delay(150)}
  assert(loaded,"Cannot load local static PMSV Helper");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB25Ready()),"Batch25 or official source integrity not ready");
  const exported=await page.evaluate(()=>{
   document.getElementById("standard")?.classList.remove("hidden");
   pmsvB14EnsureDashboard();pmsvB15EnsureDashboard();pmsvB23Ensure();
   const t="99-99-1-trehalose",j="100-100-royal-jelly";
   const all=pmsvB14Read();all[t]={...pmsvB14Fresh(),source_article:"LOCAL TREHALOSE REVIEW"};
   all[j]={...pmsvB14Fresh(),source_article:"KEEP LOCAL JELLY"};
   if(!pmsvB14Persist(all))throw Error("cannot save reviewer draft");
   const receipts=pmsvB5Read();
   receipts[t]={received:[false,false,false,false],reference:"LOCAL T COA 100",notes:"Keep local notes until selected"};
   receipts[j]={received:[false,false,false,false],reference:"JELLY PRIVATE REFERENCE",notes:"JELLY NOT SELECTED"};
   if(!pmsvB5Persist(receipts))throw Error("cannot save receipt notes");
   const q=pmsvB25Packet();
   if(!q)return null;
   const m=new Map(q.evidence_notes.records.map(x=>[x.catalog_id,x]));
   m.get(t).reference="IMPORTED T COA 101";m.get(t).notes="IMPORTED T FOLLOWUP";
   m.get(j).reference="OVERWRITE JELLY";m.get(j).notes="DANGEROUS UNSELECTED CHANGE";
   const c=m.get("coffee-chicory-mixture");c.reference="COFFEE DOCUMENT 1";c.notes="COFFEE SOURCE ARTICLE TO CONFIRM";
   const r=new Map(q.review_queue.records.map(x=>[x.product.catalog_id,x]));
   r.get(t).reviewer_record.source_article="IMPORTED TREHALOSE REVIEW";
   r.get(j).reviewer_record.source_article="IMPORTED JELLY REVIEW";
   return q;
  });
  assert.equal(exported.evidence_notes.records.length,35);
  assert.equal(exported.legal_approvals,0);
  const panel=page.locator("#pmsv-b15-transfer-panel");
  await panel.locator("summary").first().click();
  const picker=panel.locator("[data-pmsv-b15-import-file]");
  const importButton=panel.locator("[data-pmsv-b15-import]");
  const confirm=panel.locator("[data-pmsv-b23-confirm]");
  const put=async packet=>{
   await picker.setInputFiles({name:"PMSV-evidence-unverified.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(packet))});
   await importButton.click();
  };
  let tampered=structuredClone(exported);
  tampered.evidence_notes.records[1].catalog_id=tampered.evidence_notes.records[0].catalog_id;
  await put(tampered);
  await page.waitForFunction(()=>pmsvB25LastResult==="REJECTED");
  assert.equal(await page.evaluate(()=>pmsvB5Read()["100-100-royal-jelly"].reference),"JELLY PRIVATE REFERENCE");
  tampered=structuredClone(exported);
  tampered.evidence_notes.records[1].regulatory_approved=true;
  await put(tampered);
  await page.waitForFunction(()=>pmsvB25LastResult==="REJECTED");
  await put(exported);
  await page.waitForFunction(()=>pmsvB25LastResult==="FULL_PACKET_PREVIEW");
  const preview=await page.evaluate(()=>({
   choices:document.querySelectorAll("[data-pmsv-b24-case]").length,
   chosen:document.querySelectorAll("[data-pmsv-b24-case]:checked").length,
   newInfo:pmsvB24Changes(pmsvB23Pending.parsed).find(x=>x.id==="coffee-chicory-mixture")?.category,
   treOverwrite:pmsvB24Changes(pmsvB23Pending.parsed).find(x=>x.id==="99-99-1-trehalose")?.category
  }));
  assert.deepEqual(preview,{choices:35,chosen:0,newInfo:"NEW_INFORMATION",treOverwrite:"OVERWRITES_EXISTING"});
  assert.equal(await confirm.isDisabled(),true);
  await panel.locator('[data-pmsv-b24-action="new"]').click();
  assert.equal(await panel.locator('[data-pmsv-b24-case="coffee-chicory-mixture"]').isChecked(),true);
  assert.equal(await panel.locator('[data-pmsv-b24-case="100-100-royal-jelly"]').isChecked(),false);
  await panel.locator('[data-pmsv-b24-case="99-99-1-trehalose"]').check();
  await confirm.click();
  await page.waitForFunction(()=>pmsvB24LastResult==="SELECTIVE_IMPORT_COMPLETE");
  const after=await page.evaluate(()=>{
   const notes=pmsvB5Read(),draft=pmsvB14Read();
   return {t:notes["99-99-1-trehalose"],j:notes["100-100-royal-jelly"],
    c:notes["coffee-chicory-mixture"],tDraft:draft["99-99-1-trehalose"].source_article,
    jDraft:draft["100-100-royal-jelly"].source_article,
    pending:pmsv498Ledger.first_source_pending,partial:pmsv498Ledger.partial_exact,
    approvals:pmsvB21Data.results.independent_legal_approvals};
  });
  assert.equal(after.t.reference,"IMPORTED T COA 101");
  assert.equal(after.t.notes,"IMPORTED T FOLLOWUP");
  assert.equal(after.c.reference,"COFFEE DOCUMENT 1");
  assert.equal(after.j.reference,"JELLY PRIVATE REFERENCE");
  assert.equal(after.j.notes,"JELLY NOT SELECTED");
  assert.equal(after.jDraft,"KEEP LOCAL JELLY");
  assert.equal(after.tDraft,"IMPORTED TREHALOSE REVIEW");
  assert.equal(after.pending,35);assert.equal(after.partial,498);assert.equal(after.approvals,0);
  // Legacy B15 file: selected case's B5 reference and notes are preserved.
  const legacy=await page.evaluate(()=>{
   const p=pmsvB15PacketForTransfer();
   p.review_queue.records.find(x=>x.product.catalog_id==="99-99-1-trehalose").reviewer_record.source_article="LEGACY UPDATED DRAFT";
   return p;
  });
  await put(legacy);
  await page.waitForFunction(()=>pmsvB25LastResult==="LEGACY_PACKET_PREVIEW");
  await panel.locator('[data-pmsv-b24-case="99-99-1-trehalose"]').check();
  await confirm.click();
  await page.waitForFunction(()=>pmsvB24LastResult==="SELECTIVE_IMPORT_COMPLETE");
  assert.equal(await page.evaluate(()=>pmsvB5Read()["99-99-1-trehalose"].reference),"IMPORTED T COA 101");
  // Storage quota/error during B25 note write: the original three keys are restored.
  const quota=structuredClone(exported);
  quota.evidence_notes.records.find(x=>x.catalog_id==="99-99-1-trehalose").notes="ROLLBACK MUST NOT LEAK";
  await put(quota);
  await page.waitForFunction(()=>pmsvB25LastResult==="FULL_PACKET_PREVIEW");
  await panel.locator('[data-pmsv-b24-case="99-99-1-trehalose"]').check();
  const originalState=await page.evaluate(()=>pmsvB23Snapshot());
  await page.evaluate(()=>{
   const orig=Storage.prototype.setItem;let hits=0;
   Storage.prototype.setItem=function(k,v){
    if(k===pmsvB5StorageKey&&++hits===2){
     Storage.prototype.setItem=orig;
     throw Error("Simulated full storage at final notes write");
    }
    return orig.call(this,k,v);
   };
  });
  await confirm.click();
  await page.waitForFunction(()=>pmsvB24LastResult==="STORAGE_REJECTED");
  const rollback=await page.evaluate(()=>pmsvB23Snapshot());
  assert.deepEqual(rollback,originalState,"Failed note-write must restore all local data");
  assert.equal(errors.filter(s=>/pmsvB25|pmsvB24|pmsvB23/.test(s)).length,0,errors.slice(0,8).join("; "));
  console.log("B25 Chromium full evidence-transfer PASS",JSON.stringify({preview,
   preservedUnselected:true,legacyCompatible:true,rollback:true,partial:498,pending:35,approvals:0}));
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
