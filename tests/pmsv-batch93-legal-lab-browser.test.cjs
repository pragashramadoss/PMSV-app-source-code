"use strict";
const assert=require("node:assert/strict"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const server=spawn("python3",["-m","http.server","18993","--directory","fssai-product-helper-preview-01","--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
async function open(p){
 let opened=false;
 for(let i=0;i<40;i++)try{
  const r=await p.goto("http://127.0.0.1:18993/",{waitUntil:"domcontentloaded",timeout:14000});
  if(r?.ok()){opened=true;break}
 }catch(_){await nap(200)}
 assert(opened);
 await p.waitForFunction(()=>["READY","INTEGRITY_BLOCKED"].includes(window.pmsvB22StartupState),null,{timeout:60000});
 assert.equal(await p.evaluate(()=>pmsvB22StartupState),"READY");
 await p.locator('button[data-tab="standard"]').click();
 await p.evaluate(()=>window.pmsvB70ExtendedResearch.request());
 await p.locator("#pmsv-b70-startup-gates").evaluate(e=>e.open=true);
}
(async()=>{let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const p=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
  const errors=[];p.on("pageerror",e=>errors.push(e.message));
  await open(p);
  assert.equal(await p.evaluate(()=>pmsvB93LegalLab.load()),true);
  assert.equal(await p.evaluate(()=>pmsvB93LegalLab.valid()),true);
  const root=p.locator("#pmsv-b93-legal-lab");
  assert.equal(await root.locator("[data-b93-rows] tr").count(),35);
  assert((await root.locator("[data-b93-status]").textContent()).includes("0/35"));
  await root.locator('[data-b93-filter="priority"]').selectOption("P0");
  assert.equal(await root.locator("[data-b93-rows] tr").count(),13);
  await root.locator('[data-b93-filter="priority"]').selectOption("ALL");
  await root.locator('[data-b93-filter="analyte"]').selectOption("Lead");
  assert.equal(await root.locator("[data-b93-rows] tr").count(),24);
  await root.locator('[data-b93-filter="analyte"]').selectOption("ALL");
  await root.locator("[data-b93-search]").fill("Cocoa Beans");
  assert.equal(await root.locator("[data-b93-rows] tr").count(),1);
  assert.equal((await p.evaluate(()=>pmsvB93LegalLab.csv())).trim().split("\r\n").length,2);
  await root.locator("[data-b93-search]").fill("");
  let dl=p.waitForEvent("download",{timeout:12000});
  await root.locator("[data-b93-csv]").click();
  assert.equal((await dl).suggestedFilename(),"PMSV-B93-FILTERED-35-LEGAL-TEST-READINESS-HELD.csv");
  await root.locator("[data-b93-rows] [data-b93-case]").first().click();
  assert((await root.locator("[data-b93-details]").textContent()).includes("Lot CoA NOT RECEIVED"));
  dl=p.waitForEvent("download",{timeout:12000});
  await root.locator('[data-b93-action="rfq"]').click();
  assert((await dl).suggestedFilename().includes("UNSENT-LEGAL-LAB-RFQ"));
  await root.locator('[data-b93-action="evidence"]').click();
  assert.equal(await p.locator("#pmsv-b91-evidence-register .pmsv-b91-gate").count(),5);
  assert.equal(await p.evaluate(()=>pmsvB87Catalogue.closedResearchSummary().product_releases),0);
  assert.equal(errors.length,0);
  const damaged=await browser.newPage({viewport:{width:390,height:844}});
  await damaged.route("**/pmsv-final35-legal-test-scope-review-batch92-2026-10-20.json*",async route=>{
   const response=await route.fetch(),obj=await response.json();
   obj.records[0].product_approval="YES";
   await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(obj)});
  });
  await open(damaged);
  assert.equal(await damaged.evaluate(()=>pmsvB93LegalLab.load()),false);
  assert.equal(await damaged.evaluate(()=>pmsvB93LegalLab.valid()),false);
  assert.equal(await damaged.locator("#pmsv-b93-legal-lab [data-b93-rows] tr").count(),0);
  console.log("B93 CHROMIUM PASS: 35 real cases, mobile search, 13 P0, 24 lead, downloads, 5-proof navigation and tamper block.");
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
