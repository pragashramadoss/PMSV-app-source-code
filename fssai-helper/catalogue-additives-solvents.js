/* Formula and process references for individual food articles. */
(function(root){
  'use strict';
  const cocoa='05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake';
  const egg='10-10-2-egg-powder', blend=root.PMSVCoffee.blend;
  const appendixA='https://fssai.gov.in/docs/food-law/regulations/compendium/food-products-standards/Appendix%20A(4).pdf';
  const appendixC='https://fssai.gov.in/docs/food-law/regulations/compendium/food-products-standards/Appendix%20C(2).pdf';
  const citations=(document,pages)=>pages.map(p=>document+'#page='+p).join(' | ');
  const gazette='https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/Gazette_Notification_Additive_Harmonization_16_09_2016.pdf';
  const cocoaForm='Standardized cocoa mass, cocoa liquor or cocoa cake under 2.7.8';
  const eggForm='Dried egg product under food category 10.2.3';
  function additive(form,parameter,limit,basis,article,pages){
    return {form,parameter,limit,unit:limit?'mg/kg':'',notes:basis,article:'Appendix A, '+article,source:citations(appendixA,pages),
      role:'Finished product',status:limit?'Check the documented additive and basis':'Excluded by note XS141'};
  }
  const profiles=new Map([
    [cocoa,[
      ...[
        ['Acesulfame potassium (INS 950)','350','mg/kg','If used with INS 962, assess the combined use as acesulfame potassium equivalents.','188',[167,340]],
        ['Ammonium salts of phosphatidic acid (INS 442)','GMP','','Use good manufacturing practice on the final cocoa or chocolate product basis.','97',[167,336]],
        ['Aspartame (INS 951)','3000','mg/kg','If used with INS 962, assess the combined use as aspartame equivalents.','191',[167,340]],
        ['Benzoates','1500','mg/kg','The Hindi Gazette gives 1500 mg/kg. The English Gazette and compendium use the comma grouping “15,00 mg/kg”.','',[167],265],
        ['Sorbates','1500','mg/kg','Use the permitted sorbate group and confirm the formula and analytical basis.','',[167]],
        ['Phosphates','1100','mg/kg','Express the added phosphate group as phosphorus. Total phosphorus includes the phosphorus naturally present in cocoa.','33',[167,334]],
        ['Propylene glycol esters of fatty acids (INS 477)','5000','mg/kg','Use the final cocoa or chocolate product as the reporting basis.','97',[167,336]],
        ['Saccharins','100','mg/kg','Use the final cocoa or chocolate product as the reporting basis.','97',[168,336]],
        ['Sucrose esters of fatty acids (INS 473)','','','The English Gazette and compendium give 10 g/kg. The Hindi Gazette gives 10 mg/kg. Confirm the applicable unit before comparing a result.','',[168],266],
        ['Sucralose (INS 955)','580','mg/kg','Use the final cocoa or chocolate product as the reporting basis.','97',[168,336]],
        ['L-tartaric acid (INS 334)','5','g/kg','Match the named substance and retain the printed g/kg unit.','',[168]]
      ].map(([name,limit,unit,basis,note,pages,gazettePage])=>({
        ...additive(cocoaForm,name,limit,basis,'Table 5, category 5.1.1'+(note?', note '+note:''),pages),
        unit,status:limit?'Confirm identity, use and reporting basis':'Resolve Gazette unit discrepancy',
        source:[citations(appendixA,pages),gazettePage&&citations(gazette,[92,gazettePage])].filter(Boolean).join(' | '),
        notes:'Confirm the formulated product still meets the named standard. '+basis
      })),
      ...[
        ['Polyglycerol esters of fatty acids (INS 475)','5,000','XS141 and 97'],
        ['Polyglycerol polyricinoleate (PGPR, INS 476)','5,000','XS141 and 97'],
        ['Sorbitan esters','2,000','XS141, 97 and 123']
      ].map(([name,listed,notes])=>
        additive(cocoaForm,name,'','Note XS141 excludes products conforming to the cocoa mass, liquor and cake standard. The '+listed+' mg/kg entry in the wider category does not authorize this use in that standardized product.','Table 5, category 5.1.1, notes '+notes,[168,348]))
    ]],
    [egg,[
      additive(eggForm,'Diacetyltartaric and fatty acid esters of glycerol (INS 472e)','5000','Check the declared identity and use in the dried egg product.','Table 10, category 10.2.3',[260,261]),
      additive(eggForm,'EDTA group','200','Express EDTA as anhydrous calcium disodium EDTA per kg of dry egg yolk. A whole-powder result needs the dry yolk basis. Egg white alone has no yolk basis.','Table 10, category 10.2.3, notes 21 and 47',[261,334,335]),
      additive(eggForm,'Sorbates','1000','Express the permitted sorbates as sorbic acid in the dried egg product.','Table 10, category 10.2.3, note 42',[261,335]),
      additive(eggForm,'Triethyl citrate (INS 1505)','2500','Express per kg of dry egg yolk. Document that basis for a whole-egg preparation. Egg white alone has no yolk basis.','Table 10, category 10.2.3, note 47',[261,335])
    ]]
  ]);
  const coffeeRows=[
    ['20','Dichloromethane (methylene chloride)','10'],
    ['21','Butanone (methyl ethyl ketone)','2']
  ];
  for(const id of ['coffee',blend]){
    const input=id===blend;
    profiles.set(id,coffeeRows.map(([serial,parameter,limit])=>({
      article:'Appendix C, Table 6, row '+serial, parameter, limit, unit:'mg/kg',
      form:input?'Separately sampled decaffeinated coffee before blending with chicory':'Decaffeinated coffee as sold',
      role:input?'Incoming ingredient':'Finished product',status:input?'Check the separately sampled coffee lot':'Confirm decaffeination and the solvent used',
      notes:'Match the solvent and decaffeination process to the manufacturing record. '+(input?'Apply to the decaffeinated coffee input. The table gives no finished coffee–chicory blend maximum here.':'Use the named coffee sample and its laboratory report.'),
      source:citations(appendixC,[9,10])+' | '+root.PMSVCoffee.chapter+'#page='+(input?9:6)
    })));
  }
  function rows(id,state={}){
    if((id==='coffee'||id===blend)&&state?.coffeeForm&&!state.coffeeForm.startsWith('decaffeinated_'))return [];
    return profiles.get(id)||[];
  }
  function exportRows(id){
    const result=[['Catalogue ID','Product','Sample role','Food or sample','Substance','Reference','Unit','Conditions','Basis and evidence','Source provision','Official pages']];
    for(const [key,items] of profiles){
      if(id&&id!==key)continue;
      for(const item of items){
        result.push([key,root.PMSVCatalogueRules.products[key].name,item.role,item.form,item.parameter,item.limit,item.unit,item.status,item.notes,item.article,item.source]);
      }
    }
    return result;
  }
  root.PMSVAdditivesSolvents=Object.freeze({profiles,rows,exportRows});
})(globalThis);
