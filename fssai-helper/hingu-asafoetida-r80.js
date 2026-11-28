/* Methods and conditional raw-spice references for Hingu in recipe 13.1. */
(function (root) {
  'use strict';
  const spice = typeof module === 'object' && module.exports ? require('./spice-contaminants.js') : root.PMSVSpiceContaminants;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const grades = ['hing', 'hingra', 'compounded'];

  function validReview(review, coverage, previous) {
    const ingredient = review?.ingredient;
    if (review?.round !== 80 || review.reviewedOn !== '2026-11-18' ||
        review.report !== 'ctr-hingu-asafoetida-r80-2026-11-18.md' ||
        ingredient?.recipe !== '13.1' || ingredient.serial !== 5 || ingredient.name !== 'Hingu' ||
        ingredient.part !== 'Oleoresin gum' || ingredient.amount !== 'Q.S.' ||
        ingredient.status !== 'CONDITIONAL_RAW_SPICE_REFERENCE' || !same(review.rawGrades, ['hing', 'hingra']) ||
        !spice?.validRows(review.rawRows)) return false;

    if (!previous || !Array.isArray(previous.remainingInstances) || !coverage) return false;
    const remaining = previous.remainingInstances.filter(row => row.recipe !== ingredient.recipe || row.serial !== ingredient.serial);
    if (remaining.length !== previous.withoutCandidate - 1 || !same(coverage.remainingInstances, remaining) ||
        coverage.ingredientRows !== previous.ingredientRows || coverage.withCandidate !== previous.withCandidate + 1 ||
        coverage.withoutCandidate !== remaining.length || coverage.candidateLinks !== previous.candidateLinks + review.rawRows.length ||
        coverage.withCandidate + coverage.withoutCandidate !== coverage.ingredientRows ||
        coverage.originalUnadjudicatedInstances !== previous.originalUnadjudicatedInstances) return false;
    const limits = review.boundaries;
    if (limits?.actualIngredientApplicability !== 'OPEN' || limits.productArticleDecision !== 'OPEN' ||
        limits.actualIngredientDecisionsClosed !== 0 || !['recipeSubstitutionApproved', 'autoApplyLimits',
          'batchRelease', 'pesticideDefaultAssigned', 'fullCurrentLawComplete'].every(key => limits[key] === false)) return false;
    const extract = review.extract;
    if (extract?.alcoholPercentByVolume !== 90 || !grades.every(grade => extract.testPortionGrams?.[grade] === (grade === 'compounded' ? 10 : 2)) ||
        extract.calculation !== '100 − (residue % + moisture %)' || extract.unit !== '% by mass' ||
        extract.uspEquivalenceEstablished !== false) return false;

    const methods = [
      ['total-ash', 'FSSAI 10.006:2021', 'manual', [24,26]], ['acid-insoluble-ash', 'FSSAI 10.007:2021', 'manual', [27,28]],
      ['alcoholic-extract', 'FSSAI 10.010:2021', 'manual', [32,33]], ['foreign-resins', 'FSSAI 10.034:2021', 'manual', [85,86]],
      ['colophony', 'FSSAI 10.035:2021', 'manual', [87,88]], ['starch', 'IS 7807:1975, clause 8', 'is7807', [12,12]]
    ];
    if (!Array.isArray(review.methods) || review.methods.length !== methods.length ||
        !review.methods.every((row, i) => row?.parameter && row.detail &&
          same([row.id, row.code, row.source, row.pages], methods[i]))) return false;
    const hosts = {manual:'fssai.gov.in', is7807:'law.resource.org', bisProgramme:'www.services.bis.gov.in',
      chapter:'fssai.gov.in', spiceBoard:'www.indianspices.com', gazette:'fssai.gov.in',
      spicesAct:'faolex.fao.org', recipe:'fssai.gov.in'};
    if (!Object.entries(hosts).every(([key, host]) => {
      const source = review.sources?.[key];
      try {
        const url = new URL(source?.url);
        return url.protocol === 'https:' && url.hostname === host &&
          (key === 'spiceBoard' || /^[a-f0-9]{64}$/.test(source.sha256));
      } catch { return false; }
    })) return false;
    return review.sources.manual.orderDate === '2021-06-22' && review.sources.chapter.clause === '2.9.29' &&
      review.sources.is7807.addendum === '1976-08' && review.sources.bisProgramme.reaffirmed === '2024-06' &&
      review.sources.bisProgramme.amendmentCountCell === '-' && typeof review.matrixNote === 'string' && !!review.matrixNote.trim();
  }

  function link(source, label, page) {
    return '<a class="source-ref" href="' + escape(source.url + (page ? '#page=' + page : '')) +
      '" target="_blank" rel="noopener noreferrer">' + escape(label) + ' ↗</a>';
  }

  function methodsMarkup(review, grade) {
    const items = review.methods.map(row => {
      const page = row.pages[0];
      let detail = row.detail;
      if (row.id === 'alcoholic-extract') {
        detail += ' For this grade the nominal test portion is ' + review.extract.testPortionGrams[grade] +
          ' g. The asafoetida note gives ' + review.extract.calculation + ', expressed as ' + review.extract.unit + '.';
      } else if (row.id === 'starch') {
        detail += grade === 'compounded'
          ? ' The compounded grade has no numeric starch maximum in clause 2.9.29.'
          : ' Clause 2.9.29 sets the grade maximum at 1% by weight.';
      }
      return '<li data-hingu-method="' + escape(row.id) + '"><strong>' + escape(row.parameter) + '</strong><p>' +
        escape(detail) + '</p>' + link(review.sources[row.source], row.code, page) + '</li>';
    }).join('');
    return '<details class="hingu-methods"><summary>Laboratory method references</summary><ul>' + items +
      '</ul><p>Confirm the method version, matrix and result basis with the reporting laboratory. The 1976 addendum to IS 7807 gives a completion endpoint for extraction. The BIS programme records reaffirmation in June 2024.</p>' +
      link(review.sources.is7807, 'IS 7807 addendum', 14) + link(review.sources.bisProgramme, 'BIS programme, PDF p. 5', 5) + '</details>';
  }

  function rawMarkup(review, grade, confirmed) {
    if (confirmed !== true || !review?.rawGrades?.includes(grade)) return '';
    return spice.table(review.rawRows, review.sources.gazette, 'hingu-table', 'hingu-raw-entry') +
      '<p>The grouped spice articles are candidate references for this material. Lead specifies dry matter. The arsenic row gives no species or dry-matter qualifier. Assess the finished khichdi under its own food article.</p>' +
      link(review.sources.spicesAct, 'Spices Board Act, Schedule entry 34', 19);
  }

  function markup(review, grade) {
    if (!review || !grades.includes(grade)) return '';
    const supply = review.rawGrades.includes(grade)
      ? '<h5>Raw-spice contaminant references</h5><p>' + escape(review.matrixNote) +
        '</p><label class="hingu-confirm"><input type="checkbox" id="hinguRawConfirmed" aria-controls="hinguRawRows">' +
        '<span>Supplier confirms pure, dried Ferula gum resin of culinary grade.</span></label><div id="hinguRawRows" aria-live="polite"></div>'
      : '<p class="notice">The compounded grade includes a carrier such as starch, cereal flour or gum arabic. Assess the mixture and its ingredients separately. Substitution for the recipe’s Hingu requires review.</p>';
    return '<div class="hingu-evidence">' + supply + methodsMarkup(review, grade) +
      '<p>' + link(review.sources.chapter, 'FSSAI 2.9.29, 2025 edition', 34) +
      '<a class="source-ref" href="' + escape(review.report) + '" target="_blank" rel="noopener noreferrer">Hingu source review ↗</a></p></div>';
  }

  const api = Object.freeze({validReview, markup, rawMarkup});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVHingu = api;
  if (typeof document === 'undefined') return;
  document.addEventListener('change', event => {
    if (event.target.id !== 'hinguRawConfirmed') return;
    const grade = document.getElementById('asafoetidaGrade').value;
    document.getElementById('hinguRawRows').innerHTML = rawMarkup(root.PMSV_REVIEW_REGISTER.hinguReview, grade, event.target.checked);
  });
})(typeof globalThis === 'object' ? globalThis : this);
