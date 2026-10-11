"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),pre="fssai-product-helper-preview-01/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8")),m=read(pre+"data/rules/fssai-v9-processed-food-exact-subtype-source-2026-10-11.json"),v9=read(pre+"data/rules/contaminants-v9-core.json");
const ix=read(pre+"data/standard-search-index-v1.json").products,ledger=read("audit-output/fssai-live-first-source-ledger-533.json"),research=read("audit-output/fssai-next-121-first-exact-source-research-queue.json");
const html=fs.readFileSync(path.join(root,pre,"index.html"),"utf8");
const begin=html.indexOf("function sourcePinnedFinishedFoodSubtypeReviewHtml(p){"),end=html.indexOf("function sourcePinnedExpandedMetalScopeHtml(p){",begin+25);
assert.ok(begin>0&&end>begin,"Exact subtype live screen function missing");
const ctx=vm.createContext({namedFoodSubtypesDb:structuredClone(m),contaminantsDb:structuredClone(v9),
 esc:s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))});
vm.runInContext(html.slice(begin,end),ctx);
const product=id=>ix.find(p=>p.id===id),draw=p=>vm.runInContext("sourcePinnedFinishedFoodSubtypeReviewHtml("+JSON.stringify(p)+")",ctx),norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
test("Official conditional subtype source articles: 9 unresolved products, 21 variants, 45 references; none approved",()=>{
 assert.deepEqual([m.catalogue_count,m.partial_first_source,m.pending_first_source,m.first_exact_promotions,m.full_compliance_passes],[533,412,121,0,0]);
 assert.deepEqual([m.reviewed_catalogue_identities,m.conditional_named_subtype_options,m.verified_official_source_article_references],[9,21,43]);
 assert.equal(m.records.length,9);
 let count=0,n=0;
 for(const r of m.records){
  const p=product(r.catalog_id);assert.ok(p);assert.deepEqual([r.product_name,r.fssr,r.fcs],[p.name,p.fssr,p.fcs]);
  assert.ok(ledger.pending_product_details.some(x=>x.id===p.id));
  assert.equal(r.first_exact_product_source_promoted,false);
  assert.equal(r.direct_finished_product_numeric_auto_application,false);
  for(const b of r.forms){count++;assert.equal(b.numeric_finished_product_limit_applied,false);assert.equal(b.legal_or_lab_compliance_pass,false);
   for(const a of b.named_articles){n++;const matches=(v9.metal_article_rules_v9[a.metal]||[]).filter(x=>x.row_type==="exact"&&norm(x.article)===norm(a.article)&&x.limit===a.limit&&x.unit===a.unit&&String(x.condition||"")===a.measurement_basis);assert.equal(matches.length,1,r.catalog_id+":"+b.subtype_id+":"+a.metal);assert.equal(a.auto_apply,false);}
  }
 }
 assert.deepEqual([count,n],[21,43]);
});
test("Research worksheet exports preserve every finished food subtype, named metal and exact testing basis as not applied",()=>{
 assert.deepEqual([research.pending,research.partial,research.full_compliance_passes],[121,412,0]);
 assert.deepEqual([research.finished_food_subtype_product_count,research.finished_food_named_subtype_options,research.finished_food_subtype_article_references],[9,21,43]);
 for(const row of research.records){
  const matched=m.records.find(x=>x.catalog_id===row.catalog_id);
  const output=row.finished_food_specific_named_subtypes_review_only;
  assert.equal(output.length,matched?.forms.length||0);
  for(const b of output){assert.equal(b.auto_applied,false);assert.equal(b.first_exact_promoted,false);assert.equal(b.compliance_pass,false);assert.ok(b.named_source_articles_review_only.length>0);}
 }
});
test("Visible Helper shows conditional exact article reference for named canned, mango chutney and cucumber subtype, never a PASS",()=>{
 assert.match(html,/namedFoodSubtypesDb=await res.json\(\)/);assert.match(html,/sourcePinnedFinishedFoodSubtypeReviewHtml\(p\)/);
 for(const [name,terms] of [["Fruits and Vegetable Chutney",["Mango chutney","Lead","Tin","2.3.42"]],
 ["Thermally Processed Fruits",["Canned mangoes","Canned pineapple","Tin"]],
 ["Thermally Processed Vegetables",["Canned carrots","Canned sweetcorn","Canned green beans"]],
 ["Sterilized Fungi",["Canned mushrooms","NOT APPLIED"]],
 ["Pickles made from vegetables or other edible plant material including mushrooms",["Pickled cucumber","NOT APPLIED"]]]){
  const p=ix.find(x=>x.name===name);const h=draw(p);
  for(const token of terms)assert.ok(h.includes(token),name+":"+token);
  assert.match(h,/REVIEW ONLY/);assert.match(h,/No source promotion or overall laboratory PASS is claimed/);
 }
});
test("Changed legal numeric value, testing basis, false approval, wrong identity and missing source fail closed",()=>{
 const p=ix.find(x=>x.name==="Concentrated Vegetable Pulp/Puree with Preservatives for industrial use only");assert.match(draw(p),/dried tomato solids/);
 assert.match(draw({...p,name:"Spoof vegetable"}),/withheld/);
 const oldDb=ctx.contaminantsDb,oldReg=ctx.namedFoodSubtypesDb;
 ctx.contaminantsDb=structuredClone(v9);ctx.contaminantsDb.metal_article_rules_v9.Copper.find(x=>x.article==="Tomato puree, paste, powder, and cocktails").condition="";
 assert.match(draw(p),/withheld/);ctx.contaminantsDb=oldDb;
 ctx.contaminantsDb=structuredClone(v9);ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Processed tomato concentrates").limit=9;
 assert.match(draw(p),/withheld/);ctx.contaminantsDb=oldDb;
 ctx.namedFoodSubtypesDb=structuredClone(m);ctx.namedFoodSubtypesDb.records.find(x=>x.catalog_id===p.id).forms[0].numeric_finished_product_limit_applied=true;
 assert.match(draw(p),/withheld/);ctx.namedFoodSubtypesDb=oldReg;
 ctx.namedFoodSubtypesDb=structuredClone(m);ctx.namedFoodSubtypesDb.reviewed_catalogue_identities=8;
 assert.match(draw(p),/withheld/);ctx.namedFoodSubtypesDb=oldReg;
});
