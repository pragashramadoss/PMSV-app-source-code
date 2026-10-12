"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const m=read("fssai-seven-hbc-composite-colour-named-subroutes-2026-10-12.json"),
d=read("fssai-current-first-source-533-live-ledger-457-76-2026-10-12.json"),
q=read("fssai-current-76-first-exact-source-proof-worklist-2026-10-12.json"),
o=read("fssai-current-first-source-533-live-ledger-450-83-2026-10-12.json"),
p=read("fssai-current-83-first-exact-source-proof-worklist-2026-10-12.json"),
script=fs.readFileSync(path.join(root,"fssai-first-source-current-457-76.js"),"utf8");
const digest=obj=>{const t=JSON.stringify(obj);let a=0x811c9dc5,b=0x9747b28c;
for(let i=0;i<t.length;i++){const z=t.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}
return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsvReviewSnapshotDigest:digest,pmsv450Valid:()=>true,pmsv450Ledger:o,pmsv83Queue:p,
 contaminantsDb:{source_version:m.source_version,official_sources:[{url:m.official_ctr}]},
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
 pmsvCurrent116ProofChecklistHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(script,c);
 c.pmsv457Manifest=structuredClone(m);c.pmsv457Ledger=structuredClone(d);c.pmsv76Queue=structuredClone(q);
 return c;
}
test("Authenticated latest 533 products = 457 named partial sources + 76 first sources pending",()=>{
 const c=ctx();assert.equal(c.pmsv457Valid(),true);
 assert.equal(m.products.length,7);assert.equal(d.records.length,533);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,457);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,76);
 assert.equal(q.review_records.length,76);assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,76);
});
test("Four confection groups expose HBC Pb 2, As 1 and Sn 5 as source only",()=>{
 const ids=["18-18-1-starch-based-sweets","18-18-1-indian-confections",
 "18-18-1-dry-fruit-and-nuts-based-sweets","18-18-1-fruit-and-vegetables-based-sweets"];
 for(const id of ids){
 const x=m.products.find(x=>x.catalog_id===id);
 assert.ok(x);assert.ok(x.conditional_fssr_subroute.startsWith("2.7.1"));
 for(const [metal,value]of [["Lead",2],["Arsenic",1],["Tin",5]]){
 assert.ok(x.source_article_candidates.some(a=>a.contaminant===metal&&a.limit===value&&
 a.article==="Hard boiled sugar confectionery"),id+":"+metal);
 }
 assert.equal(x.actual_finished_lot_identity_verified,false);
 assert.ok(x.negative_transfer_controls.some(t=>/category|FoSCoS|generic|broad|finished/i.test(t)));
 }
});
test("Composite food total aflatoxins 20 and B1 10 source for named crops, NOT ingredients broadly",()=>{
 const ids=["18-18-1-dry-fruit-and-nuts-based-sweets",
 "12-12-10-vegetable-protein-products",
 "18-18-2-cereal-or-pulses-flour-starch-based-snacks-and-savouries"];
 for(const id of ids){
 const x=m.products.find(x=>x.catalog_id===id);assert.ok(x);
 assert.ok(x.source_article_candidates.some(y=>y.contaminant==="Total Aflatoxins"&&
 y.limit===20&&y.unit==="µg/kg"&&y.article.startsWith("Food product containing")));
 assert.ok(x.source_article_candidates.some(y=>y.contaminant==="Aflatoxin B1"&&
 y.limit===10&&y.unit==="µg/kg"&&y.article.startsWith("Food product containing")));
 }
 const protein=m.products.find(x=>x.catalog_id==="12-12-10-vegetable-protein-products");
 assert.equal(protein.conditional_fssr_subroute,"2.3.59");
 assert.match(protein.positive_source_basis.join(" "),/>=40% protein/);
});
test("Food-additive premix matches ONLY named synthetic food colour mixture Pb 10, As 3",()=>{
 const x=m.products.find(x=>x.catalog_id==="99-99-1-mixture-preparations-premix-of-food-additives");
 assert.ok(x);assert.equal(x.source_article_candidates.length,2);
 assert.deepEqual(x.source_article_candidates.map(z=>[z.contaminant,z.limit]),[["Lead",10],["Arsenic",3]]);
 assert.ok(x.source_article_candidates.every(z=>z.article==="Synthetic food colour-preparation and mixtures"));
 assert.match(x.negative_transfer_controls.join(" "),/Natural colouring foods/);
});
test("All 526 archived records are byte-for-byte unchanged; exactly 7 move to partial source",()=>{
 const promoted=new Set(m.products.map(x=>x.catalog_id));let n=0;
 for(let i=0;i<533;i++){
 const a=o.records[i],b=d.records[i];
 if(promoted.has(a.catalog_id)){
  n++;assert.equal(a.source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(b.source_status,"PARTIAL_EXACT_SOURCE_MATCH");
  assert.equal(b.sample_lab_pass,false);assert.equal(b.product_compliance_approval,false);
 }else assert.deepEqual(b,a);
 }
 assert.equal(n,7);
 assert.deepEqual(new Set(q.review_records.map(x=>x.catalog_id)),
 new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id)));
});
test("Helper renders explicit conditional source, no false numeric or lot approval; collector closes",()=>{
 const c=ctx();
 for(const x of m.products){
 const p={id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs};
 const output=c.pmsv457Html(p);
 assert.match(output,/457 partial \/ 76 pending/);
 assert.match(output,/NO AUTOMATIC SOURCE-LIMIT APPLICATION OR PASS/);
 assert.match(output,/Official FSSAI CTR Version IX/);
 assert.equal(c.pmsvCurrent116ProofChecklistHtml(p),"");
 }
 const still=q.review_records[0],p={id:still.catalog_id,name:still.product_name,fssr:still.fssr,fcs:still.fcs};
 assert.match(c.pmsv457Html(p),/FIRST EXACT SOURCE PENDING/);
});
test("Any dossier, 533-ledger, pending queue, invented lot PASS or upstream tampering fails closed",()=>{
 for(const kind of ["manifest","ledger","queue"]){
 const c=ctx(),v=kind==="manifest"?c.pmsv457Manifest:kind==="ledger"?c.pmsv457Ledger:c.pmsv76Queue;
 v.invented=true;assert.equal(c.pmsv457Valid(),false,kind);
 }
 for(const k of ["actual_finished_lot_identity_verified","source_limits_auto_applied","full_compliance_pass"]){
 const c=ctx();c.pmsv457Manifest.products[0][k]=true;
 assert.equal(c.pmsv457Valid(),false,k);
 }
 const c=ctx();c.pmsv450Valid=()=>false;assert.equal(c.pmsv457Valid(),false);
});
test("Latest source loads in GitHub Helper AFTER 450/83; full workflow runs all 8 regressions",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(html.indexOf("fssai-first-source-current-457-76.js")>
 html.indexOf("fssai-first-source-current-450-83.js"));
 const flow=fs.readFileSync(path.resolve(root,"../.github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(flow,/fssai-first-source-current-457-76-2026-10-12\.test\.cjs/);
 const old=fs.readFileSync(path.join(root,"fssai-first-source-current-450-83.js"),"utf8");
 const dossier=fs.readFileSync(path.join(root,"fssai-52-current-first-source-evidence-panels.js"),"utf8");
 assert.match(old,/pmsv457Valid/);assert.match(dossier,/pmsv457Valid/);
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
});
