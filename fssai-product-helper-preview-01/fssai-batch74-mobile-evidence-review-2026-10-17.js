(function(){"use strict";
/* PMSV B74 | Preview-only mobile research navigation and honest loading visibility.
 * This UI reads B70 state. It never approves a case, caches trust, or sends data.
 */
const sections=Object.freeze([
 ["pmsv-b63-cocoa-sugar-specifics","Cocoa / Misri"],
 ["pmsv-b64-three-originals","Article scope"],
 ["pmsv-b65-four-matrix-classifications","Food matrices"],
 ["pmsv-b66-nutra-source-audit","Nutraceuticals"],
 ["pmsv-b67-six-matrix-review","Six matrix reviews"],
 ["pmsv-b68-lead-source-review","Lead / P1 reviews"]
]);
let observer=null,lastKey="";
const stateOf=()=>window.pmsvB70ExtendedResearch?.getState?.()||null;
const present=()=>sections.filter(([id])=>!!document.getElementById(id)).length;
function decorateTables(){
 for(const [id,label] of sections){
  const root=document.getElementById(id);
  if(!root)continue;
  root.querySelectorAll("table").forEach(table=>{
   if(table.dataset.pmsvB74Table==="done")return;
   const old=table.parentElement;
   if(old && /auto|scroll/.test(old.style.overflow||"")){
    old.classList.add("pmsv-b74-scroll-area");
    old.setAttribute("role","region");
    old.setAttribute("aria-label",label+" evidence table, scroll horizontally for remaining columns");
    old.setAttribute("tabindex","0");
   }else{
    const shell=document.createElement("div");
    shell.className="pmsv-b74-scroll-area";
    shell.setAttribute("role","region");
    shell.setAttribute("aria-label",label+" evidence table, scroll horizontally for remaining columns");
    shell.setAttribute("tabindex","0");
    table.parentNode.insertBefore(shell,table);shell.appendChild(table);
   }
   table.dataset.pmsvB74Table="done";
  });
 }
}
function install(){
 const root=document.getElementById("pmsv-b70-startup-gates");
 if(!root||!window.pmsvB70ExtendedResearch)return false;
 if(!document.getElementById("pmsv-b74-styles")){
  const css=document.createElement("style");css.id="pmsv-b74-styles";
  css.textContent=`
#pmsv-b74-review{box-sizing:border-box;max-width:100%;min-width:0;padding:12px;margin:12px 0 0;border:1px solid #c9d6e8;border-radius:12px;background:#f8fbff}
#pmsv-b74-review h3{font-size:15px;margin:0 0 7px;line-height:1.4}
#pmsv-b74-review p{margin:7px 0;line-height:1.5;overflow-wrap:anywhere}
#pmsv-b74-review progress{display:block;max-width:100%;width:100%;height:14px;accent-color:#3155d9;margin:9px 0}
#pmsv-b74-review nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0 0}
#pmsv-b74-review nav[hidden]{display:none}
#pmsv-b74-review a{display:flex;min-height:44px;align-items:center;padding:10px;border-radius:8px;border:1px solid #c9d6e8;background:white;color:#17336b;font-weight:700;font-size:13px;overflow-wrap:anywhere;text-decoration:underline}
#pmsv-b74-review a:focus-visible,.pmsv-b74-scroll-area:focus-visible{outline:3px solid #3155d9;outline-offset:2px}
.pmsv-b74-scroll-area{max-width:100%;overflow:auto;overscroll-behavior-inline:contain;-webkit-overflow-scrolling:touch}
.pmsv-b74-scroll-area table{min-width:max-content}
#pmsv-b63-cocoa-sugar-specifics,#pmsv-b64-three-originals,#pmsv-b65-four-matrix-classifications,#pmsv-b66-nutra-source-audit,#pmsv-b67-six-matrix-review,#pmsv-b68-lead-source-review{min-width:0;max-width:100%;overflow-wrap:anywhere}
@media(max-width:700px){
#pmsv-b70-startup-gates,#pmsv-b74-review{max-width:100%;min-width:0}
#pmsv-b70-startup-gates [data-pmsv-b70-load]{width:100%;min-height:44px;white-space:normal}
#pmsv-b74-review nav{grid-template-columns:minmax(0,1fr)}
#pmsv-b63-cocoa-sugar-specifics summary,#pmsv-b64-three-originals summary,#pmsv-b65-four-matrix-classifications summary,#pmsv-b66-nutra-source-audit summary,#pmsv-b67-six-matrix-review summary,#pmsv-b68-lead-source-review summary{line-height:1.55;overflow-wrap:anywhere}
}`;
  document.head.appendChild(css);
 }
 if(!document.getElementById("pmsv-b74-review")){
  const box=document.createElement("section");box.id="pmsv-b74-review";
  box.setAttribute("aria-label","Extended FSSAI review progress and navigation");
  const head=document.createElement("h3");head.textContent="Batch74 · Evidence review on mobile";box.appendChild(head);
  const info=document.createElement("p");info.setAttribute("data-pmsv-b74-status","");
  info.setAttribute("role","status");info.setAttribute("aria-live","polite");box.appendChild(info);
  const bar=document.createElement("progress");bar.max=6;bar.value=0;
  bar.setAttribute("data-pmsv-b74-progress","");
  bar.setAttribute("aria-label","Research panels visible out of six, not regulatory approvals");box.appendChild(bar);
  const help=document.createElement("p");help.className="countline";
  help.textContent="35 cases HELD · 175 original evidence requests OPEN · 0 approvals, lab PASS or releases. Visibility is not verification.";box.appendChild(help);
  const nav=document.createElement("nav");nav.setAttribute("data-pmsv-b74-navigation","");
  nav.setAttribute("aria-label","Loaded evidence review sections");nav.hidden=true;
  for(const [id,label] of sections){
   const a=document.createElement("a");a.href="#"+id;a.dataset.pmsvB74Jump=id;
   a.textContent=label;nav.appendChild(a);
  }
  box.appendChild(nav);root.appendChild(box);
 }
 if(!observer){
  const source=root.querySelector("[data-pmsv-b70-state]");
  const core=root.querySelector("[data-pmsv-b70-core]");
  const message=root.querySelector("[data-pmsv-b70-message]");
  if(!source||!core||!message)return false;
  observer=new MutationObserver(()=>update());
  [source,core,message].forEach(node=>observer.observe(node,{subtree:true,childList:true,characterData:true}));
  document.addEventListener("click",event=>{
   const link=event.target?.closest?.("[data-pmsv-b74-jump]");
   if(!link)return;
   const s=stateOf(),target=document.getElementById(link.dataset.pmsvB74Jump);
   if(!s||s.extended!=="READY"||s.core!=="READY"||present()!==6||!target){
    event.preventDefault();update();return;
   }
   if(target.tagName==="DETAILS")target.open=true;
   const summary=target.querySelector("summary");
   if(summary){summary.setAttribute("tabindex","-1");summary.focus({preventScroll:true});}
   target.scrollIntoView({block:"start",behavior:"auto"});
  });
 }
 update();return true;
}
function update(){
 const box=document.getElementById("pmsv-b74-review"),state=stateOf();if(!box||!state)return null;
 const count=present(),ready=state.core==="READY"&&state.extended==="READY"&&count===6;
 const phases={
 NOT_REQUESTED:"Extended evidence not requested. Core standards can be reviewed separately.",
 LOADING:"Loading evidence: "+count+" of 6 research sections present (not yet verified).",
 READY:ready?"Six source-review sections are available for reading; all 35 cases remain HELD.":
  "Source panel availability changed: review navigation blocked.",
 INTEGRITY_BLOCKED:"Integrity blocked. Do not treat displayed research or source references as approved."
 };
 const label=state.core!=="READY"?"Core source checks not ready; evidence review unavailable.":
  phases[state.extended]||"Evidence review status unknown; no approvals.";
 const nav=box.querySelector("[data-pmsv-b74-navigation]");
 nav.hidden=!ready;
 const key=state.core+"|"+state.extended+"|"+count+"|"+label;
 if(lastKey!==key){
  box.querySelector("[data-pmsv-b74-status]").textContent=label;
  const bar=box.querySelector("[data-pmsv-b74-progress]");bar.value=count;
  bar.setAttribute("aria-valuetext",count+" of 6 research panels visible; 0 regulatory approvals");
  lastKey=key;
 }
 if(ready)decorateTables();
 return Object.freeze({core:state.core,extended:state.extended,panelsVisible:count,
  linksEnabled:ready,caseApprovals:0,labPasses:0,productReleases:0});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB74MobileReview=Object.freeze({install,update,read:()=>update()});
})();