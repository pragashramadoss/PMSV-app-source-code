"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const m=read(base+"rules/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.json");
const core=read(base+"rules/contaminants-v9-core.json");
const catalog=read(base+"standard-search-index-v1.json").products;
const ledger=read("audit-output/fssai-live-first-source-ledger-533.json");
const byId=new Map(catalog.map(x=>[x.id,x]));
const pending=new Set(ledger.pending_product_details.map(x=>x.id));
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
test("31 product/article nontransfer cases cover 26 unresolved real identities, with no invented approvals",()=>{
 assert.equal(m.scope_guards.length,31);
 assert.equal(new Set(m.scope_guards.map(x=>x.catalog_id)).size,26);
 assert.equal(m.named_source_rows.length,18);
 assert.equal(ledger.product_count,533);
 assert.equal(ledger.partial_first_source_evidence,412);
 assert.equal(ledger.unresolved_first_source_gaps,121);
 assert.equal(ledger.legal_or_laboratory_compliance_passes,0);
 assert.equal(m.full_product_compliance_passes,0);
 assert.equal(m.first_exact_promotions,0);
 for(const row of m.scope_guards){
  assert.ok(byId.has(row.catalog_id),row.catalog_id);
  const sourceMatchedTwo=new Set(["04-04-2-dehydrated-vegetables","01-01-7-ice-cream-kulfi-chocolate-ice-cream-softy-ice-cream-milk-ice-milk-lolly-and-dried-"]);
  assert.ok(pending.has(row.catalog_id)||sourceMatchedTwo.has(row.catalog_id),"Historical source guard must stay in the current pending queue or have a proven qualified source: "+row.catalog_id);
  assert.ok(row.required_qualifier.length>=55,row.catalog_id);
  assert.equal(row.automatic_finished_product_limit,false);
  assert.equal(row.first_exact_source_promoted,false);
  assert.equal(row.compliance_pass,false);
  assert.ok(m.named_source_rows.some(x=>x.id===row.reference_id),row.reference_id);
 }
});
test("All 18 source references have exact FSSAI Version IX stored article and numeric value; no generic default rows",()=>{
 assert.match(core.source_version,/Version IX.*03\.02\.2026/);
 assert.equal(m.source,"https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf");
 const mismatch=[];
 for(const x of m.named_source_rows){
  assert.ok(Number.isInteger(x.pdf_page_one_based)&&x.pdf_page_one_based>=2);
  assert.ok(!/foods not specified/i.test(x.article));
  const all=core.metal_article_rules_v9[x.metal]||[];
  const rows=all.filter(y=>y.row_type==="exact"&&norm(y.article)===norm(x.article));
  if(rows.length!==1||Number(rows[0]?.limit)!==x.limit||rows[0]?.unit!==x.unit){
   mismatch.push({id:x.id,wanted:{article:x.article,limit:x.limit,unit:x.unit},matches:rows,
    likely:all.filter(y=>/milk|water|cocoa|fruit|tomato|onion|frozen|cream/i.test(y.article)).filter(y=>norm(y.article).includes(norm(x.article).slice(0,13))||norm(x.article).includes(norm(y.article).slice(0,11))).slice(0,6)});
  }
 }
 assert.deepEqual(mismatch,[],"Incorrect or missing core named-article source records");

});
test("Cross-family article violations cannot become literal first-exact product evidence",()=>{
 const pairs=[
 ["04-04-1-frozen-fruits-fruit-products","CANNED_FRUIT_COCKTAIL"],
 ["04-04-2-cocoa-beans","COCOA_POWDER_LEAD"],
 ["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake","COCOA_POWDER_COPPER"],
 ["04-04-1-coconut-milk-non-dairy","MILK_LEAD"],
 ["04-04-2-dried-fungi","CANNED_MUSHROOMS"],
 ["purified-vending-water","PACKAGED_WATER_LEAD"],
 ["02-02-2-fat-spread","MINARINE_LEAD"],
 ["04-04-2-ginger-paste","TOMATO_PUREE_COPPER"]
 ];
 for(const [id,article] of pairs){
  const row=m.scope_guards.find(x=>x.catalog_id===id&&x.reference_id===article);
  assert.ok(row,id+" missing");
  assert.equal(row.automatic_finished_product_limit,false);
 }
 const ctrIds=new Set(m.named_source_rows.map(x=>x.id));
 assert.equal(ctrIds.size,18);
 const keys=new Set(m.scope_guards.map(x=>x.catalog_id+"::"+x.reference_id));
 assert.equal(keys.size,31,"No duplicate source/article gates");
});
