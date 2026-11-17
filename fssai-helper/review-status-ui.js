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
 function reportLinks(row){return row.reports.map(r=>`<a class="source-ref" href="${esc(r.file)}" target="_blank" rel="noopener noreferrer">R${r.round} source review ↗</a>`).join('');}
 function productMarkup(id){
  if(!available)return '<div class="notice">Current review progress is unavailable. No verification is inferred.</div>';
  const toxin=data.toxinGazetteReview;
  let sourceNote=toxin.seafoodNoteIds.includes(id)?`<section class="panel compact toxin-product-note"><h4>Histamine species and sampling scope</h4><p>${esc(toxin.seafoodNote)}</p><a class="source-ref" href="${esc(toxin.report)}" target="_blank" rel="noopener noreferrer">R72 original-source findings ↗</a></section>`:'';
  if(id===data.fibreClaimsReview.productId)sourceNote+=fibreMarkup();
  const row=byId.get(id);
  if(!row)return sourceNote+'<section class="panel compact"><h4>Current review progress</h4><p>This product is outside the 137-case CTR work queue. That does not establish complete regulatory verification.</p></section>';
  return sourceNote+`<section class="panel compact"><h4>Current source review · ${esc(data.latestSourceReviewDate)}</h4><p>${row.reports.length?'Focused review recorded through R'+row.reports[0].round:'Awaiting a focused review in the selected rounds.'} Exact CTR article decision: <strong>OPEN</strong>.</p>${reportLinks(row)}<p><b>Source finding:</b> ${esc(row.sourceReviewResult)}</p><p><b>Remaining source/application question:</b> ${esc(row.sourceReviewNextAction)}</p><p class="muted"><b>Separate lot-release evidence:</b> ${esc(row.lotReleaseEvidence)}</p></section>`;
 }
 window.PMSVReviewUI=Object.freeze({productMarkup});
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
