/* Archived source aid. No purity result, food-use dose or recipe approval. */
(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const materials=Object.freeze({cinnamomum:'Natural · Cinnamomum camphora',ocimum:'Natural · Ocimum kilimandscharicum',synthetic:'Synthetic / racemic camphor',unknown:'Source or composition unknown'});
 function reviewScope(recipe,material){
  const base={legalProductApproval:false,batchRelease:false,autoApplyLimits:false,foodDoseEstablished:false};
  if(!['14.5','14.6'].includes(recipe))return {...base,status:'UNSUPPORTED_RECIPE',message:'No camphor source mapping for this recipe.'};
  if(recipe==='14.6')return {...base,status:'OFFICIAL_RECIPE_ALIGNMENT_HOLD',message:'Recipe 14.6 remains on hold for every material choice. Karpura is method-only and absent from its ingredient table; this reference cannot resolve the source discrepancy.'};
  if(typeof material!=='string'||!Object.hasOwn(materials,material))return {...base,status:'MATERIAL_NOT_SELECTED',message:'Select a material source to see the recipe boundary. No material is inferred.'};
  const decisions={
   cinnamomum:['CANDIDATE_SOURCE_ONLY','The species name also appears in recipe 14.5. Confirm botanical authority, provenance, extraction, food-use grade, adopted purity criteria, current methods and safe use quantity. This is a source lead, not approval.'],
   ocimum:['RECIPE_SPECIES_SUBSTITUTION_OPEN','The archived monograph names Ocimum, but recipe 14.5 names Cinnamomum camphora. This monograph does not authorize that recipe substitution.'],
   synthetic:['SYNTHETIC_SUBSTITUTION_OPEN','The monograph describes synthetic camphor as racemic and optically inactive. It does not establish equivalence to the natural material or permission to use it in recipe 14.5.'],
   unknown:['MATERIAL_IDENTITY_OPEN','Obtain the actual botanical or synthetic source, composition and grade before selecting a purity reference. A common name or supplier label alone does not resolve identity.']
  };
  const [status,message]=decisions[material];return {...base,status,message};
 }
 function markup(data,note){
  const initial=reviewScope(note.recipeNumber,'');
  return `<section class="panel compact camphor-product-note"><h4>Karpura · natural-camphor source scope</h4><p>Archived API Part I, Volume VI, first edition 2008, pages 210–211. Current amendments, method acceptance and food-use safety remain open.</p><p class="notice">${note.recipeAlignmentHold?'Recipe 14.6: Karpura appears in the method, not its 13-row ingredient table. The official-recipe alignment hold remains.':'Recipe 14.5: ingredient 5 names Cinnamomum camphora, “Sub. extract”, at Q.S. The medicinal dose and assay purity are not food-use limits.'}</p><label for="camphorMaterial">Material source to review</label><select id="camphorMaterial" data-recipe="${esc(note.recipeNumber)}"><option value="">Select material source</option>${Object.entries(materials).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select><p id="camphorScopeResult" role="status" aria-live="polite">${esc(initial.message)}</p><details class="camphor-source-entries"><summary>View five archived source entries</summary><p>The monograph names Cinnamomum leaves, chipped wood and roots, and Ocimum whole plant, with hydrodistillation. The FSSAI recipe does not automatically inherit that wider scope.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Archived natural-camphor references"><table class="methodtable"><thead><tr><th scope="col">Entry</th><th scope="col">Archived reference</th></tr></thead><tbody>${data.rows.map(r=>`<tr class="camphor-reference-entry"><th scope="row">${esc(r.name)}</th><td>${esc(r.display)}<div class="camphor-reference-note">${esc(r.method)}</div></td></tr><tr><td colspan="2">${esc(r.note)}</td></tr>`).join('')}</tbody></table></div><p>The optical-rotation entry is kept exactly as printed. The pesticide appendix pointer is not an FSSAI MRL. These entries provide no analytical pass/fail or food-dose calculation.</p><p class="muted">${esc(data.attribution)} <a href="${esc(data.licenseUrl)}" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.</p><a class="source-ref" href="${esc(data.sources.monograph210.url)}" target="_blank" rel="noopener noreferrer">Original scan · page 210 ↗</a><a class="source-ref" href="${esc(data.sources.monograph211.url)}" target="_blank" rel="noopener noreferrer">Original scan · page 211 ↗</a></details><a class="source-ref" href="${esc(data.sources.recipe2025.url+'#page='+note.pdfPages[0])}" target="_blank" rel="noopener noreferrer">FSSAI recipe ${esc(note.recipeNumber)} ↗</a><a class="source-ref" href="${esc(data.report)}" target="_blank" rel="noopener noreferrer">Read the R77 source review ↗</a></section>`;
 }
 const api=Object.freeze({reviewScope,markup});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PMSVCamphor=api;
 if(typeof document==='undefined')return;
 document.addEventListener('change',event=>{
  if(event.target.id!=='camphorMaterial')return;
  const result=reviewScope(event.target.dataset.recipe,event.target.value);
  document.getElementById('camphorScopeResult').textContent=result.message;
 });
})(typeof globalThis==='object'?globalThis:this);
