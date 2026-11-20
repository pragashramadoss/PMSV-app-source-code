/* Thermally processed tomato juice, FSSAI 2.3.8. */
(function (root) {
  'use strict';
  const measurements = typeof module === 'object' && module.exports ? require('./culinary-sauces.js') : root.PMSVCulinarySauces;
  const {compare,criterionCard,criterionLines,esc,clean,link,sourceURL} = measurements;
  const containers=typeof module==='object' && module.exports ? require('./tomato-containers.js') : root.PMSVTomatoContainers;
  const {packLabels,capacityLabels,vacuumLabels,vacuumOutcome,fillAssessment,fillLines}=containers;

  function validReview(r,concentrate,catalogue) {
    if (r?.round !== 88 || r.reviewedOn !== '2026-11-20' || r.id !== 'tomato-juice' || r.clause !== '2.3.8' ||
        r.label !== 'Thermally processed tomato juice' || r.report !== 'ctr-thermally-processed-tomato-juice-r88-2026-11-20.md' ||
        JSON.stringify(r.aliases) !== '["tomato juice","heat-treated tomato juice"]' ||
        !catalogue.some(c=>c.id===r.id && c.priority===7 && c.fssr===r.clause && c.fcs==='14.1.2.2')) return false;
    const rows = [
      ['solids','Total soluble solids',3,'minimum',5,'Salt-excluded, % by weight'],
      ['salt','Sodium chloride',4,'maximum',3,'NaCl, % by weight'],
      ['titratable','Total titratable acidity',5,'maximum',10,'As citric acid, % by weight'],
      ['volatile','Volatile acidity',6,'maximum',0.4,'As acetic acid, % by weight'],
      ['ph','pH',7,'maximum',4.5,'Measured pH','pH'],
      ['sugar','Sugar content',8,'maximum',42,'As invert sugar, % by weight'],
      ['impurities','Mineral impurities',undefined,'maximum',0.1,'% of dry weight less common salt'],
      ['headspace','Can headspace',2,'maximum',7,'Measured in millimetres','mm']
    ];
    if (!Array.isArray(r.criteria) || r.criteria.length!==7 || r.can?.vacuum?.row!==1 || r.can.vacuum.requirement!=='Negative') return false;
    const rules = [...r.criteria,r.can.headspace];
    if (!rows.every(([key,label,row,direction,value,basis,unit],i)=>{
      const c=rules[i];
      return c?.key===key && c.label===label && c.row===row && c.paragraph===(key==='impurities'?2:undefined) &&
        c[direction]===value && c[direction==='maximum'?'minimum':'maximum']===undefined && c.unit===unit &&
        c.basis===basis && typeof c.otherBasis==='string' && c.otherBasis.trim().length>0;
    })) return false;
    const fill=r.fill, a=r.amendment;
    return fill?.minimumPercent===90 && fill.waterTemperatureC===27 && fill.glassDeductionMl===20 && fill.volumeUnit==='mL' &&
      a?.url==='https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/Gazette_Notification_Fruits_Vegetables_28_11_2017.pdf' &&
      a.sha256==='a70e28574d44f6e105b83da6c2f52442eac1db3b66f1805b862458c8e82911a9' && a.page===10 && a.fillPage===11 &&
      a.date==='2017-11-17' && a.published==='2017-11-21' && a.complyBy==='2018-07-01' &&
      [['gazette',55],['chapter',20],['method',35]].every(([key,page])=>r.sources?.[key]?.page===page &&
        ['url','sha256'].every(field=>r.sources[key][field]===concentrate.sources[key][field]));
  }

  const reference=(r,c)=>'FSSAI '+r.clause+(c.row?'(5), row '+c.row:'('+c.paragraph+')');
  const fieldValue=(panel,id)=>clean(panel.querySelector('#juice-'+id)?.value);
  const choices=labels=>Object.entries(labels).map(([key,label])=>'<option value="'+key+'">'+esc(label)+'</option>').join('');
  const measureInput=(id,label)=>'<label for="juice-'+id+'">'+esc(label)+'</label><input id="juice-'+id+'" type="text" inputmode="decimal" maxlength="32" autocomplete="off">';
  const fillRuleText=r=>'FSSAI '+r.clause+'(6) · Minimum '+r.fill.minimumPercent+'% of water capacity measured at '+r.fill.waterTemperatureC+' °C. Deduct '+r.fill.glassDeductionMl+' mL from full capacity for glass.';

  function packFields(r,pack) {
    if (!Object.hasOwn(packLabels,pack)) return '';
    const can= pack==='can' ? '<h5>Can measurements</h5><label for="juice-vacuum">Vacuum reported for the can</label>' +
      '<select id="juice-vacuum"><option value="">Choose the reported observation</option>'+choices(vacuumLabels)+'</select>' +
      '<p>FSSAI '+esc(r.clause)+'(5), row 1 · Negative gauge pressure required.</p><p id="juice-vacuum-outcome" role="status">'+vacuumOutcome('')+'</p>' +
      criterionCard(r.can.headspace,'juice',null,reference(r,r.can.headspace)) : '';
    return '<label for="juice-capacity-basis">Water-capacity measurement basis</label><select id="juice-capacity-basis">' +
      '<option value="">Select the recorded basis</option>'+choices(capacityLabels)+'</select>' +
      measureInput('capacity','Full measured water capacity before any glass deduction (mL)')+
      measureInput('volume','Volume occupied by juice (mL)')+
      '<p id="juice-fill-outcome" class="fill-outcome" role="status">'+esc(fillAssessment(r.fill,pack,'','','').outcome)+'</p>'+can;
  }

  function markup(r) {
    return '<section class="panel compact tomato-juice" data-product="'+esc(r.id)+'"><h4>Thermally processed tomato juice</h4>' +
      '<p>FSSAI '+esc(r.clause)+'</p><label for="juice-lot">Supplier document or lot reference (optional)</label>' +
      '<input id="juice-lot" type="text" maxlength="160" autocomplete="off">' +
      '<details class="juice-packaging"><summary>Container fill and can measurements</summary><p>'+esc(fillRuleText(r))+'</p>' +
      '<label for="juice-pack">Container material</label><select id="juice-pack" aria-controls="juice-pack-fields">' +
      '<option value="">Choose the container</option>'+choices(packLabels)+'<option value="unknown">Material unconfirmed</option></select>' +
      '<div id="juice-pack-fields"></div></details>' +
      '<details open class="juice-lab"><summary>Laboratory results</summary><div class="paste-grid">'+
      r.criteria.map(c=>criterionCard(c,'juice',null,reference(r,c))).join('')+'</div></details>'+
      '<details><summary>Product identity and reporting basis</summary><p>This clause covers heat-processed, unfermented tomato juice, including properly reconstituted juice. It excludes added colours and artificial flavours.</p>'+
      '<p>Use the laboratory’s salt-excluded soluble solids. Total titratable acidity and volatile acidity have separate acid equivalents. Mineral impurities use dry weight after common salt is deducted.</p>'+
      link(sourceURL(r.sources.method),'Soluble-solids method · § 2.12')+'</details>'+
      '<div class="controls">'+link(sourceURL(r.amendment),'2017 Gazette · composition')+link(r.amendment.url+'#page='+r.amendment.fillPage,'2017 Gazette · container fill')+
      link(sourceURL(r.sources.chapter),'FSSAI chapter · p. '+r.sources.chapter.page)+link(r.report,'Tomato juice source review')+'</div></section>';
  }

  function packAssessment(r,panel) {
    return fillAssessment(r.fill,fieldValue(panel,'pack'),fieldValue(panel,'capacity-basis'),fieldValue(panel,'volume'),fieldValue(panel,'capacity'));
  }

  function briefLines(r,container) {
    const panel=container?.querySelector('.tomato-juice');
    if (!panel || panel.dataset.product!==r.id) return [];
    const lines=['',r.label+' · FSSAI '+r.clause];
    const lot=fieldValue(panel,'lot');
    if (lot) lines.push('Supplier document or lot reference · '+lot.slice(0,160));
    const appendResult=c=>lines.push(reference(r,c),...criterionLines(c,panel.querySelector('[data-criterion="'+c.key+'"]')));
    r.criteria.forEach(appendResult);
    const pack=fieldValue(panel,'pack');
    lines.push('',fillRuleText(r),'Container type · '+(packLabels[pack]||'Unconfirmed'));
    if (Object.hasOwn(packLabels,pack)) {
      const basis=fieldValue(panel,'capacity-basis'), capacity=fieldValue(panel,'capacity'), volume=fieldValue(panel,'volume');
      lines.push('Water-capacity basis · '+(capacityLabels[basis]||'Unconfirmed'));
      if (capacity) lines.push('Full measured water capacity · '+capacity+' mL');
      if (volume) lines.push('Volume occupied by juice · '+volume+' mL');
    }
    lines.push(...fillLines(packAssessment(r,panel)));
    if (pack==='can') {
      const sign=fieldValue(panel,'vacuum');
      lines.push('FSSAI '+r.clause+'(5), row 1 · Vacuum in the can · '+(vacuumLabels[sign]||'Unconfirmed'),vacuumOutcome(sign));
      appendResult(r.can.headspace);
    }
    lines.push('2017 Gazette · '+sourceURL(r.amendment),'2017 Gazette · container fill · '+r.amendment.url+'#page='+r.amendment.fillPage,
      'FSSAI chapter · '+sourceURL(r.sources.chapter),'Soluble-solids method · '+sourceURL(r.sources.method));
    return lines;
  }

  const api=Object.freeze({validReview,markup,briefLines,fillAssessment,vacuumOutcome});
  if (typeof module==='object' && module.exports) module.exports=api;
  root.PMSVTomatoJuice=api;
  if (typeof document==='undefined') return;
  function update(event) {
    const field=event.target, panel=field.closest?.('.tomato-juice');
    if (!panel) return;
    const r=root.PMSV_REVIEW_REGISTER.tomatoJuiceReview;
    if (field.id==='juice-pack') {
      if (event.type==='change') panel.querySelector('#juice-pack-fields').innerHTML=packFields(r,field.value);
      return;
    }
    if (field.id==='juice-vacuum') {
      panel.querySelector('#juice-vacuum-outcome').textContent=vacuumOutcome(field.value);
      return;
    }
    const card=field.closest('.paste-criterion');
    if (card) {
      const key=card.dataset.criterion, c=key==='headspace' ? r.can.headspace : r.criteria.find(item=>item.key===key);
      card.querySelector('.paste-outcome').textContent=compare(c,card.querySelector('.paste-basis').value,card.querySelector('.paste-value').value);
    } else if (field.matches('#juice-capacity,#juice-capacity-basis,#juice-volume')) {
      panel.querySelector('#juice-fill-outcome').textContent=fillLines(packAssessment(r,panel)).join('\n');
    }
  }
  document.addEventListener('input',update);
  document.addEventListener('change',update);
})(typeof globalThis==='object' ? globalThis : this);
