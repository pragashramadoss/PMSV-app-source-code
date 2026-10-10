"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const catalogue=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/standard-search-index-v1.json"),"utf8")).products;
const queue=fs.readFileSync(path.join(root,"FSSAI-CONTAMINANT-EVIDENCE-QUEUE-2026-10-10.md"),"utf8");
const evidenceScript=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const db=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json"),"utf8"));
test("raw cocoa beans retain distinct identity and unresolved product-specific contaminant review",()=>{
  const beans=catalogue.find(x=>x.id==="04-04-2-cocoa-beans");
  const powder=catalogue.find(x=>x.id==="05-05-1-cocoa-powder");
  assert.ok(beans&&powder,"Both distinct products must exist");
  assert.equal(beans.name,"Cocoa Beans");
  assert.equal(beans.fssr,"2.3.54");
  assert.notEqual(beans.id,powder.id);
  assert.match(queue,/\| Cocoa Beans \| `04-04-2-cocoa-beans` \| 2\.3\.54 \|/);
  assert.match(evidenceScript,/universal_rule_proves_product_coverage:false/);
  const direct=db.profiles.filter(profile=>(profile.catalog_ids||[]).includes(beans.id));
  for(const profile of direct){
    assert.ok(!(profile.catalog_ids||[]).includes(powder.id),"Cocoa beans must not share cocoa-powder numeric contaminant profile");
  }
  const unsafe=db.explicit_metal_alias_mappings_v9||[];
  assert.ok(!unsafe.some(x=>x.product_id===beans.id && /cocoa powder/i.test(JSON.stringify(x))),"Cocoa-powder metal alias must not apply to raw beans");
});
