/* Product worksheets. Numeric comparisons apply only to the selected source-edition row. */
(function (root) {
  'use strict';
  const E = root.PMSVCatalogueEvidence, R = root.PMSVCatalogueRules;
  const registry = root.PMSV_REVIEW_REGISTER;
  const list = root.PMSV_CATALOGUE || [];
  const ids = new Set(list.map(p => p.id));
  const valid = E?.date === '2026-11-20' && R && registry?.latestRound === 95 && root.PMSVMetalScope && root.PMSVBroadContaminants && registry.records?.length === 137 &&
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
  const fields = ['reference','article','note','criterion','result','unitConfirmed','pack','commodityKey','broadForm','broadRef','metalForm','metalFormRef','metalPack','metalPackRef','mercuryArticle','mercuryArticleRef'];
  const portal = 'https://foodocopoeia.fssai.gov.in/home.aspx';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const human = name => String(name || '').replace(/_/g,' ').replace(/^./, c => c.toUpperCase());
  const href = (url,label) => /^https:\/\/(?:[a-z0-9-]+\.)*fssai\.gov\.in\//i.test(url || '') ?
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
  function enabledCriteria(id) {
    const p=E.products[id];
    if (!p) return [];
    const s=R.standards[p.standard];
    if (focused.has(id) || p.scope!=='product_standard' || !s) return [];
    const differences=new Set((p.qualityCrosschecks||[]).filter(([,row])=>row[5]==='different numerical values').map(([,row])=>row[0]));
    return s.criteria.map((v,i)=>({v,i})).filter(({v})=>v.compare && !differences.has(v.spec.parameter) && !String(v.spec.unit).includes('°Bé') &&
      [v.spec.value ?? v.spec.min,v.spec.max ?? v.spec.value].every(b=>decimals(b,b)===0));
  }
  function resultText(id) {
    const s=getState(id), row=enabledCriteria(id).find(({i})=>String(i)===s.criterion);
    if (!row || !s.result.trim()) return '';
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
      if (focused.has(id)) body+='<p>Use the product-specific calculator in this product view for the current worked limits and pack conditions.</p>';
      else {
        const srows=std.criteria.map(({spec:s,compare:auto})=>[esc(s.parameter),esc(threshold(s)),esc([s.analytical_basis,conditions(s)].filter(Boolean).join(' · ') || 'See cited article'),esc(auto?'Source-edition row':'Inspect article and variant')]);
        if (srows.length) body+=section('Composition and quality criteria ('+srows.length+')',table(['Parameter','Cited criterion','Basis and conditions','Review'],srows));
        if (Object.keys(std.sections).length) body+=section('Identity, process and variant provisions',Object.entries(std.sections).map(([k,v])=>'<h5>'+esc(human(k))+'</h5>'+entries(v)).join(''));
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
  function microSection(p) {
    const sections=[];
    function profile(key) {
      const m=R.micro[key];if(!m)return '';
      return section(m.name,'<p>Appendix B · '+esc(human(m.group))+' · '+esc(display(m.pages))+'</p>'+entries(m.criteria));
    }
    for (const [type,info] of p.micro) {
      sections.push('<p><b>'+esc(human(type))+'</b> · '+esc(info.note||info.reason||info.route||human(info.status))+'</p>');
      if(info.profile_key)sections.push(profile(info.profile_key));
      for(const opt of info.options||[])sections.push('<p>'+esc(opt.condition||opt.note||'Process or variant condition')+'</p>'+profile(opt.profile_key));
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
  function contaminants(id) {
    const p=E.products[id],r=R.products[id],caseRow=priority.get(id),named=p.namedGazette||[];
    let body='<p><b>'+esc(p.directCTR?'Existing product-specific partial evidence':'Exact finished-product contaminant decision open')+'</b></p>';
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
      section('Prepackaged label declarations',table(['Provision','Declaration'],R.label.map(([k,v])=>[esc(k),esc(v)]))+'<p>Cross-check pack size, retail or non-retail presentation, ingredients, allergens, product-specific declarations and applicable exemptions.</p>')+
      section('Claims review',ul(R.claims.map(c=>esc(c.clause+' · '+c.text))))+documentLink('baser16-1')+' '+documentLink('baser20-1')+' '+documentLink('baser15-1'));
  }
  function inputs(id) {
    const s=getState(id), rows=enabledCriteria(id);
    let calc='';
    if(rows.length)calc='<label>Source-edition criterion<select data-ws-field="criterion"><option value="">Select a criterion</option>'+rows.map(({v,i})=>'<option value="'+i+'"'+(String(i)===s.criterion?' selected':'')+'>'+esc(v.spec.parameter+' · '+threshold(v.spec)+' · '+(v.spec.analytical_basis||''))+'</option>').join('')+'</select></label><label>Measured result in the cited unit<input inputmode="decimal" data-ws-field="result" value="'+esc(s.result)+'"></label><label class="ws-check"><input type="checkbox" data-ws-field="unitConfirmed"'+(s.unitConfirmed==='yes'?' checked':'')+'> Product variant, analytical basis and unit match the selected criterion</label><p data-ws-outcome role="status">'+esc(resultText(id))+'</p>';
    return '<div class="ws-inputs"><h5>My product review</h5><label>SKU, recipe or sample reference<input maxlength="180" data-ws-field="reference" value="'+esc(s.reference)+'"></label><label>Declared variant, process or article<input maxlength="320" data-ws-field="article" value="'+esc(s.article)+'"></label>'+calc+'<label>Evidence and open actions<textarea maxlength="5000" data-ws-field="note">'+esc(s.note)+'</textarea></label><button type="button" data-ws-save>Save worksheet on this device</button> <span data-ws-saved role="status"></span></div>';
  }
  function markup(id) {
    if (!valid || !ids.has(id))return '<p class="notice">The catalogue worksheet data could not be validated.</p>';
    return '<details class="catalogue-worksheet" data-ws-id="'+esc(id)+'"><summary>Open product worksheet</summary><div class="ws-body"></div></details>';
  }
  function attach(pane,id) {
    const node=pane.querySelector('[data-ws-id]');
    if(!valid || !node || node.dataset.wsId!==id)return;
    node.addEventListener('toggle',()=>{
      const body=node.querySelector('.ws-body');
      if(!node.open || body.hasChildNodes())return;
      const p=E.products[id];
      body.innerHTML=productSections(id)+root.PMSVBroadContaminants.markup(id,getState(id))+root.PMSVMetalScope.markup(id,getState(id))+contaminants(id)+addSection(id)+microSection(p)+horizontal(id)+monographs(p)+inputs(id);
    });
    node.addEventListener('input',e=>{
      const el=e.target,k=el.dataset.wsField;
      if(el.hasAttribute('data-ws-add'))node.querySelector('[data-ws-add-results]').innerHTML=addResults(id,el.value);
      if(el.hasAttribute('data-ws-commodity') || el.hasAttribute('data-ws-chemical'))node.querySelector('[data-ws-matches]').innerHTML=commodityResults(node.querySelector('[data-ws-commodity]').value,node.querySelector('[data-ws-chemical]').value);
      if(!fields.includes(k))return;
      const state=getState(id);
      state[k]=el.type==='checkbox'?(el.checked?'yes':''):el.value;
      if(k==='criterion'){state.unitConfirmed='';state.result='';node.querySelector('[data-ws-field="unitConfirmed"]').checked=false;node.querySelector('[data-ws-field="result"]').value='';}
      if(k==='broadForm'){state.broadRef='';node.querySelector('[data-ws-field="broadRef"]').value='';}
      if(k==='broadForm' || k==='broadRef')node.querySelector('[data-broad-result]').textContent=root.PMSVBroadContaminants.resolution(id,state.broadForm,state.broadRef);
      if(k==='metalForm' || k==='metalPack' || k==='mercuryArticle'){
        state[k+'Ref']='';
        node.querySelector('[data-ws-field="'+k+'Ref"]').value='';
      }
      if(['metalForm','metalFormRef','metalPack','metalPackRef'].includes(k))node.querySelector('[data-metal-results]').innerHTML=root.PMSVMetalScope.results(id,state);
      if(['metalForm','metalFormRef','mercuryArticle','mercuryArticleRef'].includes(k)){
        const result=root.PMSVBroadContaminants.scope(id,state.broadForm,state.broadRef,state).h;
        node.querySelector('[data-hg-value]').textContent=result.article+(result.level?' · '+result.level:'');
        node.querySelector('[data-hg-basis]').textContent=result.why;
      }
      if(k==='pack')node.querySelector('[data-ws-pack]').innerHTML=packRules(state.pack);
      const out=node.querySelector('[data-ws-outcome]');if(out)out.textContent=resultText(id);
      const feedback=node.querySelector('[data-ws-saved]');if(feedback)feedback.textContent='Unsaved changes';
    });
    node.addEventListener('click',e=>{
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
    return ['','Catalogue worksheet · '+r.name,'Review scope: '+human(p.scope),'Source standard / route: '+(std?std.name+' · '+p.standard.split('#')[1]:r.routeFinding),
      'Primary source: '+(anchor?E.documents[anchor.doc].url+(anchor.p.length?'#page='+anchor.p[0]:''):E.documents[p.routeDocs[0]].url),
      'Appendix A category: '+(r.category||'Requires classification'),'Microbiological routes: '+(p.micro.map(([k,v])=>human(k)+' '+(v.note||v.reason||v.route||v.profile_key||'')).join(' | ')||'Inspect product and process against applicable tables'),
      'Product-specific contaminant evidence: '+(p.directCTR?'Partial named evidence':'Exact decision open'),'Remaining action: '+(priority.get(id)?.sourceReviewNextAction||p.ctrAction),
      ...(p.routeAnchors||[]).map(([doc,pp,note])=>note+' · '+E.documents[doc].url+'#page='+pp[0]),
      ...(p.gazetteFindings||[]).map(z=>z.parameter+' · '+z.result+' '+z.scope+' '+E.documents[z.document].url+'#page='+z.pages[0]),
      'Original Gazette rows matching the catalogue name: '+(p.namedGazette||[]).length,'Product reference: '+(s.reference||'—'),'Variant or article: '+(s.article||'—'),'Primary pack: '+(s.pack?human(s.pack):'—'),
      ...(chosen?['Measured criterion: '+chosen.v.spec.parameter+' · '+threshold(chosen.v.spec),'Measured result: '+s.result,'Comparison: '+(resultText(id)||'Awaiting result')]:[]),...root.PMSVBroadContaminants.brief(id,s),...root.PMSVMetalScope.brief(id,s),'Selected Gazette commodity: '+(recordedCommodity(id)||'—'),'Evidence and open actions: '+(s.note||'—')];
  }
  function registerRows(includeDeviceEntries=false) {
    if(!valid)return [];
    return [['Catalogue ID','Product','Route','Article / regulation','Source standard or route','Official identity source','PDF pages','Page evidence','Appendix A category','Microbiology route','Contaminant evidence','Exact named Gazette references','Monograph matches','Next evidence or legal check','Recheck 1 Dec 2026','All applicable provisions verified','Open cited PDF page','Chapter and monograph numerical agreements','Chapter and monograph numerical differences','SKU or formula reference','Process, commodity or variant','Evidence document reference','Adjudicated Gazette criterion',...root.PMSVBroadContaminants.columns(),...root.PMSVMetalScope.columns(),'Mercury source decision or missing evidence','Documented melamine decision','Documented mercury decision','Documented product form','Documented canning status','Metal decisions for the documented form or pack'], ...list.map(({id})=>{
      const p=E.products[id],r=R.products[id],std=R.standards[p.standard],a=E.standards[p.standard],route=p.routeAnchors?.[0];
      const s=includeDeviceEntries?getState(id):{};
      const M=root.PMSVMetalScope,B=root.PMSVBroadContaminants;
      const mel=B.scope(id,s.broadForm,s.broadRef,s),hg=M.documentedMercury(id,s);
      const documented=field=>M.documentedChoice(id,field,s);
      return [id,r.name,human(p.scope),p.standard.split('#')[1]||'',std?.name||r.routeFinding,a?E.documents[a.doc].url:E.documents[route?.[0]||p.routeDocs[0]].url,(a?.p||route?.[1]||[]).join(', '),a?.basis||route?.[2]||'Regulatory category or licensing route',r.category,p.micro.map(([k,v])=>[k,v.note||v.reason||v.route||v.profile_key].filter(Boolean).join(' · ')).join(' | '),p.directCTR?'Partial direct evidence':'Exact finished-product decision open',(p.namedGazette||[]).length,p.monographs.length,priority.get(id)?.sourceReviewNextAction||p.ctrAction,p.future,'No', (a?E.documents[a.doc].url:E.documents[route?.[0]||p.routeDocs[0]].url).split('#')[0]+'#page='+(a?.p?.[0]||route?.[1]?.[0]||1),(p.qualityCrosschecks||[]).filter(([,z])=>z[5]==='same numerical value').length,(p.qualityCrosschecks||[]).filter(([,z])=>z[5]==='different numerical values').length,s.reference||'',s.article||'',s.note||'',(p.gazetteFindings||[]).map(z=>z.parameter+' '+z.result+' '+z.scope+' '+E.documents[z.document].url+'#page='+z.pages[0]).join(' | '),...root.PMSVBroadContaminants.values(id),...M.values(id),
        M.mercuryGuide(id)?.reason||B.scope(id).h.why,
        mel.m.options.length && mel.applied ? B.resolution(id,s.broadForm,s.broadRef)+' · '+s.broadRef:'',
        hg?hg.article+' · '+hg.level+' · '+hg.why:'',documented('metalForm'),documented('metalPack'),
        (documented('metalForm')||documented('metalPack'))?M.brief(id,s).join(' | '):''];
    })];
  }
  const stats=valid?{total:ids.size,direct:[...ids].filter(id=>E.products[id].scope==='product_standard').length,
    partial:[...ids].filter(id=>E.products[id].directCTR).length,portal:[...ids].filter(id=>E.products[id].monographs.length).length}:null;
  root.PMSVCatalogueWorksheets=Object.freeze({available:!!valid,stats,markup,attach,briefLines,registerRows,compare,enabledCriteria});
})(globalThis);
