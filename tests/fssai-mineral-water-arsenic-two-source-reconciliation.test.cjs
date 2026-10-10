#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-10-beverages-v1.json");
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const catalog=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
test("Mineral-water Chapter 2.10 arsenic is distinct from stricter Section 2.1 current rule",()=>{
 const p=catalog.find(x=>x.id==="mineral-water");
 assert.ok(p);assert.equal(p.fssr,"2.10.7");assert.equal(p.rule_key,"2.10.7");
 const standard=chapter.standards.find(x=>x.key==="2.10.7");
 const productArsenic=standard.physical_chemical.filter(r=>r.parameter==="Arsenic");
 assert.equal(productArsenic.length,1);assert.equal(productArsenic[0].value,0.05);
 assert.equal(productArsenic[0].unit,"mg/L");
 const profile=db.profiles.find(x=>x.catalog_ids?.includes("mineral-water"));
 assert.ok(profile);
 const ctrArsenic=profile.rules.filter(x=>x.contaminant==="Arsenic");
 assert.equal(ctrArsenic.length,1);
 assert.equal(ctrArsenic[0].article,"Natural mineral water");
 assert.equal(ctrArsenic[0].limit,0.01);assert.equal(ctrArsenic[0].unit,"mg/L");
 assert.match(ctrArsenic[0].source_basis,/Section 2\.1/);
 const source=db.metal_article_rules_v9.Arsenic.find(x=>x.article==="Natural mineral water");
 assert.ok(source);
 assert.equal(source.limit,0.01);assert.equal(source.unit,"mg/L");
 const direct=db.direct_product_standard_contaminant_rules_v1.find(g=>g.catalog_id==="mineral-water");
 assert.ok(direct);
 assert.ok(!direct.rules.some(r=>r.contaminant==="Arsenic"),
  "Do not auto-display weaker Chapter 2.10 arsenic as a competing contaminant limit");
});
test("The on-screen comparison explicitly explains the stricter numeric requirement",()=>{
 assert.match(html,/p\.id==='mineral-water'/);
 assert.match(html,/FSSAI Chapter 2\.10, clause 2\.10\.7, lists arsenic at 0\.05 mg\/L/);
 assert.match(html,/Version IX Section 2\.1 lists <b>0\.01 mg\/L<\/b>/);
 assert.match(html,/PMSV uses the stricter 0\.01 mg\/L contaminant requirement/);
 assert.ok(!html.includes("p.id==='packaged-drinking-water'?'FSSAI Chapter 2.10"),
  "A mineral-water-specific conflict warning must not be incorrectly assigned to packaged water");
});
