/* Milk-logo scope and artwork measurements under the November 2026 notification. */
(function(root){
  'use strict';
  const area='Milk logo on pre-packaged food';
  const start='2028-07-01',publication='2026-11-10';
  const gazette='https://fssai.gov.in/docs/food-law/regulations/amendments/labelling-display/FSS%28Labelling%20and%20Display%29%20-%20Milk%20logo.pdf';
  const chapter='https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf';
  const faq='https://fssai.gov.in/upload/uploadfiles/files/FAQs_Diary_12_07_2022.pdf';
  const direction='https://fssai.gov.in/upload/advisories/2022/12/63932455234b8Direction_Milk_logo_09_12_2022.pdf';
  const sources=[gazette+'#page=3',gazette+'#page=4',chapter+'#page=6',faq+'#page=6',faq+'#page=7',direction+'#page=1'].join(' | ');
  const bands=[
    {area:'Up to 100 (see note at 100)',upper:'100',square:'6',height:'4.56',width:'3'},
    {area:'100 to 500 (see notes at 100 and 500)',upper:'500',square:'8',height:'6.08',width:'4'},
    {area:'500 to 2500 (see note at 500)',upper:'2500',square:'12',height:'9.12',width:'6'},
    {area:'Above 2500',upper:null,square:'16',height:'12.16',width:'8'}
  ];
  const products=new Map();
  const eligible='Eligible standardised product',excluded='Outside milk-logo scope',conditional='Confirm the finished product classification';
  const milkSweets=new Set(['18-18-1-khoa-based-sweets','18-18-1-chhana-based-sweets']);
  const reviewSweets=new Set(['18-18-1-fermented-milk-products-based-indian-sweets','18-18-1-other-composite-milk-products-based-indian-sweets']);
  const exclusions=new Set(['04-04-1-coconut-milk-non-dairy','04-04-1-coconut-cream-non-dairy','04-04-1-coconut-milk-powder','05-05-1-chocolate','07-07-2-biscuit','05-05-2-sugar-boiled-confectionery-hard-candy','05-05-2-sugar-boiled-confectionery-soft-candy','05-05-2-lozenges','05-05-3-chewing-gum-and-bubble-gum']);
  for(const p of root.PMSV_CATALOGUE||[]){
    const id=p.id;
    let scope,note;
    if(id.endsWith('-analogue-in-the-dairy-context')||p.fssr==='2.1.15'){
      scope=excluded;note='A dairy analogue or the named frozen confection with milk constituents replaced is outside the logo categories.';
    }else if(exclusions.has(id)){
      scope=excluded;note='This separately classified food is outside the milk-logo categories. Milk chocolate, milk biscuits and confectionery are examples in FAQ 15. Dairy allergens and ingredients have separate declarations.';
    }else if(id==='02-02-2-fat-spread'||reviewSweets.has(id)){
      scope=conditional;note=id==='02-02-2-fat-spread'?'Identify a standardised milk-fat spread. A mixed or vegetable fat spread needs its own classification.':'Confirm a standardised composite milk product, the role of milk in the recipe and whether any milk constituent was replaced. Proprietary foods are outside the FAQ’s scope.';
    }else if(milkSweets.has(id)||id==='11-11-1-edible-lactose'||id==='100-100-cow-or-buffalo-colostrum-and-colostrum-products'||(/^(01-|02-)/.test(id)&&/^2\.1\.\d+$/.test(p.fssr))){
      scope=eligible;note=id.startsWith('100-100-')?'FAQ 14 expressly includes colostrum and colostrum products. This classification concerns the logo.':'Use for a pre-packaged product conforming to its milk, milk-product or composite milk-product identity. Verify the standard and actual SKU.';
    }
    if(scope)products.set(id,{name:p.product,scope,note});
  }
  const fields=['milkArtwork','milkClass','milkPresent','milkArea','milkSquareW','milkSquareH','milkDropH','milkDropW','milkCmyk'];
  const measures=fields.slice(3);
  const clean=v=>String(v??'').trim();
  function number(value,positive=false){
    const raw=clean(value);
    if(raw.length>32||!/^\d*(?:\.\d+)?$/.test(raw)||!raw)return null;
    const [w,f='']=raw.split('.');
    const n=BigInt((w||'0')+f);
    return positive&&n===0n?null:{n,scale:10n**BigInt(f.length)};
  }
  const cmp=(a,b)=>a.n*b.scale-b.n*a.scale;
  function band(pdp){
    const n=number(pdp,true);
    return n?bands.find(b=>!b.upper||cmp(n,number(b.upper))<=0n):null;
  }
  function adjacentBand(pdp){
    const n=number(pdp,true);
    if(!n)return null;
    if(cmp(n,number('100'))===0n)return bands[1];
    if(cmp(n,number('500'))===0n)return bands[2];
    return null;
  }
  function boundaryNote(pdp){
    const next=adjacentBand(pdp);
    return next?'The Gazette repeats this endpoint in adjacent size bands. The larger minima are '+next.square+' / '+next.height+' / '+next.width+' mm (square side / drop height / drop width).':'';
  }
  function reviewedDate(date){
    return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>=publication&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;
  }
  function phase(date){
    if(!reviewedDate(date))return 'Outside the reviewed date range';
    return date<start?'Artwork planning · graphic specifications effective 1 July 2028':'Graphic specifications in force from 1 July 2028';
  }
  function inspect(id,date,s={}){
    const p=products.get(id);
    if(!p)return '';
    if(!reviewedDate(date))return phase(date);
    if(p.scope===excluded||s.milkClass==='outside')return s.milkPresent==='yes'?'Milk logo shown on a product outside the eligible categories. Review the artwork.':'Outside the eligible categories for the milk logo.';
    if(!clean(s.milkArtwork)||s.milkClass!=='eligible')return 'Record the artwork revision and confirm the standardised finished-product identity.';
    const status=phase(date)+'. ';
    if(s.milkPresent==='no')return status+(date<start?'The artwork has no logo to measure.':'The eligible pack is missing the prescribed logo.');
    if(s.milkPresent!=='yes')return status+'Confirm whether the milk logo is present.';
    const b=band(s.milkArea);
    if(!b)return status+'Enter the verified principal display panel area in cm².';
    const issues=[],missing=[];
    for(const [k,label,min] of [['milkSquareW','square width',b.square],['milkSquareH','square height',b.square],['milkDropH','drop height',b.height],['milkDropW','drop width',b.width]]){
      const got=number(s[k]);
      if(!got)missing.push(label);else if(cmp(got,number(min))<0n)issues.push(label+' below '+min+' mm');
    }
    const w=number(s.milkSquareW),h=number(s.milkSquareH);
    if(w&&h&&cmp(w,h)!==0n)issues.push('outer sides measure differently');
    const colour=clean(s.milkCmyk).split(/\s*\/\s*/);
    if(colour.length!==4||colour.some(v=>!number(v)||cmp(number(v),number('100'))>0n))missing.push('CMYK print values');
    else if(colour.some((v,i)=>cmp(number(v),number(['89','58','0','0'][i]))!==0n))issues.push('CMYK differs from 89/58/0/0');
    const parts=[];
    if(issues.length)parts.push('Review '+issues.join(', ')+'.');
    if(missing.length)parts.push('Pending measurement or evidence for '+missing.join(', ')+'.');
    const next=adjacentBand(s.milkArea);
    if(next){
      parts.push(boundaryNote(s.milkArea));
      if(!issues.length&&!missing.length){
        const both=[[w,next.square],[h,next.square],[number(s.milkDropH),next.height],[number(s.milkDropW),next.width]].every(([v,min])=>cmp(v,number(min))>=0n);
        parts.push(both?'Measurements meet both adjacent bands and the specified CMYK.':'Measurements meet the smaller band only. Confirm the applicable band before artwork approval.');
      }
    }else if(!parts.length)parts.push('Both square sides, drop height, drop width and CMYK meet the published specifications.');
    return status+parts.join(' ');
  }
  const timing='The earlier FSSAI direction allows six months from issue of the specifications for mandatory compliance with the underlying logo provision. The later Gazette sets 1 July 2028 for the graphic specifications. Review these dates separately.';
  function row(id,date,s={}){
    const p=products.get(id);
    if(!p||!reviewedDate(date))return null;
    let notes=p.note;
    if(p.scope!==excluded)notes+=' '+timing;
    if(clean(s.milkArtwork)||s.milkPresent){
      const b=band(s.milkArea);
      const details=[s.milkArtwork,s.milkClass,s.milkPresent?'Logo present: '+s.milkPresent:'',s.milkArea?'PDP '+s.milkArea+' cm²':'',...measures.slice(1).map((k,i)=>clean(s[k])?['Square width','Square height','Drop height','Drop width','CMYK'][i]+' '+s[k]+(k==='milkCmyk'?'':' mm'):''),b?'Minimum A/B/C '+[b.square,b.height,b.width].join('/')+' mm':'',inspect(id,date,s)];
      notes+=' '+details.filter(Boolean).join(' · ');
    }
    return {area,article:'L&D Schedule I (3) and FPSFA 2.1.1(5)(a)',form:'Pre-packaged '+p.name,parameter:'Milk logo · scope and artwork',status:p.scope===excluded?excluded:p.scope+' · '+phase(date),limit:'',unit:'',notes,source:sources};
  }
  function scopeRows(id,date,state={}){
    const out=[['Catalogue ID','Product','Assessment date','Classification','Graphic specifications','Artwork notes','Official sources']];
    for(const [k,p] of products){
      if(id&&k!==id)continue;
      const r=row(k,date,id?state:{});
      if(r)out.push([k,p.name,date,p.scope,p.scope===excluded?'Outside scope':phase(date),r.notes,r.source]);
    }
    return out;
  }
  const sizeRows=()=>[['Actual PDP area (cm²)','Min. each side of square A (mm)','Min. drop height B (mm)','Min. drop width C (mm)','CMYK C/M/Y/K','Effective date','Official Gazette graphic','Boundary note'],...bands.map(b=>[b.area,b.square,b.height,b.width,'89/58/0/0',start,gazette+'#page=4',b===bands[0]?boundaryNote('100'):b===bands[1]?boundaryNote('100')+' '+boundaryNote('500'):b===bands[2]?boundaryNote('500'):''])];
  root.PMSVMilkLogo=Object.freeze({area,products,eligible,excluded,conditional,fields,measures,bands,band,boundaryNote,phase,inspect,row,scopeRows,sizeRows,sources,gazette,faq,start,timing});
})(globalThis);
