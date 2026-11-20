import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {assessMeasurement,assessMedium,assessDefect,markup} = require('../fssai-helper/fruit-cocktail.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const read = name => fs.readFileSync(new URL('../fssai-helper/'+name,import.meta.url),'utf8');
const ctx = vm.createContext({window:{}});
for (const file of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(file),ctx);
const register = JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER)), catalogue=ctx.window.PMSV_CATALOGUE;
const r = register.fruitCocktailReview, rec=register.records.find(x=>x.id===r.id);
assert(validateReview(register,catalogue).ok);
assert(register.latestRound>=91 && register.sourceFiles.includes(r.report.replace('.md','.json')));
assert.equal(rec.legalArticleDecision,'OPEN');
assert.deepEqual(rec.reports.slice(0,2).map(s=>s.round),[91,66]);
for (const source of Object.values(r.sources)) assert(read(r.report).includes(source.sha256));
for (const title of ['Drained fruit','Container fill','Packing medium and label','Canned tropical fruit salad defects','Flexible pack'])
  assert(markup(r).includes(title));

const mass = (raw,capacity,basis='stated') => assessMeasurement(r.drained,basis,raw,capacity);
assert.equal(mass('240','500'),'Minimum drained fruit · 250 g\n48.0% · Below this minimum\nShortfall · 10 g');
assert.equal(mass('249','498'),'Minimum drained fruit · 249 g\n50.0% · Meets this minimum');
assert.match(mass('250.000000000000001','500'),/Meets this minimum/);
assert.match(mass('249.999999999999999','500'),/Below this minimum\nShortfall · 0.000000000000001 g/);
assert.match(mass('0','.025'),/Minimum drained fruit · 0.0125 g\n0.0% · Below.*\nShortfall · 0.0125 g/);
assert.match(mass('501','500'),/Meets this minimum/);
assert(!mass('240','500','other').includes('Minimum drained fruit'));
assert(!mass('240','500','').includes('48.0%'));
for (const raw of ['','-10','1e3','abc','1'.repeat(33)]) assert(!/Meets|Below/.test(mass(raw,'500')));
for (const ref of ['','0','wrong','-2']) assert(!/Meets|Below/.test(mass('240',ref)));
const fill = (actual,capacity,basis='stated') => assessMeasurement(r.fill,basis,actual,capacity);
assert.equal(fill('450','500'),'Minimum occupied volume · 450 mL\n90.0% · Meets this minimum');
assert.equal(fill('449.999','500'),'Minimum occupied volume · 450 mL\n89.99…% · Below this minimum\nShortfall · 0.001 mL');
assert.match(fill('450.1','450'),/exceeds/);
assert(!/Meets|Below/.test(fill('450','500','other')));
assert(!/Meets|Below/.test(fill('','','')));
const medium=(key,reading,basis='stated',share='',names='mango')=>assessMedium(r,key,names,share,basis,reading);
for (const [i,ends] of [['10','13.9'],['14','17.9'],['18','21.9'],['22','55.123']].entries()) {
  for (const v of ends) {
    assert.equal(medium('sugarJuice',v),r.bands[i].juice+' mango juice');
    for (const m of ['sugarWater','sugarBlend']) assert.equal(medium(m,v),r.bands[i].syrup);
  }
}
for (const v of ['13.90001','13.99999','17.95','21.90000000000000001']) assert.match(medium('sugarJuice',v),/Between the published bands/);
assert.match(medium('sugarJuice','9.9999999999999'),/Below the 10 °Brix minimum/);
assert.match(medium('sugarWater','9.999'),/first published syrup band/);
for (const v of ['','-2','101','1e1','x']) assert.match(medium('sugarBlend',v),/Enter the reported/);
for (const basis of ['','other']) assert.match(medium('sugarWater','18',basis),/Confirm the cut-out/);
assert.equal(medium('juice','10'),'In mango juice');
assert.equal(medium('water','18'),'In water or Packed in water');
assert.equal(medium('blend','18','stated','49.9999999999999999'),'In water or Packed in water');
assert.equal(medium('blend','18','stated','50'),'mango juice and water');
assert.equal(medium('blend','18','stated','50.1','pear and pineapple'),'pear and pineapple juice and water');
for (const v of ['', '100','0','100.01','-5']) assert.match(medium('blend','','',v),/Enter the juice percentage/);
assert.equal(medium('juice','','','',''),'In [fruit name(s)] juice');
assert.match(medium('other','18'),/Select the packing/);
for (const [rule,high] of r.defects.map((d,i)=>[d,['3','6.5000000000001','2.001'][i]])) {
  assert.equal(assessDefect(rule,'tropical','stated',rule.limit),'Within this maximum');
  assert.equal(assessDefect(rule,'tropical','stated','0'),'Within this maximum');
  assert.equal(assessDefect(rule,'tropical','stated',high),'Above this maximum');
  for (const v of ['','-1','no']) assert.match(assessDefect(rule,'tropical','stated',v),/Enter the result/);
  for (const identity of ['','other']) assert.match(assessDefect(rule,identity,'stated',rule.limit),/Confirm canned/);
  for (const basis of ['','other']) assert.match(assessDefect(rule,'tropical',basis,rule.limit),/Confirm the reporting basis/);
}
assert.match(assessDefect(r.defects[0],'tropical','stated','1.5'),/whole number/);
for (const mutate of [
  x=>x.drained.minimumPercent=51,x=>x.drained.basis='net contents',x=>x.fill.unit='g',x=>x.fill.provision='(3)',
  x=>x.temperatureC=27,x=>x.juiceSharePercent=51,x=>x.bands[0].max='14',x=>x.bands[3].syrup='Heavy syrup',
  x=>x.defects[1].basis='cm²/500 g drained fruit',x=>x.defects[0].wholeCount=false,x=>x.sources.amendment.page=29,
  x=>x.sources.chapter.sha256='unknown',x=>x.aliases=[],x=>x.packForms.pop()
]) {
  const clone=structuredClone(register);mutate(clone.fruitCocktailReview);assert(!validateReview(clone,catalogue).ok);
}
console.log('R91 verified independent water mass and volume, eight packing-liquid designations, three defect sample bases and the R66 source history.');
