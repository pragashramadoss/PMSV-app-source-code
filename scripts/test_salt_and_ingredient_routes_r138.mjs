import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const {PMSVCatalogueWorksheets:ws,PMSVTestingPlan:plan,PMSVCropScope:crop,PMSVRecipeSamples:recipes,PMSV_REVIEW_REGISTER:review}=ctx;
const {salt,polyols,sorbitol,enzyme,cocoa}=plan.routeIds;
assert(ws.available);
assert.equal(review.firstSourceReview.withRoute,521);
assert.equal(review.firstSourceReview.pending,12);
assert.equal(review.legalProductApprovals,0);
const queue=ws.pendingSourceRows().slice(1).map(row=>row[0]);
assert(!queue.includes(salt)&&!queue.includes(polyols)&&queue.includes(enzyme)&&queue.includes(cocoa));
assert.equal(recipes.firstSource(salt).status,'CONDITIONAL_TOXIN_SOURCE_MATCH');
assert.equal(recipes.criteriaRows(salt)[1][0],review.latestSourceReviewDate);
assert(!recipes.decision(salt,'total',{}).reason.includes('µg/kg'));
for(const date of ['2026-11-25','2026-12-01']){
  const both=plan.ingredientRouteRows(null,date);
  assert.equal(both.length,22);
  assert.equal(new Set(both.slice(1).map(r=>r[0])).size,5);
  const sourceOnly=both.filter(r=>r[0]===salt&&r[2]===plan.areas[3]);
  assert.equal(sourceOnly.length,4);
  assert(sourceOnly.every(r=>r[7]===''&&r[8]===''&&r[15]&&r[16]==='µg/kg'));
  for(const [choice,role,total] of [['flourFood','finished','20'],['incomingFlour','ingredient','15']]){
    const lot='R138-'+role;
    for(const [analyte,maximum] of [['total',total],['b1','10']]){
      const prefix='tox_'+analyte+'_';
      const state={vetDate:date,crop_af:choice,crop_afLot:lot,crop_afRef:'Approved recipe or intake 138',crop_saltCereal:'Wheat',
        [prefix+'sample']:lot,[prefix+'role']:role,[prefix+'report']:'Lab 138',[prefix+'unit']:'µg/kg',[prefix+'value']:maximum};
      const reading=crop.labResult(salt,analyte,state,date);
      assert(reading.stamp);state[prefix+'basis']=reading.stamp;
      assert.match(crop.labResult(salt,analyte,state,date).outcome,/within|at or below/i);
      assert.match(crop.labResult(salt,analyte,{...state,[prefix+'value']:maximum+'.0000000001'},date).outcome,/above|exceed|outside/i);
      for(const patch of [{crop_afRef:' '},{crop_afLot:''},{crop_saltCereal:''},{crop_af:'other'},{crop_af:'flourAbsent'}])
        assert.equal(crop.decision(salt,analyte,{...state,...patch}).rows.length,0);
      assert.equal(crop.labResult(salt,analyte,{...state,[prefix+'sample']:'Another lot'},date).stamp,'');
      assert.equal(crop.labResult(salt,analyte,{...state,[prefix+'role']:role==='finished'?'ingredient':'finished'},date).stamp,'');
      const rows=plan.ingredientRouteRows(salt,date,state).slice(1);
      const matched=rows.filter(r=>r[2]===plan.areas[3]&&r[5]===ctx.PMSVCropScopeData.labels[analyte]&&r[7]!=='');
      assert.equal(matched.length,1);
      assert.equal(matched[0][7],maximum);
      assert(matched[0][9].includes('Lab 138')&&matched[0][9].includes('Wheat'));
      assert(matched[0][14].includes('#page=6')&&matched[0][14].includes('#page=29'));
    }
  }
  const absent=crop.decision(salt,'total',{crop_af:'flourAbsent',crop_afRef:'Mineral mix spec',crop_afLot:'M2',vetDate:date});
  assert.equal(absent.sample,'outside');assert.equal(absent.rows.length,0);
  assert.equal(both.filter(r=>r[0]===polyols).length,2);
  assert(both.filter(r=>r[0]===polyols||r[0]===enzyme).every(r=>!r[7]));
  assert(both.some(r=>r[0]===sorbitol&&r[5]==='Nickel'&&r[7]==='≤ 2'));
  assert(both.some(r=>r[0]===cocoa&&!r[7]&&r[9].includes('GMP')));
}
