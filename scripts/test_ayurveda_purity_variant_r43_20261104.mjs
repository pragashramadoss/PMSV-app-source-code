import assert from "node:assert/strict";
import fs from "node:fs";
import {ORIGINAL_14,reviewIngredientPuritySource,reviewRecipeVariant,SOURCE_RECIPE_HOLDS} from "../fssai-helper/ayurveda-purity-variant-gate-r43-20261104.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r40=read("fssai-helper/ayurveda-ginger-source-and-14-holds-r40-2026-11-04.json");
const r42=read("fssai-helper/ayurveda-microbiological-sampling-r42-2026-11-04.json");
const r43=read("fssai-helper/ayurveda-purity-and-variant-holds-r43-2026-11-04.json");
const keys=x=>x.recipe_number+":"+x.source_ingredient_serial;
const sourceKeys=new Set(r40.remaining_14_original_ingredient_instances.map(keys));
const r43Rows=r43.remaining_14_evidence_registry;
assert.equal(sourceKeys.size,14);
assert.equal(r43Rows.length,14);
assert.equal(new Set(r43Rows.map(x=>x.ingredient_key)).size,14);
assert.deepEqual(new Set(r43Rows.map(x=>x.ingredient_key)),sourceKeys);
assert.deepEqual(new Set(ORIGINAL_14.map(x=>x.id)),sourceKeys);
for(const x of r43Rows){
 assert.equal(x.ingredient_key,keys(x));
 assert.equal(x.new_raw_CTR_source_candidate_added,false);
 assert.equal(x.raw_CTR_applicability_approved,false);
 assert.equal(x.regulatory_product_PASS,false);
 assert.equal(x.commercial_batch_release_authorized,false);
 assert.equal(x.declared_selected_purity_standard_and_monograph,false);
 assert.equal(x.declared_adopted_criteria_to_licensing_authority,false);
 assert.equal(x.additional_evidence_confirmed,false);
 assert.equal(x.contains_source_recipe_alignment_hold,["14.6","14.7"].includes(x.recipe_number));
 assert(x.additional_required_evidence.length>=3);
 const decision=reviewIngredientPuritySource(x.ingredient_key);
 assert.equal(decision.legalPASS,false);
 assert.equal(decision.commercialRelease,false);
 assert.equal(decision.numericCTRAutoApplied,false);
 assert(decision.status==="PURITY_EVIDENCE_HOLD"||decision.status==="OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD");
}
assert.equal(r43Rows.filter(x=>x.source_family==="water").length,4);
assert.equal(r43Rows.filter(x=>x.source_family!=="water").length,10);
assert.equal(r43Rows.filter(x=>x.evidence_route==="FLOWER_PROCESS_STAGE").length,5);
assert.equal(r43.counts.R43_ingredient_rows_reviewed,14);
assert.equal(r43.counts.new_raw_CTR_source_candidate_links,0);
assert.equal(r43.counts.remaining_raw_CTR_source_candidate_gaps,14);
assert.equal(r43.counts.previous_R40_raw_CTR_source_links,94);
assert.equal(r43.counts.product_specific_CTR_article_decisions_open,137);
assert.equal(r42.preserved_exact_product_CTR_applicability_holds,137);
assert.equal(r43.counts.legal_product_approvals,0);
assert.equal(r43.recipe_14_6.printed_ingredient_table_rows,13);
assert.equal(r43.recipe_14_6.variants.length,4);
assert.deepEqual(r43.recipe_14_6.variants.map(x=>x.variant),["Ksheerapaka","Lehya","Ghatika","Sharkara"]);
assert.deepEqual(r43.recipe_14_6.variants[3].method_mentions_ingredients_absent_from_table,["Karpura","Kasturi"]);
assert.equal(r43.recipe_14_7.printed_ingredient_table_rows,4);
assert(r43.recipe_14_7.published_method.includes("discard flowers"));
assert.deepEqual(SOURCE_RECIPE_HOLDS,["14.6","14.7"]);
for(const id of SOURCE_RECIPE_HOLDS){
 const out=reviewRecipeVariant(id,{officialCorrigendumOrIndependentLegalResolution:true,actualRecipeVariantAndFormulationConfirmed:true,flowerProcessExposureTransferStudyReviewed:true,finishedFoodSafetyMethodAndLabResultsReviewed:true});
 assert.equal(out.status,"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD");
 assert.equal(out.legalPASS,false);
 assert.equal(out.commercialRelease,false);
}
const good=Object.fromEntries([
"adoptedPurityStandardAndEditionDocumented","adoptedCriteriaLicensingDisclosureReviewed","actualSupplierLotAndSpecificationReviewed",
"actualGradeAndRawMaterialFormVerified","currentLegalArticleAndProcessingBasisReviewed","actualLaboratoryEvidenceReviewed",
"sourcePageAndCurrentAmendmentsVerified","waterPotabilityAndPointOfUseEvidenceReviewed",
"botanicalSpeciesPartAndAllowedFoodUseReviewed","flowerRemovalAndTransferEvidenceReviewed","edibleCamphorCompositionAndToxicologyReviewed"
].map(x=>[x,true]));
for(const r of ORIGINAL_14.filter(x=>!x.id.startsWith("14.6:")&&!x.id.startsWith("14.7:"))){
 const out=reviewIngredientPuritySource(r.id,good);
 assert.equal(out.status,"PURITY_SOURCE_REVIEW_READY");
 assert.equal(out.legalPASS,false);
 assert.equal(out.numericCTRAutoApplied,false);
}
assert.equal(r43.new_numerical_CTR_rule_changes,0);
assert.equal(r43.live_app_modified,false);
assert.equal(r43.live_product_master_modified,false);
assert.equal(r43.PR_2_remains_draft_unmerged,true);
console.log(JSON.stringify({result:"PASS",remaining:14,purityRoutes:14,water:4,botanical:10,flower:5,sourceRecipeVariants:4,rawCTRLinks:94,productCTRholds:137,approved:0}));
