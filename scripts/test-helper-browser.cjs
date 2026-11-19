'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const {writeHelperDownload}=require('./build-helper-download.cjs');
const root=path.resolve(__dirname,'..');
const artifacts=process.env.PMSV_BROWSER_ARTIFACTS||path.join(root,'test-artifacts','helper-20261114');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.md':'text/plain','.css':'text/css'};
const server=http.createServer((req,res)=>{
 try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 }catch(error){res.writeHead(404).end('Not found');}
});
async function testHingu(page, register, base, artifacts) {
 const review = register.hinguReview;
 const coverage = review.coverage;
 assert.deepEqual([coverage.withCandidate, coverage.withoutCandidate, coverage.candidateLinks], [34, 12, 102]);
 assert.equal(register.juniperSpiceReview.coverage.withCandidate, 33);
 await page.getByRole('button', {name:'Review progress', exact:true}).click();
 const overview = page.locator('#ayurvedaIngredientCoverage');
 assert.match(await overview.textContent(), /35 of 46/);
 await overview.locator('summary').click();
 assert.equal(await overview.locator('li').count(), 11);
 assert(!/Hingu|Hribera|Jati/.test(await overview.locator('ul').textContent()));
 await page.locator('#openHinguRecipe').click();
 assert.equal(await page.locator('.water-product-note').count(), 1);
 const grade = page.locator('#asafoetidaGrade');
 const evidence = page.locator('#hinguEvidence');
 const checkbox = evidence.getByRole('checkbox');
 const raw = evidence.locator('.hingu-raw-entry');
 assert.equal(await grade.inputValue(), '');
 assert.equal(await evidence.locator('.hingu-methods').count(), 0);

 for (const id of ['hing','hingra','compounded']) {
  await grade.selectOption(id);
  assert.equal(await raw.count(), 0);
  assert.equal(await evidence.locator('[data-hingu-method]').count(), 6);
  await evidence.locator('.hingu-methods summary').click();
  const extract = await evidence.locator('[data-hingu-method="alcoholic-extract"]').innerText();
  assert.match(extract, /100 − \(residue % \+ moisture %\)/);
  assert(extract.includes('nominal test portion is ' + (id === 'compounded' ? 10 : 2) + ' g'));
  const starch = evidence.locator('[data-hingu-method="starch"]');
  assert.equal(await starch.locator('a').getAttribute('href'), review.sources.is7807.url + '#page=12');
  assert.equal(await checkbox.count(), id === 'compounded' ? 0 : 1);
  if (id === 'compounded') {
   assert.match(await starch.innerText(), /no numeric starch maximum/);
   assert.equal(await page.locator('.asafoetida-reference-table tbody tr').count(), 3);
   continue;
  }
  assert.equal(await checkbox.isChecked(), false);
  await checkbox.check();
  assert.equal(await raw.count(), 4);
  for (const [i, row] of review.rawRows.entries()) {
   assert((await raw.nth(i).innerText()).includes(row.maximum + ' ' + row.unit));
   assert.equal(await raw.nth(i).locator('a').getAttribute('href'), review.sources.gazette.url + '#page=' + row.pdfPage);
  }
  assert.equal(await evidence.locator('.hingu-methods').evaluate(el => el.open), true);
  await checkbox.uncheck();
  assert.equal(await raw.count(), 0);
  await checkbox.check();
 }
 await grade.selectOption('hing');
 await checkbox.check();
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width, height:900});
  if (width === 1440) await evidence.locator('.hingu-methods summary').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Hingu layout at ' + width);
  if (width !== 320) await evidence.screenshot({path:path.join(artifacts,'hingu-reference-' + width + '.png'),
    style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id), review.productId);
 assert.equal(await grade.inputValue(), '');
 assert.equal(await checkbox.count(), 0);
 await grade.selectOption('hingra');
 assert.equal(await checkbox.isChecked(), false);
 await checkbox.check();
 assert.equal(await raw.count(), 4);
 await grade.selectOption('');
 assert.equal(await evidence.textContent(), '');
 await page.evaluate(() => PMSV_HELPER_TEST.selectProduct('purified-vending-water'));
 assert.equal(await evidence.count(), 0);
 const report = await page.request.get(base + review.report);
 assert.equal(report.status(), 200);
 assert.match(await report.text(), /34 of 46/);
}

async function testRecipeFlowers(page, register, base, artifacts) {
 const review = register.recipeFlowerReview;
 const [named, aromatic] = review.recipes;
 const progress = page.getByRole('button', {name:'Review progress', exact:true});
 const panel = page.locator('.recipe-flower-note');
 const choice = panel.getByLabel('Recipe flower', {exact:true});
 const confirmed = panel.getByRole('checkbox');
 const metals = panel.locator('[data-flower-metal]');
 assert.deepEqual([review.coverage.withCandidate, review.coverage.candidateLinks], [35,104]);
 await progress.click();
 await page.locator('#openNamedFlowers').click();
 assert.equal(await panel.getAttribute('data-flower-product'), named.productId);
 assert.equal(await choice.inputValue(), '');
 assert.equal(await choice.locator('option').count(), 5);
 assert.equal(await metals.count(), 0);
 for (const flower of named.flowers) {
  await choice.selectOption(flower.key);
  const detail = panel.locator('#flowerDetail');
  assert((await detail.innerText()).includes(flower.species));
  assert((await detail.innerText()).includes(flower.stage));
  assert.equal(await metals.count(), 0);
  for (const [source, pdfPage, label] of flower.references) {
   assert.equal(await detail.getByRole('link', {name:label + ' ↗', exact:true}).getAttribute('href'),
    review.sources[source].url + (pdfPage ? '#page=' + pdfPage : ''));
  }
  assert.equal(await confirmed.count(), flower.key === 'jati' ? 1 : 0);
  if (flower.key === 'ketaki') {
   await detail.locator('summary').click();
   assert.match(await detail.innerText(), /0\.5% for Kewda\/Kewra/);
   assert.equal(await detail.getByRole('link', {name:'FSSAI Schedule C ↗'}).getAttribute('href'), review.sources.ayurveda.url + '#page=22');
  }
  if (flower.key === 'jati') {
   assert.equal(await confirmed.isChecked(), false);
   await confirmed.check();
   assert.equal(await metals.count(), 2);
   for (const [i, row] of review.rawRows.entries()) {
    const item = metals.nth(i);
    assert.equal(await item.getAttribute('data-flower-metal'), row.name);
    assert((await item.innerText()).includes(row.maximum + ' ' + row.unit));
    assert.equal(await item.locator('a').getAttribute('href'), review.sources.gazette.url + '#page=' + row.pdfPage);
   }
   assert.match(await metals.nth(0).innerText(), /on a dry-matter basis/);
   assert.match(await metals.nth(1).innerText(), /neither an arsenic species nor a dry-matter basis/);
   await confirmed.uncheck();
   assert.equal(await metals.count(), 0);
   await confirmed.check();
  }
 }
 await choice.selectOption('jati');
 assert.equal(await confirmed.isChecked(), false);
 await confirmed.check();
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width, height:900});
  assert(await panel.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
  if (width !== 320) await panel.screenshot({path:path.join(artifacts,'flower-reference-' + width + '.png'),animations:'disabled',
   style:'header, .navtabs { visibility: hidden !important; }'});
 }
 async function downloadBrief() {
  const next = page.waitForEvent('download');
  await page.locator('#briefBtn').click();
  return fs.readFileSync(await (await next).path(), 'utf8');
 }
 const documentRef = panel.getByLabel('Supplier document or lot reference (optional)');
 await documentRef.fill('TEST-NAMED-9');
 const brief = await downloadBrief();
 assert(brief.includes('Current review register dated ' + register.latestSourceReviewDate));
 assert(brief.includes(named.sourceReviewResult) && brief.includes(base + register.records.find(row => row.id === named.productId).reports[0].file));
 assert(brief.includes('Supplier document or lot reference · TEST-NAMED-9'));
 assert(brief.includes('Lead · 10 mg/kg on a dry-matter basis.') && brief.includes('Arsenic · 5 mg/kg.'));
 assert(brief.includes(review.sources.gazette.url + '#page=24'));
 await progress.click();
 await page.locator('#openAromaticFlower').click();
 assert.equal(await panel.getAttribute('data-flower-product'), aromatic.productId);
 assert.equal(await choice.count(), 0);
 assert.equal(await confirmed.count(), 0);
 assert.equal(await metals.count(), 0);
 assert.match(await panel.innerText(), /Ketaki \(Pandanus tectorius\) and Jati \(Jasminum officinale\)/);
 assert.equal(await page.locator('.water-product-note').count(), 1);
 const supplied = panel.getByLabel('Flower identified by the supplier');
 const form = panel.getByLabel('Form recorded by the supplier');
 assert.equal(await supplied.inputValue(), '');
 assert.equal(await form.count(), 0);
 const unknownBrief = await downloadBrief();
 assert(unknownBrief.includes(aromatic.sourceReviewResult) && !unknownBrief.includes(named.sourceReviewResult));
 assert(unknownBrief.includes('Supplier identity and form have not been recorded.') && !unknownBrief.includes('TEST-NAMED-9'));
 for (const identity of ['ketaki','other','mixed','unknown','jati']) {
  await supplied.selectOption(identity);
  assert.equal(await form.inputValue(), '');
  assert.equal(await documentRef.inputValue(), '');
  assert.equal(await metals.count(), 0);
  const otherName = panel.getByLabel('Botanical name on the supplier record');
  assert.equal(await otherName.count(), identity === 'other' ? 1 : 0);
  if (identity === 'other') await otherName.fill('Jasminum sambac');
  for (const value of ['fresh','oil-extract','other','unknown','naturally-dried-culinary']) {
   await form.selectOption(value);
   const eligible = identity === 'jati' && value === 'naturally-dried-culinary';
   assert.equal(await metals.count(), eligible ? 2 : 0);
  }
  await documentRef.fill('TEST-SUPPLY-' + identity);
  const actual = await downloadBrief();
  assert(actual.includes('Supplier document or lot reference · TEST-SUPPLY-' + identity));
  assert.equal(actual.includes('Supplier botanical name · Jasminum sambac'), identity === 'other');
  assert.equal(actual.includes('Lead · 10 mg/kg on a dry-matter basis.'), identity === 'jati');
  assert.equal(actual.includes('Arsenic · 5 mg/kg.'), identity === 'jati');
  if (identity === 'jati') {
   assert(actual.includes('The infusion and finished milk require separate assessment.'));
   for (const width of [320,390,1440]) {
    await page.setViewportSize({width,height:900});
    assert(await panel.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
    if (width === 390) await panel.screenshot({path:path.join(artifacts,'flower-supply-390.png'),animations:'disabled',
     style:'header, .navtabs { visibility: hidden !important; }'});
   }
   await form.selectOption('fresh');
   assert.equal(await metals.count(), 0);
   assert(!(await downloadBrief()).includes('Lead · 10 mg/kg'));
   await form.selectOption('naturally-dried-culinary');
  }
 }
 await supplied.selectOption('mixed');
 assert.equal(await form.inputValue(), '');
 assert.equal(await documentRef.inputValue(), '');
 assert.equal(await metals.count(), 0);
 await supplied.selectOption('');
 assert.equal(await form.count(), 0);
 await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id), named.productId);
 assert.equal(await choice.inputValue(), '');
 await choice.selectOption('jati');
 assert.equal(await confirmed.isChecked(), false);
 assert.equal(await documentRef.inputValue(), '');
 assert.equal(await metals.count(), 0);
 await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id), aromatic.productId);
 assert.equal(await supplied.inputValue(), '');
 await page.evaluate(() => PMSV_HELPER_TEST.selectProduct('purified-vending-water'));
 assert.equal(await panel.count(), 0);
 assert(!(await downloadBrief()).includes('Flower evidence for recipe'));
 await progress.click();
 const entire = page.waitForEvent('download');
 await page.locator('#exportReviewJSON').click();
 const exported = JSON.parse(fs.readFileSync(await (await entire).path(), 'utf8'));
 assert.deepEqual(exported.ayurvedaIngredientCoverage, register.ayurvedaIngredientCoverage);
 assert.deepEqual(exported.flowerSupplyReview, register.flowerSupplyReview);
 assert(!JSON.stringify(exported).includes('TEST-SUPPLY'));
 const supplyReport = await page.request.get(base + register.flowerSupplyReview.report);
 assert.equal(supplyReport.status(), 200);
 assert((await supplyReport.text()).includes('35 of 46'));
 const report = await page.request.get(base + review.report);
 assert.equal(report.status(), 200);
 assert((await report.text()).includes('35 of 46'));
}

async function testRhizomeSpices(page, register, base, artifacts) {
 const review = register.rhizomeSpiceReview;
 const [ginger,turmeric] = review.spices;
 const [khichdi,milk] = review.recipes;
 const panel = key => page.locator('.rhizome-spice[data-spice="' + key + '"]');
 const form = key => panel(key).getByLabel('Form of ' + key + ' supplied');
 const ref = key => panel(key).locator('input');
 async function brief() {
  const wait = page.waitForEvent('download');
  await page.getByRole('button',{name:'Export product review brief'}).click();
  return fs.readFileSync(await (await wait).path(),'utf8');
 }
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 assert.match(await page.locator('#ayurvedaIngredientCoverage').textContent(),/112 ingredient-to-article references/);
 await page.getByRole('button',{name:'Open ginger and turmeric in recipe 13.1'}).click();
 assert.equal(await page.locator('.rhizome-spice').count(),2);
 for (const spice of review.spices) {
  const key = spice.key;
  assert.equal(await form(key).inputValue(),'');
  assert.equal(await panel(key).locator('.rhizome-reference').count(),0);
  assert.equal(await ref(key).isVisible(),false);
  for (const value of ['whole','fresh','paste','other','unknown','powder']) {
   await form(key).selectOption(value);
   const eligible = value === 'whole' || value === 'powder';
   const rows = panel(key).locator('.rhizome-reference');
   assert.equal(await rows.count(),eligible ? spice.rawRows.length : 0);
   assert.equal(await ref(key).inputValue(),'');
   if (!eligible) continue;
   for (const [i,row] of spice.rawRows.entries()) {
    const shown = rows.nth(i);
    assert.equal(await shown.locator('th').textContent(),row.name);
    assert((await shown.innerText()).includes(row.maximum + ' ' + row.unit));
    assert.equal(await shown.locator('a').first().getAttribute('href'),review.sources.gazette + '#page=' + row.pdfPage);
    assert.equal(await shown.locator('a').last().getAttribute('href'),review.sources.compendium + '#page=' + spice.compendiumPages[i]);
   }
   assert.equal((await panel(key).innerText()).includes('Lead chromate test · Negative'), key === 'turmeric');
   await ref(key).fill('LOT-' + key);
  }
 }
 const both = await brief();
 assert(both.includes('LOT-ginger') && both.includes('LOT-turmeric'));
 assert(both.includes('Arsenic · 5 mg/kg') && both.includes('Arsenic · 0.1 mg/kg'));
 assert(both.includes('Lead · 10 mg/kg on a dry-matter basis') && both.includes('Lead · 10 mg/kg ·'));
 assert(both.includes('Separate lead chromate test · Negative'));
 assert(both.includes(base + review.report));
 await form('ginger').selectOption('paste');
 assert.equal(await ref('ginger').inputValue(),'');
 assert.equal(await ref('turmeric').inputValue(),'LOT-turmeric');
 const changed = await brief();
 assert(!changed.includes('LOT-ginger') && !changed.includes('Arsenic · 5 mg/kg'));
 assert(changed.includes('Arsenic · 0.1 mg/kg') && changed.includes('LOT-turmeric'));
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width,height:900});
  assert(await panel('turmeric').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
  if (width === 390) await panel('turmeric').screenshot({path:path.join(artifacts,'turmeric-390.png'),animations:'disabled',
   style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id),milk.productId);
 assert.equal(await panel('turmeric').count(),0);
 assert.equal(await form('ginger').inputValue(),'');
 assert.equal(await page.locator('.recipe-flower-note').count(),1);
 await form('ginger').selectOption('whole');
 await ref('ginger').fill('MILK-INPUT');
 assert((await brief()).includes('MILK-INPUT'));
 for (const spice of [turmeric,ginger]) {
  await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id),spice.productId);
  assert.equal(await page.locator('.rhizome-spice').count(),1);
  assert.equal(await form(spice.key).inputValue(),'');
  await form(spice.key).selectOption('powder');
  const individual = await brief();
  assert(individual.includes('Current focused reviews: R83') && individual.includes(base + review.report));
  assert(!individual.includes('MILK-INPUT'));
 }
 await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id),khichdi.productId);
 assert.equal(await form('turmeric').inputValue(),'');
 assert.equal(await ref('ginger').inputValue(),'');
 for (const id of ['ginger-cocktail','04-04-2-ginger-paste']) {
  await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id),id);
  assert.equal(await page.locator('.rhizome-spice').count(),0);
  assert(!(await brief()).includes('Candidate references for the supplied raw material'));
 }
 const report = await page.request.get(base + review.report);
 assert.equal(report.status(),200);
 assert((await report.text()).includes('112 ingredient-to-article links'));
}

async function testPortableHelper(browser, register) {
 const filename = path.join(artifacts, 'PMSV-FSSAI-Product-Helper-R' + register.latestRound + '.html');
 const sourceBase = writeHelperDownload(filename);
 const context = await browser.newContext({acceptDownloads:true, offline:true, viewport:{width:390,height:844}});
 try {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(filename).href);
  assert.equal(await page.title(), 'PMSV FSSAI Helper | Product Standards & Evidence');
  assert.equal(await page.evaluate(() => PMSV_HELPER_TEST.getCatalogue().length), 533);
  assert.equal(await page.locator('script[src]').count(), 0);
  await page.getByRole('button', {name:'Review progress',exact:true}).click();
  await page.locator('#openAromaticFlower').click();
  assert.equal(new URL(page.url()).hash, '#finder');
  await page.getByLabel('Flower identified by the supplier').selectOption('jati');
  await page.getByLabel('Form recorded by the supplier').selectOption('naturally-dried-culinary');
  await page.getByLabel('Supplier document or lot reference (optional)').fill('OFFLINE-REFERENCE');
  assert.equal(await page.locator('[data-flower-metal]').count(), 2);
  const download = page.waitForEvent('download');
  await page.locator('#briefBtn').click();
  const text = fs.readFileSync(await (await download).path(), 'utf8');
  assert(text.includes('OFFLINE-REFERENCE'));
  assert(text.includes('Lead · 10 mg/kg on a dry-matter basis.'));
  assert(text.includes('Arsenic · 5 mg/kg.'));
  assert(text.includes(sourceBase + register.flowerSupplyReview.report));
  const reportLink = page.getByRole('link', {name:'R82 source review ↗',exact:true});
  assert.equal(await reportLink.evaluate(link => link.href), sourceBase + register.flowerSupplyReview.report);
  await page.getByRole('button',{name:'Review progress',exact:true}).click();
  await page.getByRole('button',{name:'Open ginger and turmeric in recipe 13.1'}).click();
  await page.getByLabel('Form of turmeric supplied').selectOption('whole');
  await page.getByLabel('Supplier document or lot reference for turmeric (optional)').fill('OFFLINE-HALDI');
  await page.getByLabel('Form of ginger supplied').selectOption('fresh');
  const spiceDownload = page.waitForEvent('download');
  await page.locator('#briefBtn').click();
  const spiceText = fs.readFileSync(await (await spiceDownload).path(),'utf8');
  assert(spiceText.includes('OFFLINE-HALDI') && spiceText.includes('Arsenic · 0.1 mg/kg'));
  assert(!spiceText.includes('Arsenic · 5 mg/kg') && !spiceText.includes('OFFLINE-REFERENCE'));
  assert(spiceText.includes(sourceBase + register.rhizomeSpiceReview.report));
  assert.deepEqual(errors, []);
 } finally {
  await context.close();
 }
}

async function testJuniperSpice(page, review, base, artifacts) {
 const scope = page.locator('.juniper-scope');
 const rawRows = scope.locator('.juniper-raw-entry');
 assert.equal(await scope.count(), 0);
 await page.locator('#lajadiIngredient').selectOption('hribera');
 assert.equal(await scope.count(), 0);
 await page.locator('#lajadiMaterial').selectOption('named');
 assert.equal(await page.locator('#juniperSupply').inputValue(), '');
 assert.equal(await rawRows.count(), 0);
 for (const supply of ['industrial', 'unknown', 'culinary']) {
  await page.locator('#juniperSupply').selectOption(supply);
  assert.equal(await rawRows.count(), supply === 'culinary' ? 4 : 0);
 }
 assert.deepEqual(await rawRows.locator('th').allTextContents(), review.rawRows.map(row => row.name));
 for (const [i, row] of review.rawRows.entries()) {
  assert.match(await rawRows.nth(i).innerText(), new RegExp(row.maximum + ' ' + row.unit));
  assert.equal(await rawRows.nth(i).locator('a').getAttribute('href'), review.sources.gazette.url + '#page=' + row.pdfPage);
 }
 assert.equal(await page.locator('.lajadi-reference-entry').count(), 5);
 assert(!/volatile oil/i.test(await page.locator('#lajadiReference').textContent()));
 await scope.locator('#juniperQuality summary').click();
 const values = scope.locator('#juniperStyleResult');
 assert.equal(await values.locator('table').count(), 0);
 for (const style of review.styleOptions) {
  await scope.locator('#juniperStyle').selectOption(style.id);
  const cell = label => values.locator('tr').filter({has: page.getByRole('rowheader', {name: label, exact: true})}).getByRole('cell');
  assert.equal(await cell('Moisture').innerText(), 'Maximum ' + style.moistureMax + ' % w/w');
  assert.equal(await cell('Volatile oil').innerText(), 'Minimum 0.5 mL/100 g · dry basis');
  assert.equal(await cell('Live insects').innerText(), 'Maximum 0 count/100 g');
  if (style.physicalStyle === 'cut') assert.equal(await cell('Other factors').innerText(), 'Blank in the source table');
  if (style.physicalStyle === 'ground') assert.equal(await values.getByRole('cell', {name:'N/A · no evaluated value', exact:true}).count(), 7);
 }
 for (const width of [320, 390, 1440]) {
  await page.setViewportSize({width, height:900});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Juniper layout at ' + width);
  if (width !== 320) await scope.screenshot({path:path.join(artifacts, 'juniper-spice-' + width + '.png'),
   style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await scope.locator('#juniperStyle').selectOption('');
 assert.equal(await values.locator('table').count(), 0);
 await scope.locator('#juniperStyle').selectOption('wholeNatural');
 await scope.locator('#juniperSupply').selectOption('unknown');
 assert.equal(await scope.locator('#juniperStyle').count(), 0);
 await scope.locator('#juniperSupply').selectOption('culinary');
 assert.equal(await scope.locator('#juniperStyle').inputValue(), '');
 await page.locator('#lajadiMaterial').selectOption('extract');
 assert.equal(await scope.count(), 0);
 await page.locator('#lajadiMaterial').selectOption('named');
 assert.equal(await scope.locator('#juniperSupply').inputValue(), '');
 await page.locator('#lajadiIngredient').selectOption('chandana');
 await page.locator('#lajadiMaterial').selectOption('named');
 assert.equal(await scope.count(), 0);
 await page.locator('#lajadiIngredient').selectOption('hribera');
 await page.locator('#lajadiMaterial').selectOption('named');
 await scope.locator('#juniperSupply').selectOption('culinary');
 await page.evaluate(() => PMSV_HELPER_TEST.selectProduct('purified-vending-water'));
 assert.equal(await scope.count(), 0);
 await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id), review.recipeProductId);
 assert.equal(await page.locator('#lajadiIngredient').inputValue(), '');
 assert.equal(await scope.count(), 0);
 const report = await page.request.get(base + review.report);
 assert.equal(report.status(), 200);
 assert.match(await report.text(), /33 of 46/);
}

let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/fssai-helper/';
 const launch={headless:true,args:['--no-sandbox']};
 if(process.env.PMSV_BROWSER_EXECUTABLE)launch.executablePath=process.env.PMSV_BROWSER_EXECUTABLE;
 browser=await chromium.launch(launch);fs.mkdirSync(artifacts,{recursive:true});
 const page=await browser.newPage({acceptDownloads:true});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'});
 assert.equal(await page.evaluate(()=>PMSV_HELPER_TEST.getCatalogue().length),533);
 assert.equal(await page.locator('#focusedTotal').textContent(),'137');
 assert.equal(await page.locator('#remainingFocusedTotal').textContent(),'0');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 assert.equal(await page.locator('#reviewResults article').count(),137);
 await page.locator('#reviewFilter').selectOption('remaining');
 assert.equal(await page.locator('#reviewResults article').count(),0);
 const download=page.waitForEvent('download');await page.locator('#exportReviewJSON').click();
 const file=await download;const data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));
 assert.equal(data.records.length,137,'Export must retain all records while display is filtered.');
 assert.equal(data.legalProductApprovals,0);assert.equal(data.sourceVerificationRequiresLotReport,false);
 await page.locator('#reviewFilter').selectOption('focused');assert.equal(await page.locator('#reviewResults article').count(),137);
 await page.locator('#reviewSearch').fill('2.3.13');assert.equal(await page.locator('#reviewResults article').count(),1);
 await page.locator('[data-review-product]').click();
 assert.equal(await page.locator('#finder').isVisible(),true);
 assert.match(await page.locator('#productDetail').textContent(),/R68/);
 assert.match(await page.locator('#productDetail').textContent(),/Exact CTR article decision: OPEN/);
 await page.evaluate(()=>PMSV_HELPER_TEST.selectProduct('102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk'));
 assert.match(await page.locator('#productDetail').textContent(),/R69/);
 assert.match(await page.locator('#productDetail').textContent(),/discrepancy is confirmed visually, not resolved/);
 assert.match(await page.locator('#currencyWatch').textContent(),/2028-07-01/);
 assert.match(await page.locator('#gazetteReviewSummary').textContent(),/382 metal entries and 27 crop-contaminant entries/);
 assert.equal(data.originalGazetteReview.futureChanges.length,9,'Full export must include all future source changes.');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#gazetteReviewSummary summary').click();
 assert.equal(await page.locator('#gazetteReviewSummary li').count(),9);
 assert.match(await page.locator('#gazetteReviewSummary').textContent(),/not been activated/);
 const sourceReport=await page.request.get(base+data.originalGazetteReview.report);
 assert.equal(sourceReport.status(),200);
 assert.match(await sourceReport.text(),/382 metal-table entries and 27 crop-contaminant entries/);
 assert.match(await page.locator('#residueReviewSummary').textContent(),/1,098 pesticide entries and 358 veterinary entries/);
 assert.equal(data.residueGazetteReview.findings.length,8,'Export must retain residue-source findings.');
 await page.locator('#residueReviewSummary summary').click();
 assert.equal(await page.locator('#residueReviewSummary li').count(),8);
 const residueReport=await page.request.get(base+data.residueGazetteReview.report);
 assert.equal(residueReport.status(),200);
 assert.match(await residueReport.text(),/137 product-specific CTR decisions remain open/);
 assert.match(await page.locator('#toxinReviewSummary').textContent(),/37 toxin-limit or sampling-plan rows and 119 histamine species entries/);
 assert.equal(data.toxinGazetteReview.findings.length,6);
 assert.equal(data.toxinGazetteReview.histaminePlans,11);
 assert.equal(data.toxinGazetteReview.seafoodNoteIds.length,24);
 await page.locator('#toxinReviewSummary summary').click();
 assert.equal(await page.locator('#toxinReviewSummary li').count(),6);
 const toxinReport=await page.request.get(base+data.toxinGazetteReview.report);
 assert.equal(toxinReport.status(),200);
 assert.match(await toxinReport.text(),/All 137 product-specific CTR decisions remain open/);
 for(const id of data.toxinGazetteReview.seafoodNoteIds){
  await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),id);
  assert.equal(await page.locator('#productDetail .toxin-product-note').count(),1);
  assert.match(await page.locator('#productDetail .toxin-product-note').textContent(),/listed fish species/);
 }
 const fibreId=data.fibreClaimsReview.productId;
 assert.equal(data.fibreClaimsReview.thresholdRows.length,6);
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openFibreReference').click();
 assert.match(await page.locator('.fibre-product-note').textContent(),/FPSFA 2\.11\.8 itself/);
 assert.equal(await page.locator('.fibre-product-note tbody tr').count(),3);
 await page.locator('.fibre-product-note summary').click();
 const form=page.locator('#fibreReferenceForm');
 await form.getByRole('button').click();
 assert.match(await form.getByRole('status').textContent(),/Select a basis/);
 await page.locator('#fibreBasis').selectOption('g_per_100g_solids');
 await page.locator('#fibreClaim').selectOption('high');
 await page.locator('#fibreAmount').fill('4');await form.getByRole('button').click();
 assert.match(await form.getByRole('status').textContent(),/Below the selected numerical minimum \(6 g\)/);
 await page.locator('#fibreAmount').fill('6');
 assert.match(await form.getByRole('status').textContent(),/Values changed/);
 await form.getByRole('button').click();assert.match(await form.getByRole('status').textContent(),/Meets the selected numerical minimum/);
 assert.match(await form.getByRole('status').textContent(),/no label approval/);
 await page.locator('#fibreBasis').selectOption('g_per_100ml_liquids');
 assert.match(await form.getByRole('status').textContent(),/Values changed/);
 await page.locator('#fibreAmount').fill('3');await form.getByRole('button').click();
 assert.match(await form.getByRole('status').textContent(),/minimum \(3 g\)/);
 await page.locator('#fibreAmount').fill('-1');await form.getByRole('button').click();assert.match(await form.getByRole('status').textContent(),/non-negative/);
 await page.locator('#fibreAmount').fill('');await form.getByRole('button').click();assert.match(await form.getByRole('status').textContent(),/Select a basis/);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Fibre reference overflows at '+width);
  if(width!==320)await page.locator('.fibre-product-note').screenshot({path:path.join(artifacts,'fibre-reference-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 const fibreReport=await page.request.get(base+data.fibreClaimsReview.report);assert.equal(fibreReport.status(),200);
 assert.match(await fibreReport.text(),/All 137 product-specific CTR decisions remain open/);
 const water=data.waterSourceReview;
 assert.equal(water.records.length,5);assert.equal(water.draftReplacement.autoApply,false);
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openVendingWater').click();
 assert.match(await page.locator('.water-product-note').textContent(),/draft text/);
 assert.equal(await page.locator('#waterEvidenceForm').count(),0);
 for(const note of water.records.filter(x=>x.use==='ingredient')){
  await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),note.id);
  assert.equal(await page.locator('.water-product-note').count(),1);
  assert.match(await page.locator('.water-product-note').textContent(),new RegExp('Recipe '+note.recipeNumber.replace('.','\\.')));
  if(note.recipeTitleMethodHold)assert.match(await page.locator('.water-product-note').textContent(),/discrepancy remains open/);
 }
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openIngredientWater').click();
 await page.locator('.water-product-note details:has(#waterEvidenceForm) > summary').click();
 const waterForm=page.locator('#waterEvidenceForm');
 await waterForm.getByRole('button').click();assert.match(await waterForm.getByRole('status').textContent(),/Identify the supplier/);
 await page.locator('#waterSupplier').selectOption('municipal');await waterForm.getByRole('button').click();
 assert.match(await waterForm.getByRole('status').textContent(),/commercial-use water bills/);
 await page.locator('#waterSupplier').selectOption('private');
 assert.match(await waterForm.getByRole('status').textContent(),/Supply changed/);
 await waterForm.getByRole('button').click();assert.match(await waterForm.getByRole('status').textContent(),/no more than one year old/);
 assert.match(await waterForm.getByRole('status').textContent(),/financial year.*six months/);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Water reference overflows at '+width);
  if(width!==320)await page.locator('.water-product-note').screenshot({path:path.join(artifacts,'water-evidence-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.locator('#waterSupplier').selectOption('mixed');await waterForm.getByRole('button').click();
 assert.match(await waterForm.getByRole('status').textContent(),/no documentation concession is inferred/);
 await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),fibreId);
 assert.equal(await page.locator('.water-product-note').count(),0,'Water aid must not leak to unrelated products');
 await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),water.records[1].id);
 assert.equal(await page.locator('#waterSupplier').inputValue(),'','Prior supplier must not carry into a reopened product');
 const waterReport=await page.request.get(base+water.report);assert.equal(waterReport.status(),200);
 assert.match(await waterReport.text(),/All 137 product-specific CTR decisions remain open/);
 assert.equal(data.waterStandardReview.rows.length,74,'Full filtered export retains all water-standard entries');
 await page.locator('.water-standard-reference > summary').click();
 assert.equal(await page.locator('#waterReferenceRows .water-reference-entry').count(),74);
 await page.locator('#waterReferenceGroup').selectOption('5');
 assert.equal(await page.locator('#waterReferenceRows .water-reference-entry').count(),18);
 assert.match(await page.locator('#waterReferenceRows').textContent(),/µg\/L/);
 await page.locator('#waterReferenceSearch').fill('uranium');
 assert.match(await page.locator('#waterReferenceCount').textContent(),/0 of 74/);
 assert.match(await page.locator('#waterReferenceRows').textContent(),/No source entries match/);
 await page.locator('#waterReferenceGroup').selectOption('all');
 assert.equal(await page.locator('#waterReferenceRows .water-reference-entry').count(),1);
 assert.match(await page.locator('#waterReferenceRows').textContent(),/0\.03/);
 assert.match(await page.locator('#waterReferenceRows').textContent(),/No relaxation/);
 assert.equal(await page.locator('#waterReferenceRows a').count(),3);
 await page.locator('#waterReferenceRows details summary').click();
 assert.equal(await page.locator('#waterReferenceRows details').getAttribute('open'),'','Source details must stay open after leaving the search input');
 assert.equal(await page.locator('#waterReferenceRows a').first().isVisible(),true);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Water source reference overflows at '+width);
  if(width!==320)await page.locator('.water-standard-reference').screenshot({path:path.join(artifacts,'water-standard-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.locator('#waterReferenceSearch').fill('');
 await page.locator('#waterReferenceGroup').selectOption('6');
 assert.equal(await page.locator('#waterReferenceRows .water-reference-entry').count(),5);
 assert.match(await page.locator('#waterReferenceRows').textContent(),/100 mL/);
 await page.locator('#waterReferenceGroup').selectOption('clauses');
 assert.equal(await page.locator('#waterReferenceRows .water-reference-entry').count(),3);
 assert.match(await page.locator('#waterReferenceRows').textContent(),/10 L/);
 const waterStandardReport=await page.request.get(base+data.waterStandardReview.report);assert.equal(waterStandardReport.status(),200);
 assert.match(await waterStandardReport.text(),/All 137 product-specific CTR decisions remain open/);

 const asafoetida=data.asafoetidaReview;
 assert.equal(asafoetida.rows.length,11,'Filtered full export retains all purity rows');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openAsafoetida').click();
 assert.equal(await page.locator('#asafoetidaGrade').inputValue(),'');
 assert.equal(await page.locator('.asafoetida-reference-table').count(),0);
 for(const [grade,count,extract] of [['hing',4,'Minimum 12%'],['hingra',4,'Minimum 50%'],['compounded',3,'Minimum 5%']]){
  await page.locator('#asafoetidaGrade').selectOption(grade);
  assert.equal(await page.locator('.asafoetida-reference-table tbody tr').count(),count);
  assert.match(await page.locator('.asafoetida-reference-table').textContent(),new RegExp(extract));
  assert.match(await page.locator('#asafoetidaGradeStatus').textContent(),/no product approval/);
 }
 assert.match(await page.locator('#asafoetidaGradeReference').textContent(),/Do not copy the 1%/);
 assert(!await page.locator('.asafoetida-reference-table').textContent().then(t=>t.includes('Starch')));
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Asafoetida reference overflows at '+width);
  if(width!==320)await page.locator('.asafoetida-product-note').screenshot({path:path.join(artifacts,'asafoetida-reference-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openHinguRecipe').click();
 assert.equal(await page.locator('#asafoetidaGrade').inputValue(),'','Grade must reset on switching products');
 assert.match(await page.locator('.asafoetida-product-note').textContent(),/oleoresin gum/);
 assert.equal(await page.locator('.water-product-note').count(),1,'Khichdi retains its water evidence');
 await page.locator('#asafoetidaGrade').selectOption('hing');
 await page.locator('#asafoetidaGrade').selectOption('');
 assert.equal(await page.locator('.asafoetida-reference-table').count(),0,'Clearing grade removes old values');
 await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),fibreId);
 assert.equal(await page.locator('.asafoetida-product-note').count(),0,'Purity references must not leak to unrelated products');
 const asafoetidaReport=await page.request.get(base+asafoetida.report);assert.equal(asafoetidaReport.status(),200);
 assert.match(await asafoetidaReport.text(),/All 137 product-specific CTR decisions remain open/);
 const camphor=data.camphorReview;
 assert.equal(camphor.rows.length,5,'Full export retains all camphor entries');
 assert.equal(camphor.rows[1].minimum,null,'Export must not silently parse optical rotation');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openCamphorIngredient').click();
 assert.equal(await page.locator('#camphorMaterial').inputValue(),'');
 assert.match(await page.locator('.camphor-product-note').textContent(),/2008/);
 const camphorChoices=[['cinnamomum',/source lead, not approval/],['ocimum',/does not authorize/],['synthetic',/does not establish equivalence/],['unknown',/Obtain the actual/]];
 for(const [choice,message] of camphorChoices){await page.locator('#camphorMaterial').selectOption(choice);assert.match(await page.locator('#camphorScopeResult').textContent(),message);}
 await page.locator('#camphorMaterial').selectOption('');assert.match(await page.locator('#camphorScopeResult').textContent(),/Select a material/);
 await page.locator('.camphor-source-entries > summary').click();
 assert.equal(await page.locator('.camphor-reference-entry').count(),5);
 assert.match(await page.locator('.camphor-source-entries').textContent(),/\+41° \+43° \(as printed\)/);
 assert.equal(await page.locator('.camphor-product-note input[type=number]').count(),0);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Camphor reference overflows at '+width);
  if(width!==320)await page.locator('.camphor-product-note').screenshot({path:path.join(artifacts,'camphor-reference-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openCamphorMethodHold').click();
 assert.equal(await page.locator('#camphorMaterial').inputValue(),'');
 assert.match(await page.locator('#camphorScopeResult').textContent(),/remains on hold/);
 for(const [choice] of camphorChoices){await page.locator('#camphorMaterial').selectOption(choice);assert.match(await page.locator('#camphorScopeResult').textContent(),/remains on hold/);}
 assert.match(await page.locator('#productDetail').textContent(),/discrepancy is confirmed visually, not resolved/);
 await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),camphor.records[0].id);
 assert.equal(await page.locator('#camphorMaterial').inputValue(),'','Prior material must not carry across recipes');
 await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),asafoetida.productId);
 assert.equal(await page.locator('.camphor-product-note').count(),0,'Camphor note must not leak to unrelated products');
 const camphorReport=await page.request.get(base+camphor.report);assert.equal(camphorReport.status(),200);
 assert.match(await camphorReport.text(),/All 137 product-specific CTR decisions remain open/);
 await testHingu(page, data, base, artifacts);
 await testRecipeFlowers(page, data, base, artifacts);
 await testRhizomeSpices(page, data, base, artifacts);
 await testPortableHelper(browser, data);
 const lajadi=data.lajadiBotanicalReview;
 assert.equal(lajadi.rows.length,17,'Full filtered export retains all botanical references');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.locator('#openLajadiBotanicals').click();
 assert.equal(await page.locator('.water-product-note').count(),1,'Existing water review remains alongside botanical references');
 assert.equal(await page.locator('#lajadiIngredient').inputValue(),'');assert.equal(await page.locator('#lajadiMaterial').isDisabled(),true);
 assert.equal(await page.locator('.lajadi-reference-entry').count(),0);
 for(const [id,count] of [['hribera',5],['chandana',6],['ushira',6]]){
  await page.locator('#lajadiIngredient').selectOption(id);
  assert.equal(await page.locator('#lajadiMaterial').inputValue(),'','Changing ingredient clears prior material choice');
  assert.equal(await page.locator('#lajadiMaterial').isDisabled(),false);
  await page.locator('.lajadi-source-entries summary').click();
  assert.equal(await page.locator('.lajadi-reference-entry').count(),count);
  for(const [form,message] of [['named',/Candidate source only/],['other',/different species or plant part/],['extract',/does not authorize/],['unknown',/does not authenticate/]]){
   await page.locator('#lajadiMaterial').selectOption(form);assert.match(await page.locator('#lajadiScopeResult').textContent(),message);
   assert.equal(await page.locator('.lajadi-source-entries').evaluate(el=>el.open),true,'Material change must preserve open source table');
  }
 }
 assert.match(await page.locator('#lajadiReference').textContent(),/zizaniodes/);assert.match(await page.locator('#lajadiReference').textContent(),/zizanioides/);
 assert.match(await page.locator('#lajadiReference').textContent(),/Minimum 1% v\/w/);
 await page.locator('#lajadiMaterial').selectOption('named');
 assert.equal(await page.locator('.lajadi-product-note input[type=number]').count(),0);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Botanical reference overflow at '+width);
  if(width!==320)await page.locator('.lajadi-product-note').screenshot({path:path.join(artifacts,'lajadi-reference-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.locator('#lajadiIngredient').selectOption('');assert.equal(await page.locator('#lajadiMaterial').isDisabled(),true);
 assert.equal(await page.locator('.lajadi-reference-entry').count(),0,'Clearing ingredient removes prior references');
 await page.locator('#lajadiIngredient').selectOption('hribera');await page.locator('#lajadiMaterial').selectOption('named');
 await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),asafoetida.productId);assert.equal(await page.locator('.lajadi-product-note').count(),0);
 await page.evaluate(id=>PMSV_HELPER_TEST.selectProduct(id),lajadi.recipeProductId);assert.equal(await page.locator('#lajadiIngredient').inputValue(),'');
 assert.equal(await page.locator('#lajadiMaterial').inputValue(),'');
 const lajadiReport=await page.request.get(base+lajadi.report);assert.equal(lajadiReport.status(),200);assert.match(await lajadiReport.text(),/All 137 product-specific CTR decisions remain open/);
 const juniper = data.juniperSpiceReview;
 assert.equal(juniper.rawRows.length, 4);
 assert.equal(juniper.coverage.remainingInstances.length, 13);
 assert.deepEqual(juniper.rawRows.map(row => row.maximum), [10, 5, 30, 15]);
 await testJuniperSpice(page, juniper, base, artifacts);
 const rendered=await page.evaluate(()=>{
  let total=0;for(const row of PMSV_HELPER_TEST.getCatalogue()){
   if(!PMSV_HELPER_TEST.selectProduct(row.id))throw Error('Product did not open: '+row.id);
   if(!document.getElementById('productDetail').textContent.includes('NOT A COMPLIANCE APPROVAL'))throw Error('Missing status: '+row.id);
   total++;
  }return total;
 });assert.equal(rendered,533);
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  for(const view of ['overview','finder','verification','cases','methods','sources']){
   await page.evaluate(name=>PMSV_HELPER_TEST.setView(name),view);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,view+' overflows at '+width);
  }
  await page.evaluate(()=>PMSV_HELPER_TEST.setView('verification'));
  await page.screenshot({path:path.join(artifacts,'review-'+width+'.png'),fullPage:false});
  // Sticky page navigation can overlay the middle of a tall element-only capture.
  // Keep normal viewport screenshots above; hide navigation only for this crop.
  if(width===390||width===1440)await page.locator('#gazetteReviewSummary').screenshot({path:path.join(artifacts,'original-gazette-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
  if(width===390||width===1440)await page.locator('#residueReviewSummary').screenshot({path:path.join(artifacts,'residue-sources-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
  if(width===390||width===1440)await page.locator('#toxinReviewSummary').screenshot({path:path.join(artifacts,'toxin-sources-'+width+'.png'),style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.goto(base+'#%E0%A4%A',{waitUntil:'networkidle'});
 await page.locator('#overview').waitFor({state:'visible'});
 assert.equal(await page.locator('#overview').isVisible(),true,'Malformed hash must not break startup');
 assert.equal(await page.evaluate(()=>PMSV_HELPER_TEST.getCatalogue().length),533);
 for(const fixture of ['missing','duplicate']){
  const damaged=await browser.newPage();
  await damaged.route('**/full-catalogue-533.js*',route=>fixture==='missing'?route.abort():route.fulfill({contentType:'text/javascript',body:'window.PMSV_CATALOGUE=Array.from({length:533},()=>({id:"duplicate",product:"Duplicate"}));'}));
  await damaged.goto(base+'#finder',{waitUntil:'networkidle'});
  assert.equal(await damaged.evaluate(()=>PMSV_HELPER_TEST.getCatalogue().length),0);
  assert.equal(await damaged.locator('#downloadCatalogue').isDisabled(),true);
  assert.equal(await damaged.locator('#exportReviewJSON').isDisabled(),true);
  assert.equal(await damaged.locator('#productTotal').textContent(),'0');
  assert.match(await damaged.locator('#finder [role="alert"]').textContent(),/unavailable|duplicated/);
  await damaged.close();
 }
 assert.deepEqual(errors,[]);
 const result={passed:true,catalogueRowsRendered:533,reviewCases:137,focused:137,remaining:0,originalGazetteMetalRows:382,originalGazetteCropRows:27,futureChangesVisibleAndExported:9,sourceReportReachable:true,residuePesticideRows:1098,residueVeterinaryRows:358,residueFindingsVisibleAndExported:8,residueReportReachable:true,widths:[320,390,1440],views:6,partialCatalogueRejected:true,duplicateCatalogueRejected:true,malformedHashHandled:true,fullFilteredExport:137,pageErrors:errors,nativeAndroidTested:false};
 Object.assign(result,{fibreThresholds:6,fibreArithmeticFormTested:true,fibreSourceConflictOpen:true,toxinLimitOrPlanRows:37,histamineSpeciesEntries:119,toxinFindingsVisibleAndExported:6,seafoodProductNotes:24,toxinReportReachable:true});
 Object.assign(result,{waterStandardReferenceRows:74,waterStandardSearchAndGroupTested:true,waterAmendmentsReconciled:4,waterSourceNotes:5,recipeWaterMappings:4,waterDocumentFormTested:true,waterDraftInactive:true,waterGapsClosed:0,waterReportReachable:true});
 Object.assign(result,{asafoetidaPurityRows:11,asafoetidaGradesTested:3,asafoetidaDefaultGrade:null,hinguSubstitutionOpen:true,asafoetidaProductResetAndScopeTested:true});
 Object.assign(result,{camphorSourceEntries:5,camphorSourceYear:2008,camphorRecipeNotes:2,camphorMaterialChoicesTested:4,camphorOpticalLiteralPreserved:true,camphorRecipeHoldPreserved:true,camphorScopeResetTested:true});
 Object.assign(result,{hinguRawReferences:4,hinguGradesTested:3,hinguLabReferences:6,hinguScopeResetsVerified:true,
  ayurvedaIngredientsWithCandidate:35,ayurvedaIngredientsWithoutCandidate:11,ayurvedaCandidateLinks:data.ayurvedaIngredientCoverage.candidateLinks});
 Object.assign(result,{flowerIngredientEntries:5,flowerRecipePages:2,flowerMetalCandidates:2,flowerMaterialResets:true,flowerProductBriefs:2,flowerSupplierScenarios:25,flowerSupplyBriefExportTested:true,flowerSupplyRegisterIsolationTested:true,portableHelperOfflineBriefTested:true,rhizomeProductsTested:4,rhizomeSupplierFormsTested:6,rhizomeOfflineBriefTested:true});
 Object.assign(result,{juniperRawReferences:4,juniperSuppliedStyles:4,juniperScopeResetsVerified:true,juniperBlankNaZeroVerified:true});
 Object.assign(result,{lajadiBotanicalEntries:17,lajadiIngredientsTested:3,lajadiFormBranchesTested:12,lajadiMethodBasesPreserved:true,lajadiWaterNotePreserved:true,lajadiScopeResetTested:true,lajadiSourceSpellingsPreserved:true});
 fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
