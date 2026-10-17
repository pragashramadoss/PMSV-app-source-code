"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),
 {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const b56=rd("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json");
const b57=rd("fssai-current35-source-method-lab-authentication-batch57-2026-10-16.json");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const js=fs.readFileSync(path.join(root,"fssai-current35-owner-outreach-batch58-2026-10-17.js"),"utf8");
assert(html.includes("fssai-current35-owner-outreach-batch58-2026-10-17.js?v=20261017-b58"));
assert(html.indexOf("fssai-current35-owner-outreach-batch58-2026-10-17.js")>
 html.indexOf("fssai-current35-source-method-lab-authentication-batch57-2026-10-16.js"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|fetch\s*\(|WebSocket)/.test(js),
 "Outreach panel must not send or fetch documents independently");
assert.equal(b56.totals.catalogue,533);assert.equal(b56.totals.conditional_first_source_matches,498);
assert.equal(b56.totals.open_ctr_cases,35);assert.equal(b56.totals.open_evidence_gates,175);
assert.equal(b56.totals.received_documents,0);assert.equal(b56.totals.evidence_authenticated,0);
assert.equal(b56.totals.lot_passes,0);assert.equal(b56.totals.wordpress_changed,false);
assert.equal(b57.totals.authentication_points,1470);
const caseMap=new Map(b57.case_dossiers.map(x=>[x.catalogue_id,x]));
const seen=new Set(),roles=new Map();let ready=0,blocked=0,p0=0,p1=0;
for(const c of b56.cases){
 if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else assert.fail("Unsupported priority");
 const mirror=caseMap.get(c.catalogue_id);assert(mirror);assert.equal(mirror.product_name,c.product_name);
 assert.equal(mirror.analyte,c.analyte);assert.equal(c.gates.length,5);
 for(const g of c.gates){
  assert(!seen.has(g.request_id));seen.add(g.request_id);
  assert(mirror.gates.some(x=>x.request_id===g.request_id&&x.owner_role===g.owner_role));
  assert.equal(g.immutable_request_state,"NOT_SENT");
  assert.equal(g.immutable_document_state,"NOT_RECEIVED");
  assert.equal(g.immutable_compliance_state,"NO_APPROVED_LIMIT_METHOD_OR_PASS");
  roles.set(g.owner_role,(roles.get(g.owner_role)||0)+1);
  if(g.dependency_codes.length===0)ready++;else blocked++;
 }
}
assert.equal(p0,13);assert.equal(p1,22);assert.equal(seen.size,175);
assert.equal(ready,70);assert.equal(blocked,105);assert.equal(roles.size,5);
assert([...roles.values()].every(v=>v===35));
const port=18958,server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(r=>setTimeout(r,t));
(async()=>{let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let ok=false;
  for(let i=0;i<40;i++)try{
   const x=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(x?.ok()){ok=true;break;}
  }catch(_){await nap(200)}
  assert(ok,"Local preview did not start");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  await page.waitForFunction(()=>typeof window.pmsvB58OwnerOutreach!=="undefined"&&
    document.getElementById("pmsv-b58-owner-packets"),null,{timeout:90000});
  assert(await page.evaluate(()=>window.pmsvB58OwnerOutreach.valid()),"B58 ancestry validation blocked");
  const p=page.locator("#pmsv-b58-owner-packets");
  await p.evaluate(el=>el.open=true);
  assert.equal(await p.locator("[data-pmsv-b58-rows] tr").count(),70);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB58OwnerOutreach.getCounts()),{
   cases:35,preparatory:70,dependent:105,actual_documents_received:0,approvals:0,lot_passes:0});
  await p.locator("[data-pmsv-b58-priority]").selectOption("P0");
  assert.equal(await p.locator("[data-pmsv-b58-rows] tr").count(),26);
  await p.locator("[data-pmsv-b58-priority]").selectOption("P1");
  assert.equal(await p.locator("[data-pmsv-b58-rows] tr").count(),44);
  await p.locator("[data-pmsv-b58-priority]").selectOption("ALL");
  await p.locator("[data-pmsv-b58-phase]").selectOption("DEPENDENT");
  assert.equal(await p.locator("[data-pmsv-b58-rows] tr").count(),105);
  await p.locator("[data-pmsv-b58-phase]").selectOption("ALL");
  assert.equal(await p.locator("[data-pmsv-b58-rows] tr").count(),175);
  for(const role of roles.keys()){
    await p.locator("[data-pmsv-b58-role]").selectOption(role);
    assert.equal(await p.locator("[data-pmsv-b58-rows] tr").count(),35);
  }
  await p.locator("[data-pmsv-b58-role]").selectOption("ALL");
  const csv=await page.evaluate(()=>window.pmsvB58OwnerOutreach.generateCSV());
  const rows=csv.trim().split(/\r?\n/);
  assert.equal(rows.length,176);
  assert(rows[0].includes("regulatory_approval"));
  assert(rows.slice(1).every(x=>x.endsWith(',"false","false","false"')));
  const text=await p.locator("[data-pmsv-b58-letter]").inputValue();
  assert(text.includes("DRAFT ONLY"));assert(text.includes("NOT SENT"));
  assert(!text.includes("SENT AND APPROVED"));
  assert.equal(errors.length,0,"Browser errors: "+errors.join("; "));
  console.log("Batch58 PASS: 35 cases, 175 source-aligned gates; 70 ready-to-request, 105 dependent; source/lot holds; no browser errors.");
 }catch(e){console.error(e);process.exitCode=1;}
 finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
