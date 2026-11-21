/* R7 source-edition comparisons only. Never grants whole-product or lot approval. */
(function(root){'use strict';
const finite=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
const outcome=(status,reason,extra={})=>({status,reason,...extra,full_product_approved:false,lot_release:false,current_law_verified:false});
function create(reg){
 if(!reg||!Array.isArray(reg.rules)||!Array.isArray(reg.products))throw new TypeError('Reviewed registry required');
 const rows=new Map(reg.rules.map(r=>[r.id,r])),products=new Map(reg.products.map(p=>[p.id,p])),plans=new Map(reg.microbiology.map(r=>[r.id,r]));
 function evaluate(productId,rowId,measurement,context={}){
  const p=products.get(productId),r=rows.get(rowId);
  if(!p||!r||!p.rule_ids.includes(rowId))return outcome('NOT_APPLICABLE','Product and requirement membership do not match.');
  if(r.source_question)return outcome('SOURCE_RECONCILIATION_REQUIRED',r.source_question);
  if(r.operator==='text')return outcome('MANUAL_REVIEW_REQUIRED',r.requirement||r.value);
  if(!context||context.scope_confirmed!==true||context.source_variant!==r.variant)return outcome('VARIANT_REQUIRED','Establish the exact source variant and any conditions. A similar product name is insufficient.');
  if(!measurement||measurement.unit!==r.unit||measurement.basis!==r.basis)return outcome('UNIT_OR_BASIS_MISMATCH','No automatic conversions or analytical-basis substitutions.');
  const x=measurement.value;if(!finite(x))return outcome('INVALID_RESULT','A finite non-negative numerical measurement is required; no empty, censored, averaged or textual result is converted.');
  let within;
  if(r.operator==='<=')within=x<=r.value;else if(r.operator==='>=')within=x>=r.value;
  else if(r.operator==='<')within=x<r.value;else if(r.operator==='>')within=x>r.value;
  else if(r.operator==='=')within=x===r.value;else if(r.operator==='range')within=x>=r.min&&x<=r.max;
  else return outcome('UNSUPPORTED_REQUIREMENT','No automatic decision implemented for this operator.');
  return outcome(within?'WITHIN_THIS_SOURCE_LIMIT':'OUTSIDE_THIS_SOURCE_LIMIT','Only this source-edition row is compared. All other applicable rows and regulatory layers remain separate.');
 }
 function evaluateMicro(productId,planId,values,context={}){
  const p=products.get(productId),r=plans.get(planId);
  if(!p||!r||!p.microbiology_profiles.includes(r.profile))return outcome('NOT_APPLICABLE','No matching spice-category route for this product.');
  if(!context||context.category!==r.profile||context.category_confirmed!==true||context.method_scope_confirmed!==true)return outcome('CATEGORY_AND_METHOD_REQUIRED','Confirm actual processing/form category and adopted laboratory method, not just dried in the name.');
  if(context.unit!==r.unit||context.organism!==r.organism)return outcome('UNIT_OR_ORGANISM_MISMATCH','The test organism and unit must match this criterion.');
  if(!Array.isArray(values)||values.length!==r.n)return outcome('COMPLETE_PLAN_REQUIRED','Provide every individual sample result: n = '+r.n+'. Do not use an average or one composite as five units.');
  if(r.organism==='salmonella'){
   if(context.portion_g!==25)return outcome('PORTION_MISMATCH','Absence must be evaluated in the specified 25 g portion for each unit.');
   if(values.some(v=>v!=='absent'&&v!=='present'))return outcome('INVALID_RESULT','Use explicit absent or present for each unit; numeric zero is not a detection result.');
   return outcome(values.every(v=>v==='absent')?'SATISFACTORY_FOR_THIS_PLAN':'UNSATISFACTORY_FOR_THIS_PLAN','Food-safety criterion only; no regulatory three-laboratory decision or lot approval.');
  }
  if(values.some(v=>!finite(v)))return outcome('INVALID_RESULT','Each count must be a finite non-negative number in the stated unit.');
  const aboveM=values.filter(v=>v>r.M).length,aboveMlower=values.filter(v=>v>r.m).length;
  const status=aboveM||aboveMlower>r.c?'UNSATISFACTORY_FOR_THIS_PLAN':aboveMlower?'ACCEPTABLE_FOR_THIS_PLAN':'SATISFACTORY_FOR_THIS_PLAN';
  return outcome(status,(r.layer==='hygiene'?'Process-hygiene criterion; not a market-release test. ':'Food-safety criterion only. ')+'Individual-unit n/c/m/M comparison is not full-product approval.',{units_above_m:aboveMlower,units_above_M:aboveM});
 }
 return Object.freeze({evaluate,evaluateMicro});
}
const api=Object.freeze({create});if(typeof module==='object'&&module.exports)module.exports=api;root.PMSVSpiceSourceGuard=api;
})(typeof globalThis==='object'?globalThis:this);
