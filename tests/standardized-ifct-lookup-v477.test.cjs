'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const html=fs.readFileSync(path.join(__dirname,'../fssai-product-helper-preview-01/index.html'),'utf8');
function section(start,end){
 const a=html.indexOf(start), b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Expected helper section missing: '+start);
 return html.slice(a,b);
}
const resolver=section("let pmsvStandardIfctPaneerChoice='';","function standardLookupRegulatoryCompositionHtml(){");
const renderer=section("function renderStandardLookupNutritionReference(){","function nutritionServingMl(){");
const products={
 dahi:{id:'01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi',name:'Yoghurt (including Flavoured Yoghurt) and Flavoured Dahi',lookup_display_name:'Dahi',fssr:'2.1.13'},
 paneer:{id:'01-01-6-chhana-and-paneer',name:'Chhana and Paneer',fssr:'2.1.16'},
 khoa:{id:'01-01-3-khoa',name:'Khoa',fssr:'2.1.6'},
 cow:{id:'01-01-1-cow-milk',name:'Cow Milk',fssr:'2.1.2'},
 yoghurt:{id:'01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi',name:'Yoghurt (including Flavoured Yoghurt) and Flavoured Dahi',fssr:'2.1.13'}
};
const profiles=[
 {ifct_code:'L002',display_name:'Milk, whole, Cow',names:['cow milk','milk, whole, cow'],
  source_authority:'ICMR-NIN',active_for_calculation:true,verified_fields:['energy_kcal','protein_g','total_fat_g'],
  per_100g:{energy_kcal:72.897,protein_g:3.26,total_fat_g:4.48}},
 {ifct_code:'L003',display_name:'Paneer',names:['paneer'],
  source_authority:'ICMR-NIN',active_for_calculation:true,verified_fields:['energy_kcal','protein_g','total_fat_g'],
  per_100g:{energy_kcal:305.449,protein_g:18.86,total_fat_g:24.78},
  ifct_table2_verified_fields:['thiamine_b1_mg'],ifct_table2_water_soluble_vitamins_per_100g:{thiamine_b1_mg:0.02},
  ifct_table3_verified_fields:['tocopherol_alpha_mg'],ifct_table3_fat_soluble_vitamins_per_100g:{tocopherol_alpha_mg:0.02},
  ifct_tables:{5:{values:{CA:150}}}},
 {ifct_code:'L004',display_name:'Khoa',names:['khoa','khoya'],
  source_authority:'ICMR-NIN',active_for_calculation:true,verified_fields:['protein_g'],
  per_100g:{protein_g:16.34}}
];
function testPage(product){
 const nodes=new Map();
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{
   id,className:'',innerHTML:'',
   classList:{toggle(name,on){this.hidden=on;}}
  });
  return nodes.get(id);
 };
 const norm=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 const db={
  profiles,
  ifct_table2_water_soluble_vitamins:{fields:{thiamine_b1_mg:{unit:'mg'}}},
  ifct_table3_fat_soluble_vitamins:{fields:{tocopherol_alpha_mg:{unit:'mg'}}},
  modular_ifct:{tables:{5:{reference_only:false,basis:'per_100g_edible_portion',title:'Minerals',fields:{CA:{unit:'mg',label:'Calcium'}}}}}
 };
 const ctx=vm.createContext({
  nutritionDb:db,document:{getElementById:node},
  currentAssessmentCatalogProduct:()=>product,currentProductProfile:()=>null,
  standardLookupModeActive:()=>true,
  standardLookupRegulatoryCompositionHtml:()=>'<div>FSSAI legal composition</div>',
  nutritionProfileFor:name=>profiles.find(p=>p.names.some(n=>norm(n)===norm(name)))||null,
  normIngredient:norm,esc:String,fmt:(v,d)=>Number(v).toFixed(d)
 });
 vm.runInContext(resolver,ctx);
 vm.runInContext(renderer,ctx);
 return {ctx,node,run:()=>vm.runInContext('renderStandardLookupNutritionReference()',ctx),
  paneer:choice=>vm.runInContext('pmsvStandardIfctPaneerChoice='+JSON.stringify(choice),ctx)};
}
test('all real inline scripts compile without a syntax error',()=>{
 const found=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.ok(found.length>0);
 for(const m of found) assert.doesNotThrow(()=>new vm.Script(m[1]));
});
test('Dahi shows FSSAI composition but never borrows milk or estimates nutrients',()=>{
 const page=testPage(products.dahi);page.run();
 assert.match(page.node('nutritionStandardRegulatory').innerHTML,/FSSAI legal composition/);
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/Dahi\/Curd has no directly analysed entry/);
 assert.doesNotMatch(page.node('nutritionStandardReferenceTable').innerHTML,/72.897|305.449|3.26/);
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/not.*nutrition values/);
});
test('a composite Paneer-and-Chhana FSSAI standard requires actual finished-food selection',()=>{
 const page=testPage(products.paneer);page.run();
 assert.match(page.node('nutritionStandardIfctVariant').innerHTML,/Choose Paneer or Chhana/);
 assert.doesNotMatch(page.node('nutritionStandardReferenceTable').innerHTML,/18.860/);
 page.paneer('chhana');page.run();
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/Chhana has no direct IFCT/);
 assert.doesNotMatch(page.node('nutritionStandardReferenceTable').innerHTML,/18.860/);
 page.paneer('paneer');page.run();
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/L003/);
 assert.match(page.node('nutritionStandardReferenceTable').innerHTML,/18.860/);
});
test('Paneer shows vitamins and exact mineral references with no ingredients',()=>{
 const page=testPage(products.paneer);page.paneer('paneer');page.run();
 const table=page.node('nutritionStandardReferenceTable').innerHTML;
 assert.match(table,/Table 2 · water-soluble vitamins/);
 assert.match(table,/Table 3 · fat-soluble vitamins/);
 assert.match(table,/IFCT Table 5 · Minerals/);
 assert.match(table,/Calcium/);
 assert.match(table,/150.0000/);
 assert.match(table,/per 100 g/);
});
test('Khoa uses IFCT L004 automatically without an ingredient list',()=>{
 const page=testPage(products.khoa);page.run();
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/L004/);
 assert.match(page.node('nutritionStandardReferenceTable').innerHTML,/16.340/);
});
test('Cow Milk uses exact IFCT L002 data, not family-level dairy values',()=>{
 const page=testPage(products.cow);page.run();
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/L002/);
 assert.match(page.node('nutritionStandardReferenceTable').innerHTML,/3.260/);
});
test('unverified family matches show a mapped-identity gap, not invented zeroes',()=>{
 const page=testPage(products.yoghurt);page.run();
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/no verified exact IFCT/);
 assert.doesNotMatch(page.node('nutritionStandardReferenceTable').innerHTML,/72.897|18.860/);
});
test('separate formulation calculations remain optional and the official source is linked',()=>{
 const page=testPage(products.dahi);page.run();
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/optional/);
 assert.match(page.node('nutritionStandardReferenceStatus').innerHTML,/nin.res.in\/ebooks\/IFCT2017/);
 assert.match(html,/id="nutritionGoToFormulation"/);
});
