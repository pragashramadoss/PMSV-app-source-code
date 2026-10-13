"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/",dir=root+"data/rules/";
const read=n=>JSON.parse(fs.readFileSync(dir+n,"utf8"));
const data=read("fssai-current35-seven-named-commodity-research-batch16-2026-10-13.json");
const b14=read("fssai-current35-adjudication-workbench-batch14-2026-10-13.json");
const b15=read("fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.json");
const q=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const code=fs.readFileSync(root+"fssai-current35-seven-named-commodity-research-batch16-2026-10-13.js","utf8");
function context(){
 const s={
  pmsvB15Valid:()=>true,pmsvB14Data:b14,pmsvB15Data:b15,pmsv35Queue:q,
  pmsv498Ledger:ledger,pmsvLoadPositiveSourceProof:async()=>{},
  sourcePinned121ResearchProofHtml:()=>"",
  pmsvB14Esc:v=>String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))
 };
 vm.createContext(s);vm.runInContext(code,s);s.pmsvB16Data=data;return s;
}
test("533/498/35 canonical source counts, zero promotions and zero lot results",()=>{
 const c=context();assert.equal(c.pmsvB16Valid(),true);
 assert.equal(ledger.records.length,533);
 assert.equal(ledger.first_source_pending,35);
 assert.equal(data.catalogue,533);assert.equal(data.conditional_first_source_matches,498);
 assert.equal(data.first_exact_pending,35);
 for(const key of ["new_first_source_promotions","new_numeric_thresholds_applied","new_lot_lab_passes","new_compliance_approvals","complete_contaminant_panel_clearances"])assert.equal(data.results[key],0);
 assert.equal(data.results.canonical_ledger_modified,false);
 assert.equal(data.results.wordpress_production_modified,false);
});
test("35 original identities; exactly 3 prior conditional, 7 new research, 25 still without candidate",()=>{
 assert.equal(data.cases.length,35);
 assert.deepEqual(data.cases.map(x=>x.catalog_id),q.review_records.map(x=>x.catalog_id));
 assert.deepEqual(data.cases.map(x=>x.catalog_id),b14.cases.map(x=>x.catalog_id));
 const counts={PRIOR_NAMED_CONDITIONAL:0,NEW_RESEARCH_COMMODITY_HYPOTHESIS:0,NO_ADDITIONAL_NAMED_ARTICLE_PROVEN:0};
 for(const x of data.cases){assert.ok(Object.hasOwn(counts,x.route_state));counts[x.route_state]++;
  assert.equal(x.prior_source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(x.matched_legal_commodity_article_unconditionally,false);
  assert.equal(x.numeric_finished_limit_assigned,false);
  assert.equal(x.lot_pass,false);
  assert.equal(x.full_compliance_approved,false);
 }
 assert.deepEqual(counts,{PRIOR_NAMED_CONDITIONAL:3,NEW_RESEARCH_COMMODITY_HYPOTHESIS:7,NO_ADDITIONAL_NAMED_ARTICLE_PROVEN:25});
 const prior=new Set(b15.candidate_routes.map(x=>x.catalog_id));
 const fresh=new Set(data.hypotheses.map(x=>x.catalog_id));
 assert.equal(fresh.size,7);assert.equal(prior.size,3);
 for(const k of fresh)assert.equal(prior.has(k),false);
});
test("28 conditions and named-article source values strictly reference only",()=>{
 assert.equal(data.hypotheses.reduce((sum,x)=>sum+x.gates.length,0),28);
 for(const x of data.hypotheses){
  assert.equal(x.gates.length,4);
  assert.ok(x.named_article.length>3);
  assert.ok(x.legal_risk.length>40);
  assert.ok(x.positive_article_evidence.length>40);
  assert.ok(/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(x.fssr));
  for(const v of x.published){assert.ok(v.value>0);assert.ok(["mg/kg","µg/kg"].includes(v.unit));}
 }
 const m=new Map(data.hypotheses.map(x=>[x.catalog_id,x]));
 assert.equal(m.get("10-10-2-egg-powder").published[0].value,0.05);
 assert.match(m.get("10-10-2-egg-powder").published[0].sample_basis,/Shell-free/);
 assert.equal(m.get("04-04-1-frozen-fruits-fruit-products").published[0].value,2);
 assert.equal(m.get("04-04-1-seedless-tamarind").published[0].value,2);
 assert.equal(m.get("11-11-1-edible-lactose").published[0].value,0.05);
 assert.equal(m.get("100-100-cow-or-buffalo-colostrum-and-colostrum-products").published[0].value,0.05);
 assert.equal(m.get("06-06-1-chia-seeds").published[0].value,15);
 assert.equal(m.get("06-06-1-chia-seeds").published[1].value,10);
 assert.equal(m.get("08-08-4-animal-casings").published[0].value,0.5);
});
test("Fail closed: tampering with legal article approval or catalog ID invalidates runtime data",()=>{
 const c=context();
 assert.equal(c.pmsvB16Valid(),true);
 const saved=c.pmsvB16Data;
 const altered=JSON.parse(JSON.stringify(data));
 altered.cases[0].matched_legal_commodity_article_unconditionally=true;
 c.pmsvB16Data=altered;assert.equal(c.pmsvB16Valid(),false);
 const changed=JSON.parse(JSON.stringify(data));changed.cases[2].catalog_id="made-up-food";
 c.pmsvB16Data=changed;assert.equal(c.pmsvB16Valid(),false);
 c.pmsvB16Data=saved;assert.equal(c.pmsvB16Valid(),true);
});
test("Exact first-source-boundaries display on applicable products only",()=>{
 const c=context(),make=id=>{
  const x=b14.cases.find(z=>z.catalog_id===id);
  return {id,name:x.product_name,fssr:x.fssr,fcs:x.fcs};
 };
 assert.match(c.pmsvB16Html(make("06-06-1-chia-seeds")) ,/NOT activated/);
 assert.match(c.pmsvB16Html(make("11-11-1-edible-lactose")),/unverified category match/);
 assert.equal(c.pmsvB16Html(make("coffee-chicory-mixture")),"");
 const forged={...make("10-10-2-egg-powder"),name:"other"};
 assert.match(c.pmsvB16Html(forged),/identity mismatch/);
 assert.match(c.pmsvB16MatrixHtml(),/seven/gi);
});
test("Preview only, loaded after Batch15; not applying future CTR amendment",()=>{
 const html=fs.readFileSync(root+"index.html","utf8");
 const name="fssai-current35-seven-named-commodity-research-batch16-2026-10-13.js";
 assert.equal(html.split(name).length,2);
 assert.ok(html.indexOf(name)>html.indexOf("fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.js"));
 assert.equal(data.future_rule_commencement,"2026-12-01");
 assert.equal(data.future_rule_auto_applied,false);
});
