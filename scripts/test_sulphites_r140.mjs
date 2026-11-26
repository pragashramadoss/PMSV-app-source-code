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
const S=ctx.PMSVSulphites,P=ctx.PMSVTestingPlan,W=ctx.PMSVCatalogueWorksheets,R=ctx.PMSV_REVIEW_REGISTER;
assert(W.available);
const refs=P.sulphiteRows().slice(1);
assert.equal(refs.length,R.sulphiteReview.referenceRows);
assert.equal(new Set(refs.map(r=>r[0])).size,13);
const dry=S.dry,liquid='11-11-3-golden-syrup';
const state={reference:'Dry lot A',sulphiteForm:'dry-candy',sulphiteBasis:'yes',sulphiteReport:'Report A'};
const update=(id,value,changes={})=>S.assessment(id,{...state,sulphiteValue:value,...changes});
assert.match(update(dry,'40'),/not triggered/);
assert.match(update(dry,'40.000000000000001'),/Rectangular box required/);
assert.match(update(dry,'150'),/^Within.*Rectangular box required/);
assert.match(update(dry,'150.000001'),/^Above/);
assert.match(update(dry,'45',{sulphiteForm:'dry-other'}),/conflicts with this restriction/);
assert.match(update(liquid,'400',{sulphiteForm:'liquid-candy'}),/^Within/);
assert.match(update(liquid,'400.001',{sulphiteForm:'liquid-candy'}),/^Above/);
assert.match(update(liquid,'71',{sulphiteForm:'invert'}),/^Above.*70 mg\/kg/);
for(const value of ['','-1','<40','ND','  ','0.1 mg/L']){
  assert.match(update(dry,value),/numerical result/);
}
for(const k of ['reference','sulphiteBasis','sulphiteReport']){
  assert.match(update(dry,'100',{[k]:''}),/Enter the sample/);
}
assert.match(update(dry,'100',{sulphiteForm:'liquid-candy'}),/Select the sampled grade/);
assert.match(update('11-11-1-khandsari-sugar','0',{sulphiteForm:'desi'}),/no food additives/);
assert.match(update('11-11-1-refined-sugar','15',{sulphiteForm:'refined'}),/manual comparison/);
for(const date of ['2026-11-25','2026-12-01']){
  for(const id of S.profiles.keys()){
    assert.deepEqual(P.exportRows(id,date).filter(r=>r[2]===S.area),P.sulphiteRows(id).slice(1));
  }
  const record={...state,sulphiteValue:'55'};
  const selected=P.exportRows(dry,date,false,record).filter(r=>r[2]===S.area);
  assert.deepEqual(selected,P.sulphiteRows(dry,record).slice(1));
  assert.equal(selected.length,2);
  assert.match(selected[0][9],/Report A.*Rectangular box required/);
  assert(!P.sulphiteRows().some(r=>r.includes('Report A')));
}
assert.equal(W.pendingSourceRows().length-1,10);
assert.equal(R.firstSourceReview.withRoute,523);
