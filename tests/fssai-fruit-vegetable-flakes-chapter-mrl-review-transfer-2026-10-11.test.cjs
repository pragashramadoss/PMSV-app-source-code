"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const load=p=>JSON.parse(fs.readFileSync(path.join(root,base,p),"utf8"));
const db=load("rules/contaminants-v9-core.json"),index=load("standard-search-index-v1.json");
const id="06-06-3-fruit-vegetable-cereal-flakes";
test("mixed fruit-vegetable cereal flakes moves from cereal MRL review to source-scoped 2.3.20 fruit/vegetable pesticide review",()=>{
 const x=db.chapter_2_3_commodity_mrl_review_v1.filter(x=>x.catalog_id===id);
 assert.equal(x.length,1);assert.equal(x[0].fssr,"2.3.20");assert.equal(x[0].scope,"mixed_fruit_vegetable_cereal_dehydrated_flakes_not_breakfast_cereal");
 assert.equal(x[0].auto_apply_raw_ingredient_mrl,false);assert.equal(x[0].full_product_regulatory_approval,false);
 assert.deepEqual(x[0].candidate_finished_product_pesticide_articles,[]);assert.deepEqual(x[0].raw_ingredient_article_references_only,[]);
 assert.equal(db.chapter_2_4_commodity_mrl_review_v1.some(x=>x.catalog_id===id),false);
 assert.equal(db.chapter_2_3_commodity_mrl_review_v1.length,99);assert.equal(db.chapter_2_4_commodity_mrl_review_v1.length,76);
 assert.deepEqual(new Set(db.chapter_2_3_commodity_mrl_review_v1.map(x=>x.catalog_id)),new Set(index.products.filter(x=>String(x.fssr).startsWith("2.3.")).map(x=>x.id)));
 assert.deepEqual(new Set(db.chapter_2_4_commodity_mrl_review_v1.map(x=>x.catalog_id)),new Set(index.products.filter(x=>String(x.fssr).startsWith("2.4.")).map(x=>x.id)));
 assert.equal(db.chapter_2_3_commodity_mrl_review_v1.every(x=>!x.auto_apply_raw_ingredient_mrl&&!x.full_product_regulatory_approval),true);
 assert.equal(db.chapter_2_4_commodity_mrl_review_v1.every(x=>!x.auto_apply_commodity_mrl&&!x.auto_apply_aflatoxin_category&&!x.full_product_regulatory_approval),true);
});
