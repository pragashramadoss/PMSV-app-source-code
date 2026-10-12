"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01"),read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=read("fssai-fifteen-current-pending-fssr-quality-2026-10-12.json"),
 q=read("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json"),
 l=read("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json"),
 old=[...read("fssai-16-current-pending-finished-product-quality-source-audit-2026-10-12.json").records,...read("fssai-eight-extra-pending-quality-standards-2026-10-12.json").records],
 script=fs.readFileSync(path.join(root,"fssai-current-fifteen-quality.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){const x={console,pmsv493Valid:()=>true,pmsvReviewSnapshotDigest:digest,pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"<div>Original panel</div>",esc:String};vm.createContext(x);vm.runInContext(script,x);x.pmsvQ15Data=structuredClone(d);return x;}
const get=k=>d.records.find(x=>x.source_rule_key===k);
test("15 new exact FSSR quality identities and 76 source values, zero contaminant promotions",()=>{
 const c=ctx(),prior=new Set(old.map(x=>x.catalog_id));assert.equal(c.pmsvQ15Valid(),true);assert.equal(d.records.length,15);assert.equal(d.quality_source_row_count,76);
 assert.equal(d.records.filter(x=>prior.has(x.catalog_id)).length,0);assert.equal(l.partial_exact,493);assert.equal(l.first_source_pending,40);
 assert.equal(d.first_ctr_promotions,0);assert.equal(d.approved_finished_products,0);
});
test("All 76 official FSSR source values trace to exact standard and subtype paths",()=>{
 let n=0;for(const x of d.records){const source=read(x.source_rule_file),std=(source.standards||source.other_substances).find(y=>y.key===x.source_rule_key);
 assert.ok(std,x.catalog_id);
 for(const r of x.quality_rows){const exact=r.source_json_path.split(".").reduce((a,k)=>a?.[k],std);
 if(r.value===null){assert.equal(exact,"100 mg/kg");assert.equal(r.operator,"source_value_only_no_auto_check")}
 else assert.equal(exact,r.value,x.catalog_id+": "+r.source_json_path);n++;
 }
 assert.ok(q.review_records.some(z=>z.catalog_id===x.catalog_id&&z.product_name===x.product_name));
 }assert.equal(n,76);
});
test("Separate cocoa cake/mass cocoa butter and 9 cocoa dry naming conditions",()=>{
 assert.ok(get("2.7.8").quality_rows.some(x=>x.parameter.replace(/_/g," ").includes("cocoa butter")&&x.variant.includes("Mass")));
 assert.equal(get("2.7.6").conditional_subtypes.nine_conditional_descriptions.length,9);
 assert.equal(get("2.7.6").quality_rows.find(x=>x.parameter.includes("wet basis")).value,32);
});
test("2024 liquid vs powder colouring, chestnut uric-operator uncertainty and arrowroot non-inheritance",()=>{
 assert.deepEqual(get("2.3.65").quality_rows.filter(x=>x.parameter==="Total solids").map(x=>x.value),[45,90]);
 assert.equal(get("2.3.64").quality_rows.find(x=>x.parameter.includes("Uric acid")).value,null);
 assert.equal(get("2.4.14").quality_rows.length,0);
});
test("2025 colostrum powder IgG points to powder, not liquid; trehalose excludes infant food",()=>{
 const x=get("2.1.23");assert.equal(x.conditional_subtypes.igg_specific_2025.colostrum_powder_igg_min_pct,8.5);
 assert.ok(x.quality_rows.filter(z=>z.variant==="Colostrum Powder").every(z=>z.source_json_path.startsWith("composition.1.")));
 assert.equal(get("3.3.4").conditional_subtypes.trehalose_permission.exclusion,"Infant food");
});
test("All 15 panels render exact quality numbers without any contaminant clearance",()=>{
 const c=ctx();
 for(const x of d.records){const h=c.sourcePinned121ResearchProofHtml({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
 assert.match(h,/QUALITY ONLY/);assert.match(h,/still PENDING/);assert.match(h,/Original panel/);assert.equal(x.full_regulatory_pass,false);}
});
test("Tampering with evidence, identity, source or upstream gate fails closed",()=>{
 for(const what of ["value","identity","source","upstream"]){const c=ctx();if(what==="value")c.pmsvQ15Data.records[0].quality_rows[0].value=999;
 if(what==="identity")c.pmsvQ15Data.records[0].product_name="wrong";
 if(what==="source")c.pmsvQ15Data.records[0].official_source_url="https://fake.invalid";
 if(what==="upstream")c.pmsv493Valid=()=>false;
 assert.equal(c.pmsvQ15Valid(),false,what);}
});
test("Current quality panel included after old 24 and required in CI",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8"),w=fs.readFileSync(path.join(root,"../.github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.ok(h.indexOf("fssai-current-fifteen-quality.js")>h.indexOf("fssai-current-24-quality-status-guard.js"));
 assert.match(w,/fssai-current-fifteen-quality-2026-10-12\.test\.cjs/);
});
