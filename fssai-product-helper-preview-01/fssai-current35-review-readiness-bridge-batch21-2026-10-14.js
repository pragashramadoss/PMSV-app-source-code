"use strict";
/* PMSV Batch21: reviewer-document READINESS only, never a legal or laboratory PASS. */
var pmsvB21Data=null;
var pmsvB21Text="";
var pmsvB21Status="ALL";
const pmsvB21Path="./data/rules/fssai-current35-review-readiness-bridge-batch21-2026-10-14.json",pmsvB21Expected="cc3aed330e523ae0";
const pmsvB21Ctr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB21Valid(){
 if(typeof pmsvB20Valid!=="function"||!pmsvB20Valid()||!pmsvB21Data||
 !pmsvB17Data||!pmsvB14Data||!pmsvB20Data||!pmsv498Ledger)return false;
 const d=pmsvB21Data;
 if(pmsvB16Digest(d)!==pmsvB21Expected||
 d.kind!=="PMSV_BATCH21_REVIEWER_EVIDENCE_READINESS_BRIDGE"||
 d.schema_version!=="1.0"||d.as_of!=="2026-10-14"||
 d.deployment!=="GH_PAGES_PREVIEW_ONLY"||d.official_source_policy!=="FSSAI_FOSCOS_ONLY"||
 d.ctr_source!==pmsvB21Ctr||d.canonical_total!==533||d.conditional_reference!==498||
 d.first_exact_source_pending!==35||d.review_cases!==35||d.research_only_prior_conditional!==3||
 d.research_only_previous_seven!==7||d.research_only_coffee_candidate!==1||
 d.without_additional_named_research!==24||d.source_status_never_approved!==true||
 d.cases?.length!==35||d.states?.length!==4||
 d.future_amendment_effective!=="2026-12-01"||
 d.future_amendment_auto_activated!==false||
 d.results?.new_first_exact_matches!==0||d.results?.new_numeric_thresholds!==0||
 d.results?.independent_legal_approvals!==0||d.results?.lot_passes!==0||
 d.results?.ledger_changed!==false||d.results?.wordpress_changed!==false||
 pmsv498Ledger.first_source_pending!==35)return false;
 const seen=new Set(),ref17=new Map(pmsvB17Data.all_pending_cases.map(x=>[x.catalog_id,x]));
 const live=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 const expected={PREVIOUS_THREE_CONDITIONAL:3,PREVIOUS_SEVEN_RESEARCH:7,B17_ADDITIONAL_NAMED_COMMODITY_RESEARCH:1,NO_SPECIFIC_NEW_CANDIDATE:24};
 const count=Object.fromEntries(Object.keys(expected).map(k=>[k,0]));
 for(let i=0;i<35;i++){
  const x=d.cases[i],a=pmsvB14Data.cases[i],b=pmsvB20Data.cases[i],c=ref17.get(x?.catalog_id);
  if(!x||!a||!b||!c||seen.has(x.catalog_id)||
   x.rank!==i+1||x.catalog_id!==a.catalog_id||x.catalog_id!==b.catalog_id||
   x.product_name!==a.product_name||x.product_name!==c.product_name||
   x.fssr!==a.fssr||x.fcs!==a.fcs||x.priority!==a.priority||
   x.primary_blocker!==a.primary_blocker||x.prior_research_route!==c.research_state||
   JSON.stringify(x.expected_article_risk_ids)!==JSON.stringify(b.rule_ids)||
   !Object.hasOwn(count,x.prior_research_route)||
   x.official_named_article_proven!==false||x.current_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   live.get(x.catalog_id)?.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.documentary_verified!==false||x.numeric_limit_approved!==false||
   x.lot_compliance_pass!==false)return false;
  count[x.prior_research_route]++;seen.add(x.catalog_id);
 }
 return seen.size===35&&Object.keys(expected).every(k=>count[k]===expected[k]);
}
function pmsvB21Assess(id,form,received,risk){
 const c=pmsvB21Data?.cases.find(x=>x.catalog_id===id);
 if(!c||!risk||risk.id!==id)return null;
 const f=form||{},proof=Array.isArray(received)&&received.length===4?received:[false,false,false,false];
 const fields=["finished_identity","source_article","source_url","analyte","analytical_basis","document_reference","reviewer"];
 const missing=fields.filter(k=>!String(f[k]??"").trim());
 const receiptCount=proof.filter(Boolean).length;
 const hasSource=!!String(f.source_article||"").trim(),article=String(f.source_article||"").trim().toLowerCase().replace(/\s+/g," ");
 const generic=article==="foods not specified"||article==="all foods";
 const official=!!String(f.source_url||"").trim()&&typeof pmsvB14OfficialUrl==="function"&&pmsvB14OfficialUrl(String(f.source_url));
 const targetRef=String(f.source_url||"").trim();
 const ctrDirect=official&&(targetRef===pmsvB21Ctr||targetRef===pmsvB21Ctr.replace("https://fssai.gov.in/","https://www.fssai.gov.in/"));
 const challenge=risk.issues.filter(x=>x.level!=="MISSING_EVIDENCE");
 if(official&&!ctrDirect&&hasSource)challenge.push({code:"OFFICIAL_SOURCE_LINK_NEEDS_CTR_ARTICLE_CHECK",level:"SOURCE_SPECIFICITY",reason:"The cited official FSSAI page is not the pinned CTR IX source; verify the exact contaminant article in the current legal text."});
 const started=risk.status!=="NOT_STARTED"||!!String(f.lot_reference||"").trim();
 const status=!started?"NOT_STARTED":
 challenge.length?"ARTICLE_SCOPE_REVIEW_REQUIRED":
 missing.length||receiptCount!==4||!official||generic?"EVIDENCE_INCOMPLETE":
 "REVIEW_PACKET_PREPARED_UNVERIFIED";
 const next=status==="NOT_STARTED"?"Start source-article and finished-product evidence":
 status==="ARTICLE_SCOPE_REVIEW_REQUIRED"?"Resolve "+challenge[0].code+" using the operative FSSAI text":
 missing.length?"Complete "+missing[0]+" and the remaining unverified receipt slots":
 receiptCount<4?"Collect "+(4-receiptCount)+" missing document receipt(s)":
 generic?"Prove whether a named commodity row takes priority for this analyte":
 "Prepare packet for independent legal-source review; do not mark product PASS";
 return {id,product_name:c.product_name,priority:c.priority,blocker:c.primary_blocker,
 research_route:c.prior_research_route,status,missing_fields:missing,receipts:receiptCount,
 issues:challenge,source_url_direct_ctr:ctrDirect,
 next_action:next,documentary_approved:false,legal_source_approved:false,lab_pass:false};
}
/* Reuse a freshly passed B21 gate only within the same synchronous render.
 * Standalone public inquiries remain independently source-verified. */
function pmsvB21AllVerified(){
 const forms=pmsvB14Read(),records=pmsvB5Read(),audit=pmsvB20All();
 const byAudit=new Map(audit.map(x=>[x.id,x]));
 return pmsvB21Data.cases.map(x=>pmsvB21Assess(x.catalog_id,forms[x.catalog_id],
 records[x.catalog_id]?.received,byAudit.get(x.catalog_id)));
}
function pmsvB21All(){
 if(!pmsvB21Valid())return [];
 return pmsvB21AllVerified();
}
const pmsvB21Rank={ARTICLE_SCOPE_REVIEW_REQUIRED:0,REVIEW_PACKET_PREPARED_UNVERIFIED:1,EVIDENCE_INCOMPLETE:2,NOT_STARTED:3};
function pmsvB21Sorted(all){
 return all.slice().sort((a,b)=>pmsvB21Rank[a.status]-pmsvB21Rank[b.status]||
 (a.priority.startsWith("P1")?0:a.priority.startsWith("P2")?1:2)-
 (b.priority.startsWith("P1")?0:b.priority.startsWith("P2")?1:2)||
 a.product_name.localeCompare(b.product_name));
}
function pmsvB21Filtered(rows){
 const q=pmsvB21Text.toLowerCase().trim();
 return rows.filter(x=>(pmsvB21Status==="ALL"||pmsvB21Status===x.status)&&
 (!q||x.product_name.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)||
 x.issues.some(i=>i.code.toLowerCase().includes(q))));
}
function pmsvB21Stats(rows){
 const s={NOT_STARTED:0,EVIDENCE_INCOMPLETE:0,ARTICLE_SCOPE_REVIEW_REQUIRED:0,REVIEW_PACKET_PREPARED_UNVERIFIED:0};
 for(const x of rows)s[x.status]++;return s;
}
function pmsvB21TableRows(rows){
 const e=pmsvB14Esc;
 return rows.map(x=>'<tr><td><b>'+e(x.product_name)+'</b><small style="display:block">'+e(x.id)+'</small></td>'+
 '<td>'+e(x.status.replaceAll("_"," "))+'<small style="display:block">'+x.receipts+'/4 receipts · '+x.missing_fields.length+' fields missing</small></td>'+
 '<td>'+e(x.next_action)+'</td><td><button type="button" class="secondary-btn" data-pmsv-b21-open="'+e(x.id)+'">Open evidence</button></td></tr>').join("");
}
function pmsvB21DashboardHtmlVerified(){
 const all=pmsvB21AllVerified(),stats=pmsvB21Stats(all),visible=pmsvB21Filtered(pmsvB21Sorted(all));
 return '<details class="card" id="pmsv-b21-readiness" style="margin-bottom:12px">'+
 '<summary><b>Batch21 · prioritize 35 actual legal-source evidence drafts</b></summary>'+
 '<div class="notice"><b>35 exact legal sources still pending.</b> Draft readiness never means regulatory article approved, numerics applied or lot passed. 3 prior conditional + 8 named research-only hypotheses, 24 without additional named hypotheses.</div>'+
 '<p data-pmsv-b21-stats>'+stats.ARTICLE_SCOPE_REVIEW_REQUIRED+' source challenges · '+stats.REVIEW_PACKET_PREPARED_UNVERIFIED+' prepared but unverified · '+stats.EVIDENCE_INCOMPLETE+' incomplete · '+stats.NOT_STARTED+' not started</p>'+
 '<p><label>Find case or flag <input data-pmsv-b21-search type="search" placeholder="Search product, ID or issue" /></label>'+
 ' <label>Show <select data-pmsv-b21-status><option value="ALL">All 35</option><option value="ARTICLE_SCOPE_REVIEW_REQUIRED">Source challenges</option>'+
 '<option value="REVIEW_PACKET_PREPARED_UNVERIFIED">Prepared (unverified)</option>'+
 '<option value="EVIDENCE_INCOMPLETE">Incomplete</option><option value="NOT_STARTED">Not started</option></select></label></p>'+
 '<p><button type="button" data-pmsv-b21-export>Export evidence-readiness report (CSV; no reviewer notes)</button></p>'+
 '<div class="tablewrap"><table><thead><tr><th>Product</th><th>Document status (not compliance)</th><th>Next step</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b21-rows>'+pmsvB21TableRows(visible)+'</tbody></table></div>'+
 '<small data-pmsv-b21-found>'+visible.length+' of 35 cases shown. All reviews are browser-local; draft text is excluded from the CSV.</small></details>';
}
function pmsvB21DashboardHtml(){
 if(!pmsvB21Valid())return "";
 return pmsvB21DashboardHtmlVerified();
}
function pmsvB21RefreshVerified(){
 if(typeof document==="undefined")return;
 const root=document.getElementById("pmsv-b21-readiness");
 const host=document.getElementById("pmsv-b14-review-index")||document.getElementById("selectedProductStandardContent");
 if(!host)return;
 if(!root){host.insertAdjacentHTML("beforebegin",pmsvB21DashboardHtmlVerified());return}
 const all=pmsvB21AllVerified(),s=pmsvB21Stats(all),shown=pmsvB21Filtered(pmsvB21Sorted(all));
 const stats=root.querySelector("[data-pmsv-b21-stats]"),body=root.querySelector("[data-pmsv-b21-rows]"),
 count=root.querySelector("[data-pmsv-b21-found]");
 if(stats)stats.textContent=s.ARTICLE_SCOPE_REVIEW_REQUIRED+" source challenges · "+s.REVIEW_PACKET_PREPARED_UNVERIFIED+" prepared but unverified · "+s.EVIDENCE_INCOMPLETE+" incomplete · "+s.NOT_STARTED+" not started";
 if(body)body.innerHTML=pmsvB21TableRows(shown);
 if(count)count.textContent=shown.length+" of 35 cases shown. This is not a compliance decision.";
}
function pmsvB21Refresh(){
 if(!pmsvB21Valid())return;
 pmsvB21RefreshVerified();
}
function pmsvB21Csv(rows){
 const quote=v=>'"'+String(v??"").replaceAll('"','""').replace(/[\r\n]+/g," ")+'"';
 const head=["Product ID","Product","Priority","Research source stage","Review status (unverified)","Receipts (unverified)","Missing fields","Article challenge flags","Next action","Exact source approved","Lab PASS"];
 return [head,...rows.map(x=>[x.id,x.product_name,x.priority,x.research_route,x.status,x.receipts,
 x.missing_fields.join(" | "),x.issues.map(z=>z.code).join(" | "),x.next_action,"NO","NO"])].map(r=>r.map(quote).join(",")).join("\r\n")+"\r\n";
}
function pmsvB21Export(){
 if(typeof document==="undefined"||!pmsvB21Valid())return;
 const csv=pmsvB21Csv(pmsvB21Sorted(pmsvB21All()));
 const b=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
 const u=URL.createObjectURL(b),a=document.createElement("a");
 a.href=u;a.download="PMSV-FSSAI-B21-35-Evidence-Readiness-UNVERIFIED.csv";
 document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);
}
function pmsvB21Open(id){
 if(typeof document==="undefined"||!pmsvB21Valid()||!pmsvB21Data.cases.some(x=>x.catalog_id===id))return false;
 const panel=document.getElementById("pmsv-b14-review-index");
 const sel=panel?.querySelector("[data-pmsv-b14-select]");
 if(!sel)return false;
 panel.open=true;sel.value=id;
 sel.dispatchEvent(new Event("input",{bubbles:true}));
 panel.scrollIntoView?.({block:"start",behavior:"smooth"});
 return true;
}
/* Replace the Batch20 DOM update with a state-preserving variant.
 * Batch20 calls this on every reviewer keypress: never collapse an open audit
 * or overwrite focused reviewer fields. */
const pmsvB21OldB20Ensure=pmsvB20Ensure;
pmsvB20Ensure=function(){
 if(typeof document==="undefined")return;
 const before=document.getElementById("pmsv-b20-audit"),wasOpen=before?.open===true;
 pmsvB21OldB20Ensure();
 const after=document.getElementById("pmsv-b20-audit");
 if(after&&wasOpen)after.open=true;
 pmsvB21Refresh();
};
/* Batch15 performs imported localStorage commits within its click handler.
 * Refresh the new and old audit immediately after a successful transfer. */
const pmsvB21OldCommit=pmsvB15CommitTransfer;
pmsvB15CommitTransfer=function(packet){
 const ok=pmsvB21OldCommit(packet);
 if(ok){pmsvB20Ensure();pmsvB21Refresh()}
 return ok;
};
const pmsvB21PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB21PreviousLoad();pmsvB21Data=null;
 try{const r=await fetch(pmsvB21Path+"?v=20261014-b21",{cache:"reload"});
  if(!r.ok)throw Error("Source readiness data unavailable");
  pmsvB21Data=await r.json();if(!pmsvB21Valid())throw Error("Source readiness integrity error");
  // Batch107: avoid a second cold DOM/source scan before B22 final sync.
  if(typeof pmsvB22StartupState==="undefined"||pmsvB22StartupState!=="RUNNING")pmsvB21Refresh();
 }catch(_){pmsvB21Data=null;}
};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.hasAttribute?.("data-pmsv-b21-search")){
   pmsvB21Text=String(ev.target.value||"").slice(0,200);pmsvB21Refresh();
  }else if(ev.target?.closest?.("[data-pmsv-b14-case]"))pmsvB21Refresh();
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.hasAttribute?.("data-pmsv-b21-status")){
   const v=ev.target.value;
   if(v==="ALL"||pmsvB21Data?.states?.includes(v)){pmsvB21Status=v;pmsvB21Refresh();}
  }
 });
 document.addEventListener("click",ev=>{
  const target=ev.target?.closest?.("[data-pmsv-b21-export],[data-pmsv-b21-open]");
  if(!target)return;
  if(target.hasAttribute("data-pmsv-b21-export"))pmsvB21Export();
  else pmsvB21Open(target.getAttribute("data-pmsv-b21-open"));
 });
}
