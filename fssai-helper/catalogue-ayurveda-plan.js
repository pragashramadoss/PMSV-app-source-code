/* Finished-food chemical criteria in the Ayurveda Aahara Regulations, Schedule D Table 2. */
(function(root){
  'use strict';
  const review=root.PMSV_REVIEW_REGISTER?.ayurvedaPlanReview;
  if(!review)return;
  const area='Ayurveda Aahara · Schedule D';
  const article='Ayurveda Aahara Regulations, regulation 5 · Schedule D Table 2';
  const known=id=>Object.hasOwn(review.recipePages,id);
  const held=id=>review.variantHolds.includes(id);
  const present=v=>typeof v==='string'&&!!v.trim();
  const ingredientNote='Confirm an ingredient in the footnote: arecanut/betelnut, cereals or cereal products, dried figs, nuts, oilseeds or oil, pulses, or spices/spice mixes. Retain its identity, use and processing classification.';
  const recipeNote='Record the Category A recipe and the specification for the finished food as sampled.';
  const variantNote='The printed title and preparation require reconciliation. Record the authoritative basis for the exact variant.';
  const fields=['ayRecipe','ayVariant','ayIngredient','ayIngredientRef','ayAnalyte','aySample','ayReport','ayUnit','ayValue','ayBasis'];
  const units=['mg/kg','µg/kg','mg/L','µg/L'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function sources(id,rule){
    return [review.order+'#page='+review.recipePages[id],review.gazette+'#page=16',review.gazette+'#page='+rule.page];
  }
  function scope(id,r,s){
    if(!present(s.ayRecipe))return 'Confirm finished recipe identity';
    if(held(id)&&!present(s.ayVariant))return 'Resolve the documented recipe variant';
    if(r.ingredientCondition){
      if(s.ayIngredient==='absent'&&present(s.ayIngredientRef))return 'Recorded recipe excludes the listed ingredients';
      if(s.ayIngredient!=='present'||!present(s.ayIngredientRef))return 'Confirm a listed ingredient in the finished recipe';
    }
    return 'Documented finished recipe';
  }
  function assessment(id,r,s){
    const status=scope(id,r,s);
    if(status!=='Documented finished recipe')return status+'.';
    if(!present(s.aySample)||!present(s.ayReport)||s.ayBasis!=='yes')
      return 'Confirm finished sample, report, analyte and measurement basis.';
    if(!units.includes(s.ayUnit)||(!r.unit.includes('mg/L')&&s.ayUnit.endsWith('/L')))
      return 'The report and the source must use a compatible mass or volume basis.';
    const parse=root.PMSVMetalPanel.parseReading;
    const reading=parse(s.ayValue,s.ayUnit);
    if(!reading)return 'Enter a measured concentration or a numerical upper bound.';
    const sourceUnit=r.unit.includes('mg/L')?(s.ayUnit.endsWith('/L')?'mg/L':'mg/kg'):r.unit;
    const max=parse(r.max,sourceUnit).amount;
    const within=root.PMSVCatalogueWorksheets.compare({operator:'<=',value:max},reading.amount);
    if(reading.qualifier)return within?'Reported upper bound is within the maximum.':'Inconclusive. The reporting bound exceeds the maximum.';
    return within?'At or below the maximum.':'Above the maximum.';
  }
  function result(id,s){
    const rule=review.rules.find(r=>r.name===s.ayAnalyte);
    return known(id)&&rule?assessment(id,rule,s):'Select an analyte to check a finished-product report.';
  }
  function planRows(id,state={}){
    if(!known(id))return [];
    return review.rules.map(r=>{
      const status=scope(id,r,state),applies=status==='Documented finished recipe';
      const notes=['Published maximum '+r.max+' '+r.unit+'.',recipeNote,state.ayRecipe&&'Recipe: '+state.ayRecipe,
        held(id)&&variantNote,held(id)&&state.ayVariant&&'Variant evidence: '+state.ayVariant,
        r.ingredientCondition&&ingredientNote,r.ingredientCondition&&state.ayIngredientRef&&'Ingredient evidence: '+state.ayIngredientRef];
      if(r.name===state.ayAnalyte&&(present(state.ayReport)||present(state.ayValue))){
        notes.push(state.aySample&&'Finished sample: '+state.aySample,state.ayReport&&'Lab report: '+state.ayReport,
          state.ayValue&&'Reported: '+state.ayValue+' '+(state.ayUnit||'(unit pending)'),assessment(id,r,state));
      }
      return {area,article,form:'Finished Ayurveda Aahara',parameter:r.name,status,limit:applies?r.max:'',unit:applies?r.unit:'',
        notes:notes.filter(Boolean).join(' '),source:sources(id,r).join(' | ')};
    });
  }
  function criteriaRows(id){
    const out=[['Catalogue ID','Product','Analyte','Published maximum','Published unit','Finished product evidence','Ingredient condition','Recipe order','Regulation 5','Schedule D Table 2']];
    for(const key of Object.keys(review.recipePages)){
      if(id&&key!==id)continue;
      for(const r of review.rules)out.push([key,root.PMSVCatalogueRules.products[key].name,r.name,r.max,r.unit,
        recipeNote+(held(key)?' '+variantNote:''),r.ingredientCondition?ingredientNote:'All covered finished foods',...sources(key,r)]);
    }
    return out;
  }
  function markup(id,s){
    if(!known(id))return '';
    const input=(k,label)=>'<label>'+label+'<input data-ws-field="'+k+'" maxlength="240" value="'+esc(s[k])+'"></label>';
    const select=(k,label,pairs)=>'<label>'+label+'<select data-ws-field="'+k+'"><option value="">Select</option>'+pairs.map(([v,t])=>
      '<option value="'+esc(v)+'"'+(v===s[k]?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>';
    return '<section data-ayurveda-controls><p>Schedule D applies to the finished food. Record the recipe and sample before comparing a report.</p>'+
      input('ayRecipe','Category A recipe and finished product specification reference')+(held(id)?input('ayVariant','Authority or documented clarification for the exact recipe variant'):'')+
      select('ayIngredient','Aflatoxin footnote on this recipe',[['present','A listed ingredient is documented'],['absent','Recipe excludes the listed ingredients']])+
      input('ayIngredientRef','Ingredient identity and recipe evidence')+
      '<details class="ws-section"><summary>Check a finished-product report</summary>'+
      select('ayAnalyte','Analyte',review.rules.map(r=>[r.name,r.name]))+input('aySample','Finished sample or lot identifier')+input('ayReport','Laboratory report reference')+
      input('ayValue','Reported concentration or upper bound')+select('ayUnit','Reported unit',units.map(u=>[u,u]))+
      '<label><input type="checkbox" data-ws-field="ayBasis"'+(s.ayBasis==='yes'?' checked':'')+'> I confirmed the finished sample, analyte definition and mass or volume basis on the report.</label>'+
      '<p role="status" data-ayurveda-outcome>'+esc(result(id,s))+'</p></details><button type="button" data-ayurveda-export>Download Schedule D criteria for this recipe</button></section>';
  }
  function update(node,id,k,s){
    const clear=key=>{s[key]='';const el=node.querySelector('[data-ws-field="'+key+'"]');if(el){if(el.type==='checkbox')el.checked=false;else el.value='';}};
    if(k==='ayAnalyte')for(const key of ['ayValue','ayUnit'])clear(key);
    if(k==='ayIngredient')clear('ayIngredientRef');
    if(k!=='ayValue'&&k!=='ayBasis')clear('ayBasis');
    node.querySelector('[data-ayurveda-outcome]').textContent=result(id,s);
  }
  function brief(id,state={}){
    if(!known(id))return '';
    const lines=[area+' · 10 finished-product criteria',review.order+'#page='+review.recipePages[id],review.gazette+'#page=24',review.gazette+'#page=25'];
    if(state.ayRecipe)lines.push('Recipe: '+state.ayRecipe);
    if(held(id))lines.push(state.ayVariant||variantNote);
    if(state.ayIngredientRef)lines.push('Footnote: '+(state.ayIngredient||'pending')+' · '+state.ayIngredientRef);
    if(state.ayAnalyte)lines.push([state.ayAnalyte,state.aySample,state.ayReport,state.ayValue,state.ayUnit,result(id,state)].filter(Boolean).join(' · '));
    return lines.join(' | ');
  }
  root.PMSVAyurvedaPlan=Object.freeze({area,known,fields,planRows,criteriaRows,markup,update,brief,result});
})(globalThis);
