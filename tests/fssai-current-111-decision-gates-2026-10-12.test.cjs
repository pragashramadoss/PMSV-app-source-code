"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),app="fssai-product-helper-preview-01/";
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,app+"data/rules/"+n),"utf8"));
const matrix=rd("fssai-current-111-positive-proof-gates-2026-10-12.json");
const queue=rd("fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json");
const ledger=rd("fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json");
const cross=rd("fssai-live-111-official-article-crosswalk-2026-10-12.json");
const core=rd("contaminants-v9-core.json");
const script=fs.readFileSync(path.join(root,app+"fssai-current-111-decision-gates.js"),"utf8");
function ctx(){
 const c={console,contaminantsDb:core,
  pmsv2026Current111Queue:queue,pmsv2026Current422Ledger:ledger,
  pmsvLive111ReferenceDb:cross,pmsv2026Decision111Db:matrix,
  pmsv2026Current422Valid:()=>true,pmsvLive111ReferenceValid:()=>true,
  pmsv116LocalEvidenceHtml:()=>'<div>Current saved local proof notes</div>',
  pmsvLive111ReferencesHtml:()=>'<div>Current named CTR references, not applied</div>',
  pmsv2026Current422Html:()=>'<div>Current partial source match</div>',
  sourcePinned121ResearchProofHtml:()=>'<div>OBSOLETE 116/121 research cards</div>',
  pmsvCurrent116ProofChecklistHtml:()=>'<div>OBSOLETE 116 checklist</div>',
  pmsvLoadPositiveSourceProof:async()=>{},
  esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
 };
 vm.createContext(c);
 const proof=fs.readFileSync(path.join(root,app+"fssai-source-proof-panels.js"),"utf8");
 // Batch111 compatibility: extract the hash dependency together with digest.
 // The browser loads both from the source module; the isolated VM must too.
 const a=proof.indexOf("function pmsvReviewSnapshotHashSerialized"),b=proof.indexOf("function pmsvReviewSnapshotIntact",a);
 assert.ok(a>=0&&b>a);
 vm.runInContext(proof.slice(a,b),c);
 vm.runInContext(script,c);
 c.pmsv2026Decision111Db=matrix;
 return c;
}
const p=id=>{const x=ledger.records.find(x=>x.catalog_id===id);return {id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs}};
test("Full official 111-product queue, active source identity and zero PASS conserved",()=>{
 assert.equal(matrix.catalogue,533);assert.equal(matrix.partial_exact,422);
 assert.equal(matrix.pending,111);assert.equal(matrix.records.length,111);
 assert.equal(matrix.affirmatively_matched_new_products,0);
 assert.equal(queue.review_records.length,111);
 assert.deepEqual(new Set(matrix.records.map(x=>x.catalog_id)),
                  new Set(queue.review_records.map(x=>x.catalog_id)));
 const c=ctx();assert.equal(vm.runInContext("pmsv2026Decision111Valid()",c),true);
 for(const r of matrix.records){
  assert.equal(r.exact_first_source_verified,false);
  assert.equal(r.finished_food_numeric_limit_auto_applied,false);
  assert.equal(r.full_compliance_pass,false);assert.equal(r.lab_pass,false);
  assert.equal(r.proof_branches.length,r.branch_count);
  assert.ok(/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(r.official_product_source));
 }
});
test("Current 111 detail and local checklist suppress historical pending cards while preserving notes",()=>{
 const c=ctx();
 for(const r of matrix.records){
  const x=p(r.catalog_id);
  const html=vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(x)+")",c);
  assert.match(html,/Current first-source decision — 111 remaining/);
  assert.match(html,/FIRST EXACT FINISHED-ARTICLE SOURCE PENDING/);
  assert.match(html,/NOT YET PROVEN/);
  assert.doesNotMatch(html,/OBSOLETE 116\/121 research cards/);
  const local=vm.runInContext("pmsvCurrent116ProofChecklistHtml("+JSON.stringify(x)+")",c);
  assert.match(local,/Current saved local proof notes/);
  assert.doesNotMatch(local,/OBSOLETE 116 checklist/);
 }
 for(const id of queue.promoted_catalog_ids){
  const x=p(id);
  const html=vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(x)+")",c);
  assert.match(html,/Current partial source match/);
  assert.doesNotMatch(html,/OBSOLETE 116\/121/);
  assert.equal(vm.runInContext("pmsvCurrent116ProofChecklistHtml("+JSON.stringify(x)+")",c),"");
 }
});
test("Review correct sugar chemistry, egg shell-free basis and alternative cereal routes",()=>{
 const get=id=>matrix.records.find(x=>x.catalog_id===id);
 assert.match(get("11-11-1-cube-sugar").positive_official_definition_or_limitation,/total ash.*sulphated ash/i);
 assert.match(get("11-11-1-dried-glucose-syrup").positive_official_definition_or_limitation,/exceeding 1.0%/i);
 assert.match(get("11-11-1-icing-sugar").positive_official_definition_or_limitation,/OR plantation white sugar/);
 assert.match(get("10-10-2-egg-powder").positive_official_definition_or_limitation,/shell-free raw Egg MRL/);
 assert.match(get("10-10-3-pickled-eggs").positive_official_definition_or_limitation,/hen or quail/);
 assert.match(get("06-06-2-custard-powder").positive_official_definition_or_limitation,/maize OR sago\/tapioca/);
 assert.match(get("06-06-7-papad").positive_official_definition_or_limitation,/fruits, vegetables or spices/);
 assert.match(get("06-06-4-macaroni-products-instant-noodle").positive_official_definition_or_limitation,/flour from tubers/);
 assert.equal(matrix.records.filter(x=>x.identity_gate==="DAIRY_ANALOGUE_CORRESPONDING_CATEGORY").length,8);
});
test("Any numeric status, source, product identity or local proof statement drift fails closed",()=>{
 const c=ctx();
 for(const kind of ["limit","source","identity","pass","lost","proof"]){
  c.pmsv2026Decision111Db=structuredClone(matrix);
  const m=c.pmsv2026Decision111Db;
  if(kind==="limit")m.pending=110;
  if(kind==="source")m.records[0].official_ctr_source="https://fake.example/";
  if(kind==="identity")m.records[0].product_name="wrong name";
  if(kind==="pass")m.records[0].lab_pass=true;
  if(kind==="lost")m.records.pop();
  if(kind==="proof")m.records[0].missing_positive_evidence="Accepted";
  assert.equal(vm.runInContext("pmsv2026Decision111Valid()",c),false,kind);
 }
});
test("New 111 decision engine is loaded after 111 crosswalk and verified in CI",()=>{
 const html=fs.readFileSync(path.join(root,app+"index.html"),"utf8");
 assert.ok(html.indexOf('fssai-current-111-decision-gates.js')>
   html.indexOf('fssai-live-111-official-article-crosswalk.js'));
 const ci=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(ci,/fssai-current-111-decision-gates-2026-10-12\.test\.cjs/);
});
