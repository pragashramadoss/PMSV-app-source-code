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
const metal=ctx.PMSVMetalPanel,id=metal.carobId;
const rows=metal.carobRows().slice(1);
assert.deepEqual(Array.from(rows,r=>[r[1],r[2],r[3]]),[['Copper','5.0','mg/kg'],['Arsenic','0.2','mg/kg'],['Tin','250','mg/kg']]);
assert(rows.every(r=>r[4]==='Pulp and pulp products of any fruit'&&r[8].includes('#page=')&&r[9].includes('cgiar.org')));
assert.equal(rev.firstSourceReview.withRoute,524);
assert.equal(ws.pendingSourceRows().length-1,9);
assert(!ws.pendingSourceRows().some(r=>r[0]===id));
const pulp={panelCarobForm:'pulp',panelCarobSpec:'Supplier process 17, seeds separated before roasting and milling',panelCarobScope:'Single pulp powder classified under CTR fruit-pulp products',panelCarobLot:'CB-148',panelCarobBasis:'supplied'};
for(const vetDate of ['2026-11-26','2026-12-01']){
  for(const [m,name,max,key] of [['Cu','Copper',5,'Cu22'],['As','Arsenic',0.2,'As70'],['Sn','Tin',250,'Sn27']]){
    const entry=s=>plan.entries(id,vetDate,s).find(r=>r.area==='Metals'&&r.parameter===name);
    const state={...pulp,vetDate,panelLabMetal:m,panelLabRef:'Lab 148',panelLabUnit:'mg/kg',panelLabNumber:String(max),panelLabSample:'CB-148',panelLabBasis:'yes'};
    assert.equal(metal.forMetal(id,m,state).keys[0],key);
    assert.equal(parseFloat(entry(state).limit),max);
    assert.equal(entry({}).limit,'');
    assert.match(metal.lab(id,state),/Within/);
    assert.match(metal.lab(id,{...state,panelLabNumber:String(max+0.1)}),/Outside/);
    assert.match(metal.lab(id,{...state,panelLabSample:'Unrelated'}),/lot/);
    for(const unit of ['mg/L','µg/L'])assert.doesNotMatch(metal.lab(id,{...state,panelLabUnit:unit}),/Within|Outside/);
    for(const changes of [{panelCarobForm:'whole'},{panelCarobForm:'gum'},{panelCarobForm:'blend'},{panelCarobBasis:'dry'},{panelCarobSpec:' '},{panelCarobScope:''},{panelCarobLot:''},{panelCarobBasis:''}]){
      const modified={...state,...changes,['panel_'+m]:key,['panel_'+m+'Ref']:'Legacy selection'};
      assert.equal(entry(modified).limit,'');
      assert.doesNotMatch(metal.lab(id,modified),/Within|Outside/);
    }
  }
  const intake=plan.incomingExport(null,vetDate).slice(1);
  for(const [item,serials] of [['06-06-2-arrowroot',[13,23,53,114]],['10-10-2-egg-powder',[1,13,23,67,71,129,144,145,150]]]){
    const actual=intake.filter(r=>r[0]===item&&r[2]==='Pesticide residues');
    assert.deepEqual(Array.from(actual,r=>Number(r[3].split(' ').at(-1))),serials);
    assert(actual.every(r=>r[4].startsWith('Separately sampled')&&r[8]==='mg/kg'&&r[14].includes('#page=')));
  }
}
