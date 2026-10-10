#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const source=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const profileFor=id=>source.profiles.find(p=>p.id==="exact-raw-cereal-grain-metals-"+id);
const candidates=[
 {id:"06-06-1-maize",name:"Maize",fssr:"2.4.6",cadmium:true},
 {id:"06-06-1-oats",name:"Oats",fssr:"2.4.6",cadmium:true},
 {id:"06-06-1-rice",name:"Rice",fssr:"2.4.6",cadmium:false}
];
const rawLead="Cereal grains, except buckwheat, canihua and quinoa";
const rawCadmium="Cereal grains, except buckwheat, canihua and Quinoa (excluding wheat and rice; and bran and germ)";
const official="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
test("FSSAI Version IX source master retains exact lead and cadmium grain articles, units and exceptions",()=>{
 assert.equal(source.source_version,"Version IX (03.02.2026)");
 assert.ok(source.official_sources.some(s=>s.url===official));
 assert.ok(chapter.official_sources.some(s=>/fssai\.gov\.in/.test(s.url)));
 const lead=source.metal_article_rules_v9.Lead.filter(x=>x.article===rawLead);
 const cadmium=source.metal_article_rules_v9.Cadmium.filter(x=>x.article===rawCadmium);
 assert.equal(lead.length,1);assert.equal(lead[0].limit,0.2);assert.equal(lead[0].unit,"mg/kg");
 assert.equal(cadmium.length,1);assert.equal(cadmium[0].limit,0.1);assert.equal(cadmium[0].unit,"mg/kg");
 assert.equal(lead[0].row_type,"exact");assert.equal(cadmium[0].row_type,"exact");
 const polished=source.metal_article_rules_v9.Cadmium.find(x=>x.article==="Rice, polished");
 assert.ok(polished);assert.equal(polished.limit,0.4);assert.equal(polished.unit,"mg/kg");
});
test("Only raw Maize/Oats gain two exact metal articles; generic Rice gains Lead only",()=>{
 for(const c of candidates){
  const p=catalogue.find(x=>x.id===c.id);
  assert.ok(p,c.name);assert.equal(p.name,c.name);assert.equal(p.fssr,c.fssr);
  assert.equal(p.fcs,"06.1");
  assert.ok(chapter.standards.some(st=>st.key===(p.rule_key||p.fssr)));
  const group=profileFor(c.id);
  assert.ok(group,"Missing identity-specific "+c.name+" profile");
  assert.deepEqual(group.catalog_ids,[c.id]);
  assert.equal(group.rules.length,c.cadmium?2:1);
  for(const rule of group.rules){
   assert.match(rule.source_basis,/Section 2\.1/);
   assert.match(rule.condition,/food-grain identity/);
   assert.match(rule.condition,/Not .* flour/i);
   assert.notEqual(rule.article,"Foods not specified");
   if(rule.contaminant==="Lead"){
    assert.equal(rule.article,rawLead);assert.equal(rule.limit,0.2);assert.equal(rule.unit,"mg/kg");
   }else{
    assert.equal(rule.contaminant,"Cadmium");assert.equal(rule.article,rawCadmium);
    assert.equal(rule.limit,0.1);assert.equal(rule.unit,"mg/kg");
    assert.equal(c.cadmium,true,"Rice must not inherit nonrice cadmium article");
   }
  }
 }
 const excluded=["06-06-1-quinoa","06-06-2-whole-maize-corn-flour","06-06-2-jowar-flour-sorghum-flour","06-06-2-ragi-flour"];
 for(const id of excluded)assert.equal(source.profiles.some(x=>x.id?.startsWith("exact-raw-cereal-grain-metals-")&&x.catalog_ids?.includes(id)),false,id);
});
test("UI source gate rejects switched identity, official-source drift, unit drift and unrelated cereal",()=>{
 const start=html.indexOf("function sourcePinnedVersionIxProfileMetalRule(p,rule){");
 const end=html.indexOf("/* The FSSAI CTR amendment indexed",start);
 assert.ok(start>=0&&end>start);
 const ctx={contaminantsDb:source,normIngredient};
 vm.runInNewContext(html.slice(start,end),ctx);
 const verified=ctx.sourcePinnedVersionIxProfileMetalRule;
 for(const c of candidates){
  const g=profileFor(c.id);
  const lead=g.rules.find(x=>x.contaminant==="Lead");
  assert.equal(verified({id:c.id},lead),true,"Official lead source accepted for "+c.name);
  assert.equal(verified({id:"06-06-1-quinoa"},lead),false,"Quinoa cannot reuse "+c.name+" source row");
  assert.equal(verified({id:c.id},{...lead,limit:2}),false,"Tampered limit must fail");
  assert.equal(verified({id:c.id},{...lead,unit:"mg/L"}),false,"Tampered units must fail");
  assert.equal(verified({id:c.id},{...lead,article:"Foods not specified"}),false,"Generic fallback must fail");
  if(c.cadmium){
   const cd=g.rules.find(x=>x.contaminant==="Cadmium");
   assert.equal(verified({id:c.id},cd),true);
   assert.equal(verified({id:"06-06-1-rice"},cd),false,"Rice must never inherit nonrice cadmium");
  }
 }
 const copy=JSON.parse(JSON.stringify(source));
 copy.metal_article_rules_v9.Lead=copy.metal_article_rules_v9.Lead.filter(r=>r.article!==rawLead);
 ctx.contaminantsDb=copy;
 assert.equal(verified({id:"06-06-1-rice"},profileFor("06-06-1-rice").rules[0]),false,"Missing authoritative lead row must fail closed");
 ctx.contaminantsDb=source;
});
