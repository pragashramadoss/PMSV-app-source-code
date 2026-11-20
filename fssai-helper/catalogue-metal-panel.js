/* FSSAI CTR 2.1.1(2). Source decisions are separate from an assessment of a laboratory result. */
(function(root){
  'use strict';
  const D=root.PMSVMetalPanelData, old=root.PMSVMetalScopeData, M=root.PMSVMetalScope, B=root.PMSVBroadContaminants, E=root.PMSVCatalogueEvidence;
  if(!D||!M||!B||!E||Object.keys(D.rows).length!==382||Object.keys(D.products).length!==533)return;
  const metals=Object.entries(D.metals);
  const primary=['Pb','Cu','As','Sn','Cd'];
  const names=Object.fromEntries(metals.map(([name,key])=>[key,name]));
  const source=E.documents['ctr-3'].url.split('#')[0],amendment=E.documents['ctr-1'].url.split('#')[0];
  const direction=E.documents['profile-special-regulatory-routes-1'].url.split('#')[0];
  const groups=Object.fromEntries(Object.entries(D.groups).map(([k,ids])=>[k,new Set(ids)]));
  const known=id=>Object.hasOwn(D.products,id);
  const idKeys=Object.keys(D.products);
  const rowKeys=Object.fromEntries(metals.map(([,m])=>[m,Object.keys(D.rows).filter(k=>k.replace(/\d+$/,'')===m)]));
  const field=m=>'panel_'+m;
  const reviewFields=metals.filter(([,m])=>m!=='Me').map(([,m])=>field(m));
  const fields=[...reviewFields.flatMap(k=>[k,k+'Ref']),'panelFpc','panelFpcRef','panelIdentity','panelIdentityRef','panelContainer','panelContainerRef','panelLabMetal','panelLabNumber','panelLabUnit','panelLabBasis','panelLabRef'];
  const label={named:'Named finished article',residual:'Foods not specified',all:'All foods',outside:'No listed finished article',same:'Common maximum · exact article open',check:'Article or sample evidence needed',hold:'Source interpretation open',unidentified:'Identify supplied food-grade article',fpc:'Confirm FPC 18 eligibility',factor:'Named milk article · concentration factor needed'};
  const exact=k=>['named','residual','outside','all'].includes(k);
  const decision=(kind,keys,reason,proof='')=>({kind,keys,reason,proof});
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ref=(u,l)=>'<a class="source-ref" target="_blank" rel="noopener noreferrer" href="'+escape(u)+'">'+escape(l)+'</a>';
  const textValue=(s,k)=>typeof s[k]==='string'?s[k].trim():'';
  const evidence=(s,k)=>textValue(s,k+'Ref');
  const qualified=(s,k,options)=>options.includes(s[k])&&!!evidence(s,k);
  function profile(id,m){
    const [kind,keys,reason]=D.profiles[D.products[id][primary.indexOf(m)]];
    return decision(kind,keys,reason);
  }
  function literal(k){return D.rows[k][1].replace(/[‖”";\s]+$/g,'');}
  function limit(k){
    const row=D.rows[k],unit=/mg\/l/i.test(row[0])?'mg/L':'ppm';
    if(k==='Cu13')return '2.8 to 15 ppm';
    const value=literal(k).replace(/^(\d+(?:\.\d+)?)/,'$1 '+unit);
    return k==='Me0'?value+' as element':value;
  }
  function pages(k){return [D.rows[k][2],...D.rows[k][3]];}
  function rowText(k){return D.rows[k][0]+' · '+limit(k)+' (Gazette p. '+pages(k).join(', ')+')';}
  function hasUniformLimit(d){
    return d.keys.length>0&&new Set(d.keys.map(k=>limit(k)+'|'+D.rows[k][4])).size===1;
  }
  function foodGrade(id,s){
    return !groups.unidentified.has(id)||(!!textValue(s,'panelIdentity')&&!!evidence(s,'panelIdentity'));
  }
  function eligible(id,s){
    return groups.fpc.has(id)&&qualified(s,'panelFpc',['yes']);
  }
  const residualKeys=new Set(['Pb71','Cu11','As32','Sn16','Cd8','Hg6']);
  const narrowMetal=m=>['Cr','Ni','Se','Sb'].includes(m);
  function shortDecision(id,m,s){
    const active=M.confection(id,s);
    const d=active?.[names[m]]||M.narrow(id,names[m]);
    return decision(d.kind==='options'?'hold':d.kind,d.keys,d.reason);
  }
  const hgNamed={mineral_water:'Hg7',packaged_water:'Hg9',salt:'Hg11',shellfish:'Hg8',carrageenan:'Hg3'};
  function mercury(id,s){
    const guide=M.mercuryGuide(id);
    if(guide&&qualified(s,'mercuryArticle',guide.keys)&&!old.confectionery[id])
      return decision(residualKeys.has(s.mercuryArticle)?'residual':'named',[s.mercuryArticle],guide.reason,evidence(s,'mercuryArticle'));
    const active=M.confection(id,s)?.Mercury;
    if(active?.kind==='residual')return decision('residual',active.keys,active.reason,s.metalForm==='composite'?evidence(s,'metalForm'):'');
    if(guide)return decision('check',guide.keys,guide.reason);
    const h=B.scope(id).h;
    if(h.key==='residual')return decision('residual',['Hg6'],h.why);
    let key;
    if(id==='mineral-water')key=hgNamed.mineral_water;
    else if(id==='packaged-drinking-water')key=hgNamed.packaged_water;
    else if(h.article==='Salt, food grade')key=hgNamed.salt;
    else if(h.article==='Carrageenan')key=hgNamed.carrageenan;
    else if(h.article?.startsWith('Non-predatory'))key=hgNamed.shellfish;
    if(!key)return decision('check',rowKeys.Hg,'Confirm the exact named mercury article, edible sample and source.');
    return decision('named',[key],h.why);
  }
  function base(id,m,s){
    if(groups.fpc.has(id)){
      if(s.panelFpc==='no'&&evidence(s,'panelFpc'))return decision('check',[], 'Identify the applicable product standard and review its catalogue worksheet. The recorded product is outside the FPC 18 direction.',evidence(s,'panelFpc'));
      if(m==='Hg'&&!eligible(id,s)&&M.residualMercury(id))return decision('residual',['Hg6'],'This finished food was independently compared with the named mercury entries. Document category eligibility for the FPC 18 directed assessment.');
      if(primary.includes(m)||m==='Hg'){
        const k={Pb:'Pb71',Cu:'Cu11',As:'As32',Sn:'Sn16',Cd:'Cd8',Hg:'Hg6'}[m];
        return eligible(id,s)?decision('residual',[k],'Directed finished-food entry under paragraph 4(f). Review the base foods separately for other provisions.',evidence(s,'panelFpc')):
          decision('fpc',[k],'Document that the finished sweet or snack qualifies under paragraphs 3 and 4(f) of the FPC 18 direction.');
      }
      if(eligible(id,s)&&narrowMetal(m))return decision('outside',[],'For the documented prepared FPC 18 food, this metal has no residual entry or named finished-composite entry.',evidence(s,'panelFpc'));
    }
    if(groups.vending.has(id)&&['Hg','Cr','Ni','Se','Sb'].includes(m))return decision('hold',m==='Hg'?['Hg7','Hg9']:M.narrow(id,names[m]).keys,'The vending-water article cites IS 10500. A packaged-water row requires the corresponding marketed identity.');
    if(m==='Me')return foodGrade(id,s)?decision('all',['Me0'],'All foods, calculated as the element. Assess total mercury separately.'):decision('unidentified',['Me0'],'Document the supplied food-grade article and its use before applying the all-foods provision.');
    if(m==='Hg')return mercury(id,s);
    if(narrowMetal(m))return shortDecision(id,m,s);
    const p=profile(id,m),con=M.confection(id,s);
    if(con){
      const c=con[names[m]];
      if(c.kind==='pack'){
        if(hasUniformLimit(c))return decision('same',c.keys,'Confirm canning status. '+c.reason);
        return decision('check',c.keys,'Confirm canning status. '+c.reason);
      }
      if(c.kind==='options')return decision('hold',c.keys,c.reason);
      if(c.kind!=='check')return decision(c.kind,c.keys,c.reason,evidence(s,m==='Sn'?'metalPack':'metalForm'));
      if(!c.keys.length)return decision(p.kind,p.keys,c.reason+' '+p.reason);
    }
    if((m==='Pb'||m==='As')&&old.frozen.includes(id)){
      const frozen=M.frozenRows(id,s)?.[names[m]];
      if(frozen?.kind==='named')return decision('named',frozen.keys,frozen.reason,evidence(s,'metalForm'));
      if(qualified(s,'metalForm',['dry']))return decision('check',p.keys.filter(k=>!['Pb83','As40'].includes(k)),'Check the dry mix as supplied against its own composition and specific identity.',evidence(s,'metalForm'));
    }
    if(m==='Pb'&&p.kind==='named'&&p.keys.includes('Pb98')&&!groups.plainMilk.has(id))
      return decision('factor',p.keys,'The milk article is identified. Establish the concentration factor and corresponding analytical basis for the dehydrated sample before using a numerical threshold.');
    if(m==='Sn'&&!groups.alwaysCanned.has(id)&&qualified(s,'panelContainer',['can','other'])&&['same','check'].includes(p.kind)){
      const proof=evidence(s,'panelContainer'),generic=p.keys.every(k=>['Sn1','Sn4','Sn16','Sn20','Sn25'].includes(k));
      if(s.panelContainer==='can'&&groups.plainBeverage.has(id))return decision('named',['Sn1'],'Canning of the actual finished beverage is documented.',proof);
      if(s.panelContainer==='can'&&generic&&p.kind==='same')return decision('named',['Sn4','Sn25'],'Both general canned non-beverage entries have the same 250 ppm maximum.',proof);
      if(s.panelContainer==='other'){
        const possible=p.keys.filter(k=>!['Sn0','Sn1','Sn2','Sn3','Sn4','Sn5','Sn6','Sn25'].includes(k));
        if(possible.length===1)return decision(residualKeys.has(possible[0])?'residual':'named',possible,'Canning rows are excluded by the documented process and pack.',proof);
        if(possible.length)return decision(p.kind,possible,p.reason+' Canning rows excluded by the documented pack.',proof);
      }
    }
    return p;
  }
  function selectable(id,m,d,s){
    if(groups.vending.has(id)||d.kind==='fpc'||d.kind==='hold'||d.kind==='factor'||exact(d.kind)||!d.keys.length||!foodGrade(id,s))return [];
    const mouth=['plantMouth','spiceMouth','otherMouth'].includes(old.confectionery[id]);
    if(mouth&&!qualified(s,'metalForm',['composite','commodity']))return [];
    if(m==='Me'||(m==='Hg'&&!(mouth&&s.metalForm==='commodity')))return [];
    if(old.confectionery[id]&&m==='Sn'&&(!['plantMouth','spiceMouth','otherMouth'].includes(old.confectionery[id])||s.metalForm==='composite'))return [];
    const packKey=old.confectionery[id]?'metalPack':'panelContainer';
    const hasPack=qualified(s,packKey,['can','other']);
    const requiresPack=m==='Sn'&&!groups.alwaysCanned.has(id)&&d.keys.some(k=>['Sn0','Sn1','Sn3','Sn4','Sn5','Sn6','Sn25'].includes(k));
    if(requiresPack&&!hasPack)return [];
    const selected=d.keys.filter(k=>!['As30','As52'].includes(k)).filter(k=>{
      if(m!=='Sn'||!hasPack)return true;
      return s[packKey]==='other'?!['Sn0','Sn1','Sn2','Sn3','Sn4','Sn5','Sn6','Sn25'].includes(k):k!=='Sn16';
    });
    return narrowMetal(m)?[...selected,'outside']:selected;
  }
  function forMetal(id,m,s={}){
    if(!known(id)||!Object.hasOwn(names,m))return null;
    const d=base(id,m,s),k=field(m),choices=selectable(id,m,d,s);
    if(qualified(s,k,choices)){
      const v=s[k],proof=evidence(s,k);
      if(['Pb158','As91'].includes(v)&&['plantMouth','spiceMouth','otherMouth'].includes(old.confectionery[id]))return decision('hold',m==='Pb'?['Pb158','Pb60']:['As91','As25'],'For a documented turmeric sample compare the specific and group entries and the analytical basis.',proof);
      if(m==='Pb'&&groups.juiceConflict.has(id)&&['Pb72','Pb73'].includes(v))return decision('hold',['Pb72','Pb73'],'Both juice descriptions must be reconciled for the actual fruit, use and strength before comparison.',proof);
      if(m==='Pb'&&v==='Pb98'&&!groups.plainMilk.has(id))return decision('factor',[v],'Establish the concentration or equivalent as-consumed basis before comparing this sample.',proof);
      if(m==='Sn'&&groups.curedMeat.has(id)&&['Sn7','Sn8','Sn9','Sn10','Sn11','Sn12','Sn13','Sn14','Sn15','Sn21','Sn22'].includes(v))
        return decision('hold',[...new Set([v,'Sn15',...(v==='Sn15'?['Sn9','Sn10','Sn21','Sn22']:[])])],'Named cured meat and container-specific entries can overlap. Document the actual product and tinplate construction and reconcile the applicable rows.',proof);
      if(m==='Sn'&&groups.possibleJuiceTin.has(id)&&['Sn1','Sn20'].includes(v)&&!qualified(s,'panelContainer',['other']))
        return decision('hold',['Sn1','Sn20'],'A named juice and a canned beverage can have different maxima. Establish a non-canned juice or resolve the competing canned-juice entries.',proof);
      if(v==='outside')return decision('outside',[],'Reviewed each named article in this short table for the documented finished matrix.',proof);
      return decision(residualKeys.has(v)?'residual':'named',[v],'Documented applicable article and sample scope.',proof);
    }
    if(d.kind==='same'&&!hasUniformLimit(d))return decision('check',d.keys,d.reason);
    return d;
  }
  function panel(id,s={}){
    if(!known(id))return [];
    return metals.map(([name,key])=>({name,key,...forMetal(id,key,s)}));
  }
  function status(id,s={}){
    const ds=panel(id,s);
    return {exact:ds.filter(d=>exact(d.kind)).length,common:ds.filter(d=>d.kind==='same').length,named:ds.filter(d=>primary.includes(d.key)&&d.kind==='named').map(d=>d.name)};
  }
  let totals;
  function stats(){
    if(totals)return totals;
    const result={products:idKeys.length,headings:metals.length,rows:Object.keys(D.rows).length,exactProducts:0,allOutcomes:0,exactDecisions:0,commonDecisions:0,priorityExact:0,priorityOutcomes:0,priorityNamed:0,additionalNamed:0};
    for(const id of idKeys){
      const st=status(id),priority=!E.products[id].directCTR,full=st.exact===11,all=st.exact+st.common===11;
      result.exactDecisions+=st.exact;result.commonDecisions+=st.common;
      if(full)result.exactProducts++;
      if(all)result.allOutcomes++;
      if(priority&&full)result.priorityExact++;
      if(priority&&all)result.priorityOutcomes++;
      if(priority&&st.named.length){
        result.priorityNamed++;
        if(!root.PMSVCropScope.positive(id).length)result.additionalNamed++;
      }
    }
    totals=Object.freeze(result);return totals;
  }
  function nextEdition(id){
    const notes=[];
    if(groups.plainPulseFlour.has(id))notes.push('This plain pea or Bengal gram flour meets the pulse-flour description in the amended entries: lead 0.2 ppm and cadmium 0.1 ppm from 1 December 2026.');
    else if(groups.futurePulse.has(id)){
      notes.push('From 1 December 2026, the lead row reads pulses and pulse flours (0.2 ppm). The cadmium row adds pulse flours and retains the exclusion for dry soybean (0.1 ppm). Establish the flour and species. A food containing a pulse flour needs a separate finished-product decision.');
      if(groups.soyFlour.has(id))notes.push('Check the scope of the dry-soybean exclusion for the actual soy derivative before choosing a cadmium entry.');
    }
    if(groups.fishOil.has(id))notes.push('From 1 December 2026, inorganic arsenic in fish oil has a 0.1 mg/kg maximum. Total arsenic below that level ends screening; a total above it calls for inorganic arsenic testing. The note does not specify the equality case in this screening sequence.');
    return notes;
  }
  function compact(d){
    const items=d.keys.length<=10?d.keys.map(rowText).join(' / '):d.keys.length+' candidate Gazette rows on PDF pages '+[...new Set(d.keys.flatMap(pages))].sort((a,b)=>a-b).join(', ');
    return [label[d.kind],items,d.reason,d.proof?'Evidence · '+d.proof:''].filter(Boolean).join(' · ');
  }
  const pdfLinks=keys=>[...new Set(keys.flatMap(pages))].sort((a,b)=>a-b).map(pg=>ref(source+'#page='+pg,'PDF p. '+pg)).join(' ');
  function renderRows(id,s={}){
    if(!known(id))return '';
    const ds=panel(id,s),st=status(id,s);
    return '<p data-panel-progress role="status">'+st.exact+' of 11 headings have an exact article or a confirmed absence of a named row.'+
      (st.common?' Another '+st.common+' have a common maximum across the possible articles.':'')+'</p>'+
      '<div class="ws-scroll"><table><thead><tr><th>Metal</th><th>Decision</th><th>Published entry and basis</th><th>Scope and sources</th></tr></thead><tbody>'+
      ds.map(d=>'<tr data-panel-metal="'+d.key+'"><th scope="row">'+escape(d.name)+'</th><td>'+escape(label[d.kind])+'</td><td>'+
        (d.keys.length<=8?d.keys.map(k=>escape(D.rows[k][0]+' · '+limit(k))).join('<br>'):escape(d.keys.length+' candidate entries. Use the Gazette table search below.'))+
        '</td><td>'+escape(d.reason)+(d.proof?'<br>'+escape('Evidence · '+d.proof):'')+' '+pdfLinks(d.keys)+'</td></tr>').join('')+'</tbody></table></div>';
  }
  const pick=(key,options,s,placeholder='Choose after checking the article')=>'<select data-ws-field="'+key+'"><option value="">'+escape(placeholder)+'</option>'+options.map(([v,t])=>'<option value="'+escape(v)+'"'+(s[key]===v?' selected':'')+'>'+escape(t)+'</option>').join('')+'</select>';
  const input=(k,s)=>'<input maxlength="320" data-ws-field="'+k+'" value="'+escape(s[k]||'')+'">';
  const supporting=(k,s)=>'<label>Specification, label or sample reference'+input(k+'Ref',s)+'</label>';
  function choices(id,s){
    let html='';
    for(const [name,m] of metals){
      const d=base(id,m,s),options=selectable(id,m,d,s);
      if(!options.length)continue;
      html+='<div><label>'+escape(name)+' · marketed article'+pick(field(m),options.map(v=>[v,v==='outside'?'No named row fits the documented finished article':D.rows[v][0]+' · '+limit(v)]),s)+'</label>'+supporting(field(m),s)+'</div>';
    }
    return html||'<p>For the supplied identity, use any applicable form, pack, mercury or eligibility controls. Open source questions are shown beside the affected metal.</p>';
  }
  function findRows(m,term){
    if(!Object.hasOwn(names,m))return '';
    const clean=v=>String(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const q=clean(term),selected=rowKeys[m].filter(k=>!q||clean(D.rows[k][0]+' '+D.rows[k][4]).includes(q));
    const shown=selected.slice(0,25);
    return '<p>'+shown.length+' of '+selected.length+' matching '+escape(names[m])+' entries. Select a more specific search to see further rows.</p><ul>'+shown.map(k=>'<li>'+escape(rowText(k))+' '+pdfLinks([k])+'</li>').join('')+'</ul>';
  }
  function criterion(id,d){
    if(!d||!exact(d.kind)||!d.keys.length||!hasUniformLimit(d)||groups.vending.has(id))return null;
    const k=d.keys[0],r=D.rows[k];
    if(['As30','As52'].includes(k)||k==='Pb98'&&!groups.plainMilk.has(id))return null;
    const number=literal(k).match(/^(\d+(?:\.\d+)?)/)?.[1];
    if(!number)return null;
    return {key:k,spec:k==='Cu13'?{operator:'range',min:'2.8',max:'15'}:{operator:'<=',value:number},
      units:/mg\/l/i.test(r[0])?['mg/L']:/dry|dried|fat free|fat-free|solids/i.test(literal(k))?['mg/kg']:groups.volumePossible.has(id)?['mg/kg','mg/L']:['mg/kg']};
  }
  function lab(id,s={}){
    const m=s.panelLabMetal;
    if(!known(id)||!Object.hasOwn(names,m))return '';
    const d=forMetal(id,m,s),c=criterion(id,d);
    if(!c)return 'A comparison requires an applicable numeric article with the correct basis. Dehydrated milk under the milk row also needs a concentration-factor assessment.';
    const description=names[m]+' · '+rowText(c.key);
    if(!textValue(s,'panelLabNumber'))return description;
    if(!c.units.includes(s.panelLabUnit)||s.panelLabBasis!=='yes'||!textValue(s,'panelLabRef'))return 'Confirm the matching unit, matrix, analytical basis and laboratory report reference before comparing. '+description;
    const outcome=root.PMSVCatalogueWorksheets?.compare(c.spec,textValue(s,'panelLabNumber'));
    if(outcome===null||outcome===undefined)return 'Enter a non-negative decimal result in the matched unit. A qualified or below-quantification result needs separate interpretation.';
    return (outcome?'Within':'Outside')+' the cited '+names[m]+' criterion · '+s.panelLabNumber+' '+s.panelLabUnit+' · '+rowText(c.key)+' · Report '+textValue(s,'panelLabRef');
  }
  function controls(id,s={}){
    if(!known(id))return '';
    let extra='';
    if(groups.fpc.has(id))extra+='<label>FPC 18 eligibility'+pick('panelFpc',[['yes','Eligible finished FPC 18 sweet or snack; existing categories 01–14 checked'],['no','An existing product standard or a different category applies']],s)+'</label>'+supporting('panelFpc',s)+'<p>'+ref(direction+'#page=1','FPC 18 direction · paragraphs 3 and 4')+'</p>';
    if(groups.unidentified.has(id))extra+='<label>Exact supplied food-grade material and manufacturing function'+input('panelIdentity',s)+'</label>'+supporting('panelIdentity',s);
    const tin=profile(id,'Sn');
    if(!old.confectionery[id]&&!groups.alwaysCanned.has(id)&&['same','check','unidentified'].includes(tin.kind))
      extra+='<label>Canning of this finished article'+pick('panelContainer',[['can','Canned/sterilised as a canned food'],['other','Supplied without canning']],s)+'</label>'+supporting('panelContainer',s);
    const transitions=nextEdition(id);
    const current=ref(source+'#page=18','Original Gazette table, PDF pp. 18–28');
    return extra+'<details class="ws-section metal-evidence"><summary>Record a metal article and supporting evidence</summary><div data-panel-choices>'+choices(id,s)+'</div></details>'+
      '<details class="ws-section metal-analysis"><summary>Check a reported metal result</summary><p>Use the reported result on the named matrix and basis. Enter either a mass-based or volume-based result as appropriate. This check does not convert units, correct for moisture or adjust a milk concentration factor.</p>'+
      '<label>Metal'+pick('panelLabMetal',metals.map(([n,m])=>[m,n]),s,'Select a metal')+'</label><label>Reported result<input inputmode="decimal" data-ws-field="panelLabNumber" value="'+escape(s.panelLabNumber||'')+'"></label>'+
      '<label>Reported unit'+pick('panelLabUnit',[['mg/kg','mg/kg'],['mg/L','mg/L']],s,'Select the reported unit')+'</label><label class="ws-check"><input type="checkbox" data-ws-field="panelLabBasis"'+(s.panelLabBasis==='yes'?' checked':'')+'> The report matches the cited food, edible portion, mass or volume unit and analytical basis</label><label>Laboratory report or sample reference'+input('panelLabRef',s)+'</label><p data-panel-lab role="status">'+escape(lab(id,s))+'</p></details>'+
      '<details class="ws-section metal-lookup"><summary>Search the 382 published metal entries</summary><label>Metal<select data-panel-search-metal>'+metals.map(([n,m])=>'<option value="'+m+'">'+escape(n)+'</option>').join('')+'</select></label><label>Food, ingredient or basis<input type="search" data-panel-search placeholder="e.g. milk, dry matter or confectionery"></label><div data-panel-found>'+findRows('Pb','')+'</div>'+current+'</details>'+
      (transitions.length?'<details class="ws-section metal-change"><summary>Metal changes effective 1 December 2026</summary>'+transitions.map(t=>'<p>'+escape(t)+'</p>').join('')+ref(amendment+'#page=4','Amendment · PDF pp. 4–5')+'</details>':'')+
      (groups.foodChem.has(id)?'<p>CTR 2.1.1(1) also calls for metals specified in the relevant Indian Pharmacopoeia monograph for chemicals described there. Review its purity requirements for this ingredient.</p>':'');
  }
  function resetValue(node,s,k){
    s[k]='';const el=node.querySelector('[data-ws-field="'+k+'"]');
    if(el){if(el.type==='checkbox')el.checked=false;else el.value='';}
  }
  function update(node,id,k,s){
    const labFields=['panelLabMetal','panelLabNumber','panelLabUnit','panelLabBasis','panelLabRef'];
    if(reviewFields.includes(k)||k==='panelFpc'||k==='panelContainer')resetValue(node,s,k+'Ref');
    if(['metalForm','metalPack','panelFpc','panelIdentity','panelIdentityRef'].includes(k)){
      for(const f of reviewFields){s[f]='';s[f+'Ref']='';}
      if(k==='panelIdentity')resetValue(node,s,'panelIdentityRef');
    }
    if(k==='panelContainer'){s.panel_Sn='';s.panel_SnRef='';}
    if(!labFields.includes(k)||k==='panelLabMetal'){
      for(const f of labFields.slice(1))resetValue(node,s,f);
    }
    if(!labFields.includes(k)){
      node.querySelector('[data-metal-results]').innerHTML=renderRows(id,s);
      if(['metalForm','metalFormRef','metalPack','metalPackRef','panelFpc','panelFpcRef','panelIdentity','panelIdentityRef','panelContainer','panelContainerRef'].includes(k))node.querySelector('[data-panel-choices]').innerHTML=choices(id,s);
    }
    const result=node.querySelector('[data-panel-lab]');
    if(result)result.textContent=lab(id,s);
  }
  function columns(){return ['Metal headings with exact article or exclusion (of 11)','Additional metal headings with equal limits across eligible rows',...metals.map(([name])=>name+' · full CTR metal table'),'Current original metal source (all 382 rows)','Metal transition from 1 Dec 2026','Documented metal articles and references','Metal laboratory comparison'];}
  function values(id,s={}){
    const ds=panel(id,s);if(!ds.length)return [];
    const st=status(id,s),notes=nextEdition(id);
    const recorded=ds.filter(d=>d.proof).map(d=>d.name+' · '+compact(d));
    if(qualified(s,'panelContainer',['can','other']))recorded.unshift('Canning · '+s.panelContainer+' · '+evidence(s,'panelContainer'));
    if(textValue(s,'panelIdentity')&&evidence(s,'panelIdentity'))recorded.unshift(textValue(s,'panelIdentity')+' · '+evidence(s,'panelIdentity'));
    return [st.exact,st.common,...ds.map(compact),source+'#page=18',notes.length?notes.join(' ')+' '+amendment+'#page=4':'',recorded.join(' | '),lab(id,s)];
  }
  function brief(id,s={}){
    if(!known(id))return [];
    const st=status(id,s),notes=nextEdition(id);
    const details=[];
    if(textValue(s,'panelIdentity')&&evidence(s,'panelIdentity'))details.push('Supplied material · '+textValue(s,'panelIdentity')+' · '+evidence(s,'panelIdentity'));
    if(qualified(s,'panelContainer',['can','other']))details.push('Canning · '+s.panelContainer+' · '+evidence(s,'panelContainer'));
    if(qualified(s,'panelFpc',['yes','no']))details.push('FPC 18 eligibility · '+s.panelFpc+' · '+evidence(s,'panelFpc'));
    return [...details,'Complete metal table · '+st.exact+' of 11 exact headings · '+st.common+' additional common maxima',...panel(id,s).map(d=>d.name+' · '+compact(d)),
      'Original Gazette · '+source+'#page=18',...(notes.length?[...notes,amendment+'#page=4']:[]),...(lab(id,s)?['Metal result · '+lab(id,s)]:[])];
  }
  root.PMSVMetalPanel=Object.freeze({fields,metals,panel,forMetal,status,stats,limit,rowText,renderRows,controls,findRows,lab,update,brief,columns,values,nextEdition});
})(globalThis);
