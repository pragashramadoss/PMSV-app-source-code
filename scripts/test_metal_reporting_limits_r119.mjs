import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const directory = new URL('../fssai-helper/', import.meta.url);
const markup = fs.readFileSync(new URL('index.html', directory), 'utf8');
const ctx = vm.createContext({});
ctx.window = ctx;
for (const [,file] of markup.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)) {
  vm.runInContext(fs.readFileSync(new URL(file, directory), 'utf8'), ctx);
}
const panel = ctx.PMSVMetalPanel;
const plan = ctx.PMSVTestingPlan;
const current = '2026-11-22', next = '2026-12-01';
const oil = '02-02-1-fish-oil', water = 'mineral-water', infant = '13-13-1-infant-milk-food';
assert.equal(ctx.PMSV_REVIEW_REGISTER.metalReportingReview.round,119);

function reading(metal, value, unit, date=current, extra={}) {
  return {panelLabMetal:metal, panelLabNumber:value, panelLabUnit:unit,
    panelLabSample:'R119 test lot', panelLabRef:'R119 test report', panelLabBasis:'yes',
    panelLabEdition:plan.metalEdition(date), vetDate:date, ...extra};
}
function check(id, metal, value, unit, expected, date, extra) {
  const state = reading(metal,value,unit,date,extra);
  assert.match(panel.lab(id,state),expected,id+' '+metal+' '+value+' '+unit);
  const [record] = panel.reportLines(id,state);
  assert.match(record.outcome,expected);
  assert.equal(record.result,value+' '+unit);
  const rows = plan.entries(id,state.vetDate,state).filter(row=>row.notes?.includes(state.panelLabRef));
  assert.equal(rows.length,1);
  assert(rows[0].notes.includes(record.summary));
  return record.outcome;
}

for (const [value,expected] of [
  ['10',/^Within/],['10.0000000000000001',/^Outside/],['9.999999999999999999',/^Within/],
  ['<10',/^Reported upper bound/],['<=10.000',/^Reported upper bound/],['≤ 10',/^Reported upper bound/],
  ['<20',/^Inconclusive/],['≤0',/^Reported upper bound/],['+.1',/^Within/],
  ...['ND','<LOQ','<0.000','<','>10','-1','1e1','10,00','<10 µg/L', '1 ± 0.5'].map(v=>[v,/^Manual review/])
]) check(water,'As',value,'µg/L',expected);
assert(check(water,'As','<10','µg/L',/^Reported upper bound/).includes('Equivalent to <0.01 mg/L.'));
check(water,'As','<10','µg/kg',/^Confirm/);
check(water,'As','10','µg/L',/^Confirm/,current,{panelLabBasis:''});
check(water,'As','10','µg/L',/^Confirm/,current,{panelLabEdition:'amended'});
assert.match(panel.lab(water,reading('As','<10','µg/L',current,{panelLabRef:''})),/^Confirm/);
check(infant,'Cu','<2800','µg/kg',/^Outside/);
check(infant,'Cu','≤2800','µg/kg',/^Inconclusive/);
check(infant,'Cu','<1000','µg/kg',/^Outside/);
check(infant,'Cu','<15000','µg/kg',/^Inconclusive/);
check(infant,'Cu','15000','µg/kg',/^Within/);
check(infant,'Cu','15000.00000000000001','µg/kg',/^Outside/);
check('05-05-1-cocoa-powder','Cu','<2800','µg/L',/^Confirm/);
for (const [form,value,expected] of [
  ['total','<100',/^Below/],['total','≤99.9999999999999999',/^Below/],
  ['total','<=100',/^Inconclusive/],['total','<101',/^Inconclusive/],
  ['total','100.0000',/^Exactly/],['total','100.0000000000000001',/^Above/],
  ['inorganic','<=100',/^Reported upper bound/],['inorganic','100.0000000000000001',/^Outside/],
  ['','100',/^Identify whether/]
]) check(oil,'As',value,'µg/kg',expected,next,{panelLabAsForm:form});
check(oil,'As','80','µg/kg',/^Review the reported inorganic/,current,{panelLabAsForm:'inorganic'});
assert.match(plan.fishOilScreen('<0.1'),/^Below/);
assert.match(plan.fishOilScreen('<=0.1'),/^Inconclusive/);
assert.match(plan.fishOilScreen('0.2','µg/L'),/^Check the mass-based/);

const unitChange=reading('As','0.01','µg/L');
const form={querySelector:()=>({})};
panel.update(form,water,'panelLabUnit',unitChange,'mg/L');
assert.equal(unitChange.panelLabBasis,'yes');
unitChange.panelLabUnit='µg/kg';
panel.update(form,water,'panelLabUnit',unitChange,'µg/L');
assert.equal(unitChange.panelLabBasis,'');
assert.equal(unitChange.panelLabEdition,'');

// Every product and metal uses the same source decision at equivalent concentrations.
// An unresolved article or ineligible unit must remain unresolved on both scales.
let checked=0;
for (const date of [current,next]) {
  for (const {id} of ctx.PMSV_CATALOGUE) {
    for (const [,metal] of panel.metals) {
      for (const denominator of ['kg','L']) {
        const common=reading(metal,'0.0001234567890123456789','mg/'+denominator,date);
        const baseline=panel.reportLines(id,common)[0].outcome;
        const micro=panel.reportLines(id,{...common,panelLabNumber:'0.1234567890123456789',panelLabUnit:'µg/'+denominator})[0].outcome;
        assert.equal(micro.split(' Equivalent to ')[0],baseline,id+' '+metal+' '+denominator+' '+date);
        checked++;
      }
    }
  }
  const working=reading('As','<10','µg/L',date);
  const bulk=plan.exportRows(null,date,false,working);
  assert(!bulk.some(row=>row.join(' ').includes(working.panelLabRef)));
}
assert.equal(checked,23452);
console.log(checked+' unit pairs matched across 533 products, 11 metals, two reporting bases and two editions. Bounded, inconclusive, range and speciation cases passed.');
