#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const base="fssai-product-helper-preview-01/";
const db=JSON.parse(fs.readFileSync(path.join(root,base,"data/rules/contaminants-v9-core.json"),"utf8"));
const index=JSON.parse(fs.readFileSync(path.join(root,base,"data/standard-search-index-v1.json"),"utf8")).products;
const html=fs.readFileSync(path.join(root,base,"index.html"),"utf8");
const at=html.indexOf("function sourcePinnedMilkPowderAflatoxinM1Rule(p){");
const end=html.indexOf("function productBaselineContaminantRules(p){",at);
assert.ok(at>0&&end>at,"Exact subtype FSSAI source gate missing from runtime");
const product=index.find(p=>p.id==="01-01-5-milk-powders-and-cream-powder");
assert.ok(product);
assert.equal(product.fssr,"2.1.10");
let subtype="";
const ctx=vm.createContext({
 contaminantsDb:db,
 document:{getElementById:(id)=>id==="contaminantMilkLeadSubtype"?{value:subtype}:null},
 dehydratedMilkSubtypeConfigsForProduct:p=>p.id===product.id
   ?[{subtype:"Whole Milk Powder"},{subtype:"Skimmed Milk Powder"},{subtype:"Partly Skimmed Milk Powder"}]:[],
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()
});
vm.runInContext(html.slice(at,end),ctx);
const check=(p=product)=>ctx.sourcePinnedMilkPowderAflatoxinM1Rule(p);

test("Whole and Skimmed Milk Powder Aflatoxin M1 use distinct exact Version IX limits",()=>{
 const source=db.crop_contaminants.aflatoxin_m1;
 assert.equal(source.unit,"µg/kg");
 assert.ok(source.rules.some(x=>x.article==="Whole milk powder"&&Number(x.limit)===4));
 assert.ok(source.rules.some(x=>x.article==="Skimmed milk powder"&&Number(x.limit)===6));
 subtype="Whole Milk Powder";
 assert.equal(check().limit,4);
 assert.equal(check().unit,"µg/kg");
 assert.equal(check().article,"Whole milk powder");
 subtype="Skimmed Milk Powder";
 assert.equal(check().limit,6);
 assert.equal(check().article,"Skimmed milk powder");
 assert.equal(check().verification,"official_fssai_v9_exact_selected_milk_powder_subtype");
});
test("No use for unselected, partly skimmed, Cream Powder or other food identities",()=>{
 for(const s of ["","Partly Skimmed Milk Powder","Cream Powder","Whole milk powder"]){
   subtype=s;
   assert.equal(check(),null,"Forbidden subtype "+s);
 }
 subtype="Whole Milk Powder";
 for(const p of [
   {...product,id:"01-01-5-dairy-whitener",name:"Dairy Whitener"},
   {...product,fssr:"2.1.11"},
   {...product,id:"01-01-7-yoghurt-including-flavoured-yoghurt-and-flavoured-dahi"}
 ])assert.equal(check(p),null,p.id);
});
test("Drift of stored official article limit, units, version or source fails closed",()=>{
 subtype="Whole Milk Powder";
 const original=ctx.contaminantsDb;
 for(const mutate of [
    d=>{d.crop_contaminants.aflatoxin_m1.rules.find(x=>x.article==="Whole milk powder").limit=5;},
    d=>{d.crop_contaminants.aflatoxin_m1.unit="mg/kg";},
    d=>{d.crop_contaminants.aflatoxin_m1.rules=d.crop_contaminants.aflatoxin_m1.rules.filter(x=>x.article!=="Whole milk powder");},
    d=>{d.source_version="Version VIII";},
    d=>{d.official_sources=[];}
 ]){
   const changed=structuredClone(db);
   mutate(changed);
   ctx.contaminantsDb=changed;
   assert.equal(check(),null,"Mutated source must suppress numeric limit");
 }
 ctx.contaminantsDb=original;
 assert.equal(check().limit,4);
});
test("Milk-powder condition is rendered alongside Lead and limits are not automatically applied to the combined identity",()=>{
 assert.match(html,/milkPowderAflatoxinM1=sourcePinnedMilkPowderAflatoxinM1Rule\(p\)/);
 assert.match(html,/\.\.\.\(milkPowderAflatoxinM1\?\[milkPowderAflatoxinM1\]:\[\]\)/);
 assert.match(html,/milkPowderAflatoxinNotice/);
 assert.match(html,/Exact milk-powder subtype for Lead and Aflatoxin M1/);
});
