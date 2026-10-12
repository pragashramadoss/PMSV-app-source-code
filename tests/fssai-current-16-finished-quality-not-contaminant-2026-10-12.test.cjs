"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const dir=path.resolve(__dirname,"../fssai-product-helper-preview-01"),db=path.join(dir,"data/rules");
const read=n=>JSON.parse(fs.readFileSync(path.join(db,n),"utf8"));
const d=read("fssai-16-current-pending-finished-product-quality-source-audit-2026-10-12.json"),
 l=read("fssai-current-first-source-533-live-ledger-457-76-2026-10-12.json"),
 q=read("fssai-current-76-first-exact-source-proof-worklist-2026-10-12.json"),
 source=fs.readFileSync(path.join(dir,"fssai-current-16-finished-quality-not-contaminant.js"),"utf8");
const digest=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){const x=s.charCodeAt(i);a=Math.imul(a^x,16777619);b=Math.imul(b^x,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function context(){
 const c={console,pmsv457Valid:()=>true,pmsvReviewSnapshotDigest:digest,
 pmsv457Ledger:l,pmsv76Queue:q,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"",esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")};
 vm.createContext(c);vm.runInContext(source,c);
 c.pmsvQuality16Data=structuredClone(d);return c;
}
const record=id=>d.records.find(x=>x.catalog_id===id);
const val=(id,n)=>record(id).quality_criteria.find(x=>x.name===n);
test("Official FSSR-quality review has 16 current pending identities and 46 source criteria without promoting 457/76",()=>{
 assert.equal(d.records.length,16);assert.equal(d.quality_criteria_count,46);assert.equal(q.review_records.length,76);
 assert.equal(l.partial_exact,457);assert.equal(l.first_source_pending,76);assert.equal(context().pmsvQuality16Valid(),true);
 for(const r of d.records){assert.equal(l.records.find(x=>x.catalog_id===r.catalog_id).source_status,"FIRST_EXACT_SOURCE_PENDING");}
});
test("Fungi extracts and dried concentrate use distinct 7%, 24%, 20%, 9% and 5% standards",()=>{
 assert.equal(val("04-04-2-fungi-extract-and-fungi-concentrate","Saltless extract (fungi extract)").value,7);
 assert.equal(val("04-04-2-fungi-extract-and-fungi-concentrate","Saltless extract (fungi concentrate)").value,24);
 assert.equal(val("04-04-2-fungi-extract-and-fungi-concentrate","Sodium chloride").value,20);
 assert.equal(val("04-04-2-dried-fungi-concentrate","Water content").value,9);
 assert.equal(val("04-04-2-dried-fungi-concentrate","Sodium chloride").value,5);
});
test("Exact fruit bar, cheese, date paste, murabba and candied sugar denominators",()=>{
 assert.equal(val("04-04-1-fruit-bar-toffee","Total soluble solids").value,75);
 assert.equal(val("04-04-1-fruit-cheese","Prepared fruit content").value,45);
 assert.equal(val("04-04-1-fruit-cheese","Strawberry/raspberry fruit content").value,25);
 assert.equal(val("04-04-1-date-paste","Acid-insoluble ash").value,0.1);
 assert.equal(val("04-04-1-murabba","Fruit content").value,55);
 const sugar=val("04-04-1-candied-crystallised-and-glazed-fruit-vegetable-rhizome-fruit-peel","Reducing sugar / total sugar");
 assert.equal(sugar.value,25);assert.match(sugar.unit,/total sugars/);assert.match(sugar.basis,/NOT % product mass/);
});
test("Frozen vegetables peroxidase NEGATIVE and minus 18 thermal centre; ginger paste not culinary paste",()=>{
 const f=record("04-04-2-frozen-vegetables");
 assert.ok(f.quality_criteria.some(x=>x.op==="negative"&&x.name==="Peroxidase test"));
 assert.ok(f.quality_criteria.some(x=>x.value===-18&&x.name.includes("Thermal centre")));
 assert.equal(val("04-04-2-ginger-paste","Total soluble solids").value,3);
 assert.equal(val("12-12-6-culinary-pastes","Total soluble solids").value,8);
});
test("Cocoa bean defects not dry-fat-free cocoa powder limits; frozen fried potato FFA measured on extracted oil",()=>{
 assert.equal(val("04-04-2-cocoa-beans","Mouldy beans").value,4);
 const ffa=val("04-04-2-quick-frozen-fried-potatoes","FFA of extracted oil as oleic acid");
 assert.equal(ffa.value,1.5);
 assert.match(record("04-04-2-cocoa-beans").forbidden_contaminant_transfer,/dry fat-free/);
});
test("HTML appears only for 16 relevant pending and renders quality NOT contaminant compliance",()=>{
 const c=context();
 const r=record("04-04-2-fungi-extract-and-fungi-concentrate");
 const h=c.pmsvQuality16Html({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs});
 assert.match(h,/QUALITY SOURCE ONLY/);
 assert.match(h,/7 %/);assert.match(h,/24 %/);assert.match(h,/Official CTR Version IX/);
 assert.doesNotMatch(h,/COMPLIANCE APPROVED|TESTED LOT PASS/);
 const p=q.review_records.find(x=>!d.records.some(y=>y.catalog_id===x.catalog_id));
 assert.equal(c.pmsvQuality16Html({id:p.catalog_id,name:p.product_name,fssr:p.fssr,fcs:p.fcs}),"");
});
test("Changed source values, forged numeric contaminant limits, lab passes and upstream ledger fail closed",()=>{
 for(const tamper of ["source","lab","limit","status","upstream"]){
  const c=context();
  if(tamper==="source")c.pmsvQuality16Data.records[0].quality_criteria[0].value=999;
  if(tamper==="lab")c.pmsvQuality16Data.records[0].actual_lot_testing_verified=true;
  if(tamper==="limit")c.pmsvQuality16Data.records[0].contaminant_numeric_limit_auto_applied=true;
  if(tamper==="status")c.pmsvQuality16Data.first_source_pending=75;
  if(tamper==="upstream")c.pmsv457Valid=()=>false;
  assert.equal(c.pmsvQuality16Valid(),false,tamper);
 }
});
test("New official quality panel is wired after latest 457/76 source and tested in GitHub actions",()=>{
 const html=fs.readFileSync(path.join(dir,"index.html"),"utf8"),
 wf=fs.readFileSync(path.resolve(dir,"../.github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.ok(html.indexOf("fssai-current-16-finished-quality-not-contaminant.js")>
 html.indexOf("fssai-first-source-current-457-76.js"));
 assert.match(wf,/fssai-current-16-finished-quality-not-contaminant-2026-10-12\.test\.cjs/);
});
