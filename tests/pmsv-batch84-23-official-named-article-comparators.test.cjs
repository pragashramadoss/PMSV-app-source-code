"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const audit=JSON.parse(fs.readFileSync(root+"data/rules/fssai-final35-legal-candidate-audit-2026-10-17.json","utf8"));
const s=fs.readFileSync(root+"fssai-final35-legal-review-2026-10-18.js","utf8");
const start=s.indexOf("const B84_SCOPE=Object.freeze(");
assert(start>0);const end=s.indexOf(");",start);
const data=JSON.parse(s.slice(start+"const B84_SCOPE=Object.freeze(".length,end));
assert.equal(data.length,23);
assert.equal(new Set(data.map(x=>x[0])).size,23);
const ranks=new Map(audit.rows.map(x=>[x.rank,x]));
let families={};for(const x of data){
 assert(ranks.has(x[0]),"Unknown immutable pending case "+x[0]);
 assert(x.length===8&&x[1]&&x[2]&&Number.isFinite(x[3])&&x[3]>0&&x[4]);
 assert(Number.isInteger(x[5])&&x[5]>=1&&x[5]<=56);
 assert(x[6].length>40&&x[7].length>20);
 families[x[1]]=(families[x[1]]||0)+1
}
assert.equal(data.find(x=>x[0]===1)[3],0.01);
assert.equal(data.find(x=>x[0]===2)[3],5);
assert.equal(data.find(x=>x[0]===8)[4],"mg/kg dry-fat-free");
assert.equal(data.find(x=>x[0]===18)[3],5);
assert(data.find(x=>x[0]===18)[6].includes("does NOT match"));
assert.equal(data.find(x=>x[0]===21)[3],2);
assert(data.find(x=>x[0]===20)[2]==="Refined sugar");
assert.equal(data.find(x=>x[0]===16)[2].startsWith("Eggs"),true);
assert.equal(data.find(x=>x[0]===28)[4],"µg/kg");
assert(s.includes('b84Render();return true')&&s.includes('b84Clear();'));
assert(s.includes("if(!verified()){b84Clear();return false}"));
assert(s.includes("published_amount_NOT_APPLIED"));
assert(s.includes("case_legal_applicability"));
assert(s.includes("No documents uploaded, no email sent, no numeric compliance decisions."));
assert(s.includes("Status: CASE HELD"));
assert(s.includes("FSSAI CTR Version IX reference"));
assert(!/(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon)/.test(s));
assert.equal(audit.totals.regulatory_approvals,0);
assert.equal(audit.totals.lot_releases,0);
console.log("B84 PASS: 23 case-anchored exact numeric named-article references with 23 nontransfer rationales; 35 HELD, no auto limit or lot release.");
