import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dir=new URL('../fssai-helper/',import.meta.url);
const files=['full-catalogue-533','review-status-data','catalogue-source-evidence','catalogue-rule-data','catalogue-metal-scope-data','catalogue-metal-scope',
  'broad-contaminants','catalogue-crop-scope-data','catalogue-recipe-samples','catalogue-crop-scope','catalogue-metal-panel-data','catalogue-metal-panel','catalogue-veterinary',
  'catalogue-pesticides','catalogue-ethylene-oxide','catalogue-residue-panel','catalogue-batch-site','catalogue-lot-dates','catalogue-date-marking','catalogue-small-pack','catalogue-ingredient-order','catalogue-ingredient-percentage','catalogue-variant-composition','catalogue-testing-source-rows','catalogue-vending-water','catalogue-ayurveda-plan','catalogue-cocoa-mixtures','catalogue-powder-standards','catalogue-coffee','catalogue-sulphites','catalogue-additives-solvents','catalogue-testing-plan','catalogue-worksheets'];
const scripts=files.map(f=>fs.readFileSync(new URL(f+'.js',dir),'utf8'));
const db=new Map(),storage={get length(){return db.size;},key:i=>[...db.keys()][i],getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v),removeItem:k=>db.delete(k)};
function open(localStorage){
  const ctx=vm.createContext({localStorage});ctx.window=ctx;
  for(const code of scripts)vm.runInContext(code,ctx);
  return {Q:ctx.PMSVIngredientPercentage,W:ctx.PMSVCatalogueWorksheets,R:ctx.PMSV_REVIEW_REGISTER};
}
const {Q,W,R}=open(storage);
const id='05-05-2-sugar-boiled-confectionery-hard-candy',other='12-12-2-coriander-dhania';
const candy={sku:'Example candy',art:'Jar A',pack:'outer',target:'Mango pulp',recipe:'F1 v3',food:'mixture',
  nature:'both',observation:'Mango pulp shown',name:'emphasis',picture:'yes',exception:'none',print:'missing',total:'100',unit:'kg',
  lines:[{kind:'compound',source:'Fruit preparation',amount:'4',unit:'kg',share:'25',spec:'Supplier ref A'}]};
const form=(changes={})=>Q.model({...candy,...changes});
const requests=changes=>Array.from(Q.recipeQuestions(form(changes))).join('\n');
const save=(changes={},pid=id)=>{const r=Q.save(pid,form(changes));assert(r.key,r.message);return r;};
assert(W.available);assert.equal(R.latestRound,152);assert.equal(R.recipeRequestReview.products,533);
assert.equal(Q.requestRows().length,1);assert.equal(Q.requestColumns[2],'Recipe information required from R&D');
assert.equal(requests({}),''); // Percentage missing on artwork; all recipe information is known.
assert.equal(requests({printed:'8',print:'value'}),''); // Fully documented numerical mismatch.
assert.equal(requests({nature:'flavourOnly',picture:'yes',lines:[],total:'',food:'unknown'}),'');
assert.equal(requests({nature:'absent',print:'value',printed:'5'}),'');
assert.equal(requests({pack:'nonretail',nature:'unknown',recipe:''}),'');
assert.match(requests({pack:'nonretail',rdRequest:'Provide ingredient list revision.'}),/Provide ingredient list/);
assert.match(requests({recipe:'',nature:'unknown'}),/approved formula reference[\s\S]*only a corresponding flavour[\s\S]*If present/);
assert.match(requests({nature:'agent',total:'',lines:[],contextRef:''}),/flavouring function/);
assert.doesNotMatch(requests({nature:'agent',contextRef:'Function confirmed',lines:[],total:''}),/quantity|specification/i);
assert.equal(requests({lines:[],total:'',name:'absent',picture:'no',words:'no',character:'yes',exception:'drained',exceptionRef:'Drained weight stated'}),'');
assert.equal(requests({lines:[],total:'',exception:'specific',exceptionRef:'Named provision'}),'');
assert.match(requests({total:'-1',lines:[{...candy.lines[0],share:'101',spec:''}]}),/total ingoing batch[\s\S]*percentage in the preparation[\s\S]*supplier composition/);
assert.match(requests({lines:[{...candy.lines[0],unit:'L'}]}),/conversion basis/);
assert.match(requests({lines:[{...candy.lines[0],amount:'100.000000000000001'}]}),/double counting/);
assert.doesNotMatch(requests({lines:[{...candy.lines[0],amount:'100'}]}),/double counting/);

const missing={lines:[{...candy.lines[0],spec:''}],rdRequest:'Confirm the emulsifier sequence.'};
const first=save(missing);save({...missing,art:'Wrap B',pack:'inner'});
save({target:'Pineapple',nature:'unknown',art:'Wrap B',pack:'inner'});
save({...missing,recipe:'F1 v4',art:'Jar C'});save({...missing,sku:'Other SKU'});save(missing,other);
const noRef=save({recipe:'',nature:'unknown',art:'Draft V1'});
save({recipe:'',nature:'unknown',art:'Draft V2'});
save({recipe:'',nature:'unknown',art:'Draft V1',pack:'inner'});
const rows=Q.requestRows();
assert.equal(rows.length,8);assert(rows.every(row=>row.length===3));
const group=rows.find(row=>row[0].startsWith('Example candy\n')&&row[0].endsWith('F1 v3')&&row[1].includes('Wrap B'));
assert(group);assert(group[1].includes('Jar A · Retail multi-unit outer')&&group[1].includes('Wrap B · Individual inner'));
assert.equal(group[2].split('supplier composition specification').length-1,1);
assert.equal(group[2].split('Confirm the emulsifier sequence.').length-1,1);
assert(group[2].includes('Pineapple')&&group[2].includes('Mango pulp'));
assert.equal(rows.filter(row=>row[0].endsWith('revision pending')).length,3);
const brief=W.briefLines(id).join('\n');assert(brief.includes('R&D recipe requests')&&brief.includes('Confirm the emulsifier sequence.'));
const exportOne=Q.exportRows(id);assert.equal(exportOne[0].at(-1),Q.requestColumns[2]);
assert(exportOne.some(row=>row.at(-1).includes('supplier composition specification')));
const full=W.registerRows(true),product=full.find(r=>r[0]===id);assert.equal(product[128],6);
assert(product[129].includes('Confirm the emulsifier sequence.')&&product[129].includes('Wrap B'));
const pristine=W.registerRows(false);assert.equal(pristine.length,534);assert.equal(new Set(pristine[0]).size,156);
assert(pristine.slice(1).every(row=>row.length===156&&row[128]===0&&row[129]===''));

// Multiple tabs read the same saved data; filling or deleting a review recomputes only its outstanding questions.
const tab=open(storage);
assert(tab.Q.save(id,form(),first).key);assert(!Q.requestRows().find(row=>row[0]===group[0])[1].includes('Jar A'));
assert(tab.Q.remove(id,noRef).includes('Removed'));assert.equal(Q.requestRows().length,7);
const previous=Q.model({...candy,sku:'Existing R102',recipe:'',nature:'unknown'});
const key='pmsv-fssai-artwork-percentage-r102:'+JSON.stringify([id,previous.sku,previous.art,previous.pack,previous.target]);
const raw=JSON.stringify({version:1,review:previous});db.set(key,raw);
assert(Q.requestRows().some(row=>row[0].startsWith('Existing R102')));
assert.match(Q.save(id,previous).message,/already saved/);assert.equal(db.get(key),raw);
const deny=open({get length(){throw Error();},setItem(){throw Error();}});
assert.match(deny.Q.save(id,form(missing)).message,/session/);assert.equal(deny.Q.requestRows().length,2);
assert(deny.Q.requestText(deny.Q.requestRows()).includes('• Mango pulp'));
console.log('R&D request grouping, open evidence only, third-column export, version boundaries, legacy checks and session storage verified.');
