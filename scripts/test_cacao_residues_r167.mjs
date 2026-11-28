import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
ctx.PMSVCulinarySauces=createRequire(import.meta.url)('../fssai-helper/culinary-sauces.js');
const c=ctx.PMSVCacaoResidues,w=ctx.PMSVCatalogueWorksheets,p=ctx.PMSVTestingPlan;
const state={cacaoActive:'Hydrogen phosphide',cacaoLot:'Private incoming lot',cacaoSpec:'Private contract',cacaoReport:'Private report',cacaoValue:'0.010',cacaoBasis:'yes'};
const expect={'Methyl bromide':'5.0','Endosulfan':'0.2','Hydrogen phosphide':'0.01','Metalaxyl':'0.2','Mandipropamid':'0.06','Clothianidin':'0.02','Thiamethoxam':'0.02','Pyraclostrobin':'0.01','Flupyradifurone':'0.01'};
assert.deepEqual(Object.fromEntries(c.entries.map(r=>[r.name,r.maximum])),expect);
assert.equal(c.entries.filter(r=>r.flag==='Po').length,2);
assert.equal(c.entries.filter(r=>r.flag==='(*)').length,3);
assert.equal(new Set(c.entries.map(r=>r.url)).size,9);
assert.match(c.outcome(state),/at or below the Codex reference/);
assert.match(c.outcome({...state,cacaoValue:'0.010000000000000000001'}),/above the Codex/);
assert.match(c.outcome({...state,cacaoValue:'<0.01'}),/individual interpretation/);
assert.match(c.outcome({...state,cacaoActive:'Methyl bromide'}),/point of entry/);
assert.match(c.outcome({...state,cacaoActive:'Methyl bromide',cacaoPort:'yes',cacaoValue:'5'}),/at or below/);
for(const key of ['cacaoLot','cacaoSpec','cacaoReport','cacaoActive','cacaoBasis'])assert.doesNotMatch(c.outcome({...state,[key]:''}),/at or below/);
for(const id of c.products){
  const rows=c.exportRows(id,state);
  assert.equal(rows.length,10);assert.equal(rows.filter(r=>r[10].includes(state.cacaoReport)).length,1);
  for(const date of ['2026-11-28','2026-12-01']){
    const plan=p.exportRows(id,date,false,state).filter(r=>r[2]===c.area);
    assert.equal(plan.length,9);assert(plan.every(r=>r[7]===''&&r[8]===''));
    assert.equal(plan.filter(r=>r[9].includes(state.cacaoReport)).length,1);
    if(id===c.mass)assert(plan.every(r=>r[4].includes('incoming')));
  }
}
assert(!JSON.stringify(c.exportRows(null,state)).includes(state.cacaoReport));
assert.equal(c.planRows('05-05-1-chocolate').length,0);
for(const [date,count] of [['2026-11-28',9],['2026-12-01',10]]){
  const rows=w.pendingSourceRows(date).slice(1);
  assert.equal(rows.length,count);
  assert(rows.every(r=>r[3]==='FIRST_EXACT_SOURCE_PENDING'&&r[11]===date&&r[12]&&r[13].startsWith('https://')));
  assert.equal(rows.filter(r=>r[0]==='purified-vending-water').length,count-9);
}
console.log('Nine Codex limits, reporting conditions, procurement scope, private reports and all dated domestic gaps verified.');
