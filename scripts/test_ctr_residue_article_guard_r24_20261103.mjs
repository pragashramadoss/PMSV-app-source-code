import assert from 'node:assert/strict';
import {reviewPesticide,reviewProhibitedVeterinary,reviewHoneyAntibiotic} from '../fssai-helper/ctr-residue-article-guard-r24-2026-11-03.mjs';
let n=0;
function reject(fn,kind){
 const r=fn();assert.equal(r.kind,kind);assert.equal(r.status,'EVIDENCE_HOLD');
 assert.equal(r.legacyComparatorDisabled,true);assert.equal(r.sourceComparatorOnly,true);
 assert.equal(r.productApproved,false);assert.equal(r.fullCurrentLawComplete,false);
 assert.equal(r.commercialReleaseAuthorized,false);n++;return r;
}
const p={assessmentDate:'2026-11-04',pesticideIdentified:true,commodityArticleVerified:true,
 residueDefinitionVerified:true,methodAndMatrixVerified:true,unit:'mg/kg',measured:0.009};
for (const override of [{},{specificMRLFixed:false},
 {specificMRLFixed:false,noMRLFixedVerifiedFromCurrentSource:true},
 {specificMRLFixed:true,specificMRL:0.005},
 {specificMRLFixed:true},{specificMRLFixed:true,specificMRL:999999999},
 {specificMRLFixed:true,specificMRL:0.01,unit:'ug/kg'},
 {specificMRLFixed:true,specificMRL:0.01,assessmentDate:'2026-12-01',december2026CTRReconciled:true},
 {specificMRLFixed:true,specificMRL:0.01,assessmentDate:'2026-02-30'}]){
 reject(()=>reviewPesticide({...p,...override}),'pesticide');
}
const v={assessmentDate:'2026-11-04',productOriginScopeVerified:true,
 substanceOnProhibitedListVerified:true,analyteAndMetabolitesVerified:true,
 methodAndMatrixVerified:true,unit:'mg/kg',measured:0.0002};
for(const override of [{substance:'Chloramphenicol'},
 {substance:'Colistin',measured:0.002},
 {substance:'Unknown',substanceOnProhibitedListVerified:true},
 {substance:'Chloramphenicol',unit:'ug/kg'},
 {substance:'Colistin',assessmentDate:'2026-12-15'}]){
 const r=reject(()=>reviewProhibitedVeterinary({...v,...override}),'prohibited-veterinary');
 assert.equal(r.veterinaryUsePermitted,false);
}
const h={assessmentDate:'2026-11-04',isActualHoney:true,
 analyteAndMarkerVerified:true,methodPerformanceVerified:true,
 sourceMRPL:0.3,unit:'ug/kg',measured:0.2};
for(const override of [{},{sourceMRPL:10000000,measured:12},
 {unit:'mg/kg'},{methodPerformanceVerified:false}]){
 const r=reject(()=>reviewHoneyAntibiotic({...h,...override}),'honey-antibiotic');
 assert.equal(r.antibioticUsePermitted,false);
}
assert.equal(n,18);
console.log('R27 legacy R24 migration PASS: 18 former caller-supplied threshold cases now fail closed');
