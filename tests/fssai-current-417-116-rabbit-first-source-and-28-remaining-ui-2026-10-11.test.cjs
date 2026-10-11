"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),cp=require("node:child_process");
const root=path.resolve(__dirname,".."),base=path.join(root,"fssai-product-helper-preview-01");
const read=p=>JSON.parse(fs.readFileSync(path.join(base,"data",p),"utf8"));
const latest=read("rules/fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json");
const original=read("rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const core=read("rules/contaminants-v9-core.json");
const catalog=read("standard-search-index-v1.json").products;
const chapter=read("rules/chapter-2-5-meat-eggs-v1.json");
const idx=new Map(catalog.map(p=>[p.id,p]));
test("current 417/116 reconciles to original 121 and source-proven rabbit pairs",()=>{
 const o=cp.execFileSync(process.execPath,["scripts/audit-fssai-current-417-116-and-rabbit-veterinary-first-source-2026-10-11.cjs"],{cwd:root,encoding:"utf8"});
 assert.match(o,/417 partial exact first-source; 116 still pending/);
 const d=JSON.parse(fs.readFileSync(path.join(root,"audit-output/fssai-current-first-source-533-reconciliation-v2.json"),"utf8"));
 assert.equal(d.total,533);assert.equal(d.partial_first_source_matches,417);
 assert.equal(d.still_without_first_source,116);assert.equal(d.compliance_approvals,0);
 assert.equal(d.recent_research_coverage,118);
 assert.equal(new Set(d.unresolved.map(x=>x.catalog_id)).size,116);
 assert.equal(new Set(d.exact_first_source_matched_product_ids).size,5);
 const positive=new Set(latest.positive_records.map(x=>x.catalog_id));
 assert.equal(positive.size,2);
 assert.ok([...positive].every(id=>!d.unresolved.some(x=>x.catalog_id===id)));
 assert.equal(latest.pending_records.length,26);
 assert.equal(original.records.length,121);
});
test("live FSSAI proof panel shows independently verified Xylazine without lab PASS",async()=>{
 const source=fs.readFileSync(path.join(base,"fssai-source-proof-panels.js"),"utf8");
 const fromFiles={
  "fssai-next121-positive-subtype-proof-2026-10-11.json":original,
  "fssai-next29-no-source-proof-dossiers-2026-10-11.json":read("rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json"),
  "fssai-2026-10-11-cross-form-nontransfer-large-batch.json":read("rules/fssai-2026-10-11-cross-form-nontransfer-large-batch.json"),
  "fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json":latest
 };
 const ids=original.records.map(x=>x.catalog_id);
 const c={contaminantsDb:core,chapterRuleDbs:[chapter],sourcePriorityMetalDb:{
   partial_exact_count:412,pending_first_exact_count:121,unresolved_first_exact_catalog_ids:ids},
  esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"),
  fetch:async url=>{const key=Object.keys(fromFiles).find(k=>url.includes(k));return key?{ok:true,json:async()=>fromFiles[key]}:{ok:false};}};
 vm.createContext(c);vm.runInContext(source,c);
 await c.pmsvLoadPositiveSourceProof();
 assert.ok(c.pmsvFinalTwentyEightDb);
 for(const p of latest.positive_records){
  const product=idx.get(p.catalog_id);
  assert.equal(c.pmsvFinalTwentyEightSourceValid(product),true);
  const html=c.sourcePinned121ResearchProofHtml(product);
  assert.match(html,/Positive FSSAI first-source match/);
  assert.match(html,/Xylazine/);
  assert.match(html,/0.01/);
  assert.match(html,/NOT A COMPLIANCE PASS/);
  assert.doesNotMatch(html,/First exact-source evidence needed/);
  assert.doesNotMatch(html,/LAB PASS|APPROVED COMPLIANT/i);
 }
 for(const x of latest.pending_records){
  const p=idx.get(x.catalog_id);
  assert.equal(c.pmsvFinalTwentyEightSourceValid(p),true,x.catalog_id);
  const html=c.pmsvFinalTwentyEightEvidenceHtml(p);
  assert.match(html,/NO EXACT CONTAMINANT ARTICLE ASSIGNED/);
  assert.match(html,/Positive proof needed/);
 }
 const rabbit=idx.get(latest.positive_records[0].catalog_id);
 c.contaminantsDb={...core,source_version:"tampered"};
 assert.equal(c.pmsvFinalTwentyEightSourceValid(rabbit),false);
 assert.match(c.sourcePinned121ResearchProofHtml(rabbit),/withheld/);
 c.contaminantsDb={...core,antibiotic_and_pharmacological_substances:{
  ...core.antibiotic_and_pharmacological_substances,
  veterinary_tolerance_limits:{...core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits,
   rows:core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows.map(r=>
    r.serial===48?{...r,rows:[{article:"Different tissue",limit:"0.01",unit:"mg/kg"}]}:r)}}};
 assert.equal(c.pmsvFinalTwentyEightSourceValid(rabbit),false);
});
