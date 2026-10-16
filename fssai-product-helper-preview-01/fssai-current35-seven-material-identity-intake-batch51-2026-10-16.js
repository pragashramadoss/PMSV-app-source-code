"use strict";
/* Batch51: Private-by-default in-memory evidence draft. No uploads, persistence, legal approvals or lot PASS. */
var pmsvB51Data=null,pmsvB51Selected="",pmsvB51Filter="ALL",pmsvB51Search="",pmsvB51Entries=Object.create(null);
const pmsvB51Path="./data/rules/fssai-current35-seven-material-identity-intake-batch51-2026-10-16.json";
const pmsvB51Expected="fb3b9cf0ff91abc7";
function pmsvB51Valid(){
 if(typeof pmsvB50Valid!=="function"||!pmsvB50Valid()||typeof pmsvB14Digest!=="function"||!pmsvB51Data||
 pmsvB14Digest(pmsvB51Data)!==pmsvB51Expected)return false;
 const d=pmsvB51Data,n=d.counts,s=d.confidentiality;
 if(d.kind!=="PMSV_BATCH51_7_UNRESOLVED_MATERIAL_IDENTITY_EVIDENCE_INTAKE_AND_35_GATE_LINEAGE"||
 d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 n.catalogue!==533||n.conditionally_matched!==498||n.ctr_article_pending!==35||
 n.named_product_identity_or_recipe_references!==28||
 n.individual_material_identity_pending!==7||n.material_intake_profiles!==7||
 n.mandatory_data_fields!==28||n.current_entered_fields_in_static_repository!==0||
 n.current_signed_ctr_limit_approvals!==0||n.current_validated_method_approvals!==0||
 n.actual_lot_passes!==0||n.unverified_prior_175_requests_unchanged!==175||
 n.unverified_prior_280_lab_guidance_points_unchanged!==280||
 n.unverified_prior_210_2027_law_questions_unchanged!==210||n.wordpress_changed!==false||
 s?.storage!=="BROWSER_MEMORY_ONLY_NO_LOCALSTORAGE_NO_UPLOAD_OR_NETWORK_FROM_BATCH51_WIDGET"||
 s.export!=="USER_INITIATED_ONLY_EXPORT_MAY_INCLUDE_SENSITIVE_INPUT"||
 s.execution!=="ENTRY_COMPLETENESS_IS_NOT_EVIDENCE_VALIDATION"||
 s.approval!=="NO_AUTOMATIC_REGULATORY_OR_LAB_PASS"||
 d.official_sources?.length!==7||d.seven_material_cases?.length!==7||
 d.full_35_ctr_worklist?.length!==35||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 const byId=new Map(pmsvB50Data.new_remnant_case_reviews.map(x=>[x.catalogue_id,x]));
 const c35=new Map(pmsvB50Data.current_35_case_crosswalk.map(x=>[x.catalogue_id,x]));
 const seen=new Set(),ids=new Set(),fieldCodes=new Set();let missing=0,fields=0;
 for(const x of d.seven_material_cases){
  const p=byId.get(x.catalogue_id),c=c35.get(x.catalogue_id);
  if(!p||!c||seen.has(x.catalogue_id)||p.authoritative_product_identity_known!==false||
  x.rank!==p.rank||x.product_name!==p.product_name||x.analyte!==p.analyte||
  x.earlier_batch50_legal_gate!==p.previous_legal_gate||
  x.primary_source_confirmed_for_exact_sold_substance!==false||
  x.current_signed_ctr_limit!==false||x.validated_lab_method!==false||
  x.actual_sample_pass!==false||x.approved_or_released!==false||
  x.source_ids?.length<2||x.source_ids.some(id=>!d.official_sources.some(s=>s.source_id===id))||
  x.fields?.length!==4||x.fields.some(f=>!f.mandatory_for_draft||!f.label||!f.instruction||!f.code))return false;
  for(const f of x.fields){if(fieldCodes.has(x.catalogue_id+"/"+f.code))return false;fieldCodes.add(x.catalogue_id+"/"+f.code);fields++;}
  seen.add(x.catalogue_id);ids.add(x.rank);missing++;
 }
 if(missing!==7||fields!==28||JSON.stringify([...ids].sort((a,b)=>a-b))!==JSON.stringify([21,24,25,26,27,28,29]))return false;
 for(const c of d.full_35_ctr_worklist){
  const x=c35.get(c.catalogue_id);
  if(!x||c.rank!==x.rank||c.product_name!==x.product_name||
  c.source_identity_known!==x.known_published_named_identity||
  c.exact_ctr_legal_article_pending!==true||c.legal_gate!==x.prior_legal_gate||
  c.included_in_seven_intake!==seen.has(c.catalogue_id)||c.lot_pass!==false)return false;
 }
 return true;
}
function pmsvB51Current(){
 return pmsvB51Data?.seven_material_cases.find(x=>x.catalogue_id===pmsvB51Selected)||null;
}
function pmsvB51Entry(x){return pmsvB51Entries[x.catalogue_id]||Object.create(null);}
function pmsvB51Count(x){return x.fields.filter(f=>String(pmsvB51Entry(x)[f.code]||"").trim().length>0).length;}
function pmsvB51Rows(){
 if(!pmsvB51Valid())return [];
 const q=pmsvB51Search.trim().toLowerCase();
 return pmsvB51Data.seven_material_cases.filter(x=>
 (pmsvB51Filter==="ALL"||(pmsvB51Filter==="STARTED"&&pmsvB51Count(x)>0)||
 (pmsvB51Filter==="UNSTARTED"&&pmsvB51Count(x)===0)||
 (pmsvB51Filter==="FIELDS_FILLED"&&pmsvB51Count(x)===4))&&
 (!q||[x.catalogue_id,x.product_name,x.analyte,x.evidence_pathway].some(z=>String(z).toLowerCase().includes(q))));
}
function pmsvB51RowsHTML(){
 if(!pmsvB51Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB51Rows().map(x=>'<tr><td><b>'+e(x.product_name)+'</b><small> '+e(x.catalogue_id)+'</small></td>'+
 '<td>'+e(x.analyte)+'</td><td>'+e(pmsvB51Count(x))+'/4 entered <small>(unverified)</small></td>'+
 '<td><button type="button" data-pmsv-b51-case="'+e(x.catalogue_id)+'">Edit draft</button></td></tr>').join("");
}
function pmsvB51Panel(){
 if(!pmsvB51Valid())return "";
 return '<details id="pmsv-b51-evidence-intake" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch51 · Seven-material identity intake</b> — editable evidence draft / 35 CTR holds</summary>'+
 '<div class="notice"><b>No evidence submitted, validated or approved.</b> 28 case-specific draft fields (4 each). Text entered here stays in browser memory for this session; no server upload or automatic storage by Batch51. Manually exporting could disclose confidential formulations: review before sharing. Blank fields and full fields alike remain UNVERIFIED. The 35 legal CTR cases remain open.</div>'+
 '<p><button type="button" data-pmsv-b51-export="BLANK">Download blank seven-case request CSV</button> '+
 '<button type="button" data-pmsv-b51-export="JSON">Export session entries JSON (may be sensitive)</button> '+
 '<button type="button" data-pmsv-b51-clear>Clear session inputs</button></p>'+
 '<p><label>Search <input type="search" data-pmsv-b51-search placeholder="Sajji, enzyme, polyol" /></label> '+
 '<label>Draft status <select data-pmsv-b51-filter><option value="ALL">All seven</option>'+
 '<option value="STARTED">Entry started</option><option value="UNSTARTED">No entries</option>'+
 '<option value="FIELDS_FILLED">Four fields entered (not verified)</option></select></label></p>'+
 '<p data-pmsv-b51-count>Seven pending; no current legal authority cleared</p>'+
 '<div class="tablewrap" style="max-height:420px;overflow:auto"><table><thead><tr>'+
 '<th>Material identity case</th><th>Analyte</th><th>Draft field completion</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b51-rows>'+pmsvB51RowsHTML()+'</tbody></table></div>'+
 '<div data-pmsv-b51-detail></div></details>';
}
function pmsvB51Details(){
 const x=pmsvB51Current(),e=pmsvB14Esc;if(!x)return "";
 const values=pmsvB51Entry(x),source=pmsvB51Data.official_sources;
 return '<div class="notice"><b>'+e(x.product_name)+'</b>: '+pmsvB51Count(x)+'/4 draft fields entered; source and CoA still UNVERIFIED. Any completed text is a user assertion, not regulatory clearance.</div>'+
 '<p><b>Remaining legal question:</b> '+e(x.blocker)+'</p>'+
 '<div data-pmsv-b51-editor>'+
 x.fields.map(f=>'<p><label><b>'+e(f.label)+'</b><small> — '+e(f.instruction)+'</small>'+
 '<textarea rows="2" data-pmsv-b51-field="'+e(f.code)+'" placeholder="Enter your supporting reference or description (unsent)">'+e(values[f.code]||"")+'</textarea></label></p>').join("")+
 '</div><p><b>Official reference routes (not approvals):</b> '+
 x.source_ids.map(id=>{const s=source.find(k=>k.source_id===id);return '<a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer">'+e(id.replaceAll("_"," "))+'</a>';}).join(" · ")+'</p>'+
 '<p><button type="button" data-pmsv-b51-copy>Copy selected UNSENT handoff draft</button> '+
 '<button type="button" data-pmsv-b51-clear-selected>Clear this case</button></p>'+
 '<div data-pmsv-b51-copy-state></div>';
}
function pmsvB51Refresh(refreshDetails){
 if(typeof document==="undefined"||!pmsvB51Valid())return;
 const host=document.getElementById("pmsv-b50-source-dispositions")||document.getElementById("pmsv-b49-identity-additions");
 if(!host)return;
 let panel=document.getElementById("pmsv-b51-evidence-intake");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB51Panel());return;}
 const tbody=panel.querySelector("[data-pmsv-b51-rows]"),count=panel.querySelector("[data-pmsv-b51-count]"),detail=panel.querySelector("[data-pmsv-b51-detail]");
 if(tbody)tbody.innerHTML=pmsvB51RowsHTML();
 if(count)count.textContent=pmsvB51Rows().length+" cases displayed · 35 CTR legal holds; zero PASS";
 if(refreshDetails&&detail)detail.innerHTML=pmsvB51Details();
 if(!refreshDetails&&detail){
  const tag=detail.querySelector(".notice");
  const x=pmsvB51Current();
  if(tag&&x)tag.textContent=x.product_name+": "+pmsvB51Count(x)+"/4 draft fields entered (not verified; CTR open).";
 }
}
function pmsvB51Request(x,includeValues){
 if(!pmsvB51Valid()||!pmsvB51Data.seven_material_cases.includes(x))return "";
 const values=includeValues?pmsvB51Entry(x):Object.create(null);
 return ["UNSENT / UNAPPROVED / NO LAB PASS","PMSV Batch51 draft: "+x.product_name,
 "Catalogue ID: "+x.catalogue_id,"Analyte: "+x.analyte,
 "Required identity and evidence: "+x.blocker,
 ...x.fields.map(f=>f.label+": "+(String(values[f.code]||"").trim()||"[REQUIRED — NOT RECEIVED]")),
 "FSSAI references (not legal CTR approvals): "+x.source_ids.map(id=>pmsvB51Data.official_sources.find(y=>y.source_id===id).url).join(" ; "),
 "Existing legal gate: "+x.earlier_batch50_legal_gate,
 "Obtain current notified article/limit, product-specific lawful ingredient approval if applicable, signed lab/method scope and representative lot CoA.",
 "Entered data is unverified. No automatic analysis, database submission or product approval."].join("\n");
}
function pmsvB51CSV(){
 if(!pmsvB51Valid())return "";
 const esc=v=>{let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const header=["catalogue_id","product_name","analyte","review_gate","mandatory_fields","received_values","current_signed_ctr_limit","actual_lot_pass"];
 const body=pmsvB51Data.seven_material_cases.map(c=>[c.catalogue_id,c.product_name,c.analyte,c.earlier_batch50_legal_gate,
 c.fields.map(f=>f.label).join(" | "),0,false,false]);
 return [header.map(esc).join(","),...body.map(row=>row.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB51SessionJSON(){
 if(!pmsvB51Valid())return "";
 return JSON.stringify({kind:"UNVERIFIED_SESSION_EVIDENCE_DRAFT_NOT_A_COMPLIANCE_RECORD",
  as_of:"2026-10-16",preview_only:true,send_to_fssai:false,
  official_approvals_granted:0,
  cases:pmsvB51Data.seven_material_cases.map(x=>({
   catalogue_id:x.catalogue_id,product_name:x.product_name,
   entered_unverified_fields:Object.fromEntries(x.fields.map(f=>[f.code,String(pmsvB51Entry(x)[f.code]||"").slice(0,1500)])),
   fields_entered_count:pmsvB51Count(x),legal_ctr_article_approved:false,lot_pass:false}))},null,2);
}
function pmsvB51Download(mode){
 if(!pmsvB51Valid())return;
 const contents=mode==="BLANK"?pmsvB51CSV():pmsvB51SessionJSON();
 const type=mode==="BLANK"?"text/csv;charset=utf-8":"application/json;charset=utf-8";
 const filename=mode==="BLANK"?"PMSV-B51-7-material-request-BLANK.csv":"PMSV-B51-UNVERIFIED-SESSION-VALUES-REVIEW-BEFORE-SHARING.json";
 const url=URL.createObjectURL(new Blob([mode==="BLANK"?"\uFEFF":"",contents],{type}));
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1100);
}
const pmsvB51EarlierLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB51EarlierLoad();pmsvB51Data=null;
 try{const r=await fetch(pmsvB51Path+"?v=20261016-b51",{cache:"reload"});
 if(!r.ok)throw Error("B51 missing");pmsvB51Data=await r.json();
 if(!pmsvB51Valid())throw Error("B51 digest/lineage failure");pmsvB51Refresh(true);
 }catch(_){pmsvB51Data=null;}
};
const pmsvB51EarlierProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const old=pmsvB51EarlierProduct(p);
 if(!p||!pmsvB51Valid())return old;
 const x=pmsvB51Data.seven_material_cases.find(c=>c.catalogue_id===p.id);
 if(!x||x.product_name!==p.name)return old;
 return '<div class="notice"><b>Batch51 material-specific evidence required:</b> '+
 pmsvB14Esc(x.blocker)+'. No regulatory limit or lot release has been approved.</div>'+old;
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b51-search]")){
   pmsvB51Search=String(ev.target.value||"").slice(0,140);pmsvB51Refresh(false);return;
  }
  if(ev.target?.matches?.("[data-pmsv-b51-field]")){
   const c=pmsvB51Current(),field=ev.target.getAttribute("data-pmsv-b51-field");
   if(!c||!c.fields.some(f=>f.code===field))return;
   if(!pmsvB51Entries[c.catalogue_id])pmsvB51Entries[c.catalogue_id]=Object.create(null);
   pmsvB51Entries[c.catalogue_id][field]=String(ev.target.value||"").slice(0,1500);
   pmsvB51Refresh(false);
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b51-filter]")&&["ALL","STARTED","UNSTARTED","FIELDS_FILLED"].includes(ev.target.value)){
   pmsvB51Filter=ev.target.value;pmsvB51Refresh(false);
  }
 });
 document.addEventListener("click",async ev=>{
  const c=ev.target?.closest?.("[data-pmsv-b51-case]");
  if(c){pmsvB51Selected=c.getAttribute("data-pmsv-b51-case");pmsvB51Refresh(true);return;}
  const exp=ev.target?.closest?.("[data-pmsv-b51-export]");
  if(exp){pmsvB51Download(exp.getAttribute("data-pmsv-b51-export"));return;}
  if(ev.target?.closest?.("[data-pmsv-b51-clear]")){
   pmsvB51Entries=Object.create(null);pmsvB51Selected="";pmsvB51Filter="ALL";pmsvB51Search="";
   const panel=document.querySelector("#pmsv-b51-evidence-intake");
   if(panel){const search=panel.querySelector("[data-pmsv-b51-search]"),sel=panel.querySelector("[data-pmsv-b51-filter]");
    if(search)search.value="";if(sel)sel.value="ALL";}
   pmsvB51Refresh(true);return;
  }
  if(ev.target?.closest?.("[data-pmsv-b51-clear-selected]")){
   if(pmsvB51Selected)delete pmsvB51Entries[pmsvB51Selected];pmsvB51Refresh(true);return;
  }
  if(!ev.target?.closest?.("[data-pmsv-b51-copy]"))return;
  const x=pmsvB51Current(),label=document.querySelector("#pmsv-b51-evidence-intake [data-pmsv-b51-copy-state]");
  if(!x||!label||!pmsvB51Valid())return;
  try{if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");
   await navigator.clipboard.writeText(pmsvB51Request(x,true));label.textContent="Unsent, unverified draft copied. Review before sharing.";
  }catch(_){label.textContent="Clipboard unavailable; review UNSENT text below:";
   const pre=document.createElement("pre");pre.style.whiteSpace="pre-wrap";pre.textContent=pmsvB51Request(x,true);label.appendChild(pre);}
 });
}
