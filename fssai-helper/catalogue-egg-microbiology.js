/* Appendix B, Tables 8A and 8B. Interpret one reported sample set for a single criterion. */
(function(root){
  'use strict';
  const rules=root.PMSVCatalogueRules;
  const products=new Map([
    ['10-10-1-fresh-eggs','egg-01'],
    ['10-10-2-liquid-egg-products','egg-02'],
    ['10-10-2-frozen-egg-products','egg-03'],
    ['10-10-2-egg-powder','egg-03'],
    ['10-10-3-pickled-eggs','egg-04']
  ]);
  const units=Array.from({length:5},(_,i)=>'eggUnit'+(i+1));
  const fields=['eggOrganism','eggLot','eggReport',...units];
  const regulatory='Regulatory sampling uses three sets from the same lot, one per accredited laboratory. All three laboratories must meet the food safety criterion. The regulatory procedure provides no retesting or resampling.';
  function criteria(id,state){
    const key=products.get(id);
    if(!key||key==='egg-01'||(key==='egg-02'&&(state.microForm!==key||!String(state.microFormRef||'').trim())))return [];
    const profile=rules.micro[key].criteria;
    return Object.entries({...profile.hygiene,...profile.safety});
  }
  function outcome(id,state){
    if(!root.PMSVTestingPlan.metalEdition(state.vetDate))return 'Select a supported assessment date.';
    const selected=criteria(id,state).find(([key])=>key===state.eggOrganism);
    if(!selected)return 'Select an applicable criterion.';
    const [key,row]=selected;
    if(!String(state.eggLot||'').trim()||!String(state.eggReport||'').trim())return 'Enter the lot and laboratory report references.';
    const values=units.map(k=>String(state[k]||'').trim());
    if(values.some(v=>!v))return 'Enter all five individual results from the same lot and laboratory report.';
    let above=0,aboveMax=false;
    if(row.unit==='qualitative'){
      if(!values.every(v=>v==='Absent'||v==='Present'))return 'Use the reported presence or absence in 25 g for each unit.';
      above=values.filter(v=>v==='Present').length;
    }else{
      const exceeds=(v,limit)=>root.PMSVCatalogueWorksheets.compare({operator:'>',value:limit},v);
      const high=values.map(v=>exceeds(v,row.m));
      if(high.some(v=>v===null))return 'Enter exact non-negative counts in cfu/g. Censored results and other units need individual review.';
      above=high.filter(Boolean).length;
      aboveMax=row.M!=null&&values.some(v=>exceeds(v,row.M));
    }
    const grade=aboveMax||above>row.c?'Unsatisfactory':above?'Acceptable':'Satisfactory';
    const reason=row.unit==='qualitative'?above+' of 5 units reported present in 25 g.':
      above+' of 5 units above m.'+(row.M!=null?(aboveMax?' At least one exceeds M.':' All five are at or below M.'):'');
    const scope=rules.micro[products.get(id)].criteria.hygiene[key]?'Process hygiene at the end of manufacture.':'Food safety criterion for this laboratory set.';
    return grade+' for this set. '+reason+' '+scope;
  }
  function note(id,state){
    if(!state.eggOrganism||!criteria(id,state).some(([k])=>k===state.eggOrganism))return '';
    const values=units.map(k=>String(state[k]||'').trim()||'—');
    return 'Single laboratory set. Lot: '+(state.eggLot||'—')+'. Report: '+(state.eggReport||'—')+'. Units 1–5: '+values.join(', ')+'. '+outcome(id,state);
  }
  root.PMSVEggMicrobiology=Object.freeze({products,units,fields,criteria,outcome,note,regulatory});
})(globalThis);
