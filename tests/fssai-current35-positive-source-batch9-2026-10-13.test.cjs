"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const d=read("fssai-current35-positive-named-ctr-candidate-gates-batch9-2026-10-13.json");
const b5=read("fssai-current35-proof-intake-batch5-2026-10-13.json");
const q=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const source=fs.readFileSync(path.join(root,"fssai-current35-positive-source-gates-batch9-2026-10-13.js"),"utf8");
function context(data=structuredClone(d)){
 const x={pmsvB5Data:b5,pmsv35Queue:q,pmsv498Ledger:ledger,pmsvB8Valid:()=>true,
   pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"old card"};
 vm.createContext(x);vm.runInContext(source,x);x.pmsvB9Data=data;return x;
}
const P=p=>({id:p.catalog_id,name:p.product_name,fssr:p.fssr,fcs:p.fcs});
test("current 35 source pending identities match the canonical 533 record ledger",()=>{
 assert.equal(ledger.catalogue,533);assert.equal(ledger.partial_exact,498);assert.equal(ledger.first_source_pending,35);
 assert.equal(q.review_records.length,35);assert.equal(d.cases.length,35);
 assert.deepEqual(d.cases.map(x=>x.catalog_id),q.review_records.map(x=>x.catalog_id));
 assert.deepEqual(new Set(d.cases.map(x=>x.catalog_id)),
    new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id)));
 assert.equal(context().pmsvB9Valid(),true);
});
test("exactly three conditional routes found; other 32 receive no new named source",()=>{
 const cases=d.cases.filter(x=>x.targeted_candidate_routes.length);
 assert.equal(cases.length,3);
 assert.equal(d.other_pending_not_given_new_source,32);
 assert.deepEqual(new Set(cases.map(x=>x.catalog_id)),new Set([
  "10-10-3-pickled-eggs",
  "99-99-7-mixtures-preparations-premix-of-functional-ingredients",
  "formulated-supplements-children"
 ]));
 assert.equal(d.conditional_subroutes.length,3);
 assert.equal(d.conditional_subroutes.reduce((n,x)=>n+x.qualifying_conditions.length,0),12);
});
test("tin-canned egg and listed-crop aflatoxin values remain published reference only",()=>{
 const tin=d.conditional_subroutes.find(x=>x.catalog_id==="10-10-3-pickled-eggs");
 assert.equal(tin.named_article,"Canned foods other than beverages");
 assert.equal(tin.contaminant,"Tin");assert.equal(tin.limit,250);
 assert.equal(tin.unit,"mg/kg");assert.equal(tin.ctr_pdf_page_zero_based,10);
 assert.equal(tin.production_variant_proven,false);
 assert.match(tin.qualifying_conditions.join(" "),/genuinely canned/);
 for(const r of d.conditional_subroutes.filter(x=>x.contaminant!=="Tin")){
  assert.equal(r.ctr_pdf_page_zero_based,13);
  assert.deepEqual(r.published_reference_rows,[
    {analyte:"Total aflatoxins",limit:20,unit:"µg/kg"},
    {analyte:"Aflatoxin B1",limit:10,unit:"µg/kg"}
  ]);
  assert.equal(r.formula_proven,false);
 }
});
test("all 35 stay pending, 3 display the 12 proof conditions and 32 have no new panel",()=>{
 const c=context();
 let panes=0,conditions=0,blank=0;
 for(const x of q.review_records){
  const html=c.pmsvB9Html(P(x));
  if(html.includes("Batch 9")){
    panes++;conditions+=(html.match(/<li>/g)||[]).length;
    assert.match(html,/FIRST NAMED CTR SOURCE STILL PENDING/);
    assert.match(html,/references, not applied limits or PASS results/);
  }else{assert.equal(html,"");blank++;}
 }
 assert.equal(panes,3);assert.equal(conditions,12);assert.equal(blank,32);
 assert.equal(d.first_named_CTR_source_promotions,0);
 assert.equal(d.auto_numeric_limit_assignments,0);
 assert.equal(d.verified_laboratory_results,0);
 assert.equal(d.full_compliance_approvals,0);
});
test("tampered source, analytical value, identity or approval state fails closed",()=>{
 const mutations={
  id:z=>z.cases[0].catalog_id="wrong",
  article:z=>z.conditional_subroutes[0].named_article="not regulatory",
  tin:z=>z.conditional_subroutes[0].limit=300,
  aflatoxin:z=>z.conditional_subroutes[1].published_reference_rows[0].limit=50,
  product:z=>z.cases[0].product_name="wrong",
  evidence:z=>z.conditional_subroutes[0].qualifying_conditions[0]="invented",
  date:z=>z.future_effective_on="2026-10-13",
  approved:z=>z.full_compliance_approvals=1,
  activated:z=>z.conditional_subroutes[0].finished_limit_auto_assigned=true
 };
 for(const [key,mutate] of Object.entries(mutations)){
  const changed=structuredClone(d);mutate(changed);
  const c=context(changed);assert.equal(c.pmsvB9Valid(),false,key);
  assert.match(c.pmsvB9Html(P(q.review_records.find(x=>x.catalog_id==="10-10-3-pickled-eggs"))),/verification unavailable/);
 }
});
test("new module loaded once after Batch8, before nutrition module",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8"),module="fssai-current35-positive-source-gates-batch9-2026-10-13.js";
 assert(h.indexOf(module)>h.indexOf("fssai-current35-remaining19-batch8-2026-10-13.js"));
 assert(h.indexOf(module)<h.indexOf("fssai-nutrition-v476.js"));
 assert.equal(h.split(module).length-1,1);
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
 new vm.Script(source);
});
