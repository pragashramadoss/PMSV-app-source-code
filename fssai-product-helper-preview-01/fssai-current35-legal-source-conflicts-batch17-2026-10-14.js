"use strict";
/* Batch 17: official named-article research & absolute no-transfer guards. No active threshold. */
var pmsvB17Data=null;
const pmsvB17Path="./data/rules/fssai-current35-legal-source-conflicts-batch17-2026-10-14.json";
const pmsvB17Expected="5167741d23340378";
function pmsvB17Valid(){
 if(typeof pmsvB16Valid!=="function"||!pmsvB16Valid()||!pmsvB17Data||
 !pmsvB16Data||!pmsvB14Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB17Data,c=d.new_legal_article_research;
 if(pmsvB16Digest(d)!==pmsvB17Expected||d.kind!=="PMSV_CURRENT35_SOURCE_CONTRADICTION_AND_COFFEE_REVIEW_BATCH17"||
 d.date!=="2026-10-14"||d.scope!=="GH_PAGES_PREVIEW_NOT_WORDPRESS"||
 d.official_source_policy!=="FSSAI_FOSCOS_ONLY"||d.ctr_source!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
 d.catalogue!==533||d.conditional_first_source_matches!==498||d.first_exact_pending!==35||
 d.original_conditional_candidates!==3||d.previous_named_research!==7||
 d.new_named_research!==1||d.remaining_without_additional_named_research!==24||
 d.future_amendment_commencement!=="2026-12-01"||d.future_amendment_auto_applied!==false||
 d.results?.new_first_source_promotions!==0||d.results?.active_numeric_limits_assigned!==0||
 d.results?.verified_lot_results!==0||d.results?.full_compliance_approvals!==0||
 d.results?.canonical_ledger_modified!==false||d.results?.wordpress_modified!==false||
 d.all_pending_cases?.length!==35||d.exact_nontransfer_findings?.length!==6||
 c?.catalog_id!=="coffee-chicory-mixture"||c?.named_article!=="Coffee"||
 c?.analyte!=="Ochratoxin A"||c?.published_source_value!==5||c?.published_source_unit!=="µg/kg"||
 c?.documentary_gates?.length!==4||c?.ctr_pdf_page_zero_based!==14||
 !/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(c.fssr_source)||
 pmsv498Ledger.first_source_pending!==35||pmsv35Queue.review_records?.length!==35)return false;
 const known=new Set(),excluded=new Set(),map=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 let counts={PREVIOUS_THREE_CONDITIONAL:0,PREVIOUS_SEVEN_RESEARCH:0,B17_ADDITIONAL_NAMED_COMMODITY_RESEARCH:0,NO_SPECIFIC_NEW_CANDIDATE:0};
 for(let i=0;i<35;i++){
  const x=d.all_pending_cases[i],b=pmsvB16Data.cases[i],r=pmsv35Queue.review_records[i];
  if(!x||!b||!r||known.has(x.catalog_id)||x.rank!==i+1||
   x.catalog_id!==b.catalog_id||x.catalog_id!==r.catalog_id||
   x.product_name!==b.product_name||x.fssr!==b.fssr||x.fcs!==b.fcs||
   map.get(x.catalog_id)?.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||x.no_limit_activated!==true||
   !(x.research_state in counts)||
   x.research_state!==(x.catalog_id===c.catalog_id?"B17_ADDITIONAL_NAMED_COMMODITY_RESEARCH":b.route_state==="PRIOR_NAMED_CONDITIONAL"?"PREVIOUS_THREE_CONDITIONAL":b.route_state==="NEW_RESEARCH_COMMODITY_HYPOTHESIS"?"PREVIOUS_SEVEN_RESEARCH":"NO_SPECIFIC_NEW_CANDIDATE"))return false;
  counts[x.research_state]++;known.add(x.catalog_id);
 }
 if(counts.PREVIOUS_THREE_CONDITIONAL!==3||counts.PREVIOUS_SEVEN_RESEARCH!==7||
 counts.B17_ADDITIONAL_NAMED_COMMODITY_RESEARCH!==1||counts.NO_SPECIFIC_NEW_CANDIDATE!==24)return false;
 for(const x of d.exact_nontransfer_findings){
  if(!known.has(x.catalog_id)||x.catalog_id===c.catalog_id||excluded.has(x.catalog_id)||
   x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||x.auto_numeric_limit_applied!==false||
   x.compliance_approved!==false||!x.finding||!x.next||
   !/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(x.fssr_source)||
   !Number.isInteger(x.ctr_page))return false;
  excluded.add(x.catalog_id);
 }
 return excluded.size===6&&known.size===35;
}
function pmsvB17Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB17Valid())return '<div class="notice">Batch 17 source review unavailable; no source status changed.</div>';
 const d=pmsvB17Data,b=pmsvB14Data.cases.find(x=>x.catalog_id===p.id);
 if(!b||b.product_name!==p.name||String(b.fssr||"")!==String(p.fssr||"")||
 String(b.fcs||"")!==String(p.fcs||""))return '<div class="notice">Exact product identity mismatch. Source remains pending.</div>';
 const e=pmsvB14Esc,x=d.exact_nontransfer_findings.find(z=>z.catalog_id===p.id);
 const c=p.id===d.new_legal_article_research.catalog_id?d.new_legal_article_research:null;
 if(!x&&!c)return "";
 if(x)return '<details class="card" style="margin-top:12px"><summary><b>Batch 17 · source applicability exclusion</b> — do not transfer a different article</summary>'+
 '<div class="notice"><b>FIRST EXACT SOURCE PENDING — NO APPLIED LIMIT.</b></div>'+
 '<p><b>'+e(x.topic)+'</b></p><p>'+e(x.finding)+'</p><p><b>Decisive next step:</b> '+e(x.next)+'</p>'+
 '<small><a href="'+e(x.fssr_source)+'" target="_blank" rel="noopener noreferrer">FSSAI product source</a> · <a href="'+e(d.ctr_source)+'" target="_blank" rel="noopener noreferrer">CTR IX page '+(x.ctr_page+1)+'</a>. No lot PASS.</small></details>';
 return '<details class="card" style="margin-top:12px"><summary><b>Batch 17 · coffee ochratoxin A research</b> — final blend applicability NOT proven</summary>'+
 '<div class="notice"><b>REFERENCE ONLY. NOT AN ACTIVATED FINISHED-PRODUCT LIMIT.</b> '+e(c.analyte)+' '+e(c.published_source_value)+' '+e(c.published_source_unit)+' is published for the commodity '+e(c.named_article)+'. The 2.10.4 coffee-chicory mixture is different.</div>'+
 '<p>'+e(c.positive_official_evidence)+'</p><p><b>Legal scope blocker:</b> '+e(c.scope_blocker)+'</p>'+
 '<p>Required positive evidence:</p><ol>'+c.documentary_gates.map(z=>'<li>'+e(z)+'</li>').join("")+'</ol>'+
 '<small><a href="'+e(c.fssr_source)+'" target="_blank" rel="noopener noreferrer">FSSAI 2.10.4</a> · <a href="'+e(d.ctr_source)+'" target="_blank" rel="noopener noreferrer">CTR IX p.15</a></small></details>';
}
function pmsvB17MatrixHtml(){
 if(!pmsvB17Valid())return "";
 const e=pmsvB14Esc,d=pmsvB17Data;
 return '<details class="card" id="pmsv-b17-scope-matrix" style="margin-bottom:12px">'+
 '<summary><b>Batch 17 · legal article conflict review</b> — 35 still pending</summary>'+
 '<div class="notice"><b>0 legal-source promotions / 0 compliance PASS.</b> Three previous conditional sources, seven earlier research hypotheses, one new coffee-mixture research candidate and 24 others with no new named article. Six explicit no-transfer cases are documented below.</div>'+
 '<p><b>Six article mismatches:</b> '+d.exact_nontransfer_findings.map(x=>e(x.product_name)).join("; ")+'</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Finished product</th><th>Current research category</th></tr></thead><tbody>'+
 d.all_pending_cases.map(x=>'<tr><td>'+e(x.product_name)+'</td><td>'+e(x.research_state.replaceAll("_"," "))+'</td></tr>').join("")+
 '</tbody></table></div></details>';
}
function pmsvB17EnsureMatrix(){
 if(typeof document==="undefined"||!pmsvB17Valid())return;
 const target=document.getElementById("selectedProductStandardContent");
 if(target&&!document.getElementById("pmsv-b17-scope-matrix"))target.insertAdjacentHTML("beforebegin",pmsvB17MatrixHtml());
}
const pmsvB17PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB17PriorLoad();pmsvB17Data=null;
 try{
  const res=await fetch(pmsvB17Path+"?v=20261014-b17",{cache:"reload"});
  if(!res.ok)throw Error("Missing Batch 17 source review");
  pmsvB17Data=await res.json();
  if(!pmsvB17Valid())throw Error("Batch 17 source integrity failed");
  pmsvB17EnsureMatrix();
 }catch(_){pmsvB17Data=null;}
};
const pmsvB17PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB17Html(p)+pmsvB17PriorHtml(p);};
