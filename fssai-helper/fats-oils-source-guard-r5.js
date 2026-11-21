/* One source-edition row only. Never product, current-law or commercial approval. */
(function(root){'use strict';
const locked=(status,reason='',more={})=>Object.assign({status,reason,product_approved:false,current_law_verified:false,commercial_release_authorized:false},more);
function create(reg){
 const products=new Map(reg.products.map(p=>[p.id,p])),rules=new Map(reg.rules.map(r=>[r.id,r]));
 function evaluate(productId,ruleId,result,context={},asOf='2026-11-02'){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf)||!Number.isFinite(new Date(asOf+'T00:00:00Z').getTime())||new Date(asOf+'T00:00:00Z').toISOString().slice(0,10)!==asOf)return locked('INVALID_DATE');
  const p=products.get(productId),r=rules.get(ruleId);if(!p||!r||!p.rule_ids.includes(ruleId))return locked('RULE_NOT_LINKED_TO_PRODUCT');
  if(!context||typeof context!=='object'||Array.isArray(context))return locked('INVALID_CONTEXT');
  const ctx={...context};for(const [k,v] of Object.entries(p.fixed_context||{})){if(k in ctx&&ctx[k]!==v)return locked('PRODUCT_IDENTITY_CONFLICT',k);ctx[k]=v;}
  if(p.context_choices.safflower_variant){if(!ctx.safflower_variant&&r.standard_key==='2.2.7')return locked('CONTEXT_REQUIRED','safflower_variant');if(ctx.safflower_variant){const derived=ctx.safflower_variant==='high_oleic'?'safflower_high_oleic':'safflower_ordinary';if(ctx.fatty_acid_profile&&ctx.fatty_acid_profile!==derived)return locked('PRODUCT_IDENTITY_CONFLICT','fatty_acid_profile');ctx.fatty_acid_profile=derived;}}
  for(const [k,vs] of Object.entries(p.context_choices||{}))if(k in ctx&&!vs.includes(ctx[k]))return locked('INVALID_CONTEXT',k);
  for(const [k,v] of Object.entries(r.when||{})){if(!(k in ctx))return locked('CONTEXT_REQUIRED',k);if(ctx[k]!==v)return locked('NOT_APPLICABLE_TO_SELECTED_CONTEXT',k);}
  if(r.effective_from&&asOf<r.effective_from)return locked('NOT_EFFECTIVE_ON_DATE',r.effective_from);
  if(r.kind==='not_specified')return locked('NO_NUMERIC_LIMIT_IN_THIS_CELL','A dash is not a zero limit and is not an exemption from other requirements.');
  if(r.kind==='qualitative'||!r.automatic_comparison_allowed)return locked('QUALITATIVE_OR_METHOD_REVIEW_REQUIRED','No numerical detection limit or product decision is inferred.');
  if(!result||!Number.isFinite(result.value)||result.value<0)return locked('INVALID_RESULT');
  if(result.unit!==r.unit||result.basis!==r.analytical_basis)return locked('UNIT_OR_BASIS_MISMATCH');
  const req=r.requires||{};
  for(const [k,v] of Object.entries(req)){
   if(!(k in ctx))return locked('CONTEXT_REQUIRED',k);
   if(typeof v==='boolean'){if(ctx[k]!==v)return locked('EXCEPTION_EVIDENCE_NOT_MET',k);}
   else if(typeof v==='object'){
    const n=ctx[k];if(typeof n!=='number'||!Number.isFinite(n))return locked('INVALID_CONTEXT',k);
    if(v.step!==undefined&&Math.abs((n-v.offset)/v.step-Math.round((n-v.offset)/v.step))>1e-9)return locked('SOURCE_INTERPRETATION_REQUIRED','Rice-bran percentage between source-stated 5%-steps.');
    if(v.min!==undefined&&n<v.min)return locked('SOURCE_INTERPRETATION_REQUIRED',k+' below the formula source range.');
    if(v.max!==undefined&&n>v.max||v.gt!==undefined&&n<=v.gt)return locked('EXCEPTION_EVIDENCE_NOT_MET',k);
   }
   else if(v==='formula_minimum'){
    const n=ctx.oryzanol_percent,rb=ctx.rice_bran_percent;if(!Number.isFinite(n)||!Number.isFinite(rb))return locked('INVALID_CONTEXT','oryzanol_percent');
    if(n+1e-10<.20+.05*((rb-20)/5))return locked('EXCEPTION_EVIDENCE_NOT_MET','Oryzanol below the source-stated conditional minimum.');
   }
  }
  let ok=false,limit=r.value;
  if(r.kind==='formula'){limit=.20+.05*((ctx.rice_bran_percent-20)/5);ok=result.value+1e-10>=limit;}
  else if(r.operator==='<=')ok=result.value<=r.value;
  else if(r.operator==='>=')ok=result.value>=r.value;
  else if(r.operator==='range')ok=result.value>=r.min&&result.value<=r.max;
  else return locked('UNSUPPORTED_COMPARISON');
  return locked(ok?'WITHIN_SELECTED_SOURCE_LIMIT':'OUTSIDE_SELECTED_SOURCE_LIMIT',p.crude_intermediate?'Crude intermediate: not for direct human consumption.':'One row only; all other applicable requirements remain.',{alternative_group:r.alternative_group||null,computed_limit:r.kind==='formula'?limit:null});
 }
 function evaluateAlternatives(productId,group,results,context={},asOf='2026-11-02'){
  const p=products.get(productId);if(!p||!Array.isArray(results))return locked('INVALID_INPUT');
  const ids=p.rule_ids.filter(id=>rules.get(id).alternative_group===group);if(ids.length<2)return locked('UNKNOWN_ALTERNATIVE_GROUP');
  if(!results.length)return locked('ALTERNATIVE_RESULT_REQUIRED');
  if(new Set(results.map(x=>x.rule_id)).size!==results.length||results.some(x=>!ids.includes(x.rule_id)))return locked('INVALID_ALTERNATIVE_RESULTS');
  const decisions=results.map(x=>evaluate(productId,x.rule_id,x.result,context,asOf));
  const valid=new Set(['WITHIN_SELECTED_SOURCE_LIMIT','OUTSIDE_SELECTED_SOURCE_LIMIT']);if(decisions.some(x=>!valid.has(x.status)))return locked('ALTERNATIVE_REVIEW_REQUIRED','Context, unit, basis or date must first be resolved.',{decisions});
  if(decisions.some(x=>x.status==='OUTSIDE_SELECTED_SOURCE_LIMIT')&&decisions.some(x=>x.status==='WITHIN_SELECTED_SOURCE_LIMIT'))return locked('CONFLICTING_ALTERNATIVE_RESULTS','Do not select the favourable result and ignore a contradictory measured result.',{decisions});
  return locked(decisions.every(x=>x.status==='WITHIN_SELECTED_SOURCE_LIMIT')?'WITHIN_ONE_STATED_ALTERNATIVE':'OUTSIDE_PROVIDED_ALTERNATIVES','The source states OR; one valid alternative may be used. This is not product approval.',{decisions});
 }
 return Object.freeze({evaluate,evaluateAlternatives});
}
const api=Object.freeze({create});if(typeof module==='object'&&module.exports)module.exports=api;root.PMSVFatsOilsSourceGuard=api;
})(typeof globalThis==='object'?globalThis:this);
