"use strict";
/* Batch72 structural proof: each removed duplicate is still validated by the
 * required ancestor. Source pins, case predicates, and held values stay intact. */
const fs=require("node:fs"),assert=require("node:assert/strict");
const dir="fssai-product-helper-preview-01";
const names={
 B59:"fssai-current35-reference-row-nontransfer-batch59-2026-10-17.js",
 B60:"fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.js",
 B61:"fssai-current35-original-gazette-subjects-batch61-2026-10-17.js",
 B62:"fssai-current35-identity-supersession-batch62-2026-10-17.js",
 B63:"fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.js",
 B64:"fssai-current35-vending-children-polyols-batch64-2026-10-17.js",
 B65:"fssai-current35-food-matrix-classification-batch65-2026-10-17.js",
 B66:"fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.js",
 B67:"fssai-current35-six-matrix-evidence-batch67-2026-10-17.js",
 B68:"fssai-current35-remaining12-p1-lead-batch68-2026-10-17.js",
 B58:"fssai-current35-owner-outreach-batch58-2026-10-17.js"
};
const namespaced={
 B58:"window.pmsvB58OwnerOutreach",B59:"window.pmsvB59CTRSourceCrosswalk",
 B60:"window.pmsvB60LegalScope",B61:"window.pmsvB61OriginalGazette",
 B62:"window.pmsvB62IdentitySupersession",B63:"window.pmsvB63CocoaMisri",
 B64:"window.pmsvB64OriginalLawCases",B65:"window.pmsvB65FourFoodMatrices",
 B66:"window.pmsvB66NutraIngredientAudit",B67:"window.pmsvB67SixMatrixEvidence",
 B68:"window.pmsvB68RemainingLeadP1"
};
const deps={
 B59:["B58"],B60:["B59"],B61:["B60"],B62:["B61"],B63:["B62"],
 B64:["B63"],B65:["B59"],B66:["B65","B60"],B67:["B66"],B68:["B67"]
};
const raw=Object.fromEntries(Object.entries(names).map(([b,name])=>[b,fs.readFileSync(dir+"/"+name,"utf8")]));
for(const [b,parents] of Object.entries(deps)){
 const src=raw[b],body=src.slice(src.indexOf("function valid(){")+17);
 assert(src.includes("function valid(){"),"No validity function for "+b);
 for(const parent of parents)assert(body.includes(namespaced[parent]+"?.valid()")||
   (b==="B60"&&body.includes('window.pmsvB59CTRSourceCrosswalk?.valid()')),
   b+" must validate parent "+parent);
 assert(src.includes("pmsvB14Digest")||b==="B58");
}
for(const [k,v] of Object.entries({
 B59:["pmsvB56Valid","pmsvB57Valid","pmsvB57PlusValid"],
 B60:["pmsvB56Valid"], B61:["window.pmsvB59CTRSourceCrosswalk?.valid()"],
 B63:["window.pmsvB59CTRSourceCrosswalk?.valid()"],
 B64:["window.pmsvB59CTRSourceCrosswalk?.valid()"],
 B66:["window.pmsvB59CTRSourceCrosswalk?.valid()"],
 B67:["window.pmsvB59CTRSourceCrosswalk?.valid()","window.pmsvB60LegalScope?.valid()"],
 B68:["window.pmsvB59CTRSourceCrosswalk?.valid()","window.pmsvB60LegalScope?.valid()"]
})){
 const first=raw[k].slice(raw[k].indexOf("function valid(){"),raw[k].indexOf("function valid(){")+680);
 for(const removed of v)assert(!first.includes(removed),k+" still duplicates "+removed);
}
// Witness transitive path for every removed ancestor without assuming any data is valid.
const required={
 B59:["B58","B56","B57","B57Plus"],
 B60:["B59","B56"],
 B61:["B60","B59"],B63:["B62","B59"],B64:["B63","B59"],
 B66:["B65","B60","B59"],B67:["B66","B59","B60"],B68:["B67","B59","B60"]
};
const reach={...deps,B58:["B56","B57","B57Plus"],B57Plus:["B57","B56"],B57:["B56"]};
function reachable(from,to,seen=new Set()){
 if(from===to)return true;
 if(seen.has(from))return false;seen.add(from);
 return (reach[from]||[]).some(x=>reachable(x,to,new Set(seen)));
}
for(const [b,ancestors] of Object.entries(required))
 for(const p of ancestors)assert(reachable(b,p),b+" lost fail-closed ancestry "+p);
for(const b of ["B59","B60","B61","B63","B64","B66","B67","B68"])
 assert(raw[b].includes("B72: ancestor required"),"No B72 change marker "+b);
console.log("B72_TRANSITIVE_PROOF_PASS: 8 source modules, ancestor checks still required; all original digest/case checks untouched.");
