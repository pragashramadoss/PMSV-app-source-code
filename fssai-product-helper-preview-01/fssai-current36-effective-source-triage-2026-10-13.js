"use strict";
/* Effective FSSAI 497/36 verification UI, May 2026 Gazette deferred until 1-Dec.
 * Preserve prior 493/40 and 495/38 records as collapsed historical research.
 * NEVER grant full compliance, lab PASS or numeric threshold from article comparisons.
 */
var pmsvCurrent36Triage=null;
const pmsvCurrent36Digest="84a6b44379f914a2";
const pmsvCurrent36MayWatchFixed=Object.freeze(["pulse_metal_article_expansion","fish_oil_inorganic_arsenic","oilseed_aflatoxin_article_wording","mace_nutmeg_saffrole","seafood_veterinary_drug_residues"]);
const pmsvCurrent36QueueIds=Object.freeze(["purified-vending-water","coffee-chicory-mixture","formulated-supplements-children","04-04-1-frozen-fruits-fruit-products","04-04-1-catechu-edible","04-04-1-seedless-tamarind","04-04-1-coconut-milk-powder","04-04-2-cocoa-beans","05-05-1-dry-mixtures-of-cocoa-and-sugars","05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake","06-06-1-chia-seeds","06-06-2-carob-powder","06-06-2-arrowroot","06-06-2-water-chestnut-flour-singhare-ka-atta","08-08-4-animal-casings","10-10-2-egg-powder","10-10-3-pickled-eggs","11-11-1-dried-glucose-syrup","11-11-1-edible-lactose","11-11-1-cube-sugar","11-11-1-misri","11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th","12-12-1-salt-substitutes","99-99-1-trehalose","99-99-1-sajji-khar","99-99-1-additives-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-and-other-","99-99-1-additives-va-vf-of-nutraceutical-regulations-excluding-those-already-standardised","99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc","99-99-7-ingredients-listed-under-schedule-iv-schedule-vi-and-schedule-viii-of-nutraceutica","99-99-7-mixtures-preparations-premix-of-functional-ingredients","100-100-cow-or-buffalo-colostrum-and-colostrum-products","100-100-royal-jelly","100-100-silver-leaf-chandi-ka-warq","102-102-1-14-3-narikela-ksheerika-milky-coconut-delight","102-102-1-14-7-ksheerapaka-mystic-milk-quartet","99-99-7-dietary-fibre-dextrin-soluble-fibre"]);
function pmsvCurrent36TriageValid(){
 if(typeof pmsv497Valid!=="function"||!pmsv497Valid()||
 typeof pmsvReviewSnapshotDigest!=="function"||!pmsvCurrent36Triage||
 pmsvReviewSnapshotDigest(pmsvCurrent36Triage)!==pmsvCurrent36Digest)return false;
 const d=pmsvCurrent36Triage,g=d.published_but_not_effective_amendment;
 if(d.schema_version!=="1.0"||d.scope!=="36_EFFECTIVE_PENDING_FIRST_NAMED_CTR_FINISHED_ARTICLE_DECISIONS"||
 d.source_policy!=="ONLY_OFFICIAL_FSSAI_FOSCOS"||
 d.catalogue!==533||d.partial_conditional_routes!==497||d.first_named_ctr_pending!==36||
 d.finished_goods_lab_approvals!==0||d.promotions_from_this_batch!==0||
 d.product_case_count!==36||d.reviewed_future_article_comparisons!==180||
 d.original_document_requests!==144||d.positive_evidence_gates!==144||
 d.records?.length!==36||g?.source!=="https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf"||
 g.effective_date!=="2026-12-01"||g.effective_on_review_date!==false||
 g.automatic_change_to_current_limits!==false||
 g.rule_families?.length!==5||
 pmsv497Ledger?.partial_exact!==497||pmsv497Ledger?.first_source_pending!==36||
 pmsv36Queue?.review_records?.length!==36)return false;
 const old=new Map(pmsv36Queue.review_records.map(x=>[x.catalog_id,x])),
 source=new Map(pmsv497Ledger.records.map(x=>[x.catalog_id,x])),seen=new Set();
 let comparisons=0,gates=0,futureCases=0,futureFlags=0;
 for(const x of d.records){
  const q=old.get(x.catalog_id),l=source.get(x.catalog_id);
  if(!pmsvCurrent36QueueIds.includes(x.catalog_id)||seen.has(x.catalog_id)||!q||!l||
   x.product_name!==q.product_name||x.product_name!==l.product_name||
   String(x.fssr||"")!==String(q.fssr||"")||String(x.fcs||"")!==String(q.fcs||"")||
   l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||x.current_status!=="FIRST_EXACT_SOURCE_PENDING"||
   !x.classification||!x.finished_form_nontransfer||!x.decisive_official_review||
   !x.original_evidence_question||!x.review_owner_role||
   x.evidence_requests?.length!==4||x.future_may_article_comparisons?.length!==5||
   !x.official_ctr_source?.includes("fssai.gov.in")||!x.official_product_source?.includes("fssai.gov.in")||
   x.current_source_promoted!==false||x.full_regulatory_pass!==false)return false;
  const ids=new Set();
  for(const c of x.future_may_article_comparisons){
   if(!pmsvCurrent36MayWatchFixed.includes(c.amendment_id)||ids.has(c.amendment_id)||
   !["NO_DIRECT_FINISHED_ARTICLE_MATCH_FROM_CURRENT_IDENTITY","CONDITIONAL_FUTURE_WATCH_REQUIRES_ACTUAL_FORMULA"].includes(c.status)||
   c.source_limit_enabled!==false||c.proven_legal_article!==false)return false;
   ids.add(c.amendment_id);comparisons++;
  }
  if(ids.size!==5||x.specific_future_only_watch_ids?.some(v=>!ids.has(v)))return false;
  const conditional=x.future_may_article_comparisons.filter(z=>z.status==="CONDITIONAL_FUTURE_WATCH_REQUIRES_ACTUAL_FORMULA").map(z=>z.amendment_id);
  if(JSON.stringify(conditional)!==JSON.stringify(x.specific_future_only_watch_ids))return false;
  if(conditional.length)futureCases++;futureFlags+=conditional.length;
  const gatesObj=x.positive_proof_gate;
  if(!gatesObj||Object.keys(gatesObj).length!==4||!Object.values(gatesObj).every(z=>z===false))return false;
  gates+=4;seen.add(x.catalog_id);
 }
 return seen.size===36&&comparisons===180&&gates===144&&
 futureCases===d.case_specific_future_watch_count&&futureFlags===d.future_watch_rule_count;
}
var pmsvBeforeCurrent36Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeCurrent36Load();pmsvCurrent36Triage=null;
 try{
  const r=await fetch("./data/rules/fssai-current36-source-and-december-amendment-guard-2026-10-13.json?v=20261013-36effect",{cache:"reload"});
  if(!r.ok)throw Error("Current 36 source ledger audit missing");
  pmsvCurrent36Triage=await r.json();
  if(!pmsvCurrent36TriageValid())throw Error("Current 36 source amendment guard failed");
 }catch(_){pmsvCurrent36Triage=null;}
};
function pmsvCurrent36FutureLabel(){
 const today=new Date().toISOString().slice(0,10);
 return today<"2026-12-01"?"Gazetted 2026 amendment NOT YET IN FORCE (commences 1 December 2026)":
 "Scheduled commencement has passed; revalidate latest gazettes and each finished article before applying any change";
}
function pmsvCurrent36StatusHtml(p){
 if(!p)return "";
 if(!pmsvCurrent36TriageValid())
 return '<div class="notice">Current 497/36 source integrity unavailable. Do not infer a compliance PASS from historical records.</div>';
 const l=pmsv497Ledger.records.find(x=>x.catalog_id===p.id);
 if(!l||l.product_name!==p.name||String(l.fssr||"")!==String(p.fssr||"")||
 String(l.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Current product identity mismatch; source status not displayed as approved.</div>';
 const esc36=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 const x=pmsvCurrent36Triage.records.find(z=>z.catalog_id===p.id);
 let h='<details class="card" style="margin-top:12px" open><summary><b>Effective regulatory first-source status — 497 partial / 36 pending</b> · '+
 (l.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL CONDITIONAL SOURCE":"FIRST SOURCE PENDING")+'</summary>'+
 '<div class="notice">533 identities. This is a source research status only; <b>NO finished lot, laboratory result or product compliance approved</b>.</div>';
 if(x){
  h+='<p><b>Outstanding exact source determination:</b> '+esc36(x.decisive_official_review)+'</p>'+
  '<p><b>Known non-transfer:</b> '+esc36(x.finished_form_nontransfer)+'</p>'+
  '<p><b>Required documentation:</b></p><ol>'+x.evidence_requests.map(s=>'<li>'+esc36(s)+'</li>').join("")+'</ol>'+
  '<p><b>Evidence owner role:</b> '+esc36(x.review_owner_role)+'</p>';
  if(x.specific_future_only_watch_ids.length)
   h+='<p><b>Conditional future amendment review, NOT currently operative:</b> '+
   x.specific_future_only_watch_ids.map(id=>esc36(pmsvCurrent36Triage.published_but_not_effective_amendment.rule_families.find(z=>z.id===id)?.article||id)).join("; ")+
   '. Actual ingredient identity or botanical class not verified.</p>';
 }else h+='<p><b>Partial named source only.</b> Actual marketed finished identity, ingredient/formulation, analytical sample and remaining contaminants have not received a regulatory PASS.</p>';
 return h+'<p><b>Amendment status:</b> '+esc36(pmsvCurrent36FutureLabel())+'</p>'+
 '<small><a href="'+esc36(pmsvCurrent36Triage.published_but_not_effective_amendment.source)+'" target="_blank" rel="noopener noreferrer">Official May 2026 FSSAI Gazette</a> · '+
 '<a href="'+esc36(pmsvCurrent36Triage.current_ctr.source)+'" target="_blank" rel="noopener noreferrer">Current official CTR IX</a></small></details>';
}
var pmsvCurrent36ArchivedHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 if(!pmsvCurrent36TriageValid())return pmsvCurrent36StatusHtml(p);
 const current=pmsvCurrent36StatusHtml(p);
 return current+'<details class="card" style="margin-top:12px"><summary>Previous FSSAI source research and legacy 40-case receipt notes — historical only</summary>'+
 pmsvCurrent36ArchivedHtml(p)+'</details>';
};
