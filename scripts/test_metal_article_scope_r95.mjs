import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
globalThis.window=globalThis;
for (const f of ['catalogue-source-evidence','catalogue-rule-data','catalogue-metal-scope-data','catalogue-metal-scope','broad-contaminants','full-catalogue-533','review-status-data','catalogue-crop-scope-data','catalogue-recipe-samples','catalogue-crop-scope','catalogue-metal-panel-data','catalogue-metal-panel','catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-lot-dates','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-variant-composition','catalogue-testing-source-rows','catalogue-vending-water','catalogue-ayurveda-plan','catalogue-cocoa-mixtures','catalogue-powder-standards','catalogue-coffee','catalogue-sulphites','catalogue-additives-solvents','catalogue-egg-microbiology','catalogue-testing-plan','catalogue-worksheets']) {
  require('../fssai-helper/'+f+'.js');
}
const D=PMSVMetalScopeData,M=PMSVMetalScope,B=PMSVBroadContaminants,W=PMSVCatalogueWorksheets;
const original=JSON.parse(fs.readFileSync(new URL('../fssai-helper/ctr-original-gazette-concordance-r70-2026-11-14.json',import.meta.url))).metalRows;
const statute=(r)=>[r.metal,r.originalArticle,r.originalLimit,r.sourcePdfPage];
const ids=PMSV_CATALOGUE.map(p=>p.id);
assert.deepEqual(new Set(ids),new Set(D.catalogue));assert.equal(D.catalogue.length,533);
for(const r of Object.values(D.rows))assert(original.some(o=>JSON.stringify(statute(o))===JSON.stringify(r)),JSON.stringify(r));
for(const [metal,group] of Object.entries(D.narrow)){
  assert.deepEqual(group.articles.map(k=>D.rows[k]),original.filter(r=>r.metal===metal).map(statute));
  const decisions=group.named.concat(group.check).flatMap(g=>g.ids);
  assert.equal(new Set(decisions).size,decisions.length);
  assert(decisions.every(id=>ids.includes(id)));
  for(const g of group.named.concat(group.check))assert(g.reason && g.rows.length && g.rows.every(k=>group.articles.includes(k)));
}
assert.equal(new Set(D.grade).size,31);
for(const id of D.grade){
  const p=PMSVCatalogueEvidence.products[id],anchor=PMSVCatalogueEvidence.standards[p.standard];
  assert.deepEqual(M.ingredientIdentity(id).extra,[PMSVCatalogueEvidence.documents[anchor.doc].url.split('#')[0],anchor.p[0]]);
  assert.equal(B.scope(id).result,'2.5 mg/kg');assert(B.markup(id,{}).includes('Food Safety and Standards Act'));
}
const stats={melamine:0,mercury:0,four:0,products:0,confectionery:0,priorityMelamine:0,priorityMercury:0,priorityFour:0};
for(const id of ids){
  const p=PMSVCatalogueEvidence.products[id],b=B.scope(id);
  if(b.applied){stats.melamine++;if(!p.directCTR)stats.priorityMelamine++;}
  if(b.h.level){stats.mercury++;if(!p.directCTR)stats.priorityMercury++;assert(!M.mercuryGuide(id));}
  else{
    const guide=M.mercuryGuide(id);assert(guide?.keys.length && guide.reason,id);
    assert(guide.keys.every(k=>D.rows[k][0]==='Mercury'));
  }
  let complete=true;
  for(const metal of Object.keys(D.narrow)){
    const outcome=M.narrow(id,metal);assert(['named','outside','check'].includes(outcome.kind));
    if(outcome.kind==='check')complete=false;else stats.four++;
    assert.equal(!outcome.keys.length,outcome.kind==='outside');
  }
  if(complete){stats.products++;if(!p.directCTR)stats.priorityFour++;}
  assert.equal(M.values(id).length,M.columns().length);
  if(id.startsWith('05-')){
    assert.deepEqual(new Set(Object.keys(M.confection(id))),new Set(D.metalOrder));stats.confectionery++;
  }else assert.equal(M.confection(id),null);
}
assert.deepEqual(stats,{melamine:515,mercury:430,four:1850,products:431,confectionery:11,priorityMelamine:127,priorityMercury:91,priorityFour:86});
assert.equal(Object.keys(D.ingredients).length,25);
assert.equal(M.narrow('unreviewed','Nickel'),null);
const hard='05-05-2-sugar-boiled-confectionery-hard-candy',soft='05-05-2-sugar-boiled-confectionery-soft-candy';
assert.equal(M.confection(hard).Lead.keys[0],'Pb82');assert.equal(M.confection(soft).Lead.keys[0],'Pb71');
assert.equal(M.confection('05-05-1-cocoa-powder').Copper.keys[0],'Cu7');
assert.equal(M.confection('05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake').Copper.keys[0],'Cu11');
assert.equal(M.confection('05-05-1-chocolate').Lead.keys[0],'Pb71');
assert.equal(M.confection(hard,{metalPack:'other',metalPackRef:'  '}).Tin.kind,'pack');
assert.equal(M.confection(hard,{metalPack:'other',metalPackRef:'wrapper spec'}).Tin.keys[0],'Sn17');
assert.deepEqual(M.confection(hard,{metalPack:'can',metalPackRef:'canned'}).Tin.keys,['Sn17','Sn4','Sn25']);
const mouth='05-05-2-spice-based-mouth-fresheners';
assert.equal(M.confection(mouth).Lead.kind,'check');
assert.equal(M.confection(mouth,{metalForm:'composite',metalFormRef:'formula'}).Lead.kind,'residual');
assert.equal(M.confection(mouth,{metalForm:'commodity',metalFormRef:'whole spice'}).Lead.kind,'check');
assert.equal(B.scope(mouth,'','',{metalForm:'composite',metalFormRef:'formula'}).h.level,'1.0 ppm');
const fish='09-09-2-frozen-finfish',b=(key,reference)=>B.scope(fish,'','',{mercuryArticle:key,mercuryArticleRef:reference}).h;
assert(!b('Hg10',' ').level);assert.equal(b('Hg10','swordfish').level,'1.0 ppm');assert(!b('Hg7','water').level);
assert.equal(b('Hg8','species').level,'0.5 ppm');
assert.equal(M.narrow(fish,'Chromium').keys[0],'Cr0');
assert.equal(M.narrow('99-99-1-gelatin-from-fish-processing-waste','Chromium').kind,'check');
assert.equal(M.narrow('11-11-6-calcium-saccharin-food-grade','Nickel').kind,'outside');
assert.equal(M.narrow('11-11-6-sorbitol','Nickel').keys[0],'Ni3');
assert.equal(M.valueText('Sb3'),'1.0 ppm');assert.equal(M.valueText('Se0'),'0.05 mg/L');
const tartaric='99-99-1-acidity-regulators-l-tartaric-acid';assert.equal(B.scope(tartaric).applied,'');assert.equal(M.ingredientRows(tartaric).Lead.kind,'options');
assert.equal(M.ingredientRows('99-99-1-gelling-agent-or-thickener-or-stabilizer-pectin').Lead.keys.length,3);
const ice=D.frozen[0];assert.equal(M.frozenRows(ice).Lead.kind,'check');
assert.equal(M.frozenRows(ice,{metalForm:'frozen',metalFormRef:'pack'}).Lead.kind,'named');
assert.equal(M.frozenRows(ice,{metalForm:'dry',metalFormRef:'spec'}).Lead.keys.length,0);
const csv=W.registerRows();
assert.equal(csv.length,534);assert.equal(csv[0].length,55+PMSVCropScope.columns().length+PMSVMetalPanel.columns().length+PMSVVeterinary.columns.length+PMSVPesticides.columns.length+PMSVResiduePanel.columns.length+PMSVIngredientPercentage.columns.length+PMSVIngredientOrder.columns.length+PMSVSmallPack.columns.length+PMSVBatchSite.columns.length+PMSVDateMarking.columns.length+PMSVLotDates.columns.length+6);
assert(csv.every(r=>r.length===csv[0].length));assert.deepEqual(csv,W.registerRows(true));
console.log('533 product identities, 22 complete short-table rows, 11 metals across category 05, 31 ingredient decisions and documented sample boundaries passed.');
