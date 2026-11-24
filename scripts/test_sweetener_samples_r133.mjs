import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVMetalPanel:M,PMSVTestingPlan:P,PMSVCatalogueWorksheets:W,PMSV_REVIEW_REGISTER:R}=ctx;
assert(W.available);assert.equal(R.firstSourceReview.withRoute,515);
const pending=W.pendingSourceRows().slice(1).map(r=>r[0]);
assert.equal(pending.length,18);assert(!pending.includes(M.misriId)&&pending.includes(M.syrupId)&&pending.includes(M.trehaloseId));
const ash={panelDextrinForm:'misri',panelDextrinLot:'M-17',panelDextrinSpec:'Finished crystallised sugar classification',panelDextrinReport:'Ash method/report',panelDextrinBasis:'yes',panelDextrinAsh:'1.00000000000001'};
const lead={panelLabMetal:'Pb',panelLabSample:'M-17',panelLabRef:'Pb report',panelLabUnit:'mg/kg',panelLabNumber:'5',panelLabBasis:'yes'};
for(const date of ['2026-11-24','2026-12-01']){
  const base={...ash,...lead,vetDate:date,panelLabEdition:P.metalEdition(date)};
  const rows=(id,state)=>P.sugarRows(id,date,state).slice(1);
  const metal=(id,state)=>rows(id,state).find(r=>r[5]==='Lead');
  const all=rows(null);
  assert.equal(all.length,11);assert.equal(all.filter(r=>r[2]===P.areas[0]).length,8);
  assert.equal(all.filter(r=>r[15]).length,1);assert(all.every(r=>r.length===17));
  assert(all.filter(r=>r[5]==='Lead').every(r=>!r[7]));
  const positive=metal(M.misriId,base);assert.match(positive[7],/5.0 ppm/);assert.match(positive[9],/Within the cited Lead/);assert(positive[14].includes('#page=97')&&positive[14].includes('#page=18'));
  const result=patch=>M.lab(M.misriId,{...base,...patch});
  assert.match(result({panelLabNumber:'5.00000000001'}),/Outside/);
  assert.match(result({panelLabNumber:'<5000',panelLabUnit:'µg/kg'}),/within the cited maximum/);
  assert.match(result({panelLabNumber:'<5.1'}),/Inconclusive/);
  assert.match(result({panelLabSample:'M-18'}),/same lot/);assert.doesNotMatch(result({panelLabUnit:'mg\/L'}),/Within the cited/);
  for(const patch of [{panelDextrinAsh:'1.0'},{panelDextrinAsh:'.99'},{panelDextrinAsh:'<1.5'},{panelDextrinAsh:'101'},{panelDextrinForm:'ingredient'},{panelDextrinForm:'other'},{panelDextrinSpec:' '},{panelDextrinBasis:''},{panelDextrinReport:''},{panelDextrinLot:''}]){
    assert.equal(metal(M.misriId,{...base,...patch,panel_Pb:'Pb2',panel_PbRef:'Old manual match'})[7],'');
  }
  for(const id of P.sugarCriteria.keys()){
    const criteria=W.enabledCriteria(id);assert.equal(criteria.length,id===M.trehaloseId?2:3);
    for(const {v,i} of criteria){
      const state={criterion:String(i),result:String(v.spec.value),reference:'Lot X',compReport:'Lab Y',unitConfirmed:'yes'};
      assert.match(W.resultText(id,state),/Within the cited source-edition/);
      const exportRow=rows(id,state).find(r=>r[5]===v.spec.parameter);
      assert(exportRow[9].includes('Lot X')&&exportRow[9].includes('Lab Y')&&exportRow[9].includes('Within'));
      assert(exportRow[14].includes(v.gazette));
      for(const patch of [{reference:''},{compReport:''},{unitConfirmed:''},{result:'101'},{result:'<1'}])assert.doesNotMatch(W.resultText(id,{...state,...patch}),/Within the cited/);
      const outside=(Number(v.spec.value)+(v.spec.operator==='<='?0.01:-0.01)).toFixed(2);
      assert.match(W.resultText(id,{...state,result:outside}),/Outside/);
    }
    if(id!==M.misriId)assert.equal(metal(id,{...base,panel_Pb:'Pb64',panel_PbRef:'Old manual ash choice'})[7],'');
  }
}
console.log('Verified eight composition limits, sample evidence, the strict sulphated-ash condition and both dated lead plans.');
