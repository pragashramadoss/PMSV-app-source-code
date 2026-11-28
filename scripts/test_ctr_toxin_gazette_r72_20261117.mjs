import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {histamineBySource} from '../fssai-helper/ctr-histamine-source-gate-r72-20261117.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const report=JSON.parse(read('fssai-helper/ctr-toxin-gazette-concordance-r72-2026-11-17.json'));
const raw=read(report.coreSnapshot.path),core=JSON.parse(raw);
assert.equal(createHash('sha256').update(raw).digest('hex'),report.coreSnapshot.sha256);
assert.equal(report.coreSnapshot.sha256,'acc284f0e99407cc133983b551a6dff533fccd731b559ecf4340ce4f6de2e2f8');
assert.deepEqual(report.counts,{notsRows:15,fishPcbPahRows:3,biotoxinRows:5,melamineRows:3,histaminePlans:11,histamineSpeciesEntries:119,totalLimitOrPlanRows:37,numericMismatches:0});
const norm=s=>s.replace(/\s+/g,'').replace(/µ/g,'μ').toLowerCase();
assert.equal(Object.keys(report.sources).length,7);
for(const s of Object.values(report.sources)){
 assert.match(s.url,/^https:\/\/fssai\.gov\.in\/upload\/uploadfiles\/files\/[^/]+\.pdf$/);
 assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>50000);
}
assert.equal(report.sources.histamine2017.sha256,'6e226ced185a0d72203b791788806c1b03aaf2d62478a506f82456ef303fff69');
assert.equal(report.sources.histamine2017.effectiveFrom,'2017-07-01');
assert.equal(report.sources.ctr2026.effectiveFrom,'2026-12-01');
const seen=new Set();
for(const r of report.notsRows){
 const key=r.group+':'+r.coreIndex;assert(!seen.has(key));seen.add(key);
 const c=core.naturally_occurring_toxic_substances[r.group][r.coreIndex];
 assert.equal(c.article,r.storedArticle);assert.equal(c.limit,r.originalLimit);assert.equal(c.unit,r.originalUnit);
 assert.equal(r.sourceId,r.group==='hydrocyanic_acid'&&r.coreIndex===5?'hcn2017':'nots2015');
 if(r.group==='hydrocyanic_acid'&&r.coreIndex===0)assert.equal(r.originalArticle,'Nougat, marzipan or its substitutes or similar products');
 else assert.equal(r.originalArticle,r.storedArticle);
}
assert.equal(seen.size,Object.values(core.naturally_occurring_toxic_substances).flat().length);
for(const r of report.fishPcbPahRows){
 const c=core.fish_pcb_pah.rules[r.coreIndex];
 assert.equal(norm(c.contaminant),norm(r.originalContaminant));
 assert.deepEqual([c.article,c.limit,c.unit],[r.originalArticle,r.originalLimit,r.originalUnit]);
}
assert.equal(report.fishPcbPahRows[2].originalUnit,'ppb');
for(const r of report.biotoxinRows){
 const c=core.fish_biotoxins.rows[r.coreIndex];
 assert.equal(c.contaminant,r.originalContaminant);assert.equal(c.article_of_food,r.originalArticle);
 assert.equal(norm(c.limit_text),norm(r.originalLimitText));assert.equal(r.rowUnitOverridesColumnHeading,true);
}
assert.match(report.biotoxinRows[0].originalLimitText,/100g/);
assert.match(report.biotoxinRows[1].originalLimitText,/µg\/g/);
assert.match(report.biotoxinRows[4].originalLimitText,/mouse units/);
for(const r of report.melamineRows){
 const c=core.other_contaminants.melamine.rows[r.coreIndex];
 assert.equal(c.food,r.originalArticle);assert.equal(Number(c.maximum_level),r.originalLimit);
 assert.equal(r.originalClause,'2.4.1');assert.equal(r.correctedClause,'2.5.1');
 assert.equal(r.corrigendumSourceId,'melamineCorrigendum');
}
assert.deepEqual(report.melamineCorrigendum.changes,{'2.4':'2.5','2.4.1':'2.5.1'});
const species=core.other_contaminants.histamine.potential_histamine_species_families.flatMap(f=>f.species.map(s=>({...s,family:f.family})));
assert.equal(species.length,119);
for(const [i,r] of report.histamineSpeciesEntries.entries()){
 const c=species[i];assert.equal(r.coreFlatIndex,i);
 assert.deepEqual([r.family,r.scientificName,r.commonName].map(norm),[c.family,c.scientific_name,c.common_name].map(norm));
 assert([10,11,12].includes(r.sourcePdfPage));
}
const context={assessmentDate:'2026-11-17',family:'Scombridae',scientificName:'Thunnus albacares',
 legalArticleVerified:true,actualMatrixVerified:true,speciesScopeVerified:true,methodAndSamplingVerified:true,
 continuationScopeVerified:true,unit:'mg/kg'};
let comparisons=0;
function run(ctx){comparisons++;const r=histamineBySource(core,ctx);assert.equal(r.productApproved,false);assert.equal(r.commercialReleaseAuthorized,false);return r;}
for(const [i,r] of report.histaminePlans.entries()){
 const c=core.other_contaminants.histamine.product_limits[i];
 assert.equal(r.coreIndex,i);assert.equal(norm(r.originalArticle),norm(c.product_category));
 assert.deepEqual([r.n,r.c,r.m,r.M],[c.n,c.c,c.m_mg_per_kg,c.M_mg_per_kg]);
 assert.equal(r.guardRequiresSpecies,true);assert.equal(r.storedApplicabilityPresent,i===0);
 assert(r.requiredSpeciesScope.includes('Listed fish species'));
 if(i>0)assert.equal(r.originalApplicableToCell,'');
 const ctx={...context,productSerial:c.serial,productCategory:c.product_category,results:Array(9).fill(r.m)};
 assert.equal(run(ctx).status,'SOURCE_PLAN_SATISFACTORY','Inclusive mean boundary');
 assert.equal(run({...ctx,results:[r.M,r.M,0,0,0,0,0,0,0]}).status,'SOURCE_PLAN_SATISFACTORY','Two results exactly at M, mean below m');
 for(const [results,criterion] of [
  [[r.M,r.M,...Array(7).fill(r.m)],'meanCriterionMet'],
  [[r.m+1,r.m+1,r.m+1,0,0,0,0,0,0],'countCriterionMet'],
  [[r.M+1,0,0,0,0,0,0,0,0],'maximumCriterionMet']
 ]){const outcome=run({...ctx,results});assert.equal(outcome.status,'SOURCE_PLAN_UNSATISFACTORY');assert.equal(outcome[criterion],false);}
 for(const flag of ['legalArticleVerified','actualMatrixVerified','speciesScopeVerified','methodAndSamplingVerified'])
  assert.equal(run({...ctx,[flag]:false}).status,'EVIDENCE_HOLD');
 if(i===10)assert.equal(run({...ctx,continuationScopeVerified:false}).status,'EVIDENCE_HOLD');
}
const ctx={...context,productSerial:2,productCategory:'Thermally Processed Fishery Products',results:Array(9).fill(0)};
for(const patch of [
 {results:Array(8).fill(0)},{results:new Array(9)},{results:[NaN,...Array(8).fill(0)]},
 {results:[Infinity,...Array(8).fill(0)]},{results:[-1,...Array(8).fill(0)]},{results:['<10',...Array(8).fill(0)]},
 {results:[false,...Array(8).fill(0)]},{results:Array(10).fill(0)},
 {unit:'µg/kg'},{productSerial:1},{productCategory:'Fish products'},
 {scientificName:'Tuna'},{scientificName:'Thunnus spp.'},{family:'Clupeidae'},
 {assessmentDate:'2026-02-30'},{assessmentDate:'2026-02-02'},{assessmentDate:'2026-12-01'},
 {assessmentDate:'2027-01-01'},{assessmentDate:null}
])assert.equal(run({...ctx,...patch}).status,'EVIDENCE_HOLD');
assert.equal(run({...ctx,assessmentDate:'2026-11-30'}).status,'SOURCE_PLAN_SATISFACTORY');
const altered=structuredClone(core);altered.other_contaminants.histamine.product_limits[1].m_mg_per_kg=1000;
assert.equal(histamineBySource(altered,ctx).status,'EVIDENCE_HOLD');
assert.equal(histamineBySource(null,ctx).status,'EVIDENCE_HOLD');
assert.equal(histamineBySource(core,null).status,'EVIDENCE_HOLD');
for(const rows of [report.notsRows,report.fishPcbPahRows,report.biotoxinRows,report.melamineRows,report.histaminePlans])
 for(const r of rows){assert.equal(r.numericRuleChanged,false);assert.equal(r.automaticProductApplication,false);}
assert.equal(report.reviewBoundary.openExactArticleDecisions,137);assert.equal(report.reviewBoundary.legacyCoreChanged,false);

const sandbox={window:{}};vm.createContext(sandbox);
for(const p of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read('fssai-helper/'+p),sandbox);
const data=JSON.parse(JSON.stringify(sandbox.window.PMSV_REVIEW_REGISTER));
const catalogue=JSON.parse(JSON.stringify(sandbox.window.PMSV_CATALOGUE));
const api=createRequire(import.meta.url)('../fssai-helper/review-status.js');
assert.equal(api.validateReview(data,catalogue).ok,true);
assert.equal(data.toxinGazetteReview.seafoodNoteIds.length,24);
for(const mutate of [
 d=>delete d.toxinGazetteReview,d=>d.toxinGazetteReview.histaminePlans=10,
 d=>d.toxinGazetteReview.histamineSpeciesEntries=118,d=>d.toxinGazetteReview.numericMismatches=1,
 d=>d.toxinGazetteReview.fullCurrentLawComplete=true,d=>d.toxinGazetteReview.numericRulesChanged=true,
 d=>d.toxinGazetteReview.productApprovals=1,d=>d.toxinGazetteReview.report='../index.html',
 d=>d.toxinGazetteReview.findings.pop(),d=>d.toxinGazetteReview.findings[1].id=d.toxinGazetteReview.findings[0].id,
 d=>d.toxinGazetteReview.seafoodNoteIds.pop(),d=>d.toxinGazetteReview.seafoodNoteIds[0]=d.toxinGazetteReview.seafoodNoteIds[1],
 d=>d.latestSourceReviewDate='2026-11-14'
]){const bad=structuredClone(data);mutate(bad);assert.equal(api.validateReview(bad,catalogue).ok,false);}
console.log(`R72 PASS: 37 original-source limit/plan rows, 119 species entries, ${comparisons} sampling/scope comparisons, immutable core, 24 seafood notes and invalid-evidence rejection.`);
