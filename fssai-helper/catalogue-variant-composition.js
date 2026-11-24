/* Per-form composition tables for Chapter 2.7. Numeric values come from catalogue-rule-data. */
(function (root) {
  'use strict';
  const ids = {
    '05-05-1-cocoa-powder': 'powder',
    '05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake': 'massCake',
    '05-05-3-chewing-gum-and-bubble-gum': 'gum'
  };
  const moistureFatFree = 'moisture- and fat-free basis';
  const cocoaFields = [
    ['moisture_max_pct', 'Moisture', '<=', 'as supplied'],
    ['cocoa_butter_min_pct_dry', 'Cocoa butter', '>=', 'dry basis'],
    ['cocoa_butter_pct_dry_range', 'Cocoa butter', 'range', 'dry basis'],
    ['cocoa_butter_max_pct_dry', 'Cocoa butter', '<=', 'dry basis'],
    ['cocoa_shell_and_germ_max_pct_fat_free_dry_matter', 'Shell and germ', '<=', 'fat-free dry matter'],
    ['cocoa_shell_max_pct_alkali_free', 'Shell only', '<=', 'alkali-free basis'],
    ['cocoa_butter_pct_range', 'Cocoa butter', 'range', 'as supplied'],
    ['acid_insoluble_ash_max_pct_moisture_fat_free', 'Acid-insoluble ash', '<=', moistureFatFree],
    ['alkalinity_total_ash_as_k2o_max_pct', 'Total ash alkalinity as K₂O', '<=', moistureFatFree],
    ['alkalinity_total_ash_as_k2o_max_pct_moisture_fat_free', 'Total ash alkalinity as K₂O', '<=', moistureFatFree],
    ['crude_fibre_max_pct_moisture_fat_free', 'Crude fibre', '<=', moistureFatFree]
  ];
  const sweeteners = {other:'Sugar or another sweetener is used (alone or in a mixture)', only:'Only artificial sweetener is used'};
  const columns = ['Composition limits by product variant', 'FSSAI composition table pages', 'Selected composition variant and sweetener basis', 'Measured composition result and comparison'];
  const profiles = new Map();
  for (const [id, kind] of Object.entries(ids)) {
    const evidence = root.PMSVCatalogueEvidence;
    const key = evidence.products[id].standard;
    const anchor = evidence.standards[key];
    const forms = root.PMSVCatalogueRules.standards[key].sections.variants.map(variant => {
      const rows = kind === 'gum'
        ? variant.composition.map(row => ({...row, analytical_basis:'as supplied', conditional:!!row.exception}))
        : cocoaFields.filter(([key]) => Object.hasOwn(variant,key)).map(([key,parameter,operator,analytical_basis]) => {
          const value = variant[key];
          const limits = operator === 'range' ? {min:value[0],max:value[1]} : {value};
          return {parameter,operator,...limits,analytical_basis,unit:'% by weight'};
        });
      return {name:variant.name,rows};
    });
    const pages = kind === 'gum' ? [5] : anchor.p;
    const source = evidence.documents[anchor.doc].url;
    profiles.set(id, {kind,forms,pages,source,article:key.split('#')[1]});
  }
  const colostrumId='100-100-cow-or-buffalo-colostrum-and-colostrum-products';
  const jellyId='100-100-royal-jelly';
  const documents=root.PMSVCatalogueEvidence.documents;
  const pdf=(key,page)=>documents[key].url+'#page='+page;
  const standard=id=>root.PMSVCatalogueRules.standards[root.PMSVCatalogueEvidence.products[id].standard];
  const dairyTable=pdf('food-31',9),jellyTable=pdf('food-35',25);
  const dairyFields=[
    ['moisture_max_pct','Moisture','<=','As supplied'],
    ['protein_min_pct','Protein','>=','Total nitrogen × 6.38'],
    ['fat_min_pct','Fat','>=','As supplied'],
    ['total_ash_db_max_pct','Total ash','<=','Dry basis'],
    ['immunoglobulins_g_igg_min_pct','Immunoglobulin G (IgG)','>=','IgG specifically, by mass'],
    ['lactoferrin_min_pct','Lactoferrin','>=','As supplied']
  ];
  const dairyForms=standard(colostrumId).sections.composition_by_form.map(form=>{
    const powder=Object.hasOwn(form,'total_ash_db_max_pct');
    const rows=dairyFields.filter(([key])=>Object.hasOwn(form,key)).map(([key,parameter,operator,analytical_basis])=>({
      parameter,operator,value:form[key],unit:'% by mass',analytical_basis,
      source:key==='immunoglobulins_g_igg_min_pct'?pdf('food-2',25)+(powder?' | '+pdf('food-2',26):''):dairyTable
    }));
    const checks=[{parameter:'Identity and sensory inspection',status:'Inspect and document the sample',
      notes:(powder?'Powder produced by drying cow or buffalo colostrum. ':'Cow or buffalo secretion collected within the stated three-to-five-day postpartum period, before ordinary milk production. ')+
        'Check for a creamy yellow appearance and characteristic, pleasant odour and taste.',source:pdf('food-31',8)+' | '+dairyTable},
      {parameter:'Food additives',status:'Check the formula',notes:powder?'Check any stabilizer, emulsifier or antioxidant against the milk-powder permission and its Appendix A limit.':'The standard excludes added food additives.',source:dairyTable}];
    if(powder)checks.push({parameter:'Scorched particles',status:'Compare with the reference disc',notes:'Maximum '+form.scorched_particles_max+'. Record the disc grade used by the laboratory.',source:dairyTable});
    return {name:form.variant,rows,checks};
  });
  const jelly=standard(jellyId);
  const jellyForms=jelly.sections.variants.map(form=>{
    const rows=[],checks=[{parameter:'Sample identity and feeding record',status:'Check the production record',
      notes:form.feed_basis+'. Use raw worker-bee secretion, filtered at most, with no added substances. Check appearance, odour and condition.',source:pdf('food-35',24)+' | '+jellyTable}];
    for(const {spec} of jelly.criteria){
      if(spec.when && spec.when.royal_jelly_type!==form.name){
        if(spec.applies_to==='Type 1')checks.push({parameter:spec.parameter,status:'Not applicable to Type 2',notes:'The Type 2 cell is marked NA.',source:jellyTable});
        continue;
      }
      if(spec.interpretation_status){
        checks.push({parameter:spec.parameter,status:'Review the source wording',notes:'The Gazette prints 62–68.5% by mass under a maximum heading. Record the measured moisture for manual interpretation.',source:jellyTable});
        continue;
      }
      const signed=spec.unit==='‰';
      rows.push({...spec,signed,source:jellyTable,analytical_basis:signed?'Signed carbon isotope delta in per mille':
        spec.parameter==='Total acidity'?'Titration with 1 mol/L sodium hydroxide, per 100 g of sample':'As supplied'});
    }
    checks.push({parameter:'Furosine',status:'Optional freshness indicator',notes:'The standard gives no numerical threshold for this optional check.',source:jellyTable});
    return {name:form.name,rows,checks};
  });
  const sampleProfiles=new Map([
    [colostrumId,{kind:'colostrum',article:'2.1.23',forms:dairyForms,source:documents['food-31'].url,pages:[8,9],
      sources:[pdf('food-31',8),dairyTable,pdf('food-2',25),pdf('food-2',26)],
      note:'Identify colostrum or colostrum powder. Record the source species and sample lot. Use an IgG-specific result under the amendment effective 1 May 2025. A formulation containing colostrum needs its own identity assessment.'}],
    [jellyId,{kind:'jelly',article:'2.8.3(3)',forms:jellyForms,source:documents['food-35'].url,pages:[24,25],
      sources:[pdf('food-35',24),jellyTable],
      note:'Select the type from the beekeeper’s feeding record. Type 1 bees receive natural food only. Type 2 bees also receive other nutrients. Check the sample is raw royal jelly before using either table.'}]
  ]);
  const profileFor=id=>profiles.get(id)||sampleProfiles.get(id);
  function limit(row) {
    const value = row.operator === 'range' ? row.min+'–'+row.max : ({'<=':'≤','>=':'≥'})[row.operator]+row.value;
    const unit=row.unit==='% by weight'?'%':' '+row.unit;
    return value+unit+' ('+row.analytical_basis+')';
  }
  function applicability(row,sweetener) {
    if (!row.conditional || sweetener === 'other') return '';
    return sweetener === 'only' ? 'Does not apply under the artificial-sweetener-only proviso' : 'Confirm the sweeteners used';
  }
  function note(kind) {
    if (kind === 'gum') return 'The reducing-sugars and sucrose limits depend on the sweeteners used. The other four limits apply to both formulations.';
    if (kind === 'powder') return 'The published dry-basis cocoa-butter limits overlap at 10% and 20%. Choose the declared grade before comparing.';
    return 'Cocoa cake has no cocoa-butter limit in this table. Shell only and shell plus germ have different reporting bases.';
  }
  function selected(id,state) {
    return profileFor(id)?.forms.find(form => form.name === state?.compVariant);
  }
  function enabled(id,state) {
    const form = selected(id,state);
    return (form?.rows || []).map((spec,i) => ({i:String(i),v:{spec,compare:true}}))
      .filter(({v}) => !applicability(v.spec,state.compSweetener));
  }
  function values(id,state,comparison) {
    const p=profileFor(id);
    if (!p) return columns.map(()=>'');
    const form=selected(id,state);
    const chosen=enabled(id,state).find(row=>row.i===state.criterion);
    const limits=p.forms.map(f=>f.name+' — '+f.rows.map(r=>r.parameter+' '+limit(r)+(r.conditional?' (except when only artificial sweetener is used)':'')).join('; ')).join(' | ');
    const recipe=p.kind==='gum' && form ? sweeteners[state.compSweetener] || 'Sweeteners unconfirmed' : '';
    const unit=chosen?.v.spec.unit==='% by weight'?'%':' '+(chosen?.v.spec.unit||'');
    const measured=chosen && state.result?.trim() ? chosen.v.spec.parameter+' '+state.result+unit+' · '+chosen.v.spec.analytical_basis+' · '+limit(chosen.v.spec)+' · '+comparison : '';
    const manual=p.forms.flatMap(f=>(f.checks||[]).map(c=>f.name+' · '+c.parameter+' · '+c.status+' · '+c.notes));
    return [[limits,p.note||note(p.kind),...manual].join(' | '),(p.sources||p.pages.map(n=>p.source+'#page='+n)).join(' | '),[form?.name,recipe].filter(Boolean).join(' · '),measured];
  }
  root.PMSVVariantComposition = {profiles,sampleProfiles,profileFor,columns,sweeteners,selected,enabled,limit,note,applicability,values};
})(globalThis);
