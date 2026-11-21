/* Product-level decisions for CTR 2.1.1(2), as at 20 November 2026. */
(function (root) {
  'use strict';
  const data = root.PMSVMetalScopeData;
  const evidence = root.PMSVCatalogueEvidence;
  const gazette = 'https://fssai.gov.in/docs/whatsnew/gazette/5f3d09f97b78aGazette_Notification_Limit_Metal_19_08_2020.pdf';
  const current = 'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf';
  const act = 'https://fssai.gov.in/upload/uploadfiles/files/FOOD-ACT.pdf';
  const products = new Set(data.catalogue);
  const grade = new Set(data.grade);
  const residual = new Set(Object.values(data.residual).flat());
  const frozen = new Set(data.frozen);
  const shortTables = Object.keys(data.narrow);
  const mercuryGuides = new Map();
  for (const [reason,group] of Object.entries(data.mercuryGuides)) {
    for (const id of group.ids) mercuryGuides.set(id,{reason,keys:group.rows});
  }
  const byMetal = new Map();
  for (const [metal, table] of Object.entries(data.narrow)) {
    const records = new Map();
    for (const kind of ['named', 'check']) {
      for (const group of table[kind]) {
        for (const id of group.ids) records.set(id, {kind, keys:group.rows, reason:group.reason});
      }
    }
    byMetal.set(metal, records);
  }

  const labels = {
    named:'Named article', residual:'Foods not specified', all:'All foods', check:'Article decision needed',
    outside:'No finished-article row in this table', pack:'Confirm canning status', options:'Compare listed rows'
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[c]);
  const link = (url, label) => '<a class="source-ref" target="_blank" rel="noopener noreferrer" href="'+escape(url)+'">'+escape(label)+'</a>';
  const decision = (kind, keys, reason = '') => ({kind, keys, reason});
  const qualified = (state, field, options) => options.includes(state[field]) && Boolean(String(state[field+'Ref'] || '').trim());
  function sourcePage(id) {
    const p = evidence.products[id];
    const std = p && evidence.standards[p.standard];
    return std ? [evidence.documents[std.doc].url.split('#')[0], std.p[0]] : null;
  }
  function ingredientIdentity(id) {
    if (!grade.has(id)) return null;
    const [url,page] = sourcePage(id);
    return {key:'other', options:[], extra:[url,page], law:[act,2], why:'The published standard identifies '+root.PMSVCatalogueRules.standards[evidence.products[id].standard].name+' as a food-grade article. For a sample supplied as this ingredient for incorporation into food, apply the other-foods entry. A formula made with it has its own article and sample basis.'};
  }
  function residualMercury(id) {
    if (!residual.has(id)) return null;
    return {key:'residual', article:'Foods not specified', level:'1.0 ppm', page:27,
      why:'The catalogue article as sold falls outside the named mercury entries on Gazette pages 27–28. This decision covers mercury under item 6. Check any separate product or purity specification and the sample unit.'};
  }
  function mercuryGuide(id) { return mercuryGuides.get(id); }
  function documentedMercury(id,state={}) {
    if(root.PMSVMetalPanelData?.groups.fpc.includes(id)&&qualified(state,'panelFpc',['yes','no'])){
      const yes=state.panelFpc==='yes';
      return {key:yes?'documented':'review',article:yes?'Foods not specified':'Reclassify the supplied product',level:yes?'1.0 ppm':'',page:27,
        why:(yes?'FPC 18 direction, paragraph 4(f). ':'The documented food is outside the FPC 18 direction. ')+state.panelFpcRef.trim()};
    }
    const singleGuide=mercuryGuide(id);
    if(isMouth(id)&&qualified(state,'metalForm',['commodity'])&&singleGuide&&qualified(state,'panel_Hg',singleGuide.keys)){
      const key=state.panel_Hg;
      return {key:'documented',article:data.rows[key][1],level:valueText(key),page:data.rows[key][3],why:'Documented single-commodity sample · '+state.panel_HgRef.trim()};
    }
    if (hasBlend(id,state)) return {key:'documented',article:data.rows.Hg6[1],level:valueText('Hg6'),page:27,
      why:'The documented composite review selected the residual article. Evidence · '+state.metalFormRef};
    const guide=mercuryGuide(id);
    if (!guide || isMouth(id) || !qualified(state,'mercuryArticle',guide.keys)) return null;
    const key=state.mercuryArticle;
    return {key:'documented',article:data.rows[key][1],level:valueText(key),page:data.rows[key][3],
      why:'Selected for the documented sample. Evidence · '+state.mercuryArticleRef.trim()};
  }
  function mercuryControls(id,state) {
    const guide=mercuryGuide(id);
    if (!guide) return '';
    return (isMouth(id)?'' : controls('mercuryArticle','Mercury article for the documented sample',
      Object.fromEntries(guide.keys.map(k=>[k,data.rows[k][1]+' · '+valueText(k)])),state));
  }
  function narrow(id, metal) {
    if (!products.has(id) || !byMetal.has(metal)) return null;
    return byMetal.get(metal).get(id) || decision('outside', [], 'The listed food articles for this metal exclude the reviewed finished identity. This table has no residual entry for this metal.');
  }
  const name = id => data.confectionery[id];
  const isMouth = id => ['plantMouth','spiceMouth','otherMouth'].includes(name(id));
  const hasBlend = (id,s) => isMouth(id) && qualified(s,'metalForm',['composite']);
  const sampleOptions = id => isMouth(id) ? {composite:'Finished composite checked against the named commodity entries',commodity:'Single or separately named commodity'} :
    frozen.has(id) && id!=='03-03-ice-lollies-or-edible-ices' ? {frozen:'Ready-to-eat frozen product',dry:'Dried mix as supplied'} : null;
  const noNamed = () => decision('outside',[],'The finished composite has no named article in this metal table.');
  function confection(id, state = {}) {
    const kind = name(id);
    if (!kind) return null;
    const docBlend = hasBlend(id,state);
    const unresolved = isMouth(id) && !docBlend;
    const candy = kind==='hard', powder = kind==='powder';
    const rows = {};
    for (const [metal, key] of Object.entries({Lead:'Pb71', Copper:'Cu11', Arsenic:'As32', Tin:'Sn16', Cadmium:'Cd8', Mercury:'Hg6'})) {
      rows[metal] = unresolved ? decision('check',[], 'Determine if the article is a single named commodity or a finished composite. Compare the recipe and the marketed form against the Gazette.') :
        decision('residual',[key],'For the named finished article as supplied. A separately tested ingredient has its own row.');
    }
    rows['Methyl Mercury'] = decision('all',['Me0'],'Calculated as the element.');
    for (const metal of shortTables) rows[metal] = docBlend ? noNamed() : narrow(id,metal);
    if (powder) {
      rows.Lead = decision('named',['Pb55'],'Report on the dry fat-free substance basis.');
      rows.Copper = decision('named',['Cu7'],'Report on the fat-free substance basis.');
    }
    if (candy) {
      rows.Lead = decision('named',['Pb82']);
      rows.Copper = decision('named',['Cu12']);
      rows.Arsenic = decision('named',['As39']);
    }
    if (!unresolved) {
      const canned = qualified(state,'metalPack',['can','other']) ? state.metalPack : '';
      if (candy && canned==='other') rows.Tin = decision('named',['Sn17']);
      else if (!candy && canned==='other') rows.Tin = decision('residual',['Sn16']);
      else if (canned==='can') rows.Tin = candy ? decision('options',['Sn17','Sn4','Sn25'],'Both the hard-boiled and canned descriptions may apply. Check their scope before accepting a limit.') :
        decision('named',['Sn4','Sn25'],'The two general canned-food entries have the same maximum for this finished food.');
      else rows.Tin = decision('pack',candy ? ['Sn17','Sn4','Sn25'] : ['Sn16','Sn4','Sn25'],
        'Record whether the finished product is canned. A metalised wrapper or a metal storage tin alone does not establish canning.');
    }
    return rows;
  }
  function frozenRows(id, state = {}) {
    if (!frozen.has(id)) return null;
    const ready = id==='03-03-ice-lollies-or-edible-ices' || qualified(state,'metalForm',['frozen']);
    const dry = qualified(state,'metalForm',['dry']);
    const reason = ready ? 'The cited entry names the ready-to-eat frozen product.' : dry ? 'The cited frozen-food entry does not establish a maximum for the dry mix as supplied.' : 'The product standard includes dried mixes. Establish the form as supplied before using the frozen-food entries.';
    return {Lead:decision(ready?'named':'check',dry?[]:['Pb83'],reason), Arsenic:decision(ready?'named':'check',dry?[]:['As40'],reason)};
  }
  function valueText(key) {
    const [metal, article, literal] = data.rows[key];
    const printed = literal.replace(/[‖”";\s]+$/g,'');
    const unit = /mg\/L/i.test(article) ? 'mg/L' : 'ppm';
    const text = printed.replace(/^(\d+(?:\.\d+)?)/, '$1 '+unit);
    return metal==='Methyl Mercury' ? text+' as element' : text;
  }
  function rowText(key) {
    const row = data.rows[key];
    return row[1]+' · '+valueText(key)+' (Gazette p. '+row[3]+')';
  }
  function summary(d) {
    return [labels[d.kind],d.keys.map(rowText).join(' / '),d.reason].filter(Boolean).join(' · ');
  }
  function rowLinks(keys) {
    return keys.map(k => link(gazette+'#page='+data.rows[k][3],rowText(k))).join('<br>');
  }
  function table(rows) {
    const render = ([metal,d]) => '<tr><th scope="row">'+escape(metal)+'</th><td>'+escape(labels[d.kind])+'</td><td>'+(rowLinks(d.keys)||'—')+'</td><td>'+escape(d.reason)+'</td></tr>';
    return '<div class="ws-scroll"><table><thead><tr><th>Metal</th><th>Decision</th><th>Gazette article and maximum</th><th>Sample or basis</th></tr></thead><tbody>'+Object.entries(rows).map(render).join('')+'</tbody></table></div>';
  }
  const narrowRows = id => Object.fromEntries(shortTables.map(metal => [metal,narrow(id,metal)]));
  function ingredientRows(id) {
    const profile = data.ingredients[id];
    if (!profile) return null;
    const rows = {};
    for (const [keys,kind] of [[profile.direct,'named'],[profile.compare,'options']]) {
      for (const key of keys) {
        const metal = data.rows[key][0];
        if (!rows[metal]) rows[metal] = decision(kind,[]);
        rows[metal].keys.push(key);
      }
    }
    return rows;
  }
  function controls(field, label, choices, state) {
    const opts = Object.entries(choices).map(([v,t])=>'<option value="'+v+'"'+(state[field]===v?' selected':'')+'>'+escape(t)+'</option>').join('');
    return '<label>'+label+'<select data-ws-field="'+field+'"><option value="">Choose after checking the product</option>'+opts+'</select></label><label>Supporting document<input data-ws-field="'+field+'Ref" value="'+escape(state[field+'Ref'])+'" maxlength="320" placeholder="Label, pack drawing or product specification"></label>';
  }
  function results(id,state) {
    if(root.PMSVMetalPanel)return root.PMSVMetalPanel.renderRows(id,state);
    const product = confection(id,state);
    let body = product ? table(Object.fromEntries(data.metalOrder.map(m=>[m,product[m]]))) : table(narrowRows(id));
    const extra = frozenRows(id,state);
    if (extra) body+='<h5>Frozen confection or dried mix</h5>'+table(extra);
    const ingredient = ingredientRows(id);
    if (ingredient) body+='<h5>Additional ingredient article references</h5>'+table(ingredient)+'<p>'+escape(data.ingredients[id].note)+'</p>';
    return body;
  }
  function markup(id,state) {
    if (!products.has(id)) return '';
    const subject = root.PMSVMetalPanel || name(id) ? 'All 11 metals in the CTR table' : 'Chromium, nickel, selenium and antimony';
    let body = '<p>CTR 2.1.1(2) · Apply each row to the article and sample named. A listed maximum alone does not set a sampling frequency.</p>';
    const opts = sampleOptions(id);
    if (opts) body+=controls('metalForm','Form as supplied',opts,state);
    if (name(id)) body+=controls('metalPack','Canning status',{can:'Canned finished food',other:'Finished food supplied without canning'},state);
    body+='<div data-metal-results>'+results(id,state)+'</div>';
    if(root.PMSVMetalPanel)body+=root.PMSVMetalPanel.controls(id,state);
    if (name(id)) body+='<p>The operative metal table has 11 headings. It has no zinc heading. Separate nutrient, fortification or claim requirements depend on the product.</p>';
    if (data.ingredients[id]) body+='<p>For food-use chemicals also check the applicable Indian Pharmacopoeia monograph under CTR 2.1.1(1) and the FSSAI product or purity standard.</p>';
    return '<details class="ws-section metal-scope"><summary>'+subject+'</summary><div>'+body+link(gazette+'#page=18','Original table and units')+' · '+link(gazette+'#page=28','Original short metal tables')+' · '+link(current+'#page=12','Consolidated table')+'</div></details>';
  }
  function documentedChoice(id,field,state) {
    const opts=field==='metalForm' ? sampleOptions(id) : name(id) ? {can:'Canned finished food',other:'Finished food supplied without canning'} : null;
    if (!opts || !qualified(state,field,Object.keys(opts))) return '';
    return opts[state[field]]+' · '+state[field+'Ref'].trim();
  }
  function brief(id,state) {
    if (!products.has(id)) return [];
    const chosen=confection(id,state) || narrowRows(id);
    const lines = Object.entries(chosen).map(([m,d])=>m+' · '+summary(d));
    for (const [m,d] of Object.entries(frozenRows(id,state)||{})) lines.push('Frozen food · '+m+' · '+summary(d));
    for (const [m,d] of Object.entries(ingredientRows(id)||{})) lines.push('Ingredient · '+m+' · '+summary(d));
    if (data.ingredients[id]?.note) lines.push(data.ingredients[id].note);
    for (const field of ['metalForm','metalPack']) {
      const selected = documentedChoice(id,field,state);
      if (selected) lines.push(selected);
    }
    return [...lines,'Metal table · '+gazette+'#page=18'];
  }
  function columns() {
    return [...shortTables.flatMap(m=>[m+' decision (CTR 2.1.1)',m+' article, maximum and Gazette page',m+' applicability basis']),
      'FCS 05 complete metal table at catalogue identity','Frozen product lead and arsenic scope','Additional ingredient metal rows and qualifications','Current original metal Gazette','Food-grade melamine identity and legal basis'];
  }
  function values(id) {
    const format = rows => Object.entries(rows||{}).map(([metal,d])=>metal+' · '+summary(d)).join(' | ');
    const identity=ingredientIdentity(id);
    return [...shortTables.flatMap(m=>{const d=narrow(id,m);return [labels[d.kind],d.keys.map(rowText).join(' / '),d.reason];}),
      format(confection(id)),format(frozenRows(id)),[format(ingredientRows(id)),data.ingredients[id]?.note].filter(Boolean).join(' | '),gazette+'#page=28',
      identity?identity.extra[0]+'#page='+identity.extra[1]+' | '+act+'#page=2':''];
  }
  root.PMSVMetalScope = Object.freeze({narrow,confection,frozenRows,ingredientRows,ingredientIdentity,residualMercury,mercuryGuide,documentedMercury,mercuryControls,documentedChoice,markup,results,brief,columns,values,valueText});
})(globalThis);
