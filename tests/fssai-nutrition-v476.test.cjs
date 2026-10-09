const test=require('node:test');const assert=require('node:assert/strict');const api=require('../fssai-product-helper-preview-01/fssai-nutrition-v476.js');
test('FSSAI energy conversion factors',()=>{assert.equal(api.energy({carbohydrate_g:10,protein_g:5,total_fat_g:2,dietary_fibre_g:3,organic_acids_g:1,alcohol_g:0,polyols_g:2,erythritol_g:4}),91);});
test('yield concentrates nutrients on finished-product basis',()=>{const r=api.calculate({per100g:{protein_g:10,carbohydrate_g:50,total_fat_g:20,dietary_fibre_g:2},inputMassG:1000,finishedMassG:800});assert.equal(r.yield_percent,80);assert.equal(r.per100g.protein_g,12.5);assert.equal(r.per100g.carbohydrate_g,62.5);assert.equal(r.per100g.total_fat_g,25);assert.equal(r.per100g.energy_kcal,530);});
test('nutrient-specific retention can reduce process-sensitive nutrients',()=>{const r=api.calculate({per100g:{protein_g:10,carbohydrate_g:20,total_fat_g:5,dietary_fibre_g:2,vitamin_c_mg:40},inputMassG:1000,finishedMassG:800,retention:{vitamin_c_mg:0.5}});assert.equal(r.per100g.vitamin_c_mg,25);});
test('protein factors follow FSSAI defaults',()=>{assert.equal(api.proteinFromNitrogen(1),6.25);assert.equal(api.proteinFromNitrogen(1,{milk:true}),6.38);assert.equal(api.proteinFromNitrogen(1,{factor:5.7}),5.7);});
test('invalid yield and retention fail closed',()=>{assert.throws(()=>api.calculate({per100g:{protein_g:1},inputMassG:100,finishedMassG:0}));assert.throws(()=>api.calculate({per100g:{protein_g:1},inputMassG:100,finishedMassG:90,retention:{protein_g:1.2}}));});

test('FSSAI energy does not reuse source energy and includes fibre factor', () => {
  assert.equal(api.energy({carbohydrate_g:10,protein_g:5,total_fat_g:2,dietary_fibre_g:3}), 84);
});
test('finished-product yield concentrates nutrients before FSSAI energy calculation', () => {
  const r=api.calculate({per100g:{carbohydrate_g:40,protein_g:8,total_fat_g:10,dietary_fibre_g:4,energy_kcal:999},inputMassG:1000,finishedMassG:800});
  assert.equal(r.per100g.carbohydrate_g,50);
  assert.equal(r.per100g.energy_kcal,362.5);
  assert.equal(r.yield_percent,80);
});

test('organic acid aggregation excludes component oxalates and keeps FSSAI special factors',()=>{
 const fs=require('node:fs');const path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'../fssai-product-helper-preview-01/index.html'),'utf8');
 assert.match(html,/\['OXAL_TOTAL','CIS_ACONITIC','CITAC','FUMAC','MALAC','QUINIC','SUCAC','TARAC'\]/);
 assert.doesNotMatch(html,/\['OXAL_TOTAL','OXAL_SOLUBLE','OXAL_INSOLUBLE'/);
 assert.match(html,/organic\.coverage>=99\.999999/);
 assert.match(html,/specials\.alcohol_g\*scale/);
 assert.match(html,/specials\.polyols_g\*scale/);
 assert.match(html,/specials\.erythritol_g\*scale/);
});
