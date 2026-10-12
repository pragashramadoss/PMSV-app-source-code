"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const rules=base+"data/rules/";
const ledger=read(rules+"fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const work=read(rules+"fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const branch=read(rules+"fssai-2026-10-12-thirtytwo-cereal-fruit-spice-identity-source-branches.json");
const core=read(rules+"contaminants-v9-core.json");
const catalog=read(base+"data/standard-search-index-v1.json").products;
const byId=new Map(catalog.map(x=>[x.id,x]));
const script=fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8");
function setup(){
 const c={console,esc:s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,'&quot;')};
 vm.createContext(c);vm.runInContext(script,c);
 c.contaminantsDb=structuredClone(core);
 c.pmsvCurrent533SourceLedger=structuredClone(ledger);
 c.pmsvCurrent116ProofWorklist=structuredClone(work);
 c.pmsvCerealFruitSpiceSourceDb=structuredClone(branch);
 return c;
}
test("all 681 533+116+32 source-review records match the immutable build snapshot, without new PASS",()=>{
 const c=setup();
 assert.equal(ledger.records.length,533);
 assert.equal(work.records.length,116);
 assert.equal(branch.records.length,32);
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",c.pmsvCurrent533SourceLedger),true);
 assert.equal(c.pmsvReviewSnapshotIntact("work",c.pmsvCurrent116ProofWorklist),true);
 assert.equal(c.pmsvReviewSnapshotIntact("branches",c.pmsvCerealFruitSpiceSourceDb),true);
 assert.equal(c.pmsvCurrent116DocumentaryIntegrity(),true);
 assert.equal(c.pmsvCurrent32DocumentaryIntegrity(),true);
 const pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.deepEqual(new Set(work.records.map(x=>x.catalog_id)),pending);
 assert.equal(pending.size,116);
 assert.equal(ledger.full_compliance_approvals,0);
 for(const p of catalog)assert.equal(c.pmsvCurrent533SourceProofValid(p),true,p.id);
});
test("changed individual instructions, candidate article text, forbidden transfer and official link withhold the 116 worklist",()=>{
 for(const edit of [
  c=>c.pmsvCurrent116ProofWorklist.records[0].proof_branches[0].source_article_candidates.push("Lead 0.001: All processed foods"),
  c=>c.pmsvCurrent116ProofWorklist.records[2].proof_branches[0].required_evidence[0]="No laboratory analysis is needed",
  c=>c.pmsvCurrent116ProofWorklist.records[50].forbidden_transfer="All source commodities share the same limit",
  c=>c.pmsvCurrent116ProofWorklist.records[115].official_finished_product_source="https://fssai.gov.in/altered-url",
  c=>c.pmsvCurrent116ProofWorklist.records.reverse(),
 ]){
  const c=setup();edit(c);
  assert.equal(c.pmsvCurrent116DocumentaryIntegrity(),false);
  assert.match(c.pmsvCurrent116ProofChecklistHtml(byId.get(work.records[0].catalog_id)),/withheld/);
 }
});
test("all 32 branch narratives are immutable; a misleading positive-proof instruction fails closed",()=>{
 for(const edit of [
  c=>c.pmsvCerealFruitSpiceSourceDb.records[0].selectable_branches[0].positive_proof[0]="Any flour is automatically cereal",
  c=>c.pmsvCerealFruitSpiceSourceDb.records[31].explicit_exclusion="No exclusions apply",
  c=>c.pmsvCerealFruitSpiceSourceDb.records.reverse()
 ]){
  const c=setup();edit(c);
  assert.equal(c.pmsvCurrent32DocumentaryIntegrity(),false);
  assert.match(c.pmsvCerealFruitSpiceSourceHtml(byId.get(branch.records[0].catalog_id)),/withheld/);
 }
});
test("a swapped 533-ledger review group or pending status cannot counterfeit a new first-source match",()=>{
 for(const edit of [
  c=>c.pmsvCurrent533SourceLedger.records[0].review_group="Imaginary proof",
  c=>c.pmsvCurrent533SourceLedger.records[0].full_compliance_approvals=1,
  c=>{const r=c.pmsvCurrent533SourceLedger.records.find(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING");r.source_status="PARTIAL_EXACT_SOURCE_MATCH";r.missing_first_exact_evidence=false;r.evidence_origin="historical independently audited 412";}
 ]){
  const c=setup();edit(c);
  assert.equal(c.pmsvReviewSnapshotIntact("ledger",c.pmsvCurrent533SourceLedger),false);
  assert.equal(c.pmsvCurrent533SourceProofValid(byId.get(ledger.records[0].catalog_id)),false);
  assert.equal(c.pmsvCurrent116DocumentaryIntegrity(),false);
  assert.equal(c.pmsvCurrent32DocumentaryIntegrity(),false);
 }
});
test("the historic 121 research queue cannot show a stale first-source pending result for five now-partial products",()=>{
 const c=setup(),promoted=ledger.records.filter(x=>x.evidence_origin==="2026-10-11 positive delta");
 assert.equal(promoted.length,5);
 c.sourcePriorityMetalDb={unresolved_first_exact_catalog_ids:promoted.map(x=>x.catalog_id)};
 for(const p of promoted){
  const html=c.sourcePinned121ResearchProofHtml(byId.get(p.catalog_id));
  assert.match(html,/PARTIAL EXACT SOURCE EVIDENCE ONLY/);
  assert.doesNotMatch(html,/First exact-source evidence needed/);
  assert.doesNotMatch(html,/FIRST EXACT CONTAMINANT SOURCE STILL PENDING/);
 }
});
