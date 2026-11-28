import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {assessDrained,assessFill,markup}=require('../fssai-helper/thermal-packs.js');
const {validateReview}=require('../fssai-helper/review-status.js');
const read=name=>fs.readFileSync(new URL('../fssai-helper/'+name,import.meta.url),'utf8');
const ctx=vm.createContext({window:{}});
for (const name of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(name),ctx);
const register=JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER)),all=ctx.window.PMSV_CATALOGUE;
const review=register.thermalPackReview,[fruit,veg]=review.products;
assert(validateReview(register,all).ok);
assert(register.latestRound>=90 && register.sourceFiles.includes(review.report.replace('.md','.json')));
assert.equal(register.records.filter(x=>x.legalArticleDecision==='OPEN').length,137);
const report=read(review.report);
for (const p of review.products) {
  const record=register.records.find(c=>c.id===p.id);
  assert(record.reports.some(r=>r.round===90) && record.reports.some(r=>r.round===66));
  assert(record.sourceReviewResult.includes(p.sourceReviewResult));
  assert.equal(all.find(c=>c.id===p.id).priority,p.priority);
  for (const [source,page] of [[review.sources.gazette,p.gazettePage],[review.sources.chapter,p.chapterPage],[review.sources.method,5],[p.amendment,p.amendment.page]]) {
    assert(report.includes(source.url+'#page='+page) && report.includes(source.sha256));
  }
  assert(markup(review,p).includes('FSSAI '+p.clause+'('+p.fillParagraph+')'));
}
const run=(p,row,d,n,form='ordinary',stem='')=>assessDrained(p,row,form,stem,d,n);
for (const [p,key,min] of [[fruit,'liquid',50],[fruit,'solid',70],[veg,'mushroom',50],[veg,'listed',50],[veg,'sauce',25],[veg,'other',50],[veg,'solid',70]]) {
  const exact=String(min*4),at=run(p,key,exact,'400');
  assert.equal(at.minimum,'Minimum drained solids · '+exact+' g');
  assert.equal(at.outcome,min+'.0% · Meets this minimum');
  assert.match(run(p,key,String(min*4-1)+'.9999999999999999999','400').outcome,/Below/);
  assert.match(run(p,key,'401','400').outcome,/exceeds/);
  assert.match(run(p,key,'-1','400').outcome,/non-negative/);
  assert.match(run(p,key,'1','0').outcome,/positive/);
}
assert.equal(run(veg,'sauce','.075','.3').minimum,'Minimum drained solids · 0.075 g');
assert.equal(run(veg,'sauce','0','1.29').minimum,'Minimum drained solids · 0.3225 g');
assert.equal(run(veg,'liquid','200','400').reference,undefined);
assert.equal(run(fruit,'sauce','100','400').reference,undefined);
for (const s of ['', 'included','unknown']) assert(!/Meets|Below/.test(run(fruit,'liquid','205','400','cherries',s).outcome));
assert(!/Meets|Below/.test(run(fruit,'liquid','200','400','','removed').outcome));
const cherry=run(fruit,'liquid','195','400','cherries','removed');
assert.equal(cherry.outcome,'48.75% · Below this minimum');
assert.equal(run(fruit,'liquid','200','400','cherries','removed').outcome,'50.0% · Meets this minimum');
assert.match(run(veg,'sauce','1e2','400').outcome,/non-negative/);
const fill=(type,basis,vol,cap)=>assessFill(review.fill,type,basis,vol,cap);
assert.deepEqual(fill('rigid','stated','270','300'),{minimum:'Minimum occupied volume · 270 mL',outcome:'90.0% · Meets this minimum'});
assert.deepEqual(fill('rigid','stated','252','300'),{minimum:'Minimum occupied volume · 270 mL',outcome:'84.0% · Below this minimum'});
assert.match(fill('rigid','stated','269.99999999999999','300').outcome,/Below/);
assert.match(fill('rigid','stated','301','300').outcome,/exceeds/);
assert.match(fill('rigid','stated','0.5','0').outcome,/greater than zero/);
assert.equal(fill('rigid','other','270','300').minimum,undefined);
assert.match(fill('rigid','other','270','300').outcome,/20 °C/);
assert.match(fill('flexible','stated','270','300').outcome,/does not apply/);
assert.match(fill('','stated','270','300').outcome,/Confirm/);
for (const change of [
 r=>r.products[1].rows[2].minimumPercent=50,r=>r.products[1].rows[2].label=r.products[1].rows[0].label,
 r=>r.products[1].rows[0].provision='(2)(i)',r=>r.products.reverse(),r=>r.products[0].fillParagraph=2,
 r=>r.products[0].amendment.sha256=r.products[1].amendment.sha256,r=>r.products[1].chapterPage=9,
 r=>r.sources.method.page=35,r=>r.fill.waterTemperatureC=27,r=>r.products[0].id='tomato-juice',r=>r.products[0].aliases=[]
]) {const c=structuredClone(register);change(c.thermalPackReview);assert(!validateReview(c,all).ok);}
const missing=structuredClone(register);missing.records.find(c=>c.id===veg.id).reports=missing.records.find(c=>c.id===veg.id).reports.filter(x=>x.round!==90);
assert(!validateReview(missing,all).ok);
console.log('R90 verified seven pack rows, cherry preparation, sauce eligibility, exact measured weights and rigid fill, sources and both R66 histories.');
