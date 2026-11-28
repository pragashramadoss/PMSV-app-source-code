/* Appendix A food-additive screen for sugar lots. Limits are on the sampled material. */
(function(root) {
  'use strict';
  const docs=root.PMSVCatalogueEvidence.documents;
  const area='Sulphite use and pack declaration';
  const profiles=new Map();
  const dry='11-11-1-dried-glucose-syrup';
  const declaration='DRIED GLUCOSE SYRUP FOR USE IN SUGAR CONFECTIONERY ONLY';
  const labelSource=docs['baser20-2'].url+'#page=29';
  function rule(key,form,category,maximum,pages,notes,manualBasis=false) {
    const source=pages.map(p=>docs['chapter-19'].url+'#page='+p).join(' | ');
    return {key,form,category,maximum,notes,source,manualBasis};
  }
  function sugar(slug,...rules){profiles.set('11-11-1-'+slug,rules);}
  sugar('refined-sugar',rule('refined','Refined sugar','11.1.1',20,[264],
    'Use the separately named refined-sugar line. The row gives a sulphites maximum without a numbered reporting-basis note.',true));
  sugar('dextrose',rule('dextrose','Dextrose anhydrous or monohydrate','11.1.1',15,[264,335],
    'Confirm the dextrose grade. Read note 44 on the sampled dextrose.'));
  sugar('icing-sugar',rule('icing','Icing sugar','11.1.2',20,[264,335],'Check powdered sugar against its own food category and note 44.'));
  sugar('khandsari-sugar',
    rule('sulphur','Khandsari sulphur sugar','11.1.3',150,[265,335],'Document the sulphur grade on the lot specification. Note 44 gives the residual SO₂ basis.'),
    rule('desi','Khandsari desi sugar','11.1.3',null,[265],'The desi entry permits no food additives. Check the formulation and manufacturing records. A detected residue alone does not establish direct addition.'));
  sugar('bura-sugar',rule('bura','Bura sugar','11.1.3',150,[265,335],'Confirm the named bura sugar grade and use note 44.'));
  sugar('dried-glucose-syrup',
    rule('dry-candy','Dried glucose syrup for sugar confectionery','11.1.3.1',150,[265,335,337],
      'The subcategory prints 20 mg/kg and invokes notes 111 and 44. Note 111 specifies 150 mg/kg for this documented use. Test the dried syrup lot.'),
    rule('dry-other','Dried glucose syrup for other use','11.1.3',150,[265,335,337],
      'The parent row lists dried glucose syrup at 150 mg/kg. An SO₂ result above 40 mg/kg triggers the confectionery-only pack declaration and conflicts with this intended use.'));
  sugar('edible-lactose',rule('lactose','Edible lactose','11.1.4',null,[265],
    'The lactose row permits no food additives. Verify direct addition from the formulation and manufacturing records. The entry gives no analytical zero limit.'));
  for(const [slug,form] of [['plantation-white-sugar','Plantation white sugar'],['cube-sugar','Cube sugar'],['misri','Misri']]){
    sugar(slug,rule('mill-white',form,'11.1.5',70,[265,266,335],'Match the product to the named forms in the continued Table 11 row. Note 44 expresses the result as residual SO₂.'));
  }
  for(const [slug,form,category] of [['gur-or-jaggery','Gur or jaggery','11.1.6'],['cane-jaggery-or-cane-gur','Cane jaggery or cane gur','11.1.6 / 11.1.6.1']]){
    sugar(slug,rule('jaggery',form,category,50,[266],'The jaggery row specifies a sulphite residue maximum in the end product. Review the laboratory reporting basis against that wording.',true));
  }
  profiles.set('11-11-3-golden-syrup',[
    rule('invert','Inverted sugar syrup outside category 11.1.3','11.3',70,[266,267,335],
      'Use the formulation and process record to confirm inversion of sugar and exclusion from category 11.1.3.'),
    rule('liquid-candy','Glucose syrup for sugar confectionery','11.1.3.2',400,[265,335,337],
      'The subcategory prints 20 mg/kg with notes 111 and 44 and includes golden syrup in parentheses. Apply the 400 mg/kg exception only with a specification confirming glucose syrup and its use in manufacturing sugar confectionery. A trade name alone cannot establish this category.')
  ]);
  const fields=['sulphiteForm','sulphiteReport','sulphiteValue','sulphiteBasis'];
  const choice=(id,s)=>profiles.get(id)?.find(r=>r.key===s?.sulphiteForm);
  const numeric=(operator,value,text)=>root.PMSVCatalogueWorksheets.compare({operator,value},String(text??'').trim().replace(/^\./,'0.'));
  function labelOutcome(s) {
    const above=numeric('>',40,s.sulphiteValue);
    if(above===null)return '';
    return above?'Rectangular box required on the dried syrup pack: '+declaration+'.'+(s.sulphiteForm==='dry-other'?' The declared other use conflicts with this restriction.':'')
      :'The dried-syrup declaration above 40 ppm is not triggered by this result.';
  }
  function assessment(id,s) {
    const r=choice(id,s);
    if(!r)return 'Select the sampled grade and intended use from the lot specification.';
    if(r.maximum===null)return r.notes;
    if(r.manualBasis)return r.notes+' Use a manual comparison for this row.';
    if(!s.reference?.trim()||!s.sulphiteReport?.trim()||s.sulphiteBasis!=='yes')return 'Enter the sample or lot, laboratory report and result. Confirm residual SO₂ in mg/kg on the sampled product.';
    const within=numeric('<=',r.maximum,s.sulphiteValue);
    if(within===null)return 'A non-negative numerical result is needed. Review ND, reporting limits and other qualifiers manually.';
    return (within?'Within':'Above')+' the Table 11 maximum of '+r.maximum+' mg/kg. '+(id===dry?labelOutcome(s):'');
  }
  function rows(id,state={}) {
    const rules=profiles.get(id)||[],selected=choice(id,state);
    const records=(selected?[selected]:rules).map(r=>{
      const notes=[r.notes];
      if(selected){
        if(state.reference?.trim())notes.push('Lot or sample: '+state.reference.trim()+'.');
        if(state.sulphiteReport?.trim())notes.push('Report: '+state.sulphiteReport.trim()+'.');
        if(state.sulphiteValue?.trim())notes.push('Entered result: '+state.sulphiteValue.trim()+'.');
        notes.push(assessment(id,state).trim());
      }
      return {area,article:'Appendix A, Table 11 · '+r.category,form:r.form,parameter:'Sulphites as food additives',status:selected?'Selected sample form':'Reference for this form only',
        limit:r.maximum===null?'No food additives permitted':String(r.maximum),unit:r.maximum===null?'':'mg/kg',notes:notes.join(' '),source:r.source};
    });
    if(id===dry)records.push({area,article:'Labelling and Display, Schedule II, 1(2), item 2',form:'Packaged dried glucose syrup',
      parameter:'Boxed use declaration',status:'Check the residual SO₂ result for this pack',limit:'> 40',unit:'ppm',
      notes:'Above 40 ppm by mass, the pack must carry the following wording in a rectangular box: '+declaration+'. At 40 ppm exactly this item does not trigger.',source:labelSource});
    return records;
  }
  root.PMSVSulphites=Object.freeze({profiles,area,dry,declaration,fields,choice,assessment,rows});
})(globalThis);
