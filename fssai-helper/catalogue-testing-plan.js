/* Source-linked testing rows at catalogue identity. SKU decisions remain in the product worksheet. */
(function(root) {
  'use strict';
  const E=root.PMSVCatalogueEvidence, R=root.PMSVCatalogueRules;
  const V=root.PMSVVariantComposition, P=root.PMSVMetalPanel, C=root.PMSVCropScope;
  const sourceRows=root.PMSVTestingSources,powders=root.PMSVPowderStandards;
  const headers=['Catalogue ID','Product','Review area','Article or table','Product form or sample','Parameter or decision','Applicability','Requirement or reported limit','Unit','Reporting basis, condition or next action','n','c','m','M','Official source pages'];
  const areas=['Composition and identity','Microbiology','Metals','Toxins and other contaminants','Pesticide residues','Veterinary drug residues'];
  const label=k=>String(k).replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
  const join=items=>[...new Set(items.filter(v=>v!==''&&v!==null&&v!==undefined))].join(' · ');
  function detail(v) {
    if(v==null)return '';
    if(Array.isArray(v))return v.map(detail).filter(Boolean).join(' / ');
    if(typeof v==='object')return join(Object.entries(v).map(([k,x])=>{const value=detail(x);return value && label(k)+' = '+value;}));
    return String(v);
  }
  function links(doc,pages=[]) {
    const url=E.documents[doc]?.url.split('#')[0];
    if(!url)return '';
    return pages.length?[...new Set(pages)].map(n=>url+'#page='+n).join(' | '):url;
  }
  function buildIncomingSamples(){
    const pesticide=root.PMSV_REVIEW_REGISTER.pesticideReview;
    const blend = 'coffee-chicory-mixture';
    const egg = '10-10-2-egg-powder';
    const coconutPowder = '04-04-1-coconut-milk-powder';
    const arrowroot = '06-06-2-arrowroot';
    const milk = '04-04-1-coconut-milk-non-dairy';
    const cream = '04-04-1-coconut-cream-non-dairy';
    const scope = new Map([
      ['purified-vending-water', ['Point of sale', 'Identify the dispensing point and collect its treatment schematic and sample record. Use the IS 10500 worksheet for vending water. A separate CTR citation must cover water dispensed in this manner.']],
      [blend, ['Blend and inputs', 'Obtain the finished blend specification, its ground or instant form and the sampling point. Keep the coffee and chicory intake reports attached to their respective lots. Find a provision covering the blend as sold.']],
      [coconutPowder, ['Extracted and dried product', 'Trace the kernel lot through extraction and drying. Identify any carriers on the formula and obtain a provision for the finished coconut milk powder.']],
      ['04-04-2-cocoa-beans', ['Fermented and dried seed', 'Confirm whole fermented, dried Theobroma cacao beans on the specification. Seek a provision that includes this commodity and preparation.']],
      ['05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake', ['Processed cocoa', 'Distinguish ground mass or liquor from pressed cake on the process record. Check the sampled material against each named cocoa article and its reporting basis.']],
      ['06-06-2-arrowroot', ['Separated starch', 'Record the rhizome species, starch separation and drying. Seek a provision for purified starch or documented coverage of the processed fraction.']],
      [egg, ['Dried animal product', 'Identify dried white, yolk or whole egg. Keep the pre-drying shell-free egg report with its intake lot and obtain the specific regulatory basis for interpreting a powder result.']],
      ['99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc', ['Preparation and use', 'Obtain the enzyme name, activity, preparation specification and intended food process. Check whether the exact preparation belongs in the processing-aid schedule or the separate category 99.2.']],
      ['100-100-cow-or-buffalo-colostrum-and-colostrum-products', ['Postpartum secretion', 'Record species, postpartum collection window and whether the sample is colostrum or its powder. Obtain explicit support for the veterinary or contaminant article on that matrix.']],
      ['100-100-royal-jelly', ['Bee secretion', 'Obtain the beekeeper feeding record, marketed form and lot trace. Seek a provision covering royal jelly for the target residue. A honey report identifies a different sample.']]
    ]);

    const pdf = (doc, page) => links(doc,[page]);
    const footnote = pesticide.sources.gazette + '#page=51';
    const coffee = 'Separately sampled raw coffee beans';
    const chicory = 'Separately sampled dried or roasted chicory';
    const eggs = 'Separately sampled shell-free whole hen eggs before drying';
    const kernel = 'Separately sampled coconut before processing';
    const water = 'Separately sampled raw coconut water before addition';
    function metal(key, parameter, form) {
      const [, limit, page] = root.PMSVMetalPanelData.rows[key];
      return {area:'Metals', article:'CTR 2.1.1(2)', form, parameter, limit, unit:'mg/kg',
        notes:'Use the named solid ingredient as sampled. Record the intake lot and the mass-based laboratory report.', source:pdf('ctr-3',page)};
    }
    function pesticideRow(serial, article, form) {
      const group = pesticide.groups.find(g => g.serial === serial);
      const [name, value, page, basis] = group.rows.find(r => r[0] === article);
      const deferred = value === '$';
      return {area:'Pesticide residues', article:'CTR 2.3.1 · serial ' + serial, form, parameter:group.printed,
        limit:deferred ? '' : value, unit:deferred ? '' : 'mg/kg',
        notes:deferred ? 'Report elemental copper. The $ footnote refers to the applicable metal entry in CTR 2.1. Identify that entry and its basis before comparing.'
          : ['The named commodity is ' + name + '.', basis && basis+'.', 'Match the printed residue definition, the sampling stage and the lot. Retain the reported mass basis.'].filter(Boolean).join(' '),
        source:[pesticide.sources.gazette + '#page=' + page, deferred ? footnote : pesticide.sources.scope + '#page=1'].join(' | ')};
    }
    const ota = root.PMSVCropScopeData.rows.C23;
    const coconutRows = [43,44].map(serial => pesticideRow(serial, 'Coconut', kernel));
    const waterRow = pesticideRow(82, 'Coconut Water', water);
    function rawPesticide(serial,article,form){
      const row=pesticideRow(serial,article,form);
      if([13,23].includes(serial))row.notes+=' Serials 13 and 23 have overlapping residue definitions. Match the reported analytes and avoid summing the two limits.';
      if(serial===13)row.notes+=' Benomyl is banned for use in India.';
      if(serial===53)row.notes+=' Dichlorvos is listed as banned for use in India. A residue entry does not authorise pesticide use.';
      return row;
    }
    const rhizome='Separately sampled raw Maranta arundinacea rhizome';
    const intake = new Map([
      [arrowroot, [...['Pb130','Cd20'].map((key,i) => ({
        ...metal(key,['Lead','Cadmium'][i],rhizome),
        notes:'Confirm the botanical identity and sample the raw rhizome before extraction. Record the intake lot and the as-sampled mass basis. Codex VR 0573 identifies the commodity. The maximum comes from the Indian root-and-tuber vegetable entry.'
      })), ...[13,23,53,114].map(serial=>rawPesticide(serial,'Vegetables',rhizome))]],
      [blend, [metal('Cu5','Copper',coffee), metal('Cu5','Copper',chicory), metal('As19','Arsenic',chicory),
        {area:'Toxins and other contaminants', article:'CTR 2.2.1(1) · serial 4', form:coffee, parameter:'Ochratoxin A',
          limit:String(ota.limit), unit:ota.unit, notes:'Assess the separately sampled coffee lot against the coffee entry in force from 1 April 2025.', source:pdf(ota.doc,ota.page)},
        {...root.PMSVCoffee.rawBeanRow(blend),area:'Pesticide residues'}]],
      [egg, [1,13,23,67,71,129,144,145,150].map(serial => rawPesticide(serial,'Eggs',eggs))],
      [coconutPowder, coconutRows], [milk, [...coconutRows,waterRow]], [cream, [...coconutRows,waterRow]]
    ]);
    const descriptions = new Map([
      [arrowroot, 'These references cover raw Maranta arundinacea. The finished product under 2.4.14(1) is separated, purified starch. Keep the species certificate and the raw intake report with that lot. Curcuma and finished starch require separate scope evidence.'],
      [blend, 'Match each intake result to raw coffee beans or dried or roasted chicory. Assess the finished blend separately.'],
      [egg, 'These pesticide references cover separately sampled shell-free whole eggs. A dried powder, separated white or separated yolk needs its own assessment.'],
      [coconutPowder, 'The powder is made by drying extracted coconut milk. The pesticide table sends the two coconut copper entries to CTR 2.1. Coconut water is a distinct commodity.'],
      [milk, 'Check the actual formula. Use the coconut-water entry only for an independently sampled raw coconut-water lot before addition.'],
      [cream, 'Check the actual formula. Use the coconut-water entry only for an independently sampled raw coconut-water lot before addition.']
    ]);
    const identityPages = new Map([[arrowroot,pdf('baser02-1',83)+' | https://www.fao.org/fao-who-codexalimentarius/sh-proxy/fr/?lnk=1&url=https%253A%252F%252Fworkspace.fao.org%252Fsites%252Fcodex%252FStandards%252FCXA%2B4-1989%252FCXA_004e.pdf#page=82'],[blend,pdf('baser02-1',121)],[egg,root.PMSVVeterinary.animalGazette+'#page=38'],
      [coconutPowder,pdf('food-20',17)],[milk,pdf('chapter-4',77)],[cream,pdf('chapter-4',79)]]);
    function rows(id) {
      return (intake.get(id)||[]).map(r => ({...r, sampleRole:'ingredient', status:r.status||(r.limit?'Incoming ingredient reference only':'Identify the applicable metal article'),
        source:r.source+' | '+identityPages.get(id)}));
    }
    return {scope,descriptions,rows};
  }
  const incomingSamples=buildIncomingSamples();
  const routeIds={
    salt:root.PMSVRecipeSamples.salt,
    polyols:P.polyolId,
    enzyme:'99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc',
    cocoa:'05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake',
    sorbitol:'11-11-6-sorbitol'
  };
  const appendixC='https://fssai.gov.in/docs/food-law/regulations/compendium/food-products-standards/Appendix%20C(2).pdf#page=40';
  const categories='https://fcstraining.fssai.gov.in/assets/docs/Compiled%20FPC_FoSCoS.pdf';
  const eggExportOrder='https://www.eicindia.gov.in/WebApp1/resources/PDF/Order_Egg_Products1.pdf';
  const eggExportAmendment='https://www.eicindia.gov.in/WebApp1/resources/PDF/SO%203225%20%28E%29%2015%20July%202025_Egg%20%20Egg%20Products.pdf';
  const enzymeGazette='https://www.fssai.gov.in/upload/notifications/2025/07/6879d8af12522Palm%20Oil_FPSFA_Notification.pdf';
  const scopedArea='Export and processing-aid references';
  const exportPages=new Set([eggExportOrder+'#page=6',eggExportOrder+'#page=7',eggExportAmendment+'#page=3']);
  const isExportSource=url=>exportPages.has(url);
  const eggExportId='10-10-2-egg-powder';
  const exportScope='Indian export order for finished egg powder';
  const enzymeScope='Separate Appendix C Table 11A processing-aid preparation';
  const referenceSets=new Map();
  function eggExportGroup(section,unit,items){
    const page=section===1?6:7;
    return items.map(([parameter,value,remark=''])=>({
      article:'S.O. 4368(E), clause (e)('+section+')',parameter,value,unit,
      role:'Export consignment',form:'Finished egg powder intended for export from India',status:exportScope,
      notes:['Match the powder lot, residue definition, reporting units and destination requirements. A stricter importing-country limit applies.',remark].filter(Boolean).join(' '),
      source:[eggExportOrder+'#page='+page,eggExportOrder+'#page=7',...(section===1?[eggExportAmendment+'#page=3']:[]),
        ...(parameter==='Colistin'?['https://fssai.gov.in/upload/uploadfiles/files/2_Notification%20dt%2017_10_2024.pdf#page=17']:[])].filter((s,i,a)=>a.indexOf(s)===i).join(' | ')
    }));
  }
  referenceSets.set(eggExportId,[
    ...eggExportGroup(1,'µg/kg',[
      ['Erythromycin','150','The English order prints “Erythomycin”. Confirm the reported analyte identity.'],
      ['Tylosin','200'],['Lincomycin','50'],['Neomycin','500'],
      ['Colistin','300','Historical export-table value. FSSAI CTR 2.3.2(2) prohibits use in poultry and egg production and gives an EMRL of 0.001 mg/kg there. Resolve with the competent authority before interpreting finished powder.'],
      ['Chlortetracycline','200'],['Oxytetracycline','200'],['Tetracycline','200'],['Spectinomycin','200'],['Tiamulin','1000'],['Josamycin','200'],['Oxolinic acid','50']
    ]),
    ...eggExportGroup(2,'µg/kg',[['Piperazine','2000'],['Flubendazole','400'],['Amprolium','1000']]),
    ...eggExportGroup(3,'mg/kg',[
      ['Aldrin and dieldrin','0.02','Combined, expressed as dieldrin.'],['Chrorthalonil (as printed)','0.01','Verify the substance identity against an authoritative specification before comparison.'],
      ['DDT','0.05','Combined result for all isomers.'],['Dicofol','0.05','Sum of p,p′ and o,p′ isomers.'],
      ['Endosulfan','0.005','Include alpha and beta isomers and endosulfan sulphate, expressed as endosulfan.'],
      ['Endrin','0.005'],['HCH','0.03','Combined for all isomers. Also check alpha at 0.02 mg/kg and beta at 0.01 mg/kg. Review the separate lindane entry when gamma-HCH is present.'],
      ['Lindane (gamma-HCH)','0.1','Review the combined HCH entry as well.'],['Methoxychlor','0.01'],['PCB','0.01','Establish the applicable congener definition with the destination authority.']
    ]),
    ...eggExportGroup(4,'',['Cypermethrin','Deltamethrin','Permethrin','Alpha-cypermethrin'].map(n=>[n,'0.05','The pyrethroid table omits the unit. Confirm it from the competent authority before comparison.']))
  ]);
  referenceSets.set(routeIds.enzyme,[
    ['Lead','5','mg/kg','Maximum in the preparation.'],
    ['Salmonella spp.','Absent','in 25 g','Presence or absence in the stated test portion.'],
    ['Total coliforms','30','per g','Maximum count per gram.'],
    ['Escherichia coli','Absent','in 25 g','Presence or absence in the stated test portion.'],
    ['DNA','Absent','','Applies to preparations from microbial sources. The footnote supplies no numerical limit or test portion.'],
    ['Antibiotic activity','Absent','','Applies to preparations from microbial sources. The footnote supplies no numerical limit or test portion.']
  ].map(([parameter,value,unit,note])=>({article:'FPSFA Appendix C, Table 11A, # footnote',parameter,value,unit,
    role:'Separate processing-aid preparation',form:'Supplied preparation matching a marked Table 11A entry',status:enzymeScope,
    notes:'Verify the exact enzyme, source, intended use and marked table entry. Assess the supplied processing aid. '+note,
    source:enzymeGazette+'#page=17 | '+appendixC.split('#')[0]+'#page=40'})));
  function scopedReferences(id,date=root.PMSVVeterinary.reviewDate){
    return metalEdition(date)?referenceSets.get(id)||[]:[];
  }
  function scopeReferenceExport(id,date=root.PMSVVeterinary.reviewDate){
    const out=[['Catalogue ID','Product','Assessment date','Scope','Sample','Parameter','Published reference','Published unit','Conditions','Provision','Official sources']];
    for(const key of referenceSets.keys()){
      if(id&&id!==key)continue;
      for(const r of scopedReferences(key,date))out.push([key,R.products[key].name,date,r.status,r.form,r.parameter,r.value,r.unit,r.notes,r.article,r.source]);
    }
    return out;
  }
  const lysozymeSources={
    classification:categories+'#page=9',
    preservative:appendixC.replace('#page=40','#page=75'),
    cheese:'https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20A%284%29.pdf',
    controlAgent:appendixC.replace('#page=40','#page=6')
  };
  const lysozymeReferences=[
    {article:'Appendix A, category 1.6.2',form:'Ripened cheese with lysozyme (INS 1105)',parameter:'Lysozyme use level',limit:'GMP',
      notes:'Match the food category and document the amount needed for the preservative function.',source:lysozymeSources.cheese+' | '+lysozymeSources.preservative},
    {article:'CTR 2.1.1(2), arsenic',form:'Separately supplied lysozyme (INS 1105) used as a preservative',parameter:'Arsenic',limit:'3.0',unit:'mg/kg',
      notes:'Use the dry matter basis for the preservative lot. Verify the specification, documented use as a preservative and laboratory basis. The cheese has a separate assessment.',
      source:links('ctr-3',[25])+' | '+lysozymeSources.preservative+' | '+lysozymeSources.cheese},
    {article:'Appendix C, Table 5, row 2',form:'Alcoholic beverages including low-alcohol and alcohol-free counterparts',parameter:'Lysozyme as microbial control agent',limit:'GMP',
      notes:'Confirm the beverage and its processing-aid use. FoSCoS 99.2 excludes enzymes already listed under the processing-aid or nutraceutical rules.',
      source:lysozymeSources.controlAgent+' | '+lysozymeSources.classification}
  ];
  const sorbitolSource=links('chapter-18',[88,89]);
  const routeNotes=new Map([
    [routeIds.salt,[
      {article:'2.9.30(6)(2)(b)',form:'Finished salt substitute',parameter:'Diluent identity and finished lot',status:'Document the approved recipe',
        notes:root.PMSVRecipeSamples.firstSource(routeIds.salt).text,source:links('food-56',[6])+' | '+links('ctr-3',[29])},
      {article:'2.9.30(6)(5)',form:'Retail salt substitute',parameter:'Product name and cation declarations',status:'Check the label against the formula',
        notes:'Use the prescribed name “low sodium salt substitute” or “low sodium dietetic salt”. Declare sodium, potassium, calcium, magnesium, ammonium and choline per 100 g of mixture. The sodium maximum is 120 mg per 100 g of finished mixture.',source:links('food-56',[6])}
    ]],
    [routeIds.polyols,[
      {article:'FoSCoS 11.6 / Appendix A',form:'Single polyol or preparation',parameter:'Identify the named additive and permitted use',status:'Obtain the specification and formula',
        notes:'Record the additive name, INS number, carriers, intended food category and permitted use. This 11.6 catalogue entry excludes individually standardized products. Check a blend against its actual ingredients and use.',source:categories+'#page=6 | https://fcstraining.fssai.gov.in/standard-product'},
      {article:'FPSFA 3.2.16(1) / CTR 2.1.1(2)',form:'Confirmed sorbitol powder',parameter:'Separate standardized sorbitol entry',status:'Open the named sorbitol worksheet',
        notes:'Use the Sorbitol entry for a confirmed lot of standardized sorbitol powder. Its specification gives lead 1 mg/kg, arsenic 3 mg/kg and nickel 2 mg/kg as maxima. A different polyol or blend needs its own source.',source:sorbitolSource+' | '+links('ctr-3',[22,25,28])}
    ]],
    [routeIds.enzyme,[
      {article:'FoSCoS 99.2 / 99.4',form:'Supplied preparation',parameter:'Enzyme identity and regulatory classification',status:'Check the named use in FSSR',
        notes:'Record the enzyme identity, preparation specification, intended technological purpose and food application. Category 99.2 excludes products classified under the processing-aid or nutraceutical regulations. Match the applicable source and application before choosing a specification.',source:categories+'#page=9'},
      {article:'Appendix C, Table 11A, row 51',form:'Listed processing-aid preparation',parameter:'Chymosin classification example',status:'Use the processing-aid entry when identity and use match',
        notes:'Row 51 lists chymosin for milk coagulation in paneer and cheese at GMP. Match the source, preparation and application to the row. Its table note gives a lead maximum of 5 mg/kg on the covered enzyme preparation. The generic 99.2 product and the finished dairy food each require their own assessment.',source:appendixC+' | '+categories+'#page=9'}
    ]],
    [routeIds.cocoa,[
      {article:'Appendix C, Table 12, row 2',form:'Cocoa mass or cake',parameter:'Ammonium carbonate (INS 503(i)) for pH control',status:'Check actual use and good manufacturing practice',
        notes:'For this use the residue column specifies GMP. Record the processing-aid identity, purpose and use record. The entry provides no numerical mg/kg limit for the cocoa sample.',source:appendixC}
    ]]
  ]);
  function routeSummary(id){
    return (routeNotes.get(id)||[]).map(r=>r.notes+' '+r.source).join(' | ');
  }
  const sugarSources={
    [P.misriId]:links('baser02-1',[97]),[P.syrupId]:links('baser02-1',[98]),[P.trehaloseId]:links('food-13',[39])
  };
  // Keep the stored source rows as the single definition of the eight numerical criteria.
  const sugarCriteria=new Map();
  for(const id of Object.keys(sugarSources)){
    const standard=R.standards[E.products[id].standard];
    const rows=id!==P.trehaloseId?standard.criteria:sourceRows.products[id].map(k=>sourceRows.rows[k])
      .filter(r=>r[4]==='%'&&/^≤ [0-9.]+$/.test(r[3])).map(r=>({spec:{parameter:r[1],operator:'<=',value:r[3].slice(2),unit:r[4]}}));
    sugarCriteria.set(id,rows.map((v,i)=>({v:{...v,compare:true,gazette:sugarSources[id]},i})));
  }
  const catechuId='04-04-1-catechu-edible',beanId='04-04-2-cocoa-beans';
  const ingredients=new Map([
    [P.silverId,{doc:'food-70',pages:[3],note:'Inspect food-grade silver leaf for uniform thickness and absence of creases and folds. Verify that no material of animal origin was used at any stage. Weigh the leaf alone and confirm silver fineness.'}],
    [catechuId,{doc:'baser02-1',pages:[128],note:'Identify the dried aqueous extract of Acacia catechu heartwood. Check for foreign material. Record ordinary catechu or Bhatti Katha before comparing acid-insoluble ash.'}],
    [beanId,{doc:'food-54',pages:[28,29],note:'Inspect properly fermented and dried whole Theobroma cacao beans for characteristic shell and absence of live insects. Use a lengthwise cut for internal mould and slaty colour. Apply bean defect percentages by count. Cocoa-powder limits require a different sample.'}]
  ]);
  for(const [id,p] of ingredients){
    p.source=links(p.doc,p.pages);
    p.criteria=R.standards[E.products[id].standard].criteria.map(({spec},i)=>{
      const {requires_actual_subtype,replaces_general_acid_insoluble_ash_limit,applies_to_r12,...definition}=spec;
      const subtype=requires_actual_subtype?(replaces_general_acid_insoluble_ash_limit?'bhatti':'ordinary'):'';
      const gazette=links(p.doc,[id===beanId&&i>=3?29:p.pages[0]]);
      const basis=id===catechuId?['Dry at 100°C to constant mass.','Use boiling water and dry residue at 100°C.','Use 90% alcohol and dry residue at 100°C.','Dry basis.','Dry basis, ordinary catechu only.','Dry basis, Bhatti Katha only.'][i]:
        id===beanId?(i===0?'Moisture by mass.':i===4?'Combined count of germinated and flat beans.':'Percentage of examined beans by count.'):
        i===0?'Mass per unit area of the leaf alone.':'Parts of silver per 1,000.';
      return {i:'ingredient-'+i,v:{compare:true,gazette,spec:{...definition,analytical_basis:basis}},subtype};
    });
  }
  function ingredientCriteria(id,state,allForms=false){
    return (ingredients.get(id)?.criteria||[]).filter(c=>!c.subtype||c.subtype===state?.ingredientSubtype||allForms&&!state?.ingredientSubtype);
  }
  const testKeys=['parameter','operator','value','unit','min','max','analytical_basis','source_clause','source_pages','kind'];
  function specInfo(s) {
    const symbol={'<=':'≤','>=':'≥','<':'<','>':'>','=':'='}[s.operator];
    let limit=join([s.operator,detail(s.value)]);
    if(symbol && s.value!=null)limit=symbol+' '+detail(s.value);
    if(s.operator==='range' && s.min!=null && s.max!=null)limit=s.min+' to '+s.max;
    return {limit,unit:s.unit,notes:join([detail(s.analytical_basis),...Object.entries(s)
      .filter(([k])=>!testKeys.includes(k)).map(([k,v])=>detail(v) && label(k)+' = '+detail(v))])};
  }
  const clean=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function cheeseForm(product,form){
    const name=clean(product), v=clean(form), key=name.replace(/ cheese$/,'');
    if(name==='mozzarella cheese')return false; // Its separate table depends on fat in dry matter and moisture class.
    if(name==='cottage cheese and creamed cottage cheese')return ['cottage cheese','creamed cottage cheese'].includes(v);
    if(name==='cream cheese rahmfrischkase')return v==='cream cheese';
    if(name==='emmental or emmentaler cheese')return v==='emmental';
    if(name==='processed cheese')return v.startsWith('processed cheese ')&&!v.startsWith('processed cheese spread');
    if(name==='processed cheese spread')return v.startsWith('processed cheese spread');
    if(name==='provolone cheese')return v==='smoked provolone'||v==='unsmoked provolone';
    return v===name || v===key || v.replace(/^\d+ /,'')===key;
  }
  function relevantForm(article,product,name){
    const p=clean(product),f=clean(name);
    if(article==='2.1.2')return p===f;
    if(article==='2.1.17')return cheeseForm(product,name);
    if(article==='2.1.8')return p.includes('anhydrous')?f.includes('anhydrous'):['milk fat','butter oil'].includes(p)?f==='milk fat butter oil':f===p;
    if(article==='2.3.61')return p.includes('puree')===f.includes('puree');
    if(article==='2.5.2(2A)')return p.split(' ').some(word=>f.split(' ').includes(word));
    return true;
  }
  function percentage(key,value,additionalBasis) {
    const parts=key.split('_');
    if(!parts.includes('pct'))return null;
    const op=parts.find(p=>['min','max','lt','gt','range'].includes(p));
    if(!op || !(typeof value==='number' || (op==='range' && Array.isArray(value) && value.length===2)))return null;
    const bases=[['moisture_fat_free','moisture- and fat-free basis'],['dry_matter','dry matter'],['total_mass','total product mass'],
      ['total_weight','total product weight'],['dry','dry basis'],['db','dry basis']];
    let param='_'+key+'_',basis=additionalBasis||'';
    for(const [word,meaning] of bases){
      if(param.includes('_'+word+'_')){if(!basis)basis=meaning;param=param.replace('_'+word+'_','_');break;}
    }
    const name=param.split('_').filter(p=>p && p!=='pct' && p!==op).join(' ').replace(/ in$/,'');
    return {parameter:label(name),limit:op==='range'?value.join(' to '):({min:'≥',max:'≤',lt:'<',gt:'>'})[op]+' '+value,unit:'%',notes:basis};
  }
  const coffeePages={'2.10.2':{roasted_ground:[5],decaffeinated_roasted_ground:[5,6],soluble_coffee:[6],decaffeinated_soluble:[6,7]},
    '2.10.4':{regular_roasted_ground:[7,8],instant:[8],decaffeinated_roasted_ground:[8,9],decaffeinated_instant:[9,10]}};
  function composition(id,add,state,date) {
    const product=E.products[id],std=R.standards[product.standard],anchor=E.standards[product.standard];
    const route=R.products[id];
    if(anchor && id.startsWith('102-')){
      const item=root.PMSV_CATALOGUE.find(x=>x.id===id);
      add({area:areas[0],article:'Ayurveda Aahara recipe',parameter:'Finished recipe and component identity',status:'Confirm recipe authority and component scope',
        notes:item.nonTransfer||'Establish the recipe identity and the role of the dairy ingredient before selecting its standard.',
        source:[...(product.routeAnchors||[]).map(([doc,pg])=>links(doc,pg)),links(anchor.doc,anchor.p)].join(' | ')});
      return;
    }
    if(!anchor || product.scope!=='product_standard'){
      const refs=(product.routeAnchors||[]).map(([doc,pg])=>links(doc,pg));
      if(anchor)refs.unshift(links(anchor.doc,anchor.p));
      if(!refs.length)refs.push(...(product.routeDocs||[]).map(doc=>links(doc)));
      add({area:areas[0],article:product.standard.split('#')[1]||label(product.scope),parameter:'Applicable product or ingredient specification',
        status:'Confirm regulatory route',notes:join([route.routeFinding,...(route.checks||[]).map(detail),route.routeContext]),source:refs.join(' | ')});
      if(!anchor||product.scope!=='food_additive_identity_purity')return;
    }
    const base={area:areas[0],article:product.standard.split('#')[1],source:links(anchor.doc,anchor.p),form:std.name};
    if(sugarCriteria.has(id))base.source=[sugarSources[id],base.source].join(' | ');
    const worksheet=root.PMSVCatalogueWorksheets;
    const measured=state?.result?.trim() && worksheet.enabledCriteria(id,state).find(({i})=>String(i)===state.criterion)?.v.spec;
    const operative=measured && product.gazetteFindings?.find(g=>g.parameter===measured.parameter&&
      g.clause===measured.source_clause&&g.effective&&g.effective===measured.effective_from);
    function push(row,spec){
      if(measured && spec===measured){
        const notes=join([row.notes,'Reported result: '+state.result.trim()+' '+(spec.unit||''),
          spec.analytical_basis&&'Analytical basis: '+spec.analytical_basis,state.reference?.trim()&&'Sample or SKU: '+state.reference.trim(),
          state.compReport?.trim()&&'Report: '+state.compReport.trim(),worksheet.resultText(id,state)]);
        add({...base,...row,notes});
      }else add({...base,...row});
    }
    const ingredient=ingredients.get(id);
    if(ingredient){
      push({parameter:'Sample identity and physical checks',status:'Verify sample identity',notes:ingredient.note,source:ingredient.source});
      for(const {v,subtype} of ingredientCriteria(id,state,true)){
        push({parameter:v.spec.parameter,...specInfo(v.spec),form:subtype==='bhatti'?'Bhatti Katha':subtype==='ordinary'?'Ordinary catechu':std.name,
          status:subtype&&!state?.ingredientSubtype?'Select the sampled catechu subtype':'Source-edition criterion',source:v.gazette},v.spec);
      }
      return;
    }
    const coffee=root.PMSVCoffee;
    if(coffee.profiles.has(id)){
      const selected=coffee.selected(id,state);
      for(const form of selected?[selected]:coffee.profiles.get(id)){
        for(const {spec,source,review} of form.rows){
          const numeric=form.criteria.some(c=>c.v.spec===spec);
          push({form:form.name,parameter:spec.parameter,...specInfo(spec),source,
            status:review?'Confirm the reporting basis':numeric?(selected?'Selected form criterion':'Select the sampled form'):'Inspect solubility under the cited conditions',
            ...(review?{limit:'',notes:review}:{})},spec);
        }
        if(!form.rows.length)push({form:form.name,parameter:'Raw bean identity',status:'Verify product identity',source:form.source,
          notes:'Match the green or unroasted Coffea seed and species under 2.10.2(1). The roasted and soluble analytical tables have different scopes.'});
      }
      if(id===coffee.blend)push(coffee.labelRow(date,state));
      return;
    }
    const powder=powders?.products.get(id);
    if(powder){
      for(const {spec,...row} of powder.rows){
        const info=spec?{parameter:spec.parameter,...specInfo(spec)}:{};
        push({...info,...row,form:powder.name},spec);
      }
      return;
    }
    for(const g of product.gazetteFindings||[])push({article:g.clause,parameter:g.parameter,limit:g.result,status:'Gazette finding',notes:join([g.scope,g.effective && 'Effective '+g.effective]),source:links(g.document,g.pages)},g===operative?measured:undefined);
    if(sourceRows.products[id]){
      for(const key of sourceRows.products[id]){
        const [form,parameter,status,limit,unit,notes,article,doc,pages,kind,extra]=sourceRows.rows[key];
        const sugar=sugarCriteria.get(id)?.find(item=>item.v.spec.parameter===parameter);
        const source=[sugarSources[id],links(doc,pages),...extra].filter(Boolean).join(' | ');
        push({area:kind==='micro'?areas[1]:areas[0],form,parameter,status:sugar?'Source-edition comparison available':status,limit,unit,notes,article,source},sugar?.v.spec);
      }
      return;
    }
    if(base.article==='2.3.37'||base.article==='2.3.39'){
      const curried=base.article==='2.3.39';
      push({parameter:'Thermal-centre temperature at completion of freezing',form:route.name,limit:'−18',unit:'°C',
        status:curried?'Resolve printed process wording':'Named process requirement',
        notes:curried?'The cited edition says “after thermal sterilization”. Confirm the applicable process wording before assessing a lot.':'Check at completion of freezing after thermal stabilization.',
        source:links(anchor.doc,curried?[53]:[40,41])});
      return;
    }
    if(root.PMSVCatalogueWorksheets.hasFocusedCalculator(id)){
      push({parameter:'Product-specific composition and pack criteria',status:'Use the product calculator',notes:'Use the dedicated calculator for the selected product and pack. Review its linked sources and applicable conditions.'});
      return;
    }
    const profile=V.profileFor(id);
    if(profile){
      const chosen=state&&V.selected(id,state);
      for(const form of chosen?[chosen]:profile.forms){
        for(const r of form.rows){
          const condition=chosen?V.applicability(r,state.compSweetener):'';
          const limit=r.operator==='range'?r.min+' to '+r.max:({'<=':'≤','>=':'≥'})[r.operator]+' '+r.value;
          const status=chosen?(condition||'Selected product variant'):(r.conditional?'Confirm sweetener formulation':'Select declared variant');
          push({form:form.name,parameter:r.parameter,status,limit:condition?'':limit,unit:condition?'':r.unit,
            notes:join([r.analytical_basis,r.conditional?'Exclude when only artificial sweetener is used.':'',profile.note||V.note(profile.kind)]),source:r.source||links(anchor.doc,profile.pages)},r);
        }
        for(const check of form.checks||[])push({form:form.name,...check});
      }
      return;
    }
    const unresolved=new Set((product.qualityCrosschecks||[]).filter(([,x])=>x[5]==='different numerical values').map(([,x])=>x[0]));
    const checked=new Set(root.PMSVCatalogueWorksheets.enabledCriteria(id).map(({i})=>i));
    const gazetteNames=new Set((product.gazetteFindings||[]).map(g=>g.parameter.toLowerCase()));
    let count=0;
    function criterion(s,status,form=std.name,defaultSource=base.source) {
      const differs=unresolved.has(s.parameter);
      const operative=gazetteNames.has(s.parameter.toLowerCase());
      const review=s.source_question || s.automatic_comparison_blocked || differs || operative;
      const info=specInfo(s);
      const grainMicro=(base.article.startsWith('2.4.13(')||['2.4.11(1)','2.4.11(2)'].includes(base.article))&&grainMicroNames.has(s.parameter);
      const grainPages=base.article==='2.4.11(1)'?[35]:base.article==='2.4.11(2)'?[36,37]:anchor.p;
      push({...info,...(grainMicro?{area:areas[1]}:{}),form,parameter:s.parameter,status:review?'Resolve source before use':status,
        notes:join([info.notes,differs?'Chapter and monograph give different numbers.':'',operative?'Use the Gazette finding above for its named scope.':'',anchor.basis]),
        source:grainMicro?links(anchor.doc,grainPages).replaceAll('https://www.fssai.gov.in/','https://fssai.gov.in/'):Array.isArray(s.source_pages)&&s.source_pages.every(n=>Number.isInteger(n)&&n>0&&n<=E.documents[anchor.doc].pages)?links(anchor.doc,s.source_pages):defaultSource},operative?undefined:s);
      count++;
    }
    std.criteria.forEach((row,i)=>criterion(row.spec,checked.has(i)?'Source-edition comparison available':'Confirm article and conditions'));
    const variants=[std.sections.composition_by_form,std.sections.variants].filter(Array.isArray);
    const seen=new Set();
    for(const list of variants)for(const form of list){
      if(!form || typeof form!=='object')continue;
      const key=JSON.stringify(form);
      if(seen.has(key))continue;
      seen.add(key);
      const name=form.variant||form.name||form.type||std.name;
      if(typeof name!=='string'||!relevantForm(base.article,route.name,name))continue;
      if(base.article==='2.1.2'){
        for(const [k,p,op] of [['milk_fat_min_pct','Milk fat','≥'],['milk_fat_max_pct','Milk fat','≤'],['snf_min_pct','Milk solids-not-fat','≥']]){
          if(form[k]!=null){push({form:name,parameter:p,limit:op+' '+form[k],unit:'% m/m',status:'Named milk class',
            notes:'Class composition table at point of sale. See the mixed-milk note for contravention.',source:links(anchor.doc,[9,10])});count++;}
        }
        continue;
      }
      if(form.parameter){criterion(form,'Confirm article and conditions',name);continue;}
      if(Array.isArray(form.composition))for(const s of form.composition)if(s?.parameter)criterion(s,'Confirm variant and conditions',name);
      const entries=Object.entries(form).filter(([k])=>!['variant','name','type','composition'].includes(k));
      if(!entries.length)continue;
      const veterinary=root.PMSVVeterinary;
      if(id===veterinary.eggPowderId){
        const gazette=veterinary.animalGazette;
        for(const [k,v] of entries){
          const basic=percentage(k,v),ph=k==='pH_min';
          if(!basic&&!ph)continue;
          const conflict=k==='protein_min_pct'&&name==='Dried whole egg';
          const pages=conflict?[15,38]:k==='moisture_max_pct'?[37]:k==='total_solids_min_pct'?[37,38]:[38];
          push({form:name,parameter:ph?'pH':basic.parameter,limit:conflict?'':ph?'≥ '+v:basic.limit,unit:ph||conflict?'':basic.unit,
            status:conflict?'Resolve Gazette language discrepancy':'Confirm variant and conditions',notes:conflict?veterinary.eggProteinNote:'Dried hen egg product, FPSFA 2.5.3(3).',
            source:pages.map(page=>gazette+'#page='+page).join(' | ')});
          count++;
        }
        continue;
      }
      const qualifier=entries.filter(([k,v])=>!percentage(k,v)).map(([k,v])=>label(k)+' = '+detail(v));
      const pct=entries.map(([k,v])=>percentage(k,v,form[k.split('_max_pct')[0]+'_basis'])).filter(Boolean);
      if(pct.length)for(const item of pct){
        push({...item,form:name,status:'Confirm variant and conditions',notes:join([item.notes, ...qualifier, anchor.basis])});count++;
      }else{
        push({form:name,parameter:'Variant specifications',status:'Read variant table',notes:anchor.basis,limit:join(qualifier)});count++;
      }
    }
    if(base.article==='2.1.2'){
      for(const spec of std.sections.other_limits||[]){
        const lactose=/lactose/i.test(spec.parameter);
        if(lactose && !/lactose/i.test(route.name))continue;
        criterion(spec,lactose?'Select declared variant':'Named milk article',lactose?spec.parameter:route.name,links(anchor.doc,lactose?[9]:[10]));
      }
      if(/lactose/i.test(route.name))push({parameter:'Fat and solids-not-fat of the starting milk',status:'Identify base milk class',
        notes:'Apply the fat and solids-not-fat requirements of the milk used to prepare the product.',source:links(anchor.doc,[9,10])});
    }
    for(const [tableName,table] of Object.entries(std.testTables||{})){
      if(tableName==='mozzarella_table' && clean(route.name)!=='mozzarella cheese')continue;
      const cp=coffeePages[base.article]?.[tableName];
      for(const row of Array.isArray(table)?table:[table]){
        if(!row)continue;
        if(row.parameter && row.operator){criterion(row,'Confirm variant and conditions',cp?label(tableName)+' · '+std.name:std.name,
          cp?links(anchor.doc,cp):base.source);continue;}
        if(tableName==='fruit_juice_table_r9'){
          const source=links(anchor.doc,row.source_pages);
          const info={form:row.fruit,status:'Confirm fruit and juice identity',notes:row.scope,source};
          push({...info,parameter:'Total soluble solids',limit:'≥ '+row.tss_min_degree_Brix,unit:'°Brix'});
          push({...info,parameter:'Acidity',limit:row.acidity_operator+' '+row.acidity_value_pct,unit:'%',notes:join([row.acidity_basis,row.scope])});
          count+=2;continue;
        }
        const form=row.name||row.designation||std.name;
        const params=typeof row==='object'?Object.entries(row).filter(([key,v])=>!['name','designation'].includes(key)&&v!=null):[];
        if(tableName==='chocolate_types'){
          for(const [key,v] of params){
            if(key.endsWith('_basis'))continue;
            const dark=key==='dark_chocolate_additional';
            for(const [k,val] of dark?Object.entries(v):[[key,v]]){
              const item=percentage(k,val,k==='acid_insoluble_ash_max_pct'?row.acid_insoluble_ash_basis:'');
              if(!item)continue;
              push({...item,form:dark?'Dark chocolate':form,status:'Confirm declared chocolate type',source:links(anchor.doc,[6,7,8,9])});count++;
            }
          }
          continue;
        }
        push({form,parameter:label(tableName.replace(/_r[0-9]+$/,'')),status:'Read variant table',
          limit:typeof row==='string'?row:join(params.map(([k,v])=>label(k)+' = '+detail(v))),notes:anchor.basis});count++;
      }
    }
    for(const k of ['physical_chemical','quality_parameters','quality_rules','composition_core','requirements','table']){
      const v=std.sections[k];if(!v)continue;
      const records=Array.isArray(v)?v:[v];
      for(const spec of records){
        if(typeof spec==='object'&&spec?.parameter && spec.operator){criterion(spec,'Confirm article and conditions');continue;}
        const value=detail(spec);if(!value)continue;
        push({parameter:label(k),limit:value,status:'Read source provision',notes:anchor.basis});count++;
      }
    }
    if(!count && base.article==='2.1.3'){
      for(const parameter of ['Milk fat','Milk solids-not-fat'])push({parameter,status:'Identify the milk used',form:route.name,
        notes:'The minimum follows the class of the starting milk under 2.1.2. Record that class and select its corresponding table row.',
        source:links(anchor.doc,[13,9,10])});
      return;
    }
    if(!count && base.article==='2.1.1' && route.name==='Analogue in the dairy context'){
      push({parameter:'Identity of the dairy analogue',form:route.fcs,status:'Identify formulation and applicable product standard',
        notes:'Record the constituent replaced, its replacement and the finished product identity before assigning composition limits. The dairy analogue route has distinct scope under 2.1.1.',
        source:links(anchor.doc,[1,2,5,6,7])});return;
    }
    if(!count && base.article==='2.1.17'){
      push({parameter:'Moisture and milk fat',form:route.name,status:'Identify the cheese variety or compositional class',
        notes:'Ripening alone does not select a composition row. Record the named variety or the applicable class, and check moisture and fat on the bases stated in that row.',
        source:links(anchor.doc,[59,64,65,66])});return;
    }
    if(!count)push({parameter:'Product composition and identity',status:'Read product article',notes:join([anchor.basis,...std.issues.map(detail),'Check the cited article for the declared product and process.'])});
  }

  const dairyGazette='https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/';
  const dairyClauses={
    '2.1.21(4)':['5bfd095d0ad63Gazette_Notification_DairyProducts_27_11_2018.pdf',7],
    '2.1.22(4)':['5bfd095d0ad63Gazette_Notification_DairyProducts_27_11_2018.pdf',8],
    '2.1.23(4)':['5bfd095d0ad63Gazette_Notification_DairyProducts_27_11_2018.pdf',9],
    '2.1.24(4)':['5f50bca66e5bdGazette_Notification_Standards_Milk_Cheese_03_09_2020.pdf',9]
  };
  function microSources(route){
    const gazette=dairyClauses[route.source_clause];
    if(!gazette||route.status!=='mapped_explicit_chapter_cross_reference')return [];
    return [dairyGazette+gazette[0]+'#page='+gazette[1],...route.source_pdf_pages.map(page=>route.source_url+'#page='+page)];
  }
  function dairySamplingRows(date){
    const out=[headers];
    if(!metalEdition(date))return out;
    for(const [id,product] of Object.entries(E.products)){
      if(product.micro.some(([,route])=>microSources(route).length)){
        out.push(...exportRows(id,date).slice(1).filter(row=>row[2]===areas[1]));
      }
    }
    return out;
  }
  const processingArea='Pesticide processing studies';
  const processingSource='https://fssai.gov.in/upload/uploadfiles/files/Guidance_Document_SOP_MRL_16_03_2022.pdf';
  const processingSamples=new Map([
    ['coffee-chicory-mixture',['Coffee and chicory inputs → roasted ground blend or soluble extract','Trace the coffee and chicory lots separately. Obtain the blend proportions and identify whether the sample is ground or extracted. A single ingredient result cannot establish the concentration in the blend.']],
    ['04-04-1-coconut-milk-powder',['Kernel → coconut milk → dried powder','Record the extraction and drying stages, carriers and their proportions. A moisture adjustment alone cannot account for partitioning during extraction.']],
    ['04-04-2-cocoa-beans',['Fresh seed → fermented, dried whole beans','Identify whether the cited raw commodity already describes the fermented, dried bean. Use a processing study only for an actual change of commodity or stage.']],
    ['05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake',['Whole beans → nib → mass or liquor → press cake','Identify the residue, whether the shell was removed, and which fraction was sampled. For pressed material distinguish cake from butter and retain their separate results.']],
    ['06-06-2-arrowroot',['Rhizome → separated and purified starch','Document the botanical source, washing, starch separation and drying. A whole-rhizome result alone cannot establish the residue in the purified starch.']]
  ]);
  function processingRow(id){
    const sample=processingSamples.get(id);if(!sample)return null;
    return {area:processingArea,article:'FSSAI pesticide MRL guidance, section 9',form:sample[0],parameter:'Evidence for pesticide residues after processing',
      status:'Processing-study guidance',limit:'',unit:'',
      notes:sample[1]+' For the same pesticide residue definition, compare the processed fraction and its linked raw commodity in consistent units. The processing factor is the processed concentration divided by the raw concentration. Record the study, method, reporting limits and separately applicable Indian MRL before interpreting a finished-food result.',
      source:[45,53].map(page=>processingSource+'#page='+page).join(' | ')};
  }
  // A shared Appendix B profile can have product- or variant-specific exclusions.
  function microCriteria(profile,route) {
    const data={...profile.criteria};
    for(const kind of ['hygiene','safety']){
      data[kind]=Object.fromEntries(Object.entries(data[kind]||{}).filter(([key])=>!(route.exclude_criteria||[]).includes(key)));
    }
    if(!route.apply_enterobacteriaceae_footnote)delete data.supplemental_process_criteria;
    return data;
  }
  function tablePages(profile,kind) {
    const p=profile.pages;
    if(Array.isArray(p))return p;
    if(kind==='supplemental_process_criteria')return p.footnotes||[];
    const entry=Object.entries(p).find(([k])=>new RegExp('^table_[0-9]+'+(kind==='safety'?'b':'a')+'$').test(k));
    return entry?.[1]||p.current_tables||[];
  }
  const cerealChapter='chapter-2-4-cereals-v1.json#';
  const grainMicroNames=new Set(['Total bacterial count','Coliform bacteria','Salmonella','Bacterial count','Coliform count','Yeast and mould','Salmonella and Shigella','E. coli','Vibrio cholerae and V. parahaemolyticus','Faecal streptococci and Staphylococcus aureus','Total plate count','Yeast and mould count']);
  function grainProduct(id){
    return E.products[id]?.standard?.startsWith(cerealChapter)||id==='06-06-3-fruit-vegetable-cereal-flakes';
  }
  function microFormRoute(id){
    return E.products[id]?.micro.find(([,route])=>route.form_evidence)?.[1]||null;
  }
  function microFormChoice(option){return option.choice_key||option.profile_key||'review';}
  function selectedMicroForm(route,state){
    return route?.options.find(option=>microFormChoice(option)===state?.microForm)||null;
  }
  function microPhDecision(state){
    const value=String(state.microPh||'').trim().replace(/^\./,'0.');
    const reference=String(state.microPhRef||'').trim();
    const below=root.PMSVCatalogueWorksheets.compare({operator:'<',value:'4.4'},value);
    if(below===true&&reference)return {exclude:true,note:'Optional Listeria exclusion applied under Appendix B footnote 4. Measured pH '+value+'. Report or batch reference: '+reference+'.'};
    return {exclude:false,note:'Listeria retained. The optional exclusion requires a recorded decimal pH below 4.4 and its report or batch reference.'+(value?' Entered pH: '+value+'.':'')+(reference?' Report or batch reference: '+reference+'.':'')};
  }
  function microFormRows(id,date,state={},family=null){
    const out=[headers];
    if(!metalEdition(date))return out;
    const products=id?[id]:Object.keys(E.products);
    for(const key of products){
      const route=microFormRoute(key);
      const egg=root.PMSVEggMicrobiology?.products.has(key),spice=root.PMSVSpiceMicrobiology?.products.has(key);
      const groups={grain:grainProduct(key),egg,spice};
      const applies=id?(route||groups.grain||egg||spice):Object.hasOwn(groups,family)?groups[family]:route&&(route.form_evidence.family||null)===family;
      if(!applies)continue;
      out.push(...exportRows(key,date,false,id?state:{}).slice(1).filter(row=>row[2]===areas[1]));
    }
    return out;
  }
  function microbiology(id,add,state={}) {
    const product=E.products[id],base={area:areas[1],article:'Appendix B',source:links('chapter-20')};
    const decision=microFormRoute(id), selected=selectedMicroForm(decision,state), reference=String(state?.microFormRef||'').trim();
    const evidence=decision?.form_evidence;
    const grain=grainProduct(id);
    const grainPages=grain?(evidence||product.micro[0]?.[1])?.product_pages:null;
    const egg=root.PMSVEggMicrobiology,eggProduct=egg?.products.has(id);
    const spice=root.PMSVSpiceMicrobiology,spiceProduct=spice?.products.has(id);
    const chapterPages=evidence?.product_pages||grainPages||(spiceProduct?product.micro[0][1].product_pages:null)||(eggProduct?E.standards[product.standard].p:null);
    const chapter=chapterPages?links(E.standards[product.standard].doc,chapterPages):'';
    const extra=evidence||grain||eggProduct||spiceProduct?[evidence?.family==='fruit-vegetable'||grain||eggProduct||spiceProduct?chapter.replaceAll('https://www.fssai.gov.in/','https://fssai.gov.in/'):chapter]:[];
    if(evidence)extra.push(links('chapter-20',evidence.appendix_pages));
    const spiceGazette='https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/5f86e028b231eGazette_Notification_Spices_14_10_2020.pdf';
    if(spiceProduct)extra.push(links('chapter-20',[24,25,26,27,28]),spiceGazette+'#page=15',spiceGazette+'#page=16');
    if(eggProduct)extra.push(links('chapter-20',[53,54,55,56]));
    function push(row){
      const item={...base,...row};
      if(extra.length)item.source=[...new Set([...extra,item.source].join(' | ').split(' | '))].join(' | ');
      add(item);
    }
    function profileRows(route,conditional,reason){
      const profile=R.micro[route.profile_key];
      if(!profile){push({form:route.condition,parameter:'Product and process mapping',status:'Review route',notes:join([reason,route.message,route.note,route.reason,route.route])});return;}
      const criteria=microCriteria(profile,route),form=join([route.condition,profile.name]);
      let count=0;
      for(const [kind,kindLabel] of [['hygiene',criteria.hygiene_label||'Process hygiene'],['safety','Food safety'],['supplemental_process_criteria','Additional process hygiene']]){
        for(const [organism,row] of Object.entries(criteria[kind]||{})){
          const pg=tablePages(profile,kind);
          const footnotes=profile.pages.footnotes||[];
          const cited=profile.group==='milk'?[...new Set([...pg,...footnotes])]:pg;
          const tableRef=Array.isArray(profile.pages)?'Table 7':Object.entries(profile.pages).find(([k,v])=>k.startsWith('table_')&&v===pg)?.[0]?.replace('table_','Table ').toUpperCase();
          const fruitStage=(evidence?.family==='fruit-vegetable'||(grain&&route.profile_key==='fruit-06'))?(kind==='hygiene'
            ?'End of manufacture. Use this criterion to assess process hygiene and investigate unsatisfactory results. It is not a lot-release criterion.'
            :'Food safety criterion for lot acceptability at the end of manufacture and during market shelf life.'):'';
          const conditionalYeast=route.profile_key==='milk-11'&&organism==='yeast_and_mold_count';
          const caseinOnly=route.profile_key==='milk-07'&&organism==='yeast_and_mold_count';
          push({article:join(['Appendix B',tableRef || (kind==='supplemental_process_criteria'?'Table 2A footnote 4':profile.group==='bakers_yeast'?'Tables 6A/6B':'') ,kindLabel]),
            form:route.source_clause?R.products[id].name+' · '+form:form,parameter:R.organisms[organism]||label(organism),status:row.source_question?'Resolve source before use':conditional||conditionalYeast||caseinOnly?'Confirm product form':'Mapped table row',
            limit:row.requirement||'',unit:row.unit,notes:join([spiceProduct?(kind==='hygiene'?'Process hygiene at the end of manufacture. Investigate unsatisfactory results and verify food safety criteria.':'Food safety at the end of manufacture and during market shelf life. '+spice.regulatory):'',spiceProduct&&state.spiceOrganism===organism?spice.note(id,state):'',eggProduct?(kind==='hygiene'?'Assess process hygiene at the end of manufacture. Investigate unsatisfactory results, improve hygiene and check all Table 8B criteria.':'Assess lot acceptability at the end of manufacture and throughout market shelf life. '+egg.regulatory):'',eggProduct&&state.eggOrganism===organism?egg.note(id,state):'',fruitStage,profile.group==='food_grains'&&grain?(kind==='hygiene'?'Process hygiene at the end of manufacture. An unsatisfactory result calls for corrective action.':'Lot acceptability at the end of manufacture and throughout market shelf life.'):'',reason,route.note,route.matrix_scope_note,route.message,row.notes,row.source_question,
              row.applicability,conditionalYeast?'Exclude mould-ripened cheese.':'',caseinOnly?'Applies to casein powder only.':'',
              kind==='hygiene'?criteria.stage:'',profile.group==='milk'?(kind==='safety'?'End of manufacture and products on the market during shelf life.':'Process hygiene at end of manufacture.'):'',detail(criteria.notes)]),n:row.n,c:row.c,m:row.m,M:row.M,source:[...microSources(route),links('chapter-20',cited)].join(' | ')});
          count++;
        }
      }
      if(criteria.safety_special_requirement){
        push({form,parameter:'Food safety special requirement',status:conditional?'Confirm product form':'Mapped table row',
          limit:criteria.safety_special_requirement,notes:join([reason,route.note,route.message]),source:links('chapter-20',tablePages(profile,'safety'))});count++;
      }
      if(!count||criteria.hygiene_special_requirement||criteria.process_hygiene_not_applicable||criteria.food_safety_not_applicable){
        const pages=[...new Set([...tablePages(profile,'hygiene'),...tablePages(profile,'safety')])];
        const notes=join([reason,route.note,route.message,criteria.hygiene_special_requirement,criteria.process_hygiene_not_applicable?'Process hygiene table has no numerical plan for this form.':'',criteria.food_safety_not_applicable?'Food safety table has no numerical plan for this form.':'',detail(criteria.notes)]);
        push({form,parameter:'Table applicability',status:conditional?'Confirm product form':'Read table scope',notes,source:links('chapter-20',pages)});
      }
    }
    if(!product.micro.length){
      const direct=sourceRows.products[id]?.some(k=>sourceRows.rows[k][9]==='micro');
      push({parameter:'Appendix B product and process mapping',status:'Establish Appendix B route',notes:direct?
        'Product-specific microbiological cells appear separately. Check Appendix B against the supplied food and process.':
        'Check Appendix B and the product regulation for the food as supplied. No Appendix B numerical plan has been assigned in the catalogue.'});return;
    }
    if(decision){
      const options=selected?[selected]:decision.options;
      for(const option of options){
        const condition=option.condition||option.when;
        const reason=join([evidence.prompt,selected&&reference?'Evidence: '+reference:'']);
        if(option.fermentation_exclusion){
          const documented=!!selected&&!!reference;
          if(documented){
            profileRows({...option,condition,exclude_criteria:['yeast_and_mold_count']},false,join([reason,'Table 4A footnote 3 applies because the documented fermentation involved yeast or mould. The yeast and mould count is omitted.']));
          }else if(selected){
            const routine=decision.options.find(o=>o.profile_key===option.profile_key&&!o.fermentation_exclusion);
            profileRows(routine,true,join([reason,'Evidence reference needed. The full preserved-product plan retains the yeast and mould count until a process or batch record confirms the fermentation.']));
          }else{
            push({form:condition,parameter:'Fermentation evidence for yeast and mould count',status:'Evidence required for exclusion',
              notes:join([reason,'Keep the yeast and mould count in the routine plan until the batch record identifies involvement of yeast or mould in fermentation. All food safety criteria continue to apply.'])});
          }
        }else if(option.ph_exclusion&&!selected){
          push({form:condition,parameter:'Optional Listeria testing decision',status:'Evidence required for exclusion',notes:join([reason,'The catalogue plan retains Listeria. Select this option on the individual worksheet only for an eligible product and record its pH result and reference.'])});
        }else if(!option.profile_key||option.automatic_selection_allowed===false||(selected&&!reference)){
          const needsEvidence=selected&&!reference&&option.profile_key&&option.automatic_selection_allowed!==false;
          push({form:condition,parameter:'Product form and microbiological scope',status:needsEvidence?'Evidence reference needed':'Regulatory assessment needed',
            notes:join([reason,needsEvidence?'Record the specification or batch reference before using this route.':option.message])});
        }else{
          if(option.ph_exclusion){
            const decision=microPhDecision(state);
            profileRows({...option,condition:condition.split(' · ')[0]+(decision.exclude?' · Listeria exclusion documented':' · Listeria retained'),exclude_criteria:decision.exclude?['listeria_monocytogenes']:[]},false,join([reason,decision.note]));
          }else profileRows({...option,condition},!selected,reason);
        }
      }
      return;
    }
    for(const [kind,route] of product.micro){
      if(kind==='chapter_specific')continue; // Product-standard rows are emitted by composition to retain measured-result context.
      if(kind==='grain_scope'){
        push({article:product.standard.split('#')[1]+' · Appendix B Tables 9A/9B',form:R.products[id].name,parameter:'Food-grain table applicability',status:'No Table 9 category established for the named form',notes:route.note,source:links('chapter-20',[58,59])});continue;
      }
      if(kind==='conditional')for(const option of route.options||[])profileRows(option,true,route.reason);
      else if(route.profile_key)profileRows(route,false,'');
      else {
        const anchor=E.standards[product.standard];
        push({parameter:'Product-specific microbiology route',status:'Review separate provision',notes:join([route.route,route.reason,route.note]),
          source:anchor?links(anchor.doc,anchor.p)+' | '+base.source:base.source});
      }
    }
  }

  const metalGroups=root.PMSVMetalPanelData.groups, cropGroups=root.PMSVCropScopeData.groups;
  const inGroup=(groups,group,id)=>groups[group].includes(id);
  // These catalogue identities specify the oil itself; the other oil routes
  // include spreads, derivatives, grade-dependent material and mixed foods.
  const namedOils=new Set([
    '02-02-1-refined-grapeseed-oil','02-02-1-refined-rapeseed-or-mustard-oil-low-erucic-acid',
    '02-02-1-refined-safflower-seed-oil-and-safflower-seed-oil-high-oleic-acid-imported-or-dome',
    '02-02-1-moringa-oil','02-02-1-refined-palm-kernel-olein','02-02-1-refined-moringa-oil','fssai-2-16-hemp-seed-oil',
    ...['soyabean','soybean'].flatMap(legume=>['partially-hydrogenated-','partially-hydrogenated-and-winterised-'].map(prefix=>'02-02-1-'+prefix+legume+'-oil'))
  ]);
  const seeds=new Set(['06-06-1-chia-seeds','12-12-2-poppy-khas-khas','fssai-2-16-hemp-seed','06-06-1-soybean']);
  function fishOilScreen(value,unit='mg/kg'){
    if(!String(value??'').trim())return 'Enter the total arsenic result or its numerical upper bound in mg/kg.';
    if(!['mg/kg','µg/kg'].includes(unit))return 'Check the mass-based reporting unit for total arsenic in fish oil.';
    const measured=root.PMSVMetalPanel.parseReading(value,unit);
    if(!measured)return 'Manual review required. Enter a non-negative decimal result or a numeric upper bound from the report.';
    const compare=root.PMSVCatalogueWorksheets.compare;
    const below=compare({operator:measured.qualifier==='<'?'<=':'<',value:'0.1'},measured.amount);
    if(below)return 'Below 0.1 mg/kg total arsenic. The Gazette accepts this screen for the inorganic arsenic limit.'+measured.equivalent;
    if(measured.qualifier)return 'Inconclusive. The reported upper bound does not establish total arsenic strictly below 0.1 mg/kg. Review the reporting threshold or obtain an inorganic arsenic result.'+measured.equivalent;
    if(compare({operator:'>',value:'0.1'},measured.amount))return 'Above 0.1 mg/kg total arsenic. Determine inorganic arsenic to assess the limit.'+measured.equivalent;
    return 'Exactly 0.1 mg/kg total arsenic. The Gazette gives no screening disposition at equality. Review the report or obtain speciation.'+measured.equivalent;
  }
  function amendedMetal(id,d,row) {
    const source=links('ctr-1',[4]),key=d.name==='Lead'?'Pb127':d.name==='Cadmium'?'Cd18':'';
    if(d.name==='Arsenic'&&inGroup(metalGroups,'fishOil',id)){
      return {...row,article:'CTR 2.1.1(2) · fish-oil note',parameter:'Inorganic arsenic',form:'Fish oil',status:'Named finished article',
        labKey:'fishArsenic',limit:'0.1',unit:'mg/kg',notes:'Screen using total arsenic. Below 0.1 mg/kg, the note accepts the sample for this limit. Above 0.1 mg/kg, determine inorganic arsenic. At exactly 0.1 mg/kg total, the note gives no screening disposition. Review the result or obtain speciation.',
        source:links('ctr-1',[4,5])};
    }
    if(!key||!inGroup(metalGroups,'futurePulse',id))return row;
    const cadmium=key==='Cd18',article=cadmium?'Pulses and pulse flours, excluding dry soybean':'Pulses and pulse flours';
    const original=root.PMSVMetalPanelData.rows[key];
    const refs=[source,links('ctr-3',[original[2]])].join(' | ');
    if(inGroup(metalGroups,'plainPulseFlour',id)||d.keys.includes(key)&&d.kind==='named'){
      return {...row,status:'Named finished article',form:article,labKey:key,limit:original[1],unit:'ppm',
        notes:'Confirm the stated pulse or plain pulse flour and sample as marketed.'+(cadmium?' The amended cadmium entry excludes dry soybean.':''),source:refs};
    }
    if(inGroup(metalGroups,'soyFlour',id))return {...row,form:article,status:'Confirm soy flour classification',labKey:null,limit:'',unit:'',
      notes:cadmium?'Determine how the dry-soybean exclusion applies to this processed soy flour before assigning a cadmium limit.':'Document that the marketed soy flour falls within the amended pulse-flour entry.',source:refs};
    return {...row,notes:row.notes+' Check the identity of any separately sampled pulse flour. The amended entry names the pulse or its flour.'+
      (cadmium?' Dry soybean is excluded from that cadmium entry.':''),source:[row.source,source].join(' | ')};
  }
  function amendedToxin(id,d,row,state) {
    const amendment=links('ctr-1',[5]);
    if(d.key==='saf'){
      const reference=String(state.crop_decRef||'').trim(),choice=state.crop_dec;
      const contains=choice==='contains'&&reference,absent=choice==='absent'&&reference;
      return {...row,article:'CTR 2.2.1(2) · serial 4',form:'Food or beverage containing mace or nutmeg kernel as an ingredient',
        status:contains?'Documented finished formulation':absent?'Documented ingredients outside entry':'Confirm ingredients of finished article',
        limit:contains?'10':'',unit:contains?'ppm':'',
        notes:contains?'Mace, nutmeg kernel or both documented. Recipe reference: '+reference:
          absent?'Neither ingredient is used. Recipe reference: '+reference:
          'Check the formulation for mace, nutmeg kernel or both. The 10 ppm maximum applies when at least one is an ingredient. Record the recipe under Crop contaminants → December amendment. A sample of the spice alone does not establish that condition.',
        source:[amendment,links(root.PMSVCropScopeData.rows.N8.doc,[root.PMSVCropScopeData.rows.N8.page])].join(' | ')};
    }
    if(d.key!=='total'&&d.key!=='b1')return row;
    const inOilGroup=inGroup(cropGroups,'afoils',id), oilKeys=d.key==='total'?['C5','C6']:['C15','C16'];
    const data=root.PMSVCropScopeData.rows, r=data[oilKeys[0]];
    const sources=[amendment,links(r.doc,[r.page])].join(' | ');
    if(namedOils.has(id))return {...row,form:'Oil as marketed',status:'Named finished article',limit:String(r.limit),unit:r.unit,
      notes:'The revised oil entry includes the identified edible oil. Confirm the actual sample is the oil itself.',source:sources};
    if(seeds.has(id)&&state.crop_af==='oil'&&String(state.crop_afRef||'').trim())return {...row,form:'Documented oilseed as marketed',
      status:'Documented oilseed',limit:String(r.limit),unit:r.unit,notes:'Oilseed identity and use: '+state.crop_afRef.trim(),source:sources};
    if(inOilGroup&&d.sample==='outside')return {...row,form:'Documented outside these rows',source:sources};
    if(inOilGroup&&state.crop_af==='composite'&&d.sample==='finished'&&d.rows.length===1){
      const value=data[d.rows[0]];
      return {...row,form:value.article,status:d.status,limit:String(value.limit),unit:value.unit,notes:d.reason,source:links(value.doc,[value.page])+' | '+amendment};
    }
    const legacyOilChoice=d.status==='Documented finished article'&&d.rows.some(k=>oilKeys.includes(k));
    if(inOilGroup||legacyOilChoice){
      return {...row,form:'Confirm oil, oilseed or finished composite',status:'Confirm sampled article and use',limit:'',unit:'',
        notes:(legacyOilChoice?d.reason+'. ':'')+'For a qualifying oil or an oilseed for processing or ready to eat, the maximum is '+r.limit+' '+r.unit+'. Check the marketed form and food use. A prepared spread, analogue, flour or mixed food requires its own classification.',
        source:sources};
    }
    if(id==='02-02-1-fish-oil'||id==='02-02-1-butter-oil')return {...row,form:'Oil of animal origin',status:'Review scope of the oil entry',limit:'',unit:'',
      notes:'Confirm the scope of the oil and oilseed entry for this animal-derived oil before applying a plant-commodity limit.',source:sources};
    return row;
  }
  function metalEdition(date){
    return date>='2026-11-20'?root.PMSVVeterinary.edition(date):'';
  }
  function metalRow(id,d,date){
    const edition=metalEdition(date);
    if(!edition)return null;
    const keys=d.keys, numeric=['named','residual','all','same'].includes(d.kind);
    const pages=[...new Set(keys.flatMap(k=>{const r=root.PMSVMetalPanelData.rows[k];return [r[2],...r[3]];}))].sort((a,b)=>a-b);
    const row={area:areas[2],article:'CTR 2.1.1(2)',parameter:d.name,status:d.articleLabel||P.labels[d.kind],limit:numeric?join(keys.map(k=>P.limit(k))):'',
      form:numeric?join(keys.map(k=>root.PMSVMetalPanelData.rows[k][0])):'',notes:d.reason,source:links('ctr-3',pages.length?pages:[18])};
    if(d.name==='Lead'){
      const route=P.firstSource(id);
      if((id===P.dextrinId||id===P.misriId||id===P.trehaloseId)&&route)row.source=route.urls.join(' | ');
      if(id===P.syrupId)row.source=join([row.source,P.syrupIdentity]);
    }
    if(id===P.polyolId&&['Lead','Nickel'].includes(d.name)){
      const gradeRows=P.polyolRows().slice(1).filter(r=>r[4]===d.name);
      row.notes+=' Separately, the JECFA grade specifications for maltitol, maltitol syrup and xylitol give '+d.name.toLowerCase()+' at a maximum of '+gradeRows[0][5]+' mg/kg. Match the supplied grade and monograph basis for that purity assessment.';
      row.source=[row.source,...gradeRows.map(r=>r[8])].join(' | ');
    }
    if(d.identitySources)row.source=[...new Set([...d.identitySources,...row.source.split(' | ')])].join(' | ');
    if(id===P.sajjiId&&d.identitySources&&!numeric){
      row.notes+=' Published maximum for the qualifying imported lot: '+P.limit(keys[0])+' (mg/kg for the solid).';
    }
    const dated=edition==='amended'?amendedMetal(id,d,row):row;
    if(d.proof&&dated.form===row.form&&dated.status===row.status)dated.notes+=' Evidence: '+d.proof;
    return dated;
  }
  function toxinRow(id,d,date,state={}){
    const edition=metalEdition(date);
    if(!edition||!d)return null;
    const recipe=root.PMSVRecipeSamples;
    if(recipe?.covered(id,d.key))d={...d,...recipe.decision(id,d.key,state,date)};
    const beverage=d.key==='saf'&&C.beverageDecision(id,state,date);
    if(beverage)d={...d,...beverage};
    const data=root.PMSVCropScopeData.rows;
    const sources=[...new Set(d.sources.map(k=>links(data[k].doc,[data[k].page])))];
    const row={area:areas[3],article:'CTR 2.2.1',parameter:d.name,status:d.status,
      form:d.sample==='ingredient'?'Separately sampled ingredient':d.status==='Documented finished article'?'Finished product':d.sample,
      limit:join(d.rows.map(k=>data[k].article+' — '+data[k].limit+' '+data[k].unit+(data[k].heading?' (Oilseeds or oil heading)':''))),
      notes:d.reason,source:sources.join(' | ')};
    const child=id===C.childId;
    const profile=(d.key==='total'||d.key==='b1'||child&&['ota','don'].includes(d.key))&&C.firstSource(id);
    if(d.links)row.source=[...new Set([...sources,...d.links])].join(' | ');
    else if(profile)row.source=[...new Set([...sources,...(child?[profile.urls[0]]:profile.urls)])].join(' | ');
    const recipeDrink=id===recipe?.drink&&d.key==='saf';
    const dated=edition==='amended'&&!recipeDrink&&!beverage?amendedToxin(id,d,row,state):row;
    if(id===recipe?.syrup&&d.key==='hcn')dated.article='CTR 2.2.1(2) · serial 2';
    if(recipeDrink||beverage)dated.article='CTR 2.2.1(2) · serial 4';
    if(!dated.limit)return dated;
    // Replacement rows explicitly carry a numeric maximum and refer to the finished food.
    if(dated.unit){
      dated.criterion={value:dated.limit,unit:dated.unit,role:'finished',article:dated.form};
    }else if(['finished','ingredient'].includes(d.sample)&&d.rows.length){
      const matches=d.rows.map(k=>data[k]),first=matches[0];
      if(matches.every(r=>r.limit===first.limit&&r.unit===first.unit)){
        dated.criterion={value:String(first.limit),unit:first.unit,role:d.sample,article:join(matches.map(r=>r.article))};
      }
    }
    return dated;
  }
  function contaminants(id,add,date,state) {
    const edition=metalEdition(date);
    if(!edition){
      for(const area of areas.slice(2,4))add({area,article:'CTR 2.1 / 2.2',parameter:'Check assessment edition',status:'Assessment date outside reviewed contaminant editions',
        notes:'The reviewed metal and toxin plans start on 20 November 2026. Choose a covered date or check the source edition in force on the sample date.',source:links('ctr-1',[4,5])});
      return;
    }
    add({...root.PMSVBroadContaminants.melamineRow(id,state),area:areas[3]});
    const readings=state.vetDate&&state.vetDate!==date?[]:P.reportLines(id,state,date);
    for(const d of P.panel(id,state)){
      const row=metalRow(id,d,date);
      row.notes=join([row.notes,...readings.filter(r=>r.metal===d.key).map(r=>r.summary)]);
      add(row);
    }
    for(const d of C.decisions(id,state)){
      const row=toxinRow(id,d,date,state);
      if(id===root.PMSVCocoaMixtures?.productId&&d.key==='saf'){
        row.notes+=' FPSFA 2.7.6(3) permits spices in this mix. Check the actual recipe and the dry product as sold.';
        row.source+=' | '+root.PMSVCocoaMixtures.sources[1];
      }
      if(state['tox_'+d.key+'_value']?.trim()&&(!state.vetDate||state.vetDate===date))
        row.notes=join([row.notes,C.labResult(id,d.key,state,date,row).summary]);
      add(row);
    }
  }
  function entries(id,vetDate=root.PMSVVeterinary.reviewDate,state) {
    if(!Object.hasOwn(E.products,id))return [];
    const result=[],add=row=>result.push(row);
    composition(id,add,state,vetDate);
    const dispatch=root.PMSVSamplingQuantities?.planEntry(id,vetDate,state);
    if(dispatch)add(dispatch);
    if(metalEdition(vetDate))for(const row of root.PMSVFormulation?.planRows(id,state)||[])add(row);
    if(metalEdition(vetDate))for(const row of root.PMSVEggResidueReports?.additionalRows(id,state)||[])add(row);
    if(metalEdition(vetDate))for(const row of root.PMSVCocoaGrades?.planRows(id,state)||[])add(row);
    if(metalEdition(vetDate))for(const row of root.PMSVCacaoResidues?.planRows(id,state)||[])add(row);
    const sampleGuide=metalEdition(vetDate)&&additionalSampleRow(id);
    if(sampleGuide)add(sampleGuide);
    const processing=metalEdition(vetDate)&&processingRow(id);
    if(processing)add(processing);
    if(metalEdition(vetDate)&&root.PMSVImportDocuments){
      for(const row of root.PMSVImportDocuments.entries(id,state))add(row);
    }
    if(metalEdition(vetDate)&&root.PMSVLabGuide){
      for(const row of root.PMSVLabGuide.referenceEntries(id,state))add(row);
    }
    if(metalEdition(vetDate))for(const row of root.PMSVStarchSpecifications?.entries(id)||[])add(row);
    for(const row of root.PMSVSulphites.rows(id,state))add(row);
    for(const row of root.PMSVAdditivesSolvents.rows(id,state))add({...row,area:areas[0]});
    for(const row of routeNotes.get(id)||[])add({...row,area:areas[0]});
    for(const row of scopedReferences(id,vetDate)){
      add({...row,area:scopedArea,limit:'',unit:'',notes:row.notes+' Published reference: '+row.value+(row.unit?' '+row.unit:'')+'.'+(root.PMSVEggResidueReports?.savedExportNote(id,row.parameter,state)||'')});
    }
    if(id===routeIds.enzyme)for(const row of lysozymeReferences){
      add({...row,area:areas[0],status:'Separate classification example',limit:'',unit:'',
        notes:row.notes+' Published reference for the specified sample: '+[row.limit,row.unit].filter(Boolean).join(' ')+'.'});
    }

    const coffee=root.PMSVCoffee;
    if(id==='coffee'&&(!state?.coffeeForm||state.coffeeForm==='green'))add({...coffee.rawBeanRow(id),area:areas[4]});
    if(id===root.PMSVCocoaMixtures?.productId)for(const rule of root.PMSVCocoaMixtures.planRows(state))add({...rule,area:areas[0]});
    microbiology(id,add,state);contaminants(id,add,vetDate,state||{});
    if(metalEdition(vetDate))for(const row of incomingSamples.rows(id))add(row);
    for(const r of root.PMSVPesticides.planRows(id))add({...r,area:areas[4]});
    for(const r of root.PMSVVeterinary.planRows(id,vetDate))add({...r,area:areas[5]});
    if(root.PMSVAyurvedaPlan?.known(id))for(const row of root.PMSVAyurvedaPlan.planRows(id,state))add(row);
    if(id===root.PMSVVendingWater?.productId)for(const row of root.PMSVVendingWater.planRows(id,state))add(row);
    if(state){
      for(const r of root.PMSVResiduePanel.planRows(id))add({...r,area:areas[4]});
      const veterinary=root.PMSVVeterinary.recordedPlanRow(id,state,vetDate);
      if(veterinary)add({...veterinary,area:areas[5]});
    }
    return result;
  }
  function exportRows(id,vetDate,veterinaryOnly=false,state) {
    const products=id?(R.products[id]?[id]:[]):root.PMSV_CATALOGUE.map(p=>p.id);
    const out=[veterinaryOnly?[...headers,'Veterinary assessment date']:headers];
    for(const key of products){
      const rows=veterinaryOnly?root.PMSVVeterinary.planRows(key,vetDate):entries(key,vetDate,id?state:undefined);
      for(const r of rows){
        const area=veterinaryOnly?areas[5]:r.area;
        const notes=!veterinaryOnly&&vetDate&&vetDate!==root.PMSVVeterinary.reviewDate&&[areas[2],areas[3],areas[5]].includes(area)?
          (area===areas[5]?'Veterinary assessment date ':'Contaminant assessment date ')+vetDate+'. '+r.notes:r.notes;
        const cells=[key,R.products[key].name,area,r.article,r.form,r.parameter,r.status,r.limit,r.unit,r.locator?notes+' ('+r.locator+')':notes,r.n,r.c,r.m,r.M,r.source];
        if(veterinaryOnly)cells.push(vetDate??root.PMSVVeterinary.reviewDate);
        out.push(cells.map(v=>v??''));
      }
    }
    return out;
  }
  function sulphiteRows(id,state) {
    const out=[headers];
    for(const key of root.PMSVSulphites.profiles.keys()){
      if(id&&key!==id)continue;
      for(const r of root.PMSVSulphites.rows(key,id?state:undefined)){
        out.push([key,R.products[key].name,r.area,r.article,r.form,r.parameter,r.status,r.limit,r.unit,r.notes,'','','','',r.source]);
      }
    }
    return out;
  }
  function incomingExport(id,date=root.PMSVVeterinary.reviewDate){
    const out=[headers];
    if(!metalEdition(date))return out;
    for(const key of incomingSamples.descriptions.keys()){
      if(id&&id!==key)continue;
      for(const r of incomingSamples.rows(key)){
        out.push([key,R.products[key].name,r.area,r.article,r.form,r.parameter,r.status,r.limit,r.unit,r.notes,'','','','',r.source]);
      }
    }
    return out;
  }
  const sampleArea='Product samples and analytical methods';
  const focusIds=[C.vendingId,'coffee-chicory-mixture',beanId,routeIds.cocoa];
  const cocoaPowderReference=root.PMSVMetalPanelData.rows.Cu7[1].split(' ')[0];
  function additionalSampleRow(id){
    if(id==='coffee-chicory-mixture')return {area:sampleArea,article:'FSSAI 04A.014:2023',form:'Finished dry roasted-ground or instant coffee–chicory blend',
      parameter:'Microscopic examination for adulterants',status:'Qualitative method',limit:'',unit:'',
      notes:'Record the dry sample lot and the identified material. Compare the finding with the specification. This method provides no numerical contaminant limit.',
      source:'https://fssai.gov.in/upload/uploadfiles/files/Manual%20of%20Methods%20of%20Analysis%20for%20Beverages%20Tea%2C%20Coffee%20and%20Chicory.pdf#page=37'};
    if(id!==beanId&&id!==routeIds.cocoa)return null;
    const [article,,page]=root.PMSVMetalPanelData.rows.Cu7;
    return {area:sampleArea,article:'CTR 2.1.1(2), copper',form:'Separate downstream sample of '+article.toLowerCase(),parameter:'Copper in separately sampled cocoa powder',
      status:'Downstream product reference only',limit:'',unit:'',notes:'The Gazette gives '+cocoaPowderReference+' ppm on the fat-free substance basis for cocoa powder. A whole bean, cocoa mass/liquor or pressed cake requires its own assessment. Match the downstream powder lot and the reported analytical basis.',
      source:links('ctr-3',[page])};
  }
  function marketSampleRows(id,date=root.PMSVVeterinary.reviewDate){
    const out=[['Catalogue ID','Product','Assessment date','Sample or form','Parameter','Scope','Published reference','Unit','Evidence and interpretation','Provision','Official sources']];
    if(!metalEdition(date))return out;
    for(const key of focusIds){
      if(id&&id!==key)continue;
      const emit=(form,parameter,scope,value,unit,notes,article,source)=>out.push([key,R.products[key].name,date,form,parameter,scope,value,unit,notes,article,source]);
      const b=C.beverageDecision(key,{},date);
      if(b)emit(key===C.vendingId?'Dispensed plain water':'Dry coffee–chicory mixture','Saffrole',b.status,
        key===C.vendingId&&date<'2026-12-01'?'10':'',key===C.vendingId&&date<'2026-12-01'?'ppm':'',b.reason,'CTR 2.2.1(2), serial 4',b.links.join(' | '));
      const extra=additionalSampleRow(key);
      if(extra){
        const downstream=extra.status==='Downstream product reference only';
        emit(extra.form,extra.parameter,extra.status,downstream?cocoaPowderReference:'',downstream?'ppm':'',extra.notes,extra.article,extra.source);
      }
      if(key==='coffee-chicory-mixture')for(const r of incomingSamples.rows(key))emit(r.form,r.parameter,'Incoming ingredient',r.limit,r.unit,r.notes,r.article,r.source);
      if(key===beanId||key===routeIds.cocoa){
        for(const row of entries(key,date).filter(r=>r.area===areas[0]&&String(r.unit||'').startsWith('%')&&['2.3.54','2.7.8'].includes(r.article)&&r.limit)){
          emit(row.form,row.parameter,'Finished product composition',row.limit,row.unit,row.notes||'Match the product form and reporting basis.',row.article,row.source);
        }
      }
    }
    return out;
  }
  const ctrCompendium='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf';
  const decemberGazette='https://fssai.gov.in/docs/food-law/regulations/amendments/contaminants-toxins/272840.pdf';
  const sourceReview=new Map([
    ['04-04-2-cocoa-beans',['The lead and copper entries name cocoa powder. The Codex SB 0715 pesticide table covers whole cacao beans as an international commodity.',[3,7]]],
    ['05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake',['The powder entries specify a powder reporting basis. Identify the sampled liquor or pressed cake and obtain a provision covering that form. A bean contract applies to the incoming lot.',[3,7]]],
    ['coffee-chicory-mixture',['The copper row names dried or roasted chicory and coffee beans. The ochratoxin A row names coffee. Record ground or instant blend and distinguish results for its two inputs.',[7,15]]],
    ['04-04-1-coconut-milk-powder',['The vegetable oil row names coconut oil. Trace the expressed coconut milk and any carrier to the powder and obtain an entry covering the marketed powder.',[6,7]]],
    ['06-06-2-arrowroot',['The metal entries for root and tuber vegetables use a vegetable sample. Record the source species and the extraction step before assessing the separated starch.',[5,12]]],
    ['10-10-2-egg-powder',['The pesticide table includes egg samples. Identify shell-free egg, dried whole egg, yolk or white and obtain a documented legal and analytical basis for the powder. The production EMRLs cover incoming eggs. The HCH export entries cover a finished export consignment.',[33]]],
    [routeIds.enzyme,['FoSCoS category 99.2 excludes preparations already covered by the processing-aid or nutraceutical regulations. Match the name, source, activity and actual use before assigning the preparation specification.',[]]],
    ['100-100-cow-or-buffalo-colostrum-and-colostrum-products',['The aflatoxin M1 rows name liquid milk, skimmed milk powder and whole milk powder. Confirm the distinct colostrum or colostrum-powder identity before using a finished-product limit.',[14]]],
    ['100-100-royal-jelly',['The antibiotic performance limits concern honey production. Record the royal jelly lot, product type and a provision naming the applicable sample.',[40,41]]],
    ['purified-vending-water',['From 1 December the replacement saffrole entry covers beverages and foods containing mace or nutmeg kernel as an ingredient. Verify the vending outlet against its own drinking-water standard.',[]]]
  ]);
  function gapEvidence(id,date){
    const entry=sourceReview.get(id);
    if(!entry||!openScope(date).has(id))return null;
    const urls=entry[1].map(page=>ctrCompendium+'#page='+page);
    if(id===eggExportId&&root.PMSVEggResidueReports)for(const group of root.PMSVEggResidueReports.groups)urls.push(...group.source.split(' | '));
    if(id===routeIds.enzyme)urls.push('https://fcstraining.fssai.gov.in/assets/docs/Compiled%20FPC_FoSCoS.pdf#page=9','https://fssai.gov.in/docs/food-law/regulations/compendium/food-products-standards/Appendix%20C(2).pdf#page=40');
    if(id==='purified-vending-water')urls.push(decemberGazette+'#page=5');
    return {finding:entry[0],sources:urls.join(' | ')};
  }
  function openScope(date=root.PMSVVeterinary.reviewDate){
    return new Map([...incomingSamples.scope].filter(([id])=>!C.firstSource(id,date)));
  }
  function openProductRows(id,date=root.PMSVVeterinary.reviewDate){
    const out=[['Catalogue ID','Product','Assessment date','Sample role','Scope of reference','Article or table','Parameter','Reference value','Unit','Sample or declared matrix','Conditions and next action','Official sources']];
    if(!metalEdition(date))return out;
    const water=root.PMSVVendingWater;
    for(const [key,[sample,task]] of openScope(date)){
      if(id&&id!==key)continue;
      const add=(role,scope,row)=>out.push([key,R.products[key].name,date,role,scope,row.article,row.parameter,row.limit||'',row.unit||'',row.form,row.notes,row.source]);
      const record=E.products[key], anchor=E.standards[record.standard], route=record.routeAnchors?.[0];
      const doc=anchor?.doc||route?.[0]||record.routeDocs[0];
      const checked=gapEvidence(key,date);
      add('Finished product','Product-specific CTR source pending',{article:record.standard.split('#')[1]||'Catalogue classification',parameter:'Evidence needed',form:sample,notes:[task,checked?.finding].filter(Boolean).join(' '),source:[links(doc,anchor?.p||route?.[1]||[]),checked?.sources].filter(Boolean).join(' | ')});
      for(const row of root.PMSVFormulation?.planRows(key)||[])add('Finished-product formulation',row.status,row);
      for(const row of root.PMSVEggResidueReports?.additionalRows(key)||[]){
        add(row.role,row.status,{...row,limit:row.referenceValue,unit:row.referenceUnit});
      }
      for(const row of root.PMSVCocoaGrades?.planRows(key)||[])add(key===root.PMSVCocoaGrades.beans?'Whole bean lot':'Incoming bean lot',row.status,row);
      for(const row of root.PMSVCacaoResidues?.planRows(key)||[])add(key===root.PMSVCacaoResidues.beans?'Whole bean lot':'Incoming bean lot',row.status,row);
      const dispatch=root.PMSVSamplingQuantities?.decision(key,date);
      if(dispatch)add('Regulatory sample dispatch',dispatch.status,{article:'Laboratory and Sample Analysis 2.3.1'+(dispatch.key?', item '+dispatch.key:''),parameter:'Quantity sent to the Food Analyst',form:dispatch.food,limit:dispatch.quantity,unit:dispatch.unit,notes:dispatch.notes,source:dispatch.source});
      const melamine=root.PMSVBroadContaminants.melamineRow(key);
      add('Finished food',melamine.limit?'General melamine provision':'Confirm food-grade article for melamine',melamine);
      const processing=processingRow(key);
      if(processing)add('Raw and processed samples',processing.status,processing);
      if(record.micro.some(([,route])=>microSources(route).length)){
        microbiology(key,row=>{
          const sampling=['n','c','m','M'].filter(field=>row[field]!=null).map(field=>field+' = '+row[field]).join(', ');
          add('Finished product','Microbiological sampling plan',{...row,notes:join([sampling,row.notes])});
        });
      }
      const sampleRow=additionalSampleRow(key);
      if(sampleRow){
        const downstream=sampleRow.status==='Downstream product reference only';
        add(downstream?'Downstream cocoa powder':'Finished product method',sampleRow.status,{...sampleRow,limit:downstream?cocoaPowderReference:'',unit:downstream?'ppm':''});
      }
      for(const r of root.PMSVStarchSpecifications?.entries(key)||[]){
        const role=r.limit?'Finished starch':key===routeIds.enzyme?'Receiving food':'Purchase specification';
        add(role,r.status,{...r,limit:r.published,unit:r.publishedUnit});
      }
      for(const r of scopedReferences(key,date))add(r.role,r.status,{...r,limit:r.value});
      for(const row of root.PMSVImportDocuments?.entries(key)||[])add('Import consignment',row.status,row);
      if(key===water.productId){
        for(const row of water.planRows(key).filter(r=>r.article.includes('Table 3')&&r.unit==='mg/L')){
          add('Finished vending outlet','Drinking-water standard incorporated by FSSR 2.10.9',row);
        }
      } else {
        for(const decision of P.panel(key)){
          if(decision.kind==='same'){
            const row=metalRow(key,decision,date);
            const limits=decision.keys.map(k=>root.PMSVMetalPanelData.rows[k][1]);
            if(limits.length&&limits.every(v=>v===limits[0])&&row.limit===P.limit(decision.keys[0])){
              let scope='';
              if(decision.name==='Tin')scope=' Confirm the non-beverage food as supplied. Check beverage and infant-food articles separately when relevant.';
              if(key==='coffee-chicory-mixture'&&decision.name==='Copper')scope=' Use the dry coffee–chicory blend as supplied.';
              add('Finished food','Common CTR maximum; exact article open',{...row,limit:limits[0],unit:'ppm',notes:row.notes+scope});
            }
            continue;
          }
          if(!['residual','all'].includes(decision.kind))continue;
          const row=metalRow(key,decision,date), code=decision.keys[0];
          if(decision.keys.length===1&&['Pb71','Cu11','As32','Cd8','Hg6','Me0'].includes(code)){
            const [article,maximum,,,basis]=root.PMSVMetalPanelData.rows[code];
            add('Finished food',decision.kind==='residual'?'Residual CTR article':'All-food CTR article',
              {...row,form:article,limit:maximum,unit:'ppm',notes:[basis,row.notes].filter(Boolean).join(' ')});
          }
        }
      }
      if(key===routeIds.enzyme){
        for(const row of lysozymeReferences)add('Separate product or use','Lysozyme classification example outside the generic 99.2 assessment',row);
      }
      for(const row of root.PMSVAdditivesSolvents.rows(key))add(row.role,row.status,row);
      for(const row of incomingSamples.rows(key))add('Incoming ingredient','Separately sampled input',row);
    }
    return out;
  }
  function ingredientRouteRows(id,date=root.PMSVVeterinary.reviewDate,state){
    const out=[[...headers,'Reference maximum for the named sample','Reference unit']];
    for(const key of [...routeNotes.keys(),routeIds.sorbitol]){
      if(id&&key!==id)continue;
      const selected=id?state:undefined;
      const rows=exportRows(key,date,false,selected).slice(1);
      const parameters=(routeNotes.get(key)||[]).map(r=>r.parameter);
      for(const row of rows){
        if(row[2]!==areas[0])continue;
        const salt=key===routeIds.salt;
        const sorbitol=key===routeIds.sorbitol&&(/Purity as d-sorbitol|^(Lead|Arsenic|Nickel)$/.test(row[5]));
        if(salt||sorbitol||parameters.includes(row[5]))out.push([...row,'','']);
      }
      if(key!==routeIds.salt)continue;
      for(const ref of root.PMSVRecipeSamples.criteriaRows(key,date).slice(1)){
        const active=rows.find(r=>r[2]===areas[3]&&r[5]===ref[5]);
        const matching=active&&active[7]&&active[4]===(ref[4]==='finished'?'Finished product':'Separately sampled ingredient');
        out.push([key,R.products[key].name,areas[3],'CTR 2.2.1(1)',ref[3],ref[5],
          matching?active[6]:'Confirm the sampled article and evidence',matching?ref[6]:'',matching?ref[7]:'',
          matching?active[9]:ref[8],'','','','',ref[9],ref[6],ref[7]]);
      }
    }
    return out;
  }
  function ingredientRows(id,date=root.PMSVVeterinary.reviewDate,state){
    const out=[[...headers,'Published conditional maximum','Condition for the published maximum']];
    for(const key of ingredients.keys()){
      if(id&&id!==key)continue;
      for(const row of exportRows(key,date,false,id?state:undefined).slice(1)){
        const metal=key===P.silverId&&row[2]===areas[2]&&P.metals.find(([name,code])=>name===row[5]&&Object.hasOwn(P.silverMetals,code));
        if(row[2]!==areas[0]&&!metal)continue;
        out.push([...row,metal?P.limit(P.silverMetals[metal[1]]):'',metal?P.firstSource(key).text:'']);
      }
    }
    return out;
  }
  function sampleReviewRows(id,date=root.PMSVVeterinary.reviewDate,state){
    const out=[[...headers,'Published conditional maximum','Condition for the published maximum']];
    for(const key of [P.sajjiId,...V.sampleProfiles.keys()]){
      if(id&&key!==id)continue;
      for(const row of exportRows(key,date,false,id?state:undefined).slice(1)){
        if(key!==P.sajjiId){
          if(row[2]===areas[0])out.push([...row,'','']);
          continue;
        }
        const code=P.metals.find(([name])=>name===row[5])?.[1];
        if(row[2]===areas[2]&&Object.hasOwn(P.unspecifiedMetals,code)){
          out.push([...row,P.limit(P.unspecifiedMetals[code]),P.firstSource(key).text]);
        }
      }
    }
    return out;
  }
  function coffeeRows(id,date=root.PMSVVeterinary.reviewDate,state){
    const rows=[headers];
    for(const key of root.PMSVCoffee.ids){
      if(id&&key!==id)continue;
      rows.push(...exportRows(key,date,false,id?state:undefined).slice(1)
        .filter(r=>r[2]===areas[0]&&!r[3].startsWith('Appendix C, Table 6')||r[2]===areas[4]&&r[3]==='CTR 2.3.1, entry 129'));
    }
    return rows;
  }
  function powderRows(id,date=root.PMSVVeterinary.reviewDate,state){
    const rows=[headers];
    for(const key of powders.products.keys()){
      if(id&&key!==id)continue;
      rows.push(...exportRows(key,date,false,id?state:undefined).slice(1).filter(r=>r[2]===areas[0]));
    }
    return rows;
  }
  function sugarRows(id,date=root.PMSVVeterinary.reviewDate,state={}){
    const rows=[[...headers,'Published conditional lead maximum','Condition for the published maximum']];
    for(const [key,checks] of sugarCriteria){
      if(id&&key!==id)continue;
      const names=new Set(checks.map(c=>c.v.spec.parameter));
      rows.push(...exportRows(key,date,false,id?state:{}).slice(1).filter(row=>
        (row[2]===areas[0]&&names.has(row[5]))||(row[2]===areas[2]&&row[5]==='Lead')).map(row=>{
          const conditional=(key===P.misriId||key===P.trehaloseId)&&row[2]===areas[2];
          return [...row,conditional?P.limit(key===P.misriId?'Pb2':'Pb64'):'',conditional?P.firstSource(key).text:''];
        }));
    }
    return rows;
  }
  function starchRows(date=root.PMSVVeterinary.reviewDate){
    const rows=[['Assessment date','Catalogue ID','Product or sample','Source type','Analyte','Published maximum','Unit','Applicable when','Source pages']];
    if(!metalEdition(date))return rows;
    const lead=P.firstSource(P.trehaloseId);
    rows.push([date,P.trehaloseId,'Crystalline trehalose','Indian CTR group entry 2.1.1(2)','Lead','5.0','mg/kg',lead.text,lead.urls.join(' | ')],
      [date,P.trehaloseId,'Trehalose meeting the JECFA specification','JECFA purity specification','Lead','1','mg/kg','Applies to the grade described in the JECFA monograph. Assess this purity requirement independently of the Indian CTR group entry.',lead.urls.at(-1).split('#')[0]]);
    for(const r of root.PMSVRecipeSamples.criteriaRows(P.syrupId,date).slice(1)){
      rows.push([date,P.syrupId,r[3],r[4]==='ingredient'?'Indian CTR named flour':'Indian CTR group entry for products of named flours',r[5],r[6],r[7],r[8],r[9]]);
    }
    return rows;
  }
  function animalCriteriaRows(id,date=root.PMSVVeterinary.reviewDate){
    const vet=root.PMSVVeterinary;
    const rows=[headers];
    for(const key of [vet.casingId,vet.eggPowderId]){
      if(id&&key!==id)continue;
      const data=exportRows(key,date);
      rows.push(...data.slice(1).filter(r=>r[2]===areas[5]&&r[3].startsWith('CTR 2.3.2(4)')||key===vet.eggPowderId&&r[2]===areas[0]&&!r[3].startsWith('Appendix A,')));
    }
    return rows;
  }
  root.PMSVTestingPlan=Object.freeze({sampleArea,grainProduct,microPhDecision,microFormRoute,microFormChoice,microFormRows,processingArea,processingRow,microSources,dairySamplingRows,marketSampleRows,focusIds,openScope,gapEvidence,isExportSource,scopedArea,scopedReferences,scopeReferenceExport,openProductRows,starchRows,sulphiteRows,incomingSamples,incomingExport,routeIds,routeNotes,routeSummary,ingredientRouteRows,sampleReviewRows,ingredients,catechuId,ingredientCriteria,ingredientRows,coffeeRows,powderRows,sugarCriteria,sugarRows,animalCriteriaRows,available:!!root.PMSVPesticides?.planRows && !!root.PMSVVeterinary?.planRows && !!sourceRows && Object.keys(sourceRows.products).length===64,areas,headers,entries,exportRows,metalRow,toxinRow,metalEdition,fishOilScreen,microCriteria,relevantForm});
})(globalThis);
