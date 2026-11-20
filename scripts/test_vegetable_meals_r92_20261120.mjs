import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {validReview,eligible,solidsCheck,fillCheck,markup}=require('../fssai-helper/vegetable-meals.js');
const {validateReview}=require('../fssai-helper/review-status.js');
const read=name=>fs.readFileSync(new URL('../fssai-helper/'+name,import.meta.url),'utf8');
const ctx=vm.createContext({window:{}});
for (const file of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(file),ctx);
const catalogue=ctx.window.PMSV_CATALOGUE, reg=JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER));
const r=reg.vegetableMealReview,[curry,soup]=r.products;
assert(validateReview(reg,catalogue).ok);
assert.equal(new Set(catalogue.map(p=>p.id)).size,533);
assert.equal(reg.focusedCount,137);assert.equal(reg.legalProductApprovals,0);
assert.equal(reg.records.filter(p=>p.legalArticleDecision==='OPEN').length,137);
assert.deepEqual(reg.records.find(p=>p.id===curry.id).reports.filter(x=>[92,67].includes(x.round)).map(x=>x.round),[92,67]);
assert(!reg.records.some(p=>p.id===soup.id));
assert(reg.sourceFiles.includes(r.report.replace('.md','.json')));
for (const [i,p] of r.products.entries()) {
  const html=markup(r,p);
  for (const [key,page] of [['gazette',p.gazettePage],['chapter',p.chapterPage]]) {
    assert(html.includes(r.sources[key].url+'#page='+page));assert(read(r.report).includes(r.sources[key].sha256));
  }
  assert(html.includes('vm-appendix') && html.includes('vm-additives') && html.includes('vm-volumes'));
  assert.equal(html.includes('id="vm-solids"'),i===1);
  const key=i?'vegetable':'ready';
  assert(eligible(p,key));assert(!eligible(p,'other'));assert(!eligible(p,''));
  const fill=(pack,basis,actual,cap)=>fillCheck(r,p,key,pack,basis,actual,cap);
  assert.equal(fill('rigid','stated','360','400'),'Minimum occupied volume · 360 mL\n90.0% · Meets this minimum');
  assert.match(fill('rigid','stated','359.99999999999999','400'),/Below this minimum/);
  assert.match(fill('rigid','stated','401','400'),/exceeds/);
  assert.match(fill('rigid','stated','0','400'),/0.0% · Below/);
  for (const cap of ['','0','-1','unknown']) assert(!/Meets|Below/.test(fill('rigid','stated','360',cap)));
  for (const basis of ['','other']) assert(!/Meets|Below/.test(fill('rigid',basis,'360','400')));
  assert.match(fill('flexible','stated','360','400'),/does not apply/);
  assert.match(fill('unknown','stated','360','400'),/Confirm the container/);
  assert(!/Meets|Below/.test(fillCheck(r,p,'other','rigid','stated','360','400')));
}
const solids=(key,value,basis='stated')=>solidsCheck(soup,key,basis,value);
assert.equal(solids('vegetable','6'),'FSSAI 2.3.5(2) · Minimum 5.0% total soluble solids by mass.\nMeets this minimum');
assert.equal(solids('tomato','6'),'FSSAI 2.3.5(2) · Minimum 7.0% total soluble solids by mass.\nBelow this minimum');
for (const [key,min] of [['tomato',7],['vegetable',5]]) {
  assert.match(solids(key,String(min)),/Meets this minimum/);
  assert.match(solids(key,String(min-1)+'.999999999999999999'),/Below this minimum/);
  assert.match(solids(key,'0'),/Below this minimum/);
  assert.match(solids(key,'100.0001'),/Enter a percentage/);
  assert.match(solids(key,'-1'),/Enter a percentage/);
  assert.match(solids(key,'1e1'),/Enter a percentage/);
  assert.match(solids(key,''),/Awaiting a result/);
  assert.match(solids(key,'6','other'),/Different reporting basis/);
  assert.match(solids(key,'6',''),/Confirm the reporting basis/);
}
for (const key of ['','other','reconstitute','ready']) assert.equal(solids(key,'6'),'');
assert(!eligible(soup,'reconstitute'));assert.match(fillCheck(r,soup,'reconstitute','rigid','stated','360','400'),/supplied for direct consumption/);
assert.equal(solidsCheck(curry,'ready','stated','6'),'');
for (const change of [
  q=>q.fill.pack='any',q=>q.fill.waterTemperatureC=25,q=>q.fill.minimumPercent=85,q=>q.products.reverse(),
  q=>q.products[0].solids={minimum:5},q=>q.products[0].fillParagraph=4,q=>q.products[0].fcs='12.5.1',q=>q.products[0].chapterPage=11,
  q=>q.products[1].aliases=[],q=>q.products[1].solids.types[1].minimum=5,q=>q.products[1].solids.basis='°Brix',q=>q.products[1].solids.types.reverse(),
  q=>q.sources.chapter.sha256='incomplete',q=>q.products[1].gazettePage=53
]) {const c=structuredClone(reg);change(c.vegetableMealReview);assert(!validateReview(c,catalogue).ok);}
assert(!validReview(r,reg.thermalPackReview,catalogue,reg.records.filter(x=>x.id!==curry.id)));
console.log('R92 verified two product identities, soup solids by mass, rigid and flexible pack handling, source documents and unchanged queue counts.');
