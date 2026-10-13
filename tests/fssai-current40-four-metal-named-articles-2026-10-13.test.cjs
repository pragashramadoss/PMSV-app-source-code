"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const get=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=get("fssai-current40-four-metal-named-articles-2026-10-13.json");
const q=get("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json");
const l=get("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json");
const js=fs.readFileSync(path.join(root,"fssai-current40-four-metal-named-articles-2026-10-13.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,pmsv493Valid:()=>true,pmsv40MelamineUniversalValid:()=>true,pmsvReviewSnapshotDigest:digest,
 pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"Legacy source preserved"};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsv40FourMetalProofData=JSON.parse(JSON.stringify(d));return c;
}
test("40 exact identities × 22 official named rows, with 160 individual metal decisions",()=>{
 const c=ctx();assert.equal(c.pmsv40FourMetalProofValid(),true);
 assert.equal(d.current_catalogue,533);assert.equal(d.current_partial_routes,493);
 assert.equal(d.current_first_named_article_pending,40);
 assert.equal(d.row_by_product_comparisons,880);assert.equal(d.metal_by_product_checks,160);
 assert.equal(d.official_named_rows,22);assert.equal(d.records.length,40);
 assert.equal(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,40);
 assert.equal(d.numeric_limits_automatically_assigned,0);
 assert.equal(d.source_routes_promoted,0);assert.equal(d.complete_compliance_approvals,0);
});
test("Exact CTR row distinctions and numeric units do not transfer to unrelated marketed foods",()=>{
 const m=new Map(d.source_rows.map(x=>[x.row_id,x]));
 assert.equal(m.get("chromium-refined-sugar").threshold,0.02);
 assert.equal(m.get("nickel-sorbitol").threshold,2);
 assert.equal(m.get("selenium-sulphur-dioxide").threshold,20);
 assert.equal(m.get("antimony-titanium-dioxide").threshold,2);
 assert.equal(m.get("chromium-packaged-water").unit,"mg/L");
 assert.equal(m.get("antimony-mineral-water").threshold,0.005);
 const water=d.records.find(x=>x.catalog_id==="purified-vending-water");
 assert.equal(water.conditional_identity_hypotheses.length,0);
 assert.match(water.critical_nontransfer,/cannot inherit/);
 const polyol=d.records.find(x=>x.catalog_id.startsWith("11-11-6-polyols-"));
 assert.equal(polyol.conditional_identity_hypotheses.length,0);
 assert.match(polyol.critical_nontransfer,/sorbitol/);
 const add=d.records.find(x=>x.catalog_id.startsWith("99-99-1-additives-permitted"));
 assert.equal(add.conditional_identity_hypotheses.length,6);
 assert.ok(add.conditional_identity_hypotheses.every(x=>!x.confirmed_article_match));
 const cube=d.records.find(x=>x.product_name==="Cube Sugar");
 assert.deepEqual(cube.conditional_identity_hypotheses.map(x=>x.row_id),["chromium-refined-sugar"]);
 const frozen=d.records.find(x=>x.product_name==="Frozen Vegetables");
 assert.equal(frozen.conditional_identity_hypotheses.length,3);
 assert.ok(d.records.every(x=>x.individual_row_comparisons.every(y=>y.auto_limit_applied===false)));
});
test("Every corruption of exact threshold, identity, article scope, status or comparison count fails closed",()=>{
 const mutation=[
 c=>c.pmsv40FourMetalProofData.source_rows.find(x=>x.row_id==="chromium-refined-sugar").threshold=0.2,
 c=>c.pmsv40FourMetalProofData.source_rows.find(x=>x.row_id==="nickel-sorbitol").exact_named_article="Polyols",
 c=>c.pmsv40FourMetalProofData.records[0].regulatory_approval=true,
 c=>c.pmsv40FourMetalProofData.records[1].source_status="PARTIAL",
 c=>c.pmsv40FourMetalProofData.records[2].individual_row_comparisons.splice(10,1),
 c=>c.pmsv40FourMetalProofData.source_pdf="https://example.com/",
 c=>c.pmsv40FourMetalProofData.records[39].catalog_id="wrong-id"
 ];
 for(const m of mutation){const c=ctx();m(c);assert.equal(c.pmsv40FourMetalProofValid(),false);}
});
test("Preview HTML includes module after prior batch, before latest quality panel",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const a=h.indexOf("fssai-current40-melamine-methylmercury-2026-10-13.js");
 const b=h.indexOf("fssai-current40-four-metal-named-articles-2026-10-13.js");
 const c=h.indexOf("fssai-pending-40-quality-coverage.js");
 assert.ok(a>0&&b>a&&c>b);
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
});
