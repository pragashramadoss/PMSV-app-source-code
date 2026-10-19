"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),
 {spawn}=require("node:child_process"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const b56=rd("fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json");
const b59=rd("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const d=rd("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json");
const script=fs.readFileSync(path.join(root,"fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const b59JS=fs.readFileSync(path.join(root,"fssai-current35-reference-row-nontransfer-batch59-2026-10-17.js"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const ch of JSON.stringify(v)){
 let z=ch.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);
}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(script.includes('const expected="'+digest(d)+'"'),"B60 source digest mismatch");
assert.equal(d.prior_batch59_document_digest,digest(b59),"B60 old B59 digest mismatch");
assert.match(b59JS,/getAllCases\s*:\s*\(\)\s*=>/,"B59 ancestry API missing");
assert(html.includes("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.js?v=20261017-b60"));
assert(html.indexOf("remaining20-legal-scope-review-batch60")>html.indexOf("reference-row-nontransfer-batch59"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|WebSocket)/.test(script));
assert.equal(d.primary_ctr_compendium.url,"https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf");
assert.equal(d.original_gazette_boundary.commencement,"2026-12-01");
assert.equal(d.original_gazette_boundary.effective_on_review_date,false);
const t=d.totals;
assert.equal(t.catalogue,533);assert.equal(t.conditional_source_matches,498);
assert.equal(t.open_ctr_cases,35);assert.equal(t.previous_batch59_nontransfer_comparators,15);
assert.equal(t.reviewed_remaining_prior_no_comparator,20);assert.equal(t.official_text_routing_research_completed,20);
assert.equal(t.covered_existing_immutable_gate_ids,100);assert.equal(t.p0_open_covered,1);
assert.equal(t.p1_open_covered,19);assert.equal(t.legacy_original_request_ids_all,175);
assert.equal(t.original_documents_received,0);assert.equal(t.original_authentic_case_gazettes,0);
assert.equal(t.case_specific_numeric_legal_approvals,0);assert.equal(t.case_specific_original_coa_received,0);
assert.equal(t.laboratory_method_matrix_scope_approved,0);assert.equal(t.lot_pass,0);
assert.equal(t.wordpress_changed,false);
const originals=new Map(b59.cases.map(c=>[c.catalogue_id,c])),b56byid=new Map(b56.cases.map(c=>[c.catalogue_id,c]));
const groupCounts={},covered=new Set(),allOriginalGates=new Set();let p0=0,p1=0;
for(const c of d.cases){
 const old=originals.get(c.catalogue_id),orig=b56byid.get(c.catalogue_id);
 assert(old&&orig,"Missing original case "+c.catalogue_id);
 assert.equal(old.reference,null,"B60 must NOT duplicate 15 B59 studied cases");
 assert.equal(c.original_legal_gate,old.original_legal_gate);
 assert.equal(c.product_name,old.product_name);
 assert.equal(c.priority,old.priority);assert.equal(c.analyte,old.analyte);
 assert.deepEqual(c.immutable_five_original_request_ids,old.original_request_ids);
 assert.deepEqual(c.immutable_five_original_request_ids,orig.gates.map(g=>g.request_id));
 assert(!covered.has(c.catalogue_id),"Duplicate "+c.catalogue_id);covered.add(c.catalogue_id);
 c.priority==="P0"?p0++:p1++;
 groupCounts[c.group]=(groupCounts[c.group]||0)+1;
 assert.equal(c.source_review_result,"LEGAL_SCOPE_ROUTING_RESEARCH_ONLY");
 assert(c.textually_supported_scope&&c.research_finding_not_compliance_decision);
 assert(c.next_exact_external_evidence_needed&&c.authoritative_research_urls.length>=1);
 assert(c.authoritative_research_urls.every(x=>x.startsWith("https://")&&x.includes("fssai.gov.in")));
 for(const id of c.immutable_five_original_request_ids){assert(!allOriginalGates.has(id));allOriginalGates.add(id);}
 for(const fld of ["exact_case_specific_operative_gazette_verified",
   "exact_marketed_product_or_substance_identity_authenticated","legally_applicable_numeric_maximum_signed",
   "original_method_and_nabl_scope_verified","original_lot_coa_received","case_released"])assert.equal(c[fld],false);
}
assert.equal(covered.size,20);assert.equal(allOriginalGates.size,100);
assert.equal(p0,1);assert.equal(p1,19);
assert.deepEqual(groupCounts,{
 ANTIBIOTIC_SCOPE_DIFFERENCE:1,PESTICIDE_EXACT_FOOD:4,LEAD_COMMODITY_IDENTITY:9,
 LEAD_CLASS_NEEDS_INDIVIDUAL:4,AFLATOXIN_NAMED_INGREDIENT:2
});
assert.equal(d.cases.find(c=>c.rank===31).group,"ANTIBIOTIC_SCOPE_DIFFERENCE");
assert([4,13,16,17].every(rank=>d.cases.find(c=>c.rank===rank).group==="PESTICIDE_EXACT_FOOD"));
assert([28,29].every(rank=>d.cases.find(c=>c.rank===rank).group==="AFLATOXIN_NAMED_INGREDIENT"));
assert(b59.cases.filter(c=>!!c.reference).every(c=>!covered.has(c.catalogue_id)));
const server=spawn("python3",["-m","http.server","18960","--directory",root,"--bind","127.0.0.1"],{stdio:"ignore"});
const nap=t=>new Promise(r=>setTimeout(r,t));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let started=false;for(let i=0;i<50;i++)try{
   const resp=await page.goto("http://127.0.0.1:18960/",{waitUntil:"domcontentloaded",timeout:15000});
   if(resp?.ok()){started=true;break;}
  }catch(_){await nap(200)}
  assert(started,"Local FSSAI preview server did not start");
  await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&
   ["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:90000});
  // Batch80: extended review is opt-in; verify source chain and zero regulatory approvals.
  assert.equal(await page.evaluate(()=>window.pmsvB22StartupState),"READY","Core integrity fail-closed");
  assert.equal(await page.evaluate(()=>window.pmsvB70ExtendedResearch.request()),true,"Extended documentary source integrity must validate");
  const b80Guard=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
  assert.equal(b80Guard.extended,"READY");
  assert.deepEqual([b80Guard.caseApprovals,b80Guard.labPasses,b80Guard.productReleases],[0,0,0]);
  // Batch81: Batch80 has already loaded and validated the full source chain once.
  await page.waitForFunction(()=>window.pmsvB60LegalScope?.valid(),null,{timeout:90000});
  const ancestors=await page.evaluate(()=>window.pmsvB59CTRSourceCrosswalk.getAllCases());
  assert.equal(ancestors.length,35);assert.equal(ancestors.filter(x=>x.reference).length,15);
  assert(ancestors.every(x=>x.original_request_ids.length===5&&!x.case_signed_legal_applicability));
  await page.evaluate(()=>{document.getElementById("standard")?.classList.remove("hidden");pmsvB14EnsureDashboard();});
  const panel=page.locator("#pmsv-b60-operative-text-review");
  await panel.evaluate(x=>x.open=true);
  assert.equal(await panel.locator("[data-pmsv-b60-rows] tr").count(),20);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB60LegalScope.getCounts()),{
   cases:20,pesticide:4,leadNamed:9,leadClass:4,aflatoxin:2,
   antibiotic:1,originalEvidence:0,caseApprovals:0,lotPasses:0});
  for(const [family,count] of Object.entries(groupCounts)){
   await panel.locator("[data-pmsv-b60-group]").selectOption(family);
   assert.equal(await panel.locator("[data-pmsv-b60-rows] tr").count(),count);
  }
  await panel.locator("[data-pmsv-b60-group]").selectOption("ALL");
  await panel.locator("[data-pmsv-b60-priority]").selectOption("P0");
  assert.equal(await panel.locator("[data-pmsv-b60-rows] tr").count(),1);
  await panel.locator("[data-pmsv-b60-priority]").selectOption("P1");
  assert.equal(await panel.locator("[data-pmsv-b60-rows] tr").count(),19);
  await panel.locator("[data-pmsv-b60-priority]").selectOption("ALL");
  const csv=await page.evaluate(()=>window.pmsvB60LegalScope.csv());
  const rows=csv.trim().split(/\r?\n/);
  assert.equal(rows.length,21);assert(rows[0].includes("numeric_limit_legally_approved"));
  assert(rows.slice(1).every(r=>r.endsWith(',"false","false","false","false","false"')));
  assert.match(await panel.innerText(),/not 20 validated products/);
  assert.equal(errors.length,0,"Page exceptions: "+errors.join("; "));
  console.log("Batch60 PASS: all 20 exact pending B59 cases; 100 immutable IDs; 5 legal source routes; no original evidence, limits, laboratory approval or lots released.");
 }catch(e){console.error(e);process.exitCode=1;}
 finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);server.kill();process.exitCode=1;});
