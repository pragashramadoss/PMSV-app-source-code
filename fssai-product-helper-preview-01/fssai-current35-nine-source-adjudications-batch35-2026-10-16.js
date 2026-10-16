"use strict";
/* Batch35: official source-route adjudication, NOT legal CTR/lot approval.
 * The two Ayurveda recipes are published references, NOT user lot identities.
 * Sajji Khar applications in the June 2026 status register were closed/withdrawn.
 */
var pmsvB35Data=null,pmsvB35Query="",pmsvB35Kind="ALL";
const pmsvB35Path="./data/rules/fssai-current35-nine-source-adjudications-batch35-2026-10-16.json";
const pmsvB35Digest="9eb9184c7bd74dc5";
const pmsvB35Y="EXACT_AYURVEDA_RECIPE_REFERENCE_FOUND_LOT_PENDING";
const pmsvB35C="CLOSED_WITHDRAWN_APPLICATIONS_NOT_APPROVAL";
const pmsvB35U="CLASS_OR_SCHEDULE_ONLY_UNIQUE_FINISHED_IDENTITY_PENDING";
function pmsvB35Valid(){
 if(typeof pmsvB34Valid!=="function"||!pmsvB34Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB35Data||
 pmsvB14Digest(pmsvB35Data)!==pmsvB35Digest)return false;
 const d=pmsvB35Data,n=d.counts;
 if(d.schema_version!=="1.0"||d.as_of!=="2026-10-16"||
 d.kind!=="PMSV_CURRENT35_NINE_DOCUMENTARY_SOURCE_ROUTES_BATCH35"||
 d.deployment!=="GH_PAGES_PREVIEW_ONLY"||d.quality_evidence_only!==true||
 d.official_ctr!==pmsvB26Data.source_reference||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_cases_pending!==35||n.existing_fssr_standards!==26||
 n.reexamined_identity_cases!==9||n.classical_recipe_sources_found!==2||
 n.closed_withdrawn_application_alerts!==1||
 n.umbrella_entries_still_unspecified!==6||n.unverified_actual_product_lots!==9||
 n.finished_ctr_limits_approved!==0||n.lab_passes!==0||n.wordpress_changed!==false||
 d.results?.canonical_ledger_modified!==false||
 d.results?.wordpress_modified!==false||
 d.results?.approved_ctr_exact_article_scope!==0||
 d.results?.real_lot_lab_passes!==0||d.results?.assumed_authorizations!==0||
 d.records?.length!==9||pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const prior=pmsvB34Data.cases.filter(x=>!x.named_product_standard_found);
 const map=new Map(prior.map(x=>[x.catalog_id,x]));
 if(prior.length!==9||map.size!==9)return false;
 let ayu=0,closed=0,umbrella=0;
 const seen=new Set();
 for(const x of d.records){
  const p=map.get(x.catalog_id);
  if(!p||seen.has(x.catalog_id)||x.rank!==p.rank||
   x.product_name!==p.product_name||x.fssr!==p.fssr||
   x.fcs!==p.fcs||x.prior_blocker!==p.primary_blocker||
   !x.official_source_scope||!x.documentary_checklist?.length||
   !Array.isArray(x.source_refs)||!x.source_refs.length||
   x.source_refs.some(s=>!/^https:\/\/(?:(?:www|fcstraining|stg-old)\.)?fssai\.gov\.in\//.test(s.url)||!s.type||!s.label)||
   x.actual_market_product_recipe_confirmed!==false||
   x.market_lot_lab_verified!==false||
   x.legal_finished_product_authorization_approved!==false||
   x.ctr_exact_article_scope_confirmed!==false||
   x.finished_ctr_numeric_limit_applied!==false||
   x.compliance_pass!==false)return false;
  seen.add(x.catalog_id);
  if(x.source_class===pmsvB35Y){
   ayu++;
   if(!x.recipe||x.recipe.ingredients?.length<2||
    !x.recipe.method||!x.recipe.published_best_use||
    !x.source_refs.some(s=>s.type==="OFFICIAL_RECIPE"))return false;
  }else if(x.source_class===pmsvB35C){
   closed++;
   if(x.catalog_id!=="99-99-1-sajji-khar"||
    x.application_status!=="CLOSED_OR_WITHDRAWN"||
    x.application_ids?.length!==4||x.not_a_general_ban!==true||
    !x.source_refs.some(s=>s.type==="OFFICIAL_APPLICATION_STATUS"))return false;
  }else if(x.source_class===pmsvB35U){
   umbrella++;
   if(x.recipe!==null||x.application_status!==null)return false;
  }else return false;
 }
 const milk=d.records.find(x=>x.catalog_id.includes("ksheerapaka"));
 const coconut=d.records.find(x=>x.catalog_id.includes("narikela-ksheerika"));
 return ayu===2&&closed===1&&umbrella===6&&seen.size===9&&
 milk?.recipe?.ingredients?.length===4&&
 milk.recipe.ingredients.some(x=>x.name==="Buffalo milk")&&
 !milk.recipe.ingredients.some(x=>/four milks/i.test(x.name))&&
 coconut?.recipe?.ingredients?.length===2;
}
function pmsvB35Filtered(){
 if(!pmsvB35Valid())return [];
 const q=pmsvB35Query.trim().toLowerCase();
 return pmsvB35Data.records.filter(x=>
  (pmsvB35Kind==="ALL"||x.source_class===pmsvB35Kind)&&
  (!q||[x.product_name,x.catalog_id,x.official_source_scope,
   x.source_class,...x.documentary_checklist].some(z=>String(z).toLowerCase().includes(q))));
}
function pmsvB35Short(x){
 return x.source_class===pmsvB35Y?"Published Ayurveda recipe; batch pending":
 x.source_class===pmsvB35C?"Closed/withdrawn — no application approval":
 "Umbrella class — exact INS/formula pending";
}
function pmsvB35Links(x){
 const e=pmsvB14Esc;
 return x.source_refs.map(s=>
 '<a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer">'+e(s.label)+'</a>').join(" · ");
}
function pmsvB35Row(x){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(x.product_name)+'</b></td>'+
 '<td><b>'+e(pmsvB35Short(x))+'</b></td>'+
 '<td>'+e(x.official_source_scope)+'</td>'+
 '<td>'+e(x.documentary_checklist[0])+'</td>'+
 '<td>'+pmsvB35Links(x)+'<div><button type="button" data-pmsv-b35-open="'+
 e(x.catalog_id)+'">Open full evidence</button></div></td></tr>';
}
function pmsvB35Panel(){
 if(!pmsvB35Valid())return "";
 return '<details class="card" id="pmsv-b35-nine-source-routes" style="margin-bottom:12px">'+
 '<summary><b>Batch35 · nine remaining FSSAI documentary routes</b> — two Ayurveda recipes, Sajji status, six umbrella classes</summary>'+
 '<div class="notice"><b>Regulatory safeguard:</b> named recipe ≠ real finished lot; a CLOSED/WITHDRAWN FSSAI application ≠ approval; and additive usage tables ≠ CTR contaminant limits. Exactly 35 cases still await a legally proven CTR article. No automatic PASS or WordPress modification.</div>'+
 '<p><label>Find product/source <input type="search" data-pmsv-b35-query placeholder="sajji, ksheerapaka, enzyme, schedule" /></label></p>'+
 '<p><label>Research status <select data-pmsv-b35-kind>'+
 '<option value="ALL">All nine dossiers</option>'+
 '<option value="'+pmsvB35Y+'">2 official classical recipes</option>'+
 '<option value="'+pmsvB35C+'">1 closed/withdrawn application alert</option>'+
 '<option value="'+pmsvB35U+'">6 broad additive / ingredient classes</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b35-count>'+pmsvB35Filtered().length+' of 9 research dossiers, zero CTR limits applied</p>'+
 '<div class="tablewrap" style="max-height:600px;overflow:auto"><table><thead><tr>'+
 '<th>Catalogue article</th><th>Source status</th><th>Official documentary conclusion</th>'+
 '<th>Next evidence required</th><th>Sources</th></tr></thead><tbody data-pmsv-b35-rows>'+
 pmsvB35Filtered().map(pmsvB35Row).join("")+'</tbody></table></div></details>';
}
function pmsvB35Refresh(){
 if(typeof document==="undefined"||!pmsvB35Valid())return;
 const host=document.getElementById("pmsv-b34-remaining16-sources")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const el=document.getElementById("pmsv-b35-nine-source-routes");
 if(!el){host.insertAdjacentHTML("beforebegin",pmsvB35Panel());return}
 const rows=el.querySelector("[data-pmsv-b35-rows]"),stat=el.querySelector("[data-pmsv-b35-count]");
 if(rows)rows.innerHTML=pmsvB35Filtered().map(pmsvB35Row).join("");
 if(stat)stat.textContent=pmsvB35Filtered().length+" of 9 dossiers; all 35 CTR exact-article cases pending.";
}
function pmsvB35PerProduct(p){
 if(!p||!pmsvB35Valid())return "";
 const x=pmsvB35Data.records.find(r=>r.catalog_id===p.id);
 if(!x||x.product_name!==p.name||
 String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 const rec=x.recipe?
 '<p><b>Published recipe:</b> '+e(x.recipe.name)+'</p>'+
 '<ul>'+x.recipe.ingredients.map(a=>
 '<li>'+e(a.name)+' — '+e(a.amount)+'</li>').join("")+'</ul>'+
 '<p><b>Traditional method:</b> '+e(x.recipe.method)+'</p>'+
 '<p><b>Classical best-use reference:</b> '+e(x.recipe.published_best_use)+'</p>':"";
 const status=x.application_status?
 '<p><b>FSSAI application register:</b> '+e(x.application_status)+
 '; examples: '+x.application_ids.map(e).join(", ")+
 '. This does not establish a general prohibition.</p>':"";
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch35 · '+e(pmsvB35Short(x))+'</b></summary>'+
 '<p>'+e(x.official_source_scope)+'</p>'+rec+status+
 '<p><b>Documentary evidence required:</b></p><ol>'+
 x.documentary_checklist.map(a=>'<li>'+e(a)+'</li>').join("")+'</ol>'+
 '<p><b>Official references:</b> '+pmsvB35Links(x)+'</p>'+
 '<div class="notice">No real batch identity, legal finished-food CTR article, contaminant limit or laboratory conformity PASS approved.</div></details>';
}
const pmsvB35OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB35OldLoad();pmsvB35Data=null;
 try{
  const r=await fetch(pmsvB35Path+"?v=20261016-b35",{cache:"reload"});
  if(!r.ok)throw Error("Batch35 source routes unavailable");
  pmsvB35Data=await r.json();
  if(!pmsvB35Valid())throw Error("Batch35 identity and source integrity failed");
  pmsvB35Refresh();
 }catch(_){pmsvB35Data=null;}
};
const pmsvB35OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB35PerProduct(p)+pmsvB35OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b35-query]")){
   pmsvB35Query=String(ev.target.value||"").slice(0,150);
   pmsvB35Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b35-kind]")){
   const v=ev.target.value;
   if(["ALL",pmsvB35Y,pmsvB35C,pmsvB35U].includes(v)){
    pmsvB35Kind=v;pmsvB35Refresh();
   }
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b35-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b35-open"));
 });
}
