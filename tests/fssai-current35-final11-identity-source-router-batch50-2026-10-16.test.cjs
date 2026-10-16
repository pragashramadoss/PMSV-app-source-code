"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{spawn}=require("node:child_process"),{chromium}=require("playwright");
const base="fssai-product-helper-preview-01",rd=n=>JSON.parse(fs.readFileSync(path.join(base,"data/rules",n),"utf8"));
const d=rd("fssai-current35-final11-identity-source-router-batch50-2026-10-16.json"),
b49=rd("fssai-current35-additional10-fssr-identity-batch49-2026-10-16.json");
const script=fs.readFileSync(path.join(base,"fssai-current35-final11-identity-source-router-batch50-2026-10-16.js"),"utf8"),
html=fs.readFileSync(path.join(base,"index.html"),"utf8");
function dig(o){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(o)){let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
assert(script.includes('const pmsvB50Expected="'+dig(d)+'"'));
assert(html.includes("fssai-current35-final11-identity-source-router-batch50-2026-10-16.js?v=20261016-b50"));
assert.deepEqual([d.status_counts.total_catalogue,d.status_counts.conditional_first_source,d.status_counts.pending_exact_ctr_legal_article,d.status_counts.cumulative_named_official_identities,d.status_counts.new_named_product_or_recipe_positive,d.status_counts.still_no_named_identity_after_review,d.status_counts.actual_lot_lab_passes],[533,498,35,28,4,7,0]);
const o=new Map(b49.identity_screens.map(x=>[x.catalogue_id,x]));
let yes=0,no=0,closed=0;const seen=new Set();
for(const x of d.new_remnant_case_reviews){
 const p=o.get(x.catalogue_id);assert(p&&!p.verified_published_identity_sources_count);
 assert(!seen.has(x.catalogue_id));seen.add(x.catalogue_id);
 assert.equal(x.previous_legal_gate,p.unchanged_legal_article_gate);
 assert.equal(x.legal_source_limit_approved,false);assert.equal(x.sold_product_verified,false);assert.equal(x.lab_pass,false);
 if(x.authoritative_product_identity_known)yes++;else no++;
 if(x.source_resolution==="CLOSED_APPLICATION_NOT_GENERAL_AUTHORITY"){closed++;assert.equal(x.rank,24);assert.equal(x.pdf_page_zero_based,51)}
}
assert.deepEqual([seen.size,yes,no,closed,d.current_35_case_crosswalk.filter(x=>x.known_published_named_identity).length],[11,4,7,1,28]);
assert.match(d.new_remnant_case_reviews.find(x=>x.rank===23).inspected_source_statement,/0\.05%/);
assert.match(d.new_remnant_case_reviews.find(x=>x.rank===3).inspected_source_statement,/24 months/);
assert.match(d.new_remnant_case_reviews.find(x=>x.rank===33).inspected_source_statement,/cow milk/i);
assert.match(d.new_remnant_case_reviews.find(x=>x.rank===34).inspected_source_statement,/buffalo milk/i);
const port=18950,server=spawn("python3",["-m","http.server",String(port),"--directory",base,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{let browser;
try{browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on("pageerror",e=>errors.push(e.message));
 let loaded=false;for(let k=0;k<40;k++)try{const r=await page.goto("http://127.0.0.1:"+port+"/",{waitUntil:"domcontentloaded",timeout:12000});if(r?.ok()){loaded=true;break}}catch(_){await nap(220)}
 assert(loaded);
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
 assert(await page.evaluate(()=>pmsvB50Valid()),"Batch50 integrity/preview chain failed");
 await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();pmsvB50Refresh()});
 const p=page.locator("#pmsv-b50-source-dispositions");await p.evaluate(el=>el.open=true);
 assert.equal(await p.locator("[data-pmsv-b50-rows] tr").count(),11);
 await p.locator("[data-pmsv-b50-group]").selectOption("NAMED");
 assert.equal(await p.locator("[data-pmsv-b50-rows] tr").count(),4);
 await p.locator("[data-pmsv-b50-group]").selectOption("NOT_NAMED");
 assert.equal(await p.locator("[data-pmsv-b50-rows] tr").count(),7);
 await p.locator("[data-pmsv-b50-group]").selectOption("ALL");
 await p.locator("[data-pmsv-b50-search]").fill("Sajji Khar");
 assert.equal(await p.locator("[data-pmsv-b50-rows] tr").count(),1);
 await p.locator("[data-pmsv-b50-inspect]").click();
 assert.match(await p.locator("[data-pmsv-b50-detail]").innerText(),/closed\/withdrawn/i);
 const draft=await page.evaluate(()=>pmsvB50Draft(pmsvB50Rows()[0]));
 assert.match(draft,/UNSENT DRAFT/);assert.match(draft,/No actual lab PASS/);
 await p.locator("[data-pmsv-b50-search]").fill("");
 const promise=page.waitForEvent("download");await p.locator('[data-pmsv-b50-export="ALL"]').click();
 const dl=await promise,csv=fs.readFileSync(await dl.path(),"utf8");
 assert.equal(csv.trim().split(/\r?\n/).length,12);
 assert(csv.includes("Sajji Khar")&&csv.includes("Trehalose"));
 assert(!csv.includes("PASSED_REGULATORY"));
 assert.equal(errors.filter(x=>/pmsvB50/.test(x)).length,0,errors.join("\n"));
 console.log("B50 Chromium PASS: 4 newly named/7 authority-only, 28 total named, 35 CTR holds, safe CSV, negative Sajji application evidence; zero PASS");
}finally{if(browser)await browser.close();server.kill("SIGTERM");}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill("SIGTERM")});
