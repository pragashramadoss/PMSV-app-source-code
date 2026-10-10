#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-8-sweetening-honey-v1.json");
const contaminants=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const id="99-99-1-bees-wax";
const officialUrl="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf";

test("Bees Wax lead is pinned to FSSAI 2.8.3(2) official product-standard table",()=>{
 const identity=catalogue.find(p=>p.id===id);
 assert.ok(identity);
 assert.equal(identity.name,"Bees Wax");
 assert.equal(identity.fssr,"2.8.3(2)");
 assert.equal(identity.rule_key,"2.8.3(2)");
 const standard=chapter.standards.find(s=>s.key===identity.rule_key);
 assert.equal(standard.name,"Bees Wax");
 const lead=standard.composition.filter(x=>x.parameter==="Lead");
 assert.equal(lead.length,1);
 assert.equal(lead[0].operator,"<=");
 assert.equal(lead[0].value,2);
 assert.equal(lead[0].unit,"mg/kg");
 assert.ok(chapter.official_sources.some(s=>s.url===officialUrl));
 const direct=contaminants.direct_product_standard_contaminant_rules_v1.filter(g=>g.catalog_id===id);
 assert.equal(direct.length,1);
 assert.equal(direct[0].fssr,identity.fssr);
 assert.equal(direct[0].product_name,identity.name);
 assert.equal(direct[0].official_source_url,officialUrl);
 assert.match(direct[0].source_basis,/2\.8\.3\(2\)/);
 assert.equal(direct[0].rules.length,1);
 assert.equal(direct[0].rules[0].contaminant,"Lead");
 assert.equal(direct[0].rules[0].limit,lead[0].value);
 assert.equal(direct[0].rules[0].unit,lead[0].unit);
 assert.equal(direct[0].rules[0].verification,"official_fssai_direct_product_standard");
});

test("Bees Wax has no Honey/Royal Jelly inheritance and retains CTR fail-closed lock",()=>{
 const direct=contaminants.direct_product_standard_contaminant_rules_v1;
 for(const name of ["Honey","Royal Jelly"]){
  const identities=catalogue.filter(p=>p.name===name);
  assert.ok(identities.length>0,name+" identity missing");
  for(const identity of identities)assert.equal(direct.some(g=>g.catalog_id===identity.id),false);
 }
 const bees=direct.find(g=>g.catalog_id===id);
 assert.match(bees.policy,/No inheritance by Honey, Royal Jelly or composite food/i);
 assert.equal(contaminants.profiles.some(g=>g.catalog_ids?.includes(id)),false);
 const lock=contaminants.chapter_2_8_locked_contaminant_routes_v9.find(g=>g.catalog_id===id);
 assert.ok(lock);
 assert.equal(lock.status,"locked_no_exact_current_article");
 assert.match(lock.lock_scope,/Version IX/);
 assert.match(lock.reason,/Lead 2\.0 mg\/kg/);
 assert.match(lock.reason,/Honey antibiotic MRPLs are not inherited/);
});

test("Finished product rules are selected by exact catalogue ID in helper UI",()=>{
 assert.match(helper,/direct_product_standard_contaminant_rules_v1\|\|\[\]/);
 assert.match(helper,/\.filter\(x=>x\.catalog_id===id\)/);
 assert.match(helper,/\.forEach\(group=>\(group\.rules\|\|\[\]\)\.forEach\(r=>pushRule\(\{\.\.\.r\}\)\)\)/);
});
