"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const data=read("fssai-current35-remaining12-p1-lead-batch68-2026-10-17.json");
const b59=read("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const b60=read("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json");
const b66=read("fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.json");
const b67=read("fssai-current35-six-matrix-evidence-batch67-2026-10-17.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-remaining12-p1-lead-batch68-2026-10-17.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const s of JSON.stringify(v)){const n=s.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert.equal(data.b59_digest,digest(b59));assert.equal(data.b60_digest,digest(b60));
assert.equal(data.b67_digest,digest(b67));assert(js.includes('pinned="'+digest(data)+'"'));
assert(html.indexOf("remaining12-p1-lead-batch68")>html.indexOf("six-matrix-evidence-batch67"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|WebSocket)/.test(js));
assert.deepEqual(data.cases.map(x=>x.rank),[5,11,12,14,15,18,19,22,23,24,32,35]);
assert(data.cases.every(x=>x.analyte==="Lead"&&x.priority==="P1"));
assert.equal(data.kind,"PMSV_BATCH68_REMAINING_12_P1_LEAD_IDENTITY_SOURCE_MATRIX_HELD");
assert.equal(data.surface,"GITHUB_PAGES_FSSAI_PREVIEW_ONLY");
assert.equal(data.totals.held_ctr_cases,35);assert.equal(data.totals.p0,13);assert.equal(data.totals.p1,22);
assert.equal(data.totals.catalogue,533);assert.equal(data.totals.conditional_first_source_matches,498);
assert.equal(data.totals.research_routed_all_p1,22);assert.equal(data.totals.regulatory_approved_p1,0);
assert.equal(data.totals.original_immutable_requests_for_batch,60);
assert.equal(data.totals.original_immutable_requests_all35,175);
assert.equal(data.totals.wordpress_changed,false);assert.equal(data.totals.main_changed,false);
for(const [key,val] of Object.entries(data.control_flags))
 if(key.startsWith("do_not_"))assert.equal(val,true);
assert.equal(data.control_flags.all_35_held,true);assert.equal(data.control_flags.all_22_p1_still_open,true);
assert.equal(data.control_flags.outreach_sent,0);
const parents=new Map(b59.cases.map(x=>[x.rank,x])),uniqueIds=new Set();
for(const c of data.cases){
 const p=parents.get(c.rank);assert(p);
 for(const k of ["priority","catalogue_id","product_name","analyte","original_legal_gate"])assert.equal(c[k],p[k]);
 assert.deepEqual(c.original_request_ids,p.original_request_ids);
 assert.equal(c.original_request_ids.length,5);assert.equal(c.next_original_evidence.length,4);
 assert(c.source_research_only_finding);assert(c.specific_nontransfer_rule);
 assert(c.source_ids.every(x=>data.source_register.some(s=>s.id===x)));
 for(const id of c.original_request_ids){assert(!uniqueIds.has(id));uniqueIds.add(id);}
 for(const k of ["authenticated_as_sold_material","operative_exact_article_legal_signoff",
 "case_specific_numeric_lead_limit_approved","nabl_lead_method_matrix_scope_verified",
 "original_lot_coa_received","lot_pass","case_released"])assert.equal(c[k],false);
}
assert.equal(uniqueIds.size,60);
assert.equal(data.cases.filter(c=>c.reference_only_comparator).length,2);
for(const rank of [18,22])assert.equal(data.cases.find(c=>c.rank===rank).reference_only_comparator.source_article,
 b59.cases.find(c=>c.rank===rank).reference.source_article);
const p1=b59.cases.filter(x=>x.priority==="P1").map(x=>x.rank).sort((a,b)=>a-b);
const covered=[...new Set([...b66.cases.filter(x=>x.priority==="P1").map(x=>x.rank),
 ...b67.cases.filter(x=>x.priority==="P1").map(x=>x.rank),...data.cases.map(x=>x.rank)])].sort((a,b)=>a-b);
assert.deepEqual(covered,p1,"All 22 P1 cases must be researched with no omissions and no duplicates");
(async()=>{
 let browser;
 try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true}),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.setContent('<!doctype html><body><div id="pmsv-b67-six-matrix-review"></div></body>');
 await page.evaluate(({registry,baseline})=>{
 window.pmsvB14Digest=v=>{let a=0x811c9dc5,b=0x9747b28c;for(const s of JSON.stringify(v)){const n=s.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");};
 window.pmsvB59CTRSourceCrosswalk={valid:()=>true,getAllCases:()=>baseline};
 window.pmsvB60LegalScope={valid:()=>true};
 window.pmsvB67SixMatrixEvidence={valid:()=>true};
 window.pmsvLoadPositiveSourceProof=async()=>{};
 window.fetch=async()=>({ok:true,json:async()=>registry});
 },{registry:data,baseline:b59.cases});
 await page.addScriptTag({content:js});
 await page.evaluate(()=>window.pmsvLoadPositiveSourceProof());
 const el=page.locator("#pmsv-b68-lead-source-review");
 assert.equal(await el.count(),1);await el.evaluate(x=>x.open=true);
 assert.equal(await page.evaluate(()=>window.pmsvB68RemainingLeadP1.valid()),true);
 assert.deepEqual(await page.evaluate(()=>window.pmsvB68RemainingLeadP1.getCounts()),
 {cases:12,leadP1:12,sourceRoutedP1:22,originalRequestIds:60,approvedP1:0,
 approvedLimits:0,lotPasses:0,all35Held:true});
 assert.equal(await el.locator("[data-pmsv-b68-rows] tr").count(),12);
 const groups={BOTANICAL_EXTRACT_SEEDS:2,POWDER_FLOUR_MATRICES:2,
 ANIMAL_MILK_DERIVATIVES:2,CONDITIONAL_SUGAR_SALT_CHEMICAL:4,EDIBLE_METAL_FIBRE:2};
 for(const [group,count] of Object.entries(groups)){
 await el.locator("[data-pmsv-b68-family]").selectOption(group);
 assert.equal(await el.locator("[data-pmsv-b68-rows] tr").count(),count);}
 await el.locator("[data-pmsv-b68-family]").selectOption("ALL");
 await el.locator("[data-pmsv-b68-search]").fill("sajji");
 assert.equal(await el.locator("[data-pmsv-b68-rows] tr").count(),1);
 await el.locator("[data-pmsv-b68-search]").fill("");
 const csv=await page.evaluate(()=>window.pmsvB68RemainingLeadP1.csv());
 assert.equal(csv.trim().split(/\r?\n/).length,13);
 assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false","false","false","false","false"')));
 const sourceLinks=await el.locator("[data-pmsv-b68-rows] a").evaluateAll(xs=>xs.map(x=>x.href));
 assert(sourceLinks.length>=24&&sourceLinks.every(x=>x.startsWith("https://")));
 const pending=page.waitForEvent("download");
 await el.locator("[data-pmsv-b68-export]").click();
 const dl=await pending;assert.match(dl.suggestedFilename(),/B68.*HELD\.csv/);
 await page.evaluate(()=>window.pmsvB59CTRSourceCrosswalk.getAllCases().find(c=>c.rank===5).catalogue_id="forged");
 assert.equal(await page.evaluate(()=>window.pmsvB68RemainingLeadP1.valid()),false);
 assert.equal(await page.evaluate(()=>window.pmsvB68RemainingLeadP1.csv()),"");
 assert.deepEqual(errors,[]);
 console.log("Batch68 PASS: all remaining 12 P1 Lead research cases, all 22 P1 source reviewed, 60 intact original IDs, no legal/lab/lot approvals.");
 }finally{if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
