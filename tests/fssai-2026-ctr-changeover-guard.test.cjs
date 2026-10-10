#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const contaminants=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json"),"utf8"));
const officialIndex="https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins";
const a=html.indexOf("function ctrMay2026AffectedProduct(p){");
const b=html.indexOf("function productBaselineContaminantRules(p){",a);
assert.ok(a>0&&b>a,"Changeover helper must be loaded before contaminant baseline");
const scope={normIngredient:s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),Date};
vm.runInNewContext(html.slice(a,b),scope);
const check=scope.ctrMay2026AffectedRule;
const before=Date.parse("2026-11-30T18:29:59Z");
const after=Date.parse("2026-11-30T18:30:00Z");
const product=(name,id="fixture")=>({id,name});
const rule=(contaminant,article="")=>({contaminant,article,limit:10,unit:"mg/kg"});

test("Official 2026 amendment is prospective, not applied in October 2026",()=>{
 assert.ok(html.includes(officialIndex));
 assert.equal(contaminants.source_version,"Version IX (03.02.2026)");
 for(const [p,r] of [
  [product("Besan"),rule("Lead","Pulses")],
  [product("Pea flour"),rule("Cadmium","Pulses")],
  [product("Fish oil"),rule("Arsenic","Edible fats and oils")],
  [product("Groundnut oil"),rule("Total Aflatoxins","Oilseeds or oil")],
  [product("Chocolate"),rule("Saffrole","Food")],
 ]){
  assert.equal(check(p,r,before),false,p.name+" must not be withdrawn before effective date");
 }
});
test("After 1 December 2026, potentially superseded VIX rows fail closed",()=>{
 for(const [p,r] of [
  [product("Besan"),rule("Lead","Pulses")],
  [product("Yellow pea powder"),rule("Cadmium","Pulses")],
  [product("Fish oil"),rule("Arsenic","Edible fats and oils")],
  [product("Groundnut oil"),rule("Total Aflatoxins","Oilseeds or oil")],
  [product("Soybean seed"),rule("Aflatoxin B1","Oilseeds")],
  [product("Chocolate"),rule("Saffrole","Food")]
 ]){
  assert.equal(check(p,r,after),true,p.name+" must require future Gazette reconciliation");
 }
});
test("Unchanged unrelated limits are not silently withheld",()=>{
 for(const [p,r] of [
  [product("Chocolate"),rule("Lead","Chocolate")],
  [product("Milk"),rule("Aflatoxin M1","Milk")],
  [product("Coffee"),rule("Ochratoxin A","Coffee")],
  [product("Sucralose"),rule("Heavy metals as Pb","Sucralose")],
  [product("Rice grain"),rule("Cadmium","Rice")]
 ]){
  assert.equal(check(p,r,after),false,p.name+" unrelated limit incorrectly withheld");
 }
 assert.equal(check(product("Fish oil"),rule("Arsenic","Oil"),Number.NaN),false);
});
test("Actual on-screen contaminant rules pass through the effective-date gate",()=>{
 assert.match(html,/const withheld2026Changeover=rawRules\.filter\(r=>ctrMay2026AffectedRule\(p,r\)\)/);
 assert.match(html,/const rules=rawRules\.filter\(r=>\{\s*if\(ctrMay2026AffectedRule\(p,r\)\)return false;/);
 assert.match(html,/potentially superseded Version IX numeric row\(s\) have been withheld/);
 assert.match(html,/revalidation required/);
 assert.match(html,/seafood antibiotic residues have not yet been fully transcribed/);
});
