"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const first=load(base+"data/rules/fssai-v9-expanded-identity-nontransfer-2026-10-11.json");
const second=load(base+"data/rules/fssai-v9-cross-metal-matrix-2026-10-11.json");
const v9=load(base+"data/rules/contaminants-v9-core.json");
const pending=load(base+"data/rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const index=load(base+"data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,base,"index.html"),"utf8");
const start=html.indexOf("function sourcePinnedExpandedMetalScopeHtml(p){"),end=html.indexOf("function pendingContaminantReviewNotice(p){",start+30);
assert.ok(start>0&&end>start,"source-specific metal article UI missing");
const ctx=vm.createContext({
 expandedV9ScopeDb:structuredClone(first),crossMetalV9ScopeDb:structuredClone(second),
 contaminantsDb:structuredClone(v9),sourcePriorityMetalDb:structuredClone(pending),
 esc:s=>String(s??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]))
});
vm.runInContext(html.slice(start,end),ctx);
const product=id=>index.find(x=>x.id===id),draw=p=>vm.runInContext("sourcePinnedExpandedMetalScopeHtml("+JSON.stringify(p)+")",ctx);
test("Both expanded legal source matrices are loaded and used in the actual product screen",()=>{
 assert.match(html,/let expandedV9ScopeDb=null/);
 assert.match(html,/let crossMetalV9ScopeDb=null/);
 assert.match(html,/expandedV9ScopeDb=await res.json\(\)/);
 assert.match(html,/crossMetalV9ScopeDb=await res.json\(\)/);
 assert.match(html,/sourcePinnedExpandedMetalScopeHtml\(p\)/);
});
test("All 121 unresolved products either receive their own guarded references or no irrelevant section",()=>{
 const pendingIds=pending.unresolved_first_exact_catalog_ids;
 assert.equal(pendingIds.length,121);
 let covered=0,checks=0;
 for(const id of pendingIds){
  const p=product(id);assert.ok(p,id);
  const expected=first.scope_guards.filter(x=>x.catalog_id===id).length
   +second.scope_guards.filter(x=>x.catalog_id===id).length;
  const h=draw(p);
  if(expected){covered++;checks+=expected;assert.match(h,/scope checks?/);
   assert.match(h,/NOT APPLIED/);assert.match(h,/REVIEW ONLY/);
   assert.match(h,/not limits assigned to this finished product/i);
   assert.ok((h.match(/<tr>/g)||[]).length>=expected,h);
  }else assert.equal(h,"",id);
 }
 assert.equal(checks,103+284);
 assert.ok(covered>=84);
});
test("Product identity and historic-but-resolved product cannot gain expanded provisional limits",()=>{
 const id="04-04-2-dried-fungi",p=product(id);assert.match(draw(p),/scope checks?/);
 assert.match(draw({...p,name:"Spoofed Fungi"}),/withheld/);
 assert.equal(draw(product("04-04-2-dehydrated-vegetables")),"");
 assert.equal(draw(product("05-05-1-chocolate")),"");
});
test("Fail closed on changed source number, illegal product approval, missing source data and wrong catalogue total",()=>{
 const p=product("04-04-2-dried-fungi");
 const oldCore=ctx.contaminantsDb,oldMatrix=ctx.crossMetalV9ScopeDb,oldExpanded=ctx.expandedV9ScopeDb;
 const bad=structuredClone(v9);const r=bad.metal_article_rules_v9.Tin.find(x=>x.article==="Canned foods other than beverages");r.limit=2500;
 ctx.contaminantsDb=bad;assert.match(draw(p),/withheld/);ctx.contaminantsDb=oldCore;
 ctx.crossMetalV9ScopeDb=structuredClone(second);
 ctx.crossMetalV9ScopeDb.scope_guards.find(x=>x.catalog_id===p.id).full_compliance_pass=true;
 assert.match(draw(p),/withheld/);ctx.crossMetalV9ScopeDb=oldMatrix;
 ctx.expandedV9ScopeDb=structuredClone(first);ctx.expandedV9ScopeDb.total=532;
 assert.match(draw(p),/withheld/);ctx.expandedV9ScopeDb=oldExpanded;
 ctx.crossMetalV9ScopeDb=null;assert.match(draw(p),/withheld/);ctx.crossMetalV9ScopeDb=oldMatrix;
});
test("Selected example checks preserve cadmium quinoa exclusion, hard-boiled sweet specificity and canned packaging",()=>{
 for(const [id,metal] of [
 ["06-06-1-quinoa","Cadmium"],
 ["04-04-1-fruit-bar-toffee","Tin"],
 ["04-04-2-frozen-vegetables","Tin"]
 ]){const h=draw(product(id));assert.match(h,new RegExp(metal));assert.match(h,/NOT APPLIED/);}
});
