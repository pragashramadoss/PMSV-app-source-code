(function(){"use strict";
/* PMSV Batch73 | GH-Pages-only FSSAI preview.
 * Memoize integrity results ONLY across nested calls in one synchronous
 * validation operation. Every independent call creates a new empty map.
 * Do not cache across events, asynchronous fetches or user edits.
 *
 * No source approval, legal rule, laboratory scope, or lot PASS is added.
 */
const exportsToWrap=Object.freeze([
 ["B58","pmsvB58OwnerOutreach"],["B59","pmsvB59CTRSourceCrosswalk"],
 ["B60","pmsvB60LegalScope"],["B61","pmsvB61OriginalGazette"],
 ["B62","pmsvB62IdentitySupersession"],["B63","pmsvB63CocoaMisri"],
 ["B64","pmsvB64OriginalLawCases"],["B65","pmsvB65FourFoodMatrices"],
 ["B66","pmsvB66NutraIngredientAudit"],["B67","pmsvB67SixMatrixEvidence"],
 ["B68","pmsvB68RemainingLeadP1"]
]);
let depth=0,cycle=null,active=false,events=0,cacheHits=0,failures=0;
const originals=new Map();
function stats(){return Object.freeze({
 installed:active,wrapped:originals.size,cycles:events,nestedCacheHits:cacheHits,
 failedValidations:failures,cacheActive:depth>0,
 cacheBeyondSynchronousCycle:false,legallyApprovedCases:0,labPasses:0,releases:0
});}
function resetMetrics(){if(depth!==0)return false;events=0;cacheHits=0;failures=0;return true;}
function install(){
 if(active)return originals.size===exportsToWrap.length;
 // Install atomically. A missing/foreign validator is not treated as approved.
 for(const [,key] of exportsToWrap){
  const obj=window[key];
  if(!obj||typeof obj.valid!=="function")return false;
 }
 for(const [id,key] of exportsToWrap){
  const obj=window[key],original=obj.valid;
  // Never export or replace the original validator; wrap execution only.
  originals.set(id,{obj,original});
  obj.valid=function(...args){
   const isRoot=depth===0;
   if(isRoot){cycle=new Map();events++;}
   depth++;
   try{
    if(cycle.has(id)){cacheHits++;return cycle.get(id);}
    // A reentrant validation is not a proof; prevent unintended recursion.
    cycle.set(id,false);
    let result=false;
    try{result=original.apply(this,args)===true;}
    catch(_){result=false;}
    cycle.set(id,result);
    if(!result)failures++;
    return result;
   }finally{
    depth--;
    if(depth===0)cycle=null;
   }
  };
 }
 active=true;
 return true;
}
function validateAll(){
 if(!active||!install())return false;
 // This is a new synchronous root for every .valid invocation: cache cannot
 // survive into user input, future fetch, or a later regulatory review.
 return window.pmsvB68RemainingLeadP1.valid()===true;
}
if(!install()){
 console.error("PMSV B73: required source validators unavailable; optimization not installed");
}
window.pmsvB73ValidationGraph=Object.freeze({stats,resetMetrics,installed:()=>active,validateAll});
})();