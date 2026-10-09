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
const contaminants = read("rules/contaminants-v9-core.json");
const normalizeArticle = x => String(x || "").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const directContaminantProfiles = new Map();
for(const profile of contaminants.profiles || []){
  for(const id of profile.catalog_ids || []){
    assert.ok(index.products.some(p=>p.id===id),"Contaminant profile references unknown catalogue product: "+id);
    if(!directContaminantProfiles.has(id))directContaminantProfiles.set(id,[]);
    directContaminantProfiles.get(id).push({id:profile.id,rows:(profile.rules || []).length});
  }
}
const contaminantAliases = new Map((contaminants.explicit_metal_alias_mappings_v9 || []).map(row=>[row.product_id,row]));
const contaminantDirectStandards = new Map((contaminants.direct_product_standard_contaminant_rules_v1 || []).map(row=>[row.catalog_id,row]));
const spiceAflatoxinIds = new Set((contaminants.spice_crop_contaminant_identity_mappings_v9 || []).map(row=>row.catalog_id));
const exactContaminantArticles = new Set(Object.values(contaminants.metal_article_rules_v9 || {})
  .flatMap(rows=>(rows || []).map(row=>normalizeArticle(row.article))));
const familyContaminantProfiles = (contaminants.profiles || []).filter(p=>Array.isArray(p.match_fssr) && p.match_fssr.length);
const chapter27Locks = (contaminants.chapter_2_7_locked_contaminant_routes_v9 || []);
const lockById = new Map(chapter27Locks.map(x=>[x.catalog_id,x]));
assert.equal(chapter27Locks.length,6,"Expected six reviewed Chapter 2.7 contaminant locks");
assert.equal(lockById.size,6,"Duplicate Chapter 2.7 lock identity");
const version9Source=contaminants.official_sources?.[0]?.url || "";

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
assert.ok(official(version9Source),"Missing official FSSAI current contaminant compendium source");
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
const meatEggCommodityReviews = contaminants.chapter_2_5_commodity_mrl_review_v1 || [];
const meatEggCommodityById = new Map(meatEggCommodityReviews.map(row=>[row.catalog_id,row]));
assert.equal(meatEggCommodityReviews.length,37,"Expected 37 Chapter 2.5 meat/egg commodity review records");
assert.equal(meatEggCommodityById.size,37,"Duplicate Chapter 2.5 review identity");
const currentPesticideArticles=new Set(
  (contaminants.residue_mrls?.pesticides||[])
  .flatMap(p=>(p.rows||[]).map(r=>String(r.food||"").trim().toLowerCase()))
);
for(const row of meatEggCommodityReviews){
 const indexed=index.products.find(p=>p.id===row.catalog_id);
 assert.ok(indexed && String(indexed.fssr||"").startsWith("2.5"),"Non-Chapter 2.5 MRL candidate: "+row.catalog_id);
 assert.equal(row.auto_apply_commodity_mrl,false,"Unsafe unqualified pesticide candidate activation "+row.catalog_id);
 assert.equal(row.full_product_regulatory_approval,false,"Premature contaminant compliance approval "+row.catalog_id);
 assert.ok(row.candidate_commodity_articles.length>0,row.catalog_id);
 for(const article of row.candidate_commodity_articles)
   assert.ok(currentPesticideArticles.has(String(article).toLowerCase()),"Missing official FSSAI pesticide commodity article "+article);
}
const fruitVegReviews=contaminants.chapter_2_3_commodity_mrl_review_v1||[];
const fruitVegById=new Map(fruitVegReviews.map(x=>[x.catalog_id,x]));
const chapter23Products=index.products.filter(p=>String(p.fssr||"").startsWith("2.3."));
assert.equal(chapter23Products.length,98,"Chapter 2.3 catalogue count changed: reconcile review identities");
assert.equal(fruitVegReviews.length,98,"Expected 98 Chapter 2.3 pesticide scope review records");
assert.equal(fruitVegById.size,98,"Duplicate Chapter 2.3 review product ID");
for(const product of chapter23Products)assert.ok(fruitVegById.has(product.id),"Missing Chapter 2.3 regulatory review: "+product.id);
for(const row of fruitVegReviews){
 const product=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(product&&String(product.fssr||"").startsWith("2.3."),"Non-Chapter 2.3 reference leaked: "+row.catalog_id);
 assert.deepEqual(row.candidate_finished_product_pesticide_articles,[],row.catalog_id+" cannot approve unverified finished pesticide article");
 assert.equal(row.auto_apply_raw_ingredient_mrl,false,row.catalog_id+" cannot automatically inherit precursor MRL");
 assert.equal(row.full_product_regulatory_approval,false,row.catalog_id+" must not mark full regulatory compliance");
 assert.ok(official(row.source_url),row.catalog_id+" source URL must remain official FSSAI");
 const rowCount=(contaminants.residue_mrls?.pesticides||[]).reduce((n,pest)=>
  n+(pest.rows||[]).filter(r=>(row.raw_ingredient_article_references_only||[]).some(a=>normalizeArticle(a)===normalizeArticle(r.food))).length,0);
 assert.equal(row.raw_reference_rows_in_loaded_official_source,rowCount,row.catalog_id+" pesticide-reference source count mismatch");
 for(const article of row.raw_ingredient_article_references_only||[])
   assert.ok(currentPesticideArticles.has(article.toLowerCase()),row.catalog_id+" cites unknown official pesticide article "+article);
}
const cerealReviews=contaminants.chapter_2_4_commodity_mrl_review_v1||[];
const cerealById=new Map(cerealReviews.map(x=>[x.catalog_id,x]));
const chapter24Products=index.products.filter(p=>String(p.fssr||"").startsWith("2.4."));
assert.equal(cerealReviews.length,77,"Expected all 77 Chapter 2.4 review entries");
assert.equal(cerealById.size,77,"Duplicate cereal product review");
assert.equal(chapter24Products.length,77,"Chapter 2.4 catalogue count changed: inspect missing/new product identities");
for(const product of chapter24Products)assert.ok(cerealById.has(product.id),"Missing exact Chapter 2.4 review: "+product.id);
for(const entry of cerealReviews){
 const product=index.products.find(p=>p.id===entry.catalog_id);
 assert.ok(product&&String(product.fssr||"").startsWith("2.4."),"Cross-category cereal review leaked: "+entry.catalog_id);
 assert.equal(entry.auto_apply_commodity_mrl,false,entry.catalog_id+" pesticide review must remain not applied");
 assert.equal(entry.auto_apply_aflatoxin_category,false,entry.catalog_id+" mycotoxin review must remain conditional");
 assert.equal(entry.full_product_regulatory_approval,false,entry.catalog_id+" product approval not established");
 const rowCount=(contaminants.residue_mrls?.pesticides||[]).reduce((n,pesticide)=>
    n+(pesticide.rows||[]).filter(x=>(entry.candidate_commodity_articles||[]).some(article=>String(x.food||"").trim().toLowerCase()===article.toLowerCase())).length,0);
 assert.equal(entry.candidate_rows_in_loaded_official_source,rowCount,entry.catalog_id+" MRL source count changed");
 for(const article of entry.candidate_commodity_articles||[])assert.ok(currentPesticideArticles.has(article.toLowerCase()),"Unknown FSSAI cereal MRL article: "+article);
}
const alcoholic=contaminants.chapter_14_2_verified_alcoholic_beverage_nots_v9;
assert.ok(alcoholic && official(alcoholic.official_source_url),"Official FSSAI grouped alcoholic beverage article missing");
assert.equal(alcoholic.article,"Alcoholic beverages");
assert.equal(alcoholic.verified_finished_product_identities.length,27);
assert.equal(alcoholic.rules.length,4);
assert.equal(alcoholic.complete_contaminant_coverage,false);
assert.equal(alcoholic.amendments_fully_reconciled,false);
assert.equal(alcoholic.automatic_other_contaminants_or_pesticide_mrl_approval,false);
const alcoholicById=new Map(alcoholic.verified_finished_product_identities.map(x=>[x.catalog_id,x]));
assert.equal(alcoholicById.size,27,"Duplicate alcoholic beverage product identity");
const officialAlcoholicFcs=index.products.filter(x=>String(x.fcs||"").startsWith("14.2."));
assert.deepEqual(new Set(alcoholicById.keys()),new Set(officialAlcoholicFcs.map(x=>x.id)),"Alcoholic catalog scope changed");
for(const item of alcoholic.verified_finished_product_identities){
 const product=index.products.find(x=>x.id===item.catalog_id);
 assert.ok(product && item.product_name===product.name && item.fcs===product.fcs,"Alcoholic beverage identity drift "+item.catalog_id);
 assert.equal(item.finished_alcoholic_beverage_identity,true);
}
for(const r of alcoholic.rules){
 assert.ok((contaminants.naturally_occurring_toxic_substances?.[r.key]||[]).some(x=>
   x.article==="Alcoholic beverages" && Number(x.limit)===Number(r.limit) && x.unit===r.unit),
 "FSSAI Version IX alcoholic article/limit drift: "+r.key);
}
for(const id of alcoholic.excluded_nearby_catalog_ids||[])assert.ok(!alcoholicById.has(id),"Nonalcoholic catalogue leakage "+id);
const namedCropMappings=contaminants.explicit_crop_contaminant_article_mappings_v9||[];
const namedCropById=new Map(namedCropMappings.map(x=>[x.catalog_id,x]));
assert.equal(namedCropMappings.length,3,"Expected three exact named crop-toxin mappings");
assert.equal(namedCropById.size,3,"Duplicate crop toxin identity");
for(const row of namedCropMappings){
 const id=row.catalog_id;
 assert.ok(["06-06-1-wheat","06-06-2-wheat-bran","coffee"].includes(id),"Unexpected crop toxin identity "+id);
 if(id==="coffee"){
  assert.equal(row.standard_fssr,"2.10.2","Coffee route must remain Chapter 2.10.2");
  assert.equal(index.products.find(p=>p.id==="coffee")?.fssr,row.standard_fssr);
  assert.equal(row.contaminants.length,1);
  assert.equal(row.contaminants[0].crop_contaminant_key,"ochratoxin_a");
  assert.equal(row.contaminants[0].official_article,"Wheat, wheat bran, rye, barley, coffee");
  assert.equal(row.mixture_inheritance_allowed,false);
  assert.equal(row.pesticide_mrl_auto_apply,false);
  assert.ok(official(row.official_standard_source));
 }
 assert.equal(row.exact_catalog_identity_verified,true);
 assert.equal(row.complete_contaminant_coverage,false);
 assert.equal(row.amendments_fully_reconciled,false);
 assert.ok(official(row.official_source_url),"Nonofficial exact crop toxin mapping source: "+id);
 for(const rule of row.contaminants||[]){
  const group=contaminants.crop_contaminants[rule.crop_contaminant_key];
  assert.ok(group?.rules?.some(z=>z.article===rule.official_article&&Number(z.limit)===Number(rule.limit)),
    "Official crop toxin article or limit not found: "+id+" "+rule.crop_contaminant_key);
 }
}
const exactGroundnutCrop=contaminants.chapter_2_3_verified_groundnut_aflatoxin_v9;
assert.equal(exactGroundnutCrop?.catalog_id,"04-04-1-groundnut-kernel-deshelled","Groundnut-only exact crop identity expected");
assert.equal(exactGroundnutCrop?.fssr,"2.3.47(1)");
assert.equal(exactGroundnutCrop?.product_identity_verified,true);
assert.equal(exactGroundnutCrop?.complete_contaminant_coverage,false);
assert.equal(exactGroundnutCrop?.amendments_fully_reconciled,false);
assert.equal(exactGroundnutCrop?.automatic_pesticide_mrl_approval,false);
assert.ok(official(exactGroundnutCrop.official_crop_contaminant_source));
assert.ok(official(exactGroundnutCrop.official_standard_source));
assert.equal(exactGroundnutCrop.rules.length,2);
for(const rule of exactGroundnutCrop.rules){
 const sourceRules=contaminants.crop_contaminants[rule.crop_contaminant_key]?.rules||[];
 assert.equal(rule.official_articles.length,4,rule.contaminant);
 for(const article of rule.official_articles){
  assert.ok(sourceRules.some(r=>r.article===article&&Number(r.limit)===Number(rule.limit)),
   "Groundnut source category lacks matching crop limit: "+article);
 }
}
const namedNutCrop=contaminants.chapter_2_3_exact_nut_arecanut_aflatoxin_v9;
assert.equal(namedNutCrop?.verified_product_identities?.length,5);
assert.equal(namedNutCrop?.complete_contaminant_coverage,false);
assert.equal(namedNutCrop?.amendments_fully_reconciled,false);
assert.equal(namedNutCrop?.automatic_pesticide_mrl_approval,false);
assert.ok(official(namedNutCrop.official_source_url));
assert.ok(official(namedNutCrop.official_standard_url));
assert.equal(namedNutCrop.rules.length,2);
const namedNutById=new Map();
for(const route of namedNutCrop.verified_product_identities){
 const product=index.products.find(p=>p.id===route.catalog_id);
 assert.ok(product && product.fssr===route.fssr && product.name===route.product_name,"Nut identity drift: "+route.catalog_id);
 assert.equal(route.product_identity_verified,true);
 assert.ok(!namedNutById.has(route.catalog_id),"Duplicate named nut identity "+route.catalog_id);
 assert.ok(!namedNutCrop.excluded_similar_identity_ids.includes(route.catalog_id));
 assert.equal(route.official_articles.length,route.kind==="arecanut"?1:2);
 for(const r of namedNutCrop.rules){
  const sourceRules=contaminants.crop_contaminants[r.crop_contaminant_key]?.rules||[];
  for(const article of route.official_articles)assert.ok(sourceRules.some(x=>x.article===article && Number(x.limit)===Number(r.limit)),
   "Official nut/arecanut crop article missing or different limit: "+route.catalog_id+" / "+article);
 }
 namedNutById.set(route.catalog_id,route);
}
for(const id of namedNutCrop.excluded_similar_identity_ids)assert.ok(!namedNutById.has(id));
const namedRawCereal=contaminants.chapter_2_4_verified_raw_cereal_aflatoxin_v9;
assert.equal(namedRawCereal?.verified_raw_cereal_identities?.length,9);
assert.equal(namedRawCereal?.official_article,"Cereal and cereal products");
assert.equal(namedRawCereal?.complete_contaminant_coverage,false);
assert.equal(namedRawCereal?.amendments_fully_reconciled,false);
assert.equal(namedRawCereal?.automatic_pesticide_mrl_approval,false);
assert.equal(namedRawCereal?.processed_cereal_inheritance,false);
assert.ok(official(namedRawCereal.official_source_url));
const namedRawCerealById=new Map();
for(const route of namedRawCereal.verified_raw_cereal_identities){
 const p=index.products.find(x=>x.id===route.catalog_id);
 assert.ok(p && p.name===route.product_name && p.fssr===route.fssr,"Cereal identity drift: "+route.catalog_id);
 assert.equal(route.raw_grain_identity_verified,true);
 assert.ok(!namedRawCerealById.has(route.catalog_id));
 assert.ok(!namedRawCereal.excluded_processed_ids.includes(route.catalog_id));
 for(const rule of namedRawCereal.rules){
  const group=contaminants.crop_contaminants[rule.crop_contaminant_key];
  assert.ok(group?.rules?.some(x=>x.article===namedRawCereal.official_article&&Number(x.limit)===Number(rule.limit)),
   "Official raw cereal aflatoxin article changed: "+route.catalog_id);
 }
 namedRawCerealById.set(route.catalog_id,route);
}
const rawSoy=contaminants.chapter_2_4_exact_raw_soybean_oilseed_aflatoxin_v9;
assert.equal(rawSoy?.catalog_id,"06-06-1-soybean");
assert.equal(rawSoy?.fssr,"2.4.19");
assert.equal(rawSoy?.exact_identity_verified,true);
assert.equal(rawSoy?.full_contaminant_coverage,false);
assert.equal(rawSoy?.current_amendments_fully_reconciled,false);
assert.equal(rawSoy?.cross_product_inheritance,false);
assert.equal(rawSoy?.auto_apply_commodity_pesticide_mrl,false);
assert.ok(official(rawSoy.official_standard_url)&&official(rawSoy.official_contaminants_url));
assert.equal(rawSoy.official_articles.length,2);
const rawSoyProduct=index.products.find(x=>x.id===rawSoy.catalog_id);
assert.ok(rawSoyProduct && rawSoyProduct.name===rawSoy.product_name && rawSoyProduct.fssr===rawSoy.fssr);
for(const rule of rawSoy.rules)for(const article of rawSoy.official_articles){
 const group=contaminants.crop_contaminants[rule.crop_contaminant_key];
 assert.ok(group?.rules?.some(x=>x.article===article && Number(x.limit)===Number(rule.limit)));
 assert.equal(group.unit,rule.unit);
}
for(const excluded of rawSoy.excluded_derivative_product_ids)assert.ok(index.products.some(x=>x.id===excluded));
const exactBeverageSaffrole=contaminants.chapter_2_3_exact_finished_beverage_saffrole_v9;
assert.equal(exactBeverageSaffrole?.verified_finished_product_identities?.length,6);
assert.equal(exactBeverageSaffrole?.official_article,"Non-alcoholic beverages");
assert.equal(exactBeverageSaffrole?.limit,10);
assert.equal(exactBeverageSaffrole?.unit,"ppm");
assert.equal(exactBeverageSaffrole?.complete_contaminant_coverage,false);
assert.equal(exactBeverageSaffrole?.current_amendments_fully_reconciled,false);
assert.equal(exactBeverageSaffrole?.cross_product_inheritance,false);
assert.equal(exactBeverageSaffrole?.automatic_pesticide_mrl_approval,false);
assert.ok(official(exactBeverageSaffrole.official_standard_url)&&official(exactBeverageSaffrole.official_contaminants_url));
assert.ok((contaminants.naturally_occurring_toxic_substances?.saffrole||[])
 .some(x=>x.article===exactBeverageSaffrole.official_article && x.limit===10 && x.unit==="ppm"));
const exactBeverageSaffroleById=new Map();
for(const x of exactBeverageSaffrole.verified_finished_product_identities){
 const p=index.products.find(p=>p.id===x.catalog_id);
 assert.ok(p && p.name===x.product_name && p.fssr===x.fssr,x.catalog_id+" identity drift");
 assert.equal(x.finished_non_alcoholic_beverage_identity,true);
 assert.ok(!exactBeverageSaffroleById.has(x.catalog_id));
 assert.ok(!exactBeverageSaffrole.excluded_concentrate_powder_and_other_ids.includes(x.catalog_id));
 exactBeverageSaffroleById.set(x.catalog_id,x);
}
for(const id of exactBeverageSaffrole.excluded_concentrate_powder_and_other_ids)assert.ok(index.products.some(x=>x.id===id),"Unknown excluded product "+id);
const exactRawPulses=contaminants.chapter_2_4_exact_unprocessed_raw_pulses_v9;
assert.equal(exactRawPulses?.catalog_id,"06-06-1-unprocessed-whole-raw-pulses-not-for-direct-human-consumption");
assert.equal(exactRawPulses?.existing_catalogue_fssr,"2.4.6");
assert.equal(exactRawPulses?.specific_source_clause,"2.4.6(16)");
assert.equal(exactRawPulses?.quality_clause_catalogue_link_status,"pending_master_and_search_index_reconciliation");
assert.equal(exactRawPulses?.exact_raw_pulses_identity_verified,true);
assert.equal(exactRawPulses?.full_contaminant_coverage,false);
assert.equal(exactRawPulses?.compliance_decision_allowed,false);
assert.equal(exactRawPulses?.pesticide_mrl_auto_apply,false);
assert.equal(exactRawPulses?.derivative_inheritance,false);
assert.ok(official(exactRawPulses.official_standard_url)&&official(exactRawPulses.official_contaminants_url));
assert.deepEqual(exactRawPulses.source_specific_quality_limits.map(x=>x.value),[3,0.5]);
const rawPulsesIndex=index.products.find(p=>p.id===exactRawPulses.catalog_id);
assert.equal(rawPulsesIndex?.name,exactRawPulses.product_name);
assert.equal(rawPulsesIndex?.fssr,exactRawPulses.existing_catalogue_fssr);
const rawPulsesStandard=read("rules/chapter-2-4-cereals-v1.json").standards.find(x=>x.key===exactRawPulses.specific_source_clause);
assert.ok(rawPulsesStandard);
assert.equal(rawPulsesStandard.status,"source_exact_specific_clause_pending_catalogue_link");
assert.deepEqual(rawPulsesStandard.general_limits.map(x=>x.value),[3,0.5]);
assert.ok(official(rawPulsesStandard.official_source_url));
for(const item of exactRawPulses.rules){
 const g=contaminants.crop_contaminants[item.crop_contaminant_key];
 assert.ok(g?.rules?.some(x=>x.article==="Pulses"&&Number(x.limit)===Number(item.limit)));
 assert.equal(g.unit,item.unit);
}
for(const id of exactRawPulses.excluded_other_forms)assert.ok(index.products.some(p=>p.id===id));
const namedSoupSauceSaffrole=contaminants.chapter_2_3_exact_soup_sauce_saffrole_v9;
const officialSoupSauceSaffrole=(contaminants.naturally_occurring_toxic_substances?.saffrole||[])
 .find(x=>x.article===namedSoupSauceSaffrole?.official_article);
assert.equal(officialSoupSauceSaffrole?.limit,10);
assert.equal(officialSoupSauceSaffrole?.unit,"ppm");
assert.equal(namedSoupSauceSaffrole?.verified_product_identities?.length,6);
assert.equal(namedSoupSauceSaffrole?.complete_contaminant_coverage,false);
assert.equal(namedSoupSauceSaffrole?.amendments_fully_reconciled,false);
assert.ok(official(namedSoupSauceSaffrole.source_url));
assert.ok(official(namedSoupSauceSaffrole.standard_source_url));
const namedSoupSauceIds=new Map();
for(const route of namedSoupSauceSaffrole.verified_product_identities){
 assert.equal(route.product_identity_verified,true,route.catalog_id);
 assert.equal(route.exact_form,"finished_soup_or_sauce");
 assert.ok(!namedSoupSauceIds.has(route.catalog_id),"Duplicate sauce/soup identity");
 const product=index.products.find(x=>x.id===route.catalog_id);
 assert.ok(product && product.fssr===route.fssr,route.catalog_id+" FSSR identity drift");
 assert.ok(/soup|sauce|ketchup/i.test(product.name),route.catalog_id+" not a finished soup/sauce identity");
 namedSoupSauceIds.set(route.catalog_id,route);
}
for(const id of namedSoupSauceSaffrole.excluded_similar_identity_ids)
 assert.ok(!namedSoupSauceIds.has(id),"Excluded soup powder or paste mapped to saffrole");
const rawMeatMetalLocks=new Map();
for(const row of contaminants.chapter_2_5_locked_fresh_meat_routes_v9||[]){
 for(const id of row.catalog_ids||[]){
   assert.ok(!rawMeatMetalLocks.has(id),"Duplicate raw goat/rabbit metal lock "+id);
   rawMeatMetalLocks.set(id,row);
 }
}
assert.equal(rawMeatMetalLocks.size,4,"Expected four raw/frozen goat/rabbit metal locks");
function contaminantEvidenceForProduct(p){
 const profiles=directContaminantProfiles.get(p.id) || [];
 const explicitAliases=contaminantAliases.get(p.id);
 const direct=contaminantDirectStandards.get(p.id);
 const exactArticle=exactContaminantArticles.has(normalizeArticle(p.name));
 const spiceAflatoxin=spiceAflatoxinIds.has(p.id);
 const fssrFamilies=familyContaminantProfiles.filter(profile=>(profile.match_fssr || []).includes(p.fssr))
   .map(profile=>({id:profile.id,rule_rows:(profile.rules || []).length}));
 const finishedArticleLock=lockById.get(p.id) || null;
 if(finishedArticleLock){
   assert.equal(finishedArticleLock.status,"locked_no_exact_current_article",p.id);
   assert.ok(String(p.fssr||"").startsWith("2.7."),"Non-chocolate product in Chapter 2.7 lock: "+p.id);
   assert.equal(profiles.length,0,"Locked product accidentally gained a direct contaminant profile: "+p.id);
   assert.ok(!explicitAliases && !direct && !exactArticle && !spiceAflatoxin,"Locked product accidentally gained exact evidence; re-review before unlocking: "+p.id);
 }
 const cropToxin=namedCropById.get(p.id)||null;
 const groundnutCrop=exactGroundnutCrop.catalog_id===p.id ? exactGroundnutCrop:null;
 const namedNutCropEvidence=namedNutById.get(p.id)||null;
 const namedRawCerealEvidence=namedRawCerealById.get(p.id)||null;
 const rawSoyEvidence=rawSoy.catalog_id===p.id?rawSoy:null;
 const rawPulsesEvidence=exactRawPulses.catalog_id===p.id?exactRawPulses:null;
 const beverageSaffroleEvidence=exactBeverageSaffroleById.get(p.id)||null;
 const soupSauceSaffrole=namedSoupSauceIds.get(p.id)||null;
 const alcoholicEvidence=alcoholicById.get(p.id)||null;
 const explicitKinds=[];
 if(profiles.length)explicitKinds.push("direct_catalog_profile");
 if(explicitAliases)explicitKinds.push("verified_metal_article_alias");
 if(direct)explicitKinds.push("exact_product_clause");
 if(exactArticle)explicitKinds.push("exact_named_article");
 if(spiceAflatoxin)explicitKinds.push("verified_spice_crop_identity");
 if(cropToxin)explicitKinds.push("exact_named_crop_toxin_article");
 if(groundnutCrop)explicitKinds.push("verified_groundnut_crop_toxin_identical_category_limits");
 if(namedNutCropEvidence)explicitKinds.push("verified_exact_nut_arecanut_crop_toxin_article");
 if(namedRawCerealEvidence)explicitKinds.push("verified_exact_raw_cereal_crop_toxin_article");
 if(rawSoyEvidence)explicitKinds.push("verified_exact_raw_soybean_oilseed_crop_article");
 if(rawPulsesEvidence)explicitKinds.push("verified_exact_unprocessed_whole_raw_pulses_crop_article");
 if(beverageSaffroleEvidence)explicitKinds.push("verified_exact_finished_beverage_saffrole_article");
 if(soupSauceSaffrole)explicitKinds.push("verified_soup_sauce_saffrole_official_article");
 if(alcoholicEvidence)explicitKinds.push("verified_exact_finished_alcoholic_beverage_nots_article");
 const status=explicitKinds.length?"some_exact_product_evidence_not_full_coverage":
   fssrFamilies.length?"only_family_fssr_evidence_needs_identity_review":
   "no_exact_catalog_evidence_in_this_inventory";
 return {
   status,
   exact_alcoholic_beverage_toxic_substances:alcoholicEvidence?{
     fcs:alcoholicEvidence.fcs,article:"Alcoholic beverages",
     rules:alcoholic.rules.map(x=>({contaminant:x.contaminant,limit:x.limit,unit:x.unit})),
     source_url:alcoholic.official_source_url,full_compliance_verified:false,
     pesticide_mrls_auto_applied:false,other_contaminants_assessed:false
   }:null,
   exact_named_crop_toxin_article:cropToxin?{
     fssr:"FSSAI CTR Version IX · 2.2.1",
     named_identity:cropToxin.standard_identity,
     contaminant_keys:cropToxin.contaminants.map(x=>x.crop_contaminant_key),
     source:cropToxin.official_source_url,
     full_contaminant_coverage_verified:false
   }:null,
   chapter_2_3_exact_soup_sauce_saffrole:soupSauceSaffrole
     ? {article:namedSoupSauceSaffrole.official_article,contaminant:"Saffrole",
        limit:officialSoupSauceSaffrole.limit,unit:officialSoupSauceSaffrole.unit,
        fssr:soupSauceSaffrole.fssr,source:namedSoupSauceSaffrole.source_url,
        full_compliance_verified:false}:null,
   chapter_2_3_exact_groundnut_crop_limits:groundnutCrop
     ?{fssr:groundnutCrop.fssr,product_name:groundnutCrop.product_name,
       crop_limits:groundnutCrop.rules.map(x=>({contaminant:x.contaminant,limit:x.limit,unit:x.unit,articles:x.official_articles})),
       source:groundnutCrop.official_crop_contaminant_source,
       full_compliance_verified:false,pesticide_mrls_auto_applied:false}:null,
   chapter_2_3_exact_nut_arecanut_crop_limits:namedNutCropEvidence
     ?{fssr:namedNutCropEvidence.fssr,product_name:namedNutCropEvidence.product_name,
       kind:namedNutCropEvidence.kind,
       crop_limits:namedNutCrop.rules.map(x=>({contaminant:x.contaminant,limit:x.limit,unit:x.unit,
         articles:namedNutCropEvidence.official_articles})),
       source:namedNutCrop.official_source_url,
       full_compliance_verified:false,pesticide_mrls_auto_applied:false}:null,
   chapter_2_3_pesticide_commodity_review:fruitVegById.get(p.id)
     ? {scope:fruitVegById.get(p.id).scope,
        review_status:fruitVegById.get(p.id).review_status,
        raw_ingredient_reference_articles:fruitVegById.get(p.id).raw_ingredient_article_references_only,
        raw_reference_row_count:fruitVegById.get(p.id).raw_reference_rows_in_loaded_official_source,
        conditional_metal_article_candidates:fruitVegById.get(p.id).conditional_metal_article_candidates||[],
        excluded_non_equivalent_finished_product_articles:fruitVegById.get(p.id).excluded_non_equivalent_finished_product_articles||[],
        qualifier_review:fruitVegById.get(p.id).qualifier_review,
        official_source_url:fruitVegById.get(p.id).source_url,
        auto_apply:false,
        full_finished_product_applicability_verified:false} : null,
   chapter_2_4_exact_raw_cereal_aflatoxin:namedRawCerealEvidence
     ?{fssr:namedRawCerealEvidence.fssr,product_name:namedRawCerealEvidence.product_name,
       article:namedRawCereal.official_article,
       crop_limits:namedRawCereal.rules.map(x=>({contaminant:x.contaminant,limit:x.limit,unit:x.unit})),
       source:namedRawCereal.official_source_url,
       full_compliance_verified:false,processed_form_inheritance:false,pesticide_mrls_auto_applied:false}:null,
   chapter_2_4_exact_raw_soybean_oilseed_aflatoxin:rawSoyEvidence
     ?{fssr:rawSoy.fssr,identity_basis:rawSoy.identity_basis,
       crop_limits:rawSoy.rules.map(x=>({contaminant:x.contaminant,limit:x.limit,unit:x.unit,articles:rawSoy.official_articles})),
       official_source_url:rawSoy.official_contaminants_url,full_compliance_verified:false,
       related_soy_derivative_inheritance:false,pesticide_mrls_auto_applied:false}:null,
   chapter_2_3_exact_finished_beverage_saffrole:beverageSaffroleEvidence
     ?{fssr:beverageSaffroleEvidence.fssr,article:exactBeverageSaffrole.official_article,
       contaminant:"Saffrole",limit:exactBeverageSaffrole.limit,unit:exactBeverageSaffrole.unit,
       official_source_url:exactBeverageSaffrole.official_contaminants_url,
       full_compliance_verified:false,concentrate_or_powder_inheritance:false}:null,
   chapter_2_4_exact_unprocessed_whole_raw_pulses:rawPulsesEvidence
     ?{specific_source_clause:exactRawPulses.specific_source_clause,currently_linked_clause:exactRawPulses.existing_catalogue_fssr,
       source_standard_quality:exactRawPulses.source_specific_quality_limits,
       crop_toxin_limits:exactRawPulses.rules.map(r=>({contaminant:r.contaminant,limit:r.limit,unit:r.unit})),
       quality_clause_catalogue_link_status:exactRawPulses.quality_clause_catalogue_link_status,
       full_compliance_verified:false,pesticide_mrls_auto_applied:false}:null,
   chapter_2_4_pesticide_commodity_review:cerealById.get(p.id)
     ? {scope:cerealById.get(p.id).scope,
        review_status:cerealById.get(p.id).scope_review_status,
        candidate_articles:cerealById.get(p.id).candidate_commodity_articles,
        candidate_row_count:cerealById.get(p.id).candidate_rows_in_loaded_official_source,
        aflatoxin_reference_articles:cerealById.get(p.id).aflatoxin_reference_articles,
        crop_contaminant_article_review_pending:cerealById.get(p.id).crop_contaminant_article_review_pending||[],
        source_qualifier:cerealById.get(p.id).qualifier_review,
        source_fssai_version:contaminants.source_version,
        auto_apply:false,
        full_finished_product_applicability_verified:false} : null,
   chapter_2_5_pesticide_commodity_review:meatEggCommodityById.get(p.id)
     ? {scope:meatEggCommodityById.get(p.id).scope,
        review_status:meatEggCommodityById.get(p.id).scope_review_status,
        source_fssai_version:contaminants.source_version,
        candidate_articles:meatEggCommodityById.get(p.id).candidate_commodity_articles,
        source_qualifier:meatEggCommodityById.get(p.id).qualifier_review,
        auto_apply:false,
        exact_finished_product_applicability_verified:false} : null,
   raw_goat_rabbit_metal_article_lock:rawMeatMetalLocks.has(p.id)
     ? {contaminant:"Lead",status:"locked_pending_exact_finished_article",reason:rawMeatMetalLocks.get(p.id).reason} : null,
   finished_product_article_review:finishedArticleLock?{
     status:"reviewed_no_exact_current_version_ix_article_fail_closed",
     lock_reason:finishedArticleLock.reason,
     source_fssai_version:contaminants.source_version,
     source_url:version9Source,
     source_amendments_url:"https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins",
     reviewed_against_effective_snapshot:date,
     current_or_future_amendment_check_required:true,
     automatic_product_level_metal_limits_allowed:false
   }:null,
   exact_evidence_kinds:explicitKinds,
   direct_profile_ids:profiles.map(x=>x.id),
   direct_profile_rule_rows:profiles.reduce((n,x)=>n+x.rows,0),
   family_clause_profiles:fssrFamilies,
   universal_rule_count:(contaminants.all_food_rules||[]).filter(r=>r.auto_apply===true).length,
   universal_rule_proves_product_coverage:false,
   laboratory_results_assessed:false,
   conditional_package_process_and_ingredient_scopes_assessed:false,
   full_current_version_coverage_verified:false
 };
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
  let chapterMicrobiologyRows = [];
  let productAdditiveRestriction = null;
  let sourceUrls = [];
  const action = [];
  if(p.chapter_rule_link_status === "file_and_key_verified") {
    routeKind = "chapter_rule";
    const target = chapterRecord(p);
    sourceUrls = target.sourceUrls;
    chapterMicrobiologyRows = Array.isArray(target.record.chapter_specific_microbiology)
      ? target.record.chapter_specific_microbiology:[];
    rule = {file:target.file, key:target.key, record_status:target.record.status || "not_recorded"};
    const productBan=target.record.permitted_additives_policy;
    if(productBan?.permitted === false){
      assert.equal(target.record.full_compliance_assessment_enabled,false,"Additive ban must not imply full compliance: "+p.id);
      productAdditiveRestriction={
        scope:"all_added_food_additives_prohibited_in_named_product_standard",
        source_regulation_key:target.key,
        source_text:productBan.source_rule || "No additives allowed",
        current_amendments_verified:false
      };
      action.push("Product-specific no-additives clause overrides any apparent generic Appendix A category permission; check effective amendments");
    }else if(Array.isArray(target.record.prohibited_additive_classes)&&target.record.prohibited_additive_classes.length){
      productAdditiveRestriction={
        scope:"named_additive_classes_only",
        source_regulation_key:target.key,
        classes:target.record.prohibited_additive_classes,
        current_amendments_verified:false
      };
      action.push("Check product-standard prohibitions on named additive classes; do not infer a blanket ban");
    }
    numericCompositionPresent = (
      Array.isArray(target.record.composition) && target.record.composition.some(x=>Number.isFinite(x.value))
    ) || (
      Array.isArray(target.record.variant_composition) &&
      target.record.variant_composition.some(v=>Array.isArray(v.composition)&&v.composition.some(x=>Number.isFinite(x.value)))
    ) || (
      Array.isArray(target.record.relative_composition) && target.record.relative_composition.some(x=>Number.isFinite(x.value))
    );
    if(target.record.source_review?.review_status === "source_scope_transcribed_cross_regulations_pending") {
      assert.equal(target.record.full_compliance_assessment_enabled,false,"Scope-only standard cannot enable compliance: "+p.id);
      assert.equal(numericCompositionPresent,false,"Scope-only standard unexpectedly has universal numeric composition: "+p.id);
      numericBaselineStatus = "official_scope_reviewed_no_universal_composition_limits_in_clause";
      action.push("Verify any underlying food-specific composition requirements; absence of clause-wide numeric composition is not an exemption");
    }
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
  const contaminantEvidence=contaminantEvidenceForProduct(p);
  if(contaminantEvidence.finished_product_article_review){
    tally("chapter_2_7_finished_article_locks","reviewed_fail_closed");
    action.push("Chapter 2.7 finished-product contaminant article reviewed: no exact Version IX match verified; preserve fail-closed mapping and review current effective amendments, ingredient duties and any Foods not specified applicability");
  }
  if(contaminantEvidence.status==="no_exact_catalog_evidence_in_this_inventory")
    action.push("Map exact FSSAI contaminant/commodity articles; universal all-food rows do not demonstrate product-specific coverage");
  if(contaminantEvidence.status==="only_family_fssr_evidence_needs_identity_review")
    action.push("Confirm exact finished-product eligibility for the matching FSSR-family contaminant article");
  tally("contaminant_evidence",contaminantEvidence.status);
  if(contaminantEvidence.exact_named_crop_toxin_article){
    tally("chapter_2_4_exact_named_crop_toxins","version_ix_wheat_bran_coffee");
    action.push("Exact FSSAI Version IX grouped crop-toxin article matched to the named Wheat, Wheat Bran or Coffee identity; no transfer to processed composites. Check amendments and other contaminants.");
  }
  if(contaminantEvidence.chapter_2_3_pesticide_commodity_review){
    tally("chapter_2_3_pesticide_review","source_only_no_finished_product_approval");
    if(contaminantEvidence.chapter_2_3_pesticide_commodity_review.conditional_metal_article_candidates.length)
      tally("chapter_2_3_conditional_metal_products","subtype_or_package_required");
    if(contaminantEvidence.chapter_2_3_pesticide_commodity_review.excluded_non_equivalent_finished_product_articles.length)
      tally("chapter_2_3_non_equivalent_articles","raw_cocoa_beans_not_cocoa_powder");
    action.push("Review Chapter 2.3 specific fruit, vegetable, nut or processed-product matrix, raw-ingredient commodity MRL, processing factor and sample basis; no finished-product pesticide MRL automatically established");
  }
  if(contaminantEvidence.exact_alcoholic_beverage_toxic_substances){
    tally("alcoholic_beverage_nots","four_official_grouped_article_limits_identity_locked");
    action.push("Exact FCS 14.2 alcoholic beverage: four source-backed Version IX naturally occurring toxic-substance rows only; review other contaminants, pesticide/veterinary residues, effective amendments and product form separately");
  }
  if(contaminantEvidence.chapter_2_3_exact_soup_sauce_saffrole){
    tally("chapter_2_3_exact_soup_sauce_saffrole","named_finished_soup_or_sauce");
    action.push("Soup/sauce Saffrole article is a source-backed partial assessment; confirm other metals, process and any operative amendments before a full compliance decision");
  }
  if(contaminantEvidence.chapter_2_3_exact_nut_arecanut_crop_limits){
    tally("chapter_2_3_verified_named_nut_arecanut_crop_limits","exact_identity_partial_source_evidence");
    action.push("Exact Chapter 2.3 nut/arecanut aflatoxin source evidence is partial; confirm finished-product use, all other contaminants, pesticide MRLs and amendments");
  }
  if(contaminantEvidence.chapter_2_3_exact_groundnut_crop_limits){
    tally("chapter_2_3_verified_groundnut_crop_limits","identity_and_same_limits_across_source_articles");
    action.push("Groundnut kernel: verify other contaminants, pesticide MRLs, processing use and operative amendments separately; aflatoxin identity alone does not establish product compliance");
  }
  if(contaminantEvidence.chapter_2_4_exact_raw_cereal_aflatoxin){
    tally("chapter_2_4_verified_raw_cereal_aflatoxin","exact_raw_grain_partial_source_evidence");
    action.push("Exact raw-cereal aflatoxin Version IX article is partial evidence only; verify other metal and toxin limits, variants, other processed forms, pesticide MRLs and operative amendments");
  }
  if(contaminantEvidence.chapter_2_4_exact_raw_soybean_oilseed_aflatoxin){
    tally("chapter_2_4_exact_soybean_oilseed_toxins","raw_seed_source_backed_partial");
    action.push("Raw soybean oilseed aflatoxins are partial source-backed evidence. Verify all other contaminants and pesticide MRLs, derivative form and later amendments");
  }
  if(contaminantEvidence.chapter_2_3_exact_finished_beverage_saffrole){
    tally("chapter_2_3_exact_finished_beverage_saffrole","finished_juice_or_drink");
    action.push("Named finished non-alcoholic juice/drink has official Saffrole 10 ppm article only; other contaminants, process/form and amendments remain unverified");
  }
  if(contaminantEvidence.chapter_2_4_exact_unprocessed_whole_raw_pulses){
    tally("chapter_2_4_unprocessed_whole_raw_pulses","partial_exact_source_contaminant_and_quality_clause");
    action.push("Chapter 2.4.6(16) raw pulse quality limits transcribed and exact Pulses aflatoxins mapped; master/index still route via generic 2.4.6 and need a follow-up clause-link correction. Do not treat this as a complete product standard or regulatory compliance pass.");
  }
  if(contaminantEvidence.chapter_2_4_pesticide_commodity_review){
    tally("chapter_2_4_pesticide_review","reference_only_by_exact_catalog_id");
    action.push("Check Chapter 2.4 raw versus milled, oilseed-flour and composite food form before deciding individual official MRL/crop contaminant applicability; candidates are reference-only");
  }
  if((contaminantEvidence.chapter_2_4_pesticide_commodity_review?.crop_contaminant_article_review_pending||[]).length){
    tally("chapter_2_4_crop_toxin_form_pending","pearl_barley_article_form_unverified");
    action.push("Pearl barley is processed: verify whether Version IX 'barley' OTA/DON article legally covers pearled barley before applying those numbers");
  }
  if(contaminantEvidence.chapter_2_5_pesticide_commodity_review){
    tally("chapter_2_5_pesticide_candidates","source_rows_available_applicability_pending");
    action.push("Review Chapter 2.5 pesticide commodity candidates for exact animal tissue, processing and residue basis; the candidate rows are not applied automatically");
  }
  if(contaminantEvidence.raw_goat_rabbit_metal_article_lock){
    tally("chapter_2_5_goat_rabbit_metal_locks","species_identity_not_transferable");
    action.push("Do not transfer cattle/sheep/pig/poultry Lead article onto goat or rabbit without a verified official article and applicable amendments");
  }
  if(chapterMicrobiologyRows.length){
    assert.equal(routeKind,"chapter_rule");
    assert.ok(sourceUrls.every(official),"Direct chapter microbiology source must be official: "+p.id);
    tally("direct_chapter_microbiology","exact_clause_microbiology_rows");
  }
  let micro = p.microbiology_status || "not_recorded_in_search_index";
  if(micro === "conditional_appendix_b_variant_required") action.push("Confirm manufacturing process, food variant and the exact Appendix B sampling criteria");
  if(micro === "not_recorded_in_search_index") action.push("Review whether microbiology applies; missing index flag does not mean not applicable");
  if(micro.startsWith("appendix_b_no_direct")) action.push("Check other relevant microbiology requirements; no direct Appendix B table mapping is not an exemption");
  if(p.appendix_fcs_status !== "mapped_current_v3") action.push("Reconcile Appendix A category classification or special exclusion before additive assessment");
  if(p.appendix_fcs_status === "mapped_current_v3") action.push("Evaluate additives at exact category/ingredient, amount, technological function and applicable notes");
  if(productAdditiveRestriction)tally("product_additive_restrictions",productAdditiveRestriction.scope);
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
    direct_chapter_microbiology_criteria:chapterMicrobiologyRows,
    contaminant_evidence_index:contaminantEvidence,
    appendix_b_evidence_route:appendixBRoutes.get(p.id) || null,
    microbiology_profile_key:p.microbiology_profile_key || null,
    microbiology_candidates_count:(p.microbiology_candidates || []).length,
    appendix_a_category:p.appendix_fcs || null,
    appendix_a_category_status:p.appendix_fcs_status,
    product_standard_additive_restriction:productAdditiveRestriction,
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
const pendingContaminantProducts=products
 .filter(p=>p.contaminant_evidence_index.status!=="some_exact_product_evidence_not_full_coverage");
const chapterFromFssr=p=>{
 const v=String(p.fssr||"");
 return (v.match(/^(\d+\.\d+)(?:\.|$)/)||[])[1] || "special";
};
const queueOrder=["2.7","2.5","2.4","2.3","2.1","2.2","2.6","2.8","2.9","3.1","3.2","3.3","special"];
const byChapter=new Map();
for(const p of pendingContaminantProducts){
 const code=chapterFromFssr(p);
 if(!byChapter.has(code))byChapter.set(code,[]);
 byChapter.get(code).push(p);
}
const queueLines=[
 "# PMSV FSSAI contaminants: unresolved product-evidence review queue",
 "",
 "Snapshot: "+date+". Official FSSAI/FoSCoS references only. Current loaded product catalogue: "+products.length+".",
 "",
 "An unresolved record here does NOT establish that the food is exempt or that no commodity-family contaminant limit applies. It means no exact product/commodity evidence was established by the conservative automated identity index. Before clearing, examine FSSAI Version IX, the applicable operative amendments, exact commodity article, packaging/processing form, and other residues.",
 "",
 "Universal all-food methylmercury is not counted as proof of product-specific coverage.",
 "",
 "Priority note: FSSR Chapter 2.7 chocolate and confectionery contains distinct Cocoa Powder, Cocoa Mass and Chocolate identities. Never borrow Cocoa Powder contaminant limits for Cocoa Mass or Chocolate unless their current official article and scope substantiate it.",
 "",
 "| FSSR chapter | Identities awaiting exact-catalogue evidence review |",
 "|---|---:|",
 ...[...byChapter.entries()].sort((a,b)=>{
   const ai=queueOrder.indexOf(a[0]),bi=queueOrder.indexOf(b[0]);
   return (ai<0?999:ai)-(bi<0?999:bi);
 }).map(([k,rows])=>"| "+k+" | "+rows.length+" |"),
 "",
];
for(const [code,rows] of [...byChapter.entries()].sort((a,b)=>{
 const ai=queueOrder.indexOf(a[0]),bi=queueOrder.indexOf(b[0]);
 return (ai<0?999:ai)-(bi<0?999:bi);
})){
 queueLines.push("## FSSR "+code+" — "+rows.length+" identities","",
 "| Product identity | Product code | Existing evidence status |",
 "|---|---|---|",
 ...rows.sort((a,b)=>a.name.localeCompare(b.name))
  .map(p=>"| "+String(p.name||"").replaceAll("|","/")+" | "+p.id+" | "+(p.contaminant_evidence_index.finished_product_article_review?"**REVIEWED / LOCKED**: no exact Version IX finished-product article; see full JSON for lock evidence":p.contaminant_evidence_index.status==="only_family_fssr_evidence_needs_identity_review"?"FSSR-family only":"No exact index record; inspect runtime commodity rules")+" |"),
 "");
}
const queuePath=path.join(output,"fssai-contaminant-review-queue.md");
fs.writeFileSync(queuePath,queueLines.join("\n")+"\n");
assert.equal(pendingContaminantProducts.length,
  (counts.contaminant_evidence?.no_exact_catalog_evidence_in_this_inventory||0)+
  (counts.contaminant_evidence?.only_family_fssr_evidence_needs_identity_review||0));
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
  "| Official-scope-reviewed identities with no universal numeric composition prescribed by cited clause | "+(counts.numeric_baseline_status.official_scope_reviewed_no_universal_composition_limits_in_clause||0)+" |",
  "| Appendix B conditional, variant-dependent routes | "+(counts.microbiology.conditional_appendix_b_variant_required||0)+" |",
  "| Named product-standard complete additive bans flagged | "+(counts.product_additive_restrictions?.all_added_food_additives_prohibited_in_named_product_standard||0)+" |",
  "| Named limited additive-class restrictions flagged | "+(counts.product_additive_restrictions?.named_additive_classes_only||0)+" |",
  "| Exact contaminant evidence of at least one kind (not full coverage) | "+(counts.contaminant_evidence?.some_exact_product_evidence_not_full_coverage||0)+" |",
  "| FSSR-family contaminant evidence only, exact product review pending | "+(counts.contaminant_evidence?.only_family_fssr_evidence_needs_identity_review||0)+" |",
  "| No exact contaminant catalogue evidence in this inventory (not necessarily no rules) | "+(counts.contaminant_evidence?.no_exact_catalog_evidence_in_this_inventory||0)+" |",
  "| Chapter 2.7 finished products explicitly reviewed and locked against false article inheritance | "+(counts.chapter_2_7_finished_article_locks?.reviewed_fail_closed||0)+" |",
  "| Exact FCS 14.2 alcoholic beverages with four verified Version IX naturally occurring toxin rows | "+(counts.alcoholic_beverage_nots?.four_official_grouped_article_limits_identity_locked||0)+" |",
  "| Chapter 2.3 exact finished soups/sauces with FSSAI Saffrole 10 ppm | "+(counts.chapter_2_3_exact_soup_sauce_saffrole?.named_finished_soup_or_sauce||0)+" |",
  "| Chapter 2.3 deshelled groundnut kernel identities with sourced aflatoxin ceiling | "+(counts.chapter_2_3_verified_groundnut_crop_limits?.identity_and_same_limits_across_source_articles||0)+" |",
  "| Chapter 2.3 verified exact nut/arecanut identities with partial aflatoxin source limits | "+(counts.chapter_2_3_verified_named_nut_arecanut_crop_limits?.exact_identity_partial_source_evidence||0)+" |",
  "| Chapter 2.3 conditional metal article products requiring subtype or packaging evidence | "+(counts.chapter_2_3_conditional_metal_products?.subtype_or_package_required||0)+" |",
  "| Chapter 2.3 cocoa bean/cocoa powder non-equivalence guards | "+(counts.chapter_2_3_non_equivalent_articles?.raw_cocoa_beans_not_cocoa_powder||0)+" |",
  "| Chapter 2.3 fruit/vegetable pesticide commodity reviews indexed without automatic MRL applicability | "+(counts.chapter_2_3_pesticide_review?.source_only_no_finished_product_approval||0)+" |",
  "| Chapter 2.4 processed Pearl Barley OTA/DON article form held for verification | "+(counts.chapter_2_4_crop_toxin_form_pending?.pearl_barley_article_form_unverified||0)+" |",
  "| Chapter 2.4 cereal and flour commodity candidates indexed without automatic MRL applicability | "+(counts.chapter_2_4_pesticide_review?.reference_only_by_exact_catalog_id||0)+" |",
  "| Chapter 2.4 exact raw Soybean seed with partial official oilseed aflatoxin evidence | "+(counts.chapter_2_4_exact_soybean_oilseed_toxins?.raw_seed_source_backed_partial||0)+" |",
  "| Chapter 2.4 Unprocessed raw Pulses aflatoxins + specific quality clause, master link outstanding | "+(counts.chapter_2_4_unprocessed_whole_raw_pulses?.partial_exact_source_contaminant_and_quality_clause||0)+" |",
  "| Chapter 2.3 exact finished beverages with sourced 10 ppm Saffrole | "+(counts.chapter_2_3_exact_finished_beverage_saffrole?.finished_juice_or_drink||0)+" |",
  "| Chapter 2.4 Wheat / Wheat Bran and Chapter 2.10 Coffee with exact Version IX crop-toxin articles | "+(counts.chapter_2_4_exact_named_crop_toxins?.version_ix_wheat_bran_coffee||0)+" |",
  "| Chapter 2.4 exact raw cereal identities with partial Version IX aflatoxin evidence | "+(counts.chapter_2_4_verified_raw_cereal_aflatoxin?.exact_raw_grain_partial_source_evidence||0)+" |",
  "| Chapter 2.5 product identities with official commodity pesticide candidates (not auto-applied) | "+(counts.chapter_2_5_pesticide_candidates?.source_rows_available_applicability_pending||0)+" |",
  "| Raw goat/rabbit metal article locks preventing species transfer | "+(counts.chapter_2_5_goat_rabbit_metal_locks?.species_identity_not_transferable||0)+" |",
  "| Direct FSSAI chapter microbiology criteria indexed | "+(counts.direct_chapter_microbiology?.exact_clause_microbiology_rows||0)+" |",
  "| Appendix B exact/conditional/no-direct mappings cross-checked against Table profiles | "+appendixBRoutes.size+" |",
  "| Microbiology absent from lightweight search index (not necessarily exempt) | "+(counts.microbiology.not_recorded_in_search_index||0)+" |",
  "| All product-specific compliance outcomes independently verified | 0 claimed |",
  "",
  "Download the full 533-row JSON artifact and chapter-prioritized contaminant review queue from this workflow run. A chapter key resolving or an FCS classification is **not** proof of regulatory conformity."
].join("\n");
console.log(summary);
if(process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary+"\n");
console.log("PASS: saved "+products.length+" product-by-product evidence statuses in "+outputFile);
console.log("PASS: created prioritized contaminant review queue for "+pendingContaminantProducts.length+" products in "+queuePath);
