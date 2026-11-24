/* Sample identity and dated CTR criteria for two Ayurveda recipes and two powder ingredients. */
(function(root){
  'use strict';
  const evidence=root.PMSVCatalogueEvidence, data=root.PMSVCropScopeData;
  if(!evidence||!data)return;
  const coconutRecipe='102-102-1-14-3-narikela-ksheerika-milky-coconut-delight';
  const drink='102-102-1-14-7-ksheerapaka-mystic-milk-quartet';
  const coconutPowder='04-04-1-coconut-milk-powder',singhara='06-06-2-water-chestnut-flour-singhare-ka-atta';
  const ids=[coconutRecipe,drink,coconutPowder,singhara];
  const link=(doc,page)=>evidence.documents[doc].url.split('#')[0]+'#page='+page;
  const order='https://www.fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf';
  const coconutIdentity='https://www.fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/63fdb05adf62csample.pdf#page=33';
  const schedule='https://www.fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf#page=25';
  const coconutNote='Recipe 14.3 cooks grated or finely chopped coconut kernel in cow milk. Confirm the finished food retains the kernel and document the nut-containing food classification. The CTR and Schedule D entries both give total aflatoxins 20 µg/kg and B1 10 µg/kg for that finished food.';
  const drinkNote='Recipe 14.7 is a buffalo-milk drink prepared with flower-infused water and sugar. Confirm the actual variant and non-alcoholic marketed beverage. The saffrole maximum is 10 ppm through 30 November 2026. From 1 December the 10 ppm entry requires mace or nutmeg kernel as an ingredient. Neither is listed in the published recipe.';
  const powderNote='FPSFA 2.3.63 defines powder made by drying extracted coconut milk and permits maltodextrin and sodium caseinate. Identify the separately sampled incoming coconut kernel. A kernel result does not establish a finished powder limit.';
  const flourNote='FPSFA 2.3.64 specifies grinding dried nuts of Trapa bispinosa or Trapa quadrispinosa. Identify the species and the incoming nut lot before milling. The finished flour requires its own applicability assessment.';
  const profiles={
    [coconutRecipe]:{text:coconutNote,urls:[order+'#page=93',coconutIdentity,link('ctr-3',29),schedule],finished:true},
    [drink]:{text:drinkNote,urls:[order+'#page=98',link('ctr-16',4),link('ctr-1',5),link('ctr-3',29)],finished:true},
    [coconutPowder]:{text:powderNote,urls:[link('food-20',17),coconutIdentity,link('ctr-3',29)]},
    [singhara]:{text:flourNote,urls:[link('food-14',35),link('ctr-3',29)]}
  };
  const legacyChange='2026-12-01';
  const pick=(value,label,sample,keys)=>({value,label,sample,keys});
  const coconut=pick('kernel','Incoming coconut kernel sampled separately for further processing','ingredient',{total:'C3',b1:'C13'});
  const finished=pick('kernelFood','Finished recipe retaining grated or chopped coconut kernel','finished',{total:'C9',b1:'C19'});
  const milk=species=>pick('liquidMilk','Separately sampled incoming liquid '+species+' milk','ingredient',{m1:'C20'});
  const beverage=pick('recipeDrink','Finished authorised recipe sold as a non-alcoholic drink','finished',{saf:'N11'});
  const samples={
    [coconutRecipe]:[finished,coconut,milk('cow')], [drink]:[beverage,milk('buffalo')],
    [coconutPowder]:[coconut], [singhara]:[pick('trapaNut','Incoming dried Trapa nuts sampled separately before milling','ingredient',{total:'C3',b1:'C13'})]
  };
  const fields={total:'crop_af',b1:'crop_af',m1:'crop_milk',saf:'crop_saff'};
  function covered(id,a){return Object.hasOwn(samples,id)&&samples[id].some(form=>Object.hasOwn(form.keys,a));}
  function firstSource(id){
    const p=profiles[id];
    return p?.finished?{status:'CONDITIONAL_TOXIN_SOURCE_MATCH',text:p.text,urls:p.urls}:null;
  }
  const val=(s,k)=>typeof s[k]==='string'?s[k].trim():'';
  function decision(id,a,s={},date=s.vetDate??'2026-11-24'){
    if(!covered(id,a))return null;
    const p=profiles[id],k=fields[a],forms=samples[id].filter(f=>f.keys[a]);
    const form=forms.find(f=>f.value===s[k]),lot=val(s,k+'Lot'),proof=val(s,k+'Ref');
    const changed=id===drink&&a==='saf'&&date>=legacyChange;
    const choices=forms.concat(pick('other','Other sample, or classification unresolved','unresolved',{}))
      .map(f=>({...f,rows:f.keys[a]&&!changed?[f.keys[a]]:[]}));
    const result={status:'Confirm sampled article, lot and specification',sample:'unresolved',rows:[],sources:changed?[]:forms.map(f=>f.keys[a]),
      links:p.urls,reason:p.text,choices};
    if(root.PMSVTestingPlan&&!root.PMSVTestingPlan.metalEdition(date))return {...result,status:'Select a valid assessment date in a reviewed edition'};
    if(!form||!lot||!proof)return result;
    if(form.sample==='finished'&&(!val(s,'ayRecipe')||(id===drink&&!val(s,'ayVariant'))))
      return {...result,status:'Document the finished recipe and variant in the Schedule D section'};
    if(id===coconutRecipe&&form.sample==='finished'&&(s.ayIngredient!=='present'||!val(s,'ayIngredientRef')))
      return {...result,status:'Document the retained coconut kernel in the Schedule D ingredient check'};
    const reason=[form.label,'Lot '+lot,proof,form.sample==='finished'&&val(s,'ayRecipe'),id===coconutRecipe&&form.sample==='finished'&&val(s,'ayIngredientRef'),id===drink&&form.sample==='finished'&&val(s,'ayVariant')].filter(Boolean).join(' · ');
    if(changed){
      const ref=val(s,'crop_decRef');
      if(!ref||!['absent','contains'].includes(s.crop_dec))return {...result,status:'Document the December ingredient decision',reason:reason+'. '+drinkNote};
      if(s.crop_dec==='absent')return {...result,sample:'outside',status:'Documented recipe outside the December entry',reason:reason+' · Neither mace nor nutmeg kernel in the recipe · '+ref};
      return {...result,status:'Confirm authority for the changed recipe',reason:reason+' · '+ref+'. The published recipe does not list mace or nutmeg kernel. Establish the classification of the changed formulation before applying the December maximum.'};
    }
    return {...result,status:form.sample==='finished'?'Documented finished article':'Documented ingredient sample',sample:form.sample,rows:[form.keys[a]],sources:[form.keys[a]],reason};
  }
  function criteriaRows(id,date='2026-11-24'){
    const out=[['Assessment date','Catalogue ID','Product','Sample','Sample role','Analyte','Maximum','Unit','Evidence and scope','Source pages']];
    if(root.PMSVTestingPlan&&!root.PMSVTestingPlan.metalEdition(date))return out;
    for(const key of ids){
      if(id&&id!==key)continue;
      for(const f of samples[key])for(const [a,sourceKey] of Object.entries(f.keys)){
        const r=data.rows[sourceKey],p=profiles[key],changed=key===drink&&a==='saf'&&date>=legacyChange;
        out.push([date,key,root.PMSVCatalogueRules.products[key].name,f.label,f.sample,data.labels[a],changed?'':String(r.limit),changed?'':r.unit,
          changed?drinkNote:f.sample==='ingredient'?f.label+'. Match the ingredient lot, its specification and the reporting basis before comparison. This limit applies to the sampled ingredient.':p.text+' Match the sampled finished lot and the reporting basis.',
          [...new Set([...(changed?[]:[link(r.doc,r.page)]),...p.urls])].join(' | ')]);
      }
    }
    return out;
  }
  root.PMSVRecipeSamples=Object.freeze({ids,drink,profiles,covered,firstSource,decision,criteriaRows});
})(globalThis);
