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
const uses=ctx.PMSVAdditivesSolvents;
const cocoa=plan.routeIds.cocoa,egg=ctx.PMSVVeterinary.eggPowderId,blend=ctx.PMSVCoffee.blend;
const [head,...data]=uses.exportRows();
assert.equal(new Set(data.map(r=>r[0])).size,4);
assert.equal(data.length,rev.additiveSolventReview.referenceRows);
assert(data.every(r=>r.length===head.length&&r[10].includes('#page=')));
const cocoaRows=uses.rows(cocoa);
assert.equal(cocoaRows.length,14);
const exclusions=cocoaRows.filter(r=>r.status==='Excluded by note XS141');
assert.equal(exclusions.length,3);
assert(exclusions.every(r=>!r.limit&&!r.unit&&r.source.includes('#page=348')));
assert.equal(cocoaRows.find(r=>r.parameter==='Benzoates').limit,'1500');
const esters=cocoaRows.find(r=>r.parameter.includes('INS 473'));
assert(!esters.limit&&!esters.unit&&esters.notes.includes('10 g/kg')&&esters.notes.includes('10 mg/kg'));
assert(esters.source.includes('#page=92')&&esters.source.includes('#page=266'));
assert.equal(cocoaRows.find(r=>r.parameter.includes('L-tartaric')).unit,'g/kg');
assert.equal(uses.rows(egg).filter(r=>r.notes.includes('dry egg yolk')).length,2);
for(const id of ['coffee',blend]){
  assert.equal(uses.rows(id).length,2);assert.equal(uses.rows(id,{coffeeForm:'regular_roasted_ground'}).length,0);
  const decaf=plan.entries(id,undefined,{coffeeForm:'decaffeinated_roasted_ground'}).filter(r=>r.article.startsWith('Appendix C, Table 6'));
  assert.deepEqual(Array.from(decaf,r=>r.limit),['10','2']);
  assert(decaf.every(r=>r.role===(id===blend?'Incoming ingredient':'Finished product')));
  assert(!plan.entries(id,undefined,{coffeeForm:'roasted_ground'}).some(r=>r.article.startsWith('Appendix C, Table 6')));
}
for(const date of ['2026-11-26','2026-12-01']){
  const all=plan.openProductRows(null,date).slice(1);
  assert.equal(all.length,113);
  assert.equal(all.filter(r=>r[4]==='Residual CTR article').length,41);
  assert(!all.some(r=>r[0]==='purified-vending-water'&&r[8]==='ppm'));
  assert(!all.some(r=>r[0]===plan.routeIds.enzyme&&r[4]==='Residual CTR article'));
  assert.deepEqual(Array.from(all.filter(r=>r[0]===blend&&r[5].startsWith('Appendix C, Table 6')),r=>r[3]),['Incoming ingredient','Incoming ingredient']);
}
assert.equal(rev.firstSourceReview.withRoute,521);
