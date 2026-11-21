import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(repo,'fssai-helper');
const source=f=>fs.readFileSync(path.join(dir,f+'.js'),'utf8');
const ctx=vm.createContext({});ctx.window=ctx;
for(const f of ['full-catalogue-533','review-status-data','catalogue-source-evidence','catalogue-rule-data','catalogue-metal-scope-data','catalogue-metal-scope','broad-contaminants','catalogue-crop-scope-data','catalogue-crop-scope','catalogue-metal-panel-data','catalogue-metal-panel','catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-worksheets'])vm.runInContext(source(f),ctx);
const E=ctx.PMSVCatalogueEvidence,R=ctx.PMSVCatalogueRules,W=ctx.PMSVCatalogueWorksheets;
assert(W.available);
assert.equal(W.stats.total,533);assert.equal(W.stats.direct,475);assert.equal(W.stats.partial,396);
assert.equal(Object.keys(E.standards).length,356);
const rows=W.registerRows();assert.equal(rows.length,534);assert.equal(new Set(rows.slice(1).map(r=>r[0])).size,533);
let confirmed=0,hasProfile=0,hasPage=0,allPages=0;
for(const row of rows.slice(1)) {
  const id=row[0], p=E.products[id],ref=E.standards[p.standard];
  assert.equal(row.length,rows[0].length);assert(row[5].startsWith('https://')&&row[13]);assert.equal(row[15],'No');assert(row[16].includes('#page='));
  assert(W.markup(id).includes(id));assert(W.briefLines(id).includes('Catalogue worksheet · '+R.products[id].name));
  if(ref) {
    assert(ref.p.length>0);assert(ref.p.every(n=>Number.isInteger(n)&&n>=1&&n<=E.documents[ref.doc].pages));hasPage++;
    assert(R.standards[p.standard].name);
    for(const [doc,pp] of ref.gaz)assert(pp.length&&pp.every(n=>n>0&&n<=E.documents[doc].pages));
  }
  if(ref?.p.length || p.routeAnchors?.length)allPages++;
  for(const [doc,pp] of p.routeAnchors||[]) assert(pp.length&&pp.every(n=>n>0&&n<=E.documents[doc].pages));
  for(const [m,t] of p.monographs)assert(E.monographs[m]&&[0,1,2].includes(t));
  if(!p.directCTR)assert.equal((R.products[id].ctrProfiles||[]).length,0);
  for(const key of R.products[id].ctrProfiles||[])if(E.profileGazette[key])hasProfile++;
  for(const item of p.namedGazette||[])assert(E.documents[item[5]]&&item[6]>0);
  for(const {v} of W.enabledCriteria(id)) {
    assert.equal(ref.basis,'Reviewed source edition and PDF fingerprint');assert.equal(v.compare,true);assert(!v.spec.when || !Object.keys(v.spec.when).length);confirmed++;
  }
}
assert.equal(hasPage,493);assert.equal(allPages,533);
const soy='02-02-1-partially-hydrogenated-and-winterised-soyabean-oil';
assert(E.products[soy].qualityCrosschecks.some(([,c])=>c[0]==='Trans fatty acids'&&c[2]==='2'&&c[4]==='5'));
assert.equal(E.products[soy].gazetteFindings[0].document,'food-14');assert.equal(E.products[soy].gazetteFindings[0].effective,'2022-01-01');
assert(W.briefLines(soy).some(z=>z.includes('Maximum 2% by weight from 1 January 2022')));assert(confirmed>200);assert(hasProfile>0);
assert.equal(W.compare({operator:'<=',value:0.1},'0.1000000000000000000001'),false);
assert.equal(W.compare({operator:'<=',value:0.1},'00.1000'),true);
assert.equal(W.compare({operator:'<',value:3},'3'),false);
assert.equal(W.compare({operator:'range',min:2,max:4},'4.0000'),true);
assert.equal(W.compare({operator:'range',min:2,max:4},'2.01%'),null);
assert.equal(W.enabledCriteria('unknown').length,0);
delete E.products[rows[1][0]];vm.runInContext(source('catalogue-worksheets'),ctx);assert.equal(ctx.PMSVCatalogueWorksheets.available,false);assert.equal(ctx.PMSVCatalogueWorksheets.registerRows().length,0);
execFileSync('python3',['scripts/build-catalogue-worksheets.py','--check'],{cwd:repo});
console.log('533 worksheet identities, 493 source/purity page anchors, category routes, source boundaries, comparator precision and deterministic build passed.');
