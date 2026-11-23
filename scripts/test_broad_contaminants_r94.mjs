import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);globalThis.window=globalThis;
for(const f of ['catalogue-source-evidence','catalogue-rule-data','review-status-data','catalogue-metal-scope-data','catalogue-metal-scope','broad-contaminants','full-catalogue-533','catalogue-crop-scope-data','catalogue-crop-scope','catalogue-metal-panel-data','catalogue-metal-panel','catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-lot-dates','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-variant-composition','catalogue-testing-source-rows','catalogue-vending-water','catalogue-testing-plan','catalogue-worksheets'])require('../fssai-helper/'+f+'.js');
const B=PMSVBroadContaminants,ids=Object.keys(PMSVCatalogueEvidence.products), as=(id,kind,ref)=>B.scope(id,kind,ref);
assert.equal(ids.length,533);assert(PMSVCatalogueWorksheets.available);assert.equal(B.scope('unknown'),null);
for(const id of ids){
 const x=as(id);assert(x.h.why&&x.m.why&&x.methyl.startsWith('0.25 ppm'));
 assert.equal(B.values(id).length,B.columns().length);assert(B.markup(id,{}).includes('Original unit heading'));
 if(!x.h.level)assert(x.h.key!=='named');
 if(!x.applied)assert(!as(id,x.m.options[0],'   ').applied);
 assert(B.brief(id,{}).at(-1).includes('#page=28'));
}
const infant='13-13-1-infant-formula',milk='13-13-1-infant-milk-food',follow='13-13-1-follow-up-formula';
assert(!as(infant,'liquid','').applied);assert.equal(as(infant,'liquid','pack').result,'0.15 mg/kg');
assert.equal(as(infant,'powder','spec').result,'1.0 mg/kg');assert(!as(infant,'other','wrong category').applied);
assert.equal(as(milk,'liquid','previous entry').result,'1.0 mg/kg');assert.equal(as(follow).applied,'');
assert.equal(as('formulated-supplements-children').result,'2.5 mg/kg');
assert.equal(as('99-99-1-gelling-agent-or-thickener-or-stabilizer-carrageenan').h.level,'1.0 ppm');
assert.equal(as('purified-vending-water').h.level,'');assert.equal(as('packaged-drinking-water').h.level,'0.001 mg/L');
assert.equal(as('12-12-1-salt-substitutes').h.level,'');assert.equal(as('12-12-1-edible-common-salt').h.level,'0.1 ppm');
assert.equal(as('09-09-2-frozen-finfish').h.level,'');assert.equal(as('09-09-2-frozen-shrimp').h.level,'0.5 ppm');
assert.equal(as('09-09-3-fish-pickles').h.level,'');assert.equal(PMSVCatalogueWorksheets.registerRows().length,534);
console.log('Three contaminant decisions across 533 products; the infant-formula, ingredient, mercury species, units and food-grade article boundaries passed.');
