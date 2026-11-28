/* Dated official FAQ document aid. Never approves water quality or a finished food. */
(function(root){
 'use strict';
 const frequency='FAQ 123 describes IS 10500 testing, except radioactive parameters, at least once in every financial year with at least six months between two tests. No due date is calculated here.';
 const guidance=Object.freeze({
  municipal:'For potable water supplied by a Municipal Corporation / government body, FAQ 121 allows commercial-use water bills in place of the mandatory licensing water report. FAQ 123 describes a testing concession when water-bill records are maintained. These records do not prove point-of-use potability.',
  private:'For potable water from a mall, commercial hub, market or other private authority, FAQ 122 calls for a supplier water report meeting the KOB document requirements and no more than one year old. Obtain supplier reports for inspection at the frequency described in FAQ 123. '+frequency,
  own:'Check the applicable KOB licensing water-report requirement for the actual supply. No municipal documentation concession is inferred. '+frequency
 });
 function documentGuide(input){
  const result={status:'INPUT_REQUIRED',legalProductApproval:false,batchRelease:false,waterQualityApproved:false,autoApplyLimits:false,dueDate:null};
  if(!input||typeof input!=='object')return {...result,message:'Identify the water use and supplier first.'};
  if(input.use!=='ingredient')return {...result,status:'OUTSIDE_INGREDIENT_FAQ',message:'This FAQ aid covers water used as a food ingredient. Do not apply its documentation concessions to vending, packaged or mineral-water product standards.'};
  if(!Object.hasOwn(guidance,input.supplier))return {...result,message:'Identify the supplier. Mixed or unknown supplies require separate source checks; no documentation concession is inferred.'};
  return {...result,status:'DOCUMENT_GUIDANCE_ONLY',supplier:input.supplier,message:guidance[input.supplier]+' Source: FoSCoS FAQs 121–123 (21 July 2022), page 18. Confirm current requirements for the applicable KOB. No water-quality or product approval.'};
 }
 const api=Object.freeze({documentGuide});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PMSVWaterEvidence=api;
 if(typeof document==='undefined')return;
 document.addEventListener('change',event=>{
  const form=event.target.closest('#waterEvidenceForm');
  if(form)form.querySelector('[role="status"]').textContent='Supply changed. Show the evidence checklist again.';
 });
 document.addEventListener('submit',event=>{
  const form=event.target.closest('#waterEvidenceForm');if(!form)return;
  event.preventDefault();
  form.querySelector('[role="status"]').textContent=documentGuide({use:form.dataset.waterUse,supplier:form.elements.supplier.value}).message;
 });
})(typeof globalThis==='object'?globalThis:this);
