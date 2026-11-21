import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
global.window=global;
for(const name of ['full-catalogue-533','review-status-data','catalogue-source-evidence','catalogue-rule-data','catalogue-metal-scope-data',
  'catalogue-metal-scope','broad-contaminants','catalogue-crop-scope-data','catalogue-crop-scope','catalogue-metal-panel-data','catalogue-metal-panel',
  'catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-ingredient-percentage','catalogue-worksheets']) require('../fssai-helper/'+name+'.js');
const X=PMSVPesticides, W=PMSVCatalogueWorksheets, r=PMSV_REVIEW_REGISTER.pesticideReview;
const concordance=JSON.parse(readFileSync(new URL('../fssai-helper/ctr-residue-gazette-concordance-r71-2026-11-14.json',import.meta.url)));
const registry=W.registerRows(false);
assert(W.available);assert.equal(registry.length,534);assert.equal(registry[0].length,107+PMSVResiduePanel.columns.length+PMSVIngredientPercentage.columns.length);assert.equal(new Set(registry[0]).size,registry[0].length);
assert.deepEqual(registry,W.registerRows(true));assert(registry.slice(1).every(row=>row.length===registry[0].length&&row[15]==='No'&&row.slice(103,107).every(v=>v==='')));
const ids=PMSV_CATALOGUE.map(p=>p.id);
const stats=X.stats(PMSV_REVIEW_REGISTER.records.map(v=>v.id));
assert.equal(Object.values(r.scopeCounts).reduce((a,b)=>a+b,0),533);
for(const k of Object.keys(stats)) assert.deepEqual(stats[k],r[k]);
assert.deepEqual([stats.gazetteRows,r.groups.length,stats.directionRows,stats.mappedProducts],[1098,213,11,45]);
for(const g of r.groups) {
  const old=concordance.pesticideGroups.find(p=>p.serial===g.serial);
  assert.equal(g.printed,old.originalName);assert.equal(g.name,old.coreName);assert.equal(g.rows.length,old.rows.length);
  for(const [i,[article,limit,page,condition,subgroup,cell,printed]] of g.rows.entries()){
    const a=old.rows[i];assert.deepEqual([i,article,limit,page,condition,subgroup,cell||article,printed||limit],
      [a.coreIndex,a.sourceArticle,a.sourceLimit,a.sourcePdfPage,a.coreCondition,a.originalSubgroup,a.originalArticleCell,a.originalLimitCell]);
  }
}
for(const id of ids) {
  assert(X.profile(id));assert.equal(X.values(id).length,8);assert(W.briefLines(id).some(l=>l.includes('CTR 2.3.1')));
  assert.equal(X.current(id).row,undefined);
}
const chocolate='05-05-1-chocolate',candy='05-05-2-sugar-boiled-confectionery-hard-candy',wheat='06-06-1-wheat';
const entry={pestRole:'ingredient',pestMatrix:'cane',pestProcess:'raw',pestSample:'Cane lot 123',pestReport:'LCMS report A1',
  pestRow:'1-0',pestUnit:'mg/kg',pestKind:'quantified',pestValue:'0.05',pestBasis:'yes'};
const comp=(diff={},id=chocolate)=>X.compare(id,{...entry,...diff});
assert.equal(X.current(candy,{pestRole:'product',pestMatrix:'cane',pestRow:'1-0'}).options.length,0);
assert.equal(comp({pestRole:'product'}),'');assert.equal(comp({pestRole:'unknown'}),'');
assert.equal(comp({pestMatrix:'cocoa'}),'');assert.equal(X.mapped('04-04-2-cocoa-beans'),false);
assert(comp().startsWith('At or below'));assert(comp({pestValue:'0.05000000000000001'}).startsWith('Above'));
assert(comp({pestValue:'0.0001',pestKind:'less'}).startsWith('Reported upper bound'));
assert(comp({pestValue:'0.06',pestKind:'less'}).startsWith('Inconclusive'));
assert(comp({pestValue:'ND'}).includes('decimal'));assert(comp({pestKind:'less',pestValue:'0'}).includes('positive'));
assert(comp({pestUnit:'mg/L'}).startsWith('Confirm'));assert(comp({pestBasis:''}).startsWith('Confirm'));
assert(comp({pestSample:'  '}).startsWith('Confirm'));assert(comp({pestReport:''}).startsWith('Confirm'));
for(const bad of ['unknown','thermal','tea','']) assert(comp({pestProcess:bad}).includes('eligible processing'));
assert(comp({pestProcess:'physical'}).startsWith('At or below'));
assert(comp({pestRow:'96-0',pestValue:'0.03',pestLoq:''}).includes('method LOQ'));
assert(comp({pestRow:'96-0',pestValue:'0.03',pestLoq:'0.031'}).includes('method LOQ'));
assert(comp({pestRow:'96-0',pestValue:'0.03',pestLoq:'0.03'}).startsWith('At or below'));
assert(comp({pestRow:'96-0',pestValue:'0.02',pestLoq:'0.03'}).includes('below the stated method LOQ'));
function select(matrix,serial,find=()=>true,id=chocolate){
  const row=X.current(id,{pestRole:'ingredient',pestMatrix:matrix}).options.find(r=>r.serial===serial&&find(r));
  assert(row,matrix+' '+serial);return {pestMatrix:matrix,pestRow:row.key};
}
for(const [matrix,serial] of [['maize',22],['rice',23]]) {
  const matches=X.current(chocolate,{pestRole:'ingredient',pestMatrix:matrix}).options.filter(r=>r.serial===serial);
  assert(matches.length>=2);for(const row of matches) assert(comp({pestMatrix:matrix,pestRow:row.key}).includes('two entries'));
}
assert(comp(select('wheat',64)).includes('subgroup'));assert(comp(select('eggs',1)).includes('shell-free'));
assert(comp({...select('eggs',1),pestPortion:'shell-free'}).startsWith('At or below'));
assert(comp(select('meat',144)).includes('carcass fat'));assert(comp(select('milk',144)).includes('fat basis'));
assert(comp(select('tomato',46)).includes('different Gazette'));assert(X.indexPage('copper').includes('see copper'));
assert(X.indexPage('64').includes('Next results'));assert(X.indexPage('64',1).includes('Previous results'));
assert(X.indexPage('rice carbendazim').includes('source interpretation'));assert(X.indexPage('qzzq').includes('No matching entry'));
assert(X.indexPage('tea emamectin').includes('later tea direction'));assert(!X.indexPage('<img').includes('<img'));
assert(X.markup('12-12-2-cinnamon-dalchini',{}).includes('Codex'));assert(X.markup(wheat,{}).includes('Pesticide residues'));
assert(X.current('tea',{pestMatrix:'tea'}).options.every(row=>row.source!=='gazette'));
assert(comp({pestRole:'product',pestMatrix:'tea',pestRow:'tea2024-3',pestProcess:'tea',pestValue:'0.02'},'tea').startsWith('Above'));
assert(comp({pestRole:'product',pestMatrix:'tea',pestRow:'tea2023-68',pestProcess:'tea',pestValue:'0.06'},'tea').startsWith('At or below'));
assert(comp({pestRole:'product',pestMatrix:'tea',pestRow:'tea2023-68',pestProcess:'raw'},'tea').includes('eligible processing'));
assert(comp(select('greenTea',82)).includes('Green-tea'));assert(!X.mapped('instant-tea-solid'));
const exported=X.values(chocolate,entry);
assert(exported[4].includes('Separately sampled ingredient')&&exported[4].includes('Cane lot 123'));
assert(exported[5].includes('#page=31'));assert(exported[6].includes('LCMS report A1'));assert(exported[7].includes('Sugarcane'));
console.log('Checked all 1,098 Gazette records, 11 tea direction entries, 533 worksheets, reported thresholds, process/role separation, source holds and dated tea status.');
