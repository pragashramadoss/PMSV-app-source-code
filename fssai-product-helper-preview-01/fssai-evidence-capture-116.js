"use strict";
// PMSV 116 current pending first-source cases. Local evidence gathering ONLY.
// A checked box does NOT confirm source applicability, legal compliance,
// contaminant limits, lab testing, or promotion to first-exact-match.
var pmsv116LocalKey="pmsv:fssai:pending-proof:v1:";
function pmsv116Rec(p){
 return pmsvCurrent116ProofWorklist?.records?.find(x=>
  x.catalog_id===p?.id&&x.product_name===p?.name&&
  String(x.fssr||"")===String(p.fssr||"")&&String(x.fcs||"")===String(p.fcs||""))||null;
}
function pmsv116Valid(p){
 return !!pmsv116Rec(p)&&
 typeof pmsvCurrent116DocumentaryIntegrity==="function"&&pmsvCurrent116DocumentaryIntegrity()&&
 pmsvCurrent533SourceLedger?.records?.some(x=>x.catalog_id===p.id&&x.source_status==="FIRST_EXACT_SOURCE_PENDING");
}
function pmsv116Safe(x){
 return typeof esc==="function"?esc(x):String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function pmsv116Fingerprint(r){return pmsvReviewSnapshotDigest([r.catalog_id,r.proof_branches]);}
function pmsv116Empty(r){
 return {schema:1,id:r.catalog_id,fingerprint:pmsv116Fingerprint(r),branch:-1,marked:[],notes:""};
}
function pmsv116Read(r){
 const empty=pmsv116Empty(r);
 try{
  const v=JSON.parse(localStorage.getItem(pmsv116LocalKey+r.catalog_id)||"null");
  if(!v||v.schema!==1||v.id!==r.catalog_id||v.fingerprint!==empty.fingerprint||
     !Number.isInteger(v.branch)||v.branch< -1||v.branch>=r.proof_branches.length||
     !Array.isArray(v.marked)||typeof v.notes!=="string")return empty;
  const size=r.proof_branches[v.branch]?.required_evidence?.length||0;
  return {...empty,branch:v.branch,marked:[...new Set(v.marked.filter(x=>Number.isInteger(x)&&x>=0&&x<size))],
   notes:v.notes.slice(0,2000)};
 }catch(_){return empty}
}
function pmsv116Save(r,v){
 try{localStorage.setItem(pmsv116LocalKey+r.catalog_id,JSON.stringify(v));return true}
 catch(_){return false}
}
function pmsv116GetAuthorized(id){
 const r=pmsvCurrent116ProofWorklist?.records?.find(x=>x.catalog_id===id);
 return r&&pmsv116Valid({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs})?r:null;
}
function pmsv116SetBranch(id,raw){
 const r=pmsv116GetAuthorized(id),v=r&&pmsv116Read(r),n=Number(raw);
 if(!r||!Number.isInteger(n)||n< -1||n>=r.proof_branches.length)return false;
 v.branch=n;v.marked=[];
 if(!pmsv116Save(r,v))return false;
 pmsv116Redraw(r);return true;
}
function pmsv116Mark(id,raw,available){
 const r=pmsv116GetAuthorized(id),v=r&&pmsv116Read(r),n=Number(raw);
 if(!r||!v||v.branch===-1||!Number.isInteger(n)||n<0||
    n>=r.proof_branches[v.branch].required_evidence.length||typeof available!=="boolean")return false;
 v.marked=v.marked.filter(x=>x!==n);
 if(available)v.marked.push(n);
 v.marked.sort((a,b)=>a-b);
 if(!pmsv116Save(r,v))return false;
 const target=typeof document!=="undefined"?document.getElementById("pmsv116-progress"):null;
 if(target)target.textContent=v.marked.length+" / "+r.proof_branches[v.branch].required_evidence.length+
  " items reported available (not independently verified)";
 return true;
}
function pmsv116Note(id,txt){
 const r=pmsv116GetAuthorized(id);
 if(!r||typeof txt!=="string")return false;
 const v=pmsv116Read(r);v.notes=txt.slice(0,2000);return pmsv116Save(r,v);
}
function pmsv116Clear(id){
 const r=pmsv116GetAuthorized(id);
 if(!r)return false;
 try{localStorage.removeItem(pmsv116LocalKey+id)}catch(_){return false}
 pmsv116Redraw(r);return true;
}
function pmsv116Markup(r){
 const safe=pmsv116Safe,v=pmsv116Read(r),b=r.proof_branches[v.branch];
 const options='<option value="-1"'+(v.branch===-1?' selected':'')+
  '>Finished-product subtype unverified</option>'+r.proof_branches.map((x,i)=>
   '<option value="'+i+'"'+(v.branch===i?' selected':'')+'>'+safe(x.branch)+
   ' — unverified research hypothesis</option>').join("");
 const checklist=b?'<p id="pmsv116-progress">'+v.marked.length+' / '+b.required_evidence.length+
  ' items reported available (not independently verified)</p><ul>'+b.required_evidence.map((t,i)=>
  '<li><label><input type="checkbox" '+(v.marked.includes(i)?"checked ":"")+
  'onchange="pmsv116Mark(\''+safe(r.catalog_id)+'\','+i+',this.checked)"> '+safe(t)+'</label></li>').join("")+
  '</ul>':'<p>No checklist selected. Confirm the finished form, species/composition, process, package and source article first.</p>';
 return '<div class="notice"><b>FIRST EXACT FINISHED-ARTICLE SOURCE: STILL PENDING.</b> Evidence marked available is self-reported; it is neither verified nor a legal, laboratory or compliance PASS.</div>'+
  '<label>Research hypothesis (not a source match)</label><select onchange="pmsv116SetBranch(\''+
   safe(r.catalog_id)+'\',this.value)">'+options+'</select>'+checklist+
  '<label>Local review notes — do not enter sensitive personal information</label>'+
  '<textarea rows="3" maxlength="2000" onchange="pmsv116Note(\''+safe(r.catalog_id)+
   '\',this.value)">'+safe(v.notes)+'</textarea>'+
  '<p><small>Stored only in this browser, not uploaded or independently verified. Clearing site data deletes notes. Source updates invalidate earlier checkmarks. No underlying regulatory records are changed.</small></p>'+
  '<button type="button" onclick="pmsv116Export(\''+safe(r.catalog_id)+
  '\')">Export review packet (.json)</button> <button type="button" onclick="pmsv116Clear(\''+
  safe(r.catalog_id)+'\')">Clear local evidence notes</button>'+
  '<p><small><a target="_blank" rel="noopener noreferrer" href="'+safe(r.official_finished_product_source)+
  '">Official finished-product reference</a> · <a target="_blank" rel="noopener noreferrer" href="'+
  safe(r.official_contaminant_source)+'">Official FSSAI CTR Version IX</a></small></p>';
}
function pmsv116Redraw(r){
 const e=typeof document!=="undefined"?document.getElementById("pmsv116-collector"):null;
 if(e&&e.dataset.productId===r.catalog_id)e.innerHTML=pmsv116Markup(r);
}
function pmsv116Export(id){
 const r=pmsv116GetAuthorized(id);
 if(!r||typeof document==="undefined"||typeof Blob==="undefined")return false;
 const v=pmsv116Read(r),b=r.proof_branches[v.branch];
 const out={schema:"PMSV_LOCAL_FSSAI_RESEARCH_PACKET_V1",
  catalog_id:r.catalog_id,product_name:r.product_name,source_fingerprint:v.fingerprint,
  official_product_source:r.official_finished_product_source,
  official_ctr_source:r.official_contaminant_source,
  selected_hypothesis:b?.branch||null,evidence_prompts:b?.required_evidence||[],
  operator_marked_available:v.marked,analyst_notes:v.notes,
  first_exact_source_verified:false,finished_article_applicability_verified:false,
  numeric_finished_product_limit_applied:false,laboratory_pass:false,
  full_compliance_approval:false,status:"FSSAI_EXACT_FINISHED_ARTICLE_PROOF_REQUIRED"};
 const url=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-FSSAI-review-"+id+".json";a.click();
 URL.revokeObjectURL(url);return true;
}
function pmsv116LocalEvidenceHtml(p){
 const r=pmsv116Rec(p);
 if(!r)return "";
 if(!pmsv116Valid(p))
  return '<div class="notice"><b>116-product local evidence collector withheld.</b> Ledger/source integrity check failed; no limit or PASS applied.</div>';
 return '<details class="card" style="margin-top:12px"><summary><b>Collect missing first-source evidence</b> — '+pmsv116Safe(r.product_name)+
  '</summary><div id="pmsv116-collector" data-product-id="'+pmsv116Safe(r.catalog_id)+'">'+pmsv116Markup(r)+'</div></details>';
}
var pmsv116PriorHtml=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 return pmsv116PriorHtml(p)+pmsv116LocalEvidenceHtml(p);
};