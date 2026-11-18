/* Archived ingredient references; no identity authentication or food approval. */
(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const forms=Object.freeze({named:'Named species and part · dried material',other:'Different species or plant part',extract:'Essential oil or extract',unknown:'Mixed or unknown material'});
 function reviewScope(ingredient,form){
  const base={legalProductApproval:false,batchRelease:false,autoApplyLimits:false,identityResolved:false,concentrationMultiplierEstablished:false};
  if(!['hribera','chandana','ushira'].includes(ingredient))return {...base,status:'INGREDIENT_NOT_SELECTED',message:'Select a recipe ingredient. No species or plant part is inferred.'};
  if(typeof form!=='string'||!Object.hasOwn(forms,form))return {...base,status:'MATERIAL_NOT_SELECTED',message:'Select the actual material form to review its boundary. The table is an archived ingredient reference only.'};
  const decisions={named:['CANDIDATE_SOURCE_ONLY','Candidate source only. Confirm botanical identity, plant part, naming differences, provenance, adopted criteria, current amendments and methods. No product approval or analytical pass/fail is provided.'],other:['SPECIES_OR_PART_MISMATCH','These entries do not establish equivalence for a different species or plant part. Keep the actual identity separate from the recipe reference.'],extract:['OIL_OR_EXTRACT_SUBSTITUTION_OPEN','An essential oil or extract is not the listed dried plant part. A volatile-oil minimum in the botanical does not authorize that substitution or establish a finished-tea limit.'],unknown:['MATERIAL_IDENTITY_OPEN','Obtain species, plant part, composition and processing details. A common name or supplier label alone does not authenticate the material.']};
  const [status,message]=decisions[form];return {...base,status,message};
 }
 function referenceMarkup(data,id){
  const ingredient=data.ingredients.find(x=>x.id===id);if(!ingredient)return '';
  const rows=data.rows.filter(x=>x.ingredientId===id),identity=data.sources[ingredient.identitySourceId],entries=data.sources[ingredient.entriesSourceId];
  return `<p><b>FSSAI ingredient ${ingredient.ingredientSerial}:</b> ${esc(ingredient.name)} · ${esc(ingredient.botanicalLiteral)} · ${esc(ingredient.partLiteral)} · ${esc(ingredient.ratio)}.</p><p><b>Archived API:</b> ${esc(ingredient.monograph)} · ${esc(ingredient.apiBotanicalLiteral)} · ${esc(ingredient.apiPart)}.</p><p class="notice lajadi-identity-note">${esc(ingredient.identityNote)}</p><details class="lajadi-source-entries"><summary>View ${rows.length} archived purity entries</summary><div class="table-scroll" tabindex="0" role="region" aria-label="Archived botanical purity references"><table class="methodtable"><thead><tr><th scope="col">Parameter</th><th scope="col">Archived reference</th></tr></thead><tbody>${rows.map(r=>`<tr class="lajadi-reference-entry"><th scope="row">${esc(r.name)}</th><td>${esc(r.display)}<div class="lajadi-reference-note">${esc(r.method)}<br>${esc(r.basis)}</div></td></tr>`).join('')}</tbody></table></div><p>Ingredient references only. Alcohol strength and current method acceptance remain open. No food-dose, finished-tea limit or analytical pass/fail is calculated.</p><p class="muted">${esc(data.attribution)} <a href="${esc(data.licenseUrl)}" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.</p><a class="source-ref" href="${esc(identity.url)}" target="_blank" rel="noopener noreferrer">Identity scan · page ${identity.printedPage} ↗</a><a class="source-ref" href="${esc(entries.url)}" target="_blank" rel="noopener noreferrer">Purity scan · page ${entries.printedPage} ↗</a></details>`;
 }
 function markup(data){
  return `<section class="panel compact lajadi-product-note"><h4>Lajadi Kashaya · botanical source scope</h4><p>Recipe 12.1 lists three botanicals. Select one to compare its species, plant part and archived API Part I, Volume III (2001) references.</p><label for="lajadiIngredient">Recipe ingredient</label><select id="lajadiIngredient"><option value="">Select ingredient</option>${data.ingredients.map(i=>`<option value="${esc(i.id)}">${esc(i.name)} · ${esc(i.partLiteral)}</option>`).join('')}</select><label for="lajadiMaterial">Actual material form</label><select id="lajadiMaterial" disabled><option value="">Select material form</option>${Object.entries(forms).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select><p id="lajadiScopeResult" role="status" aria-live="polite">${esc(reviewScope('','').message)}</p><div id="lajadiReference"></div><div id="lajadiJuniper"></div><p>The recipe reduces water to one-eighth. This does not establish an eightfold contaminant multiplier; total mass and analyte transfer remain unverified. Current amendments and ingredient applicability remain open.</p><a class="source-ref" href="${esc(data.sources.recipe2025.url+'#page=84')}" target="_blank" rel="noopener noreferrer">FSSAI recipe 12.1 ↗</a><a class="source-ref" href="${esc(data.report)}" target="_blank" rel="noopener noreferrer">Read the R78 botanical review ↗</a></section>`;
 }
 const api=Object.freeze({reviewScope,referenceMarkup,markup});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PMSVLajadiBotanicals=api;
 if(typeof document==='undefined')return;
 document.addEventListener('change',event=>{
  if(!['lajadiIngredient','lajadiMaterial'].includes(event.target.id))return;
  const ingredient=document.getElementById('lajadiIngredient'),material=document.getElementById('lajadiMaterial');
  if(event.target.id==='lajadiIngredient'){
   material.value='';material.disabled=!ingredient.value;
   document.getElementById('lajadiReference').innerHTML=referenceMarkup(root.PMSV_REVIEW_REGISTER.lajadiBotanicalReview,ingredient.value);
  }
  document.getElementById('lajadiJuniper').innerHTML = root.PMSVJuniperSpice?.scopeMarkup(ingredient.value, material.value) || '';
  document.getElementById('lajadiScopeResult').textContent=reviewScope(ingredient.value,material.value).message;
 });
})(typeof globalThis==='object'?globalThis:this);
