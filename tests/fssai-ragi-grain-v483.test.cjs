'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../fssai-product-helper-preview-01');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
const db=JSON.parse(fs.readFileSync(path.join(root,'data/product-master-v1.json'),'utf8'));
const cereals=JSON.parse(fs.readFileSync(path.join(root,'data/rules/chapter-2-4-cereals-v1.json'),'utf8'));
const catalog=db.catalog_products;
const extract=(a,b)=>{
 const first=page.indexOf(a),last=page.indexOf(b,first+a.length);
 assert.ok(first>=0&&last>first,'Missing function '+a);
 return page.slice(first,last);
};
const pmsvDirectNorm=extract('function pmsvDirectNorm(','async function pmsvDirectLoadStandardIndex(){');
const proprietaryScores=extract('function proprietarySearchTokens(','function selectedProprietaryStandardProduct(');
const clauseMatch=extract('function currentSelectedProductName(){','function currentGuardedFormulationStandards(){');
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
function runner(){
 let p=catalog.find(x=>x.id==='06-06-1-millets');
 const ctx=vm.createContext({
  productCatalog:()=>catalog, chapterRuleDbs:[cereals],
  normIngredient:norm,
  document:{getElementById:()=>({value:''})},
  selectedProductForFortification:()=>p,currentProductProfile:()=>null,
  formulationIngredients:[],qtyToKg:()=>0,
 });
 vm.runInContext(pmsvDirectNorm+proprietaryScores+clauseMatch,ctx);
 return {
  alias:s=>vm.runInContext('pmsvStandardLookupAlias('+JSON.stringify(s)+')',ctx),
  suggested:s=>vm.runInContext('proprietaryStandardCandidates('+JSON.stringify(s)+')[0].p.id',ctx),
  confidence:s=>vm.runInContext('proprietaryStandardCandidates('+JSON.stringify(s)+')[0]?.score??null',ctx),
  direct:s=>vm.runInContext('pmsvRankedStandardCandidates(productCatalog(),'+JSON.stringify(s)+',pmsvDirectScore)[0]?.p.id??null',ctx),
  product:x=>{p=catalog.find(y=>y.id===x);assert.ok(p,'Missing product '+x);},
  clauses:()=>Array.from(vm.runInContext('currentChapterStandards().map(x=>x.standard.key)',ctx))
 };
}
test('official millet standard explicitly names Ragi and has full grain limits',()=>{
 const millet=cereals.standards.find(st=>st.key==='2.4.6(23)');
 assert.ok(millet,'2.4.6(23) missing');
 assert.match(millet.definition,/Finger Millet \(Ragi or Mandua\)/);
 assert.match(millet.source_url,/fssai.gov.in/);
 assert.ok(millet.general_limits.length>=8);
 const pick=param=>millet.general_limits.find(r=>r.parameter===param);
 assert.equal(pick('Moisture — whole or dehulled millets').value,13);
 assert.equal(pick('Uric acid').value,100);
 assert.equal(pick('Weevilled grains').value,4);
});
test('Ragi, Finger Millet and Mandua route to grain; their flour variants route to flour',()=>{
 const h=runner();
 for(const word of ['ragi','ragi grain','whole ragi','finger millet','mandua']){
  assert.equal(h.alias(word).productId,'06-06-1-millets',word);
  assert.equal(h.suggested(word),'06-06-1-millets',word);
  assert.equal(h.direct(word),'06-06-1-millets',word);
 }
 for(const word of ['ragi flour','finger millet flour','mandua flour','ragi powder']){
  assert.equal(h.alias(word).productId,'06-06-2-ragi-flour',word);
  assert.equal(h.suggested(word),'06-06-2-ragi-flour',word);
  assert.equal(h.direct(word),'06-06-2-ragi-flour',word);
 }
});
test('millet grain FSSR applies both general grain rule and exact 2.4.6(23), but no flour',()=>{
 const h=runner();
 h.product('06-06-1-millets');
 assert.deepEqual(h.clauses(),['2.4.6','2.4.6(23)']);
 h.product('06-06-2-ragi-flour');
 assert.deepEqual(h.clauses(),['2.4.34']);
});
test('Ragi mapping and confirmation preserve the exact finger millet identity',()=>{
 const h=runner();
 assert.equal(h.alias('ragi').variant,'Ragi');
 assert.equal(h.alias('jowar').displayName,'Jowar');
 assert.equal(h.alias('jowar flour').displayName,'Jowar Flour (Sorghum Flour)');
 assert.match(page,/if\(exactAlias\?\.variant\)sessionStorage\.setItem\(ASSESSMENT_VARIANT_KEY,exactAlias\.variant\)/);
 assert.match(page,/const bestDisplayName=matchingAlias/);
});
test('Jowar, Bajra and all 15 official millet grain identities stay distinct from flour',()=>{
 const h=runner();
 const entries=[
  'Amaranthus','Barnyard Millet','Brown Top Millet','Buckwheat','Crab Finger Millet',
  'Finger Millet','Fonio','Foxtail Millet',"Job's Tears",'Kodo Millet',
  'Little Millet','Pearl Millet','Proso Millet','Sorghum','Teff'
 ];
 for(const term of entries){
   const a=h.alias(term);
   assert.ok(a,'Missing millet form: '+term);
   assert.equal(a.productId,'06-06-1-millets','Whole millet was misclassified: '+term);
   assert.equal(h.suggested(term),'06-06-1-millets',term);
   assert.equal(h.direct(term),'06-06-1-millets',term);
 }
 for(const [name,id] of [
   ['jowar','06-06-1-millets'],['sorghum','06-06-1-millets'],
   ['bajra','06-06-1-millets'],['bajra flour','06-06-2-bajra-flour-pearl-millet-flour'],
   ['jowar flour','06-06-2-jowar-flour-sorghum-flour'],
   ['sorghum flour','06-06-2-jowar-flour-sorghum-flour'],
   ['ragi flour','06-06-2-ragi-flour']
 ]){
   assert.equal(h.suggested(name),id,name);
   assert.equal(h.direct(name),id,name);
 }
});
test('Unverified millet-flour forms do not silently resolve to millets grain or another flour',()=>{
 const h=runner();
 for(const name of ['kodo flour','teff flour','buckwheat flour']){
   assert.equal(h.alias(name),null,'Unsupported flour alias must fail closed');
   assert.equal(h.confidence(name),null,name+' must not trigger an automatic product suggestion');
   assert.equal(h.direct(name),null,name+' must not generate an unrelated processed-form suggestion');
 }
});
test('Existing wheat, rice and actual flour routes remain intact',()=>{
 const h=runner();
 for(const [name,id] of [
  ['Wheat','06-06-1-wheat'],
  ['Rice','06-06-1-rice'],
  ['Ragi Flour','06-06-2-ragi-flour'],
  ['Millets','06-06-1-millets']]){
  assert.equal(h.suggested(name),id);
 }
});
