/* CTR 2.3.1. A result belongs to the sampled article and the selected source row. */
(function (root) {
  'use strict';
  const review = root.PMSV_REVIEW_REGISTER?.pesticideReview;
  const products = root.PMSVCatalogueRules?.products;
  if (!products || !review?.groups || !review.teaDirections) return;
  const sources = review.sources;
  const norm = value => String(value || '').trim().toLowerCase();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const ref = (url, label) => '<a class="source-ref" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>';
  const roleNames = {product:'Marketed product',ingredient:'Separately sampled ingredient'};
  const processes = {raw:'Raw agricultural commodity',physical:'Physical processing only',thermal:'Thermal or chemical processing',tea:'Plain tea under the cited tea direction',unknown:'Process or article still under review'};
  const routes = {
    named:'Named sample available', tea:'Tea directions', raw:'Raw or physical commodity review',
    spice:'Spice or culinary herb review', ingredient:'Finished process or recipe review', other:'Article classification required'
  };
  // Each spelling is a named article in the table. Broad group wording remains
  // visible in the source browser and is never used to substitute for a commodity.
  const matrices = {
    wheat:['Wheat grain','Wheat','Wheat grains'],flour:['Wheat flour','Wheat Flour'],rice:['Rice','Rice'],
    maize:['Maize grain','Maize','Corn'],soy:['Soya bean seed','Soya bean','Soyabean','Soya bean seed'],
    groundnut:['Groundnut kernel or seed','Groundnut','Ground nut','Groundnut Seed','Ground nut seed','Groundnut seeds'],
    areca:['Areca nut','Areca nut'],cane:['Sugarcane','Sugarcane'],coconut:['Coconut','Coconut'],
    chickpea:['Chickpea','Chickpea','Chick pea','Bengal gram'],greenGram:['Green gram','Green gram'],blackGram:['Black gram','Black gram','Black gram seed','Blackgram'],
    pigeon:['Pigeon pea','Pigeon pea','Pigeon pea seeds','Red gram'],bajra:['Pearl millet','Pearl Millet (Bajra)'],sorghum:['Sorghum','Sorghum'],
    cotton:['Cottonseed','Cotton seed','Cottonseed'],sunflower:['Sunflower seed','Sunflower seed'],mustard:['Mustard seed','Mustard seed','Mustard'],sesame:['Sesamum','Sesamum'],
    coffee:['Raw coffee beans','Coffee (Raw beans)'],cocoa:['Cocoa beans'],almond:['Almond kernels'],
    apple:['Apple','Apple'],banana:['Banana','Banana'],grape:['Grapes','Grape','Grapes'],guava:['Guava','Guava'],mango:['Mango','Mango'],
    pineapple:['Pineapple','Pine apple','Pineapple'],pomegranate:['Pomegranate','Pomegranate'],papaya:['Papaya','Papaya'],
    potato:['Potato','Potato'],tomato:['Tomato','Tomato'],onion:['Onion','Onion','Onions'],okra:['Okra','Okra'],cabbage:['Cabbage','Cabbage'],
    brinjal:['Brinjal','Brinjal'],cauliflower:['Cauliflower','Cauliflower'],freshChilli:['Fresh chilli','Chilli','Chilly'],
    dryChilli:['Dried chilli','Dry chilli','Dried chilli','Dry chilly'],cardamom:['Cardamom','Cardamom'],cumin:['Cumin seed (Cuminum cyminum)','Cumin'],
    pepper:['Black pepper','Black pepper'],turmeric:['Turmeric','Turmeric'],eggs:['Eggs','Eggs'],milk:['Milk','Milk and Milk products'],
    meat:['Meat or poultry','Meat and Poultry','Meat & Poultry','Meat and poultry (carcass fat)','Meat and Meat products'],
    fish:['Finfish','Fish'],tea:['Plain tea'],greenTea:['Green tea','Green tea']
  };
  const spiceMatrices=new Set(['cardamom','cumin','pepper','turmeric','dryChilli','mustard']);
  const assignments=new Map();
  function assign(prefix, entries) {
    for (const [suffix, choices] of Object.entries(entries)) {
      const id=prefix+suffix;
      if (!Object.hasOwn(products,id)) throw new Error('Unknown pesticide catalogue assignment '+id);
      assignments.set(id,choices.split(' '));
    }
  }
  assign('06-06-1-', {
    wheat:'wheat','durum-wheat':'wheat', maize:'maize',rice:'rice','basmati-rice':'rice',soybean:'soy',
    millets:'bajra sorghum',pulses:'chickpea greenGram blackGram pigeon','unprocessed-whole-raw-pulses-not-for-direct-human-consumption':'chickpea greenGram blackGram pigeon'
  });
  assign('06-06-2-',{'wheat-flour-atta-and-resultant-wheat-flour-resultant-atta':'flour','maida-refined-wheat-flour':'flour','durum-wheat-maida':'flour'});
  const fruitChoices='apple banana grape guava mango pineapple pomegranate papaya';
  const vegChoices='potato tomato onion okra cabbage brinjal cauliflower freshChilli';
  assign('04-04-1-',{'groundnut-kernel-deshelled':'groundnut','arecanuts-or-betalnuts-or-supari':'areca','untreated-fresh-fruit':fruitChoices,
    'surface-treated-fresh-fruit':fruitChoices,'peeled-or-cut-minimally-processed-fruit':fruitChoices,'frozen-fruits-fruit-products':fruitChoices});
  assign('04-04-2-',{'untreated-fresh-vegetables':vegChoices,'surface-treated-fresh-vegetables':vegChoices,
    'peeled-cut-or-shredded-minimally-processed-vegetables':vegChoices,'frozen-vegetables':vegChoices});
  assign('12-12-2-',{'cardamom-elaichi':'cardamom','chillies-and-capsicum-lal-mirchi':'dryChilli','cumin-zeera-kalonji':'cumin',
    'mustard-rai-sarson':'mustard','black-white-and-green-bwg-peppers':'pepper','turmeric-haldi':'turmeric'});
  assign('01-01-1-',{'cow-milk':'milk','goat-milk':'milk','buffalo-milk':'milk','sheep-milk':'milk','camel-milk':'milk','mixed-milk':'milk'});
  assign('10-10-1-',{'fresh-eggs':'eggs'});
  for (const id of Object.keys(products)) {
    if(id.startsWith('08-08-1-fresh-or-chilled-')) assignments.set(id,['meat']);
  }
  assign('09-09-2-',{'frozen-finfish':'fish'});
  const teaIds = new Set(['tea','kangra-tea','green-tea']);
  const profileCache=new Map();
  function profile(id) {
    if (!Object.hasOwn(products,id)) return null;
    if (profileCache.has(id)) return profileCache.get(id);
    let grade='other', choices=[], note='Establish the marketed article, process and sampled portion. Check the Gazette index for specific or group entries and applicable directions.';
    if (teaIds.has(id)) {
      grade='tea';choices=[id==='green-tea'?'greenTea':'tea'];
      note='Identify the tea as sold. The 2023 and 2024 directions name plain tea. Green tea has separate printed rows that need reconciliation. Brewed drinks and extracts need their own article.';
    } else if (assignments.has(id)) {
      grade='named';choices=assignments.get(id);
      note='Select the actual crop, species or form and document its process. The listed sample choices cover specific printed articles. Check other group rows and directions independently.';
      if (/black-white-and-green/.test(id)) note='Only the black-pepper variant has a specific sample choice here. Check separate scope for white or green pepper.';
      if (id.includes('cumin-zeera')) note='Confirm the botanical identity as Cuminum cyminum. Kalonji or black cumin needs a separate article review.';
      if (choices.includes('milk')) note='Confirm raw milk and the sampled fraction. A cooked, pasteurised or chemically treated sample needs assessment under the processing clarification.';
    } else if (id==='04-04-2-cocoa-beans'||id==='04-04-1-almond-kernels') {
      grade='raw';choices=[id.endsWith('cocoa-beans')?'cocoa':'almond'];
      note='The 213-serial table has no entry expressly naming '+matrices[choices[0]][0].toLowerCase()+'. Check wider food groups, actual processing and applicable directions before considering the general note.';
    } else if (id.startsWith('12-12-2-')&&!/powder-amchur|curry-powder|mixed-masala|paste|oleoresins|seasoning/.test(id)) {
      grade='spice';note='Identify the spice or culinary herb, plant part and processing. Apply the April 2024 hierarchy to the specific pesticide. Record the CIB&RC and Codex evidence where required.';
    } else if (/^0[46]-/.test(id)&&/untreated|whole-raw|kernels|seeds|foodgrains|dehydrated|peeled|fruit|berries|millet|lentils/.test(id)&&!/thermally|toffee|paste|concentrate|preserv|chutney|jellies|pickles|crystallis|fruit-cheese|pulp|fruit-bar|flour|based-food|flakes/.test(id)) {
      grade='raw';note='Confirm species, plant part and processing. Search specific and group food articles. Review the fallback only after establishing the applicable food and pesticide scope.';
    } else if (/^05-|^07-|^11-11-1-|^102-|^18-|^13-|^14-14-2-|thermally|boiled|canned|baked|roasted|paste|concentrate|refined|hydrogenated|cheese|fermented|powder|premix|sauce|mixture|confectionery|instant-tea|coffee/.test(id)) {
      grade='ingredient';note='Document the finished process and formula. Assess any separately sampled agricultural input against its own article. A raw commodity result describes that sample only.';
      if (id==='05-05-1-chocolate'||id.includes('cocoa-powder')||id.includes('cocoa-mass')) note='Record the cocoa form and whether it was roasted, alkalised or otherwise processed. An incoming cocoa bean, nut or milk report belongs to that ingredient. The table has no named chocolate or cocoa-bean entry.';
      if (id.includes('sugar-boiled-confectionery')||id.startsWith('11-11-1-')&&id.includes('sugar')) note='Sugarcane is a named crop. Refined sugar and boiled candy need their own processing assessment. Use a sugarcane row only for a separately identified sugarcane sample.';
    }
    const result={grade,choices,note};
    profileCache.set(id,result);return result;
  }
  const rowIndex=[], byGroup=new Map(), byMatrix=new Map();
  for(const g of review.groups) {
    const rows=g.rows.map(([article,limit,page,condition,subgroup,articleCell,limitCell],i)=>{
      const row={key:g.serial+'-'+i,serial:g.serial,drug:g.printed,alias:g.name,article,limit,page,condition,subgroup,
        articleCell:articleCell||article,limitCell:limitCell||limit,source:'gazette',url:sources.gazette+'#page='+page};
      rowIndex.push(row);return row;
    });
    byGroup.set(g.serial,rows);
  }
  const directed=review.teaDirections.map(([serial,drug,limit,source])=>({
    key:source+'-'+serial,serial,drug,alias:drug,article:'Tea',limit,source,page:1,url:sources[source]+'#page=1',condition:'',subgroup:''
  }));
  const directionSerials=new Set(directed.map(r=>r.serial));
  for(const [matrix,[, ...names]] of Object.entries(matrices)) {
    const articles=new Set(names.map(norm));
    byMatrix.set(matrix,matrix==='tea'?directed:rowIndex.filter(r=>articles.has(norm(r.article))));
  }
  const fields=['pestRole','pestMatrix','pestProcess','pestRow','pestSample','pestReport','pestKind','pestValue','pestUnit','pestLoq','pestPortion','pestBasis'];
  const columns=['Pesticide review route · CTR 2.3.1','Named pesticide sample choices','Pesticide article and processing checks',
    'Pesticide source references','Recorded pesticide sample and process','Selected pesticide and source limit','Pesticide laboratory evidence','Pesticide comparison for recorded sample'];
  function identifiesRole(s) {return !s.pestRole || Object.hasOwn(roleNames,s.pestRole);}
  function current(id,s={}) {
    const p=profile(id);
    if (!p) return null;
    const role=s.pestRole||'product';
    const choices=!identifiesRole(s)?[]:role==='ingredient'?Object.keys(matrices):p.choices;
    const matrix=choices.includes(s.pestMatrix)?s.pestMatrix:'';
    const options=byMatrix.get(matrix)||[];
    const row=options.find(r=>r.key===s.pestRow);
    return {p,role,choices,matrix,options,row};
  }
  function lock(row,matrix,options) {
    if (matrix==='greenTea') return 'Green-tea and plain-tea sources require an article-specific review.';
    if (row.source!=='gazette') return '';
    if (row.limit==='$') return 'The dollar mark refers to copper under CTR 2.1. Use the copper article and its basis.';
    if (review.nameHolds.includes(row.serial)) return 'Reconcile the different Gazette and compendium chemical names and residue definitions.';
    if ((row.serial===22&&norm(row.article)==='maize')||(row.serial===23&&norm(row.article)==='rice'))
      return 'The Gazette prints two entries for this pesticide and commodity. Both require source interpretation.';
    if (row.serial===64) return 'Dithiocarbamate rows require a subgroup-specific interpretation and the CS₂ residue expression.';
    if (row.serial===50&&row.subgroup) return 'Confirm the separate alpha-cypermethrin sub-entry and its residue definition.';
    if (row.serial===36&&norm(row.article)==='food grains') return 'Reconcile the Gazette food-grains wording with the compendium.';
    if (options.some(r=>r.key!==row.key&&r.serial===row.serial))
      return 'More than one printed row matches this sample choice. Resolve the article and qualifiers before comparison.';
    return '';
  }
  const portions={'shell-free':'Shell-free sample',fat:'Fat basis','carcass-fat':'Carcass fat'};
  function portion(row) {
    const text=row.article+' '+row.condition;
    if(/shell[ -]free/i.test(text)) return 'shell-free';
    if(/carcass fat/i.test(text)) return 'carcass-fat';
    if(/fat basis|\(F\)/i.test(text)) return 'fat';
    return '';
  }
  const clean=v=>typeof v==='string'?v.trim():'';
  function compare(id,s={}) {
    const ctx=current(id,s);if(!ctx?.row) return '';
    const {row,matrix,options,role}=ctx;
    const sourceLock=lock(row,matrix,options);if(sourceLock) return sourceLock;
    if (row.source==='gazette'?!['raw','physical'].includes(s.pestProcess):s.pestProcess!=='tea')
      return 'Document an eligible processing route for the selected source.';
    if (!clean(s.pestSample)||!clean(s.pestReport)||s.pestBasis!=='yes'||s.pestUnit!=='mg/kg')
      return 'Confirm the sample and report references, mg/kg, residue definition and printed analytical basis.';
    if(portion(row)&&s.pestPortion!==portion(row)) return 'The printed row requires the '+portions[portion(row)].toLowerCase()+'. Confirm the portion or basis on the report.';
    const criterion=row.limit.replace(/\*$/,'');
    const decimal=root.PMSVCatalogueWorksheets?.compare;
    if (!decimal) return '';
    const against=(a,op,b)=>decimal({operator:op,value:b},a);
    const value=clean(s.pestValue),loq=clean(s.pestLoq);
    if (!['quantified','less'].includes(s.pestKind)||against(value,'>=','0')!==true)
      return 'Enter a decimal value and choose quantified or less-than. A report giving ND alone needs a reporting threshold.';
    if (row.limit.endsWith('*')||loq) {
      if (against(loq,'>','0')!==true||row.limit.endsWith('*')&&against(loq,'<=',criterion)!==true)
        return 'Enter a positive validated method LOQ. For a starred MRL the method LOQ must be at or below the printed limit.';
      if (against(value,'<',loq)) return 'The reported value or threshold is below the stated method LOQ. Review the laboratory report.';
    }
    const within=against(value,'<=',criterion);
    if (within===null) return 'This printed limit needs source interpretation.';
    const suffix=' for '+roleNames[role].toLowerCase()+' · '+matrices[matrix][0]+' · '+row.drug+' · '+row.limit+' mg/kg.';
    if (s.pestKind==='less') {
      if(against(value,'>','0')!==true) return 'Enter a positive less-than reporting threshold.';
      return (within?'Reported upper bound is within the cited limit':'Inconclusive because the reporting threshold exceeds the cited limit')+suffix;
    }
    return (within?'At or below the cited limit':'Above the cited limit')+suffix;
  }
  function sourceList(p) {
    const list=[sources.gazette+'#page=31',sources.scope+'#page=1'];
    if (p.grade==='spice'||p.choices.some(k=>spiceMatrices.has(k))) list.push(sources.spice+'#page=1');
    if (p.grade==='tea') list.push(sources.tea2023,sources.tea2024,sources.teaTesting,sources.teaDraft);
    return list;
  }
  const fieldsAfterRow=['pestReport','pestKind','pestValue','pestUnit','pestLoq','pestPortion','pestBasis'];
  function values(id,s={}) {
    const {p,role,matrix,row}=current(id,s);
    const sample=matrix&&clean(s.pestSample)?[roleNames[role],matrices[matrix][0],processes[s.pestProcess]||'Process pending',clean(s.pestSample)].join(' · '):'';
    return [routes[p.grade],p.choices.map(k=>matrices[k][0]).join(' | '),p.note,sourceList(p).join(' | '),sample,
      row?[row.drug,row.article,row.limit+(row.limit==='$'?'':' mg/kg'),row.condition,row.subgroup,row.url].filter(Boolean).join(' · '):'',
      row&&clean(s.pestReport)?[clean(s.pestReport),s.pestKind==='less'?'Reported <':s.pestKind==='quantified'?'Quantified':'Result type pending',
        clean(s.pestValue),s.pestUnit,portions[s.pestPortion],clean(s.pestLoq)?'Method LOQ '+clean(s.pestLoq)+' mg/kg':'',s.pestBasis==='yes'?'Basis confirmed':'Basis pending'].filter(Boolean).join(' · '):'',
      row?compare(id,s):''];
  }
  function brief(id,s) {return values(id,s).map((v,i)=>v?columns[i]+' · '+v:'').filter(Boolean);}
  const opt=(k,v,selected)=>'<option value="'+esc(k)+'"'+(selected===k?' selected':'')+'>'+esc(v)+'</option>';
  const select=(k,label,items,selected,placeholder='Choose')=>'<label>'+esc(label)+'<select data-ws-field="'+k+'">'+(placeholder?opt('',placeholder,selected):'')+items.map(([v,n])=>opt(v,n,selected)).join('')+'</select></label>';
  const input=(k,label,value,numeric=false)=>'<label>'+esc(label)+'<input data-ws-field="'+k+'" maxlength="'+(numeric?'50':'240')+'"'+(numeric?' inputmode="decimal"':'')+' value="'+esc(value)+'"></label>';
  function details(label,body) {return '<details class="ws-section"><summary>'+esc(label)+'</summary><div>'+body+'</div></details>';}
  const spiceText='First check the FSSAI MRL for the pesticide and the spice. If CIB&RC has registered the pesticide and FSSAI has set MRLs for other foods, use the applicable Codex spice MRL. If Codex has none in that branch, the order specifies 0.1 mg/kg. The order also specifies 0.1 mg/kg for an unregistered pesticide. Verify the registration, commodity and applicable sources before selecting a fallback.';
  function assessment(id,s) {
    const {p,role,matrix,choices,options,row}=current(id,s);
    const cropOptions=choices.map(k=>[k,matrices[k][0]]);
    let body=select('pestRole','Sample being assessed',Object.entries(roleNames),role,'');
    if(!choices.length) return body+'<p>Search the source table below for the marketed article, or choose a separately sampled ingredient to record its result.</p>';
    body+=select('pestMatrix','Physical sample article',cropOptions,matrix,'Choose the tested article');
    if(!matrix) return body;
    const tea=matrix==='tea'||matrix==='greenTea';
    body+=select('pestProcess','Documented process',Object.entries(processes).filter(([k])=>tea||k!=='tea'),s.pestProcess);
    body+=input('pestSample','Sample or lot reference and process record',s.pestSample);
    if(spiceMatrices.has(matrix)) body+='<p>'+esc(spiceText)+' '+ref(sources.spice+'#page=1','Spice order, page 1')+'</p>';
    if(tea) body+='<p>The April 2023 direction sets five tea MRLs. The March 2024 laboratory direction specifies six additional tests at 0.01 mg/kg. The October 2026 acetamiprid and imidacloprid values are proposals. '+ref(sources.tea2023,'2023 direction')+' · '+ref(sources.tea2024,'2024 direction')+' · '+ref(sources.teaTesting,'20 additional tests')+' · '+ref(sources.teaDraft,'October 2026 draft status')+'</p>';
    if(!options.length) return body+'<p>No named numerical entry for this sample in the mapped table. Check group scope, directions and the original note.</p>';
    body+=select('pestRow','Pesticide and printed article',options.map(r=>[r.key,r.drug+' · '+r.article+' · '+r.limit+(r.limit==='$'?'':' mg/kg')]),s.pestRow,'Choose the reported pesticide');
    if(!row) return body;
    body+='<p>'+ref(row.url,(row.source==='gazette'?'Gazette':'Tea direction')+', page '+row.page)+' · '+esc([row.article,row.subgroup,row.condition].filter(Boolean).join(' · '))+'</p>';
    const held=lock(row,matrix,options);
    if(!held) {
      body+=input('pestReport','Laboratory report reference',s.pestReport)+select('pestKind','Laboratory result type',[['quantified','Quantified result'],['less','Less than the reporting threshold']],s.pestKind)
        +input('pestValue','Reported value or less-than threshold',s.pestValue,true)
        +select('pestUnit','Unit on report',[['mg/kg','mg/kg'],['other','Other unit']],s.pestUnit)
        +(portion(row)?select('pestPortion','Portion or basis on report',[['whole','Whole or unspecified'],...Object.entries(portions)],s.pestPortion):'')
        +input('pestLoq','Validated method LOQ in mg/kg (required for *)',s.pestLoq,true)
        +'<label class="ws-check"><input type="checkbox" data-ws-field="pestBasis"'+(s.pestBasis==='yes'?' checked':'')+'> I matched the legal article, sampled portion, residue definition, method and printed basis.</label>';
    }
    return body+'<p data-pest-outcome role="status">'+esc(compare(id,s))+'</p>';
  }
  function indexTable(query) {
    const terms=norm(query).split(/\s+/).filter(Boolean);
    if(!terms.length) return '<p>Enter a pesticide, commodity or serial number. Tea directions appear alongside the Gazette entries.</p>';
    const rows=[...directed,...rowIndex].filter(r=>{
      const text=norm([r.serial,r.drug,r.alias,r.article,r.subgroup].join(' '));
      return terms.every(t=>/^\d+$/.test(t)?String(r.serial)===t:text.includes(t));
    });
    if(!rows.length) return '<p>No matching entry in this index. Check the processing clarification and any applicable directions.</p>';
    // Limit painting on mobile, while retaining every result through pagination.
    return {rows};
  }
  function indexPage(query,page=0) {
    const match=indexTable(query);
    if(typeof match==='string') return match;
    const {rows}=match, size=20, pages=Math.ceil(rows.length/size);
    const active=Math.min(Math.max(0,Number.isSafeInteger(page)?page:0),pages-1);
    const cells=rows.slice(active*size,(active+1)*size).map(r=>{
      const notes=[r.subgroup,r.condition];
      if(r.source==='gazette'&&/tea/i.test(r.article)&&directionSerials.has(r.serial)) notes.push('Check the later tea direction before using this Gazette entry.');
      if(r.source==='gazette'&&r.alias!==r.drug&&review.nameHolds.includes(r.serial)) notes.push('Compendium wording: '+r.alias);
      if(r.source==='gazette'&&r.articleCell!==r.article) notes.push('Original cell: '+r.articleCell+' · '+r.limitCell);
      const held=lock(r,'',byGroup.get(r.serial)?.filter(a=>norm(a.article)===norm(r.article))||[]);
      if(held) notes.push(held);
      return '<tr><td>'+esc(r.serial+' · '+r.drug)+'</td><td>'+esc(r.article)+'</td><td>'+esc(r.limit==='$'?'$ · see copper':r.limit+' mg/kg')+'</td><td>'+ref(r.url,(r.source==='gazette'?'Gazette':'Direction')+' p. '+r.page)+' '+esc(notes.filter(Boolean).join(' · '))+'</td></tr>';
    });
    const button=(n,label)=>'<button type="button" data-pest-page="'+n+'">'+label+'</button>';
    return '<p>'+rows.length+' matching entries · Page '+(active+1)+' of '+pages+'</p><div class="ws-scroll"><table><thead><tr><th>Pesticide</th><th>Article</th><th>Printed limit</th><th>Source and qualifiers</th></tr></thead><tbody>'+cells.join('')+'</tbody></table></div>'+
      (active?button(active-1,'Previous results'):'')+(active+1<pages?button(active+1,'Next results'):'');
  }
  function markup(id,s={}) {
    const p=profile(id);if(!p) return '';
    return '<details class="ws-section pest-scope"><summary>Pesticide residues · CTR 2.3.1</summary><div><p><strong>'+esc(routes[p.grade])+'</strong> · '+esc(p.note)+'</p>'+
      '<div data-pest-controls>'+assessment(id,s)+'</div>'+
      details('Processing and fallback rules','<p>The 213-entry table and the general 0.01 mg/kg note concern agricultural commodities and resulting physically processed foods. The clarification excludes thermally or chemically processed foods from that table and note. Check any separate product standard or direction. '+ref(sources.scope+'#page=1','FSSAI clarification, paragraph 3')+' · '+ref(sources.gazette+'#page=51','Gazette note and symbols')+'</p><p>'+esc(spiceText)+' '+ref(sources.spice+'#page=1','April 2024 spice order')+'</p>')+
      details('Search the pesticide tables','<label>Search pesticide or commodity<input type="search" data-pest-search placeholder="e.g. rice carbendazim, tea, 64"></label><div data-pest-found>'+indexPage('')+'</div>')+'</div></details>';
  }
  function update(node,id,field,s,previous) {
    const reset=k=>{s[k]='';};
    if(field==='pestSample'&&clean(previous)&&clean(previous)!==clean(s.pestSample)&&fieldsAfterRow.some(k=>s[k])) {
      for(const k of fieldsAfterRow) {
        reset(k);
        const el=node.querySelector('[data-ws-field="'+k+'"]');
        if(el?.type==='checkbox') el.checked=false;
        else if(el) el.value='';
      }
    }
    if(field==='pestRole') reset('pestMatrix');
    if(['pestRole','pestMatrix','pestProcess'].includes(field)) {
      if(field!=='pestProcess') reset('pestProcess');
      ['pestSample','pestRow',...fieldsAfterRow].forEach(reset);
    } else if(field==='pestRow') fieldsAfterRow.forEach(reset);
    if(['pestRole','pestMatrix','pestProcess','pestRow'].includes(field)){
      node.querySelector('[data-pest-controls]').innerHTML=assessment(id,s);
      node.querySelector('[data-ws-field="'+field+'"]')?.focus();
    } else {
      const outcome=node.querySelector('[data-pest-outcome]');
      if(outcome) outcome.textContent=compare(id,s);
    }
  }
  function stats(priority=[]) {
    const counts={};const keys=Object.keys(products);
    for(const id of keys) {const grade=profile(id).grade;counts[grade]=(counts[grade]||0)+1;}
    const mapped=id=>profile(id)?.choices.some(k=>byMatrix.get(k)?.length);
    return {products:keys.length,scopeCounts:counts,mappedProducts:keys.filter(mapped).length,
      priorityMapped:priority.filter(mapped).length,gazetteRows:rowIndex.length,directionRows:directed.length};
  }
  root.PMSVPesticides=Object.freeze({profile,current,compare,fields,columns,values,brief,markup,update,indexPage,stats,
    mapped:id=>!!profile(id)?.choices.some(k=>byMatrix.get(k)?.length)});
})(globalThis);
