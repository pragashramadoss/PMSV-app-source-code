(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const data=window.PMSV_REVIEW_REGISTER;
 const status=window.PMSVReviewStatus?.validateReview(data,window.PMSV_CATALOGUE);
 const available=status?.ok===true;
 const basisLabels={g_per_100g_solids:'Per 100 g solids',g_per_100ml_liquids:'Per 100 ml liquids',g_per_100kcal:'Per 100 kcal'};
 function fibreMarkup(){
  const f=data.fibreClaimsReview;
  return `<section class="panel compact fibre-product-note"><h4>Dietary fibre claims · source conflict open</h4><p>${esc(f.findings[0].detail)}</p><div class="table-scroll"><table class="methodtable"><caption>Claims Schedule I · row 14 · minimum fibre</caption><thead><tr><th scope="col">Basis</th><th scope="col">Source</th><th scope="col">High / rich</th></tr></thead><tbody>${Object.entries(basisLabels).map(([key,label])=>`<tr><th scope="row">${esc(label)}</th><td>${f.thresholdRows.find(r=>r.basis===key&&r.claim==='source').minimum} g</td><td>${f.thresholdRows.find(r=>r.basis===key&&r.claim==='high').minimum} g</td></tr>`).join('')}</tbody></table></div><p>Each basis is an alternative. Use fibre measured in the finished food, not the amount of dextrin added. Serving-size values and ingredient purity cannot be substituted. Health-supplement categories require their separate provisions.</p><a class="source-ref" href="${esc(f.source)}" target="_blank" rel="noopener noreferrer">2022 Claims notification · page 13 ↗</a><a class="source-ref" href="${esc(f.originalDextrinSource)}" target="_blank" rel="noopener noreferrer">2016 dextrin provision · page 5 ↗</a><a class="source-ref" href="${esc(f.report)}" target="_blank" rel="noopener noreferrer">R73 source comparison ↗</a><details><summary>Compare a numerical threshold</summary><p>This reference checks one selected basis. It does not decide whether a dextrin-related claim is permitted.</p><form id="fibreReferenceForm" class="form-grid" novalidate><div><label for="fibreBasis">Measurement basis</label><select id="fibreBasis" name="basis"><option value="">Select basis</option>${Object.entries(basisLabels).map(([key,label])=>`<option value="${key}">${esc(label)}</option>`).join('')}</select></div><div><label for="fibreClaim">Claim reference</label><select id="fibreClaim" name="claim"><option value="">Select claim</option><option value="source">Source</option><option value="high">High / rich</option></select></div><div><label for="fibreAmount">Grams of fibre on selected basis</label><input id="fibreAmount" name="fibre" type="number" min="0" step="any" inputmode="decimal"></div><div class="wide"><button type="submit">Compare threshold</button><p role="status" aria-live="polite">No comparison yet. Dextrin claim conflict remains open.</p></div></form></details></section>`;
 }
 const byId=new Map(available?data.records.map(x=>[x.id,x]):[]);
 function waterMarkup(note){
  const w=data.waterSourceReview,ws=data.waterStandardReview,isIngredient=note.use==='ingredient';
  return `<section class="panel compact water-product-note"><h4>${isIngredient?'Ingredient water · evidence checklist':'Vending water · source scope'}</h4><p>${esc(ws.sourceReviewResult)}</p>${isIngredient?`<p>Recipe ${esc(note.recipeNumber)} · ingredient ${note.ingredientSerial}: ${esc(note.ingredientName)} · ${esc(note.ratio)}. ${note.recipeTitleMethodHold?'Recipe title/method discrepancy remains open.':''}</p>`:''}<p>The original water standard and all four amendments are now available. The source table below keeps acceptable values, conditional upper values, units and sample volumes separate. Product applicability and the iron–manganese interpretation remain open.</p>${isIngredient?`<details><summary>Find the water documents to check</summary><p>Based on the dated FoSCoS FAQ, page 18. Confirm current requirements for the applicable kind of business (KOB). Supplier bills do not establish water quality.</p><form id="waterEvidenceForm" data-water-use="ingredient"><label for="waterSupplier">Ingredient-water supply</label><select id="waterSupplier" name="supplier"><option value="">Select supplier</option><option value="municipal">Municipal Corporation / government body</option><option value="private">Mall / commercial hub / private authority</option><option value="own">Own or another supply</option><option value="mixed">Mixed or unknown supply</option></select><div class="controls"><button type="submit">Show evidence checklist</button></div><p role="status" aria-live="polite">No supply selected. No water-quality approval.</p></form></details>`:'<p>The original vending definition excludes packaged drinking water, natural mineral water and captive-consumption installations. Ingredient-water FAQ concessions cannot establish compliance with the vending-water standard. The retrieved June 2025 replacement tables are draft text and have not been activated.</p>'}<a class="source-ref" href="${esc(isIngredient?w.sources.ingredient:w.sources.vending)}" target="_blank" rel="noopener noreferrer">${isIngredient?'FoSCoS FAQs 121–123 · page 18':'2019 original notification · page 4'} ↗</a><a class="source-ref" href="${esc(w.sources.bis)}" target="_blank" rel="noopener noreferrer">BIS standard details ↗</a><a class="source-ref" href="${esc(w.report)}" target="_blank" rel="noopener noreferrer">R74 water-source review ↗</a>${window.PMSVWaterStandard?.markup(ws)||'<p>Water-standard reference unavailable.</p>'}</section>`;
 }
 function reportLinks(row){return row.reports.map(r=>`<a class="source-ref" href="${esc(r.file)}" target="_blank" rel="noopener noreferrer">R${r.round} source review ↗</a>`).join('');}
 function productMarkup(id){
  if(!available)return '<div class="notice">Current review progress is unavailable. No verification is inferred.</div>';
  const toxin=data.toxinGazetteReview;
  let sourceNote=toxin.seafoodNoteIds.includes(id)?`<section class="panel compact toxin-product-note"><h4>Histamine species and sampling scope</h4><p>${esc(toxin.seafoodNote)}</p><a class="source-ref" href="${esc(toxin.report)}" target="_blank" rel="noopener noreferrer">R72 original-source findings ↗</a></section>`:'';
  if(id===data.fibreClaimsReview.productId)sourceNote+=fibreMarkup();
  const waterNote=data.waterSourceReview.records.find(x=>x.id===id);
  sourceNote += window.PMSVRecipeFlowers.markup(data.recipeFlowerReview, id);
  sourceNote += window.PMSVRhizomeSpices.markup(data.rhizomeSpiceReview, id);
  const culinary = window.PMSVCulinarySauces.article(data,id);
  if (culinary && !culinary.ingredient) sourceNote += window.PMSVCulinarySauces.markup(culinary);
  if(waterNote)sourceNote+=waterMarkup(waterNote);
  const asafoetida=data.asafoetidaReview;
  if(id===asafoetida.productId||id===asafoetida.recipeProductId)sourceNote+=window.PMSVAsafoetida?.markup(asafoetida,id===asafoetida.recipeProductId)||'<p>Asafoetida reference unavailable.</p>';
  const camphor=data.camphorReview,camphorNote=camphor.records.find(x=>x.id===id);
  if(camphorNote)sourceNote+=window.PMSVCamphor?.markup(camphor,camphorNote)||'<p>Camphor source reference unavailable.</p>';
  const lajadi=data.lajadiBotanicalReview;
  if(id===lajadi.recipeProductId)sourceNote+=window.PMSVLajadiBotanicals?.markup(lajadi)||'<p>Botanical source reference unavailable.</p>';
  const row=byId.get(id);
  if(!row)return sourceNote+'<section class="panel compact"><h4>Current review progress</h4><p>This product is outside the 137-case CTR work queue. That does not establish complete regulatory verification.</p></section>';
  const reviewDate = row.reports[0]?.file.match(/(\d{4}-\d{2}-\d{2})\.md$/)?.[1] || data.checkpointDate;
  return sourceNote+`<section class="panel compact"><h4>Current source review · ${esc(reviewDate)}</h4><p>${row.reports.length?'Focused review recorded through R'+row.reports[0].round:'Awaiting a focused review in the selected rounds.'} Exact CTR article decision: <strong>OPEN</strong>.</p>${reportLinks(row)}<p><b>Source finding:</b> ${esc(row.sourceReviewResult)}</p><p><b>Remaining source/application question:</b> ${esc(row.sourceReviewNextAction)}</p><p class="muted"><b>Separate lot-release evidence:</b> ${esc(row.lotReleaseEvidence)}</p></section>`;
 }
 window.PMSVReviewUI=Object.freeze({productMarkup, available});
 if(!$('verificationStatus'))return;
 if(!available){
  $('verificationStatus').textContent='Review progress unavailable: '+(status?.reason||'review asset did not load');
  $('exportReviewJSON').disabled=true;
  return;
 }
 $('focusedTotal').textContent=String(status.focusedCount);
 $('remainingFocusedTotal').textContent=String(status.remainingFocusedCount);
 $('verificationStatus').textContent=`Source review through ${data.latestSourceReviewDate} · ${data.queueCount} open CTR article decisions · ${data.focusedCount} focused source reviews · ${data.remainingFocusedCount} outside the selected rounds`;
 $('verificationScope').textContent=data.scope;
 $('verificationSoftware').textContent=data.softwareVerification;
 const evidenceLink=document.createElement('a');
 evidenceLink.href='verification-2026-11-14.md';evidenceLink.textContent='Read the software verification report';
 evidenceLink.className='source-ref';evidenceLink.target='_blank';evidenceLink.rel='noopener noreferrer';
 $('verificationSoftware').append(document.createTextNode(' '),evidenceLink);
 const gazette=data.originalGazetteReview,sourcePanel=document.createElement('section');
 sourcePanel.id='gazetteReviewSummary';sourcePanel.className='panel compact';
 sourcePanel.innerHTML=`<h3>Original Gazette checks</h3><p>${esc(gazette.summary)}</p><a class="source-ref" href="${esc(gazette.report)}" target="_blank" rel="noopener noreferrer">Read the original-source comparison ↗</a><details><summary>9 changes scheduled for 1 December 2026</summary><p>Future on the review date. These entries have not been activated in the current rules.</p><ul>${gazette.futureChanges.map(change=>`<li><b>${esc(change.title)}:</b> ${esc(change.scopeNote)}</li>`).join('')}</ul></details>`;
 $('verificationSoftware').insertAdjacentElement('afterend',sourcePanel);
 const saucePanel = document.createElement('section');
 saucePanel.className = 'panel compact';
 const sauceOptions = products => products.map(p => '<option value="' + esc(p.id) + '">' + esc(p.label) + '</option>').join('');
 const [tomato,soybean] = data.tomatoSoybeanReview.products;
 saucePanel.innerHTML = '<h3>Sauce and paste standards</h3><label for="culinary-product">Sauce or paste standard</label>' +
  '<div class="controls"><select id="culinary-product"><optgroup label="FSSAI ' + esc(data.tomatoConcentrateReview.clause) + '">' +
  sauceOptions([data.tomatoConcentrateReview]) + '</optgroup><optgroup label="FSSAI ' + esc(tomato.clause) + '">' + sauceOptions([tomato]) +
  '</optgroup><optgroup label="FSSAI ' + esc(data.culinarySauceReview.clause) + '">' +
  sauceOptions(data.culinarySauceReview.rows.flatMap(row => row.products)) +
  '</optgroup><optgroup label="FSSAI ' + esc(soybean.clause) + '">' + sauceOptions([soybean]) +
  '</optgroup></select><button type="button" id="open-culinary-product">Open product standard</button></div>';
 sourcePanel.insertAdjacentElement('beforebegin',saucePanel);
 $('open-culinary-product').addEventListener('click', () => window.PMSV_HELPER_TEST?.selectProduct($('culinary-product').value));
 const residue=data.residueGazetteReview,residuePanel=document.createElement('section');
 residuePanel.id='residueReviewSummary';residuePanel.className='panel compact';
 residuePanel.innerHTML=`<h3>Pesticide and veterinary source checks</h3><p>${esc(residue.summary)}</p><a class="source-ref" href="${esc(residue.report)}" target="_blank" rel="noopener noreferrer">Read the residue-source comparison ↗</a><details><summary>8 source findings and safeguards</summary><ul>${residue.findings.map(finding=>`<li><b>${esc(finding.title)}:</b> ${esc(finding.detail)}</li>`).join('')}</ul></details>`;
 sourcePanel.insertAdjacentElement('afterend',residuePanel);
 const toxin=data.toxinGazetteReview,toxinPanel=document.createElement('section');
 toxinPanel.id='toxinReviewSummary';toxinPanel.className='panel compact';
 toxinPanel.innerHTML=`<h3>Natural toxins and seafood source checks</h3><p>${esc(toxin.summary)}</p><a class="source-ref" href="${esc(toxin.report)}" target="_blank" rel="noopener noreferrer">Read the toxin-source comparison ↗</a><details><summary>6 source findings and safeguards</summary><ul>${toxin.findings.map(finding=>`<li><b>${esc(finding.title)}:</b> ${esc(finding.detail)}</li>`).join('')}</ul></details>`;
 residuePanel.insertAdjacentElement('afterend',toxinPanel);
 const fibre=data.fibreClaimsReview,fibrePanel=document.createElement('section');
 fibrePanel.id='fibreReviewSummary';fibrePanel.className='panel compact';
 fibrePanel.innerHTML=`<h3>Dietary fibre claim sources</h3><p>Six thresholds match the original 2022 Claims notification. The older dextrin provision remains an open source conflict.</p><a class="source-ref" href="${esc(fibre.report)}" target="_blank" rel="noopener noreferrer">Read the fibre-source comparison ↗</a><button type="button" id="openFibreReference">Open fibre comparison</button>`;
 toxinPanel.insertAdjacentElement('afterend',fibrePanel);
 $('openFibreReference').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(fibre.productId));
 const water=data.waterSourceReview,waterPanel=document.createElement('section');
 waterPanel.id='waterReviewSummary';waterPanel.className='panel compact';
 waterPanel.innerHTML=`<h3>Water sources and supplier evidence</h3><p>One vending-water identity and four recipe-water instances now link to 74 IS 10500 source entries reconciled with four amendments. The 2025 draft limits remain inactive; water applicability and interpretation questions remain open.</p><a class="source-ref" href="${esc(water.report)}" target="_blank" rel="noopener noreferrer">Read the water-source review ↗</a><div class="controls"><button type="button" id="openVendingWater">Open vending-water scope</button><button type="button" id="openIngredientWater">Open ingredient-water checklist</button></div>`;
 fibrePanel.insertAdjacentElement('afterend',waterPanel);
 $('openVendingWater').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(water.records[0].id));
 $('openIngredientWater').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(water.records[1].id));
 const ingredientCoverage=data.ayurvedaIngredientCoverage;
 const asafoetida=data.asafoetidaReview,asafoetidaPanel=document.createElement('section');
 asafoetidaPanel.id='asafoetidaReviewSummary';asafoetidaPanel.className='panel compact';
 asafoetidaPanel.innerHTML=`<h3>Asafoetida purity by grade</h3><p>The 2025 FSSAI compendium confirms the 11 purity limits. Grade selection links to laboratory methods. Confirmed natural dried Hingu also has four candidate spice articles.</p><a class="source-ref" href="${esc(data.hinguReview.report)}" target="_blank" rel="noopener noreferrer">Read the Hingu ingredient review ↗</a><a class="source-ref" href="${esc(asafoetida.report)}" target="_blank" rel="noopener noreferrer">Read the asafoetida-source comparison ↗</a><div class="controls"><button type="button" id="openAsafoetida">Open asafoetida grades</button><button type="button" id="openHinguRecipe">Open Hingu recipe scope</button></div>`;
 waterPanel.insertAdjacentElement('afterend',asafoetidaPanel);
 $('openAsafoetida').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(asafoetida.productId));
 $('openHinguRecipe').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(asafoetida.recipeProductId));
 const camphor=data.camphorReview,camphorPanel=document.createElement('section');
 camphorPanel.id='camphorReviewSummary';camphorPanel.className='panel compact';
 camphorPanel.innerHTML=`<h3>Natural-camphor source and recipe identity</h3><p>The original 2008 pharmacopoeial scan supplies five source entries. Optical-rotation wording, botanical substitutions and food-use safety remain open. The 14.6 recipe hold is preserved.</p><a class="source-ref" href="${esc(camphor.report)}" target="_blank" rel="noopener noreferrer">Read the camphor-source review ↗</a><div class="controls"><button type="button" id="openCamphorIngredient">Open recipe 14.5 source scope</button><button type="button" id="openCamphorMethodHold">Open recipe 14.6 hold</button></div>`;
 asafoetidaPanel.insertAdjacentElement('afterend',camphorPanel);
 $('openCamphorIngredient').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(camphor.records[0].id));
 $('openCamphorMethodHold').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(camphor.records[1].id));
 const juniper=data.juniperSpiceReview;
 const lajadi=data.lajadiBotanicalReview,lajadiPanel=document.createElement('section');
 lajadiPanel.id='lajadiReviewSummary';lajadiPanel.className='panel compact';
 lajadiPanel.innerHTML=`<h3>Lajadi Kashaya botanical references</h3><p>Three archived monographs supply 17 ingredient-purity entries. Species, plant parts, source-name differences and test bases remain explicit. Identity and current applicability are open.</p><p>Dried juniper fruit has ${juniper.rawRows.length} FSSAI spice-article candidates. </p><a class="source-ref" href="${esc(juniper.report)}" target="_blank" rel="noopener noreferrer">Read the juniper food-spice review ↗</a><a class="source-ref" href="${esc(lajadi.report)}" target="_blank" rel="noopener noreferrer">Read the botanical-source review ↗</a><div class="controls"><button type="button" id="openLajadiBotanicals">Open recipe 12.1 botanicals</button></div>`;
 camphorPanel.insertAdjacentElement('afterend',lajadiPanel);
 const ingredientPanel = document.createElement('section');
 ingredientPanel.id = 'ayurvedaIngredientCoverage';
 ingredientPanel.className = 'panel compact';
 const outstanding = ingredientCoverage.remainingInstances.map(row =>
  '<li>Recipe ' + esc(row.recipe) + ' · ingredient ' + esc(row.serial) + ' · ' + esc(row.name) + '</li>').join('');
 ingredientPanel.innerHTML = '<h3>Ayurveda ingredient contaminant references</h3><p><b>' + ingredientCoverage.withCandidate +
  ' of ' + ingredientCoverage.ingredientRows + '</b> ingredient entries have at least one candidate raw-material reference. The supplied material and finished recipe require separate assessments.</p>' +
  '<details><summary>' + ingredientCoverage.withoutCandidate + ' ingredient entries awaiting a candidate reference</summary><ul>' + outstanding + '</ul></details>' +
  '<p>Recipe 14.7 lets you record an identified flower supply separately. The printed recipe leaves the species open.</p>' +
  '<p>' + ingredientCoverage.candidateLinks + ' ingredient-to-article references are recorded across the recipes.</p>' +
  '<div class="controls"><button type="button" id="openRhizomeRecipe">Open ginger and turmeric in recipe 13.1</button>' +
  '<button type="button" data-open-ginger-paste>Open ginger paste product</button>' +
  '<button type="button" id="openNamedFlowers">Open flowers in recipe 14.6</button>' +
  '<button type="button" id="openAromaticFlower">Open aromatic flowers in recipe 14.7</button></div>';
 lajadiPanel.insertAdjacentElement('afterend',ingredientPanel);
 const [namedFlowers, aromaticFlower] = data.recipeFlowerReview.recipes;
 $('openRhizomeRecipe').addEventListener('click', () => window.PMSV_HELPER_TEST?.selectProduct(data.rhizomeSpiceReview.recipes[0].productId));
 $('openNamedFlowers').addEventListener('click', () => window.PMSV_HELPER_TEST?.selectProduct(namedFlowers.productId));
 $('openAromaticFlower').addEventListener('click', () => window.PMSV_HELPER_TEST?.selectProduct(aromaticFlower.productId));
 $('openLajadiBotanicals').addEventListener('click',()=>window.PMSV_HELPER_TEST?.selectProduct(lajadi.recipeProductId));
 $('reviewFilter').options[1].textContent=`${status.focusedCount} linked source reviews`;
 $('reviewFilter').options[2].textContent=`${status.remainingFocusedCount} outside selected rounds`;
 $('currencyWatch').innerHTML=data.currencyWatch.map(x=>`<article class="source-card"><h3>${esc(x.title)}</h3><p>${esc(x.status)}</p><p class="muted">Checked ${esc(x.checked)}${x.effectiveFrom?' · Effective from '+esc(x.effectiveFrom):''}</p><a class="source-ref" href="${esc(x.source)}" target="_blank" rel="noopener noreferrer">Official source ↗</a></article>`).join('');
 function render(){
  const query=$('reviewSearch').value.toLowerCase().trim(),filter=$('reviewFilter').value;
  const rows=data.records.filter(x=>(filter==='all'||(filter==='focused'?x.reports.length>0:x.reports.length===0))&&
   [x.name,x.id,x.fssr,x.fcs].some(v=>String(v||'').toLowerCase().includes(query)));
  $('reviewResultsCount').textContent=`${rows.length} of ${data.records.length} open cases`;
  $('reviewResults').innerHTML=rows.map(x=>`<article class="source-card"><h3>${esc(x.name)}</h3><p class="muted">${esc(x.fssr||'Special/category route')} · ${esc(x.fcs||'Category requires review')}</p><p>${x.reports.length?'Focused review: R'+x.reports[0].round:'Outside selected focused rounds'} · Exact article decision OPEN</p><p>${esc(x.sourceReviewNextAction)}</p>${reportLinks(x)}<button type="button" data-review-product="${esc(x.id)}">Open product</button></article>`).join('')||'<p>No cases match this search.</p>';
 }
 $('reviewSearch').addEventListener('input',render);
 $('reviewFilter').addEventListener('change',render);
 $('reviewResults').addEventListener('click',event=>{const button=event.target.closest('[data-review-product]');if(button)window.PMSV_HELPER_TEST?.selectProduct(button.dataset.reviewProduct);});
 $('exportReviewJSON').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='PMSV_FSSAI_Review_Status_'+data.latestSourceReviewDate+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 });
 render();
})();
