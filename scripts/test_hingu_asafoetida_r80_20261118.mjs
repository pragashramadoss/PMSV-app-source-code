import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { markup, rawMarkup } = require('../fssai-helper/hingu-asafoetida-r80.js');
const { validateReview } = require('../fssai-helper/review-status.js');
const read = name => fs.readFileSync(new URL('../fssai-helper/' + name, import.meta.url), 'utf8');
const context = {window:{}};
vm.createContext(context);
for (const file of ['full-catalogue-533.js', 'review-status-data.js']) vm.runInContext(read(file), context);
const data = JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue = context.window.PMSV_CATALOGUE;
const hingu = data.hinguReview;
const previous = data.juniperSpiceReview.coverage;
const current = hingu.coverage;

assert.equal(validateReview(data, catalogue).ok, true);
assert.deepEqual([hingu.round, hingu.reviewedOn], [80, '2026-11-18']);
assert.deepEqual([previous.withCandidate, previous.withoutCandidate, previous.candidateLinks], [33, 13, 98]);
assert.deepEqual([current.withCandidate, current.withoutCandidate, current.candidateLinks], [34, 12, 102]);
assert.equal(previous.remainingInstances.filter(row => row.recipe === '13.1' && row.serial === 5).length, 1);
assert.deepEqual(current.remainingInstances, previous.remainingInstances.filter(row => !(row.recipe === '13.1' && row.serial === 5)));
assert.equal(data.records.filter(row => row.legalArticleDecision === 'OPEN').length, 137);
for (const id of [hingu.productId, hingu.recipeProductId]) {
  const record = data.records.find(row => row.id === id);
  assert.deepEqual(record.reports[0], {round:80, file:hingu.report});
  assert(record.sourceReviewResult.includes(hingu.sourceReviewResult));
}

const r70 = JSON.parse(read('ctr-original-gazette-concordance-r70-2026-11-14.json'));
for (const [i,key] of hingu.gazetteRowKeys.entries()) {
  const row = key.metal ? r70.metalRows.find(r => r.metal === key.metal && r.coreIndex === key.coreIndex)
    : r70.cropRows.find(r => r.group === key.group && r.article === key.article);
  assert.equal(hingu.rawRows[i].maximum, row.coreLimit ?? row.originalLimit);
  assert.equal(hingu.rawRows[i].article, row.originalArticle ?? row.originalArticleCell);
  assert.equal(hingu.rawRows[i].pdfPage, row.sourcePdfPage);
}
for (const [key, hash] of Object.entries({
  manual:'f7fb97725d52e43503f474e6d9a66946fd51db717ae92ce58991eb8d5fd7bcb3',
  is7807:'9eab77c16a73c2dc3dff6af5437fd09244f87f28452eb1db10aedef67ab7d71f',
  bisProgramme:'0fef4a7a472bcc12ee1618967085ee3cd8869bf2174429697b3ba3c992c1bf80',
  chapter:'3f80e37f2c181b9dddf58c7ca4bc4b687ad834313b14de63dc2c4f1e7adcf71b',
  gazette:r70.sources.ctr2020.sha256
})) assert.equal(hingu.sources[key].sha256, hash);

const unverified = ['', undefined, null, 'root', 'oil', 'constructor', '__proto__', {}, []];
for (const grade of ['hing', 'hingra', 'compounded', ...unverified]) {
  const html = markup(hingu, grade);
  const named = ['hing', 'hingra', 'compounded'].includes(grade);
  assert.equal(Boolean(html), named);
  assert.equal((html.match(/data-hingu-method=/g) || []).length, named ? 6 : 0);
  assert.equal(html.includes('id="hinguRawConfirmed"'), ['hing', 'hingra'].includes(grade));
  for (const confirmed of [true, false, 1, 'true', null]) {
    const raw = rawMarkup(hingu, grade, confirmed);
    const allowed = ['hing', 'hingra'].includes(grade) && confirmed === true;
    assert.equal((raw.match(/hingu-raw-entry/g) || []).length, allowed ? 4 : 0);
  }
}
assert.equal(rawMarkup(null, 'hing', true), '');
assert.match(markup(hingu, 'hing'), /nominal test portion is 2 g/);
assert.match(markup(hingu, 'compounded'), /nominal test portion is 10 g/);
assert.match(markup(hingu, 'compounded'), /no numeric starch maximum/);
assert.match(markup(hingu, 'hingra'), /100 − \(residue % \+ moisture %\)/);
assert.deepEqual(hingu.methods.filter(m => m.source === 'manual').map(m => m.code),
 ['FSSAI 10.006:2021','FSSAI 10.007:2021','FSSAI 10.010:2021','FSSAI 10.034:2021','FSSAI 10.035:2021']);

const mutations = [
  r => {r.hinguReview = null;}, r => {r.hinguReview.ingredient.serial = 4;},
  r => {r.hinguReview.rawGrades.push('compounded');}, r => {r.hinguReview.rawRows[1].article = 'Gum Arabic or Acacia gum';},
  r => {r.hinguReview.rawRows[0].basis = '';}, r => {r.hinguReview.rawRows[2].unit = 'mg/kg';},
  r => {r.hinguReview.rawRows.pop();}, r => {r.hinguReview.methods[2].pages = [25,26];},
  r => {r.hinguReview.methods[3].code = 'FSSAI 10.34:2021';}, r => {r.hinguReview.methods[0] = null;},
  r => {r.hinguReview.methods[5].code = 'FSSAI 10.032:2021';}, r => {r.hinguReview.extract.calculation = 'dry basis';},
  r => {r.hinguReview.extract.testPortionGrams.compounded = 2;}, r => {r.hinguReview.extract.uspEquivalenceEstablished = true;},
  r => {r.hinguReview.sources.is7807.addendum = null;}, r => {r.hinguReview.sources.bisProgramme.reaffirmed = '2003';},
  r => {r.hinguReview.sources.manual.url = 'https://example.com/';}, r => {r.hinguReview.boundaries.autoApplyLimits = true;},
  r => {r.hinguReview.boundaries.recipeSubstitutionApproved = true;}, r => {r.hinguReview.boundaries.batchRelease = true;},
  r => {r.hinguReview.coverage.remainingInstances[0] = {recipe:'13.1', serial:5, name:'Hingu'};},
  r => {r.hinguReview.coverage.withoutCandidate = 13;}, r => {r.hinguReview.coverage.candidateLinks = 106;},
  r => {r.records.find(row => row.id === hingu.productId).reports.shift();}
];
for (const mutate of mutations) {
  const copy = structuredClone(data);
  mutate(copy);
  assert.equal(validateReview(copy, catalogue).ok, false);
}
console.log('R80 PASS: four conditional spice references, five FSSAI methods and one IS method, three grades, 34 of 46 ingredient instances, and ' + mutations.length + ' corrupted-evidence cases.');
