import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
global.window=global;
const directory=path.resolve(import.meta.dirname,'../fssai-helper');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
for(const name of ['catalogue-source-evidence','catalogue-rule-data','catalogue-metal-scope-data','catalogue-metal-scope','broad-contaminants','catalogue-crop-scope-data','catalogue-recipe-samples','catalogue-crop-scope','full-catalogue-533','review-status-data','catalogue-metal-panel-data','catalogue-metal-panel','catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-lot-dates','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-variant-composition','catalogue-testing-source-rows','catalogue-vending-water','catalogue-ayurveda-plan','catalogue-cocoa-mixtures','catalogue-powder-standards','catalogue-coffee','catalogue-sulphites','catalogue-additives-solvents','catalogue-testing-plan','catalogue-worksheets']){
  require(path.join(directory,name+'.js'));
}
const C=global.PMSVCropScope, D=global.PMSVCropScopeData, R=global.PMSVCatalogueRules, E=global.PMSVCatalogueEvidence;
const ids=PMSVMetalScopeData.catalogue;
const govCrop=read('ctr-original-gazette-concordance-r70-2026-11-14.json');
const govToxin=read('ctr-toxin-gazette-concordance-r72-2026-11-17.json');
const sources={ctr2020:'ctr-3',ctr2024:'ctr-2',nots2015:'ctr-16',hcn2017:'ctr-8',fish2016:'ctr-13'};
for(const [prefix,rows] of [['C',govCrop.cropRows],['N',govToxin.notsRows],['F',govToxin.fishPcbPahRows]]){
  rows.forEach((r,i)=>{
    const match=D.rows[prefix+i];
    assert.equal(match.article,r.article||r.originalArticle);assert.equal(match.limit,r.originalLimit);
    assert.equal(match.unit,r.unit||r.originalUnit);assert.equal(match.doc,sources[r.sourceId]);assert.equal(match.page,r.sourcePdfPage);
    assert(E.documents[match.doc].pages>=match.page);
  });
}
const idFor=name=>{
  const found=ids.filter(id=>R.products[id].name===name);
  assert.equal(found.length,1,name);return found[0];
};
const run=(name,key,state)=>C.decision(idFor(name),key,state);
const sample=(name,key,state,expected)=>assert.deepEqual(run(name,key,state).rows,expected);
const reached=new Set(),prods=new Set(ids);
for(const group of Object.values(D.groups)){
  assert.equal(group.length,new Set(group).size);
  assert(group.every(id=>prods.has(id)));
}
let finished=0,unknown=0,unmatched=0,namedProducts=0,priorityNamed=0;
for(const id of ids){
  const ds=C.decisions(id);
  assert.equal(ds.length,12);assert.equal(new Set(ds.map(v=>v.key)).size,12);
  assert(ds.every(v=>v.sources.length&&v.sources.every(k=>D.rows[k])));
  if(ds.some(v=>v.sample==='finished')){namedProducts++;if(!E.products[id].directCTR)priorityNamed++;}
  for(const d of ds){
    if(d.sample==='finished'){finished++;assert(d.rows.length);d.rows.forEach(k=>reached.add(k));}
    else if(d.sample==='unresolved'){unknown++;assert(d.choices.length&&d.rows.length===0);d.choices.forEach(o=>o.rows.forEach(k=>reached.add(k)));}
    else {unmatched++;assert.equal(d.sample,'unmatched');assert.equal(d.rows.length,0);}
  }
  assert.equal(C.values(id).length,C.columns().length);
  assert(!C.values(id).at(-1));assert.equal(C.positive(id).length,ds.filter(d=>d.rows.length).length);
}
assert.equal(reached.size,45);
assert.equal(finished+unknown+unmatched,6396);assert.equal(noted('namedProducts'),namedProducts);assert.equal(noted('priorityNamed'),priorityNamed);
function noted(key){return PMSV_REVIEW_REGISTER.cropArticleReview[key];}
assert.equal(noted('namedDecisions'),finished);
assert.deepEqual(C.decisions('outside-reviewed-catalogue'),[]);assert.equal(C.markup('outside-reviewed-catalogue'),'');
const candy='Sugar boiled confectionery (Hard Candy)';
for(const name of [candy,'Sugar boiled confectionery (Soft Candy)','Lozenges','Chewing gum and bubble gum'])sample(name,'hcn',{},['N5']);
sample('Cocoa Powder','hcn',{},[]);sample('Tapioca Sago','hcn',{},['N14']);sample('Arrowroot','hcn',{},[]);
sample(candy,'total',{crop_af:'composite',crop_afRef:' '},[]);sample(candy,'total',{crop_af:'spice',crop_afRef:'colour'},[]);
const candyFormula={crop_af:'composite',crop_afRef:'Formula B17 confirms almond pieces'};
sample(candy,'total',candyFormula,['C9']);sample(candy,'b1',candyFormula,['C19']);
sample('Nutmeg (Jaiphal)','total',{},['C8']);sample('Nutmeg (Jaiphal)','b1',{},['C18']);
sample('Milk Powders and Cream Powder','m1',{},[]);sample('Milk Powders and Cream Powder','m1',{crop_milk:'skim',crop_milkRef:'Grade S'},['C21']);
sample('Milk Powders and Cream Powder','m1',{crop_milk:'whole',crop_milkRef:'Grade W'},['C22']);
sample('Cow Milk','m1',{},['C20']);sample('Dairy Whitener','m1',{},[]);
assert.equal(run('Dairy Whitener','m1',{crop_milk:'wholeIn',crop_milkRef:'Ingredient lot W'}).sample,'ingredient');
sample('Coffee','ota',{},['C23']);sample('Coffee','don',{},[]);sample('Wheat bran','don',{},['C26']);sample('Wheat bran','ota',{},['C23']);
assert.equal(run('Biscuit','don',{crop_don:'input',crop_donRef:'Incoming wheat lot'}).sample,'ingredient');
sample('FRUIT JUICES','pat',{crop_apple:'apple',crop_appleRef:'Single-strength apple juice'},['C24']);
assert.equal(run('Cider','pat',{crop_apple:'input',crop_appleRef:'Incoming apple juice sample'}).sample,'ingredient');
sample('Fungi Grits and Fungi Powder','agar',{crop_mushroom:'contains',crop_mushroomRef:'Agaricus mushroom'},['N0']);
sample('Beer','hyp',{},['N7']);sample('Beer','saf',{},['N13']);
sample('Tomato Ketchup and Tomato Sauce','saf',{crop_dec:'absent',crop_decRef:'Recipe no spices'},['N10']);
assert(C.future({crop_dec:'contains',crop_decRef:'Mace in recipe'}).includes('10 ppm'));
assert(!C.future({crop_dec:'contains',crop_decRef:' '}).includes('Documented future'));
assert(C.future({crop_dec:'absent',crop_decRef:'Signed formula'}).includes('no match'));
sample('Smoked Fishery Products','pah',{},['F2']);sample('Meat sausages – Smoked','pah',{},[]);
sample('Frozen finfish','pcb',{crop_fish:'inland',crop_fishRef:'Inland fish, edible portion'},['F0']);
sample('Frozen finfish','pcb',{crop_fish:'marine',crop_fishRef:'Marine fish, edible portion'},['F1']);
assert.equal(D.rows.F2.unit,'ppb');assert.equal(D.rows.F0.unit,'ppm');assert.equal(D.rows.F1.limit,0.5);
assert(C.markup(idFor('Bean')).includes('20 ppm'));assert(!C.positive(idFor('Bean')).some(d=>d.key==='hcn'));
assert(C.brief(idFor(candy),candyFormula).some(v=>v.includes('20 µg/kg')&&v.includes('Formula B17')));
assert(C.markup(idFor(candy),{...candyFormula,crop_afRef:'<img onerror=x>'}).includes('&lt;img onerror=x&gt;'));
const csv=PMSVCatalogueWorksheets.registerRows(false);
assert.equal(csv.length,534);assert.equal(csv[0].length,72+PMSVMetalPanel.columns().length+PMSVVeterinary.columns.length+PMSVPesticides.columns.length+PMSVResiduePanel.columns.length+PMSVIngredientPercentage.columns.length+PMSVIngredientOrder.columns.length+PMSVSmallPack.columns.length+PMSVBatchSite.columns.length+PMSVDateMarking.columns.length+PMSVLotDates.columns.length+6);assert.equal(csv[0].length,new Set(csv[0]).size);
assert.equal(csv.slice(1).filter(r=>r[10].includes('Named finished-article')).length,priorityNamed);
assert(csv.slice(1).every(r=>r[15]==='No'&&r[csv[0].indexOf(PMSVVariantComposition.columns.at(-1))]===''));assert.deepEqual(csv,PMSVCatalogueWorksheets.registerRows(true));
console.log(JSON.stringify({products:533,analytes:12,sourceRows:45,namedProducts,priorityNamed,finished,unknown,unmatched}));
