"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const ledger=read(base+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const work=read(base+"data/rules/fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const live=read(base+"data/rules/fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json");
const liveManifest=read(base+"data/rules/fssai-two-whole-egg-shell-free-residue-2026-10-12.json");
const liveQueue=read(base+"data/rules/fssai-current-89-first-exact-source-proof-worklist-2026-10-12.json");
const liveDossier=read(base+"data/rules/fssai-89-detailed-finished-identity-audit-2026-10-12.json");
const previous442=read(base+"data/rules/fssai-current-first-source-533-live-ledger-442-91-2026-10-12.json");
const previous91=read(base+"data/rules/fssai-current-91-first-exact-source-proof-worklist-2026-10-12.json");
const products=read(base+"data/standard-search-index-v1.json").products;
const lookup=new Map(products.map(x=>[x.id,x]));
function make(){
 const mem=new Map();
 const ctx={console,localStorage:{
  getItem:k=>mem.has(k)?mem.get(k):null,
  setItem:(k,v)=>mem.set(k,String(v)),
  removeItem:k=>mem.delete(k)
 },esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")};
 vm.createContext(ctx);
 for(const f of ["fssai-source-proof-panels.js","fssai-evidence-capture-116.js","fssai-first-source-current-444-89.js"]){
  vm.runInContext(fs.readFileSync(path.join(root,base+f),"utf8"),ctx,{filename:f});
 }
 ctx.pmsvCurrent533SourceLedger=ledger;
 ctx.pmsvCurrent116ProofWorklist=work;
 ctx.pmsv442Ledger=previous442;
 ctx.pmsv91Queue=previous91;
 ctx.pmsv442Valid=()=>true; // Earlier ledger has its own independent authenticated regression.
 ctx.pmsv444Manifest=structuredClone(liveManifest);
 ctx.pmsv444Ledger=structuredClone(live);
 ctx.pmsv89Queue=structuredClone(liveQueue);
 ctx.pmsv89Dossier=structuredClone(liveDossier);
 ctx.contaminantsDb={official_sources:[{url:work.regulatory_basis}],source_version:work.source_version};
 return {ctx,mem};
}
test("current 89 pending products retain protected local collection; all 444 partials are hidden",()=>{
 const {ctx}=make(),pending=new Set(live.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(ctx.pmsv444Valid(),true);
 assert.equal(products.length,533);assert.equal(pending.size,89);
 assert.equal(live.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,444);
 const archived=new Set(work.records.map(x=>x.catalog_id));
 assert.equal(archived.size,116);assert.equal([...archived].filter(id=>!pending.has(id)).length,27);
 const archivedIds=new Set(work.records.map(x=>x.catalog_id));
 assert.equal(products.filter(p=>!archivedIds.has(p.id)).length,417);
 // Verify all 533 ledger statuses by set equality, but render only the 116
 // archived entries: the other 417 never had a legacy evidence collector.
 assert.deepEqual(new Set([...pending].filter(id=>archivedIds.has(id))),pending);
 for(const p of products.filter(p=>archivedIds.has(p.id))){
  const html=ctx.pmsvCurrent116ProofChecklistHtml(p);
  if(pending.has(p.id)){
   assert.match(html,/Collect missing first-source evidence/);
   assert.match(html,/STILL PENDING/);
   assert.match(html,/Stored only in this browser/);
   assert.doesNotMatch(html,/COMPLIANCE APPROVED|CONFORMING LOT/);
  }else assert.equal(html,"","stale collector for "+p.id);
 }
});
test("current-pending evidence checklist remains opt-in, local and cannot award a legal or laboratory PASS",()=>{
 const {ctx,mem}=make(),r=work.records.find(x=>live.records.some(y=>y.catalog_id===x.catalog_id&&y.source_status==="FIRST_EXACT_SOURCE_PENDING")&&x.proof_branches.length>0);
 assert.ok(r);const id=r.catalog_id,p=lookup.get(id);
 assert.equal(ctx.pmsv116Mark(id,0,true),false);
 assert.equal(ctx.pmsv116SetBranch(id,0),true);
 assert.equal(ctx.pmsv116Mark(id,0,true),true);
 assert.equal(ctx.pmsv116Mark(id,888,true),false);
 assert.match(ctx.pmsvCurrent116ProofChecklistHtml(p),/checked/);
 assert.ok(mem.size===1);
 assert.equal(ctx.pmsv116Note(id,"<script>unsafe</script>"),true);
 const html=ctx.pmsvCurrent116ProofChecklistHtml(p);
 assert.match(html,/&lt;script&gt;unsafe&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>unsafe/);
 assert.equal(ctx.pmsv116Clear(id),true);
 assert.doesNotMatch(ctx.pmsvCurrent116ProofChecklistHtml(p),/checked /);
 assert.equal(live.records.find(x=>x.catalog_id===id).source_status,"FIRST_EXACT_SOURCE_PENDING");
 assert.equal(work.records.find(x=>x.catalog_id===id).full_regulatory_compliance_approval,false);
});
test("altered archived packet and current ledger invalidate collection, without a false PASS",()=>{
 const {ctx}=make(),r=work.records.find(x=>live.records.some(y=>y.catalog_id===x.catalog_id&&y.source_status==="FIRST_EXACT_SOURCE_PENDING")),p=lookup.get(r.catalog_id);
 assert.equal(ctx.pmsv116SetBranch(r.catalog_id,0),true);
 const changed=structuredClone(work);changed.records.find(x=>x.catalog_id===r.catalog_id).forbidden_transfer="tampered";
 ctx.pmsvCurrent116ProofWorklist=changed;
 assert.match(ctx.pmsv116LocalEvidenceHtml(p),/withheld/);
 assert.equal(ctx.pmsv116Mark(r.catalog_id,0,true),false);
 ctx.pmsvCurrent116ProofWorklist=work;
 assert.match(ctx.pmsvCurrent116ProofChecklistHtml(p),/STILL PENDING/);
 ctx.pmsv444Ledger.records.find(x=>x.catalog_id===r.catalog_id).product_compliance_approval=true;
 assert.equal(ctx.pmsv444Valid(),false);
 assert.match(ctx.pmsvCurrent116ProofChecklistHtml(p),/integrity unavailable/);
 assert.equal(ctx.pmsv116Mark(r.catalog_id,0,true),false);
});
test("promoted 27 old cases cannot receive archived collector markings",()=>{
 const {ctx}=make(),promoted=work.records.filter(x=>live.records.some(y=>y.catalog_id===x.catalog_id&&y.source_status==="PARTIAL_EXACT_SOURCE_MATCH"));
 assert.equal(promoted.length,27);
 for(const r of promoted){
  assert.equal(ctx.pmsv116SetBranch(r.catalog_id,0),false);
  assert.equal(ctx.pmsv116Note(r.catalog_id,"stale note"),false);
  assert.equal(ctx.pmsvCurrent116ProofChecklistHtml(lookup.get(r.catalog_id)),"");
 }
});
test("index loads archive then current wrapper; CI retains regression",()=>{
 const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 const a=html.indexOf("fssai-source-proof-panels.js"),b=html.indexOf("fssai-evidence-capture-116.js"),
  c=html.indexOf("fssai-first-source-current-444-89.js");
 assert.ok(a>=0&&b>a&&c>b);
 const yml=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(yml,/node --test tests\/fssai-evidence-capture-116-2026-10-12\.test\.cjs/);
});
