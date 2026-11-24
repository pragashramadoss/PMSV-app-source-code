import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const base=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',base),'utf8');
for(const [,file] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(file,base),'utf8'),ctx);
}
const {PMSVPesticides:x,PMSVTestingPlan:plan,PMSV_REVIEW_REGISTER:register,PMSVResiduePanel:panel}=ctx;
const id=register.lactoseReview.productId,group=x.groupSource(id);
const specifications=[[1,'0.05',31],[2,'0.02',31],[3,'0.02',31],[11,'0.01',32],[16,'0.2',32],[18,'0.05',32]];
assert.equal(group.rows.length,specifications.length);
assert.equal(register.firstSourceReview.pending,20);
assert.equal(register.firstSourceReview.withRoute,513);
for(const [i,[serial,limit,page]] of specifications.entries()){
  const row=group.rows[i];
  assert.equal(row.serial,serial);assert.equal(row.limit,limit);assert.equal(row.page,page);
  assert.equal(row.article,'Milk and Milk products');
  const sample={pestRole:'product',pestMatrix:group.matrix,pestProcess:'physical',pestScopeRef:'Full supplier process L-23',
    pestSample:'Lactose lot 23',pestRow:row.key,pestUnit:'mg/kg',pestReport:'Lab 23',pestBasis:'yes',pestKind:'quantified',pestValue:limit};
  assert.equal(x.comparison(id,sample).kind,'within');
  assert.equal(x.comparison(id,{...sample,pestValue:limit+'00000000001'}).kind,'above');
  assert.equal(x.comparison(id,{...sample,pestKind:'less',pestValue:'0.9'}).kind,'inconclusive');
  for(const patch of [{pestProcess:'thermal'},{pestProcess:'unknown'},{pestProcess:'raw'},{pestScopeRef:' '},{pestSample:''},{pestBasis:''},
    {pestUnit:'mg/L'},{pestMatrix:'milk'},{pestRole:'ingredient'},{pestReport:''}]){
    assert.equal(x.comparison(id,{...sample,...patch}).kind,'hold');
  }
  assert.equal(x.comparison('100-100-cow-or-buffalo-colostrum-and-colostrum-products',sample).kind,'hold');
  panel.save(id,sample,'gazette');
}
assert.equal(panel.exportRows(id).length,7);
assert.match(group.rows[1].reportBasis,/acephate and methamidophos/);
for(const date of ['2026-11-23','2026-12-01']){
  const full=plan.exportRows(null,date),product=plan.exportRows(id,date);
  const eligible=r=>r[0]===id&&r[4].startsWith(group.label+' · ')&&r[6]==='Conditional group entry · confirm marketed form and process';
  const rows=product.filter(eligible);
  assert.equal(rows.length,6);assert.deepEqual(rows,full.filter(eligible));
  for(const r of rows){
    assert(r[14].includes(group.identity)&&r[14].includes(group.classification)&&r[14].includes(group.urls[1]));
    assert(r[9].includes('spray drying'));
  }
  assert(full.every(r=>!r.includes('Lab 23')));
}
assert.equal(ctx.PMSVCatalogueWorksheets.registerRows().filter(r=>r.at(-2)===x.groupStatus).length,4);
console.log('R123 verifies six edible lactose pesticide rows, sample and process restrictions, saved results and both plan editions.');
