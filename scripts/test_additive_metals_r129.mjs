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
const groupIds=register.additiveMetalReview.productIds;
const focused=groupIds.flatMap(id=>metal.additiveCriteriaRows(id).slice(1));
assert(worksheets.available);
assert.equal(register.latestRound,160);assert.equal(register.firstSourceReview.withRoute,524);
assert.equal(worksheets.pendingSourceRows().length,10);
assert.equal(focused.length,12);assert.equal(new Set(focused.map(r=>r[2])).size,6);
const expected={'475':{Pb:'2.0',Cu:'25',As:'3.0'},'476':{Pb:'2.0',Cu:'25',As:'3.0'},
  '1401':{As:'3.0'},'1417':{As:'3.0'},'1422':{As:'3.0'},'1451':{As:'3.0'}};
for(const id of groupIds){
  assert(!worksheets.pendingSourceRows().some(r=>r[0]===id));
  assert.equal(worksheets.currentSource(ctx.PMSV_CATALOGUE.find(p=>p.id===id)),'CONDITIONAL_METAL_SOURCE_MATCH');
  assert(metal.firstSource(id).urls.every(u=>u.includes('#page=')));
  const forms=metal.additiveGroup(id).forms;
  assert.equal(metal.additiveCriteriaRows(id).length,forms.length===2?9:5);
  for(const [ins] of forms)for(const [m,lim] of Object.entries(expected[ins])){
    const name={Pb:'Lead',Cu:'Copper',As:'Arsenic'}[m];
    const bases=m==='As'?(forms.length===2?['named','dry']:['dry']):[''];
    for(const basis of bases)for(const date of ['2026-11-24','2026-12-01']){
      const state={panelAdditiveINS:ins,panelAdditiveAsBasis:basis,panelAdditiveSpec:'Supplier S',panelAdditiveRoute:'Route R',panelAdditiveLot:'Batch A',
        panelLabMetal:m,panelLabSample:'Batch A',panelLabNumber:lim,panelLabUnit:'mg/kg',panelLabRef:'Lab report A',panelLabBasis:'yes',vetDate:date,panelLabEdition:plan.metalEdition(date)};
      const row=s=>plan.exportRows(id,date,false,s).find(r=>r[2]==='Metals'&&r[5]===name);
      const lab=s=>metal.lab(id,{...state,...s});
      const decision=metal.forMetal(id,m,state);assert.equal(decision.kind,'named');assert.equal(decision.keys.length,1);
      assert.equal(decision.keys[0]==='As67',basis==='dry');
      assert(focused.some(r=>r[0]===id&&r[2]===ins&&r[4]===name&&r[5]===lim&&r[7].startsWith(basis==='dry'?'Dry matter':'Named additive')));
      assert(row(state)[9].includes('Lab report A')&&row(state)[14].includes('#page='+({Pb:21,Cu:23,As:25}[m])));
      assert.match(lab({}),/Within the cited/);
      assert.match(lab({panelLabUnit:'µg/kg',panelLabNumber:String(Number(lim)*1000)+'.000000000001'}),/Outside the cited/);
      assert.match(lab({panelLabNumber:'<'+lim}),/within the cited maximum/);
      assert.match(lab({panelLabNumber:'<100'}),/Inconclusive/);
      assert.match(lab({panelLabSample:'Batch B'}),/same additive lot/);
      assert.match(lab({panelLabUnit:'mg/L'}),/mass-based/);
      assert.doesNotMatch(lab({panelLabBasis:''}),/Within the cited/);
      for(const patch of [{panelAdditiveINS:'blend'},{panelAdditiveINS:'wrong'},{panelAdditiveSpec:' '},{panelAdditiveRoute:''},{panelAdditiveLot:''},...(m==='As'?[{panelAdditiveAsBasis:'unknown'}]:[])]){
        const changed={...state,...patch,['panel_'+m]:decision.keys[0],['panel_'+m+'Ref']:'Old scope selection'};
        assert.equal(row(changed)[7],'');assert.doesNotMatch(metal.lab(id,changed),/Within the cited/);
      }
    }
  }
  const legacy={panel_As:'As60',panel_AsRef:'Acid lot',panelIdentity:'Phosphoric acid',panelIdentityRef:'Existing specification'};
  assert.equal(metal.forMetal(id,'As',legacy).keys[0],'As60');
  assert.equal(metal.forMetal(id,'As',{...legacy,panelAdditiveINS:'blend'}).kind,'check');
  assert.equal(metal.additiveCriteriaRows('tea').length,1);
}
console.log('Verified 12 additive-metal criteria, 6 identities, wrong-lot and wrong-basis exclusions, and both assessment editions.');
