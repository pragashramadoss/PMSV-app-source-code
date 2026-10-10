"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json");
const index=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const candidates=[
 ["06-06-2-protein-rich-wheat-flour-protein-prachur-atta","Protein rich wheat flour (Protein prachur atta)","2.4.1(3)","wheat_flour_required"],
 ["06-06-2-protein-rich-refined-wheat-flour-protein-prachur-maida","Protein rich refined wheat flour (Protein prachur maida)","2.4.2(3)","refined_wheat_flour_required"],
 ["06-06-7-malted-milk-food","Malted Milk Food","2.4.11(1)","malted_cereal_required"],
 ["06-06-7-malt-based-foods-malt-food","Malt Based Foods(Malt Food)","2.4.11(2)","malted_cereal_or_grain_legume_required"],
 ["06-06-7-malt-extract","Malt Extract","2.4.11(3)","malted_cereal_required"]
];
const begin=html.indexOf("function productBaselineContaminantRules(p){");
const end=html.indexOf("\nfunction ",begin+32);
assert.ok(begin>=0&&end>begin);
const ctx={contaminantsDb:db,chapterRuleDbs:[chapter],ruleDbStandards:o=>o.standards||[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false};
vm.runInNewContext(html.slice(begin,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(x=>
 String(x.source_basis||"").includes("exact Chapter 2.4 cereal/malt product"));
test("All five exact cereal and malt identities have source-pinned chapter clauses",()=>{
 for(const [id,name,fssr,kind] of candidates){
  const p=index.find(z=>z.id===id);
  assert.ok(p,id);assert.equal(p.name,name);assert.equal(p.fssr,fssr);
  const standard=chapter.standards.find(x=>x.key===fssr);
  assert.ok(standard);
  const info=standard.source_verified_identity;
  assert.ok(info);
  assert.equal(info.source_clause,fssr);
  assert.equal(info.principal_material_kind,kind);
  assert.equal(info.full_contaminant_compliance,false);
  assert.equal(info.total_aflatoxins_auto_assigned,false);
  assert.equal(info.metal_limits_auto_assigned,false);
  assert.equal(info.pesticide_mrl_auto_assigned,false);
  assert.match(info.official_source_url,/^https:\/\/fssai\.gov\.in\//);
 }
});
test("FSSAI Version IX confirms B1 10 µg/kg in all three cereal, pulse, and composite article rows",()=>{
 const group=db.crop_contaminants.aflatoxin_b1;
 assert.equal(group.unit,"µg/kg");
 for(const article of ["Cereal and cereal products","Pulses","Food product containing any of the above mentioned food articles"]){
  const rows=group.rules.filter(r=>r.article===article);
  assert.equal(rows.length,1,article);
  assert.equal(Number(rows[0].limit),10);
 }
 for(const [id] of candidates){
  const p=index.find(z=>z.id===id),rules=run(p);
  assert.deepEqual(rules.map(r=>[r.contaminant,r.limit,r.unit]),[["Aflatoxin B1",10,"µg/kg"]],p.name);
  assert.ok(rules.every(r=>!r.condition.includes("compliance PASS")===false||r.condition.includes("No compliance PASS")));
 }
});
test("No near-equivalent identity or changed chapter or source can inherit this B1 mapping",()=>{
 const item=index.find(z=>z.id===candidates[0][0]);
 for(const bad of [{...item,name:"Generic wheat atta"},{...item,id:"06-06-2-maida"},{...item,fssr:"2.4.2"}])
  assert.equal(run(bad).length,0);
 const ref=db;
 for(const change of [
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Pulses").limit=11},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.source_version="Version VIII"}
 ]){
  const tampered=structuredClone(ref);change(tampered);ctx.contaminantsDb=tampered;
  assert.equal(run(item).length,0);
 }
 ctx.contaminantsDb=db;ctx.chapterRuleDbs=[];
 assert.equal(run(item).length,0,"Missing loaded chapter cannot silently pass");
 ctx.chapterRuleDbs=[structuredClone(chapter)];
 const row=ctx.chapterRuleDbs[0].standards.find(x=>x.key==="2.4.1(3)");
 row.source_verified_identity.principal_material_kind="none";
 assert.equal(run(item).length,0,"Changed chapter identity must suppress number");
 ctx.chapterRuleDbs=[chapter];
 assert.equal(run(item).length,1);
});
test("Audit does not confuse partial B1 evidence with total aflatoxins or full compliant assessment",()=>{
 assert.match(audit,/fssai_v9_exact_cereal_malt_b1_partial_evidence/);
 assert.match(audit,/exact_cereal_malt_b1_partial_evidence:cerealMaltB1Evidence/);
 assert.match(audit,/complete_contaminant_coverage:false/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
});
