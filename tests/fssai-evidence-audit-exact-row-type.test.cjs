#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const script=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const begin=script.indexOf("const exactContaminantArticles = new Set(");
const end=script.indexOf("const familyContaminantProfiles",begin);
assert.ok(begin>=0&&end>begin,"Exact Version IX article inventory must exist");
const fragment=script.slice(begin,end);
const normalized=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const collect=data=>{
 const context=vm.createContext({contaminants:{metal_article_rules_v9:data},normalizeArticle:normalized});
 vm.runInContext(fragment,context);
 return Array.from(vm.runInContext("exactContaminantArticles",context));
};
test("Audit exact-product count excludes Foods not specified and source-table default rows",()=>{
 const result=collect({Lead:[
   {article:"Foods not specified",row_type:"default",limit:2.5},
   {article:"Cocoa mass",row_type:"default",limit:5},
   {article:"Cocoa powder",row_type:"exact",limit:5},
   {article:"Milk",row_type:"literal_anomaly",limit:0.02},
   {article:"Coffee",limit:0.5}
 ]});
 assert.deepEqual(result,["cocoa powder"]);
 assert.ok(!result.includes("cocoa mass"));
});
test("UI and audit both require explicit exact row type, and all-food rules are not proof",()=>{
 assert.match(fragment,/\.filter\(row=>row\.row_type==='exact'\)/);
 assert.match(helper,/if\(r\.row_type==='exact' &&normIngredient\(r\.article\|\|''\)===n\)/);
 assert.match(script,/universal_rule_proves_product_coverage:false/);
});
