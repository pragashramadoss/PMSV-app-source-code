import assert from "node:assert/strict";
import fs from "node:fs";
import {reviewPanMasalaEvidence,EXPECTED_R58_ID} from "../fssai-helper/ctr-pan-masala-evidence-gate-r58-20261104.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const r=read("fssai-helper/ctr-pan-masala-product-label-packaging-r58-2026-11-04.json");
const r29=read("fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json");
const r50=read("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json");
const r55=read("fssai-helper/ctr-mouth-freshener-2021-direction-r55-2026-11-04.json");
const master=read("fssai-product-helper-preview-01/data/product-master-v1.json");
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(r29.records.length,137);assert.equal(r50.records.length,137);
assert.equal(r.original_finished_food_CTR_article_holds,137);
assert.equal(r.catalogue_identity_count,533);
const old=r29.records.find(x=>x.catalog_id===EXPECTED_R58_ID);
const q=r50.records.find(x=>x.id===EXPECTED_R58_ID);
assert.ok(old&&q);
assert.equal(old.product_name,"Pan Masala");
assert.equal(old.fcs,"100");assert.equal(old.fssr,"2.11.5");
assert.equal(q.priority,"P2");assert.equal(q.currentLegalArticleAdjudicated,false);
assert.deepEqual(r.source_reviewed_catalogue_ids,[EXPECTED_R58_ID]);
assert.equal(r.original_r29_FPC,old.fcs);
assert.equal(r.original_r29_FSSR,old.fssr);
assert.equal(r.r50_priority,q.priority);
assert.equal(r.product_identity_source.total_ash_max_percent_dry_basis,8);
assert.equal(r.product_identity_source.acid_insoluble_ash_max_percent_dry_basis,0.5);
assert.equal(r55.pan_masala_distinction.these_pan_masala_limits_auto_applied_to_5_2_4_products,false);
const primary=r.source_documents;
assert.equal(primary.product_2_11_5.pdf_page_zero_based,2);
assert.equal(primary.product_2_11_5.pdf_page_image_verified,true);
assert.equal(primary.ctr_2026.pdf_page_zero_based,13);
assert.equal(primary.ctr_2026.pdf_page_image_verified,true);
assert.equal(primary.current_warning.pdf_page_zero_based,29);
assert.equal(primary.current_warning.pdf_page_image_verified,true);
assert.equal(primary.future_advertising_amendment.effective_date,"2027-07-01");
assert.equal(primary.future_advertising_amendment.page_image_verified_for_commencement,true);
assert.equal(primary.packaging_2026_FSSAI_amendment_listing.gazette_publication_date,"2026-08-10");
assert.equal(primary.packaging_2026_FSSAI_amendment_listing.original_final_gazette_pdf_image_verified,false);
const expected=[
["Total Aflatoxins","Arecanut or Betelnut",15],
["Aflatoxin B1","Arecanut or Betelnut",10],
["Total Aflatoxins","Food product containing any of the above mentioned food articles",20],
["Aflatoxin B1","Food product containing any of the above mentioned food articles",10]
];
assert.equal(r.raw_and_composite_aflatoxin_source_rows.length,4);
for(let i=0;i<4;i++){
 const x=r.raw_and_composite_aflatoxin_source_rows[i];
 assert.equal(x.analyte,expected[i][0]);assert.equal(x.printed_article,expected[i][1]);
 assert.equal(x.source_limit_ugkg,expected[i][2]);
 assert.equal(x.source_pdf_page_image_verified,true);
 assert.equal(x.auto_apply,false);assert.equal(x.actual_finished_food_product_MRL_legally_adjudicated,false);
}
assert.equal(r.current_front_pack_warning_source.front_of_pack_warning_area_percent,50);
assert.equal(r.current_front_pack_warning_source.text,"CHEWING OF PAN MASALA IS INJURIOUS TO HEALTH");
assert.equal(r.published_packaging_2026_source.schedule_IV_label,"Suggestive packaging materials");
assert.equal(r.published_packaging_2026_source.separate_mandatory_PWM_prohibitions_not_equated_to_suggestive_list,true);
assert.equal(r.published_packaging_2026_source.official_final_gazette_PDF_primary_page_image_verification_pending,true);
assert.equal(r.future_label_regulatory_gate.future_2027_requirement_active_as_of_2026_11_04,false);
assert.equal(r.new_legally_adjudicated_product_CTR_articles,0);
assert.equal(r.new_fully_approved_products,0);assert.equal(r.commercial_batch_releases,0);
assert.equal(r.original_R29_R50_R55_registers_modified,false);
assert.equal(r.product_master_modified,false);assert.equal(r.operative_numeric_rules_modified,false);
assert.equal(r.live_helper_modified,false);assert.equal(r.PR_2_draft_unmerged,true);
const s=reviewPanMasalaEvidence(r,EXPECTED_R58_ID);
assert.equal(s.status,"PAN_MASALA_OFFICIAL_SOURCE_REVIEWED__FINISHED_PRODUCT_EVIDENCE_HOLD");
assert.equal(s.legalProductPASS,false);assert.equal(s.commercialBatchReleaseAuthorized,false);
const bad=reviewPanMasalaEvidence(r,EXPECTED_R58_ID,{
 legalProductPASS:true,batchRelease:true,autoApplyBetelnutMRL:true,autoApplyCompositeMRL:true,
 autoUse2027Amendment:true,autoApprovePaperOrGlassPack:true,allEvidenceComplete:true
});
assert.equal(bad.status,"INDEPENDENT_ACTUAL_SKU_AND_EFFECTIVE_LAW_ASSESSMENT_REQUIRED");
assert.equal(bad.legalProductPASS,false);assert.equal(bad.numericCTRAutoApplied,false);
assert.equal(reviewPanMasalaEvidence(r,"05-05-2-spice-based-mouth-fresheners").status,"NOT_IN_R58_SCOPE");
const tampered=structuredClone(r);tampered.raw_and_composite_aflatoxin_source_rows[2].source_limit_ugkg=15;
assert.equal(reviewPanMasalaEvidence(tampered,EXPECTED_R58_ID).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const future=structuredClone(r);future.future_label_regulatory_gate.future_2027_requirement_active_as_of_2026_11_04=true;
assert.equal(reviewPanMasalaEvidence(future,EXPECTED_R58_ID).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
const pack=structuredClone(r);pack.published_packaging_2026_source.official_final_gazette_PDF_primary_page_image_verification_pending=false;
assert.equal(reviewPanMasalaEvidence(pack,EXPECTED_R58_ID).status,"SOURCE_REGISTER_INTEGRITY_HOLD");
console.log(JSON.stringify({
 status:"PASS",PanMasalaOriginalCatalogueCases:1,
 selectedCTRSourceRows:4,warningFrontPackPercent:50,
 packagingGazetteDate:"2026-08-10",futureAdAmendmentDate:"2027-07-01",
 originalProductCTRArticleHolds:137,newLegalApprovals:0
},null,2));
