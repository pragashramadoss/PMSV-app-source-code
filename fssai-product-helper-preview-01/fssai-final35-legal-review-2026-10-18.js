(function(){"use strict";
const PIN="45d0bd4d38c6ceb8",URL="./data/rules/fssai-final35-legal-candidate-audit-2026-10-17.json";
let audit=null,busy=false;
function stateOK(){const s=window.pmsvB70ExtendedResearch?.getState?.();return s?.core==="READY"&&s.extended==="READY"&&s.all35Held===true&&s.caseApprovals===0&&s.labPasses===0&&s.productReleases===0&&window.pmsvB59CTRSourceCrosswalk?.valid?.()}
function verified(){
 try{
  if(!stateOK()||!audit||typeof pmsvB14Digest!=="function"||pmsvB14Digest(audit)!==PIN)return false;
  const t=audit.totals,prior=window.pmsvB59CTRSourceCrosswalk.getAllCases();
  if(audit.kind!=="PMSV_FINAL35_LEGAL_CANDIDATE_RESEARCH_NOT_APPROVAL"||audit.as_of!=="2026-10-17"||t.catalogue!==533||t.original_cases!==35||t.p0!==13||t.p1!==22||t.unique_original_evidence_requests!==175||t.regulatory_approvals!==0||t.lab_method_scope_approvals!==0||t.original_lot_coas!==0||t.lot_releases!==0||audit.rows?.length!==35||prior?.length!==35)return false;
  const previous=new Map(prior.map(r=>[r.catalogue_id,r])),seen=new Set(),gates=new Set();let p0=0,p1=0,named=0;
  for(const r of audit.rows){
   const old=previous.get(r.case_id);
   if(!old||seen.has(r.case_id)||r.rank!==old.rank||r.priority!==old.priority||r.product!==old.product_name||r.analyte!==old.analyte||r.original_documentary_request_IDs!==old.original_request_ids?.join(" | ")||old.case_signed_legal_applicability!==false||old.actual_market_material_authenticated!==false||old.method_and_lab_scope_approved!==false||old.representative_lot_pass!==false||r.current_assigned_legal_limit!=="NOT_SIGNED"||r.current_lab_method_scope!=="NOT_SIGNED"||r.actual_market_material!=="NOT_AUTHENTICATED"||r.actual_lot_CoA!=="NOT_RECEIVED"||r.release!=="HELD"||!r.exact_source_decision_question||!r.first_missing_authoritative_manufacturer_proof||!/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i.test(r.official_source_research_URL))return false;
   seen.add(r.case_id);r.priority==="P0"?p0++:p1++;
   if(r.published_named_product_standard_located===true)named++;
   else if(r.published_named_product_standard_located!==false)return false;
   for(const gate of old.original_request_ids){if(gates.has(gate))return false;gates.add(gate)}
  }
  return seen.size===35&&gates.size===175&&p0===13&&p1===22&&named===28;
 }catch(_){return false}
}
function install(){
 if(document.getElementById("pmsv-final35-legal-review"))return true;
 const previous=document.getElementById("pmsv-b76-case-dossier");if(!previous)return false;
 const d=document.createElement("details");d.id="pmsv-final35-legal-review";d.className="card";
 d.innerHTML='<summary><b>35 public-source reviews completed · legal/lot verification OPEN</b></summary><p>All 533 catalogue entries have a documented first-source research disposition: 498 conditional reference matches plus these 35 individually researched cases without a confirmed applicable exact contaminant article. This completes the public-source review queue, NOT product-specific legal applicability, laboratory validation or lot approval. The 35 require identity/scope evidence before a number can be assigned.</p><p><button type="button" data-f35-load>Open 35 source-research dossiers</button> <button type="button" data-f35-export disabled>Export filtered research CSV</button> <button type="button" data-f35-ledger-export disabled>Export all 533 source-status records</button></p><p data-f35-status role="status" aria-live="polite">First load extended FSSAI evidence panels.</p><div class="checker-grid"><div class="field"><label>Priority</label><select data-f35-priority><option value="ALL">All 35</option><option value="P0">P0 · 13</option><option value="P1">P1 · 22</option></select></div><div class="field"><label>Named published product identity</label><select data-f35-identity><option value="ALL">All</option><option value="YES">Named identity · 28</option><option value="NO">Grouped / unidentified · 7</option></select></div></div><div class="field"><label>Test/analyte family</label><select data-f35-analyte><option value="ALL">All analytes (35)</option></select></div><div class="field"><label>Search by product, analyte or outstanding legal question</label><input type="search" data-f35-search placeholder="Cocoa, lead, Ayurveda…" maxlength="120"></div><div class="tablewrap" style="max-height:580px;overflow:auto" role="region" tabindex="0" aria-label="35 HELD product legal source reviews"><table style="min-width:1160px"><thead><tr><th>Case</th><th>Product / analyte</th><th>Unresolved legal applicability and FSSAI source</th><th>Published product identity</th><th>First missing commercial proof</th><th>Analytical-method / matrix safety</th></tr></thead><tbody data-f35-rows></tbody></table></div><p class="countline">175 original documentary requests remain NOT SENT / NOT RECEIVED. No original signed legal applicability, accredited method scope, actual representative lot CoA, product PASS or release. Do not upload confidential files into this public preview.</p>';
 previous.insertAdjacentElement("afterend",d);return true;
}
function block(message){
 const d=document.getElementById("pmsv-final35-legal-review");if(!d)return;
 d.querySelector("[data-f35-status]").textContent=message||"Source integrity blocked; all cases HELD.";
 d.querySelector("[data-f35-export]").disabled=true;d.querySelector("[data-f35-ledger-export]").disabled=true;d.querySelector("[data-f35-rows]").replaceChildren();b84Clear();
}
function rows(){
 if(!verified())return[];
 const d=document.getElementById("pmsv-final35-legal-review"),
  p=d.querySelector("[data-f35-priority]").value,
  i=d.querySelector("[data-f35-identity]").value,
  a=d.querySelector("[data-f35-analyte]").value,
  q=d.querySelector("[data-f35-search]").value.trim().toLowerCase();
 return audit.rows.filter(r=>(p==="ALL"||r.priority===p)&&(i==="ALL"||(i==="YES"&&r.published_named_product_standard_located)||(i==="NO"&&!r.published_named_product_standard_located))&&(a==="ALL"||r.analyte===a)&&(!q||[r.rank,r.case_id,r.product,r.analyte,r.scope_question_type,r.exact_source_decision_question,r.first_missing_authoritative_manufacturer_proof,r.explicit_analytical_guard].some(x=>String(x??"").toLowerCase().includes(q)))).sort((x,y)=>x.priority.localeCompare(y.priority)||x.rank-y.rank);
}
function render(){
 if(!install())return false;if(!verified()){block();return false}
 const d=document.getElementById("pmsv-final35-legal-review"),body=d.querySelector("[data-f35-rows]"),analyte=d.querySelector("[data-f35-analyte]");
 if(analyte.options.length===1){for(const a of [...new Set(audit.rows.map(x=>x.analyte))].sort()){const op=document.createElement("option");op.value=a;op.textContent=a+" ("+audit.rows.filter(x=>x.analyte===a).length+")";analyte.appendChild(op)}}
 const filtered=rows();body.replaceChildren();
 const make=(tag,s)=>{const e=document.createElement(tag);e.textContent=String(s);return e};
 for(const r of filtered){
  const tr=document.createElement("tr"),product=make("td",r.product),question=make("td",r.exact_source_decision_question),identity=make("td",r.published_named_product_standard_located?"Named identity reference found (commercial material not verified)":"Grouped article: exact substance not confirmed");
  product.appendChild(make("small",r.analyte+" · "+r.case_id));
  const link=make("a","Official FSSAI research source");link.href=r.official_source_research_URL;link.target="_blank";link.rel="noopener noreferrer";question.appendChild(link);
  if(r.published_FSSR_identity_clause)identity.appendChild(make("small","FSSR "+r.published_FSSR_identity_clause));
  const status=make("small",r.original_notice_topic_authenticated===true?
   "Original Gazette topic located; this finished-product applicability NOT signed":
   "Operative original Gazette applicability NOT signed");
 question.appendChild(status);
 const lab=make("td","Laboratory method and matrix scope NOT SIGNED");
 const disclosure=document.createElement("details");
 disclosure.appendChild(make("summary","Review analyte/matrix method caveat"));
 disclosure.appendChild(make("p",r.explicit_analytical_guard));
 disclosure.appendChild(make("small","Method adoption: "+r.laboratory_required_method_adoption_status+"; matrix: "+r.laboratory_required_matrix_scope_status+"; achieved LOQ: "+r.laboratory_actual_LOQ+". No PASS."));
 lab.appendChild(disclosure);
 for(const td of [make("td",r.priority+" #"+r.rank),product,question,identity,make("td",r.first_missing_authoritative_manufacturer_proof),lab])tr.appendChild(td);
  body.appendChild(tr);
 }
 d.querySelector("[data-f35-status]").textContent="Public-source review verified: "+filtered.length+" of 35 listed · 13 P0 / 22 P1 · 28 named / 7 grouped · 9 analyte groups · 175 original proof IDs OPEN · 0 approvals.";
 d.querySelector("[data-f35-export]").disabled=false;d.querySelector("[data-f35-ledger-export]").disabled=false;b84Render();return true
}
async function load(){
 if(busy)return false;if(!install()||!stateOK()){audit=null;block("Load extended FSSAI evidence panels and verify them first.");return false}
 busy=true;block("Checking all 35 original-source review records…");
 try{const response=await fetch(URL+"?v=20261018-f35",{cache:"no-store"});if(!response.ok)throw Error("Source missing");audit=await response.json();if(!verified())throw Error("Source invalid");return render()}
 catch(_){audit=null;block("Source integrity failed or the research file is unavailable. All 35 held.");return false}
 finally{busy=false}
}
function csv(){
 if(!verified())return"";
 const escape=x=>{let s=String(x??"");if(/^\s*[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 const lines=[["rank","priority","case_id","product","analyte","legal_question_type","legal_candidate_NOT_APPROVED","unresolved_legal_question","first_missing_commercial_proof","published_named_identity","FSSR_identity_clause","original_gazette_topic_authenticated","analytical_method_matrix_guard","laboratory_method_adoption_state","laboratory_matrix_scope_state","laboratory_actual_LOQ","five_original_request_IDs","source_URL","legal_approval","lab_scope","original_lot_CoA","release"]];
 for(const r of rows())lines.push([r.rank,r.priority,r.case_id,r.product,r.analyte,r.scope_question_type,r.regulatory_candidate_NOT_APPROVED,r.exact_source_decision_question,r.first_missing_authoritative_manufacturer_proof,r.published_named_product_standard_located,r.published_FSSR_identity_clause,r.original_notice_topic_authenticated,r.explicit_analytical_guard,r.laboratory_required_method_adoption_status,r.laboratory_required_matrix_scope_status,r.laboratory_actual_LOQ,r.original_documentary_request_IDs,r.official_source_research_URL,"NOT_SIGNED","NOT_SIGNED","NOT_RECEIVED","HELD"]);
 return lines.map(r=>r.map(escape).join(",")).join("\r\n")+"\r\n"
}
/* Batch86: verified, product-level, 533-record machine-readable export. Source mapping
   is not an analyte clearance. Immutable baseline and held-case join must both agree. */
function ledgerCsv(){
 if(!verified()||typeof pmsv498Valid!=="function"||!pmsv498Valid()||!pmsv498Ledger)return"";
 const all=pmsv498Ledger.records;
 if(!Array.isArray(all)||all.length!==533||pmsv498Ledger.catalogue!==533||
 pmsv498Ledger.partial_exact!==498||pmsv498Ledger.first_source_pending!==35)return"";
 const held=new Map(audit.rows.map(r=>[r.case_id,r]));
 if(held.size!==35)return"";
 let partial=0,pending=0;
 const seen=new Set();
 const values=[["catalog_id","product_name","fssr_identity_reference","fscs_code","first_source_status","desk_research","exact_legal_applicability","contaminant_panel_complete","signed_case_limit","lab_result_pass","lot_release","case_priority","case_analyte","case_research_question","first_manufacturer_evidence","official_research_source"]];
 const escape=x=>{let v=String(x??"");if(/^\s*[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"'};
 for(const r of all){
  if(!r||!r.catalog_id||seen.has(r.catalog_id)||!r.product_name||
   r.product_compliance_approval!==false||r.sample_lab_pass!==false||
   r.complete_contaminant_panel!==false)return"";
  seen.add(r.catalog_id);
  const p=held.get(r.catalog_id);
  if(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"){
   if(p)return"";partial++;
  }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING"){
   if(!p||p.product!==r.product_name||p.release!=="HELD"||
    p.current_assigned_legal_limit!=="NOT_SIGNED")return"";
   pending++;held.delete(r.catalog_id);
  }else return"";
  values.push([r.catalog_id,r.product_name,r.fssr,r.fcs,r.source_status,
   p?"ORIGINAL_SOURCE_DESK_REVIEW_COMPLETED":"CONDITIONAL_FIRST_SOURCE_REFERENCE",
   p?"SOURCE_SCOPE_REQUIRES_ADJUDICATION":"REFERENCE_ONLY_NOT_COMPLIANCE",
   "NO","NOT_SIGNED","NOT_VERIFIED","HELD",
   p?.priority||"",p?.analyte||"",p?.exact_source_decision_question||"",
   p?.first_missing_authoritative_manufacturer_proof||"",p?.official_source_research_URL||""]);
 }
 if(partial!==498||pending!==35||held.size!==0||seen.size!==533||values.length!==534)return"";
 return values.map(row=>row.map(escape).join(",")).join("\r\n")+"\r\n";
}
function downloadCSV(content,fileName){
 if(!content||!verified())return false;
 const u=window.URL.createObjectURL(new Blob(["\uFEFF"+content],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download=fileName;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>window.URL.revokeObjectURL(u),1000);
 return true
}
function exportFile(){
 if(!render())return false;
 return downloadCSV(csv(),"PMSV-35-FILTERED-LEGAL-SOURCE-REVIEW-HELD.csv")
}
function exportAll533(){
 if(!render())return false;
 return downloadCSV(ledgerCsv(),"PMSV-533-FIRST-SOURCE-STATUS-NOT-COMPLIANCE.csv")
}
document.addEventListener("click",e=>{if(e.target?.closest?.("[data-f35-load]"))load();else if(e.target?.closest?.("[data-f35-export]"))exportFile();else if(e.target?.closest?.("[data-f35-ledger-export]"))exportAll533()});
document.addEventListener("input",e=>{if(e.target?.matches?.("[data-f35-search]"))render()});
document.addEventListener("change",e=>{if(e.target?.matches?.("[data-f35-priority],[data-f35-identity],[data-f35-analyte]"))render()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvFinal35LegalReview=Object.freeze({install,load,render,csv,ledgerCsv,verified});

/* Batch84: 23 original food-article numeric comparators. Source-only reference,
   never a legal determination for the 35 named cases, and never a lot PASS. */
const B84_CTR="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const B84_SCOPE=Object.freeze([[1,"Lead","Packaged drinking water (other than mineral water)",0.01,"mg/L",5,"Vended/dispensed water is not established to be packaged drinking water.","Outlet packaging format, point-of-sale route and representative sampling point."],[2,"Ochratoxin A","Coffee",5,"µg/kg",15,"Coffee-chicory mixture is a separately described blend, not expressly the unblended coffee article.","Final declared coffee/chicory percentages, form and original Gazette scope opinion."],[7,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"Plant-derived coconut milk powder is not mammalian milk; dairy protein addition does not by itself establish the milk article.","Coconut/dairy ingredient BOM and spray-dried final composition."],[8,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"Whole cocoa beans are not processed cocoa powder and cannot inherit its dry-fat-free measurement basis.","Bean versus nib/roasted sample identity and fat/moisture."],[9,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"A sugar-cocoa blend is not pure cocoa powder; the finished matrix and expression basis differ.","Final cocoa and sugar percentages plus dry-mix identity."],[10,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"Cocoa mass/liquor and cocoa cake are not automatically cocoa powder and have different fat basis.","Separate mass/liquor versus press cake SKU and fat percentage."],[11,"Lead","Cereal grains excluding buckwheat, canihua and quinoa",0.2,"mg/kg",3,"Chia is a botanical seed, not thereby a cereal grain.","Botanical Salvia hispanica authentication and whole/ground form."],[12,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"Carob pod powder is not cocoa powder despite colour and use.","Authenticated Ceratonia siliqua roasted-pod powder identity."],[14,"Lead","Cereal grains excluding buckwheat, canihua and quinoa",0.2,"mg/kg",3,"Water chestnut flour is not a cereal grain simply because it is called atta.","Trapa nut flour identity and additives/mixture proof."],[15,"Lead","Meat of cattle, sheep and pig",0.1,"mg/kg",5,"Natural salted casings are not automatically muscle meat or meat fat.","Species, tissue, cleaned/brined/dried state and test basis."],[16,"2,4-D pesticide residue","Eggs (shell-free basis; specific 2,4-D entry only)",0.05,"mg/kg",16,"An individual pesticide's eggs entry is not a universal dry egg-powder MRL.","Pesticide identity and whole/yolk/albumen dehydration factor."],[17,"2,4-D pesticide residue","Eggs (shell-free basis; specific 2,4-D entry only)",0.05,"mg/kg",16,"Shell-free eggs are not the whole pickled egg-plus-brine product or every pesticide.","Named residue, species, egg/brine composition and test portion."],[18,"Lead","Solid glucose and starch-conversion products with sulphated ash exceeding 1%",5,"mg/kg",4,"The high-ash article does NOT match dried glucose syrup conforming to FSSR maximum sulphated ash 1.0%.","Original product standard, DE and measured sulphated ash."],[20,"Chromium","Refined sugar",0.02,"mg/kg",13,"Misri may be manufactured from sugar or palmyrah juice; appearance alone does not establish refined sugar.","Original feedstock, manufacturing process and marketed form."],[21,"Nickel","Sorbitol",2,"mg/kg",13,"The named sorbitol value does not cover unnamed other polyols or polyol blends.","Individual named polyol with INS/CAS and grade."],[22,"Lead","Salt, food grade",2,"mg/kg",6,"Mixed mineral salt substitutes are not necessarily standardized food-grade NaCl.","Every potassium/sodium salt and additive in the recipe."],[25,"Lead","Sodium benzoate",2,"mg/kg",6,"One named additive impurity provision cannot become a universal Appendix-A additive lead limit.","Exact permitted additive INS/CAS, use and supplier grade."],[28,"Total aflatoxins","Food product containing any of the specified commodity articles",20,"µg/kg",14,"The 'containing' row applies only when its named commodity condition is met; it is NOT one maximum for all nutraceutical schedule ingredients or AFB1.","Individual Schedule IV/VI/VIII botanical and whether B1 or total target."],[29,"Total aflatoxins","Food product containing any of the specified commodity articles",20,"µg/kg",14,"Without an actual ingredient list, the conditional 'containing' row cannot be assigned to every functional premix.","Signed premix BOM and named nuts/oilseeds/cereals/spices."],[30,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"A colostrum concentrate/product is not automatically the milk article.","Source species, colostrum stage, dry solids and formulation."],[32,"Lead","Foods not specified (potential fallback only)",2.5,"mg/kg",4,"The generic fallback is not automatically applicable to edible metallic silver leaf; metal-specific and product-identity rules must be checked.","Genuine edible silver fineness and signed operative case classification."],[33,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"Ayurvedic coconut/dairy dessert is a finished composite food, not solely milk.","Actual licensed Narikela Ksheerika recipe and coconut/milk proportions."],[34,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"Herbal milk-based Ksheerapaka is a prepared multi-ingredient article, not automatically plain milk.","Actual licensed Ksheerapaka recipe and finished dilution/solids."]]);
/* Batch85: 12 remaining original cases without a defensible single numeric finished-food contaminant limit. */
const B85_SCOPE=Object.freeze([[3,"Lead","Infant milk substitutes / infant foods are separately named; 'formulated supplements for children' requires age/category identification",null,"",4,"The CTR infant-food metal entry is not a rule for every child supplement; no single age/recipe-independent lead maximum follows from this category.","Label, intended age, directions, license category, full formulation."],[4,"Residues","CTR 2.3.1: named pesticide × specified fruit/crop MRL table; not an all-residues number",null,"",16,"No pesticide or particular fruit is named and freezing/mixtures may affect the edible sample basis; neither the 2,4-D fruit row nor a fallback is a universal product limit.","Fruit crop(s), pesticide identity and residue definition, IQF/whole/mixed processing, edible portion."],[5,"Lead","Edible catechu (FSSR 2.11.2); CTR foods-not-specified is only a possible fallback after exclusions",null,"",4,"Acacia catechu extract is not betelnut/pan masala and its product standard does not itself select a specific CTR lead article.","Manufacturer botanical/extract grade, additives, market label and legal fallback interpretation."],[6,"Copper","CTR copper article 'Pulp and pulp products of any fruit' contrasted with 'Foods not specified'",null,"",7,"Seedless tamarind may be dried de-seeded flesh rather than pulp or puree; selecting the pulp row without process identity is unsupported.","Seedless flesh versus puree/pulp/concentrate specification, added ingredients and solids content."],[13,"Pesticide MRLs","CTR 2.3.1: pesticide×commodity rows; FSSR 2.4.14 defines arrowroot as purified rhizome starch",null,"",16,"A potato or cassava pesticide MRL cannot be assumed for purified Maranta/Curcuma arrowroot without named pesticide and processing applicability.","Plant species, purified starch versus flour, origin, named residue and process/concentration factor."],[19,"Lead","FSSR 2.1.20 purified edible lactose standard and CTR's separate milk / secondary milk product rows",null,"",5,"Whey-derived purified lactose is not automatically liquid milk, dehydrated milk, or refined sucrose; neither the dairy origin nor FSSR identity establishes the metal row.","Dry lactose purity, whey source, moisture, ash method, actual lot and legal food/article mapping."],[23,"Lead","CTR lead high-sulphated-ash sugars and named refined-white-sugar entries; separate trehalose substance identity",null,"",2,"Trehalose is not one of the named refined white sugar/dextrose entries, and total ash does not prove >1% sulphated ash.","Trehalose CAS/grade, current FSSR chapter 3 standard, measured sulphated ash and intended use."],[24,"Lead","CTR lead 'liquid pectin, chemicals not otherwise specified, used as ingredients' contrasted with named alkali compounds",null,"",4,"The marketing term Sajji Khar does not establish sodium hydroxide, potassium carbonate or another chemical monograph, so no chemical limit can be assigned.","Exact mineral/CAS composition, original manufacturer and food-grade specifications, license/application status."],[26,"Lead","CTR Pb table has separately named additive compounds and purity rows, not one VA–VF additive-category article",null,"",6,"Former nutraceutical VA–VF schedule membership is not a single chemical identity or an operative all-additive Pb ceiling.","Current named additive schedule permission, INS/CAS, carrier, supplier grade and monograph."],[27,"Lead","CTR Pb 'chemicals not otherwise specified' and named enzyme-related chemical rows; check actual enzyme preparation scope",null,"",4,"A purified enzyme, an enzyme-carrier blend and a processing aid have different permitted roles; a generic enzyme class is not an identified chemical article.","Named enzyme EC, production organism, processing-aid/additive use, carriers, impurities and method matrix."],[31,"Antibiotics","CTR 2.3.2(3) honey-production antibiotic MRPL table, not an explicit royal-jelly article",null,"",40,"Royal jelly comes from bees but is not automatically honey; the honey-production scope cannot be assumed for royal jelly or every antimicrobial.","Pure versus formulated royal-jelly identity, bee-farm production records, exact antibiotic, legal commodity coverage."],[35,"Lead","CTR Pb high-ash solid glucose / starch-conversion article contrasted with soluble dextrin dietary fibre",null,"",4,"Soluble dextrin fibre is not automatically solid glucose or high-sulphated-ash syrup; the threshold and identity are not established.","Fibre DP distribution, glucose content, starting starch, sulphated ash and finished ingredient specification."]]);
const B85_ALL_SCOPE=Object.freeze([...B84_SCOPE,...B85_SCOPE].sort((a,b)=>a[0]-b[0]));
function b84Panel(){
 const host=document.getElementById("pmsv-final35-legal-review");
 if(!host)return null;
 let d=document.getElementById("pmsv-b84-named-article-evidence");
 if(d)return d;
 d=document.createElement("details");d.id="pmsv-b84-named-article-evidence";d.className="card";
 d.style.maxWidth="100%";d.style.boxSizing="border-box";d.style.padding="10px";d.style.margin="12px 0";
 const sum=document.createElement("summary");sum.textContent="All 35 cases: 23 numeric source comparisons + 12 scope-only original-law decisions";d.appendChild(sum);
 const intro=document.createElement("p");intro.textContent="All 35 cases have original-law source scopes. The 23 published numeric examples belong ONLY to named source articles, not to the held commercial product. The remaining 12 have NO single defensible numeric limit in this research. No case, method or lot PASS.";d.appendChild(intro);
 const label=document.createElement("label");label.textContent="Select an unresolved product for source comparison ";
 const select=document.createElement("select");select.dataset.b84Case="";select.style.width="100%";select.style.maxWidth="100%";
 const opt=document.createElement("option");opt.textContent="Verify 35-case research to view examples";opt.value="";select.appendChild(opt);
 label.appendChild(select);d.appendChild(label);
 const output=document.createElement("div");output.dataset.b84Result="";output.setAttribute("role","status");output.setAttribute("aria-live","polite");output.style.marginTop="10px";
 output.textContent="Verify 35 original cases first. No legal scope determination.";d.appendChild(output);
 const button=document.createElement("button");button.type="button";button.dataset.b84Export="";button.disabled=true;
 button.textContent="Export all 35 original-law scope decisions (NOT APPLIED)";d.appendChild(button);
 const focus=document.createElement("button");focus.type="button";focus.dataset.b86Focus="";
 focus.textContent="Show selected case in the 35-case review";focus.style.marginLeft="8px";focus.disabled=true;d.appendChild(focus);
 const reset=document.createElement("button");reset.type="button";reset.dataset.b86Reset="";
 reset.textContent="Show all 35 cases";reset.style.marginLeft="8px";reset.disabled=true;d.appendChild(reset);
 const caution=document.createElement("p");caution.textContent="Source: FSSAI February 2026 CTR Version IX reference consolidation. Before legal adoption check original Gazette notifications, effective dates, more specific entries and the actual marketed product. No documents uploaded, no email sent, no numeric compliance decisions.";
 d.appendChild(caution);
 const region=host.querySelector(".tablewrap");if(!region)return null;
 region.insertAdjacentElement("beforebegin",d);return d
}
function b84Clear(){
 const d=b84Panel();if(!d)return;
 const out=d.querySelector("[data-b84-result]");out.replaceChildren();
 out.textContent="Source chain unverified: no article applicability or numeric PASS.";
 d.querySelector("[data-b84-export]").disabled=true;
 d.querySelector("[data-b86-focus]").disabled=true;d.querySelector("[data-b86-reset]").disabled=true
}
function b84Render(){
 const d=b84Panel();if(!d)return false;
 if(!verified()){b84Clear();return false}
 const rowsByRank=new Map(audit.rows.map(x=>[x.rank,x]));
 if(rowsByRank.size!==35||B84_SCOPE.length!==23||B85_SCOPE.length!==12||B85_ALL_SCOPE.length!==35||new Set(B85_ALL_SCOPE.map(x=>x[0])).size!==35||B85_ALL_SCOPE.some(x=>!rowsByRank.has(x[0]))){b84Clear();return false}
 const sel=d.querySelector("[data-b84-case]"),prior=sel.value;
 sel.replaceChildren();
 for(const x of B85_ALL_SCOPE){const r=rowsByRank.get(x[0]);const opt=document.createElement("option");
 opt.value=String(x[0]);opt.textContent="#"+r.rank+" · "+r.product;sel.appendChild(opt)}
 if([...sel.options].some(x=>x.value===prior))sel.value=prior;
 const x=B85_ALL_SCOPE.find(x=>String(x[0])===sel.value),r=rowsByRank.get(x[0]);
 const out=d.querySelector("[data-b84-result]");out.replaceChildren();
 const make=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el};
 out.appendChild(make("p",r.priority+" #"+r.rank+" · "+r.product+" — "+r.analyte));
 out.appendChild(make("p","Published named article (not assigned): "+x[2]));
 out.appendChild(make("p",x[3]===null?"NO SINGLE NUMERIC LIMIT AVAILABLE from this category as stated. Exact source scope and commercial applicability = NOT SIGNED.":x[1]+" source comparator: "+x[3]+" "+x[4]+". The comparator is NOT ASSIGNED to this product. Exact legal applicability = NOT SIGNED."));
 out.appendChild(make("p","Why the comparator cannot be inherited: "+x[6]));
 out.appendChild(make("p","Original market evidence still needed: "+x[7]));
 const link=document.createElement("a");link.href=B84_CTR+"#page="+x[5];
 link.target="_blank";link.rel="noopener noreferrer";
 link.textContent="Inspect official FSSAI CTR Version IX reference page "+x[5];
 out.appendChild(link);out.appendChild(make("p","Status: CASE HELD · no legally adopted limit, validated matrix method, original lot CoA or product release."));
 d.querySelector("[data-b84-export]").disabled=false;d.querySelector("[data-b86-focus]").disabled=false;d.querySelector("[data-b86-reset]").disabled=false;return true
}
function b84CSV(){
 if(!verified())return"";
 const byRank=new Map(audit.rows.map(x=>[x.rank,x]));
 if(byRank.size!==35||B84_SCOPE.length!==23||B85_SCOPE.length!==12||B85_ALL_SCOPE.length!==35||new Set(B85_ALL_SCOPE.map(x=>x[0])).size!==35)return"";
 const esc=v=>{let s=String(v??"");if(/^\s*[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 const a=[["case_rank","original_case_id","case_product","case_analyte","source_comparator_analyte","official_named_article","published_amount_NOT_APPLIED","unit","FSSAI_reference_page","why_not_transferable","market_evidence_needed","case_legal_applicability","lot_release"]];
 for(const x of B85_ALL_SCOPE){const r=byRank.get(x[0]);if(!r)return"";
 a.push([r.rank,r.case_id,r.product,r.analyte,x[1],x[2],x[3]===null?"":x[3],x[3]===null?"":x[4],B84_CTR+"#page="+x[5],x[6],x[7],"NOT_SIGNED","HELD"])}
 return a.map(x=>x.map(esc).join(",")).join("\r\n")+"\r\n"
}
function b84Export(){
 if(!b84Render())return false;
 const csv=b84CSV();if(!csv)return false;
 const url=window.URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-35-CTR-ORIGINAL-ARTICLE-SCOPE-NOT-APPLIED.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>window.URL.revokeObjectURL(url),1000);return true
}
/* Explicit action only: do not surprise users by silently changing the filtered review. */
function b86Focus(){
 if(!verified()||!b84Render())return false;
 const d=document.getElementById("pmsv-final35-legal-review");
 const selected=d?.querySelector("[data-b84-case]")?.value;
 const r=audit.rows.find(x=>String(x.rank)===selected);
 if(!r)return false;
 d.querySelector("[data-f35-priority]").value="ALL";
 d.querySelector("[data-f35-identity]").value="ALL";
 d.querySelector("[data-f35-analyte]").value="ALL";
 d.querySelector("[data-f35-search]").value=r.case_id;
 const result=render();
 if(result){d.open=true;const tr=d.querySelector("[data-f35-rows] tr");tr?.scrollIntoView({block:"nearest",behavior:"auto"});}
 return result&&rows().length===1
}
function b86Reset(){
 if(!verified())return false;
 const d=document.getElementById("pmsv-final35-legal-review");if(!d)return false;
 d.querySelector("[data-f35-priority]").value="ALL";
 d.querySelector("[data-f35-identity]").value="ALL";
 d.querySelector("[data-f35-analyte]").value="ALL";
 d.querySelector("[data-f35-search]").value="";
 return render()&&rows().length===35
}
document.addEventListener("change",e=>{if(e.target?.matches?.("[data-b84-case]"))b84Render()});
document.addEventListener("click",e=>{if(e.target?.closest?.("[data-b84-export]"))b84Export();else if(e.target?.closest?.("[data-b86-focus]"))b86Focus();else if(e.target?.closest?.("[data-b86-reset]"))b86Reset()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",b84Panel,{once:true});else b84Panel();
window.pmsvB84NamedArticleScope=Object.freeze({render:b84Render,csv:b84CSV,
 get:()=>B84_SCOPE.map(x=>x.slice()),getAll:()=>B85_ALL_SCOPE.map(x=>x.slice()),focus:b86Focus,reset:b86Reset,verified:()=>verified()});

})();

/* Batch87 — searchable, verified 533-item research-status catalogue.
   Uses only the pinned existing B86/B59 data and explicit user-initiated loading.
   No legal limits, uploads, persistent user state, document send or lot release. */
(function(){"use strict";
const PAGE=50, HELD="FIRST_EXACT_SOURCE_PENDING", PARTIAL="PARTIAL_EXACT_SOURCE_MATCH";
let page=0, ready=false;
const make=(tag,s,attrs)=>{
 const n=document.createElement(tag);
 if(s!==undefined)n.textContent=String(s);
 for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,v);
 return n;
};
function verify(){
 try{
  const s=window.pmsvB70ExtendedResearch?.getState?.();
  if(s?.core!=="READY"||s.extended!=="READY"||s.all35Held!==true||
     s.caseApprovals!==0||s.labPasses!==0||s.productReleases!==0||
     !window.pmsvFinal35LegalReview?.verified?.()||
     typeof pmsv498Valid!=="function"||!pmsv498Valid()||
     !window.pmsvB59CTRSourceCrosswalk?.valid?.())return null;
  const ledger=pmsv498Ledger;
  const cases=window.pmsvB59CTRSourceCrosswalk.getAllCases?.();
  if(ledger?.catalogue!==533||ledger.partial_exact!==498||
     ledger.first_source_pending!==35||ledger.full_compliance_approvals!==0||
     ledger.records?.length!==533||cases?.length!==35)return null;
  const held=new Map(),proof=new Set();let p0=0,p1=0;
  for(const c of cases){
   if(!c?.catalogue_id||held.has(c.catalogue_id)||
      !Array.isArray(c.original_request_ids)||c.original_request_ids.length!==5||
      c.case_signed_legal_applicability!==false||
      c.actual_market_material_authenticated!==false||
      c.method_and_lab_scope_approved!==false||c.representative_lot_pass!==false)return null;
   if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else return null;
   for(const id of c.original_request_ids){if(!id||proof.has(id))return null;proof.add(id)}
   held.set(c.catalogue_id,c);
  }
  if(p0!==13||p1!==22||proof.size!==175)return null;
  const seen=new Set(),items=[];let partial=0,pending=0;
  for(const r of ledger.records){
   if(!r?.catalog_id||seen.has(r.catalog_id)||!r.product_name||
      r.product_compliance_approval!==false||
      r.complete_contaminant_panel!==false||r.sample_lab_pass!==false)return null;
   seen.add(r.catalog_id);
   const c=held.get(r.catalog_id);
   if(r.source_status===PARTIAL){if(c)return null;partial++}
   else if(r.source_status===HELD){
    if(!c||c.product_name!==r.product_name||
       !c.analyte||!Number.isInteger(c.rank))return null;
    pending++;held.delete(r.catalog_id)
   }else return null;
   items.push({catalog_id:r.catalog_id,product_name:r.product_name,
      fssr:String(r.fssr??""),fcs:String(r.fcs??""),
      source_status:r.source_status,case:c||null});
  }
  if(seen.size!==533||partial!==498||pending!==35||held.size!==0)return null;
  return items.sort((a,b)=>a.product_name.localeCompare(b.product_name,"en")||
    a.catalog_id.localeCompare(b.catalog_id,"en"));
 }catch(_){return null}
}
function install(){
 if(document.getElementById("pmsv-b87-catalogue"))return true;
 const host=document.getElementById("pmsv-final35-legal-review");
 if(!host)return false;
 const d=make("details",undefined,{id:"pmsv-b87-catalogue",class:"card"});
 d.appendChild(make("summary","Batch87 · Browse all 533 product source-research records"));
 d.appendChild(make("p","Search the full FSSAI helper catalogue by product, catalogue ID, FSSR identity, FoSCoS code or held-case analyte. A source reference is NOT complete legal applicability, validated laboratory testing, product PASS or release."));
 const tools=make("div",undefined,{class:"pmsv-b87-controls"});
 const status=make("label","Source status");
 const sel=make("select",undefined,{"data-b87-status":""});
 [["ALL","All 533"],[PARTIAL,"498 conditional reference matches"],[HELD,"35 reviewed / legally HELD"]].forEach(([v,t])=>sel.appendChild(make("option",t,{value:v})));
 status.appendChild(sel);tools.appendChild(status);
 const q=make("label","Search product, ID, FSSR, FoSCoS or analyte");
 q.appendChild(make("input",undefined,{type:"search","data-b87-search":"","maxlength":"120",placeholder:"Search 533 products"}));
 tools.appendChild(q);d.appendChild(tools);
 const actions=make("div",undefined,{class:"pmsv-b87-actions"});
 const load=make("button","Verify sources and browse 533",{type:"button","data-b87-load":""});
 const exportBtn=make("button","Export filtered product CSV",{type:"button","data-b87-export":""});
 exportBtn.disabled=true;actions.append(load,exportBtn);d.appendChild(actions);
 d.appendChild(make("p","Extended research and 35-case legal audits must validate first. No confidential supplier materials may be uploaded.",{class:"pmsv-b87-note"}));
 d.appendChild(make("p","Not loaded. Source integrity must be verified before records are visible.",{"data-b87-count":"","role":"status","aria-live":"polite"}));
 const wrap=make("div",undefined,{class:"pmsv-b87-scroller",role:"region",tabindex:"0","aria-label":"533 product source research status table"});
 const table=make("table");const header=make("thead"),tr=make("tr");
 ["Product / ID","FSSR / FoSCoS identity","First-source research status","Held-case action"].forEach(s=>tr.appendChild(make("th",s)));
 header.appendChild(tr);table.appendChild(header);
 table.appendChild(make("tbody",undefined,{"data-b87-rows":""}));wrap.appendChild(table);d.appendChild(wrap);
 const nav=make("div",undefined,{class:"pmsv-b87-pages"});
 const prev=make("button","Previous 50",{type:"button","data-b87-prev":""});
 const next=make("button","Next 50",{type:"button","data-b87-next":""});
 const location=make("span","",{"data-b87-page":""});
 prev.disabled=true;next.disabled=true;nav.append(prev,location,next);d.appendChild(nav);
 d.appendChild(make("p","All 533: legal applicability NOT SIGNED; complete contaminant panel NO; tested-lot PASS NOT VERIFIED; lot release HELD. Original 175 evidence requests remain open.",{class:"pmsv-b87-note"}));
 host.insertAdjacentElement("afterend",d);
 if(!document.getElementById("pmsv-b87-style")){
  const style=make("style",`
  #pmsv-b87-catalogue{max-width:100%;box-sizing:border-box;margin:12px 0;padding:12px;overflow-wrap:anywhere}
  #pmsv-b87-catalogue summary{font-weight:750;cursor:pointer}
  .pmsv-b87-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
  .pmsv-b87-controls label{font-size:12px;font-weight:700}
  .pmsv-b87-controls input,.pmsv-b87-controls select{display:block;width:100%;max-width:100%;min-height:44px;margin-top:5px;padding:8px;border:1px solid #bac8db;border-radius:7px}
  .pmsv-b87-actions,.pmsv-b87-pages{display:flex;flex-wrap:wrap;gap:9px;margin:13px 0;align-items:center}
  .pmsv-b87-actions button,.pmsv-b87-pages button,#pmsv-b87-catalogue [data-b87-focus]{min-height:44px;white-space:normal}
  .pmsv-b87-actions button:disabled,.pmsv-b87-pages button:disabled{opacity:.46}
  .pmsv-b87-scroller{max-width:100%;overflow:auto;max-height:570px;overscroll-behavior-inline:contain}
  .pmsv-b87-scroller table{min-width:760px}
  .pmsv-b87-scroller td{vertical-align:top;overflow-wrap:anywhere}
  .pmsv-b87-note{font-size:12px;line-height:1.5}
  #pmsv-b87-catalogue :focus-visible{outline:3px solid #3759cf;outline-offset:2px}
  @media(max-width:700px){.pmsv-b87-controls{grid-template-columns:minmax(0,1fr)}.pmsv-b87-actions button{flex:1 1 100%}}
  `,{id:"pmsv-b87-style"});
  document.head.appendChild(style);
 }
 return true;
}
function filtered(data){
 const host=document.getElementById("pmsv-b87-catalogue");
 if(!host)return[];
 const status=host.querySelector("[data-b87-status]").value;
 const q=host.querySelector("[data-b87-search]").value.trim().toLocaleLowerCase("en");
 return data.filter(r=>(status==="ALL"||r.source_status===status)&&
  (!q||[r.product_name,r.catalog_id,r.fssr,r.fcs,r.case?.analyte,
      r.case?.priority,r.case?.rank].some(s=>String(s??"").toLocaleLowerCase("en").includes(q))));
}
function blocked(message){
 ready=false;page=0;
 const root=document.getElementById("pmsv-b87-catalogue");if(!root)return false;
 root.querySelector("[data-b87-rows]").replaceChildren();
 root.querySelector("[data-b87-count]").textContent=message||"Source validation failed. 0 records displayed, 0 approvals.";
 root.querySelector("[data-b87-page]").textContent="";
 for(const attr of ["data-b87-export","data-b87-prev","data-b87-next"])
  root.querySelector("["+attr+"]").disabled=true;
 return false;
}
function render(){
 if(!install()||!ready)return false;
 const all=verify();if(!all)return blocked("Source integrity unavailable or changed. All exports blocked; 35 cases remain HELD.");
 const host=document.getElementById("pmsv-b87-catalogue"),list=filtered(all);
 page=Math.min(page,Math.max(0,Math.ceil(list.length/PAGE)-1));
 const body=host.querySelector("[data-b87-rows]");body.replaceChildren();
 for(const r of list.slice(page*PAGE,(page+1)*PAGE)){
  const tr=make("tr"),id=make("td",r.product_name);
  id.appendChild(make("small","Catalogue ID: "+r.catalog_id));
  const identity=make("td","FSSR: "+(r.fssr||"Not specified")+" · FoSCoS: "+(r.fcs||"Not specified"));
  const state=make("td",r.case?"ORIGINAL-SOURCE REVIEWED · EXACT LEGAL SCOPE HELD":"CONDITIONAL FIRST-SOURCE REFERENCE · NOT COMPLIANCE");
  if(r.case)state.appendChild(make("small",r.case.priority+" · "+r.case.analyte+" · 5 original proof requests OPEN"));
  const action=make("td");
  if(r.case)action.appendChild(make("button","View held case",{type:"button","data-b87-focus":String(r.case.rank),"data-b87-case":r.catalog_id}));
  else action.textContent="No case-level legal or lot approval";
  [id,identity,state,action].forEach(td=>tr.appendChild(td));body.appendChild(tr);
 }
 host.querySelector("[data-b87-count]").textContent=list.length+" of 533 products matched · 498 conditional source references / 35 legally HELD · zero signed limits, method/lot approvals or releases.";
 host.querySelector("[data-b87-page]").textContent=list.length?"Showing "+(page*PAGE+1)+"–"+Math.min((page+1)*PAGE,list.length)+" of "+list.length:"0 matching products";
 host.querySelector("[data-b87-prev]").disabled=page===0;
 host.querySelector("[data-b87-next]").disabled=(page+1)*PAGE>=list.length;
 host.querySelector("[data-b87-export]").disabled=false;
 return true;
}
async function load(){
 if(!install())return blocked("Preview module not installed.");
 const root=document.getElementById("pmsv-b87-catalogue");root.open=true;
 if(ready)return render();
 blocked("Verifying official-source research and all 533 immutable catalogue records…");
 try{
  const state=window.pmsvB70ExtendedResearch?.getState?.();
  if(state?.core!=="READY")return blocked("Core FSSAI research is not READY. Review source panels first.");
  if(state.extended!=="READY")await window.pmsvB70ExtendedResearch.request();
  if(!await window.pmsvFinal35LegalReview?.load?.())return blocked("35-case official legal research not validated; catalogue withheld.");
  if(!verify())return blocked("First-source catalogue or 35-case evidence does not match; catalogue withheld.");
  ready=true;page=0;return render();
 }catch(_){return blocked("Unable to verify source data. All records withheld and cases HELD.")}
}
function csv(){
 if(!ready)return"";
 const all=verify();if(!all)return"";
 const output=[["catalogue_id","product","FSSR_identity","FoSCoS_code","source_status","case_priority","case_analyte","source_scope_legal_approval","full_contaminant_panel","lot_pass","lot_release"]];
 for(const r of filtered(all))output.push([r.catalog_id,r.product_name,r.fssr,r.fcs,
   r.source_status,r.case?.priority??"",r.case?.analyte??"","NOT_SIGNED","NO","NOT_VERIFIED","HELD"]);
 const quote=v=>{let s=String(v??"");if(/^\s*[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 return output.map(row=>row.map(quote).join(",")).join("\r\n")+"\r\n";
}
function exportCSV(){
 if(!render())return false;
 const value=csv();if(!value)return blocked("Export source integrity failed.");
 const url=window.URL.createObjectURL(new Blob(["\uFEFF"+value],{type:"text/csv;charset=utf-8"}));
 const a=make("a",undefined,{href:url,download:"PMSV-B87-FILTERED-533-SOURCE-STATUS-NOT-COMPLIANCE.csv"});
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>window.URL.revokeObjectURL(url),1000);return true;
}
function focus(rank,caseId){
 const all=verify();if(!all)return blocked("Case-link source integrity failed.");
 if(!all.some(x=>x.catalog_id===caseId&&x.case?.rank===rank))return false;
 const host=document.getElementById("pmsv-final35-legal-review");
 const picker=host?.querySelector("#pmsv-b84-named-article-evidence [data-b84-case]");
 if(!picker||![...picker.options].some(x=>x.value===String(rank)))return false;
 picker.value=String(rank);
 const success=window.pmsvB84NamedArticleScope?.focus?.();
 if(success){host.open=true;document.getElementById("pmsv-b84-named-article-evidence").open=true;host.scrollIntoView({behavior:"auto",block:"start"})}
 return success===true;
}
document.addEventListener("click",e=>{
 const b=e.target?.closest?.("#pmsv-b87-catalogue button");if(!b)return;
 if(b.hasAttribute("data-b87-load"))load();
 else if(b.hasAttribute("data-b87-export"))exportCSV();
 else if(b.hasAttribute("data-b87-prev")){page=Math.max(0,page-1);render()}
 else if(b.hasAttribute("data-b87-next")){page++;render()}
 else if(b.hasAttribute("data-b87-focus"))focus(Number(b.dataset.b87Focus),b.dataset.b87Case);
});
document.addEventListener("input",e=>{if(e.target?.matches?.("#pmsv-b87-catalogue [data-b87-search]")){page=0;render()}});
document.addEventListener("change",e=>{if(e.target?.matches?.("#pmsv-b87-catalogue [data-b87-status]")){page=0;render()}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvB87Catalogue=Object.freeze({load,render,csv,verify:()=>!!verify(),focus});
})();
