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
for(const [date,count] of [['2026-11-26',235],['2026-12-01',313]]){
  const summary=ws.sourceSummaryRows(date).slice(1);
  assert.equal(summary.length,533);
  assert.equal(new Set(summary.map(r=>r[0])).size,533);
  assert(summary.every(r=>r.length===10&&r[2]===date&&r[3]&&r[4].startsWith('https://')&&r[7]));
  const water=summary.find(r=>r[0]===ctx.PMSVVendingWater.productId);
  assert.equal(water[5],date==='2026-11-26'?'CONDITIONAL_TOXIN_SOURCE_MATCH':'FIRST_EXACT_SOURCE_PENDING');
  assert(water[8].startsWith('https://'));
  if(date==='2026-12-01')assert(water[8].includes('272840.pdf#page=5')&&water[7].includes('mace or nutmeg kernel'));
  assert.equal(summary.filter(r=>r[5]==='FIRST_EXACT_SOURCE_PENDING').length,date==='2026-11-26'?9:10);
  const [head,...rows]=g.rows(null,date);
  assert.equal(rows.length,count);
  assert(rows.every(r=>r.length===head.length&&r[2]===date&&r[14]?.startsWith('https://')));
  assert.deepEqual(new Set(rows.map(r=>r[0])),new Set(ws.pendingSourceRows(date).slice(1).map(r=>r[0])));
  for(const id of plan.openScope(date).keys()){
    assert.deepEqual(Array.from(g.rows(id,date).slice(1)),rows.filter(r=>r[0]===id));
  }
  const guidance=rows.filter(r=>r[4]==='Laboratory recognition guidance');
  assert.equal(guidance.length,32);
  assert.equal(new Set(guidance.map(r=>r[3])).size,4);
  assert(guidance.every(r=>!r[7]&&!r[8]&&g.isRecognitionSource(r[14])));
  assert(!g.isRecognitionSource('https://example.com/#page=32'));
  const methods=rows.filter(r=>r[4]==='Analytical reference');
  assert.equal(methods.length,34);
  const controls=rows.filter(r=>r[4]==='Codex prevention guidance');
  assert.equal(controls.length,reg.preventionReferences);
  assert(controls.every(r=>r.slice(7,13).every(v=>v==='')&&g.isControlSource(r[14])));
  assert(!g.isControlSource(controls[0][14]+'&other=1'));
  for(const id of new Set(rows.map(r=>r[0]))){
    const exported=plan.exportRows(id,date).slice(1).filter(r=>r[2]===g.referenceArea);
    const refs=rows.filter(r=>r[0]===id&&['Analytical reference','Codex prevention guidance','Laboratory recognition guidance','Dry-basis calculation'].includes(r[4]));
    assert.equal(exported.length,refs.length);
    assert(exported.every(r=>r[7]===''&&r[8]===''&&refs.some(v=>v[3]===r[4]&&v[5]===r[5]&&v[6]===r[3]&&v[14]===r[14]&&r[9].includes(v[15]))));
  }
  for(const [form,included,excluded] of [['instant','04A.016','04A.010'],['decaffeinated_roasted_ground','04A.010','04A.014']]){
    const codes=g.referenceEntries('coffee-chicory-mixture',{coffeeForm:form}).map(r=>r.article.split(':')[0]);
    assert(codes.includes(included)&&!codes.includes(excluded));
  }
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

// Two composition checks share the published limits but use the laboratory's actual reporting basis.
const coconut='04-04-1-coconut-milk-powder',dairy=g.dairy;
const sample={dryLot:'Lot152',dryReport:'Report152',dryBasis:'asSold',dryValue:'58.8',dryMoisture:'2.0'};
assert.equal(g.dryBasis.size,reg.dryBasisChecks);
assert.match(g.basisResult(coconut,sample),/60% on dry basis .*at or above the 60% minimum/);
assert.match(g.basisResult(coconut,{...sample,dryValue:'58.799999'}),/below the 60% minimum/);
assert.match(g.basisResult(coconut,{...sample,dryBasis:'dry',dryValue:'60',dryMoisture:'3'}),/at or above the 60% minimum.*above the 2.5% maximum/);
assert.match(g.basisResult(coconut,{...sample,dryBasis:'dry',dryValue:'59',dryMoisture:''}),/below the 60% minimum.*Moisture was not entered/);
assert.match(g.basisResult(coconut,{...sample,dryValue:'99'}),/exceeds the dry solids/);
for(const value of ['100','-1','','1e2','<1','1.0000001'])assert.doesNotMatch(g.basisResult(coconut,{...sample,dryMoisture:value}),/on dry basis \(display/);
assert.match(g.basisResult(coconut,{...sample,dryReport:''}),/report reference/);
const ash={...sample,compVariant:'Colostrum Powder',dryValue:'8.64',dryMoisture:'4'};
assert.match(g.basisResult(dairy,ash),/9% on dry basis .*at or below the 9% maximum/);
assert.match(g.basisResult(dairy,{...ash,dryValue:'8.640001'}),/above the 9% maximum/);
assert.match(g.basisResult(dairy,{...ash,compVariant:'Colostrum'}),/Select Colostrum Powder/);
const powderRefs=g.referenceEntries(dairy,ash).filter(r=>r.status==='Analytical reference');
assert.equal(powderRefs.length,2);
assert(powderRefs.every(r=>r.form==='Cow colostrum powder'&&g.isIgGSource(r.source)));
assert(!g.isIgGSource(powderRefs[0].source+'other'));
assert(!g.referenceEntries(dairy,{compVariant:'Colostrum'}).some(r=>g.isIgGSource(r.source)||r.status==='Dry-basis calculation'));
const row=(id,state)=>plan.exportRows(id,'2026-11-26',false,state).find(r=>r[6]==='Dry-basis calculation');
assert.match(row(dairy,ash)[9],/Lot152.*Report152.*8.64%.*9% on dry basis/);
assert(!row(dairy)[9].includes('Lot152'));

for(const drySpecies of ['buffalo','mixed'])assert(!g.referenceEntries(dairy,{...ash,drySpecies}).some(r=>g.isIgGSource(r.source)));
