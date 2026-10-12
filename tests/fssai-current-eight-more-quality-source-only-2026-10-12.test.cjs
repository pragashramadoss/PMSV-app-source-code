"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const get=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=get("fssai-eight-extra-pending-quality-standards-2026-10-12.json"),
prior=get("fssai-16-current-pending-finished-product-quality-source-audit-2026-10-12.json"),
q=get("fssai-current-76-first-exact-source-proof-worklist-2026-10-12.json"),
ledger=get("fssai-current-first-source-533-live-ledger-457-76-2026-10-12.json"),
code=fs.readFileSync(path.join(root,"fssai-current-eight-more-quality-source-only.js"),"utf8");
const digest=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){const v=s.charCodeAt(i);a=Math.imul(a^v,16777619);b=Math.imul(b^v,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsv457Valid:()=>true,pmsvQuality16Valid:()=>true,pmsvReviewSnapshotDigest:digest,pmsvQuality16Data:prior,pmsv76Queue:q,pmsv457Ledger:ledger,pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(code,c);c.pmsvQuality8Data=structuredClone(d);return c;
}
const rec=id=>d.records.find(x=>x.catalog_id===id);
const find=(id,n,basis)=>rec(id).quality_criteria.find(x=>x.name===n&&(!basis||x.basis===basis));
test("24 total reviewed pending quality dossiers, 102 explicit rules; contaminant ledger still 457/76",()=>{
 assert.equal(ctx().pmsvQuality8Valid(),true);assert.equal(d.records.length,8);
 assert.equal(d.quality_parameter_rows,56);assert.equal(prior.records.length,16);
 assert.equal(prior.quality_criteria_count+56,102);
 assert.equal(ledger.partial_exact,457);assert.equal(ledger.first_source_pending,76);
 for(const x of d.records)assert.equal(ledger.records.find(y=>y.catalog_id===x.catalog_id).source_status,"FIRST_EXACT_SOURCE_PENDING");
});
test("Coffee–chicory instant versus ground: moisture 4 versus 5, caffeine 1.4 versus 0.6",()=>{
 const id="coffee-chicory-mixture";
 assert.equal(find(id,"Moisture","instant product").value,4);
 assert.equal(find(id,"Moisture","roasted and ground mixture").value,5);
 assert.equal(find(id,"Caffeine (anhydrous)").value,1.4);
 assert.equal(find(id,"Caffeine").value,0.6);
 assert.equal(find(id,"Solubility in cold water at 16±2°C").value,180);
});
test("Cube/Misri TOTAL ash unlike glucose SULPHATED ash, icing starch rule correct",()=>{
 assert.equal(find("11-11-1-cube-sugar","Total ash").value,0.03);
 assert.equal(find("11-11-1-misri","Total ash").value,0.4);
 assert.equal(find("11-11-1-icing-sugar","Starch").value,4);
 const x=find("11-11-1-dried-glucose-syrup","Sulphated ash");
 assert.equal(x.value,1);assert.equal(x.op,"max");
 assert.match(rec("11-11-1-dried-glucose-syrup").prohibited_contaminant_transfer,/>1%/);
});
test("Dried egg white/yolk/whole chemistry distinct; vinegar and oil pickle acid and pH distinct",()=>{
 assert.equal(find("10-10-2-egg-powder","Total solids","dried egg white").value,91.5);
 assert.equal(find("10-10-2-egg-powder","Total lipid content","dried whole egg").value,41.2);
 assert.equal(find("10-10-3-pickled-eggs","Acidity as acetic acid","vinegar-based finished pickled eggs").value,0.8);
 assert.equal(find("10-10-3-pickled-eggs","Acidity as acetic acid","oil-based finished pickled eggs").value,0.6);
 assert.equal(find("10-10-3-pickled-eggs","pH of pickling solution","oil-based pickling solution").value,3.6);
});
test("Royal jelly moisture range, 10-HDA min and Type 1 sucrose (Type 2 NA)",()=>{
 assert.equal(find("100-100-royal-jelly","10-hydroxy-2-decenoic acid (10-HDA)").value,1.4);
 assert.ok(rec("100-100-royal-jelly").quality_criteria.some(x=>x.name==="Moisture"&&x.op==="min"&&x.value===62));
 assert.ok(rec("100-100-royal-jelly").quality_criteria.some(x=>x.name==="Moisture"&&x.op==="max"&&x.value===68.5));
 assert.equal(find("100-100-royal-jelly","Sucrose").value,3);
});
test("Only eight original pending foods render QUALITY panel; no contaminant PASS",()=>{
 const c=ctx(),x=rec("coffee-chicory-mixture");
 const html=c.pmsvQuality8Html({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
 assert.match(html,/QUALITY SOURCE ONLY/);assert.match(html,/Caffeine/);assert.match(html,/Official CTR IX/);
 const old=prior.records[0];
 assert.equal(c.pmsvQuality8Html({id:old.catalog_id,name:old.product_name,fssr:old.fssr,fcs:old.fcs}),"");
});
test("Tampered numeric data, source, artificial PASS and upstream integrity fail closed",()=>{
 for(const k of ["value","source","pass","upstream"]){
  const c=ctx();
  if(k==="value")c.pmsvQuality8Data.records[0].quality_criteria[0].value=3000;
  if(k==="source")c.pmsvQuality8Data.records[0].official_product_source="https://scribd.com";
  if(k==="pass")c.pmsvQuality8Data.records[0].full_compliance_pass=true;
  if(k==="upstream")c.pmsvQuality16Valid=()=>false;
  assert.equal(c.pmsvQuality8Valid(),false,k);
 }
});
test("Site source and workflow load all eight and retain prior sixteen intact",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const wf=fs.readFileSync(path.resolve(root,"../.github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.ok(html.indexOf("fssai-current-eight-more-quality-source-only.js")>
  html.indexOf("fssai-current-16-finished-quality-not-contaminant.js"));
 assert.match(wf,/fssai-current-eight-more-quality-source-only-2026-10-12\.test\.cjs/);
});
