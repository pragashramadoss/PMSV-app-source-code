"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/",read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const packet=read(base+"data/rules/fssai-2026-10-12-thirtytwo-cereal-fruit-spice-identity-source-branches.json");
const ledger=read(base+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const core=read(base+"data/rules/contaminants-v9-core.json");
const index=read(base+"data/standard-search-index-v1.json").products,byId=new Map(index.map(x=>[x.id,x]));
test("32 source scope cases conserve 533 = 417+116, without any unsupported first-source promotion",()=>{
 assert.equal(packet.records.length,32);
 assert.deepEqual(packet.review_groups,{cereals:9,fruits:9,spice:3,source_exclusions:11});
 assert.equal(packet.current_catalogue,533);assert.equal(packet.current_partial,417);assert.equal(packet.current_pending,116);
 assert.equal(packet.first_source_promotions,0);assert.equal(packet.full_compliance_passes,0);
 assert.equal(packet.source_version,core.source_version);assert.equal(packet.official_contaminants_source,core.official_sources[0].url);
 const pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(pending.size,116);assert.equal(new Set(packet.records.map(x=>x.catalog_id)).size,32);
 for(const x of packet.records){
  assert.ok(pending.has(x.catalog_id));
  const p=byId.get(x.catalog_id);assert.ok(p);
  assert.equal(x.product_name,p.name);assert.equal(x.fssr,p.fssr);assert.equal(x.fcs,p.fcs);
  assert.equal(x.positive_finished_article_verified,false);assert.equal(x.unconditional_limit_application,false);
  assert.equal(x.analytical_lot_pass,false);assert.equal(x.complete_regulatory_pass,false);
  assert.ok(x.explicit_exclusion&&x.selectable_branches.length>=1);
  for(const b of x.selectable_branches){assert.ok(b.positive_proof.length&&b.not_automatically_applicable);}
 }
});
test("article numeric rows and key ingredient distinctions match official Version IX local source data",()=>{
 assert.equal(packet.source_article_rows.length,5);
 const byKey=new Map(packet.source_article_rows.map(x=>[x.key,x]));
 const cereal=byKey.get("cereal"),comp=byKey.get("composite");
 assert.equal(cereal.refs[0].limit,15);assert.equal(comp.refs[0].limit,20);
 assert.equal(cereal.refs[1].limit,10);assert.equal(comp.refs[1].limit,10);
 for(const x of packet.source_article_rows){
  for(const r of x.refs){
   const group=x.kind==="crop"?core.crop_contaminants[r.core_key]:core.naturally_occurring_toxic_substances[r.core_key];
   assert.ok(group);
   if(x.kind==="crop")assert.equal(group.unit,r.unit);
   const rows=x.kind==="crop"?group.rules:group;
   assert.equal(rows.filter(v=>v.article===x.article&&Number(v.limit)===r.limit&&(x.kind!=="nots"||v.unit===r.unit)).length,1);
  }
 }
 const custard=packet.records.find(x=>x.catalog_id==="06-06-2-custard-powder");
 assert.ok(custard.selectable_branches.some(b=>b.source_keys.includes("cassava")));
 const arrowroot=packet.records.find(x=>x.catalog_id==="06-06-2-arrowroot");
 assert.ok(!arrowroot.selectable_branches.some(b=>b.source_keys.includes("cassava")));
 assert.ok(packet.records.find(x=>x.catalog_id==="06-06-1-quinoa").explicit_exclusion.includes("excluded"));
});
test("live panel renders only review-only source candidates and is fail-closed on forged product or approval",()=>{
 const code=fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8");
 const ctx={console,esc:x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 ctx.contaminantsDb=core;ctx.pmsvCurrent533SourceLedger=ledger;ctx.pmsvCerealFruitSpiceSourceDb=packet;
 for(const x of packet.records){
  const p=byId.get(x.catalog_id),html=ctx.pmsvCerealFruitSpiceSourceHtml(p);
  assert.match(html,/Finished-food subtype: source article distinction/);
  assert.match(html,/NOT VERIFIED/);
  assert.match(html,/No source reference is automatically/);
  assert.doesNotMatch(html,/Regulatory compliance PASS granted/);
  assert.match(ctx.pmsvCerealFruitSpiceSourceHtml({...p,name:"UNRELATED TEST"}),/withheld/);
 }
 assert.equal(ctx.pmsvCerealFruitSpiceSourceHtml(byId.get("mineral-water")),"");
 const pasta=byId.get("06-06-4-macaroni-products-pasta-products");
 ctx.pmsvCerealFruitSpiceChoices[pasta.id]="cereal_product_source_scope_UNVERIFIED";
 assert.match(ctx.pmsvCerealFruitSpiceSourceHtml(pasta),/15 µg\/kg/);
 assert.match(ctx.pmsvCerealFruitSpiceSourceHtml(pasta),/OFFICIAL REFERENCE NOT APPLIED/);
 ctx.pmsvCerealFruitSpiceChoices[pasta.id]="INVALID";assert.match(ctx.pmsvCerealFruitSpiceSourceHtml(pasta),/subtype withheld/);
 const altered=structuredClone(packet);altered.records[0].complete_regulatory_pass=true;
 ctx.pmsvCerealFruitSpiceSourceDb=altered;
 assert.match(ctx.pmsvCerealFruitSpiceSourceHtml(byId.get(altered.records[0].catalog_id)),/withheld/);
});
test("index cache-bust, script, data and scheduled verifier agree",()=>{
 const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 assert.match(html,/fssai-source-proof-panels\.js\?v=20261012-sourceintegrity/);
 const js=fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8");
 assert.match(js,/fssai-2026-10-12-thirtytwo-cereal-fruit-spice-identity-source-branches\.json/);
});
