import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVCocoaMixtures:m,PMSVCatalogueWorksheets:w,PMSVTestingPlan:p}=ctx;
const base={mixScope:'direct',mixRecipe:'Formula 24',mixPowderRef:'Powder 24'};
const assess=(key,cocoa,butter,patch={})=>m.assess({...base,mixName:key,mixCocoa:cocoa,mixButter:butter,...patch});
for(const f of m.forms){
  for(const [pct,accepted] of (f.family.key==='drink'?[['25',true],['24.9999999999999999999',false]]:f.family.key==='mix'?[['20',true],['25',true],['19.9',false]]:[['20',false],['19.99999999999999999',true]])){
    for(const butter of ['9.9999999999999999','10','19.9999999999999999','20']){
      const ok=f.grade.key==='standard'?butter==='20':f.grade.key==='reduced'?['10','19.9999999999999999'].includes(butter):butter.startsWith('9.');
      const result=assess(f.key,pct,butter);
      assert.equal(result.includes('recipe meets'),accepted);assert.equal(result.includes('powder matches'),ok);
    }
  }
}
for(const value of ['',' ','0','100','-1','101','NaN','2e1'])assert.match(assess('mix-standard',value,'22'),/^Pending/);
for(const patch of [{mixScope:'other'},{mixRecipe:' '},{mixPowderRef:''},{mixButter:'101'}])assert.match(assess('drink-standard','27','22',patch),/^Pending/);
assert.match(assess('chocolate','32',''),/meets/);
assert.match(assess('chocolate','','',{mixDryCocoa:'29'}),/at or above/);
assert.match(assess('chocolate','32','',{mixDryCocoa:'28.9'}),/disagree/);
const saved={...base,mixName:'drink-standard',mixCocoa:'27',mixButter:'21'};
for(const date of ['2026-11-23','2026-12-01']){
  const comp=r=>r[0]===m.productId&&r[2]==='Composition and identity';
  const single=p.exportRows(m.productId,date).filter(comp),bulk=p.exportRows(null,date,false,saved).filter(comp);
  assert.deepEqual(bulk,single);assert.equal(single.length,12);assert.equal(single.filter(r=>r[3].endsWith('(2)(b)')).length,9);
  assert(single.slice(1).every(r=>r[14].includes('#page=21')&&r[14].includes('#page=22')));
  const recorded=p.exportRows(m.productId,date,false,saved).filter(r=>r[9].includes('Formula 24'));
  assert.equal(recorded.length,1);assert(recorded[0][9].includes('Powder 24'));
  assert(p.exportRows(m.productId,date).find(r=>r[5]==='Saffrole')[9].includes('actual recipe'));
}
const [header,...pending]=w.pendingSourceRows();
assert.equal(header.length,9);assert.equal(pending.length,28);assert.equal(new Set(pending.map(r=>r[0])).size,28);
assert(pending.every(r=>r.every(v=>typeof v==='string'&&v.trim())&&r[3]==='FIRST_EXACT_SOURCE_PENDING'&&r[7].startsWith('https://')));
assert(!pending.some(r=>r[0].endsWith('edible-lactose')));
console.log('Verified 9 cocoa mix names and 2 chocolate powder reporting bases, scoped exports and all 28 pending source identities.');
