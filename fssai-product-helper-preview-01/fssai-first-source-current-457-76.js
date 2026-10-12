"use strict";
/* PMSV current 457 partial source / 76 source-pending.
  EXACT named conditional subroutes ONLY. No lot identity, numeric assignment, lab or regulatory PASS. */
var pmsv457Manifest=null,pmsv457Ledger=null,pmsv76Queue=null;
const pmsv457Digests=Object.freeze({"manifest":"1314e9792a21ad26","ledger":"7aca5732901bf4a3","queue":"7e2b4b36b85bfa83"});
const pmsv457PromotedIds=Object.freeze(["18-18-1-starch-based-sweets","18-18-1-indian-confections","18-18-1-dry-fruit-and-nuts-based-sweets","18-18-1-fruit-and-vegetables-based-sweets","12-12-10-vegetable-protein-products","18-18-2-cereal-or-pulses-flour-starch-based-snacks-and-savouries","99-99-1-mixture-preparations-premix-of-food-additives"]);
function pmsv457Valid(){
 if(typeof pmsv450Valid!=="function"||!pmsv450Valid()||
 typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv457Manifest,d=pmsv457Ledger,q=pmsv76Queue,
 o=pmsv450Ledger,p=pmsv83Queue,c=contaminantsDb;
 if(!m||!d||!q||!o||!p||!c||
 pmsvReviewSnapshotDigest(m)!==pmsv457Digests.manifest||
 pmsvReviewSnapshotDigest(d)!==pmsv457Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv457Digests.queue||
 m.schema_version!=="1.0"||m.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 m.source_version!==c.source_version||m.official_ctr!==c.official_sources?.[0]?.url||
 m.source_class!=="STRICT_FINISHED_HARD_CANDY_CROP_COMPOSITE_OR_SYNTHETIC_COLOUR_PREMIX_SUBROUTE_ONLY"||
 m.baseline?.catalogue!==533||m.baseline?.partial_exact!==450||
 m.baseline?.first_source_pending!==83||
 m.latest?.catalogue!==533||m.latest?.partial_exact!==457||
 m.latest?.first_source_pending!==76||m.latest?.full_compliance_approvals!==0||
 m.named_conditionally_qualified_routes!==7||m.products?.length!==7||
 m.auto_apply_finished_limits!==false||
 m.finished_lot_identity_unverified!==true||
 m.any_lab_pass!==false||m.any_full_compliance_pass!==false||
 d.catalogue!==533||d.partial_exact!==457||d.first_source_pending!==76||
 d.records?.length!==533||d.full_compliance_approvals!==0||
 d.previous_archived_pending!==83||d.positive_delta_count!==7||
 d.baseline_file!=="fssai-current-first-source-533-live-ledger-450-83-2026-10-12.json"||
 d.promotion_manifest!=="fssai-seven-hbc-composite-colour-named-subroutes-2026-10-12.json"||
 q.catalogue!==533||q.partial_exact!==457||q.first_source_pending!==76||
 q.archive_83_count!==83||q.subsequent_promotions!==40||
 q.review_records?.length!==76||q.promoted_catalog_ids?.length!==40||
 q.completed_compliance!==0||o.records?.length!==533||p.review_records?.length!==83)return false;
 const ids=new Set(pmsv457PromotedIds),proof=new Map(m.products.map(x=>[x.catalog_id,x]));
 if(ids.size!==7||proof.size!==7)return false;
 const validOfficial=x=>typeof x==="string"&&
 /^(https:\/\/(?:www\.)?fssai\.gov\.in\/|https:\/\/foscos\.fssai\.gov\.in\/)/.test(x);
 for(const x of m.products){
  if(!ids.has(x.catalog_id)||!validOfficial(x.official_standard_url)||
   x.official_ctr!==m.official_ctr||
   x.conditional_named_article_verified!==true||
   x.actual_finished_lot_identity_verified!==false||
   x.actual_recipe_or_ingredient_identity_verified!==false||
   x.processing_equivalence_confirmed!==false||
   x.source_limits_auto_applied!==false||
   x.actual_laboratory_results_verified!==false||
   x.all_contaminants_reviewed!==false||x.full_compliance_pass!==false||
   x.positive_source_basis?.length!==5||x.negative_transfer_controls?.length!==6||
   !Array.isArray(x.source_article_candidates)||x.source_article_candidates.length<2||
   x.source_article_candidates.some(y=>y.limit<=0||!y.article||!y.contaminant||!y.unit))return false;
 }
 const hbcIds=["18-18-1-starch-based-sweets","18-18-1-indian-confections",
 "18-18-1-dry-fruit-and-nuts-based-sweets","18-18-1-fruit-and-vegetables-based-sweets"];
 const mustHard=[["Lead",2],["Arsenic",1],["Tin",5]];
 for(const id of hbcIds){
  const x=proof.get(id);
  if(!x||!x.conditional_fssr_subroute.startsWith("2.7.1")||
   x.source_article_candidates.length<3||
   mustHard.some(([metal,limit])=>!x.source_article_candidates.some(a=>
    a.article==="Hard boiled sugar confectionery"&&a.contaminant===metal&&a.limit===limit&&a.unit==="mg/kg")))return false;
 }
 const compIds=["18-18-1-dry-fruit-and-nuts-based-sweets",
 "12-12-10-vegetable-protein-products",
 "18-18-2-cereal-or-pulses-flour-starch-based-snacks-and-savouries"];
 for(const id of compIds){
  const x=proof.get(id);
  if(!x||
    !x.source_article_candidates.some(a=>a.article.startsWith("Food product containing")&&
      a.contaminant==="Total Aflatoxins"&&a.limit===20&&a.unit==="µg/kg")||
    !x.source_article_candidates.some(a=>a.article.startsWith("Food product containing")&&
      a.contaminant==="Aflatoxin B1"&&a.limit===10&&a.unit==="µg/kg"))return false;
 }
 const protein=proof.get("12-12-10-vegetable-protein-products");
 if(protein?.conditional_fssr_subroute!=="2.3.59"||
    !protein.positive_source_basis.some(s=>s.includes(">=40% protein")))return false;
 const colour=proof.get("99-99-1-mixture-preparations-premix-of-food-additives");
 if(!colour||colour.source_article_candidates.length!==2||
   !colour.source_article_candidates.some(a=>
    a.article==="Synthetic food colour-preparation and mixtures"&&
    a.contaminant==="Lead"&&a.limit===10&&a.unit==="mg/kg")||
   !colour.source_article_candidates.some(a=>
    a.article==="Synthetic food colour-preparation and mixtures"&&
    a.contaminant==="Arsenic"&&a.limit===3&&a.unit==="mg/kg"))return false;
 let matched=0,pending=0,changed=0;const remaining=new Set();
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
    v?.evidence_class!=="CONDITIONALLY_NAMED_FSSR_CTR_ARTICLE_ONLY"||
    v.source_family!==x.source_family||
    v.conditional_named_article!==x.named_qualified_finished_article||
    JSON.stringify(v.article_source_values)!==
      JSON.stringify(x.source_article_candidates.map(y=>({contaminant:y.contaminant,article:y.article,limit:y.limit,unit:y.unit,analytical_basis:y.analytical_basis})))||
    v.actual_finished_lot_identity_verified!==false||
    v.recipe_and_source_ingredient_identity_verified!==false||
    v.processing_equivalence_confirmed!==false||
    v.numeric_finished_food_limit_auto_applied!==false||
    v.lab_pass!==false||v.full_compliance_pass!==false)return false;
   changed++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")matched++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;remaining.add(b.catalog_id);}
  else return false;
 }
 if(matched!==457||pending!==76||changed!==7||remaining.size!==76)return false;
 const prev=new Map(p.review_records.map(x=>[x.catalog_id,x])),seen=new Set();
 for(const x of q.review_records){
  if(seen.has(x.catalog_id)||!remaining.has(x.catalog_id)||
  JSON.stringify(x)!==JSON.stringify(prev.get(x.catalog_id))||
  x.first_exact_source_verified!==false||
  x.numeric_finished_food_limit_auto_applied!==false||
  x.finished_food_laboratory_pass!==false||
  x.full_regulatory_compliance_approval!==false)return false;
  seen.add(x.catalog_id);
 }
 return seen.size===76&&pmsv457PromotedIds.every(id=>
 !remaining.has(id)&&q.promoted_catalog_ids.includes(id))&&
 q.promoted_catalog_ids.every(id=>!remaining.has(id));
}
var pmsvBefore457Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore457Load();pmsv457Manifest=null;pmsv457Ledger=null;pmsv76Queue=null;
 try{
  const n=["fssai-seven-hbc-composite-colour-named-subroutes-2026-10-12.json",
  "fssai-current-first-source-533-live-ledger-457-76-2026-10-12.json",
  "fssai-current-76-first-exact-source-proof-worklist-2026-10-12.json"];
  const r=await Promise.all(n.map(x=>fetch("./data/rules/"+x+"?v=20261012-45776",{cache:"reload"})));
  if(r.some(x=>!x.ok))throw Error("Missing 457/76 FSSAI source files");
  [pmsv457Manifest,pmsv457Ledger,pmsv76Queue]=await Promise.all(r.map(x=>x.json()));
  if(!pmsv457Valid())throw Error("457/76 source integrity invalid");
 }catch(_){pmsv457Manifest=null;pmsv457Ledger=null;pmsv76Queue=null;}
};
function pmsv457Html(p){
 if(!p)return "";
 if(!pmsv457Valid())
  return '<div class="notice"><b>Current FSSAI 457/76 source evidence unavailable.</b> No numeric contaminant application or PASS.</div>';
 const r=pmsv457Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
 String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Current catalogue identity does not reconcile. No PASS.</div>';
 const safe=x=>typeof esc==="function"?esc(String(x)):String(x);
 let html='<details class="card" style="margin-top:12px"><summary><b>Latest FSSAI source ledger — 457 partial / 76 pending</b> · '+
 safe(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL CONDITIONAL NAMED SOURCE":"FIRST EXACT SOURCE PENDING")+
 '</summary><div class="notice"><b>533 identities · 457 partial conditional sources · 76 exact first-source pending · ZERO finished-lot or compliance PASS.</b></div>';
 const x=pmsv457Manifest.products.find(x=>x.catalog_id===p.id);
 if(x){
  html+='<p><b>Qualified source-only subroute:</b> '+safe(x.named_qualified_finished_article)+
   '</p><p><b>Actual lot identity is NOT verified.</b> '+safe(x.source_family)+'</p>';
  html+='<p><b>CTR IX source values (not automatically applied):</b></p><ul>'+
   x.source_article_candidates.map(a=>'<li>'+safe(a.contaminant)+": "+safe(a.article)+
    " — "+safe(a.limit)+" "+safe(a.unit)+
    ' ('+safe(a.analytical_basis)+')</li>').join("")+'</ul>';
  html+='<p><b>Positive evidence required:</b></p><ul>'+
   x.positive_source_basis.map(y=>'<li>'+safe(y)+'</li>').join("")+'</ul>'+
   '<p><b>Explicitly excluded:</b> '+x.negative_transfer_controls.map(safe).join("; ")+'</p>'+
   '<div class="notice"><b>NO AUTOMATIC SOURCE-LIMIT APPLICATION OR PASS.</b> Final lot recipe, processing, analytical methods, all contaminants and results are still unverified.</div>'+
   '<small><a href="'+safe(x.official_standard_url)+'" target="_blank" rel="noopener noreferrer">Official FSSR/FoSCoS product route</a> · '+
   '<a href="'+safe(pmsv457Manifest.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR Version IX</a></small>';
 }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING"){
  html+='<p>Still awaiting a named finished-article or confirmed ingredient-conditional source. The original individual evidence packet remains archived.</p>';
 }else{
  html+='<p>Existing partial named source evidence is retained; no laboratory or whole-food compliance approval.</p>';
 }
 return html+'</details>';
}
var pmsvBefore457ResearchProof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const newest=pmsv457Html(p);
 if(!p||!pmsv457Valid())return newest;
 return newest+pmsvBefore457ResearchProof(p);
};
var pmsvBefore457Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv457Valid())return '<div class="notice">Latest FSSAI source 457/76 integrity unavailable. No PASS.</div>';
 const r=pmsv457Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
 String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Source/product identity mismatch in latest ledger. No PASS.</div>';
 if(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";
 if(r.source_status!=="FIRST_EXACT_SOURCE_PENDING")
  return '<div class="notice">Unrecognized current source status. No PASS.</div>';
 return pmsvBefore457Local(p);
};
