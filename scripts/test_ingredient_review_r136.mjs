import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,file] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(file,dir),'utf8'),ctx);
}
const {PMSVCatalogueWorksheets:w,PMSVTestingPlan:p,PMSVMetalPanel:m,PMSV_REVIEW_REGISTER:r}=ctx;
const leaf=m.silverId,catechu=p.catechuId,beans='04-04-2-cocoa-beans';
assert(w.available);
assert.equal(r.firstSourceReview.withRoute,523);
const queue=w.pendingSourceRows().slice(1).map(row=>row[0]);
assert(queue.length===10&&!queue.includes(leaf)&&!queue.includes(catechu)&&queue.includes(beans));
const scope={panelSilverForm:'leaf',panelSilverSpec:'Spec 174',panelSilverUse:'Approved use record',panelSilverLot:'Silver lot 12',panelSilverDry:'yes'};
const report={...scope,panelLabBasis:'yes',panelLabRef:'Report 52',panelLabSample:'Silver lot 12',panelLabUnit:'µg/kg'};
for(const date of ['2026-11-24','2026-12-01']){
  const rows=p.ingredientRows(null,date).slice(1);
  assert.equal(rows.length,19);
  for(const row of rows.filter(r=>r[2]==='Metals')){
    assert.equal(row[7],'');assert(row[15].includes('dry colouring matter'));
  }
  for(const [name,metal,max] of [['Lead','Pb',10],['Copper','Cu',30],['Arsenic','As',5]]){
    const s={...report,panelLabEdition:p.metalEdition(date),vetDate:date,panelLabMetal:metal,panelLabNumber:String(max*1000),panelSilverAs:'Supplier classification record'};
    assert.match(m.lab(leaf,s),/Within the cited/);
    assert.match(m.lab(leaf,{...s,panelLabNumber:String(max*1000+1)}),/Outside the cited/);
    assert(!/Within/.test(m.lab(leaf,{...s,panelLabSample:'Unrelated lot'})));
    for(const k of ['panelSilverUse','panelSilverSpec','panelSilverLot','panelSilverDry','panelSilverForm',...(metal==='As'?['panelSilverAs']:[])]){
      assert.equal(m.forMetal(leaf,metal,{...s,[k]:'',panel_Pb:'Pb70',panel_PbRef:'Old record'}).kind,'check');
    }
    assert.equal(m.forMetal(leaf,metal,{...s,panelSilverForm:'other'}).kind,'check');
    const line=p.ingredientRows(leaf,date,s).find(r=>r[2]==='Metals'&&r[5]===name);
    assert(line[7]&&line[9].includes('Within')&&line[14].includes('#page=320'));
  }
}
assert.equal(w.enabledCriteria(catechu,{}).length,4);
for(const [subtype,limit] of [['ordinary',0.5],['bhatti',1.5]]){
  const state={ingredientSubtype:subtype,compReport:'Report 6',reference:'Katha 2',unitConfirmed:'yes'};
  const choices=w.enabledCriteria(catechu,state);assert.equal(choices.length,5);
  const ash=choices.find(c=>c.subtype===subtype);
  const s={...state,criterion:ash.i,result:'1'};
  assert.match(w.resultText(catechu,s),limit===0.5?/Outside/:/Within/);
  assert(p.ingredientRows(catechu,undefined,s).some(row=>row[9].includes('Report 6')&&row[9].includes('Katha 2')));
}
assert.equal(w.enabledCriteria(beans).length,5);
assert.equal(w.enabledCriteria(beans).filter(c=>c.v.spec.unit==='% by count').length,4);
const fine=w.enabledCriteria(leaf).find(c=>c.v.spec.parameter==='Silver fineness');
const s={criterion:fine.i,result:'1001',unitConfirmed:'yes',reference:'Leaf 2',compReport:'Rpt 1'};
assert.match(w.resultText(leaf,s),/1,000/);
assert.match(w.resultText(leaf,{...s,result:'999'}),/Within/);
