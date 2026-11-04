/** R27 migration guard: historical R24 comparisons accept caller-entered legal limits,
 * and are therefore RETIRED. Use source-anchored R25/R26 comparator with pinned
 * Version IX source-data integrity. This legacy API intentionally fails closed.
 */
const hold=(kind,reason,extra={})=>({kind,status:'EVIDENCE_HOLD',reason,
  legacyComparatorDisabled:true,sourceComparatorOnly:true,
  fullCurrentLawComplete:false,productApproved:false,
  commercialReleaseAuthorized:false,...extra});
export function reviewPesticide(_ctx={}){
 return hold('pesticide','R24 caller-entered pesticide MRL path retired: use pinned-source pesticideBySource; no default 0.01 mg/kg without verified current-law article');
}
export function reviewProhibitedVeterinary(_ctx={}){
 return hold('prohibited-veterinary','R24 caller-entered prohibited-substance and EMRL path retired: use pinned-source prohibitedVetBySource', {veterinaryUsePermitted:false});
}
export function reviewHoneyAntibiotic(_ctx={}){
 return hold('honey-antibiotic','R24 caller-entered honey antibiotic MRPL path retired: use pinned-source honeyMRPLBySource', {antibioticUsePermitted:false});
}
