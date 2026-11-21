import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {veterinaryBySource} from '../fssai-helper/ctr-residue-source-anchored-r25-2026-11-04.mjs';

const core=JSON.parse(readFileSync('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json','utf8'));
const veterinary=core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows;
let cases=0;
const assertSafe=(result,status)=>{
 assert.equal(result.status,status);
 assert.equal(result.productApproved,false);
 assert.equal(result.fullCurrentLawComplete,false);
 assert.equal(result.commercialReleaseAuthorized,false);
 assert.notEqual(result.status,'PASS');
 cases++;
 return result;
};
const sample=(serial,article,extra={})=>{
 const entry=veterinary.find(x=>x.serial===serial);
 assert(entry);
 return veterinaryBySource(core,{
  assessmentDate:'2026-11-04',veterinarySerial:serial,drugName:entry.name,
  foodArticle:article,legalArticleVerified:true,speciesVerified:true,
  tissueAndMatrixVerified:true,methodAndResidueDefinitionVerified:true,
  unit:'mg/kg',measured:0.01,...extra
 });
};
assert.equal(veterinary.length,49);
assert.equal(veterinary.reduce((s,v)=>s+v.rows.length,0),358);

// The three exceptions are cattle-milk concentration limits by VOLUME.
for(const [serial,limit] of [[8,0.1],[21,0.2],[35,0.2]]){
 const source=veterinary.find(x=>x.serial===serial).rows.find(x=>x.article==='Cattle — Milk');
 assert.equal(source.unit,'mg/l');
 assert.equal(Number(source.limit),limit);
 const good={unit:'mg/L',sampleBasis:'liquid-cattle-milk'};
 const within=assertSafe(sample(serial,'Cattle — Milk',{...good,measured:limit}),'SOURCE_ROW_WITHIN');
 assert.equal(within.sourceLimit,limit);
 assert.equal(within.sourcePrintedUnit,'mg/l');
 assert.equal(within.unit,'mg/L');
 assertSafe(sample(serial,'Cattle — Milk',{...good,measured:limit+0.01}),'SOURCE_ROW_EXCEEDS');
 assertSafe(sample(serial,'Cattle — Milk',{...good,measured:limit-0.01}),'SOURCE_ROW_WITHIN');
 assertSafe(sample(serial,'Cattle — Milk',{...good,unit:'mg/kg'}),'EVIDENCE_HOLD');
 assertSafe(sample(serial,'Cattle — Milk',{...good,sampleBasis:'milk-powder'}),'EVIDENCE_HOLD');
 assertSafe(sample(serial,'Cattle — Milk',{unit:'mg/L',measured:0.02}),'EVIDENCE_HOLD');
 assertSafe(sample(serial,'Cattle — Milk',{...good,measured:-0.1}),'EVIDENCE_HOLD');
 assertSafe(sample(serial,'Cattle — Milk',{...good,measured:'0.01'}),'EVIDENCE_HOLD');
 assertSafe(sample(serial,'Cattle — Milk',{...good,speciesVerified:false}),'EVIDENCE_HOLD');
}
// The source records two species-unaligned orphan "Muscle" rows.
for(const serial of [5,7]){
 const entry=veterinary.find(x=>x.serial===serial);
 const row=entry.rows.find(x=>x.article==='Muscle'&&x.locked_source_alignment===true);
 assert(row,'missing locked row '+serial);
 const blocked=assertSafe(sample(serial,'Muscle',{measured:0.001}),'EVIDENCE_HOLD');
 assert.match(blocked.reason,/species\/tissue alignment/);
}
// Version IX 2.3.2(1) seafood 0.1 mg/kg vs 2.3.2(4) 0.2 mg/kg.
for(const article of ['Oxytetracycline — Fish','Giant prawn (Paeneusmonodon) — muscle']){
 const entry=veterinary.find(x=>x.serial===7);
 assert.equal(entry.rows.find(x=>x.article===article).limit,'0.2');
 const blocked=assertSafe(sample(7,article,{measured:0.12}),'EVIDENCE_HOLD');
 assert.deepEqual(blocked.conflictingSourceLimitsMgKg,[0.1,0.2]);
}
// Unaffected veterinary source rows retain exact mg/kg comparisons.
assertSafe(sample(8,'Cattle — Muscle',{measured:1.0}),'SOURCE_ROW_WITHIN');
assertSafe(sample(8,'Cattle — Muscle',{measured:1.001}),'SOURCE_ROW_EXCEEDS');
assertSafe(sample(5,'Pig — Kidney',{measured:0.05}),'SOURCE_ROW_WITHIN');
assertSafe(sample(5,'Pig — Kidney',{measured:0.051}),'SOURCE_ROW_EXCEEDS');
assertSafe(sample(8,'Cattle — Muscle',{measured:0.2,unit:'mg/L'}),'EVIDENCE_HOLD');
assertSafe(sample(8,'Cattle — Milk',{measured:0.09,unit:'mg/L',sampleBasis:'liquid-cattle-milk',assessmentDate:'2026-12-01'}),'EVIDENCE_HOLD');
assertSafe(sample(8,'Cattle — Milk',{measured:0.09,unit:'mg/L',sampleBasis:'liquid-cattle-milk',assessmentDate:'2026-02-30'}),'EVIDENCE_HOLD');
assertSafe(sample(8,'Cattle — Milk',{measured:0.09,unit:'mg/L',sampleBasis:'liquid-cattle-milk',foodArticle:'Sheep — Milk'}),'EVIDENCE_HOLD');
assert.equal(cases,39);
console.log('R26 PASS: '+cases+' veterinary matrix, unit, unresolved-source, seafood-overlap and no-approval scenarios');
