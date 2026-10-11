"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),b="fssai-product-helper-preview-01/";
const load=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const m=load(b+"data/rules/fssai-seven-official-product-quality-2026-10-11.json"),products=load(b+"data/standard-search-index-v1.json").products;
const chapters=new Map(["chapter-2-11-other-food-products-v1.json","chapter-2-9-salt-spices-condiments-v1.json","chapter-2-8-sweetening-honey-v1.json"].map(f=>[f,load(b+"data/rules/"+f)]));
const core=load(b+"data/rules/contaminants-v9-core.json"),ledger=load("audit-output/fssai-live-first-source-ledger-533.json"),work=load("audit-output/fssai-next-121-first-exact-source-research-queue.json");
const html=fs.readFileSync(path.join(root,b+"index.html"),"utf8"),a=html.indexOf("function sourcePinnedSevenOfficialProductQualityHtml(p){"),z=html.indexOf("function sourcePinnedFinishedFoodSubtypeReviewHtml(p){",a+25);
assert.ok(a>0&&z>a,"seven product quality UI function absent");
const ctx=vm.createContext({exactSevenQualityDb:structuredClone(m),chapterRuleDbs:[...chapters.values()].map(x=>structuredClone(x)),esc:s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(html.slice(a,z),ctx);
const show=p=>vm.runInContext("sourcePinnedSevenOfficialProductQualityHtml("+JSON.stringify(p)+")",ctx);
test("All 7 pending products retain 34 exact Chapter 2.8, 2.9 and 2.11 product-standard criteria, not contaminant source promotions",()=>{
 assert.deepEqual([m.source_qualified_products,m.source_qualified_quality_criteria,m.partial_first_exact_ctr,m.pending_first_exact_ctr],[7,34,412,121]);
 let counted=0;
 for(const r of m.records){
  const p=products.find(x=>x.id===r.catalog_id);assert.ok(p&&p.name===r.product_name&&p.fssr===r.fssr&&p.fcs===r.fcs);
  assert.ok(ledger.pending_product_details.some(x=>x.id===r.catalog_id));
  const d=chapters.get(r.chapter_file);assert.equal(r.source,d.official_sources[0].url);
  const st=d.standards.find(x=>x.key===r.standard_key),criteria=st.composition||st.composition_rules;
  assert.equal(criteria.length,r.criteria.length);
  for(let i=0;i<criteria.length;i++){
   const {finished_product_contaminant_mrl,compliance_pass,...source}=r.criteria[i];
   assert.equal(finished_product_contaminant_mrl,false);assert.equal(compliance_pass,false);
   assert.deepEqual(source,criteria[i]);counted++;
  }
  assert.match(show(p),/NOT contaminant MRLs/);
 }
 assert.equal(counted,34);
});
test("Salt substitute magnesium fraction conditional 20% and distinct sodium 120 mg/100g do not get confused with double-fortified salt",()=>{
 const d=chapters.get("chapter-2-9-salt-spices-condiments-v1.json");
 const s=d.standards.find(x=>x.key==="2.9.30(6)");
 const mg=s.composition_rules.find(x=>/Magnesium ion/.test(x.parameter)),na=s.composition_rules.find(x=>x.parameter==="Sodium");
 assert.equal(mg.value,20);assert.equal(mg.operator,"<=");assert.match(mg.unit,/total specified cations/);assert.match(mg.applies_to,/Only magnesium salt mixtures/);
 assert.equal(na.value,120);assert.equal(na.unit,"mg/100 g mixture");
 const p=products.find(x=>x.name==="Salt Substitutes"),h=show(p);assert.match(h,/Magnesium ion/);assert.match(h,/120 mg\/100 g mixture/);
});
test("Royal jelly Type 1 and Type 2 ingredient controls are not conflated",()=>{
 const p=products.find(x=>x.name==="Royal Jelly");const h=show(p),r=m.records.find(x=>x.catalog_id===p.id);
 assert.equal(r.criteria.length,14);
 for(const ingredient of ["Sucrose","Erlose","Maltose","Maltotriose"]){
  const x=r.criteria.find(z=>z.parameter===ingredient);assert.equal(x.applies_to,"Type 1");assert.match(h,new RegExp(ingredient));
 }
 assert.match(h,/FSSAI 2.8.3/);
});
test("121 unresolved products have no literal exact named commodity in all 213 official pesticide schedules; broad ingredient rows cannot promote them",()=>{
 const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 const foods=new Set(core.residue_mrls.pesticides.flatMap(p=>p.rows.map(r=>normalize(r.food))));
 assert.equal(core.residue_mrls.pesticides.length,213);
 assert.equal(ledger.pending_product_details.length,121);
 const exact=ledger.pending_product_details.filter(x=>foods.has(normalize(x.name)));
 assert.deepEqual(exact,[]);
 assert.equal(work.pending,121);assert.equal(work.exact_product_quality_routes,7);assert.equal(work.exact_product_quality_criteria,34);
 assert.equal(work.records.filter(x=>x.exact_fssai_product_quality_not_contaminant_mrl).length,7);
});
test("Displayed product quality values withhold when source, product identity, or conditional magnesium value changes",()=>{
 const p=products.find(x=>x.name==="Salt Substitutes"),other=products.find(x=>x.name==="Pan Masala");
 assert.match(show(p),/Magnesium ion/);assert.equal(show(products.find(x=>x.name==="Biscuit")),"");
 assert.match(show({...p,name:"Incorrect Salt Product"}),/withheld/);
 const original=ctx.chapterRuleDbs;
 ctx.chapterRuleDbs=structuredClone([...chapters.values()]);
 ctx.chapterRuleDbs.find(x=>x.chapter==="2.9").standards.find(x=>x.key==="2.9.30(6)").composition_rules.find(x=>/Magnesium ion/.test(x.parameter)).value=50;
 assert.match(show(p),/withheld/);ctx.chapterRuleDbs=original;
 const old=ctx.exactSevenQualityDb;ctx.exactSevenQualityDb=structuredClone(m);ctx.exactSevenQualityDb.records.find(x=>x.catalog_id===other.id).criteria[0].compliance_pass=true;
 assert.match(show(other),/withheld/);ctx.exactSevenQualityDb=old;
});
