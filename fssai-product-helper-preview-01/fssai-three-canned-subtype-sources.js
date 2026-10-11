"use strict";
// Positive *canned subtype route* evidence, not actual user product selection or PASS.
var pmsvThreeCannedSubtypeDb=null;
// Explicitly local and per product. A user's claim of a canned subtype is not lab verification.
var pmsvDeclaredCannedSubtypeByProduct=Object.create(null);
function pmsvSetCannedSubtypeForCurrentProduct(code){
 if(typeof selectedCatalogProductForContaminants!=="function")return;
 const p=selectedCatalogProductForContaminants();
 const m=pmsvThreeCannedSubtypeDb?.records?.find(x=>x.catalog_id===p?.id);
 if(!m)return;
 const valid=new Set(["__unconfirmed__","__not_canned__",...m.subtype_source_rows.map(x=>x.selector)]);
 if(!valid.has(code))return;
 pmsvDeclaredCannedSubtypeByProduct[p.id]=code;
 if(typeof renderProductContaminants==="function")renderProductContaminants();
}

async function pmsvLoadThreeCannedSubtypeProof(){
 try{
  const r=await fetch("./data/rules/fssai-three-canned-finished-subtype-source-proof-2026-10-11.json?v=20261011-3canned",{cache:"reload"});
  if(!r.ok)throw new Error("FSSAI canned variants unavailable");
  const d=await r.json();
  if(d.catalogue!==533||d.partial_exact!==414||d.remaining_first_exact!==119||
     d.products_conditionally_qualified!==3||d.number_of_qualified_named_canned_forms!==8||
     d.source_metal_rows_for_qualified_forms!==16||d.new_unconditional_first_source_products!==0||
     d.first_exact_pending_after!==119||d.full_finished_product_compliance_pass!==0||d.records?.length!==3)
    throw new Error("Canned variants integrity failure");
  pmsvThreeCannedSubtypeDb=d;
 }catch(e){pmsvThreeCannedSubtypeDb=null;}
}
function pmsvCannedSubtypeSourceMatches(r,db){
 const norm=s=>String(s??"").toLowerCase().replace(/[^a-z0-9]+/g,"");
 const t=(db?.metal_article_rules_v9?.Tin||[]).filter(x=>
    x.row_type==="exact"&&x.limit===r.tin_limit&&x.unit===r.tin_unit&&norm(x.article)===norm(r.tin_article));
 const l=(db?.metal_article_rules_v9?.Lead||[]).filter(x=>
    x.row_type==="exact"&&x.limit===r.lead_limit&&x.unit===r.lead_unit&&norm(x.article)===norm(r.lead_article));
 return l.length===1&&t.length===1;
}
function sourcePinnedThreeCannedVariantProofHtml(p){
 if(!p||!["04-04-1-thermally-processed-fruit-salad-cocktail-mix",
            "04-04-1-thermally-processed-fruits",
            "04-04-2-thermally-processed-vegetables"].includes(p.id))return "";
 const unavailable='<div class="notice"><b>Named canned subtype source evidence withheld.</b> Cannot authenticate FSSAI source, product identity, named article, units or legal packing scope. No numbers apply.</div>';
 const d=pmsvThreeCannedSubtypeDb,base=contaminantsDb;
 const ctr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
 const chapter="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf";
 if(!d||!base||d.records?.length!==3||d.catalogue!==533||d.partial_exact!==414||
    d.remaining_first_exact!==119||d.products_conditionally_qualified!==3||
    d.number_of_qualified_named_canned_forms!==8||d.source_metal_rows_for_qualified_forms!==16||
    d.new_unconditional_first_source_products!==0||d.first_exact_pending_after!==119||
    d.full_finished_product_compliance_pass!==0||d.source_ctr!==ctr||d.source_fssr!==chapter||
    d.status!=="CANNED_VARIANTS_POSITIVELY_NAMED_ARTICLES__ACTUAL_SUBTYPE_UNCONFIRMED"||
    base.source_version!=="Version IX (03.02.2026)"||base.official_sources?.[0]?.url!==ctr)
  return unavailable;
 const ids=new Set(d.records.map(z=>z.catalog_id));
 if(ids.size!==3||d.records.some(z=>z.subtype_source_rows?.length<2||
     z.identity_level_conditional_source_family_found!==true||
     z.actual_manufacturer_finished_subtype_proven!==false||
     z.first_exact_source_evidence_promoted!==false||z.finished_product_limit_auto_applied!==false||
     z.complete_contaminant_compliance!==false||
     z.other_pack_forms?.length!==3||
     z.other_pack_forms.some(x=>x.canned_source_article_applies!==false)||
     z.subtype_source_rows.some(x=>x.numeric_limit_auto_applied!==false||
       x.lab_compliance_pass!==false||x.requires_both_packaging_and_species_confirmation!==true||
       !pmsvCannedSubtypeSourceMatches(x,base))))return unavailable;
 const entry=d.records.find(x=>x.catalog_id===p.id);
 if(!entry||entry.product_name!==p.name||entry.fssr!==p.fssr||entry.fcs!==p.fcs)return unavailable;
 const chosen=pmsvDeclaredCannedSubtypeByProduct[p.id]||"__unconfirmed__";
 const recognized=new Set(["__unconfirmed__","__not_canned__",...entry.subtype_source_rows.map(x=>x.selector)]);
 if(!recognized.has(chosen))return unavailable;
 const specific=entry.subtype_source_rows.find(x=>x.selector===chosen)||null;
 const opt=[
  ['__unconfirmed__','Not yet confirmed — no applied limits'],
  ['__not_canned__','Not canned: bottled, flexible or aseptically packed'],
  ...entry.subtype_source_rows.map(x=>[x.selector,'Actual canned product: '+x.lead_article])
 ].map(([v,label])=>'<option value="'+esc(v)+'"'+(v===chosen?' selected':'')+'>'+esc(label)+'</option>').join("");
 const formHtml='<label><b>Confirm actual finished-product identity and pack (local only):</b></label>'+
  '<select aria-label="Actual fruit or vegetable canned variant" onchange="pmsvSetCannedSubtypeForCurrentProduct(this.value)" style="max-width:100%;width:100%;margin-top:5px;padding:8px;border-radius:6px">'+opt+'</select>';
 const selectedHtml=specific?'<div class="notice"><b>Manufacturer-declared matching article only:</b> '+esc(specific.lead_article)+
   '; Lead <b>'+esc(specific.lead_limit)+' '+esc(specific.lead_unit)+'</b>, Tin <b>'+esc(specific.tin_limit)+' '+esc(specific.tin_unit)+
   '</b>. Selection is not documentary verification; product, packaging, method, other requirements and batch analysis must still be verified. <b>NO COMPLIANCE PASS.</b></div>'
  :chosen==="__not_canned__"?'<div class="notice"><b>Non-canned form:</b> these canned-specific limits have not been assigned. Assess the actual bottled, flexible or aseptic product independently.</div>'
  :'<div class="notice"><b>No confirmed finished canned subtype.</b> Named source rows below remain research references only, not applied limits.</div>';
 const rows=entry.subtype_source_rows.map(x=>
   '<tr><td>'+esc(x.lead_article)+'</td><td><b>'+esc(x.lead_limit)+' '+esc(x.lead_unit)+'</b></td>'+
   '<td><b>'+esc(x.tin_limit)+' '+esc(x.tin_unit)+'</b></td><td>Canned finished food only. Species and actual sealed can must be confirmed. NOT APPLIED.</td></tr>').join("");
 return '<details class="card" style="margin-top:12px"><summary><b>Official FSSAI canned-form source articles</b> — '+entry.subtype_source_rows.length+
  ' qualified subtypes; NOT APPLIED</summary>'+
  '<div class="notice"><b>Positive named subtype sources, not a confirmed production lot.</b> The product standard permits a canned version, but also bottled, flexible and aseptic packs. The canned lead and tin limits below must not be auto-applied to those other packs or to an unverified fruit/vegetable variety.</div>'+
  formHtml+selectedHtml+
  '<div class="tablewrap"><table><thead><tr><th>Exact canned form</th><th>Lead maximum</th><th>Tin maximum</th><th>Applicability gate</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<p><b>Required before application:</b> identify species and recipe, verify actual canning/packaging, sample preparation, effective amendments and every other applicable limit. No completed contaminant or laboratory PASS.</p>'+
  '<small><a href="'+esc(chapter)+'" target="_blank" rel="noopener noreferrer">Official FSSR Chapter 2.3</a> · <a href="'+esc(ctr)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR Version IX</a></small></details>';
}
