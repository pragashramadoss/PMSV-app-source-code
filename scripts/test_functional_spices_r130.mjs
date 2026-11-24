import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVCropScope:crop,PMSVCatalogueWorksheets:w,PMSVTestingPlan:plan,PMSV_REVIEW_REGISTER:reg}=ctx;
const [single,premix]=crop.botanicalIds;
assert(w.available);assert.equal(reg.firstSourceReview.pending,19);
assert.equal(crop.botanicalCriteriaRows().length,19);
assert.equal(crop.botanicalCriteriaRows('tea').length,1);
const cases=[[single,'suppliedPowder','finished',30,15],[premix,'compoundPremix','finished',20,10],[premix,'incomingPowder','ingredient',30,15]];
for(const [id,form,role,total,b1] of cases){
  assert(!w.pendingSourceRows().some(r=>r[0]===id));
  const criteria=crop.botanicalCriteriaRows(id).slice(1);
  assert.equal(criteria.length,id===single?6:12);
  for(const identity of ['clove','cinnamon','turmeric'])for(const date of ['2026-11-24','2026-12-01'])for(const [a,max] of [['total',total],['b1',b1]]){
    const f='tox_'+a+'_';
    const storage={crop_botanical:identity,crop_botanicalRef:'Spec R',crop_botanicalLot:'Lot A',crop_af:form,crop_afRef:'Classification and recipe A',
      vetDate:date,[f+'role']:role,[f+'report']:'Report 13',[f+'sample']:'Lot A',[f+'unit']:'µg/kg',[f+'value']:String(max)};
    const decision=crop.decision(id,a,storage);
    assert.equal(decision.sample,role);
    const row=plan.toxinRow(id,{...decision,key:a,name:ctx.PMSVCropScopeData.labels[a]},date,storage);
    assert.equal(row.criterion.value,String(max));assert(row.source.includes('#page=29')&&row.notes.includes('Spec R'));
    const test=patch=>crop.labResult(id,a,{...storage,...patch},date);
    const stamp=test({}).stamp;assert(stamp);storage[f+'basis']=stamp;
    assert.match(test({}).outcome,/Within the cited/);
    assert.match(test({[f+'value']:max+'.00000001'}).outcome,/Above the cited/);
    assert.match(test({[f+'value']:'<100'}).outcome,/Inconclusive/);
    assert.match(test({[f+'sample']:'Lot B'}).outcome,/documented spice or premix lot/);
    assert.match(test({[f+'role']:role==='finished'?'ingredient':'finished'}).outcome,/different sample role/);
    assert.match(test({[f+'unit']:'mg\/L'}).outcome,/mass-based/);
    for(const patch of [{crop_botanical:'other'},{crop_botanical:'extract'},{crop_botanicalRef:' '},{crop_botanicalLot:''},{crop_afRef:' '},{crop_af:'unverified'},{crop_af:id===single?'compoundPremix':'suppliedPowder'}]){
      assert.equal(crop.decision(id,a,{...storage,...patch}).rows.length,0);
      assert.equal(test(patch).stamp,'');
    }
  }
}
console.log('Verified 18 functional spice sample criteria, identity exclusions and lot-specific comparisons across both editions.');
