/* Indian starch specifications and named enzyme uses, reviewed 26 November 2026. */
(function(root){
  'use strict';
  const plan=root.PMSVTestingPlan;
  const area='Starch specifications and enzyme uses';
  const arrow='06-06-2-arrowroot',maize='06-06-2-maize-starch';
  const enzyme=plan.routeIds.enzyme;
  const stricter=[maize,'06-06-2-tapioca-sago','06-06-2-palm-sago-starch'];
  const ids=[arrow,...stricter,enzyme];
  const appendix='https://fssai.gov.in/docs/food-law/regulations/compendium/food-products-standards/Appendix%20A(4).pdf';
  const bis='https://law.resource.org/pub/in/bis/S06/is.1006.1984.pdf';
  const bisPreview='https://www.services.bis.gov.in/tmp/SR1006.pdf';
  const gazette='https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Additive_Harmonization_16_09_2016.pdf';
  const bisSource=bis+' | '+bisPreview;
  const additiveSources=page=>[...new Set([appendix+'#page='+page,appendix+'#page=190',gazette])].join(' | ');
  const note44=' | '+appendix+'#page=335';
  const bisStatus='BIS specification, when specified';
  const enzymeStatus='Use in the receiving food';
  const rowsById=new Map(ids.map(id=>[id,[]]));
  function add(id,form,parameter,article,status,published,unit,notes,source,applied=false){
    rowsById.get(id).push({area,form,parameter,article,status,published,publishedUnit:unit,
      limit:applied?published:'',unit:applied?unit:'',notes,source});
  }
  add(arrow,'Finished arrowroot starch','Sulphites as residual SO₂','Appendix A, Table 6, 6.2.2, note 44',
    'FSSAI additive maximum','≤ 200','mg/kg','Confirm purified arrowroot and request residual SO₂ in the finished starch. Report on the sampled food. The mass of sulphite salt added is a different measurement.',additiveSources(188)+note44,true);
  const useBis='Use when IS 1006:1984 is specified for the lot. ';
  for(const [species,figure,morphology] of [
    ['Maranta arundinacea','1','Simple granules, often with an off-centre hilum and fissures.'],
    ['Curcuma (East Indian arrowroot)','2','Thin granules with prominent striations and a dot-like hilum near one end.']
  ])add(arrow,species,'Granule identity','IS 1006:1984 §3.2, Fig. '+figure,bisStatus,'Figure '+figure,'',
    useBis+'Examine the composite sample against the figure for the declared species. '+morphology,bisSource);
  for(const [name,value,unit,sample,basis,clause] of [
    ['Retained on 75 µm sieve','≤ 2','% by mass','Composite','Measure the mass fraction retained on this sieve.','§3.3'],
    ['Retained on 150 µm sieve','≤ 0.5','% by mass','Composite','Measure the mass fraction retained on this sieve.','§3.3'],
    ['Moisture','≤ 14','% by mass','Individual','Test each individual sample as supplied.','Table 1(i)'],
    ['Total ash','≤ 0.6','% dry basis','Composite','Report ash relative to dry matter.','Table 1(ii)'],
    ['Acid-insoluble ash','≤ 0.3','% dry basis','Composite','Report acid-insoluble ash relative to dry matter.','Table 1(iii)'],
    ['Starch','≥ 98','% dry basis','Individual','Calculate by difference for each individual sample.','Table 1(iv)'],
    ['pH of aqueous extract','4.5–7.0','pH','Composite','Measure the aqueous extract.','Table 1(v)']
  ])add(arrow,sample+' arrowroot sample',name,'IS 1006:1984 '+clause+' and §6.2.1',bisStatus,value,unit,useBis+basis,bisSource);
  add(maize,'Corn flour (maize starch)','Sulphites as residual SO₂','Appendix A, Table 6, corn flour, note 44',
    'Additive table cross-reference','≤ 100','mg/kg','The finished maize starch must also meet clause 2.4.7, which sets a lower sulphur dioxide maximum of 70 ppm. Use 70 ppm to assess the finished product.',additiveSources(190)+note44);
  const receivingFood='Confirm the actual food, its specific standard and any Table 6 exceptions, including atta, maida and maize starch. Assess the use in the receiving food. The supplied enzyme needs its own identity, activity and purity evidence.';
  for(const [name,ins,page,value,unit,form] of [
    ['Protease','1101(i)',188,'GMP','','Eligible flour or starch'],
    ['Alpha-amylase from Aspergillus oryzae var.','1100(i)',189,'≤ 100','mg/kg of flour','Eligible flour, on flour mass'],
    ['Carbohydrase from malted barley','1100(ii)',189,'GMP','','Eligible flour or starch'],
    ['Alpha-amylase from B. subtilis','1100(iii)',189,'GMP','','Eligible flour or starch'],
    ['Carbohydrase from B. licheniformis','1100(vi)',189,'GMP','','Eligible flour or starch'],
    ['Carbohydrase from A. niger','1100(v)',189,'GMP','','Eligible flour or starch']
  ])add(enzyme,form,name,'Appendix A, Table 6, INS '+ins,enzymeStatus,value,unit,receivingFood,additiveSources(page));
  function entries(id){
    return (rowsById.get(id)||[]).map(r=>({...r,notes:r.limit?r.notes:r.notes+' Published reference: '+[r.published,r.publishedUnit].filter(Boolean).join(' ')+'.'}));
  }
  const activeSource=url=>url===bis||url===bisPreview;
  function references(id,date){
    if(!ids.includes(id)||!plan.metalEdition(date))return [];
    const list=[...rowsById.get(id)];
    if(stricter.includes(id)){
      const product=plan.entries(id,date).find(r=>r.area===plan.areas[0]&&r.parameter.toLowerCase()==='sulphur dioxide');
      if(product)list.unshift({...product,status:'FSSAI finished-product maximum',published:product.limit,publishedUnit:product.unit});
    }
    return list;
  }
  function exportRows(id,date=root.PMSVVeterinary.reviewDate){
    const out=[['Catalogue ID','Product','Assessment date','Sample or receiving food','Reference type','Parameter','Clause or figure','Published reference','Reference unit','Applied finished-product limit','Applied unit','Scope and reporting basis','Sources']];
    for(const key of id?[id]:ids){
      for(const r of references(key,date))out.push([key,root.PMSVCatalogueRules.products[key].name,date,r.form,r.status,r.parameter,r.article,r.published,r.publishedUnit,r.limit,r.unit,r.notes,r.source]);
    }
    return out;
  }
  root.PMSVStarchSpecifications=Object.freeze({area,ids,entries,references,exportRows,activeSource});
})(globalThis);
