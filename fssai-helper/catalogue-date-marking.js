/* Review the two retail date declarations against one documented finished SKU. */
(function(root) {
  'use strict';
  const comp='https://fssai.gov.in/upload/uploadfiles/files/Comp_Labelling%20Display_Version%20VIII_09_09_2025.pdf';
  const sources={
    gazette:'https://fssai.gov.in/upload/notifications/2020/12/5fd87c6a0f6adGazette_Notification_Labelling_Display_14_12_2020.pdf#page=36',
    expiry:comp+'#page=16', small:comp+'#page=21', short:comp+'#page=22',
    alcohol:'https://fssai.gov.in/upload/uploadfiles/files/Comp_Alcoholic_Beverages_V_04_12_2025.pdf#page=11',
    faq:'https://www.fssai.gov.in/upload/uploadfiles/files/FAQ_Labelling_Display_01_11_2023.pdf#page=3'
  };
  const articles={
    other:'Other food outside the eight listed entries',
    produce:'Fresh fruit or vegetable, including potato, sold whole without peeling, cutting or similar treatment',
    wine:'Wine', alcohol:'Alcoholic beverage other than wine', vinegar:'Vinegar',
    candy:'Sugar-boiled confectionery', salt:'Food-grade salt supplied for industrial use',
    sugar:'Solid sugar', gum:'Chewing gum or bubble gum', unresolved:'Classification or product-specific provision unresolved'
  };
  const lives={short:'7 days or less',long:'More than 7 days',unknown:'Shelf life unconfirmed'};
  const dateKinds={made:'Date of manufacture (MFD)',packed:'Date of packaging (PKD)'};
  const clauses={produce:'i',wine:'ii',alcohol:'iii',vinegar:'iv',candy:'v',salt:'vi',sugar:'vii',gum:'viii'};
  const keys=['dateArticle','dateRef','dateLife','dateAbv','dateKind'];
  const known=new Map();
  function identify(group,ids){for(const id of ids)known.set(id,group);}
  identify('candy',['05-05-2-sugar-boiled-confectionery-hard-candy','05-05-2-sugar-boiled-confectionery-soft-candy']);
  identify('gum',['05-05-3-chewing-gum-and-bubble-gum']);
  identify('vinegar',['12-12-3-vinegar']);
  identify('sugar',['11-11-1-refined-sugar','11-11-1-cube-sugar','11-11-1-plantation-white-sugar']);
  identify('other',['05-05-1-chocolate','05-05-1-dry-mixtures-of-cocoa-and-sugars','04-04-1-peeled-or-cut-minimally-processed-fruit']);
  const sourceText=Object.values(sources).join(' | ');
  const columns=['FSSAI retail date-marking sources','Date-marking review for current artwork','Saved date-marking reviews by SKU and artwork'];
  const outcome=(kind,text)=>({kind,text});
  function expiryScope(m,id) {
    const group=m.dateArticle;
    if(!Object.hasOwn(articles,group)||group==='unresolved')return outcome('open','Confirm the marketed article and any product-specific rule.');
    if(known.has(id)&&known.get(id)!==group)return outcome('open','The selected article conflicts with this catalogue identity. Recheck the SKU and worksheet.');
    if(!m.dateRef)return outcome('open','Enter the specification or classification reference for the finished SKU.');
    if(group==='other')return outcome('required','Expiry or use-by is required under 5(10)(a). Best before is additional.');
    if(group==='alcohol'){
      const {decimal,lt}=root.PMSVIngredientPercentage.arithmetic;
      const v=decimal(m.dateAbv);
      if(!v||!v.n||lt(decimal('100'),v))return outcome('open','Enter the documented alcohol percentage by volume for this alcoholic beverage.');
      if(lt(v,decimal('10')))return outcome('alcoholRequired','Alcoholic Beverages 5.10 requires the expiry or use-by day, month and year on a non-wine beverage below 10% ABV.');
    }
    const ref='5(10)(d)('+clauses[group]+')';
    if(!Object.hasOwn(lives,m.dateLife)||m.dateLife==='unknown')return outcome('open','The selected article is listed in '+ref+'. Confirm whether the seven-day provision in 8(3) also applies.');
    if(m.dateLife==='short')return outcome('overlap','Review both '+ref+' and 8(3), which expressly calls for expiry or use-by for a shelf life of seven days or less.');
    return outcome('exempt','The documented article falls under '+ref+'. The expiry indication may be omitted.');
  }
  // Placement and the article decision are independent. Preserve a supported observation on either pack.
  function finding(m,id,key,placement) {
    if(!m.dateArticle||m.pack==='nonretail')return null;
    const seen=m.seen[key],onPack=seen==='pack'||seen==='both';
    const result=(where,state,text)=>({where,state,text});
    if(key==='made'){
      if(m.dateLife==='short'&&m.dateRef){
        return result('Manufacture date may be omitted under 8(3)',onPack?'seen':'info',
          'Shelf life is documented at seven days or less. Regulation 8(3) permits omission of the manufacture date. Check expiry separately.');
      }
      if(seen==='outer'&&placement==='transfer'&&m.dateKind!=='made')return result('Check packaging-date basis','review','8(1)(a) expressly names the date of manufacture. Confirm the date wording before relying on the outer.');
      if((seen==='missing'||seen==='na')&&(!m.dateRef||!m.dateLife||m.dateLife==='unknown'))
        return result('Establish the shelf life','open','Record the approved shelf life before relying on 8(3).');
      return checkOuter();
    }
    function checkOuter(){
      if(placement!=='transfer')return null;
      if(seen==='pack')return result('Verify both retail artworks','review','The date was seen on the individual pack. Check the corresponding multi-unit pack under 8(1)(a), including visibility through a transparent outer where applicable.');
      if(seen==='both'&&(!m.outerRef||!m.measureRef))return result('Record the outer and measurement evidence','open','Both placements were observed. Record the matching retail outer revision and formed-pack measurement.');
      return null;
    }
    const scope=expiryScope(m,id);
    if(scope.kind==='exempt')return result('Expiry indication is exempt for the documented article',onPack?'seen':'info',scope.text);
    if(scope.kind==='open'||scope.kind==='overlap')return result('Review applicability',onPack?'seen':'review',
      scope.text+(onPack?' The expiry or use-by marking was observed on this pack.':''));
    if(seen==='bestBefore')return result('Expiry or use-by is required',placement==='transfer'?'open':'difference',
      scope.text+(placement==='transfer'?' Check the corresponding retail outer for the expiry or use-by date.':' Only a best-before declaration was observed.'));
    if(scope.kind==='alcoholRequired'&&seen==='outer')return result('Check the alcohol-specific declaration','review',scope.text+' Confirm its location against the sector-specific rule.');
    return checkOuter();
  }
  function summary(m,id,rows){
    if(!m.dateArticle||m.pack==='nonretail')return '';
    const fields=[m.sku,m.art,root.PMSVIngredientPercentage.packLabels[m.pack],articles[m.dateArticle],m.dateRef,lives[m.dateLife],
      m.dateArticle==='alcohol'&&m.dateAbv?m.dateAbv+'% ABV':'',dateKinds[m.dateKind],expiryScope(m,id).text];
    for(const r of rows.filter(r=>r.key==='made'||r.key==='expiry'))fields.push(r.field+' · '+r.observed+' · '+r.text);
    return fields.filter(Boolean).join(' | ');
  }
  function form(m,id,field,choice) {
    const suggested=known.get(id);
    let html='<fieldset class="quid-line"><legend>Date marking and expiry exemptions</legend><p>Choose the identity of the food as sold. Record a specification covering the product and its shelf life. Enter date observations in the two declaration rows below.</p>';
    if(suggested)html+='<p>Catalogue starting point: '+articles[suggested]+'. Confirm against the finished SKU.</p>';
    html+=choice('dateArticle','Finished article for the date review',articles);
    if(m.dateArticle){
      html+=field('dateRef','Finished-product specification, classification and shelf-life reference')+choice('dateLife','Approved shelf life',lives)
        +choice('dateKind','Manufacture or packaging wording under review',dateKinds);
      if(m.dateArticle==='alcohol')html+=field('dateAbv','Documented alcohol by volume (%)',true);
    }
    return html+'<p><a class="source-ref" href="'+sources.expiry+'" target="_blank" rel="noopener">Date marking and eight product entries · 5(10)</a> · <a class="source-ref" href="'+sources.small+'" target="_blank" rel="noopener">Inner pack below 30 cm² · 8(1)(a)</a> · <a class="source-ref" href="'+sources.short+'" target="_blank" rel="noopener">Shelf life up to seven days · 8(3)</a> · <a class="source-ref" href="'+sources.alcohol+'" target="_blank" rel="noopener">Alcoholic beverages · 5.10</a></p></fieldset>';
  }
  root.PMSVDateMarking=Object.freeze({keys,articles,sources,sourceText,columns,expiryScope,finding,summary,form});
})(globalThis);
