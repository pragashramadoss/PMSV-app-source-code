"use strict";
/* PMSV B23: local-only B15 transfer dry-run, explicit confirm, stale-draft
 * protection. No source approvals, numeric thresholds or laboratory PASS.
 */
var pmsvB23Pending=null;
var pmsvB23LastResult="NOT_RUN";
const pmsvB23Keys=Object.freeze([pmsvB14StorageKey,pmsvB5StorageKey,pmsvB15ClaimsKey]);
const pmsvB23Max=2000000;
function pmsvB23Ready(){
 return typeof pmsvB22Ready==="function"&&pmsvB22Ready()&&
 typeof pmsvB15Valid==="function"&&pmsvB15Valid()&&
 typeof pmsvB15ParseTransfer==="function"&&
 typeof pmsvB15CommitTransfer==="function"&&
 pmsv498Ledger?.first_source_pending===35&&pmsvB15Data?.transfers?.maximum_bytes===pmsvB23Max;
}
function pmsvB23Snapshot(){
 if(!pmsvB23Ready())throw Error("FSSAI draft-review integrity chain is not available");
 return pmsvB23Keys.map(k=>window.localStorage.getItem(k));
}
function pmsvB23SameSnapshot(a,b){
 return Array.isArray(a)&&Array.isArray(b)&&a.length===3&&b.length===3&&
 a.every((v,i)=>v===b[i]);
}
function pmsvB23Plan(parsed){
 if(!pmsvB23Ready()||!parsed?.unverified||!Array.isArray(parsed.records))
  throw Error("Not a validated unverified-review packet");
 const original=pmsvB14Read(),receipts=pmsvB5Read(),claims=pmsvB15ClaimsRead();
 const info={imported:parsed.records.length,new_drafts:0,changed_drafts:0,
  unchanged_drafts:0,changed_receipt_sets:0,changed_candidate_claims:0,
  legal_approvals:0,lot_passes:0};
 for(const row of parsed.records){
  const own=original[row.id];
  const had=!!own&&Object.values(own).some(x=>String(x||"").trim().length);
  const differs=JSON.stringify(own||pmsvB14Fresh())!==JSON.stringify(row.fields);
  if(!had&&differs)info.new_drafts++;
  else if(differs)info.changed_drafts++;
  else info.unchanged_drafts++;
  const oldReceived=receipts[row.id]?.received||[false,false,false,false];
  if(JSON.stringify(oldReceived)!==JSON.stringify(row.received))info.changed_receipt_sets++;
 }
 if(parsed.claims){
  for(const [id,arr] of Object.entries(parsed.claims)){
   if(JSON.stringify(claims[id])!==JSON.stringify(arr))info.changed_candidate_claims++;
  }
 }
 return info;
}
function pmsvB23Panel(){
 if(!pmsvB23Ready())return "";
 return '<div data-pmsv-b23-preflight class="notice" style="margin-top:9px">'+
  '<b>Batch 23 · review before restoring evidence</b>'+
  '<p>Import runs a local-only validation and comparison first. You must confirm separately. Existing drafts are not modified during preview. All source findings, lab references and receipt checkboxes remain UNVERIFIED.</p>'+
  '<div data-pmsv-b23-message aria-live="polite">Choose your PMSV review JSON, then press Import to inspect changes.</div>'+
  '<div data-pmsv-b23-confirmation hidden>'+
  '<p data-pmsv-b23-differences></p>'+
  '<p><button type="button" data-pmsv-b23-confirm>Confirm replacement / merge of unverified drafts</button> '+
  '<button type="button" class="secondary-btn" data-pmsv-b23-cancel>Cancel import</button></p>'+
  '</div></div>';
}
function pmsvB23Ensure(){
 if(typeof document==="undefined"||!pmsvB23Ready())return;
 const panel=document.getElementById("pmsv-b15-transfer-panel");
 const parent=panel?.querySelector("[data-pmsv-b15-import]")?.parentElement;
 if(!parent||panel.querySelector("[data-pmsv-b23-preflight]"))return;
 parent.insertAdjacentHTML("afterend",pmsvB23Panel());
}
function pmsvB23Display(message,preview){
 if(typeof document==="undefined")return;
 pmsvB23Ensure();
 const panel=document.querySelector("[data-pmsv-b23-preflight]");
 const text=panel?.querySelector("[data-pmsv-b23-message]");
 const confirm=panel?.querySelector("[data-pmsv-b23-confirmation]");
 if(text)text.textContent=message;
 if(confirm)confirm.hidden=!preview;
 if(preview&&confirm){
  const info=panel.querySelector("[data-pmsv-b23-differences]");
  if(info)info.textContent=preview.imported+" cases examined · "+preview.new_drafts+
   " newly populated drafts · "+preview.changed_drafts+" existing reviewer drafts to replace · "+
   preview.changed_receipt_sets+" altered receipt lists · "+
   preview.changed_candidate_claims+" altered conditional claims. "+
   "These are unverified browser-local statements, not regulatory findings or lot PASS.";
 }
}
function pmsvB23Reset(message){
 pmsvB23Pending=null;pmsvB23LastResult="CANCELLED";
 pmsvB23Display(message||"No changes made to saved browser evidence.",null);
}
async function pmsvB23PreviewSelected(){
 pmsvB23Pending=null;
 if(!pmsvB23Ready()){pmsvB23LastResult="UNAVAILABLE";return false}
 const picker=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b15-import-file]");
 const file=picker?.files?.[0];
 if(!file){pmsvB23Display("Choose a PMSV JSON file to preview first.",null);return false}
 if(file.size>pmsvB23Max||file.size===0){
  pmsvB23LastResult="REJECTED";pmsvB23Display("Rejected: selected file is empty or above the 2 MB limit.",null);return false;
 }
 pmsvB23Display("Checking selected evidence file locally; browser drafts are unchanged.",null);
 try{
  const previous=pmsvB23Snapshot(),contents=await file.text();
  if(picker.files?.[0]!==file)throw Error("File changed while it was being checked");
  if(contents.length>pmsvB23Max)throw Error("Expanded JSON exceeds the 2 MB review limit");
  const parsed=pmsvB15ParseTransfer(contents);
  const info=pmsvB23Plan(parsed);
  if(!pmsvB23SameSnapshot(previous,pmsvB23Snapshot()))throw Error("Saved evidence changed while preview was open");
  pmsvB23Pending={file,parsed,previous,info};
  pmsvB23LastResult="PREVIEW_READY";
  pmsvB23Display("Preview validated. No evidence imported yet. Confirm only if the proposed changes are expected.",info);
  return true;
 }catch(err){
  pmsvB23Pending=null;pmsvB23LastResult="REJECTED";
  pmsvB23Display("Import rejected before any changes: "+String(err?.message||"Invalid evidence file"),null);
  return false;
 }
}
function pmsvB23Confirm(){
 const draft=pmsvB23Pending;
 if(!pmsvB23Ready()||!draft){pmsvB23LastResult="NOT_PREVIEWED";return false}
 const picker=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b15-import-file]");
 if(picker?.files?.[0]!==draft.file||
 !pmsvB23SameSnapshot(draft.previous,pmsvB23Snapshot())){
  pmsvB23Reset("Saved data or selected file changed since preview. Import cancelled; preview again before confirming.");
  pmsvB23LastResult="STALE_REJECTED";return false;
 }
 if(!pmsvB15CommitTransfer(draft.parsed)){
  pmsvB23LastResult="STORAGE_REJECTED";
  pmsvB23Reset("Browser storage rejected the transfer. No successful restore reported.");return false;
 }
 const count=draft.info.imported;
 pmsvB23Pending=null;pmsvB23LastResult="IMPORTED_UNVERIFIED";
 if(picker)picker.value="";
 if(typeof pmsvB15Refresh==="function")pmsvB15Refresh();
 if(typeof pmsvB22Sync==="function")pmsvB22Sync();
 if(typeof document!=="undefined"){
  document.querySelectorAll("[data-pmsv-b14-case]").forEach(node=>{
   const id=node.getAttribute("data-pmsv-b14-case");
   if(pmsvB14Data.cases.some(x=>x.catalog_id===id))node.outerHTML=pmsvB14CaseHtml(id);
  });
 }
 pmsvB23Display("Imported "+count+" unverified review draft(s). Legal source approvals and laboratory passes remain zero.",null);
 return true;
}
const pmsvB23PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 /* Batch71: When B22 already completed and B21 still validates the full
  * original review chain, do not reload B14–B21 and reset live reviewer forms.
  * A missing/invalid B21 core MUST reject extended loading, not skip proofs. */
 if(typeof pmsvB21Valid!=="function"||!pmsvB21Valid()){
  await pmsvB23PriorLoad();
  /* Initial inline contaminants load can start before B22 is READY. B22
   * independently rebuilds/verifies its frozen core on startup. Only an
   * explicit optional load after B22 READY must hard-fail this boundary. */
  if(typeof pmsvB22StartupState!=="undefined"&&pmsvB22StartupState==="READY"&&
     (typeof pmsvB21Valid!=="function"||!pmsvB21Valid()))
   throw Error("B71_CORE_EVIDENCE_INTEGRITY_BLOCKED");
 }
 pmsvB23Pending=null;pmsvB23Ensure();
};
if(typeof document!=="undefined"&&document.addEventListener){
 /* Capture before the older Batch15 handler: first press only previews, never writes. */
 document.addEventListener("click",ev=>{
  const old=ev.target?.closest?.("[data-pmsv-b15-import]");
  if(!old)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  pmsvB23PreviewSelected();
 },true);
 document.addEventListener("click",ev=>{
  if(ev.target?.closest?.("[data-pmsv-b23-confirm]"))pmsvB23Confirm();
  if(ev.target?.closest?.("[data-pmsv-b23-cancel]"))pmsvB23Reset();
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("#pmsv-b15-transfer-panel [data-pmsv-b15-import-file]"))
    pmsvB23Reset("Selected file changed. Run Import again to review its contents.");
 });
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",pmsvB23Ensure,{once:true});
 else pmsvB23Ensure();
}
