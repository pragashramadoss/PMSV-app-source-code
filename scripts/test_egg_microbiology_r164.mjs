import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const e=ctx.PMSVEggMicrobiology,p=ctx.PMSVTestingPlan;
const fresh='10-10-1-fresh-eggs',powder='10-10-2-egg-powder',liquid='10-10-2-liquid-egg-products',pickled='10-10-3-pickled-eggs';
const date='2026-11-27',ref='Private egg report 164';
function state(organism,values,extra={}){
  return {vetDate:date,eggLot:'Private egg lot',eggReport:ref,eggOrganism:organism,
    ...Object.fromEntries(e.units.map((k,i)=>[k,values[i]??''])),...extra};
}
const counts=(vals,extra)=>state('enterobacteriaceae',vals,extra);
for(const [values,grade] of [
  [['0','1','8','9','10'],'Satisfactory'],[['10','11','100','10','0'],'Acceptable'],
  [['11','11','11','0','0'],'Unsatisfactory'],[['100.000000000000001','0','1','0','10'],'Unsatisfactory'],
  [['<10','1','2','3','4'],'Enter exact'],[['1','2','3','4'],'Enter all five']
]){
  assert(e.outcome(powder,counts(values)).startsWith(grade));
}
const absent=Array(5).fill('Absent');
assert(e.outcome(powder,state('salmonella',absent)).startsWith('Satisfactory'));
assert(e.outcome(powder,state('salmonella',[...absent.slice(1),'Present'])).startsWith('Unsatisfactory'));
assert(e.outcome(powder,state('salmonella',[...absent.slice(1),'0'])).startsWith('Use the reported'));
const lm='listeria_monocytogenes',basis={microForm:'egg-02',microFormRef:'Pasteurization card'};
assert(e.outcome(powder,state(lm,Array(5).fill('100'))).startsWith('Satisfactory'));
assert(e.outcome(powder,state(lm,['100.0000000000000001','0','0','0','0'])).startsWith('Unsatisfactory'));
assert(e.outcome(liquid,state(lm,absent)).includes('applicable criterion'));
assert(e.outcome(liquid,state(lm,absent,basis)).startsWith('Satisfactory'));
assert(e.outcome(pickled,state(lm,absent)).startsWith('Satisfactory'));
assert(e.outcome(fresh,state(lm,absent)).includes('applicable criterion'));
assert(e.outcome(powder,counts(Array(5).fill('1'),{eggReport:'   '})).includes('references'));
assert(e.outcome(powder,counts(Array(5).fill('1'),{vetDate:'2010-01-01'})).includes('supported assessment date'));
for(const date of ['2026-11-27','2026-12-01']){
  const s=counts(['10','11','100','10','0']);
  const rows=p.microFormRows(null,date,s,'egg').slice(1);
  assert.equal(rows.length,18); assert.equal(new Set(rows.map(r=>r[0])).size,5);
  assert(rows.every(r=>!r[9].includes(ref)&&r[14].includes('#page=55')));
  assert.equal(rows.filter(r=>r[0]===fresh).length,1);assert(rows.find(r=>r[0]===fresh).slice(10,14).every(v=>v===''));
  const one=p.microFormRows(powder,date,s).filter(r=>r[9].includes(ref));
  assert.equal(one.length,1);assert(one[0][9].includes('Acceptable for this set.'));
  assert(p.microFormRows(liquid,date,{microForm:'egg-02'}).slice(1).every(r=>r[6]==='Evidence reference needed'&&!r[10]));
  assert(p.microFormRows(liquid,date,{microForm:'review'}).slice(1).every(r=>r[6]==='Regulatory assessment needed'&&!r[10]));
  assert.equal(p.microFormRows(liquid,date,basis).length,5);
}
console.log('Five egg identities, 18 public criteria and scope rows, five-unit report boundaries, form evidence and public export privacy verified.');
