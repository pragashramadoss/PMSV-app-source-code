import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewR50Evidence,REQUIRED_EVIDENCE,R50_TYPES} from "../fssai-helper/ctr-137-evidence-review-gate-r50-20261104.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const previous=read("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r50=read("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r45=read("fssai-helper/ctr-cocoa-sugar-article-evidence-r45-2026-11-04.json");
const r46=read("fssai-helper/ctr-fruit-cheese-murabba-frozen-vegetables-r46-2026-11-04.json");
const r47=read("fssai-helper/ctr-coconut-milk-cream-powder-r47-2026-11-04.json");
const r48=read("fssai-helper/ctr-frozen-fruit-tamarind-potato-r48-2026-11-04.json");
assert.equal(previous.catalogue,533);
assert.equal(previous.records.length,137);
assert.equal(previous.source_screening_closed,137);
assert.equal(previous.exact_CTR_product_article_applicability_still_open,137);
assert.equal(r50.records.length,137);
const original=new Map(previous.records.map(x=>[x.catalog_id,x]));
const ids=new Set(r50.records.map(x=>x.id));
assert.equal(ids.size,137);
assert.deepEqual(ids,new Set(original.keys()));
const expectedRoutes={SOURCE_IDENTITY_STANDARD_NOT_CTR_DECISION:16,CONDITIONAL_CTR_SOURCE_CANDIDATE:70,
 FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION:26,INTERIM_LICENSING_ROUTE_NOT_CTR_DECISION:2,
 WRONG_ARTICLE_INHERITANCE_BLOCKED:2,AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED:9,CONDITIONAL_FPC18_DIRECTION:12};
assert.deepEqual(r50.counts.by_route,expectedRoutes);
assert.deepEqual(r50.counts.priority,{P3:51,P2:70,P0:4,P1:12});
assert.deepEqual(new Set(Object.keys(r50.counts.by_route)),new Set(R50_TYPES));
const priorFocused=[
 ["R45",r45.reviewed_original_catalogue_entries.map(x=>x.catalogue_id)],
 ["R46",r46.actual_catalogue_records.map(x=>x.catalogue_id)],
 ["R47",r47.products.map(x=>x.catalogue_id)],
 ["R48",r48.product_cases.map(x=>x.catalogue_id)]];
const focused=new Map();
for(const [round,list] of priorFocused){
 for(const id of list){assert(!focused.has(id));focused.set(id,round);}
}
assert.equal(focused.size,16);
let emptyFSSR=0,emptyFCS=0,held=0;
for(const row of r50.records){
 const source=original.get(row.id);
 assert(source,"Unknown original row "+row.id);
 assert.equal(row.name,source.product_name);
 assert.equal(row.fssr,source.fssr||null);
 assert.equal(row.fcs,source.fcs||null);
 assert.equal(row.route,source.r29_source_screening_route);
 assert.equal(row.priorFocusedReview,focused.get(row.id)||null);
 assert.equal(row.sourceScreened,true);
 assert.equal(row.currentExactArticleDecision,"EVIDENCE_HOLD");
 assert.equal(row.currentLegalArticleAdjudicated,false);
 assert.equal(row.actualSKUAndLotEvidenceInSourceRecord,false);
 assert.equal(row.completeCTRPanelAndLaboratoryDataConfirmed,false);
 assert.equal(row.fullLegalProductPASS,false);
 assert.equal(row.releaseAuthorized,false);
 assert.equal(row.route in r50.evidence_checklists.route_specific_next_action,true);
 const empty=reviewR50Evidence(row,{});
 assert.equal(empty.legalProductPASS,false);
 assert.equal(empty.batchReleaseAuthorized,false);
 assert.equal(empty.exactFinishedCTRArticleLegallyAdjudicated,false);
 assert.equal(empty.liveNumericSourceAutoApply,false);
 assert.notEqual(empty.status,"R50_EVIDENCE_REVIEW_READY_NOT_LEGAL_PASS");
 const all=Object.fromEntries(REQUIRED_EVIDENCE.map(s=>[s,true]));
 Object.assign(all,{actualFPC18DirectionEligibilityVerified:true,specificAnnexureAndBaseIngredientEvidenceReviewed:true,
 actualAyurvedaRecipeAndLicensingVerified:true,currentScheduleDAndIngredientPurityReviewed:true,
 currentInterimLicenceStatusReviewed:true,independentCorrectNonCocoaSourceArticleVerified:true,
 actualFoodProductStandardOrProprietaryRouteReviewed:true,officialSourceRecipeConflictIndependentlyResolved:true,
 ctrArticleName:"Other food article"});
 const d=reviewR50Evidence(row,all);
 assert.equal(d.status,"R50_EVIDENCE_REVIEW_READY_NOT_LEGAL_PASS");
 assert.equal(d.legalProductPASS,false);
 assert.equal(d.batchReleaseAuthorized,false);
 assert.equal(d.liveNumericSourceAutoApply,false);
 if(!row.fssr)emptyFSSR++;
 if(!row.fcs){emptyFCS++;assert.equal(row.route,"AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED");}
 if(row.currentExactArticleDecision==="EVIDENCE_HOLD")held++;
 if(row.route==="WRONG_ARTICLE_INHERITANCE_BLOCKED"){
  assert.equal(reviewR50Evidence(row,{...all,ctrArticleName:"Cocoa powder"}).status,"WRONG_COMMODITY_ARTICLE_BLOCK");
 }
 if(row.route==="AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED"&&row.priority==="P0"){
  assert.equal(reviewR50Evidence(row,{...all,officialSourceRecipeConflictIndependentlyResolved:false}).status,"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD");
 }
 if(row.route==="CONDITIONAL_FPC18_DIRECTION"){
  assert.equal(reviewR50Evidence(row,{...all,specificAnnexureAndBaseIngredientEvidenceReviewed:false}).status,"R50_EVIDENCE_HOLD");
 }
}
assert.equal(held,137);
assert.equal(emptyFSSR,33);
assert.equal(emptyFCS,9);
assert.equal(r50.counts.focused_R45_R48_unique_cases,16);
assert.equal(r50.counts.without_R45_R48_focused_review,121);
assert.equal(r50.counts.empty_FSSR_source_record_fields,33);
assert.equal(r50.counts.empty_FCS_source_record_fields,9);
assert.equal(r50.counts.exact_legal_article_decisions_closed_this_round,0);
assert.equal(r50.counts.open_exact_article_decisions,137);
assert.equal(r50.counts.legal_product_approvals,0);
assert.equal(r50.counts.commercial_releases,0);
assert.equal(r50.counts.separate_Ayurveda_raw_source_links,94);
assert.equal(r50.counts.separate_Ayurveda_raw_source_gaps,14);
assert.equal(r50.live_PMSV_helper_changed,false);
assert.equal(r50.operative_numeric_CTR_rules_changed,false);
assert.equal(r50.product_master_changed,false);
assert.equal(r50.PR_2_remains_draft_unmerged,true);
console.log(JSON.stringify({status:"PASS",sourceScreened:137,legalArticleHolds:137,focused:16,
 outstanding:121,missingFSSR:33,missingFCS:9,priorityCounts:r50.counts.priority,
 newLegalPass:0,changedLiveProduction:false},null,2));
