(function(){
"use strict";
/* Batch116: visible two-owner first-70 handoff, loaded only after explicit user action.
 * Never transmits owner messages, receives proof, approves CTR values or releases lots.
 * Uses the existing fully verified B70/B58 evidence-review pipeline. */
const ID="pmsv-b116-first70-handoff";
const SOURCE="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR";
const MAKER="MANUFACTURER_OR_SUPPLIER_QA";
let busy=false;
function host(){return document.getElementById(ID)}
function say(message){
 const el=host()?.querySelector("[data-b116-message]");
 if(el)el.textContent=String(message);
}
function lock(enabled){
 for(const button of host()?.querySelectorAll("[data-b116-owner]")||[])button.disabled=enabled;
}
function install(){
 if(host())return true;
 const anchor=document.getElementById("formulationProductGate");
 if(!anchor)return false;
 const panel=document.createElement("div");
 panel.id=ID;
 panel.className="card";
 panel.style.marginBottom="12px";
 panel.innerHTML='<div class="section-title"><h2>35 open FSSAI cases — evidence handoff</h2><span>Research reviewed · compliance HELD</span></div>'+
  '<p><b>533 catalogue products · 498 conditional first-source matches · 35 held cases.</b> All 35 public-source research dossiers have been reviewed, but the 175 original requests remain NOT SENT / NOT RECEIVED in the source records. There are <b>70 immediate requests</b> to prepare and <b>105 subsequent dependent gates</b>.</p>'+
  '<p>Select a functional owner to load the verified research workbench and open its <b>35 unsent preparatory requests</b>. No automatic message, confidential upload, legal signoff, laboratory PASS or product release occurs.</p>'+
  '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:9px">'+
  '<button type="button" data-b116-owner="'+SOURCE+'">35 source / method authority requests</button>'+
  '<button type="button" data-b116-owner="'+MAKER+'">35 manufacturer / supplier QA requests</button>'+
  '</div>'+
  '<p class="countline" role="status" aria-live="polite" data-b116-message>Choose an owner to prepare a source-checked draft. Both owner groups remain unsent.</p>';
 anchor.insertAdjacentElement("afterend",panel);
 return true;
}
async function open(owner){
 if(busy)return false;
 if(owner!==SOURCE&&owner!==MAKER){say("Unknown owner group. No requests opened.");return false;}
 if(!install())return false;
 busy=true;lock(true);
 say("Loading and verifying all 35 held cases and the original 175 request IDs…");
 try{
  const review=window.pmsvB70ExtendedResearch;
  if(!review?.getState||!review?.request||!review?.recheck)
   throw Error("Full evidence review loader unavailable");
  const before=review.getState();
  if(before?.extended==="LOADING")throw Error("Evidence review is already loading; retry after it settles");
  if(before?.extended!=="READY"){
   if(!await review.request())throw Error("Extended FSSAI research did not pass integrity checks");
  }
  if(review.recheck()!==true)throw Error("Extended FSSAI source validation failed");
  const packets=window.pmsvB58OwnerOutreach;
  if(!packets?.valid?.()||!packets?.focusRole?.(owner))
   throw Error("Owner evidence packet integrity or navigation failed");
  const rows=packets.filtered();
  if(rows.length!==35||rows.some(r=>r.role!==owner||r.routing!=="REQUEST_PREPARATION_POSSIBLE"||
    r.original_request_status!=="NOT_SENT"||r.original_document_status!=="NOT_RECEIVED"))
   throw Error("Owner packet does not reconcile to exactly 35 original unsent requests");
  say("Opened 35 verified, UNSENT request drafts for "+(owner===SOURCE?"source/method authority":"manufacturer/supplier QA")+
    ". Download or copy within the owner panel; independently verify recipients before sending.");
  return true;
 }catch(error){
  say("Blocked: "+String(error?.message||error).slice(0,180)+
   ". Nothing has been sent, received, approved or released.");
  return false;
 }finally{busy=false;lock(false);}
}
document.addEventListener("click",event=>{
 const b=event.target?.closest?.("[data-b116-owner]");
 if(b)void open(b.dataset.b116Owner);
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB116First70Handoff=Object.freeze({open,install,roles:Object.freeze([SOURCE,MAKER])});
})();