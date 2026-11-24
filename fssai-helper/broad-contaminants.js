/* Three separate CTR decisions for the food article and sample presented. */
(function(root){
  'use strict';
  const source={
    metal:'https://fssai.gov.in/docs/whatsnew/gazette/5f3d09f97b78aGazette_Notification_Limit_Metal_19_08_2020.pdf',
    melamine:'https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Melamine_Milk.pdf',
    correction:'https://fssai.gov.in/upload/uploadfiles/files/Corrigenda_Amendment_Melamine_09_05_2016.pdf',
    current:'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf',
    infant:'https://www.fssai.gov.in/upload/uploadfiles/files/Comp_IFR_VERSION-II_04_01_2024.pdf',
    milkFood:'https://fssai.gov.in/docs/food-law/regulations/amendments/infant-nutrition/Gazette_Notification_Infant_Food_01_09_2022.pdf',
    child:'https://www.fssai.gov.in/upload/notifications/2018/11/5bfd0a04c4d4bGazette_Notification_Children_Supplement_26_11_2018.pdf',
    may:'https://fssai.gov.in/upload/uploadfiles/files/272840.pdf'
  };
  const limits={powder:['Powdered infant formula','1.0'],liquid:['Liquid infant formula','0.15'],other:['Other foods','2.5']};
  const shellfish=new Set(['09-09-1-live-and-raw-bivalve-molluscs','09-09-2-frozen-shrimp','09-09-2-frozen-lobsters','09-09-2-frozen-squid-and-parts-of-squid','09-09-2-frozen-cephalopods','09-09-2-frozen-clam-meat','09-09-2-fresh-and-quick-frozen-raw-scallop-products']);
  const salt=new Set(['12-12-1-edible-common-salt','12-12-1-iron-fortified-iodized-salt-double-fortified-salt']);
  const vegetables=new Set(['04-04-2-untreated-fresh-vegetables','04-04-2-surface-treated-fresh-vegetables']);
  const special=new Set(['13-13-1-follow-up-formula','13-13-1-preterm-infant-milk-substitute','13-13-1-food-for-special-medical-purpose-intended-for-infants','13-13-1-lactose-free-infant-milk-substitutes','13-13-1-hypoallergenic-infant-milk-substitutes','13-13-1-foods-for-infants-with-inborn-errors-of-metabolism-iem']);
  const broadIngredient=id=>id.startsWith('99-')||id.startsWith('11-11-6-')||id==='100-100-solvent-extracted-crude-vegetable-oils-not-for-direct-human-consumption'||id==='100-100-silver-leaf-chandi-ka-warq';
  const canonical=id=>Object.hasOwn(root.PMSVCatalogueRules?.products||{},id);
  function melamine(id){
    if(id==='13-13-1-infant-milk-food')return {key:'powder',options:[],why:'Regulation 7(3) permits this name for qualifying powdered infant formula. Confirm the declared identity and the formulation exclusions in the 2022 amendment.',extra:[source.milkFood,3]};
    if(id==='13-13-1-infant-formula')return {key:'',options:['powder','liquid'],why:'Regulation 7 covers both physical forms. Use the form in which the formula is supplied. Record the label or specification.',extra:[source.infant,7]};
    if(special.has(id))return {key:'',options:['powder','liquid','other'],why:'The infant-nutrition standard describes a distinct follow-up or specialised product. Establish whether the article is infant formula for this CTR entry, and record the physical form. Preparation for drinking does not establish the form as supplied.',extra:[source.infant,id.includes('follow-up')?24:id.includes('preterm')?31:id.includes('medical-purpose')?30:id.includes('lactose')?34:35]};
    const ingredient=root.PMSVMetalScope.ingredientIdentity(id);
    if(ingredient)return ingredient;
    if(id==='99-99-1-acidity-regulators-l-tartaric-acid')return {key:'',options:['other'],why:'The catalogue says L(+/-) and the food-grade standard names L(+)-tartaric acid. Record the food-use identity and stereoisomer from the product specification.'};
    if(broadIngredient(id))return {key:'',options:['other'],why:'Identify the food-grade article being assessed and its intended use. A purity or premix assessment and a finished infant-formula assessment concern different samples.'};
    if(id==='formulated-supplements-children')return {key:'other',options:[],why:'Article 2.4.11(4) specifies a supplement for children above 24 months through 36 months. This named finished food falls under the other-foods melamine row.',extra:[source.child,12]};
    if(id==='traditional-infant-food'||id.startsWith('13-13-2-'))return {key:'other',options:[],why:'This named article is a traditional or cereal-based complementary food. Verify the labelled identity if the product is also described as a formula.',extra:[source.infant,id==='traditional-infant-food'?29:id.includes('processed-cereal')?18:12]};
    return {key:'other',options:[],why:'The named food is outside the two infant-formula articles in the three-row melamine table. Apply the row to the food being assessed.'};
  }
  function mercury(id){
    const reviewed=root.PMSVMetalScope.residualMercury(id);
    if(reviewed)return reviewed;
    if(id==='mineral-water')return {key:'named',article:'Natural mineral water',level:'0.001 mg/L',page:27,why:'Confirm the natural mineral water identity under the product standard.'};
    if(id==='packaged-drinking-water')return {key:'named',article:'Packaged drinking water (other than mineral water)',level:'0.001 mg/L',page:27,why:'Applies to the named packaged water as supplied.'};
    if(id==='purified-vending-water')return {key:'matrix',article:'Vending water requires its own identity check',level:'',page:27,why:'Dispensing from a vending machine does not establish that the finished article is packaged drinking water or natural mineral water. Check its own water standard.'};
    if(id==='99-99-1-gelling-agent-or-thickener-or-stabilizer-carrageenan')return {key:'named',article:'Carrageenan',level:'1.0 ppm',page:27,why:'This is the named additive itself. A food containing it has its own finished-food assessment.'};
    if(salt.has(id))return {key:'named',article:'Salt, food grade',level:'0.1 ppm',page:28,why:'Confirm food-grade salt and any separate requirements applying to the fortified form.'};
    if(shellfish.has(id))return {key:'named',article:'Non-predatory fish, crustaceans, cephalopods, molluscs',level:'0.5 ppm',page:27,why:'The catalogue name identifies the shellfish group. Verify the edible sample and supplied product form.'};
    if(vegetables.has(id))return {key:'matrix',article:'Vegetables',level:'',page:28,why:'The Gazette lists 1.0 ppm for vegetables. Confirm the botanical commodity within the broader FoSCoS category and the form being tested.'};
    if(id.startsWith('09-'))return {key:'matrix',article:'Fish or seafood article requires species and finished form',level:'',page:27,why:'The Gazette lists fish at 0.5 ppm, the named non-predatory group at 0.5 ppm, and listed predatory fish at 1.0 ppm. Confirm species and how the tested portion relates to a processed or composite food.'};
    if(id==='12-12-1-salt-substitutes')return {key:'matrix',article:'Check the exact salt-substitute article',level:'',page:28,why:'A salt substitute may contain other chemical salts. Verify the exact ingredients, purity provisions and finished article before selecting a mercury row.'};
    const guide=root.PMSVMetalScope.mercuryGuide(id);
    if(guide)return {key:'review',article:'Mercury article needs sample evidence',level:'',page:27,why:guide.reason};
    return {key:'review',article:'Check named mercury rows before the residual row',level:'',page:27,why:'The table lists “Foods not specified” at 1.0 ppm. Compare the marketed article with all named mercury rows on pages 27–28 and any applicable product standard before using that level.'};
  }
  function scope(id,selected='',reference='',state={}){
    if(!canonical(id))return null;
    const m=melamine(id),panel=root.PMSVMetalPanel;
    let h;
    if(panel&&id===panel.sajjiId){
      const d=panel.forMetal(id,'Hg',state);
      h={key:d.kind==='residual'?'residual':'matrix',article:d.kind==='residual'?'Foods not specified':'Confirm imported Sajji Khar consignment',
        level:d.kind==='residual'?panel.limit(d.keys[0]):'',page:27,why:[d.reason,d.proof].filter(Boolean).join(' · ')};
    }else h=root.PMSVMetalScope.documentedMercury(id,state)||mercury(id);
    const applied=m.key||(String(reference).trim()&&m.options.includes(selected)?selected:'');
    return {m,h,applied:applied||'',result:applied?limits[applied][1]+' mg/kg':'Awaiting article or form evidence',
      methyl:'0.25 ppm, calculated as the element',unit:'The table heading allows mg/kg or mg/L. Match the matrix and the reported unit. Melamine uses mg/kg even for liquid infant formula.'};
  }
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const ref=(url,n,label)=>'<a class="source-ref" target="_blank" rel="noopener noreferrer" href="'+escape(url)+'#page='+n+'">'+escape(label)+'</a>';
  function resolution(id,sel,ev){const a=scope(id,sel,ev);return a?(a.applied?limits[a.applied][0]+' · '+a.result:a.result):'';}
  function markup(id,state){
    const a=scope(id,state.broadForm,state.broadRef,state);if(!a)return '';
    const {m,h}=a;
    const choice=m.options.length?'<label>Documented melamine article<select data-ws-field="broadForm"><option value="">Select after checking the product</option>'+m.options.map(k=>'<option value="'+k+'"'+(state.broadForm===k?' selected':'')+'>'+escape(limits[k][0])+'</option>').join('')+'</select></label><label>Evidence for article and form<input data-ws-field="broadRef" maxlength="320" value="'+escape(state.broadRef)+'" placeholder="Label, formula or specification reference"></label>':'';
    return '<details class="ws-section broad-ctr"><summary>Melamine, mercury and methyl mercury</summary><div><h5>Melamine · CTR 2.5.1</h5><p>'+escape(m.why)+'</p>'+choice+'<p data-broad-result role="status">'+escape(resolution(id,state.broadForm,state.broadRef))+'</p>'+
      (m.options.length?'<p>Published levels in mg/kg · '+m.options.map(k=>escape(limits[k][0]+' '+limits[k][1])).join(' · ')+'</p>':'')+
      ref(source.melamine,3,'Original melamine table')+' '+ref(source.correction,1,'Clause-number corrigendum')+' '+ref(source.current,51,'Consolidated table')+' '+(m.extra?ref(m.extra[0],m.extra[1],'Product identity source'):'')+' '+(m.law?ref(m.law[0],m.law[1],'Food Safety and Standards Act, section 3'):'')+
      '<h5>Mercury · CTR 2.1.1, item 6</h5>'+(id===root.PMSVMetalPanel?.sajjiId?'':root.PMSVMetalScope.mercuryControls(id,state))+'<p data-hg-value role="status">'+escape(h.article+(h.level?' · '+h.level:''))+'</p><p data-hg-basis>'+escape(h.why)+'</p>'+ref(source.metal,27,'Mercury table p. 27')+' '+ref(source.metal,28,'Mercury table p. 28')+
      '<h5>Methyl mercury · CTR 2.1.1, item 7</h5><p>All foods · '+escape(a.methyl)+'. '+escape(a.unit)+'</p><p>Use a result reported for the stated analyte. A mercury result alone does not quantify methyl mercury.</p>'+ref(source.metal,18,'Original unit heading')+' '+ref(source.metal,28,'All-foods Gazette row')+' '+ref(source.current,12,'Consolidated mercury rows')+'</div></details>';
  }
  function brief(id,state){
    const a=scope(id,state.broadForm,state.broadRef,state);if(!a)return [];
    return ['Melamine (CTR 2.5.1): '+resolution(id,state.broadForm,state.broadRef),'Melamine identity basis: '+a.m.why,'Article evidence reference: '+((a.m.options.length && state.broadRef)||'—'),
      'Mercury (item 6): '+a.h.article+(a.h.level?' · '+a.h.level:'')+'. '+a.h.why,'Methyl mercury (item 7, all foods): '+a.methyl+'. '+a.unit,
      ...(a.m.extra?['Product identity source: '+a.m.extra[0]+'#page='+a.m.extra[1]]:[]),...(a.m.law?['Food-use definition: '+a.m.law[0]+'#page='+a.m.law[1]]:[]),'Melamine source: '+source.melamine+'#page=3','Mercury article source: '+source.metal+'#page='+a.h.page,'Methyl mercury source: '+source.metal+'#page=28'];
  }
  function columns(){return ['Melamine article at catalogue identity','Melamine maximum (mg/kg) or decision needed','Melamine identity condition','Mercury article or decision needed','Mercury maximum at catalogue identity','Methyl mercury, all foods (ppm as element)','Melamine Gazette page','Mercury Gazette page','Methyl mercury Gazette page'];}
  function values(id){const a=scope(id);return a?[a.applied?limits[a.applied][0]:'Identify article / form',a.applied?limits[a.applied][1]:'Select with evidence',a.m.why,a.h.article,a.h.level,'0.25',source.melamine+'#page=3',source.metal+'#page='+a.h.page,source.metal+'#page=28']:[];}
  root.PMSVBroadContaminants=Object.freeze({scope,markup,brief,columns,values,resolution});
})(globalThis);
