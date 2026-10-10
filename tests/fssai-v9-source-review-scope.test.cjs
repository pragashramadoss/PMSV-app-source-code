"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const catalogue=JSON.parse(read("fssai-product-helper-preview-01/data/standard-search-index-v1.json")).products;
const queue=read("FSSAI-CONTAMINANT-EVIDENCE-QUEUE-2026-10-10.md");
const review=read("FSSAI-V9-SOURCE-REVIEW-PROCESSED-FRUIT-COCOA-SUGARS-2026-10-10.md");
const byId=id=>catalogue.find(x=>x.id===id);
test("Version IX lead review preserves essential analytical and scope qualifiers",()=>{
 assert.match(review,/Canned fruit cocktail \| 1\.0 mg\/kg/);
 assert.match(review,/Cocoa powder \| 5\.0 mg\/kg \| \*\*Dry fat-free substance basis\*\*/);
 assert.match(review,/Cereal grains, except buckwheat, canihua and quinoa \| 0\.2 mg\/kg/);
 assert.match(review,/sulphated ash \*\*exceeding 1\.0%\*\*/);
 assert.match(review,/sulphated ash \*\*not exceeding 0\.03%\*\*/);
 assert.match(review,/Do not decrement the queue/);
});
test("Processed fruit cocktail, cocoa beans and cocoa mass cannot be conflated with cited exact source forms",()=>{
 for(const [id,fssr] of [
  ["04-04-1-thermally-processed-fruit-salad-cocktail-mix","2.3.2"],
  ["04-04-2-cocoa-beans","2.3.54"],
  ["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake","2.7.8"],
  ["05-05-1-cocoa-powder","2.7.7"]
 ]){
   const entry=byId(id);
   assert.ok(entry,"Missing catalogue article "+id);
   assert.equal(entry.fssr,fssr,"Catalogue regulation drift "+id);
   assert.ok(review.includes(id),"Review scope missing "+id);
 }
 assert.match(queue,/\| Cocoa Beans \| `04-04-2-cocoa-beans` \| 2\.3\.54 \|/);
 assert.match(queue,/\| Cocoa mass or Cocoa\/Chocolate Liquor and Cocoa Cake \|/);
});
