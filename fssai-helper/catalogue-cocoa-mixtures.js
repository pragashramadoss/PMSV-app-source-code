/* FPSFA 2.7.6. Assess a proposed name for a dry mix intended for direct consumption. */
(function(root){
  'use strict';
  const productId='05-05-1-dry-mixtures-of-cocoa-and-sugars';
  const gazette='https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification/Gazette_Notification_Pulses_Grains_Maize_14_08_2018.pdf';
  const chapter='https://fssai.gov.in/docs/food-law/regulations/compendium/food-products-standards/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf';
  const sources=[gazette+'#page=21',gazette+'#page=22',chapter+'#page=11'];
  const families=[
    {key:'drink',names:['Sweetened cocoa','Sweetened cocoa powder','Drinking chocolate'],op:'>=',threshold:'25'},
    {key:'mix',names:['Sweetened cocoa mix','Sweetened mixture with cocoa'],op:'>=',threshold:'20'},
    {key:'flavoured',names:['Sweetened cocoa-flavoured mix'],op:'<',threshold:'20'}
  ];
  const grades=[
    {key:'standard',suffix:'',range:'≥ 20%',low:'20'},
    {key:'reduced',suffix:'fat-reduced',range:'≥ 10% and < 20%',low:'10',high:'20'},
    {key:'highlyReduced',suffix:'highly fat-reduced',range:'< 10%',high:'10'}
  ];
  const forms=families.flatMap(family=>grades.map(grade=>{
    const names=family.names.map(name=>grade.suffix?(name==='Drinking chocolate'?grade.suffix+' drinking chocolate':name+', '+grade.suffix):name);
    return {key:family.key+'-'+grade.key,label:names.join(' / '),family,grade};
  }));
  const fields=['mixScope','mixName','mixRecipe','mixPowderRef','mixCocoa','mixButter','mixDryCocoa'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const compare=(v,op,value)=>root.PMSVCatalogueWorksheets.compare({operator:op,value},String(v??'').trim());
  const valid=v=>compare(v,'>=','0')===true&&compare(v,'<=','100')===true;
  const mixPercent=v=>valid(v)&&compare(v,'>','0')&&compare(v,'<','100');
  const has=v=>typeof v==='string'&&v.trim()!=='';
  function assess(s={}){
    if(s.mixScope!=='direct')return 'Pending. Confirm a dry cocoa and sugar or sweetener mix intended for direct consumption.';
    if(!has(s.mixRecipe))return 'Pending. Enter the approved recipe or specification reference.';
    if(s.mixName==='chocolate'){
      const parts=[];
      if(has(s.mixCocoa)){
        if(!mixPercent(s.mixCocoa))return 'Pending. Check the cocoa powder percentage by weight of the finished mix.';
        parts.push('As formulated (32% minimum): '+(compare(s.mixCocoa,'>=','32')?'meets':'below')+' the stated minimum.');
      }
      if(has(s.mixDryCocoa)){
        if(!mixPercent(s.mixDryCocoa))return 'Pending. Check the cocoa powder percentage on the dry-matter basis.';
        parts.push('Dry matter (29% reference): '+(compare(s.mixDryCocoa,'>=','29')?'at or above':'below')+' the stated value.');
      }
      if(parts.length===2 && compare(s.mixCocoa,'>=','32')!==compare(s.mixDryCocoa,'>=','29'))
        parts.push('The two reported bases disagree. Reconcile the recipe, method and figures.');
      return parts.join(' ')||'Pending. Enter a value on its reported basis.';
    }
    const form=forms.find(f=>f.key===s.mixName);
    if(!form)return 'Pending. Select the name proposed for the pack.';
    if(!has(s.mixPowderRef)||!mixPercent(s.mixCocoa)||!valid(s.mixButter))
      return 'Pending. Enter the powder specification or report, cocoa powder percentage in the recipe, and cocoa butter percentage of that powder on a dry basis.';
    const {family,grade}=form;
    const content=compare(s.mixCocoa,family.op,family.threshold);
    const fat=(!grade.low||compare(s.mixButter,'>=',grade.low))&&(!grade.high||compare(s.mixButter,'<',grade.high));
    return 'Cocoa powder in the recipe '+(content?'meets':'does not meet')+' the selected name’s criterion. The cocoa butter in the powder '+(fat?'matches':'falls outside')+' the selected fat class.';
  }
  function evidence(s){
    if(!has(s.mixName))return '';
    const form=forms.find(f=>f.key===s.mixName);
    if(!form&&s.mixName!=='chocolate')return '';
    return [form?.label||'Chocolate powder',s.mixRecipe&&'Recipe: '+s.mixRecipe,
      s.mixCocoa&&'Cocoa powder in the mix: '+s.mixCocoa+'%',
      form&&s.mixPowderRef&&'Powder specification: '+s.mixPowderRef,
      form&&s.mixButter&&'Cocoa butter in the powder, dry basis: '+s.mixButter+'%',
      !form&&s.mixDryCocoa&&'Cocoa powder on dry matter: '+s.mixDryCocoa+'%',assess(s)].filter(Boolean).join(' · ');
  }
  function registerValues(s){
    const name=forms.find(f=>f.key===s.mixName)?.label||(s.mixName==='chocolate'?'Chocolate powder':'');
    return ['FPSFA 2.7.6 · nine name and fat-class combinations, plus chocolate powder',sources.join(' | '),name,evidence(s)];
  }
  function planRows(s={}){
    const make=(article,form,parameter,limit,notes,key)=>({article,form,parameter,status:'Confirm the intended name and reporting basis',limit,unit:'%',
      notes:[notes,key===s.mixName?evidence(s):''].filter(Boolean).join(' · '),source:sources.join(' | ')});
    const rows=forms.map(f=>make('FPSFA 2.7.6(2)(b)',f.label,'Cocoa powder in the finished mixture',
      (f.family.op==='>='?'≥ ':'< ')+f.family.threshold,'Cocoa butter in the input cocoa powder, dry basis: '+f.grade.range+'. Check direct-consumption scope and the recipe.',f.key));
    for(const [label,limit,basis] of [['Cocoa powder by weight','≥ 32','finished mixture, wt/wt'],['Cocoa powder on dry matter','29','dry-matter basis, parenthetical value in the same provision']]){
      rows.push(make('FPSFA 2.7.6(2)(c)','Chocolate powder',label,limit,'Report the '+basis+'. Keep each figure on its stated basis.','chocolate'));
    }
    return rows;
  }
  function markup(s){
    const option=(key,label,selected)=>'<option value="'+esc(key)+'"'+(key===selected?' selected':'')+'>'+esc(label)+'</option>';
    const select=(key,label,choices)=>'<label>'+label+'<select data-ws-field="'+key+'">'+option('','Choose',s[key])+choices.map(([k,n])=>option(k,n,s[key])).join('')+'</select></label>';
    const input=(key,label,numeric=false)=>'<label>'+label+'<input data-ws-field="'+key+'" maxlength="'+(numeric?40:180)+'"'+(numeric?' inputmode="decimal"':'')+' value="'+esc(s[key])+'"></label>';
    return '<details class="ws-section" data-cocoa-mix><summary>Check the proposed cocoa mix name</summary><div>'+
      select('mixScope','Product as sold',[['direct','Dry cocoa and sugar or sweetener mix for direct consumption'],['other','Another product or use']])+
      select('mixName','Proposed name and fat class',[...forms.map(f=>[f.key,f.label]),['chocolate','Chocolate powder']])+
      input('mixRecipe','Approved recipe or specification reference')+input('mixCocoa','Cocoa powder in the finished mix (% by weight)',true)+
      '<div data-mix-powder'+(s.mixName==='chocolate'?' hidden':'')+'>'+input('mixPowderRef','Cocoa powder specification or report reference')+input('mixButter','Cocoa butter in the input cocoa powder (% dry basis)',true)+'</div>'+
      '<div data-mix-dry'+(s.mixName==='chocolate'?'':' hidden')+'>'+input('mixDryCocoa','Cocoa powder on dry matter (%), if reported on this basis',true)+'</div>'+
      '<p data-mix-outcome role="status">'+esc(assess(s))+'</p><p>Assess the proposed name against its printed row. The 25% and 20% rows each state a minimum. Moisture is checked separately in the testing plan.</p><p>For a spiced recipe, open Crop contaminants and record the ingredients for the saffrole check. The current food entry names mace and nutmeg together. From 1 December 2026, mace or nutmeg kernel as an ingredient triggers the amended entry.</p>'+
      '<a class="source-ref" href="'+sources[2]+'" target="_blank" rel="noopener noreferrer">FSSAI naming table, PDF p. 11</a> <button type="button" data-mix-export>Download cocoa mix criteria</button></div></details>';
  }
  function update(node,s){
    node.querySelector('[data-mix-powder]').hidden=s.mixName==='chocolate';
    node.querySelector('[data-mix-dry]').hidden=s.mixName!=='chocolate';
    node.querySelector('[data-mix-outcome]').textContent=assess(s);
  }
  root.PMSVCocoaMixtures={productId,fields,forms,sources,assess,evidence,registerValues,planRows,markup,update};
})(globalThis);
