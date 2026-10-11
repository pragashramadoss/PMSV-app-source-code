"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),dir="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const pin=read(dir+"data/rules/fssai-v9-61-metal-article-testing-bases-2026-10-11.json");
const m=read(dir+"data/rules/fssai-v9-expanded-identity-nontransfer-2026-10-11.json");
const x=read(dir+"data/rules/fssai-v9-cross-metal-matrix-2026-10-11.json");
const a=read(dir+"data/rules/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.json");
const db=read(dir+"data/rules/contaminants-v9-core.json");
const pending=read(dir+"data/rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const index=read(dir+"data/standard-search-index-v1.json").products;
const work=read("audit-output/fssai-next-121-first-exact-source-research-queue.json");
const html=fs.readFileSync(path.join(root,dir,"index.html"),"utf8");
const start=html.indexOf("function sourcePinnedExpandedMetalScopeHtml(p){"),end=html.indexOf("function pendingContaminantReviewNotice(p){",start+30);
const ctx=vm.createContext({crossFormV9ScopeDb:structuredClone(a),expandedV9ScopeDb:structuredClone(m),crossMetalV9ScopeDb:structuredClone(x),metalMeasurementBasisDb:structuredClone(pin),contaminantsDb:structuredClone(db),sourcePriorityMetalDb:structuredClone(pending),esc:s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))});
vm.runInContext(html.slice(start,end),ctx);
const p=id=>index.find(z=>z.id===id),show=id=>vm.runInContext("sourcePinnedExpandedMetalScopeHtml("+JSON.stringify(p(id))+")",ctx);
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
test("61 exact FSSAI article references preserve full source testing basis, including all 7 official nonempty conditions",()=>{
 assert.equal(pin.number_of_pinned_source_articles,61);
 assert.equal(pin.number_with_mandatory_measurement_basis,7);
 assert.equal(pin.source_rows.length,61);assert.equal(new Set(pin.source_rows.map(z=>z.id)).size,61);
 for(const s of pin.source_rows){
  const matches=(db.metal_article_rules_v9[s.metal]||[]).filter(r=>r.row_type==="exact"&&norm(r.article)===norm(s.article)&&r.limit===s.limit&&r.unit===s.unit&&String(r.condition||"")===s.condition);
  assert.equal(matches.length,1,s.id);
  assert.equal(s.numeric_limit_auto_apply,false);
  assert.equal(s.article_applies_to_pending_finished_product,false);
  assert.equal(s.compliance_pass,false);
 }
});
test("Cocoa powder, tomato solids, dry colouring, dried onions, additives and dehydrated milks preserve unique official bases",()=>{
 const pick=id=>pin.source_rows.find(x=>x.id===id);
 const testRows=[["COCOA_POWDER_LEAD","dry fat-free"],["COCOA_POWDER_COPPER","fat free"],["TOMATO_PUREE_COPPER","dried tomato"],["DEHYDRATED_ONION","dry matter"],["MILK_LEAD","concentration factor"],["AS_NATURAL_COLOUR","dry colouring"],["AS_ADDITIVES","dry matter"]];
 for(const [id,basis] of testRows)assert.match(pick(id).condition,new RegExp(basis,"i"),id);
 assert.equal(pin.source_rows.find(r=>r.id==="PACKAGED_WATER_LEAD").unit,"mg/L");
});
test("All 121 pending worklists retain exact conditions of their metal article references, no final approvals",()=>{
 assert.equal(work.pending,121);assert.equal(work.metal_measurement_source_rows,61);
 assert.equal(work.metal_measurement_basis_qualified_rows,7);
 let refs=0,bases=0;
 for(const p of work.records){
  for(const r of [...p.expanded_named_article_references_review_only,...p.cross_metal_nontransfer_references_review_only]){
   const id=r.source_reference_id||r.source_id,s=pin.source_rows.find(x=>x.id===id);
   assert.ok(s,id);assert.equal(r.source_testing_basis_review_only,s.condition);
   assert.equal(r.compliance_pass,false);refs++;if(s.condition)bases++;
  }
 }
 assert.equal(refs,387);assert.equal(bases,work.measurement_basis_scope_review_references);assert.ok(bases>10);
});
test("Live Helper displays official measurement basis where applicable but never applies reference as finished-food compliance",()=>{
 assert.match(html,/let metalMeasurementBasisDb=null/);assert.match(html,/metalMeasurementBasisDb=await res.json\(\)/);
 for(const [id,part] of [["06-06-2-carob-powder","dry fat-free"],["102-102-1-14-1-golaka-dugdha-condensed-milk-without-sugar","concentration factor"],["99-99-1-colouring-foods","dry colouring"]]){
  const h=show(id);assert.match(h,new RegExp(part,"i"),id);assert.match(h,/NOT APPLIED/);assert.match(h,/REVIEW ONLY/);
 }
});
test("Tampered source condition, missing basis register, fake approval, and water mg/L mutation all fail closed",()=>{
 const id="06-06-2-carob-powder",oldDb=ctx.contaminantsDb,oldPin=ctx.metalMeasurementBasisDb;
 let h=show(id);assert.match(h,/dry fat-free/);
 ctx.contaminantsDb=structuredClone(db);ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Cocoa powder").condition="On wet weight basis.";
 assert.match(show(id),/withheld/);ctx.contaminantsDb=oldDb;
 ctx.metalMeasurementBasisDb=structuredClone(pin);ctx.metalMeasurementBasisDb.source_rows.find(x=>x.id==="COCOA_POWDER_LEAD").condition="";
 assert.match(show(id),/withheld/);ctx.metalMeasurementBasisDb=oldPin;
 ctx.metalMeasurementBasisDb=structuredClone(pin);ctx.metalMeasurementBasisDb.source_rows.find(x=>x.id==="MILK_LEAD").compliance_pass=true;
 assert.match(show(id),/withheld/);ctx.metalMeasurementBasisDb=oldPin;
 ctx.metalMeasurementBasisDb=null;assert.match(show(id),/withheld/);ctx.metalMeasurementBasisDb=oldPin;
 ctx.contaminantsDb=structuredClone(db);ctx.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="Packaged drinking water (other than mineral water)").unit="mg/kg";
 assert.match(show(id),/withheld/);ctx.contaminantsDb=oldDb;
});
