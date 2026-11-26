import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});ctx.window=ctx;
for(const [,file] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g))
  vm.runInContext(fs.readFileSync(new URL(file,dir),'utf8'),ctx);
const {PMSVCoffee:C,PMSVTestingPlan:P,PMSVCatalogueWorksheets:W,PMSVPesticides:X}=ctx;
assert(W.available);assert.equal(ctx.PMSV_REVIEW_REGISTER.coffeeReview.comparisons,45);
assert.equal(P.coffeeRows().length,59);
for(const id of C.ids)for(const form of C.profiles.get(id)){
  const state={coffeeForm:form.key,reference:'Lot 17',compReport:'Test 22',unitConfirmed:'yes'};
  const chosen=P.coffeeRows(id,'2026-11-24',state).slice(1).filter(r=>r[3]!=='CTR 2.3.1, entry 129'&&!r[3].includes('Schedule'));
  assert(chosen.length&&chosen.every(r=>r[4]===form.name));
  for(const {v:{spec},i} of W.enabledCriteria(id,state)){
    const result=String(spec.value??spec.min),entry={...state,criterion:i,result};
    assert.match(W.resultText(id,entry),/Within the cited/);
    const row=P.coffeeRows(id,'2026-11-24',entry).find(r=>r[5]===spec.parameter);
    assert(row[9].includes('Lot 17')&&row[9].includes('Test 22')&&row[9].includes('Within'));
    const outside=spec.operator==='>='?spec.value-0.01:(spec.max??spec.value)+0.01;
    assert.match(W.resultText(id,{...entry,result:outside.toFixed(2)}),/Outside/);
    for(const patch of [{reference:''},{compReport:''},{unitConfirmed:''},{result:'<1'},{criterion:'1'}])
      assert.doesNotMatch(W.resultText(id,{...entry,...patch}),/Within the cited/);
    if(id!== 'chicory')assert.equal(W.resultText(id,{...entry,coffeeForm:''}),'');
  }
}
const held=P.coffeeRows('coffee','2026-11-24',{coffeeForm:'decaffeinated_roasted_ground'}).find(r=>r[5]==='Water-soluble ash');
assert.equal(held[7],'');assert(held[9].includes('65%')&&held[14].includes('#page=6'));
const rows=P.coffeeRows(C.blend);
assert.equal(rows.filter(r=>r[5].startsWith('Coffee content')).length,4);
const caffeine=rows.filter(r=>r[5].startsWith('Caffeine')).map(r=>r[7]);assert.equal(caffeine.join(','),'≥ 0.6,≥ 1.4,≤ 0.1,≤ 0.3');
const state={coffeeForm:'instant',coffeePct:'70.25'};
assert.equal(C.ratio('70.25'),'COFFEE : CHICORY = 70.25 : 29.75');
for(const bad of ['','100','110','0','-1','NaN','80/20'])assert.equal(C.ratio(bad),'');
for(const [date,show] of [['2026-06-30',false],['2026-07-01',false],['2026-07-20',false],['2026-07-21',true],['2026-11-24',true]]){
  const r=C.labelRow(date,state);assert.equal(r.source.includes('Direction'),show);assert.equal(r.notes.includes('70.25 : 29.75'),show);
}
assert(C.labelRow('2026-11-24',{coffeePct:'80'}).notes.indexOf('80 : 20')<0);
const check=(id,form,role)=>X.current(id,{coffeeForm:form,pestRole:role,pestMatrix:'coffee'}).options.some(r=>r.serial===129);
assert(check('coffee','green','product'));assert(!check('coffee','roasted_ground','product'));
assert(!check(C.blend,'instant','product'));assert(check(C.blend,'instant','ingredient'));
assert(!P.coffeeRows('coffee','2026-11-24',{coffeeForm:'roasted_ground'}).some(r=>r[5]==='Monocrotophos'));
assert(rows.some(r=>r[5]==='Monocrotophos'&&r[6]==='Ingredient sample only'&&r[7]==='0.1'&&r[14].split(' | ').some(url=>url.endsWith('#page=44'))));
assert.equal(W.pendingSourceRows().length,12);assert(W.pendingSourceRows().some(r=>r[0]===C.blend));
console.log('Verified 45 quantitative criteria, 10 forms, dated front labels and raw-bean residue scope.');
