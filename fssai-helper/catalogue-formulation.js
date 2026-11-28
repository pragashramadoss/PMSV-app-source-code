/* Product-specific formulation provisions and their Appendix A cross-references. */
(function(root){
  'use strict';
  const rules=root.PMSVCatalogueRules;
  const area='Product-specific formulation rules';
  const amendments='https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/';
  const dairy=amendments+'5bfd095d0ad63Gazette_Notification_DairyProducts_27_11_2018.pdf';
  const appendix='https://fssai.gov.in/docs/food-law/regulations/compendium/food-products-standards/Appendix%20A(4).pdf';
  const colostrum='100-100-cow-or-buffalo-colostrum-and-colostrum-products';
  const mpc='01-01-3-milk-protein-concentrate',wpc='01-01-8-whey-protein-concentrate';
  const chocolate='05-05-1-chocolate';
  const chocolateChapter='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf';
  const chocolateAmendment='https://fssai.gov.in/upload/uploadfiles/files/Gazette_12_01_2023.pdf#page=18';
  const fatDeclaration='CONTAINS COCOA BUTTER EQUIVALENT/VEGETABLE FAT IN ADDITION TO COCOA BUTTER';
  const chocolateFields=['chocRecipe','chocFinished','chocDeduct','chocFat','chocSpec','chocEligibility'];
  const productRules=new Map([
    [chocolate,['2.7.4','Chocolate under 2.7.4','Vegetable fat other than cocoa butter',chocolateChapter+'#page=6']],
    [mpc,['2.1.21(3)','Milk protein concentrate','Use the Appendix A provisions specified for milk powder. Check the named substance, conditions, group limits and reporting basis.',dairy+'#page=7']],
    [wpc,['2.1.22(3)','Whey protein concentrate','Use the dried whey table. Retain its exclusions and notes, including the infant-food exclusion for benzoyl peroxide.',dairy+'#page=8']],
    [colostrum,['2.1.23(3)','Cow or buffalo colostrum','Liquid colostrum prohibits food additives. In powder, only stabilizers, emulsifiers and antioxidants specified for milk powder may be used within the conditions and limits stated.',dairy+'#page=9']],
    ['01-01-5-dairy-permeate-powders',['2.1.24(3)','Dairy permeate powders','Establish the specific Appendix A permission for any added substance. The standard separately allows suitable processing aids under GMP, including hydrochloric acid and calcium, potassium or sodium hydroxide to adjust pH for process efficiency.',amendments+'5f50bca66e5bdGazette_Notification_Standards_Milk_Cheese_03_09_2020.pdf#page=9']],
    ['100-100-royal-jelly',['2.8.3(3)(a)','Royal jelly, Type 1 or Type 2','The finished royal jelly must be free of additives. Filtration is allowed. The Type 1 and Type 2 distinction concerns what the bees were fed.',amendments+'Gazette_Notification_Pulses_Grains_Maize_14_08_2018.pdf#page=24']],
    ['04-04-1-coconut-milk-powder',['2.3.63(1), (3)','Coconut milk powder','Added colouring and flavouring matter are prohibited. Maltodextrin and sodium caseinate are specifically named optional ingredients.',amendments+'5f362b888233bGazette_Notification_FSS_Additives_Third_Amendment_14_08_2020.pdf#page=17']],
    ['05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake',['2.7.8(c)','Cocoa mass, cocoa liquor or cocoa cake','Added colouring and flavour are prohibited. Cocoa butter is the only added fat covered by this provision. Check separate additive conditions, including exclusions for the standardized product.','https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf#page=13']],
    ['coffee-chicory-mixture',['2.10.4','Dry coffee–chicory mixture','Use the coffee and chicory ingredients specified for the ground or instant blend. The standard excludes other added substances. Review decaffeination processing aids separately for the coffee input.','https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf#page=7']]
  ]);
  const powderFunctions=new Map([
    ['ASCORBYL ESTERS','Antioxidant'],['320','Antioxidant'],['321','Antioxidant'],['310','Antioxidant'],
    ['472e','Emulsifier'],['474','Emulsifier'],['PHOSPHATES','Confirm permitted stabilizing or emulsifying function for the actual phosphate']
  ]);
  function entries(id,state={}){
    if(id===chocolate)return chocolateRows();
    const rule=productRules.get(id);
    if(!rule)return [];
    const [clause,form,description,source]=rule;
    const selected=state.compVariant;
    let notes=description;
    if(id===colostrum){
      if(selected==='Colostrum')notes='Food additives are prohibited in liquid colostrum.';
      if(selected==='Colostrum Powder')notes='The entries below cover reviewed milk powder provisions. Confirm the actual stabilizing, emulsifying or antioxidant function and the conditions for the substance used.';
    }
    const row={area,article:'FPSFA '+clause,form:id===colostrum&&['Colostrum','Colostrum Powder'].includes(selected)?selected:form,parameter:'Finished-product formulation',status:'Product standard',notes,source,limit:'',unit:'',published:'',ins:''};
    const out=[row];
    const powder=id===colostrum&&selected==='Colostrum Powder';
    if(!powder&&id!==mpc&&id!==wpc)return out;
    const category=id===wpc?'1.8.2':'1.5.1';
    const pages=id===wpc?[107,108,109]:[90,91];
    for(const [name,ins,published,condition,noteNumbers,variant,specific] of rules.categories[category].rows){
      const functionName=powderFunctions.get(ins||name);
      if(powder&&!functionName)continue;
      const group=(rules.groups[name.toUpperCase()]||[]).map(m=>m.name+' (INS '+m.ins+')').join(', ');
      const noteIds=String(noteNumbers||'').match(/\d+/g)||[];
      const detail=noteIds.map(n=>'Note '+n+' — '+(n==='196'?'BHA, BHT and propyl gallate are subject to the single-or-combined use condition.':rules.notes[n])).join(' ');
      const notes=[powder?'Function: '+functionName+'.':'',condition,variant,specific,detail,group?'Group: '+group+'.':'','Check the formula and the basis stated in the table before comparing amounts.'].filter(Boolean).join(' ');
      out.push({...row,article:'FPSFA '+clause+' / Appendix A, Table 1, '+category,
        form:powder?'Colostrum Powder':form,parameter:name,ins:ins||'',published,status:'Published additive table entry',notes,
        source:[source,...pages.map(n=>appendix+'#page='+n),...(noteIds.length?[appendix]:[])].join(' | ')});
    }
    return out;
  }
  function chocolateRows(){
    const provisions=[
      ['(1)','Vegetable fat other than cocoa butter','5% maximum','Sum all such added fat in the recipe. Divide by finished product mass after subtracting other added edible foodstuffs under the clause. Record the basis for every deduction and use masses from the same recipe.',6],
      ['(5)(b)','Cocoa butter equivalent eligibility','','Use a standardized vegetable fat or blend. Verify non-lauric fat rich in symmetrical POP, POSt and StOSt triglycerides, miscibility with cocoa butter in all proportions, compatible melting and crystallisation properties, melting rate and tempering. Verify refining or fractionation without enzymatic modification of triglycerides.',8],
      ['(1), (4) and (6)','Minimum cocoa materials','','Maintain the cocoa-material minima for the declared chocolate type. Check the applicable composition requirements independently of the vegetable-fat calculation.',6],
      ['(6)','Label declaration when vegetable fat is present','','For chocolate containing vegetable fat other than cocoa butter, declare in bold: '+fatDeclaration+'.',10]
    ];
    return provisions.map(([clause,parameter,published,notes,page],i)=>({
      area,form:'Chocolate under 2.7.4',article:'FPSFA 2.7.4'+clause,parameter,published,notes,
      source:chocolateChapter+'#page='+page+([1,3].includes(i)?' | '+chocolateAmendment:''),
      status:'Product standard',ins:'',limit:i===0?'5':'',unit:i===0?'% of adjusted finished mass':''
    }));
  }
  function chocolateReview(state={}){
    const recipe=state.chocRecipe?.trim();
    if(!recipe)return 'Enter the recipe or batch reference for the masses and deductions.';
    const values=['chocFinished','chocDeduct','chocFat'].map(k=>root.PMSVCulinarySauces.decimal(String(state[k]??'').trim()));
    if(values.some(v=>!v))return 'Enter all three masses in kg, including zero where applicable.';
    const scale=values.reduce((a,v)=>a>v.scale?a:v.scale,1n);
    const [finished,deduct,fat]=values.map(v=>v.n*(scale/v.scale));
    const adjusted=finished-deduct;
    if(adjusted<=0n)return 'Finished mass must be positive and greater than the deductions.';
    if(fat>adjusted)return 'Check the mass balance. Added fat exceeds the adjusted finished mass.';
    const formatMass=n=>root.PMSVCulinarySauces.decimalText(n,scale);
    const value=100n*fat, maximum=5n*adjusted;
    const above=value>maximum,equal=value===maximum;
    const approx=(Number(value)/Number(adjusted)).toLocaleString('en-US',{maximumFractionDigits:6,useGrouping:false});
    const pct=approx==='5'&&!equal?(above?'>5':'<5'):approx;
    const result='Recipe '+recipe+' · '+formatMass(fat)+' kg / '+formatMass(adjusted)+' kg = '+pct+'%. '+(equal?'At':above?'Above':'Below')+' the 5% maximum.';
    if(fat===0n)return result+' No added vegetable fat recorded.';
    const spec=state.chocSpec?.trim();
    const identity=state.chocEligibility==='fails'?'Material fails the cocoa butter equivalent criteria.':
      state.chocEligibility==='meets'&&spec?'Reviewer confirmed all material criteria.':'Material eligibility requires evidence.';
    return result+' '+identity+(spec?' Specification: '+spec+'.':'')+' Check the cocoa minima and bold label declaration.';
  }
  function individualResult(id,r,state){
    if(id===chocolate&&r.published&&state?.chocRecipe?.trim())return chocolateReview(state);
    return id&&state?.formLot&&r.ins&&r.ins===state.formIns?assay(id,state):'';
  }
  function exportRows(id,state){
    const out=[['Catalogue ID','Product','Sample form','Provision','Substance or rule','INS','Published maximum or GMP','Status','Conditions and reporting basis','Sources','Individual lot comparison']];
    for(const key of id?[id]:productRules.keys()){
      const states=key===colostrum&&!id?[{compVariant:'Colostrum'},{compVariant:'Colostrum Powder'}]:[state];
      for(const form of states)for(const r of entries(key,form))out.push([key,rules.products[key].name,r.form,r.article,r.parameter,r.ins,r.published,r.status,r.notes,r.source,individualResult(id,r,state)]);
    }
    return out;
  }
  const assayFields=['formLot','formReport','formIns','formBasis','formValue','formFat','formSingle'];
  const substance={'320':['BHA',100],'321':['BHT',200]};
  function assayApplies(id,state){
    return id===mpc||id===colostrum&&state.compVariant==='Colostrum Powder';
  }
  function assay(id,state={}){
    if(!assayApplies(id,state))return '';
    const antioxidant=substance[state.formIns];
    if(!Object.hasOwn(substance,state.formIns)||!state.formLot?.trim()||!state.formReport?.trim())return 'Select BHA or BHT and enter the lot and laboratory report reference.';
    if(state.formSingle!=='yes')return 'Confirm from the formula that this is the only BHA, BHT or propyl gallate used. Combined use requires a separate assessment under note 196.';
    if(!['fat','powder'].includes(state.formBasis))return 'Choose whether the report uses fat mass or whole-powder mass.';
    const parse=root.PMSVCulinarySauces.decimal;
    const value=parse(String(state.formValue||'').trim());
    if(!value)return 'Enter a measured non-negative result in mg/kg. A qualified result needs separate interpretation.';
    let n=value.n,d=value.scale;
    if(state.formBasis==='powder'){
      const fat=parse(String(state.formFat||'').trim());
      if(!fat||fat.n===0n||fat.n>100n*fat.scale)return 'Enter the fat percentage of the same powder sample, above zero and up to 100%.';
      n*=100n*fat.scale;d*=fat.n;
    }
    const shown=(Number(n)/Number(d)).toLocaleString('en-US',{maximumFractionDigits:6,useGrouping:false});
    const threshold=BigInt(antioxidant[1])*d;
    const display=shown===String(antioxidant[1])&&n!==threshold?(n>threshold?'>':'<')+shown:shown;
    return antioxidant[0]+' · '+display+' mg/kg fat · '+(n<=threshold?'at or below':'above')+' the '+antioxidant[1]+' mg/kg fat table maximum. Lot '+state.formLot+' · report '+state.formReport+'.';
  }
  function planRows(id,state){
    return entries(id,state).map(r=>{
      const recorded=individualResult(id,r,state);
      return {...r,notes:[r.published?'Published entry: '+r.published+'.':'',r.notes,recorded].filter(Boolean).join(' ')};
    });
  }
  root.PMSVFormulation=Object.freeze({area,productRules,colostrum,mpc,chocolate,chocolateFields,chocolateReview,assayFields,assayApplies,assay,entries,exportRows,planRows});
})(globalThis);
