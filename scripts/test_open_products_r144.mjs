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
assert(ws.available);
const ids=Array.from(ws.pendingSourceRows().slice(1),row=>row[0]);
for(const date of ['2026-11-26','2026-12-01']){
  const [header,...all]=plan.openProductRows(null,date);
  assert.equal(new Set(all.map(r=>r[0])).size,10);
  assert(all.every(r=>r.length===header.length&&r[2]===date&&r[11].startsWith('https://')));
  for(const id of ids){
    const group=all.filter(r=>r[0]===id);
    assert.equal(group.filter(r=>r[4]==='Product-specific CTR source pending').length,1);
    assert.deepEqual(Array.from(plan.openProductRows(id,date).slice(1)),group);
    for(const row of group.filter(r=>r[4]==='Residual CTR article'||r[4]==='All-food CTR article')){
      const check=plan.entries(id,date).find(r=>r.parameter===row[6]&&r.area==='Metals');
      assert(check.limit.startsWith(row[7]+' ppm'));
    }
  }
  const water=all.filter(r=>r[3]==='Finished vending outlet');
  assert.equal(water.length,rev.openProductReview.waterToxicLimits);
  assert(water.every(r=>r[8]==='mg/L'&&r[5].includes('Table 3')));
  assert(!all.some(r=>r[0]==='purified-vending-water'&&r[8]==='ppm'));
  const id='06-06-2-arrowroot';
  const intake=all.filter(r=>r[0]===id&&r[3]==='Incoming ingredient'&&r[5]==='CTR 2.1.1(2)');
  assert.deepEqual(Array.from(intake,r=>r[6]),['Lead','Cadmium']);
  assert(intake.every(r=>r[7]==='0.1'&&r[8]==='mg/kg'&&r[9].includes('raw Maranta')&&r[11].includes('CXA_004e')));
  assert(!all.some(r=>r[0]===id&&r[3]!=='Incoming ingredient'&&r[7]==='0.1'));
  assert.equal(plan.openProductRows('coffee',date).length,1);
}
assert.equal(plan.openProductRows(null,'2010-01-01').length,1);
assert.equal(rev.firstSourceReview.withRoute,523);
const enzyme=plan.routeIds.enzyme;
const alternate=plan.openProductRows(enzyme).slice(1).filter(r=>r[3]==='Separate product or use');
assert.equal(alternate.length,3);
assert.equal(alternate.find(r=>r[6]==='Arsenic')[7],'3.0');
assert.equal(alternate.filter(r=>r[7]==='GMP').length,2);
for(const r of plan.entries(enzyme).filter(r=>r.status==='Separate classification example')){
  assert.equal(r.limit,'');
  assert.equal(r.unit,'');
}
