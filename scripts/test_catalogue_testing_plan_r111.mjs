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
assert.equal(ids.size,533);assert.equal(columns.length,15);assert.equal(rows.filter(row=>A.areas.slice(0,4).includes(row[2])).length,18639);
const totals=[3830,2550,5863,6396];
for(const [index,area] of A.areas.slice(0,4).entries()){
  const part=rows.filter(row=>row[2]===area);assert.equal(part.length,totals[index]);assert.equal(new Set(part.map(r=>r[0])).size,533);
}
for(const row of rows){
  assert.equal(row.length,columns.length);assert.equal(row[1],ids.get(row[0]));assert(row[5]&&row[6]);
  assert(row[7]!==''||row[9]||row[12]!=='');
  assert(row.every(v=>typeof v==='number'||typeof v==='string'));
  for(const url of row[14].split(' | '))assert((row[0]===ctx.PMSVMetalPanel.sajjiId && row[2]===A.areas[2] && ctx.PMSVMetalPanel.importSources.includes(url))||(row[0]===ctx.PMSVVendingWater.productId && row[2]===ctx.PMSVVendingWater.area && ctx.PMSVVendingWater.isSource(url))||/^https:\/\/(?:[a-z0-9-]+\.)*fssai\.gov\.in\//i.test(url),url);
  assert(!row.includes('undefined')&&!row.includes('[object Object]'));
}
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
