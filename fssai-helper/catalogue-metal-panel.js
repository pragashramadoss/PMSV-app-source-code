/* FSSAI CTR 2.1.1(2). Source decisions are separate from an assessment of a laboratory result. */
(function(root){
  'use strict';
  const D=root.PMSVMetalPanelData, old=root.PMSVMetalScopeData, M=root.PMSVMetalScope, B=root.PMSVBroadContaminants, E=root.PMSVCatalogueEvidence;
  if(!D||!M||!B||!E||Object.keys(D.rows).length!==382||Object.keys(D.products).length!==533)return;
  const silverId='100-100-silver-leaf-chandi-ka-warq';
  const silverMetals={Pb:'Pb70',Cu:'Cu8',As:'As31'};
  const sajjiId='99-99-1-sajji-khar';
  const unspecifiedMetals={Pb:'Pb71',Cu:'Cu11',As:'As32',Sn:'Sn16',Cd:'Cd8',Hg:'Hg6'};
  const importLetter='https://indiantradeportal.in/uploads/General%20Documents/NU_SPS-TBT/2021/Dec/cs_ins_26_2021.pdf';
  const importSources=[importLetter+'#page=2',importLetter+'#page=1'];
  const importRule='The FSSAI import clarification of 23 June 2021 and Customs Instruction 26/2021 direct testing of imported Sajji Khar or Papad Khar under the foods-not-specified entries until a specific standard is notified. Match the imported ingredient, consignment and lot. A finished papad or a different alkali requires its own assessment.';
  const importFields=['panelKharForm','panelKharDocument','panelKharLot','panelKharCurrent'];
  const silverSources=[E.documents['food-70'].url+'#page=3',E.documents['chapter-19'].url+'#page=320'];
  const silverFields=['panelSilverForm','panelSilverSpec','panelSilverUse','panelSilverLot','panelSilverDry','panelSilverAs'];
  const silverRule='For a documented lot of edible metallic silver leaf supplied as colour INS 174, the maxima are 10 mg/kg lead and 30 mg/kg copper on dry colouring matter. Arsenic has a 5 mg/kg maximum only when an independent record establishes the non-synthetic colouring classification. Establish permission for the intended use separately.';
  const dextrinId='99-99-7-dietary-fibre-dextrin-soluble-fibre';
  const misriId='11-11-1-misri',trehaloseId='99-99-1-trehalose';
  const syrupId='11-11-1-dried-glucose-syrup';
  const dextrinIdentity='https://www.fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Plant_Sterol_HFD_25_07_2016.pdf#page=5';
  const syrupIdentity='https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20%28Sweetening%20agents%20including%20Honey%29.pdf#page=13';
  const dextrinFields=['panelDextrinForm','panelDextrinSpec','panelDextrinLot','panelDextrinAsh','panelDextrinReport','panelDextrinBasis'];
  const dextrinRule='The starch-conversion entry sets a lead maximum of 5.0 mg/kg only when sulphated ash exceeds 1.0%. Establish the purified ingredient identity under FPSFA 2.11.8 and the sulphated ash of the sampled lot.';
  const syrupRule='FPSFA 2.8.7 allows at most 1.0% sulphated ash by weight in dried glucose syrup. A conforming lot cannot meet the above-1.0% starch-conversion condition. An above-limit ash result requires a separate product-standard review. Confirm the precise lead article independently.';
  const misriRule='For finished Misri documented as sugar under the CTR sugar entry, lead is limited to 5.0 mg/kg by mass when the same lot has more than 1.0% sulphated ash. Misri has a separate total-ash maximum of 0.4%. Record a sulphated-ash determination and the product classification before applying the lead row.';
  const trehaloseNote='Confirm crystalline trehalose made by conversion of starch on the manufacturer’s specification. The group lead maximum of 5.0 mg/kg applies only above 1.0% sulphated ash on the same lot. FPSFA 3.3.4 sets a separate total-ash criterion. JECFA specifies lead at 1 mg/kg for its trehalose grade. Assess that purity specification separately.';
  const trehaloseMonograph='https://www.fao.org/fileadmin/user_upload/jecfa_additives/docs/Monograph1/Additive-472.pdf#page=1';
  const ashProfiles={
    [trehaloseId]:{title:'Lead in starch-derived trehalose',form:'starchTrehalose',sample:'Crystalline trehalose documented as a starch conversion product',rule:trehaloseNote,key:'Pb64',page:20,identity:E.documents['food-13'].url+'#page=39',article:'FPSFA 3.3.4',process:trehaloseMonograph},
    [dextrinId]:{title:'Lead in dietary fibre (dextrin)',form:'ingredient',sample:'Purified dextrin ingredient under FPSFA 2.11.8',rule:dextrinRule,key:'Pb64',page:20,identity:dextrinIdentity,article:'FPSFA 2.11.8'},
    [misriId]:{title:'Lead in finished Misri',form:'misri',sample:'Finished Misri documented as sugar under the CTR entry',rule:misriRule,key:'Pb2',page:18,identity:E.documents['baser02-1'].url+'#page=97',article:'FPSFA 2.8.2'}
  };
  const generalAdditives='99-99-1-additives-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-and-other-';
  const nutraAdditives='99-99-1-additives-va-vf-of-nutraceutical-regulations-excluding-those-already-standardised';
  const additiveGroups={
    [generalAdditives]:{
      forms:[['475','Polyglycerol esters of fatty acids'],['476','Polyglycerol esters of interesterified ricinoleic acid (PGPR)']],
      sources:[E.documents['chapter-19'].url+'#page=174'],
      text:'For a separately supplied INS 475 or INS 476 lot, the named entries set maxima of 2 mg/kg lead, 25 mg/kg copper and 3 mg/kg arsenic. The emulsifier group also has a 3 mg/kg dry-matter arsenic maximum. Check each reporting basis separately.'
    },
    [nutraAdditives]:{
      forms:[['1401','Acid treated starch'],['1417','Acetylated distarch phosphate'],['1422','Acetylated distarch adipate'],['1451','Acetylated oxidized starch']],
      sources:[E.documents['baser06-1'].url+'#page=116',E.documents['baser06-3'].url+'#page=7'],
      text:'For a documented single modified starch supplied as an emulsifier or stabilizer, the group arsenic maximum is 3 mg/kg on dry matter. Identify the INS, its function and current permission for the intended category and format. The historical Schedule VE identifies the substances and functions.'
    }
  };
  const namedEsterRows={'475':{Pb:'Pb113',Cu:'Cu20',As:'As61'},'476':{Pb:'Pb114',Cu:'Cu21',As:'As62'}};
  const additiveFields=['panelAdditiveINS','panelAdditiveSpec','panelAdditiveRoute','panelAdditiveLot','panelAdditiveAsBasis'];
  const additiveGroup=id=>Object.hasOwn(additiveGroups,id)?additiveGroups[id]:null;
  const additiveScope=(id,m)=>id===generalAdditives?['Pb','Cu','As'].includes(m):id===nutraAdditives&&m==='As';
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
  const readingFields=['panelLabNumber','panelLabUnit','panelLabBasis','panelLabRef','panelLabSample','panelLabEdition'];
  const reportUnits=['mg/kg','µg/kg','mg/L','µg/L'];
  const milligramUnit=unit=>unit?.replace(/^µg\//,'mg/');
  const labFields=['panelLabMetal','panelLabAsForm',...readingFields];
  const fields=[...reviewFields.flatMap(k=>[k,k+'Ref']),'panelFpc','panelFpcRef','panelIdentity','panelIdentityRef','panelContainer','panelContainerRef',...labFields,'panelLabOther',...dextrinFields,...additiveFields,...silverFields,...importFields];
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
  const residualKeys=new Set(Object.values(unspecifiedMetals));
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
  function firstSource(id){
    if(id===sajjiId)return {status:'CONDITIONAL_METAL_SOURCE_MATCH',text:importRule,urls:[...importSources,...[20,23,24,26,27].map(page=>source+'#page='+page)]};
    if(id===silverId)return {status:'CONDITIONAL_METAL_SOURCE_MATCH',text:silverRule,urls:[...silverSources,...[20,23,24].map(page=>source+'#page='+page)]};
    const group=additiveGroup(id);
    if(group){
      const pages=id===generalAdditives?[21,23,25]:[25];
      return {status:'CONDITIONAL_METAL_SOURCE_MATCH',text:group.text,urls:[...group.sources,...pages.map(page=>source+'#page='+page)]};
    }
    const ash=ashProfiles[id];
    return ash?{status:'CONDITIONAL_METAL_SOURCE_MATCH',text:ash.rule,urls:[ash.identity,source+'#page='+ash.page,...(ash.process?[ash.process]:[])]}:null;
  }
  function ashLead(id,s){
    const profile=ashProfiles[id];
    const pending=reason=>decision('check',[profile.key],reason);
    if(s.panelDextrinForm==='other')return pending('Review the sampled material under its own identity. '+profile.rule);
    if(s.panelDextrinForm!==profile.form||!textValue(s,'panelDextrinSpec')||!textValue(s,'panelDextrinLot')||
       !textValue(s,'panelDextrinReport')||s.panelDextrinBasis!=='yes')return pending(profile.rule);
    const ash=textValue(s,'panelDextrinAsh').replace(/^\./,'0.');
    const compare=root.PMSVCatalogueWorksheets?.compare;
    if(!compare||compare({operator:'range',min:'0',max:'100'},ash)!==true)return pending('Enter a numerical sulphated ash percentage from the lot report. '+profile.rule);
    const proof=['Lot '+textValue(s,'panelDextrinLot'),'classification/specification '+textValue(s,'panelDextrinSpec'),'sulphated ash '+ash+'%','report/method '+textValue(s,'panelDextrinReport')].join(' · ');
    if(!compare({operator:'>',value:'1.0'},ash))return decision('check',[profile.key],'At or below 1.0% the sulphated-ash condition is unmet. Review other lead provisions separately.',proof);
    return decision('named',[profile.key],'The sampled lot meets the documented sulphated-ash condition. '+profile.rule,proof);
  }
  function additiveRows(id,ins,m){
    if(!additiveGroup(id)?.forms.some(([code])=>code===ins))return [];
    const named=namedEsterRows[ins]?.[m];
    return [named,m==='As'&&'As67'].filter(Boolean);
  }
  function guidedAdditive(id,m,s){
    if(!additiveScope(id,m)||s.panelAdditiveINS==='other')return false;
    // Keep a documented legacy selection for a different article on its original path.
    const prior=s[field(m)];
    if(!s.panelAdditiveINS&&prior&&Object.hasOwn(D.rows,prior)&&evidence(s,field(m))&&
       !additiveGroup(id).forms.some(([code])=>additiveRows(id,code,m).includes(prior)))return false;
    return true;
  }
  function additiveDecision(id,m,s){
    const group=additiveGroup(id);
    const ins=s.panelAdditiveINS,keys=additiveRows(id,ins,m);
    const choices=keys.length?keys:[...new Set(group.forms.flatMap(([code])=>additiveRows(id,code,m)))];
    const pending=why=>decision('check',choices,why+' '+group.text);
    if(!keys.length||!textValue(s,'panelAdditiveSpec')||!textValue(s,'panelAdditiveRoute')||!textValue(s,'panelAdditiveLot'))
      return pending('Identify the single additive lot and document the supplier specification and its eligible 99.1 route. A blend or finished food requires its own article.');
    const basis=s.panelAdditiveAsBasis;
    const key=m==='As'?(basis==='dry'?'As67':basis==='named'?namedEsterRows[ins]?.As:null):keys[0];
    if(!key)return pending('Confirm the article and analytical basis shown on the arsenic report.');
    const dry=key==='As67';
    const reason=dry?'The documented material is an emulsifier or stabilizer and the report gives arsenic on a dry-matter basis.':
      'Use the entry naming the supplied additive. '+(m==='As'?'Also review the separate dry-matter group entry.':'');
    const proof=['INS '+ins,'Specification '+textValue(s,'panelAdditiveSpec'),'Classification/use record '+textValue(s,'panelAdditiveRoute'),'Lot '+textValue(s,'panelAdditiveLot')];
    return decision('named',[key],reason.trim(),proof.join(' · '));
  }
  function additiveCriteriaRows(id){
    const out=[['Catalogue ID','Product','INS','Supplied additive','Metal','Maximum','Unit','Reporting basis','Evidence needed','Identity and classification sources','CTR Gazette']];
    for(const [key,group] of Object.entries(additiveGroups)){
      if(id&&key!==id)continue;
      for(const [ins,name] of group.forms)for(const [metal,m] of metals){
        for(const rowKey of additiveRows(key,ins,m)){
          const r=D.rows[rowKey],dry=rowKey==='As67';
          out.push([key,root.PMSVCatalogueRules.products[key].name,ins,name,metal,literal(rowKey).split(' ')[0],'mg/kg',
            dry?'Dry matter, for the documented emulsifier or stabilizer':'Named additive, mass basis',
            'Single supplied material, supplier specification, lot, current classification and intended-use reference; verify the laboratory reporting basis.',
            group.sources.join(' | '),source+'#page='+r[2]]);
        }
      }
    }
    return out;
  }
  function base(id,m,s){
    if(id===sajjiId&&Object.hasOwn(unspecifiedMetals,m)){
      const key=unspecifiedMetals[m];
      const consignment=textValue(s,'panelKharDocument'),lot=textValue(s,'panelKharLot');
      const matched=s.panelKharForm==='imported'&&consignment&&lot&&s.panelKharCurrent==='yes';
      const reason=matched?'Imported Sajji Khar covered by the FSSAI clarification.':importRule;
      return {...decision(matched?'residual':'check',[key],reason,matched?'Consignment '+consignment+' · Lot '+lot:''),
        identitySources:importSources,articleLabel:matched?'Documented imported Sajji Khar':'Confirm imported ingredient and applicable instruction'};
    }
    if(id===silverId&&Object.hasOwn(silverMetals,m)){
      const keys=[silverMetals[m]],record=(kind,reason,proof)=>({...decision(kind,keys,reason,proof),identitySources:silverSources,articleLabel:kind==='named'?'Documented silver leaf as colour':''});
      if(s.panelSilverForm!=='leaf'||!textValue(s,'panelSilverSpec')||!textValue(s,'panelSilverUse')||!textValue(s,'panelSilverLot')||s.panelSilverDry!=='yes')
        return record('check','Identify the supplied silver leaf as colour INS 174. Record the specification, intended use and permission reference, lot and dry colouring matter basis. Exclude backing, preparations and decorated foods.');
      if(m==='As'&&!textValue(s,'panelSilverAs'))return record('check','Document the independent basis for treating this material as food colouring other than synthetic colouring.');
      const proof=['Specification '+s.panelSilverSpec,'Use and permission '+s.panelSilverUse,'Lot '+s.panelSilverLot];
      if(m==='As')proof.push('Non-synthetic classification '+s.panelSilverAs);
      return record('named','Apply to the separately sampled INS 174 silver leaf on dry colouring matter.',proof.join(' · '));
    }
    if(guidedAdditive(id,m,s))return {...additiveDecision(id,m,s),identitySources:additiveGroup(id).sources};
    if(ashProfiles[id]&&m==='Pb')return ashLead(id,s);
    if(id===syrupId&&m==='Pb')return decision('check',profile(id,m).keys,syrupRule);
    if(groups.fpc.has(id)){
      if(s.panelFpc==='no'&&evidence(s,'panelFpc'))return decision('check',[], 'Identify the applicable product standard and review its catalogue worksheet. The recorded product is outside the FPC 18 direction.',evidence(s,'panelFpc'));
      if(m==='Hg'&&!eligible(id,s)&&M.residualMercury(id))return decision('residual',['Hg6'],'This finished food was independently compared with the named mercury entries. Document category eligibility for the FPC 18 directed assessment.');
      if(primary.includes(m)||m==='Hg'){
        const k=unspecifiedMetals[m];
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
    if(id===sajjiId&&Object.hasOwn(unspecifiedMetals,m))return [];
    if(id===silverId&&Object.hasOwn(silverMetals,m))return [];
    if(guidedAdditive(id,m,s))return [];
    if(m==='Pb'&&(ashProfiles[id]||id===syrupId))return [];
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
      if(additiveScope(id,m)&&s.panelAdditiveINS==='other'&&additiveGroup(id).forms.some(([code])=>additiveRows(id,code,m).includes(k)))return false;
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
    return [d.articleLabel||label[d.kind],items,d.reason,d.proof?'Evidence · '+d.proof:''].filter(Boolean).join(' · ');
  }
  const pdfLinks=keys=>[...new Set(keys.flatMap(pages))].sort((a,b)=>a-b).map(pg=>ref(source+'#page='+pg,'PDF p. '+pg)).join(' ');
  function renderRows(id,s={}){
    if(!known(id))return '';
    const ds=panel(id,s),st=status(id,s);
    return '<p data-panel-progress role="status">'+st.exact+' of 11 headings have an exact article or a confirmed absence of a named row.'+
      (st.common?' Another '+st.common+' have a common maximum across the possible articles.':'')+'</p>'+
      '<div class="ws-scroll"><table><thead><tr><th>Metal</th><th>Decision</th><th>Published entry and basis</th><th>Scope and sources</th></tr></thead><tbody>'+
      ds.map(d=>'<tr data-panel-metal="'+d.key+'"><th scope="row">'+escape(d.name)+'</th><td>'+escape(d.articleLabel||label[d.kind])+'</td><td>'+
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
  function parseReading(text,unit){
    if(!reportUnits.includes(unit))return null;
    const parts=String(text).trim().match(/^(<=|≤|<)?\s*\+?(\d+(?:\.\d+)?|\.\d+)$/);
    if(!parts)return null;
    const qualifier=parts[1]==='<='?'≤':parts[1]||'';
    let [whole,fraction='']=parts[2].split('.');
    whole=whole||'0';
    // Shift the decimal point as text so long laboratory readings are never rounded.
    if(unit.startsWith('µg/')){
      const padded=whole.padStart(4,'0');
      whole=padded.slice(0,-3);
      fraction=padded.slice(-3)+fraction;
    }
    fraction=fraction.replace(/0+$/,'');
    const amount=whole.replace(/^0+(?=\d)/,'')+(fraction?'.'+fraction:'');
    if(qualifier==='<'&&amount==='0')return null;
    const basis=milligramUnit(unit);
    const equivalent=basis===unit?'':' Equivalent to '+qualifier+amount+' '+basis+'.';
    return {amount,qualifier,equivalent};
  }
  function compareUpperBound(spec,reading){
    const compare=root.PMSVCatalogueWorksheets.compare;
    if(spec.operator==='range'){
      const belowMinimum=compare({operator:reading.qualifier==='<'?'<=':'<',value:spec.min},reading.amount);
      if(belowMinimum)return 'Outside the cited range. The reported bound places the result below the minimum.';
      if(compare({operator:'>',value:'0'},spec.min))return 'Inconclusive. An upper bound alone cannot establish that the minimum is met.';
    }
    const maximum=spec.operator==='range'?spec.max:spec.value;
    return compare({operator:'<=',value:maximum},reading.amount)
      ?'Reported upper bound is within the cited maximum.'
      :'Inconclusive. The reporting bound exceeds the cited maximum.';
  }
  function lab(id,s={},planned){
    const m=s.panelLabMetal;
    if(!known(id)||!Object.hasOwn(names,m))return '';
    const date=s.vetDate??root.PMSVVeterinary.reviewDate;
    const d=forMetal(id,m,s);
    const row=planned||root.PMSVTestingPlan.metalRow(id,{...d,name:names[m]},date);
    if(!row)return 'Select an assessment date covered by the reviewed metal editions.';
    let c=criterion(id,d),description=c?names[m]+' · '+rowText(c.key):'';
    if(Object.hasOwn(row,'labKey')){
      if(!row.labKey)return row.notes;
      if(row.labKey==='fishArsenic'&&!['total','inorganic'].includes(s.panelLabAsForm))return 'Identify whether the report measured total arsenic or inorganic arsenic in fish oil.';
      c={spec:{operator:'<=',value:row.limit},units:['mg/kg']};
      description=row.parameter+' · '+row.form+' · '+row.limit+' '+row.unit;
    }
    if(groups.fishOil.has(id)&&m==='As'&&s.panelLabAsForm==='inorganic'&&row.labKey!=='fishArsenic')return 'Review the reported inorganic arsenic against a source covering that species on this assessment date.';
    if(id===sajjiId&&Object.hasOwn(unspecifiedMetals,m)){
      if(!c)return d.reason;
      if(textValue(s,'panelLabNumber')&&textValue(s,'panelLabSample')!==textValue(s,'panelKharLot'))return 'Match the laboratory sample to the lot on the import record.';
      if(textValue(s,'panelLabNumber')&&milligramUnit(s.panelLabUnit)!=='mg/kg')return 'Use a mass-based result for the imported solid ingredient.';
    }
    if(id===silverId&&Object.hasOwn(silverMetals,m)){
      if(!c)return d.reason;
      if(textValue(s,'panelLabNumber')&&textValue(s,'panelLabSample')!==textValue(s,'panelSilverLot'))return 'Enter the same silver-leaf lot identifier for the material and laboratory report.';
    }
    if(guidedAdditive(id,m,s)){
      if(!c)return d.reason;
      if(textValue(s,'panelLabNumber')&&textValue(s,'panelLabSample')!==textValue(s,'panelAdditiveLot'))return 'Enter the same additive lot identifier on the specification and laboratory report before comparison.';
      if(textValue(s,'panelLabNumber')&&milligramUnit(s.panelLabUnit)!=='mg/kg')return 'The cited additive entry requires a mass-based report in mg/kg or µg/kg.';
    }
    if(m==='Pb'&&ashProfiles[id]){
      if(!c)return d.reason;
      if(textValue(s,'panelLabNumber')&&textValue(s,'panelLabSample')!==textValue(s,'panelDextrinLot'))return 'Enter the same lot identifier on the lead and sulphated ash reports before comparing the lead result.';
    }
    if(!c)return 'A comparison requires an applicable numeric article with the correct basis. Dehydrated milk under the milk row also needs a concentration-factor assessment.';
    const number=textValue(s,'panelLabNumber');
    if(!number)return description;
    const edition=root.PMSVVeterinary.edition(date);
    const unconfirmedEdition=s.panelLabEdition?s.panelLabEdition!==edition:!!row.labKey;
    if(!reportUnits.includes(s.panelLabUnit)||!c.units.includes(milligramUnit(s.panelLabUnit))||s.panelLabBasis!=='yes'||unconfirmedEdition||!textValue(s,'panelLabRef'))
      return 'Confirm the matching unit, matrix, analytical basis and laboratory report reference for this assessment edition before comparing. '+description;
    if(row.labKey==='fishArsenic'&&s.panelLabAsForm==='total')return root.PMSVTestingPlan.fishOilScreen(number,s.panelLabUnit);
    const measured=parseReading(number,s.panelLabUnit);
    if(!measured)return 'Manual review required. Enter a non-negative decimal result or a numeric upper bound from the report, such as <10.';
    if(measured.qualifier)return compareUpperBound(c.spec,measured)+measured.equivalent;
    const outcome=root.PMSVCatalogueWorksheets.compare(c.spec,measured.amount);
    if(outcome===null)return 'Review the numerical criterion and reporting basis for the selected article.';
    const assessment=(outcome?'Within':'Outside')+' the cited '+row.parameter+' criterion';
    return (planned?assessment+'.':assessment+' · '+number+' '+s.panelLabUnit+' · '+description+' · Report '+textValue(s,'panelLabRef'))+measured.equivalent;
  }
  // Keep the selected measurement in its original fields so older worksheets reopen directly.
  // Only the other measurements live in the per-product record below.
  function reportKey(id,metal,form){
    if(!Object.hasOwn(names,metal))return '';
    return groups.fishOil.has(id)&&metal==='As'&&['total','inorganic'].includes(form)?metal+'_'+form:metal;
  }
  function otherReports(s){
    if(!s.panelLabOther)return {};
    try{
      const data=JSON.parse(s.panelLabOther);
      if(data&&typeof data==='object'&&!Array.isArray(data))return data;
    }catch(_){}
    return {};
  }
  function reading(s={}){
    return Object.fromEntries(readingFields.map(k=>[k,typeof s?.[k]==='string'?s[k]:'']));
  }
  function storeOthers(s,others){
    s.panelLabOther=Object.keys(others).length?JSON.stringify(others):'';
  }
  function setInput(node,s,k,value){
    s[k]=value;
    const el=node.querySelector('[data-ws-field="'+k+'"]');
    if(el){if(el.type==='checkbox')el.checked=value==='yes';else el.value=value;}
  }
  function switchReading(node,id,s,key,previous){
    const metal=s.panelLabMetal,form=s.panelLabAsForm;
    const from=reportKey(id,key==='panelLabMetal'?previous:metal,key==='panelLabAsForm'?previous:form);
    const to=reportKey(id,metal,form);
    if(from===to)return;
    const others=otherReports(s);
    if(from){
      if(readingFields.some(k=>textValue(s,k)))others[from]=reading(s);
      else delete others[from];
    }
    const restored=reading(others[to]);
    if(to)delete others[to];
    for(const k of readingFields)setInput(node,s,k,restored[k]);
    storeOthers(s,others);
  }
  function clearConfirmations(node,s,key){
    // Per-metal article edits affect only that metal. Broader product/edition edits can affect every row.
    const specific=metals.find(([,m])=>key===field(m)||key===field(m)+'Ref')?.[1];
    const affected=dextrinFields.includes(key)?'Pb':specific||(key.startsWith('mercuryArticle')?'Hg':key.startsWith('panelContainer')?'Sn':'');
    if(!affected||s.panelLabMetal===affected){
      setInput(node,s,'panelLabBasis','');s.panelLabEdition='';
    }
    const others=otherReports(s);
    for(const [slot,r] of Object.entries(others)){
      if(!r||typeof r!=='object'||affected&&slot.split('_')[0]!==affected)continue;
      r.panelLabBasis='';r.panelLabEdition='';
    }
    storeOthers(s,others);
  }
  function reportLines(id,s={},date=s.vetDate??root.PMSVVeterinary.reviewDate){
    if(!known(id)||(!textValue(s,'panelLabNumber')&&!s.panelLabOther))return [];
    const active=reportKey(id,s.panelLabMetal,s.panelLabAsForm),others=otherReports(s),out=[];
    for(const [name,metal] of metals){
      const forms=groups.fishOil.has(id)&&metal==='As'?['','total','inorganic']:[''];
      for(const form of forms){
        const key=reportKey(id,metal,form),record=key===active?s:others[key];
        if(!textValue(record||{},'panelLabNumber'))continue;
        const state={...s,...reading(record),panelLabMetal:metal,panelLabAsForm:form,vetDate:date};
        const d=forMetal(id,metal,state),row=root.PMSVTestingPlan.metalRow(id,{...d,name},date);
        const label=form==='total'?'Total arsenic':form==='inorganic'?'Inorganic arsenic':row?.labKey==='fishArsenic'?'Arsenic species unconfirmed':name;
        const result=state.panelLabNumber.trim()+' '+(state.panelLabUnit||'(unit pending)');
        const sample=textValue(state,'panelLabSample'),reference=textValue(state,'panelLabRef'),outcome=lab(id,state,row);
        const summary=['Reported result: '+label+' '+result,sample&&'Sample: '+sample,reference&&'Report: '+reference,outcome].filter(Boolean).join(' · ');
        out.push({metal,label,result,sample,reference,outcome,summary,source:row?.source||'',date});
      }
    }
    return out;
  }
  function readingTable(id,s){
    const records=reportLines(id,s);
    if(!records.length)return '';
    return '<div class="ws-scroll"><table><caption>Entered metal results</caption><thead><tr>'+
      ['Analyte','Reported result','Sample or lot','Report reference','Comparison'].map(t=>'<th>'+t+'</th>').join('')+
      '</tr></thead><tbody>'+records.map(r=>'<tr><th scope="row">'+escape(r.label)+'</th>'+
        [r.result,r.sample,r.reference,r.outcome].map(t=>'<td>'+escape(t)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  }
  function labSummary(id,s){
    const lines=reportLines(id,s);
    return lines.length?lines.map(r=>['Assessment '+(r.date||'(date pending)'),r.summary,r.source].filter(Boolean).join(' · ')).join(' | '):lab(id,s);
  }
  function fishArsenic(id,s){
    return groups.fishOil.has(id)&&s.panelLabMetal==='As';
  }
  function controls(id,s={}){
    if(!known(id))return '';
    let extra='';
    const group=additiveGroup(id);
    if(id===sajjiId)extra+='<fieldset><legend>Imported Sajji Khar or Papad Khar</legend><p>'+escape(importRule)+'</p>'+
      '<label>Sample identity'+pick('panelKharForm',[['imported','Imported Sajji Khar or Papad Khar ingredient'],['other','Domestic material, other alkali or finished food']],s)+'</label>'+
      '<label>Bill of entry or import consignment reference'+input('panelKharDocument',s)+'</label>'+
      '<label>Ingredient lot on the import record'+input('panelKharLot',s)+'</label>'+
      '<label class="ws-check"><input type="checkbox" data-ws-field="panelKharCurrent"'+(s.panelKharCurrent==='yes'?' checked':'')+'> The interim instruction applies to this consignment on the assessment date</label>'+
      '<p>'+ref(importSources[0],'FSSAI import clarification, p. 2')+' '+ref(importSources[1],'Customs Instruction 26/2021, p. 1')+'</p>'+
      '<button type="button" data-sample-review-export>Download the six metal checks</button></fieldset>';
    if(id===silverId)extra+='<fieldset><legend>Silver leaf supplied as a food colour</legend><p>'+escape(silverRule)+'</p>'+
      '<label>Sampled material'+pick('panelSilverForm',[['leaf','Separate edible metallic leaf, INS 174'],['other','Decorated food, premix or other sample']],s)+'</label>'+
      '<label>Food-grade silver leaf supplier specification'+input('panelSilverSpec',s)+'</label>'+
      '<label>Intended use and applicable permission reference'+input('panelSilverUse',s)+'</label>'+
      '<label>Sampled silver-leaf lot ID'+input('panelSilverLot',s)+'</label>'+
      '<label class="ws-check"><input type="checkbox" data-ws-field="panelSilverDry"'+(s.panelSilverDry==='yes'?' checked':'')+'> The analytical basis is dry colouring matter for the silver leaf alone</label>'+
      '<label>Independent non-synthetic classification reference for arsenic'+input('panelSilverAs',s)+'</label></fieldset>';
    if(group)extra+='<fieldset><legend>Metals in the supplied additive</legend><p>'+escape(group.text)+'</p>'+
      '<label>Sampled material'+pick('panelAdditiveINS',[...group.forms.map(([ins,name])=>[ins,'INS '+ins+' · '+name]),['blend','Premix, carrier preparation or downstream food'],['other','Another single additive for manual article review']],s)+'</label>'+
      '<label>Supplier specification and single-substance identity'+input('panelAdditiveSpec',s)+'</label>'+
      '<label>Current classification, intended food or format and permission reference'+input('panelAdditiveRoute',s)+'</label>'+
      '<label>Supplier or sampled lot ID'+input('panelAdditiveLot',s)+'</label>'+
      '<label>Arsenic article and laboratory reporting basis'+pick('panelAdditiveAsBasis',[...(id===generalAdditives?[['named','Mass basis for the named additive']]:[]),['dry','Documented emulsifier or stabilizer function; arsenic reported on dry matter']],s)+'</label></fieldset>';
    const ash=ashProfiles[id];
    if(ash)extra+='<fieldset><legend>'+escape(ash.title)+'</legend><p>'+escape(ash.rule)+'</p>'+
      '<label>Sampled material'+pick('panelDextrinForm',[[ash.form,ash.sample],['other','A different material or an unresolved classification']],s)+'</label>'+
      '<label>Product specification and classification reference'+input('panelDextrinSpec',s)+'</label><label>Sample or lot identifier on the ash report'+input('panelDextrinLot',s)+'</label>'+
      '<label>Measured sulphated ash (% by weight)'+input('panelDextrinAsh',s)+'</label><label>Ash report and method reference'+input('panelDextrinReport',s)+'</label>'+
      '<label class="ws-check"><input type="checkbox" data-ws-field="panelDextrinBasis"'+(s.panelDextrinBasis==='yes'?' checked':'')+'> The report measures sulphated ash on the applicable basis for this lot</label>'+
      '<p>'+ref(ash.identity,ash.article)+' '+(ash.process?ref(ash.process,'JECFA trehalose specification')+' ':'')+ref(source+'#page='+ash.page,'Lead · Gazette p. '+ash.page)+'</p>'+
      (id===dextrinId?'<button type="button" data-dextrin-export>Download dextrin lead check</button>':'<button type="button" data-sugar-export>Download '+(id===trehaloseId?'trehalose':'Misri')+' checks</button>')+'</fieldset>';
    if(groups.fpc.has(id))extra+='<label>FPC 18 eligibility'+pick('panelFpc',[['yes','Eligible finished FPC 18 sweet or snack; existing categories 01–14 checked'],['no','An existing product standard or a different category applies']],s)+'</label>'+supporting('panelFpc',s)+'<p>'+ref(direction+'#page=1','FPC 18 direction · paragraphs 3 and 4')+'</p>';
    if(groups.unidentified.has(id))extra+='<label>Exact supplied food-grade material and manufacturing function'+input('panelIdentity',s)+'</label>'+supporting('panelIdentity',s);
    const tin=profile(id,'Sn');
    if(!old.confectionery[id]&&!groups.alwaysCanned.has(id)&&['same','check','unidentified'].includes(tin.kind))
      extra+='<label>Canning of this finished article'+pick('panelContainer',[['can','Canned/sterilised as a canned food'],['other','Supplied without canning']],s)+'</label>'+supporting('panelContainer',s);
    const transitions=nextEdition(id);
    const current=ref(source+'#page=18','Original Gazette table, PDF pp. 18–28');
    return extra+'<details class="ws-section metal-evidence"><summary>Record a metal article and supporting evidence</summary><div data-panel-choices>'+choices(id,s)+'</div></details>'+
      '<details class="ws-section metal-analysis"><summary>Check a reported metal result</summary><p>Enter one measurement per metal. Switching metals retains the other entries. For fish oil, select total or inorganic arsenic as reported. Save the worksheet to keep the measurements on this device. Use the cited unit, sample and analytical basis.</p>'+
      '<label>Assessment date<input type="date" data-plan-vet-date value="'+escape(s.vetDate??root.PMSVVeterinary.reviewDate)+'"></label>'+
      '<label>Metal'+pick('panelLabMetal',metals.map(([n,m])=>[m,n]),s,'Select a metal')+'</label>'+
      '<label data-panel-arsenic-form'+(fishArsenic(id,s)?'':' hidden')+'>Arsenic reported by the laboratory'+pick('panelLabAsForm',[['total','Total arsenic'],['inorganic','Inorganic arsenic']],s,'Unspecified on report')+'</label><label>Reported result or upper bound<input type="text" placeholder="e.g. 10 or &lt;10" data-ws-field="panelLabNumber" value="'+escape(s.panelLabNumber||'')+'"></label>'+
      '<label>Reported unit'+pick('panelLabUnit',reportUnits.map(u=>[u,u]),s,'Select the reported unit')+'</label><label class="ws-check"><input type="checkbox" data-ws-field="panelLabBasis"'+(s.panelLabBasis==='yes'?' checked':'')+'> The report matches the cited food, edible portion, mass or volume unit and analytical basis</label><label>Laboratory report or sample reference'+input('panelLabRef',s)+'</label><label>Sample or lot identifier (optional)'+input('panelLabSample',s)+'</label><p data-panel-lab role="status">'+escape(lab(id,s))+'</p><div data-panel-report-list>'+readingTable(id,s)+'</div></details>'+
      '<details class="ws-section metal-lookup"><summary>Search the 382 published metal entries</summary><label>Metal<select data-panel-search-metal>'+metals.map(([n,m])=>'<option value="'+m+'">'+escape(n)+'</option>').join('')+'</select></label><label>Food, ingredient or basis<input type="search" data-panel-search placeholder="e.g. milk, dry matter or confectionery"></label><div data-panel-found>'+findRows('Pb','')+'</div>'+current+'</details>'+
      (transitions.length?'<details class="ws-section metal-change"><summary>Metal changes effective 1 December 2026</summary>'+transitions.map(t=>'<p>'+escape(t)+'</p>').join('')+ref(amendment+'#page=4','Amendment · PDF pp. 4–5')+'</details>':'')+
      (groups.foodChem.has(id)?'<p>CTR 2.1.1(1) also calls for metals specified in the relevant Indian Pharmacopoeia monograph for chemicals described there. Review its purity requirements for this ingredient.</p>':'');
  }
  function update(node,id,k,s,previous){
    if(id===sajjiId&&previous!==s[k]){
      if(k==='panelKharForm')for(const f of importFields.slice(1))setInput(node,s,f,'');
      if(['panelKharDocument','panelKharLot','vetDate'].includes(k))setInput(node,s,'panelKharCurrent','');
    }
    if(silverFields.includes(k)&&previous!==s[k]){
      if(k==='panelSilverForm')for(const f of silverFields.slice(1))setInput(node,s,f,'');
      if(['panelSilverSpec','panelSilverUse','panelSilverLot'].includes(k)){
        setInput(node,s,'panelSilverDry','');setInput(node,s,'panelSilverAs','');
      }
    }
    if(k==='panelAdditiveINS'&&s[k]!==previous){
      for(const f of additiveFields.slice(1))setInput(node,s,f,'');
      for(const m of ['Pb','Cu','As'])if(additiveScope(id,m)){s[field(m)]='';s[field(m)+'Ref']='';}
    }
    if(dextrinFields.includes(k)&&k!=='panelDextrinBasis'&&previous!==s[k]){
      setInput(node,s,'panelDextrinBasis','');
      if(k==='panelDextrinForm'||k==='panelDextrinLot'){
        for(const f of ['panelDextrinReport','panelDextrinAsh'])setInput(node,s,f,'');
        if(k==='panelDextrinForm')for(const f of ['panelDextrinSpec','panelDextrinLot'])setInput(node,s,f,'');
      }
    }
    if(reviewFields.includes(k)||k==='panelFpc'||k==='panelContainer')setInput(node,s,k+'Ref','');
    if(['metalForm','metalPack','panelFpc','panelIdentity','panelIdentityRef'].includes(k)){
      for(const f of reviewFields){s[f]='';s[f+'Ref']='';}
      if(k==='panelIdentity')setInput(node,s,'panelIdentityRef','');
    }
    if(k==='panelContainer'){s.panel_Sn='';s.panel_SnRef='';}
    if(k==='panelLabUnit'&&previous&&milligramUnit(previous)!==milligramUnit(s.panelLabUnit)){
      setInput(node,s,'panelLabBasis','');
      s.panelLabEdition='';
    }
    if(k==='panelLabBasis')s.panelLabEdition=s.panelLabBasis==='yes'?root.PMSVTestingPlan.metalEdition(s.vetDate):'';
    if(k==='panelLabMetal'||k==='panelLabAsForm')switchReading(node,id,s,k,previous);
    else if(!labFields.includes(k))clearConfirmations(node,s,k);
    if(!labFields.includes(k)){
      node.querySelector('[data-metal-results]').innerHTML=renderRows(id,s);
      if(['panelAdditiveINS','metalForm','metalFormRef','metalPack','metalPackRef','panelFpc','panelFpcRef','panelIdentity','panelIdentityRef','panelContainer','panelContainerRef'].includes(k))node.querySelector('[data-panel-choices]').innerHTML=choices(id,s);
    }
    const species=node.querySelector('[data-panel-arsenic-form]');
    if(species)species.hidden=!fishArsenic(id,s);
    const result=node.querySelector('[data-panel-lab]');
    if(result)result.textContent=lab(id,s);
    const list=node.querySelector('[data-panel-report-list]');
    if(list)list.innerHTML=readingTable(id,s);
  }
  function columns(){return ['Metal headings with exact article or exclusion (of 11)','Additional metal headings with equal limits across eligible rows',...metals.map(([name])=>name+' · full CTR metal table'),'Current original metal source (all 382 rows)','Metal transition from 1 Dec 2026','Documented metal articles and references','Metal laboratory comparison'];}
  function values(id,s={}){
    const ds=panel(id,s);if(!ds.length)return [];
    const st=status(id,s),notes=nextEdition(id);
    const recorded=ds.filter(d=>d.proof).map(d=>d.name+' · '+compact(d));
    if(qualified(s,'panelContainer',['can','other']))recorded.unshift('Canning · '+s.panelContainer+' · '+evidence(s,'panelContainer'));
    if(textValue(s,'panelIdentity')&&evidence(s,'panelIdentity'))recorded.unshift(textValue(s,'panelIdentity')+' · '+evidence(s,'panelIdentity'));
    return [st.exact,st.common,...ds.map(compact),source+'#page=18',notes.length?notes.join(' ')+' '+amendment+'#page=4':'',recorded.join(' | '),labSummary(id,s)];
  }
  function brief(id,s={}){
    if(!known(id))return [];
    const st=status(id,s),notes=nextEdition(id);
    const details=[];
    if(textValue(s,'panelIdentity')&&evidence(s,'panelIdentity'))details.push('Supplied material · '+textValue(s,'panelIdentity')+' · '+evidence(s,'panelIdentity'));
    if(qualified(s,'panelContainer',['can','other']))details.push('Canning · '+s.panelContainer+' · '+evidence(s,'panelContainer'));
    if(qualified(s,'panelFpc',['yes','no']))details.push('FPC 18 eligibility · '+s.panelFpc+' · '+evidence(s,'panelFpc'));
    const summary=labSummary(id,s);
    return [...details,'Complete metal table · '+st.exact+' of 11 exact headings · '+st.common+' additional common maxima',...panel(id,s).map(d=>d.name+' · '+compact(d)),
      'Original Gazette · '+source+'#page=18',...(notes.length?[...notes,amendment+'#page=4']:[]),...(summary?['Metal result · '+summary]:[])];
  }
  root.PMSVMetalPanel=Object.freeze({sajjiId,unspecifiedMetals,importSources,silverId,silverMetals,misriId,trehaloseId,trehaloseNote,additiveGroups,additiveGroup,additiveCriteriaRows,dextrinId,syrupId,syrupIdentity,syrupRule,firstSource,fields,metals,labels:Object.freeze(label),panel,forMetal,status,stats,limit,rowText,renderRows,controls,findRows,parseReading,lab,reportLines,update,brief,columns,values,nextEdition});
})(globalThis);
