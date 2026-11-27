import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const s=ctx.PMSVSpiceMicrobiology,p=ctx.PMSVTestingPlan,date='2026-11-27';
const id=suffix=>'12-12-2-'+suffix;
const manual=id('asafoetida-hing-or-hingra'),oleoresin=id('spice-oleoresins'),seasoning=id('seasoning');
const recorded={vetDate:date,spiceLot:'QA165 lot',spiceReport:'Private QA165 report',spiceOrganism:'enterobacteriaceae'};
function measure(key,values,extra={}){
  return {...recorded,microForm:key,microFormRef:'QA165 specification',...Object.fromEntries(s.units.map((k,i)=>[k,values[i]])),...extra};
}
for(const d of [date,'2026-12-01']){
  const rows=p.microFormRows(null,d,recorded,'spice').slice(1);
  assert.equal(rows.length,525);assert.equal(new Set(rows.map(r=>r[0])).size,43);
  assert(!JSON.stringify(rows).includes('QA165'));
  assert(rows.every(r=>r[14].includes('Gazette_Notification_Spices')&&r[14].includes('Chapter%202_9')));
  assert.equal(rows.filter(r=>r[6]==='Mapped table row').length,98);
  const sourceCheck=rows.filter(r=>r[6]==='Verify Gazette basis before use');
  assert.equal(sourceCheck.length,0);
  const official=rows.filter(r=>r[10]!==''&&r[4].includes('Wet')&&r[0]===seasoning);
  assert.equal(official.length,7);
  const safety=official.filter(r=>r[3].includes('3B'));
  assert.equal(safety.length,3);assert.match(safety.map(r=>r[5]).join(' '),/salmonella/i);
  assert(!official.some(r=>/listeria/i.test(r[5])));
}
for(const name of ['poppy-khas-khas','aniseed-saunf','ajowan-bishops-seed','celery','tejpat','star-anise']){
  const rows=p.microFormRows(id(name),date).slice(1);
  assert.equal(rows.length,7);assert(rows.every(r=>r[4].includes('Dried')&&r[6]==='Mapped table row'));
}
for(const name of ['fenugreek-methi','saffron-kesar','black-white-and-green-bwg-peppers']){
  assert.deepEqual(Array.from(p.microFormRoute(id(name)).options,o=>o.profile_key||o.choice_key),['spice-02','spice-03','review']);
}
for(const form of ['natural-resin','compounded-hing']){
  const one=p.microFormRows(manual,date,{microForm:form,microFormRef:'SKU'}).slice(1);
  assert.equal(one.length,1);assert(one[0].slice(10,14).every(v=>v===''));
}
const counts=['11','100','10','10','1'];
assert.match(s.outcome(oleoresin,measure('',counts)),/^Unsatisfactory/);
assert.match(s.outcome(oleoresin,measure('',['10','100','10','10','1'])),/^Acceptable/);
assert.match(s.outcome(oleoresin,measure('',['10','10.0000000000000000001','10','10','1'])),/^Acceptable/);
assert.match(s.outcome(oleoresin,measure('',['100.0000000000000000001','0','0','0','0'])),/^Unsatisfactory/);
assert.match(s.outcome(seasoning,measure('spice-05',counts)),/^Satisfactory/);
assert.match(s.outcome(seasoning,measure('spice-05',['101','1000','1','2','100'])),/^Acceptable/);
assert.match(s.outcome(oleoresin,measure('',counts,{spiceUnit1:'<10'})),/exact non-negative/);
assert.match(s.outcome(seasoning,measure('spice-05',counts,{microFormRef:' '})),/Select an applicable criterion/);
assert(!s.criteria(seasoning,measure('spice-05',counts)).some(([key])=>key==='listeria_monocytogenes'));
const presence=measure('spice-05',['Absent','Absent','Absent','Absent','Present'],{spiceOrganism:'salmonella'});
assert.match(s.outcome(seasoning,presence),/^Unsatisfactory/);
assert.equal(p.microFormRows(seasoning,date,presence).filter(r=>r[9].includes('Private QA165 report')).length,1);
assert.equal(p.microFormRows(oleoresin,'2010-01-01').length,1);
assert.equal(ctx.PMSVEggMicrobiology.products.size,5);
console.log('43 spice products, supported form choices, seven Gazette criteria, Table 3B scope, report boundaries and private evidence verified.');
