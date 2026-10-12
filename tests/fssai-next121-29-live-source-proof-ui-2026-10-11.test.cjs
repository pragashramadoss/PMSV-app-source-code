"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),data="fssai-product-helper-preview-01/data/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const moduleJs=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/fssai-source-proof-panels.js"),"utf8");
const inventory=read(data+"standard-search-index-v1.json").products;
const proof=read(data+"rules/fssai-next121-positive-subtype-proof-2026-10-11.json"),extra=read(data+"rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json");
const core=read(data+"rules/contaminants-v9-core.json"),priority=read(data+"rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const latest=read(data+"rules/fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json");
const livePending=new Set(latest.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
const ctx=vm.createContext({contaminantsDb:core,sourcePriorityMetalDb:priority,
 pmsv444Ledger:latest,pmsv444Valid:()=>true,
 esc:x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))});
vm.runInContext(moduleJs,ctx);ctx.pmsvNext121ProofDb=proof;ctx.pmsvNext29DossiersDb=extra;
const byId=new Map(inventory.map(x=>[x.id,x])),display=p=>vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(p)+")",ctx);
test("89 current pending identities display archived source proof; 32 promoted cases do not",()=>{
 assert.match(html,/fssai-source-proof-panels\.js\?v=202610[0-9]{2}-[a-z0-9-]+/);
 assert.match(html,/await pmsvLoadPositiveSourceProof\(\)/);
 assert.match(html,/typeof sourcePinned121ResearchProofHtml==='function'/);
 let shown=0,suppressed=0;
 for(const r of proof.records){
  const content=display(byId.get(r.catalog_id));
  if(!livePending.has(r.catalog_id)){assert.equal(content,"",r.catalog_id);suppressed++;continue;}
  shown++;
  assert.match(content,/First exact-source evidence needed/);
  assert.match(content,/NOT APPLIED/);
  assert.match(content,/research checklist/);
  for(const question of r.exact_finished_form_questions.slice(0,8))
   assert.ok(content.includes(ctx.esc(question)),r.catalog_id);
 }
 assert.equal(shown,89);assert.equal(suppressed,32);
 assert.equal(display(byId.get("mineral-water")),"");
});
test("Archived 29 special vs 92 candidates remain correctly scoped to currently pending 89 cases",()=>{
 const special=new Set(extra.records.map(x=>x.catalog_id));assert.equal(special.size,29);
 let withCandidates=0;
 let currentUnmatched=0,currentCandidates=0;
 for(const record of proof.records){
  const content=display(byId.get(record.catalog_id));
  if(!livePending.has(record.catalog_id)){assert.equal(content,"",record.catalog_id);continue;}
  if(special.has(record.catalog_id)){currentUnmatched++;
   const doc=extra.records.find(x=>x.catalog_id===record.catalog_id);
   assert.ok(content.includes(ctx.esc(doc.risk_of_wrong_article_transfer)));
   assert.ok(content.includes(ctx.esc(doc.positive_regulatory_source_evidence_to_obtain)));
   assert.match(content,/No safe named contaminant article/);
  }else{
   withCandidates++;currentCandidates++;
   assert.match(content,/Official named-article references/);
   for(const id of record.named_article_references_review_only){
    const article=proof.verified_source_rows.find(x=>x.id===id);
    assert.ok(content.includes(ctx.esc(article.article)),record.catalog_id);
    assert.ok(!content.includes("<b>"+article.limit+" "+article.unit+"</b>"));
   }
  }
 }
 assert.equal(currentUnmatched+currentCandidates,89);
 assert.equal(withCandidates,currentCandidates);
});
test("Any wrong product identity, regulatory number, faked approval or missing register fails closed",()=>{
 const p=byId.get("06-06-2-carob-powder");
 assert.match(display({...p,name:"Cocoa Powder"}),/withheld/);
 assert.match(display({...p,fssr:"2.7.8"}),/withheld/);
 const prev=ctx.pmsvNext121ProofDb;
 ctx.pmsvNext121ProofDb=JSON.parse(JSON.stringify(proof));
 ctx.pmsvNext121ProofDb.verified_source_rows.find(x=>x.id==="lead-cocoa-powder").limit=999;
 assert.match(display(p),/withheld/);ctx.pmsvNext121ProofDb=prev;
 const old=ctx.contaminantsDb;ctx.contaminantsDb=JSON.parse(JSON.stringify(core));
 ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Milks").limit=0.8;
 assert.match(display(p),/withheld/);ctx.contaminantsDb=old;
 const oldD=ctx.pmsvNext29DossiersDb;ctx.pmsvNext29DossiersDb=JSON.parse(JSON.stringify(extra));
 ctx.pmsvNext29DossiersDb.records[0].compliance_pass=true;
 assert.match(display(p),/withheld/);ctx.pmsvNext29DossiersDb=oldD;
 ctx.pmsvNext121ProofDb=null;assert.match(display(p),/withheld/);ctx.pmsvNext121ProofDb=prev;
 assert.match(display(p),/First exact-source evidence needed/);
});
