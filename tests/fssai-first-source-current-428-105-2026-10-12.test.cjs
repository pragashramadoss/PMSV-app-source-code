"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,base+"data/rules/"+x),"utf8"));
const m=read("fssai-five-exact-conditional-finished-subroute-2026-10-12.json"),
 old=read("fssai-current-first-source-533-live-ledger-423-110-2026-10-12.json"),
 d=read("fssai-current-first-source-533-live-ledger-428-105-2026-10-12.json"),
 prev=read("fssai-current-110-first-exact-source-proof-worklist-2026-10-12.json"),
 q=read("fssai-current-105-first-exact-source-proof-worklist-2026-10-12.json"),
 js=fs.readFileSync(path.join(root,base+"fssai-first-source-current-428-105.js"),"utf8"),
 html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const hash=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;
for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
const source={official_sources:[{url:m.ctr_source}],source_version:m.source_version};
function ctx(){const context={console,contaminantsDb:source,pmsv2026Current423Ledger:old,
 pmsv2026Current110Queue:prev,pmsv2026Current423Valid:()=>true,
 pmsvReviewSnapshotDigest:hash,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"",
 pmsvCurrent116ProofChecklistHtml:()=>"",esc:x=>String(x)};
 vm.createContext(context);vm.runInContext(js,context);
 context.pmsv2026Current428Manifest=structuredClone(m);
 context.pmsv2026Current428Ledger=structuredClone(d);
 context.pmsv2026Current105Queue=structuredClone(q);
 return context;
}
test("428/105 current exact-source ledger complete, disjoint, and source-pinned",()=>{
 const c=ctx();assert.equal(c.pmsv2026Current428Valid(),true);
 assert.equal(d.records.length,533);assert.equal(d.partial_exact,428);assert.equal(d.first_source_pending,105);
 assert.equal(q.review_records.length,105);
 assert.equal(new Set(q.review_records.map(x=>x.catalog_id)).size,105);
 assert.equal(m.promotions.length,5);assert.equal(m.latest.full_approvals,0);
 assert.equal(d.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,428);
 assert.equal(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,105);
 assert.ok(html.includes("fssai-first-source-current-428-105.js"));
});
test("No unrestricted transfer or imaginary laboratory clearance",()=>{
 for(const x of m.promotions){const r=d.records.find(z=>z.catalog_id===x.catalog_id);
 assert.equal(r.regulatory_source_verified_delta.actual_lot_identity_verified,false);
 assert.equal(r.regulatory_source_verified_delta.numeric_finished_food_limit_auto_applied,false);
 assert.equal(r.complete_contaminant_panel,false);assert.equal(r.sample_lab_pass,false);
 assert.equal(r.product_compliance_approval,false);assert.equal(x.full_compliance_approval,false);
 assert.equal(x.qualifying_conditional_subroute_only,true);assert.ok(x.requirements.length);
 assert.ok(x.excluded.length);assert.ok(x.rows.every(z=>z.unit==="mg/kg"))}
});
test("Fail closed on manifest, ledger, queue and invented compliance changes",()=>{
 for (const key of ["manifest","ledger","queue"]) {
  const c=ctx(),obj=key==="manifest"?c.pmsv2026Current428Manifest:key==="ledger"?c.pmsv2026Current428Ledger:c.pmsv2026Current105Queue;
  obj.auditTamper=true;assert.equal(c.pmsv2026Current428Valid(),false,key);
 }
 const c=ctx();c.pmsv2026Current428Ledger.records.find(x=>x.catalog_id===m.promotions[0].catalog_id).sample_lab_pass=true;
 assert.equal(c.pmsv2026Current428Valid(),false);
});
test("Five positive official-article branches maintain precise legal distinctions",()=>{
 const names=m.promotions.map(x=>x.subtype);
 assert.ok(names.some(x=>x.includes("Canned fruit cocktail")));
 assert.ok(names.some(x=>x.includes("Canned carrots")));
 assert.ok(names.some(x=>x.includes("Canned mangoes")));
 assert.ok(names.some(x=>x.includes("Canned mushrooms")));
 assert.ok(names.some(x=>x.includes("L(+)-tartaric acid")));
 assert.ok(q.review_records.some(x=>x.catalog_id==="04-04-1-fruits-and-vegetable-chutney"),"General chutney remains pending: Mango Chutney has distinct FSSR 2.3.42");
 const tar=m.promotions.find(x=>x.catalog_id.includes("tartaric"));
 assert.deepEqual(tar.rows.map(x=>[x.metal,x.max]),[["Lead",2],["Arsenic",3]]);
 const fungi=m.promotions.find(x=>x.catalog_id.includes("sterilized-fungi"));
 assert.ok(fungi.requirements.some(x=>x.includes("an airtight sterilized pack alone is insufficient")));
});
