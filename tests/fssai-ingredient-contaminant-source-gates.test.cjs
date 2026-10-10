"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const start=html.indexOf("function contaminantIngredientRulesForName(name){");
const end=html.indexOf("\nfunction ",start+15);
assert.ok(start>=0&&end>start,"Ingredient runtime isolated");
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const ctx=vm.createContext({normIngredient:norm,contaminantsDb:db});
vm.runInContext(html.slice(start,end),ctx);
const run=name=>Array.from(vm.runInContext("contaminantIngredientRulesForName("+JSON.stringify(name)+")",ctx));

test("all 14 ingredient groups and 28 numeric rows remain linked to official source masters",()=>{
 assert.equal(db.ingredient_triggers.length,14);
 assert.equal(db.ingredient_triggers.reduce((sum,g)=>sum+g.rules.length,0),28);
 for(const g of db.ingredient_triggers)for(const alias of g.aliases)
  assert.equal(run(alias).length,g.rules.length,g.id+" / "+alias);
 for(const name of ["wheat flour","barley water","coffee chicory mixture","canned mushrooms"])
  assert.equal(run(name).length,0,name+" cannot automatically inherit a different article");
});

test("source-master changes suppress individual ingredient aflatoxin, patulin, toxin and grouped-cereal limits",()=>{
 const changed=structuredClone(db);
 changed.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Cereal and cereal products").limit=999;
 changed.crop_contaminants.patulin.rules.find(x=>x.article==="Apple juice used as an ingredient in other beverages").limit=800;
 changed.crop_contaminants.ochratoxin_a.rules[0].limit=70;
 changed.naturally_occurring_toxic_substances.agaric_acid.find(x=>x.article==="Food containing mushrooms").limit=900;
 changed.naturally_occurring_toxic_substances.saffrole.find(x=>x.article==="Food containing mace and nutmeg").limit=12;
 ctx.contaminantsDb=changed;
 assert.equal(run("wheat").some(x=>x.contaminant==="Aflatoxin B1"),false);
 assert.equal(run("wheat").some(x=>x.contaminant==="Ochratoxin A"),false);
 assert.equal(run("wheat").some(x=>x.contaminant==="Total Aflatoxins"),true);
 assert.equal(run("wheat").some(x=>x.contaminant==="Deoxynivalenol"),true);
 assert.equal(run("apple juice").length,0);
 assert.equal(run("mushroom").length,0);
 assert.equal(run("nutmeg").length,0);
 ctx.contaminantsDb=db;
 assert.equal(run("apple juice").length,1);
 assert.equal(run("mushroom").length,1);
 assert.equal(run("nutmeg").length,1);
});

test("ingredient article references do not claim finished-formulation compliance",()=>{
 assert.match(html,/not automatically the applicable limits for the finished formulation/);
 assert.match(html,/processing, commodity scope and amendments need review/);
});

test("legacy formulation numeric limits cannot bypass checked FSSAI ingredient references",()=>{
 assert.doesNotMatch(html,/legacy\.concat\(current\)/);
 assert.match(html,/unmatchedLegacy\.forEach\(rule=>/);
 assert.match(html,/Numeric limit withheld\. The previous formulation reference is not verified/);
 assert.match(html,/Ingredient-article limit \(reference\)/);
 assert.match(html,/current\.forEach\(rule=>/);
});
