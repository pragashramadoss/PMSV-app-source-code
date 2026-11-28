/* Schedule I arithmetic reference. Does not resolve product applicability or approve claims. */
(function(root){
 'use strict';
 const thresholds=Object.freeze({g_per_100g_solids:Object.freeze([3,6]),g_per_100ml_liquids:Object.freeze([1.5,3]),g_per_100kcal:Object.freeze([1.5,3])});
 function compare(input){
  const result={status:'INPUT_REQUIRED',thresholdMet:null,labelApproved:false,legalProductApproval:false,batchRelease:false,sourceDecision:'CONFLICT_OPEN'};
  if(!input||!Object.hasOwn(thresholds,input.basis)||!['source','high'].includes(input.claim)||typeof input.fibre!=='number'||!Number.isFinite(input.fibre)||input.fibre<0)return result;
  const minimum=thresholds[input.basis][input.claim==='source'?0:1];
  return {...result,status:'ARITHMETIC_ONLY',basis:input.basis,claim:input.claim,fibre:input.fibre,minimum,thresholdMet:input.fibre>=minimum};
 }
 const api=Object.freeze({compare});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PMSVFibreClaims=api;
 if(typeof document==='undefined')return;
 document.addEventListener('input',event=>{
  const form=event.target.closest('#fibreReferenceForm');
  if(form)form.querySelector('[role="status"]').textContent='Values changed. Compare again.';
 });
 document.addEventListener('submit',event=>{
  const form=event.target.closest('#fibreReferenceForm');if(!form)return;
  event.preventDefault();
  const raw=form.elements.fibre.value.trim();
  const r=compare({basis:form.elements.basis.value,claim:form.elements.claim.value,fibre:raw===''?null:Number(raw)});
  form.querySelector('[role="status"]').textContent=r.status==='INPUT_REQUIRED'?'Select a basis and claim, then enter a finite, non-negative fibre amount.':
   `${r.thresholdMet?'Meets':'Below'} the selected numerical minimum (${r.minimum} g). ${r.thresholdMet?'Other claim conditions still require review.':'Other permitted bases have not been assessed.'} Dextrin claim conflict remains open; no label approval.`;
 });
})(typeof globalThis==='object'?globalThis:this);
