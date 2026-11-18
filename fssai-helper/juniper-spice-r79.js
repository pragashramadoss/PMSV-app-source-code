/* Published references for the juniper fruit in recipe 12.1. */
(function (root) {
  'use strict';

  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const spice = typeof module === 'object' && module.exports ? require('./spice-contaminants.js') : root.PMSVSpiceContaminants;
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const supplies = {
    culinary: 'Confirmed culinary spice for food use or repackaging',
    industrial: 'Product intended for industrial processing',
    unknown: 'Grade or intended use unconfirmed'
  };

  function validReview(review) {
    if (review?.round !== 79 || review.reviewedOn !== '2026-11-18' ||
        review.report !== 'ctr-juniper-spice-r79-2026-11-18.md' ||
        review.status !== 'CONDITIONAL_RAW_SPICE_REFERENCE' || review.recipeNumber !== '12.1' ||
        review.ingredientSerial !== 3 || review.ingredientId !== 'hribera' ||
        review.species !== 'Juniperus communis L.' || review.part !== 'Fruit') return false;

    const scope = review.scope;
    if (scope?.actualApplicability !== 'OPEN' || scope.actualIngredientDecisionsClosed !== 0 ||
        !['legalProductApproval', 'batchRelease', 'autoApplyLimits', 'pesticideDefaultAssigned',
          'concentrationMultiplierEstablished'].every(key => scope[key] === false)) return false;
    const coverage = review.coverage;
    if (coverage?.ingredientRows !== 46 || coverage.withCandidate !== 33 ||
        coverage.withoutCandidate !== 13 || coverage.candidateLinks !== 98 ||
        coverage.originalUnadjudicatedInstances !== 14 || !Array.isArray(coverage.remainingInstances) ||
        coverage.remainingInstances.length !== coverage.withoutCandidate ||
        !coverage.remainingInstances.every(row => row && typeof row.recipe === 'string' &&
          Number.isInteger(row.serial) && row.name && !(row.recipe === '12.1' && row.serial === 3)) ||
        new Set(coverage.remainingInstances.map(row => row.recipe + '/' + row.serial)).size !== coverage.withoutCandidate) return false;

    if (!spice?.validRows(review.rawRows)) return false;
    if (!Array.isArray(review.styleOptions) || review.styleOptions.some(style => !style?.label) ||
        !same(review.styleOptions.map(s => [s.id, s.moistureMax, s.physicalStyle]), [
          ['wholeNatural', 22, 'whole'], ['wholeDehydrated', 16, 'whole'], ['cut', 16, 'cut'], ['ground', 14, 'ground']
        ])) return false;
    if (review.chemistry?.moistureUnit !== '% w/w' || !Array.isArray(review.chemistry.dryBasis) ||
        review.chemistry.dryBasis.some(row => !row) ||
        !same(review.chemistry.dryBasis.map(r => [r.label, r.bound, r.value, r.unit]), [
          ['Total ash', 'Maximum', 4, '% w/w'], ['Acid-insoluble ash', 'Maximum', 1, '% w/w'],
          ['Volatile oil', 'Minimum', 0.5, 'mL/100 g']
        ])) return false;
    if (!Array.isArray(review.physical) || review.physical.some(row => !row) ||
        !same(review.physical.map(r => [r.label, r.unit, r.whole, r.cut, r.ground]), [
          ['Dead whole insects', 'count/100 g', 3, 3, null], ['Mammalian excreta', 'mg/kg', 1, 1, null],
          ['Visible mould', '% w/w', 1, 1, null], ['Insect damage or infestation', '% w/w', 1, 1, null],
          ['Extraneous matter', '% w/w', 2, 1, null], ['Foreign matter', '% w/w', null, 1, null],
          ['Live insects', 'count/100 g', 0, 0, 0]
        ])) return false;
    const other = review.otherFactors;
    if (other?.whole?.stalksMax !== 3 || other.whole.brokenAmongWholeMax !== 10 || other.whole.unit !== '% w/w' ||
        other.cut !== 'BLANK_IN_SOURCE' || other.ground !== 'NOT_EVALUATED') return false;

    const notes = review.tableNotes;
    if (!['subsamples', 'stalks', 'na', 'method'].every(key => typeof notes?.[key] === 'string' && notes[key].trim()) ||
        !['finishedProduct', 'domesticDraft'].every(key => typeof scope[key] === 'string' && scope[key].trim())) return false;
    const hosts = {board: 'www.indiacode.nic.in', boardArchive: 'faolex.fao.org', codex: 'codex.fao.org',
      gazette: 'fssai.gov.in', compendium: 'fssai.gov.in', juniperDraft: 'fssai.gov.in', parsleyGazette: 'fssai.gov.in'};
    return Object.entries(hosts).every(([key, host]) => {
      const source = review.sources?.[key];
      try {
        const url = new URL(source?.url);
        return url.protocol === 'https:' && url.hostname === host && (key === 'board' || /^[a-f0-9]{64}$/.test(source.sha256));
      } catch { return false; }
    });
  }

  function sourceLink(source, label, page) {
    const href = source.url + (page ? '#page=' + page : '');
    return '<a class="source-ref" href="' + escape(href) + '" target="_blank" rel="noopener noreferrer">' + escape(label) + ' ↗</a>';
  }

  function table(label, entries) {
    const rows = entries.map(([parameter, value]) =>
      '<tr><th scope="row">' + escape(parameter) + '</th><td>' + escape(value) + '</td></tr>').join('');
    return '<table class="methodtable juniper-table"><caption>' + escape(label) +
      '</caption><thead><tr><th scope="col">Parameter</th><th scope="col">Reference</th></tr></thead><tbody>' +
      rows + '</tbody></table>';
  }

  function scopeMarkup(ingredient, material) {
    if (ingredient !== 'hribera' || material !== 'named') return '';
    const options = Object.entries(supplies).map(([key, label]) =>
      '<option value="' + key + '">' + escape(label) + '</option>').join('');
    return '<section class="juniper-scope" aria-labelledby="juniperHeading"><h5 id="juniperHeading">Juniper berry as a food spice</h5>' +
      '<label for="juniperSupply">Supplier specification and intended use</label>' +
      '<select id="juniperSupply"><option value="">Select supply status</option>' + options + '</select>' +
      '<div id="juniperSources"><p>Confirm the species, fruit and culinary grade from the supply documents.</p></div></section>';
  }

  function sourceMarkup(review, supply) {
    if (supply === 'industrial') return '<p>Codex section 1 excludes products intended for industrial processing. Assess the supplied material and its FSSAI article separately.</p>';
    if (supply !== 'culinary') return '<p>Confirm the species, fruit and culinary grade from the supply documents.</p>';
    const options = review.styleOptions.map(s => '<option value="' + escape(s.id) + '">' + escape(s.label) + '</option>').join('');
    return spice.table(review.rawRows, review.sources.gazette, 'juniper-table', 'juniper-raw-entry') +
      '<p>The link to juniper is inferred from the grouped spice articles and Schedule entry 37 of the Spices Board Act. Only lead specifies a dry-matter basis. The arsenic entry gives no species qualifier.</p>' +
      sourceLink(review.sources.boardArchive, 'Spices Board Act, Schedule entry 37', 19) +
      '<p>' + escape(review.scope.finishedProduct) + '</p><details id="juniperQuality"><summary>Codex quality references by supplied style</summary>' +
      '<p>CXS 358-2024 gives international specifications for the supplied berry. Select the style on the supplier specification before preparation of the tea.</p>' +
      '<label for="juniperStyle">Style as supplied</label><select id="juniperStyle"><option value="">Select style</option>' + options +
      '</select><div id="juniperStyleResult" aria-live="polite"></div></details>' +
      '<p class="muted">' + escape(review.scope.domesticDraft) + '</p>' +
      '<a class="source-ref" href="' + escape(review.report) + '" target="_blank" rel="noopener noreferrer">Juniper source review ↗</a>';
  }

  function styleMarkup(review, styleId) {
    const style = review.styleOptions.find(row => row.id === styleId);
    if (!style) return '';
    const chemicals = [['Moisture', 'Maximum ' + style.moistureMax + ' ' + review.chemistry.moistureUnit]];
    for (const row of review.chemistry.dryBasis) {
      chemicals.push([row.label, row.bound + ' ' + row.value + ' ' + row.unit + ' · dry basis']);
    }
    const physical = review.physical.map(row => {
      const limit = row[style.physicalStyle];
      return [row.label, limit === null ? 'N/A · no evaluated value' : 'Maximum ' + limit + ' ' + row.unit];
    });
    const whole = style.physicalStyle === 'whole';
    if (whole) {
      const other = review.otherFactors.whole;
      physical.push(['Stalks', 'Maximum ' + other.stalksMax + ' ' + other.unit],
        ['Broken among whole berries', 'Maximum ' + other.brokenAmongWholeMax + ' ' + other.unit]);
    } else {
      physical.push(['Other factors', style.physicalStyle === 'cut' ? 'Blank in the source table' : 'N/A · no evaluated value']);
    }
    return table('Chemical characteristics', chemicals) + sourceLink(review.sources.codex, 'Codex Table A1, PDF p. 6', 6) +
      table('Physical characteristics', physical) + sourceLink(review.sources.codex, 'Codex Table A2, PDF p. 7', 7) +
      '<p class="muted">' + escape([review.tableNotes.na, whole ? review.tableNotes.stalks : '',
        style.physicalStyle === 'ground' ? '' : review.tableNotes.subsamples, review.tableNotes.method].filter(Boolean).join(' ')) + '</p>';
  }

  const api = Object.freeze({validReview, scopeMarkup, sourceMarkup, styleMarkup});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVJuniperSpice = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('change', event => {
    const id = event.target.id;
    if (id !== 'juniperSupply' && id !== 'juniperStyle') return;
    const review = root.PMSV_REVIEW_REGISTER.juniperSpiceReview;
    if (id === 'juniperSupply') {
      document.getElementById('juniperSources').innerHTML = sourceMarkup(review, event.target.value);
    } else {
      document.getElementById('juniperStyleResult').innerHTML = styleMarkup(review, event.target.value);
    }
  });
})(typeof globalThis === 'object' ? globalThis : this);
