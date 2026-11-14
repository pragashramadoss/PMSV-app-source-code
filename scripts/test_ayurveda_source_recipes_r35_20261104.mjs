import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewAyurvedaSourceRecipe,sourceRecipeMayApproveProduct,SOURCE_RECIPE_ROWS}
 from '../fssai-helper/ayurveda-recipe-evidence-gate-r35-20261104.mjs';
const manifest=JSON.parse(readFileSync('fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json','utf8'));
const previous=JSON.parse(readFileSync('fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json','utf8'));
const master=JSON.parse(readFileSync('fssai-product-helper-preview-01/data/product-master-v1.json','utf8'));
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(manifest.official_recipe_entries_crosslinked,9);
assert.equal(manifest.official_printed_ingredient_rows,46);
assert.equal(manifest.original_exact_CTR_article_gaps,137);
assert.equal(manifest.full_product_approvals,0);
assert.equal(sourceRecipeMayApproveProduct(),false);
assert.equal(Object.keys(SOURCE_RECIPE_ROWS).length,9);
const r29=new Map(previous.records.filter(x=>x.r29_source_screening_route==='AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED').map(x=>[x.catalog_id,x]));
assert.equal(r29.size,9);
let scenarioCount=0;
function safe(label,r,status){
 assert.equal(r.status,status,label);
 assert.equal(r.productLegallyApproved,false,label);
 assert.equal(r.commercialLotReleaseAuthorized,false,label);
 assert.equal(r.numericLimitAutoApplied,false,label);
 assert.equal(r.fullCurrentLawComplete,false,label);
 assert.equal(r.exactCTRFinishedProductArticleAdjudicated,false,label);
 assert.equal(r.liveEngineChanged,false,label);
 assert.notEqual(r.status,'PASS',label);
 scenarioCount++;
 return r;
}
const required=[
 'actualSKUAndProductIdentityEstablished',
 'actualFormulaIngredientsAndRatiosCollected',
 'botanicalSpeciesAndPartsVerified',
 'recipeVariantAndAllowedSubstitutionsReviewed',
 'manufacturingProcessAndConcentrationFactorReviewed',
 'applicableCurrentOriginalLegalSourcesChecked',
 'commoditySpecificToxinsAndPesticideMRLsReviewed',
 'metalsAndVeterinaryResidueScopeReviewed',
 'microbiologicalRequirementsAndSamplingVerified',
 'methodAndAnalyticalMatrixConfirmed',
 'laboratoryEvidenceReviewed',
 'officialRecipePageImageIndependentlyConfirmed'
];
const full=r=>({assessmentDate:'2026-11-04',catalogueId:r.catalogue_id,confirmedRecipeNumber:r.recipe_number,
 ...Object.fromEntries(required.map(g=>[g,true])),
 actualKulmashaBase:'barley'});
for(const r of manifest.records){
 assert(r29.has(r.catalogue_id));
 assert.equal(r29.get(r.catalogue_id).specific_identity_clause_or_recipe,r.recipe_number);
 assert.equal(r.ingredient_table_row_count,SOURCE_RECIPE_ROWS[r.recipe_number]);
 assert.equal(r.ingredients.length,SOURCE_RECIPE_ROWS[r.recipe_number]);
 assert.equal(r.official_pdf_text_checked,true);
 assert.equal(r.pdf_page_image_visual_validation,'UNAVAILABLE_SCREENSHOT_TOOL_TIMEOUT');
 assert.equal(r.ctr_finished_food_article_applicability_adjudicated,false);
 assert.equal(r.full_product_regulatory_compliance_approved,false);
 const x=full(r),ambiguous=['14.6','14.7'].includes(r.recipe_number);
 const expected=ambiguous?'OFFICIAL_SOURCE_TEXT_ALIGNMENT_HOLD':'SOURCE_INGREDIENT_REVIEW_READY_NOT_APPROVED';
 const result=safe('full evidence still no PASS '+r.recipe_number,reviewAyurvedaSourceRecipe(manifest,x),expected);
 assert.equal(result.record.recipeNumber,r.recipe_number);
 assert.equal(result.record.officialIngredientRows.length,r.ingredient_table_row_count);
 safe('missing formula '+r.recipe_number,reviewAyurvedaSourceRecipe(manifest,{...x,actualFormulaIngredientsAndRatiosCollected:false}),
   ambiguous?'OFFICIAL_SOURCE_TEXT_ALIGNMENT_HOLD':'RECIPE_AND_LEGAL_EVIDENCE_HOLD');
 safe('wrong recipe '+r.recipe_number,reviewAyurvedaSourceRecipe(manifest,{...x,confirmedRecipeNumber:'14.2'}),
   'RECIPE_ID_MISMATCH');
 safe('post Dec amendment '+r.recipe_number,reviewAyurvedaSourceRecipe(manifest,{...x,assessmentDate:'2026-12-01'}),
   'POST_AMENDMENT_REVALIDATION_HOLD');
 for(const gate of required){
  const result=safe('unverified '+gate+' '+r.recipe_number,
    reviewAyurvedaSourceRecipe(manifest,{...x,[gate]:false}),
    ambiguous?'OFFICIAL_SOURCE_TEXT_ALIGNMENT_HOLD':'RECIPE_AND_LEGAL_EVIDENCE_HOLD');
  if(!ambiguous)assert(result.missingEvidence.includes(gate));
 }
}
const byNumber=Object.fromEntries(manifest.records.map(x=>[x.recipe_number,x]));
assert.equal(byNumber['14.1'].ingredients[0].source_identity,'Cow milk');
assert.equal(byNumber['14.3'].ingredients[1].part_used,'Endosperm');
assert(byNumber['14.5'].ingredients.some(x=>x.source_name==='Karpura'));
assert.equal(byNumber['14.6'].ingredients.length,13);
assert.equal(byNumber['14.7'].ingredients.length,4);
assert(byNumber['14.6'].source_reconciliation_flags.includes('METHOD_MENTIONS_UNLISTED_KARPURA_KASTURI'));
assert(byNumber['14.7'].source_reconciliation_flags.includes('SOURCE_TITLE_METHOD_ALIGNMENT_REVIEW_REQUIRED'));
assert(byNumber['15.1'].printed_preparation_summary.includes('green gram'));
const kulmasha=full(byNumber['15.1']);
const missing=safe('Kulmasha base required',
 reviewAyurvedaSourceRecipe(manifest,{...kulmasha,actualKulmashaBase:undefined}),
 'RECIPE_AND_LEGAL_EVIDENCE_HOLD');
assert(missing.missingEvidence.includes('actualKulmashaBase'));
for(const value of ['barley','green_gram','black_gram']){
 safe('Kulmasha base '+value,reviewAyurvedaSourceRecipe(manifest,{...kulmasha,actualKulmashaBase:value}),
 'SOURCE_INGREDIENT_REVIEW_READY_NOT_APPROVED');
}
safe('unsourced Kulmasha maize rejected',
 reviewAyurvedaSourceRecipe(manifest,{...kulmasha,actualKulmashaBase:'maize'}),'RECIPE_AND_LEGAL_EVIDENCE_HOLD');
safe('unknown product',reviewAyurvedaSourceRecipe(manifest,{...kulmasha,catalogueId:'fake-product'}),
 'CATALOGUE_ROUTE_UNKNOWN');
safe('invalid calendar',reviewAyurvedaSourceRecipe(manifest,{...kulmasha,assessmentDate:'2026-02-30'}),
 'EVIDENCE_HOLD');
const mutations=[
 m=>{m.full_product_approvals=9;},
 m=>{m.official_printed_ingredient_rows=45;},
 m=>{m.records[0].ingredients.pop();},
 m=>{m.records[0].full_product_regulatory_compliance_approved=true;},
 m=>{m.records.find(x=>x.recipe_number==='14.6').source_reconciliation_flags=[];},
 m=>{m.records.find(x=>x.recipe_number==='14.7').route_status='OFFICIAL_INGREDIENT_TABLE_RECORDED_EVIDENCE_HOLD';}
];
for(const mutate of mutations){
 const bad=structuredClone(manifest);mutate(bad);
 safe('tampered source data blocked',reviewAyurvedaSourceRecipe(bad,kulmasha),'SOURCE_REGISTER_INTEGRITY_HOLD');
}
console.log('R35 PASS: '+scenarioCount+' evidence, recipe identity, source mismatch, variant and no-PASS scenarios; nine recipes/46 ingredient rows validated');
