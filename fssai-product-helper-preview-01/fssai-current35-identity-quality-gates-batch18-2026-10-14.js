"use strict";
/* Batch 18: no unproven source promotions. FSSR quality is not CTR contaminant approval. */
var pmsvB18Data=null;
const pmsvB18Path="./data/rules/fssai-current35-identity-quality-gates-batch18-2026-10-14.json";
const pmsvB18Expected="69249b1c40715bdb";
function pmsvB18Valid(){
 if(typeof pmsvB17Valid!=="function"||!pmsvB17Valid()||
 !pmsvB18Data||!pmsvB17Data||!pmsvB14Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB18Data;
 if(pmsvB16Digest(d)!==pmsvB18Expected||
 d.kind!=="PMSV_CURRENT35_NO_NAMED_ARTICLE_TRIAGE_BATCH18"||
 d.schema_version!=="1.0"||d.date!=="2026-10-14"||
 d.official_sources_only!==true||d.canonical_total!==533||d.current_conditional!==498||
 d.current_first_exact_pending!==35||d.prior_b17_named_research!==11||
 d.remaining_no_new_named_research!==24||d.focus_fssr_quality_identity_cases!==8||
 d.focus_documentary_gates!==32||d.remaining_prior_worklist_cases!==16||
 d.covered_24?.length!==24||d.focus_8?.length!==8||
 d.official_ctr_pdf!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
 d.future_ctr_amendment_effective!=="2026-12-01"||
 d.future_ctr_amendment_auto_applied!==false||
 d.results?.new_exact_source_promotions!==0||d.results?.numeric_ctr_limits_activated!==0||
 d.results?.lot_lab_passes!==0||d.results?.regulatory_passes!==0||
 d.results?.canonical_ledger_changed!==false||d.results?.wordpress_production_changed!==false||
 pmsv498Ledger.first_source_pending!==35)return false;
 const old=pmsvB17Data.all_pending_cases.filter(x=>x.research_state==="NO_SPECIFIC_NEW_CANDIDATE");
 const original=new Map(pmsv35Queue.review_records.map(x=>[x.catalog_id,x]));
 const ledger=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 const ids=new Set();
 const tiers=new Set(["DEFINED_PRODUCT_REQUIRES_EXACT_CTR_ARTICLE","GROUP_WITHOUT_SINGLE_CONSTITUENT","MULTI_INGREDIENT_RECIPE"]);
 for(let i=0;i<24;i++){
  const x=d.covered_24[i],b=old[i],q=original.get(x?.catalog_id);
  if(!x||!b||!q||ids.has(x.catalog_id)||x.rank!==i+1||
   x.catalog_id!==b.catalog_id||x.product_name!==b.product_name||
   x.fssr!==b.fssr||x.fcs!==b.fcs||
   String(q.fssr||"")!==String(x.fssr||"")||
   String(q.fcs||"")!==String(x.fcs||"")||
   !tiers.has(x.identity_tier)||!x.next_decisive_request||
   x.current_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   ledger.get(x.catalog_id)?.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.numeric_limit_assigned!==false||x.lab_pass!==false||x.regulatory_pass!==false)return false;
  ids.add(x.catalog_id);
 }
 const focusIds=new Set();let gates=0;
 for(const x of d.focus_8){
  const q=original.get(x.catalog_id),b=d.covered_24.find(z=>z.catalog_id===x.catalog_id);
  if(!q||!b||focusIds.has(x.catalog_id)||x.product_name!==q.product_name||
    String(x.fssr||"")!==String(q.fssr||"")||String(x.fcs||"")!==String(q.fcs||"")||
    b.evidence_focus!=="B18_FSSR_IDENTITY_QUALITY_GATES"||
    !x.fssr_clause||!x.positive_fssr_identity_quality||!x.distinction_from_ctr||
    !x.forbidden_automatic_article_transfer||x.proof_requirements?.length!==4||
    !/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(x.official_fssr_pdf)||
    x.official_ctr_pdf!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||!Number.isInteger(x.fssr_page_zero_based)||
    x.quality_standard_is_ctr_limit!==false||x.complete_contaminant_panel!==false||
    x.finished_lot_verified!==false||x.first_exact_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    x.numeric_contaminant_limit_assigned!==false||x.compliance_pass!==false)return false;
  gates+=x.proof_requirements.length;focusIds.add(x.catalog_id);
 }
 return ids.size===24&&focusIds.size===8&&gates===32&&
 d.covered_24.filter(x=>x.evidence_focus==="B18_FSSR_IDENTITY_QUALITY_GATES").length===8&&
 d.covered_24.filter(x=>x.evidence_focus==="EXISTING_B14_SIGNED_SOURCE_ACTION").length===16;
}
function pmsvB18Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB18Valid())return '<div class="notice">Batch 18 source worklist unavailable; prior source statuses remain unchanged.</div>';
 const x=pmsvB18Data.focus_8.find(z=>z.catalog_id===p.id);
 if(!x)return "";
 const q=pmsvB14Data.cases.find(z=>z.catalog_id===p.id);
 if(!q||q.product_name!==p.name||String(q.fssr||"")!==String(p.fssr||"")||
    String(q.fcs||"")!==String(p.fcs||""))
    return '<div class="notice">Exact identity mismatch. No legal source assigned.</div>';
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary><b>Batch 18 · FSSR identity and quality are NOT CTR limits</b></summary>'+
 '<div class="notice"><b>FIRST EXACT CONTAMINANT SOURCE STILL PENDING.</b> No new limits and no lot PASS.</div>'+
 '<p><b>Positive FSSR '+e(x.fssr_clause)+' product identity:</b> '+e(x.positive_fssr_identity_quality)+'</p>'+
 '<p><b>Quality versus contaminants:</b> '+e(x.distinction_from_ctr)+'</p>'+
 '<p><b>Forbidden transfer:</b> '+e(x.forbidden_automatic_article_transfer)+'</p>'+
 '<p><b>Four decisive proof requirements</b></p><ol>'+
 x.proof_requirements.map(v=>'<li>'+e(v)+'</li>').join("")+'</ol>'+
 '<small><a href="'+e(x.official_fssr_pdf)+'" target="_blank" rel="noopener noreferrer">Official FSSR PDF page '+(x.fssr_page_zero_based+1)+'</a> · '+
 '<a href="'+e(x.official_ctr_pdf)+'" target="_blank" rel="noopener noreferrer">FSSAI CTR IX</a>. No finished-product approval.</small></details>';
}
function pmsvB18CsvText(){
 if(!pmsvB18Valid())return "";
 const quote=v=>'"'+String(v??"").replaceAll('"','""').replace(/[\r\n]+/g," ")+'"';
 const head=["Catalogue ID","Product","FSSR","FoSCoS Category","Identity Tier","Blocker","Decisive Evidence Request","Status"];
 const rows=pmsvB18Data.covered_24.map(r=>[r.catalog_id,r.product_name,r.fssr,r.fcs,r.identity_tier,r.blocker,r.next_decisive_request,r.current_source_status]);
 return [head,...rows].map(row=>row.map(quote).join(",")).join("\r\n")+"\r\n";
}
function pmsvB18Download(){
 const csv=pmsvB18CsvText();
 if(!csv||typeof document==="undefined")return;
 const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="PMSV-FSSAI-24-Pending-First-Source-Worklist-Batch18.csv";
 document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function pmsvB18MatrixHtml(){
 if(!pmsvB18Valid())return "";
 const e=pmsvB14Esc,d=pmsvB18Data;
 return '<details class="card" id="pmsv-b18-quality-worklist" style="margin-bottom:12px">'+
 '<summary><b>Batch 18 · 24 pending named-article source worklist</b> — 8 detailed product-quality gates</summary>'+
 '<div class="notice"><b>533 catalogue / 498 conditional / 35 pending.</b> This 24-case worklist does not promote a source. Eight FSSR identity/quality case studies add 32 document proof questions; the other 16 retain original signed-source requests.</div>'+
 '<button type="button" id="pmsv-b18-export" class="secondary-btn">Export 24 unresolved cases (CSV)</button>'+
 '<div class="tablewrap"><table><thead><tr><th>Product</th><th>Identity scope</th><th>Decisive next request</th></tr></thead><tbody>'+
 d.covered_24.map(x=>'<tr><td>'+e(x.product_name)+'</td><td>'+e(x.identity_tier.replaceAll("_"," "))+'</td><td>'+e(x.next_decisive_request)+'</td></tr>').join("")+
 '</tbody></table></div><small>Official FSSAI/FoSCoS sources only. CSV is generated locally; no upload to server.</small></details>';
}
function pmsvB18EnsureMatrix(){
 if(typeof document==="undefined"||!pmsvB18Valid())return;
 const target=document.getElementById("selectedProductStandardContent");
 if(target&&!document.getElementById("pmsv-b18-quality-worklist"))
 target.insertAdjacentHTML("beforebegin",pmsvB18MatrixHtml());
 if(!pmsvB18ExportBound){
  document.addEventListener("click",event=>{
   const t=event.target;
   if(t&&t.id==="pmsv-b18-export")pmsvB18Download();
  });pmsvB18ExportBound=true;
 }
}
var pmsvB18ExportBound=false;
const pmsvB18PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB18PriorLoad();pmsvB18Data=null;
 try{
  const res=await fetch(pmsvB18Path+"?v=20261014-b18",{cache:"reload"});
  if(!res.ok)throw Error("Missing Batch 18 source worklist");
  pmsvB18Data=await res.json();
  if(!pmsvB18Valid())throw Error("Batch 18 integrity failed");
  pmsvB18EnsureMatrix();
 }catch(_){pmsvB18Data=null;}
};
const pmsvB18PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB18Html(p)+pmsvB18PriorHtml(p);};
