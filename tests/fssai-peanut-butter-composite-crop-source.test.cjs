"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-2-fats-oils-v1.json");
const master=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
test("FSSAI peanut butter is made from roasted peanut/groundnut kernels, not an interchangeable raw groundnut article",()=>{
 const product=master.find(x=>x.id==="04-04-2-peanut-butter");
 assert.ok(product);
 assert.equal(product.fssr,"2.2.4(11)");
 const standard=chapter.standards.find(x=>x.key==="2.2.4(11)");
 assert.equal(standard.name,"Peanut Butter");
 assert.ok(standard.permitted_ingredients.includes("roasted groundnut kernels"));
 assert.match(standard.source_url,/^https:\/\/www\.fssai\.gov\.in\//);
});
test("Official Version IX composite-food Aflatoxins group contains source-exact 20 and 10 µg/kg rows",()=>{
 const expected=[["total_aflatoxins",20],["aflatoxin_b1",10]];
 for(const [key,number] of expected){
   const group=db.crop_contaminants[key];assert.ok(group,key);
   assert.equal(group.unit,"µg/kg",key);
   const rows=group.rules.filter(x=>/food product containing any/i.test(x.article||""));
   assert.equal(rows.length,1,key+" grouped composite article missing or ambiguous");
   assert.equal(Number(rows[0].limit),number,key);
 }
 assert.match(db.source_version,/Version IX.*03\.02\.2026/);
});
