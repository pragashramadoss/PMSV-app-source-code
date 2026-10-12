"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01"),load=x=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",x),"utf8"));
const q=load("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json"),l=load("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json"),
 a=load("fssai-16-current-pending-finished-product-quality-source-audit-2026-10-12.json"),
 b=load("fssai-eight-extra-pending-quality-standards-2026-10-12.json"),
 c=load("fssai-fifteen-current-pending-fssr-quality-2026-10-12.json");
const js=fs.readFileSync(path.join(root,"fssai-pending-40-quality-coverage.js"),"utf8");
function ctx(){const x={console,pmsv493Valid:()=>true,pmsv40LegalGatesValid:()=>true,pmsvQuality16Valid:()=>true,pmsvQuality8Valid:()=>true,pmsvQuality24CurrentStatusValid:()=>true,pmsvQ15Valid:()=>true,pmsv40Queue:q,pmsv493Ledger:l,pmsvQuality16Data:a,pmsvQuality8Data:b,pmsvQ15Data:c,sourcePinned121ResearchProofHtml:()=>"Earlier quality and CTR review",esc:String};vm.createContext(x);vm.runInContext(js,x);return x}
const p=z=>({id:z.catalog_id,name:z.product_name,fssr:z.fssr,fcs:z.fcs});
test("All forty current pending identities partition exactly into twenty-six FSSR-quality linked and fourteen not-yet-linked",()=>{
 const x=ctx(),r=x.pmsvPending40QualityCoverage();assert.ok(r);assert.equal(r.size,40);
 const covered=[...r.values()].filter(y=>y.quality_module),out=[...r.values()].filter(y=>!y.quality_module);
 assert.equal(covered.length,26);assert.equal(out.length,14);
 assert.deepEqual(new Set(out.map(y=>y.name)).size,14);
 assert.ok([...r.values()].every(y=>l.records.some(z=>z.product_name===y.name&&z.source_status==="FIRST_EXACT_SOURCE_PENDING")));
});
test("New fifteen quality packages are linked separately from the pre-existing 24 historic quality packages",()=>{
 const x=ctx(),m=x.pmsvPending40QualityCoverage();
 assert.equal([...m.values()].filter(z=>z.quality_module==="Q15").length,15);
 assert.equal([...m.values()].filter(z=>z.quality_module==="Q8"||z.quality_module==="Q16").length,11);
});
test("Every pending panel displays truthful quality coverage and never a contaminant PASS",()=>{
 const x=ctx();for(const v of q.review_records){
 const h=x.sourcePinned121ResearchProofHtml(p(v));assert.match(h,/FIRST EXACT CONTAMINANT ARTICLE STILL PENDING/);assert.match(h,/Earlier quality and CTR review/);assert.match(h,/no finished lot verified or product approval/i);
 const has=x.pmsvPending40QualityCoverage().get(v.catalog_id).quality_module;
 if(has)assert.match(h,/Quality reference linked/);
 else assert.match(h,/Quality source review required/);
 }});
test("Quinoa, chia, vending water, animal casings, and broad additive identities do not borrow unsupported numeric quality rules",()=>{
 const x=ctx(),m=x.pmsvPending40QualityCoverage();
 for(const id of ["purified-vending-water","06-06-1-quinoa","06-06-1-chia-seeds","08-08-4-animal-casings","99-99-1-additives-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-and-other-"]){
 assert.ok(m.has(id));assert.equal(m.get(id).quality_module,null);
 assert.match(x.pmsvPending40QualityCoverageHtml(p(q.review_records.find(z=>z.catalog_id===id))),/This does NOT mean that no legal quality standard exists/);
 }});
test("Parent integrity failures, unverified amendment drift and source identity mismatch withhold coverage",()=>{
 for(const t of ["upstream","quality","count","identity","source"]){
 const x=ctx();
 if(t==="upstream")x.pmsv493Valid=()=>false;
 if(t==="quality")x.pmsvQ15Valid=()=>false;
 if(t==="count")x.pmsv493Ledger={...l,first_source_pending:39};
 if(t==="identity")x.pmsv40Queue={...q,review_records:[{...q.review_records[0],product_name:"false product"},...q.review_records.slice(1)]};
 if(t==="source")x.pmsvQ15Data={...c,records:[{...c.records[0],product_name:"not same"},...c.records.slice(1)]};
 assert.equal(x.pmsvPending40QualityCoverage(),null,t);
 assert.match(x.pmsvPending40QualityCoverageHtml(p(q.review_records[0])),/reconciliation is unavailable/);
 }
});
test("Preview script ordered after all authoritative quality sources; no WordPress changes",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const n=h.indexOf("fssai-pending-40-quality-coverage.js");
 assert.ok(n>h.indexOf("fssai-current-fifteen-quality.js"));
 assert.ok(n<h.indexOf("fssai-2026-may-533-89-effective-date.js"));
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
});
