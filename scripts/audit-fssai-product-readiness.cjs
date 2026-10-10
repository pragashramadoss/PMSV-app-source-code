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
const spiceOleoresinSource = read("rules/spice-oleoresin-2-9-32-residual-solvents-evidence-v1.json");
const goatMuscleSource = read("rules/goat-muscle-veterinary-v9-exact-evidence-v1.json");
const fourCompositeSources=read("rules/fssai-4-exact-composite-soup-source-evidence-v1.json");
const coconutHexaneSource=read("rules/solvent-extracted-coconut-flour-hexane-exact-v1.json");
const crossFamilyNOTS=read("rules/fssai-25-beverage-confectionery-fungi-v9-source-evidence-2026-10-10.json");
const batch40Source=read("rules/fssai-batch40-exact-commodity-and-conditional-scope-v1.json");
const pending136FullReview=read("rules/fssai-full-136-identity-applicability-review-2026-10-10.json");
const next10ExactSource=read("rules/fssai-next10-exact-source-candidate-2026-10-10.json");
/* Exact FSSAI Chapter 2.16 source evidence. This is a standard-product
 * THC and cross-cutting CBD assessment, not a Version IX contaminant article,
 * an exemption from other contaminants or a complete compliance verdict. */
const hempChapter216=read("rules/chapter-2-16-hemp-v1.json");
const hempOfficialSource="https://fssai.gov.in/upload/uploadfiles/files/17_%20Chapter%202_16%20(Hemp%20seeds%20and%20seed%20products).pdf";
assert.equal(hempChapter216.chapter,"2.16");
assert.ok(hempChapter216.official_sources.some(x=>x.url===hempOfficialSource));
const hempCBD=hempChapter216.cross_cutting_limits.filter(x=>
 x.key==="2.16(3)"&&x.scope==="Any food consisting of hemp seed or seed products"
 &&x.parameter==="Cannabidiol (CBD)"&&x.operator==="<="&&x.value===75&&x.unit==="mg/kg");
assert.equal(hempCBD.length,1,"Missing exact Chapter 2.16(3) CBD source");
const hempIdentities=[
 ["fssai-2-16-hemp-seed","Hemp seed","2.16(2)(i)",5],
 ["fssai-2-16-hemp-seed-oil","Hemp seed oil","2.16(2)(ii)",10],
 ["fssai-2-16-hemp-seed-flour","Hemp seed flour","2.16(2)(iii)",5]
];
const hempEvidenceById=new Map();
for(const [id,name,key,totalTHC] of hempIdentities){
 const product=index.products.find(x=>x.id===id);
 assert.ok(product&&product.name===name&&product.fssr==="2.16"&&product.rule_key===key,
   "Hemp identity/standard routing mismatch: "+id);
 const standards=hempChapter216.standards.filter(x=>x.key===key&&x.name===name);
 assert.equal(standards.length,1,"Missing exact source hemp standard: "+id);
 const rows=(standards[0].composition||[]).filter(x=>x.parameter==="Total THC");
 assert.equal(rows.length,1,"Missing or duplicated hemp total THC: "+id);
 assert.equal(rows[0].operator,"<=");assert.equal(rows[0].value,totalTHC);
 assert.equal(rows[0].unit,"mg/kg");
 hempEvidenceById.set(id,{source:hempOfficialSource,source_key:key,thc:totalTHC,cbd:75,
    verification:"official_fssai_chapter_2_16_exact_product_and_cross_cutting_clause",
    other_contaminants_verified:false,full_compliance_verified:false,
    other_food_and_beverage_thc_limits_auto_applied:false});
}

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
  .flatMap(rows=>(rows || []).filter(row=>row.row_type==='exact')
    .map(row=>normalizeArticle(row.article))));
const familyContaminantProfiles = (contaminants.profiles || []).filter(p=>Array.isArray(p.match_fssr) && p.match_fssr.length);
const chapter27Locks = (contaminants.chapter_2_7_locked_contaminant_routes_v9 || []);
const lockById = new Map(chapter27Locks.map(x=>[x.catalog_id,x]));
assert.equal(chapter27Locks.length,6,"Expected six reviewed Chapter 2.7 contaminant locks");
assert.equal(lockById.size,6,"Duplicate Chapter 2.7 lock identity");
const version9Source=contaminants.official_sources?.[0]?.url || "";

// Section 2.1 subtype conditions are regulatory candidates, NOT automatic
// product limits. Independently reconcile all numbers to the loaded official
// Version IX table before including a condition in the per-product audit.
const checkedSubtypeMetalRows=new Map();
for(const condition of contaminants.product_subtype_conditional_metal_rules_v9||[]){
 const identity=index.products.find(x=>x.id===condition.catalog_id);
 assert.ok(identity,"Missing conditional metal catalogue identity "+condition.catalog_id);
 assert.equal(condition.auto_apply,false,"Subtype metal may not auto-apply "+identity.id);
 assert.equal(condition.requires_input,"product.exact_subtype","Missing user-confirmed subtype "+identity.id);
 assert.ok(condition.subtype&&condition.contaminant&&condition.article,"Incomplete conditional metal article "+identity.id);
 if(condition.product_name)assert.equal(normalizeArticle(condition.product_name),normalizeArticle(identity.name));
 if(condition.fssr)assert.equal(condition.fssr,identity.fssr,"Conditional metal FSSR mismatch "+identity.id);
 if(condition.official_source_url)assert.equal(condition.official_source_url,version9Source,"Unrecognized current FSSAI source "+identity.id);
 assert.ok(/^section 2\.1(?:\s|·|$)/i.test(String(condition.source_basis||"")),"Wrong metal source clause "+identity.id);
 const sourceRows=(contaminants.metal_article_rules_v9?.[condition.contaminant]||[]).filter(row=>
   row.row_type==="exact"&&normalizeArticle(row.article)===normalizeArticle(condition.article)
   &&Number.isFinite(Number(row.limit))&&Number(row.limit)===Number(condition.limit)
   &&String(row.unit||"").trim().toLowerCase()===String(condition.unit||"").trim().toLowerCase()
   &&(condition.source_condition===undefined||String(row.condition||"").trim()===String(condition.source_condition).trim()));
 assert.equal(sourceRows.length,1,"Wrong/ambiguous source limit, unit or analytical basis for "+identity.id+" "+condition.subtype+" "+condition.contaminant);
 if(!checkedSubtypeMetalRows.has(identity.id))checkedSubtypeMetalRows.set(identity.id,[]);
 checkedSubtypeMetalRows.get(identity.id).push({
   subtype:condition.subtype,contaminant:condition.contaminant,article:condition.article,
   value:condition.limit,unit:condition.unit,analytical_basis:condition.source_condition||null,
   requires_user_confirmation:true,auto_apply:false,full_contaminant_coverage_verified:false,
   official_source_url:version9Source
 });
}
assert.ok([...checkedSubtypeMetalRows.values()].reduce((n,rows)=>n+rows.length,0)>=11,
 "Unexpected reduction in official source-checked conditional metal rows");
for(const [id,rows] of checkedSubtypeMetalRows){
 const seen=new Set();
 for(const row of rows){
  const key=row.subtype+"|"+row.contaminant;
  assert.ok(!seen.has(key),"Duplicate subtype/metal specification "+id+" "+key);
  seen.add(key);
 }
}


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
const processedMeat=contaminants.chapter_2_5_verified_processed_meat_saffrole_v9;
assert.ok(processedMeat&&official(processedMeat.official_source_url));
assert.equal(processedMeat.official_article,"Meat preparations and meat products, including poultry and game");
assert.equal(processedMeat.limit,10);assert.equal(processedMeat.unit,"ppm");
assert.equal(processedMeat.complete_contaminant_coverage,false);
assert.equal(processedMeat.pesticide_mrl_auto_apply,false);
const processedMeatById=new Map(processedMeat.verified_finished_product_identities.map(x=>[x.catalog_id,x]));
assert.equal(processedMeatById.size,19);
assert.deepEqual(new Set(processedMeatById.keys()),new Set(meatEggCommodityReviews.filter(x=>
 x.scope==="processed_meat"&&!x.catalog_id.endsWith("animal-casings")).map(x=>x.catalog_id)));
assert.ok((contaminants.naturally_occurring_toxic_substances.saffrole||[]).some(x=>
 x.article===processedMeat.official_article&&Number(x.limit)===10&&x.unit==="ppm"));
for(const row of processedMeat.verified_finished_product_identities){
 const p=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&row.verified===true);
 assert.ok(!processedMeat.excluded_related_catalog_ids.includes(row.catalog_id));
}
const freshEggs=contaminants.chapter_2_5_exact_fresh_egg_source_article_v9;
assert.ok(freshEggs&&official(freshEggs.official_source_url));
assert.equal(freshEggs.catalog_id,"10-10-1-fresh-eggs");
assert.equal(freshEggs.fssr,"2.5.3");
assert.equal(freshEggs.official_commodity_article,"Eggs");
assert.equal(freshEggs.article_rows_count,9);
assert.equal(freshEggs.exact_raw_egg_commodity_identity_verified,true);
assert.equal(freshEggs.automatic_pesticide_mrl_approval,false);
assert.equal(freshEggs.processed_egg_derivative_inheritance,false);
assert.equal(freshEggs.complete_contaminant_coverage,false);
const freshEggsProduct=index.products.find(p=>p.id===freshEggs.catalog_id);
assert.ok(freshEggsProduct&&freshEggsProduct.name===freshEggs.product_name&&freshEggsProduct.fssr===freshEggs.fssr);
const eggsRows=(contaminants.residue_mrls.pesticides||[]).flatMap(p=>(p.rows||[]).filter(r=>r.food==="Eggs"));
assert.equal(eggsRows.length,freshEggs.article_rows_count);
assert.ok(eggsRows.every(x=>x.condition==="Shell free basis"&&x.unit==="mg/kg"));
assert.equal(freshEggs.excluded_ids.length,4);
for(const id of freshEggs.excluded_ids){
 assert.ok(meatEggCommodityReviews.some(x=>x.catalog_id===id&&x.scope==="processed_egg"));
}

// Three finished dried-fruit identities match the named FSSAI Version IX
// Malathion 'Dried fruits' 8 mg/kg commodity. This is partial residue source
// evidence only, NOT an approved panel/compliance result.
const driedFruitMalathion=contaminants.chapter_2_3_dried_fruit_exact_malathion_v9;
assert.ok(driedFruitMalathion&&official(driedFruitMalathion.official_source_url)&&official(driedFruitMalathion.chapter_2_3_standard_url));
assert.equal(driedFruitMalathion.source_version,contaminants.source_version);
assert.equal(driedFruitMalathion.commodity_article,"Dried fruits");
assert.equal(driedFruitMalathion.limit,8);
assert.equal(driedFruitMalathion.unit,"mg/kg");
assert.match(driedFruitMalathion.pesticide_name,/^Malathion.*malathion and malaoxon/);
assert.equal(driedFruitMalathion.automatic_compliance_pass,false);
assert.equal(driedFruitMalathion.full_contaminant_coverage,false);
assert.equal(driedFruitMalathion.verified_product_identities.length,3);
const malathionSourceRows=(contaminants.residue_mrls?.pesticides||[])
 .filter(x=>x.name===driedFruitMalathion.pesticide_name)
 .flatMap(x=>(x.rows||[]).filter(z=>z.food===driedFruitMalathion.commodity_article&&Number(z.mrl)===8&&z.unit==="mg/kg"));
assert.equal(malathionSourceRows.length,1,"Current official dried-fruit Malathion source row drift");
const driedFruitById=new Map(driedFruitMalathion.verified_product_identities.map(x=>[x.catalog_id,x]));
assert.equal(driedFruitById.size,3);
for(const row of driedFruitMalathion.verified_product_identities){
 const product=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(product&&product.name===row.product_name&&product.fssr===row.fssr&&row.dried_fruit_identity_verified===true);
 const standard=chapterRecord(product);
 assert.equal(standard.record.key,row.fssr);
 assert.equal(standard.record.name,row.product_name);
 assert.ok(standard.sourceUrls.some(x=>x===driedFruitMalathion.chapter_2_3_standard_url));
 assert.ok(!driedFruitMalathion.excluded_catalog_ids.includes(row.catalog_id));
}
for(const id of driedFruitMalathion.excluded_catalog_ids)assert.ok(!driedFruitById.has(id));

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
const finishedBeverage=contaminants.chapter_2_10_verified_finished_beverage_saffrole_v9;
assert.ok(finishedBeverage && official(finishedBeverage.official_source_url));
assert.equal(finishedBeverage.official_article,"Non-alcoholic beverages");
assert.equal(finishedBeverage.limit,10);assert.equal(finishedBeverage.unit,"ppm");
assert.equal(finishedBeverage.complete_contaminant_coverage,false);
assert.equal(finishedBeverage.pesticide_mrl_auto_apply,false);
const finishedBeverageById=new Map(finishedBeverage.verified_finished_product_identities.map(x=>[x.catalog_id,x]));
assert.equal(finishedBeverageById.size,4);
assert.ok((contaminants.naturally_occurring_toxic_substances.saffrole||[]).some(x=>
 x.article===finishedBeverage.official_article&&Number(x.limit)===10&&x.unit==="ppm"));
for(const row of finishedBeverage.verified_finished_product_identities){
 const product=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(product&&product.name===row.product_name&&product.fssr===row.fssr);
 assert.equal(row.verified_finished_non_alcoholic,true);
 assert.ok(String(row.fssr).startsWith("2.10."));
 assert.ok(!finishedBeverage.excluded_nearby_catalog_ids.includes(row.catalog_id));
}
const pureCereals=contaminants.chapter_2_4_verified_pure_cereal_products_aflatoxin_v9;
assert.ok(pureCereals&&official(pureCereals.official_source_url));
assert.equal(pureCereals.official_article,"Cereal and cereal products");
assert.equal(pureCereals.verified_product_identities.length,15);
assert.equal(pureCereals.rules.length,2);
assert.equal(pureCereals.complete_contaminant_coverage,false);
assert.equal(pureCereals.automatic_pesticide_mrl_approval,false);
const pureCerealsById=new Map(pureCereals.verified_product_identities.map(x=>[x.catalog_id,x]));
assert.equal(pureCerealsById.size,15);
for(const route of pureCereals.verified_product_identities){
 const p=index.products.find(x=>x.id===route.catalog_id);
 assert.ok(p&&p.name===route.product_name&&p.fssr===route.fssr&&String(p.fssr).startsWith("2.4."));
 assert.equal(route.exact_cereal_product_identity_verified,true);
 assert.ok(!pureCereals.excluded_non_equivalent_ids.includes(route.catalog_id));
}
for(const rule of pureCereals.rules){
 const group=contaminants.crop_contaminants[rule.key];
 assert.ok(group?.rules?.some(x=>x.article===pureCereals.official_article&&Number(x.limit)===Number(rule.limit)));
 assert.equal(group.unit,rule.unit);
}
const oilMetals=contaminants.chapter_2_2_verified_oil_metal_articles_v9;
assert.ok(oilMetals&&official(oilMetals.official_source_url));
assert.equal(oilMetals.complete_contaminant_coverage,false);
assert.equal(oilMetals.automatic_pesticide_mrl_approval,false);
const nickelOilById=new Map(oilMetals.hydrogenated_interesterified_nickel.verified_identities.map(x=>[x.catalog_id,x]));
const seedOilById=new Map(oilMetals.named_edible_seed_oils.verified_identities.map(x=>[x.catalog_id,x]));
assert.equal(nickelOilById.size,7);assert.equal(seedOilById.size,3);
// A generic FSSR 2.2.5(3) Fat spread is not proof of hydrogenated or
// interesterified vegetable fat: milk and mixed-fat spread variants exist.
assert.equal(nickelOilById.has("02-02-2-fat-spread"),false);
const fatSpreadNickelConditions=(contaminants.product_subtype_conditional_metal_rules_v9||[])
 .filter(x=>x.catalog_id==="02-02-2-fat-spread"&&x.contaminant==="Nickel");
assert.equal(fatSpreadNickelConditions.length,1);
assert.equal(fatSpreadNickelConditions[0].auto_apply,false);
assert.equal(fatSpreadNickelConditions[0].requires_input,"product.exact_subtype");
for(const [metal,group] of [["Nickel",oilMetals.hydrogenated_interesterified_nickel]]){
 assert.ok(contaminants.metal_article_rules_v9[metal].some(x=>
   x.article===group.article&&Number(x.limit)===Number(group.limit)&&x.unit===group.unit));
}
for(const rule of oilMetals.named_edible_seed_oils.rules){
 assert.ok(contaminants.metal_article_rules_v9[rule.metal].some(x=>
   x.article===rule.article&&Number(x.limit)===Number(rule.limit)&&x.unit===rule.unit));
}
for(const item of [...nickelOilById.values(),...seedOilById.values()]){
 const p=index.products.find(x=>x.id===item.catalog_id);
 assert.ok(p&&p.name===item.product_name&&p.fssr===item.fssr&&item.identity_verified===true);
 assert.ok(!oilMetals.excluded_nearby_catalog_ids.includes(item.catalog_id));
}
for(const id of oilMetals.excluded_nearby_catalog_ids)assert.ok(!nickelOilById.has(id)&&!seedOilById.has(id));
const vegMetal=contaminants.chapter_2_3_fresh_vegetables_exact_metal_v9;
assert.ok(vegMetal&&official(vegMetal.official_source_url));
assert.equal(vegMetal.official_article,"Vegetables");
assert.equal(vegMetal.identities.length,3);
assert.equal(vegMetal.full_contaminant_coverage,false);
assert.equal(vegMetal.pesticide_mrl_auto_apply,false);
const vegMetalById=new Map(vegMetal.identities.map(x=>[x.catalog_id,x]));
assert.equal(vegMetalById.size,3);
for(const route of vegMetal.identities){
 const product=index.products.find(x=>x.id===route.catalog_id);
 assert.ok(product&&route.product_name===product.name&&route.fcs===product.fcs&&product.fcs.startsWith("04.2.1."));
}
for(const rule of vegMetal.limits)assert.ok((contaminants.metal_article_rules_v9[rule.metal]||[]).some(x=>
 x.article===vegMetal.official_article&&Number(x.limit)===Number(rule.limit)&&x.unit===rule.unit));
const bisulphiteRoutes=contaminants.special_exact_metabisulphite_metal_articles_v9;
assert.ok(bisulphiteRoutes&&official(bisulphiteRoutes.official_source_url));
assert.equal(bisulphiteRoutes.verified_additive_identities.length,2);
assert.equal(bisulphiteRoutes.complete_contaminant_coverage,false);
assert.equal(bisulphiteRoutes.finished_food_additive_permission_verified,false);
const bisulphiteById=new Map(bisulphiteRoutes.verified_additive_identities.map(x=>[x.catalog_id,x]));
assert.equal(bisulphiteById.size,2);
for(const r of bisulphiteRoutes.verified_additive_identities){
 const p=index.products.find(x=>x.id===r.catalog_id);
 assert.ok(p&&p.name===r.product_name&&r.exact_ins_identity_verified===true);
 assert.equal(r.contaminants.length,2);
 for(const c of r.contaminants)assert.ok((contaminants.metal_article_rules_v9[c.metal]||[]).some(x=>
  x.article===r.official_article&&Number(x.limit)===Number(c.limit)&&x.unit===c.unit));
}
const otherOil=contaminants.chapter_2_2_other_named_oils_lead_v9;
assert.ok(otherOil && official(otherOil.official_source_url));
assert.equal(otherOil.verified_products.length,3);
assert.equal(otherOil.limit,0.1);
assert.equal(otherOil.complete_contaminant_coverage,false);
assert.equal(otherOil.pesticide_mrl_auto_apply,false);
for(const article of [otherOil.article_crude,otherOil.article_edible]){
 assert.ok(article.includes("other oils but excluding cocoa butter"));
 assert.ok(contaminants.metal_article_rules_v9.Lead.some(r=>
  r.article===article&&Number(r.limit)===Number(otherOil.limit)&&r.unit===otherOil.unit));
}
const otherOilById=new Map(otherOil.verified_products.map(x=>[x.catalog_id,x]));
assert.equal(otherOilById.size,3);
for(const route of otherOil.verified_products){
 const product=index.products.find(p=>p.id===route.catalog_id);
 assert.ok(product&&product.name===route.product_name&&product.fssr===route.fssr&&route.identity_checked);
 assert.ok(!otherOil.product_exclusions.includes(route.catalog_id));
}

const crudeOilLead=contaminants.chapter_2_2_solvent_crude_vegetable_oil_lead_v9;
assert.ok(crudeOilLead&&official(crudeOilLead.official_product_standard_url)&&official(crudeOilLead.official_contaminant_source_url));
assert.equal(crudeOilLead.catalog_id,"100-100-solvent-extracted-crude-vegetable-oils-not-for-direct-human-consumption");
assert.equal(crudeOilLead.product_name,"Solvent Extracted Crude Vegetable Oils (not for direct human consumption)");
assert.equal(crudeOilLead.fssr,"2.2.9");
assert.equal(crudeOilLead.match_only_exact_crude_vegetable_oil_identity,true);
assert.equal(crudeOilLead.arsenic_automatic_application,false);
assert.equal(crudeOilLead.exclude_cocoa_butter,true);
assert.equal(crudeOilLead.full_product_compliance_verified,false);
const crudeIdentity=index.products.find(x=>x.id===crudeOilLead.catalog_id);
assert.ok(crudeIdentity&&crudeIdentity.name===crudeOilLead.product_name&&crudeIdentity.fssr===crudeOilLead.fssr);
assert.equal((contaminants.metal_article_rules_v9.Lead||[]).filter(x=>
 x.row_type==="exact"&&x.article===crudeOilLead.official_article&&x.limit===0.1&&x.unit==="mg/kg").length,1);
assert.ok((contaminants.metal_article_rules_v9.Arsenic||[]).some(x=>
 x.row_type==="exact"&&x.article.startsWith("Vegetable oils, crude")&&x.limit===0.1&&x.unit==="mg/kg"&&!x.article.includes("other oils")));
const crudeStandard=chapterRecord(crudeIdentity).record;
assert.equal(crudeStandard.key,"2.2.9");assert.equal(crudeStandard.name,crudeOilLead.product_name);
assert.ok(/food grade hexane/i.test(crudeStandard.definition));
assert.ok((crudeStandard.process_rules||[]).some(x=>/not for direct human consumption/i.test(x)));

const guar=contaminants.special_guar_gum_exact_metal_article_v9;
assert.ok(guar&&official(guar.official_source_url)&&official(guar.official_identity_source_url));
assert.equal(guar.catalog_id,"99-99-1-gelling-agent-or-thickener-or-stabilizer-guar-gum");
assert.equal(guar.identity_ins,"412");
assert.equal(guar.identity_clause,"3.2.11(10)");
assert.equal(guar.official_article_spelling,"Gaur gum");
assert.equal(guar.exact_ins_product_identity_verified,true);
assert.equal(guar.complete_contaminant_coverage,false);
assert.equal(guar.finished_food_additive_use_approved,false);
const guarProduct=index.products.find(p=>p.id===guar.catalog_id);
assert.ok(guarProduct&&guarProduct.name===guar.product_name&&guarProduct.fcs===guar.fcs);
for(const m of guar.metals){
 assert.ok(contaminants.metal_article_rules_v9[m.metal].some(x=>
  x.article===guar.official_article_spelling&&Number(x.limit)===Number(m.limit)&&x.unit===m.unit));
}
// Exact 2.4.30 soybean identities: shared B1 already in the runtime; Total
// Aflatoxins 20 vs oilseed 15 is CONDITIONAL REFERENCE ONLY, not a PASS.
const soyReview=contaminants.chapter_2_4_nonfermented_soybean_total_aflatoxin_conditional_v9;
assert.ok(soyReview&&soyReview.not_auto_applied===true&&soyReview.full_compliance_verified===false);
assert.equal(soyReview.records.length,5);
assert.equal(new Set(soyReview.records.map(x=>x.catalog_id)).size,5);
assert.equal(soyReview.source_section,"2.2.1");
assert.equal(soyReview.source_pdf_page_one_based,14);
assert.ok(official(soyReview.source_standard_url));
assert.ok(official(soyReview.source_contaminants_url));
assert.equal(soyReview.conditional_total_aflatoxin_composite_food_limit,20);
assert.equal(soyReview.comparison_raw_oilseed_total_aflatoxin_limit,15);
for(const [key,article,limit] of [
 ["total_aflatoxins",soyReview.applicable_article_for_review,20],
 ["total_aflatoxins",soyReview.comparison_raw_oilseed_article,15]
]){
 const group=contaminants.crop_contaminants[key];
 assert.equal(group.unit,"µg/kg");
 assert.equal(group.rules.filter(x=>x.article===article&&Number(x.limit)===limit).length,1);
}
const soyReviewById=new Map();
for(const r of soyReview.records){
 const p=index.products.find(x=>x.id===r.catalog_id);
 assert.ok(p&&p.name===r.product_name&&p.fssr==="2.4.30"&&r.fssr===p.fssr,
  "Soybean exact source identity mismatch: "+r.catalog_id);
 assert.equal(r.identity_verified,true);assert.equal(r.not_auto_applied,true);
 soyReviewById.set(r.catalog_id,r);
}
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
assert.equal(exactRawPulses?.quality_clause_catalogue_link_status,"verified_specific_clause_rule_key_parent_fssr_retained");
assert.equal(exactRawPulses?.quality_clause_catalogue_key,"2.4.6(16)");
assert.equal(index.products.find(p=>p.id===exactRawPulses.catalog_id)?.rule_key,"2.4.6(16)");
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
assert.equal(rawPulsesStandard.status,"source_exact_specific_clause_linked_parent_fssr");
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

const exactDriedMangoSpices=[
 ["12-12-2-dried-mango-powder-amchur","Dried Mango Powder (Amchur)","2.9.24"],
 ["12-12-2-dried-mango-slices","Dried Mango Slices","2.9.23"]
];
for(const [id,name,fssr] of exactDriedMangoSpices){
 const p=index.products.find(x=>x.id===id);
 assert.ok(p&&p.name===name&&p.fssr===fssr&&p.fcs==="12.2.1","Invalid exact dried mango spice identity "+id);
 const chapter=chapterRecord(p);assert.equal(chapter.record.key,fssr);assert.equal(chapter.record.name,name);
 const matches=contaminants.spice_crop_contaminant_identity_mappings_v9.filter(x=>x.catalog_id===id);
 assert.equal(matches.length,1,"Duplicate/missing spice article mapping "+id);
 const m=matches[0];
 assert.equal(m.product_name,name);assert.equal(m.fssr,fssr);assert.equal(m.fcs,"12.2.1");
 assert.equal(m.article,"Spices/Spice Mix");assert.equal(m.unit,"µg/kg");
 assert.equal(m.total_aflatoxins_limit,30);assert.equal(m.aflatoxin_b1_limit,15);
 assert.ok(official(m.identity_source_url)&&chapter.sourceUrls.includes(m.identity_source_url));
 assert.equal(m.full_compliance_verified,false);assert.equal(m.all_residue_mrls_verified,false);
 for(const [key,limit] of [["total_aflatoxins",30],["aflatoxin_b1",15]]){
  const group=contaminants.crop_contaminants[key];assert.equal(group.unit,"µg/kg");
  assert.equal(group.rules.filter(z=>z.article==="Spices/Spice Mix"&&Number(z.limit)===limit).length,1);
 }
}
const rawMeatMetalLocks=new Map();
for(const row of contaminants.chapter_2_5_locked_fresh_meat_routes_v9||[]){
 for(const id of row.catalog_ids||[]){
   assert.ok(!rawMeatMetalLocks.has(id),"Duplicate raw goat/rabbit metal lock "+id);
   rawMeatMetalLocks.set(id,row);
 }
}
assert.equal(rawMeatMetalLocks.size,4,"Expected four raw/frozen goat/rabbit metal locks");
// Source-pinned NOTS evidence for two exact FSSR 2.7 confectionery products.
// Previous Chapter 2.7 fail-closed metal/profile locks are deliberately retained.
const confectioneryHCN=contaminants.chapter_2_7_exact_confectionery_hydrocyanic_v9;
assert.ok(confectioneryHCN && official(confectioneryHCN.official_source_url)
 && official(confectioneryHCN.official_foscos_identity_source_url)
 && official(confectioneryHCN.official_fssr_chapter_2_7_url));
assert.equal(confectioneryHCN.source_version,contaminants.source_version);
assert.equal(confectioneryHCN.article,"Confectionery");
assert.equal(confectioneryHCN.contaminant,"Hydrocyanic acid");
assert.equal(confectioneryHCN.limit,5);assert.equal(confectioneryHCN.unit,"ppm");
assert.equal(confectioneryHCN.verified_product_identities.length,2);
assert.equal(confectioneryHCN.complete_contaminant_coverage,false);
assert.equal(confectioneryHCN.existing_finished_metal_locks_retained,true);
assert.equal(confectioneryHCN.do_not_inherit_hard_candy_metals,true);
assert.equal(confectioneryHCN.full_compliance_verified,false);
const verifiedHCNSource=(contaminants.naturally_occurring_toxic_substances.hydrocyanic_acid||[])
 .filter(x=>x.article===confectioneryHCN.article&&x.limit===confectioneryHCN.limit&&x.unit===confectioneryHCN.unit);
assert.equal(verifiedHCNSource.length,1,"Official Confectionery hydrocyanic acid source row changed");
const confectioneryHCNById=new Map(confectioneryHCN.verified_product_identities.map(x=>[x.catalog_id,x]));
assert.equal(confectioneryHCNById.size,2);
for(const proof of confectioneryHCN.verified_product_identities){
 const product=index.products.find(x=>x.id===proof.catalog_id);
 assert.ok(product&&product.name===proof.product_name&&product.fssr===proof.fssr&&product.fcs===proof.fcs);
 assert.ok(product.fcs.startsWith("05.2."),"Not standard FoSCoS confectionery 05.2");
 assert.equal(proof.exact_confectionery_identity_verified,true);
 assert.ok(lockById.has(proof.catalog_id),"Metal inheritance lock accidentally removed: "+proof.catalog_id);
}
for(const id of confectioneryHCN.excluded_nearby_catalog_ids||[])assert.ok(!confectioneryHCNById.has(id));

/* Additional 39 partial commodity/article identities; no complete MRL/purity
 * assessment and no general infant-versus-ready-formula lead inheritance. */
const namedMilkEvidence=contaminants.chapter_2_1_verified_milk_products_mrl_v9;
const infantMetalEvidence=contaminants.chapter_13_verified_infant_food_metals_v9;
assert.ok(namedMilkEvidence&&infantMetalEvidence);
for(const x of [namedMilkEvidence,infantMetalEvidence]){
 assert.equal(x.source_version,contaminants.source_version);
 assert.equal(x.official_source_url,version9Source);
 assert.equal(x.full_compliance_verified,false);
}
assert.equal(namedMilkEvidence.verified_product_identities.length,33);
assert.equal(namedMilkEvidence.cheese_count,27);
assert.equal(namedMilkEvidence.fermented_count,6);
assert.equal(namedMilkEvidence.auto_apply_cheese,false);
assert.equal((contaminants.residue_mrls.pesticides||[])
 .filter(x=>x.name==="Acetamiprid")
 .flatMap(x=>x.rows.filter(r=>r.food==="Milk and Milk products"
   &&r.mrl==="0.02"&&r.unit==="mg/kg")).length,1);
const verifiedMilkIds=new Map(namedMilkEvidence.verified_product_identities.map(x=>[x.catalog_id,x]));
const verifiedInfantIds=new Map(infantMetalEvidence.verified_product_identities.map(x=>[x.catalog_id,x]));
assert.equal(verifiedMilkIds.size,33);
assert.equal(verifiedInfantIds.size,6);
for(const x of verifiedMilkIds.values()){
 const p=index.products.find(z=>z.id===x.catalog_id);
 assert.ok(p&&p.name===x.product_name&&p.fssr===x.fssr&&p.fcs===x.fcs
  &&x.exact_catalogue_identity_verified===true,"Milk-product identity changed "+x.catalog_id);
 assert.ok((p.fssr==="2.1.17"&&p.fcs.startsWith("01.6."))
   ||(p.fssr==="2.1.13"&&p.fcs.startsWith("01.")),p.id);
}
assert.equal(infantMetalEvidence.verified_product_identities.length,6);
assert.equal(infantMetalEvidence.lead_0_2_not_auto_assigned,true);
assert.equal(infantMetalEvidence.ready_formula_lead_0_02_not_auto_assigned,true);
for(const x of verifiedInfantIds.values()){
 const p=index.products.find(z=>z.id===x.catalog_id);
 assert.ok(p&&p.name===x.product_name&&p.fssr===x.fssr&&p.fcs===x.fcs
  &&p.fcs.startsWith("13.")&&x.exact_catalogue_identity_verified===true);
}
for(const x of infantMetalEvidence.verified_rows){
 assert.ok(["Arsenic","Cadmium"].includes(x.metal));
 assert.equal((contaminants.metal_article_rules_v9[x.metal]||[]).filter(r=>
   r.row_type==="exact"&&r.article===x.article&&r.limit===x.limit&&r.unit===x.unit).length,1);
}


/* Official-source partial commodity reconciliation: twenty exact milk-product
 * article references and two botanical-source cereal B1 records. */
const additionalMilk=contaminants.chapter_2_1_additional_milk_commodity_evidence_v9;
const maizeWheat=contaminants.chapter_2_4_maize_wheat_b1_exact_v9;
assert.ok(additionalMilk&&maizeWheat);
assert.equal(additionalMilk.source_version,contaminants.source_version);
assert.equal(maizeWheat.source_version,contaminants.source_version);
assert.equal(additionalMilk.official_source_url,version9Source);
assert.equal(maizeWheat.official_contaminants_url,version9Source);
assert.ok(official(additionalMilk.source_standard_url));
assert.ok(official(maizeWheat.official_standard_url));
assert.equal(additionalMilk.source_match_only,true);
assert.equal(additionalMilk.auto_assign_numeric_pesticide_mrl,false);
assert.equal(additionalMilk.full_compliance_verified,false);
assert.equal(additionalMilk.exact_products.length,20);
assert.equal((contaminants.residue_mrls.pesticides||[]).filter(x=>x.name===additionalMilk.reference_pesticide)
 .flatMap(x=>(x.rows||[]).filter(z=>z.food===additionalMilk.article
  &&z.mrl===additionalMilk.reference_mrl&&z.unit===additionalMilk.unit)).length,1);
const additionalMilkById=new Map(additionalMilk.exact_products.map(x=>[x.catalog_id,x]));
assert.equal(additionalMilkById.size,20);
for(const x of additionalMilkById.values()){
 const p=index.products.find(z=>z.id===x.catalog_id);
 assert.ok(p&&p.name===x.product_name&&p.fssr===x.fssr&&p.fcs===x.fcs
  &&x.exact_identity_verified===true&&/^2\.1\./.test(p.fssr));
 assert.ok(!/analogue|frozen dessert|ice cream|colostrum|stuffed fried|lactose/i.test(p.name));
 const officialStandard=chapterRecord(p);
 assert.equal(officialStandard.record.key,p.fssr);
 assert.ok(officialStandard.sourceUrls.some(x=>official(x)));
}
assert.equal(maizeWheat.exact_products.length,2);
assert.equal(maizeWheat.contaminant,"Aflatoxin B1");
assert.equal(maizeWheat.limit,10);
assert.equal(maizeWheat.unit,"µg/kg");
assert.equal(maizeWheat.total_aflatoxins_not_auto_assigned,true);
assert.equal(maizeWheat.full_contaminant_coverage,false);
const maizeWheatById=new Map(maizeWheat.exact_products.map(x=>[x.catalog_id,x]));
assert.equal(maizeWheatById.size,2);
const expectedCereal={
 "06-06-2-maize-starch":"2.4.7",
 "06-06-2-wheat-protein-products-including-wheat-gluten":"2.4.22"
};
for(const x of maizeWheatById.values()){
 const p=index.products.find(z=>z.id===x.catalog_id);
 assert.ok(p&&p.name===x.product_name&&p.fssr===x.fssr&&p.fcs===x.fcs
  &&x.exact_identity_verified===true&&expectedCereal[p.id]===p.fssr);
 const chapter=chapterRecord(p);
 assert.equal(chapter.record.key,p.fssr);
 assert.ok(chapter.sourceUrls.includes(maizeWheat.official_standard_url));
 if(p.fssr==="2.4.7")assert.match(chapter.record.definition,/Zea mays L\./);
 if(p.fssr==="2.4.22")assert.ok(chapter.record.variants.some(x=>/wheat gluten/i.test(x.name)));
}
const b1Source=contaminants.crop_contaminants.aflatoxin_b1;
assert.equal(b1Source.unit,"µg/kg");
for(const article of maizeWheat.source_articles)
 assert.equal((b1Source.rules||[]).filter(x=>x.article===article&&x.limit===10).length,1);


/* Three exact FoSCoS fresh-fruit forms: commodity pesticide article reference
 * only, not a finished-food MRL approval; processed/dried fruit excluded. */
const freshFruitEvidence=contaminants.chapter_special_fresh_fruits_pesticide_article_v9;
assert.ok(freshFruitEvidence);
assert.equal(freshFruitEvidence.source_version,contaminants.source_version);
assert.equal(freshFruitEvidence.official_source_url,version9Source);
assert.equal(freshFruitEvidence.article,"Fruits");
assert.equal(freshFruitEvidence.source_pesticide,"2,4-Dichlorophenoxy Acetic Acid");
assert.equal(freshFruitEvidence.source_mrl,"2");
assert.equal(freshFruitEvidence.unit,"mg/kg");
assert.equal(freshFruitEvidence.finished_food_mrl_auto_applied,false);
assert.equal(freshFruitEvidence.full_compliance_verified,false);
assert.equal(freshFruitEvidence.identity_rows.length,3);
const freshFruitRows=(contaminants.residue_mrls.pesticides||[])
 .filter(x=>x.name===freshFruitEvidence.source_pesticide)
 .flatMap(x=>(x.rows||[]).filter(r=>r.food==="Fruits"&&r.mrl==="2"&&r.unit==="mg/kg"));
assert.equal(freshFruitRows.length,1,"Official FSSAI fresh Fruits source drift");
const freshFruitById=new Map(freshFruitEvidence.identity_rows.map(x=>[x.catalog_id,x]));
assert.equal(freshFruitById.size,3);
for(const x of freshFruitById.values()){
 const p=index.products.find(z=>z.id===x.catalog_id);
 assert.ok(p&&p.name===x.product_name&&p.fssr===x.fssr&&p.fcs===x.fcs
  &&x.identity_verified===true&&x.source_commodity_article==="Fruits");
 assert.ok(["04.1.1.1","04.1.1.2","04.1.1.3"].includes(p.fcs));
 assert.equal(x.processing_qualification_required,p.fcs==="04.1.1.3");
}

// The following are exact identity/source article matches, not laboratory
// compliance decisions or permission to transfer a raw-commodity MRL.
assert.equal(fourCompositeSources.matched_product_count,4);
assert.equal(fourCompositeSources.official_source,version9Source);
assert.equal(fourCompositeSources.allowed_auto_pass_count,0);
const fourCompositeById=new Map();
for(const row of fourCompositeSources.matched){
 const p=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs,
    "Changed product ID for V9 composite/Saffrole source: "+row.catalog_id);
 assert.equal(row.official_contaminants_source,version9Source);
 assert.equal(row.finished_product_numeric_limit_auto_applied,false);
 assert.equal(row.raw_crop_limit_inherited,false);
 assert.equal(row.full_compliance_claim,false);
 assert.ok(official(row.official_standard_source));
 if(row.source_group==="aflatoxin_b1"){
   const group=contaminants.crop_contaminants?.aflatoxin_b1;
   assert.equal(row.contaminant,"Aflatoxin B1");
   assert.equal(row.article,"Food product containing any of the above mentioned food articles");
   assert.equal(row.limit,10);assert.equal(row.unit,"µg/kg");
   assert.equal(group?.unit,"µg/kg");
   assert.equal((group.rules||[]).filter(x=>x.article===row.article
       &&Number(x.limit)===row.limit&&String(x.unit||group.unit)===row.unit).length,1);
   if(row.fssr==="2.3.57"){
     const {record}=chapterRecord(p);
     assert.equal(record.key,"2.3.57");assert.equal(record.name,"Fermented Soybean Paste");
     assert.ok(record.basic_ingredients?.includes("soybean"));
     assert.equal(record.variants?.length,2);
   }else{
     const route=special.routes.find(x=>x.product_id===p.id);
     assert.ok(route && route.category_code===p.fcs
        &&route.route_kind==="indian_sweets_snacks_category"
        &&route.official_source===row.official_standard_source);
     assert.ok(["18.1.2.1","18.1.2.2"].includes(p.fcs));
   }
 }else if(row.source_group==="saffrole"){
   const {record}=chapterRecord(p);
   assert.equal(p.id,"12-12-5-soup-powders");
   assert.equal(p.fssr,"2.3.15");
   assert.equal(record.key,p.fssr);assert.equal(record.name,"Soup Powders");
   assert.ok((contaminants.naturally_occurring_toxic_substances?.saffrole||[]).some(x=>
     x.article===row.article&&x.limit===10&&x.unit==="ppm"));
   assert.equal(row.article,"Soups and sauces");
   assert.ok(row.applicability_note.includes("Dry powder versus reconstituted"));
 }else throw new Error("Unexpected source type "+row.source_group);
 assert.ok(!fourCompositeById.has(row.catalog_id));
 fourCompositeById.set(row.catalog_id,row);
}
assert.equal(fourCompositeById.size,4);
for(const x of fourCompositeSources.excluded_ids){
 assert.ok(index.products.some(p=>p.id===x));
 assert.ok(!fourCompositeById.has(x),"Non-equivalent product inherited composite rule: "+x);
}

// Direct Version IX named-category NOTS evidence for eight beverages and
// two finished confectionery standards. The remaining fifteen reviewed products
// have qualified candidates only, never an exact evidence promotion.
assert.equal(crossFamilyNOTS.verified_identity_article_matches,10);
assert.equal(crossFamilyNOTS.conditionally_reviewed_not_promoted,15);
assert.equal(crossFamilyNOTS.total_reviewed,25);
assert.equal(crossFamilyNOTS.full_product_compliance_passes,0);
assert.equal(crossFamilyNOTS.official_contaminants_source,version9Source);
const crossFamilyById=new Map();
for(const row of crossFamilyNOTS.matched){
  const product=index.products.find(p=>p.id===row.catalog_id);
  assert.ok(product&&product.name===row.product_name&&product.fssr===row.fssr
    &&product.fcs===row.fcs&&product.rule_key===row.standard_source_clause,
    "Wrong official NOTS product identity: "+row.catalog_id);
  assert.equal(row.source_row_verified,true);
  assert.equal(row.finished_food_compliance_pass,false);
  assert.equal(row.complete_contaminant_panel_verified,false);
  assert.equal(row.auto_apply_numeric_finished_food_limit,false);
  assert.equal(row.official_contaminants_source,version9Source);
  assert.ok(official(row.official_standard_source));
  assert.equal(row.official_version_ix_pdf_page_one_based,15);
  const {record,sourceUrls}=chapterRecord(product);
  assert.equal(record.key,product.fssr);
  assert.ok(sourceUrls.some(x=>x.replace("://www.","://")===row.official_standard_source.replace("://www.","://")),
    "NOTS source does not match product's chapter: "+row.catalog_id);
  const expected=row.source_group==="saffrole"
    ?{article:"Non-alcoholic beverages",contaminant:"Saffrole",limit:10,unit:"ppm"}
    :row.source_group==="hydrocyanic_acid"
      ?{article:"Confectionery",contaminant:"Hydrocyanic acid",limit:5,unit:"ppm"}
      :null;
  assert.ok(expected,"Unexpected NOTS substance "+row.source_group);
  assert.equal(row.article,expected.article);
  assert.equal(row.contaminant,expected.contaminant);
  assert.equal(row.limit,expected.limit);
  assert.equal(row.unit,expected.unit);
  assert.equal((contaminants.naturally_occurring_toxic_substances?.[row.source_group]||[])
    .filter(v=>v.article===expected.article&&v.limit===expected.limit&&v.unit===expected.unit).length,1,
    "Version IX named NOTS row changed: "+row.catalog_id);
  if(row.source_group==="saffrole"){
    assert.ok(["2.3.21","2.3.22","2.3.23","2.3.24"].includes(product.fssr));
    assert.ok(product.fcs.startsWith("14.1.4."));
    assert.equal(row.finished_or_reconstituted_form_must_be_confirmed,true);
  }else{
    assert.ok(["2.7.3","2.7.4"].includes(product.fssr));
    assert.ok(product.fcs==="05.1.3"||product.fcs==="05.3");
    assert.ok(lockById.has(product.id),
      "Previously locked confectionery requires explicit verified NOTS source: "+product.id);
  }
  assert.ok(!crossFamilyById.has(row.catalog_id));
  crossFamilyById.set(row.catalog_id,row);
}
assert.equal(crossFamilyById.size,10);
const conditionalFamilyIds=new Set();
for(const row of crossFamilyNOTS.conditional_review_only){
  const product=index.products.find(p=>p.id===row.catalog_id);
  assert.ok(product&&product.name===row.product_name&&product.fssr===row.fssr
    &&product.fcs===row.fcs,"Wrong review-only NOTS identity: "+row.catalog_id);
  assert.equal(row.source_document,version9Source);
  assert.equal(row.source_match_to_specific_finished_product_confirmed,false);
  assert.equal(row.auto_apply_numeric_limit,false);
  assert.equal(row.compliance_pass,false);
  assert.ok(!crossFamilyById.has(row.catalog_id));
  assert.ok(!conditionalFamilyIds.has(row.catalog_id));
  conditionalFamilyIds.add(row.catalog_id);
}
assert.equal(conditionalFamilyIds.size,15);
for(const id of crossFamilyNOTS.excluded_inheritance){
  assert.ok(index.products.some(p=>p.id===id));
  assert.ok(!crossFamilyById.has(id),"Excluded article inherited incorrectly: "+id);
}

// Verify ten exact regulatory source-category identity matches; never treat
// their pesticide/metal/mycotoxin/NOTS reference numbers as tested limits.
assert.equal(batch40Source.exact_identity_article_partial_promotions,10);
assert.equal(batch40Source.conditional_scope_reconciliations_not_promoted,30);
assert.equal(batch40Source.rows.length,10);
assert.equal(batch40Source.negative_controls.length,30);
assert.equal(batch40Source.batch_reviewed,40);
assert.equal(batch40Source.total_catalogue,533);
assert.equal(batch40Source.complete_legal_compliance_passes,0);
assert.equal(batch40Source.source,version9Source);
const batch40ById=new Map(),reviewOnlyIds=new Set();
for(const row of batch40Source.rows){
 const p=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs,
  "Batch40 product identity drift: "+row.catalog_id);
 assert.equal(row.version_ix_source,version9Source);
 assert.equal(row.exact_catalogue_identity_matched,true);
 assert.equal(row.version_ix_source_article_confirmed,true);
 assert.equal(row.source_article_applicability_to_supplied_finished_matrix_unconditionally_established,false);
 assert.equal(row.finished_product_numeric_limit_auto_applied,false);
 assert.equal(row.finished_food_laboratory_result_compared,false);
 assert.equal(row.full_pesticide_contaminant_or_amendment_coverage,false);
 assert.equal(row.legal_compliance_pass,false);
 assert.ok(official(row.identity_source));
 assert.ok(row.regulatory_identity_reason.length>30&&row.processing_and_applicability_remaining.length>30);
 assert.ok(Array.isArray(row.official_FSSAI_article_references)&&row.official_FSSAI_article_references.length>0);
 for(const q of row.official_FSSAI_article_references){
  if(row.source_family==='milk'){
   assert.equal(q.group,'Acetamiprid');assert.equal(q.article,'Milk and Milk products');
   assert.equal(q.value,0.02);assert.equal(q.unit,'mg/kg');
   assert.equal((contaminants.residue_mrls.pesticides||[])
    .filter(x=>x.name===q.group).flatMap(x=>x.rows||[])
    .filter(x=>x.food===q.article&&x.mrl==='0.02'&&x.unit==='mg/kg').length,1);
  }else if(row.source_family==='juice'){
   assert.equal(q.group,'Lead');assert.equal(q.value,1);assert.equal(q.unit,'mg/kg');
   assert.ok(/fruit and vegetable juice/i.test(q.article)&&!p.name.toLowerCase().includes('pulp/puree'));
   assert.equal((contaminants.metal_article_rules_v9.Lead||[])
    .filter(x=>x.row_type==='exact'&&normalizeArticle(x.article)===normalizeArticle(q.article)
      &&Number(x.limit)===q.value&&x.unit===q.unit).length,1,
    'Changed FSSAI fruit/vegetable juice source row');
  }else if(row.source_family==='spice'){
   assert.equal(q.article,'Spices/Spice Mix');assert.equal(q.unit,'µg/kg');
   assert.ok(['Aflatoxin B1','Total Aflatoxins'].includes(q.group));
   const g=contaminants.crop_contaminants[q.group==='Aflatoxin B1'?'aflatoxin_b1':'total_aflatoxins'];
   assert.ok(g,"Missing FSSAI spices mycotoxin source "+q.group);
   assert.equal((g.rules||[]).filter(x=>x.article===q.article
     &&Number(x.limit)===q.value&&String(x.unit||g.unit)===q.unit).length,1);
  }else if(row.source_family==='bev'){
   assert.equal(q.group,'Saffrole');assert.equal(q.article,'Non-alcoholic beverages');
   assert.equal(q.value,10);assert.equal(q.unit,'ppm');
   assert.equal((contaminants.naturally_occurring_toxic_substances.saffrole||[])
     .filter(x=>x.article===q.article&&x.limit===q.value&&x.unit===q.unit).length,1);
  }else throw new Error("Unexpected batch40 evidence family "+row.source_family);
 }
 if(row.source_family==='milk'){
  assert.ok(row.fcs.startsWith('18.1.1.')&&row.fssr==='');
  const route=special.routes.find(x=>x.product_id===p.id);
  assert.ok(route&&route.route_kind==='indian_sweets_snacks_category'
   &&route.category_code===row.fcs&&route.official_source===row.identity_source);
 }else{
  const {record,sourceUrls}=chapterRecord(p);
  assert.equal(record.key,p.fssr);
  assert.ok(sourceUrls.some(x=>x.replace('://www.', '://')===row.identity_source.replace('://www.', '://')));
  if(row.source_family==='juice')assert.ok(['2.3.16','2.3.17'].includes(p.fssr));
  if(row.source_family==='bev'){assert.equal(p.fssr,'2.3.40');assert.equal(p.fcs,'14.1.4.3');}
  if(row.source_family==='spice'){assert.equal(p.fssr,'2.9.29');assert.equal(p.fcs,'12.2.1');}
 }
 assert.ok(!batch40ById.has(row.catalog_id));
 batch40ById.set(row.catalog_id,row);
}
for(const row of batch40Source.negative_controls){
 const p=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs);
 assert.equal(row.source,batch40Source.source);
 assert.equal(row.source_matched_exact_product_article,false);
 assert.equal(row.auto_apply_numeric_limit,false);
 assert.equal(row.finished_product_compliance_pass,false);
 assert.ok(row.source_scope_unresolved.length>70);
 assert.ok(!batch40ById.has(row.catalog_id));
 assert.ok(!reviewOnlyIds.has(row.catalog_id));
 reviewOnlyIds.add(row.catalog_id);
}
assert.equal(batch40ById.size,10);
assert.equal(reviewOnlyIds.size,30);

// The 136-source review is a true per-catalogue snapshot: no generically
// fabricated "no limit" or compliance result. Ten new reference rows must
// exist in the loaded CURRENT Version IX source table at the correct values.
assert.equal(pending136FullReview.products_individually_reconciled,136);
assert.equal(pending136FullReview.previous_partial,397);
assert.equal(pending136FullReview.updated_partial,407);
assert.equal(pending136FullReview.source_pinned_partial_matches_new,10);
assert.equal(pending136FullReview.retained_pending_source_gaps,126);
assert.equal(pending136FullReview.full_contaminant_compliance_passes,0);
assert.equal(pending136FullReview.regulatory_source,version9Source);
assert.equal(pending136FullReview.records.length,136);
assert.equal(next10ExactSource.baseline_all,533);
assert.equal(next10ExactSource.baseline_pending,136);
assert.equal(next10ExactSource.additional_partial_source_matches,10);
assert.equal(next10ExactSource.new_partial,407);
assert.equal(next10ExactSource.new_pending,126);
assert.equal(next10ExactSource.complete_product_compliance_passes,0);
assert.equal(next10ExactSource.numeric_limits_auto_applied,0);
assert.equal(next10ExactSource.official_ctr_source,version9Source);
const next10ById=new Map();
for(const row of next10ExactSource.matched){
 const p=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs,
  "Next10 changed catalogue identity: "+row.catalog_id);
 assert.equal(row.official_ctr_source,version9Source);
 assert.equal(row.exact_catalogue_article_relationship_verified,true);
 assert.equal(row.source_article_fully_applicable_to_all_forms_or_recipes,false);
 assert.equal(row.ready_to_compare_sample_result,false);
 assert.equal(row.pesticide_panel_or_full_metal_panel_completed,false);
 assert.equal(row.current_amendments_fully_reconciled,false);
 assert.equal(row.finished_product_numeric_pass,false);
 assert.equal(row.claim_that_no_other_limit_applies,false);
 assert.ok(official(row.official_standard_source));
 assert.ok(row.specific_processing_or_recipe_disqualification.length>100);
 const {article_group:k,official_named_article:article,source_reference_limit:limit}=row;
 const metalRows=contaminants.metal_article_rules_v9?.Lead||[];
 const namedMetal=(expected,value)=>metalRows.filter(x=>x.row_type==="exact"
   &&normalizeArticle(x.article)===normalizeArticle(expected)&&Number(x.limit)===value).length===1;
 if(k==="dried_dates_malathion"){
  assert.equal(p.fssr,"2.3.47(4)");assert.equal(row.parameter,"Malathion (sum of malathion and malaoxon)");
  assert.equal(article,"Dried fruits");assert.equal(limit,8);assert.equal(row.source_reference_unit,"mg/kg");
  assert.equal((contaminants.residue_mrls?.pesticides||[])
   .filter(x=>x.name===driedFruitMalathion.pesticide_name)
   .flatMap(x=>x.rows||[]).filter(x=>x.food==="Dried fruits"&&Number(x.mrl)===8&&x.unit==="mg/kg").length,1);
 }else if(k==="vanilla_dried_spice_lead"||k==="flavouring_premix_lead_dry_basis"){
  assert.equal(row.parameter,"Lead");assert.equal(limit,10);
  assert.equal(row.source_reference_unit,"mg/kg on dry matter basis");
  assert.ok(article.startsWith("Dehydrated onions, dried herbs and spices"));
  assert.ok(article.includes("flavourings"));
  assert.ok(metalRows.some(x=>x.row_type==="exact"&&Number(x.limit)===10
    &&normalizeArticle(x.article).startsWith("dehydrated onions dried herbs and spices")
    &&normalizeArticle(x.article).includes("flavourings")),
    "Lead 10 mg/kg dry basis named dried-spice/flavouring official article changed");
  if(k==="vanilla_dried_spice_lead")assert.ok(p.fssr.startsWith("2.3.50"));
  else {assert.equal(p.fcs,"99.3");assert.ok(special.routes.some(x=>x.product_id===p.id
    &&x.route_kind==="flavouring_preparation_fcs_99_3"));}
 }else if(k==="harissa_spice_composite_b1"||k==="spice_mouth_freshener_composite_b1"){
  assert.equal(row.parameter,"Aflatoxin B1");assert.equal(limit,10);
  assert.equal(row.source_reference_unit,"µg/kg");
  assert.equal(article,"Food product containing any of the above mentioned food articles");
  assert.equal((contaminants.crop_contaminants?.aflatoxin_b1?.rules||[])
   .filter(x=>x.article===article&&Number(x.limit)===10).length,1);
  assert.ok((contaminants.crop_contaminants?.aflatoxin_b1?.rules||[])
   .some(x=>x.article==="Spices/Spice Mix"&&Number(x.limit)===15));
  if(k==="harissa_spice_composite_b1")assert.equal(p.fssr,"2.3.58");
  else {assert.equal(p.fcs,"05.2.4.2");assert.ok(special.routes.some(x=>x.product_id===p.id));}
 }else if(k==="finished_frozen_confection_lead"){
  assert.equal(p.fssr,"2.1.15");assert.equal(row.parameter,"Lead");
  assert.equal(article,"Ice-cream, iced lollies and similar frozen confections");
  assert.equal(limit,1);assert.equal(row.source_reference_unit,"mg/kg");
  assert.ok(namedMetal(article,1));
 }else if(k==="instant_tea_lead_dry_basis"){
  assert.equal(p.fssr,"2.10.1(4)");assert.equal(row.parameter,"Lead");
  assert.equal(article,"Tea");assert.equal(limit,5);
  assert.equal(row.source_reference_unit,"mg/kg on dry matter basis");
  assert.ok(namedMetal("Tea",5));
 }else throw Error("Unknown new regulatory article type "+k);
 if(p.rule_key) {const x=chapterRecord(p);assert.ok(x.record&&x.record.key===p.rule_key);}
 assert.ok(!next10ById.has(p.id),"Duplicate identity "+p.id);
 next10ById.set(p.id,row);
}
assert.equal(next10ById.size,10);
const history136=new Map();
for(const row of pending136FullReview.records){
 const p=index.products.find(x=>x.id===row.catalog_id);
 assert.ok(p&&p.name===row.product_name&&p.fssr===row.fssr&&p.fcs===row.fcs);
 assert.equal(row.official_ctr,version9Source);
 assert.equal(row.separate_source_verification_required,true);
 assert.equal(row.confirm_operational_2026_amendments,true);
 assert.equal(row.numeric_limit_auto_applied_to_product,false);
 assert.equal(row.finished_product_compliance_pass,false);
 assert.equal(row.legally_cleared_or_exempt,false);
 assert.ok(row.per_product_matrix_or_recipe_step.length>20);
 assert.ok(row.per_product_prohibited_inheritance.length>20);
 assert.equal(row.evidence_disposition,next10ById.has(p.id)
  ?"partial_named_article_identity_source_only":"no_first_exact_named_article_yet");
 assert.ok(!history136.has(p.id));
 history136.set(p.id,row);
}
assert.equal(history136.size,136);
for(const p of next10ById.values())assert.ok(history136.has(p.catalog_id));
for(const id of next10ExactSource.negative_example_ids){
 assert.ok(index.products.some(x=>x.id===id));
 assert.ok(!next10ById.has(id),"Ineligible product inherited source: "+id);
}

// A named product-standard residual solvent limit is partial chemical source
// evidence, not a crop pesticide MRL or universal food purity approval.
const coconutProduct=index.products.find(p=>p.id===coconutHexaneSource.catalog_id);
assert.ok(coconutProduct&&coconutProduct.name===coconutHexaneSource.product_name
 &&coconutProduct.fssr===coconutHexaneSource.fssr
 &&coconutProduct.fcs===coconutHexaneSource.fcs);
assert.ok(official(coconutHexaneSource.official_source_url));
assert.equal(coconutHexaneSource.max,10);
assert.equal(coconutHexaneSource.unit,"ppm");
assert.equal(coconutHexaneSource.chemical_residue,"Food-grade hexane");
assert.equal(coconutHexaneSource.compliance_approval,false);
assert.equal(coconutHexaneSource.automatic_cross_product_inheritance,false);
const coconutStandard=chapterRecord(coconutProduct);
assert.equal(coconutStandard.record.key,"2.4.13(4)");
assert.equal(coconutStandard.record.name,"Solvent Extracted Coconut Flour");
assert.ok(coconutStandard.sourceUrls.includes(coconutHexaneSource.official_source_url));
assert.equal(coconutStandard.record.residual_solvent_limits?.filter(x=>
 x.parameter===coconutHexaneSource.chemical_residue && x.operator==="<="
 &&Number(x.value)===10 && x.unit==="ppm").length,1);
for(const name of coconutHexaneSource.excluded_non_equivalent_foods){
 assert.ok(index.products.some(p=>p.name===name),"Missing unrelated coconut or starch lookalike "+name);
}

function contaminantEvidenceForProduct(p){
 const profiles=directContaminantProfiles.get(p.id) || [];
 const explicitAliases=contaminantAliases.get(p.id);
 const direct=contaminantDirectStandards.get(p.id);
 const exactArticle=exactContaminantArticles.has(normalizeArticle(p.name));
 const spiceAflatoxin=spiceAflatoxinIds.has(p.id);
 const fssrFamilies=familyContaminantProfiles.filter(profile=>(profile.match_fssr || []).includes(p.fssr))
   .map(profile=>({id:profile.id,rule_rows:(profile.rules || []).length}));
 const finishedArticleLock=lockById.get(p.id) || null;
 const exactConfectioneryHCN=confectioneryHCNById.get(p.id)||null;
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
 const processedMeatEvidence=processedMeatById.get(p.id)||null;
 const finishedBeverageEvidence=finishedBeverageById.get(p.id)||null;
 const pureCerealEvidence=pureCerealsById.get(p.id)||null;
 const oilMetalEvidence=nickelOilById.get(p.id)||seedOilById.get(p.id)||null;
 const vegMetalEvidence=vegMetalById.get(p.id)||null;
 const driedFruitEvidence=driedFruitById.get(p.id)||null;
 const freshEggEvidence=(freshEggs.catalog_id===p.id)?freshEggs:null;
 const bisulphiteEvidence=bisulphiteById.get(p.id)||null;
 const otherOilEvidence=otherOilById.get(p.id)||null;
 const crudeOilEvidence=crudeOilLead.catalog_id===p.id&&crudeOilLead.product_name===p.name&&crudeOilLead.fssr===p.fssr?crudeOilLead:null;
 const guarEvidence=guar.catalog_id===p.id?guar:null;
 const hempEvidence=hempEvidenceById.get(p.id)||null;
 const exactCompositeSource=fourCompositeById.get(p.id)||null;
 const crossFamilyNOTSArticle=crossFamilyById.get(p.id)||null;
 const batch40Article=batch40ById.get(p.id)||null;
 const next10SourceArticle=next10ById.get(p.id)||null;
 const exactCoconutHexane=p.id===coconutHexaneSource.catalog_id?coconutHexaneSource:null;
 const goatMuscleVetEvidence=goatMuscleSource.product_ids.includes(p.id)?(()=>{
   const i=goatMuscleSource.product_ids.indexOf(p.id);
   if(p.name!==goatMuscleSource.products[i]||p.fssr!=='2.5.2(9)'||p.rule_key!==p.fssr||
      goatMuscleSource.species!=='Goat'||goatMuscleSource.tissue!=='Muscle'||
      goatMuscleSource.all_veterinary_drugs_metals_pesticides_amendments_verified!==false||
      !official(goatMuscleSource.official_source_url))return null;
   const st=chapterRecord(p).record;
   if(st?.key!==p.fssr||st?.name!=='Fresh or Chilled or Frozen Chevon or Goat Meat')return null;
   const expected={'Monensin':0.01,'Neomycin':0.5,'Febantel/Fenbendazole/Oxyfendazole':0.1};
   if(goatMuscleSource.reference_rows.length!==3)return null;
   for(const x of goatMuscleSource.reference_rows){
      if(x.commodity!=='Goat — Muscle'||x.unit!=='mg/kg'||expected[x.drug]!==x.max||
         x.pdf_page_one_based<45||x.pdf_page_one_based>47)return null;
   }
   return {source_url:goatMuscleSource.official_source_url,source_clause:goatMuscleSource.source_clause,
     species:'Goat',tissue:'Muscle',fssr:p.fssr,reference_rows:goatMuscleSource.reference_rows,
     auto_approve_finished_compliance:false,complete_veterinary_and_pesticide_panel:false,
     wrong_species_inheritance_allowed:false};
 })():null;
 const spiceOleoresinResidues=p.id==='12-12-2-spice-oleoresins'?(()=>{
   if(p.name!==spiceOleoresinSource.product_name||p.fssr!==spiceOleoresinSource.fssr||
      p.id!==spiceOleoresinSource.catalog_id||p.rule_key!==spiceOleoresinSource.fssr||
      spiceOleoresinSource.source_clause!=='2.9.32(3)'||
      spiceOleoresinSource.complete_compliance_claim!==false||
      spiceOleoresinSource.all_contaminants_toxins_and_pesticides_verified!==false||
      !official(spiceOleoresinSource.official_source_url))return null;
   const {record,sourceUrls}=chapterRecord(p);
   if(record.key!==p.fssr||record.name!=='Spice Oleoresins'||
      !sourceUrls.some(x=>x.replace('://www.', '://')===spiceOleoresinSource.official_source_url.replace('://www.','://')))return null;
   const solvents=spiceOleoresinSource.residual_solvents_ppm;
   const sourceLimits=record.solvent_residual_limits_ppm;
   if(Object.keys(sourceLimits||{}).length!==13||Object.keys(solvents||{}).length!==13)return null;
   for(const [name,limit] of Object.entries(solvents)){
      if(sourceLimits[name]!==limit||!((typeof limit==='number'&&limit>0)||limit==='GMP'))return null;
   }
   if(Object.values(solvents).filter(x=>typeof x==='number').length!==10||
      Object.values(solvents).filter(x=>x==='GMP').length!==3)return null;
   return {source:spiceOleoresinSource.official_source_url,source_clause:'2.9.32(3)',
      catalog_id:p.id,product_name:p.name,fssr:p.fssr,residual_solvents_ppm:solvents,
      note:'Residual extraction solvent limits are directly in the named FSSR product standard; other metals, mycotoxins and pesticides remain unverified.',
      no_automatic_lab_pass:true,complete_contaminants_review:false};
 })():null;
 const peanutButterCompositeEvidence=p.id==='04-04-2-peanut-butter'?(()=>{
   if(p.name!=='Peanut Butter'||p.fssr!=='2.2.4(11)'||
      !/Version IX.*03\.02\.2026/.test(String(contaminants.source_version||'')))return null;
   const standard=chapterRecord(p).record;
   if(standard.key!=='2.2.4(11)'||standard.name!=='Peanut Butter'||
      !(standard.permitted_ingredients||[]).includes('roasted groundnut kernels'))return null;
   const expected=[['total_aflatoxins','Total Aflatoxins',20],['aflatoxin_b1','Aflatoxin B1',10]];
   const verified=[];
   for(const [key,contaminant,limit] of expected){
      const group=contaminants.crop_contaminants?.[key];
      if(group?.unit!=='µg/kg')return null;
      const matches=(group.rules||[]).filter(x=>
        normalizeArticle(x.article)==='food product containing any of the above mentioned food articles'
        &&Number(x.limit)===limit && String(x.unit||group.unit)==='µg/kg');
      if(matches.length!==1)return null;
      verified.push({contaminant,limit,unit:'µg/kg',article:matches[0].article});
   }
   return {fssr:p.fssr,product_name:p.name,
     source_url:version9Source,source_standard:chapterRecord(p).sourceUrls,
     official_crop_article:'Food product containing any of the above mentioned food articles',
     rules:verified,full_contaminant_coverage:false,
     pesticide_mrls_auto_approved:false,
     amendment_reconciliation_complete:false,
     requires_source_revalidation:true};
 })():null;
 const sharedCerealAflatoxinB1Evidence=(()=>{
   const approved=[
     ['06-06-3-oat-products','Oat Products','2.4.12'],
     ['06-06-2-multigrain-flour-atta','Multigrain flour (atta)','2.4.37']
   ];
   if(!approved.some(([id,name,clause])=>p.id===id&&p.name===name&&p.fssr===clause))return null;
   if(!/Version IX.*03\.02\.2026/.test(String(contaminants.source_version||'')))return null;
   const st=chapterRecord(p).record;
   if(st.key!==p.fssr)return null;
   const guaranteedCereal=p.id==='06-06-3-oat-products'
     ? st.name==='Oat Products' && st.variants?.length===2
       &&st.variants.some(x=>x.name==='Rolled/Flaked Oats')
       &&st.variants.some(x=>x.name==='Products containing oats')
     : st.name==='Multigrain Flour (Atta)' && st.formulation_rules?.some(x=>
       x.parameter==='Whole wheat flour'&&Number(x.min)===50&&Number(x.max)===90);
   if(!guaranteedCereal)return null;
   const g=contaminants.crop_contaminants?.aflatoxin_b1;
   if(g?.unit!=='µg/kg')return null;
   const articles=['Cereal and cereal products','Food product containing any of the above mentioned food articles'];
   if(!articles.every(article=>(g.rules||[]).filter(x=>
       normalizeArticle(x.article)===normalizeArticle(article)
       &&Number(x.limit)===10&&String(x.unit||g.unit)==='µg/kg').length===1))return null;
   return {fssr:p.fssr,product_name:p.name,contaminant:'Aflatoxin B1',
     value:10,unit:'µg/kg',official_articles:articles,source_url:version9Source,
     total_aflatoxins_auto_assigned:false,other_contaminant_coverage_verified:false,
     pesticide_mrl_auto_approval:false,complete_contaminant_compliance:false};
 })();
 const bengalGramAflatoxinB1Evidence=(()=>{
   const named=[
     ['06-06-2-besan','Besan','2.4.4'],
     ['06-06-2-roasted-bengal-gram-flour-chana-sattu','Roasted Bengal Gram Flour (Chana Sattu)','2.4.33']
   ];
   if(!named.some(([id,name,fssr])=>p.id===id&&p.name===name&&p.fssr===fssr))return null;
   if(!/Version IX.*03\.02\.2026/.test(String(contaminants.source_version||'')))return null;
   const {record,sourceUrls}=chapterRecord(p);
   const identity=record.source_verified_identity;
   if(record.key!==p.fssr || identity?.botanical_identity!=='Cicer arietinum'
     ||identity.source_clause!==p.fssr || identity.full_compliance_verified!==false
     ||identity.role!=='identity_basis_for_partial_crop_contaminant_article_not_total_compliance'
     ||!official(identity.official_source_url) ||!sourceUrls.includes(identity.official_source_url))return null;
   const group=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Pulses','Food product containing any of the above mentioned food articles'];
   if(group?.unit!=='µg/kg'||!articles.every(article=>
      (group.rules||[]).filter(row=>normalizeArticle(row.article)===normalizeArticle(article)
        &&Number(row.limit)===10&&String(row.unit||group.unit)==='µg/kg').length===1))return null;
   return {catalog_id:p.id,product_name:p.name,fssr:p.fssr,source_standard_url:identity.official_source_url,
     source_contaminants_url:version9Source,botanical_identity:identity.botanical_identity,
     contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',applicable_articles:articles,
     full_contaminant_compliance:false,automatic_pesticide_mrl_approval:false,
     total_aflatoxins_auto_assigned:false,amendments_fully_reconciled:false};
 })();
 const soyDerivativeB1Evidence=(()=>{
   const subjects=[
    ['06-06-8-tempe','Tempe','2.4.26'],
    ['06-06-8-textured-soy-protein-soy-bari-or-soy-chunks-or-soy-granules','Textured Soy Protein (Soy Bari or Soy Chunks or Soy Granules)','2.4.27']
   ];
   if(!subjects.some(([id,name,clause])=>p.id===id&&p.name===name&&p.fssr===clause))return null;
   if(!/Version IX.*03\.02\.2026/.test(String(contaminants.source_version||'')))return null;
   const {record,sourceUrls}=chapterRecord(p);
   const identity=record.source_verified_identity;
   if(record.key!==p.fssr||identity?.source_clause!==p.fssr
     ||identity.principal_source!=='Soybean (Glycine max)'
     ||identity.role!=='partial_verified_oilseed_composite_b1_source_identity'
     ||identity.complete_contaminant_compliance!==false
     ||!official(identity.official_source_url)
     ||!sourceUrls.includes(identity.official_source_url))return null;
   if(p.id==='06-06-8-tempe' && !(record.permitted_ingredients||[]).some(x=>x==='soybean'))return null;
   if(p.id!=='06-06-8-tempe' && !String(record.definition||'').includes('defatted soy flour or grits'))return null;
   const group=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Oilseeds, ready to eat','Food product containing any of the above mentioned food articles'];
   if(group?.unit!=='µg/kg'||!articles.every(article=>(group.rules||[]).filter(x=>
      normalizeArticle(x.article)===normalizeArticle(article)
      &&Number(x.limit)===10&&String(x.unit||group.unit)==='µg/kg').length===1))return null;
   return {catalog_id:p.id,source_standard_url:identity.official_source_url,
     source_contaminants_url:version9Source,
     contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',
     official_articles:articles,full_compliance_verified:false,
     total_aflatoxins_auto_assigned:false,automatic_mrls:false,
     amendments_checked_completely:false};
 })();
 const nonFermentedSoybeanB1Evidence=(()=>{
   const subjects=[
     ['06-06-8-soybean-beverages-and-related-products','Soybean Beverages and Related Products'],
     ['06-06-8-soybean-curd-and-related-products','Soybean Curd and Related Products'],
     ['06-06-8-compressed-soybean-curd','Compressed Soybean Curd'],
     ['06-06-8-dehydrated-soybean-curd-film','Dehydrated Soybean Curd Film'],
     ['06-06-8-tofu','Tofu']
   ];
   if(p.fssr!=='2.4.30'||!subjects.some(([id,name])=>id===p.id&&name===p.name))return null;
   if(!/Version IX.*03\.02\.2026/.test(String(contaminants.source_version||'')))return null;
   const {record,sourceUrls}=chapterRecord(p), identity=record.source_verified_identity;
   if(record.key!=='2.4.30'||record.name!=='Non-Fermented Soybean Products'
     ||identity?.source_clause!=='2.4.30'
     ||identity.source_compendium!=='Version 4 (07.05.2025)'
     ||identity.complete_contaminant_compliance!==false
     ||identity.identity_verified_only!==true
     ||identity.allow_cross_product_auto_inheritance!==false
     ||!official(identity.official_source_url)
     ||!sourceUrls.includes(identity.official_source_url))return null;
   const allowed=(identity.approved_exact_catalogue_identities||[]).filter(x=>
      x.catalog_id===p.id&&x.product_name===p.name&&x.fssr===p.fssr);
   if(allowed.length!==1 || identity.approved_exact_catalogue_identities.length!==5)return null;
   const group=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Oilseeds, ready to eat','Food product containing any of the above mentioned food articles'];
   if(group?.unit!=='µg/kg'||!articles.every(article=>
     (group.rules||[]).filter(row=>normalizeArticle(row.article)===normalizeArticle(article)
       &&Number(row.limit)===10&&String(row.unit||group.unit)==='µg/kg').length===1))return null;
   return {catalog_id:p.id,product_name:p.name,clause:p.fssr,
     chapter_source_url:identity.official_source_url,source_url:version9Source,
     contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',
     official_articles:articles,exact_finished_product_identity:true,
     complete_contaminant_compliance:false,total_aflatoxins_auto_assigned:false,
     pesticide_mrl_auto_approval:false,current_amendments_fully_reconciled:false};
 })();
 const oilseedFlourProteinB1Evidence=(()=>{
   const allowed=[
    ['06-06-2-solvent-extract-soya-flour','Solvent Extract Soya Flour','2.4.13(1)'],
    ['06-06-2-solvent-extracted-groundnut-flour','Solvent Extracted Groundnut Flour','2.4.13(2)'],
    ['06-06-2-solvent-extracted-sesame-flour','Solvent Extracted Sesame Flour','2.4.13(3)'],
    ['06-06-2-solvent-extracted-cotton-seed-flour','Solvent Extracted Cotton seed Flour','2.4.13(5)'],
    ['06-06-2-expeller-pressed-edible-groundnut-flour','Expeller Pressed Edible Groundnut Flour','2.4.16(2)'],
    ['06-06-8-soy-protein-products','Soy Protein Products','2.4.20']
   ];
   if(!allowed.some(([id,name,clause])=>p.id===id&&p.name===name&&p.fssr===clause))return null;
   if(!/Version IX.*03\.02\.2026/.test(String(contaminants.source_version||'')))return null;
   const {record,sourceUrls}=chapterRecord(p);
   const identity=record.source_verified_oilseed_identity;
   if(record.key!==p.fssr||identity?.source_clause!==p.fssr
      ||identity.exact_catalog_id!==p.id||identity.exact_catalogue_name!==p.name
      ||identity.crop_category!=='oilseed'
      ||identity.source_version!=='FSSAI Chapter 2.4 Version 4 (07.05.2025)'
      ||identity.partial_b1_only!==true ||identity.complete_contaminant_coverage!==false
      ||identity.allow_related_food_inheritance!==false
      ||!official(identity.source_url)||!sourceUrls.includes(identity.source_url))return null;
   const group=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Oilseeds for further processing','Oilseeds, ready to eat',
     'Food product containing any of the above mentioned food articles'];
   if(group?.unit!=='µg/kg'||!articles.every(article=>
      (group.rules||[]).filter(row=>normalizeArticle(row.article)===normalizeArticle(article)
        &&Number(row.limit)===10&&String(row.unit||group.unit)==='µg/kg').length===1))return null;
   return {catalog_id:p.id,product_name:p.name,clause:p.fssr,
     mandatory_oilseed:identity.mandatory_oilseed,chapter_source:identity.source_url,
     contaminants_source:version9Source,contaminant:'Aflatoxin B1',
     limit:10,unit:'µg/kg',official_articles:articles,
     complete_contaminant_coverage:false,total_aflatoxins_auto_assigned:false,
     pesticide_mrl_approved:false,amendments_fully_reconciled:false};
 })();
 const fermentedSoyCurdB1Evidence=(()=>{
   const expected=[
    ['06-06-8-fermented-soybean-curd','Fermented Soybean Curd','2.4.39(1)'],
    ['06-06-8-fermented-soybean-curd-made-with-s-thermophillus-l-bulgaricus',
     'Fermented Soybean Curd (made with S. thermophillus + L. bulgaricus)','2.4.39']
   ];
   if(!expected.some(([id,name,clause])=>p.id===id&&p.name===name&&p.fssr===clause))return null;
   if(!/Version IX.*03\.02\.2026/.test(String(contaminants.source_version||'')))return null;
   const {record,sourceUrls}=chapterRecord(p),source=record.source_verified_fermented_soy_identity;
   if(record.key!=='2.4.39'||source?.source_clause!=='2.4.39'
     ||source.chapter_compendium_version!=='Version 4 (07.05.2025)'
     ||source.mandatory_source!=='Aqueous extract of soybean'
     ||source.partial_b1_evidence_only!==true||source.full_compliance!==false
     ||source.other_contaminants_verified!==false
     ||!official(source.official_source_url)||!sourceUrls.includes(source.official_source_url)
     ||source.exact_variants?.length!==2
     ||!(record.variants||[]).some(v=>v.name===source.exact_variants.find(x=>x.catalog_id===p.id)?.standard_variant)
     ||!source.exact_variants.some(v=>v.catalog_id===p.id&&v.catalogue_name===p.name&&v.catalogue_fssr===p.fssr))return null;
   const group=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Oilseeds, ready to eat','Food product containing any of the above mentioned food articles'];
   if(group?.unit!=='µg/kg'||!articles.every(article=>
      (group.rules||[]).filter(r=>normalizeArticle(r.article)===normalizeArticle(article)
       &&Number(r.limit)===10&&String(r.unit||group.unit)==='µg/kg').length===1))return null;
   return {catalog_id:p.id,source_standard_url:source.official_source_url,
     contaminants_source_url:version9Source,contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',
     articles,full_contaminant_coverage:false,total_aflatoxins_auto_assigned:false,
     pesticide_mrls_auto_applied:false,amendments_fully_reconciled:false};
 })();
 const cerealMaltB1Evidence=(()=>{
   const candidates=[
    ['06-06-2-protein-rich-wheat-flour-protein-prachur-atta','Protein rich wheat flour (Protein prachur atta)','2.4.1(3)','wheat_flour_required'],
    ['06-06-2-protein-rich-refined-wheat-flour-protein-prachur-maida','Protein rich refined wheat flour (Protein prachur maida)','2.4.2(3)','refined_wheat_flour_required'],
    ['06-06-7-malted-milk-food','Malted Milk Food','2.4.11(1)','malted_cereal_required'],
    ['06-06-7-malt-based-foods-malt-food','Malt Based Foods(Malt Food)','2.4.11(2)','malted_cereal_or_grain_legume_required'],
    ['06-06-7-malt-extract','Malt Extract','2.4.11(3)','malted_cereal_required']
   ];
   const item=candidates.find(x=>p.id===x[0]&&p.name===x[1]&&p.fssr===x[2]);
   if(!item||contaminants.source_version!=='Version IX (03.02.2026)')return null;
   const {record,sourceUrls}=chapterRecord(p),meta=record.source_verified_identity;
   if(record.key!==p.fssr || meta?.source_clause!==p.fssr
     ||meta.principal_material_kind!==item[3]
     ||meta.source_compendium_version!=='Version 4 (07.05.2025)'
     ||meta.role!=='fixed_cereal_or_pulse_based_identity_for_partial_b1_source_article_only'
     ||meta.full_contaminant_compliance!==false||meta.total_aflatoxins_auto_assigned!==false
     ||!official(meta.official_source_url)||!sourceUrls.includes(meta.official_source_url))return null;
   const g=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Cereal and cereal products','Pulses','Food product containing any of the above mentioned food articles'];
   if(g?.unit!=='µg/kg'||!articles.every(article=>(g.rules||[]).filter(row=>
      normalizeArticle(row.article)===normalizeArticle(article)
      &&Number(row.limit)===10&&String(row.unit||g.unit)==='µg/kg').length===1))return null;
   return {catalog_id:p.id,product_name:p.name,fssr:p.fssr,
     standard_source_url:meta.official_source_url,contaminants_source_url:version9Source,
     exact_source_articles:articles,contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',
     complete_contaminant_coverage:false,total_aflatoxins_auto_assigned:false,
     pesticide_mrl_auto_applied:false,lead_cadmium_auto_assigned:false,
     current_future_amendments_checked:false};
 })();
 const exactYellowPeaPowderB1Evidence=(()=>{
   if(p.id!=='04-04-2-yellow-pea-powder'||p.name!=='YELLOW PEA POWDER'||p.fssr!=='2.4.36'
     ||contaminants.source_version!=='Version IX (03.02.2026)')return null;
   const {record,sourceUrls}=chapterRecord(p),identity=record.source_verified_identity;
   if(record.key!=='2.4.36'||record.name!=='Yellow Pea Powder'
     ||identity?.source_clause!=='2.4.36'||identity?.botanical_identity!=='Pisum sativum L.'
     ||identity.no_foreign_ingredient!==true||identity.role!=='exact_pea_pulse_flour_for_source_checked_b1_only'
     ||identity.complete_contaminant_compliance!==false
     ||identity.total_aflatoxins_assigned!==false||identity.metal_limits_assigned!==false
     ||identity.source_compendium_version!=='Version 4 (07.05.2025)'
     ||!official(identity.official_source_url)||!sourceUrls.includes(identity.official_source_url))return null;
   const group=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Pulses','Food product containing any of the above mentioned food articles'];
   if(group?.unit!=='µg/kg'||!articles.every(article=>(group.rules||[]).filter(x=>
     normalizeArticle(x.article)===normalizeArticle(article)
     &&Number(x.limit)===10&&String(x.unit||group.unit)==='µg/kg').length===1))return null;
   return {catalog_id:p.id,product_name:p.name,fssr:p.fssr,botanical_identity:identity.botanical_identity,
     official_standard_source:identity.official_source_url,official_contaminants_source:version9Source,
     contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',articles,
     no_complete_contaminant_assessment:true,auto_assign_total_aflatoxins:false,
     auto_assign_pulse_flour_metals:false,auto_assign_pesticide_mrls:false};
 })();
 const exactBreadB1Evidence=(()=>{
   if(p.id!=='07-07-1-bread-and-bread-type-products' ||
      p.name!=='Bread and Bread-Type Products'||p.fssr!=='2.4.15(2)'
      ||String(contaminants.source_version||'')!=='Version IX (03.02.2026)')return null;
   const chapter=chapterRecord(p),st=chapter.record;
   const proof=st?.official_finished_cereal_identity_source_v1;
   if(st?.key!=='2.4.15(2)'||st.name!==p.name
      ||proof?.clause!==p.fssr||proof?.wheat_flour_mandatory!==true
      ||proof?.other_flour_substitution_alone_qualifies!==false
      ||proof?.exact_identity_verified!==true
      ||proof?.full_contaminant_coverage_verified!==false
      ||proof?.source_version!=='Version 4 (07.05.2025)'
      ||!official(proof.official_source_url))return null;
   if(!chapter.sourceUrls.includes(proof.official_source_url))return null;
   const g=contaminants.crop_contaminants?.aflatoxin_b1;
   if(g?.unit!=='µg/kg')return null;
   const articles=['Cereal and cereal products',
     'Food product containing any of the above mentioned food articles'];
   if(!articles.every(article=>(g.rules||[]).filter(x=>
       normalizeArticle(x.article)===normalizeArticle(article)
       &&Number(x.limit)===10&&String(x.unit||g.unit)==='µg/kg').length===1))return null;
   return {product_name:p.name,fssr:p.fssr,official_identity_source:proof.official_source_url,
      official_contaminant_source:version9Source,contaminant:'Aflatoxin B1',
      limit:10,unit:'µg/kg',source_articles:articles,
      total_aflatoxins_auto_assigned:false,pesticide_mrl_auto_approved:false,
      complete_contaminant_compliance:false};
 })();
 const exactBreakfastCerealB1Evidence=(()=>{
   if(p.id!=='06-06-3-breakfast-cereal'||p.name!=='Breakfast Cereal'||p.fssr!=='2.4.35'
      ||String(contaminants.source_version||'')!=='Version IX (03.02.2026)')return null;
   const chapter=chapterRecord(p),standard=chapter.record;
   const proof=standard.official_finished_cereal_identity_source_v1;
   if(standard.key!=='2.4.35'||standard.name!=='Breakfast Cereal'
      ||proof?.clause!==p.fssr||proof?.grain_basis_required!==true
      ||proof?.exact_finished_product_identity!==true
      ||proof?.complete_contaminant_coverage_verified!==false
      ||proof?.source_version!=='Version 4 (07.05.2025)'
      ||!official(proof?.official_source_url)
      ||!chapter.sourceUrls.includes(proof.official_source_url)
      ||!(standard.ingredient_rules||[]).some(r=>/Cereals\/pseudocereals\/grains taken together must appear as the first ingredient/i.test(r)))return null;
   const g=contaminants.crop_contaminants?.aflatoxin_b1;
   const articles=['Cereal and cereal products',
     'Food product containing any of the above mentioned food articles'];
   if(g?.unit!=='µg/kg'||!articles.every(article=>(g.rules||[]).filter(r=>
      normalizeArticle(r.article)===normalizeArticle(article)
      &&Number(r.limit)===10&&String(r.unit||g.unit)==='µg/kg').length===1))return null;
   return {product_name:p.name,fssr:p.fssr,source_standard:proof.official_source_url,
     source_contaminants:version9Source,contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',
     source_articles:articles,total_aflatoxins_auto_assigned:false,
     pesticide_mrl_auto_approved:false,complete_contaminant_compliance:false};
 })();
 const exactMilkProduct=verifiedMilkIds.get(p.id)||null;
 const exactInfantFood=verifiedInfantIds.get(p.id)||null;
 const additionalMilkArticle=additionalMilkById.get(p.id)||null;
 const maizeWheatArticle=maizeWheatById.get(p.id)||null;
 const freshFruitPartial=freshFruitById.get(p.id)||null;
 const explicitKinds=[];
 if(exactMilkProduct)explicitKinds.push('official_v9_named_cheese_or_fermented_milk_pesticide_commodity_partial');
 if(exactInfantFood)explicitKinds.push('official_v9_named_infant_food_arsenic_cadmium_partial');
 if(additionalMilkArticle)explicitKinds.push('official_v9_named_dairy_commodity_article_partial_2026_10_10');
 if(maizeWheatArticle)explicitKinds.push('official_v9_maize_wheat_cereal_composite_b1_partial_2026_10_10');
 if(freshFruitPartial)explicitKinds.push('official_v9_fresh_fruit_fcs_exact_source_pesticide_commodity_partial');
 if(peanutButterCompositeEvidence)explicitKinds.push("official_v9_exact_peanut_butter_composite_aflatoxins_partial");
 if(sharedCerealAflatoxinB1Evidence)explicitKinds.push("official_v9_harmonised_cereal_composite_b1_partial");
 if(exactBreadB1Evidence)explicitKinds.push("official_v9_exact_bread_wheat_cereal_composite_b1_partial");
 if(exactBreakfastCerealB1Evidence)explicitKinds.push("official_v9_exact_breakfast_cereal_composite_b1_partial");
 if(cerealMaltB1Evidence)explicitKinds.push("fssai_v9_exact_cereal_malt_b1_partial_evidence");
 if(exactYellowPeaPowderB1Evidence)explicitKinds.push("fssai_v9_exact_yellow_pea_powder_b1_partial_evidence");
 if(bengalGramAflatoxinB1Evidence)explicitKinds.push("official_v9_exact_bengal_gram_pulse_composite_b1_partial");
 if(soyDerivativeB1Evidence)explicitKinds.push("official_v9_soy_derivative_oilseed_composite_b1_partial");
 if(nonFermentedSoybeanB1Evidence)explicitKinds.push("official_v9_exact_nonfermented_soybean_b1_partial");
 if(oilseedFlourProteinB1Evidence)explicitKinds.push("official_v9_exact_oilseed_flour_protein_b1_partial");
 if(fermentedSoyCurdB1Evidence)explicitKinds.push("official_v9_exact_fermented_soybean_curd_b1_partial");
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
 if(processedMeatEvidence)explicitKinds.push("verified_finished_processed_meat_saffrole_article");
 if(finishedBeverageEvidence)explicitKinds.push("verified_finished_chapter_2_10_non_alcoholic_beverage_saffrole");
 if(pureCerealEvidence)explicitKinds.push("verified_pure_cereal_product_aflatoxin_article");
 if(oilMetalEvidence)explicitKinds.push("verified_exact_oil_metal_article");
 if(vegMetalEvidence)explicitKinds.push("verified_fresh_vegetable_chromium_nickel_articles");
 if(driedFruitEvidence)explicitKinds.push("official_v9_exact_dried_fruit_malathion_commodity_partial");
 if(freshEggEvidence)explicitKinds.push("verified_exact_fresh_eggs_pesticide_commodity_article_review_only");
 if(bisulphiteEvidence)explicitKinds.push("verified_exact_bisulphite_ins_additive_substance_metal_articles");
 if(otherOilEvidence)explicitKinds.push("verified_other_edible_vegetable_oils_lead_articles");
 if(exactConfectioneryHCN)explicitKinds.push("official_v9_exact_fcs_05_2_confectionery_hydrocyanic_acid_partial");
 if(crudeOilEvidence)explicitKinds.push("verified_exact_fssr_2_2_9_crude_vegetable_oil_lead");
 if(guarEvidence)explicitKinds.push("verified_ins_412_guar_gum_official_gaur_gum_metal_alias");
 if(hempEvidence)explicitKinds.push("official_chapter_2_16_exact_thc_and_cross_cutting_cbd");
 if(spiceOleoresinResidues)explicitKinds.push("official_fssr_2_9_32_exact_residual_extraction_solvents_partial");
 if(goatMuscleVetEvidence)explicitKinds.push("official_v9_exact_goat_muscle_veterinary_drug_mrl_partial");
 if(exactCompositeSource)explicitKinds.push("official_v9_exact_composite_aflatoxin_b1_or_finished_soup_saffrole_partial");
 if(crossFamilyNOTSArticle)explicitKinds.push("official_v9_identity_locked_non_alcoholic_beverage_or_confectionery_nots_partial");
 if(batch40Article)explicitKinds.push("official_v9_identity_locked_milk_sweet_juice_spice_or_beverage_source_partial");
 if(next10SourceArticle)explicitKinds.push("official_v9_partial_named_article_dried_dates_vanilla_spices_frozen_tea_flavourings");
 if(exactCoconutHexane)explicitKinds.push("official_fssr_2_4_13_4_exact_coconut_flour_hexane_residual_partial");
 // Only a conditional, user-confirmed subtype source: the combined FoSCoS
 // identity must remain pending even though two powder variants have FSSAI
 // Aflatoxin M1 articles. Cream and partly skimmed are not inferred.
 const milkPowderAflatoxinM1Review=p.id==="01-01-5-milk-powders-and-cream-powder"?(()=>{
   assert.equal(p.fssr,"2.1.10");
   const group=contaminants.crop_contaminants?.aflatoxin_m1;
   assert.ok(group&&group.unit==="µg/kg","FSSAI Aflatoxin M1 source missing for milk powder review");
   const variants=[["Whole milk powder",4],["Skimmed milk powder",6]];
   for(const [article,limit] of variants){
     assert.equal((group.rules||[]).filter(row=>
       normalizeArticle(row.article)===normalizeArticle(article)
       &&Number(row.limit)===limit &&String(row.unit||group.unit)==="µg/kg").length,1,
       "Changed official Aflatoxin M1 powder variant "+article);
   }
   return {status:"conditional_exact_subtype_required_not_product_evidence",
     product_standard:"2.1.10",contaminant:"Aflatoxin M1",
     verified_variant_articles:variants.map(([article,limit])=>({article,limit,unit:"µg/kg"})),
     source:version9Source,automatic_combined_product_limit_allowed:false,
     partly_skimmed_and_cream_powder_auto_inheritance:false,
     complete_contaminant_coverage_verified:false};
 })():null;
 const status=explicitKinds.length?"some_exact_product_evidence_not_full_coverage":
   fssrFamilies.length?"only_family_fssr_evidence_needs_identity_review":
   "no_exact_catalog_evidence_in_this_inventory";
 return {
   status,
   exact_spice_oleoresin_solvent_residues:spiceOleoresinResidues,
   exact_goat_muscle_veterinary_drugs:goatMuscleVetEvidence,
   exact_composite_food_or_soup_source_v9:exactCompositeSource,
   exact_next10_source_article_v9:next10SourceArticle?{
     source:version9Source,article:next10SourceArticle.official_named_article,
     parameter:next10SourceArticle.parameter,
     source_limit:next10SourceArticle.source_reference_limit,
     source_unit:next10SourceArticle.source_reference_unit,
     incomplete_sample_matrix_and_processing:true,
     automatic_numeric_compliance_pass:false,
     amendments_fully_reconciled:false,full_product_compliance_verified:false}:null,
   exact_batch40_source_evidence_v9:batch40Article?{
     source:version9Source,identity_source:batch40Article.identity_source,
     evidence_family:batch40Article.source_family,reference_rows:batch40Article.official_FSSAI_article_references,
     numeric_limit_auto_applied:false,processed_sample_basis_unconfirmed:true,
     full_contaminants_and_pesticide_panel_verified:false,full_compliance_pass:false}:null,
   exact_beverage_or_confectionery_nots_v9:crossFamilyNOTSArticle?{
     source:version9Source,product_id:p.id,standard:p.fssr,article:crossFamilyNOTSArticle.article,
     contaminant:crossFamilyNOTSArticle.contaminant,reference_limit:crossFamilyNOTSArticle.limit,
     unit:crossFamilyNOTSArticle.unit,subtype_or_dilution_review_required:crossFamilyNOTSArticle.finished_or_reconstituted_form_must_be_confirmed,
     other_contaminants_and_residues_verified:false,auto_apply_numeric_finished_food_limit:false,
     full_compliance_pass:false}:null,
   exact_coconut_flour_residual_hexane:exactCoconutHexane,
   exact_named_milk_products_mrl_article:exactMilkProduct?{source:version9Source,article:namedMilkEvidence.article,pesticide:namedMilkEvidence.pesticide,mrl:namedMilkEvidence.mrl,unit:namedMilkEvidence.unit,cheese_auto_applied:false,compliance_pass:false}:null,
   exact_infant_food_metals:exactInfantFood?{source:version9Source,rows:infantMetalEvidence.verified_rows,lead_not_auto_assigned:true,compliance_pass:false}:null,
   exact_additional_dairy_commodity_article:additionalMilkArticle?{source:version9Source,article:additionalMilk.article,pesticide:additionalMilk.reference_pesticide,reference_mrl:additionalMilk.reference_mrl,unit:additionalMilk.unit,auto_apply:false,complete_panel:false}:null,
   exact_maize_wheat_b1_article:maizeWheatArticle?{source:version9Source,contaminant:'Aflatoxin B1',limit:10,unit:'µg/kg',source_articles:maizeWheat.source_articles,total_aflatoxins_auto_assigned:false,full_compliance:false}:null,
   exact_fresh_fruit_source_pesticide_commodity:freshFruitPartial?{source:version9Source,article:freshFruitEvidence.article,reference_pesticide:freshFruitEvidence.source_pesticide,source_mrl:freshFruitEvidence.source_mrl,unit:freshFruitEvidence.unit,numeric_applied:false,processing_factors_verified:false,full_compliance:false}:null,
   exact_peanut_butter_composite_aflatoxins:peanutButterCompositeEvidence,
   exact_harmonised_cereal_aflatoxin_b1:sharedCerealAflatoxinB1Evidence,
   exact_bread_cereal_composite_b1_partial:exactBreadB1Evidence,
   exact_breakfast_cereal_composite_b1_partial:exactBreakfastCerealB1Evidence,
   exact_bengal_gram_pulse_composite_b1:bengalGramAflatoxinB1Evidence,
   exact_cereal_malt_b1_partial_evidence:cerealMaltB1Evidence,
   exact_yellow_pea_powder_b1:exactYellowPeaPowderB1Evidence,
   exact_soy_derivative_oilseed_composite_b1:soyDerivativeB1Evidence,
   exact_nonfermented_soybean_b1:nonFermentedSoybeanB1Evidence,
   exact_oilseed_flour_protein_b1:oilseedFlourProteinB1Evidence,
   exact_fermented_soybean_curd_b1:fermentedSoyCurdB1Evidence,
   conditional_milk_powder_aflatoxin_m1_review:milkPowderAflatoxinM1Review,
   exact_hemp_chapter_2_16_thc_cbd:hempEvidence,
   exact_alcoholic_beverage_toxic_substances:alcoholicEvidence?{
     fcs:alcoholicEvidence.fcs,article:"Alcoholic beverages",
     rules:alcoholic.rules.map(x=>({contaminant:x.contaminant,limit:x.limit,unit:x.unit})),
     source_url:alcoholic.official_source_url,full_compliance_verified:false,
     pesticide_mrls_auto_applied:false,other_contaminants_assessed:false
   }:null,
   exact_guar_gum_additive_metal_article:guarEvidence?{
     source_url:guar.official_source_url,identity_ins:guar.identity_ins,
     official_article:guar.official_article_spelling,metals:guar.metals,
     full_compliance_verified:false,finished_food_use_approved:false}:null,
   exact_solvent_crude_vegetable_oil_lead:crudeOilEvidence?{
      source_url:crudeOilEvidence.official_contaminant_source_url,standard_source:crudeOilEvidence.official_product_standard_url,
      official_article:crudeOilEvidence.official_article,limit:crudeOilEvidence.limit,unit:crudeOilEvidence.unit,
      arsenic_auto_applied:false,refining_required:true,full_compliance_verified:false,
      pesticide_mrls_auto_applied:false}:null,
   exact_confectionery_hydrocyanic_acid_nots:exactConfectioneryHCN?{
      source:confectioneryHCN.official_source_url,identity_source:confectioneryHCN.official_foscos_identity_source_url,
      source_article:"Confectionery",contaminant:"Hydrocyanic acid",limit:5,unit:"ppm",fcs:exactConfectioneryHCN.fcs,
      product_metal_article_lock_retained:true,complete_contaminant_coverage:false,pesticide_mrls_auto_applied:false,
      full_compliance_verified:false}:null,
   exact_other_edible_oil_lead:otherOilEvidence?{
     official_source:otherOil.official_source_url,article:otherOil.article_edible,
     limit:otherOil.limit,unit:otherOil.unit,full_compliance_verified:false,
     pesticide_mrls_auto_applied:false}:null,
   exact_bisulphite_additive_metal_articles:bisulphiteEvidence?{
     substance_name:bisulphiteEvidence.product_name,metal_limits:bisulphiteEvidence.contaminants,
     official_source:bisulphiteRoutes.official_source_url,
     finished_food_additive_use_allowed:false,full_compliance_verified:false}:null,
   exact_dried_fruit_malathion: driedFruitEvidence?{
    source_url:driedFruitMalathion.official_source_url, standard_source:driedFruitMalathion.chapter_2_3_standard_url,
    commodity_article:driedFruitMalathion.commodity_article, pesticide_name:driedFruitMalathion.pesticide_name,
    mrl:driedFruitMalathion.limit, unit:driedFruitMalathion.unit,
    full_compliance_verified:false,other_pesticide_rows_approved:false,
    freshness_amendments_fully_reconciled:false}:null,
   exact_fresh_eggs_pesticide_commodity:freshEggEvidence?{
     official_article:"Eggs",mrl_rows:9,scope:"Shell free basis",
     source_url:freshEggs.official_source_url,auto_apply:false,full_compliance_verified:false}:null,
   exact_fresh_vegetable_metals:vegMetalEvidence?{
     source_url:vegMetal.official_source_url,article:vegMetal.official_article,
     metals:vegMetal.limits,full_compliance_verified:false,pesticide_mrls_auto_applied:false}:null,
   exact_oil_metal_articles:oilMetalEvidence?{
     source:oilMetals.official_source_url,
     kind:nickelOilById.has(p.id)?"hydrogenated_interesterified_nickel":"named_edible_seed_oil_lead_arsenic",
     full_compliance_verified:false,pesticide_mrls_auto_applied:false}:null,
   exact_pure_cereal_product_aflatoxins:pureCerealEvidence?{
     source:pureCereals.official_source_url,article:pureCereals.official_article,
     rules:pureCereals.rules.map(x=>({contaminant:x.contaminant,limit:x.limit,unit:x.unit})),
     full_compliance_verified:false,pesticide_mrls_auto_applied:false}:null,
   exact_chapter_2_10_finished_beverage_saffrole:finishedBeverageEvidence?{
     source:finishedBeverage.official_source_url,article:finishedBeverage.official_article,
     limit:finishedBeverage.limit,unit:finishedBeverage.unit,full_compliance_verified:false,
     pesticide_mrls_auto_applied:false}:null,
   exact_processed_meat_saffrole:processedMeatEvidence?{
     source:processedMeat.official_source_url,article:processedMeat.official_article,
     limit:processedMeat.limit,unit:processedMeat.unit,full_compliance_verified:false,
     pesticide_mrls_auto_applied:false}:null,
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
       quality_clause_catalogue_key:exactRawPulses.quality_clause_catalogue_key,
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
   conditional_metal_source_checked_review_only:checkedSubtypeMetalRows.get(p.id)||[],
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
      // Some Chapter 2.4 grain standards publish direct quality limits in
      // general_limits rather than a composition array. Those are still
      // numeric official-standard evidence; no full compliance is implied.
      const numericSourcePresent=numericCompositionPresent || (
        Array.isArray(target.record.general_limits) &&
        target.record.general_limits.some(x=>Number.isFinite(x.value) &&
          ["<=",">=","range"].includes(x.operator))
      );
      assert.ok(numericSourcePresent,"Numeric source evidence without numeric standard: "+p.id);
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
  const soybeanConditionalReview=soyReviewById.get(p.id)||null;
  if(soybeanConditionalReview){
    tally("chapter_2_4_soybean_total_aflatoxin_review","source_verified_conditional_not_auto_applied");
    action.push("2.4.30 soybean finished-food total aflatoxins: official composite-food 20 µg/kg versus oilseed 15 µg/kg. Determine exact finished-food article applicability and amendments; numerical total is not auto-applied. Shared B1 is separately mapped; this is not a full compliance assessment.");
  }
  if(contaminantEvidence.exact_coconut_flour_residual_hexane){
    tally("coconut_flour_hexane","exact_fssr_2_4_13_4_residual_solvent_partial");
    action.push("FSSR 2.4.13(4) solvent-extracted coconut flour: exact food-grade hexane maximum 10 ppm. Check extraction process, method/result, other chemical and pesticide contamination. This is not an automatic compliance PASS.");
  }
  if(contaminantEvidence.exact_composite_food_or_soup_source_v9){
    tally("composite_b1_and_soup_saffrole","official_v9_exact_named_product_family_partial");
    const e=contaminantEvidence.exact_composite_food_or_soup_source_v9;
    action.push("Exact FSSAI Version IX "+e.contaminant+" reference: "+e.article
      +" "+e.limit+" "+e.unit+". "+e.applicability_note
      +" This establishes partial source evidence only; validate matrix/basis, amendments, other contaminants and applicable pesticide MRLs before any compliance decision.");
  }
  if(contaminantEvidence.exact_goat_muscle_veterinary_drugs){
    tally("goat_muscle_vet_drugs","exact_species_tissue_reference_partial");
    action.push("Exact Goat–Muscle veterinary MRL source rows for Monensin, Neomycin and Febantel/Fenbendazole/Oxyfendazole confirmed. Check full veterinary-drug panel, species/tissue sampling, lab results and other regulatory contaminants. Rabbit and sheep must not inherit this evidence.");
  }
  if(contaminantEvidence.exact_spice_oleoresin_solvent_residues){
    tally("spice_oleoresin_residual_solvents","exact_fssr_2_9_32_partial_only");
    action.push("Official FSSR 2.9.32(3) lists 10 numerical residual solvent maxima and 3 GMP-only solvents. Evaluate solvent(s) actually used, laboratory methods/results, metal/mycotoxin/pesticide applicability separately; no complete compliance PASS.");
  }
  if(contaminantEvidence.finished_product_article_review){
    tally("chapter_2_7_finished_article_locks","reviewed_fail_closed");
    action.push("Chapter 2.7 finished-product contaminant article reviewed: no exact Version IX match verified; preserve fail-closed mapping and review current effective amendments, ingredient duties and any Foods not specified applicability");
  }
  if(contaminantEvidence.conditional_milk_powder_aflatoxin_m1_review){
    tally("milk_powder_aflatoxin_m1","conditional_exact_subtype_only");
    action.push("Aflatoxin M1: FSSAI Version IX separately lists Whole Milk Powder 4 µg/kg and Skimmed Milk Powder 6 µg/kg. Require exact user-confirmed subtype; do not infer Partly Skimmed Milk Powder or Cream Powder; combined identity remains unresolved.");
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
  if(contaminantEvidence.exact_guar_gum_additive_metal_article){
    tally("special_guar_gum_metal","exact_ins_412_official_alias");
    action.push("INS 412 Chapter 3 Guar Gum matches official Section 2.1 Gaur gum Arsenic/Lead article. Identity/purity evidence only; verify Appendix A and formulation use separately.");
  }
  if(contaminantEvidence.exact_solvent_crude_vegetable_oil_lead){
    tally("chapter_2_2_crude_oil_lead","source_verified_partial_only");
    action.push("FSSR 2.2.9 crude vegetable oil Lead 0.1 mg/kg source verified. Do not transfer to cocoa butter or automatically apply narrower Arsenic oil article. Verify other residues; refining required before consumption.");
  }
  if(contaminantEvidence.exact_confectionery_hydrocyanic_acid_nots){
    tally("chapter_2_7_exact_confectionery_hcn","source_backed_partial");
    action.push("Exact FSSAI FoSCoS 05.2 confectionery Hydrocyanic acid NOTS 5 ppm article checked against Version IX; separate Hard Candy metal inheritance lock remains, and all other contaminants/residues require assessment.");
  }
  if(contaminantEvidence.exact_other_edible_oil_lead){
    tally("chapter_2_2_other_oil_lead","exact_oil_grouped_source_partial");
    action.push("Version IX crude/edible grouped oil articles agree on Lead 0.1 mg/kg; confirm other metals, processing, pesticides and applicable amendments.");
  }
  if(contaminantEvidence.exact_bisulphite_additive_metal_articles){
    tally("special_ins_additive_identity_metal","exact_substance_lead_selenium");
    action.push("INS metabisulphite pure-substance Lead/Selenium Version IX articles verified; separate Appendix A category, additive permission, dose and product formulation requirements remain unassessed.");
  }
  if(contaminantEvidence.exact_dried_fruit_malathion){
    tally("chapter_2_3_exact_dried_fruit_malathion","single_source_commodity_article_partial");
    action.push("FSSAI Version IX Malathion (including malaoxon) Dried fruits article: 8 mg/kg matches exact dried fruit product identity. Other pesticide MRLs, pesticide residue definitions, contaminant metals and amendments require independent review; no PASS.");
  }
  if(contaminantEvidence.exact_fresh_eggs_pesticide_commodity){
    tally("chapter_2_5_eggs_exact_article","shell_free_pesticide_reference_only");
    action.push("Fresh Eggs exact FSSAI Eggs pesticide commodity (9 rows) confirmed, all shell-free. These MRLs are reference-only; verify specific pesticide residue definitions and amendments before compliance decision.");
  }
  if(contaminantEvidence.exact_fresh_vegetable_metals){
    tally("chapter_2_3_fresh_vegetables","source_backed_chromium_nickel_only");
    action.push("FSSAI Vegetables Chromium/Nickel 1 mg/kg partial evidence; check commodity subtype, other metals, pesticides and amendment scopes.");
  }
  if(contaminantEvidence.exact_oil_metal_articles){
    tally("chapter_2_2_exact_oil_metal_articles",contaminantEvidence.exact_oil_metal_articles.kind);
    action.push("Named Chapter 2.2 oil/fat identity has direct grouped Version IX metal article only; confirm other contaminants, effective amendments, all specific product limits and pesticides.");
  }
  if(contaminantEvidence.exact_pure_cereal_product_aflatoxins){
    tally("chapter_2_4_pure_cereal_product_aflatoxins","exact_cereal_product_partial");
    action.push("Source-backed FSSAI cereal and cereal-products Total Aflatoxins 15 µg/kg and Aflatoxin B1 10 µg/kg; other contaminants, processing and pesticide MRLs separately required.");
  }
  if(contaminantEvidence.exact_chapter_2_10_finished_beverage_saffrole){
    tally("chapter_2_10_nots","source_backed_finished_non_alcoholic_saffrole");
    action.push("Named Chapter 2.10 finished beverage: Saffrole 10 ppm only. Verify other contaminants, effective amendments, processing and residue scopes separately.");
  }
  if(contaminantEvidence.exact_processed_meat_saffrole){
    tally("processed_meat_nots","exact_grouped_meat_saffrole_partial");
    action.push("FSSAI grouped processed meat Saffrole 10 ppm only; separate verification required for metals, other toxins, pesticide/veterinary residues, species and amendments.");
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
    action.push("Chapter 2.4.6(16) raw pulse quality limits transcribed and exact Pulses aflatoxins mapped; specific quality rule 2.4.6(16) is linked and parent FoSCoS 2.4.6 retained. Do not treat this as a complete product standard or regulatory compliance pass.");
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
    soybean_conditional_total_aflatoxin_review:soybeanConditionalReview?{
      status:"source_verified_conditional_article_no_auto_application",
      source:soyReview.source_contaminants_url,article:soyReview.applicable_article_for_review,
      candidate_total_aflatoxins_limit:20,unit:"µg/kg",
      raw_oilseed_total_comparison:15,auto_applied:false,
      finished_product_compliance_verified:false
    }:null,
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
// Machine-readable review queue in Actions logs supports safe, identity-by-identity
// follow-up when artifact ZIP access is unavailable. This is NOT a compliance list.
console.log("PMSV_UNVERIFIED_IDENTITIES_JSON="+JSON.stringify(pendingContaminantProducts.map(p=>({id:p.id,name:p.name,fssr:p.fssr,fcs:p.fcs}))));
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
  "| INS 412 Guar Gum linked to source-literal Gaur gum Arsenic and Lead | "+(counts.special_guar_gum_metal?.exact_ins_412_official_alias||0)+" |",
  "| Named other edible oils with source-verified grouped Lead 0.1 mg/kg | "+(counts.chapter_2_2_other_oil_lead?.exact_oil_grouped_source_partial||0)+" |",
  "| Exact INS 223/224 metabisulphite substance metal impurity articles | "+(counts.special_ins_additive_identity_metal?.exact_substance_lead_selenium||0)+" |",
  "| Fresh Eggs with exact nine shell-free FSSAI commodity pesticide source rows, review only | "+(counts.chapter_2_5_eggs_exact_article?.shell_free_pesticide_reference_only||0)+" |",
  "| Exact fresh/minimally processed vegetable identities with source-backed Chromium and Nickel | "+(counts.chapter_2_3_fresh_vegetables?.source_backed_chromium_nickel_only||0)+" |",
  "| Exact Chapter 2.2 oil identities with grouped source-backed metal limits | "+((counts.chapter_2_2_exact_oil_metal_articles?.hydrogenated_interesterified_nickel||0)+(counts.chapter_2_2_exact_oil_metal_articles?.named_edible_seed_oil_lead_arsenic||0))+" |",
  "| Exact pure cereal products with two official grouped aflatoxin limits | "+(counts.chapter_2_4_pure_cereal_product_aflatoxins?.exact_cereal_product_partial||0)+" |",
  "| Finished Chapter 2.10 non-alcoholic beverages with Saffrole source evidence | "+(counts.chapter_2_10_nots?.source_backed_finished_non_alcoholic_saffrole||0)+" |",
  "| Processed meat identities with grouped FSSAI Saffrole partial evidence | "+(counts.processed_meat_nots?.exact_grouped_meat_saffrole_partial||0)+" |",
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
  "| Chapter 2.4 non-fermented soybean identities with conditional total-aflatoxins source review (not auto-applied) | "+(counts.chapter_2_4_soybean_total_aflatoxin_review?.source_verified_conditional_not_auto_applied||0)+" |",
  "| Chapter 2.4 Unprocessed raw Pulses aflatoxins + linked specific 2.4.6(16) quality clause | "+(counts.chapter_2_4_unprocessed_whole_raw_pulses?.partial_exact_source_contaminant_and_quality_clause||0)+" |",
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
