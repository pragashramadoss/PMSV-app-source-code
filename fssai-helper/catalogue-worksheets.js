/* Product worksheets. Numeric comparisons apply only to the selected source-edition row. */
(function (root) {
  'use strict';
  const E = root.PMSVCatalogueEvidence, R = root.PMSVCatalogueRules;
  const registry = root.PMSV_REVIEW_REGISTER, C = root.PMSVCropScope, P = root.PMSVMetalPanel, V = root.PMSVVeterinary, X = root.PMSVPesticides, Y = root.PMSVResiduePanel, Q = root.PMSVIngredientPercentage, O = root.PMSVIngredientOrder, S = root.PMSVSmallPack, T = root.PMSVBatchSite, L = root.PMSVLotDates;
  const composition = root.PMSVVariantComposition, plan = root.PMSVTestingPlan, water = root.PMSVVendingWater, cocoaMix = root.PMSVCocoaMixtures;
  const sulphites=root.PMSVSulphites;
  const list = root.PMSV_CATALOGUE || [];
  const ids = new Set(list.map(p => p.id));
  const ayurveda=root.PMSVAyurvedaPlan,powders=root.PMSVPowderStandards,coffee=root.PMSVCoffee;
  const valid = E?.date === '2026-11-20' && R && registry?.latestRound === 163 && registry.carobReview?.referenceRows === 3 && registry.sampleScopeReview?.referenceRows === 35 && registry.catechuReview?.referenceRows === 2 && registry.additiveSolventReview?.products === 4 && registry.openProductReview?.products === 12 && registry.polyolReview?.referenceRows === 9 && registry.singharaReview?.criteria===8 && sulphites?.profiles.size===registry.sulphiteReview?.products && plan?.openScope().size === registry.firstSourceReview?.pending && registry.saltAndIngredientReview?.saltSampleCriteria === 4 && registry.importAndFormReview?.metalRows?.length === 6 && composition?.sampleProfiles.size === 2 && registry.ingredientReview?.silverId === P?.silverId && coffee?.profiles.size === 3 && registry.coffeeReview?.forms === 10 && powders?.products.size === 6 && registry.powderReview?.comparisons === 26 && registry.sugarReview?.metalRow === 'Pb2' && root.PMSVRecipeSamples?.ids?.length === 6 && registry.recipeSampleReview?.criteria === 11 && registry.casingReview?.casingCriteria === 20 && registry.botanicalReview?.criteria === 18 && registry.additiveMetalReview?.criteria === 12 && ayurveda && registry.ayurvedaPlanReview?.rules?.length === 10 && registry.childCropReview?.criteria === 15 && registry.spiceFoodReview?.products === 2 && registry.dextrinReview?.productId === P?.dextrinId && registry.cocoaMixReview?.namingRows === 11 && cocoaMix && registry.lactoseReview?.comparisons === 6 && registry.vendingPlanReview?.entries === 74 && water && registry.groupPesticideReview?.comparisons === 9 && registry.firstSourceReview?.withRoute === 524 && registry.metalReportingReview?.products === 533 && registry.multiMetalReview?.products === 533 && registry.toxinLabReview?.products === 533 && registry.measuredPlanReview?.products === 533 && registry.worksheetPlanEvidenceReview?.products === 533 && registry.contaminantEditionReview?.products === 533 && registry.veterinaryEditionReview?.seafoodProducts === 24 && registry.residueTestingPlanReview?.products === 533 && plan?.available && registry.testingPlanReview?.products === 533 && composition?.profiles.size === registry.variantCompositionReview?.products && registry.shelfLifeReview?.products===533 && L && registry.lotDateReview?.products===533 && registry.dateMarkingReview?.products===533 && T && registry.batchSiteReview?.products===533 && S && registry.smallPackReview?.products===533 && O && registry.ingredientOrderReview?.products===533 && Q?.requestColumns?.length===3 && registry.recipeRequestReview?.products===533 && registry.ingredientPercentageReview?.products===533 && registry.ethyleneOxideReview?.products===533 && Y && registry.spicePanelReview?.marketedProducts===36 && X && registry.pesticideReview?.gazetteRows===1098 && V && registry.veterinaryReview?.toleranceRows===358 && P?.fields?.length && registry.metalPanelReview?.rows===382 && C?.fields?.length && registry.cropArticleReview?.sourceRows===45 && root.PMSVMetalScope && root.PMSVBroadContaminants && registry.records?.length === 137 &&
    ['culinarySauceReview','tomatoSoybeanReview','tomatoJuiceReview','cannedTomatoReview','thermalPackReview','fruitCocktailReview','vegetableMealReview','gingerPasteReview','tomatoConcentrateReview'].every(k=>registry[k]) && ids.size === 533 && list.length === ids.size &&
    [E.products,R.products].every(rows => Object.keys(rows).length === ids.size && [...ids].every(id => Object.hasOwn(rows,id))) &&
    [...ids].every(id => {
      const p = E.products[id], a = E.standards[p.standard];
      return (!p.standard || (a && R.standards[p.standard] && E.documents[a.doc])) &&
        (p.scope === 'product_standard' ? !!p.standard : p.routeDocs.length > 0 && p.routeDocs.every(k => E.documents[k])) &&
        p.monographs.every(([k]) => E.monographs[k]);
    });
  const priority = new Map((registry?.records || []).map(row => [row.id,row]));
  const focused = new Set();
  for (const field of ['culinarySauceReview','tomatoSoybeanReview','tomatoConcentrateReview','tomatoJuiceReview','cannedTomatoReview','thermalPackReview','fruitCocktailReview','vegetableMealReview','gingerPasteReview']) {
    const r = registry?.[field];
    if (!r) continue;
    if (r.id || r.productId) focused.add(r.id || r.productId);
    for (const p of r.products || []) focused.add(p.id);
    for (const row of r.rows || []) for (const p of row.products || []) focused.add(p.id);
  }
  const states = new Map();
  const lab=root.PMSVLabGuide, importDocs=root.PMSVImportDocuments;
  const broad=root.PMSVBroadContaminants;
  const sampling=root.PMSVSamplingQuantities, formulation=root.PMSVFormulation;
  const fields = ['microForm','microFormRef','microPh','microPhRef',...(formulation?.assayFields||[]),'dispatchRow',...(sampling?.lotFields||[]),...broad.reportFields,...(importDocs?.fields||[]),'drySpecies',...(lab?.basisFields||[]),...(lab?.beanFields||[]),...(sulphites?.fields||[]),'ingredientSubtype','coffeeForm','coffeePct','compVariant','compSweetener','lotDateDraft','batchSiteDraft','smallPackDraft','orderDraft','quidDraft','reference','article','note','criterion','result','unitConfirmed','compReport','pack','commodityKey','broadForm','broadRef','metalForm','metalFormRef','metalPack','metalPackRef','mercuryArticle','mercuryArticleRef',...(C?.fields||[]),...(P?.fields||[]),...(V?.fields||[]),...(X?.fields||[]),...(Y?.fields||[]),...(water?.fields||[]),...(ayurveda?.fields||[]),...(cocoaMix?.fields||[])];
  const portal = 'https://foodocopoeia.fssai.gov.in/home.aspx';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const human = name => String(name || '').replace(/_/g,' ').replace(/^./, c => c.toUpperCase());
  const href = (url,label) => (/^https:\/\/(?:[a-z0-9-]+\.)*fssai\.gov\.in\//i.test(url || '') || P?.importSources?.includes(url) || plan?.isExportSource(url) || importDocs?.isSource(url) || root.PMSVStarchSpecifications?.activeSource(url) || lab?.isIgGSource(url) || url===lab?.beanSampling?.guide || url===lab?.beanSampling?.standard || lab?.isControlSource(url) || lab?.isRecognitionSource(url) || water?.isSource(url)) ?
    '<a class="source-ref" target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(label)+'</a>' : '';
  function documentLink(id,page,label) {
    const d = E.documents[id];
    if (!d) return '';
    return href(d.url.split('#')[0]+(Number.isInteger(page) ? '#page='+page : ''),label || d.label);
  }
  function officialLinks(id,pp=[]) {
    if (!pp.length) return documentLink(id);
    return pp.map(n => documentLink(id,n,'PDF p. '+n)).join(' ');
  }
  const section = (title,body) => '<details class="ws-section"><summary>'+esc(title)+'</summary><div>'+body+'</div></details>';
  const ul = values => '<ul>'+values.map(v => '<li>'+v+'</li>').join('')+'</ul>';
  function display(v) {
    if (v === null || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (Array.isArray(v)) return v.map(display).join(' · ');
    if (typeof v === 'object') return Object.entries(v).map(([k,s])=>human(k)+' '+display(s)).join(' · ');
    return String(v);
  }
  function entries(v) {
    if (v === undefined || v === null) return '';
    if (Array.isArray(v)) return ul(v.map(x => esc(display(x))));
    if (typeof v === 'object') return '<dl class="ws-terms">'+Object.entries(v).map(([k,x])=>'<dt>'+esc(human(k))+'</dt><dd>'+esc(display(x))+'</dd>').join('')+'</dl>';
    return '<p>'+esc(v)+'</p>';
  }
  function table(head,rows) {
    if (!rows.length) return '';
    return '<div class="ws-scroll"><table><thead><tr>'+head.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  }
  function getState(id) {
    if (!states.has(id)) {
      let saved = {};
      try {saved = JSON.parse(root.localStorage?.getItem('pmsv-fssai-worksheet-r93:'+id) || '{}') || {};} catch (_) {}
      const state = {};
      for (const k of fields) state[k] = typeof saved[k] === 'string' ? saved[k] : '';
      if(typeof saved.vetDate!=='string')state.vetDate=V.reviewDate;
      if(state.panelLabBasis==='yes'&&plan.metalEdition(state.vetDate)!==(state.panelLabEdition||'original'))state.panelLabBasis='';
      states.set(id,state);
    }
    return states.get(id);
  }
  function threshold(s) {
    return s.operator === 'range' ? s.min+' to '+s.max+' '+s.unit : s.operator && s.value !== undefined ? s.operator+' '+s.value+' '+(s.unit || '') : display(s);
  }
  function conditions(s) {
    const omit=new Set(['parameter','unit','value','min','max','operator','kind','source_clause','analytical_basis']);
    return Object.entries(s).filter(([k,v])=>!omit.has(k) && v !== null && v !== '' && (typeof v!=='object' || Object.keys(v).length)).map(([k,v])=>human(k)+' '+display(v)).join(' · ');
  }
  // Compare decimal strings directly, including equality at an inclusive endpoint.
  function decimals(a,b) {
    const pat = /^[+]?\d+(?:\.\d+)?$/;
    if (!pat.test(String(a)) || !pat.test(String(b))) return null;
    const split = s => String(s).replace(/^\+/,'').split('.');
    let [ai,af=''] = split(a), [bi,bf=''] = split(b);
    ai=ai.replace(/^0+(?=\d)/,''); bi=bi.replace(/^0+(?=\d)/,'');
    if (ai.length!==bi.length) return Math.sign(ai.length-bi.length);
    if (ai!==bi) return ai>bi?1:-1;
    const n=Math.max(af.length,bf.length);af=af.padEnd(n,'0');bf=bf.padEnd(n,'0');
    return af===bf?0:af>bf?1:-1;
  }
  function compare(s,text) {
    if (s.operator==='range') {
      const compareValue=s.signed?signedDecimals:decimals;
      const l=compareValue(text,s.min),h=compareValue(text,s.max);
      return l===null || h===null ? null : l>=0 && h<=0;
    }
    const c=decimals(text,s.value);
    if (c===null) return null;
    switch (s.operator) {
      case '<':return c<0; case '<=':return c<=0;case '>':return c>0;case '>=':return c>=0;case '=':return c===0;default:return null;
    }
  }
  function signedDecimals(a,b){
    const parts=value=>{
      const m=/^([+−-]?)(\d+(?:\.\d+)?|\.\d+)$/.exec(String(value));
      if(!m)return null;
      const magnitude=m[2].replace(/^\./,'0.');
      return {magnitude,negative:['−','-'].includes(m[1])&&decimals(magnitude,'0')!==0};
    };
    const left=parts(a),right=parts(b);
    if(!left||!right)return null;
    if(left.negative!==right.negative)return left.negative?-1:1;
    const comparison=decimals(left.magnitude,right.magnitude);
    return left.negative?-comparison:comparison;
  }
  function enabledCriteria(id,state) {
    const p=E.products[id];
    if (!p) return [];
    if(plan.ingredients.has(id))return plan.ingredientCriteria(id,state||getState(id));
    if(coffee.profiles.has(id))return coffee.selected(id,state||getState(id))?.criteria||[];
    if (powders?.products.has(id)) return powders.products.get(id).criteria;
    if (plan.sugarCriteria.has(id)) return plan.sugarCriteria.get(id);
    if (id.startsWith('102-')) return [];
    if (composition.profileFor(id)) return composition.enabled(id,state||getState(id));
    const s=R.standards[p.standard];
    if (focused.has(id) || p.scope!=='product_standard' || !s) return [];
    const differences=new Set((p.qualityCrosschecks||[]).filter(([,row])=>row[5]==='different numerical values').map(([,row])=>row[0]));
    return s.criteria.map((v,i)=>({v,i})).filter(({v})=>v.compare && !differences.has(v.spec.parameter) && !String(v.spec.unit).includes('°Bé') &&
      [v.spec.value ?? v.spec.min,v.spec.max ?? v.spec.value].every(b=>decimals(b,b)===0));
  }
  function reportRequired(id){return composition.sampleProfiles.has(id)||plan.ingredients.has(id)||coffee.profiles.has(id)||plan.sugarCriteria.has(id)||!!powders?.products.get(id)?.criteria.length;}
  function resultText(id,s=getState(id)) {
    const row=enabledCriteria(id,s).find(({i})=>String(i)===s.criterion);
    if (!row || !s.result?.trim()) return '';
    if (s.unitConfirmed!=='yes') return 'Confirm the product variant, unit and analytical basis before comparing.';
    const value=reportRequired(id)?s.result.trim().replace(/^\./,'0.'):s.result.trim();
    if(reportRequired(id)){
      if(!s.reference?.trim()||!s.compReport?.trim())return 'Enter the sample or lot and laboratory report reference before comparison.';
      if(id===P.silverId&&row.v.spec.unit==='parts per 1000'&&compare({operator:'range',min:0,max:1000},value)!==true)return 'Enter fineness between 0 and 1,000 parts per 1,000.';
      if(id===P.silverId&&row.v.spec.unit==='g/m²'&&compare({operator:'>',value:0},value)!==true)return 'Enter a positive leaf mass per unit area.';
      if(row.v.spec.unit.startsWith('%')&&compare({operator:'range',min:'0',max:'100'},value)!==true)return 'Enter a percentage from 0 to 100 on the specified analytical basis.';
    }
    const outcome=compare(row.v.spec,value);
    if (outcome===null) return row.v.spec.signed?'Enter the signed isotope delta in per mille. Qualifiers require manual review.':'Enter a non-negative decimal result in the cited unit. Qualifiers such as <LOQ require manual review.';
    return (outcome?'Within':'Outside')+' the cited source-edition criterion for '+row.v.spec.parameter+'.';
  }
  function productSections(id) {
    const p=E.products[id], r=R.products[id], anchor=E.standards[p.standard], std=R.standards[p.standard];
    let body='';
    if (std) {
      const key=p.standard.split('#')[1];
      body+='<p><b>'+esc(std.name)+'</b> · '+esc(p.scope==='product_standard'?'Article / regulation ':'Ingredient identity and purity article ')+esc(key)+'</p><p>'+esc(anchor.basis)+' · '+officialLinks(anchor.doc,anchor.p)+'</p>';
      if (std.issues.length) body+='<p><b>Source questions</b></p>'+entries(std.issues);
      if(id.startsWith('102-'))body+='<p>'+esc(list.find(v=>v.id===id)?.nonTransfer||'Confirm the documented recipe and ingredient scope.')+'</p>';
      else if(composition.sampleProfiles.has(id))body+='<p>'+esc(composition.profileFor(id).note)+'</p>';
      else if(plan.ingredients.has(id))body+=section('Ingredient sample and criteria',table(['Sample','Parameter','Requirement','Basis and source'],plan.ingredientRows(id).slice(1).filter(r=>r[2]===plan.areas[0]).map(r=>[esc(r[4]),esc(r[5]),esc([r[7],r[8]].join(' ')),esc(r[9])+' '+r[14].split(' | ').map(u=>href(u,'Gazette p. '+u.split('#page=')[1])).join(' ')])));
      else if(coffee.profiles.has(id))body+='<p>Use the coffee worksheet to select the form, review its source pages and compare a result.</p>';
      else if(powders.products.has(id)){
        const rows=plan.powderRows(id).slice(1);
        body+=section('Product-specific criteria',table(['Parameter','Requirement','Review','Basis and source'],rows.map(r=>
          [esc(r[5]),esc([r[7],r[8]].filter(Boolean).join(' ')),esc(r[6]),esc(r[9])+' '+r[14].split(' | ').map(u=>href(u,'Gazette p. '+u.split('#page=')[1])).join(' ')])));
      }
      else if (focused.has(id)) body+='<p>Use the product-specific calculator in this product view for the current worked limits and pack conditions.</p>';
      else {
        const srows=std.criteria.map(({spec:s,compare:auto})=>[esc(s.parameter),esc(threshold(s)),esc([s.analytical_basis,conditions(s)].filter(Boolean).join(' · ') || 'See cited article'),esc(auto?'Source-edition row':'Inspect article and variant')]);
        if (srows.length) body+=section('Composition and quality criteria ('+srows.length+')',table(['Parameter','Cited criterion','Basis and conditions','Review'],srows));
        if (Object.keys(std.sections).length) body+=section('Identity, process and variant provisions',Object.entries(std.sections).map(([k,v])=>{
          const scoped=['variants','composition_by_form'].includes(k) && Array.isArray(v)
            ?v.filter(item=>typeof item!=='object'||!item||plan.relevantForm(key,r.name,item.variant||item.name||r.name)):v;
          if(id===V.eggPowderId&&k==='variants')return '<h5>Egg powder variants</h5>'+entries(scoped.map(form=>form.name==='Dried whole egg'?{...form,protein_min_pct:V.eggProteinNote}:form));
          return Array.isArray(scoped)&&!scoped.length?'':'<h5>'+esc(human(k))+'</h5>'+entries(scoped);
        }).join(''));
      }
      if (anchor.gaz.length) body+=section('Original Gazette article and amendment references', '<p>The printed article number occurs on these pages. Read the operative wording, product scope and commencement before using a change.</p>'+ul(anchor.gaz.map(([doc,pp])=>esc(E.documents[doc].label+' '+(E.documents[doc].date||''))+' '+officialLinks(doc,pp))));
    }
    for (const z of p.gazetteFindings||[])body+='<h5>'+esc(z.parameter)+'</h5><p>'+esc(z.result+' '+z.scope)+'</p>'+officialLinks(z.document,z.pages);
    if (p.scope!=='product_standard') body+='<h5>'+esc(human(p.scope))+'</h5><p>'+esc(r.routeFinding)+'</p>'+entries(r.checks)+'<p>'+esc(r.routeContext)+'</p>'+p.routeDocs.map(k=>documentLink(k)).join(' ');
    for(const [doc,pp,note] of p.routeAnchors||[])body+='<p>'+esc(note)+' · '+officialLinks(doc,pp)+'</p>';
    if(p.directions?.length)body+=section('Product-specific FSSAI directions',ul(p.directions.map(k=>documentLink(k))));
    return section(p.scope==='product_standard'?'Product standard and Gazette':'Classification, identity and applicable route',body);
  }
  function categories(id) {
    const p=R.products[id], paths=new Set();
    for (const c of [p.category,...p.related].filter(Boolean)) {
      const exact=R.aliases[c]?.maps_to || c;
      const list=String(exact).split('.');
      while(list.length){const key=list.join('.');if(R.categories[key])paths.add(key);if(list.length===1 && R.categories[key+'.0'])paths.add(key+'.0');list.pop();}
    }
    return [...paths];
  }
  function formulationResults(id,filter){
    const rows=formulation.entries(id,getState(id)),rule=rows[0];
    const q=String(filter||'').toLowerCase().trim();
    const matches=rows.slice(1).filter(r=>[r.parameter,r.ins,r.notes].join(' ').toLowerCase().includes(q));
    const sources=[...new Set(rows.flatMap(r=>r.source.split(' | ')))];
    const links=sources.map((url,i)=>href(url,i?(url.includes('#page=')?'Appendix A p. '+url.split('#page=')[1]:'Appendix A notes'):'FSSAI product standard')).join(' ');
    return '<p><b>'+esc(rule.form)+'</b> · '+esc(rule.article)+'</p><p>'+esc(rule.notes)+'</p>'+
      (id===formulation.colostrum&&!getState(id).compVariant?'<p>Choose the liquid or powder form under Product variant to see its requirements.</p>':'')+
      (matches.length?table(['Substance or group','INS','Published maximum or GMP','Conditions'],matches.map(r=>[esc(r.parameter),esc(r.ins),esc(r.published),esc(r.notes)])):rows.length>1?'<p>No matching entry in this product-specific extract.</p>':'')+links;
  }
  function assayPanel(id){
    if(id!==formulation?.mpc&&id!==formulation?.colostrum)return '';
    const s=getState(id);
    const field=(key,label,attributes='')=>'<label>'+label+'<input data-ws-field="'+key+'" '+attributes+' value="'+esc(s[key])+'"></label>';
    const options=(items,selected)=>items.map(([value,label])=>'<option value="'+value+'"'+(value===selected?' selected':'')+'>'+label+'</option>').join('');
    return '<fieldset data-form-assay'+(formulation.assayApplies(id,s)?'':' hidden')+'><legend>BHA or BHT result on a fat basis</legend>'+field('formLot','Powder sample or lot','maxlength="160"')+field('formReport','Laboratory report reference','maxlength="200"')+
      '<label>Antioxidant<select data-ws-field="formIns">'+options([['','Choose antioxidant'],['320','BHA · INS 320'],['321','BHT · INS 321']],s.formIns)+'</select></label>'+
      '<label>Basis on report<select data-ws-field="formBasis">'+options([['','Choose basis'],['fat','mg/kg fat'],['powder','mg/kg whole powder']],s.formBasis)+'</select></label>'+
      field('formValue','Measured result (mg/kg)','inputmode="decimal" maxlength="24"')+
      '<label data-form-fat'+(s.formBasis==='powder'?'':' hidden')+'>Fat in the same powder (% by mass)<input data-ws-field="formFat" inputmode="decimal" maxlength="20" value="'+esc(s.formFat)+'"></label>'+
      '<label><input type="checkbox" data-ws-field="formSingle"'+(s.formSingle==='yes'?' checked':'')+'> The formula uses only the selected antioxidant from the BHA, BHT and propyl gallate group.</label>'+
      '<p data-form-result role="status">'+esc(formulation.assay(id,s))+'</p></fieldset>';
  }
  function addResults(id,filter) {
    return formulation?.productRules.has(id)?formulationResults(id,filter):categoryResults(id,filter);
  }
  function categoryResults(id,filter) {
    const p=R.products[id], q=String(filter||'').trim().toLowerCase(),codes=categories(id);
    const rows=[];
    for (const c of codes) for (const v of R.categories[c].rows) {
      const [name,ins,limit,cond,notes,variant,specific]=v;
      const group=R.groups[String(name).toUpperCase()] || [];
      if (q && ![name,ins,c,...group.map(x=>x.name+' '+x.ins)].some(t=>String(t).toLowerCase().includes(q))) continue;
      const numbering=Array.isArray(notes)?notes.join(', '):String(notes||'');
      const ref=[...new Set(numbering.match(/\d+/g)||[])].map(n=>'Note '+n+' '+(R.notes[n] || 'Consult Appendix A')).join(' · ');
      const fuller=[cond,variant,specific,ref,group.length?'Group members '+group.map(z=>z.name+' (INS '+z.ins+')').join(', '):''].filter(Boolean).map(display).join(' · ');
      rows.push([esc(c+' · '+R.categories[c].name),esc(name+(ins?' · '+ins:'')),esc(limit),esc(fuller||'Read the article, group and category notes')]);
    }
    const gmpex=(R.gmp.annex_exclusion_codes || []).filter(c=>p.category===c||p.category.startsWith(c+'.'));
    const note=gmpex.length?'GMP Annex exclusions to inspect for this category: '+gmpex.join(', ')+'.':'Read the GMP Annex exclusions and food-specific restrictions for the intended use.';
    const capped=rows.slice(0,q?120:12);
    return '<p>'+esc(codes.length?codes.map(c=>c+' '+R.categories[c].name).join(' · '):'Use the specific regulation or product classification to establish the applicable table.')+'</p><p>'+esc(note)+'</p>'+
      (rows.length?'<p>Showing '+capped.length+' of '+rows.length+' matching table rows.</p>'+table(['Table category','Additive / INS','Published entry','Conditions and notes'],capped):'<p>No matching row in the linked table extracts. Check the specific regulation, applicable parent table, carry-over provisions and the GMP rules.</p>');
  }
  function addSection(id) {
    if(formulation?.productRules.has(id)){
      const hasList=[formulation.mpc,formulation.colostrum,'01-01-8-whey-protein-concentrate'].includes(id);
      const categoryLookup=['04-04-1-coconut-milk-powder','05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake','01-01-5-dairy-permeate-powders'].includes(id)
        ?section('Appendix A category references','<p>Check each category entry against the product restrictions above and the conditions for the proposed use.</p><label>Find a category entry by name or INS<input type="search" data-ws-category-add></label><div data-ws-category-results>'+categoryResults(id,'')+'</div>'):'';
      return section('Food additives and processing aids','<div data-formulation>'+ (hasList?'<label>Find an additive by name or INS<input type="search" data-ws-add></label>':'')+
        '<div data-ws-add-results>'+addResults(id,'')+'</div>'+assayPanel(id)+'<p><button type="button" data-formulation-export>Download product formulation rules</button></p>'+
        categoryLookup+documentLink('chapter-19',null,'Full Appendix A')+' '+documentLink('chapter-21',null,'Appendix C · processing aids')+'</div>');
    }
    const r=R.products[id],alias=R.aliases[r.category];
    return section('Food additives and processing aids','<p>Appendix A category '+esc(r.category||'requires product-specific review')+'. Match the intended additive, food and function. Check the most specific entry, group total, notes and any stricter product rule. Annexure II categories for FPC 18 depend on the recipe.</p>'+
      (alias?'<p>'+esc(alias.reason)+'</p>':'')+'<label>Find an additive by name or INS<input type="search" data-ws-add placeholder="e.g. sorbate or 202"></label><div data-ws-add-results>'+addResults(id,'')+'</div>'+documentLink('chapter-19')+' '+documentLink('chapter-21',null,'Appendix C · processing aids'));
  }
  function testingPlanSection(id) {
    const isVending=id===water.productId;
    const baseAreas=plan.scopedReferences(id).length?[...plan.areas,plan.scopedArea]:isVending?[water.area,...plan.areas]:ayurveda.known(id)?[ayurveda.area,...plan.areas]:sulphites.profiles.has(id)?[...plan.areas,sulphites.area]:plan.areas;
    const areas=plan.focusIds.includes(id)&&!isVending?[...baseAreas,plan.sampleArea]:baseAreas;
    const options=[...areas];
    if(formulation?.productRules.has(id))options.push(formulation.area);
    if(root.PMSVSamplingQuantities)options.push(root.PMSVSamplingQuantities.area);
    if(root.PMSVStarchSpecifications?.ids.includes(id))options.push(root.PMSVStarchSpecifications.area);
    if(lab?.referenceEntries(id).length)options.push(lab.referenceArea);
    if(importDocs?.routes.has(id))options.push(importDocs.area);
    if(plan.processingRow(id))options.push(plan.processingArea);
    return '<details class="ws-section" data-testing-plan><summary>Testing plan and source decisions</summary><div>'+
      '<p>The selected date applies to metals, toxins and veterinary residues. The cocoa mix naming table was reviewed on 23 November. The Sajji Khar import instruction and the colostrum, royal jelly, coffee, chicory, sweetener, powder and starch standards were reviewed on 24 November 2026. The sugar sulphite table and dried-syrup pack declaration were reviewed on 25 November. Dairy microbiological cross-references and processed-crop pesticide guidance were reviewed on 26 November. The conditional pesticide entries for four product forms were reviewed on 23 November 2026. The product plan includes measured composition, metal and toxin results entered in the worksheet, documented sample decisions, saved pesticide reports and the veterinary assessment.</p><label>Review area<select data-plan-area>'+options.map(a=>'<option>'+esc(a)+'</option>').join('')+'</select></label>'+
      '<label data-plan-vet-date-label hidden>Assessment date for metals, toxins and veterinary residues<input type="date" data-plan-vet-date value="'+esc(getState(id).vetDate)+'"></label>'+
      (isVending?water.markup(getState(id)):ayurveda.markup(id,getState(id)))+
      '<div data-plan-fish-screen hidden><label>Quick screen for total arsenic in fish oil (mg/kg)<input type="text" placeholder="e.g. &lt;0.1" maxlength="80" data-plan-total-as></label><p data-plan-as-result role="status"></p><p>To include a laboratory report in the download, enter it under Check a reported metal result.</p></div>'+
      '<button type="button" data-plan-export>Download this product’s testing plan</button><div data-plan-results></div></div></details>';
  }
  function showPlan(node,id) {
    const area=node.querySelector('[data-plan-area]').value;
    const state=getState(id);
    const ayControls=node.querySelector('[data-ayurveda-controls]');
    if(ayControls)ayControls.hidden=area!==ayurveda.area;
    const waterControls=node.querySelector('[data-water-controls]');
    if(waterControls)waterControls.hidden=area!==water.area;
    node.querySelector('[data-plan-vet-date-label]').hidden=![plan.areas[2],plan.areas[3],plan.areas[5],plan.scopedArea].includes(area);
    const screen=node.querySelector('[data-plan-fish-screen]');
    screen.hidden=area!==plan.areas[2]||id!=='02-02-1-fish-oil'||V.edition(state.vetDate)!=='amended';
    if(!screen.hidden)screen.querySelector('[data-plan-as-result]').textContent=plan.fishOilScreen(screen.querySelector('input').value);
    const rows=plan.entries(id,state.vetDate,state).filter(r=>r.area===area);
    const cells=rows.map(r=>{
      const sampling=[['n',r.n],['c',r.c],['m',r.m],['M',r.M]].filter(([,v])=>v!=null).map(([k,v])=>k+' = '+v).join(', ');
      const urls=(r.source||'').split(' | ').filter(Boolean);
      return [esc(r.parameter),esc([r.form,r.status].filter(Boolean).join(' · ')),esc([r.limit,r.unit,sampling].filter(Boolean).join(' · ')),esc([r.notes,r.locator].filter(Boolean).join(' · ')),
        esc(r.article)+' '+urls.map(u=>href(u,r.area===water.area?water.sourceLabel(u):u.includes('#page=')?'p. '+u.split('#page=')[1]:'Source')||esc(u)).join(' ')];
    });
    node.querySelector('[data-plan-results]').innerHTML=table(['Parameter or decision','Form and applicability','Criterion or sampling plan','Basis or next action','Source'],cells);
  }
  function microDecisionTable(id,state){
    const rows=plan.microFormRows(id,state.vetDate,state).slice(1);
    if(!rows.length)return '<p>Select a supported worksheet date to view sampling criteria.</p>';
    const fruit=plan.microFormRoute(id)?.form_evidence.family==='fruit-vegetable',grain=plan.grainProduct(id);
    const showTable=fruit||grain;
    const cells=rows.map(r=>{
      const sampling=['n','c','m','M'].flatMap((key,i)=>r[10+i]!==''?[key+' = '+r[10+i]]:[]).join(', ');
      return [esc(r[4]),esc(r[5]),...(showTable?[esc(r[3])]:[]),esc(r[6]),esc([grain?r[7]:'',sampling,r[8]].filter(Boolean).join(' · ')),...(grain?[esc(r[9])]:[]),r[14].split(' | ').map(u=>href(u,(u.includes('Appendix%20B')?'Appendix B':'Product standard')+' p. '+u.split('#page=')[1])).join(' ')];
    });
    const option=plan.microFormRoute(id)?.options.find(o=>plan.microFormChoice(o)===state.microForm);
    const decision=option?.ph_exclusion&&String(state.microFormRef||'').trim()?'<p role="status">'+esc(plan.microPhDecision(state).note)+'</p>':'';
    const stage=fruit?'<p>Table 4A assesses process hygiene at the end of manufacture. Table 4B sets food safety criteria for the lot at the end of manufacture and throughout market shelf life.</p>':'';
    let fermentation='';
    if(option?.fermentation_exclusion){
      const message=String(state.microFormRef||'').trim()?'Table 4A footnote 3 applies. The documented fermentation involves yeast or mould, so its count is omitted. The other criteria still apply.'
        :'Evidence reference needed. The plan retains the yeast and mould count until the fermentation record is entered.';
      fermentation='<p role="status">'+message+'</p>';
    }
    return decision+fermentation+stage+table(['Food form','Parameter or decision',...(showTable?['Article or table']:[]),'Applicability','Sampling plan',...(grain?['Reporting basis or scope']:[]),'Source'],cells);
  }
  function microFormPanel(id,route,state){
    const options=route.options.map(option=>{
      const key=plan.microFormChoice(option);
      return '<option value="'+esc(key)+'"'+(state.microForm===key?' selected':'')+'>'+esc(option.condition||option.when)+'</option>';
    }).join('');
    const ph=route.options.find(o=>o.ph_exclusion);
    const phInputs=ph?'<fieldset data-micro-ph="'+esc(plan.microFormChoice(ph))+'"'+(plan.microFormChoice(ph)===state.microForm?'':' hidden disabled')+'><legend>Optional Listeria exclusion under Table 4B, footnote 4</legend>'+
      '<label>Measured pH<input data-ws-field="microPh" inputmode="decimal" maxlength="40" value="'+esc(state.microPh)+'"></label>'+
      '<label>pH report or batch reference<input data-ws-field="microPhRef" maxlength="240" value="'+esc(state.microPhRef)+'"></label></fieldset>':'';
    return '<details class="ws-section" data-micro-form-panel><summary>Microbiological criteria and sampling</summary><div><p>'+esc(route.form_evidence.prompt)+'</p>'+
      '<label>Food form or process<select data-ws-field="microForm"><option value="">Show the possible routes</option>'+options+'</select></label>'+
      '<label>Specification, batch record or assessment reference<input data-ws-field="microFormRef" maxlength="240" value="'+esc(state.microFormRef)+'"></label>'+phInputs+
      '<p>Record the evidence for the selected route. The full catalogue export shows the options for all products.</p><div data-micro-form-results>'+microDecisionTable(id,state)+'</div>'+
      '<button type="button" data-export-micro-form>Export this microbiological plan</button></div></details>';
  }
  function microSection(id,p) {
    const route=plan.microFormRoute(id);
    if(route)return microFormPanel(id,route,getState(id));
    if(plan.grainProduct(id))return '<details class="ws-section" data-grain-plan><summary>Microbiological criteria and sampling</summary><div data-micro-form-results>'+microDecisionTable(id,getState(id))+'</div><button type="button" data-export-micro-form>Export this microbiological plan</button></details>';
    const sections=[];
    function profile(key,route) {
      const m=R.micro[key];if(!m)return '';
      return section(m.name,'<p>Appendix B · '+esc(human(m.group))+' · '+esc(display(m.pages))+'</p>'+entries(plan.microCriteria(m,route)));
    }
    for (const [type,info] of p.micro) {
      sections.push('<p><b>'+esc(human(type))+'</b> · '+esc(info.note||info.reason||info.route||human(info.status))+'</p>');
      if(info.matrix_scope_note)sections.push('<p>'+esc(info.matrix_scope_note)+'</p>');
      const sources=plan.microSources(info);
      if(sources.length)sections.push(sources.map((u,i)=>href(u,i?'Dairy chapter, p. '+u.split('#page=')[1]:'Gazette clause '+info.source_clause)).join(' '));
      if(info.profile_key)sections.push(profile(info.profile_key,info));
      for(const opt of info.options||[])sections.push('<p>'+esc(opt.condition||opt.note||'Process or variant condition')+'</p>'+profile(opt.profile_key,opt));
    }
    return section('Microbiological criteria and sampling',(sections.length?sections.join(''):'<p>Establish the named food and process against Appendix B and the specific product regulation. Record the applicable table, sampling stage and plan.</p>')+documentLink('chapter-20'));
  }
  function commodityResults(article,analyte) {
    const norm=v=>String(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const q=norm(article),chemical=norm(analyte);
    if(q.length<2 && chemical.length<2)return '<p>Enter at least two characters in either field.</p>';
    const matches=[];
    for(const [i,row] of (E.commodityRows||[]).entries()) {
      if((!q || norm(row[0]).includes(q)) && (!chemical || norm(row[1]).includes(chemical)))matches.push([i,row]);
    }
    if(!matches.length)return '<p>No matching wording in this extract. Check the current regulation, synonyms and applicable broader articles.</p>';
    return '<p>Showing '+Math.min(matches.length,40)+' of '+matches.length+' published rows. Check the legal article, scope, unit and effective date.</p>'+
      table(['Printed commodity','Analyte or group','Published entry','Source and record'],matches.slice(0,40).map(([i,a])=>[esc(a[0]),esc(a[7]+' · '+a[1]),esc([a[2],a[3],a[4]].filter(Boolean).join(' · ') || 'Inspect the original entry'),documentLink(a[5],a[6],'PDF p. '+a[6])+' <button type="button" data-ws-candidate="'+i+'">Record candidate</button>']));
  }
  function recordedCommodity(id) {
    const key=getState(id).commodityKey;
    if(!/^\d+$/.test(key)||!E.commodityRows?.[Number(key)])return '';
    const a=E.commodityRows[Number(key)];
    return 'Candidate recorded for review · '+a[0]+' · '+a[1]+' · '+E.documents[a[5]].url.split('#')[0]+'#page='+a[6];
  }
  function contaminantEvidence(id,state={},date=state.vetDate) {
    if(id===water.productId)return ['FSSR 2.10.9 incorporates IS 10500 for water offered or sold through a vending machine. The testing plan includes 74 source entries. ',C.beverageDecision(id,state,date).reason,water.readingNote(state)].filter(Boolean).join(' ');
    if(id===P.sajjiId)return P.firstSource(id).text;
    if(id===plan.routeIds.salt)return C.firstSource(id).text;
    if(E.products[id].directCTR)return 'Partial direct evidence';
    if(C.positive(id).length)return 'Named finished-article evidence in CTR 2.2.1; wider review open';
    const st=P.status(id);
    if(st.exact===11)return 'Exact decisions across all 11 CTR metal headings; wider review open';
    if(st.exact+st.common===11)return 'Outcomes established across all 11 CTR metal headings; some articles share a maximum; wider review open';
    if(st.named.length)return 'Specific finished article identified in the CTR metal table; wider review open';
    return 'Exact finished-product decision open';
  }
  function contaminants(id) {
    const p=E.products[id],r=R.products[id],caseRow=priority.get(id),named=p.namedGazette||[];
    let body='<p><b>'+esc(contaminantEvidence(id))+'</b></p>';
    if (caseRow)body+='<p>'+esc(caseRow.sourceReviewResult)+'</p>';
    body+='<p>'+esc(caseRow?.sourceReviewNextAction||p.ctrAction)+'</p>';
    if (r.ctrProfiles?.length) body+=section('Recorded direct article evidence',r.ctrProfiles.map(k=>'<h5>'+esc(R.ctr[k].name)+'</h5>'+table(['Analyte','Named article','Reference level','Scope','Gazette concordance'],R.ctr[k].rows.map((v,i)=>[esc(v.contaminant),esc(v.article),esc(v.limit+' '+v.unit),esc([v.condition,v.source_note,v.source_basis].filter(Boolean).join(' · ')),(E.profileGazette?.[k]?.[i]||[]).map(a=>documentLink(a[5],a[6],'Article, analyte and number · PDF p. '+a[6])+(a[4]?' '+esc(a[4]):'')).join(' ')||'—']))).join(''));
    if (named.length)body+=section('Exact catalogue-name matches in original Gazette rows ('+named.length+')','<p>Read the printed headings, exceptions, units and commencement. These links concern only the named analyte and article.</p>'+table(['Layer / analyte','Printed article','Published entry','Original Gazette'],named.map(([article,analyte,lim,unit,scope,src,n,family])=>[esc(family+' · '+analyte),esc(article),esc([lim,unit,scope].filter(Boolean).join(' · ')||'Inspect the original table for the value, basis and qualifiers'),documentLink(src,n,'PDF p. '+n)])));
    body+=section('Search original Gazette commodity rows','<p>Search by the food wording and analyte. A raw ingredient, processed food and finished composite can have different scopes. An asterisk can denote an LOQ-based residue entry, F a fat basis, and $ a cross-reference to copper. Read the original headings and dated amendments for the selected row.</p><label>Food or commodity<input type="search" data-ws-commodity placeholder="e.g. mango"></label><label>Analyte or group<input type="search" data-ws-chemical placeholder="e.g. copper"></label><div data-ws-matches>'+commodityResults('','')+'</div><p data-ws-recorded role="status">'+esc(recordedCommodity(id))+'</p>');
    if(p.future)body+='<p><b>Recheck on 1 December 2026</b> · '+esc(p.future)+'</p>';
    return section('Contaminants, toxins and residues',body+documentLink('baser04-1')+' '+href('https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins','CTR amendments'));
  }
  function monographs(p) {
    if (!p.monographs.length)return '';
    const cross=p.qualityCrosschecks||[];
    const explained=(p.gazetteFindings||[]).map(z=>'<p>'+esc(z.parameter+' · '+z.result+' '+z.scope)+' '+officialLinks(z.document,z.pages)+'</p>').join('');
    const comparisons=cross.length?'<p>Product name, parameter, limit direction and unit were matched between the chapter worksheet and the government monograph. Any difference needs review against the original Gazette and variant.</p>'+table(['Parameter','Chapter worksheet','Monograph','Finding'],cross.map(([id,v])=>[esc(v[0]),esc(v[1]+' '+v[2]+' '+v[3]),esc(v[1]+' '+v[4]+' · '+v[6]),esc(human(v[5]))])):'';
    return section('FSSAI Food-O-Copoeia cross-references',comparisons+explained+p.monographs.map(([id,t])=>{
      const m=E.monographs[id], title=[m.category,m.name,m.variant].filter(x=>x&&x!=='N/A').filter((x,i,a)=>a.indexOf(x)===i).join(' · ');
      return '<h5>'+esc(title)+'</h5><p>'+esc(['Same catalogue name','Shared regulatory article','Related standard name'][t])+' · '+esc([m.article,m.subArticle].filter(s=>s&&s!=='-').join(' / '))+'</p>'+
        (m.quality.length?table(['Published parameter','Method references in this monograph'],m.quality.map(([name,codes])=>[esc(name),esc(codes.join(', ')||'See the manual cited in the monograph')])): '<p>'+esc(m.read?'No quality parameter was listed in this monograph.':'Title located in the official directory.')+'</p>');
    }).join('')+'<p>Search the official directory using the title shown above. Confirm the method title, matrix and current adoption in the applicable manual.</p>'+href(portal,'Open Food-O-Copoeia'));
  }
  function packRules(value) {
    return R.pack[value]?'<h5>'+esc(human(value))+'</h5>'+entries(R.pack[value]):'<p>Select the primary food-contact material to see its referenced requirements.</p>';
  }
  function horizontal(id) {
    const s=getState(id);
    const opts=[['','Select material'],['paper_board','Paper or board'],['glass','Glass'],['metal','Metal'],['plastic','Plastic']].map(([v,l])=>'<option value="'+v+'"'+(s.pack===v?' selected':'')+'>'+l+'</option>').join('');
    return section('Packaging, labelling and claims','<label>Primary food-contact material<select data-ws-field="pack">'+opts+'</select></label><div data-ws-pack>'+packRules(s.pack)+'</div>'+
      S.section()+L.section()+T.section()+Q.section()+O.section()+section('Prepackaged label declarations',table(['Provision','Declaration'],R.label.map(([k,v])=>[esc(k),esc(v)]))+'<p>Cross-check pack size, retail or non-retail presentation, ingredients, allergens, product-specific declarations and applicable exemptions.</p>')+
      section('Claims review',ul(R.claims.map(c=>esc(c.clause+' · '+c.text))))+documentLink('baser16-1')+' '+documentLink('baser20-1')+' '+documentLink('baser15-1'));
  }
  function measurement(id) {
    const s=getState(id), rows=enabledCriteria(id);
    const signed=rows.find(row=>String(row.i)===s.criterion)?.v.spec.signed;
    let calc='';
    if(rows.length)calc='<label>Source-edition criterion<select data-ws-field="criterion"><option value="">Select a criterion</option>'+rows.map(({v,i})=>'<option value="'+i+'"'+(String(i)===s.criterion?' selected':'')+'>'+esc(v.spec.parameter+' · '+threshold(v.spec)+' · '+(v.spec.analytical_basis||''))+'</option>').join('')+'</select></label><label>Measured result in the cited unit<input inputmode="'+(signed?'text':'decimal')+'" data-ws-field="result" value="'+esc(s.result)+'"></label><label>Composition report reference'+(reportRequired(id)?'':' (optional)')+'<input maxlength="180" data-ws-field="compReport" value="'+esc(s.compReport)+'"></label><label class="ws-check"><input type="checkbox" data-ws-field="unitConfirmed"'+(s.unitConfirmed==='yes'?' checked':'')+'> Product variant, analytical basis and unit match the selected criterion</label><p data-ws-outcome role="status">'+esc(resultText(id))+'</p>';
    return calc;
  }
  function coffeePanel(id){
    const state=getState(id), form=coffee.selected(id,state), forms=coffee.profiles.get(id);
    const selector=forms.length===1?'<p>'+esc(form.name)+'</p>':'<label>Sampled product form<select data-ws-field="coffeeForm"><option value="">Select the form</option>'+
      forms.map(f=>'<option value="'+esc(f.key)+'"'+(f===form?' selected':'')+'>'+esc(f.name)+'</option>').join('')+'</select></label>';
    const pages=form?form.source.split(' | ').map(u=>href(u,'Product standard p. '+u.split('#page=')[1])).join(' '):'';
    const label=id===coffee.blend?coffee.labelRow(state.vetDate,state):null;
    const held=form?.rows.filter(r=>r.review).map(r=>'<p>'+esc(r.spec.parameter)+' · '+esc(r.review)+'</p>').join('')||'';
    const artwork=label?'<h5>Coffee and chicory on the front of the pack</h5><p data-coffee-label>'+esc(label.notes)+'</p>'+
      label.source.split(' | ').map(u=>href(u,(u.includes('Direction')?'Direction':'Label provision')+' p. '+u.split('#page=')[1])).join(' ')+
      (form&&state.vetDate>='2026-07-21'?'<label>Coffee percentage from approved two-ingredient recipe<input inputmode="decimal" maxlength="14" data-ws-field="coffeePct" value="'+esc(state.coffeePct)+'"></label>':''):'';
    return '<h4>Coffee and chicory checks</h4>'+selector+pages+held+artwork+measurement(id);
  }
  function variantTable(id) {
    const profile = composition.profileFor(id);
    if (!profile) return '';
    const state = getState(id), form = composition.selected(id,state);
    const option = (key,label,current) => '<option value="'+esc(key)+'"'+(key===current?' selected':'')+'>'+esc(label)+'</option>';
    const variant = '<label>Product variant<select data-ws-field="compVariant"><option value="">Select the declared variant</option>'+
      profile.forms.map(f=>option(f.name,f.name,state.compVariant)).join('')+'</select></label>';
    const sweetener = profile.kind==='gum' && form ? '<label>Sweeteners in this formulation<select data-ws-field="compSweetener"><option value="">Not confirmed</option>'+
      Object.entries(composition.sweeteners).map(([k,v])=>option(k,v,state.compSweetener)).join('')+'</select></label>' : '';
    const rows = (form?.rows || []).map(row => [esc(row.parameter),esc(composition.limit(row)),esc(composition.applicability(row,state.compSweetener)||'Applies')]);
    const checks=(form?.checks||[]).map(c=>[esc(c.parameter),esc(c.status),esc(c.notes)]);
    const sources=profile.sources||profile.pages.map(n=>profile.source+'#page='+n);
    return '<h4>Compare a lab result with the product standard</h4><p>FSSAI '+esc(profile.article)+' · '+
      sources.map(u=>href(u,'PDF p. '+u.split('#page=')[1])).join(' ')+'</p>'+variant+sweetener+
      '<p>'+esc(profile.note||composition.note(profile.kind))+'</p>'+table(['Parameter','Limit and reporting basis','Applicability'],rows)+
      table(['Parameter','Review','Evidence'],checks)+measurement(id)+
      (composition.sampleProfiles.has(id)?'<button type="button" data-sample-review-export>Download these product checks</button>':'');
  }
  function inputs(id) {
    const s=getState(id);
    const subtype='<label>Sampled catechu subtype<select data-ws-field="ingredientSubtype"><option value="">Select a subtype</option>'+[['ordinary','Ordinary catechu'],['bhatti','Bhatti Katha']].map(([value,name])=>'<option value="'+value+'"'+(s.ingredientSubtype===value?' selected':'')+'>'+name+'</option>').join('')+'</select></label>';
    const calc=id===plan.catechuId?subtype+'<div data-ingredient-measure>'+measurement(id)+'</div>':composition.profileFor(id)||coffee.profiles.has(id)?'':measurement(id);
    return '<div class="ws-inputs"><h5>My product review</h5><label>SKU, recipe or sample reference<input maxlength="180" data-ws-field="reference" value="'+esc(s.reference)+'"></label><label>Declared variant, process or article<input maxlength="320" data-ws-field="article" value="'+esc(s.article)+'"></label>'+calc+'<label>Evidence and open actions<textarea maxlength="5000" data-ws-field="note">'+esc(s.note)+'</textarea></label><button type="button" data-ws-save>Save worksheet on this device</button> <span data-ws-saved role="status"></span></div>';
  }
  function sulphitePanel(id) {
    const forms=sulphites.profiles.get(id);
    if(!forms)return '';
    const s=getState(id),r=sulphites.choice(id,s);
    const selector='<label>Grade and use from the lot specification<select data-ws-field="sulphiteForm"><option value="">Select the sampled form</option>'+
      forms.map(f=>'<option value="'+esc(f.key)+'"'+(f===r?' selected':'')+'>'+esc(f.form)+'</option>').join('')+'</select></label>';
    const references=sulphites.rows(id).map(x=>[esc(x.form),esc(x.limit+' '+x.unit),esc(x.notes),x.source.split(' | ').map(u=>href(u,'p. '+u.split('#page=')[1])).join(' ')]);
    const controls=r&&r.maximum!==null&&!r.manualBasis?'<p><button type="button" data-sulphite-lot>Enter or edit the sample reference</button></p><label>Residual SO₂ result in mg/kg<input maxlength="50" data-ws-field="sulphiteValue" value="'+esc(s.sulphiteValue)+'"></label>'+
      '<label>Laboratory report reference<input maxlength="180" data-ws-field="sulphiteReport" value="'+esc(s.sulphiteReport)+'"></label>'+
      '<label><input type="checkbox" data-ws-field="sulphiteBasis"'+(s.sulphiteBasis==='yes'?' checked':'')+'> I confirmed the lot, food-additive use and residual SO₂ basis in mg/kg.</label>':'';
    return '<h4>Sulphites in the sampled sugar or syrup</h4>'+table(['Sample','Reference','Conditions','FSSAI pages'],references)+selector+controls+
      '<p data-sulphite-outcome role="status">'+esc(sulphites.assessment(id,s))+'</p><button type="button" data-sulphite-export>Download sulphite checks for this product</button>';
  }
  function ingredientRoutes(id){
    const routes=plan.routeNotes.get(id);
    if(!routes)return '';
    const list=routes.map(r=>[esc(r.parameter),esc(r.notes),r.source.split(' | ').map(u=>href(u,u.includes('#page=')?'Source p. '+u.split('#page=')[1]:'FoSCoS product list')).join(' ')]);
    const named=id===plan.routeIds.polyols?'<button type="button" data-open-sorbitol>Open Sorbitol worksheet</button> ':'';
    return '<section class="panel compact" data-ingredient-routes><h4>Ingredient and sample checks</h4>'+table(['Check','Condition','Source'],list)+named+'<button type="button" data-route-export>Download these checks</button></section>';
  }
  function importPanel(id){
    const route=importDocs?.routes.get(id);
    if(!route)return '';
    const state=getState(id);
    const input=(field,label)=>'<label>'+esc(label)+'<input maxlength="180" data-ws-field="'+field+'" value="'+esc(state[field])+'"></label>';
    const choices=[['','Select applicability'],['imported','Imported article matches'],['outside','Outside this import route']];
    const details=route.docs.map(doc=>{
      const register=doc.field==='importFacility'?' '+href('https://sites.fssai.gov.in/refom/','Find the registered facility'):'';
      return '<div>'+input(doc.field,doc.parameter)+'<p>'+esc(doc.notes)+' '+href(doc.source,doc.article)+register+'</p></div>';
    }).join('');
    return '<details class="ws-section" data-import-panel><summary>Import documents for this consignment</summary><p>'+esc(route.form)+'</p><label>Does this consignment match the imported article?<select data-ws-field="importScope">'+choices.map(([value,label])=>'<option value="'+value+'"'+(state.importScope===value?' selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label>'+
      '<fieldset data-import-inputs'+(state.importScope==='imported'?'':' disabled')+'><legend>Consignment records</legend>'+input('importLot','Lot or consignment reference')+input('importCountry','Country of origin')+details+'</fieldset><p data-import-status role="status">'+esc(importStatus(id,state))+'</p></details>';
  }
  function importStatus(id,state){
    if(state.importScope==='outside')return 'Outside this import route.';
    if(state.importScope!=='imported')return 'Select whether the listed article was imported into India.';
    if(!state.importLot.trim()||!state.importCountry.trim())return 'Enter the consignment and country of origin.';
    const docs=importDocs.routes.get(id).docs;
    return docs.filter(doc=>state[doc.field].trim()).length+' of '+docs.length+' document references recorded for this consignment.';
  }
  function dispatchSummary(id){
    const state=getState(id),record=root.PMSVSamplingQuantities.decision(id,state.vetDate,state);
    if(!record)return '<p>Select a supported assessment date in the worksheet.</p>';
    const quantity=record.quantity?'Approximate quantity to send: '+record.quantity+' '+record.unit+'. ':'';
    const lot=sampling.lotDecision(record,state.vetDate,state);
    const cited=record.source.split(' | ').map(url=>href(url,url.includes('Lab_Sample_Regulations')?'2011 Gazette':url.includes('14.09.2026')?'2026 amendment':url.includes('Comp_Laboratory')?'Compendium p. '+url.split('#page=')[1]:'Product identity standard')).join(' ');
    const parts=lot.purpose?'<p><b>'+esc(lot.purpose[1])+'</b> '+esc(lot.purpose[2])+' '+lot.purpose[3].split(' | ').map((url,i)=>href(url,i?'FSSAI clarification':'Sampling rule')).join(' ')+'</p>':'';
    const agreed=lot.amount?'<p><b>Quantity drawn for this lot: '+esc(lot.amount)+' '+esc(lot.unit)+'</b> · '+esc(lot.lot)+' · '+esc(lot.basis)+' · '+esc(lot.evidence)+'</p>':!record.key&&state.dispatchUnspecified==='yes'?'<p>Enter a sampling purpose, lot or sample reference, positive quantity, unit and supporting reference to include this decision in the export.</p>':'';
    return '<p>Worksheet date: '+esc(state.vetDate)+'</p><p><b>'+esc(quantity||record.status)+'</b> '+esc(record.food)+(record.key?' · item '+esc(record.key):'')+'</p><p>'+esc(record.notes)+'</p>'+cited+parts+agreed;
  }
  function dispatchPanel(id){
    if(!sampling)return '';
    const state=getState(id), forms=sampling.conditional.get(id)||[];
    const isCoffee=id==='coffee'||id==='coffee-chicory-mixture';
    const options=(choices,current,placeholder)=>'<option value="">'+esc(placeholder)+'</option>'+choices.map(([key,label])=>'<option value="'+esc(key)+'"'+(current===key?' selected':'')+'>'+esc(label)+'</option>').join('');
    const input=(key,label,extra='')=>'<label>'+esc(label)+'<input data-ws-field="'+key+'" '+extra+' value="'+esc(state[key])+'"></label>';
    const canned=forms.length===1&&forms[0]==='51';
    const choices=canned?[['51','Canned food in original sealed cans'],['other-pack','Glass, pouch or other packaging']]:forms.map(k=>[k,sampling.articles.get(k).food]);
    const choose=isCoffee?'<p>Choose the sampled form in the coffee worksheet.</p>':forms.length?'<label>Sample matches this table entry<select data-ws-field="dispatchRow">'+options(choices,state.dispatchRow,canned?'Select the actual packaging':'Select the sampled form')+'</select></label>':'';
    const record=sampling.decision(id,state.vetDate,state);
    return '<details class="ws-section" data-dispatch-panel><summary>Regulatory sample quantity</summary><label>Sampling assessment date<input type="date" data-sampling-date min="2026-11-20" value="'+esc(state.vetDate)+'"></label>'+choose+
      '<label>Sampling purpose<select data-ws-field="dispatchPurpose">'+options(Array.from(sampling.purposes,([k,v])=>[k,v[0]]),state.dispatchPurpose,'Select a purpose')+'</select></label>'+
      input('dispatchLot','Actual sampled article and lot reference','maxlength="160"')+
      '<div data-dispatch-unlisted'+(!record||record.key?' hidden':'')+'><label><input type="checkbox" data-ws-field="dispatchUnspecified"'+(state.dispatchUnspecified==='yes'?' checked':'')+'> I checked the article and packaging. No named table entry applies to this sample.</label>'+
      '<fieldset data-dispatch-amount-fields'+(state.dispatchUnspecified==='yes'?'':' disabled')+'><legend>Quantity drawn for this lot</legend>'+
      input('dispatchAmount','Quantity drawn','inputmode="decimal" maxlength="16"')+
      '<label>Unit<select data-ws-field="dispatchUnit">'+options(sampling.units.map(u=>[u,u]),state.dispatchUnit,'Select a unit')+'</select></label>'+
      '<label><span data-dispatch-evidence-label>'+esc(state.vetDate<'2027-04-01'?'Food Analyst name and consultation reference':'Applicable Food Authority guideline and clause')+'</span><input maxlength="320" data-ws-field="dispatchEvidence" value="'+esc(state.dispatchEvidence)+'"></label></fieldset></div>'+
      '<div data-dispatch-result aria-live="polite">'+dispatchSummary(id)+'</div><button type="button" data-dispatch-export'+(record?'':' disabled')+'>Download this sampling entry</button></details>';
  }
  function dryBasisPanel(id){
    const rule=lab?.dryBasis.get(id);
    if(!rule)return '';
    const s=getState(id);
    const input=(key,label,numeric=false)=>'<label>'+esc(label)+'<input data-ws-field="'+key+'" '+(numeric?'inputmode="decimal" maxlength="10"':'maxlength="180"')+' value="'+esc(s[key])+'"></label>';
    const options=Object.entries(lab.basisLabels).map(([key,label])=>'<option value="'+key+'"'+(s.dryBasis===key?' selected':'')+'>'+esc(label)+'</option>').join('');
    const species=id===lab.dairy?'<label>Species on the powder report<select data-ws-field="drySpecies"><option value="">Select if known</option>'+[['cow','Cow'],['buffalo','Buffalo'],['mixed','Mixed cow and buffalo']].map(([value,label])=>'<option value="'+value+'"'+(value===s.drySpecies?' selected':'')+'>'+label+'</option>').join('')+'</select></label>':'';
    const disabled=id===lab.dairy&&s.compVariant!==rule.form;
    return '<details class="ws-section" data-dry-panel><summary>'+esc(rule.parameter)+' · dry-basis check</summary><p>Use readings from the same finished powder sample. Enter percentages by mass. Record a dry-basis result directly, or enter an as-supplied result and its measured moisture.</p>'+
      '<fieldset data-dry-fields'+(disabled?' disabled':'')+'><legend>Powder report</legend>'+input('dryLot','Powder sample or lot')+species+input('dryReport','Laboratory report reference')+
      '<label>Basis stated on report<select data-ws-field="dryBasis"><option value="">Select reporting basis</option>'+options+'</select></label>'+
      input('dryValue','Reported '+rule.parameter.replace(' on dry basis','').toLowerCase()+' (% by mass)',true)+input('dryMoisture','Moisture of the same powder as supplied (%)',true)+
      '</fieldset><p role="status" data-dry-result>'+esc(lab.basisResult(id,s))+'</p>'+href(rule.url,'FSSAI composition table')+'</details>';
  }
  function beanPanel(id){
    if(id!==lab?.bean)return '';
    const state=getState(id);
    const input=(key,label)=>'<label>'+esc(label)+'<input data-ws-field="'+key+'" '+(key==='beanSample'?'maxlength="180"':'inputmode="numeric" maxlength="9"')+' value="'+esc(state[key])+'"></label>';
    const rows=lab.countResults(state).map(r=>[input(r.key,r.parameter),esc(r.max)+'%', '<output data-count-for="'+r.key+'">'+esc([r.percent?r.percent+'%':'',r.status].filter(Boolean).join(' · '))+'</output>']);
    return '<details class="ws-section" data-bean-counts><summary>Cocoa bean defect counts</summary><p>Enter counts for the same examined sample. For germinated and flat beans, count an affected bean once in the combined class. Each comparison uses the original counts.</p>'+
      '<p>'+esc(lab.beanSampling.note)+' '+href(lab.beanSampling.guide,'Cacao of Excellence sampling guide, section 1')+' '+href(lab.beanSampling.standard,'ISO 2292 sampling scope')+'</p>'+
      input('beanSample','Sample or report reference')+input('beanTotal','Total whole beans examined')+table(['Defect and observed count','Maximum by count','Result'],rows)+
      href(plan.ingredients.get(id).source.split(' | ')[0],'FSSAI 2.3.54')+' <button type="button" data-bean-export>Download sample counts and results</button></details>';
  }
  function markup(id) {
    if (!valid || !ids.has(id))return '<p class="notice">The catalogue worksheet data could not be validated.</p>';
    return '<details class="catalogue-worksheet" data-ws-id="'+esc(id)+'"><summary>Open product worksheet</summary><div class="ws-body"></div></details>';
  }
  function attach(pane,id) {
    const node=pane.querySelector('[data-ws-id]');
    if(!valid || !node || node.dataset.wsId!==id)return;
    function refreshPlan(){
      const testing=node.querySelector('[data-testing-plan]');
      if(testing?.open)showPlan(testing,id);
    }
    node.addEventListener('pmsv-residue-results',refreshPlan);
    node.addEventListener('toggle',()=>{
      const body=node.querySelector('.ws-body');
      if(!node.open || body.hasChildNodes())return;
      const p=E.products[id];
      body.innerHTML=beanPanel(id)+(sulphites.profiles.has(id)?'<section class="panel compact" data-sulphite-panel>'+sulphitePanel(id)+'</section>':'')+ingredientRoutes(id)+(coffee.profiles.has(id)?'<section class="panel compact" data-coffee-panel>'+coffeePanel(id)+'</section>':'')+(id===cocoaMix.productId?cocoaMix.markup(getState(id)):'')+(composition.profileFor(id)?'<section class="panel compact" data-variant-composition>'+variantTable(id)+'</section>':'')+dispatchPanel(id)+dryBasisPanel(id)+importPanel(id)+testingPlanSection(id)+productSections(id)+root.PMSVBroadContaminants.markup(id,getState(id))+root.PMSVMetalScope.markup(id,getState(id))+C.markup(id,getState(id))+V.markup(id,getState(id))+X.markup(id,getState(id))+contaminants(id)+addSection(id)+microSection(id,p)+horizontal(id)+monographs(p)+inputs(id);
      const testing=node.querySelector('[data-testing-plan]');
      testing.addEventListener('toggle',()=>{if(testing.open)showPlan(testing,id);});
      testing.querySelector('[data-plan-area]').addEventListener('change',()=>showPlan(testing,id));
      Q.attach(node,id,getState(id));
      O.attach(node,id,getState(id));
      S.attach(node,id,getState(id));
      T.attach(node,id,getState(id));
      L.attach(node,id,getState(id));
    });
    if([root.PMSVRecipeSamples.singhara,root.PMSVRecipeSamples.syrup].includes(id)){
      node.addEventListener('focusin',e=>{
        if(['crop_afLot','crop_cyanLot'].includes(e.target.dataset.wsField))e.target.dataset.originalLot=e.target.value;
      });
    }
    node.addEventListener('input',e=>{
      const el=e.target,k=el.matches('[data-plan-vet-date],[data-sampling-date]')?'vetDate':el.dataset.wsField;
      if(el.hasAttribute('data-plan-total-as'))node.querySelector('[data-plan-as-result]').textContent=plan.fishOilScreen(el.value);
      if(el.hasAttribute('data-ws-add'))node.querySelector('[data-ws-add-results]').innerHTML=addResults(id,el.value);
      if(el.hasAttribute('data-ws-category-add'))node.querySelector('[data-ws-category-results]').innerHTML=categoryResults(id,el.value);
      if(el.hasAttribute('data-ws-commodity') || el.hasAttribute('data-ws-chemical'))node.querySelector('[data-ws-matches]').innerHTML=commodityResults(node.querySelector('[data-ws-commodity]').value,node.querySelector('[data-ws-chemical]').value);
      if(el.hasAttribute('data-panel-search')||el.hasAttribute('data-panel-search-metal'))node.querySelector('[data-panel-found]').innerHTML=P.findRows(node.querySelector('[data-panel-search-metal]').value,node.querySelector('[data-panel-search]').value);
      if(el.hasAttribute('data-pest-search'))node.querySelector('[data-pest-found]').innerHTML=X.indexPage(el.value);
      if(el.hasAttribute('data-vet-index'))node.querySelector('[data-vet-found]').innerHTML=V.indexTable(el.value,getState(id).vetDate);
      if(!fields.includes(k))return;
      const state=getState(id), previous=state[k];
      state[k]=el.type==='checkbox'?(el.checked?'yes':''):el.value;
      if(['microForm','microFormRef','microPh','microPhRef'].includes(k)){
        const formChanged=k==='microForm'&&previous!==state[k];
        const recordChanged=k==='microFormRef'&&previous&&previous!==state[k];
        const resultChanged=k==='microPh'&&previous&&previous!==state[k];
        const clear=formChanged?['microFormRef','microPh','microPhRef']:recordChanged?['microPh','microPhRef']:resultChanged?['microPhRef']:[];
        for(const field of clear){
          state[field]='';
          const input=node.querySelector('[data-ws-field="'+field+'"]');if(input)input.value='';
        }
        const ph=node.querySelector('[data-micro-ph]');
        if(ph)ph.hidden=ph.disabled=ph.dataset.microPh!==state.microForm;
        node.querySelector('[data-micro-form-results]').innerHTML=microDecisionTable(id,state);
        refreshPlan();
      }
      if(importDocs?.routes.has(id)&&importDocs.fields.includes(k)){
        const scopeChanged=k==='importScope'&&previous!==state[k];
        const identityChanged=['importLot','importCountry'].includes(k)&&previous.trim()&&previous!==state[k];
        if(scopeChanged||identityChanged){
          const clear=scopeChanged?['importLot','importCountry',...importDocs.docFields]:importDocs.docFields;
          for(const field of clear){
            state[field]='';
            const input=node.querySelector('[data-ws-field="'+field+'"]');if(input)input.value='';
          }
        }
        node.querySelector('[data-import-inputs]').disabled=state.importScope!=='imported';
        node.querySelector('[data-import-status]').textContent=importStatus(id,state);
        refreshPlan();
      }
      if(lab?.dryBasis.has(id)&&(lab.basisFields.includes(k)||k==='compVariant'||k==='drySpecies')){
        let clear=[];
        if((previous||k==='compVariant')&&previous!==state[k]){
          if(k==='dryLot'||k==='compVariant')clear=[...lab.basisFields,...(id===lab.dairy?['drySpecies']:[])].filter(f=>f!==k);
          if(k==='drySpecies')clear=['dryValue','dryMoisture'];
          if(k==='dryReport')clear=['dryValue','dryMoisture','dryBasis'];
          if(k==='dryBasis')clear=['dryValue'];
        }
        for(const field of clear){
          state[field]='';
          node.querySelector('[data-ws-field="'+field+'"]').value='';
        }
        node.querySelector('[data-dry-fields]').disabled=id===lab.dairy&&state.compVariant!==lab.dryBasis.get(id).form;
        node.querySelector('[data-dry-result]').textContent=lab.basisResult(id,state);
        refreshPlan();
      }
      if(id===lab?.bean&&lab.beanFields.includes(k)){
        if(k==='beanSample'&&previous.trim()&&previous!==state[k]){
          for(const field of lab.beanFields.slice(1)){
            state[field]='';
            node.querySelector('[data-ws-field="'+field+'"]').value='';
          }
        }
        for(const r of lab.countResults(state)){
          node.querySelector('[data-count-for="'+r.key+'"]').textContent=[r.percent?r.percent+'%':'',r.status].filter(Boolean).join(' · ');
        }
      }
      if(sulphites.profiles.has(id)&&(sulphites.fields.includes(k)||k==='reference')){
        const panel=node.querySelector('[data-sulphite-panel]');
        if(k==='sulphiteForm'||(k==='reference'&&previous.trim()&&previous!==state[k])){
          state.sulphiteValue='';state.sulphiteReport='';state.sulphiteBasis='';
          panel.innerHTML=sulphitePanel(id);
          if(k==='sulphiteForm')panel.querySelector('select').focus();
        }else{
          if(k!=='sulphiteBasis'&&previous!==state[k]){
            state.sulphiteBasis='';
            const basis=panel.querySelector('[data-ws-field="sulphiteBasis"]');
            if(basis)basis.checked=false;
          }
          panel.querySelector('[data-sulphite-outcome]').textContent=sulphites.assessment(id,state);
        }
        refreshPlan();
      }
      if(k==='ingredientSubtype'&&id===plan.catechuId&&previous!==state[k]){
        for(const f of ['criterion','result','compReport','unitConfirmed'])state[f]='';
        node.querySelector('[data-ingredient-measure]').innerHTML=measurement(id);
        refreshPlan();
      }
      if(coffee.profiles.has(id)){
        const panel=node.querySelector('[data-coffee-panel]');
        if(k==='coffeeForm'&&previous!==state.coffeeForm){
          for(const field of ['criterion','result','compReport','unitConfirmed','coffeePct'])state[field]='';
          panel.innerHTML=coffeePanel(id);
          panel.querySelector('[data-ws-field="coffeeForm"]').focus();
          if(id==='coffee'&&state.pestRole!=='ingredient')X.update(node,id,k,state,previous);
        }
        if(id===coffee.blend&&k==='reference'&&previous.trim()&&previous!==state.reference){
          state.coffeePct='';
          const pct=panel.querySelector('[data-ws-field="coffeePct"]');
          if(pct)pct.value='';
          panel.querySelector('[data-coffee-label]').textContent=coffee.labelRow(state.vetDate,state).notes;
        }
        if(k==='coffeePct')panel.querySelector('[data-coffee-label]').textContent=coffee.labelRow(state.vetDate,state).notes;
        if(k==='vetDate')panel.innerHTML=coffeePanel(id);
        if(['coffeeForm','coffeePct','vetDate'].includes(k))refreshPlan();
      }
      if(formulation?.productRules.has(id)&&(k==='compVariant'||formulation.assayFields.includes(k))){
        const panel=node.querySelector('[data-formulation]');
        if(k==='compVariant'){
          panel.querySelector('[data-ws-add-results]').innerHTML=addResults(id,panel.querySelector('[data-ws-add]')?.value);
        }
        const assay=panel.querySelector('[data-form-assay]');
        if(assay){
          let clear=[];
          if(k==='compVariant'&&state[k]!==previous)clear=formulation.assayFields;
          if(['formLot','formReport','formIns','formBasis'].includes(k)&&previous&&previous!==state[k]){
            clear=k==='formLot'?['formReport','formValue','formFat','formSingle']:['formValue','formFat','formSingle'];
          }
          for(const field of clear){
            state[field]='';
            const input=assay.querySelector('[data-ws-field="'+field+'"]');
            if(input.type==='checkbox')input.checked=false;else input.value='';
          }
          assay.hidden=!formulation.assayApplies(id,state);
          assay.querySelector('[data-form-fat]').hidden=state.formBasis!=='powder';
          assay.querySelector('[data-form-result]').textContent=formulation.assay(id,state);
          refreshPlan();
        }
      }
      if(k==='compVariant' || k==='compSweetener'){
        if(k==='compVariant')state.compSweetener='';
        state.criterion='';state.result='';state.unitConfirmed='';state.compReport='';
        const panel=node.querySelector('[data-variant-composition]');
        panel.innerHTML=variantTable(id);
        panel.querySelector('[data-ws-field="'+k+'"]').focus();
      }
      if(reportRequired(id)&&['reference','compReport','result'].includes(k)&&previous!==state[k]){
        state.unitConfirmed='';const confirmation=node.querySelector('[data-ws-field="unitConfirmed"]');if(confirmation)confirmation.checked=false;
      }
      if(k==='criterion'){
        state.unitConfirmed='';state.result='';state.compReport='';
        node.querySelector('[data-ws-field="compReport"]').value='';
        node.querySelector('[data-ws-field="unitConfirmed"]').checked=false;
        const input=node.querySelector('[data-ws-field="result"]');
        input.value='';
        input.inputMode=enabledCriteria(id,state).find(row=>String(row.i)===state.criterion)?.v.spec.signed?'text':'decimal';
      }
      if(k==='broadForm'){state.broadRef='';node.querySelector('[data-ws-field="broadRef"]').value='';}
      if(k==='broadForm' || k==='broadRef'){
        node.querySelector('[data-broad-result]').textContent=root.PMSVBroadContaminants.resolution(id,state.broadForm,state.broadRef);
      }
      if(broad.reportFields.includes(k)||k==='broadForm'||k==='broadRef'){
        const changed=previous!==state[k];
        const replaceReport=changed&&((['melLot','melReport'].includes(k)&&previous.trim())||k==='broadForm');
        const clear=replaceReport?(k==='melLot'||k==='broadForm'?['melReport','melMethod','melReading','melUnit','melBasis']:['melMethod','melReading','melUnit','melBasis']):changed&&k!=='melBasis'?['melBasis']:[];
        for(const field of clear){
          state[field]='';
          const input=node.querySelector('[data-ws-field="'+field+'"]');
          if(input.type==='checkbox')input.checked=false;else input.value='';
        }
        const row=broad.melamineRow(id,state);
        node.querySelector('[data-melamine-assessment]').textContent=broad.reportAssessment(state,row.limit);
        refreshPlan();
      }
      if(k==='metalForm' || k==='metalPack' || k==='mercuryArticle'){
        state[k+'Ref']='';
        node.querySelector('[data-ws-field="'+k+'Ref"]').value='';
      }
      const metalField=P.fields.includes(k)||['metalForm','metalFormRef','metalPack','metalPackRef','mercuryArticle','mercuryArticleRef'].includes(k);
      if(metalField||(id===P.catechuId&&k==='ingredientSubtype'))P.update(node,id,k,state,previous);
      if(C.fields.includes(k)||(id===C.vendingId&&['waterPoint','waterSample'].includes(k)))C.update(node,id,k,state,['crop_afLot','crop_cyanLot'].includes(k)?(el.dataset.originalLot??previous):previous);
      if(V.fields.includes(k))V.update(node,id,k,state);
      if(k==='vetDate'||(plan.grainProduct(id)&&['result','criterion','compReport','unitConfirmed','reference'].includes(k))){
        const micro=node.querySelector('[data-micro-form-results]');
        if(micro)micro.innerHTML=microDecisionTable(id,state);
      }
      if(k==='vetDate'){
        C.update(node,id,k,state,previous);
        if(id===P.sajjiId||id===P.catechuId||id===P.carobId||plan.metalEdition(previous)!==plan.metalEdition(state.vetDate))P.update(node,id,k,state,previous);
        for(const input of node.querySelectorAll('[data-plan-vet-date],[data-sampling-date],[data-ws-field="vetDate"]'))input.value=state.vetDate;
      }
      if(k.startsWith('panelKhar')||(id===P.sajjiId&&k==='vetDate')||['metalForm','metalFormRef','mercuryArticle','mercuryArticleRef','panel_Hg','panel_HgRef','panelFpc','panelFpcRef'].includes(k)){
        const result=root.PMSVBroadContaminants.scope(id,state.broadForm,state.broadRef,state).h;
        node.querySelector('[data-hg-value]').textContent=result.article+(result.level?' · '+result.level:'');
        node.querySelector('[data-hg-basis]').textContent=result.why;
      }
      if(id===cocoaMix.productId&&cocoaMix.fields.includes(k)){
        if(['mixRecipe','mixScope'].includes(k)&&previous.trim()&&previous!==state[k]){
          for(const field of ['mixCocoa','mixButter','mixDryCocoa','mixPowderRef']){
            state[field]='';node.querySelector('[data-ws-field="'+field+'"]').value='';
          }
        }
        if(k==='mixPowderRef'&&previous.trim()&&previous!==state.mixPowderRef){
          state.mixButter='';node.querySelector('[data-ws-field="mixButter"]').value='';
        }
        cocoaMix.update(node,state);refreshPlan();
      }
      if(ayurveda.known(id)&&ayurveda.fields.includes(k)){ayurveda.update(node,id,k,state);if(['ayRecipe','ayVariant','ayIngredient','ayIngredientRef'].includes(k))C.update(node,id,k,state);refreshPlan();}
      if(id===water.productId&&water.fields.includes(k)){water.update(node,k,state,previous);refreshPlan();}
      if(metalField||C.fields.includes(k)||V.fields.includes(k)||['compVariant','compSweetener','criterion','result','unitConfirmed','compReport','reference'].includes(k))refreshPlan();
      if(X.fields.includes(k))X.update(node,id,k,state,previous);
      if(Y.fields.includes(k))Y.update(node,id,k,state,previous);
      if(sampling&&(['vetDate','coffeeForm','compVariant','dispatchRow'].includes(k)||sampling.lotFields.includes(k))){
        const identityChanged=previous!==state[k]&&(['vetDate','coffeeForm','compVariant','dispatchRow'].includes(k)||(['dispatchLot','dispatchPurpose'].includes(k)&&!!previous));
        if(identityChanged||k==='dispatchUnspecified'&&state[k]!=='yes'){
          const clear=['dispatchAmount','dispatchUnit','dispatchEvidence','dispatchRecordDate'];
          if(identityChanged)clear.push('dispatchUnspecified');
          if(k==='dispatchLot'&&previous)clear.push('dispatchRow');
          for(const key of clear){
            state[key]='';
            const field=node.querySelector('[data-ws-field="'+key+'"]');
            if(field){if(field.type==='checkbox')field.checked=false;else field.value='';}
          }
        }
        if(k==='dispatchUnspecified'&&state[k]==='yes')state.dispatchRecordDate=state.vetDate;
        const decision=sampling.decision(id,state.vetDate,state);
        node.querySelector('[data-dispatch-unlisted]').hidden=!decision||!!decision.key;
        node.querySelector('[data-dispatch-amount-fields]').disabled=state.dispatchUnspecified!=='yes';
        node.querySelector('[data-dispatch-evidence-label]').textContent=state.vetDate<'2027-04-01'?'Food Analyst name and consultation reference':'Applicable Food Authority guideline and clause';
        node.querySelector('[data-dispatch-result]').innerHTML=dispatchSummary(id);
        node.querySelector('[data-dispatch-export]').disabled=!plan.metalEdition(state.vetDate);
        refreshPlan();
      }
      if(k==='pack')node.querySelector('[data-ws-pack]').innerHTML=packRules(state.pack);
      const out=node.querySelector('[data-ws-outcome]');if(out)out.textContent=resultText(id);
      const feedback=node.querySelector('[data-ws-saved]');if(feedback)feedback.textContent='Unsaved changes';
    });
    node.addEventListener('click',e=>{
      if(e.target.closest('[data-sulphite-lot]')){node.querySelector('[data-ws-field="reference"]').focus();return;}
      if(Y.handle(node,id,getState(id),e.target)){refreshPlan();return;}
      const pageButton=e.target.closest('[data-pest-page]');
      if(pageButton){
        const result=node.querySelector('[data-pest-found]');
        result.innerHTML=X.indexPage(node.querySelector('[data-pest-search]').value,Number(pageButton.dataset.pestPage));
        (result.querySelector('button')||node.querySelector('[data-pest-search]')).focus();
        return;
      }
      const candidate=e.target.closest('[data-ws-candidate]');
      if(candidate){
        const index=candidate.dataset.wsCandidate;
        if(/^\d+$/.test(index)&&E.commodityRows[Number(index)]){
          getState(id).commodityKey=index;node.querySelector('[data-ws-recorded]').textContent=recordedCommodity(id);
          node.querySelector('[data-ws-saved]').textContent='Unsaved changes';
        }
        return;
      }
      if(!e.target.closest('[data-ws-save]'))return;
      const el=node.querySelector('[data-ws-saved]');
      try {root.localStorage.setItem('pmsv-fssai-worksheet-r93:'+id,JSON.stringify(getState(id)));el.textContent='Saved on this device.';}
      catch(_){el.textContent='Local saving is unavailable. Export the product review brief to keep your entries.';}
    });
  }
  function briefLines(id) {
    if(!valid || !ids.has(id))return [];
    const p=E.products[id],r=R.products[id],std=R.standards[p.standard],anchor=E.standards[p.standard],s=getState(id);
    const chosen=enabledCriteria(id).find(({i})=>String(i)===s.criterion);
    const artworkChecks=Q.savedByProduct();
    return ['','Catalogue worksheet · '+r.name,'Review scope: '+human(p.scope),'Source standard / route: '+(std?std.name+' · '+p.standard.split('#')[1]:r.routeFinding),
      'Primary source: '+(anchor?E.documents[anchor.doc].url+(anchor.p.length?'#page='+anchor.p[0]:''):E.documents[p.routeDocs[0]].url),
      'Appendix A category: '+(r.category||'Requires classification'),'Microbiological routes: '+(p.micro.map(([k,v])=>human(k)+' '+(v.note||v.reason||v.route||v.profile_key||'')).join(' | ')||'Inspect product and process against applicable tables'),
      ...((plan.microFormRoute(id)?s.microForm:plan.grainProduct(id))?plan.microFormRows(id,s.vetDate,s).slice(1).map(row=>{
        const sampling=['n','c','m','M'].flatMap((key,i)=>row[10+i]!==''?[key+' = '+row[10+i]]:[]).join(', ');
        return [row[4],row[5],row[6],row[7],sampling,row[8],row[9],row[14]].filter(Boolean).join(' · ');
      }):[]),
      ...(formulation?.assayApplies(id,s)&&s.formLot?[formulation.assay(id,s)]:[]),
      ...(sampling&&s.dispatchPurpose&&plan.metalEdition(s.vetDate)?[sampling.planEntry(id,s.vetDate,s).notes]:[]),
      ...(importDocs?.routes.has(id)&&s.importScope?importDocs.entries(id,s).map(r=>[r.form,r.parameter,r.status,r.notes,r.source].join(' · ')):[]),
      ...(lab?.dryBasis.has(id)&&lab.basisFields.some(field=>s[field])?lab.referenceEntries(id,s).filter(r=>r.status==='Dry-basis calculation').map(r=>r.notes):[]),
      ...(id===lab?.bean&&lab.beanFields.some(field=>s[field])?lab.countRows(s).map(row=>row.join(' | ')):[]),
      ...sulphites.rows(id,s).map(row=>[row.form,row.limit,row.unit,row.notes,row.source].filter(Boolean).join(' · ')),
      ...(plan.routeNotes.has(id)?[plan.routeSummary(id)]:[]),
      ...(plan.ingredients.has(id)?plan.ingredientRows(id,s.vetDate,s).slice(1).map(r=>[r[4],r[5],r[7],r[8],r[9],r[14]].filter(Boolean).join(' · ')):[]),
      ...(coffee.profiles.has(id)?plan.coffeeRows(id,s.vetDate,s).slice(1).map(r=>[r[4],r[5],r[7],r[8],r[9],r[14]].filter(Boolean).join(' · ')):[]),
      ...(powders.products.has(id)?plan.powderRows(id,s.vetDate,s).slice(1).map(r=>[r[5],r[7],r[8],r[9],r[14]].filter(Boolean).join(' · ')):[]),
      ...(ayurveda.known(id)?[ayurveda.brief(id,s)]:[]),
      ...(id===cocoaMix.productId&&cocoaMix.evidence(s)?[cocoaMix.evidence(s),...cocoaMix.sources]:[]),
      ...(V.firstSource(id)?[V.firstSource(id).text,...V.firstSource(id).urls]:[]),
      ...(id===V.eggPowderId?[V.eggNote,V.eggProteinNote,V.animalGazette+'#page=15',V.animalGazette+'#page=38']:[]),
      ...(C.firstSource(id,s.vetDate)?[C.firstSource(id,s.vetDate).text,...C.firstSource(id,s.vetDate).urls]:[]),
      ...(P.firstSource(id)?[P.firstSource(id).text,...P.firstSource(id).urls]:[]),
      ...(X.groupSource(id)?[X.groupSource(id).text,...X.groupSource(id).urls]:[]),'Product-specific contaminant evidence: '+(contaminantEvidence(id,s)),'Remaining action: '+(priority.get(id)?.sourceReviewNextAction||p.ctrAction),
      ...(p.routeAnchors||[]).map(([doc,pp,note])=>note+' · '+E.documents[doc].url+'#page='+pp[0]),
      ...(p.gazetteFindings||[]).map(z=>z.parameter+' · '+z.result+' '+z.scope+' '+E.documents[z.document].url+'#page='+z.pages[0]),
      'Original Gazette rows matching the catalogue name: '+(p.namedGazette||[]).length,'Product reference: '+(s.reference||'—'),'Variant or article: '+(s.article||'—'),'Primary pack: '+(s.pack?human(s.pack):'—'),
      ...composition.values(id,s,s.result?resultText(id):'').map((v,i)=>v?composition.columns[i]+': '+v:'').filter(Boolean),
      ...(chosen?['Measured criterion: '+chosen.v.spec.parameter+' · '+threshold(chosen.v.spec),'Measured result: '+s.result,...(s.compReport?.trim()?['Composition report: '+s.compReport.trim()]:[]),'Comparison: '+(resultText(id)||'Awaiting result')]:[]),...root.PMSVBroadContaminants.brief(id,s),...P.brief(id,s),...['metalForm','metalPack'].map(k=>root.PMSVMetalScope.documentedChoice(id,k,s)).filter(Boolean),...C.brief(id,s),...V.brief(id,s),...X.brief(id,s),...Y.brief(id,s),...Q.brief(id,s,artworkChecks),...O.brief(id,s,artworkChecks),...S.brief(id,s,artworkChecks),...T.brief(id,s,artworkChecks),...L.brief(id,s,artworkChecks),'Selected Gazette commodity: '+(recordedCommodity(id)||'—'),'Evidence and open actions: '+(s.note||'—')];
  }
  function currentSource(entry,date){return V?.firstSource(entry.id)?.status||C?.firstSource(entry.id,date)?.status||P?.firstSource(entry.id)?.status||X?.sourceStatus(entry)||entry.sourceStatus;}
  function registerRows(includeDeviceEntries=false,date=V.reviewDate) {
    if(!valid)return [];
    const artworkChecks=includeDeviceEntries?Q.savedByProduct():null;
    return [['Catalogue ID','Product','Route','Article / regulation','Source standard or route','Official identity source','PDF pages','Page evidence','Appendix A category','Microbiology route','Contaminant evidence','Exact named Gazette references','Monograph matches','Next evidence or legal check','Recheck 1 Dec 2026','All applicable provisions verified','Open cited PDF page','Chapter and monograph numerical agreements','Chapter and monograph numerical differences','SKU or formula reference','Process, commodity or variant','Evidence document reference','Adjudicated Gazette criterion',...root.PMSVBroadContaminants.columns(),...root.PMSVMetalScope.columns(),'Mercury source decision or missing evidence','Documented melamine decision','Documented mercury decision','Documented product form','Documented canning status','Metal decisions for the documented form or pack',...C.columns(),...P.columns(),...V.columns,...X.columns,...Y.columns,...Q.columns,...O.columns,...S.columns,...T.columns,...root.PMSVDateMarking.columns,...L.columns,...composition.columns,'Current first-source status','Conditional contaminant or residue source and evidence'], ...list.map(entry=>{
      const {id}=entry, group=V.firstSource(id)||C.firstSource(id,date)||P.firstSource(id)||X.groupSource(id);
      const p=E.products[id],r=R.products[id],std=R.standards[p.standard],a=E.standards[p.standard],route=p.routeAnchors?.[0];
      const s=includeDeviceEntries?getState(id):{};
      const M=root.PMSVMetalScope,B=root.PMSVBroadContaminants;
      const mel=B.scope(id,s.broadForm,s.broadRef,s),hg=id===P.sajjiId?(mel.h.key==='residual'?mel.h:null):M.documentedMercury(id,s);
      const documented=field=>M.documentedChoice(id,field,s);
      return [id,r.name,human(p.scope),p.standard.split('#')[1]||'',std?.name||r.routeFinding,a?E.documents[a.doc].url:E.documents[route?.[0]||p.routeDocs[0]].url,(a?.p||route?.[1]||[]).join(', '),a?.basis||route?.[2]||'Regulatory category or licensing route',r.category,p.micro.map(([k,v])=>[k,v.note||v.reason||v.route||v.profile_key].filter(Boolean).join(' · ')).join(' | '),[contaminantEvidence(id,s,date),ayurveda.brief(id,s)].filter(Boolean).join(' | '),(p.namedGazette||[]).length,p.monographs.length,[...sulphites.rows(id,s).map(row=>[row.form,row.limit,row.unit,row.notes,row.source].filter(Boolean).join(' · ')),plan.incomingSamples.scope.get(id)?.[1],plan.routeSummary(id),priority.get(id)?.sourceReviewNextAction||p.ctrAction,composition.sampleProfiles.get(id)?.note,plan.ingredients.get(id)?.note,plan.ingredients.get(id)?.source,powders.products.get(id)?.note,powders.products.get(id)?.gazette,coffee.profiles.has(id)?plan.coffeeRows(id,s.vetDate,s).slice(1).map(row=>[row[4],row[5],row[7],row[8],row[9],row[14]].filter(Boolean).join(' · ')).join(' | '):''].filter(Boolean).join(' | '),p.future,'No', (a?E.documents[a.doc].url:E.documents[route?.[0]||p.routeDocs[0]].url).split('#')[0]+'#page='+(a?.p?.[0]||route?.[1]?.[0]||1),(p.qualityCrosschecks||[]).filter(([,z])=>z[5]==='same numerical value').length,(p.qualityCrosschecks||[]).filter(([,z])=>z[5]==='different numerical values').length,s.reference||'',s.article||'',s.note||'',(p.gazetteFindings||[]).map(z=>z.parameter+' '+z.result+' '+z.scope+' '+E.documents[z.document].url+'#page='+z.pages[0]).join(' | '),...root.PMSVBroadContaminants.values(id),...M.values(id),
        id===P.sajjiId?mel.h.why:M.mercuryGuide(id)?.reason||B.scope(id).h.why,
        mel.m.options.length && mel.applied ? B.resolution(id,s.broadForm,s.broadRef)+' · '+s.broadRef:'',
        hg?hg.article+' · '+hg.level+' · '+hg.why:'',documented('metalForm'),documented('metalPack'),
        (documented('metalForm')||documented('metalPack'))?M.brief(id,s).join(' | '):'',...C.values(id,s),...P.values(id,s),...V.values(id,s),...X.values(id,s),...Y.values(id,s,includeDeviceEntries),...Q.values(id,s,artworkChecks),...O.values(id,s,artworkChecks),...S.values(id,s,artworkChecks),...T.values(id,s,artworkChecks),...S.dateValues(id,s,artworkChecks),...L.values(id,s,artworkChecks),...(id===cocoaMix.productId?cocoaMix.registerValues(s):composition.values(id,s,s.result?resultText(id):'')),currentSource(entry,date),group?[group.text,...group.urls].join(' | '):''];
    })];
  }
  function sourceSummaryRows(date=V.reviewDate){
    const headers=['Catalogue ID','Product','Assessment date','Article or classification','Identity source','Contaminant-source status','Basis for this status','Source review finding','Conditional match source(s)','Remaining evidence'];
    if(!valid||!plan.metalEdition(date))return [headers];
    return [headers,...list.map(entry=>{
      const {id}=entry,e=E.products[id],status=currentSource(entry,date);
      const anchor=E.standards[e.standard],route=e.routeAnchors?.[0];
      const doc=anchor?.doc||route?.[0]||e.routeDocs[0],page=anchor?.p?.[0]||route?.[1]?.[0];
      const identity=E.documents[doc].url+(page?'#page='+page:'');
      const group=V.firstSource(id)||C.firstSource(id,date)||P.firstSource(id)||X.groupSource(id);
      const pending=status==='FIRST_EXACT_SOURCE_PENDING';
      const basis=pending?'First finished-product source pending':group?'Conditional source review':'Partial match carried in the catalogue';
      const detail=group?.text||(pending?lab?.profiles.get(id)?.boundary:'')||priority.get(id)?.sourceReviewResult||entry.finding;
      const action=pending?plan.incomingSamples.scope.get(id)?.[1]:priority.get(id)?.sourceReviewNextAction;
      return [id,entry.product,date,entry.fssr||entry.fcs||human(e.scope),identity,status,basis,detail,group?.urls.join(' | ')||'',action||e.ctrAction];
    })];
  }
  function pendingSourceRows(date=root.PMSVVeterinary.reviewDate){
    const header=['Catalogue ID','Product','Product standard or classification','First-source status','Historical catalogue finding','Potential error when applying a limit','Next evidence to obtain','Official product identity source','Named standard or regulatory route','Sample or classification issue','Evidence to obtain for the finished-product decision'];
    return [header,...list.filter(p=>currentSource(p,date)==='FIRST_EXACT_SOURCE_PENDING').map(p=>{
      const e=E.products[p.id],a=E.standards[e.standard],doc=a?.doc||e.routeAnchors?.[0]?.[0]||e.routeDocs[0];
      const page=a?.p?.[0]||e.routeAnchors?.[0]?.[1]?.[0];
      const link=E.documents[doc].url+(page?'#page='+page:'');
      return [p.id,p.product,p.fssr||e.standard||p.fcs||'Confirm regulatory classification',currentSource(p,date),p.finding,p.nonTransfer,
        [plan.routeSummary(p.id),root.PMSVRecipeSamples?.profiles[p.id]?.text||(p.id===V.eggPowderId?V.eggNote:p.id===P.syrupId?P.syrupRule:p.id===P.trehaloseId?P.trehaloseNote:p.sourceCheck?.nextEvidence||p.nextAction||e.ctrAction),composition.sampleProfiles.get(p.id)?.note,plan.ingredients.get(p.id)?.note,p.id===coffee.blend?coffee.blendNote():'',powders.products.get(p.id)?.note,p.id===powders.singhara?'Resolve the protein wording and uric acid comparison in the product standard.':'',ayurveda.known(p.id)?'A separate finished-food Schedule D plan is available. '+ayurveda.brief(p.id):''].filter(Boolean).join(' '),composition.sampleProfiles.get(p.id)?.sources.join(' | ')||plan.ingredients.get(p.id)?.source||powders.products.get(p.id)?.gazette||(p.id===P.syrupId?P.syrupIdentity:p.id===P.trehaloseId?E.documents['food-13'].url+'#page=39':link),R.standards[e.standard]?.name||R.products[p.id].routeFinding,...(plan.incomingSamples.scope.get(p.id)||['',''])];
    })];
  }
  const stats=valid?{total:ids.size,direct:[...ids].filter(id=>E.products[id].scope==='product_standard').length,
    partial:[...ids].filter(id=>E.products[id].directCTR).length,portal:[...ids].filter(id=>E.products[id].monographs.length).length}:null;
  root.PMSVCatalogueWorksheets=Object.freeze({available:!!valid,stats,markup,attach,microFormRows:id=>plan.microFormRows(id,getState(id).vetDate,getState(id)),formulationRows:id=>formulation.exportRows(id,getState(id)),dispatchRows:id=>root.PMSVSamplingQuantities.exportRows(id,getState(id).vetDate,getState(id)),melamineRows:(id,date)=>broad.reportRows(id,date,id?getState(id):{}),beanCountRows:()=>lab.countRows(getState(lab.bean)),briefLines,registerRows,sourceSummaryRows,pendingSourceRows,currentSource,sulphiteRows:id=>plan.sulphiteRows(id,getState(id)),ingredientRouteRows:id=>plan.ingredientRouteRows(id,getState(id).vetDate,getState(id)),veterinaryDate:id=>getState(id).vetDate,productPlan:id=>plan.exportRows(id,getState(id).vetDate,false,getState(id)),sampleReviewRows:id=>plan.sampleReviewRows(id,getState(id).vetDate,getState(id)),ingredientRows:id=>plan.ingredientRows(id,getState(id).vetDate,getState(id)),coffeeRows:id=>plan.coffeeRows(id,getState(id).vetDate,getState(id)),powderRows:id=>plan.powderRows(id,getState(id).vetDate,getState(id)),sugarRows:id=>plan.sugarRows(id,getState(id).vetDate,getState(id)),compare,resultText,enabledCriteria,hasFocusedCalculator:id=>focused.has(id)});
})(globalThis);
