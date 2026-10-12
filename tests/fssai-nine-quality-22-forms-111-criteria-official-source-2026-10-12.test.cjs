"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const rules=base+"data/rules/";
const source=read(rules+"fssai-nine-finished-quality-subtype-positive-source-2026-10-12.json");
const ledger=read(rules+"fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const core=read(rules+"contaminants-v9-core.json");
const catalog=read(base+"data/standard-search-index-v1.json").products;
const byId=new Map(catalog.map(x=>[x.id,x]));
const script=fs.readFileSync(path.join(root,base+"fssai-nine-quality-finished-subtypes.js"),"utf8");
const pre=fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8");
function context(){
 const c={console,esc:x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,'&quot;')};
 vm.createContext(c);
 vm.runInContext(pre,c);
 vm.runInContext(script,c);
 c.pmsvCurrent533SourceLedger=structuredClone(ledger);
 c.contaminantsDb=structuredClone(core);
 c.pmsvNineQualityScopeDb=structuredClone(source);
 return c;
}
const get=(id,code)=>source.records.find(x=>x.catalog_id===id).profiles.find(p=>p.code===code);
const quality=(id,code,name)=>get(id,code).quality.find(x=>x.name===name);
test("Nine currently pending identities retain 533=417+116 with exactly 22 FSSR quality subtypes and 111 source-specific criteria",()=>{
 const c=context(),pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(c.pmsvNineQualityDocumentaryIntegrity(),true);
 assert.equal(source.records.length,9);
 assert.equal(source.records.reduce((s,x)=>s+x.profiles.length,0),22);
 assert.equal(source.records.reduce((s,x)=>s+x.profiles.reduce((a,p)=>a+p.quality.length,0),0),111);
 assert.equal(catalog.length,533);assert.equal(pending.size,116);assert.equal(ledger.partial_exact,417);
 assert.equal(source.first_source_promotions,0);assert.equal(source.finished_food_compliance_passes,0);
 assert.equal(new Set(source.records.map(x=>x.catalog_id)).size,9);
 for(const r of source.records){assert.ok(pending.has(r.catalog_id));assert.equal(r.first_exact_ctr_match,false);
  assert.equal(r.lot_pass,false);assert.equal(r.full_compliance_approval,false);
  assert.equal(r.numeric_ctr_autotransfer,false);assert.equal(r.product_name,byId.get(r.catalog_id).name);
  for(const p of r.profiles){assert.ok(p.quality.every(q=>q.scope==="FSSR finished-product quality, not CTR contaminant MRL"));}
 }
});
test("The finished-egg subtypes preserve exact official fraction, moisture, processing and pickling bases",()=>{
 assert.equal(quality("10-10-2-frozen-egg-products","egg-white","Total solids").criterion,"Minimum 10.5");
 assert.equal(quality("10-10-2-frozen-egg-products","egg-yolk","Protein").criterion,"Minimum 15");
 assert.equal(quality("10-10-2-liquid-egg-products","whole-egg","Lactic acid").criterion,"Maximum 1,000");
 assert.equal(quality("10-10-2-egg-powder","egg-white","Total solids").criterion,"Minimum 91.5");
 assert.equal(quality("10-10-2-egg-powder","egg-yolk","Lipid").criterion,"Minimum 61.6");
 assert.equal(quality("10-10-2-egg-powder","whole-egg","Moisture").criterion,"Maximum 2.0");
 assert.equal(quality("10-10-3-pickled-eggs","vinegar","Pickling-solution pH").criterion,"Maximum 3.2");
 assert.equal(quality("10-10-3-pickled-eggs","oil","Pickling-solution pH").criterion,"Maximum 3.6");
 assert.equal(quality("10-10-3-pickled-eggs","vinegar","Acidity as acetic acid").criterion,"Minimum 0.8");
 assert.equal(quality("10-10-3-pickled-eggs","oil","Acidity as acetic acid").criterion,"Minimum 0.6");
 for(const r of source.records.filter(x=>x.catalog_id.includes("egg"))){
  assert.equal(r.ctr_article_candidates_review_only[0].value,0.05);
  assert.equal(r.ctr_article_candidates_review_only[0].basis,"shell-free basis");
  assert.equal(r.ctr_article_candidates_review_only[0].ctr_section,"2.3.1");
 }
});
test("Colouring-food liquids/powders and Royal Jelly Types 1/2 do not conflate quality with a CTR metal limit",()=>{
 assert.equal(quality("99-99-1-colouring-foods","liquid","Total solids").criterion,"Minimum 45");
 assert.equal(quality("99-99-1-colouring-foods","powder","Total solids").criterion,"Minimum 90");
 assert.equal(quality("99-99-1-colouring-foods","liquid","Marker pigment").criterion,"Minimum 0.5");
 assert.equal(quality("99-99-1-colouring-foods","powder","Marker pigment").criterion,"Minimum 1.0");
 assert.equal(quality("100-100-royal-jelly","type1","10-HDA").criterion,"Minimum 1.4");
 assert.equal(quality("100-100-royal-jelly","type1","Sucrose").criterion,"Maximum 3");
 assert.match(quality("100-100-royal-jelly","type2","Sucrose").criterion,/Not applicable/);
 const c=context();
 for(const r of source.records){
  assert.equal(c.pmsvNineQualityHtml(byId.get(r.catalog_id)).includes("No subtype selected"),true);
  assert.equal(c.pmsvNineQualityHtml(byId.get(r.catalog_id)).includes("NOT A CTR LIMIT"),false);
  c.pmsvNineQualityChoices[r.catalog_id]=r.profiles[0].code;
  const html=c.pmsvNineQualityHtml(byId.get(r.catalog_id));
  assert.match(html,/NOT A CTR LIMIT OR LAB PASS/);
  assert.match(html,/Quality criterion/);
  assert.doesNotMatch(html,/COMPLIANCE APPROVED/i);
  delete c.pmsvNineQualityChoices[r.catalog_id];
 }
});
test("Fruit processing and actual can identity are separate; canned-scope comparison does not assign metal MRL",()=>{
 for(const id of ["04-04-1-thermally-processed-fruits","04-04-1-thermally-processed-fruit-salad-cocktail-mix","04-04-2-thermally-processed-vegetables"]){
  const r=source.records.find(x=>x.catalog_id===id);
  assert.ok(r.profiles.some(x=>x.code.includes("can")));
  assert.match(r.identity_and_transfer_guard,/canned|can/);
  assert.ok(r.ctr_article_candidates_review_only.some(x=>x.analyte==="Tin"&&x.value===250));
  const c=context();c.pmsvNineQualityChoices[id]=r.profiles[0].code;
  assert.match(c.pmsvNineQualityHtml(byId.get(id)),/REFERENCE ONLY; NOT APPLIED/);
 }
 assert.equal(quality("04-04-1-thermally-processed-fruit-salad-cocktail-mix","canned-salad","Minimum drained weight").unit,"% of container water capacity");
 assert.equal(quality("04-04-1-thermally-processed-fruits","canned-liquid","Drained fruit weight").unit,"% net contents");
});
test("Every source and narrative mutation after load is withheld for the nine quality matrices",()=>{
 const changes=[
 c=>c.pmsvNineQualityScopeDb.records[0].profiles[0].quality[0].criterion="Minimum zero",
 c=>c.pmsvNineQualityScopeDb.records[1].profiles[1].identity_required[0]="No samples required",
 c=>c.pmsvNineQualityScopeDb.records[2].numeric_ctr_autotransfer=true,
 c=>c.pmsvNineQualityScopeDb.records[3].profiles.reverse(),
 c=>c.pmsvNineQualityScopeDb.records[4].official_quality_source="https://example.com/fake",
 c=>c.pmsvNineQualityScopeDb.records[5].ctr_article_candidates_review_only[0].value=0,
 c=>c.pmsvNineQualityScopeDb.records[6].identity_and_transfer_guard="Any thermal food is canned",
 c=>c.pmsvNineQualityScopeDb.records[8].full_compliance_approval=true,
 c=>c.pmsvCurrent533SourceLedger.records[0].product_name="Fake"
 ];
 for(const mutate of changes){
  const c=context();mutate(c);
  assert.equal(c.pmsvNineQualityDocumentaryIntegrity(),false);
  assert.match(c.pmsvNineQualityHtml(byId.get(source.records[0].catalog_id)),/withheld/);
 }
});
test("No quality panel is shown for the other 524 catalogue products and the current loader/index/CI refer to official data",()=>{
 const c=context(),set=new Set(source.records.map(x=>x.catalog_id));
 for(const p of catalog.filter(x=>!set.has(x.id)))assert.equal(c.pmsvNineQualityHtml(p),"");
 const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 assert.match(html,/fssai-nine-quality-finished-subtypes\.js\?v=20261012-q9subtype22/);
 assert.match(script,/fssai-nine-finished-quality-subtype-positive-source-2026-10-12\.json/);
 const yaml=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(yaml,/fssai-nine-quality-22-forms-111-criteria-official-source-2026-10-12\.test\.cjs/);
});
