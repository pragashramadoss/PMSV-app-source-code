#!/usr/bin/env node
"use strict";
/** Evidence triage, NOT a substitute for product-specific regulatory verification. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),out=path.join(root,"audit-output");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const report=read("audit-output/fssai-product-readiness-audit.json");
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const master=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json");
assert.equal(report.products.length,533);
assert.equal(master.products.length,533);
const source=db.official_sources[0].url;
assert.match(source,/^https:\/\/(?:www\.)?fssai\.gov\.in\//);
const requirements={
 "2.1":{label:"dairy_subtype_and_processing_basis",why:"Check if the official article is liquid milk, a milk-powder variant, secondary milk product, analogue, or ingredient-only material; never interchange product forms.",needs:["Milk subtype and concentration factor","Exact metal and Aflatoxin M1 article","Milk-product pesticide commodity/residue basis"]},
 "2.2":{label:"edible_oil_fat_technology",why:"Specific vegetable oil or fat and processing method must match a named official article; no transfer between crude, refined, hydrogenated or interesterified oils.",needs:["Exact source oil/fat and processing form","Individual metal table articles","Applicable residues and amendments"]},
 "2.3":{label:"fruit_vegetable_raw_processed_scope",why:"Fresh commodity, dried/canned or concentrated product articles are not interchangeable; pesticide raw-ingredient references do not establish a processed finished-product limit.",needs:["Produce type, processing and packaging","Finished-product metal or toxin article","Raw pesticide MRL and processing-factor applicability"]},
 "2.4":{label:"cereal_pulse_flour_composite_scope",why:"Distinguish raw cereal, cereal flour, pulses, oilseed derivatives, starches and composite bakery foods. Grouped toxin articles need the correct finished matrix.",needs:["Exact raw grain or processed food form","Grouped mycotoxin article and constituent ingredients","Pesticide residue article and processing factor"]},
 "2.5":{label:"meat_species_egg_tissue_processing",why:"Species, tissue, shell-free egg basis and processing determine whether meat, egg, metal, veterinary and pesticide articles apply.",needs:["Species, edible tissue and processing state","Residue definition and sampling basis","Species-specific metal article"]},
 "2.6":{label:"seafood_species_processing_and_residues",why:"Fishery product species and smoked/canned/processed form determine PCBs, PAH, metals, biotoxins, histamine and residual scopes.",needs:["Species and freshwater/marine basis","Exact process and package","Applicable biotoxin/PCB/PAH/histamine rules"]},
 "1.3":{label:"alcoholic_beverage_special_rule",why:"Alcoholic beverage category and manufacturing form need explicit NOTS and other contaminants checks.",needs:["Beverage category","Current FSSAI Alcoholic Beverages Regulations","Residue scopes"]},
 "3.1":{label:"alcoholic_beverage_special_rule",why:"Wine product subtype determines regulation and applicable contaminant articles.",needs:["Finished wine variant","Special FSSAI beverages regulations","Residue scopes"]},
 "3.2":{label:"alcoholic_beverage_special_rule",why:"Alcoholic beverage subtype needs applicable FSSAI finished-food article and current regulations.",needs:["Beverage variant","Special FSSAI regulations","Residue scopes"]},
 "2.7":{label:"chocolate_confectionery_finished_article_lock",why:"Existing explicit Chapter 2.7 locks prevent transfer of Cocoa Powder or Hard Candy limits to cocoa mass, chocolate, cocoa mixtures or other confectionery.",needs:["Exact finished-food article and source amendment","Ingredient-level duties assessed separately","Do not override explicit fail-closed lock"]},
 "2.8":{label:"sugar_syrup_sweetener_identity_or_ash_gate",why:"Sugar type and sulphated ash, syrup processing, bee-product identity or sweetener salt determine source-metal article applicability.",needs:["Exact sweetener/sugar identity","Sulphated-ash qualifier when applicable","Bee-product or ingredient-specific route"]},
 "2.9":{label:"spice_ingredient_or_processed_form",why:"Spice mixtures, oleoresins and seasonings need ingredient and finished-food classification rather than indiscriminate dried-spice limits.",needs:["Single spice versus seasoning or extract","Final food form and ingredient quantities","Exact contaminant article and amendments"]},
 "2.10":{label:"beverage_liquid_dry_concentrate",why:"Dry tea or coffee mixtures, water, concentrates and finished beverages have different limits and cannot inherit one another's articles.",needs:["Prepared versus dry product and dilution","Exact beverage/coffee commodity article","Water or processing-specific regulations"]},
 "2.11":{label:"miscellaneous_finished_substance",why:"Miscellaneous food, ingredient or material must be assessed against its named contaminant article and functional use.",needs:["Actual finished-food status","Ingredient or additive purity standards","Relevant contaminant amendment"]},
 "2.16":{label:"hemp_seed_derivative",why:"Hemp seeds, hemp seed oil and hemp flour are not equivalent finished articles; check hemp-specific source standards first.",needs:["Seed/oil/flour variant","Hemp-specific controls and contaminants","Applicable amendments and ingredient requirements"]},
 "3.3":{label:"novel_sugar_ingredient",why:"Trehalose substance identity and manufacturing standards must be checked; generic sugar contaminant limits are not presumed.",needs:["Exact substance purity specification","Applicable contaminant metal article","Operative regulation and amendment"]},
 "special":{label:"special_foscos_category_or_composite",why:"FoSCoS FCS or ingredient identity is not a standalone contaminant limit. Identify the actual food, recipe and ingredient classification first.",needs:["Exact special-regulation and composition route","Substance-specific source quality or food-matrix article","Effective amendments and all applicable residue scopes"]}
};
const codeOf=p=>(String(p.fssr||"").match(/^(\d+\.\d+)/)||[])[1]||"special";
const rows=report.products.map(p=>{
 const current=p.contaminant_evidence_index;
 assert.ok(current&&current.status,"missing evidence status "+p.id);
 const chapter=codeOf(p),scope=requirements[chapter];
 assert.ok(scope,"unclassified regulatory chapter "+chapter+" "+p.id);
 const hasExact=current.status==="some_exact_product_evidence_not_full_coverage";
 const refs=[
  ...(current.chapter_2_3_pesticide_commodity_review?.raw_ingredient_reference_articles||[]),
  ...(current.chapter_2_4_pesticide_commodity_review?.candidate_articles||[]),
  ...(current.chapter_2_5_pesticide_commodity_review?.candidate_articles||[])
 ];
 return {catalog_id:p.id,product_name:p.name,fssr:p.fssr,fcs:p.fcs,chapter,
  evidence_status:current.status,
  evidence_disposition:hasExact?"exact_source_evidence_partial_other_rules_unassessed":"no_verified_exact_product_article_in_current_automated_index",
  regulatory_review_bucket:scope.label,regulatory_scope_explanation:scope.why,
  source_commodity_candidates_review_only:[...new Set(refs)],
  scope_requirements:scope.needs,
  audited_rule_evidence_kinds:current.exact_evidence_kinds||[],
  explicit_finished_product_article_lock:current.finished_product_article_review||null,
  source_version:db.source_version,official_contaminants_url:source,
  source_full_compliance_verified:false,automatic_missing_limit_inference_allowed:false,
  next_checks:p.next_checks||[]};
});
const pending=rows.filter(r=>r.evidence_disposition==="no_verified_exact_product_article_in_current_automated_index");
assert.equal(rows.length,533);
assert.equal(pending.length,report.summary.counts.contaminant_evidence.no_exact_catalog_evidence_in_this_inventory+
 (report.summary.counts.contaminant_evidence.only_family_fssr_evidence_needs_identity_review||0));
const groups=Object.groupBy(pending,r=>r.regulatory_review_bucket);
const summary={catalogue_size:rows.length,exact_partial:rows.length-pending.length,
 without_verified_exact_source_article:pending.length,unclassified_identity:0,
 legal_full_compliance_pass_claims:0,automatic_generic_limit_inference:false,
 scope_triage_recorded_for_all_loaded_products:true,
 disclaimer:"Scope triage documents required regulatory checks. It does NOT verify "+pending.length+" unresolved product identity reviews, establish an exemption or grant a compliance pass.",
 official_source_url:source};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"fssai-contaminant-evidence-disposition-533.json"),JSON.stringify({summary,rows},null,2)+"\n");
const md=["# PMSV FSSAI exact contaminant-evidence scope disposition","",
 "All "+rows.length+" local product identities have a recorded regulatory scope/next-step disposition; **this is NOT complete contaminant verification**.","",
 "| Result | Count |","|---|---:|","| Some exact source-backed evidence (partial) | "+summary.exact_partial+" |",
 "| No verified exact article in automated index; applicability still requires review | "+pending.length+" |",
 "| Unclassified scope rows | 0 |","","## Pending by regulatory scope","",
 "| Review type | Identities |","|---|---:|",
 ...Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([name,list])=>"| "+name+" | "+list.length+" |"),
 "","Reference-only commodity candidate rows are NOT automatically applicable numeric MRLs. This report does not claim full legal compliance for any of the 533.","",
 "See JSON for all product names, FSSR/FCS identities, official source link, exclusion logic and next checks."];
fs.writeFileSync(path.join(out,"fssai-contaminant-evidence-disposition-summary.md"),md.join("\n")+"\n");
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,md.join("\n")+"\n");
console.log("PASS: triaged all 533 local identity scopes; exact partial="+summary.exact_partial+"; still lacking verified exact source evidence="+pending.length+"; zero unclassified.");
