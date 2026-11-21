"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const rules=JSON.parse(fs.readFileSync(path.join(__dirname,"../fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json"),"utf8"));
const records=new Map(rules.standards.map(x=>[x.key,x]));
const keys=["2.4.5(2)","2.4.13(1)","2.4.13(2)","2.4.13(3)","2.4.13(4)","2.4.13(5)","2.4.16(2)","2.4.31","2.4.32"];
const get=k=>{assert.ok(records.has(k),"Missing standard "+k);return records.get(k);};
const find=(key,parameter)=>get(key).composition.find(x=>x.parameter===parameter);
test("all nine numerical baselines are source-pinned and remain fail-closed",()=>{
 for(const key of keys){
  const r=get(key);
  assert.equal(r.full_compliance_assessment_enabled,false,key);
  assert.equal(r.numeric_evidence.compliance_assessment_enabled,false,key);
  assert.equal(r.numeric_evidence.source_url,"https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf");
  assert.equal(r.numeric_evidence.source_version,"FSSAI Chapter 2.4 Version 4 (07.05.2025)");
  assert.match(r.numeric_evidence.review_status,/amendments_not_reconciled/);
  assert.ok(r.numeric_evidence.source_pdf_pages.length>0);
  assert.ok(r.composition.length>=4);
  for(const line of r.composition){
   assert.ok(line.parameter && line.unit);
   if(line.operator==="range")assert.ok(Number.isFinite(line.min)&&Number.isFinite(line.max)&&line.max>=line.min);
   else if(["<=",">=","<",">","="].includes(line.operator)){assert.ok(Number.isFinite(line.value));}
   else {assert.equal(line.automatic_comparison_allowed,false);assert.ok(line.value !== undefined || line.source_question || line.interpretation_status);}
  }
 }
});
test("solvent extracted oilseed flour compositions are distinct; microbiology and hexane retained",()=>{
 const expectations=[
 ["2.4.13(1)",9,7.2,0.4,48,4.2,1.5],
 ["2.4.13(2)",8,5,0.38,48,5,1.5],
 ["2.4.13(3)",9,6,0.15,47,6,1.5],
 ["2.4.13(4)",9,6,0.35,22,9,1.5],
 ["2.4.13(5)",8,5,0.35,47,5,1.5]
 ];
 for(const [key,mo,ash,ins,protein,fibre,fat] of expectations){
  assert.deepEqual(["Moisture","Total ash","Ash insoluble in dilute HCl","Protein (N x 6.25)","Crude fibre","Fat"].map(k=>find(key,k).value),[mo,ash,ins,protein,fibre,fat],key);
  const rec=get(key);
  assert.equal(rec.residual_solvent_limits[0].value,10);
  assert.equal(rec.chapter_specific_microbiology[0].value,50000);
  assert.equal(rec.chapter_specific_microbiology[1].value,10);
  assert.equal(rec.chapter_specific_microbiology[2].operator,"absent");
  assert.equal(rec.chapter_specific_microbiology[2].sample_size,25);
 }
 assert.equal(find("2.4.13(3)","Oxalic acid").value,0.5);
 assert.equal(find("2.4.13(5)","Available lysine").value,3.6);
 assert.equal(find("2.4.13(5)","Free gossypol").value,0.06);
 assert.equal(find("2.4.13(5)","Total gossypol").value,1.2);
});
test("groundnut expeller pressed is not classified as solvent extracted",()=>{
 const exp=get("2.4.16(2)");
 assert.equal(find("2.4.16(2)","Protein (N x 6.25)").value,45);
 assert.equal(find("2.4.16(2)","Fat").value,9);
 assert.equal(exp.residual_solvent_limits,undefined);
 assert.equal(exp.chapter_specific_microbiology,undefined);
 assert.equal(exp.conditional_requirements[0].auto_evaluate,false);
 assert.equal(get("2.4.13(2)").composition.find(x=>x.parameter==="Fat").value,1.5);
});
test("wholemeal barley standards must not borrow barley powder limits",()=>{
 const r=get("2.4.5(2)");
 assert.deepEqual(r.composition.map(x=>x.value),[14,3,0.5,0.17]);
});
test("Gari acidity and sieve variants not misapplied to cassava flour",()=>{
 const gari=get("2.4.31"),flour=get("2.4.32");
 const acid=find("2.4.31","Total acidity as lactic acid");
 assert.deepEqual([acid.min,acid.max],[0.6,1]);
 assert.equal(find("2.4.31","Moisture").value,12);
 assert.equal(find("2.4.32","Moisture").value,13);
 assert.equal(flour.composition.some(x=>x.parameter==="Total acidity as lactic acid"),false);
 assert.equal(gari.variant_composition.length,4);
 assert.equal(flour.variant_composition.length,2);
 for(const r of [gari,flour]) {
  assert.equal(r.variant_resolution_required,true);
  assert.ok(r.variant_composition.every(x=>x.variant&&x.sieve_rules.length));
  assert.ok(r.variant_composition.every(x=>x.sieve_rules.every(z=>[">=","<="].includes(z.operator)&&Number.isFinite(z.sieve_mm))));
 }
 assert.equal(flour.conditional_requirements[0].auto_evaluate,false);
});


test("six Chapter 2.4 grain identities resolve to exact source-verified subclauses without changing FoSCoS FSSR",()=>{
 const index=JSON.parse(fs.readFileSync(path.join(__dirname,"../fssai-product-helper-preview-01/data/standard-search-index-v1.json"),"utf8")).products;
 const expectations=[
  ["06-06-1-oats","Oats","2.4.6","2.4.6(17)",[["Moisture","<=",14,"%"],["Test weight",">=",46,"kg/hl"],["Ergot (Claviceps purpurea)","<=",0.05,"%"]]],
  ["06-06-1-quinoa","Quinoa","2.4.6","2.4.6(18)",[["Moisture","<=",12,"%"],["Saponin","<=",0.1,"%"],["Other edible grains","<=",0.5,"%"]]],
  ["06-06-1-durum-wheat","Durum Wheat","2.4.6","2.4.6(19)",[["Moisture","<=",13,"%"],["Protein",">=",11,"%"],["Beta carotene",">=",5,"ppm"],["Test weight",">=",70,"kg/hl"]]],
  ["06-06-1-pulses","Pulses","2.4.6(22)","2.4.6(22)",[["Foreign / extraneous matter","<=",1,"%"]]],
  ["06-06-1-millets","Millets","2.4.6(23)","2.4.6(23)",[["Moisture","<=",13,"%"]]],
  ["06-06-1-rice","Rice","2.4.6","2.4.6(24)",[]]
 ];
 for(const [id,name,fssr,key,checks] of expectations){
  const product=index.find(x=>x.id===id);assert.ok(product,id);
  assert.equal(product.name,name);assert.equal(product.fssr,fssr,"Do not rewrite the original FoSCoS FSSR");
  assert.equal(product.rule_key,key,id);assert.equal(product.source_content_review_batch,"CEREALS_R3_2026_11_02");
  assert.equal(get("2.4.6").composition.length,0,"Parent must not supply blanket numeric limits");
  const standard=get(key);assert.ok(standard && standard.status==="structured_core"||standard && standard.status==="source_exact_specific_clause_linked_parent_fssr");
  for(const [parameter,operator,value,unit] of checks){
   const item=standard.composition.find(x=>x.parameter===parameter);
   assert.ok(item,id+": "+parameter);assert.deepEqual([item.operator,item.value,item.unit],[operator,value,unit]);
  }
 }
 for(const id of ["06-06-1-chia-seeds","06-06-1-triticale"]){
  assert.equal(index.find(x=>x.id===id)?.rule_key,id.includes("chia")?"2.4.6(25)":"2.4.6(28)","Use the reviewed exact foodgrain subclause "+id);
 }
 for(const k of ["2.4.6(17)","2.4.6(18)","2.4.6(19)"]){
  const st=get(k);assert.equal(st.full_compliance_assessment_enabled,false);
  assert.equal(st.numeric_evidence.compliance_assessment_enabled,false);
  assert.match(st.numeric_evidence.review_status,/amendments_not_fully_reconciled/);
  assert.equal(st.official_source_url,"https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf");
 }
 const oats=get("2.4.6(17)");assert.equal(oats.composition.length,12);
 const quinoa=get("2.4.6(18)");assert.equal(quinoa.composition.length,8);
 const durum=get("2.4.6(19)");assert.equal(durum.composition.length,13);
 const raw=get("2.4.6(16)");assert.equal(index.find(x=>x.id==="06-06-1-unprocessed-whole-raw-pulses-not-for-direct-human-consumption")?.rule_key,raw.key);
});


test("residual Any other foodgrains uses exact 2.4.6(15) source limits without covering named grains or unrelated seeds",()=>{
 const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,"../fssai-product-helper-preview-01/data/standard-search-index-v1.json"),"utf8")).products;
 const p=catalog.find(x=>x.id==="06-06-1-any-other-foodgrains");
 assert.equal(p.fssr,"2.4.6");assert.equal(p.rule_key,"2.4.6(15)");
 assert.equal(p.source_content_review_batch,"CEREALS_R3_2026_11_02");
 assert.equal(p.linked_rule_keys,undefined);
 const st=get("2.4.6(15)");
 assert.equal(st.full_compliance_assessment_enabled,false);
 assert.equal(st.numeric_evidence.compliance_assessment_enabled,false);
 assert.equal(st.official_source_url,"https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf");
 assert.deepEqual(st.numeric_evidence.source_pdf_pages,[10]);
 assert.deepEqual(st.composition.map(x=>[x.parameter,x.value,x.operator]),[
  ["Moisture",16,"<="],["Foreign / extraneous matter",1,"<="],
  ["Mineral matter within foreign matter",0.25,"<="],["Animal-origin impurities within foreign matter",0.1,"<="],
  ["Other edible grains",6,"<="],["Damaged grains",5,"<="],["Weevilled grains",10,"<="],
  ["Uric acid",100,"<="],["Combined foreign matter + other edible grains + damaged grains",12,"<="]
 ]);
 for(const id of ["06-06-1-chia-seeds","06-06-1-triticale","06-06-1-wheat","06-06-1-maize","06-06-1-rice","06-06-1-quinoa","06-06-1-oats","06-06-1-durum-wheat"]){
  const r=catalog.find(x=>x.id===id);
  assert.ok(r,id);
  assert.notEqual(r.rule_key,"2.4.6(15)","Unsafe residual grain standard inheritance for "+id);
 }
});
