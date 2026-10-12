#!/usr/bin/env node
"use strict";
/* Current-source user-interface regression. Run: node scripts/audit-fssai-current-89-ui-regression.cjs
   Snapshots are evidence, not legal/laboratory approval. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const src=p=>fs.readFileSync(path.join(root,p),"utf8");
const base="fssai-product-helper-preview-01/";
const ledger=read(base+"data/rules/fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json");
const q=read(base+"data/rules/fssai-current-89-first-exact-source-proof-worklist-2026-10-12.json");
const archive=read(base+"data/rules/fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const items=new Map(ledger.records.map(x=>[x.catalog_id,x]));
const pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
const partial=new Set(ledger.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").map(x=>x.catalog_id));
const historic=new Set(archive.records.map(x=>x.catalog_id));
assert.equal(ledger.catalogue,533);assert.equal(items.size,533);
assert.equal(pending.size,89);assert.equal(partial.size,444);
assert.equal(q.review_records.length,89);assert.equal(historic.size,116);
assert.equal(archive.records.length,116);
assert.equal([...historic].filter(id=>partial.has(id)).length,27);
assert.equal([...historic].filter(id=>pending.has(id)).length,89);
assert.deepEqual(new Set(q.review_records.map(x=>x.catalog_id)),pending);
for(const x of ledger.records){
 assert.equal(x.sample_lab_pass,false,x.catalog_id);
 assert.equal(x.product_compliance_approval,false,x.catalog_id);
 assert.equal(x.complete_contaminant_panel,false,x.catalog_id);
}
for(const x of q.review_records){
 const a=items.get(x.catalog_id);assert.ok(a);
 assert.equal(x.product_name,a.product_name);
 assert.equal(String(x.fssr||""),String(a.fssr||""));
 assert.equal(String(x.fcs||""),String(a.fcs||""));
 assert.equal(x.first_exact_source_verified,false);
 assert.equal(x.numeric_finished_food_limit_auto_applied,false);
}
const archiveUI=src(base+"fssai-source-proof-panels.js");
const localUI=src(base+"fssai-evidence-capture-116.js");
const latestUI=src(base+"fssai-first-source-current-444-89.js");
assert.ok(archiveUI.includes("const current=pmsv444Ledger?.records?.find"));
assert.ok(archiveUI.includes("current.source_status!=='FIRST_EXACT_SOURCE_PENDING'"));
assert.ok(localUI.includes('typeof pmsv444Valid!=="function"'));
assert.ok(localUI.includes('current.source_status==="FIRST_EXACT_SOURCE_PENDING"'));
assert.ok(latestUI.includes('if(current.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";'));
assert.ok(!latestUI.includes('if(pmsv444Ids.includes(p.id))return "";'));
console.log("PASS: 533/444/89 current source ledger; 27 archived pending panels suppressed; 89 collectors preserved; 0 regulatory/lab PASS.");
