(()=>{const KEY='pmsvHygieneRatingAudits';
function rows(){return [...document.querySelectorAll('tbody tr[data-n]')]}
function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function markRows(){rows().forEach(r=>{r.classList.remove('answered','answer-C','answer-PC','answer-NC','answer-NA');const v=r.querySelector('select')?.value||'';if(v)r.classList.add('answered','answer-'+v)})}
function currentType(){const p=location.pathname.split('/').pop();return p.includes('sweet')?'Sweet Shop':p.includes('meat')?'Meat Retail':'Food Service Establishment / Bakery'}
function findLatest(){const type=currentType().toLowerCase();return list().filter(x=>(x.businessType||'').toLowerCase().includes(type.includes('sweet')?'sweet':type.includes('meat')?'meat':'food')).sort((a,b)=>new Date(b.savedAt||0)-new Date(a.savedAt||0))[0]}
function setDraftUrl(id){if(!id)return;const p=new URLSearchParams(location.search);if(p.get('draft')!==id){p.set('draft',id);history.replaceState(null,'',location.pathname+'?'+p.toString())}}
function restore(){
 const id=new URLSearchParams(location.search).get('draft');if(!id)return;const d=list().find(x=>x.id===id);if(!d)return;
 [['date',d.date],['fbo',d.fbo],['outlet',d.outlet],['address',d.address],['lic',d.license],['fss',d.fss],['fssCode',d.fssCode],['auditor',d.auditor]].forEach(([k,v])=>{const e=document.getElementById(k);if(e)e.value=v||''});
 (d.items||[]).forEach(x=>{const r=document.querySelector('tr[data-n="'+x.no+'"]');if(!r)return;const s=r.querySelector('select'),t=r.querySelector('textarea');if(s){s.value=x.status||'';s.dispatchEvent(new Event('change',{bubbles:true}))}if(t)t.value=x.comment||''});markRows()
}
function resetGeneric(){
 if(!confirm('Reset this audit? All current entries will be cleared.'))return;
 document.querySelectorAll('.meta input').forEach(e=>e.value=e.type==='date'?new Date().toISOString().slice(0,10):'');
 rows().forEach(r=>{const s=r.querySelector('select'),t=r.querySelector('textarea');if(s){s.value='';s.dispatchEvent(new Event('change',{bubbles:true}))}if(t)t.value=''});markRows();
 const p=new URLSearchParams(location.search);if(p.has('draft')){p.delete('draft');history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''))}
}
function removeLegacy(main,tw,actions,finish){[...main.children].forEach(e=>{if(e===tw||e===actions||e===finish||e.classList?.contains('meta'))return;const t=(e.textContent||'').trim();if(e.classList?.contains('hyg-rules')||e.classList?.contains('scoring')||e.classList?.contains('scoring-card')||e.classList?.contains('score-rules')||e.classList?.contains('rating-bottom')||((/Scoring|Scoring System/i.test(t))&&/Compliance|marks|full marks/i.test(t))||((/Hygiene Rating/i.test(t))&&/Excellent|Very Good|Poor|Urgent Improvement/i.test(t)))e.remove()})}
function init(){
 const main=document.querySelector('main'),tw=main?.querySelector('.tablewrap'),bar=document.querySelector('.scorebar,.score'),finish=document.getElementById('finish');if(!main||!tw||!bar)return;
 const actions=main.querySelector('.actions'),nativeSave=document.getElementById('save'),nativeReset=document.getElementById('reset'),rws=rows(),w=bar.querySelector('.wrap')||bar;
 bar.classList.add('scorebar');const ans=document.getElementById('ans'),score=document.getElementById('score'),max=document.getElementById('max'),pct=document.getElementById('pct'),rating=document.getElementById('rating')||document.getElementById('ratingOut'),cnc=document.getElementById('cnc');
 if(nativeSave)nativeSave.style.display='none';if(nativeReset)nativeReset.style.display='none';w.innerHTML='';const add=t=>w.appendChild(document.createTextNode(t));
 add('Answered ');if(ans)w.appendChild(ans);add('/'+rws.length+' · Score ');if(score)w.appendChild(score);add('/');if(max)w.appendChild(max);add(' (');if(pct)w.appendChild(pct);add(') · Rating ');if(rating)w.appendChild(rating);add(' · ');
 const crit=document.createElement('span');crit.className='critical-ribbon';crit.append('Critical NC ');if(cnc)crit.appendChild(cnc);w.appendChild(crit);
 const saveBtn=document.createElement('button');saveBtn.className='pmsv-draft';saveBtn.textContent='Save Draft';const resetBtn=document.createElement('button');resetBtn.className='pmsv-reset';resetBtn.textContent='Reset';w.append(saveBtn,resetBtn);
 saveBtn.onclick=()=>{if(nativeSave){nativeSave.click();setTimeout(()=>{const d=findLatest();if(d)setDraftUrl(d.id)},0);saveBtn.textContent='Saved ✓';setTimeout(()=>saveBtn.textContent='Save Draft',1300)}};
 resetBtn.onclick=resetGeneric;
 removeLegacy(main,tw,actions,finish);
 const top=document.createElement('section');top.className='hyg-rules';top.innerHTML='<h3>Scoring</h3><table class="rules-table"><thead><tr><th>Assessment</th><th>Normal Requirement</th><th>Critical Requirement (*)</th></tr></thead><tbody><tr><td><b>C — Compliance</b></td><td>2 marks</td><td>4 marks</td></tr><tr><td><b>PC — Partial Compliance</b></td><td>1 mark</td><td>Not permitted</td></tr><tr><td><b>NC — Non-Compliance</b></td><td>0 marks</td><td>0 marks</td></tr><tr><td><b>NA — Not Applicable</b></td><td colspan="2">Excluded from applicable maximum</td></tr></tbody></table>';main.insertBefore(top,tw);
 const ratingBlock=document.createElement('section');ratingBlock.className='rating-bottom';ratingBlock.innerHTML='<h3>Hygiene Rating</h3><table class="rating-table"><thead><tr><th>Rating</th><th>Category</th><th>Percentage Score</th></tr></thead><tbody><tr><td>5</td><td>Excellent</td><td>81–100%</td></tr><tr><td>4</td><td>Very Good</td><td>61–80%</td></tr><tr><td>3</td><td>Good</td><td>41–60%</td></tr><tr><td>2</td><td>Needs Improvement</td><td>21–40%</td></tr><tr><td>1</td><td>Poor</td><td>20% or below</td></tr></tbody></table><div class="critical-note">Failure of any Critical (*) requirement results in Non-Compliance and no Hygiene Rating.</div>';actions?main.insertBefore(ratingBlock,actions):finish?main.insertBefore(ratingBlock,finish):main.appendChild(ratingBlock);
 const back=document.querySelector('header a');if(back)back.href='hygiene-rating-new.html';
 rws.forEach(r=>r.querySelector('select')?.addEventListener('change',markRows));restore();markRows()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();