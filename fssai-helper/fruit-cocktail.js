/* Lot checks for FSSAI 2.3.2, Thermally Processed Fruit Salad/Cocktail/Mix. */
(function (root) {
  'use strict';
  const common = typeof module === 'object' && module.exports ? require('./culinary-sauces.js') : root.PMSVCulinarySauces;
  const {decimal, decimalText, minimumQuantity, fillPercentText, clean, esc, link, sourceURL} = common;
  const media = {
    water:'Water · no added sugar', blend:'Water and juice · no added sugar', juice:'Juice only · no added sugar',
    sugarWater:'Water with added sugar', sugarBlend:'Water and juice with added sugar', sugarJuice:'Juice with added sugar'
  };
  const sweetened = key => ['sugarWater','sugarBlend','sugarJuice'].includes(key);
  const usesNames = key => ['blend','juice','sugarJuice'].includes(key);
  const sampleTypes = {tropical:'Canned tropical fruit salad',other:'Other presentation or identity unconfirmed'};
  const exactBases = {stated:'Matches the specified sample and unit',other:'Different or unconfirmed sample basis'};
  const brixBases = {stated:'Cut-out strength of the finished liquid packing medium',other:'Other sample or stage'};
  const basisChoices = rule => ({stated:'Measured ' + rule.basis,other:'Nominal capacity, net contents or another basis'});
  const choice = (options, key) => Object.hasOwn(options,key) ? options[key] : 'Unconfirmed';
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);

  function validReview(r,thermal,rows,records) {
    if (!r || r.round !== 91 || r.reviewedOn !== '2026-11-20' || r.report !== 'ctr-fruit-cocktail-r91-2026-11-20.md' ||
        r.id !== '04-04-1-thermally-processed-fruit-salad-cocktail-mix' || r.priority !== 147 || r.clause !== '2.3.2' || r.fcs !== '04.1.2.4' ||
        r.temperatureC !== 20 || r.juiceSharePercent !== 50 || r.label !== 'Thermally processed fruit salad, cocktail and mix') return false;
    if (!same(r.packForms,['Canned','Bottled','Flexible pack','Aseptically packed']) ||
        !same(r.aliases,['fruit cocktail','canned fruit cocktail','fruit salad','thermally processed fruit mix','canned tropical fruit salad'])) return false;
    function validRule(rule,provision,minimum,unit,quantity) {
      return rule?.provision === provision && rule.minimumPercent === minimum && rule.unit === unit &&
        rule.basis === quantity+' of distilled water at 20 °C that completely fills the sealed container';
    }
    if (!validRule(r.drained,'(2)(B)(vi)',50,'g','mass') || !validRule(r.fill,'(2)(B)(v)',90,'mL','volume')) return false;
    const limits = [
      ['10','13.9','Extra light sweetened','Slightly sweetened water / Extra light syrup'],['14','17.9','Lightly sweetened','Light syrup'],
      ['18','21.9','Heavily sweetened','Heavy syrup'],['22',null,'Extra heavy sweetened','Extra heavy syrup']
    ];
    if (!Array.isArray(r.bands) || !same(r.bands.map(b=>[b?.min,b?.max,b?.juice,b?.syrup]),limits)) return false;
    const defects = [
      ['blemishes','2','pieces per 100 g of drained fruit',true],['peel','6.5','cm² per 500 g of total contents, averaged',false],
      ['seeds','2','g per 500 g of total contents',false]
    ];
    if (!Array.isArray(r.defects) || !same(r.defects.map(d=>[d?.key,d?.limit,d?.basis,Boolean(d?.wholeCount)]),defects)) return false;
    const source = r.sources;
    const final = source?.amendment;
    if (final?.date !== '2018-11-19' || final.page !== 18 || final.sha256 !== 'bb57f6240992c08792f0fe8b24132df751cb1205fa078bcd9dbdbd6a72ad72d5' ||
        final.url !== 'https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/5bfd0937e84e3Gazette_Notification_DatePasta_27_11_2018.pdf') return false;
    if (!['chapter','gazette'].every(key=>['url','sha256'].every(f=>source[key]?.[f] === thermal?.sources?.[key]?.[f])) ||
        source.chapter.page !== 4 || source.gazette.page !== 52) return false;
    const record = records.find(x=>x.id === r.id);
    return rows.some(x=>x.id===r.id && x.priority===147 && x.fssr===r.clause && x.fcs===r.fcs) &&
      record?.reports.some(ref=>ref.round===91 && ref.file===r.report) && record.reports.some(ref=>ref.round===66);
  }

  const number = raw => decimal(clean(raw));
  const difference = (a,b) => a.n*b.scale - b.n*a.scale;
  function assessMeasurement(rule,basis,observed,capacity) {
    const isVolume = rule.unit === 'mL';
    if (basis !== 'stated') return 'Confirm the '+rule.basis+'.';
    const reference = number(capacity);
    if (!reference || reference.n === 0n) return 'Enter a positive measured water capacity in '+rule.unit+'.';
    const minimum = minimumQuantity(capacity,rule.minimumPercent);
    const first = (isVolume ? 'Minimum occupied volume' : 'Minimum drained fruit')+' · '+minimum+' '+rule.unit;
    const actual = number(observed);
    if (!actual) return first+'\nEnter the '+(isVolume ? 'volume of fruit plus medium' : 'drained fruit weight')+' in '+rule.unit+'.';
    const numerator = actual.n*reference.scale, denominator = reference.n*actual.scale;
    if (isVolume && numerator > denominator) return first+'\nOccupied volume exceeds the full measured capacity. Check both volumes.';
    const lines = [first,fillPercentText(numerator,denominator,rule.minimumPercent)];
    const required = number(minimum);
    const shortfall = difference(required,actual);
    if (shortfall > 0n) lines.push('Shortfall · '+decimalText(shortfall,required.scale*actual.scale)+' '+rule.unit);
    return lines.join('\n');
  }

  function assessMedium(review,key,names,share,basis,reading) {
    if (!Object.hasOwn(media,key)) return 'Select the packing medium and added-sugar status.';
    const fruit = clean(names) || '[fruit name(s)]';
    const waterLabel = 'In water or Packed in water';
    if (key === 'water') return waterLabel;
    if (key === 'juice') return 'In '+fruit+' juice';
    if (key === 'blend') {
      const percent = number(share);
      if (!percent || percent.n === 0n || percent.n >= 100n*percent.scale)
        return 'Enter the juice percentage by volume between 0 and 100 for this mixture. Select a single medium for 0% or 100%.';
      return percent.n >= BigInt(review.juiceSharePercent)*percent.scale ? fruit+' juice and water' : waterLabel;
    }
    if (basis !== 'stated') return 'Confirm the cut-out strength of the finished packing medium.';
    const value = number(reading);
    if (!value || value.n > 100n*value.scale) return 'Enter the reported cut-out strength in °Brix (0–100).';
    if (difference(value,number(review.bands[0].min)) < 0n)
      return key === 'sugarJuice' ? 'Below the 10 °Brix minimum for sweetened fruit juice.' : 'Below the first published syrup band (10 °Brix).';
    const band = review.bands.find(b=>difference(value,number(b.min)) >= 0n && (b.max === null || difference(value,number(b.max)) <= 0n));
    if (!band) return 'Between the published bands. Check the laboratory reporting precision.';
    return key === 'sugarJuice' ? band.juice+' '+fruit+' juice' : band.syrup;
  }

  function assessDefect(rule,identity,basis,result) {
    if (identity !== 'tropical') return 'Confirm canned tropical fruit salad for this defect table.';
    if (basis !== 'stated') return 'Confirm the reporting basis · '+rule.basis+'.';
    const actual = number(result);
    if (!actual) return 'Enter the result on the stated basis.';
    if (rule.wholeCount && actual.n%actual.scale !== 0n) return 'Enter the whole number of pieces counted in 100 g of drained fruit.';
    return difference(actual,number(rule.limit)) <= 0n ? 'Within this maximum' : 'Above this maximum';
  }

  function defectScope(identity,pack) {
    if (identity !== 'tropical') return 'Confirm canned tropical fruit salad for this defect table.';
    if (pack === 'Bottled' || pack === 'Flexible pack') return 'Reconcile the recorded '+pack.toLowerCase()+' format with the canned tropical fruit salad identity.';
    return '';
  }
  const sources = r => [['FSSAI Chapter 2.3, p. 4',r.sources.chapter],['2018 replacement, pp. 18–20',r.sources.amendment]];
  function select(key,label,choices) {
    const items = Object.entries(choices).map(([k,v])=>'<option value="'+esc(k)+'">'+esc(v)+'</option>').join('');
    return '<label for="fc-'+key+'">'+esc(label)+'</label><select id="fc-'+key+'"><option value="">Choose an option</option>'+items+'</select>';
  }
  function input(key,label,numeric=true) {
    return '<label for="fc-'+key+'">'+esc(label)+'</label><input id="fc-'+key+'" type="text" autocomplete="off" '+
      (numeric ? 'inputmode="decimal" maxlength="32"' : 'maxlength="160"')+'>';
  }
  const status = (key,s) => '<p class="fill-outcome" id="fc-'+key+'" role="status">'+esc(s)+'</p>';
  const group = (key,content) => '<div id="fc-'+key+'" hidden>'+content+'</div>';
  const titles = {drained:'Drained fruit',fill:'Container fill'};
  function ruleLine(r,key) {
    const rule = r[key];
    return 'FSSAI '+r.clause+rule.provision+' · Minimum '+rule.minimumPercent+'% of the '+rule.basis+'.';
  }
  function measurementMarkup(r,key) {
    const rule = r[key], volume = key==='fill';
    return '<details'+(volume?'':' open')+'><summary>'+titles[key]+'</summary><p>'+esc(ruleLine(r,key))+'</p>'+
      select(key+'-basis','Reference measurement',basisChoices(rule))+
      input(key+'-capacity',volume?'Full distilled-water capacity (mL)':'Weight of distilled water that fills this container (g)')+
      input(key+'-actual',volume?'Volume occupied by fruit plus packing medium (mL)':'Drained fruit from this container (g)')+
      status(key+'-result',assessMeasurement(rule,'','',''))+'</details>';
  }
  function defectMarkup(d) {
    return '<div class="paste-criterion"><h5>'+esc(d.label)+'</h5><p>Maximum '+esc(d.limit+' '+d.basis)+'</p>'+
      select(d.key+'-basis','Laboratory sample basis',exactBases)+input(d.key,d.reportLabel)+
      status(d.key+'-result',assessDefect(d,'tropical','',''))+'</div>';
  }
  function markup(r) {
    const packs = Object.fromEntries(r.packForms.map(p=>[p,p]));
    return '<section class="panel compact fruit-cocktail" data-product="'+esc(r.id)+'"><h4>'+esc(r.label)+'</h4>'+
      '<p>FSSAI '+r.clause+' · Use for heat-processed mixed fruits packed in liquid.</p>'+
      input('lot','Lot or laboratory report reference (optional)',false)+select('pack','Pack format as supplied (optional)',packs)+
      measurementMarkup(r,'drained')+measurementMarkup(r,'fill')+
      '<details><summary>Packing medium and label</summary><p>Use juice from the fruits in the product. Put the medium designation in or close to the product name.</p>'+
      select('medium','Packing medium and added sugar',media)+group('names-fields',input('names','Fruit name(s) used for the juice',false))+
      group('share-fields',input('share','Juice share of the packing medium by volume (%)'))+
      group('brix-fields',select('brix-basis','Basis of the °Brix result',brixBases)+input('brix','Reported cut-out strength (°Brix)'))+
      status('medium-result',assessMedium(r,''))+'</details>'+
      '<details><summary>Canned tropical fruit salad defects</summary>'+select('identity','Product as identified in the inspection report',sampleTypes)+
      group('defect-fields','<p>Check the blend’s characteristic colour, flavour and odour, and the texture of each fruit.</p><div class="paste-grid">'+r.defects.map(defectMarkup).join('')+'</div>')+
      status('identity-result','Confirm canned tropical fruit salad for this defect table.')+'</details>'+
      '<div class="controls">'+sources(r).map(([s,ref])=>link(sourceURL(ref),s)).join('')+link(r.report,'Fruit cocktail source review')+'</div></section>';
  }

  const field = (panel,key) => panel.querySelector('#fc-'+key);
  const value = (panel,key) => clean(field(panel,key).value);
  const measurement = (r,p,key) => assessMeasurement(r[key],value(p,key+'-basis'),value(p,key+'-actual'),value(p,key+'-capacity'));
  const medium = (r,p) => assessMedium(r,value(p,'medium'),value(p,'names'),value(p,'share'),value(p,'brix-basis'),value(p,'brix'));
  function briefLines(r,container) {
    const p = container?.querySelector('.fruit-cocktail');
    if (p?.dataset.product !== r.id) return [];
    const lines = ['',r.label+' · FSSAI '+r.clause];
    function add(key,label,unit='') {const v=value(p,key); if(v) lines.push(label+' · '+v+unit);}
    add('lot','Lot or laboratory report');add('pack','Pack format');
    for (const key of ['drained','fill']) {
      const rule=r[key], unit=' '+rule.unit;
      lines.push(titles[key],ruleLine(r,key),'Reference measurement · '+choice(basisChoices(rule),value(p,key+'-basis')));
      add(key+'-capacity',key==='drained'?'Full water mass':'Full water volume',unit);
      add(key+'-actual',key==='drained'?'Measured drained fruit':'Occupied volume including medium',unit);
      lines.push(measurement(r,p,key));
    }
    const key=value(p,'medium');
    lines.push('Packing medium · '+choice(media,key));
    if (usesNames(key)) add('names','Fruit used for juice');
    if (key==='blend') add('share','Juice by volume','%');
    if (sweetened(key)) {
      lines.push('°Brix basis · '+choice(brixBases,value(p,'brix-basis')));
      add('brix','Reported liquid strength',' °Brix');
    }
    lines.push('Packing-medium declaration · '+medium(r,p));
    const identity=value(p,'identity');
    lines.push('Defect inspection · '+choice(sampleTypes,identity));
    const scope=defectScope(identity,value(p,'pack'));
    if (scope) lines.push(scope);
    else for (const d of r.defects) {
      const basis=value(p,d.key+'-basis');
      lines.push(d.label+' · maximum '+d.limit+' '+d.basis,'Sample basis · '+choice(exactBases,basis));
      add(d.key,'Reported result');
      lines.push(assessDefect(d,identity,basis,value(p,d.key)));
    }
    lines.push(...sources(r).map(([label,ref])=>label+' · '+sourceURL(ref)));
    return lines;
  }

  const api=Object.freeze({validReview,assessMeasurement,assessMedium,assessDefect,markup,briefLines});
  if (typeof module === 'object' && module.exports) module.exports=api;
  root.PMSVFruitCocktail=api;
  if (typeof document==='undefined') return;

  function update(event) {
    const target=event.target,p=target.closest?.('.fruit-cocktail');
    if (!p || (target.tagName==='SELECT' && event.type!=='change')) return;
    const r=root.PMSV_REVIEW_REGISTER.fruitCocktailReview;
    const id=target.id.slice(3), key=value(p,'medium'), identity=value(p,'identity');
    function clear(keys) {for (const k of keys) field(p,k).value='';}
    if (id==='medium') {
      clear(['names','share','brix-basis','brix']);
      field(p,'names-fields').hidden=!usesNames(key);
      field(p,'share-fields').hidden=key!=='blend';
      field(p,'brix-fields').hidden=!sweetened(key);
    } else if (id==='brix-basis') {
      clear(['brix']);
    } else if (id==='drained-basis' || id==='fill-basis') {
      clear([id.replace('-basis','-capacity')]);
    } else if (id==='identity' || id==='pack') {
      for (const d of r.defects) clear([d.key,d.key+'-basis']);
      const scope=defectScope(identity,value(p,'pack'));
      field(p,'defect-fields').hidden=Boolean(scope);
      field(p,'identity-result').hidden=!scope;
      field(p,'identity-result').textContent=scope;
    } else if (r.defects.some(d=>id===d.key+'-basis')) {
      clear([id.replace('-basis','')]);
    }
    for (const type of ['drained','fill']) field(p,type+'-result').textContent=measurement(r,p,type);
    field(p,'medium-result').textContent=medium(r,p);
    if (!defectScope(identity,value(p,'pack'))) for (const d of r.defects)
      field(p,d.key+'-result').textContent=assessDefect(d,identity,value(p,d.key+'-basis'),value(p,d.key));
  }
  document.addEventListener('input',update);
  document.addEventListener('change',update);
})(typeof globalThis==='object' ? globalThis : this);
