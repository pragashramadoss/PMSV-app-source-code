"use strict";
/* Batch 6: Exact 35 current finished-food source cases and 31 cited CTR entries,
 * 45 unassigned comparisons. A source entry is NOT a legal article match.
 * Does not mutate ledgers, auto-assign limits, validate samples or grant PASS.
 */
var pmsvB6Evidence=null;
const pmsvB6Path="./data/rules/fssai-current35-ctr-explicit-article-crosscheck-batch6-2026-10-13.json";
const pmsvB6Hash="7827940da3fe3b5c";
const pmsvB6CTR="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB6Digest(o){
  const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
  for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
  return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB6Valid(){
  if(typeof pmsvB5Valid!=="function"||!pmsvB5Valid()||
    !pmsvB6Evidence||!pmsvB5Data||!pmsv498Ledger)return false;
  const d=pmsvB6Evidence;
  if(pmsvB6Digest(d)!==pmsvB6Hash||
    d.schema_version!=="1.0"||d.type!=="PMSV_35_CURRENT_OFFICIAL_CTR_EXPLICIT_ARTICLE_COMPARISON_BATCH6"||
    d.current_source_ledger?.catalogue!==533||d.current_source_ledger?.partial_exact!==498||
    d.current_source_ledger?.first_exact_source_pending!==35||
    d.official_ctr!==pmsvB6CTR||d.may_amendment_effective!=="2026-12-01"||
    d.named_article_rows?.length!==31||d.product_cases?.length!==35||
    d.case_comparisons_count!==45||d.case_comparisons_coverage?.with_comparisons!==28||
    d.case_comparisons_coverage?.no_comparisons!==7||
    d.first_exact_source_promotions!==0||d.official_legal_scope_adjudications!==0||
    d.finished_numeric_limit_assignments!==0||d.lot_test_verifications!==0||
    d.product_compliance_approvals!==0||d.update_live_ledger!==false||
    d.change_wordpress_site!==false||d.one_to_one_unique_catalog_ids!==true)return false;
  const rows=new Map(),used=new Set(),source=new Map(pmsv498Ledger.records.map(z=>[z.catalog_id,z]));
  for(const r of d.named_article_rows){
    if(rows.has(r?.key)||!r?.exact_ctr_article||!r.contaminant||
      !Number.isFinite(r.published_limit)||!Number.isInteger(r.pdf_page_zero_based)||
      r.pdf_page_zero_based<0||r.pdf_page_zero_based>55||
      r.official_source!==pmsvB6CTR||r.reference_only_not_assigned!==true||
      r.legal_finished_scope_confirmed!==false||r.lab_result_verified!==false)return false;
    rows.set(r.key,r);
  }
  let comparisons=0,without=0;
  for(let i=0;i<35;i++){
    const x=d.product_cases[i],q=pmsvB5Data.cases[i],l=source.get(x?.catalog_id);
    if(!x||!q||!l||used.has(x.catalog_id)||x.rank!==i+1||
      x.catalog_id!==q.catalog_id||x.product_name!==q.product_name||
      x.pending_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      x.primary_blocker!==q.primary_blocker||
      x.standalone_named_article_confirmed!==false||
      x.full_finished_product_identity_confirmed!==false||
      x.analytical_matrix_confirmed!==false||
      x.live_threshold_activation!==false||x.laboratory_pass!==false||
      x.product_compliance_pass!==false||!Array.isArray(x.compared_article_keys)||
      (x.compared_article_keys.length===0?x.review_class!=="NO_POSITIVE_NAMED_CTR_ARTICLE_IN_THIS_TARGETED_REVIEW":x.review_class!=="EXACT_NAMED_CTR_ARTICLE_COMPARISON_ONLY")||
      x.compared_article_keys.some(k=>!rows.has(k)))return false;
    comparisons+=x.compared_article_keys.length;
    if(x.compared_article_keys.length===0)without++;
    used.add(x.catalog_id);
  }
  return rows.size===31&&used.size===35&&comparisons===45&&without===7;
}
const pmsvB6OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
  await pmsvB6OldLoad();pmsvB6Evidence=null;
  try{
    const r=await fetch(pmsvB6Path+"?v=20261013-batch6",{cache:"reload"});
    if(!r.ok)throw Error("Official CTR article comparison source missing");
    pmsvB6Evidence=await r.json();
    if(!pmsvB6Valid())throw Error("Batch6 source integrity failed");
  }catch(_){pmsvB6Evidence=null;}
};
function pmsvB6Html(p){
  if(!p)return "";
  const active=pmsv35Queue?.review_records?.some(q=>q.catalog_id===p.id);
  if(!active)return "";
  if(!pmsvB6Valid())return '<div class="notice">Current official-article comparison unavailable. First exact source remains pending; no contaminant limits assigned.</div>';
  const x=pmsvB6Evidence.product_cases.find(q=>q.catalog_id===p.id);
  if(!x||p.name!==x.product_name||String(p.fssr||"")!==String(pmsv35Queue.review_records.find(z=>z.catalog_id===p.id).fssr||"")||
    String(p.fcs||"")!==String(pmsv35Queue.review_records.find(z=>z.catalog_id===p.id).fcs||""))
      return '<div class="notice">Product identity mismatch. No CTR article applied.</div>';
  const escape=v=>String(v??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
  const entries=new Map(pmsvB6Evidence.named_article_rows.map(r=>[r.key,r]));
  const comparisons=x.compared_article_keys.map(k=>entries.get(k));
  let table="";
  if(comparisons.length){
    table='<div class="tablewrap"><table><thead><tr><th>Contaminant</th><th>Official CTR article</th><th>Published reference only — NOT an assigned limit</th><th>Why it cannot be transferred automatically</th></tr></thead><tbody>'+
      comparisons.map(z=>'<tr><td>'+escape(z.contaminant)+'</td><td>'+escape(z.exact_ctr_article)+'</td>'+
      '<td>'+escape(z.published_limit)+' '+escape(z.unit)+' · PDF p.'+(z.pdf_page_zero_based+1)+' (viewer)</td>'+
      '<td>'+escape(z.scope_boundary)+'</td></tr>').join("")+'</tbody></table></div>';
  }else table='<p><b>No named article candidate established in this targeted comparison.</b> This is not evidence that no other provision applies.</p>';
  return '<details class="card" style="margin-top:12px"><summary><b>Batch 6 · official CTR article comparisons</b> · '+comparisons.length+
    ' research row(s), 0 approvals</summary>'+
    '<div class="notice"><b>FIRST EXACT SOURCE STILL PENDING.</b> These values only quote the official regulation. None has been applied as a finished-product threshold. No laboratory test or compliance PASS.</div>'+
    table+'<p><b>Evidence still needed:</b> '+escape(x.first_decisive_question)+'</p>'+
    '<small><a href="'+escape(pmsvB6CTR)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX (03.02.2026)</a> · May 2026 amendment starts 01.12.2026; not automatically enabled.</small>'+
    '</details>';
}
const pmsvB6Prior=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB6Html(p)+pmsvB6Prior(p)};
