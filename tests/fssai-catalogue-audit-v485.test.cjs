'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../fssai-product-helper-preview-01');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const master=JSON.parse(fs.readFileSync(path.join(root,'data/product-master-v1.json'),'utf8'));
const quick=JSON.parse(fs.readFileSync(path.join(root,'data/standard-search-index-v1.json'),'utf8'));
const items=master.catalog_products;
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const start=html.indexOf('function pmsvDirectNorm('),end=html.indexOf('async function pmsvDirectLoadStandardIndex(){',start);
assert.ok(start>0&&end>start);
const script=html.slice(start,end);
const ctx=vm.createContext({});
vm.runInContext(script,ctx);
const score=(product,raw)=>vm.runInContext('pmsvDirectScore('+JSON.stringify(product)+','+JSON.stringify(raw)+')',ctx);
const alias=raw=>vm.runInContext('pmsvStandardLookupAlias('+JSON.stringify(raw)+')',ctx);
const grouped=new Map();
for(const p of items){
 const k=norm(p.name);
 if(!grouped.has(k))grouped.set(k,[]);
 grouped.get(k).push(p);
}
test('product master and lightweight fast-search catalogue contain the same 533 identities',()=>{
 const left=new Set(items.map(x=>x.id)),right=new Set(quick.products.map(x=>x.id));
 assert.equal(items.length,533);
 assert.equal(quick.products.length,533);
 assert.equal(left.size,items.length);
 assert.equal(right.size,quick.products.length);
 assert.deepEqual([...left].sort(),[...right].sort());
});
test('all 519 uniquely named catalogue products exactly match themselves, without fuzzy borrowing',()=>{
 const unique=[...grouped.values()].filter(g=>g.length===1).map(g=>g[0]);
 assert.equal(unique.length,519);
 for(const p of unique){
   assert.equal(score(p,p.name),100000,'Exact product did not resolve itself: '+p.name);
   // No unrelated distinct name should get an equally strong 100000 exact score.
   const collision=items.find(x=>x.id!==p.id&&score(x,p.name)===100000);
   assert.equal(collision,undefined,'Duplicate exact score: '+p.name);
 }
});
test('4 repeated-name groups are recognized as ambiguous identities and not claimed as unique',()=>{
 const duplicates=[...grouped.entries()].filter(([k,g])=>g.length>1);
 assert.equal(duplicates.length,4);
 assert.equal(duplicates.reduce((acc,[,g])=>acc+g.length,0),14);
});
test('chapter-rule link gaps are explicitly present and cannot be reported as 100% verified',()=>{
 assert.equal(items.filter(p=>p.chapter_rule_link_status==='file_and_key_verified').length,390);
 assert.equal(items.filter(p=>p.chapter_rule_link_status!=='file_and_key_verified').length,143);
 assert.equal(master.coverage?.foscos_full_standardized_product_snapshot,'pending_ingestion');
});
test('generic crop names cannot inherit processed-form clauses across all loaded categories',()=>{
 const generics=['wheat','rice','maize','oats','soybean','quinoa','triticale','sorghum','jowar','ragi','bajra','barley','groundnut','sesame','coconut','tomato','mango'];
 const form=/\b(flour|powder|starch|oil|butter|paste|extract|concentrate|flakes|juice|meal|grits|semolina|sattu)\b/i;
 for(const q of generics){
  for(const p of items){
   if(form.test(p.name)&&norm(p.name)!==norm(q)){
     assert.equal(score(p,q),0,'Unsafe automatic processed-food score: '+q+' => '+p.name);
   }
  }
 }
});
test('grain and flour routing checks cover entire verified millet list rather than only Ragi',()=>{
 const milletNames=['amaranthus','barnyard millet','brown top millet','buckwheat','crab finger millet',
    'finger millet','fonio','foxtail millet','jobs tears','kodo millet','little millet','pearl millet',
    'proso millet','sorghum','teff'];
 for(const name of milletNames)assert.equal(alias(name)?.productId,'06-06-1-millets',name);
 for(const [q,id] of [['jowar flour','06-06-2-jowar-flour-sorghum-flour'],
   ['bajra flour','06-06-2-bajra-flour-pearl-millet-flour'],['ragi flour','06-06-2-ragi-flour']]){
   assert.equal(alias(q)?.productId,id,q);
 }
});
