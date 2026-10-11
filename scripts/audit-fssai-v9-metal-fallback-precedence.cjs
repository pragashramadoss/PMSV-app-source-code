#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const m=read(base+"rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const core=read(base+"rules/contaminants-v9-core.json");
const ix=read(base+"standard-search-index-v1.json").products;
const live=read("audit-output/fssai-live-first-source-ledger-533.json");
const normalized=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
assert.deepEqual([ix.length,live.product_count,live.partial_first_source_evidence,live.unresolved_first_source_gaps,live.legal_or_laboratory_compliance_passes],[533,533,412,121,0]);
assert.equal(new Set(ix.map(x=>x.id)).size,533);
assert.equal(m.rows.length,7);
const ids=new Set(ix.map(x=>x.id));
const pending=new Set(live.pending_product_details.map(x=>x.id));
assert.equal(pending.size,121);
assert.equal(m.unresolved_first_exact_catalog_id_count,121);
assert.deepEqual(new Set(m.unresolved_first_exact_catalog_ids),pending,"Named source priority product gate must equal current 121 live first-exact gaps");
assert.equal(m.unresolved_exact_product_identity_gates.length,121);
const canonical=new Map(ix.map(p=>[p.id,p]));
assert.deepEqual(new Set(m.unresolved_exact_product_identity_gates.map(x=>x.catalog_id)),pending);
for(const gate of m.unresolved_exact_product_identity_gates){
 const p=canonical.get(gate.catalog_id);
 assert.ok(p&&gate.product_name===p.name&&gate.fssr===p.fssr&&gate.fcs===p.fcs,
  "Exact FSSR/FoSCoS source-priority gate identity drift: "+gate.catalog_id);
}
for(const id of pending)assert.ok(ids.has(id));
for(const row of m.rows){
 const all=core.metal_article_rules_v9[row.metal]||[];
 const exact=all.filter(x=>x.row_type===row.row_type&&normalized(x.article)===normalized(row.article)&&Number(x.limit)===row.limit&&x.unit===row.unit);
 assert.equal(exact.length,1,"FSSAI Version IX master source drift: "+row.metal+" "+row.article+" "+row.limit);
 assert.equal(row.numeric_finished_product_compliance_auto_apply,false);
 assert.equal(row.counts_as_first_exact_product_article,false);
}
const fallback=m.rows.filter(x=>x.row_type==="default"),universal=m.rows.find(x=>x.row_type==="all_foods");
assert.equal(fallback.length,6);assert.ok(universal);
const records=ix.map(x=>({
 catalog_id:x.id,name:x.name,fssr:x.fssr,fcs:x.fcs,
 unresolved_first_exact_product_article:pending.has(x.id),
 methyl_mercury_source:{contaminant:universal.metal,article:universal.article,limit_mgkg:universal.limit,
  specifically_speciated_mercury_measurement_required:true,
  duplicate_total_mercury_compliance_asserted:false,first_exact_product_coverage_counted:false,
  sample_compliance_evaluated:false},
 fallback_review:pending.has(x.id)?fallback.map(a=>({metal:a.metal,source_limit_mgkg_review_only:a.limit,
   named_article:"Foods not specified",more_specific_named_article_hierarchy_resolved:false,
   automatically_applicable:false,counts_as_product_specific_exact_source:false,compliance_pass:false})):[],
 full_product_compliance_pass:false
}));
assert.equal(records.reduce((s,x)=>s+x.fallback_review.length,0),726);
assert.equal(records.filter(x=>x.fallback_review.length===6).length,121);
assert.ok(records.every(x=>x.methyl_mercury_source.limit_mgkg===0.25&&x.full_product_compliance_pass===false));
const report={official_source:m.source,source_version:m.source_version,total_products:533,universal_all_foods_source_coverage:533,
 pending_exact_product_evidence:121,partial_exact_product_evidence:412,
 fallback_metal_article_review_checks:726,first_exact_product_evidence_promoted:2,
 final_laboratory_compliance_passes:0,
 priority_policy:"Never use Foods not specified when a more specific named food article applies. Methyl Mercury all foods is a separate speciated analyte from total Mercury; neither is a lab PASS.",records};
fs.mkdirSync(path.join(root,"audit-output"),{recursive:true});
fs.writeFileSync(path.join(root,"audit-output/fssai-v9-all-533-methylmercury-and-121-fallback-source-review.json"),JSON.stringify(report,null,2)+"\n");
console.log("PASS: 533 universal Methyl Mercury source mappings; 121 x 6 = 726 fallback metal precedence reviews; 412 partial + 121 first-exact gaps; zero product PASS");
