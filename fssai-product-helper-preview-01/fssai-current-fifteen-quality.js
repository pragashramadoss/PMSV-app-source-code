"use strict";
/* Source-only FSSR quality dossiers for 15 currently first-CTR-article-pending products. */
var pmsvQ15Data=null;
const pmsvQ15Hash="3a2b893c43c93d3f";
function pmsvQ15Valid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const d=pmsvQ15Data,l=pmsv493Ledger,q=pmsv40Queue;
 if(!d||!l||!q||pmsvReviewSnapshotDigest(d)!==pmsvQ15Hash||
 d.schema_version!=="1.0"||d.source_policy!=="FSSAI_ONLY"||
 d.scope!=="15_CURRENT_CTR_PENDING_FINISHED_PRODUCT_FSSR_QUALITY_SOURCE_RECORDS"||
 d.catalogue!==533||d.partial_source!==493||d.first_exact_source_pending!==40||
 d.approved_finished_products!==0||d.first_ctr_promotions!==0||
 d.quality_product_count!==15||d.quality_source_row_count!==76||
 d.cocoa_naming_branches!==9||d.records?.length!==15||
 d.official_ctr!==l.official_contaminants_source||
 l.partial_exact!==493||l.first_source_pending!==40||
 q.review_records?.length!==40)return false;
 const ids=new Set(),pending=new Map(q.review_records.map(x=>[x.catalog_id,x])),
 live=new Map(l.records.map(x=>[x.catalog_id,x]));let n=0,uncompared=0;
 for(const p of d.records){
  const qrow=pending.get(p.catalog_id),r=live.get(p.catalog_id);
  if(!qrow||!r||ids.has(p.catalog_id)||
   p.product_name!==qrow.product_name||p.product_name!==r.product_name||
   String(p.fssr||"")!==String(qrow.fssr||"")||
   String(p.fcs||"")!==String(qrow.fcs||"")||
   r.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   p.quality_only_not_ctr!==true||p.first_exact_ctr_article_pending!==true||
   p.finished_lot_verified!==false||p.automatic_mrl_assignment!==false||
   p.full_regulatory_pass!==false||
   !String(p.official_source_url).startsWith("https://fssai.gov.in/")&&
   !String(p.official_source_url).startsWith("https://www.fssai.gov.in/")||
   !p.positive_finished_identity_needed||!Array.isArray(p.quality_rows))return false;
  for(const z of p.quality_rows){
   if(!z.parameter||!z.operator||!z.source_json_path||!z.variant||!z.unit)return false;
   if(z.operator==="source_value_only_no_auto_check"){
    if(z.value!==null||!String(z.condition).includes("100 mg/kg"))return false;
    uncompared++;
   }else if(!["<=",">=","source_value_only"].includes(z.operator)||!Number.isFinite(z.value))return false;
   n++;
  }
  ids.add(p.catalog_id);
 }
 return ids.size===15&&n===76&&uncompared===1;
}
var pmsvQ15OldLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvQ15OldLoader();
 pmsvQ15Data=null;
 try{
  const r=await fetch("./data/rules/fssai-fifteen-current-pending-fssr-quality-2026-10-12.json?v=20261012-q15",{cache:"reload"});
  if(!r.ok)throw Error("FSSR quality file missing");
  pmsvQ15Data=await r.json();
  if(!pmsvQ15Valid())throw Error("FSSR current 15 source mismatch");
 }catch(_){pmsvQ15Data=null;}
};
function pmsvQ15Html(p){
 if(!p||!pmsvQ15Valid())return "";
 const x=pmsvQ15Data.records.find(z=>z.catalog_id===p.id);
 if(!x)return "";
 if(x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">FSSR product identity mismatch. No compliance result.</div>';
 const e=x=>typeof esc==="function"?esc(String(x)):String(x).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 const rows=x.quality_rows.map(v=>'<tr><td>'+e(v.parameter)+'</td><td>'+
 (v.value===null?'100 mg/kg — no comparator in source; NOT AUTO-EVALUATED':e(v.operator)+' '+e(v.value)+' '+e(v.unit))+
 '</td><td>'+e(v.variant)+(v.condition?'; '+e(v.condition):'')+'</td></tr>').join("");
 const classes=x.conditional_subtypes.nine_conditional_descriptions;
 const cocoa=classes?'<p><b>Nine official cocoa-powder content / fat-class designations — choose using real recipe and fat results:</b></p><ul>'+
 classes.map(z=>'<li>'+e(z.designation)+'</li>').join("")+'</ul>':"";
 return '<details class="card" style="margin-top:12px"><summary><b>Official FSSR finished-product QUALITY source</b> · '+e(x.source_rule_key)+'</summary>'+
 '<div class="notice"><b>QUALITY ONLY — first exact finished-food CONTAMINANT source still PENDING. No lab PASS or legal approval.</b></div>'+
 '<p><b>Actual identity to verify:</b> '+e(x.positive_finished_identity_needed)+'</p>'+
 (rows?'<table><thead><tr><th>Parameter</th><th>Official FSSR criterion</th><th>Variant / basis</th></tr></thead><tbody>'+rows+'</tbody></table>':
 '<p>Arrowroot has an independent source definition. No numerical tapioca or palm-sago criteria are inherited.</p>')+
 cocoa+'<small><a href="'+e(x.official_source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSR source</a> · '+
 '<a href="'+e(pmsvQ15Data.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR IX (separate)</a></small></details>';
}
var pmsvQ15OldPanel=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvQ15Html(p)+pmsvQ15OldPanel(p);};
