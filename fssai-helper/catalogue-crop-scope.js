/* Product-by-product scope of the three tables in FSSAI CTR 2.2.1. */
(function (root) {
  'use strict';
  const data=root.PMSVCropScopeData, docs=root.PMSVCatalogueEvidence?.documents;
  const catalogue=new Set(root.PMSVMetalScopeData?.catalogue);
  if(!data || !docs || catalogue.size!==533) return;
  const recipe=root.PMSVRecipeSamples;
  const analytes=Object.keys(data.labels);
  const groups=Object.fromEntries(Object.entries(data.groups).map(([k,ids])=>[k,new Set(ids)]));
  const allRows={
    total:Array.from({length:10},(_,i)=>'C'+i),b1:Array.from({length:10},(_,i)=>'C'+(i+10)),
    m1:['C20','C21','C22'],ota:['C23'],pat:['C24','C25'],don:['C26'],
    agar:['N0','N1'],hcn:['N2','N3','N4','N5','N6','N14'],hyp:['N7'],saf:['N8','N9','N10','N11','N12','N13'],
    pcb:['F0','F1'],pah:['F2']
  };
  const selections={total:'af',b1:'af',m1:'milk',ota:'ochra',pat:'apple',don:'don',agar:'mushroom',hcn:'cyan',hyp:'hyper',saf:'saff',pcb:'fish',pah:'smoke'};
  const field=a=>'crop_'+selections[a];
  const fieldKeys=[...new Set(analytes.map(field).concat('crop_dec','crop_childAge','crop_botanical'))];

  const maps={
    m1:[['milk','milk'],['milkgrade','powder'],['milkflav','flavmilk'],['milksource','milkin']],
    ota:[['otadirect','och'],['graincheck','ochcheck'],['graininputs','ochinput'],['coffeeinputs','ochinput']],
    don:[['dondirect','deox'],['graincheck','doncheck'],['graininputs','doninput']],
    pat:[['fruitjuice','juice'],['appleinput','applein']],
    agar:[['alcohol','alagar'],['mushCheck','mush']],
    hcn:[['alcohol','alhcn'],['candy','candy'],['sago','sago'],['cannedstone','stonecan'],['fruitjuice','stonejuice'],['conf','conf'],['starch','starch']],
    hyp:[['alcohol','alhyp']],
    saf:[['alcohol','alsaf'],['meat','smeat'],['fish','sfish'],['soup','ssoup'],['sdrink','sdrink'],['sbevcheck','bevcheck'],['meatraw','meatcheck'],['fishother','fishcheck'],['soupother','soupcheck']],
    pcb:[['pcbshell','shell'],['pcb','habitat']],pah:[['smoketest','smokecheck']]
  };
  const afGroups=[['afcereal','cereal'],['afnut','nut'],['afareca','areca'],['afpulse','pulse'],['afspice','spice'],['afcomp','composite'],
    ['afgrains','grain'],['afoils','oilcheck'],['afnuts','nuts'],['afground','ground'],['afspices','spicecheck'],['afmouth','mouth'],['afplants','plant']];
  function routeFor(id,a){
    if(a==='total'||a==='b1'){
      const hit=afGroups.find(([g])=>groups[g].has(id));
      return hit?a+hit[1]:groups.afpure.has(id)?'':a+'recipe';
    }
    if(a==='pah'&&groups.smoked.has(id))return 'smoke';
    const hit=maps[a].find(([g])=>groups[g].has(id));
    if(hit)return hit[1];
    if(a==='saf'&&!groups.saffpure.has(id))return 'spair';
    if(a==='agar'&&!groups.afpure.has(id) && !afGroups.slice(0,5).some(([g])=>groups[g].has(id)) && !groups.saffpure.has(id))return 'mush';
    return '';
  }
  const note={
    total:'Compare the listed crop commodities and the ingredient-containing food entry.',b1:'Compare the listed crop commodities and the ingredient-containing food entry.',
    m1:'The three entries cover liquid milk, skimmed milk powder and whole milk powder.',ota:'Only wheat, wheat bran, rye, barley and coffee are named.',
    pat:'The entries name apple juice, including apple juice sampled as an ingredient of another beverage.',
    don:'Only wheat, wheat bran and barley are named.',agar:'The entries name foods containing mushrooms and alcoholic beverages.',
    hcn:'Check the specified confectionery, stone fruit, alcoholic beverage and sago/cassava articles.',hyp:'This table names alcoholic beverages.',
    saf:'Match the six food entries in force on 20 November 2026.',pcb:'The two entries name fish, crustaceans and molluscs. The sum covers PCB28, 52, 101, 138, 153 and 180.',
    pah:'This table names smoked fishery products.'
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function url(doc,page){return docs[doc].url.split('#')[0]+'#page='+page;}
  function refs(keys){
    const paths=new Map();
    for(const k of keys){
      const r=data.rows[k];
      paths.set(url(r.doc,r.page),docs[r.doc].date+' · PDF p. '+r.page);
    }
    return [...paths];
  }
  function rowText(k){
    const r=data.rows[k];
    return r.article+' · '+r.limit+' '+r.unit+(r.heading?' (group heading: Oilseeds or oil)':'');
  }
  function evidence(s,k){return typeof s[k+'Ref']==='string'?s[k+'Ref'].trim():'';}
  const spiceFoods={
    '05-05-1-dry-mixtures-of-cocoa-and-sugars':{
      form:'Finished dry cocoa mix containing an identified spice or spice mix',
      note:'FPSFA 2.7.6(3) permits spices in the dry mixture. Check that the approved formula contains an identified spice and the sample is the dry mix as sold. A plain cocoa and sugar recipe has no basis for this spice entry.',
      identity:'https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification/Gazette_Notification_Pulses_Grains_Maize_14_08_2018.pdf#page=22'
    },
    '10-10-3-pickled-eggs':{
      form:'Finished egg pickle including its documented spiced gravy or medium',
      note:'FPSFA 2.5.3(5) describes spices in the oil-based gravy and filtration of the vinegar pickling solution. Confirm the qualifying ingredient in the finished product and the sampled portion. A drained egg, filtered liquor alone or incoming whole egg needs a separate assessment.',
      identity:'https://www.fssai.gov.in/upload/uploadfiles/files/GAZETTE%20NOTIFICATION%20DATED%2021_10_2024_ammendments.pdf#page=30'
    }
  };
  const afKeys={total:{finished:'C9',ingredient:'C8'},b1:{finished:'C19',ingredient:'C18'}};
  const botanicalIds=[
    '99-99-7-ingredients-listed-under-schedule-iv-schedule-vi-and-schedule-viii-of-nutraceutica',
    '99-99-7-mixtures-preparations-premix-of-functional-ingredients'
  ];
  const botanicalGazette='https://fssai.gov.in/docs/food-law/regulations/amendments/nutraceuticals/6138887092069Gazette_Notification_Nutra_08_09_2021.pdf';
  const spiceStandard='https://fssai.gov.in/upload/uploadfiles/files/10_%20Chapter%202_9%20%28Salt%2C%20Spices%2C%20Condiments%20and%20related%20products%29.pdf';
  const botanicalForms=[
    {value:'turmeric',label:'Turmeric · ground dried Curcuma longa rhizome',page:114,spicePage:27},
    {value:'cinnamon',label:'Cinnamon · ground dried inner bark of Cinnamomum verum',page:113,spicePage:8},
    {value:'clove',label:'Clove · ground dried unopened flower buds of Syzygium aromaticum',page:113,spicePage:10}
  ];
  const botanicalEvidence='Record the applicable FoSCoS 99.7 classification, the listed species, plant part and grinding process in the approved specification. Extracts, oils and isolated constituents require their own assessment.';
  const botanicalSamples={
    single:{value:'suppliedPowder',label:'Finished lot sold as the identified single ground spice ingredient',sample:'finished',keys:{total:'C8',b1:'C18'}},
    mix:{value:'compoundPremix',label:'Finished compound food premix containing the ground spice, classified under the food-containing entry',sample:'finished',keys:{total:'C9',b1:'C19'}},
    incoming:{value:'incomingPowder',label:'Separately sampled incoming ground spice for the premix',sample:'ingredient',keys:{total:'C8',b1:'C18'}}
  };
  function botanicalSamplesFor(id){
    if(id===botanicalIds[0])return [botanicalSamples.single];
    if(id===botanicalIds[1])return [botanicalSamples.mix,botanicalSamples.incoming];
    return [];
  }
  function botanicalRoute(id,a){
    if(!botanicalIds.includes(id)||!Object.hasOwn(afKeys,a))return null;
    const options=botanicalSamplesFor(id).map(f=>({...f,rows:[f.keys[a]]}));
    options.push({value:'unverified',label:'Extract, oil, isolate, other product or unresolved classification',sample:'unresolved',rows:[]});
    return {mode:'check',reason:botanicalEvidence+' Identify the sampled article and lot. For a compound premix, document the full formulation and its classification. A spice mix alone has a separate entry.',options};
  }
  function botanicalCriteriaRows(id){
    const rows=[['Catalogue ID','Product','Specified ground spice','Sampled article','Sample role','Analyte','Maximum','Unit','Required evidence','Ingredient list','Spice identity','Contaminant Gazette']];
    for(const key of botanicalIds){
      if(id&&id!==key)continue;
      for(const f of botanicalForms)for(const sample of botanicalSamplesFor(key))for(const [a,k] of Object.entries(sample.keys)){
        const r=data.rows[k];
        rows.push([key,root.PMSVCatalogueRules.products[key].name,f.label,sample.label,sample.sample,data.labels[a],String(r.limit),r.unit,
          botanicalEvidence+' Identify the sampled lot. '+(sample===botanicalSamples.mix?'Document the finished formulation and food-containing classification.':'Match the report to the single spice powder.'),
          botanicalGazette+'#page='+f.page,spiceStandard+'#page='+f.spicePage,url(r.doc,r.page)]);
      }
    }
    return rows;
  }
  const childId='formulated-supplements-children';
  const childGazette='https://www.fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/5bfd0a04c4d4bGazette_Notification_Children_Supplement_26_11_2018.pdf';
  const childAgeChoices=[
    {value:'covered',label:'Label and specification identify a formulated supplement for children over 24 and up to 36 months'},
    {value:'other',label:'Another age range, another product standard, or identity uncertain'}
  ];
  const childForms=[
    {value:'finishedBlend',label:'Finished compound food containing a listed cereal or pulse; classification documented',sample:'finished',keys:{total:'C9',b1:'C19'}},
    {value:'finishedCereal',label:'Finished food classified under the cereal and cereal products entry',sample:'finished',keys:{total:'C0',b1:'C11'}},
    {value:'inputCereal',label:'Incoming cereal or cereal product sampled separately',sample:'ingredient',keys:{total:'C0',b1:'C11'}},
    {value:'inputPulse',label:'Incoming pulse sampled separately',sample:'ingredient',keys:{total:'C7',b1:'C17'}},
    ...['wheat','wheat bran','rye','barley'].map(grain=>({
      value:grain,label:'Separately sampled '+grain,sample:'ingredient',keys:grain==='rye'?{ota:'C23'}:{ota:'C23',don:'C26'}
    }))
  ];
  const childAnalytes=['total','b1','ota','don'];
  const childIdentityNote='Confirm FPSFA 2.4.11(4) on the marketed label and specification for children over 24 months through 36 months.';
  const childSampleNote='Document the recipe, applicable commodity entry and sampled lot. If the finished food could fall under either aflatoxin entry, resolve its classification before comparison.';
  const childSourceText=childIdentityNote+' '+childSampleNote+' The total aflatoxins maximum is 20 µg/kg for a qualifying compound food and 15 µg/kg for a cereal product or separately tested cereal or pulse. B1 is 10 µg/kg for these entries. Ochratoxin A and deoxynivalenol checks here apply only to individually named grain samples.';
  const childResidues={
    source:childGazette+'#page=16',
    pesticide:'FPSFA 2.4.11(4)(7) requires preparation with special care under good manufacturing practices to minimise pesticide residues in the product.',
    veterinary:'FPSFA 2.4.11(4)(7) requires the product to be free of hormone and antibiotic residues as determined by agreed analytical methods. Document the agreed method and its reporting limit.'
  };
  function childCriteriaRows(){
    const rows=[['Catalogue ID','Product','Sample','Sample role','Analyte','Maximum','Unit','Evidence needed','Product standard','Contaminant Gazette']];
    for(const form of childForms){
      for(const [analyte,key] of Object.entries(form.keys)){
        const r=data.rows[key];
        rows.push([childId,root.PMSVCatalogueRules.products[childId].name,form.label,form.sample,data.labels[analyte],
          String(r.limit),r.unit,childIdentityNote+' '+(form.sample==='finished'?childSampleNote:'Identify the incoming commodity and lot on its separate sample report.'),
          childGazette+'#page=12',url(r.doc,r.page)]);
      }
    }
    return rows;
  }
  function childRoute(a){
    if(!childAnalytes.includes(a))return null;
    const options=childForms.filter(form=>form.keys[a]).map(form=>({value:form.value,label:form.label,sample:form.sample,rows:[form.keys[a]]}));
    options.push({value:'uncertain',label:'Other sample, or classification still unresolved',sample:'unresolved',rows:[]});
    return {mode:'check',reason:a==='ota'||a==='don'?'Identify the named grain on a separate ingredient report. The finished supplement requires its own applicable entry.':childSampleNote,options};
  }
  function firstSource(id){
    if(recipe?.firstSource(id))return recipe.firstSource(id);
    if(botanicalIds.includes(id)){
      const single=id===botanicalIds[0],sources=new Map();
      for(const f of botanicalForms){
        sources.set(botanicalGazette+'#page='+f.page,'FSSAI ingredient list · p. '+f.page);
        sources.set(spiceStandard+'#page='+f.spicePage,'Spice identity · p. '+f.spicePage);
      }
      sources.set(url('ctr-3',29),'Aflatoxin table · p. 29');
      sources.set('https://fcstraining.fssai.gov.in/standard-product','FoSCoS · 99.7');
      return {status:'CONDITIONAL_TOXIN_SOURCE_MATCH',text:botanicalEvidence+' '+(single?'When the marketed powder itself meets the spice entry, total aflatoxins are limited to 30 µg/kg and B1 to 15 µg/kg.':'A documented compound food premix containing the ground spice has maxima of 20 µg/kg total aflatoxins and 10 µg/kg B1. A separately sampled spice has maxima of 30 and 15 µg/kg respectively.'),
        urls:[...sources.keys()],labels:[...sources.values()]};
    }
    if(id===childId)return {status:'CONDITIONAL_TOXIN_SOURCE_MATCH',text:childSourceText,urls:[childGazette+'#page=12',url('ctr-3',28),url('ctr-3',29),url('ctr-2',17)]};
    if(!Object.hasOwn(spiceFoods,id))return null;
    const food=spiceFoods[id];
    return {status:'CONDITIONAL_TOXIN_SOURCE_MATCH',text:food.note+' Finished food: total aflatoxins 20 µg/kg and B1 10 µg/kg. Incoming spice: 30 and 15 µg/kg respectively.',urls:[food.identity,url('ctr-3',29)]};
  }
  function spiceCriteriaRows(id){
    const header=['Catalogue ID','Product','Sample','Analyte','Maximum','Unit','Evidence needed','Product standard','Contaminant Gazette'];
    const rows=[header];
    for(const [key,food] of Object.entries(spiceFoods)){
      if(id&&key!==id)continue;
      for(const [analyte,keys] of Object.entries(afKeys)){
        for(const [role,sourceKey] of Object.entries(keys)){
          const r=data.rows[sourceKey],finished=role==='finished';
          rows.push([key,root.PMSVCatalogueRules.products[key].name,finished?food.form:'Incoming spice or spice mix sampled separately',
            data.labels[analyte],String(r.limit),r.unit,finished?food.note:'Identify the incoming spice and its lot on the supplier or laboratory report.',food.identity,url(r.doc,r.page)]);
        }
      }
    }
    return rows;
  }
  function spiceRoute(id,a){
    const food=spiceFoods[id],keys=afKeys[a];
    if(!food||!keys)return null;
    return {mode:'check',reason:firstSource(id).text,options:[
      {value:'finishedSpice',label:food.form,rows:[keys.finished],sample:'finished'},
      {value:'incomingSpice',label:'Separately sampled incoming spice or spice mix',rows:[keys.ingredient],sample:'ingredient'},
      {value:'composite',label:'Finished food containing another documented article listed in this aflatoxin table',rows:[keys.finished],sample:'finished'},
      {value:'portion',label:'Isolated portion, filtered liquid or other unverified sample basis',rows:[],sample:'unresolved'},
      {value:'outside',label:'Reviewed finished formula excludes the listed ingredients',rows:[],sample:'outside'}
    ]};
  }
  function decision(id,a,s={}){
    if(!catalogue.has(id)||!Object.hasOwn(data.labels,a))return null;
    const recipeDecision=recipe?.decision(id,a,s);
    if(recipeDecision)return recipeDecision;
    const child=id===childId&&childRoute(a);
    const bot=botanicalRoute(id,a);
    const r=child||bot||spiceRoute(id,a)||data.routes[routeFor(id,a)], k=field(a);
    if(!r)return {status:'Not named for stated identity',sample:'unmatched',rows:[],reason:note[a]+' No match identified for the catalogue article as described.',sources:allRows[a],choices:[]};
    if(r.mode==='named')return {status:'Named finished article',sample:'finished',rows:r.rows,reason:r.reason,sources:r.rows,choices:[]};
    const opt=r.options.find(o=>o.value===s[k]),proof=evidence(s,k);
    const sources=[...new Set(r.options.flatMap(o=>o.rows))];
    const ageRef=child&&evidence(s,'crop_childAge');
    if(child&&(s.crop_childAge!=='covered'||!ageRef))return {status:'Confirm marketed age and product standard',sample:'unresolved',rows:[],
      reason:childIdentityNote+' '+r.reason,sources,choices:r.options};
    const botanical=bot&&botanicalForms.find(f=>f.value===s.crop_botanical);
    const spec=bot&&evidence(s,'crop_botanical'),lot=bot&&String(s.crop_botanicalLot||'').trim();
    if(bot&&(!botanical||!spec||!lot))return {status:'Confirm spice identity, specification and sample lot',sample:'unresolved',rows:[],reason:r.reason,sources,choices:r.options};
    if(opt&&proof)return {status:{finished:'Documented finished article',ingredient:'Documented ingredient sample',outside:'Documented outside these rows',unresolved:'Sample basis unresolved'}[opt.sample],
      sample:opt.sample,rows:opt.rows,reason:opt.label+' · '+proof+(child?' · Marketed age and identity: '+ageRef:'')+(bot?' · '+botanical.label+' · Spec: '+spec+' · Lot: '+lot:''),sources:opt.rows.length?opt.rows:sources,choices:r.options};
    return {status:opt?'Awaiting evidence reference':'Check article or recipe',sample:'unresolved',rows:[],reason:r.reason,sources,choices:r.options};
  }
  function decisions(id,s={}){return catalogue.has(id)?analytes.map(a=>({key:a,name:data.labels[a],...decision(id,a,s)})):[];}
  function positive(id){return decisions(id).filter(d=>d.sample==='finished');}
  function referenceLinks(keys){return refs(keys).map(([u,t])=>'<a class="source-ref" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(t)+'</a>').join(' ');}
  function limitText(d){return d.rows.map(rowText).join(' / ');}
  function itemText(d){return [d.status,limitText(d),d.reason].filter(Boolean).join(' · ');}
  function resultCell(d){
    const label=d.sample==='ingredient'?'Input sample only · ':'';
    return '<strong>'+esc(d.status)+'</strong>'+(d.rows.length?'<br>'+esc(label+limitText(d)):'')+'<br>'+esc(d.reason);
  }
  const futureOptions=[{value:'contains',label:'Mace or nutmeg kernel is an ingredient of the beverage or food'},
    {value:'absent',label:'Neither ingredient is used in the beverage or food'}];
  const futureSource=()=>url('ctr-1',5);
  function future(s={},id){
    if(recipe&&id===recipe.drink){
      const d=recipe.decision(id,'saf',s,'2026-12-01');
      return d.status+' · '+d.reason;
    }
    const v=futureOptions.find(o=>o.value===s.crop_dec),proof=evidence(s,'crop_dec');
    if(!v||!proof)return 'Check the ingredient list for mace and/or nutmeg kernel against the replacement entry. A prior food-category match alone does not carry forward.';
    return (v.value==='contains'?'Documented future article · Saffrole 10 ppm':'Neither specified ingredient documented · no match to the replacement entry on this formulation')+' · '+proof;
  }
  function cross(id){
    const notes=[];
    const identity=data.identity[id];
    if(identity)notes.push({text:identity[2],doc:identity[0],p:identity[1]});
    if(groups.fpc.has(id))notes.push({text:'For an Indian sweet or snack under the FPC 18 direction, confirm eligibility and the individual base foods for toxins and residues. Record those alongside any proposed finished-food match.',doc:'profile-special-regulatory-routes-1',p:1});
    if(groups.bean.has(id))notes.push({text:'Separate product standard 2.3.48 names dry kidney-shaped or flattened leguminous seeds used whole or as dal. For beans meeting that definition the hydrocyanic acid maximum is 20 ppm on the stated AOAC maceration basis. Check the species and marketed article.',doc:'chapter-4',p:73});
    if(groups.wheat.has(id))notes.push({text:'The wheat product standard also lists DON at a maximum of 1,000 µg/kg.',doc:'chapter-5',p:9});
    return notes;
  }
  function documented(id,s){
    const selected=decisions(id,s).filter(d=>['Documented finished article','Documented ingredient sample','Documented outside these rows'].includes(d.status));
    const result=selected.map(d=>d.name+' · '+itemText(d));
    if(futureOptions.some(o=>o.value===s.crop_dec)&&evidence(s,'crop_dec'))result.push('From 1 December 2026 · '+future(s,id));
    return result.concat(labSummaries(id,s)).join(' | ');
  }
  function control(k,label,opts,s){
    return '<div class="crop-control"><label>'+esc(label)+'<select data-ws-field="'+k+'"><option value="">Select the documented article</option>'+
      opts.map(o=>'<option value="'+esc(o.value)+'"'+(s[k]===o.value?' selected':'')+'>'+esc(o.label)+'</option>').join('')+
      '</select></label> <label>Supporting recipe, specification or sample reference<input maxlength="320" data-ws-field="'+k+'Ref" value="'+esc(s[k+'Ref'])+'"></label></div>';
  }
  function futureNote(id){
    return (groups.afoils.has(id)?' The revised wording explicitly covers oils, oilseeds for further processing and ready-to-eat oilseeds. The total-aflatoxins and B1 maxima for those rows stay at 15 and 10 µg/kg respectively.':'');
  }
  const roles={finished:'Finished product',ingredient:'Separately sampled ingredient'};
  const massUnits={'ug/kg':0,'ng/g':0,'mg/kg':3,'ug/g':3,ppb:0,ppm:3};
  const massUnit=unit=>unit.trim().toLowerCase().replace(/[µμ]/g,'u');
  const labField=(a,suffix)=>'tox_'+a+'_'+suffix;
  const labSuffixes=['role','sample','report','unit','value','basis'];
  function amountInMicrograms(value,unit){
    const [whole,fraction='']=value.split('.');
    const places=massUnits[massUnit(unit)];
    return (whole||'0')+fraction.padEnd(places,'0').slice(0,places)+(fraction.length>places?'.'+fraction.slice(places):'');
  }
  function labResult(id,a,s={},date=s.vetDate??root.PMSVVeterinary.reviewDate,planned){
    if(!catalogue.has(id)||!Object.hasOwn(data.labels,a))return null;
    const get=k=>String(s[labField(a,k)]??'').trim();
    const role=get('role'),sample=get('sample'),report=get('report'),unit=get('unit'),value=get('value');
    const d=decision(id,a,recipe?.covered(id,a)&&s.vetDate!==date?{...s,vetDate:date}:s),plan=root.PMSVTestingPlan;
    const row=planned??plan.toxinRow(id,{...d,key:a,name:data.labels[a]},date,s);
    const rule=row?.criterion;
    const criterion=rule?roles[rule.role]+' · '+rule.article+' · maximum '+rule.value+' '+rule.unit:'';
    const botanical=botanicalIds.includes(id)&&Object.hasOwn(afKeys,a);
    const sameLot=recipe?.covered(id,a)?sample===String(s[field(a)+'Lot']||'').trim():!botanical||sample===String(s.crop_botanicalLot||'').trim();
    const comparable=sameLot&&rule&&role===rule.role&&sample&&report&&Object.hasOwn(massUnits,massUnit(unit));
    const stamp=comparable?JSON.stringify([id,a,plan.metalEdition(date),rule,role,sample,report,unit,row.source,row.notes]):'';
    const confirmed=!!stamp&&get('basis')===stamp;
    let outcome;
    if(!row)outcome='Select a date covered by the reviewed toxin provisions.';
    else if(!rule)outcome='No numeric comparison for this sample. '+row.status+'.';
    else if(!role)outcome='Select the sample role shown on the laboratory report.';
    else if(role!==rule.role)outcome='The cited maximum applies to a different sample role. Check the sampled article and the report.';
    else if(!sample||!report)outcome='Enter the sample or lot identifier and laboratory report reference.';
    else if(!sameLot)outcome=botanical?'The laboratory sample must match the documented spice or premix lot.':'The laboratory sample must match the documented lot for this analyte.';
    else if(!Object.hasOwn(massUnits,massUnit(unit)))outcome='Choose the reported mass-based unit. A volume-based or other unit requires separate review.';
    else if(!confirmed)outcome='Confirm the sample, analyte definition and mass basis for this assessment edition.';
    else if(!value)outcome='Enter the reported value, including any numerical upper bound.';
    else{
      const parsed=value.match(/^(<=|≤|<)?\s*\+?(\d+(?:\.\d+)?|\.\d+)$/);
      if(!parsed)outcome='Manual review required. A numeric result or numeric upper bound is needed for comparison.';
      else{
        const max=amountInMicrograms(rule.value,rule.unit),measured=amountInMicrograms(parsed[2],unit);
        const within=root.PMSVCatalogueWorksheets.compare({operator:'<=',value:max},measured);
        if(parsed[1])outcome=within?'Reported upper bound is within the cited maximum.':'Inconclusive. The reported upper bound exceeds the cited maximum.';
        else outcome=within?'Within the cited maximum.':'Above the cited maximum.';
      }
    }
    const summary=value?['Assessment '+(date||'(date pending)'),roles[role]||'Sample role pending',sample&&'Sample: '+sample,report&&'Report: '+report,
      'Reported '+data.labels[a]+': '+value+' '+(unit||'(unit pending)'),criterion&&'Criterion: '+criterion,outcome].filter(Boolean).join(' · '):'';
    return {criterion,outcome,summary,stamp,confirmed,source:row?.source||''};
  }
  function labSummaries(id,s){
    return analytes.filter(a=>s[labField(a,'value')]?.trim()).map(a=>{
      const r=labResult(id,a,s);return [r.summary,r.source].filter(Boolean).join(' · ');
    });
  }
  function labControls(id,s){
    const a=s.toxinActive;
    if(!Object.hasOwn(data.labels,a))return '';
    const field=suffix=>labField(a,suffix);
    const option=(v,label,current)=>'<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(label)+'</option>';
    const select=(suffix,label,choices)=>'<label>'+label+'<select data-ws-field="'+field(suffix)+'">'+
      option('','Select',s[field(suffix)])+choices.map(([v,t])=>option(v,t,s[field(suffix)])).join('')+'</select></label>';
    const input=(suffix,label)=>'<label>'+label+'<input maxlength="180" data-ws-field="'+field(suffix)+'" value="'+esc(s[field(suffix)])+'"></label>';
    const r=labResult(id,a,s);
    return select('role','Sample shown on the report',Object.entries(roles))+input('sample','Sample or lot identifier')+
      input('report','Laboratory report reference')+input('value','Reported result (e.g. 4.2 or &lt;5)')+
      '<label>Reported unit<input maxlength="40" list="toxin-report-units" data-ws-field="'+field('unit')+'" value="'+esc(s[field('unit')])+'"></label>'+
      '<datalist id="toxin-report-units">'+['µg/kg','mg/kg','ppb','ppm','ng/g','µg/g','µg/L','mg/L'].map(u=>'<option value="'+u+'"></option>').join('')+'</datalist>'+
      '<p data-toxin-criterion>'+esc(r.criterion)+'</p><label class="ws-check"><input type="checkbox" data-ws-field="'+field('basis')+'"'+
      (r.stamp?'':' disabled')+(r.confirmed?' checked':'')+'> The sampled article, analyte definition, reporting basis and source entry match this report.</label>'+
      '<p data-toxin-outcome role="status">'+esc(r.outcome)+'</p><span data-toxin-links>'+labLinks(r)+'</span>';
  }
  function labLinks(r){
    return r.source.split(' | ').filter(Boolean).map(u=>'<a class="source-ref" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Source · '+(u.includes('#page=')?esc(u.split('#page=')[1]):'FoSCoS')+'</a>').join(' ');
  }
  function labPanel(id,s){
    return '<details class="ws-section toxin-analysis"><summary>Check toxin laboratory results</summary><div>'+
      '<p>Keep one result per analyte for this product. Save the worksheet to retain the entries. Record a separately tested ingredient under its own sample role.</p>'+
      '<label>Assessment date<input type="date" data-plan-vet-date value="'+esc(s.vetDate??root.PMSVVeterinary.reviewDate)+'"></label>'+
      '<label>Analyte<select data-ws-field="toxinActive"><option value="">Select an analyte</option>'+analytes.map(a=>
        '<option value="'+a+'"'+(s.toxinActive===a?' selected':'')+'>'+esc(data.labels[a])+'</option>').join('')+'</select></label>'+
      '<div data-toxin-controls>'+labControls(id,s)+'</div></div></details>';
  }
  function refreshLab(node,id,k,s){
    const a=s.toxinActive,box=node.querySelector('[data-toxin-controls]');
    if(!box)return;
    if(k==='toxinActive'){box.innerHTML=labControls(id,s);return;}
    if(!Object.hasOwn(data.labels,a))return;
    const r=labResult(id,a,s),basis=labField(a,'basis'),check=box.querySelector('[data-ws-field="'+basis+'"]');
    if(!check)return;
    if(k===basis)s[basis]=s[basis]==='yes'?r.stamp:'';
    else if(k.startsWith('tox_')&&k!==labField(a,'value'))s[basis]='';
    const confirmed=!!r.stamp&&s[basis]===r.stamp;
    check.checked=confirmed;check.disabled=!r.stamp;
    box.querySelector('[data-toxin-criterion]').textContent=r.criterion;
    box.querySelector('[data-toxin-outcome]').textContent=confirmed===r.confirmed?r.outcome:labResult(id,a,s).outcome;
    box.querySelector('[data-toxin-links]').innerHTML=labLinks(r);
  }
  const fields=[...fieldKeys.flatMap(k=>[k,k+'Ref']),'crop_botanicalLot','crop_saltCereal','crop_afLot','crop_saffLot','crop_milkLot','toxinActive',...analytes.flatMap(a=>labSuffixes.map(suffix=>labField(a,suffix)))];
  function markup(id,s={}){
    if(!catalogue.has(id))return '';
    const ds=decisions(id,s),seen=new Set(),controlList=[];
    if(id===recipe?.salt)controlList.push('<label>Cereal named on the flour specification (for example, wheat or rice)<input maxlength="180" data-ws-field="crop_saltCereal" value="'+esc(s.crop_saltCereal||'')+'"></label>');
    if(botanicalIds.includes(id))controlList.push(control('crop_botanical','Ground spice identity',botanicalForms.concat({value:'other',label:'Other form, oil, extract or isolate'}),s),
      '<label>Sampled spice or premix lot identifier<input maxlength="180" data-ws-field="crop_botanicalLot" value="'+esc(s.crop_botanicalLot)+'"></label>');
    if(id===childId)controlList.push(control('crop_childAge','Marketed age and product standard',childAgeChoices,s));
    for(const d of ds){
      const k=field(d.key);
      if(!d.choices.length||seen.has(k))continue;
      seen.add(k);
      controlList.push(control(k,d.key==='total'?'Total aflatoxins and B1':d.name,d.choices,s));
      if(recipe?.covered(id,d.key))controlList.push('<label>Lot for '+esc(d.key==='total'?'aflatoxins':d.name)+'<input maxlength="180" data-ws-field="'+k+'Lot" value="'+esc(s[k+'Lot'])+'"></label>');
    }
    const published=[...new Set(decisions(id).flatMap(d=>d.sources))];
    const catalogueName=root.PMSVCatalogueRules?.products[id]?.name||'selected food';
    return '<details class="ws-section crop-scope"><summary>Crop contaminants, natural toxins and fish contaminants</summary><div>'+
      '<p>FSSAI CTR 2.2.1 · 20 November 2026 · '+esc(catalogueName)+'. Each limit belongs to the article and sample shown. A recipe or supplier reference can establish an article match. A laboratory result is a separate check.</p>'+
      '<div class="ws-scroll"><table><thead><tr><th>Analyte</th><th>Finished article or input sample</th><th>Gazette</th></tr></thead><tbody>'+
      ds.map(d=>'<tr><th scope="row">'+esc(d.name)+'</th><td data-crop-result="'+d.key+'">'+resultCell(d)+'</td><td data-crop-source="'+d.key+'">'+(d.links?recipeLinks(d):referenceLinks(d.sources))+'</td></tr>').join('')+'</tbody></table></div>'+
      (controlList.length?'<details class="ws-section crop-inputs"><summary>Document article and ingredient decisions</summary>'+controlList.join('')+'</details>':'')+
      labPanel(id,s)+'<details class="ws-section"><summary>Published commodity rows and limits</summary><ul>'+published.map(k=>'<li>'+esc(data.labels[analytes.find(a=>allRows[a].includes(k))]+' · '+rowText(k))+' '+referenceLinks([k])+'</li>').join('')+'</ul></details>'+
      cross(id).map(n=>'<p>'+esc(n.text)+' <a class="source-ref" href="'+esc(url(n.doc,n.p))+'" target="_blank" rel="noopener noreferrer">Product standard · PDF p. '+n.p+'</a></p>').join('')+
      '<p>Food product standards also prohibit adding saffrole or isosaffrole as flavouring agents. The natural-occurrence maximum serves a different purpose. <a class="source-ref" href="'+esc(url('chapter-18',90))+'" target="_blank" rel="noopener noreferrer">Flavouring restrictions · PDF p. 90</a></p>'+
      '<details class="ws-section crop-future"><summary>Change effective 1 December 2026</summary><p>The six current saffrole entries are replaced by one 10 ppm entry for beverages and foods containing mace and/or nutmeg kernel as an ingredient.'+esc(futureNote(id))+' <a class="source-ref" href="'+esc(futureSource())+'" target="_blank" rel="noopener noreferrer">Amendment · PDF p. 5</a></p>'+
      control('crop_dec','Future saffrole article',futureOptions,s)+'<p data-crop-future role="status">'+esc(future(s,id))+'</p></details></div></details>';
  }
  function recipeLinks(d){return (d.links||[]).map(u=>'<a class="source-ref" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Source · p. '+esc(u.split('#page=')[1])+'</a>').join(' ');}
  function update(node,id,k,s,previous){
    if(recipe?.profiles[id]){
      for(const a of analytes){
        if(!recipe.covered(id,a))continue;
        const key=field(a);
        if(![key,key+'Lot',key+'Ref','crop_saltCereal','ayRecipe','ayVariant','ayIngredient','ayIngredientRef','vetDate','crop_dec','crop_decRef'].includes(k))continue;
        if(k===key){
          s[key+'Lot']='';s[key+'Ref']='';
          if(id===recipe.salt){
            s.crop_saltCereal='';
            const cereal=node.querySelector('[data-ws-field="crop_saltCereal"]');if(cereal)cereal.value='';
          }
          for(const suffix of ['Lot','Ref']){const el=node.querySelector('[data-ws-field="'+key+suffix+'"]');if(el)el.value='';}
        }
        s[labField(a,'basis')]='';
        const d=decision(id,a,s);
        node.querySelector('[data-crop-result="'+a+'"]').innerHTML=resultCell(d);
        node.querySelector('[data-crop-source="'+a+'"]').innerHTML=recipeLinks(d);
      }
      if(id===recipe.drink&&['ayRecipe','ayVariant','vetDate','crop_saff','crop_saffLot','crop_saffRef'].includes(k))node.querySelector('[data-crop-future]').textContent=future(s,id);
      if(['ayRecipe','ayVariant','ayIngredient','ayIngredientRef'].includes(k)){refreshLab(node,id,k,s);return;}
    }
    if(k==='vetDate'&&root.PMSVTestingPlan.metalEdition(previous)!==root.PMSVTestingPlan.metalEdition(s.vetDate)){
      for(const a of analytes)s[labField(a,'basis')]='';
    }
    if(k==='vetDate'||k==='toxinActive'||k.startsWith('tox_')){refreshLab(node,id,k,s);return;}
    if(!fields.includes(k))return;
    const botanicalChanged=botanicalIds.includes(id)&&['crop_botanical','crop_botanicalRef','crop_botanicalLot'].includes(k);
    const childAgeChanged=id===childId&&(k==='crop_childAge'||k==='crop_childAgeRef');
    if(botanicalIds.includes(id)&&(k==='crop_botanical'||k==='crop_af')){
      const reset=k==='crop_botanical'?['crop_af','crop_afRef','crop_botanicalLot']:['crop_botanicalLot'];
      for(const dependent of reset){
        s[dependent]='';
        const input=node.querySelector('[data-ws-field="'+dependent+'"]');
        if(input)input.value='';
      }
    }
    if(fieldKeys.includes(k)){
      s[k+'Ref']='';
      const input=node.querySelector('[data-ws-field="'+k+'Ref"]');
      if(input)input.value='';
    }
    for(const a of analytes){
      const target=field(a);
      if((botanicalChanged&&Object.hasOwn(afKeys,a))||(childAgeChanged&&childAnalytes.includes(a))||k===target||k===target+'Ref'||a==='saf'&&(k==='crop_dec'||k==='crop_decRef'))s[labField(a,'basis')]='';
    }
    refreshLab(node,id,k,s);
    if(k==='crop_dec'||k==='crop_decRef'){
      node.querySelector('[data-crop-future]').textContent=future(s,id);
      return;
    }
    for(const a of analytes){
      if(k!==field(a)&&k!==field(a)+'Ref'&&!(childAgeChanged&&childAnalytes.includes(a))&&!(botanicalChanged&&Object.hasOwn(afKeys,a)))continue;
      const d=decision(id,a,s);
      node.querySelector('[data-crop-result="'+a+'"]').innerHTML=resultCell(d);
      node.querySelector('[data-crop-source="'+a+'"]').innerHTML=d.links?recipeLinks(d):referenceLinks(d.sources);
    }
  }
  function brief(id,s={}){
    if(!catalogue.has(id))return [];
    return ['FSSAI CTR 2.2.1 · assessment edition 20 November 2026',...decisions(id,s).map(d=>d.name+' · '+itemText(d)+' · '+refs(d.sources).map(x=>x[0]).join(' ')),
      ...cross(id).map(n=>n.text+' · '+url(n.doc,n.p)),'From 1 December 2026 · '+future(s,id)+futureNote(id)+' · '+futureSource(),...labSummaries(id,s)];
  }
  function columns(){return [...analytes.map(a=>data.labels[a]+' · CTR 2.2.1'), 'Named finished-article limits in CTR 2.2.1','Original Gazette references for CTR 2.2.1','Additional product-standard cross-check','From 1 Dec 2026 · saffrole and applicable oil entries','Documented CTR 2.2.1 scope and evidence'];}
  function values(id,s={}){
    const ds=decisions(id,s);
    if(!ds.length)return [];
    const sources=[...new Set(ds.flatMap(d=>refs(d.sources).map(([u])=>u)))];
    return [...ds.map(itemText),positive(id).map(d=>d.name).join(' | '),sources.join(' | '),cross(id).map(n=>n.text+' '+url(n.doc,n.p)).join(' | '),
      future(s,id)+futureNote(id)+' '+futureSource(),documented(id,s)];
  }
  function stats(){
    let namedProducts=0,priorityNamed=0,namedDecisions=0;
    for(const id of catalogue){
      const n=positive(id).length;
      if(!n)continue;
      namedDecisions+=n;namedProducts++;
      if(!root.PMSVCatalogueEvidence.products[id].directCTR)priorityNamed++;
    }
    return {products:catalogue.size,analytes:analytes.length,sourceRows:Object.keys(data.rows).length,namedProducts,priorityNamed,namedDecisions};
  }
  root.PMSVCropScope=Object.freeze({fields,botanicalIds,botanicalCriteriaRows,childId,childCriteriaRows,childResidues,firstSource,spiceCriteriaRows,decisions,decision,labResult,positive,stats,markup,brief,columns,values,update,future});
})(globalThis);
