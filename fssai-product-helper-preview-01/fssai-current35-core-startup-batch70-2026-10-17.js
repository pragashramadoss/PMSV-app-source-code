(function(){"use strict";
/* Batch70: core-first preview startup; explicit, fail-closed extended research loading.
 * All 35 CTR cases and 175 original documentary gates remain open. */
let state="NOT_REQUESTED", error="", requested=false, startedAt=0, completedAt=0, progress=0;
let progressInterval=null;
const panels=[
 "pmsv-b63-cocoa-sugar-specifics","pmsv-b64-three-originals",
 "pmsv-b65-four-matrix-classifications","pmsv-b66-nutra-source-audit",
 "pmsv-b67-six-matrix-review","pmsv-b68-lead-source-review"
];
const fullSourceLoader=pmsvLoadPositiveSourceProof; // Batch68 top-level, not core-only
function safeState(){
 const core=typeof pmsvB22StartupState==="undefined"?"NOT_STARTED":String(pmsvB22StartupState);
 return {core,extended:state,error,startedAt,completedAt,sourcePanelsVisible:progress,requestsSent:0,
  caseApprovals:0,labPasses:0,productReleases:0,all35Held:true};
}
function panel(){
 return '<details id="pmsv-b70-startup-gates" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch70 · Verified core startup and optional full evidence research</b></summary>'+
 '<div class="notice"><b>Regulatory status: all 35 original cases HELD.</b> 533 products; 498 conditional first-source matches; 175 original documentary requests. A loaded review panel is NOT an approved contaminant limit, method scope or tested lot.</div>'+
 '<p><b>Core startup:</b> <span data-pmsv-b70-core>Checking…</span>. '+
 '<b>Extended research panels:</b> <span data-pmsv-b70-state>Not requested</span>.</p>'+
 '<p>The base product-standard screens can load independently of the much larger optional documentary review workbench. Select the button to load the extensive research panels. This is read-only and sends no owner requests.</p>'+
 '<p><button type="button" data-pmsv-b70-load>Load extended FSSAI evidence panels</button></p>'+
 '<p class="countline" data-pmsv-b70-message>No legal approvals, lab passes, or product releases.</p>'+
 '</details>';
}
function status(){
 const el=document.getElementById("pmsv-b70-startup-gates");if(!el)return;
 el.querySelector("[data-pmsv-b70-core]").textContent=safeState().core;
 const pretty={NOT_REQUESTED:"Not requested",LOADING:"Research source checks in progress ("+progress+"/"+panels.length+" panels visible, not approved)",
  READY:"Research panels loaded — NOT regulatory approved",
  INTEGRITY_BLOCKED:"Blocked: one or more source integrity checks failed"}[state]||state;
 el.querySelector("[data-pmsv-b70-state]").textContent=pretty;
 const btn=el.querySelector("[data-pmsv-b70-load]");
 btn.disabled=state==="LOADING"||state==="READY";
 btn.textContent=state==="LOADING"?"Evidence checks in progress…":
   state==="READY"?"Extended evidence loaded": "Load extended FSSAI evidence panels";
 el.querySelector("[data-pmsv-b70-message]").textContent=state==="READY"?
  "Extended source reviews available. 35 of 35 CTR cases remain HELD; 175 original requests unchanged; 0 legal/lab/lot releases.":
  state==="INTEGRITY_BLOCKED"?
  "Research loading is unavailable or source evidence could not be validated. No data was approved. "+
  (error?"Diagnostic: "+error:""):
  state==="LOADING"?"Verifying signed-source references and immutable case identities. No approvals granted.":
  "No automatic source transfer, numeric approval, accredited matrix PASS, or product release.";
}
function install(){
 if(document.getElementById("pmsv-b70-startup-gates")){status();return;}
 const anchor=document.getElementById("selectedProductStandardContent");
 if(anchor)anchor.insertAdjacentHTML("afterend",panel());
 status();
}
function researchValid(){
 const b59=window.pmsvB59CTRSourceCrosswalk;
 if(typeof pmsvB22StartupState==="undefined"||pmsvB22StartupState!=="READY"||
 !b59?.valid()||!window.pmsvB63CocoaMisri?.valid()||
 !window.pmsvB64OriginalLawCases?.valid()||!window.pmsvB65FourFoodMatrices?.valid()||
 !window.pmsvB66NutraIngredientAudit?.valid()||
 !window.pmsvB67SixMatrixEvidence?.valid()||
 !window.pmsvB68RemainingLeadP1?.valid())return false;
 const cases=b59.getAllCases?.();
 if(!Array.isArray(cases)||cases.length!==35)return false;
 const ids=new Set();
 for(const c of cases){
  if(c.original_request_ids?.length!==5||
   c.case_signed_legal_applicability!==false||
   c.actual_market_material_authenticated!==false||
   c.method_and_lab_scope_approved!==false||
   c.representative_lot_pass!==false)return false;
  for(const id of c.original_request_ids){if(ids.has(id))return false;ids.add(id);}
 }
 return ids.size===175&&panels.every(id=>!!document.getElementById(id));
}
async function request(){
 install();
 if(state==="LOADING"||state==="READY")return false;
 if(typeof pmsvB22StartupState==="undefined"||pmsvB22StartupState!=="READY"){
  error="Core B22 source validation is not READY";state="INTEGRITY_BLOCKED";status();return false;
 }
 requested=true;error="";progress=0;state="LOADING";startedAt=Date.now();status();
 progressInterval=setInterval(()=>{
  progress=panels.filter(id=>!!document.getElementById(id)).length;
  status();
 },1500);
 try{
  await fullSourceLoader();
  if(!researchValid()){
   const missing=[["B21",typeof pmsvB21Valid==="function"&&pmsvB21Valid()],
    ["B59",window.pmsvB59CTRSourceCrosswalk?.valid()],
    ["B63",window.pmsvB63CocoaMisri?.valid()],
    ["B64",window.pmsvB64OriginalLawCases?.valid()],
    ["B65",window.pmsvB65FourFoodMatrices?.valid()],
    ["B66",window.pmsvB66NutraIngredientAudit?.valid()],
    ["B67",window.pmsvB67SixMatrixEvidence?.valid()],
    ["B68",window.pmsvB68RemainingLeadP1?.valid()]]
    .filter(([,ok])=>!ok).map(([id])=>id);
   throw Error("Extended evidence integrity blocked: "+(missing.join(",")||"35-case source hold/panel mismatch"));
  }
  progress=panels.length;state="READY";completedAt=Date.now();status();return true;
 }catch(e){
  error=String(e?.message||e).slice(0,240);
  state="INTEGRITY_BLOCKED";status();return false;
 }finally{
  if(progressInterval!==null){clearInterval(progressInterval);progressInterval=null;}
 }
}
document.addEventListener("click",e=>{
 if(e.target?.closest?.("[data-pmsv-b70-load]"))void request();
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB70ExtendedResearch={getState:safeState,request,researchValid,install};
})();