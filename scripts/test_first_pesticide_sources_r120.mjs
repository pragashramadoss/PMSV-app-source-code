import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
for(const [,file] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(file,dir),'utf8'),ctx);
}
const X=ctx.PMSVPesticides,W=ctx.PMSVCatalogueWorksheets,Y=ctx.PMSVResiduePanel,plan=ctx.PMSVTestingPlan;
const tamarind='04-04-1-seedless-tamarind',frozen='04-04-1-frozen-fruits-fruit-products',chia='06-06-1-chia-seeds';
const cases=[
  [tamarind,'plainSeedlessTamarind','1-10','Fruits','2','physical',73],
  [frozen,'plainFrozenFruit','1-10','Fruits','2','physical',40],
  [chia,'wholeChia','1-4','other food grains','0.01','raw',18]
];
const baseline=ctx.PMSV_CATALOGUE, register=W.registerRows();
assert(W.available);
assert.equal(baseline.filter(p=>p.sourceStatus==='FIRST_EXACT_SOURCE_PENDING').length,35);
assert.equal(baseline.filter(p=>X.sourceStatus(p)===X.groupStatus).length,4);
assert.equal(baseline.filter(p=>X.sourceStatus(p)==='FIRST_EXACT_SOURCE_PENDING').length,31);
assert.equal(baseline.filter(p=>X.sourceStatus(p)==='PARTIAL_EXACT_SOURCE_MATCH').length,498);
assert.equal(ctx.PMSV_REVIEW_REGISTER.firstSourceReview.pesticideMapped,48);
assert.equal(register.length,534);assert.equal(register[0].length,156);
for(const [id,matrix,key,article,limit,process,identityPage] of cases){
  const g=X.groupSource(id), row=register.find(r=>r[0]===id), entry=baseline.find(p=>p.id===id);
  assert.equal(entry.sourceStatus,'FIRST_EXACT_SOURCE_PENDING');assert.equal(row.at(-2),X.groupStatus);
  assert(row.at(-1).includes(limit+' mg/kg'));assert.equal(row[15],'No');
  assert.equal(g.row.serial,1);assert.equal(g.row.key,key);assert.equal(g.row.article,article);assert.equal(g.row.limit,limit);
  assert(g.row.url.endsWith('#page=31'));assert(g.identity.endsWith('#page='+identityPage));assert(g.urls[1].endsWith('#page=1'));
  const sample={pestRole:'product',pestMatrix:matrix,pestRow:key,pestSample:'Product lot A',pestScopeRef:'Identity and process record A',
    pestProcess:process,pestReport:'Test report 120',pestUnit:'mg/kg',pestBasis:'yes',pestKind:'quantified',pestValue:limit};
  assert.equal(X.current(id,sample).options.filter(r=>r.serial===1).length,1);
  assert.equal(X.comparison(id,sample).kind,'within');
  assert.equal(X.comparison(id,{...sample,pestValue:limit+'0000000000000001'}).kind,'above');
  assert.equal(X.comparison(id,{...sample,pestKind:'less'}).kind,'within');
  assert.equal(X.comparison(id,{...sample,pestKind:'less',pestValue:'9'}).kind,'inconclusive');
  for(const patch of [{pestRole:'ingredient'},{pestScopeRef:' '},{pestSample:''},{pestReport:''},{pestBasis:''},
    {pestProcess:'thermal'},{pestProcess:'unknown'},{pestUnit:'mg/L'},{pestRow:'1-2'},{pestMatrix:'cane'}])
    assert.equal(X.comparison(id,{...sample,...patch}).kind,'hold');
  assert.equal(X.comparison(id,{...sample,pestProcess:'raw'}).kind,id===chia?'within':'hold');
  assert.equal(X.comparison(id,{...sample,pestProcess:'physical'}).kind,'within');
  for(const date of ['2026-11-22','2026-12-01']){
    const rows=plan.exportRows(id,date).filter(r=>r.includes('Conditional group entry · confirm marketed form and process')&&r.includes('CTR 2.3.1 · serial 1'));
    assert.equal(rows.length,1);assert(rows[0].includes(limit));assert(rows[0].includes('mg/kg'));
    for(const url of [g.row.url,g.identity,g.urls[1]])assert(rows[0].at(-1).includes(url));
    assert(rows[0].some(v=>String(v).includes(g.evidence)));
  }
  assert(X.values(id,sample).join(' ').includes(sample.pestScopeRef));
  Y.save(id,sample,'gazette');
  const saved=Y.exportRows(id).at(-1);assert(saved.includes(g.row.url));assert(saved.some(v=>String(v).includes(sample.pestScopeRef)));
  assert(plan.exportRows(id,'2026-11-22',false,sample).some(r=>r.includes('Recorded pesticide laboratory result')&&r.some(v=>String(v).includes(sample.pestScopeRef))));
}
for(const row of register.slice(1)) {
  if(cases.some(([id])=>id===row[0])||row[0]==='11-11-1-edible-lactose')continue;
  assert.equal(X.groupSource(row[0]),null);assert.equal(row.at(-1),'');
}
const frozenMango=X.current(frozen,{pestRole:'product',pestMatrix:'mango'}).options[0];
assert(frozenMango);
assert.match(X.compare(frozen,{pestRole:'product',pestMatrix:'mango',pestRow:frozenMango.key,pestProcess:'raw'}),/eligible marketed form/);
assert(!X.current(frozen,{pestRole:'ingredient'}).choices.includes('plainFrozenFruit'));
console.log('R120 verifies three conditional group routes, exact source rows, 533 conserved identities and independent current and December plan exports.');
