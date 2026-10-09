"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const rules=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/chapter-2-3-fruit-vegetable-v1.json"),"utf8"));
const standards=new Map(rules.standards.map(x=>[x.key,x]));
const start=html.indexOf("function sourcePinnedStandardSupplementHtml(st,selectedCatalogId)");
const end=html.indexOf("function standardLookupRegulatoryCompositionHtml(){",start);
assert.ok(start>0&&end>start,"UI evidence renderer is missing");
const snippet=html.slice(start,end);
const esc=str=>String(str??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const render=Function("esc",snippet+";return sourcePinnedStandardSupplementHtml;")(esc);
test("renderer rejects missing numeric/scope evidence",()=>{
 assert.equal(render({key:"2.3.6",composition:[{parameter:"X",value:2}]}),"");
});
test("source-pinned ketchup appears with conditional packaging and no compliance approval",()=>{
 const x=render(standards.get("2.3.27"));
 assert.match(x,/Official FSSAI source-baseline evidence/);
 assert.match(x,/Official Chapter PDF/);
 assert.match(x,/Rigid-container fill/);
 assert.match(x,/Only when packed in rigid containers/);
 assert.match(x,/not a full compliance verdict/);
 assert.doesNotMatch(x,/Compliance passed|Compliant: yes/i);
});
test("sauce product variants all shown independently, never auto-accepted",()=>{
 const x=render(standards.get("2.3.28"));
 for(const label of ["Chilli sauce","Fruit or vegetable sauces","Culinary pastes or sauces","Ginger paste"])assert.ok(x.includes(label),label);
 assert.match(x,/none is automatically selected or approved/);
 assert.match(x,/&gt;= 15/);
 assert.match(x,/&gt;= 3/);
});
test("industrial juice clause without universal numeric limits never fabricates a value",()=>{
 const x=render(standards.get("2.3.16"));
 assert.match(x,/does not prescribe one universal numerical composition limit/);
 assert.match(x,/Conditional packaging standards/);
 assert.doesNotMatch(x,/Variant-specific composition/);
});
test("pickle variants show no-medium fail-closed state and exact medium requirements",()=>{
 const x=render(standards.get("2.3.43"));
 assert.match(x,/Pickles in vinegar/);
 assert.match(x,/Pickles in brine/);
 assert.match(x,/Pickles without a listed preserving medium/);
 assert.match(x,/No blanket composition figure/);
 assert.match(x,/none is automatically selected or approved/);
});
test("UI renderer is wired into both product-standard and nutrition views",()=>{
 const invocations=html.match(/sourcePinnedStandardSupplementHtml\(standard,product\?\.id\)/g)||[];
 assert.equal(invocations.length,2);
 assert.match(html,/html\+=sourcePinnedStandardSupplementHtml\(standard,product\?\.id\)/);
 assert.match(html,/blocks\.push\(sourcePinnedSupplement\)/);
});
test("untrusted standard text cannot inject HTML",()=>{
 const fake={numeric_evidence:{source_url:"https://fssai.gov.in/test.pdf"},quality_rules:['<img src=x onerror=alert(1)>']};
 const x=render(fake);
 assert.ok(!x.includes("<img "));
 assert.ok(x.includes("&lt;img"));
});

test("exact fungi identity does not display numeric limits of different fungi preparations",()=>{
 const fungi=standards.get("2.3.62");
 const frozen=render(fungi,"04-04-2-quick-frozen-fungi");
 assert.match(frozen,/Quick frozen fungi/);
 assert.match(frozen,/-18/);
 assert.doesNotMatch(frozen,/Dried Shii-ta-ke fungi/);
 assert.doesNotMatch(frozen,/Pickled fungi/);
 assert.doesNotMatch(frozen,/Salted fungi \(semi-processed\)/);
 const extracts=render(fungi,"04-04-2-fungi-extract-and-fungi-concentrate");
 assert.match(extracts,/Fungi extract/);
 assert.match(extracts,/Fungi concentrate/);
 assert.doesNotMatch(extracts,/Quick frozen fungi/);
 const wrong=render(fungi,"not-a-loaded-product");
 assert.match(wrong,/No exact product-specific variant mapping/);
 assert.doesNotMatch(wrong,/Quick frozen fungi/);
});
test("selected ginger paste shows only ginger limits and does not borrow chilli sauce",()=>{
 const sauces=standards.get("2.3.28");
 const h=render(sauces,"04-04-2-ginger-paste");
 assert.match(h,/Ginger paste/);
 assert.doesNotMatch(h,/Fruit or vegetable sauces/);
 assert.doesNotMatch(h,/Chilli sauce/);
});
test("date paste highlights its absolute no-additives clause",()=>{
 const x=render(standards.get("2.3.56"),"04-04-1-date-paste");
 assert.match(x,/No food additives allowed/);
 assert.match(x,/not a full compliance verdict/);
});
