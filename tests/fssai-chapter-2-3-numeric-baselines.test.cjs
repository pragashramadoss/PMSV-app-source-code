"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const dataRoot = path.resolve(__dirname,"../fssai-product-helper-preview-01/data");
const chapter = JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/chapter-2-3-fruit-vegetable-v1.json"),"utf8"));
const index = JSON.parse(fs.readFileSync(path.join(dataRoot,"standard-search-index-v1.json"),"utf8"));
const records=new Map(chapter.standards.map(row=>[row.key,row]));
const keys=["2.3.8","2.3.9","2.3.10","2.3.11","2.3.12","2.3.13","2.3.14","2.3.15","2.3.17","2.3.18","2.3.19","2.3.21","2.3.22","2.3.23","2.3.24","2.3.25","2.3.26","2.3.27","2.3.28","2.3.29","2.3.30","2.3.42","2.3.43","2.3.47(7)","2.3.47(8)","2.3.49","2.3.54","2.3.55","2.3.56","2.3.62","2.3.63","2.3.64","2.3.65","2.3.47(4)","2.3.47(5)","2.3.46","2.3.51","2.3.52","2.3.58","2.3.60","2.3.47(1)","2.3.47(2)","2.3.47(3)","2.3.47(6)","2.3.53","2.3.44","2.3.3A","2.3.5"];
const get = key => {const r=records.get(key);assert.ok(r, "Missing "+key);return r;};
const metric=(key,parameter)=>get(key).composition.find(r=>r.parameter===parameter);
test("forty-eight known partial standards now have source-pinned numeric baselines",()=>{
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
    if(x.operator==="range")assert.ok(Number.isFinite(x.min)&&Number.isFinite(x.max)&&x.min<=x.max,key+" "+x.parameter);
    else assert.ok(Number.isFinite(x.value),key+" "+x.parameter);
    assert.ok([">=","<=","range"].includes(x.operator),key+" "+x.parameter);
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

test("mango chutney preserves five independent official numeric requirements",()=>{
 const r=get("2.3.42");
 assert.deepEqual(r.composition.map(x=>x.value),[50,40,4.6,5,0.5]);
 assert.equal(r.composition[2].operator,"<=");
 assert.equal(r.composition[2].unit,"pH");
 assert.equal(r.packaging_requirements[0].value,90);
 assert.match(r.packaging_requirements[0].condition,/rigid/i);
});
test("pickle brine, citrus, vinegar and oil rules are medium gated",()=>{
 const r=get("2.3.43");
 assert.equal(r.variant_resolution_required,true);
 assert.equal(r.composition?.length||0,0);
 assert.deepEqual(r.variant_composition.map(x=>x.variant),[
 "Pickles in citrus juice","Pickles in brine","Pickles in oil","Pickles in vinegar","Pickles without a listed preserving medium"]);
 const byMedium=Object.fromEntries(r.variant_composition.map(x=>[x.medium,x]));
 assert.deepEqual(byMedium.citrus_juice.composition.map(x=>x.value),[60,1.2]);
 assert.deepEqual(byMedium.brine.composition.map(x=>x.value),[60,12]);
 assert.deepEqual(byMedium.oil.composition.map(x=>x.value),[60]);
 assert.match(byMedium.oil.additional_non_numeric_requirement,/submerged/);
 assert.deepEqual(byMedium.vinegar.composition.map(x=>x.value),[60,2]);
 assert.deepEqual(byMedium.other.composition,[]);
 assert.equal(byMedium.other.auto_evaluate,false);
 const ids=index.products.filter(x=>x.rule_key==="2.3.43");
 assert.equal(ids.length,3,"The three fruit, vegetable and mixed pickles use the same preserving-medium-gated standard");
});

test("cashew limits preserve whole-versus-pieces FFA gates and sub-defect limits",()=>{
 const x=get("2.3.47(7)");
 assert.deepEqual(x.variant_composition.map(v=>v.composition[0].value),[1.25,2]);
 assert.equal(x.variant_resolution_required,true);
 assert.equal(metric("2.3.47(7)","Moisture content").value,5);
 assert.equal(metric("2.3.47(7)","Peroxide value").value,10);
 assert.equal(metric("2.3.47(7)","Total tolerances").value,5);
 assert.equal(metric("2.3.47(7)","Foreign matter").value,0.05);
});
test("walnut composition and unit-specific damaged-unit limits are independent of cashew",()=>{
 const x=get("2.3.47(8)");
 assert.deepEqual(x.composition.map(v=>v.value),[5,0.1,1,0.1,4,1.25]);
 assert.equal(x.variant_composition,undefined);
 assert.equal(x.full_compliance_assessment_enabled,false);
});
test("seedless tamarind and cocoa beans have their own numerically defined matrices",()=>{
 assert.deepEqual(get("2.3.49").composition.map(v=>v.value),[20,5,6,1,9,0.5]);
 assert.deepEqual(get("2.3.54").composition.map(v=>v.value),[8,4,8,2,4]);
 assert.match(get("2.3.54").composition[1].unit,/by count/);
});
test("arecanut and date paste are not interchangeable and date paste prohibits additives",()=>{
 assert.deepEqual(get("2.3.55").composition.map(v=>v.value),[7,12,3]);
 assert.deepEqual(get("2.3.56").composition.map(v=>v.value),[20,1.2,0.1]);
 const date=get("2.3.56");
 assert.equal(date.permitted_additives_policy.permitted,false);
 assert.equal(date.permitted_additives_policy.automatic_compliance_pass,false);
 assert.match(date.permitted_additives_policy.source_rule,/No additives are allowed/);
 assert.ok(date.quality_rules.some(x=>/No food additives allowed/i.test(x)));
 assert.equal(date.full_compliance_assessment_enabled,false);
});

test("all 10 FoSCoS fungi identities map to their own Chapter 2.3.62 variant ranges",()=>{
 const x=get("2.3.62"),related=index.products.filter(p=>p.rule_key==="2.3.62");
 assert.equal(related.length,10);
 assert.equal(x.variant_resolution_required,true);
 assert.equal(x.composition?.length||0,0);
 const covered=new Set(x.variant_composition.flatMap(v=>v.catalog_product_ids||[]));
 assert.deepEqual(covered,new Set(related.map(p=>p.id)));
 assert.equal(x.variant_composition.length,14);
 const forId=id=>x.variant_composition.filter(v=>v.catalog_product_ids?.includes(id));
 assert.equal(forId("04-04-2-quick-frozen-fungi").length,1);
 assert.equal(forId("04-04-2-dried-fungi").length,3);
 assert.equal(forId("04-04-2-fungi-grits-and-fungi-powder").length,2);
 assert.equal(forId("04-04-2-fungi-extract-and-fungi-concentrate").length,2);
 assert.equal(forId("04-04-2-pickled-fungi").length,1);
 const quick=forId("04-04-2-quick-frozen-fungi")[0];
 assert.equal(quick.process_requirements[0].value,-18);
 assert.equal(quick.process_requirements[0].auto_evaluate,false);
 assert.deepEqual(forId("04-04-2-dried-fungi").map(v=>v.composition[0].value),[6,12,13]);
 assert.deepEqual(forId("04-04-2-fungi-grits-and-fungi-powder").map(v=>v.composition[0].value),[13,9]);
 assert.deepEqual(forId("04-04-2-fungi-extract-and-fungi-concentrate").map(v=>v.composition[0].value),[7,24]);
 const salted=forId("04-04-2-salted-fungi-semi-processed-products")[0];
 assert.deepEqual([salted.composition[0].min,salted.composition[0].max],[15,18]);
 const fermented=forId("04-04-2-fermented-fungi")[0];
 assert.deepEqual([fermented.composition[1].min,fermented.composition[1].max],[3,6]);
});
test("coconut milk powder, singhara flour, and liquid/powder colouring foods are distinct",()=>{
 assert.deepEqual(get("2.3.63").composition.map(v=>v.value??[v.min,v.max]),[2.5,60,0.2,[0.3,0.45]]);
 assert.deepEqual(get("2.3.64").composition.map(v=>v.value),[12,0.18,0.5,9]);
 const uric=get("2.3.64").conditional_requirements[0];
 assert.equal(uric.auto_evaluate,false);
 assert.equal(uric.source_text,"100 mg/kg");
 assert.deepEqual(get("2.3.65").variant_composition.map(v=>v.composition.map(c=>c.value)),[[45,0.5,20],[90,1]]);
 assert.equal(get("2.3.65").variant_resolution_required,true);
});

test("dates and generic dry fruits have separate clause-level standards",()=>{
 assert.deepEqual(get("2.3.47(4)").composition.map(z=>z.value),[30,0.1,5,1]);
 assert.deepEqual(get("2.3.47(5)").composition.map(z=>z.value),[1,2,1.25]);
 assert.equal(get("2.3.47(4)").full_compliance_assessment_enabled,false);
});
test("brewed and synthetic vinegar never inherit the wrong solids or ash limits",()=>{
 const record=get("2.3.46");
 assert.ok(record.variant_resolution_required);
 assert.equal(record.composition?.length||0,0);
 assert.deepEqual(record.variant_composition.map(v=>v.composition.map(c=>c.value)),[[3.75,1.5,0.18],[3.75]]);
 assert.match(record.variant_composition[1].source_qualification,/SYNTHETIC/);
 assert.equal(record.packaging_requirements[0].value,90);
});
test("light coconut milk and coconut cream concentrate retain proper composition tables",()=>{
 const milk=get("2.3.51"),cream=get("2.3.52");
 assert.ok(milk.variant_resolution_required&&cream.variant_resolution_required);
 assert.deepEqual(milk.variant_composition.map(v=>v.composition[3].value),[5,10]);
 assert.deepEqual(cream.variant_composition.map(v=>v.composition[3].value),[20,29]);
 assert.deepEqual([milk.variant_composition[0].composition[1].min,milk.variant_composition[0].composition[1].max],[6.6,12.6]);
 assert.deepEqual([cream.variant_composition[0].composition[1].min,cream.variant_composition[0].composition[1].max],[25.4,37.3]);
 assert.equal(cream.variant_composition[1].composition[1].value,37.4);
 assert.equal(milk.composition?.length||0,0);
 assert.equal(cream.composition?.length||0,0);
});
test("Harissa has four correct limits and expressly disallows additives",()=>{
 const harissa=get("2.3.58");
 assert.deepEqual(harissa.composition.map(v=>v.value),[3.6,14,1.5,0.15]);
 assert.equal(harissa.permitted_additives_policy.permitted,false);
 assert.equal(harissa.permitted_additives_policy.automatic_compliance_pass,false);
 assert.ok(harissa.quality_rules.some(s=>s.includes("No food additives")));
});
test("quick-frozen fried potatoes retain fry limits and frozen strip qualifier",()=>{
 const x=get("2.3.60");
 assert.deepEqual(x.composition.map(z=>z.value),[78,1.5,0.5]);
 assert.equal(x.conditional_requirements[0].value,4);
 assert.equal(x.conditional_requirements[0].auto_evaluate,false);
});

test("groundnut, raisin and pistachio clauses do not inherit other nuts thresholds",()=>{
 assert.deepEqual(get("2.3.47(1)").composition.map(v=>v.value),[7,5]);
 assert.deepEqual(get("2.3.47(2)").composition.map(v=>v.value),[15,2,15]);
 assert.deepEqual(get("2.3.47(3)").composition.map(v=>v.value),[7,2,1]);
 assert.deepEqual(get("2.3.47(1)").prohibited_additive_classes,["Added colouring matter","Preservatives"]);
 assert.equal(get("2.3.47(1)").permitted_additives_policy,undefined,"Groundnut does not have a blanket ban on every additive");
});
test("almonds have independent limits, including 45% minimum oil and 10% total defect tolerance",()=>{
 const x=get("2.3.47(6)");
 assert.equal(metric("2.3.47(6)","Oil content").operator,">=");
 assert.equal(metric("2.3.47(6)","Oil content").value,45);
 assert.equal(metric("2.3.47(6)","Total tolerance of specified defective kernels").value,10);
 assert.equal(metric("2.3.47(6)","Acid insoluble ash"),undefined);
 assert.equal(metric("2.3.47(6)","Acid-insoluble ash").value,0.1);
});
test("preservative-dependent apricot moisture and grouped defect ceiling remain guarded",()=>{
 const x=get("2.3.53");
 assert.equal(x.variant_resolution_required,true);
 assert.deepEqual(x.variant_composition.map(v=>v.composition[0].value),[20,25]);
 assert.equal(x.composition?.length||0,0);
 assert.equal(x.conditional_requirements[0].value,15);
 assert.ok(x.conditional_requirements.every(v=>v.auto_evaluate===false));
});
test("table olive brine process and drained-weight style are two distinct applicability axes",()=>{
 const x=get("2.3.44");
 assert.equal(x.variant_resolution_required,true);
 assert.deepEqual(x.variant_composition.slice(0,2).map(v=>v.composition[0].value),[6,5]);
 assert.equal(x.variant_composition[2].composition[0].value,4.3);
 assert.deepEqual(x.conditional_requirements.map(v=>v.value),[50,40]);
 assert.ok(x.conditional_requirements.every(v=>v.auto_evaluate===false));
 assert.equal(x.packaging_requirements[0].value,90);
});
test("canned tomatoes keep conditional pack-media requirements distinct from drained weight",()=>{
 const x=get("2.3.3A");
 assert.equal(metric("2.3.3A","Drained weight").value,56);
 assert.equal(x.composition.length,1);
 assert.deepEqual(x.conditional_requirements.slice(0,4).map(v=>v.value),[3,0.045,0.08,4.5]);
 assert.ok(x.conditional_requirements.every(v=>v.auto_evaluate===false));
 assert.equal(x.packaging_requirements[0].value,7);
 assert.equal(x.packaging_requirements[2].value,90);
});
test("tomato soup must not use general vegetable-soup lower solids limit",()=>{
 const x=get("2.3.5");
 assert.equal(x.variant_resolution_required,true);
 assert.equal(x.composition?.length||0,0);
 assert.deepEqual(x.variant_composition.map(v=>v.composition[0].value),[7,5]);
});
test("all 84 former identity-only route entries now have an official-source baseline or explicit no-universal-limit review",()=>{
 const cereals=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/chapter-2-4-cereals-v1.json"),"utf8"));
 const all=new Map([...chapter.standards,...cereals.standards].map(x=>[x.key,x]));
 const partial=index.products.filter(p=>p.chapter_rule_scope==="identity_only_partial");
 assert.equal(partial.length,84);
 let numeric=0,scope=0;
 for(const p of partial){
  const s=all.get(p.rule_key);
  assert.ok(s,p.id+" no chapter rule");
  assert.equal(s.full_compliance_assessment_enabled,false,p.id);
  if(s.numeric_evidence){
   assert.equal(s.numeric_evidence.compliance_assessment_enabled,false,p.id);
   numeric++;
  }else{
   assert.ok(s.source_review?.scope,p.id+" lacks numeric baseline and scope review");
   scope++;
  }
 }
 assert.equal(numeric,80);
 assert.equal(scope,4);
});


test("all 98 Chapter 2.3 product identities have source-scoped fail-closed pesticide reviews",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const chapterProducts=index.products.filter(p=>String(p.fssr||"").startsWith("2.3."));
 const rows=db.chapter_2_3_commodity_mrl_review_v1;
 assert.equal(chapterProducts.length,98);
 assert.equal(rows.length,98);
 assert.deepEqual(new Set(rows.map(r=>r.catalog_id)),new Set(chapterProducts.map(p=>p.id)));
 const articles=new Map();
 for(const pesticide of db.residue_mrls.pesticides)for(const row of pesticide.rows||[]){
  const key=String(row.food).toLowerCase().trim();
  articles.set(key,(articles.get(key)||0)+1);
 }
 for(const row of rows){
  assert.deepEqual(row.candidate_finished_product_pesticide_articles,[],row.catalog_id);
  assert.equal(row.auto_apply_raw_ingredient_mrl,false,row.catalog_id);
  assert.equal(row.full_product_regulatory_approval,false,row.catalog_id);
  assert.ok(row.scope.length>15&&row.qualifier_review.length>100,row.catalog_id);
  assert.equal(row.raw_reference_rows_in_loaded_official_source,row.raw_ingredient_article_references_only.reduce((n,a)=>n+(articles.get(a.toLowerCase())||0),0),row.catalog_id);
  assert.ok(row.source_url.startsWith("https://fssai.gov.in/"));
 }
 assert.equal(db.coverage.chapter_2_3_finished_product_mrls_autovalidated,0);
});
test("tomato, coconut, mango, groundnut and potato Chapter 2.3 raw-ingredient reviews never auto-apply source numbers",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const byId=new Map(db.chapter_2_3_commodity_mrl_review_v1.map(r=>[r.catalog_id,r]));
 const expected={
 "tomato-juice":"Tomato",
 "04-04-2-canned-tomatoes":"Tomato",
 "04-04-2-thermally-processed-tomato-puree-and-paste":"Tomato",
 "04-04-1-mango-chutney":"Mango",
 "04-04-1-coconut-milk-powder":"Coconut",
 "04-04-1-groundnut-kernel-deshelled":"Groundnut",
 "04-04-2-quick-frozen-fried-potatoes":"Potato",
 "12-12-6-chilli-sauce":"Chilli"
 };
 for(const [id,article] of Object.entries(expected)){
  assert.ok(byId.get(id).raw_ingredient_article_references_only.includes(article),id);
  assert.equal(byId.get(id).auto_apply_raw_ingredient_mrl,false,id);
 }
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 assert.match(html,/function exactFruitVegCommodityReview\(p\)/);
 assert.match(html,/const fruitVegCommodityReview=productFruitVegCommodityMrlReviewHtml\(p\)/);
 assert.match(html,/\+fruitVegCommodityReview/);
 assert.match(html,/These refer to precursor commodities, not confirmed finished-product MRLs/);
});


test("Chapter 2.3 98-product review-only scope blocks exact-name pesticide auto approval",()=>{
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const at=html.indexOf("function exactPesticideMrlRowsForProduct(p){");
 assert.ok(at>=0);
 const end=html.indexOf("\nfunction ",at+12);
 const fn=html.slice(at,end);
 const vm=require("node:vm");
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const c=vm.createContext({contaminantsDb:db,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),milkProductContaminantScope:()=>false});
 vm.runInContext(fn,c);
 const rows=p=>Array.from(vm.runInContext("exactPesticideMrlRowsForProduct("+JSON.stringify(p)+")",c));
 const products=index.products.filter(p=>String(p.fssr||"").startsWith("2.3."));
 assert.equal(products.length,98);
 for(const p of products)assert.deepEqual(rows(p),[],p.name+" must not be approved based on commodity name");
 // This deliberately colliding source commodity demonstrates that record ID, not name,
// controls review-only scope, even where a future article says Tomato verbatim.
 assert.ok(db.residue_mrls.pesticides.some(x=>(x.rows||[]).some(r=>r.food==="Tomato")));
 assert.deepEqual(rows({id:"tomato-juice",name:"Tomato",fssr:"2.3.8"}),[]);
 assert.ok(rows({id:"unscoped-synthetic-tomato",name:"Tomato",fssr:"2.10.99"}).length>0);
});


test("FSSAI 2.3.9 ready-to-drink fruit nectar has exact Version IX Lead 0.05 mg/kg, not a broad fruit-drink alias",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const source=db.metal_article_rules_v9.Lead.find(x=>x.article==="Fruit Juices (including nectars; ready to drink)");
 assert.ok(source);
 assert.equal(source.limit,0.05);
 assert.equal(source.unit,"mg/kg");
 const nectar=index.products.find(x=>x.id==="fruit-nectars"),drink=index.products.find(x=>x.id==="fruit-drink-rts");
 assert.equal(nectar.fssr,"2.3.9");
 assert.equal(drink.fssr,"2.3.10");
 const aliases=db.explicit_metal_alias_mappings_v9.filter(x=>x.product_id===nectar.id);
 assert.equal(aliases.length,1);
 const mapping=aliases[0];
 assert.equal(mapping.fssr,nectar.fssr);
 assert.deepEqual(mapping.verified_alias_basis.map(x=>[x.metal,x.article,x.limit,x.unit]),[["Lead",source.article,0.05,"mg/kg"]]);
 assert.ok(mapping.verified_alias_basis[0].source_standard_url.startsWith("https://fssai.gov.in/"));
 assert.equal(mapping.verified_alias_basis[0].complete_contaminant_review,false);
 assert.equal(mapping.verified_alias_basis[0].amendments_reconciled,false);
 assert.ok(!db.explicit_metal_alias_mappings_v9.some(x=>x.product_id===drink.id&&x.verified_alias_basis.some(y=>y.article===source.article)));
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const at=html.indexOf("function productBaselineContaminantRules(p){");
 const end=html.indexOf("\nfunction ",at+20);
 assert.ok(at>=0&&end>at);
 const vm=require("node:vm");
 const ctx=vm.createContext({contaminantsDb:db,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(html.slice(at,end),ctx);
 const run=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx));
 const verified=r=>r.contaminant==="Lead"&&r.article===source.article&&r.limit===0.05;
 assert.equal(run(nectar).filter(verified).length,1);
 assert.equal(run(drink).filter(verified).length,0);
});


test("533-product readiness audit wires exact Chapter 2.3 pesticide reviews without compliance approval",()=>{
 const src=fs.readFileSync(path.resolve(dataRoot,"../../scripts/audit-fssai-product-readiness.cjs"),"utf8");
 assert.match(src,/assert\.equal\(fruitVegReviews\.length,98/);
 assert.match(src,/chapter_2_3_pesticide_commodity_review:fruitVegById\.get\(p\.id\)/);
 assert.match(src,/tally\("chapter_2_3_pesticide_review","source_only_no_finished_product_approval"\)/);
 assert.match(src,/full_finished_product_applicability_verified:false/);
 assert.match(src,/chapter_2_4_crop_toxin_form_pending/);
});


test("vegetable juice exact Lead article must remain distinct from fruit drinks and concentrates",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const row=db.metal_article_rules_v9.Lead.find(x=>x.article==="Fruit and vegetable juice (including tomato juice, but not including lime juice and lemon juice)");
 assert.equal(row.limit,1);
 const route=db.explicit_metal_alias_mappings_v9.find(x=>x.product_id==="vegetable-juices");
 assert.equal(route.fssr,"2.3.7");
 assert.deepEqual(route.verified_alias_basis.map(x=>[x.metal,x.article,x.limit,x.unit]),[["Lead",row.article,1,"mg/kg"]]);
 assert.equal(route.verified_alias_basis[0].complete_contaminant_review,false);
 for(const id of ["fruit-juices","fruit-nectars","fruit-drink-rts","vegetable-juice-preserved-industrial","concentrated-vegetable-juice-industrial"]){
  assert.ok(!db.explicit_metal_alias_mappings_v9.some(x=>x.product_id===id&&x.verified_alias_basis.some(y=>y.article===row.article)),id);
 }
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+10);
 const vm=require("node:vm"),ctx=vm.createContext({contaminantsDb:db,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(html.slice(start,end),ctx);
 const evaluate=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx));
 const juice=evaluate(index.products.find(x=>x.id==="vegetable-juices")).filter(x=>x.contaminant==="Lead"&&x.article===row.article);
 assert.equal(juice.length,1);
 assert.equal(juice[0].limit,1);
 assert.equal(evaluate(index.products.find(x=>x.id==="fruit-drink-rts")).some(x=>x.article===row.article),false);
});


test("Chapter 2.3 conditional metal rows remain official reference only",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const byId=new Map(db.chapter_2_3_commodity_mrl_review_v1.map(x=>[x.catalog_id,x]));
 const checks={
  "04-04-2-dehydrated-vegetables":[["Lead",5],["Lead",10]],
  "04-04-1-thermally-processed-fruit-salad-cocktail-mix":[["Lead",1]],
  "04-04-2-sterilized-fungi":[["Lead",1],["Tin",250]]
 };
 for(const [id,rows] of Object.entries(checks)){
  const candidates=byId.get(id).conditional_metal_article_candidates;
  assert.deepEqual(candidates.map(x=>[x.contaminant,x.limit]),rows,id);
  for(const x of candidates){
   assert.equal(x.auto_apply,false,id);
   assert.equal(x.full_product_compliance,false,id);
   assert.ok(x.official_source_url.startsWith("https://fssai.gov.in/"));
   assert.ok(x.required_qualification.length>25,id);
   const matching=db.metal_article_rules_v9[x.contaminant].find(a=>a.article===x.official_article);
   assert.equal(matching.limit,x.limit,id);
   assert.equal(matching.unit,x.unit,id);
  }
 }
 const cocoa=byId.get("04-04-2-cocoa-beans");
 assert.deepEqual(cocoa.excluded_non_equivalent_finished_product_articles,["Cocoa powder"]);
 assert.deepEqual(cocoa.cross_product_metal_articles_reference_only.map(x=>[x.contaminant,x.limit,x.auto_apply]),[["Lead",5,false],["Copper",70,false]]);
});
test("Conditional source references are visible, do not affect unrelated products, and enter 533-product audit",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const from=html.indexOf("function exactFruitVegCommodityReview(p){");
 const to=html.indexOf("\nfunction exactCerealCommodityReview(",from);
 assert.ok(from>=0&&to>from);
 const vm=require("node:vm"),ctx=vm.createContext({contaminantsDb:db,esc:x=>String(x??"")});
 vm.runInContext(html.slice(from,to),ctx);
 const render=id=>vm.runInContext("productFruitVegCommodityMrlReviewHtml("+JSON.stringify(index.products.find(p=>p.id===id))+")",ctx);
 const dried=render("04-04-2-dehydrated-vegetables");
 assert.match(dried,/Conditional FSSAI metal references/);
 assert.match(dried,/NOT APPLIED/);
 assert.match(dried,/Dehydrated onions/);
 const cocoa=render("04-04-2-cocoa-beans");
 assert.match(cocoa,/Non-equivalent contaminant article/);
 assert.match(cocoa,/not Cocoa powder/);
 assert.doesNotMatch(render("fruit-juices"),/Conditional FSSAI metal references/);
 const audit=fs.readFileSync(path.resolve(dataRoot,"../../scripts/audit-fssai-product-readiness.cjs"),"utf8");
 assert.match(audit,/chapter_2_3_conditional_metal_products/);
 assert.match(audit,/raw_cocoa_beans_not_cocoa_powder/);
});


test("Groundnut kernel FSSR 2.3.47 uses identical nut and oilseed aflatoxin limits without leaking to oil",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const map=db.chapter_2_3_verified_groundnut_aflatoxin_v9;
 const id="04-04-1-groundnut-kernel-deshelled";
 assert.equal(map.catalog_id,id);
 assert.equal(map.fssr,"2.3.47(1)");
 assert.equal(map.product_identity_verified,true);
 assert.equal(map.complete_contaminant_coverage,false);
 assert.equal(map.automatic_pesticide_mrl_approval,false);
 assert.equal(map.amendments_fully_reconciled,false);
 assert.deepEqual(map.rules.map(x=>[x.contaminant,x.limit,x.unit]),[["Total Aflatoxins",15,"µg/kg"],["Aflatoxin B1",10,"µg/kg"]]);
 for(const rule of map.rules){
  assert.equal(rule.official_articles.length,4);
  const official=db.crop_contaminants[rule.crop_contaminant_key].rules;
  for(const article of rule.official_articles)
   assert.ok(official.some(x=>x.article===article&&x.limit===rule.limit),article);
 }
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const at=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",at+12);
 assert.ok(at>0&&end>at);
 const vm=require("node:vm"),ctx=vm.createContext({
  contaminantsDb:db,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,
  exactRawMeatMetalLock:()=>null,isVerifiedFermentedMilkProduct:()=>false
 });
 vm.runInContext(html.slice(at,end),ctx);
 const exec=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx));
 const target=index.products.find(x=>x.id===id);
 assert.ok(target);
 const found=exec(target).filter(x=>x.source_basis?.includes("four exact nut/oilseed article checks"));
 assert.deepEqual(found.map(x=>[x.contaminant,x.limit,x.unit]),[["Total Aflatoxins",15,"µg/kg"],["Aflatoxin B1",10,"µg/kg"]]);
 const other=exec(index.products.find(x=>x.id==="04-04-1-dry-fruits-and-nuts"));
 assert.equal(other.some(x=>x.source_basis?.includes("four exact nut/oilseed article checks")),false);
 const altered=structuredClone(db);
 altered.chapter_2_3_verified_groundnut_aflatoxin_v9.product_identity_verified=false;
 ctx.contaminantsDb=altered;
 assert.equal(exec(target).some(x=>x.source_basis?.includes("four exact nut/oilseed article checks")),false);
 altered.chapter_2_3_verified_groundnut_aflatoxin_v9.product_identity_verified=true;
 altered.crop_contaminants.total_aflatoxins.rules.find(x=>x.article==="Oilseeds, ready to eat").limit=999;
 assert.equal(exec(target).some(x=>x.contaminant==="Total Aflatoxins"&&x.source_basis?.includes("four exact nut/oilseed article checks")),false);
 const audit=fs.readFileSync(path.resolve(dataRoot,"../../scripts/audit-fssai-product-readiness.cjs"),"utf8");
 assert.match(audit,/chapter_2_3_verified_groundnut_crop_limits/);
 assert.match(audit,/verified_groundnut_crop_toxin_identical_category_limits/);
});


test("six exact finished soup or sauce identities inherit sourced saffrole without matching soup powder or paste",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const saff=db.chapter_2_3_exact_soup_sauce_saffrole_v9;
 assert.equal(saff.official_article,"Soups and sauces");
 assert.equal(saff.limit,10);
 assert.equal(saff.unit,"ppm");
 assert.equal(saff.complete_contaminant_coverage,false);
 assert.equal(saff.amendments_fully_reconciled,false);
 assert.equal(saff.verified_product_identities.length,6);
 assert.equal(db.naturally_occurring_toxic_substances.saffrole.find(x=>x.article===saff.official_article).limit,10);
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const at=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",at+12);
 const vm=require("node:vm"),ctx=vm.createContext({contaminantsDb:db,
   normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
   chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,
   exactRawMeatMetalLock:()=>null,isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(html.slice(at,end),ctx);
 const rules=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx));
 for(const row of saff.verified_product_identities){
   const p=index.products.find(x=>x.id===row.catalog_id);
   assert.ok(p,row.catalog_id);
   assert.equal(p.fssr,row.fssr);
   const found=rules(p).filter(x=>x.contaminant==="Saffrole"&&x.article===saff.official_article);
   assert.equal(found.length,1,p.name);
   assert.equal(found[0].limit,10,p.name);
   assert.equal(found[0].unit,"ppm");
 }
 for(const id of saff.excluded_similar_identity_ids){
   const p=index.products.find(x=>x.id===id);
   assert.ok(p,id);
   assert.equal(rules(p).some(x=>x.contaminant==="Saffrole"&&x.article===saff.official_article),false,id);
 }
 const modified=structuredClone(db);
 modified.naturally_occurring_toxic_substances.saffrole.find(x=>x.article==="Soups and sauces").limit=100;
 ctx.contaminantsDb=modified;
 const soup=index.products.find(x=>x.id==="12-12-5-thermally-processed-vegetable-soups");
 assert.equal(rules(soup).some(x=>x.contaminant==="Saffrole"),false,"Source number change must fail closed");
 const audit=fs.readFileSync(path.resolve(dataRoot,"../../scripts/audit-fssai-product-readiness.cjs"),"utf8");
 assert.match(audit,/chapter_2_3_exact_soup_sauce_saffrole/);
});
test("Tomato Ketchup 50 mg per kg copper dry-solids limit is conditional, not applied to Tomato Sauce",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const record=db.chapter_2_3_commodity_mrl_review_v1.find(x=>x.catalog_id==="12-12-6-tomato-ketchup-and-tomato-sauce");
 assert.equal(record.conditional_metal_article_candidates.length,1);
 const metal=record.conditional_metal_article_candidates[0];
 assert.equal(metal.contaminant,"Copper");
 assert.equal(metal.official_article,"Tomato ketchup");
 assert.equal(metal.limit,50);
 assert.equal(metal.unit,"mg/kg");
 assert.match(metal.source_condition,/dried total solids/i);
 assert.equal(metal.auto_apply,false);
 assert.equal(metal.full_product_compliance,false);
 const exact=db.metal_article_rules_v9.Copper.find(x=>x.article==="Tomato ketchup");
 assert.equal(exact.limit,metal.limit);
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const start=html.indexOf("function exactFruitVegCommodityReview(p){");
 const stop=html.indexOf("\nfunction exactCerealCommodityReview(",start);
 const vm=require("node:vm"),context=vm.createContext({contaminantsDb:db,esc:x=>String(x??"")});
 vm.runInContext(html.slice(start,stop),context);
 const p=index.products.find(x=>x.id==="12-12-6-tomato-ketchup-and-tomato-sauce");
 const out=vm.runInContext("productFruitVegCommodityMrlReviewHtml("+JSON.stringify(p)+")",context);
 assert.match(out,/NOT APPLIED/);
 assert.match(out,/Tomato ketchup/);
 assert.match(out,/dried total solids/i);
});


test("five named Chapter 2.3 nut/arecanut identities map aflatoxins only on exact FSSAI articles",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const cfg=db.chapter_2_3_exact_nut_arecanut_aflatoxin_v9;
 assert.equal(cfg.verified_product_identities.length,5);
 assert.equal(cfg.complete_contaminant_coverage,false);
 assert.equal(cfg.amendments_fully_reconciled,false);
 assert.equal(cfg.automatic_pesticide_mrl_approval,false);
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const at=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",at+12);
 const vm=require("node:vm");
 const ctx=vm.createContext({contaminantsDb:db,
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,
  exactRawMeatMetalLock:()=>null,isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(html.slice(at,end),ctx);
 const run=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx));
 for(const config of cfg.verified_product_identities){
  const p=index.products.find(x=>x.id===config.catalog_id);
  assert.ok(p,config.catalog_id);
  assert.equal(p.name,config.product_name);
  assert.equal(p.fssr,config.fssr);
  for(const rule of cfg.rules){
   const source=db.crop_contaminants[rule.crop_contaminant_key].rules;
   for(const article of config.official_articles)
    assert.ok(source.some(x=>x.article===article&&x.limit===rule.limit),article);
   const hits=run(p).filter(x=>x.contaminant===rule.contaminant&&x.source_basis?.includes("verified exact Chapter 2.3 nut/arecanut identity"));
   assert.equal(hits.length,1,p.name+" "+rule.contaminant);
   assert.equal(hits[0].limit,rule.limit);
   assert.equal(hits[0].unit,rule.unit);
  }
 }
 for(const id of cfg.excluded_similar_identity_ids){
  const p=index.products.find(x=>x.id===id);
  assert.ok(p,id);
  assert.equal(run(p).some(x=>x.source_basis?.includes("verified exact Chapter 2.3 nut/arecanut identity")),false,id);
 }
 const altered=structuredClone(db);
 altered.crop_contaminants.total_aflatoxins.rules.find(x=>x.article==="Nuts, ready to eat").limit=999;
 ctx.contaminantsDb=altered;
 const pistachio=index.products.find(x=>x.id==="04-04-1-pistachio-nuts");
 assert.equal(run(pistachio).some(x=>x.contaminant==="Total Aflatoxins"&&x.source_basis?.includes("verified exact Chapter 2.3")),false);
 assert.equal(run(pistachio).some(x=>x.contaminant==="Aflatoxin B1"&&x.source_basis?.includes("verified exact Chapter 2.3")),true);
 const audit=fs.readFileSync(path.resolve(dataRoot,"../../scripts/audit-fssai-product-readiness.cjs"),"utf8");
 assert.match(audit,/chapter_2_3_verified_named_nut_arecanut_crop_limits/);
});

test("Pulses retain their own toxin article and do not inherit cereal grain lead or toxin article",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const at=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",at+12);
 const vm=require("node:vm"),ctx=vm.createContext({contaminantsDb:db,
   normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
   chapterRuleDbs:[{}],ruleDbStandards:()=>[{key:"2.4.6",applies_to:["wheat","maize","rice","pulses","millets","other food grains"]}],
   exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,isVerifiedFermentedMilkProduct:()=>false});
 vm.runInContext(html.slice(at,end),ctx);
 const p=index.products.find(x=>x.id==="06-06-1-pulses");
 assert.ok(p);assert.equal(p.fssr,"2.4.6(22)");
 const rows=Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx));
 assert.deepEqual(rows.filter(x=>x.article==="Pulses" && x.unit==="µg/kg").map(x=>x.limit).sort((a,b)=>a-b),[10,15]);
 assert.equal(rows.some(x=>x.article==="Cereal and cereal products"),false);
 assert.equal(rows.some(x=>x.article==="Cereal grains, except buckwheat, canihua and quinoa"),false);
});


test("exact named nut and arecanut Version IX mappings suppress stale generic legacy rows",()=>{
 const db=JSON.parse(fs.readFileSync(path.join(dataRoot,"rules/contaminants-v9-core.json"),"utf8"));
 const html=fs.readFileSync(path.join(dataRoot,"../index.html"),"utf8");
 const at=html.indexOf("function contaminantProfileForProduct(p){");
 const end=html.indexOf("\nfunction contaminantIngredientRulesForName(",at+12);
 assert.ok(at>0&&end>at);
 const vm=require("node:vm");
 const ctx=vm.createContext({contaminantsDb:db,
  exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null});
 vm.runInContext(html.slice(at,end),ctx);
 const profile=p=>vm.runInContext("contaminantProfileForProduct("+JSON.stringify(p)+")",ctx);
 for(const cfg of db.chapter_2_3_exact_nut_arecanut_aflatoxin_v9.verified_product_identities){
  const p=index.products.find(x=>x.id===cfg.catalog_id);
  assert.ok(p);
  assert.equal(profile(p),null, cfg.product_name+" legacy hard-coded aflatoxins must not bypass source checks");
 }
 const other=index.products.find(x=>x.id==="04-04-1-groundnut-kernel-deshelled");
 assert.ok(other);
 assert.ok(profile(other)?.rules?.length>0,"Groundnut profile must be unaffected");
});
