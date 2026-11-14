import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sha256Utf8,isPinnedCTRCore,PINNED_CTR_R25_JSON_SHA256} from '../fssai-helper/ctr-source-integrity-r27-2026-11-04.mjs';
import {pesticideBySource,veterinaryBySource,honeyMRPLBySource} from '../fssai-helper/ctr-residue-source-anchored-r25-2026-11-04.mjs';

const raw=readFileSync('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json','utf8');
const core=JSON.parse(raw);
let checks=0;
const test=(cond,msg)=>{assert(cond,msg);checks++;};
for(const str of ['', 'abc', 'hello world', 'योजना हिंदी', '😀', 'a'.repeat(3000), 'a'.repeat(513)]){
 test(sha256Utf8(str)===createHash('sha256').update(str,'utf8').digest('hex'),'Portable SHA-256 failed standard vector');
}
test(sha256Utf8(JSON.stringify(core))===PINNED_CTR_R25_JSON_SHA256,'Pinned canonical source hash does not match actual Version IX');
test(isPinnedCTRCore(core),'Pinned actual source must be accepted');
const p=core.residue_mrls.pesticides.find(x=>x.serial===114);
const pestCtx={assessmentDate:'2026-11-04',pesticideSerial:114,pesticideName:p.name,foodArticle:'Milled food grains',
 legalArticleVerified:true,actualMatrixVerified:true,sourceAnalyteIdentityVerified:true,
 methodAndResidueDefinitionVerified:true,printedConditionVerified:true,unit:'mg/kg',measured:0.5};
let baseline=pesticideBySource(core,pestCtx);
test(baseline.status==='SOURCE_ROW_WITHIN','Real source should still permit a scoped row comparison');
test(baseline.productApproved===false&&baseline.fullCurrentLawComplete===false&&baseline.commercialReleaseAuthorized===false,
 'Real source row comparison must not approve the full product');
const c=()=>structuredClone(core);
const attacks=[
 ['inflated pesticide limit',d=>{d.residue_mrls.pesticides.find(x=>x.serial===114).rows.find(x=>x.food==='Milled food grains').mrl='999999';}],
 ['lowered pesticide limit',d=>{d.residue_mrls.pesticides.find(x=>x.serial===114).rows.find(x=>x.food==='Milled food grains').mrl='0.0001';}],
 ['changed pesticide analyte',d=>{d.residue_mrls.pesticides.find(x=>x.serial===114).name='Malathion';}],
 ['changed veterinary dose',d=>{d.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows[0].rows[0].limit='999';}],
 ['changed honey MRPL',d=>{d.antibiotic_and_pharmacological_substances.honey_antibiotic_mrpl.rows[0].mrpl='1000000';}],
 ['changed source revision',d=>{d.source_version='Version IX (forged)';}],
 ['changed unrelated review note',d=>{d.r25_pesticide_source_symbol_conflict_gates_2026_11_04.review_date='2026-11-05';}],
 ['changed progress count',d=>{d.residue_mrls.next_serial=215;}],
 ['removed single source row',d=>{d.residue_mrls.pesticides[0].rows.pop();}],
 ['altered special footnote',d=>{d.residue_mrls.symbol_policy='Ignore copper dollar token';}],
];
for(const [label,attack] of attacks){
 const d=c();attack(d);
 test(!isPinnedCTRCore(d),label+' must not pass source pin');
 const r=pesticideBySource(d,pestCtx);
 test(r.status==='EVIDENCE_HOLD'&&!r.productApproved&&!r.commercialReleaseAuthorized,
   label+' must not cause comparison against substituted core');
}
const fake=c();
Object.defineProperty(fake.residue_mrls.pesticides[0],'toJSON',{value:()=>core.residue_mrls.pesticides[0],enumerable:false});
test(!isPinnedCTRCore(fake),'Nested custom toJSON must be rejected');
const rr=pesticideBySource(fake,pestCtx);
test(rr.status==='EVIDENCE_HOLD','toJSON spoof must not allow legal comparisons');
const accessor=c();
Object.defineProperty(accessor,'source_version',{get:()=>core.source_version,enumerable:true});
test(!isPinnedCTRCore(accessor),'Accessor spoof must be rejected');
test(pesticideBySource(accessor,pestCtx).status==='EVIDENCE_HOLD','Accessor spoof must hold');
const untrusted=Object.create(null);
test(!isPinnedCTRCore(untrusted),'Unexpected JSON prototype must hold');
test(!isPinnedCTRCore({source_version:'Version IX (03.02.2026)'}),'Partial object must hold');
test(!isPinnedCTRCore(null),'Null must hold');
test(!isPinnedCTRCore([]),'Array must hold');
const currentVet=core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows.find(x=>x.serial===8);
const milk={assessmentDate:'2026-11-04',veterinarySerial:8,drugName:currentVet.name,foodArticle:'Cattle — Milk',
 legalArticleVerified:true,speciesVerified:true,tissueAndMatrixVerified:true,
 methodAndResidueDefinitionVerified:true,unit:'mg/L',sampleBasis:'liquid-cattle-milk',measured:0.09};
test(veterinaryBySource(core,milk).status==='SOURCE_ROW_WITHIN','Valid cattle milk source must continue working');
const forgedVet=c();forgedVet.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows.find(x=>x.serial===8).rows.find(x=>x.article==='Cattle — Milk').limit='50';
test(veterinaryBySource(forgedVet,milk).status==='EVIDENCE_HOLD','Forged veterinary data must hold');
const honey={assessmentDate:'2026-11-04',honeyAntibioticSerial:1,antibioticName:'Chloramphenicol',
 isActualHoney:true,methodAndMarkerVerified:true,unit:'ug/kg',measured:0.4};
test(honeyMRPLBySource(core,honey).status==='MISUSE_TEST_COMPARISON_ONLY','Real honey source must remain misuse-only');
const forgedHoney=c();forgedHoney.antibiotic_and_pharmacological_substances.honey_antibiotic_mrpl.rows[0].mrpl='888888';
test(honeyMRPLBySource(forgedHoney,honey).status==='EVIDENCE_HOLD','Forged honey MRPL must hold');
test(core.r25_pesticide_source_symbol_conflict_gates_2026_11_04.full_product_approvals===0,
 'Source itself must preserve zero approvals');
console.log('R27 source-integrity pass:',checks,'hash, source-tamper, no-approval and existing comparison checks');
