"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),
 {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=read("fssai-current35-source-method-lab-authentication-batch57-2026-10-16.json");
const b56=read("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-source-method-lab-authentication-batch57-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert.equal(d.imported_batch56_source_digest,digest(b56));
assert(js.includes('const pmsvB57PlusExpected="'+digest(d)+'"'));
assert(html.includes('fssai-current35-source-method-lab-authentication-batch57-2026-10-16.js?v=20261016-b57'),"Missing final preview integration");
assert.equal(d.totals.catalogue,533);
assert.equal(d.totals.conditional_source_matches,498);
assert.equal(d.totals.open_ctr_legal_cases,35);
assert.equal(d.totals.gate_count,175);
assert.equal(d.totals.authentication_points,1470);
assert.equal(d.totals.lab_scope_checks,350);
assert.equal(d.totals.method_source_checks,280);
assert.equal(d.totals.commercial_identity_checks,280);
assert.equal(d.totals.ctr_legal_checks,280);
assert.equal(d.totals.actual_lot_checks,280);
assert.equal(d.totals.actual_named_labs_selected,0);
assert.equal(d.totals.current_ctr_articles_approved,0);
assert.equal(d.totals.accredited_matrix_methods_signed,0);
assert.equal(d.totals.actual_tested_lot_passes,0);
assert.equal(d.totals.wordpress_changed,false);
assert.equal(d.case_dossiers.length,35);
assert.equal(d.gate_checkpoint_templates.length,5);
assert(d.source_documents.some(s=>s.id==="FSSAI_GAZETTE_NOTIFICATION_INDEX"&&s.notice_date==="2026-09-30"));
assert(d.source_documents.some(s=>s.id==="NABL_SCOPE_FAQ"));
assert(d.allowed_draft_triage_statuses.every(x=>!/(^|_)APPROVED($|_)/.test(x.code)));
assert(!/localStorage|sessionStorage|XMLHttpRequest/.test(js));
assert(!/fetch\s*\(\s*["']https:/.test(js));
const prev=new Map(b56.cases.map(x=>[x.catalogue_id,x]));
const template=new Map(d.gate_checkpoint_templates.map(x=>[x.gate_code,x.checkpoints]));
assert.deepEqual([...template.values()].map(x=>x.length),[8,8,8,10,8]);
let total=0,gateCount=0,p0=0,p1=0;
const keys=new Set(),ids=new Set();
for(const c of d.case_dossiers){
 const original=prev.get(c.catalogue_id);assert(original);
 assert.equal(c.rank,original.rank);assert.equal(c.product_name,original.product_name);
 assert.equal(c.priority,original.priority);assert.equal(c.analyte,original.analyte);
 assert.equal(c.legal_gate,original.original_legal_gate);
 assert.equal(c.source_url,original.source_url);
 assert.equal(c.actual_market_identity_approved,false);
 assert.equal(c.method_adoption_verified,false);
 assert.equal(c.lab_scope_verified,false);
 assert.equal(c.signed_case_specific_ctr_article,false);
 assert.equal(c.representative_tested_lot_pass,false);
 assert.equal(c.gates.length,5);
 if(c.priority==="P0")p0++;else p1++;
 for(const [i,g] of c.gates.entries()){
  const p=original.gates[i],questions=template.get(g.gate_code);
  assert.equal(g.request_id,p.request_id);assert.equal(g.gate_code,p.gate_code);
  assert.equal(g.owner_role,p.owner_role);
  assert.deepEqual(g.dependencies,p.dependency_codes);
  assert.equal(g.inherited_original_evidence_request,p.required_evidence);
  assert.deepEqual(g.checkpoint_ids,questions.map(x=>x.id));
  assert.equal(g.actual_document_received,false);assert.equal(g.independent_reviewer_signed,false);
  assert(!ids.has(g.request_id));ids.add(g.request_id);gateCount++;
  for(const chk of questions){
   const key=g.request_id+"/"+chk.id;
   assert(!keys.has(key));keys.add(key);total++;
   assert.equal(chk.default_verdict,"NOT_REVIEWED_NO_EVIDENCE");
  }
 }
}
assert.equal(p0,13);assert.equal(p1,22);assert.equal(gateCount,175);assert.equal(total,1470);
const port=18957,server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const p=await browser.newPage({acceptDownloads:true}),errors=[];
  p.on("pageerror",e=>errors.push(e.message));
  let ok=false;for(let i=0;i<50;i++)try{
   const resp=await p.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});
   if(resp?.ok()){ok=true;break;}
  }catch(_){await nap(200)}
  assert(ok,"Preview localhost server did not start");
  await p.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  assert(await p.evaluate(()=>pmsvB57PlusValid()),"B57 35/175/1470 ancestry or digest failure");
  await p.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB57PlusRefresh(true)});
  const panel=p.locator("#pmsv-b57-source-lab-authentication");
  await panel.evaluate(el=>el.open=true);
  assert.equal(await panel.locator("[data-pmsv-b57plus-rows] tr").count(),175);
  assert.match(await panel.innerText(),/30 September 2026/);
  assert.match(await panel.innerText(),/0 actual authentications/);
  await panel.locator("[data-pmsv-b57plus-priority]").selectOption("P0");
  assert.equal(await panel.locator("[data-pmsv-b57plus-rows] tr").count(),65);
  await panel.locator("[data-pmsv-b57plus-priority]").selectOption("P1");
  assert.equal(await panel.locator("[data-pmsv-b57plus-rows] tr").count(),110);
  await panel.locator("[data-pmsv-b57plus-priority]").selectOption("ALL");
  await panel.locator("[data-pmsv-b57plus-gate]").selectOption("LAB_MATRIX_METHOD_AND_LOQ");
  assert.equal(await panel.locator("[data-pmsv-b57plus-rows] tr").count(),35);
  await panel.locator("[data-pmsv-b57plus-select]").first().click();
  assert.equal(await panel.locator("[data-pmsv-b57plus-detail] tbody tr").count(),10);
  assert.match(await panel.locator("[data-pmsv-b57plus-detail]").innerText(),/FSSAI notification/);
  assert.match(await panel.locator("[data-pmsv-b57plus-detail]").innerText(),/NABL/);
  const chk=panel.locator('[data-pmsv-b57plus-property="triage_status"]').first();
  await chk.selectOption("REFERENCE_TO_CHECK_NOT_AUTHENTICATED");
  await panel.locator('[data-pmsv-b57plus-property="follow_up_note"]').first().fill("Verify NABL scope original TC certificate");
  const current=await p.evaluate(()=>pmsvB57PlusExportObject());
  assert.equal(current.records.length,1);
  assert.equal(current.records[0].triage_status,"REFERENCE_TO_CHECK_NOT_AUTHENTICATED");
  assert.equal(current.records[0].regulatory_approval,false);
  assert.equal(current.verified_cases,0);assert.equal(current.legal_approvals,0);
  await panel.locator("[data-pmsv-b57plus-review]").selectOption("DRAFT_ONLY");
  assert.equal(await panel.locator("[data-pmsv-b57plus-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b57plus-review]").selectOption("ALL");
  const blank=p.waitForEvent("download");
  await panel.locator('[data-pmsv-b57plus-export="BLANK"]').click();
  const dl=await blank,blankCsv=fs.readFileSync(await dl.path(),"utf8");
  assert.equal(blankCsv.trim().split(/\r?\n/).length,1471);
  assert(!blankCsv.includes("Verify NABL scope original TC certificate"));
  const jsonDownload=p.waitForEvent("download");
  await panel.locator('[data-pmsv-b57plus-export="JSON"]').click();
  const jd=await jsonDownload,json=fs.readFileSync(await jd.path(),"utf8");
  assert.equal(JSON.parse(json).records.length,1);
  const csvDownload=p.waitForEvent("download");
  await panel.locator('[data-pmsv-b57plus-export="CSV"]').click();
  const cd=await csvDownload,csv=fs.readFileSync(await cd.path(),"utf8");
  assert.equal(csv.trim().split(/\r?\n/).length,2);
  assert(csv.includes("Verify NABL scope original TC certificate"));
  const poisoned={...current,legal_approvals:1};
  assert.equal(await p.evaluate(d=>pmsvB57PlusImport(JSON.stringify(d)),poisoned),false);
  const extras={...current,records:[{...current.records[0],approved_method:true}]};
  assert.equal(await p.evaluate(d=>pmsvB57PlusImport(JSON.stringify(d)),extras),false);
  const badid={...current,records:[{...current.records[0],check_key:"UNKNOWN_GATE/UNKNOWN_CHECK"}]};
  assert.equal(await p.evaluate(d=>pmsvB57PlusImport(JSON.stringify(d)),badid),false);
  assert.equal((await p.evaluate(()=>pmsvB57PlusExportObject())).records.length,1);
  await panel.locator("[data-pmsv-b57plus-clear-all]").click();
  assert.equal((await p.evaluate(()=>pmsvB57PlusExportObject())).records.length,0);
  await panel.locator("[data-pmsv-b57plus-import]").setInputFiles({name:"recheck.json",mimeType:"application/json",buffer:Buffer.from(json)});
  await p.waitForFunction(()=>pmsvB57PlusExportObject()?.records.length===1);
  assert.equal((await p.evaluate(()=>pmsvB57PlusExportObject())).legal_approvals,0);
  const forged=JSON.stringify({...current,validated_lab_methods:1});
  await panel.locator("[data-pmsv-b57plus-import]").setInputFiles({name:"forged.json",mimeType:"application/json",buffer:Buffer.from(forged)});
  await p.waitForFunction(()=>document.querySelector("[data-pmsv-b57plus-feedback]")?.textContent.includes("Rejected:"));
  assert.equal((await p.evaluate(()=>pmsvB57PlusExportObject())).records.length,1);
  assert.equal(errors.filter(x=>/pmsvB57Plus/.test(x)).length,0,errors.join("\n"));
  console.log("B57 PASS: 35 cases /175 original requests /1470 source-identity, effective-law, NABL matrix scope and lot review prompts; safe role filters, CSV/JSON, invalid approval imports rejected; no compliance PASS");
 }finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
