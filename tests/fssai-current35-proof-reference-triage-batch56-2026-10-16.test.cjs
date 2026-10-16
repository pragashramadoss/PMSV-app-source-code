"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),
 {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=rd("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json");
const b55=rd("fssai-current35-unified-owner-closure-tracker-batch55-2026-10-16.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-175-proof-reference-triage-batch56-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(js.includes('const pmsvB56Expected="'+digest(d)+'"'),"source digest mismatch");
assert.equal(d.origin_batch55_dataset_digest,digest(b55),"wrong inherited B55 digest");
assert(html.includes("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.js?v=20261016-b56"),"missing integration");
assert.equal(d.cases.length,35);
assert.equal(d.totals.catalogue,533);assert.equal(d.totals.conditional_first_source_matches,498);
assert.equal(d.totals.open_ctr_cases,35);assert.equal(d.totals.open_evidence_gates,175);
assert.equal(d.totals.priority_p0,13);assert.equal(d.totals.priority_p1,22);
assert.equal(d.totals.preparatory_requests,70);assert.equal(d.totals.dependent_evidence_gates,105);
assert.equal(d.totals.source_identity_known,28);assert.equal(d.totals.named_material_identity_pending,7);
assert.equal(d.totals.received_documents,0);assert.equal(d.totals.evidence_authenticated,0);
assert.equal(d.totals.approved_ctr_articles,0);assert.equal(d.totals.lab_method_scope_approved,0);
assert.equal(d.totals.lot_passes,0);assert.equal(d.totals.wordpress_changed,false);
assert.equal(d.immutable_decision,"OPEN_UNVERIFIED_NO_AUTO_PASS");
assert.equal(d.review_policy.no_binary_file_upload,true);
assert.equal(d.review_policy.no_user_evidence_transmitted,true);
assert.equal(d.review_policy.only_in_memory_drafts,true);
assert.equal(d.document_type_keys.length,6);assert.equal(d.evidence_stage_keys.length,3);
assert(d.evidence_stage_keys.every(x=>!x.key.includes("APPROVED")));
assert.equal(d.source_boundaries.find(x=>x.id==="FSSAI_FOOD_LABS").url,"https://fssai.gov.in/food-testing/food-laboratories");
const previous=new Map(b55.cases.map(x=>[x.catalogue_id,x])),unique=new Set(),roleCount=new Map();
for(const c of d.cases){
 const prev=previous.get(c.catalogue_id);assert(prev);
 assert.equal(c.rank,prev.rank);assert.equal(c.priority,prev.priority);
 assert.equal(c.original_legal_gate,prev.original_legal_gate);
 assert.equal(c.current_ctr_limit_signed,false);assert.equal(c.validated_laboratory_method,false);
 assert.equal(c.actual_lot_approved,false);assert.equal(c.gates.length,5);
 for(let i=0;i<5;i++){
  const g=c.gates[i],orig=prev.historical_five_gates[i];
  assert.equal(g.request_id,orig.request_id);assert.equal(g.gate_code,orig.gate_code);
  assert.equal(g.owner_role,orig.owner_role);
  assert.deepEqual(g.dependency_codes,orig.must_verify_first);
  assert.equal(g.first_action,orig.request_preparation_lane);
  assert.equal(g.immutable_document_state,"NOT_RECEIVED");
  assert.equal(g.immutable_compliance_state,"NO_APPROVED_LIMIT_METHOD_OR_PASS");
  assert(!unique.has(g.request_id));unique.add(g.request_id);
  roleCount.set(g.owner_role,(roleCount.get(g.owner_role)||0)+1);
 }
}
assert.equal(unique.size,175);assert.equal(roleCount.size,5);
assert([...roleCount.values()].every(n=>n===35));
assert(!/localStorage|sessionStorage|XMLHttpRequest/.test(js));
assert(!/fetch\s*\(\s*["']https:/.test(js));
const port=18956,server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let okay=false;for(let i=0;i<50;i++)try{
   const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(r?.ok()){okay=true;break}
  }catch(_){await nap(200)}
  assert(okay,"preview server unavailable");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
    ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await page.evaluate(()=>pmsvB56Valid()),"B56 digest/lineage validation failed");
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB56Refresh(true)});
  const panel=page.locator("#pmsv-b56-evidence-reference-review");await panel.evaluate(x=>x.open=true);
  assert.equal(await panel.locator("[data-pmsv-b56-rows] tr").count(),175);
  assert.match(await panel.innerText(),/0 approved legal CTR articles/i);
  await panel.locator("[data-pmsv-b56-priority]").selectOption("P0");
  assert.equal(await panel.locator("[data-pmsv-b56-rows] tr").count(),65);
  await panel.locator("[data-pmsv-b56-priority]").selectOption("P1");
  assert.equal(await panel.locator("[data-pmsv-b56-rows] tr").count(),110);
  await panel.locator("[data-pmsv-b56-priority]").selectOption("ALL");
  await panel.locator("[data-pmsv-b56-triage]").selectOption("PREPARABLE");
  assert.equal(await panel.locator("[data-pmsv-b56-rows] tr").count(),70);
  await panel.locator("[data-pmsv-b56-triage]").selectOption("UPSTREAM_DEPENDENCY");
  assert.equal(await panel.locator("[data-pmsv-b56-rows] tr").count(),105);
  await panel.locator("[data-pmsv-b56-triage]").selectOption("ALL");
  await panel.locator("[data-pmsv-b56-role]").selectOption("LABORATORY_TECHNICAL_MANAGER");
  assert.equal(await panel.locator("[data-pmsv-b56-rows] tr").count(),35);
  await panel.locator("[data-pmsv-b56-role]").selectOption("ALL");
  await panel.locator("[data-pmsv-b56-select]").first().click();
  assert.match(await panel.locator("[data-pmsv-b56-detail]").innerText(),/self-reported, unverified and unsent/i);
  await panel.locator('[data-pmsv-b56-field="reference_text"]').fill("VENDOR-QA-001");
  await panel.locator('[data-pmsv-b56-field="issuer_or_custodian"]').fill("Supplier QA");
  await panel.locator('[data-pmsv-b56-field="document_type"]').selectOption("MANUFACTURER_FORMULA_LABEL");
  await panel.locator('[data-pmsv-b56-field="reported_date"]').fill("2026-10-16");
  await panel.locator('[data-pmsv-b56-field="triage_stage"]').selectOption("AWAITING_ISSUER_AND_SOURCE_CHECK");
  await panel.locator('[data-pmsv-b56-field="review_note"]').fill("Need original signed product classification");
  const s=await page.evaluate(()=>pmsvB56ExportObject());
  assert.equal(s.entries.length,1);assert.equal(s.entries[0].reference_text,"VENDOR-QA-001");
  assert.equal(s.entries[0].approval_status,"NOT_VERIFIED_DOES_NOT_RELEASE_PRODUCT");
  assert.equal(s.approved_legal_articles,0);assert.equal(s.actual_lot_passes,0);
  await panel.locator("[data-pmsv-b56-triage]").selectOption("REFERENCE_REPORTED");
  assert.equal(await panel.locator("[data-pmsv-b56-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b56-triage]").selectOption("ALL");
  const p1=page.waitForEvent("download");
  await panel.locator('[data-pmsv-b56-export="GATES"]').click();
  const g=await p1,allCSV=fs.readFileSync(await g.path(),"utf8");
  assert.equal(allCSV.trim().split(/\r?\n/).length,176);
  assert(!allCSV.includes("VENDOR-QA-001"),"Blank gate export leaked user-entered metadata");
  const p2=page.waitForEvent("download");
  await panel.locator('[data-pmsv-b56-export="CSV"]').click();
  const c=await p2,refCSV=fs.readFileSync(await c.path(),"utf8");
  assert.equal(refCSV.trim().split(/\r?\n/).length,2);
  assert(refCSV.includes("VENDOR-QA-001"));assert(refCSV.includes('"false"'));
  const p3=page.waitForEvent("download");
  await panel.locator('[data-pmsv-b56-export="JSON"]').click();
  const j=await p3,jsonText=fs.readFileSync(await j.path(),"utf8");
  assert.equal(JSON.parse(jsonText).entries.length,1);
  const malicious={...s,entries:[{...s.entries[0],legal_ctr_approved:true}]};
  assert.equal(await page.evaluate(x=>pmsvB56Import(JSON.stringify(x)),malicious),false);
  assert.equal((await page.evaluate(()=>pmsvB56ExportObject())).entries.length,1);
  const corruptID={...s,entries:[{...s.entries[0],request_id:"UNRECOGNISED-0000"}]};
  assert.equal(await page.evaluate(x=>pmsvB56Import(JSON.stringify(x)),corruptID),false);
  assert.equal((await page.evaluate(()=>pmsvB56ExportObject())).entries.length,1);
  await panel.locator("[data-pmsv-b56-clear-all]").click();
  assert.equal((await page.evaluate(()=>pmsvB56ExportObject())).entries.length,0);
  await panel.locator("[data-pmsv-b56-import-file]").setInputFiles({
   name:"references.json",mimeType:"application/json",buffer:Buffer.from(jsonText,"utf8")
  });
  await page.waitForFunction(()=>pmsvB56ExportObject()?.entries.length===1);
  assert.equal((await page.evaluate(()=>pmsvB56ExportObject())).entries[0].reference_text,"VENDOR-QA-001");
  assert.match(await panel.locator("[data-pmsv-b56-feedback]").innerText(),/ZERO evidence verified/i);
  const badFile=JSON.stringify({...s,actual_lot_passes:1});
  await panel.locator("[data-pmsv-b56-import-file]").setInputFiles({
   name:"unapproved.json",mimeType:"application/json",buffer:Buffer.from(badFile,"utf8")
  });
  await page.waitForFunction(()=>document.querySelector("[data-pmsv-b56-feedback]")?.textContent.includes("Rejected:"));
  assert.equal((await page.evaluate(()=>pmsvB56ExportObject())).entries.length,1);
  assert.equal(errors.filter(x=>/pmsvB56/.test(x)).length,0,errors.join("\n"));
  console.log("B56 PASS: 35 cases/175 signed-off-unchanged gate IDs, 70 preparable/105 dependent, five roles, metadata-only CSV/JSON restore, strict rejection of approval/unknown-ID imports, zero authenticated evidence/legal CTR/lab approval/lot PASS");
 }finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(err=>{console.error(err);process.exitCode=1;server.kill("SIGTERM")});
