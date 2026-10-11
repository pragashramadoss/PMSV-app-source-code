"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base=path.join(root,"fssai-product-helper-preview-01");
const read=p=>JSON.parse(fs.readFileSync(path.join(base,"data",p),"utf8"));
const ledger=read("rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const prior=read("rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const ayur=read("rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json");
const grain=read("rules/fssai-other-foodgrains-b1-first-source-2026-10-11.json");
const last=read("rules/fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json");
const chapter23=read("rules/chapter-2-3-fruit-vegetable-v1.json");
const chapter25=read("rules/chapter-2-5-meat-eggs-v1.json");
const source=read("rules/contaminants-v9-core.json");
const catalogue=read("standard-search-index-v1.json").products,index=new Map(catalogue.map(x=>[x.id,x]));
test("ledger covers all 533 identities exactly with 417 partial / 116 pending; no product compliance approval",()=>{
 assert.equal(ledger.catalogue,533);assert.equal(ledger.records.length,533);
 assert.equal(ledger.partial_exact,417);assert.equal(ledger.first_source_pending,116);
 assert.equal(ledger.full_compliance_approvals,0);
 assert.equal(ledger.group_reviewed_current_pending_count,116);
 assert.equal(ledger.positive_delta_count,5);
 assert.equal(ledger.previous_archived_pending,121);
 assert.equal(ledger.source_version,source.source_version);
 assert.equal(ledger.official_contaminants_source,source.official_sources[0].url);
 const known=new Set,counts={};
 for(const p of ledger.records){
  assert.ok(!known.has(p.catalog_id));known.add(p.catalog_id);
  const x=index.get(p.catalog_id);assert.ok(x);
  assert.equal(p.product_name,x.name);assert.equal(p.fssr,x.fssr);assert.equal(p.fcs,x.fcs);
  assert.equal(p.complete_contaminant_panel,false);assert.equal(p.product_compliance_approval,false);
  assert.equal(p.sample_lab_pass,false);assert.equal(p.regulatory_coverage,"PARTIAL_OR_PENDING");
  counts[p.source_status]=(counts[p.source_status]||0)+1;
 }
 assert.equal(known.size,533);
 assert.deepEqual(counts,{PARTIAL_EXACT_SOURCE_MATCH:417,FIRST_EXACT_SOURCE_PENDING:116});
});
test("current 116 equals the archived 121 minus independently source-proved 5; four group reviews are exact and mutually exclusive",()=>{
 const positives=new Set([...ayur.records.map(x=>x.catalog_id),grain.catalog_id,...last.positive_records.map(x=>x.catalog_id)]);
 const old=new Set(prior.records.map(x=>x.catalog_id));
 assert.equal(positives.size,5);assert.equal(old.size,121);
 const now=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(now.size,116);assert.deepEqual(now,new Set([...old].filter(x=>!positives.has(x))));
 const groups={
 "20 fungal, fruit, tomato subtype matrix":20,
 "14 sugar, egg, confection subtype matrix":14,
 "56 cross-form transfer exclusions":56,
 "26 remaining product-specific evidence blockers":26
 };
 for(const [name,count] of Object.entries(groups))
  assert.equal(ledger.records.filter(x=>x.review_group===name&&x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,count,name);
 for(const id of positives){
  const r=ledger.records.find(x=>x.catalog_id===id);assert.ok(r);
  assert.equal(r.source_status,"PARTIAL_EXACT_SOURCE_MATCH");
  assert.equal(r.evidence_origin,"2026-10-11 positive delta");
  assert.equal(r.regulatory_source_verified_delta.official,source.official_sources[0].url);
 }
 const legacy=ledger.records.filter(x=>x.evidence_origin==="historical independently audited 412");
 assert.equal(legacy.length,412);
 assert.equal(legacy.filter(x=>x.regulatory_source_verified_delta!==null).length,0);
});
test("current official FSSAI Chapter 2.3 2024 evidence reconciles BOTH colouring foods and water chestnut flour (quality not CTR)",()=>{
 const current="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf";
 assert.ok(chapter23.official_sources.some(x=>x.url===current&&x.title.includes("2024")));
 for(const clause of ["2.3.64","2.3.65"]){
  const s=chapter23.standards.find(x=>x.key===clause);
  assert.ok(s);assert.equal(s.source_url,current);
  assert.equal(s.numeric_evidence.source_url,current);
  assert.equal(s.numeric_evidence.source_version,"Version 2 (04.11.2024)");
  assert.equal(s.numeric_evidence.review_status,"current_2024_fssai_source_numeric_reconfirmed_current_amendments_not_reconciled_for_full_compliance");
  assert.equal(s.full_compliance_assessment_enabled,false);
 }
 const colour=chapter23.standards.find(x=>x.key==="2.3.65");
 assert.equal(colour.variant_composition.length,2);
 const liquid=colour.variant_composition.find(x=>x.variant==="Liquid colouring foods");
 const powder=colour.variant_composition.find(x=>x.variant==="Powder colouring foods");
 for(const [obj,solids,pigment] of [[liquid,45,0.5],[powder,90,1]]){
  assert.ok(obj);
  assert.ok(obj.composition.some(x=>x.parameter==="Total solids"&&x.value===solids&&x.operator===">="));
  assert.ok(obj.composition.some(x=>x.parameter==="Marker pigment"&&x.value===pigment&&x.operator===">="));
 }
 assert.ok(liquid.composition.some(x=>x.parameter==="Added nutritive sugars"&&x.value===20));
 assert.ok(!powder.composition.some(x=>x.parameter==="Added nutritive sugars"));
 const flour=chapter23.standards.find(x=>x.key==="2.3.64");
 assert.ok(flour.composition.some(x=>x.parameter==="Protein on dry basis"&&x.value===9));
 assert.ok(flour.conditional_requirements.some(x=>x.parameter==="Uric acid"&&x.auto_evaluate===false&&x.source_text==="100 mg/kg"));
});
test("Helper current status follows loaded source data and fails closed after identity/value tampering",async()=>{
 const files={
 "fssai-next121-positive-subtype-proof-2026-10-11.json":prior,
 "fssai-next29-no-source-proof-dossiers-2026-10-11.json":read("rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json"),
 "fssai-2026-10-11-cross-form-nontransfer-large-batch.json":read("rules/fssai-2026-10-11-cross-form-nontransfer-large-batch.json"),
 "fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json":last,
 "fssai-v9-21-vet-article-source-64-links-2026-10-11.json":read("rules/fssai-v9-21-vet-article-source-64-links-2026-10-11.json"),
 "fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json":ledger};
 const ctx={contaminantsDb:source,chapterRuleDbs:[chapter25],
 sourcePriorityMetalDb:{partial_exact_count:412,pending_first_exact_count:121,unresolved_first_exact_catalog_ids:prior.records.map(x=>x.catalog_id)},
 esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"),
 fetch:async url=>{const key=Object.keys(files).find(x=>url.includes(x));return key?{ok:true,json:async()=>files[key]}:{ok:false};}};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(base,"fssai-source-proof-panels.js"),"utf8"),ctx);
 await ctx.pmsvLoadPositiveSourceProof();
 assert.ok(ctx.pmsvCurrent533SourceLedger);
 for(const p of catalogue){
  assert.equal(ctx.pmsvCurrent533SourceProofValid(p),true,p.id);
  const html=ctx.pmsvCurrent533SourceStatusHtml(p);
  assert.match(html,/NOT A COMPLIANCE PASS/);
  if(prior.records.some(x=>x.catalog_id===p.id) && ![...ayur.records.map(x=>x.catalog_id),grain.catalog_id,...last.positive_records.map(x=>x.catalog_id)].includes(p.id))
    assert.match(html,/FIRST EXACT CONTAMINANT SOURCE STILL PENDING/);
 }
 const sample=catalogue[0],old=ctx.pmsvCurrent533SourceLedger;
 assert.equal(ctx.pmsvCurrent533SourceProofValid({...sample,name:"Altered food identity"}),false);
 ctx.contaminantsDb={...source,source_version:"Tampered Version"};
 assert.equal(ctx.pmsvCurrent533SourceProofValid(sample),false);
 assert.match(ctx.pmsvCurrent533SourceStatusHtml(sample),/withheld/);
 ctx.contaminantsDb=source;
 ctx.pmsvCurrent533SourceLedger={...old,first_source_pending:115};
 assert.equal(ctx.pmsvCurrent533SourceProofValid(sample),false);
});
