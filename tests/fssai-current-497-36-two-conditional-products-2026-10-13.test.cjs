"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const m=read("fssai-two-fruit-cheese-colouring-foods-conditional-source-2026-10-13.json"),
 l=read("fssai-current-first-source-533-live-ledger-497-36-2026-10-13.json"),
 q=read("fssai-current-36-first-exact-source-proof-worklist-2026-10-13.json"),
 old=read("fssai-current-first-source-533-live-ledger-495-38-2026-10-13.json"),
 p=read("fssai-current-38-first-exact-source-proof-worklist-2026-10-13.json");
const js=fs.readFileSync(path.join(root,"fssai-current-first-source-497-36.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsv495Valid:()=>true,pmsvReviewSnapshotDigest:digest,pmsv495Ledger:old,pmsv38Queue:p,
  pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"Previous 495/38 research",
  pmsvCurrent116ProofChecklistHtml:()=>"Previous pending proof"};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv497Manifest=JSON.parse(JSON.stringify(m));
 c.pmsv497Ledger=JSON.parse(JSON.stringify(l));
 c.pmsv36Queue=JSON.parse(JSON.stringify(q));return c;
}
test("Exactly two conditional routes update 533-row ledger to 497/36; no actual regulatory PASS",()=>{
 const c=ctx();assert.equal(c.pmsv497Valid(),true);
 assert.equal(m.promoted_source_routes,2);assert.equal(l.records.length,533);
 assert.equal(l.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,497);
 assert.equal(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,36);
 assert.equal(q.review_records.length,36);assert.equal(q.promoted_catalog_ids.length,80);
 assert.equal(m.laboratory_pass_count,0);assert.equal(m.full_compliance_approvals,0);
 assert.ok(l.records.every(x=>x.product_compliance_approval===false&&x.sample_lab_pass===false));
});
test("Only Fruit Cheese and Colouring foods can change, all other 531 rows byte-identical",()=>{
 let touched=[];
 for(let i=0;i<533;i++)if(JSON.stringify(l.records[i])!==JSON.stringify(old.records[i]))touched.push(l.records[i].catalog_id);
 assert.deepEqual(touched.sort(),["04-04-1-fruit-cheese","99-99-1-colouring-foods"]);
 assert.ok(q.review_records.every(x=>!touched.includes(x.catalog_id)));
 assert.deepEqual(q.promoted_catalog_ids.slice(-2),["04-04-1-fruit-cheese","99-99-1-colouring-foods"]);
});
test("Fruit cheese metal named article limits require final cooked pulp classification",()=>{
 const x=m.routes.find(x=>x.catalog_id==="04-04-1-fruit-cheese");
 assert.deepEqual(x.article_values.map(y=>[y.contaminant,y.limit,y.unit]),
 [["Copper",5,"mg/kg"],["Arsenic",0.2,"mg/kg"],["Tin",250,"mg/kg"]]);
 assert.match(x.forbidden_transfers.join(" "),/Jam, Jellies and Marmalade/);
 assert.match(x.positive_product_evidence.join(" "),/legal.*cooked fruit cheese/);
 assert.equal(x.applicability_to_actual_finished_product_verified,false);
});
test("Colouring foods arsenic is 5 on dry colouring matter and excludes synthetic additives",()=>{
 const x=m.routes.find(x=>x.catalog_id==="99-99-1-colouring-foods");
 assert.deepEqual(x.article_values.map(y=>[y.contaminant,y.limit]),
 [["Arsenic",5]]);
 assert.match(x.article_values[0].analytical_basis,/NOT dry final powder/);
 assert.match(x.forbidden_transfers.join(" "),/isolated dye/);
 assert.match(x.positive_product_evidence.join(" "),/without selective pigment extraction/);
 assert.equal(x.numeric_limit_applied,false);
});
test("Corruption of official values, matched identities, pending queue, lab status or product approval fails closed",()=>{
 for(const mut of [
 c=>c.pmsv497Manifest.routes[0].article_values[0].limit=15,
 c=>c.pmsv497Manifest.routes[1].article_values[0].article="Anything",
 c=>c.pmsv497Ledger.records[0].product_compliance_approval=true,
 c=>c.pmsv497Ledger.records.find(x=>x.catalog_id==="04-04-1-fruit-cheese").regulatory_source_verified_delta.legal_scope_fully_adjudicated=true,
 c=>c.pmsv36Queue.review_records.pop(),
 c=>c.pmsv497Manifest.formal_legal_applicability_adjudicated=true
 ]){const c=ctx();mut(c);assert.equal(c.pmsv497Valid(),false);}
});
test("Effective source display contains legal caveats; old pending panels archived",()=>{
 const c=ctx(),x=m.routes[0],p={id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs};
 assert.match(c.pmsv497Html(p),/497 partial \/ 36 pending/);
 assert.match(c.pmsv497Html(p),/not assigned/);
 assert.match(c.sourcePinned121ResearchProofHtml(p),/Archived 493\/40 and 495\/38 source reviews/);
 assert.equal(c.pmsvCurrent116ProofChecklistHtml(p),"");
 assert.equal(c.pmsvCurrent116ProofChecklistHtml({id:"06-06-2-carob-powder"}),"Previous pending proof");
});
test("Effective route JS loads after 495 module before nutrition",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(html.indexOf("fssai-current-first-source-495-38.js")<html.indexOf("fssai-current-first-source-497-36.js"));
 assert.ok(html.indexOf("fssai-current-first-source-497-36.js")<html.indexOf("fssai-nutrition-v476.js"));
});
