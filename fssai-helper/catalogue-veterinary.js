/* Food and sample scope for CTR 2.3.2, reviewed 20 November 2026. */
(function (root) {
  'use strict';
  const review = root.PMSV_REVIEW_REGISTER?.veterinaryReview;
  const products = root.PMSVCatalogueRules?.products;
  if (!review || !products) return;

  // For a finished product, the choices are limited by its catalogue identity.
  // Intake of a separately sampled ingredient has its own set of choices.
  const matrices = {
    none:['Article as sold','other'], honey:['Honey','honey'],
    dairy:['Milk product as sold (e.g. powder, cream, cheese or butter)','dairy'],
    milk:['Liquid milk, species unspecified or mixed','milk'],
    cow:['Liquid cow milk','milk','Cattle'], buffalo:['Liquid buffalo milk','milk','Buffalo'],
    goatMilk:['Liquid goat milk','milk','Goat'], sheepMilk:['Liquid sheep milk','milk','Sheep'],
    camel:['Liquid camel milk','milk','Camel'],
    meatProduct:['Processed meat product as sold','meatProduct'],
    bovine:['Bovine tissue, cattle species unconfirmed','tissue','Bovines'],
    beef:['Cattle tissue','tissue','Cattle'], pork:['Pig tissue','tissue','Pig'],
    goat:['Goat tissue','tissue','Goat'], sheep:['Sheep tissue','tissue','Sheep'],
    rabbit:['Rabbit tissue','tissue','Rabbit'], poultry:['Poultry tissue, species unspecified','tissue','Poultry'],
    chicken:['Chicken tissue','tissue','Chicken'], turkey:['Turkey tissue','tissue','Turkey'],
    duck:['Duck tissue','tissue','Duck'], quail:['Quail tissue','tissue','Quail'],
    egg:['Whole poultry egg, species unspecified','egg'], henEgg:['Whole hen egg','egg','Chicken'],
    fishProduct:['Processed fishery product as sold','seafood'],
    finfish:['Finfish','seafood','finfish'], trout:['Trout','seafood','trout'],
    shrimp:['Shrimp or prawn, species unspecified','seafood','shrimp'],
    giantPrawn:['Giant prawn (Penaeus monodon)','seafood','giantPrawn'],
    otherShell:['Mollusc or crustacean other than a prawn','seafood','shellfish']
  };
  const ingredients = Object.keys(matrices).filter(k=>k!=='none');
  const distinctMilk = {
    '01-01-1-cow-milk':'cow', '01-01-1-buffalo-milk':'buffalo',
    '01-01-1-goat-milk':'goatMilk', '01-01-1-sheep-milk':'sheepMilk', '01-01-1-camel-milk':'camel'
  };
  const plainMilk = new Set(['standardized-milk','toned-milk','double-toned-milk','skimmed-milk',
    'full-cream-milk','low-lactose-or-lactose-free-milk'].map(k=>'01-01-1-'+k));
  const milkFats = new Set(['02-02-1-milk-fat','02-02-1-butter-oil','02-02-1-anhydrous-milk-fat','02-02-2-butter']);
  const compositeFish = new Set(['09-09-2-quick-frozen-fish-sticks-fish-fingers-fish-portions-and-fish-fillets-breaded-or-ba',
    '09-09-4-ready-to-eat-finfish-or-shell-fish-curry-in-retortable-pouches','09-09-3-fish-pickles',
    '12-12-6-fish-sauce','02-02-1-fish-oil','99-99-1-gelatin-from-fish-processing-waste']);
  const finfishIds = new Set(['09-09-2-frozen-finfish','09-09-2-frozen-fish-fillets']);
  const shellIds = new Set(['09-09-1-live-and-raw-bivalve-molluscs','09-09-2-frozen-lobsters',
    '09-09-2-frozen-squid-and-parts-of-squid','09-09-2-frozen-cephalopods','09-09-2-frozen-clam-meat',
    '09-09-2-fresh-and-quick-frozen-raw-scallop-products','09-09-2-pasteurised-crab-meat']);
  const grades = {
    direct:'A current provision names the food or its production group',
    conditional:'Finished-article classification or process needs evidence',
    ingredient:'Review the recipe and separately sampled ingredients',
    other:'No named finished article identified for the stated identity'
  };
  const status=(grade,choices,note)=>({grade,choices,note});
  function profile(id) {
    if (!Object.hasOwn(products,id)) return null;
    const cat=products[id].category?.split('.')[0];
    if (id==='11-11-5-honey') return status('direct',['honey'],'The honey production rule prohibits antibiotic use. Its MRPLs serve to detect misuse.');
    if (id==='14-14-2-honey-wine-or-mead') return status('ingredient',['none'],'Review honey using a sample of the incoming honey. Fermentation yields a different finished article.');
    if (id==='100-100-royal-jelly'||id==='99-99-1-bees-wax') return status('other',['none'],'This bee product has its own identity. Clause (3) specifies honey.');
    if (distinctMilk[id]) return status('direct',[distinctMilk[id]],'Check each applicable milk row against the animal species and the unit shown in the Gazette.');
    if (id==='01-01-1-mixed-milk') return status('direct',['milk'],'Use the rows for milk of unspecified species. A species-specific raw milk supply needs a separately identified sample.');
    if (plainMilk.has(id)) return status('direct',['milk','cow','buffalo','goatMilk','sheepMilk','camel'],'For a single-species supply, record the species from the specification. Use the mixed-milk choice for blended milk.');
    if (id.includes('analogue-in-the-dairy-context')||id.includes('frozen-desserts-or-confections-with-added-vegetable'))
      return status('conditional',['none'],'Check the marketed classification and each dairy ingredient. The analogue or frozen-dessert category can include non-dairy constituents.');
    if (cat==='1'||milkFats.has(id)) return status('direct',['dairy'],'The prohibited-use rule includes milk products. Clause (4) identifies milk and specific animals. A liquid-milk tolerance needs the matching liquid sample.');
    if (id==='100-100-cow-or-buffalo-colostrum-and-colostrum-products'||id==='11-11-1-edible-lactose')
      return status('conditional',['none'],'Document the source, grade and the legal classification of the finished dairy-derived material. Check the separately sampled milk where appropriate.');
    if (cat==='8') {
      if (id==='08-08-4-animal-casings') return status('conditional',['none'],'Document the animal source and the casing sold. A muscle, fat, liver or kidney row requires that precise tissue.');
      const raw=/fresh-or-chilled|^08-08-2-frozen-(?:rabbit|pork|beef|chevon|mutton|poultry)/.test(id);
      if (raw) {
        const key=id.includes('pork')?'pork':id.includes('beef')?'beef':id.includes('chevon')?'goat':id.includes('mutton')?'sheep':id.includes('rabbit')?'rabbit':'poultry';
        if (key==='beef') return status('direct',['bovine','beef'],
          'The beef standard includes buffalo and mithun. Use bovine or general tissue entries until a cattle species and the sampled portion are documented.');
        return status('direct',key==='poultry'?['poultry','chicken','turkey','duck','quail']:[key],
          'The production group is covered. Identify the species and edible portion before choosing an individual drug tolerance.');
      }
      return status('direct',['meatProduct'],'The production rule includes meat products. For a mixed, cooked or comminuted sample, identify a legal basis for any tissue-specific comparison.');
    }
    if (id==='10-10-1-fresh-eggs') return status('direct',['egg','henEgg'],'Confirm the poultry species. Some drug tolerances specify chicken eggs.');
    if (cat==='10') return status('conditional',['none'],'Clause (2) covers poultry and eggs. Establish the basis for the liquid, dried, frozen or pickled article. An incoming whole egg can be reviewed separately.');
    if (compositeFish.has(id)) return status('conditional',['none','fishProduct'],'Document whether the whole food qualifies as a fishery product. A fillet or muscle limit needs a sample of the named tissue.');
    if (cat==='9') {
      const choices=finfishIds.has(id)?['finfish','trout']:id==='09-09-2-frozen-shrimp'?['shrimp','giantPrawn']:shellIds.has(id)?['otherShell']:['fishProduct'];
      return status('direct',choices,'The current seafood provision covers this fishery article. Identify its origin before using the aquaculture prohibition, and the species and portion for a clause (4) tolerance.');
    }
    if (id==='99-99-1-gelatin') return status('conditional',['none'],'Identify the source species and manufactured article. A gelatin sample differs from a sample of the original animal tissue.');
    if (id==='05-05-1-cocoa-powder'||id==='05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake'||id==='04-04-2-cocoa-beans')
      return status('other',['none'],'Plain cocoa has no named finished-food entry in these veterinary tables.');
    if (id==='05-05-1-chocolate') return status('ingredient',['none'],'For milk chocolate, review any separately sampled milk or milk powder under its own article. The finished chocolate has no milk-specific tolerance in these tables.');
    if (/^99-99-[123]-/.test(id)&&/(?:mixture|premix|enzymes|additives-permitted|additives-va)/.test(id))
      return status('conditional',['none'],'Identify the supplied ingredient or mixture, its source and the food in which it will be used.');
    if (cat==='5'||cat==='7'||cat==='13'||id.startsWith('18-')||id.startsWith('102-')||id.startsWith('99-99-7-')||
        /(?:soup|sauce|seasoning|premix|meals|bread|noodle|biscuit|malt.*food|complementary-food|supplements-children|liqueur|fat-spread|margarine|frozen-dessert)/.test(id))
      return status('ingredient',['none'],'Check the recipe for milk, egg, meat, seafood or honey. A supplier limit follows the ingredient and sample identified in the cited provision.');
    return status('other',['none'],'The catalogue identity supplies no direct match to a named finished article in these four provisions. Record relevant inputs separately if the actual recipe contains them.');
  }

  const refs=review.sources;
  const drugIdentity='https://apps.who.int/food-additives-contaminants-jecfa-database/Home/Chemical/4017';
  const currentSea='Tetracycline 0.1, oxytetracycline 0.1, trimethoprim 0.05 and oxolinic acid 0.3 mg/kg.';
  const restriction='Production use is prohibited for 14 listed substances or classes. EMRL 0.001 mg/kg, except chloramphenicol 0.0003 mg/kg.';
  const transition='On 1 December 2026 clause (1) is omitted. In clause (4), seafood is added to trimethoprim at 0.05 mg/kg (serial 45) and oxolinic acid at 0.3 mg/kg (new serial 50). Check the species, drug and portion in the remaining tetracycline entries.';
  const {reviewedOn:reviewDate,effectiveFrom:changeDate}=root.PMSV_REVIEW_REGISTER.veterinaryEditionReview;
  const datePrompt='Enter a valid assessment date within a reviewed edition effective from 1 April 2025.';
  function edition(date=reviewDate) {
    if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<'2025-04-01')return '';
    const value=new Date(date+'T00:00:00Z');
    if(!Number.isFinite(value.getTime())||value.toISOString().slice(0,10)!==date)return '';
    return date<changeDate?'original':'amended';
  }
  function buildRows() {
    const rows=[];
    review.seafood.forEach(([drug,limit],i)=>rows.push({key:'sea-'+i,clause:1,drug,article:'Seafood and fishery products',limit,unit:'mg/kg',page:19}));
    for (const r of review.prohibited) rows.push({...r,key:'ban-'+r.serial,clause:2,article:'Listed animal production groups',unit:'mg/kg'});
    for (const r of review.honey) rows.push({...r,key:'honey-'+r.serial,clause:3,article:'Honey',unit:'µg/kg'});
    for (const g of review.groups) for (const r of g.rows) rows.push({...r,key:'vet-'+g.serial+'-'+r.index,
      clause:4,serial:g.serial,drug:r.override||g.drug,group:g.drug,printed:g.printed,unit:r.unit==='mg/l'?'mg/L':r.unit});
    return rows;
  }
  const all=buildRows();
  const amendedRows=[
    {key:'amended-sea-45',serial:45,drug:'Trimethoprim',limit:'0.05'},
    {key:'amended-sea-50',serial:50,drug:'Oxolinic acid',limit:'0.3'}
  ].map(r=>({...r,clause:4,article:'Seafood, including shrimps, prawns, fish and fishery products',unit:'mg/kg',page:6,amendment:true}));
  const amended=all.filter(r=>r.clause!==1).concat(amendedRows);
  const editionRows=e=>e==='original'?all:e==='amended'?amended:[];
  const getUrl=r=>(r.amendment?refs.december:r.clause===1?refs.seafood:refs.veterinary)+'#page='+r.page;
  const rowType={1:'Seafood tolerance',2:'Prohibited use · EMRL',3:'Honey misuse · MRPL',4:'Food and tissue tolerance'};
  const fields=['vetDate','vetRole','vetMatrix','vetOrigin','vetSource','vetRow','vetValue','vetUnit','vetBasis','vetReport'];
  function basis(id,s={}) {
    const p=profile(id);
    if (!p) return null;
    const separate=s.vetRole==='ingredient';
    const options=separate?ingredients:p.choices;
    const matrix=options.includes(s.vetMatrix)?s.vetMatrix:separate?'':options[0];
    const [label='',family='other',species='']=matrices[matrix]||[];
    const origin=family==='seafood'&&['farmed','wild'].includes(s.vetOrigin)?s.vetOrigin:'';
    return {p,separate,options,matrix,label,family,species,origin,edition:edition(s.vetDate)};
  }
  function toleranceMatch(r,b) {
    const a=r.article, sp=b.species;
    if (r.amendment) return b.family==='seafood';
    if (r.locked) return false;
    if (b.family==='milk') {
      if (a==='Milk'||a.endsWith('; Milk')||a==='Species not specified — Milk') return true;
      if (['Cattle','Buffalo','Goat','Sheep'].includes(sp)&&a==='Milk (All ruminants)') return true;
      if (['Cattle','Buffalo'].includes(sp)&&['Milk (Bovine)','Bovines — Milk'].includes(a)) return true;
      return !!sp && a===sp+' — Milk';
    }
    if (b.family==='egg') return ['Poultry — Egg','Poultry — Eggs','Poultry and egg'].includes(a)||(sp==='Chicken'&&a==='Chicken — Eggs');
    if (b.family==='tissue') {
      if (a.startsWith('All edible animal tissues')) return true;
      if (a.endsWith(' — Milk')||/ — Eggs?$/.test(a)) return false;
      if (a.startsWith(sp+' — ')||a.startsWith('Species not specified — ')||a.startsWith('No Specified — ')) return !/ — Fish$/.test(a);
      if (sp==='Pig'&&a==='All edible tissues of pig') return true;
      if (sp==='Cattle'&&a.startsWith('Bovines — ')) return true;
      return ['Poultry','Chicken','Duck','Turkey','Quail'].includes(sp)&&(a.startsWith('Poultry — ')||a==='Poultry and egg');
    }
    if (b.family!=='seafood'||!sp) return false;
    if (a.startsWith('All edible animal tissues;')) return true;
    if (sp==='giantPrawn'&&a.startsWith('Giant prawn')) return true;
    if (!['finfish','trout'].includes(sp)) return false;
    return a==='Finfish'||a.startsWith('Finfish — ')||a==='Species not specified — Fish'||a==='Oxytetracycline — Fish'||(sp==='trout'&&a==='Trout — Muscle');
  }
  function candidates(b) {
    if (!b?.matrix||b.family==='other') return [];
    const prohibited=['milk','dairy','tissue','meatProduct','egg'].includes(b.family)||(b.family==='seafood'&&b.origin==='farmed');
    return editionRows(b.edition).filter(r=>r.clause===1?b.family==='seafood':r.clause===2?prohibited:r.clause===3?b.family==='honey':toleranceMatch(r,b));
  }
  function qualification(r,b) {
    if (r.locked) return 'The printed Muscle entry has no resolved species heading.';
    if (b?.family==='tissue'&&(r.serial===39||r.serial===41)&&r.clause===4)
      return 'Sulfadimidine and sulfamethazine are names for the same drug. Serials 39 and 41 give potentially overlapping tissue limits of 0.1 and 0.01 mg/kg. Reconcile the entries for the sampled portion.';
    if (r.clause===4&&r.serial===1&&['finfish','trout'].includes(b?.species))
      return 'Ampicillin has a finfish entry at 0.05 mg/kg and a broader animal-tissue entry at 0.01 mg/kg. Resolve the scope for the sampled portion before comparison.';
    if (b?.edition==='original'&&r.clause===4&&r.serial===7&&(/Giant prawn|Oxytetracycline — Fish/.test(r.article)))
      return 'The 0.2 mg/kg entry can overlap the current 0.1 mg/kg seafood provision for tetracycline or oxytetracycline, depending on the drug and species. Resolve the applicable provision before comparison.';
    if (r.clause===1&&['Tetracycline','Oxytetracycline'].includes(r.drug)) {
      const prawnOrUnknown=['','shrimp','giantPrawn'].includes(b?.species||'');
      if (prawnOrUnknown||(r.drug==='Oxytetracycline'&&['finfish','trout'].includes(b?.species)))
        return 'Check the competing 0.2 mg/kg fish or giant-prawn muscle entry, the specific drug and the sample. Legal interpretation is required before comparison.';
    }
    return r.condition||'';
  }
  const labelRow=r=>r.drug+' · '+r.article+' · '+r.limit+' '+r.unit;
  function current(id,s={}) {
    const b=basis(id,s);
    if (!b) return null;
    const options=candidates(b);
    const row=options.find(r=>r.key===s.vetRow);
    const recorded=!!row&&!!s.vetSource?.trim();
    const date=s.vetDate??reviewDate;
    let comparison=b.edition?'':datePrompt;
    if (row) {
      const qualifier=qualification(row,b);
      if (qualifier&&!row.condition) comparison='Source interpretation required. '+qualifier;
      else if (!recorded||s.vetBasis!=='yes'||!s.vetReport?.trim()||s.vetUnit!==row.unit) comparison='Confirm the applicable article, sample and analytical basis, enter both references and use the printed unit.';
      else if (!String(s.vetValue||'').trim()) comparison='Enter the quantified result in '+row.unit+'.';
      else {
        const result=root.PMSVCatalogueWorksheets.compare({operator:'<=',value:row.limit},s.vetValue.trim());
        comparison=result===null?'Use a non-negative decimal result. A qualified result such as <LOQ needs separate interpretation.':
          (result?'At or below':'Above')+' the selected '+(row.clause===3?'honey misuse MRPL':row.clause===2?'prohibited-use EMRL':'source tolerance')+' (‘'+row.drug+'’).';
      }
    }
    return {b,options,row,recorded,date,comparison};
  }
  function summaries(b) {
    if(!b.edition)return Array(4).fill(datePrompt);
    const f=b.family;
    const profileOpen=!b.separate&&b.p.grade==='conditional'&&f==='other';
    const other=profileOpen?'Establish the marketed article and sampling basis.':'No named match for this sample.';
    return [
      f==='seafood'?(b.edition==='amended'?'Clause (1) was omitted on 1 December 2026.':currentSea):other,
      ['dairy','milk','tissue','meatProduct','egg'].includes(f)?restriction:
        f==='seafood'?(b.origin==='farmed'?restriction:b.origin==='wild'?'Documented wild catch lies outside the aquaculture production group.':'Identify farmed or wild origin. The production prohibition names aquaculture and its products.'):other,
      f==='honey'?'12 MRPL entries in µg/kg for detecting misuse in honey, including the individual or collective conditions at serials 3 and 4. Antibiotic use during production is prohibited.':other,
      f==='seafood'&&b.edition==='amended'?'Seafood tolerances under clause (4) are 0.05 mg/kg for trimethoprim and 0.3 mg/kg for oxolinic acid. Match other entries by drug, species and portion.':
      ['milk','tissue','egg','seafood'].includes(f)?'Match the drug, species and sampled portion to an individual Gazette row. The published unit applies to that row.':
        f==='dairy'?'The named milk rows concern milk. Establish a separate legal basis for a dairy derivative or assess the independently sampled milk.':
        f==='meatProduct'?'The drug table distinguishes tissues and fats. Identify the sampled tissue and any legal basis for the processed product.':other
    ];
  }
  function stats(priority=[]) {
    const ids=Object.keys(products);
    const counts={direct:0,conditional:0,ingredient:0,other:0};
    for(const id of ids) counts[profile(id).grade]++;
    return {products:ids.length,directProducts:counts.direct,priorityDirect:priority.filter(id=>profile(id)?.grade==='direct').length,
      scopeCounts:counts,toleranceRows:all.filter(r=>r.clause===4).length};
  }
  const columns=['Finished-article scope · CTR 2.3.2','Seafood antibiotics · CTR 2.3.2(1)','Prohibited veterinary use · CTR 2.3.2(2)',
    'Honey misuse MRPL · CTR 2.3.2(3)','Veterinary tolerance scope · CTR 2.3.2(4)','Candidate residue rows for the catalogue sample',
    'Official veterinary residue sources','Seafood transition from 1 Dec 2026','Documented residue sample and row','Veterinary residue comparison'];
  function values(id,s={}) {
    const base=basis(id,{vetDate:s.vetDate}), c=current(id,s);
    if (!base||!c) return [];
    const list=candidates(base);
    const doc=c.b.matrix&&s.vetSource?.trim()?(c.b.separate?'Separately sampled ingredient':'Catalogue product')+' · '+c.b.label+
      (c.b.origin?' · '+c.b.origin:'')+' · '+c.date+' · '+s.vetSource.trim()+(c.row?' · '+labelRow(c.row)+' · '+getUrl(c.row):' · No source row selected'):'';

    const outcome=c.recorded&&s.vetValue?.trim()?s.vetValue.trim()+' '+(s.vetUnit||'(unit pending)')+' · '+c.comparison+(s.vetReport?.trim()?' · '+s.vetReport.trim():''):'';
    return [grades[base.p.grade]+' · '+base.p.note,...summaries(base),
      list.map(r=>'('+r.clause+') '+labelRow(r)+(qualification(r,base)?' · '+qualification(r,base):'')+' · p. '+r.page).join(' | '),
      (base.edition==='amended'?refs.december+'#page=6':refs.seafood+'#page=19')+' | '+refs.veterinary+'#page=17 | '+refs.veterinary+'#page=18'+(base.family==='tissue'?' | '+drugIdentity:''),
      base.p.choices.some(k=>matrices[k][1]==='seafood')?transition+' '+refs.december+'#page=6':'',doc,outcome];
  }
  function brief(id,s={}) {
    const vals=values(id,s);
    return vals.length?['','Veterinary drug residues · assessment '+(s.vetDate??reviewDate),...columns.flatMap((name,i)=>vals[i]?[name+' · '+vals[i]]:[])]:[];
  }
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const link=(url,name)=>'<a class="source-ref" target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(name)+'</a>';
  const opt=(key,name,value)=>'<option value="'+esc(key)+'"'+(key===value?' selected':'')+'>'+esc(name)+'</option>';
  const select=(field,label,options)=>'<label>'+esc(label)+'<select data-ws-field="'+field+'">'+options+'</select></label>';
  const input=(field,label,s,attrs='maxlength="220"')=>'<label>'+esc(label)+'<input '+attrs+' data-ws-field="'+field+'" value="'+esc(s[field])+'"></label>';
  function listTable(rows,e) {
    return '<div class="ws-scroll"><table><thead><tr><th>Drug or group</th><th>Food or sample</th><th>Source value</th><th>Gazette</th></tr></thead><tbody>'+
      rows.map(r=>'<tr><td>'+esc(r.drug)+'</td><td>'+esc(r.article)+'</td><td>'+esc(r.limit+' '+r.unit)+
        (r.condition?'<br>'+esc(r.condition):'')+(r.locked?'<br>Species heading unresolved.':'')+
        (e==='original'&&r.clause===4&&r.serial===7&&/Giant prawn|Oxytetracycline — Fish/.test(r.article)?'<br>Check overlapping seafood provision.':'')+'</td><td>'+link(getUrl(r),'PDF p. '+r.page)+'</td></tr>').join('')+'</tbody></table></div>';
  }
  function indexTable(key,date) {
    const e=edition(date);
    if (!key) return '';
    const rows=editionRows(e).filter(r=>r.clause<4?'c'+r.clause===key:'g'+r.serial===key);
    return rows.length?listTable(rows,e):'';
  }
  function sampleMarkup(id,s) {
    const {b,options,row,comparison}=current(id,s);
    const origin=b.family==='seafood'?select('vetOrigin','Seafood origin',
      opt('','Origin unconfirmed',b.origin)+opt('farmed','Aquaculture',b.origin)+opt('wild','Wild catch',b.origin)):'';
    const matrix=select('vetMatrix','Sample matrix',(b.separate?opt('','Choose the physical ingredient sample',b.matrix):'')+b.options.map(k=>opt(k,matrices[k][0],b.matrix)).join(''));
    const grouped=[1,2,3,4].map(n=>{
      const rows=options.filter(r=>r.clause===n);
      return rows.length?'<optgroup label="'+esc(rowType[n])+'">'+rows.map(r=>opt(r.key,labelRow(r),s.vetRow)).join('')+'</optgroup>':'';
    }).join('');
    const sampleInfo=b.matrix?'<p>'+summaries(b).filter(t=>!['No named match for this sample.','Establish the marketed article and sampling basis.'].includes(t)).map(esc).join(' ')+'</p>':'';
    return matrix+origin+sampleInfo+input('vetSource','Sample, species or specification reference',s)+
      (options.length?select('vetRow','Source row for the sampled article',opt('','Choose a drug and article',s.vetRow)+grouped):
      '<p>No numerical row has been assigned to this sample. The complete Gazette index is available below.</p>')+
      (row?'<p><strong>'+esc(rowType[row.clause])+'</strong> · '+esc(labelRow(row))+' · '+link(getUrl(row),'PDF p. '+row.page)+'</p>'+
        (qualification(row,b)?'<p>'+esc(qualification(row,b))+(row.clause===4&&[39,41].includes(row.serial)&&b.family==='tissue'?' '+link(drugIdentity,'WHO/JECFA drug identity'):'')+'</p>':'')+
        input('vetValue','Laboratory result',s,'inputmode="decimal" maxlength="80"')+
        select('vetUnit','Reported unit',opt('','Choose the unit from the report',s.vetUnit)+['mg/kg','mg/L','µg/kg'].map(k=>opt(k,k,s.vetUnit)).join(''))+
        '<label class="ws-check"><input type="checkbox" data-ws-field="vetBasis"'+(s.vetBasis==='yes'?' checked':'')+'>The species, sample portion, analyte or group and reporting basis match this row.</label>'+
        input('vetReport','Laboratory report reference',s)+'<p data-vet-comparison role="status">'+esc(comparison)+'</p>':'');
  }
  function markup(id,s={}) {
    const b=basis(id,{vetDate:s.vetDate});
    if (!b) return '';
    return '<details class="ws-section vet-scope"><summary>Veterinary drug residues · CTR 2.3.2</summary><div><p><strong>'+esc(grades[b.p.grade])+'</strong>. '+esc(b.p.note)+'</p>'+
      input('vetDate','Veterinary assessment date',{vetDate:s.vetDate??reviewDate},'type="date"')+
      '<div data-vet-edition>'+editionSummary(b)+'</div>'+
      '<details class="ws-section" data-vet-assessment><summary>Review a sampled article</summary><div>'+select('vetRole','Sample being reviewed',opt('','Catalogue product as sold',s.vetRole||'')+opt('ingredient','Separately sampled ingredient',s.vetRole))+
      '<div data-vet-controls>'+sampleMarkup(id,s)+'</div></div></details>'+
      '<details class="ws-section"><summary>Browse Gazette provisions for this date</summary><div data-vet-lookup>'+lookupMarkup(b.edition)+'</div></details></div></details>';
  }
  function editionSummary(b) {
    if(!b.edition)return '<p role="status">'+esc(datePrompt)+'</p>';
    const sourcePages=[b.edition==='amended'?refs.december+'#page=6':refs.seafood+'#page=19',refs.veterinary+'#page=17',refs.veterinary+'#page=18',refs.veterinary+'#page=18'];
    const summary=summaries(b).map((v,i)=>'<li><strong>'+esc(rowType[i+1])+'</strong> · '+esc(v)+' '+link(sourcePages[i],'Clause ('+(i+1)+')')+'</li>').join('');
    return '<ul>'+summary+'</ul>'+(b.edition==='amended'&&b.family==='seafood'?link(refs.december+'#page=6','Amended clause (4) seafood rows'):'')+(b.p.choices.some(k=>matrices[k][1]==='seafood')?
      '<p>'+esc(transition)+' '+link(refs.december+'#page=6','Amendment, PDF p. 6')+'</p>':'');
  }
  function lookupMarkup(e) {
    if(!e)return '<p>'+esc(datePrompt)+'</p>';
    const clauses=e==='amended'?[2,3]:[1,2,3];
    const lookup=clauses.map(n=>opt('c'+n,rowType[n],'')).join('')+
      review.groups.map(g=>opt('g'+g.serial,'('+g.serial+') '+g.drug,'')).join('')+
      (e==='amended'?opt('g50','(50) Oxolinic acid',''):'');
    return '<label>Provision or veterinary drug<select data-vet-index>'+opt('','Choose a table or drug','')+lookup+'</select></label><div data-vet-found></div>';
  }
  function update(node,id,key,s) {
    if(key==='vetDate'){
      const b=basis(id,{vetDate:s.vetDate});
      node.querySelector('[data-vet-controls]').innerHTML=sampleMarkup(id,s);
      node.querySelector('[data-vet-edition]').innerHTML=editionSummary(b);
      node.querySelector('[data-vet-lookup]').innerHTML=lookupMarkup(b.edition);
      return;
    }
    const cascade={vetRole:['vetMatrix','vetOrigin','vetSource','vetRow'],vetMatrix:['vetOrigin','vetSource','vetRow'],vetOrigin:['vetSource','vetRow'],vetRow:[]};
    if (Object.hasOwn(cascade,key)) {
      for (const field of [...cascade[key],'vetValue','vetUnit','vetBasis','vetReport']) s[field]='';
      node.querySelector('[data-vet-controls]').innerHTML=sampleMarkup(id,s);
    } else {
      const out=node.querySelector('[data-vet-comparison]');
      if (out) out.textContent=current(id,s).comparison;
    }
  }
  function planRows(id,date=reviewDate) {
    const p=profile(id);
    if(!p)return [];
    const e=edition(date);
    if(!e)return [{article:'CTR 2.3.2',form:'Marketed article',parameter:'Check the veterinary assessment date',
      status:'Assessment date outside reviewed editions',notes:datePrompt,source:refs.veterinary+'#page=17 | '+refs.december+'#page=4'}];
    const rows=[{article:'CTR 2.3.2',form:'Marketed article',parameter:'Identify the animal source, product and sampled portion',
      status:grades[p.grade],notes:p.note,source:refs.veterinary+'#page=17 | '+(e==='amended'?refs.december+'#page=6':refs.seafood+'#page=19')}];
    const found=new Map();
    let seafood=false;
    for(const matrix of p.choices){
      const b=basis(id,{vetMatrix:matrix,vetOrigin:'farmed',vetDate:date});
      seafood ||= b.family==='seafood';
      for(const r of candidates(b)){
        const qualifier=qualification(r,b);
        const held=qualifier && qualifier!==r.condition;
        const farmed=r.clause===2 && b.family==='seafood';
        const key=JSON.stringify([r.key,qualifier,farmed]);
        let match=found.get(key);
        if(!match){
          const explanation=r.clause===3?'Antibiotic use is prohibited during honey production. MRPL is a misuse-detection threshold.':
            r.clause===2?'Prohibited in production. EMRL is the extraneous maximum residue limit.':
            'Apply only to the indicated article and sample portion, in the unit printed.';
          const article='CTR 2.3.2('+r.clause+')'+(r.serial?' · serial '+r.serial:'');
          const notes=[qualifier,held&&'Printed reference: '+r.limit+' '+r.unit,explanation,
            p.grade==='conditional'&&p.note,r.amendment&&'Effective 1 December 2026.',r.clause===1&&'Clause (1) applies in this edition through 30 November 2026.'].filter(Boolean).join(' · ');
          match={forms:new Set(),row:{article,parameter:r.drug,status:held?'Resolve overlapping source entries':rowType[r.clause],
            limit:held?'':r.limit,unit:held?'':r.unit,notes,source:getUrl(r)}};
          found.set(key,match);
        }
        match.forms.add(b.label+(farmed?' · farmed aquaculture only':''));
        match.article=r.article;
      }
    }
    for(const {forms,article,row} of found.values()){
      rows.push({...row,form:[...forms].join(' / ')+' · '+article});
    }
    if(seafood)rows.push({article:'May 2026 Gazette · amendment 4',form:'Seafood and fishery products',
      parameter:'Check the assessment date',status:e==='amended'?'Amended seafood provisions in use':'Change effective 1 December 2026',
      notes:e==='amended'?'The selected edition omits clause (1). Use clause (4) for seafood and retain the species and tissue conditions on individual rows.':'For a sample assessed from 1 December, use the amended seafood provisions. The clause (1) rows in this export represent the edition through 30 November 2026.',
      source:refs.december+'#page=4 | '+refs.december+'#page=6'});
    return rows;
  }
  root.PMSVVeterinary=Object.freeze({reviewDate,edition,planRows,fields,columns,profile,basis,candidates,current,stats,values,brief,markup,indexTable,update});
})(globalThis);
