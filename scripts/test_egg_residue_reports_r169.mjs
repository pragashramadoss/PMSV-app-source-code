import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const m=ctx.PMSVEggResidueReports,p=ctx.PMSVTestingPlan,[egg,powder]=m.groups;
const s={eggIntakeLot:'Shell lot',eggIntakeReport:'Private egg report',eggIntakeUnit:'µg/kg',eggExportHchLot:'Powder lot',eggExportHchReport:'Private powder report',eggExportHchUnit:'mg/kg'};
const check=(g,r,value,extra={})=>m.compare(g,r,{...s,[r.field]:value,...extra});
assert.deepEqual(Array.from(egg.rows,r=>[r.code,r.max]),[['cap','0.3'],['col','1'],['aoz','1'],['sem','1'],['amoz','1'],['ahd','1']]);
assert.deepEqual(Array.from(powder.rows,r=>[r.code,r.max]),[['total','0.03'],['alpha','0.02'],['beta','0.01'],['gamma','0.1']]);
for(const g of m.groups)for(const r of g.rows){
  assert.match(check(g,r,r.max),/within/);
  assert.match(check(g,r,r.max+(r.max.includes('.')?'000000001':'.000000001')),/exceeds/);
  assert.match(check(g,r,'≤'+r.max),/bound is within/);
  for(const bad of ['ND','<LOQ','<0','-1','1e-3'])assert.match(check(g,r,bad),/numerical upper bound/);
  assert.match(check(g,r,'1',{[g.report]:'  '}),/report/);
  assert.match(check(g,r,'1',{[g.unitField]:'mg\/L'}),/mass unit/);
}
assert.match(check(egg,egg.rows[0],'<0.5'),/Inconclusive/);assert.match(check(egg,egg.rows[2],'<0.5'),/bound is within/);
assert.match(check(egg,egg.rows[0],'0.0003',{eggIntakeUnit:'mg/kg'}),/within/);
const report=(t,a,b,g)=>({...s,eggExportHch_total:t,eggExportHch_alpha:a,eggExportHch_beta:b,eggExportHch_gamma:g});
assert.match(m.hchReview(report('0.03','0.02','0.01','0')),/^All four/);
assert.match(m.hchReview(report('0.06','0.005','0.005','0.05')),/Above.*all isomers/);
assert.match(m.hchReview(report('<0.03','0.02','0.01','0')),/incompatible/);
assert.match(m.hchReview(report('0.03','0.02','0.01','0.0000000000001')),/incompatible/);
assert.match(m.hchReview(report('0.03','<0.02','<0.01','<0.1')),/^All four/);
assert.match(m.hchReview(report('0.03','.01','ND','0')),/still need/);
assert.match(m.hchReview(report('0.03','.01','.005','')),/still need/);
assert.match(m.hchReview({...report('30','20','10','0'),eggExportHchUnit:'µg/kg'}),/^All four/);
for(const date of ['2026-11-28','2026-12-01']){
  const state={...report('0.06','0.005','0.005','0.05'),eggIntake_cap:'<0.5'};
  const plan=p.entries(m.id,date,state);
  assert.equal(plan.filter(r=>r.area===m.area).length,8);
  const ext=plan.filter(r=>r.area===p.scopedArea&&['HCH','Lindane (gamma-HCH)'].includes(r.parameter));
  assert.equal(ext.length,2);assert(ext.every(r=>r.notes.includes(s.eggExportHchReport)&&!r.limit&&!r.unit));
  assert.match(ext.find(r=>r.parameter==='HCH').notes,/Above the export-order reference/);
  const open=p.openProductRows(m.id,date);
  assert.equal(open.filter(r=>r[3]==='Incoming egg sample').length,6);
  assert.equal(open.filter(r=>r[4]===powder.status&&r[3]==='Export consignment').length,2);
  assert(!JSON.stringify(open).includes('Private'));
  assert(!JSON.stringify(p.entries(m.id,date)).includes('Private'));
  assert.equal(m.exportRows(m.id,state).length,11);assert(!JSON.stringify(m.exportRows(null,state)).includes('Private'));
}
assert.equal(m.planRows('eggs').length,0);assert.equal(m.exportRows('eggs').length,1);
console.log('Six incoming egg EMRLs, four export HCH thresholds, bounded results, report consistency, sample identity and private exports verified.');
