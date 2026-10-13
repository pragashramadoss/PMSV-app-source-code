"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01"),
 rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8")),
 d=rd("fssai-40-current-named-ctr-crossform-comparisons-2026-10-13.json"),
 q=rd("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json"),
 l=rd("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json"),
 js=fs.readFileSync(path.join(root,"fssai-40-current-named-ctr-comparisons-2026-10-13.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const x={console,pmsv493Valid:()=>true,pmsv40LegalGatesValid:()=>true,pmsvReviewSnapshotDigest:digest,pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"Original named-article queue",esc:String};
 vm.createContext(x);vm.runInContext(js,x);x.pmsv40CtrComparisons=JSON.parse(JSON.stringify(d));return x;
}
const p=r=>({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs});
test("Exactly all 40 current pending products have identity-specific proof; 533/493/40 remain unchanged",()=>{
 const x=ctx();assert.equal(x.pmsv40CtrComparisonsValid(),true);
 assert.equal(d.records.length,40);assert.equal(d.source_rows.length,28);
 assert.equal(d.records.reduce((a,z)=>a+z.contrasted_ctr_rows.length,0),50);
 assert.equal(d.records.filter(z=>z.contrasted_ctr_rows.length).length,36);
 assert.equal(d.records.filter(z=>!z.contrasted_ctr_rows.length).length,4);
 assert.equal(new Set(d.records.map(z=>z.catalog_id)).size,40);
 assert.equal(l.records.length,533);assert.equal(l.partial_exact,493);assert.equal(l.first_source_pending,40);
 for(const z of d.records){
  assert.equal(z.named_finished_article_source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(z.laboratory_pass,false);assert.equal(z.regulatory_approval,false);
  assert.ok(q.review_records.some(v=>v.catalog_id===z.catalog_id&&v.product_name===z.product_name));
 }
});
test("Every contrasted source has official regulator, exact article and no inferred finished-food limit",()=>{
 const row=new Map(d.source_rows.map(x=>[x.key,x]));
 for(const x of d.records)for(const c of x.contrasted_ctr_rows){
  assert.ok(row.has(c.source_row_key),c.source_row_key);
  assert.equal(c.comparison_only,true);
  assert.equal(c.numeric_limit_auto_assigned,false);
  const t=row.get(c.source_row_key);
  assert.equal(t.applies_to_current_pending_catalogue_without_finished_article_proof,false);
  assert.ok(t.official_ctr_url.startsWith("https://fssai.gov.in/"));
 }
});
test("Cocoa, coffee, refined sugar, processed egg, milk and frozen vegetables do not inherit unlike legal article limits",()=>{
 const get=id=>d.records.find(x=>x.catalog_id===id);
 const cases=[
  ["04-04-2-cocoa-beans","lead-cocoa-powder"],
  ["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake","copper-cocoa-powder"],
  ["coffee-chicory-mixture","copper-coffee-chicory"],
  ["11-11-1-dried-glucose-syrup","lead-high-ash-starch"],
  ["10-10-2-egg-powder","vet-amprolium-egg"],
  ["04-04-1-coconut-milk-powder","lead-milks"],
  ["04-04-2-frozen-vegetables","tin-canned-other"],
  ["06-06-1-quinoa","lead-cereal-excluding-quinoa"],
  ["06-06-1-chia-seeds","lead-pulses"],
  ["11-11-1-cube-sugar","lead-refined-white-sugar"]
 ];
 for(const [id,key]of cases){const v=get(id);assert.ok(v,id);assert.ok(v.contrasted_ctr_rows.some(x=>x.source_row_key===key),key);assert.ok(v.negative_finished_article_rule.length>30);}
});
test("Universal methyl mercury named 'All foods' is correctly distinct from still missing product-specific source",()=>{
 const u=d.universal_regulation_reference;
 assert.equal(u.contaminant,"Methyl Mercury (calculated as the element)");
 assert.equal(u.article,"All foods");assert.equal(u.limit,0.25);assert.equal(u.unit,"mg/kg");assert.equal(u.pdf_page_index,11);
 assert.equal(d.first_named_pending,40);assert.equal(d.auto_numeric_limits,false);
});
test("Preview HTML has comparisons only, no automatic compliance PASS for all forty",()=>{
 const x=ctx();
 for(const z of d.records){
  const h=x.sourcePinned121ResearchProofHtml(p(z));
  assert.match(h,/Official CTR IX cross-form rows/);
  assert.match(h,/COMPARISON ONLY — NO PRODUCT LIMIT ASSIGNED/);
  assert.match(h,/Original named-article queue/);
  assert.match(h,/Methyl Mercury/);assert.match(h,/0.25/);
  if(z.contrasted_ctr_rows.length)assert.match(h,/NOT APPLIED/);
  else assert.match(h,/not an exemption/);
 }
});
test("Fifteen direct FSSR product definitions are sourced, separated from contaminant-article matching and shown without an automatic PASS",()=>{
 const ids=["coffee-chicory-mixture","formulated-supplements-children","04-04-1-frozen-fruits-fruit-products","04-04-1-fruit-cheese","04-04-2-frozen-vegetables","04-04-2-cocoa-beans","06-06-1-quinoa","06-06-1-chia-seeds","08-08-4-animal-casings","10-10-2-egg-powder","10-10-3-pickled-eggs","11-11-1-dried-glucose-syrup","11-11-1-cube-sugar","11-11-1-misri","100-100-royal-jelly"];
 const x=ctx();assert.equal(x.pmsv40CtrComparisonsValid(),true);
 assert.equal(d.records.filter(y=>y.finished_standard_evidence).length,15);
 for(const id of ids){
  const z=d.records.find(y=>y.catalog_id===id),s=z.finished_standard_evidence;
  assert.ok(s,id);assert.equal(s.evidence_type,"EXACT_FSSR_FINISHED_STANDARD_NOT_CTR_MATCH");
  assert.equal(s.first_named_ctr_promoted,false);assert.equal(s.automatic_contaminant_limit,false);
  assert.equal(s.independently_verified_lot,false);assert.match(s.official_fssr_url,/^https:\/\/www\.fssai\.gov\.in\/upload\//);
  const h=x.sourcePinned121ResearchProofHtml(p(z));
  assert.match(h,/Direct FSSR finished-product evidence/);
  assert.match(h,/Legal contaminant matching still required/);
  assert.match(h,/COMPARISON ONLY — NO PRODUCT LIMIT ASSIGNED/);
 }
 const cube=d.records.find(z=>z.catalog_id==="11-11-1-cube-sugar").finished_standard_evidence;
 assert.match(cube.ctr_transfer_gate,/total ash.*NOT proof.*sulphated-ash/i);
 const frozen=d.records.find(z=>z.catalog_id==="04-04-2-frozen-vegetables").finished_standard_evidence;
 assert.ok(frozen.documented_requirements.some(x=>/Peroxidase.*negative/.test(x)));
 const bad=ctx();bad.pmsv40CtrComparisons.records.find(z=>z.catalog_id==="11-11-1-cube-sugar").finished_standard_evidence.automatic_contaminant_limit=true;
 assert.equal(bad.pmsv40CtrComparisonsValid(),false);
});
test("Fail-closed on source limit, universal value, fake product, mislabelled comparison, missing upstream, wrong queue",()=>{
 for(const k of ["limit","universal","identity","applied","upstream","queue","approval"]){
  const c=ctx();
  if(k==="limit")c.pmsv40CtrComparisons.source_rows[0].limit=999;
  if(k==="universal")c.pmsv40CtrComparisons.universal_regulation_reference.limit=999;
  if(k==="identity")c.pmsv40CtrComparisons.records[0].product_name="fake";
  if(k==="applied")c.pmsv40CtrComparisons.records[0].contrasted_ctr_rows[0].numeric_limit_auto_assigned=true;
  if(k==="upstream")c.pmsv493Valid=()=>false;
  if(k==="queue")c.pmsv40Queue={...q,review_records:q.review_records.slice(1)};
  if(k==="approval")c.pmsv40CtrComparisons.records[1].regulatory_approval=true;
  assert.equal(c.pmsv40CtrComparisonsValid(),false,k);
 }
});
test("Script is loaded after ten official dossiers but before 31/9 reconciliation panel",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8"),
 a=h.indexOf("fssai-ten-pending-source-decisions-2026-10-13.js"),
 b=h.indexOf("fssai-40-current-named-ctr-comparisons-2026-10-13.js"),
 c=h.indexOf("fssai-pending-40-quality-coverage.js");
 assert.ok(a>=0&&b>a&&c>b);
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
});
