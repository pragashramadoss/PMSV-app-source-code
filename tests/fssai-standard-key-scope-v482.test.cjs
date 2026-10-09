'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../fssai-product-helper-preview-01');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const cereals=JSON.parse(fs.readFileSync(path.join(root,'data/rules/chapter-2-4-cereals-v1.json'),'utf8'));
const section=(start,end)=>{
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'Missing module from helper: '+start);
 return html.slice(a,b);
};
const matching=section('function currentSelectedProductName(){','function currentGuardedFormulationStandards(){');
const rows=section('function chapterRuleDisplayRows(standard){','function chapterStandardIngredientSections(standard){');
const rendering=section('function standardLookupRegulatoryCompositionHtml(){','function renderStandardLookupNutritionReference(){');
const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const products={
 wheat:{id:'06-06-1-wheat',name:'Wheat',fssr:'2.4.6',rule_key:'2.4.6'},
 rice:{id:'06-06-1-rice',name:'Rice',fssr:'2.4.6',rule_key:'2.4.6'},
 durum:{id:'06-06-1-durum-wheat',name:'Durum Wheat',fssr:'2.4.6',rule_key:'2.4.6'},
 basmati:{id:'06-06-1-basmati-rice',name:'Basmati Rice',fssr:'2.4.6',rule_key:'2.4.6'},
 frk:{id:'06-06-2-rice-flour-for-preparation-of-fortified-rice-kernel-frk',name:'Rice Flour for preparation of Fortified Rice Kernel (FRK)',fssr:'2.4.6-24(a)',rule_key:'2.4.6-24(a)'},
 atta:{id:'06-06-2-wheat-flour-atta-and-resultant-wheat-flour-resultant-atta',name:'Wheat Flour (Atta) and Resultant Wheat Flour (Resultant Atta)',fssr:'2.4.1',rule_key:'2.4.1'},
 proteinAtta:{id:'06-06-2-protein-rich-wheat-flour-protein-prachur-atta',name:'Protein rich wheat flour (Protein prachur atta)',fssr:'2.4.1(3)',rule_key:'2.4.1(3)'},
 maida:{id:'06-06-2-maida-refined-wheat-flour',name:'Maida (Refined Wheat Flour)',fssr:'2.4.2',rule_key:'2.4.2'},
 corn:{id:'07-example',name:'Corn Flakes',fssr:'2.4.8',rule_key:'2.4.8'},
};
function make(selected=products.wheat){
 let p=selected;
 const ctx=vm.createContext({
  normIngredient:norm,selectedProductForFortification:()=>p,currentProductProfile:()=>null,
  chapterRuleDbs:[cereals],ASSESSMENT_VARIANT_KEY:'pmsv_fssai_assessment_variant',
  sessionStorage:{getItem:()=>null},
  currentAssessmentCatalogProduct:()=>p,
  exactDairyCompositionHtml:()=>null,
  esc:x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
 });
 vm.runInContext(matching+'\n'+rows+'\n'+rendering,ctx);
 return {
  select:next=>{p=next;},
  codes:()=>Array.from(vm.runInContext('currentChapterStandards().map(x=>x.standard.key)',ctx)),
  render:()=>vm.runInContext('standardLookupRegulatoryCompositionHtml()',ctx),
  tokens:s=>Array.from(vm.runInContext('standardRuleKeyTokens('+JSON.stringify(s)+')',ctx))
 };
}
test('FSSAI keys are atomic: FRK does not generate general 2.4.6',()=>{
 const h=make();
 assert.deepEqual(h.tokens('2.4.6-24(a)'),['2.4.6-24(a)']);
 assert.deepEqual(h.tokens('2.4.6(24)'),['2.4.6(24)']);
 assert.deepEqual(h.tokens('2.4.1(3)'),['2.4.1(3)']);
 assert.deepEqual(h.tokens('2.4.6'),['2.4.6']);
});
test('Wheat shows only its general Food Grains chapter, not rice or FRK',()=>{
 const h=make(products.wheat);
 assert.deepEqual(h.codes(),['2.4.6']);
 const view=h.render();
 assert.match(view,/Uric acid/);
 assert.doesNotMatch(view,/Rice Flour for Preparation of Fortified Rice Kernel/);
 assert.doesNotMatch(view,/Particle size/);
 assert.doesNotMatch(view,/2\.4\.6-24\(a\)/);
 assert.doesNotMatch(view,/2\.4\.6\(24\)/);
});
test('Durum wheat shows only general grain rules and no rice-flour standards',()=>{
 const h=make(products.durum);
 assert.deepEqual(h.codes(),['2.4.6']);
 assert.doesNotMatch(h.render(),/Rice Flour/);
});
test('Rice retains Food Grains and its exact named rice overlay, not FRK',()=>{
 const h=make(products.rice);
 assert.deepEqual(h.codes(),['2.4.6','2.4.6(24)']);
 const view=h.render();
 assert.match(view,/Food Grains/);
 assert.match(view,/2\.4\.6\(24\)/);
 assert.doesNotMatch(view,/Rice Flour for Preparation of Fortified Rice Kernel/);
 assert.doesNotMatch(view,/Particle size/);
});
test('Basmati Rice does not inherit Rice-specific or FRK clauses by loose name',()=>{
 const h=make(products.basmati);
 assert.deepEqual(h.codes(),['2.4.6']);
 assert.doesNotMatch(h.render(),/Rice Flour/);
});
test('FRK rice flour receives its own specified standard but does not imply generic food grains',()=>{
 const h=make(products.frk);
 assert.deepEqual(h.codes(),['2.4.6-24(a)']);
 const view=h.render();
 assert.match(view,/Particle size/);
 assert.match(view,/Alcoholic acidity/);
 assert.match(view,/2\.4\.6-24\(a\)/);
 assert.doesNotMatch(view,/Total foreign matter/);
});
test('Atta, specialized protein-rich atta, and Maida each keep their own clause only',()=>{
 const h=make();
 for(const [p,key] of [[products.atta,'2.4.1'],[products.proteinAtta,'2.4.1(3)'],[products.maida,'2.4.2']]){
   h.select(p);
   assert.deepEqual(h.codes(),[key]);
   assert.doesNotMatch(h.render(),/Rice Flour for Preparation of Fortified Rice Kernel/);
 }
});
test('Unrelated food grain standard does not select food-grains or FRK accidentally',()=>{
 const h=make(products.corn);
 assert.deepEqual(h.codes(),['2.4.8']);
});
