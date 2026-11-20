/* Composition and container-fill checks for tomato concentrates and culinary sauces. */
(function (root) {
  'use strict';
  const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = text => String(text ?? '').replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g,' ').trim();
  const sourceURL = source => source.url + '#page=' + source.page;
  const link = (url, label) => '<a class="source-ref" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + ' ↗</a>';
  const proposal = 'A June 2024 draft proposes an acidity exception for retort or aseptically processed products. Confirm an effective provision before claiming the exception.';

  function validReview(review, ginger, catalogue) {
    if (review?.round !== 85 || review.reviewedOn !== '2026-11-20' || review.clause !== ginger.clause ||
        review.report !== 'ctr-culinary-sauces-r85-2026-11-20.md' || review.fill?.pack !== 'rigid' ||
        review.fill.minimumPercent !== ginger.rigidFillMinimumPercent || review.fill.waterTemperatureC !== 20 ||
        review.fill.volumeUnit !== 'mL' || !Array.isArray(review.rows) || review.rows.length !== 4) return false;
    const expected = [
      ['Chilli sauce',8,1,[['12-12-6-chilli-sauce','Chilli sauce']]],
      ['Fruit or vegetable sauces',15,1.2,[['12-12-6-fruits-vegetable-sauces','Fruit or vegetable sauce']]],
      ['Culinary paste or sauce',8,1,[['12-12-6-culinary-sauce','Culinary sauce'],['12-12-6-culinary-pastes','Culinary paste']]],
      ['Ginger paste',ginger.criteria[0].minimum,ginger.criteria[1].minimum,[[ginger.productId,'Ginger paste']]]
    ];
    const rowsOK = review.rows.every((row,i) => {
      const [name,solids,acidity,products] = expected[i];
      return row?.number === i+1 && row.name === name && row.solids === solids && row.acidity === acidity &&
        Array.isArray(row.products) && row.products.length === products.length && row.products.every((p,j) =>
          p?.id === products[j][0] && p.label === products[j][1] &&
          catalogue.some(c => c.id === p.id && c.fssr === review.clause));
    });
    if (!rowsOK || catalogue.filter(c => c.fssr === review.clause).length !== 5) return false;
    return ['gazette','chapter','proposal'].every(k => ['url','sha256','page'].every(field =>
      review.sources?.[k]?.[field] === ginger.sources[k][field]));
  }

  function validNamedReview(review,culinary,catalogue) {
    if (review?.round !== 86 || review.reviewedOn !== '2026-11-20' ||
        review.report !== 'ctr-tomato-soybean-sauces-r86-2026-11-20.md' || !Array.isArray(review.products) ||
        review.products.length !== 2 || !['pack','minimumPercent','waterTemperatureC','volumeUnit'].every(k =>
          review.fill?.[k] === culinary.fill[k])) return false;
    const n = review.nitrogenBasis;
    if (n?.key !== 'nitrogen' || n.label !== 'Total nitrogen' || n.basis !== '% (m/m) as nitrogen' ||
        n.otherBasis !== 'Protein, amino nitrogen, g/100 mL or another basis') return false;
    if (!['gazette','chapter'].every(k => ['url','sha256'].every(field =>
        review.sources?.[k]?.[field] === culinary.sources[k][field]))) return false;
    const expected = [
      {id:'12-12-6-tomato-ketchup-and-tomato-sauce',label:'Tomato ketchup and tomato sauce',clause:'2.3.27',aliases:['tomato ketchup','tomato sauce'],
       minima:{solids:25,acidity:0.2},original:{solids:25,acidity:1},pages:[61,33,29],date:'2018-11-19',
       file:'5bfd0937e84e3Gazette_Notification_DatePasta_27_11_2018.pdf',hash:'bb57f6240992c08792f0fe8b24132df751cb1205fa078bcd9dbdbd6a72ad72d5'},
      {id:'12-12-9-soybean-sauce',label:'Soybean sauce',clause:'2.3.29',aliases:['soy sauce','soya sauce','soyabean sauce'],
       minima:{solids:15,acidity:0.6,nitrogen:1},original:{solids:25,acidity:0.6},pages:[62,35,24],date:'2021-07-26',
       file:'6103dc2e5287aGazette_Notification_Oil_30_07_2021.pdf',hash:'4c96b941b48c16e1445e834d09a0bddbe8d06178dbea8b4abea49caf9556ef67'}
    ];
    const base = 'https://fssai.gov.in/docs/food-law/regulations/amendments/food-products-standards/';
    const matchingLimits = (actual,required) => actual && Object.keys(actual).length === Object.keys(required).length &&
      Object.keys(required).every(key => actual[key] === required[key]);
    return review.products.every((p,i) => {
      const e = expected[i];
      return p?.id === e.id && p.label === e.label && p.clause === e.clause &&
        catalogue.some(c => c.id === p.id && c.fssr === p.clause) && Array.isArray(p.aliases) &&
        p.aliases.length === e.aliases.length && p.aliases.every((alias,j) => alias === e.aliases[j]) &&
        matchingLimits(p.minima,e.minima) && matchingLimits(p.originalMinima,e.original) &&
        p.originalPage === e.pages[0] && p.chapterPage === e.pages[1] && p.amendment?.page === e.pages[2] &&
        p.amendment.date === e.date && p.amendment.url === base + e.file && p.amendment.sha256 === e.hash &&
        typeof p.identity === 'string' && p.identity.trim() && typeof p.change === 'string' && p.change.trim();
    });
  }

  function validConcentrateReview(review,previous,catalogue) {
    if (review?.round !== 87 || review.reviewedOn !== '2026-11-20' || review.clause !== '2.3.14' ||
        review.report !== 'ctr-thermally-processed-tomato-r87-2026-11-20.md' ||
        review.id !== '04-04-2-thermally-processed-tomato-puree-and-paste' || review.label !== 'Thermally processed tomato purée and paste' ||
        !catalogue.some(c => c.id === review.id && c.fssr === review.clause && c.priority === 189) ||
        !['pack','minimumPercent','waterTemperatureC','volumeUnit'].every(k => review.fill?.[k] === previous.fill[k])) return false;
    const rows = [['puree','Tomato purée',9],['paste','Tomato paste',25]];
    if (!Array.isArray(review.forms) || review.forms.length !== rows.length ||
        !review.forms.every((form,i) => form?.key === rows[i][0] && form.label === rows[i][1] && form.row === i+1 && form.minimum === rows[i][2])) return false;
    const c = review.criterion, method = review.sources?.method;
    return c?.key === 'solids' && c.label === 'Total soluble solids' && c.basis === 'Finished product, % (w/w)' &&
      c.otherBasis === 'Salt-free result, uncorrected reading or another basis' &&
      JSON.stringify(review.aliases) === '["tomato puree","tomato purée","tomato paste"]' &&
      typeof review.identity === 'string' && Boolean(review.identity.trim()) &&
      [['gazette',58],['chapter',25]].every(([key,page]) => review.sources?.[key]?.page === page && review.sourcePages?.[key] === page &&
        ['url','sha256'].every(field => review.sources[key][field] === previous.sources[key][field])) &&
      method?.url === 'https://fssai.gov.in/upload/uploadfiles/files/Manual_Fruits_Veg_25_05_2016.pdf' && method.page === 9 &&
      method.sha256 === 'd078501e51dbaac5ce017bba37de0ca0f524e0fa174e9a971f710c63b7d9fb6c' &&
      ['url','sha256','page'].every(key => review.method?.[key] === method[key]);
  }

  function forDeclaredForm(article,key) {
    const form = article.forms.find(item => item.key === key);
    return {...article, form, tableRow:form?.row, criteria:form ? [{...article.criterion,minimum:form.minimum}] : []};
  }

  function gingerArticle(ginger,id) {
    if (id !== ginger.productId && id !== ginger.recipe.productId) return null;
    return {...ginger, id, label:'Ginger paste', ginger:true, ingredient:id === ginger.recipe.productId,
      reportLabel:'Ginger-paste source review'};
  }

  function article(register,id,formKey) {
    if (!register) return null;
    const concentrate = register.tomatoConcentrateReview;
    if (concentrate && id === concentrate.id) {
      return forDeclaredForm({...concentrate,reportLabel:'Tomato purée and paste source review'},formKey);
    }
    const review = register.culinarySauceReview;
    const ginger = register.gingerPasteReview;
    const named = register.tomatoSoybeanReview;
    const product = named?.products.find(p => p.id === id);
    if (product) {
      const criteria = ginger.criteria.map(c => ({...c,minimum:product.minima[c.key]}));
      if (Object.hasOwn(product.minima,'nitrogen')) criteria.push({...named.nitrogenBasis,minimum:product.minima.nitrogen});
      return {id, label:product.label, clause:product.clause, criteria, fill:named.fill,
        identity:product.identity, change:product.change, round:named.round, report:named.report, reportLabel:'Tomato and soybean sauce review',
        sources:{gazette:{...named.sources.gazette,page:product.originalPage},chapter:{...named.sources.chapter,page:product.chapterPage},
          amendment:product.amendment}};
    }
    for (const row of review.rows) {
      const p = row.products.find(item => item.id === id);
      if (p) return {id, label:p.label, clause:review.clause, tableRow:row.number, rowName:row.name,
        criteria:ginger.criteria.map(c => ({...c,minimum:row[c.key]})), sources:review.sources,
        fill:review.fill, rigidFillMinimumPercent:review.fill.minimumPercent, round:review.round, report:review.report,
        reportLabel:'Sauce and paste source review', ginger:id === ginger.productId,
        previousReport:id === ginger.productId ? ginger.report : null};
    }
    return gingerArticle(ginger,id);
  }

  // Preserve decimal precision when a measured result is just below a minimum.
  function decimal(raw) {
    if (raw.length > 32 || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
    const [whole,fraction = ''] = raw.split('.');
    return {n:BigInt((whole || '0') + fraction), scale:10n ** BigInt(fraction.length)};
  }

  function compare(criterion,basis,input) {
    const raw = String(input ?? '').trim();
    if (!raw) return 'Awaiting a result';
    if (basis === 'other') return 'Different reporting basis · cannot compare';
    if (basis !== 'stated') return 'Confirm the reporting basis';
    const value = decimal(raw);
    if (!value || value.n > 100n * value.scale) return 'Enter a percentage from 0 to 100';
    const limit = decimal(String(criterion.minimum));
    return value.n * limit.scale >= limit.n * value.scale ? 'Meets this minimum' : 'Below this minimum';
  }

  function fillOutcome(rule,pack,productVolume,waterCapacity) {
    if (pack === 'flexible') return 'The rigid-container provision does not apply to this pack.';
    if (pack !== 'rigid') return 'Confirm the container type.';
    const product = String(productVolume ?? '').trim();
    const capacity = String(waterCapacity ?? '').trim();
    if (!product || !capacity) return 'Enter both volumes in ' + rule.volumeUnit + '.';
    const volume = decimal(product), water = decimal(capacity);
    if (!volume || !water || water.n === 0n) return 'Enter valid volumes and a water capacity greater than zero.';
    const numerator = volume.n * water.scale, denominator = water.n * volume.scale;
    if (numerator > denominator) return 'The product volume exceeds the stated water capacity. Check both measurements.';
    const percent = numerator * 100n;
    const hundredths = percent * 100n / denominator;
    const trailing = percent * 100n % denominator !== 0n;
    const digits = String(hundredths % 100n).padStart(2,'0');
    const display = String(hundredths / 100n) + '.' + (trailing ? digits + '…' : digits.replace(/0$/,''));
    return display + '% · ' + (percent >= BigInt(rule.minimumPercent) * denominator ? 'Meets this minimum' : 'Below this minimum');
  }

  function compositionReference(a) {
    return 'FSSAI ' + a.clause + '(2)' + (a.tableRow ? ', row ' + a.tableRow : '');
  }

  function fillMarkup(rule,clause) {
    return '<details class="culinary-fill"><summary>Check container fill</summary><p>FSSAI ' + esc(clause) + '(3) · Rigid containers must be at least ' +
      rule.minimumPercent.toFixed(1) + '% full by water capacity.</p><label for="fill-pack">Container type</label><select id="fill-pack">' +
      '<option value="">Select pack type</option><option value="rigid">Rigid container</option><option value="flexible">Flexible pack</option>' +
      '<option value="unknown">Unconfirmed or other</option></select><div class="fill-volumes" hidden>' +
      '<label for="fill-product">Volume occupied by product (mL)</label><input id="fill-product" type="text" inputmode="decimal" maxlength="32" autocomplete="off">' +
      '<label for="fill-capacity">Water capacity of the same container (mL)</label><input id="fill-capacity" type="text" inputmode="decimal" maxlength="32" autocomplete="off">' +
      '<p>Use the volume of distilled water at ' + rule.waterTemperatureC + ' °C that completely fills the closed container.</p></div>' +
      '<p class="fill-outcome" aria-live="polite">Confirm the container type.</p></details>';
  }

  function resultFields(a) {
    const cards = a.criteria.map(c => {
      const name = 'paste-' + c.key;
      return '<div class="paste-criterion" data-criterion="' + esc(c.key) + '" role="group" aria-labelledby="' + name + '-title"><h5 id="' + name + '-title">' + esc(c.label) + '</h5>' +
        '<p>Minimum <strong>' + c.minimum.toFixed(1) + '%</strong> · ' + esc(c.basis.replace('% (m/m)','mass by mass').replace('% as','as')) + '</p>' +
        '<label for="' + name + '-basis">Laboratory reporting basis</label><select class="paste-basis" id="' + name +
        '-basis"><option value="">Select basis from report</option><option value="stated">' + esc(c.basis) +
        '</option><option value="other">' + esc(c.otherBasis) + '</option></select>' +
        '<label for="' + name + '-result">Reported result</label><input class="paste-value" id="' + name +
        '-result" type="text" inputmode="decimal" maxlength="32" autocomplete="off">' +
        '<p class="paste-outcome" aria-live="polite">Awaiting a result</p>' +
        (c.key === 'acidity' && a.sources.proposal ? '<details class="paste-proposal"><summary>Retort or aseptic process?</summary><p>' + esc(proposal) + '</p>' +
          link(sourceURL(a.sources.proposal),'Draft · p. ' + a.sources.proposal.page) + '</details>' : '') + '</div>';
    }).join('');
    const lot = a.ingredient ? '' : '<label for="paste-lot">Supplier document or lot reference (optional)</label>' +
      '<input type="text" id="paste-lot" maxlength="160" autocomplete="off">';
    return lot + '<div class="paste-grid">' + cards + '</div>' + (a.fill ? fillMarkup(a.fill,a.clause) : '');
  }

  function declaredFields(a) {
    if (a.form) return '<p role="status">' + esc(compositionReference(a)) + ' · ' + esc(a.form.label) + '</p>' + resultFields(a);
    const values = a.forms.map(f => esc(f.label) + ' ' + f.minimum.toFixed(1) + '%').join(' · ');
    return '<p>Minimum total soluble solids by weight</p><p>' + values + '</p>';
  }

  function formPicker(a) {
    const options = a.forms.map(f => '<option value="' + esc(f.key) + '"' +
      (a.form?.key === f.key ? ' selected' : '') + '>' + esc(f.label) + '</option>').join('');
    return '<label for="tomato-form">Product declared on the label or specification</label>' +
      '<select id="tomato-form" aria-controls="tomato-form-fields"><option value="">Choose the declared product</option>' + options + '</select>' +
      '<div id="tomato-form-fields">' + declaredFields(a) + '</div>';
  }

  function markup(a) {
    if (!a) return '';
    const other = a.identity ? a.identity + ' The standard also refers to permitted additives and Appendix B microbiological requirements.' :
      (a.fill ? '' : 'For rigid containers the paste must occupy at least ' + a.rigidFillMinimumPercent +
        '% of water capacity, measured with distilled water at 20 °C. ') +
      'The clause also covers added colour, permitted additives and Appendix B microbiological requirements.';
    const amendment = a.sources.amendment;
    return '<section class="culinary-composition' + (a.ginger ? ' ginger-paste-check' : '') + (a.ingredient ? '' : ' panel compact') +
      '" data-product="' + esc(a.id) + '"><h4>' + esc(a.label) + ' · composition</h4><p>' + esc(compositionReference(a)) +
      (a.ingredient ? ' · These values apply to the purchased paste. Check its ingredients separately against recipe 13.1.' :
        (a.rowName && a.rowName !== a.label ? ' · ' + esc(a.rowName) : '')) + '</p>' + (a.forms ? formPicker(a) : resultFields(a)) +
      (a.sources.method ? '<details class="solids-method"><summary>Which laboratory result should I enter?</summary>' +
        '<p>Use the final total soluble solids as a percentage by weight of the product as supplied. ' +
        'If the laboratory diluted the sample or corrected its refractometer reading for temperature, use the reported result after those corrections.</p>' +
        link(sourceURL(a.sources.method),'FSSAI fruit and vegetable methods · § 1.6') + '</details>' : '') +
      (amendment ? '<details class="sauce-amendment"><summary>How the standard changed</summary><p>' + esc(a.change) + '</p></details>' : '') +
      '<details><summary>Other requirements in this clause</summary><p>' + esc(other) + '</p></details>' +
      '<div class="controls">' + (amendment ? link(sourceURL(amendment),amendment.date.slice(0,4) + ' amendment · p. ' + amendment.page) : '') +
      link(sourceURL(a.sources.gazette),(amendment ? '2011 Gazette · p. ' : 'Gazette · p. ') + a.sources.gazette.page) +
      link(sourceURL(a.sources.chapter),'FSSAI chapter · p. ' + a.sources.chapter.page) + link(a.report,a.reportLabel) +
      (a.previousReport ? link(a.previousReport,'Ginger-paste source review') : '') + '</div></section>';
  }

  function briefLines(a,container) {
    if (!a || !container) return [];
    const panel = container.querySelector('.culinary-composition');
    if (panel?.dataset.product !== a.id) return [];
    if (a.forms) a = forDeclaredForm(a,panel.querySelector('#tomato-form')?.value);
    const lines = ['',a.label + ' · composition', compositionReference(a) +
      (a.ingredient ? ' · purchased ingredient for recipe 13.1' : ' · ' + (a.form?.label || a.rowName || a.label))];
    if (a.forms) lines.push('Declared product · ' + (a.form?.label || 'Awaiting label or specification'));
    const lot = panel.querySelector('#paste-lot');
    if (lot && clean(lot.value)) lines.push('Supplier document or lot reference · ' + clean(lot.value).slice(0,160));
    for (const c of a.criteria) {
      const card = panel.querySelector('[data-criterion="' + c.key + '"]');
      const basis = card.querySelector('.paste-basis').value;
      const raw = clean(card.querySelector('.paste-value').value).slice(0,32);
      const reported = basis === 'stated' ? c.basis : basis === 'other' ? c.otherBasis : 'Basis unconfirmed';
      lines.push(c.label + ' · minimum ' + c.minimum.toFixed(1) + '% · ' + c.basis);
      lines.push((raw ? 'Reported ' + raw + ' · ' + reported + ' · ' : '') + compare(c,basis,raw));
    }
    if (a.fill && (!a.forms || a.form)) {
      const pack = panel.querySelector('#fill-pack');
      const volume = clean(panel.querySelector('#fill-product').value);
      const capacity = clean(panel.querySelector('#fill-capacity').value);
      lines.push('','Container fill · FSSAI ' + a.clause + '(3) · ' + a.fill.minimumPercent.toFixed(1) + '% minimum for rigid containers',
        'Container type · ' + (pack.value ? pack.selectedOptions[0].textContent : 'Unconfirmed'));
      if (pack.value === 'rigid') {
        if (volume) lines.push('Volume occupied by product · ' + volume + ' mL');
        if (capacity) lines.push('Water capacity at ' + a.fill.waterTemperatureC + ' °C · ' + capacity + ' mL');
      }
      lines.push(fillOutcome(a.fill,pack.value,volume,capacity));
    }
    if (a.sources.amendment) lines.push(a.change,'Amendment dated ' + a.sources.amendment.date + ' · ' + sourceURL(a.sources.amendment));
    lines.push((a.sources.amendment ? '2011 Gazette · ' : 'Gazette · ') + sourceURL(a.sources.gazette),'FSSAI chapter · ' + sourceURL(a.sources.chapter));
    if (a.sources.method) lines.push('Laboratory guidance · FSSAI fruit and vegetable methods, section 1.6 · ' + sourceURL(a.sources.method));
    if (a.sources.proposal) lines.push(proposal + ' ' + sourceURL(a.sources.proposal));
    if (a.ingredient) lines.push('Check the supplied formula and its suitability for Krishara separately. ' + sourceURL(a.sources.recipe));
    return lines;
  }

  const api = Object.freeze({validReview,validNamedReview,validConcentrateReview,article,gingerArticle,compare,fillOutcome,markup,briefLines});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVCulinarySauces = api;
  if (typeof document === 'undefined') return;
  function update(event) {
    const field = event.target;
    if (!field.matches('.paste-value,.paste-basis,#fill-pack,#fill-product,#fill-capacity,#tomato-form')) return;
    const panel = field.closest('.culinary-composition');
    const a = article(root.PMSV_REVIEW_REGISTER,panel.dataset.product,panel.querySelector('#tomato-form')?.value);
    if (field.id === 'tomato-form') {
      if (event.type === 'change') panel.querySelector('#tomato-form-fields').innerHTML = declaredFields(a);
      return;
    }
    const card = field.closest('.paste-criterion');
    if (card) {
      const c = a.criteria.find(item => item.key === card.dataset.criterion);
      card.querySelector('.paste-outcome').textContent = compare(c,card.querySelector('.paste-basis').value,card.querySelector('.paste-value').value);
      return;
    }
    const pack = panel.querySelector('#fill-pack').value;
    const volume = panel.querySelector('#fill-product'), capacity = panel.querySelector('#fill-capacity');
    if (field.id === 'fill-pack') {
      panel.querySelector('.fill-volumes').hidden = pack !== 'rigid';
      if (pack !== 'rigid') { volume.value = ''; capacity.value = ''; }
    }
    panel.querySelector('.fill-outcome').textContent = fillOutcome(a.fill,pack,volume.value,capacity.value);
  }
  document.addEventListener('input',update);
  document.addEventListener('change',update);
})(typeof globalThis === 'object' ? globalThis : this);
