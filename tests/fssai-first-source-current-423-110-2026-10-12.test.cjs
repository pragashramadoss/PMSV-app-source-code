"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,".."),app="fssai-product-helper-preview-01/";
const read=n=>JSON.parse(fs.readFileSync(path.join(base,app+"data/rules/"+n),"utf8"));
const m=read("fssai-dry-fruits-and-nuts-conditional-dried-fruit-malathion-2026-10-12.json"),old=read("fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json"),d=read("fssai-current-first-source-533-live-ledger-423-110-2026-10-12.json"),
 qold=read("fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"),q=read("fssai-current-110-first-exact-source-proof-worklist-2026-10-12.json"),core=read("contaminants-v9-core.json");
const js=fs.readFileSync(path.join(base,app+"fssai-first-source-current-423-110.js"),"utf8");
const hash=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,contaminantsDb:core,pmsv2026Current422Ledger:old,pmsv2026Current111Queue:qold,
 pmsv2026Current422Valid:()=>true,pmsvReviewSnapshotDigest:hash,
 pmsvLoadPositiveSourceProof:async()=>{},pmsvCurrent116ProofChecklistHtml:()=>"<div>Historic local collector</div>",
 sourcePinned121ResearchProofHtml:()=>'<details class="card" style="margin-top:12px"><summary><b>Current official FSSAI first-source ledger</b> — OLD 422/111</summary><div>old</div></details>',
 esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv2026Current423Manifest=m;c.pmsv2026Current423Ledger=d;c.pmsv2026Current110Queue=q;
 return c;
}
test("Exactly one change: 422/111 to 423/110, 533 unchanged, zero compliance passes",()=>{
 assert.equal(d.catalogue,533);assert.equal(d.partial_exact,423);assert.equal(d.first_source_pending,110);
 assert.equal(q.review_records.length,110);assert.equal(d.full_compliance_approvals,0);
 assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,110);
 let n=0;
 for(let i=0;i<533;i++){
  assert.equal(old.records[i].catalog_id,d.records[i].catalog_id);
  if(old.records[i].catalog_id===m.product.catalog_id){
   n++;assert.equal(old.records[i].source_status,"FIRST_EXACT_SOURCE_PENDING");
   assert.equal(d.records[i].source_status,"PARTIAL_EXACT_SOURCE_MATCH");
  }else assert.deepEqual(old.records[i],d.records[i]);
 }
 assert.equal(n,1);
 assert.deepEqual([...new Set(qold.review_records.map(x=>x.catalog_id).filter(id=>
    !q.review_records.some(y=>y.catalog_id===id)))],[m.product.catalog_id]);
});
test("Dried fruit conditional branch is a genuine official source row; not nuts, mixtures or analytical PASS",()=>{
 const dry=core.chapter_2_3_dried_fruit_exact_malathion_v9;
 assert.equal(dry.commodity_article,"Dried fruits");
 assert.match(dry.pesticide_name,/malathion.*malaoxon/i);
 assert.equal(m.product.fssr,"2.3.47(5)");
 assert.equal(m.source_article,"Dried fruits");
 const rows=core.residue_mrls.pesticides.find(x=>x.name===dry.pesticide_name).rows;
 assert.equal(rows.filter(x=>x.food==="Dried fruits"&&Number(x.mrl)===8&&x.unit==="mg/kg").length,1);
 assert.equal(rows.filter(x=>x.food==="Fruits"&&Number(x.mrl)===4).length,1);
 assert.equal(m.actual_lot_dried_fruit_confirmed,false);
 assert.equal(m.whole_fruit_or_nut_category_unconditionally_matched,false);
 assert.equal(m.numeric_finished_food_limit_auto_applied,false);
 assert.equal(m.regulatory_compliance_pass,false);
 assert.equal(vm.runInContext("pmsv2026Current423Valid()",ctx()),true);
});
test("Live product shows current status and excludes historic 111-pending collectors",()=>{
 const c=ctx(),r=d.records.find(x=>x.catalog_id===m.product.catalog_id);
 const p={id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs};
 const html=vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(p)+")",c);
 assert.match(html,/423 partial first-source matches/);assert.match(html,/110 still pending/);
 assert.match(html,/8 mg\/kg/);assert.match(html,/Dried fruits/);
 assert.match(html,/Nuts, mixed fruit\/nut products/);
 assert.doesNotMatch(html,/OLD 422\/111|Historic local collector/);
 assert.equal(vm.runInContext("pmsvCurrent116ProofChecklistHtml("+JSON.stringify(p)+")",c),"");
});
test("Tampered status, source-row values, removed identity, or lab approvals fail closed",()=>{
 const c=ctx();
 c.pmsv2026Current423Manifest=structuredClone(m);c.pmsv2026Current423Manifest.source_mrl=9;
 assert.equal(vm.runInContext("pmsv2026Current423Valid()",c),false);
 c.pmsv2026Current423Manifest=m;c.pmsv2026Current423Ledger=structuredClone(d);
 c.pmsv2026Current423Ledger.records.find(x=>x.catalog_id===m.product.catalog_id).product_compliance_approval=true;
 assert.equal(vm.runInContext("pmsv2026Current423Valid()",c),false);
 c.pmsv2026Current423Ledger=d;c.contaminantsDb=structuredClone(core);
 c.contaminantsDb.residue_mrls.pesticides.find(x=>x.name===core.chapter_2_3_dried_fruit_exact_malathion_v9.pesticide_name).rows.find(x=>x.food==="Dried fruits").mrl="80";
 assert.equal(vm.runInContext("pmsv2026Current423Valid()",c),false);
});
test("Latest script loaded after archived 111 dossiers, regression CI included",()=>{
 const html=fs.readFileSync(path.join(base,app+"index.html"),"utf8");
 const archived=html.indexOf('src="./fssai-final-46-current-111-source-boundary.js');
 const latest=html.indexOf('src="./fssai-first-source-current-423-110.js');
 assert.ok(archived>0&&latest>archived);
 const workflow=fs.readFileSync(path.join(base,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.ok(workflow.includes("fssai-first-source-current-423-110-2026-10-12.test.cjs"));
});
