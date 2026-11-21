import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const flowers = require('../fssai-helper/recipe-flowers-r81.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const read = name => fs.readFileSync(new URL('../fssai-helper/' + name, import.meta.url), 'utf8');
const context = vm.createContext({window:{}});
for (const name of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(name), context);
const catalogue = context.window.PMSV_CATALOGUE;
const register = JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const review = register.recipeFlowerReview;
const [named, aromatic] = review.recipes;
const [ketaki, jati, dadima, punnaga] = named.flowers;
const earlier = register.hinguReview.coverage;
const current = review.coverage;

assert.equal(validateReview(register, catalogue).ok, true);
assert.deepEqual([review.round, current.ingredientRows, current.withCandidate, current.withoutCandidate, current.candidateLinks],
  [81, 46, 35, 11, 104]);
assert.deepEqual(current.remainingInstances, earlier.remainingInstances.filter(row => row.recipe !== '14.6' || row.serial !== 9));
assert.equal(current.originalUnadjudicatedInstances, 14);
assert.equal(register.records.filter(row => row.legalArticleDecision === 'OPEN').length, 137);
assert.deepEqual(review.recipes.map(r => r.flowers.map(f => f.serial)), [[2,9,10,11],[2]]);
assert.equal(review.sources.codex.sha256, '5d23f32aeaef4ecc4238a0508303c0c71ea6d593a1c5a1594a97d202eb552f01');
assert.deepEqual(jati.references.map(ref => ref.slice(0,2)), [['codex',109],['codex',105]]);
assert.match(ketaki.scope, /Pandanus fascicularis.*Pandanus odorifer/);
assert.match(punnaga.stage, /Lehya and Sharkara/);
assert.equal(aromatic.flowers[0].species, null);
assert(dadima.references.some(ref => ref[0] === 'pesticides' && ref[1] === 38));
for (const recipe of review.recipes) {
  const product = register.records.find(row => row.id === recipe.productId);
  assert(product.reports.some(ref => ref.round === 81 && ref.file === review.report));
  assert(product.sourceReviewResult.includes(recipe.sourceReviewResult));
}
const original = JSON.parse(read('ctr-original-gazette-concordance-r70-2026-11-14.json'));
const herbRows = original.metalRows.filter(row => /\bdried herbs\b/i.test(row.originalArticle));
assert.deepEqual(review.rawRows.map(row => row.name).sort(), herbRows.map(row => row.metal).sort());
for (const metal of herbRows) {
  assert.deepEqual(review.rawRows.find(row => row.name === metal.metal), {name:metal.metal, article:metal.originalArticle,
    maximum:metal.coreLimit, unit:metal.coreUnit, basis:metal.coreCondition, pdfPage:metal.sourcePdfPage});
}
assert.equal(review.sources.gazette.sha256, original.sources.ctr2020.sha256);
assert.equal(review.sources.compendium.sha256, register.juniperSpiceReview.sources.compendium.sha256);
const pesticide = JSON.parse(read('ctr-residue-gazette-concordance-r71-2026-11-14.json'));
const fruit = pesticide.pesticideGroups.find(row => row.serial === 64).rows.find(row =>
  row.originalArticleCell === 'Pomegranate' && row.originalSubgroup === '(d) Metiram as CS2');
assert.equal(fruit.sourcePdfPage, 38);
assert.equal(review.sources.pesticides.sha256, pesticide.sources.ctr2018.sha256);
assert.equal(review.sources.recipe.sha256, register.hinguReview.sources.recipe.sha256);
assert.equal(review.sources.ayurveda.sha256, register.camphorReview.sources.ayurveda2022.sha256);
assert.equal(flowers.markup(review, 'absent'), '');
assert(!flowers.markup(review, named.productId).includes('10 mg/kg'));
assert(!flowers.markup(review, aromatic.productId).includes('type="checkbox"'));
for (const recipe of review.recipes) {
  for (const flower of [...named.flowers, aromatic.flowers[0], undefined]) {
    for (const confirmed of [true,false,1,'true',undefined]) {
      const detail = flowers.rawMarkup(review, recipe, flower, confirmed);
      const eligible = recipe === named && flower === jati && confirmed === true;
      assert.equal(detail.includes('10 mg/kg on a dry-matter basis'), eligible);
      assert.equal(detail.includes('5 mg/kg. The row specifies neither an arsenic species nor a dry-matter basis'), eligible);
      assert(!detail.includes('aflatoxin'));
    }
  }
}
const mutations = [
  r => {r.recipeFlowerReview.recipes.reverse();}, r => {r.recipeFlowerReview.recipes[0].flowers[1].species = 'Jasminum sambac';},
  r => {r.recipeFlowerReview.recipes[0].flowers[2].serial = 11;}, r => {r.recipeFlowerReview.recipes[1].flowers[0].species = jati.species;},
  r => {r.recipeFlowerReview.recipes[1].flowers[0].examples.pop();}, r => {r.recipeFlowerReview.rawRows.pop();},
  r => {r.recipeFlowerReview.rawRows[1].basis = 'On dry matter basis.';}, r => {r.recipeFlowerReview.rawRows.push(r.hinguReview.rawRows[2]);},
  r => {r.recipeFlowerReview.rawRows[0].basis = '';}, r => {r.recipeFlowerReview.rawRows[0].maximum = 0.5;},
  r => {r.recipeFlowerReview.rawRows[0].article = {};}, r => {r.recipeFlowerReview.oilAdditive.material = 'Ketaki flower';},
  r => {r.recipeFlowerReview.oilAdditive.maximum = 2;}, r => {r.recipeFlowerReview.sources.codex.url = 'https://codex.fao.org/unrelated';},
  r => {r.recipeFlowerReview.recipes[0].flowers[0].references[0][1] = 109;}, r => {r.recipeFlowerReview.boundaries.recipeAlignment = 'APPROVED';},
  r => {r.recipeFlowerReview.boundaries.batchRelease = true;}, r => {r.recipeFlowerReview.boundaries.autoApplyLimits = true;},
  r => {r.recipeFlowerReview.ingredient.recipe = '14.7';}, r => {r.ayurvedaIngredientCoverage.candidateLinks = 106;},
  r => {r.ayurvedaIngredientCoverage.remainingInstances[0] = {recipe:'14.6', serial:9, name:'Jati'};},
  r => {const row = r.records.find(record => record.id === aromatic.productId); row.reports = row.reports.filter(ref => ref.round !== 81);}
];
for (const change of mutations) {
  const copy = structuredClone(register);
  change(copy);
  assert.equal(validateReview(copy, catalogue).ok, false);
}
console.log('R81 PASS: five flower entries, both Gazette metal rows naming dried herbs, separate oil and fruit sources, 35 of 46 ingredient entries and ' + mutations.length + ' altered records.');
