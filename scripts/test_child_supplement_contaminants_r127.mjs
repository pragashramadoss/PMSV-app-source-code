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
const id=crop.childId, criteria=crop.childCriteriaRows().slice(1);
assert(worksheets.available);
assert.equal(register.firstSourceReview.withRoute,516);
assert.equal(register.firstSourceReview.pending,17);
assert(!worksheets.pendingSourceRows().some(row=>row[0]===id));
assert.equal(criteria.length,15);
const samples={
  finishedBlend:['finished',{total:'20',b1:'10'}],
  finishedCereal:['finished',{total:'15',b1:'10'}],
  inputCereal:['ingredient',{total:'15',b1:'10'}],
  inputPulse:['ingredient',{total:'15',b1:'10'}],
  wheat:['ingredient',{ota:'5',don:'1000'}],
  'wheat bran':['ingredient',{ota:'5',don:'1000'}],
  rye:['ingredient',{ota:'5'}],
  barley:['ingredient',{ota:'5',don:'1000'}]
};
const keys={total:'crop_af',b1:'crop_af',ota:'crop_ochra',don:'crop_don'};
for(const date of ['2026-11-24','2026-12-01']){
  for(const [form,[role,limits]] of Object.entries(samples)){
    for(const [a,limit] of Object.entries(limits)){
      const key=keys[a],prefix='tox_'+a+'_';
      const state={crop_childAge:'covered',crop_childAgeRef:'Age label A',vetDate:date,[key]:form,[key+'Ref']:'Spec and lot Q',
        [prefix+'role']:role,[prefix+'sample']:'Lot Q',[prefix+'report']:'Report 4',[prefix+'unit']:'ng/g',[prefix+'value']:limit};
      const result=delta=>crop.labResult(id,a,{...state,...delta},date);
      state[prefix+'basis']=result().stamp;
      assert(state[prefix+'basis']);
      assert.match(result().outcome,/Within the cited/);
      assert.match(result({[prefix+'value']:limit+'.0001'}).outcome,/Above the cited/);
      assert.match(result({[prefix+'value']:'<'+limit}).outcome,/upper bound is within/);
      assert.match(result({[prefix+'role']:role==='finished'?'ingredient':'finished'}).outcome,/different sample role/);
      assert.match(result({crop_childAgeRef:'Label B'}).outcome,/Confirm the sample/);
      const invalid=[{crop_childAge:'other'},{crop_childAgeRef:' '},{[key+'Ref']:''},{[key]:'uncertain'},{[key]:'composite'}];
      for(const delta of invalid)assert.equal(crop.decision(id,a,{...state,...delta}).rows.length,0);
      const row=plan.exportRows(id,date,false,state).find(r=>r[5]===ctx.PMSVCropScopeData.labels[a]);
      assert(row[7].includes(limit+' µg/kg')&&row[9].includes('Age label A')&&row[9].includes('Report 4'));
      assert(row[14].includes('#page=12')&&row[14].includes('#page='+(['ota','don'].includes(a)?17:form.toLowerCase().includes('cereal')&&a==='total'?28:29)));
      const article=crop.decision(id,a,state).choices.find(o=>o.value===form);
      assert(criteria.some(r=>r[2]===article.label&&r[3]===role&&r[4]===row[5]&&r[5]===limit));
    }
  }
  for(const [a,form] of [['don','rye'],['ota','finishedBlend'],['ota','wheat flour']]){
    const k=keys[a];
    assert.equal(crop.decision(id,a,{crop_childAge:'covered',crop_childAgeRef:'label',[k]:form,[k+'Ref']:'sample'}).rows.length,0);
  }
  const rows=plan.exportRows(id,date);
  assert(rows.some(r=>r[9].includes('minimise pesticide residues')&&r[14].includes('#page=16')));
  assert(plan.exportRows(id,date,true).some(r=>r[9].includes('agreed analytical methods')&&!r[7]&&r[14].includes('#page=16')));
}
assert(crop.fields.includes('crop_childAgeRef'));
console.log('Verified 15 child supplement and ingredient criteria, sample roles, marketed age evidence, and both regulatory editions.');
