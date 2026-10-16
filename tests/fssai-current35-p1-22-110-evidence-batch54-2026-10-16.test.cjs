"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",rd=name=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",name),"utf8"));
const d=rd("fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16.json");
const old=rd("fssai-current35-175-open-evidence-gates-batch52-2026-10-16.json");
const b51=rd("fssai-current35-seven-material-identity-intake-batch51-2026-10-16.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(js.includes('const pmsvB54Expected="'+digest(d)+'"'),"Pinned source digest differs");
assert(html.includes("fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16.js?v=20261016-b54"),"Preview index missing script");
assert.equal(d.counts.catalogue,533);assert.equal(d.counts.conditional_first_source_matches,498);assert.equal(d.counts.current_exact_ctr_cases_pending,35);
assert.equal(d.counts.p1_in_scope,22);assert.equal(d.counts.p0_unchanged,13);assert.equal(d.counts.p1_original_5_gate_requests,110);
assert.equal(d.counts.p1_published_named_identity_sources,16);assert.equal(d.counts.p1_missing_individual_substance_identity,6);
assert.equal(d.counts.exact_ctr_articles_approved,0);assert.equal(d.counts.signed_mrl_or_metal_limits_assigned,0);assert.equal(d.counts.lot_passes,0);
assert.equal(d.counts.wordpress_changed,false);
const p1=old.cases.filter(x=>x.priority.startsWith("P1"));
assert.equal(p1.length,22);assert.deepEqual(d.p1_dossiers.map(x=>x.rank),p1.map(x=>x.rank));
const legalIds=new Set();
for(const x of d.p1_dossiers){
 const before=p1.find(y=>y.catalogue_id===x.catalogue_id);assert(before);
 assert.equal(x.original_legal_gate,before.upstream_legal_gate);
 assert.equal(x.source_evidence.primary_product_identity_source_only,before.product_standard_identity_source_known);
 assert.equal(x.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED",before.seven_material_intake);
 assert(x.source_evidence.source_url.startsWith("https://"));
 assert(x.specific_document_checklist.length===4);
 assert.deepEqual(x.original_five_documentary_requests.map(g=>g.request_id),before.gates.map(g=>g.request_id));
 assert.equal(x.legal_limit_assigned_for_case,null);assert.equal(x.current_effective_ctr_article_signed,false);
 assert.equal(x.analytical_method_approved,false);assert.equal(x.actual_lot_pass,false);
 assert.equal(x.current_2026_may_ctr_amendment_in_force,false);
 assert.equal(x.on_or_after_2027_method_rule_applied_as_current,false);
 if(before.seven_material_intake)assert(b51.seven_material_cases.some(y=>y.catalogue_id===x.catalogue_id));
 for(const g of x.original_five_documentary_requests){
  assert(!legalIds.has(g.request_id));legalIds.add(g.request_id);
  assert(g.evidence_required&&g.sent===false&&g.received===false&&g.signed===false);
 }
}
assert.equal(legalIds.size,110);
assert.equal(d.p1_dossiers.filter(x=>x.analyte_family==="TRACE_METALS").length,15);
assert.equal(d.p1_dossiers.filter(x=>x.analyte_family==="MYCOTOXINS").length,3);
assert.equal(d.p1_dossiers.filter(x=>["PESTICIDE_RESIDUES","UNSPECIFIED_RESIDUE"].includes(x.analyte_family)).length,4);
assert.equal(d.p1_dossiers.find(x=>x.rank===24).latest_applicant_status_unverified,true);
assert(d.p1_dossiers.find(x=>x.rank===18).cTR_comparator_exclusion.includes(">1.0%"));
assert(!/localStorage|sessionStorage|XMLHttpRequest/.test(js));
assert(!/fetch\s*\(\s*["']https:/.test(js));
const port=18954,server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{let browser;
try{browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true}),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 let ok=false;for(let i=0;i<50;i++)try{const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});if(r?.ok()){ok=true;break}}catch(_){await nap(200)}
 assert(ok,"Preview localhost server not started");
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
 assert(await page.evaluate(()=>pmsvB54Valid()),"B54 integrity, ancestry or source validation failed");
 await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB54Refresh(true)});
 const panel=page.locator("#pmsv-b54-p1-complete-review");await panel.evaluate(el=>el.open=true);
 assert.equal(await panel.locator("[data-pmsv-b54-rows] tr").count(),22);
 assert.match(await panel.innerText(),/110 original evidence requests/i);
 for(const [filter,count] of [["METAL",15],["MYCO",3],["PEST",4],["NAMED",16],["MATERIAL",6],["SAJJI",1]]){
  await panel.locator("[data-pmsv-b54-filter]").selectOption(filter);
  assert.equal(await panel.locator("[data-pmsv-b54-rows] tr").count(),count,filter+" count mismatch");
 }
 await panel.locator("[data-pmsv-b54-case]").click();
 assert.equal(await panel.locator("[data-pmsv-b54-detail] tbody tr").count(),5);
 assert.match(await panel.locator("[data-pmsv-b54-detail]").innerText(),/September 2026 status register/);
 await panel.locator("[data-pmsv-b54-filter]").selectOption("ALL");
 await panel.locator("[data-pmsv-b54-search]").fill("coffee");
 assert.equal(await panel.locator("[data-pmsv-b54-rows] tr").count(),1);
 await panel.locator("[data-pmsv-b54-search]").fill("");
 const future=page.waitForEvent("download");
 await panel.locator("[data-pmsv-b54-export]").click();
 const file=await future,csv=fs.readFileSync(await file.path(),"utf8");
 assert.equal(csv.trim().split(/\r?\n/).length,111);
 assert(csv.includes("Coffee-Chicory Mixture"));assert(csv.includes("Sajji Khar"));
 assert(!csv.includes("UNVERIFIED_SESSION_EVIDENCE_DRAFT"));
 assert.equal(errors.filter(x=>/pmsvB54/.test(x)).length,0,errors.join("\n"));
 console.log("B54 PASS: 22 P1 cases, 110 distinct UNSENT evidence gates, 16 sourced/6 unspecified, metals/toxin/pesticide filters, official source links, Sajji status, 111-line blank CSV and zero approved legal limits/lots");
}finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
