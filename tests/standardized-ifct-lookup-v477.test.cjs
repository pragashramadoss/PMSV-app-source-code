'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const html=fs.readFileSync(path.join(__dirname,'../fssai-product-helper-preview-01/index.html'),'utf8');
function section(start,end){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing current PMSV source section: '+start);
 return html.slice(a,b);
}
const resolver=section("const PMSV_IFCT_VARIANT_KEY=","function standardLookupRegulatoryCompositionHtml(){");
const renderer=section("function renderStandardLookupNutritionReference(){","function nutritionServingMl(){");
const products={
 dahi:{id:'01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi',name:'Yoghurt (including Flavoured Yoghurt) and Flavoured Dahi',lookup_display_name:'Dahi',fssr:'2.1.13'},
 paneer:{id:'01-01-6-chhana-and-paneer',name:'Chhana and Paneer',fssr:'2.1.16'},
 khoa:{id:'01-01-3-khoa',name:'Khoa',fssr:'2.1.6'},
 cow:{id:'01-01-1-cow-milk',name:'Cow Milk',fssr:'2.1.2'},
 rice:{id:'06-06-1-rice',name:'Rice',fssr:'2.4.6'},
 basmati:{id:'06-06-1-basmati-rice',name:'Basmati Rice',fssr:'2.4.6'},
 yoghurt:{id:'01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi',name:'Yoghurt (including Flavoured Yoghurt) and Flavoured Dahi',fssr:'2.1.13'}
};
const profile=(code,name,values,extras={})=>({
 ifct_code:code,display_name:name,names:[name],source_authority:'ICMR-NIN',
 active_for_calculation:true,verified_fields:Object.keys(values),per_100g:values,...extras
});
const profiles=[
 profile('L002','Milk, whole, Cow',{energy_kcal:72.897,protein_g:3.26,total_fat_g:4.48}),
 profile('L003','Paneer',{energy_kcal:305.449,protein_g:18.86,total_fat_g:24.78},
  {ifct_table2_verified_fields:['thiamine_b1_mg'],ifct_table2_water_soluble_vitamins_per_100g:{thiamine_b1_mg:0.02},
   ifct_table3_verified_fields:['tocopherol_alpha_mg'],ifct_table3_fat_soluble_vitamins_per_100g:{tocopherol_alpha_mg:0.02},
   ifct_tables:{5:{values:{CA:150,HG:null}},8:{values:{HIS:0.13}}}}),
 profile('L004','Khoa',{protein_g:16.34}),
 profile('A015','Rice, raw, milled',{protein_g:7.12}),
 profile('A013','Rice, raw, brown',{protein_g:8.01}),
 profile('A014','Rice, parboiled, milled',{protein_g:7.45})
];
function testPage(product,dbLoaded=true){
 let selected=product;
 const nodes=new Map(), listeners={}, stored=new Map();
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{id,className:'',innerHTML:'',classList:{toggle(name,on){this.hidden=on;}}});
  return nodes.get(id);
 };
 const norm=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 const db={profiles,
  ifct_table2_water_soluble_vitamins:{fields:{thiamine_b1_mg:{unit:'mg'}}},
  ifct_table3_fat_soluble_vitamins:{fields:{tocopherol_alpha_mg:{unit:'mg'}}},
  modular_ifct:{tables:{
   5:{reference_only:false,basis:'per_100g_edible_portion',title:'Minerals',fields:{CA:{unit:'mg',label:'Calcium'},HG:{unit:'µg',label:'Mercury'}}},
   8:{reference_only:true,basis:'per_100g_protein',title:'Amino acids',fields:{HIS:{unit:'g',label:'Histidine'}}}
  }}
 };
 const ctx=vm.createContext({
  nutritionDb:dbLoaded?db:null,document:{getElementById:node,addEventListener:(event,fn)=>listeners[event]=fn},
  sessionStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value),removeItem:key=>stored.delete(key)},
  currentAssessmentCatalogProduct:()=>selected,currentProductProfile:()=>null,
  standardLookupModeActive:()=>true,
  standardLookupRegulatoryCompositionHtml:()=>'<div>FSSAI legal composition</div>',
  nutritionProfileFor:name=>profiles.find(p=>p.names.some(n=>norm(n)===norm(name)))||null,
  normIngredient:norm,esc:x=>String(x),fmt:(v,d)=>Number(v).toFixed(d)
 });
 vm.runInContext(resolver,ctx);vm.runInContext(renderer,ctx);
 const api={ctx,node,run:()=>vm.runInContext('renderStandardLookupNutritionReference()',ctx),
  choose:choice=>{assert.ok(listeners.change);listeners.change({target:{id:'nutritionIfctExactVariantV477',value:choice}});},
  setProduct:p=>{selected=p;},
  match:()=>vm.runInContext('standardLookupNutritionProfile()',ctx)};
 return api;
}
test('all inline helper scripts parse cleanly',()=>{
 const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.ok(blocks.length>0);for(const b of blocks)assert.doesNotThrow(()=>new vm.Script(b[1]));
});
test('Dahi shows exact absence of IFCT data and FSSAI rules remain separately visible',()=>{
 const p=testPage(products.dahi);p.run();
 assert.match(p.node('nutritionStandardRegulatory').innerHTML,/FSSAI legal composition/);
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/No direct IFCT 2017 Dahi\/Curd entry/);
 assert.doesNotMatch(p.node('nutritionStandardReferenceTable').innerHTML,/72.897|305.449|3.260/);
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/unavailable \(not zero\)/);
 assert.equal(p.node('nutritionStandardReferenceTable').innerHTML,'');
});
test('Dahi unavailability is visible even before the local IFCT JSON finishes loading',()=>{
 const p=testPage(products.dahi,false);p.run();
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/No direct IFCT 2017 Dahi\/Curd entry/);
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/unavailable, not zero/);
 assert.equal(p.node('nutritionStandardReferenceTable').innerHTML,'');
});
test('Paneer versus Chhana must be explicitly selected, never borrowed from a shared FSSAI clause',()=>{
 const p=testPage(products.paneer);p.run();
 assert.equal(p.match(),null);
 assert.match(p.node('nutritionStandardIfctVariant').innerHTML,/Select Paneer or Chhana/);
 p.choose('chhana');assert.equal(p.match(),null);
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/No direct IFCT 2017 Chhana entry/);
 p.choose('paneer');assert.equal(p.match().profile.ifct_code,'L003');
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/L003/);
 assert.match(p.node('nutritionStandardReferenceTable').innerHTML,/18.860/);
});
test('Paneer automatically displays official verified vitamins, minerals and protein-basis amino acids',()=>{
 const p=testPage(products.paneer);p.choose('paneer');p.run();
 const table=p.node('nutritionStandardReferenceTable').innerHTML;
 assert.match(table,/Water-soluble vitamins/);assert.match(table,/Thiamine B1/);
 assert.match(table,/Fat-soluble vitamins/);assert.match(table,/Minerals/);
 assert.match(table,/Calcium/);assert.match(table,/150.000/);
 assert.match(table,/per 100 g protein/);
 assert.doesNotMatch(table,/Mercury<\/td>/);
});
test('Khoa and cow milk resolve to their distinct exact ICMR-NIN identities without a formulation',()=>{
 const khoa=testPage(products.khoa);khoa.run();assert.equal(khoa.match().profile.ifct_code,'L004');
 assert.match(khoa.node('nutritionStandardReferenceTable').innerHTML,/16.340/);
 const cow=testPage(products.cow);cow.run();assert.equal(cow.match().profile.ifct_code,'L002');
 assert.match(cow.node('nutritionStandardReferenceTable').innerHTML,/3.260/);
});
test('Generic Rice needs manual selection of the analysed IFCT milling/parboiling form',()=>{
 const p=testPage(products.rice);p.run();
 assert.equal(p.match(),null);
 const ui=p.node('nutritionStandardIfctVariant').innerHTML;
 assert.match(ui,/A015/);assert.match(ui,/A013/);assert.match(ui,/A014/);
 p.choose('A015');assert.equal(p.match().profile.ifct_code,'A015');
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/A015/);
 p.choose('A013');assert.equal(p.match().profile.ifct_code,'A013');
 p.choose('A014');assert.equal(p.match().profile.ifct_code,'A014');
});
test('Generic rice option is never used as an unverified Basmati Rice reference',()=>{
 const p=testPage(products.rice);p.choose('A015');p.setProduct(products.basmati);
 assert.equal(p.match(),null);p.run();
 assert.doesNotMatch(p.node('nutritionStandardReferenceStatus').innerHTML,/A015/);
});
test('Related dairy category does not inherit nutrient values from whole milk',()=>{
 const p=testPage(products.yoghurt);p.run();assert.equal(p.match(),null);
 assert.doesNotMatch(p.node('nutritionStandardReferenceTable').innerHTML,/72.897|18.860/);
});
test('Standard reference is independent of ingredients, optional recipe calculator stays linked',()=>{
 const p=testPage(products.dahi);p.run();
 assert.match(html,/id="nutritionGoToFormulation"/);
 assert.match(p.node('nutritionStandardReferenceStatus').innerHTML,/nin.res.in\/ebooks\/IFCT2017/);
 assert.ok(!resolver.includes('formulationIngredients'));
});
test('IFCT status/table stay above the collapsible FSSAI legal composition in real UI',()=>{
 const a=html.indexOf('id="nutritionStandardReferenceStatus"'),b=html.indexOf('id="nutritionStandardReferenceTable"'),
  d=html.indexOf('class="nutrition-fssai-details"'),e=html.indexOf('id="nutritionStandardRegulatory"');
 assert.ok(a>0&&b>a&&d>b&&e>d);
 assert.match(html,/<details class="nutrition-fssai-details" open><summary>/);
 assert.doesNotMatch(html, /The FSSAI legal composition above is available/);
});
