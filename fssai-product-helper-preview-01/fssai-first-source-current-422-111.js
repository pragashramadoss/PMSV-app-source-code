"use strict";
/* Canonical 422/111 first exact-source ledger. Source matches only.
 * The 14.6 Sugandhit Ksheera standardized recipe explicitly lists rice Q.S.;
 * the real finished batch still needs ingredient confirmation. The old
 * 421/112 and 116/112 checklists are immutable archives. */
var pmsv2026Current422Manifest=null;
var pmsv2026Current422Ledger=null;
var pmsv2026Current111Queue=null;
const pmsv2026Current422Digests=Object.freeze({
 manifest:"3a071b8b2d137592",
 ledger:"390d0b9272c2a1df",
 queue:"bfec1ca09d3cc225"
});
const pmsv2026Current422Id="102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk";
function pmsv2026Current422Valid(){
 if(typeof pmsv2026Current112Valid!=="function"||!pmsv2026Current112Valid())return false;
 const m=pmsv2026Current422Manifest,d=pmsv2026Current422Ledger,
  q=pmsv2026Current111Queue,a=pmsv2026Current421Ledger,
  old=pmsv2026Current112Worklist,c=contaminantsDb;
 if(!m||!d||!q||!a||!old||!c||
    pmsvReviewSnapshotDigest(m)!==pmsv2026Current422Digests.manifest||
    pmsvReviewSnapshotDigest(d)!==pmsv2026Current422Digests.ledger||
    pmsvReviewSnapshotDigest(q)!==pmsv2026Current422Digests.queue||
    m.schema_version!=="1.0"||m.source_policy!=="OFFICIAL_FSSAI_ONLY"||
    m.source_version!==c.source_version||d.source_version!==c.source_version||
    d.official_contaminants_source!==c.official_sources?.[0]?.url||
    m.official_contaminants!==c.official_sources?.[0]?.url||
    !/^https:\/\/(?:www\.)?fssai\.gov\.in\/upload\//.test(m.official_recipe)||
    m.official_recipe_section!=="14.6 Sugandhit Ksheera (Aroma Infused Milk)"||
    m.product?.catalog_id!==pmsv2026Current422Id||
    m.source_article!=="Food product containing any of the above mentioned food articles"||
    m.article_commodity!=="Cereal and cereal products"||
    m.positively_identified_ingredient?.common!=="Rice"||
    m.positively_identified_ingredient?.ayurveda_name!=="Tandula"||
    m.positively_identified_ingredient?.botanical!=="Oryza sativa L."||
    m.positively_identified_ingredient?.part!=="Seed"||
    m.positively_identified_ingredient?.quantity!=="Q.S."||
    m.positively_identified_ingredient?.recipe_ingredient_row!==12||
    m.first_source_verified_on_standard_recipe!==true||
    m.actual_batch_rice_confirmed!==false||
    m.auto_numeric_finished_limit_applied!==false||
    m.full_contaminant_panel!==false||m.regulatory_compliance_pass!==false||
    m.laboratory_pass!==false||d.catalogue!==533||
    d.partial_exact!==422||d.first_source_pending!==111||
    d.full_compliance_approvals!==0||d.positive_delta_count!==1||
    d.records?.length!==533||
    q.schema_version!=="2.0"||q.catalogue!==533||
    q.partial_exact!==422||q.first_source_pending!==111||
    q.completed_compliance!==0||q.subsequent_promotions!==5||
    q.archive_112_count!==112||q.review_records?.length!==111||
    q.promoted_catalog_ids?.length!==5||
    q.source_version!==c.source_version||
    q.official_contaminants_source!==m.official_contaminants||
    q.current_ledger_file!=="fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json"||
    q.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    q.no_finished_numeric_auto_application!==true||
    q.no_sample_lab_pass!==true||
    q.no_complete_regulatory_clearance!==true||
    a.partial_exact!==421||a.first_source_pending!==112||
    old.review_records?.length!==112||m.baseline?.partial_exact!==421||
    m.baseline?.first_source_pending!==112||
    m.latest?.partial_exact!==422||m.latest?.first_source_pending!==111||
    m.latest?.full_regulatory_approvals!==0)return false;
 const amounts=[["total_aflatoxins",20],["aflatoxin_b1",10]];
 for(let i=0;i<amounts.length;i++){
   const [key,limit]=amounts[i],rule=c.crop_contaminants?.[key],mrow=m.source_limits?.[i];
   if(!mrow||mrow.key!==key||mrow.limit!==limit||mrow.unit!=="µg/kg"||
     rule?.unit!=="µg/kg"||
     rule.rules?.filter(x=>x.article===m.source_article&&x.limit===limit).length!==1||
     rule.rules?.filter(x=>x.article==="Cereal and cereal products"&&
      x.limit===(key==="total_aflatoxins"?15:10)).length!==1)return false;
 }
 const originals=new Map(old.review_records.map(x=>[x.catalog_id,x]));
 if(originals.size!==112||new Set(q.review_records.map(x=>x.catalog_id)).size!==111||
   new Set(q.promoted_catalog_ids).size!==5||!q.promoted_catalog_ids.includes(pmsv2026Current422Id)||
   q.promoted_catalog_ids.some(id=>q.review_records.some(x=>x.catalog_id===id))||
   !old.review_records.some(x=>x.catalog_id===pmsv2026Current422Id))return false;
 const last=a.records.find(x=>x.catalog_id===pmsv2026Current422Id);
 const now=d.records.find(x=>x.catalog_id===pmsv2026Current422Id);
 if(!last||!now||last.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   now.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
   now.regulatory_source_verified_delta?.evidence_class!==
     "verified_rice_listed_standard_recipe_composite_aflatoxin"||
   now.regulatory_source_verified_delta?.evidence_count!==2||
   now.regulatory_source_verified_delta?.official!==m.official_contaminants||
   now.regulatory_source_verified_delta?.recipe_source!==m.official_recipe||
   now.regulatory_source_verified_delta?.recipe_section!==m.official_recipe_section||
   now.regulatory_source_verified_delta?.applicable_article!==m.source_article||
   now.regulatory_source_verified_delta?.actual_batch_rice_confirmed!==false||
   now.regulatory_source_verified_delta?.full_compliance_pass!==false||
   now.missing_first_exact_evidence!==false||
   now.product_name!==m.product.product_name||
   String(now.fssr||"")!==String(m.product.fssr||"")||
   String(now.fcs||"")!==String(m.product.fcs||""))return false;
 let partial=0,pending=0;
 for(let i=0;i<533;i++){
  const x=a.records[i],y=d.records[i];
  if(!x||!y||x.catalog_id!==y.catalog_id||x.product_name!==y.product_name||
     String(x.fssr||"")!==String(y.fssr||"")||
     String(x.fcs||"")!==String(y.fcs||"")||
     y.product_compliance_approval!==false||
     y.sample_lab_pass!==false||y.complete_contaminant_panel!==false||
     y.regulatory_coverage!=="PARTIAL_OR_PENDING")return false;
  if(x.catalog_id!==pmsv2026Current422Id&&JSON.stringify(x)!==JSON.stringify(y))return false;
  if(y.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(y.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
  else return false;
 }
 if(partial!==422||pending!==111)return false;
 const expected=new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 for(const row of q.review_records){
  if(!expected.has(row.catalog_id)||JSON.stringify(row)!==JSON.stringify(originals.get(row.catalog_id))||
     row.first_exact_source_verified!==false||
     row.numeric_finished_food_limit_auto_applied!==false||
     row.finished_food_laboratory_pass!==false||
     row.full_regulatory_compliance_approval!==false||
     !row.proof_branches?.length)return false;
 }
 return expected.size===111;
}
var pmsv2026Before422Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv2026Before422Load();
 pmsv2026Current422Manifest=null;
 pmsv2026Current422Ledger=null;
 pmsv2026Current111Queue=null;
 try{
  const names=[
   "fssai-sugandhit-ksheera-listed-rice-aflatoxin-first-source-2026-10-12.json",
   "fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json",
   "fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"];
  const responses=await Promise.all(names.map(x=>
    fetch("./data/rules/"+x+"?v=20261012-current422111",{cache:"reload"})));
  if(responses.some(r=>!r.ok))throw Error("Missing canonical current source data");
  const docs=await Promise.all(responses.map(r=>r.json()));
  [pmsv2026Current422Manifest,pmsv2026Current422Ledger,pmsv2026Current111Queue]=docs;
  if(!pmsv2026Current422Valid())throw Error("Current 422/111 exact source integrity failure");
 }catch(_){
  pmsv2026Current422Manifest=null;
  pmsv2026Current422Ledger=null;
  pmsv2026Current111Queue=null;
 }
};
var pmsv2026Before422LocalValid=pmsv116Valid;
pmsv116Valid=function(p){
 return pmsv2026Current422Valid()&&
   pmsv2026Current111Queue.review_records.some(x=>x.catalog_id===p?.id)&&
   pmsv2026Current422Ledger.records.some(x=>x.catalog_id===p.id&&
     x.source_status==="FIRST_EXACT_SOURCE_PENDING")&&
   pmsv2026Before422LocalValid(p);
};
function pmsv2026Current422Html(p){
 if(!p||!pmsv2026Current422Ledger)return "";
 if(!pmsv2026Current422Valid())return '<div class="notice"><b>Current first-source state withheld.</b> Official regulatory source, recipe, historical ledger or pending worklist failed integrity checks. No compliance PASS.</div>';
 const r=pmsv2026Current422Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))
   return '<div class="notice"><b>Current first-source state withheld.</b> Product identity changed.</div>';
 const pending=r.source_status==="FIRST_EXACT_SOURCE_PENDING";
 let h='<details class="card" style="margin-top:12px"><summary><b>Current official FSSAI first-source ledger</b> — '+
   (pending?"FIRST EXACT SOURCE PENDING":"PARTIAL EXACT SOURCE MATCH")+'</summary>'+
   '<div class="notice"><b>NOT A REGULATORY/LABORATORY PASS.</b> 533 products; 422 partial first-source matches; 111 pending first exact article; 0 complete regulatory clearances.</div>';
 if(p.id===pmsv2026Current422Id){
  const m=pmsv2026Current422Manifest;
  h+='<p><b>Positive named recipe ingredient:</b> Tandula, rice (<i>Oryza sativa L.</i>), seed, Q.S., FSSAI Ayurveda Aahara 14.6. The official compositional recipe lists rice.</p>'+
    '<p><b>Conditional exact source article:</b> '+esc(m.source_article)+
    '. Total aflatoxins <b>20 µg/kg</b>, aflatoxin B1 <b>10 µg/kg</b>. These are legal article references, not measured results.</p>'+
    '<p><b>Important limitation:</b> The batch/formulation must actually contain the listed rice before the composite-cereal route can be applied. Q.S. does not prove quantity or real-batch inclusion. Absence of rice invalidates this route. Remaining contaminants, pesticide applicability, processing factors and analytical results are not yet cleared.</p>'+
    '<small><a href="'+esc(m.official_recipe)+'" target="_blank" rel="noopener noreferrer">FSSAI 2025 recipe 14.6</a> · '+
    '<a href="'+esc(m.official_contaminants)+'" target="_blank" rel="noopener noreferrer">FSSAI CTR Version IX §2.2.1</a></small>';
 }else if(pending)h+='<p>No verified exact applicable contaminant article is established for this product.</p>';
 else h+='<p>At least one exact source article is matched; full contaminant and finished-product compliance are still open.</p>';
 return h+'</details>';
}
var pmsv2026Prior422Html=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 const status=pmsv2026Current422Html(p);
 if(!pmsv2026Current422Valid())return status;
 if(p.id===pmsv2026Current422Id)return status;
 let old=pmsv2026Prior422Html(p);
 old=old.replace(/<details class="card" style="margin-top:12px"><summary><b>Current official FSSAI first-source ledger<\/b>[\s\S]*?<\/details>/,"");
 return status+old;
};