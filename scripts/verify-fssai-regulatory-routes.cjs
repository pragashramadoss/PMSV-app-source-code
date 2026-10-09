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
const chapter=products.filter(check),special=products.filter(p=>p.regulatory_route_link_status==="file_and_key_verified");
assert.equal(chapter.length,475);
assert.equal(special.length,58);
assert.equal(chapter.length+special.length,533);
const count={};
for(const p of products){
 const q=indexed.get(p.id);
 const v=profile.get(p.profile_id);
 assert.ok(q&&v,"Index/profile missing for "+p.id);
 assert.equal(q.fssr,p.fssr,"FSSR mismatch for "+p.id);
 if(check(p)){
  assert.notEqual(p.regulatory_route_link_status,"file_and_key_verified","Ambiguous route "+p.id);
  assert.ok(p.rule_file||p.chapter_rule_file,"Missing chapter rule file "+p.id);
  assert.ok(p.rule_key||p.chapter_rule_key,"Missing chapter rule key "+p.id);
  continue;
 }
 assert.equal(p.regulatory_route_link_status,"file_and_key_verified","Route not verified "+p.id);
 const r=routes.get(p.regulatory_route_key);
 assert.ok(r&&r.product_id===p.id,"Missing special file/key "+p.id);
 assert.equal(q.regulatory_route_key,r.key,"Search index route mismatch "+p.id);
 assert.equal(v.regulatory_route_key,r.key,"Profile route mismatch "+p.id);
 assert.notEqual(r.compliance_pass_enabled,true,"Unverified compliance prematurely approved "+p.id);
 count[p.category]=(count[p.category]||0)+1;
}
for(const [cat,n] of Object.entries({"04":8,"05":3,"11":1,"18":12,"99":26,"102":8}))assert.equal(count[cat],n,"Special category count mismatch "+cat);
const raw=fs.readFileSync(path.join(dbDir,"product-master-v1.json"));
const blob=crypto.createHash("sha1").update("blob "+raw.length+"\0").update(raw).digest("hex");
assert.equal(idx.generated_from_blob,blob,"Search index not synced to master blob");
console.log("PASS: 533 records; 475 chapter links; 58 special routes; 0 without routes.");
console.log("NOTE: Category mapping is not full compliance validation. Chromium browser test separate.");
