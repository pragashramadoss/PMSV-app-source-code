import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const helper=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',helper),'utf8');
for(const [,file] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(file,helper),'utf8'),ctx);
}
const {PMSVVendingWater:water,PMSVTestingPlan:plan,PMSV_REVIEW_REGISTER:register}=ctx;
const id=water.productId, criteria=register.waterStandardReview.rows;
assert.equal(criteria.length,74);
for(const date of ['2026-11-23','2026-12-01']){
  const bulk=plan.exportRows(null,date).filter(row=>row[2]===water.area);
  assert.equal(bulk.length,74);assert(bulk.every(row=>row[0]===id));
  const single=plan.exportRows(id,date).filter(row=>row[2]===water.area);
  assert.deepEqual(bulk,single);
  for(const [i,r] of criteria.entries()){
    assert.equal(single[i][5],r.name);
    assert(single[i][14].includes('#page='+r.source.pdfPage));
    assert(single[i][14].includes('Drinking_Water'));
    if(r.operator==='pointer')assert.equal(single[i][7]+single[i][8],'');
    if(r.sampleVolumeMl)assert.equal(single[i][8],r.unit);
    if(r.waterScope)assert.equal(single[i][4],r.waterScope);
  }
  const byId=key=>single[criteria.findIndex(r=>r.id===key)];
  assert(byId('sulphate')[9].includes('400 mg/L'));assert(byId('sulphate')[9].includes('30 mg/L'));
  assert.equal(byId('free-chlorine')[7],'≥ 0.2');assert(byId('iron')[6].includes('combined'));
  assert(byId('arsenic')[14].includes('10500A1.pdf'));assert(byId('uranium')[14].includes('10500A4.pdf'));
}
const base={waterPoint:'outlet',waterSample:'Outlet QA-12',waterReport:'Report 17',waterBasis:'yes',waterUnit:'mg/L'};
const numeric=criteria.filter(r=>r.table===3&&r.operator==='max');
assert.equal(numeric.length,15);
for(const row of numeric){
  const s={...base,waterAnalyte:row.id,waterValue:row.acceptable};
  assert(water.assess(s).startsWith('At or below'));
  assert(water.assess({...s,waterValue:row.acceptable+'00000000000001'}).startsWith('Above'));
  assert(water.assess({...s,waterValue:'<1'}).startsWith('Inconclusive'));
  for(const patch of [{waterPoint:'other'},{waterPoint:''},{waterSample:' '},{waterReport:''},{waterUnit:'mg/kg'},{waterBasis:''},{waterValue:'ND'},{waterValue:'<0'}]){
    assert(water.assess({...s,...patch}).startsWith('Pending'));
  }
}
const reading={...base,waterAnalyte:'lead',waterValue:'<10',waterUnit:'µg/L'};
assert(water.assess(reading).includes('within the maximum'));
assert(water.assess(reading).includes('<0.01 mg/L'));
const measured=plan.exportRows(id,'2026-11-23',false,reading);
assert.equal(measured.filter(row=>row[9]?.includes(base.waterReport)).length,1);
assert(!plan.exportRows(null,'2026-11-23',false,reading).some(row=>row[9]?.includes(base.waterReport)));
assert.equal(water.planRows('mineral-water',reading).length,0);
assert.equal(water.assess({...reading,waterAnalyte:'pesticide-pointer'}),'');
assert.equal(register.firstSourceReview.pending,30);
console.log('74 vending-water entries, 15 Table 3 reading checks, two plan editions, documented outlet scope and separate reference exports verified.');
