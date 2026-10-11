"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const rd=p=>JSON.parse(fs.readFileSync(path.join(root,base,p),"utf8"));
const proof=rd("data/rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const core=rd("data/rules/contaminants-v9-core.json");
const priority=rd("data/rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const extra=rd("data/rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json");
const delta=rd("data/rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json");
const recipes=rd("data/rules/fssai-ayurveda-nine-recipe-b1-cross-article-source-review-2026-10-11.json");
const products=new Map(rd("data/standard-search-index-v1.json").products.map(p=>[p.id,p]));
const panel=fs.readFileSync(path.join(root,base,"fssai-source-proof-panels.js"),"utf8");
const recipe=fs.readFileSync(path.join(root,base,"fssai-ayurveda-composite-first-source.js"),"utf8");
const ctx=vm.createContext({contaminantsDb:core,sourcePriorityMetalDb:priority,ayurvedaRecipeReviewDb:recipes,
 esc:s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(panel+"\n"+recipe,ctx);
ctx.pmsvNext121ProofDb=proof;ctx.pmsvNext29DossiersDb=extra;ctx.pmsvAyurvedaCompositeB1Db=delta;
const item=id=>products.get(id),oldHTML=p=>vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(p)+")",ctx);
const newHTML=p=>vm.runInContext("sourcePinnedAyurvedaCompositeB1Html("+JSON.stringify(p)+")",ctx);
test("Validated source-matched foods cannot simultaneously be labelled first-source missing",()=>{
 for(const x of delta.records){
  const p=item(x.catalog_id);assert.ok(p);
  assert.match(newHTML(p),/Positive FSSAI first-source match/);
  assert.equal(oldHTML(p),"");
 }
});
test("All other 119 pending identities remain visibly unresolved with optional article references",()=>{
 const cleared=new Set(delta.records.map(x=>x.catalog_id));
 const unresolved=proof.records.filter(r=>!cleared.has(r.catalog_id));
 assert.equal(unresolved.length,119);
 for(const r of unresolved){
  const html=oldHTML(item(r.catalog_id));
  assert.match(html,/First exact-source evidence needed/,r.catalog_id);
 }
});
test("If the positive recipe evidence changes or fails loading, the historic gap panel reappears rather than clearing without proof",()=>{
 const p=item(delta.records[0].catalog_id);
 const real=ctx.contaminantsDb;ctx.contaminantsDb=JSON.parse(JSON.stringify(core));
 ctx.contaminantsDb.crop_contaminants.total_aflatoxins.rules.find(r=>r.article==="Food product containing any of the above mentioned food articles").limit=200;
 assert.match(newHTML(p),/withheld/);assert.match(oldHTML(p),/First-source research withheld/);
 ctx.contaminantsDb=real;
 const saved=ctx.pmsvAyurvedaCompositeB1Db;ctx.pmsvAyurvedaCompositeB1Db=null;
 assert.match(oldHTML(p),/First exact-source evidence needed/);
 ctx.pmsvAyurvedaCompositeB1Db=saved;
});
