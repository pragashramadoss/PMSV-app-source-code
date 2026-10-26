"use strict";
/* PMSV Batch20: audit user-entered reviewer DRAFTS only. No automatic regulatory decisions. */
var pmsvB20Data=null;
const pmsvB20Path="./data/rules/fssai-current35-review-draft-source-audit-batch20-2026-10-14.json";
const pmsvB20Expected="0f5c799bc17f279a",pmsvB20Ctr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB20Valid(){
 if(typeof pmsvB19Valid!=="function"||!pmsvB19Valid()||!pmsvB20Data||!pmsvB14Data||
 !pmsv35Queue||!pmsvB10Data||!pmsv498Ledger)return false;
 const d=pmsvB20Data,ref=pmsvB10Data.official_rule_rows;
 if(pmsvB16Digest(d)!==pmsvB20Expected||
 d.kind!=="PMSV_BATCH20_REVIEW_DRAFT_LAWFUL_SOURCE_RISK_AUDIT"||
 d.schema_version!=="1.0"||d.as_of!=="2026-10-14"||
 d.scope!=="GH_PAGES_PREVIEW_ONLY"||d.official_sources_only!==true||
 d.ctr_source!==pmsvB20Ctr||d.catalogue!==533||d.partial!==498||
 d.first_exact_pending!==35||d.review_cases!==35||d.reference_rows!==7||
 d.case_specific_nontransfer_rules!==13||d.official_metal_rows?.length!==7||
 d.article_warning_rules?.length!==13||d.cases?.length!==35||
 d.amendment_effective!=="2026-12-01"||d.future_amendment_enabled!==false||
 d.results?.new_first_exact_matches!==0||d.results?.new_active_limits!==0||
 d.results?.verified_lot_results!==0||d.results?.full_compliance_passes!==0||
 d.results?.canonical_ledger_modified!==false||d.results?.wordpress_modified!==false||
 pmsv498Ledger.first_source_pending!==35)return false;
 let checked=0;const knownRules=new Map();
 for(const r of d.article_warning_rules){
  if(!r.id||knownRules.has(r.id)||!["ARTICLE_SCOPE_CHALLENGE","ARTICLE_SCOPE_CONTRADICTION","CONDITIONAL_LEGAL_SCOPE","CONDITIONAL_DOCUMENT_PROOF","CONDITIONAL_PROCESSED_COMMODITY","SUPERSEDED_SOURCE_WARNING","CONDITIONAL_INGREDIENT_SCOPE"].includes(r.severity)||
   !r.ids?.length||!r.phrases?.length||!r.reason||
   r.ids.some(id=>!pmsvB14Data.cases.some(c=>c.catalog_id===id)))return false;
  knownRules.set(r.id,r);
 }
 for(let i=0;i<7;i++){
  const r=d.official_metal_rows[i],o=ref[i];
  if(!r||!o||r.id!==o.id||r.metal!==o.metal||
   r.article!==o.legal_article||r.value!==o.published_reference_value||
   r.unit!==o.unit||r.page!==o.pdf_page_zero_based||r.automatic_limit!==false)return false;
 }
 const live=new Map(pmsv498Ledger.records.map(c=>[c.catalog_id,c]));
 for(let i=0;i<35;i++){
  const x=d.cases[i],o=pmsvB14Data.cases[i],q=pmsv35Queue.review_records[i];
  if(!x||!o||!q||x.rank!==i+1||x.catalog_id!==o.catalog_id||
   x.catalog_id!==q.catalog_id||x.product_name!==o.product_name||
   x.fssr!==o.fssr||x.fcs!==o.fcs||x.legal_blocker!==o.primary_blocker||
   x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   live.get(x.catalog_id)?.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.independent_verification!==false||x.numeric_limit_assigned!==false||
   x.lot_pass!==false)return false;
  const expected=d.article_warning_rules.filter(r=>r.ids.includes(x.catalog_id)).map(r=>r.id);
  if(JSON.stringify(x.rule_ids)!==JSON.stringify(expected))return false;
  checked++;
 }
 return checked===35&&knownRules.size===13;
}
/* Internal path for one already validated, synchronous B20 operation.
 * External pmsvB20Analyze still checks the complete original source graph. */
function pmsvB20AnalyzeVerified(id,form,receipts){
 const p=pmsvB20Data.cases.find(c=>c.catalog_id===id);if(!p)return null;
 const f=form||{},article=String(f.source_article||"").trim(),analyte=String(f.analyte||"").trim();
 const url=String(f.source_url||"").trim(),identity=String(f.finished_identity||"").trim();
 const basis=String(f.analytical_basis||"").trim(),doc=String(f.document_reference||"").trim();
 const proof=Array.isArray(receipts)&&receipts.length===4?receipts:[false,false,false,false];
 const draft=[article,analyte,url,identity,basis,doc,String(f.reviewer||"").trim()].some(Boolean)||proof.some(Boolean);
 const issues=[];
 if(!draft)return {id,product_name:p.product_name,status:"NOT_STARTED",issues:[],receipts:0,legal_approval:false,lab_pass:false};
 const missing=[["ARTICLE_MISSING",article],["ANALYTE_MISSING",analyte],["SOURCE_URL_MISSING",url],["FINISHED_IDENTITY_MISSING",identity],["ANALYTICAL_BASIS_MISSING",basis],["DOCUMENT_REFERENCE_MISSING",doc]];
 for(const [code,value] of missing)if(!value)issues.push({code,level:"MISSING_EVIDENCE",reason:"Reviewer draft lacks "+code.toLowerCase().replaceAll("_"," ")+".",official_ref:pmsvB20Ctr});
 if(url&&typeof pmsvB14OfficialUrl==="function"&&!pmsvB14OfficialUrl(url))
  issues.push({code:"NONOFFICIAL_SOURCE_URL",level:"SOURCE_INTEGRITY",reason:"Reviewer source URL is not an approved FSSAI or FoSCoS official host.",official_ref:pmsvB20Ctr});
 const s=article.toLowerCase().replace(/\s+/g," ");
 if(s==="foods not specified")
  issues.push({code:"GENERIC_METAL_FALLBACK",level:"NAMED_ARTICLE_PRIORITY",reason:"Foods not specified needs a metal-specific named-row priority check, not an assumed specific product match.",official_ref:pmsvB20Ctr});
 if(s==="all foods")
  issues.push({code:"ALL_FOODS_NOT_PRODUCT_ID",level:"NAMED_ARTICLE_PRIORITY",reason:"All foods is the explicit methylmercury reference, not proof of an exact finished-product first source.",official_ref:pmsvB20Ctr});
 if(s==="all foods"&&!/methyl\s*mercury/i.test(analyte))
  issues.push({code:"ANALYTE_ARTICLE_MISMATCH",level:"SOURCE_INTEGRITY",reason:"CTR IX labels the All foods row under methylmercury, not other metals.",official_ref:pmsvB20Ctr});
 for(const r of pmsvB20Data.article_warning_rules){
  if(!r.ids.includes(id))continue;
  const hit=r.phrases.some(q=>r.match==="EXACT"?s===q.toLowerCase():s.includes(q.toLowerCase()));
  if(hit)issues.push({code:r.id,level:r.severity,reason:r.reason,official_ref:pmsvB20Ctr});
 }
 const receiptCount=proof.filter(x=>x===true).length;
 const status=issues.some(x=>!["MISSING_EVIDENCE"].includes(x.level))?"NEEDS_ARTICLE_CHALLENGE_REVIEW":
  issues.length||receiptCount<4?"INCOMPLETE_DRAFT":"DOCUMENTARY_DRAFT_UNVERIFIED";
 return {id,product_name:p.product_name,status,issues,receipts:receiptCount,legal_approval:false,lab_pass:false};
}
function pmsvB20Analyze(id,form,receipts){
 if(!pmsvB20Valid())return null;
 return pmsvB20AnalyzeVerified(id,form,receipts);
}
function pmsvB20AllVerified(){
 const entries=typeof pmsvB14Read==="function"?pmsvB14Read():{};
 const receipt=typeof pmsvB5Read==="function"?pmsvB5Read():{};
 return pmsvB20Data.cases.map(x=>pmsvB20AnalyzeVerified(x.catalog_id,entries[x.catalog_id],receipt[x.catalog_id]?.received));
}
function pmsvB20All(){
 if(!pmsvB20Valid())return [];
 return pmsvB20AllVerified();
}
function pmsvB20Csv(rows){
 const q=x=>'"'+String(x??"").replaceAll('"','""').replace(/[\r\n]+/g," ")+'"';
 const head=["Catalogue ID","Product","Draft state - unverified","Evidence receipts (unverified)","Flag count","Flagged article/code issues","Legal approval","Lab PASS"];
 return [head,...rows.map(r=>[r.id,r.product_name,r.status,r.receipts,r.issues.length,r.issues.map(e=>e.code).join(" | "),"NO","NO"])].map(row=>row.map(q).join(",")).join("\r\n")+"\r\n";
}
function pmsvB20Render(){
 if(!pmsvB20Valid())return "";
 const e=pmsvB14Esc,arr=pmsvB20AllVerified(),stats={NOT_STARTED:0,INCOMPLETE_DRAFT:0,NEEDS_ARTICLE_CHALLENGE_REVIEW:0,DOCUMENTARY_DRAFT_UNVERIFIED:0};
 for(const x of arr)stats[x.status]++;
 return '<details class="card" id="pmsv-b20-audit" style="margin-bottom:12px">'+
 '<summary><b>Batch20 · audit actual first-source reviewer drafts</b> — '+stats.NEEDS_ARTICLE_CHALLENGE_REVIEW+' flagged</summary>'+
 '<div class="notice"><b>NO LEGAL OR LABORATORY PASS.</b> Draft assessment is a screening aid: source-document/finished-article applicability requires independent review.</div>'+
 '<p>'+stats.NOT_STARTED+' not started · '+stats.INCOMPLETE_DRAFT+' incomplete · '+stats.NEEDS_ARTICLE_CHALLENGE_REVIEW+' need article challenge review · '+stats.DOCUMENTARY_DRAFT_UNVERIFIED+' documentary drafts unverified.</p>'+
 '<p><button type="button" data-pmsv-b20-export>Export 35-case article-risk audit CSV</button></p>'+
 '<div class="tablewrap"><table><thead><tr><th>Product</th><th>Review draft</th><th>Flags (not final legal judgement)</th></tr></thead><tbody>'+
 arr.map(x=>'<tr><td>'+e(x.product_name)+'</td><td>'+e(x.status.replaceAll("_"," "))+'</td><td>'+e(x.issues.map(z=>z.code).join(", ")||"—")+'</td></tr>').join("")+
 '</tbody></table></div><small>Official FSSAI CTR IX cross-reference; no user files leave this browser.</small></details>';
}
function pmsvB20Ensure(){
 if(typeof document==="undefined"||!pmsvB20Valid())return;
 const t=document.getElementById("pmsv-b14-review-index")||document.getElementById("selectedProductStandardContent");
 if(!t)return;
 const old=document.getElementById("pmsv-b20-audit");
 if(old)old.outerHTML=pmsvB20Render();else t.insertAdjacentHTML("beforebegin",pmsvB20Render());
}
function pmsvB20Export(){
 if(typeof document==="undefined")return;
 const csv=pmsvB20Csv(pmsvB20All());
 if(!csv.trim())return;
 const b=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(b),a=document.createElement("a");
 a.href=u;a.download="PMSV-CTR-B20-35-Draft-Article-Risk-Audit.csv";
 document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);
}
const pmsvB20PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB20PriorLoad();pmsvB20Data=null;
 try{const r=await fetch(pmsvB20Path+"?v=20261014-b20",{cache:"reload"});
  if(!r.ok)throw Error("Missing Batch20 article audit");
  pmsvB20Data=await r.json();
  if(!pmsvB20Valid())throw Error("Invalid article-audit data");
  pmsvB20Ensure();
 }catch(_){pmsvB20Data=null;}
};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("click",ev=>{
  if(ev.target?.closest?.("[data-pmsv-b20-export]"))pmsvB20Export();
 });
 document.addEventListener("change",ev=>{if(ev.target?.closest?.("[data-pmsv-b14-case]"))pmsvB20Ensure()});
 document.addEventListener("input",ev=>{if(ev.target?.closest?.("[data-pmsv-b14-case]"))pmsvB20Ensure()});
}
