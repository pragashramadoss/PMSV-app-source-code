import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const modules=[...fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)]
  .map(([,file])=>fs.readFileSync(new URL(file,dir),'utf8'));
const saved=new Map();
function load(){
  const c=vm.createContext({localStorage:{getItem:k=>saved.get(k)||null}});c.window=c;
  for(const src of modules)vm.runInContext(src,c);assert(c.PMSVCatalogueWorksheets.available);return c;
}
const c=load(),tox=c.PMSVCropScope,p=c.PMSVTestingPlan,rows=c.PMSVCropScopeData.rows;
const current='2026-11-22',next='2026-12-01';
const dairy='01-01-5-dairy-whitener',candy='05-05-2-sugar-boiled-confectionery-hard-candy',fish='09-09-2-smoked-fishery-products';
const fullScope={crop_milk:'wholeIn',crop_milkRef:'QA-117 incoming grade'};
const roles=new Set(),units=new Set(),tested=new Set();
const selection={total:'af',b1:'af',m1:'milk',ota:'ochra',pat:'apple',don:'don',agar:'mushroom',hcn:'cyan',hyp:'hyper',saf:'saff',pcb:'fish',pah:'smoke'};
let checked=0,held=0;
function recorded(id,a,date,scope,role,value,unit,extra={}){
  const f='tox_'+a+'_';
  const s={...scope,vetDate:date,[f+'value']:value,[f+'role']:role,[f+'unit']:unit,[f+'sample']:'QA-117 lot',[f+'report']:'QA-117 COA, "A"',...extra};
  s[f+'basis']=tox.labResult(id,a,s).stamp;return s;
}
for(const {id} of c.PMSV_CATALOGUE){
  for(const date of [current,next]){
    for(const d of tox.decisions(id)){
      const k='crop_'+selection[d.key];
      const options=[{},...d.choices.map(o=>({[k]:o.value,[k+'Ref']:'Sample identity QA-117'}))];
      if(date===next&&d.key==='saf')options.push({crop_dec:'contains',crop_decRef:'Mace on formula QA-117'},{crop_dec:'absent',crop_decRef:'Formula QA-117'});
      for(const state of options){
        const decision={...d,...tox.decision(id,d.key,state)};
        const r=p.toxinRow(id,decision,date,state);
        assert(r.source.includes('https://'));const rule=r.criterion;
        if(!rule){
          assert(!r.limit,id+' '+d.key);
          assert(!tox.labResult(id,d.key,{...state,vetDate:date},date,r).stamp);held++;continue;
        }
        const expectedRole=date===next&&r.unit?'finished':decision.sample;
        assert.equal(rule.role,expectedRole);roles.add(rule.role);units.add(rule.unit);tested.add(d.key);
        if(!r.unit)assert(decision.rows.every(k=>String(rows[k].limit)===rule.value&&rows[k].unit===rule.unit));
        const s=recorded(id,d.key,date,state,rule.role,rule.value,rule.unit);
        assert(tox.labResult(id,d.key,s,date,r).outcome.startsWith('Within'),id+' '+d.key);
        const higher={...s,['tox_'+d.key+'_value']:rule.value+(rule.value.includes('.')?'0001':'.0001')};
        assert(tox.labResult(id,d.key,higher,date,r).outcome.startsWith('Above'));checked++;
      }
    }
  }
}
assert.equal(tested.size,12);assert.equal(roles.size,2);assert.equal(units.size,3);assert(held>8000);
for(const [value,unit,start] of [['0.004','mg/kg','Within'],['.0040000000000000001','mg/kg','Above'],['4','ppb','Within'],
  ['4.00000000000000001','ng/g','Above'],['≤.004','µg/g','Reported upper bound is within'],['<=4','ug/kg','Reported upper bound is within'],
  ['<0.00401','mg/kg','Inconclusive'],['ND','µg/kg','Manual review'],['<LOQ','µg/kg','Manual review'],['-1','µg/kg','Manual review'],
  ['0.004','mg/L','Choose the reported mass-based unit'],['.004','μg/g','Within']]){
  const s=recorded(dairy,'m1',current,fullScope,'ingredient',value,unit);
  assert(tox.labResult(dairy,'m1',s).outcome.startsWith(start),value+' '+unit);
  const result=p.exportRows(dairy,current,false,s).find(r=>r[9].includes('QA-117 COA'));
  assert(result[9].includes(start)&&result[9].includes('Separately sampled ingredient')&&result[9].includes(value));
}
const s=recorded(dairy,'m1',current,fullScope,'ingredient','4','µg/kg');
for(const edit of [{tox_m1_role:'finished'},{tox_m1_sample:''},{tox_m1_report:'Other report'},{vetDate:next},
  {crop_milk:'skimIn'},{crop_milkRef:''},{tox_m1_unit:'mg/kg'},{tox_m1_basis:'yes'},{vetDate:'2026-11-19'}]){
  assert(!tox.labResult(dairy,'m1',{...s,...edit}).confirmed);
}
const product={...recorded(candy,'total',current,{crop_af:'composite',crop_afRef:'QA-117 almond formula'},'finished','20','µg/kg'),
  ...recorded(candy,'b1',current,{crop_af:'composite',crop_afRef:'QA-117 almond formula'},'finished','11','ppb')};
const separate=p.exportRows(candy,current,false,product).filter(r=>r[9].includes('QA-117 COA'));
assert.equal(separate.length,2);assert(separate.some(r=>r[5]==='Total aflatoxins'&&r[9].includes('Within the cited')));
assert(separate.some(r=>r[5]==='Aflatoxin B1'&&r[9].includes('Above the cited')));
const saff=recorded(candy,'saf',next,{crop_dec:'contains',crop_decRef:'QA-117 mace formula'},'finished','10.0001','ppm');
assert(tox.labResult(candy,'saf',saff).outcome.startsWith('Above'));
assert(!tox.labResult(candy,'saf',{...saff,crop_dec:'absent'}).confirmed);
const smoked=recorded(fish,'pah',current,{},'finished','0.005','mg/kg');assert(tox.labResult(fish,'pah',smoked).outcome.startsWith('Within'));
saved.set('pmsv-fssai-worksheet-r93:'+candy,JSON.stringify(product));const restored=load().PMSVCatalogueWorksheets;
assert.equal(restored.productPlan(candy).filter(r=>r[9].includes('QA-117 COA')).length,2);
assert(restored.briefLines(candy).some(x=>x.includes('QA-117 COA')&&x.includes('QA-117 lot')));
assert(!restored.productPlan(dairy).some(r=>r[9].includes('QA-117 COA')));
assert.equal(p.exportRows(candy,next,false,product).filter(r=>r[9].includes('QA-117 COA')).length,0);
for(const date of [current,next]){
  const bulk=p.exportRows(null,date,false,product);assert.equal(new Set(bulk.slice(1).map(r=>r[0])).size,533);
  assert(!bulk.some(r=>r[9].includes('QA-117')));
}
console.log(checked+' resolved product, sample and edition cases checked at and above their maxima; '+held+' unresolved or excluded cases verified across 533 products and 12 analytes.');
