(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const data=window.PMSV_REVIEW_REGISTER;
 const status=window.PMSVReviewStatus?.validateReview(data,window.PMSV_CATALOGUE);
 const available=status?.ok===true;
 const byId=new Map(available?data.records.map(x=>[x.id,x]):[]);
 function reportLinks(row){return row.reports.map(r=>`<a class="source-ref" href="${esc(r.file)}" target="_blank" rel="noopener noreferrer">R${r.round} source review ↗</a>`).join('');}
 function productMarkup(id){
  if(!available)return '<div class="notice">Current review progress is unavailable. No verification is inferred.</div>';
  const row=byId.get(id);
  if(!row)return '<section class="panel compact"><h4>Current review progress</h4><p>This product is outside the 137-case CTR work queue. That does not establish complete regulatory verification.</p></section>';
  return `<section class="panel compact"><h4>Current source review · ${esc(data.checkpointDate)}</h4><p>${row.reports.length?'Focused review recorded through R'+row.reports[0].round:'Awaiting a focused review in the selected rounds.'} Exact CTR article decision: <strong>OPEN</strong>.</p>${reportLinks(row)}<p><b>Source finding:</b> ${esc(row.sourceReviewResult)}</p><p><b>Remaining source/application question:</b> ${esc(row.sourceReviewNextAction)}</p><p class="muted"><b>Separate lot-release evidence:</b> ${esc(row.lotReleaseEvidence)}</p></section>`;
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
 $('verificationStatus').textContent=`Checked ${data.checkpointDate} · ${data.queueCount} open CTR article decisions · ${data.focusedCount} focused source reviews · ${data.remainingFocusedCount} outside the selected rounds`;
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
  a.href=url;a.download='PMSV_FSSAI_Review_Status_2026-11-14.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 });
 render();
})();
