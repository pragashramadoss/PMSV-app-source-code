"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),b="fssai-product-helper-preview-01/data/";
const m=read(b+"rules/fssai-v9-cross-metal-matrix-2026-10-11.json"),v=read(b+"rules/contaminants-v9-core.json");
const older=read(b+"rules/fssai-v9-expanded-identity-nontransfer-2026-10-11.json"),catalog=read(b+"standard-search-index-v1.json").products;
const ledger=read("audit-output/fssai-live-first-source-ledger-533.json"),work=read("audit-output/fssai-next-121-first-exact-source-research-queue.json");
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
test("All 30 new and 13 previous source articles exactly agree with FSSAI Version IX core",()=>{
 assert.equal(m.source_row_count,30);assert.equal(older.new_named_article_rows.length,13);
 for(const a of [...m.source_rows,...older.new_named_article_rows]){
 const rows=(v.metal_article_rules_v9[a.metal]||[]).filter(r=>r.row_type==="exact"&&norm(r.article)===norm(a.article)&&r.limit===a.limit&&r.unit===a.unit);
 assert.equal(rows.length,1,a.id);
 }
});
test("Every cross-metal nontransfer case is a real unresolved identity and no fabricated compliance PASS",()=>{
 assert.deepEqual([m.catalogue_count,m.partial,m.pending,m.first_exact_promotions,m.full_compliance_passes],[533,412,121,0,0]);
 const ids=new Map(catalog.map(p=>[p.id,p])),pending=new Set(ledger.pending_product_details.map(p=>p.id)),source=new Map(m.source_rows.map(r=>[r.id,r])),keys=new Set();
 for(const r of m.scope_guards){
 assert.equal(ids.get(r.catalog_id)?.name,r.product_name,r.catalog_id);
 assert.ok(pending.has(r.catalog_id),r.catalog_id);assert.equal(source.get(r.source_id)?.metal,r.metal);
 const key=r.catalog_id+":"+r.source_id;assert.ok(!keys.has(key),key);keys.add(key);
 assert.ok(r.qualification.length>65);assert.equal(r.status,"SOURCE_SCOPE_REVIEW_ONLY");
 assert.equal(r.exact_applicability_confirmed,false);assert.equal(r.numeric_limit_applied,false);
 assert.equal(r.first_exact_source_promoted,false);assert.equal(r.full_compliance_pass,false);
 }
 assert.equal(keys.size,m.scope_cases);assert.equal(new Set(m.scope_guards.map(g=>g.catalog_id)).size,m.scope_products);
});
test("All new cases export on matching products in 121 research worksheets without numeric auto assignment",()=>{
 assert.deepEqual([work.pending,work.partial,work.full_compliance_passes],[121,412,0]);
 assert.equal(work.cross_metal_source_rows,30);assert.equal(work.cross_metal_scope_cases,m.scope_cases);assert.equal(work.cross_metal_scope_products,m.scope_products);
 let count=0;
 for(const p of work.records){
  const expected=m.scope_guards.filter(r=>r.catalog_id===p.catalog_id),actual=p.cross_metal_nontransfer_references_review_only;
  assert.equal(actual.length,expected.length,p.catalog_id);
  for(const x of expected){
   const y=actual.find(r=>r.source_id===x.source_id);assert.ok(y,x.catalog_id+" "+x.source_id);
   assert.equal(y.required_qualifier,x.qualification);
   assert.equal(y.numeric_limit_applied,false);assert.equal(y.first_exact_source_promoted,false);assert.equal(y.compliance_pass,false);count++;
  }
 }
 assert.equal(count,m.scope_cases);
});
test("Retain explicit cadmium quinoa/potato exceptions, milk analogy, canpack and confectionery specificity",()=>{
 const f=(name,id)=>m.scope_guards.some(x=>x.product_name===name&&x.source_id===id);
 for(const [p,id] of [["Quinoa","CAD_CEREAL"],["Quick Frozen Fried Potatoes","CAD_ROOT"],["Analogue in the dairy context","AS_MILK"],["Fruit Bar/Toffee","AS_HARD_CANDY"],["Fat spread","AS_MARGARINE"],["Frozen Vegetables","TIN_CANNED"],["Salt Substitutes","CAD_SALT"]])assert.ok(f(p,id),p+" "+id);
});
