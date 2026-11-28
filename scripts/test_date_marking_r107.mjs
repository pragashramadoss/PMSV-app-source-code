import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
const context=vm.createContext({});
context.window=context;
for(const [,name] of html.matchAll(/<script src="([a-z0-9-]+)\.js\?/g)){
  if(/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(name))
    vm.runInContext(fs.readFileSync(new URL(name+'.js',dir),'utf8'),context);
}
const {PMSVSmallPack:S,PMSVDateMarking:D,PMSVCatalogueWorksheets:W,PMSVIngredientPercentage:Q}=context;
const candy='05-05-2-sugar-boiled-confectionery-hard-candy',chocolate='05-05-1-chocolate';
const base={sku:'Example',art:'A107',pack:'retail',dateArticle:'candy',dateRef:'Spec version 1',dateLife:'long',dateKind:'made',seen:{made:'missing',expiry:'missing'}};
const model=(patch={})=>S.model({...base,...patch});
const row=(key,patch={},id=candy)=>S.analyse(model(patch),id).rows.find(r=>r.key===key);
assert(W.available);
assert.equal(context.PMSV_REVIEW_REGISTER.latestRound,170);
for(const group of ['wine','produce','alcohol','vinegar','candy','salt','sugar','gum'])
  assert.equal(D.expiryScope(model({dateArticle:group,dateAbv:'10'})).kind,'exempt');
assert.equal(D.expiryScope(model({dateArticle:'alcohol',dateAbv:'9.999999999999999999'})).kind,'alcoholRequired');
for(const value of ['','-1','101','1e1','10%'])assert.equal(D.expiryScope(model({dateArticle:'alcohol',dateAbv:value})).kind,'open');
assert.equal(row('expiry').state,'info');
assert.equal(row('made').state,'difference');
assert.equal(row('expiry',{dateRef:''}).state,'review');
assert.equal(row('expiry',{dateLife:'short'}).state,'review');
assert.equal(row('made',{dateLife:'short'}).state,'info');
assert.equal(row('expiry',{dateLife:'unknown'}).state,'review');
assert.equal(row('expiry',{},chocolate).state,'review');
assert.equal(row('expiry',{dateArticle:'other',seen:{expiry:'bestBefore'}},chocolate).state,'difference');
assert.equal(row('expiry',{dateArticle:'other',dateLife:'short'},chocolate).state,'difference');
const inner={pack:'inner',area:'29.99999',unit:'cm2',method:'visible',measureRef:'M1',outerType:'multi',outerRef:'Pack B',dateArticle:'other',seen:{made:'outer',expiry:'outer'}};
assert.equal(row('expiry',inner,chocolate).state,'seen');
for(const patch of [{area:'30'},{area:'100'},{outerType:'shipper'},{outerType:'none'}])
  assert.equal(row('expiry',{...inner,...patch},chocolate).state,'difference');
for(const patch of [{measureRef:''},{outerRef:''},{method:'drawing'}])
  assert.equal(row('expiry',{...inner,...patch},chocolate).state,'open');
assert.equal(row('made',{...inner,dateKind:'packed'},chocolate).state,'review');
assert.equal(row('made',{...inner,dateKind:'made'},chocolate).state,'seen');
assert.equal(row('expiry',{...inner,seen:{expiry:'pack'}},chocolate).state,'review');
assert.equal(row('expiry',{...inner,seen:{expiry:'both'},outerRef:''},chocolate).state,'open');
assert.equal(S.analyse(model({pack:'nonretail'}),candy).rows.find(r=>r.key==='expiry').route,'nonretail');
const legacy=S.model({sku:'Old',art:'R105',pack:'retail',seen:{expiry:'missing'}});
assert(Q.save(candy,legacy).key);assert(Q.save(candy,model()).key);
const group=Q.savedByProduct(),entry=S.dateValues(candy,{},group);
assert(entry[2].includes('5(10)(d)(v)'));assert(!entry[2].includes('R105'));
assert(W.briefLines(candy).join('\n').includes('Spec version 1'));
const full=W.registerRows(true),empty=W.registerRows(false);
assert.equal(full.length,534);assert.equal(full[0].length,156);
assert(empty.slice(1).every(r=>r.length===156&&r[142].includes('#page=36')&&!r[143]&&!r[144]));
assert(full.find(r=>r[0]===candy)[144].includes('Spec version 1'));
assert(S.exportRows(candy).some(r=>r.at(-1).includes('5(10)(d)(v)')));
assert.equal(Q.requestRows().length,1);
console.log('Verified date-article scope, precise ABV and area thresholds, short shelf life, both declarations, earlier artwork records and exports.');
