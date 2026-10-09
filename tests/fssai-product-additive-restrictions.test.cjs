"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.join(__dirname,"../fssai-product-helper-preview-01");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const chapter=JSON.parse(fs.readFileSync(path.join(root,"data/rules/chapter-2-3-fruit-vegetable-v1.json"),"utf8"));
const standards=new Map(chapter.standards.map(x=>[x.key,x]));
function extract(start){
 const i=html.indexOf(start);
 assert.ok(i>=0,"Missing "+start);
 const j=html.indexOf("\nfunction ",i+start.length);
 assert.ok(j>i,"Next function boundary missing: "+start);
 return html.slice(i,j);
}
const parts=[
 extract("function exactProductStandardAdditiveRestriction(){"),
 extract("function qualifyIngredient(item){"),
 extract("function checkUsageAgainstRule(item,q){")
];
function harness(key,opts={}){
 const record=standards.get(key);
 assert.ok(record,key+" missing");
 const product={id:"synthetic-test-"+key,name:record.name,rule_key:key,fssr:key};
 const context=vm.createContext({
   selectedProductForFortification:()=>product,
   currentChapterStandards:()=>[{standard:record}],
   currentSelectedProductName:()=>product.name,
   caffeinatedPrototypeScopeActive:()=>false,
   appendixFcsForRecord:()=>"4.1",
   findKnownIngredient:(name)=>opts.known?.[name]||null,
   findAppendixAdditive:(name)=>opts.additives?.[name]||null
 });
 vm.runInContext(parts.join("\n"),context);
 return {
   restrict:()=>vm.runInContext("exactProductStandardAdditiveRestriction()",context),
   qualify:(ingredient)=>vm.runInContext("qualifyIngredient("+JSON.stringify(ingredient)+")",context),
   usage:(ingredient,result)=>vm.runInContext("checkUsageAgainstRule("+JSON.stringify(ingredient)+","+JSON.stringify(result)+")",context)
 };
}
test("date paste and harissa additive inputs are BLOCKED even when Appendix A has an entry",()=>{
 for(const [key,name] of [["2.3.56","Citric acid"],["2.3.58","Sodium benzoate"]]){
   const h=harness(key,{additives:{[name]:{name,limit:"GMP",applied_from:"4.1"}}});
   assert.equal(h.restrict().banned,true);
   const q=h.qualify({name,basis:"additive",qty:0.1,unit:"kg"});
   assert.equal(q.status,"blocked",key);
   assert.equal(q.route,"blocked",key);
   assert.equal(q.product_standard_additive_ban,true,key);
   assert.match(q.qualification,/Appendix A category permission cannot override/,key);
   const calc=h.usage({name,basis:"additive",qty:0.1,unit:"kg"},q);
   assert.equal(calc.pass,false,key);
   assert.equal(calc.blockedByProductStandard,true,key);
 }
});
test("product-specific ban applies even if the Appendix A table lacks the additive or standard ingredient route",()=>{
 const h=harness("2.3.56",{known:{"Citric acid":{route:"standard",kind:"ingredient",qualification:"base food"}}});
 const q=h.qualify({name:"Citric acid",basis:"additive"});
 assert.equal(q.status,"blocked","Explicit additive declaration must not be bypassed by a general ingredient match");
 const unknown=h.qualify({name:"INS 12345",basis:"additive"});
 assert.equal(unknown.status,"blocked","An unknown additive must never become allowed by absence from Appendix A");
});
test("ordinary food inputs are not mistaken for food additives in date paste",()=>{
 const h=harness("2.3.56",{known:{Dates:{kind:"ingredient",route:"standard",qualification:"Date flesh",clause:"FSSAI 2.3.56"}}});
 const q=h.qualify({name:"Dates",basis:"standardized"});
 assert.equal(q.status,"qualified");
 assert.notEqual(q.route,"blocked");
});
test("groundnut color/preservative rules require exact functional-class review, not a false blanket ban",()=>{
 const h=harness("2.3.47(1)",{additives:{"Sodium benzoate":{limit:"600 mg/kg",applied_from:"4.1"}}});
 const r=h.restrict();
 assert.equal(r.banned,false);
 assert.deepEqual(Array.from(r.classes),["Added colouring matter","Preservatives"]);
 const q=h.qualify({name:"Sodium benzoate",basis:"additive"});
 assert.equal(q.route,"unresolved");
 assert.equal(q.status,"review");
 assert.match(q.qualification,/cannot automatically classify/i);
 const unknown=h.qualify({name:"Mysterious additive",basis:"additive"});
 assert.equal(unknown.status,"review");
});
test("unrestricted product can use a loaded Appendix A permission without new obstruction",()=>{
 const h=harness("2.3.54",{additives:{"Citric acid":{name:"Citric acid",limit:"GMP",applied_from:"4.1"}}});
 assert.equal(h.restrict(),null);
 const q=h.qualify({name:"Citric acid",basis:"additive"});
 assert.equal(q.status,"qualified");
 assert.equal(q.route,"standard");
});
test("actual interface and master compliance cannot claim a pass for blocked product additives",()=>{
 assert.match(html,/quantityStatus=usageCheck\?\.blockedByProductStandard\?'Prohibited by product standard'/);
 assert.match(html,/const productBannedAdditive=qs\.some\(q=>q\.status==='blocked'\)/);
 assert.match(html,/const banned=qs\.some\(q=>q\.status==='blocked'\|\|q\.route==='blocked'\)/);
 assert.match(html,/productAdditiveRestriction\?'evidence'/);
 assert.match(html,/product-standard no-additives|product standard prohibits/i);
});
