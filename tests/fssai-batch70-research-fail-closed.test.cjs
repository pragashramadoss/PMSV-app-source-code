"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const js=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-core-startup-batch70-2026-10-17.js","utf8");
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage();
  await page.setContent('<!doctype html><html><body><div id="selectedProductStandardContent"></div></body></html>');
  await page.evaluate(()=>{
   window.pmsvB22StartupState="READY";
   window.pmsvLoadPositiveSourceProof=async()=>{throw Error("simulated source integrity hold");};
  });
  await page.addScriptTag({content:js});
  const box=page.locator("#pmsv-b70-startup-gates");assert.equal(await box.count(),1);
  await box.evaluate(x=>x.open=true);
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState().extended),"NOT_REQUESTED");
  await box.locator("[data-pmsv-b70-load]").click();
  await page.waitForFunction(()=>window.pmsvB70ExtendedResearch.getState().extended==="INTEGRITY_BLOCKED");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState().productReleases),0);
  assert.match(await box.locator("[data-pmsv-b70-message]").textContent(),/No data was approved/);
  await page.evaluate(()=>window.pmsvB22StartupState="INTEGRITY_BLOCKED");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),false);
  console.log("B70_COMPONENT_FAIL_CLOSED_PASS: source error does not authorize any legal/lab/lot PASS.");
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
