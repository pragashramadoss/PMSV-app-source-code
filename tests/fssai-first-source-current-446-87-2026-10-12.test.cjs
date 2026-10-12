"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const data=f=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",f),"utf8"));
const m=data("fssai-two-named-finished-food-conditional-subroutes-2026-10-12.json"),
d=data("fssai-current-first-source-533-live-ledger-446-87-2026-10-12.json"),
q=data("fssai-current-87-first-exact-source-proof-worklist-2026-10-12.json"),
o=data("fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json"),
p=data("fssai-current-89-first-exact-source-proof-worklist-2026-10-12.json"),
source=fs.readFileSync(path.join(root,"fssai-first-source-current-446-87.js"),"utf8");
const digest=obj=>{const t=JSON.stringify(obj);let a=0x811c9dc5,b=0x9747b28c;
for(let i=0;i<t.length;i++){let z=t.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsvReviewSnapshotDigest:digest,
 pmsv444Ledger:o,pmsv89Queue:p,pmsv444Valid:()=>true,pmsv52Valid:()=>true,
 contaminantsDb:{source_version:m.source_version,official_sources:[{url:m.official_ctr}]},
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
 pmsvCurrent116ProofChecklistHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(source,c);
 c.pmsv446Source=JSON.parse(JSON.stringify(m));c.pmsv446Ledger=JSON.parse(JSON.stringify(d));c.pmsv87Queue=JSON.parse(JSON.stringify(q));return c;
}
test("533-source ledger now 446 partial, 87 pending, conditional named sources only",()=>{
 assert.equal(ctx().pmsv446Valid(),true);assert.equal(d.records.length,533);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,446);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,87);
 assert.equal(q.review_records.length,87);assert.equal(m.products.length,2);
 assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,87);
});
test("Qualified Mango chutney FSSR 2.3.42 named lead and tin source, not generic chutney",()=>{
 const x=m.products.find(z=>z.catalog_id==="04-04-1-fruits-and-vegetable-chutney");
 assert.equal(x.fssr,"2.3.41");assert.equal(x.qualified_fssr,"2.3.42");
 assert.equal(x.source_limit,1);assert.equal(x.additional_limit,250);
 assert.match(x.condition,/50% total soluble solids/);
 assert.equal(x.actual_finished_lot_subtype_confirmed,false);assert.equal(x.lab_pass,false);
});
test("Qualified dry curry powder / mix masala only, 10 mg/kg dry matter, not pastes",()=>{
 const x=m.products.find(z=>z.catalog_id==="12-12-2-seasoning");
 assert.equal(x.source_limit,10);assert.match(x.article,/curry powder and mix masalas/);
 assert.match(x.unit,/dry matter basis/);assert.ok(x.negative_controls.some(s=>s.includes("Wet seasoning")));
});
test("All other 531 archived records byte-for-byte identical; two source-only upgrades",()=>{
 const ids=new Set(m.products.map(x=>x.catalog_id));let changed=0;
 for(let i=0;i<533;i++){
 if(ids.has(o.records[i].catalog_id)){
  changed++;assert.equal(o.records[i].source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(d.records[i].source_status,"PARTIAL_EXACT_SOURCE_MATCH");
 }else assert.deepEqual(d.records[i],o.records[i]);
 }
 assert.equal(changed,2);
 assert.deepEqual(new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id)),
 new Set(q.review_records.map(x=>x.catalog_id)));
});
test("UI distinguishes named regulatory source from lab PASS, and current local collector excludes partial",()=>{
 const c=ctx();
 for(const x of m.products){
 const p={id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs},html=c.pmsv446Html(p);
 assert.match(html,/446 partial \/ 87 pending/);assert.match(html,/SOURCE ARTICLE ONLY/);
 assert.match(html,/Actual lot identity/);assert.match(html,/Official CTR IX/);
 assert.equal(c.pmsvCurrent116ProofChecklistHtml(p),"");
 }
 const r=q.review_records[0];assert.match(c.pmsv446Html({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs}),/FIRST EXACT SOURCE PENDING/);
});
test("Forgery of source, current ledger, condition and lab PASS all fail closed",()=>{
 for(const prop of ["manifest","ledger","queue"]){
 const c=ctx(),d=prop==="manifest"?c.pmsv446Source:prop==="ledger"?c.pmsv446Ledger:c.pmsv87Queue;
 d.fake=true;assert.equal(c.pmsv446Valid(),false,prop);
 }
 for(const property of ["actual_finished_lot_subtype_confirmed","numeric_finished_food_limit_auto_applied","full_compliance_pass"]){
 const c=ctx();c.pmsv446Source.products[0][property]=true;assert.equal(c.pmsv446Valid(),false,property);
 }
 const c=ctx();c.pmsv444Valid=()=>false;assert.equal(c.pmsv446Valid(),false);
});
test("GitHub Helper loads newest official source after the archived 52 dossiers, CI covers it",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(html.indexOf("fssai-first-source-current-446-87.js")>html.indexOf("fssai-52-current-first-source-evidence-panels.js"));
 const flow=fs.readFileSync(path.join(root,"../.github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(flow,/fssai-first-source-current-446-87-2026-10-12\.test\.cjs/);
 const prior=fs.readFileSync(path.join(root,"fssai-52-current-first-source-evidence-panels.js"),"utf8");
 assert.match(prior,/pmsv446PromotedIds/);
});
