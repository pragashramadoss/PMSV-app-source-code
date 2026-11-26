import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});
ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const plan=ctx.PMSVTestingPlan,ws=ctx.PMSVCatalogueWorksheets,rev=ctx.PMSV_REVIEW_REGISTER;
assert(ws.available);
const metal=ctx.PMSVMetalPanel,id=metal.catechuId;
const reference=metal.catechuRows();
assert.equal(reference.length,3);
assert(reference.every(r=>r.length===reference[0].length));
assert.deepEqual(Array.from(reference.slice(1),r=>[r[1],r[2],r[4]]),[['Lead','10','Dry matter'],['Copper','30','As-supplied mass of solid']]);
assert(!ws.pendingSourceRows().some(r=>r[0]===id));
const flavour={panelCatechuForm:'flavour',panelCatechuSpec:'Single aqueous heartwood extract',panelCatechuUse:'India flavoured food use record 12',panelCatechuLot:'C146',panelCatechuCopper:'Applicability record for the solid',panelCatechuPbBasis:'dry',panelCatechuCuBasis:'supplied'};
for(const vetDate of ['2026-11-26','2026-12-01']){
  for(const [m,name,max,key] of [['Pb','Lead',10,'Pb60'],['Cu','Copper',30,'Cu5']]){
    const entry=state=>plan.entries(id,vetDate,state).find(r=>r.area==='Metals'&&r.parameter===name);
    const s={...flavour,vetDate,panelLabMetal:m,panelLabRef:'Lab-146',panelLabUnit:'mg/kg',panelLabNumber:String(max),panelLabSample:'C146',panelLabBasis:'yes'};
    assert.equal(metal.forMetal(id,m,s).keys[0],key);
    assert(entry(s).limit.startsWith(max+' ppm'));
    assert.equal(entry({}).limit,'');
    assert.match(metal.lab(id,s),/Within/);
    assert.match(metal.lab(id,{...s,panelLabNumber:String(max+0.1)}),/Outside/);
    assert.match(metal.lab(id,{...s,panelLabSample:'Other lot'}),/lot/);
    assert(!/Within|Outside/.test(metal.lab(id,{...s,panelLabUnit:'mg\/L'})));
    for(const k of ['panelCatechuSpec','panelCatechuUse','panelCatechuLot','panelCatechu'+m+'Basis',...(m==='Cu'?['panelCatechuCopper']:[])]){
      assert.equal(entry({...s,[k]:'',panel_Pb:'Pb60',panel_PbRef:'Old'}).limit,'');
    }
    assert.equal(entry({...s,panelCatechuForm:'other'}).limit,'');
    const ordinary={...s,panelCatechuForm:'ordinary',panelCatechuUse:'Named articles reviewed',panelCatechuPbBasis:'supplied'};
    assert.equal(metal.forMetal(id,m,ordinary).kind,'residual');
    assert.equal(metal.forMetal(id,m,{...s,['panelCatechu'+m+'Basis']:m==='Cu'?'dry':'supplied'}).kind,'check');
  }
}
