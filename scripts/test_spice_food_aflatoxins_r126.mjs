import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVCropScope:crop,PMSVTestingPlan:plan,PMSVCatalogueWorksheets:worksheets,PMSV_REVIEW_REGISTER:register}=ctx;
const ids=['05-05-1-dry-mixtures-of-cocoa-and-sugars','10-10-3-pickled-eggs'];
assert.deepEqual([...register.firstSourceReview.toxinProductIds].sort(),[...ids,crop.childId,...crop.botanicalIds,...register.recipeSampleReview.productIds].sort());
assert.equal(register.firstSourceReview.withRoute,513);
const queue=worksheets.pendingSourceRows().slice(1);
assert.equal(queue.length,20);
assert(queue.some(r=>r[1]==='Cocoa Beans')&&queue.some(r=>r[1]==='Egg powder'));
assert.equal(crop.spiceCriteriaRows().length,9);
for(const id of ids){
  assert(!queue.some(r=>r[0]===id));
  assert.equal(crop.spiceCriteriaRows(id).length,5);
  for(const date of ['2026-11-24','2026-12-01']){
    for(const [key,finished,incoming] of [['total','20','30'],['b1','10','15']]){
      const values={'finishedSpice':['finished',finished],'incomingSpice':['ingredient',incoming]};
      for(const [choice,[role,max]] of Object.entries(values)){
        const prefix='tox_'+key+'_';
        const state={crop_af:choice,crop_afRef:'Recipe / lot 126',vetDate:date,[prefix+'role']:role,[prefix+'sample']:'Sample '+role,
          [prefix+'report']:'Lab 126',[prefix+'unit']:'µg/kg',[prefix+'value']:max};
        const result=patch=>crop.labResult(id,key,{...state,...patch},date);
        state[prefix+'basis']=result().stamp;
        assert(state[prefix+'basis']);
        assert.match(result().outcome,/Within the cited/);
        assert.match(result({[prefix+'value']:max+'.00000000001'}).outcome,/Above the cited/);
        assert.match(result({[prefix+'value']:'<'+max}).outcome,/upper bound is within/);
        assert.match(result({[prefix+'role']:role==='finished'?'ingredient':'finished'}).outcome,/different sample role/);
        assert.match(result({crop_afRef:'replacement report'}).outcome,/Confirm the sample/);
        const row=plan.exportRows(id,date,false,state).find(r=>r[5]===ctx.PMSVCropScopeData.labels[key]);
        assert(row[7].includes(max+' µg/kg')&&row[9].includes('Lab 126'));
        assert(row[14].includes('#page=29')&&row[14].includes(id===ids[0]?'#page=22':'#page=30'));
      }
      for(const s of [{},{crop_af:'finishedSpice',crop_afRef:' '},{crop_af:'portion',crop_afRef:'drained egg'},{crop_af:'outside',crop_afRef:'plain cocoa and sugar'}]){
        assert.equal(crop.decision(id,key,s).rows.length,0);
        assert.equal(plan.exportRows(id,date,false,s).find(r=>r[5]===ctx.PMSVCropScopeData.labels[key])[7],'');
      }
      assert.equal(crop.decision(id,key,{crop_af:'composite',crop_afRef:'Verified legacy recipe and sample'}).sample,'finished');
    }
  }
}
console.log('Verified finished-food and incoming spice criteria, incomplete evidence, sample roles, laboratory bounds and both assessment editions.');
