const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../fssai-product-helper-preview-01/index.html'),'utf8');
const inlineStart=html.indexOf('<script>\n');
const inlineEnd=html.indexOf('</script>',inlineStart);
if(inlineStart<0||inlineEnd<0)throw Error('Main inline script missing');
test('main PMSV helper inline JavaScript parses',()=>{
 assert.doesNotThrow(()=>new vm.Script(html.slice(inlineStart+8,inlineEnd),{filename:'index-inline.js'}));
});
const between=(first,last)=>{
 const a=html.indexOf(first),b=html.indexOf(last,a);
 assert.ok(a>=0&&b>a,'Missing lookup implementation: '+first);
 return html.slice(a,b);
};
const lookup=between('const PMSV_IFCT_VARIANT_KEY=', 'function standardLookupRegulatoryCompositionHtml(){');
const render=between('function renderStandardLookupNutritionReference(){', 'function nutritionServingMl(){');
const profile=(code,name)=>({ifct_code:code,display_name:name,names:[name],source_authority:'ICMR-NIN',active_for_calculation:true,verified_fields:['energy_kcal','protein_g'],per_100g:{energy_kcal:300,protein_g:18.86,total_fat_g:999},
 ifct_table2_verified_fields:['thiamine_b1_mg'],ifct_table2_water_soluble_vitamins_per_100g:{thiamine_b1_mg:0.02,vitamin_c_total_ascorbic_acid_mg:null},
 ifct_tables:{5:{values:{CA:181,HG:null}},8:{values:{HIS:0.14}}}
});
function harness(initial){
 let selected=initial, lookupMode=true, nutritionDb={
  profiles:[profile('L003','Paneer'),profile('L004','Khoa'),profile('L001','Milk, whole, Buffalo'),profile('L002','Milk, whole, Cow')],
  ifct_table2_water_soluble_vitamins:{fields:{thiamine_b1_mg:{unit:'mg'},vitamin_c_total_ascorbic_acid_mg:{unit:'mg'}}},
  modular_ifct:{tables:{5:{title:'Minerals',fields:{CA:{label:'Calcium',unit:'mg'},HG:{label:'Mercury',unit:'µg'}}},8:{title:'Amino Acids',fields:{HIS:{label:'Histidine',unit:'g'}}}}}
 };
 const nodes={};
 for(const id of ['nutritionStandardReferenceCard','nutritionStandardRegulatory','nutritionStandardReferenceStatus','nutritionStandardReferenceTable','nutritionStandardIfctVariant'])nodes[id]={id,innerHTML:'',className:'',classList:{toggle(){}}};
 const listeners={};const storage=new Map();
 const context={
   document:{getElementById:id=>nodes[id]||null,addEventListener:(type,fn)=>{listeners[type]=fn;}},
   sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
   currentAssessmentCatalogProduct:()=>selected,
   currentProductProfile:()=>selected,
   standardLookupModeActive:()=>lookupMode,
   standardLookupRegulatoryCompositionHtml:()=>'<b>FSSAI composition remains separate</b>',
   nutritionProfileFor:name=>nutritionDb.profiles.find(p=>p.names.some(n=>n.toLowerCase()===name.toLowerCase()))||null,
   normIngredient:x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),
   esc:x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
   fmt:(n,d)=>Number(n).toFixed(Math.min(d,3)).replace(/0+$/,'').replace(/\.$/,''),
   get nutritionDb(){return nutritionDb;}
 };
 const vmContext=vm.createContext(context);
 vm.runInContext(lookup+'\n'+render,vmContext);
 const api={
   resolve:()=>vm.runInContext('standardLookupNutritionProfile()',vmContext),
   selection:()=>vm.runInContext('standardLookupNutritionSelection()',vmContext),
   render:()=>vm.runInContext('renderStandardLookupNutritionReference()',vmContext),
   select:value=>listeners.change({target:{id:'nutritionIfctExactVariantV477',value}}),
   nodes,storage,
   product:p=>{selected=p;},
   setLookup:v=>{lookupMode=v;},
   setDb:v=>{nutritionDb=v;}
 };
 return api;
}
test('Khoa maps to ICMR-NIN L004 automatically without ingredients',()=>{
 const h=harness({id:'01-01-3-khoa',name:'Khoa'});
 assert.equal(h.resolve().profile.ifct_code,'L004');
 h.render();
 assert.match(h.nodes.nutritionStandardReferenceStatus.innerHTML,/L004/);
 assert.match(h.nodes.nutritionStandardReferenceTable.innerHTML,/Protein/);
 assert.doesNotMatch(h.nodes.nutritionStandardReferenceTable.innerHTML,/999/);
 assert.match(h.nodes.nutritionStandardRegulatory.innerHTML,/FSSAI composition/);
});
test('Paneer requires exact selection from Chhana and Paneer — not ingredients',()=>{
 const h=harness({id:'01-01-6-chhana-and-paneer',name:'Chhana and Paneer'});
 assert.equal(h.resolve(),null);
 h.render();assert.match(h.nodes.nutritionStandardIfctVariant.innerHTML,/Select Paneer or Chhana/);
 h.select('paneer');assert.equal(h.resolve().profile.ifct_code,'L003');
 assert.match(h.nodes.nutritionStandardReferenceStatus.innerHTML,/L003/);
 h.select('chhana');assert.equal(h.resolve(),null);
 assert.match(h.nodes.nutritionStandardReferenceStatus.innerHTML,/No direct IFCT 2017 Chhana entry/);
});
test('Dahi never borrows milk or yoghurt values',()=>{
 const h=harness({id:'01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi',name:'Yoghurt (including Flavoured Yoghurt) and Flavoured Dahi',lookup_display_name:'Dahi'});
 assert.equal(h.resolve(),null);
 h.render();assert.match(h.nodes.nutritionStandardReferenceStatus.innerHTML,/No direct IFCT 2017 Dahi\/Curd entry/);
 assert.doesNotMatch(h.nodes.nutritionStandardReferenceTable.innerHTML,/L001|L002|L003|L004/);
});
test('Rice and unrelated standardized foods stay unmatched, no ingredient gate',()=>{
 const h=harness({id:'06-06-1-rice',name:'Rice'});
 assert.equal(h.resolve(),null);h.render();
 assert.match(h.nodes.nutritionStandardReferenceStatus.innerHTML,/No exact verified IFCT nutrition entry/);
 assert.match(h.nodes.nutritionStandardReferenceTable.innerHTML,/optional formulation calculator/);
});
test('IFCT vitamins, minerals and amino acid protein basis display correctly',()=>{
 const h=harness({id:'01-01-3-khoa',name:'Khoa'});
 h.render();const x=h.nodes.nutritionStandardReferenceTable.innerHTML;
 assert.match(x,/Water-soluble vitamins/);
 assert.match(x,/Thiamine B1/);
 assert.match(x,/Minerals/);
 assert.match(x,/Calcium/);
 assert.match(x,/Amino Acids/);
 assert.match(x,/per 100 g protein/);
 assert.doesNotMatch(x,/Mercury<\/td>/);
 assert.doesNotMatch(x,/vitamin c total ascorbic acid/i);
});
test('stale variant selections cannot leak into a different product',()=>{
 const h=harness({id:'01-01-6-chhana-and-paneer',name:'Chhana and Paneer'});
 h.select('paneer');h.product({id:'06-06-1-rice',name:'Rice'});
 assert.equal(h.resolve(),null);
});
test('no database means wait, not manufactured zero nutrition',()=>{
 const h=harness({id:'01-01-3-khoa',name:'Khoa'});
 h.setDb(null);h.render();
 assert.match(h.nodes.nutritionStandardReferenceStatus.innerHTML,/still loading/);
 assert.equal(h.nodes.nutritionStandardReferenceTable.innerHTML,'');
});
