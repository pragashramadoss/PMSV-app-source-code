"use strict";
/* B38: actual lab evidence readiness; no legal scope, compliance, or new 2027 rule applied early. */
var pmsvB38Data=null,pmsvB38Search="",pmsvB38Family="ALL";
const pmsvB38Path="./data/rules/fssai-current35-analytical-evidence-packets-batch38-2026-10-16.json";
const pmsvB38Expected="2ae294c422d37c77";
const pmsvB38Families=["TRACE_METALS","MYCOTOXINS","PESTICIDE_RESIDUES","VETERINARY_DRUG_RESIDUES","UNSPECIFIED_RESIDUE"];
function pmsvB38Valid(){
 if(typeof pmsvB37Valid!=="function"||!pmsvB37Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB38Data||
 pmsvB14Digest(pmsvB38Data)!==pmsvB38Expected)return false;
 const d=pmsvB38Data,n=d.counts;
 if(d.schema_version!=="1.0"||d.as_of!=="2026-10-16"||
 d.kind!=="PMSV_CURRENT35_ANALYTICAL_EVIDENCE_READY_PACKETS_BATCH38"||
 d.deployment!=="GITHUB_PAGES_PREVIEW_ONLY"||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_cases_pending!==35||n.packets!==35||
 n.metal!==27||n.mycotoxin!==3||n.pesticide!==3||
 n.veterinary!==1||n.unspecified_residue!==1||
 n.current_ctr_approvals!==0||n.actual_lab_reports_verified!==0||
 n.lab_compliance_passes!==0||n.wordpress_changed!==false||
 d.results?.source_ledger_unchanged!==true||
 d.results.auto_scope_assignments!==0||
 d.results.automatic_numeric_limit_transfers!==0||
 d.results.actual_lab_passes!==0||d.results.wordpress_unchanged!==true||
 d.analysis_method_groups?.length!==5||
 d.legislation_commencements?.length!==2||
 d.quality_gates?.length!==5||
 d.evidence_packets?.length!==35||
 pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const ctr=d.legislation_commencements.find(x=>x.id==="FUTURE_CTR_2026");
 const lab=d.legislation_commencements.find(x=>x.id==="FUTURE_LAB_2027");
 if(ctr?.commencement!=="2026-12-01"||
 lab?.commencement!=="2027-04-01"||
 ctr.legal_status_as_of_2026_10_16!=="PUBLISHED_NOT_IN_FORCE"||
 lab.legal_status_as_of_2026_10_16!=="PUBLISHED_NOT_IN_FORCE"||
 lab.primary_pdf_text_verified!==false||ctr.primary_pdf_text_verified!==false)return false;
 const counts={};for(const f of pmsvB38Families)counts[f]=0;
 const known=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const seen=new Set();
 if(known.size!==35)return false;
 for(const r of d.evidence_packets){
  const prev=known.get(r.catalog_id);
  if(!prev||seen.has(r.catalog_id)||
   r.rank!==prev.rank||r.product_name!==prev.product_name||
   r.fssr!==prev.fssr||r.fcs!==prev.fcs||
   r.prior_ctr_comparator!==prev.reviewed_comparator_article||
   r.reviewed_analyte!==prev.reviewed_analyte||
   r.primary_blocker!==prev.primary_blocker||
   r.product_legal_obstacle!==prev.legal_scope_obstacle||
   r.prior_ctr_pdf_page_zero_based!==prev.ctr_pdf_page_zero_based||
   !pmsvB38Families.includes(r.analyte_family)||
   r.documentary_requests?.length!==5||r.required_fields?.length!==10||
   r.method_reference!=="https://fssai.gov.in/food-testing/manuals-methods-analysis"||
   r.analysis_result_recorded!==false||
   r.marketed_product_documented!==false||
   r.exact_ctr_article_signed!==false||
   r.method_validated_for_matrix!==false||
   r.report_received!==false||
   r.regulatory_compliance_pass!==false)return false;
  seen.add(r.catalog_id);counts[r.analyte_family]++;
 }
 const groups=new Map(d.analysis_method_groups.map(x=>[x.family,x]));
 if(groups.size!==5)return false;
 for(const f of pmsvB38Families){
  const g=groups.get(f);
  if(!g||!g.analytes?.length||!g.critical_analytical_request||
   !g.laboratory_route||!g.official_methods_portal||
   counts[f]!==(f==="TRACE_METALS"?27:f==="MYCOTOXINS"?3:f==="PESTICIDE_RESIDUES"?3:1))return false;
  for(const p of d.evidence_packets.filter(x=>x.analyte_family===f)){
   if(!g.analytes.includes(p.reviewed_analyte)||
    p.documentary_requests[3]!==g.critical_analytical_request)return false;
  }
 }
 return seen.size===35&&d.evidence_packets.every(x=>x.documentary_requests.every(y=>typeof y==="string"&&y.length>15));
}
function pmsvB38Filtered(){
 if(!pmsvB38Valid())return [];
 const q=pmsvB38Search.toLowerCase().trim();
 return pmsvB38Data.evidence_packets.filter(x=>
 (pmsvB38Family==="ALL"||x.analyte_family===pmsvB38Family)&&
 (!q||[x.product_name,x.catalog_id,x.reviewed_analyte,x.analyte_family,
 x.prior_ctr_comparator,x.primary_blocker,...x.documentary_requests].some(z=>String(z).toLowerCase().includes(q))));
}
function pmsvB38Row(x){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(x.product_name)+'</b><div><small>'+e(x.catalog_id)+'</small></div></td>'+
 '<td>'+e(x.reviewed_analyte)+'</td><td>'+e(x.analyte_family.replaceAll("_"," "))+'</td>'+
 '<td>'+e(x.primary_blocker.replaceAll("_"," "))+'</td>'+
 '<td>'+e(x.documentary_requests[0])+'</td>'+
 '<td><button type="button" data-pmsv-b38-open="'+e(x.catalog_id)+'">Inspect full packet</button></td></tr>';
}
function pmsvB38Panel(){
 if(!pmsvB38Valid())return "";
 const d=pmsvB38Data,e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b38-evidence-packets" style="margin-bottom:12px">'+
 '<summary><b>Batch38 · 35 laboratory evidence packets and source-date controls</b> — 27 metals / 3 mycotoxins / 3 pesticides / 1 veterinary / 1 unspecified</summary>'+
 '<div class="notice"><b>Important regulatory timing:</b> CTR amendment effective 1 Dec 2026 and FSSAI Laboratory and Sample Analysis amendment reportedly effective 1 Apr 2027 — NOT applicable as new obligations today. The latter reporting timelines target statutory regulatory and import analyses, not blanket deadlines for internal QA. Source PDFs require primary verification before legal signoff.</div>'+
 '<p><a href="'+e(d.analysis_method_groups[0].official_methods_portal)+'" target="_blank" rel="noopener noreferrer">Current official FSSAI analysis manuals</a> · '+
 '<a href="'+e(d.analysis_method_groups[0].source_hint)+'" target="_blank" rel="noopener noreferrer">Metals and minerals official method manual</a> · '+
 '<a href="'+e(d.legislation_commencements[1].official_index)+'" target="_blank" rel="noopener noreferrer">FSSAI 2026 laboratory amendment listing</a></p>'+
 '<details><summary><b>Five analytical method families and evidence requirements</b></summary>'+
 '<ol>'+d.analysis_method_groups.map(g=>
 '<li><b>'+e(g.family.replaceAll("_"," "))+'</b>: '+e(g.laboratory_route)+
 ' <i>'+e(g.critical_analytical_request)+'</i></li>').join("")+'</ol>'+
 '<p><b>Method-selection warning:</b> verify LOD/LOQ against the legally applicable limit before choosing a method; FSSAI publication does not prove a method is sufficiently sensitive for every analyte/matrix.</p></details>'+
 '<details><summary><b>Two distinct future-effective regulatory notifications</b></summary>'+
 '<ul>'+d.legislation_commencements.map(z=>'<li><b>'+e(z.notification)+'</b> · '+e(z.commencement)+
 ' — '+e(z.disposition)+'</li>').join("")+'</ul></details>'+
 '<p><label>Search by commodity, analyte or evidence <input type="search" data-pmsv-b38-search placeholder="coffee, coconut, lead, LC-MS" /></label></p>'+
 '<p><label>Analytical family <select data-pmsv-b38-family><option value="ALL">All 35</option>'+
 '<option value="TRACE_METALS">Metals (27)</option>'+
 '<option value="MYCOTOXINS">Mycotoxins (3)</option>'+
 '<option value="PESTICIDE_RESIDUES">Pesticides (3)</option>'+
 '<option value="VETERINARY_DRUG_RESIDUES">Veterinary drug (1)</option>'+
 '<option value="UNSPECIFIED_RESIDUE">Unspecified residue (1)</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b38-count>'+pmsvB38Filtered().length+' of 35 packets, zero lab PASS</p>'+
 '<div class="tablewrap" style="max-height:630px;overflow:auto"><table><thead><tr>'+
 '<th>Catalogue product</th><th>Target</th><th>Family</th><th>Blocker</th><th>Priority evidence</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b38-list>'+pmsvB38Filtered().map(pmsvB38Row).join("")+'</tbody></table></div></details>';
}
function pmsvB38Refresh(){
 if(typeof document==="undefined"||!pmsvB38Valid())return;
 const host=document.getElementById("pmsv-b37-future-ctr-review")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const panel=document.getElementById("pmsv-b38-evidence-packets");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB38Panel());return}
 const body=panel.querySelector("[data-pmsv-b38-list]");
 const n=panel.querySelector("[data-pmsv-b38-count]");
 if(body)body.innerHTML=pmsvB38Filtered().map(pmsvB38Row).join("");
 if(n)n.textContent=pmsvB38Filtered().length+" of 35 pending evidence packets; zero authorised lot PASS.";
}
function pmsvB38PerProduct(p){
 if(!p||!pmsvB38Valid())return "";
 const r=pmsvB38Data.evidence_packets.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name)return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch38 · actual laboratory evidence packet ('+e(r.reviewed_analyte)+')</b></summary>'+
 '<p><b>Comparator under review, not confirmed applicable:</b> '+e(r.prior_ctr_comparator)+'</p>'+
 '<p><b>Unresolved legal obstacle:</b> '+e(r.product_legal_obstacle)+'</p>'+
 '<p><b>Required real documents:</b></p><ol>'+
 r.documentary_requests.map(y=>'<li>'+e(y)+'</li>').join("")+'</ol>'+
 '<p><b>Mandatory fields:</b> '+r.required_fields.map(e).join(", ")+'</p>'+
 '<p><a href="'+e(r.method_reference)+'" target="_blank" rel="noopener noreferrer">FSSAI official analytical manuals</a></p>'+
 '<div class="notice">No actual lot results, signed legal article, validated method for this matrix, or CTR numeric regulatory PASS has been verified. April 2027 laboratory reporting timelines are not currently in force.</div></details>';
}
const pmsvB38OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB38OldLoad();pmsvB38Data=null;
 try{
  const r=await fetch(pmsvB38Path+"?v=20261016-b38",{cache:"reload"});
  if(!r.ok)throw Error("Batch38 evidence dataset unavailable");
  pmsvB38Data=await r.json();
  if(!pmsvB38Valid())throw Error("Batch38 upstream identity, evidence or digest mismatch");
  pmsvB38Refresh();
 }catch(_){pmsvB38Data=null;}
};
const pmsvB38OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB38PerProduct(p)+pmsvB38OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b38-search]")){
   pmsvB38Search=String(ev.target.value||"").slice(0,140);pmsvB38Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b38-family]")&&
   ["ALL",...pmsvB38Families].includes(ev.target.value)){
   pmsvB38Family=ev.target.value;pmsvB38Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b38-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b38-open"));
 });
}
