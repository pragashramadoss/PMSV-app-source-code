"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),pre="fssai-product-helper-preview-01/data/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8")),m=read(pre+"rules/fssai-v9-two-subtype-exact-metal-articles-2026-10-11.json");
const idx=read(pre+"standard-search-index-v1.json").products,core=read(pre+"rules/contaminants-v9-core.json");
const ledger=read("audit-output/fssai-live-first-source-ledger-533.json");
const audit=read("audit-output/fssai-product-readiness-audit.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function sourcePinnedTwoSubtypeMetalEvidenceHtml(p){"),b=html.indexOf("function sourcePinnedFruitPickleQuality11Html(p){",a+20);
assert.ok(a>0&&b>a);
const c=vm.createContext({twoSubtypeMetalDb:structuredClone(m),contaminantsDb:structuredClone(core),esc:x=>String(x).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(html.slice(a,b),c);
const p=id=>idx.find(x=>x.id===id),render=x=>vm.runInContext("sourcePinnedTwoSubtypeMetalEvidenceHtml("+JSON.stringify(x)+")",c);
test("Two first-source promotions correctly account for 412 partial and 121 pending, never full compliance",()=>{
 assert.deepEqual([ledger.product_count,ledger.partial_first_source_evidence,ledger.unresolved_first_source_gaps,ledger.legal_or_laboratory_compliance_passes],[533,412,121,0]);
 for(const r of m.records){
  const rec=audit.products.find(x=>x.id===r.catalog_id);
  assert.equal(rec.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
  assert.equal(rec.contaminant_evidence_index.exact_finished_subtype_specific_v9_metal_partial.unconditional_numeric_limit_auto_applied,false);
  assert.ok(!ledger.pending_product_details.some(x=>x.id===r.catalog_id));
  const screen=render(p(r.catalog_id));
  assert.match(screen,/exact named product-subtype metal evidence/);
  assert.match(screen,/PARTIAL ONLY/);
  assert.match(screen,/NOT APPLIED/);
  assert.match(screen,/Not a regulatory compliance PASS/);
 }
});
test("Dried mix remains excluded and non-onion versus onion Lead article and basis are distinguished",()=>{
 const ice=render(p(m.records.find(x=>x.case_id==="ice_cream").catalog_id));
 assert.match(ice,/dried ice cream mix/);
 assert.match(ice,/No named frozen-confection metal limit assigned/);
 const veg=render(p(m.records.find(x=>x.case_id==="dehydrated_vegetables").catalog_id));
 assert.match(veg,/onion only dehydrated/);
 assert.match(veg,/non onion dehydrated vegetables/);
 assert.match(veg,/dry matter basis/);
});
test("Falsified product, source value or auto-apply flag fails closed",()=>{
 const source=m.records[0],prod=p(source.catalog_id);assert.equal(render(p("05-05-1-chocolate")),"");
 assert.match(render({...prod,name:"Not Ice Cream"}),/withheld/);
 const old=c.twoSubtypeMetalDb;
 c.twoSubtypeMetalDb=structuredClone(m);c.twoSubtypeMetalDb.records[0].branches[0].numeric_auto_apply=true;
 assert.match(render(prod),/withheld/);c.twoSubtypeMetalDb=old;
 const sourceDb=c.contaminantsDb;c.contaminantsDb=structuredClone(core);
 c.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Ice-cream, iced lollies and similar frozen confections").limit=11;
 assert.match(render(prod),/withheld/);c.contaminantsDb=sourceDb;
 assert.match(html,/twoSubtypeMetalDb=await r.json\(\)/);
});
