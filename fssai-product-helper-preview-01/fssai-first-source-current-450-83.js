"use strict";
/* PMSV current 450/83: four strictly conditional tomato and actual-betelnut source routes.
 All historic source registers remain read-only; never auto-approve a numeric contaminant or tested lot. */
var pmsv450Source=null,pmsv450Ledger=null,pmsv83Queue=null;
const pmsv450Digests=Object.freeze({"manifest":"0ef6cfacab3b6c01","ledger":"b8267fd288de83cb","queue":"cd07be9e35753297"});
const pmsv450Ids=Object.freeze(["concentrated-vegetable-pulp-puree","04-04-2-vegetable-pulp-puree-with-preservatives-for-industrial-use-only","04-04-2-concentrated-vegetable-pulp-puree-with-preservatives-for-industrial-use-only","100-100-pan-masala"]);
function pmsv450Valid(){
 if(typeof pmsv446Valid!=="function"||!pmsv446Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const s=pmsv450Source,d=pmsv450Ledger,q=pmsv83Queue,o=pmsv446Ledger,
 oldq=pmsv87Queue,c=contaminantsDb;
 if(!s||!d||!q||!o||!oldq||!c||
 pmsvReviewSnapshotDigest(s)!==pmsv450Digests.manifest||
 pmsvReviewSnapshotDigest(d)!==pmsv450Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv450Digests.queue||
 s.source_policy!=="OFFICIAL_FSSAI_ONLY"||s.source_version!==c.source_version||
 s.official_ctr!==c.official_sources?.[0]?.url||
 s.scope!=="STRICT_CONDITIONAL_FINISHED_PRODUCT_OR_QUALIFIED_RECIPE_SOURCE_ONLY"||
 s.baseline?.catalogue!==533||s.baseline?.partial_exact!==446||
 s.baseline?.first_source_pending!==87||
 s.latest?.catalogue!==533||s.latest?.partial_exact!==450||
 s.latest?.first_source_pending!==83||s.latest?.full_compliance_approvals!==0||
 s.positive_subroute_count!==4||s.products?.length!==4||
 s.actual_lot_identity_verified!==false||
 s.any_numeric_finished_food_limit_auto_applied!==false||
 s.any_complete_compliance_pass!==false||
 d.catalogue!==533||d.records?.length!==533||d.partial_exact!==450||
 d.first_source_pending!==83||d.full_compliance_approvals!==0||
 d.previous_archived_pending!==87||d.positive_delta_count!==4||
 d.baseline_file!=="fssai-current-first-source-533-live-ledger-446-87-2026-10-12.json"||
 d.promotion_manifest!=="fssai-four-tomato-pan-named-source-subroutes-2026-10-12.json"||
 q.catalogue!==533||q.partial_exact!==450||q.first_source_pending!==83||
 q.archive_87_count!==87||q.subsequent_promotions!==33||
 q.promoted_catalog_ids?.length!==33||q.review_records?.length!==83||
 q.completed_compliance!==0||o.records?.length!==533||
 oldq.review_records?.length!==87)return false;
 const ids=new Set(pmsv450Ids),proof=new Map(s.products.map(x=>[x.catalog_id,x]));
 if(ids.size!==4||proof.size!==4)return false;
 const tomato=proof.get("concentrated-vegetable-pulp-puree"),
 wet=proof.get("04-04-2-vegetable-pulp-puree-with-preservatives-for-industrial-use-only"),
 conc=proof.get("04-04-2-concentrated-vegetable-pulp-puree-with-preservatives-for-industrial-use-only"),
 pan=proof.get("100-100-pan-masala");
 if(tomato?.source_family!=="ACTUAL_PROCESSED_TOMATO_CONCENTRATE_SUBROUTE"||
 conc?.source_family!=="ACTUAL_PROCESSED_TOMATO_CONCENTRATE_SUBROUTE"||
 wet?.source_family!=="ACTUAL_TOMATO_PUREE_ONLY_SUBROUTE"||
 pan?.source_family!=="PAN_MASALA_ACTUAL_BETELNUT_CONTAINING_COMPOSITE_ONLY"||
 tomato.named_ctr_articles?.length!==3||wet.named_ctr_articles?.length!==1||
 conc.named_ctr_articles?.length!==3||pan.named_ctr_articles?.length!==2||
 wet.named_ctr_articles[0].metal!=="Copper"||
 [tomato,conc].some(x=>x.qualified_named_product_standard!=="2.3.14"||
  x.named_ctr_articles[0].metal!=="Lead"||x.named_ctr_articles[0].limit!==1.5||
  x.named_ctr_articles[1].metal!=="Tin"||x.named_ctr_articles[1].limit!==250||
  x.named_ctr_articles[2].metal!=="Copper"||x.named_ctr_articles[2].limit!==100||
  !x.named_ctr_articles[2].basis.includes("DRIED TOMATO SOLIDS"))||
 wet.named_ctr_articles[0].limit!==100||
 pan.trigger_ingredient!=="Arecanut or Betelnut"||
 pan.require_positive_recipe_ingredient!==true||
 pan.named_ctr_articles[0].limit!==20||pan.named_ctr_articles[1].limit!==10||
 pan.named_ctr_articles.some(x=>x.unit!=="µg/kg"))return false;
 for(const x of s.products){
  if(!ids.has(x.catalog_id)||x.source_policy!=="OFFICIAL_FSSAI_ONLY"||
  x.official_ctr!==s.official_ctr||
  x.qualified_subtype_named_source_only!==true||
  x.actual_finished_lot_identity_verified!==false||
  x.actual_lot_composition_verified!==false||
  x.analytical_basis_verified!==false||
  x.actual_lot_lab_result_verified!==false||
  x.source_values_not_numeric_auto_application!==true||
  x.no_full_contaminant_panel!==true||x.no_full_compliance_pass!==true||
  x.named_ctr_articles?.length<1||x.required_positive_evidence?.length!==5||
  x.negative_controls?.length!==6||
  !/^https:\/\/fssai\.gov\.in\/upload\//.test(x.official_fssr))return false;
 }
 let matched=0,pending=0,delta=0;const expected=new Set();
 for(let i=0;i<533;i++){
  const a=o.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
   String(a.fssr||"")!==String(b.fssr||"")||
   String(a.fcs||"")!==String(b.fcs||"")||
   b.sample_lab_pass!==false||b.product_compliance_approval!==false||
   b.complete_contaminant_panel!==false)return false;
  const x=proof.get(a.catalog_id);
  if(!x){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
   const v=b.regulatory_source_verified_delta;
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
    b.missing_first_exact_evidence!==false||
    x.product_name!==b.product_name||x.fssr!==b.fssr||x.fcs!==b.fcs||
    v?.evidence_class!=="FSSAI_FINISHED_TOMATO_OR_RECIPE_QUALIFIED_SOURCE_ONLY"||
    v.source_family!==x.source_family||v.conditional_article!==x.conditional_article||
    v.official_ctr!==s.official_ctr||
    JSON.stringify(v.selected_source_articles)!==
     JSON.stringify(x.named_ctr_articles.map(y=>({contaminant:y.metal||y.contaminant,article:y.article,limit:y.limit,unit:y.unit,basis:y.basis})))||
    v.actual_finished_lot_identity_verified!==false||
    v.actual_ingredient_lot_lab_result_verified!==false||
    v.automatic_numeric_finished_product_limit_applied!==false||
    v.lab_pass!==false||v.full_regulatory_compliance_pass!==false)return false;
   delta++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")matched++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;expected.add(b.catalog_id);}
  else return false;
 }
 if(delta!==4||matched!==450||pending!==83)return false;
 const previous=new Map(oldq.review_records.map(x=>[x.catalog_id,x])),seen=new Set();
 for(const x of q.review_records){
  if(seen.has(x.catalog_id)||!expected.has(x.catalog_id)||
   JSON.stringify(x)!==JSON.stringify(previous.get(x.catalog_id))||
   x.first_exact_source_verified!==false||
   x.numeric_finished_food_limit_auto_applied!==false||
   x.finished_food_laboratory_pass!==false||
   x.full_regulatory_compliance_approval!==false)return false;
  seen.add(x.catalog_id);
 }
 return expected.size===83&&seen.size===83&&
 pmsv450Ids.every(x=>!expected.has(x)&&q.promoted_catalog_ids.includes(x))&&
 q.promoted_catalog_ids.every(x=>!expected.has(x));
}
var pmsvBefore450Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore450Load();pmsv450Source=null;pmsv450Ledger=null;pmsv83Queue=null;
 try{
  const n=["fssai-four-tomato-pan-named-source-subroutes-2026-10-12.json",
  "fssai-current-first-source-533-live-ledger-450-83-2026-10-12.json",
  "fssai-current-83-first-exact-source-proof-worklist-2026-10-12.json"];
  const r=await Promise.all(n.map(x=>fetch("./data/rules/"+x+"?v=20261012-45083",{cache:"reload"})));
  if(r.some(x=>!x.ok))throw Error("FSSAI 450/83 official evidence missing");
  [pmsv450Source,pmsv450Ledger,pmsv83Queue]=await Promise.all(r.map(x=>x.json()));
  if(!pmsv450Valid())throw Error("FSSAI 450/83 evidence integrity mismatch");
 }catch(_){pmsv450Source=null;pmsv450Ledger=null;pmsv83Queue=null;}
};
function pmsv450Html(p){
 if(p&&typeof pmsv457Valid==="function"&&pmsv457Valid())return "";
 if(!p)return "";
 if(!pmsv450Valid())
  return '<div class="notice"><b>Latest 450/83 official source integrity unavailable.</b> No contaminant limit or compliance PASS.</div>';
 const r=pmsv450Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
 String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Latest 450/83 source identity does not reconcile. No PASS.</div>';
 const safe=x=>typeof esc==="function"?esc(String(x)):String(x);
 let html='<details class="card" style="margin-top:12px"><summary><b>Current FSSAI exact named source ledger — 450 partial / 83 pending</b> · '+
 safe(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL NAMED SOURCE":"FIRST EXACT SOURCE PENDING")+
 '</summary><div class="notice"><b>533 identities · 450 partial conditional named sources · 83 pending · Zero full-compliance or laboratory PASS.</b></div>';
 const e=pmsv450Source.products.find(x=>x.catalog_id===p.id);
 if(e){
  html+='<p><b>Strictly qualified source subroute:</b> '+safe(e.source_family)+'</p>'+
  '<p><b>Positive FSSAI finished-food/recipe identity evidence:</b> '+safe(e.legal_definition)+'</p>';
  html+='<p><b>Version IX named articles (source values only; NOT assigned):</b></p><ul>'+
   e.named_ctr_articles.map(a=>'<li>'+safe(a.metal||a.contaminant)+": "+safe(a.article)+
    " — "+safe(a.limit)+" "+safe(a.unit)+
    ' ('+safe(a.basis)+')</li>').join("")+'</ul>';
  html+='<p><b>Still required before any regulatory decision:</b></p><ul>'+
   e.required_positive_evidence.map(x=>'<li>'+safe(x)+'</li>').join("")+'</ul>'+
  '<p><b>Do not inherit:</b> '+e.negative_controls.map(safe).join("; ")+'</p>'+
  '<div class="notice"><b>NO AUTOMATIC LIMIT OR PASS.</b> Actual recipe, lot, assay basis, other contaminants and laboratory results remain unverified.</div>'+
  '<small><a href="'+safe(e.official_fssr)+'" target="_blank" rel="noopener noreferrer">Official FSSR</a> · '+
  '<a href="'+safe(e.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small>';
 }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING")
  html+='<p>Still needs a named first source for the finished food. The individual case evidence remains in prior authenticated review packets.</p>';
 else html+='<p>Previous official first source is partially matched; full-product compliance or tested-lot approval is not established.</p>';
 return html+'</details>';
}
var pmsvBefore450Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const latest=pmsv450Html(p);
 if(!p||!pmsv450Valid())return latest;
 return latest+pmsvBefore450Proof(p);
};
var pmsvBefore450Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv450Valid())return '<div class="notice">450/83 integrity unavailable; no automatic compliance PASS.</div>';
 const current=pmsv450Ledger.records.find(x=>x.catalog_id===p.id);
 if(!current||current.product_name!==p.name||
 String(current.fssr||"")!==String(p.fssr||"")||
 String(current.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Latest product/source identity mismatch; no PASS.</div>';
 if(current.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";
 if(current.source_status!=="FIRST_EXACT_SOURCE_PENDING")
  return '<div class="notice">Unrecognized current first-source status; no PASS.</div>';
 return pmsvBefore450Local(p);
};
