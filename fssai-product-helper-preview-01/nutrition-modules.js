/* Deterministic official IFCT supplements. The v473 master is never rewritten. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PMSVNutritionModules = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const VERSION = 475;
  const SOURCE = 'https://www.nin.res.in/ebooks/IFCT2017_16122024.pdf';
  const MASTER_SHA256 = '0d4006f9509f1375d51dd876021441fd06731a9e9cfec9429abf572c773d0342';
  const PDF_SHA256 = '7fc5a5112a57240d25bf695dca82cccd8d93ed54e8c39530e42b5ad1820d0e8c';
  const EXPECTED = {4:329, 5:528, 6:314, 7:528, 8:528, 9:314, 10:314, 11:314, 12:14};
  const FIELD_COUNTS = {4:8,5:20,6:7,7:29,8:18,9:10,10:38,11:9,12:22};
  const PAGE_RANGES = {4:[131,147],5:[151,206],6:[209,224],7:[227,294],8:[297,361],9:[364,381],10:[384,451],11:[454,471],12:[474,475]};
  const FILES = {4:'carotenoids',5:'minerals',6:'starch-sugars',7:'fatty-acids',8:'amino-acids',9:'organic-acids',10:'polyphenols',11:'oligosaccharides-phytosterols',12:'oils-fatty-acids'};
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const finiteValue = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const sameKeys = (actual, expected) => actual.length === expected.length && actual.every(k => expected.includes(k));
  const nameKey = value => String(value).normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  const codeValid = code => typeof code === 'string' && /^[A-T]\d{3}$/.test(code);
  function requireThat(condition, message) { if (!condition) throw new Error(message); }

  function baseIndex(base) {
    requireThat(object(base) && Array.isArray(base.profiles), 'Invalid nutrition master');
    const profiles = new Map();
    for (const profile of base.profiles) {
      if (!profile.ifct_code) continue;
      requireThat(codeValid(profile.ifct_code) && !profile.ifct_code.startsWith('T') && !profiles.has(profile.ifct_code), 'Duplicate or invalid master food code');
      requireThat(profile.source_authority === 'ICMR-NIN' && profile.active_for_calculation === true && typeof profile.display_name === 'string', 'Invalid IFCT profile identity');
      profiles.set(profile.ifct_code, profile);
    }
    requireThat(profiles.size === 528, 'Unexpected master profile count');
    const references = new Map();
    for (const entry of base.edible_oils_fats_ifct_table12?.entries || []) {
      requireThat(/^T\d{3}$/.test(entry.ifct_code) && !references.has(entry.ifct_code) && typeof entry.name === 'string', 'Duplicate or invalid oil reference code');
      references.set(entry.ifct_code, entry);
    }
    requireThat(references.size === 14, 'Unexpected oil reference count');
    return {profiles, references};
  }

  function validateManifest(manifest, base) {
    const index = baseIndex(base);
    requireThat(object(manifest) && manifest.schema_version === 1 && manifest.runtime_version === VERSION, 'Unsupported IFCT manifest');
    requireThat(manifest.source_authority === 'ICMR-NIN' && manifest.source_url === SOURCE && manifest.source_pdf_sha256 === PDF_SHA256, 'Unapproved IFCT source');
    requireThat(manifest.base_database?.file === 'nutrition-db-v1.json' && manifest.base_database.cache_version === 473 && manifest.base_database.sha256 === MASTER_SHA256 && manifest.base_database.git_blob_sha === '8eda506e6083089173ede637560a89ad69dc1be9', 'Master version mismatch');
    requireThat(object(manifest.food_names) && Object.keys(manifest.food_names).length === 542, 'Invalid food registry');
    for (const [code, profile] of index.profiles) requireThat(own(manifest.food_names, code) && nameKey(manifest.food_names[code]) === nameKey(profile.display_name), 'Master food name/code mismatch: ' + code);
    for (const [code, entry] of index.references) requireThat(own(manifest.food_names, code) && nameKey(manifest.food_names[code]) === nameKey(entry.name), 'Reference food name/code mismatch: ' + code);
    requireThat(Array.isArray(manifest.modules) && manifest.modules.length === 9, 'Unexpected supplement count');
    const seen = new Set();
    for (const definition of manifest.modules) {
      const table = definition.table;
      requireThat(Number.isInteger(table) && own(EXPECTED, table) && !seen.has(table), 'Duplicate or unsupported table'); seen.add(table);
      requireThat(definition.file === `ifct-table${table}-${FILES[table]}.json`, 'Unexpected supplement filename');
      requireThat(definition.expected_rows === EXPECTED[table] && Array.isArray(definition.expected_codes) && definition.expected_codes.length === EXPECTED[table] && new Set(definition.expected_codes).size === EXPECTED[table], 'Unexpected row count or duplicate expected code');
      requireThat(definition.expected_codes.every(code => codeValid(code) && own(manifest.food_names, code) && (table === 12 ? index.references.has(code) : index.profiles.has(code))), 'Unmatched expected food code');
      const basis = table === 8 ? 'per_100g_protein' : table === 12 ? 'percent_total_fatty_acid_methylesters' : 'per_100g_edible_portion';
      requireThat(definition.basis === basis && definition.reference_only === (table === 8 || table === 12), 'Incompatible nutrition basis');
      requireThat(Array.isArray(definition.expected_fields) && definition.expected_fields.length === FIELD_COUNTS[table] && new Set(definition.expected_fields).size === definition.expected_fields.length && definition.expected_fields.every(k => /^[A-Z][A-Z0-9_]*$/.test(k) && !['CONSTRUCTOR','PROTOTYPE'].includes(k)), 'Invalid field registry');
      requireThat(object(definition.expected_units) && sameKeys(Object.keys(definition.expected_units), definition.expected_fields), 'Missing field units');
      for (const key of definition.expected_fields) {
        const expectedUnit = table === 4 ? 'µg' : table === 5 && ['AS','HG','SE'].includes(key) ? 'µg' : [6,8].includes(table) || table === 11 && ['RAFS','STAS','VERS','AJUGOSE','SAPONIN'].includes(key) ? 'g' : table === 12 ? '%' : 'mg';
        requireThat(definition.expected_units[key] === expectedUnit, 'Manifest nutrient unit mismatch');
      }
      requireThat(/^[a-f0-9]{64}$/.test(definition.sha256) && Number.isInteger(definition.size_bytes) && definition.size_bytes > 0 && definition.size_bytes <= 800000, 'Invalid supplement integrity metadata');
    }
    return index;
  }

  function validateModule(payload, definition, manifest) {
    requireThat(object(payload) && payload.schema_version === 1 && payload.table === definition.table, 'Wrong supplement table');
    requireThat(typeof payload.title === 'string' && payload.title.length > 0, 'Missing supplement title');
    requireThat(payload.source_authority === 'ICMR-NIN' && payload.source_url === SOURCE && payload.source_pdf_sha256 === manifest.source_pdf_sha256, 'Supplement source mismatch');
    requireThat(payload.basis === definition.basis && payload.reference_only === definition.reference_only, 'Supplement basis mismatch');
    requireThat(object(payload.fields) && sameKeys(Object.keys(payload.fields), definition.expected_fields), 'Missing or unexpected nutrient fields');
    for (const key of definition.expected_fields) requireThat(object(payload.fields[key]) && typeof payload.fields[key].label === 'string' && payload.fields[key].unit === definition.expected_units[key], 'Nutrient unit mismatch');
    requireThat(Array.isArray(payload.rows) && payload.rows.length === definition.expected_rows, 'Supplement row count mismatch');
    const codes = new Set();
    for (const row of payload.rows) {
      requireThat(object(row) && codeValid(row.code) && definition.expected_codes.includes(row.code) && !codes.has(row.code), 'Duplicate or mismatched supplement food code'); codes.add(row.code);
      requireThat(typeof row.name === 'string' && nameKey(row.name) === nameKey(manifest.food_names[row.code]), 'Supplement food name/code mismatch: ' + row.code);
      requireThat(object(row.values) && sameKeys(Object.keys(row.values), definition.expected_fields), 'Incomplete nutrient row');
      requireThat(object(row.raw) && sameKeys(Object.keys(row.raw), definition.expected_fields), 'Missing printed value evidence');
      const range = PAGE_RANGES[definition.table];
      requireThat(Array.isArray(row.source_pages) && row.source_pages.length > 0 && new Set(row.source_pages).size === row.source_pages.length && row.source_pages.every(p => Number.isInteger(p) && p >= range[0] && p <= range[1]), 'Missing or mismatched PDF page evidence');
      requireThat(Array.isArray(row.below_detection || []) && Array.isArray(row.not_reported || []) && object(row.unresolved || {}), 'Invalid missing-value reasons');
      const unavailable = new Set([...(row.below_detection || []), ...(row.not_reported || []), ...Object.keys(row.unresolved || {})]);
      requireThat([...unavailable].every(key => definition.expected_fields.includes(key)), 'Unknown unavailable field');
      for (const key of row.below_detection || []) requireThat(row.raw[key] === '', 'Blank-cell evidence mismatch');
      for (const key of row.not_reported || []) requireThat(row.raw[key] === null, 'Absent-panel evidence mismatch');
      for (const key of Object.keys(row.unresolved || {})) requireThat(typeof row.unresolved[key] === 'string' && row.unresolved[key].length > 0, 'Missing unresolved-cell reason');
      for (const key of definition.expected_fields) {
        const value = row.values[key];
        requireThat(value === null || finiteValue(value), 'Non-numeric nutrient value');
        requireThat(value === null ? unavailable.has(key) : !unavailable.has(key), 'Missing-value evidence mismatch');
        if (value !== null) {
          const evidence = Array.isArray(row.raw[key]) ? row.raw[key] : [row.raw[key]];
          requireThat(evidence.length > 0 && evidence.every(raw => typeof raw === 'string' && /^\d+(?:\.\d+)?(?:±\d+(?:\.\d+)?)?$/.test(raw) && Number(raw.split('±')[0]) === value), 'Printed mean/value mismatch');
          if (definition.reference_only) requireThat(value <= 100, 'Reference value out of basis range');
        }
      }
    }
    requireThat(definition.expected_codes.every(code => codes.has(code)), 'Missing expected food code');
  }

  function merge(base, manifest, payloads) {
    validateManifest(manifest, base);
    requireThat(Array.isArray(payloads) && payloads.length === manifest.modules.length, 'Missing supplements');
    const byTable = new Map();
    for (const payload of payloads) { requireThat(!byTable.has(payload.table), 'Duplicate payload table'); byTable.set(payload.table, payload); }
    for (const definition of manifest.modules) validateModule(byTable.get(definition.table), definition, manifest);
    // Validate every file before constructing or publishing the merged candidate.
    const merged = JSON.parse(JSON.stringify(base));
    const index = baseIndex(merged);
    merged.modular_ifct = {runtime_version:VERSION, source_authority:'ICMR-NIN', source_url:SOURCE, tables:{}, row_count:0};
    merged.ifct_reference_by_code = {};
    for (const definition of manifest.modules) {
      const payload = byTable.get(definition.table);
      merged.modular_ifct.tables[definition.table] = {title:payload.title, fields:payload.fields, basis:payload.basis, reference_only:payload.reference_only, row_count:payload.rows.length};
      merged.modular_ifct.row_count += payload.rows.length;
      for (const row of payload.rows) {
        if (definition.table === 12) merged.ifct_reference_by_code[row.code] = row;
        else {
          const profile = index.profiles.get(row.code);
          if (!profile.ifct_tables) profile.ifct_tables = {};
          requireThat(!own(profile.ifct_tables, definition.table), 'Supplement table already present on profile');
          profile.ifct_tables[definition.table] = row;
        }
      }
    }
    return merged;
  }

  async function digest(bytes) {
    const cryptoApi = globalThis.crypto || (typeof require === 'function' ? require('node:crypto').webcrypto : null);
    requireThat(cryptoApi?.subtle, 'Integrity verification unavailable');
    return Array.from(new Uint8Array(await cryptoApi.subtle.digest('SHA-256', bytes)), x => x.toString(16).padStart(2, '0')).join('');
  }

  async function readJson(fetchImpl, url, maxBytes, expected) {
    const response = await fetchImpl(url, {cache:'reload'});
    requireThat(response.ok, 'Nutrition data HTTP ' + response.status);
    const bytes = new Uint8Array(await response.arrayBuffer());
    requireThat(bytes.length > 0 && bytes.length <= maxBytes, 'Nutrition data size limit exceeded');
    if (expected) {
      if (expected.size_bytes) requireThat(bytes.length === expected.size_bytes, 'Nutrition file size mismatch');
      requireThat(await digest(bytes) === expected.sha256, 'Nutrition file integrity mismatch');
    }
    return JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes));
  }

  async function load(options = {}) {
    const fetchImpl = options.fetchImpl || globalThis.fetch.bind(globalThis);
    const dataPath = options.dataPath || './data/';
    const base = await readJson(fetchImpl, dataPath + 'nutrition-db-v1.json?v=473', 3000000, {sha256:MASTER_SHA256});
    baseIndex(base);
    try {
      const manifest = await readJson(fetchImpl, dataPath + 'ifct-modules-manifest.json?v=' + VERSION, 200000);
      validateManifest(manifest, base);
      const payloads = await Promise.all(manifest.modules.map(definition => readJson(fetchImpl, dataPath + definition.file + '?v=' + VERSION, 800000, definition)));
      return {database:merge(base, manifest, payloads), supplementsLoaded:true, warning:null};
    } catch (error) {
      return {database:base, supplementsLoaded:false, warning:'Additional IFCT composition could not be verified. Existing verified nutrition data remains available; missing values are not estimated.', diagnostic:String(error.message)};
    }
  }

  function aggregate(database, table, ingredients) {
    const definition = database.modular_ifct?.tables[table];
    requireThat(definition && definition.basis === 'per_100g_edible_portion' && !definition.reference_only, 'Reference basis cannot be aggregated as food mass');
    requireThat(Array.isArray(ingredients) && ingredients.every(item => finiteValue(item.grams)), 'Invalid formulation masses');
    const total = ingredients.reduce((sum, item) => sum + item.grams, 0);
    const result = {};
    for (const key of Object.keys(definition.fields)) {
      let amount = 0, covered = 0;
      for (const ingredient of ingredients) {
        if (ingredient.grams === 0) continue;
        const value = ingredient.profile?.ifct_tables?.[table]?.values?.[key];
        if (!finiteValue(value)) continue;
        amount += value * ingredient.grams / 100; covered += ingredient.grams;
      }
      const complete = total > 0 && Math.abs(total - covered) <= 0.000001;
      result[key] = {value:complete ? amount * 100 / total : null, complete, coverage:total > 0 ? covered / total * 100 : 0};
    }
    return result;
  }
  return {VERSION, merge, load, aggregate, validateManifest, validateModule, finiteValue};
});
