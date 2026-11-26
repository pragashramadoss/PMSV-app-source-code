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
const guide=ctx.PMSVStarchSpecifications,plan=ctx.PMSVTestingPlan;
const [arrow,maize,tapioca,palm,enzyme]=guide.ids;
assert.equal(guide.ids.length,ctx.PMSV_REVIEW_REGISTER.finishedSampleReview.starchAndEnzymeProducts);
assert(!guide.activeSource('https://law.resource.org/pub/in/bis/S06/is.1006.1984.pdf?unrelated'));
for(const date of ['2026-11-26','2026-12-01']){
  const [header,...all]=guide.exportRows(null,date);
  assert.equal(all.length,20);
  assert(all.every(r=>r.length===header.length&&r[2]===date&&r[11]&&r[12]));
  assert.deepEqual(Array.from(all.filter(r=>r[9]),r=>[r[0],r[9],r[10]]),[
    [arrow,'≤ 200','mg/kg'],[maize,'≤ 70','ppm'],[tapioca,'≤ 100','ppm'],[palm,'≤ 100','ppm']]);
  assert(all.find(r=>r[0]===arrow&&r[9]).at(-1).includes('#page=335'));
  assert(all.some(r=>r[0]===maize&&r[7]==='≤ 100'&&!r[9]&&r[11].includes('70 ppm')));
  const bis=all.filter(r=>r[4].startsWith('BIS'));
  assert.equal(bis.length,9);
  assert.deepEqual(Array.from(bis.filter(r=>r[3].includes('Individual')),r=>r[5]),['Moisture','Starch']);
  assert(bis.some(r=>r[3].startsWith('Curcuma')&&r[7]==='Figure 2'));
  assert(bis.every(r=>!r[9]&&!r[10]&&r[11].includes('specified for the lot')));
  const uses=all.filter(r=>r[0]===enzyme);
  assert.equal(uses.length,6);
  assert.equal(uses.filter(r=>r[7]==='GMP').length,5);
  assert(uses.every(r=>!r[9]&&!r[10]));
  assert(uses.some(r=>r[6].endsWith('1100(i)')&&r[7]==='≤ 100'&&r[8]==='mg/kg of flour'));
  for(const id of guide.ids){
    assert.deepEqual(Array.from(guide.exportRows(id,date).slice(1)),all.filter(r=>r[0]===id));
    const entries=plan.entries(id,date).filter(r=>r.area===guide.area);
    assert(entries.every(r=>r.limit||r.notes.includes('Published reference:')));
    assert.equal(entries.filter(r=>r.limit).length,id===arrow?1:0);
  }
  const open=plan.openProductRows(null,date).slice(1);
  assert.equal(open.filter(r=>r[3]==='Receiving food').length,6);
  assert.equal(open.filter(r=>r[3]==='Purchase specification').length,9);
  assert.equal(ctx.PMSVCatalogueWorksheets.pendingSourceRows(date).length,date==='2026-11-26'?10:11);
}
for(const id of ['06-06-2-sago-flour','coffee','invalid'])assert.equal(guide.exportRows(id).length,1);
assert.equal(guide.exportRows(null,'2010-01-01').length,1);
