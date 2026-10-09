/* PMSV Standard Lookup composition scope guard v27.
 * Uses structured FSSAI Chapter 2.1: exact variant only, never substring overlap.
 * Nutrition values continue to come only from ICMR-NIN IFCT.
 */
(function(){
'use strict';
const VERSION='2026-10-09-exact-composition-v27';
const KEY='pmsv_fssai_composition_variant_v27';
const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const savedVariant=p=>{
 try{
   const x=JSON.parse(sessionStorage.getItem(KEY)||'null');
   return x&&x.productId===p.id?String(x.variant||''):'';
 }catch(err){return '';}
};
const aliasVariant=()=>{
 try{return String(sessionStorage.getItem('pmsv_fssai_assessment_variant')||'');}
 catch(err){return '';}
};
const original=window.standardLookupRegulatoryCompositionHtml;
if(typeof original!=='function')return;
window.standardLookupRegulatoryCompositionHtml=function(){
 const product=window.currentAssessmentCatalogProduct?.();
 const standards=window.currentChapterStandards?.()||[];
 const item=standards.find(x=>String(x?.standard?.key||'')==='2.1.13');
 if(!product||String(product.fssr||'')!=='2.1.13'||!item)return original();
 const st=item.standard;
 const variants=Array.isArray(st.variants)?st.variants:[];
 const alias=aliasVariant();
 const isPlainDahi=norm(alias)==='dahi'||norm(product.chapter_rule_variant)==='dahi';
 const chosen=isPlainDahi?'':savedVariant(product);
 const validChoice=variants.includes(chosen)?chosen:'';
 const selectedName=norm(product.lookup_display_name||product.name);
 const isFamilyName=norm(product.name)==='yoghurt including flavoured yoghurt and flavoured dahi';
 const scope=v=>{
   const n=norm(v);
   if(!n)return true;
   if(isPlainDahi)return n==='dahi';
   if(validChoice)return n===norm(validChoice);
   return n===selectedName;
 };
 const source=item.db?.official_sources?.[0]?.url||'https://fssai.gov.in/food-law/regulations/compendium/food-products-standards';
 const table=(head,body)=>'<div class="tablewrap"><table><thead><tr>'+head.map(h=>'<th>'+e(h)+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
 let html='<div class="notice oknote"><b>Layer 1 · FSSAI standardized-product composition</b><br>'
   +'FSSR <b>2.1.13</b> — '+e(product.lookup_display_name||product.name)
   +'. This is legal composition information, <b>not an estimated nutrition label</b>.<br>'
   +'<small>Source: <a target="_blank" rel="noopener" href="'+e(source)+'">FSSAI official Chapter 2.1</a>. Runtime '+VERSION+'.</small></div>';
 const general=(st.composition_rules||[]).filter(r=>!r.product);
 if(general.length){
   html+=table(['General fermented-milk requirement','FSSAI criterion','Condition'],general.map(r=>{
     let limit=r.requirement||[r.operator??'',r.value??'',r.unit??''].join(' ').trim();
     if(validChoice&&norm(r.parameter)==='titratable acidity')
       return ''; // variant's 0.6% minimum supersedes the general 0.45% minimum
     return '<tr><td><b>'+e(r.parameter)+'</b></td><td>'+e(limit)+'</td><td>'+e(r.condition||'Applies unless superseded by a more specific standard')+'</td></tr>';
   }).join(''));
 }
 const targeted=(st.composition_rules||[]).filter(r=>r.product&&scope(r.product));
 if(targeted.length)html+=table(['Product-specific requirement','FSSAI rule','Condition'],targeted.map(r=>
   '<tr><td><b>'+e(r.parameter||r.product)+'</b></td><td>'+e(r.requirement||r.value||'')+'</td><td>'+e(r.condition||'')+'</td></tr>'
 ).join(''));
 const cultures=(st.starter_culture_requirements||[]);
 if(cultures.length)html+='<details><summary><b>Starter-culture microbiological requirements</b> (conditional)</summary>'
   +table(['Requirement','Criterion','Condition'],cultures.map(r=>
     '<tr><td>'+e(r.parameter)+'</td><td>'+e([r.operator,r.value,r.unit].join(' '))+'</td><td>'+e(r.condition)+'</td></tr>'
   ).join(''))+'</details>';
 if(isPlainDahi){
   const culture=(st.named_fermented_milk_cultures||[]).find(r=>norm(r.product)==='dahi');
   html+='<div class="notice oknote"><b>Plain Dahi:</b> Do not borrow yoghurt/flavoured-Dahi fat grades. The plain-Dahi fat and milk-solids-not-fat minima depend on the input milk class; the unlabelled case follows the mixed-milk rule.</div>';
   if(culture)html+='<div class="notice"><b>Named starter-culture category:</b> '+e(culture.culture)+'</div>';
 }else if(isFamilyName&&variants.length){
   const options='<option value="">Select exact finished-product class (not assumed)</option>'
     +variants.map(v=>'<option value="'+e(v)+'"'+(v===validChoice?' selected':'')+'>'+e(v)+'</option>').join('');
   html+='<div class="notice"><label for="nutritionExactVariantV27"><b>Actual finished-product variant</b></label>'
      +'<select id="nutritionExactVariantV27">'+options+'</select>'
      +'<small>Choose one class for reference. A selection is not an analytical PASS or legal approval.</small></div>';
   if(validChoice){
     html+='<div class="notice oknote"><b>Exact variant selected:</b> '+e(validChoice)+'. Only that column is used.</div>';
     html+=table(['Parameter','FSSAI requirement','Basis'],(st.variant_requirements||[]).map(r=>
       '<tr><td><b>'+e(r.parameter)+'</b></td><td><b>'+e(r.values?.[validChoice]??'Not stated')+'</b></td><td>'+e(r.unit||'')+(r.condition?' — '+e(r.condition):'')+'</td></tr>'
     ).join(''));
   }else{
     html+='<div class="notice"><b>No exact variant chosen.</b> The yoghurt/flavoured-Dahi fat-class limits are not auto-applied. Choose the actual grade above; the full Product Standard page shows all classes for comparison.</div>';
   }
 }
 const conditions=(st.rules||[]).filter(r=>!r.product||scope(r.product));
 if(conditions.length){
   html+='<details><summary><b>Other relevant FSSAI standard conditions</b></summary>'
    +conditions.map(r=>{
      if(typeof r==='string')return '<div class="item">'+e(r)+'</div>';
      const limit=r.min_pct!=null?'minimum '+e(r.min_pct)+'%':r.max_pct!=null?'maximum '+e(r.max_pct)+'%':e(r.text||r.requirement||'');
      return '<div class="item"><b>'+e(r.parameter||r.type||'Standard rule')+'</b>: '+limit+(r.product?' · '+e(r.product):'')+'</div>';
    }).join('')+'</details>';
 }
 html+='<div class="notice"><b>Source-scope safeguard:</b> Other fermented-milk variants (including Chakka and Shrikhand) and unselected yoghurt fat classes are not presumed applicable. Missing IFCT nutrition reference must remain blank, not estimated from milk.</div>';
 return html;
};
document.addEventListener('change',function(ev){
 if(ev.target?.id!=='nutritionExactVariantV27')return;
 const p=window.currentAssessmentCatalogProduct?.();
 if(!p)return;
 const variant=String(ev.target.value||'');
 try{
   if(variant)sessionStorage.setItem(KEY,JSON.stringify({productId:p.id,variant}));
   else sessionStorage.removeItem(KEY);
 }catch(err){}
 window.renderStandardLookupNutritionReference?.();
});
window.renderStandardLookupNutritionReference?.();
})();
