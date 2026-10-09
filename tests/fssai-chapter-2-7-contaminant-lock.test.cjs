"use strict";
const test=require("node:test"), assert=require("node:assert/strict");
const fs=require("node:fs"), path=require("node:path"), vm=require("node:vm");
const root=path.join(__dirname,"../fssai-product-helper-preview-01");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const index=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8"));
const locks=db.chapter_2_7_locked_contaminant_routes_v9;
const keys=new Set(locks.map(x=>x.catalog_id));
const labels=["Chocolate","Cocoa mass","Dry Mixtures of Cocoa","Soft Candy","Lozenges","Chewing gum"];
function excerpt(start){
 const i=html.indexOf(start);assert.ok(i>=0,"Missing "+start);
 const end=html.indexOf("\nfunction ",i+start.length);
 assert.ok(end>i,"Missing function closing boundary: "+start);
 return html.slice(i,end);
}
const snippets=[
 excerpt("function exactFinishedProductContaminantLock(p){"),
 excerpt("function contaminantProfileForProduct(p){"),
 excerpt("function productBaselineContaminantRules(p){")
];
function buildContext(overrides={}){
 const ctx=vm.createContext({contaminantsDb:{...db,...overrides},normIngredient:v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),chapterRuleDbs:[],ruleDbStandards:()=>[]});
 vm.runInContext(snippets.join("\n"),ctx);
 return {
   lock:p=>vm.runInContext("exactFinishedProductContaminantLock("+JSON.stringify(p)+")",ctx),
   profile:p=>vm.runInContext("contaminantProfileForProduct("+JSON.stringify(p)+")",ctx),
   baseline:p=>vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx)
 };
}
test("all six Chapter 2.7 finished foods have unique explicit fail-closed locks",()=>{
 assert.equal(locks.length,6);
 assert.equal(keys.size,6);
 const locked=index.products.filter(p=>keys.has(p.id));
 assert.equal(locked.length,6);
 for(const p of locked){
  assert.ok(p.fssr.startsWith("2.7."),p.id);
  const record=locks.find(l=>l.catalog_id===p.id);
  assert.equal(record.status,"locked_no_exact_current_article",p.id);
  assert.ok(record.reason && record.reason.length>50,p.id);
 }
 for(const label of labels)assert.ok(locked.some(p=>p.name.toLowerCase().includes(label.toLowerCase())),label);
});
test("six product locks override even injected fuzzy FSSR family or identical-name article profiles",()=>{
 const extra=[];
 for(const entry of locks)extra.push({id:"hypothetical-"+entry.catalog_id,catalog_ids:[entry.catalog_id],match_fssr:[entry.fssr],rules:[{contaminant:"Lead",limit:999,unit:"mg/kg"}]});
 const ctx=buildContext({profiles:[...extra,...db.profiles],metal_article_rules_v9:{...db.metal_article_rules_v9,Lead:[...(db.metal_article_rules_v9.Lead||[]),...locks.map(l=>({article:l.product_name,limit:999,unit:"mg/kg"}))]}});
 for(const l of locks){
  const p=index.products.find(x=>x.id===l.catalog_id);
  assert.equal(ctx.lock(p).catalog_id,l.catalog_id);
  assert.equal(ctx.profile(p),null,"unsafe direct or family profile admitted for "+p.id);
  assert.deepEqual(Array.from(ctx.baseline(p)),[],"future broad metal article leaked to "+p.id);
 }
});
test("exact Cocoa Powder and Hard Candy records remain available",()=>{
 const ctx=buildContext();
 for(const id of ["05-05-1-cocoa-powder","05-05-2-sugar-boiled-confectionery-hard-candy"]){
  const p=index.products.find(x=>x.id===id);
  assert.ok(p,id);
  assert.equal(ctx.lock(p),null);
  const profile=ctx.profile(p);
  assert.ok(profile && profile.rules.length>0,id);
  assert.equal(profile.catalog_ids.includes(p.id),true,id);
 }
});
test("official data retains time-based 2026 amendment lock; no future limits auto applied",()=>{
 assert.match(db.source_version,/Version IX.*03\.02\.2026/);
 assert.equal(db.current_effective_basis.as_of,"2026-10-03");
 assert.match(db.current_effective_basis.note,/1 December 2026/);
 assert.equal(db.coverage.chapter_2_7_locked_routes,6);
 for(const x of locks)assert.doesNotMatch(x.reason,/is exempt|no contaminant limit required/i);
});
test("lookup mode and formulation mode cannot PASS the locked finished-product route",()=>{
 const from=html.indexOf("function renderMasterComplianceSummary(){");
 const to=html.indexOf("\nfunction ",from+30);
 const body=html.slice(from,to);
 assert.match(body,/const strictProductLock=exactFinishedProductContaminantLock\(product\)/);
 assert.match(body,/exactFinishedProductContaminantLock\(product\)\)\{/);
 assert.match(body,/masterComplianceRow\('Contaminants \/ residues','incomplete'/);
 assert.match(body,/This is not a contaminant exemption/);
 assert.match(body,/the product cannot receive a full contaminant PASS/);
});
