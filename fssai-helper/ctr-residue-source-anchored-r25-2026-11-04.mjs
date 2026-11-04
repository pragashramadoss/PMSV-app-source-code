/** R25 FSSAI Version IX source-anchored comparisons. NEVER full product or lot approval. */
const URL='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf';
const out=(kind,status,reason,extra={})=>({kind,status,reason,sourceUrl:URL,
 sourceEdition:'Version IX (03.02.2026)',sourceRowOnly:true,fullCurrentLawComplete:false,
 productApproved:false,commercialReleaseAuthorized:false,...extra});
const hold=(kind,why,extra)=>out(kind,'EVIDENCE_HOLD',why,extra);
const num=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const date=s=>{if(typeof s!=='string'|| !/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+'T00:00:00.000Z');return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s;};
const prelim=(kind,core,ctx)=>{
 if(core?.source_version!=='Version IX (03.02.2026)' ||
    core.residue_mrls?.pesticides?.length!==213 ||
    core.antibiotic_and_pharmacological_substances?.veterinary_tolerance_limits?.rows?.length!==49)
    return hold(kind,'Pinned Version IX source tables required');
 if(!date(ctx.assessmentDate))return hold(kind,'Valid assessment date required');
 if(ctx.assessmentDate>='2026-12-01')
    return hold(kind,'Post-1-Dec source amendments not reconciled in current module');
 return null;
};
const decimal=s=>typeof s==='string'&&/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(s)?Number(s):null;
const compare=(kind,ctx,limit,meta={})=>{
 if(!num(ctx.measured)||ctx.unit!=='mg/kg')return hold(kind,'Nonnegative result in mg/kg and correct analytical basis required');
 return out(kind,ctx.measured<=limit?'SOURCE_ROW_WITHIN':'SOURCE_ROW_EXCEEDS',
 'Source-row comparison only: not full product compliance or commercial release',
 {measured:ctx.measured,sourceLimit:limit,unit:'mg/kg',...meta});
};
const dup=new Set(['22:Maize','23:Rice']);
/** Select pesticide serial + EXACT printed food article; never use caller-supplied MRL. */
export function pesticideBySource(core,ctx={}){
 const kind='pesticide-source',p=prelim(kind,core,ctx);if(p)return p;
 if(!Number.isInteger(ctx.pesticideSerial)||ctx.pesticideSerial<1||ctx.pesticideSerial>213)
   return hold(kind,'Canonical pesticide serial required');
 const e=core.residue_mrls.pesticides.find(x=>x.serial===ctx.pesticideSerial);
 if(!e||ctx.pesticideName!==e.name)return hold(kind,'Pesticide identity/residue definition not exact source name');
 const matches=e.rows.filter(x=>x.food===ctx.foodArticle);
 if(!matches.length)return hold(kind,'Exact pesticide/food article not present: no generic MRL inference');
 if(dup.has(e.serial+':'+ctx.foodArticle))
   return hold(kind,'Duplicate conflicting limits printed: original-notification reconciliation required',
     {competingPrintedLimits:matches.map(x=>x.mrl)});
 let rows=matches;
 if(e.serial===64){
   if(ctx.subgroupIdentityVerified!==true||ctx.measuredResidueExpression!=='mg CS2/kg')
     return hold(kind,'Dithiocarbamate subgroup and CS2 result expression required');
   rows=matches.filter(x=>(x.subgroup||'GENERAL_DITHIOCARBAMATES')===ctx.exactSourceSubgroup);
 }
 if(rows.length!==1)return hold(kind,'Ambiguous source article/subgroup; cannot choose favourable row',
    {candidateRowCount:matches.length});
 const row=rows[0];
 if(row.mrl==='$')return hold(kind,'Dollar token refers to copper METAL contaminants §2.1, not a numeric pesticide MRL or 0.01 fallback',
    {sourceToken:'$',sourceMetalSection:'2.1',copperArticleMustBeMatched:true});
 const text=String(row.mrl),loq=text.endsWith('*');
 const limit=decimal(loq?text.slice(0,-1):text);
 if(limit===null||row.unit!=='mg/kg')return hold(kind,'Source row has no safely numeric MRL');
 if(ctx.legalArticleVerified!==true||ctx.actualMatrixVerified!==true||
    ctx.sourceAnalyteIdentityVerified!==true||ctx.methodAndResidueDefinitionVerified!==true)
    return hold(kind,'Actual legal food article, matrix, source analyte and method required');
 const c=String(row.condition||'');
 if(c && ctx.printedConditionVerified!==true)return hold(kind,'Printed condition must be verified');
 if(/carcass fat/i.test(c)&&ctx.sampleBasis!=='carcass-fat')
    return hold(kind,'Carcass-fat sample basis required');
 if(!/carcass fat/i.test(c)&&/(\(F\)|fat basis)/i.test(c)&&ctx.sampleBasis!=='fat')
    return hold(kind,'Fat sample basis required');
 if(/shell free/i.test(c)&&ctx.sampleBasis!=='shell-free')
    return hold(kind,'Shell-free egg sample basis required');
 if(loq&&(!num(ctx.labLOQ)||ctx.labLOQ>limit))
    return hold(kind,'Asterisk denotes LOQ: current validated method LOQ must be <= source limit',
      {sourceLimit:limit,sourceFootnote:'*'});
 return compare(kind,ctx,limit,{pesticideSerial:e.serial,pesticideName:e.name,
    sourceArticle:row.food,sourcePrintedLimit:text,sourceLOQFlag:loq,
    sourceSubgroup:row.subgroup||null,legalArticleStillConditional:true});
}
/** Exact veterinary-drug serial and exact printed article, no numeric input from caller. */
export function veterinaryBySource(core,ctx={}){
 const kind='veterinary-source',p=prelim(kind,core,ctx);if(p)return p;
 const e=core.antibiotic_and_pharmacological_substances.veterinary_tolerance_limits.rows
    .find(x=>x.serial===ctx.veterinarySerial);
 if(!e||ctx.drugName!==e.name)return hold(kind,'Exact source veterinary drug required');
 if(ctx.legalArticleVerified!==true||ctx.speciesVerified!==true||
    ctx.tissueAndMatrixVerified!==true||ctx.methodAndResidueDefinitionVerified!==true)
    return hold(kind,'Legal article, species, tissue and method/residue definition required');
 const rows=e.rows.filter(x=>x.article===ctx.foodArticle);
 if(rows.length!==1)return hold(kind,'No single exact veterinary food article');
 const row=rows[0],lim=decimal(String(row.limit));
 if(lim===null||row.unit!=='mg/kg')return hold(kind,'Source limit not safely numeric');
 return compare(kind,ctx,lim,{veterinarySerial:e.serial,drugName:e.name,
   sourceArticle:row.article,legalArticleStillConditional:true});
}
/** EMRL is a prohibited-use monitoring value, NOT drug-use permission. */
export function prohibitedVetBySource(core,ctx={}){
 const kind='prohibited-veterinary-source',p=prelim(kind,core,ctx);if(p)return {...p,veterinaryUsePermitted:false};
 const list=core.antibiotic_and_pharmacological_substances.prohibited_veterinary_practice_substances;
 if(!list.substances.includes(ctx.substanceName))
    return {...hold(kind,'Substance name not in official prohibited list; no default limit'),veterinaryUsePermitted:false};
 if(ctx.animalProductScopeConfirmed!==true||ctx.methodAndMarkerVerified!==true||
    ctx.completeMetaboliteGroupVerified!==true)
    return {...hold(kind,'Prohibited-use article scope and full markers/metabolites required'),veterinaryUsePermitted:false};
 const lim=decimal(ctx.substanceName==='Chloramphenicol'?list.chloramphenicol_emrl.value:list.default_emrl.value);
 if(lim===null)return {...hold(kind,'No numeric EMRL'),veterinaryUsePermitted:false};
 const result=compare(kind,ctx,lim,{listedSubstance:ctx.substanceName,prohibitedUse:true,
   note:'EMRL is not permission to administer a prohibited veterinary drug'});
 return {...result,veterinaryUsePermitted:false};
}
/** Honey MRPL is a misuse assay threshold, NEVER permission to use antibiotics. */
export function honeyMRPLBySource(core,ctx={}){
 const kind='honey-mrpl-source',p=prelim(kind,core,ctx);if(p)return {...p,antibioticUsePermitted:false};
 const rows=core.antibiotic_and_pharmacological_substances.honey_antibiotic_mrpl.rows;
 const row=rows.find(x=>String(x.serial)===String(ctx.honeyAntibioticSerial));
 if(!row||row.name!==ctx.antibioticName)
    return {...hold(kind,'Exact honey antibiotic name and serial required'),antibioticUsePermitted:false};
 if(ctx.isActualHoney!==true||ctx.methodAndMarkerVerified!==true||
    (String(row.condition||'').includes('individually or collectively')&&ctx.completeGroupPanelVerified!==true))
    return {...hold(kind,'Honey matrix, complete markers and method evidence required'),antibioticUsePermitted:false};
 const lim=decimal(String(row.mrpl));
 if(!num(ctx.measured)||ctx.unit!=='ug/kg'||lim===null)
    return {...hold(kind,'Nonnegative honey result in µg/kg and source MRPL required'),antibioticUsePermitted:false};
 return out(kind,'MISUSE_TEST_COMPARISON_ONLY',
    'MRPL is a test-performance value; antibiotic use is not permitted in honey production',
    {honeyAntibioticSerial:row.serial,antibioticName:row.name,measured:ctx.measured,
     sourceMRPL:lim,unit:'ug/kg',aboveMRPL:ctx.measured>lim,antibioticUsePermitted:false});
}
