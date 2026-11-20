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
 const ref = key => panel(key).locator('.rhizome-lot input');
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
  if (width === 390) {
   const sourceLinks = panel('turmeric').locator('.rhizome-reference a');
   const wrapped = await sourceLinks.evaluateAll(links => links.filter(link => {
    const text = document.createRange();
    text.selectNodeContents(link);
    const boxes = [...text.getClientRects()];
    const middle = (boxes[0].top + boxes[0].bottom) / 2;
    return boxes.some(box => box.top >= middle || box.bottom <= middle) || link.scrollWidth > link.clientWidth + 1;
   }).map(link => ({label:link.textContent,width:link.clientWidth,contentWidth:link.scrollWidth})));
   assert.deepEqual(wrapped, [], 'Source link text fits on one line in its mobile table cell');
   await panel('turmeric').screenshot({path:path.join(artifacts,'turmeric-390.png'),animations:'disabled',
    style:'header, .navtabs { visibility: hidden !important; }'});
  }
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

async function readProductBrief(page) {
 const downloading = page.waitForEvent('download');
 await page.getByRole('button',{name:'Export product review brief'}).click();
 return fs.readFileSync(await (await downloading).path(),'utf8');
}

async function testGingerPaste(page, register, base, artifacts) {
 const review = register.gingerPasteReview;
 const panel = page.locator('.ginger-paste-check');
 const solids = panel.getByRole('group',{name:'Total soluble solids',exact:true});
 const acidity = panel.getByRole('group',{name:'Acidity',exact:true});
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.getByRole('button',{name:'Open ginger paste product',exact:true}).click();
 assert.equal(await panel.getAttribute('data-product'),review.productId);
 assert.equal(await panel.getByText('Awaiting a result',{exact:true}).count(),2);
 await page.locator('#paste-lot').fill('GP-SUPPLIER-104');
 await solids.getByLabel('Reported result').fill('3.0');
 assert.equal(await solids.locator('.paste-outcome').innerText(),'Confirm the reporting basis');
 await solids.getByLabel('Laboratory reporting basis').selectOption('other');
 assert.match(await solids.locator('.paste-outcome').innerText(),/cannot compare/);
 await solids.getByLabel('Laboratory reporting basis').selectOption('stated');
 assert.equal(await solids.locator('.paste-outcome').innerText(),'Meets this minimum');
 await acidity.getByLabel('Laboratory reporting basis').selectOption('stated');
 await acidity.getByLabel('Reported result').fill('0.99');
 assert.equal(await acidity.locator('.paste-outcome').innerText(),'Below this minimum');
 await acidity.locator('summary').click();
 assert((await acidity.locator('details').innerText()).includes('A June 2024 draft proposes'));
 assert.equal(await acidity.getByRole('link',{name:'Draft · p. 14 ↗'}).getAttribute('href'),review.sources.proposal.url + '#page=14');
 await acidity.locator('summary').click();
 const own = await readProductBrief(page);
 assert(own.includes(review.sources.proposal.url + '#page=14'));
 assert(own.includes('Reported 3.0 · Salt-free, % (m/m) · Meets this minimum'));
 assert(own.includes('Reported 0.99 · % as acetic acid · Below this minimum'));
 assert(own.includes('GP-SUPPLIER-104') && own.includes(base + review.report));
 assert(own.includes(review.sources.gazette.url+'#page=62') && own.includes(review.sources.chapter.url+'#page=34'));
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width,height:900});
  assert(await panel.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
  assert(await panel.locator('select,input').evaluateAll(fields => fields.every(f => f.getBoundingClientRect().right <= f.closest('section').getBoundingClientRect().right + 1)));
  if (width === 390) await panel.screenshot({path:path.join(artifacts,'ginger-paste-390.png'),animations:'disabled',
   style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id),review.recipe.productId);
 assert.equal(await panel.count(),0);
 const form=page.getByLabel('Form of ginger supplied');
 const turmeric=page.getByLabel('Form of turmeric supplied');
 await turmeric.selectOption('powder');
 await form.selectOption('paste');
 assert.equal(await panel.getAttribute('data-product'),review.recipe.productId);
 assert.equal(await panel.locator('#paste-lot').count(),0);
 const supplier=page.getByLabel('Supplier document or lot reference for ginger (optional)');
 await supplier.fill('GP-KRISHARA-222');
 await acidity.getByLabel('Laboratory reporting basis').selectOption('other');
 await acidity.getByLabel('Reported result').fill('4.1');
 const recipe = await readProductBrief(page);
 assert(recipe.includes('GP-KRISHARA-222') && !recipe.includes('GP-SUPPLIER-104'));
 assert(recipe.includes('Reported 4.1 · pH or another acid basis · Different reporting basis · cannot compare'));
 assert(recipe.includes('Awaiting a result') && recipe.includes('Arsenic · 0.1 mg/kg') && !recipe.includes('Arsenic · 5 mg/kg'));
 assert(recipe.includes(review.sources.recipe.url+'#page=88'));
 for (const other of ['juice','onsite','other','fresh','unknown']) {
  await form.selectOption(other);
  assert.equal(await panel.count(),0);
  const changed = await readProductBrief(page);
  assert(!changed.includes('GP-KRISHARA-222') && !changed.includes('Ginger paste · composition'));
  assert.equal(await turmeric.inputValue(),'powder');
 }
 await form.selectOption('paste');
 assert.equal(await acidity.getByLabel('Reported result').inputValue(),'');
 assert.equal(await acidity.getByLabel('Laboratory reporting basis').inputValue(),'');
 for (const id of [register.rhizomeSpiceReview.spices[0].productId, register.rhizomeSpiceReview.recipes[1].productId]) {
  await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id),id);
  await form.selectOption('paste');
  assert.equal(await panel.count(),0);
  const ginger=page.locator('.rhizome-spice[data-spice="ginger"]');
  if (id === register.rhizomeSpiceReview.recipes[1].productId) assert((await ginger.innerText()).includes('pieces of ginger'));
  await ginger.getByRole('button',{name:'Open ginger paste product'}).click();
  assert.equal(await panel.getAttribute('data-product'),review.productId);
  assert.equal(await page.locator('#paste-lot').inputValue(),'');
 }
 for (const id of ['12-12-6-culinary-pastes','ginger-cocktail']) {
  await page.evaluate(id => PMSV_HELPER_TEST.selectProduct(id),id);
  assert.equal(await panel.count(),0);
  assert(!(await readProductBrief(page)).includes('Ginger paste · composition'));
 }
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 const downloading = page.waitForEvent('download');
 await page.locator('#exportReviewJSON').click();
 const all = fs.readFileSync(await (await downloading).path(),'utf8');
 assert(!all.includes('GP-SUPPLIER-104') && !all.includes('GP-KRISHARA-222'));
 assert.deepEqual(JSON.parse(all).gingerPasteReview,review);
 const response=await page.request.get(base+review.report);
 assert.equal(response.status(),200);
 assert((await response.text()).includes('90% of water capacity'));
}

async function testCulinarySauces(page,register,base,artifacts) {
 const review = register.culinarySauceReview, panel = page.locator('.culinary-composition');
 const fill = panel.locator('.culinary-fill');
 const records = review.rows.flatMap(row => row.products.map(product => ({row,product})));
 for (const {row,product} of records) {
  await page.getByRole('button',{name:'Review progress',exact:true}).click();
  await page.getByLabel('Choose a product standard').selectOption(product.id);
  await page.getByRole('button',{name:'Open product standard',exact:true}).click();
  assert.equal(await panel.getAttribute('data-product'),product.id);
  assert.equal(await panel.locator('#paste-lot').inputValue(),'');
  assert.equal(await panel.locator('#paste-acidity-result').inputValue(),'');
  assert.equal(await panel.locator('#fill-pack').inputValue(),'');
  assert((await panel.innerText()).includes('FSSAI 2.3.28(2), row '+row.number));
  for (const key of ['solids','acidity']) {
   await panel.locator('#paste-'+key+'-basis').selectOption('stated');
   await panel.locator('#paste-'+key+'-result').fill(row[key].toFixed(1));
   assert.equal(await panel.locator('[data-criterion="'+key+'"] .paste-outcome').innerText(),'Meets this minimum');
  }
  await panel.locator('#paste-lot').fill('FILL-LOT-'+product.id);
  await fill.locator('summary').click();
  await fill.locator('#fill-pack').selectOption('rigid');
  await fill.locator('#fill-product').fill('270');
  await fill.locator('#fill-capacity').fill('300');
  assert.equal(await fill.locator('.fill-outcome').innerText(),'90.0% · Meets this minimum');
  const brief = await readProductBrief(page);
  assert(brief.includes('Current focused reviews: R85') && brief.includes(base+review.report));
  assert(brief.includes('FILL-LOT-'+product.id) && brief.includes('Water capacity at 20 °C · 300 mL'));
  assert(brief.includes('Acidity · minimum '+row.acidity.toFixed(1)+'%'));
  assert(brief.includes('90.0% · Meets this minimum'));
  if (row.number !== 2) continue;
  await panel.locator('#paste-acidity-result').fill('1.19999999999999999');
  assert.equal(await panel.locator('[data-criterion="acidity"] .paste-outcome').innerText(),'Below this minimum');
  await fill.locator('#fill-product').fill('269.99999999999999999');
  assert.equal(await fill.locator('.fill-outcome').innerText(),'89.99…% · Below this minimum');
  await panel.locator('#paste-acidity-result').fill('1.19');
  await fill.locator('#fill-product').fill('269');
  for (const width of [320,390,1440]) {
   await page.setViewportSize({width,height:900});
   assert(await panel.evaluate(el=>el.scrollWidth <= el.clientWidth+1));
   assert(await fill.locator('select,input').evaluateAll(fields=>fields.every(f=>f.getBoundingClientRect().right <= f.closest('section').getBoundingClientRect().right+1)));
   if(width===390) await fill.screenshot({path:path.join(artifacts,'rigid-fill-390.png'),animations:'disabled',
    style:'header, .navtabs { visibility: hidden !important; }'});
  }
  await fill.locator('#fill-pack').selectOption('flexible');
  assert.equal(await fill.locator('#fill-product').isVisible(),false);
  assert.equal(await fill.locator('#fill-capacity').inputValue(),'');
  const flexible = await readProductBrief(page);
  assert(flexible.includes('Container type · Flexible pack') && flexible.includes('does not apply to this pack'));
  assert(!flexible.includes('Volume occupied by product ·') && !flexible.includes('Water capacity at 20 °C · 300 mL'));
  assert(flexible.includes('Reported 1.19 · % as acetic acid · Below this minimum'));
  await fill.locator('#fill-pack').selectOption('rigid');
  assert.equal(await fill.locator('#fill-product').inputValue(),'');
  await fill.locator('#fill-product').fill('0');
  await fill.locator('#fill-capacity').fill('300');
  assert.equal(await fill.locator('.fill-outcome').innerText(),'0.0% · Below this minimum');
 }
 await page.getByRole('button',{name:'Product finder',exact:true}).click();
 const search=page.locator('#productSearch');
 for (const id of ['12-12-6-tomato-ketchup-and-tomato-sauce','12-12-9-soybean-sauce','12-12-6-chilli-sauce']) {
  await search.fill(id);
  await page.locator('#productList [data-id="'+id+'"]').click();
  const article = register.tomatoSoybeanReview.products.find(p=>p.id===id);
  assert.equal(await panel.getAttribute('data-product'),id);
  assert((await panel.innerText()).includes('FSSAI '+(article?.clause||review.clause)+'(2)'));
  assert.equal(await panel.locator('.paste-proposal').count(),article ? 0 : 1);
 }
 await search.fill('');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 const downloading=page.waitForEvent('download');
 await page.locator('#exportReviewJSON').click();
 const json=fs.readFileSync(await (await downloading).path(),'utf8');
 assert.deepEqual(JSON.parse(json).culinarySauceReview,review);
 assert(!json.includes('FILL-LOT-'));
 const report=await page.request.get(base+review.report);
 assert.equal(report.status(),200);
 assert((await report.text()).includes('Five product-finder entries'));
}

async function testNamedSauces(page,register,base,artifacts) {
 const review = register.tomatoSoybeanReview;
 const [tomato,soybean] = review.products;
 const panel = page.locator('.culinary-composition');
 const search = page.locator('#productSearch'), category = page.locator('#productClass');
 const open = async product => {
  await page.getByRole('button',{name:'Review progress',exact:true}).click();
  await page.getByLabel('Choose a product standard').selectOption(product.id);
  await page.getByRole('button',{name:'Open product standard',exact:true}).click();
  assert.equal(await panel.getAttribute('data-product'),product.id);
  assert.equal(await page.locator('#productList [aria-selected="true"]').getAttribute('data-id'),product.id);
 };
 await page.getByRole('button',{name:'Product finder',exact:true}).click();
 await search.fill('cocoa');
 await category.selectOption('EXPLICIT_NONMATCH');
 await open(tomato);
 assert.equal(await search.inputValue(),'');
 assert.equal(await category.inputValue(),'all');
 await page.locator('#productSort').selectOption('priority');
 for (const product of [tomato,soybean]) {
  const alias = product===tomato ? 'tomato ketchup' : 'soya sauce';
  await search.fill(alias);
  assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),product.id);
  await category.selectOption('PARTIAL_EXACT_SOURCE_MATCH');
  await open(product);
  assert.equal(await search.inputValue(),alias);
  assert.equal(await category.inputValue(),'PARTIAL_EXACT_SOURCE_MATCH');
  assert.equal(await panel.locator('#paste-lot').inputValue(),'');
  assert.equal(await panel.locator('.paste-criterion').count(),Object.keys(product.minima).length);
  assert.equal(await panel.locator('.paste-proposal').count(),0);
  assert.equal(await panel.locator('#paste-nitrogen-basis').count(),product===soybean?1:0);
  await panel.locator('.sauce-amendment summary').click();
  assert((await panel.innerText()).includes(product.change));
  assert.equal(await panel.getByRole('link',{name:product.amendment.date.slice(0,4)+' amendment',exact:false}).getAttribute('href'),
   product.amendment.url+'#page='+product.amendment.page);
  await panel.locator('#paste-lot').fill('QA-'+product.id);
  for (const [key,value] of Object.entries(product.minima)) {
   await panel.locator('#paste-'+key+'-basis').selectOption('stated');
   await panel.locator('#paste-'+key+'-result').fill(value.toFixed(1));
   assert.equal(await panel.locator('[data-criterion="'+key+'"] .paste-outcome').innerText(),'Meets this minimum');
  }
  const fill = panel.locator('.culinary-fill');
  await fill.locator('summary').click();
  await fill.locator('#fill-pack').selectOption('rigid');
  await fill.locator('#fill-product').fill('270');
  await fill.locator('#fill-capacity').fill('300');
  const outcome = product===soybean ? 'nitrogen' : 'acidity';
  const criterion = panel.locator('[data-criterion="'+outcome+'"]');
  await criterion.locator('.paste-basis').selectOption('other');
  assert.match(await criterion.locator('.paste-outcome').innerText(),/Different reporting basis/);
  await criterion.locator('.paste-basis').selectOption('stated');
  await criterion.locator('.paste-value').fill(product===soybean?'0.99':'0.199');
  assert.equal(await criterion.locator('.paste-outcome').innerText(),'Below this minimum');
  const brief = await readProductBrief(page);
  assert(brief.includes('QA-'+product.id) && brief.includes('Current focused reviews: R86'));
  assert(brief.includes('FSSAI '+product.clause+'(2)') && brief.includes('Container fill · FSSAI '+product.clause+'(3)'));
  assert(brief.includes('90.0% · Meets this minimum') && brief.includes(base+review.report));
  assert(brief.includes(product.amendment.url+'#page='+product.amendment.page) && brief.includes(product.change));
  assert(!brief.includes('2024 draft') && !brief.includes('QA-'+(product===tomato?soybean.id:tomato.id)));
  assert.equal(brief.includes('Total nitrogen · minimum 1.0%'),product===soybean);
  if (product===soybean) {
   assert(brief.includes('Reported 0.99 · % (m/m) as nitrogen · Below this minimum'));
   for (const width of [320,390,1440]) {
    await page.setViewportSize({width,height:900});
    assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
    if(width===390) await criterion.screenshot({path:path.join(artifacts,'soybean-nitrogen-390.png'),
     animations:'disabled',style:'header, .navtabs { visibility: hidden !important; }'});
   }
  }
 }
 for (const alias of soybean.aliases) {
  await search.fill(alias);
  assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),soybean.id);
 }
 await search.fill('');
 await category.selectOption('all');
 const response = await page.request.get(base+review.report);
 assert.equal(response.status(),200);
 assert((await response.text()).includes(soybean.amendment.sha256));
}

async function testTomatoConcentrates(page,register,base,artifacts) {
 const review = register.tomatoConcentrateReview;
 const panel = page.locator('.culinary-composition');
 const form = panel.getByLabel('Product declared on the label or specification');
 const search = page.locator('#productSearch');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.getByLabel('Choose a product standard').selectOption(review.id);
 await page.getByRole('button',{name:'Open product standard',exact:true}).click();
 assert.equal(await panel.getAttribute('data-product'),review.id);
 for (const alias of review.aliases) {
  await search.fill(alias);
  assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),review.id);
 }
 assert.equal(await form.inputValue(),'');
 assert.equal(await panel.locator('.paste-criterion').count(),0);
 const undecided = await readProductBrief(page);
 assert(undecided.includes('Declared product · Awaiting label or specification'));
 assert(!undecided.includes('Meets this minimum') && !undecided.includes('Below this minimum'));
 assert(undecided.includes(base+review.report) && undecided.includes(review.method.url+'#page=9'));
 for (const [key,row,verdict] of [['puree',1,'Meets this minimum'],['paste',2,'Below this minimum']]) {
  await form.selectOption(key);
  assert.equal(await panel.locator('#paste-lot').inputValue(),'');
  assert.equal(await panel.locator('#paste-solids-result').inputValue(),'');
  assert.equal(await panel.locator('#paste-solids-basis').inputValue(),'');
  assert.equal(await panel.locator('#fill-pack').inputValue(),'');
  assert.equal(await panel.locator('#fill-product').inputValue(),'');
  assert.equal(await panel.locator('.paste-criterion').count(),1);
  assert((await panel.innerText()).includes('FSSAI 2.3.14(2), row '+row));
  await panel.locator('#paste-lot').fill('TOMATO-'+key);
  await panel.locator('#paste-solids-result').fill('12.0');
  assert.equal(await panel.locator('.paste-outcome').innerText(),'Confirm the reporting basis');
  await panel.locator('#paste-solids-basis').selectOption('other');
  assert.match(await panel.locator('.paste-outcome').innerText(),/Different reporting basis/);
  await panel.locator('#paste-solids-basis').selectOption('stated');
  assert.equal(await panel.locator('.paste-outcome').innerText(),verdict);
  const fill = panel.locator('.culinary-fill');
  await fill.locator('summary').click();
  await fill.locator('#fill-pack').selectOption('rigid');
  await fill.locator('#fill-product').fill('270');
  await fill.locator('#fill-capacity').fill('300');
  const text = await readProductBrief(page);
  assert(text.includes('Current focused reviews: R87') && text.includes('TOMATO-'+key));
  assert(text.includes('Declared product · '+review.forms[row-1].label));
  assert(text.includes('FSSAI 2.3.14(2), row '+row) && text.includes('Container fill · FSSAI 2.3.14(3)'));
  assert(text.includes('Reported 12.0 · Finished product, % (w/w) · '+verdict) && text.includes('90.0% · Meets this minimum'));
  assert(!text.includes('Acidity · minimum') && !text.includes('TOMATO-'+(key==='paste'?'puree':'paste')));
  if (key==='paste') {
   assert.equal(await panel.getByRole('link',{name:'FSSAI chapter',exact:false}).getAttribute('href'),review.sources.chapter.url+'#page=25');
   await panel.locator('.solids-method summary').click();
   assert.equal(await panel.getByRole('link',{name:'FSSAI fruit and vegetable methods',exact:false}).getAttribute('href'),review.method.url+'#page=9');
   for (const width of [320,390,1440]) {
    await page.setViewportSize({width,height:900});
    assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
    if (width===390) await panel.locator('#tomato-form-fields .paste-criterion').screenshot({
     path:path.join(artifacts,'tomato-paste-solids-390.png'),animations:'disabled',
     style:'header, .navtabs { visibility: hidden !important; }'});
   }
  }
 }
 await form.selectOption('');
 assert.equal(await panel.locator('#paste-lot').count(),0);
 assert(!(await readProductBrief(page)).includes('TOMATO-paste'));
 await search.fill('tomato ketchup');
 await page.locator('#productList [data-id="'+register.tomatoSoybeanReview.products[0].id+'"]').click();
 assert.equal(await form.count(),0);
 assert.equal(await panel.locator('#paste-acidity-result').count(),1);
 assert(!(await readProductBrief(page)).includes(review.report));
 await search.fill('');
 const response = await page.request.get(base+review.report);
 assert.equal(response.status(),200);
 assert((await response.text()).includes(review.method.sha256));
}

async function testTomatoJuice(page,register,base,artifacts) {
 const r=register.tomatoJuiceReview, panel=page.locator('.tomato-juice');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.getByLabel('Choose a product standard').selectOption(r.id);
 await page.getByRole('button',{name:'Open product standard',exact:true}).click();
 assert.equal(await panel.getAttribute('data-product'),r.id);
 assert.equal(await panel.locator('.juice-lab .paste-criterion').count(),7);
 assert.equal(await panel.locator('#juice-headspace-result').count(),0);
 assert.equal(await page.locator('.culinary-composition').count(),0);
 for (const alias of r.aliases) {
  await page.locator('#productSearch').fill(alias);
  assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),r.id);
 }
 await panel.locator('#juice-lot').fill('JUICE-7-LAB');
 for (const c of r.criteria) {
  const card=panel.getByRole('group',{name:c.label,exact:true}), maximum=c.maximum!==undefined;
  await card.locator('.paste-basis').selectOption('stated');
  await card.locator('.paste-value').fill(String(c.maximum??c.minimum));
  assert.equal(await card.locator('.paste-outcome').innerText(),maximum?'Meets this maximum':'Meets this minimum');
 }
 await panel.locator('#juice-ph-result').fill('4.6');
 assert.equal(await panel.locator('[data-criterion="ph"] .paste-outcome').innerText(),'Above this maximum');
 await panel.locator('#juice-solids-basis').selectOption('other');
 assert.match(await panel.locator('[data-criterion="solids"] .paste-outcome').innerText(),/Different reporting basis/);
 await panel.locator('.juice-packaging summary').click();
 const pack=panel.getByLabel('Container material');
 const basis=panel.getByLabel('Water-capacity measurement basis');
 const volume=panel.locator('#juice-volume'), water=panel.locator('#juice-capacity'), result=panel.locator('#juice-fill-outcome');
 await pack.selectOption('glass');
 await water.fill('300'); await volume.fill('252');
 await basis.selectOption('other');
 assert.match(await result.innerText(),/Confirm.*27 °C/);
 assert(!(await result.innerText()).includes('Meets'));
 await basis.selectOption('stated');
 assert.match(await result.innerText(),/Reference capacity · 280 mL/);
 assert.match(await result.innerText(),/Minimum juice volume · 252 mL/);
 assert.match(await result.innerText(),/90.0% · Meets this minimum/);
 const glass=await readProductBrief(page);
 assert(glass.includes('JUICE-7-LAB') && glass.includes('Current focused reviews: R88') && glass.includes('Container type · Glass container'));
 assert(glass.includes('Reported 4.6 · Measured pH · Above this maximum') && glass.includes('Different reporting basis · cannot compare'));
 assert(glass.includes('FSSAI 2.3.8(2)') && glass.includes(r.amendment.url+'#page=11') && glass.includes(base+r.report));
 assert(!glass.includes('Vacuum in the can ·') && !glass.includes('Can headspace · maximum'));
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width,height:900});
  assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  if (width===390) await panel.locator('.juice-packaging').screenshot({path:path.join(artifacts,'tomato-juice-glass-390.png'),
   animations:'disabled',style:'header, .navtabs { visibility: hidden !important; }'});
 }
 await pack.selectOption('can');
 assert.equal(await basis.inputValue(),''); assert.equal(await volume.inputValue(),''); assert.equal(await water.inputValue(),'');
 assert.equal(await panel.locator('#juice-lot').inputValue(),'JUICE-7-LAB');
 assert.equal(await panel.locator('#juice-ph-result').inputValue(),'4.6');
 await water.fill('300'); await volume.fill('252'); await basis.selectOption('stated');
 assert.match(await result.innerText(),/Minimum juice volume · 270 mL/);
 assert.match(await result.innerText(),/84.0% · Below this minimum/);
 await panel.locator('#juice-vacuum').selectOption('unknown');
 assert.match(await panel.locator('#juice-vacuum-outcome').innerText(),/Confirm the gauge sign convention/);
 await panel.locator('#juice-vacuum').selectOption('negative');
 await panel.locator('#juice-headspace-basis').selectOption('stated');
 await panel.locator('#juice-headspace-result').fill('7.1');
 const can=await readProductBrief(page);
 assert(can.includes('Vacuum in the can · Negative gauge pressure confirmed') && can.includes('Meets the negative-vacuum requirement'));
 assert(can.includes('Can headspace · maximum 7 mm') && can.includes('Reported 7.1 · Measured in millimetres · Above this maximum'));
 assert(!can.includes('Reference capacity · 280 mL'));
 await pack.selectOption('other');
 assert.equal(await panel.locator('#juice-headspace-result').count(),0);
 await water.fill('300'); await volume.fill('270'); await basis.selectOption('stated');
 assert.match(await result.innerText(),/90.0% · Meets this minimum/);
 await pack.selectOption('unknown');
 const unknown=await readProductBrief(page);
 assert(unknown.includes('Confirm the container material') && !unknown.includes('Full measured water capacity ·') && !unknown.includes('Negative gauge pressure confirmed'));
 assert.equal(await panel.getByRole('link',{name:'2017 Gazette · composition',exact:false}).getAttribute('href'),r.amendment.url+'#page=10');
 await page.locator('#productSearch').fill('tomato puree');
 await page.locator('#productList [data-id="'+register.tomatoConcentrateReview.id+'"]').click();
 assert.equal(await panel.count(),0);
 const next=await readProductBrief(page);
 assert(!next.includes('JUICE-7-LAB') && !next.includes('Water-capacity basis ·'));
 await page.locator('#productSearch').fill('');
 const response=await page.request.get(base+r.report);
 assert.equal(response.status(),200);
 assert((await response.text()).includes(r.amendment.sha256));
}

async function testCannedTomatoes(page,register,base,artifacts) {
 const r=register.cannedTomatoReview,panel=page.locator('.canned-tomatoes');
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.getByLabel('Choose a product standard').selectOption(r.id);
 await page.getByRole('button',{name:'Open product standard',exact:true}).click();
 assert.equal(await panel.getAttribute('data-product'),r.id);
 for (const alias of r.aliases) {
  await page.locator('#productSearch').fill(alias);
  assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),r.id);
 }
 const field=id=>panel.locator('#ct-'+id);
 const testResult=async(key,value,expected,basis='stated')=>{
  await field(key+'-basis').selectOption(basis);
  await field(key+'-result').fill(value);
  assert.equal(await panel.locator('[data-criterion="'+key+'"] .paste-outcome').innerText(),expected);
 };
 await field('lot').fill('CAN-186');
 await field('pack').selectOption('can');
 await field('net').fill('400'); await field('drained').fill('224');
 assert.equal(await field('drained-outcome').innerText(),'56.0% · Meets this minimum');
 await field('drained').fill('223.99');
 assert.match(await field('drained-outcome').innerText(),/Below/);
 await field('drained').fill('224');
 await field('vacuum').selectOption('unknown');
 assert.match(await field('vacuum-outcome').innerText(),/Confirm the gauge/);
 await field('vacuum').selectOption('negative');
 await testResult('headspace','7','Meets this maximum');
 await field('capacity-basis').selectOption('stated');
 await field('capacity').fill('300');await field('volume').fill('270');
 await field('style').selectOption('whole');await field('peel-state').selectOption('peeled');
 await testResult('blemish','3.5','Meets this maximum');
 await testResult('peel','50','Above this maximum');
 await field('medium').selectOption('water');
 await testResult('salt','3','Different reporting basis · cannot compare','other');
 await testResult('salt','3','Meets this maximum');
 await testResult('ph','4.6','Above this maximum');
 await field('firming').selectOption('yes');
 await testResult('calcium','0.060','Above this maximum');
 const whole=await readProductBrief(page);
 for (const item of ['CAN-186','Current focused reviews: R89','Peel present on peeled tomatoes','maximum 0.045%',
  'Actual net contents · 400 g','56.0% · Meets this minimum','Minimum product volume · 270 mL','Negative gauge pressure confirmed',
  'Reported 4.6 · Measured pH of the covering liquid · Above this maximum',base+r.report]) assert(whole.includes(item),item);
 await field('style').selectOption('diced');
 assert.equal(await field('peel-result').inputValue(),'');
 assert.equal(await field('calcium-result').inputValue(),'');
 assert.equal(await field('ph-result').inputValue(),'4.6');
 await testResult('calcium','0.060','Meets this maximum');
 await testResult('peel','50','Meets this maximum');
 await field('peel-state').selectOption('unpeeled');
 assert.equal(await field('peel-result').inputValue(),'');
 assert.equal(await field('calcium-result').inputValue(),'0.060');
 await testResult('peel','125','Meets this maximum');
 const diced=await readProductBrief(page);
 assert(diced.includes('Peel missing from unpeeled tomatoes · maximum 125 cm²/kg') && diced.includes('maximum 0.080%'));
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width,height:840});
  assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.getBoundingClientRect().right<=innerWidth+1));
  if (width===390) await panel.locator('[data-criterion="calcium"]').screenshot({path:path.join(artifacts,'canned-tomato-calcium-390.png')});
 }
 await field('firming').selectOption('no');
 assert.equal(await field('calcium-result').count(),0);
 await field('medium').selectOption('solid');
 assert.equal(await field('ph-result').count(),0);
 const solid=await readProductBrief(page);
 assert(solid.includes('Solid pack, no added liquid') && !solid.includes('Reported 4.6') && !solid.includes('Total calcium ions · maximum'));
 await field('pack').selectOption('glass');
 assert.equal(await field('net').count(),0);
 assert.equal(await field('capacity').inputValue(),'');
 assert.equal(await field('peel-result').inputValue(),'125');
 await field('capacity').fill('300');await field('volume').fill('252');
 await field('capacity-basis').selectOption('other');
 assert.match(await field('fill-outcome').innerText(),/Confirm.*27 °C/);
 await field('capacity-basis').selectOption('stated');
 const glass=await readProductBrief(page);
 assert(glass.includes('Reference capacity · 280 mL') && glass.includes('Minimum product volume · 252 mL'));
 assert(!glass.includes('Actual net contents · 400 g') && !glass.includes('Negative gauge pressure confirmed'));
 await field('medium').selectOption('other');
 assert(!(await readProductBrief(page)).includes('Covering-liquid pH · maximum'));
 const report=await page.request.get(base+r.report);
 assert.equal(report.status(),200);
 assert((await report.text()).includes(r.sources.amendment.sha256));
 await page.locator('#productSearch').fill('tomato juice');
 await page.locator('#productList [data-id="'+register.tomatoJuiceReview.id+'"]').click();
 assert.equal(await panel.count(),0);
 assert(!(await readProductBrief(page)).includes('CAN-186'));
 await page.locator('#productSearch').fill('');
}

async function testThermalPacks(page,register,base,artifacts) {
 const r=register.thermalPackReview,[fruit,veg]=r.products;
 const panel=page.locator('.thermal-packs'),field=key=>panel.locator('#tp-'+key);
 async function selectProduct(p) {
  await page.getByRole('button',{name:'Review progress',exact:true}).click();
  await page.getByLabel('Choose a product standard').selectOption(p.id);
  await page.getByRole('button',{name:'Open product standard',exact:true}).click();
  for (const alias of p.aliases) {
   await page.locator('#productSearch').fill(alias);
   assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),p.id);
  }
  assert.equal(await panel.getAttribute('data-product'),p.id);
 }
 await selectProduct(veg);
 await field('lot').fill('VEG-R90');await field('food').fill('Baked beans in tomato sauce');
 await field('net').fill('400');
 for (const row of veg.rows) {
  await field('style').selectOption(row.key);
  assert.equal(await field('drained').inputValue(),'');
  await field('drained').fill(String(row.minimumPercent*4));
  const result=await field('drain-status').innerText();
  assert(result.includes('FSSAI '+veg.clause+row.provision) && result.includes(row.minimumPercent+'.0% · Meets this minimum'));
 }
 await field('style').selectOption('sauce');await field('drained').fill('99.99');
 assert.match(await field('drain-status').innerText(),/Below this minimum/);
 await field('drained').fill('100');
 assert.match(await field('method').innerText(),/0.3 mm.*five minutes/);
 await panel.getByText('Container fill',{exact:true}).click();
 await field('container').selectOption('rigid');
 await field('water-basis').selectOption('other');await field('capacity').fill('300');await field('volume').fill('270');
 assert.match(await field('fill-status').innerText(),/Confirm.*20 °C/);
 await field('water-basis').selectOption('stated');
 assert.equal(await field('capacity').inputValue(),'');
 await field('capacity').fill('300');
 assert.match(await field('fill-status').innerText(),/Minimum occupied volume · 270 mL/);
 await panel.getByText('Label observations',{exact:true}).click();
 await field('medium-check').selectOption('seen');await field('vegetable-check').selectOption('missing');
 const lot=await readProductBrief(page);
 for (const t of ['Current focused reviews: R90, R66','VEG-R90','Baked beans in tomato sauce','25.0% · Meets this minimum',
   '90.0% · Meets this minimum','Vegetable names and percentage range of each · Declaration missing or incomplete',
   base+r.report,veg.amendment.url+'#page=19']) assert(lot.includes(t),t);
 await field('container').selectOption('flexible');
 const flexible=await readProductBrief(page);
 assert(flexible.includes('25.0% · Meets this minimum') && !flexible.includes('Full water capacity · 300 mL'));
 assert(!flexible.includes('90.0% · Meets this minimum'));
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width,height:840});
  assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.getBoundingClientRect().right<=innerWidth+1));
  if (width===390) await panel.locator('details').first().screenshot({path:path.join(artifacts,'thermal-vegetable-drain-390.png')});
 }
 await selectProduct(fruit);
 assert.equal(await field('lot').inputValue(),'');assert.equal(await field('net').inputValue(),'');
 await field('lot').fill('CHERRY-R90');await field('style').selectOption('liquid');
 await field('net').fill('400');await field('drained').fill('205');
 assert.match(await field('drain-status').innerText(),/Confirm the fruit/);
 await field('fruit').selectOption('cherries');await field('stem').selectOption('included');
 await field('drained').fill('205');
 const uncorrected=await readProductBrief(page);
 assert(uncorrected.includes('Stems included in the drained weight') && !uncorrected.includes('Meets this minimum'));
 await field('stem').selectOption('removed');
 assert.equal(await field('drained').inputValue(),'');
 await field('drained').fill('195');
 const cherries=await readProductBrief(page);
 assert(cherries.includes('Minimum drained solids · 200 g') && cherries.includes('48.75% · Below this minimum'));
 assert(cherries.includes(fruit.amendment.url+'#page=29') && !cherries.includes('VEG-R90') && !cherries.includes('baked beans packed in sauce'));
 await panel.getByText('Label observations',{exact:true}).click();
 await field('cherry-check').selectOption('seen');
 await field('fruit').selectOption('ordinary');assert.equal(await field('drained').inputValue(),'');
 await field('style').selectOption('solid');await field('drained').fill('280');
 const solid=await readProductBrief(page);
 assert(solid.includes('70.0% · Meets this minimum') && !solid.includes('Cherry preparation ·') && !solid.includes('Declaration for cherries packed with stems ·'));
 await page.locator('#productSearch').fill('canned tomatoes');
 await page.locator('#productList [data-id="'+register.cannedTomatoReview.id+'"]').click();
 assert.equal(await panel.count(),0);
 assert(!(await readProductBrief(page)).includes('CHERRY-R90'));
 await page.locator('#productSearch').fill('');
 const src=await page.request.get(base+r.report);assert.equal(src.status(),200);assert((await src.text()).includes(veg.amendment.sha256));
}

async function testFruitCocktail(page,register,base,artifacts) {
 const r=register.fruitCocktailReview;
 await page.getByRole('button',{name:'Review progress',exact:true}).click();
 await page.getByLabel('Choose a product standard').selectOption(r.id);
 await page.getByRole('button',{name:'Open product standard',exact:true}).click();
 const panel=page.locator('.fruit-cocktail'),f=key=>panel.locator('#fc-'+key);
 for (const alias of r.aliases) {
  await page.locator('#productSearch').fill(alias);
  assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),r.id);
 }
 await f('pack').selectOption('Flexible pack');await f('lot').fill('FRUIT-R91');
 await f('drained-basis').selectOption('other');
 await f('drained-capacity').fill('400');await f('drained-actual').fill('240');
 assert.match(await f('drained-result').innerText(),/Confirm the mass/);
 await f('drained-basis').selectOption('stated');
 assert.equal(await f('drained-capacity').inputValue(),'');
 await f('drained-capacity').fill('500');
 assert.match(await f('drained-result').innerText(),/48\.0% · Below this minimum/);
 await panel.getByText('Container fill',{exact:true}).click();
 await f('fill-basis').selectOption('stated');await f('fill-capacity').fill('500');await f('fill-actual').fill('450');
 assert.match(await f('fill-result').innerText(),/90\.0% · Meets this minimum/);
 await panel.getByText('Packing medium and label',{exact:true}).click();
 for (const key of ['sugarWater','sugarJuice']) {
  await f('medium').selectOption(key);assert.equal(await f('brix').inputValue(),'');
  await f('brix-basis').selectOption('stated');
  if (key==='sugarJuice') await f('names').fill('pineapple');
  for (const b of r.bands) {
   await f('brix').fill(b.min);
   assert.equal(await f('medium-result').innerText(),key==='sugarJuice'?b.juice+' pineapple juice':b.syrup);
  }
 }
 await f('brix').fill('13.95');
 assert.match(await f('medium-result').innerText(),/Between the published bands/);
 await f('brix-basis').selectOption('other');assert.equal(await f('brix').inputValue(),'');
 await f('brix').fill('14');assert.match(await f('medium-result').innerText(),/Confirm the cut-out/);
 await f('medium').selectOption('blend');assert(!(await f('brix').isVisible()));
 await f('names').fill('pear and mango');await f('share').fill('49.99');
 assert.match(await f('medium-result').innerText(),/In water/);
 await f('share').fill('50');
 assert.equal(await f('medium-result').innerText(),'pear and mango juice and water');
 const mixture=await readProductBrief(page);
 for (const s of ['FRUIT-R91','Flexible pack','Full water mass · 500 g','Measured drained fruit · 240 g','Minimum drained fruit · 250 g',
   'Shortfall · 10 g','Occupied volume including medium · 450 mL','90.0% · Meets this minimum','Juice by volume · 50%',
   'pear and mango juice and water','Current focused reviews: R91, R66',r.sources.chapter.url+'#page=4',base+r.report]) assert(mixture.includes(s),s);
 assert(!mixture.includes('Reported liquid strength') && !mixture.includes('pineapple'));
 await f('pack').selectOption('Canned');
 await panel.getByText('Canned tropical fruit salad defects',{exact:true}).click();
 await f('identity').selectOption('tropical');
 for (const d of r.defects) {
  await f(d.key+'-basis').selectOption('other');await f(d.key).fill(d.limit);
  assert.match(await f(d.key+'-result').innerText(),/Confirm the reporting basis/);
  await f(d.key+'-basis').selectOption('stated');assert.equal(await f(d.key).inputValue(),'');
  await f(d.key).fill(d.limit);assert.equal(await f(d.key+'-result').innerText(),'Within this maximum');
 }
 await f('seeds').fill('2.01');assert.equal(await f('seeds-result').innerText(),'Above this maximum');
 const inspected=await readProductBrief(page);
 for (const s of ['2 pieces per 100 g of drained fruit','6.5 cm² per 500 g of total contents, averaged','Reported result · 2.01','Above this maximum']) assert(inspected.includes(s),s);
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width,height:840});
  assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.getBoundingClientRect().right<=innerWidth+1));
  if (width===390) await panel.locator('details').first().screenshot({path:path.join(artifacts,'fruit-cocktail-390.png')});
 }
 await f('pack').selectOption('Flexible pack');
 const conflicting=await readProductBrief(page);
 assert(conflicting.includes('Reconcile the recorded flexible pack') && !conflicting.includes('Reported result · 2.01'));
 assert(!(await f('seeds').isVisible()));
 await f('pack').selectOption('Canned');assert.equal(await f('seeds').inputValue(),'');
 await f('identity').selectOption('other');
 assert(!(await readProductBrief(page)).includes('Reported result · 2.01'));
 await f('identity').selectOption('tropical');assert.equal(await f('seeds').inputValue(),'');
 await page.locator('#productSearch').fill('canned cherries');
 await page.locator('#productList [data-id="'+register.thermalPackReview.products[0].id+'"]').click();
 assert.equal(await panel.count(),0);assert(!(await readProductBrief(page)).includes('FRUIT-R91'));
 await page.locator('#productSearch').fill('');
 const source=await page.request.get(base+r.report);
 assert.equal(source.status(),200);assert((await source.text()).includes(r.sources.amendment.sha256));
}

async function testVegetableMeals(page,register,base,artifacts) {
 const r=register.vegetableMealReview,[curry,soup]=r.products;
 const panel=page.locator('.vegetable-meals'),f=key=>panel.locator('#vm-'+key);
 async function open(product) {
  await page.getByRole('button',{name:'Review progress',exact:true}).click();
  const picker=page.getByLabel('Choose a product standard');
  const ids=await picker.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value));
  assert.equal(ids.length,new Set(ids).size);assert(ids.length>=15);
  assert.equal(await page.locator('#culinary-count').innerText(),'This section has interactive checks for '+ids.length+' catalogue products.');
  await picker.selectOption(product.id);await page.getByRole('button',{name:'Open product standard',exact:true}).click();
  for (const alias of product.aliases) {
   await page.locator('#productSearch').fill(alias);
   assert.equal(await page.locator('#productList [data-id]').first().getAttribute('data-id'),product.id);
  }
  assert.equal(await panel.getAttribute('data-product'),product.id);
 }
 await open(curry);await f('lot').fill('CURRY-R92');await f('food').fill('Vegetable and lentil curry');
 assert.equal(await f('solids').count(),0);
 await f('identity').selectOption('ready');
 await f('pack').selectOption('rigid');await f('water-basis').selectOption('other');
 await f('capacity').fill('400');await f('volume').fill('360');assert.match(await f('fill-result').innerText(),/Confirm full distilled-water/);
 await f('water-basis').selectOption('stated');assert.equal(await f('capacity').inputValue(),'');
 await f('capacity').fill('400');assert.match(await f('fill-result').innerText(),/90.0% · Meets this minimum/);
 await panel.getByText('Supporting records',{exact:true}).click();
 await f('appendix').fill('MB-CURRY-17');await f('additives').fill('AD-17');
 const curryBrief=await readProductBrief(page);
 for(const t of ['Current focused reviews: R92, R67','CURRY-R92','Vegetable and lentil curry','FSSAI 2.3.4(3)',
  'Minimum occupied volume · 360 mL','90.0% · Meets this minimum','Appendix B report · MB-CURRY-17','Additive assessment · AD-17',base+r.report]) assert(curryBrief.includes(t),t);
 await f('pack').selectOption('flexible');const flexible=await readProductBrief(page);
 assert(!flexible.includes('Recorded capacity ·') && !flexible.includes('90.0% · Meets this minimum'));
 await f('identity').selectOption('other');assert(!(await f('pack').isVisible()));
 assert(!(await readProductBrief(page)).includes('MB-CURRY-17'));
 await open(soup);assert.equal(await f('lot').inputValue(),'');
 await f('lot').fill('SOUP-R92');await f('food').fill('Prepared vegetable soup');
 await f('identity').selectOption('vegetable');
 await f('solids-basis').selectOption('other');await f('solids').fill('6');
 assert.match(await f('solids-result').innerText(),/Different reporting basis/);
 const wrong=await readProductBrief(page);assert(wrong.includes('Entered reading (basis unconfirmed) · 6') && !wrong.includes('Meets this minimum'));
 await f('solids-basis').selectOption('stated');assert.equal(await f('solids').inputValue(),'');await f('solids').fill('6.0');
 assert.match(await f('solids-result').innerText(),/5.0%.*\nMeets this minimum/);
 await f('identity').selectOption('tomato');
 assert.equal(await f('solids').inputValue(),'');assert.equal(await f('solids-basis').inputValue(),'');
 await f('solids-basis').selectOption('stated');await f('solids').fill('6.0');
 await panel.getByText('Rigid-container fill',{exact:true}).click();
 await f('pack').selectOption('flexible');
 const tomato=await readProductBrief(page);
 for(const t of ['Current focused reviews: R92','SOUP-R92','Finished soup total soluble solids · 6.0% by mass',
  'Minimum 7.0% total soluble solids by mass.','Below this minimum','Container · Flexible pack','outside the 137-product queue',
  r.sources.gazette.url+'#page=54',r.sources.chapter.url+'#page=11',base+r.report]) assert(tomato.includes(t),t);
 assert(!tomato.includes('R92, R67') && !tomato.includes('CURRY-R92'));
 for (const width of [320,390,1440]) {
  await page.setViewportSize({width,height:840});
  assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.getBoundingClientRect().right<=innerWidth+1));
  if(width===390) await panel.locator('details').first().screenshot({path:path.join(artifacts,'vegetable-soup-390.png')});
 }
 await f('identity').selectOption('reconstitute');
 assert(!(await f('solids').isVisible()) && !(await f('pack').isVisible()));
 const dry=await readProductBrief(page);
 assert(dry.includes('Review the product as sold') && !dry.includes('Finished soup total soluble solids ·') && !dry.includes('Below this minimum'));
 await page.locator('#productSearch').fill('fruit cocktail');
 await page.locator('#productList [data-id="'+register.fruitCocktailReview.id+'"]').click();
 assert.equal(await panel.count(),0);assert(!(await readProductBrief(page)).includes('SOUP-R92'));
 await page.locator('#productSearch').fill('');
 const source=await page.request.get(base+r.report);assert.equal(source.status(),200);assert((await source.text()).includes(r.sources.gazette.sha256));
}


async function testCatalogueWorksheets(page, exhaustive) {
 const oil='02-02-1-refined-grapeseed-oil', khoa='18-18-1-khoa-based-sweets';
 const open=async id=>{
  assert(await page.evaluate(v=>PMSV_HELPER_TEST.selectProduct(v),id));
  await page.locator('.catalogue-worksheet > summary').click();
  await page.locator('.ws-inputs').waitFor();
 };
 if(exhaustive) {
  const count=await page.evaluate(()=>{
   const all=PMSV_HELPER_TEST.getCatalogue(),host=document.createElement('div');
   for(const {id} of all){
    host.innerHTML=PMSVCatalogueWorksheets.markup(id);PMSVCatalogueWorksheets.attach(host,id);
    const detail=host.querySelector('[data-ws-id]');detail.open=true;detail.dispatchEvent(new Event('toggle'));
    if(detail.querySelectorAll('[data-crop-result]').length!==12||!detail.querySelector('[data-ws-field="reference"]')||detail.querySelectorAll('.ws-section').length<5)throw Error('Missing worksheet sections '+id);
   }
   return all.length;
  });assert.equal(count,533);
 }
 await open(oil);
 const f=k=>page.locator('.ws-body [data-ws-field="'+k+'"]');
 await f('reference').fill('R93-SOURCE-SAMPLE');
 const criterion=await f('criterion').locator('option').evaluateAll(x=>x.find(e=>e.textContent.startsWith('Moisture'))?.value);
 assert(criterion);await f('criterion').selectOption(criterion);await f('result').fill('0.10000000000000001');
 await f('unitConfirmed').check();assert((await page.locator('[data-ws-outcome]').textContent()).includes('Outside'));
 await f('result').fill('0.10');assert((await page.locator('[data-ws-outcome]').textContent()).includes('Within'));
 await f('note').fill('Certificate 410, moisture in the stated unit.');
 await page.locator('.ws-body [data-ws-save]').click();assert((await page.locator('[data-ws-saved]').textContent()).includes('Saved'));
 const txt=await readProductBrief(page);assert(txt.includes('R93-SOURCE-SAMPLE')&&txt.includes('Within the cited source-edition criterion')&&txt.includes('Certificate 410'));
 await open(khoa);assert.equal(await f('reference').inputValue(),'');assert.equal(await f('criterion').count(),0);
 await page.locator('.catalogue-worksheet').getByText('Classification, identity and applicable route',{exact:true}).click();
 assert((await page.locator('.ws-body').textContent()).includes('Annexure II'));
 await page.locator('.catalogue-worksheet').getByText('Food additives and processing aids',{exact:true}).click();
 await page.locator('[data-ws-add]').fill('202');assert(await page.locator('[data-ws-add-results]').isVisible());
 await page.locator('.catalogue-worksheet').getByText('Contaminants, toxins and residues',{exact:true}).click();
 await page.locator('.catalogue-worksheet').getByText('Search original Gazette commodity rows',{exact:true}).click();
 await page.locator('[data-ws-commodity]').fill('sugarcane');
 const candidate=page.locator('[data-ws-candidate]').first();await candidate.click();
 assert((await page.locator('[data-ws-recorded]').innerText()).toLowerCase().includes('sugarcane'));
 assert((await readProductBrief(page)).includes('Candidate recorded for review'));
 await page.locator('.catalogue-worksheet').getByText('Packaging, labelling and claims',{exact:true}).click();await f('pack').selectOption('glass');
 assert((await page.locator('[data-ws-pack]').textContent()).includes('Reg. 4(2)'));
 assert(!(await readProductBrief(page)).includes('R93-SOURCE-SAMPLE'));
 await open(oil);assert.equal(await f('reference').inputValue(),'R93-SOURCE-SAMPLE');
 await open('13-13-1-infant-formula');
 await page.locator('.broad-ctr>summary').click();
 await f('broadForm').selectOption('liquid');
 assert((await page.locator('[data-broad-result]').textContent()).includes('Awaiting'));
 await f('broadRef').fill('Label confirms liquid as supplied');
 assert((await page.locator('[data-broad-result]').textContent()).includes('0.15 mg/kg'));
 assert((await readProductBrief(page)).includes('Liquid infant formula · 0.15 mg/kg'));
 await f('broadForm').selectOption('powder');assert.equal(await f('broadRef').inputValue(),'');
 assert((await page.locator('[data-broad-result]').textContent()).includes('Awaiting'));
 await open('13-13-1-infant-milk-food');await page.locator('.broad-ctr>summary').click();
 assert((await page.locator('[data-broad-result]').textContent()).includes('1.0 mg/kg'));
 assert.equal(await f('broadForm').count(),0);assert(!(await readProductBrief(page)).includes('Label confirms liquid as supplied'));
 await open('05-05-2-sugar-boiled-confectionery-hard-candy');
 await page.locator('.metal-scope>summary').click();
 assert.equal(await page.locator('[data-metal-results] tbody tr').count(),11);
 await f('metalPack').selectOption('other');
 assert((await page.locator('[data-metal-results]').innerText()).includes('Confirm canning status'));
 await f('metalPackRef').fill('Wrapped hard candy · pack drawing 14');
 assert((await readProductBrief(page)).includes('Hard boiled sugar confectionery · 5.0 ppm'));
 await f('metalPack').selectOption('can');assert.equal(await f('metalPackRef').inputValue(),'');
 await f('metalPackRef').fill('Canned finished article · specification 15');
 assert((await page.locator('[data-metal-results]').innerText()).includes('Both the hard-boiled and canned descriptions'));
 await open('05-05-2-spice-based-mouth-fresheners');await page.locator('.metal-scope>summary').click();
 await f('metalForm').selectOption('composite');
 assert((await page.locator('[data-metal-results]').innerText()).includes('Determine if the article'));
 await f('metalFormRef').fill('Composite recipe and label 16');
 assert(!(await page.locator('[data-metal-results]').innerText()).includes('Determine if the article'));
 assert((await page.locator('[data-hg-value]').textContent()).includes('1.0 ppm'));
 await open('09-09-2-frozen-finfish');await page.locator('.broad-ctr>summary').click();
 await f('mercuryArticle').selectOption('Hg10');
 assert(!(await page.locator('[data-hg-value]').textContent()).includes('1.0 ppm'));
 await f('mercuryArticleRef').fill('Species specification · swordfish');
 assert((await page.locator('[data-hg-value]').textContent()).includes('1.0 ppm'));
 assert((await readProductBrief(page)).includes('Species specification · swordfish'));
 await open('99-99-1-baking-powder');await page.locator('.broad-ctr>summary').click();
 assert((await page.locator('[data-broad-result]').innerText()).includes('2.5 mg/kg'));
 assert.equal(await f('broadForm').count(),0);assert(!(await readProductBrief(page)).includes('Composite recipe and label 16'));
 await open('05-05-2-sugar-boiled-confectionery-hard-candy');
 await page.locator('.crop-scope>summary').click();
 const toxin=k=>page.locator('[data-crop-result="'+k+'"]');
 assert((await toxin('hcn').innerText()).includes('Confectionery · 5 ppm'));
 await page.locator('.crop-inputs>summary').click();
 await f('crop_af').selectOption('composite');
 assert((await toxin('total').innerText()).includes('Awaiting evidence'));
 await f('crop_afRef').fill('Recipe C96 lists toasted almond');
 assert((await toxin('total').innerText()).includes('20 µg/kg'));
 assert((await toxin('b1').innerText()).includes('10 µg/kg'));
 await page.locator('.ws-body [data-ws-save]').click();
 assert((await readProductBrief(page)).includes('Recipe C96 lists toasted almond'));
 await open('01-01-5-milk-powders-and-cream-powder');await page.locator('.crop-scope>summary').click();
 await page.locator('.crop-inputs>summary').click();
 await f('crop_milk').selectOption('skim');await f('crop_milkRef').fill('Grade S96');
 assert((await toxin('m1').innerText()).includes('6 µg/kg'));
 await f('crop_milk').selectOption('whole');assert.equal(await f('crop_milkRef').inputValue(),'');
 await f('crop_milkRef').fill('Grade W96');
 assert((await toxin('m1').innerText()).includes('4 µg/kg'));
 await open('09-09-2-smoked-fishery-products');await page.locator('.crop-scope>summary').click();
 assert((await toxin('pah').innerText()).includes('5 ppb'));
 await page.locator('.crop-inputs>summary').click();await f('crop_fish').selectOption('inland');await f('crop_fishRef').fill('Species and waterbody S96');
 assert((await toxin('pcb').innerText()).includes('2 ppm'));
 await open('12-12-6-tomato-ketchup-and-tomato-sauce');await page.locator('.crop-scope>summary').click();
 assert((await toxin('saf').innerText()).includes('Soups and sauces · 10 ppm'));
 await page.locator('.crop-future>summary').click();await f('crop_dec').selectOption('absent');await f('crop_decRef').fill('Ketchup formula K96');
 assert((await page.locator('[data-crop-future]').innerText()).includes('no match'));
 assert((await toxin('saf').innerText()).includes('Soups and sauces · 10 ppm'));
 await open('05-05-2-sugar-boiled-confectionery-hard-candy');await page.locator('.crop-scope>summary').click();
 await page.locator('.crop-inputs>summary').click();assert.equal(await f('crop_afRef').inputValue(),'Recipe C96 lists toasted almond');
 const dl=page.waitForEvent('download');await page.locator('#downloadWorksheets').click();
 const file=await dl;assert.equal(file.suggestedFilename(),'PMSV-FSSAI-533-Product-Register-R96.csv');
 const csv=fs.readFileSync(await file.path(),'utf8');assert(csv.includes(khoa)&&csv.includes(oil)&&csv.includes('Exact finished-product decision open')&&csv.includes('Species specification · swordfish')&&csv.includes('Composite recipe and label 16')&&csv.includes('Recipe C96 lists toasted almond')&&csv.includes('Ketchup formula K96'));
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
  await testCatalogueWorksheets(page,false);
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
  await page.getByLabel('Form of ginger supplied').selectOption('paste');
  await page.getByLabel('Supplier document or lot reference for ginger (optional)').fill('OFFLINE-GINGER-PASTE');
  await page.locator('#paste-solids-basis').selectOption('stated');
  await page.locator('#paste-solids-result').fill('2.95');
  const pasteText = await readProductBrief(page);
  assert(pasteText.includes('OFFLINE-GINGER-PASTE') && pasteText.includes('OFFLINE-HALDI'));
  assert(pasteText.includes('Reported 2.95 · Salt-free, % (m/m) · Below this minimum'));
  assert(pasteText.includes('Awaiting a result') && pasteText.includes(sourceBase + register.gingerPasteReview.report));
  assert.equal(await page.locator('.ginger-paste-check').getByRole('link',{name:'Ginger-paste source review ↗'}).evaluate(a=>a.href),
   sourceBase + register.gingerPasteReview.report);
  await page.getByRole('button',{name:'Review progress',exact:true}).click();
  await page.getByLabel('Choose a product standard').selectOption('12-12-6-fruits-vegetable-sauces');
  await page.getByRole('button',{name:'Open product standard'}).click();
  const sauce=page.locator('.culinary-composition');
  await sauce.locator('#paste-lot').fill('OFFLINE-FRUIT-SAUCE');
  await sauce.locator('#paste-acidity-basis').selectOption('stated');
  await sauce.locator('#paste-acidity-result').fill('1.19');
  await sauce.locator('.culinary-fill summary').click();
  await sauce.locator('#fill-pack').selectOption('rigid');
  await sauce.locator('#fill-product').fill('270');
  await sauce.locator('#fill-capacity').fill('300');
  const sauceBrief=await readProductBrief(page);
  assert(sauceBrief.includes('OFFLINE-FRUIT-SAUCE') && sauceBrief.includes('Reported 1.19 · % as acetic acid · Below this minimum'));
  assert(sauceBrief.includes('90.0% · Meets this minimum') && sauceBrief.includes(sourceBase+register.culinarySauceReview.report));
  assert(!sauceBrief.includes('OFFLINE-GINGER-PASTE') && !sauceBrief.includes('OFFLINE-HALDI'));
  const named = register.tomatoSoybeanReview, soybean = named.products[1];
  await page.locator('#productSearch').fill('soy sauce');
  await page.locator('#productList [data-id="'+soybean.id+'"]').click();
  assert.equal(await sauce.getAttribute('data-product'),soybean.id);
  await sauce.locator('#paste-lot').fill('OFFLINE-SOY-429');
  for (const [key,value] of [['solids','15.0'],['acidity','0.6'],['nitrogen','0.99']]) {
   await sauce.locator('#paste-'+key+'-basis').selectOption('stated');
   await sauce.locator('#paste-'+key+'-result').fill(value);
  }
  await sauce.locator('.culinary-fill summary').click();
  await sauce.locator('#fill-pack').selectOption('flexible');
  const soybeanBrief = await readProductBrief(page);
  assert(soybeanBrief.includes('OFFLINE-SOY-429') && soybeanBrief.includes('FSSAI 2.3.29(2)'));
  assert(soybeanBrief.includes('Reported 0.99 · % (m/m) as nitrogen · Below this minimum'));
  assert(soybeanBrief.includes('Container type · Flexible pack') && soybeanBrief.includes('FSSAI 2.3.29(3)'));
  assert(soybeanBrief.includes(soybean.amendment.url+'#page=24') && soybeanBrief.includes(sourceBase+named.report));
  assert(!soybeanBrief.includes('OFFLINE-FRUIT-SAUCE') && !soybeanBrief.includes('2024 draft'));
  const concentrate = register.tomatoConcentrateReview;
  await page.locator('#productSearch').fill('tomato paste');
  await page.locator('#productList [data-id="'+concentrate.id+'"]').click();
  await page.getByLabel('Product declared on the label or specification').selectOption('paste');
  await sauce.locator('#paste-lot').fill('OFFLINE-PASTE-189');
  await sauce.locator('#paste-solids-basis').selectOption('stated');
  await sauce.locator('#paste-solids-result').fill('24.9');
  await sauce.locator('.culinary-fill summary').click();
  await sauce.locator('#fill-pack').selectOption('flexible');
  const concentrateBrief = await readProductBrief(page);
  assert(concentrateBrief.includes('Declared product · Tomato paste') && concentrateBrief.includes('OFFLINE-PASTE-189'));
  assert(concentrateBrief.includes('FSSAI 2.3.14(2), row 2') && concentrateBrief.includes('minimum 25.0%'));
  assert(concentrateBrief.includes('Reported 24.9 · Finished product, % (w/w) · Below this minimum'));
  assert(concentrateBrief.includes('Container type · Flexible pack') && concentrateBrief.includes(sourceBase+concentrate.report));
  assert(concentrateBrief.includes(concentrate.method.url+'#page=9') && !concentrateBrief.includes('OFFLINE-SOY-429'));
  const juice=register.tomatoJuiceReview;
  await page.locator('#productSearch').fill('tomato juice');
  await page.locator('#productList [data-id="'+juice.id+'"]').click();
  const juicePanel=page.locator('.tomato-juice');
  await juicePanel.locator('#juice-lot').fill('OFFLINE-JUICE-7');
  await juicePanel.locator('#juice-solids-basis').selectOption('stated');
  await juicePanel.locator('#juice-solids-result').fill('5.0');
  await juicePanel.locator('#juice-ph-basis').selectOption('stated');
  await juicePanel.locator('#juice-ph-result').fill('4.6');
  await juicePanel.locator('.juice-packaging summary').click();
  await juicePanel.getByLabel('Container material').selectOption('glass');
  await juicePanel.locator('#juice-capacity-basis').selectOption('stated');
  await juicePanel.locator('#juice-capacity').fill('300');
  await juicePanel.locator('#juice-volume').fill('252');
  const juiceBrief=await readProductBrief(page);
  assert(juiceBrief.includes('OFFLINE-JUICE-7') && juiceBrief.includes('Reported 4.6 · Measured pH · Above this maximum'));
  assert(juiceBrief.includes('Reported 5.0 · Salt-excluded, % by weight · Meets this minimum'));
  assert(juiceBrief.includes('Minimum juice volume · 252 mL') && juiceBrief.includes('90.0% · Meets this minimum'));
  assert(juiceBrief.includes(juice.amendment.url+'#page=11') && juiceBrief.includes(sourceBase+juice.report));
  assert(!juiceBrief.includes('OFFLINE-PASTE-189') && !juiceBrief.includes('Can headspace · maximum'));
  const canned=register.cannedTomatoReview;
  await page.locator('#productSearch').fill('tinned tomatoes');
  await page.locator('#productList [data-id="'+canned.id+'"]').click();
  const ct=page.locator('.canned-tomatoes');
  await ct.locator('#ct-lot').fill('OFFLINE-CAN-186');
  await ct.locator('#ct-pack').selectOption('can');
  await ct.locator('#ct-drained').fill('224');await ct.locator('#ct-net').fill('400');
  await ct.locator('#ct-style').selectOption('whole');await ct.locator('#ct-peel-state').selectOption('peeled');
  await ct.locator('#ct-medium').selectOption('juice');
  await ct.locator('#ct-firming').selectOption('yes');
  await ct.locator('#ct-calcium-basis').selectOption('stated');
  await ct.locator('#ct-calcium-result').fill('0.060');
  const cannedBrief=await readProductBrief(page);
  for (const line of ['OFFLINE-CAN-186','Tomato style · Whole','Drained tomato solids · 224 g','Actual net contents · 400 g',
    '56.0% · Meets this minimum','Total calcium ions · maximum 0.045%','Reported 0.060 · Total calcium-ion content, % · Above this maximum',
    canned.sources.amendment.url+'#page=9',canned.sources.method.url+'#page=5',sourceBase+canned.report]) assert(cannedBrief.includes(line),line);
  assert(!cannedBrief.includes('OFFLINE-JUICE-7') && !cannedBrief.includes('Soluble-solids method'));
  const thermal=register.thermalPackReview,[fruitPack,vegPack]=thermal.products;
  await page.locator('#productSearch').fill('baked beans in sauce');
  await page.locator('#productList [data-id="'+vegPack.id+'"]').click();
  const tp=page.locator('.thermal-packs'),measure=key=>tp.locator('#tp-'+key);
  await measure('lot').fill('OFFLINE-BEANS-185');
  await measure('style').selectOption('sauce');
  await measure('net').fill('400');await measure('drained').fill('100');
  const beansBrief=await readProductBrief(page);
  for (const t of ['OFFLINE-BEANS-185','Current focused reviews: R90, R66','FSSAI 2.3.3(1)(i)(c)',
   'Minimum drained solids · 100 g','25.0% · Meets this minimum',sourceBase+thermal.report,vegPack.amendment.url+'#page=19']) assert(beansBrief.includes(t),t);
  await page.locator('#productSearch').fill('canned cherries');
  await page.locator('#productList [data-id="'+fruitPack.id+'"]').click();
  await measure('lot').fill('OFFLINE-CHERRIES-146');await measure('style').selectOption('liquid');
  await measure('fruit').selectOption('cherries');await measure('stem').selectOption('removed');
  await measure('net').fill('400');await measure('drained').fill('195');
  await tp.getByText('Container fill',{exact:true}).click();
  await measure('container').selectOption('rigid');await measure('water-basis').selectOption('stated');
  await measure('capacity').fill('300');await measure('volume').fill('270');
  const cherriesBrief=await readProductBrief(page);
  for (const t of ['OFFLINE-CHERRIES-146','Stems removed before the drained weight was determined','48.75% · Below this minimum',
    '90.0% · Meets this minimum','Minimum occupied volume · 270 mL',fruitPack.amendment.url+'#page=29',sourceBase+thermal.report]) assert(cherriesBrief.includes(t),t);
  assert(!cherriesBrief.includes('OFFLINE-BEANS-185') && !cherriesBrief.includes('OFFLINE-CAN-186'));
  const cocktail=register.fruitCocktailReview;
  await page.locator('#productSearch').fill('fruit cocktail');
  await page.locator('#productList [data-id="'+cocktail.id+'"]').click();
  const fc=page.locator('.fruit-cocktail'),cf=key=>fc.locator('#fc-'+key);
  await cf('lot').fill('OFFLINE-COCKTAIL-147');
  await cf('drained-basis').selectOption('stated');await cf('drained-capacity').fill('500');await cf('drained-actual').fill('240');
  await fc.getByText('Container fill',{exact:true}).click();
  await cf('fill-basis').selectOption('stated');await cf('fill-capacity').fill('500');await cf('fill-actual').fill('450');
  await fc.getByText('Packing medium and label',{exact:true}).click();
  await cf('medium').selectOption('sugarBlend');await cf('brix-basis').selectOption('stated');await cf('brix').fill('18');
  await fc.getByText('Canned tropical fruit salad defects',{exact:true}).click();
  await cf('identity').selectOption('tropical');await cf('peel-basis').selectOption('stated');await cf('peel').fill('6.5');
  const cocktailBrief=await readProductBrief(page);
  for (const s of ['OFFLINE-COCKTAIL-147','Current focused reviews: R91, R66','48.0% · Below this minimum','Shortfall · 10 g',
    '90.0% · Meets this minimum','Reported liquid strength · 18 °Brix','Packing-medium declaration · Heavy syrup',
    '6.5 cm² per 500 g of total contents, averaged','Within this maximum',sourceBase+cocktail.report,cocktail.sources.chapter.url+'#page=4'])
   assert(cocktailBrief.includes(s),s);
  assert(!cocktailBrief.includes('OFFLINE-CHERRIES-146'));
  const meals=register.vegetableMealReview,[curry,soup]=meals.products;
  await page.locator('#productSearch').fill('canned tomato soup');
  await page.locator('#productList [data-id="'+soup.id+'"]').click();
  const vm=page.locator('.vegetable-meals'),mf=key=>vm.locator('#vm-'+key);
  await mf('lot').fill('OFFLINE-SOUP-421');await mf('identity').selectOption('tomato');
  await mf('solids-basis').selectOption('stated');await mf('solids').fill('6.0');
  await vm.getByText('Rigid-container fill',{exact:true}).click();
  await mf('pack').selectOption('flexible');
  const soupLot=await readProductBrief(page);
  for(const t of ['OFFLINE-SOUP-421','Finished soup total soluble solids · 6.0% by mass','Minimum 7.0% total soluble solids by mass.',
   'Below this minimum','outside the 137-product queue',sourceBase+meals.report]) assert(soupLot.includes(t),t);
  await page.locator('#productSearch').fill('curried vegetables');
  await page.locator('#productList [data-id="'+curry.id+'"]').click();
  await mf('lot').fill('OFFLINE-CURRY-187');await mf('identity').selectOption('ready');await mf('pack').selectOption('rigid');
  await mf('water-basis').selectOption('stated');await mf('capacity').fill('400');await mf('volume').fill('360');
  const curryLot=await readProductBrief(page);
  for(const t of ['OFFLINE-CURRY-187','Current focused reviews: R92, R67','Minimum occupied volume · 360 mL','90.0% · Meets this minimum',
    meals.sources.gazette.url+'#page=53',sourceBase+meals.report]) assert(curryLot.includes(t),t);
  assert(!curryLot.includes('OFFLINE-SOUP-421') && !curryLot.includes('Minimum 7.0%'));
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
 const priorityCrop=await page.evaluate(()=>PMSV_REVIEW_REGISTER.cropArticleReview.priorityNamed);
 await page.locator('#reviewFilter').selectOption('named22');assert.equal(await page.locator('#reviewResults article').count(),priorityCrop);
 await page.locator('#reviewFilter').selectOption('other22');assert.equal(await page.locator('#reviewResults article').count(),137-priorityCrop);
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
 assert.match(await page.locator('#productDetail').textContent(),/Wider CTR article decision: OPEN/);
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
 await testGingerPaste(page, data, base, artifacts);
 await testCulinarySauces(page, data, base, artifacts);
 await testNamedSauces(page, data, base, artifacts);
 await testTomatoConcentrates(page, data, base, artifacts);
 await testTomatoJuice(page, data, base, artifacts);
 await testCannedTomatoes(page, data, base, artifacts);
 await testThermalPacks(page, data, base, artifacts);
 await testFruitCocktail(page, data, base, artifacts);
 await testVegetableMeals(page, data, base, artifacts);
 await testCatalogueWorksheets(page,true);
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
 const result={cropScopeProducts:533,cropTableRows:45,cropAnalytes:12,cropArticleAndIngredientDecisionsTested:true,decemberSaffroleBoundaryTested:true,metalTableProducts:533,confectioneryMetalHeadings:11,ingredientAndPackDecisionsTested:true,broadContaminantProducts:533,infantLiquidAndPowderTested:true,allProductWorksheetsRendered:533,sourceEditionComparisonTested:true,allProductOfflineRegisterExported:true,passed:true,catalogueRowsRendered:533,reviewCases:137,focused:137,remaining:0,originalGazetteMetalRows:382,originalGazetteCropRows:27,futureChangesVisibleAndExported:9,sourceReportReachable:true,residuePesticideRows:1098,residueVeterinaryRows:358,residueFindingsVisibleAndExported:8,residueReportReachable:true,widths:[320,390,1440],views:6,partialCatalogueRejected:true,duplicateCatalogueRejected:true,malformedHashHandled:true,fullFilteredExport:137,pageErrors:errors,nativeAndroidTested:false};
 Object.assign(result,{fibreThresholds:6,fibreArithmeticFormTested:true,fibreSourceConflictOpen:true,toxinLimitOrPlanRows:37,histamineSpeciesEntries:119,toxinFindingsVisibleAndExported:6,seafoodProductNotes:24,toxinReportReachable:true});
 Object.assign(result,{waterStandardReferenceRows:74,waterStandardSearchAndGroupTested:true,waterAmendmentsReconciled:4,waterSourceNotes:5,recipeWaterMappings:4,waterDocumentFormTested:true,waterDraftInactive:true,waterGapsClosed:0,waterReportReachable:true});
 Object.assign(result,{asafoetidaPurityRows:11,asafoetidaGradesTested:3,asafoetidaDefaultGrade:null,hinguSubstitutionOpen:true,asafoetidaProductResetAndScopeTested:true});
 Object.assign(result,{camphorSourceEntries:5,camphorSourceYear:2008,camphorRecipeNotes:2,camphorMaterialChoicesTested:4,camphorOpticalLiteralPreserved:true,camphorRecipeHoldPreserved:true,camphorScopeResetTested:true});
 Object.assign(result,{hinguRawReferences:4,hinguGradesTested:3,hinguLabReferences:6,hinguScopeResetsVerified:true,
  ayurvedaIngredientsWithCandidate:35,ayurvedaIngredientsWithoutCandidate:11,ayurvedaCandidateLinks:data.ayurvedaIngredientCoverage.candidateLinks});
 Object.assign(result,{flowerIngredientEntries:5,flowerRecipePages:2,flowerMetalCandidates:2,flowerMaterialResets:true,flowerProductBriefs:2,flowerSupplierScenarios:25,flowerSupplyBriefExportTested:true,flowerSupplyRegisterIsolationTested:true,portableHelperOfflineBriefTested:true,rhizomeProductsTested:4,rhizomeSupplierFormsTested:6,rhizomeOfflineBriefTested:true});
 Object.assign(result,{culinarySourceRows:4,culinaryCatalogueProducts:5,rigidFillBoundaryTested:true,culinaryOfflineBriefTested:true});
 Object.assign(result,{thermalPackRowsTested:7,thermalCherryPreparationTested:true,thermalPackOfflineLots:2});
 Object.assign(result,{fruitCocktailOfflineTested:true,fruitCocktailBrixBands:8,fruitCocktailDefects:3,fruitCocktailMassAndVolume:true});
 Object.assign(result,{vegetableMealOfflineLots:2,vegetableSoupSolidsTested:true,vegetableMealRigidFillTested:true,culinaryPickerProducts:await page.locator('#culinary-product option').count()});
 Object.assign(result,{cannedTomatoDrainedWeightTested:true,cannedTomatoStyleAndCalciumTested:true,cannedTomatoOfflineExportTested:true});
 Object.assign(result,{tomatoJuiceLabChecks:7,tomatoJuiceCanChecks:2,tomatoJuiceGlassFillTested:true,tomatoJuiceOfflineBriefTested:true});
 Object.assign(result,{tomatoConcentrateForms:2,declaredTomatoFormResetTested:true,concentrateReportingBasisTested:true,tomatoConcentrateOfflineBriefTested:true});
 Object.assign(result,{namedSauceArticles:2,soybeanNitrogenTested:true,namedSauceOfflineBriefTested:true,filteredProductLinkTested:true});
 Object.assign(result,{gingerPasteCriteriaTested:2,gingerPasteRecipeAndCatalogueTested:true,gingerPasteOfflineBriefTested:true});
 Object.assign(result,{juniperRawReferences:4,juniperSuppliedStyles:4,juniperScopeResetsVerified:true,juniperBlankNaZeroVerified:true});
 Object.assign(result,{lajadiBotanicalEntries:17,lajadiIngredientsTested:3,lajadiFormBranchesTested:12,lajadiMethodBasesPreserved:true,lajadiWaterNotePreserved:true,lajadiScopeResetTested:true,lajadiSourceSpellingsPreserved:true});
 fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
