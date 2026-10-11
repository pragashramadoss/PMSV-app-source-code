"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const load=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
const dir="fssai-product-helper-preview-01/data/rules/";
const m=load(dir+"fssai-next121-positive-subtype-proof-2026-10-11.json"),core=load(dir+"contaminants-v9-core.json");
const norm=s=>String(s??"").toLowerCase().replace(/[^a-z0-9]+/g,"");
function match(r,db=core){
 if(r.type==="metal")return (db.metal_article_rules_v9[r.analyte]||[]).filter(x=>
   x.row_type==="exact"&&x.limit===r.limit&&x.unit===r.unit&&(norm(x.article)===norm(r.article)||
    r.id==="lead-packaged-water"&&norm(x.article).startsWith(norm(r.article))));
 if(r.type==="crop"){
  const code=r.id==="aflatoxin-b1-composite"?"aflatoxin_b1":"total_aflatoxins";
  return (db.crop_contaminants[code]?.rules||[]).filter(x=>norm(x.article)===norm(r.article)&&Number(x.limit)===r.limit&&db.crop_contaminants[code].unit===r.unit);
 }
 if(r.type==="nots")return (db.naturally_occurring_toxic_substances.agaric_acid||[]).filter(x=>norm(x.article)===norm(r.article)&&Number(x.limit)===r.limit&&x.unit===r.unit);
 if(r.type==="pesticide")return (db.residue_mrls.pesticides||[]).filter(x=>norm(x.name)===norm(r.analyte)).flatMap(x=>
   (x.rows||[]).filter(y=>norm(y.food)===norm(r.article)&&Number(y.mrl)===r.limit&&y.unit===r.unit));
 throw new Error("Unknown article type "+r.type);
}
test("20 independently source-pinned Version IX articles agree with the locally loaded official source tables",()=>{
 assert.equal(core.source_version,"Version IX (03.02.2026)");
 assert.equal(m.verified_source_rows.length,20);
 assert.equal(m.official_contaminants_url,core.official_sources[0].url);
 for(const r of m.verified_source_rows){
  assert.equal(r.official_source,m.official_contaminants_url);
  assert.equal(r.automatic_finished_product_application,false);
  assert.equal(r.laboratory_compliance_pass,false);
  assert.equal(match(r).length,1,r.id+" source row mismatch");
 }
});
test("Wrong official analytes, units, names or quantities cannot silently pass a copied article",()=>{
 for(const r of m.verified_source_rows){
  assert.equal(match({...r,limit:r.limit+1}).length,0,r.id+" limit");
  assert.equal(match({...r,article:"Not a real article of food"}).length,0,r.id+" article");
  assert.equal(match({...r,unit:"g/L"}).length,0,r.id+" unit");
 }
});
test("FSSAI official full Nickel article, optical L(+) isomer and special sampling bases preserved",()=>{
 const x=id=>m.verified_source_rows.find(y=>y.id===id);
 assert.match(x("nickel-hydrogenated-fat").article,/partially hydrogenated soyabean oil/i);
 assert.match(x("nickel-hydrogenated-fat").article,/bakery shortening, fat spread and partially hydrogenated margarine/i);
 assert.match(x("lead-tartaric").basis,/L\(\+\) optical isomer/);
 assert.match(x("arsenic-tartaric").basis,/L\(\+\) optical isomer/);
 assert.equal(x("lead-packaged-water").unit,"mg/L");
 for(const p of m.records){assert.equal(p.source_references_auto_applied,false);assert.equal(p.lab_compliance_pass,false);}
});
