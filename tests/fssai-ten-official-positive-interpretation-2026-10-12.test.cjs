"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=read(base+"data/rules/fssai-ten-official-positive-interpretation-2026-10-12.json");
const ledger=read(base+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const work=read(base+"data/rules/fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const ch3=read(base+"data/rules/chapter-3-substances-added-v1.json"),ch22=read(base+"data/rules/chapter-2-2-fats-oils-v1.json");
const core=read(base+"data/rules/contaminants-v9-core.json");
const cat=read(base+"data/standard-search-index-v1.json").products;
const ix=new Map(cat.map(x=>[x.id,x]));
function env(){
 const c={console,esc:x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,'&quot;')};
 vm.createContext(c);
 vm.runInContext(fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8"),c);
 vm.runInContext(fs.readFileSync(path.join(root,base+"fssai-ten-official-positive-interpretation.js"),"utf8"),c);
 c.contaminantsDb=JSON.parse(JSON.stringify(core));
 c.chapterRuleDbs=[JSON.parse(JSON.stringify(ch3)),JSON.parse(JSON.stringify(ch22))];
 c.pmsvCurrent533SourceLedger=JSON.parse(JSON.stringify(ledger));
 c.pmsvTenOfficialScope=JSON.parse(JSON.stringify(manifest));
 return c;
}
test("All ten remain pending; eight dairy analogue FoSCoS routes recognize FSSAI FAQ Q7 corresponding safety standards",()=>{
 assert.equal(manifest.records.length,10);assert.deepEqual(manifest.group_counts,{analogues:8,tartaric:1,fatspread:1});
 assert.equal(manifest.promotions,0);assert.equal(manifest.full_approvals,0);assert.equal(ledger.partial_exact,417);assert.equal(ledger.first_source_pending,116);
 const a=manifest.records.filter(x=>x.kind==="corresponding_dairy_analogue_safety");
 assert.equal(a.length,8);assert.equal(new Set(a.map(x=>x.fcs)).size,8);
 for(const x of a){assert.equal(x.faq_question,7);assert.equal(x.numeric_auto_apply,false);assert.ok(x.source_url.includes("FAQs_Diary_12_07_2022.pdf"));assert.ok(ix.has(x.catalog_id));
  assert.match(work.records.find(w=>w.catalog_id===x.catalog_id).forbidden_transfer,/FAQ Q7/);}
 const c=env();assert.equal(c.pmsvTenOfficialScopeValid(c.pmsvTenOfficialScope),true);
 for(const x of a)assert.match(c.pmsvTenOfficialScopeHtml(ix.get(x.catalog_id)),/FAQ Q7/);
});
test("L(+) INS 334 CAS 87-69-4 and lead 2 / arsenic 3 are independently source-locked, not inherited by DL",()=>{
 const c=env(),t=manifest.records.find(x=>x.kind==="stereoisomer_tartaric"),p=ix.get(t.catalog_id);
 assert.equal(t.cas,"87-69-4");assert.equal(t.ins,"334");
 assert.match(c.pmsvTenOfficialScopeHtml(p),/Numeric article NOT APPLIED/);
 c.pmsvTenTartaricIsomer="l_plus_reported";
 assert.match(c.pmsvTenOfficialScopeHtml(p),/Lead 2 mg\/kg, Arsenic 3 mg\/kg/);
 assert.match(c.pmsvTenOfficialScopeHtml(p),/NOT APPLIED/);
 c.pmsvTenTartaricIsomer="other_isomer";assert.match(c.pmsvTenOfficialScopeHtml(p),/NOT APPLIED/);
});
test("Fat Spread 40-80 percent is distinct from Minarine and process-conditional Nickel",()=>{
 const c=env(),p=ix.get("02-02-2-fat-spread");
 assert.equal(c.pmsvTenOfficialScopeValid(c.pmsvTenOfficialScope),true);
 assert.match(c.pmsvTenOfficialScopeHtml(p),/40–80%/);
 assert.match(c.pmsvTenOfficialScopeHtml(p),/Nickel 1.5 mg\/kg/);
 assert.match(c.pmsvTenOfficialScopeHtml(p),/No numeric limit applied/);
});
test("identity tampering, source numeric drift, forged approval and fake FAQ URLs fail closed",()=>{
 const modifiers=[
 c=>c.pmsvTenOfficialScope.records[0].product_name="milk",
 c=>c.pmsvTenOfficialScope.records[0].lab_pass=true,
 c=>c.pmsvTenOfficialScope.records[8].cas="123",
 c=>c.pmsvTenOfficialScope.source_rows[0].limit=99,
 c=>c.contaminantsDb.metal_article_rules_v9.Lead.find(x=>x.article==="L (+) -Tartaric acid").limit=99,
 c=>c.pmsvTenOfficialScope.sources.faq="https://fake.invalid/faq.pdf",
 c=>c.chapterRuleDbs[0].identity_purity_standards.find(x=>x.key==="3.2.10(4)").identity.ins="other"
 ];
 for(const mutate of modifiers){const c=env();mutate(c);assert.equal(c.pmsvTenOfficialScopeValid(c.pmsvTenOfficialScope),false);
  assert.match(c.pmsvTenOfficialScopeHtml(ix.get(manifest.records[0].catalog_id)),/withheld/);}
});
test("All other 523 product routes are untouched and Helper imports distinct ten-case source file",()=>{
 const c=env(),ids=new Set(manifest.records.map(x=>x.catalog_id));
 assert.equal(cat.length,533);
 for(const p of cat.filter(x=>!ids.has(x.id)))assert.equal(c.pmsvTenOfficialScopeHtml(p),"");
 const h=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 assert.match(h,/fssai-ten-official-positive-interpretation\.js\?v=20261012-official10/);
});
