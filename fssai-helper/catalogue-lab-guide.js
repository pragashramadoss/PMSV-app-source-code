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
  function method(id,form,parameter,code,locator,url,note){
    profiles.get(id).methods.push({form,parameter,code,locator,url,note});
  }

  profile(coffee,'2.10.4','Dry coffee–chicory blend','Choose ground or instant and regular or decaffeinated. Blend composition depends on both choices. The brewed drink and each incoming ingredient have separate sample identities.',coffeeManual);
  method(coffee,'Ground or instant, regular or decaffeinated','Caffeine','04A.011:2023','printed pp. 25–27',coffeeManual,'Bailey–Andrew procedure. Request the reporting basis that matches the selected blend.');
  method(coffee,'Ground or instant, regular or decaffeinated','Caffeine','04A.012:2023','printed pp. 28–30',coffeeManual,'Alternative chromatographic and spectrophotometric procedure for the same four blend forms.');
  method(coffee,'Instant blend, regular or decaffeinated','Cold-water solubility','04A.017:2023','printed p. 38',coffeeManual,'Record dissolution time at the specified water temperature for the instant sample.');

  profile(coconut,'2.3.63','Dried coconut milk','Check moisture on the powder, fat on a dry basis, free fatty acids in the extracted fat as lauric acid, and bulk density in g/mL. Trace the kernel and any carrier separately.',root.PMSVPowderStandards.products.get(coconut).gazette);
  profile(bean,'2.3.54','Whole fermented and dried cocoa beans','Use the count of examined beans for the four defect percentages, and mass for moisture. Record germinated and flat beans together, counting a bean once within this combined class.',source('food-54',29));
  profile(cocoa,'2.7.8','Cocoa mass or liquor, or pressed cake','Keep shell alone distinct from shell plus germ. Check the material, the analyte actually reported and the fat-free dry matter or alkali-free basis before using a result.',cocoaManual);
  method(cocoa,'Mass, liquor or cake','Shell and germ on fat-free dry matter','04C.031:2024','printed pp. 74–79',cocoaManual,'Request the fat-free dry-matter result. The product standard lists this separately from shell only.');
  method(cocoa,'Mass, liquor or cake','Shell on an alkali-free basis','04C.032:2024','printed pp. 80–84',cocoaManual,'The method heading names shell and germ. The standard specifies shell only on this basis. Confirm the laboratory measured shell only before comparing.');

  profile(arrow,'2.4.14','Separated and purified arrowroot starch','Establish the species and separation process. The FSSAI manual illustrates Maranta starch. The product standard also permits Curcuma, which requires its own identification evidence.',cerealManual+'#page=77');
  method(arrow,'Starch declared as Maranta arundinacea','Microscopic appearance of starch granules','03.024:2023','PDF pp. 75–77',cerealManual+'#page=77','Use the Maranta illustration as an identity reference. The method scope names cereal starches. Document suitability for this sample before issuing a result. The illustration does not establish Curcuma identity.');
  profile(egg,'2.5.3(3)','Dried hen egg white, yolk or whole egg','Use the powder table for the declared form. The adjacent beta-hydroxybutyric, lactic and succinic acid maxima apply to frozen or liquid egg products. Do not enter them as powder thresholds.',root.PMSVVeterinary.animalGazette+'#page=37');
  profile(enzyme,'FoSCoS 99.2 / 99.4','Enzyme preparation as supplied','Record the enzyme identity, activity and units, source, formulation and intended use. Match the named preparation to its permission before assigning a purity or activity result. The lysozyme and chymosin examples have separate uses.','https://fcstraining.fssai.gov.in/assets/docs/Compiled%20FPC_FoSCoS.pdf#page=9');
  profile(dairy,'2.1.23','Cow or buffalo colostrum, or its powder','Select the liquid or powder standard. The four listed dairy methods cover colostrum. For a powder result, obtain the laboratory method and evidence that it covers the dried matrix. Total protein and IgG are separate determinations.',dairyManual+'#page=326');
  for(const [code,page,parameter,note] of [
    ['121',326,'Sample preparation','Record sample identity and physical form before preparing the liquid.'],
    ['122',327,'Moisture','Report the result for the liquid sample as supplied.'],
    ['123',329,'Fat','Use the gravimetric colostrum method.'],
    ['124',331,'Total milk protein','The nitrogen-based total protein result cannot establish immunoglobulin G or lactoferrin.']
  ])method(dairy,'Liquid colostrum',parameter,'01.'+code+':2022','PDF p. '+page,dairyManual+'#page='+page,note);
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

  const headers=['Catalogue ID','Product','Assessment date','Sample or form','Reference type','Parameter','Article or method','Reference criterion','Unit','n','c','m','M','Scope and reporting instructions','Official source','Manual page or section'];
  function rows(id,date=root.PMSVVeterinary.reviewDate){
    const out=[headers];
    if(!plan.metalEdition(date))return out;
    const queue=id?null:plan.openScope(date);
    for(const [key,p] of profiles){
      if(id ? key!==id : !queue.has(key))continue;
      const prefix=[key,root.PMSVCatalogueRules.products[key].name,date];
      out.push([...prefix,p.sample,'Sample scope','Interpretation',p.article,'','','','','','',p.boundary,p.reference,'']);
      for(const m of p.methods)out.push([...prefix,m.form,'Analytical reference',m.parameter,m.code,'','','','','','',m.note,m.url,m.locator]);
      for(const r of plan.entries(key,date)){
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
  function countRows(state={}){
    return [['Sample reference','Beans examined','Defect','Beans affected','Observed % by count (rounded)','Maximum % by count','Comparison using exact counts','Official source'],
      ...countResults(state).map(r=>[state.beanSample||'',state.beanTotal||'',r.parameter,r.count,r.percent,r.max,r.status,r.source])];
  }
  root.PMSVLabGuide=Object.freeze({profiles,rows,bean,beanFields,countResults,countRows});
})(globalThis);
