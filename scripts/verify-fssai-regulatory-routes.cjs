#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root=path.resolve(__dirname, "..");
const dbDir=path.join(root,"fssai-product-helper-preview-01","data");
function read(name){return JSON.parse(fs.readFileSync(path.join(dbDir,name),"utf8"));}
const master=read("product-master-v1.json");
const idx=read("standard-search-index-v1.json");
const rules=read("rules/special-regulatory-routes-v1.json");
const products=master.catalog_products;
const profile=new Map(master.profiles.map(p=>[p.id,p]));
const indexed=new Map(idx.products.map(p=>[p.id,p]));
const routes=new Map(rules.routes.map(r=>[r.key,r]));
function check(p){return p.chapter_rule_link_status==="file_and_key_verified";}
assert.equal(products.length,533);
assert.equal(new Set(products.map(p=>p.id)).size,533);
assert.equal(master.profiles.length,533);
assert.equal(idx.products.length,533);
assert.equal(indexed.size,533);
assert.equal(routes.size,58);
assert.equal(rules.routes.length,58,"Duplicate special route keys");
const officialHost = (value) => {
  try {
    const u = new URL(value);
    return u.protocol==="https:" &&
      (u.hostname==="fssai.gov.in" || u.hostname.endsWith(".fssai.gov.in"));
  } catch { return false; }
};
for(const r of rules.routes){
 assert.ok(r.product_id && r.key,"Special route missing identity/key");
 const sources = r.official_sources || (r.official_source ? [r.official_source] : []);
 assert.ok(sources.length>0 && sources.every(officialHost),"Non-official or missing source on "+r.key);
 assert.notEqual(r.compliance_status,"complete","Category evidence must not imply full compliance: "+r.key);
 assert.notEqual(r.compliance_pass_enabled,true,"Premature approval on "+r.key);
}
const chapter=products.filter(check),special=products.filter(p=>p.regulatory_route_link_status==="file_and_key_verified");
assert.equal(chapter.length,475);
assert.equal(special.length,58);
assert.equal(chapter.length+special.length,533);
const count={};
const chapterCache = new Map();
let chapterKeyChecks=0;
const chapterKeyGaps=[];
function verifyChapterRule(p){
 const rel=p.rule_file||p.chapter_rule_file;
 const key=p.rule_key||p.chapter_rule_key;
 assert.ok(rel&&key,"Missing chapter file/key "+p.id);
 const cleaned=rel.replace(/^\.\//,"");
 const full=path.resolve(root,"fssai-product-helper-preview-01",cleaned);
 assert.ok(full.startsWith(path.join(root,"fssai-product-helper-preview-01","data","rules")+path.sep),"Invalid chapter file location "+p.id);
 assert.ok(fs.existsSync(full),"Missing chapter rule file "+p.id+": "+rel);
 if(!chapterCache.has(full))chapterCache.set(full,JSON.parse(fs.readFileSync(full,"utf8")));
 const data=chapterCache.get(full);
 const records=Array.isArray(data.standards)?data.standards:[];
 const exists=records.some(x=>x.key===key) || (!!data.standards && !Array.isArray(data.standards) && Object.hasOwn(data.standards,key)) || (Array.isArray(data.identity_purity_standards)&&data.identity_purity_standards.some(x=>x.key===key)) || (Array.isArray(data.other_substances)&&data.other_substances.some(x=>x.key===key));
 if(!exists)chapterKeyGaps.push({id:p.id,key,file:rel});
 chapterKeyChecks++;
}

for(const p of products){
 const q=indexed.get(p.id);
 const v=profile.get(p.profile_id);
 assert.ok(q&&v,"Index/profile missing for "+p.id);
 assert.equal(q.fssr,p.fssr,"FSSR mismatch for "+p.id);
 if(check(p)){
  assert.notEqual(p.regulatory_route_link_status,"file_and_key_verified","Ambiguous route "+p.id);
  assert.ok(p.rule_file||p.chapter_rule_file,"Missing chapter rule file "+p.id);
  assert.ok(p.rule_key||p.chapter_rule_key,"Missing chapter rule key "+p.id);
  verifyChapterRule(p);
  continue;
 }
 assert.equal(p.regulatory_route_link_status,"file_and_key_verified","Route not verified "+p.id);
 const r=routes.get(p.regulatory_route_key);
 assert.ok(r&&r.product_id===p.id,"Missing special file/key "+p.id);
 assert.equal(q.regulatory_route_key,r.key,"Search index route mismatch "+p.id);
 assert.equal(q.name,p.name,"Index display name mismatch "+p.id);
 assert.ok((r.official_sources || (r.official_source ? [r.official_source] : [])).every(officialHost),"Special route has invalid official source "+p.id);
 assert.equal(v.regulatory_route_key,r.key,"Profile route mismatch "+p.id);
 assert.notEqual(r.compliance_pass_enabled,true,"Unverified compliance prematurely approved "+p.id);
 count[p.category]=(count[p.category]||0)+1;
}
for(const [cat,n] of Object.entries({"04":8,"05":3,"11":1,"18":12,"99":26,"102":8}))assert.equal(count[cat],n,"Special category count mismatch "+cat);
const raw=fs.readFileSync(path.join(dbDir,"product-master-v1.json"));
const blob=crypto.createHash("sha1").update("blob "+raw.length+"\0").update(raw).digest("hex");
assert.equal(idx.generated_from_blob,blob,"Search index not synced to master blob");
console.log("PASS: 533 records; 475 chapter links; 58 special routes; 0 without routes.");
console.log("CHECKED: "+chapterKeyChecks+" chapter file paths; "+(chapterKeyChecks-chapterKeyGaps.length)+" direct standard keys resolved.");
if(chapterKeyGaps.length){console.warn("REVIEW: "+chapterKeyGaps.length+" mapped keys lack a direct standards[] entry; these require schema-aware legal verification.");for(const g of chapterKeyGaps)console.warn("REVIEW_ROUTE "+JSON.stringify(g));}
console.log("PASS: 58 special routes have unique keys, official-source URLs, no compliance pass enabled.");
console.log("NOTE: Official-source URL shape does not prove source content or legal applicability.");
console.log("NOTE: Category mapping is not full compliance validation. Chromium browser test separate.");
