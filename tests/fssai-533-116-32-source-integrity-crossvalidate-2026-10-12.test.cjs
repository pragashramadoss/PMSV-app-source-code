"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/",read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const l=read(base+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const d116=read(base+"data/rules/fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const d32=read(base+"data/rules/fssai-2026-10-12-thirtytwo-cereal-fruit-spice-identity-source-branches.json");
const core=read(base+"data/rules/contaminants-v9-core.json");
const ix=read(base+"data/standard-search-index-v1.json").products,index=new Map(ix.map(x=>[x.id,x]));
const js=fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8");
function init(){
 const ctx={console,esc:x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,'&quot;')};
 vm.createContext(ctx);vm.runInContext(js,ctx);
 ctx.contaminantsDb=structuredClone(core);
 ctx.pmsvCurrent533SourceLedger=structuredClone(l);
 ctx.pmsvCurrent116ProofWorklist=structuredClone(d116);
 ctx.pmsvCerealFruitSpiceSourceDb=structuredClone(d32);
 return ctx;
}
test("source-integrity predicates authenticate 533 identities, 116 missing-source packets, 32 named-article cases and nine limits",()=>{
 const c=init();
 assert.equal(c.pmsvCurrent116DocumentaryIntegrity(),true);
 assert.equal(c.pmsvCurrent32DocumentaryIntegrity(),true);
 assert.equal(l.records.length,533);
 assert.equal(d116.records.length,116);assert.equal(d32.records.length,32);
 assert.equal(c.pmsvCanonicalNamedFssaiSourceRefs.length,9);
 for(const x of d116.records){
  const html=c.pmsvCurrent116ProofChecklistHtml(index.get(x.catalog_id));
  assert.match(html,/Evidence needed to close this first-source gap/);
  assert.doesNotMatch(html,/regulatory compliance PASS granted/i);
 }
 for(const x of d32.records)assert.match(c.pmsvCerealFruitSpiceSourceHtml(index.get(x.catalog_id)),/Finished-food subtype/);
});
test("all nine authenticated article rows fail closed on in-memory number drift, even after a successful load",()=>{
 for(let i=0;i<9;i++){
  const c=init(),[key,,,,]=c.pmsvCanonicalNamedFssaiSourceRefs[i];
  const canonical=c.pmsvCanonicalNamedFssaiSourceRefs[i];
  const group=c.pmsvCerealFruitSpiceSourceDb.source_article_rows.find(x=>x.key===key);
  const rule=group.refs.find(x=>x.core_key===canonical[3]);
  rule.limit+=0.01;
  assert.equal(c.pmsvCurrent32DocumentaryIntegrity(),false,key);
  const p=index.get(d32.records[0].catalog_id);
  assert.match(c.pmsvCerealFruitSpiceSourceHtml(p),/withheld/);
 }
});
test("official core contaminant row drift and changed articles cannot create counterfeit source evidence",()=>{
 for(const change of ["core_limit","core_unit","article","permission","product_name","source_url"]){
  const c=init(),target=c.pmsvCerealFruitSpiceSourceDb.records[0];
  if(change==="core_limit"){
   c.contaminantsDb.crop_contaminants.total_aflatoxins.rules.find(x=>x.article==="Cereal and cereal products").limit+=1;
  }else if(change==="core_unit")c.contaminantsDb.crop_contaminants.total_aflatoxins.unit="mg/kg";
  else if(change==="article")c.pmsvCerealFruitSpiceSourceDb.source_article_rows[0].article="All foods";
  else if(change==="permission")target.unconditional_limit_application=true;
  else if(change==="product_name")target.product_name="Unrelated product";
  else if(change==="source_url")target.official_product_source="https://fake-fssai.gov.in.attacker.invalid/foo";
  assert.equal(c.pmsvCurrent32DocumentaryIntegrity(),false,change);
  assert.match(c.pmsvCerealFruitSpiceSourceHtml(index.get(target.catalog_id)),/withheld/);
 }
});
test("any one of 116 altered product identity, article, source link, absent proof, invented PASS or ledger collision withholds all current worklists",()=>{
 for(const change of ["identity","url","branch","pass","collision","source","ledger"]){
  const c=init(),r=c.pmsvCurrent116ProofWorklist.records[0];
  if(change==="identity")r.product_name="Fake verified product";
  else if(change==="url")r.official_finished_product_source="https://fssai.gov.in.attacker.invalid/ctr";
  else if(change==="branch")r.proof_branches[0].required_evidence=[];
  else if(change==="pass")r.full_regulatory_compliance_approval=true;
  else if(change==="collision")c.pmsvCurrent116ProofWorklist.records[1].catalog_id=r.catalog_id;
  else if(change==="source")c.pmsvCurrent116ProofWorklist.regulatory_basis="https://thirdparty.invalid/notes";
  else if(change==="ledger")c.pmsvCurrent533SourceLedger.records.find(x=>x.catalog_id===r.catalog_id).source_status="PARTIAL_EXACT_SOURCE_MATCH";
  assert.equal(c.pmsvCurrent116DocumentaryIntegrity(),false,change);
  assert.match(c.pmsvCurrent116ProofChecklistHtml(index.get(r.catalog_id)),/withheld/);
 }
});
test("valid scoped source references remain visible only as NOT APPLIED and never turn into laboratory approval",()=>{
 const c=init(),p=index.get("06-06-4-macaroni-products-pasta-products");
 c.pmsvCerealFruitSpiceChoices[p.id]="cereal_product_source_scope_UNVERIFIED";
 const html=c.pmsvCerealFruitSpiceSourceHtml(p);
 assert.match(html,/15 µg\/kg/);assert.match(html,/NOT APPLIED/);
 assert.match(html,/No source reference is automatically/);
 assert.equal(c.pmsvCurrent32DocumentaryIntegrity(),true);
 c.pmsvCerealFruitSpiceChoices[p.id]="illegal_classification";
 assert.match(c.pmsvCerealFruitSpiceSourceHtml(p),/withheld/);
});
