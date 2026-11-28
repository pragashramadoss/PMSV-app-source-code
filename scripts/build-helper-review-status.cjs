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
for(const file of ['catalogue-metal-scope-data.js','catalogue-crop-scope-data.js','catalogue-recipe-samples.js','catalogue-crop-scope.js']){
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
const veterinaryEditionReview={round:113,reviewedOn:'2026-11-22',effectiveFrom:'2026-12-01',products:533,seafoodProducts:24,report:'catalogue-veterinary-editions-r113.md'};
cropContext.PMSV_REVIEW_REGISTER={veterinaryReview,veterinaryEditionReview};
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
Object.assign(pesticideReview,cropContext.PMSVPesticides.stats([...ids],false));
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
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-batch-site.js'),'utf8'),cropContext);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-lot-dates.js'),'utf8'),cropContext);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-date-marking.js'),'utf8'),cropContext);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-small-pack.js'),'utf8'),cropContext);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-ingredient-order.js'),'utf8'),cropContext);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-ingredient-percentage.js'),'utf8'),cropContext);
const ingredientPercentageReview={round:102,reviewedOn:'2026-11-21',report:'catalogue-ingredient-percentage-review-r102.md',
 products:Object.keys(cropContext.PMSVCatalogueRules.products).length,provision:'5(2)(g)',triggers:2,provisos:6,sources:cropContext.PMSVIngredientPercentage.sources,fullProductApprovals:0};
assert.equal(ingredientPercentageReview.products,533);
const recipeRequestReview={round:103,reviewedOn:'2026-11-21',report:'catalogue-rd-recipe-requests-r103.md',
 products:ingredientPercentageReview.products,requestColumns:cropContext.PMSVIngredientPercentage.requestColumns,fullProductApprovals:0};
assert.equal(recipeRequestReview.requestColumns.length,3);
const ingredientOrderReview={round:104,reviewedOn:'2026-11-21',report:'catalogue-ingredient-order-review-r104.md',products:recipeRequestReview.products,
 sources:cropContext.PMSVIngredientOrder.sources,scopes:Object.keys(cropContext.PMSVIngredientOrder.scopes),fullProductApprovals:0};
const smallPackReview={round:105,reviewedOn:'2026-11-21',report:'catalogue-small-pack-review-r105.md',products:ingredientOrderReview.products,
 declarations:Object.keys(cropContext.PMSVSmallPack.titles).length,sources:cropContext.PMSVSmallPack.sources,fullProductApprovals:0};
assert.equal(smallPackReview.declarations,20);
const batchSiteReview={round:106,reviewedOn:'2026-11-21',report:'catalogue-batch-site-review-r106.md',products:smallPackReview.products,
 provision:'5(7)(b)',sources:cropContext.PMSVBatchSite.sources,fullProductApprovals:0};
const dateMarkingReview={round:107,reviewedOn:'2026-11-21',report:'catalogue-date-marking-r107.md',products:batchSiteReview.products,
 provision:'5(10)(d)',sources:cropContext.PMSVDateMarking.sources,fullProductApprovals:0};
const lotDateReview={round:108,reviewedOn:'2026-11-21',report:'catalogue-lot-dates-r108.md',products:dateMarkingReview.products,
 provision:'5(10)(b)',sources:cropContext.PMSVLotDates.sources,fullProductApprovals:0};
const shelfLifeReview={round:109,reviewedOn:'2026-11-21',report:'catalogue-shelf-life-r109.md',products:lotDateReview.products,
 basis:'SKU coding instruction',fullProductApprovals:0};
const variantCompositionReview={round:110,reviewedOn:'2026-11-21',report:'catalogue-variant-composition-r110.md',
 products:3,forms:7,articles:['2.7.3','2.7.7','2.7.8'],fullProductApprovals:0};
const testingPlanReview={round:111,reviewedOn:'2026-11-21',report:'catalogue-testing-plan-r111.md',products:533,
 areas:['Composition and identity','Microbiology','Metals','Toxins and other contaminants'],fullProductApprovals:0};
const residueTestingPlanReview={round:112,reviewedOn:'2026-11-21',report:'catalogue-residue-testing-plan-r112.md',products:533,
 areas:['Pesticide residues','Veterinary drug residues'],fullProductApprovals:0};
const contaminantEditionReview={round:114,reviewedOn:'2026-11-22',effectiveFrom:'2026-12-01',products:533,report:'catalogue-contaminant-editions-r114.md'};
const worksheetPlanEvidenceReview={round:115,reviewedOn:'2026-11-22',products:533,report:'catalogue-worksheet-testing-plan-r115.md'};
const measuredPlanReview={round:116,reviewedOn:'2026-11-22',products:533,report:'catalogue-measured-results-r116.md'};
const toxinLabReview={round:117,reviewedOn:'2026-11-22',products:533,analytes:12,report:'catalogue-toxin-results-r117.md'};
const multiMetalReview={round:118,reviewedOn:'2026-11-22',products:533,metals:11,report:'catalogue-multiple-metal-results-r118.md'};
const metalReportingReview={round:119,reviewedOn:'2026-11-22',products:533,metals:11,report:'catalogue-metal-reporting-limits-r119.md'};
const pesticide=cropContext.PMSVPesticides;
const catalogue=catalogueContext.window.PMSV_CATALOGUE;
const newGroupSources=catalogue.filter(product=>pesticide.groupSource(product.id));
assert(newGroupSources.every(p=>p.sourceStatus==='FIRST_EXACT_SOURCE_PENDING'));
const currentPesticideStats=pesticide.stats([...ids]);
const metal=cropContext.PMSVMetalPanel;
const metalProductIds=catalogue.filter(p=>metal.firstSource(p.id)).map(p=>p.id);
const legacyAdditiveIds=Object.keys(metal.additiveGroups).filter(id=>id!==metal.polyolId);
const additiveMetalReview={round:129,reviewedOn:'2026-11-24',report:'catalogue-additive-metals-r129.md',
 productIds:legacyAdditiveIds,criteria:legacyAdditiveIds.reduce((sum,id)=>sum+metal.additiveCriteriaRows(id).length-1,0)};
assert.equal(additiveMetalReview.criteria,12);
assert.deepEqual([...metalProductIds].sort(),[metal.carobId,metal.catechuId,metal.sajjiId,metal.silverId,metal.dextrinId,metal.misriId,metal.trehaloseId,metal.polyolId,...additiveMetalReview.productIds].sort());
assert(metalProductIds.every(id=>catalogue.some(p=>p.id===id&&p.sourceStatus==='FIRST_EXACT_SOURCE_PENDING'&&!pesticide.groupSource(id))));
assert(catalogue.some(p=>p.id===metal.dextrinId&&p.sourceStatus==='FIRST_EXACT_SOURCE_PENDING'&&!pesticide.groupSource(p.id)));
const crop=cropContext.PMSVCropScope;
const recipeSamples=cropContext.PMSVRecipeSamples;
const recipeSampleReview={round:132,reviewedOn:'2026-11-24',report:'catalogue-recipe-samples-r132.md',products:recipeSamples.originalIds.length,
 productIds:recipeSamples.originalIds.filter(id=>id!==recipeSamples.singhara&&recipeSamples.firstSource(id)),criteria:recipeSamples.originalIds.reduce((sum,id)=>sum+recipeSamples.criteriaRows(id).slice(1).filter(row=>id!==recipeSamples.singhara||row[4]==='ingredient').length,0)};
assert.deepEqual([recipeSampleReview.products,recipeSampleReview.productIds.length,recipeSampleReview.criteria],[4,2,11]);
const toxinProducts=catalogue.filter(p=>crop.firstSource(p.id));
assert(toxinProducts.every(p=>p.sourceStatus==='FIRST_EXACT_SOURCE_PENDING'&&!metal.firstSource(p.id)&&!pesticide.groupSource(p.id)));
const spiceFoodReview={round:126,reviewedOn:'2026-11-24',report:'catalogue-spice-food-aflatoxins-r126.md',products:toxinProducts.filter(p=>crop.spiceCriteriaRows(p.id).length>1).length};
assert.equal(spiceFoodReview.products,2);
const botanicalReview={round:130,reviewedOn:'2026-11-24',report:'catalogue-functional-spices-r130.md',
 productIds:crop.botanicalIds,criteria:crop.botanicalCriteriaRows().length-1};
assert.equal(botanicalReview.criteria,18);
assert(botanicalReview.productIds.every(id=>toxinProducts.some(p=>p.id===id)));
const childCropReview={round:127,reviewedOn:'2026-11-24',report:'catalogue-child-supplement-contaminants-r127.md',productId:crop.childId,criteria:crop.childCriteriaRows().length-1};
assert.equal(childCropReview.criteria,15);
const veterinary=cropContext.PMSVVeterinary;
const casingReview={round:131,reviewedOn:'2026-11-24',report:'catalogue-casings-egg-powder-r131.md',productId:veterinary.casingId,
 casingCriteria:veterinary.focusedRows(veterinary.casingId).length,eggInputCriteria:veterinary.focusedRows(veterinary.eggPowderId).length};
assert.deepEqual([casingReview.casingCriteria,casingReview.eggInputCriteria],[20,7]);
const vetProductIds=catalogue.filter(p=>veterinary.firstSource(p.id)).map(p=>p.id);
assert.deepEqual([...vetProductIds],[veterinary.casingId]);
assert(catalogue.some(p=>p.id===veterinary.casingId&&p.sourceStatus==='FIRST_EXACT_SOURCE_PENDING'));
const currentStatus=p=>veterinary.firstSource(p.id)?.status||crop.firstSource(p.id)?.status||metal.firstSource(p.id)?.status||pesticide.sourceStatus(p);
const dextrinReview={round:125,reviewedOn:'2026-11-24',report:'catalogue-dextrin-lead-r125.md',productId:metal.dextrinId,metalRow:'Pb64'};
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-powder-standards.js'),'utf8'),cropContext);
const powderProfiles=[...cropContext.PMSVPowderStandards.products.values()];
const powderReview={round:134,reviewedOn:'2026-11-24',report:'catalogue-powder-standards-r134.md',productIds:powderProfiles.map(p=>p.id),
 comparisons:powderProfiles.reduce((total,p)=>total+p.criteria.length,0),rows:powderProfiles.reduce((total,p)=>total+p.rows.length,0)};
assert.equal(powderReview.comparisons,26);
vm.runInContext(fs.readFileSync(path.join(dir,'catalogue-coffee.js'),'utf8'),cropContext);
const coffeeForms=[...cropContext.PMSVCoffee.profiles.values()].flat();
const coffeeReview={round:135,reviewedOn:'2026-11-24',report:'catalogue-coffee-r135.md',productIds:cropContext.PMSVCoffee.ids,
 forms:coffeeForms.length,comparisons:coffeeForms.reduce((n,f)=>n+f.criteria.length,0)};
assert.equal(coffeeReview.forms,10);
const sugarReview={round:133,reviewedOn:'2026-11-24',report:'catalogue-sweetener-samples-r133.md',productIds:[metal.misriId,metal.syrupId,metal.trehaloseId],metalRow:'Pb2'};
const ingredientReview={round:136,reviewedOn:'2026-11-24',report:'catalogue-ingredient-review-r136.md',silverId:metal.silverId,
 productIds:[metal.silverId,'04-04-1-catechu-edible','04-04-2-cocoa-beans'],metalRows:Object.values(metal.silverMetals)};
const importAndFormReview={round:137,reviewedOn:'2026-11-24',report:'catalogue-sajji-colostrum-royal-jelly-r137.md',
 importId:metal.sajjiId,metalRows:Object.values(metal.unspecifiedMetals),
 formProductIds:['100-100-cow-or-buffalo-colostrum-and-colostrum-products','100-100-royal-jelly']};
const saltAndIngredientReview={round:138,reviewedOn:'2026-11-25',report:'catalogue-salt-and-ingredient-routes-r138.md',
 saltProductId:recipeSamples.salt,saltSampleCriteria:recipeSamples.criteriaRows(recipeSamples.salt).length-1,
 otherProductIds:["11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th","11-11-6-sorbitol","99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc","05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake"]};
assert.equal(saltAndIngredientReview.saltSampleCriteria,4);
const sulphiteReview={round:140,reviewedOn:'2026-11-25',report:'catalogue-sulphites-r140.md',products:13,referenceRows:17};
const incomingSampleReview={round:139,reviewedOn:'2026-11-25',report:'catalogue-incoming-samples-r139.md',productPlans:5,ingredientReferences:16,outstandingProducts:16};
const singharaReview={round:141,reviewedOn:'2026-11-25',report:'catalogue-singhara-aflatoxins-r141.md',productId:recipeSamples.singhara,criteria:recipeSamples.criteriaRows(recipeSamples.singhara).length-1};
assert.equal(singharaReview.criteria,8);
const starchIngredientReview={round:142,reviewedOn:'2026-11-26',report:'catalogue-starch-ingredients-r142.md',syrupId:recipeSamples.syrup,trehaloseId:metal.trehaloseId};
const polyolReview={round:143,reviewedOn:'2026-11-26',report:'catalogue-polyols-r143.md',productId:metal.polyolId,forms:metal.additiveGroup(metal.polyolId).forms.length,referenceRows:metal.polyolRows().length-1};
assert.deepEqual([polyolReview.forms,polyolReview.referenceRows],[3,9]);
const openProductReview={round:144,reviewedOn:'2026-11-26',report:'catalogue-open-products-r144.md',products:12,waterToxicLimits:15,rawArrowrootMetals:2,productPlans:6,ingredientReferences:18};
const additiveSolventReview={round:145,reviewedOn:'2026-11-26',report:'catalogue-additives-solvents-r145.md',products:4,referenceRows:22};
const catechuReview={round:146,reviewedOn:'2026-11-26',report:'catalogue-catechu-flavouring-r146.md',productId:metal.catechuId,referenceRows:metal.catechuRows().length-1};
assert.equal(catechuReview.referenceRows,2);
const sampleScopeReview={round:147,reviewedOn:'2026-11-26',report:'catalogue-egg-export-enzyme-melamine-r147.md',eggRows:29,enzymeRows:6,referenceRows:35,melaminePlans:533};
const carobReview={round:148,reviewedOn:'2026-11-26',report:'catalogue-carob-pulp-r148.md',productId:metal.carobId,referenceRows:metal.carobRows().length-1,incomingReferences:28};
assert.equal(carobReview.referenceRows,3);
const vendingSaffroleReview={round:149,reviewedOn:'2026-11-26',report:'catalogue-vending-coffee-cocoa-r149.md',endExclusive:'2026-12-01',productId:crop.vendingId};
const finishedSampleReview={round:167,reviewedOn:'2026-11-28',report:'catalogue-cacao-residues-r167.md',spiceMicroProducts:43,eggMicroProducts:5,grainMicroProducts:78,fruitMicroProducts:55,microFormProducts:7,formulationProducts:9,samplingPurposeCount:6,namedSamplingProducts:224,samplingFormProducts:25,regulatorySamplingProducts:533,samplingTableItems:52,starchAndEnzymeProducts:5,dairyMicroProducts:4,processedCropProducts:5,melamineReportProducts:533,productProfiles:10,methodReferences:34,dryBasisChecks:2,importProducts:5,importDocumentRows:11,preventionReferences:4,beanCountChecks:4};
const firstSourceReview={
 round:finishedSampleReview.round,reviewedOn:finishedSampleReview.reviewedOn,report:finishedSampleReview.report,vetProductIds,metalProductIds,toxinProductIds:toxinProducts.map(p=>p.id),
 groupProductIds:newGroupSources.map(p=>p.id),
 priorPartial:catalogue.filter(p=>p.sourceStatus==='PARTIAL_EXACT_SOURCE_MATCH').length,
 pending:catalogue.filter(p=>currentStatus(p)==='FIRST_EXACT_SOURCE_PENDING').length,
 withRoute:catalogue.filter(p=>currentStatus(p)!=='FIRST_EXACT_SOURCE_PENDING').length,
 pesticideMapped:currentPesticideStats.mappedProducts,priorityPesticideMapped:currentPesticideStats.priorityMapped
};
assert.deepEqual([firstSourceReview.priorPartial,newGroupSources.length,firstSourceReview.withRoute,firstSourceReview.pending],[498,4,524,9]);
const fruitAndGrainSources=newGroupSources.filter(p=>['fruit','grain'].includes(pesticide.groupSource(p.id).commodityGroup));
const groupPesticideReview={round:121,reviewedOn:'2026-11-23',report:'catalogue-group-pesticides-r121.md',
 products:fruitAndGrainSources.length,comparisons:fruitAndGrainSources.reduce((count,p)=>count+pesticide.groupSource(p.id).rows.length,0)};
const vendingPlanReview={round:122,reviewedOn:'2026-11-23',productId:'purified-vending-water',entries:waterStandard.rows.length,
 report:'catalogue-vending-water-r122.md'};
const lactoseId='11-11-1-edible-lactose';
const lactoseReview={round:123,reviewedOn:'2026-11-23',productId:lactoseId,
 comparisons:pesticide.groupSource(lactoseId).rows.length,report:'catalogue-edible-lactose-r123.md'};
const cocoaMixReview={round:124,reviewedOn:'2026-11-23',productId:'05-05-1-dry-mixtures-of-cocoa-and-sugars',namingRows:11,report:'catalogue-cocoa-mixtures-r124.md'};
const scheduleDFile='ayurveda-schedule-d-finished-product-source-r41-2026-11-04.json';
const scheduleD=read(scheduleDFile);
const recipePages=Object.fromEntries(catalogue.filter(p=>p.id.startsWith('102-102-1-')).map(p=>{
 const anchor=cropContext.PMSVCatalogueEvidence.products[p.id].routeAnchors?.find(([doc])=>doc==='route-8f8cafb88');
 // Recipe 14.2 is on PDF page 92 (printed page 56) of the July 2025 order.
 const page=p.id==='102-102-1-14-2-ksheerasara-sweetened-condensed-milk'?92:anchor?.[1][0];
 assert(Number.isInteger(page));return [p.id,page];
}));
const ayurvedaPlanReview={round:128,reviewedOn:'2026-11-24',report:'catalogue-ayurveda-contaminant-plan-r128.md',
 gazette:'https://stg-old.fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf',
 order:'https://stg-old.fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf',
 recipePages,variantHolds:read('ayurveda-recipe-authority-clarification-r53-2026-11-04.json').recipes.map(r=>r.catalogue_id),
 rules:scheduleD.schedule_D_contaminant_source_rows.map(r=>({name:r.analyte,max:String(r.printed_maximum),unit:r.unit,
   page:r.unit.includes('mg/L')?24:25,ingredientCondition:r.conditional_group_footnote}))};
assert.deepEqual([Object.keys(recipePages).length,ayurvedaPlanReview.rules.length,ayurvedaPlanReview.variantHolds.length],[10,10,2]);
const data={finishedSampleReview,vendingSaffroleReview,carobReview,sampleScopeReview,catechuReview,additiveSolventReview,openProductReview,polyolReview,starchIngredientReview,singharaReview,sulphiteReview,incomingSampleReview,saltAndIngredientReview,importAndFormReview,ingredientReview,coffeeReview,powderReview,sugarReview,recipeSampleReview,casingReview,botanicalReview,additiveMetalReview,ayurvedaPlanReview,childCropReview,spiceFoodReview,dextrinReview,cocoaMixReview,lactoseReview,vendingPlanReview,groupPesticideReview,firstSourceReview,metalReportingReview,multiMetalReview,toxinLabReview,measuredPlanReview,worksheetPlanEvidenceReview,contaminantEditionReview,veterinaryEditionReview,residueTestingPlanReview,testingPlanReview,variantCompositionReview,shelfLifeReview,lotDateReview,dateMarkingReview,batchSiteReview,smallPackReview,ingredientOrderReview,recipeRequestReview,ingredientPercentageReview,ethyleneOxideReview,spicePanelReview,pesticideReview,veterinaryReview,metalPanelReview,cropArticleReview,metalArticleReview,broadContaminantReview,worksheetReview,schemaVersion:1,checkpointDate:'2026-11-14',latestSourceReviewDate:finishedSampleReview.reviewedOn,latestRound:finishedSampleReview.round,
 catalogueCount:533,queueCount:records.length,focusedCount,remainingFocusedCount:records.length-focusedCount,
 legalProductApprovals:0,batchReleases:0,
 scope:'R167 documents the remaining Indian contaminant-source questions by date and adds nine Codex references for whole cacao bean purchase specifications. R166 adds a recipe calculation and material and labelling checks for chocolate, and corrects the preserved spice paste entry against Table 3B. R165 reviews the microbiological scope of 43 spices, herbs and seasonings and supports five-unit laboratory report checks for documented product forms. R164 verifies the egg sampling plans and adds individual laboratory-set interpretation for pasteurized liquid, frozen, dried and cooked egg products. R163 reviews 78 cereal and grain-related entries, includes the child supplement cross-reference and distinguishes product-standard microbiology from Table 9. R162 expands fruit and vegetable process worksheets to 55 products, corrects sample units for four drinks and adds fermentation evidence checks. R161 documents Table 4 microbiological criteria for twelve fruit and vegetable products and corrects the low-pH Listeria decision. R160 corrects microbiological form and process decisions for seven products. R159 covers product formulation and fat-basis checks. R158 covers sampling purpose and parts. R157 adds Food Analyst dispatch quantities and form checks across the 533 catalogue entries, with all 52 statutory table items and the change for unspecified foods on 1 April 2027. R156 reconciles sulphur dioxide limits for four finished starches, adds BIS arrowroot sampling and identity references and separates six enzyme uses in food from tests on the supplied preparation. R155 restores seven microbiological criteria each for four dairy products and adds pesticide processing-study guidance for five crop products. R154 adds laboratory report checks for melamine across all 533 products with matrix-specific analytical guidance and explicit reporting bounds. R153 adds Indian consignment document checks for egg powder, cocoa beans and coffee beans across five product worksheets. R152 adds cow colostrum powder IgG methods and same-sample dry-basis comparisons for colostrum powder ash and coconut milk powder fat. R151 adds coffee and processed cocoa methods and Codex prevention guidance to the laboratory guide and both dated testing plans. R150 covers the finished-sample laboratory criteria and analytical references for each open product in both editions, with a cocoa bean count worksheet. R149 documents the beverage entry for plain water sampled at a vending outlet through 30 November. On the review date 524 products have partial or conditional sources. The December plan has 10 open products because the replacement entry requires mace or nutmeg kernel. R148 adds three conditional metal checks for carob pulp powder and ten raw-material pesticide references for egg and arrowroot. 523 of 533 products now have a partial or conditional source and 10 await a first source. R147 carries the melamine article into every testing plan and adds separate export and processing-aid references for egg powder and enzyme preparations. R146 adds a conditional flavouring metal assessment for finished edible catechu. R145 adds food-additive and decaffeination references for four products and includes the reviewed residual lead, copper, arsenic and mercury entries in the open-product export. R144 identifies usable sample-specific references for the 12 open products, including 15 vending-water toxic-substance maxima and two raw Maranta intake checks. R143 adds a conditional dry-matter arsenic check for three polyol forms and separate JECFA purity references. R142 adds conditional sources for lead in starch-derived trehalose and hydrocyanic acid in dried glucose syrup made from named cassava flours. R141 identifies a conditional finished-flour aflatoxin source for Singhara. R140 links 13 sugar and syrup products to the sulphite table and the dried-syrup pack declaration. R139 records the next evidence needed for the 16 open finished-product sources and adds incoming ingredient references to five product plans. R138 connects salt substitutes containing cereal flour to the two finished-food aflatoxin provisions and distinguishes the named polyol and processing-aid specifications. R137 links imported Sajji Khar to six metal entries and adds sample-specific comparisons for colostrum and royal jelly. R136 adds a conditional colour-metal assessment for edible silver leaf and product-standard comparisons for silver leaf, catechu and cocoa beans. R135 covers coffee, chicory and coffee–chicory blends, including the July front-label direction and the raw-bean residue entry. R134 corrects the scope of the sago table, adds source-linked checks for six powders and starches and flags the conflicting protein requirements for water chestnut flour. R133 adds a lot-specific lead assessment for Misri and comparisons for eight composition parameters across Misri, dried glucose syrup and trehalose. As of 24 November 2026, 516 of 533 products have a partial or conditional source and 17 await a first source. R132 adds separate CTR criteria for two named Ayurveda Aahara recipes and incoming materials for two powders. R131 adds edible tissue residue criteria for natural casings, separate incoming hen egg checks, and a Gazette language discrepancy for whole egg powder protein. R130 adds conditional aflatoxin checks for three ground spices in two functional ingredient categories. R129 adds conditional original Gazette metal criteria for two identified food additive categories. R128 adds separate Schedule D contaminant plans for ten Ayurveda Aahara recipes. R127 checks aflatoxins in qualifying formulated supplements for children and ochratoxin A and deoxynivalenol in specified incoming grain samples. R126 checks total aflatoxins and B1 for spiced dry cocoa mixes and finished spiced egg pickles, with separate incoming spice criteria. R125 identifies a conditional lead entry for purified dextrin when sulphated ash exceeds 1.0% in the sampled lot. R124 covers the nine name and fat-class combinations for dry cocoa mixtures and both chocolate powder reporting bases. R123 identifies a conditional milk-product source for plain whey-derived edible lactose, with six pesticide rows subject to documented physical processing. R122 incorporates the 74 IS 10500 entries in the vending-water product plan under FSSR 2.10.9. R121 adds paraquat dichloride and thiometon to the conditional group entries for plain seedless tamarind, plain single-fruit frozen products and whole chia seed. R120 documents conditional 2,4-D group entries for three marketed forms. R119 compares numeric metal reporting bounds in mg or µg on the documented mass or volume basis. R118 retains and exports individual measurements for all eleven metal headings, including separate fish-oil arsenic results. R117 compares toxin reports by analyte, sampled article and assessment edition. R116 connects measured composition and date-specific metal results to the individual product plan. R115 carries worksheet evidence into individual product testing plans. R114 selects the December metal, aflatoxin and saffrole provisions in the complete testing plan using the assessment date. R113 supports assessment-date selection for veterinary residues under the two editions of CTR 2.3.2. R112 adds pesticide and veterinary residue decisions to both testing plan exports for all 533 products. R111 assembles product testing rows and outstanding source decisions for all 533 catalogue identities. R110 adds measured composition checks for seven declared cocoa and gum variants across three catalogue entries. Selected earlier focused reviews cover 67 identities; R69 adds source-wording and scope checks for the remaining 70. All 137 original queue products have a linked review. R96 identifies at least one named finished-article limit under CTR 2.2.1 for '+cropArticleReview.priorityNamed+' of them. R97 establishes all 11 metal outcomes for '+metalPanelReview.priorityOutcomes+' original priority products. R98 identifies a current veterinary-residue provision for the marketed article of '+veterinaryReview.directProducts+' catalogue products. R99 links pesticide sources and processing decisions to all 533 worksheets, with named sample choices for '+pesticideReview.mappedProducts+' marketed articles. R100 adds documented spice-order decisions and multi-result pesticide reports. R101 adds EO and 2-CE laboratory reports, censored sums and treatment evidence for identified spices. R102 links ingredient emphasis and the six percentage provisos to artwork and ingoing recipe checks in all 533 worksheets. R103 consolidates missing recipe details from saved artwork checks into one R&D request. R104 compares transcribed ingredient order with the approved recipe and supplier composition. R105 checks small-pack artwork against the retail outer, visible surface area and declaration-specific barcode rules. R106 compares the batch prefix, SKU site master, production record and licence shown on each artwork source. R107 checks product-specific expiry exemptions, short shelf lives and the location of dates on the reviewed artwork. R108 checks printed lot dates against the calendar, the declared shelf-life band and each other at their stated precision. R109 compares lot markings with the shelf life and counting convention in the SKU coding instruction. Wider contaminant review continues. This is not complete regulatory verification of the 533 products.',
 sourceVerificationRequiresLotReport:false,
 softwareVerification:'Automated data, browser and audit results are documented in verification-2026-11-14.md. These software checks are separate from complete current-law verification, which remains open.',
 sourceFiles:[...sourceFiles,scheduleDFile,gazetteFile,residueFile,toxinFile,fibreFile,waterFile,waterStandardFile,asafoetidaFile,camphorFile,lajadiFile,ingredientBaselineFile,juniperFile,hinguFile,flowerFile,flowerSupplyFile,rhizomeFile,pasteFile,sauceFile,namedSauceFile,concentrateFile,tomatoJuiceFile,cannedTomatoFile,thermalPacksFile,cocktailFile,vegetableMealsFile],records,
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
