import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
const scripts=[...html.matchAll(/<script src="([a-z0-9-]+)\.js\?[^"]+"/g)].map(m=>m[1]).filter(n=>/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(n)).map(n=>fs.readFileSync(new URL(n+'.js',dir),'utf8'));
const db=new Map();
const storage={get length(){return db.size;},key:i=>[...db.keys()][i],getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v),removeItem:k=>db.delete(k)};
function open(store=storage){
  const c=vm.createContext({localStorage:store});c.window=c;
  for(const s of scripts)vm.runInContext(s,c);
  return {S:c.PMSVSmallPack,Q:c.PMSVIngredientPercentage,O:c.PMSVIngredientOrder,W:c.PMSVCatalogueWorksheets,R:c.PMSV_REVIEW_REGISTER};
}
const {S,Q,O,W,R}=open(),id='05-05-2-sugar-boiled-confectionery-hard-candy';
const base={sku:'Example R105',art:'Inner A1',pack:'inner',method:'visible',area:'10000',unit:'mm2',measureRef:'Spec M1',outerType:'multi',outerRef:'Retail outer A2',origin:'domestic',operator:'different',scanRef:'Decoded evidence A1'};
const m=(patch={})=>S.model({...base,...patch});
const row=(key,seen,patch={})=>S.analyse(m({seen:{[key]:seen},...patch})).rows.find(r=>r.key===key);
assert(W.available);assert.equal(R.latestRound,158);assert.equal(R.smallPackReview.products,533);assert.equal(Object.keys(S.titles).length,20);
for(const [area,unit,small,below30,text] of [['10000','mm2',true,false,'100 cm²'],['100.000000000000000001','cm2',false,false,'100.000000000000000001 cm²'],['2999.999999999999999999','mm2',true,true,'29.99999999999999999999 cm²'],['30.00','cm2',true,false,'30 cm²'],['.1','mm2',true,true,'0.001 cm²']]){
  const v=S.measurement(m({area,unit}));assert.equal(v.small,small);assert.equal(v.below30,below30);assert.equal(v.text,text);
}
for(const area of ['','0','-3','1e2','1,000','4 cm²','9'.repeat(49)])assert.equal(S.measurement(m({area})),null);
for(const method of ['panel','drawing','unknown',''])assert.equal(row('ingredients','outer',{method}).state,'open');
for(const field of ['batch','ingredients','directions','irradiated','nutrition','additives'])assert.equal(row(field,'outer').state,'seen');
for(const field of ['owner','address','expiry','made','food','allergen'])assert.equal(row(field,'outer').state,'difference');
for(const field of ['made','expiry']){
  assert.equal(row(field,'outer',{area:'2999.99'}).state,'seen');
  assert.equal(row(field,'outer',{area:'3000'}).state,'difference');
}
for(const field of ['ownerLic','siteLic','batch'])assert.equal(row(field,'outer',{outerRef:''}).state,'open');
assert.equal(row('ownerLic','outer',{measureRef:''}).state,'open');
for(const outerType of ['none','shipper','assorted'])assert.equal(row('batch','outer',{outerType}).state,'difference');
assert.equal(row('batch','outer',{outerType:'unknown'}).state,'open');
for(const pack of ['outer','retail'])assert.equal(row('logo','outer',{pack}).state,'difference');
for(const field of ['address','siteLic']){
  assert.equal(row(field,'code',{area:'200'}).state,'seen');assert.equal(row(field,'code',{scanRef:''}).state,'open');
}
for(const field of ['owner','ownerLic','logo','importer','importLic','country','expiry'])assert.equal(row(field,'code',{origin:'imported'}).state,'difference');
assert.equal(row('siteLic','missing',{operator:'same'}).state,'info');assert.equal(row('siteLic','code',{operator:'unknown'}).state,'open');
assert.equal(row('site','missing').state,'info');assert.equal(row('address','outer').state,'difference');
for(const field of ['importer','importLic','country','premises'])assert.equal(row(field,'outer').state,'info');
assert.equal(row('importer','outer',{origin:'imported'}).state,'seen');
for(const field of ['logo','ownerLic','siteLic','importLic']){
  const r=row(field,'outer',{origin:'imported'});assert.equal(r.state,'review');assert(r.text.includes('Hindi list'));
}
assert(S.sources.english.endsWith('#page=38'));assert(S.sources.hindi.endsWith('#page=16'));
assert.equal(row('country','outer',{origin:'imported'}).state,'difference');assert.equal(row('premises','outer',{origin:'imported'}).state,'info');
assert.equal(row('premises','outer',{origin:'repacked'}).state,'difference');assert.equal(row('importer','outer',{origin:''}).state,'open');
assert.equal(row('nutrition','na').state,'open');assert.equal(row('nutrition','na',{reasons:{nutrition:'Documented product provision'}}).state,'review');
assert.equal(row('batch','missing').state,'difference');assert.equal(row('owner','both').state,'seen');
assert.equal(row('logo','outer',{pack:'nonretail'}).route,'nonretail');
const check=m({seen:{logo:'outer',address:'code',expiry:'outer'}});
const save=Q.save(id,check);assert(save.key);assert(!Q.save(id,m({art:''})).key);assert(!Q.save('unknown',m()).key);
assert.equal(Q.requestRows().length,1);assert.equal(Q.exportRows(id).length,1);assert.equal(O.exportRows(id).length,1);
const legacy=Q.model({sku:check.sku,art:check.art,pack:check.pack,target:'small-pack'});
assert(Q.save(id,legacy).key);assert.equal(Q.exportRows(id).length,2);assert.equal(S.exportRows(id).length,21);
const exp=S.exportRows(id);assert(exp.every(r=>r.length===exp[0].length));assert(exp.some(r=>r.includes('Recorded through the code on this pack under 8(5).')));
const tab=open(),updated=tab.Q.save(id,m({scanRef:'Scanned second time'}),save);assert(updated.key);
assert(!Q.save(id,check,save).key);assert(Q.remove(id,{key:save.key,raw:save.raw}).includes('changed'));
const record=Q.savedByProduct().get(id).find(r=>r.m.type==='smallPack');
assert.equal(record.m.scanRef,'Scanned second time');
const full=W.registerRows(true),product=full.find(r=>r[0]===id);
assert.equal(full[0].length,156);assert.equal(product[126],1);assert.equal(product[132],0);assert.equal(product[136],1);assert(product[137].includes('Scanned second time'));assert(W.briefLines(id).join('\n').includes('Saved small-pack checks (1)'));
const blank=W.registerRows(false);assert.equal(blank.length,534);assert(blank.slice(1).every(r=>r.length===156&&r[134].includes('#page=21')&&r[135]===''&&r[136]===0&&r[137]===''));
assert(Q.save(id,m({art:'Other artwork',pack:'nonretail'})).key);const nc=S.exportRows(id).find(r=>r.includes('Non-retail container'));assert.equal(nc.length,exp[0].length);assert(nc.includes(S.sources.nonretail));
assert(Q.remove(id,record).includes('Removed'));assert.equal(S.exportRows(id).length,2);assert.equal(Q.exportRows(id).length,2);
const blocked=open({get length(){throw Error();},setItem(){throw Error();}});assert(blocked.Q.save(id,check).message.includes('session'));assert.equal(blocked.S.exportRows(id).length,21);
assert(S.section().includes(S.sources.faq34end));assert(S.section().includes(S.sources.metrology));
console.log('Verified 20 declaration routes, exact area and date boundaries, QR and importer scope, multi-unit evidence, independent artwork records, export and 533 catalogue worksheets.');
