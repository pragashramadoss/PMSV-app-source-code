/* Product worksheets. Numeric comparisons apply only to the selected source-edition row. */
(function (root) {
  'use strict';
  const E = root.PMSVCatalogueEvidence, R = root.PMSVCatalogueRules;
  const registry = root.PMSV_REVIEW_REGISTER, C = root.PMSVCropScope, P = root.PMSVMetalPanel, V = root.PMSVVeterinary, X = root.PMSVPesticides, Y = root.PMSVResiduePanel, Q = root.PMSVIngredientPercentage, O = root.PMSVIngredientOrder, S = root.PMSVSmallPack, T = root.PMSVBatchSite, L = root.PMSVLotDates;
  const composition = root.PMSVVariantComposition, plan = root.PMSVTestingPlan, water = root.PMSVVendingWater, cocoaMix = root.PMSVCocoaMixtures;
  const list = root.PMSV_CATALOGUE || [];
  const ids = new Set(list.map(p => p.id));
  const valid = E?.date === '2026-11-20' && R && registry?.latestRound === 125 && registry.dextrinReview?.productId === P?.dextrinId && registry.cocoaMixReview?.namingRows === 11 && cocoaMix && registry.lactoseReview?.comparisons === 6 && registry.vendingPlanReview?.entries === 74 && water && registry.groupPesticideReview?.comparisons === 9 && registry.firstSourceReview?.withRoute === 503 && registry.metalReportingReview?.products === 533 && registry.multiMetalReview?.products === 533 && registry.toxinLabReview?.products === 533 && registry.measuredPlanReview?.products === 533 && registry.worksheetPlanEvidenceReview?.products === 533 && registry.contaminantEditionReview?.products === 533 && registry.veterinaryEditionReview?.seafoodProducts === 24 && registry.residueTestingPlanReview?.products === 533 && plan?.available && registry.testingPlanReview?.products === 533 && composition?.profiles.size === registry.variantCompositionReview?.products && registry.shelfLifeReview?.products===533 && L && registry.lotDateReview?.products===533 && registry.dateMarkingReview?.products===533 && T && registry.batchSiteReview?.products===533 && S && registry.smallPackReview?.products===533 && O && registry.ingredientOrderReview?.products===533 && Q?.requestColumns?.length===3 && registry.recipeRequestReview?.products===533 && registry.ingredientPercentageReview?.products===533 && registry.ethyleneOxideReview?.products===533 && Y && registry.spicePanelReview?.marketedProducts===36 && X && registry.pesticideReview?.gazetteRows===1098 && V && registry.veterinaryReview?.toleranceRows===358 && P?.fields?.length && registry.metalPanelReview?.rows===382 && C?.fields?.length && registry.cropArticleReview?.sourceRows===45 && root.PMSVMetalScope && root.PMSVBroadContaminants && registry.records?.length === 137 &&
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
  const fields = ['compVariant','compSweetener','lotDateDraft','batchSiteDraft','smallPackDraft','orderDraft','quidDraft','reference','article','note','criterion','result','unitConfirmed','compReport','pack','commodityKey','broadForm','broadRef','metalForm','metalFormRef','metalPack','metalPackRef','mercuryArticle','mercuryArticleRef',...(C?.fields||[]),...(P?.fields||[]),...(V?.fields||[]),...(X?.fields||[]),...(Y?.fields||[]),...(water?.fields||[]),...(cocoaMix?.fields||[])];
  const portal = 'https://foodocopoeia.fssai.gov.in/home.aspx';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const human = name => String(name || '').replace(/_/g,' ').replace(/^./, c => c.toUpperCase());
  const href = (url,label) => (/^https:\/\/(?:[a-z0-9-]+\.)*fssai\.gov\.in\//i.test(url || '') || water?.isSource(url)) ?
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
      const l=decimals(text,s.min),h=decimals(text,s.max);
      return l===null || h===null ? null : l>=0 && h<=0;
    }
    const c=decimals(text,s.value);
    if (c===null) return null;
    switch (s.operator) {
      case '<':return c<0; case '<=':return c<=0;case '>':return c>0;case '>=':return c>=0;case '=':return c===0;default:return null;
    }
  }
  function enabledCriteria(id,state) {
    const p=E.products[id];
    if (!p) return [];
    if (id.startsWith('102-')) return [];
    if (composition.profiles.has(id)) return composition.enabled(id,state||getState(id));
    const s=R.standards[p.standard];
    if (focused.has(id) || p.scope!=='product_standard' || !s) return [];
    const differences=new Set((p.qualityCrosschecks||[]).filter(([,row])=>row[5]==='different numerical values').map(([,row])=>row[0]));
    return s.criteria.map((v,i)=>({v,i})).filter(({v})=>v.compare && !differences.has(v.spec.parameter) && !String(v.spec.unit).includes('°Bé') &&
      [v.spec.value ?? v.spec.min,v.spec.max ?? v.spec.value].every(b=>decimals(b,b)===0));
  }
  function resultText(id,s=getState(id)) {
    const row=enabledCriteria(id,s).find(({i})=>String(i)===s.criterion);
    if (!row || !s.result?.trim()) return '';
    if (s.unitConfirmed!=='yes') return 'Confirm the product variant, unit and analytical basis before comparing.';
    const outcome=compare(row.v.spec,s.result.trim());
    if (outcome===null) return 'Enter a non-negative decimal result in the cited unit. Qualifiers such as <LOQ require manual review.';
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
      else if (focused.has(id)) body+='<p>Use the product-specific calculator in this product view for the current worked limits and pack conditions.</p>';
      else {
        const srows=std.criteria.map(({spec:s,compare:auto})=>[esc(s.parameter),esc(threshold(s)),esc([s.analytical_basis,conditions(s)].filter(Boolean).join(' · ') || 'See cited article'),esc(auto?'Source-edition row':'Inspect article and variant')]);
        if (srows.length) body+=section('Composition and quality criteria ('+srows.length+')',table(['Parameter','Cited criterion','Basis and conditions','Review'],srows));
        if (Object.keys(std.sections).length) body+=section('Identity, process and variant provisions',Object.entries(std.sections).map(([k,v])=>{
          const scoped=['variants','composition_by_form'].includes(k) && Array.isArray(v)
            ?v.filter(item=>typeof item!=='object'||!item||plan.relevantForm(key,r.name,item.variant||item.name||r.name)):v;
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
  function addResults(id,filter) {
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
    const r=R.products[id],alias=R.aliases[r.category];
    return section('Food additives and processing aids','<p>Appendix A category '+esc(r.category||'requires product-specific review')+'. Match the intended additive, food and function. Check the most specific entry, group total, notes and any stricter product rule. Annexure II categories for FPC 18 depend on the recipe.</p>'+
      (alias?'<p>'+esc(alias.reason)+'</p>':'')+'<label>Find an additive by name or INS<input type="search" data-ws-add placeholder="e.g. sorbate or 202"></label><div data-ws-add-results>'+addResults(id,'')+'</div>'+documentLink('chapter-19')+' '+documentLink('chapter-21',null,'Appendix C · processing aids'));
  }
  function testingPlanSection(id) {
    const isVending=id===water.productId;
    const areas=isVending?[water.area,...plan.areas]:plan.areas;
    return '<details class="ws-section" data-testing-plan><summary>Testing plan and source decisions</summary><div>'+
      '<p>The selected date applies to metals, toxins and veterinary residues. The cocoa mix naming table was reviewed on 23 November. Other composition and microbiology entries use the 22 November review. The conditional pesticide entries for four product forms were reviewed on 23 November 2026. The product plan includes measured composition, metal and toxin results entered in the worksheet, documented sample decisions, saved pesticide reports and the veterinary assessment.</p><label>Review area<select data-plan-area>'+areas.map(a=>'<option>'+esc(a)+'</option>').join('')+'</select></label>'+
      '<label data-plan-vet-date-label hidden>Assessment date for metals, toxins and veterinary residues<input type="date" data-plan-vet-date value="'+esc(getState(id).vetDate)+'"></label>'+
      (isVending?water.markup(getState(id)):'')+
      '<div data-plan-fish-screen hidden><label>Quick screen for total arsenic in fish oil (mg/kg)<input type="text" placeholder="e.g. &lt;0.1" maxlength="80" data-plan-total-as></label><p data-plan-as-result role="status"></p><p>To include a laboratory report in the download, enter it under Check a reported metal result.</p></div>'+
      '<button type="button" data-plan-export>Download this product’s testing plan</button><div data-plan-results></div></div></details>';
  }
  function showPlan(node,id) {
    const area=node.querySelector('[data-plan-area]').value;
    const state=getState(id);
    const waterControls=node.querySelector('[data-water-controls]');
    if(waterControls)waterControls.hidden=area!==water.area;
    node.querySelector('[data-plan-vet-date-label]').hidden=![plan.areas[2],plan.areas[3],plan.areas[5]].includes(area);
    const screen=node.querySelector('[data-plan-fish-screen]');
    screen.hidden=area!==plan.areas[2]||id!=='02-02-1-fish-oil'||V.edition(state.vetDate)!=='amended';
    if(!screen.hidden)screen.querySelector('[data-plan-as-result]').textContent=plan.fishOilScreen(screen.querySelector('input').value);
    const rows=plan.entries(id,state.vetDate,state).filter(r=>r.area===area);
    const cells=rows.map(r=>{
      const sampling=[['n',r.n],['c',r.c],['m',r.m],['M',r.M]].filter(([,v])=>v!=null).map(([k,v])=>k+' = '+v).join(', ');
      const urls=(r.source||'').split(' | ').filter(Boolean);
      return [esc(r.parameter),esc([r.form,r.status].filter(Boolean).join(' · ')),esc([r.limit,r.unit,sampling].filter(Boolean).join(' · ')),esc(r.notes),
        esc(r.article)+' '+urls.map(u=>href(u,r.area===water.area?water.sourceLabel(u):u.includes('#page=')?'p. '+u.split('#page=')[1]:'Source')||esc(u)).join(' ')];
    });
    node.querySelector('[data-plan-results]').innerHTML=table(['Parameter or decision','Form and applicability','Criterion or sampling plan','Basis or next action','Source'],cells);
  }
  function microSection(p) {
    const sections=[];
    function profile(key,route) {
      const m=R.micro[key];if(!m)return '';
      return section(m.name,'<p>Appendix B · '+esc(human(m.group))+' · '+esc(display(m.pages))+'</p>'+entries(plan.microCriteria(m,route)));
    }
    for (const [type,info] of p.micro) {
      sections.push('<p><b>'+esc(human(type))+'</b> · '+esc(info.note||info.reason||info.route||human(info.status))+'</p>');
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
  function contaminantEvidence(id,state={}) {
    if(id===water.productId)return ['FSSR 2.10.9 incorporates IS 10500 for water offered or sold through a vending machine. The testing plan includes 74 source entries. The named CTR article remains open.',water.readingNote(state)].filter(Boolean).join(' ');
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
    let calc='';
    if(rows.length)calc='<label>Source-edition criterion<select data-ws-field="criterion"><option value="">Select a criterion</option>'+rows.map(({v,i})=>'<option value="'+i+'"'+(String(i)===s.criterion?' selected':'')+'>'+esc(v.spec.parameter+' · '+threshold(v.spec)+' · '+(v.spec.analytical_basis||''))+'</option>').join('')+'</select></label><label>Measured result in the cited unit<input inputmode="decimal" data-ws-field="result" value="'+esc(s.result)+'"></label><label>Composition report reference (optional)<input maxlength="180" data-ws-field="compReport" value="'+esc(s.compReport)+'"></label><label class="ws-check"><input type="checkbox" data-ws-field="unitConfirmed"'+(s.unitConfirmed==='yes'?' checked':'')+'> Product variant, analytical basis and unit match the selected criterion</label><p data-ws-outcome role="status">'+esc(resultText(id))+'</p>';
    return calc;
  }
  function variantTable(id) {
    const profile = composition.profiles.get(id);
    if (!profile) return '';
    const state = getState(id), form = composition.selected(id,state);
    const option = (key,label,current) => '<option value="'+esc(key)+'"'+(key===current?' selected':'')+'>'+esc(label)+'</option>';
    const variant = '<label>Product variant<select data-ws-field="compVariant"><option value="">Select the declared variant</option>'+
      profile.forms.map(f=>option(f.name,f.name,state.compVariant)).join('')+'</select></label>';
    const sweetener = profile.kind==='gum' && form ? '<label>Sweeteners in this formulation<select data-ws-field="compSweetener"><option value="">Not confirmed</option>'+
      Object.entries(composition.sweeteners).map(([k,v])=>option(k,v,state.compSweetener)).join('')+'</select></label>' : '';
    const rows = (form?.rows || []).map(row => [esc(row.parameter),esc(composition.limit(row)),esc(composition.applicability(row,state.compSweetener)||'Applies')]);
    return '<h4>Compare a lab result with the product standard</h4><p>FSSAI '+esc(profile.article)+' · '+
      profile.pages.map(n=>href(profile.source+'#page='+n,'PDF p. '+n)).join(' ')+'</p>'+variant+sweetener+
      '<p>'+esc(composition.note(profile.kind))+'</p>'+table(['Parameter','Limit and reporting basis','Applicability'],rows)+measurement(id);
  }
  function inputs(id) {
    const s=getState(id), calc=composition.profiles.has(id)?'':measurement(id);
    return '<div class="ws-inputs"><h5>My product review</h5><label>SKU, recipe or sample reference<input maxlength="180" data-ws-field="reference" value="'+esc(s.reference)+'"></label><label>Declared variant, process or article<input maxlength="320" data-ws-field="article" value="'+esc(s.article)+'"></label>'+calc+'<label>Evidence and open actions<textarea maxlength="5000" data-ws-field="note">'+esc(s.note)+'</textarea></label><button type="button" data-ws-save>Save worksheet on this device</button> <span data-ws-saved role="status"></span></div>';
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
      body.innerHTML=(id===cocoaMix.productId?cocoaMix.markup(getState(id)):'')+(composition.profiles.has(id)?'<section class="panel compact" data-variant-composition>'+variantTable(id)+'</section>':'')+testingPlanSection(id)+productSections(id)+root.PMSVBroadContaminants.markup(id,getState(id))+root.PMSVMetalScope.markup(id,getState(id))+C.markup(id,getState(id))+V.markup(id,getState(id))+X.markup(id,getState(id))+contaminants(id)+addSection(id)+microSection(p)+horizontal(id)+monographs(p)+inputs(id);
      const testing=node.querySelector('[data-testing-plan]');
      testing.addEventListener('toggle',()=>{if(testing.open)showPlan(testing,id);});
      testing.querySelector('[data-plan-area]').addEventListener('change',()=>showPlan(testing,id));
      Q.attach(node,id,getState(id));
      O.attach(node,id,getState(id));
      S.attach(node,id,getState(id));
      T.attach(node,id,getState(id));
      L.attach(node,id,getState(id));
    });
    node.addEventListener('input',e=>{
      const el=e.target,k=el.hasAttribute('data-plan-vet-date')?'vetDate':el.dataset.wsField;
      if(el.hasAttribute('data-plan-total-as'))node.querySelector('[data-plan-as-result]').textContent=plan.fishOilScreen(el.value);
      if(el.hasAttribute('data-ws-add'))node.querySelector('[data-ws-add-results]').innerHTML=addResults(id,el.value);
      if(el.hasAttribute('data-ws-commodity') || el.hasAttribute('data-ws-chemical'))node.querySelector('[data-ws-matches]').innerHTML=commodityResults(node.querySelector('[data-ws-commodity]').value,node.querySelector('[data-ws-chemical]').value);
      if(el.hasAttribute('data-panel-search')||el.hasAttribute('data-panel-search-metal'))node.querySelector('[data-panel-found]').innerHTML=P.findRows(node.querySelector('[data-panel-search-metal]').value,node.querySelector('[data-panel-search]').value);
      if(el.hasAttribute('data-pest-search'))node.querySelector('[data-pest-found]').innerHTML=X.indexPage(el.value);
      if(el.hasAttribute('data-vet-index'))node.querySelector('[data-vet-found]').innerHTML=V.indexTable(el.value,getState(id).vetDate);
      if(!fields.includes(k))return;
      const state=getState(id), previous=state[k];
      state[k]=el.type==='checkbox'?(el.checked?'yes':''):el.value;
      if(k==='compVariant' || k==='compSweetener'){
        if(k==='compVariant')state.compSweetener='';
        state.criterion='';state.result='';state.unitConfirmed='';state.compReport='';
        const panel=node.querySelector('[data-variant-composition]');
        panel.innerHTML=variantTable(id);
        panel.querySelector('[data-ws-field="'+k+'"]').focus();
      }
      if(k==='criterion'){state.unitConfirmed='';state.result='';state.compReport='';node.querySelector('[data-ws-field="compReport"]').value='';node.querySelector('[data-ws-field="unitConfirmed"]').checked=false;node.querySelector('[data-ws-field="result"]').value='';}
      if(k==='broadForm'){state.broadRef='';node.querySelector('[data-ws-field="broadRef"]').value='';}
      if(k==='broadForm' || k==='broadRef')node.querySelector('[data-broad-result]').textContent=root.PMSVBroadContaminants.resolution(id,state.broadForm,state.broadRef);
      if(k==='metalForm' || k==='metalPack' || k==='mercuryArticle'){
        state[k+'Ref']='';
        node.querySelector('[data-ws-field="'+k+'Ref"]').value='';
      }
      const metalField=P.fields.includes(k)||['metalForm','metalFormRef','metalPack','metalPackRef','mercuryArticle','mercuryArticleRef'].includes(k);
      if(metalField)P.update(node,id,k,state,previous);
      if(['metalForm','metalFormRef','mercuryArticle','mercuryArticleRef','panel_Hg','panel_HgRef','panelFpc','panelFpcRef'].includes(k)){
        const result=root.PMSVBroadContaminants.scope(id,state.broadForm,state.broadRef,state).h;
        node.querySelector('[data-hg-value]').textContent=result.article+(result.level?' · '+result.level:'');
        node.querySelector('[data-hg-basis]').textContent=result.why;
      }
      if(C.fields.includes(k))C.update(node,id,k,state);
      if(V.fields.includes(k))V.update(node,id,k,state);
      if(k==='vetDate'){
        C.update(node,id,k,state,previous);
        if(plan.metalEdition(previous)!==plan.metalEdition(state.vetDate))P.update(node,id,k,state);
        for(const input of node.querySelectorAll('[data-plan-vet-date],[data-ws-field="vetDate"]'))input.value=state.vetDate;
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
      if(id===water.productId&&water.fields.includes(k)){water.update(node,k,state,previous);refreshPlan();}
      if(metalField||C.fields.includes(k)||V.fields.includes(k)||['compVariant','compSweetener','criterion','result','unitConfirmed','compReport','reference'].includes(k))refreshPlan();
      if(X.fields.includes(k))X.update(node,id,k,state,previous);
      if(Y.fields.includes(k))Y.update(node,id,k,state,previous);
      if(k==='pack')node.querySelector('[data-ws-pack]').innerHTML=packRules(state.pack);
      const out=node.querySelector('[data-ws-outcome]');if(out)out.textContent=resultText(id);
      const feedback=node.querySelector('[data-ws-saved]');if(feedback)feedback.textContent='Unsaved changes';
    });
    node.addEventListener('click',e=>{
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
      ...(id===cocoaMix.productId&&cocoaMix.evidence(s)?[cocoaMix.evidence(s),...cocoaMix.sources]:[]),
      ...(P.firstSource(id)?[P.firstSource(id).text,...P.firstSource(id).urls]:[]),
      ...(X.groupSource(id)?[X.groupSource(id).text,...X.groupSource(id).urls]:[]),'Product-specific contaminant evidence: '+(contaminantEvidence(id,s)),'Remaining action: '+(priority.get(id)?.sourceReviewNextAction||p.ctrAction),
      ...(p.routeAnchors||[]).map(([doc,pp,note])=>note+' · '+E.documents[doc].url+'#page='+pp[0]),
      ...(p.gazetteFindings||[]).map(z=>z.parameter+' · '+z.result+' '+z.scope+' '+E.documents[z.document].url+'#page='+z.pages[0]),
      'Original Gazette rows matching the catalogue name: '+(p.namedGazette||[]).length,'Product reference: '+(s.reference||'—'),'Variant or article: '+(s.article||'—'),'Primary pack: '+(s.pack?human(s.pack):'—'),
      ...composition.values(id,s,s.result?resultText(id):'').map((v,i)=>v?composition.columns[i]+': '+v:'').filter(Boolean),
      ...(chosen?['Measured criterion: '+chosen.v.spec.parameter+' · '+threshold(chosen.v.spec),'Measured result: '+s.result,...(s.compReport?.trim()?['Composition report: '+s.compReport.trim()]:[]),'Comparison: '+(resultText(id)||'Awaiting result')]:[]),...root.PMSVBroadContaminants.brief(id,s),...P.brief(id,s),...['metalForm','metalPack'].map(k=>root.PMSVMetalScope.documentedChoice(id,k,s)).filter(Boolean),...C.brief(id,s),...V.brief(id,s),...X.brief(id,s),...Y.brief(id,s),...Q.brief(id,s,artworkChecks),...O.brief(id,s,artworkChecks),...S.brief(id,s,artworkChecks),...T.brief(id,s,artworkChecks),...L.brief(id,s,artworkChecks),'Selected Gazette commodity: '+(recordedCommodity(id)||'—'),'Evidence and open actions: '+(s.note||'—')];
  }
  function currentSource(entry){return P?.firstSource(entry.id)?.status||X?.sourceStatus(entry)||entry.sourceStatus;}
  function registerRows(includeDeviceEntries=false) {
    if(!valid)return [];
    const artworkChecks=includeDeviceEntries?Q.savedByProduct():null;
    return [['Catalogue ID','Product','Route','Article / regulation','Source standard or route','Official identity source','PDF pages','Page evidence','Appendix A category','Microbiology route','Contaminant evidence','Exact named Gazette references','Monograph matches','Next evidence or legal check','Recheck 1 Dec 2026','All applicable provisions verified','Open cited PDF page','Chapter and monograph numerical agreements','Chapter and monograph numerical differences','SKU or formula reference','Process, commodity or variant','Evidence document reference','Adjudicated Gazette criterion',...root.PMSVBroadContaminants.columns(),...root.PMSVMetalScope.columns(),'Mercury source decision or missing evidence','Documented melamine decision','Documented mercury decision','Documented product form','Documented canning status','Metal decisions for the documented form or pack',...C.columns(),...P.columns(),...V.columns,...X.columns,...Y.columns,...Q.columns,...O.columns,...S.columns,...T.columns,...root.PMSVDateMarking.columns,...L.columns,...composition.columns,'Current first-source status','Conditional pesticide or metal group source and evidence'], ...list.map(entry=>{
      const {id}=entry, group=P.firstSource(id)||X.groupSource(id);
      const p=E.products[id],r=R.products[id],std=R.standards[p.standard],a=E.standards[p.standard],route=p.routeAnchors?.[0];
      const s=includeDeviceEntries?getState(id):{};
      const M=root.PMSVMetalScope,B=root.PMSVBroadContaminants;
      const mel=B.scope(id,s.broadForm,s.broadRef,s),hg=M.documentedMercury(id,s);
      const documented=field=>M.documentedChoice(id,field,s);
      return [id,r.name,human(p.scope),p.standard.split('#')[1]||'',std?.name||r.routeFinding,a?E.documents[a.doc].url:E.documents[route?.[0]||p.routeDocs[0]].url,(a?.p||route?.[1]||[]).join(', '),a?.basis||route?.[2]||'Regulatory category or licensing route',r.category,p.micro.map(([k,v])=>[k,v.note||v.reason||v.route||v.profile_key].filter(Boolean).join(' · ')).join(' | '),contaminantEvidence(id,s),(p.namedGazette||[]).length,p.monographs.length,priority.get(id)?.sourceReviewNextAction||p.ctrAction,p.future,'No', (a?E.documents[a.doc].url:E.documents[route?.[0]||p.routeDocs[0]].url).split('#')[0]+'#page='+(a?.p?.[0]||route?.[1]?.[0]||1),(p.qualityCrosschecks||[]).filter(([,z])=>z[5]==='same numerical value').length,(p.qualityCrosschecks||[]).filter(([,z])=>z[5]==='different numerical values').length,s.reference||'',s.article||'',s.note||'',(p.gazetteFindings||[]).map(z=>z.parameter+' '+z.result+' '+z.scope+' '+E.documents[z.document].url+'#page='+z.pages[0]).join(' | '),...root.PMSVBroadContaminants.values(id),...M.values(id),
        M.mercuryGuide(id)?.reason||B.scope(id).h.why,
        mel.m.options.length && mel.applied ? B.resolution(id,s.broadForm,s.broadRef)+' · '+s.broadRef:'',
        hg?hg.article+' · '+hg.level+' · '+hg.why:'',documented('metalForm'),documented('metalPack'),
        (documented('metalForm')||documented('metalPack'))?M.brief(id,s).join(' | '):'',...C.values(id,s),...P.values(id,s),...V.values(id,s),...X.values(id,s),...Y.values(id,s,includeDeviceEntries),...Q.values(id,s,artworkChecks),...O.values(id,s,artworkChecks),...S.values(id,s,artworkChecks),...T.values(id,s,artworkChecks),...S.dateValues(id,s,artworkChecks),...L.values(id,s,artworkChecks),...(id===cocoaMix.productId?cocoaMix.registerValues(s):composition.values(id,s,s.result?resultText(id):'')),currentSource(entry),group?[group.text,...group.urls].join(' | '):''];
    })];
  }
  function pendingSourceRows(){
    const header=['Catalogue ID','Product','Product standard or classification','First-source status','Historical catalogue finding','Potential error when applying a limit','Next evidence to obtain','Official product identity source','Named standard or regulatory route'];
    return [header,...list.filter(p=>currentSource(p)==='FIRST_EXACT_SOURCE_PENDING').map(p=>{
      const e=E.products[p.id],a=E.standards[e.standard],doc=a?.doc||e.routeAnchors?.[0]?.[0]||e.routeDocs[0];
      const page=a?.p?.[0]||e.routeAnchors?.[0]?.[1]?.[0];
      const link=E.documents[doc].url+(page?'#page='+page:'');
      return [p.id,p.product,p.fssr||e.standard||p.fcs||'Confirm regulatory classification',currentSource(p),p.finding,p.nonTransfer,
        (p.id===P.syrupId?P.syrupRule:p.sourceCheck?.nextEvidence||p.nextAction||e.ctrAction),p.id===P.syrupId?P.syrupIdentity:link,R.standards[e.standard]?.name||R.products[p.id].routeFinding];
    })];
  }
  const stats=valid?{total:ids.size,direct:[...ids].filter(id=>E.products[id].scope==='product_standard').length,
    partial:[...ids].filter(id=>E.products[id].directCTR).length,portal:[...ids].filter(id=>E.products[id].monographs.length).length}:null;
  root.PMSVCatalogueWorksheets=Object.freeze({available:!!valid,stats,markup,attach,briefLines,registerRows,pendingSourceRows,currentSource,veterinaryDate:id=>getState(id).vetDate,productPlan:id=>plan.exportRows(id,getState(id).vetDate,false,getState(id)),compare,resultText,enabledCriteria,hasFocusedCalculator:id=>focused.has(id)});
})(globalThis);
