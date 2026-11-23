import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const saved=new Map(), ctx=vm.createContext({localStorage:{getItem:k=>saved.get(k)}});ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of html.matchAll(/<script src="([a-z0-9-]+)\.js\?/g)){
  if(/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(name))
    vm.runInContext(fs.readFileSync(new URL(name+'.js',dir),'utf8'),ctx);
}
const W=ctx.PMSVCatalogueWorksheets,A=ctx.PMSVVariantComposition;
const [powder,mass,gum]=A.profiles.keys();
const forms=id=>A.profiles.get(id).forms;
const state=(f,extra={})=>({compVariant:f.name,...extra});
assert(W.available);assert.equal(ctx.PMSV_REVIEW_REGISTER.variantCompositionReview.products,3);
assert.equal([...A.profiles.values()].flatMap(p=>p.forms).length,7);
assert.equal([...A.profiles.values()].flatMap(p=>p.forms.flatMap(f=>f.rows)).length,40);
assert.equal(W.enabledCriteria(powder).length,0);
const butter=(id,f)=>A.enabled(id,state(f)).find(r=>r.v.spec.parameter==='Cocoa butter')?.v.spec;
const [regular,medium,low]=forms(powder);
for(const [f,n,expected] of [[regular,'20',true],[medium,'20',true],[medium,'10',true],[low,'10',true],[regular,'19.9999',false],[low,'10.000001',false]]){
  assert.equal(W.compare(butter(powder,f),n),expected);assert.equal(butter(powder,f).analytical_basis,'dry basis');
}
const [liquor,cake]=forms(mass);assert.equal(butter(mass,cake),undefined);
for(const n of ['47','60'])assert(W.compare(butter(mass,liquor),n));
assert.deepEqual(Array.from(forms(mass),f=>f.rows.find(r=>r.parameter==='Shell only').value),[1.75,4.5]);
for(const f of forms(mass)){
  assert.equal(f.rows.find(r=>r.parameter==='Shell only').analytical_basis,'alkali-free basis');
  assert.equal(f.rows.find(r=>r.parameter==='Shell and germ').analytical_basis,'fat-free dry matter');
}
for(const [index,f] of forms(gum).entries()){
  for(const sweetener of ['', 'only','other']){
    const result=A.enabled(gum,state(f,{compSweetener:sweetener}));
    assert.equal(result.length,sweetener==='other'?6:4);
    if(sweetener==='other')assert.equal(result.find(r=>r.v.spec.parameter==='Sucrose').v.spec.value,[70,60][index]);
  }
}
assert.equal(A.enabled(gum,state(regular)).length,0);
const row= A.enabled(mass,state(liquor)).find(r=>r.v.spec.parameter==='Cocoa butter');
saved.set('pmsv-fssai-worksheet-r93:'+mass,JSON.stringify(state(liquor,{criterion:row.i,result:'60.0001',unitConfirmed:'yes'})));
const ref=W.registerRows(),entered=W.registerRows(true);
assert.equal(ref.length,534);assert.equal(new Set(ref[0]).size,156);assert.equal(ref.filter(r=>r[150]).length,5);
assert(ref.slice(1).every(r=>!r[152]&&!r[153]));
assert(ref.filter(r=>A.profiles.has(r[0])).every(r=>r[151].includes('#page=')));
const reported=entered.find(r=>r[0]===mass);assert(reported[153].includes('Outside')&&reported[153].includes('60.0001%'));
assert(reported[152].includes('Liquor'));assert(W.briefLines(mass).some(l=>l.includes('60.0001%')&&l.includes('Outside')));
assert(!ref.find(r=>r[0]==='05-05-1-chocolate')[150]);
console.log('Seven forms, 40 composition rows, conditional sugar comparisons, reporting bases, export and brief verified.');
