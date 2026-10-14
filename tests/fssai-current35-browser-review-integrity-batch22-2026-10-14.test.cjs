"use strict";
/* Real-browser test (Playwright Chromium); runs on a local static server.
 * Verifies real B14→B15→B20→B21→B22 event wiring and no false compliance PASS.
 */
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const {chromium}=require("playwright");
const port=18876;
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory","fssai-product-helper-preview-01"],{stdio:"ignore"});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage();
  const fatal=[];
  page.on("pageerror",e=>fatal.push(String(e.message||e)));
  let ready=false;
  for(let i=0;i<30;i++){
   try{
    const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
    if(r?.ok()){ready=true;break}
   }catch(_){await sleep(200)}
  }
  assert(ready,"Static PMSV preview did not start");
  // Product standards load their regulatory data lazily on entering the standard route.
  // Call the same public loader used by the real product-standard UI, then verify the full chain.
  await page.waitForFunction(()=>typeof loadContaminantsDb==="function"&&
    typeof pmsvB22Ready==="function",null,{timeout:30000});
  await page.evaluate(async()=>await loadContaminantsDb());
  const diagnostic=await page.evaluate(()=>({
    queue:typeof pmsv35Queue!=="undefined"&&!!pmsv35Queue,
    ledger:typeof pmsv498Ledger!=="undefined"&&!!pmsv498Ledger,
    b4:typeof pmsvCurrent35Batch4Valid==="function"&&pmsvCurrent35Batch4Valid(),
    b5:typeof pmsvB5Valid==="function"&&pmsvB5Valid(),
    b6:typeof pmsvB6Valid==="function"&&pmsvB6Valid(),
    b7:typeof pmsvB7Valid==="function"&&pmsvB7Valid(),
    b8:typeof pmsvB8Valid==="function"&&pmsvB8Valid(),
    b9:typeof pmsvB9Valid==="function"&&pmsvB9Valid(),
    b10:typeof pmsvB10Valid==="function"&&pmsvB10Valid(),
    b11:typeof pmsvB11Valid==="function"&&pmsvB11Valid(),
    b12:typeof pmsvB12Valid==="function"&&pmsvB12Valid(),
    b13:typeof pmsvB13Valid==="function"&&pmsvB13Valid(),
    b14:typeof pmsvB14Valid==="function"&&pmsvB14Valid(),
    b15:typeof pmsvB15Valid==="function"&&pmsvB15Valid(),
    b17:typeof pmsvB17Valid==="function"&&pmsvB17Valid(),
    b18:typeof pmsvB18Valid==="function"&&pmsvB18Valid(),
    b19:typeof pmsvB19Valid==="function"&&pmsvB19Valid(),
    b20:typeof pmsvB20Valid==="function"&&pmsvB20Valid(),
    b21:typeof pmsvB21Valid==="function"&&pmsvB21Valid(),
    ready:typeof pmsvB22Ready==="function"&&pmsvB22Ready(),
    warnings:typeof pmsvB22Stats==="object"?pmsvB22Stats.lastError:""
  }));
  console.log("B22 real-browser regulatory-loader diagnostic",JSON.stringify(diagnostic));
  assert(diagnostic.ready,"Regulatory source chain invalid after the actual loader: "+JSON.stringify(diagnostic));
  await page.evaluate(()=>{
    document.getElementById("standard")?.classList.remove("hidden");
    pmsvB14EnsureDashboard();pmsvB20Ensure();pmsvB21Refresh();pmsvB22EnsureControl();
  });
  assert.equal(await page.locator("#pmsv-b21-readiness").count(),1,"Readiness panel is absent");
  assert.equal(await page.locator("#pmsv-b20-audit").count(),1,"CTR risk audit is absent");
  assert.equal(await page.locator("[data-pmsv-b22-recheck]").count(),1,"Recheck button is absent");
  const baseline=await page.evaluate(()=>({
   ledger:[pmsv498Ledger.records.length,pmsv498Ledger.first_source_pending],
   cases:pmsvB21All().length,starter:pmsvB21Stats(pmsvB21All()).NOT_STARTED
  }));
  assert.deepEqual(baseline,{ledger:[533,35],cases:35,starter:35});
  await page.locator("#pmsv-b21-readiness summary").click();
  await page.locator("#pmsv-b20-audit summary").click();
  assert.equal(await page.locator("#pmsv-b20-audit").evaluate(e=>e.open),true);
  await page.locator("[data-pmsv-b21-search]").fill("trehalose");
  assert.equal(await page.locator("[data-pmsv-b21-open]").count(),1,"Trehalose search must narrow to one case");
  await page.locator("[data-pmsv-b21-open]").click();
  assert.equal(await page.locator("#pmsv-b14-review-index").evaluate(e=>e.open),true);
  assert.equal(await page.locator("#pmsv-b14-review-index [data-pmsv-b14-case]").getAttribute("data-pmsv-b14-case"),"99-99-1-trehalose");
  const current=await page.evaluate(()=>document.getElementById("pmsv-b20-audit"));
  await page.locator("#pmsv-b14-review-index [data-pmsv-b14-field=source_article]").fill("Foods not specified");
  await page.locator("#pmsv-b14-review-index [data-pmsv-b14-field=analyte]").fill("Lead");
  await page.locator("#pmsv-b14-review-index [data-pmsv-b14-field=source_url]").fill("https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf");
  const state=await page.evaluate(()=>({
   panelPreserved:document.getElementById("pmsv-b20-audit")===document.getElementById("pmsv-b20-audit"),
   open:document.getElementById("pmsv-b20-audit").open,
   status:pmsvB21All().find(x=>x.id==="99-99-1-trehalose")?.status,
   codes:pmsvB21All().find(x=>x.id==="99-99-1-trehalose")?.issues.map(y=>y.code),
   retained:document.querySelector("[data-pmsv-b21-search]")?.value
  }));
  assert.equal(state.open,true,"Audit must stay expanded during typing");
  assert.equal(state.retained,"trehalose","Search input must survive refresh");
  assert.equal(state.status,"ARTICLE_SCOPE_REVIEW_REQUIRED");
  assert(state.codes.includes("GENERIC_METAL_FALLBACK"));
  const sameNode=await page.evaluate(()=>document.getElementById("pmsv-b20-audit")===window.__batch22PanelMarker);
  // Set a direct reference before rechecking and verify it is not replaced.
  await page.evaluate(()=>{window.__batch22PanelMarker=document.getElementById("pmsv-b20-audit");pmsvB20Ensure()});
  assert.equal(await page.evaluate(()=>document.getElementById("pmsv-b20-audit")===window.__batch22PanelMarker),true);
  await page.locator("[data-pmsv-b22-recheck]").click();
  assert.equal(await page.locator("[data-pmsv-b21-open]").count(),1);
  await page.evaluate(()=>{
    window.dispatchEvent(new StorageEvent("storage",{key:pmsvB14StorageKey,storageArea:localStorage}));
  });
  assert.equal(await page.locator("[data-pmsv-b22-remote-change]").count(),1);
  await page.locator("[data-pmsv-b22-reload]").click();
  assert.equal(await page.locator("[data-pmsv-b22-remote-change]").count(),0);
  const finished=await page.evaluate(()=>({
   status:pmsvB21All().find(x=>x.id==="99-99-1-trehalose")?.status,
   prepared:pmsv498Ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,
   approved:pmsvB21Data.results.independent_legal_approvals,
   pass:pmsvB21Data.results.lot_passes,
   sync:pmsvB22Stats.syncs
  }));
  assert.equal(finished.status,"ARTICLE_SCOPE_REVIEW_REQUIRED");
  assert.equal(finished.prepared,35);assert.equal(finished.approved,0);assert.equal(finished.pass,0);
  assert(finished.sync>=2);
  assert.equal(fatal.filter(e=>/pmsvB2[012]|pmsvB14|pmsvB15/.test(e)).length,0,
   "Source workflow page exceptions: "+fatal.slice(0,5).join(" | "));
  console.log("Batch22 Chromium evidence integration PASS",JSON.stringify({baseline,state,finished}));
 }finally{
  if(browser)await browser.close();
  server.kill("SIGTERM");
 }
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
