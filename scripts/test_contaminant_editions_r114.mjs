import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
for(const [,name] of fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="([a-z0-9-]+)\.js\?/g)){
  if(/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(name))vm.runInContext(fs.readFileSync(new URL(name+'.js',dir),'utf8'),ctx);
}
const p=ctx.PMSVTestingPlan,old='2026-11-30',next='2026-12-01',oil='02-02-1-fish-oil',besan='06-06-2-besan',ketchup='12-12-6-tomato-ketchup-and-tomato-sauce';
const row=(id,area,param,date=next,state={})=>p.entries(id,date,state).find(r=>r.area===p.areas[area]&&r.parameter===param);
const sauce=ctx.PMSV_CATALOGUE.find(x=>x.id.includes('tomato-ketchup')||x.id===ketchup).id;
assert.equal(row(besan,2,'Lead',old).limit,'2.5 ppm');
for(const id of ctx.PMSVMetalPanelData.groups.plainPulseFlour){
  for(const [metal,limit] of [['Lead','0.2'],['Cadmium','0.1']]){
    const r=row(id,2,metal);assert.equal(r.limit,limit);assert.equal(r.unit,'ppm');assert(r.source.includes('272840.pdf#page=4'));assert(r.form.includes('pulse flours'));
  }
}
assert(!row('06-06-2-solvent-extract-soya-flour',2,'Cadmium').limit);
assert(row('18-18-1-pulses-based-sweets',2,'Cadmium').limit!=='0.1');
assert.equal(row(oil,2,'Inorganic arsenic').limit,'0.1');assert(!row(oil,2,'Inorganic arsenic',old));
for(const [n,msg] of [['0.099999999999999999','Below'],['0.1000','Exactly'],['0.100000000000000001','Above'],['<0.1','Below'],['-1','non-negative']])assert(p.fishOilScreen(n).includes(msg));
for(const [a,max] of [['Total aflatoxins','15'],['Aflatoxin B1','10']]){
  assert.equal(row('02-02-1-refined-grapeseed-oil',3,a).limit,max);
  assert.equal(row('02-02-2-table-margarine',3,a).limit,'');
  assert.equal(row('fssai-2-16-hemp-seed',3,a,next,{crop_af:'oil',crop_afRef:'Seed spec 114'}).limit,max);
  assert.equal(row('02-02-2-fat-spread',3,a,next,{crop_af:'composite',crop_afRef:'Blend 114'}).limit,a==='Aflatoxin B1'?'10':'20');
}
const r=row(sauce,3,'Saffrole',old);assert(r.limit.includes('10'));
for(const id of [sauce,'05-05-2-sugar-boiled-confectionery-hard-candy','12-12-2-nutmeg-jaiphal']){
  assert.equal(row(id,3,'Saffrole').limit,'');assert.equal(row(id,3,'Saffrole',next,{crop_dec:'contains',crop_decRef:' '}).limit,'');
  const yes=row(id,3,'Saffrole',next,{crop_dec:'contains',crop_decRef:'Signed recipe 114'});
  assert.equal(yes.limit,'10');assert.equal(yes.unit,'ppm');assert(yes.notes.includes('Signed recipe 114'));
  assert(row(id,3,'Saffrole',next,{crop_dec:'absent',crop_decRef:'Recipe 114'}).status.includes('outside'));
}
const bulk=p.exportRows(null,next),baseline=p.exportRows();
assert.equal(baseline.length,26308);assert.equal(bulk.length,26260);assert.equal(new Set(bulk.slice(1).map(r=>r[0])).size,533);
assert.equal(bulk.filter(r=>r[2]===p.areas[3]&&r[5]==='Saffrole'&&!r[7]&&r[14].includes('272840.pdf#page=5')).length,533);
assert.equal(bulk.filter(r=>r[2]===p.areas[2]&&r[5]==='Inorganic arsenic').length,1);
for(const a of [0,1,4])assert.deepEqual(baseline.filter(r=>r[2]===p.areas[a]),bulk.filter(r=>r[2]===p.areas[a]));
for(const bad of ['','2026-02-30','2026-11-19'])assert(!p.entries(besan,bad).some(r=>r.area===p.areas[2]&&r.limit));
console.log('Both editions checked for 533 products, with food-specific metals, arsenic screening, oils, composite foods, saffrole evidence and scope by date.');
