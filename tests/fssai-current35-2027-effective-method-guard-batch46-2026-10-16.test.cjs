"use strict";
/* Batch46: future-effective law must not become current; 35 pending case routes only. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",dir=path.join(base,"data","rules");
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),"utf8"));
const d=read("fssai-current35-2027-effective-method-guard-batch46-2026-10-16.json");
const p=read("fssai-current35-five-gate-readiness-batch44-2026-10-16.json");
const source=fs.readFileSync(path.join(base,"fssai-current35-2027-effective-method-guard-batch46-2026-10-16.js"),"utf8");
const index=fs.readFileSync(path.join(base,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){const z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(source.includes('const pmsvB46Expected="'+digest(d)+'"'));
assert(index.includes('fssai-current35-2027-effective-method-guard-batch46-2026-10-16.js?v=20261016-b46'));
assert.equal(d.environment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.amendment.current_date,"2026-10-16");
assert.equal(d.amendment.effective_date,"2027-04-01");
assert.equal(d.amendment.new_regulation_2_5_in_force,false);
assert.equal(d.amendment.new_regulation_2_6_in_force,false);
assert.equal(d.amendment.manual_2024_number_collision_resolved_by_future_amendment,false);
assert.equal(d.amendment.official_pdf_direct_contents_inspected,false);
assert.deepEqual([d.counts.catalogue,d.counts.conditionally_sourced,d.counts.remaining_ctr,d.counts.metal_cases,d.counts.nonmetal_cases,d.counts.dated_legal_case_screens,d.counts.review_prompts_total,d.counts.methods_manual_families,d.counts.previous_five_gate_requests_unchanged,d.counts.previous_lab_preflight_checks_unchanged,d.counts.future_rule_applied_as_current,d.counts.actual_lab_passes],[533,498,35,27,8,35,210,5,175,280,0,0]);
const cases=new Map(p.case_gate_dossiers.map(x=>[x.catalogue_id,x]));const seen=new Set();let metals=0;
for(const c of d.cases){const prev=cases.get(c.catalogue_id);assert(prev);assert(!seen.has(c.catalogue_id));seen.add(c.catalogue_id);
 assert.equal(c.product_name,prev.product_name);assert.equal(c.analyte,prev.analyte);
 assert.equal(c.sale_form_and_ctr_exception,prev.legal_article_context);
 assert.equal(c.inherited_lab_gate,prev.new_five_gate_ids[3]);
 assert.equal(c.amendment_in_force_for_case,false);assert.equal(c.official_method_selected,false);
 assert.equal(c.legal_ctr_limit_verified,false);assert.equal(c.lot_compliance_pass,false);
 assert.equal(c.decision_points.length,6);
 for(const v of c.decision_points){assert(v.id.startsWith("PMSV46-"));assert.equal(v.approved,false);}
 if(c.analyte_family==="TRACE_METALS")metals++;
}
assert.equal(seen.size,35);assert.equal(metals,27);
const port=18946,server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const sleep=t=>new Promise(r=>setTimeout(r,t));
(async()=>{let browser;
 try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on("pageerror",e=>errors.push(e.message));
 let open=false;for(let i=0;i<40;i++)try{const x=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});if(x?.ok()){open=true;break;}}catch(_){await sleep(250)}
 assert(open);
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
 assert(await page.evaluate(()=>pmsvB45Valid()),"Upstream Batch45 must pass");
 assert(await page.evaluate(()=>pmsvB46Valid()),"Batch46 source/cross-batch integrity failed");
 await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB46Refresh()});
 const panel=page.locator("#pmsv-b46-future-law");await panel.evaluate(el=>el.open=true);
 assert.equal(await panel.locator("[data-pmsv-b46-rows] tr").count(),35);
 const visible=await panel.innerText();
 assert.match(visible,/NOT IN FORCE \(16 Oct 2026\)/);
 assert.match(visible,/1 April 2027/);
 await panel.locator("[data-pmsv-b46-family]").selectOption("METALS");
 assert.equal(await panel.locator("[data-pmsv-b46-rows] tr").count(),27);
 await panel.locator("[data-pmsv-b46-family]").selectOption("OTHERS");
 assert.equal(await panel.locator("[data-pmsv-b46-rows] tr").count(),8);
 await panel.locator("[data-pmsv-b46-family]").selectOption("ALL");
 await panel.locator("[data-pmsv-b46-method]").selectOption("REVISED_MYCOTOXINS_MANUAL");
 assert.equal(await panel.locator("[data-pmsv-b46-rows] tr").count(),3);
 await panel.locator("[data-pmsv-b46-method]").selectOption("ALL");
 await panel.locator("[data-pmsv-b46-search]").fill("cocoa mass");
 assert.equal(await panel.locator("[data-pmsv-b46-rows] tr").count(),1);
 await panel.locator("[data-pmsv-b46-inspect]").click();
 assert.match(await panel.locator("[data-pmsv-b46-detail]").innerText(),/Still pending/);
 const draft=await page.evaluate(()=>pmsvB46Request(pmsvB46Rows()[0]));
 assert.match(draft,/NOT SENT \/ NOT APPROVED/);assert(draft.includes("2027"));
 await panel.locator("[data-pmsv-b46-search]").fill("");
 const dl=page.waitForEvent("download");await panel.locator('[data-pmsv-b46-export="ALL"]').click();
 const file=await dl,txt=fs.readFileSync(await file.path(),"utf8");
 assert.equal(txt.trim().split(/\r?\n/).length,36);
 assert(txt.includes("2027-04-01"));assert(txt.includes("false"));assert(!txt.includes("PASSED_REGULATORY"));
 assert.equal(errors.filter(z=>/pmsvB46/.test(z)).length,0,errors.join("\n"));
 console.log("B46 CHROMIUM VERIFIED: 35 effective-date law guards, 5 manuals areas, 27 metals/8 others, CSV, no premature 2027 mandate or fake PASS");
 }finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
