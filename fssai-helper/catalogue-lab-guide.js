/* Finished-sample criteria and matrix-specific analytical references reviewed 26 November 2026. */
(function(root){
  'use strict';
  const plan=root.PMSVTestingPlan;
  const bean='04-04-2-cocoa-beans', arrow='06-06-2-arrowroot', coffee='coffee-chicory-mixture';
  const jelly='100-100-royal-jelly', dairy='100-100-cow-or-buffalo-colostrum-and-colostrum-products';
  const coconut='04-04-1-coconut-milk-powder', egg=root.PMSVVeterinary.eggPowderId;
  const {cocoa,enzyme}=plan.routeIds, water=root.PMSVVendingWater.productId;
  const files='https://fssai.gov.in/upload/uploadfiles/files/';
  const coffeeManual=files+'Manual%20of%20Methods%20of%20Analysis%20for%20Beverages%20Tea%2C%20Coffee%20and%20Chicory.pdf';
  const cocoaManual=files+'Manual%20of%20methods-sugar%20and%20confectionary%20including%20sweetening%20agent.pdf';
  const beeManual=files+'Manual%20of%20Honey%20and%20Other%20bee%20Hive%20Products_05082024.pdf';
  const dairyManual=files+'Manual-Dairy-Revision1.pdf';
  const cerealManual=files+'Manual-Cereals-Revision1.pdf';
  const chapters=root.PMSVCatalogueEvidence.documents;
  const source=(key,page)=>chapters[key].url+'#page='+page;
  const profiles=new Map();
  function profile(id,article,sample,boundary,reference){
    profiles.set(id,{article,sample,boundary,reference,methods:[]});
  }
  function method(id,form,parameter,code,locator,url,note,variants){
    profiles.get(id).methods.push({form,parameter,code,locator,url,note,variants});
  }

  const ground=['regular_roasted_ground','decaffeinated_roasted_ground'];
  const instant=['instant','decaffeinated_instant'];
  const regular=['regular_roasted_ground','instant'];
  profile(coffee,'2.10.4','Dry coffee–chicory blend','Choose ground or instant and regular or decaffeinated. Blend composition depends on both choices. The brewed drink and each incoming ingredient have separate sample identities.',coffeeManual);
  method(coffee,'Ground or instant, regular or decaffeinated','Caffeine','04A.011:2023','printed pp. 25–27',coffeeManual,'Bailey–Andrew procedure. Request the reporting basis that matches the selected blend.');
  method(coffee,'Ground or instant, regular or decaffeinated','Caffeine','04A.012:2023','printed pp. 28–30',coffeeManual,'Alternative chromatographic and spectrophotometric procedure for the same four blend forms.');
  method(coffee,'Instant blend, regular or decaffeinated','Cold-water solubility','04A.017:2023','printed p. 38',coffeeManual,'Record dissolution time at the specified water temperature for the instant sample.',instant);

  for(const [code,pages,name,form,variants,note] of [
    ['001','6–7','Moisture','Ground blend, regular or decaffeinated',ground,'Record moisture on the sample as received and identify the blend on the report.'],
    ['003','10–11','Total ash','Ground blend, regular or decaffeinated',ground,'Use the reporting basis specified for the selected blend.'],
    ['007','18–19','Acid-insoluble ash','Ground or instant, regular or decaffeinated',null,'Report ash insoluble in dilute hydrochloric acid on the basis specified for the declared blend.'],
    ['010','23–24','Aqueous extract','Ground blend, regular or decaffeinated',ground,'Report the extract yield for the ground blend. An instant dissolution time is a separate measurement.'],
    ['013','31–32','Caffeine','Ground or instant, regular or decaffeinated',null,'HPLC alternative. Record the method and the basis used for the blend result.'],
    ['014','33–35','Microscopic screen for adulterants','Regular ground or regular instant blend',regular,'Identify the material observed by microscopy. The result does not quantify the coffee-to-chicory ratio.'],
    ['016','37','Boiling-water solubility','Instant blend, regular or decaffeinated',instant,'Report dissolution time in freshly boiled water. Record the cold-water test separately.']
  ])method(coffee,form,name,'04A.'+code+':2023','printed pp. '+pages,coffeeManual,note,variants);

  profile(coconut,'2.3.63','Dried coconut milk','Check moisture on the powder, fat on a dry basis, free fatty acids in the extracted fat as lauric acid, and bulk density in g/mL. Trace the kernel and any carrier separately.',root.PMSVPowderStandards.products.get(coconut).gazette);
  profile(bean,'2.3.54','Whole fermented and dried cocoa beans','Use the count of examined beans for the four defect percentages, and mass for moisture. Record germinated and flat beans together, counting a bean once within this combined class.',source('food-54',29));
  profile(cocoa,'2.7.8','Cocoa mass or liquor, or pressed cake','Keep shell alone distinct from shell plus germ. Check the material, the analyte actually reported and the fat-free dry matter or alkali-free basis before using a result.',cocoaManual);
  method(cocoa,'Mass, liquor or cake','Shell and germ on fat-free dry matter','04C.031:2024','printed pp. 74–79',cocoaManual,'Request the fat-free dry-matter result. The product standard lists this separately from shell only.');
  method(cocoa,'Mass, liquor or cake','Shell on an alkali-free basis','04C.032:2024','printed pp. 80–84',cocoaManual,'The method heading names shell and germ. The standard specifies shell only on this basis. Confirm the laboratory measured shell only before comparing.');

  for(const [code,pages,name,note] of [
    ['001','2–3','Moisture','Record which moisture procedure was used for the sampled mass, liquor or cake.'],
    ['003','6–7','Moisture','Vacuum-oven procedure for the processed cocoa sample.'],
    ['005','11–12','Acid-insoluble ash','Identify the sampled material and report the basis used for the ash result.'],
    ['007','15–16','Alkalinity of total ash','For clause 2.7.8, report potassium oxide equivalent on a moisture- and fat-free basis.'],
    ['018','42–44','Cocoa butter','Clause 2.7.8 gives a cocoa-butter range for mass or liquor. Its cake column marks that criterion inapplicable.'],
    ['019','45–47','Crude fibre','Document the sample fraction and reporting basis. Use the applicable product standard for interpretation.']
  ])method(cocoa,'Mass, liquor or cake',name,'04C.'+code+':2024','printed pp. '+pages,cocoaManual,note);

  profile(arrow,'2.4.14','Separated and purified arrowroot starch','Establish the species and separation process. The FSSAI manual illustrates Maranta. IS 1006:1984 shows both Maranta in Figure 1 and Curcuma in Figure 2. Record the declared source and the figure used.',cerealManual+'#page=77');
  method(arrow,'Starch declared as Maranta arundinacea','Microscopic appearance of starch granules','03.024:2023','PDF pp. 75–77',cerealManual+'#page=77','Use the Maranta illustration as an identity reference. The method scope names cereal starches. Document suitability for this sample before issuing a result. The illustration does not establish Curcuma identity.');
  profile(egg,'2.5.3(3)','Dried hen egg white, yolk or whole egg','Use the powder table for the declared form. The adjacent beta-hydroxybutyric, lactic and succinic acid maxima apply to frozen or liquid egg products. Do not enter them as powder thresholds.',root.PMSVVeterinary.animalGazette+'#page=37');
  profile(enzyme,'FoSCoS 99.2 / 99.4','Enzyme preparation as supplied','Record the enzyme identity, activity and units, source, formulation and intended use. Match the named preparation to its permission before assigning a purity or activity result. The lysozyme and chymosin examples have separate uses.','https://fcstraining.fssai.gov.in/assets/docs/Compiled%20FPC_FoSCoS.pdf#page=9');
  profile(dairy,'2.1.23','Cow or buffalo colostrum, or its powder','Select the liquid or powder standard. The four FSSAI dairy methods listed here cover liquid colostrum. Two AOAC IgG methods cover cow colostrum powder. For buffalo or mixed-species powder, obtain evidence that the laboratory method covers that species and matrix. Total protein and IgG are separate determinations.',dairyManual+'#page=326');
  for(const [code,page,parameter,note] of [
    ['121',326,'Sample preparation','Record sample identity and physical form before preparing the liquid.'],
    ['122',327,'Moisture','Report the result for the liquid sample as supplied.'],
    ['123',329,'Fat','Use the gravimetric colostrum method.'],
    ['124',331,'Total milk protein','The nitrogen-based total protein result cannot establish immunoglobulin G or lactoferrin.']
  ])method(dairy,'Liquid colostrum',parameter,'01.'+code+':2022','PDF p. '+page,dairyManual+'#page='+page,note);
  const affinityStudy='https://pubmed.ncbi.nlm.nih.gov/20480910/';
  const opticalStudy='https://pubmed.ncbi.nlm.nih.gov/24282942/';
  const isIgGSource=url=>url===affinityStudy||url===opticalStudy;
  method(dairy,'Cow colostrum powder','Immunoglobulin G (IgG)','AOAC 2010.01','Collaborative study, PMID 20480910',affinityStudy,'Protein G affinity liquid chromatography. Report IgG as % by mass of the powder as supplied. Confirm the species and laboratory scope.');
  method(dairy,'Cow colostrum powder','Immunoglobulin G (IgG)','AOAC 2012.26','Collaborative study, PMID 24282942',opticalStudy,'Direct optical immunoassay using surface plasmon resonance. Request an IgG-specific result on the powder as supplied. Lactoferrin requires its own determination.');
  profile(jelly,'2.8.3(3)','Raw royal jelly, Type 1 or Type 2','Keep the feeding record with the sample. Match the result to the declared type. A moisture measurement can be reported independently of the ambiguity in the Gazette heading. Furosine is an optional freshness indicator.',source('food-35',25));
  for(const [code,locator,parameter,note] of [
    ['028','64–65','Moisture','Reference vacuum-oven method. Record the measured value for interpretation under the product table.'],
    ['031','68–69','10-HDA','Reference HPLC-UV method with external standard. Confirm the reported mass fraction refers to the original sample.'],
    ['032','70–71','10-HDA','Alternative HPLC-UV method with internal standard. Report which method was used.'],
    ['033','72–74','Protein','Reference automated Kjeldahl method for the royal-jelly sample.'],
    ['036','81–82','Individual sugars','HPLC reference method. Report the individual sugars and use only the published cells for the declared type.'],
    ['038','85','Total acidity','Use the reporting unit in the product standard.'],
    ['039','86–87','Total lipid','Report mass fraction for the sampled royal jelly.'],
    ['040','88','Carbon isotope ratio','EA-IRMS measurement. Record the signed delta value in per mille and retain the independent feeding declaration.'],
    ['041','88–90','Furosine','Optional freshness measurement. The product standard supplies no numerical acceptance limit.']
  ])method(jelly,'Raw royal jelly',parameter,'04B.'+code+':2024','manual index pp. '+locator,beeManual,note);
  profile(water,'2.10.9','Water at the dispensing outlet','Identify the outlet and sample. Each incorporated IS 10500 entry has its own unit, conditions and available method reference. Read the date-specific saffrole decision separately.',root.PMSV_REVIEW_REGISTER.waterSourceReview.sources.vending);

  const recognitionUrl='https://foodsafety.meghealth.gov.in/documents/parameters-to-be-tested.pdf';
  const recognitionAnalytes=['Melamine','Lead','Copper','Arsenic','Tin','Cadmium','Mercury','Methylmercury'];
  const recognitionSamples=new Map([
    [bean,[['Whole fermented and dried cocoa beans','300',165]]],
    [coconut,[['Coconut milk powder','327',185]]],
    [dairy,[['Liquid cow or buffalo colostrum','124',31],['Cow or buffalo colostrum powder','125',32]]]
  ]);
  function recognition(id){
    return (recognitionSamples.get(id)||[]).map(([form,item,page])=>({
      form,article:'NABL 154, Format 3, Annexure 3, item '+item,page,url:recognitionUrl+'#page='+page
    }));
  }
  const guidanceNote='The laboratory recognition list names this test for the sample. It supplies no numerical limit. Use the applicable Gazette provision and reporting basis for any compliance comparison.';
  const isRecognitionSource=url=>[31,32,165,185].some(page=>url===recognitionUrl+'#page='+page);
  const codexBase='https://www.fao.org/fao-who-codexalimentarius/sh-proxy/';
  const cocoaOta=codexBase+'en/?lnk=1&url=https%253A%252F%252Fworkspace.fao.org%252Fsites%252Fcodex%252FStandards%252FCXC%2B72-2013%252FCXC_072e.pdf';
  const cocoaCd=codexBase+'en/?lnk=1&url=https%253A%252F%252Fworkspace.fao.org%252Fsites%252Fcodex%252FStandards%252FCXC%2B81-2022%252FCXC_081e.pdf';
  const coffeeOta=codexBase+'fr/?lnk=1&url=https%253A%252F%252Fworkspace.fao.org%252Fsites%252Fcodex%252FStandards%252FCXC%2B69-2009%252FCXC_069e.pdf';
  const controls=new Map([
    [bean,[
      ['Whole fermented and dried cocoa beans','Ochratoxin A','CXC 72-2013','Sections 3 and 4',cocoaOta,'Trace the bean lot through fermentation, drying and storage. Review drying records and any rewetting or visible mould.'],
      ['Cocoa beans from an identified growing area','Cadmium','CXC 81-2022','Sections 2 and 4',cocoaCd,'Link the sampled beans to their growing area. Record the bean result separately from soil measurements and supplier mitigation records.']
    ]],
    [cocoa,[['Bean and nib lots feeding cocoa mass, liquor or cake','Ochratoxin A','CXC 72-2013','Paragraph 14',cocoaOta,'Record shell removal and identify whether the laboratory sampled whole beans, nibs, mass or cake. A shell or whole-bean result cannot establish a level in the finished lot.']]],
    [coffee,[['Coffee ingredient before blending with chicory','Ochratoxin A','CXC 69-2009','Drying, storage and transport',coffeeOta,'Trace the coffee intake lot and review drying, storage and protection against rewetting. Assess the finished blend on its own sample and legal basis.']]]
  ]);
  const isControlSource=url=>[cocoaOta,cocoaCd,coffeeOta].includes(url);
  const referenceArea='Laboratory methods and prevention guidance';
  // Read the numeric thresholds from the same product-standard records as the testing plan.
  const coconutCriteria=root.PMSVPowderStandards.products.get(coconut).criteria.map(r=>r.v.spec);
  const powderForm=root.PMSVVariantComposition.profileFor(dairy).forms.find(f=>f.name==='Colostrum Powder');
  const dryBasis=new Map();
  function defineBasis(id,form,criteria,parameter,url){
    const target=criteria.find(r=>r.parameter===parameter),moisture=criteria.find(r=>r.parameter==='Moisture');
    dryBasis.set(id,{form,parameter:target.parameter,limit:target.value,minimum:target.operator==='>=',moistureMax:moisture.value,url});
  }
  defineBasis(coconut,'Coconut milk powder',coconutCriteria,'Fat on dry basis',profiles.get(coconut).reference);
  defineBasis(dairy,powderForm.name,powderForm.rows,'Total ash',powderForm.rows.find(r=>r.parameter==='Total ash').source);
  const basisFields=['dryLot','dryReport','dryBasis','dryValue','dryMoisture'];
  const basisLabels={asSold:'As supplied',dry:'Dry basis'};
  const basisNote='For an as-supplied result, calculate 100 × reported percentage ÷ (100 − moisture percentage) using moisture from the same powder sample. Compare a dry-basis report directly. Assess moisture separately.';
  // Scaled integers preserve the inclusive legal boundary even if the displayed result rounds to it.
  const scale=1000000n,whole=100n*scale;
  function scaledPercent(value){
    if(typeof value!=='string'||!/^\d{1,3}(?:\.\d{1,6})?$/.test(value))return null;
    const [i,f='']=value.split('.');
    const n=BigInt(i)*scale+BigInt(f.padEnd(6,'0'));
    return n<=whole?n:null;
  }
  function basisResult(id,s={}){
    const rule=dryBasis.get(id);
    if(!rule)return '';
    if(id===dairy&&s.compVariant!==powderForm.name)return 'Select Colostrum Powder under Product variant to use the ash check.';
    if(!s.dryLot?.trim()||!s.dryReport?.trim())return 'Enter the powder sample or lot and laboratory report reference.';
    const m=scaledPercent(s.dryMoisture),v=scaledPercent(s.dryValue);
    const water=m!==null&&m<whole?'Moisture '+s.dryMoisture+'% is '+(m<=scaledPercent(String(rule.moistureMax))?'at or below':'above')+' the '+rule.moistureMax+'% maximum.':'';
    if(!Object.hasOwn(basisLabels,s.dryBasis)||v===null)return [water,'Select the reporting basis and enter a numerical result from 0 to 100% (up to six decimal places).'].filter(Boolean).join(' ');
    if((s.dryBasis==='asSold'||s.dryMoisture)&&(m===null||m===whole))return 'Enter same-sample moisture from 0 to below 100% (up to six decimal places).';
    if(s.dryBasis==='asSold'&&v>whole-m)return water+' The reported constituent exceeds the dry solids in this sample. Check the units and reporting basis.';
    const numerator=s.dryBasis==='asSold'?v*100n:v;
    const denominator=s.dryBasis==='asSold'?whole-m:scale;
    const boundary=BigInt(rule.limit)*denominator;
    const within=rule.minimum?numerator>=boundary:numerator<=boundary;
    const percent=(Number(numerator)/Number(denominator)).toLocaleString('en-US',{maximumFractionDigits:6,useGrouping:false});
    const position=rule.minimum?(within?'at or above':'below'):(within?'at or below':'above');
    return rule.parameter+' is '+percent+'% on dry basis (display rounded), '+position+' the '+rule.limit+'% '+(rule.minimum?'minimum':'maximum')+'. '+(water||'Moisture was not entered.');
  }
  function referenceEntries(id,state){
    const entries=[];
    function add(form,parameter,article,status,source,locator,notes){
      entries.push({area:referenceArea,form,parameter,article,status,source,locator,notes});
    }
    for(const m of profiles.get(id)?.methods||[]){
      if(state?.coffeeForm&&m.variants&&!m.variants.includes(state.coffeeForm))continue;
      if(id===dairy&&state?.compVariant){
        const powder=state.compVariant===powderForm.name;
        if(powder!==isIgGSource(m.url))continue;
        if(powder&&['buffalo','mixed'].includes(state.drySpecies))continue;
      }
      add(m.form,m.parameter,m.code,'Analytical reference',m.url,m.locator,m.note);
    }
    const rule=dryBasis.get(id);
    if(rule&&!(id===dairy&&state?.compVariant&&state.compVariant!==powderForm.name)){
      const report=state&&basisFields.some(key=>state[key])?[
        'Sample '+(state.dryLot||'pending'), 'report '+(state.dryReport||'pending'),
        'reported '+(state.dryValue||'pending')+'% ('+(basisLabels[state.dryBasis]||'basis pending')+')',
        'moisture '+(state.dryMoisture?state.dryMoisture+'%':'pending'),basisResult(id,state)
      ].join(' · '):'';
      add(rule.form,rule.parameter,profiles.get(id).article,'Dry-basis calculation',rule.url,'Composition table', [basisNote,id===dairy&&state?.drySpecies?'Declared species: '+state.drySpecies+'. '+(state.drySpecies==='cow'?'':'Document IgG method applicability for this species and sample before using a result.'):'',report].filter(Boolean).join(' '));
    }
    for(const ref of recognition(id)){
      for(const parameter of recognitionAnalytes)add(ref.form,parameter,ref.article,'Laboratory recognition guidance',ref.url,'p. '+ref.page,guidanceNote);
    }
    for(const [form,parameter,article,locator,url,notes] of controls.get(id)||[]){
      add(form,parameter,article,'Codex prevention guidance',url,locator,notes);
    }
    return entries;
  }
  const headers=['Catalogue ID','Product','Assessment date','Sample or form','Reference type','Parameter','Article or method','Reference criterion','Unit','n','c','m','M','Scope and reporting instructions','Official source','Manual page or section'];
  function rows(id,date=root.PMSVVeterinary.reviewDate){
    const out=[headers];
    if(!plan.metalEdition(date))return out;
    const queue=id?null:plan.openScope(date);
    for(const [key,p] of profiles){
      if(id ? key!==id : !queue.has(key))continue;
      const prefix=[key,root.PMSVCatalogueRules.products[key].name,date];
      out.push([...prefix,p.sample,'Sample scope','Interpretation',p.article,'','','','','','',p.boundary,p.reference,'']);
      for(const r of plan.entries(key,date)){
        if(r.area===root.PMSVSamplingQuantities?.area||r.area===root.PMSVStarchSpecifications?.area){
          out.push([...prefix,r.form,r.status,r.parameter,r.article,r.limit,r.unit,'','','','',r.notes,r.source,'']);
          continue;
        }
        if(r.area===referenceArea){
          out.push([...prefix,r.form,r.status,r.parameter,r.article,'','','','','','',r.notes,r.source,r.locator]);
          continue;
        }
        const productClause=r.area===plan.areas[0]&&r.article===p.article;
        const micro=r.area===plan.areas[1]&&r.n!=null;
        if(!(productClause||micro||r.area===root.PMSVVendingWater.area))continue;
        out.push([...prefix,r.form||p.sample,micro?'Microbiological sampling plan':'Product criterion',r.parameter,r.article,r.limit??'',r.unit??'',r.n??'',r.c??'',r.m??'',r.M??'',[r.status,r.notes].filter(Boolean).join(' · '),r.source,'']);
      }
    }
    return out;
  }

  const countRules=plan.ingredientCriteria(bean,{},true).filter(x=>x.v.spec.unit==='% by count');
  const countKeys={'Mouldy beans':'beanMould','Slaty beans':'beanSlaty','Insect-damaged beans':'beanInsect','Germinated and flat beans':'beanGermFlat'};
  const beanFields=['beanSample','beanTotal',...Object.values(countKeys)];
  function countResults(state={}){
    const integer=s=>typeof s==='string'&&/^\d{1,9}$/.test(s)?Number(s):null;
    const total=integer(state.beanTotal);
    return countRules.map(({v})=>{
      const key=countKeys[v.spec.parameter],count=integer(state[key]),max=v.spec.value;
      let status='Enter the number examined and the defect count.',percent='';
      if(total!==null&&total>0&&count!==null){
        if(count>total)status='Defect count exceeds the number examined.';
        else{
          percent=(100*count/total).toLocaleString('en-US',{maximumFractionDigits:6,useGrouping:false});
          status=count*100<=max*total?'At or below maximum':'Above maximum';
        }
      }
      return {key,parameter:v.spec.parameter,max,count:state[key]||'',percent,status,source:v.gazette};
    });
  }
  const beanSampling={
    note:'For commercial cocoa bean quality assessment, the Cacao of Excellence guide targets a 2 kg representative reference sample and takes at least 500 g from it as a test sample. Determine regulatory dispatch separately in the sampling worksheet.',
    guide:'https://www.cacaoofexcellence.org/fileadmin/Websites/CocoaOfExcellence/Resources_items/Guides_for_the%20Assessment_of_Cacao_Quality_Flavour/14Feb2025_WEB_CoEx_Guide_Cacao_Quality_Flavour-ENGLISH-March_2024.pdf',
    standard:'https://www.iso.org/standard/68203.html'
  };
  function countRows(state={}){
    return [['Sample reference','Beans examined','Defect','Beans affected','Observed % by count (rounded)','Maximum % by count','Comparison using exact counts','Official source','Commercial quality sampling guidance','Quality sampling sources'],
      ...countResults(state).map(r=>[state.beanSample||'',state.beanTotal||'',r.parameter,r.count,r.percent,r.max,r.status,r.source,beanSampling.note,beanSampling.guide+' | '+beanSampling.standard])];
  }
  root.PMSVLabGuide=Object.freeze({profiles,rows,controls,dairy,dryBasis,basisFields,basisLabels,basisResult,isIgGSource,isControlSource,referenceArea,referenceEntries,recognition,recognitionAnalytes,isRecognitionSource,bean,beanSampling,beanFields,countResults,countRows});
})(globalThis);
