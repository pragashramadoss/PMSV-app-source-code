"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=n=>JSON.parse(fs.readFileSync(path.join(root,base+"data/rules/"+n),"utf8"));
const d=read("fssai-52-current-first-source-finished-product-dossiers-2026-10-12.json");
const q=read("fssai-current-89-first-exact-source-proof-worklist-2026-10-12.json");
const audit=read("fssai-89-detailed-finished-identity-audit-2026-10-12.json");
const ledger=read("fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json");
const products=JSON.parse(fs.readFileSync(path.join(root,base+"data/standard-search-index-v1.json"),"utf8")).products;
const source=fs.readFileSync(path.join(root,base+"fssai-52-current-first-source-evidence-panels.js"),"utf8");
const digest=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
for(let i=0;i<s.length;i++){const v=s.charCodeAt(i);a=Math.imul(a^v,16777619);b=Math.imul(b^v,2246822519);}
return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function context(){
 const c={console,pmsv444Valid:()=>true,pmsvReviewSnapshotDigest:digest,
   pmsv444Ledger:ledger,pmsv89Queue:q,pmsv89Dossier:audit,
   pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
   esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")};
 vm.createContext(c);vm.runInContext(source,c);
 c.pmsv52Dossiers=structuredClone(d);return c;
}
test("All 52 new product-qualifier dossiers and 37 audited records partition exactly the live 89",()=>{
 assert.equal(products.length,533);assert.equal(q.review_records.length,89);
 assert.equal(audit.audited_records.length,37);assert.equal(d.records.length,52);
 assert.equal(context().pmsv52Valid(),true);
 const pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 const ids=new Set([...audit.audited_records,...d.records].map(x=>x.catalog_id));
 assert.equal(ids.size,89);assert.deepEqual(ids,pending);
});
test("All 52 are individually grounded in source-specific evidence blockers, never a finished-food PASS",()=>{
 const work=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 for(const r of d.records){
  const qrow=work.get(r.catalog_id);
  assert.ok(qrow);assert.equal(r.forbidden_transfer,qrow.forbidden_transfer);
  assert.deepEqual(r.reference_articles_comparison_only,qrow.referenced_articles_review_only);
  assert.deepEqual(r.positive_proof_to_obtain,qrow.proof_branches.flatMap(x=>x.required_evidence));
  assert.match(r.official_product_source,/^https:\/\/(?:www\.|foscos\.)?fssai\.gov\.in\//);
  assert.equal(r.status,"FIRST_EXACT_SOURCE_PENDING");
  for(const flag of ["first_exact_source_verified","actual_finished_matrix_verified","operative_amendments_rechecked","automatic_numeric_limit_applied","laboratory_pass","full_regulatory_compliance"])assert.equal(r[flag],false);
 }
});
test("Authentic runtime UI displays only 52 missing research dossiers; all 444 partial matches stay clear",()=>{
 const c=context(),p=products.find(x=>x.id===d.records[0].catalog_id);
 const shown=c.pmsv52Html(p);
 assert.match(shown,/Product-specific FSSAI first-source gap/);
 assert.match(shown,/EXACT FINISHED-ARTICLE SOURCE NOT YET VERIFIED/);
 assert.match(shown,/Official CTR Version IX/);
 assert.doesNotMatch(shown,/COMPLIANCE APPROVED|LOT CONFORMS/);
 for(const r of audit.audited_records)assert.equal(c.pmsv52Html(products.find(x=>x.id===r.catalog_id)),"");
 const one=products.find(x=>!q.review_records.some(r=>r.catalog_id===x.id));
 assert.ok(one);assert.equal(c.pmsv52Html(one),"");
});
test("Mutated source, identity, source URL, invented PASS and source ledger fail closed",()=>{
 const ids=["product_name","official_product_source","source_qualifier_decision","laboratory_pass","status","positive_proof_to_obtain"];
 for(const kind of ids){
  const c=context(),v=structuredClone(d);const first=v.records[0];
  if(kind==="product_name")first.product_name="wrong product";
  if(kind==="official_product_source")first.official_product_source="https://unofficial.example.com/misleading";
  if(kind==="source_qualifier_decision")first.source_qualifier_decision="unsupported";
  if(kind==="laboratory_pass")first.laboratory_pass=true;
  if(kind==="status")first.status="PARTIAL_EXACT_SOURCE_MATCH";
  if(kind==="positive_proof_to_obtain")first.positive_proof_to_obtain.push("unapproved");
  c.pmsv52Dossiers=v;
  assert.equal(c.pmsv52Valid(),false,kind);
  assert.match(c.pmsv52Html(products.find(x=>x.id===first.catalog_id)),/withheld/,kind);
 }
 const c=context();c.pmsv444Valid=()=>false;
 assert.equal(c.pmsv52Valid(),false);
});
test("GitHub site and full CI load the exact authenticated 52-identity source dossier",()=>{
 const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 assert.ok(html.indexOf("fssai-first-source-current-444-89.js")>=0);
 assert.ok(html.indexOf("fssai-52-current-first-source-evidence-panels.js")>html.indexOf("fssai-first-source-current-444-89.js"));
 const flow=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(flow,/fssai-52-current-first-source-evidence-panels-2026-10-12\.test\.cjs/);
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
});
