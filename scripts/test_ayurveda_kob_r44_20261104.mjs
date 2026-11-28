import assert from "node:assert/strict";
import fs from "node:fs";
import {SOURCE_RECIPES,categoryASourceCheck,otherCategorySourceCheck} from "../fssai-helper/ayurveda-kob-evidence-guard-r44-20261104.mjs";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const a=read("fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json");
const b=read("fssai-helper/ayurveda-kob-licence-claims-r44-2026-11-04.json");
assert.equal(a.records.length,9);
assert.deepEqual(new Set(SOURCE_RECIPES),new Set(a.records.map(x=>x.recipe_number)));
assert.deepEqual(new Set(b.source_recipe_routes.map(x=>x.id)),new Set(a.records.map(x=>x.catalogue_id)));
assert.equal(b.source_verification.kob_pdf_pages_visually_checked,2);
assert.equal(b.source_verification.manufacturing_licence,"Central Licence");
assert.equal(b.category_rules[0].listed_product_document_required,false);
assert(b.category_rules.slice(1).every(x=>x.product_HQ_letter_required===true));
assert(b.source_recipe_routes.every(x=>!x.legal_product_PASS&&!x.commercial_release));
const ok={FoSCoSCategory:"102.1",actualManufacturerCentralLicenceVerified:true,actualSKURecipeMatchesListVerified:true,fullCurrentFoodSafetyAndLabelReviewed:true,claimTypeReviewed:true};
for(const id of SOURCE_RECIPES){
 const result=categoryASourceCheck(id,ok);
 assert.equal(result.legalPASS,false);
 if(["14.6","14.7"].includes(id)){assert.equal(result.status,"OFFICIAL_RECIPE_SOURCE_ALIGNMENT_HOLD");continue;}
 assert.equal(result.status,"CATEGORY_A_SOURCE_REVIEW_READY");
 assert.equal(categoryASourceCheck(id,{...ok,diseaseRiskReductionClaimPresent:true}).status,"CATEGORY_A_EVIDENCE_HOLD");
 assert.equal(categoryASourceCheck(id,{...ok,actualManufacturerCentralLicenceVerified:false}).status,"CATEGORY_A_EVIDENCE_HOLD");
 assert.equal(categoryASourceCheck(id,{...ok,diseaseRiskReductionClaimPresent:true,HQClaimLetterVerified:true}).legalPASS,false);
}
for(const fc of ["102.2","102.3","102.4"]){
 const e={actualManufacturerCentralLicenceVerified:true,actualSKUIdentityVerified:true,fullCurrentFoodSafetyAndLabelReviewed:true};
 assert(otherCategorySourceCheck(fc,e).missing.includes("HQProductApprovalLetterVerified"));
 const r=otherCategorySourceCheck(fc,{...e,HQProductApprovalLetterVerified:true});
 assert.equal(r.status,"B_CATEGORY_SOURCE_REVIEW_READY");
 assert.equal(r.legalPASS,false);
}
assert.equal(b.preserved.catalogue,533);
assert.equal(b.preserved.cumulative_raw_CTR_links,94);
assert.equal(b.preserved.still_without_raw_CTR_source,14);
assert.equal(b.preserved.product_specific_CTR_applicability_pending,137);
assert.equal(b.preserved.legal_product_approvals,0);
assert.equal(b.preserved.live_app_changed,false);
console.log(JSON.stringify({status:"PASS",sourceRecipeIDs:9,FCategories:4,remainingRawGaps:14,productArticleHolds:137,legalApprovals:0}));
