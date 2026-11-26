import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
 vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVRecipeSamples:R,PMSVCropScope:C,PMSVCatalogueWorksheets:W,PMSVTestingPlan:P}=ctx;
const [sweet,drink,powder,flour]=R.ids;
assert(W.available);
assert.equal(R.covered('constructor','total'),false);
assert.equal(R.criteriaRows(null,'2026-01-01').length,1);
assert.deepEqual(Array.from(C.decision(powder,'total',{crop_af:'kernel',crop_afLot:'K',crop_afRef:'Intake',vetDate:''}).rows),[]);
const queue=W.pendingSourceRows().slice(1).map(r=>r[0]);assert.equal(queue.length,11);
assert(!queue.includes(sweet)&&!queue.includes(drink)&&queue.includes(powder)&&!queue.includes(flour));
for(const id of [sweet,drink,powder,flour]){
 for(const date of ['2026-11-24','2026-11-30','2026-12-01']){
  const rules=R.criteriaRows(id,date).slice(1).filter(r=>id!==flour||r[4]==='ingredient');assert.equal(rules.length,id===sweet?5:2);
  const all=R.criteriaRows(null,date).slice(1);assert.equal(all.length,23);
  assert.equal(all.filter(r=>r[6]!=='').length,date==='2026-12-01'?21:22);
  for(const r of rules){
   const analyte=Object.keys(ctx.PMSVCropScopeData.labels).find(a=>ctx.PMSVCropScopeData.labels[a]===r[5]);
   const k={total:'crop_af',b1:'crop_af',m1:'crop_milk',saf:'crop_saff'}[analyte];
   const choice=C.decision(id,analyte).choices.find(o=>o.label===r[3]).value;
   const f='tox_'+analyte+'_';
   const state={vetDate:date,ayRecipe:'Authorised recipe S',ayIngredient:'present',ayIngredientRef:'Retained kernel in recipe S',ayVariant:'Authority for this drink variant',crop_dec:'absent',crop_decRef:'Ingredient declaration',
    [k]:choice,[k+'Ref']:'Ingredient/finished article spec',[k+'Lot']:'Batch 8',
    [f+'role']:r[4],[f+'sample']:'Batch 8',[f+'report']:'Report B',[f+'unit']:r[7]||'ppm',[f+'value']:r[6]||'10'};
   const result=patch=>C.labResult(id,analyte,{...state,...patch},date);
   const plan=patch=>P.exportRows(id,date,false,{...state,...patch}).find(row=>row[2]===P.areas[3]&&row[5]===r[5]);
   const newDrink=id===drink&&analyte==='saf'&&date==='2026-12-01';
   if(newDrink){
    assert.equal(plan({})[7],'');assert.match(plan({})[6],/outside the December/);
    assert.equal(result({}).stamp,'');assert.equal(plan({crop_dec:'contains'})[7],'');
    assert.match(plan({crop_dec:'contains'})[6],/changed recipe/);continue;
   }
   assert(plan({})[7].includes(r[6]+' '+r[7]));assert(plan({})[14].includes('#page='));
   state[f+'basis']=result({}).stamp;assert(state[f+'basis']);assert.match(result({}).outcome,/Within the cited/);
   assert.match(result({[f+'value']:String(Number(r[6])+0.01)}).outcome,/Above the cited/);
   assert.match(result({[f+'value']:'<100'}).outcome,/Inconclusive/);
   assert.match(result({[f+'sample']:'Batch 9'}).outcome,/documented lot/);
   assert.match(result({[f+'role']:r[4]==='finished'?'ingredient':'finished'}).outcome,/different sample role/);
   for(const patch of [{[k]:'other'},{[k+'Ref']:' '},{[k+'Lot']:''},...(r[4]==='finished'?[{ayRecipe:''}]:[]),...(id===drink&&analyte==='saf'?[{ayVariant:''}]:[]),...(id===sweet&&r[4]==='finished'?[{ayIngredient:'absent'},{ayIngredientRef:''}]:[])])
    assert.equal(plan(patch)[7],'');
  }
 }
}
console.log('Verified 11 sample-specific entries, two marketed recipe sources, four product plans, incoming-lot boundaries and the December saffrole transition.');
