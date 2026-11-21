/* Canned tomatoes, FSSAI 2.3.3A. */
(function (root) {
  'use strict';
  const measures=typeof module==='object' && module.exports ? require('./culinary-sauces.js') : root.PMSVCulinarySauces;
  const containers=typeof module==='object' && module.exports ? require('./tomato-containers.js') : root.PMSVTomatoContainers;
  const {esc,clean,link,sourceURL,criterionCard,criterionLines,compare,drainedOutcome}=measures;
  const {packLabels,capacityLabels,vacuumLabels,fillAssessment,fillLines,vacuumOutcome}=containers;
  const styles={whole:'Whole',diced:'Diced',sliced:'Sliced',wedges:'Wedges',pulp:'Pulp',crushed:'Crushed',chopped:'Chopped'};
  const peeling={peeled:'Peeled',unpeeled:'Unpeeled'};
  const media={water:'Water',juice:'Tomato juice',puree:'Tomato purée',solid:'Solid pack, no added liquid',other:'Other or unconfirmed medium'};
  const firming={yes:'Added as a firming agent',no:'No calcium chloride added',unknown:'Use unconfirmed'};
  const regularMedium=medium=>['water','juice','puree'].includes(medium);
  const missingStyle='Select the tomato style to identify the limit.';
  const missingPeel='Select the tomato style and peel declaration to identify the peel defect.';
  const fillBasis='Full water capacity is measured with distilled water at 27 °C. For glass, deduct 20 mL once before applying the 90% minimum.';
  const canScope='Paragraph (8) describes the can. Check the scope of its rows separately for this container.';

  function validReview(r,juice,catalogue) {
    if (r?.id!=='04-04-2-canned-tomatoes' || r.clause!=='2.3.3A' || r.label!=='Canned tomatoes' ||
        r.round!==89 || r.reviewedOn!=='2026-11-20' || r.report!=='ctr-canned-tomatoes-r89-2026-11-20.md' ||
        !catalogue.some(c=>c.id===r.id && c.priority===186 && c.fssr===r.clause && c.fcs==='04.2.2.4') ||
        JSON.stringify(r.aliases)!=='["tinned tomatoes","whole peeled tomatoes","canned diced tomatoes","canned chopped tomatoes"]') return false;
    const expected={
      salt:{label:'Added common salt',maximum:3,provision:'(5)(1)',basis:'Added salt, % of net weight, corrected for natural chlorides'},
      ph:{label:'Covering-liquid pH',maximum:4.5,unit:'pH',provision:'(5)(3)',basis:'Measured pH of the covering liquid'},
      calcium:{label:'Total calcium ions',whole:0.045,nonwhole:0.080,precision:3,provision:'(5)(2)',basis:'Total calcium-ion content, %'},
      blemish:{label:'Aggregate blemish area',maximum:3.5,unit:'cm²/kg',provision:'(7)(1)',basis:'Aggregate area in cm² per 1 kg net weight'},
      peel:{whole:30,nonwhole:125,unit:'cm²/kg',peeledProvision:'(7)(2)',unpeeledProvision:'(7)(3)',basis:'Aggregate area in cm² per 1 kg net weight'}
    };
    const rulesMatch=Object.entries(expected).every(([key,required])=>{
      const item=r[key];
      return item?.key===key && item.minimum===undefined && item.maximum===required.maximum && item.unit===required.unit &&
        item.precision===required.precision && typeof item.otherBasis==='string' &&
        item.otherBasis.trim() && Object.entries(required).every(([field,value])=>item[field]===value);
    });
    return rulesMatch && r.naturalChloridesPercentOfDryWeight===2 &&
      r.can?.drainedMinimumPercent===56 && r.can.headspaceMaximumMm===7 && r.can.vacuum==='Negative' &&
      ['minimumPercent','glassDeductionMl','waterTemperatureC','volumeUnit'].every(k=>r.fill?.[k]===juice.fill[k]) &&
      [['amendment',9,juice.amendment],['chapter',9,juice.sources.chapter],['method',5,juice.sources.method]].every(([key,page,source])=>
        r.sourcePages?.[key]===page && r.sources?.[key]?.page===page &&
        ['url','sha256'].every(field=>r.sources[key][field]===source[field]));
  }

  function styleRules(r,style,peel,medium,agent) {
    if (!Object.hasOwn(styles,style)) return {};
    const form=style==='whole' ? 'whole' : 'nonwhole';
    const rules={};
    if (Object.hasOwn(peeling,peel)) {
      rules.peel={...r.peel,maximum:r.peel[form],label:peel==='peeled'?'Peel present on peeled tomatoes':'Peel missing from unpeeled tomatoes',
        provision:peel==='peeled'?r.peel.peeledProvision:r.peel.unpeeledProvision};
    }
    if (regularMedium(medium) && agent==='yes') rules.calcium={...r.calcium,maximum:r.calcium[form]};
    return rules;
  }

  const headspace=r=>({key:'headspace',label:'Can headspace',maximum:r.can.headspaceMaximumMm,unit:'mm',
    basis:'From the top of the double seam to the contents, mm',otherBasis:'Another dimension or unconfirmed unit',provision:'(8), row 2'});
  const ref=(r,provision)=>'FSSAI '+r.clause+provision;
  const card=(r,rule)=>criterionCard(rule,'ct',null,ref(r,rule.provision));
  const pick=(id,label,options)=>'<label for="ct-'+id+'">'+esc(label)+'</label><select id="ct-'+id+'"><option value="">Choose an option</option>'+
    Object.entries(options).map(([key,value])=>'<option value="'+esc(key)+'">'+esc(value)+'</option>').join('')+'</select>';
  const input=(id,label)=>'<label for="ct-'+id+'">'+esc(label)+'</label><input id="ct-'+id+'" type="text" inputmode="decimal" maxlength="32" autocomplete="off">';
  const note=text=>'<p>'+esc(text)+'</p>';
  const status=(id,text)=>'<p class="fill-outcome" role="status" id="ct-'+id+'">'+esc(text)+'</p>';
  const val=(panel,id)=>clean(panel.querySelector('#ct-'+id)?.value);
  const field=(panel,id)=>panel.querySelector('#ct-'+id);
  const selectedRules=(r,panel)=>styleRules(r,val(panel,'style'),val(panel,'peel-state'),val(panel,'medium'),val(panel,'firming'));

  function mediumNote(value) {
    if (value==='solid') return 'Solid pack has no added covering liquid. Paragraph (5) addresses the packing medium.';
    if (value==='other') return 'Identify the medium and review its coverage under paragraph (5).';
    return 'Select a packing medium to identify the applicable checks.';
  }

  function calciumNote(agent) {
    if (agent==='no') return 'The calcium-ion limit in (5)(2) is conditional on added calcium chloride as a firming agent.';
    if (agent==='yes') return missingStyle;
    return 'Confirm whether calcium chloride was added as a firming agent.';
  }

  function mediumFields(r,medium) {
    if (!regularMedium(medium)) return note(mediumNote(medium));
    return note('For the added-salt result, the standard treats natural chlorides as 2% of dry weight.')+
      '<div class="paste-grid">'+card(r,r.salt)+card(r,r.ph)+'</div>'+
      pick('firming','Calcium chloride in this packing medium',firming)+'<div id="ct-calcium-card">'+note(calciumNote(''))+'</div>';
  }

  function packFields(r,pack) {
    if (!Object.hasOwn(packLabels,pack)) return note('Confirm the container material.');
    const can=pack==='can' ? '<h5>Drained weight</h5>'+note(ref(r,'(8), row 3')+' · Minimum 56% of the actual net contents of the can.')+
      input('drained','Drained tomato solids from this can (g)')+input('net','Actual net contents of the same can, excluding tare (g)')+
      status('drained-outcome',drainedOutcome(r.can.drainedMinimumPercent,'',''))+
      '<details><summary>Drained-weight method</summary>'+note('FSSAI section 1.4 specifies a sieve with 11.2 mm square openings for canned tomatoes and a two-minute drain. Net weight is gross weight less can tare.')+
      link(sourceURL(r.sources.method),'FSSAI method · section 1.4')+'</details>'+
      '<h5>Vacuum and headspace</h5>'+pick('vacuum','Can vacuum observation',vacuumLabels)+note(ref(r,'(8), row 1')+' · Negative gauge pressure required.')+
      status('vacuum-outcome',vacuumOutcome(''))+card(r,headspace(r)) : note(canScope);
    return can+'<h5>Volume fill</h5>'+note(ref(r,'(9)')+' · '+fillBasis)+pick('capacity-basis','Water-capacity measurement basis',capacityLabels)+
      input('capacity','Full measured water capacity before any glass deduction (mL)')+input('volume','Volume occupied by product (mL)')+
      status('fill-outcome',fillAssessment(r.fill,pack,'','','','product').outcome);
  }

  function markup(r) {
    return '<section class="panel compact canned-tomatoes" data-product="'+esc(r.id)+'"><h4>Canned tomatoes</h4>'+note(ref(r,''))+
      '<label for="ct-lot">Lot or laboratory report reference (optional)</label><input id="ct-lot" type="text" maxlength="160" autocomplete="off">'+
      '<details open><summary>Can weights and container fill</summary>'+pick('pack','Container material',packLabels)+'<div id="ct-pack-fields"></div></details>'+
      '<details open><summary>Tomato style and defects</summary>'+pick('style','Declared tomato style',styles)+pick('peel-state','Peel declaration',peeling)+
      '<div class="paste-grid">'+card(r,r.blemish)+'<div id="ct-peel-card">'+note(missingPeel)+'</div></div></details>'+
      '<details open><summary>Covering liquid and firming agent</summary>'+pick('medium','Packing medium',media)+
      '<div id="ct-medium-fields">'+note(mediumNote(''))+'</div></details>'+
      '<details><summary>Appearance and texture on opening</summary>'+note('Inspect colour, odour, firmness, uniformity and visible damage under paragraph (6). Record peel left on peeled fruit or missing from unpeeled fruit.')+'</details>'+
      '<div class="controls">'+link(sourceURL(r.sources.amendment),'2017 Gazette · canned tomatoes')+link(sourceURL(r.sources.chapter),'FSSAI chapter · canned tomatoes')+
      link(sourceURL(r.sources.method),'Drained-weight method')+link(r.report,'Canned tomato source review')+'</div></section>';
  }

  const fillResult=(r,p)=>fillAssessment(r.fill,val(p,'pack'),val(p,'capacity-basis'),val(p,'volume'),val(p,'capacity'),'product');
  function briefLines(r,container) {
    const panel=container?.querySelector('.canned-tomatoes');
    if (panel?.dataset.product!==r.id) return [];
    const style=val(panel,'style'),peel=val(panel,'peel-state'),medium=val(panel,'medium'),agent=val(panel,'firming'),pack=val(panel,'pack');
    const rules=selectedRules(r,panel),lot=val(panel,'lot');
    const lines=['',r.label+' · '+ref(r,'')];
    if (lot) lines.push('Lot or laboratory report · '+lot.slice(0,160));
    const append=rule=>lines.push(ref(r,rule.provision),...criterionLines(rule,panel.querySelector('[data-criterion="'+rule.key+'"]')));
    lines.push('Tomato style · '+(styles[style]||'Unconfirmed'),'Peel declaration · '+(peeling[peel]||'Unconfirmed'));
    append(r.blemish);
    if (rules.peel) append(rules.peel); else lines.push(missingPeel);
    lines.push('Packing medium · '+(media[medium]||'Unconfirmed'));
    if (regularMedium(medium)) {
      append(r.salt); append(r.ph);
      lines.push('Calcium chloride · '+(firming[agent]||'Unconfirmed'));
      if (rules.calcium) append(rules.calcium); else lines.push(calciumNote(agent));
    } else lines.push(mediumNote(medium));
    lines.push('Container material · '+(packLabels[pack]||'Unconfirmed'));
    if (pack==='can') {
      lines.push(ref(r,'(8), row 3')+' · Drained weight minimum '+r.can.drainedMinimumPercent+'% of net contents');
      if (val(panel,'drained')) lines.push('Drained tomato solids · '+val(panel,'drained')+' g');
      if (val(panel,'net')) lines.push('Actual net contents · '+val(panel,'net')+' g');
      lines.push(drainedOutcome(r.can.drainedMinimumPercent,val(panel,'drained'),val(panel,'net')));
      const vacuum=val(panel,'vacuum');
      lines.push(ref(r,'(8), row 1')+' · Vacuum · '+(vacuumLabels[vacuum]||'Unconfirmed'),vacuumOutcome(vacuum));
      append(headspace(r));
    } else if (Object.hasOwn(packLabels,pack)) lines.push(canScope);
    lines.push(ref(r,'(9)')+' · '+fillBasis);
    if (Object.hasOwn(packLabels,pack)) {
      lines.push('Water-capacity basis · '+(capacityLabels[val(panel,'capacity-basis')]||'Unconfirmed'));
      if (val(panel,'capacity')) lines.push('Full water capacity · '+val(panel,'capacity')+' mL');
      if (val(panel,'volume')) lines.push('Volume occupied by product · '+val(panel,'volume')+' mL');
    }
    lines.push(...fillLines(fillResult(r,panel),'product'),'2017 Gazette · '+sourceURL(r.sources.amendment),
      'FSSAI chapter · '+sourceURL(r.sources.chapter),'Drained-weight method · '+sourceURL(r.sources.method));
    return lines;
  }

  const api=Object.freeze({validReview,styleRules,drainedOutcome,markup,briefLines});
  if (typeof module==='object' && module.exports) module.exports=api;
  root.PMSVCannedTomatoes=api;
  if (typeof document==='undefined') return;
  function update(event) {
    const target=event.target,panel=target.closest?.('.canned-tomatoes');
    if (!panel) return;
    const r=root.PMSV_REVIEW_REGISTER.cannedTomatoReview;
    const ruleCard=target.closest('.paste-criterion');
    if (ruleCard) {
      const key=ruleCard.dataset.criterion,rule=key==='headspace'?headspace(r):selectedRules(r,panel)[key]||r[key];
      ruleCard.querySelector('.paste-outcome').textContent=compare(rule,ruleCard.querySelector('.paste-basis').value,ruleCard.querySelector('.paste-value').value);
      return;
    }
    if (target.matches('select') && event.type!=='change') return;
    switch (target.id) {
      case 'ct-pack': field(panel,'pack-fields').innerHTML=packFields(r,target.value); break;
      case 'ct-medium': field(panel,'medium-fields').innerHTML=mediumFields(r,target.value); break;
      case 'ct-style':
      case 'ct-peel-state':
      case 'ct-firming': {
        const rules=selectedRules(r,panel);
        if (target.id!=='ct-firming') field(panel,'peel-card').innerHTML=rules.peel?card(r,rules.peel):note(missingPeel);
        const calcium=field(panel,'calcium-card');
        if (calcium && target.id!=='ct-peel-state') calcium.innerHTML=rules.calcium?card(r,rules.calcium):note(calciumNote(val(panel,'firming')));
        break;
      }
      case 'ct-drained':
      case 'ct-net': field(panel,'drained-outcome').textContent=drainedOutcome(r.can.drainedMinimumPercent,val(panel,'drained'),val(panel,'net')); break;
      case 'ct-vacuum': field(panel,'vacuum-outcome').textContent=vacuumOutcome(target.value); break;
      case 'ct-capacity-basis':
      case 'ct-capacity':
      case 'ct-volume': field(panel,'fill-outcome').textContent=fillLines(fillResult(r,panel),'product').join('\n'); break;
    }
  }
  document.addEventListener('input',update);
  document.addEventListener('change',update);
})(typeof globalThis==='object' ? globalThis : this);
