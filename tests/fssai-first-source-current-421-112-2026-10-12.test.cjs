"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),folder="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const old=read(folder+"data/rules/fssai-current-first-source-533-live-ledger-420-113-2026-10-12.json");
const latest=read(folder+"data/rules/fssai-current-first-source-533-live-ledger-421-112-2026-10-12.json");
const proof=read(folder+"data/rules/fssai-golaka-dugdha-affirmative-concentrated-milk-lead-first-source-2026-10-12.json");
const db=read(folder+"data/rules/contaminants-v9-core.json");
const historical=read(folder+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const three=read(folder+"data/rules/fssai-three-ayurveda-mandated-cereal-composite-aflatoxin-first-source-2026-10-12.json");
const catalogue=read(folder+"data/standard-search-index-v1.json").products;
function make(){
 const ctx={console,esc:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(root,folder+"fssai-source-proof-panels.js"),"utf8"),ctx);
 ctx.sourcePinned121ResearchProofHtml=()=>'<div>historic first source panel</div>';
 vm.runInContext(fs.readFileSync(path.join(root,folder+"fssai-first-source-current-420-113.js"),"utf8"),ctx);
 vm.runInContext(fs.readFileSync(path.join(root,folder+"fssai-first-source-current-421-112.js"),"utf8"),ctx);
 ctx.pmsvCurrent533SourceLedger=historical;
 ctx.pmsv2026CurrentFirstSourceLedger=old;
 ctx.pmsv2026FirstSourcePromotionManifest=three;
 ctx.pmsv2026GolakaManifest=proof;
 ctx.pmsv2026Current421Ledger=latest;
 ctx.contaminantsDb=db;
 return ctx;
}
test("new ledger is 533=421+112, one and only one change from the 420/113 baseline",()=>{
 assert.equal(old.records.length,533);
 assert.equal(latest.records.length,533);
 assert.equal(latest.partial_exact,421);
 assert.equal(latest.first_source_pending,112);
 assert.equal(latest.full_compliance_approvals,0);
 let changes=0;
 for(let i=0;i<533;i++){
  const a=old.records[i],b=latest.records[i];
  assert.equal(a.catalog_id,b.catalog_id);
  assert.equal(a.product_name,b.product_name);
  assert.equal(b.product_compliance_approval,false);
  assert.equal(b.sample_lab_pass,false);
  assert.equal(b.complete_contaminant_panel,false);
  if(a.catalog_id===proof.product.catalog_id){
   changes++;
   assert.equal(a.source_status,"FIRST_EXACT_SOURCE_PENDING");
   assert.equal(b.source_status,"PARTIAL_EXACT_SOURCE_MATCH");
   assert.equal(b.regulatory_source_verified_delta.concentration_factor_verified,false);
   assert.equal(b.regulatory_source_verified_delta.computed_limit,null);
  }else assert.deepEqual(a,b);
 }
 assert.equal(changes,1);
 assert.equal(latest.records.filter(r=>r.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,421);
 assert.equal(latest.records.filter(r=>r.source_status==="FIRST_EXACT_SOURCE_PENDING").length,112);
});
test("FSSAI Golaka pure cow milk concentration identity and official CTR source exactly match",()=>{
 const milk=db.metal_article_rules_v9.Lead.filter(r=>r.article==="Milks");
 assert.equal(milk.length,1);
 assert.equal(milk[0].limit,0.02);
 assert.equal(milk[0].unit,"mg/kg");
 assert.equal(milk[0].row_type,"exact");
 assert.equal(milk[0].auto_apply,false);
 assert.equal(milk[0].condition,proof.product.concentration_condition);
 assert.equal(proof.product.official_recipe_section,"14.1 Golaka Dugdha (Condensed Milk without Sugar)");
 assert.equal(proof.product.mandatory_ingredient,"Cow Milk (Godugdha), 1 part");
 assert.equal(proof.product.other_ingredients,"NONE");
 assert.match(proof.product.mandatory_process,/seven times/);
 assert.equal(proof.product.concentration_factor,null);
 assert.equal(proof.product.finished_limit_numeric,null);
 assert.equal(proof.product.first_exact_source_verified,true);
 assert.equal(proof.product.all_contaminants_complete,false);
 assert.equal(proof.product.lab_pass,false);
 assert.equal(proof.product.full_compliance_pass,false);
 assert.match(proof.official_recipe,/^https:\/\/fssai\.gov\.in\/upload\//);
 assert.match(proof.official_contaminants,/^https:\/\/fssai\.gov\.in\/upload\//);
});
test("canonical UI shows 421/112 and a concentration factor gate with no fabricated PASS",()=>{
 const ctx=make();
 assert.equal(ctx.pmsv2026GolakaFirstSourceValid(),true);
 const product=catalogue.find(x=>x.id===proof.product.catalog_id);
 assert.ok(product);
 const html=ctx.sourcePinned121ResearchProofHtml(product);
 assert.match(html,/421 first-source partial/);
 assert.match(html,/112 first-source pending/);
 assert.match(html,/PARTIAL EXACT SOURCE MATCH/);
 assert.match(html,/0.02 mg\/kg/);
 assert.match(html,/verified concentration factor/);
 assert.doesNotMatch(html,/420 partial exact source/);
 assert.doesNotMatch(html,/historic first source panel/);
 const p=latest.records.find(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING");
 const pending=ctx.sourcePinned121ResearchProofHtml(catalogue.find(x=>x.id===p.catalog_id));
 assert.match(pending,/112 first-source pending/);
 assert.match(pending,/FIRST EXACT SOURCE PENDING/);
 assert.doesNotMatch(pending,/420 partial exact source/);
});
test("a changed official source value, article identity, concentration condition or lab flag fails closed",()=>{
 const ctx=make();
 const p=catalogue.find(x=>x.id===proof.product.catalog_id);
 assert.equal(ctx.pmsv2026GolakaFirstSourceValid(),true);
 for(const broken of ["base","factor","pass","article","recipe"]){
  const m=JSON.parse(JSON.stringify(proof)),l=JSON.parse(JSON.stringify(latest));
  if(broken==="base")m.product.base_limit=8.9;
  if(broken==="factor")m.product.finished_limit_numeric=0.02;
  if(broken==="pass")l.records.find(x=>x.catalog_id===p.id).sample_lab_pass=true;
  if(broken==="article")m.product.named_article="Secondary milk products (as consumed)";
  if(broken==="recipe")m.product.other_ingredients="Rice";
  ctx.pmsv2026GolakaManifest=m;ctx.pmsv2026Current421Ledger=l;
  assert.equal(ctx.pmsv2026GolakaFirstSourceValid(),false,broken);
  assert.match(ctx.sourcePinned121ResearchProofHtml(p),/status withheld/);
 }
});
test("the new 421/112 UI asset follows the canonical previous asset and CI includes regression",()=>{
 const html=fs.readFileSync(path.join(root,folder+"index.html"),"utf8");
 assert.ok(html.includes("fssai-first-source-current-421-112.js"));
 assert.ok(html.indexOf("fssai-first-source-current-421-112.js")>
   html.indexOf("fssai-first-source-current-420-113.js"));
 const workflow=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(workflow,/node --test tests\/fssai-first-source-current-421-112-2026-10-12\.test\.cjs/);
});