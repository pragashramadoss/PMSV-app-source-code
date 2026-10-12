"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const rd=p=>JSON.parse(fs.readFileSync(path.join(root,base,p),"utf8"));
const proof=rd("data/rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const core=rd("data/rules/contaminants-v9-core.json");
const priority=rd("data/rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const extra=rd("data/rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json");
const delta=rd("data/rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json");
const grain=rd("data/rules/fssai-other-foodgrains-b1-first-source-2026-10-11.json");
const latest=rd("data/rules/fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json");
const currentPending=new Set(latest.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
const chapter=rd("data/rules/chapter-2-4-cereals-v1.json");
const recipes=rd("data/rules/fssai-ayurveda-nine-recipe-b1-cross-article-source-review-2026-10-11.json");
const products=new Map(rd("data/standard-search-index-v1.json").products.map(p=>[p.id,p]));
const panel=fs.readFileSync(path.join(root,base,"fssai-source-proof-panels.js"),"utf8");
const recipe=fs.readFileSync(path.join(root,base,"fssai-ayurveda-composite-first-source.js"),"utf8");
const grains=fs.readFileSync(path.join(root,base,"fssai-other-foodgrains-source.js"),"utf8");
const ctx=vm.createContext({contaminantsDb:core,chapterRuleDbs:[chapter],sourcePriorityMetalDb:priority,ayurvedaRecipeReviewDb:recipes,
 pmsv444Ledger:latest,pmsv444Valid:()=>true,
 esc:s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(panel+"\n"+recipe+"\n"+grains,ctx);
ctx.pmsvNext121ProofDb=proof;ctx.pmsvNext29DossiersDb=extra;ctx.pmsvAyurvedaCompositeB1Db=delta;ctx.pmsvGrainProof=grain;
const item=id=>products.get(id),oldHTML=p=>vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(p)+")",ctx);
const newHTML=p=>vm.runInContext("sourcePinnedAyurvedaCompositeB1Html("+JSON.stringify(p)+")",ctx);
test("Validated source-matched foods cannot simultaneously be labelled first-source missing",()=>{
 for(const x of delta.records){
  const p=item(x.catalog_id);assert.ok(p);
  assert.match(newHTML(p),/Positive FSSAI first-source match/);
  assert.equal(oldHTML(p),"");
 }
});
test("Archived 121 identities show only current 89 unresolved source panels",()=>{
 let shown=0,suppressed=0;
 for(const r of proof.records){
  const html=oldHTML(item(r.catalog_id));
  if(currentPending.has(r.catalog_id)){
   shown++;assert.match(html,/First exact-source evidence needed/,r.catalog_id);
  }else{
   suppressed++;assert.equal(html,"",r.catalog_id);
  }
 }
 assert.equal(shown,89);assert.equal(suppressed,32);
});
test("Legacy panel never revives stale pending after positive recipe data changes",()=>{
 const p=item(delta.records[0].catalog_id);
 const real=ctx.contaminantsDb;ctx.contaminantsDb=JSON.parse(JSON.stringify(core));
 ctx.contaminantsDb.crop_contaminants.total_aflatoxins.rules.find(r=>r.article==="Food product containing any of the above mentioned food articles").limit=200;
 assert.match(newHTML(p),/withheld/);
 assert.equal(oldHTML(p),"");
 ctx.contaminantsDb=real;
 const saved=ctx.pmsvAyurvedaCompositeB1Db;ctx.pmsvAyurvedaCompositeB1Db=null;
 assert.equal(oldHTML(p),"");
 ctx.pmsvAyurvedaCompositeB1Db=saved;
 ctx.pmsv444Valid=()=>false;
 assert.equal(oldHTML(p),"");
 ctx.pmsv444Valid=()=>true;
});
