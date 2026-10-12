"use strict";
/* PMSV official CTR version IX named-article evidence workbench.
 * 43 catalogue identities from the CURRENT 116 unresolved; 53 conditional
 * finished-article branches, 45 pinned article texts. No limit assignment,
 * first-source promotion, lot PASS or approval. */
var pmsv43ConditionalSource=null;
var pmsv43ArticleSelections=Object.create(null);
const pmsv43ManifestDigest="052b57e48c0ba97f";
function pmsv43ReviewDigest(x){
 const s=JSON.stringify(x);if(typeof s!=="string")return "";
 let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const n=s.charCodeAt(i);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519)}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsv43ValidDocument(){
 const d=pmsv43ConditionalSource,l=pmsvCurrent533SourceLedger,c=contaminantsDb;
 if(!d||!l||!c||typeof pmsvReviewSnapshotIntact!=="function"||
    !pmsvReviewSnapshotIntact("ledger",l)||
    pmsv43ReviewDigest(d)!==pmsv43ManifestDigest||
    d.schema_version!=="1.0"||d.date!=="2026-10-12"||
    d.version!==c.source_version||
    d.regulation_pdf!==c.official_sources?.[0]?.url||
    d.source_policy!=="OFFICIAL_FSSAI_ONLY"||
    d.purpose!=="CONDITIONAL_FINISHED_ARTICLE_ADJUDICATION_NOT_AUTOMATIC_CONTAMINANT_LIMIT"||
    d.catalogue!==533||d.partial_exact!==417||d.first_exact_pending!==116||
    d.first_exact_promotions!==0||d.complete_compliance_passes!==0||
    d.positive_source_rows?.length!==45||d.records?.length!==43)return false;
 const pending=new Map(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>[x.catalog_id,x]));
 if(pending.size!==116||new Set(d.records.map(x=>x.catalog_id)).size!==43||
    new Set(d.positive_source_rows.map(x=>x.key)).size!==45||
    d.records.reduce((s,x)=>s+x.source_branch_options.length,0)!==53||
    d.records.reduce((s,x)=>s+x.source_branch_options.reduce((n,b)=>n+b.article_keys.length,0),0)!==110)return false;
 const keys=new Set(d.positive_source_rows.map(x=>x.key));
 const groups=Object.create(null);
 if(!d.positive_source_rows.every(x=>
    typeof x.key==="string"&&x.key.length&&
    typeof x.article==="string"&&x.article.length&&
    typeof x.analyte==="string"&&x.analyte.length&&
    Number.isFinite(x.limit)&&x.limit>0&&
    ["mg/kg","ppm","µg/kg"].includes(x.unit)&&
    Number.isInteger(x.page_1based)&&x.page_1based>=2&&x.page_1based<=15&&
    x.official_source===d.regulation_pdf&&
    x.source_status==="EXACT_OFFICIAL_ARTICLE_TEXT_CONFIRMED_NOT_PRODUCT_APPLICABILITY"))return false;
 for(const r of d.records){
  const p=pending.get(r.catalog_id);groups[r.review_group]=(groups[r.review_group]||0)+1;
  if(!p||p.product_name!==r.product_name||
     String(p.fssr||"")!==String(r.fssr||"")||
     String(p.fcs||"")!==String(r.fcs||"")||
     r.current_first_exact_source_pending!==true||
     r.automatic_finished_limit_application!==false||
     r.full_compliance_pass!==false||r.lot_pass!==false||
     !r.requires_nonmatching_product_guard||
     !Array.isArray(r.common_required_evidence)||r.common_required_evidence.length<2||
     !Array.isArray(r.source_branch_options)||r.source_branch_options.length<1||
     new Set(r.source_branch_options.map(x=>x.key)).size!==r.source_branch_options.length||
     r.source_branch_options.some(b=>!b.key||!b.label||!b.excludes||
       b.applicability!=="CONDITIONAL_PENDING_ACTUAL_LOT_AND_LEGAL_FINISHED_ARTICLE_PROOF"||
       b.positive_evidence?.length<1||!Array.isArray(b.article_keys)||
       b.article_keys.some(key=>!keys.has(key))))return false;
 }
 return Object.keys(groups).length===Object.keys(d.group_counts||{}).length&&
   Object.keys(groups).every(k=>groups[k]===d.group_counts[k]);
}
var pmsvBefore43SourceLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore43SourceLoader();
 pmsv43ConditionalSource=null;
 try{
  const r=await fetch("./data/rules/fssai-forty-plus-conditional-finished-article-2026-10-12.json?v=20261012-43ctr",{cache:"reload"});
  if(!r.ok)throw Error("Official 43-product review source unavailable");
  pmsv43ConditionalSource=await r.json();
  if(!pmsv43ValidDocument())throw Error("Current 116-product cross-article verification failed");
 }catch(e){pmsv43ConditionalSource=null;}
};
function pmsv43SelectArticleBranch(value){
 const p=typeof selectedCatalogProductForContaminants==="function"?selectedCatalogProductForContaminants():null;
 const r=pmsv43ConditionalSource?.records?.find(x=>x.catalog_id===p?.id);
 if(!r||!pmsv43ValidDocument()||!["not_verified",...r.source_branch_options.map(x=>x.key)].includes(value))return;
 pmsv43ArticleSelections[p.id]=value;
 if(typeof renderProductContaminants==="function")renderProductContaminants();
}
function pmsv43ConditionalArticleHtml(p){
 if(!p||!pmsv43ConditionalSource?.records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv43ValidDocument()||!pmsvCurrent533SourceProofValid(p))
  return '<div class="notice"><b>Source article workbench withheld.</b> Current source data/identity integrity check failed. No limit shown or applied.</div>';
 const d=pmsv43ConditionalSource,r=d.records.find(x=>x.catalog_id===p.id);
 if(r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice"><b>Source article withheld:</b> Catalogue identity mismatch.</div>';
 const choice=pmsv43ArticleSelections[p.id]||"not_verified";
 const variant=r.source_branch_options.find(x=>x.key===choice);
 if(choice!=="not_verified"&&!variant)return '<div class="notice"><b>Unsupported article subtype withheld.</b></div>';
 const safe=typeof esc==="function"?esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const rows=new Map(d.positive_source_rows.map(x=>[x.key,x]));
 const htmlRows=variant?.article_keys.map(key=>{
   const s=rows.get(key);
   return '<tr><td>'+safe(s.analyte)+'</td><td>'+safe(s.article)+'</td>'+
     '<td>'+safe(s.limit)+' '+safe(s.unit)+' (source basis: '+safe(s.basis)+')</td>'+
     '<td>'+safe(s.regulation)+'; PDF p.'+safe(s.page_1based)+'</td></tr>';
 }).join("")||"";
 const control='<select onchange="pmsv43SelectArticleBranch(this.value)">'+
    ['<option value="not_verified"'+(choice==="not_verified"?' selected':'')+'>Unverified finished-product classification — no articles assigned</option>',
     ...r.source_branch_options.map(x=>'<option value="'+safe(x.key)+'"'+(choice===x.key?' selected':'')+'>'+safe(x.label)+'</option>')].join("")+'</select>';
 const selection=variant?
   '<div class="notice"><b>CONDITIONAL OFFICIAL SOURCE REFERENCE — NOT APPLIED.</b> Operator selection does not prove the FSSAI article matches the tested finished product. No result can become PASS.</div>'+
   (htmlRows?'<div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>Analyte</th><th>Named article in CTR Version IX</th><th>Maximum limit — source only</th><th>Official position</th></tr></thead><tbody>'+htmlRows+'</tbody></table></div>':
    '<div class="notice"><b>Positive source intentionally excluded.</b> This compliant product cannot inherit the source requiring ash strictly above 1%.</div>')+
   '<p><b>Positive evidence to collect for this branch:</b></p><ul>'+
      variant.positive_evidence.map(x=>'<li>'+safe(x)+'</li>').join("")+'</ul>'+
   '<p><b>Prohibited cross-transfer:</b> '+safe(variant.excludes)+'</p>':
   '<div class="notice"><b>First exact finished CTR source unresolved.</b> Choose a claimed actual finished form to inspect named official articles, but do not apply a numeric value.</div>';
 return '<details class="card" style="margin-top:12px"><summary><b>FSSAI Version IX finished-article source gates</b> — '+
  safe(r.source_branch_options.length)+' conditional paths</summary>'+
  '<p><small>Article rows are verified against the official table, but their applicability to this entire FoSCoS category is NOT independently established. This is documentary research only.</small></p>'+
  '<label>Finished article / processing and identity claim (research only)</label>'+control+selection+
  '<p><b>Common required records:</b></p><ul>'+r.common_required_evidence.map(x=>'<li>'+safe(x)+'</li>').join("")+'</ul>'+
  '<p><b>Category guard:</b> '+safe(r.requires_nonmatching_product_guard)+'</p>'+
  '<small><a href="'+safe(d.regulation_pdf)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR Version IX (03.02.2026)</a></small>'+
  '<p><small>Current source queue unchanged: 533=417 partial+116 pending; 0 new exact finished-article promotions, 0 lot PASS, 0 complete compliance approvals. Other contaminant, microbiology and legal checks remain outstanding.</small></p></details>';
}
var pmsvBefore43CurrentStatusHtml=pmsvCurrent533SourceStatusHtml;
pmsvCurrent533SourceStatusHtml=function(p){
 return pmsvBefore43CurrentStatusHtml(p)+pmsv43ConditionalArticleHtml(p);
};
