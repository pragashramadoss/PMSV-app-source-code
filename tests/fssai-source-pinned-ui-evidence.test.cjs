"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const rules=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/chapter-2-3-fruit-vegetable-v1.json"),"utf8"));
const standards=new Map(rules.standards.map(x=>[x.key,x]));
const start=html.indexOf("function sourcePinnedStandardSupplementHtml(st)");
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
 assert.match(x,/Only rigid containers/);
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
 const invocations=html.match(/sourcePinnedStandardSupplementHtml\(standard\)/g)||[];
 assert.equal(invocations.length,2);
 assert.match(html,/html\+=sourcePinnedStandardSupplementHtml\(standard\)/);
 assert.match(html,/blocks\.push\(sourcePinnedSupplement\)/);
});
test("untrusted standard text cannot inject HTML",()=>{
 const fake={numeric_evidence:{source_url:"https://fssai.gov.in/test.pdf"},quality_rules:['<img src=x onerror=alert(1)>']};
 const x=render(fake);
 assert.ok(!x.includes("<img "));
 assert.ok(x.includes("&lt;img"));
});
