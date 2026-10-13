"use strict";
var pmsv40WorkbenchSources=null;
const pmsv40WorkbenchDigest="8976e6fb302e9710";
const pmsv40WorkbenchStorageKey="pmsv40:review-receipts:v1";
function pmsv40WorkbenchValid(){
 if(typeof pmsv40ClosureIntakeValid!=="function"||!pmsv40ClosureIntakeValid()||
 typeof pmsvReviewSnapshotDigest!=="function"||!pmsv40WorkbenchSources||
 pmsvReviewSnapshotDigest(pmsv40WorkbenchSources)!==pmsv40WorkbenchDigest)return false;
 const d=pmsv40WorkbenchSources;
 if(d.schema_version!=="1.0"||d.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
 d.catalogue!==533||d.partial!==493||d.pending!==40||d.dossiers?.length!==5||
 d.new_source_promotions!==0||d.auto_numeric_thresholds!==0||d.lot_passes!==0||
 pmsv40ClosureIntake?.intake_records?.length!==40)return false;
 const seen=new Set();
 for(const x of d.dossiers){
  if(seen.has(x.id)||!x.standard||!x.facts||!x.open_proof||
   !Number.isInteger(x.page)||x.sources?.length!==2||
   !x.sources.every(y=>y.startsWith("https://")&&y.includes("fssai.gov.in"))||
   !pmsv40ClosureIntake.intake_records.some(y=>y.catalog_id===x.id))return false;
  seen.add(x.id);
 }
 return seen.size===5;
}
function pmsv40WorkbenchRead(){
 try{
  const d=JSON.parse(window.localStorage.getItem(pmsv40WorkbenchStorageKey)||"{}");
  if(!d||typeof d!=="object"||Array.isArray(d))return {};
  const ids=new Set(pmsv40ClosureIntake.intake_records.map(x=>x.catalog_id)),out={};
  for(const [id,value] of Object.entries(d)){
   if(!ids.has(id)||!value||typeof value!=="object")continue;
   out[id]={documents:Array.from({length:4},(_,i)=>value.documents?.[i]===true),
    reference:String(value.reference||"").slice(0,300),
    note:String(value.note||"").slice(0,500)};
  }
  return out;
 }catch(_){return {};}
}
function pmsv40WorkbenchWrite(state){
 try{window.localStorage.setItem(pmsv40WorkbenchStorageKey,JSON.stringify(state));return true;}catch(_){return false;}
}
function pmsv40WorkbenchExportCase(id){
 const x=pmsv40ClosureIntake?.intake_records?.find(y=>y.catalog_id===id);
 if(!x)return null;
 const v=pmsv40WorkbenchRead()[id]||{documents:[false,false,false,false],reference:"",note:""};
 return {catalog_id:x.catalog_id,product_name:x.product_name,
 status:"FIRST_EXACT_SOURCE_PENDING",
 receipts:x.evidence_documents.map((name,i)=>({name,document_received:v.documents[i]===true})),
 reference:v.reference,notes:v.note,receipt_count:v.documents.filter(Boolean).length,
 verified_legal_article:false,verified_laboratory_result:false,product_regulatory_approval:false};
}
function pmsv40WorkbenchExportAll(){
 if(!pmsv40WorkbenchValid())return null;
 const state=pmsv40WorkbenchRead();
 return {kind:"LOCAL_RECEIPTS_NOT_REGULATORY_APPROVAL",catalogue:533,partial:493,pending:40,
 product_approvals:0,records:Object.keys(state).map(id=>pmsv40WorkbenchExportCase(id)).filter(Boolean)};
}
var pmsv40WorkbenchOldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv40WorkbenchOldLoad();pmsv40WorkbenchSources=null;
 try{
  const r=await fetch("./data/rules/fssai-current40-five-source-decisions-workbench-2026-10-13.json?v=20261013-wb5",{cache:"reload"});
  if(!r.ok)throw Error("Missing official source distinctions");
  pmsv40WorkbenchSources=await r.json();
  if(!pmsv40WorkbenchValid())throw Error("Official identity mismatch");
 }catch(_){pmsv40WorkbenchSources=null;}
};
function pmsv40WorkbenchHtml(p){
 if(!p||!pmsv40ClosureIntake?.intake_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv40WorkbenchValid())return '<div class="notice">Review evidence unavailable. No source status changed.</div>';
 const x=pmsv40ClosureIntake.intake_records.find(y=>y.catalog_id===p.id);
 if(x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Product identity mismatch. No review update.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 const v=pmsv40WorkbenchRead()[x.catalog_id]||{documents:[false,false,false,false],reference:"",note:""};
 const d=pmsv40WorkbenchSources.dossiers.find(y=>y.id===x.catalog_id);
 let h='<details class="card" style="margin-top:12px" data-pmsv40-wb-card="'+e(x.catalog_id)+'"><summary><b>Local review workbench</b> · <span data-pmsv40-wb-count>'+v.documents.filter(Boolean).length+'/4 received, unverified</span></summary>'+
 '<div class="notice"><b>FIRST EXACT NAMED CTR SOURCE STILL PENDING.</b> Checkmarks document receipt only; they are not a legal source decision, laboratory verification or PASS. All notes remain in this browser, not WordPress.</div>';
 if(d)h+='<p><b>Official-source finding:</b> '+e(d.facts)+'</p><p><b>Still required:</b> '+e(d.open_proof)+'</p>'+
 '<small>'+d.sources.map((s,i)=>'<a target="_blank" rel="noopener noreferrer" href="'+e(s)+'">'+(i===0?'Official FSSR':'Official CTR')+'</a>').join(" · ")+'</small>';
 h+='<p><b>Mark received documents (no uploads):</b></p>'+
 x.evidence_documents.map((name,i)=>'<label style="display:block;margin:7px 0"><input type="checkbox" data-pmsv40-wb-check="'+i+'" '+(v.documents[i]?'checked ':'')+'/> '+e(name)+'</label>').join("")+
 '<p><label>Document IDs or regulatory source references</label><textarea rows="2" maxlength="300" data-pmsv40-wb-ref placeholder="Reference and revision">'+e(v.reference)+'</textarea></p>'+
 '<p><label>Follow-up notes (not legal signoff)</label><textarea rows="2" maxlength="500" data-pmsv40-wb-note placeholder="Needed clarification">'+e(v.note)+'</textarea></p>'+
 '<p><button type="button" data-pmsv40-wb-export="case">Copy case JSON</button> <button type="button" data-pmsv40-wb-export="all">Copy all review drafts JSON</button> <button type="button" data-pmsv40-wb-clear="1">Clear local case</button></p>'+
 '<small data-pmsv40-wb-message>Receiving all four records never changes source applicability.</small></details>';
 return h;
}
function pmsv40WorkbenchSave(e){
 const t=e?.target,card=t?.closest?.("[data-pmsv40-wb-card]");
 if(!card||!pmsv40WorkbenchValid())return;
 const id=card.getAttribute("data-pmsv40-wb-card");
 if(!pmsv40ClosureIntake.intake_records.some(x=>x.catalog_id===id))return;
 const check=t.getAttribute?.("data-pmsv40-wb-check");
 const ref=t.hasAttribute?.("data-pmsv40-wb-ref"),note=t.hasAttribute?.("data-pmsv40-wb-note");
 if(check===null&&!ref&&!note)return;
 const state=pmsv40WorkbenchRead(),v=state[id]||{documents:[false,false,false,false],reference:"",note:""};
 if(check!==null){
  const n=Number(check);
  if(!Number.isInteger(n)||n<0||n>3)return;
  v.documents[n]=t.checked===true;
 }else if(ref)v.reference=String(t.value||"").slice(0,300);
 else v.note=String(t.value||"").slice(0,500);
 state[id]=v;
 const ok=pmsv40WorkbenchWrite(state);
 const count=card.querySelector?.("[data-pmsv40-wb-count]");
 if(count)count.textContent=v.documents.filter(Boolean).length+"/4 received, unverified";
 const message=card.querySelector?.("[data-pmsv40-wb-message]");
 if(message)message.textContent=ok?"Draft saved locally; regulatory status remains PENDING.":"Browser storage blocked; changes not saved.";
}
async function pmsv40WorkbenchClick(e){
 const t=e?.target,card=t?.closest?.("[data-pmsv40-wb-card]");
 if(!card||!pmsv40WorkbenchValid())return;
 const id=card.getAttribute("data-pmsv40-wb-card");
 if(!pmsv40ClosureIntake.intake_records.some(x=>x.catalog_id===id))return;
 const message=card.querySelector?.("[data-pmsv40-wb-message]");
 if(t.hasAttribute?.("data-pmsv40-wb-clear")){
  const state=pmsv40WorkbenchRead();delete state[id];
  const ok=pmsv40WorkbenchWrite(state);
  card.querySelectorAll?.("input[data-pmsv40-wb-check]").forEach(t=>t.checked=false);
  card.querySelectorAll?.("textarea[data-pmsv40-wb-note],textarea[data-pmsv40-wb-ref]").forEach(t=>t.value="");
  const count=card.querySelector?.("[data-pmsv40-wb-count]");
  if(count)count.textContent="0/4 received, unverified";
  if(message)message.textContent=ok?"Local receipts cleared; legal status still PENDING.":"Unable to save clear operation.";
  return;
 }
 const mode=t.getAttribute?.("data-pmsv40-wb-export");
 if(mode!=="case"&&mode!=="all")return;
 const payload=mode==="case"?pmsv40WorkbenchExportCase(id):pmsv40WorkbenchExportAll();
 if(!payload||typeof navigator==="undefined"||!navigator.clipboard?.writeText){
  if(message)message.textContent="Clipboard unavailable; export not completed.";return;
 }
 try{await navigator.clipboard.writeText(JSON.stringify(payload,null,2));if(message)message.textContent="Review receipt JSON copied. Not a compliance approval.";}
 catch(_){if(message)message.textContent="Clipboard permission denied; nothing exported.";}
}
if(typeof document!=="undefined"){
 document.addEventListener("change",pmsv40WorkbenchSave);
 document.addEventListener("input",pmsv40WorkbenchSave);
 document.addEventListener("click",pmsv40WorkbenchClick);
}
var pmsv40WorkbenchOldHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsv40WorkbenchHtml(p)+pmsv40WorkbenchOldHtml(p)};
