"use strict";
// Read-only source review with session-only, expressly UNVERIFIED operator selections.
var pmsvFourteenSourceRoutes=null;
var pmsvFourteenClaimedSubtype=Object.create(null);
async function pmsvLoadFourteenSourceRoutes(){
 try{
  const response=await fetch('./data/rules/fssai-14-sugar-egg-confection-source-gates-2026-10-11.json?v=20261011-14matrix',{cache:'reload'});
  if(!response.ok)throw new Error('FSSAI 14-route source file unavailable');
  const d=await response.json();
  if(d.catalogue!==533||d.current_partial!==415||d.current_pending!==118||
    d.records?.length!==14||d.category_counts?.sugar!==8||d.category_counts?.egg!==4||
    d.category_counts?.confectionery!==2||d.first_source_promotions!==0||
    d.finished_food_compliance_passes!==0||d.automatic_source_article_application!==false)
    throw new Error('FSSAI source-gate inventory mismatch');
  pmsvFourteenSourceRoutes=d;
 }catch(err){pmsvFourteenSourceRoutes=null;}
}
function pmsvSetFourteenSourceSubtype(v){
 if(typeof selectedCatalogProductForContaminants!=='function')return;
 const p=selectedCatalogProductForContaminants();
 const entry=pmsvFourteenSourceRoutes?.records?.find(x=>x.catalog_id===p?.id);
 if(!entry||!entry.subtype_qualifiers.includes(v))return;
 pmsvFourteenClaimedSubtype[p.id]=v;
 if(typeof renderProductContaminants==='function')renderProductContaminants();
}
function pmsvFourteenSourcesAuthentic(p){
 const db=pmsvFourteenSourceRoutes,c=contaminantsDb;
 if(!p||!db||!c||db.records?.length!==14||db.catalogue!==533||
   db.current_partial!==415||db.current_pending!==118||db.first_source_promotions!==0||
   db.finished_food_compliance_passes!==0||db.automatic_source_article_application!==false||
   db.official_contaminants_source!==c.official_sources?.[0]?.url||
   db.source_version!==c.source_version)return false;
 const rec=db.records.find(x=>x.catalog_id===p.id);
 if(!rec||rec.product_name!==p.name||rec.fssr!==p.fssr||rec.fcs!==p.fcs||
   rec.rule_key!==(p.rule_key||null)||rec.source_positive_finished_article!==false||
   rec.full_lot_compliance_pass!==false||rec.source_status!=='FINISHED_MATRIX_APPLICABILITY_UNRESOLVED')return false;
 if(rec.type==='sugar'||rec.type==='egg'){
  const chapter=(Array.isArray(chapterRuleDbs)?chapterRuleDbs:[]).find(x=>x.chapter===(rec.type==='sugar'?'2.8':'2.5'));
  const st=chapter?.standards?.find(x=>x.key===rec.rule_key);
  if(!st||st.name.toLowerCase()!==rec.source_standard_name.toLowerCase())return false;
 }
 const src=rec.referenced_source;
 if(rec.type==='sugar'){
  if(src.article!=='All types of sugars, sugar syrup, invert sugar and direct consumption coloured sugars with sulphated ash content exceeding 1.0 percent'||
   src.analyte!=='Lead'||src.value!==5||src.unit!=='mg/kg')return false;
  return (c.metal_article_rules_v9.Lead||[]).filter(x=>x.article===src.article&&x.limit===5&&x.unit==='mg/kg'&&x.row_type==='exact').length===1;
 }
 if(rec.type==='egg'){
  const pesticides=(c.residue_mrls?.pesticides||[]).filter(x=>x.name===src.analyte);
  return src.article==='Eggs'&&src.value===0.05&&src.unit==='mg/kg'&&pesticides.flatMap(x=>x.rows||[])
   .filter(x=>x.food==='Eggs'&&Number(x.mrl)===0.05&&x.unit==='mg/kg'&&x.condition==='Shell free basis').length===1;
 }
 if(rec.type==='confectionery'){
  if(src.article!=='Hard boiled sugar confectionery'||src.values?.length!==4)return false;
  const expected={Lead:2,Arsenic:1,Copper:5,Tin:5};
  return Object.entries(expected).every(([a,n])=>src.values.some(x=>x.analyte===a&&x.value===n&&x.unit==='mg/kg')&&
   (c.metal_article_rules_v9?.[a]||[]).filter(x=>x.article===src.article&&x.limit===n&&x.unit==='mg/kg'&&x.row_type==='exact').length===1);
 }
 return false;
}
function pmsvFourteenSourceGatesHtml(p){
 if(!p||!pmsvFourteenSourceRoutes?.records?.some(x=>x.catalog_id===p.id))return '';
 const withheld='<div class="notice"><b>Source applicability review withheld.</b> FSSR product identity, official article, analytical basis or current source does not match. No numeric compliance or exemption can be inferred.</div>';
 if(!pmsvFourteenSourcesAuthentic(p))return withheld;
 const rec=pmsvFourteenSourceRoutes.records.find(x=>x.catalog_id===p.id);
 const labelMap={
  ash_unconfirmed:'Sulphated ash not verified',sulphated_ash_above_1_verified:'Reported sulphated ash >1.0% (unverified claim)',sulphated_ash_at_or_below_1_verified:'Reported sulphated ash ≤1.0% (unverified claim)',
  egg_matrix_unconfirmed:'Egg processing/part not confirmed',whole_edible_egg_input:'Whole edible egg input (raw reference only)',
  processed_egg_white:'Processed albumen',processed_egg_yolk:'Processed egg yolk',processed_whole_egg:'Processed whole egg',
  confection_type_unconfirmed:'Hard-boiled process not established',declared_hard_boiled_2_7_1:'Declared hard-boiled confectionery (unverified)',other_indian_or_starch_sweet:'Not hard-boiled sugar confectionery'
 };
 const chosen=pmsvFourteenClaimedSubtype[p.id]||rec.subtype_qualifiers[0];
 if(!rec.subtype_qualifiers.includes(chosen))return withheld;
 const opts=rec.subtype_qualifiers.map(x=>'<option value="'+esc(x)+'"'+(x===chosen?' selected':'')+'>'+esc(labelMap[x]||x)+'</option>').join('');
 let text='';
 if(rec.type==='sugar'){
  const denied=rec.catalog_id==='11-11-1-dried-glucose-syrup';
  const alt=chosen==='sulphated_ash_above_1_verified'&&!denied;
  text=alt?'<b>Conditional named article candidate:</b> Lead 5 mg/kg, only after laboratory sulphated ash >1% and finished sugar/syrup identity are verified. User selection alone does NOT apply the limit.':
   denied?'<b>Direct article exclusion:</b> FSSR Dried Glucose Syrup requires sulphated ash ≤1%; the >1% article is not a valid compliant route.':
   '<b>Not assigned:</b> the Lead 5 mg/kg sugar article is conditional on sulphated ash >1%. Total ash or acid-insoluble ash does not prove it.';
 }else if(rec.type==='egg'){
  text='<b>Raw commodity reference only:</b> 2,4-D in eggs 0.05 mg/kg on a shell-free basis. The processed '+esc(rec.product_name)+
   ' matrix is NOT automatically evaluated against the raw eggs MRL, regardless of selection.';
 }else{
  const high=chosen==='declared_hard_boiled_2_7_1';
  text=high?'<b>Conditional process-specific source candidates:</b> '+rec.referenced_source.values.map(x=>esc(x.analyte)+' '+esc(x.value)+' '+esc(x.unit)).join('; ')+
    '. Proof of FSSR 2.7.1 hard-boiled process and product identity is still required; no compliance limit auto-applied.':
    '<b>Not assigned:</b> general Indian/starch sweets cannot inherit hard-boiled confectionery Lead, Arsenic, Copper or Tin articles.';
 }
 const sourceLink='<a href="'+esc(rec.official_product_standard)+'" target="_blank" rel="noopener noreferrer">FSSAI product standard</a> · '+
  '<a href="'+esc(pmsvFourteenSourceRoutes.official_contaminants_source)+'" target="_blank" rel="noopener noreferrer">FSSAI Version IX</a>';
 return '<details class="card" style="margin-top:12px"><summary><b>Finished-form source qualification</b> — '+esc(rec.type)+
  ' / review required</summary><div class="notice"><b>No first-source promotion or compliance PASS.</b> '+esc(rec.false_equivalence)+'</div>'+
  '<label><b>Actual product subtype or evidence (local declaration only):</b></label>'+
  '<select aria-label="FSSAI finished-form qualification" onchange="pmsvSetFourteenSourceSubtype(this.value)" style="max-width:100%;width:100%;padding:8px;margin-top:6px;border-radius:6px">'+opts+'</select>'+
  '<div class="notice" style="margin-top:10px">'+text+'</div>'+
  '<p><b>Positive proof required:</b> '+esc(rec.positive_proof_needed)+'</p><small>'+sourceLink+'</small></details>';
}
