"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const q=read("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json");
const l=read("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json");
const d=read("fssai-four-new-current-pending-quality-sources-2026-10-13.json");
const code=fs.readFileSync(path.join(root,"fssai-four-new-pending-quality-2026-10-13.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsv493Valid:()=>true,pmsvReviewSnapshotDigest:digest,pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},esc:String};
 vm.createContext(c);vm.runInContext(code,c);c.pmsvQ4Data=JSON.parse(JSON.stringify(d));return c;
}
test("Four official FSSR quality identities remain within forty exact CTR-source gaps",()=>{
 const c=ctx();assert.equal(c.pmsvQ4Valid(),true);
 assert.equal(d.records.length,4);assert.equal(d.current_fssr_dossiers,30);
 assert.equal(d.remaining_quality_dossiers_to_link,10);
 for(const r of d.records){
  assert.ok(q.review_records.some(x=>x.catalog_id===r.catalog_id&&x.product_name===r.product_name));
  assert.ok(l.records.some(x=>x.catalog_id===r.catalog_id&&x.source_status==="FIRST_EXACT_SOURCE_PENDING"));
  assert.equal(r.numeric_ctr_limits_auto_applied,false);
  assert.equal(r.complete_regulatory_clearance,false);
 }
});
test("FSSAI quality limits are exact for quinoa chia and children supplements; animal casings are qualitative",()=>{
 const x=id=>d.records.find(y=>y.catalog_id===id);
 const req=(id,p)=>x(id).requirements.find(z=>z.parameter===p);
 assert.equal(req("06-06-1-quinoa","Moisture").value,12);
 assert.equal(req("06-06-1-quinoa","Saponin").value,0.1);
 assert.equal(req("06-06-1-chia-seeds","Moisture").value,11.5);
 assert.equal(req("06-06-1-chia-seeds","Acidity of extracted fat").value,2);
 assert.equal(req("formulated-supplements-children","Energy density on dry basis").value,4);
 assert.equal(req("formulated-supplements-children","Moisture").value,8);
 assert.equal(req("08-08-4-animal-casings","Presentation").relation,"identity");
 assert.ok(d.records.every(z=>z.official_source_url.startsWith("https://www.fssai.gov.in/")));
});
test("Four quality panels contain numeric/qualitative standards, official links, and never CTR compliance PASS",()=>{
 const c=ctx();
 for(const r of d.records){
  const html=c.pmsvQ4Html({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs});
  assert.match(html,/QUALITY STANDARD ONLY/);
  assert.match(html,/still pending/);
  assert.match(html,/fssai\.gov\.in/);
  assert.ok(!html.includes("Regulatory PASS"));
 }
});
test("Integrity tamper cases fail closed",()=>{
 for(const what of ["source","number","id","ctr","upstream"]){
  const c=ctx();
  if(what==="source")c.pmsvQ4Data.records[0].official_source_url="https://nonofficial.test/";
  if(what==="number")c.pmsvQ4Data.records[1].requirements[0].value=100;
  if(what==="id")c.pmsvQ4Data.records[2].catalog_id="wrong";
  if(what==="ctr")c.pmsvQ4Data.records[3].numeric_ctr_limits_auto_applied=true;
  if(what==="upstream")c.pmsv493Valid=()=>false;
  assert.equal(c.pmsvQ4Valid(),false,what);
  assert.match(c.pmsvQ4Html({id:d.records[0].catalog_id,name:d.records[0].product_name,fssr:d.records[0].fssr,fcs:d.records[0].fcs}),/unavailable or invalid/);
 }
});
test("Source script loads before quality coverage script and stays preview-only",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(html.indexOf("fssai-four-new-pending-quality-2026-10-13.js")>html.indexOf("fssai-current-fifteen-quality.js"));
 assert.ok(html.indexOf("fssai-four-new-pending-quality-2026-10-13.js")<html.indexOf("fssai-pending-40-quality-coverage.js"));
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
});
