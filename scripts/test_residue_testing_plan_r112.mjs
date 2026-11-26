import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
const template=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of template.matchAll(/<script src="([a-z0-9-]+)\.js\?/g)){
  if(/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(name)){
    vm.runInContext(fs.readFileSync(new URL(name+'.js',dir),'utf8'),ctx);
  }
}
const plan=ctx.PMSVTestingPlan;
const [header,...rows]=plan.exportRows();
assert.equal(header.length,15);
assert.equal(rows.length,26232);
assert.equal(plan.areas.length,6);
const residueAreas=plan.areas.slice(4);
for(const [index,area] of residueAreas.entries()){
  const matches=rows.filter(row=>row[2]===area);
  assert.equal(matches.length,[3067,3736][index]);
  assert.equal(new Set(matches.map(r=>r[0])).size,533);
}
for(const {id} of ctx.PMSV_CATALOGUE){
  const product=plan.exportRows(id).slice(1);
  assert.equal(new Set(product.map(row=>row[2])).size,id===ctx.PMSVVendingWater.productId||ctx.PMSVAyurvedaPlan.known(id)||ctx.PMSVSulphites.profiles.has(id)||plan.scopedReferences(id).length?7:6);
  assert(product.every(row=>row[0]===id));
}
const vet=id=>ctx.PMSVVeterinary.planRows(id);
const pest=id=>ctx.PMSVPesticides.planRows(id);
const candy='05-05-2-sugar-boiled-confectionery-hard-candy';
assert(pest(candy).every(r=>!r.limit));assert(vet(candy).every(r=>!r.limit));
assert(pest(candy)[0].notes.includes('sugarcane'));
assert(vet('05-05-1-chocolate')[0].notes.includes('separately sampled milk'));
const tea=pest('tea');
const banned=tea.filter(r=>r.status.includes('Banned insecticide'));
assert.equal(banned.length,20);
for(const r of banned){assert.equal(r.limit,r.parameter==='DDT'?'0.05':'0.01');assert.equal(r.unit,'mg/kg');assert(r.source.includes('#page=3'));}
assert.equal(tea.filter(r=>r.status.startsWith('Additional notified')).length,6);
assert.equal(tea.filter(r=>r.status.startsWith('Tea MRL under')).length,5);
assert.equal(tea.filter(r=>r.parameter==='Fenpyroximate').length,1);
assert.equal(tea.find(r=>r.parameter==='Fenpyroximate').limit,'6.0');
assert(tea.some(r=>r.parameter==='Bifenthrin'&&r.limit==='30'));
assert(pest('green-tea').every(r=>!r.limit));
const wheat=pest('06-06-1-wheat'),flour=pest('06-06-2-wheat-flour-atta-and-resultant-wheat-flour-resultant-atta');
assert(wheat.some(r=>r.limit));assert(flour.some(r=>r.limit));assert(flour.filter(r=>r.limit).every(r=>r.form.toLowerCase().includes('wheat flour')));
assert(pest('12-12-2-turmeric-haldi').some(r=>r.parameter==='Pesticide-specific MRL selection'&&!r.limit));
const honey=vet('11-11-5-honey').filter(r=>r.status.includes('MRPL'));
assert.equal(honey.length,12);assert(honey.every(r=>r.unit==='µg/kg'));
assert.equal(honey.find(r=>r.parameter==='Chloramphenicol').limit,'0.3');
assert.equal(honey.filter(r=>r.notes.includes('individually or collectively')).length,2);
const milkPowder=vet('01-01-5-milk-powders-and-cream-powder');
assert.equal(milkPowder.filter(r=>r.status.includes('EMRL')).length,14);
assert(milkPowder.every(r=>!r.status.includes('tissue tolerance')));
assert(vet('01-01-1-cow-milk').some(r=>r.status==='Food and tissue tolerance'&&r.form.includes('Milk')));
const seafood=vet('09-09-2-frozen-shrimp');
assert(seafood.some(r=>r.status==='Change effective 1 December 2026'&&!r.limit&&r.source.includes('#page=6')));
assert(seafood.filter(r=>r.status.includes('EMRL')).every(r=>r.form.includes('farmed aquaculture only')));
assert(seafood.some(r=>r.status==='Resolve overlapping source entries'&&!r.limit&&r.notes.includes('Printed reference')));
assert(vet('08-08-1-fresh-or-chilled-pork-or-pig-meat').some(r=>r.form.includes('Pig — Liver')));
assert.equal(vet('not-in-catalogue').length,0);assert.equal(pest('not-in-catalogue').length,0);
console.log('Verified six areas for 533 products, numeric and held sources, processing and animal-origin boundaries, tea directions and honey misuse thresholds.');
