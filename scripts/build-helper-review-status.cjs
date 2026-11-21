'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),dir=path.join(root,'fssai-helper');
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8'));
const register=read('ctr-137-evidence-readiness-r50-2026-11-04.json');
const ids=new Set(register.records.map(x=>x.id));
assert.equal(ids.size,137);
const focusedRounds=new Set([45,46,47,48,...Array.from({length:16},(_,i)=>54+i)]);
const followup=read('ctr-remaining-source-scope-r69-2026-11-14.json');
const gazetteFile='ctr-original-gazette-concordance-r70-2026-11-14.json';
const gazette=read(gazetteFile);
const residueFile='ctr-residue-gazette-concordance-r71-2026-11-14.json';
const residue=read(residueFile);
const toxinFile='ctr-toxin-gazette-concordance-r72-2026-11-17.json';
const toxin=read(toxinFile);
const fibreFile='ctr-fibre-claims-source-r73-2026-11-17.json';
const fibre=read(fibreFile);
const waterFile='ctr-water-source-review-r74-2026-11-17.json';
const water=read(waterFile);
const waterStandardFile='ctr-water-standard-concordance-r75-2026-11-17.json';
const waterStandard=read(waterStandardFile);
const asafoetidaFile='ctr-asafoetida-purity-r76-2026-11-17.json';
const asafoetida=read(asafoetidaFile);
const camphorFile='ctr-camphor-source-r77-2026-11-17.json';
const camphor=read(camphorFile);
const lajadiFile='ctr-lajadi-botanicals-r78-2026-11-17.json';
const lajadi=read(lajadiFile);
const juniperFile = 'ctr-juniper-spice-r79-2026-11-18.json';
const juniper = read(juniperFile);
const hinguFile = 'ctr-hingu-asafoetida-r80-2026-11-18.json';
const hingu = read(hinguFile);
const flowerFile = 'ctr-recipe-flowers-r81-2026-11-18.json';
const flowers = read(flowerFile);
const flowerSupplyFile = 'ctr-flower-supply-r82-2026-11-19.json';
const flowerSupply = read(flowerSupplyFile);
const rhizomeFile = 'ctr-rhizome-spices-r83-2026-11-19.json';
const rhizomes = read(rhizomeFile);
const pasteFile = 'ctr-ginger-paste-r84-2026-11-19.json';
const paste = read(pasteFile);
const sauceFile = 'ctr-culinary-sauces-r85-2026-11-20.json';
const sauces = read(sauceFile);
const namedSauceFile = 'ctr-tomato-soybean-sauces-r86-2026-11-20.json';
const namedSauces = read(namedSauceFile);
const concentrateFile = 'ctr-thermally-processed-tomato-r87-2026-11-20.json';
const concentrate = read(concentrateFile);
const tomatoJuiceFile = 'ctr-thermally-processed-tomato-juice-r88-2026-11-20.json';
const tomatoJuice = read(tomatoJuiceFile);
const cannedTomatoFile = 'ctr-canned-tomatoes-r89-2026-11-20.json';
const cannedTomato = read(cannedTomatoFile);
const thermalPacksFile = 'ctr-thermal-fruit-vegetable-packs-r90-2026-11-20.json';
const thermalPacks = read(thermalPacksFile);
const cocktailFile = 'ctr-fruit-cocktail-r91-2026-11-20.json';
const cocktail = read(cocktailFile);
const vegetableMealsFile = 'ctr-vegetable-meals-soups-r92-2026-11-20.json';
const vegetableMeals = read(vegetableMealsFile);
const sauceSources = Object.fromEntries(['gazette','chapter'].map(key => {
 const {url,sha256} = paste.sources[key];
 return [key,{url,sha256}];
}));
const ingredientBaselineFile = 'ayurveda-ginger-source-and-14-holds-r40-2026-11-04.json';
const ingredientBaseline = read(ingredientBaselineFile);
const vm=require('node:vm'),catalogueContext={window:{}};
vm.createContext(catalogueContext);
vm.runInContext(fs.readFileSync(path.join(dir,'full-catalogue-533.js'),'utf8'),catalogueContext);
const seafoodNoteIds=catalogueContext.window.PMSV_CATALOGUE.filter(x=>/^2\.6(?:\.|$)/.test(x.fssr)).map(x=>x.id);
assert.equal(seafoodNoteIds.length,24);
const followupById=new Map(followup.records.map(x=>[x.id,x]));
assert.equal(followupById.size,70);
const reports=new Map([...ids].map(id=>[id,[]]));
const sourceFiles=[];
for(const file of fs.readdirSync(dir).sort()){
 const match=file.match(/-r(\d+)-.*\.json$/);if(!match||!focusedRounds.has(Number(match[1])))continue;
 const found=new Set();
 function walk(value){
  if(typeof value==='string'&&ids.has(value))found.add(value);
  else if(Array.isArray(value))value.forEach(walk);
  else if(value&&typeof value==='object')Object.values(value).forEach(walk);
 }
 walk(read(file));const report=file.replace(/\.json$/,'.md');
 assert(fs.existsSync(path.join(dir,report)),report);
 sourceFiles.push(file);
 for(const id of found)reports.get(id).push({round:Number(match[1]),file:report});
}
const records=register.records.map(row=>({
 id:row.id,name:row.name,fssr:row.fssr,fcs:row.fcs,priority:row.priority,route:row.route,
 reports:reports.get(row.id).sort((a,b)=>b.round-a.round),
 legalArticleDecision:'OPEN',
 sourceReviewResult:followupById.get(row.id)?.sourceReviewResult||'See the linked focused source review for confirmed wording and scope conditions.',
 sourceReviewNextAction:followupById.get(row.id)?.sourceReviewNextAction||'Reconcile the exact applicable article, original Gazette and effective amendments, qualifiers, units and analytical-method scope. '+
  (row.blocker==='WRONG_COCOA_POWDER_ARTICLE'?'Do not substitute the cocoa-powder article.':
   row.blocker==='OFFICIAL_AYURVEDA_RECIPE_14_6_14_7_METHOD_ALIGNMENT'?'Resolve the published recipe title/method discrepancy.':
   row.route==='CONDITIONAL_FPC18_DIRECTION'?'Check eligibility and the direction’s applicable base-food references.':
   row.route==='FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION'?'FoSCoS classification alone does not establish a numeric limit.':
   row.route==='AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED'?'Reconcile the source recipe, Schedule D and ingredient-purity requirements.':
   'Keep product-form and competing-article conditions explicit.'),
 lotReleaseEvidence:'Actual SKU identity and recipe, process and pack, traceable lot reports and authorized QA assessment are separate from source-text verification.'
}));
const fibreRecord=records.find(x=>x.id===fibre.productId);
assert(fibreRecord);
fibreRecord.reports.unshift({round:73,file:fibreFile.replace(/\.json$/,'.md')});
fibreRecord.sourceReviewResult=fibre.sourceReviewResult;
fibreRecord.sourceReviewNextAction=fibre.sourceReviewNextAction;
for(const note of water.records){
 const row=records.find(x=>x.id===note.id);assert(row);
 row.reports.unshift({round:74,file:waterFile.replace(/\.json$/,'.md')});
 row.sourceReviewResult+=' '+note.sourceReviewResult;
 row.sourceReviewNextAction+=' '+note.sourceReviewNextAction;
}
for(const note of waterStandard.records){
 const row=records.find(x=>x.id===note.id);assert(row);
 row.reports.unshift({round:75,file:waterStandardFile.replace(/\.json$/,'.md')});
 row.sourceReviewResult=note.sourceReviewResult;
 row.sourceReviewNextAction=note.sourceReviewNextAction;
}
const asafoetidaRecipe=records.find(x=>x.id===asafoetida.recipeProductId);
assert(asafoetidaRecipe);
asafoetidaRecipe.reports.unshift({round:76,file:asafoetidaFile.replace(/\.json$/,'.md')});
asafoetidaRecipe.sourceReviewResult+=' '+asafoetida.sourceReviewResult;
asafoetidaRecipe.sourceReviewNextAction+=' '+asafoetida.sourceReviewNextAction;
for(const note of camphor.records){
 const row=records.find(x=>x.id===note.id);assert(row);
 row.reports.unshift({round:77,file:camphor.report});
 row.sourceReviewResult+=' '+note.sourceReviewResult;
 row.sourceReviewNextAction+=' '+note.sourceReviewNextAction;
}
const lajadiRecipe=records.find(x=>x.id===lajadi.recipeProductId);assert(lajadiRecipe);
lajadiRecipe.reports.unshift({round:78,file:lajadi.report});
lajadiRecipe.sourceReviewResult+=' '+lajadi.sourceReviewResult;
lajadiRecipe.sourceReviewNextAction+=' '+lajadi.sourceReviewNextAction;
assert.equal(juniper.recipeProductId, lajadiRecipe.id);
const juniperIngredient = lajadi.ingredients.find(row => row.id === juniper.ingredientId);
assert.equal(juniperIngredient.ingredientSerial, juniper.ingredientSerial);
const oldGaps = ingredientBaseline.remaining_14_original_ingredient_instances;
assert(oldGaps.every(row => row.raw_CTR_source_candidate_count === 0));
const baselineCoverage = {
 ingredientRows: ingredientBaseline.original_ayurveda_recipe_ingredient_rows,
 withCandidate: ingredientBaseline.R36_to_R40_original_ingredient_rows_with_conditional_reference,
 withoutCandidate: oldGaps.length,
 candidateLinks: ingredientBaseline.R36_to_R40_total_source_reference_links,
 originalUnadjudicatedInstances: oldGaps.length,
 remainingInstances: oldGaps.map(row => ({
  recipe: row.recipe_number, serial: row.source_ingredient_serial, name: row.source_name
 }))
};

function linkIngredient(previous, ingredient, rows) {
 const remaining = previous.remainingInstances.filter(row =>
  row.recipe !== ingredient.recipe || row.serial !== ingredient.serial || row.name !== ingredient.name);
 assert.equal(previous.remainingInstances.length - remaining.length, 1, 'Expected one previously unlinked ingredient');
 assert(rows.length > 0 && new Set(rows.map(row => row.name)).size === rows.length);
 const coverage = {...previous, withCandidate: previous.withCandidate + 1,
  withoutCandidate: remaining.length, candidateLinks: previous.candidateLinks + rows.length, remainingInstances: remaining};
 assert.equal(coverage.withCandidate + coverage.withoutCandidate, coverage.ingredientRows);
 return coverage;
}

// Resolve each ingredient's references independently against the original Gazette.
const toxinNames = {total_aflatoxins: 'Total aflatoxins', aflatoxin_b1: 'Aflatoxin B1'};
function gazetteRows(keys) {
 return keys.map(key => {
  const matches = key.metal
   ? gazette.metalRows.filter(row => row.metal === key.metal && row.coreIndex === key.coreIndex)
   : gazette.cropRows.filter(row => row.group === key.group && row.article === key.article);
  assert.equal(matches.length, 1, 'An ingredient reference must identify one Gazette row');
  const [row] = matches;
  assert.equal(row.sourceId, 'ctr2020');
  assert.equal(row.automaticProductApplication, false);
  return {
   name: key.metal || toxinNames[key.group], article: row.originalArticle ?? row.originalArticleCell,
   maximum: row.coreLimit ?? row.originalLimit, unit: row.coreUnit ?? row.unit,
   basis: row.coreCondition || '', pdfPage: row.sourcePdfPage
  };
 });
}
const rawRows = gazetteRows(juniper.gazetteRowKeys);
const coverage = linkIngredient(baselineCoverage, {
 recipe: juniper.recipeNumber, serial: juniper.ingredientSerial, name: juniperIngredient.name
}, rawRows);
lajadiRecipe.reports.unshift({round: juniper.round, file: juniper.report});
lajadiRecipe.sourceReviewResult += ' ' + juniper.sourceReviewResult;
lajadiRecipe.sourceReviewNextAction += ' ' + juniper.sourceReviewNextAction;
assert.equal(hingu.recipeProductId, asafoetida.recipeProductId);
assert.equal(hingu.productId, asafoetida.productId);
assert.equal(hingu.ingredient.serial, asafoetida.recipe.ingredientSerial);
assert.equal(hingu.ingredient.name, asafoetida.recipe.name);
const hinguRows = gazetteRows(hingu.gazetteRowKeys);
const hinguCoverage = linkIngredient(coverage, hingu.ingredient, hinguRows);
for (const id of [hingu.productId, hingu.recipeProductId]) {
 const row = records.find(record => record.id === id);
 assert(row);
 row.reports.unshift({round: hingu.round, file: hingu.report});
 row.sourceReviewResult += ' ' + hingu.sourceReviewResult;
 row.sourceReviewNextAction += ' ' + hingu.sourceReviewNextAction;
}
const flowerRows = gazetteRows(flowers.gazetteRowKeys);
const flowerCoverage = linkIngredient(hinguCoverage, flowers.ingredient, flowerRows);
const recipeRegister = read('ayurveda-category-a-recipe-evidence-r35-2026-11-04.json');
for (const recipe of flowers.recipes) {
 const entry = recipeRegister.records.find(row => row.catalogue_id === recipe.productId);
 assert.equal(entry?.recipe_number, recipe.number);
 for (const flower of recipe.flowers) {
  const original = entry.ingredients.find(row => row.serial === flower.serial);
  assert.equal(original?.source_name, flower.name);
  assert.equal(original.part_used, 'Flower');
  assert.equal(original.source_ratio, 'Q.S.');
 }
 const row = records.find(record => record.id === recipe.productId);
 row.reports.unshift({round: flowers.round, file: flowers.report});
 row.sourceReviewResult += ' ' + recipe.sourceReviewResult;
 row.sourceReviewNextAction += ' ' + recipe.sourceReviewNextAction;
}
assert(flowerCoverage.remainingInstances.some(item => item.recipe === flowerSupply.ingredient.recipe &&
 item.serial === flowerSupply.ingredient.serial && item.name === flowerSupply.ingredient.name));
for (const recipe of flowerSupply.recipes) {
 const row = records.find(record => record.id === recipe.productId);
 assert(flowers.recipes.some(item => item.productId === row?.id));
 row.reports.unshift({round:flowerSupply.round, file:flowerSupply.report});
 row.sourceReviewResult += ' ' + recipe.sourceReviewResult;
 row.sourceReviewNextAction += ' ' + recipe.sourceReviewNextAction;
}
const earlyCrosswalk = read('ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json');
const rhizomeSpices = rhizomes.spices.map(spice => ({
 ...spice, rawRows:gazetteRows([...spice.metalKeys, ...rhizomes.toxinKeys])
}));
let addedLinks = 0;
for (const recipe of rhizomes.recipes) {
 const printed = recipeRegister.records.find(item => item.catalogue_id === recipe.productId);
 assert.equal(printed.recipe_number, recipe.number);
 for (const input of recipe.ingredients) {
  const original = printed.ingredients.find(item => item.serial === input.serial);
  assert.equal(original.source_name, input.name);
  assert.equal(original.part_used, 'Rhizome');
  const first = earlyCrosswalk.ingredient_source_crosswalk.find(item =>
   item.recipe_number === recipe.number && item.source_ingredient_serial === input.serial);
  const ginger = ingredientBaseline.conditionally_source_linked_ingredient_instances.find(item =>
   item.recipe_number === recipe.number && item.source_ingredient_serial === input.serial);
  const previous = [
   ...first.possible_source_row_ids.map(id => earlyCrosswalk.source_rows.find(row => row.source_id === id).analyte),
   ...(ginger?.conditional_dried_ginger_CTR_source_ids || []).map(id => ingredientBaseline.source_rows.find(row => row.id === id).analyte)
  ].map(name => name.toLowerCase());
  const rows = rhizomeSpices.find(spice => spice.key === input.key).rawRows;
  assert(previous.length && previous.every(name => rows.some(row => row.name.toLowerCase() === name)));
  input.addedReferences = rows.filter(row => !previous.includes(row.name.toLowerCase())).map(row => row.name);
  addedLinks += input.addedReferences.length;
 }
 const record = records.find(row => row.id === recipe.productId);
 record.reports.unshift({round:rhizomes.round, file:rhizomes.report});
 record.sourceReviewResult += ' ' + recipe.sourceReviewResult;
 record.sourceReviewNextAction += ' ' + recipe.sourceReviewNextAction;
}
const currentCoverage = {...flowerCoverage, candidateLinks:flowerCoverage.candidateLinks + addedLinks};
const pasteRecipe = records.find(row => row.id === paste.recipe.productId);
pasteRecipe.reports.unshift({round:paste.round, file:paste.report});
pasteRecipe.sourceReviewResult += ' ' + paste.recipe.sourceReviewResult;
pasteRecipe.sourceReviewNextAction += ' ' + paste.recipe.sourceReviewNextAction;
for (const product of thermalPacks.products) {
 const record=records.find(row=>row.id===product.id);
 assert(record?.reports.some(ref=>ref.round===66),'Thermal pack must match the original R66 record');
 record.reports.unshift({round:thermalPacks.round,file:thermalPacks.report});
 record.sourceReviewResult=product.sourceReviewResult;
 record.sourceReviewNextAction=product.sourceReviewNextAction+' '+record.sourceReviewNextAction;
}
const cocktailRecord = records.find(row => row.id === cocktail.id);
assert(cocktailRecord?.reports.some(ref => ref.round === 66),'Fruit cocktail must match the R66 catalogue record');
cocktailRecord.reports.unshift({round:cocktail.round,file:cocktail.report});
cocktailRecord.sourceReviewResult = cocktail.sourceReviewResult;
cocktailRecord.sourceReviewNextAction = cocktail.sourceReviewNextAction+' '+cocktailRecord.sourceReviewNextAction;
const curry = vegetableMeals.products.find(p => p.kind === 'curry');
const curryRecord = records.find(row => row.id === curry.id);
assert(curryRecord?.reports.some(ref => ref.round === 67),'Curried vegetables must match the existing R67 record');
curryRecord.reports.unshift({round:vegetableMeals.round,file:vegetableMeals.report});
curryRecord.sourceReviewResult = curry.sourceReviewResult;
curryRecord.sourceReviewNextAction = curry.sourceReviewNextAction+' '+curryRecord.sourceReviewNextAction;
const focusedCount=records.filter(x=>x.reports.length).length;
assert.equal(focusedCount,137,'Selected R45–R69 coverage must be derived from original IDs.');
const sourceRowsText=fs.readFileSync(path.join(dir,'catalogue-source-evidence.js'),'utf8');
const sourceRows=JSON.parse(sourceRowsText.slice(sourceRowsText.indexOf('=')+1).trim().replace(/;$/,''));
const allWorksheets=Object.values(sourceRows.products);
const worksheetReview={round:93,reviewedOn:sourceRows.date,products:allWorksheets.length,
  standards:allWorksheets.filter(p=>p.scope==='product_standard').length,categoryRoutes:allWorksheets.filter(p=>p.scope!=='product_standard').length,
  pageLocated:allWorksheets.filter(p=>sourceRows.standards[p.standard]?.p.length||p.routeAnchors?.length).length,
  partialContaminantEvidence:allWorksheets.filter(p=>p.directCTR).length,openContaminantArticleDecisions:allWorksheets.filter(p=>!p.directCTR).length,
  primaryPDFs:sourceRows.capturedPDFs,monographsRead:sourceRows.portalRead,commodityRows:sourceRows.commodityRows.length,
  allApplicableProvisionsConfirmed:0,report:'catalogue-worksheet-review-r93.md'};
assert.deepEqual([worksheetReview.products,worksheetReview.standards,worksheetReview.categoryRoutes,worksheetReview.pageLocated,worksheetReview.openContaminantArticleDecisions],[533,475,58,533,137]);
const broadContaminantReview={round:94,reviewedOn:sourceRows.date,products:allWorksheets.length,analytes:["Melamine","Mercury","Methyl mercury"],report:"broad-contaminants-r94.md",fullProductApprovals:0};
const metalArticleReview={round:95,reviewedOn:sourceRows.date,products:allWorksheets.length,metals:["Chromium","Nickel","Selenium","Antimony"],confectioneryProducts:11,report:"catalogue-metal-review-r95.md",fullProductApprovals:0};
const cropContext=vm.createContext({PMSVCatalogueEvidence:sourceRows});
for(const file of ['catalogue-metal-scope-data.js','catalogue-crop-scope-data.js','catalogue-crop-scope.js']){
 vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),cropContext);
}
const cropArticleReview={round:96,reviewedOn:sourceRows.date,...cropContext.PMSVCropScope.stats(),report:'catalogue-crop-review-r96.md',fullProductApprovals:0};
assert.equal(cropArticleReview.products,533);assert.equal(cropArticleReview.sourceRows,45);assert.equal(cropArticleReview.analytes,12);
for(const file of ['catalogue-rule-data.js','catalogue-metal-scope.js','broad-contaminants.js','catalogue-metal-panel-data.js','catalogue-metal-panel.js']){
 vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),cropContext);
}
const metalPanelReview={round:97,reviewedOn:sourceRows.date,...cropContext.PMSVMetalPanel.stats(),report:'catalogue-metal-panel-review-r97.md',fullProductApprovals:0};
assert.equal(metalPanelReview.products,533);assert.equal(metalPanelReview.rows,382);assert.equal(metalPanelReview.headings,11);
// Reuse the original Gazette concordance so the printed units and the two
// ambiguous species headings stay identical in both review entry points.
const veterinaryReview = {
 round:98, reviewedOn:sourceRows.date, report:'catalogue-veterinary-review-r98.md',
 sources:{
  seafood:'https://www.fssai.gov.in/upload/uploadfiles/files/Contaminants_Regulations.pdf',
  veterinary:residue.sources.ctr2024.url,
  december:sourceRows.documents['ctr-1'].url.split('#')[0]
 },
 seafood:[['Tetracycline','0.1'],['Oxytetracycline','0.1'],['Trimethoprim','0.05'],['Oxolinic acid','0.3']],
 prohibited:residue.prohibitedClasses.map(r=>({serial:r.serial,drug:r.originalName,
  limit:r.serial===2?'0.0003':'0.001',page:r.sourcePdfPage})),
 honey:residue.honeyRows.map(({coreRow:r,sourcePdfPage})=>({serial:r.serial,drug:r.name,
  limit:r.mrpl,condition:r.condition||'',page:sourcePdfPage})),
 groups:residue.veterinaryGroups.map(g=>({serial:g.serial,drug:g.coreName,printed:g.originalName,
  rows:g.rows.map(r=>({index:r.coreIndex,article:r.coreArticle,limit:r.sourceLimit,unit:r.sourceUnit,
   page:r.sourcePdfPage,override:r.originalDrugOverride,locked:r.lockedSourceAlignment}))})),
 fullProductApprovals:0
};
cropContext.PMSV_REVIEW_REGISTER={veterinaryReview};
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-veterinary.js'),'utf8'),cropContext);
Object.assign(veterinaryReview,cropContext.PMSVVeterinary.stats([...ids]));
assert.equal(veterinaryReview.products,533);
assert.equal(veterinaryReview.toleranceRows,358);
// Rows retain their index and source wording in the R71 concordance. Compact
// tuples keep the full Gazette table usable in the offline download.
const pesticideReview={
 round:99, reviewedOn:'2026-11-21', report:'catalogue-pesticide-review-r99.md',
 sources:{
  gazette:residue.sources.ctr2018.url, scope:residue.sources.scope2021.url, spice:residue.sources.spices2024.url,
  tea2023:'https://fssai.gov.in/upload/advisories/2023/04/644b6627e7923Direction_Fixation%20of%20MRL%20of%20Pesticides%20in%20Tea.pdf',
  teaTesting:'https://fssai.gov.in/upload/advisories/2023/12/656dbd1d58845Order%20for%20testing%20banned%20pesticides.pdf',
  tea2024:'https://fssai.gov.in/upload/advisories/2024/03/65e6f53962cfbDirection_04.03.2024.pdf',
  teaDraft:'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2324656',
  amendments:'https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins'
 },
 teaDirections:[
  [68,'Emamectin Benzoate','0.06','tea2023'],[82,'Fenpyroximate','6.0','tea2023'],
  [97,'Hexaconazole','5.0','tea2023'],[155,'Propiconazole','6.0','tea2023'],[163,'Quinalphos','0.7','tea2023'],
  [50,'Cypermethrin','0.01','tea2024'],[2,'Acephate','0.01','tea2024'],[103,'Imidacloprid','0.01','tea2024'],
  [3,'Acetamiprid','0.01','tea2024'],[62,'Dinotefuran','0.01','tea2024'],[84,'Fipronil','0.01','tea2024']
 ],
 nameHolds:residue.chemicalNameDifferences.map(d=>d.serial),
 groups:residue.pesticideGroups.map(g=>({serial:g.serial,printed:g.originalName,name:g.coreName,
  rows:g.rows.map(r=>[r.sourceArticle,r.sourceLimit,r.sourcePdfPage,r.coreCondition,r.originalSubgroup,
   r.originalArticleCell===r.sourceArticle?'':r.originalArticleCell,
   r.originalLimitCell===r.sourceLimit?'':r.originalLimitCell])})),
 fullProductApprovals:0
};
cropContext.PMSV_REVIEW_REGISTER.pesticideReview=pesticideReview;
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-pesticides.js'),'utf8'),cropContext);
Object.assign(pesticideReview,cropContext.PMSVPesticides.stats([...ids]));
assert.equal(pesticideReview.products,533);
assert.equal(pesticideReview.gazetteRows,1098);
assert.equal(pesticideReview.groups.length,213);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-ethylene-oxide.js'),'utf8'),cropContext);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-residue-panel.js'),'utf8'),cropContext);
const spicePanelReview={round:100,reviewedOn:'2026-11-21',report:'catalogue-spice-panel-review-r100.md',
 ...cropContext.PMSVResiduePanel.summary(),sources:cropContext.PMSVResiduePanel.sources,fullProductApprovals:0};
assert.equal(spicePanelReview.marketedProducts,36);
assert.equal(spicePanelReview.products,533);
const ethyleneOxideReview={round:101,reviewedOn:'2026-11-21',report:'catalogue-ethylene-oxide-review-r101.md',
 products:spicePanelReview.products,marketedProducts:spicePanelReview.marketedProducts,method:cropContext.PMSVEthyleneOxide.methodId,
 sources:cropContext.PMSVEthyleneOxide.sources,fullProductApprovals:0};
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-ingredient-percentage.js'),'utf8'),cropContext);
const ingredientPercentageReview={round:102,reviewedOn:'2026-11-21',report:'catalogue-ingredient-percentage-review-r102.md',
 products:Object.keys(cropContext.PMSVCatalogueRules.products).length,provision:'5(2)(g)',triggers:2,provisos:6,sources:cropContext.PMSVIngredientPercentage.sources,fullProductApprovals:0};
assert.equal(ingredientPercentageReview.products,533);
const data={ingredientPercentageReview,ethyleneOxideReview,spicePanelReview,pesticideReview,veterinaryReview,metalPanelReview,cropArticleReview,metalArticleReview,broadContaminantReview,worksheetReview,schemaVersion:1,checkpointDate:'2026-11-14',latestSourceReviewDate:ingredientPercentageReview.reviewedOn,latestRound:ingredientPercentageReview.round,
 catalogueCount:533,queueCount:records.length,focusedCount,remainingFocusedCount:records.length-focusedCount,
 legalProductApprovals:0,batchReleases:0,
 scope:'Selected earlier focused reviews cover 67 identities; R69 adds source-wording and scope checks for the remaining 70. All 137 original queue products have a linked review. R96 identifies at least one named finished-article limit under CTR 2.2.1 for '+cropArticleReview.priorityNamed+' of them. R97 establishes all 11 metal outcomes for '+metalPanelReview.priorityOutcomes+' original priority products. R98 identifies a current veterinary-residue provision for the marketed article of '+veterinaryReview.directProducts+' catalogue products. R99 links pesticide sources and processing decisions to all 533 worksheets, with named sample choices for '+pesticideReview.mappedProducts+' marketed articles. R100 adds documented spice-order decisions and multi-result pesticide reports. R101 adds EO and 2-CE laboratory reports, censored sums and treatment evidence for identified spices. R102 links ingredient emphasis and the six percentage provisos to artwork and ingoing recipe checks in all 533 worksheets. Wider contaminant review continues. This is not complete regulatory verification of the 533 products.',
 sourceVerificationRequiresLotReport:false,
 softwareVerification:'Automated data, browser and audit results are documented in verification-2026-11-14.md. These software checks are separate from complete current-law verification, which remains open.',
 sourceFiles:[...sourceFiles,gazetteFile,residueFile,toxinFile,fibreFile,waterFile,waterStandardFile,asafoetidaFile,camphorFile,lajadiFile,ingredientBaselineFile,juniperFile,hinguFile,flowerFile,flowerSupplyFile,rhizomeFile,pasteFile,sauceFile,namedSauceFile,concentrateFile,tomatoJuiceFile,cannedTomatoFile,thermalPacksFile,cocktailFile,vegetableMealsFile],records,
 juniperSpiceReview:{...juniper,rawRows,coverage},
 ayurvedaIngredientCoverage:currentCoverage,
 recipeFlowerReview:{...flowers,rawRows:flowerRows,coverage:flowerCoverage},
 rhizomeSpiceReview:{...rhizomes,spices:rhizomeSpices,addedLinks,
  sources:{gazette:flowers.sources.gazette.url,compendium:flowers.sources.compendium.url,recipe:flowers.sources.recipe.url}},
 culinarySauceReview:{...sauces,sources:{gazette:paste.sources.gazette,chapter:paste.sources.chapter,proposal:paste.sources.proposal}},
 tomatoSoybeanReview:{...namedSauces,sources:sauceSources},
 tomatoConcentrateReview:{...concentrate,sources:{
  gazette:{...sauceSources.gazette,page:concentrate.sourcePages.gazette},
  chapter:{...sauceSources.chapter,page:concentrate.sourcePages.chapter},method:concentrate.method}},
 tomatoJuiceReview:{...tomatoJuice,sources:{gazette:{...sauceSources.gazette,page:55},chapter:{...sauceSources.chapter,page:20},
  method:{...concentrate.method,page:35}}},
 cannedTomatoReview:{...cannedTomato,sources:{
  amendment:{url:tomatoJuice.amendment.url,sha256:tomatoJuice.amendment.sha256,page:cannedTomato.sourcePages.amendment},
  chapter:{...sauceSources.chapter,page:cannedTomato.sourcePages.chapter},
  method:{...concentrate.method,page:cannedTomato.sourcePages.method}}},
 thermalPackReview:{...thermalPacks,sources:{gazette:sauceSources.gazette,chapter:sauceSources.chapter,method:{...concentrate.method,page:5}}},
 fruitCocktailReview:{...cocktail,sources:{
  amendment:{...namedSauces.products[0].amendment,page:18},chapter:{...sauceSources.chapter,page:4},gazette:{...sauceSources.gazette,page:52}}},
 vegetableMealReview:{...vegetableMeals,sources:sauceSources},
 gingerPasteReview:paste,
 flowerSupplyReview:flowerSupply,
 hinguReview:{...hingu,coverage:hinguCoverage,rawRows:hinguRows,sources:{...hingu.sources,
  gazette:juniper.sources.gazette,spicesAct:juniper.sources.boardArchive,recipe:asafoetida.sources.recipe2025}},
 lajadiBotanicalReview:lajadi,
 camphorReview:camphor,
 asafoetidaReview:{...asafoetida,report:asafoetidaFile.replace(/\.json$/,'.md')},
 waterStandardReview:{...waterStandard,report:waterStandardFile.replace(/\.json$/,'.md')},
 waterSourceReview:{round:74,report:waterFile.replace(/\.json$/,'.md'),checkedOn:water.reviewedOn,
  records:water.records,bisStandard:water.bisStandard,draftReplacement:water.draftReplacement,counts:water.counts,
  sources:{vending:water.sources.vending2019.url+'#page=4',ingredient:water.sources.licensingFAQ2022.url+'#page=18',bis:water.sources.bisMetadata.url,draft:water.sources.vendingDraft2025.url+'#page=10'},
  fullCurrentLawComplete:false,legalProductApproval:false,batchRelease:false,autoApplyLimits:false},
 fibreClaimsReview:{round:73,report:fibreFile.replace(/\.json$/,'.md'),checkedOn:fibre.reviewedOn,productId:fibre.productId,sourceDecision:fibre.sourceDecision,
  thresholdRows:fibre.thresholdRows,findings:fibre.findings,source:fibre.sources.claims2022dec.url+'#page=13',originalDextrinSource:fibre.sources.dextrin2016.url+'#page=5',
  legalProductApproval:false,labelApproved:false,batchRelease:false},
 toxinGazetteReview:{round:72,report:toxinFile.replace(/\.json$/,'.md'),checkedOn:toxin.reviewedOn,
  ...toxin.counts,fullCurrentLawComplete:false,numericRulesChanged:false,productApprovals:0,
  summary:'37 toxin-limit or sampling-plan rows and 119 histamine species entries were compared with original notifications. Numerical values agree. Histamine species scope, all three sampling criteria, mixed toxin units and the melamine corrigendum are explicit.',
  findings:toxin.findings,seafoodNoteIds,
  seafoodNote:'If a histamine route is selected, confirm the listed fish species as well as the product category. The original applicability cell spans processed-product rows too. Nine individual results must satisfy the mean, count and maximum criteria. No fish-table limit is assigned solely by this catalogue category.'},
 residueGazetteReview:{round:71,report:residueFile.replace(/\.json$/,'.md'),checkedOn:residue.reviewedOn,
  pesticideRows:residue.counts.pesticideRows,veterinaryRows:residue.counts.veterinaryRows,
  honeyRows:residue.counts.honeyRows,prohibitedClasses:residue.counts.prohibitedClasses,
  numericMismatches:0,numericRulesChanged:false,fullCurrentLawComplete:false,productApprovals:0,
  summary:'1,098 pesticide entries and 358 veterinary entries were compared with original Gazette tables, plus 12 honey entries and 14 prohibited substance classes. No stored numerical limit changed. Article wording, chemical names, sample basis and repeated rows retain explicit safeguards.',
  findings:residue.findings},
 originalGazetteReview:{round:70,report: gazetteFile.replace(/\.json$/,'.md'),checkedOn:gazette.reviewedOn,
  metalRows:gazette.counts.metalRows,cropRows:gazette.counts.cropRows,
  fullCurrentLawComplete:false,numericRulesChanged:false,productApprovals:0,
  summary:'382 metal entries and 27 crop-contaminant entries match the original notifications, including the changes effective from April 2025. Packaging, analytical basis, unusual source literals and overlapping article descriptions remain explicit. Exact product applicability still requires review.',
  futureChanges:gazette.futureChanges.map(({id,title,effectiveFrom,scopeNote})=>({id,title,effectiveFrom,scopeNote,autoApply:false,operativeOnReviewDate:false}))},
 currencyWatch:[
  {title:'May 2026 contaminants amendment',source:gazette.sources.ctr2026.url,sourceSha256:gazette.sources.ctr2026.sha256,checked:'2026-11-14',effectiveFrom:'2026-12-01',status:'Nine changes checked against the original notification: pulse flours, fish-oil arsenic, oil/oilseed aflatoxin wording, saffrole scope and seafood drug provisions. Future on this review date; no changes activated.'},
  {title:'Milk-logo graphic specifications notification',source:followup.sources.milk_logo.url,sourceSha256:followup.sources.milk_logo.sha256,checked:'2026-11-14',listed:'2026-11-06',effectiveFrom:'2028-07-01',status:'Original Gazette clause 1(2) and graphic table checked. The new specifications commence on 1 July 2028; no dimensions activated. Earlier milk-logo obligations require their own direction-chain review.'},
  {title:'Original metal and crop-contaminant tables',source:gazette.sources.ctr2020.url,sourceSha256:gazette.sources.ctr2020.sha256,checked:'2026-11-14',status:'All 382 metal entries reconciled with the original 2020 replacement table. Crop entries were checked with the later operative replacements. A source match does not resolve competing article scopes or approve a product.'},
  {title:'Operative 2024 crop-contaminant replacements',source:gazette.sources.ctr2024.url,sourceSha256:gazette.sources.ctr2024.sha256,checked:'2026-11-14',effectiveFrom:'2025-04-01',status:'The original Ochratoxin A and Deoxynivalenol replacements match the stored source rows. The listed commodities and µg/kg units are retained; no automatic assignment to processed or composite foods.'}
 ]};
const output='/* Generated by scripts/build-helper-review-status.cjs; review coverage only. */\nwindow.PMSV_REVIEW_REGISTER = '+JSON.stringify(data,null,2)+';\n';
const target=path.join(dir,'review-status-data.js');
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),output,'Regenerate the review register');
else fs.writeFileSync(target,output);
console.log('Review register: 533 catalogue entries, 137 open cases, 137 source reviews, 0 outside selected rounds.');
