import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVAyurvedaPlan:A,PMSVTestingPlan:P,PMSVCatalogueWorksheets:W,PMSV_REVIEW_REGISTER:register}=ctx;
assert(W.available);
const review=register.ayurvedaPlanReview, ids=Object.keys(review.recipePages), [header,...criteria]=A.criteriaRows();
assert.equal(ids.length,10);assert.equal(criteria.length,100);assert.equal(header.length,10);
assert.equal(register.firstSourceReview.pending,12);
const queue=W.pendingSourceRows().slice(1).filter(r=>A.known(r[0]));
assert.equal(queue.length,0);
const base={ayRecipe:'Signed recipe R',ayVariant:'Variant resolved V',ayIngredient:'present',ayIngredientRef:'Verified ingredient formula',
 aySample:'Lot 1',ayReport:'Certificate A',ayBasis:'yes'};
const expected={'Lead':'2.5','Copper':'30','Arsenic':'1.1','Tin':'250','Cadmium':'1.5','Mercury':'1',
 'Methyl Mercury (calculated as element)':'0.25','Total Aflatoxins':'20','Aflatoxin B1':'10','Melamine':'2.5'};
for(const id of ids){
  assert.equal(A.criteriaRows(id).length,11);
  for(const date of ['2026-11-24','2026-12-01']){
    const rows=P.exportRows(id,date).filter(r=>r[2]===A.area);
    assert.equal(rows.length,10);
    for(const row of rows){
      const rule=review.rules.find(r=>r.name===row[5]);
      assert.equal(row[7],'');assert.equal(expected[rule.name],rule.max);
      assert(row[9].includes('Published maximum '+rule.max+' '+rule.unit));
      assert(row[14].includes('#page='+review.recipePages[id])&&row[14].includes('#page='+rule.page));
      const s={...base,ayAnalyte:rule.name,ayValue:rule.max,ayUnit:rule.unit.split(' ')[0]};
      const test=patch=>A.result(id,{...s,...patch});
      assert.equal(test({}),'At or below the maximum.');
      const above=rule.max+(rule.max.includes('.')?'00001':'.00001');
      assert.equal(test({ayValue:above}),'Above the maximum.');
      assert.match(test({ayValue:'<'+rule.max}),/within the maximum/);
      assert.match(test({ayValue:'<999'}),/Inconclusive/);
      assert.match(test({ayValue:'ND'}),/numerical upper bound/);
      assert.match(test({ayBasis:''}),/Confirm finished sample/);
      assert.match(test({ayRecipe:' '}),/Confirm finished recipe/);
      assert.match(test({aySample:''}),/Confirm finished sample/);
      const custom=P.exportRows(id,date,false,s).find(r=>r[2]===A.area&&r[5]===rule.name);
      assert.equal(custom[7],rule.max);assert(custom[9].includes('Certificate A'));
      if(review.variantHolds.includes(id))assert.match(test({ayVariant:''}),/Resolve/);
      if(rule.ingredientCondition){
        assert.match(test({ayIngredientRef:' '}),/Confirm a listed ingredient/);
        assert.match(test({ayIngredient:'absent'}),/excludes/);
        assert.equal(A.planRows(id,{...s,ayIngredient:'absent'}).find(r=>r.parameter===rule.name).limit,'');
        assert.match(test({ayUnit:'mg/L'}),/compatible/);
      }
    }
  }
}
const test=patch=>A.result(ids[0],{...base,ayAnalyte:'Lead',ayValue:'2500',ayUnit:'µg/L',...patch});
assert.equal(test({}),'At or below the maximum.');assert.equal(test({ayValue:'2500.00000001'}),'Above the maximum.');
assert.match(test({ayAnalyte:'Melamine'}),/compatible/);
assert(/compatible/.test(test({ayUnit:'ppm'})));
assert.equal(A.planRows('tea',base).length,0);assert.equal(A.criteriaRows('tea').length,1);
assert(!A.criteriaRows().flat().includes('Certificate A'));
console.log('Verified 100 Schedule D entries with separate recipe evidence, unit and ingredient checks and both dated exports.');
