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
const egg=ctx.PMSVVeterinary.eggPowderId, enzyme=plan.routeIds.enzyme;
const meta=rev.sampleScopeReview;
assert.equal(meta.eggRows,29);
assert.equal(meta.enzymeRows,6);
for(const date of ['2026-11-26','2026-12-01']){
  const focused=plan.scopeReferenceExport(null,date);
  assert.equal(focused.length-1,meta.referenceRows);
  assert(focused.slice(1).every(r=>r.length===focused[0].length&&r[2]===date&&r[10].split(' | ').every(u=>/^https:\/\/.+#page=\d+$/.test(u))));
  const eggRows=plan.scopedReferences(egg,date);
  assert.equal(eggRows.length,29);
  assert.equal(eggRows.filter(r=>r.unit==='µg/kg').length,15);
  assert.equal(eggRows.filter(r=>r.unit==='mg/kg').length,10);
  assert(eggRows.filter(r=>!r.unit).every(r=>r.value==='0.05'&&r.notes.includes('omits the unit')));
  assert(eggRows.find(r=>r.parameter==='Colistin').notes.includes('0.001 mg/kg'));
  assert.equal(plan.scopedReferences(enzyme,date).filter(r=>r.notes.includes('from microbial sources')).length,2);
  for(const id of [egg,enzyme]){
    const ref=plan.entries(id,date).filter(r=>r.area===plan.scopedArea);
    assert.equal(ref.length,plan.scopedReferences(id,date).length);
    assert(ref.every(r=>!r.limit&&!r.unit&&r.notes.includes('Published reference:')));
  }
  const open=plan.openProductRows(null,date).slice(1);
  assert.equal(open.length,date<'2026-12-01'?161:178);
  assert.equal(open.filter(r=>r[6]==='Melamine').length,date<'2026-12-01'?9:10);
  assert.equal(plan.scopeReferenceExport('coffee',date).length,1);
}
const contents=plan.entries('13-13-1-infant-formula');
assert.equal(contents.find(r=>r.parameter==='Melamine').limit,'');
for(const [broadForm,expected] of [['liquid','0.15'],['powder','1.0']]){
  const state={broadForm,broadRef:'Label and specification 147'};
  const row=plan.entries('13-13-1-infant-formula',undefined,state).find(r=>r.parameter==='Melamine');
  assert.equal(row.limit,expected);assert.equal(row.unit,'mg/kg');
  assert(row.notes.includes(state.broadRef));
  assert.equal(plan.entries('13-13-1-infant-formula',undefined,{broadForm,broadRef:' '}).find(r=>r.parameter==='Melamine').limit,'');
}
assert.equal(plan.entries(egg).find(r=>r.parameter==='Melamine').limit,'2.5');
assert.equal(plan.entries(enzyme).find(r=>r.parameter==='Melamine').limit,'');
const total=Object.keys(ctx.PMSVCatalogueRules.products).filter(id=>ctx.PMSVBroadContaminants.melamineRow(id)).length;
assert.equal(total,meta.melaminePlans);
assert.equal(plan.scopeReferenceExport(null,'2010-01-01').length,1);
assert(!plan.entries(egg,'2010-01-01').some(r=>r.parameter==='Melamine'||r.area===plan.scopedArea));
