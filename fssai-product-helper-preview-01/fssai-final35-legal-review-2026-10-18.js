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
 d.innerHTML='<summary><b>35 public-source reviews completed · legal/lot verification OPEN</b></summary><p>All 533 catalogue entries have a documented first-source research disposition: 498 conditional reference matches plus these 35 individually researched cases without a confirmed applicable exact contaminant article. This completes the public-source review queue, NOT product-specific legal applicability, laboratory validation or lot approval. The 35 require identity/scope evidence before a number can be assigned.</p><p><button type="button" data-f35-load>Open 35 source-research dossiers</button> <button type="button" data-f35-export disabled>Export filtered research CSV</button></p><p data-f35-status role="status" aria-live="polite">First load extended FSSAI evidence panels.</p><div class="checker-grid"><div class="field"><label>Priority</label><select data-f35-priority><option value="ALL">All 35</option><option value="P0">P0 · 13</option><option value="P1">P1 · 22</option></select></div><div class="field"><label>Named published product identity</label><select data-f35-identity><option value="ALL">All</option><option value="YES">Named identity · 28</option><option value="NO">Grouped / unidentified · 7</option></select></div></div><div class="field"><label>Test/analyte family</label><select data-f35-analyte><option value="ALL">All analytes (35)</option></select></div><div class="field"><label>Search by product, analyte or outstanding legal question</label><input type="search" data-f35-search placeholder="Cocoa, lead, Ayurveda…" maxlength="120"></div><div class="tablewrap" style="max-height:580px;overflow:auto" role="region" tabindex="0" aria-label="35 HELD product legal source reviews"><table style="min-width:1160px"><thead><tr><th>Case</th><th>Product / analyte</th><th>Unresolved legal applicability and FSSAI source</th><th>Published product identity</th><th>First missing commercial proof</th><th>Analytical-method / matrix safety</th></tr></thead><tbody data-f35-rows></tbody></table></div><p class="countline">175 original documentary requests remain NOT SENT / NOT RECEIVED. No original signed legal applicability, accredited method scope, actual representative lot CoA, product PASS or release. Do not upload confidential files into this public preview.</p>';
 previous.insertAdjacentElement("afterend",d);return true;
}
function block(message){
 const d=document.getElementById("pmsv-final35-legal-review");if(!d)return;
 d.querySelector("[data-f35-status]").textContent=message||"Source integrity blocked; all cases HELD.";
 d.querySelector("[data-f35-export]").disabled=true;d.querySelector("[data-f35-rows]").replaceChildren();b84Clear();
}
function rows(){
 if(!verified())return[];
 const d=document.getElementById("pmsv-final35-legal-review"),
  p=d.querySelector("[data-f35-priority]").value,
  i=d.querySelector("[data-f35-identity]").value,
  a=d.querySelector("[data-f35-analyte]").value,
  q=d.querySelector("[data-f35-search]").value.trim().toLowerCase();
 return audit.rows.filter(r=>(p==="ALL"||r.priority===p)&&(i==="ALL"||(i==="YES"&&r.published_named_product_standard_located)||(i==="NO"&&!r.published_named_product_standard_located))&&(a==="ALL"||r.analyte===a)&&(!q||[r.rank,r.product,r.analyte,r.scope_question_type,r.exact_source_decision_question,r.first_missing_authoritative_manufacturer_proof,r.explicit_analytical_guard].some(x=>String(x??"").toLowerCase().includes(q)))).sort((x,y)=>x.priority.localeCompare(y.priority)||x.rank-y.rank);
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
 d.querySelector("[data-f35-export]").disabled=false;b84Render();return true
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
function exportFile(){
 if(!render())return false;const content=csv();if(!content)return false;
 const u=URL.createObjectURL(new Blob(["\uFEFF"+content],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");
 a.href=u;a.download="PMSV-35-PENDING-SUBSTANTIVE-LEGAL-REVIEW-HELD.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true
}
document.addEventListener("click",e=>{if(e.target?.closest?.("[data-f35-load]"))load();else if(e.target?.closest?.("[data-f35-export]"))exportFile()});
document.addEventListener("input",e=>{if(e.target?.matches?.("[data-f35-search]"))render()});
document.addEventListener("change",e=>{if(e.target?.matches?.("[data-f35-priority],[data-f35-identity],[data-f35-analyte]"))render()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvFinal35LegalReview=Object.freeze({install,load,render,csv,verified});

/* Batch84: 23 original food-article numeric comparators. Source-only reference,
   never a legal determination for the 35 named cases, and never a lot PASS. */
const B84_CTR="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const B84_SCOPE=Object.freeze([[1,"Lead","Packaged drinking water (other than mineral water)",0.01,"mg/L",5,"Vended/dispensed water is not established to be packaged drinking water.","Outlet packaging format, point-of-sale route and representative sampling point."],[2,"Ochratoxin A","Coffee",5,"µg/kg",15,"Coffee-chicory mixture is a separately described blend, not expressly the unblended coffee article.","Final declared coffee/chicory percentages, form and original Gazette scope opinion."],[7,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"Plant-derived coconut milk powder is not mammalian milk; dairy protein addition does not by itself establish the milk article.","Coconut/dairy ingredient BOM and spray-dried final composition."],[8,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"Whole cocoa beans are not processed cocoa powder and cannot inherit its dry-fat-free measurement basis.","Bean versus nib/roasted sample identity and fat/moisture."],[9,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"A sugar-cocoa blend is not pure cocoa powder; the finished matrix and expression basis differ.","Final cocoa and sugar percentages plus dry-mix identity."],[10,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"Cocoa mass/liquor and cocoa cake are not automatically cocoa powder and have different fat basis.","Separate mass/liquor versus press cake SKU and fat percentage."],[11,"Lead","Cereal grains excluding buckwheat, canihua and quinoa",0.2,"mg/kg",3,"Chia is a botanical seed, not thereby a cereal grain.","Botanical Salvia hispanica authentication and whole/ground form."],[12,"Lead","Cocoa powder (dry-fat-free basis)",5,"mg/kg dry-fat-free",3,"Carob pod powder is not cocoa powder despite colour and use.","Authenticated Ceratonia siliqua roasted-pod powder identity."],[14,"Lead","Cereal grains excluding buckwheat, canihua and quinoa",0.2,"mg/kg",3,"Water chestnut flour is not a cereal grain simply because it is called atta.","Trapa nut flour identity and additives/mixture proof."],[15,"Lead","Meat of cattle, sheep and pig",0.1,"mg/kg",5,"Natural salted casings are not automatically muscle meat or meat fat.","Species, tissue, cleaned/brined/dried state and test basis."],[16,"2,4-D pesticide residue","Eggs (shell-free basis; specific 2,4-D entry only)",0.05,"mg/kg",16,"An individual pesticide's eggs entry is not a universal dry egg-powder MRL.","Pesticide identity and whole/yolk/albumen dehydration factor."],[17,"2,4-D pesticide residue","Eggs (shell-free basis; specific 2,4-D entry only)",0.05,"mg/kg",16,"Shell-free eggs are not the whole pickled egg-plus-brine product or every pesticide.","Named residue, species, egg/brine composition and test portion."],[18,"Lead","Solid glucose and starch-conversion products with sulphated ash exceeding 1%",5,"mg/kg",4,"The high-ash article does NOT match dried glucose syrup conforming to FSSR maximum sulphated ash 1.0%.","Original product standard, DE and measured sulphated ash."],[20,"Chromium","Refined sugar",0.02,"mg/kg",13,"Misri may be manufactured from sugar or palmyrah juice; appearance alone does not establish refined sugar.","Original feedstock, manufacturing process and marketed form."],[21,"Nickel","Sorbitol",2,"mg/kg",13,"The named sorbitol value does not cover unnamed other polyols or polyol blends.","Individual named polyol with INS/CAS and grade."],[22,"Lead","Salt, food grade",2,"mg/kg",6,"Mixed mineral salt substitutes are not necessarily standardized food-grade NaCl.","Every potassium/sodium salt and additive in the recipe."],[25,"Lead","Sodium benzoate",2,"mg/kg",6,"One named additive impurity provision cannot become a universal Appendix-A additive lead limit.","Exact permitted additive INS/CAS, use and supplier grade."],[28,"Total aflatoxins","Food product containing any of the specified commodity articles",20,"µg/kg",14,"The 'containing' row applies only when its named commodity condition is met; it is NOT one maximum for all nutraceutical schedule ingredients or AFB1.","Individual Schedule IV/VI/VIII botanical and whether B1 or total target."],[29,"Total aflatoxins","Food product containing any of the specified commodity articles",20,"µg/kg",14,"Without an actual ingredient list, the conditional 'containing' row cannot be assigned to every functional premix.","Signed premix BOM and named nuts/oilseeds/cereals/spices."],[30,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"A colostrum concentrate/product is not automatically the milk article.","Source species, colostrum stage, dry solids and formulation."],[32,"Lead","Foods not specified (potential fallback only)",2.5,"mg/kg",4,"The generic fallback is not automatically applicable to edible metallic silver leaf; metal-specific and product-identity rules must be checked.","Genuine edible silver fineness and signed operative case classification."],[33,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"Ayurvedic coconut/dairy dessert is a finished composite food, not solely milk.","Actual licensed Narikela Ksheerika recipe and coconut/milk proportions."],[34,"Lead","Milks (dehydration concentration factor applies)",0.02,"mg/kg",5,"Herbal milk-based Ksheerapaka is a prepared multi-ingredient article, not automatically plain milk.","Actual licensed Ksheerapaka recipe and finished dilution/solids."]]);
function b84Panel(){
 const host=document.getElementById("pmsv-final35-legal-review");
 if(!host)return null;
 let d=document.getElementById("pmsv-b84-named-article-evidence");
 if(d)return d;
 d=document.createElement("details");d.id="pmsv-b84-named-article-evidence";d.className="card";
 d.style.maxWidth="100%";d.style.boxSizing="border-box";d.style.padding="10px";d.style.margin="12px 0";
 const sum=document.createElement("summary");sum.textContent="23 original FSSAI named-article comparisons · not automatically applicable";d.appendChild(sum);
 const intro=document.createElement("p");intro.textContent="Exact numeric amounts below belong ONLY to the named source articles. They are NOT assigned contaminant limits for the listed 35 commercial products. They cannot generate a legal, method or lot PASS.";d.appendChild(intro);
 const label=document.createElement("label");label.textContent="Select an unresolved product for source comparison ";
 const select=document.createElement("select");select.dataset.b84Case="";select.style.width="100%";select.style.maxWidth="100%";
 const opt=document.createElement("option");opt.textContent="Verify 35-case research to view examples";opt.value="";select.appendChild(opt);
 label.appendChild(select);d.appendChild(label);
 const output=document.createElement("div");output.dataset.b84Result="";output.setAttribute("role","status");output.setAttribute("aria-live","polite");output.style.marginTop="10px";
 output.textContent="Verify 35 original cases first. No legal scope determination.";d.appendChild(output);
 const button=document.createElement("button");button.type="button";button.dataset.b84Export="";button.disabled=true;
 button.textContent="Export 23 documented article comparisons (NOT APPLIED)";d.appendChild(button);
 const caution=document.createElement("p");caution.textContent="Source: FSSAI February 2026 CTR Version IX reference consolidation. Before legal adoption check original Gazette notifications, effective dates, more specific entries and the actual marketed product. No documents uploaded, no email sent, no numeric compliance decisions.";
 d.appendChild(caution);
 const region=host.querySelector(".tablewrap");if(!region)return null;
 region.insertAdjacentElement("beforebegin",d);return d
}
function b84Clear(){
 const d=b84Panel();if(!d)return;
 const out=d.querySelector("[data-b84-result]");out.replaceChildren();
 out.textContent="Source chain unverified: no article applicability or numeric PASS.";
 d.querySelector("[data-b84-export]").disabled=true
}
function b84Render(){
 const d=b84Panel();if(!d)return false;
 if(!verified()){b84Clear();return false}
 const rowsByRank=new Map(audit.rows.map(x=>[x.rank,x]));
 if(rowsByRank.size!==35||B84_SCOPE.length!==23||B84_SCOPE.some(x=>!rowsByRank.has(x[0]))){b84Clear();return false}
 const sel=d.querySelector("[data-b84-case]"),prior=sel.value;
 sel.replaceChildren();
 for(const x of B84_SCOPE){const r=rowsByRank.get(x[0]);const opt=document.createElement("option");
 opt.value=String(x[0]);opt.textContent="#"+r.rank+" · "+r.product;sel.appendChild(opt)}
 if([...sel.options].some(x=>x.value===prior))sel.value=prior;
 const x=B84_SCOPE.find(x=>String(x[0])===sel.value),r=rowsByRank.get(x[0]);
 const out=d.querySelector("[data-b84-result]");out.replaceChildren();
 const make=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el};
 out.appendChild(make("p",r.priority+" #"+r.rank+" · "+r.product+" — "+r.analyte));
 out.appendChild(make("p","Published named article (not assigned): "+x[2]));
 out.appendChild(make("p",x[1]+" source comparator: "+x[3]+" "+x[4]+". Exact legal article applicability = NOT SIGNED."));
 out.appendChild(make("p","Why the comparator cannot be inherited: "+x[6]));
 out.appendChild(make("p","Original market evidence still needed: "+x[7]));
 const link=document.createElement("a");link.href=B84_CTR+"#page="+x[5];
 link.target="_blank";link.rel="noopener noreferrer";
 link.textContent="Inspect official FSSAI CTR Version IX reference page "+x[5];
 out.appendChild(link);out.appendChild(make("p","Status: CASE HELD · no legally adopted limit, validated matrix method, original lot CoA or product release."));
 d.querySelector("[data-b84-export]").disabled=false;return true
}
function b84CSV(){
 if(!verified())return"";
 const byRank=new Map(audit.rows.map(x=>[x.rank,x]));
 if(byRank.size!==35||B84_SCOPE.length!==23)return"";
 const esc=v=>{let s=String(v??"");if(/^\\s*[=+@\\-\\t\\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 const a=[["case_rank","original_case_id","case_product","case_analyte","source_comparator_analyte","official_named_article","published_amount_NOT_APPLIED","unit","FSSAI_reference_page","why_not_transferable","market_evidence_needed","case_legal_applicability","lot_release"]];
 for(const x of B84_SCOPE){const r=byRank.get(x[0]);if(!r)return"";
 a.push([r.rank,r.case_id,r.product,r.analyte,x[1],x[2],x[3],x[4],B84_CTR+"#page="+x[5],x[6],x[7],"NOT_SIGNED","HELD"])}
 return a.map(x=>x.map(esc).join(",")).join("\\r\\n")+"\\r\\n"
}
function b84Export(){
 if(!b84Render())return false;
 const csv=b84CSV();if(!csv)return false;
 const url=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-23-CTR-ARTICLE-COMPARATORS-NOT-APPLIED.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true
}
document.addEventListener("change",e=>{if(e.target?.matches?.("[data-b84-case]"))b84Render()});
document.addEventListener("click",e=>{if(e.target?.closest?.("[data-b84-export]"))b84Export()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",b84Panel,{once:true});else b84Panel();
window.pmsvB84NamedArticleScope=Object.freeze({render:b84Render,csv:b84CSV,
 get:()=>B84_SCOPE.map(x=>x.slice()),verified:()=>verified()});

})();