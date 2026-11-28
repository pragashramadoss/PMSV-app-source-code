/* Flower identities, ingredient forms and source references for recipes 14.6 and 14.7. */
(function (root) {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const identities = [
    ['14.6', '102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk', 96, 97, [
      ['ketaki', 2, 'Ketaki', 'Pandanus tectorius Soland.'],
      ['jati', 9, 'Jati', 'Jasminum officinale L.'],
      ['dadima', 10, 'Dadima', 'Punica granatum L.'],
      ['punnaga', 11, 'Punnaga', 'Calophyllum inophyllum L.']
    ]],
    ['14.7', '102-102-1-14-7-ksheerapaka-mystic-milk-quartet', 98, 98, [
      ['aromatic', 2, 'Sugandhita pushpa', null]
    ]]
  ];
  const host = {recipe:'fssai.gov.in', codex:'codex.fao.org', kew:'powo.science.kew.org',
    gazette:'www.fssai.gov.in', compendium:'fssai.gov.in', ayurveda:'www.fssai.gov.in', pesticides:'fssai.gov.in'};
  const evidencePages = {
    ketaki:[['codex',124],['kew',null]], jati:[['codex',109],['codex',105]],
    dadima:[['codex',33],['pesticides',38]], punnaga:[['recipe',97]], aromatic:[['recipe',98]]
  };

  function validReview(review, current, previous) {
    if (review?.round !== 81 || review.reviewedOn !== '2026-11-18' ||
        review.report !== 'ctr-recipe-flowers-r81-2026-11-18.md' ||
        !same(review.ingredient, {recipe:'14.6', serial:9, name:'Jati'}) ||
        !same(review.gazetteRowKeys, [{metal:'Lead', coreIndex:60},{metal:'Arsenic', coreIndex:25}]) ||
        !Array.isArray(review.rawRows) || review.rawRows.length !== 2) return false;
    const expectedMetals = [['Lead',10,'On dry matter basis.',20],['Arsenic',5,'',24]];
    if (!review.rawRows.every((row, i) => row?.unit === 'mg/kg' && typeof row.article === 'string' &&
        row.article.toLowerCase().includes('dried herbs') &&
        same([row.name,row.maximum,row.basis,row.pdfPage], expectedMetals[i]))) return false;
    if (!same(review.oilAdditive, {schedule:'C', serial:28, material:'Kewda/Kewra (oil from Ketaki)',
      maximum:0.5, unit:'%', pdfPage:22})) return false;
    const limits = review.boundaries;
    if (!['actualIngredientApplicability','recipeAlignment','productArticleDecision'].every(k => limits?.[k] === 'OPEN') ||
        !['autoApplyLimits','flowerSubstitutionApproved','pesticideDefaultAssigned','batchRelease'].every(k => limits[k] === false)) return false;
    for (const [key, domain] of Object.entries(host)) {
      const source = review.sources?.[key];
      try {
        const url = new URL(source?.url);
        if (url.protocol !== 'https:' || url.hostname !== domain ||
            (key !== 'kew' && (!/^[a-f0-9]{64}$/.test(source.sha256) || !Array.isArray(source.pages)))) return false;
      } catch { return false; }
    }
    if (!same(review.sources.gazette.pages, [20,24]) || !same(review.sources.compendium.pages, [3,8]) ||
        review.sources.codex.edition !== 'CXA 4-1989, amended 2025' ||
        review.sources.codex.url !== 'https://codex.fao.org/restapi/searchstandard/CXA_004e.pdf?lang=en&id=39' ||
        review.sources.codex.sha256 !== '5d23f32aeaef4ecc4238a0508303c0c71ea6d593a1c5a1594a97d202eb552f01' ||
        !same(review.sources.codex.pages, [33,36,105,109,110,124,218]) ||
        !Array.isArray(review.recipes) || review.recipes.length !== identities.length) return false;
    for (const [index, expected] of identities.entries()) {
      const recipe = review.recipes[index];
      if (!recipe || !same([recipe.number, recipe.productId, recipe.tablePage, recipe.methodPage], expected.slice(0,4)) ||
          !Array.isArray(recipe.flowers) || recipe.flowers.length !== expected[4].length) return false;
      for (const [i, flower] of recipe.flowers.entries()) {
        if (!flower || !same([flower.key, flower.serial, flower.name, flower.species], expected[4][i]) ||
            typeof flower.stage !== 'string' || !flower.stage.trim() || typeof flower.scope !== 'string' || !flower.scope.trim() ||
            !Array.isArray(flower.references) || !flower.references.length ||
            !flower.references.every(ref => Array.isArray(ref) && ref.length === 3 && ref[2] &&
              Object.hasOwn(host, ref[0]) && (ref[0] === 'kew' ? ref[1] === null : review.sources[ref[0]].pages.includes(ref[1]))) ||
            !same(flower.references.map(ref => ref.slice(0,2)), evidencePages[flower.key])) return false;
        if (flower.key === 'aromatic' && !same(flower.examples,
          ['Ketaki (Pandanus tectorius)', 'Jati (Jasminum officinale)'])) return false;
      }
    }
    if (!Array.isArray(previous?.remainingInstances) || !current) return false;
    const remaining = previous.remainingInstances.filter(gap => gap.recipe !== '14.6' || gap.serial !== 9);
    return remaining.length === previous.withoutCandidate - 1 && same(current.remainingInstances, remaining) &&
      current.withCandidate === previous.withCandidate + 1 && current.withoutCandidate === remaining.length &&
      current.candidateLinks === previous.candidateLinks + review.rawRows.length && current.ingredientRows === previous.ingredientRows &&
      current.originalUnadjudicatedInstances === previous.originalUnadjudicatedInstances;
  }

  function link(url, label, page) {
    return '<a class="source-ref" href="' + escape(url + (page ? '#page=' + page : '')) +
      '" target="_blank" rel="noopener noreferrer">' + escape(label) + ' ↗</a>';
  }

  const suppliedIdentities = new Map([
    ['jati', 'Jati · Jasminum officinale, identified separately'],
    ['ketaki', 'Ketaki · Pandanus tectorius, identified separately'],
    ['other', 'Other individually identified flower'],
    ['mixed', 'Mixed flowers supplied together'],
    ['unknown', 'Unidentified flower supply']
  ]);
  const suppliedForms = new Map([
    ['naturally-dried-culinary', 'Naturally dried, food-grade culinary flowers'],
    ['fresh', 'Fresh flowers'],
    ['oil-extract', 'Oil or extract'],
    ['other', 'Other supplied form'],
    ['unknown', 'Form unconfirmed']
  ]);

  function validSupplyReview(supply, review, coverage) {
    if (supply?.round !== 82 || supply.reviewedOn !== '2026-11-19' ||
        supply.report !== 'ctr-flower-supply-r82-2026-11-19.md' ||
        !same(supply.ingredient, {recipe:'14.7', serial:2, name:'Sugandhita pushpa'}) ||
        !same(supply.candidateMaterial, {identity:'jati', species:'Jasminum officinale L.', part:'Flower',
          form:'naturally-dried-culinary', matrix:'separately supplied raw ingredient'}) ||
        !same(supply.boundaries, {recipeSpecies:null, countAsRecipeReference:false, infusionLimitAssigned:false,
          finishedMilkLimitAssigned:false, productArticleDecision:'OPEN'}) ||
        !same(supply.sourcePages, {recipe:[98], codex:[105,109], gazette:[20,24], compendium:[3,8]})) return false;
    return Object.entries(supply.sourcePages).every(([key, pages]) =>
      pages.every(page => review.sources[key].pages.includes(page))) &&
      Array.isArray(supply.recipes) && supply.recipes.length === review.recipes.length &&
      supply.recipes.every((recipe, i) => recipe?.productId === review.recipes[i].productId &&
        typeof recipe.sourceReviewResult === 'string' && !!recipe.sourceReviewResult.trim() &&
        typeof recipe.sourceReviewNextAction === 'string' && !!recipe.sourceReviewNextAction.trim()) &&
      coverage.remainingInstances.some(row => row.recipe === supply.ingredient.recipe &&
        row.serial === supply.ingredient.serial && row.name === supply.ingredient.name);
  }

  function options(choices, placeholder) {
    return '<option value="">' + placeholder + '</option>' + [...choices].map(([key, label]) =>
      '<option value="' + escape(key) + '">' + escape(label) + '</option>').join('');
  }

  function referenceInput() {
    return '<label for="flowerEvidenceRef">Supplier document or lot reference (optional)</label>' +
      '<input type="text" id="flowerEvidenceRef" maxlength="160" autocomplete="off">';
  }

  function supplyFields(identity) {
    if (!suppliedIdentities.has(identity)) return '';
    const botanical = identity === 'other' ? '<label for="flowerOtherSpecies">Botanical name on the supplier record</label>' +
      '<input type="text" id="flowerOtherSpecies" maxlength="100" autocomplete="off">' : '';
    return botanical + '<label for="flowerSupplyForm">Form recorded by the supplier</label>' +
      '<select id="flowerSupplyForm" aria-controls="flowerRawResult">' + options(suppliedForms, 'Select form') + '</select>' +
      referenceInput() + '<div id="flowerRawResult" aria-live="polite"></div>';
  }

  function assessment(review, productId, selection) {
    const recipe = review.recipes.find(item => item.productId === productId);
    if (!recipe) return null;
    const named = recipe.productId === identities[0][1];
    const flower = named ? recipe.flowers.find(item => item.key === selection.flower) : recipe.flowers[0];
    const identity = named ? flower?.key : selection.identity;
    const form = named ? (identity === 'jati' && selection.confirmed === true ? 'naturally-dried-culinary' : '') :
      (suppliedIdentities.has(identity) && suppliedForms.has(selection.form) ? selection.form : '');
    const eligible = identity === 'jati' && form === 'naturally-dried-culinary' && (named ?
      flower?.serial === review.ingredient.serial && flower?.species === 'Jasminum officinale L.' :
      recipe.productId === identities[1][1] && flower?.key === 'aromatic' && flower?.species === null);
    return {recipe, named, flower, identity, form, rows:eligible ? review.rawRows : []};
  }

  function metalText(row) {
    return row.maximum + ' ' + row.unit + (row.basis ? ' on a dry-matter basis.' :
      '. The row specifies neither an arsenic species nor a dry-matter basis.');
  }

  function metalMarkup(review, rows) {
    if (!rows.length) return '';
    const entries = rows.map(row => '<li data-flower-metal="' + escape(row.name) + '"><strong>' +
      escape(row.name) + '</strong> · ' + escape(metalText(row)) + ' ' +
      link(review.sources.gazette.url, 'Gazette p. ' + row.pdfPage, row.pdfPage) + '</li>');
    return '<div class="flower-metals notice"><strong>Candidate metal limits for the dried ingredient</strong><ul>' +
      entries.join('') + '</ul><p>Check the reporting basis with the laboratory. Assess the infusion and the finished milk separately.</p></div>';
  }

  function rawMarkup(review, recipe, flower, confirmed) {
    if (recipe?.productId !== identities[0][1] || flower?.key !== 'jati' ||
        flower.serial !== review.ingredient.serial || flower.species !== 'Jasminum officinale L.') return '';
    return metalMarkup(review, assessment(review, recipe.productId, {flower:flower.key, confirmed}).rows);
  }

  function selectionFromPanel(panel) {
    const value = id => panel.querySelector('#' + id)?.value || '';
    return {flower:value('recipeFlower'), confirmed:panel.querySelector('#flowerDriedJati')?.checked === true,
      identity:value('flowerSupplyIdentity'), form:value('flowerSupplyForm'), species:value('flowerOtherSpecies'),
      reference:value('flowerEvidenceRef')};
  }

  function evidenceText(text, max) {
    return String(text || '').replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').trim().slice(0, max);
  }

  function briefLines(review, productId, panel) {
    if (!panel || panel.dataset.flowerProduct !== productId) return [];
    const selection = selectionFromPanel(panel);
    const material = assessment(review, productId, selection);
    if (!material) return [];
    const {recipe, named, flower, identity, form, rows} = material;
    const lines = ['', 'Flower evidence for recipe ' + recipe.number];
    if (named) {
      if (!flower) return lines.concat('No recipe flower selected.', '');
      lines.push('Selected recipe ingredient ' + flower.serial + ' · ' + flower.name + ' · ' + flower.species);
    } else {
      lines.push('Printed ingredient 2 · Sugandhita pushpa (aromatic flowers).');
      if (!suppliedIdentities.has(identity)) return lines.concat('Supplier identity and form have not been recorded.', '');
      lines.push('Supplier identity · ' + suppliedIdentities.get(identity));
      if (identity === 'other' && selection.species.trim()) lines.push('Supplier botanical name · ' + evidenceText(selection.species, 100));
    }
    lines.push('Supplier form · ' + (suppliedForms.get(form) || 'Unconfirmed'));
    const ref = evidenceText(selection.reference, 160);
    if (ref) lines.push('Supplier document or lot reference · ' + ref);
    lines.push('FSSAI recipe · ' + review.sources.recipe.url + '#page=' + recipe.tablePage);
    if (rows.length) {
      lines.push('Candidate references for this raw flower supply');
      for (const row of rows) lines.push(row.name + ' · ' + metalText(row) + ' ' + review.sources.gazette.url + '#page=' + row.pdfPage);
      lines.push('Codex jasmine identity HH 3231 · ' + review.sources.codex.url + '#page=109');
    } else lines.push('A candidate metal reference has not been assigned to this supply.');
    return lines.concat('The infusion and finished milk require separate assessment.', '');
  }

  function flowerDetail(review, recipe, flower) {
    if (!flower) return '';
    const refs = flower.references.map(([source, page, label]) => link(review.sources[source].url, label, page));
    if (!flower.references.some(([source, page]) => source === 'recipe' && page === recipe.methodPage)) {
      refs.push(link(review.sources.recipe.url, 'FSSAI preparation stages', recipe.methodPage));
    }
    let material = '';
    if (flower.key === 'jati') {
      material = '<label class="flower-confirm"><input type="checkbox" id="flowerDriedJati" aria-controls="flowerRawResult">' +
        '<span>The supplier confirms naturally dried, food-grade flowers of <i>Jasminum officinale</i> supplied as a culinary herb.</span></label>' +
        '<p class="muted">Fresh flowers, oil, extracts and mixed or unidentified material need a separate review.</p>' +
        '<div id="flowerRawResult" aria-live="polite"></div>';
    } else if (flower.key === 'aromatic') {
      material = '<label for="flowerSupplyIdentity">Flower identified by the supplier</label>' +
        '<select id="flowerSupplyIdentity" aria-controls="flowerSupplyDetail">' +
        options(suppliedIdentities, 'Select supplier identity') + '</select><div id="flowerSupplyDetail"></div>';
    } else if (flower.key === 'ketaki') {
      const oil = review.oilAdditive;
      material = '<details><summary>Kewda oil as an additive</summary><p>Schedule C, entry ' + oil.serial +
        ', gives a maximum of ' + oil.maximum + escape(oil.unit) + ' for ' + escape(oil.material) +
        '. The recipe lists the flower at Q.S. Any proposed oil substitution needs separate assessment.</p>' +
        link(review.sources.ayurveda.url, 'FSSAI Schedule C', oil.pdfPage) + '</details>';
    }
    if (flower.key !== 'aromatic') material += referenceInput();
    return '<p><strong>Ingredient ' + escape(flower.serial) + ' · ' + escape(flower.name) + '</strong>' +
      (flower.species ? ' · <i>' + escape(flower.species) + '</i>' : '') + ' · Flower · Q.S.</p><p>' + escape(flower.stage) + '</p>' +
      (flower.examples ? '<p>Footnote examples include ' + flower.examples.map(escape).join(' and ') + '.</p>' : '') +
      '<p>' + escape(flower.scope) + '</p><div class="controls">' + refs.join('') + '</div>' + material;
  }

  function markup(review, productId) {
    const recipe = review?.recipes?.find(item => item.productId === productId);
    if (!recipe) return '';
    const single = recipe.flowers.length === 1;
    const choices = single ? '' : '<label for="recipeFlower">Recipe flower</label><select id="recipeFlower" aria-controls="flowerDetail">' +
      '<option value="">Select a flower</option>' + recipe.flowers.map(f => '<option value="' + escape(f.key) + '">' +
      escape(f.name) + '</option>').join('') + '</select>';
    return '<section class="panel compact recipe-flower-note" data-flower-product="' + escape(productId) +
      '"><h4>Flower ingredients in recipe ' + escape(recipe.number) + '</h4>' + choices +
      '<div id="flowerDetail" aria-live="polite">' + (single ? flowerDetail(review, recipe, recipe.flowers[0]) : '') +
      '</div><p class="muted">The published recipe title and preparation method still need clarification.</p><div class="controls">' +
      link(review.sources.recipe.url, 'FSSAI ingredient table', recipe.tablePage) + link(review.report, 'Flower source review') + '</div></section>';
  }

  function supplierResult(review, productId, panel) {
    const material = assessment(review, productId, selectionFromPanel(panel));
    if (material.rows.length) return metalMarkup(review, material.rows);
    const messages = {
      jati:material.form ? 'This form requires a separate raw-material review.' : 'Select the documented form to check the raw flower references.',
      ketaki:'Ketaki requires its own raw-flower review. The common name kewra can refer to a different species.',
      other:'Record the botanical name and assess this species and plant part separately.',
      mixed:'The blend needs its own assessment. A separately supplied Jati reference cannot be assigned to the mixture.',
      unknown:'Obtain the botanical identity and plant part from the supplier before selecting a raw-material reference.'
    };
    return '<p class="muted">' + escape(messages[material.identity] || '') + '</p>';
  }

  const api = Object.freeze({validReview, validSupplyReview, markup, rawMarkup, assessment, briefLines});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVRecipeFlowers = api;
  if (typeof document === 'undefined') return;
  document.addEventListener('change', event => {
    const target = event.target;
    const panel = target.closest('.recipe-flower-note');
    if (!panel) return;
    const review = root.PMSV_REVIEW_REGISTER.recipeFlowerReview;
    const productId = panel.dataset.flowerProduct;
    const recipe = review.recipes.find(item => item.productId === productId);
    if (!recipe) return;
    if (target.id === 'recipeFlower') {
      const flower = recipe.flowers.find(item => item.key === target.value);
      panel.querySelector('#flowerDetail').innerHTML = flowerDetail(review, recipe, flower);
    } else if (target.id === 'flowerDriedJati') {
      const selection = selectionFromPanel(panel);
      const flower = recipe.flowers.find(item => item.key === selection.flower);
      panel.querySelector('#flowerRawResult').innerHTML = rawMarkup(review, recipe, flower, selection.confirmed);
    } else if (target.id === 'flowerSupplyIdentity' || target.id === 'flowerSupplyForm') {
      if (target.id === 'flowerSupplyIdentity') panel.querySelector('#flowerSupplyDetail').innerHTML = supplyFields(target.value);
      const result = panel.querySelector('#flowerRawResult');
      if (result) result.innerHTML = supplierResult(review, productId, panel);
    }
  });
})(typeof globalThis === 'object' ? globalThis : this);
