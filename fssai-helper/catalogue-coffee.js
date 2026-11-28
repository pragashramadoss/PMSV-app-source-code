/* FPSFA 2.10.2–4 and the dated front-label provisions for coffee–chicory blends. */
(function(root){
  'use strict';
  const evidence=root.PMSVCatalogueEvidence,rules=root.PMSVCatalogueRules;
  const blend='coffee-chicory-mixture',ids=['coffee',blend,'chicory'];
  const chapter='https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf';
  const gazette='https://www.fssai.gov.in/upload/notifications/2025/08/689d8d163d422coffee%20chicory_gazette.pdf';
  const direction='https://www.fssai.gov.in/upload/advisories/2026/07/6a604e4037173Direction_Coffee%20Chicory.pdf';
  const earlier='https://www.fssai.gov.in/upload/uploadfiles/files/Comp_Labelling%20Display_Version%20VIII_09_09_2025.pdf#page=36';
  const definitions={
    coffee:[['green','Green or raw coffee beans',[4,5]],['roasted_ground','Roasted or ground coffee',[5]],['decaffeinated_roasted_ground','Decaffeinated roasted and ground coffee',[5,6]],['soluble_coffee','Soluble coffee',[6]],['decaffeinated_soluble','Decaffeinated soluble coffee',[6,7]]],
    [blend]:[['regular_roasted_ground','Roasted and ground blend',[7,8]],['instant','Instant blend',[8]],['decaffeinated_roasted_ground','Decaffeinated roasted and ground blend',[8,9]],['decaffeinated_instant','Decaffeinated instant blend',[9,10]]],
    chicory:[['roasted_chicory','Roasted chicory powder',[7]]]
  };
  const profiles=new Map();
  for(const id of ids){
    const standard=rules.standards[evidence.products[id].standard];
    const forms=definitions[id].map(([key,name,pages])=>{
      const decaf=key.startsWith('decaffeinated');
      const original=decaf?(id===blend?'food-11':'food-25'):'baser02-1';
      const gazetteUrl=evidence.documents[original].url;
      const page=decaf?(id===blend?30:key==='decaffeinated_soluble'?7:6):id===blend?121:120;
      const chapterPages=pages.map(p=>chapter+'#page='+p);
      const source=[gazetteUrl+'#page='+page,...chapterPages].join(' | ');
      const recipe=standard.sections.formulation_rules||[];
      const raw=[...recipe.filter(r=>!r.applies_to||r.applies_to.includes(key)),...(standard.testTables?.[key]||standard.criteria.map(r=>r.spec))];
      const rows=raw.map(original=>{
        const {applies_to,automatic_comparison_requires_variant,source_pages,...spec}=original;
        const pageForSpec=id==='chicory'&&!recipe.includes(original)?121:page;
        const gazettePage=gazetteUrl+'#page='+pageForSpec;
        const review=id==='coffee'&&key==='decaffeinated_roasted_ground'&&spec.parameter==='Water-soluble ash'
          ?'The Gazette gives a 65% minimum without specifying the denominator. The FSSAI method distinguishes percent of sample from percent of total ash. Confirm the reporting basis before comparison.':'';
        const links=[gazettePage,...chapterPages];
        if(review)links.push('https://www.fssai.gov.in/upload/uploadfiles/files/Manual%20of%20Methods%20of%20Analysis%20for%20Beverages%20Tea%2C%20Coffee%20and%20Chicory.pdf');
        return {spec,review,gazettePage,source:links.join(' | ')};
      });
      const criteria=rows.flatMap(({spec,review,gazettePage},i)=>!review&&['<=','>=','range'].includes(spec.operator)?[{i:'coffee-'+key+'-'+i,v:{spec,compare:true,gazette:gazettePage}}]:[]);
      return {key,name,source,rows,criteria};
    });
    profiles.set(id,forms);
  }
  function selected(id,state={}){
    const forms=profiles.get(id);
    return forms?.length===1?forms[0]:forms?.find(f=>f.key===state.coffeeForm);
  }
  function blendNote(){
    return 'Identify the blend as roasted-ground or instant, and regular or decaffeinated. Check the 51% coffee minimum by mass for ground blends and on dry matter for instant blends. Match the front declaration to the approved recipe. A raw-bean residue report applies only to its sampled ingredient lot.';
  }
  function ratio(value){
    const text=String(value||'').trim();
    if(!/^\d{1,3}(?:\.\d{1,10})?$/.test(text))return '';
    const [whole,frac='']=text.split('.'),scale=10n**BigInt(frac.length);
    const coffee=BigInt(whole)*scale+BigInt(frac||0),chicory=100n*scale-coffee;
    if(coffee<=0n||chicory<=0n)return '';
    const format=n=>{
      const tail=(n%scale).toString().padStart(frac.length,'0').replace(/0+$/,'');
      return String(n/scale)+(tail?'.'+tail:'');
    };
    return 'COFFEE : CHICORY = '+format(coffee)+' : '+format(chicory);
  }
  function labelRow(date,state={}){
    const article='Labelling and Display, Schedule II, paragraph 2.2',parameter='Front-of-pack coffee and chicory declaration';
    const base={article,parameter,form:'Packaged coffee–chicory blend',status:'Review front artwork'};
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return {...base,notes:'Enter an assessment date to select the applicable wording.',source:gazette+'#page=3'};
    if(date<'2026-07-01')return {...base,parameter:'Coffee and chicory package declaration',status:'Review pack artwork',notes:'Use the earlier Schedule II declaration for the relevant ground or instant blend.',source:earlier};
    const source=[gazette+'#page=3',gazette+'#page=4'];
    let notes='Use the Gazette declaration for the actual ground or instant blend and give both percentages on the front.';
    if(date>='2026-07-21'){
      source.push(direction+'#page=1',direction+'#page=2');
      notes+=' The 21 July direction also permits either a percentage split headed COFFEE : CHICORY, or a clearly discernible graphic giving both percentages. It applies pending final notification.';
      if(selected(blend,state)){
        const preview=ratio(state.coffeePct);
        if(preview)notes+=' Draft from the entered recipe percentages: '+preview+'.';
        else if(state.coffeePct?.trim())notes+=' Enter the coffee share as a decimal percentage above 0 and below 100 for a two-ingredient blend.';
      }
    }
    return {...base,notes,source:source.join(' | ')};
  }
  function rawBeanRow(id){
    const section=root.PMSV_REVIEW_REGISTER.pesticideReview;
    const group=section.groups.find(g=>g.serial===129);
    const [article,limit,page]=group.rows.find(r=>r[0]==='Coffee (Raw beans)');
    return {article:'CTR 2.3.1, entry 129',form:id===blend?'Separately sampled incoming raw coffee beans':'Raw coffee beans only',parameter:group.printed,
      status:id===blend?'Ingredient sample only':'Confirm raw bean sample',limit,unit:'mg/kg',notes:'Apply to the identified lot of '+article+'. Record the sampling stage and laboratory report. Roasted, extracted and blended samples require a separate residue assessment.',
      source:section.sources.gazette+'#page='+page};
  }
  root.PMSVCoffee=Object.freeze({blend,ids,profiles,selected,ratio,blendNote,labelRow,rawBeanRow,chapter});
})(globalThis);
