(()=>{const KEY='pmsvFssaiAudits';
const typeMap={
 'general-manufacturing.html':'General Manufacturing','milk-processing.html':'Milk Processing','meat-processing.html':'Meat Processing',
 'fish-processing.html':'Fish & Fish Products Processing','slaughter-house.html':'Slaughter House','catering.html':'Catering',
 'retail.html':'Retail','transport.html':'Transport','storage-warehouse.html':'Storage & Warehouse'
};
function rows(){return [...document.querySelectorAll('tbody tr[data-n]')]}
function currentType(){return typeMap[location.pathname.split('/').pop()]||document.querySelector('header h1')?.textContent?.trim()||'FSSAI Inspection'}
function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function put(all){localStorage.setItem(KEY,JSON.stringify(all))}
function markRows(){rows().forEach(r=>{r.classList.remove('answered','answer-C','answer-PC','answer-NC','answer-NA');const v=r.querySelector('select')?.value||'';if(v)r.classList.add('answered','answer-'+v)})}
function metaObject(){const o={};document.querySelectorAll('.meta input,.meta select').forEach(e=>{if(e.id)o[e.id]=e.value});return o}
function itemObject(r){const cells=r.children,no=r.dataset.n||cells[0]?.textContent?.replace('*','').trim();return{no,question:cells[1]?.textContent?.trim()||'',max:Number(cells[2]?.textContent?.trim())||0,critical:r.classList.contains('crit')||r.classList.contains('critical'),status:r.querySelector('select')?.value||'',comment:r.querySelector('textarea')?.value||''}}
function saveDraft(btn){
 const all=list(),p=new URLSearchParams(location.search);let id=p.get('draft')||'insp-'+Date.now(),m=metaObject(),type=currentType();
 const rec={id,status:'Draft',type,businessType:type,date:m.date||'',fbo:m.fbo||m.fboName||'',fboName:m.fbo||m.fboName||'',auditor:m.auditor||'',license:m.lic||m.license||'',address:m.address||'',meta:m,items:rows().map(itemObject),savedAt:new Date().toISOString()};
 const i=all.findIndex(x=>x.id===id);i>=0?all[i]=rec:all.unshift(rec);put(all);
 if(!p.get('draft')){p.set('draft',id);history.replaceState(null,'',location.pathname+'?'+p.toString())}
 if(btn){btn.textContent='Saved ✓';setTimeout(()=>btn.textContent='Save Draft',1300)}
}
function restore(){
 const id=new URLSearchParams(location.search).get('draft');if(!id)return;const d=list().find(x=>x.id===id);if(!d)return;
 const m=d.meta||{};Object.entries(m).forEach(([k,v])=>{const e=document.getElementById(k);if(e)e.value=v??''});
 if(!Object.keys(m).length){[['date',d.date],['fbo',d.fbo||d.fboName],['auditor',d.auditor],['lic',d.license],['address',d.address]].forEach(([k,v])=>{const e=document.getElementById(k);if(e)e.value=v||''})}
 (d.items||[]).forEach(x=>{const r=document.querySelector('tr[data-n="'+x.no+'"]');if(!r)return;const s=r.querySelector('select'),t=r.querySelector('textarea');if(s){s.value=x.status||'';s.dispatchEvent(new Event('change',{bubbles:true}))}if(t)t.value=x.comment||''});markRows()
}
function reset(){
 if(!confirm('Reset this audit? All current entries will be cleared.'))return;
 document.querySelectorAll('.meta input').forEach(e=>{e.value=e.type==='date'?new Date().toISOString().slice(0,10):''});
 rows().forEach(r=>{const s=r.querySelector('select'),t=r.querySelector('textarea');if(s){s.value='';s.dispatchEvent(new Event('change',{bubbles:true}))}if(t)t.value=''});markRows();
 const p=new URLSearchParams(location.search);if(p.has('draft')){p.delete('draft');history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''))}
}
function removeLegacy(main,tw,finish){[...main.children].forEach(e=>{if(e===tw||e===finish||e.classList?.contains('meta')||e.classList?.contains('actions')||e.classList?.contains('pmsv-rules')||e.classList?.contains('grade-bottom'))return;const t=(e.textContent||'').trim();if(e.classList?.contains('rules-top')||e.classList?.contains('rules-bottom')||e.id==='inspectionScoringTop'||((/Scoring|Scoring System/i.test(t))&&/Compliance|marks|full marks/i.test(t))||((/Grade|Grading|Grade Interpretation|Rating \/ Grading/i.test(t))&&/%|Compliance|Exemplar|Satisfactory|No Grade/i.test(t)))e.remove()})}
function init(){
 const main=document.querySelector('main'),tw=main?.querySelector('.tablewrap'),finish=document.getElementById('finish'),bar=document.querySelector('.scorebar,.score');if(!main||!tw||!bar)return;
 bar.classList.add('scorebar');const rws=rows(),w=bar.querySelector('.wrap')||bar;
 const ans=document.getElementById('ans'),score=document.getElementById('score'),max=document.getElementById('max'),pct=document.getElementById('pct'),grade=document.getElementById('grade'),cnc=document.getElementById('cnc');
 const chip=(cls,label,...nodes)=>{const el=document.createElement('span');el.className='score-chip '+cls;el.append(document.createTextNode(label));nodes.forEach(n=>{if(n)el.appendChild(n)});return el};
 if(!w.querySelector('.score-chip')){
  w.innerHTML='';const answered=chip('answered-chip','Answered ',ans);answered.append('/'+rws.length);
  const scoreChip=chip('score-value-chip','Score ',score);scoreChip.append('/');if(max)scoreChip.appendChild(max);scoreChip.append(' (');if(pct)scoreChip.appendChild(pct);scoreChip.append(')');
  const gradeChip=chip('grade-chip','Grade ',grade);const crit=chip('critical-chip','Critical NC ',cnc);crit.classList.add('critical-ribbon');w.append(answered,scoreChip,gradeChip,crit);
 }
 let save=w.querySelector('.pmsv-draft'),rst=w.querySelector('.pmsv-reset');
 if(!save){save=document.createElement('button');save.className='pmsv-draft';save.textContent='Save Draft';w.appendChild(save)}
 if(!rst){rst=document.createElement('button');rst.className='pmsv-reset';rst.textContent='Reset';w.appendChild(rst)}
 save.onclick=()=>saveDraft(save);rst.onclick=reset;
 removeLegacy(main,tw,finish);
 if(!main.querySelector('.pmsv-rules')){const scoring=document.createElement('section');scoring.className='pmsv-rules';scoring.innerHTML='<h3>Scoring Table</h3><table class="rules-table"><thead><tr><th>Assessment</th><th>Normal Requirement</th><th>Critical Requirement (*)</th></tr></thead><tbody><tr><td><b>C — Compliance</b></td><td>2 marks</td><td>4 marks</td></tr><tr><td><b>PC — Partial Compliance</b></td><td>1 mark</td><td>Not permitted</td></tr><tr><td><b>NC — Non-Compliance</b></td><td>0 marks</td><td>0 marks</td></tr><tr><td><b>NA — Not Applicable</b></td><td colspan="2">Excluded from applicable maximum</td></tr></tbody></table>';main.insertBefore(scoring,tw)}
 if(!main.querySelector('.grade-bottom')){const gradeBlock=document.createElement('section');gradeBlock.className='grade-bottom';gradeBlock.innerHTML='<h3>Rating / Grading Table</h3><table class="rules-table"><thead><tr><th>Score</th><th>Grade</th><th>Result</th></tr></thead><tbody><tr><td>90% and above</td><td><b>A+</b></td><td>Compliance – Exemplar</td></tr><tr><td>80% to &lt;90%</td><td><b>A</b></td><td>Compliance – Satisfactory</td></tr><tr><td>50% to &lt;80%</td><td><b>B</b></td><td>Needs Improvement</td></tr><tr><td>Below 50%</td><td><b>No Grade</b></td><td>Non Compliance</td></tr></tbody></table><div class="critical-note">Any NC against a Critical (*) requirement results in Non Compliance / No Grade irrespective of percentage score.</div>';finish?main.insertBefore(gradeBlock,finish):main.appendChild(gradeBlock)}
 const back=document.querySelector('header a');if(back)back.href='fssai-inspection-app.html';
 rws.forEach(r=>r.querySelector('select')?.addEventListener('change',markRows));restore();markRows()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();