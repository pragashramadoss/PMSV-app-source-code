/* Compare the two composition minima in the named ginger-paste row of FSSR 2.3.28. */
(function (root) {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sourceURL = source => source.url + '#page=' + source.page;
  const reportLink = (url, text) => '<a class="source-ref" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(text) + ' ↗</a>';

  const proposalNote = 'A June 2024 draft proposes an acidity exception for retort or aseptically processed products. Confirm an effective provision before claiming the exception.';

  function validReview(review, data, catalogue) {
    const forms = data.rhizomeSpiceReview;
    if (review?.round !== 84 || review.reviewedOn !== '2026-11-19' || review.clause !== '2.3.28' ||
        review.report !== 'ctr-ginger-paste-r84-2026-11-19.md' || review.tableRow !== 4 || review.rigidFillMinimumPercent !== 90 ||
        review.productId !== '04-04-2-ginger-paste' || !catalogue.some(p => p.id === review.productId && p.fssr === review.clause) ||
        !Array.isArray(review.criteria) || review.criteria.length !== 2) return false;
    const criteria = [
      ['solids','Total soluble solids','Salt-free, % (m/m)','Uncorrected °Brix or another basis',3],
      ['acidity','Acidity','% as acetic acid','pH or another acid basis',1]
    ];
    if (!review.criteria.every((r,i) => r && [r.key,r.label,r.basis,r.otherBasis,r.minimum].every((v,j) => v === criteria[i][j]))) return false;
    const recipe = review.recipe;
    const entry = forms.recipes.find(r => r.productId === recipe?.productId && r.number === recipe.number);
    if (recipe?.number !== '13.1' || recipe.serial !== 4 || recipe.ingredient !== 'Ardraka' ||
        !entry?.ingredients.some(r => r.serial === recipe.serial && r.key === 'ginger' && r.name === recipe.ingredient) ||
        !data.records.find(row => row.id === recipe.productId)?.reports.some(r => r.round === review.round && r.file === review.report)) return false;
    if (review.acidityProposal?.status !== 'draft' || review.acidityProposal.date !== '2024-06-05' ||
        review.acidityProposal.exemptionApplied !== false || review.sources?.proposal?.page !== 14 ||
        review.sources.proposal.url !== 'https://www.fssai.gov.in/upload/uploadfiles/files/food%20product.pdf' ||
        review.sources.proposal.sha256 !== '2a01d2b18e8d01f92e496991eb67f1d77956f39b97e0994dcf6e63bb4f564d8c') return false;
    const chapter = review.sources?.chapter;
    if (chapter?.page !== 34 || chapter.url !== 'https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf' ||
        chapter.sha256 !== '570ffd048b59a8197be2877a68cb44209d16b6d6730ad3192b87fa44cccd357c') return false;
    return [['gazette','gazette2011',62],['recipe','recipe2025',88]].every(([key,prior,page]) => {
      const source = review.sources[key];
      const checked = data.asafoetidaReview.sources[prior];
      return source?.page === page && source.url === checked.url && source.sha256 === checked.sha256;
    });
  }

  function compare(criterion, basis, input) {
    const raw = String(input ?? '').trim();
    if (!raw) return 'Awaiting a result';
    if (basis === 'other') return 'Different reporting basis · cannot compare';
    if (basis !== 'stated') return 'Confirm the reporting basis';
    if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)) return 'Enter a percentage from 0 to 100';
    // Both minima are whole percentages. Compare the integer part without rounding a borderline result.
    const [whole, fraction = ''] = raw.split('.');
    const integer = Number(whole);
    if (integer > 100 || (integer === 100 && /[1-9]/.test(fraction))) return 'Enter a percentage from 0 to 100';
    return integer >= criterion.minimum ? 'Meets this minimum' : 'Below this minimum';
  }

  function markup(review, id) {
    if (id !== review.productId && id !== review.recipe.productId) return '';
    const standalone = id === review.productId;
    const cards = review.criteria.map(c => {
      const name = 'paste-' + c.key;
      return '<div class="paste-criterion" data-criterion="' + esc(c.key) + '" role="group" aria-labelledby="' + name + '-title"><h5 id="' + name + '-title">' + esc(c.label) + '</h5>' +
        '<p>Minimum <strong>' + c.minimum.toFixed(1) + '%</strong> · ' + esc(c.basis.replace('% (m/m)','mass by mass').replace('% as','as')) + '</p>' +
        '<label for="' + name + '-basis">Laboratory reporting basis</label><select class="paste-basis" id="' + name +
        '-basis"><option value="">Select basis from report</option><option value="stated">' + esc(c.basis) +
        '</option><option value="other">' + esc(c.otherBasis) + '</option></select>' +
        '<label for="' + name + '-result">Reported result</label><input class="paste-value" id="' + name +
        '-result" type="text" inputmode="decimal" maxlength="32" autocomplete="off">' +
        '<p class="paste-outcome" aria-live="polite">Awaiting a result</p>' +
        (c.key === 'acidity' ? '<details class="paste-proposal"><summary>Retort or aseptic process?</summary><p>' + esc(proposalNote) + '</p>' +
          reportLink(sourceURL(review.sources.proposal),'Draft · p. ' + review.sources.proposal.page) + '</details>' : '') + '</div>';
    }).join('');
    return '<section class="ginger-paste-check' + (standalone ? ' panel compact' : '') + '" data-product="' + esc(id) +
      '"><h4>Ginger paste · composition</h4><p>FSSAI ' + esc(review.clause) + '(2), row ' + review.tableRow +
      (standalone ? ' · Enter results for the named ginger-paste product.' : ' · These values apply to the purchased paste. Check its ingredients separately against recipe 13.1.') +
      '</p>' + (standalone ? '<label for="paste-lot">Supplier document or lot reference (optional)</label><input type="text" id="paste-lot" maxlength="160" autocomplete="off">' : '') +
      '<div class="paste-grid">' + cards + '</div><details><summary>Other requirements in this clause</summary><p>For rigid containers the paste must occupy at least ' +
      review.rigidFillMinimumPercent + '% of water capacity, measured with distilled water at 20 °C. The clause also covers added colour, permitted additives and Appendix B microbiological requirements.</p></details>' +
      '<div class="controls">' + reportLink(sourceURL(review.sources.gazette),'Gazette · p. ' + review.sources.gazette.page) +
      reportLink(sourceURL(review.sources.chapter),'FSSAI chapter · p. ' + review.sources.chapter.page) +
      reportLink(review.report,'Ginger-paste source review') + '</div></section>';
  }

  function supplyNote(review, id, key, form) {
    if (key !== 'ginger') return '';
    if (form === 'onsite') return 'Record the ginger as received and the on-site grinding step. Preparing a paste during cooking does not identify a purchased ginger-paste product.';
    if (form === 'juice') return 'Identify the juice and assess its own product standard.';
    if (form !== 'paste' || id === review.recipe.productId) return '';
    if (id === '102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk') return 'Recipe 14.6 uses pieces of ginger. Assess the purchased paste separately and review its suitability for this preparation.';
    return 'Purchased ginger paste has a separate catalogue entry under FSSAI ' + review.clause + '.';
  }

  function supplyMarkup(review, id, key, form) {
    if (key === 'ginger' && form === 'paste' && id === review.recipe.productId) return markup(review,id);
    const note = supplyNote(review,id,key,form);
    if (!note) return '';
    return '<p>' + esc(note) + '</p>' + (form === 'paste' ? '<button type="button" data-open-ginger-paste>Open ginger paste product</button>' : '');
  }

  function briefLines(review, id, container) {
    if (!container || (id !== review.productId && id !== review.recipe.productId)) return [];
    const panel = container.querySelector('.ginger-paste-check');
    if (panel?.dataset.product !== id) return [];
    const lines = ['','Ginger paste · composition', 'FSSAI ' + review.clause + '(2), row ' + review.tableRow +
      (id === review.recipe.productId ? ' · purchased ingredient for recipe 13.1' : ' · named catalogue product')];
    const clean = s => s.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g,' ').trim();
    const lot = panel.querySelector('#paste-lot');
    if (lot && clean(lot.value)) lines.push('Supplier document or lot reference · ' + clean(lot.value).slice(0,160));
    for (const c of review.criteria) {
      const card = panel.querySelector('[data-criterion="' + c.key + '"]');
      const basis = card.querySelector('.paste-basis').value;
      const raw = clean(card.querySelector('.paste-value').value).slice(0,32);
      const reported = basis === 'stated' ? c.basis : basis === 'other' ? c.otherBasis : 'Basis unconfirmed';
      lines.push(c.label + ' · minimum ' + c.minimum.toFixed(1) + '% · ' + c.basis);
      lines.push((raw ? 'Reported ' + raw + ' · ' + reported + ' · ' : '') + compare(c,basis,raw));
    }
    lines.push('Gazette · ' + sourceURL(review.sources.gazette),'FSSAI chapter · ' + sourceURL(review.sources.chapter),
      proposalNote + ' ' + sourceURL(review.sources.proposal));
    if (id === review.recipe.productId) lines.push('Check the supplied formula and its suitability for Krishara separately. ' + sourceURL(review.sources.recipe));
    return lines;
  }

  const api = Object.freeze({validReview, compare, markup, supplyNote, supplyMarkup, briefLines});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVGingerPaste = api;
  if (typeof document === 'undefined') return;
  function update(event) {
    if (!event.target.matches('.paste-value,.paste-basis')) return;
    const card = event.target.closest('.paste-criterion');
    const c = root.PMSV_REVIEW_REGISTER.gingerPasteReview.criteria.find(row => row.key === card.dataset.criterion);
    card.querySelector('.paste-outcome').textContent = compare(c,card.querySelector('.paste-basis').value,card.querySelector('.paste-value').value);
  }
  document.addEventListener('input',update);
  document.addEventListener('change',update);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-ginger-paste]')) root.PMSV_HELPER_TEST?.selectProduct(root.PMSV_REVIEW_REGISTER.gingerPasteReview.productId);
  });
})(typeof globalThis === 'object' ? globalThis : this);
