/* Compare one lot with its SKU-specific site master and independently transcribed declarations. */
(function(root){
  'use strict';
  const law='https://www.fssai.gov.in/docs/food-law/regulations/Comp_Labelling%20Display_Version%20VIII_09_09_2025.pdf';
  const faq='https://www.fssai.gov.in/upload/uploadfiles/files/FAQ_Labelling_Display_01_11_2023.pdf';
  const sources={batch:law+'#page=2',licence:law+'#page=16',barcode:law+'#page=22',small:law+'#page=21',
    operator:faq+'#page=5',continuation:faq+'#page=6',qr:faq+'#page=7',
    format:'https://www.fssai.gov.in/upload/uploadfiles/files/FAQs_Licensing_Registration_26_07_2022.pdf',
    search:'https://foscos.fssai.gov.in/advance-fbo-search'};
  const columns=['Batch and manufacturing-site sources','Current batch and site comparison','Saved batch and site check count','Saved batches, site evidence and artwork findings'];
  const fields=['sku','art','pack','batch','width','masterRef','master','role','recordRef','recordLicence','printState','printList','qrState','qrList','scanRef','outerState','outerList','outerRef'];
  const roles={different:'The site operator differs from the brand owner',owner:'The site operator is the brand owner'};
  const printStates={list:'Licence information transcribed',absent:'No operator licence found'};
  const qrStates={list:'Operator licence information read from the code',generic:'Code leads to general information only',unreadable:'Code could not be read',absent:'No code on this pack'};
  const siteStates=new Set(['approved','retired','excluded']);
  const channels={print:'Printed artwork',qr:'Decoded QR or barcode',outer:'Retail multi-unit outer'};
  const clean=x=>typeof x==='string'?x.trim():'';
  const own=(o,k)=>Object.hasOwn(o,k);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const names=()=>root.PMSVIngredientPercentage.packLabels;
  function model(input){
    const m={type:'batchSite'};
    for(const k of fields)m[k]=clean(input?.[k]);
    return m;
  }
  function draft(state){try{return model(JSON.parse(state?.batchSiteDraft||'null'));}catch(_){return model();}}
  const identityParts=m=>[m.sku,m.art,m.pack,'batch-site',m.batch].map(clean);
  const sourceText=[sources.batch,sources.licence,sources.barcode,sources.qr,sources.format,sources.search].join(' | ');
  const current=(groups,id)=>groups?.get(id)||[];
  const saved=(groups,id)=>current(groups,id).filter(r=>r.m.type==='batchSite');
  const lines=text=>clean(text).split(/\r\n|\r|\n/).map(clean).filter(Boolean);
  // The delimiter is chosen per line, so a block copied from a spreadsheet works unchanged.
  const cells=line=>line.split(line.includes('\t')?'\t':'|').map(clean);
  const widthOf=value=>/^[1-9]\d*$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):null;
  const length=s=>Array.from(s).length;
  function issueWithNumber(n){
    if(/^1[0-9]{13}$/.test(n))return '';
    return /^2[0-9]{13}$/.test(n)?'The number has the format of an FSSAI registration. Check the applicable registration route separately.':
      'Enter the 14 digits of the FSSAI licence, beginning with 1, as printed in the source.';
  }
  function readMaster(m,width,add){
    const map=new Map(),activeSites=new Map();
    const rows=lines(m.master);
    if(!m.masterRef)add('open','SKU site master','Identify the approved SKU/site list and revision applicable to this lot.');
    if(!rows.length)add('open','SKU site master','Enter the reference site rows for this SKU.');
    for(const [i,line] of rows.entries()){
      const c=cells(line),[prefix,site,licence,stateText]=c,state=clean(stateText).toLowerCase();
      const ref='Site master row '+(i+1);
      if(c.length!==4||!prefix||!site||!siteStates.has(state)){
        add('open',ref,'Expected four fields: prefix, site, licence and approved/retired/excluded status.');continue;
      }
      if(width&&length(prefix)!==width)add('open',ref,'Prefix '+prefix+' has a different length from the documented prefix width.');
      if(state==='approved'||licence){
        const problem=issueWithNumber(licence);if(problem)add('open',ref,site+' · '+problem);
      }
      if(state==='approved'&&!issueWithNumber(licence)){
        const previous=activeSites.get(licence);
        if(previous&&previous.toLowerCase()!==site.toLowerCase())add('review',ref,'The same licence is assigned to '+previous+' and '+site+'. Confirm the premises or site aliases in the master.');
        else activeSites.set(licence,site);
      }
      const records=map.get(prefix)||[];
      records.push({prefix,site,licence,state});map.set(prefix,records);
      if(records.length===2)add('difference',ref,'Duplicate prefix '+prefix+' in the SKU master. Resolve its site assignment.');
    }
    return map;
  }
  function readLegend(text,channel,width,map,expected,add){
    const rows=lines(text).map(cells);
    if(!rows.length){add('open',channel,'Transcribe the licence information for this operator from this source.');return false;}
    if(rows.length===1&&rows[0].length===1){
      const value=rows[0][0],problem=issueWithNumber(value);
      if(problem){add('open',channel,problem);return false;}
      if(!expected)return false;
      if(value!==expected.licence){add('difference',channel,'The declared operator licence '+value+' differs from '+expected.licence+' for '+expected.site+'.');return false;}
      add('observation',channel,'The single operator licence '+value+' agrees with '+expected.site+'.');return true;
    }
    const byPrefix=new Map();
    for(const [i,c] of rows.entries()){
      const [prefix,licence]=c;
      if(c.length!==2||!prefix||!licence){
        add('open',channel,'Row '+(i+1)+' needs a site prefix and licence. Multiple numbers require an explicit mapping.');continue;
      }
      const count=(byPrefix.get(prefix)?.count||0)+1;byPrefix.set(prefix,{licence,count});
      if(count===2)add('difference',channel,'Prefix '+prefix+' appears more than once in this legend.');
      if(width&&length(prefix)!==width)add('difference',channel,'Prefix '+prefix+' differs from the documented prefix length.');
      const problem=issueWithNumber(licence);
      if(problem)add('open',channel,'Prefix '+prefix+' · '+problem);
      const matches=map.get(prefix)||[];
      if(!matches.length){if(map.size)add('review',channel,'Prefix '+prefix+' is absent from the supplied SKU master. Confirm the master or correct the legend.');continue;}
      if(matches.length!==1)continue;
      const entry=matches[0];
      if(entry.state!=='approved')add('difference',channel,'The legend includes '+entry.state+' code '+prefix+' ('+entry.site+') for this SKU.');
      if(!problem&&entry.licence&&!issueWithNumber(entry.licence)&&licence!==entry.licence)
        add('difference',channel,'Prefix '+prefix+' shows '+licence+'; the master gives '+entry.licence+' for '+entry.site+'.');
    }
    if(!expected)return false;
    const chosen=byPrefix.get(expected.prefix);
    if(!chosen){add('difference',channel,'The legend has no entry for the selected batch prefix '+expected.prefix+'.');return false;}
    if(chosen.count===1&&chosen.licence===expected.licence){
      add('observation',channel,'Prefix '+expected.prefix+' and licence '+chosen.licence+' agree with '+expected.site+'.');return true;
    }
    return false;
  }
  function linkedPlacement(m,records){
    const s=records.find(r=>r.m.type==='smallPack'&&r.m.sku===m.sku&&r.m.art===m.art&&r.m.pack===m.pack)?.m;
    if(!s||m.pack!=='inner'||!own(roles,m.role)||!m.outerRef||s.outerRef!==m.outerRef)return '';
    if(s.operator!==(m.role==='owner'?'same':'different'))return '';
    const field=m.role==='owner'?'ownerLic':'siteLic',calc=root.PMSVSmallPack.analyse(s),row=calc.rows.find(r=>r.key===field);
    if(row?.route!=='transfer'||!['outer','both'].includes(s.seen[field])||!s.measureRef)return '';
    return calc.area.text+' · '+s.measureRef+' · '+s.outerRef;
  }
  function analyse(input,records=[]){
    const m=model(input);
    const findings=[],a={prefix:'',site:'',licence:'',placement:'',status:'Evidence needed',findings};
    const add=(kind,source,text)=>findings.push({kind,source,text});
    if(m.pack==='nonretail'){a.status='Use the non-retail container review';add('review','Pack','Check the container under regulation 10. This comparison covers retail artwork.');return a;}
    if(!m.sku||!m.art||!own(names(),m.pack))add('open','Artwork','Identify the SKU, artwork revision and retail pack.');
    if(!own(roles,m.role))add('open','Operator','Identify whether the site operator is also the brand owner.');
    const width=widthOf(m.width),chars=Array.from(m.batch);
    if(!width)add('open','Batch prefix','Enter the positive whole-number prefix length used in the approved coding instruction.');
    if(!m.batch||(width&&chars.length<width))add('open','Batch prefix','Enter the complete printed lot code with enough characters for the specified prefix.');
    else if(width)a.prefix=chars.slice(0,width).join('');
    const map=readMaster(m,width,add);
    const matches=map.get(a.prefix)||[];
    let expected=null;
    if(a.prefix&&map.size){
      if(!matches.length)add('review','Batch prefix','No exact assignment for '+a.prefix+' in the supplied SKU master. Check case, leading zeros, SKU and revision.');
      if(matches.length===1){
        const entry=matches[0];a.site=entry.site;a.licence=entry.licence;
        if(entry.state!=='approved')add('difference','Batch prefix','Batch '+m.batch+' resolves to '+entry.state+' code '+a.prefix+' ('+entry.site+') for this SKU.');
        else if(!issueWithNumber(entry.licence))expected=entry;
      }
    }
    if(!m.recordRef)add('open','Batch record','Give the production or packing record reference for this lot.');
    const numberProblem=issueWithNumber(m.recordLicence);
    if(numberProblem)add('open','Batch record',numberProblem);
    else if(expected){
      if(m.recordLicence!==expected.licence)add('difference','Batch record','The lot record names licence '+m.recordLicence+'; the SKU master assigns '+expected.licence+' to '+expected.site+'.');
      else add('observation','Batch record','The record licence '+m.recordLicence+' agrees with the site assigned to this prefix.');
    }
    let printed=false,viaCode=false,outer=false;
    if(m.printState==='list')printed=readLegend(m.printList,channels.print,width,map,expected,add);
    if(m.qrState==='list'){
      viaCode=readLegend(m.qrList,channels.qr,width,map,expected,add);
      if(!m.scanRef)add('open',channels.qr,'Record the decoded content or scan evidence for this artwork and batch.');
      if(m.role==='owner'&&m.printState==='absent')add('note',channels.qr,'Regulation 8(5)(b) covers the different operator’s licence. Check the brand owner’s licence placement separately.');
    }else if(m.qrState==='generic'||m.qrState==='unreadable')add('note',channels.qr,qrStates[m.qrState]+'. It supplies no licence evidence for this lot.');
    if(m.pack==='inner'&&m.outerState==='list'){
      outer=readLegend(m.outerList,channels.outer,width,map,expected,add);
      if(!m.outerRef)add('open',channels.outer,'Give the matching retail outer artwork revision.');
    }
    const usableCode=viaCode&&!!m.scanRef&&m.role==='different';
    if(!printed&&!usableCode){
      if(outer){
        a.placement=linkedPlacement(m,records);
        add('review','Small-pack placement',a.placement?'Matching small-pack review: '+a.placement+'. Outer-only licence placement carries the English/Hindi wording note in regulation 8(1).':
          'The number matches on the outer. Link a saved Small-pack declarations check for this SKU, artwork, operator and outer revision to review placement.');
      }else if(m.printState==='absent'&&(m.qrState==='absent'||m.qrState==='generic'||m.qrState==='unreadable'||m.role==='owner')){
        add('review','Licence placement',m.pack==='inner'?'Check the matching retail outer and the applicable small-pack placement.':'Check how the applicable operator licence is supplied on this retail artwork.');
      }else add('open','Licence placement','Record where the applicable operator licence can be read for this batch.');
    }
    if(!m.printState)add('open',channels.print,'Record whether this artwork shows an operator licence.');
    if(!expected&&!findings.some(f=>['open','review','difference'].includes(f.kind)))add('open','SKU site master','Confirm the assignment before comparing this batch.');
    a.status=findings.some(f=>f.kind==='difference')?'Differences to resolve':findings.some(f=>f.kind==='open'||f.kind==='review')?'Evidence or placement to review':'Batch, site and operator licence agree';
    return a;
  }
  const observation=f=>f.source+' · '+f.text;
  function describe(m,records){
    const a=analyse(m,records);
    const facts=[m.sku,m.art,names()[m.pack],m.batch,a.prefix,a.site,a.licence,roles[m.role],m.masterRef,m.master,
      m.recordRef,m.recordLicence,printStates[m.printState],m.printList,qrStates[m.qrState],m.qrList,m.scanRef,
      m.pack==='inner'&&printStates[m.outerState],m.pack==='inner'&&m.outerList,m.pack==='inner'&&m.outerRef];
    return [...facts.filter(Boolean),a.status,...a.findings.map(observation)].join('\n');
  }
  function values(id,state,groups){
    const m=draft(state),records=current(groups,id),checks=saved(groups,id);
    return [sourceText,fields.some(k=>m[k])?describe(m,records):'',checks.length,checks.map(r=>describe(r.m,records)).join('\n\n')];
  }
  function brief(id,state,groups){
    const v=values(id,state,groups);
    return v[1]||v[2]?['Batch code and manufacturing site',v[1],v[2]?'Saved batch/site checks ('+v[2]+')':'',v[3]].filter(Boolean):[];
  }
  function exportRows(id){
    const columns=['Catalogue ID','SKU','Artwork revision','Pack','Lot or batch','Prefix length','Selected prefix','Site in SKU master','Site licence in master','Operator role','Master revision','Site master snapshot',
      'Lot record','Operator licence in lot record','Print review','Printed operator licence data','Code review','Decoded operator licence data','Code evidence','Outer review','Outer licence data','Outer revision','Linked placement evidence','Overall finding','Finding type','Evidence source','Finding','Legal sources'];
    const rows=[columns],groups=root.PMSVIngredientPercentage.savedByProduct(),records=current(groups,id);
    for(const {m} of saved(groups,id)){
      const a=analyse(m,records),inner=m.pack==='inner';
      const base=[id,m.sku,m.art,names()[m.pack],m.batch,m.width,a.prefix,a.site,a.licence,roles[m.role]||'',m.masterRef,m.master,m.recordRef,m.recordLicence,
        printStates[m.printState]||'',m.printList,qrStates[m.qrState]||'',m.qrList,m.scanRef,inner&&printStates[m.outerState]||'',inner?m.outerList:'',inner?m.outerRef:'',a.placement,a.status];
      for(const f of a.findings)rows.push([...base,f.kind,f.source,f.text,sourceText]);
    }
    return rows;
  }
  const link=(key,label)=>'<a class="source-ref" href="'+sources[key]+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';
  const option=(key,label,selected)=>'<option value="'+esc(key)+'"'+(key===selected?' selected':'')+'>'+esc(label)+'</option>';
  function form(m){
    const field=(k,title,numeric=false)=>'<label>'+esc(title)+'<input data-trace-field="'+k+'" data-trace-original="'+esc(m[k])+'" value="'+esc(m[k])+'"'+(numeric?' inputmode="numeric"':'')+' maxlength="320"></label>';
    const choice=(k,title,items)=>'<label>'+esc(title)+'<select data-trace-field="'+k+'" data-trace-original="'+esc(m[k])+'">'+option('','Choose',m[k])+Object.entries(items).map(([v,l])=>option(v,l,m[k])).join('')+'</select></label>';
    const area=(k,title,guide)=>'<label>'+esc(title)+'<textarea rows="3" data-trace-field="'+k+'" placeholder="'+esc(guide)+'">'+esc(m[k])+'</textarea></label>';
    const legendGuide='Site prefix | 14-digit licence, one row per site';
    let out=field('sku','SKU or variant')+field('art','Artwork code and revision')+choice('pack','Pack being reviewed',names())+field('batch','Lot or batch code on the sample');
    if(!m.pack||m.pack==='nonretail')return out;
    out+=field('width','Number of leading characters giving the site prefix',true)+field('masterRef','Approved site master and revision applicable to this SKU and batch')+
      area('master','SKU site master · paste four columns or use vertical bars','Prefix | Site | Licence | approved, retired or excluded')+
      '<p>Use one row per prefix. Copy all relevant entries, including retired codes that may still appear on artwork. Keep leading zeros and upper/lower case.</p>'+
      choice('role','Which operator licence is being compared?',roles)+field('recordRef','Production or packing record reference for this lot')+field('recordLicence','Site licence recorded for this lot',true)+
      '<p>For each artwork source, enter the licence explicitly associated with this operator. A single number is sufficient for a single identified operator. For a multi-site legend, paste two columns or use a vertical bar between each prefix and number.</p>'+
      choice('printState','Operator licence on the printed artwork',printStates);
    if(m.printState==='list')out+=area('printList','Printed operator licence or complete printed site legend',legendGuide);
    out+=choice('qrState','Operator information obtained by scanning the pack',qrStates);
    if(m.qrState==='list')out+=field('scanRef','Decoded content or scan evidence reference')+area('qrList','Operator licence or site legend returned for this pack',legendGuide);
    if(m.pack==='inner'){
      out+=choice('outerState','Operator licence on the matching retail outer, if used',printStates);
      if(m.outerState==='list')out+=field('outerRef','Matching retail outer artwork revision')+area('outerList','Operator licence or site legend on the retail outer',legendGuide);
    }
    return out;
  }
  function section(){
    return '<details class="ws-section trace-section"><summary>Batch code and manufacturing site</summary><div><p>Check the lot against the approved site list for its SKU and compare the associated operator licence across the artwork and production record.</p>'+
      '<p>'+[link('batch','Lot identification'),link('licence','Operator licence · 5(7) and 5(9)'),link('barcode','Barcode · 8(5)'),link('qr','FSSAI QR FAQ'),link('format','Licensing FAQ 43'),link('search','FoSCoS operator search')].join(' · ')+'</p>'+
      '<div data-trace-form></div><div data-trace-result role="status"></div><button type="button" data-trace-save>Save batch/site check</button> '+
      '<button type="button" data-trace-next>Start another batch from this site list</button> <button type="button" data-trace-placement>Open small-pack declarations</button>'+
      '<p data-trace-message role="status"></p><div data-trace-saved></div></div></details>';
  }
  function attach(node,id,state){
    const panel=node.querySelector('.trace-section');if(!panel)return;
    const Q=root.PMSVIngredientPercentage,part=k=>panel.querySelector('[data-trace-'+k+']');
    let m=draft(state),opened=null,records=[],checks=[],ready=false;
    function result(){
      if(!m.sku&&!m.art&&!m.batch){part('result').textContent='Enter a SKU, artwork revision and sample lot to begin.';return;}
      const a=analyse(m,records),groups=[['difference','Differences'],['review','Items to review'],['open','Missing evidence'],['observation','Matched evidence'],['note','Other observations']];
      part('result').innerHTML='<p><strong>'+esc(a.status)+'</strong></p>'+(a.prefix?'<p>'+esc([a.prefix,a.site,a.licence].filter(Boolean).join(' · '))+'</p>':'')+
        groups.map(([key,title])=>{const rows=a.findings.filter(f=>f.kind===key);return rows.length?'<h5>'+title+'</h5><ul>'+rows.map(f=>'<li>'+esc(observation(f))+'</li>').join('')+'</ul>':'';}).join('');
    }
    function paint(){part('form').innerHTML=form(m);result();}
    function changed(){state.batchSiteDraft=JSON.stringify(m);const hint=node.querySelector('[data-ws-saved]');if(hint)hint.textContent='Unsaved worksheet changes';part('message').textContent='';}
    function refresh(){
      records=current(Q.savedByProduct(),id);checks=records.filter(r=>r.m.type==='batchSite');
      part('saved').innerHTML=checks.length?'<h5>Saved batch/site checks ('+checks.length+')</h5><ul>'+checks.map(({m},i)=>
        '<li>'+esc([m.sku,m.art,names()[m.pack],m.batch].join(' · '))+' <button type="button" data-trace-open="'+i+'">Open</button> <button type="button" data-trace-delete="'+i+'">Remove</button></li>').join('')+
        '</ul><button type="button" data-trace-export>Export batch/site findings as CSV</button>':'';
      if(ready)result();
    }
    panel.addEventListener('toggle',()=>{if(panel.open){refresh();if(!ready){paint();ready=true;}}});
    panel.addEventListener('pmsv-artwork-storage',refresh);
    panel.addEventListener('focusin',e=>{if(e.target.dataset.traceField)e.target.dataset.traceOriginal=e.target.value;});
    panel.addEventListener('input',e=>{
      const k=e.target.dataset.traceField;if(!fields.includes(k))return;
      m[k]=e.target.value;changed();result();
    });
    const clear=keys=>{for(const k of keys)m[k]='';};
    const artworkFields=['printState','printList','qrState','qrList','scanRef','outerState','outerList','outerRef'];
    panel.addEventListener('change',e=>{
      const el=e.target,k=el.dataset.traceField;if(!fields.includes(k))return;
      const original=clean(el.dataset.traceOriginal),v=clean(el.value),diff=original&&original!==v;
      if(diff&&k==='sku'){m=model({sku:v});opened=null;}
      else if(diff&&(k==='art'||k==='pack')){clear(artworkFields);opened=null;}
      else if(diff&&k==='batch'){clear(['recordRef','recordLicence',...artworkFields]);opened=null;}
      else if(diff&&k==='role'){clear(['recordLicence',...artworkFields]);}
      if(k==='printState'&&v!=='list')clear(['printList']);
      if(k==='qrState'&&v!=='list')clear(['qrList','scanRef']);
      if(k==='outerState'&&v!=='list')clear(['outerList','outerRef']);
      if(diff&&k==='outerRef')m.outerList='';
      if(diff&&k==='scanRef')m.qrList='';
      if(diff&&k==='masterRef')m.master='';
      if(el.tagName==='SELECT'||(diff&&['sku','art','batch','outerRef','scanRef','masterRef'].includes(k))){changed();paint();}
    });
    panel.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-trace-save')){
        const copy=model(m),editing=opened,r=await Q.withArtworkLock(id,()=>Q.save(id,copy,editing));
        if(r.key&&r.key===Q.identity(id,m))opened=r;
        part('message').textContent=r.message;refresh();
      }else if(b.hasAttribute('data-trace-next')){
        m=model({sku:m.sku,art:m.art,pack:m.pack,role:m.role,width:m.width,master:m.master,masterRef:m.masterRef});opened=null;changed();paint();
        part('form').querySelector('[data-trace-field="batch"]').focus();
      }else if(b.hasAttribute('data-trace-open')){
        const r=checks[Number(b.dataset.traceOpen)];if(!r)return;
        m=model(r.m);opened=r;changed();paint();part('message').textContent='Opened the saved batch/site check.';
      }else if(b.hasAttribute('data-trace-delete')){
        const r=checks[Number(b.dataset.traceDelete)];if(!r)return;
        part('message').textContent=await Q.withArtworkLock(id,()=>Q.remove(id,r));if(opened?.key===r.key)opened=null;refresh();
      }else if(b.hasAttribute('data-trace-placement')){
        const target=node.querySelector('.small-pack-section');if(target){target.open=true;target.querySelector('summary').focus();}
      }
    });
  }
  root.PMSVBatchSite=Object.freeze({sources,columns,model,draft,identityParts,analyse,values,brief,exportRows,section,attach});
})(globalThis);
