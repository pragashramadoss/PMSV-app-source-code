/* Source-linked testing rows at catalogue identity. SKU decisions remain in the product worksheet. */
(function(root) {
  'use strict';
  const E=root.PMSVCatalogueEvidence, R=root.PMSVCatalogueRules;
  const V=root.PMSVVariantComposition, P=root.PMSVMetalPanel, C=root.PMSVCropScope;
  const sourceRows=root.PMSVTestingSources;
  const headers=['Catalogue ID','Product','Review area','Article or table','Product form or sample','Parameter or decision','Applicability','Requirement or reported limit','Unit','Reporting basis, condition or next action','n','c','m','M','Official source pages'];
  const areas=['Composition and identity','Microbiology','Metals','Toxins and other contaminants','Pesticide residues','Veterinary drug residues'];
  const label=k=>String(k).replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
  const join=items=>[...new Set(items.filter(v=>v!==''&&v!==null&&v!==undefined))].join(' · ');
  function detail(v) {
    if(v==null)return '';
    if(Array.isArray(v))return v.map(detail).filter(Boolean).join(' / ');
    if(typeof v==='object')return join(Object.entries(v).map(([k,x])=>{const value=detail(x);return value && label(k)+' = '+value;}));
    return String(v);
  }
  function links(doc,pages=[]) {
    const url=E.documents[doc]?.url.split('#')[0];
    if(!url)return '';
    return pages.length?[...new Set(pages)].map(n=>url+'#page='+n).join(' | '):url;
  }
  const testKeys=['parameter','operator','value','unit','min','max','analytical_basis','source_clause','source_pages','kind'];
  function specInfo(s) {
    const symbol={'<=':'≤','>=':'≥','<':'<','>':'>','=':'='}[s.operator];
    let limit=join([s.operator,detail(s.value)]);
    if(symbol && s.value!=null)limit=symbol+' '+detail(s.value);
    if(s.operator==='range' && s.min!=null && s.max!=null)limit=s.min+' to '+s.max;
    return {limit,unit:s.unit,notes:join([detail(s.analytical_basis),...Object.entries(s)
      .filter(([k])=>!testKeys.includes(k)).map(([k,v])=>detail(v) && label(k)+' = '+detail(v))])};
  }
  const clean=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function cheeseForm(product,form){
    const name=clean(product), v=clean(form), key=name.replace(/ cheese$/,'');
    if(name==='mozzarella cheese')return false; // Its separate table depends on fat in dry matter and moisture class.
    if(name==='cottage cheese and creamed cottage cheese')return ['cottage cheese','creamed cottage cheese'].includes(v);
    if(name==='cream cheese rahmfrischkase')return v==='cream cheese';
    if(name==='emmental or emmentaler cheese')return v==='emmental';
    if(name==='processed cheese')return v.startsWith('processed cheese ')&&!v.startsWith('processed cheese spread');
    if(name==='processed cheese spread')return v.startsWith('processed cheese spread');
    if(name==='provolone cheese')return v==='smoked provolone'||v==='unsmoked provolone';
    return v===name || v===key || v.replace(/^\d+ /,'')===key;
  }
  function relevantForm(article,product,name){
    const p=clean(product),f=clean(name);
    if(article==='2.1.2')return p===f;
    if(article==='2.1.17')return cheeseForm(product,name);
    if(article==='2.1.8')return p.includes('anhydrous')?f.includes('anhydrous'):['milk fat','butter oil'].includes(p)?f==='milk fat butter oil':f===p;
    if(article==='2.3.61')return p.includes('puree')===f.includes('puree');
    if(article==='2.5.2(2A)')return p.split(' ').some(word=>f.split(' ').includes(word));
    return true;
  }
  function percentage(key,value,additionalBasis) {
    const parts=key.split('_');
    if(!parts.includes('pct'))return null;
    const op=parts.find(p=>['min','max','lt','gt','range'].includes(p));
    if(!op || !(typeof value==='number' || (op==='range' && Array.isArray(value) && value.length===2)))return null;
    const bases=[['moisture_fat_free','moisture- and fat-free basis'],['dry_matter','dry matter'],['total_mass','total product mass'],
      ['total_weight','total product weight'],['dry','dry basis'],['db','dry basis']];
    let param='_'+key+'_',basis=additionalBasis||'';
    for(const [word,meaning] of bases){
      if(param.includes('_'+word+'_')){if(!basis)basis=meaning;param=param.replace('_'+word+'_','_');break;}
    }
    const name=param.split('_').filter(p=>p && p!=='pct' && p!==op).join(' ').replace(/ in$/,'');
    return {parameter:label(name),limit:op==='range'?value.join(' to '):({min:'≥',max:'≤',lt:'<',gt:'>'})[op]+' '+value,unit:'%',notes:basis};
  }
  const coffeePages={'2.10.2':{roasted_ground:[5],decaffeinated_roasted_ground:[5,6],soluble_coffee:[6],decaffeinated_soluble:[6,7]},
    '2.10.4':{regular_roasted_ground:[7,8],instant:[8],decaffeinated_roasted_ground:[8,9],decaffeinated_instant:[9,10]}};
  function composition(id,add,state) {
    const product=E.products[id],std=R.standards[product.standard],anchor=E.standards[product.standard];
    const route=R.products[id];
    if(anchor && id.startsWith('102-')){
      const item=root.PMSV_CATALOGUE.find(x=>x.id===id);
      add({area:areas[0],article:'Ayurveda Aahara recipe',parameter:'Finished recipe and component identity',status:'Confirm recipe authority and component scope',
        notes:item.nonTransfer||'Establish the recipe identity and the role of the dairy ingredient before selecting its standard.',
        source:[...(product.routeAnchors||[]).map(([doc,pg])=>links(doc,pg)),links(anchor.doc,anchor.p)].join(' | ')});
      return;
    }
    if(!anchor || product.scope!=='product_standard'){
      const refs=(product.routeAnchors||[]).map(([doc,pg])=>links(doc,pg));
      if(anchor)refs.unshift(links(anchor.doc,anchor.p));
      if(!refs.length)refs.push(...(product.routeDocs||[]).map(doc=>links(doc)));
      add({area:areas[0],article:product.standard.split('#')[1]||label(product.scope),parameter:'Applicable product or ingredient specification',
        status:'Confirm regulatory route',notes:join([route.routeFinding,...(route.checks||[]).map(detail),route.routeContext]),source:refs.join(' | ')});
      if(!anchor||product.scope!=='food_additive_identity_purity')return;
    }
    const base={area:areas[0],article:product.standard.split('#')[1],source:links(anchor.doc,anchor.p),form:std.name};
    const worksheet=root.PMSVCatalogueWorksheets;
    const measured=state?.result?.trim() && worksheet.enabledCriteria(id,state).find(({i})=>String(i)===state.criterion)?.v.spec;
    const operative=measured && product.gazetteFindings?.find(g=>g.parameter===measured.parameter&&
      g.clause===measured.source_clause&&g.effective&&g.effective===measured.effective_from);
    function push(row,spec){
      if(measured && spec===measured){
        const notes=join([row.notes,'Reported result: '+state.result.trim()+' '+(spec.unit||''),
          spec.analytical_basis&&'Analytical basis: '+spec.analytical_basis,state.reference?.trim()&&'Sample or SKU: '+state.reference.trim(),
          state.compReport?.trim()&&'Report: '+state.compReport.trim(),worksheet.resultText(id,state)]);
        add({...base,...row,notes});
      }else add({...base,...row});
    }
    for(const g of product.gazetteFindings||[])push({article:g.clause,parameter:g.parameter,limit:g.result,status:'Gazette finding',notes:join([g.scope,g.effective && 'Effective '+g.effective]),source:links(g.document,g.pages)},g===operative?measured:undefined);
    if(sourceRows.products[id]){
      for(const key of sourceRows.products[id]){
        const [form,parameter,status,limit,unit,notes,article,doc,pages,kind,extra]=sourceRows.rows[key];
        const source=[links(doc,pages),...extra].join(' | ');
        push({area:kind==='micro'?areas[1]:areas[0],form,parameter,status,limit,unit,notes,article,source});
      }
      return;
    }
    if(base.article==='2.3.37'||base.article==='2.3.39'){
      const curried=base.article==='2.3.39';
      push({parameter:'Thermal-centre temperature at completion of freezing',form:route.name,limit:'−18',unit:'°C',
        status:curried?'Resolve printed process wording':'Named process requirement',
        notes:curried?'The cited edition says “after thermal sterilization”. Confirm the applicable process wording before assessing a lot.':'Check at completion of freezing after thermal stabilization.',
        source:links(anchor.doc,curried?[53]:[40,41])});
      return;
    }
    if(root.PMSVCatalogueWorksheets.hasFocusedCalculator(id)){
      push({parameter:'Product-specific composition and pack criteria',status:'Use the product calculator',notes:'Use the dedicated calculator for the selected product and pack. Review its linked sources and applicable conditions.'});
      return;
    }
    const profile=V.profiles.get(id);
    if(profile){
      const chosen=state&&V.selected(id,state);
      for(const form of chosen?[chosen]:profile.forms){
        for(const r of form.rows){
          const condition=chosen?V.applicability(r,state.compSweetener):'';
          const limit=r.operator==='range'?r.min+' to '+r.max:({'<=':'≤','>=':'≥'})[r.operator]+' '+r.value;
          const status=chosen?(condition||'Selected product variant'):(r.conditional?'Confirm sweetener formulation':'Select declared variant');
          push({form:form.name,parameter:r.parameter,status,limit:condition?'':limit,unit:condition?'':r.unit,
            notes:join([r.analytical_basis,r.conditional?'Exclude when only artificial sweetener is used.':'',V.note(profile.kind)]),source:links(anchor.doc,profile.pages)},r);
        }
      }
      return;
    }
    const unresolved=new Set((product.qualityCrosschecks||[]).filter(([,x])=>x[5]==='different numerical values').map(([,x])=>x[0]));
    const checked=new Set(root.PMSVCatalogueWorksheets.enabledCriteria(id).map(({i})=>i));
    const gazetteNames=new Set((product.gazetteFindings||[]).map(g=>g.parameter.toLowerCase()));
    let count=0;
    function criterion(s,status,form=std.name,defaultSource=base.source) {
      const differs=unresolved.has(s.parameter);
      const operative=gazetteNames.has(s.parameter.toLowerCase());
      const review=s.source_question || s.automatic_comparison_blocked || differs || operative;
      const info=specInfo(s);
      push({...info,form,parameter:s.parameter,status:review?'Resolve source before use':status,
        notes:join([info.notes,differs?'Chapter and monograph give different numbers.':'',operative?'Use the Gazette finding above for its named scope.':'',anchor.basis]),
        source:Array.isArray(s.source_pages)&&s.source_pages.every(n=>Number.isInteger(n)&&n>0&&n<=E.documents[anchor.doc].pages)?links(anchor.doc,s.source_pages):defaultSource},operative?undefined:s);
      count++;
    }
    std.criteria.forEach((row,i)=>criterion(row.spec,checked.has(i)?'Source-edition comparison available':'Confirm article and conditions'));
    const variants=[std.sections.composition_by_form,std.sections.variants].filter(Array.isArray);
    const seen=new Set();
    for(const list of variants)for(const form of list){
      if(!form || typeof form!=='object')continue;
      const key=JSON.stringify(form);
      if(seen.has(key))continue;
      seen.add(key);
      const name=form.variant||form.name||form.type||std.name;
      if(typeof name!=='string'||!relevantForm(base.article,route.name,name))continue;
      if(base.article==='2.1.2'){
        for(const [k,p,op] of [['milk_fat_min_pct','Milk fat','≥'],['milk_fat_max_pct','Milk fat','≤'],['snf_min_pct','Milk solids-not-fat','≥']]){
          if(form[k]!=null){push({form:name,parameter:p,limit:op+' '+form[k],unit:'% m/m',status:'Named milk class',
            notes:'Class composition table at point of sale. See the mixed-milk note for contravention.',source:links(anchor.doc,[9,10])});count++;}
        }
        continue;
      }
      if(form.parameter){criterion(form,'Confirm article and conditions',name);continue;}
      if(Array.isArray(form.composition))for(const s of form.composition)if(s?.parameter)criterion(s,'Confirm variant and conditions',name);
      const entries=Object.entries(form).filter(([k])=>!['variant','name','type','composition'].includes(k));
      if(!entries.length)continue;
      const qualifier=entries.filter(([k,v])=>!percentage(k,v)).map(([k,v])=>label(k)+' = '+detail(v));
      const pct=entries.map(([k,v])=>percentage(k,v,form[k.split('_max_pct')[0]+'_basis'])).filter(Boolean);
      if(pct.length)for(const item of pct){
        push({...item,form:name,status:'Confirm variant and conditions',notes:join([item.notes, ...qualifier, anchor.basis])});count++;
      }else{
        push({form:name,parameter:'Variant specifications',status:'Read variant table',notes:anchor.basis,limit:join(qualifier)});count++;
      }
    }
    if(base.article==='2.1.2'){
      for(const spec of std.sections.other_limits||[]){
        const lactose=/lactose/i.test(spec.parameter);
        if(lactose && !/lactose/i.test(route.name))continue;
        criterion(spec,lactose?'Select declared variant':'Named milk article',lactose?spec.parameter:route.name,links(anchor.doc,lactose?[9]:[10]));
      }
      if(/lactose/i.test(route.name))push({parameter:'Fat and solids-not-fat of the starting milk',status:'Identify base milk class',
        notes:'Apply the fat and solids-not-fat requirements of the milk used to prepare the product.',source:links(anchor.doc,[9,10])});
    }
    for(const [tableName,table] of Object.entries(std.testTables||{})){
      if(tableName==='mozzarella_table' && clean(route.name)!=='mozzarella cheese')continue;
      const cp=coffeePages[base.article]?.[tableName];
      for(const row of Array.isArray(table)?table:[table]){
        if(!row)continue;
        if(row.parameter && row.operator){criterion(row,'Confirm variant and conditions',cp?label(tableName)+' · '+std.name:std.name,
          cp?links(anchor.doc,cp):base.source);continue;}
        if(tableName==='fruit_juice_table_r9'){
          const source=links(anchor.doc,row.source_pages);
          const info={form:row.fruit,status:'Confirm fruit and juice identity',notes:row.scope,source};
          push({...info,parameter:'Total soluble solids',limit:'≥ '+row.tss_min_degree_Brix,unit:'°Brix'});
          push({...info,parameter:'Acidity',limit:row.acidity_operator+' '+row.acidity_value_pct,unit:'%',notes:join([row.acidity_basis,row.scope])});
          count+=2;continue;
        }
        const form=row.name||row.designation||std.name;
        const params=typeof row==='object'?Object.entries(row).filter(([key,v])=>!['name','designation'].includes(key)&&v!=null):[];
        if(tableName==='chocolate_types'){
          for(const [key,v] of params){
            if(key.endsWith('_basis'))continue;
            const dark=key==='dark_chocolate_additional';
            for(const [k,val] of dark?Object.entries(v):[[key,v]]){
              const item=percentage(k,val,k==='acid_insoluble_ash_max_pct'?row.acid_insoluble_ash_basis:'');
              if(!item)continue;
              push({...item,form:dark?'Dark chocolate':form,status:'Confirm declared chocolate type',source:links(anchor.doc,[6,7,8,9])});count++;
            }
          }
          continue;
        }
        push({form,parameter:label(tableName.replace(/_r[0-9]+$/,'')),status:'Read variant table',
          limit:typeof row==='string'?row:join(params.map(([k,v])=>label(k)+' = '+detail(v))),notes:anchor.basis});count++;
      }
    }
    for(const k of ['physical_chemical','quality_parameters','quality_rules','composition_core','requirements','table']){
      const v=std.sections[k];if(!v)continue;
      const records=Array.isArray(v)?v:[v];
      for(const spec of records){
        if(typeof spec==='object'&&spec?.parameter && spec.operator){criterion(spec,'Confirm article and conditions');continue;}
        const value=detail(spec);if(!value)continue;
        push({parameter:label(k),limit:value,status:'Read source provision',notes:anchor.basis});count++;
      }
    }
    if(!count && base.article==='2.1.3'){
      for(const parameter of ['Milk fat','Milk solids-not-fat'])push({parameter,status:'Identify the milk used',form:route.name,
        notes:'The minimum follows the class of the starting milk under 2.1.2. Record that class and select its corresponding table row.',
        source:links(anchor.doc,[13,9,10])});
      return;
    }
    if(!count && base.article==='2.1.1' && route.name==='Analogue in the dairy context'){
      push({parameter:'Identity of the dairy analogue',form:route.fcs,status:'Identify formulation and applicable product standard',
        notes:'Record the constituent replaced, its replacement and the finished product identity before assigning composition limits. The dairy analogue route has distinct scope under 2.1.1.',
        source:links(anchor.doc,[1,2,5,6,7])});return;
    }
    if(!count && base.article==='2.1.17'){
      push({parameter:'Moisture and milk fat',form:route.name,status:'Identify the cheese variety or compositional class',
        notes:'Ripening alone does not select a composition row. Record the named variety or the applicable class, and check moisture and fat on the bases stated in that row.',
        source:links(anchor.doc,[59,64,65,66])});return;
    }
    if(!count)push({parameter:'Product composition and identity',status:'Read product article',notes:join([anchor.basis,...std.issues.map(detail),'Check the cited article for the declared product and process.'])});
  }

  // A shared Appendix B profile can have product- or variant-specific exclusions.
  function microCriteria(profile,route) {
    const data={...profile.criteria};
    for(const kind of ['hygiene','safety']){
      data[kind]=Object.fromEntries(Object.entries(data[kind]||{}).filter(([key])=>!(route.exclude_criteria||[]).includes(key)));
    }
    if(!route.apply_enterobacteriaceae_footnote)delete data.supplemental_process_criteria;
    return data;
  }
  function tablePages(profile,kind) {
    const p=profile.pages;
    if(Array.isArray(p))return p;
    if(kind==='supplemental_process_criteria')return p.footnotes||[];
    const entry=Object.entries(p).find(([k])=>new RegExp('^table_[0-9]+'+(kind==='safety'?'b':'a')+'$').test(k));
    return entry?.[1]||p.current_tables||[];
  }
  function microbiology(id,add) {
    const product=E.products[id],base={area:areas[1],article:'Appendix B',source:links('chapter-20')};
    const push=row=>add({...base,...row});
    function profileRows(route,conditional,reason){
      const profile=R.micro[route.profile_key];
      if(!profile){push({form:route.condition,parameter:'Product and process mapping',status:'Review route',notes:join([reason,route.message,route.note,route.reason,route.route])});return;}
      const criteria=microCriteria(profile,route),form=join([route.condition,profile.name]);
      let count=0;
      for(const [kind,kindLabel] of [['hygiene',criteria.hygiene_label||'Process hygiene'],['safety','Food safety'],['supplemental_process_criteria','Additional process hygiene']]){
        for(const [organism,row] of Object.entries(criteria[kind]||{})){
          const pg=tablePages(profile,kind);
          const footnotes=profile.pages.footnotes||[];
          const cited=profile.group==='milk'?[...new Set([...pg,...footnotes])]:pg;
          const tableRef=Array.isArray(profile.pages)?'Table 7':Object.entries(profile.pages).find(([k,v])=>k.startsWith('table_')&&v===pg)?.[0]?.replace('table_','Table ').toUpperCase();
          const conditionalYeast=route.profile_key==='milk-11'&&organism==='yeast_and_mold_count';
          const caseinOnly=route.profile_key==='milk-07'&&organism==='yeast_and_mold_count';
          push({article:join(['Appendix B',tableRef || (kind==='supplemental_process_criteria'?'Table 2A footnote 4':profile.group==='bakers_yeast'?'Tables 6A/6B':'') ,kindLabel]),
            form,parameter:R.organisms[organism]||label(organism),status:row.source_question?'Resolve source before use':conditional||conditionalYeast||caseinOnly?'Confirm product form':'Mapped table row',
            limit:row.requirement||'',unit:row.unit,notes:join([reason,route.note,route.message,row.notes,row.source_question,
              row.applicability,conditionalYeast?'Exclude mould-ripened cheese.':'',caseinOnly?'Applies to casein powder only.':'',
              kind==='hygiene'?criteria.stage:'',profile.group==='milk'?(kind==='safety'?'End of manufacture and products on the market during shelf life.':'Process hygiene at end of manufacture.'):'',detail(criteria.notes)]),n:row.n,c:row.c,m:row.m,M:row.M,source:links('chapter-20',cited)});
          count++;
        }
      }
      if(criteria.safety_special_requirement){
        push({form,parameter:'Food safety special requirement',status:conditional?'Confirm product form':'Mapped table row',
          limit:criteria.safety_special_requirement,notes:join([reason,route.note,route.message]),source:links('chapter-20',tablePages(profile,'safety'))});count++;
      }
      if(!count||criteria.hygiene_special_requirement||criteria.process_hygiene_not_applicable||criteria.food_safety_not_applicable){
        const pages=[...new Set([...tablePages(profile,'hygiene'),...tablePages(profile,'safety')])];
        const notes=join([reason,route.note,route.message,criteria.hygiene_special_requirement,criteria.process_hygiene_not_applicable?'Process hygiene table has no numerical plan for this form.':'',criteria.food_safety_not_applicable?'Food safety table has no numerical plan for this form.':'',detail(criteria.notes)]);
        push({form,parameter:'Table applicability',status:conditional?'Confirm product form':'Read table scope',notes,source:links('chapter-20',pages)});
      }
    }
    if(!product.micro.length){
      const direct=sourceRows.products[id]?.some(k=>sourceRows.rows[k][9]==='micro');
      push({parameter:'Appendix B product and process mapping',status:'Establish Appendix B route',notes:direct?
        'Product-specific microbiological cells appear separately. Check Appendix B against the supplied food and process.':
        'Check Appendix B and the product regulation for the food as supplied. No Appendix B numerical plan has been assigned in the catalogue.'});return;
    }
    for(const [kind,route] of product.micro){
      if(kind==='conditional')for(const option of route.options||[])profileRows(option,true,route.reason);
      else if(route.profile_key)profileRows(route,false,'');
      else {
        const anchor=E.standards[product.standard];
        push({parameter:'Product-specific microbiology route',status:'Review separate provision',notes:join([route.route,route.reason,route.note]),
          source:anchor?links(anchor.doc,anchor.p)+' | '+base.source:base.source});
      }
    }
  }

  const metalGroups=root.PMSVMetalPanelData.groups, cropGroups=root.PMSVCropScopeData.groups;
  const inGroup=(groups,group,id)=>groups[group].includes(id);
  // These catalogue identities specify the oil itself; the other oil routes
  // include spreads, derivatives, grade-dependent material and mixed foods.
  const namedOils=new Set([
    '02-02-1-refined-grapeseed-oil','02-02-1-refined-rapeseed-or-mustard-oil-low-erucic-acid',
    '02-02-1-refined-safflower-seed-oil-and-safflower-seed-oil-high-oleic-acid-imported-or-dome',
    '02-02-1-moringa-oil','02-02-1-refined-palm-kernel-olein','02-02-1-refined-moringa-oil','fssai-2-16-hemp-seed-oil',
    ...['soyabean','soybean'].flatMap(legume=>['partially-hydrogenated-','partially-hydrogenated-and-winterised-'].map(prefix=>'02-02-1-'+prefix+legume+'-oil'))
  ]);
  const seeds=new Set(['06-06-1-chia-seeds','12-12-2-poppy-khas-khas','fssai-2-16-hemp-seed','06-06-1-soybean']);
  function fishOilScreen(value,unit='mg/kg'){
    if(!String(value??'').trim())return 'Enter the total arsenic result or its numerical upper bound in mg/kg.';
    if(!['mg/kg','µg/kg'].includes(unit))return 'Check the mass-based reporting unit for total arsenic in fish oil.';
    const measured=root.PMSVMetalPanel.parseReading(value,unit);
    if(!measured)return 'Manual review required. Enter a non-negative decimal result or a numeric upper bound from the report.';
    const compare=root.PMSVCatalogueWorksheets.compare;
    const below=compare({operator:measured.qualifier==='<'?'<=':'<',value:'0.1'},measured.amount);
    if(below)return 'Below 0.1 mg/kg total arsenic. The Gazette accepts this screen for the inorganic arsenic limit.'+measured.equivalent;
    if(measured.qualifier)return 'Inconclusive. The reported upper bound does not establish total arsenic strictly below 0.1 mg/kg. Review the reporting threshold or obtain an inorganic arsenic result.'+measured.equivalent;
    if(compare({operator:'>',value:'0.1'},measured.amount))return 'Above 0.1 mg/kg total arsenic. Determine inorganic arsenic to assess the limit.'+measured.equivalent;
    return 'Exactly 0.1 mg/kg total arsenic. The Gazette gives no screening disposition at equality. Review the report or obtain speciation.'+measured.equivalent;
  }
  function amendedMetal(id,d,row) {
    const source=links('ctr-1',[4]),key=d.name==='Lead'?'Pb127':d.name==='Cadmium'?'Cd18':'';
    if(d.name==='Arsenic'&&inGroup(metalGroups,'fishOil',id)){
      return {...row,article:'CTR 2.1.1(2) · fish-oil note',parameter:'Inorganic arsenic',form:'Fish oil',status:'Named finished article',
        labKey:'fishArsenic',limit:'0.1',unit:'mg/kg',notes:'Screen using total arsenic. Below 0.1 mg/kg, the note accepts the sample for this limit. Above 0.1 mg/kg, determine inorganic arsenic. At exactly 0.1 mg/kg total, the note gives no screening disposition. Review the result or obtain speciation.',
        source:links('ctr-1',[4,5])};
    }
    if(!key||!inGroup(metalGroups,'futurePulse',id))return row;
    const cadmium=key==='Cd18',article=cadmium?'Pulses and pulse flours, excluding dry soybean':'Pulses and pulse flours';
    const original=root.PMSVMetalPanelData.rows[key];
    const refs=[source,links('ctr-3',[original[2]])].join(' | ');
    if(inGroup(metalGroups,'plainPulseFlour',id)||d.keys.includes(key)&&d.kind==='named'){
      return {...row,status:'Named finished article',form:article,labKey:key,limit:original[1],unit:'ppm',
        notes:'Confirm the stated pulse or plain pulse flour and sample as marketed.'+(cadmium?' The amended cadmium entry excludes dry soybean.':''),source:refs};
    }
    if(inGroup(metalGroups,'soyFlour',id))return {...row,form:article,status:'Confirm soy flour classification',labKey:null,limit:'',unit:'',
      notes:cadmium?'Determine how the dry-soybean exclusion applies to this processed soy flour before assigning a cadmium limit.':'Document that the marketed soy flour falls within the amended pulse-flour entry.',source:refs};
    return {...row,notes:row.notes+' Check the identity of any separately sampled pulse flour. The amended entry names the pulse or its flour.'+
      (cadmium?' Dry soybean is excluded from that cadmium entry.':''),source:[row.source,source].join(' | ')};
  }
  function amendedToxin(id,d,row,state) {
    const amendment=links('ctr-1',[5]);
    if(d.key==='saf'){
      const reference=String(state.crop_decRef||'').trim(),choice=state.crop_dec;
      const contains=choice==='contains'&&reference,absent=choice==='absent'&&reference;
      return {...row,article:'CTR 2.2.1(2) · serial 4',form:'Food or beverage containing mace or nutmeg kernel as an ingredient',
        status:contains?'Documented finished formulation':absent?'Documented ingredients outside entry':'Confirm ingredients of finished article',
        limit:contains?'10':'',unit:contains?'ppm':'',
        notes:contains?'Mace, nutmeg kernel or both documented. Recipe reference: '+reference:
          absent?'Neither ingredient is used. Recipe reference: '+reference:
          'Check the formulation for mace, nutmeg kernel or both. The 10 ppm maximum applies when at least one is an ingredient. Record the recipe under Crop contaminants → December amendment. A sample of the spice alone does not establish that condition.',
        source:[amendment,links(root.PMSVCropScopeData.rows.N8.doc,[root.PMSVCropScopeData.rows.N8.page])].join(' | ')};
    }
    if(d.key!=='total'&&d.key!=='b1')return row;
    const inOilGroup=inGroup(cropGroups,'afoils',id), oilKeys=d.key==='total'?['C5','C6']:['C15','C16'];
    const data=root.PMSVCropScopeData.rows, r=data[oilKeys[0]];
    const sources=[amendment,links(r.doc,[r.page])].join(' | ');
    if(namedOils.has(id))return {...row,form:'Oil as marketed',status:'Named finished article',limit:String(r.limit),unit:r.unit,
      notes:'The revised oil entry includes the identified edible oil. Confirm the actual sample is the oil itself.',source:sources};
    if(seeds.has(id)&&state.crop_af==='oil'&&String(state.crop_afRef||'').trim())return {...row,form:'Documented oilseed as marketed',
      status:'Documented oilseed',limit:String(r.limit),unit:r.unit,notes:'Oilseed identity and use: '+state.crop_afRef.trim(),source:sources};
    if(inOilGroup&&d.sample==='outside')return {...row,form:'Documented outside these rows',source:sources};
    if(inOilGroup&&state.crop_af==='composite'&&d.sample==='finished'&&d.rows.length===1){
      const value=data[d.rows[0]];
      return {...row,form:value.article,status:d.status,limit:String(value.limit),unit:value.unit,notes:d.reason,source:links(value.doc,[value.page])+' | '+amendment};
    }
    const legacyOilChoice=d.status==='Documented finished article'&&d.rows.some(k=>oilKeys.includes(k));
    if(inOilGroup||legacyOilChoice){
      return {...row,form:'Confirm oil, oilseed or finished composite',status:'Confirm sampled article and use',limit:'',unit:'',
        notes:(legacyOilChoice?d.reason+'. ':'')+'For a qualifying oil or an oilseed for processing or ready to eat, the maximum is '+r.limit+' '+r.unit+'. Check the marketed form and food use. A prepared spread, analogue, flour or mixed food requires its own classification.',
        source:sources};
    }
    if(id==='02-02-1-fish-oil'||id==='02-02-1-butter-oil')return {...row,form:'Oil of animal origin',status:'Review scope of the oil entry',limit:'',unit:'',
      notes:'Confirm the scope of the oil and oilseed entry for this animal-derived oil before applying a plant-commodity limit.',source:sources};
    return row;
  }
  function metalEdition(date){
    return date>='2026-11-20'?root.PMSVVeterinary.edition(date):'';
  }
  function metalRow(id,d,date){
    const edition=metalEdition(date);
    if(!edition)return null;
    const keys=d.keys, numeric=['named','residual','all','same'].includes(d.kind);
    const pages=[...new Set(keys.flatMap(k=>{const r=root.PMSVMetalPanelData.rows[k];return [r[2],...r[3]];}))].sort((a,b)=>a-b);
    const row={area:areas[2],article:'CTR 2.1.1(2)',parameter:d.name,status:P.labels[d.kind],limit:numeric?join(keys.map(k=>P.limit(k))):'',
      form:numeric?join(keys.map(k=>root.PMSVMetalPanelData.rows[k][0])):'',notes:d.reason,source:links('ctr-3',pages.length?pages:[18])};
    if(d.name==='Lead'){
      const route=P.firstSource(id);
      if(route)row.source=join(route.urls);
      if(id===P.syrupId)row.source=join([row.source,P.syrupIdentity]);
    }
    const dated=edition==='amended'?amendedMetal(id,d,row):row;
    if(d.proof&&dated.form===row.form&&dated.status===row.status)dated.notes+=' Evidence: '+d.proof;
    return dated;
  }
  function toxinRow(id,d,date,state={}){
    const edition=metalEdition(date);
    if(!edition||!d)return null;
    const data=root.PMSVCropScopeData.rows;
    const sources=[...new Set(d.sources.map(k=>links(data[k].doc,[data[k].page])))];
    const row={area:areas[3],article:'CTR 2.2.1',parameter:d.name,status:d.status,
      form:d.sample==='ingredient'?'Separately sampled ingredient':d.status==='Documented finished article'?'Finished product':d.sample,
      limit:join(d.rows.map(k=>data[k].article+' — '+data[k].limit+' '+data[k].unit+(data[k].heading?' (Oilseeds or oil heading)':''))),
      notes:d.reason,source:sources.join(' | ')};
    const child=id===C.childId;
    const profile=(d.key==='total'||d.key==='b1'||child&&['ota','don'].includes(d.key))&&C.firstSource(id);
    if(profile)row.source=[...new Set([...sources,...(child?[profile.urls[0]]:profile.urls)])].join(' | ');
    const dated=edition==='amended'?amendedToxin(id,d,row,state):row;
    if(!dated.limit)return dated;
    // Replacement rows explicitly carry a numeric maximum and refer to the finished food.
    if(dated.unit){
      dated.criterion={value:dated.limit,unit:dated.unit,role:'finished',article:dated.form};
    }else if(['finished','ingredient'].includes(d.sample)&&d.rows.length){
      const matches=d.rows.map(k=>data[k]),first=matches[0];
      if(matches.every(r=>r.limit===first.limit&&r.unit===first.unit)){
        dated.criterion={value:String(first.limit),unit:first.unit,role:d.sample,article:join(matches.map(r=>r.article))};
      }
    }
    return dated;
  }
  function contaminants(id,add,date,state) {
    const edition=metalEdition(date);
    if(!edition){
      for(const area of areas.slice(2,4))add({area,article:'CTR 2.1 / 2.2',parameter:'Check assessment edition',status:'Assessment date outside reviewed contaminant editions',
        notes:'The reviewed metal and toxin plans start on 20 November 2026. Choose a covered date or check the source edition in force on the sample date.',source:links('ctr-1',[4,5])});
      return;
    }
    const readings=state.vetDate&&state.vetDate!==date?[]:P.reportLines(id,state,date);
    for(const d of P.panel(id,state)){
      const row=metalRow(id,d,date);
      row.notes=join([row.notes,...readings.filter(r=>r.metal===d.key).map(r=>r.summary)]);
      add(row);
    }
    for(const d of C.decisions(id,state)){
      const row=toxinRow(id,d,date,state);
      if(id===root.PMSVCocoaMixtures?.productId&&d.key==='saf'){
        row.notes+=' FPSFA 2.7.6(3) permits spices in this mix. Check the actual recipe and the dry product as sold.';
        row.source+=' | '+root.PMSVCocoaMixtures.sources[1];
      }
      if(state['tox_'+d.key+'_value']?.trim()&&(!state.vetDate||state.vetDate===date))
        row.notes=join([row.notes,C.labResult(id,d.key,state,date,row).summary]);
      add(row);
    }
  }
  function entries(id,vetDate=root.PMSVVeterinary.reviewDate,state) {
    if(!Object.hasOwn(E.products,id))return [];
    const result=[],add=row=>result.push(row);
    composition(id,add,state);
    if(id===root.PMSVCocoaMixtures?.productId)for(const rule of root.PMSVCocoaMixtures.planRows(state))add({...rule,area:areas[0]});
    microbiology(id,add);contaminants(id,add,vetDate,state||{});
    for(const r of root.PMSVPesticides.planRows(id))add({...r,area:areas[4]});
    for(const r of root.PMSVVeterinary.planRows(id,vetDate))add({...r,area:areas[5]});
    if(root.PMSVAyurvedaPlan?.known(id))for(const row of root.PMSVAyurvedaPlan.planRows(id,state))add(row);
    if(id===root.PMSVVendingWater?.productId)for(const row of root.PMSVVendingWater.planRows(id,state))add(row);
    if(state){
      for(const r of root.PMSVResiduePanel.planRows(id))add({...r,area:areas[4]});
      const veterinary=root.PMSVVeterinary.recordedPlanRow(id,state,vetDate);
      if(veterinary)add({...veterinary,area:areas[5]});
    }
    return result;
  }
  function exportRows(id,vetDate,veterinaryOnly=false,state) {
    const products=id?(R.products[id]?[id]:[]):root.PMSV_CATALOGUE.map(p=>p.id);
    const out=[veterinaryOnly?[...headers,'Veterinary assessment date']:headers];
    for(const key of products){
      const rows=veterinaryOnly?root.PMSVVeterinary.planRows(key,vetDate):entries(key,vetDate,id?state:undefined);
      for(const r of rows){
        const area=veterinaryOnly?areas[5]:r.area;
        const notes=!veterinaryOnly&&vetDate&&vetDate!==root.PMSVVeterinary.reviewDate&&[areas[2],areas[3],areas[5]].includes(area)?
          (area===areas[5]?'Veterinary assessment date ':'Contaminant assessment date ')+vetDate+'. '+r.notes:r.notes;
        const cells=[key,R.products[key].name,area,r.article,r.form,r.parameter,r.status,r.limit,r.unit,notes,r.n,r.c,r.m,r.M,r.source];
        if(veterinaryOnly)cells.push(vetDate??root.PMSVVeterinary.reviewDate);
        out.push(cells.map(v=>v??''));
      }
    }
    return out;
  }
  root.PMSVTestingPlan=Object.freeze({available:!!root.PMSVPesticides?.planRows && !!root.PMSVVeterinary?.planRows && !!sourceRows && Object.keys(sourceRows.products).length===64,areas,headers,entries,exportRows,metalRow,toxinRow,metalEdition,fishOilScreen,microCriteria,relevantForm});
})(globalThis);
