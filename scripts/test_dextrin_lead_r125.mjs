import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVMetalPanel:metal,PMSVCatalogueWorksheets:worksheets,PMSVTestingPlan:plan,PMSV_REVIEW_REGISTER:register}=ctx;
const id=metal.dextrinId;
const ash={panelDextrinForm:'ingredient',panelDextrinSpec:'Spec S',panelDextrinLot:'F-24',panelDextrinReport:'Report A / ash method',panelDextrinBasis:'yes',panelDextrinAsh:'1.01'};
const lead={panelLabMetal:'Pb',panelLabSample:'F-24',panelLabRef:'Report B',panelLabNumber:'5.0',panelLabUnit:'mg/kg',panelLabBasis:'yes'};
const row=(id,date,state)=>plan.exportRows(id,date,false,state).find(r=>r[2]==='Metals'&&r[5]==='Lead');
assert.equal(register.firstSourceReview.withRoute,523);
assert.equal(register.firstSourceReview.pending,10);
assert.equal(worksheets.currentSource(ctx.PMSV_CATALOGUE.find(p=>p.id===id)),'CONDITIONAL_METAL_SOURCE_MATCH');
assert(!worksheets.pendingSourceRows().some(r=>r[0]===id));
assert(!worksheets.pendingSourceRows().some(r=>r[0]===metal.syrupId));
assert(metal.forMetal(metal.syrupId,'Pb',{}).reason.includes('1.0%'));
for(const patch of [{panelDextrinAsh:'1.0000'},{panelDextrinAsh:'.99'},{panelDextrinAsh:'<2'},{panelDextrinAsh:'101'},{panelDextrinAsh:'-1'},{panelDextrinAsh:''},{panelDextrinBasis:''},{panelDextrinForm:'other'},{panelDextrinReport:''},{panelDextrinLot:' '},{panelDextrinSpec:' '}]){
  const state={...ash,...lead,...patch,panel_Pb:'Pb64',panel_PbRef:'Old saved selection'};
  assert.equal(metal.forMetal(id,'Pb',state).kind,'check');
  assert.doesNotMatch(metal.lab(id,state),/Within the cited/);
  assert.equal(row(id,'2026-11-24',state)[7],'');
}
assert.match(metal.forMetal(id,'Pb',{...ash,panelDextrinAsh:'1.000000000000000001'}).kind,/named/);
for(const date of ['2026-11-24','2026-12-01']){
  const state={...ash,...lead,vetDate:date,panelLabEdition:plan.metalEdition(date)};
  const active=row(id,date,state);
  assert.match(active[7],/5.0 ppm/);
  assert.match(active[9],/F-24/);assert.match(active[9],/Within the cited Lead/);
  assert(active[14].includes('#page=5')&&active[14].includes('#page=20'));
  assert.match(metal.lab(id,{...state,panelLabNumber:'5000.00000000001',panelLabUnit:'µg/kg'}),/Outside/);
  assert.match(metal.lab(id,{...state,panelLabNumber:'<5000',panelLabUnit:'µg/kg'}),/within the cited maximum/);
  for(const lot of ['','F-25'])assert.match(metal.lab(id,{...state,panelLabSample:lot}),/same lot/);
  assert.doesNotMatch(metal.lab(id,{...state,panelLabUnit:'mg/L'}),/Within the cited/);
  assert.equal(row(id,date)[7],'');
  assert.equal(row(metal.syrupId,date,{...state,panel_Pb:'Pb64',panel_PbRef:'syrup'})[7],'');
}
const [header,...records]=worksheets.registerRows();
assert.equal(records.filter(r=>r[header.indexOf('Current first-source status')]==='CONDITIONAL_METAL_SOURCE_MATCH').length,10);
assert(records.find(r=>r[0]===id).at(-1).includes('#page=20'));
console.log('Verified the dextrin identity, lot linkage, strict ash boundary, lead results, both editions, dried glucose syrup and register coverage.');
