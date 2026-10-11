#!/usr/bin/env node
"use strict";
/**
 * Deterministic handoff for the 123 still-unresolved FSSAI Helper product identities.
 * Run AFTER audit-fssai-product-readiness.cjs and
 * audit-fssai-evidence-ledger-conservation.cjs. This is a research queue,
 * NOT a regulatory source match or an assessment of product compliance.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const ledger=load("audit-output/fssai-live-first-source-ledger-533.json");
const products=load("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const history=load("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json").records;
const indexed=new Map(products.map(p=>[p.id,p]));
const historic=new Map(history.map(p=>[p.catalog_id,p]));
const remaining=ledger.pending_product_details;
assert.equal(ledger.product_count,533);
assert.equal(ledger.partial_first_source_evidence,410);
assert.equal(ledger.unresolved_first_source_gaps,123);
assert.equal(ledger.legal_or_laboratory_compliance_passes,0);
assert.equal(remaining.length,123);
assert.equal(new Set(remaining.map(x=>x.id)).size,123);
assert.equal(indexed.size,533);
const keys=["identity","regulatory_article","matrix","processing","formulation","packaging","current_amendments","test_basis"];
const output=remaining.map((x,i)=>{
 const p=indexed.get(x.id),old=historic.get(x.id);
 assert.ok(p&&old,"Untraced pending ID: "+x.id);
 assert.equal(p.name,x.name);assert.equal(p.fssr,x.fssr);assert.equal(p.fcs,x.fcs);
 assert.equal(old.auto_apply_numeric_limit,false);
 assert.equal(old.unconditional_compliance_pass,false);
 assert.equal(old.exemption_asserted,false);
 assert.equal(x.numeric_compliance_pass,false);
 return {priority:i+1,catalog_id:x.id,product:x.name,fssr:x.fssr,fcs:x.fcs,family:x.family,
  evidence_state:"UNRESOLVED_FIRST_EXACT",needed_checks:keys.join("; "),
  named_article:"NOT_YET_VERIFIED",source_url:"",effective_amendment_date:"",
  assay_basis:"",qualifier_disposition:"REVIEW_REQUIRED",
  auto_apply_limit:"NO",full_compliance_pass:"NO"};
});
const esc=x=>'"'+String(x??"").replaceAll('"','""')+'"';
const cols=Object.keys(output[0]);
const csv=[cols.join(","),...output.map(r=>cols.map(k=>esc(r[k])).join(","))].join("\n")+"\n";
const dir=path.join(root,"audit-output");
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,"fssai-next-123-first-exact-source-research-queue.csv"),csv);
fs.writeFileSync(path.join(dir,"fssai-next-123-first-exact-source-research-queue.json"),
 JSON.stringify({snapshot:"2026-10-11",source:"generated-live-533-ledger",pending:123,
  partial:410,full_compliance_passes:0,records:output},null,2)+"\n");
console.log("Generated 123 identity-locked source research records (0 source promotions; 0 compliance approvals)");
