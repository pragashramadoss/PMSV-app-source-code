#!/usr/bin/env node
"use strict";
/**
 * Product-specific source evidence handoff for all remaining 123 FoSCoS products.
 * All candidate values remain REVIEW ONLY; this job is not a compliance engine.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const ledger=load("audit-output/fssai-live-first-source-ledger-533.json");
const products=load(base+"standard-search-index-v1.json").products;
const source=load(base+"rules/contaminants-v9-unresolved-264-review-v1.json").records;
const audit=load("audit-output/fssai-product-readiness-audit.json").products;
const cross=load(base+"rules/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.json");
const indexed=new Map(products.map(p=>[p.id,p]));
const historic=new Map(source.map(p=>[p.catalog_id,p]));
const examined=new Map(audit.map(p=>[p.id,p]));
const remaining=ledger.pending_product_details;
assert.deepEqual([ledger.product_count,ledger.partial_first_source_evidence,ledger.unresolved_first_source_gaps,ledger.legal_or_laboratory_compliance_passes],[533,410,123,0]);
assert.equal(remaining.length,123);
assert.equal(new Set(remaining.map(x=>x.id)).size,123);
assert.equal(indexed.size,533);
const fallback={
 "2.1":["Confirm whether the product contains dairy milk or is an analogue/non-dairy food","Confirm exact standardized finished form and processing state","Establish fat basis, concentration factor and reconstitution state","Find exact named metal/toxin/pesticide article, not ingredient-only milk row","Review effective amendments and sample analytical/residue definitions"],
 "2.3":["Confirm botanical food species and named raw commodity","Identify frozen, dried, canned, fermented, pureed or composite processing","Verify packing material and can/sterilization conditions","Distinguish finished food from raw-fruit, vegetable or ingredient-specific pesticide rows","Reconcile named article, sample basis and effective FSSAI amendments"],
 "2.4":["Confirm cereal, pseudo-cereal, pulse, seed or tuber source","Prove actual ingredient composition rather than options in a standard","Distinguish grain from flour, baked product and prepared food","Check explicit article exclusions and commodity-specific pesticide scope","Verify source row, unit, basis and latest amendments"],
 "2.5":["Confirm exact species and edible tissue or processed egg form","Keep veterinary-drug muscle, organ and egg commodity MRLs separate","Document processing and ingredient-to-finished-product residue basis","Identify current contaminant, pesticide and veterinary-drug articles independently","Check analytical residue definition and effective amendments"],
 "2.8":["Determine exact sugar or syrup identity and manufacturing route","Confirm measured sulphated ash rather than assuming total ash equivalence","Test whether named CTR threshold operator is actually satisfied","Do not inherit refined sugar thresholds from optional sugar ingredients","Verify source and current amendments before any numeric application"],
 special:["Determine operative special FoSCoS regulation and source route","Confirm formula ingredient-by-ingredient and finished matrix","Do not transfer raw seed, nut, cereal or milk limits by recipe name","Identify exact CTR article and any processing or use-condition exclusions","Check lab basis, legal amendments, chemical and pesticide categories"]
};
const pickDefaults=family=>fallback[family]||[
 "Confirm the exact legally standardized finished product identity",
 "Confirm composition, botanical/animal species and ingredient proportions",
 "Establish processing state, packaging, sample basis and intended use",
 "Match the complete named regulatory commodity and analyte without inheritance",
 "Check relevant official amendments, residue definitions and laboratory conditions"];
const clean=x=>String(x||"").replace(/\s+/g," ").trim();
function harvest(node,out,depth=0){
 if(!node||depth>5||out.length>=25)return;
 if(Array.isArray(node)){for(const x of node)harvest(x,out,depth+1);return;}
 if(typeof node==="string"){let v=clean(node);if(v.length>28&&v.length<460)out.push(v);return;}
 if(typeof node==="object"){
  for(const [k,v] of Object.entries(node)){
   if(/qualifier|question|prohibited_limit_transfer|nontransfer|required.*confirm|existing_precision_source_gate|source_qualifying|source_gates/i.test(k))harvest(v,out,depth+1);
  }
 }
}
const outputs=remaining.map((x,i)=>{
 const p=indexed.get(x.id),old=historic.get(x.id),r=examined.get(x.id);
 assert.ok(p&&old&&r,"Pending product identity missing: "+x.id);
 for(const k of ["name","fssr","fcs"])assert.equal(p[k],r[k],"Catalogue/readiness mismatch for "+x.id);
 assert.equal(old.catalog_id,x.id);assert.equal(old.product_name,x.name);
 assert.equal(old.auto_apply_numeric_limit,false);assert.equal(old.unconditional_compliance_pass,false);assert.equal(old.exemption_asserted,false);
 assert.equal(r.compliance_decision,"not_established_by_route_evidence");
 const articleGates=cross.scope_guards.filter(g=>g.catalog_id===x.id).map(g=>({
  source_reference_id:g.reference_id,
  named_official_source_article:cross.named_source_rows.find(s=>s.id===g.reference_id)?.article||"",
  source_limit_review_only:cross.named_source_rows.find(s=>s.id===g.reference_id)?.limit,
  unit:cross.named_source_rows.find(s=>s.id===g.reference_id)?.unit||"",
  required_applicability_or_exclusion:g.required_qualifier,
  is_applied:false
 }));
 const extracted=[];
 for(const [key,value] of Object.entries(old)){
  if(/2026_10_11|2026_10_10/.test(key)&&typeof value==="object")harvest(value,extracted);
 }
 const qs=[...articleGates.map(g=>g.required_applicability_or_exclusion),...extracted,...pickDefaults(x.family)];
 const questions=[...new Set(qs.map(clean).filter(v=>v.length>25))].slice(0,16);
 assert.ok(questions.length>=5,x.id);
 return {
  priority:i+1,catalog_id:x.id,product:x.name,fssr:x.fssr,fcs:x.fcs,family:x.family,
  status:"UNRESOLVED_FIRST_EXACT",official_fssai_ctr_source:cross.source,
  case_specific_questions:questions,
  named_article_references_review_only:articleGates,
  supporting_source_urls:(r.official_source_urls||[]).filter(u=>/^https:\/\/(www\.)?fssai\.gov\.in\//.test(u)).slice(0,10),
  required_evidence:["exact operative named article","identity and processing qualification","analytical/residue basis","effective amendment verification","sample measurement before compliance determination"],
  numeric_finished_product_limit_applied:false,first_exact_source_confirmed:false,full_compliance_pass:false,
  exemption_asserted:false};
});
const esc=x=>'"'+String(x??"").replaceAll('"','""')+'"';
const cols=["priority","catalog_id","product","fssr","fcs","family","status","case_specific_questions","named_article_references_review_only","official_fssai_ctr_source","numeric_finished_product_limit_applied","first_exact_source_confirmed","full_compliance_pass"];
const csv=[cols.join(","),...outputs.map(r=>cols.map(k=>esc(Array.isArray(r[k])?r[k].map(v=>typeof v==="string"?v:JSON.stringify(v)).join(" | "):r[k])).join(","))].join("\n")+"\n";
const dir=path.join(root,"audit-output");
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,"fssai-next-123-first-exact-source-research-queue.csv"),csv);
fs.writeFileSync(path.join(dir,"fssai-next-123-first-exact-source-research-queue.json"),
 JSON.stringify({snapshot:"2026-10-11",source:"generated-live-533-ledger",total:533,pending:123,partial:410,full_compliance_passes:0,
 guard_source_rows:cross.named_source_rows.length,scope_nontransfer_cases:cross.scope_guards.length,
 products_with_scope_nontransfer_cases:outputs.filter(x=>x.named_article_references_review_only.length>0).length,
 records:outputs},null,2)+"\n");
console.log("Generated 123 individual FSSAI source-verification worklists; "+cross.scope_guards.length+" nontransfer cases; 0 numeric approvals");
