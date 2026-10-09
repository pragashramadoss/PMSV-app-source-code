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

test("official Version IX Ochratoxin A and DON exact grouped articles apply only to Wheat and Wheat Bran",()=>{
 const mappings=db.explicit_crop_contaminant_article_mappings_v9;
 assert.equal(mappings.length,2);
 assert.deepEqual(new Set(mappings.map(x=>x.catalog_id)),new Set(["06-06-1-wheat","06-06-2-wheat-bran"]));
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
   const {product}=get(fragment);
   return vm.runInContext("productBaselineContaminantRules("+JSON.stringify(product)+")",internal);
 };
 const named=x=>Array.from(list(x),r=>({contaminant:r.contaminant,limit:r.limit,unit:r.unit})).filter(r=>["Ochratoxin A","Deoxynivalenol"].includes(r.contaminant));
 for(const productName of ["Wheat","Wheat bran"]){
   const entries=named(productName);
   assert.deepEqual(entries,[{contaminant:"Ochratoxin A",limit:5,unit:"µg/kg"},{contaminant:"Deoxynivalenol",limit:1000,unit:"µg/kg"}],productName);
 }
 for(const productName of ["Wheat Flour (Atta)","Durum Wheat","Pearl Barley","Maida","Jowar Flour"]){
   assert.deepEqual(named(productName),[],productName+" cannot borrow exact named article");
 }
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
