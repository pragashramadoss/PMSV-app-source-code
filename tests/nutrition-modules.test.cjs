const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.join(__dirname, '../fssai-product-helper-preview-01');
const api = require(path.join(root, 'nutrition-modules.js'));
const bytes = file => fs.readFileSync(path.join(root, 'data', file));
const read = file => JSON.parse(bytes(file));
const base = read('nutrition-db-v1.json');
const manifest = read('ifct-modules-manifest.json');
const payloads = manifest.modules.map(d => read(d.file));
const clone = value => structuredClone(value);
const merged = api.merge(base, manifest, payloads);
const row = (table, code) => payloads.find(p => p.table === table).rows.find(r => r.code === code);
const profile = code => merged.profiles.find(p => p.ifct_code === code);
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

test('frozen v473 master is byte-identical to its original GitHub blob', () => {
  const raw = bytes('nutrition-db-v1.json');
  const blob = crypto.createHash('sha1').update(Buffer.from(`blob ${raw.length}\0`)).update(raw).digest('hex');
  assert.equal(blob, '8eda506e6083089173ede637560a89ad69dc1be9');
  assert.equal(sha256(raw), manifest.base_database.sha256);
});

test('all nine bounded modules match their manifest sizes, hashes and expected counts', () => {
  assert.deepEqual(manifest.modules.map(d => d.expected_rows), [329,528,314,528,528,314,314,314,14]);
  for (const d of manifest.modules) {
    const raw = bytes(d.file);
    assert.equal(raw.length, d.size_bytes);
    assert.equal(sha256(raw), d.sha256);
    assert.ok(raw.length <= 800000);
    assert.equal(d.unresolved_cells, 0);
  }
});

test('atomic merge attaches 3183 table rows by food code and preserves every master field', () => {
  const before = JSON.stringify(base);
  const result = api.merge(base, manifest, payloads);
  assert.equal(JSON.stringify(base), before);
  assert.equal(result.modular_ifct.runtime_version, 475);
  assert.equal(result.modular_ifct.row_count, 3183);
  assert.equal(Object.keys(result.ifct_reference_by_code).length, 14);
  for (let i = 0; i < base.profiles.length; i++) {
    const original = base.profiles[i];
    const enriched = result.profiles[i];
    for (const key of Object.keys(original)) assert.deepEqual(enriched[key], original[key]);
    if (original.ifct_code) assert.ok(enriched.ifct_tables[5]);
  }
  assert.deepEqual(result.edible_oils_fats_ifct_table12, base.edible_oils_fats_ifct_table12);
});

test('official PDF observations retain blank cells, printed means and the correct units', () => {
  assert.equal(row(4, 'A001').values.LUTN, 10.25);
  assert.equal(row(4, 'A001').values.ZEA, null);
  assert.ok(row(4, 'A001').below_detection.includes('ZEA'));
  assert.equal(row(5, 'A001').values.CA, 181);
  assert.equal(payloads[1].fields.AS.unit, 'µg');
  assert.equal(payloads[1].fields.CA.unit, 'mg');
  assert.equal(row(7, 'N001').values.CHOLC, 84.25);
  assert.equal(row(10, 'C029').values.DIHYDROXY_BENZOIC, 0.41);
  assert.equal(row(12, 'T001').values.FASAT, 90.86);
  assert.equal(row(12, 'T014').values.F18D1TN9, 4.68);
  assert.equal(row(12, 'T014').values.F18D1N9, 29.19);
  assert.equal(row(8, 'N001').values.HIS, null);
  assert.ok(row(8, 'N001').not_reported.includes('HIS'));
});

for (const [name, mutate, message] of [
  ['duplicate code', p => { p.rows[1].code = p.rows[0].code; }, /Duplicate or mismatched/],
  ['unknown code', p => { p.rows[0].code = 'T099'; }, /Duplicate or mismatched/],
  ['wrong food name for code', p => { p.rows[0].name = 'Another food'; }, /name\/code mismatch/],
  ['missing row', p => { p.rows.pop(); }, /row count mismatch/],
  ['missing required field', p => { delete p.rows[0].values.LUTN; }, /Incomplete nutrient row/],
  ['wrong unit', p => { p.fields.LUTN.unit = 'mg'; }, /unit mismatch/],
  ['numeric string', p => { p.rows[0].values.LUTN = '10.25'; }, /Non-numeric/],
  ['NaN', p => { p.rows[0].values.LUTN = NaN; }, /Non-numeric/],
  ['negative value', p => { p.rows[0].values.LUTN = -1; }, /Non-numeric/],
  ['blank cell coerced to zero', p => { p.rows[0].values.ZEA = 0; }, /evidence mismatch/],
  ['changed value without matching printed mean', p => { p.rows[0].values.LUTN = 10.26; }, /mean\/value mismatch/],
  ['wrong table page', p => { p.rows[0].source_pages = [474]; }, /PDF page evidence/],
  ['missing source authority', p => { delete p.source_authority; }, /source mismatch/]
]) {
  test('rejects ' + name + ' before mutating the master', () => {
    const candidate = clone(payloads);
    mutate(candidate[0]);
    const before = JSON.stringify(base);
    assert.throws(() => api.merge(base, manifest, candidate), message);
    assert.equal(JSON.stringify(base), before);
  });
}

test('rejects changed manifest source, basis, units and duplicate table definitions', () => {
  for (const mutate of [
    m => { m.source_pdf_sha256 = '0'.repeat(64); },
    m => { m.modules[0].basis = 'per_100g_protein'; },
    m => { m.modules[1].expected_units.AS = 'mg'; },
    m => { m.modules[1] = clone(m.modules[0]); }
  ]) {
    const m = clone(manifest); mutate(m);
    assert.throws(() => api.merge(base, m, payloads));
  }
});

test('rejects a missing or duplicated payload table', () => {
  assert.throws(() => api.merge(base, manifest, payloads.slice(1)), /Missing supplements/);
  const copies = clone(payloads); copies[1] = copies[0];
  assert.throws(() => api.merge(base, manifest, copies), /Duplicate payload table/);
});

test('aggregation weights food mass and retains incomplete fields as null', () => {
  const a = profile('A001'), b = profile('A002');
  const result = api.aggregate(merged, 4, [{profile:a,grams:100},{profile:b,grams:300}]);
  assert.ok(Math.abs(result.LUTN.value - (10.25 + 3 * 4.11) / 4) < 1e-12);
  assert.equal(result.ZEA.value, null);
  assert.equal(result.ZEA.coverage, 0);
  const incomplete = api.aggregate(merged, 4, [{profile:a,grams:100},{profile:null,grams:100}]);
  assert.equal(incomplete.LUTN.value, null);
  assert.equal(incomplete.LUTN.coverage, 50);
});

test('explicit zero is valid, null and numeric strings never count as verified mass', () => {
  const a = clone(profile('A001'));
  a.ifct_tables[4].values.LUTN = 0;
  assert.equal(api.aggregate(merged, 4, [{profile:a,grams:100}]).LUTN.value, 0);
  for (const value of [null, undefined, '0', NaN]) {
    a.ifct_tables[4].values.LUTN = value;
    const result = api.aggregate(merged, 4, [{profile:a,grams:100}]).LUTN;
    assert.equal(result.value, null); assert.equal(result.coverage, 0);
  }
});

test('protein and methylester reference bases cannot enter food-mass aggregation', () => {
  for (const table of [8,12]) assert.throws(() => api.aggregate(merged, table, [{profile:profile('A001'),grams:100}]), /Reference basis/);
  assert.throws(() => api.aggregate(merged, 4, [{grams:-1}]), /Invalid formulation masses/);
});

function mockFetch(change) {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({url, options});
    const file = url.split('/').at(-1).split('?')[0];
    let raw = bytes(file);
    let status = 200;
    if (change) ({raw, status} = change(file, raw, status));
    return new Response(raw, {status});
  };
  return {fetchImpl, requests};
}

test('loader pins the master at v473 and validates all supplement hashes at v475', async () => {
  const mock = mockFetch();
  const loaded = await api.load({fetchImpl:mock.fetchImpl});
  assert.equal(loaded.supplementsLoaded, true);
  assert.equal(loaded.database.modular_ifct.row_count, 3183);
  assert.equal(mock.requests.length, 11);
  assert.ok(mock.requests[0].url.endsWith('nutrition-db-v1.json?v=473'));
  assert.ok(mock.requests.slice(1).every(r => r.url.endsWith('?v=475') && r.options.cache === 'reload'));
});

for (const kind of ['missing','tampered']) {
  test(kind + ' supplement keeps the complete unmodified master available', async () => {
    const mock = mockFetch((file, raw, status) => {
      if (file === manifest.modules[6].file) {
        if (kind === 'missing') status = 404;
        else raw = Buffer.from(raw.toString().replace('"table":10', '"table":11'));
      }
      return {raw, status};
    });
    const loaded = await api.load({fetchImpl:mock.fetchImpl});
    assert.equal(loaded.supplementsLoaded, false);
    assert.deepEqual(loaded.database, base);
    assert.equal(loaded.database.modular_ifct, undefined);
    assert.ok(loaded.warning);
  });
}

test('tampered master fails closed before supplements are merged', async () => {
  const mock = mockFetch((file, raw, status) => ({raw:file === 'nutrition-db-v1.json' ? Buffer.concat([raw,Buffer.from(' ')]) : raw,status}));
  await assert.rejects(api.load({fetchImpl:mock.fetchImpl}), /integrity mismatch/);
});

test('existing label and vitamin calculations preserve null while accepting explicit zero', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const start = html.indexOf('function nutritionProfileFor(');
  const end = html.indexOf('function renderIfctTable2Micronutrients(');
  assert.ok(start > 0 && end > start);
  const sandbox = {
    nutritionDb:{profiles:[{names:['Sample'],source_authority:'ICMR-NIN',active_for_calculation:true,verified_fields:['energy_kcal','sodium_mg'],per_100g:{energy_kcal:null,sodium_mg:null},ifct_table2_water_soluble_vitamins_per_100g:{test:null}}],ifct_table2_water_soluble_vitamins:{fields:{test:{unit:'mg'}}}},
    formulationIngredients:[{name:'Sample',qty:100,unit:'g'}],
    normIngredient:s => s.toLowerCase(),totalFormulaKg:() => 0.1,qtyToKg:q => q / 1000,formulaDensity:() => 1,
    fmt:(n,d)=>Number(n).toFixed(d), document:{getElementById:() => ({value:'250'}),addEventListener:()=>{}}
  };
  vm.createContext(sandbox); vm.runInContext(html.slice(start, end), sandbox);
  assert.equal(sandbox.calculateNutrition().per100g.energy_kcal, null);
  assert.equal(sandbox.calculateNutrition().per100g.sodium_mg, null);
  assert.equal(sandbox.calculateIfctTable2Micronutrients().rows.test.per100g, null);
  const sample = sandbox.nutritionDb.profiles[0];
  sample.per_100g.energy_kcal = 0; sample.per_100g.sodium_mg = 0;
  sample.ifct_table2_water_soluble_vitamins_per_100g.test = 0;
  assert.equal(sandbox.calculateNutrition().per100g.energy_kcal, null); // source energy alone cannot produce a FSSAI calculated energy without complete macros
  assert.equal(sandbox.calculateIfctTable2Micronutrients().rows.test.per100g, 0);
});

test('nutrition page renders all nine groups and clears stale composition after removing ingredients', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const nodes = {nutritionAdditionalStatus:{},nutritionAdditionalTables:{}};
  const sandbox = {
    nutritionDb:merged,window:{PMSVNutritionModules:api},
    formulationIngredients:[{name:'Sample',qty:100,unit:'g'}],
    nutritionProfileFor:() => profile('A001'),qtyToKg:q => q / 1000,formulaDensity:() => 1,nutritionServingMl:() => 250,nutritionFinishedMassG:mass=>mass,selectedProductForFortification:()=>null,currentProductProfile:()=>null,
    isNutritionNumber:api.finiteValue,esc:s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),fmt:(n,d) => n.toFixed(d),
    document:{getElementById:id => nodes[id]}
  };
  vm.createContext(sandbox);
  vm.runInContext(html.slice(html.indexOf('function renderAdditionalIfctComposition('),html.indexOf('function renderNutrition(')),sandbox);
  sandbox.renderAdditionalIfctComposition();
  for (let table = 4; table <= 12; table++) assert.ok(nodes.nutritionAdditionalTables.innerHTML.includes('IFCT Table ' + table));
  assert.ok(nodes.nutritionAdditionalTables.innerHTML.includes('10.25 µg'));
  assert.ok(nodes.nutritionAdditionalTables.innerHTML.includes('g / 100 g protein'));
  assert.ok(nodes.nutritionAdditionalTables.innerHTML.includes('90.86 %'));
  assert.ok(nodes.nutritionAdditionalTables.innerHTML.includes('Unavailable'));
  sandbox.formulationIngredients = [];
  sandbox.renderAdditionalIfctComposition();
  assert.equal(nodes.nutritionAdditionalTables.innerHTML, '');
  assert.match(nodes.nutritionAdditionalStatus.textContent,/Enter formulation/);
});

test('index loader shows the verified version or a supplement warning while retaining the master', async () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const script = html.slice(html.indexOf('async function loadNutritionDb('),html.indexOf('function currentIngredientCatalog('));
  for (const missing of [false,true]) {
    const mock = mockFetch((file,raw,status) => ({raw,status:missing && file === manifest.modules[0].file ? 404 : status}));
    const status = {};
    const sandbox = {window:{PMSVNutritionModules:{load:() => api.load({fetchImpl:mock.fetchImpl})}},nutritionDb:null,document:{getElementById:() => status},renderNutrition:() => {},renderProprietaryIngredientAutocomplete:()=>{},renderProprietaryFormula:()=>{},esc:String};
    vm.createContext(sandbox);vm.runInContext(script,sandbox);
    await sandbox.loadNutritionDb();
    assert.equal(sandbox.nutritionDb.profiles.length,535);
    if (missing) {
      assert.equal(sandbox.nutritionDb.modular_ifct,undefined);
      assert.match(status.innerHTML,/could not be verified/);
    } else {
      assert.equal(sandbox.nutritionDb.modular_ifct.row_count,3183);
      assert.match(status.innerHTML,/Nutrition version 475/);
    }
  }
});

test('complete application startup initializes enzyme state and reaches nutrition loading', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('function loadNutritionDb('));
  const classList = {add(){},remove(){},toggle(){}};
  const element = () => ({value:'',innerHTML:'',classList,dataset:{},addEventListener(){},querySelectorAll:() => []});
  const nodes = {enzymeName:element(),enzymeSource:element(),enzymeResult:element(),nutritionDbStatus:element()};
  const requests = [];
  const fetchImpl = url => {requests.push(url); return new Promise(() => {});};
  const storage = {getItem:() => null,setItem(){},removeItem(){}};
  const sandbox = {
    document:{querySelectorAll:() => [],querySelector:() => null,getElementById:id => nodes[id] || null,addEventListener(){}},
    window:{addEventListener(){},PMSVNutritionModules:{load:() => api.load({fetchImpl})}},
    location:{hash:'',pathname:'/',search:''},history:{replaceState(){}},sessionStorage:storage,localStorage:storage,
    performance:{getEntriesByType:() => [{type:'navigate'}]},fetch:fetchImpl,setTimeout:() => 0,setInterval:() => 0,clearInterval:()=>{},console
  };
  vm.createContext(sandbox);
  assert.doesNotThrow(() => vm.runInContext(script,sandbox));
  assert.ok(nodes.enzymeName.innerHTML.includes('Glucose oxidase'));
  assert.ok(requests.some(url => url.endsWith('nutrition-db-v1.json?v=473')));
  assert.ok(requests.some(url => url.includes('product-master')));
});
