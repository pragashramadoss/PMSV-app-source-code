/* Per-form composition tables for Chapter 2.7. Numeric values come from catalogue-rule-data. */
(function (root) {
  'use strict';
  const ids = {
    '05-05-1-cocoa-powder': 'powder',
    '05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake': 'massCake',
    '05-05-3-chewing-gum-and-bubble-gum': 'gum'
  };
  const moistureFatFree = 'moisture- and fat-free basis';
  const cocoaFields = [
    ['moisture_max_pct', 'Moisture', '<=', 'as supplied'],
    ['cocoa_butter_min_pct_dry', 'Cocoa butter', '>=', 'dry basis'],
    ['cocoa_butter_pct_dry_range', 'Cocoa butter', 'range', 'dry basis'],
    ['cocoa_butter_max_pct_dry', 'Cocoa butter', '<=', 'dry basis'],
    ['cocoa_shell_and_germ_max_pct_fat_free_dry_matter', 'Shell and germ', '<=', 'fat-free dry matter'],
    ['cocoa_shell_max_pct_alkali_free', 'Shell only', '<=', 'alkali-free basis'],
    ['cocoa_butter_pct_range', 'Cocoa butter', 'range', 'as supplied'],
    ['acid_insoluble_ash_max_pct_moisture_fat_free', 'Acid-insoluble ash', '<=', moistureFatFree],
    ['alkalinity_total_ash_as_k2o_max_pct', 'Total ash alkalinity as K₂O', '<=', moistureFatFree],
    ['alkalinity_total_ash_as_k2o_max_pct_moisture_fat_free', 'Total ash alkalinity as K₂O', '<=', moistureFatFree],
    ['crude_fibre_max_pct_moisture_fat_free', 'Crude fibre', '<=', moistureFatFree]
  ];
  const sweeteners = {other:'Sugar or another sweetener is used (alone or in a mixture)', only:'Only artificial sweetener is used'};
  const columns = ['Composition limits by product variant', 'FSSAI composition table pages', 'Selected composition variant and sweetener basis', 'Measured composition result and comparison'];
  const profiles = new Map();
  for (const [id, kind] of Object.entries(ids)) {
    const evidence = root.PMSVCatalogueEvidence;
    const key = evidence.products[id].standard;
    const anchor = evidence.standards[key];
    const forms = root.PMSVCatalogueRules.standards[key].sections.variants.map(variant => {
      const rows = kind === 'gum'
        ? variant.composition.map(row => ({...row, analytical_basis:'as supplied', conditional:!!row.exception}))
        : cocoaFields.filter(([key]) => Object.hasOwn(variant,key)).map(([key,parameter,operator,analytical_basis]) => {
          const value = variant[key];
          const limits = operator === 'range' ? {min:value[0],max:value[1]} : {value};
          return {parameter,operator,...limits,analytical_basis,unit:'% by weight'};
        });
      return {name:variant.name,rows};
    });
    const pages = kind === 'gum' ? [5] : anchor.p;
    const source = evidence.documents[anchor.doc].url;
    profiles.set(id, {kind,forms,pages,source,article:key.split('#')[1]});
  }
  function limit(row) {
    const value = row.operator === 'range' ? row.min+'–'+row.max : ({'<=':'≤','>=':'≥'})[row.operator]+row.value;
    return value+'% ('+row.analytical_basis+')';
  }
  function applicability(row,sweetener) {
    if (!row.conditional || sweetener === 'other') return '';
    return sweetener === 'only' ? 'Does not apply under the artificial-sweetener-only proviso' : 'Confirm the sweeteners used';
  }
  function note(kind) {
    if (kind === 'gum') return 'The reducing-sugars and sucrose limits depend on the sweeteners used. The other four limits apply to both formulations.';
    if (kind === 'powder') return 'The published dry-basis cocoa-butter limits overlap at 10% and 20%. Choose the declared grade before comparing.';
    return 'Cocoa cake has no cocoa-butter limit in this table. Shell only and shell plus germ have different reporting bases.';
  }
  function selected(id,state) {
    return profiles.get(id)?.forms.find(form => form.name === state.compVariant);
  }
  function enabled(id,state) {
    const form = selected(id,state);
    return (form?.rows || []).map((spec,i) => ({i:String(i),v:{spec,compare:true}}))
      .filter(({v}) => !applicability(v.spec,state.compSweetener));
  }
  function values(id,state,comparison) {
    const p=profiles.get(id);
    if (!p) return columns.map(()=>'');
    const form=selected(id,state);
    const chosen=enabled(id,state).find(row=>row.i===state.criterion);
    const limits=p.forms.map(f=>f.name+' — '+f.rows.map(r=>r.parameter+' '+limit(r)+(r.conditional?' (except when only artificial sweetener is used)':'')).join('; ')).join(' | ');
    const recipe=p.kind==='gum' && form ? sweeteners[state.compSweetener] || 'Sweeteners unconfirmed' : '';
    const measured=chosen && state.result?.trim() ? chosen.v.spec.parameter+' '+state.result+'% · '+chosen.v.spec.analytical_basis+' · '+limit(chosen.v.spec)+' · '+comparison : '';
    return [limits+' | '+note(p.kind),p.pages.map(n=>p.source+'#page='+n).join(' | '),[form?.name,recipe].filter(Boolean).join(' · '),measured];
  }
  root.PMSVVariantComposition = {profiles,columns,sweeteners,selected,enabled,limit,note,applicability,values};
})(globalThis);
