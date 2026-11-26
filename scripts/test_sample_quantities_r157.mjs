import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,file] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(file,dir),'utf8'),ctx);
}
const g=ctx.PMSVSamplingQuantities,plan=ctx.PMSVTestingPlan;
const meta=ctx.PMSV_REVIEW_REGISTER.finishedSampleReview, date='2026-11-26';
const def=(id,state)=>g.decision(id,date,state);
for(const id of [...g.listed.keys(),...g.spiceIds,...g.conditional.keys()])assert(ctx.PMSVCatalogueRules.products[id]);
assert.equal(new Set(g.tableRows(date).slice(1).map(r=>r[0])).size,meta.samplingTableItems);
assert.deepEqual(Array.from(g.tableRows(date).slice(1).filter(r=>r[0]===46),r=>[r[2],r[3]]),[[25,'g'],[100,'mL']]);
for(const [id,value,unit] of [['mineral-water',4000,'mL'],['packaged-drinking-water',4000,'mL'],['06-06-2-arrowroot',250,'g'],['instant-tea-solid',100,'g'],['05-05-1-chocolate',200,'g'],['04-04-2-canned-tomatoes',6,'sealed cans'],['11-11-1-refined-sugar',200,'g'],['11-11-1-icing-sugar',250,'g']]){
  assert.equal(def(id).quantity,value,id);assert.equal(def(id).unit,unit);
}
assert.match(def('packaged-drinking-water').notes,/at least three original sealed packs/);
for(const [form,key] of [['soluble_coffee','33'],['decaffeinated_soluble','33'],['roasted_ground','32'],['green','']])
  assert.equal(def('coffee',{coffeeForm:form}).key,key);
for(const [form,key] of [['instant','33'],['decaffeinated_instant','33'],['regular_roasted_ground',''],['decaffeinated_roasted_ground','']])
  assert.equal(def('coffee-chicory-mixture',{coffeeForm:form,dispatchRow:'32'}).key,key);
assert.equal(def('coffee',{dispatchRow:'33'}).quantity,'');
const meat='08-08-2-canned-or-retort-pouch-meat-products';
assert.equal(def(meat).quantity,'');assert.equal(def(meat,{dispatchRow:'51'}).quantity,6);
assert.equal(def(meat,{dispatchRow:'47'}).quantity,'');
const unknown='10-10-2-egg-powder';
for(const d of [date,'2026-12-01','2027-03-31','2027-04-01']){
  const fromApril=d>='2027-04-01',entry=g.decision(unknown,d);
  assert.equal(entry.quantity,'');assert.match(entry.notes,/500 g as a reference/);
  assert.equal(entry.notes.includes('agree the quantity drawn with the Food Analyst'),!fromApril);
  assert.equal(entry.source.includes('14.09.2026'),fromApril);
  assert.equal(g.tableRows(d).at(-1)[4].includes('applicable Food Authority guidelines'),fromApril);
  const [header,...rows]=g.exportRows(null,d);
  assert.equal(rows.length,meta.regulatorySamplingProducts);
  assert.equal(new Set(rows.map(r=>r[0])).size,533);assert(rows.every(r=>r.length===header.length&&r[2]===d&&r[9]));
  assert.equal(rows.filter(r=>r[6]).length,222);
  assert.equal(rows.filter(r=>r[3]==='Form confirmation needed').length,9);
  const dedicated=plan.entries(unknown,d).filter(r=>r.area===g.area);
  assert.equal(dedicated.length,1);assert(!dedicated[0].limit&&!dedicated[0].unit);
}
for(const id of ['100-100-royal-jelly','purified-vending-water','04-04-1-coconut-milk-powder',unknown])assert.equal(def(id,{dispatchRow:'9'}).quantity,'');
assert.equal(g.exportRows(null,'2027-02-30').length,1);assert.equal(g.tableRows('2010-01-01').length,1);
assert.equal(g.exportRows('unknown',date).length,1);
assert.equal(plan.openProductRows(null,date).filter(r=>r[3]==='Regulatory sample dispatch').length,9);
