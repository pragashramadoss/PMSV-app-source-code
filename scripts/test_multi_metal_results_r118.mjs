import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir = new URL('../fssai-helper/', import.meta.url);
const markup = fs.readFileSync(new URL('index.html', dir), 'utf8');
const scripts = Array.from(markup.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g),
  ([,file]) => fs.readFileSync(new URL(file, dir), 'utf8'));
const stored = new Map();
function openHelper() {
  const ctx = vm.createContext({localStorage: {getItem: key => stored.get(key) ?? null}});
  ctx.window = ctx;
  for (const script of scripts) vm.runInContext(script, ctx);
  return ctx;
}
const ctx = openHelper(), metal = ctx.PMSVMetalPanel, plan = ctx.PMSVTestingPlan;
const cocoa = '05-05-1-cocoa-powder', fish = '02-02-1-fish-oil';
const earlier = '2026-11-22', later = '2026-12-01';
assert.equal(ctx.PMSV_REVIEW_REGISTER.multiMetalReview.round, 118);

// Exercise the edit transitions called by the worksheet without a browser.
const node = {querySelector: () => ({})};
function edit(id, state, key, value) {
  const previous = state[key];
  state[key] = value;
  metal.update(node, id, key, state, previous);
}
function measurement(value, ref, sample, date) {
  return {panelLabNumber:value, panelLabRef:ref, panelLabSample:sample, panelLabUnit:'mg/kg',
    panelLabBasis:'yes', panelLabEdition:plan.metalEdition(date)};
}
const lead = measurement('5.000', 'Lead R117 original', '', earlier);
delete lead.panelLabSample;
const sample = {vetDate:earlier, panelLabMetal:'Pb', ...lead};
edit(cocoa, sample, 'panelLabMetal', 'Cu');
assert.equal(sample.panelLabNumber, '');
Object.assign(sample, measurement('70.000000000000001', 'Copper R118 report', 'sample, "C"', earlier));
edit(cocoa, sample, 'panelLabMetal', 'Pb');
assert.equal(sample.panelLabNumber, lead.panelLabNumber);
assert.equal(sample.panelLabRef, lead.panelLabRef);
assert.equal(sample.panelLabBasis, 'yes');
edit(cocoa, sample, 'panelLabSample', 'Lead sample');
let lines = metal.reportLines(cocoa, sample);
assert.equal(lines.length, 2);
assert.match(lines.find(r=>r.metal==='Pb').outcome, /^Within/);
assert.match(lines.find(r=>r.metal==='Cu').outcome, /^Outside/);

stored.set('pmsv-fssai-worksheet-r93:'+cocoa, JSON.stringify(sample));
const reopened = openHelper().PMSVCatalogueWorksheets;
const personal = reopened.registerRows(true).find(row=>row[0]===cocoa).join(' ');
const brief = reopened.briefLines(cocoa).join(' ');
const productPlan = reopened.productPlan(cocoa);
for (const row of lines) {
  for (const value of [row.reference, row.sample, row.result]) {
    assert(personal.includes(value));
    assert(brief.includes(value));
    assert(productPlan.some(record=>record[9].includes(value)));
  }
}
assert(!reopened.registerRows().some(row=>row.join(' ').includes(lead.panelLabRef)));
assert(!reopened.productPlan(fish).some(row=>row[9].includes(lead.panelLabRef)));

edit(cocoa, sample, 'panel_CuRef', 'Revised copper article evidence');
lines = metal.reportLines(cocoa,sample);
assert.match(lines.find(r=>r.metal==='Pb').outcome, /^Within/);
assert.match(lines.find(r=>r.metal==='Cu').outcome, /^Confirm/);
edit(cocoa, sample, 'panelLabMetal', '');
edit(cocoa, sample, 'panelLabMetal', 'Cu');
assert.equal(sample.panelLabBasis, '');
assert.equal(sample.panelLabNumber, '70.000000000000001');
edit(cocoa, sample, 'panelLabNumber', '');
edit(cocoa, sample, 'panelLabMetal', 'Pb');
assert.equal(metal.reportLines(cocoa,sample).length, 1);
edit(cocoa, sample, 'panelLabMetal', 'Cu');
assert.equal(sample.panelLabNumber, '');
for (const bad of ['{', '[]', 'null', '{"As":null,"Cu":1}']) {
  assert.equal(metal.reportLines(cocoa,{...sample,panelLabOther:bad}).length, 0);
}

const oil = {vetDate:later,panelLabMetal:'As',...measurement('0.05','Unspecified R117','fish lot A',later)};
edit(fish,oil,'panelLabAsForm','total');
Object.assign(oil,measurement('0.15','Total R118','fish lot A',later));
edit(fish,oil,'panelLabAsForm','inorganic');
Object.assign(oil,measurement('0.08','Inorganic R118','fish lot A',later));
const fishLines = metal.reportLines(fish,oil);
assert.deepEqual(Array.from(fishLines,r=>r.label), ['Arsenic species unconfirmed','Total arsenic','Inorganic arsenic']);
assert.match(fishLines[0].outcome,/Identify whether/);
assert.match(fishLines[1].outcome,/Determine inorganic arsenic/);
assert.match(fishLines[2].outcome,/^Within/);
const arsenicRows = plan.entries(fish,later,oil).filter(r=>r.notes?.includes('Total R118'));
assert.equal(arsenicRows.length,1);
assert(arsenicRows[0].notes.includes('Inorganic R118')&&arsenicRows[0].notes.includes('Unspecified R117'));
edit(fish,oil,'vetDate',earlier);
assert.equal(metal.reportLines(fish,oil).length,3);
assert.match(metal.reportLines(fish,oil).find(r=>r.label==='Inorganic arsenic').outcome,/Review the reported inorganic/);
edit(fish,oil,'vetDate',later);
assert(metal.reportLines(fish,oil).every(r=>!/^Within|^Outside|^Determine inorganic arsenic/.test(r.outcome)));
edit(fish,oil,'panelLabAsForm','total');
assert.equal(oil.panelLabNumber,'0.15');
assert.equal(oil.panelLabBasis,'');
edit(fish,oil,'panelLabBasis','yes');
assert.match(metal.reportLines(fish,oil).find(r=>r.label==='Total arsenic').outcome,/Determine inorganic arsenic/);
assert.match(metal.reportLines(fish,oil).find(r=>r.label==='Inorganic arsenic').outcome,/^Confirm/);

let checked = 0;
for (const date of [earlier,later]) {
  const records = Object.fromEntries(metal.metals.map(([,m],i)=>[m,measurement(String(i+1),'LAB118|'+m+'|END','Lot '+m,date)]));
  const {Pb,...inactive} = records;
  const state = {vetDate:date,panelLabMetal:'Pb',...Pb,panelLabOther:JSON.stringify(inactive)};
  for (const {id} of ctx.PMSV_CATALOGUE) {
    const readings = metal.reportLines(id,state);
    const sourceRows = metal.panel(id,state).map(d=>plan.metalRow(id,d,date));
    const rows = plan.entries(id,date,state).filter(row=>row.area===plan.areas[2]);
    assert.equal(readings.length,11,id);
    assert.equal(rows.length,11,id);
    for (const [i,reading] of readings.entries()) {
      const row = rows[i];
      assert.equal(reading.date,date);
      assert.equal(reading.source,row.source);
      assert.equal(reading.outcome,metal.lab(id,{...state,...records[reading.metal],panelLabMetal:reading.metal},sourceRows[i]));
      assert(row.notes.includes(reading.summary),id+' '+reading.metal);
      assert.equal(row.notes.split('LAB118|').length,2,id+' '+reading.metal);
      checked++;
    }
  }
  const bulk = plan.exportRows(null,date,false,state);
  assert.equal(bulk.length,date===earlier?25379:25331);
  assert(!bulk.some(row=>row[9].includes('LAB118|')));
}
assert.equal(checked,11726);
console.log(checked+' product, metal and edition combinations verified. Legacy reports, two arsenic species, reconfirmation, deletion and export isolation passed.');
