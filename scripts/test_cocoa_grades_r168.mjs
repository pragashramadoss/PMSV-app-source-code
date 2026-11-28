import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
ctx.PMSVCulinarySauces=createRequire(import.meta.url)('../fssai-helper/culinary-sauces.js');
const g=ctx.PMSVCocoaGrades,p=ctx.PMSVTestingPlan;
const s={gradeLot:'Private L',gradeSpec:'Private S',gradeReport:'Private report'};
assert.deepEqual(Array.from(g.criteria,r=>[r.direction,r.I,r.II]),[['maximum',3,4],['maximum',3,8],['maximum',3,6],['maximum',7.5,7.5],['minimum',100,90],['minimum',80,70]]);
for(const r of g.criteria){
  for(const [grade,pos] of [['I',13],['II',14]]){
    const form={...s,[r.field]:String(r[grade])};
    const read=x=>g.exportRows(g.beans,x).find(x=>x[1]===r.name)[pos];
    assert(read(form).startsWith('Meets'));
    const outside=r.direction==='minimum'?String(r[grade]-0.01):String(r[grade])+(String(r[grade]).includes('.')?'0000001':'.0000001');
    assert(read({...form,[r.field]:outside}).startsWith('Outside'));
    assert.equal(read({...form,[r.field]:'<4'}),'Check value and unit');
    assert.equal(read({...form,[r.field]:r.field==='gradeWeight'?'0':'100.1'}),'Check value and unit');
    assert.match(read({...form,gradeLot:''}),/Enter lot/);
  }
}
assert.match(g.comparisons(g.criteria[4],{...s,gradeWeight:'95'}),/Grade I: Outside minimum · Grade II: Meets minimum/);
assert(!JSON.stringify(g.exportRows(null,s)).includes(s.gradeLot));
assert.equal(g.planRows('05-05-1-chocolate').length,0);
for(const date of ['2026-11-28','2026-12-01']){
  const open=p.openProductRows(null,date).slice(1);
  const metal=open.filter(r=>r[4]==='Common CTR maximum; exact article open');
  assert.equal(metal.length,9);assert.equal(metal.filter(r=>r[6]==='Tin'&&r[7]==='250'&&r[8]==='ppm').length,8);
  assert(metal.every(r=>r[6]==='Tin'?r[9].includes('Canned foods other than beverages'):r[0]==='coffee-chicory-mixture'&&r[6]==='Copper'&&r[7]==='30'));
  assert(!metal.some(r=>['purified-vending-water',p.routeIds.enzyme].includes(r[0])));
  for(const id of g.products){
    const rows=p.entries(id,date,{...s,gradeWeight:'95'}).filter(r=>r.area===g.area);
    assert.equal(rows.length,6);assert(rows.every(r=>r.limit===''&&r.unit===''&&r.source===g.source));
    assert.equal(rows.filter(r=>r.notes.includes(s.gradeReport)).length,1);
    if(id===g.mass)assert(rows.every(r=>r.form.includes('incoming whole')));
  }
}
console.log('Cocoa grade thresholds, measurement bases, private lot details and nine common CTR comparisons verified.');
