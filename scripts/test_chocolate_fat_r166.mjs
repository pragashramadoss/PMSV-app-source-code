import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
ctx.PMSVCulinarySauces=createRequire(import.meta.url)('../fssai-helper/culinary-sauces.js');
const f=ctx.PMSVFormulation,id=f.chocolate;
const batch={chocRecipe:'Private recipe 166',chocFinished:'100',chocDeduct:'20',chocFat:'4',chocSpec:'Spec 166',chocEligibility:'meets'};
const review=changes=>f.chocolateReview({...batch,...changes});
assert.match(review({}),/4 kg \/ 80 kg = 5%. At the 5% maximum.*confirmed all material criteria/);
assert.match(review({chocFat:'4.01'}),/5.0125%. Above/);
assert.match(review({chocFat:'4.00000000000000000001'}),/>5%. Above/);
assert.match(review({chocFat:'3.99999999999999999999'}),/<5%. Below/);
assert.match(review({chocDeduct:'0'}),/4%. Below/);
assert.match(review({chocFat:'0'}),/No added vegetable fat recorded/);
assert.match(review({chocSpec:' '}),/requires evidence/);
assert.match(review({chocEligibility:'fails'}),/Material fails/);
for(const changes of [{chocRecipe:''},{chocFinished:'0'},{chocFinished:'20'},{chocFat:'81'},{chocDeduct:''},{chocFat:'-1'},{chocDeduct:'10 kg'}]){
  assert.doesNotMatch(review(changes),/5% maximum/);
}
const rules=f.exportRows(id,batch);
assert.equal(rules.length,5);
assert.equal(rules.filter(r=>r[10].includes(batch.chocRecipe)).length,1);
assert(rules.some(r=>r[8].includes('CONTAINS COCOA BUTTER EQUIVALENT/VEGETABLE FAT')));
assert(!JSON.stringify(f.exportRows(null,batch)).includes(batch.chocRecipe));
for(const date of ['2026-11-27','2026-12-01']){
  const plan=ctx.PMSVTestingPlan.exportRows(id,date,false,batch);
  assert.equal(plan.filter(r=>r[2]===f.area).length,4);
  assert.equal(plan.filter(r=>r[9].includes(batch.chocRecipe)).length,1);
}
assert(!f.entries('05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake').some(r=>r.published==='5% maximum'));
console.log('Chocolate recipe boundaries, evidence, export scope and two dated plans verified.');
