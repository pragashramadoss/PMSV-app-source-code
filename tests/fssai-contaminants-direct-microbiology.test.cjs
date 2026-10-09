"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const chapter=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json"),"utf8"));
const index=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/standard-search-index-v1.json"),"utf8"));
const standards=new Map(chapter.standards.map(x=>[x.key,x]));
const ids=["2.4.13(1)","2.4.13(2)","2.4.13(3)","2.4.13(4)","2.4.13(5)"];
const start="function chapterSpecificMicrobiologyForProduct(p){",end="function renderProductMicrobiology(){";
const pos=html.indexOf(start),finish=html.indexOf(end,pos+start.length);
assert.ok(pos>0&&finish>pos,"Chapter-specific renderer missing");
const snippet=html.slice(pos,finish);
const esc=str=>String(str??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const context=vm.createContext({esc, currentChapterStandards:()=>[]});
vm.runInContext(snippet,context);
function render(product,records) {
 context.currentChapterStandards=()=>records.map(standard=>({standard}));
 return {
  matched:vm.runInContext("chapterSpecificMicrobiologyForProduct("+JSON.stringify(product)+").map(s=>s.key)",context),
  html:vm.runInContext("chapterSpecificMicrobiologyHtml("+JSON.stringify(product)+")",context)
 };
}
test("five exact oilseed flours display their own direct FSSAI source microbiology",()=>{
 for(const key of ids){
  const product=index.products.find(p=>p.rule_key===key);
  assert.ok(product,key+" product missing");
  const item=standards.get(key);
  const output=render(product,[item]);
  assert.deepEqual(Array.from(output.matched),[key]);
  assert.match(output.html,/Direct product-standard microbiological criteria/);
  assert.match(output.html,/50,?000|50000/);
  assert.match(output.html,/Coliform bacteria/);
  assert.match(output.html,/Salmonella/);
  assert.match(output.html,/Absent in 25 g/);
  assert.match(output.html,/current amendments and other applicability still require review/);
  assert.match(output.html,/Official FSSAI chapter source/);
 }
});
test("different grain or flour never inherits oilseed-flour microbiology",()=>{
 for(const key of ["2.4.1","2.4.6","2.4.31"]){
  const product=index.products.find(p=>p.rule_key===key);
  assert.ok(product,"Missing product "+key);
  const output=render(product,[...ids.map(k=>standards.get(k)),standards.get(key)]);
  assert.equal(output.html,"",key);
  assert.equal(output.matched.length,0,key);
 }
});
test("loaded unrelated chapter rule cannot leak into exact product microbiology",()=>{
 const p=index.products.find(p=>p.rule_key===ids[0]);
 const output=render(p,[standards.get(ids[1])]);
 assert.equal(output.html,"");
 assert.equal(output.matched.length,0);
});
test("microbiology renderer is connected to live results and assessment summary",()=>{
 assert.match(html,/const chapterSpecific=chapterSpecificMicrobiologyHtml\(p\)/);
 assert.match(html,/el\.innerHTML=chapterSpecific\+microbiologyProfileHtml/);
 assert.match(html,/chapterSpecificMicrobiologyForProduct\(product\)\.length/);
 assert.match(html,/Additional microbiology review remains open/);
});
test("source rows are escaped, and prohibited auto-approval is not enabled",()=>{
 const r={key:"2.4.13(1)",numeric_evidence:{source_url:"https://fssai.gov.in/source.pdf",compliance_assessment_enabled:false},chapter_specific_microbiology:[{parameter:"<img src=x>",value:1,operator:"<=",unit:"CFU/g"}]};
 const h=render({id:"synthetic",rule_key:r.key},[r]).html;
 assert.doesNotMatch(h,/<img /);
 assert.match(h,/&lt;img/);
 assert.doesNotMatch(h,/COMPLIANT|CERTIFIED|ALL RULES PASSED/i);
});
test("master contaminant lookup does not pass with universal-only methylmercury",()=>{
 const at=html.indexOf("function renderMasterComplianceSummary(){");
 assert.ok(at>0);
 const end=html.indexOf("function ",at+20);
 const scoped=html.slice(at,end>at?end:at+14000);
 assert.match(scoped,/const productSpecificCount=exactCount\+baselineCount\+pesticideCount/);
 assert.match(scoped,/const state=productSpecificCount\?'evidence':'incomplete'/);
 assert.match(scoped,/universal-only evidence as complete coverage/);
 assert.doesNotMatch(scoped,/const totalMapped=exactCount\+baselineCount\+pesticideCount\+conditionalCount\+universalCount/);
});
