import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pesticideBySource,veterinaryBySource,honeyMRPLBySource,prohibitedVetBySource} from '../fssai-helper/ctr-residue-source-anchored-r25-2026-11-04.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const r=JSON.parse(read('fssai-helper/ctr-residue-gazette-concordance-r71-2026-11-14.json'));
const raw=read(r.coreSnapshot.path),core=JSON.parse(raw);
const norm=s=>s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
assert.equal(createHash('sha256').update(raw).digest('hex'),r.coreSnapshot.sha256);
assert.equal(r.sources.ctr2018.sha256,'4e46563bc34cc1f4da630a48266aec723cdd666d448803bd965c5aa20c86fc20');
assert.equal(r.sources.ctr2024.sha256,'7f677539c1bd4adbe524e998b7e81d81f712e2d3dd6568282aae21b14ec49dd6');
assert.equal(r.sources.scope2021.sha256,'8e5043901ddfa2502b2ee3566cc19fb9a6391118a1e7b292ab9442a97718f27a');
assert.equal(r.sources.spices2024.sha256,'6d24121a58571f00206cf3f4b919e2e72e0741e9dfcd4645f8b8577f09a60b30');
assert.deepEqual(r.sources.spices2024.supersedes,['2022-04-21','2022-08-30']);
assert.equal(r.sources.ctr2024.effectiveFrom,'2025-04-01');
assert.equal(r.pesticideGroups.length,213);assert.equal(r.veterinaryGroups.length,49);
const pSeen=new Set(),cells=new Set();let pRows=0,stars=0,dollars=0,fat=0,shell=0,subgroup=0;
for(const g of r.pesticideGroups){
 const cg=core.residue_mrls.pesticides[g.serial-1];assert.equal(cg.name,g.coreName);
 assert.equal(g.sourceId,'ctr2018');assert.equal(g.rows.length,cg.rows.length);
 for(const x of g.rows){
  const key=g.serial+':'+x.coreIndex;assert(!pSeen.has(key));pSeen.add(key);pRows++;
  cells.add(x.sourcePdfPage+':'+x.sourceTableRow);
  assert(x.sourcePdfPage>=31&&x.sourcePdfPage<=51);
  const c=cg.rows[x.coreIndex];
  assert.deepEqual([x.coreArticle,x.coreLimit,x.coreUnit,x.coreCondition,x.coreSubgroup],
   [c.food,c.mrl,c.unit,c.condition||'',c.subgroup||'']);
  assert.equal(x.sourceLimit,c.mrl,'Literal/LOQ mismatch '+key);
  assert.equal(x.coreUnit,x.sourceLimit==='$'?'':'mg/kg');
  if(norm(x.sourceArticle)!==norm(c.food)){
   assert.equal(g.serial,36);
   if(x.coreIndex===3){assert.equal(x.sourceArticle,'Food grains');assert.equal(c.food,'Other food grains');}
   else if(x.coreIndex===5){assert.equal(x.sourceArticle,'Stawberry');assert.equal(c.food,'Strawberry');}
   else {assert.equal(x.coreIndex,13);assert.equal(norm(x.sourceArticle),norm(c.food+c.condition));}
  }
  stars+=Number(x.sourceLimit.endsWith('*'));dollars+=Number(x.sourceLimit==='$');
  fat+=Number(/carcass fat|fat basis|\(F\)/i.test(x.coreCondition));
  shell+=Number(/shell free/i.test(x.coreCondition));subgroup+=Number(Boolean(x.coreSubgroup));
  if(x.coreSubgroup)assert(norm(x.originalSubgroup).includes(norm(x.coreSubgroup).replace('resultingfromuse','resultingfromtheuse')));
 }
}
assert.deepEqual([pRows,cells.size,stars,dollars,fat,shell,subgroup],[1098,1070,172,27,19,10,39]);
assert.equal(pRows-dollars,1071);
assert.deepEqual(r.chemicalNameDifferences.map(x=>x.serial),[7,37,46,55,142]);
assert.equal(r.chemicalNameDifferences.reduce((sum,x)=>sum+x.affectedRows,0),24);
for(const x of r.chemicalNameDifferences){
 const g=r.pesticideGroups.find(g=>g.serial===x.serial);
 assert.notEqual(norm(x.originalName),norm(x.coreName));assert.equal(x.originalName,g.originalName);
 assert.equal(x.coreName,g.coreName);assert.equal(x.automaticAlias,false);
}
// No other chemical-name changes are silently normalized; DTC's definition
// is explicitly carried in the separately stored original source name.
for(const g of r.pesticideGroups.filter(g=>![7,37,46,55,64,142].includes(g.serial)))assert.equal(norm(g.originalName),norm(g.coreName));
assert.match(r.pesticideGroups[63].originalName,/mg\/CS2\/kg/);
const vSeen=new Set();let vRows=0,perLitre=0,locked=0;
for(const g of r.veterinaryGroups){
 const cg=core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows[g.serial-1];
 assert.equal(norm(g.originalName),norm(cg.name));assert.equal(g.rows.length,cg.rows.length);
 assert.equal(g.sourceId,'ctr2024');
 for(const x of g.rows){
  const key=g.serial+':'+x.coreIndex;assert(!vSeen.has(key));vSeen.add(key);vRows++;
  const c=cg.rows[x.coreIndex];assert(x.sourcePdfPage>=18&&x.sourcePdfPage<=27);
  assert.deepEqual([x.coreArticle,x.coreLimit,x.coreUnit,x.lockedSourceAlignment],
   [c.article,c.limit,c.unit,c.locked_source_alignment||false]);
  assert.equal(x.sourceLimit,c.limit);assert.equal(x.sourceUnit,c.unit);
  assert([norm(x.originalArticleCell),norm(x.originalPrecedingHeading+x.originalArticleCell)].includes(norm(c.article)),key);
  perLitre+=Number(x.sourceUnit==='mg/l');locked+=Number(x.lockedSourceAlignment);
 }
}
assert.deepEqual([vRows,perLitre,locked],[358,3,2]);
assert.deepEqual(r.veterinaryGroups.flatMap(g=>g.rows.filter(x=>x.lockedSourceAlignment).map(x=>[g.serial,x.originalPrecedingHeading])),[[5,'Sheep'],[7,'Cattle']]);
assert.equal(r.veterinaryGroups[6].rows.at(-1).originalDrugOverride,'Oxytetracycline');
assert.equal(r.veterinaryGroups[32].rows[0].originalArticleCell,'All edible tissues of pig');
const vet=core.antibiotic_and_pharmacological_substances;
assert.equal(r.honeyRows.length,12);assert.equal(r.prohibitedClasses.length,14);
for(const [i,x] of r.honeyRows.entries()){
 assert.deepEqual(x.coreRow,vet.honey_antibiotic_mrpl.rows[i]);
 assert.equal(norm(x.originalCells[1].replace(/^\([ab]\)\s*/,'')),norm(x.coreRow.name));
 assert.equal(x.originalCells[2].match(/^\d+(?:\.\d+)?/)[0],x.coreRow.mrpl);
 if(x.coreRow.condition)assert(x.originalCells[2].toLowerCase().includes(x.coreRow.condition.toLowerCase()));
}
for(const x of r.prohibitedClasses){
 assert.equal(x.coreName,vet.prohibited_veterinary_practice_substances.substances[x.serial-1]);
 assert.equal(norm(x.originalName.replace(/\([A-D]\)/g,'')),norm(x.coreName));
}
assert.equal(vet.prohibited_veterinary_practice_substances.default_emrl.value,'0.001');
assert.equal(vet.prohibited_veterinary_practice_substances.chloramphenicol_emrl.value,'0.0003');
assert.equal(r.reviewBoundary.numericCoreChanged,false);assert.equal(r.reviewBoundary.fullCurrentLawComplete,false);
assert.equal(r.reviewBoundary.openExactArticleDecisions,137);assert.equal(r.reviewBoundary.futureProvisionsActivated,false);

// Guard regression: a plausible low result must not erase an original-source
// ambiguity, and a nearby unambiguous row must still retain its own limit.
const base={assessmentDate:'2026-11-14',legalArticleVerified:true,actualMatrixVerified:true,
 sourceAnalyteIdentityVerified:true,methodAndResidueDefinitionVerified:true,printedConditionVerified:true,
 measured:0,unit:'mg/kg',labLOQ:0.001};
const pest=(serial,food,extra={})=>pesticideBySource(core,{...base,pesticideSerial:serial,
 pesticideName:core.residue_mrls.pesticides[serial-1].name,foodArticle:food,...extra});
for(const x of r.chemicalNameDifferences){
 const g=core.residue_mrls.pesticides[x.serial-1];
 for(const row of g.rows){const result=pest(x.serial,row.food);assert.equal(result.status,'EVIDENCE_HOLD');assert.equal(result.originalGazetteName,x.originalName);}
}
assert.equal(pest(36,'Other food grains').status,'EVIDENCE_HOLD');
assert.equal(pest(36,'Wheat').sourceLimit,0.5);assert.equal(pest(36,'Rice').sourceLimit,0.5);
for(const extra of [{},{subentryIdentityVerified:true},{subentryIdentityVerified:true,exactSourceSubentry:'Cypermethrin'},{subentryIdentityVerified:false,exactSourceSubentry:'(a) Alpha Cypermethrin'}])
 assert.equal(pest(50,'Cotton seed Oil',extra).status,'EVIDENCE_HOLD');
const alpha=pest(50,'Cotton seed Oil',{subentryIdentityVerified:true,exactSourceSubentry:'(a) Alpha Cypermethrin',measured:0.03});
assert.equal(alpha.status,'SOURCE_ROW_WITHIN');assert.equal(alpha.sourceLimit,0.05);assert.equal(alpha.sourceSubentry,'(a) Alpha Cypermethrin');
assert.equal(alpha.productApproved,false);assert.equal(alpha.fullCurrentLawComplete,false);
const ordinary=pest(50,'Cottonseed Oil',{measured:0.03});assert.equal(ordinary.status,'SOURCE_ROW_EXCEEDS');assert.equal(ordinary.sourceLimit,0.01);
assert.equal(pest(22,'Maize').status,'EVIDENCE_HOLD');assert.equal(pest(23,'Rice').status,'EVIDENCE_HOLD');
for(const serial of [5,7])assert.equal(veterinaryBySource(core,{...base,veterinarySerial:serial,
 drugName:vet.veterinary_tolerance_limits.rows[serial-1].name,foodArticle:'Muscle',speciesVerified:true,tissueAndMatrixVerified:true}).status,'EVIDENCE_HOLD');
const honey=honeyMRPLBySource(core,{assessmentDate:'2026-11-14',honeyAntibioticSerial:1,antibioticName:'Chloramphenicol',isActualHoney:true,methodAndMarkerVerified:true,unit:'ug/kg',measured:0});
assert.equal(honey.antibioticUsePermitted,false);assert.equal(honey.productApproved,false);
const prohibited=prohibitedVetBySource(core,{assessmentDate:'2026-11-14',substanceName:'Chloramphenicol',animalProductScopeConfirmed:true,methodAndMarkerVerified:true,completeMetaboliteGroupVerified:true,measured:0,unit:'mg/kg'});
assert.equal(prohibited.veterinaryUsePermitted,false);assert.equal(prohibited.sourceLimit,0.0003);

const context={window:{}};vm.createContext(context);
for(const file of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read('fssai-helper/'+file),context);
const data=JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue=JSON.parse(JSON.stringify(context.window.PMSV_CATALOGUE));
const require=createRequire(import.meta.url),api=require('../fssai-helper/review-status.js');
assert.equal(api.validateReview(data,catalogue).ok,true);assert.equal(data.latestRound,71);
assert.deepEqual(data.residueGazetteReview.findings,r.findings);
for(const mutate of [d=>delete d.residueGazetteReview,d=>d.residueGazetteReview.pesticideRows--,
 d=>d.residueGazetteReview.veterinaryRows--,d=>d.residueGazetteReview.honeyRows--,
 d=>d.residueGazetteReview.prohibitedClasses--,d=>d.residueGazetteReview.numericMismatches=1,
 d=>d.residueGazetteReview.numericRulesChanged=true,d=>d.residueGazetteReview.productApprovals=1,
 d=>d.residueGazetteReview.fullCurrentLawComplete=true,d=>d.residueGazetteReview.report='../index.html',
 d=>d.residueGazetteReview.findings.pop(),d=>d.residueGazetteReview.findings[1].id=d.residueGazetteReview.findings[0].id]){
 const bad=structuredClone(data);mutate(bad);assert.equal(api.validateReview(bad,catalogue).ok,false);
}
console.log('R71 PASS: 1098 pesticide entries, 358 veterinary entries, 12 honey rows, 14 prohibited classes, original-source scope guards and review-export integrity.');
