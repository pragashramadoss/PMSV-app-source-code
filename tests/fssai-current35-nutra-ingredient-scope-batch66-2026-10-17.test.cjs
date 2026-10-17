"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),{chromium}=require("playwright");
const root="fssai-product-helper-preview-01";
const rd=f=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",f),"utf8"));
const d=rd("fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.json");
const old59=rd("fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json");
const old60=rd("fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json");
const old65=rd("fssai-current35-food-matrix-classification-batch65-2026-10-17.json");
const js=fs.readFileSync(path.join(root,"fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
function digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const s of JSON.stringify(v)){const n=s.charCodeAt(0);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
assert(js.includes('const pinned="'+digest(d)+'"'),"B66 checksum mismatch");
assert.equal(d.ancestor_b59_digest,digest(old59));
assert.equal(d.ancestor_b60_digest,digest(old60));
assert.equal(d.ancestor_b65_digest,digest(old65));
assert(html.indexOf("nutra-ingredient-scope-batch66")>html.indexOf("food-matrix-classification-batch65"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|WebSocket)/.test(js));
assert.equal(d.kind,"PMSV_BATCH66_FIVE_NUTRA_ADDITIVE_ENZYME_AFLATOXIN_SUBSTANCE_GATE");
const t=d.totals,flags=d.control_flags;
assert.equal(t.catalogue,533);assert.equal(t.conditional_first_source_matched,498);
assert.equal(t.original_held_cases,35);assert.equal(t.p0,13);assert.equal(t.p1,22);
assert.equal(t.batch66_P1_cases,5);assert.equal(t.batch66_lead_cases,3);
assert.equal(t.batch66_aflatoxin_cases,2);assert.equal(t.other_held_cases_untouched,30);
assert.equal(t.total_immutable_175_requests,175);assert.equal(t.immovable_case_requests_in_scope,25);
assert.equal(t.operational_2022_interim_direction_examined,1);
for(const name of ["signed_named_ingredient_identities","signed_original_case_gazettes","final_nutra_2022_draft_gazette_proven",
 "case_specific_numeric_ctr_limits_approved","case_accredited_lab_analyte_scope_approvals",
 "original_lot_coas_received","lot_passes"])assert.equal(t[name],0);
assert.equal(t.wordpress_changed,false);
assert.equal(flags.all_35_open,true);
for(const k of ["allow_cross_class_inheritance","allow_use_of_2022_draft_as_final_gazette",
 "allow_2016_2022_schedule_auto_map","allow_total_and_B1_merge",
 "allow_containing_food_numbers_as_approved_limits","allow_lab_pass","allow_product_release"])assert.equal(flags[k],false);
assert.equal(flags.owner_requests_sent,0);
const draft=d.source_register.find(x=>x.id==="FSSAI_NUTRA_DRAFT_2022");
const op=d.source_register.find(x=>x.id==="FSSAI_NUTRA_OPERATIONAL_DIRECTION_2022");
assert.equal(draft.type,"OFFICIAL_2022_DRAFT_GAZETTE_NOT_FINAL_NOTIFICATION");
assert.equal(op.type,"OFFICIAL_FSSAI_SIGNED_OPERATIONAL_DIRECTION");
assert.equal(d.regulatory_comparison_data_not_case_limits.automatically_applied,false);
assert.equal(d.regulatory_comparison_data_not_case_limits.named_crop_containing_product_compendium_ug_per_kg,20);
assert.equal(d.regulatory_comparison_data_not_case_limits.named_crop_containing_product_B1_compendium_ug_per_kg,10);
const map=new Map(old59.cases.map(c=>[c.rank,c])),prev60=new Map(old60.cases.map(c=>[c.rank,c]));
const found=new Set(),ids=new Set();let lead=0,aflatoxin=0;
for(const c of d.cases){
 const old=map.get(c.rank),p=prev60.get(c.rank);
 assert(old&&p);assert(!found.has(c.rank));found.add(c.rank);
 assert.equal(c.priority,"P1");assert.equal(c.catalogue_id,old.catalogue_id);
 assert.equal(c.product_name,old.product_name);assert.equal(c.analyte,old.analyte);
 assert.equal(c.original_ctr_gate_id,old.original_legal_gate);
 assert.deepEqual(c.original_five_gate_ids,old.original_request_ids);
 assert.equal(c.original_five_gate_ids.length,5);
 assert(c.source_ids.length>=2);assert(c.source_ids.every(id=>d.source_register.some(s=>s.id===id)));
 assert(c.official_text_findings_not_case_approval&&c.forbidden_automatic_transfer&&c.next_original_documents);
 for(const key of ["actual_named_chemical_or_ingredient_proven",
 "original_current_gazette_commodity_application_authenticated",
 "legal_case_numeric_contaminant_limit_approved","nabl_method_analyte_matrix_scope_verified",
 "actual_lot_coa_received","lot_pass","case_released"])assert.equal(c[key],false);
 for(const id of c.original_five_gate_ids){assert(!ids.has(id));ids.add(id);}
 if(c.analyte==="Lead")lead++;else if(c.analyte==="Aflatoxins")aflatoxin++;else throw Error("Wrong analyte");
}
assert.deepEqual([...found].sort((a,b)=>a-b),[25,26,27,28,29]);
assert.equal(lead,3);assert.equal(aflatoxin,2);assert.equal(ids.size,25);
assert(d.cases.find(x=>x.rank===26).forbidden_automatic_transfer.includes("final-Gazette"));
assert(d.cases.find(x=>x.rank===29).forbidden_automatic_transfer.includes("premix"));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({acceptDownloads:true}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.setContent('<!doctype html><html><body><div id="pmsv-b65-four-matrix-classifications"></div></body></html>');
  await page.evaluate(({data,originals})=>{
   window.pmsvB14Digest=v=>{let a=0x811c9dc5,b=0x9747b28c;for(const c of JSON.stringify(v)){const z=c.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");};
   window.pmsvB59CTRSourceCrosswalk={valid:()=>true,getAllCases:()=>originals};
   window.pmsvB60LegalScope={valid:()=>true};
   window.pmsvB65FourFoodMatrices={valid:()=>true};
   window.pmsvLoadPositiveSourceProof=async()=>{};
   window.fetch=async()=>({ok:true,json:async()=>data});
  },{data:d,originals:old59.cases});
  await page.addScriptTag({content:js});
  await page.evaluate(()=>window.pmsvLoadPositiveSourceProof());
  const el=page.locator("#pmsv-b66-nutra-source-audit");await el.evaluate(x=>x.open=true);
  assert.equal(await page.evaluate(()=>window.pmsvB66NutraIngredientAudit.valid()),true);
  assert.equal(await el.locator("[data-pmsv-b66-rows] tr").count(),5);
  assert.deepEqual(await page.evaluate(()=>window.pmsvB66NutraIngredientAudit.getCounts()),{
    cases:5,lead:3,aflatoxin:2,originalRequestIds:25,numberOfCaseApprovals:0,lotPasses:0,all35Held:true});
  for(const group of ["LEAD_INDIVIDUAL_CHEMICAL","LEGACY_SCHEDULE_IDENTITY","ENZYME_USE_AND_CARRIER",
    "AFLATOXIN_RAW_INGREDIENT","AFLATOXIN_PREMIX"]){
   await el.locator("[data-pmsv-b66-family]").selectOption(group);
   assert.equal(await el.locator("[data-pmsv-b66-rows] tr").count(),1);
  }
  await el.locator("[data-pmsv-b66-family]").selectOption("ALL");
  await el.locator("[data-pmsv-b66-search]").fill("premix");
  assert.equal(await el.locator("[data-pmsv-b66-rows] tr").count(),1);
  await el.locator("[data-pmsv-b66-search]").fill("");
  const csv=await page.evaluate(()=>window.pmsvB66NutraIngredientAudit.csv());
  assert.equal(csv.trim().split(/\r?\n/).length,6);
  assert(csv.trim().split(/\r?\n/).slice(1).every(x=>x.endsWith(',"false","false","false","false","false"')));
  assert.equal(errors.length,0,"Isolated browser errors: "+errors.join(" | "));
  console.log("Batch66 PASS (isolated Chromium): five P1 cases/25 original IDs, source lineage, true 2022 direction vs draft, separate total/B1 and zero case approvals.");
 }catch(err){console.error(err);process.exitCode=1;}
 finally{if(browser)await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});