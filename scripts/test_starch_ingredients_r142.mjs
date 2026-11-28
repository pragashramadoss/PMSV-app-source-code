import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir = new URL('../fssai-helper/', import.meta.url);
const ctx = vm.createContext({});
ctx.window = ctx;
const html = fs.readFileSync(new URL('index.html', dir), 'utf8');
for (const [, file] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)) {
  vm.runInContext(fs.readFileSync(new URL(file, dir), 'utf8'), ctx);
}
const {PMSVCropScope: crop, PMSVTestingPlan: plan, PMSVMetalPanel: metals, PMSVRecipeSamples: recipes, PMSVCatalogueWorksheets: worksheets} = ctx;
const id = recipes.syrup;
assert(worksheets.available);
for (const date of ['2026-11-26', '2026-12-01']) {
  const references = plan.starchRows(date).slice(1);
  assert.deepEqual(Array.from(references, r => r[5]), ['5.0','1','10','10']);
  assert.match(references[1][3], /JECFA/);
  const ash = {panelDextrinForm:'starchTrehalose', panelDextrinLot:'T-7', panelDextrinSpec:'Supplier starch conversion dossier', panelDextrinReport:'Ash COA 7', panelDextrinBasis:'yes', panelDextrinAsh:'1.000001',
    panelLabMetal:'Pb', panelLabSample:'T-7', panelLabRef:'Lead report', panelLabUnit:'mg/kg', panelLabNumber:'5', panelLabBasis:'yes', panelLabEdition:plan.metalEdition(date), vetDate:date};
  const lead = patch => plan.sugarRows(metals.trehaloseId, date, {...ash, ...patch}).find(r=>r[5]==='Lead');
  assert.match(lead({})[9], /Within the cited Lead/);
  assert.match(lead({panelLabSample:'T-8'})[9], /same lot/);
  assert.match(lead({panelLabNumber:'5.01'})[9], /Outside/);
  for (const change of [{panelDextrinAsh:'1.0000'},{panelDextrinAsh:'0.9'},{panelDextrinAsh:''},{panelDextrinForm:'other'},{panelDextrinBasis:''},{panelDextrinSpec:''},{panelDextrinReport:''}]) assert.equal(lead(change)[7], '');
  for (const [sample,role] of [['flourSyrup','finished'],['intakeFlour','ingredient']]) {
    const state = {vetDate:date,crop_cyan:sample,crop_cyanLot:'S-7',crop_cyanRef:'Material / lot record',crop_syrupFlour:'Cassava flour',crop_syrupArticle:'Approved classification and manufacturing link',
      tox_hcn_role:role,tox_hcn_sample:'S-7',tox_hcn_report:'Report S7',tox_hcn_unit:'ppm',tox_hcn_value:'10'};
    const row = patch => plan.exportRows(id,date,false,{...state,...patch}).find(r=>r[5]==='Hydrocyanic acid'&&r[2]===plan.areas[3]);
    const result = patch => crop.labResult(id,'hcn',{...state,...patch},date);
    assert.match(row({})[7], /10 ppm/);
    assert.match(row({})[3], /serial 2/);
    state.tox_hcn_basis=result({}).stamp;
    assert.match(result({}).outcome, /Within the cited/);
    assert.match(result({tox_hcn_value:'10.01'}).outcome,/Above the cited/);
    assert.match(result({tox_hcn_sample:'S-8'}).outcome,/documented lot/);
    assert.match(result({tox_hcn_role:role==='ingredient'?'finished':'ingredient'}).outcome,/different sample role/);
    for (const change of [{crop_cyan:'other'},{crop_cyanRef:''},{crop_cyanLot:''},{crop_syrupFlour:'Tapioca starch'},{crop_syrupFlour:'Maize'},{crop_syrupFlour:'Inulin'},...(role==='finished'?[{crop_syrupArticle:''}]:[])]) assert.equal(row(change)[7], '');
  }
}
assert.equal(plan.starchRows('2020-01-01').length,1);
