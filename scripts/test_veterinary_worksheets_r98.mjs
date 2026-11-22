import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
global.window=global;
for (const file of ['full-catalogue-533','review-status-data','catalogue-source-evidence','catalogue-rule-data',
  'catalogue-metal-scope-data','catalogue-metal-scope','broad-contaminants','catalogue-crop-scope-data','catalogue-crop-scope',
  'catalogue-metal-panel-data','catalogue-metal-panel','catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-lot-dates','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-variant-composition','catalogue-testing-source-rows','catalogue-testing-plan','catalogue-worksheets']) require('../fssai-helper/'+file+'.js');
const V=PMSVVeterinary,W=PMSVCatalogueWorksheets,r=PMSV_REVIEW_REGISTER.veterinaryReview;
const old=JSON.parse(readFileSync(new URL('../fssai-helper/ctr-residue-gazette-concordance-r71-2026-11-14.json',import.meta.url)));
for(const group of r.groups) {
  const source=old.veterinaryGroups.find(g=>g.serial===group.serial);
  assert.equal(group.printed,source.originalName);
  assert.equal(group.rows.length,source.rows.length);
  for(const row of group.rows) {
    const a=source.rows.find(v=>v.coreIndex===row.index);
    assert.deepEqual([row.article,row.limit,row.unit,row.page,row.locked,row.override],
      [a.coreArticle,a.sourceLimit,a.sourceUnit,a.sourcePdfPage,a.lockedSourceAlignment,a.originalDrugOverride]);
  }
}
assert.deepEqual([r.groups.length,r.toleranceRows,r.seafood.length,r.prohibited.length,r.honey.length],[49,358,4,14,12]);
assert.equal(r.groups.flatMap(g=>g.rows).filter(a=>a.locked).length,2);
assert.equal(r.honey.filter(h=>h.condition).length,2);
const summary=V.stats(PMSV_REVIEW_REGISTER.records.map(x=>x.id));
assert.deepEqual(summary.scopeCounts,r.scopeCounts);
assert.equal(summary.directProducts,r.directProducts);assert.equal(summary.priorityDirect,r.priorityDirect);
assert.equal(Object.values(summary.scopeCounts).reduce((n,v)=>n+v),533);
assert.equal(V.profile('made-up-article'),null);
const rows=W.registerRows();
assert(W.available);assert.equal(rows.length,534);assert.equal(rows[0].length,99+PMSVPesticides.columns.length+PMSVResiduePanel.columns.length+PMSVIngredientPercentage.columns.length+PMSVIngredientOrder.columns.length+PMSVSmallPack.columns.length+PMSVBatchSite.columns.length+PMSVDateMarking.columns.length+PMSVLotDates.columns.length+4);
assert.equal(new Set(rows[0]).size,rows[0].length);assert(rows.slice(1).every(row=>row.length===rows[0].length&&row[15]==='No'&&!row[97]&&!row[98]));
assert.deepEqual(rows,W.registerRows(true));
const milk='01-01-1-cow-milk', powder='01-01-5-milk-powders-and-cream-powder',chocolate='05-05-1-chocolate';
const honey='11-11-5-honey',finfish='09-09-2-frozen-finfish',shrimp='09-09-2-frozen-shrimp';
const current=(id,s)=>V.current(id,s);
const candidates=(id,s={})=>current(id,s).options;
const key=(id,drug,article,s={})=>candidates(id,s).find(r=>r.drug===drug&&r.article===article)?.key;
const compare=(id,k,value,unit,s={})=>current(id,{vetRow:k,vetValue:value,vetUnit:unit,vetBasis:'yes',vetSource:'Sample 98',
  vetReport:'COA 98',...s}).comparison;
assert.equal(candidates(chocolate).length,0);
assert(candidates(powder).every(r=>r.clause===2));assert.equal(candidates(powder).length,14);
const liquid=candidates(milk);
assert.equal(liquid.filter(r=>r.clause===4).length,36);
assert.deepEqual(liquid.filter(r=>r.unit==='mg/L').map(r=>r.drug),['Ceftiofur','Gentamicin','Spectinomycin']);
const milkRow=key(milk,'Ceftiofur','Cattle — Milk');
assert(compare(milk,milkRow,'0.1','mg/L').startsWith('At or below'));
assert(compare(milk,milkRow,'0.10000000000000001','mg/L').startsWith('Above'));
assert(compare(milk,milkRow,'0.1','mg/kg').startsWith('Confirm'));
for(const date of ['','2025-03-31','2026-02-30']) assert(compare(milk,milkRow,'0.1','mg/L',{vetDate:date}).includes('edition effective'));
assert(compare(milk,milkRow,'0.1','mg/L',{vetDate:'2026-11-30'}).startsWith('At or below'));
const meat='08-08-1-fresh-or-chilled-pork-or-pig-meat';
for(const n of [39,41]){
 const row=candidates(meat).find(r=>r.serial===n&&r.clause===4);
 assert(compare(meat,row.key,'0.09','mg/kg').includes('Sulfadimidine and sulfamethazine'));
}
for(const row of candidates(finfish).filter(r=>r.serial===1&&r.clause===4))
 assert(compare(finfish,row.key,'0.04','mg/kg').includes('broader animal-tissue'));
assert(compare(milk,milkRow,'<0.1','mg/L').startsWith('Use a non-negative'));
assert(compare(milk,milkRow,'0.1','mg/L',{vetSource:'   '}).startsWith('Confirm'));
assert(compare(milk,milkRow,'0.1','mg/L',{vetReport:''}).startsWith('Confirm'));
assert(compare(milk,milkRow,'0.1','mg/L',{vetBasis:''}).startsWith('Confirm'));
assert.equal(current(powder,{vetMatrix:'cow',vetRow:milkRow}).row,undefined);
assert.equal(current(chocolate,{vetMatrix:'cow',vetRow:milkRow}).row,undefined);
const ingredient={vetRole:'ingredient',vetMatrix:'cow'};
assert(compare(chocolate,milkRow,'0.1','mg/L',ingredient).startsWith('At or below'));
assert(V.values(chocolate,{...ingredient,vetRow:milkRow,vetSource:'Raw milk intake 98'}).at(-2).startsWith('Separately sampled ingredient'));
assert(!candidates('01-01-1-buffalo-milk').some(r=>r.article==='Cattle — Milk'));
assert(!candidates('08-08-1-fresh-or-chilled-beef').some(r=>r.article==='Cattle — Liver'));
assert(candidates('08-08-1-fresh-or-chilled-beef',{vetMatrix:'beef'}).some(r=>r.article==='Cattle — Liver'));
assert(!candidates('10-10-1-fresh-eggs').some(r=>r.article==='Chicken — Eggs'));
assert(candidates('10-10-1-fresh-eggs',{vetMatrix:'henEgg'}).some(r=>r.article==='Chicken — Eggs'));
assert.equal(candidates(honey).length,12);assert(candidates(honey).every(r=>r.unit==='µg/kg'));
assert(compare(honey,'honey-1','0.3','µg/kg').includes('At or below the selected honey misuse MRPL'));
assert(!candidates('100-100-royal-jelly').length);assert(!candidates('14-14-2-honey-wine-or-mead').length);
assert(compare(milk,'ban-2','0.000300001','mg/kg').startsWith('Above'));
assert(!candidates(finfish).some(r=>r.clause===2));
assert.equal(candidates(finfish,{vetOrigin:'farmed'}).filter(r=>r.clause===2).length,14);
assert(!candidates(finfish,{vetOrigin:'wild'}).some(r=>r.clause===2));
for(const id of [finfish,shrimp]) assert(compare(id,'sea-1','0.12','mg/kg').includes('Source interpretation required'));
assert(compare(finfish,key(finfish,'Oxytetracycline','Oxytetracycline — Fish'),'0.12','mg/kg').includes('Source interpretation required'));
assert(compare(shrimp,'sea-2','0.05','mg/kg').startsWith('At or below'));
assert(V.values(shrimp)[7].includes('1 December 2026'));assert(V.values(shrimp)[7].includes('#page=6'));
assert.equal(V.values(honey)[7],'');assert(!liquid.some(r=>r.locked));
assert(V.indexTable('g5').includes('Species heading unresolved'));assert(!V.indexTable('g5').includes('<button'));
assert.equal(V.indexTable('unknown'), '');
for(const {id} of PMSV_CATALOGUE) {
  const {b,options}=current(id);
  assert(options.every(r=>!r.locked));assert.equal(new Set(options.map(r=>r.key)).size,options.length);
  assert(V.profile(id).choices.includes(b.matrix));assert.equal(V.values(id).length,V.columns.length);
}
console.log('All four CTR 2.3.2 provisions, 533 product scopes, source units, honey conditions, seafood overlaps and ingredient samples verified.');
