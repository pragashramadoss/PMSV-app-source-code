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
const base={sku:'Example',art:'A1',pack:'retail',batch:'01',spec:'Instruction 109',sample:'Photo',band:'short',rule:'general',
  firstKind:'packed',first:'31/01/2028',lastKind:'expiry',last:'29/02/2028',basisKind:'packed',targetKind:'expiry',duration:'1',durationUnit:'months',countRule:'elapsed',monthRule:'last'};
const review=(patch={})=>L.shelfComparison(L.model({...base,...patch}));
assert.equal(review().expected,'29/02/2028');assert.equal(review().status,'match');
assert.equal(review({first:'31/01/2027'}).expected,'28/02/2027');
assert.equal(review({monthRule:'carry'}).expected,'02/03/2028');
assert.equal(review({monthRule:'carry',countRule:'inclusive'}).expected,'01/03/2028');
assert.equal(review({first:'29/02/2028',duration:'12',band:'long'}).expected,'28/02/2029');
assert.equal(review({first:'30/11/2026',duration:'3'}).expected,'28/02/2027');
assert.equal(review({first:'01/04/2026',duration:'30',durationUnit:'days'}).expected,'01/05/2026');
assert.equal(review({first:'01/04/2026',duration:'30',durationUnit:'days',countRule:'inclusive'}).expected,'30/04/2026');
assert.equal(review({durationUnit:'days',countRule:'inclusive'}).expected,'31/01/2028');
assert.equal(review({last:'FEB 2028'}).status,'month');assert.equal(review({last:'MAR 2028'}).status,'later');
assert.equal(review({last:'JAN 2028'}).status,'earlier');assert.equal(review({last:'28/02/2028'}).status,'earlier');
assert.equal(review({lastKind:'best'}).status,'target');assert.equal(review({targetKind:'best',lastKind:'best'}).status,'match');
assert.equal(review({basisKind:'made',basisDate:'20/01/2028',basisRef:'Record M'}).expected,'20/02/2028');
assert.equal(review({first:'JAN 2028',basisDate:'31/01/2028',basisRef:'P1'}).status,'match');
assert.equal(review({first:'31/01/28',basisDate:'31/01/2028',basisRef:'P1'}).status,'match');
assert.equal(review({first:'31/01/27',basisDate:'31/01/2028',basisRef:'P1'}).status,'conflict');
assert.equal(review({basisDate:'30/01/2028',basisRef:'P1'}).status,'conflict');
assert.equal(review({band:'long'}).status,'conflict');
for(const patch of [{monthRule:''},{monthRule:'manual'},{first:'JAN 2028'},{basisKind:'made'},{spec:''},{basisDate:'31/01/28',basisRef:'P1'},
  {basisDate:'31/01/2028',basisRef:''},{countRule:''},{duration:'1e1'},{duration:'0'},{duration:'-2'},{duration:'1.5'},{duration:'9999999'},
  {durationUnit:'years'},{first:'31/12/9999'},{durationUnit:'days',first:'31/12/9999'},{pack:'nonretail'}])assert.equal(review(patch).status,'open',JSON.stringify(patch));
assert.equal(review({last:''}).expected,'29/02/2028');assert.equal(review({last:''}).status,'open');
assert.equal(review({first:'01/01/2028',monthRule:''}).expected,'01/02/2028');
assert.equal(L.shelfComparison(L.model({sku:'Earlier lot',batch:'007'})).status,'unused');
assert(Q.save(id,L.model(base)).key);
const old=L.model({sku:'Old',art:'R108',pack:'retail',batch:'007',first:'01/01/2026'});assert(Q.save(id,old).key);
const register=W.registerRows(true),row=register.find(r=>r[0]===id);
assert.equal(register[0].length,156);assert(row[149].includes('Expected 29/02/2028'));assert(!row[149].includes('007'));
assert(W.registerRows().slice(1).every(r=>r.length===156&&!r[148]&&!r[149]));
const exported=L.exportRows(id);assert(exported.every(r=>r.length===30));assert(exported.some(r=>r[28]==='29/02/2028'));
assert(W.briefLines(id).join(' ').includes('Expected 29/02/2028'));
console.log('Checked date arithmetic, month ends, comparison precision, competing date evidence, stored lots and exports.');
