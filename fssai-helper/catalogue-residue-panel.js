/* Source decisions for single spices and per-sample pesticide report lines. */
(function(root){
  'use strict';
  const database=root.PMSV_REVIEW_REGISTER?.pesticideReview, X=root.PMSVPesticides, products=root.PMSVCatalogueRules?.products;
  if(!database||!X||!products) return;
  const sources={
    order:database.sources.spice+'#page=1',gazette:database.sources.gazette,processing:database.sources.scope+'#page=1',
    registration:'https://ppqs.gov.in/divisions/cib-rc/registered-products',
    codex:'https://codex.fao.org/codex-texts/codex-online-databases/pesticides-residues',
    hierarchy:'https://codex.fao.org/codex-texts/codex-online-databases/pesticides-residues/commodity-categories',
    restrictions:'https://sansad.in/getFile/annex/267/AU2425_WnccM8.pdf?source=pqars',
    eto:'https://fssai.gov.in/upload/uploadfiles/files/43rd%20FA%20Minutes.pdf#page=8'
  };
  const clean=v=>typeof v==='string'?v.trim():'';
  const norm=v=>clean(v).toLowerCase().replace(/\s+/g,' ');
  const fold=v=>norm(v).replace(/[^a-z0-9]+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const link=(url,label)=>'<a class="source-ref" target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(label)+'</a>';
  const roleLabel={product:'Marketed product',ingredient:'Separately sampled ingredient'};
  const processLabel={raw:'Raw single commodity',physical:'Physical processing only',other:'Heat, chemical treatment, mixture or unresolved process',tea:'Plain tea under the cited direction',thermal:'Thermal or chemical processing',unknown:'Process under review'};
  const targets=new Map(), articles=new Map();
  // These commodity codes are lookup aids. An adopted CXL must also cover the
  // sample form and residue definition. Additional plausible Indian wordings
  // trigger a source hold when they cannot be resolved by the named-row tool.
  function article(key,label,suffix,codes='',matrix='',check=[]) {
    articles.set(key,{key,label,codes,matrix,check});
    for(const suffixId of suffix.split('|')){
      const id=/^\d{2}-/.test(suffixId)?suffixId:'12-12-2-'+suffixId;
      if(!Object.hasOwn(products,id)) throw new Error('Unknown spice product '+id);
      if(!targets.has(id)) targets.set(id,[]);
      targets.get(id).push(key);
    }
  }
  article('caraway','Caraway seed','caraway-siahjira','HS 0774, HS 0190');
  article('cardamom','Cardamom','cardamom-elaichi','HS 0775','cardamom');
  article('dryChilli','Dried chilli','chillies-and-capsicum-lal-mirchi','HS 0444','dryChilli',['Chilli','Chilly','Pepper']);
  article('cinnamon','Cinnamon bark','cinnamon-dalchini','HS 0777');
  article('cassia','Cassia bark','cassia-taj','HS 4775, HS 0777');
  article('clove','Clove buds','cloves-laung','HS 0778');
  article('coriander','Coriander seed','coriander-dhania','HS 0779, HS 0190');
  article('cumin','Cumin seed (Cuminum cyminum)','cumin-zeera-kalonji','HS 0780, HS 0190','cumin');
  article('fennel','Fennel seed','fennel-saunf','HS 0731, HS 0190');
  article('fenugreek','Fenugreek seed','fenugreek-methi','HS 0782, HS 0190');
  article('ginger','Dried ginger rhizome','dried-ginger-sonth-dried-adrak','DV 0784, HS 0784, HS 0193');
  article('mace','Mace aril','mace-jaipatri','HS 0788');
  article('mustard','Mustard seed used as a spice','mustard-rai-sarson','SO 0090','mustard',['Mustard seed or Mustard Oil','Oil seeds','Oilseeds','Oil seeds except groundnut']);
  article('nutmeg','Nutmeg','nutmeg-jaiphal','HS 0789');
  article('pepper','Black pepper','black-white-and-green-bwg-peppers','HS 0790, HS 0191','pepper',['Pepper']);
  article('whitePepper','White pepper','black-white-and-green-bwg-peppers','HS 0790, HS 0191','',['Pepper']);
  article('poppy','Poppy seed used as a spice','poppy-khas-khas','','',['Oil seeds','Oilseeds','Oil seeds except groundnut']);
  article('saffron','Saffron stigmas','saffron-kesar');
  article('turmeric','Turmeric rhizome','turmeric-haldi','HS 0794, HS 0193','turmeric');
  article('anise','Anise seed','aniseed-saunf','HS 0771, HS 4773, HS 0190');
  article('ajowan','Ajowan seed','ajowan-bishops-seed','HS 0190');
  article('celery','Celery seed','celery','HS 0624, HS 0190');
  article('tejpat','Tejpat leaf (Cinnamomum tamala)','tejpat');
  article('starAnise','Star anise fruit','star-anise');
  article('oregano','Dried oregano leaves','dried-oregano','DH 5271, DH 0170');
  article('pimento','Pimento or allspice fruit','pimento-or-allspice','HS 0792, HS 4769, HS 0191');
  article('bay','Dried bay leaf (Laurus nobilis)','dried-laurel-or-dried-bay-leaf','DH 0723, DH 0170');
  article('mint','Dried mint leaves','dried-mint','DH 0738, DH 0170','',['Mentha']);
  article('rosemary','Dried rosemary leaves','dried-rosemary','DH 0741, DH 0170');
  article('thyme','Dried thyme','dried-thyme','DH 0750, DH 0170');
  article('sage','Dried sage','dried-sage','DH 0743, DH 0170');
  article('basil','Dried sweet basil leaves','dried-sweet-basil-leaves','DH 0722, DH 0170');
  article('marjoram','Dried sweet marjoram','dried-sweet-marjoram','DH 0736, DH 0170');
  article('parsley','Dried parsley leaves','dried-parsley','DH 0170');
  article('tarragon','Dried tarragon','dehydrated-tarragon','DH 0170');
  article('vanilla','Vanilla bean or cut pod','04-04-1-vanilla-pods|04-04-1-cut-vanilla','HS 0795');
  const bySerial=new Map(database.groups.map(g=>[String(g.serial),g]));
  const aliases=new Map();
  for(const g of database.groups){
    for(const spelling of [g.printed,g.name]){
      const first=spelling.split(/[([]/)[0];
      for(const part of [spelling,first]) if(fold(part)) aliases.set(fold(part),g.serial);
    }
  }
  // The 21 March 2025 parliamentary annex is an alert for fallback review,
  // distinct from a residue tolerance. Reviewers must check later restrictions.
  const restrictedNames=('alachlor|aldicarb|aldrin|benzene hexachloride|benomyl|calcium cyanide|carbaryl|chlorbenzilate|chlordane|chlorofenvinphos|chlorfenvinphos|copper acetoarsenite|diazinon|dibromochloropropane|dbcp|dichlorovos|dichlorvos|dieldrin|endosulfron|endosulfan|endrin|ethyl mercury chloride|ethyl parathion|ethylene dibromide|edb|fenarimol|fenthion|heptachlor|lindane|gamma hch|linuron|maleic hydrazide|menazon|methoxy ethyl mercury chloride|methyl parathion|metoxuron|nitrofen|paraquat dimethyl sulphate|pentachloro nitrobenzene|pcnb|pentachlorophenol|phenyl mercury acetate|phorate|phosphamidon|sodium cyanide|sodium methane arsonate|tetradifon|thiometon|toxaphene|camphechlor|triazophos|tridemorph|trichloro acetic acid|trichlorfon|dicofol|dinocap|methomyl').split('|');
  const otherFoods=new Set(['sugarcane','potato','tomato','maize','wheat','milk and milk products','mango','rice','cabbage','grapes','soyabean','okra','groundnut','apple','banana','cottonseed']);
  const labFields=['spReport','spKind','spValue','spUnit','spLoq','spBasis'];
  const codexFields=['spCodex','spCodexRef','spLimit','spMark'];
  const registrationFields=['spReg','spRegRef','spOtherFood','spOtherRef',...codexFields];
  const indiaFields=['spIndia','spIndiaRef','spDate',...registrationFields];
  const fields=['spRole','spArticle','spProcess','spSample','spAnalyte','spOther','spNamedRow',...indiaFields,...labFields];
  function context(id,s={}) {
    if(!Object.hasOwn(products,id)) return null;
    const choices=targets.get(id)||[];
    const role=s.spRole||(choices.length?'product':'ingredient');
    const allowed=role==='ingredient'?[...articles.keys()]:role==='product'?choices:[];
    const a=allowed.includes(s.spArticle)?articles.get(s.spArticle):null;
    const g=bySerial.get(s.spAnalyte);
    const other=s.spAnalyte==='other'?clean(s.spOther):'';
    const analyte=g?.printed||other;
    const mapped=a?.matrix?X.current(id,{pestRole:'ingredient',pestMatrix:a.matrix}).options.filter(r=>r.serial===g?.serial):[];
    const flagged=a&&g?g.rows.filter(r=>a.check.some(t=>norm(t)===norm(r[0]))):[];
    const otherRow=g&&!database.nameHolds.includes(g.serial)?g.rows.find(r=>otherFoods.has(norm(r[0]))&&/^\d+(\.\d+)?\*?$/.test(r[1])):null;
    return {role,allowed,a,g,other,analyte,mapped,flagged,otherRow};
  }
  const pending=text=>({kind:'pending',text,limit:''});
  const pairs=Object.entries;
  const choose=(s,k,label,items,blank='Choose')=>'<label>'+esc(label)+'<select data-ws-field="'+k+'">'+
    (blank?'<option value="">'+esc(blank)+'</option>':'')+items.map(([v,label])=>'<option value="'+esc(v)+'"'+(s[k]===v?' selected':'')+'>'+esc(label)+'</option>').join('')+'</select></label>';
  const field=(s,k,label,type='text')=>'<label>'+esc(label)+'<input data-ws-field="'+k+'" type="'+(type==='date'?'date':'text')+'"'+(type==='decimal'?' inputmode="decimal"':'')+' maxlength="'+(type==='decimal'?'50':'320')+'" value="'+esc(s[k])+'"></label>';
  function isDate(v){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(v||'')||v<'2024-04-08')return false;
    const when=new Date(v+'T00:00:00Z'),now=new Date();
    const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
    return Number.isFinite(when.valueOf())&&when.toISOString().slice(0,10)===v&&v<=today;
  }
  function decide(id,s={}) {
    const c=context(id,s);
    if(!c?.a) return pending('Select the single spice or culinary herb that was sampled.');
    if(!c.analyte) return pending('Identify the reported pesticide and residue definition.');
    if(c.other) {
      const name=fold(c.other);
      if(!name)return pending('Enter the pesticide identity and residue definition as reported.');
      if(/\b(ethylene oxide|ethyleneoxide|oxirane|eto|eo|75 21 8|2 chloroethanol|2 chloro ethanol|2ce|2 ce|ethylene chlorohydrin|107 07 3)\b/.test(name))
        return pending('Ethylene oxide and its marker require a specific review. See FSSAI Food Authority meeting 43, item 3.3.');
      const alias=aliases.get(name);
      if(alias) return pending('Select FSSAI serial '+alias+' from the pesticide list to check its Indian entries.');
      if(/dithiocarbamat|mancozeb|metiram|\b(zineb|maneb)\b/.test(name))return pending('Use the dithiocarbamate heading and verify the subgroup and residue expression.');
    }
    if(!['raw','physical'].includes(s.spProcess)) return pending('Confirm a raw or solely physically processed single spice for this decision.');
    if(c.mapped.length) {
      const row=c.mapped.length===1?c.mapped[0]:c.mapped.find(r=>r.key===s.spNamedRow);
      return {kind:'domestic',text:'An Indian entry names this article. Use the Gazette row and its printed conditions.',
        limit:row&&row.limit!=='$'?row.limit:'',url:row?.url||sources.gazette,rows:c.mapped,row};
    }
    if(c.flagged.length) return pending('Review the possible Indian article '+c.flagged.map(r=>r[0]+' (p. '+r[2]+')').join(', ')+'. The broader or alternative wording needs an article decision.');
    if(c.g&&database.nameHolds.includes(c.g.serial)) return pending('The printed and compendium pesticide names differ. Reconcile the residue identity first.');
    if(c.g?.serial===64||c.g?.rows.some(r=>r[1]==='$'))return pending('Use the special residue definition or copper cross-reference and verify the commodity-specific provision.');
    if(restrictedNames.some(n=>(' '+fold(c.analyte)+' ').includes(' '+n+' ')))return pending('This pesticide appears in a government restriction record. Reconcile current restrictions and the relevant residue provision.');
    if(s.spIndia==='named') return pending('Use the applicable Indian entry or specific direction cited in the review.');
    if(s.spIndia!=='none'||!clean(s.spIndiaRef)||!isDate(s.spDate)) return pending('Record a dated check of Indian entries, commodity groups, exclusions and specific directions.');
    if(s.spReg==='restricted')return pending('A reported prohibition, restriction or conflicting direction needs a separate source decision.');
    if(!['registered','unregistered'].includes(s.spReg)||!clean(s.spRegRef))return pending('Record the CIB&RC registration status and its dated evidence. An unsuccessful search is inconclusive.');
    if(s.spReg==='unregistered')return {kind:'unregistered',limit:'0.1',text:'Paragraph 1(c) · documented unregistered pesticide',url:sources.order};
    if(!c.otherRow&&(s.spOtherFood!=='yes'||!clean(s.spOtherRef)))return pending('Document an FSSAI MRL for another food under paragraph 1(b). The registered-pesticide route is unresolved.');
    if(!clean(s.spCodexRef)||!['none','adopted'].includes(s.spCodex))return pending('Check the adopted Codex records for the commodity, subgroup and group. Record the result and reference.');
    if(s.spCodex==='none') return {kind:'codexAbsent',limit:'0.1',text:'Paragraph 1(b) · documented absence of an applicable Codex MRL',url:sources.order};
    if(!['numeric','star'].includes(s.spMark)||root.PMSVCatalogueWorksheets?.compare({operator:'>',value:'0'},clean(s.spLimit))!==true) return pending('Enter the adopted Codex MRL in mg/kg and its printed qualifier.');
    return {kind:'codex',limit:clean(s.spLimit)+(s.spMark==='star'?'*':''),text:'Paragraph 1(b) · reviewer-entered adopted Codex MRL',url:sources.codex};
  }
  function evidence(c,s) {
    const items=['Checked '+s.spDate,'India: '+clean(s.spIndiaRef),'CIB&RC '+s.spReg+': '+clean(s.spRegRef)];
    if(s.spReg==='registered'){
      items.push(c.otherRow?'Other Indian MRL: '+c.otherRow[0]+' '+c.otherRow[1]+' mg/kg '+sources.gazette+'#page='+c.otherRow[2]:'Other Indian MRL: '+clean(s.spOtherRef));
      items.push('Codex '+s.spCodex+': '+clean(s.spCodexRef));
    }
    return items.join(' | ');
  }
  function domesticInput(c,d,s){
    return {pestRole:c.role,pestMatrix:c.a.matrix,pestProcess:s.spProcess,pestSample:s.spSample,pestRow:d.row?.key||'',
      pestReport:s.spReport,pestKind:s.spKind,pestValue:s.spValue,pestUnit:s.spUnit,pestLoq:s.spLoq,pestBasis:s.spBasis};
  }
  function spiceComparison(id,s) {
    const d=decide(id,s);
    if(d.kind==='domestic'&&d.row) return X.comparison(id,domesticInput(context(id,s),d,s));
    if(!d.limit) return {kind:'hold',text:d.text};
    if(!clean(s.spSample)||!clean(s.spReport)||s.spBasis!=='yes'||s.spUnit!=='mg/kg')
      return {kind:'hold',text:'Confirm the sample, report, mg/kg unit, residue definition, plant part and source basis.'};
    return X.reading(d.limit,{pestKind:s.spKind,pestValue:s.spValue,pestLoq:s.spLoq});
  }
  function labControls(s){
    return field(s,'spReport','Spice laboratory report reference')+
        choose(s,'spKind','Reported result type',[['quantified','Quantified'],['less','Less than the reporting threshold']])+
        field(s,'spValue','Result or reporting threshold','decimal')+choose(s,'spUnit','Spice report unit',[['mg/kg','mg/kg'],['other','Other unit']])+
        field(s,'spLoq','Method LOQ in mg/kg when applicable','decimal')+
        '<label class="ws-check"><input type="checkbox" data-ws-field="spBasis"'+(s.spBasis==='yes'?' checked':'')+'> I matched the plant part, process, residue definition, analytical basis and current source conditions.</label>'+
        '<button type="button" data-residue-save="spice">Save spice result to the panel</button>';
  }
  function spiceForm(id,s) {
    const c=context(id,s);
    const roles=targets.has(id)?pairs(roleLabel):[['ingredient',roleLabel.ingredient]];
    let html=choose({...s,spRole:c.role},'spRole','Spice sample being assessed',roles,'')+
      choose(s,'spArticle','Single spice or culinary herb',c.allowed.map(k=>[k,articles.get(k).label]));
    if(!c.a) return html;
    html+='<p>'+esc(c.a.codes?'Codex lookup codes · '+c.a.codes+'. Check the exact form, subgroup and group.':'Search Codex using the exact plant part, form, subgroup and group.')+' '+link(sources.hierarchy,'Codex commodities')+'</p>'+
      choose(s,'spProcess','Spice processing route',['raw','physical','other'].map(k=>[k,processLabel[k]]))+
      field(s,'spSample','Spice lot or sample and process reference')+
      choose(s,'spAnalyte','Reported pesticide',[[ 'other','Other pesticide or marker'],...database.groups.map(g=>[String(g.serial),g.serial+' · '+g.printed])]);
    if(s.spAnalyte==='other')html+=field(s,'spOther','Other pesticide or marker name');
    if(!s.spAnalyte) return html;
    if(c.mapped.length){
      html+='<ul>'+c.mapped.map(r=>'<li>'+esc(r.drug+' · '+r.article+' · '+(r.limit==='$'?'see copper':r.limit+' mg/kg'))+' '+link(r.url,'Gazette p. '+r.page)+'</li>').join('')+'</ul>';
      if(c.mapped.length>1)html+=choose(s,'spNamedRow','Named Indian residue row',c.mapped.map(r=>[r.key,r.article+' · '+r.limit+' · '+(r.subgroup||r.key)]));
      return html+labControls(s);
    }
    if(c.flagged.length) return html+'<p>'+c.flagged.map(r=>link(sources.gazette+'#page='+r[2],r[0]+' · p. '+r[2])).join(' · ')+'</p>';
    html+=choose(s,'spIndia','Indian legal sources for this pesticide and spice',[['named','An Indian entry or special direction applies'],['none','Checked all relevant Indian entries and directions, no applicable limit found'],['unknown','Still checking']]);
    if(s.spIndia==='none'||s.spIndia==='named')html+=field(s,'spIndiaRef','Indian source, article or search record')+field(s,'spDate','Date of source review','date');
    if(s.spIndia!=='none')return html;
    html+=choose(s,'spReg','CIB&RC status for this pesticide',[['registered','Registered in India'],['unregistered','Confirmed unregistered'],['restricted','Restriction, prohibition or conflicting direction'],['unknown','Unknown or search incomplete']])+
      link(sources.registration,'CIB&RC registration records')+' · '+link(sources.restrictions,'Government restriction record');
    if(['registered','unregistered','restricted'].includes(s.spReg))html+=field(s,'spRegRef','CIB&RC decision or dated registration evidence');
    if(s.spReg==='registered'){
      if(c.otherRow) html+='<p>Other Indian food entry · '+esc(c.otherRow[0]+' · '+c.otherRow[1]+' mg/kg')+' '+link(sources.gazette+'#page='+c.otherRow[2],'Gazette p. '+c.otherRow[2])+'</p>';
      else {
        html+=choose(s,'spOtherFood','FSSAI MRL for another food',[['yes','Established for this pesticide'],['unknown','Absent or unresolved']]);
        if(s.spOtherFood==='yes')html+=field(s,'spOtherRef','Other food, Indian MRL and source provision');
      }
      if(c.otherRow||s.spOtherFood==='yes'){
        html+=choose(s,'spCodex','Codex commodity, subgroup and group search',[['adopted','Applicable adopted MRL located'],['none','Completed search found no applicable MRL'],['unknown','Scope, adoption or residue definition unresolved']])+link(sources.codex,'Codex pesticide database');
        if(['adopted','none'].includes(s.spCodex))html+=field(s,'spCodexRef','Codex record or dated search reference, including codes and residue definition');
        if(s.spCodex==='adopted')html+=field(s,'spLimit','Adopted Codex value in mg/kg','decimal')+
          choose(s,'spMark','Qualifier on the adopted Codex MRL',[['numeric','Ordinary numeric MRL'],['star','MRL at the quantification limit']]);
      }
    }
    if(s.spReg==='unregistered'||(s.spReg==='registered'&&['adopted','none'].includes(s.spCodex))){
      html+=labControls(s);
    }
    return html;
  }
  function decisionText(id,s) {
    const d=decide(id,s);
    if(d.kind==='domestic')return d.text+(d.row?' '+spiceComparison(id,s).text:' Select the printed row.');
    if(!d.limit) return d.text;
    const r=spiceComparison(id,s);
    return d.text+' · '+d.limit+' mg/kg. '+r.text;
  }
  function snapshot(id,s,mode) {
    let row,role,matrixKey,matrix,analyteKey,analyte,limit,source,reference,sample,report,process,reading,kind,value,loq,basis;
    if(mode==='gazette'){
      const c=X.current(id,s);reading=X.comparison(id,s);
      if(!c?.row||reading.kind==='hold')return {error:reading.text||'Complete a source-row result first.'};
      ({row,role}=c);matrixKey=c.matrix;matrix=X.matrixName(matrixKey);
      analyteKey='fssai-'+row.serial;analyte=row.drug;source=row.url;limit=row.limit;
      sample=clean(s.pestSample);report=clean(s.pestReport);process=processLabel[s.pestProcess];
      kind=s.pestKind;value=clean(s.pestValue);loq=clean(s.pestLoq);
      basis=['Matched unit, residue definition and sample basis',row.condition,row.subgroup,s.pestPortion].filter(Boolean).join(' · ');
      reference=(row.source==='gazette'?'FSSAI Gazette':'FSSAI tea direction')+' · '+row.article+' · '+row.key;
    }else if(mode==='spice'){
      const c=context(id,s),d=decide(id,s);reading=spiceComparison(id,s);
      if(reading.kind==='hold')return {error:reading.text};
      if(d.kind==='domestic') {
        const result=snapshot(id,domesticInput(c,d,s),'gazette');
        if(result.record) result.record.reference+=' · Spice order paragraph 1(a)';
        return result;
      }
      role=c.role;matrixKey=c.a.matrix||'spice-'+c.a.key;matrix=c.a.label;
      analyteKey=c.g?'fssai-'+c.g.serial:'reported-'+fold(c.analyte);analyte=c.analyte;
      limit=d.limit;source=d.url+(d.kind==='codex'?' | '+sources.order:'');sample=clean(s.spSample);report=clean(s.spReport);process=processLabel[s.spProcess];
      kind=s.spKind;value=clean(s.spValue);loq=clean(s.spLoq);basis='Matched spice form, process, residue definition and analytical basis';
      reference=d.text+' | '+evidence(c,s);
    }else return {error:'Choose a source result.'};
    const record={version:1,role,matrixKey,matrix,analyteKey,analyte,sample,report,process,
      result:(kind==='less'?'< ':'')+value,unit:'mg/kg',loq,basis,limit,source,reference,decision:reading.text,outcome:reading.kind};
    return {record};
  }

  // Store each report line independently so saving another sample or another
  // worksheet field cannot overwrite other panel lines, including in a second tab.
  const prefix='pmsv-fssai-pesticide-panel-r100:';
  const cache=new Map();
  let loaded=false;
  const recordKey=(id,r)=>prefix+JSON.stringify([id,r.role,r.matrixKey,r.sample,r.report,r.analyteKey]);
  function applyStored(key,value) {
    if(!key?.startsWith(prefix))return '';
    try{
      const parts=JSON.parse(key.slice(prefix.length)),id=parts[0];
      if(!Array.isArray(parts)||parts.length!==6||!Object.hasOwn(products,id))return '';
      if(value===null){cache.get(id)?.delete(key);return id;}
      const r=JSON.parse(value);
      const required=['matrixKey','matrix','analyteKey','analyte','sample','report','process','result','limit','source','reference','basis','decision'];
      if(r.version!==1||!Object.hasOwn(roleLabel,r.role)||r.unit!=='mg/kg'||!['above','within','inconclusive'].includes(r.outcome)||
        required.some(k=>!clean(r[k]))||typeof r.loq!=='string'||recordKey(id,r)!==key)return '';
      if(!cache.has(id))cache.set(id,new Map());
      cache.get(id).set(key,r);return id;
    }catch(_){return '';}
  }
  function readStored(){
    if(loaded)return;loaded=true;
    try{const storage=root.localStorage;for(let i=0;storage&&i<storage.length;i++){
      const key=storage.key(i);if(key?.startsWith(prefix))applyStored(key,storage.getItem(key));
    }}catch(_){}
  }
  function records(id){
    readStored();
    return [...(cache.get(id)||[])].sort(([a],[b])=>a<b?-1:a>b?1:0);
  }
  function save(id,s,mode) {
    if(!Object.hasOwn(products,id))return 'Unknown product.';
    const {record:r,error}=snapshot(id,s,mode);
    if(!r)return error;
    readStored();
    const key=recordKey(id,r),json=JSON.stringify(r);
    const previous=cache.get(id)?.get(key);
    let persisted=true;
    try{root.localStorage.setItem(key,json);}catch(_){persisted=false;}
    applyStored(key,json);
    if(!persisted)return 'Kept for this session. Export the panel to retain this result.';
    if(previous&&JSON.stringify(previous)===json)return 'This result is already saved.';
    return previous?'Updated the matching sample, report and pesticide.':'Saved this pesticide result on this device.';
  }
  function remove(id,key) {
    readStored();
    if(!cache.get(id)?.has(key))return 'This result is no longer in the panel.';
    try{root.localStorage?.removeItem(key);}catch(_){return 'Device storage is unavailable. The result is still in the panel.';}
    applyStored(key,null);return 'Removed this result.';
  }
  const columns=['Single-spice sample choices','Codex commodity lookup codes for the marketed spice','Spice order and lookup sources',
    'Recorded spice decision and evidence','Spice laboratory comparison','Saved pesticide result count','Saved pesticide results by sample and report'];
  const reportHeaders=['Sample role','Sample article','Sample or lot reference','Process','Laboratory report','Pesticide or residue definition','Reported result','Unit','Method LOQ (mg/kg)','Analytical basis','Source limit (mg/kg)','Source URL','Source provision and evidence','Result assessment'];
  const toRow=r=>[roleLabel[r.role],r.matrix,r.sample,r.process,r.report,r.analyte,r.result,r.unit,r.loq,r.basis,r.limit,r.source,r.reference,r.decision];
  function exportRows(id){
    return [['Catalogue ID','Product',...reportHeaders],...records(id).map(([,r])=>[id,products[id].name,...toRow(r)])];
  }
  function description(r){
    return [roleLabel[r.role],r.matrix,r.sample,r.process,r.report,r.analyte,r.result+' '+r.unit,r.loq?'LOQ '+r.loq+' mg/kg':'',
      r.basis,'Limit '+r.limit+' mg/kg',r.decision,r.reference,r.source].filter(Boolean).join(' · ');
  }
  function values(id,s={},includeSaved=false) {
    const c=context(id,s);
    const names=targets.get(id)||[];
    const d=decide(id,s),lines=includeSaved?records(id):[];
    let evidenceText='',lab='';
    if(c.a&&c.analyte){
      evidenceText=[roleLabel[c.role],c.a.label,clean(s.spSample),processLabel[s.spProcess],c.analyte,d.text,
        ...[s.spDate,s.spIndiaRef,s.spReg,s.spRegRef,s.spOtherRef,s.spCodex,s.spCodexRef].map(clean),d.limit?d.limit+' mg/kg':'',d.url,
        ...(d.rows||[]).map(r=>r.article+' '+r.limit+(r.limit==='$'?'':' mg/kg')+' '+r.url)].filter(Boolean).join(' · ');
      if(clean(s.spReport))lab=[clean(s.spReport),s.spKind==='less'?'<':'',clean(s.spValue),s.spUnit,s.spLoq?'LOQ '+s.spLoq:'',spiceComparison(id,s).text].filter(Boolean).join(' · ');
    }
    return [names.map(k=>articles.get(k).label).join(' | ')||'Separately sampled spice only',
      names.map(k=>articles.get(k)).filter(a=>a.codes).map(a=>a.label+' · '+a.codes).join(' | '),
      [sources.order,sources.registration,sources.codex,sources.hierarchy].join(' | '),evidenceText,lab,lines.length,lines.map(([,r])=>description(r)).join('\n')];
  }
  function brief(id,s){
    const v=values(id,s,true);
    return [v[3]?'Spice source decision · '+v[3]:'',v[4]?'Spice laboratory comparison · '+v[4]:'',
      ...(v[5]?['Saved pesticide results ('+v[5]+')',...records(id).map(([,r])=>description(r))]:[])].filter(Boolean);
  }
  function panel(id){
    const lines=records(id);
    if(!lines.length)return '<p>No saved pesticide results for this product.</p>';
    return '<p>'+lines.length+' saved '+(lines.length===1?'result':'results')+'.</p><div class="ws-scroll"><table><thead><tr><th>Sample and report</th><th>Pesticide</th><th>Result / limit (mg/kg)</th><th>Assessment</th><th></th></tr></thead><tbody>'+
      lines.map(([k,r])=>'<tr><td>'+esc([roleLabel[r.role],r.matrix,r.sample,r.report].join(' · '))+'</td><td>'+esc(r.analyte)+'</td><td>'+esc(r.result+' / '+r.limit)+'</td><td>'+esc(r.decision)+'</td><td><button type="button" data-residue-delete="'+esc(k)+'" aria-label="Remove '+esc(r.analyte+' for '+r.sample)+'">Remove</button></td></tr>').join('')+
      '</tbody></table></div><button type="button" data-residue-csv>Export these results as CSV</button>';
  }
  function markup(id,s){
    return '<details class="ws-section spice-decision"><summary>'+esc(targets.has(id)?'Check the spice or culinary herb order':'Check a separately sampled spice or culinary herb')+'</summary><div>'+
      '<p>Review the first page of the April 2024 order. Confirm the plant part, residue definition and any specific Indian provision. '+link(sources.order,'FSSAI spice order')+' · '+link(sources.processing,'Process clarification')+' · '+link(sources.eto,'Ethylene oxide, item 3.3')+'</p>'+
      '<div data-spice-controls>'+spiceForm(id,s)+'</div><p role="status" data-spice-outcome>'+esc(decisionText(id,s))+'</p></div></details>'+
      '<section class="residue-panel"><h5>Saved pesticide results</h5><p>Save each report line here. Saving the same sample, report and pesticide updates that line.</p>'+
      '<p role="status" data-residue-status></p><div data-residue-list>'+panel(id)+'</div></section>';
  }
  function update(node,id,k,s,previous){
    const resets={
      spRole:['spArticle','spProcess','spSample','spAnalyte','spOther','spNamedRow',...indiaFields,...labFields],
      spArticle:['spProcess','spSample','spAnalyte','spOther','spNamedRow',...indiaFields,...labFields],
      spProcess:['spSample',...indiaFields,...labFields],spAnalyte:['spOther','spNamedRow',...indiaFields,...labFields],spNamedRow:labFields,
      spOther:[...indiaFields,...labFields],spIndia:['spIndiaRef','spDate',...registrationFields,...labFields],
      spReg:['spRegRef','spOtherFood','spOtherRef',...codexFields,...labFields],
      spOtherFood:['spOtherRef',...codexFields,...labFields],spCodex:['spCodexRef','spLimit','spMark',...labFields],
      spSample:labFields
    };
    // Editing the identity or the source basis invalidates earlier lab sign-off.
    let clear=resets[k]||[];
    if(!['spRole','spArticle','spProcess','spSample'].includes(k))clear=clear.filter(f=>f!=='spReport');
    if(k==='spSample'&&!clean(previous))clear=[];
    if(['spDate','spIndiaRef','spRegRef','spOtherRef','spCodexRef','spLimit','spMark'].includes(k)&&clean(previous)&&previous!==s[k])clear=['spBasis'];
    const had=clear.some(f=>s[f]);clear.forEach(f=>{s[f]='';});
    const active=node.querySelector('[data-ws-field="'+k+'"]');
    if(active?.tagName==='SELECT'||(had&&clear.length)){
      const position=active?.tagName==='INPUT'&&active.type==='text'?active.selectionStart:null;
      node.querySelector('[data-spice-controls]').innerHTML=spiceForm(id,s);
      const next=node.querySelector('[data-ws-field="'+k+'"]');next?.focus();
      if(position!==null&&next?.setSelectionRange)next.setSelectionRange(position,position);
    }
    node.querySelector('[data-spice-outcome]').textContent=decisionText(id,s);
    const status=node.querySelector('[data-residue-status]');if(status)status.textContent='';
  }
  function handle(node,id,s,el) {
    const saveButton=el.closest('[data-residue-save]'),del=el.closest('[data-residue-delete]');
    if(!saveButton&&!del)return false;
    const status=node.querySelector('[data-residue-status]');
    status.textContent=saveButton?save(id,s,saveButton.dataset.residueSave):remove(id,del.dataset.residueDelete);
    node.querySelector('[data-residue-list]').innerHTML=panel(id);
    return true;
  }
  root.addEventListener?.('storage',e=>{
    if(e.key!==null&&!e.key?.startsWith(prefix))return;
    if(e.key===null){cache.clear();loaded=false;}
    const id=e.key===null?'':applyStored(e.key,e.newValue);
    for(const node of root.document?.querySelectorAll('.catalogue-worksheet[open]')||[]){
      const list=node.querySelector('[data-residue-list]');
      if(list&&(!id||id===node.dataset.wsId))list.innerHTML=panel(node.dataset.wsId);
    }
  });
  const summary=()=>({products:Object.keys(products).length,marketedProducts:targets.size,sampleChoices:articles.size,
    codedChoices:[...articles.values()].filter(a=>a.codes).length});
  root.PMSVResiduePanel=Object.freeze({fields,columns,values,brief,markup,update,handle,records,exportRows,summary,context,decide,spiceComparison,save,remove,marketed:id=>targets.has(id),sources});
})(globalThis);
