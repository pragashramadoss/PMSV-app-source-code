/* Date transcription and chronology for one retail lot. Calendar comparisons use the printed precision. */
(function(root){
  'use strict';
  const faq='https://www.fssai.gov.in/upload/uploadfiles/files/FAQ_Labelling_Display_01_11_2023.pdf';
  const sources={
    dates:'https://www.fssai.gov.in/docs/food-law/regulations/Comp_Labelling%20Display_Version%20VIII_09_09_2025.pdf#page=16',
    longLife:faq+'#page=1',dayFormats:faq+'#page=3',
    alcohol:'https://fssai.gov.in/upload/uploadfiles/files/Comp_Alcoholic_Beverages_V_04_12_2025.pdf#page=11'
  };
  const bands={short:'Up to and including three months',long:'More than three months'};
  const rules={general:'General retail date marking',alcohol:'Non-wine alcoholic beverage below 10% ABV',special:'Other product-specific provision under review'};
  const kinds={first:{made:'Manufacture',packed:'Packaging'},last:{expiry:'Expiry',useBy:'Use by',best:'Best before'}};
  const keys=['sku','art','pack','batch','sample','spec','band','rule','firstKind','first','firstYear','lastKind','last','lastYear'];
  const months='JANUARY FEBRUARY MARCH APRIL MAY JUNE JULY AUGUST SEPTEMBER OCTOBER NOVEMBER DECEMBER'.split(' ');
  const columns=['Printed lot date sources','Current printed lot dates and findings','Saved printed-date checks by lot'];
  const sourceText=Object.values(sources).join(' | ');
  const clean=v=>typeof v==='string'?v.trim():'';
  function model(raw){
    const m={type:'lotDate'};
    for(const k of keys)m[k]=clean(raw?.[k]);
    return m;
  }
  function draft(state){try{return model(JSON.parse(state?.lotDateDraft||'null'));}catch(_){return model();}}
  const identityParts=m=>[m.sku,m.art,m.pack,'printed-lot-dates',m.batch];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const monthIndex=word=>months.findIndex(name=>word.length>=3&&name.startsWith(word.toUpperCase()))+1;
  function daysInMonth(year,month){
    if(month!==2)return [4,6,9,11].includes(month)?30:31;
    return year%4===0&&(year%100!==0||year%400===0)?29:28;
  }
  function readDate(raw,confirmation){
    const text=clean(raw);
    const messages=[];
    const result={messages,precision:'',layout:false,min:null,max:null};
    if(!text){messages.push('No date transcribed. Review any omission or transfer in the artwork date-marking check.');return result;}
    const full=/^(\d{1,2})([/. -])(\d{1,2}|[a-z]{3,9})\2(\d{4}|\d{2})$/i.exec(text);
    const partial=!full&&/^([a-z]{3,9}|\d{1,2})([ /.-])(\d{4}|\d{2})$/i.exec(text);
    if(!full&&!partial){messages.push('Review the printed wording or format against the source. A relative best-before statement requires its reference date and duration.');return result;}
    const monthText=full?full[3]:partial[1],yearText=full?full[4]:partial[3];
    const numeric=/^\d+$/.test(monthText),month=numeric?Number(monthText):monthIndex(monthText);
    const day=full?Number(full[1]):null;
    result.precision=full?'day':'month';
    if(month<1||month>12){messages.push('Invalid calendar month.');return result;}
    const upper=monthText.toUpperCase(),title=upper[0]+upper.slice(1).toLowerCase();
    result.layout=full?full[1].length===2&&full[2]==='/'&&(numeric?monthText.length===2:monthText.length===3&&(monthText===upper||monthText===title)):
      !numeric&&monthText===upper;
    let year=Number(yearText);
    if(yearText.length===2){
      if(!/^[1-9]\d{3}$/.test(confirmation)||!confirmation.endsWith(yearText)){
        const max=month===2&&year===0?29:daysInMonth(2000+year,month);
        if(full&&(day<1||day>max))messages.push('Invalid calendar day for the printed month and year.');
        messages.push(confirmation?'The documented four-digit year must agree with the two printed digits.':'Confirm the four-digit year from the lot record to compare chronology.');
        return result;
      }
      year=Number(confirmation);
    }
    if(!year){messages.push('Invalid calendar year.');return result;}
    const last=daysInMonth(year,month);
    if(full&&(day<1||day>last)){messages.push('Invalid calendar day for the printed month and year.');return result;}
    const prefix=year*10000+month*100;
    result.min=prefix+(day??1);result.max=prefix+(day??last);
    return result;
  }
  function inspect(m,side){
    const value=m[side],kind=m[side+'Kind'];
    const d=readDate(value,m[side+'Year']);
    if(!value)return d;
    if(!Object.hasOwn(kinds[side],kind))d.messages.push('Identify the wording printed beside this date.');
    if(!d.precision)return d;
    if(!d.layout)d.messages.push('The transcription differs from the FSSAI example layouts. Review the original marking.');
    if(d.precision==='month'&&side==='last'&&['expiry','useBy'].includes(kind)&&m.rule==='alcohol'){
      d.messages.push('Day required for expiry or use-by under Alcoholic Beverages 5.10.');
    }else if(d.precision==='month'&&m.band==='short'){
      d.messages.push('Day required for shelf life up to and including three months under 5(10)(b).');
    }else if(!Object.hasOwn(rules,m.rule)||m.rule==='special'||!Object.hasOwn(bands,m.band)){
      d.messages.push('Confirm the applicable provision and approved shelf-life band before deciding the format.');
    }else if(m.rule==='alcohol'&&side==='last'&&kind==='best'){
      d.messages.push('Best before is additional. Review the required expiry or use-by declaration under Alcoholic Beverages 5.10.');
    }else if(d.min!==null&&d.layout&&Object.hasOwn(kinds[side],kind)){
      d.messages.push(d.precision==='day'?'Calendar date and day-level format checked.':'Calendar month and month-year format checked.');
    }
    return d;
  }
  function analyse(m){
    if(!['inner','outer','retail'].includes(m.pack))return {first:[],last:[],order:m.pack==='nonretail'?'Use the non-retail container provisions for this pack.':'Select a retail pack to check its dates.',evidence:''};
    const first=inspect(m,'first'),last=inspect(m,'last');
    let order='Chronology needs two interpretable dates, their printed meanings and confirmed years.';
    const a=kinds.first[m.firstKind],b=kinds.last[m.lastKind];
    if(Object.hasOwn(kinds.first,m.firstKind)&&Object.hasOwn(kinds.last,m.lastKind)&&first.min!==null&&last.min!==null){
      if(last.max<first.min)order=b+' precedes '+a.toLowerCase()+'. Check the lot code and the two transcriptions.';
      else if(last.min>first.max)order=b+' follows '+a.toLowerCase()+' at the printed precision.';
      else if(last.min===last.max&&first.min===first.max)order='Both markings give the same day. Check the intended shelf life against the batch instruction.';
      else order='The printed date ranges overlap. Month-level precision cannot establish the order within that month.';
    }
    return {first:first.messages,last:last.messages,order,evidence:[!m.sample&&'Record the sample, code image or packing record reference.',!m.spec&&'Record the specification or coding instruction for the shelf-life band.'].filter(Boolean).join(' ')};
  }
  function describe(m){
    const a=analyse(m);
    return [m.sku,m.art,root.PMSVIngredientPercentage.packLabels[m.pack],m.batch,m.sample,m.spec,bands[m.band],rules[m.rule],
      [kinds.first[m.firstKind]||'Start marking',m.first,m.firstYear&&'Recorded year '+m.firstYear,...a.first].filter(Boolean).join(' · '),
      [kinds.last[m.lastKind]||'End marking',m.last,m.lastYear&&'Recorded year '+m.lastYear,...a.last].filter(Boolean).join(' · '),a.order,a.evidence].filter(Boolean).join(' | ');
  }
  const saved=(groups,id)=>(groups?.get(id)||[]).filter(r=>r.m.type==='lotDate');
  function values(id,state,groups){
    const m=draft(state);
    return [sourceText,keys.some(k=>m[k])?describe(m):'',saved(groups,id).map(r=>describe(r.m)).join('\n\n')];
  }
  function brief(id,state,groups){const [,active,records]=values(id,state,groups);return active||records?['Printed dates on the lot',active,records].filter(Boolean):[];}
  function exportRows(id){
    const rows=[['Catalogue ID','SKU','Artwork','Pack','Batch','Sample evidence','Specification','Approved shelf-life band','Product rule','Start wording','Printed start','Documented start year','Start finding','End wording','Printed end','Documented end year','End finding','Chronology','Evidence outstanding','Sources']];
    for(const {m} of saved(root.PMSVIngredientPercentage.savedByProduct(),id)){
      const a=analyse(m);
      rows.push([id,m.sku,m.art,root.PMSVIngredientPercentage.packLabels[m.pack],m.batch,m.sample,m.spec,bands[m.band],rules[m.rule],
        kinds.first[m.firstKind],m.first,m.firstYear,a.first.join(' '),kinds.last[m.lastKind],m.last,m.lastYear,a.last.join(' '),a.order,a.evidence,sourceText]);
    }
    return rows;
  }
  function section(){
    return '<details class="ws-section lot-date-section"><summary>Printed dates on the lot</summary><div><p>Transcribe each date as printed. Use the approved shelf life and the actual pack inspected. For a two-digit year, enter the full year from the lot record.</p><div data-lot-form></div><div data-lot-result aria-live="polite"></div><button type="button" data-lot-save>Save lot date check</button> <button type="button" data-lot-next>Start another lot</button> <button type="button" data-lot-new>New artwork</button><p data-lot-message role="status"></p><div data-lot-saved></div><p><a class="source-ref" href="'+sources.dates+'" target="_blank" rel="noopener">Date marking · 5(10)</a> · <a class="source-ref" href="'+sources.longLife+'" target="_blank" rel="noopener">Month and year · FAQ 3</a> · <a class="source-ref" href="'+sources.dayFormats+'" target="_blank" rel="noopener">Day formats · FAQ 20</a> · <a class="source-ref" href="'+sources.alcohol+'" target="_blank" rel="noopener">Alcoholic Beverages · 5.10</a></p></div></details>';
  }
  function attach(node,id,state){
    const panel=node.querySelector('.lot-date-section');if(!panel)return;
    const Q=root.PMSVIngredientPercentage,part=k=>panel.querySelector('[data-lot-'+k+']');
    let m=draft(state),opened=null,records=[],ready=false;
    function form(){
      const field=(key,label,options)=>'<label>'+esc(label)+(options?'<select data-lot-field="'+key+'"><option value="">Choose</option>'+Object.entries(options).map(([k,v])=>'<option value="'+esc(k)+'">'+esc(v)+'</option>').join('')+'</select>':'<input maxlength="320" data-lot-field="'+key+'">')+'</label>';
      part('form').innerHTML=field('sku','SKU or variant')+field('art','Artwork revision')+field('pack','Pack inspected',{retail:'Retail pack',inner:'Individual inner',outer:'Retail multi-unit outer'})+field('batch','Lot or batch code')+
        field('sample','Sample or code-image reference')+field('spec','Specification or coding instruction')+field('band','Approved shelf life',bands)+field('rule','Applicable date-marking rule',rules)+
        field('firstKind','Start marking',kinds.first)+field('first','Printed manufacture or packaging date')+field('firstYear','Full start year if two digits were printed')+
        field('lastKind','End marking',kinds.last)+field('last','Printed expiry, use-by or best-before date')+field('lastYear','Full end year if two digits were printed');
    }
    function paint(){
      for(const input of panel.querySelectorAll('[data-lot-field]')){
        const k=input.dataset.lotField;input.value=m[k];
        if(['sku','art','pack','batch'].includes(k))input.disabled=!!opened;
      }
      result();
    }
    function result(){
      const a=analyse(m);
      part('result').innerHTML=[...a.first.map(s=>'Start marking · '+s),...a.last.map(s=>'End marking · '+s),a.order,a.evidence].filter(Boolean).map(s=>'<p>'+esc(s)+'</p>').join('');
    }
    function changed(){state.lotDateDraft=JSON.stringify(m);part('message').textContent='';const hint=node.querySelector('[data-ws-saved]');if(hint)hint.textContent='Unsaved worksheet changes';}
    function refresh(){
      records=saved(Q.savedByProduct(),id);
      part('saved').innerHTML=records.length?'<h5>Saved lot date checks ('+records.length+')</h5><ul>'+records.map(({m},i)=>'<li>'+esc([m.sku,m.art,m.pack,m.batch].join(' · '))+' <button type="button" data-lot-open="'+i+'">Open</button> <button type="button" data-lot-remove="'+i+'">Remove</button></li>').join('')+'</ul><button type="button" data-lot-export>Export printed lot dates as CSV</button>':'';
    }
    panel.addEventListener('toggle',()=>{if(panel.open){if(!ready){form();paint();ready=true;}refresh();}});
    panel.addEventListener('pmsv-artwork-storage',refresh);
    panel.addEventListener('input',e=>{
      const k=e.target.dataset.lotField;if(!keys.includes(k))return;
      m[k]=e.target.value;
      if(k==='first'||k==='last'){
        const year=k+'Year';m[year]='';panel.querySelector('[data-lot-field="'+year+'"]').value='';
      }
      changed();result();
    });
    panel.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-lot-save')){
        const copy=model(m),editing=opened,receipt=await Q.withArtworkLock(id,()=>Q.save(id,copy,editing));
        if(receipt.key&&Q.identity(id,m)===receipt.key){opened=receipt;paint();}
        part('message').textContent=receipt.message;refresh();
      }else if(b.hasAttribute('data-lot-next')||b.hasAttribute('data-lot-new')){
        const next=b.hasAttribute('data-lot-next');
        m=next?model({sku:m.sku,art:m.art,pack:m.pack,spec:m.spec,band:m.band,rule:m.rule,firstKind:m.firstKind,lastKind:m.lastKind}):model();
        opened=null;changed();paint();panel.querySelector('[data-lot-field="'+(next?'batch':'sku')+'"]').focus();
      }else if(b.hasAttribute('data-lot-open')){
        const entry=records[Number(b.dataset.lotOpen)];if(!entry)return;
        m=model(entry.m);opened=entry;changed();paint();part('message').textContent='Opened the saved lot date check.';
      }else if(b.hasAttribute('data-lot-remove')){
        const entry=records[Number(b.dataset.lotRemove)];if(!entry)return;
        const message=await Q.withArtworkLock(id,()=>Q.remove(id,entry));
        if(opened?.key===entry.key){opened=null;paint();}refresh();part('message').textContent=message;
      }
    });
  }
  root.PMSVLotDates=Object.freeze({sources,columns,model,draft,identityParts,analyse,values,brief,exportRows,section,attach});
})(globalThis);
