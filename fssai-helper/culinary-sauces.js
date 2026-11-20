/* Product-specific composition and rigid-container checks for FSSR 2.3.28. */
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

  function gingerArticle(ginger,id) {
    if (id !== ginger.productId && id !== ginger.recipe.productId) return null;
    return {...ginger, id, label:'Ginger paste', ginger:true, ingredient:id === ginger.recipe.productId,
      reportLabel:'Ginger-paste source review'};
  }

  function article(register,id) {
    if (!register) return null;
    const review = register.culinarySauceReview;
    const ginger = register.gingerPasteReview;
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

  function fillMarkup(rule) {
    return '<details class="culinary-fill"><summary>Check container fill</summary><p>FSSAI 2.3.28(3) · Rigid containers must be at least ' +
      rule.minimumPercent.toFixed(1) + '% full by water capacity.</p><label for="fill-pack">Container type</label><select id="fill-pack">' +
      '<option value="">Select pack type</option><option value="rigid">Rigid container</option><option value="flexible">Flexible pack</option>' +
      '<option value="unknown">Unconfirmed or other</option></select><div class="fill-volumes" hidden>' +
      '<label for="fill-product">Volume occupied by product (mL)</label><input id="fill-product" type="text" inputmode="decimal" maxlength="32" autocomplete="off">' +
      '<label for="fill-capacity">Water capacity of the same container (mL)</label><input id="fill-capacity" type="text" inputmode="decimal" maxlength="32" autocomplete="off">' +
      '<p>Use the volume of distilled water at ' + rule.waterTemperatureC + ' °C that completely fills the closed container.</p></div>' +
      '<p class="fill-outcome" aria-live="polite">Confirm the container type.</p></details>';
  }

  function markup(a) {
    if (!a) return '';
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
        (c.key === 'acidity' ? '<details class="paste-proposal"><summary>Retort or aseptic process?</summary><p>' + esc(proposal) + '</p>' +
          link(sourceURL(a.sources.proposal),'Draft · p. ' + a.sources.proposal.page) + '</details>' : '') + '</div>';
    }).join('');
    const other = a.fill ? 'The clause also covers' : 'For rigid containers the paste must occupy at least ' +
      a.rigidFillMinimumPercent + '% of water capacity, measured with distilled water at 20 °C. The clause also covers';
    return '<section class="culinary-composition' + (a.ginger ? ' ginger-paste-check' : '') + (a.ingredient ? '' : ' panel compact') +
      '" data-product="' + esc(a.id) + '"><h4>' + esc(a.label) + ' · composition</h4><p>FSSAI ' + esc(a.clause) + '(2), row ' + a.tableRow +
      (a.ingredient ? ' · These values apply to the purchased paste. Check its ingredients separately against recipe 13.1.' :
        (a.rowName && a.rowName !== a.label ? ' · ' + esc(a.rowName) : '')) + '</p>' + (a.ingredient ? '' :
        '<label for="paste-lot">Supplier document or lot reference (optional)</label><input type="text" id="paste-lot" maxlength="160" autocomplete="off">') +
      '<div class="paste-grid">' + cards + '</div>' + (a.fill ? fillMarkup(a.fill) : '') +
      '<details><summary>Other requirements in this clause</summary><p>' + other + ' added colour, permitted additives and Appendix B microbiological requirements.</p></details>' +
      '<div class="controls">' + link(sourceURL(a.sources.gazette),'Gazette · p. ' + a.sources.gazette.page) +
      link(sourceURL(a.sources.chapter),'FSSAI chapter · p. ' + a.sources.chapter.page) + link(a.report,a.reportLabel) +
      (a.previousReport ? link(a.previousReport,'Ginger-paste source review') : '') + '</div></section>';
  }

  function briefLines(a,container) {
    if (!a || !container) return [];
    const panel = container.querySelector('.culinary-composition');
    if (panel?.dataset.product !== a.id) return [];
    const lines = ['',a.label + ' · composition', 'FSSAI ' + a.clause + '(2), row ' + a.tableRow +
      (a.ingredient ? ' · purchased ingredient for recipe 13.1' : ' · ' + (a.rowName || a.label))];
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
    if (a.fill) {
      const pack = panel.querySelector('#fill-pack');
      const volume = clean(panel.querySelector('#fill-product').value);
      const capacity = clean(panel.querySelector('#fill-capacity').value);
      lines.push('','Container fill · FSSAI 2.3.28(3) · ' + a.fill.minimumPercent.toFixed(1) + '% minimum for rigid containers',
        'Container type · ' + (pack.value ? pack.selectedOptions[0].textContent : 'Unconfirmed'));
      if (pack.value === 'rigid') {
        if (volume) lines.push('Volume occupied by product · ' + volume + ' mL');
        if (capacity) lines.push('Water capacity at ' + a.fill.waterTemperatureC + ' °C · ' + capacity + ' mL');
      }
      lines.push(fillOutcome(a.fill,pack.value,volume,capacity));
    }
    lines.push('Gazette · ' + sourceURL(a.sources.gazette),'FSSAI chapter · ' + sourceURL(a.sources.chapter),
      proposal + ' ' + sourceURL(a.sources.proposal));
    if (a.ingredient) lines.push('Check the supplied formula and its suitability for Krishara separately. ' + sourceURL(a.sources.recipe));
    return lines;
  }

  const api = Object.freeze({validReview,article,gingerArticle,compare,fillOutcome,markup,briefLines});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVCulinarySauces = api;
  if (typeof document === 'undefined') return;
  function update(event) {
    const field = event.target;
    if (!field.matches('.paste-value,.paste-basis,#fill-pack,#fill-product,#fill-capacity')) return;
    const panel = field.closest('.culinary-composition');
    const a = article(root.PMSV_REVIEW_REGISTER,panel.dataset.product);
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
