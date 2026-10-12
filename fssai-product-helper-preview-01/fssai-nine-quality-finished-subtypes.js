"use strict";
/* Official FSSR finished-food QUALITY source evidence, 12 Oct 2026.
 * Separately preserve the 116 pending FIRST exact CTR article classifications.
 * Never apply product quality limits as contaminants or issue a PASS. */
var pmsvNineQualityScopeDb=null;
var pmsvNineQualityChoices=Object.create(null);
const pmsvNineQualitySnapshotDigest="f68cf7f73a3b6438";
const pmsvNineQualityIds=Object.freeze([
 "10-10-2-frozen-egg-products","10-10-2-liquid-egg-products",
 "10-10-2-egg-powder","10-10-3-pickled-eggs",
 "100-100-royal-jelly","99-99-1-colouring-foods",
 "04-04-1-thermally-processed-fruits",
 "04-04-1-thermally-processed-fruit-salad-cocktail-mix",
 "04-04-2-thermally-processed-vegetables"
]);
function pmsvNineQualityDigest(d){
 const s=JSON.stringify(d);
 if(typeof s!=="string")return "";
 let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const n=s.charCodeAt(i);a=Math.imul(a^n,16777619);b=Math.imul(b^n,2246822519)}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvNineQualityDocumentaryIntegrity(){
 const d=pmsvNineQualityScopeDb,l=pmsvCurrent533SourceLedger,c=contaminantsDb;
 if(!d||!l||!c||typeof pmsvReviewSnapshotIntact!=="function"||
    !pmsvReviewSnapshotIntact("ledger",l)||
    d.schema_version!=="1.0"||d.scope!=="QUALITY_EXACT_FORM_POSITIVE_SOURCES_NOT_CTR_CLEARANCE"||
    d.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    d.catalogue!==533||d.partial_exact_ctr!==417||d.pending_first_exact_ctr!==116||
    d.first_source_promotions!==0||d.finished_food_compliance_passes!==0||
    d.official_ctr!==c.official_sources?.[0]?.url||
    d.records?.length!==9||pmsvNineQualityDigest(d)!==pmsvNineQualitySnapshotDigest)return false;
 const countForms=d.records.reduce((n,r)=>n+r.profiles.length,0);
 const countCriteria=d.records.reduce((n,r)=>n+r.profiles.reduce((sum,p)=>sum+p.quality.length,0),0);
 if(countForms!==22||countCriteria!==111||
    new Set(d.records.map(x=>x.catalog_id)).size!==9||
    pmsvNineQualityIds.some(id=>!d.records.some(x=>x.catalog_id===id)))return false;
 const pending=new Map(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING")
   .map(x=>[x.catalog_id,x]));
 if(pending.size!==116)return false;
 return d.records.every(x=>{
  const p=pending.get(x.catalog_id);
  return !!p&&p.product_name===x.product_name&&
   String(p.fssr||"")===String(x.fssr||"")&&
   String(p.fcs||"")===String(x.fcs||"")&&
   /^https:\/\/(?:[a-z0-9-]+\.)*fssai\.gov\.in\/[^<>"'\s]+$/i.test(x.official_quality_source)&&
   x.numeric_ctr_autotransfer===false&&x.first_exact_ctr_match===false&&
   x.lot_pass===false&&x.full_compliance_approval===false&&
   !!x.identity_and_transfer_guard&&
   new Set(x.profiles.map(k=>k.code)).size===x.profiles.length&&
   x.profiles.every(k=>k.code&&k.label&&k.identity_required?.length&&
     k.quality?.length&&k.quality.every(v=>v.name&&v.criterion&&v.scope.includes("not CTR contaminant MRL")))&&
   x.ctr_article_candidates_review_only.every(k=>k.analyte&&k.article&&
     typeof k.value==="number"&&k.unit==="mg/kg"&&k.proof);
 });
}
var pmsvBeforeNineQualityLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeNineQualityLoad();
 pmsvNineQualityScopeDb=null;
 try{
  const r=await fetch("./data/rules/fssai-nine-finished-quality-subtype-positive-source-2026-10-12.json?v=20261012-quality9",{cache:"reload"});
  if(!r.ok)throw Error("Official finished-product quality matrix unavailable");
  pmsvNineQualityScopeDb=await r.json();
  if(!pmsvNineQualityDocumentaryIntegrity())throw Error("Finished-product quality matrix failed integrity check");
 }catch(e){pmsvNineQualityScopeDb=null;}
};
function pmsvChooseNineQualitySubtype(v){
 const p=typeof selectedCatalogProductForContaminants==="function"?selectedCatalogProductForContaminants():null;
 if(!p||!pmsvNineQualityDocumentaryIntegrity())return;
 const r=pmsvNineQualityScopeDb.records.find(x=>x.catalog_id===p.id);
 if(!r||!["unverified",...r.profiles.map(x=>x.code)].includes(v))return;
 pmsvNineQualityChoices[p.id]=v;
 if(typeof renderProductContaminants==="function")renderProductContaminants();
}
function pmsvNineQualityHtml(p){
 if(!p||!pmsvNineQualityScopeDb?.records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvNineQualityDocumentaryIntegrity()||!pmsvCurrent533SourceProofValid(p))
  return '<div class="notice"><b>Official quality subtype withheld.</b> Identity or FSSAI source manifest failed verification. No values or PASS applied.</div>';
 const d=pmsvNineQualityScopeDb,r=d.records.find(x=>x.catalog_id===p.id);
 const choice=pmsvNineQualityChoices[p.id]||"unverified";
 const selected=r.profiles.find(x=>x.code===choice);
 if(choice!=="unverified"&&!selected)
  return '<div class="notice"><b>Quality subtype withheld.</b> Unsupported selection; no compliance judgement.</div>';
 const safe=typeof esc==="function"?esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
 const options=[{code:"unverified",label:"Actual finished-product subtype not independently verified"},...r.profiles]
  .map(x=>'<option value="'+safe(x.code)+'"'+(choice===x.code?" selected":"")+'>'+safe(x.label)+'</option>').join("");
 const rows=selected?.quality.map(x=>'<tr><td>'+safe(x.name)+'</td><td>'+safe(x.criterion)+' '+safe(x.unit)+'</td></tr>').join("")||"";
 const profile=selected?
  '<div class="notice"><b>OFFICIAL QUALITY STANDARD — NOT A CTR LIMIT OR LAB PASS.</b> Operator-selected product type is unverified; compare official FSSR text with actual finished-product records.</div>'+
  '<p><b>Required subtype proof:</b></p><ul>'+selected.identity_required.map(x=>'<li>'+safe(x)+'</li>').join("")+'</ul>'+
  '<table style="width:100%"><thead><tr><th>Quality criterion</th><th>Official source requirement (review only)</th></tr></thead><tbody>'+rows+'</tbody></table>':
  '<div class="notice"><b>No subtype selected.</b> Product-specific standard values remain unapplied until finished form is established.</div>';
 const refs=r.ctr_article_candidates_review_only.map(x=>'<li>'+safe(x.analyte)+
   ' — '+safe(x.article)+' ('+safe(x.value)+' '+safe(x.unit)+', '+safe(x.basis)+') <b>REFERENCE ONLY; NOT APPLIED</b>'+
   '<div>'+safe(x.proof)+'</div></li>').join("");
 return '<details class="card" style="margin-top:12px"><summary><b>Finished-product FSSR quality evidence</b> — '+
  safe(r.section)+' · '+r.profiles.length+' subtypes</summary>'+
  '<div class="notice"><b>First exact finished-product CTR source still pending.</b> This panel provides directly named FSSR product quality standards, not a contaminant clearance or laboratory PASS.</div>'+
  '<label>Choose actual quality subtype for research only</label><select onchange="pmsvChooseNineQualitySubtype(this.value)">'+options+'</select>'+
  profile+'<p><b>Do not transfer:</b> '+safe(r.identity_and_transfer_guard)+'</p>'+
  (refs?'<p><b>Related official Version IX articles — not applied:</b></p><ul>'+refs+'</ul>':"")+
  '<small><a href="'+safe(r.official_quality_source)+'" target="_blank" rel="noopener noreferrer">Official FSSR Chapter '+safe(r.section)+'</a> · '+
  '<a href="'+safe(d.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small>'+
  '<p><small>All 533=417+116 current evidence statuses are unchanged. No source-article promotion or sample PASS.</small></p></details>';
}
var pmsvBeforeNineQualityCurrentHtml=pmsvCurrent533SourceStatusHtml;
pmsvCurrent533SourceStatusHtml=function(p){return pmsvBeforeNineQualityCurrentHtml(p)+pmsvNineQualityHtml(p);};
