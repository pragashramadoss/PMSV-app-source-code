/* Compare the two composition minima in the named ginger-paste row of FSSR 2.3.28. */
(function (root) {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const culinary = typeof module === 'object' && module.exports ? require('./culinary-sauces.js') : root.PMSVCulinarySauces;
  if (!culinary) return;

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

  function markup(review,id) {
    return culinary.markup(culinary.gingerArticle(review,id));
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

  function briefLines(review,id,container) {
    return culinary.briefLines(culinary.gingerArticle(review,id),container);
  }

  const api = Object.freeze({validReview,compare:culinary.compare,markup,supplyNote,supplyMarkup,briefLines});
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PMSVGingerPaste = api;
  if (typeof document === 'undefined') return;
  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-ginger-paste]')) root.PMSV_HELPER_TEST?.selectProduct(root.PMSV_REVIEW_REGISTER.gingerPasteReview.productId);
  });
})(typeof globalThis === 'object' ? globalThis : this);
