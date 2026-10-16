"use strict";
/* Protect actual official CTR rows, prevent any unsupported case promotion. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const folder=path.join("fssai-product-helper-preview-01","data","rules");
const p=JSON.parse(fs.readFileSync(path.join(folder,"fssai-current35-source-row-proof-register-batch27-2026-10-16.json"),"utf8"));
const b=JSON.parse(fs.readFileSync(path.join(folder,"fssai-current35-exact-article-adjudication-batch26-2026-10-16.json"),"utf8"));
const legal=new Map(b.cases.map(x=>[x.catalog_id,x]));
assert.equal(b.cases.length,35);
assert.equal(p.rows.length,17);assert.equal(p.source_row_count,17);
assert.equal(p.coverage.canonical,533);
assert.equal(p.coverage.conditional_references,498);
assert.equal(p.coverage.pending_finished_source,35);
assert.equal(p.coverage.independent_legal_matches,0);
assert.equal(p.coverage.lab_lot_pass,0);
assert.equal(p.future_amendment_active,false);
assert.equal(p.future_amendment_effective,"2026-12-01");
const byId=new Map(),related=new Set();
for(const x of p.rows){
 assert(!byId.has(x.row_id),x.row_id);
 byId.set(x.row_id,x);
 assert.match(x.source_url,/^https:\/\/fssai\.gov\.in\/upload\/uploadfiles\/files\/Comp_Contaminants_Regulations_03_02_2026_IX\.pdf#page=\d+$/);
 assert.equal(x.source_url.split("#page=")[1],String(x.pdf_page_zero_based+1));
 assert(x.value>=0&&Number.isFinite(x.value));
 assert.equal(x.row_verified_in_official_pdf,true);
 assert.equal(x.finished_product_scope_verified,false);
 assert.equal(x.regulatory_limit_auto_assigned,false);
 assert.equal(x.lot_conformity_verified,false);
 for(const id of x.catalog_ids){assert(legal.has(id),id);related.add(id)}
}
assert.equal(related.size,13);
const expect={
"CTR-LEAD-COCOA":["Lead","Cocoa powder",5,2,"mg/kg"],
"CTR-COPPER-COCOA":["Copper","Cocoa powder",70,6,"mg/kg"],
"CTR-OTA-COFFEE":["Ochratoxin A","Coffee",5,14,"µg/kg"],
"CTR-LEAD-HIGH-ASH-SUGAR":["Lead","Sugars and syrups with sulphated ash above 1%",5,1,"mg/kg"],
"CTR-LEAD-REFINED-WHITE-SUGAR":["Lead","Refined white sugar / dextrose",0.5,1,"mg/kg"],
"CTR-LEAD-HIGH-ASH-GLUCOSE":["Lead","High-ash solid glucose or starch-conversion food",5,3,"mg/kg"],
"CTR-CHROMIUM-REFINED-SUGAR":["Chromium","Refined sugar",0.02,12,"mg/kg"],
"CTR-NICKEL-SORBITOL":["Nickel","Sorbitol",2,12,"mg/kg"],
"CTR-LEAD-SORBITOL":["Lead","Sorbitol",1,5,"mg/kg"],
"CTR-ARSENIC-SORBITOL":["Arsenic","Sorbitol",3,9,"mg/kg"],
"CTR-LEAD-FALLBACK":["Lead","Foods not specified",2.5,3,"mg/kg"],
"CTR-COPPER-FALLBACK":["Copper","Foods not specified",30,6,"mg/kg"],
"CTR-CADMIUM-FALLBACK":["Cadmium","Foods not specified",1.5,11,"mg/kg"],
"CTR-METHYLMERCURY-ALL":["Methylmercury","All foods",0.25,11,"mg/kg"],
"CTR-AFLATOXINS-COMPOSITE":["Total aflatoxins","Foods containing listed aflatoxin crop commodities",20,13,"µg/kg"],
"CTR-AFLATOXIN-B1-COMPOSITE":["Aflatoxin B1","Foods containing listed aflatoxin crop commodities",10,13,"µg/kg"]
};
for(const [id,pattern] of Object.entries(expect)){
 const x=byId.get(id);assert(x,"Missing verified article "+id);
 assert.deepEqual([x.analyte,x.article,x.value,x.pdf_page_zero_based,x.unit],pattern);
}
const b26Js=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-exact-article-adjudication-batch26-2026-10-16.js","utf8");
const b27Js=fs.readFileSync("fssai-product-helper-preview-01/fssai-current35-source-row-proof-register-batch27-2026-10-16.js","utf8");
function digest(v){
 const s=JSON.stringify(v);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
assert(b26Js.includes('const pmsvB26Expected="'+digest(b)+'"'));
assert(b27Js.includes('const pmsvB27Expected="'+digest(p)+'"'));
assert(b27Js.includes("sourcePinned121ResearchProofHtml=function(p)"));
console.log("B27 17 statutory CTR rows validated; 13 case research links; 533/498/35 unchanged; no limit or PASS");
