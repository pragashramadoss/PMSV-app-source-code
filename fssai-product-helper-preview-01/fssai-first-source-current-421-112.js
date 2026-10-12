"use strict";
/* The current 421/112 first-source state is layered on an immutable 420/113
 * source-verified snapshot. One new product, Golaka Dugdha, has affirmative
 * FSSAI recipe-based identity proof for CTR lead in concentrated MILKS.
 * NO concentration-factor assumption, final numeric result, lab PASS,
 * product clearance, or inheritance to composite milk desserts. */
var pmsv2026GolakaManifest=null;
var pmsv2026Current421Ledger=null;
const pmsv2026GolakaDigest=Object.freeze({manifest:"848d2497badb1e06",ledger:"c4dbec3e76cae249"});
const pmsv2026GolakaId="102-102-1-14-1-golaka-dugdha-condensed-milk-without-sugar";
function pmsv2026GolakaFirstSourceValid(){
 if(typeof pmsv2026FirstSourceValid!=="function"||!pmsv2026FirstSourceValid())return false;
 const previous=pmsv2026CurrentFirstSourceLedger,
  now=pmsv2026Current421Ledger,m=pmsv2026GolakaManifest,c=contaminantsDb;
 if(!now||!m||!c||typeof pmsvReviewSnapshotDigest!=="function"||
    pmsvReviewSnapshotDigest(m)!==pmsv2026GolakaDigest.manifest||
    pmsvReviewSnapshotDigest(now)!==pmsv2026GolakaDigest.ledger||
    now.source_version!==c.source_version||now.catalogue!==533||
    now.partial_exact!==421||now.first_source_pending!==112||
    now.full_compliance_approvals!==0||now.positive_delta_count!==1||
    now.records?.length!==533||m.schema_version!=="1.0"||
    m.promoted_count!==1||m.baseline?.partial_exact!==420||
    m.baseline?.first_source_pending!==113||
    m.current?.catalogue!==533||m.current?.partial_exact!==421||
    m.current?.first_source_pending!==112||m.current?.full_approvals!==0||
    m.source_version!==c.source_version||
    m.official_contaminants!==c.official_sources?.[0]?.url||
    now.official_contaminants_source!==m.official_contaminants||
    m.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    m.source_status!=="VERIFIED_FIRST_EXACT_FINISHED_PRODUCT_ARTICLE_PARTIAL_ONLY"||
    !/^https:\/\/(?:www\.)?fssai\.gov\.in\/upload\//.test(m.official_recipe)||
    m.automatic_compliance_assessment!==false||
    m.other_pending_preserved!==true)return false;
 const p=m.product;
 if(!p||p.catalog_id!==pmsv2026GolakaId||
    p.official_recipe_section!=="14.1 Golaka Dugdha (Condensed Milk without Sugar)"||
    p.mandatory_ingredient!=="Cow Milk (Godugdha), 1 part"||
    p.other_ingredients!=="NONE"||
    !p.mandatory_process?.includes("seven times")||
    p.finished_identity!=="Concentrated milk made only from cow milk"||
    p.named_article!=="Milks"||p.analyte!=="Lead"||
    p.concentration_condition!=="Concentration factor shall be applied to partially or wholly dehydrated milks."||
    p.base_limit!==0.02||p.unit!=="mg/kg"||
    p.concentration_factor!==null||p.finished_limit_numeric!==null||
    p.first_exact_source_verified!==true||
    p.all_contaminants_complete!==false||p.lab_pass!==false||
    p.full_compliance_pass!==false||
    p.source_article_match!=="RECIPE_DEMONSTRATES_CONCENTRATED_MILK_AND_CTR_EXPLICITLY_INCLUDES_DEHYDRATED_MILKS")return false;
 const officialLead=c.metal_article_rules_v9?.Lead?.filter(row=>
   row.article==="Milks"&&row.limit===0.02&&row.unit==="mg/kg"&&
   row.condition===p.concentration_condition&&row.row_type==="exact"&&
   row.auto_apply===false&&row.verification==="official_fssai_v9_direct");
 if(officialLead?.length!==1)return false;
 let partial=0,pending=0,changes=0;
 if(new Set(now.records.map(r=>r.catalog_id)).size!==533)return false;
 for(let i=0;i<533;i++){
  const a=previous.records[i],b=now.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||
    a.product_name!==b.product_name||
    String(a.fssr||"")!==String(b.fssr||"")||
    String(a.fcs||"")!==String(b.fcs||"")||
    b.regulatory_coverage!=="PARTIAL_OR_PENDING"||
    b.complete_contaminant_panel!==false||
    b.product_compliance_approval!==false||b.sample_lab_pass!==false)return false;
  if(b.catalog_id===pmsv2026GolakaId){
    changes++;
    if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
      b.missing_first_exact_evidence!==false||
      b.regulatory_source_verified_delta?.official!==m.official_contaminants||
      b.regulatory_source_verified_delta?.recipe_source!==m.official_recipe||
      b.regulatory_source_verified_delta?.applicable_article!=="Milks"||
      b.regulatory_source_verified_delta?.base_limit!==0.02||
      b.regulatory_source_verified_delta?.unit!=="mg/kg"||
      b.regulatory_source_verified_delta?.concentration_factor_required!==true||
      b.regulatory_source_verified_delta?.concentration_factor_verified!==false||
      b.regulatory_source_verified_delta?.computed_limit!==null||
      b.regulatory_source_verified_delta?.evidence_count!==1||
      b.regulatory_source_verified_delta?.evidence_class!==
       "verified_only_milk_reduced_milk_concentration_factor_lead")return false;
  }else if(JSON.stringify(a)!==JSON.stringify(b))return false;
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
  else return false;
 }
 return changes===1&&partial===421&&pending===112;
}
var pmsv2026BeforeGolakaLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv2026BeforeGolakaLoader();
 pmsv2026GolakaManifest=null;pmsv2026Current421Ledger=null;
 try{
  const r=await Promise.all([
   fetch("./data/rules/fssai-golaka-dugdha-affirmative-concentrated-milk-lead-first-source-2026-10-12.json?v=20261012-golaka421",{cache:"reload"}),
   fetch("./data/rules/fssai-current-first-source-533-live-ledger-421-112-2026-10-12.json?v=20261012-current421",{cache:"reload"})]);
  if(r.some(x=>!x.ok))throw Error("Canonical current source files unavailable");
  const docs=await Promise.all(r.map(x=>x.json()));
  pmsv2026GolakaManifest=docs[0];pmsv2026Current421Ledger=docs[1];
  if(!pmsv2026GolakaFirstSourceValid())throw Error("Canonical 421/112 exact article proof mismatch");
 }catch(e){pmsv2026GolakaManifest=null;pmsv2026Current421Ledger=null;}
};
function pmsv2026Current421Html(p){
 if(!p||!pmsv2026Current421Ledger)return "";
 const safe=typeof esc==="function"?esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 if(!pmsv2026GolakaFirstSourceValid())
  return '<div class="notice"><b>Latest first-source status withheld.</b> Exact FSSAI source, identity, concentration condition or ledger consistency failed validation; no compliance result.</div>';
 const d=pmsv2026Current421Ledger,m=pmsv2026GolakaManifest;
 const r=d.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
    String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))
   return '<div class="notice"><b>First-source state withheld: catalogue identity mismatch.</b></div>';
 const isGolaka=p.id===pmsv2026GolakaId;
 let html='<details class="card" style="margin-top:12px"><summary><b>Current official FSSAI first-source ledger</b> — '+
 (r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL EXACT SOURCE MATCH":"FIRST EXACT SOURCE PENDING")+
 '</summary><div class="notice"><b>NOT A PRODUCT COMPLIANCE PASS.</b> 533 total; 421 first-source partial; 112 first-source pending. No complete regulatory or laboratory approval.</div>';
 if(isGolaka){
  html+='<p><b>Positive match:</b> Only cow milk is required for official recipe 14.1; repeatedly boiling and reducing it produces a concentrated milk product. FSSAI CTR Version IX expressly covers partially or wholly dehydrated milks under its <b>Milks</b> lead article.</p>'+
  '<p><b>Lead reference:</b> 0.02 mg/kg × <b>verified concentration factor</b>. The latter is not yet available, so the final allowable concentration and any product compliance decision are withheld.</p>'+
  '<p><b>Unresolved:</b> actual product concentration factor; remaining contaminants, residues, microbiology and laboratory evidence.</p>'+
  '<p><small><a href="'+safe(m.official_recipe)+'" target="_blank" rel="noopener noreferrer">Official FSSAI 2025 Ayurveda Aahara recipe 14.1</a> · '+
  '<a href="'+safe(m.official_contaminants)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR Version IX, §2.1 Lead: Milks</a></small></p>';
 }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING"){
  html+='<p>No exact applicable first finished-food contaminant source article has yet been proven for this product identity.</p>';
 }else html+='<p>This entry has at least one verified first exact source article. Other contaminant and regulatory requirements remain open.</p>';
 return html+'</details>';
}
var pmsv2026BeforeCurrent421Render=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 const status=pmsv2026Current421Html(p);
 if(!pmsv2026GolakaFirstSourceValid())return status;
 if(p.id===pmsv2026GolakaId)return status;
 let other=pmsv2026BeforeCurrent421Render(p);
 // Replace (not append to) the 420/113 canonical card; the archived record
 // remains available as a file, but its old totals cannot masquerade as current.
 other=other.replace(/<details class="card" style="margin-top:12px"><summary><b>Current official FSSAI first-source ledger<\/b>[\s\S]*?<\/details>/,"");
 return status+other;
};