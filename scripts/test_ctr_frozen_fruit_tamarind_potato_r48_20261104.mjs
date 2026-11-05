import assert from "node:assert/strict";
import fs from "node:fs";
import {IDS,reviewR48} from "../fssai-helper/ctr-frozen-fruit-tamarind-potato-guard-r48-20261104.mjs";
const get=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r29=get("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r47=get("fssai-helper/ctr-coconut-milk-cream-powder-r47-2026-11-04.json");
const r48=get("fssai-helper/ctr-frozen-fruit-tamarind-potato-r48-2026-11-04.json");
assert.equal(r29.records.length,137);
assert.equal(r47.counts.remaining_finished_CTR_article_holds,137);
assert.equal(r48.product_cases.length,3);
assert.deepEqual(new Set(r48.product_cases.map(x=>x.catalogue_id)),new Set(Object.values(IDS)));
assert.deepEqual(r48.product_cases.map(x=>x.clause),["2.3.37","2.3.49","2.3.60"]);
assert.equal(r48.source_provenance.FSSR_current_compendium_label,"Version 3 (07.05.2025)");
assert.equal(r48.source_provenance.FSSR_v3_pdf_page_images_verified,false);
assert.equal(r48.source_provenance.original_Gazette_controls_where_compendium_differs,true);
for(const x of r48.product_cases){
 const b=r29.records.find(y=>y.catalog_id===x.catalogue_id);
 assert(b&&x.clause===b.fssr&&x.name===b.product_name);
 assert.equal(x.exact_finished_CTR_article_legally_adjudicated,false);
 assert.equal(x.full_product_legal_PASS,false);
 assert.equal(x.commercial_release,false);
 assert.equal(reviewR48(x.catalogue_id,{}).fullProductLegalPASS,false);
}
const ready={actualSKUAndFSSRIdentityConfirmed:true,currentOriginalGazetteAmendmentsReviewed:true,fullRelevantCTRArticlePanelAndAnalyticalMethodsReviewed:true,AppendixBAdditivesAndLabellingReviewed:true};
const ck=(id,e,status)=>{const d=reviewR48(id,e);assert.equal(d.status,status,JSON.stringify(d));assert.equal(d.fullProductLegalPASS,false);assert.equal(d.commercialRelease,false)};
const f={...ready,actualFruitSpeciesConfirmed:true,washedCleanSoundFruitConfirmed:true,freezingStyle:"IQF",blanchingRequired:false,thermalCentreMeasuredAfterStabilisation:true,thermalCentreC:-18,milkSolidsPresent:false};
ck(IDS.fruits,f,"FROZEN_FRUIT_SOURCE_REVIEW_READY");
ck(IDS.fruits,{...f,thermalCentreC:-17.99},"FROZEN_FRUIT_SOURCE_EVIDENCE_HOLD");
ck(IDS.fruits,{...f,blanchingRequired:true,blanchingDone:false},"FROZEN_FRUIT_SOURCE_EVIDENCE_HOLD");
ck(IDS.fruits,{...f,blanchingRequired:true,blanchingDone:true},"FROZEN_FRUIT_SOURCE_REVIEW_READY");
ck(IDS.fruits,{...f,milkSolidsPresent:true,milkAllergenDeclarationVerified:false},"FROZEN_FRUIT_SOURCE_EVIDENCE_HOLD");
ck(IDS.fruits,{...f,milkSolidsPresent:true,milkAllergenDeclarationVerified:true},"FROZEN_FRUIT_SOURCE_REVIEW_READY");
const t={...ready,TamarindusIndicaAndOuterSeedRemovalVerified:true,freeOfInfestationMouldAndProhibitedForeignMatter:true,totalAshAIAAndFibreDryBasisMethodVerified:true,
moisturePct:20,organicExtraneousPct:5,totalAshDryBasisPct:6,acidInsolubleAshDryBasisPct:1,crudeFibreDryBasisPct:9,tamarindSeedsPct:0.5};
ck(IDS.tamarind,t,"TAMARIND_SOURCE_REVIEW_READY");
for(const [key,v] of [["moisturePct",20.01],["organicExtraneousPct",5.01],["totalAshDryBasisPct",6.01],["acidInsolubleAshDryBasisPct",1.01],["crudeFibreDryBasisPct",9.01],["tamarindSeedsPct",0.51]]){
 ck(IDS.tamarind,{...t,[key]:v},"TAMARIND_SOURCE_EVIDENCE_HOLD");
}
ck(IDS.tamarind,{...t,borrowTamarindPureeConcentrateStandard:true},"TAMARIND_SOURCE_EVIDENCE_HOLD");
const p={...ready,species:"Solanum tuberosum",process:"FRIED_IN_PERMITTED_OIL",permittedFatOrOilVerified:true,thermalCentreMeasuredAfterStabilisation:true,thermalCentreC:-18,moisturePct:78,extractedOilFFAasOleicPct:1.5,burntPiecesMassPct:0.5,stripStyle:"STRAIGHT",cutOnFourSides:true,frozenCrossSectionMm:4};
ck(IDS.potatoes,p,"FROZEN_POTATO_SOURCE_REVIEW_READY");
ck(IDS.potatoes,{...p,thermalCentreC:-17.5},"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD");
ck(IDS.potatoes,{...p,moisturePct:78.01},"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD");
ck(IDS.potatoes,{...p,extractedOilFFAasOleicPct:1.501},"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD");
ck(IDS.potatoes,{...p,burntPiecesMassPct:0.501},"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD");
ck(IDS.potatoes,{...p,frozenCrossSectionMm:3.99},"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD");
ck(IDS.potatoes,{...p,borrowRawPotatoOrCannedVegetableCTRArticle:true},"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD");
ck(IDS.potatoes,{...p,species:"Ipomoea batatas",process:"WATER_BLANCHED",permittedFatOrOilVerified:false},"FROZEN_POTATO_SOURCE_REVIEW_READY");
ck(IDS.potatoes,{...p,stripStyle:"OTHER"},"FROZEN_POTATO_SOURCE_EVIDENCE_HOLD");
ck(IDS.potatoes,{...p,stripStyle:"OTHER",otherStyleLabelVerified:true},"FROZEN_POTATO_SOURCE_REVIEW_READY");
assert.equal(r48.counts.original_exact_CTR_product_article_decisions_open_after,137);
assert.equal(r48.counts.new_exact_product_CTR_article_decisions_closed,0);
assert.equal(r48.counts.legally_approved_products,0);
assert.equal(r48.counts.Ayurveda_raw_source_candidate_gaps_unchanged,14);
assert.equal(r48.counts.Ayurveda_raw_CTR_source_reference_links_unchanged,94);
assert.equal(r48.PR_2_remains_unmerged_draft,true);
assert.equal(r48.live_PMSV_application_changed,false);
console.log(JSON.stringify({result:"PASS",cases:3,sourceClauses:3,tamarindLimits:6,potatoStyles:4,productCTRholds:137,legalApprovals:0}));
