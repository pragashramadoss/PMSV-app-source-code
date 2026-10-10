"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-3-fruit-vegetable-v1.json");
const index=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const metals=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
test("FSSAI 21 October 2024 Gazette removes legacy copper prohibition from 2.3.43(1)",()=>{
 const standards=chapter.standards.filter(x=>x.key==="2.3.43");
 assert.equal(standards.length,1);
 const record=standards[0];
 assert.ok(record.quality_rules.some(x=>x.includes("free from mineral acid, alum and synthetic colours")));
 assert.ok(record.quality_rules.every(x=>!x.includes("free from copper, mineral acid")));
 assert.match(record.verification_note,/2024 Gazette amendment/);
 assert.equal(record.operative_amendment_reference.date,"2024-10-21");
 assert.equal(record.operative_amendment_reference.subclause,"1");
 assert.match(record.operative_amendment_reference.official_gazette_url,/^https:\/\/fssai\.gov\.in\//);
 const targets=index.filter(x=>x.fssr==="2.3.43");
 assert.ok(targets.length>=3,"All linked pickle products must continue to use updated standard");
});
test("2024 product-standard wording change does not remove applicable separate metal limits or other quality requirements",()=>{
 const record=chapter.standards.find(x=>x.key==="2.3.43");
 assert.ok(record.variant_composition.length>=4);
 assert.ok(record.quality_rules.some(x=>x.includes("fermentation")));
 assert.ok(record.quality_rules.some(x=>x.includes("Appendix A")));
 assert.match(record.operative_amendment_reference.legal_change,/does not waive separately applicable metal contaminant rules/);
 assert.ok(Array.isArray(metals.metal_article_rules_v9.Copper)&&metals.metal_article_rules_v9.Copper.length>0);
});
