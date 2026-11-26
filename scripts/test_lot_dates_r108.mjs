import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
const c=vm.createContext({});c.window=c;
for(const [,name] of html.matchAll(/<script src="([a-z0-9-]+)\.js\?/g)){
  if(/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(name))
    vm.runInContext(fs.readFileSync(new URL(name+'.js',dir),'utf8'),c);
}
const L=c.PMSVLotDates,Q=c.PMSVIngredientPercentage,W=c.PMSVCatalogueWorksheets;
const id='05-05-1-chocolate';
const m=(change={})=>L.model({sku:'Fixture',art:'A1',batch:'001',pack:'retail',band:'long',rule:'general',sample:'Image A',spec:'Instruction B',
  firstKind:'packed',lastKind:'useBy',first:'30/11/2026',last:'31/MAR/2027',...change});
const check=change=>L.analyse(m(change));
assert.equal(c.PMSV_REVIEW_REGISTER.latestRound,146);
assert.match(check().order,/Use by follows packaging/);
assert.match(check({last:'29/11/2026'}).order,/precedes/);
assert.match(check({last:'30/11/2026'}).order,/same day/);
for(const last of ['31/04/2027','29/02/2027','00/01/2026','29/02/2100','31/Jun/26'])
  assert.match(check({last}).last.join(),/Invalid calendar day/);
for(const last of ['31/00/2026','21/13/2026','21/XYZ/2026'])
  assert.match(check({last}).last.join(),/Invalid calendar month/);
assert.match(check({last:'29/02/2000'}).last.join(),/day-level format checked/);
assert.match(check({last:'29/02/00',lastYear:'2100'}).last.join(),/Invalid calendar/);
assert.match(check({last:'29/02/00',lastYear:'2000'}).last.join(),/day-level format checked/);
assert.match(check({last:'28/Feb/27'}).last.join(),/Confirm the four-digit year/);
assert.match(check({last:'28/Feb/27',lastYear:'2028'}).last.join(),/must agree/);
assert.match(check({first:'31/12/99',firstYear:'1999',last:'01/01/00',lastYear:'2000'}).order,/follows/);
for(const last of ['APR 2027','APRIL 2027','SEPT 2027','SEP 2027'])
  assert.match(check({last}).last.join(),/month-year format checked/);
assert.match(check({first:'APR 2027',last:'05/04/2027'}).order,/overlap/);
assert.match(check({first:'30/04/2027',last:'APR 2027'}).order,/overlap/);
assert.match(check({first:'MAY 2027',last:'APR 2027'}).order,/precedes/);
assert.match(check({band:'short',last:'APR 2027'}).last.join(),/Day required/);
assert.match(check({rule:'alcohol',last:'APR 2027'}).last.join(),/5.10/);
assert.match(check({rule:'special',last:'APR 2027'}).last.join(),/Confirm the applicable/);
for(const last of ['04/2027','Apr 2027','21-04-2027','5/4/2027'])
  assert.match(check({last}).last.join(),/differs from the FSSAI example/);
assert.match(check({last:'6 months from packing',lastKind:'best'}).last.join(),/relative best-before/);
assert.match(check({last:'',lastKind:''}).last.join(),/No date transcribed/);
assert.match(check({pack:'nonretail'}).order,/non-retail/);
assert.match(check({firstKind:''}).order,/Chronology needs/);
assert.match(check({spec:'',sample:''}).evidence,/sample.*specification/);
assert(!Q.save(id,m({batch:''})).key);assert(!Q.save(id,m({pack:'nonretail'})).key);
const receipt=Q.save(id,m());assert(receipt.key);
assert(Q.save(id,m({batch:'002',last:'MAY 2027'})).key);
assert(!Q.save(id,m({first:'31/01/2025'})).key);
assert(Q.save(id,m({first:'31/01/2025'}),receipt).key);
assert(!Q.save(id,m(),receipt).key);
assert.deepEqual([...L.exportRows(id)].map(r=>r.length),[30,30,30]);
const blank=W.registerRows(),full=W.registerRows(true);
assert.equal(blank.length,534);assert.equal(blank[0].length,156);
assert(blank.slice(1).every(r=>r[145].includes('#page=16')&&!r[146]&&!r[147]));
assert(full.find(r=>r[0]===id)[147].includes('001')&&full.find(r=>r[0]===id)[147].includes('002'));
assert(W.briefLines(id).join('\n').includes('31/01/2025'));
assert.equal(Q.requestRows().length,1);
console.log('Checked calendar dates, documented years, precision, chronology, format, lot isolation and exports.');
