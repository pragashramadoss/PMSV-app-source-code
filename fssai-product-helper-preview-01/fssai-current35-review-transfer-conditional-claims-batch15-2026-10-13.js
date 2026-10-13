"use strict";
/* Batch15: exact 35-case cross-device DRAFT evidence import/export and
 * 12 claimed-document checkboxes for 3 conditional CTR routes.
 * Every checkbox, packet, URL and lab reference is UNVERIFIED: no limits/PASS.
 */
var pmsvB15Data=null;
const pmsvB15Path="./data/rules/fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.json";
const pmsvB15Expected="159aae22b8a5dad9";
const pmsvB15ClaimsKey="pmsv:ctr:current35:candidate-document-claims:v1";
const pmsvB15ValidRecordKeys=new Set([
 "kind","schema_version","product","original_status","priority","primary_blocker",
 "source_identity_evidence","existing_conditional_source_route","evidence_receipts",
 "proof_questions","reviewer_record","official_reference","review_preparation_status",
 "source_article_legally_confirmed","numeric_limit_activated","valid_laboratory_result_proven",
 "finished_product_compliance_approved","warning"
]);
function pmsvB15Digest(v){
 const s=JSON.stringify(v);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB15Valid(){
 if(typeof pmsvB14Valid!=="function"||!pmsvB14Valid()||!pmsvB15Data||
 !pmsvB14Data||!pmsvB9Data||!pmsv498Ledger)return false;
 const d=pmsvB15Data, a=pmsvB14Data, routes=pmsvB9Data.conditional_subroutes;
 if(pmsvB15Digest(d)!==pmsvB15Expected||
 d.kind!=="PMSV_CURRENT35_DRAFT_TRANSFER_AND_CONDITIONAL_EVIDENCE_BATCH15"||
 d.schema_version!=="1.0"||d.policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY_NO_AUTO_PASS"||
 d.CTR_source!==a.CTR_source||
 d.baseline?.catalogue!==533||d.baseline?.conditional_first_sources!==498||
 d.baseline?.first_exact_pending!==35||d.baseline?.legal_approvals!==0||
 d.source_manifest?.original_document_receipts!==140||
 d.source_manifest?.specific_evidence_questions!==153||
 d.candidate_count!==3||d.eligibility_claim_count!==12||d.other_pending_count!==32||
 d.all_cases?.length!==35||d.candidate_routes?.length!==3||
 d.future_regulations_commence_on!=="2026-12-01"||
 d.future_regulations_automatically_enabled!==false||
 d.transfers?.maximum_bytes!==2000000||
 d.transfers?.import_cannot_activate_legal_limits!==true||
 d.transfers?.import_cannot_assert_legal_PASS!==true||
 d.results?.source_promotions!==0||d.results?.auto_assigned_limits!==0||
 d.results?.lab_result_passes!==0||d.results?.legal_compliance_approvals!==0||
 d.results?.wordpress_changed!==false||d.results?.canonical_ledger_changed!==false||
 pmsv498Ledger.first_source_pending!==35)return false;
 let count=0,seen=new Set();
 const cand=new Map(routes.map(x=>[x.catalog_id,x]));
 for(let i=0;i<35;i++){
  const x=d.all_cases[i],q=a.cases[i],route=cand.get(x?.catalog_id);
  if(!x||!q||seen.has(x.catalog_id)||x.catalog_id!==q.catalog_id||
    x.product_name!==q.product_name||x.priority!==q.priority||
    x.docs_to_receive!==4||x.specific_questions!==q.questions.length||
    x.qualifying_candidate_route_id!==(route?.id||null)||
    x.first_exact_source_pending!==true||
    x.eligible_for_auto_promotion!==false||x.compliance_pass!==false)return false;
  seen.add(x.catalog_id);
 }
 for(let i=0;i<3;i++){
  const r=d.candidate_routes[i],b=routes[i];
  if(!r||!b||r.catalog_id!==b.catalog_id||r.route_id!==b.id||
   r.CTR_named_article!==b.named_article||r.contaminant!==b.contaminant||
   r.official_source!==d.CTR_source||r.conditions?.length!==4||
   r.lot_pass!==false||r.legal_article_signed_off!==false||
   r.prior_source_current!==false)return false;
  for(let j=0;j<4;j++){
   const k=r.conditions[j];
   if(k?.ordinal!==j+1||k.documentary_question!==b.qualifying_conditions[j]||
    k.claim_received!==false||k.legally_verified!==false)return false;
   count++;
  }
 }
 return seen.size===35&&count===12;
}
function pmsvB15BlankClaims(){
 if(!pmsvB15Data)return {};
 return Object.fromEntries(pmsvB15Data.candidate_routes.map(r=>[r.catalog_id,[false,false,false,false]]));
}
function pmsvB15ClaimsRead(){
 const out=pmsvB15BlankClaims();
 try{
  const src=JSON.parse(window.localStorage.getItem(pmsvB15ClaimsKey)||"{}");
  if(!src||typeof src!=="object"||Array.isArray(src))return out;
  for(const id of Object.keys(out)){
   if(Array.isArray(src[id])&&src[id].length===4)
    out[id]=src[id].map(v=>v===true);
  }
 }catch(_){}
 return out;
}
function pmsvB15ClaimsSave(v){
 try{window.localStorage.setItem(pmsvB15ClaimsKey,JSON.stringify(v));return true}
 catch(_){return false}
}
function pmsvB15Stats(){
 if(!pmsvB15Valid())return null;
 const states=pmsvB14Data.cases.map(x=>pmsvB14Packet(x.catalog_id));
 const status={not_started:0,partial_draft:0,documentary_ready_unverified:0,
             candidate_claims_recorded:0,conditional_routes:3,source_approved:0};
 for(const x of states){
  if(x?.review_preparation_status==="NOT_STARTED")status.not_started++;
  else if(x?.review_preparation_status==="DOCUMENTARY_PACKET_READY_FOR_INDEPENDENT_REVIEW_UNVERIFIED")
   status.documentary_ready_unverified++;
  else status.partial_draft++;
 }
 const claims=pmsvB15ClaimsRead();
 for(const arr of Object.values(claims))status.candidate_claims_recorded+=arr.filter(Boolean).length;
 return status;
}
function pmsvB15PacketForTransfer(){
 if(!pmsvB15Valid())return null;
 return {
  kind:"PMSV_35_REVIEW_TRANSFER_B15_UNVERIFIED",
  schema_version:"1.0",
  manifest_digest:pmsvB15Expected,
  CTR_source:pmsvB15Data.CTR_source,
  first_exact_source_pending:35,
  legal_approvals:0,
  review_queue:pmsvB14ExportAll(),
  candidate_claims:pmsvB15Data.candidate_routes.map(r=>({
    catalog_id:r.catalog_id,route_id:r.route_id,
    condition_claims:pmsvB15ClaimsRead()[r.catalog_id],
    all_claims_unverified:true,
    legal_article_approved:false,
    batch_lot_pass:false
  })),
  warning:"Transfer contains only reviewer assertions/receipt marks. No CTR source limit, legal decision or lot PASS is approved."
 };
}
function pmsvB15Require(cond,message){if(!cond)throw new Error(message)}
function pmsvB15Plain(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function pmsvB15SanitiseRecord(r,allowed){
 pmsvB15Require(pmsvB15Plain(r)&&r.kind==="PMSV_FIRST_SOURCE_UNVERIFIED_REVIEW_PACKET",
 "Not a PMSV unverified review packet");
 pmsvB15Require(Object.keys(r).every(x=>pmsvB15ValidRecordKeys.has(x)),
 "Unknown approval or field in packet");
 const p=r.product,id=p?.catalog_id,c=allowed.get(id);
 pmsvB15Require(c&&p.name===c.product_name&&p.fssr===c.fssr&&p.fcs===c.fcs,
 "Unknown product or changed product identity");
 pmsvB15Require(r.original_status==="FIRST_EXACT_SOURCE_PENDING"&&
 r.source_article_legally_confirmed===false&&r.numeric_limit_activated===false&&
 r.valid_laboratory_result_proven===false&&r.finished_product_compliance_approved===false,
 "A transfer cannot contain approved source or laboratory flags");
 pmsvB15Require(Array.isArray(r.evidence_receipts)&&r.evidence_receipts.length===4,
 "Document receipt slots mismatch");
 const received=[];
 for(let i=0;i<4;i++){
  const x=r.evidence_receipts[i];
  pmsvB15Require(pmsvB15Plain(x)&&x.label===c.document_slots[i]&&
   typeof x.received_for_review==="boolean"&&x.source_verified===false,
   "Invalid receipt or claimed verification");
  received.push(x.received_for_review);
 }
 const d=r.reviewer_record;
 pmsvB15Require(pmsvB15Plain(d)&&Object.keys(d).every(x=>Object.hasOwn(pmsvB14Fields,x)),
 "Unknown reviewer field");
 const clean={};
 for(const [k,max] of Object.entries(pmsvB14Fields)){
  pmsvB15Require(d[k]===undefined||typeof d[k]==="string", "Non-text reviewer value");
  pmsvB15Require(String(d[k]??"").length<=max, "Reviewer text too long");
  clean[k]=String(d[k]??"");
 }
 pmsvB15Require(!clean.source_url||pmsvB14OfficialUrl(clean.source_url),
 "Draft source must use official FSSAI/FoSCoS URL");
 return {id,fields:clean,received};
}
function pmsvB15ParseTransfer(text){
 pmsvB15Require(pmsvB15Valid(),"Review chain unavailable");
 pmsvB15Require(typeof text==="string"&&text.length>1&&
   text.length<=pmsvB15Data.transfers.maximum_bytes,"JSON file is empty or too large");
 let raw;
 try{raw=JSON.parse(text)}catch(_){throw new Error("Invalid JSON file")}
 pmsvB15Require(pmsvB15Plain(raw),"Invalid JSON root");
 let payload=raw,claims=null;
 if(raw.kind==="PMSV_35_REVIEW_TRANSFER_B15_UNVERIFIED"){
  pmsvB15Require(raw.schema_version==="1.0"&&raw.manifest_digest===pmsvB15Expected&&
   raw.CTR_source===pmsvB15Data.CTR_source&&raw.first_exact_source_pending===35&&
   raw.legal_approvals===0,"Incompatible transfer baseline or claimed approval");
  payload=raw.review_queue;claims=raw.candidate_claims;
 }
 let records;
 if(payload?.kind==="PMSV_FIRST_SOURCE_UNVERIFIED_REVIEW_PACKET"){
  records=[payload];
 }else if(payload?.kind==="PMSV_35_INDEPENDENT_FIRST_SOURCE_REVIEW_QUEUE_UNVERIFIED"){
  pmsvB15Require(payload.catalogue===533&&payload.first_source_partial===498&&
   payload.first_exact_pending===35&&payload.legal_approvals===0&&
   payload.CTR_source===pmsvB15Data.CTR_source&&payload.records?.length===35,
   "35-case review queue is not the current source baseline");
  records=payload.records;
 }else throw new Error("Unsupported PMSV review file type");
 pmsvB15Require(records.length>=1&&records.length<=35,"Unexpected record count");
 const allowed=new Map(pmsvB14Data.cases.map(x=>[x.catalog_id,x]));
 const updates=new Map();
 for(const r of records){
  const x=pmsvB15SanitiseRecord(r,allowed);
  pmsvB15Require(!updates.has(x.id),"Duplicate case in import");
  updates.set(x.id,x);
 }
 if(claims!==null){
  pmsvB15Require(Array.isArray(claims)&&claims.length===3,"Conditional claim count mismatch");
  const check=new Map(pmsvB15Data.candidate_routes.map(x=>[x.catalog_id,x]));
  const parsed={};
  for(const x of claims){
   const c=check.get(x?.catalog_id);
   pmsvB15Require(c&&!Object.hasOwn(parsed,x.catalog_id)&&x.route_id===c.route_id&&
    x.all_claims_unverified===true&&x.legal_article_approved===false&&
    x.batch_lot_pass===false&&Array.isArray(x.condition_claims)&&
    x.condition_claims.length===4&&x.condition_claims.every(v=>typeof v==="boolean"),
    "Unsupported or approved conditional-article claims");
   parsed[x.catalog_id]=x.condition_claims.slice();
  }
  pmsvB15Require(Object.keys(parsed).length===3,"Not all conditional review routes represented");
  claims=parsed;
 }
 return {records:[...updates.values()],claims,unverified:true};
}
function pmsvB15CommitTransfer(parsed){
 if(!pmsvB15Valid()||!parsed?.unverified)return false;
 const store=window.localStorage;
 const keys=[pmsvB14StorageKey,pmsvB5StorageKey,pmsvB15ClaimsKey];
 let backup;
 try{
  backup=keys.map(k=>store.getItem(k));
  const reviewer=pmsvB14Read(),receipts=pmsvB5Read(),
        claims=pmsvB15ClaimsRead();
  for(const x of parsed.records){
   reviewer[x.id]=x.fields;
   const old=receipts[x.id]||{reference:"",notes:""};
   receipts[x.id]={received:x.received,reference:String(old.reference||"").slice(0,300),
                    notes:String(old.notes||"").slice(0,500)};
  }
  const nextClaims=parsed.claims||claims;
  store.setItem(pmsvB14StorageKey,JSON.stringify(reviewer));
  store.setItem(pmsvB5StorageKey,JSON.stringify(receipts));
  store.setItem(pmsvB15ClaimsKey,JSON.stringify(nextClaims));
  return true;
 }catch(_){
  if(backup)keys.forEach((k,i)=>{try{
   if(backup[i]===null)store.removeItem(k);else store.setItem(k,backup[i]);
  }catch(__){}});
  return false;
 }
}
function pmsvB15CandidateHtml(id){
 if(!pmsvB15Valid())return "";
 const route=pmsvB15Data.candidate_routes.find(x=>x.catalog_id===id);
 if(!route)return "";
 const e=pmsvB14Esc,c=pmsvB15ClaimsRead()[id]||[false,false,false,false];
 return '<div data-pmsv-b15-route="'+e(id)+'"><div class="notice">'+
 '<b>Conditional legal article — NOT an approved limit.</b> Tick a box only if you have a supporting document. These are self-reported claims, not source verification, legal sign-off or lab PASS.</div>'+
 '<p><b>'+e(route.CTR_named_article)+'</b> · '+e(route.contaminant)+'</p>'+
 route.conditions.map((g,i)=>'<label style="display:block;margin:7px 0"><input type="checkbox" data-pmsv-b15-claim="'+i+'" '+(c[i]?"checked ":"")+'/> '+
  e(g.documentary_question)+'</label>').join("")+
 '<small data-pmsv-b15-counter>'+c.filter(Boolean).length+'/4 documentary conditions reported (unverified)</small>'+
 '<p><small><a href="'+e(route.official_source)+'" target="_blank" rel="noopener noreferrer">FSSAI CTR IX, PDF page '+(route.CTR_page_zero_based+1)+'</a></small></p>'+
 '</div>';
}
function pmsvB15DashboardHtml(){
 if(!pmsvB15Valid())return "";
 const e=pmsvB14Esc,stats=pmsvB15Stats();
 return '<details class="card" id="pmsv-b15-transfer-panel" style="margin-bottom:12px">'+
 '<summary><b>Batch 15 · 35-case cross-device review and conditional evidence</b></summary>'+
 '<div class="notice"><b>All 35 still pending exact sources.</b> Evidence imports, draft review preparation and checkbox claims never activate legal thresholds or product approvals.</div>'+
 '<p data-pmsv-b15-stats><b>'+stats.not_started+'</b> not started · <b>'+stats.partial_draft+'</b> partial drafts · '+
 '<b>'+stats.documentary_ready_unverified+'</b> prepared for independent review (unverified) · '+
 '<b>'+stats.candidate_claims_recorded+'/12</b> conditional-document claims recorded.</p>'+
 '<p><button type="button" data-pmsv-b15-export>Download all 35 transferable review packets (JSON)</button></p>'+
 '<p><label><b>Restore reviewer drafts from a PMSV JSON export</b>'+
 '<input type="file" accept=".json,application/json" data-pmsv-b15-import-file /></label></p>'+
 '<p><button type="button" data-pmsv-b15-import>Import file into this browser</button></p>'+
 '<small data-pmsv-b15-message>Existing unverified drafts are merged by exact product ID. Only the selected file is read. No server upload.</small>'+
 '<details><summary><b>Three conditional CTR candidates — 12 documentary checks</b></summary>'+
 pmsvB15Data.candidate_routes.map(x=>'<details><summary>'+e(pmsvB14Data.cases.find(z=>z.catalog_id===x.catalog_id)?.product_name||x.catalog_id)+
 '</summary><div data-pmsv-b15-route-slot="'+e(x.catalog_id)+'">'+pmsvB15CandidateHtml(x.catalog_id)+'</div></details>').join("")+
 '</details></details>';
}
function pmsvB15EnsureDashboard(){
 if(typeof document==="undefined"||!pmsvB15Valid())return;
 if(typeof pmsvB14EnsureDashboard==="function")pmsvB14EnsureDashboard();
 const host=document.getElementById("pmsv-b14-review-index");
 if(host&&!document.getElementById("pmsv-b15-transfer-panel"))
  host.insertAdjacentHTML("afterend",pmsvB15DashboardHtml());
}
function pmsvB15Html(product){
 if(!pmsvB15Valid()||!product)return "";
 const q=pmsvB15Data.candidate_routes.find(x=>x.catalog_id===product.id);
 if(!q)return "";
 const matching=pmsvB14Data.cases.find(x=>x.catalog_id===product.id);
 if(!matching||product.name!==matching.product_name||
  String(product.fssr||"")!==String(matching.fssr||"")||
  String(product.fcs||"")!==String(matching.fcs||""))return "";
 return '<details class="card" style="margin-top:12px"><summary><b>Batch 15 · conditional legal source proof</b> — 4 checks</summary>'+
 pmsvB15CandidateHtml(product.id)+'</details>';
}
const pmsvB15OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB15OldLoad();pmsvB15Data=null;
 try{
  const r=await fetch(pmsvB15Path+"?v=20261013-b15",{cache:"reload"});
  if(!r.ok)throw Error("Missing Batch15 unverified review transfer manifest");
  pmsvB15Data=await r.json();
  if(!pmsvB15Valid())throw Error("Batch15 canonical 35-case proof guard failed");
  pmsvB15EnsureDashboard();
 }catch(_){pmsvB15Data=null}
};
const pmsvB15PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB15Html(p)+pmsvB15PriorHtml(p)};
function pmsvB15Refresh(){
 if(typeof document==="undefined"||!pmsvB15Valid())return;
 const panel=document.getElementById("pmsv-b15-transfer-panel");
 const stats=pmsvB15Stats();
 const label=panel?.querySelector("[data-pmsv-b15-stats]");
 if(label)label.textContent=stats.not_started+" not started · "+stats.partial_draft+
 " partial drafts · "+stats.documentary_ready_unverified+" for independent review (UNVERIFIED) · "+
 stats.candidate_claims_recorded+"/12 conditional-document claims recorded.";
 document.querySelectorAll("[data-pmsv-b15-route]").forEach(el=>{
  const id=el.getAttribute("data-pmsv-b15-route"),arr=pmsvB15ClaimsRead()[id];
  if(!arr)return;
  el.querySelectorAll("[data-pmsv-b15-claim]").forEach(ch=>{
   ch.checked=arr[Number(ch.getAttribute("data-pmsv-b15-claim"))]===true;
  });
  const status=el.querySelector("[data-pmsv-b15-counter]");
  if(status)status.textContent=arr.filter(Boolean).length+"/4 documentary conditions reported (unverified)";
 });
}
function pmsvB15EventChange(ev){
 if(!pmsvB15Valid())return;
 const t=ev?.target;
 if(!t?.hasAttribute?.("data-pmsv-b15-claim"))return;
 const wrapper=t.closest("[data-pmsv-b15-route]");
 const id=wrapper?.getAttribute("data-pmsv-b15-route"),index=Number(t.getAttribute("data-pmsv-b15-claim"));
 if(!pmsvB15Data.candidate_routes.some(x=>x.catalog_id===id)||!Number.isInteger(index)||index<0||index>3)return;
 const claims=pmsvB15ClaimsRead();
 claims[id][index]=t.checked===true;
 if(pmsvB15ClaimsSave(claims))pmsvB15Refresh();
 const panel=document.getElementById("pmsv-b15-transfer-panel"),
       msg=panel?.querySelector("[data-pmsv-b15-message]");
 if(msg)msg.textContent="Documentary claims stored locally, never legally verified. No FSSAI source promotion.";
}
async function pmsvB15EventClick(ev){
 if(!pmsvB15Valid())return;
 const t=ev?.target?.closest?.("[data-pmsv-b15-export],[data-pmsv-b15-import]");
 if(!t)return;
 const panel=document.getElementById("pmsv-b15-transfer-panel");
 const message=panel?.querySelector("[data-pmsv-b15-message]");
 if(t.hasAttribute("data-pmsv-b15-export")){
  const ok=pmsvB14Download(pmsvB15PacketForTransfer(),"PMSV-35-REVIEW-TRANSFER-B15-UNVERIFIED.json");
  if(message)message.textContent=ok?"Unverified evidence packet downloaded. No legal source or lot result verified.":"Download unavailable.";
  return;
 }
 const file=panel?.querySelector("[data-pmsv-b15-import-file]")?.files?.[0];
 if(!file){if(message)message.textContent="Choose a PMSV JSON export first.";return}
 if(file.size>pmsvB15Data.transfers.maximum_bytes){
  if(message)message.textContent="Rejected: file exceeds 2 MB.";return;
 }
 if(message)message.textContent="Validating selected file locally…";
 try{
  const draft=pmsvB15ParseTransfer(await file.text());
  if(!pmsvB15CommitTransfer(draft))throw new Error("Browser storage unavailable; no drafts imported");
  if(message)message.textContent="Imported "+draft.records.length+
   " unverified draft case(s). Source legal approvals and lab PASS remain zero.";
  document.querySelectorAll("[data-pmsv-b14-case]").forEach(node=>{
   const id=node.getAttribute("data-pmsv-b14-case");
   if(pmsvB14Data.cases.some(x=>x.catalog_id===id))node.outerHTML=pmsvB14CaseHtml(id);
  });
  pmsvB15Refresh();
 }catch(err){
  if(message)message.textContent="Import rejected: "+String(err?.message||"Invalid evidence");
 }
}
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("change",pmsvB15EventChange);
 document.addEventListener("click",pmsvB15EventClick);
}
