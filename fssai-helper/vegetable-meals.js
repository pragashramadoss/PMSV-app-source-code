/* FSSAI 2.3.4 and 2.3.5. Each article has its own identity and numerical checks. */
(function (root) {
  'use strict';
  const node = typeof module === 'object' && module.exports;
  const {clean,esc,compare,link,sourceURL} = node ? require('./culinary-sauces.js') : root.PMSVCulinarySauces;
  const {assessFill} = node ? require('./thermal-packs.js') : root.PMSVThermalPacks;
  const packs = {rigid:'Rigid container, including a can or glass bottle',flexible:'Flexible pack',unknown:'Rigidity unconfirmed'};
  const waterBases = {stated:'Full distilled-water capacity at 20 °C',other:'Nominal pack size, mass or another basis'};
  const same = (a,b) => JSON.stringify(a)===JSON.stringify(b);

  function validReview(review,thermal,catalogue,records) {
    if (review?.round!==92 || review.reviewedOn!=='2026-11-20' || review.report!=='ctr-vegetable-meals-soups-r92-2026-11-20.md' ||
        !Array.isArray(review.products) || review.products.length!==2 || !thermal?.fill) return false;
    if (!['minimumPercent','waterTemperatureC','volumeUnit','pack'].every(k=>review.fill?.[k]===thermal.fill[k]) ||
        !['chapter','gazette'].every(k=>['url','sha256'].every(f=>review.sources?.[k]?.[f]===thermal.sources?.[k]?.[f]))) return false;
    const expected=[
      {id:'04-04-2-thermally-processed-curried-vegetables-ready-to-eat-vegetables',kind:'curry',label:'Curried and ready-to-eat vegetables',
       row:187,clause:'2.3.4',fcs:'04.2.2.8',gazette:53,chapter:10,fill:3,appendix:2,
       aliases:['curried vegetables','ready to eat vegetables','ready-to-eat vegetables','retort vegetable curry']},
      {id:'12-12-5-thermally-processed-vegetable-soups',kind:'soup',label:'Thermally processed vegetable soups',
       row:421,clause:'2.3.5',fcs:'12.5.1',gazette:54,chapter:11,fill:4,appendix:3,
       aliases:['vegetable soup','tomato soup','ready to eat soup','canned vegetable soup','canned tomato soup']}
    ];
    const ok=review.products.every((p,i)=>{
      const e=expected[i];
      return p?.id===e.id && p.kind===e.kind && p.label===e.label && p.clause===e.clause && p.priority===e.row &&
        p.fcs===e.fcs && p.gazettePage===e.gazette && p.chapterPage===e.chapter && p.fillParagraph===e.fill &&
        p.appendixParagraph===e.appendix && same(p.aliases,e.aliases) &&
        catalogue.some(x=>x.id===e.id && x.priority===e.row && x.fcs===e.fcs && x.fssr===e.clause);
    });
    if (!ok) return false;
    const [curry,soup]=review.products,solids=soup.solids;
    const curryRecord=records.find(x=>x.id===curry.id);
    return !curry.solids && solids?.provision==='(2)' && solids.basis==='Finished soup, total soluble solids as % by mass (m/m)' &&
      same(solids.types?.map(t=>[t?.key,t?.minimum,t?.label]),[
        ['vegetable',5,'Direct-consumption vegetable soup, other than tomato soup'],['tomato',7,'Direct-consumption tomato soup']]) &&
      curryRecord?.reports.some(s=>s.round===67) && curryRecord.reports.some(s=>s.round===92 && s.file===review.report);
  }

  function identities(product) {
    if (product.kind==='curry') return {ready:'Heat-processed curried or ready-to-eat vegetable preparation',other:'Other preparation or identity unconfirmed'};
    return {...Object.fromEntries(product.solids.types.map(t=>[t.key,t.label])),reconstitute:'Dry mix or concentrate that needs preparation or dilution',other:'Soup identity unconfirmed'};
  }
  const eligible = (p,key) => p.kind==='curry' ? key==='ready' : p.solids.types.some(t=>t.key===key);
  function identityMessage(p,key) {
    if (eligible(p,key)) return '';
    if (p.kind==='soup' && key==='reconstitute') return 'Review the product as sold. Section 2.3.5 specifies soup supplied for direct consumption.';
    return 'Confirm the finished product identity to use FSSAI '+p.clause+'.';
  }
  function solidsCheck(p,key,basis,raw) {
    const row=p.solids?.types.find(t=>t.key===key);
    if (!row) return '';
    const reference='FSSAI '+p.clause+p.solids.provision+' · Minimum '+row.minimum.toFixed(1)+'% total soluble solids by mass.';
    return reference+'\n'+compare({minimum:row.minimum},basis,raw);
  }
  function fillCheck(review,p,key,pack,basis,volume,capacity) {
    if (!eligible(p,key)) return identityMessage(p,key);
    const result=assessFill(review.fill,pack,basis,volume,capacity);
    return [result.minimum,result.outcome].filter(Boolean).join('\n');
  }
  const packReference=(r,p)=>'FSSAI '+p.clause+'('+p.fillParagraph+') · For a rigid container, the product must occupy at least '+
    r.fill.minimumPercent+'% of its full distilled-water capacity at '+r.fill.waterTemperatureC+' °C.';
  const solidBases = p => ({stated:p.solids.basis,other:'Raw °Brix, total dry matter, mass per volume or other unconfirmed basis'});
  const choice=(options,key)=>Object.hasOwn(options,key)?options[key]:'Unconfirmed';
  function sources(review,p) {
    return [['Consolidated FSSAI chapter',{...review.sources.chapter,page:p.chapterPage}],
      ['Original Gazette',{...review.sources.gazette,page:p.gazettePage}]];
  }
  function select(key,label,options) {
    const choices=Object.entries(options).map(([k,v])=>'<option value="'+esc(k)+'">'+esc(v)+'</option>').join('');
    return '<label for="vm-'+key+'">'+esc(label)+'</label><select id="vm-'+key+'"><option value="">Choose an option</option>'+choices+'</select>';
  }
  function input(key,label,numeric=false) {
    return '<label for="vm-'+key+'">'+esc(label)+'</label><input id="vm-'+key+'" type="text" autocomplete="off" '+
      (numeric?'inputmode="decimal" maxlength="32"':'maxlength="160"')+'>';
  }
  const status=(key,text)=>'<p role="status" class="fill-outcome" id="vm-'+key+'">'+esc(text)+'</p>';
  function markup(review,p) {
    const soup=p.kind==='soup';
    const solids=soup?'<details open><summary>Soup total soluble solids</summary>'+
      select('solids-basis','Laboratory reporting basis',solidBases(p))+input('solids','Finished soup total soluble solids (%)',true)+
      status('solids-result','Awaiting a result')+'</details>':'';
    const evidence='<details><summary>Supporting records</summary><p>FSSAI '+p.clause+'('+p.appendixParagraph+
      ') refers to permitted additives and Appendix B microbiological requirements.</p>'+
      input('additives','Additive assessment reference (optional)')+input('appendix','Appendix B report reference (optional)')+'</details>';
    return '<section class="panel compact vegetable-meals" data-product="'+esc(p.id)+'"><h4>'+esc(p.label)+'</h4><p>FSSAI '+p.clause+' · '+esc(p.identity)+'</p>'+
      input('lot','Lot or laboratory report reference (optional)')+input('food','Product name as supplied (optional)')+
      (soup?'<p>Minimum soluble solids by mass · 5.0% for other vegetable soup and 7.0% for tomato soup.</p>':
        '<p>This article specifies a rigid-container fill minimum. Its text gives no drained-weight or soluble-solids minimum.</p>')+
      select('identity','Finished product as supplied',identities(p))+status('identity-result',identityMessage(p,''))+
      '<div id="vm-checks" hidden>'+solids+'<details'+(soup?'':' open')+'><summary>Rigid-container fill</summary><p>'+esc(packReference(review,p))+'</p>'+
      select('pack','Actual container',packs)+'<div id="vm-volumes" hidden>'+select('water-basis','Capacity measurement basis',waterBases)+
      input('capacity','Full water capacity of the same container (mL)',true)+input('volume','Volume occupied by the food (mL)',true)+'</div>'+
      status('fill-result','Confirm the container type.')+'</details>'+evidence+'</div><div class="controls">'+
      sources(review,p).map(([label,source])=>link(sourceURL(source),label)).join('')+link(review.report,'Curried vegetable and soup source review')+'</div></section>';
  }
  const field=(panel,key)=>panel.querySelector('#vm-'+key);
  const value=(panel,key)=>clean(field(panel,key)?.value);
  const readFill=(r,p,panel,key)=>fillCheck(r,p,key,value(panel,'pack'),value(panel,'water-basis'),value(panel,'volume'),value(panel,'capacity'));
  function briefLines(r,p,container) {
    const panel=container?.querySelector('.vegetable-meals');
    if (panel?.dataset.product!==p.id) return [];
    const key=value(panel,'identity'),pack=value(panel,'pack'),lines=['',p.label+' · FSSAI '+p.clause,p.identity];
    function add(fieldName,label,unit='') {const v=value(panel,fieldName);if(v) lines.push(label+' · '+v+unit);}
    add('lot','Lot or laboratory report');add('food','Product as supplied');
    lines.push('Finished product · '+choice(identities(p),key));
    if (eligible(p,key)) {
      if (p.kind==='soup') {
        const basis=value(panel,'solids-basis');
        lines.push('Soluble-solids result basis · '+choice(solidBases(p),basis));
        add('solids',basis==='stated'?'Finished soup total soluble solids':'Entered reading (basis unconfirmed)',basis==='stated'?'% by mass':'');
        lines.push(solidsCheck(p,key,basis,value(panel,'solids')));
      }
      lines.push(packReference(r,p),'Container · '+choice(packs,pack));
      if (pack==='rigid') {
        lines.push('Capacity basis · '+choice(waterBases,value(panel,'water-basis')));
        add('capacity','Recorded capacity',' mL');add('volume','Occupied volume',' mL');
      }
      lines.push(readFill(r,p,panel,key));add('additives','Additive assessment');add('appendix','Appendix B report');
    } else lines.push(identityMessage(p,key));
    lines.push(...sources(r,p).map(([label,source])=>label+' · '+sourceURL(source)));
    return lines;
  }
  const api=Object.freeze({validReview,eligible,solidsCheck,fillCheck,markup,briefLines});
  if (node) module.exports=api;
  root.PMSVVegetableMeals=api;
  if (typeof document==='undefined') return;

  function update(event) {
    const target=event.target,panel=target.closest?.('.vegetable-meals');
    if (!panel || (target.tagName==='SELECT' && event.type!=='change')) return;
    const r=root.PMSV_REVIEW_REGISTER.vegetableMealReview,p=r.products.find(item=>item.id===panel.dataset.product);
    const key=value(panel,'identity'),open=eligible(p,key);
    function clear(keys) {
      for (const k of keys) {const f=field(panel,k);if (f) f.value='';}
    }
    switch(target.id) {
      case 'vm-identity':
        clear(['solids-basis','solids','pack','water-basis','capacity','volume','additives','appendix']);
        field(panel,'checks').hidden=!open;field(panel,'volumes').hidden=true;
        field(panel,'identity-result').hidden=open;field(panel,'identity-result').textContent=identityMessage(p,key);
        break;
      case 'vm-pack':
        clear(['water-basis','capacity','volume']);field(panel,'volumes').hidden=value(panel,'pack')!=='rigid';break;
      case 'vm-water-basis': clear(['capacity']);break;
      case 'vm-solids-basis': clear(['solids']);break;
      case 'vm-solids': case 'vm-volume': case 'vm-capacity': break;
      default: return;
    }
    if (!open) return;
    if (p.kind==='soup') field(panel,'solids-result').textContent=solidsCheck(p,key,value(panel,'solids-basis'),value(panel,'solids'));
    field(panel,'fill-result').textContent=readFill(r,p,panel,key);
  }
  document.addEventListener('input',update);
  document.addEventListener('change',update);
})(typeof globalThis==='object'?globalThis:this);
