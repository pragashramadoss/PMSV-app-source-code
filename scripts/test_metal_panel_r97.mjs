import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
global.window=global;
const dir=path.resolve(import.meta.dirname,'../fssai-helper');
for(const f of ['catalogue-source-evidence','catalogue-rule-data','catalogue-metal-scope-data','catalogue-metal-scope','broad-contaminants','catalogue-crop-scope-data','catalogue-recipe-samples','catalogue-crop-scope','catalogue-metal-panel-data','catalogue-metal-panel','full-catalogue-533','review-status-data','catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-lot-dates','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-variant-composition','catalogue-testing-source-rows','catalogue-vending-water','catalogue-ayurveda-plan','catalogue-cocoa-mixtures','catalogue-powder-standards','catalogue-coffee','catalogue-sulphites','catalogue-additives-solvents','catalogue-testing-plan','catalogue-worksheets'])require(path.join(dir,f+'.js'));
const P=PMSVMetalPanel,D=PMSVMetalPanelData,W=PMSVCatalogueWorksheets;
const ids=PMSV_CATALOGUE.map(p=>p.id),original=JSON.parse(fs.readFileSync(path.join(dir,'ctr-original-gazette-concordance-r70-2026-11-14.json'))).metalRows;
assert.deepEqual(new Set(ids),new Set(Object.keys(D.products)));
assert.equal(original.length,Object.keys(D.rows).length);assert.equal(original.length,382);
for(const r of original){
  const key=D.metals[r.metal]+r.coreIndex;
  assert.deepEqual(D.rows[key],[r.originalArticle,r.originalLimit,r.sourcePdfPage,r.continuationPages,r.coreCondition]);
  assert(r.sourcePdfPage>=18&&r.sourcePdfPage<=28);assert(P.rowText(key).includes('Gazette p.'));
}
assert.equal(P.metals.length,11);assert(W.available);
const exact=new Set(['all','named','residual','outside']),counts={exact:0,common:0,open:0},products={exact:0,all:0};
const legacy=Object.keys(D.metals).slice(0,5);
const unspecific={Lead:'Pb71',Copper:'Cu11',Arsenic:'As32',Tin:'Sn16',Cadmium:'Cd8',Mercury:'Hg6'};
let newlyKnown=0;
const norm=v=>String(v).toLowerCase().replace(/[^a-z0-9]+/g,'');
for(const id of ids){
  const ds=P.panel(id),s=P.status(id),old=PMSVCatalogueRules.products[id];
  assert.equal(ds.length,11);assert.equal(new Set(ds.map(d=>d.key)).size,11);
  assert.equal(P.values(id).length,P.columns().length);
  assert.equal(s.exact,ds.filter(d=>exact.has(d.kind)).length);
  assert.equal(s.common,ds.filter(d=>d.kind==='same').length);
  const all=s.exact+s.common===11;
  if(all)products.all++;
  if(s.exact===11)products.exact++;
  if(all&&!PMSVCatalogueEvidence.products[id].directCTR&&!PMSVCropScope.positive(id).length)newlyKnown++;
  for(const d of ds){
    for(const key of d.keys)assert.equal(key.replace(/\d+$/,''),d.key,id);
    assert(!d.proof);
    if(d.kind==='same'){assert(d.keys.length>1);assert.equal(new Set(d.keys.map(k=>P.limit(k)+'|'+D.rows[k][4])).size,1);}
    if(d.kind==='residual')assert.deepEqual(d.keys,[unspecific[d.name]],id);
    if(d.kind==='outside')assert.deepEqual(d.keys,[],id);
    if(legacy.includes(d.name)&&d.kind==='residual'){
      const previouslyNamed=(old.ctrProfiles||[]).flatMap(k=>PMSVCatalogueRules.ctr[k].rows).filter(r=>r.contaminant===d.name&&!/foods not specified/i.test(r.article));
      assert.equal(previouslyNamed.length,0,id+' '+d.name);
    }
    if(legacy.includes(d.name)){
      const candidates=(old.ctrProfiles||[]).flatMap(k=>PMSVCatalogueRules.ctr[k].rows).filter(r=>r.contaminant===d.name);
      for(const item of candidates){
        const matching=original.filter(r=>r.metal===d.name&&[r.article,r.originalArticle].some(a=>norm(a)===norm(item.article)));
        if(matching.length)assert(matching.some(r=>d.keys.includes(D.metals[r.metal]+r.coreIndex)),id+' '+item.article);
      }
    }
    counts[exact.has(d.kind)?'exact':d.kind==='same'?'common':'open']++;
  }
}
assert.equal(counts.exact+counts.common+counts.open,5863);
const st=P.stats(),stored=PMSV_REVIEW_REGISTER.metalPanelReview;
assert.equal(st.exactProducts,products.exact);assert.equal(st.allOutcomes,products.all);
assert.equal(st.exactDecisions,counts.exact);assert.equal(st.commonDecisions,counts.common);
for(const k of Object.keys(st))assert.equal(st[k],stored[k]);
assert.deepEqual([st.exactProducts,st.allOutcomes,st.priorityOutcomes,newlyKnown],[49,123,29,21]);
assert.deepEqual(P.panel('future-unknown-product'),[]);assert.equal(P.forMetal('future-unknown-product','Pb'),null);
assert.deepEqual(P.values('future-unknown-product'),[]);assert.equal(P.forMetal(ids[0],'Zn'),null);
const run=(i,m,s={})=>P.forMetal(ids[i],m,s);
const lab=(i,m,num,unit='mg/kg',extra={})=>P.lab(ids[i],{panelLabMetal:m,panelLabNumber:num,panelLabUnit:unit,panelLabBasis:'yes',panelLabRef:'Accredited report 97',...extra});
assert.deepEqual(run(206,'Pb').keys,['Pb55']);assert.deepEqual(run(206,'Cu').keys,['Cu7']);
assert(lab(206,'Pb','5.0').includes('Within'));assert(lab(206,'Pb','5.0000000000000001').includes('Outside'));
assert(lab(206,'Cu','70','mg/L').startsWith('Confirm the matching unit'));assert(lab(206,'Cu','70').includes('Within'));
assert(lab(206,'Cu','70','mg/kg',{panelLabBasis:''}).startsWith('Confirm'));assert(lab(206,'Cu','69','mg/kg',{panelLabRef:' '}).startsWith('Confirm'));
assert(lab(209,'Pb','2','mg/L').startsWith('Confirm'));assert(lab(0,'Pb','0.01','mg/kg').startsWith('Confirm'));
assert(lab(206,'Pb','<LOQ').includes('non-negative decimal'));
for(const [value,expected] of [['2.79999','Outside'],['2.8','Within'],['15','Within'],['15.001','Outside']])assert(lab(437,'Cu',value).startsWith(expected),value);
assert.equal(run(240,'Pb').kind,'check');assert.deepEqual(run(240,'Pb').keys,['Pb35','Pb71']);
assert.equal(run(240,'Pb',{panel_Pb:'Pb35',panel_PbRef:'Supplier specification and process for solubilised, hydrolysed wheat protein'}).kind,'named');
assert.equal(run(240,'Pb',{panel_Pb:'Pb71',panel_PbRef:'Vital nonhydrolysed gluten, 2.4.22'}).kind,'residual');
for(const m of ['Pb','Cu','As','Cd'])assert.equal(run(42,m).kind,'residual');
assert.equal(run(42,'Sn').kind,'check');assert(!run(42,'Sn').keys.includes('Sn18'));
assert.equal(run(62,'Pb').kind,'factor');assert(!lab(62,'Pb','0.02').startsWith('Within'));
assert.equal(run(3,'Pb',{panel_Pb:'Pb73',panel_PbRef:'Juice example'}).kind,'hold');
assert.equal(run(329,'As',{panel_As:'As30',panel_AsRef:'Known species'}).kind,'hold');assert.deepEqual(run(325,'As').keys,['As52']);
assert(!lab(329,'As','75').startsWith('Within'));assert(!lab(2,'Pb','0').startsWith('Within'));
const candy={metalPack:'other',metalPackRef:'Product is individually wrapped'};
assert.equal(run(209,'Sn',{}).kind,'check');assert.deepEqual(run(209,'Sn',candy).keys,['Sn17']);
assert.equal(run(209,'Sn',{metalPack:'can',metalPackRef:'Canned hard candy'}).kind,'hold');
assert.equal(P.status(ids[209],candy).exact,11);
assert.equal(run(290,'Sn',{panel_Sn:'Sn16',panel_SnRef:'An unsupported selection'}).kind,'same');
assert.equal(run(290,'Sn',{panelContainer:'other',panelContainerRef:' '}).kind,'same');
assert.deepEqual(run(290,'Sn',{panelContainer:'other',panelContainerRef:'Flow-wrapped bakery article'}).keys,['Sn16']);
assert.deepEqual(run(290,'Sn',{panelContainer:'can',panelContainerRef:'Shelf-stable canned product'}).keys,['Sn4','Sn25']);
assert.equal(run(6,'Sn',{panelContainer:'can',panelContainerRef:'Can',panel_Sn:'Sn20',panel_SnRef:'Single tomato juice'}).kind,'hold');
assert.equal(run(299,'Sn',{panelContainer:'other',panelContainerRef:'Retort pouch',panel_Sn:'Sn9',panel_SnRef:'Cooked ham'}).kind,'hold');
const fpc={panelFpc:'yes',panelFpcRef:'Sweets licence and specification F18'};
assert.equal(run(462,'Pb',{panelFpc:'yes',panelFpcRef:' '}).kind,'fpc');
for(const m of ['Pb','Cu','As','Sn','Cd','Hg'])assert.equal(run(462,m,fpc).proof,fpc.panelFpcRef);
assert.equal(P.status(ids[462],fpc).exact,11);assert(PMSVBroadContaminants.scope(ids[462],'','',fpc).h.why.includes('F18'));
assert.equal(run(462,'Pb',{panelFpc:'no',panelFpcRef:'Separate standard'}).kind,'check');
for(const i of [201,243,259]){
  assert.equal(run(i,'Pb').kind,'residual');assert.equal(run(i,'Cd').kind,'residual');
  assert(P.nextEdition(ids[i])[0].includes('lead 0.2 ppm and cadmium 0.1 ppm'));
}
assert(P.nextEdition(ids[121])[0].includes('equality'));assert.equal(run(121,'As').kind,'check');
const unknown={panel_Pb:'Pb140',panel_PbRef:'Spec',panelIdentity:'',panelIdentityRef:''};
assert.equal(run(474,'Pb',unknown).kind,'unidentified');
assert.equal(run(474,'Pb',{...unknown,panelIdentity:'Sodium metabisulphite',panelIdentityRef:'Food-grade material identity'}).kind,'named');
const rows=W.registerRows();assert.equal(rows.length,534);assert.equal(rows[0].length,89+PMSVVeterinary.columns.length+PMSVPesticides.columns.length+PMSVResiduePanel.columns.length+PMSVIngredientPercentage.columns.length+PMSVIngredientOrder.columns.length+PMSVSmallPack.columns.length+PMSVBatchSite.columns.length+PMSVDateMarking.columns.length+PMSVLotDates.columns.length+6);assert.equal(rows[0].length,new Set(rows[0]).size);
assert(rows.slice(1).every(r=>r.length===rows[0].length&&r[15]==='No'));assert.deepEqual(W.registerRows(true),rows);
assert(P.findRows('Cu','cocoa powder').includes('1 of 1'));assert(P.findRows('???','milk')==='');
assert(!P.controls(ids[290],{panelContainerRef:'<svg onload=alert(1)>'}).includes('<svg'));
console.log(JSON.stringify({products,counts,newlyKnown,rows:original.length}));
