'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../fssai-product-helper-preview-01');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dairy=JSON.parse(fs.readFileSync(path.join(root,'data/rules/chapter-2-1-dairy-v1.json'),'utf8'));
const start=html.indexOf('/* FSSAI Chapter 2.1 exact dairy scope:');
const end=html.indexOf('function standardLookupRegulatoryCompositionHtml(){',start);
assert.ok(start>0&&end>start,'New exact FSSAI dairy composition renderer must be present');
const src=html.slice(start,end);
const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dahi={id:'01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi',name:'Yoghurt (including Flavoured Yoghurt) and Flavoured Dahi',fssr:'2.1.13',lookup_display_name:'Dahi',chapter_rule_variant:'Dahi'};
const butter={id:'02-02-2-butter',name:'Butter',fssr:'2.1.9'};
function runner(dbs=[dairy]){
 const context=vm.createContext({chapterRuleDbs:dbs,normIngredient:norm,esc,
  ruleDbStandards:db=>Array.isArray(db?.standards)?db.standards:[]});
 vm.runInContext(src,context);
 return product=>vm.runInContext('exactDairyCompositionHtml('+JSON.stringify(product)+')',context);
}
test('Dahi displays official FSSAI fermented-milk minimum requirements, not IFCT nutrition',()=>{
 const value=runner()(dahi);
 for(const s of ['data-pmsv-exact-dairy="2.1.13"','2.9','0.45','Milk protein','Titratable acidity','Milk fat and milk solids-not-fat']){
   assert.ok(value.includes(s),'Missing expected Dahi rule: '+s);
 }
 assert.doesNotMatch(value,/IFCT L001|IFCT L002/);
 assert.doesNotMatch(value,/Yoghurt and Flavoured Dahi<\/td>/);
});
test('Dahi without milk-class declaration displays verified mixed-milk minimum values',()=>{
 const value=runner()(dahi);
 assert.match(value,/Mixed milk — when Dahi milk class is not indicated/);
 assert.match(value,/4\.5% m\/m/);
 assert.match(value,/8\.5% m\/m/);
 assert.match(value,/FSSAI 2\.1\.2/);
});
test('Dahi culture and conditional viable-count criteria are visible',()=>{
 const value=runner()(dahi);
 assert.match(value,/Lactic acid bacteria/);
 assert.match(value,/10000000 cfu\/g/);
 assert.match(value,/1000000 cfu\/g/);
});
test('Butter shows Table and White/Cooking butter as distinct legal composition classes',()=>{
 const value=runner()(butter);
 for(const s of ['data-pmsv-exact-dairy="2.1.9"','Table butter','White butter / Cooking butter','80% m/m','76% m/m','16% m/m','2% m/m','3% m/m']){
   assert.ok(value.includes(s),'Missing Butter rule: '+s);
 }
 assert.match(value,/without indication of type, table-butter standards apply/);
 assert.match(value,/Not specified for this class/);
});
test('Butter and Dahi legal details remain inspectable even when IFCT is unavailable',()=>{
 const out=runner();
 assert.match(out(dahi),/FSSAI legal composition/);
 assert.match(out(butter),/FSSAI legal composition/);
 assert.ok(!src.includes('nutritionDb'));
 assert.ok(!src.includes('formulationIngredients'));
});
test('No cross-application to yoghurt, butter oil or unrelated products',()=>{
 const out=runner();
 assert.equal(out({...dahi,lookup_display_name:'Yoghurt',chapter_rule_variant:'Yoghurt'}),null);
 assert.equal(out({...butter,id:'02-02-1-butter-oil',fssr:'2.1.8'}),null);
 assert.equal(out({id:'06-06-1-rice',name:'Rice',fssr:'2.4.6'}),null);
});
test('Missing Chapter 2.1 returns informative loading status rather than empty composition',()=>{
 const out=runner([]);
 assert.match(out(dahi),/official Chapter 2\.1 standard data is not loaded/);
 assert.match(out(butter),/official Chapter 2\.1 standard data is not loaded/);
});
test('One failed chapter fetch cannot wipe successfully loaded FSSAI 2.1 data',()=>{
 assert.match(html,/Promise\.allSettled\(CHAPTER_RULE_URLS\.map/);
 assert.match(html,/chapterRuleDbs=results\.filter\(x=>x\.status==='fulfilled'/);
});
test('FSSAI composition details are expanded by default and displayed before optional formulation controls',()=>{
 const summary=html.indexOf('<details class="nutrition-fssai-details" open>');
 const ending=html.indexOf('id="nutritionFormulationControlsCard"');
 assert.ok(summary>0&&summary<ending);
 assert.match(html,/if\(regulatory\)regulatory\.innerHTML=standardLookupRegulatoryCompositionHtml\(\)/);
});
test('Legacy wrapper respects the exact Dahi renderer instead of overwriting it',()=>{
 const wrapper=fs.readFileSync(path.join(root,'fssai-composition-v27.js'),'utf8');
 assert.match(wrapper,/current\.includes\('data-pmsv-exact-dairy="2\.1\.13"'\)/);
});
