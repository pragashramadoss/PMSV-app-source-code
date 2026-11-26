import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});
ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const plan=ctx.PMSVTestingPlan,ws=ctx.PMSVCatalogueWorksheets,rev=ctx.PMSV_REVIEW_REGISTER;
const {scope,descriptions}=plan.incomingSamples;
assert(ws.available);
const queue=ws.pendingSourceRows();
assert.deepEqual([...scope.keys()].sort(),Array.from(queue.slice(1),r=>r[0]).sort());
assert(queue.slice(1).every(r=>r.length===queue[0].length && r.at(-1)===scope.get(r[0])[1]));
assert.equal(descriptions.size,rev.openProductReview.productPlans);
const milk='04-04-1-coconut-milk-non-dairy',powder='04-04-1-coconut-milk-powder';
for(const date of ['2026-11-25','2026-12-01']){
  const refs=plan.incomingExport(null,date).slice(1);
  assert.equal(refs.length,rev.carobReview.incomingReferences);
  assert.equal(refs.filter(r=>r[7]&&r[8]).length,22);
  assert(refs.filter(r=>!r[7]).every(r=>!r[8]&&r[14].includes('#page=51')));
  assert(!refs.some(r=>r[0]===powder&&r[5]==='Fenpyroximate'));
  assert(refs.some(r=>r[0]===milk&&r[5]==='Fenpyroximate'&&r[7]==='0.02'&&r[8]==='mg/kg'));
  assert(refs.some(r=>r[5]==='Ochratoxin A'&&r[7]==='5'&&r[8]==='µg/kg'));
  for(const id of descriptions.keys()){
    const full=plan.exportRows(id,date);
    for(const r of refs.filter(r=>r[0]===id)){
      const matching=full.filter(f=>f[4]===r[4]&&f[5]===r[5]);
      assert.equal(matching.length,1);
      assert.deepEqual(Array.from(matching[0].slice(6,9)),Array.from(r.slice(6,9)));
    }
  }
}
assert.equal(plan.incomingExport(null,'2020-01-01').length,1);
assert.equal(rev.firstSourceReview.withRoute,523);
assert.equal(rev.legalProductApprovals,0);
