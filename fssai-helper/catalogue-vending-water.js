/* IS 10500 as incorporated for purified drinking water offered or sold through a vending machine. */
(function(root){
  'use strict';
  const productId='purified-vending-water';
  const area='Vending water · IS 10500';
  const registry=root.PMSV_REVIEW_REGISTER;
  const standard=registry?.waterStandardReview;
  const gazette=registry?.waterSourceReview?.sources?.vending;
  if(!standard?.rows||!gazette)return;
  const fields=['waterPoint','waterSample','waterReport','waterAnalyte','waterValue','waterUnit','waterBasis'];
  const sources=new Set(Object.values(standard.sources).map(source=>source.url));
  const checks=standard.rows.filter(r=>r.table===3 && r.operator==='max' && r.permissible==='No relaxation' && r.unit==='mg/L');
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  function assess(state={}){
    const row=checks.find(r=>r.id===state.waterAnalyte);
    if(!row)return '';
    if(state.waterPoint!=='outlet'||!state.waterSample?.trim()||!state.waterReport?.trim()||state.waterBasis!=='yes')
      return 'Pending. Confirm the vending outlet, sample, laboratory report and analyte basis.';
    if(!['mg/L','µg/L'].includes(state.waterUnit))return 'Pending. Confirm the concentration unit on the report.';
    const reading=root.PMSVMetalPanel.parseReading(state.waterValue||'',state.waterUnit);
    if(!reading)return 'Pending. Enter a quantified result or a numeric reporting bound.';
    const within=root.PMSVCatalogueWorksheets.compare({operator:'<=',value:row.acceptable},reading.amount);
    if(within===null)return 'Pending. Check the concentration on the report.';
    const decision=within?(reading.qualifier?'Reported upper bound is within the maximum.':'At or below the maximum.') :
      reading.qualifier?'Inconclusive. The reporting bound exceeds the maximum.':'Above the maximum.';
    return decision+reading.equivalent;
  }
  function readingNote(state={}){
    const row=checks.find(r=>r.id===state.waterAnalyte);
    if(!row||(!state.waterValue?.trim()&&!state.waterReport?.trim()))return '';
    return [row.name+' (maximum '+row.acceptable+' mg/L)',state.waterPoint==='outlet'?'Vending outlet':'Outlet unconfirmed',state.waterSample,state.waterReport,state.waterValue&&[state.waterValue,state.waterUnit].filter(Boolean).join(' '),assess(state)].filter(Boolean).join(' · ');
  }
  function rowSource(row){
    const source=standard.sources[row.source.id];
    return [...new Set([gazette,source.url+'#page='+row.source.pdfPage,...row.amendments.filter(k=>k!==row.source.id).map(k=>standard.sources[k].url)])].join(' | ');
  }
  function sourceLabel(url){
    const [base,page]=url.split('#page=');
    if(url===gazette)return 'FSSAI Gazette p. '+page;
    for(const [id,source] of Object.entries(standard.sources)){
      if(source.url===base)return (id==='is10500'?'IS 10500':'BIS amendment '+id.slice(-1))+(page?' p. '+page:'');
    }
    return 'Official source';
  }
  function notes(row){
    const parts=[];
    if(row.id==='free-chlorine')parts.push('The second column prints 1 mg/L. Check the consumer-end minimum and viral-protection condition.');
    else if(row.permissible==='No relaxation' && row.operator!=='pointer')parts.push('No relaxation.');
    else if(row.operator==='max' && row.permissible!==row.acceptable && row.permissible!=='Not applicable')
      parts.push('Only in the absence of an alternate source, the permissible limit is '+row.permissible+' '+row.unit+'.');
    if(row.scopeNote)parts.push(row.scopeNote);
    if(row.methodReference)parts.push('Method reference: '+row.methodReference+'.');
    return parts.join(' ');
  }
  function planRows(id,state={}){
    if(id!==productId)return [];
    const sampleNote=readingNote(state);
    return standard.rows.map(row=>{
      const location=row.table==='clauses'?'clause '+row.serial:'Table '+row.table+' · '+row.serial;
      const pointer=row.operator==='pointer';
      const symbol={max:'≤ ',min:'≥ '}[row.operator]||'';
      let status=pointer?'Cross-reference to Table 5':row.waterScope?'Match the sampling point':'Check the stated scope';
      if(row.id==='iron'||row.id==='manganese')status='Review the combined iron and manganese condition';
      return {area,article:'FSSR 2.10.9 · IS 10500 '+location,form:row.waterScope||'Purified drinking water sold through a vending machine',
        parameter:row.name,status,limit:pointer?'':symbol+row.acceptable,unit:pointer?'':row.unit,
        notes:[notes(row),row.id===state.waterAnalyte?sampleNote:''].filter(Boolean).join(' '),source:rowSource(row)};
    });
  }
  function markup(state){
    const options=(choices,selected)=>'<option value="">Choose</option>'+choices.map(([key,label])=>'<option value="'+esc(key)+'"'+(key===selected?' selected':'')+'>'+esc(label)+'</option>').join('');
    const pick=(field,label,choices)=>'<label>'+label+'<select data-ws-field="'+field+'">'+options(choices,state[field])+'</select></label>';
    const input=(field,label)=>'<label>'+label+'<input data-ws-field="'+field+'" maxlength="180" value="'+esc(state[field])+'"></label>';
    return '<div data-water-controls><p>FSSR 2.10.9 covers water offered or sold through a decentralised purification and dispensing machine. Match each entry to the sampling point and method. The table also identifies conditional values and cross-references.</p>'+
      '<button type="button" data-water-export>Download the 74 IS 10500 entries</button>'+
      '<details><summary>Compare a Table 3 laboratory result</summary><div class="form-grid">'+
      pick('waterPoint','Sample origin',[['outlet','Finished water at the vending outlet'],['other','Feed, captive, packaged or other water']])+
      input('waterSample','Machine and sampled outlet reference')+input('waterReport','Laboratory report reference')+
      pick('waterAnalyte','Reported parameter',checks.map(r=>[r.id,r.name]))+input('waterValue','Reported value or upper bound')+
      pick('waterUnit','Unit on report',[['mg/L','mg/L'],['µg/L','µg/L']])+
      '<label><input type="checkbox" data-ws-field="waterBasis"'+(state.waterBasis==='yes'?' checked':'')+'> I matched the reported analyte, sample and method to the source entry.</label></div>'+
      '<p data-water-outcome role="status">'+esc(assess(state))+'</p></details></div>';
  }
  function update(node,key,state,previous){
    // A different sample, report or analyte requires a fresh reading and basis confirmation.
    const identity=['waterPoint','waterSample','waterReport','waterAnalyte'].includes(key);
    if(identity&&previous&&String(previous).trim()!==String(state[key]).trim()){
      for(const field of ['waterValue','waterUnit','waterBasis']){
        state[field]='';
        const input=node.querySelector('[data-ws-field="'+field+'"]');
        if(input.type==='checkbox')input.checked=false;else input.value='';
      }
    }
    node.querySelector('[data-water-outcome]').textContent=assess(state);
  }
  root.PMSVVendingWater=Object.freeze({productId,area,fields,planRows,sourceLabel,assess,readingNote,markup,update,isSource:url=>sources.has(String(url).split('#')[0])});
})(globalThis);
