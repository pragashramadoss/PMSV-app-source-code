import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const modules=[...fs.readFileSync(new URL('index.html',dir),'utf8').matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)]
  .map(([,file])=>fs.readFileSync(new URL(file,dir),'utf8'));
const stored=new Map();
function open(){
  const ctx=vm.createContext({localStorage:{getItem:key=>stored.get(key)||null}});
  ctx.window=ctx;for(const js of modules)vm.runInContext(js,ctx);return ctx;
}
const c=open(),p=c.PMSVTestingPlan,w=c.PMSVCatalogueWorksheets,m=c.PMSVMetalPanel;
assert(w.available&&c.PMSV_REVIEW_REGISTER.measuredPlanReview.products===533);
const current='2026-11-22',amended='2026-12-01',besan='06-06-2-besan',fish='02-02-1-fish-oil',powder='05-05-1-cocoa-powder';
const report='QA-116 report, "original"';
let checked=0;
function assertComposition(id,selection){
  for(const {i,v:{spec}} of w.enabledCriteria(id,selection)){
    const state={...selection,criterion:String(i),result:String(spec.value??spec.min),unitConfirmed:'yes',compReport:report,reference:'QA-116 sample'};
    const rows=p.entries(id,current,state).filter(row=>row.notes?.includes(report));
    assert.equal(rows.length,1,id+' '+spec.parameter);const [r]=rows;
    const cerealCount=/^2\.4\.(?:11\([12]\)|13\([1-5]\))$/.test(r.article)&&
      ['Total bacterial count','Coliform bacteria','Bacterial count','Coliform count','Total plate count','Yeast and mould count'].includes(spec.parameter);
    assert.equal(r.area,cerealCount?'Microbiology':'Composition and identity',id+' '+spec.parameter);
    assert.equal(r.parameter,spec.parameter);
    assert(r.notes.includes(w.resultText(id,state)));assert(r.notes.includes('QA-116 sample'));
    assert(r.source.includes('https://'));if(spec.analytical_basis)assert(r.notes.includes(spec.analytical_basis));
    if(spec.effective_from&&c.PMSVCatalogueEvidence.products[id].gazetteFindings?.some(g=>g.clause===spec.source_clause&&g.effective===spec.effective_from))
      assert.equal(r.status,'Gazette finding');
    checked++;
  }
}
for(const {id} of c.PMSV_CATALOGUE)assertComposition(id,{});
for(const [id,profile] of c.PMSVVariantComposition.profiles)for(const form of profile.forms)
  for(const sweetener of profile.kind==='gum'?['only','other','']:[''])assertComposition(id,{compVariant:form.name,compSweetener:sweetener});
assert(checked>=360);
const selection={compVariant:'Fat Reduced Cocoa Powder (Medium Fat)',criterion:'1',result:'20.000000000000001',unitConfirmed:'yes',compReport:report};
assert(p.exportRows(powder,current,false,selection).some(r=>r[9].includes(report)&&r[9].includes('Outside')));
for(const change of [{result:'<LOQ'},{unitConfirmed:''}])assert(!p.entries(powder,current,{...selection,...change}).some(r=>r.notes?.includes(report)&&/Within the cited|Outside the cited/.test(r.notes)));
assert(!p.entries(powder,current,{...selection,compVariant:'Unknown grade'}).some(r=>r.notes?.includes(report)));
function lab(id,date,metal,value,extra={}){
  return {vetDate:date,panelLabMetal:metal,panelLabNumber:value,panelLabUnit:'mg/kg',panelLabBasis:'yes',
    panelLabEdition:p.metalEdition(date),panelLabRef:report,...extra};
}
function verify(id,state,message){
  const direct=m.lab(id,state);
  assert(direct.includes(message),id+' '+direct);
  const rows=p.entries(id,state.vetDate,state).filter(r=>r.area===p.areas[2]&&r.notes?.includes(report));
  assert.equal(rows.length,1);assert(rows[0].notes.includes(message));
  assert(rows[0].notes.includes(state.panelLabNumber)&&rows[0].notes.includes(state.panelLabUnit));
  return rows[0];
}
for(const metal of ['Pb','Cd']){
  const limit=metal==='Pb'?'0.2':'0.1';
  for(const id of c.PMSVMetalPanelData.groups.plainPulseFlour){
    verify(id,lab(id,amended,metal,limit),'Within');const r=verify(id,lab(id,amended,metal,limit+'00000000000001'),'Outside');
    assert.equal(r.limit,limit);assert(r.source.includes('272840.pdf'));
  }
}
verify(besan,lab(besan,current,'Pb','0.3'),'Within');verify(besan,lab(besan,amended,'Pb','0.3'),'Outside');
for(const change of [{panelLabEdition:''},{panelLabEdition:'original'},{panelLabUnit:'mg/L'},{panelLabBasis:''}])
  verify(besan,lab(besan,amended,'Pb','0.3',change),'Confirm');
assert(m.lab(besan,lab(besan,amended,'Pb','0.3',{panelLabRef:''})).startsWith('Confirm'));
verify('06-06-2-solvent-extract-soya-flour',lab('',amended,'Cd','0.05'),'Determine how');
verify(powder,lab(powder,amended,'Pb','<LOQ'),'non-negative decimal');
const fishLab=(form,value)=>lab(fish,amended,'As',value,{panelLabAsForm:form});
for(const [form,value,expect] of [['','0.09','Identify whether'],['total','0.0999999999999','Below'],['total','0.1','Exactly'],['total','0.1000000000001','Determine inorganic arsenic'],['inorganic','0.1','Within'],['inorganic','0.1000000000001','Outside']])verify(fish,fishLab(form,value),expect);
verify(fish,{...fishLab('inorganic','0.09'),vetDate:current},'Review the reported inorganic');
assert(m.lab(besan,lab(besan,'2026-11-19','Pb','0.3')).startsWith('Select an assessment date'));
assert(!p.entries(besan,'2026-11-19',lab(besan,current,'Pb','0.3')).some(r=>r.notes?.includes(report)));
const legacy=lab(besan,amended,'Pb','0.3');delete legacy.panelLabEdition;
stored.set('pmsv-fssai-worksheet-r93:'+besan,JSON.stringify(legacy));
const oldRows=open().PMSVCatalogueWorksheets.productPlan(besan);
assert(oldRows.some(r=>r[9].includes(report)&&r[9].includes('Confirm the matching unit')));
stored.set('pmsv-fssai-worksheet-r93:'+besan,JSON.stringify(lab(besan,amended,'Pb','0.3')));
stored.set('pmsv-fssai-worksheet-r93:'+powder,JSON.stringify(selection));
const restored=open().PMSVCatalogueWorksheets;
assert(restored.productPlan(besan).some(r=>r[9].includes(report)&&r[9].includes('Outside the cited Lead')));
assert(restored.productPlan(powder).some(r=>r[9].includes(report)&&r[9].includes('Outside the cited source-edition')));
for(const date of [current,amended]){
  const bulk=p.exportRows(null,date,false,{...selection,...legacy});
  assert.equal(new Set(bulk.slice(1).map(r=>r[0])).size,533);assert(!bulk.some(r=>r.includes(report)||r[9].includes('QA-116')));
}
console.log(checked+' composition measurements, date-specific metals, legacy confirmations, persistence and generic export isolation verified.');
