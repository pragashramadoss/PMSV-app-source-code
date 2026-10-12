"use strict";
/* 423/110 canonical first-source ledger. Source-only qualified dried-fruit
 * subset, not a numeric approval for all nuts and dry-fruit mixtures.
 * All earlier 422/111 datasets remain immutable archives. */
var pmsv2026Current423Manifest=null,pmsv2026Current423Ledger=null,pmsv2026Current110Queue=null;
const pmsv2026Current423Digests=Object.freeze({"man":"841559f39048cf86","ledger":"7d4a3ed1eeb63c3c","queue":"7a81a5700c15076d"});
const pmsv2026Current423Id="04-04-1-dry-fruits-and-nuts";
function pmsv2026Current423Valid(){
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv2026Current423Manifest,d=pmsv2026Current423Ledger,q=pmsv2026Current110Queue,
       last=pmsv2026Current422Ledger,old=pmsv2026Current111Queue,c=contaminantsDb;
 if(!m||!d||!q||!last||!old||!c||
    pmsvReviewSnapshotDigest(m)!==pmsv2026Current423Digests.man||
    pmsvReviewSnapshotDigest(d)!==pmsv2026Current423Digests.ledger||
    pmsvReviewSnapshotDigest(q)!==pmsv2026Current423Digests.queue||
    m.source_policy!=="OFFICIAL_FSSAI_ONLY"||
    m.product?.catalog_id!==pmsv2026Current423Id||
    m.product?.product_name!=="Dry fruits and Nuts"||
    m.product?.fssr!=="2.3.47(5)"||
    m.product?.fcs!=="04.1.2.2"||
    m.official_contaminants!==c.official_sources?.[0]?.url||
    m.official_product_standard!=="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf"||
    m.official_fssr!=="2.3.47(5)"||
    m.source_version!==c.source_version||
    m.official_ctr_section!=="2.3.1"||m.official_pesticide_serial!==114||
    m.source_article!=="Dried fruits"||m.source_mrl!==8||m.source_unit!=="mg/kg"||
    m.qualifying_dried_fruit_subtype_source_supported!==true||
    m.whole_fruit_or_nut_category_unconditionally_matched!==false||
    m.actual_lot_dried_fruit_confirmed!==false||
    m.numeric_finished_food_limit_auto_applied!==false||
    m.complete_contaminant_panel!==false||m.regulatory_compliance_pass!==false||
    m.laboratory_pass!==false||m.excluded_from_positive_subroute?.length!==6||
    m.baseline?.catalogue!==533||m.baseline?.partial_first_source!==422||
    m.baseline?.first_source_pending!==111||
    m.latest?.catalogue!==533||m.latest?.partial_first_source!==423||
    m.latest?.first_source_pending!==110||m.latest?.full_regulatory_approvals!==0||
    d.catalogue!==533||d.partial_exact!==423||d.first_source_pending!==110||
    d.full_compliance_approvals!==0||d.previous_archived_pending!==111||
    d.positive_delta_count!==1||d.baseline_file!=="fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json"||
    d.promotion_manifest!=="fssai-dry-fruits-and-nuts-conditional-dried-fruit-malathion-2026-10-12.json"||d.records?.length!==533||
    q.catalogue!==533||q.partial_exact!==423||q.first_source_pending!==110||
    q.completed_compliance!==0||q.archive_111_count!==111||
    q.subsequent_promotions!==6||q.promoted_catalog_ids?.length!==6||
    q.current_ledger_file!=="fssai-current-first-source-533-live-ledger-423-110-2026-10-12.json"||
    q.baseline_file!=="fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"||q.review_records?.length!==110||
    last.partial_exact!==422||last.first_source_pending!==111||
    old.review_records?.length!==111||
    !old.review_records.some(x=>x.catalog_id===pmsv2026Current423Id)||
    q.review_records.some(x=>x.catalog_id===pmsv2026Current423Id)||
    !q.promoted_catalog_ids.includes(pmsv2026Current423Id))return false;
 const dry=c.chapter_2_3_dried_fruit_exact_malathion_v9;
 if(dry?.commodity_article!=="Dried fruits"||
    !/malathion.*malaoxon/i.test(dry?.pesticide_name||"")||
    dry.copy_fresh_fruit_4mgkg_prohibited!==true||
    dry.automatic_compliance_pass!==false)return false;
 const real=c.residue_mrls?.pesticides?.find(x=>x.name===dry.pesticide_name);
 const matches=(real?.rows||[]).filter(x=>x.food==="Dried fruits"&&
    Number(x.mrl)===8&&x.unit==="mg/kg");
 if(matches.length!==1||
    (real?.rows||[]).filter(x=>x.food==="Fruits"&&Number(x.mrl)===4).length!==1)return false;
 let p=0,u=0;
 for(let i=0;i<533;i++){
  const a=last.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
    String(a.fssr||"")!==String(b.fssr||"")||
    String(a.fcs||"")!==String(b.fcs||"")||
    b.sample_lab_pass!==false||b.product_compliance_approval!==false||
    b.complete_contaminant_panel!==false)return false;
  if(a.catalog_id!==pmsv2026Current423Id&&JSON.stringify(a)!==JSON.stringify(b))return false;
  if(a.catalog_id===pmsv2026Current423Id){
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
      b.regulatory_source_verified_delta?.evidence_class!==
       "official_fssr_named_dried_fruit_subtype_pesticide_malathion"||
      b.regulatory_source_verified_delta?.source_residue_mrl!==8||
      b.regulatory_source_verified_delta?.source_article!==m.source_article||
      b.regulatory_source_verified_delta?.actual_lot_dried_fruit_confirmed!==false||
      b.regulatory_source_verified_delta?.mixed_or_nut_form_auto_excluded!==true||
      b.regulatory_source_verified_delta?.numeric_finished_food_limit_auto_applied!==false||
      b.regulatory_source_verified_delta?.full_compliance_pass!==false||
      b.missing_first_exact_evidence!==false)return false;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")p++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING")u++;
  else return false;
 }
 if(p!==423||u!==110)return false;
 const expected=new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 const prior=new Map(old.review_records.map(x=>[x.catalog_id,x]));
 const cur=new Set();
 for(const x of q.review_records){
  if(cur.has(x.catalog_id)||!expected.has(x.catalog_id)||
     JSON.stringify(x)!==JSON.stringify(prior.get(x.catalog_id))||
     x.first_exact_source_verified!==false||
     x.numeric_finished_food_limit_auto_applied!==false||
     x.finished_food_laboratory_pass!==false||
     x.full_regulatory_compliance_approval!==false)return false;
  cur.add(x.catalog_id);
 }
 return expected.size===110&&cur.size===110;
}
var pmsvBefore423Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore423Load();
 pmsv2026Current423Manifest=null;pmsv2026Current423Ledger=null;pmsv2026Current110Queue=null;
 try{
  const files=["fssai-dry-fruits-and-nuts-conditional-dried-fruit-malathion-2026-10-12.json","fssai-current-first-source-533-live-ledger-423-110-2026-10-12.json","fssai-current-110-first-exact-source-proof-worklist-2026-10-12.json"];
  const fetched=await Promise.all(files.map(x=>fetch("./data/rules/"+x+"?v=20261012-423110",{cache:"reload"})));
  if(fetched.some(x=>!x.ok))throw Error("Current 423/110 source documents missing");
  [pmsv2026Current423Manifest,pmsv2026Current423Ledger,pmsv2026Current110Queue]=
   await Promise.all(fetched.map(x=>x.json()));
  if(!pmsv2026Current423Valid())throw Error("Current source data was altered");
 }catch(_){pmsv2026Current423Manifest=null;pmsv2026Current423Ledger=null;pmsv2026Current110Queue=null;}
};
function pmsv2026Current423Html(p){
 if(!p)return "";
 if(!pmsv2026Current423Valid())
  return '<div class="notice"><b>Latest 423/110 source state withheld.</b> Source mismatch; no numeric assignment or PASS.</div>';
 const r=pmsv2026Current423Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Latest finished-product catalogue identity failed to reconcile.</div>';
 const promoted=p.id===pmsv2026Current423Id;
 const title=r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL EXACT SOURCE MATCH":"FIRST EXACT SOURCE PENDING";
 let h='<details class="card" style="margin-top:12px"><summary><b>Current verified FSSAI ledger — 423/110</b> · '+esc(title)+'</summary>'+
    '<div class="notice"><b>533 identities · 423 partial first-source matches · 110 still pending · 0 full regulatory or laboratory PASS.</b> Evidence is not permission to issue a compliance result.</div>';
 if(promoted){
  const m=pmsv2026Current423Manifest;
  h+='<p><b>Affirmative standard identity:</b> FSSR 2.3.47(5) Dry Fruits and Nuts explicitly includes the separately identifiable <b>dried-fruit</b> subtype.</p>'+
   '<p><b>Official named source reference for that subtype only:</b> FSSAI Version IX §2.3.1, serial 114, Malathion combined with malaoxon: <b>8 mg/kg</b> for <b>Dried fruits</b>. This is not a laboratory result and not automatically applied to the product.</p>'+
   '<p><b>Excluded from automatic applicability:</b> Nuts, mixed fruit/nut products, unrelated sweets/snacks, or a lot whose actual dried-fruit identity and sampled form have not been established. The distinct fresh-fruit reference is 4 mg/kg and must not replace the dried-fruit row.</p>'+
   '<p><b>Still required:</b> '+esc(m.outstanding_checks)+'</p>'+
   '<small><a href="'+esc(m.official_product_standard)+'" target="_blank" rel="noopener noreferrer">Official FSSR 2.3.47(5)</a> · '+
   '<a href="'+esc(m.official_contaminants)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX §2.3.1</a></small>';
 }else h+='<p>Current status is first-source evidence only. Other contaminants, pesticides, analytical requirements and compliance are not automatically cleared.</p>';
 return h+'</details>';
}
var pmsvBefore423Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const current=pmsv2026Current423Html(p);
 if(!p||!pmsv2026Current423Valid())return current;
 if(p.id===pmsv2026Current423Id)return current;
 let old=pmsvBefore423Proof(p);
 old=old.replace(/<details class="card" style="margin-top:12px"><summary><b>Current official FSSAI first-source ledger<\/b>[\s\S]*?<\/details>/,"");
 old=old.replaceAll("Current first-source decision — 111 remaining","Archived 111-item product proof packet")
        .replaceAll("Current 111-queue source-row crosscheck","Archived 111-case source-row crosscheck")
        .replaceAll("422 partial source matches / 111 pending / 0 compliance PASS.","Historical source crosswalk (422/111); current 423/110 status is above. No compliance PASS.");
 return current+old;
};
var pmsvBefore423LocalProof=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv2026Current423Valid())
   return '<div class="notice">Latest current 423/110 source ledger unavailable. No source PASS.</div>';
 if(p.id===pmsv2026Current423Id)return "";
 return pmsvBefore423LocalProof(p);
};
