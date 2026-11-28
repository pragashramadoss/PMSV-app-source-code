import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir = new URL('../fssai-helper/', import.meta.url);
const ctx = vm.createContext({});
ctx.window = ctx;
for (const [, name] of fs.readFileSync(new URL('index.html', dir), 'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)) {
  vm.runInContext(fs.readFileSync(new URL(name, dir), 'utf8'), ctx);
}
const {PMSVMetalPanel:M,PMSVTestingPlan:P,PMSVCatalogueWorksheets:W}=ctx;
const id=M.polyolId;
const refs=M.polyolRows().slice(1);
assert.equal(refs.length,9);
assert.equal(refs.filter(r=>r[3]==='FSSAI CTR 2.1.1(2)').length,3);
assert.equal(refs.filter(r=>r[3].includes('JECFA')&&r[8].startsWith('https://www.fao.org/')).length,6);
assert.equal(P.routeIds.polyols,id);
assert(W.available);
assert(!W.pendingSourceRows().some(r=>r[0]===id));
for(const date of ['2026-11-26','2026-12-01']){
  for(const [metal,limit] of [['Lead','1 mg/kg'],['Nickel','2 mg/kg']]){
    const row=P.exportRows(id,date).find(r=>r[2]==='Metals'&&r[5]===metal);
    assert(row[9].includes('JECFA')&&row[9].includes(limit));
    assert.equal(row[14].split(' | ').filter(u=>u.includes('www.fao.org/')).length,3);
  }
  for(const [ins] of M.additiveGroup(id).forms){
    for(const role of ['stabilizer','emulsifier']){
      const s={panelAdditiveINS:ins,panelPolyolFunction:role,panelAdditiveLot:'A-4',panelAdditiveSpec:'Spec AS4',panelAdditiveRoute:'FPC and use reference',panelAdditiveAsBasis:'dry',
        panelLabMetal:'As',panelLabSample:'A-4',panelLabNumber:'3.000',panelLabUnit:'mg/kg',panelLabRef:'Report A',panelLabBasis:'yes',vetDate:date,panelLabEdition:P.metalEdition(date)};
      const lab=patch=>M.lab(id,{...s,...patch});
      const row=state=>P.exportRows(id,date,false,state).find(r=>r[2]==='Metals'&&r[5]==='Arsenic');
      assert.match(lab({}),/Within the cited/);
      assert.match(row(s)[7],/3.0 ppm on dry matter/);
      assert.match(row(s)[9],new RegExp(role,'i'));
      assert.match(lab({panelLabNumber:'3000.001',panelLabUnit:'µg/kg'}),/Outside/);
      assert.match(lab({panelLabNumber:'<4'}),/Inconclusive/);
      assert.match(lab({panelLabSample:'B-7'}),/same additive lot/);
      assert.match(lab({panelLabUnit:'mg\/L'}),/mass-based/);
      for(const patch of [{panelPolyolFunction:'sweetener'},{panelPolyolFunction:''},{panelAdditiveSpec:' '},{panelAdditiveRoute:''},{panelAdditiveLot:''},{panelAdditiveAsBasis:'as-is'},{panelAdditiveINS:'420(i)'},{panelAdditiveINS:'blend'},{panelAdditiveINS:'other'}]){
        const legacy={...s,...patch,panel_As:'As67',panel_AsRef:'Old entry'};
        assert.equal(row(legacy)[7],'');
        assert.doesNotMatch(M.lab(id,legacy),/Within the cited/);
      }
      assert.equal(row({})[7],'');
    }
  }
}
