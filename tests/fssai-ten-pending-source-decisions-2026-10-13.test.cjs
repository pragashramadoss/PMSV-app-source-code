"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const m=rd("fssai-ten-pending-official-source-decisions-2026-10-13.json");
const q=rd("fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json");
const l=rd("fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json");
const js=fs.readFileSync(path.join(root,"fssai-ten-pending-source-decisions-2026-10-13.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const x={console,pmsv493Valid:()=>true,pmsvReviewSnapshotDigest:digest,pmsv40Queue:q,pmsv493Ledger:l,pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"<p>Earlier precise CTR evidence</p>",esc:String};
 vm.createContext(x);vm.runInContext(js,x);x.pmsvQ10Data=JSON.parse(JSON.stringify(m));return x;
}
const sample=r=>({id:r.catalog_id,name:r.product_name,fssr:r.fssr,fcs:r.fcs});
test("All ten previously unlinked product identities have individual official source packets; current CTR stays 493/40",()=>{
 const x=ctx();assert.equal(x.pmsvQ10Valid(),true);assert.equal(m.records.length,10);
 const ids=new Set(m.records.map(z=>z.catalog_id));assert.equal(ids.size,10);
 assert.equal(l.records.length,533);
 assert.equal(l.records.filter(z=>z.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,493);
 assert.equal(l.records.filter(z=>z.source_status==="FIRST_EXACT_SOURCE_PENDING").length,40);
 for(const r of m.records){
  assert.equal(r.current_ctr_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(r.numeric_contaminant_limits_assigned,false);
  assert.equal(r.complete_regulatory_approval,false);
  assert.ok(q.review_records.some(z=>z.catalog_id===r.catalog_id));
 }
});
test("One direct FSSR quality dossier, two Ayurveda recipe-only records and seven unresolved category records",()=>{
 const groups=new Map();for(const r of m.records)groups.set(r.evidence_type,(groups.get(r.evidence_type)||0)+1);
 assert.equal(m.records.filter(z=>z.quality_dossier_counted).length,1);
 assert.equal(m.records.filter(z=>z.evidence_type==="OFFICIAL_AYURVEDA_AAHARA_RECIPE_IDENTITY_ONLY").length,2);
 assert.equal(m.records.filter(z=>!z.quality_dossier_counted&&z.evidence_type!=="OFFICIAL_AYURVEDA_AAHARA_RECIPE_IDENTITY_ONLY").length,7);
 assert.equal(m.total_linked_quality_dossiers,31);assert.equal(m.quality_dossiers_still_unlinked,9);
 assert.ok(m.records.find(z=>z.catalog_id==="purified-vending-water").established_source_facts.some(t=>t.includes("IS 10500")));
});
test("Ayurveda compendium indices, exact classical recipe descriptions, and identity questions never assign milk CTR limits",()=>{
 for(const [id,index,ingredient] of [
 ["102-102-1-14-3-narikela-ksheerika-milky-coconut-delight","29.8","Cocos nucifera"],
 ["102-102-1-14-7-ksheerapaka-mystic-milk-quartet","29.12","buffalo milk"]]){
  const r=m.records.find(z=>z.catalog_id===id);assert.ok(r);
  assert.ok(r.exact_reference.includes(index));assert.ok(r.established_source_facts.join(" ").toLowerCase().includes(ingredient.toLowerCase()));
  assert.equal(r.quality_dossier_counted,false);assert.match(r.forbidden_inference,/milk/i);
 }
});
test("Broad generic food-additive or nutraceutical identities never gain fabricated numerical specifications",()=>{
 const r=m.records.filter(z=>z.evidence_type.startsWith("BROAD_")||z.evidence_type==="FOSCOS_NAMED_IDENTITY_WITHOUT_SINGLE_VERIFIED_FSSR_MONOGRAPH");
 assert.equal(r.length,7);
 for(const x of r){
  assert.equal(x.quality_dossier_counted,false);
  assert.equal(x.numeric_contaminant_limits_assigned,false);
  assert.ok(x.positive_additional_evidence.length>=2);
  assert.ok(x.forbidden_inference.length>75);
 }
 const sajji=r.find(x=>x.product_name==="Sajji Khar");
 assert.match(sajji.established_source_facts.join(" "),/closed\/withdrawn/i);
});
test("Every on-screen source panel names official FSSAI proof; no lab or legal PASS",()=>{
 const c=ctx();for(const r of m.records){
  const h=c.sourcePinned121ResearchProofHtml(sample(r));
  assert.match(h,/Official FSSAI source decision/);
  assert.match(h,/Earlier precise CTR evidence/);
  assert.ok(h.includes(r.exact_reference));
  assert.match(h,/No tested lot, contaminants, compliance or product approval/);
 }
});
test("Identity tampering, record corruption and false approval fail closed",()=>{
 for(const bad of ["category","legal","source","status","identity","upstream"]){
  const c=ctx();
  if(bad==="category")c.pmsvQ10Data.records[1].quality_dossier_counted=true;
  if(bad==="legal")c.pmsvQ10Data.records[2].numeric_contaminant_limits_assigned=true;
  if(bad==="source")c.pmsvQ10Data.records[3].official_source_url="https://untrusted.invalid/test";
  if(bad==="status")c.pmsvQ10Data.records[4].current_ctr_status="PASSED";
  if(bad==="identity")c.pmsvQ10Data.records[5].catalog_id="invented";
  if(bad==="upstream")c.pmsv493Valid=()=>false;
  assert.equal(c.pmsvQ10Valid(),false,bad);
 }
});
test("New panel load order and pending quality coverage are preserved in gh-pages preview",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8"),
 a=h.indexOf("fssai-four-new-pending-quality-2026-10-13.js"),
 b=h.indexOf("fssai-ten-pending-source-decisions-2026-10-13.js"),
 c=h.indexOf("fssai-pending-40-quality-coverage.js");
 assert.ok(a>0&&b>a&&c>b);
 assert.equal((h.match(/<script\b/g)||[]).length,(h.match(/<\/script>/g)||[]).length);
});
