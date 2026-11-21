import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assessFpc18SourceRoute,sourceRouteMayApproveProduct,
        EXPECTED_FPC18_ADDITIVE_ROUTES,FPC18_FOOD_NOT_SPECIFIED_METALS,
        REQUIRED_EVIDENCE_FIELDS} from '../fssai-helper/fpc18-evidence-gate-r34-20261104.mjs';

const register=JSON.parse(readFileSync('fssai-helper/ctr-fpc18-full-route-evidence-r34-2026-11-04.json','utf8'));
const master=JSON.parse(readFileSync('fssai-product-helper-preview-01/data/product-master-v1.json','utf8'));
const r29=JSON.parse(readFileSync('fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json','utf8'));
assert.equal(master.catalog_products.length,533);
assert.equal(new Set(master.catalog_products.map(x=>x.id)).size,533);
assert.equal(register.products.length,12);
assert.equal(Object.keys(EXPECTED_FPC18_ADDITIVE_ROUTES).length,12);
assert.equal(register.directed_contaminant_article_rows.length,6);
assert.equal(r29.records.length,137);
const originals=new Map(r29.records.filter(x=>x.r29_source_screening_route==='CONDITIONAL_FPC18_DIRECTION')
  .map(x=>[x.catalog_id,x]));
assert.equal(originals.size,12);
assert.equal(register.full_product_approvals,0);
assert.equal(register.full_CTR_panels_verified,0);
assert.equal(register.new_product_article_adjudications,0);
assert.equal(sourceRouteMayApproveProduct(),false);

let count=0;
function safe(name,r,status){
 assert.equal(r.status,status,name);
 assert.equal(r.currentLawCompletelyVerified,false,name);
 assert.equal(r.productLegallyApproved,false,name);
 assert.equal(r.lotReleaseAuthorized,false,name);
 assert.equal(r.productionRuleChangeAuthorized,false,name);
 assert.equal(r.canCompareNumericLimits,false,name);
 assert.notEqual(r.status,'PASS');
 count++;
 return r;
}
const prepare = p => ({
 catalogId:p.catalog_id,
 assessmentDate:'2026-11-04',
 actualFpcCode:p.fpc_code,
 standardizedMappedUnderFPC01to14:false,
 ...Object.fromEntries(REQUIRED_EVIDENCE_FIELDS.map(x=>[x,true]))
});
for(const p of register.products){
 assert(originals.has(p.catalog_id));
 assert.equal(originals.get(p.catalog_id).fcs,p.fpc_code);
 assert.deepEqual(p.additive_mapped_FSSR_categories,
   EXPECTED_FPC18_ADDITIVE_ROUTES[p.fpc_code]);
 assert.deepEqual(Object.fromEntries(register.directed_contaminant_article_rows.map(r=>[r.analyte,r.limit])),
   FPC18_FOOD_NOT_SPECIFIED_METALS);
 const ok=prepare(p);
 const ready=safe('all evidence only',assessFpc18SourceRoute(register,ok),'SOURCE_ROUTE_REVIEW_READY');
 assert.equal(ready.missingEvidence.length,0);
 assert.deepEqual(ready.route.annexureIIAdditiveReferenceCategories,p.additive_mapped_FSSR_categories);
 assert.equal(ready.route.sourceRowsNotApplied.length,6);
 for(const r of ready.route.sourceRowsNotApplied){
  assert.equal(r.limit,FPC18_FOOD_NOT_SPECIFIED_METALS[r.analyte]);
  assert.equal(r.sourceArticle,'Foods not specified');
 }
 safe('one missing ingredient review',assessFpc18SourceRoute(register,{...ok,ingredientAflatoxinDONAndNOTSReviewed:false}),'EVIDENCE_HOLD');
 safe('no processing proof',assessFpc18SourceRoute(register,{...ok,actualProcessingAndPackagingVerified:null}),'EVIDENCE_HOLD');
 safe('license unverified',assessFpc18SourceRoute(register,{...ok,fpc18LicenseCategoryVerified:undefined}),'EVIDENCE_HOLD');
 safe('one wrong FPC',assessFpc18SourceRoute(register,{...ok,actualFpcCode:'18.2.4'}),'CATEGORY_MISMATCH_HOLD');
 safe('standardized category exclusion',assessFpc18SourceRoute(register,{...ok,standardizedMappedUnderFPC01to14:true}),'FPC18_NOT_APPLICABLE');
 safe('unknown standardized status',assessFpc18SourceRoute(register,{...ok,standardizedMappedUnderFPC01to14:null}),'EVIDENCE_HOLD');
 safe('future amendment not yet recaptured',assessFpc18SourceRoute(register,{...ok,assessmentDate:'2026-12-01'}),'AMENDMENT_REVALIDATION_HOLD');
 safe('invalid calendar',assessFpc18SourceRoute(register,{...ok,assessmentDate:'2026-02-30'}),'EVIDENCE_HOLD');
 const impostor=safe('cannot inject favorable limit',
   assessFpc18SourceRoute(register,{...ok,assertedMetalLimit:9999,measuredValue:0,proprietaryApproval:true}),
   'SOURCE_ROUTE_REVIEW_READY');
 assert.equal(impostor.productLegallyApproved,false);
 for(const key of REQUIRED_EVIDENCE_FIELDS){
  const invalid=safe('missing '+key,
    assessFpc18SourceRoute(register,{...ok,[key]:false}),'EVIDENCE_HOLD');
  assert(invalid.missingEvidence.includes(key));
 }
}
const standard=register.products[0];
const input=prepare(standard);
safe('unknown ID',assessFpc18SourceRoute(register,{...input,catalogId:'fake'}),'UNKNOWN_CATALOG_ID');
safe('empty register',assessFpc18SourceRoute({},input),'SOURCE_INTEGRITY_HOLD');
safe('invalid context',assessFpc18SourceRoute(register,null),'EVIDENCE_HOLD');
for(const mutation of [
 x=>{x.directed_contaminant_article_rows[0].limit=999;},
 x=>{x.products[0].additive_mapped_FSSR_categories=['14.1'];},
 x=>{x.products[0].product_fully_legally_verified=true;},
 x=>{x.products[0].fpc18_eligibility_adjudicated=true;},
 x=>{x.products[0].auto_apply_numeric_limits=true;},
 x=>{x.products[1].fpc_code=x.products[0].fpc_code;},
 x=>{x.full_product_approvals=1;},
 x=>{x.original_r29_article_applicability_gaps=0;},
]){
 const bad=structuredClone(register);mutation(bad);
 safe('tampered source register blocked',assessFpc18SourceRoute(bad,input),'SOURCE_INTEGRITY_HOLD');
}
assert.equal(count,12*(10+REQUIRED_EVIDENCE_FIELDS.length)+3+8);
console.log('R34 PASS: '+count+' evidence-routing and no-PASS scenarios; all 533 IDs and 12 Annexure II category routes preserved');
