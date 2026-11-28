import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="([a-z0-9-]+)\.js\?/g)){
  if(/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(name))vm.runInContext(fs.readFileSync(new URL(name+'.js',dir),'utf8'),ctx);
}
const v=ctx.PMSVVeterinary,p=ctx.PMSVTestingPlan;
const old='2026-11-30',next='2026-12-01',fish='09-09-2-frozen-finfish',shrimp='09-09-2-frozen-shrimp',candy='05-05-2-sugar-boiled-confectionery-hard-candy';
assert.equal(v.edition('2025-04-01'),'original');assert.equal(v.edition(old),'original');assert.equal(v.edition(next),'amended');
for(const date of ['',null,'2025-03-31','2026-04-31','2026-02-29','2026-12-1']){
  assert.equal(v.edition(date),'');assert.equal(v.current(fish,{vetDate:date}).options.length,0);
  assert(v.planRows(fish,date).every(r=>!r.limit&&r.notes.includes('valid assessment date')));
}
const state={vetSource:'Identified sample',vetUnit:'mg/kg',vetBasis:'yes',vetReport:'COA',vetValue:'0.05'};
const choose=(id,date,key,extra={})=>v.current(id,{...state,vetDate:date,vetRow:key,...extra});
assert(!choose(fish,next,'sea-2').row);assert(!choose(fish,old,'amended-sea-45').row);
assert(!v.values(fish,{...state,vetDate:next,vetRow:'sea-2'}).at(-1));
const active=choose(fish,next,'amended-sea-45');assert(active.comparison.startsWith('At or below'));assert.equal(active.row.serial,45);
assert(choose(fish,next,'amended-sea-45',{vetValue:'0.05001'}).comparison.startsWith('Above'));
assert(choose(fish,next,'amended-sea-50',{vetValue:'0.3'}).comparison.startsWith('At or below'));
assert(choose(fish,next,'amended-sea-50',{vetUnit:'mg/L'}).comparison.startsWith('Confirm'));
assert(choose(shrimp,next,'ban-2',{vetOrigin:'farmed'}).row);assert(!choose(shrimp,next,'ban-2',{vetOrigin:'wild'}).row);
assert(!choose(candy,next,'amended-sea-45').row);
assert(choose(candy,next,'amended-sea-45',{vetRole:'ingredient',vetMatrix:'finfish'}).row);
const tet=active.options.find(r=>r.drug==='Oxytetracycline'&&r.article.endsWith('— Fish')).key;
assert(choose(fish,old,tet).comparison.includes('interpretation'));assert(choose(fish,next,tet).comparison.startsWith('At or below'));
assert(choose(fish,next,'vet-1-1').comparison.includes('interpretation'));
assert(!v.indexTable('g50',old));assert(v.indexTable('g50',next).includes('272840.pdf#page=6'));assert(!v.indexTable('c1',next));
const b=p.exportRows(null,old,true),a=p.exportRows(null,next,true);
assert.equal(b.length,3737);assert.equal(a.length,3689);assert.equal(a[0].length,16);
assert.equal(new Set(a.slice(1).map(r=>r[0])).size,533);assert(a.slice(1).every(r=>r.at(-1)===next));
assert.equal(b.filter(r=>r[3]==='CTR 2.3.2(1)').length,96);assert(!a.some(r=>r[3]==='CTR 2.3.2(1)'));
const seafood=a.filter(r=>r[14].endsWith('272840.pdf#page=6')&&r[7]!=='');
assert.equal(seafood.length,48);assert.equal(new Set(seafood.map(r=>r[0])).size,24);
for(const r of seafood)assert.deepEqual([r[7],r[8]],[r[5]==='Trimethoprim'?'0.05':'0.3','mg/kg']);
assert(v.current(fish,{vetDate:next}).options.every(r=>r.clause!==1));
const otherAreas=date=>p.exportRows(fish,date).filter(r=>!p.areas.slice(2,4).includes(r[2])&&r[2]!=='Veterinary drug residues');
assert.deepEqual(otherAreas(old),otherAreas(next));
assert(p.exportRows(fish,next).filter(r=>r[2]==='Veterinary drug residues').every(r=>r[9].includes(next)));
console.log('Both veterinary editions verified across 533 products, 24 seafood identities, assessment boundaries, dated exports, source hierarchy and sampling conditions.');
