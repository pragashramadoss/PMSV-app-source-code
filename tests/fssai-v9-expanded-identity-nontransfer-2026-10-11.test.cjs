"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const load=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const b="fssai-product-helper-preview-01/data/";
const m=load(b+"rules/fssai-v9-expanded-identity-nontransfer-2026-10-11.json"),c=load(b+"rules/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.json");
const ix=load(b+"standard-search-index-v1.json").products,l=load("audit-output/fssai-live-first-source-ledger-533.json"),w=load("audit-output/fssai-next-121-first-exact-source-research-queue.json");
test("All expanded source conditions are real pending identities, never regulatory compliance evidence",()=>{
 assert.deepEqual([m.total,m.partial,m.pending,m.first_exact_promotions,m.full_compliance_passes],[533,412,121,0,0]);
 assert.equal(m.new_named_article_rows.length,13);
 assert.ok(m.official_source.startsWith("https://fssai.gov.in/"));
 const source=new Set([...m.new_named_article_rows,...c.named_source_rows].map(x=>x.id));
 const byId=new Map(ix.map(p=>[p.id,p])),pending=new Set(l.pending_product_details.map(p=>p.id)),keys=new Set();
 for(const g of m.scope_guards){assert.equal(byId.get(g.catalog_id)?.name,g.product_name);
  assert.ok(pending.has(g.catalog_id));assert.ok(source.has(g.reference_id));
  assert.ok(g.required_qualifier.length>70);assert.equal(g.named_source_review_only,true);
  assert.equal(g.exact_finished_article_confirmed,false);assert.equal(g.auto_numeric_application,false);
  assert.equal(g.first_exact_promotion,false);assert.equal(g.compliance_pass,false);
  const k=g.catalog_id+":"+g.reference_id;assert.ok(!keys.has(k));keys.add(k);}
 assert.equal(keys.size,m.scope_guard_count);
 assert.equal(new Set(m.scope_guards.map(x=>x.catalog_id)).size,m.products_with_guards);
 for(const a of m.new_named_article_rows){assert.equal(a.source,m.official_source);assert.equal(a.unit,"mg/kg");assert.ok(a.limit>0&&a.pdf_page_one_based>=2&&a.pdf_page_one_based<=12);}
});
test("121 individual worklists preserve expanded sources without numerical compliance decisions",()=>{
 assert.deepEqual([w.pending,w.partial,w.full_compliance_passes],[121,412,0]);
 assert.equal(w.expanded_source_rows,13);assert.equal(w.expanded_nontransfer_cases,m.scope_guard_count);assert.equal(w.expanded_nontransfer_products,m.products_with_guards);
 let n=0;for(const p of w.records){const expected=m.scope_guards.filter(x=>x.catalog_id===p.catalog_id);
  assert.equal(p.expanded_named_article_references_review_only.length,expected.length);
  for(const x of expected){const row=p.expanded_named_article_references_review_only.find(a=>a.source_reference_id===x.reference_id);
    assert.ok(row);assert.equal(row.is_applied,false);assert.equal(row.first_exact_source_promoted,false);assert.equal(row.compliance_pass,false);n++;}}
 assert.equal(n,m.scope_guard_count);
});
