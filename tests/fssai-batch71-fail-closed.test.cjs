"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const js=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-core-startup-batch70-2026-10-17.js","utf8");
const b23=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-transfer-preflight-batch23-2026-10-14.js","utf8");
assert(b23.includes('throw Error("B71_CORE_EVIDENCE_INTEGRITY_BLOCKED")'));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage();
  await page.setContent('<!doctype html><html><body><div id="selectedProductStandardContent"></div></body></html>');
  await page.evaluate(()=>{
   window.pmsvB22StartupState="READY";window.pmsvB21Valid=()=>true;
   window.pmsvLoadPositiveSourceProof=async()=>{throw Error("Simulated downstream fail");};
  });
  await page.addScriptTag({content:js});
  await page.evaluate(()=>window.pmsvB70ExtendedResearch.request());
  const result=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(result.extended,"INTEGRITY_BLOCKED");assert.match(result.error,/Simulated downstream fail/);
  assert.equal(result.caseApprovals,0);assert.equal(result.productReleases,0);
  await page.evaluate(()=>window.pmsvB22StartupState="INTEGRITY_BLOCKED");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),false);
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState().extended),"INTEGRITY_BLOCKED");
  console.log("B71_FAIL_CLOSED_PASS (source failure, invalid core, zero approvals/releases)");
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
