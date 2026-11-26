import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});
ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,file] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(file,dir),'utf8'),ctx);
}
const {PMSVMetalPanel:metal,PMSVTestingPlan:plan,PMSVCatalogueWorksheets:ws,PMSV_REVIEW_REGISTER:reg}=ctx;
const imported=metal.sajjiId,[colostrum,jelly]=reg.importAndFormReview.formProductIds;
const scope={panelKharForm:'imported',panelKharDocument:'Bill of entry 27',panelKharLot:'Khar lot 137',panelKharCurrent:'yes'};
const lab={panelLabUnit:'mg/kg',panelLabRef:'Report 9',panelLabSample:scope.panelKharLot,panelLabBasis:'yes'};
assert.equal(reg.firstSourceReview.withRoute,521);
assert.equal(reg.firstSourceReview.pending,12);
assert.equal(reg.legalProductApprovals,0);
const queue=ws.pendingSourceRows().slice(1).map(r=>r[0]);
assert(!queue.includes(imported)&&queue.includes(colostrum)&&queue.includes(jelly));
assert.equal(plan.sampleReviewRows().length,53);
for(const date of ['2026-11-24','2026-12-01']){
  const empty=plan.sampleReviewRows(imported,date).slice(1);
  assert.equal(empty.length,6);
  for(const [metalCode,maximum] of Object.entries({Pb:'2.5',Cu:'30',As:'1.1',Sn:'250',Cd:'1.5',Hg:'1.0'})){
    const name=metal.metals.find(m=>m[1]===metalCode)[0];
    const row=empty.find(r=>r[5]===name);
    const state={...scope,...lab,vetDate:date,panelLabEdition:plan.metalEdition(date),panelLabMetal:metalCode,panelLabNumber:maximum};
    assert.equal(row[7],'');
    assert.equal(row[15],maximum+' ppm');
    assert(row[14].includes('cs_ins_26_2021.pdf#page=2'));
    assert.match(metal.lab(imported,state),/Within the cited/);
    assert.match(metal.lab(imported,{...state,panelLabNumber:maximum.includes('.')?maximum+'000000000001':maximum+'.000000000001'}),/Outside the cited/);
    assert.match(metal.lab(imported,{...state,panelLabUnit:'µg/kg',panelLabNumber:String(Number(maximum)*1000)}),/Within the cited/);
    for(const invalid of [{panelLabSample:'Another lot'},{panelLabUnit:'mg/L'},{panelLabRef:''},{panelLabBasis:''},{panelLabEdition:'unrelated'}]){
      assert.doesNotMatch(metal.lab(imported,{...state,...invalid}),/Within the cited|Outside the cited/);
    }
    for(const invalid of [{panelKharForm:'other'},{panelKharDocument:' '},{panelKharLot:''},{panelKharCurrent:''}]){
      const old={...state,...invalid,['panel_'+metalCode]:metal.unspecifiedMetals[metalCode],['panel_'+metalCode+'Ref']:'Saved generic choice'};
      assert.equal(metal.forMetal(imported,metalCode,old).kind,'check');
      assert.equal(plan.sampleReviewRows(imported,date,old).find(r=>r[5]===name)[7],'');
    }
    const evaluated=plan.sampleReviewRows(imported,date,state).find(r=>r[5]===name);
    assert(evaluated[7]&&evaluated[9].includes('Report 9')&&evaluated[9].includes(scope.panelKharDocument));
  }
}
function measured(id,form,parameter){
  const state={compVariant:form,compReport:'Analysis 137',reference:'Specimen 137',unitConfirmed:'yes'};
  const criterion=ws.enabledCriteria(id,state).find(r=>r.v.spec.parameter===parameter);
  assert(criterion);
  return {...state,criterion:criterion.i};
}
for(const [form,n,minimum] of [['Colostrum',5,'1.8'],['Colostrum Powder',6,'8.5']]){
  assert.equal(ws.enabledCriteria(colostrum,{compVariant:form}).length,n);
  const state={...measured(colostrum,form,'Immunoglobulin G (IgG)'),result:minimum};
  assert.match(ws.resultText(colostrum,state),/Within/);
  assert.match(ws.resultText(colostrum,{...state,result:String(Number(minimum)-0.01)}),/Outside/);
  assert.doesNotMatch(ws.resultText(colostrum,{...state,compReport:''}),/Within/);
  const rows=plan.sampleReviewRows(colostrum,'2026-11-24',state).slice(1);
  assert(rows.every(row=>row[4]===form));
  assert(rows.some(r=>r[5].includes('IgG')&&r[14].includes('21_10_2024')&&r[9].includes('Analysis 137')));
  assert.equal(rows.some(r=>r[5]==='Total ash'&&r[9].includes('Dry basis')),form==='Colostrum Powder');
  assert.equal(rows.some(r=>r[5]==='Scorched particles'&&!r[7]),form==='Colostrum Powder');
}
assert.equal(ws.enabledCriteria(jelly,{}).length,0);
for(const [type,n,upper] of [['Type 1',12,'-20'],['Type 2',8,'-14']]){
  const rows=ws.enabledCriteria(jelly,{compVariant:type});
  assert.equal(rows.length,n);
  const isotope=rows.find(r=>r.v.spec.signed);
  const state=measured(jelly,type,isotope.v.spec.parameter);
  for(const value of [upper,'−29','-25.9'])assert.match(ws.resultText(jelly,{...state,result:value}),/Within/);
  for(const value of ['−29.0000000000000000001',String(Number(upper)+0.001),'20'])assert.match(ws.resultText(jelly,{...state,result:value}),/Outside/);
  assert.doesNotMatch(ws.resultText(jelly,{...state,result:'<−22'}),/Within|Outside/);
  assert(!rows.some(r=>r.v.spec.parameter==='Moisture'));
  const checks=plan.sampleReviewRows(jelly,'2026-11-24',state).slice(1);
  assert(checks.some(r=>r[5].includes('Moisture')&&!r[7]&&r[9].includes('62–68.5')));
  assert.equal(checks.filter(r=>r[6]==='Not applicable to Type 2'&&!r[7]).length,type==='Type 2'?4:0);
}
