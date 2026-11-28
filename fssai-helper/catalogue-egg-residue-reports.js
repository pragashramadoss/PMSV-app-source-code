/* Egg production EMRLs and the HCH entries in the Indian egg-powder export order. */
(function(root){
  'use strict';
  const id=root.PMSVVeterinary.eggPowderId;
  const area='Egg residue report checks';
  const gazette='https://fssai.gov.in/upload/uploadfiles/files/2_Notification%20dt%2017_10_2024.pdf';
  const order='https://www.eicindia.gov.in/WebApp1/resources/PDF/Order_Egg_Products1.pdf#page=7';
  const units=['mg/kg','µg/kg'];
  const groups=[
    {key:'intake',title:'Incoming hen eggs',form:'Separately sampled incoming whole hen eggs',article:'CTR 2.3.2(2)',
      role:'Incoming egg sample',status:'Production EMRL for an incoming egg sample',source:gazette+'#page=17 | '+gazette+'#page=18',
      note:'These drugs are prohibited in production. An EMRL comparison does not authorise use. Use the laboratory result for the incoming egg sample. The reviewed provision gives no factor for transferring it to a dried powder.',
      rows:[['cap','Chloramphenicol','0.3'],['col','Colistin','1'],['aoz','AOZ (furazolidone marker)','1'],['sem','SEM (nitrofurazone marker)','1'],['amoz','AMOZ (furaltadone marker)','1'],['ahd','AHD (nitrofurantoin marker)','1']],unit:'µg/kg'},
    {key:'powder',title:'Finished egg powder for export',form:'Finished egg powder sampled for export from India',article:'S.O. 4368(E), clause (e)(3)',
      role:'Export consignment',status:'HCH reference for an export powder lot',source:order,
      note:'Use results for the same finished powder lot. Review the total, alpha and beta entries together with the separate lindane entry. The importing country’s stricter requirements also apply. Verify the destination specification independently.',
      rows:[['total','HCH (all isomers combined)','0.03'],['alpha','Alpha-HCH','0.02'],['beta','Beta-HCH','0.01'],['gamma','Lindane (gamma-HCH)','0.1']],unit:'mg/kg'}
  ];
  for(const group of groups){
    const prefix=group.key==='intake'?'eggIntake':'eggExportHch';
    group.lot=prefix+'Lot';group.report=prefix+'Report';group.unitField=prefix+'Unit';
    group.rows=group.rows.map(([code,name,max])=>({code,name,max,field:prefix+'_'+code}));
    group.fields=[group.lot,group.report,group.unitField,...group.rows.map(r=>r.field)];
  }
  const fields=groups.flatMap(g=>g.fields);
  function reading(raw,unit){
    return units.includes(unit)&&String(raw??'').length<=32?root.PMSVMetalPanel.parseReading(raw,unit):null;
  }
  function compare(g,r,s={}){
    if(!String(s[r.field]??'').trim())return 'Awaiting result';
    if(!String(s[g.lot]||'').trim()||!String(s[g.report]||'').trim())return 'Enter the sample lot and laboratory report';
    if(!units.includes(s[g.unitField]))return 'Select the mass unit printed on the report';
    const value=reading(s[r.field],s[g.unitField]),limit=reading(r.max,g.unit);
    if(!value)return 'Enter an exact result or a numerical upper bound. For ND or <LOQ, enter the reporting bound with its qualifier.';
    const within=root.PMSVCatalogueWorksheets.compare({operator:'<=',value:limit.amount},value.amount);
    if(value.qualifier)return within?'Reported upper bound is within this limit':'Inconclusive. The reporting bound exceeds this limit';
    return within?'Result is within this limit':'Result exceeds this limit';
  }
  function hchReview(s={}){
    const g=groups[1],unit=s[g.unitField];
    if(!g.rows.some(r=>String(s[r.field]??'').trim()))return 'Enter the reported all-isomer total and the three individual results.';
    const data=g.rows.map(r=>reading(s[r.field],unit));
    const decisions=g.rows.map(r=>compare(g,r,s));
    const flags=[];
    if(data[0]){
      // Exact component results establish a lower bound on the all-isomer total.
      // parseReading can add three fractional places when converting a 32-character result.
      const rawValue=t=>{const [w,f='']=t.split('.');return {n:BigInt(w+f),scale:10n**BigInt(f.length)};};
      const values=data.slice(1).filter(v=>v&&!v.qualifier).map(v=>rawValue(v.amount));
      const total=rawValue(data[0].amount);
      const scale=values.reduce((a,v)=>v.scale>a?v.scale:a,total.scale);
      const sum=values.reduce((a,v)=>a+v.n*(scale/v.scale),0n),bound=total.n*(scale/total.scale);
      if(values.length&&(sum>bound||sum===bound&&data[0].qualifier==='<'))flags.push('Check report consistency: the exact individual results are incompatible with the reported all-isomer total. Confirm sample identity, units and rounding with the laboratory.');
    }
    const over=g.rows.filter((r,i)=>decisions[i]==='Result exceeds this limit').map(r=>r.name);
    if(over.length)flags.push('Above the export-order reference: '+over.join(', ')+'.');
    if(decisions.some(v=>!v.startsWith('Result is within')&&!v.startsWith('Reported upper bound is within')&&v!=='Result exceeds this limit'))flags.push('One or more comparisons still need a result, a numerical reporting bound, or sample details.');
    if(!flags.length)flags.push('All four reported values or bounds are within the export-order references. Verify any stricter destination limits for this consignment.');
    return flags.join(' ');
  }
  function planRows(product,s={}){
    if(product!==id)return [];
    return groups.flatMap(g=>g.rows.map(r=>{
      const entered=String(s[r.field]??'').trim();
      const note=[g.note,'Reference maximum '+r.max+' '+g.unit+'.'];
      if(entered)note.push([s[g.lot],s[g.report],entered,s[g.unitField],compare(g,r,s)].filter(Boolean).join(' · '));
      if(g.key==='powder'&&r.code==='total'&&g.rows.some(x=>s[x.field]))note.push(hchReview(s));
      return {area,article:g.article,form:g.form,parameter:r.name,role:g.role,referenceValue:r.max,referenceUnit:g.unit,status:g.status,limit:'',unit:'',notes:note.join(' '),source:g.source};
    }));
  }
  // Two of the four HCH entries are already present in the export-order table.
  const exportNames=new Map([['HCH','HCH (all isomers combined)'],['Lindane (gamma-HCH)','Lindane (gamma-HCH)']]);
  const existingParameters=new Set(exportNames.values());
  function additionalRows(product,state){
    return planRows(product,state).filter(row=>!existingParameters.has(row.parameter));
  }
  function savedExportNote(product,parameter,state){
    if(product!==id||!state||!exportNames.has(parameter)||!groups[1].rows.some(r=>state[r.field]))return '';
    const matched=planRows(product,state).find(row=>row.parameter===exportNames.get(parameter));
    return matched?' '+matched.notes:'';
  }
  function exportRows(product,s={}){
    const rows=[['Sample','Provision','Analyte or marker','Reference maximum','Unit','Scope','Official sources','Lot','Lab report','Reported result','Report unit','Comparison','HCH review']];
    if(product&&product!==id)return rows;
    const state=product?s:{};
    for(const g of groups)for(const r of g.rows)rows.push([g.form,g.article,r.name,r.max,g.unit,g.note,g.source,state[g.lot]||'',state[g.report]||'',state[r.field]||'',state[g.unitField]||'',
      product?compare(g,r,state):'',product&&g.key==='powder'&&r.code==='total'?hchReview(state):'']);
    return rows;
  }
  root.PMSVEggResidueReports=Object.freeze({area,id,groups,fields,units,compare,hchReview,planRows,additionalRows,savedExportNote,exportRows});
})(globalThis);
