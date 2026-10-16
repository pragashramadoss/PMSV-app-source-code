"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01",rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=rd("fssai-current35-175-open-evidence-gates-batch52-2026-10-16.json");
const b51=rd("fssai-current35-seven-material-identity-intake-batch51-2026-10-16.json");
const b44=rd("fssai-current35-five-gate-readiness-batch44-2026-10-16.json");
const script=fs.readFileSync(path.join(root,"fssai-current35-175-open-evidence-gates-batch52-2026-10-16.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(script.includes('const pmsvB52Expected="'+digest(d)+'"'));
assert(html.includes('fssai-current35-175-open-evidence-gates-batch52-2026-10-16.js?v=20261016-b52'));
assert.equal(d.cases.length,35);assert.equal(d.counts.current_ctr_article_cases_pending,35);
assert.equal(d.cases.flatMap(c=>c.gates).length,175);
assert.equal(d.cases.filter(c=>c.priority.startsWith("P0")).length,13);
assert.equal(d.cases.filter(c=>c.seven_material_intake).length,7);
assert.equal(d.cases.filter(c=>c.product_standard_identity_source_known).length,28);
assert.equal(d.counts.requests_sent,0);assert.equal(d.counts.signed_ctr_article_approvals,0);
assert.equal(d.counts.lot_passes,0);assert.equal(d.counts.wordpress_changed,false);
assert.equal(d.latest_non_specified_register_date,"2026-09-01");
assert.equal(d.prior_checked_sajji_register_date,"2026-06-03");
const prior=new Map(b44.case_gate_dossiers.map(c=>[c.catalogue_id,c]));
const previous=new Map(b51.full_35_ctr_worklist.map(c=>[c.catalogue_id,c]));
for(const x of d.cases){
 const a=prior.get(x.catalogue_id),b=previous.get(x.catalogue_id);
 assert(a&&b);assert.equal(x.rank,a.rank);assert.equal(x.upstream_legal_gate,b.legal_gate);
 assert.deepEqual(x.gates.map(g=>g.request_id),a.new_five_gate_ids);
 assert.equal(x.lot_pass,false);assert.equal(x.current_ctr_legal_article_signed,false);
 assert(x.gates.every(g=>g.document_received===false&&g.signed_review_completed===false));
}
assert(!/localStorage|sessionStorage|XMLHttpRequest/.test(script));
assert(!/fetch\s*\(\s*["']https:/.test(script));
const port=18952,server=spawn("python3",["-m","http.server",String(port),"--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(resolve=>setTimeout(resolve,t));
(async()=>{let browser;
try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true}),errors=[];
 page.on("pageerror",err=>errors.push(err.message));
 let ok=false;for(let i=0;i<50;i++)try{const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:15000});if(r?.ok()){ok=true;break}}catch(_){await nap(200)}
 assert(ok);
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
 assert(await page.evaluate(()=>pmsvB52Valid()),"Batch52 integrity/lineage failure");
 await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB52Refresh(true)});
 const p=page.locator("#pmsv-b52-legal-gate-queue");await p.evaluate(el=>el.open=true);
 assert.equal(await p.locator("[data-pmsv-b52-rows] tr").count(),35);
 assert.match(await p.innerText(),/175 specific evidence gates/i);
 await p.locator("[data-pmsv-b52-filter]").selectOption("P0");
 assert.equal(await p.locator("[data-pmsv-b52-rows] tr").count(),13);
 await p.locator("[data-pmsv-b52-filter]").selectOption("SEVEN");
 assert.equal(await p.locator("[data-pmsv-b52-rows] tr").count(),7);
 await p.locator("[data-pmsv-b52-filter]").selectOption("PUBLISHED");
 assert.equal(await p.locator("[data-pmsv-b52-rows] tr").count(),28);
 await p.locator("[data-pmsv-b52-filter]").selectOption("SAJJI");
 assert.equal(await p.locator("[data-pmsv-b52-rows] tr").count(),1);
 await p.locator("[data-pmsv-b52-select]").click();
 assert.equal(await p.locator("[data-pmsv-b52-detail] tbody tr").count(),5);
 assert.match(await p.locator("[data-pmsv-b52-detail]").innerText(),/specific Sajji Khar rows have NOT been rechecked/i);
 assert.equal((await page.evaluate(()=>pmsvB52Request(pmsvB52Data.cases.find(x=>x.rank===24)))).match(/NOT RECEIVED/g).length,5);
 const dlP=page.waitForEvent("download");await p.locator("[data-pmsv-b52-export]").click();
 const dl=await dlP,csv=fs.readFileSync(await dl.path(),"utf8");
 assert.equal(csv.trim().split(/\r?\n/).length,176);
 assert(csv.includes("UNSENT")===false);
 assert(csv.includes("Sajji Khar"));
 assert.equal(errors.filter(e=>/pmsvB52/.test(e)).length,0,errors.join("\n"));
 console.log("B52 PASS: 35 legal cases, 175 UNSENT gate requests; 13 urgent; 7 identity gaps; 28 published-source refs; Sajji source freshness guarded; privacy-safe CSV; zero PASS");
}finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
