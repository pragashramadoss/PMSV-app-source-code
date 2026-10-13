"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const m=read("fssai-two-quinoa-frozen-conditional-named-source-2026-10-13.json"),
l=read("fssai-current-first-source-533-live-ledger-495-38-2026-10-13.json"),
q=read("fssai-current-38-first-exact-source-proof-worklist-2026-10-13.json"),
old=read("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json"),
pending=read("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json");
const code=fs.readFileSync(path.join(root,"fssai-current-first-source-495-38.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function instance(){
 const ctx={console,pmsv493Valid:()=>true,pmsvReviewSnapshotDigest:digest,
  pmsv493Ledger:old,pmsv40Queue:pending,pmsvLoadPositiveSourceProof:async()=>{},
  sourcePinned121ResearchProofHtml:()=>"Archived research",
  pmsvCurrent116ProofChecklistHtml:()=>"Archived source pending"};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 ctx.pmsv495Manifest=JSON.parse(JSON.stringify(m));
 ctx.pmsv495Ledger=JSON.parse(JSON.stringify(l));
 ctx.pmsv38Queue=JSON.parse(JSON.stringify(q));
 return ctx;
}
test("Two official category-conditional routes update the 533 ledger to 495/38 with no compliance PASS",()=>{
 const c=instance();assert.equal(c.pmsv495Valid(),true);
 assert.equal(m.route_count,2);assert.equal(l.records.length,533);
 assert.equal(l.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,495);
 assert.equal(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,38);
 assert.equal(q.review_records.length,38);
 assert.equal(m.actual_lot_lab_passes,0);assert.equal(m.full_compliance_approvals,0);
 assert.ok(l.records.every(x=>x.product_compliance_approval===false&&x.sample_lab_pass===false));
});
test("Promotions limited to quinoa and plain frozen vegetables; 531 other records unchanged",()=>{
 const wanted=new Set(["06-06-1-quinoa","04-04-2-frozen-vegetables"]),found=[];
 for(let i=0;i<533;i++)if(JSON.stringify(l.records[i])!==JSON.stringify(old.records[i]))found.push(l.records[i].catalog_id);
 assert.deepEqual(found.sort(),[...wanted].sort());
 assert.ok(q.review_records.every(x=>!wanted.has(x.catalog_id)));
 assert.deepEqual(q.promoted_catalog_ids.slice(-2),[...m.routes.map(x=>x.catalog_id)]);
});
test("Quinoa only conditional crop aflatoxins; explicit lead/cadmium exclusion retained",()=>{
 const x=m.routes.find(x=>x.catalog_id==="06-06-1-quinoa");
 assert.deepEqual(x.source_article_candidates.map(y=>[y.contaminant,y.limit,y.unit]),
 [["Total Aflatoxins",15,"µg/kg"],["Aflatoxin B1",10,"µg/kg"]]);
 assert.match(x.negative_transfer_controls.join(" "),/lead or cadmium/);
 assert.match(x.finished_subroute_identity,/unblended/);
 assert.equal(x.legal_scope_fully_adjudicated,false);
});
test("Frozen vegetables only plain portions; no raw subtype lead/cadmium pass",()=>{
 const x=m.routes.find(x=>x.catalog_id==="04-04-2-frozen-vegetables");
 assert.deepEqual(x.source_article_candidates.map(y=>[y.contaminant,y.limit]),
 [["Copper",30],["Arsenic",1.1],["Chromium",1],["Nickel",1],["Antimony",1]]);
 assert.match(x.negative_transfer_controls.join(" "),/lead or cadmium/);
 assert.match(x.finished_subroute_identity,/plain/);
 assert.match(x.finished_subroute_identity,/milk.solids/);
});
test("Validation fails closed if legal article, count, identity, lab PASS or pending list altered",()=>{
 for(const f of [
 c=>c.pmsv495Manifest.routes[0].source_article_candidates[0].limit=20,
 c=>c.pmsv495Manifest.routes[1].source_article_candidates[0].article="All processed foods",
 c=>c.pmsv495Ledger.records.find(x=>x.catalog_id==="06-06-1-quinoa").sample_lab_pass=true,
 c=>c.pmsv38Queue.review_records.pop(),
 c=>c.pmsv495Manifest.actual_lot_lab_passes=1,
 c=>c.pmsv495Ledger.records[0].product_name="Tampered"
 ]){const c=instance();f(c);assert.equal(c.pmsv495Valid(),false);}
});
test("Latest conditional route renders and obsolete archived pending panel is hidden behind history",()=>{
 const c=instance(),x=m.routes[0],p={id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs};
 assert.match(c.pmsv495Html(p),/495 partial \/ 38 pending/);
 assert.match(c.pmsv495Html(p),/NOT assigned/);
 assert.match(c.sourcePinned121ResearchProofHtml(p),/Archived 493\/40 pending-source research/);
 assert.equal(c.pmsvCurrent116ProofChecklistHtml(p),"");
 assert.equal(c.pmsvCurrent116ProofChecklistHtml({id:"04-04-1-fruit-cheese"}),"Archived source pending");
});
test("Latest route script loads after old reviews so it can supersede archived counts",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(h.indexOf("fssai-current40-evidence-workbench-2026-10-13.js")<
  h.indexOf("fssai-current-first-source-495-38.js"));
 assert.ok(h.indexOf("fssai-current-first-source-495-38.js")<
  h.indexOf("fssai-nutrition-v476.js"));
});
