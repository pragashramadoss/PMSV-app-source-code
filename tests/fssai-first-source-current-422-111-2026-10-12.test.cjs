"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),app="fssai-product-helper-preview-01/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,app+"data/rules/"+x),"utf8"));
const legacy=read("fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const ledger420=read("fssai-current-first-source-533-live-ledger-420-113-2026-10-12.json");
const ledger421=read("fssai-current-first-source-533-live-ledger-421-112-2026-10-12.json");
const ledger422=read("fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json");
const list116=read("fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const list112=read("fssai-current-112-first-exact-source-proof-worklist-2026-10-12.json");
const list111=read("fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json");
const three=read("fssai-three-ayurveda-mandated-cereal-composite-aflatoxin-first-source-2026-10-12.json");
const golaka=read("fssai-golaka-dugdha-affirmative-concentrated-milk-lead-first-source-2026-10-12.json");
const sugandhit=read("fssai-sugandhit-ksheera-listed-rice-aflatoxin-first-source-2026-10-12.json");
const core=read("contaminants-v9-core.json");
const products=read("../standard-search-index-v1.json").products;
function ctx(){
 const c={console,esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(c);
 c.sourcePinned121ResearchProofHtml=()=>"";
 for(const name of [
  "fssai-source-proof-panels.js",
  "fssai-evidence-capture-116.js",
  "fssai-first-source-current-420-113.js",
  "fssai-first-source-current-421-112.js",
  "fssai-current-112-worklist-integrity.js",
  "fssai-first-source-current-422-111.js"
 ])vm.runInContext(fs.readFileSync(path.join(root,app+name),"utf8"),c);
 c.pmsvCurrent533SourceLedger=legacy;
 c.pmsvCurrent116ProofWorklist=list116;
 c.contaminantsDb=core;
 c.pmsv2026CurrentFirstSourceLedger=ledger420;
 c.pmsv2026FirstSourcePromotionManifest=three;
 c.pmsv2026GolakaManifest=golaka;
 c.pmsv2026Current421Ledger=ledger421;
 c.pmsv2026Current112Worklist=list112;
 c.pmsv2026Current422Manifest=sugandhit;
 c.pmsv2026Current422Ledger=ledger422;
 c.pmsv2026Current111Queue=list111;
 // The historical 121 source panel needs unrelated globals absent from this focused VM.
 // Stub only its old HTML wrapper; the full 422/111 ledger and product checks stay live.
 c.pmsv2026Prior422Html=()=>"";
 return c;
}
test("422/111 ledger reconciles exactly one new recipe first-source match against 421/112",()=>{
 assert.equal(ledger422.catalogue,533);assert.equal(ledger422.partial_exact,422);
 assert.equal(ledger422.first_source_pending,111);
 assert.equal(ledger422.full_compliance_approvals,0);
 const id=sugandhit.product.catalog_id;
 let changed=0;
 for(let i=0;i<533;i++){
  const a=ledger421.records[i],b=ledger422.records[i];
  assert.equal(b.catalog_id,a.catalog_id);
  assert.equal(b.product_name,a.product_name);
  assert.equal(b.sample_lab_pass,false);
  assert.equal(b.product_compliance_approval,false);
  assert.equal(b.complete_contaminant_panel,false);
  if(a.catalog_id===id){
   changed++;
   assert.equal(a.source_status,"FIRST_EXACT_SOURCE_PENDING");
   assert.equal(b.source_status,"PARTIAL_EXACT_SOURCE_MATCH");
   assert.equal(b.regulatory_source_verified_delta.actual_batch_rice_confirmed,false);
   assert.equal(b.regulatory_source_verified_delta.full_compliance_pass,false);
  }else assert.deepEqual(a,b);
 }
 assert.equal(changed,1);
 assert.equal(ledger422.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,422);
 assert.equal(ledger422.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,111);
});
test("official named recipe rice is positively evidenced, not a fictitious measured lot",()=>{
 const x=sugandhit.positively_identified_ingredient;
 assert.equal(sugandhit.product.catalog_id,"102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk");
 assert.equal(sugandhit.official_recipe_section,"14.6 Sugandhit Ksheera (Aroma Infused Milk)");
 assert.deepEqual(x,{common:"Rice",ayurveda_name:"Tandula",botanical:"Oryza sativa L.",part:"Seed",quantity:"Q.S.",recipe_ingredient_row:12});
 assert.match(sugandhit.applicability_note,/If a variant omits rice/);
 assert.equal(sugandhit.actual_batch_rice_confirmed,false);
 assert.equal(sugandhit.auto_numeric_finished_limit_applied,false);
 assert.equal(sugandhit.full_contaminant_panel,false);
 assert.equal(sugandhit.regulatory_compliance_pass,false);
 assert.equal(sugandhit.laboratory_pass,false);
 assert.match(sugandhit.official_recipe,/^https:\/\/fssai\.gov\.in\/upload\//);
 assert.equal(sugandhit.official_contaminants,core.official_sources[0].url);
});
test("exact named composite aflatoxin official source rows are authenticated independently",()=>{
 assert.equal(sugandhit.source_article,"Food product containing any of the above mentioned food articles");
 for(const [i,k,n] of [[0,"total_aflatoxins",20],[1,"aflatoxin_b1",10]]){
  const r=core.crop_contaminants[k],x=sugandhit.source_limits[i];
  assert.equal(x.key,k);assert.equal(x.limit,n);assert.equal(x.unit,"µg/kg");
  assert.equal(r.unit,"µg/kg");
  assert.equal(r.rules.filter(a=>a.article===sugandhit.source_article&&a.limit===n).length,1);
 }
});
test("current 111 proof queue removes only Sugandhit, preserving all 111 original evidence packets",()=>{
 assert.equal(list112.review_records.length,112);
 assert.equal(list111.review_records.length,111);
 assert.equal(new Set(list111.review_records.map(x=>x.catalog_id)).size,111);
 const current=new Set(ledger422.records.filter(r=>r.source_status==="FIRST_EXACT_SOURCE_PENDING").map(r=>r.catalog_id));
 const earlier=new Map(list112.review_records.map(x=>[x.catalog_id,x]));
 const removed=[...earlier.keys()].filter(x=>!list111.review_records.some(y=>y.catalog_id===x));
 assert.deepEqual(removed,[sugandhit.product.catalog_id]);
 assert.equal(current.size,111);
 for(const item of list111.review_records){
  assert.ok(current.has(item.catalog_id));assert.deepEqual(item,earlier.get(item.catalog_id));
  assert.equal(item.first_exact_source_verified,false);assert.equal(item.finished_food_laboratory_pass,false);
 }
 assert.equal(list111.promoted_catalog_ids.length,5);
 assert.ok(list111.promoted_catalog_ids.includes(sugandhit.product.catalog_id));
});
test("full current 422/111 runtime guard, displayed record and evidence collector are correct",()=>{
 const c=ctx();
 assert.equal(c.pmsv2026Current422Valid(),true);
 const p=products.find(x=>x.id===sugandhit.product.catalog_id);
 assert.ok(p);
 const h=c.sourcePinned121ResearchProofHtml(p);
 assert.match(h,/422 partial first-source matches/);
 assert.match(h,/111 pending first exact article/);
 assert.match(h,/PARTIAL EXACT SOURCE MATCH/);
 assert.match(h,/Tandula/);assert.match(h,/20 µg\/kg/);assert.match(h,/10 µg\/kg/);
 assert.match(h,/must actually contain the listed rice/);
 assert.doesNotMatch(h,/421 first-source partial/);
 assert.equal(c.pmsv116Valid(p),false);
 assert.equal(c.pmsv116GetAuthorized(p.id),null);
 const remaining=list111.review_records[0],q=products.find(x=>x.id===remaining.catalog_id);
 assert.ok(q);
 assert.equal(c.pmsv116Valid(q),true);
 const pending=c.sourcePinned121ResearchProofHtml(q);
 assert.match(pending,/111 pending first exact article/);
 assert.match(pending,/FIRST EXACT SOURCE PENDING/);
});
test("tampered source, recipe identity, actual lab results or pending count fail closed",()=>{
 const c=ctx(),p=products.find(x=>x.id===sugandhit.product.catalog_id);
 assert.equal(c.pmsv2026Current422Valid(),true);
 for(const kind of ["numeric","recipe","lot","approval","lost_packet","source"]){
  let manifest=JSON.parse(JSON.stringify(sugandhit)),ledger=JSON.parse(JSON.stringify(ledger422)),
      queue=JSON.parse(JSON.stringify(list111));
  if(kind==="numeric")manifest.source_limits[0].limit=999;
  if(kind==="recipe")manifest.positively_identified_ingredient.botanical="Triticum aestivum";
  if(kind==="lot")manifest.actual_batch_rice_confirmed=true;
  if(kind==="approval")ledger.records.find(x=>x.catalog_id===p.id).sample_lab_pass=true;
  if(kind==="lost_packet")queue.review_records.pop();
  if(kind==="source")manifest.official_recipe="https://unofficial.example.com/false.pdf";
  c.pmsv2026Current422Manifest=manifest;
  c.pmsv2026Current422Ledger=ledger;
  c.pmsv2026Current111Queue=queue;
  assert.equal(c.pmsv2026Current422Valid(),false,kind);
  assert.match(c.sourcePinned121ResearchProofHtml(p),/withheld/,kind);
 }
});
test("current JS loads after 421/112, and CI includes this batch regression",()=>{
 const html=fs.readFileSync(path.join(root,app+"index.html"),"utf8");
 assert.ok(html.indexOf("fssai-first-source-current-422-111.js")>
   html.indexOf("fssai-first-source-current-421-112.js"));
 const workflow=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(workflow,/node --test tests\/fssai-first-source-current-422-111-2026-10-12\.test\.cjs/);
});
