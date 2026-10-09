"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const dataRoot = path.resolve(__dirname,"../fssai-product-helper-preview-01/data");
const chapter = JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/chapter-2-3-fruit-vegetable-v1.json"),"utf8"));
const index = JSON.parse(fs.readFileSync(path.join(dataRoot,"standard-search-index-v1.json"),"utf8"));
const records=new Map(chapter.standards.map(row=>[row.key,row]));
const keys=["2.3.8","2.3.9","2.3.10","2.3.11","2.3.12","2.3.13","2.3.14","2.3.15","2.3.17","2.3.18","2.3.19","2.3.21","2.3.22","2.3.23","2.3.24","2.3.25","2.3.26","2.3.27","2.3.28","2.3.29","2.3.30"];
const get = key => {const r=records.get(key);assert.ok(r, "Missing "+key);return r;};
const metric=(key,parameter)=>get(key).composition.find(r=>r.parameter===parameter);
test("twenty-one known partial standards now have source-pinned numeric baselines",()=>{
 for(const key of keys){
  const r=get(key);
  assert.equal(r.full_compliance_assessment_enabled,false,key);
  assert.equal(r.numeric_evidence.compliance_assessment_enabled,false,key);
  assert.match(r.numeric_evidence.review_status,/current_amendments_not_reconciled/,key);
  assert.match(r.numeric_evidence.source_url,/^https:\/\/(www\.)?fssai\.gov\.in\//,key);
  assert.ok(r.numeric_evidence.source_pdf_pages.length,key);
  assert.ok(r.composition?.some(x=>Number.isFinite(x.value))||
    r.variant_composition?.some(x=>x.composition.some(c=>Number.isFinite(c.value)))||
    r.relative_composition?.some(x=>Number.isFinite(x.value)),key);
  for(const x of [...(r.composition||[]),...(r.variant_composition||[]).flatMap(v=>v.composition),...(r.relative_composition||[])]){
    assert.ok(Number.isFinite(x.value),key+" "+x.parameter);
    assert.ok([">=","<="].includes(x.operator),key+" "+x.parameter);
    assert.ok(x.unit,key+" "+x.parameter);
  }
 }
 const partial=index.products.filter(x=>x.chapter_rule_scope==="identity_only_partial");
 assert.equal(partial.length,84,"Existing identity-only catalogue count changed; update review backlog");
 for(const key of keys) assert.ok(partial.some(p=>p.rule_key===key),key+" should remain partial until full verification");
});
test("tomato juice composition and packaging rules are not conflated",()=>{
 assert.equal(metric("2.3.8","pH").value,4.5);
 assert.equal(metric("2.3.8","Sugar content as invert sugar").value,42);
 assert.equal(metric("2.3.8","Total soluble solids (exclusive of salt)").value,5);
 assert.equal(metric("2.3.8","Sodium chloride").value,3);
 assert.equal(metric("2.3.8","Mineral impurities (dry weight, after subtracting common salt)").value,0.1);
 assert.ok(!get("2.3.8").composition.some(x=>/head space|container fill/i.test(x.parameter)));
 assert.ok(get("2.3.8").packaging_requirements.every(x=>x.applies_when),"Packaging qualifiers required");
});
test("fruit nectars retain fruit-specific minima rather than generic 20 percent",()=>{
 const nectar=get("2.3.9");
 assert.equal(metric("2.3.9","Acidity as citric acid").value,1.5);
 assert.ok(!nectar.composition.some(x=>x.parameter==="Fruit juice content"),"Variant fruit content must not be universal");
 const values=Object.fromEntries(nectar.variant_composition.map(v=>[v.variant.toLowerCase(),v.composition[0].value]));
 assert.equal(values["orange nectar"],40);
 assert.equal(values["pineapple nectar"],40);
 assert.equal(values["mango nectar"],20);
 assert.equal(values["mixed fruit nectar"],20);
 assert.equal(Object.keys(values).length,12);
});
test("RTS juice minimum is variant gated",()=>{
 const drink=get("2.3.10");
 assert.equal(drink.composition?.length||0,0,"Never show generic minimum without variant");
 assert.equal(drink.variant_composition.length,2);
 assert.equal(drink.variant_composition[0].composition[0].value,5);
 assert.equal(drink.variant_composition[1].composition[0].value,10);
});
test("soup powders, fruit bars and syrup numerical baselines are correct",()=>{
 assert.equal(metric("2.3.15","Moisture").value,5);
 assert.equal(metric("2.3.15","Total soluble solids on dilution to ready-to-serve basis").value,5);
 assert.equal(metric("2.3.19","Moisture").value,20);
 assert.equal(metric("2.3.19","Total soluble solids").value,75);
 assert.equal(metric("2.3.19","Fruit content").value,25);
 assert.equal(metric("2.3.23","Total soluble solids").value,30);
 assert.equal(metric("2.3.24","Total soluble solids").value,65);
});

test("tomato puree/paste and tamarind are variant gated",()=>{
 const paste=get("2.3.14");
 assert.ok(paste.variant_resolution_required);
 assert.equal(paste.composition?.length||0,0);
 assert.deepEqual(paste.variant_composition.map(x=>x.composition[0].value),[9,25]);
 const tamarind=get("2.3.18");
 assert.ok(tamarind.variant_resolution_required);
 assert.equal(tamarind.composition?.length||0,0);
 assert.deepEqual(tamarind.variant_composition.map(x=>x.composition.map(y=>y.value)),[[32,4.5,0.4],[65,9,0.8]]);
});
test("2.3.17 requires actual reference juice solids and not a universal threshold",()=>{
 const product=get("2.3.17");
 assert.equal(product.composition?.length||0,0);
 assert.ok(product.reference_material_measurement_required);
 assert.deepEqual(product.relative_composition[0].reference_standard_keys,["2.3.6","2.3.7"]);
 assert.equal(product.relative_composition[0].value,2);
 assert.ok(product.relative_composition[0].requires_original_product_measurement);
});
test("squash, crush, fruit syrup, cordial, barley water keep distinct minima",()=>{
 const product=get("2.3.21");
 assert.ok(product.variant_resolution_required);
 assert.equal(product.composition?.length||0,0);
 const expected=[
  [25,40,3.5],[25,55,3.5],[25,65,3.5],[25,30,3.5],[25,30,2.5,0.25]
 ];
 assert.deepEqual(product.variant_composition.map(x=>x.composition.map(y=>y.value)),expected);
 assert.equal(get("2.3.22").composition[0].value,30);
});

test("mango versus other fruit pulp: sweetening and acidity are not shared universally",()=>{
 const mango=get("2.3.11"),other=get("2.3.12");
 assert.equal(mango.variant_resolution_required,true);
 assert.equal(mango.composition?.length||0,0);
 assert.deepEqual(mango.variant_composition.map(v=>v.composition[0].value),[15,12]);
 const specialAcid=mango.conditional_requirements.find(v=>v.parameter==="Acidity as citric acid");
 assert.equal(specialAcid.value,0.3);
 assert.match(specialAcid.condition,/sweetened canned mango/i);
 assert.equal(specialAcid.auto_evaluate,false);
 assert.equal(metric("2.3.12","Total soluble solids excluding added sugar").value,6);
 assert.equal(metric("2.3.12","Acidity as citric acid").value,0.3);
 for(const record of [mango,other]){
  const sweeteners=record.conditional_requirements.find(x=>x.parameter==="Added nutritive sweeteners");
  assert.equal(sweeteners.value,50);
  assert.equal(sweeteners.unit,"g/kg");
  assert.equal(sweeteners.auto_evaluate,false);
 }
});
test("concentrate is two times original solids, with source identity input required",()=>{
 const r=get("2.3.13");
 assert.equal(r.reference_material_measurement_required,true);
 assert.equal(r.composition?.length||0,0);
 assert.deepEqual(r.relative_composition[0].reference_standard_keys,["2.3.6","2.3.7"]);
 assert.equal(r.relative_composition[0].value,2);
 assert.equal(r.relative_composition[0].auto_evaluate,false);
});
test("industrial preserved juice/pulp 2.3.16 is source-reviewed but no fabricated numeric composition",()=>{
 const r=get("2.3.16");
 assert.equal(r.full_compliance_assessment_enabled,false);
 assert.equal(r.numeric_evidence,undefined);
 assert.ok(!r.composition?.length);
 assert.equal(r.packaging_requirements[0].value,90);
 assert.match(r.packaging_requirements[0].condition,/rigid/i);
 assert.match(r.source_review.scope,/no clause-wide numeric composition standard/i);
});
test("Murabba, candy and ketchup have separate correctly based minima",()=>{
 assert.deepEqual(get("2.3.25").composition.map(x=>x.value),[65,55]);
 assert.deepEqual(get("2.3.26").composition.map(x=>x.value),[70,25]);
 assert.match(get("2.3.26").composition[1].unit,/total sugar/);
 assert.deepEqual(get("2.3.27").composition.map(x=>x.value),[25,0.2]);
 assert.match(get("2.3.27").composition[0].parameter,/salt-free/);
});
test("2.3.28 culinary sauce variant table is catalogue-id-specific and fail-closed",()=>{
 const r=get("2.3.28");
 assert.equal(r.variant_resolution_required,true);
 assert.equal(r.composition?.length||0,0);
 assert.deepEqual(r.variant_composition.map(x=>x.composition.map(z=>z.value)),
 [[8,1],[15,1.2],[8,1],[3,1]]);
 const ids=r.variant_composition.flatMap(x=>x.catalog_product_ids);
 const actual=index.products.filter(x=>x.rule_key==="2.3.28");
 assert.equal(actual.length,5);
 assert.equal(ids.length,5);
 assert.deepEqual(new Set(ids),new Set(actual.map(p=>p.id)));
 assert.ok(r.quality_rules.some(x=>x.includes("no other added")));
});
test("soybean sauce and alternative carbonated fruit drinks are not conflated",()=>{
 const soy=get("2.3.29");
 assert.deepEqual(soy.composition.map(x=>x.value),[15,0.6,1]);
 const fruit=get("2.3.30");
 assert.equal(fruit.composition?.length||0,0);
 assert.deepEqual(fruit.variant_composition.map(x=>x.composition[0].value),[5,10]);
 const other=fruit.conditional_requirements[0];
 assert.equal(other.auto_evaluate,false);
 assert.equal(other.fruit_juice_content_declaration,true);
 assert.equal(other.total_soluble_solids_requirement_not_applicable,true);
 assert.equal(other.required_name,"carbonated beverages with fruit juice");
});
test("rigid-container fill never becomes an unconditional finished food composition limit",()=>{
 for(const key of ["2.3.11","2.3.12","2.3.13","2.3.16","2.3.25","2.3.27","2.3.28","2.3.29","2.3.30"]){
  const r=get(key);
  assert.ok(r.packaging_requirements?.length>0,key);
  assert.match(r.packaging_requirements[0].condition,/rigid containers/i);
  assert.ok(!(r.composition||[]).some(x=>x.parameter==="Rigid-container fill"),key);
 }
});
