import {isPinnedCTRCore} from './ctr-source-integrity-r27-2026-11-04.mjs';

/** R72 draft source-plan comparison. This does not approve a product or lot. */
const base={kind:'histamine-source-plan',sourceRowOnly:true,fullCurrentLawComplete:false,
 productApproved:false,commercialReleaseAuthorized:false,
 sourceUrl:'https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notificaton_Histamine_Level_25_01_2017.pdf',
 sourcePdfPages:[12,13],reviewedOn:'2026-11-17'};
const hold=reason=>({...base,status:'EVIDENCE_HOLD',reason});
const validDate=s=>{
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+'T00:00:00Z');
 return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s;
};
export function histamineBySource(core,ctx={}){
 if(!ctx||typeof ctx!=='object'||Array.isArray(ctx))return hold('A structured assessment context is required.');
 if(!isPinnedCTRCore(core))return hold('Audited source snapshot required; no comparison with altered tables.');
 if(!validDate(ctx.assessmentDate)||ctx.assessmentDate<'2026-02-03'||ctx.assessmentDate>='2026-12-01')
  return hold('Date outside this reviewed snapshot window; current amendment reconciliation required.');
 const h=core.other_contaminants.histamine;
 const row=h.product_limits.find(r=>r.serial===ctx.productSerial&&r.product_category===ctx.productCategory);
 if(!row)return hold('Exact source product category and serial required; no broad fish-product fallback.');
 // Original page 12 has one merged species-condition cell across rows 1–10.
 // Row 11 continues with a blank cell: absence of text is not an exemption.
 if(ctx.legalArticleVerified!==true||ctx.actualMatrixVerified!==true||ctx.speciesScopeVerified!==true||
    ctx.methodAndSamplingVerified!==true)
  return hold('Product article, actual matrix, listed-species scope, method and sampling evidence are required for every category.');
 if(row.serial===11&&ctx.continuationScopeVerified!==true)
  return hold('Fish Pickle continuation-cell scope requires explicit confirmation; no species exemption inferred.');
 const species=h.potential_histamine_species_families.flatMap(f=>f.species.map(s=>({...s,family:f.family})))
  .filter(s=>s.scientific_name===ctx.scientificName&&s.family===ctx.family);
 if(!species.length||/\bspp\.?$/i.test(ctx.scientificName))
  return hold('An exact listed species and family are required; common names, genus-only entries and taxonomic aliases are not resolved here.');
 if(ctx.unit!=='mg/kg')return hold('Nine individual histamine results in mg/kg are required; no automatic unit conversion.');
 const values=ctx.results;
 if(!Array.isArray(values)||values.length!==row.n||
    Array.from({length:row.n},(_,i)=>!Object.hasOwn(values,i)||typeof values[i]!=='number'||!Number.isFinite(values[i])||values[i]<0).some(Boolean))
  return hold('Exactly nine finite nonnegative individual results are required; a mean, censored result or incomplete sample is insufficient.');
 const total=values.reduce((sum,x)=>sum+x,0);
 const mean=Number.isFinite(total)?total/row.n:values.reduce((sum,x)=>sum+x/row.n,0);
 const between=values.filter(x=>x>row.m_mg_per_kg&&x<=row.M_mg_per_kg).length;
 const above=values.filter(x=>x>row.M_mg_per_kg).length;
 const satisfactory=mean<=row.m_mg_per_kg&&between<=row.c&&above===0;
 return {...base,status:satisfactory?'SOURCE_PLAN_SATISFACTORY':'SOURCE_PLAN_UNSATISFACTORY',
  reason:'All three source sampling criteria evaluated; this is not complete product compliance or lot release.',
  productSerial:row.serial,productCategory:row.product_category,scientificName:ctx.scientificName,family:ctx.family,
  n:row.n,c:row.c,m:row.m_mg_per_kg,M:row.M_mg_per_kg,unit:'mg/kg',
  mean,resultsAboveLowerAtOrBelowUpper:between,resultsAboveUpperLimit:above,
  meanCriterionMet:mean<=row.m_mg_per_kg,countCriterionMet:between<=row.c,maximumCriterionMet:above===0};
}
