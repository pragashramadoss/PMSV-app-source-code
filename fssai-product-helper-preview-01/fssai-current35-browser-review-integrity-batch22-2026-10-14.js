"use strict";
/* PMSV Batch22: preserve live review controls and sync browser-local drafts.
 * Reviewer content stays on device; nothing grants a legal source or lab PASS.
 */
const pmsvB22Stats={syncs:0,refreshes:0,lastError:""};
function pmsvB22Ready(){
 return typeof pmsvB21Valid==="function"&&pmsvB21Valid()&&
 typeof pmsvB20Render==="function"&&typeof pmsvB21Refresh==="function"&&
 typeof pmsvB14CaseHtml==="function"&&typeof pmsvB14Esc==="function";
}
/* Update only audit summary, counts and rows; NEVER replace an opened
 * <details> element during a keystroke in the evidence form. */
pmsvB20Ensure=function(){
 if(typeof document==="undefined"||!pmsvB22Ready())return;
 const host=document.getElementById("pmsv-b14-review-index")||
            document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const existing=document.getElementById("pmsv-b20-audit");
 if(!existing){
  host.insertAdjacentHTML("beforebegin",pmsvB20Render());
 }else{
  const holder=document.createElement("div");
  holder.innerHTML=pmsvB20Render();
  const fresh=holder.querySelector("#pmsv-b20-audit");
  if(!fresh)return;
  const oldSummary=existing.querySelector("summary"),
        newSummary=fresh.querySelector("summary"),
        oldNotice=existing.querySelector(".notice"),
        newNotice=fresh.querySelector(".notice"),
        oldStats=existing.querySelector(".notice + p"),
        newStats=fresh.querySelector(".notice + p"),
        oldRows=existing.querySelector("tbody"),
        newRows=fresh.querySelector("tbody");
  if(oldSummary&&newSummary)oldSummary.innerHTML=newSummary.innerHTML;
  if(oldNotice&&newNotice)oldNotice.innerHTML=newNotice.innerHTML;
  if(oldStats&&newStats)oldStats.textContent=newStats.textContent;
  if(oldRows&&newRows)oldRows.innerHTML=newRows.innerHTML;
 }
 pmsvB22Stats.refreshes++;
 pmsvB21Refresh();
 pmsvB22EnsureControl();
};
function pmsvB22EnsureControl(){
 if(typeof document==="undefined"||!pmsvB22Ready())return;
 const panel=document.getElementById("pmsv-b21-readiness");
 if(!panel||panel.querySelector("[data-pmsv-b22-recheck]"))return;
 const exportBtn=panel.querySelector("[data-pmsv-b21-export]");
 if(exportBtn)exportBtn.insertAdjacentHTML("afterend",
  ' <button type="button" class="secondary-btn" data-pmsv-b22-recheck>'+
  'Recheck saved evidence</button>');
}
function pmsvB22AnnounceOtherTab(){
 const b14=document.getElementById("pmsv-b14-review-index");
 const selected=b14?.querySelector("[data-pmsv-b14-case]");
 if(!selected||b14.querySelector("[data-pmsv-b22-remote-change]"))return;
 selected.insertAdjacentHTML("afterbegin",
  '<p class="notice" data-pmsv-b22-remote-change>'+
  'Review drafts were updated in another tab. The audit was refreshed; reload this evidence form to view those edits. '+
  '<button type="button" data-pmsv-b22-reload>Reload this form</button></p>');
}
function pmsvB22Sync(){
 if(!pmsvB22Ready())return false;
 try{
  pmsvB20Ensure();pmsvB21Refresh();pmsvB22EnsureControl();
  pmsvB22Stats.syncs++;return true;
 }catch(e){pmsvB22Stats.lastError=String(e?.message||e);return false}
}
function pmsvB22ReloadForm(){
 if(!pmsvB22Ready()||typeof document==="undefined")return false;
 const b14=document.getElementById("pmsv-b14-review-index");
 const node=b14?.querySelector("[data-pmsv-b14-case]");
 const id=node?.getAttribute("data-pmsv-b14-case");
 if(!id||!pmsvB14Data.cases.some(x=>x.catalog_id===id))return false;
 const refreshed=pmsvB14CaseHtml(id);
 if(!refreshed)return false;
 node.outerHTML=refreshed;
 pmsvB22Sync();return true;
}
const pmsvB22PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB22PriorLoad();
 pmsvB22Sync();
};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("click",event=>{
  if(event.target?.closest?.("[data-pmsv-b22-recheck]"))pmsvB22Sync();
  if(event.target?.closest?.("[data-pmsv-b22-reload]"))pmsvB22ReloadForm();
 });
}
if(typeof window!=="undefined"&&window.addEventListener){
 window.addEventListener("storage",event=>{
  const watch=[pmsvB14StorageKey,pmsvB5StorageKey,pmsvB15ClaimsKey];
  if(event.key!==null&&!watch.includes(event.key))return;
  if(pmsvB22Sync()){
   if(typeof document!=="undefined")pmsvB22AnnounceOtherTab();
  }
 });
}
