'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../fssai-product-helper-preview-01');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const master=JSON.parse(fs.readFileSync(path.join(root,'data/product-master-v1.json'),'utf8'));
const chapter=JSON.parse(fs.readFileSync(path.join(root,'data/rules/chapter-2-4-cereals-v1.json'),'utf8'));
const products=master.catalog_products;
const begin=html.indexOf('function pmsvDirectNorm('),end=html.indexOf('async function pmsvDirectLoadStandardIndex(){',begin);
assert.ok(begin>=0&&end>begin,'Alias/scope module not found in GitHub helper');
const ctx=vm.createContext({products});
vm.runInContext(html.slice(begin,end),ctx);
const call=(func,input)=>vm.runInContext(func+'('+JSON.stringify(input)+')',ctx);
const ranked=input=>Array.from(vm.runInContext('pmsvRankedStandardCandidates(products,'+JSON.stringify(input)+',pmsvDirectScore)',ctx));
const alias=input=>call('pmsvStandardLookupAlias',input);
test('FSSAI 2.4.6(22) is a distinct official Chapter 2.4 pulse standard',()=>{
 const st=chapter.standards.find(x=>x.key==='2.4.6(22)');
 assert.ok(st,'FSSAI Pulses standard not structured');
 assert.equal(st.variants.length,2);
 assert.equal(st.variant_requirements[0].values['Pulses with seed coat'],14);
 assert.equal(st.variant_requirements[0].values['Pulses without seed coat'],12);
 assert.ok(st.general_limits.some(r=>r.parameter==='Uric acid'&&r.value===100));
 assert.match(st.source_url,/fssai\.gov\.in/);
});
test('whole, split and dehusked pulses select whole Pulses, not flour',()=>{
 for(const q of ['masur','masoor dal','urad','urd dal','moong','moong dal','chana','chana dal',
   'kabuli chana','arhar','toor dal','kulthi','field bean','dry peas','rajma','lobia','matki',
   'whole moong','dehusked moong','split masur','mixed pulses']){
  const a=alias(q),r=ranked(q);
  assert.equal(a?.productId,'06-06-1-pulses','Alias missing for '+q);
  assert.equal(r.length,1,'Unsafe extra dropdown alternatives for '+q);
  assert.equal(r[0].p.id,'06-06-1-pulses','Unexpected processed food for '+q);
  assert.match(a.routeLabel,/2\.4\.6\(22\)/);
 }
});
test('grain-only Jowar, Ragi and Bajra retain Millets and not their flours',()=>{
 for(const q of ['jowar','ragi','bajra','sorghum','finger millet']){
  const a=alias(q),r=ranked(q);
  assert.equal(a?.productId,'06-06-1-millets',q);
  assert.equal(r.length,1,q);
  assert.equal(r[0].p.id,'06-06-1-millets',q);
 }
});
test('named millet flours retain distinct standards',()=>{
 for(const [name,id] of [['jowar flour','06-06-2-jowar-flour-sorghum-flour'],
   ['ragi flour','06-06-2-ragi-flour'],['bajra flour','06-06-2-bajra-flour-pearl-millet-flour']]){
  assert.equal(alias(name)?.productId,id);
  assert.equal(ranked(name)[0]?.p.id,id);
 }
});
test('pulse flours and other processed forms never inherit whole/split-pulse standard',()=>{
 for(const q of ['masur flour','moong flour','urad powder','chana oil','rajma paste',
   'matki extract','arhar starch','toor protein powder','masur sattu','chana protein']){
  assert.equal(alias(q),null,'Unsafe pulses alias for '+q);
  assert.ok(!ranked(q).some(x=>x.p.id==='06-06-1-pulses'), 'Pulse standard leaked into '+q);
 }
});
test('Besan and Chana Sattu remain separate standardized products',()=>{
 for(const [name,id] of [['besan','06-06-2-besan'],['roasted bengal gram flour (chana sattu)','06-06-2-roasted-bengal-gram-flour-chana-sattu']]){
  assert.equal(ranked(name)[0]?.p.id,id);
 }
});
test('Soybean retains its own food identity rather than being automatically reclassified',()=>{
 assert.equal(alias('soybean'),null);
 assert.equal(ranked('soybean')[0]?.p.id,'06-06-1-soybean');
});
test('unknown pulse name must not create an invented exact food identity',()=>{
 assert.equal(alias('unknown pulse crop'),null);
});
