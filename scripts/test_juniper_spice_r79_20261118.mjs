import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const helper = require('../fssai-helper/juniper-spice-r79.js');
const { validateReview } = require('../fssai-helper/review-status.js');
const read = name => fs.readFileSync(new URL('../fssai-helper/' + name, import.meta.url), 'utf8');
const context = {window: {}};
vm.createContext(context);
for (const file of ['full-catalogue-533.js', 'review-status-data.js']) vm.runInContext(read(file), context);
const data = JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue = context.window.PMSV_CATALOGUE;
const review = data.juniperSpiceReview;
assert.equal(validateReview(data, catalogue).ok, true);
assert.equal(review.reviewedOn, '2026-11-18');
assert(data.latestSourceReviewDate >= review.reviewedOn);
const linked = data.records.find(row => row.id === review.recipeProductId);
assert.deepEqual(linked.reports.slice(0, 2).map(row => row.round), [79, 78]);
assert.equal(linked.legalArticleDecision, 'OPEN');

const original = JSON.parse(read('ctr-original-gazette-concordance-r70-2026-11-14.json'));
for (const [i, key] of review.gazetteRowKeys.entries()) {
  const row = key.metal ? original.metalRows.find(r => r.metal === key.metal && r.coreIndex === key.coreIndex)
    : original.cropRows.find(r => r.group === key.group && r.article === key.article);
  assert.equal(row.sourceId, 'ctr2020');
  assert.equal(review.rawRows[i].article, row.originalArticle ?? row.originalArticleCell);
  assert.equal(review.rawRows[i].maximum, row.coreLimit ?? row.originalLimit);
}
assert.equal(review.sources.gazette.sha256, original.sources.ctr2020.sha256);
assert.equal(review.sources.codex.sha256, '868091434c536b830f81c0797b155576028321ea17897414682193b7bee74a77');
assert.equal(review.sources.boardArchive.sha256, 'a9c9a72d005b33ff7d2ae8bbfac5c571aeccbb081fbee8a446c27a1c60416da5');
const baseline = JSON.parse(read('ayurveda-ginger-source-and-14-holds-r40-2026-11-04.json'));
const remaining = baseline.remaining_14_original_ingredient_instances
  .filter(r => !(r.recipe_number === '12.1' && r.source_ingredient_serial === 3))
  .map(r => ({recipe: r.recipe_number, serial: r.source_ingredient_serial, name: r.source_name}));
assert.deepEqual(review.coverage.remainingInstances, remaining);
assert.equal(review.coverage.candidateLinks, baseline.R36_to_R40_total_source_reference_links + review.rawRows.length);
assert.equal(data.records.filter(row => row.legalArticleDecision === 'OPEN').length, 137);

for (const ingredient of ['hribera', 'chandana', 'ushira', '', null, 'constructor']) {
  for (const form of ['named', 'other', 'extract', 'unknown', '', null]) {
    assert.equal(Boolean(helper.scopeMarkup(ingredient, form)), ingredient === 'hribera' && form === 'named');
  }
}
for (const supply of ['', 'industrial', 'unknown', 'constructor', null]) {
  assert(!helper.sourceMarkup(review, supply).includes('juniper-raw-entry'));
}
assert.match(helper.sourceMarkup(review, 'industrial'), /industrial processing/);
assert.equal((helper.sourceMarkup(review, 'culinary').match(/juniper-raw-entry/g) || []).length, 4);
for (const [id, moisture] of [['wholeNatural', 22], ['wholeDehydrated', 16], ['cut', 16], ['ground', 14]]) {
  const html = helper.styleMarkup(review, id);
  assert(html.includes('Maximum ' + moisture + ' % w/w'));
  assert(html.includes('Minimum 0.5 mL/100 g · dry basis'));
  assert(html.includes('Maximum 0 count/100 g'));
  assert(html.includes('#page=7'));
}
assert.match(helper.styleMarkup(review, 'cut'), /Blank in the source table/);
assert.equal((helper.styleMarkup(review, 'ground').match(/N\/A · no evaluated value/g) || []).length, 7);
assert(!helper.styleMarkup(review, 'cut').includes('Broken among whole berries'));
for (const invalid of ['', 'fresh', '__proto__', null, {}]) assert.equal(helper.styleMarkup(review, invalid), '');

const mutations = [
  s => { s.coverage.withCandidate = 32; }, s => { s.coverage.candidateLinks = 97; },
  s => { s.coverage.remainingInstances[1] = s.coverage.remainingInstances[0]; },
  s => { s.scope.actualApplicability = 'CLOSED'; }, s => { s.scope.batchRelease = true; },
  s => { s.scope.concentrationMultiplierEstablished = true; }, s => { s.scope.pesticideDefaultAssigned = true; },
  s => { s.rawRows[0].basis = ''; }, s => { s.rawRows[1].basis = 'On dry matter basis.'; },
  s => { s.rawRows[2].unit = 'mg/kg'; }, s => { s.rawRows[3].maximum = 30; },
  s => { s.rawRows[0] = null; }, s => { s.rawRows.splice(2, 1); },
  s => { s.styleOptions[0].moistureMax = 16; }, s => { s.chemistry.dryBasis[2].bound = 'Maximum'; },
  s => { s.physical[5].whole = 0; }, s => { s.physical[6].ground = null; },
  s => { s.otherFactors.cut = 'NOT_EVALUATED'; }, s => { s.sources.codex.url = 'https://example.org/'; },
  s => { delete s.tableNotes; }, s => { delete s.scope.domesticDraft; },
  s => { s.recipeProductId = 'purified-vending-water'; }
];
for (const mutate of mutations) {
  const copy = structuredClone(data);
  mutate(copy.juniperSpiceReview);
  assert.equal(validateReview(copy, catalogue).ok, false);
}
console.log('R79 PASS: 4 Gazette references, 4 Codex styles, 13 remaining ingredient instances, scope resets and ' + mutations.length + ' altered-evidence checks.');
