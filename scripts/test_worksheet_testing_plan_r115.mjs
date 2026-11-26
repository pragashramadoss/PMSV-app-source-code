import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const template=fs.readFileSync(new URL('index.html',dir),'utf8');
const modules=[...template.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)]
  .map(([,file])=>fs.readFileSync(new URL(file,dir),'utf8'));
const store=new Map();
const localStorage={get length(){return store.size;},key:i=>[...store.keys()][i],getItem:k=>store.get(k)??null,
  setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
function load(){
  const ctx=vm.createContext({localStorage});ctx.window=ctx;
  for(const code of modules)vm.runInContext(code,ctx);
  assert(ctx.PMSVCatalogueWorksheets.available);return ctx;
}
const ctx=load(),plan=ctx.PMSVTestingPlan,worksheet=ctx.PMSVCatalogueWorksheets,pesticides=ctx.PMSVResiduePanel;
assert.equal(ctx.PMSV_REVIEW_REGISTER.worksheetPlanEvidenceReview.products,533);
const candy='05-05-2-sugar-boiled-confectionery-hard-candy',fish='09-09-2-frozen-finfish';
const current='2026-11-22',next='2026-12-01',formula={crop_af:'composite',crop_afRef:'QA-115 recipe with almond pieces'};
const screen=(id,param,date,state)=>plan.entries(id,date,state).find(r=>r.parameter===param);
for(const date of [current,next]){
  for(const [param,limit] of [['Total aflatoxins','20'],['Aflatoxin B1','10']]){
    const r=screen(candy,param,date,formula);
    assert(r.notes.includes(formula.crop_afRef));assert(r.limit.includes(limit+' µg/kg'));assert.equal(r.form,'Finished product');
    assert(!screen(candy,param,date,{...formula,crop_afRef:' '}).limit);
  }
  const milk=screen('01-01-5-dairy-whitener','Aflatoxin M1',date,{crop_milk:'wholeIn',crop_milkRef:'QA-115 ingredient milk lot'});
  assert.equal(milk.form,'Separately sampled ingredient');assert(milk.notes.includes('ingredient milk lot'));
  const juice=screen(ctx.PMSV_CATALOGUE[3].id,'Lead',date,{panel_Pb:'Pb73',panel_PbRef:'QA-115 juice specification'});
  assert.equal(juice.status,'Source interpretation open');assert(!juice.limit);
  const gluten=screen(ctx.PMSV_CATALOGUE[240].id,'Lead',date,{panel_Pb:'Pb35',panel_PbRef:'QA-115 hydrolysed wheat protein'});
  assert(gluten.limit&&gluten.notes.includes('QA-115 hydrolysed wheat protein'));
}
const margarine='02-02-2-table-margarine';
for(const param of ['Total aflatoxins','Aflatoxin B1']){
  const outside=screen(margarine,param,next,{crop_af:'outside',crop_afRef:'QA-115 reviewed composition'});
  assert(!outside.limit);assert(outside.notes.includes('QA-115 reviewed composition'));
  const pending=screen(margarine,param,next,{crop_af:'oil',crop_afRef:'QA-115 legacy oil selection'});
  assert(!pending.limit);assert(pending.notes.includes('QA-115 legacy oil selection'));
}
const saffrole=screen(candy,'Saffrole',next,{crop_saf:'contains',crop_safRef:'Older reference'});
assert(!saffrole.limit&&!saffrole.notes.includes('Older reference'));
for(const [id,profile] of ctx.PMSVVariantComposition.profiles){
  for(const form of profile.forms){
    for(const sweetener of ['only','other','']){
      const rows=plan.entries(id,current,{compVariant:form.name,compSweetener:sweetener}).filter(r=>r.area===plan.areas[0]&&r.form===form.name);
      assert.equal(rows.length,form.rows.length);
      assert(!plan.entries(id,current,{compVariant:form.name}).some(r=>profile.forms.some(f=>f!==form&&r.form===f.name)));
      for(const [i,r] of rows.entries())assert.equal(!!r.limit,!ctx.PMSVVariantComposition.applicability(form.rows[i],sweetener));
    }
  }
}
const vet={vetDate:next,vetSource:'QA-115 fish lot',vetRow:'amended-sea-45',vetReport:'QA-115 veterinary report',vetValue:'0.05',vetUnit:'mg/kg',vetBasis:'yes'};
const veterinary=(id,date,state)=>plan.entries(id,date,state).find(r=>r.status==='Recorded veterinary laboratory result');
assert(veterinary(fish,next,vet).notes.includes('At or below'));
assert(veterinary(fish,next,{...vet,vetValue:'0.0500000000001'}).notes.includes('Above'));
assert(veterinary(fish,next,{...vet,vetUnit:'mg/L'}).notes.includes('use the printed unit'));
assert(!veterinary(fish,current,vet));assert(!veterinary(fish,next,{...vet,vetReport:''}));
assert(!veterinary(candy,next,vet));assert(veterinary(candy,next,{...vet,vetRole:'ingredient',vetMatrix:'finfish'}).form.includes('ingredient'));

const cane={pestRole:'ingredient',pestMatrix:'cane',pestProcess:'raw',pestSample:'QA-115 cane sample',pestRow:'1-0',pestReport:'QA-115 COA, "A"',
  pestKind:'less',pestValue:'0.06',pestUnit:'mg/kg',pestBasis:'yes'};
pesticides.save(candy,cane,'gazette');pesticides.save(candy,cane,'gazette');
const eo={spRole:'ingredient',spArticle:'cinnamon',spProcess:'physical',spSample:'QA-115 spice',spAnalyte:'eto',spReport:'QA-115 EO report',
  eoMarket:'india',eoTreatment:'unknown',eoMethod:'QA-115 method',eoFormat:'combined',eoConfirmed:'yes',eoSumKind:'quantified',eoSumValue:'32',eoSumUnit:'µg/kg'};
pesticides.save(candy,eo,'eo');assert.equal(pesticides.records(candy).length,2);
for(const date of [current,next]){
  const result=plan.exportRows(candy,date,false,formula);
  const line=result.find(r=>r[6]==='Recorded pesticide laboratory result');
  assert(line[4].startsWith('Separately sampled ingredient'));assert(line[9].includes(cane.pestReport));assert(line[9].includes('Inconclusive'));
  const pair=result.find(r=>r[6]==='Recorded EO and 2-CE laboratory result');assert.equal(pair[7],'');assert.equal(pair[8],'');
  assert(pair[9].includes(eo.spReport)&&pair[9].includes('0.032'));
  assert(!plan.exportRows(fish,date,false,{}).some(r=>r[9].includes(cane.pestSample)));
  const bulk=plan.exportRows(null,date,false,formula);
  let offset=1;
  for(const p of ctx.PMSV_CATALOGUE){
    const generic=plan.exportRows(p.id,date).slice(1);
    assert.deepEqual(bulk.slice(offset,offset+generic.length),generic);offset+=generic.length;
  }
  assert.equal(offset,bulk.length);assert.equal(offset,date===current?25633:25585);assert(!bulk.some(row=>row.join(' ').includes('QA-115')));
}
localStorage.setItem('pmsv-fssai-worksheet-r93:'+candy,JSON.stringify({...formula,vetDate:next}));
const restored=load();const rows=restored.PMSVCatalogueWorksheets.productPlan(candy);
assert(rows.some(r=>r[9].includes(cane.pestReport)));assert(rows.some(r=>r[9].includes(formula.crop_afRef)));
const [first]=restored.PMSVResiduePanel.records(candy).find(([,r])=>r.report===cane.pestReport);
restored.PMSVResiduePanel.remove(candy,first);assert(!restored.PMSVCatalogueWorksheets.productPlan(candy).some(r=>r[9].includes(cane.pestReport)));
assert(restored.PMSVCatalogueWorksheets.productPlan(candy).some(r=>r[9].includes(eo.spReport)));
console.log('Verified selected product variants, evidence scope, date changes, report persistence and isolation of all 533 products across both editions.');
