/** PMSV R24 source-row comparator. This NEVER approves a complete product or batch. */
const base = (kind, status, reason) => ({kind, status, reason,
  sourceComparatorOnly: true, fullCurrentLawComplete: false,
  productApproved: false, commercialReleaseAuthorized: false});
const hold = (kind, reason) => base(kind, 'EVIDENCE_HOLD', reason);
const amountOK = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const current = a => {
  if (typeof a !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(a)) return false;
  const d = new Date(a + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === a;
};
const dateHold = (kind,ctx) => {
  if (!current(ctx.assessmentDate)) return hold(kind,'Assessment date not verified');
  if (ctx.assessmentDate >= '2026-12-01' && ctx.december2026CTRReconciled !== true)
    return hold(kind,'Post-1-Dec-2026 source amendments require revalidation');
  return null;
};
const compare = (kind,value,limit,unit) => ({...base(kind, value<=limit ? 'SOURCE_ROW_WITHIN' : 'SOURCE_ROW_EXCEEDS',
  'Result compared to a selected and proven source article only; no product PASS'),
  measured:value,limit,unit});

/** Fixed pesticide MRL or legally unfixed pesticide 0.01 mg/kg, never a blanket fallback. */
export function reviewPesticide(ctx={}) {
  const kind='pesticide'; const dh=dateHold(kind,ctx); if(dh)return dh;
  if(ctx.pesticideIdentified!==true || ctx.commodityArticleVerified!==true ||
     ctx.residueDefinitionVerified!==true || ctx.methodAndMatrixVerified!==true)
    return hold(kind,'Pesticide identity, commodity article, residue definition and method/matrix required');
  if(ctx.unit!=='mg/kg' || !amountOK(ctx.measured)) return hold(kind,'Validated nonnegative mg/kg result required; no automatic unit conversion');
  if(ctx.specificMRLFixed===true){
    if(!amountOK(ctx.specificMRL))return hold(kind,'Fixed pesticide MRL not supplied; generic tolerance forbidden');
    return compare(kind,ctx.measured,ctx.specificMRL,'mg/kg');
  }
  if(ctx.specificMRLFixed===false && ctx.noMRLFixedVerifiedFromCurrentSource===true){
    return {...compare(kind,ctx.measured,0.01,'mg/kg'), rule:'0.01 mg/kg only when an MRL has not been fixed'};
  }
  return hold(kind,'Unknown/fixed-MRL status; cannot assume 0.01 mg/kg');
}

/** Prohibited-use veterinary substance; EMRL is not permission to administer. */
export function reviewProhibitedVeterinary(ctx={}) {
  const kind='prohibited-veterinary'; const dh=dateHold(kind,ctx); if(dh)return dh;
  if(ctx.productOriginScopeVerified!==true || ctx.substanceOnProhibitedListVerified!==true ||
      ctx.analyteAndMetabolitesVerified!==true || ctx.methodAndMatrixVerified!==true)
    return {...hold(kind,'Prohibited veterinary substance, animal-product scope, markers and method must be verified'),veterinaryUsePermitted:false};
  if(ctx.unit!=='mg/kg' || !amountOK(ctx.measured))
    return {...hold(kind,'Result must be nonnegative mg/kg; no implicit µg conversion'),veterinaryUsePermitted:false};
  const lim=ctx.substance==='Chloramphenicol'?0.0003:0.001;
  return {...compare(kind,ctx.measured,lim,'mg/kg'),veterinaryUsePermitted:false,
    warning:'Source EMRL does not authorise prohibited use or full lot release'};
}

/** Honey MRPL is method-performance for misuse surveillance, not an antibiotic use allowance. */
export function reviewHoneyAntibiotic(ctx={}) {
  const kind='honey-antibiotic'; const dh=dateHold(kind,ctx); if(dh)return dh;
  if(ctx.isActualHoney!==true || ctx.analyteAndMarkerVerified!==true ||
      ctx.methodPerformanceVerified!==true || !amountOK(ctx.sourceMRPL))
    return {...hold(kind,'Honey, antibiotic/marker, source MRPL and method-performance proof required'),antibioticUsePermitted:false};
  if(ctx.unit!=='ug/kg' || !amountOK(ctx.measured))
    return {...hold(kind,'Honey antibiotic test must be in µg/kg on the correct marker basis'),antibioticUsePermitted:false};
  return {...base(kind,'MISUSE_TEST_INTERPRETATION_ONLY',
    'MRPL is a test-performance level, not an antibiotic-use authorisation or full product verdict'),
    measured:ctx.measured,sourceMRPL:ctx.sourceMRPL,unit:'ug/kg',antibioticUsePermitted:false};
}
