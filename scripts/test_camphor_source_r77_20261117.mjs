import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),dir=new URL('../fssai-helper/',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,dir),'utf8');
const d=JSON.parse(read('ctr-camphor-source-r77-2026-11-17.json'));
const {reviewScope,markup}=require('../fssai-helper/camphor-source-r77.js');
const materials=['cinnamomum','ocimum','synthetic','unknown'];
assert.deepEqual(materials.map(m=>reviewScope('14.5',m).status),['CANDIDATE_SOURCE_ONLY','RECIPE_SPECIES_SUBSTITUTION_OPEN','SYNTHETIC_SUBSTITUTION_OPEN','MATERIAL_IDENTITY_OPEN']);
const invalid=['',null,undefined,'constructor','__proto__','Cinnamomum',{},[],true];
for(const material of invalid)assert.equal(reviewScope('14.5',material).status,'MATERIAL_NOT_SELECTED');
for(const material of [...materials,...invalid])assert.equal(reviewScope('14.6',material).status,'OFFICIAL_RECIPE_ALIGNMENT_HOLD');
for(const recipe of ['14.7','13.1','',null,14.5])assert.equal(reviewScope(recipe,'cinnamomum').status,'UNSUPPORTED_RECIPE');
for(const recipe of ['14.5','14.6','14.7'])for(const material of [...materials,...invalid]){
 const result=reviewScope(recipe,material);assert.equal(result.legalProductApproval,false);assert.equal(result.batchRelease,false);
 assert.equal(result.autoApplyLimits,false);assert.equal(result.foodDoseEstablished,false);
}
assert.equal(d.publicationYear,2008);assert.equal(d.editionEffectiveFrom,'2009-01-01');
assert.equal(d.rows.length,5);assert.equal(d.rows.filter(r=>['minimum','maximum','range'].includes(r.kind)).length,3);
const row=id=>d.rows.find(r=>r.id===id);
assert.deepEqual([row('melting-range').minimum,row('melting-range').maximum,row('melting-range').unit],[174,179,'°C']);
assert.equal(row('specific-optical-rotation').display,'+41° +43° (as printed)');
assert.equal(row('specific-optical-rotation').minimum,null);assert.equal(row('specific-optical-rotation').maximum,null);
assert.equal(row('non-volatile-matter').maximum,0.05);assert.equal(row('camphor-assay').minimum,96);
assert.equal(row('pesticide-residue').kind,'pointer');assert.equal(row('pesticide-residue').maximum,null);
assert.equal(d.records[1].ingredientSerial,null);assert.equal(d.records[1].recipeAlignmentHold,true);
assert.equal(d.records[0].botanicalLiteral,'Camphor/Cinnamomum camphora (L.) J.Presl');
const hashes={title:'fe67ae83ef4e32adfadf2aacd7998c998d303b62f159fd6f209a219896182ea5',publication:'826e9c03500a024e4cb3d0ec008c9869ac77317b1bcec50c954f2709ae5f64e9',generalNotices:'123e6bf3a7e11a0e809a73eda0ff22a591747c7cfe9cce134f889d539b016e79',monograph210:'a0b6c01a8070985c0b419e0bd2436cdb427638278032ea599d71e858c9b55276',monograph211:'8a356e698e4837825bc7ee2bf1a1ccf42550768e32de15a205d99e4332f9b456'};
for(const [key,hash] of Object.entries(hashes))assert.equal(d.sources[key].sha256,hash);
for(const record of d.records){
 const html=markup(d,record);assert.equal((html.match(/class="camphor-reference-entry"/g)||[]).length,5);
 assert.match(html,/Wellcome Collection/);assert.match(html,/CC BY 4\.0/);
 assert(!html.includes('125 to 375'),'Medicinal dose must not appear as food guidance');
 assert(!html.includes('type="number"'),'No food-dose or purity comparator is provided');
}
const ctx={window:{},URL};vm.createContext(ctx);
for(const name of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read(name),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER)),catalogue=JSON.parse(JSON.stringify(ctx.window.PMSV_CATALOGUE));
const {validateReview}=require('../fssai-helper/review-status.js');assert.equal(validateReview(data,catalogue).ok,true);
for (const note of d.records) {
 const linked = data.records.find(r => r.id === note.id);
 assert(linked.reports.some(r => r.round === 77 && r.file === d.report));
 assert(linked.reports.some(r => r.round === 69));
 assert(linked.sourceReviewResult.includes(note.sourceReviewResult));
 assert.equal(linked.legalArticleDecision, 'OPEN');
}
assert.match(data.records.find(r=>r.id===d.records[1].id).sourceReviewNextAction,/discrepancy is confirmed visually, not resolved/);
const mutateRow=(x,id)=>x.camphorReview.rows.find(r=>r.id===id);
const changes=[x=>delete x.camphorReview,x=>x.camphorReview.fullCurrentLawComplete=true,x=>x.camphorReview.therapeuticDoseImported=true,x=>x.camphorReview.recipeSafeDoseEstablished=true,x=>x.camphorReview.syntheticSubstitutionApproved=true,x=>x.camphorReview.ocimumSubstitutionApproved=true,x=>x.camphorReview.recipe146HoldResolved=true,x=>x.camphorReview.rows.pop(),x=>mutateRow(x,'specific-optical-rotation').minimum=41,x=>mutateRow(x,'specific-optical-rotation').kind='range',x=>mutateRow(x,'pesticide-residue').maximum=0.1,x=>mutateRow(x,'melting-range').unit='°F',x=>mutateRow(x,'camphor-assay').minimum=99,x=>mutateRow(x,'non-volatile-matter').maximum=0.5,x=>mutateRow(x,'camphor-assay').autoApply=true,x=>x.camphorReview.records[1].ingredientSerial=14,x=>x.camphorReview.records[1].recipeAlignmentHold=false,x=>x.camphorReview.sources.monograph210.url='https://example.com/scan.jpg',x=>x.camphorReview.sources.monograph210.printedPage='211',x=>x.camphorReview.amendmentWatch.completeAmendmentChain=true,x=>x.camphorReview.amendmentWatch.pdfBytesVerified=true,x=>x.camphorReview.ingredientGapsClosed=1];
for(const change of changes){const bad=structuredClone(data);change(bad);assert.equal(validateReview(bad,catalogue).ok,false);}
console.log(`R77 PASS: five archived source entries, ${3*(materials.length+invalid.length)} scope/invalid-input cases, preserved recipe hold, five image fingerprints and ${changes.length} altered-evidence refusals.`);
