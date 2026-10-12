"use strict";
/* Current 446/87: named finished-food subroutes only, not whole-product PASS. */
var pmsv446Source=null,pmsv446Ledger=null,pmsv87Queue=null;
const pmsv446Digests=Object.freeze({"manifest":"9ae4aa08c532e8ab","ledger":"4462305149bf4488","queue":"71f7bbf91ca52cda"});
const pmsv446PromotedIds=Object.freeze(["04-04-1-fruits-and-vegetable-chutney","12-12-2-seasoning"]);
function pmsv446Valid(){
 if(typeof pmsv444Valid!=="function"||!pmsv444Valid()||
 typeof pmsv52Valid!=="function"||!pmsv52Valid()||
 typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv446Source,d=pmsv446Ledger,q=pmsv87Queue,o=pmsv444Ledger,
 oldq=pmsv89Queue,c=contaminantsDb;
 if(!m||!d||!q||!o||!oldq||!c||
 pmsvReviewSnapshotDigest(m)!==pmsv446Digests.manifest||
 pmsvReviewSnapshotDigest(d)!==pmsv446Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv446Digests.queue||
 m.source_policy!=="OFFICIAL_FSSAI_ONLY"||m.source_version!==c.source_version||
 m.official_ctr!==c.official_sources?.[0]?.url||
 m.source_class!=="NAMED_FINISHED_PRODUCT_CONDITIONAL_SUBROUTE_ONLY"||
 m.previous?.catalogue!==533||m.previous?.partial_exact!==444||m.previous?.first_source_pending!==89||
 m.latest?.catalogue!==533||m.latest?.partial_exact!==446||m.latest?.first_source_pending!==87||
 m.latest?.full_compliance_approvals!==0||m.no_actual_lot_identity_verified!==true||
 m.no_numeric_limit_auto_assignment!==true||m.no_full_product_compliance_pass!==true||
 m.products?.length!==2||o.records?.length!==533||oldq.review_records?.length!==89||
 d.catalogue!==533||d.records?.length!==533||d.partial_exact!==446||
 d.first_source_pending!==87||d.full_compliance_approvals!==0||
 d.positive_delta_count!==2||d.previous_archived_pending!==89||
 d.baseline_file!=="fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json"||
 d.promotion_manifest!=="fssai-two-named-finished-food-conditional-subroutes-2026-10-12.json"||
 q.catalogue!==533||q.partial_exact!==446||q.first_source_pending!==87||
 q.review_records?.length!==87||q.completed_compliance!==0||
 q.archive_89_count!==89||q.subsequent_promotions!==29||
 q.promoted_catalog_ids?.length!==29)return false;
 const ids=new Set(pmsv446PromotedIds),byId=new Map(m.products.map(x=>[x.catalog_id,x]));
 if(ids.size!==2||byId.size!==2||byId.size!==ids.size)return false;
 const chutney=byId.get("04-04-1-fruits-and-vegetable-chutney");
 const seasoning=byId.get("12-12-2-seasoning");
 if(chutney?.qualified_form!=="Mango Chutney"||chutney?.qualified_fssr!=="2.3.42"||
 chutney.fssr!=="2.3.41"||chutney.article!=="Mango chutney"||
 chutney.contaminant!=="Lead"||chutney.source_limit!==1||chutney.unit!=="mg/kg"||
 chutney.additional_article!=="Mango Chutney"||chutney.additional_contaminant!=="Tin"||
 chutney.additional_limit!==250||
 seasoning?.qualified_form!=="Dry curry powder or mix masala"||
 seasoning.fssr!=="2.9.31"||seasoning.contaminant!=="Lead"||
 seasoning.source_limit!==10||seasoning.unit!=="mg/kg on dry matter basis"||
 !seasoning.article.includes("curry powder and mix masalas"))return false;
 for(const x of m.products){
  if(!ids.has(x.catalog_id)||x.official_product_standard?.includes("fssai.gov.in/")!==true||
   x.named_article_verified!==true||x.actual_finished_lot_subtype_confirmed!==false||
   x.actual_finished_lot_lab_result_confirmed!==false||
   x.numeric_finished_food_limit_auto_applied!==false||
   x.other_contaminants_complete!==false||x.lab_pass!==false||
   x.full_compliance_pass!==false||x.required_evidence?.length!==5||
   x.negative_controls?.length!==6)return false;
 }
 let matched=0,pending=0,changed=0;
 const expected=new Set();
 for(let i=0;i<533;i++){
  const a=o.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
  String(a.fssr||"")!==String(b.fssr||"")||
  String(a.fcs||"")!==String(b.fcs||"")||
  b.sample_lab_pass!==false||b.product_compliance_approval!==false||
  b.complete_contaminant_panel!==false)return false;
  const x=byId.get(a.catalog_id);
  if(!x){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
   const v=b.regulatory_source_verified_delta;
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
   b.missing_first_exact_evidence!==false||
   x.product_name!==b.product_name||x.fssr!==b.fssr||x.fcs!==b.fcs||
   v?.evidence_class!=="NAMED_FINISHED_PRODUCT_CONDITIONAL_SUBROUTE_ONLY"||
   v.named_finished_product_subtype!==x.qualified_form||
   v.source_product_standard!==x.qualified_fssr||
   v.source_article!==x.article||v.source_limit!==x.source_limit||
   v.contaminant!==x.contaminant||v.unit!==x.unit||
   v.actual_lot_subtype_confirmed!==false||
   v.numeric_finished_food_limit_auto_applied!==false||
   v.lab_pass!==false||v.full_compliance_pass!==false)return false;
   changed++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")matched++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;expected.add(b.catalog_id);}
  else return false;
 }
 if(matched!==446||pending!==87||changed!==2||expected.size!==87)return false;
 const prev=new Map(oldq.review_records.map(x=>[x.catalog_id,x]));
 const seen=new Set();
 for(const x of q.review_records){
  if(seen.has(x.catalog_id)||!expected.has(x.catalog_id)||
  JSON.stringify(x)!==JSON.stringify(prev.get(x.catalog_id))||
  x.first_exact_source_verified!==false||
  x.numeric_finished_food_limit_auto_applied!==false||
  x.finished_food_laboratory_pass!==false||
  x.full_regulatory_compliance_approval!==false)return false;
  seen.add(x.catalog_id);
 }
 return seen.size===87&&pmsv446PromotedIds.every(x=>!expected.has(x)&&q.promoted_catalog_ids.includes(x))&&
 q.promoted_catalog_ids.every(x=>!expected.has(x));
}
var pmsvBefore446Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore446Load();
 pmsv446Source=null;pmsv446Ledger=null;pmsv87Queue=null;
 try{
 const names=["fssai-two-named-finished-food-conditional-subroutes-2026-10-12.json",
 "fssai-current-first-source-533-live-ledger-446-87-2026-10-12.json",
 "fssai-current-87-first-exact-source-proof-worklist-2026-10-12.json"];
 const res=await Promise.all(names.map(n=>fetch("./data/rules/"+n+"?v=20261012-44687",{cache:"reload"})));
 if(res.some(r=>!r.ok))throw Error("446/87 FSSAI source unavailable");
 [pmsv446Source,pmsv446Ledger,pmsv87Queue]=await Promise.all(res.map(r=>r.json()));
 if(!pmsv446Valid())throw Error("Source integrity mismatch");
 }catch(_){pmsv446Source=null;pmsv446Ledger=null;pmsv87Queue=null;}
};
function pmsv446Html(p){
 if(p&&typeof pmsv450Valid==="function"&&pmsv450Valid())return "";
 if(!p)return "";
 if(!pmsv446Valid())return '<div class="notice">Latest 446/87 named source integrity unavailable; no numeric limits or compliance PASS.</div>';
 const r=pmsv446Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
 String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Latest exact product identity unmatched. Source withheld; no PASS.</div>';
 const escVal=x=>typeof esc==="function"?esc(String(x)):String(x);
 let html='<details class="card" style="margin-top:12px"><summary><b>Latest FSSAI named source — 446 partial / 87 pending</b> · '+
 escVal(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL NAMED SOURCE":"FIRST EXACT SOURCE PENDING")+
 '</summary><div class="notice"><b>533 identities · 446 partial exact named sources · 87 waiting first named sources · 0 full compliance or laboratory PASS.</b></div>';
 const x=pmsv446Source.products.find(x=>x.catalog_id===p.id);
 if(x){
  html+='<p><b>Qualified named FSSR finished-product form:</b> '+escVal(x.qualified_form)+
  ' (FSSR '+escVal(x.qualified_fssr)+')</p>'+
  '<p><b>CTR IX source only:</b> '+escVal(x.contaminant)+' '+escVal(x.source_limit)+' '+escVal(x.unit)+
  ' — '+escVal(x.article)+'</p>';
  if(x.additional_article)html+='<p><b>Additional named CTR IX source:</b> '+escVal(x.additional_contaminant)+' '+
  escVal(x.additional_limit)+' '+escVal(x.additional_unit)+' — '+escVal(x.additional_article)+'</p>';
  html+='<p><b>Exact qualifying conditions:</b> '+escVal(x.condition)+'</p>'+
  '<p><b>Positive proof still required:</b></p><ul>'+x.required_evidence.map(y=>'<li>'+escVal(y)+'</li>').join("")+'</ul>'+
  '<p><b>Do NOT inherit:</b> '+x.negative_controls.map(escVal).join("; ")+'</p>'+
  '<div class="notice"><b>SOURCE ARTICLE ONLY.</b> Actual lot identity, source application, lab results and full compliance are NOT verified. Numeric values are source table entries, not approved as-sold product results.</div>'+
  '<small><a href="'+escVal(x.official_product_standard)+'" target="_blank" rel="noopener noreferrer">Official FSSR</a> · '+
  '<a href="'+escVal(pmsv446Source.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR IX</a></small>';
 }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING")html+='<p>Named finished-article source still unresolved; continue individual proof collection.</p>';
 else html+='<p>Existing partial named source recorded in prior authenticated evidence. No whole-product PASS.</p>';
 return html+'</details>';
}
var pmsvBefore446Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const now=pmsv446Html(p);
 if(!p||!pmsv446Valid())return now;
 return now+pmsvBefore446Proof(p);
};
var pmsvBefore446Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv446Valid())return '<div class="notice">Latest 446/87 source integrity not established. No PASS.</div>';
 const r=pmsv446Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
 String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Latest source identity not established. No PASS.</div>';
 if(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";
 if(r.source_status!=="FIRST_EXACT_SOURCE_PENDING")return '<div class="notice">Unknown latest source status; no PASS.</div>';
 return pmsvBefore446Local(p);
};
