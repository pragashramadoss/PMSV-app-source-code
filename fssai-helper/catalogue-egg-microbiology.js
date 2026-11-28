/* Interpret one five-unit laboratory set for an egg product or a Chapter 2.9 spice. */
(function(root){
  'use strict';
  const rules=root.PMSVCatalogueRules;
  const eggProducts=new Map([
    ['10-10-1-fresh-eggs','egg-01'],
    ['10-10-2-liquid-egg-products','egg-02'],
    ['10-10-2-frozen-egg-products','egg-03'],
    ['10-10-2-egg-powder','egg-03'],
    ['10-10-3-pickled-eggs','egg-04']
  ]);
  const spiceProducts=new Map();
  for(const [id,product] of Object.entries(root.PMSVCatalogueEvidence.products)){
    if(product.micro[0]?.[1].report_family==='spice')
      spiceProducts.set(id,product.micro[0][1].profile_key||'');
  }
  function reportFor(prefix,products,table,firstPage){
    const units=Array.from({length:5},(_,i)=>prefix+'Unit'+(i+1));
    const organism=prefix+'Organism', lot=prefix+'Lot', report=prefix+'Report';
    const fields=[organism,lot,report,...units];
    const regulatory='Regulatory sampling uses three sets from the same lot, one per accredited laboratory. All three laboratories must meet the food safety criterion. The regulatory procedure provides no retesting or resampling.';
    function profileKey(id,state){
      if(!products.has(id))return '';
      const route=root.PMSVCatalogueEvidence.products[id].micro[0][1];
      if(!route.options)return route.profile_key;
      if(!String(state.microFormRef||'').trim())return '';
      return route.options.find(o=>o.profile_key&&o.profile_key===state.microForm)?.profile_key||'';
    }
    function criteria(id,state){
      const profile=rules.micro[profileKey(id,state)]?.criteria;
      return profile?Object.entries({...profile.hygiene,...profile.safety}):[];
    }
    function outcome(id,state){
      if(!root.PMSVTestingPlan.metalEdition(state.vetDate))return 'Select a supported assessment date.';
      const selected=criteria(id,state).find(([key])=>key===state[organism]);
      if(!selected)return 'Select an applicable criterion.';
      const [key,row]=selected;
      if(!String(state[lot]||'').trim()||!String(state[report]||'').trim())return 'Enter the lot and laboratory report references.';
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
      const scope=rules.micro[profileKey(id,state)].criteria.hygiene[key]?'Process hygiene at the end of manufacture.':'Food safety criterion for this laboratory set.';
      return grade+' for this set. '+reason+' '+scope;
    }
    function note(id,state){
      if(!state[organism]||!criteria(id,state).some(([k])=>k===state[organism]))return '';
      const values=units.map(k=>String(state[k]||'').trim()||'—');
      return 'Single laboratory set. Lot: '+(state[lot]||'—')+'. Report: '+(state[report]||'—')+'. Units 1–5: '+values.join(', ')+'. '+outcome(id,state);
    }
    return Object.freeze({prefix,products,table,firstPage,organism,lot,report,units,fields,criteria,profileKey,outcome,note,regulatory});
  }
  root.PMSVEggMicrobiology=reportFor('egg',eggProducts,8,53);
  root.PMSVSpiceMicrobiology=reportFor('spice',spiceProducts,3,24);
})(globalThis);
