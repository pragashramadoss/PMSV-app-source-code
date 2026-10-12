"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const ledger=read(base+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const work=read(base+"data/rules/fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
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
 for(const f of ["fssai-source-proof-panels.js","fssai-evidence-capture-116.js"]){
  vm.runInContext(fs.readFileSync(path.join(root,base+f),"utf8"),ctx,{filename:f});
 }
 ctx.pmsvCurrent533SourceLedger=ledger;
 ctx.pmsvCurrent116ProofWorklist=work;
 ctx.contaminantsDb={official_sources:[{url:work.regulatory_basis}],source_version:work.source_version};
 return {ctx,mem};
}
test("all 116 unresolved products display protected evidence capture; 417 partial do not",()=>{
 const {ctx}=make(),pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(products.length,533);assert.equal(pending.size,116);
 for(const p of products){
  const html=ctx.pmsv116LocalEvidenceHtml(p);
  if(pending.has(p.id)){
   assert.match(html,/Collect missing first-source evidence/);
   assert.match(html,/STILL PENDING/);
   assert.match(html,/Stored only in this browser/);
   assert.doesNotMatch(html,/COMPLIANCE APPROVED|CONFORMING LOT/);
  }else assert.equal(html,"");
 }
});
test("evidence checklist is opt-in and cannot award a legal or laboratory PASS",()=>{
 const {ctx,mem}=make(),r=work.records.find(x=>x.proof_branches.length>0);
 assert.ok(r);const id=r.catalog_id,p=lookup.get(id);
 assert.equal(ctx.pmsv116Mark(id,0,true),false);
 assert.equal(ctx.pmsv116SetBranch(id,0),true);
 assert.equal(ctx.pmsv116Mark(id,0,true),true);
 assert.equal(ctx.pmsv116Mark(id,888,true),false);
 assert.match(ctx.pmsv116LocalEvidenceHtml(p),/checked/);
 assert.ok(mem.size===1);
 assert.equal(ctx.pmsv116Note(id,"<script>unsafe</script>"),true);
 const html=ctx.pmsv116LocalEvidenceHtml(p);
 assert.match(html,/&lt;script&gt;unsafe&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>unsafe/);
 assert.equal(ctx.pmsv116Clear(id),true);
 assert.doesNotMatch(ctx.pmsv116LocalEvidenceHtml(p),/checked /);
 assert.equal(ledger.records.find(x=>x.catalog_id===id).source_status,"FIRST_EXACT_SOURCE_PENDING");
 assert.equal(work.records.find(x=>x.catalog_id===id).full_regulatory_compliance_approval,false);
});
test("changed source packet or legal text fails closed and invalidates operator markings",()=>{
 const {ctx}=make(),r=work.records[0],p=lookup.get(r.catalog_id);
 assert.equal(ctx.pmsv116SetBranch(r.catalog_id,0),true);
 const changed=structuredClone(work);changed.records[0].forbidden_transfer="tampered";
 ctx.pmsvCurrent116ProofWorklist=changed;
 assert.match(ctx.pmsv116LocalEvidenceHtml(p),/withheld/);
 assert.equal(ctx.pmsv116Mark(r.catalog_id,0,true),false);
 ctx.pmsvCurrent116ProofWorklist=work;
 assert.match(ctx.pmsv116LocalEvidenceHtml(p),/STILL PENDING/);
});
test("index loads review JS in order and CI includes dedicated regression",()=>{
 const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 const a=html.indexOf("fssai-source-proof-panels.js"),b=html.indexOf("fssai-evidence-capture-116.js");
 assert.ok(a>=0&&b>a);
 const yml=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(yml,/node --test tests\/fssai-evidence-capture-116-2026-10-12\.test\.cjs/);
});