import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {assessment, briefLines} = require('../fssai-helper/recipe-flowers-r81.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const context = vm.createContext({window:{}});
for (const file of ['full-catalogue-533.js','review-status-data.js']) {
  vm.runInContext(fs.readFileSync(new URL('../fssai-helper/' + file, import.meta.url), 'utf8'), context);
}
const register = JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue = context.window.PMSV_CATALOGUE;
const review = register.recipeFlowerReview;
const [named, aromatic] = review.recipes;
const supply = register.flowerSupplyReview;
const coverage = review.coverage;
assert.equal(validateReview(register, catalogue).ok, true);
assert.deepEqual([supply.round, supply.reviewedOn], [82,'2026-11-19']);
assert.deepEqual([coverage.ingredientRows, coverage.withCandidate, coverage.withoutCandidate, coverage.candidateLinks], [46,35,11,104]);
assert(coverage.remainingInstances.some(item => item.recipe === '14.7' && item.serial === 2));
assert.equal(register.records.filter(row => row.reports.some(ref => ref.round === 82)).length, 2);
for (const recipe of supply.recipes) {
  const record = register.records.find(row => row.id === recipe.productId);
  assert(record.reports.some(ref => ref.round === 82 && ref.file === supply.report));
  assert(record.sourceReviewResult.includes(recipe.sourceReviewResult));
  assert.equal(record.legalArticleDecision, 'OPEN');
}

function panel(productId, values) {
  return {dataset:{flowerProduct:productId}, querySelector(selector) {
    const key = selector.slice(1);
    return Object.hasOwn(values, key) ? {value:values[key], checked:values[key] === true} : null;
  }};
}

const values = ['jati','ketaki','other','mixed','unknown','',null,'Jasminum sambac'];
const forms = ['naturally-dried-culinary','fresh','oil-extract','other','unknown','',null,'dried'];
for (const identity of values) {
  for (const form of forms) {
    const selected = {identity, form, flower:'jati', confirmed:true};
    const expected = identity === 'jati' && form === 'naturally-dried-culinary';
    assert.deepEqual(assessment(review, aromatic.productId, selected).rows, expected ? review.rawRows : []);
    const displayed = panel(aromatic.productId, {flowerSupplyIdentity:identity, flowerSupplyForm:form});
    const lines = briefLines(review, aromatic.productId, displayed);
    assert.equal(lines.some(line => line.startsWith('Lead · 10 mg/kg on a dry-matter basis.')), expected);
    assert.equal(lines.some(line => line.startsWith('Arsenic · 5 mg/kg. The row specifies neither')), expected);
    for (const row of review.rawRows) assert.equal(lines.some(line => line.endsWith('#page=' + row.pdfPage)), expected);
    assert.deepEqual(briefLines(review, named.productId, displayed), []);
    assert.deepEqual(briefLines(review, 'unrelated-product', displayed), []);
  }
}
const namedControl = {recipeFlower:'jati', flowerDriedJati:true, flowerEvidenceRef:'SPEC-12\nSecond line'};
const reference = briefLines(review, named.productId, panel(named.productId, namedControl));
assert(reference.includes('Supplier document or lot reference · SPEC-12 Second line'));
assert(reference.some(line => line.includes('Candidate references for this raw flower supply')));
for (const flower of ['dadima','punnaga','ketaki','aromatic','']) {
  assert.deepEqual(assessment(review, named.productId, {flower, confirmed:true, identity:'jati', form:'naturally-dried-culinary'}).rows, []);
}
assert.equal(assessment(review, 'unrelated-product', {flower:'jati', confirmed:true}), null);
assert.deepEqual(briefLines(review, named.productId, null), []);
assert(!JSON.stringify(register).includes('SPEC-12'));
assert(review.sources.gazette.url.startsWith('https://www.fssai.gov.in/docs/food-law/notice-comment/'));
assert(review.sources.ayurveda.url.startsWith('https://www.fssai.gov.in/docs/food-law/notice-comment/'));
const changes = [
  r => {r.flowerSupplyReview.candidateMaterial.species = 'Jasminum sambac';},
  r => {r.flowerSupplyReview.candidateMaterial.form = 'fresh';},
  r => {r.flowerSupplyReview.candidateMaterial.matrix = 'finished milk';},
  r => {r.flowerSupplyReview.ingredient.serial = 9;},
  r => {r.flowerSupplyReview.boundaries.recipeSpecies = 'Jasminum officinale';},
  r => {r.flowerSupplyReview.boundaries.countAsRecipeReference = true;},
  r => {r.flowerSupplyReview.boundaries.infusionLimitAssigned = true;},
  r => {r.flowerSupplyReview.boundaries.finishedMilkLimitAssigned = true;},
  r => {r.flowerSupplyReview.boundaries.productArticleDecision = 'CLOSED';},
  r => {r.flowerSupplyReview.sourcePages.gazette.reverse();},
  r => {r.flowerSupplyReview.recipes.reverse();},
  r => {r.records.find(item => item.id === aromatic.productId).reports.shift();},
  r => {r.ayurvedaIngredientCoverage.withCandidate = 36;}
];
for (const change of changes) {
  const copy = structuredClone(register);
  change(copy);
  assert.equal(validateReview(copy, catalogue).ok, false);
}
console.log('R82 PASS: 64 supplier identity/form combinations, distinct branches for the two recipes, export boundaries and ' + changes.length + ' altered records.');
