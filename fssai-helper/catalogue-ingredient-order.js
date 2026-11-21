/* Compare an independently transcribed artwork list with documented recipe quantities. */
(function(root) {
  'use strict';
  const gazette='https://stg-old.fssai.gov.in/upload/notifications/2020/12/5fd87c6a0f6adGazette_Notification_Labelling_Display_14_12_2020.pdf';
  const sources={order:gazette+'#page=30',compound:gazette+'#page=31',additives:gazette+'#page=35',smallPack:gazette+'#page=38',nonretail:gazette+'#page=40'};
  const scopes={final:'Finished-food ingredient list',group:'Additives in one functional class',compound:'Ingredients in brackets after a compound ingredient',
    flat:'Compound ingredients declared individually in the final food',prepared:'Food reconstituted according to directions',relief:'Compound ingredient below 5% of the food'};
  const coverage={full:'All entries in the reviewed list',selected:'Selected entries only'};
  const presentation={named:'Class and specific name(s) shown',ins:'Class and recognised INS identifier(s) shown',both:'Class and a combination of names and recognised INS identifiers shown',
    noClass:'Functional class missing',noIdentity:'Specific name or recognised INS identifier missing',unchecked:'Artwork declaration pending'};
  const functions={yes:'At least one additive has a technological function in the final food',no:'No additive has a technological function in the final food',unknown:'Function under review'};
  const units={kg:'kg',g:'g',mg:'mg',L:'L',mL:'mL',ww:'% w/w',vv:'% v/v'};
  const unitData={kg:['mass',1000000n],g:['mass',1000n],mg:['mass',1n],L:['volume',1000n],mL:['volume',1n],ww:['massPercent',1n],vv:['volumePercent',1n]};
  const fields=['sku','art','pack','recipe','scope','listName','coverage','sourceRef','printed','presentation','share','function','rdRequest'];
  const rowKeys=['name','alias','amount','unit','source'];
  const clean=v=>typeof v==='string'?v.trim():'';
  const norm=v=>clean(v).normalize('NFC').replace(/\s+/gu,' ').toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const namedScope=s=>['group','compound','relief'].includes(s);
  const own=(o,k)=>Object.hasOwn(o,k);
  const blankRow=()=>({name:'',alias:'',amount:'',unit:'',source:''});
  function model(input={}) {
    const m={type:'order'};
    for(const k of fields)m[k]=typeof input?.[k]==='string'?input[k]:'';
    m.rows=Array.isArray(input?.rows)&&input.rows.length?input.rows.map(row=>{
      const out=blankRow();
      for(const k of rowKeys)if(typeof row?.[k]==='string')out[k]=row[k];
      return out;
    }):[blankRow(),blankRow()];
    return m;
  }
  const scopeTitle=m=>[scopes[m.scope],namedScope(m.scope)&&clean(m.listName)].filter(Boolean).join(' · ');
  function identityParts(m){return [m.sku,m.art,m.pack,'ingredient-order',m.scope,namedScope(m.scope)?m.listName:''].map(clean);}
  function draft(state){try{return model(JSON.parse(state?.orderDraft||'null'));}catch(_){return model();}}
  const listed=m=>m.printed.split(/\r\n|[\r\n]/).map(clean).filter(Boolean);
  const compare=(a,b,lt)=>lt(a,b)?-1:lt(b,a)?1:0;
  const joinLines=a=>a.filter(Boolean).join('\n');

  function analyse(m) {
    const {decimal,lt,add}=root.PMSVIngredientPercentage.arithmetic;
    const rd=new Set(),todo=new Set(),issues=new Set(),notes=new Set();
    const answer={status:'Evidence or transcription needed',expected:'',rd:[],todo:[],issues:[],notes:[]};
    const finish=(status)=>{
      answer.status=status||answer.status;
      for(const [k,v] of Object.entries({rd,todo,issues,notes}))answer[k]=[...v];
      return answer;
    };
    const prefix=scopeTitle(m)||'Ingredient order';
    const ask=s=>rd.add(prefix+' — '+s);
    clean(m.rdRequest).split(/\r?\n/).map(clean).filter(Boolean).forEach(ask);
    if(m.pack==='nonretail'){notes.add('Review this container under regulation 10. Open the retail artwork for an ingredient-list comparison.');return finish('Non-retail review');}
    if(!clean(m.sku)||!clean(m.art)||!own(root.PMSVIngredientPercentage.packLabels,m.pack))todo.add('Identify the SKU, artwork revision and pack.');
    if(!clean(m.recipe))rd.add('Provide the approved formula reference and revision used for this artwork.');
    if(!own(scopes,m.scope)){todo.add('Choose the list or provision being reviewed.');return finish();}
    if(namedScope(m.scope)&&!clean(m.listName))todo.add('Identify the compound ingredient or functional class.');
    if(['compound','relief','flat','prepared'].includes(m.scope)&&!clean(m.sourceRef)){
      const request={compound:'Provide the supplier composition reference and revision for the bracketed list.',relief:'Provide the compound composition and its final-food function assessment.',
        flat:'Provide the supplier breakdown and the calculation of each contribution to the final recipe.',prepared:'Provide the preparation directions and formula quantities on the reconstituted basis.'};
      ask(request[m.scope]);
    }
    if(m.scope==='relief'){
      const d=decimal(m.share);
      if(!d||!d.n||lt({n:100n,scale:0},d))ask('Confirm the compound ingredient’s positive percentage of the final food, up to 100%.');
      else if(!lt(d,{n:5n,scale:0}))issues.add('The recorded compound share is 5% or more. Review the bracketed or individual declaration route.');
      else notes.add('The recorded compound share is below 5%. The proviso addresses disclosure of its subingredients.');
      if(!issues.size){
        if(!['yes','no'].includes(m.function))ask('Confirm which additives, if any, perform a technological function in the final food.');
        if(m.function==='yes')notes.add('Identify each functional additive and check its declaration on the final artwork.');
        if(m.function==='no')notes.add('The recorded assessment identifies no functional additive in the final food. Check any separate allergen declarations.');
      }
      return finish(issues.size?'Threshold outside the proviso':rd.size||todo.size?undefined:'Below-5% scope recorded');
    }
    if(!own(coverage,m.coverage))todo.add('Choose whether all or only selected entries are being compared.');
    if(m.scope==='group'){
      if(!own(presentation,m.presentation)||m.presentation==='unchecked')todo.add('Check the printed functional class and additive identification under regulation 5(5).');
      if(m.presentation==='noClass')issues.add('The reviewer recorded that the functional class is missing on this artwork.');
      if(m.presentation==='noIdentity')issues.add('The reviewer recorded a missing specific name or recognised INS identifier.');
      notes.add('The quantity comparison covers the selected additives. Verify their identity and functional class under 5(5).');
    }
    if(m.scope==='compound')notes.add('Use the mass proportions when the supplier manufactured the compound.');
    if(m.scope==='prepared')notes.add('Check that the artwork identifies the ingredients as prepared according to the directions.');
    if(m.pack==='inner')notes.add('If the ingredient list is on the multi-unit pack, record and review that artwork under regulation 8(1).');
    const printed=listed(m);
    if(!printed.length)todo.add('Transcribe the printed list, one entry per line, or identify the pack carrying that list.');
    const seq=new Map(),names=new Map(),seenSources=new Map(),families=new Set();
    const rows=m.rows.filter(r=>rowKeys.some(k=>clean(r[k])));
    const max={n:100n,scale:0};
    let sum={n:0n,scale:0},valid=true;
    for(const [i,r] of rows.entries()){
      const name=clean(r.name),caption=clean(r.alias)||name,key=norm(caption),who=name||'Recipe entry '+(i+1);
      if(!name){ask('Identify the ingredient for recipe entry '+(i+1)+'.');valid=false;}
      const d=decimal(r.amount),unit=own(unitData,r.unit)?unitData[r.unit]:null;
      if(!d||!d.n||!unit){ask(who+' — provide its positive quantity and unit on the reviewed recipe basis.');valid=false;}
      if(unit)families.add(unit[0]);
      if(m.scope==='compound'&&unit&&!['mass','massPercent'].includes(unit[0])){ask(who+' — provide its quantity or percentage by mass within the compound.');valid=false;}
      if(m.scope==='flat'&&!clean(r.source)){ask(who+' — identify the direct addition or supplier preparation supplying this final-recipe quantity.');valid=false;}
      if(!key||!name)continue;
      const prior=seq.get(key),nameKey=norm(name);
      if((prior&&prior.nameKey!==nameKey)||(names.has(nameKey)&&names.get(nameKey)!==key)){
        todo.add('Resolve the artwork mapping for '+who+'. Each distinct ingredient needs a unique printed entry.');valid=false;
      }
      names.set(nameKey,key);
      if(prior&&m.scope!=='flat'){todo.add('The recipe repeats '+caption+'. Confirm the total for that ingredient and enter it once.');valid=false;}
      if(m.scope==='flat'){
        const source=norm(r.source);
        if(!seenSources.has(key))seenSources.set(key,new Set());
        if(source&&seenSources.get(key).has(source)){todo.add('The same contribution source is repeated for '+caption+'. Check for double counting.');valid=false;}
        seenSources.get(key).add(source);
      }
      const qty=d&&unit?{n:d.n*unit[1],scale:d.scale}:{n:0n,scale:0};
      if(!prior)seq.set(key,{key,caption,nameKey,qty});
      else prior.qty=add(prior.qty,qty);
      sum=add(sum,qty);
    }
    if(!rows.length){ask('Provide the ingredients to compare and their quantities and units at manufacture on the chosen basis.');valid=false;}
    else if(seq.size<2)todo.add('Two distinct recipe entries are needed to compare their order.');
    if(families.size>1){ask('Provide all quantities on one common basis. Use consistent mass, volume or percentage units, with a documented conversion if needed.');valid=false;}
    if(valid&&m.coverage==='full'&&families.size===1&&[...families][0].endsWith('Percent')&&lt(sum,max))
      notes.add('The entered percentages total less than 100%. Check the basis and any documented exclusions from this list.');
    if(families.size===1&&[...families][0].endsWith('Percent')&&lt(max,sum)){ask('Reconcile the percentage contributions. Their total exceeds 100% on the recorded basis.');valid=false;}
    const printedKeys=printed.map(norm),uniquePrint=new Set(printedKeys);
    if(printedKeys.length!==uniquePrint.size)todo.add('The transcription repeats an entry. Check the list level and identify each printed ingredient once.');
    const checkIdentity=printed.length&&seq.size&&own(coverage,m.coverage);
    if(checkIdentity){
      const missing=[...seq.values()].filter(v=>!uniquePrint.has(v.key)).map(v=>v.caption);
      const unmatched=printed.filter(s=>!seq.has(norm(s)));
      if(missing.length)issues.add('Recipe entries without a printed match: '+missing.join(', ')+'. Check the transcription, identities and declaration basis.');
      if(unmatched.length){const msg=unmatched.join(', ')+'.';if(m.coverage==='full')issues.add('Printed entries without a recipe match: '+msg);else notes.add('Printed entries outside the selected comparison: '+msg);}
    }
    const enough=valid&&seq.size>=2&&clean(m.recipe)&&(!['compound','flat','prepared'].includes(m.scope)||clean(m.sourceRef));
    if(enough){
      const sorted=[...seq.values()].sort((a,b)=>compare(b.qty,a.qty,lt));
      const levels=[];
      for(const item of sorted){
        const tail=levels.at(-1);
        if(tail&&compare(tail.qty,item.qty,lt)===0)tail.labels.push(item.caption);
        else levels.push({qty:item.qty,labels:[item.caption]});
      }
      answer.expected=levels.map(l=>l.labels.join(' = ')).join(' → ');
      if(levels.some(l=>l.labels.length>1))notes.add('Equal recorded quantities have the same rank. The quantities alone do not distinguish their order.');
      if(checkIdentity&&uniquePrint.size===printedKeys.length){
        const matched=printedKeys.map(k=>seq.get(k)).filter(Boolean);
        for(let i=1;i<matched.length;i++){
          const a=matched[i-1],b=matched[i];
          if(lt(a.qty,b.qty))issues.add('Printed '+a.caption+' before '+b.caption+'. The recorded quantity of '+b.caption+' is higher.');
        }
      }
    }
    if(issues.size)return finish('Artwork differences to review');
    if(!enough||rd.size||todo.size||!printed.length)return finish();
    return finish(m.coverage==='selected'?'Selected entries match the recorded order':'Transcribed list matches the recorded order');
  }
  const columns=['Ingredient-order legal sources','Current ingredient-order review','Saved ingredient-order check count','Saved ingredient-order reviews and evidence'];
  const sourceText=Object.values(sources).join(' | ');
  const contains=m=>fields.some(k=>clean(m[k]))||m.rows.some(r=>rowKeys.some(k=>clean(r[k])));
  function details(m) {
    const a=analyse(m),pack=root.PMSVIngredientPercentage.packLabels[m.pack]||'';
    const entries=m.rows.filter(r=>rowKeys.some(k=>clean(r[k]))).map(r=>[r.name,r.alias&&'printed as '+r.alias,
      [r.amount,units[r.unit]].filter(Boolean).join(' '),r.source].filter(Boolean).join(' · ')).join('\n');
    return [m.sku,m.art,pack,scopeTitle(m),m.recipe,m.sourceRef,coverage[m.coverage]||'',entries,m.printed,
      [presentation[m.presentation],m.share&&'Compound share '+m.share+'%',functions[m.function]].filter(Boolean).join(' · '),
      a.expected,a.status,joinLines([...a.issues,...a.todo,...a.notes]),joinLines(a.rd)];
  }
  const saved=(groups,id)=>(groups?.get(id)||[]).filter(r=>r.m.type==='order');
  const describe=m=>details(m).filter(Boolean).join(' | ');
  function values(id,state,groups){
    const m=draft(state),kept=saved(groups,id);
    return [sourceText,contains(m)?describe(m):'',kept.length,kept.map(r=>describe(r.m)).join('\n\n')];
  }
  function brief(id,state,groups){
    const v=values(id,state,groups);
    return v[1]||v[2]?['Ingredient order on artwork',v[1],v[2]?'Saved ingredient-order checks ('+v[2]+')':'',v[3],sourceText].filter(Boolean):[];
  }
  function exportRows(id){
    return [['Catalogue ID','SKU or variant','Artwork revision','Pack','List reviewed','Approved recipe','Source or calculation reference','Comparison coverage',
      'Recipe entries and quantities','Printed sequence','Additive or compound evidence','Expected order','Finding','Artwork review details','Recipe information required from R&D','Legal sources'],
      ...saved(root.PMSVIngredientPercentage.savedByProduct(),id).map(r=>[id,...details(r.m),sourceText])];
  }
  const links=Object.entries({order:'Order and carry-over, p. 30',compound:'Compound ingredients and water, p. 31',additives:'Additive identification, p. 35',
    smallPack:'Small packs, p. 38'}).map(([k,title])=>'<a class="source-ref" href="'+sources[k]+'" target="_blank" rel="noopener noreferrer">'+title+'</a>').join(' · ');
  const option=(v,label,current)=>'<option value="'+esc(v)+'"'+(current===v?' selected':'')+'>'+esc(label)+'</option>';
  function select(key,label,value,items,line=false){
    return '<label>'+esc(label)+'<select data-order-'+(line?'line':'field')+'="'+key+'" data-order-original="'+esc(value)+'">'+option('','Choose',value)+
      Object.entries(items).map(([v,label])=>option(v,label,value)).join('')+'</select></label>';
  }
  function input(key,label,value,line=false,num=false){
    return '<label>'+esc(label)+'<input data-order-'+(line?'line':'field')+'="'+key+'" maxlength="'+(num?48:320)+'"'+
      (num?' inputmode="decimal"':'')+' value="'+esc(value)+'"></label>';
  }
  function form(m) {
    const field=(k,label,num=false)=>input(k,label,m[k],false,num);
    const choice=(k,label,items)=>select(k,label,m[k],items);
    let html=field('sku','SKU or variant')+field('art','Artwork code and revision')+choice('pack','Pack being reviewed',root.PMSVIngredientPercentage.packLabels)+
      field('recipe','Approved formula reference and revision')+choice('scope','List or provision to check',scopes);
    if(m.pack==='nonretail')return html+'<p><a href="'+sources.nonretail+'" target="_blank" rel="noopener noreferrer">Non-retail information, regulation 10</a></p>';
    if(!own(scopes,m.scope))return html;
    if(namedScope(m.scope))html+=field('listName',m.scope==='group'?'Functional class being reviewed':'Name of compound ingredient');
    const refLabels={compound:'Supplier composition reference and revision',flat:'Supplier breakdown and final-contribution calculation reference',prepared:'Preparation directions and formula reference',relief:'Supplier composition and final-food function reference'};
    if(own(refLabels,m.scope))html+=field('sourceRef',refLabels[m.scope]);
    if(m.scope==='relief')html+=field('share','Compound ingredient as a percentage of the final food',true)+choice('function','Additive function in the final food',functions);
    else{
      html+=choice('coverage','Comparison covers',coverage);
      if(m.scope==='group')html+=choice('presentation','Additive identification on this artwork',presentation);
      const guide={compound:'Enter the supplier’s proportions by mass within this compound. Transcribe only the bracketed list.',
        flat:'Enter each contribution after applying the supplier composition to the final batch. Give each source a name. The helper totals entries for the same ingredient.',
        prepared:'Enter quantities after preparation according to the recorded directions.',
        group:'Enter the individual quantities on the same recipe basis. Use the printed name or INS identifier to map each additive.',
        final:'Enter quantities on one basis at manufacture. Check separately which ingredients belong on this pack, including water and carry-over additives.'};
      html+='<h5>Approved recipe</h5><p>'+guide[m.scope]+'</p>';
      html+=m.rows.map((r,i)=>'<fieldset class="quid-line" data-order-index="'+i+'"><legend>Recipe entry '+(i+1)+'</legend>'+
        input('name','Ingredient in the recipe',r.name,true)+input('alias','Printed name or INS identifier, if different',r.alias,true)+
        input('amount','Quantity or percentage',r.amount,true,true)+select('unit','Unit',r.unit,units,true)+
        (m.scope==='flat'?input('source','Source of this final-recipe contribution',r.source,true):'')+
        (m.rows.length>1?'<button type="button" data-order-remove-line="'+i+'">Remove entry</button>':'')+'</fieldset>').join('');
      html+='<button type="button" data-order-add>Add recipe entry</button><label>Printed artwork order, one ingredient or identifier per line<textarea rows="4" data-order-field="printed">'+esc(m.printed)+'</textarea></label>';
    }
    return html+'<label>Other recipe details needed from R&amp;D (optional, one per line)<textarea maxlength="1600" rows="2" data-order-field="rdRequest">'+esc(m.rdRequest)+'</textarea></label>';
  }
  const listText=items=>'<ul>'+items.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>';
  function findings(m){
    const a=analyse(m);
    return '<p><strong>'+esc(a.status)+'</strong></p>'+(a.expected?'<p>Expected order · '+esc(a.expected)+'</p>':'')+
      listText([...a.issues,...a.todo,...a.notes])+(a.rd.length?'<h5>Recipe information for R&amp;D</h5>'+listText(a.rd):'');
  }
  function section(){
    return '<details class="ws-section order-section"><summary>Ingredient order on artwork</summary><div><p>'+links+'</p><div data-order-form></div>'+
      '<div data-order-result role="status"></div><button type="button" data-order-save>Save ingredient-order check</button> '+
      '<button type="button" data-order-new>Start another list</button><p data-order-status role="status"></p><div data-order-saved></div></div></details>';
  }
  function attach(node,id,state){
    const panel=node.querySelector('.order-section');if(!panel)return;
    const Q=root.PMSVIngredientPercentage;
    const area=k=>panel.querySelector('[data-order-'+k+']');
    let m=draft(state),opened=null,visible=[],ready=false;
    const results=()=>{area('result').innerHTML=findings(m);};
    const paint=()=>{area('form').innerHTML=form(m);results();};
    function changed(){
      state.orderDraft=JSON.stringify(m);
      const hint=node.querySelector('[data-ws-saved]');if(hint)hint.textContent='Unsaved worksheet changes';
      area('status').textContent='';
    }
    function refreshSaved(){
      visible=saved(Q.savedByProduct(),id);
      area('saved').innerHTML=visible.length?'<h5>Saved ingredient-order checks ('+visible.length+')</h5><ul>'+visible.map(({m},i)=>
        '<li>'+esc([m.sku,m.art,Q.packLabels[m.pack],scopeTitle(m)].join(' · '))+
        ' <button type="button" data-order-open="'+i+'">Open</button> <button type="button" data-order-delete="'+i+'">Remove</button></li>').join('')+
        '</ul><button type="button" data-order-export>Export ingredient-order checks as CSV</button>':'';
    }
    panel.addEventListener('pmsv-artwork-storage',refreshSaved);
    panel.addEventListener('toggle',()=>{if(panel.open){if(!ready){paint();ready=true;}refreshSaved();}});
    panel.addEventListener('focusin',e=>{if(e.target.dataset.orderField)e.target.dataset.orderOriginal=e.target.value;});
    panel.addEventListener('input',e=>{
      const el=e.target,k=el.dataset.orderField,line=el.dataset.orderLine;
      if(rowKeys.includes(line)){
        const row=m.rows[Number(el.closest('[data-order-index]').dataset.orderIndex)];
        row[line]=el.value;
      }else if(fields.includes(k))m[k]=el.value;
      else return;
      changed();results();
    });
    panel.addEventListener('change',e=>{
      const el=e.target,k=el.dataset.orderField;if(!fields.includes(k))return;
      const old=clean(el.dataset.orderOriginal);
      if(old&&old!==clean(m[k])){
        if(k==='sku'){m=model({sku:m.sku});opened=null;}
        if(k==='art'||k==='pack'){m.printed='';m.presentation='';m.rdRequest='';}
        if(k==='scope'||(k==='listName'&&norm(old)!==norm(m.listName))){
          const base={sku:m.sku,art:m.art,pack:m.pack,recipe:m.recipe,scope:m.scope,listName:k==='listName'?m.listName:''};
          m=model(base);opened=null;
        }
        if(k==='recipe'){m.rows=[blankRow(),blankRow()];m.sourceRef='';m.share='';m.function='';}
      }
      if(k==='pack'||k==='scope'||(old&&old!==clean(el.value)&&['sku','art','recipe','listName'].includes(k))){
        changed();paint();
      }
    });
    panel.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-order-add')){
        m.rows.push(blankRow());changed();paint();
        area('form').querySelector('[data-order-index="'+(m.rows.length-1)+'"] input')?.focus();
      }else if(b.hasAttribute('data-order-remove-line')){
        m.rows.splice(Number(b.dataset.orderRemoveLine),1);changed();paint();
      }else if(b.hasAttribute('data-order-save')){
        const copy=model(m),editing=opened;
        const r=await Q.withArtworkLock(id,()=>Q.save(id,copy,editing));
        if(r.key&&r.key===Q.identity(id,m))opened=r;
        area('status').textContent=r.message;refreshSaved();
      }else if(b.hasAttribute('data-order-new')){
        m=model({sku:m.sku,art:m.art,pack:m.pack,recipe:m.recipe});opened=null;changed();paint();
        area('form').querySelector('[data-order-field="scope"]')?.focus();
      }else if(b.hasAttribute('data-order-open')){
        const r=visible[Number(b.dataset.orderOpen)];if(!r)return;
        m=model(r.m);opened=r;changed();paint();area('status').textContent='Opened the saved order check.';
      }else if(b.hasAttribute('data-order-delete')){
        const r=visible[Number(b.dataset.orderDelete)];if(!r)return;
        area('status').textContent=await Q.withArtworkLock(id,()=>Q.remove(id,r));if(opened?.key===r.key)opened=null;refreshSaved();
      }
    });
  }
  root.PMSVIngredientOrder=Object.freeze({sources,columns,model,draft,identityParts,scopes,namedScope,analyse,values,brief,exportRows,section,attach});
})(globalThis);
