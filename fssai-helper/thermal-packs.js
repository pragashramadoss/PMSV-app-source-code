/* Thermally processed fruits and vegetables, FSSAI 2.3.1 and 2.3.3. */
(function (root) {
  'use strict';
  const measures=typeof module==='object' && module.exports ? require('./culinary-sauces.js') : root.PMSVCulinarySauces;
  const {clean,esc,link,sourceURL,minimumQuantity,drainedOutcome,fillOutcome}=measures;
  const fruitForms={ordinary:'Other fruit or cherries packed without stems',cherries:'Cherries packed with stems'};
  const stemBases={removed:'Stems removed before the drained weight was determined',included:'Stems included in the drained weight',unknown:'Preparation unconfirmed'};
  const packTypes={rigid:'Rigid container, including glass',flexible:'Flexible container'};
  const waterBases={stated:'Full distilled-water capacity at 20 °C',other:'Nominal, adjusted or measured on another basis'};
  const labelChecks={seen:'Declaration verified on label',missing:'Declaration missing or incomplete'};
  const unresolvedLabels='Unreviewed';

  function validReview(review,canned,catalogue,records) {
    if (review?.round!==90 || review.reviewedOn!=='2026-11-20' ||
        review.report!=='ctr-thermal-fruit-vegetable-packs-r90-2026-11-20.md' || !Array.isArray(review.products) ||
        review.products.length!==2 || review.fill?.pack!=='rigid' || review.fill.minimumPercent!==90 ||
        review.fill.waterTemperatureC!==20 || review.fill.volumeUnit!=='mL') return false;
    const expected=[
      {kind:'fruit',id:'04-04-1-thermally-processed-fruits',row:146,clause:'2.3.1',fcs:'04.1.2.4',label:'Thermally processed fruits',
       aliases:['canned fruit','canned cherries','cherries with stems','thermally processed cherries'],
       limits:[['liquid','(2)(i)',50,'Liquid pack'],['solid','(2)(ii)',70,'Solid pack']],pages:[52,1,29],para:3,date:'2020-12-29',
       file:'5fedb66ac1b15Gazette_Notification_FPS_Tenth_amendment_31_12_2020.pdf',hash:'3d9e51265f851a4edbd174b4c0fbdc68ac52e371996652f114a7ce2921e4b51b'},
      {kind:'vegetable',id:'04-04-2-thermally-processed-vegetables',row:185,clause:'2.3.3',fcs:'04.2.2.4',label:'Thermally processed vegetables',
       aliases:['canned vegetables','baked beans in sauce','canned peas','green beans in brine','vegetables packed in sauce'],
       limits:[['mushroom','(1)(i)(a)',50,'Liquid pack · mushrooms without sauce'],
         ['listed','(1)(i)(b)',50,'Liquid pack · green beans, carrots, peas, sweet corn or baby corn without sauce'],
         ['sauce','(1)(i)(c)',25,'Liquid pack · edible fungi or vegetables, including baked beans, packed in sauce'],
         ['other','(1)(i)(d)',50,'Liquid pack · other vegetables without sauce'],['solid','(1)(ii)',70,'Solid pack']],
       pages:[53,6,19],para:2,date:'2021-11-15',file:'619b553646e10Gazette_Notification_Oil_Flour_22_11_2021.pdf',
       hash:'bfd0d2b1e7cd3ab9d40f8edcf83c2e4cd540b4036d8d628085924b8e87393d7b'}
    ];
    const base='https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/';
    if (review.sources?.gazette?.url!=='https://fssai.gov.in/upload/uploadfiles/files/Food_Additives_Regulations.pdf' ||
        review.sources.gazette.sha256!=='bd31da71e3a3ea438d53e095187b72c337d89a0089bcfcc862ce252979e94f63' ||
        !['chapter','method'].every(key=>['url','sha256'].every(f=>review.sources[key]?.[f]===canned.sources[key][f])) ||
        review.sources.method.page!==5) return false;
    return review.products.every((p,i)=>{
      const e=expected[i],record=records.find(row=>row.id===p?.id);
      return p?.id===e.id && p.kind===e.kind && p.label===e.label && p.priority===e.row && p.clause===e.clause && p.fcs===e.fcs &&
        catalogue.some(c=>c.id===p.id && c.fssr===e.clause && c.fcs===e.fcs && c.priority===e.row) &&
        record?.reports.some(ref=>ref.round===90 && ref.file===review.report) && record.reports.some(ref=>ref.round===66) &&
        p.fillParagraph===e.para && p.gazettePage===e.pages[0] && p.chapterPage===e.pages[1] && p.amendment?.page===e.pages[2] &&
        p.amendment.date===e.date && p.amendment.sha256===e.hash && p.amendment.url===base+e.file &&
        JSON.stringify(p.aliases)===JSON.stringify(e.aliases) && Array.isArray(p.rows) && p.rows.length===e.limits.length &&
        p.rows.every((row,j)=>row?.key===e.limits[j][0] && row.provision===e.limits[j][1] &&
          row.minimumPercent===e.limits[j][2] && row.label===e.limits[j][3]);
    });
  }

  function assessDrained(product,key,fruit,stem,drained,net) {
    const row=product.rows.find(r=>r.key===key);
    if (!row) return {outcome:'Select the packing style to identify the minimum.'};
    const result={reference:'FSSAI '+product.clause+row.provision+' · minimum '+row.minimumPercent+'% of actual net contents'};
    const required=minimumQuantity(net,row.minimumPercent);
    if (required!==null) result.minimum='Minimum drained solids · '+required+' g';
    if (product.kind==='fruit') {
      if (!Object.hasOwn(fruitForms,fruit)) return {...result,outcome:'Confirm the fruit and whether cherries were packed with stems.'};
      if (fruit==='cherries' && stem!=='removed') return {...result,outcome:'Use a drained cherry weight determined after removing the stems.'};
    }
    return {...result,outcome:drainedOutcome(row.minimumPercent,drained,net)};
  }

  function assessFill(rule,type,basis,volume,capacity) {
    if (type!=='rigid') return {outcome:fillOutcome(rule,type,'','')};
    if (basis!=='stated') return {outcome:'Confirm full distilled-water capacity at '+rule.waterTemperatureC+' °C.'};
    const required=minimumQuantity(capacity,rule.minimumPercent);
    return {minimum:required===null?undefined:'Minimum occupied volume · '+required+' mL',outcome:fillOutcome(rule,type,volume,capacity)};
  }

  const lines=result=>[result.reference,result.minimum,result.outcome].filter(Boolean);
  const name=(options,key,missing='Unconfirmed')=>Object.hasOwn(options,key)?options[key]:missing;
  const id=key=>'tp-'+key;
  function select(key,label,choices,empty='Choose an option') {
    const options=Object.entries(choices).map(([value,text])=>'<option value="'+esc(value)+'">'+esc(text)+'</option>');
    return '<label for="'+id(key)+'">'+esc(label)+'</label><select id="'+id(key)+'"><option value="">'+esc(empty)+'</option>'+options.join('')+'</select>';
  }
  function input(key,label,numeric=false) {
    return '<label for="'+id(key)+'">'+esc(label)+'</label><input id="'+id(key)+'" type="text" autocomplete="off" '+
      (numeric?'inputmode="decimal" maxlength="32"':'maxlength="160"')+'>';
  }
  const status=(key,initial)=>'<p id="'+id(key)+'" class="fill-outcome" role="status">'+esc(initial)+'</p>';
  const control=(panel,key)=>panel.querySelector('#'+id(key));
  const value=(panel,key)=>clean(control(panel,key)?.value);
  const sources=(review,p)=>[
    ['2011 Gazette',{...review.sources.gazette,page:p.gazettePage}],
    [p.kind==='fruit'?'Cherry amendment':'Sauce-pack amendment',p.amendment],
    ['FSSAI consolidated chapter',{...review.sources.chapter,page:p.chapterPage}],
    ['Drained-weight method',review.sources.method]
  ];
  const labelMedium='Packing medium and strength';
  const labelVegetables='Vegetable names and percentage range of each';
  const labelCherries='Declaration for cherries packed with stems';
  const fillReference=(review,p)=>'FSSAI '+p.clause+'('+p.fillParagraph+') · Minimum '+review.fill.minimumPercent+'% of full distilled-water capacity at '+review.fill.waterTemperatureC+' °C for a rigid pack.';
  const readLabel=(panel,key)=>name(labelChecks,value(panel,key),unresolvedLabels);

  function markup(review,p) {
    const isFruit=p.kind==='fruit',rows=Object.fromEntries(p.rows.map(row=>[row.key,row.label]));
    const fruit=isFruit?select('fruit','Fruit as packed',fruitForms)+'<div id="tp-stem-fields" hidden>'+select('stem','Preparation of the drained cherry result',stemBases)+'</div>':'';
    const secondLabel=isFruit?'<div id="tp-cherry-label" hidden>'+select('cherry-check',labelCherries,labelChecks,unresolvedLabels)+'</div>':
      select('vegetable-check',labelVegetables,labelChecks,unresolvedLabels);
    const previousArticle=isFruit?'Fruit salad, cocktail and mix have a separate standard under 2.3.2.':'Canned tomatoes have a separate standard under 2.3.3A. Curried and ready-to-eat vegetables have a separate standard under 2.3.4.';
    return '<section class="panel compact thermal-packs" data-product="'+esc(p.id)+'"><h4>'+esc(p.label)+'</h4><p>FSSAI '+p.clause+'</p>'+
      input('lot','Lot or laboratory report reference (optional)')+input('food','Food and packing medium as labelled (optional)')+
      '<details open><summary>Drained weight</summary>'+select('style','Packing style for the drained-weight check',rows)+fruit+
      input('net','Actual net contents of the same container, excluding tare (g)',true)+input('drained','Drained solids from that container (g)',true)+
      status('drain-status','Select the packing style to identify the minimum.')+
      '<p id="tp-method"></p></details>'+
      '<details><summary>Container fill</summary><p>'+esc(fillReference(review,p))+'</p>'+
      select('container','Container type',packTypes)+'<div id="tp-fill-fields" hidden>'+
      select('water-basis','Water-capacity measurement basis',waterBases)+input('capacity','Full water capacity of the same container (mL)',true)+
      input('volume','Volume occupied by the product (mL)',true)+'</div>'+status('fill-status','Confirm the container type.')+'</details>'+
      '<details><summary>Label observations</summary>'+select('medium-check',labelMedium,labelChecks,unresolvedLabels)+secondLabel+'</details>'+
      '<p>'+esc(previousArticle)+'</p><div class="controls">'+sources(review,p).map(([label,source])=>link(sourceURL(source),label)).join('')+
      link(review.report,'Fruit and vegetable pack source review')+'</div></section>';
  }

  function methodLine(key) {
    if (!key) return '';
    return key==='sauce'?'Products in sauce · FSSAI section 1.4 describes a 0.3 mm sieve, washing away adhering material and draining for five minutes.':
      'Ordinary canned fruit or vegetables · FSSAI section 1.4 describes 2.5 mm square openings and a two-minute drain.';
  }

  const drainResult=(p,panel)=>assessDrained(p,value(panel,'style'),value(panel,'fruit'),value(panel,'stem'),value(panel,'drained'),value(panel,'net'));
  const fillResult=(review,panel)=>assessFill(review.fill,value(panel,'container'),value(panel,'water-basis'),value(panel,'volume'),value(panel,'capacity'));

  function briefLines(review,p,container) {
    const panel=container?.querySelector('.thermal-packs');
    if (panel?.dataset.product!==p.id) return [];
    const type=value(panel,'container'),fruit=value(panel,'fruit'),row=p.rows.find(r=>r.key===value(panel,'style'));
    const report=['',p.label+' · FSSAI '+p.clause];
    function include(key,label,unit='') {
      const text=value(panel,key); if (text) report.push(label+' · '+text+unit);
    }
    include('lot','Lot or laboratory report');include('food','Food and packing medium as labelled');
    report.push('Packing style · '+(row?.label||'Unconfirmed'));
    if (p.kind==='fruit') {
      report.push('Fruit as packed · '+name(fruitForms,fruit));
      if (fruit==='cherries') report.push('Cherry preparation · '+name(stemBases,value(panel,'stem')));
    }
    include('net','Actual net contents',' g');include('drained','Recorded drained solids',' g');
    report.push(...lines(drainResult(p,panel)));
    if (row) report.push(methodLine(row.key));
    report.push(fillReference(review,p),'Container type · '+name(packTypes,type));
    if (type==='rigid') {
      report.push('Water-capacity basis · '+name(waterBases,value(panel,'water-basis')));
      include('capacity','Full water capacity',' mL');include('volume','Occupied product volume',' mL');
    }
    report.push(...lines(fillResult(review,panel)),'Label observation · '+labelMedium+' · '+readLabel(panel,'medium-check'));
    if (p.kind==='vegetable') report.push('Label observation · '+labelVegetables+' · '+readLabel(panel,'vegetable-check'));
    if (fruit==='cherries') report.push('Label observation · '+labelCherries+' · '+readLabel(panel,'cherry-check'));
    report.push(...sources(review,p).map(([label,source])=>label+' · '+sourceURL(source)));
    return report;
  }

  const api=Object.freeze({validReview,assessDrained,assessFill,markup,briefLines});
  if (typeof module==='object' && module.exports) module.exports=api;
  root.PMSVThermalPacks=api;
  if (typeof document==='undefined') return;

  function update(event) {
    const field=event.target,panel=field.closest?.('.thermal-packs');
    if (!panel || (field.tagName==='SELECT' && event.type!=='change')) return;
    const review=root.PMSV_REVIEW_REGISTER.thermalPackReview;
    const product=review.products.find(p=>p.id===panel.dataset.product);
    switch(field.id) {
      case 'tp-fruit': {
        const stemmed=field.value==='cherries';
        control(panel,'stem-fields').hidden=!stemmed;control(panel,'cherry-label').hidden=!stemmed;
        control(panel,'stem').value='';control(panel,'cherry-check').value='';
        control(panel,'drained').value='';
        break;
      }
      case 'tp-style':
        control(panel,'method').textContent=methodLine(field.value);
        control(panel,'drained').value='';
        break;
      case 'tp-stem': control(panel,'drained').value='';break;
      case 'tp-container':
        control(panel,'fill-fields').hidden=field.value!=='rigid';
        for (const key of ['water-basis','volume','capacity']) control(panel,key).value='';
        break;
      case 'tp-water-basis': control(panel,'capacity').value='';break;
      case 'tp-volume': case 'tp-capacity':
      case 'tp-net': case 'tp-drained': break;
      default: return;
    }
    control(panel,'drain-status').textContent=lines(drainResult(product,panel)).join('\n');
    control(panel,'fill-status').textContent=lines(fillResult(review,panel)).join('\n');
  }
  document.addEventListener('input',update);
  document.addEventListener('change',update);
})(typeof globalThis==='object' ? globalThis : this);
