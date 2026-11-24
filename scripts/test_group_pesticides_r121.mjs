import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const helper = new URL('../fssai-helper/',import.meta.url);
const context = vm.createContext({});
context.window = context;
const html = fs.readFileSync(new URL('index.html',helper),'utf8');
for (const [,name] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)) {
  vm.runInContext(fs.readFileSync(new URL(name,helper),'utf8'),context);
}
const {PMSVPesticides:pesticides,PMSVTestingPlan:plans,PMSVCatalogueWorksheets:worksheets,PMSVResiduePanel:panel} = context;
const [headers,...register] = worksheets.registerRows();
const cases = [
  ['04-04-1-seedless-tamarind','physical',['138-8','0.05'],['175-2','0.5']],
  ['04-04-1-frozen-fruits-fruit-products','physical',['138-8','0.05'],['175-2','0.5']],
  ['06-06-1-chia-seeds','raw',['138-1','0.1'],['175-0','0.03']]
];
for (const [id,process,...criteria] of cases) {
  const group = pesticides.groupSource(id);
  const record = register.find(row=>row[0]===id);
  for (const [key,limit] of criteria) {
    const row = group.rows.find(r=>r.key===key);
    const page = row.serial===138?44:49;
    assert.equal(row.limit,limit);
    assert(row.url.endsWith('#page='+page));
    assert.match(row.reportBasis,row.serial===138?/cation/:/sulfoxide.*sulfone/);
    assert(record[headers.indexOf('Pesticide source references')].includes(row.url));
    assert(record[headers.indexOf('Pesticide article and processing checks')].includes(row.shortName));
    const sample={pestRole:'product',pestMatrix:group.matrix,pestProcess:process,pestScopeRef:'SKU specification and process record',pestRow:key,
      pestSample:'Lot 121',pestReport:'Joint residue report',pestKind:'quantified',pestValue:limit,pestUnit:'mg/kg',pestBasis:'yes'};
    assert.equal(pesticides.comparison(id,sample).kind,'within');
    assert.equal(pesticides.comparison(id,{...sample,pestValue:limit+'000001'}).kind,'above');
    assert.equal(pesticides.comparison(id,{...sample,pestKind:'less',pestValue:'1'}).kind,'inconclusive');
    for (const patch of [{pestBasis:''},{pestScopeRef:''},{pestProcess:'thermal'},{pestRole:'ingredient'},{pestMatrix:'other'},{pestRow:'175-1'}]) {
      assert.equal(pesticides.comparison(id,{...sample,...patch}).kind,'hold');
    }
    for (const date of ['2026-11-23','2026-12-01']) {
      const [planned] = plans.exportRows(id,date).filter(r=>r[3]==='CTR 2.3.1 · serial '+row.serial && r[4].startsWith(group.label));
      assert.equal(planned[7],limit);assert.equal(planned[8],'mg/kg');
      assert(planned[9].includes(row.reportBasis));assert(planned[14].includes(row.url));
      if(group.classification)assert(record[headers.indexOf('Pesticide source references')].includes(group.classification));
    }
    panel.save(id,sample,'gazette');
    const saved=panel.exportRows(id).find(r=>r.includes(row.url));
    assert(saved.some(v=>String(v).includes(row.reportBasis)));
  }
  const savedPlan=plans.exportRows(id,'2026-11-23',false,{}).filter(r=>r.includes('Recorded pesticide laboratory result'));
  assert.equal(savedPlan.length,2);
}
assert.equal(context.PMSV_REVIEW_REGISTER.groupPesticideReview.comparisons,9);
assert.equal(register.filter(r=>r.at(-2)==='FIRST_EXACT_SOURCE_PENDING').length,30);
console.log('Six additional product and pesticide combinations checked against their source pages in two editions.');
