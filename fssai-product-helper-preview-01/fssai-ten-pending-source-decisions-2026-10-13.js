"use strict";
/* Ten official FSSAI source decisions. Exactly one direct FSSR quality dossier.
 * No auto-inherited contaminant limit, IS 10500 numeric requirement, lot PASS or approval.
 */
var pmsvQ10Data=null;
const pmsvQ10Digest="520b7f31546a87d2";
const pmsvQ10WaterId="purified-vending-water";
function pmsvQ10Valid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsvQ10Data||!pmsv40Queue||!pmsv493Ledger||
 pmsvReviewSnapshotDigest(pmsvQ10Data)!==pmsvQ10Digest)return false;
 const d=pmsvQ10Data,q=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x])),
 l=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x]));
 if(d.schema_version!=="1.0"||d.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 d.scope!=="TEN_PREVIOUSLY_UNLINKED_SOURCE_DECISION_PACKETS_ONE_DIRECT_FSSR_QUALITY"||
 d.catalogue!==533||d.partial_first_ctr!==493||d.pending_first_ctr!==40||
 d.quality_dossiers_previously_linked!==30||d.new_direct_fssr_quality_dossiers!==1||
 d.total_linked_quality_dossiers!==31||d.quality_dossiers_still_unlinked!==9||
 d.ayurveda_recipe_source_records!==2||d.broad_or_nonmonograph_category_records!==7||
 d.full_compliance_passes!==0||d.auto_numerical_ctr_limits!==false||
 d.records?.length!==10||q.size!==40||l.size!==533||
 pmsv493Ledger.partial_exact!==493||pmsv493Ledger.first_source_pending!==40)return false;
 const seen=new Set();let quality=0,ayurveda=0,broad=0;
 const official=u=>typeof u==="string"&&(
 u.startsWith("https://fssai.gov.in/")||
 u.startsWith("https://www.fssai.gov.in/")||
 u.startsWith("https://foscos.fssai.gov.in/"));
 for(const x of d.records){
  const a=q.get(x.catalog_id),b=l.get(x.catalog_id);
  if(seen.has(x.catalog_id)||!a||!b||a.product_name!==x.product_name||
    b.product_name!==x.product_name||String(a.fssr||"")!==String(x.fssr||"")||
    String(a.fcs||"")!==String(x.fcs||"")||
    b.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    !official(x.official_source_url)||
    (x.secondary_official_source_url&&!official(x.secondary_official_source_url))||
    !x.exact_reference||!x.forbidden_inference||
    x.established_source_facts?.length<1||x.positive_additional_evidence?.length<2||
    x.current_ctr_status!=="FIRST_EXACT_SOURCE_PENDING"||
    x.first_ctr_article_evidenced!==false||
    x.finished_lot_results_verified!==false||
    x.numeric_contaminant_limits_assigned!==false||
    x.complete_quality_compliance!==false||x.complete_regulatory_approval!==false)return false;
  if(x.quality_dossier_counted){
   if(x.catalog_id!==pmsvQ10WaterId||
      x.evidence_type!=="DIRECT_FINISHED_FSSR_QUALITY_STANDARD"||
      x.fssr!=="2.10.9"||!x.exact_reference.includes("2.10.9")||
      !x.established_source_facts.some(t=>t.includes("IS 10500")))return false;
   quality++;
  }else if(x.evidence_type==="OFFICIAL_AYURVEDA_AAHARA_RECIPE_IDENTITY_ONLY"){
   if(!x.secondary_official_source_url||
    !x.established_source_facts.some(t=>t.includes("Compendium")||
      t.includes("Classical")))return false;
   ayurveda++;
  }else broad++;
  seen.add(x.catalog_id);
 }
 return seen.size===10&&quality===1&&ayurveda===2&&broad===7;
}
var pmsvBeforeQ10Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeQ10Load();pmsvQ10Data=null;
 try{
  const r=await fetch("./data/rules/fssai-ten-pending-official-source-decisions-2026-10-13.json?v=20261013-q10",{cache:"reload"});
  if(!r.ok)throw Error("Ten official FSSAI source decisions absent");
  pmsvQ10Data=await r.json();
  if(!pmsvQ10Valid())throw Error("Ten source decisions and current 40 ledger diverged");
 }catch(_){pmsvQ10Data=null;}
};
function pmsvQ10Html(p){
 if(!p)return "";
 if(!pmsvQ10Data?.records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvQ10Valid())return '<div class="notice">Current ten FSSAI quality and ingredient-source decisions unavailable or mismatched. No numerical CTR limit or PASS.</div>';
 const r=pmsvQ10Data.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))return '<div class="notice">Current ten FSSAI source dossiers: product identity mismatch; approval withheld.</div>';
 const e=v=>typeof esc==="function"?esc(String(v)):String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 const status=r.quality_dossier_counted?"EXACT FSSR QUALITY LINKED — CTR ARTICLE PENDING":
 r.evidence_type==="OFFICIAL_AYURVEDA_AAHARA_RECIPE_IDENTITY_ONLY"?
 "OFFICIAL RECIPE IDENTITY ONLY — NO FINISHED QUALITY OR CTR PASS":
 "BROAD / UNRESOLVED INDIVIDUAL ARTICLE — NO GENERAL NUMERICAL QUALITY RULE";
 return '<details class="card" style="margin-top:12px"><summary><b>Official FSSAI source decision</b> · '+e(r.product_name)+'</summary>'+
 '<div class="notice"><b>'+status+'.</b> No tested lot, contaminants, compliance or product approval.</div>'+
 '<p><b>Source:</b> '+e(r.exact_reference)+'</p>'+
 '<p><b>What official source actually establishes:</b></p><ul>'+
 r.established_source_facts.map(t=>'<li>'+e(t)+'</li>').join("")+'</ul>'+
 '<p><b>Positive proof still required:</b></p><ul>'+
 r.positive_additional_evidence.map(t=>'<li>'+e(t)+'</li>').join("")+'</ul>'+
 '<p><b>Do not transfer:</b> '+e(r.forbidden_inference)+'</p>'+
 '<small><a target="_blank" rel="noopener noreferrer" href="'+e(r.official_source_url)+'">Official FSSAI source</a>'+
 (r.secondary_official_source_url?' · <a target="_blank" rel="noopener noreferrer" href="'+e(r.secondary_official_source_url)+'">Additional official source</a>':"")+'</small></details>';
}
var pmsvBeforeQ10Html=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsvQ10Html(p)+pmsvBeforeQ10Html(p);
};
