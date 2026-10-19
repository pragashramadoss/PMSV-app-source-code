"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),
 {chromium}=require("playwright"),{spawn}=require("node:child_process");
const root="fssai-product-helper-preview-01",rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=rd("fssai-current35-identity-supersession-batch62-2026-10-17.json");
const b61=rd("fssai-current35-original-gazette-subjects-batch61-2026-10-17.json");
const b59=rd("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const b60=rd("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-identity-supersession-batch62-2026-10-17.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(v)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(js.includes('const pin="'+digest(d)+'"'));
assert.equal(d.parent_b61_digest,digest(b61));
assert.equal(d.parent_b59_digest,digest(b59));
assert.equal(d.parent_b60_digest,digest(b60));
assert(index.indexOf("identity-supersession-batch62")>index.indexOf("original-gazette-subjects-batch61"));
assert(!/(localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest|WebSocket)/.test(js));
const old=new Map(b61.cases.map(c=>[c.rank,c]));
assert.equal(d.kind,"PMSV_BATCH62_SUPERSESSION_AND_REAL_FOOD_IDENTITY_PROVENANCE");
const t=d.totals;
assert.equal(t.catalogue,533);assert.equal(t.conditionally_matched,498);assert.equal(t.held_ctr_cases,35);
assert.equal(t.source_specific_identity_review_cases,6);
assert.equal(t.one_material_supersession_prevents_stale_standard,1);
assert.equal(t.material_possible_milk_derived_ingredient_cautions,1);
assert.equal(t.original_unchanged_request_ids_all,175);assert.equal(t.six_case_original_request_ids,30);
assert.equal(t.approved_ctr_numeric_case_limits,0);
assert.equal(t.manufacturer_actual_boms_received,0);assert.equal(t.lab_scope_approvals,0);
assert.equal(t.lot_releases,0);assert.equal(t.wordpress_changed,false);
assert.equal(d.original_supersession.commencement,"2025-05-01");
assert.equal(d.original_supersession.affected_case_rank,17);
assert(d.original_supersession.source.includes("2024/10/"));
assert.equal(d.fail_closed.all_35_ctr_cases_remain_held,true);
assert.equal(d.fail_closed.unverified_allergen_free_claim_must_not_be_made,true);
let codes=new Set(),ranks=new Set();
for(const c of d.cases){
 const p=old.get(c.rank);assert(p,"Unknown Case: "+c.rank);
 assert(!ranks.has(c.rank));ranks.add(c.rank);
 assert.equal(c.product,p.product_name);assert.equal(c.original_gate,p.original_legal_gate);
 assert.equal(c.priority,p.priority);assert.deepEqual(c.immutable_five_request_ids,p.original_request_ids);
 assert(c.source.startsWith("https://")&&c.current_section.length>6&&c.missing.length>30);
 assert.equal(c.source_read_is_product_identity_only,true);
 for(const key of ["signed_ctr_limit_received","manufacturer_bom_received","accredited_lab_scope_verified","lot_pass"])assert.equal(c[key],false);
 for(const id of c.immutable_five_request_ids){assert(!codes.has(id));codes.add(id);}
}
assert.deepEqual([...ranks].sort((a,b)=>a-b),[7,11,14,15,16,17]);
assert.equal(codes.size,30);
assert.match(d.cases.find(c=>c.rank===17).current_substance,/2024|2025/);
assert.match(d.cases.find(c=>c.rank===17).unsafe_prior_inference,/2020/);
assert.match(d.cases.find(c=>c.rank===7).current_substance,/sodium caseinate/);
assert.match(d.cases.find(c=>c.rank===11).current_substance,/Salvia hispanica/);
assert.match(d.cases.find(c=>c.rank===14).current_substance,/Trapa bispinosa/);
assert.match(d.cases.find(c=>c.rank===15).current_substance,/intestines/);
const server=spawn("python3",["-m","http.server","18962","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(r=>setTimeout(r,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),err=[];
  page.on("pageerror",e=>err.push(e.message));
  let ready=false;
  for(let i=0;i<45;i++){try{let resp=await page.goto("http://127.0.0.1:18962/",{waitUntil:"domcontentloaded",timeout:16000});if(resp?.ok()){ready=true;break;}}catch(_){await nap(200)}}
  assert(ready,"Local preview didn't respond");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended review is opt-in; verify source chain and zero regulatory approvals.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Core integrity fail-closed");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Extended documentary source integrity must validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  await page.waitForFunction(()=>window.pmsvB62IdentitySupersession?.valid(),null,{timeout:90000});
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();});
  const p=page.locator("#pmsv-b62-supersession-review");await p.evaluate(el=>el.open=true);
  assert.equal(await p.locator("[data-pmsv-b62-rows] tr").count(),6);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB62IdentitySupersession.getCounts()),
   {cases:6,supersessions:1,potentialMilkProteinCautions:1,originalCTRApproved:0,lotReleased:0,all35Held:true});
  await p.locator("[data-pmsv-b62-family]").selectOption("DIRECT_ORIGINAL_2024_SUPERSESSION");
  assert.equal(await p.locator("[data-pmsv-b62-rows] tr").count(),1);
  await p.locator("[data-pmsv-b62-family]").selectOption("CURRENT_PRODUCT_STANDARD_BOTANICAL_ANCHOR");
  assert.equal(await p.locator("[data-pmsv-b62-rows] tr").count(),2);
  await p.locator("[data-pmsv-b62-family]").selectOption("ALL");
  assert.equal(await p.locator("[data-pmsv-b62-rows] tr").count(),6);
  const csv=await page.evaluate(()=>window.pmsvB62IdentitySupersession.csv());
  assert.equal(csv.trim().split(/\r?\n/).length,7);
  assert(csv.trim().split(/\r?\n/).slice(1).every(row=>row.endsWith(',"false","false","false","false"')));
  assert.equal(err.length,0,"Browser errors "+err.join("; "));
  console.log("Batch62 PASS: original pickled-egg supersession, optional sodium caseinate, exact 6-case identity, 30 original gates and no CTR limit/PASS.");
 }catch(e){console.error(e);process.exitCode=1;}finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});