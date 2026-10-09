#!/usr/bin/env node
"use strict";

/**
 * FSSAI/FoSCoS LOCAL product evidence inventory. This is NOT a legal opinion,
 * an exhaustive current FoSCoS export, or a per-product compliance pass.
 * Only the named official source files are used.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const helper = path.join(root, "fssai-product-helper-preview-01");
const dataDir = path.join(helper, "data");
const date = "2026-10-09";
const read = name => JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));
const index = read("standard-search-index-v1.json");
const special = read("rules/special-regulatory-routes-v1.json");
const bySpecialKey = new Map(special.routes.map(r => [r.key, r]));
const chapterCache = new Map();
const counts = {};
const tally = (group, name) => {
  const n = String(name || "not_recorded");
  (counts[group] ||= {})[n] = ((counts[group] || {})[n] || 0) + 1;
};
const official = url => {
  try {
    const {protocol, hostname} = new URL(url);
    return protocol === "https:" && (hostname === "fssai.gov.in" || hostname.endsWith(".fssai.gov.in"));
  } catch { return false; }
};
function chapterRecord(p) {
  const file = p.rule_file || p.chapter_rule_file;
  const key = p.rule_key || p.chapter_rule_key;
  assert.ok(file && key, "Missing chapter file/key: " + p.id);
  const abs = path.resolve(helper, file);
  assert.ok(abs.startsWith(path.join(dataDir, "rules") + path.sep), "Rule file escapes official rules directory: " + p.id);
  assert.ok(fs.existsSync(abs), "Missing chapter rule file: " + p.id);
  if (!chapterCache.has(abs)) chapterCache.set(abs, JSON.parse(fs.readFileSync(abs, "utf8")));
  const source = chapterCache.get(abs);
  const candidates = [
    ...(Array.isArray(source.standards) ? source.standards : []),
    ...(Array.isArray(source.identity_purity_standards) ? source.identity_purity_standards : []),
    ...(Array.isArray(source.other_substances) ? source.other_substances : [])
  ];
  const record = candidates.find(row => row.key === key) ||
    (source.standards && !Array.isArray(source.standards) ? source.standards[key] : null);
  assert.ok(record && typeof record === "object", "Unresolved exact chapter standard key: " + p.id + " [" + key + "]");
  const sourceUrls = (source.official_sources || []).map(x => typeof x === "string" ? x : x.url).filter(Boolean);
  assert.ok(sourceUrls.length > 0 && sourceUrls.every(official), "Non-official chapter source link: " + p.id);
  return {key, file, record, sourceUrls};
}
function sourcesForSpecial(route) {
  const urls = route.official_sources || (route.official_source ? [route.official_source] : []);
  assert.ok(urls.length && urls.every(official), "Missing/nonofficial special route evidence: " + route.key);
  return urls;
}

const appendixB = read("rules/appendix-b-v2-core.json");
const indexById = new Map(index.products.map(p => [p.id,p]));
const appendixBRoutes = new Map();
for (const [group, source] of Object.entries(appendixB.product_mappings)) {
  const buckets = Array.isArray(source) ? {[group]:source} : source;
  const table = appendixB.tables[group] || appendixB.tables.fish;
  const profiles = new Set((table.categories || []).map(p=>p.id));
  for(const type of ["exact","conditional","no_direct_table_mapping"]) {
    for (const mapping of (buckets[type] || [])) {
      assert.ok(mapping.catalog_id && indexById.has(mapping.catalog_id),"Appendix B references absent product: "+mapping.catalog_id);
      assert.ok(!appendixBRoutes.has(mapping.catalog_id),"Duplicate Appendix B mapping: "+mapping.catalog_id);
      const p=indexById.get(mapping.catalog_id);
      const expected = type==="exact" ? "mapped_appendix_b_v2" :
        type==="conditional" ? "conditional_appendix_b_variant_required" : null;
      if(expected)assert.equal(p.microbiology_status,expected,"Appendix B status/index mismatch: "+p.id);
      else assert.ok((p.microbiology_status||"").startsWith("appendix_b_no_direct"),"Appendix B no-direct status/index mismatch: "+p.id);
      const profileKeys = type==="exact" ? [mapping.profile_key] :
        type==="conditional" ? (mapping.options || []).map(option=>option.profile_key) : [];
      if(type==="exact")assert.equal(p.microbiology_profile_key,mapping.profile_key,"Appendix B profile/index mismatch: "+p.id);
      if(type==="conditional")assert.ok(profileKeys.length>0,"Conditional Appendix B route missing options: "+p.id);
      for (const key of profileKeys)if(key)assert.ok(profiles.has(key),"Appendix B mapping lacks real official Table profile: "+p.id+" ["+key+"]");
      if(type==="conditional")for(const option of mapping.options || []) {
        if(!option.profile_key)assert.ok(option.condition && (option.message || option.reason),"Fail-closed Appendix B variant must explain why no profile applies: "+p.id);
      }
      appendixBRoutes.set(p.id,{table:group,type,profile_keys:profileKeys});
    }
  }
}
for (const p of index.products) {
  const state=p.microbiology_status||"";
  if(["mapped_appendix_b_v2","conditional_appendix_b_variant_required","appendix_b_no_direct_table_mapping","appendix_b_no_direct_fish_table_mapping"].includes(state)){
    assert.ok(appendixBRoutes.has(p.id),"Indexed Appendix B route missing from official module: "+p.id);
  }
}

assert.equal(index.products.length, 533);
assert.equal(new Set(index.products.map(p=>p.id)).size, 533);
assert.equal(special.routes.length, 58);
assert.equal(bySpecialKey.size, 58);

const products = index.products.map(p => {
  let routeKind, rule, chapterStatus = "not_a_chapter_route";
  let numericCompositionPresent = false;
  let numericBaselineStatus = "not_recorded";
  let sourceUrls = [];
  const action = [];
  if(p.chapter_rule_link_status === "file_and_key_verified") {
    routeKind = "chapter_rule";
    const target = chapterRecord(p);
    sourceUrls = target.sourceUrls;
    rule = {file:target.file, key:target.key, record_status:target.record.status || "not_recorded"};
    numericCompositionPresent = (
      Array.isArray(target.record.composition) && target.record.composition.some(x=>Number.isFinite(x.value))
    ) || (
      Array.isArray(target.record.variant_composition) &&
      target.record.variant_composition.some(v=>Array.isArray(v.composition)&&v.composition.some(x=>Number.isFinite(x.value)))
    );
    if(target.record.numeric_evidence) {
      assert.ok(numericCompositionPresent,"Numeric source evidence without numeric standard: "+p.id);
      assert.equal(target.record.numeric_evidence.compliance_assessment_enabled,false,"Numeric baseline cannot enable compliance: "+p.id);
      numericBaselineStatus = "official_source_baseline_current_amendments_pending";
      action.push("Review later FSSAI amendments and select exact variant before applying numeric baseline");
    } else if(numericCompositionPresent) numericBaselineStatus = "numeric_data_present_not_independently_reviewed_by_this_audit";
    const explicitlyPartial = p.chapter_rule_scope === "identity_only_partial";
    chapterStatus = explicitlyPartial ? "identity_only_partial" : p.chapter_rule_scope === "official_clause_and_numeric_standard_pending_cross_layer" ? "cross_layer_validation_pending" : "direct_file_and_key_found_not_full_assessment";
    if(explicitlyPartial) action.push(numericBaselineStatus === "official_source_baseline_current_amendments_pending" ?
      "Complete current amendment, process/variant and cross-regulation verification; 2023 numeric baseline already transcribed" :
      "Complete and independently validate product-specific numeric/composition standard beyond identity");
    if(p.chapter_rule_scope === "official_clause_and_numeric_standard_pending_cross_layer") action.push("Validate remaining cross-regulatory applicability");
  } else {
    routeKind = "special_regulation";
    const route = bySpecialKey.get(p.regulatory_route_key);
    assert.ok(route && route.product_id === p.id, "Unresolved special route " + p.id);
    sourceUrls = sourcesForSpecial(route);
    rule = {file:p.regulatory_route_file,key:route.key,record_status:route.compliance_status || "not_recorded",route_kind:route.route_kind};
    action.push("Check special category conditions; FCS or ingredient identity is not a standalone finished-food permission");
    if(route.compliance_status === "complete" || route.compliance_pass_enabled === true) throw new Error("Special route incorrectly asserts compliance: " + p.id);
  }
  let micro = p.microbiology_status || "not_recorded_in_search_index";
  if(micro === "conditional_appendix_b_variant_required") action.push("Confirm manufacturing process, food variant and the exact Appendix B sampling criteria");
  if(micro === "not_recorded_in_search_index") action.push("Review whether microbiology applies; missing index flag does not mean not applicable");
  if(micro.startsWith("appendix_b_no_direct")) action.push("Check other relevant microbiology requirements; no direct Appendix B table mapping is not an exemption");
  if(p.appendix_fcs_status !== "mapped_current_v3") action.push("Reconcile Appendix A category classification or special exclusion before additive assessment");
  if(p.appendix_fcs_status === "mapped_current_v3") action.push("Evaluate additives at exact category/ingredient, amount, technological function and applicable notes");
  tally("route", routeKind);
  tally("chapter_evidence", chapterStatus);
  tally("microbiology", micro);
  tally("appendix_a_category", p.appendix_fcs_status);
  if(numericBaselineStatus !== "not_recorded")tally("numeric_baseline_status",numericBaselineStatus);
  if(numericCompositionPresent) tally("composition_evidence", "has_some_numeric_values");
  else tally("composition_evidence", "no_numeric_composition_in_linked_standard_record");
  return {
    id:p.id, name:p.name, category:p.category, fcs:p.fcs, fssr:p.fssr,
    route:routeKind, rule, chapter_evidence:chapterStatus,
    numeric_composition_values_present:numericCompositionPresent,
    numeric_baseline_status:numericBaselineStatus,
    microbiology_index_status:micro,
    appendix_b_evidence_route:appendixBRoutes.get(p.id) || null,
    microbiology_profile_key:p.microbiology_profile_key || null,
    microbiology_candidates_count:(p.microbiology_candidates || []).length,
    appendix_a_category:p.appendix_fcs || null,
    appendix_a_category_status:p.appendix_fcs_status,
    official_source_urls:sourceUrls,
    compliance_decision:"not_established_by_route_evidence",
    cross_layer_validation:{
      composition:"requires_product_specific_review",
      additives:"requires_exact_applicability_check",
      contaminants_and_residues:"not_independently_assessed_in_this_audit",
      appendix_b_microbiology:"requires_applicability_review",
      appendix_c_processing_aids:"not_independently_assessed_in_this_audit",
      labelling_packaging_claims:"not_independently_assessed_in_this_audit",
      ifct_nutrition:"separate_official_ICMR_NIN_evidence_layer"
    },
    next_checks:action
  };
});
assert.equal(counts.route.chapter_rule,475);
assert.equal(counts.route.special_regulation,58);
const report = {
  schema_version:"1.0", as_of:date, branch:"gh-pages",
  disclaimer:"Evidence inventory only: 533/533 LOCAL routes, not all current FoSCoS products and not full compliance verification. No per-product legal PASS is produced.",
  official_source_policy:"FSSAI/FoSCoS exclusively; separate nutrition source is ICMR-NIN IFCT.",
  summary:{loaded:products.length,counts,appendix_b_explicit_mappings_cross_checked:appendixBRoutes.size,items_requiring_full_compliance_review:products.length},
  products
};
const output=path.join(root,"audit-output");
fs.mkdirSync(output,{recursive:true});
const outputFile=path.join(output,"fssai-product-readiness-audit.json");
fs.writeFileSync(outputFile,JSON.stringify(report,null,2)+"\n");
const summary = [
  "## PMSV FSSAI product evidence — 09 October 2026",
  "",
  "**Local product routes: 533/533. Product-specific compliance PASS: not established.**",
  "",
  "| Evidence layer | Count |",
  "|---|---:|",
  "| Chapter keys resolve to local rule entries | 475 |",
  "| Special FoSCoS/FSSAI identity/category routes | 58 |",
  "| Chapter entries explicitly identity-only partial | "+(counts.chapter_evidence.identity_only_partial||0)+" |",
  "| Source-transcribed numeric baselines with current amendment review pending | "+(counts.numeric_baseline_status.official_source_baseline_current_amendments_pending||0)+" |",
  "| Appendix B conditional, variant-dependent routes | "+(counts.microbiology.conditional_appendix_b_variant_required||0)+" |",
  "| Appendix B exact/conditional/no-direct mappings cross-checked against Table profiles | "+appendixBRoutes.size+" |",
  "| Microbiology absent from lightweight search index (not necessarily exempt) | "+(counts.microbiology.not_recorded_in_search_index||0)+" |",
  "| All product-specific compliance outcomes independently verified | 0 claimed |",
  "",
  "Download the full 533-row JSON artifact from this workflow run. A chapter key resolving or an FCS classification is **not** proof of regulatory conformity."
].join("\n");
console.log(summary);
if(process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary+"\n");
console.log("PASS: saved "+products.length+" product-by-product evidence statuses in "+outputFile);
