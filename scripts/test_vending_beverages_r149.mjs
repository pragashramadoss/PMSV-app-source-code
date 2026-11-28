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
const crop=ctx.PMSVCropScope,water=crop.vendingId,blend='coffee-chicory-mixture';
const original='2026-11-30',replacement='2026-12-01';
const state={waterPoint:'outlet',waterSample:'W-17',vetDate:original,tox_saf_role:'finished',tox_saf_report:'Report 149',tox_saf_sample:'W-17',tox_saf_unit:'mg/kg',tox_saf_value:'10'};
const row=(id,date,s)=>plan.entries(id,date,s).find(r=>r.parameter==='Saffrole');
for(const [date,count] of [[original,9],[replacement,10]]){
  const open=ws.pendingSourceRows(date).slice(1);
  assert.equal(open.length,count);
  assert.equal(open.some(r=>r[0]===water),date===replacement);
  assert.equal(new Set(plan.openProductRows(null,date).slice(1).map(r=>r[0])).size,count);
  const guide=plan.marketSampleRows(null,date).slice(1);
  assert.equal(guide.length,28);
  assert(guide.every(r=>r.length===11&&r[2]===date&&r[10].startsWith('https://')));
  assert.equal(guide.find(r=>r[0]===water)[6],date===original?'10':'');
  assert.equal(guide.filter(r=>r[5]==='Downstream product reference only'&&r[6]==='70'&&r[7]==='ppm').length,2);
  assert.equal(guide.filter(r=>r[5]==='Finished product composition').length,18);
  assert.equal(guide.filter(r=>r[9]==='FSSAI 04A.014:2023'&&!r[6]).length,1);
  assert(!row(blend,date,{crop_saff:'article',crop_saffRef:'Old choice',crop_dec:'contains',crop_decRef:'Old recipe'}).criterion);
  const stale={...state,crop_dec:'contains',crop_decRef:'Other product'};
  assert.equal(!!row(water,date,stale).criterion,date===original);
}
assert(!row(water,original,{...state,waterSample:' '}).criterion);
assert(!row(water,original,{...state,waterPoint:'other'}).criterion);
assert.equal(row(water,original,state).criterion.value,'10');
state.tox_saf_basis=crop.labResult(water,'saf',state).stamp;
assert.match(crop.labResult(water,'saf',state).outcome,/Within/);
assert.match(crop.labResult(water,'saf',{...state,tox_saf_value:'10.00001'}).outcome,/Above/);
assert.match(crop.labResult(water,'saf',{...state,tox_saf_value:'<11'}).outcome,/Inconclusive/);
assert.match(crop.labResult(water,'saf',{...state,tox_saf_sample:'Other sample'}).outcome,/match/);
assert.match(crop.labResult(water,'saf',{...state,tox_saf_unit:'mg/L'}).outcome,/mass-based/);
assert(!crop.labResult(water,'saf',state,replacement).criterion);
assert.equal(plan.marketSampleRows(null,'2020-01-01').length,1);
