/* Product-by-product scope of the three tables in FSSAI CTR 2.2.1. */
(function (root) {
  'use strict';
  const data=root.PMSVCropScopeData, docs=root.PMSVCatalogueEvidence?.documents;
  const catalogue=new Set(root.PMSVMetalScopeData?.catalogue);
  if(!data || !docs || catalogue.size!==533) return;
  const analytes=Object.keys(data.labels);
  const groups=Object.fromEntries(Object.entries(data.groups).map(([k,ids])=>[k,new Set(ids)]));
  const allRows={
    total:Array.from({length:10},(_,i)=>'C'+i),b1:Array.from({length:10},(_,i)=>'C'+(i+10)),
    m1:['C20','C21','C22'],ota:['C23'],pat:['C24','C25'],don:['C26'],
    agar:['N0','N1'],hcn:['N2','N3','N4','N5','N6','N14'],hyp:['N7'],saf:['N8','N9','N10','N11','N12','N13'],
    pcb:['F0','F1'],pah:['F2']
  };
  const selections={total:'af',b1:'af',m1:'milk',ota:'ochra',pat:'apple',don:'don',agar:'mushroom',hcn:'cyan',hyp:'hyper',saf:'saff',pcb:'fish',pah:'smoke'};
  const field=a=>'crop_'+selections[a];
  const fieldKeys=[...new Set(analytes.map(field).concat('crop_dec'))];
  const fields=fieldKeys.flatMap(k=>[k,k+'Ref']);
  const maps={
    m1:[['milk','milk'],['milkgrade','powder'],['milkflav','flavmilk'],['milksource','milkin']],
    ota:[['otadirect','och'],['graincheck','ochcheck'],['graininputs','ochinput'],['coffeeinputs','ochinput']],
    don:[['dondirect','deox'],['graincheck','doncheck'],['graininputs','doninput']],
    pat:[['fruitjuice','juice'],['appleinput','applein']],
    agar:[['alcohol','alagar'],['mushCheck','mush']],
    hcn:[['alcohol','alhcn'],['candy','candy'],['sago','sago'],['cannedstone','stonecan'],['fruitjuice','stonejuice'],['conf','conf'],['starch','starch']],
    hyp:[['alcohol','alhyp']],
    saf:[['alcohol','alsaf'],['meat','smeat'],['fish','sfish'],['soup','ssoup'],['sdrink','sdrink'],['sbevcheck','bevcheck'],['meatraw','meatcheck'],['fishother','fishcheck'],['soupother','soupcheck']],
    pcb:[['pcbshell','shell'],['pcb','habitat']],pah:[['smoketest','smokecheck']]
  };
  const afGroups=[['afcereal','cereal'],['afnut','nut'],['afareca','areca'],['afpulse','pulse'],['afspice','spice'],['afcomp','composite'],
    ['afgrains','grain'],['afoils','oilcheck'],['afnuts','nuts'],['afground','ground'],['afspices','spicecheck'],['afmouth','mouth'],['afplants','plant']];
  function routeFor(id,a){
    if(a==='total'||a==='b1'){
      const hit=afGroups.find(([g])=>groups[g].has(id));
      return hit?a+hit[1]:groups.afpure.has(id)?'':a+'recipe';
    }
    if(a==='pah'&&groups.smoked.has(id))return 'smoke';
    const hit=maps[a].find(([g])=>groups[g].has(id));
    if(hit)return hit[1];
    if(a==='saf'&&!groups.saffpure.has(id))return 'spair';
    if(a==='agar'&&!groups.afpure.has(id) && !afGroups.slice(0,5).some(([g])=>groups[g].has(id)) && !groups.saffpure.has(id))return 'mush';
    return '';
  }
  const note={
    total:'Compare the listed crop commodities and the ingredient-containing food entry.',b1:'Compare the listed crop commodities and the ingredient-containing food entry.',
    m1:'The three entries cover liquid milk, skimmed milk powder and whole milk powder.',ota:'Only wheat, wheat bran, rye, barley and coffee are named.',
    pat:'The entries name apple juice, including apple juice sampled as an ingredient of another beverage.',
    don:'Only wheat, wheat bran and barley are named.',agar:'The entries name foods containing mushrooms and alcoholic beverages.',
    hcn:'Check the specified confectionery, stone fruit, alcoholic beverage and sago/cassava articles.',hyp:'This table names alcoholic beverages.',
    saf:'Match the six food entries in force on 20 November 2026.',pcb:'The two entries name fish, crustaceans and molluscs. The sum covers PCB28, 52, 101, 138, 153 and 180.',
    pah:'This table names smoked fishery products.'
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function url(doc,page){return docs[doc].url.split('#')[0]+'#page='+page;}
  function refs(keys){
    const paths=new Map();
    for(const k of keys){
      const r=data.rows[k];
      paths.set(url(r.doc,r.page),docs[r.doc].date+' · PDF p. '+r.page);
    }
    return [...paths];
  }
  function rowText(k){
    const r=data.rows[k];
    return r.article+' · '+r.limit+' '+r.unit+(r.heading?' (group heading: Oilseeds or oil)':'');
  }
  function evidence(s,k){return typeof s[k+'Ref']==='string'?s[k+'Ref'].trim():'';}
  function decision(id,a,s={}){
    if(!catalogue.has(id)||!Object.hasOwn(data.labels,a))return null;
    const r=data.routes[routeFor(id,a)], k=field(a);
    if(!r)return {status:'Not named for stated identity',sample:'unmatched',rows:[],reason:note[a]+' No match identified for the catalogue article as described.',sources:allRows[a],choices:[]};
    if(r.mode==='named')return {status:'Named finished article',sample:'finished',rows:r.rows,reason:r.reason,sources:r.rows,choices:[]};
    const opt=r.options.find(o=>o.value===s[k]),proof=evidence(s,k);
    const sources=[...new Set(r.options.flatMap(o=>o.rows))];
    if(opt&&proof)return {status:{finished:'Documented finished article',ingredient:'Documented ingredient sample',outside:'Documented outside these rows'}[opt.sample],
      sample:opt.sample,rows:opt.rows,reason:opt.label+' · '+proof,sources:opt.rows.length?opt.rows:sources,choices:r.options};
    return {status:opt?'Awaiting evidence reference':'Check article or recipe',sample:'unresolved',rows:[],reason:r.reason,sources,choices:r.options};
  }
  function decisions(id,s={}){return catalogue.has(id)?analytes.map(a=>({key:a,name:data.labels[a],...decision(id,a,s)})):[];}
  function positive(id){return decisions(id).filter(d=>d.sample==='finished');}
  function referenceLinks(keys){return refs(keys).map(([u,t])=>'<a class="source-ref" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(t)+'</a>').join(' ');}
  function limitText(d){return d.rows.map(rowText).join(' / ');}
  function itemText(d){return [d.status,limitText(d),d.reason].filter(Boolean).join(' · ');}
  function resultCell(d){
    const label=d.sample==='ingredient'?'Input sample only · ':'';
    return '<strong>'+esc(d.status)+'</strong>'+(d.rows.length?'<br>'+esc(label+limitText(d)):'')+'<br>'+esc(d.reason);
  }
  const futureOptions=[{value:'contains',label:'Mace or nutmeg kernel is an ingredient of the beverage or food'},
    {value:'absent',label:'Neither ingredient is used in the beverage or food'}];
  const futureSource=()=>url('ctr-1',5);
  function future(s={}){
    const v=futureOptions.find(o=>o.value===s.crop_dec),proof=evidence(s,'crop_dec');
    if(!v||!proof)return 'Check the ingredient list for mace and/or nutmeg kernel against the replacement entry. A prior food-category match alone does not carry forward.';
    return (v.value==='contains'?'Documented future article · Saffrole 10 ppm':'Neither specified ingredient documented · no match to the replacement entry on this formulation')+' · '+proof;
  }
  function cross(id){
    const notes=[];
    const identity=data.identity[id];
    if(identity)notes.push({text:identity[2],doc:identity[0],p:identity[1]});
    if(groups.fpc.has(id))notes.push({text:'For an Indian sweet or snack under the FPC 18 direction, confirm eligibility and the individual base foods for toxins and residues. Record those alongside any proposed finished-food match.',doc:'profile-special-regulatory-routes-1',p:1});
    if(groups.bean.has(id))notes.push({text:'Separate product standard 2.3.48 names dry kidney-shaped or flattened leguminous seeds used whole or as dal. For beans meeting that definition the hydrocyanic acid maximum is 20 ppm on the stated AOAC maceration basis. Check the species and marketed article.',doc:'chapter-4',p:73});
    if(groups.wheat.has(id))notes.push({text:'The wheat product standard also lists DON at a maximum of 1,000 µg/kg.',doc:'chapter-5',p:9});
    return notes;
  }
  function documented(id,s){
    const selected=decisions(id,s).filter(d=>['Documented finished article','Documented ingredient sample','Documented outside these rows'].includes(d.status));
    const result=selected.map(d=>d.name+' · '+itemText(d));
    if(futureOptions.some(o=>o.value===s.crop_dec)&&evidence(s,'crop_dec'))result.push('From 1 December 2026 · '+future(s));
    return result.join(' | ');
  }
  function control(k,label,opts,s){
    return '<div class="crop-control"><label>'+esc(label)+'<select data-ws-field="'+k+'"><option value="">Select the documented article</option>'+
      opts.map(o=>'<option value="'+esc(o.value)+'"'+(s[k]===o.value?' selected':'')+'>'+esc(o.label)+'</option>').join('')+
      '</select></label> <label>Supporting recipe, specification or sample reference<input maxlength="320" data-ws-field="'+k+'Ref" value="'+esc(s[k+'Ref'])+'"></label></div>';
  }
  function futureNote(id){
    return (groups.afoils.has(id)?' The revised wording explicitly covers oils, oilseeds for further processing and ready-to-eat oilseeds. The total-aflatoxins and B1 maxima for those rows stay at 15 and 10 µg/kg respectively.':'');
  }
  function markup(id,s={}){
    if(!catalogue.has(id))return '';
    const ds=decisions(id,s),seen=new Set(),controlList=[];
    for(const d of ds){
      const k=field(d.key);
      if(!d.choices.length||seen.has(k))continue;
      seen.add(k);
      controlList.push(control(k,d.key==='total'?'Total aflatoxins and B1':d.name,d.choices,s));
    }
    const published=[...new Set(decisions(id).flatMap(d=>d.sources))];
    const catalogueName=root.PMSVCatalogueRules?.products[id]?.name||'selected food';
    return '<details class="ws-section crop-scope"><summary>Crop contaminants, natural toxins and fish contaminants</summary><div>'+
      '<p>FSSAI CTR 2.2.1 · 20 November 2026 · '+esc(catalogueName)+'. Each limit belongs to the article and sample shown. A recipe or supplier reference can establish an article match. A laboratory result is a separate check.</p>'+
      '<div class="ws-scroll"><table><thead><tr><th>Analyte</th><th>Finished article or input sample</th><th>Gazette</th></tr></thead><tbody>'+
      ds.map(d=>'<tr><th scope="row">'+esc(d.name)+'</th><td data-crop-result="'+d.key+'">'+resultCell(d)+'</td><td data-crop-source="'+d.key+'">'+referenceLinks(d.sources)+'</td></tr>').join('')+'</tbody></table></div>'+
      (controlList.length?'<details class="ws-section crop-inputs"><summary>Document article and ingredient decisions</summary>'+controlList.join('')+'</details>':'')+
      '<details class="ws-section"><summary>Published commodity rows and limits</summary><ul>'+published.map(k=>'<li>'+esc(data.labels[analytes.find(a=>allRows[a].includes(k))]+' · '+rowText(k))+' '+referenceLinks([k])+'</li>').join('')+'</ul></details>'+
      cross(id).map(n=>'<p>'+esc(n.text)+' <a class="source-ref" href="'+esc(url(n.doc,n.p))+'" target="_blank" rel="noopener noreferrer">Product standard · PDF p. '+n.p+'</a></p>').join('')+
      '<p>Food product standards also prohibit adding saffrole or isosaffrole as flavouring agents. The natural-occurrence maximum serves a different purpose. <a class="source-ref" href="'+esc(url('chapter-18',90))+'" target="_blank" rel="noopener noreferrer">Flavouring restrictions · PDF p. 90</a></p>'+
      '<details class="ws-section crop-future"><summary>Change effective 1 December 2026</summary><p>The six current saffrole entries are replaced by one 10 ppm entry for beverages and foods containing mace and/or nutmeg kernel as an ingredient.'+esc(futureNote(id))+' <a class="source-ref" href="'+esc(futureSource())+'" target="_blank" rel="noopener noreferrer">Amendment · PDF p. 5</a></p>'+
      control('crop_dec','Future saffrole article',futureOptions,s)+'<p data-crop-future role="status">'+esc(future(s))+'</p></details></div></details>';
  }
  function update(node,id,k,s){
    if(!fields.includes(k))return;
    if(fieldKeys.includes(k)){
      s[k+'Ref']='';
      const input=node.querySelector('[data-ws-field="'+k+'Ref"]');
      if(input)input.value='';
    }
    if(k==='crop_dec'||k==='crop_decRef'){
      node.querySelector('[data-crop-future]').textContent=future(s);
      return;
    }
    for(const a of analytes){
      if(k!==field(a)&&k!==field(a)+'Ref')continue;
      const d=decision(id,a,s);
      node.querySelector('[data-crop-result="'+a+'"]').innerHTML=resultCell(d);
      node.querySelector('[data-crop-source="'+a+'"]').innerHTML=referenceLinks(d.sources);
    }
  }
  function brief(id,s={}){
    if(!catalogue.has(id))return [];
    return ['FSSAI CTR 2.2.1 · assessment edition 20 November 2026',...decisions(id,s).map(d=>d.name+' · '+itemText(d)+' · '+refs(d.sources).map(x=>x[0]).join(' ')),
      ...cross(id).map(n=>n.text+' · '+url(n.doc,n.p)),'From 1 December 2026 · '+future(s)+futureNote(id)+' · '+futureSource()];
  }
  function columns(){return [...analytes.map(a=>data.labels[a]+' · CTR 2.2.1'), 'Named finished-article limits in CTR 2.2.1','Original Gazette references for CTR 2.2.1','Additional product-standard cross-check','From 1 Dec 2026 · saffrole and applicable oil entries','Documented CTR 2.2.1 scope and evidence'];}
  function values(id,s={}){
    const ds=decisions(id,s);
    if(!ds.length)return [];
    const sources=[...new Set(ds.flatMap(d=>refs(d.sources).map(([u])=>u)))];
    return [...ds.map(itemText),positive(id).map(d=>d.name).join(' | '),sources.join(' | '),cross(id).map(n=>n.text+' '+url(n.doc,n.p)).join(' | '),
      future(s)+futureNote(id)+' '+futureSource(),documented(id,s)];
  }
  function stats(){
    let namedProducts=0,priorityNamed=0,namedDecisions=0;
    for(const id of catalogue){
      const n=positive(id).length;
      if(!n)continue;
      namedDecisions+=n;namedProducts++;
      if(!root.PMSVCatalogueEvidence.products[id].directCTR)priorityNamed++;
    }
    return {products:catalogue.size,analytes:analytes.length,sourceRows:Object.keys(data.rows).length,namedProducts,priorityNamed,namedDecisions};
  }
  root.PMSVCropScope=Object.freeze({fields,decisions,decision,positive,stats,markup,brief,columns,values,update,future});
})(globalThis);
