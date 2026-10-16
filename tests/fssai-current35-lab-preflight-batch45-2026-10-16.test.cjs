"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",rules=path.join(base,"data","rules");
const read=name=>JSON.parse(fs.readFileSync(path.join(rules,name),"utf8"));
const d=read("fssai-current35-lab-preflight-batch45-2026-10-16.json"),prev=read("fssai-current35-five-gate-readiness-batch44-2026-10-16.json");
const js=fs.readFileSync(path.join(base,"fssai-current35-lab-preflight-batch45-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){const z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(js.includes('const pmsvB45Expected="'+digest(d)+'"'));
assert(html.includes("fssai-current35-lab-preflight-batch45-2026-10-16.js?v=20261016-b45"));
assert.equal(d.kind,"PMSV_CURRENT35_NONSTATUTORY_LAB_PREFLIGHT_BATCH45");
assert.equal(d.environment,"GH_PAGES_PREVIEW_ONLY");
assert.equal(d.official_raft_guidance.published_guidance_is_legal_adoption,false);
assert.equal(d.official_raft_guidance.published_guidance_is_lab_validation,false);
assert(/RAFT scheme/i.test(d.official_raft_guidance.scope));
assert.deepEqual([d.counts.catalogue,d.counts.conditional_matches,d.counts.pending_ctr,d.counts.metal_cases,d.counts.nonmetal_cases,d.counts.laboratory_preflight_dossiers,d.counts.suggested_points_total,d.counts.existing_five_gate_requests_unchanged,d.counts.lot_passes],[533,498,35,27,8,35,280,175,0]);
assert.equal(d.counts.wordpress_changed,false);
const p=new Map(prev.case_gate_dossiers.map(x=>[x.catalogue_id,x])),seen=new Set();let metals=0;
for(const c of d.cases){
 const original=p.get(c.catalogue_id);assert(original,c.catalogue_id);
 assert(!seen.has(c.catalogue_id));seen.add(c.catalogue_id);
 assert.equal(c.product_name,original.product_name);
 assert.equal(c.analyte,original.analyte);
 assert.equal(c.inherited_lab_gate_id,original.new_five_gate_ids[3]);
 assert.equal(c.inherited_lot_gate_id,original.new_five_gate_ids[4]);
 assert.equal(c.checklist.length,8);
 assert.equal(c.status,"NOT_RECEIVED_NOT_REVIEWED");
 for(const k of c.checklist){assert.equal(k.state,"NOT_RECEIVED_NOT_REVIEWED");assert.equal(k.approved,false);assert.equal(k.guide_only,true);assert(k.requested_proof.length>60);}
 assert.equal(c.method_approved,false);assert.equal(c.ctr_article_approved,false);assert.equal(c.lot_pass,false);
 if(c.analyte_family==="TRACE_METALS")metals++;
}
assert.equal(seen.size,35);assert.equal(metals,27);
const server=spawn("python3",["-m","http.server","18945","--bind","127.0.0.1","--directory",base],{stdio:"ignore"});
const sleep=t=>new Promise(r=>setTimeout(r,t));
(async()=>{let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));
 let open=false;for(let i=0;i<40;i++)try{let r=await page.goto("http://127.0.0.1:18945/",{waitUntil:"domcontentloaded",timeout:15000});if(r?.ok()){open=true;break;}}catch(_){await sleep(200)}
 assert(open,"browser server did not start");
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
 assert(await page.evaluate(()=>pmsvB45Valid()),"Batch45/B44 upstream digest not valid");
 await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB45Refresh()});
 const panel=page.locator("#pmsv-b45-lab-preflight");
 assert.equal(await panel.locator("[data-pmsv-b45-rows] tr").count(),35);
 assert.match(await panel.innerText(),/not a statutory lab method adoption|NOT a statutory lab method adoption/i);
 await panel.locator("[data-pmsv-b45-family]").selectOption("METALS");
 assert.equal(await panel.locator("[data-pmsv-b45-rows] tr").count(),27);
 await panel.locator("[data-pmsv-b45-family]").selectOption("NONMETALS");
 assert.equal(await panel.locator("[data-pmsv-b45-rows] tr").count(),8);
 await panel.locator("[data-pmsv-b45-family]").selectOption("ALL");
 await panel.locator("[data-pmsv-b45-search]").fill("cocoa mass");
 assert.equal(await panel.locator("[data-pmsv-b45-rows] tr").count(),1);
 await panel.locator("[data-pmsv-b45-inspect]").click();
 const detail=await panel.locator("[data-pmsv-b45-detail]").innerText();
 assert.match(detail,/OPEN \/ NOT RECEIVED/);
 assert.match(detail,/matrix/i);
 const draft=await page.evaluate(()=>pmsvB45Request(pmsvB45Rows()[0]));
 assert(draft.includes("NOT A PASS"));assert(draft.includes("05_06_2025.pdf"));
 await panel.locator("[data-pmsv-b45-search]").fill("");
 assert.equal(await panel.locator("[data-pmsv-b45-rows] tr").count(),35);
 const dl=page.waitForEvent("download");await panel.locator('[data-pmsv-b45-export="ALL"]').click();
 const content=fs.readFileSync(await (await dl).path(),"utf8");
 assert.equal(content.trim().split(/\r?\n/).length,36);
 assert(content.includes("NOT_RECEIVED_NOT_REVIEWED"));
 assert(!content.includes("LOT_PASS_APPROVED"));
 assert.equal(errors.filter(s=>/pmsvB45/.test(s)).length,0,errors.join("\n"));
 console.log("B45 CHROMIUM VERIFIED: 35 lab preflights x8 nonbinding checks, 27 metals/8 other, CSV; 0 approvals, original 175 gates intact.");
}finally{if(browser)await browser.close();server.kill("SIGTERM");}})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
