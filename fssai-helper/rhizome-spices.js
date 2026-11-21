/* Raw ginger and turmeric evidence in catalogue products and Ayurveda recipes. */
(function (root) {
  'use strict';
  const shared = typeof module === 'object' && module.exports ? require('./spice-contaminants.js') : root.PMSVSpiceContaminants;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  const metals = [['Lead',10,22],['Copper',5,23],['Arsenic',0.1,26],['Tin',0.01,27],['Cadmium',0.1,27]];
  const extraTurmeric = ['Copper','Arsenic','Tin','Cadmium','Total aflatoxins','Aflatoxin B1'];
  const recipeIds = ['102-102-1-13-1-krishara-khichdi','102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk'];
  const spiceIdentity = [
    ['ginger','Zingiber officinale Roscoe','12-12-2-dried-ginger-sonth-dried-adrak','2.9.11',17,18],
    ['turmeric','Curcuma longa L.','12-12-2-turmeric-haldi','2.9.18',27,28]
  ];

  function validReview(review, flowers, current, catalogue, records) {
    if (review?.round !== 83 || review.reviewedOn !== '2026-11-19' ||
        review.report !== 'ctr-rhizome-spices-r83-2026-11-19.md' || review.addedLinks !== 8 ||
        !same(review.boundaries, {recipeFormDefault:null,finishedProductLimitAssigned:false,pesticideDefaultAssigned:false,batchRelease:false}) ||
        review.spiceStandard?.sha256 !== '7f7cd2a3a5efd6f114299872d45ef2b1b50260818bf695be6cefe4430547a447' ||
        review.spiceStandard.url !== 'https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt%20Spices%20Condiments%20and%20related%20products.pdf' ||
        !same(review.spiceStandard.pages,[17,18,27,28]) || !['gazette','compendium','recipe'].every(k => review.sources?.[k] === flowers.sources[k].url) ||
        !same(current, {...flowers.coverage,candidateLinks:flowers.coverage.candidateLinks + review.addedLinks}) ||
        !Array.isArray(review.spices) || review.spices.length !== 2 || !Array.isArray(review.recipes) || review.recipes.length !== 2) return false;
    if (!review.spices.every((s,i) => s && same([s.key,s.species,s.productId,s.clause,s.wholePage,s.powderPage],spiceIdentity[i]) &&
        catalogue.some(p => p.id === s.productId && p.fssr === s.clause) &&
        ['name','whole','powder','scope'].every(k => typeof s[k] === 'string' && s[k].trim()))) return false;
    const [ginger,turmeric] = review.spices;
    if (!shared.validRows(ginger.rawRows) || !same(ginger.compendiumPages,[3,8,14,14]) || ginger.identityTest ||
        !same(turmeric.compendiumPages,[6,8,10,11,12,14,14]) ||
        !same(turmeric.identityTest,{name:'Lead chromate',result:'Negative',page:28}) ||
        !Array.isArray(turmeric.rawRows) || turmeric.rawRows.length !== 7 ||
        !metals.every(([name,maximum,page],i) => {
          const row = turmeric.rawRows[i];
          return row?.name === name && row.maximum === maximum && row.pdfPage === page && row.unit === 'mg/kg' &&
            row.basis === '' && row.article === 'Turmeric whole and powder';
        }) || !same(turmeric.rawRows.slice(5), ginger.rawRows.slice(2))) return false;
    const expected = [
      [['ginger','Ardraka',4,88,88,['Arsenic']],['turmeric','Haridra',8,88,88,extraTurmeric]],
      [['ginger','Ardraka',4,96,97,['Arsenic']]]
    ];
    return review.recipes.every((recipe,i) => recipe?.productId === recipeIds[i] && recipe.number === ['13.1','14.6'][i] &&
      typeof recipe.sourceReviewResult === 'string' && typeof recipe.sourceReviewNextAction === 'string' &&
      Array.isArray(recipe.ingredients) && recipe.ingredients.length === expected[i].length &&
      recipe.ingredients.every((v,j) => v && typeof v.stage === 'string' &&
        same([v.key,v.name,v.serial,v.tablePage,v.methodPage,v.addedReferences],expected[i][j])) &&
      records.find(row => row.id === recipe.productId)?.reports.some(r => r.round === review.round && r.file === review.report));
  }

  function entries(review, id) {
    const standalone = review.spices.find(spice => spice.productId === id);
    if (standalone) return [{spice:standalone}];
    const recipe = review.recipes.find(item => item.productId === id);
    return recipe ? recipe.ingredients.map(ingredient => ({
      spice:review.spices.find(spice => spice.key === ingredient.key), ingredient, recipe
    })) : [];
  }

  function forms(spice) {
    return new Map([['whole',spice.whole],['powder',spice.powder],['fresh','Fresh rhizome'],
      ['paste',spice.key === 'ginger' ? 'Purchased ginger paste' : 'Purchased paste or juice'],
      ...(spice.key === 'ginger' ? [['onsite','Paste ground on site'],['juice','Ginger juice']] : []),
      ['other','Blend, extract or another form'],['unknown','Form unconfirmed']]);
  }

  function eligible(form) { return form === 'whole' || form === 'powder'; }

  function link(url, label, page) {
    return '<a class="source-ref" target="_blank" rel="noopener noreferrer" href="' +
      esc(url + (page ? '#page=' + page : '')) + '">' + esc(label) + ' ↗</a>';
  }

  function result(review, spice, form) {
    if (!eligible(form)) return form ? '<p class="muted">This supply needs a separate article assessment.</p>' : '';
    const standardPage = form === 'whole' ? spice.wholePage : spice.powderPage;
    const identity = spice.identityTest;
    return '<p>' + esc(spice.scope) + '</p>' +
      shared.table(spice.rawRows, {url:review.sources.gazette}, 'rhizome-table','rhizome-reference',
        {url:review.sources.compendium,pages:spice.compendiumPages}) +
      (identity ? '<p><strong>Lead chromate test · Negative</strong><br>Record this qualitative test separately from the total lead measurement. ' +
        link(review.spiceStandard.url,'Product standard',identity.page) + '</p>' : '') +
      '<div class="controls">' + link(review.spiceStandard.url,'FSSAI ' + spice.clause,standardPage) +
      '</div>';
  }

  function markup(review, id) {
    return entries(review,id).map(({spice,ingredient,recipe}) => {
      const key = spice.key;
      const printed = ingredient ? '<p>Recipe ' + esc(recipe.number) + ' · ingredient ' + ingredient.serial + ' · ' + esc(ingredient.name) +
        '. ' + esc(ingredient.stage) + '</p><div class="controls">' + link(review.sources.recipe,'Recipe ingredient table',ingredient.tablePage) +
        (ingredient.methodPage !== ingredient.tablePage ? link(review.sources.recipe,'Preparation method',ingredient.methodPage) : '') + '</div>' : '';
      const options = [...forms(spice)].map(([code,name]) => '<option value="' + code + '">' + esc(name) + '</option>').join('');
      return '<section class="panel compact rhizome-spice" data-spice="' + key + '" data-product="' + esc(id) + '"><h4>' +
        esc(spice.name) + ' · raw material</h4><p><i>' + esc(spice.species) + '</i> · FSSAI ' + esc(spice.clause) + '</p>' + printed +
        '<label for="rhizome-form-' + key + '">Form of ' + key + ' supplied</label><select id="rhizome-form-' + key +
        '" class="rhizome-form" aria-controls="rhizome-result-' + key + '"><option value="">Select supplied form</option>' + options + '</select>' +
        '<div class="rhizome-lot" hidden><label for="rhizome-lot-' + key + '">Supplier document or lot reference for ' + key +
        ' (optional)</label><input id="rhizome-lot-' + key + '" maxlength="160" type="text" autocomplete="off"></div>' +
        '<div class="rhizome-result" id="rhizome-result-' + key + '" aria-live="polite"></div><div class="controls">' +
        link(review.report,'Ginger and turmeric source review') + '</div></section>';
    }).join('');
  }

  function briefLines(review, id, container, paste) {
    if (!container) return [];
    const lines = [];
    for (const {spice,ingredient,recipe} of entries(review,id)) {
      const panel = container.querySelector('.rhizome-spice[data-spice="' + spice.key + '"]');
      if (panel?.dataset.product !== id) continue;
      const selected = panel.querySelector('.rhizome-form').value;
      const label = forms(spice).get(selected);
      lines.push('',spice.name + ' · raw ingredient', 'Supplied form · ' + (label || 'Unconfirmed'));
      if (ingredient) lines.push('Recipe ' + recipe.number + ', ingredient ' + ingredient.serial + ' · ' + ingredient.name +
        '. ' + ingredient.stage + ' ' + review.sources.recipe + '#page=' + ingredient.methodPage);
      const ref = panel.querySelector('.rhizome-lot input').value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g,' ').trim().slice(0,160);
      if (label && ref) lines.push('Supplier document or lot reference · ' + ref);
      if (!eligible(selected)) {
        const note = paste && root.PMSVGingerPaste.supplyNote(paste,id,spice.key,selected);
        if (note) lines.push(note);
        else if (!(paste && spice.key === 'ginger' && selected === 'paste' && id === paste.recipe.productId)) {
          lines.push('The supplied form needs confirmation or separate assessment. No raw limits selected.');
        }
        continue;
      }
      lines.push(spice.scope,'Candidate references for the supplied raw material');
      for (const [i,row] of spice.rawRows.entries()) lines.push(row.name + ' · ' + row.maximum + ' ' + row.unit +
        (row.basis ? ' on a dry-matter basis' : '') + ' · ' + review.sources.gazette + '#page=' + row.pdfPage +
        ' · ' + review.sources.compendium + '#page=' + spice.compendiumPages[i]);
      lines.push('FSSAI ' + spice.clause + ' · ' + review.spiceStandard.url + '#page=' + (selected === 'whole' ? spice.wholePage : spice.powderPage));
      if (spice.identityTest) lines.push('Separate lead chromate test · Negative · ' + review.spiceStandard.url + '#page=' + spice.identityTest.page);
      if (ingredient) lines.push('Assess the finished preparation separately.');
    }
    return lines;
  }

  const api = Object.freeze({validReview, entries, markup, result, briefLines});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVRhizomeSpices = api;
  if (typeof document === 'undefined') return;
  document.addEventListener('change', event => {
    if (!event.target.matches('.rhizome-form')) return;
    const panel = event.target.closest('.rhizome-spice');
    const review = root.PMSV_REVIEW_REGISTER.rhizomeSpiceReview;
    const entry = entries(review,panel.dataset.product).find(item => item.spice.key === panel.dataset.spice);
    if (!entry) return;
    const form = event.target.value;
    panel.querySelector('.rhizome-lot input').value = '';
    panel.querySelector('.rhizome-lot').hidden = !forms(entry.spice).has(form);
    const paste = root.PMSV_REVIEW_REGISTER.gingerPasteReview;
    panel.querySelector('.rhizome-result').innerHTML = root.PMSVGingerPaste.supplyMarkup(paste,panel.dataset.product,entry.spice.key,form) ||
      result(review,entry.spice,form);
  });
})(typeof globalThis === 'object' ? globalThis : this);
