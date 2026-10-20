(function(){"use strict";
/* PMSV Batch91: temporary, private-in-browser metadata workbench for 35 HELD cases.
 * NEVER upload confidential documents to this publicly hosted preview. Never store
 * records, infer proof receipt or approve an article, assay, CoA, lot or product.
 */
var FIELDS=["case_id","request_id","priority","rank","role","gate","phase","evidence_reference","document_date"];
var refs=new Map(), chosen="", sourceRows=null, lastError="";
var ROLE_ORDER=[
 "FSSAI_QA_DIVISION_AND_LAB_DIRECTOR",
 "MANUFACTURER_OR_SUPPLIER_QA",
 "REGULATORY_AFFAIRS_LEGAL",
 "LABORATORY_TECHNICAL_MANAGER",
 "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"
];
function node(tag,attributes,text){
 var el=document.createElement(tag);
 Object.entries(attributes||{}).forEach(function(pair){el.setAttribute(pair[0],pair[1])});
 if(text!==undefined)el.textContent=String(text);
 return el;
}
function validate(){
 try{
  var b87=window.pmsvB87Catalogue, b58=window.pmsvB58OwnerOutreach;
  if(!b87?.closureVerified?.()||!b58?.valid?.()||
     !window.pmsvB59CTRSourceCrosswalk?.valid?.())return null;
  var s=b87.closedResearchSummary?.();
  if(!s||s.catalogue!==533||s.public_source_desk_research_closed!==35||
     s.public_source_desk_research_open!==0||s.external_legal_and_lot_verification_held!==35||
     s.signed_product_limits!==0||s.validated_lab_lot_pass!==0||s.product_releases!==0)return null;
  var cases=window.pmsvB59CTRSourceCrosswalk.getAllCases?.();
  var requests=b58.records?.();
  if(!Array.isArray(cases)||cases.length!==35||!Array.isArray(requests)||requests.length!==175)return null;
  var map=new Map(), ids=new Set(),roleCounts=new Map(),ready=0,dependent=0,p0=0,p1=0;
  for(var c of cases){
   if(!c||map.has(c.catalogue_id)||!Array.isArray(c.original_request_ids)||
      c.original_request_ids.length!==5||new Set(c.original_request_ids).size!==5||
      c.case_signed_legal_applicability!==false||c.actual_market_material_authenticated!==false||
      c.method_and_lab_scope_approved!==false||c.representative_lot_pass!==false)return null;
   if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else return null;
   map.set(c.catalogue_id,{item:c,rows:[]});
  }
  for(var r of requests){
   var item=map.get(r?.case_id);
   if(!item||ids.has(r.request_id)||r.rank!==item.item.rank||
     r.product!==item.item.product_name||r.analyte!==item.item.analyte||
     r.priority!==item.item.priority||!item.item.original_request_ids.includes(r.request_id)||
     !ROLE_ORDER.includes(r.role)||typeof r.evidence!=="string"||!r.evidence||
     r.original_document_status!=="NOT_RECEIVED"||r.original_request_status!=="NOT_SENT")return null;
   var phase="";
   if(r.routing==="REQUEST_PREPARATION_POSSIBLE"&&r.dependencies===""){phase="PREPARE_ONLY";ready++}
   else if(r.routing==="WAIT_FOR_UPSTREAM_EVIDENCE"&&r.dependencies){phase="DEPENDENT";dependent++}
   else return null;
   ids.add(r.request_id);
   roleCounts.set(r.role,(roleCounts.get(r.role)||0)+1);
   item.rows.push(Object.freeze({case_id:r.case_id,request_id:r.request_id,priority:r.priority,
      rank:String(r.rank),role:r.role,gate:r.gate,phase:phase,evidence:r.evidence,
      dependencies:r.dependencies}));
  }
  if(map.size!==35||ids.size!==175||p0!==13||p1!==22||
     ready!==70||dependent!==105||ROLE_ORDER.some(function(k){return roleCounts.get(k)!==35}))return null;
  for(var entry of map.values()){
   if(entry.rows.length!==5||new Set(entry.rows.map(function(r){return r.role})).size!==5||
      entry.rows.filter(function(r){return r.phase==="PREPARE_ONLY"}).length!==2||
      entry.rows.filter(function(r){return r.phase==="DEPENDENT"}).length!==3)return null;
   entry.rows.sort(function(a,b){return ROLE_ORDER.indexOf(a.role)-ROLE_ORDER.indexOf(b.role)});
  }
  return [...map.values()].sort(function(a,b){return a.item.rank-b.item.rank});
 }catch(_){return null}
}
function ensure(){
 var all=validate();
 if(!all){sourceRows=null;lastError="Trusted 35-case source records not READY. No entry or export is permitted.";status(lastError);return false}
 sourceRows=all;
 if(!chosen||!all.some(function(x){return x.item.catalogue_id===chosen}))chosen=all[0].item.catalogue_id;
 return true;
}
function status(msg){
 var el=document.querySelector("#pmsv-b91-evidence-register [data-b91-status]");
 if(el)el.textContent=msg;
}
function safeRef(s){
 return typeof s==="string"&&s.length<=120&&(!s||/^[A-Za-z0-9][A-Za-z0-9 _./:#()-]*$/.test(s))&&
   !/^[=+@-]/.test(s)&&!/[<>"'\n\r\t]/.test(s);
}
function validDate(v){
 if(v==="")return true;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
 var d=new Date(v+"T00:00:00Z");
 return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===v;
}
function checkEntry(reference,date){
 return safeRef(reference)&&validDate(date)&&(!date||!!reference);
}
function noteFor(id){return refs.get(id)||{evidence_reference:"",document_date:""}}
function count(){return sourceRows?sourceRows.flatMap(function(x){return x.rows}).filter(function(r){return !!noteFor(r.request_id).evidence_reference}).length:0}
function build(){
 if(!ensure())return false;
 var box=document.getElementById("pmsv-b91-evidence-register");
 if(!box)return false;
 var select=box.querySelector("[data-b91-case]"),previous=select.value;
 select.replaceChildren();
 for(var c of sourceRows){
  var op=node("option",{value:c.item.catalogue_id},
   "#"+c.item.rank+" "+c.item.priority+" · "+c.item.product_name+" — "+c.item.analyte);
  select.appendChild(op);
 }
 if(previous&&sourceRows.some(function(c){return c.item.catalogue_id===previous}))chosen=previous;
 select.value=chosen;
 var current=sourceRows.find(function(c){return c.item.catalogue_id===chosen});
 var summary=box.querySelector("[data-b91-summary]");
 summary.replaceChildren();
 summary.appendChild(node("p",{}, "References entered: "+count()+"/175 · Original requests: 70 preparation-ready / 105 dependent · 35 commercial cases HELD · 0 regulatory approvals or lot releases."));
 summary.appendChild(node("p",{},"#"+current.item.rank+" "+current.item.priority+" · "+current.item.product_name+" / "+current.item.analyte+". Enter a document reference only; this does NOT prove authenticity or receipt. Source research is closed, but legal, method and lot sign-offs are not."));
 var area=box.querySelector("[data-b91-gates]");area.replaceChildren();
 for(var r of current.rows){
  var section=node("section",{class:"pmsv-b91-gate"});
  section.appendChild(node("b",{},r.request_id+" · "+r.role.replaceAll("_"," ")));
  section.appendChild(node("p",{},r.evidence));
  section.appendChild(node("p",{class:"pmsv-b91-muted"},
    (r.phase==="PREPARE_ONLY"?"Preparation possible; original request NOT SENT":
     "Requires upstream proof before request; original request NOT SENT")+
    (r.dependencies?" · Depends on: "+r.dependencies:"")));
  var data=noteFor(r.request_id);
  var label=node("label",{},"Local evidence reference (metadata, not document content)");
  var input=node("input",{type:"text",maxlength:"120",placeholder:"e.g. SUPPLIER-COA-2026-01",
   "data-b91-reference":r.request_id,autocomplete:"off",spellcheck:"false"});
  input.value=data.evidence_reference;label.appendChild(input);
  section.appendChild(label);
  var dateLabel=node("label",{},"Document date (optional)");
  var date=node("input",{type:"date","data-b91-date":r.request_id});
  date.value=data.document_date;dateLabel.appendChild(date);section.appendChild(dateLabel);
  area.appendChild(section);
 }
 status("Temporary browser-only entries; nothing uploaded or saved. Export CSV before leaving or refreshing. All evidence remains UNVERIFIED.");
 return true;
}
async function load(){
 if(!window.pmsvB87Catalogue?.load)return false;
 status("Checking source integrity before evidence metadata entry…");
 try{
  if(!await window.pmsvB87Catalogue.load()||!ensure())return false;
  return build();
 }catch(_){status("Unable to verify underlying 35-case ledger. Register blocked.");return false}
}
function capture(id,kind,value){
 if(!ensure())return false;
 var all=sourceRows.flatMap(function(c){return c.rows});
 if(!all.some(function(r){return r.request_id===id}))return false;
 var prev=noteFor(id),next={evidence_reference:prev.evidence_reference,document_date:prev.document_date};
 next[kind]=value;
 if(!checkEntry(next.evidence_reference,next.document_date)){
  status("Invalid reference/date: use a plain document ID (max 120 characters), valid ISO date, no formulas or confidential document text.");
  return false;
 }
 if(!next.evidence_reference&&!next.document_date)refs.delete(id);else refs.set(id,next);
 var summary=document.querySelector("#pmsv-b91-evidence-register [data-b91-summary] p");
 if(summary)summary.textContent="References entered: "+count()+"/175 · Original requests: 70 preparation-ready / 105 dependent · 35 commercial cases HELD · 0 regulatory approvals or lot releases.";
 status("Local metadata only. "+count()+"/175 references entered; none authenticated, legally approved or received by PMSV.");
 return true;
}
function quote(value){
 var s=String(value??"");
 if(/^[\s]*[=+@-]/.test(s))s="'"+s;
 return '"'+s.replaceAll('"','""')+'"';
}
function csv(){
 if(!ensure())return"";
 var arr=[FIELDS];
 for(var c of sourceRows)for(var r of c.rows){
  var data=noteFor(r.request_id);
  if(!checkEntry(data.evidence_reference,data.document_date))return"";
  arr.push([r.case_id,r.request_id,r.priority,r.rank,r.role,r.gate,r.phase,
    data.evidence_reference,data.document_date]);
 }
 if(arr.length!==176)return"";
 return arr.map(function(row){return row.map(quote).join(",")}).join("\r\n")+"\r\n";
}
function download(kind){
 if(!ensure())return false;
 var value=csv();if(!value)return false;
 if(kind==="template"){
  var active=refs;refs=new Map();value=csv();refs=active;
  if(!value)return false;
 }
 var u=URL.createObjectURL(new Blob(["\uFEFF"+value],{type:"text/csv;charset=utf-8"}));
 var link=node("a",{href:u,download:kind==="template"?
  "PMSV-B91-175-ORIGINAL-EVIDENCE-REFERENCE-TEMPLATE-HELD.csv":
  "PMSV-B91-175-EVIDENCE-REFERENCE-REGISTER-UNVERIFIED.csv"});
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(function(){URL.revokeObjectURL(u)},1000);
 status("CSV prepared locally: references are not evidence receipt, approved limits, validated methods, or released lots.");
 return true;
}
function parseCSV(txt){
 if(typeof txt!=="string"||txt.length>200000||txt.includes("\0"))throw Error("Invalid or oversized CSV");
 var records=[],row=[],field="",quoted=false,closed=false;
 var s=txt.replace(/^\uFEFF/,"");
 for(var i=0;i<s.length;i++){
  var ch=s[i];
  if(quoted){
   if(ch==='"'&&s[i+1]==='"'){field+='"';i++}
   else if(ch==='"') {quoted=false;closed=true}
   else field+=ch;
  }else if(ch==='"'&&!field&&!closed){quoted=true}
  else if(ch===","){row.push(field);field="";closed=false}
  else if(ch==="\r"||ch==="\n"){
   if(ch==="\r"&&s[i+1]==="\n")i++;
   row.push(field);records.push(row);row=[];field="";closed=false;
  }else{
   if(closed||ch==='"')throw Error("Malformed CSV quotation");
   field+=ch;
  }
 }
 if(quoted)throw Error("Unclosed quoted CSV field");
 if(field||row.length){row.push(field);records.push(row)}
 return records;
}
function importCSV(raw){
 if(!ensure())return{ok:false,error:"Source integrity unavailable"};
 try{
  var rows=parseCSV(raw);
  if(rows.length!==176||rows[0].length!==FIELDS.length||
    !FIELDS.every(function(k,i){return rows[0][i]===k}))throw Error("Expected exact 175-row Batch91 CSV header and schema");
  var known=new Map(sourceRows.flatMap(function(c){return c.rows}).map(function(r){return[r.request_id,r]}));
  var fresh=new Map(),seen=new Set();
  for(var row of rows.slice(1)){
   if(row.length!==FIELDS.length)throw Error("Column count mismatch");
   var orig=known.get(row[1]);
   if(!orig||seen.has(row[1]))throw Error("Unknown or duplicate immutable proof ID");
   var expected=[orig.case_id,orig.request_id,orig.priority,orig.rank,orig.role,orig.gate,orig.phase];
   if(!expected.every(function(x,i){return row[i]===x}))throw Error("Case, role, gate or priority was altered");
   if(!checkEntry(row[7],row[8]))throw Error("Evidence reference or date malformed / unsafe");
   seen.add(row[1]);
   if(row[7])fresh.set(row[1],{evidence_reference:row[7],document_date:row[8]});
  }
  if(seen.size!==175)throw Error("Not all 175 immutable requests are present");
  // Commit only after the entire CSV has validated. No localStorage or network.
  refs=fresh;
  build();
  status("Imported "+count()+" UNVERIFIED reference IDs across 175 exact source-checked requests. No document was uploaded, validated or approved.");
  return{ok:true,count:count()};
 }catch(e){
  lastError=String(e.message||"Invalid CSV");
  status("IMPORT REJECTED: "+lastError+". Existing local entries kept intact.");
  return{ok:false,error:lastError};
 }
}
function install(){
 if(document.getElementById("pmsv-b91-evidence-register"))return true;
 var anchor=document.getElementById("pmsv-b87-catalogue");if(!anchor)return false;
 var box=node("details",{id:"pmsv-b91-evidence-register",class:"card"});
 box.appendChild(node("summary",{},"Batch91 · Original evidence reference workbench · 175 slots / 35 HELD cases"));
 box.appendChild(node("p",{},"For original manufacturer/legal/laboratory/lot documents: capture ONLY document reference IDs and optional dates in this device's temporary memory. DO NOT paste confidential records or upload documents. Research CLOSED is not product compliance. All evidence remains unverified and all commercial cases remain HELD."));
 var actions=node("div",{class:"pmsv-b91-actions"});
 [["load","Verify 35 cases and open register"],["template","Download 175-row blank CSV"],["export","Export current 175-row CSV"]].forEach(function(pair){
  actions.appendChild(node("button",{type:"button","data-b91-action":pair[0]},pair[1]));
 });
 box.appendChild(actions);
 var picker=node("label",{},"Import a previously exported Batch91 CSV (stays on this device)");
 picker.appendChild(node("input",{type:"file",accept:".csv,text/csv","data-b91-import":""}));box.appendChild(picker);
 var selector=node("label",{},"Choose an original HELD case");
 selector.appendChild(node("select",{"data-b91-case":"","aria-label":"HELD case"}));
 box.appendChild(selector);
 box.appendChild(node("p",{"data-b91-status":"",role:"status","aria-live":"polite"},"Click Verify to load 35 original cases. Nothing is saved to a server."));
 box.appendChild(node("div",{"data-b91-summary":""}));
 box.appendChild(node("div",{"data-b91-gates":""}));
 box.appendChild(node("p",{class:"pmsv-b91-muted"},"No electronic signature, original-file authentication, original request delivery, regulatory applicability sign-off, accredited method validation, lot CoA evaluation or release takes place in this workbench."));
 anchor.insertAdjacentElement("afterend",box);
 var style=node("style",{id:"pmsv-b91-css"});
 style.textContent="#pmsv-b91-evidence-register{margin-top:14px;max-width:100%;overflow-wrap:anywhere}#pmsv-b91-evidence-register summary{cursor:pointer;font-weight:800}#pmsv-b91-evidence-register label{display:block;margin:9px 0;font-weight:650}#pmsv-b91-evidence-register input,#pmsv-b91-evidence-register select{display:block;width:100%;max-width:100%;margin-top:5px;padding:9px;border:1px solid #b8c8e0;border-radius:7px}#pmsv-b91-evidence-register .pmsv-b91-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#pmsv-b91-evidence-register .pmsv-b91-actions button{white-space:normal}#pmsv-b91-evidence-register .pmsv-b91-gate{border:1px solid #d6dfe9;border-radius:10px;padding:11px;margin:9px 0;background:#f7f9fd}#pmsv-b91-evidence-register .pmsv-b91-gate p{margin:7px 0;line-height:1.4}#pmsv-b91-evidence-register .pmsv-b91-muted{font-size:12px;color:#596479;line-height:1.5}";
 document.head.appendChild(style);
 return true;
}
document.addEventListener("click",function(e){
 var action=e.target?.closest?.("#pmsv-b91-evidence-register [data-b91-action]")?.dataset.b91Action;
 if(action==="load")load();
 else if(action==="template"||action==="export")download(action);
});
document.addEventListener("change",function(e){
 var t=e.target;if(!t?.closest?.("#pmsv-b91-evidence-register"))return;
 if(t.hasAttribute("data-b91-case")){chosen=t.value;build()}
 else if(t.hasAttribute("data-b91-reference")){
  if(!capture(t.dataset.b91Reference,"evidence_reference",t.value))t.value=noteFor(t.dataset.b91Reference).evidence_reference;
 }else if(t.hasAttribute("data-b91-date")){
  if(!capture(t.dataset.b91Date,"document_date",t.value))t.value=noteFor(t.dataset.b91Date).document_date;
 }else if(t.hasAttribute("data-b91-import")){
  var f=t.files?.[0];t.value="";
  if(!f)return;
  if(f.size>200000){status("IMPORT REJECTED: exceeds 200 KB.");return}
  f.text().then(importCSV).catch(function(){status("IMPORT REJECTED: file could not be read.")});
 }
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvB91EvidenceRegister=Object.freeze({install:install,load:load,validate:validate,
 exportCSV:csv,importCSV:importCSV,capture:capture,count:count,parseCSV:parseCSV});
})();