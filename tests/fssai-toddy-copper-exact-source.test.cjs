#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const db=read(base+"rules/contaminants-v9-core.json");
const alcoholic=read(base+"rules/alcoholic-beverages-v5.json");
const catalog=read(base+"standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const id="14-14-2-palm-wine-toddy";
const officialAlcohol="https://fssai.gov.in/upload/uploadfiles/files/Comp_Alcoholic_Beverages_V_04_12_2025.pdf";
const officialCtr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const normalize=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

test("Palm wine/Toddy has the exact 3.1.5.1 alcohol standard and Version IX Toddy copper article",()=>{
 const p=catalog.find(x=>x.id===id);
 assert.ok(p,"Palm wine/Toddy is missing from the local product index");
 assert.equal(p.name,"Palm wine/Toddy");
 assert.equal(p.rule_key,"3.1.5.1");
 assert.equal(p.chapter_rule_link_status,"file_and_key_verified");
 assert.equal(p.fcs,"14.2.4");
 assert.equal(alcoholic.standards["3.1.5.1"].name,p.name);
 assert.match(alcoholic.standards["3.1.5.1"].definition_summary,/palm trees and coconut palms/);
 assert.ok(alcoholic.official_sources.some(s=>s.url===officialAlcohol));
 assert.ok(db.official_sources.some(s=>s.url===officialCtr));
 const source=db.metal_article_rules_v9.Copper.filter(x=>x.article==="Toddy");
 assert.equal(source.length,1,"Ambiguous or missing official source article");
 assert.equal(source[0].row_type,"exact");
 assert.equal(source[0].limit,5);
 assert.equal(source[0].unit,"mg/kg");
 const matched=db.profiles.filter(x=>x.catalog_ids?.includes(id));
 assert.equal(matched.length,1,"Exactly one product-specific profile required");
 const profile=matched[0];
 assert.equal(profile.label,p.name);
 assert.equal(profile.official_identity_source_url,officialAlcohol);
 assert.equal(profile.full_contaminant_coverage_verified,false);
 assert.equal(profile.rules.length,1);
 assert.deepEqual([profile.rules[0].contaminant,profile.rules[0].article,profile.rules[0].limit,profile.rules[0].unit],
  ["Copper","Toddy",source[0].limit,source[0].unit]);
 assert.equal(profile.match_fssr,undefined,"No broad alcoholic FSSR-family inheritance");
});

test("Copper profile is exclusively tied to fermented Palm wine/Toddy, not similarly named beverages",()=>{
 const profile=db.profiles.find(x=>x.catalog_ids?.includes(id));
 assert.deepEqual(profile.catalog_ids,[id]);
 assert.match(profile.finished_article_scope,/excludes distilled Toddy liquor/);
 for(const p of catalog.filter(p=>p.id!==id && (p.category==="14"||/wine|toddy|liquor/i.test(p.name)))){
   assert.ok(!profile.catalog_ids.includes(p.id),"Copper wrongly inherited by "+p.name);
 }
 assert.equal(alcoholic.standards["3.1.5.2"].name,"Bamboo wine");
});

test("Exact current Copper article, limit, and unit must survive before PMSV may render 5 mg/kg",()=>{
 const at=ui.indexOf("function sourcePinnedVersionIxProfileMetalRule(p,rule){");
 const end=ui.indexOf("function productBaselineContaminantRules(p){",at);
 assert.ok(at>=0&&end>at);
 assert.ok(ui.includes("const exact=rawProfileRules.filter(rule=>sourcePinnedVersionIxProfileMetalRule(p,rule));"));
 const p=catalog.find(x=>x.id===id);
 const rule=db.profiles.find(x=>x.catalog_ids?.includes(id)).rules[0];
 const ctx={contaminantsDb:db,normIngredient:normalize};
 vm.runInNewContext(ui.slice(at,end),ctx);
 const verify=(r=rule)=>ctx.sourcePinnedVersionIxProfileMetalRule(p,r);
 assert.equal(verify(),true);
 assert.equal(verify({...rule,limit:50}),false,"Tampered copper value");
 assert.equal(verify({...rule,unit:"mg/L"}),false,"Liquid-unit conversion was never authorized");
 assert.equal(verify({...rule,article:"Bamboo wine"}),false,"Wrong wine");
 assert.equal(verify({...rule,article:"Foods not specified"}),false,"No generic fallback");
 const copy=JSON.parse(JSON.stringify(db));
 copy.metal_article_rules_v9.Copper=copy.metal_article_rules_v9.Copper.filter(x=>x.article!=="Toddy");
 ctx.contaminantsDb=copy;
 assert.equal(verify(),false,"Missing named official source article must fail closed");
 ctx.contaminantsDb=db;
});
