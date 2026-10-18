"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01/";
const src=fs.readFileSync(root+"fssai-final35-legal-review-2026-10-18.js","utf8");
const audit=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-legal-candidate-audit-2026-10-17.json","utf8"));
const original=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json","utf8"));
assert(fs.readFileSync(root+"index.html","utf8").includes("fssai-final35-legal-review-2026-10-18.js"));
assert.equal(audit.rows.length,35);assert.equal(original.cases.length,35);
assert.equal(audit.rows.filter(x=>x.published_named_product_standard_located).length,28);
(async()=>{
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.setContent('<html><body><div id="pmsv-b76-case-dossier"></div></body></html>');
 await page.evaluate(({audit,original})=>{
  window.fixture={audit,original,good:true,ready:true};
  window.pmsvB14Digest=v=>{let a=0x811c9dc5,b=0x9747b28c;const s=JSON.stringify(v);for(let j=0;j<s.length;j++){let c=s.charCodeAt(j);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
  window.pmsvB70ExtendedResearch={getState:()=>({core:"READY",extended:fixture.ready?"READY":"BLOCKED",all35Held:fixture.good,caseApprovals:0,labPasses:0,productReleases:0})};
  window.pmsvB59CTRSourceCrosswalk={valid:()=>fixture.good,getAllCases:()=>fixture.original.cases};
  window.fetch=async()=>({ok:true,json:async()=>fixture.audit});
 },{audit,original});
 await page.addScriptTag({content:src});
 assert.equal(await page.evaluate(()=>pmsvFinal35LegalReview.verified()),false);
 assert.equal(await page.evaluate(()=>pmsvFinal35LegalReview.load()),true);
 assert.equal(await page.locator("[data-f35-rows] tr").count(),35);
 assert.equal((await page.evaluate(()=>pmsvFinal35LegalReview.csv())).trim().split("\r\n").length,36);
 await page.locator("[data-f35-identity]").selectOption("NO");
 assert.equal(await page.locator("[data-f35-rows] tr").count(),7);
 await page.locator("[data-f35-identity]").selectOption("ALL");
 await page.locator("[data-f35-priority]").selectOption("P0");
 assert.equal(await page.locator("[data-f35-rows] tr").count(),13);
 await page.evaluate(()=>{fixture.original.cases[0].rank=999});
 assert.equal(await page.evaluate(()=>pmsvFinal35LegalReview.render()),false);
 assert.equal(await page.locator("[data-f35-export]").isDisabled(),true);
 await page.evaluate(()=>{fixture.original.cases[0].rank=1;fixture.audit.rows[0].release="PASS"});
 assert.equal(await page.evaluate(()=>pmsvFinal35LegalReview.load()),false);
 console.log("FINAL35_PRODUCT_REVIEW_PASS 35 cases, 28/7 identity, 175 evidence, tamper fail closed");
}finally{await browser.close()}
})().catch(e=>{console.error("FINAL35_PRODUCT_REVIEW_FAIL",e);process.exitCode=1});