"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=rd("fssai-current35-unified-owner-closure-tracker-batch55-2026-10-16.json");
const b52=rd("fssai-current35-175-open-evidence-gates-batch52-2026-10-16.json");
const b53=rd("fssai-current35-p0-thirteen-legal-method-evidence-batch53-2026-10-16.json");
const b54=rd("fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16.json");
const script=fs.readFileSync(path.join(root,"fssai-current35-unified-owner-closure-tracker-batch55-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(script.includes('const pmsvB55Expected="'+digest(d)+'"'));
assert(html.includes("fssai-current35-unified-owner-closure-tracker-batch55-2026-10-16.js?v=20261016-b55"),"Batch55 index not integrated");
assert.equal(d.cases.length,35);assert.equal(d.totals.ctr_cases_open,35);assert.equal(d.totals.catalogue,533);
assert.equal(d.totals.conditional_first_source_matches,498);assert.equal(d.totals.original_gate_ids,175);
assert.equal(d.totals.independent_request_preparation_gates,70);
assert.equal(d.totals.dependent_approval_gates,105);
assert.equal(d.totals.cases_P0,13);assert.equal(d.totals.cases_P1,22);
assert.equal(d.totals.individual_material_identity_unknown,7);
assert.equal(d.totals.signed_legal_approvals,0);assert.equal(d.totals.received_documents,0);
assert.equal(d.totals.accredited_methods_approved,0);assert.equal(d.totals.actual_lot_passes,0);
assert.equal(d.totals.wordpress_changed,false);
assert.equal(d.evidence_policy.editable_session,"OPTIONAL_IN_MEMORY_CASE_COORDINATOR_AND_TARGET_DATE_ONLY_NO_NETWORK_NO_STORAGE");
const previous=new Map(b52.cases.map(x=>[x.catalogue_id,x]));
const previousP0=new Map(b53.dockets.map(x=>[x.catalogue_id,x]));
const previousP1=new Map(b54.p1_dossiers.map(x=>[x.catalogue_id,x]));
const ids=new Set(),roles=new Map();let p0=0,p1=0,ready=0,blocked=0;
for(const x of d.cases){
 const b=previous.get(x.catalogue_id);assert(b&&b.rank===x.rank);
 const prior=x.priority==="P0"?previousP0.get(x.catalogue_id):previousP1.get(x.catalogue_id);
 assert(prior&&prior.original_legal_gate===x.original_legal_gate||prior?.legal_gate===x.original_legal_gate);
 assert.equal(x.planned_person_owner,null);assert.equal(x.planned_due_date,null);
 assert.equal(x.evidence_documents_received,0);
 assert.equal(x.requests_sent,0);assert.equal(x.representative_lot_pass,false);
 assert.equal(x.signed_current_ctr_limit,false);assert.equal(x.accredited_matrix_method_validated,false);
 assert.equal(x.historical_five_gates.length,5);
 if(x.priority==="P0")p0++;else p1++;
 for(const [i,g] of x.historical_five_gates.entries()){
  assert.equal(g.request_id,b.gates[i].request_id);
  assert.equal(g.gate_code,b.gates[i].gate_code);
  assert.equal(g.owner_role,b.gates[i].owner_role);
  assert(!ids.has(g.request_id));ids.add(g.request_id);
  assert.equal(g.initial_outreach_state,"NOT_SENT");assert.equal(g.document_state,"NOT_RECEIVED");
  assert.equal(g.actual_assignee,"UNASSIGNED");assert.equal(g.target_date,null);
  assert.equal(g.signed_regulatory_approval,false);assert.equal(g.reviewer_signoff,false);
  if(g.must_verify_first.length===0){assert.equal(g.request_preparation_lane,"CAN_PREPARE_REQUEST_NOW");ready++;}
  else {assert.equal(g.request_preparation_lane,"UPSTREAM_EVIDENCE_REQUIRED_FOR_APPROVAL");blocked++;}
  roles.set(g.owner_role,(roles.get(g.owner_role)||0)+1);
 }
}
assert.equal(ids.size,175);assert.equal(roles.size,5);
assert.equal(ready,70);assert.equal(blocked,105);assert.equal(p0,13);assert.equal(p1,22);
assert([...roles.values()].every(n=>n===35));
assert(!/localStorage|sessionStorage|XMLHttpRequest/.test(script));
assert(!/fetch\s*\(\s*["']https:/.test(script));
const port=18955,server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true}),errors=[];
 page.on("pageerror",err=>errors.push(err.message));
 let ok=false;for(let i=0;i<50;i++)try{
  const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
  if(r?.ok()){ok=true;break}
 }catch(_){await nap(200)}
 assert(ok,"local preview server did not start");
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
  ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: test explicit opt-in full evidence loading, not deprecated eager startup.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Core integrity fail-closed");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Full documentary evidence chain must validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
 assert(await page.evaluate(()=>pmsvB55Valid()),"Batch55 digest/lineage validation failed");
 await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB55Refresh(true)});
 const el=page.locator("#pmsv-b55-unified-closure");await el.evaluate(x=>x.open=true);
 assert.equal(await el.locator("[data-pmsv-b55-rows] tr").count(),35);
 assert.match(await el.innerText(),/70 independent gate requests/i);
 for(const [filter,expected] of [["P0",13],["P1",22],["MATERIAL",7],["NAMED",28],["NO_OWNER",35]]){
  await el.locator("[data-pmsv-b55-filter]").selectOption(filter);
  assert.equal(await el.locator("[data-pmsv-b55-rows] tr").count(),expected,filter);
 }
 await el.locator("[data-pmsv-b55-filter]").selectOption("ALL");
 await el.locator("[data-pmsv-b55-case]").first().click();
 assert.equal(await el.locator("[data-pmsv-b55-detail] tbody tr").count(),5);
 assert.match(await el.locator("[data-pmsv-b55-detail]").innerText(),/5 documentary and regulatory gates OPEN/i);
 await el.locator("[data-pmsv-b55-owner]").fill("Reviewer draft only");
 await el.locator("[data-pmsv-b55-date]").fill("2026-11-10");
 assert.equal(await page.evaluate(()=>pmsvB55Draft(pmsvB55Data.cases[0]).owner),"Reviewer draft only");
 assert.equal(await page.evaluate(()=>pmsvB55Draft(pmsvB55Data.cases[0]).due),"2026-11-10");
 await el.locator("[data-pmsv-b55-filter]").selectOption("DRAFT");
 assert.equal(await el.locator("[data-pmsv-b55-rows] tr").count(),1);
 const export1=page.waitForEvent("download");
 await el.locator('[data-pmsv-b55-export="SESSION"]').click();
 const a=await export1,sessionCsv=fs.readFileSync(await a.path(),"utf8");
 assert.equal(sessionCsv.trim().split(/\r?\n/).length,36);
 assert(sessionCsv.includes("Reviewer draft only"));assert(sessionCsv.includes("2026-11-10"));
 assert(sessionCsv.includes('"false"'));
 await el.locator("[data-pmsv-b55-role]").selectOption("LABORATORY_TECHNICAL_MANAGER");
 const export2=page.waitForEvent("download");
 await el.locator('[data-pmsv-b55-export="GATES"]').click();
 const b=await export2,roleCsv=fs.readFileSync(await b.path(),"utf8");
 assert.equal(roleCsv.trim().split(/\r?\n/).length,36);
 assert(!roleCsv.includes("Reviewer draft only"));
 assert(roleCsv.includes("LABORATORY_TECHNICAL_MANAGER"));
 await el.locator("[data-pmsv-b55-role]").selectOption("ALL");
 const export3=page.waitForEvent("download");
 await el.locator('[data-pmsv-b55-export="GATES"]').click();
 const c=await export3,gateCsv=fs.readFileSync(await c.path(),"utf8");
 assert.equal(gateCsv.trim().split(/\r?\n/).length,176);
 assert(!gateCsv.includes("Reviewer draft only"));
 await el.locator("[data-pmsv-b55-clear-all]").click();
 assert.equal(await page.evaluate(()=>Object.keys(pmsvB55Drafts).length),0);
 assert.equal(await el.locator("[data-pmsv-b55-rows] tr").count(),0);
 await el.locator("[data-pmsv-b55-filter]").selectOption("ALL");
 assert.equal(await el.locator("[data-pmsv-b55-rows] tr").count(),35);
 assert.equal(errors.filter(x=>/pmsvB55/.test(x)).length,0,errors.join("\n"));
 console.log("B55 PASS: 35 case + 175 gate lineage, 70 independent / 105 dependent, five 35-gate owner roles; memory-only drafts and role/full/assignment exports; zero legal method and lot PASS");
}finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(err=>{console.error(err);process.exitCode=1;server.kill("SIGTERM")});
