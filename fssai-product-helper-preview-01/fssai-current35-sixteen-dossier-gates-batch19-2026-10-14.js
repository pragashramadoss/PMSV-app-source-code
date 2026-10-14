"use strict";
var pmsvB19Data=null;
const pmsvB19Path="./data/rules/fssai-current35-sixteen-dossier-gates-batch19-2026-10-14.json";
const pmsvB19Signature="899f8e049e71a28d";
const pmsvB19Source="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB19Valid(){
 if(typeof pmsvB18Valid!=="function"||!pmsvB18Valid()||!pmsvB18Data||
 !pmsvB19Data||!pmsvB14Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB19Data;
 if(pmsvB16Digest(d)!==pmsvB19Signature||d.kind!=="PMSV_CURRENT35_SIXTEEN_DOCUMENTARY_GATES_BATCH19"||
 d.as_of!=="2026-10-14"||d.scope!=="GH_PAGES_PREVIEW_ONLY"||
 d.total!==533||d.conditional_sources!==498||d.first_source_pending!==35||
 d.previously_completed_b18_detail!==8||d.b19_remaining_cases!==16||d.document_requests!==64||
 d.ctr_source!==pmsvB19Source||d.official_sources_only!==true||
 d.retired_trehalose_fixed_food_use_percentages!==true||d.trehalose_current_use!=="GMP EXCEPT INFANT FOOD"||
 d.future_amendment_effective!=="2026-12-01"||d.future_amendment_applied!==false||
 d.results?.new_exact_source_promotions!==0||d.results?.contaminant_limit_approvals!==0||
 d.results?.lot_passes!==0||d.results?.full_food_passes!==0||
 d.results?.canonical_ledger_changed!==false||d.results?.wordpress_changed!==false||
 d.cases?.length!==16||pmsv498Ledger.first_source_pending!==35)return false;
 const prior=pmsvB18Data.covered_24.filter(x=>x.evidence_focus==="EXISTING_B14_SIGNED_SOURCE_ACTION");
 const list=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 const known=new Map(pmsvB14Data.cases.map(x=>[x.catalog_id,x]));
 let count=0;
 for(let i=0;i<16;i++){
  const x=d.cases[i],o=prior[i],q=known.get(x?.catalog_id);
  if(!x||!o||!q||x.rank!==i+1||x.catalog_id!==o.catalog_id||
   x.product_name!==o.product_name||x.fssr!==o.fssr||x.fcs!==o.fcs||
   q.product_name!==x.product_name||String(q.fssr||"")!==String(x.fssr||"")||
   String(q.fcs||"")!==String(x.fcs||"")||
   !x.documented_official_identity||!x.forbidden_automatic_transfer||
   !/^https:\/\/(?:www\.|fcstraining\.)?fssai\.gov\.in\//.test(x.official_product_reference)||
   x.document_requests?.length!==4||
   list.get(x.catalog_id)?.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||x.evidence_received!==false||
   x.legal_approved!==false||x.numeric_ctr_limit_applied!==false||x.lab_pass!==false)return false;
  if(x.document_requests.some(y=>typeof y!=="string"||y.length<10))return false;
  count+=4;
 }
 return count===64;
}
function pmsvB19Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB19Valid())return '<div class="notice">Batch19 source dossier unavailable. First exact source remains pending.</div>';
 const x=pmsvB19Data.cases.find(x=>x.catalog_id===p.id);if(!x)return "";
 if(x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return '<div class="notice">Product identity mismatch: source remains pending.</div>';
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary><b>Batch19 · individual finished-source dossier</b></summary>'+
 '<div class="notice"><b>FIRST EXACT SOURCE PENDING.</b> No contaminant limit assigned, no laboratory PASS, no regulatory approval.</div>'+
 '<p><b>Official product identity:</b> '+e(x.documented_official_identity)+'</p>'+
 '<p><b>Do not transfer:</b> '+e(x.forbidden_automatic_transfer)+'</p>'+
 '<p><b>Four documentary requirements:</b></p><ol>'+x.document_requests.map(q=>'<li>'+e(q)+'</li>').join("")+'</ol>'+
 '<small><a href="'+e(x.official_product_reference)+'" target="_blank" rel="noopener noreferrer">FSSAI/FoSCoS original</a> · '+
 '<a href="'+e(pmsvB19Source)+'" target="_blank" rel="noopener noreferrer">CTR IX</a></small></details>';
}
function pmsvB19Csv(){
 if(!pmsvB19Valid())return "";
 const quote=v=>'"'+String(v??"").replaceAll('"','""').replace(/[\r\n]+/g," ")+'"';
 const head=["ID","Product","FSSR","FoSCoS","Blocker","Official identity","Prohibited transfer","Four evidence requests","Official source","Status"];
 const rows=pmsvB19Data.cases.map(x=>[x.catalog_id,x.product_name,x.fssr,x.fcs,x.blocker,x.documented_official_identity,x.forbidden_automatic_transfer,x.document_requests.join(" | "),x.official_product_reference,x.source_status]);
 return [head,...rows].map(a=>a.map(quote).join(",")).join("\r\n")+"\r\n";
}
function pmsvB19Export(){
 if(typeof document==="undefined")return;
 const csv=pmsvB19Csv();if(!csv)return;
 const b=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(b);
 const a=document.createElement("a");a.href=u;a.download="PMSV-FSSAI-Batch19-16-Evidence-Requests.csv";
 document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);
}
function pmsvB19Workbench(){
 if(!pmsvB19Valid())return "";
 const e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b19-workbench" style="margin-bottom:12px"><summary><b>Batch19 · 16 exact-source documentary dossiers</b> — 64 questions</summary>'+
 '<div class="notice">All 35 exact legal-source gaps remain pending. Document requests are not verified regulatory compliance.</div>'+
 '<button class="secondary-btn" type="button" id="pmsv-b19-export">Export the 16-case CSV</button>'+
 '<div class="tablewrap"><table><thead><tr><th>Product</th><th>Document request</th></tr></thead><tbody>'+
 pmsvB19Data.cases.map(x=>'<tr><td>'+e(x.product_name)+'</td><td>'+e(x.document_requests[1])+'</td></tr>').join("")+'</tbody></table></div></details>';
}
var pmsvB19Bound=false;
function pmsvB19Ensure(){
 if(typeof document==="undefined"||!pmsvB19Valid())return;
 const t=document.getElementById("selectedProductStandardContent");
 if(t&&!document.getElementById("pmsv-b19-workbench"))t.insertAdjacentHTML("beforebegin",pmsvB19Workbench());
 if(!pmsvB19Bound){document.addEventListener("click",e=>{if(e.target?.id==="pmsv-b19-export")pmsvB19Export();});pmsvB19Bound=true;}
}
const pmsvB19ParentLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB19ParentLoad();pmsvB19Data=null;
 try{const r=await fetch(pmsvB19Path+"?v=20261014-b19",{cache:"reload"});
  if(!r.ok)throw Error("Missing source dossier");
  pmsvB19Data=await r.json();if(!pmsvB19Valid())throw Error("Source validation failed");
  pmsvB19Ensure();
 }catch(_){pmsvB19Data=null;}
};
const pmsvB19PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB19Html(p)+pmsvB19PriorHtml(p);};
