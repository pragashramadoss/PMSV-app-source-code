#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const dir=path.join(root,"fssai-product-helper-preview-01/data");
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),"utf8"));
const idx=read("standard-search-index-v1.json").products;
const base=read("rules/fssai-next121-positive-subtype-proof-2026-10-11.json");
const ar=read("rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json");
const gr=read("rules/fssai-other-foodgrains-b1-first-source-2026-10-11.json");
const last=read("rules/fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json");
const groups=[
 read("rules/fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json"),
 read("rules/fssai-14-sugar-egg-confection-source-gates-2026-10-11.json"),
 read("rules/fssai-2026-10-11-cross-form-nontransfer-large-batch.json")
];
const core=read("rules/contaminants-v9-core.json");
const chapter=read("rules/chapter-2-5-meat-eggs-v1.json");
const all=new Map(idx.map(p=>[p.id,p]));
const first=new Map(base.records.map(r=>[r.catalog_id,r]));
assert.equal(idx.length,533);assert.equal(first.size,121);
assert.equal(last.catalogue,533);assert.equal(last.historic_first_source_partial,415);
assert.equal(last.historic_first_source_pending,118);assert.equal(last.updated_partial,417);
assert.equal(last.updated_pending,116);assert.equal(last.new_positive_first_source,2);
assert.equal(last.new_still_unresolved,26);assert.equal(last.complete_regulatory_compliance_approvals,0);
assert.equal(last.official_contaminants_source,core.official_sources[0].url);
assert.equal(last.source_version,core.source_version);
assert.equal(last.official_rabbit_source,chapter.official_sources[0].url);
assert.ok(chapter.standards.some(x=>x.key==="2.5.2(6)"&&/rabbit/i.test(x.name)));
const vet=core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits;
assert.equal(vet.completeness,"complete");assert.equal(vet.auto_apply,false);
const row=vet.rows.filter(x=>x.serial===48&&x.name==="Xylazine");
assert.equal(row.length,1);
const positives=new Set;
for(const p of [...ar.records,{catalog_id:gr.catalog_id},...last.positive_records]){
 assert.ok(first.has(p.catalog_id)&&all.has(p.catalog_id));
 assert.ok(!positives.has(p.catalog_id));positives.add(p.catalog_id);
}
assert.equal(positives.size,5);
for(const p of last.positive_records){
 const food=all.get(p.catalog_id);
 assert.equal(p.product_name,food.name);assert.equal(p.fssr,food.fssr);assert.equal(p.fcs,food.fcs);
 assert.equal(p.source_status,"PARTIAL_EXACT_VETERINARY_EDIBLE_TISSUE_ARTICLE");
 assert.equal(p.official_product_clause,"2.5.2(6)");
 assert.equal(p.official_product_standard,last.official_rabbit_source);
 assert.equal(p.official_ctr,last.official_contaminants_source);
 assert.equal(p.limit,0.01);assert.equal(p.unit,"mg/kg");assert.equal(p.analyte,"Xylazine");
 assert.equal(p.automatic_lot_compliance_pass,false);assert.equal(p.complete_source_panel,false);
 assert.equal(row[0].rows.filter(x=>x.article===p.article&&Number(x.limit)===p.limit&&x.unit===p.unit).length,1);
 assert.ok(!core.chapter_2_5_locked_fresh_meat_routes_v9.filter(x=>x.catalog_ids.includes(p.catalog_id)).every(x=>x.contaminant!=="Lead"||x.status!=="locked_no_exact_current_article"));
}
const already=new Set([...groups[0].records,...groups[1].records,...groups[2].records].map(p=>p.catalog_id));
assert.equal(already.size,90);
assert.equal(last.positive_records.length+last.pending_records.length,28);
const still=new Set(last.pending_records.map(x=>x.catalog_id));
assert.equal(still.size,26);
for(const r of last.pending_records){
 const p=all.get(r.catalog_id);
 assert.ok(first.has(r.catalog_id));assert.ok(p);
 assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);assert.equal(r.fcs,p.fcs);
 assert.equal(r.first_exact_contaminant_source_found,false);
 assert.equal(r.numeric_limit_auto_applied,false);assert.equal(r.finished_lot_compliance_pass,false);
 assert.ok(r.positive_proof_needed&&r.do_not_inherit);
}
const reviewed=new Set([...already,...still,...last.positive_records.map(x=>x.catalog_id)]);
assert.equal(reviewed.size,118);
const historic118=new Set([...first.keys()].filter(x=>![...ar.records.map(y=>y.catalog_id),gr.catalog_id].includes(x)));
assert.deepEqual(reviewed,historic118);
const unresolved=[...first.values()].filter(x=>!positives.has(x.catalog_id)).map(x=>({
 catalog_id:x.catalog_id,product_name:x.product_name,status:"FIRST_EXACT_SOURCE_PENDING",
 source_proven:false,lot_compliance_pass:false
}));
assert.equal(unresolved.length,116);assert.equal(533-116,417);
const report={as_of:"2026-10-11",schema_version:"2.0",official_source:core.official_sources[0].url,
 total:533,partial_first_source_matches:417,still_without_first_source:116,compliance_approvals:0,
 historical_partial:415,historical_pending:118,new_positive_veterinary_products:last.positive_records,
 recent_research_coverage:118,exact_first_source_matched_product_ids:[...positives],unresolved};
fs.mkdirSync(path.join(root,"audit-output"),{recursive:true});
const dst=path.join(root,"audit-output/fssai-current-first-source-533-reconciliation-v2.json");
fs.writeFileSync(dst,JSON.stringify(report,null,2)+"\n");
console.log("PASS 533: 417 partial exact first-source; 116 still pending; 0 compliance approvals.");
console.log("PASS two rabbit veterinary Xylazine 0.01 mg/kg records sourced to Version IX and FSSR 2.5.2(6).");
console.log("PASS 118 recently outstanding identities covered: 90 earlier + 28 new (26 pending, 2 positively source-matched).");
console.log("REPORT "+dst);
