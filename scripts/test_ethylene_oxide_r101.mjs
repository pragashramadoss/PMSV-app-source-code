import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const modules=['full-catalogue-533','review-status-data','catalogue-source-evidence','catalogue-rule-data','catalogue-metal-scope-data','catalogue-metal-scope','broad-contaminants','catalogue-crop-scope-data','catalogue-crop-scope','catalogue-metal-panel-data','catalogue-metal-panel','catalogue-veterinary','catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-lot-dates','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-variant-composition','catalogue-testing-source-rows','catalogue-testing-plan','catalogue-worksheets'];
const scripts=modules.map(n=>fs.readFileSync(new URL(n+'.js',dir),'utf8'));
const db=new Map();
const storage={get length(){return db.size;},key:i=>[...db.keys()][i],getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v),removeItem:k=>db.delete(k)};
function open(store=storage){
  const x=vm.createContext({localStorage:store});x.window=x;scripts.forEach(code=>vm.runInContext(code,x));
  return {E:x.PMSVEthyleneOxide,Y:x.PMSVResiduePanel,W:x.PMSVCatalogueWorksheets,registry:x.PMSV_REVIEW_REGISTER};
}
const {E,Y,W,registry}=open();
const pepper='12-12-2-black-white-and-green-bwg-peppers', oregano='12-12-2-dried-oregano',candy='05-05-2-sugar-boiled-confectionery-hard-candy';
const state={spRole:'product',spArticle:'pepper',spProcess:'physical',spSample:'Pepper lot 101',spAnalyte:'eto',spReport:'EO COA 101',
  eoMarket:'india',eoTreatment:'unknown',eoMethod:'Lab reference M-101 for pepper',eoFormat:'separate',eoConfirmed:'yes',
  eoFreeKind:'quantified',eoFreeValue:'0.010',eoFreeUnit:'mg/kg',eoCeKind:'quantified',eoCeValue:'40',eoCeUnit:'µg/kg',eoCeBasis:'native'};
const test=options=>E.analysis({...state,...options});
const make=(changes={},id=pepper)=>{const s={...state,...changes};return E.review(Y.context(id,s),s);};
assert.equal(registry.latestRound,116);assert.equal(registry.ethyleneOxideReview.marketedProducts,36);
assert.equal(registry.ethyleneOxideReview.method,'FSSAI.OM.EO.001.2024');
assert(E.sources.calculation.endsWith('#page=8')&&E.sources.decision.endsWith('#page=8'));
assert.equal(test({}).sum,'EO sum = 0.032');
assert.equal(test({eoCeValue:'.022',eoCeUnit:'mg/kg',eoCeBasis:'equivalent'}).sum,'EO sum = 0.032');
assert.equal(test({eoFreeValue:'0.01000000000000000001'}).sum,'EO sum = 0.03200000000000000001');
assert.equal(test({eoFreeValue:'10',eoFreeUnit:'µg/kg',eoFreeKind:'less'}).sum,'0.022 ≤ EO sum < 0.032');
assert.equal(test({eoFreeKind:'nd',eoCeKind:'less'}).sum,'0 ≤ EO sum < 0.032');
assert.equal(test({eoFreeKind:'trace',eoCeKind:'trace'}).sum,'0 ≤ EO sum < 0.032');
assert(make({eoFreeKind:'trace'}).note.includes('Free EO detected'));
assert(!make({eoFreeKind:'less'}).note.includes('Free EO detected'));
assert(make({eoFreeKind:'nd'}).note.includes('2-CE detected'));
assert(test({eoCeKind:'missing'}).sum.startsWith('Total unavailable'));
assert(test({eoCeKind:'missing',eoFreeKind:'missing'}).error);
for(const c of [{eoCeBasis:''},{eoCeUnit:'ppm'},{eoFreeValue:'0'},{eoFreeValue:'-1'},{eoFreeValue:'ND'},{eoFreeValue:'1e-6'},{eoCeKind:'nd',eoCeValue:''},{eoFreeValue:'<0.10'}])assert(test(c).error);
const combined={eoFormat:'combined',eoSumKind:'quantified',eoSumValue:'32',eoSumUnit:'µg/kg'};
assert.equal(test(combined).sum,'EO sum = 0.032');assert(!test(combined).raw.includes('Free EO'));
assert.equal(test({...combined,eoSumKind:'nd'}).sum,'0 ≤ EO sum < 0.032');
assert(make(combined).note.includes('Obtain the component results'));
assert(make({eoFreeKind:'nd',eoCeKind:'nd',eoTreatment:'used',eoTreatmentRef:'Recorded treatment 101'}).note.includes('conflicts with the Food Authority decision'));
assert(make({eoTreatment:'excluded',eoTreatmentRef:'Supplier declaration 101'}).note.includes('Supplier declaration 101'));
assert(make({eoMarket:'export',eoDestination:'Market X',eoMarketRef:'Current provision test'}).note.includes('Destination evidence: Current provision test'));
assert(make({eoMarket:'export',eoTreatment:'used',eoTreatmentRef:'Supplier letter'}).note.includes('conflicts with the Spices Board guidance'));
assert(make({spArticle:'oregano'},oregano).note.includes('Confirm the Indian article'));
for(const n of ['EO','EtO','e.t.o.','2-CE','2-chloro-ethanol','ethylene chlorohydrin','107-07-3','75-21-8']) {
  const s={...state,spAnalyte:'other',spOther:n,spIndia:'none',spReg:'unregistered'};
  assert(E.selected(s),n);assert.equal(Y.decide(pepper,s).limit,'');
}
assert(!E.selected({...state,spAnalyte:'120'}));
for(const invalid of [{spRole:'bad'},{spArticle:'cinnamon'},{spProcess:''},{spSample:' '},{spReport:''},{eoMethod:' '},{eoConfirmed:''},{eoMarket:''},{eoMarket:'export',eoDestination:''},{eoTreatment:'used',eoTreatmentRef:''}]) {
  Y.save(pepper,{...state,...invalid},'eo');assert.equal(Y.records(pepper).length,0);
}
assert(Y.save(candy,{...state,spRole:'product'},'eo').includes('Choose'));
assert(Y.save(candy,{...state,spRole:'ingredient',spArticle:'cinnamon'},'eo').includes('Saved'));
assert(Y.save(pepper,state,'eo').includes('Saved'));assert(Y.save(pepper,state,'eo').includes('already saved'));
assert(Y.save(pepper,{...state,...combined},'eo').includes('Updated'));assert.equal(Y.records(pepper).length,1);
const regional={...state,...combined,eoMarket:'export',eoDestination:'Market X',eoMarketRef:'Test destination source'};
assert(Y.save(pepper,regional,'eo').includes('Saved'));assert(Y.save(pepper,{...regional,eoDestination:'Market Y'},'eo').includes('Saved'));
assert(Y.save(pepper,{...state,spReport:'EO COA 102',eoCeKind:'missing'},'eo').includes('Saved'));
const loaded=open();assert.equal(loaded.Y.records(pepper).length,4);
const panel=loaded.Y.exportRows(pepper);assert.equal(panel.length,5);
assert(panel.slice(1).every(row=>row[12]===''&&row[16]&&row[17]&&row[18]));
assert(panel.some(row=>row.includes('EO sum = 0.032')&&row.includes('India')));
assert(loaded.W.briefLines(pepper).join('\n').includes('Market X'));
db.set('pmsv-fssai-worksheet-r93:'+pepper,JSON.stringify(state));
const register=open().W.registerRows(true),row=register.find(r=>r[0]===pepper);
assert.equal(row[112],4);assert(row[113].includes('EO COA 102'));assert.equal(row[118],'EO sum = 0.032');assert(row[117].includes('40 µg/kg as 2-CE'));
const blank=W.registerRows(false);assert.equal(blank.length,534);assert.equal(blank[0].length,154);assert.equal(new Set(blank[0]).size,154);
assert(blank.slice(1).every(row=>row.length===154&&row[15]==='No'&&row[112]===0&&row[113]===''&&row.slice(116,120).every(v=>!v)));
assert.equal(blank.slice(1).filter(r=>r[114].startsWith('Marketed sample choices')).length,36);
assert.equal(blank.slice(1).filter(r=>r[114].startsWith('Separately sampled')).length,497);
assert(E.resetFields('spSample','old lot').includes('eoFreeValue'));assert(E.resetFields('spReport','old COA').includes('eoFormat'));
assert(E.resetFields('eoFormat','combined').includes('eoSumValue'));assert(E.resetFields('eoCeBasis','native').includes('eoCeValue'));
console.log('EO source scope, 533 articles, two reporting formats, exact units and qualifiers, treatment and export decisions, stored report lines and exports verified.');
