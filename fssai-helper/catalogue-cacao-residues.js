/* Cacao bean references used when a buyer or destination specifies the Codex commodity. */
(function(root){
  'use strict';
  const beans='04-04-2-cocoa-beans';
  const mass='05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake';
  const products=new Set([beans,mass]);
  const area='Codex references for cacao bean lots';
  const base='https://codex.fao.org/codex-texts/codex-online-databases/pesticides-residues/';
  const table=base+'commodity-categories/commodities-details?commodityId=79076032-179b-f111-b8dc-70a8a5613865';
  const reviewFields=['cacaoLot','cacaoSpec','cacaoReport','cacaoActive','cacaoValue','cacaoBasis','cacaoPort'];
  const entries=[
    ['Methyl bromide','5.0','Po','Methyl bromide. The bean entry applies at the point of entry into a country.','e28e9f0e'],
    ['Endosulfan','0.2','','Sum alpha-endosulfan, beta-endosulfan and endosulfan sulfate. A residue reference does not authorize pesticide use.','ce8e9f0e'],
    ['Hydrogen phosphide','0.01','Po','Report all phosphides as hydrogen phosphide.','dc8e9f0e'],
    ['Metalaxyl','0.2','','For plant compliance report metalaxyl as the sum of its enantiomers, including metalaxyl-M.','37509a14'],
    ['Mandipropamid','0.06','','Use parent mandipropamid for the plant compliance result.','95509a14'],
    ['Clothianidin','0.02','(*)','Use parent clothianidin for the plant compliance result.','9c509a14'],
    ['Thiamethoxam','0.02','(*)','Use parent thiamethoxam for plant compliance. Clothianidin has its own bean entry.','a4509a14'],
    ['Pyraclostrobin','0.01','','Use parent pyraclostrobin for plant compliance.','7f509a14'],
    ['Flupyradifurone','0.01','(*)','Use parent flupyradifurone for plant compliance. The dietary exposure definition includes additional metabolites.','cd509a14']
  ].map(([name,maximum,flag,basis,key],i)=>({name,maximum,flag,basis,atEntry:i===0,url:base+'pesticide-index/pesticide-details?pestId='+key+'-199b-f111-b8dc-70a8a5613865'}));
  const symbol=flag=>flag==='Po'?'Codex includes post-harvest treatment.':flag==='(*)'?'At or about the limit of determination.':'';
  function outcome(s={}){
    const row=entries.find(r=>r.name===s.cacaoActive);
    if(!row)return 'Choose the pesticide shown on the laboratory report.';
    if(![s.cacaoLot,s.cacaoSpec,s.cacaoReport].every(v=>typeof v==='string'&&v.trim()))return 'Enter the bean lot, the specification requiring Codex and the laboratory report.';
    if(s.cacaoBasis!=='yes')return 'Confirm the sampled whole cacao beans, reporting unit and residue definition.';
    if(row.atEntry&&s.cacaoPort!=='yes')return 'Confirm sampling at the point of entry for the methyl bromide comparison.';
    const parse=root.PMSVCulinarySauces.decimal;
    const value=parse(String(s.cacaoValue||'').trim()),max=parse(row.maximum);
    if(!value)return 'Enter an exact non-negative result in mg/kg. Qualified results (such as <LOQ) need individual interpretation.';
    const result=value.n*max.scale<=max.n*value.scale?'at or below':'above';
    return row.name+' · '+s.cacaoValue+' mg/kg, '+result+' the Codex reference of '+row.maximum+' mg/kg. Bean lot '+s.cacaoLot+' · specification '+s.cacaoSpec+' · report '+s.cacaoReport+'. Indian statutory applicability remains open.';
  }
  function planRows(id,state){
    if(!products.has(id))return [];
    const form=id===beans?'Whole cacao bean lot':'Separately sampled incoming whole cacao beans';
    return entries.map(r=>{
      const result=state?.cacaoLot&&state.cacaoActive===r.name?outcome(state):'';
      return {area,form,article:'Codex SB 0715',parameter:r.name,status:'International reference for bean specifications',limit:'',unit:'',
        notes:['Codex '+r.maximum+' mg/kg.',r.basis,symbol(r.flag),'Match the bean lot to the contract or destination requirement. Verify domestic applicability separately. The bean value does not establish a limit for nibs, mass, liquor, cake, powder or chocolate.',result].filter(Boolean).join(' '),
        source:table+' | '+r.url};
    });
  }
  function exportRows(id,state){
    const out=[['Codex commodity','Sample','Pesticide','Codex MRL','Unit','Codex symbol','Laboratory reporting basis','Conditions','Codex commodity table','Codex pesticide entry','Individual comparison']];
    if(id&&!products.has(id))return out;
    for(const r of entries)out.push(['SB 0715',id===mass?'Incoming whole cacao beans':'Whole cacao beans',r.name,r.maximum,'mg/kg',r.flag,r.basis,[symbol(r.flag),'Buyer or destination specification. Domestic product-specific limit remains unverified.'].filter(Boolean).join(' '),table,r.url,id&&state?.cacaoLot&&state.cacaoActive===r.name?outcome(state):'']);
    return out;
  }
  root.PMSVCacaoResidues=Object.freeze({beans,mass,products,area,entries,reviewFields,table,outcome,planRows,exportRows});
})(globalThis);
