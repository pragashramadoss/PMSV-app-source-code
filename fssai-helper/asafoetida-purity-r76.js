/* Grade-specific source reference; no grade selection or approval is inferred. */
(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function select(data,grade){
  if(!data||!Array.isArray(data.grades)||!Array.isArray(data.rows)||typeof grade!=='string')return null;
  const chosen=data.grades.find(g=>g.id===grade);
  if(!chosen)return null;
  return {grade:chosen,rows:data.rows.filter(r=>r.grade===grade),legalProductApproval:false,batchRelease:false};
 }
 function gradeMarkup(data,grade){
  const chosen=select(data,grade);
  if(!chosen)return '<p>Choose a grade to view its source limits. No grade is inferred from the product name.</p>';
  return `<h5>${esc(chosen.grade.label)}</h5><p>${esc(chosen.grade.definition)}</p><div class="table-scroll" tabindex="0" role="region" aria-label="Asafoetida purity references"><table class="methodtable asafoetida-reference-table"><thead><tr><th scope="col">Parameter / basis</th><th scope="col">Source limit</th></tr></thead><tbody>${chosen.rows.map(r=>`<tr><th scope="row">${esc(r.name)}<small>${esc(r.basis)}</small></th><td>${r.operator==='<='?'Maximum':'Minimum'} ${esc(r.limit)}${esc(r.unit)}</td></tr>`).join('')}</tbody></table></div><p>${esc(chosen.grade.exclusions)}</p><p>${esc(chosen.grade.extraNote)}</p><p>Alcoholic extract uses 90% alcohol and cites U.S.P. 1936. This is an extraction condition, not the ingredient’s alcohol content. No dry basis is specified here. Check the method and reporting basis on the laboratory report.</p>`;
 }
 function markup(data,isRecipe=false){
  return `<section class="panel compact asafoetida-product-note"><h4>Asafoetida · grade-specific purity</h4><p>The 2011 Gazette and the 2025 FSSAI compendium give 11 purity limits across three grades. Select the grade on the supplier’s specification.</p>${isRecipe?'<p class="notice">Recipe 13.1 lists Hingu, oleoresin gum, at Q.S. Compounded Hing contains other ingredients; substitution is not established. Confirm botanical identity, supplied grade and adopted purity criteria.</p>':''}<label for="asafoetidaGrade">View a grade’s source limits</label><select id="asafoetidaGrade"><option value="">Select grade</option>${data.grades.map(g=>`<option value="${esc(g.id)}">${esc(g.label)}</option>`).join('')}</select><p id="asafoetidaGradeStatus" role="status" aria-live="polite">No grade selected. Reference only.</p><div id="asafoetidaGradeReference">${gradeMarkup(data,'')}</div><div id="hinguEvidence"></div><p>Purity limits do not establish contaminant limits, recipe eligibility or lot release. No product approval is made.</p><a class="source-ref" href="${esc(data.sources.gazette2011.url+'#page=116')}" target="_blank" rel="noopener noreferrer">Original Gazette · page 116 ↗</a><a class="source-ref" href="${esc(data.sources.spices2024.url+'#page=34')}" target="_blank" rel="noopener noreferrer">2024 compendium · pages 34–35 ↗</a>${isRecipe?`<a class="source-ref" href="${esc(data.sources.recipe2025.url+'#page=88')}" target="_blank" rel="noopener noreferrer">Recipe 13.1 · page 88 ↗</a>`:''}<a class="source-ref" href="${esc(data.report)}" target="_blank" rel="noopener noreferrer">Read the R76 source comparison ↗</a></section>`;
 }
 const api=Object.freeze({select,gradeMarkup,markup});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PMSVAsafoetida=api;
 if(typeof document==='undefined')return;
 document.addEventListener('change',event=>{
  if(event.target.id!=='asafoetidaGrade')return;
  const data=root.PMSV_REVIEW_REGISTER?.asafoetidaReview,chosen=select(data,event.target.value);
  document.getElementById('asafoetidaGradeReference').innerHTML=gradeMarkup(data,event.target.value);
  document.getElementById('hinguEvidence').innerHTML = root.PMSVHingu?.markup(root.PMSV_REVIEW_REGISTER?.hinguReview, event.target.value) || '';
  document.getElementById('asafoetidaGradeStatus').textContent=chosen?`${chosen.rows.length} source limits for ${chosen.grade.label}. Reference only; no product approval.`:'No grade selected. Reference only.';
 });
})(typeof globalThis==='object'?globalThis:this);
