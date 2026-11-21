/* Indian retail artwork and ingoing ingredient-percentage review. */
(function (root) {
  'use strict';
  const gazette='https://fssai.gov.in/upload/notifications/2020/12/5fd87c6a0f6adGazette_Notification_Labelling_Display_14_12_2020.pdf';
  const sources={trigger:gazette+'#page=31',exceptions:gazette+'#page=32',presentation:gazette+'#page=29',
    flavour:gazette+'#page=35',pack:gazette+'#page=38',nonretail:gazette+'#page=40'};
  const columns=['Ingredient percentage legal sources','Artwork, variant and ingredient under review','Ingredient percentage declaration finding',
    'Artwork pack and placement review','Ingoing recipe calculation and basis','Comparison with printed percentage','Saved artwork check count','Saved ingredient-percentage checks',
    'Open R&D recipe request groups','Recipe information required from R&D by SKU and artwork'];
  const labels={
    pack:{retail:'Retail pack',outer:'Retail multi-unit outer',inner:'Individual inner pack',nonretail:'Non-retail container'},
    food:{mixture:'Mixture or combination',single:'Single ingredient',unknown:'Composition unconfirmed'},
    nature:{actual:'Named ingredient present',both:'Named ingredient and a separate added flavour',agent:'Reviewed ingredient used solely as a flavouring agent',
      flavourOnly:'Only the corresponding flavour is present',absent:'Reviewed ingredient absent',unknown:'Recipe unconfirmed'},
    name:{emphasis:'Name emphasizes the ingredient as present',incidental:'Name reference only, quantity does not distinguish this food and the reference is non-misleading',
      flavour:'Name describes the flavour only',absent:'Ingredient outside the food name',unknown:'Name under review'},
    words:{yes:'Other wording highlights the ingredient as present',no:'No other emphasis in words',unknown:'Wording under review'},
    picture:{yes:'Picture or graphic highlights the ingredient as present',serving:'Genuine serving suggestion only',no:'No such picture or graphic',unknown:'Image under review'},
    character:{yes:'All three conditions apply',no:'At least one condition does not apply',unknown:'Characterising role under review'},
    exception:{none:'No other proviso applies',drained:'Required drained net weight is displayed',specific:'A specific labelling provision applies to this food',
      nutrient:'Added micronutrient or preparation subject to the nutrition declaration',unknown:'Provisos under review'},
    print:{value:'Numerical percentage printed',missing:'Percentage absent from this artwork',other:'Different expression or basis',unknown:'Declaration not checked'},
    kind:{direct:'Named ingredient added directly',compound:'Contribution from a compound ingredient'},
    unit:{kg:'kg',g:'g',L:'L',mL:'mL'}
  };
  const scalarKeys=['sku','art','target','pack','area','outer','food','recipe','nature','observation','name','words','picture','contextRef',
    'character','exception','exceptionRef','total','unit','print','printed'];
  const lineKeys=['kind','source','amount','unit','share','spec'];
  const emptyLine=()=>({kind:'direct',source:'',amount:'',unit:'',share:'',spec:''});
  const fresh=()=>({...Object.fromEntries(scalarKeys.map(k=>[k,''])),lines:[emptyLine()]});
  const str=v=>typeof v==='string'?v.trim():'';
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
  const entry=(key,value)=>Object.hasOwn(labels[key],value)?labels[key][value]:'';
  const join=values=>values.filter(Boolean).join(' · ');
  function model(data) {
    const output=fresh();
    if(!data || typeof data!=='object')return output;
    for(const k of scalarKeys)if(typeof data[k]==='string')output[k]=data[k];
    if(Array.isArray(data.lines)&&data.lines.length)output.lines=data.lines.map(row=>{
      const line=emptyLine();
      for(const k of lineKeys)if(typeof row?.[k]==='string')line[k]=row[k];
      return line;
    });
    if(str(data.rdRequest))output.rdRequest=data.rdRequest;
    return output;
  }
  function draft(state) {
    try{return model(JSON.parse(state?.quidDraft||'null'));}catch(_){return fresh();}
  }
  function labelLink(url,label){return '<a class="source-ref" href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+'</a>';}
  const sourceLinks=()=>[labelLink(sources.trigger,'Reg. 5(2)(g), Gazette p. 31'),labelLink(sources.exceptions,'Remaining proviso, p. 32'),
    labelLink(sources.presentation,'Presentation, p. 29'),labelLink(sources.flavour,'Added flavours, p. 35'),labelLink(sources.pack,'Small packs, p. 38')].join(' · ');

  // A decimal is an integer over a power of ten. Scale through every input before comparing the printed percentage.
  function decimal(text) {
    const value=str(text);
    if(value.length>48||!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value))return null;
    const [whole,frac='']=value.split('.');
    return {n:BigInt((whole||'0')+frac),scale:frac.length};
  }
  const pow=k=>10n**BigInt(k);
  const lt=(a,b)=>a.n*pow(b.scale)<b.n*pow(a.scale);
  const add=(a,b)=>{const scale=Math.max(a.scale,b.scale);return {n:a.n*pow(scale-a.scale)+b.n*pow(scale-b.scale),scale};};
  const unitFamily={kg:'mass',g:'mass',L:'volume',mL:'volume'};
  function quantity(value,unit) {
    const d=decimal(value);
    if(!d||!d.n||!Object.hasOwn(unitFamily,unit))return null;
    return {n:d.n*(unit==='kg'||unit==='L'?1000n:1n),scale:d.scale};
  }
  function fixed(n,places) {
    if(!places)return String(n);
    const digits=String(n).padStart(places+1,'0');
    return (digits.slice(0,-places)+'.'+digits.slice(-places)).replace(/0+$/,'').replace(/\.$/,'');
  }
  function rounded(n,d,places){return (2n*n*pow(places)+d)/(2n*d);}
  function shown(n,d){
    const places=6, scaled=n*pow(places),value=rounded(n,d,places);
    if(scaled%d===0n)return fixed(value,places)+'%';
    return value===0n?'positive, below 0.000001%':'≈ '+fixed(value,places)+'%';
  }
  const inputSummary=m=>join([m.recipe&&'Recipe '+m.recipe,m.total&&'Ingoing batch '+m.total+' '+m.unit,...m.lines.filter(r=>r.amount||r.source).map(r=>
    join([r.source||'Unnamed addition',r.amount+' '+r.unit,r.kind==='compound'?'named share '+(r.share||'?')+'%':'direct',r.kind==='compound'&&r.spec]))]);
  function calculate(m) {
    if(!['actual','both','agent'].includes(m.nature)||!str(m.recipe))return {error:'Establish the named ingredient and its approved recipe reference.'};
    if(!Array.isArray(m.lines)||!m.lines.length)return {error:'Add at least one recipe input for the named ingredient.'};
    const total=quantity(m.total,m.unit);
    if(!total)return {error:'Enter the total ingoing batch on one mass or volume basis.'};
    const zero={n:0n,scale:0},hundred={n:100n,scale:0};
    let inputs=zero,named=zero;
    for(const line of m.lines){
      const qty=quantity(line.amount,line.unit);
      if(!str(line.source)||!qty||!entry('kind',line.kind))return {error:'Identify each addition and enter its positive quantity and unit.'};
      if(unitFamily[m.unit]!==unitFamily[line.unit])return {error:'Use one dimension throughout. Convert mass and volume on a documented formulation basis first.'};
      inputs=add(inputs,qty);
      let contribution=qty;
      if(line.kind==='compound'){
        const share=decimal(line.share);
        if(!share||!share.n||lt(hundred,share)||!str(line.spec))return {error:'Record the supplier composition reference and a share above 0% and up to 100% on the same basis.'};
        contribution={n:qty.n*share.n,scale:qty.scale+share.scale+2};
      }
      named=add(named,contribution);
    }
    if(lt(total,inputs))return {error:'The listed additions exceed the ingoing batch. Check units and double counting.'};
    const n=100n*named.n*pow(total.scale),d=total.n*pow(named.scale);
    return {n,d,text:shown(n,d),basis:unitFamily[m.unit]==='mass'?'w/w':'v/v'};
  }
  function placement(m) {
    if(m.pack==='nonretail')return 'Use the non-retail information requirements in regulation 10 for this container.';
    if(!entry('pack',m.pack))return 'Identify the pack being checked.';
    const area=decimal(m.area);
    if((str(m.area)&&(!area||!area.n))||(m.pack==='inner'&&!area))return 'Confirm total package surface area in cm² and how this unit is sold.';
    if(area&&!lt({n:100n,scale:0},area)){
      const outer=str(m.outer);
      return 'Regulation 8(1) covers the ingredient list on packages up to 100 cm² and requires the information on the multi-unit package. '+
        (outer?'Multi-unit artwork referenced: '+outer+'.':'Identify the corresponding multi-unit artwork and check its declarations.')+
        ' Review claims on this pack and the placement of any required percentage.';
    }
    if(m.pack==='inner')return 'Area exceeds 100 cm². Check the retail presentation of this inner pack.';
    return m.pack==='outer'?'Check the retail outer artwork for this variant.':'Check the retail artwork for the recorded SKU.';
  }
  const outcome=(kind,text)=>({kind,text});
  const pending=text=>outcome('pending',text);
  function decide(m) {
    if(!str(m.target)||!str(m.art)||!str(m.observation)||!entry('pack',m.pack))return pending('Identify the ingredient, artwork revision, pack and what the label shows.');
    if(m.pack==='nonretail')return outcome('other','Regulation 10 applies to the non-retail presentation. Check the intended retail artwork separately.');
    const present=m.name==='emphasis'||m.words==='yes'||m.picture==='yes';
    if(!str(m.recipe)||!entry('nature',m.nature)||m.nature==='unknown')return pending('Obtain the approved formulation and confirm whether the named food, a flavour, or both are present.');
    if(['flavourOnly','absent'].includes(m.nature)){
      if(present||m.name==='incidental')return outcome('representation','Artwork presents the named ingredient as present. Reconcile the wording or image with the recipe under regulation 4(3).');
      if(!entry('name',m.name)||m.name==='unknown'||!['yes','no'].includes(m.words)||!['yes','serving','no'].includes(m.picture))return pending('Check the name, claims and images for an impression of the ingredient being present.');
      if(m.picture==='serving'&&!str(m.contextRef))return pending('Document why the picture is a genuine serving suggestion.');
      if(m.nature==='flavourOnly')return outcome('flavour','The recipe identifies only added flavour. Verify the flavour declaration under regulation 5(5) and the overall impression under 4(3).');
      return outcome('absent','The reviewed ingredient is absent from the recipe. Check the true nature of the product and the basis of any printed percentage.');
    }
    if(!entry('food',m.food)||m.food==='unknown')return pending('Confirm whether this food is sold as a mixture or combination.');
    if(m.food==='single')return outcome('single','The general percentage rule covers mixtures and combinations. Check the single-ingredient identity and any specific standard.');
    if(m.exception==='specific'){
      return str(m.exceptionRef)?outcome('specific','Use the documented food-specific labelling provision and verify its own threshold and placement.'):
        pending('Identify the specific labelling provision, article and page for this food.');
    }
    if(m.nature==='agent')return str(m.contextRef)?outcome('agent','Flavouring-agent proviso (i) applies to this ingredient in its documented function. Check flavour labelling and the overall presentation.'):
      pending('Document why this ingredient functions solely as a flavouring agent.');
    if(m.exception==='nutrient')return str(m.exceptionRef)?outcome('nutrient','Proviso (vi) applies to the documented added micronutrient or preparation. Check the nutrition declaration under 5(3).'):
      pending('Identify the added micronutrient or preparation and its applicable nutrition declaration.');
    if(m.exception==='drained'&&!str(m.exceptionRef))return pending('Record where the required drained net weight is shown.');
    if(!entry('exception',m.exception)||m.exception==='unknown')return pending('Check applicable provisos, including food-specific rules.');
    if(present)return outcome('required','Declare the ingoing percentage under 5(2)(g)(i).'+(m.exception==='drained'?' Drained weight does not settle an emphasized ingredient in a mixed product.':''));
    if(!['absent','incidental','flavour'].includes(m.name)||m.words!=='no'||!['no','serving'].includes(m.picture))return pending('Check the food name, other wording and images for ingredient emphasis.');
    if((m.name==='incidental'||m.picture==='serving')&&!str(m.contextRef))return pending('Document the name-reference or serving-suggestion rationale and check for other emphasis.');
    if(m.name!=='incidental'){
      if(m.character==='yes'){
        if(m.name!=='absent')return pending('Resolve the flavour wording in the food name before relying on the outside-the-name trigger in 5(2)(g)(ii).');
        if(m.exception==='drained')return outcome('drained','The required drained weight is evidenced and no individual ingredient is emphasized. Proviso (iii) applies.');
        return outcome('required','Declare the ingoing percentage under 5(2)(g)(ii) for the expected, essential ingredient whose omission would mislead.');
      }
      if(m.character!=='no')return pending('Check all three conditions for an ingredient outside the food name.');
    }
    const notes=[];
    if(m.name==='incidental')notes.push('Documented non-misleading name reference under proviso (ii).');
    if(m.picture==='serving')notes.push('Serving-suggestion proviso (v) applies to the documented picture.');
    return outcome('untriggered',join([...notes,'No further trigger identified under 5(2)(g) on the recorded facts.']));
  }
  function compare(m,r,calc) {
    if(m.pack==='nonretail')return 'Check the non-retail provision.';
    if(r.kind==='specific')return 'Check the printed expression against the cited food-specific provision. The general ingoing recipe calculation is for reference.';
    if(!entry('print',m.print)||m.print==='unknown')return 'Printed percentage not yet checked.';
    if(m.print==='other')return 'Reconcile the printed expression, units and basis with the recipe.';
    if(m.print==='missing'){
      if(r.kind!=='required')return 'No percentage recorded on this artwork.';
      const area=decimal(m.area);
      if((area&&area.n&&!lt({n:100n,scale:0},area))||(m.pack==='inner'&&!area)||(str(m.area)&&(!area||!area.n)))return 'No percentage on this artwork. Resolve the pack and multi-unit placement.';
      return 'Required percentage missing on the reviewed artwork.';
    }
    const print=decimal(m.printed);
    if(!print||lt({n:100n,scale:0},print))return 'Enter the printed percentage as a number from 0 to 100.';
    if(['flavourOnly','absent'].includes(m.nature))return print.n?'The recipe does not substantiate the printed percentage of the named food. Recheck the claim.':'Review the zero-content claim against the recipe and the overall presentation.';
    if(calc.error)return 'Printed '+str(m.printed)+'%. '+calc.error;
    const scale=pow(print.scale),tag='Printed '+str(m.printed)+'% · recipe '+calc.text+' '+calc.basis+'. ';
    if(print.n*calc.d===calc.n*scale)return tag+'Exact numerical match.';
    if(print.n===0n||print.n===100n*scale)return tag+'The exact recipe differs from the zero or 100% claim. Review the claim basis.';
    if(rounded(calc.n,calc.d,print.scale)===print.n)return tag+'Matches only after rounding. Confirm the declaration precision and applicable rule.';
    return tag+'Printed percentage differs from the recipe.';
  }
  const O=root.PMSVIngredientOrder;
  const prefix='pmsv-fssai-artwork-percentage-r102:';
  const session=new Map();
  const identity=(id,m)=>prefix+JSON.stringify([id,...(m.type==='order'?O.identityParts(m):[m.sku,m.art,m.pack,m.target].map(str))]);
  function decode(key,json) {
    try{
      const parts=JSON.parse(key.slice(prefix.length)),v=JSON.parse(json),id=parts[0];
      const isOrder=v.review?.type==='order';
      if(!Array.isArray(parts)||parts.length!==(isOrder?7:5)||v.version!==1||!v.review||!Object.hasOwn(root.PMSVCatalogueRules.products,id))return null;
      if(isOrder&&(!O||!Object.hasOwn(O.scopes,v.review.scope)))return null;
      const m=isOrder?O.model(v.review):model(v.review);
      return identity(id,m)===key&&entry('pack',m.pack)?{id,key,raw:json,m}:null;
    }catch(_){return null;}
  }
  function savedByProduct() {
    const raw=new Map();
    try{
      const storage=root.localStorage;
      for(let i=0;storage&&i<storage.length;i++){
        const key=storage.key(i);
        if(key?.startsWith(prefix))raw.set(key,storage.getItem(key));
      }
    }catch(_){}
    for(const [key,value] of session)raw.set(key,value);
    const groups=new Map();
    for(const [key,json] of raw){
      const r=decode(key,json);if(!r)continue;
      if(!groups.has(r.id))groups.set(r.id,[]);
      groups.get(r.id).push(r);
    }
    for(const group of groups.values())group.sort((a,b)=>a.key.localeCompare(b.key));
    return groups;
  }
  function save(id,m,opened) {
    const isOrder=m.type==='order';
    if(isOrder&&(!O||!Object.hasOwn(O.scopes,m.scope)||(O.namedScope(m.scope)&&!str(m.listName))||![m.sku,m.art,entry('pack',m.pack)].every(str)))
      return {message:'Enter the SKU, artwork revision, pack and list being reviewed. Identify any compound ingredient or functional class.'};
    if(!Object.hasOwn(root.PMSVCatalogueRules.products,id)||(!isOrder&&![m.sku,m.art,m.target,entry('pack',m.pack)].every(str)))
      return {message:'Enter the SKU or variant, artwork revision, pack and ingredient to save this check.'};
    const key=identity(id,m),raw=JSON.stringify({version:1,review:isOrder?O.model(m):model(m)});
    const previous=(savedByProduct().get(id)||[]).find(r=>r.key===key);
    if(opened?.key===key&&previous?.raw!==opened.raw&&previous?.raw!==raw)
      return {message:'This saved check changed. Reopen its current version before editing it.'};
    if(previous&&previous.raw!==raw&&opened?.key!==key)
      return {message:'A check already exists for this artwork. Open it to edit, or use a different revision.'};
    let message=previous?(raw===previous.raw?'This check is already saved.':'Updated this artwork check.'):'Saved this artwork check.';
    try{root.localStorage.setItem(key,raw);session.delete(key);}
    catch(_){session.set(key,raw);message='Kept in this session. Export the artwork checks to retain them.';}
    notifyRequestChange();
    return {key,raw,message};
  }
  function remove(id,record) {
    const current=(savedByProduct().get(id)||[]).find(v=>v.key===record.key);
    if(current?.raw!==record.raw)return 'The saved check changed. Reopen it before removing it.';
    try{root.localStorage.removeItem(record.key);session.delete(record.key);}
    catch(_){
      if(!session.has(record.key))return 'Device storage is unavailable. The saved check was retained.';
      // A failed update may overlay an earlier device record. Do not claim its removal.
      session.delete(record.key);notifyRequestChange();return 'Removed the session copy. Recheck any earlier device copy when storage is available.';
    }
    notifyRequestChange();
    return 'Removed this artwork check.';
  }
  async function withArtworkLock(id,callback) {
    let entered=false;
    try {
      const locks=root.navigator?.locks;
      if(locks?.request)return await locks.request('pmsv-artwork-checks:'+id,()=>{entered=true;return callback();});
    }catch(error){
      if(entered)throw error;
      // Some offline browser contexts expose Web Locks but deny acquisition.
    }
    return callback();
  }
  root.addEventListener?.('storage',event=>{
    if(event.key!==null&&!event.key?.startsWith(prefix))return;
    notifyRequestChange();
    for(const element of root.document?.querySelectorAll('.quid-section[open], .order-section[open]')||[])element.dispatchEvent(new Event('pmsv-artwork-storage'));
  });
  function detail(m) {
    const legal=decide(m),math=calculate(m);
    const ref=join([m.sku,m.art,m.target,entry('pack',m.pack),m.recipe&&'Recipe '+m.recipe]);
    const facts=join([m.observation,entry('nature',m.nature),entry('food',m.food),entry('name',m.name),entry('words',m.words),
      entry('picture',m.picture),entry('character',m.character),entry('exception',m.exception),m.contextRef,m.exceptionRef]);
    const pack=join([m.area&&'Area '+m.area+' cm²',m.outer&&'Multi-unit '+m.outer,placement(m)]);
    const calculation=join([inputSummary(m),math.error||math.text+' '+math.basis]);
    return [join([ref,facts]),legal.text,pack,calculation,compare(m,legal,math)];
  }
  const requestColumns=['SKU or variant and recipe','Artwork revisions and packs','Recipe information required from R&D'];
  function recipeQuestions(m) {
    const issues=new Set();
    const ask=text=>issues.add(str(m.target)+' — '+text);
    const extra=str(m.rdRequest).split(/\r?\n/).map(str).filter(Boolean);
    for(const note of extra)ask(note);
    if(m.pack==='nonretail')return [...issues];

    if(!str(m.recipe))issues.add('Provide the approved formula reference and revision used for this artwork.');
    const unknown=!entry('nature',m.nature)||m.nature==='unknown';
    const highlighted=m.name==='emphasis'||m.words==='yes'||m.picture==='yes';
    const outsideName=m.name==='absent'&&m.character==='yes'&&m.exception!=='drained';
    const labelPointsToIngredient=highlighted||outsideName;
    const printedAmount=m.print==='value'||m.print==='other';
    if(unknown){
      ask('Confirm whether the formula contains the named ingredient, only a corresponding flavour, both, or neither.');
      if(printedAmount||(labelPointsToIngredient&&m.food!=='single'&&!['specific','nutrient'].includes(m.exception)))
        ask('If present as an ingredient, provide the total ingoing batch and units, each direct or compound addition and its quantity, and the share and supplier reference for each preparation.');
      return [...issues];
    }
    if(m.nature==='absent'||m.nature==='flavourOnly')return [...issues];
    if(m.nature==='agent'&&!str(m.contextRef))ask('Provide the formulation or specification reference confirming its flavouring function.');
    if(m.nature!=='agent'&&(!entry('food',m.food)||m.food==='unknown'))
      issues.add('Confirm whether the SKU is a mixture or a single-ingredient food.');
    const recordsInputs=m.lines.some(l=>[l.source,l.amount,l.share,l.spec].some(str));
    const decision=decide(m).kind;
    const potential=decision==='required'||(decision==='pending'&&labelPointsToIngredient&&m.food!=='single'&&m.nature!=='agent'&&!['specific','nutrient'].includes(m.exception));
    if(!printedAmount&&!recordsInputs&&!str(m.total)&&!potential)return [...issues];

    const total=quantity(m.total,m.unit);
    if(!total)issues.add('Provide the total ingoing batch quantity and its mass or volume unit.');
    if(!recordsInputs){
      ask('List each direct addition or contributing preparation with its quantity and unit. For each preparation, include the named share and supplier composition reference.');
      return [...issues];
    }
    let sum={n:0n,scale:0},comparable=!!total;
    m.lines.forEach((line,i)=>{
      const name=str(line.source)||'Addition '+(i+1);
      const qty=quantity(line.amount,line.unit);
      if(!str(line.source))ask(name+' — identify the ingredient or preparation.');
      if(!entry('kind',line.kind))ask(name+' — confirm whether the addition is direct or part of a preparation.');
      if(!qty)ask(name+' — provide a positive ingoing quantity and its unit.');
      if(qty&&total&&unitFamily[m.unit]!==unitFamily[line.unit])
        ask(name+' — provide the quantity on the same mass or volume basis as the batch, with the conversion basis if needed.');
      if(!qty||unitFamily[m.unit]!==unitFamily[line.unit])comparable=false;
      else sum=add(sum,qty);
      if(line.kind!=='compound')return;
      const share=decimal(line.share);
      if(!share||!share.n||lt({n:100n,scale:0},share))
        ask(name+' — confirm the named ingredient’s percentage in the preparation on the same basis.');
      if(!str(line.spec))ask(name+' — provide the supplier composition specification or formula reference.');
    });
    if(comparable&&lt(total,sum))ask('Reconcile the listed additions with the total ingoing batch. Check the quantities, units and any double counting.');
    return [...issues];
  }
  function requestRows(groups=savedByProduct()) {
    const requests=new Map();
    for(const [id,records] of groups){
      for(const {m} of records){
        const questions=m.type==='order'?O.analyse(m).rd:recipeQuestions(m);
        if(!questions.length)continue;
        const sku=str(m.sku),recipe=str(m.recipe),art=str(m.art),pack=entry('pack',m.pack);
        // With no approved revision, two pack artworks can refer to different formulas.
        const key=JSON.stringify(recipe?[id,sku,recipe]:[id,sku,null,art,m.pack]);
        if(!requests.has(key)){
          const label=[sku,root.PMSVCatalogueRules.products[id].name,recipe?'Recipe '+recipe:'Recipe revision pending'].join('\n');
          requests.set(key,{label,artworks:new Set(),questions:new Set()});
        }
        const item=requests.get(key);
        item.artworks.add(art+' · '+pack);
        for(const question of questions)item.questions.add(question);
      }
    }
    const lines=set=>[...set].sort((a,b)=>a.localeCompare(b,'en')).join('\n');
    const rows=[...requests.values()].map(r=>[r.label,lines(r.artworks),lines(r.questions)]);
    rows.sort((a,b)=>a[0].localeCompare(b[0],'en')||a[1].localeCompare(b[1],'en'));
    return [requestColumns,...rows];
  }
  function requestText(rows) {
    return rows.slice(1).map(([name,art,questions])=>name.split('\n').join(' · ')+'\n'+art.split('\n').join(' / ')+'\n'+
      questions.split('\n').map(s=>'• '+s).join('\n')).join('\n\n');
  }
  function attachRequests(panel,writeCSV) {
    const preview=panel.querySelector('[data-rd-preview]'),status=panel.querySelector('[data-rd-status]');
    const copy=panel.querySelector('[data-rd-copy]'),exportButton=panel.querySelector('[data-rd-export]');
    const fallback=panel.querySelector('[data-rd-fallback]');
    let generation=0;
    function refresh(){
      generation++;
      const rows=requestRows(),count=rows.length-1;
      status.textContent=count?count+' open '+(count===1?'request':'requests')+'.':'No open recipe requests in saved artwork checks.';
      preview.innerHTML=count?'<table><thead><tr>'+requestColumns.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+
        rows.slice(1).map(row=>'<tr>'+row.map((v,i)=>'<td><span class="rd-mobile-label" aria-hidden="true">'+esc(requestColumns[i])+'</span>'+
          esc(v).replace(/\n/g,'<br>')+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'';
      copy.disabled=exportButton.disabled=!count;
      fallback.hidden=true;fallback.value='';
      return rows;
    }
    panel.addEventListener('toggle',()=>{if(panel.open)refresh();});
    root.addEventListener?.('pmsv-artwork-updated',()=>{if(panel.open)refresh();});
    exportButton.addEventListener('click',()=>{
      const rows=refresh();
      if(rows.length>1)writeCSV(rows,'PMSV-RD-Recipe-Requests.csv');
    });
    copy.addEventListener('click',async()=>{
      const rows=refresh();
      if(rows.length===1)return;
      const text=requestText(rows),current=generation;
      try{
        await root.navigator.clipboard.writeText(text);
        if(current===generation)status.textContent='Copied the R&D recipe request.';
      }catch(_){
        if(current!==generation)return;
        fallback.hidden=false;fallback.value=text;fallback.focus();fallback.select();
        status.textContent='Select and copy the recipe request below.';
      }
    });
  }
  function notifyRequestChange(){
    if(typeof root.dispatchEvent==='function')root.dispatchEvent(new root.Event('pmsv-artwork-updated'));
  }
  const sourceText=Object.values(sources).join(' | ');
  const describe=m=>detail(m).join(' | ');
  const hasData=m=>scalarKeys.some(k=>str(m[k]))||m.lines.some(r=>r.source||r.amount||r.share||r.spec);
  function values(id,state,groups) {
    const m=draft(state),all=groups?.get(id)||[],saved=all.filter(r=>r.m.type!=='order');
    const requests=requestRows(new Map([[id,all]]));
    return [sourceText,...(hasData(m)?detail(m):['','','','','']),saved.length,saved.map(r=>describe(r.m)).join('\n'),requests.length-1,requestText(requests)];
  }
  function brief(id,state,groups=savedByProduct()) {
    const v=values(id,state,groups);
    if(!v[1]&&!v[6])return v[8]?['R&D recipe requests',v[9]]:[];
    return ['Ingredient percentage on artwork',...v.slice(1,6).filter(Boolean),v[6]?'Saved artwork checks ('+v[6]+')':'',v[7],v[8]?'R&D recipe requests':null,v[9],sourceText].filter(Boolean);
  }
  function exportRows(id){
    const rows=(savedByProduct().get(id)||[]).filter(r=>r.m.type!=='order');
    return [['Catalogue ID','SKU or variant','Artwork revision','Pack','Reviewed ingredient','Artwork and evidence','Declaration finding',
      'Pack and placement','Recipe calculation','Printed percentage comparison','Legal sources',requestColumns[2]],
      ...rows.map(({m})=>[id,m.sku,m.art,entry('pack',m.pack),m.target,...detail(m),sourceText,recipeQuestions(m).join('\n')])];
  }

  const select=(key,title,value,options,attr='data-quid')=>'<label>'+esc(title)+'<select '+attr+'="'+key+'"><option value="">Choose</option>'+
    Object.entries(options).map(([k,l])=>'<option value="'+k+'"'+(value===k?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select></label>';
  const input=(key,title,value,numeric=false,attr='data-quid')=>'<label>'+esc(title)+'<input '+attr+'="'+key+'" maxlength="'+(numeric?'48':'320')+'"'+
    (numeric?' inputmode="decimal"':'')+' value="'+esc(value)+'"></label>';
  function form(m) {
    const field=(key,title,numeric=false)=>input(key,title,m[key],numeric);
    const choice=(key,title)=>select(key,title,m[key],labels[key]);
    const extra='<label>Other recipe details needed from R&amp;D (optional, one per line)<textarea data-quid="rdRequest" maxlength="1600" rows="2">'+esc(m.rdRequest)+'</textarea></label>';
    let html='<h5>Artwork and recipe</h5>'+field('sku','SKU or variant')+field('art','Artwork code and revision')+field('target','Ingredient or category being assessed')+
      choice('pack','Pack being reviewed')+field('observation','Wording, picture or ingredient statement on this artwork');
    if(m.pack==='nonretail')return html+'<p>'+labelLink(sources.nonretail,'Non-retail containers, regulation 10')+'</p>'+extra;
    if(m.pack)html+=field('area','Total package surface area in cm², if checking small-pack relief',true);
    const area=decimal(m.area);
    if(m.pack==='inner'||(area&&area.n&&!lt({n:100n,scale:0},area)))html+=field('outer','Corresponding retail multi-unit artwork revision');
    html+=choice('food','Food as marketed')+field('recipe','Approved recipe or composition reference and revision')+
      choice('nature','What does the recipe establish about this ingredient?')+'<h5>Label presentation</h5>'+
      choice('name','Reference in the food name')+choice('words','Other words on the artwork')+choice('picture','Picture or graphic');
    if(['absent','flavour','unknown'].includes(m.name)||!m.name)
      html+=choice('character','Outside the name, is the ingredient essential to the food, expected by consumers, and would omitting its percentage mislead?');
    if(m.name==='incidental'||m.picture==='serving'||m.nature==='agent')
      html+=field('contextRef','Evidence for the name reference, serving image or flavouring function');
    if(m.food==='mixture'){
      html+=choice('exception','Other provisos under regulation 5(2)(g)');
      if(['drained','specific','nutrient'].includes(m.exception))html+=field('exceptionRef','Provision, declaration or artwork evidence for the selected proviso');
    }
    if(['actual','both','agent'].includes(m.nature)){
      html+='<h5>Ingoing recipe quantities</h5><p>Use the total at manufacture. Count each addition once. For a preparation, enter the share of the named ingredient on the same mass or volume basis.</p>'+
        field('total','Total ingoing batch quantity',true)+choice('unit','Batch unit');
      html+=m.lines.map((line,i)=>'<fieldset class="quid-line" data-quid-index="'+i+'"><legend>Recipe addition '+(i+1)+'</legend>'+
        select('kind','Type of addition',line.kind,labels.kind,'data-quid-line')+input('source','Ingredient or preparation name',line.source,false,'data-quid-line')+
        input('amount','Ingoing quantity',line.amount,true,'data-quid-line')+select('unit','Quantity unit',line.unit,labels.unit,'data-quid-line')+
        (line.kind==='compound'?input('share','Named ingredient in the preparation (%)',line.share,true,'data-quid-line')+input('spec','Supplier composition or formula reference',line.spec,false,'data-quid-line'):'')+
        (m.lines.length>1?'<button type="button" data-quid-remove-line="'+i+'">Remove addition</button>':'')+'</fieldset>').join('')+
        '<button type="button" data-quid-add-line>Add recipe addition</button>';
    }
    html+=choice('print','Percentage on this artwork');
    if(m.print==='value')html+=field('printed','Printed percentage, retaining decimal places',true);
    return html+extra;
  }
  function findings(m) {
    const legal=decide(m),calc=calculate(m);
    const result=calc.error?(m.nature==='actual'||m.nature==='both'||m.nature==='agent'?calc.error:''):'Ingoing percentage '+calc.text+' '+calc.basis+'.';
    return [legal.text,m.pack&&placement(m),result,(m.print||legal.kind==='required')&&compare(m,legal,calc)].filter(Boolean).map(s=>'<p>'+esc(s)+'</p>').join('');
  }
  function section() {
    return '<details class="ws-section quid-section"><summary>Ingredient percentage on artwork</summary><div><p>'+sourceLinks()+'</p><div data-quid-form></div>'+
      '<div data-quid-result role="status"></div><button type="button" data-quid-save>Save artwork check</button> '+
      '<button type="button" data-quid-new>Start another ingredient</button><p data-quid-status role="status"></p><div data-quid-saved></div></div></details>';
  }
  function attach(node,id,state) {
    const sectionNode=node.querySelector('.quid-section');if(!sectionNode)return;
    let m=draft(state),opened=null,visible=[],ready=false;
    const target=k=>sectionNode.querySelector('[data-quid-'+k+']');
    const status=text=>{target('status').textContent=text;};
    function refreshSaved(){
      visible=(savedByProduct().get(id)||[]).filter(r=>r.m.type!=='order');
      target('saved').innerHTML=visible.length?'<h5>Saved artwork checks ('+visible.length+')</h5><ul>'+visible.map(({m},i)=>
        '<li>'+esc(join([m.sku,m.art,entry('pack',m.pack),m.target]))+' <button type="button" data-quid-open="'+i+'">Open</button> '+
        '<button type="button" data-quid-delete="'+i+'">Remove</button></li>').join('')+'</ul><button type="button" data-quid-export>Export artwork checks as CSV</button>':'';
    }
    const refresh=()=>{target('form').innerHTML=form(m);target('result').innerHTML=findings(m);};
    function changed(){
      state.quidDraft=JSON.stringify(m);
      const feedback=node.querySelector('[data-ws-saved]');
      if(feedback)feedback.textContent='Unsaved worksheet changes';
      status('');
    }
    sectionNode.addEventListener('pmsv-artwork-storage',refreshSaved);
    sectionNode.addEventListener('toggle',()=>{
      if(!sectionNode.open)return;
      if(!ready){refresh();ready=true;}
      refreshSaved();
    });
    sectionNode.addEventListener('input',e=>{
      const el=e.target,key=el.dataset.quid,lineKey=el.dataset.quidLine;
      if(key!=='rdRequest'&&!scalarKeys.includes(key)&&!lineKeys.includes(lineKey))return;
      if(lineKey){
        const line=m.lines[Number(el.closest('[data-quid-index]').dataset.quidIndex)];
        line[lineKey]=el.value;
        if(lineKey==='kind'){line.spec='';line.share='';}
      }else{
        const previous=m[key];
        m[key]=el.value;
        if(['sku','art','pack'].includes(key)&&str(previous)&&previous!==m[key]){
          for(const field of ['area','outer','observation','name','words','picture','character','contextRef','exception','exceptionRef','print','printed'])m[field]='';
          m.rdRequest='';
          if(key==='sku'){m.recipe='';m.nature='';m.food='';m.lines=[emptyLine()];m.total='';m.unit='';}
        }
        if(key==='food'&&m.food!=='mixture'){m.exception='';m.exceptionRef='';}
        if(key==='area'&&m.pack!=='inner'){const area=decimal(m.area);if(!area||lt({n:100n,scale:0},area))m.outer='';}
        if(key==='exception')m.exceptionRef='';
        if(key==='print')m.printed='';
        if(key==='name'&&!['absent','flavour','unknown'].includes(m.name))m.character='';
        if(['name','picture','nature'].includes(key))m.contextRef='';
        if(key==='nature'&&(str(previous)||!['actual','both','agent'].includes(m.nature))){m.lines=[emptyLine()];m.total='';m.unit='';}
        if(key==='target'||key==='recipe'){
          if(key==='target')m.rdRequest='';
          // A new ingredient or recipe must not inherit a previously calculated percentage.
          m.lines=[emptyLine()];m.total='';m.unit='';m.nature='';m.contextRef='';m.exception='';m.exceptionRef='';
          if(key==='target'){m.name='';m.words='';m.picture='';m.character='';m.observation='';m.print='';m.printed='';}
        }
      }
      changed();
      const refreshForm=el.tagName==='SELECT'||['sku','art','target','recipe','area'].includes(key);
      if(refreshForm){
        const index=el.closest('[data-quid-index]')?.dataset.quidIndex;
        const selector=lineKey?'[data-quid-index="'+index+'"] [data-quid-line="'+lineKey+'"]':'[data-quid="'+key+'"]';
        const caret=el.tagName==='INPUT'?el.selectionStart:null;
        refresh();
        const next=target('form').querySelector(selector);next?.focus();
        if(caret!==null)next?.setSelectionRange(caret,caret);
      }else target('result').innerHTML=findings(m);
    });
    sectionNode.addEventListener('click',async e=>{
      const button=e.target.closest('button');if(!button)return;
      if(button.hasAttribute('data-quid-add-line')){
        m.lines.push(emptyLine());changed();refresh();
        target('form').querySelector('[data-quid-index="'+(m.lines.length-1)+'"] select')?.focus();
      }else if(button.hasAttribute('data-quid-remove-line')){
        m.lines.splice(Number(button.dataset.quidRemoveLine),1);changed();refresh();
      }else if(button.hasAttribute('data-quid-save')){
        const copy=model(m),editing=opened;
        const result=await withArtworkLock(id,()=>save(id,copy,editing));
        if(result.key&&result.key===identity(id,m))opened=result;
        status(result.message);refreshSaved();
      }else if(button.hasAttribute('data-quid-new')){
        const old=m;m=fresh();
        for(const key of ['sku','art','pack','area','outer','food','recipe'])m[key]=old[key];
        opened=null;changed();refresh();target('form').querySelector('[data-quid="target"]').focus();
      }else if(button.hasAttribute('data-quid-open')){
        const r=visible[Number(button.dataset.quidOpen)];if(!r)return;
        m=model(r.m);opened=r;changed();refresh();status('Opened the saved artwork check.');
      }else if(button.hasAttribute('data-quid-delete')){
        const r=visible[Number(button.dataset.quidDelete)];if(!r)return;
        status(await withArtworkLock(id,()=>remove(id,r)));if(opened?.key===r.key)opened=null;refreshSaved();
      }
    });
  }
  root.PMSVIngredientPercentage=Object.freeze({sources,columns,arithmetic:Object.freeze({decimal,lt,add}),packLabels:labels.pack,identity,withArtworkLock,model,draft,calculate,placement,decide,compare,save,remove,savedByProduct,requestRows,requestText,requestColumns,recipeQuestions,attachRequests,exportRows,values,brief,section,attach});
})(globalThis);
