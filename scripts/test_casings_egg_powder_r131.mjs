import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
for(const [,file] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(file,dir),'utf8'),ctx);
}
const {PMSVVeterinary:v,PMSVCatalogueWorksheets:w,PMSVTestingPlan:plan}=ctx;
const casing=v.casingId,egg=v.eggPowderId;
assert(w.available);assert.equal(v.firstSource(egg),null);
assert(w.pendingSourceRows().some(r=>r[0]===egg&&r[6].includes('whole hen egg')));
assert(!w.pendingSourceRows().some(r=>r[0]===casing));
assert.equal(ctx.PMSV_REVIEW_REGISTER.firstSourceReview.withRoute,511);
for(const date of ['2026-11-24','2026-12-01']){
 const rows=plan.animalCriteriaRows(null,date).slice(1),tissue=rows.filter(r=>r[0]===casing);
 assert.equal(rows.length,39);assert.equal(tissue.length,20);
 assert.equal(tissue.filter(r=>r[7]==='0.01'&&r[8]==='mg/kg').length,19);
 assert(tissue.find(r=>r[3].endsWith('serial 41')&&!r[7]&&r[6].includes('overlapping')));
 assert(tissue.every(r=>r[14].includes('#page=36')&&r[4].includes('edible animal tissues')));
 const eggRows=rows.filter(r=>r[0]===egg),inputs=eggRows.filter(r=>r[2]==='Veterinary drug residues');
 assert.equal(inputs.length,7);assert(inputs.every(r=>r[6]==='Ingredient sample only'&&r[4].includes('whole hen egg')));
 const ph=eggRows.filter(r=>r[5]==='pH');assert.equal(ph.length,2);
 assert(ph.some(r=>r[4]==='Dried egg yolk'&&r[7]==='≥ 3.9')&&ph.some(r=>r[4]==='Dried whole egg'&&r[7]==='≥ 4.2'));
 const conflict=eggRows.find(r=>r[4]==='Dried whole egg'&&r[5]==='Protein');
 assert.equal(conflict[7],'');assert(conflict[9].includes('47.1%')&&conflict[9].includes('45%')&&conflict[14].includes('#page=15')&&conflict[14].includes('#page=38'));
 const possible=v.focusedRows(casing,date);
 assert.equal(possible.length,20);assert(v.candidates(v.basis(egg,{vetDate:date})).length===0);
 assert(v.candidates(v.basis(casing,{vetDate:date})).length===0);
 for(const r of possible){
  assert(r.clause===4&&r.article.startsWith('All edible animal tissues'));
  const s={vetDate:date,vetMatrix:'casing',vetSource:'Sheep specification S',vetCasingPortion:'small',vetCasingProcess:'salted',vetProcessRef:'Validated casing sampling basis',
   vetCasingLot:'Lot 7',vetReportLot:'Lot 7',vetRow:r.key,vetValue:r.limit,vetUnit:r.unit,vetBasis:'yes',vetReport:'Lab report A'};
  const check=patch=>v.current(casing,{...s,...patch}).comparison;
  if(r.serial===41){assert.match(check({}),/interpretation required/);continue;}
  assert.match(check({}),/At or below/);assert.match(check({vetValue:'0.010001'}),/Above/);
  assert.match(check({vetValue:'<0.1'}),/separate interpretation/);
  for(const patch of [{vetCasingPortion:'other'},{vetCasingProcess:'brine'},{vetProcessRef:' '},{vetCasingLot:''},{vetReportLot:'Lot 8'},
      {vetMatrix:'none'},{vetRole:'ingredient'},{vetReport:''},{vetSource:' '},{vetBasis:''},{vetUnit:'mg/L'}])
   assert.doesNotMatch(check(patch),/At or below|Above the selected/);
  const recorded=v.recordedPlanRow(casing,s,date);assert(recorded.notes.includes('Sheep specification S')&&recorded.notes.includes('Casing lot Lot 7')&&recorded.notes.includes('Validated casing sampling basis'));
 }
}
console.log('Verified casing tissue criteria, sample and lot exclusions, independent whole hen egg inputs and bilingual egg powder composition.');
