"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),
 {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=rd("fssai-current35-authentication-scope-preflight-batch57-2026-10-16.json");
const b56=rd("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-authentication-scope-preflight-batch57-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert.equal(d.inherited_batch56_digest,digest(b56));
assert(js.includes('const pmsvB57Expected="'+digest(d)+'"'),"B57 digest mismatch");
assert(html.includes("fssai-current35-authentication-scope-preflight-batch57-2026-10-16.js?v=20261016-b57"),"B57 script not integrated");
assert.equal(d.kind,"PMSV_BATCH57_ALL35_FIVE_GATE_1295_SOURCE_AUTHENTICITY_LAB_SCOPE_PREFLIGHT");
assert.equal(d.baseline_totals.catalogue,533);
assert.equal(d.baseline_totals.conditional_source_matches,498);
assert.equal(d.baseline_totals.open_ctr_cases,35);
assert.equal(d.baseline_totals.original_five_gate_requests,175);
assert.equal(d.baseline_totals.additional_preflight_check_items,1295);
assert.equal(d.baseline_totals.each_case_preflight_check_items,37);
assert.equal(d.baseline_totals.authenticated_preflight_documents,0);
assert.equal(d.baseline_totals.signed_current_ctr_values,0);
assert.equal(d.baseline_totals.accredited_selected_lab_scope_approvals,0);
assert.equal(d.baseline_totals.representative_coa_results_pass,0);
assert.equal(d.baseline_totals.wordpress_changed,false);
assert.deepEqual(Object.values(d.preflight_counts_by_gate),[245,245,245,280,280]);
assert.equal(d.cases.length,35);
const baseline=new Map(b56.cases.map(x=>[x.catalogue_id,x])),gates=new Set(),checks=new Set();
let p0=0,p1=0,items=0;
for(const c of d.cases){
 const old=baseline.get(c.catalogue_id);assert(old);
 assert.equal(c.product_name,old.product_name);
 assert.equal(c.analyte,old.analyte);assert.equal(c.priority,old.priority);
 assert.equal(c.case_approved,false);assert.equal(c.laboratory_selected,false);
 assert.equal(c.nabl_scope_authenticated,false);
 assert.equal(c.representative_lot_coa_authenticated,false);assert.equal(c.gates.length,5);
 if(c.priority==="P0")p0++;else p1++;
 for(let i=0;i<c.gates.length;i++){
  const g=c.gates[i],previous=old.gates[i];
  assert.equal(g.request_id,previous.request_id);assert.equal(g.role,previous.owner_role);
  assert.equal(g.old_document_state,"NOT_RECEIVED");
  assert.equal(g.signed_review_state,"NOT_SIGNED");assert.equal(g.analysis_pass_state,"NO_LOT_PASS");
  assert(!gates.has(g.request_id));gates.add(g.request_id);
  assert.equal(g.preflight_checks.length,[7,7,7,8,8][i]);
  for(const [j,item] of g.preflight_checks.entries()){
   assert.equal(item.check_id,"PMSV57-"+String(c.rank).padStart(2,"0")+"-"+String(i+1).padStart(2,"0")+"-"+String(j+1).padStart(2,"0"));
   assert(!checks.has(item.check_id));checks.add(item.check_id);
   assert.equal(item.stage,"NOT_REQUESTED_OR_CHECKED");
   assert.equal(item.authenticated,false);assert.equal(item.legal_case_approved,false);assert.equal(item.lot_pass,false);
   items++;
  }
 }
}
assert.equal(p0,13);assert.equal(p1,22);assert.equal(gates.size,175);
assert.equal(checks.size,1295);assert.equal(items,1295);
assert.equal(d.source_refs.find(x=>x.id==="FSSAI_NOTIFIED_LABORATORIES").url,"https://fssai.gov.in/food-testing/food-laboratories");
assert.equal(d.source_refs.find(x=>x.id==="MAY_CTR_FUTURE_ONLY").effective_date,"2026-12-01");
assert.equal(d.source_refs.find(x=>x.id==="LAB_RULE_FUTURE_ONLY").effective_date,"2027-04-01");
assert.equal(d.draft_user_triage_stages.length,4);
assert(d.draft_user_triage_stages.every(x=>!x.includes("APPROVED")));
assert(!/localStorage|sessionStorage|XMLHttpRequest/.test(js));
assert(!/fetch\s*\(\s*["']https:/.test(js));
const port=18957,server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(resolve=>setTimeout(resolve,n));
(async()=>{
let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true}),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 let ok=false;for(let i=0;i<50;i++)try{
  const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
  if(r?.ok()){ok=true;break}
 }catch(_){await nap(200)}
 assert(ok,"Local server failed");
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
 ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
 assert(await page.evaluate(()=>pmsvB57Valid()),"B57 ancestry, checksum, 1295 checkpoint crosswalk failed");
 await page.evaluate(()=>{
  document.getElementById("standard")?.classList.remove("hidden");
  pmsvB14EnsureDashboard();pmsvB57Refresh(true);
 });
 const panel=page.locator("#pmsv-b57-source-scope-preflight");
 await panel.evaluate(el=>el.open=true);
 assert.equal(await panel.locator("[data-pmsv-b57-rows] tr").count(),37);
 await panel.locator("[data-pmsv-b57-gate]").selectOption("LAB_MATRIX_METHOD_AND_LOQ");
 assert.equal(await panel.locator("[data-pmsv-b57-rows] tr").count(),8);
 await panel.locator("[data-pmsv-b57-gate]").selectOption("LOT_COA_AND_INDEPENDENT_SIGNOFF");
 assert.equal(await panel.locator("[data-pmsv-b57-rows] tr").count(),8);
 await panel.locator("[data-pmsv-b57-case]").selectOption("ALL");
 assert.equal(await panel.locator("[data-pmsv-b57-rows] tr").count(),280);
 await panel.locator("[data-pmsv-b57-priority]").selectOption("P0");
 assert.equal(await panel.locator("[data-pmsv-b57-rows] tr").count(),104);
 await panel.locator("[data-pmsv-b57-priority]").selectOption("P1");
 assert.equal(await panel.locator("[data-pmsv-b57-rows] tr").count(),176);
 await panel.locator("[data-pmsv-b57-priority]").selectOption("ALL");
 await panel.locator("[data-pmsv-b57-case]").selectOption("FIRST");
 await panel.locator("[data-pmsv-b57-gate]").selectOption("ALL");
 await panel.locator("[data-pmsv-b57-rows] tr").first().locator("[data-pmsv-b57-select]").click();
 assert.match(await panel.locator("[data-pmsv-b57-detail]").innerText(),/evidence preflight item/i);
 await panel.locator('[data-pmsv-b57-field="stage"]').selectOption("REFERENCE_REPORTED_UNVERIFIED");
 await panel.locator('[data-pmsv-b57-field="evidence_reference"]').fill("DOCREF-B57-QA-001");
 await panel.locator('[data-pmsv-b57-field="evidence_reference"]').dispatchEvent("change");
 await panel.locator('[data-pmsv-b57-field="note"]').fill("Check issuing authority and revision date");
 await panel.locator('[data-pmsv-b57-field="note"]').dispatchEvent("change");
 const packet=await page.evaluate(()=>pmsvB57Export());
 assert.equal(packet.entries.length,1);assert.equal(packet.entries[0].evidence_reference,"DOCREF-B57-QA-001");
 assert.equal(packet.authenticated_documents,0);
 assert.equal(packet.legal_article_approvals,0);
 assert.equal(packet.accredited_lab_method_approvals,0);assert.equal(packet.lot_passes,0);
 const a=page.waitForEvent("download");
 await panel.locator('[data-pmsv-b57-download="ALL"]').click();
 const full=await a,fullcsv=fs.readFileSync(await full.path(),"utf8");
 assert.equal(fullcsv.trim().split(/\r?\n/).length,1296);
 assert(!fullcsv.includes("DOCREF-B57-QA-001"));
 const b=page.waitForEvent("download");
 await panel.locator('[data-pmsv-b57-download="SESSION"]').click();
 const sample=await b,notes=fs.readFileSync(await sample.path(),"utf8");
 assert.equal(notes.trim().split(/\r?\n/).length,2);
 assert(notes.includes("DOCREF-B57-QA-001"));
 const c=page.waitForEvent("download");
 await panel.locator('[data-pmsv-b57-download="JSON"]').click();
 const json=await c,jsonText=fs.readFileSync(await json.path(),"utf8");
 assert.equal(JSON.parse(jsonText).entries.length,1);
 const tamperA={...packet,entries:[{...packet.entries[0],product_approved:true}]};
 assert.equal(await page.evaluate(x=>pmsvB57Import(JSON.stringify(x)),tamperA),false);
 const tamperB={...packet,entries:[{...packet.entries[0],check_id:"UNRECOGNIZED"}]};
 assert.equal(await page.evaluate(x=>pmsvB57Import(JSON.stringify(x)),tamperB),false);
 const tamperC={...packet,legal_article_approvals:1};
 assert.equal(await page.evaluate(x=>pmsvB57Import(JSON.stringify(x)),tamperC),false);
 assert.equal((await page.evaluate(()=>pmsvB57Export())).entries.length,1);
 await panel.locator("[data-pmsv-b57-clear-all]").click();
 assert.equal((await page.evaluate(()=>pmsvB57Export())).entries.length,0);
 await panel.locator("[data-pmsv-b57-import]").setInputFiles({
  name:"prior-unverified.json",mimeType:"application/json",buffer:Buffer.from(jsonText)
 });
 await page.waitForFunction(()=>pmsvB57Export()?.entries.length===1);
 assert.equal((await page.evaluate(()=>pmsvB57Export())).entries[0].stage,"REFERENCE_REPORTED_UNVERIFIED");
 assert.equal(errors.filter(x=>/pmsvB57/.test(x)).length,0,errors.join("\n"));
 console.log("Batch57 PASS: all 35 cases, 175 historical gates, 1295 independent checkpoint IDs; 280 lab-scope, 280 lot-review; zero approvals, strict invalid import rejection, browser drafts, 1296-line blank export.");
}finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
