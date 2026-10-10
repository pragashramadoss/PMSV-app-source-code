#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-16-hemp-v1.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const official="https://fssai.gov.in/upload/uploadfiles/files/17_%20Chapter%202_16%20(Hemp%20seeds%20and%20seed%20products).pdf";
const expected=[
 ["fssai-2-16-hemp-seed","Hemp seed","2.16(2)(i)",5],
 ["fssai-2-16-hemp-seed-oil","Hemp seed oil","2.16(2)(ii)",10],
 ["fssai-2-16-hemp-seed-flour","Hemp seed flour","2.16(2)(iii)",5]
];
const at=helper.indexOf("function sourcePinnedHempChapter216Rules(p){");
const end=helper.indexOf("function productBaselineContaminantRules(p){",at);
assert.ok(at>0&&end>at,"Hemp product source gate must exist in active preview");
const ctx={standardSearchIndexDb:{products:catalogue},chapterRuleDbs:[chapter],
 ruleDbStandards:db=>db.standards||[]};
vm.runInNewContext(helper.slice(at,end),ctx);
const resolve=p=>ctx.sourcePinnedHempChapter216Rules(p);
const product=id=>catalogue.find(x=>x.id===id);

test("Chapter 2.16 official THC and CBD limits are exact and source pinned for all three hemp product forms",()=>{
 assert.ok(chapter.official_sources.some(s=>s.url===official));
 for(const [id,name,key,thc] of expected){
  const p=product(id);assert.ok(p&&p.name===name&&p.rule_key===key);
  const r=resolve(p);assert.equal(r.relevant,true);assert.equal(r.verified,true);
  assert.equal(r.official_source_url,official);assert.equal(r.rules.length,2);
  assert.equal(r.rules[0].contaminant,"Total THC");
  assert.equal(r.rules[0].limit,thc);assert.equal(r.rules[0].unit,"mg/kg");
  assert.equal(r.rules[0].article,name);
  assert.equal(r.rules[1].contaminant,"Cannabidiol (CBD)");
  assert.equal(r.rules[1].limit,75);assert.equal(r.rules[1].unit,"mg/kg");
  assert.match(r.rules[1].source_basis,/2\.16\(3\)/);
 }
 assert.ok(audit.includes("official_chapter_2_16_exact_thc_and_cross_cutting_cbd"));
 assert.ok(audit.includes("exact_hemp_chapter_2_16_thc_cbd:hempEvidence"));
});

test("Do not inherit hemp oil 10 mg/kg limit for hemp seeds/flour or unrelated beverages",()=>{
 assert.deepEqual(resolve(product("fssai-2-16-hemp-seed")).rules.map(x=>x.limit).join(","),"5,75");
 assert.equal(resolve(product("non-carbonated-water-based-beverages")).relevant,false);
 assert.equal(resolve({...product("fssai-2-16-hemp-seed"),id:"not-hemp"}).relevant,false);
 assert.equal(resolve({...product("fssai-2-16-hemp-seed"),name:"Hemp seed oil"}).verified,false);
 assert.equal(resolve({...product("fssai-2-16-hemp-seed"),rule_key:"2.16(2)(ii)"}).verified,false);
 assert.ok(helper.includes("hempChapter216.verified?hempChapter216.rules:[]"));
});

test("Source drift, missing official source and altered CBD clause withhold both numeric rules",()=>{
 const original=ctx.chapterRuleDbs;const seed=product("fssai-2-16-hemp-seed");
 const fail=(db,label)=>{ctx.chapterRuleDbs=[db];const r=resolve(seed);
  assert.equal(r.relevant,true,label);assert.equal(r.verified,false,label);
  assert.equal(r.rules.length,0,label)};
 const clone=()=>JSON.parse(JSON.stringify(chapter));
 let copy=clone();copy.standards.find(x=>x.key==="2.16(2)(i)").composition.find(x=>x.parameter==="Total THC").value=50;
 fail(copy,"tampered THC");
 copy=clone();copy.standards.find(x=>x.key==="2.16(2)(i)").composition.find(x=>x.parameter==="Total THC").unit="µg/kg";
 fail(copy,"tampered unit");
 copy=clone();copy.cross_cutting_limits.find(x=>x.key==="2.16(3)").value=750;
 fail(copy,"tampered CBD");
 copy=clone();copy.cross_cutting_limits=copy.cross_cutting_limits.filter(x=>x.key!=="2.16(3)");
 fail(copy,"missing CBD");
 copy=clone();copy.official_sources=[];fail(copy,"missing official source");
 ctx.chapterRuleDbs=[];assert.equal(resolve(seed).verified,false);
 ctx.chapterRuleDbs=original;
 assert.equal(resolve(seed).verified,true,"restore valid source");
});

test("Hemp requirements are not confused with a finished beverage, chemical cannabinoid additive permission or universal contaminant limits",()=>{
 assert.match(helper,/Hemp Chapter 2\.16 source review required/);
 const rules=resolve(product("fssai-2-16-hemp-seed-oil")).rules;
 assert.match(rules[0].condition,/beverage/i);
 assert.match(rules[1].condition,/does not authorize addition/i);
 assert.equal(chapter.cross_cutting_limits.find(x=>x.key==="2.16(2)(iv)").value,0.2);
 assert.equal(chapter.cross_cutting_limits.find(x=>x.key==="2.16(3)").value,75);
});
