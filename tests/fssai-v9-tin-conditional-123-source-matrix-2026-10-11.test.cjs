"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=load("fssai-product-helper-preview-01/data/rules/fssai-v9-tin-conditional-source-matrix-2026-10-11.json"),index=load("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const ledger=load("audit-output/fssai-live-first-source-ledger-533.json");
const ids=new Map(index.map(p=>[p.id,p])),pending=new Set(ledger.pending_product_details.map(p=>p.id));
const values={TIN_CANNED_FRUIT_GROUP:250,TIN_CANNED_BEVERAGES:150,TIN_CANNED_CHESTNUTS:250,TIN_CANNED_FOODS_OTHER:250,TIN_CANNED_MUSHROOMS:250,TIN_CANNED_TOMATOES:250,TIN_JAM_JELLY:250,TIN_MANGO_CHUTNEY:250,TIN_PICKLED_CUCUMBER:250,TIN_PROCESSED_CANNED:250,TIN_PROCESSED_TOMATO:250,TIN_FRUIT_PULP:250,TIN_HARD_BOILED:5};
test("13 official FSSAI Version IX Tin rows retain original numbers and analytical units",()=>{
 assert.equal(m.official_source,"https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf");assert.equal(m.named_source_rows.length,13);
 assert.deepEqual(new Set(m.named_source_rows.map(r=>r.id)),new Set(Object.keys(values)));
 for(const r of m.named_source_rows){assert.equal(r.metal,"Tin");assert.equal(r.maximum_mg_per_kg,values[r.id]);assert.equal(r.unit,"mg/kg");assert.ok([10,11].includes(r.pdf_page_one_based));assert.ok(r.article.length>=5);}
 assert.equal(m.auto_numeric_application,false);assert.equal(m.first_exact_evidence_promotions,0);assert.equal(m.full_compliance_passes,0);
});
test("61 nontransfer guards cover 36 still unresolved exact catalogue identities, with no false pass",()=>{
 assert.deepEqual([ledger.product_count,ledger.partial_first_source_evidence,ledger.unresolved_first_source_gaps,ledger.legal_or_laboratory_compliance_passes],[533,412,121,0]);
 assert.equal(m.scope_guards.length,61);assert.equal(m.conditional_source_cases,61);assert.equal(m.distinct_unresolved_products,36);
 assert.equal(new Set(m.scope_guards.map(r=>r.catalog_id)).size,36);
 assert.equal(new Set(m.scope_guards.map(r=>r.catalog_id+"::"+r.source_id)).size,61);
 for(const r of m.scope_guards){assert.ok(ids.has(r.catalog_id)&&pending.has(r.catalog_id),r.catalog_id);assert.equal(r.product_name,ids.get(r.catalog_id).name);assert.ok(m.named_source_rows.some(s=>s.id===r.source_id));assert.ok(r.required_qualifier.includes(r.product_name)&&r.required_qualifier.length>90);assert.equal(r.status,"REVIEW_ONLY_NOT_APPLIED");for(const k of ["actual_named_article_scope_confirmed","finished_product_numeric_limit_applied","first_exact_source_promoted","complete_contaminant_approval"])assert.equal(r[k],false,r.catalog_id+" "+k);}
});
test("Critical canned-vs-frozen, source-identity and hard-candy exclusion pairs survive",()=>{
 for(const [id,sid] of [["04-04-2-dried-fungi","TIN_CANNED_MUSHROOMS"],["04-04-1-frozen-fruits-fruit-products","TIN_CANNED_FRUIT_GROUP"],["04-04-2-ginger-paste","TIN_PROCESSED_TOMATO"],["06-06-2-water-chestnut-flour-singhare-ka-atta","TIN_CANNED_CHESTNUTS"],["04-04-1-coconut-milk-non-dairy","TIN_CANNED_BEVERAGES"],["18-18-1-indian-confections","TIN_HARD_BOILED"]]){assert.ok(m.scope_guards.some(r=>r.catalog_id===id&&r.source_id===sid),id);}
});
