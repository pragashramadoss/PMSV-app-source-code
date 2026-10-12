"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const m=read("fssai-four-tomato-pan-named-source-subroutes-2026-10-12.json"),
d=read("fssai-current-first-source-533-live-ledger-450-83-2026-10-12.json"),
q=read("fssai-current-83-first-exact-source-proof-worklist-2026-10-12.json"),
prior=read("fssai-current-first-source-533-live-ledger-446-87-2026-10-12.json"),
oldq=read("fssai-current-87-first-exact-source-proof-worklist-2026-10-12.json"),
code=fs.readFileSync(path.join(root,"fssai-first-source-current-450-83.js"),"utf8");
const digest=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsvReviewSnapshotDigest:digest,
 pmsv446Valid:()=>true,pmsv446Ledger:prior,pmsv87Queue:oldq,
 contaminantsDb:{source_version:m.source_version,official_sources:[{url:m.official_ctr}]},
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
 pmsvCurrent116ProofChecklistHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(code,c);
 c.pmsv450Source=structuredClone(m);c.pmsv450Ledger=structuredClone(d);
 c.pmsv83Queue=structuredClone(q);return c;
}
test("Current source ledger: 450 partial, 83 pending; all 533 mapped and 4 sourced subroutes",()=>{
 const c=ctx();assert.equal(c.pmsv450Valid(),true);
 assert.equal(d.records.length,533);assert.equal(m.products.length,4);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,450);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,83);
 assert.equal(q.review_records.length,83);
 assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,83);
});
test("Three tomato subtype routes: Pb 1.5, Sn 250 on concentrates, Copper 100 DRIED TOMATO SOLIDS",()=>{
 const t=m.products.filter(x=>x.catalog_id!=="100-100-pan-masala");
 assert.equal(t.length,3);
 for(const x of t){
 assert.equal(x.qualified_named_product_standard,"2.3.14");
 assert.equal(x.concentration_thresholds.tomato_puree_min_total_soluble_solids_percent,9);
 assert.equal(x.concentration_thresholds.tomato_paste_min_total_soluble_solids_percent,25);
 assert.equal(x.actual_finished_lot_identity_verified,false);
 const copper=x.named_ctr_articles.find(a=>a.metal==="Copper");
 assert.equal(copper.limit,100);
 assert.match(copper.basis,/DRIED TOMATO SOLIDS/);
 }
 const wet=t.find(x=>x.fssr==="2.3.16");
 assert.equal(wet.named_ctr_articles.length,1);
 assert.equal(wet.named_ctr_articles[0].metal,"Copper");
 assert.ok(!wet.named_ctr_articles.some(x=>x.metal==="Lead"||x.metal==="Tin"));
 for(const z of t.filter(x=>x.fssr!=="2.3.16")){
 assert.deepEqual(z.named_ctr_articles.slice(0,2).map(x=>[x.metal,x.limit]),[["Lead",1.5],["Tin",250]]);
 }
});
test("Pan Masala: betelnut MAY be present, 20 total and 10 B1 composite aflatoxins only if confirmed",()=>{
 const p=m.products.find(x=>x.catalog_id==="100-100-pan-masala");assert.ok(p);
 assert.match(p.legal_definition,/MAY contain betelnut/);
 assert.equal(p.require_positive_recipe_ingredient,true);
 assert.equal(p.named_ctr_articles[0].limit,20);
 assert.equal(p.named_ctr_articles[1].limit,10);
 assert.ok(p.named_ctr_articles.every(x=>x.unit==="µg/kg"));
 assert.match(p.negative_controls.join(" " ),/without arecanut/);
 assert.equal(p.actual_lot_composition_verified,false);
});
test("Historical 446/87 immutable, exactly 4 changed and all 83 outstanding research cases identical",()=>{
 const promoted=new Set(m.products.map(x=>x.catalog_id));let changed=0;
 for(let i=0;i<533;i++){
 const a=prior.records[i],b=d.records[i];
 if(promoted.has(a.catalog_id)){
  changed++;assert.equal(a.source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(b.source_status,"PARTIAL_EXACT_SOURCE_MATCH");
  assert.equal(b.sample_lab_pass,false);assert.equal(b.complete_contaminant_panel,false);
 }else assert.deepEqual(b,a);
 }
 assert.equal(changed,4);
 assert.deepEqual(new Set(q.review_records.map(x=>x.catalog_id)),
  new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id)));
 assert.equal(q.promoted_catalog_ids.length,33);
});
test("Updated Helper shows precise named evidence and limits but NO passed sample or product",()=>{
 const c=ctx();
 for(const e of m.products){
 const p={id:e.catalog_id,name:e.product_name,fssr:e.fssr,fcs:e.fcs},
 h=c.pmsv450Html(p);
 assert.match(h,/450 partial \/ 83 pending/);
 assert.match(h,/NO AUTOMATIC LIMIT OR PASS/);
 assert.match(h,/Official CTR Version IX/);
 assert.match(h,/Still required before any regulatory decision/);
 assert.equal(c.pmsvCurrent116ProofChecklistHtml(p),"");
 }
 const r=q.review_records[0];
 assert.match(c.pmsv450Html({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs}),/FIRST EXACT SOURCE PENDING/);
});
test("Any tampered named source, ledger, queue or invented compliance PASS fails closed",()=>{
 for(const key of ["manifest","ledger","queue"]){
 const c=ctx(),x=key==="manifest"?c.pmsv450Source:key==="ledger"?c.pmsv450Ledger:c.pmsv83Queue;
 x.unverified=true;assert.equal(c.pmsv450Valid(),false,key);
 }
 for(const flag of ["actual_finished_lot_identity_verified","any_numeric_finished_food_limit_auto_applied","any_complete_compliance_pass"]){
 const c=ctx();c.pmsv450Source[flag]=true;
 assert.equal(c.pmsv450Valid(),false,flag);
 }
 const c=ctx();c.pmsv446Valid=()=>false;assert.equal(c.pmsv450Valid(),false);
});
test("Latest page scripts and full CI link official 450/83 evidence without deleting old packets",()=>{
 const page=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const wf=fs.readFileSync(path.resolve(root,"../.github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.ok(page.indexOf("fssai-first-source-current-450-83.js")>page.indexOf("fssai-first-source-current-446-87.js"));
 assert.match(wf,/fssai-first-source-current-450-83-2026-10-12\.test\.cjs/);
 const prior=fs.readFileSync(path.join(root,"fssai-first-source-current-446-87.js"),"utf8");
 const old=fs.readFileSync(path.join(root,"fssai-52-current-first-source-evidence-panels.js"),"utf8");
 assert.match(prior,/pmsv450Valid/);assert.match(old,/pmsv450Valid/);
});
