"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),pre="fssai-product-helper-preview-01/";
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,pre+"data/rules/"+n),"utf8"));
const a=rd("fssai-2026-may-gazette-533-effective-date-controls-2026-10-12.json"),
 b=rd("fssai-89-current-exact-finished-article-evidence-packets-2026-10-12.json"),
 g=rd("contaminants-2026-deferred-amendment-v1.json"),
 l=rd("fssai-current-first-source-533-live-ledger-444-89-2026-10-12.json"),
 q=rd("fssai-current-89-first-exact-source-proof-worklist-2026-10-12.json"),
 js=fs.readFileSync(path.join(root,pre+"fssai-2026-may-533-89-effective-date.js"),"utf8"),
 html=fs.readFileSync(path.join(root,pre+"index.html"),"utf8");
const hash=o=>{const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,Date,contaminantsDb:{official_sources:[{url:a.current_compendium_source}],source_version:a.current_active_compendium},
 pmsv444Ledger:l,pmsv89Queue:q,pmsv444Valid:()=>true,
 pmsvReviewSnapshotDigest:hash,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"",esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(js,c);c.pmsvMay2026Scope=structuredClone(a);
 c.pmsv89FinalProof=structuredClone(b);c.pmsvMay2026Register=structuredClone(g);return c;
}
test("Actual official FSSAI Gazette 272840 dated May 2026 is FUTURE until 1 December 2026",()=>{
 const c=ctx();assert.equal(c.pmsvMay2026SourceValid(),true);
 assert.equal(a.official_gazette,"https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf");
 assert.equal(a.effective_date,"2026-12-01");assert.equal(a.current_assessment_date,"2026-10-12");
 assert.equal(a.amendment_effective_on_current_assessment_date,false);
 assert.equal(a.active_v9_numerical_articles_mutated,false);
 assert.equal(a.post_effective_silent_activation,false);
});
test("No catalogue products silently gain December limits or lab PASS",()=>{
 assert.equal(a.watch_points.length,533);assert.equal(a.future_watch_count,31);
 assert.equal(l.partial_exact,444);assert.equal(l.first_source_pending,89);
 for(const x of a.watch_points){
  assert.equal(x.amendment_applies_on_current_date,false);
  assert.equal(x.auto_apply_may_amendment_limit,false);
  assert.equal(x.current_compendium_article_unchanged_by_this_audit,true);
  assert.equal(x.full_regulatory_pass,false);assert.equal(x.lab_pass,false);
 }
});
test("All 31 future exact review candidates map to 5 unchanged official register families",()=>{
 const ids=new Set(),counts={};
 for(const c of g.changes){
  counts[c.id]=c.catalog_ids.length;
  for(const id of c.catalog_ids){assert.ok(!ids.has(id));ids.add(id);
    const p=a.watch_points.find(x=>x.catalog_id===id);
    assert.deepEqual(p.may_2026_amendment_watch_ids,[c.id]);}
 }
 assert.equal(ids.size,31);
 assert.deepEqual(Object.values(counts),[4,1,2,2,22]);
});
test("All 89 pending identity packets are present, distinct, and still not source-cleared",()=>{
 assert.equal(b.cases.length,89);assert.equal(q.review_records.length,89);
 const ids=new Set(q.review_records.map(x=>x.catalog_id)),seen=new Set();
 for(const x of b.cases){
  assert.ok(ids.has(x.catalog_id));assert.ok(!seen.has(x.catalog_id));seen.add(x.catalog_id);
  assert.equal(x.source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(x.current_source_match_verified,false);
  assert.equal(x.numeric_limit_auto_apply,false);
  assert.equal(x.complete_product_regulatory_pass,false);
  assert.equal(x.measured_lot_pass,false);
  assert.equal(x.product_specific_decision.length,3);
  assert.equal(x.required_supplier_packet.length,3);
 }
});
test("All pending families reviewed; prior 37 specialist dossiers retained",()=>{
 assert.ok(b.broad_assigned_identity_case_families>=25);
 assert.equal(b.existing_detailed_prior_review_count,37);
 assert.equal(b.cases.filter(x=>x.previous_specialist_review_2026_10_12).length,37);
 assert.equal(b.cases.filter(x=>x.regulatory_case==="dairy_analogue").length,8);
 assert.equal(b.cases.filter(x=>x.regulatory_case==="egg").length,2);
 assert.equal(b.cases.filter(x=>x.regulatory_case==="sugar").length,4);
});
test("No May 2026 amended commodity source is in the 89 first-exact pending IDs",()=>{
 const watched=new Set(a.watch_points.filter(x=>x.may_2026_amendment_watch_ids.length).map(x=>x.catalog_id));
 assert.equal(watched.size,31);
 assert.equal(b.cases.filter(x=>watched.has(x.catalog_id)).length,0);
});
test("Source dossier, watched catalogue and official register all fail closed on tamper",()=>{
 for(const k of ["watch","docket","register"]){
  const c=ctx(),obj=k==="watch"?c.pmsvMay2026Scope:k==="docket"?c.pmsv89FinalProof:c.pmsvMay2026Register;
  obj.forgedRegulation=true;assert.equal(c.pmsvMay2026SourceValid(),false,k);
 }
 const c=ctx();c.pmsvMay2026Scope.watch_points[0].auto_apply_may_amendment_limit=true;
 assert.equal(c.pmsvMay2026SourceValid(),false);
});
test("Helper has properly closed external script tag and displays no compliance pass",()=>{
 assert.match(html,/<script src="\.\/fssai-2026-may-533-89-effective-date\.js\?v=20261012-may533"><\/script>/);
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
 assert.match(js,/No new first-source clearance/);
 assert.match(js,/does not automatically activate a new product limit/);
});
