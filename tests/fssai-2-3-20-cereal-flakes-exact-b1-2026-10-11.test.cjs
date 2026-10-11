"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const index=read(base+"standard-search-index-v1.json").products;
const chapter=read(base+"rules/chapter-2-3-fruit-vegetable-v1.json");
const db=read(base+"rules/contaminants-v9-core.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const p=index.find(x=>x.id==="06-06-3-fruit-vegetable-cereal-flakes");
const start=html.indexOf("function productBaselineContaminantRules(p){");
const end=html.indexOf("\nfunction ",start+28);
assert.ok(start>=0&&end>start,"Product baseline rule gate missing");
const ctx=vm.createContext({
  contaminantsDb:db,chapterRuleDbs:[chapter],ruleDbStandards:db=>db.standards||[],
  exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
  normIngredient:s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  isVerifiedFermentedMilkProduct:()=>false
});
vm.runInContext(html.slice(start,end),ctx);
const run=prod=>Array.from(ctx.productBaselineContaminantRules(prod)).filter(r=>String(r.source_basis||"").includes("exact FSSR 2.3.20 Fruit/Vegetable Cereal Flakes"));
test("Exact FoSCoS flakes identity and official FSSR Chapter 2.3.20 mandatory cereal ingredient",()=>{
 assert.equal(p.name,"Fruit/Vegetable, Cereal Flakes");
 assert.equal(p.fssr,"2.3.20");assert.equal(p.fcs,"06.3");
 const standard=chapter.standards.find(s=>s.key==="2.3.20");
 const z=standard.official_cereal_composite_b1_source_v1;
 assert.equal(z.fssr,p.fssr);assert.equal(z.required_cereal_ingredient_in_clause,true);
 assert.equal(z.product_made_as_dehydrated_flakes,true);
 assert.equal(z.source_pdf_page_one_based,28);
 assert.equal(z.total_aflatoxins_cannot_auto_apply,true);
 assert.equal(z.complete_product_compliance_pass,false);
});
test("Only B1 10 µg/kg is common to both Version IX food articles; total aflatoxins 15 versus 20 are withheld",()=>{
 assert.equal(db.source_version,"Version IX (03.02.2026)");
 const groups=[["aflatoxin_b1",10,10],["total_aflatoxins",15,20]];
 const a=["Cereal and cereal products","Food product containing any of the above mentioned food articles"];
 for(const [key,one,two] of groups){
  const g=db.crop_contaminants[key];assert.equal(g.unit,"µg/kg");
  assert.equal(g.rules.filter(r=>r.article===a[0]&&Number(r.limit)===one).length,1);
  assert.equal(g.rules.filter(r=>r.article===a[1]&&Number(r.limit)===two).length,1);
 }
 const out=run(p);
 assert.equal(out.length,1);assert.equal(out[0].contaminant,"Aflatoxin B1");
 assert.equal(out[0].limit,10);assert.equal(out[0].unit,"µg/kg");
 assert.match(out[0].condition,/Total Aflatoxins 15\/20/);
 for(const x of [
  index.find(x=>x.id==="06-06-3-breakfast-cereal"),
  index.find(x=>x.id==="07-07-2-biscuit"),
  index.find(x=>x.id==="04-04-1-fruit-bar-toffee"),
  index.find(x=>x.id==="04-04-2-dehydrated-vegetables"),
  {...p,fssr:"2.4.35"},{...p,fcs:"04.1.2.8"},{...p,name:"Fruit Bar"}
 ])if(x)assert.equal(run(x).length,0,"Wrong product inherits B1 "+x.id);
});
test("Source change, missing article, mismatch in total-toxin source, changed number or missing FSSR cannot yield a numeric B1 rule",()=>{
 const ref=ctx.contaminantsDb,ch=ctx.chapterRuleDbs;
 for(const change of [
   d=>d.crop_contaminants.aflatoxin_b1.rules.find(r=>r.article==="Cereal and cereal products").limit=12,
   d=>d.crop_contaminants.aflatoxin_b1.unit="mg/kg",
   d=>d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(r=>r.article!=="Food product containing any of the above mentioned food articles"),
   d=>d.crop_contaminants.total_aflatoxins.rules.find(r=>r.article==="Cereal and cereal products").limit=22,
   d=>d.source_version="Version VIII"
 ]){
  ctx.contaminantsDb=structuredClone(db);change(ctx.contaminantsDb);
  assert.equal(run(p).length,0);
 }
 ctx.contaminantsDb=ref;
 ctx.chapterRuleDbs=structuredClone([chapter]);
 ctx.chapterRuleDbs[0].standards.find(s=>s.key==="2.3.20").official_cereal_composite_b1_source_v1.required_cereal_ingredient_in_clause=false;
 assert.equal(run(p).length,0);
 ctx.chapterRuleDbs=[];assert.equal(run(p).length,0);
 ctx.chapterRuleDbs=ch;assert.equal(run(p).length,1);
});
test("Source-conservation audit promotes exactly one previous gap and never issues compliance PASS",()=>{
 const a=read("audit-output/fssai-product-readiness-audit.json"),x=a.products.find(x=>x.id===p.id);
 assert.ok(x);
 assert.equal(a.summary.counts.contaminant_evidence.some_exact_product_evidence_not_full_coverage,410);
 assert.equal(x.contaminant_evidence_index.status,"some_exact_product_evidence_not_full_coverage");
 assert.equal(x.contaminant_evidence_index.exact_fruit_vegetable_cereal_flakes_composite_b1.limit,10);
 assert.equal(x.contaminant_evidence_index.exact_fruit_vegetable_cereal_flakes_composite_b1.total_aflatoxins_limit_unresolved,true);
 assert.equal(x.contaminant_evidence_index.exact_fruit_vegetable_cereal_flakes_composite_b1.full_contaminant_compliance,false);
 assert.equal(x.compliance_decision,"not_established_by_route_evidence");
 const ledger=read("audit-output/fssai-live-first-source-ledger-533.json");
 assert.equal(ledger.partial_first_source_evidence,410);
 assert.equal(ledger.unresolved_first_source_gaps,123);
 assert.equal(ledger.exact_fssr_2_3_20_flakes_b1_first_source_matches,1);
 assert.equal(ledger.legal_or_laboratory_compliance_passes,0);
});
