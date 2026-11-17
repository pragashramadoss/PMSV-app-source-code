/* Searchable source reference only; no analytical or release decision. */
(function(root){
 'use strict';
 const groups=Object.freeze({'all':'All entries','1':'Physical / organoleptic','2':'General chemical','3':'Toxic substances','4':'Radioactive activity','5':'Pesticides','6':'Bacteriology','clauses':'MS2 / protozoa'});
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function filter(data,query='',group='all'){
  if(!data||!Array.isArray(data.rows)||typeof query!=='string'||!Object.hasOwn(groups,group))return [];
  const q=query.trim().toLocaleLowerCase('en');
  return data.rows.filter(r=>(group==='all'||String(r.table)===group)&&[r.name,r.id,r.unit,r.methodReference,r.scopeNote].some(v=>String(v||'').toLocaleLowerCase('en').includes(q)));
 }
 function rowMarkup(r,d){
  const source=d.sources[r.source.id],label=r.table==='clauses'?'Clause '+r.serial:'Table '+r.table+' · '+r.serial;
  const relation={max:'max',min:'min',range:'range',qualitative:'qualitative',pointer:'pointer',absence:'absence'}[r.operator];
  return `<tr><th scope="row">${esc(r.name)}<small>${esc(r.unit)} · ${relation}</small></th><td>${esc(r.acceptable)}</td><td>${esc(r.permissible)}</td><td>${r.scopeNote?`<p>${esc(r.scopeNote)}</p>`:''}<small>${esc(r.methodReference)}</small><a class="source-ref" href="${esc(source.url+'#page='+r.source.pdfPage)}" target="_blank" rel="noopener noreferrer">${esc(label)} · PDF ${r.source.pdfPage} ↗</a>${r.amendments.map(id=>`<a class="source-ref" href="${esc(d.sources[id].url)}" target="_blank" rel="noopener noreferrer">Amendment ${esc(id.slice(-1))} ↗</a>`).join('')}</td></tr>`;
 }
 function markup(d){
  return `<details class="water-standard-reference"><summary>Search 74 IS 10500 source entries</summary><p>Tables 1–6 and relevant clauses, reconciled with four BIS amendments. These are water-standard references; they do not approve a water supply or a finished food.</p><p class="notice">Use the acceptable reference first. Higher permissible values depend on absence of an alternative source and any extra conditions. The iron–manganese wording remains open. The minimum chlorine row is not a maximum limit.</p><div class="form-grid"><div><label for="waterReferenceSearch">Find a parameter or condition</label><input type="search" id="waterReferenceSearch" placeholder="e.g. uranium, magnesium, µg/L"></div><div><label for="waterReferenceGroup">Source group</label><select id="waterReferenceGroup">${Object.entries(groups).map(([key,label])=>`<option value="${key}"${key==='all'?' selected':''}>${esc(label)}</option>`).join('')}</select></div></div><p id="waterReferenceCount" role="status" aria-live="polite">74 of 74 reference entries</p><div class="table-scroll" tabindex="0" role="region" aria-label="IS 10500 source entries"><table class="methodtable water-reference-table"><thead><tr><th scope="col">Parameter / basis</th><th scope="col">Acceptable / requirement</th><th scope="col">Permissible / relaxation</th><th scope="col">Scope, method and source</th></tr></thead><tbody id="waterReferenceRows">${d.rows.map(r=>rowMarkup(r,d)).join('')}</tbody></table></div><p>Counts include a pesticide pointer and repeated bacteria entries for different water-system scopes. Tables 2–3 also allow approved, validated international methods under amendment 3; the listed referee methods apply to disputes. Referenced method editions, laboratory validation and full FSSAI applicability still require review.</p><a class="source-ref" href="${esc(d.report)}" target="_blank" rel="noopener noreferrer">Read the R75 source comparison ↗</a></details>`;
 }
 const api=Object.freeze({filter,markup});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PMSVWaterStandard=api;
 if(typeof document==='undefined')return;
 function render(event){
  if(!['waterReferenceSearch','waterReferenceGroup'].includes(event.target.id))return;
  const d=root.PMSV_REVIEW_REGISTER?.waterStandardReview,query=document.getElementById('waterReferenceSearch').value,group=document.getElementById('waterReferenceGroup').value;
  const rows=filter(d,query,group);
  document.getElementById('waterReferenceCount').textContent=`${rows.length} of 74 reference entries`;
  document.getElementById('waterReferenceRows').innerHTML=rows.length?rows.map(r=>rowMarkup(r,d)).join(''):'<tr><td colspan="4">No source entries match. Clear the search or choose another group.</td></tr>';
 }
 document.addEventListener('input',render);document.addEventListener('change',render);
})(typeof globalThis==='object'?globalThis:this);
