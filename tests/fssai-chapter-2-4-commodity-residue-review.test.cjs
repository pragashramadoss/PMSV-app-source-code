"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const catalog=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const chapter=catalog.filter(x=>String(x.fssr||"").startsWith("2.4."));
const reviews=db.chapter_2_4_commodity_mrl_review_v1;
const byId=new Map(reviews.map(x=>[x.catalog_id,x]));
const rowCount=new Map();
for(const x of db.residue_mrls.pesticides)for(const r of (x.rows||[])){
 const key=String(r.food||"").toLowerCase().trim();
 rowCount.set(key,(rowCount.get(key)||0)+1);
}
const s=(name)=>{
 const at=html.indexOf(name);assert.ok(at>=0,"Missing "+name);
 const end=html.indexOf("\nfunction ",at+name.length);
 assert.ok(end>at,"Missing next function "+name);
 return html.slice(at,end);
};
const ctx=vm.createContext({
 contaminantsDb:db,
 esc:x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
});
vm.runInContext(s("function exactCerealCommodityReview(p){")+"\n"+s("function productCerealCommodityMrlReviewHtml(p){"),ctx);
const run=(name,product)=>vm.runInContext(name+"("+JSON.stringify(product)+")",ctx);
const get=fragment=>{const x=chapter.find(p=>p.name.toLowerCase().includes(fragment.toLowerCase()));assert.ok(x,"Missing product "+fragment);return {product:x,review:byId.get(x.id)};};
test("exactly all 77 Chapter 2.4 identities are mapped to reference-only reviews",()=>{
 assert.equal(chapter.length,77);
 assert.equal(reviews.length,77);
 assert.equal(byId.size,77);
 assert.deepEqual(new Set(byId.keys()),new Set(chapter.map(x=>x.id)));
 for(const row of reviews){
  assert.equal(row.auto_apply_commodity_mrl,false,row.catalog_id);
  assert.equal(row.auto_apply_aflatoxin_category,false,row.catalog_id);
  assert.equal(row.full_product_regulatory_approval,false,row.catalog_id);
  assert.match(row.source_basis,/FSSAI CTR Version IX/);
  assert.ok(row.qualifier_review.length>40);
  assert.ok(["official_commodity_rows_present_applicability_pending","identity_review_pending_no_safe_direct_pesticide_route"].includes(row.scope_review_status));
  assert.equal(row.candidate_rows_in_loaded_official_source,row.candidate_commodity_articles.reduce((n,x)=>n+(rowCount.get(x.toLowerCase())||0),0));
  for(const article of row.candidate_commodity_articles)assert.ok(rowCount.has(article.toLowerCase()),article);
 }
});
test("wheat/rice/maize raw-grain MRLs never become wheat, rice, or jowar flour MRLs",()=>{
 const wheat=get("Wheat").review;
 const rice=get("Rice").review;
 const maize=get("Maize").review;
 const wheatFlour=get("Wheat Flour (Atta)").review;
 const jowarFlour=get("Jowar Flour").review;
 const riceFlour=get("Rice Flour for preparation").review;
 assert.ok(wheat.candidate_commodity_articles.includes("Wheat"));
 assert.ok(rice.candidate_commodity_articles.includes("Rice"));
 assert.ok(maize.candidate_commodity_articles.includes("Maize"));
 for(const row of [wheatFlour,jowarFlour,riceFlour]){
  assert.equal(row.scope,"milled_cereal_or_oilseed_flour");
  assert.ok(row.candidate_commodity_articles.some(x=>/milled|flour/i.test(x)));
  for(const raw of ["Rice","Wheat","Maize","Paddy","Sorghum"])
   assert.ok(!row.candidate_commodity_articles.includes(raw),row.product_name+" borrowed "+raw);
 }
});
test("soybean raw oilseed cannot inherit soya flour, cake, or oil residue figures",()=>{
 const row=get("Soybean").review;
 assert.equal(row.scope,"raw_oilseed");
 assert.ok(row.candidate_commodity_articles.some(x=>/soya bean|soyabean/i.test(x)));
 assert.ok(!row.candidate_commodity_articles.some(x=>/oil|flour|cake/i.test(x)));
});
test("solvent-extracted oilseed flour and processed soy products must not inherit raw oilseed MRLs",()=>{
 for(const name of ["Solvent Extract Soya Flour","Solvent Extracted Groundnut Flour","Textured Soy Protein","Tofu","Breakfast Cereal","Biscuit"]){
  const row=get(name).review;
  assert.deepEqual(row.candidate_commodity_articles,[],row.product_name);
  assert.equal(row.candidate_rows_in_loaded_official_source,0,row.product_name);
 }
});
test("runtime output for Jowar Flour includes milled-grain references, not raw Wheat/Rice residues",()=>{
 const p=get("Jowar Flour").product;
 const rendered=run("productCerealCommodityMrlReviewHtml",p);
 assert.match(rendered,/REVIEW ONLY · NOT APPLIED/);
 assert.match(rendered,/Milled food grains/);
 assert.doesNotMatch(rendered,/<b>Rice<\/b>|<b>Wheat<\/b>|<b>Sorghum<\/b>/);
 assert.match(rendered,/No MRL, crop-contaminant limit, or applicability is automatically approved/);
 assert.match(rendered,/Official FSSAI Version IX PDF/);
});
test("live Results UI renders source-only cereal panels separately from actual pesticide values",()=>{
 assert.match(html,/const cerealCommodityReview=productCerealCommodityMrlReviewHtml\(p\)/);
 assert.match(html,/\+cerealCommodityReview/);
 assert.match(html,/No safe direct commodity-pesticide candidate has been assigned/);
 const rendered=run("productCerealCommodityMrlReviewHtml",get("Tofu").product);
 assert.match(rendered,/No safe direct commodity-pesticide candidate has been assigned/);
 assert.doesNotMatch(rendered,/FSSAI commodity MRL reference/);
});

test("official Version IX Ochratoxin A and DON exact grouped articles map Wheat, Wheat Bran, and Coffee independently",()=>{
 const mappings=db.explicit_crop_contaminant_article_mappings_v9;
 assert.equal(mappings.length,3);
 assert.deepEqual(new Set(mappings.map(x=>x.catalog_id)),new Set(["06-06-1-wheat","06-06-2-wheat-bran","coffee"]));
 assert.equal(db.crop_contaminants.ochratoxin_a.rules[0].article,"Wheat, wheat bran, rye, barley, coffee");
 const snippet=s("function productBaselineContaminantRules(p){");
 const internal=vm.createContext({
   contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
   exactFinishedProductContaminantLock:()=>null,
   exactRawMeatMetalLock:()=>null,
   normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
   isVerifiedFermentedMilkProduct:()=>false
 });
 vm.runInContext(snippet,internal);
 const list=fragment=>{
   const product=catalog.find(p=>p.name.toLowerCase()===fragment.toLowerCase())
     ||get(fragment).product;
   return vm.runInContext("productBaselineContaminantRules("+JSON.stringify(product)+")",internal);
 };
 const named=x=>Array.from(list(x),r=>({contaminant:r.contaminant,limit:r.limit,unit:r.unit})).filter(r=>["Ochratoxin A","Deoxynivalenol"].includes(r.contaminant));
 for(const productName of ["Wheat","Wheat bran"]){
   const entries=named(productName);
   assert.deepEqual(entries,[{contaminant:"Ochratoxin A",limit:5,unit:"µg/kg"},{contaminant:"Deoxynivalenol",limit:1000,unit:"µg/kg"}],productName);
 }
 assert.deepEqual(named("Coffee"),[{contaminant:"Ochratoxin A",limit:5,unit:"µg/kg"}]);
 for(const productName of ["Wheat Flour (Atta)","Durum Wheat","Pearl Barley","Maida","Jowar Flour","Chicory","Coffee-Chicory Mixture","Barley Water","Wholemeal barley powder or barley flour or choker yukt jau ka churan"]){
   assert.deepEqual(named(productName),[],productName+" cannot borrow exact named article");
 }
 const changed=structuredClone(db);
 changed.crop_contaminants.ochratoxin_a.rules[0].limit=50;
 internal.contaminantsDb=changed;
 assert.deepEqual(named("Coffee"),[],"Coffee mapping must fail closed after crop master changes");
 const renamed=structuredClone(db);
 renamed.crop_contaminants.ochratoxin_a.rules[0].article="Wheat, wheat bran, rye, barley";
 internal.contaminantsDb=renamed;
 assert.deepEqual(named("Coffee"),[],"Coffee mapping must fail closed if coffee disappears from the grouped official article");
 internal.contaminantsDb=db;
 for(const row of mappings){
   assert.equal(row.exact_catalog_identity_verified,true);
   assert.equal(row.complete_contaminant_coverage,false);
   assert.equal(row.amendments_fully_reconciled,false);
   assert.match(row.official_source_url,/^https:\/\/fssai\.gov\.in\//);
 }
});


test("eleven non-equivalent Chapter 2.4 products do not borrow milled-grain pesticide MRLs",()=>{
 const expected=["06-06-2-wheat-protein-products-including-wheat-gluten","06-06-2-besan","06-06-2-roasted-bengal-gram-flour-chana-sattu","06-06-2-sago-flour","06-06-2-custard-powder","06-06-2-maize-starch","06-06-2-arrowroot","06-06-2-tapioca-sago","06-06-2-palm-sago-starch","06-06-2-cassava-or-tapioca-product-gari","06-06-2-edible-cassava-or-tapioca-flour"];
 assert.equal(new Set(expected).size,11);
 for(const id of expected){
  const row=byId.get(id);
  assert.ok(row,id);
  assert.deepEqual(row.candidate_commodity_articles,[],id);
  assert.equal(row.candidate_rows_in_loaded_official_source,0,id);
  assert.equal(row.scope_review_status,"identity_review_pending_no_safe_direct_pesticide_route",id);
  assert.equal(row.auto_apply_commodity_mrl,false,id);
  assert.ok(row.article_scope_correction?.official_source_url.startsWith("https://fssai.gov.in/"),id);
  assert.match(row.qualifier_review,/not|cannot|do not|needs|must/i,id);
  const p=chapter.find(p=>p.id===id);
  const rendered=run("productCerealCommodityMrlReviewHtml",p);
  assert.match(rendered,/No safe direct commodity-pesticide candidate has been assigned/,id);
  assert.doesNotMatch(rendered,/official commodity MRL reference/,id);
 }
});
test("cassava/sago correct pesticide scope does not suppress directly verified hydrocyanic-acid rule",()=>{
 const ids=["06-06-2-sago-flour","06-06-2-tapioca-sago","06-06-2-palm-sago-starch","06-06-2-cassava-or-tapioca-product-gari","06-06-2-edible-cassava-or-tapioca-flour"];
 const direct=db.profiles.find(p=>p.id==="sago-cassava-tapioca");
 assert.ok(direct);
 for(const id of ids){
  assert.ok(direct.catalog_ids.includes(id),id);
  assert.ok(direct.rules.some(r=>r.contaminant==="Hydrocyanic acid"&&r.limit===10),id);
  assert.deepEqual(byId.get(id).aflatoxin_reference_articles,[],id);
 }
});
test("pulse flour crop-contaminant candidates do not silently become cereal candidates",()=>{
 for(const id of ["06-06-2-besan","06-06-2-roasted-bengal-gram-flour-chana-sattu"]){
  const row=byId.get(id);
  assert.ok(row.aflatoxin_reference_articles.includes("Pulses"));
  assert.ok(!row.aflatoxin_reference_articles.includes("Cereal and cereal products"));
 }
 assert.match(html,/Chapter 2\.4 — FSSAI commodity residue review/);
});


test("Chapter 2.4 review-only status blocks direct exact-name pesticide approval (Rice, Wheat, Maize)",()=>{
 const pesticide=s("function exactPesticideMrlRowsForProduct(p){");
 const c=vm.createContext({
  contaminantsDb:db,
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  milkProductContaminantScope:()=>false
 });
 vm.runInContext(pesticide,c);
 const getRows=p=>Array.from(vm.runInContext("exactPesticideMrlRowsForProduct("+JSON.stringify(p)+")",c));
 for(const name of ["Rice","Wheat","Maize","Durum Wheat","Pearl Barley"]){
  const p=chapter.find(x=>x.name===name||(name==="Pearl Barley"&&x.name==="Pearl Barley (Jau)"));
  assert.ok(p,"Missing "+name);
  assert.deepEqual(getRows(p),[],name+" must be REVIEW ONLY");
  assert.ok(byId.get(p.id),name+" must retain its official source-reference panel");
 }
 const rice=chapter.find(x=>x.name==="Rice");
 const ref=run("productCerealCommodityMrlReviewHtml",rice);
 assert.match(ref,/\bRice\b/);
 assert.match(ref,/REVIEW ONLY · NOT APPLIED/);
 assert.match(ref,/official commodity MRL reference/);
 // Guard applies to exact catalogue identity; other chapters retain their existing route.
 const tea=getRows({id:"non-cereal-tea",name:"Tea",fssr:"2.10.0"});
 assert.ok(tea.length>0,"Non-Chapter 2.3/2.4 commodity behavior must remain unchanged");
});


test("pearl barley processing form must not auto-inherit raw barley Ochratoxin A or DON",()=>{
 const p=chapter.find(x=>x.id==="06-06-1-pearl-barley-jau");
 assert.ok(p);
 const crop=db.profiles.find(x=>x.id==="pearl-barley");
 assert.ok(crop);
 assert.ok(crop.rules.some(x=>x.contaminant==="Lead"));
 assert.ok(crop.rules.some(x=>x.contaminant==="Total Aflatoxins"));
 assert.ok(!crop.rules.some(x=>["Ochratoxin A","Deoxynivalenol"].includes(x.contaminant)), "Raw barley crop limits need processed form verification");
 const review=byId.get(p.id);
 assert.equal(review.scope,"pearled_cereal_grain_processing_form");
 assert.deepEqual(review.candidate_commodity_articles,[]);
 assert.equal(review.candidate_rows_in_loaded_official_source,0);
 assert.equal(review.scope_review_status,"identity_review_pending_no_safe_direct_pesticide_route");
 assert.equal(review.crop_contaminant_article_review_pending.length,2);
 assert.deepEqual(review.crop_contaminant_article_review_pending.map(x=>[x.contaminant,x.limit,x.unit]),[["Ochratoxin A",5,"µg/kg"],["Deoxynivalenol",1000,"µg/kg"]]);
 for(const row of review.crop_contaminant_article_review_pending){
  assert.equal(row.auto_apply,false);
  assert.match(row.official_grouped_article,/barley/);
  assert.ok(row.scope_status.includes("pearl_barley"));
 }
 const rendered=run("productCerealCommodityMrlReviewHtml",p);
 assert.match(rendered,/REVIEW ONLY/);
 assert.match(rendered,/No safe direct commodity-pesticide candidate/);
});


test("Pearl Barley shows source-linked OTA/DON values as not applied in the rendered review",()=>{
 const p=chapter.find(x=>x.id==="06-06-1-pearl-barley-jau");
 const rendered=run("productCerealCommodityMrlReviewHtml",p);
 assert.match(rendered,/Grouped crop-contaminant article/);
 assert.match(rendered,/NOT VERIFIED/);
 assert.match(rendered,/NOT APPLIED/);
 assert.match(rendered,/Ochratoxin A/);
 assert.match(rendered,/Deoxynivalenol/);
 assert.match(rendered,/Wheat, wheat bran, rye, barley, coffee/);
 assert.match(rendered,/1000 µg\/kg/);
 assert.match(rendered,/5 µg\/kg/);
 assert.match(rendered,/Official FSSAI Version IX PDF/);
 const rice=run("productCerealCommodityMrlReviewHtml",chapter.find(x=>x.id==="06-06-1-rice"));
 assert.doesNotMatch(rice,/Grouped crop-contaminant article/);
});


test("unprocessed raw pulses source 2.4.6(16) has exact aflatoxins and quality limits without processed pulse inheritance",()=>{
 const m=db.chapter_2_4_exact_unprocessed_raw_pulses_v9;
 assert.equal(m.catalog_id,"06-06-1-unprocessed-whole-raw-pulses-not-for-direct-human-consumption");
 assert.equal(m.existing_catalogue_fssr,"2.4.6");
 assert.equal(m.specific_source_clause,"2.4.6(16)");
 assert.equal(m.quality_clause_catalogue_link_status,"pending_master_and_search_index_reconciliation");
 assert.equal(m.pesticide_mrl_auto_apply,false);
 assert.equal(m.full_contaminant_coverage,false);
 const rules=JSON.parse(fs.readFileSync(path.join(root,"data/rules/chapter-2-4-cereals-v1.json"),"utf8"));
 const exact=rules.standards.find(x=>x.key===m.specific_source_clause);
 assert.ok(exact);
 assert.deepEqual(exact.general_limits.map(x=>x.value),[3,0.5]);
 assert.equal(exact.full_compliance_assessment_enabled,false);
 const idx=catalog.find(x=>x.id===m.catalog_id);assert.ok(idx);
 assert.equal(idx.fssr,m.existing_catalogue_fssr);
 const snippet=s("function productBaselineContaminantRules(p){");
 const internal=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
   exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
   normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
   isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(snippet,internal);
 const list=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",internal));
 const direct=list(idx).filter(x=>x.source_basis?.includes("exact unprocessed raw pulses"));
 assert.deepEqual(direct.map(x=>[x.contaminant,x.limit,x.unit]),[["Total Aflatoxins",15,"µg/kg"],["Aflatoxin B1",10,"µg/kg"]]);
 for(const id of m.excluded_other_forms){
  const p=catalog.find(x=>x.id===id);assert.ok(p,id);
  assert.equal(list(p).some(x=>x.source_basis?.includes("exact unprocessed raw pulses")),false,id);
 }
 const changed=structuredClone(db);
 changed.crop_contaminants.total_aflatoxins.rules.find(x=>x.article==="Pulses").limit=999;
 internal.contaminantsDb=changed;
 const after=list(idx).filter(x=>x.source_basis?.includes("exact unprocessed raw pulses"));
 assert.deepEqual(after.map(x=>x.contaminant),["Aflatoxin B1"]);
 const audit=fs.readFileSync(path.resolve(root,"../scripts/audit-fssai-product-readiness.cjs"),"utf8");
 assert.match(audit,/pending_master_and_search_index_reconciliation/);
 assert.match(audit,/chapter_2_4_unprocessed_whole_raw_pulses/);
});


test("raw-pulses source checked aflatoxins replace only legacy toxin rows, retaining valid Pulses Lead",()=>{
 const p=catalog.find(x=>x.id==="06-06-1-unprocessed-whole-raw-pulses-not-for-direct-human-consumption");
 const normal=catalog.find(x=>x.id==="06-06-1-pulses");
 const src=s("function contaminantProfileForProduct(p){");
 const internal=vm.createContext({contaminantsDb:db,
  exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null});
 vm.runInContext(src,internal);
 const profile=q=>vm.runInContext("contaminantProfileForProduct("+JSON.stringify(q)+")",internal);
 const raw=profile(p);
 assert.ok(raw);
 assert.deepEqual(Array.from(raw.rules,r=>r.contaminant),["Lead"]);
 assert.deepEqual(Array.from(profile(normal).rules,r=>r.contaminant),["Lead","Total Aflatoxins","Aflatoxin B1"]);
 const changed=structuredClone(db);
 changed.crop_contaminants.total_aflatoxins.rules.find(x=>x.article==="Pulses").limit=900;
 internal.contaminantsDb=changed;
 assert.deepEqual(Array.from(profile(p).rules,r=>r.contaminant),["Lead"],
  "Source drift must not restore stale legacy raw-pulse crop-toxin values");
});
