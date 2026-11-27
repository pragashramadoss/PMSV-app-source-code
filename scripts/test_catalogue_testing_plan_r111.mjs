import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url);
const ctx=vm.createContext({});ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of html.matchAll(/<script src="([a-z0-9-]+)\.js\?/g)){
  if(/^(catalogue-|full-catalogue-|review-status-data$|broad-contaminants$)/.test(name))
    vm.runInContext(fs.readFileSync(new URL(name+'.js',dir),'utf8'),ctx);
}
const A=ctx.PMSVTestingPlan,W=ctx.PMSVCatalogueWorksheets;
assert(W.available);
const [columns,...rows]=A.exportRows(),ids=new Map(ctx.PMSV_CATALOGUE.map(p=>[p.id,p.product]));
assert.equal(ids.size,533);assert.equal(columns.length,15);assert.equal(rows.filter(row=>A.areas.slice(0,4).includes(row[2])).length,19250);
const totals=[3855,2597,5868,6930];
for(const [index,area] of A.areas.slice(0,4).entries()){
  const part=rows.filter(row=>row[2]===area);assert.equal(part.length,totals[index]);assert.equal(new Set(part.map(r=>r[0])).size,533);
}
for(const row of rows){
  assert.equal(row.length,columns.length);assert.equal(row[1],ids.get(row[0]));assert(row[5]&&row[6]);
  assert(row[7]!==''||row[9]||row[12]!=='');
  assert(row.every(v=>typeof v==='number'||typeof v==='string'));
  for(const url of row[14].split(' | '))assert((row[0]==='06-06-2-arrowroot'&&row[2]===ctx.PMSVStarchSpecifications.area&&ctx.PMSVStarchSpecifications.activeSource(url))||(row[2]===ctx.PMSVImportDocuments.area&&ctx.PMSVImportDocuments.isSource(url))||(row[2]===ctx.PMSVLabGuide.referenceArea&&(ctx.PMSVLabGuide.isIgGSource(url)||ctx.PMSVLabGuide.isControlSource(url)||ctx.PMSVLabGuide.isRecognitionSource(url)))||(row[0]===ctx.PMSVVeterinary.eggPowderId&&row[2]===A.scopedArea&&A.isExportSource(url))||(row[0]==='06-06-2-arrowroot'&&row[4]==='Separately sampled raw Maranta arundinacea rhizome'&&url.startsWith('https://www.fao.org/fao-who-codexalimentarius/sh-proxy/')&&url.endsWith('CXA_004e.pdf#page=82'))||(row[0]===ctx.PMSVMetalPanel.polyolId && ['Lead','Nickel'].includes(row[5]) && ctx.PMSVMetalPanel.polyolRows().some(r=>r[4]===row[5]&&r[8]===url))||(row[0]===ctx.PMSVMetalPanel.trehaloseId && row[5]==='Lead' && url==='https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-472.pdf#page=1')||(row[0]===ctx.PMSVMetalPanel.sajjiId && row[2]===A.areas[2] && ctx.PMSVMetalPanel.importSources.includes(url))||(row[0]===ctx.PMSVVendingWater.productId && row[2]===ctx.PMSVVendingWater.area && ctx.PMSVVendingWater.isSource(url))||/^https:\/\/(?:[a-z0-9-]+\.)*fssai\.gov\.in\//i.test(url),url);
  assert(!row.includes('undefined')&&!row.includes('[object Object]'));
}
const dairyIds=['01-01-3-milk-protein-concentrate','01-01-8-whey-protein-concentrate','100-100-cow-or-buffalo-colostrum-and-colostrum-products','01-01-5-dairy-permeate-powders'];
const dairy=A.dairySamplingRows('2026-11-26').slice(1);
assert.equal(dairy.length,28);
for(const [i,id] of dairyIds.entries()){
  const set=dairy.filter(r=>r[0]===id);
  assert.equal(set.length,7);
  assert(set.every(r=>r[4].startsWith(set[0][1])&&r[14].includes('Gazette_Notification_')&&r[14].includes('Appendix%20B')&&r[9].includes('2.1.'+(21+i)+'(4)')));
  assert(!set.some(r=>/yeast|mould|cronobacter/i.test(r[5])));
  assert.equal(set.find(r=>r[5]==='Salmonella')[12],'Absent/25g');
  assert.equal(set.find(r=>r[5].startsWith('Listeria'))[12],'Absent/g');
  assert.equal(set.find(r=>r[5]==='Bacillus cereus')[13],1000);
}
assert.equal(A.dairySamplingRows('2010-01-01').length,1);
const processing=rows.filter(r=>r[2]===A.processingArea);
assert.equal(processing.length,5);
assert(processing.every(r=>r[6]==='Processing-study guidance'&&!r[7]&&!r[8]&&r[14].endsWith('#page=53')));
assert(!A.processingRow('10-10-2-egg-powder'));

const conditional=A.microFormRows(null,'2026-11-27').slice(1);
assert.equal(new Set(conditional.map(r=>r[0])).size,7);
assert.equal(conditional.length,96);
assert(conditional.every(r=>r[6]==='Confirm product form'||(r[6]==='Regulatory assessment needed'&&r.slice(10,14).every(x=>x===''))));
const chosen=(id,key,ref)=>A.microFormRows(id,'2026-12-01',{microForm:key,microFormRef:ref}).slice(1);
for(const herb of ['12-12-2-dried-mint','12-12-2-dried-laurel-or-dried-bay-leaf']){
  const ground=chosen(herb,'spice-03','Grinder lot');
  assert.equal(ground.length,7);assert(ground.every(r=>r[4].includes('Ground')&&r[9].includes('Grinder lot')));
}
const plainButtermilk='01-01-1-buttermilk-plain';
assert.equal(chosen(plainButtermilk,'milk-12','Cultured product').length,6);
assert.equal(chosen(plainButtermilk,'review','Churning record')[0][6],'Regulatory assessment needed');
assert.equal(chosen(plainButtermilk,'milk-12',' ')[0][6],'Evidence reference needed');
assert.equal(A.microFormRows(null,'2010-01-01').length,1);
const cooked=chosen('08-08-3-meat-sausages-smoked','meat-08','Core process record');
assert(cooked.every(r=>r[14].includes('#page=12')&&r[9].includes('Core process record')));
const pickle=conditional.find(r=>r[4].includes('Ready-to-eat pickled')&&r[6]==='Regulatory assessment needed');
assert(pickle&&pickle[14].includes('#page=9')&&pickle[14].includes('#page=43'));
function forProduct(product){return rows.filter(r=>r[1]===product);}
const composition=p=>forProduct(p).filter(r=>r[2]===A.areas[0]);
assert(composition('Cow Milk').some(r=>r[5]==='Milk fat'&&r[7]==='≥ 3.2'));
assert(composition('Cow Milk').every(r=>r[4]==='Cow Milk'));
assert(composition('Skimmed Milk').some(r=>r[5]==='Milk fat'&&r[7]==='≤ 0.5'));
assert(composition('Double Toned Milk').some(r=>r[5]==='Milk fat'&&r[7]==='≥ 1.3'));
assert(composition('Cheddar Cheese').every(r=>r[4]==='Cheddar'));
assert(composition('FRUIT JUICES').filter(r=>r[4]==='Lemon').some(r=>r[5]==='Acidity'&&r[7]==='>= 3.5'));
assert(composition('Chocolate').some(r=>r[4]==='Dark chocolate'&&r[7]==='≥ 35'&&r[8]==='%'));
assert(composition('Coffee').some(r=>r[4].includes('Decaffeinated soluble')&&r[14].includes('#page=7')));
assert(forProduct('Brandy').some(r=>r[5]==='Ethyl alcohol at 20 C'&&r[7]==='[36, 50]'&&r[14].includes('#page=15')));
const micro=(id,pattern)=>rows.filter(r=>r[0]===id&&r[2]===A.areas[1]&&pattern.test(r[5]));
assert.equal(micro('01-01-5-milk-powders-and-cream-powder',/Yeast/i).length,0);
assert.equal(micro('01-01-6-mould-ripened-cheese',/Yeast/i).length,0);
assert.equal(micro('01-01-5-edible-casein-products',/Yeast/i)[0][12],50);
const enter=micro('13-13-1-infant-formula',/Enterobacteriaceae/i)[0];
assert.deepEqual(Array.from(enter.slice(10,14)),[10,2,'Absent/10g','']);
assert(!micro('13-13-1-food-for-special-medical-purpose-intended-for-infants',/Enterobacteriaceae/i).length);
const butter=rows.filter(r=>r[2]===A.areas[1]&&r[4].startsWith('Ripened Butter'));
assert(butter.length&&!butter.some(r=>/Aerobic Plate Count/i.test(r[5])));
assert(rows.some(r=>r[5]==='Food safety special requirement'&&/sterility/.test(r[7])));
assert(rows.some(r=>r[6]==='Resolve source before use'));
assert(composition('14.5 - Dugdha Kupika (Stuffed Fried Cottage Cheese Dumplings)').every(r=>r[6]==='Confirm recipe authority and component scope'));
assert.equal(A.exportRows('unknown').length,1);
const selected=A.exportRows('01-01-1-cow-milk');assert.equal(selected.length,forProduct('Cow Milk').length+1);
console.log('533 products, all four areas, source references, article and sample scope, milk and cheese exclusions, sampling plans and named forms verified.');
