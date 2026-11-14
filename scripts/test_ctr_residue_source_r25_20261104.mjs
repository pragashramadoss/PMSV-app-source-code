import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pesticideBySource,veterinaryBySource,prohibitedVetBySource,honeyMRPLBySource} from '../fssai-helper/ctr-residue-source-anchored-r25-2026-11-04.mjs';
const core=JSON.parse(readFileSync('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json','utf8'));
assert.equal(core.residue_mrls.pesticides.length,213);
assert.equal(core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows.length,49);
assert.equal(core.r25_pesticide_source_symbol_conflict_gates_2026_11_04.copper_section_2_1_dollar_reference_rows,27);
assert.equal(core.r25_pesticide_source_symbol_conflict_gates_2026_11_04.pesticide_loq_star_rows,172);
assert.equal(core.r25_pesticide_source_symbol_conflict_gates_2026_11_04.dithiocarbamate_subgroup_rows,39);
let n=0;
function ck(label,fn,status){const r=fn();assert.equal(r.status,status,label);assert.equal(r.productApproved,false,label);
assert.equal(r.fullCurrentLawComplete,false,label);assert.equal(r.commercialReleaseAuthorized,false,label);
assert.notEqual(r.status,'PASS',label);n++;return r;}
const p=serial=>core.residue_mrls.pesticides.find(x=>x.serial===serial);
const v=serial=>core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows.find(x=>x.serial===serial);
const b={assessmentDate:'2026-11-04',legalArticleVerified:true,actualMatrixVerified:true,
 sourceAnalyteIdentityVerified:true,methodAndResidueDefinitionVerified:true,unit:'mg/kg',
 measured:0.04,printedConditionVerified:true};
const pest=(serial,food,opts={})=>pesticideBySource(core,{...b,pesticideSerial:serial,pesticideName:p(serial).name,foodArticle:food,...opts});
ck('known milled foodgrain source',()=>pest(114,'Milled food grains',{measured:0.5}),'SOURCE_ROW_WITHIN');
ck('known milled foodgrain exceed',()=>pest(114,'Milled food grains',{measured:1.2}),'SOURCE_ROW_EXCEEDS');
ck('invalid subtype',()=>pest(114,'Pasta'),'EVIDENCE_HOLD');
ck('unverified identity',()=>pest(114,'Milled food grains',{pesticideName:'Malathion'}),'EVIDENCE_HOLD');
ck('unverified article',()=>pest(114,'Milled food grains',{legalArticleVerified:false}),'EVIDENCE_HOLD');
ck('unlisted article no automatic 0.01',()=>pest(7,'Milled food grains'),'EVIDENCE_HOLD');
const conflict1=ck('carbaryl maize conflict',()=>pest(22,'Maize'),'EVIDENCE_HOLD');
assert.deepEqual(conflict1.competingPrintedLimits,['0.02','0.5']);
const conflict2=ck('carbendazim rice conflict',()=>pest(23,'Rice'),'EVIDENCE_HOLD');
assert.deepEqual(conflict2.competingPrintedLimits,['2.0','2*']);
const copper=ck('copper pointer',()=>pest(42,'Rice'),'EVIDENCE_HOLD');
assert.equal(copper.sourceMetalSection,'2.1');
ck('LOQ absent',()=>pest(10,'Rice'),'EVIDENCE_HOLD');
ck('LOQ too high',()=>pest(10,'Rice',{labLOQ:0.03}),'EVIDENCE_HOLD');
ck('LOQ verified exceed',()=>pest(10,'Rice',{labLOQ:0.01}),'SOURCE_ROW_EXCEEDS');
ck('LOQ exact result',()=>pest(10,'Rice',{labLOQ:0.01,measured:0.02}),'SOURCE_ROW_WITHIN');
ck('shell free missing',()=>pest(23,'Eggs',{sampleBasis:'whole-egg'}),'EVIDENCE_HOLD');
ck('shell free verified',()=>pest(23,'Eggs',{sampleBasis:'shell-free'}),'SOURCE_ROW_WITHIN');
ck('carcass fat mismatched',()=>pest(13,'Meat and Poultry',{sampleBasis:'fat'}),'EVIDENCE_HOLD');
ck('carcass fat exact',()=>pest(13,'Meat and Poultry',{sampleBasis:'carcass-fat'}),'SOURCE_ROW_WITHIN');
ck('fat exact',()=>pest(13,'Milk and Milk products',{sampleBasis:'fat'}),'SOURCE_ROW_WITHIN');
ck('fat not carcass',()=>pest(13,'Milk and Milk products',{sampleBasis:'carcass-fat'}),'EVIDENCE_HOLD');
ck('dithiocarbamates missing subgroup',()=>pest(64,'Cucumber'),'EVIDENCE_HOLD');
const sub=p(64).rows.find(r=>r.food==='Cucumber'&&r.subgroup?.startsWith('(c) Mancozeb')).subgroup;
ck('dithiocarbamates exact subgroup',()=>pest(64,'Cucumber',{subgroupIdentityVerified:true,measuredResidueExpression:'mg CS2/kg',exactSourceSubgroup:sub}),'SOURCE_ROW_WITHIN');
ck('dithiocarbamates wrong expression',()=>pest(64,'Cucumber',{subgroupIdentityVerified:true,measuredResidueExpression:'mg/kg',exactSourceSubgroup:sub}),'EVIDENCE_HOLD');
ck('dithiocarbamates wrong subgroup',()=>pest(64,'Cucumber',{subgroupIdentityVerified:true,measuredResidueExpression:'mg CS2/kg',exactSourceSubgroup:'Mancozeb'}),'EVIDENCE_HOLD');
ck('December not yet active',()=>pest(114,'Wheat',{assessmentDate:'2026-12-01'}),'EVIDENCE_HOLD');
ck('bad calendar date',()=>pest(114,'Wheat',{assessmentDate:'2026-02-30'}),'EVIDENCE_HOLD');
ck('bad unit',()=>pest(114,'Wheat',{unit:'ug/kg'}),'EVIDENCE_HOLD');
const vet={assessmentDate:'2026-11-04',veterinarySerial:1,drugName:v(1).name,
 foodArticle:'Finfish',legalArticleVerified:true,speciesVerified:true,tissueAndMatrixVerified:true,
 methodAndResidueDefinitionVerified:true,unit:'mg/kg',measured:0.04};
ck('vet finfish exact',()=>veterinaryBySource(core,vet),'SOURCE_ROW_WITHIN');
ck('vet finfish exceeds',()=>veterinaryBySource(core,{...vet,measured:0.06}),'SOURCE_ROW_EXCEEDS');
ck('vet wrong article',()=>veterinaryBySource(core,{...vet,foodArticle:'Shrimps'}),'EVIDENCE_HOLD');
ck('vet fake name',()=>veterinaryBySource(core,{...vet,drugName:'Anything'}),'EVIDENCE_HOLD');
const ban={assessmentDate:'2026-11-04',animalProductScopeConfirmed:true,methodAndMarkerVerified:true,
 completeMetaboliteGroupVerified:true,unit:'mg/kg',measured:0.0005};
ck('colistin exact',()=>prohibitedVetBySource(core,{...ban,substanceName:'Colistin'}),'SOURCE_ROW_WITHIN');
ck('arbitrary substance blocked',()=>prohibitedVetBySource(core,{...ban,substanceName:'Unlisted drug'}),'EVIDENCE_HOLD');
const chlor=ck('chloramphenicol strict EMRL',()=>prohibitedVetBySource(core,{...ban,substanceName:'Chloramphenicol'}),'SOURCE_ROW_EXCEEDS');assert.equal(chlor.sourceLimit,0.0003);
ck('prohibited marker panel required',()=>prohibitedVetBySource(core,{...ban,substanceName:'Colistin',completeMetaboliteGroupVerified:false}),'EVIDENCE_HOLD');
const honey={assessmentDate:'2026-11-04',honeyAntibioticSerial:1,antibioticName:'Chloramphenicol',
 isActualHoney:true,methodAndMarkerVerified:true,unit:'ug/kg',measured:0.4};
const h=ck('honey ignores caller MRPL',()=>honeyMRPLBySource(core,{...honey,sourceMRPL:10000}),'MISUSE_TEST_COMPARISON_ONLY');
assert.equal(h.sourceMRPL,0.3);assert.equal(h.aboveMRPL,true);assert.equal(h.antibioticUsePermitted,false);
ck('honey fake name',()=>honeyMRPLBySource(core,{...honey,antibioticName:'Other'}),'EVIDENCE_HOLD');
ck('honey unit',()=>honeyMRPLBySource(core,{...honey,unit:'mg/kg'}),'EVIDENCE_HOLD');
ck('honey group incomplete',()=>honeyMRPLBySource(core,{...honey,honeyAntibioticSerial:3,antibioticName:'Sulphonamides and its metabolites'}),'EVIDENCE_HOLD');
ck('honey group complete',()=>honeyMRPLBySource(core,{...honey,honeyAntibioticSerial:3,antibioticName:'Sulphonamides and its metabolites',completeGroupPanelVerified:true}),'MISUSE_TEST_COMPARISON_ONLY');
ck('untrusted core rejected',()=>pesticideBySource({},{}),'EVIDENCE_HOLD');
assert.equal(n,40);
console.log('R25 PASS:',n,'source-table-linked scenarios plus 5 source structure invariants; all no-product-PASS');
