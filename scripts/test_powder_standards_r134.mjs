import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVPowderStandards:D,PMSVTestingPlan:P,PMSVCatalogueWorksheets:W,PMSV_REVIEW_REGISTER:R}=ctx;
assert(W.available);assert.equal(R.powderReview.rows,39);assert.equal(R.firstSourceReview.pending,19);
let count=0;
for(const [id,product] of D.products){
  const criteria=W.enabledCriteria(id);
  const full=P.exportRows(id,'2026-11-24').slice(1).filter(r=>r[2]===P.areas[0]);
  assert.deepEqual(P.powderRows(id,'2026-12-01').slice(1),full);assert.equal(full.length,product.rows.length);
  assert.equal(new Set(full.map(r=>r[5])).size,full.length);
  if(id.endsWith('-arrowroot')){
    assert.equal(full.length,1);assert.equal(criteria.length,0);assert.match(full[0][9],/purified starch/i);
  }
  if(id.endsWith('-tapioca-sago')||id.endsWith('palm-sago-starch')){
    assert.equal(criteria.length,8);assert.equal(full.length,11);assert(full.every(r=>r[14].endsWith('#page=5')));
  }
  for(const item of criteria){
    count++;
    const spec=item.v.spec,state={criterion:item.i,result:String(spec.value??spec.min),unitConfirmed:'yes',compReport:'Report S',reference:'Lot 8'};
    const result=extra=>W.resultText(id,{...state,...extra});
    assert.match(result({}),/Within the cited/);assert(!spec.when);
    const exportRow=P.powderRows(id,'2026-11-24',state).find(r=>r[5]===spec.parameter);
    assert(exportRow[9].includes('Lot 8')&&exportRow[9].includes('Report S')&&exportRow[9].includes('Within'));
    assert.equal(exportRow[14],product.gazette);
    const outside=spec.operator==='>='?Number(spec.value)-0.01:Number(spec.max??spec.value)+0.01;
    assert.match(result({result:outside.toFixed(2)}),/Outside/);
    for(const patch of [{unitConfirmed:''},{compReport:' '},{reference:''},{result:'<1'},{result:'-1'},{criterion:'0'}])assert.doesNotMatch(result(patch),/Within the cited/);
    if(spec.unit.startsWith('%'))assert.doesNotMatch(result({result:'101'}),/Within the cited/);
    if(spec.parameter==='Bulk density')assert.match(result({result:'.45'}),/Within the cited/);
  }
}
assert.equal(count,26);assert.equal(P.powderRows().length,40);
for(const name of ['Protein on dry basis','Uric acid']){
 const row=P.powderRows(D.singhara).find(r=>r[5]===name);assert.equal(row[7],'');assert(row[14].includes('#page=12')&&row[14].includes('#page=35'));
 assert(!W.enabledCriteria(D.singhara).some(x=>x.v.spec.parameter===name));
}
const queue=W.pendingSourceRows().slice(1);assert.equal(queue.length,19);assert.equal(queue.filter(r=>D.products.has(r[0])).length,4);
assert(P.exportRows(D.singhara,'2026-11-24').filter(r=>r[2]===P.areas[3]&&/aflatoxin/i.test(r[5])).every(r=>r[7]===''));
console.log('Verified 26 measurements, six scoped worksheets, 39 exported rows, held protein and uric acid readings and the existing pending-source count.');
