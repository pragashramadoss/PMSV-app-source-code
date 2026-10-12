"use strict";
/* First-source ledger migration. Immutable 417/116 evidence archive stays
 * available to older tests and read-only study panels. Current canonical
 * ledger is 420/113 after THREE affirmative official recipe + CTR matches.
 * Never promotes full regulatory, microbiology, pesticide or lot compliance. */
var pmsv2026FirstSourcePromotionManifest=null;
var pmsv2026CurrentFirstSourceLedger=null;
const pmsv2026PromotionDigests=Object.freeze({
 manifest:"d7443b7c1914db85",ledger:"936228a9ac711dd8"
});
const pmsv2026RecipeProofs=Object.freeze([
 ["102-102-1-12-1-lajadi-kashaya-parched-rice-tea","12.1 Lajadi Kashaya","Laja / parched rice","Oryza sativa L."],
 ["102-102-1-14-4-yava-ksheera-barley-milk","14.4 Yava Ksheera","Yava / barley flour","Hordeum vulgare L."],
 ["102-102-1-14-5-dugdha-kupika-stuffed-fried-cottage-cheese-dumplings","14.5 Dugdha Kupika","Rice flour","Oryza sativa L."]
]);
function pmsv2026FirstSourceValid(){
 const a=pmsvCurrent533SourceLedger,d=pmsv2026CurrentFirstSourceLedger,
  m=pmsv2026FirstSourcePromotionManifest,c=contaminantsDb;
 if(!a||!d||!m||!c||typeof pmsvReviewSnapshotIntact!=="function"||
    typeof pmsvReviewSnapshotDigest!=="function"||
    !pmsvReviewSnapshotIntact("ledger",a)||
    pmsvReviewSnapshotDigest(m)!==pmsv2026PromotionDigests.manifest||
    pmsvReviewSnapshotDigest(d)!==pmsv2026PromotionDigests.ledger||
    a.records?.length!==533||a.partial_exact!==417||a.first_source_pending!==116||
    a.full_compliance_approvals!==0||d.records?.length!==533||
    d.catalogue!==533||d.partial_exact!==420||d.first_source_pending!==113||
    d.full_compliance_approvals!==0||d.positive_delta_count!==3||
    d.as_of!=="2026-10-12"||
    m.current?.catalogue!==533||m.current?.partial!==420||m.current?.pending!==113||
    m.historical?.partial!==417||m.historical?.pending!==116||
    m.valid_first_source_promotions!==3||m.official_sources_only!==true||
    m.current?.full_compliance_approvals!==0||
    m.scope!=="PARTIAL_FIRST_EXACT_SOURCE_NOT_FULL_COMPLIANCE"||
    m.source_version!==c.source_version||d.source_version!==c.source_version||
    m.ctr_source!==c.official_sources?.[0]?.url||
    d.official_contaminants_source!==m.ctr_source||
    !/^https:\/\/(?:www\.)?fssai\.gov\.in\/upload\//.test(m.recipe_source)||
    m.records?.length!==3||m.source_analytes?.length!==2||
    m.source_composite_article!=="Food product containing any of the above mentioned food articles"||
    m.source_ingredient_article!=="Cereal and cereal products")return false;
 const expected=new Map(pmsv2026RecipeProofs.map(x=>[x[0],x]));
 if(new Set(m.records.map(x=>x.catalog_id)).size!==3)return false;
 for(const x of m.records){
  const expectedRow=expected.get(x.catalog_id);
  if(!expectedRow||x.recipe_section!==expectedRow[1]||
     x.mandatory_ingredient!==expectedRow[2]||x.botanical!==expectedRow[3]||
     x.exact_article!==m.source_composite_article||
     x.source_ref!==m.source_ingredient_article||
     x.evidence_state!=="OFFICIAL_RECIPE_AND_COMPOSITE_ARTICLE_EXACT_FIRST_SOURCE"||
     x.first_exact_source_verified!==true||
     x.complete_contaminant_panel!==false||
     x.lab_pass!==false||x.regulatory_compliance_pass!==false||
     typeof x.recipe_proof!=="string"||x.recipe_proof.length<65)return false;
 }
 const amounts=[["total_aflatoxins",20],["aflatoxin_b1",10]];
 for(const [i,entry] of amounts.entries()){
  const x=m.source_analytes[i],crop=c.crop_contaminants?.[entry[0]];
  const matches=crop?.rules?.filter(row=>row.article===m.source_composite_article&&
    Number(row.limit)===entry[1]);
  const cereal=crop?.rules?.filter(row=>row.article===m.source_ingredient_article&&
    Number(row.limit)=== (entry[0]==="total_aflatoxins"?15:10));
  if(!x||x.key!==entry[0]||x.limit!==entry[1]||x.unit!=="µg/kg"||
     crop.unit!=="µg/kg"||matches?.length!==1||cereal?.length!==1)return false;
 }
 let p=0,u=0;
 for(let i=0;i<533;i++){
  const older=a.records[i],now=d.records[i];
  if(!older||!now||older.catalog_id!==now.catalog_id||
     older.product_name!==now.product_name||
     String(older.fssr||"")!==String(now.fssr||"")||
     String(older.fcs||"")!==String(now.fcs||"")||
     now.product_compliance_approval!==false||
     now.sample_lab_pass!==false||now.complete_contaminant_panel!==false||
     now.regulatory_coverage!=="PARTIAL_OR_PENDING")return false;
  const fresh=expected.get(older.catalog_id);
  if(fresh){
   if(older.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     now.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
     now.missing_first_exact_evidence!==false||
     now.regulatory_source_verified_delta?.official!==m.ctr_source||
     now.regulatory_source_verified_delta?.recipe_source!==m.recipe_source||
     now.regulatory_source_verified_delta?.evidence_class!=="verified_mandatory_cereal_composite_aflatoxin"||
     now.regulatory_source_verified_delta?.evidence_count!==2||
     now.regulatory_source_verified_delta?.recipe_section!==fresh[1])return false;
  }else if(JSON.stringify(older)!==JSON.stringify(now))return false;
  if(now.source_status==="PARTIAL_EXACT_SOURCE_MATCH")p++;
  else if(now.source_status==="FIRST_EXACT_SOURCE_PENDING")u++;
  else return false;
 }
 return p===420&&u===113;
}
var pmsv2026BeforeFirstSourceLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv2026BeforeFirstSourceLoader();
 pmsv2026FirstSourcePromotionManifest=null;pmsv2026CurrentFirstSourceLedger=null;
 try{
  const paths=[
   "./data/rules/fssai-three-ayurveda-mandated-cereal-composite-aflatoxin-first-source-2026-10-12.json?v=20261012-3promoted",
   "./data/rules/fssai-current-first-source-533-live-ledger-420-113-2026-10-12.json?v=20261012-420113"];
  const response=await Promise.all(paths.map(s=>fetch(s,{cache:"reload"})));
  if(response.some(x=>!x.ok))throw Error("New current first-source ledger unavailable");
  const docs=await Promise.all(response.map(x=>x.json()));
  pmsv2026FirstSourcePromotionManifest=docs[0];
  pmsv2026CurrentFirstSourceLedger=docs[1];
  if(!pmsv2026FirstSourceValid())throw Error("New 420/113 source identity or proof inconsistent");
 }catch(error){
  pmsv2026FirstSourcePromotionManifest=null;
  pmsv2026CurrentFirstSourceLedger=null;
 }
};
function pmsv2026CurrentSourceHtml(p){
 if(!p||!pmsvCurrent533SourceLedger?.records?.some(x=>x.catalog_id===p.id))
  return "";
 const safe=typeof esc==="function"?esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 if(!pmsv2026FirstSourceValid())
  return '<div class="notice"><b>Current first-source ledger withheld.</b> The new source evidence, version, product identity or full ledger integrity did not verify. Archived counts are not current and no compliance conclusion is issued.</div>';
 const d=pmsv2026CurrentFirstSourceLedger,m=pmsv2026FirstSourcePromotionManifest,
   row=d.records.find(x=>x.catalog_id===p.id),
   mark=m.records.find(x=>x.catalog_id===p.id);
 if(!row||row.product_name!==p.name||
    String(row.fssr||"")!==String(p.fssr||"")||
    String(row.fcs||"")!==String(p.fcs||""))
    return '<div class="notice"><b>Current source status withheld.</b> Product identity mismatch.</div>';
 const pending=row.source_status==="FIRST_EXACT_SOURCE_PENDING";
 let s='<details class="card" style="margin-top:12px"><summary><b>Current official FSSAI first-source ledger</b> — '+
  (pending?'FIRST EXACT SOURCE PENDING':'PARTIAL EXACT SOURCE MATCH')+'</summary>'+
  '<div class="notice"><b>NOT A FINISHED-FOOD COMPLIANCE PASS.</b> The partial indicator records source applicability only. Sampling, actual analytical results and remaining legal requirements still need independent review.</div>'+
  '<p><b>Updated catalogue:</b> 533 products; <b>420 partial exact source</b>; <b>113 first-source pending</b>; 0 full regulatory or laboratory approvals.</p>';
 if(mark){
  s+='<p><b>Positive finished-food article:</b> '+safe(m.source_composite_article)+
  ' (because the official named recipe includes '+safe(mark.mandatory_ingredient)+').</p>'+
  '<p><b>Exact source references (not tested-lot values):</b> Total Aflatoxins 20 µg/kg; Aflatoxin B1 10 µg/kg. This is the composite-food article, NOT the raw cereal maximum.</p>'+
  '<p><b>Product proof:</b> '+safe(mark.recipe_proof)+'</p>'+
  '<p><small><a href="'+safe(m.recipe_source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI Ayurveda Aahara recipe order (25 July 2025)</a> · '+
  '<a href="'+safe(m.ctr_source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR Version IX, §2.2.1</a></small></p>'+
  '<p><small><b>Remaining:</b> Verify other applicable contaminants, microbiology, additives, packaging and actual laboratory results. No PASS, exemption or complete compliance certificate.</small></p>';
 }else if(pending)s+='<p>No exact finished-product contaminant article has yet been independently confirmed for this identity.</p>';
 return s+'</details>';
}
var pmsv2026ArchivedFirstSourcePanels=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 const latest=pmsv2026CurrentSourceHtml(p);
 if(!pmsv2026FirstSourceValid()){
  // Do not display stale 417/116 as if it is current.
  return latest;
 }
 const promoted=pmsv2026FirstSourcePromotionManifest?.records?.some(x=>x.catalog_id===p.id);
 if(promoted)return latest; // Never show obsolete 116-item pending worklist for these 3.
 const original=pmsv2026ArchivedFirstSourcePanels(p);
 const withoutOldStatus=original.replace(
  /<details class="card" style="margin-top:12px"><summary><b>Current FSSAI source-status ledger<\/b>[\s\S]*?<\/details>/,"");
 return latest+withoutOldStatus;
};