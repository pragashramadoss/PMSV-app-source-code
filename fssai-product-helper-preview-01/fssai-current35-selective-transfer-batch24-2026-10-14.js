"use strict";
/* PMSV Batch 24: selective, loss-aware restore from strictly validated B15
 * unverified evidence packets. Never changes FSSAI source status or lot PASS. */
var pmsvB24Chosen=new Set();
var pmsvB24ClaimRestore=false;
var pmsvB24PreviewRef=null;
var pmsvB24LastResult="NOT_STARTED";
function pmsvB24Valid(){
 return typeof pmsvB23Ready==="function"&&pmsvB23Ready()&&
 pmsv498Ledger?.first_source_pending===35&&pmsvB14Data?.cases?.length===35&&
 pmsvB23Keys?.length===3&&pmsvB15Data?.candidate_routes?.length===3;
}
function pmsvB24Changes(parsed){
 if(!pmsvB24Valid()||!parsed?.unverified||!Array.isArray(parsed.records))return [];
 const current=pmsvB14Read(),receipts=pmsvB5Read(),ids=new Set();
 return parsed.records.map(record=>{
  const id=record.id;
  if(ids.has(id)||!pmsvB14Data.cases.some(x=>x.catalog_id===id))
   throw Error("Invalid or duplicate catalogue identity in transfer");
  ids.add(id);
  const own=current[id]||pmsvB14Fresh(),got=record.fields,
        oldProof=receipts[id]?.received||[false,false,false,false],
        after=record.received;
  const fieldsDiffer=JSON.stringify(own)!==JSON.stringify(got),
        receiptsDiffer=JSON.stringify(oldProof)!==JSON.stringify(after),
        incomingText=Object.values(got).some(v=>String(v||"").trim().length>0),
        incomingReceipts=after.some(x=>x===true),
        previousText=Object.values(own).some(v=>String(v||"").trim().length>0),
        previousReceipts=oldProof.some(x=>x===true);
  const category=!fieldsDiffer&&!receiptsDiffer?"UNCHANGED":
   !incomingText&&!incomingReceipts?"EMPTY_INCOMING":
   previousText||previousReceipts?"OVERWRITES_EXISTING":"NEW_INFORMATION";
  const x=pmsvB14Data.cases.find(x=>x.catalog_id===id);
  return {id,name:x.product_name,category,fieldsDiffer,receiptsDiffer,
   incomingHasEvidence:incomingText||incomingReceipts,priorHasEvidence:previousText||previousReceipts};
 });
}
function pmsvB24DifferentClaims(){
 const d=pmsvB23Pending?.parsed,cl=d?.claims;
 if(!cl)return 0;
 const old=pmsvB15ClaimsRead();
 return Object.keys(cl).filter(id=>JSON.stringify(cl[id])!==JSON.stringify(old[id])).length;
}
function pmsvB24ChoiceMarkup(){
 if(!pmsvB24Valid()||!pmsvB23Pending)return "";
 const esc=pmsvB14Esc,records=pmsvB24Changes(pmsvB23Pending.parsed);
 const count=pmsvB24DifferentClaims();
 return '<div data-pmsv-b24-selective>'+
 '<p><b>Batch 24 · choose exactly which review cases to restore.</b> All cases start unselected. Existing local drafts and document receipts are protected unless you select their case explicitly.</p>'+
 '<p><button type="button" data-pmsv-b24-action="new">Select only new evidence</button> '+
 '<button type="button" class="secondary-btn" data-pmsv-b24-action="changed">Select all changed (includes overwrites)</button> '+
 '<button type="button" class="secondary-btn" data-pmsv-b24-action="none">Clear selection</button></p>'+
 '<div style="max-height:280px;overflow:auto;border:1px solid var(--border,#bbb);border-radius:8px;padding:8px" data-pmsv-b24-choices>'+
 records.map(x=>'<label style="display:block;padding:5px 2px"><input type="checkbox" data-pmsv-b24-case="'+esc(x.id)+'" '+
 (pmsvB24Chosen.has(x.id)?'checked ':'')+
 (x.category==="UNCHANGED"?'disabled ':'')+'/>'+
 ' <b>'+esc(x.name)+'</b> <small>('+esc(x.category.replaceAll("_"," ").toLowerCase())+
 (x.receiptsDiffer?'; receipts differ':'')+')</small></label>').join("")+
 '</div>'+
 '<label style="display:block;margin-top:10px"><input type="checkbox" data-pmsv-b24-claims '+
 (pmsvB24ClaimRestore?'checked ':'')+(count?'':'disabled ')+
 '/> Also replace the 3 conditional-route self-reported claim arrays ('+count+' differ from saved claims).</label>'+
 '<p data-pmsv-b24-selected aria-live="polite"></p></div>';
}
function pmsvB24Recount(){
 if(!pmsvB23Pending||typeof document==="undefined")return;
 const records=pmsvB24Changes(pmsvB23Pending.parsed);
 const selected=records.filter(x=>pmsvB24Chosen.has(x.id));
 const overwrites=selected.filter(x=>x.category==="OVERWRITES_EXISTING").length;
 const blank=selected.filter(x=>x.category==="EMPTY_INCOMING").length;
 const claim=pmsvB24ClaimRestore&&pmsvB24DifferentClaims()>0;
 const panel=document.querySelector("[data-pmsv-b24-selective]"),
       message=panel?.querySelector("[data-pmsv-b24-selected]");
 if(message)message.textContent=selected.length+" selected case(s), including "+
  overwrites+" existing-evidence overwrite(s)"+(blank?", "+blank+" empty replacements":"")+
  (claim?"; conditional claims also selected.":".")+
  " Unselected browser drafts and receipts will remain intact. No legal PASS.";
 const confirm=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b23-confirm]");
 if(confirm)confirm.disabled=selected.length===0&&!claim;
}
const pmsvB24OriginalDisplay=pmsvB23Display;
pmsvB23Display=function(message,preview){
 pmsvB24OriginalDisplay(message,preview);
 if(typeof document==="undefined")return;
 const confirmation=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b23-confirmation]");
 const existing=confirmation?.querySelector("[data-pmsv-b24-selective]");
 if(!preview||!pmsvB23Pending){
  if(existing)existing.remove();
  pmsvB24Chosen.clear();pmsvB24ClaimRestore=false;pmsvB24PreviewRef=null;
  return;
 }
 if(pmsvB24PreviewRef!==pmsvB23Pending){
  pmsvB24PreviewRef=pmsvB23Pending;
  pmsvB24Chosen.clear();pmsvB24ClaimRestore=false;
 }
 if(existing)existing.remove();
 if(confirmation){
  const button=confirmation.querySelector("[data-pmsv-b23-confirm]");
  if(button)button.insertAdjacentHTML("beforebegin",pmsvB24ChoiceMarkup());
  pmsvB24Recount();
 }
};
function pmsvB24Select(mode){
 if(!pmsvB23Pending||!pmsvB24Valid())return false;
 const choices=pmsvB24Changes(pmsvB23Pending.parsed);
 pmsvB24Chosen.clear();
 for(const x of choices){
  if(mode==="new"&&x.category==="NEW_INFORMATION")pmsvB24Chosen.add(x.id);
  if(mode==="changed"&&x.category!=="UNCHANGED")pmsvB24Chosen.add(x.id);
 }
 const el=document.querySelector("[data-pmsv-b24-choices]");
 if(el)el.querySelectorAll("[data-pmsv-b24-case]").forEach(node=>{
  node.checked=pmsvB24Chosen.has(node.getAttribute("data-pmsv-b24-case"));
 });
 pmsvB24Recount();return true;
}
function pmsvB24Confirm(){
 if(!pmsvB24Valid()||!pmsvB23Pending){pmsvB24LastResult="PREVIEW_MISSING";return false}
 const draft=pmsvB23Pending;
 const file=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b15-import-file]")?.files?.[0];
 if(file!==draft.file||!pmsvB23SameSnapshot(draft.previous,pmsvB23Snapshot())){
  pmsvB23Reset("File or locally saved evidence changed after preview. No records imported. Preview again.");
  pmsvB23LastResult="STALE_REJECTED";pmsvB24LastResult="STALE_REJECTED";return false;
 }
 const permitted=new Map(pmsvB24Changes(draft.parsed).map(x=>[x.id,x]));
 const selected=draft.parsed.records.filter(x=>pmsvB24Chosen.has(x.id)&&
   permitted.get(x.id)?.category!=="UNCHANGED");
 const claims=pmsvB24ClaimRestore&&pmsvB24DifferentClaims()>0?draft.parsed.claims:null;
 if(selected.length===0&&!claims){
  pmsvB24LastResult="EMPTY_SELECTION";
  pmsvB23Display("Nothing selected. Choose at least one changed case or conditional claim set before confirming.",draft.info);
  return false;
 }
 const changed={...draft.parsed,records:selected,claims,unverified:true};
 if(!pmsvB15CommitTransfer(changed)){
  pmsvB24LastResult="STORAGE_REJECTED";pmsvB23Reset("Local browser storage refused the transfer. No successful import reported.");
  return false;
 }
 const n=selected.length,restoredClaims=!!claims;
 pmsvB23Pending=null;pmsvB23LastResult="IMPORTED_UNVERIFIED";pmsvB24LastResult="SELECTIVE_IMPORT_COMPLETE";
 const picker=document.querySelector("#pmsv-b15-transfer-panel [data-pmsv-b15-import-file]");
 if(picker)picker.value="";
 if(typeof pmsvB15Refresh==="function")pmsvB15Refresh();
 if(typeof pmsvB22Sync==="function")pmsvB22Sync();
 document.querySelectorAll("[data-pmsv-b14-case]").forEach(node=>{
  if(selected.some(x=>x.id===node.getAttribute("data-pmsv-b14-case")))
   node.outerHTML=pmsvB14CaseHtml(node.getAttribute("data-pmsv-b14-case"));
 });
 pmsvB23Display("Restored "+n+" specifically selected unverified case(s)"+
 (restoredClaims?" plus conditional-route claim flags":"")+
 ". All unselected reviewer drafts were preserved. No legal article/lot PASS.",null);
 return true;
}
if(typeof document!=="undefined"&&document.addEventListener){
 /* Catch before B23's bubble confirm handler; delegate only B24-controlled imports. */
 document.addEventListener("click",event=>{
  const t=event.target?.closest?.("[data-pmsv-b23-confirm]");
  if(!t)return;
  event.preventDefault();event.stopImmediatePropagation();
  pmsvB24Confirm();
 },true);
 document.addEventListener("click",event=>{
  const t=event.target?.closest?.("[data-pmsv-b24-action]");
  if(t)pmsvB24Select(t.getAttribute("data-pmsv-b24-action"));
 });
 document.addEventListener("change",event=>{
  const t=event.target;
  if(t?.hasAttribute?.("data-pmsv-b24-case")){
   const id=t.getAttribute("data-pmsv-b24-case");
   const row=pmsvB23Pending&&pmsvB24Changes(pmsvB23Pending.parsed).find(x=>x.id===id);
   if(row&&row.category!=="UNCHANGED"){
    if(t.checked)pmsvB24Chosen.add(id);else pmsvB24Chosen.delete(id);
    pmsvB24Recount();
   }
  }else if(t?.hasAttribute?.("data-pmsv-b24-claims")){
   pmsvB24ClaimRestore=t.checked&&pmsvB24DifferentClaims()>0;
   pmsvB24Recount();
  }
 });
}
