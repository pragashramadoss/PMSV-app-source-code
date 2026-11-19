import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const helper = require('../fssai-helper/rhizome-spices.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const read = name => fs.readFileSync(new URL('../fssai-helper/' + name, import.meta.url),'utf8');
const ctx = vm.createContext({window:{}});
for (const file of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(file),ctx);
const catalogue = ctx.window.PMSV_CATALOGUE;
const register = JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER));
const review = register.rhizomeSpiceReview;
const [ginger,turmeric] = review.spices;
const previous = register.recipeFlowerReview.coverage;
const current = register.ayurvedaIngredientCoverage;
const gazette = JSON.parse(read('ctr-original-gazette-concordance-r70-2026-11-14.json'));
assert.equal(validateReview(register,catalogue).ok, true);
assert.equal(review.round, 83);
assert(register.latestRound >= review.round);
assert.deepEqual([current.candidateLinks, current.withCandidate, current.withoutCandidate, current.ingredientRows], [112,35,11,46]);
assert.deepEqual(current, {...previous,candidateLinks:previous.candidateLinks + 8});
assert.deepEqual(review.recipes.flatMap(recipe => recipe.ingredients.map(ingredient => ingredient.addedReferences.length)),[1,6,1]);
const exact = gazette.metalRows.filter(row => /turmeric/i.test(row.originalArticle));
assert.deepEqual(turmeric.rawRows.slice(0,5).map(r => r.name).sort(),exact.map(r => r.metal).sort());
for (const spice of review.spices) {
  for (const [i,key] of [...spice.metalKeys,...review.toxinKeys].entries()) {
    const row = key.metal ? gazette.metalRows.find(r => r.metal === key.metal && r.coreIndex === key.coreIndex) :
      gazette.cropRows.find(r => r.group === key.group && r.article === key.article);
    const ref = spice.rawRows[i];
    assert.equal(ref.article,row.originalArticle ?? row.originalArticleCell);
    assert.equal(ref.maximum,row.coreLimit ?? row.originalLimit);
    assert.equal(ref.basis,row.coreCondition || '');
    assert.equal(ref.unit,row.coreUnit ?? row.unit);
    assert.equal(ref.pdfPage,row.sourcePdfPage);
  }
}
assert.equal(turmeric.rawRows.find(r => r.name === 'Arsenic').maximum, 0.1);
assert.equal(ginger.rawRows.find(r => r.name === 'Arsenic').maximum, 5);
assert.deepEqual(turmeric.identityTest,{name:'Lead chromate',result:'Negative',page:28});
assert.equal(ginger.identityTest, undefined);
assert.equal(register.records.filter(row => row.legalArticleDecision === 'OPEN').length,137);
const ids = [ginger.productId,turmeric.productId,...review.recipes.map(recipe => recipe.productId)];
assert.deepEqual(ids.map(id => helper.entries(review,id).map(entry => entry.spice.key)), [['ginger'],['turmeric'],['ginger','turmeric'],['ginger']]);
for (const id of ['04-04-2-ginger-paste','ginger-cocktail','purified-vending-water']) {
  assert.equal(helper.markup(review,id),'');
  assert.deepEqual(helper.briefLines(review,id,{querySelector:() => {throw Error('Unrelated control');}}),[]);
}
for (const spice of review.spices) {
  for (const form of ['whole','powder','fresh','paste','other','unknown','','__proto__','unverified']) {
    const eligible = ['whole','powder'].includes(form);
    const html = helper.result(review,spice,form);
    assert.equal((html.match(/class="rhizome-reference"/g)||[]).length,eligible ? spice.rawRows.length : 0);
    for (const [i,row] of spice.rawRows.entries()) {
      assert.equal(html.includes(review.sources.gazette + '#page=' + row.pdfPage + '"'),eligible);
      assert.equal(html.includes(review.sources.compendium + '#page=' + spice.compendiumPages[i] + '"'),eligible);
    }
    const container = {querySelector:() => ({dataset:{product:spice.productId},
      querySelector:selector => ({value:selector === '.rhizome-lot input' ? 'LOT-9\nLine' : form})})};
    const lines = helper.briefLines(review,spice.productId,container);
    assert.equal(lines.some(line => line.startsWith('Arsenic · ')),eligible);
    assert.equal(lines.some(line => line.startsWith('Separate lead chromate')),eligible && spice === turmeric);
    if (eligible) assert(lines.includes('Supplier document or lot reference · LOT-9 Line'));
    assert.deepEqual(helper.briefLines(review,ids[2],container),[]);
  }
}
const mutations = [
  v => {v.spices[1].rawRows[2] = v.spices[0].rawRows[1];},
  v => {v.spices[1].rawRows[0].basis = 'On dry matter basis.';},
  v => {v.spices[1].rawRows[2].maximum = 5;}, v => {v.spices[1].rawRows[3].unit = 'µg/kg';},
  v => {v.spices[0].rawRows[2].maximum = 20;}, v => {v.spices[1].rawRows.pop();},
  v => {v.spices[1].identityTest.result = '10 mg/kg';}, v => {v.spices[1].compendiumPages[2] = 8;},
  v => {v.spices[0].productId = 'ginger-cocktail';}, v => {v.recipes[0].ingredients[1].key = 'ginger';},
  v => {v.recipes[1].ingredients[0].addedReferences = [];}, v => {v.addedLinks = 11;},
  v => {v.boundaries.finishedProductLimitAssigned = true;}, v => {v.boundaries.pesticideDefaultAssigned = true;},
  v => {v.sources.gazette = 'https://example.com/gazette';}
];
for (const change of mutations) {
  const copy = structuredClone(register);
  change(copy.rhizomeSpiceReview);
  assert.equal(validateReview(copy,catalogue).ok,false);
}
console.log('R83 PASS. Checked all five named turmeric metal rows, both aflatoxin entries, dried ginger sources, reporting bases, form selection, catalogue isolation and ' + mutations.length + ' altered records.');
