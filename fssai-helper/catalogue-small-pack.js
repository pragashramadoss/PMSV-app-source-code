/* Record the retail placement of declarations for one SKU and artwork revision. */
(function(root){
  'use strict';
  const comp='https://www.fssai.gov.in/docs/food-law/regulations/Comp_Labelling%20Display_Version%20VIII_09_09_2025.pdf';
  const faq='https://www.fssai.gov.in/upload/uploadfiles/files/FAQ_Labelling_Display_01_11_2023.pdf';
  const gazette='https://stg-old.fssai.gov.in/upload/notifications/2020/12/5fd87c6a0f6adGazette_Notification_Labelling_Display_14_12_2020.pdf';
  const sources={
    english:gazette+'#page=38',hindi:gazette+'#page=16',
    size:comp+'#page=21',barcode:comp+'#page=22',owner:comp+'#page=15',licence:comp+'#page=16',
    multi:comp+'#page=2',outer:comp+'#page=5',imports:comp+'#page=17',allergens:comp+'#page=18',nonretail:comp+'#page=24',
    measurement:faq+'#page=4',faq34:faq+'#page=5',faq34end:faq+'#page=6',faq43:faq+'#page=7',
    metrology:'https://consumeraffairs.gov.in/public/upload/admin/cmsfiles/whatsnews/Book_on_Legal_Metrology_Packaged_Commodities_Rules%2C2011_with_all_amendments_whatsnews.pdf'
  };
  const units={cm2:'cm²',mm2:'mm²'};
  const methods={visible:'All visible surfaces of the formed pack, seals excluded',panel:'Principal display panel or one face only',drawing:'Unadjusted wrapper or film dimensions',unknown:'Measurement basis unconfirmed'};
  const outers={multi:'Retail outer with two or more units of the same food',assorted:'Assortment of different foods',shipper:'Transport or non-retail outer',none:'Sold without a retail outer',unknown:'Retail configuration unconfirmed'};
  const origins={domestic:'Made in India',imported:'Imported as a finished pack',repacked:'Made abroad and packed or bottled in India'};
  const operators={same:'Brand owner performs the relevant operation',different:'Different manufacturer, marketer, packer or bottler',unknown:'Operator unconfirmed'};
  const observed={pack:'Seen on reviewed pack',outer:'Seen only on corresponding outer',both:'Seen on pack and outer',code:'Found only via code on reviewed pack',missing:'Absent from reviewed artwork',na:'Other documented exemption or inapplicable'};
  const titles={owner:'Brand owner name and role',address:'Brand owner address',site:'Separate operator name and address',logo:'FSSAI logo',
    ownerLic:'Brand owner licence number',siteLic:'Different operator licence number',importer:'Importer name and address',importLic:'Importer licence number',
    country:'Country of origin',premises:'Indian packing or bottling premises',ingredients:'Ingredient list',batch:'Lot, batch or code number',
    nutrition:'Nutrition information',additives:'Food additive declaration',irradiated:'Irradiation declaration',directions:'Directions for use',
    made:'Manufacture date',expiry:'Expiry or use-by date',food:'Food name',allergen:'Separate allergen declaration'};
  const listed=new Set(['logo','ownerLic','siteLic','importer','importLic','ingredients','batch','nutrition','additives','irradiated','directions']);
  const dates=new Set(['made','expiry']);
  const licenceLogo=new Set(['logo','ownerLic','siteLic','importLic']);
  const codeFields=new Set(['address','siteLic']);
  const importFields=new Set(['importer','importLic','country','premises']);
  const notes={
    owner:'Use the applicable role qualifier with the brand owner’s name under 5(6)(a).',
    address:'Under 8(5)(a), the address can be supplied through a barcode, GTIN or QR that provides it.',
    site:'FAQ 34 assigns the name and address duty under 5(6)(a) to the brand owner. Check special cases separately.',
    logo:'This row covers the FSSAI logo under 5(7). Other food logos have their own provisions.',
    ownerLic:'Check the number belonging to the brand owner under 5(7)(b).',
    siteLic:'Identify the applicable operator for this SKU. Regulation 8(5)(b) also permits its number through a code.',
    importer:'Confirm the Indian importer under 5(6)(b).',importLic:'Check the importer under 5(7)(c).',
    country:'Check the imported food’s country of origin under 5(12).',
    premises:'For food made abroad and packed or bottled in India, check the name and full address of the Indian packing or bottling premises under 5(6)(b).',
    ingredients:'Check the applicable ingredient list.',batch:'Check the identifier applicable to this lot.',
    nutrition:'Check the nutrition declaration applicable to the food.',additives:'Check the additive declaration. Review any separate Schedule II statements.',
    irradiated:'Applies to irradiated food.',directions:'Applies where the food requires directions for use.',
    made:'Regulation 8(1)(a) names manufacture date. For an artwork using packaging date, review its basis under 5(10).',
    expiry:'Check the applicable expiry or use-by marking under 5(10). Other date exceptions need their own basis.',
    food:'Check the name describing the food under 5(1).',allergen:'If an allergen declaration applies, review it independently under 5(14).'
  };
  const keys=['sku','art','pack','area','unit','method','measureRef','outerType','outerRef','origin','operator','scanRef'];
  const clean=x=>typeof x==='string'?x.trim():'';
  const owns=(o,k)=>Object.hasOwn(o,k);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  function model(input){
    const m={type:'smallPack',seen:{},reasons:{}};
    for(const key of keys)m[key]=clean(input?.[key]);
    for(const key of Object.keys(titles)){
      if(owns(observed,input?.seen?.[key]))m.seen[key]=input.seen[key];
      if(clean(input?.reasons?.[key]))m.reasons[key]=clean(input.reasons[key]);
    }
    return m;
  }
  function draft(s){try{return model(JSON.parse(s?.smallPackDraft||'null'));}catch(_){return model();}}
  const identityParts=m=>[m.sku,m.art,m.pack,'small-pack','placement'].map(clean);
  function measurement(m){
    const {decimal,lt}=root.PMSVIngredientPercentage.arithmetic;
    const v=decimal(m.area);
    if(m.method!=='visible'||!v?.n||!owns(units,m.unit))return null;
    const n={n:v.n,scale:v.scale+(m.unit==='mm2'?2:0)};
    const digits=String(n.n).padStart(n.scale+1,'0');
    const frac=n.scale?digits.slice(-n.scale).replace(/0+$/,''):'';
    return {text:(n.scale?digits.slice(0,-n.scale):digits)+(frac?'.'+frac:'')+' cm²',
      small:!lt({n:100n,scale:0},n),below30:lt(n,{n:30n,scale:0})};
  }
  function rule(m,key,area){
    if(m.pack==='nonretail')return 'nonretail';
    if(!owns(root.PMSVIngredientPercentage.packLabels,m.pack))return 'unknown';
    if(key==='site')return 'ownerRule';
    if(importFields.has(key)){
      if(!owns(origins,m.origin))return 'origin';
      if(m.origin==='domestic'||(key==='premises'&&m.origin!=='repacked'))return 'inapplicable';
    }
    if(key==='siteLic'){
      if(m.operator==='same')return 'same';
      if(m.operator!=='different')return 'operator';
    }
    if(m.pack==='inner'&&(listed.has(key)||dates.has(key))){
      if(!area)return 'area';
      if((dates.has(key)?area.below30:area.small)){
        if(m.outerType==='multi')return 'transfer';
        if(!owns(outers,m.outerType)||m.outerType==='unknown')return 'configuration';
      }
    }
    return 'pack';
  }
  const ruleLabel={nonretail:'Use the non-retail provisions in regulation 10',unknown:'Identify the pack',origin:'Confirm the food’s origin',
    ownerRule:'Brand owner is the named party under 5(6)(a)',inapplicable:'Outside the selected import scenario',same:'Same operator, see brand owner licence',
    operator:'Confirm who performs the relevant operation',area:'Confirm visible package area',transfer:'May appear on the matching multi-unit pack',
    configuration:'Identify the retail multi-unit presentation',pack:'Review on this pack'};
  function assess(m,key,route){
    const choice=m.seen[key];
    if(['inapplicable','ownerRule','same','nonretail'].includes(route))return {state:'info',text:ruleLabel[route]};
    if(choice==='na')return m.reasons[key]?{state:'review',text:'Review the cited alternative basis: '+m.reasons[key]}:{state:'open',text:'Record the provision or reason for this field.'};
    if(['unknown','origin','operator'].includes(route))return {state:'open',text:ruleLabel[route]};
    if(choice==='code'&&codeFields.has(key)){
      if(!m.scanRef)return {state:'open',text:'Record a scan showing this declaration for the SKU and artwork.'};
      return {state:'seen',text:'Recorded through the code on this pack under 8(5).'};
    }
    if(choice==='pack'||choice==='both')return {state:'seen',text:choice==='both'?'Recorded on the reviewed pack and outer.':'Recorded on the reviewed pack.'};
    if(!choice)return {state:'open',text:'Record where the declaration was found, or its specific exemption.'};
    if(route==='area'||route==='configuration')return {state:'open',text:ruleLabel[route]+'. Check the corresponding artwork if claiming transfer.'};
    if(choice==='outer'&&route==='transfer'){
      if(!m.measureRef||!m.outerRef)return {state:'open',text:'Record the measurement reference and matching retail outer revision.'};
      if(licenceLogo.has(key))return {state:'review',text:'Recorded on the matching retail multi-unit pack under the English text of 8(1). Review the wording on Gazette pp. 38 and 16. The Hindi list omits the licence and logo entry.'};
      return {state:'seen',text:'Recorded on the matching retail multi-unit pack.'};
    }
    if(choice==='code')return {state:'difference',text:'The 8(5) code route does not cover this field. Check the required printed location.'};
    if(choice==='outer')return {state:'difference',text:'Outer-only placement lacks a size route for this declaration and presentation.'};
    return {state:'difference',text:route==='transfer'?'Check the missing declaration on the matching retail outer.':'Check the missing declaration on this pack.'};
  }
  function analyse(m){
    const area=measurement(m);
    const rows=Object.keys(titles).map(key=>{
      const route=rule(m,key,area);
      return {key,field:titles[key],route,where:ruleLabel[route],observed:observed[m.seen[key]]||'Unchecked',...assess(m,key,route)};
    });
    const count=state=>rows.filter(row=>row.state===state).length;
    const status=m.pack==='nonretail'?'Use regulation 10 for this non-retail container':!owns(root.PMSVIngredientPercentage.packLabels,m.pack)?'Choose a pack to review':
      count('difference')+' placement differences · '+(count('open')+count('review'))+' fields to review · '+count('seen')+' observations recorded';
    return {area,rows,status};
  }
  const columns=['Small-pack placement sources','Current small-pack artwork review','Saved small-pack review count','Saved declaration placements and evidence'];
  const sourceText=[sources.english,sources.hindi,sources.size,sources.barcode,sources.measurement,sources.faq34,sources.faq34end,sources.metrology].join(' | ');
  const saved=(groups,id)=>(groups?.get(id)||[]).filter(r=>r.m.type==='smallPack');
  const packTitle=m=>root.PMSVIngredientPercentage.packLabels[m.pack]||'';
  function facts(m,a){
    return [m.sku,m.art,packTitle(m),[m.area,units[m.unit]].filter(Boolean).join(' '),methods[m.method]||'',a.area?.text||'',m.measureRef,
      outers[m.outerType]||'',m.outerRef,origins[m.origin]||'',operators[m.operator]||'',m.scanRef];
  }
  const describe=m=>{
    const a=analyse(m);
    return [facts(m,a).filter(Boolean).join(' · '),a.status,...(m.pack==='nonretail'?[]:a.rows.map(r=>[r.field,r.where,r.observed,r.text].join(' | ')))].join('\n');
  };
  function values(id,state,groups){
    const m=draft(state),records=saved(groups,id);
    return [sourceText,keys.some(k=>m[k])||Object.keys(m.seen).length?describe(m):'',records.length,records.map(r=>describe(r.m)).join('\n\n')];
  }
  function brief(id,state,groups){
    const v=values(id,state,groups);
    return v[1]||v[2]?['Small-pack declarations',v[1],v[2]?'Saved small-pack checks ('+v[2]+')':'',v[3]].filter(Boolean):[];
  }
  function exportRows(id){
    const head=['Catalogue ID','SKU or variant','Artwork revision','Reviewed pack','Area entered','Measurement basis','Applicable area in cm²','Measurement reference','Retail configuration','Outer artwork revision','Origin','Operator','Code scan evidence','Declaration','Placement route','Observed location','Finding','Regulatory note','Sources'];
    const rows=[head];
    for(const {m} of saved(root.PMSVIngredientPercentage.savedByProduct(),id)){
      const a=analyse(m),prefix=[id,...facts(m,a)];
      if(m.pack==='nonretail')rows.push([...prefix,'Non-retail container',a.status,'','Review separately','Regulation 10',sources.nonretail]);
      else for(const r of a.rows)rows.push([...prefix,r.field,r.where,r.observed,r.text,notes[r.key],sourceText]);
    }
    return rows;
  }
  const link=(key,label)=>'<a class="source-ref" target="_blank" rel="noopener noreferrer" href="'+sources[key]+'">'+esc(label)+'</a>';
  const option=(k,label,val)=>'<option value="'+esc(k)+'"'+(k===val?' selected':'')+'>'+esc(label)+'</option>';
  const options=(items,val,empty)=>option('',empty||'Choose',val)+Object.entries(items).map(([k,l])=>option(k,l,val)).join('');
  function form(m){
    const field=(k,label,numeric=false)=>'<label>'+esc(label)+'<input data-small-field="'+k+'" value="'+esc(m[k])+'" maxlength="'+(numeric?48:320)+'"'+(numeric?' inputmode="decimal"':'')+'></label>';
    const choice=(k,label,items)=>'<label>'+esc(label)+'<select data-small-field="'+k+'" data-small-original="'+esc(m[k])+'">'+options(items,m[k])+'</select></label>';
    let html=field('sku','SKU or variant')+field('art','Artwork code and revision')+choice('pack','Pack being reviewed',root.PMSVIngredientPercentage.packLabels);
    if(!m.pack||m.pack==='nonretail')return html;
    if(m.pack==='inner')html+=choice('method','What was measured?',methods)+field('area','Measured area',true)+choice('unit','Area unit',units)+field('measureRef','Measurement or approved drawing reference')+
      choice('outerType','How is this food presented for retail sale?',outers)+field('outerRef','Corresponding retail outer artwork and revision');
    return html+choice('origin','Origin and packing location',origins)+choice('operator','Who manufactures, markets, packs or bottles this SKU?',operators)+field('scanRef','Code scan or decoded content reference, if used');
  }
  function section(){
    return '<details class="ws-section small-pack-section"><summary>Small-pack declarations</summary><div><p>Check one artwork against its retail presentation. For a wrapper, count every visible surface after forming and exclude horizontal and vertical seals. Record each declaration where you found it.</p>'+
      '<p>'+[link('measurement','How to measure · FAQ 24'),link('size','Size and dates · reg. 8'),link('english','Gazette in English · p. 38'),link('hindi','Gazette in Hindi · p. 16'),link('faq34','FAQ 34 · first page'),link('faq34end','FAQ 34 · continuation'),link('barcode','Code route · reg. 8(5)'),link('faq43','FAQ 43'),link('metrology','Legal Metrology · rule 6')].join(' · ')+'</p>'+
      '<p>FAQ 34 identifies the brand owner for the name and address declaration. A different operator’s licence is a separate field. The FAQ also refers to Legal Metrology. For food, explanation III to rule 6(1)(a) directs the name and address question to food law.</p>'+
      '<p>For outer-only licence numbers and the FSSAI logo, the English text of 8(1) lists the items before the importer’s details. The Hindi list on Gazette p. 16 omits those words. The finding records the English basis and flags the wording difference.</p>'+
      '<div data-small-form></div><p data-small-status role="status"></p><div data-small-rows></div><button type="button" data-small-save>Save small-pack check</button> '+
      '<button type="button" data-small-new>Start another artwork</button><p data-small-message role="status"></p><div data-small-saved></div></div></details>';
  }
  function attach(node,id,state){
    const panel=node.querySelector('.small-pack-section');if(!panel)return;
    const Q=root.PMSVIngredientPercentage;
    const part=k=>panel.querySelector('[data-small-'+k+']');
    let m=draft(state),opened=null,records=[],ready=false;
    function showRows(){
      const a=analyse(m);
      const hint=a.area?a.area.text+' · '+(a.area.small?'within the 100 cm² limit':'above 100 cm²')+' · '+(a.area.below30?'below the date threshold':'outside the below-30 cm² date rule')+'. ':'';
      part('status').textContent=hint+a.status;
      if(!m.pack){part('rows').replaceChildren();return;}
      if(m.pack==='nonretail'){part('rows').innerHTML='<p>'+link('nonretail','Non-retail container requirements')+'</p>';return;}
      const matrix=part('rows');
      if(!matrix.querySelector('[data-small-row]')){
        matrix.innerHTML='<p>When checking the retail outer, also verify required declarations under regulation 4(8), including legibility through a transparent outer. Record the underlying product rule wherever a field is inapplicable.</p>'+a.rows.map(r=>
          '<fieldset class="quid-line" data-small-row="'+r.key+'"><legend>'+esc(r.field)+'</legend><p data-small-route></p><label>Observed location<select data-small-seen="'+r.key+'">'+options(observed,m.seen[r.key],'Unchecked')+
          '</select></label><label data-small-reason-label>Reason and legal reference<input maxlength="320" data-small-reason="'+r.key+'" value="'+esc(m.reasons[r.key])+'"></label><p data-small-finding></p></fieldset>').join('');
      }
      for(const r of a.rows){
        const el=matrix.querySelector('[data-small-row="'+r.key+'"]');
        el.querySelector('[data-small-route]').textContent=r.where+'. '+notes[r.key];
        el.querySelector('[data-small-seen]').value=m.seen[r.key]||'';
        el.querySelector('[data-small-seen]').disabled=r.state==='info';
        const reason=el.querySelector('[data-small-reason]');
        if(reason.value!==(m.reasons[r.key]||''))reason.value=m.reasons[r.key]||'';
        el.querySelector('[data-small-reason-label]').hidden=m.seen[r.key]!=='na';
        el.querySelector('[data-small-finding]').textContent=r.text;
      }
    }
    function paint(){part('form').innerHTML=form(m);part('rows').replaceChildren();showRows();}
    function changed(){
      state.smallPackDraft=JSON.stringify(m);
      const hint=node.querySelector('[data-ws-saved]');if(hint)hint.textContent='Unsaved worksheet changes';
      part('message').textContent='';
    }
    function refresh(){
      records=saved(Q.savedByProduct(),id);
      part('saved').innerHTML=records.length?'<h5>Saved small-pack checks ('+records.length+')</h5><ul>'+records.map(({m},i)=>
        '<li>'+esc([m.sku,m.art,packTitle(m)].join(' · '))+' <button type="button" data-small-open="'+i+'">Open</button> <button type="button" data-small-delete="'+i+'">Remove</button></li>').join('')+
        '</ul><button type="button" data-small-export>Export declaration placements as CSV</button>':'';
    }
    panel.addEventListener('toggle',()=>{if(panel.open){if(!ready){paint();ready=true;}refresh();}});
    panel.addEventListener('pmsv-artwork-storage',refresh);
    panel.addEventListener('focusin',e=>{if(e.target.dataset.smallField)e.target.dataset.smallOriginal=e.target.value;});
    panel.addEventListener('input',e=>{
      const el=e.target,{smallField:k,smallSeen:seen,smallReason:reason}=el.dataset;
      if(keys.includes(k))m[k]=el.value;
      else if(owns(titles,seen)){m.seen[seen]=el.value;if(el.value!=='na')delete m.reasons[seen];}
      else if(owns(titles,reason))m.reasons[reason]=el.value;
      else return;
      changed();showRows();
    });
    panel.addEventListener('change',e=>{
      const el=e.target,k=el.dataset.smallField;
      if(!keys.includes(k))return;
      const prior=clean(el.dataset.smallOriginal),current=clean(el.value);
      if(prior&&prior!==current&&['sku','art','pack'].includes(k)){
        m=model({sku:m.sku,art:k==='sku'?'':m.art,pack:k==='pack'?current:''});opened=null;
      }else if(prior&&prior!==current&&k==='outerRef'){
        for(const [key,where] of Object.entries(m.seen)){
          if(where==='outer')delete m.seen[key];
          if(where==='both')m.seen[key]='pack';
        }
      }else if(prior&&prior!==current&&k==='scanRef'){
        for(const key of codeFields)if(m.seen[key]==='code')delete m.seen[key];
      }
      if(k==='pack'||(prior&&prior!==current&&['sku','art','outerRef','scanRef'].includes(k))){changed();paint();}
    });
    panel.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-small-save')){
        const copy=model(m),editing=opened,r=await Q.withArtworkLock(id,()=>Q.save(id,copy,editing));
        if(r.key&&r.key===Q.identity(id,m))opened=r;
        part('message').textContent=r.message;refresh();
      }else if(b.hasAttribute('data-small-new')){m=model({sku:m.sku});opened=null;changed();paint();part('form').querySelector('[data-small-field="art"]').focus();}
      else if(b.hasAttribute('data-small-open')){
        const r=records[Number(b.dataset.smallOpen)];if(!r)return;
        m=model(r.m);opened=r;changed();paint();part('message').textContent='Opened the saved small-pack check.';
      }else if(b.hasAttribute('data-small-delete')){
        const r=records[Number(b.dataset.smallDelete)];if(!r)return;
        part('message').textContent=await Q.withArtworkLock(id,()=>Q.remove(id,r));if(opened?.key===r.key)opened=null;refresh();
      }
    });
  }
  root.PMSVSmallPack=Object.freeze({sources,columns,titles,identityParts,model,draft,measurement,analyse,values,brief,exportRows,section,attach});
})(globalThis);
