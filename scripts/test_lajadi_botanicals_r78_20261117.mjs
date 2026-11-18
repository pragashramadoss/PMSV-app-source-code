import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),dir=new URL('../fssai-helper/',import.meta.url),read=n=>fs.readFileSync(new URL(n,dir),'utf8');
const d=JSON.parse(read('ctr-lajadi-botanicals-r78-2026-11-17.json'));
const {reviewScope,markup,referenceMarkup}=require('../fssai-helper/lajadi-botanicals-r78.js');
const ingredients=['hribera','chandana','ushira'],forms=['named','other','extract','unknown'],invalid=['',null,undefined,{},[],true,'constructor','__proto__'];
for(const ingredient of ingredients){
 assert.deepEqual(forms.map(f=>reviewScope(ingredient,f).status),['CANDIDATE_SOURCE_ONLY','SPECIES_OR_PART_MISMATCH','OIL_OR_EXTRACT_SUBSTITUTION_OPEN','MATERIAL_IDENTITY_OPEN']);
 for(const f of invalid)assert.equal(reviewScope(ingredient,f).status,'MATERIAL_NOT_SELECTED');
}
for(const i of invalid)assert.equal(reviewScope(i,'named').status,'INGREDIENT_NOT_SELECTED');
for(const i of [...ingredients,...invalid])for(const f of [...forms,...invalid]){
 const r=reviewScope(i,f);for(const key of ['legalProductApproval','batchRelease','autoApplyLimits','identityResolved','concentrationMultiplierEstablished'])assert.equal(r[key],false);
}
const expected=[[1,5,0.5,12,9],[1,1,0.2,8,1,1.5],[2,9,6,4,5,1]];
assert.equal(d.rows.length,17);
for(const [i,id] of ingredients.entries()){
 const rows=d.rows.filter(r=>r.ingredientId===id);assert.deepEqual(rows.map(r=>r.minimum??r.maximum),expected[i]);
 assert(rows.every(r=>r.referenceOnly&&!r.autoApply));
 assert.equal((referenceMarkup(d,id).match(/class="lajadi-reference-entry"/g)||[]).length,expected[i].length);
}
assert(!d.rows.some(r=>r.id==='hribera-volatile-oil'));
assert(d.rows.filter(r=>r.parameter==='volatile-oil').every(r=>r.unit==='% v/w'));
assert(d.rows.filter(r=>['total-ash','acid-insoluble-ash','alcohol-extractive','water-extractive'].includes(r.parameter)).every(r=>r.basis.includes('air-dried')));
assert.equal(d.ingredients[0].name,'Hribera');assert.equal(d.ingredients[0].monograph,'Hapusa (Fruit)');
assert.equal(d.ingredients[2].botanicalLiteral,'Khas Khas grass/Vetiveria zizaniodes (L.) Nash.');
assert.equal(d.ingredients[2].apiBotanicalLiteral,'Vetiveria zizanioides (Linn.) Nash');
assert.equal(referenceMarkup(d,'constructor'),'');assert.equal(referenceMarkup(d,''),'');
assert.match(markup(d),/id="lajadiMaterial" disabled/);assert(!markup(d).includes('type="number"'));
const hashes={title:'c26cda6fef9d96b11d6585b0eea59d945425ece9a30e60f9624b0cca9041acf0',publication:'355c056e681682a6a2c015702adb42a5ed0c0ed5d0ac0a3fe0501a9db60d2988',hapusa63:'c113cf557699cb0abf6e09cf8125f256bef503bed8af75f8826b97cf59a00233',hapusa64:'96c7e46cab1a5a5e66bb41253ec056a8bb0d99ba9ef03925de18e5ee9bb4cc5b',svetacandana207:'9c0fdfc79f6039ddf5da96ff454ea318c13e6b041d9991f5cd7bc1d3351b777a',svetacandana208:'5e00381facf544b2645c76a5791c02a826b20c056e5538233c5478f0de7237e2',usira219:'563ae8cbf7ac878da6de0820089e1e38faf74f0162acba4bda669badad97433d',usira220:'ff1deab805d97708147e3d21819ce4181d219aeb701df99dfae93f2dd0db67c2',methods234:'0d7744984396e291809291949ed39907c0742a1c3f0634f3b2a6dffdb4dbf0a7',methods235:'f03899026dafdc327d7c3879dcd30ba5e5012fd5b9a37d2be4eee52ca587f67b'};
for(const [key,hash] of Object.entries(hashes))assert.equal(d.sources[key].sha256,hash);
const ctx={window:{},URL};vm.createContext(ctx);for(const f of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read(f),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER)),catalogue=JSON.parse(JSON.stringify(ctx.window.PMSV_CATALOGUE));
const {validateReview}=require('../fssai-helper/review-status.js');assert.equal(validateReview(data,catalogue).ok,true);
const linked=data.records.find(x=>x.id===d.recipeProductId);assert(linked.reports.some(r=>r.round===78&&r.file===d.report));assert(linked.reports.some(r=>r.round===75));assert(linked.reports.some(r=>r.round===74));assert(linked.sourceReviewResult.includes(d.sourceReviewResult));assert.match(linked.sourceReviewResult,/water/i);assert.equal(linked.legalArticleDecision,'OPEN');
const changes=[x=>delete x.lajadiBotanicalReview,x=>x.lajadiBotanicalReview.rows[0]=null,x=>x.lajadiBotanicalReview.rows[1]=x.lajadiBotanicalReview.rows[0],x=>x.lajadiBotanicalReview.rows.pop(),x=>x.lajadiBotanicalReview.fullCurrentLawComplete=true,x=>x.lajadiBotanicalReview.alcoholStrengthResolved=true,x=>x.lajadiBotanicalReview.concentrationMultiplierEstablished=true,x=>x.lajadiBotanicalReview.identityDifferencesResolved=true,x=>x.lajadiBotanicalReview.ingredientGapsClosed=3,x=>x.lajadiBotanicalReview.therapeuticDoseImported=true,x=>x.lajadiBotanicalReview.ingredients[0].name='Hapusa',x=>x.lajadiBotanicalReview.ingredients[2].botanicalLiteral='Vetiveria zizanioides',x=>x.lajadiBotanicalReview.ingredients[1].partLiteral='Sapwood',x=>x.lajadiBotanicalReview.ingredients[0].substitutionApproved=true,x=>x.lajadiBotanicalReview.rows[0].maximum=2,x=>x.lajadiBotanicalReview.rows[1].basis='Dry basis',x=>x.lajadiBotanicalReview.rows[3].method='Appendix 2.2.7',x=>x.lajadiBotanicalReview.rows[10].unit='%',x=>x.lajadiBotanicalReview.rows[16].autoApply=true,x=>x.lajadiBotanicalReview.sources.hapusa63.url='https://example.com',x=>x.lajadiBotanicalReview.sources.hapusa64.printedPage=63,x=>x.lajadiBotanicalReview.sources.recipe2025.pdfPagesReviewed=[85],x=>x.lajadiBotanicalReview.amendmentWatch.completeAmendmentChain=true,x=>x.lajadiBotanicalReview.legalProductApproval=true];
for(const change of changes){const bad=structuredClone(data);change(bad);assert.equal(validateReview(bad,catalogue).ok,false);}
console.log(`R78 PASS: 17 botanical entries, 132 form/invalid-input combinations, ten scan fingerprints, preserved water review, and ${changes.length} altered-evidence refusals.`);
