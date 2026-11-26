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
const g=ctx.PMSVLabGuide,reg=ctx.PMSV_REVIEW_REGISTER.finishedSampleReview;
const plan=ctx.PMSVTestingPlan,ws=ctx.PMSVCatalogueWorksheets;
assert(ws.available);
assert.equal(g.profiles.size,reg.productProfiles);
assert.equal(Array.from(g.profiles.values()).flatMap(p=>p.methods).length,reg.methodReferences);
for(const [date,count] of [['2026-11-26',150],['2026-12-01',227]]){
  const summary=ws.sourceSummaryRows(date).slice(1);
  assert.equal(summary.length,533);
  assert.equal(new Set(summary.map(r=>r[0])).size,533);
  assert(summary.every(r=>r.length===10&&r[2]===date&&r[3]&&r[4].startsWith('https://')&&r[7]));
  const water=summary.find(r=>r[0]===ctx.PMSVVendingWater.productId);
  assert.equal(water[5],date==='2026-11-26'?'CONDITIONAL_TOXIN_SOURCE_MATCH':'FIRST_EXACT_SOURCE_PENDING');
  assert.equal(!!water[8],date==='2026-11-26');
  assert.equal(summary.filter(r=>r[5]==='FIRST_EXACT_SOURCE_PENDING').length,date==='2026-11-26'?9:10);
  const [head,...rows]=g.rows(null,date);
  assert.equal(rows.length,count);
  assert(rows.every(r=>r.length===head.length&&r[2]===date&&r[14]?.startsWith('https://')));
  assert.deepEqual(new Set(rows.map(r=>r[0])),new Set(ws.pendingSourceRows(date).slice(1).map(r=>r[0])));
  for(const id of plan.openScope(date).keys()){
    assert.deepEqual(Array.from(g.rows(id,date).slice(1)),rows.filter(r=>r[0]===id));
  }
  const methods=rows.filter(r=>r[4]==='Analytical reference');
  assert.equal(methods.length,19);
  assert(methods.every(r=>r[7]===''&&r[8]===''&&r[15]));
  assert(methods.filter(r=>r[6].startsWith('01.')).every(r=>r[3]==='Liquid colostrum'));
  assert(rows.some(r=>r[4]==='Microbiological sampling plan'&&String(r[10])==='0'));
  assert(!rows.some(r=>r[4]==='Product criterion'&&/succinic|beta-hydroxybutyric|lactic acid/i.test(r[5])));
  const h=rows.find(r=>r[5]==='Furosine'&&r[4]==='Product criterion');
  assert(h&&!h[7]);
  assert(!rows.some(r=>r[0]===plan.routeIds.enzyme&&r[7]));
}
assert.equal(g.rows(null,'2010-01-01').length,1);
assert.equal(g.rows('coffee').length,1);
const s={beanTotal:'100',beanSample:'C-150',beanMould:'4',beanSlaty:'8',beanInsect:'2',beanGermFlat:'4'};
assert.equal(g.countResults(s).length,reg.beanCountChecks);
assert(g.countResults(s).every(r=>r.status==='At or below maximum'));
assert.equal(g.countResults({...s,beanMould:'0'})[0].percent,'0');
assert.equal(g.countResults({...s,beanTotal:'999999999',beanMould:'40000000'})[0].status,'Above maximum');
assert.equal(g.countResults({...s,beanTotal:'7',beanSlaty:'8'})[1].percent,'');
for(const bad of ['', '-1','1.2','1e3','10000000000']){
  assert.equal(g.countResults({...s,beanMould:bad})[0].percent,'');
}
assert(g.countResults({...s,beanTotal:'0'}).every(r=>!r.percent));
assert.equal(g.countRows(s)[1][0],'C-150');
