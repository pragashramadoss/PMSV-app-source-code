"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const data=read("fssai-product-helper-preview-01/data/rules/fssai-sugar-sulphites-appendix-a-v3-2026-10-11.json");
const appendix=read("fssai-product-helper-preview-01/data/rules/appendix-a-v3-core.json");
const products=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const ids=new Map(products.map(p=>[p.id,p]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const start=html.indexOf("function verifiedSugarSulphiteReference(p){");
const end=html.indexOf("function pendingContaminantReviewNotice(p){",start);
const ctx=vm.createContext({sugarSulphiteResiduesDb:data,appendixCoreDb:appendix,esc:s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
assert.ok(start>0&&end>start);
vm.runInContext(html.slice(start,end),ctx);
const ref=p=>vm.runInContext("verifiedSugarSulphiteReference("+JSON.stringify(p)+")",ctx);
const show=p=>vm.runInContext("sourcePinnedSugarSulphitesHtml("+JSON.stringify(p)+")",ctx);
const get=id=>{const p=ids.get(id);assert.ok(p);return p;};
test("11 source-locked exact FCS identities, preserving current official Appendix A Table 11 numeric rows",()=>{
 assert.equal(products.length,533);
 assert.equal(data.records.length,11);
 assert.equal(data.reviewed_product_count,11);
 assert.equal(data.first_exact_finished_product_chemical_residue_evidence_count,2);
 assert.equal(data.conditional_additive_or_no_additives_only_count,9);
 assert.equal(data.full_contaminant_compliance_passes,0);
 assert.equal(data.auto_apply_lab_compliance_limit,false);
 assert.equal(data.source_version,appendix.source_version);
 assert.equal(data.official_appendix_a_source,appendix.official_source.url);
 assert.equal(new Set(data.records.map(x=>x.catalog_id)).size,11);
 for(const row of data.records){
   const p=get(row.catalog_id);
   assert.equal(p.name,row.product_name);assert.equal(p.fssr,row.fssr);assert.equal(p.fcs,row.fcs);
   assert.equal(row.automatic_numeric_pass,false);
   assert.equal(row.sample_result_evaluated,false);
   assert.equal(row.all_contaminants_residues_and_pesticides_verified,false);
   assert.ok(ref(p),"Exact subtype should render "+p.id);
   const source=appendix.loaded_permission_sets[row.source_fcs];
   assert.equal(source.table,"Table 11");
   if(row.source_limit!==null)assert.ok(source.entries.some(x=>x.name==="SULFITES"&&x.limit===row.source_limit+" mg/kg"));
   assert.doesNotMatch(show({...p,name:"wrong food name"}),/source value <b>|must not exceed 50 mg\/kg/);
 }
});
test("Only Gur and Cane Gur receive partial verified final-product sulphite residue; not a full contaminant PASS",()=>{
 const eligible=data.records.filter(r=>r.scope==="finished_product_sulphite_residue_partial");
 assert.deepEqual(eligible.map(x=>x.catalog_id).sort(),[
  "11-11-1-cane-jaggery-or-cane-gur","11-11-1-gur-or-jaggery"]);
 for(const row of eligible){
   assert.equal(row.source_limit,50);assert.equal(row.source_fcs,"11.1.6");
   const s=show(get(row.catalog_id));
   assert.match(s,/PARTIAL chemical evidence ONLY/);
   assert.match(s,/must not exceed 50 mg\/kg in the end product/);
   assert.match(s,/no laboratory result was evaluated/);
   assert.doesNotMatch(s,/compliance PASS/);
 }
 assert.equal(data.records.filter(x=>x.scope!=="finished_product_sulphite_residue_partial").length,9);
});
test("9 sugar rows remain additive-only/no-additives; sugar forms are not collapsed",()=>{
 for(const r of data.records.filter(x=>x.scope!=="finished_product_sulphite_residue_partial")){
  const s=show(get(r.catalog_id));
  assert.doesNotMatch(s,/must not exceed 50 mg\/kg in the end product/);
  assert.match(s,/(ADDITIVE PERMISSION ONLY|no additives permitted)/);
 }
 assert.equal(data.records.find(x=>x.catalog_id==="11-11-1-golden-syrup").source_limit,70);
 assert.equal(data.records.find(x=>x.catalog_id==="11-11-1-dried-glucose-syrup").source_limit,20);
 assert.equal(data.records.find(x=>x.catalog_id==="11-11-1-khandsari-sugar").source_limit,150);
 assert.match(data.records.find(x=>x.catalog_id==="11-11-1-khandsari-sugar").category_and_subtype_qualification,/no additives permitted/);
 assert.equal(data.records.find(x=>x.catalog_id==="11-11-1-edible-lactose").source_limit,null);
});
test("Changed FSSAI source values, conditions or source module fail closed",()=>{
 const jaggery=get("11-11-1-gur-or-jaggery");
 const current=ctx.appendixCoreDb;
 const changed=structuredClone(appendix);
 changed.loaded_permission_sets["11.1.6"].entries[0].limit="999 mg/kg";
 ctx.appendixCoreDb=changed;
 assert.equal(ref(jaggery),null);assert.match(show(jaggery),/WITHHELD/);
 assert.doesNotMatch(show(jaggery),/must not exceed 50 mg\/kg/);
 ctx.appendixCoreDb=structuredClone(appendix);
 ctx.appendixCoreDb.loaded_permission_sets["11.1.6"].entries[0].condition="";
 assert.equal(ref(jaggery),null);
 ctx.appendixCoreDb=structuredClone(appendix);
 ctx.appendixCoreDb.official_source.url="https://wrong.example";
 assert.equal(ref(jaggery),null);
 ctx.appendixCoreDb=null;
 assert.equal(ref(jaggery),null);
 ctx.appendixCoreDb=current;
 assert.equal(ref(jaggery).source_limit,50);
});
test("Unrelated catalogue products and mismatched FCS never inherit sugar residue",()=>{
 const other=products.find(x=>x.name==="Cocoa Beans");assert.ok(other);
 assert.equal(show(other),"");
 const wrongFcs={...get("11-11-1-cane-jaggery-or-cane-gur"),fcs:"11.1.3"};
 assert.equal(ref(wrongFcs),null);
 assert.doesNotMatch(show(wrongFcs),/must not exceed 50 mg\/kg/);
});
