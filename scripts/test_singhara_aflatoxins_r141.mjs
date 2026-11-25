import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,script] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(script,dir),'utf8'),ctx);
}
const {PMSVRecipeSamples:S,PMSVCropScope:C,PMSVTestingPlan:P,PMSVCatalogueWorksheets:W}=ctx,id=S.singhara;
assert(W.available);
assert(S.firstSource(id));
assert(!W.pendingSourceRows().some(r=>r[0]===id));
for(const date of ['2026-11-25','2026-12-01']){
  const refs=S.criteriaRows(id,date).slice(1);
  assert.equal(refs.length,8);
  assert.equal(refs.filter(r=>!r[6]).length,1);
  for(const [choice,role,total,b1] of [['trapaNut','ingredient','15','10'],['trapaMilledNut','finished','15','10'],['trapaFood','finished','20','10'],['trapaPair','finished','','10']]){
    const state={crop_af:choice,crop_afLot:'Lot A',crop_afRef:'Milling record A',crop_trapaSpecies:'Trapa bispinosa',crop_trapaArticle:'Decision A',vetDate:date};
    for(const [a,expected] of [['total',total],['b1',b1]]){
      const field='tox_'+a+'_',reading={...state,[field+'role']:role,[field+'report']:'Report A',[field+'sample']:'Lot A',[field+'unit']:'µg/kg',[field+'value']:a==='total'?'18':'10'};
      function assess(patch={}){return C.labResult(id,a,{...reading,...patch},date);}
      const initial=assess();
      if(!expected){assert.equal(initial.stamp,'');assert.match(initial.outcome,/No numeric/);continue;}
      assert(initial.stamp);
      assert.match(initial.criterion,new RegExp('maximum '+expected+' µg/kg'));
      const approved=assess({[field+'basis']:initial.stamp});
      assert.match(approved.outcome,a==='total'&&total==='15'?/Above the cited/:/Within the cited/);
      assert.equal(assess({[field+'sample']:'Lot B'}).stamp,'');
      assert.equal(assess({[field+'role']:role==='ingredient'?'finished':'ingredient'}).stamp,'');
      assert.equal(assess({crop_afRef:''}).stamp,'');
      if(role==='finished'){
        assert.equal(assess({crop_trapaSpecies:'different'}).stamp,'');
        if(choice!=='trapaPair')assert.equal(assess({crop_trapaArticle:''}).stamp,'');
      }
    }
    const rows=P.exportRows(id,date,false,state).filter(r=>r[2]===P.areas[3]);
    assert.equal(Boolean(rows.find(r=>r[5]==='Total aflatoxins')[7]),Boolean(total));
  }
}
