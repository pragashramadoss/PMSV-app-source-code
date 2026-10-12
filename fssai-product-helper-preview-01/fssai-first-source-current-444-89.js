"use strict";
/* PMSV current 444/89: conditional whole-egg shell-free pesticide source only.
 No manufactured lot or finished-food pesticide MRL automatically approved. */
var pmsv444Manifest=null,pmsv444Ledger=null,pmsv89Queue=null,pmsv89Dossier=null;
const pmsv444Digests=Object.freeze({"manifest":"2b82882ec60cfc07","ledger":"dee4f1507075dd63","queue":"521fdf09c432fca8","dossier":"9d43b6ff85e8b4ec"});
const pmsv444Ids=Object.freeze(["10-10-2-liquid-egg-products","10-10-2-frozen-egg-products"]);
function pmsv444Valid(){
 if(typeof pmsv442Valid!=="function"||!pmsv442Valid()||typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv444Manifest,d=pmsv444Ledger,q=pmsv89Queue,w=pmsv89Dossier,
 o=pmsv442Ledger,p=pmsv91Queue,c=contaminantsDb;
 if(!m||!d||!q||!w||!o||!p||!c||
 pmsvReviewSnapshotDigest(m)!==pmsv444Digests.manifest||
 pmsvReviewSnapshotDigest(d)!==pmsv444Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv444Digests.queue||
 pmsvReviewSnapshotDigest(w)!==pmsv444Digests.dossier||
 m.source_policy!=="OFFICIAL_FSSAI_ONLY"||m.official_ctr!==c.official_sources?.[0]?.url||
 m.source_version!==c.source_version||m.article_pesticide_serial!==13||
 m.article_basis!=="shell free basis"||m.article_commodity!=="Eggs"||
 m.source_limit_mgkg!==0.1||m.products?.length!==2||
 m.no_finished_product_residue_auto_application!==true||m.no_lab_or_compliance_pass!==true||
 m.latest?.catalogue!==533||m.latest?.partial_exact!==444||m.latest?.first_source_pending!==89||
 m.latest?.full_compliance_approvals!==0||
 d.catalogue!==533||d.records?.length!==533||d.partial_exact!==444||d.first_source_pending!==89||
 d.full_compliance_approvals!==0||d.previous_archived_pending!==91||d.positive_delta_count!==2||
 d.baseline_file!=="fssai-current-first-source-533-live-ledger-442-91-2026-10-12.json"||
 q.catalogue!==533||q.partial_exact!==444||q.first_source_pending!==89||
 q.review_records?.length!==89||q.completed_compliance!==0||
 q.archive_91_count!==91||q.subsequent_promotions!==27||q.promoted_catalog_ids?.length!==27||
 w.catalogue!==533||w.partial_exact!==444||w.first_source_pending!==89||
 w.remaining_records?.length!==89||w.audited_count<30||w.audited_records?.length!==w.audited_count||
 w.full_compliance_passes!==0||w.no_lab_passes!==true||
 o.partial_exact!==442||o.first_source_pending!==91||p.review_records?.length!==91)return false;
 const ids=new Set(pmsv444Ids),prom=new Map(m.products.map(x=>[x.catalog_id,x]));
 if(ids.size!==2||prom.size!==2||m.products.some(x=>!ids.has(x.catalog_id)||
 x.fssr!==(x.catalog_id===pmsv444Ids[0]?"2.5.3(4)":"2.5.3(2)")||
 x.official_ctr!==m.official_ctr||x.official_fssr!==m.official_product_standard||
 x.source_commodity_article!=="Eggs"||x.source_sample_basis!=="shell free basis"||
 x.source_limit_mgkg!==0.1||x.actual_lot_whole_egg_identity_confirmed!==false||
 x.finished_matrix_processing_equivalence_confirmed!==false||
 x.lab_result_and_method_confirmed!==false||x.processing_factor_confirmed!==false||
 x.numeric_limit_auto_applied!==false||x.compliance_pass!==false||
 x.required_evidence?.length!==5||x.negative_controls?.length!==6))return false;
 let matched=0,pending=0,delta=0;
 for(let i=0;i<533;i++){
 const a=o.records[i],b=d.records[i];
 if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
 String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
 b.sample_lab_pass!==false||b.product_compliance_approval!==false||b.complete_contaminant_panel!==false)return false;
 if(!ids.has(a.catalog_id)){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
 else{
 const x=prom.get(a.catalog_id),v=b.regulatory_source_verified_delta;
 if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
 b.missing_first_exact_evidence!==false||x.product_name!==b.product_name||x.fssr!==b.fssr||
 v?.evidence_class!=="FSSR_WHOLE_HEN_EGG_CTR_SHELL_FREE_EGGS_COMMODITY_FIRST_SOURCE_CONDITIONAL"||
 v?.source_pesticide_serial!==13||v?.source_mrl_mgkg!==0.1||
 v?.legal_finished_product_identity_verified!==false||
 v?.residue_processing_factor_confirmed!==false||
 v?.finished_food_sample_basis_confirmed!==false||
 v?.numeric_finished_food_limit_auto_applied!==false||v?.full_compliance_pass!==false||v?.lab_pass!==false)return false;
 delta++;
 }
 if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")matched++;
 else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
 else return false;
 }
 if(delta!==2||matched!==444||pending!==89)return false;
 const original=new Map(p.review_records.map(x=>[x.catalog_id,x]));
 const expected=new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 const qs=new Set(),ds=new Set(),audited=new Set();
 for(const x of q.review_records){
 if(qs.has(x.catalog_id)||!expected.has(x.catalog_id)||JSON.stringify(x)!==JSON.stringify(original.get(x.catalog_id))||
 x.first_exact_source_verified!==false||x.numeric_finished_food_limit_auto_applied!==false||
 x.finished_food_laboratory_pass!==false||x.full_regulatory_compliance_approval!==false)return false;qs.add(x.catalog_id);
 }
 for(const x of w.remaining_records){
 if(ds.has(x.catalog_id)||!expected.has(x.catalog_id)||x.actual_finished_product_source_not_confirmed!==true||
 x.no_new_numeric_product_pass!==true||x.laboratory_pass!==false||
 x.full_regulatory_compliance_approval!==false)return false;ds.add(x.catalog_id);
 }
 for(const x of w.audited_records){
 if(audited.has(x.catalog_id)||!expected.has(x.catalog_id)||!x.source_qualifier_decision||
 x.actual_finished_matrix_verified!==false||x.current_amendments_rechecked!==false||
 x.automatic_numeric_limit_allowed!==false||x.full_regulatory_pass!==false||
 x.laboratory_pass!==false)return false;audited.add(x.catalog_id);
 }
 return expected.size===89&&qs.size===89&&ds.size===89&&audited.size===w.audited_count&&
 pmsv444Ids.every(id=>!expected.has(id)&&q.promoted_catalog_ids.includes(id))&&
 m.not_promoted_product_ids.every(id=>expected.has(id));
}
var pmsvBefore444Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore444Load();pmsv444Manifest=null;pmsv444Ledger=null;pmsv89Queue=null;pmsv89Dossier=null;
 try{
 const names=["fssai-two-whole-egg-shell-free-residue-2026-10-12.json","fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json","fssai-current-89-first-exact-source-proof-worklist-2026-10-12.json","fssai-89-detailed-finished-identity-audit-2026-10-12.json"];
 const f=await Promise.all(names.map(n=>fetch("./data/rules/"+n+"?v=20261012-44489",{cache:"reload"})));
 if(f.some(x=>!x.ok))throw Error("Current 444/89 source files missing");
 [pmsv444Manifest,pmsv444Ledger,pmsv89Queue,pmsv89Dossier]=await Promise.all(f.map(x=>x.json()));
 if(!pmsv444Valid())throw Error("Current 444/89 source-integrity check failed");
 }catch(_){pmsv444Manifest=null;pmsv444Ledger=null;pmsv89Queue=null;pmsv89Dossier=null;}
};
function pmsv444Html(p){
 if(!p)return "";
 if(!pmsv444Valid())return '<div class="notice">Latest 444/89 FSSAI evidence integrity unavailable. No legal numerical assignment or PASS.</div>';
 const r=pmsv444Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||String(r.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Current FSSAI catalogue mismatch. Source withheld.</div>';
 let output='<details class="card" style="margin-top:12px"><summary><b>Current verified source ledger — 444/89</b> · '+
 esc(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL EXACT SOURCE MATCH":"FIRST EXACT SOURCE PENDING")+'</summary>'+
 '<div class="notice"><b>533 identities · 444 partial exact sources · 89 waiting first exact sources · 0 full compliance or sample laboratory PASS.</b></div>';
 const e=pmsv444Manifest.products.find(x=>x.catalog_id===p.id);
 if(e){
 output+='<p><b>Conditional official source, whole hen egg only:</b> '+esc(e.branch)+'</p>'+
 '<p><b>Version IX §2.3.1 serial 13:</b> sum of benomyl and carbendazim expressed as carbendazim, Eggs (shell-free basis), <b>0.1 mg/kg</b>. The marketed lot, processing factor and lab result remain unverified. No finished-lot limit automatically applied.</p>'+
 '<p><b>Required proof:</b> '+e.required_evidence.map(esc).join("; ")+'</p>'+
 '<p><b>Excluded:</b> '+e.negative_controls.map(esc).join("; ")+'</p>'+
 '<small><a href="'+esc(e.official_fssr)+'" target="_blank" rel="noopener noreferrer">Official egg FSSR</a> · <a href="'+esc(e.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small>';
 }else{
 const a=pmsv89Dossier.audited_records.find(x=>x.catalog_id===p.id);
 if(a)output+='<p><b>Individual reviewed product:</b> '+esc(a.source_qualifier_decision)+'</p>'+
 '<p><b>Do not inherit:</b> '+esc(a.forbidden_inheritance)+'</p>'+
 '<p>Current named finished-product regulatory article still awaiting source evidence. No numeric limit or sample PASS.</p>';
 else output+='<p>Exact first-source review and product identity checks are still pending; old source proof requirements remain.</p>';
 }
 return output+'</details>';
}
var pmsvBefore444Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const here=pmsv444Html(p);
 if(!p||!pmsv444Valid())return here;
 let prev=pmsvBefore444Proof(p);
 prev=prev.replace(/<details class="card" style="margin-top:12px"><summary><b>Current FSSAI first-source ledger — 442\/91<\/b>[\s\S]*?<\/details>/,"");
 return here+prev;
};
var pmsvBefore444Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv444Valid())return '<div class="notice">Latest 444/89 source integrity unavailable. No compliance PASS.</div>';
 const current=pmsv444Ledger?.records?.find(x=>x.catalog_id===p.id);
 if(!current||current.product_name!==p.name||
    String(current.fssr||"")!==String(p.fssr||"")||
    String(current.fcs||"")!==String(p.fcs||""))
    return '<div class="notice">Latest identity/source reconciliation unavailable. No compliance PASS.</div>';
 // All 27 products promoted after the archived 116-case snapshot must be
 // removed from old evidence-collection panels, not just the latest two eggs.
 if(current.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";
 if(current.source_status!=="FIRST_EXACT_SOURCE_PENDING")
    return '<div class="notice">Unrecognized official-source status; no PASS.</div>';
 return pmsvBefore444Local(p);
};
