"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),pre="fssai-product-helper-preview-01/";
const j=n=>JSON.parse(fs.readFileSync(path.join(root,pre+"data/rules/"+n),"utf8"));
const old=j("fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const current=j("fssai-current-112-first-exact-source-proof-worklist-2026-10-12.json");
const ledger=j("fssai-current-first-source-533-live-ledger-421-112-2026-10-12.json");
const historical=j("fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const previous=j("fssai-current-first-source-533-live-ledger-420-113-2026-10-12.json");
const first=j("fssai-three-ayurveda-mandated-cereal-composite-aflatoxin-first-source-2026-10-12.json");
const golaka=j("fssai-golaka-dugdha-affirmative-concentrated-milk-lead-first-source-2026-10-12.json");
const contaminant=j("contaminants-v9-core.json");
const cat=j("../standard-search-index-v1.json").products;
function context(){
 const c={console,esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(c);
 c.sourcePinned121ResearchProofHtml=()=>"";
 for(const filename of [
 "fssai-source-proof-panels.js","fssai-evidence-capture-116.js",
 "fssai-first-source-current-420-113.js",
 "fssai-first-source-current-421-112.js","fssai-current-112-worklist-integrity.js"]){
  vm.runInContext(fs.readFileSync(path.join(root,pre+filename),"utf8"),c);
 }
 c.pmsvCurrent533SourceLedger=historical;
 c.pmsvCurrent116ProofWorklist=old;
 c.contaminantsDb=contaminant;
 c.pmsv2026CurrentFirstSourceLedger=previous;
 c.pmsv2026FirstSourcePromotionManifest=first;
 c.pmsv2026GolakaManifest=golaka;
 c.pmsv2026Current421Ledger=ledger;
 c.pmsv2026Current112Worklist=current;
 return c;
}
test("533 current products reconcile to 421 partial and exactly 112 outstanding packets",()=>{
 assert.equal(ledger.records.length,533);
 assert.equal(current.catalogue,533);
 assert.equal(current.partial_exact,421);
 assert.equal(current.first_source_pending,112);
 assert.equal(current.review_records.length,112);
 assert.equal(new Set(current.review_records.map(x=>x.catalog_id)).size,112);
 const p=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(p.size,112);
 for(const r of current.review_records){assert.ok(p.has(r.catalog_id));assert.ok(r.proof_branches.length);
  assert.equal(r.first_exact_source_verified,false);
  assert.equal(r.numeric_finished_food_limit_auto_applied,false);
  assert.equal(r.finished_food_laboratory_pass,false);
  assert.equal(r.full_regulatory_compliance_approval,false);
 }
});
test("archive 116 removed precisely the four proven first-exact source promotions",()=>{
 const oldIds=new Set(old.records.map(x=>x.catalog_id));
 const newIds=new Set(current.review_records.map(x=>x.catalog_id));
 const removed=[...oldIds].filter(x=>!newIds.has(x));
 const expected=[...first.records.map(x=>x.catalog_id),golaka.product.catalog_id];
 assert.equal(removed.length,4);assert.deepEqual(new Set(removed),new Set(expected));
 assert.deepEqual(new Set(current.promoted_catalog_ids),new Set(expected));
 for(const record of current.review_records){
  assert.deepEqual(record,old.records.find(x=>x.catalog_id===record.catalog_id));
 }
});
test("actual current 112 worklist authenticates and local evidence authorization rejects all four promotions",()=>{
 const c=context();assert.equal(c.pmsv2026Current112Valid(),true);
 for(const r of current.review_records.slice(0,3)){
  const p=cat.find(x=>x.id===r.catalog_id);assert.ok(p);
  assert.equal(c.pmsv116Valid(p),true);
 }
 for(const id of current.promoted_catalog_ids){
  const p=cat.find(x=>x.id===id);assert.ok(p);
  assert.equal(c.pmsv116Valid(p),false);
  assert.equal(c.pmsv116GetAuthorized(id),null);
 }
});
test("tampered worklist, source URL or released PASS makes current proof collection fail closed",()=>{
 const c=context();assert.equal(c.pmsv2026Current112Valid(),true);
 for(const kind of ["add","delete","pass","changed_source","wrong_id"]){
  const p=JSON.parse(JSON.stringify(current));
  if(kind==="add")p.review_records.push(p.review_records[0]);
  if(kind==="delete")p.review_records.pop();
  if(kind==="pass")p.review_records[0].finished_food_laboratory_pass=true;
  if(kind==="changed_source")p.review_records[0].official_contaminant_source="https://example.org/forged.pdf";
  if(kind==="wrong_id")p.promoted_catalog_ids[0]=p.review_records[0].catalog_id;
  c.pmsv2026Current112Worklist=p;
  assert.equal(c.pmsv2026Current112Valid(),false,kind);
  assert.equal(c.pmsv116Valid(cat.find(x=>x.id===current.review_records[0].catalog_id)),false,kind);
 }
});
test("current worklist gates load after the 421/112 identity layer; CI always checks it",()=>{
 const h=fs.readFileSync(path.join(root,pre+"index.html"),"utf8");
 const a=h.indexOf("fssai-first-source-current-421-112.js"),b=h.indexOf("fssai-current-112-worklist-integrity.js");
 assert.ok(a>=0&&b>a);
 const y=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(y,/node --test tests\/fssai-current-112-worklist-2026-10-12\.test\.cjs/);
});