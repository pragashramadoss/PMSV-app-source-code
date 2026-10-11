"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),prefix="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,prefix,p),"utf8"));
const adjud=read("data/rules/fssai-153-source-article-applicability-adjudications-2026-10-11.json");
const proof=read("data/rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const original=read("data/rules/contaminants-v9-core.json");
const core=original;
const priority=read("data/rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const products=read("data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,prefix,"index.html"),"utf8");
const sourceModule=fs.readFileSync(path.join(root,prefix,"fssai-source-proof-panels.js"),"utf8");
const moduleJs=fs.readFileSync(path.join(root,prefix,"fssai-article-adjudications.js"),"utf8");
const esc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const ctx=vm.createContext({contaminantsDb:core,sourcePriorityMetalDb:priority,esc});
vm.runInContext(sourceModule+"\n"+moduleJs,ctx);
ctx.pmsvNext121ProofDb=proof;ctx.pmsvArticleAdjudicationDb=adjud;
const cat=new Map(products.map(x=>[x.id,x]));const show=id=>vm.runInContext("sourcePinnedLegalArticleAdjudicationHtml("+JSON.stringify(cat.get(id))+")",ctx);
test("All 153 named-article links have source-backed explicit decisions and never imply a product exemption",()=>{
 assert.equal(adjud.records.length,153);assert.equal(adjud.source_link_reviews,153);
 assert.deepEqual(adjud.current_first_source_status,{old_partial:412,old_pending:121,new_first_source_positive:2,partial:414,still_without_first_source:119});
 const possible=new Set(["DIRECT_FINISHED_ARTICLE_EXCLUDED","SUBTYPE_PROCESSING_PROOF_REQUIRED","CONFIRMED_NAMED_COMPOSITE_ARTICLE_POSITIVE"]);
 const originalMap=new Map(proof.records.map(x=>[x.catalog_id,x]));
 const counts=new Map;
 for(const d of adjud.records){
  const p=cat.get(d.catalog_id);assert.ok(p);
  assert.equal(d.product_name,p.name);assert.equal(d.fssr,p.fssr);assert.equal(d.fcs,p.fcs);
  assert.ok(originalMap.get(p.id).named_article_references_review_only.includes(d.source_row_id));
  const src=proof.verified_source_rows.find(x=>x.id===d.source_row_id);
  assert.ok(src&&src.article===d.source_article&&src.analyte===d.contaminant);
  assert.ok(possible.has(d.legal_article_applicability));
  assert.equal(d.numeric_finished_product_auto_apply,false);assert.equal(d.full_compliance_pass,false);
  assert.ok(d.reason.length>85&&d.positive_proof_to_establish.length>70);
  counts.set(p.id,(counts.get(p.id)||0)+1);
 }
 assert.equal(counts.size,92);
 for(const p of proof.records)assert.equal(counts.get(p.catalog_id)||0,p.named_article_references_review_only.length);
 assert.match(html,/fssai-article-adjudications\.js\?v=20261011-decisions153/);
 assert.match(html,/sourcePinnedLegalArticleAdjudicationHtml\(p\)/);
});
test("Each of 92 candidate-bearing product screens now displays affirmative/negative scope decisions",()=>{
 let seen=0;
 for(const p of proof.records){
  const h=show(p.catalog_id);
  if(!p.named_article_references_review_only.length){assert.equal(h,"");continue;}
  assert.match(h,/Verified applicability of candidate named articles/);
  assert.match(h,/Nothing here issues a compliance PASS/);
  seen++;
 }
 assert.equal(seen,92);
});
test("Known article misapplications are affirmatively rejected: non-dairy, cocoa mass, vending water, high ash dry glucose and milled roots",()=>{
 const excluded=[
 ["04-04-1-coconut-milk-non-dairy","lead-milks"],
 ["04-04-2-cocoa-beans","lead-cocoa-powder"],
 ["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake","lead-cocoa-powder"],
 ["purified-vending-water","lead-packaged-water"],
 ["11-11-1-dried-glucose-syrup","lead-sugars-high-ash"],
 ["06-06-2-arrowroot","pesticide-milled-grains-24d"],
 ["04-04-2-dried-fungi","lead-canned-mushrooms"],
 ["06-06-2-water-chestnut-flour-singhare-ka-atta","pesticide-milled-grains-24d"]
 ];
 for(const [id,article] of excluded){
  const r=adjud.records.find(z=>z.catalog_id===id&&z.source_row_id===article);
  assert.ok(r,id+" "+article);assert.equal(r.legal_article_applicability,"DIRECT_FINISHED_ARTICLE_EXCLUDED");
 }
});
test("Two new Ayurveda composite matches are positive while tea infusions stay conditional",()=>{
 for(const id of ["102-102-1-13-1-krishara-khichdi","102-102-1-15-1-kulmasha-barley-savory-discs"]){
  const rows=adjud.records.filter(r=>r.catalog_id===id);
  assert.equal(rows.length,2);
  assert.ok(rows.every(r=>r.legal_article_applicability==="CONFIRMED_NAMED_COMPOSITE_ARTICLE_POSITIVE"));
 }
 const tea=adjud.records.filter(r=>r.catalog_id==="102-102-1-12-1-lajadi-kashaya-parched-rice-tea");
 assert.ok(tea.length>0&&tea.every(r=>r.legal_article_applicability==="SUBTYPE_PROCESSING_PROOF_REQUIRED"));
});
test("Altered official source table or faked product identity withholds decisions",()=>{
 const id="04-04-2-cocoa-beans";
 assert.match(show(id),/Named article does NOT directly describe this finished product/);
 const prev=ctx.contaminantsDb;ctx.contaminantsDb=JSON.parse(JSON.stringify(original));
 ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Cocoa powder").limit=999;
 assert.match(show(id),/withheld/);ctx.contaminantsDb=prev;
 const i=cat.get(id);
 assert.match(vm.runInContext("sourcePinnedLegalArticleAdjudicationHtml("+JSON.stringify({...i,name:"Cocoa mass"})+")",ctx),/withheld/);
 const m=ctx.pmsvArticleAdjudicationDb;ctx.pmsvArticleAdjudicationDb=null;assert.match(show(id),/withheld/);ctx.pmsvArticleAdjudicationDb=m;
});
