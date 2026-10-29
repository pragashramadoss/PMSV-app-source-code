"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","fssai-product-helper-preview-01");
const html=fs.readFileSync(path.join(root,"pmsv-batch128-35-regulatory-review.html"),"utf8");
const data=JSON.parse(fs.readFileSync(path.join(root,"data/rules/fssai-final35-desk-research-complete-batch88-2026-10-20.json"),"utf8"));
let a=0x811c9dc5,b=0x9747b28c;
for(const ch of JSON.stringify(data)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}
const digest=(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
assert.equal(digest,"4d1590738e747a2a");
assert.match(html,/PIN="4d1590738e747a2a"/);
assert.match(html,/digest\(d\)!==PIN/);
assert.match(html,/d\.cases\.length!==35/);
assert.match(html,/rids\.size===175&&p0===13&&p1===22&&other===23&&unresolved===12/);
assert.match(html,/future_CTR_amendment_effective!=="2026-12-01"/);
assert.match(html,/Published source finding/);
assert.match(html,/named_article_reference_NOT_APPLICABLE/);
assert.match(html,/RECHECK_ACTUAL_PRODUCT_SCOPE_NO_NUMERIC_TRANSFER/);
assert.match(html,/No confidential external files are collected/);
assert.match(html,/regulatory_passes===0&&s\.lot_releases===0/);
assert.match(html,/c\.applicable_legal_limit!=="NOT_SIGNED"/);
assert.match(html,/c\.lot_release!=="HELD"/);
assert.match(html,/document\.createElement\("td"\)/);
assert.doesNotMatch(html,/innerHTML\s*=/);
assert.match(html,/^\s*<!doctype html>/i);
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/);
assert.ok(script,"standalone executable client script");
new Function(script[1]); // syntax validation only; no browser execution
const seen=new Set(),requests=new Set(),counts={P0:0,P1:0,other:0,none:0};
for(const c of data.cases){
 assert.ok(!seen.has(c.case_id));seen.add(c.case_id);counts[c.priority]++;
 if(c.numeric_scope==="DIFFERENT_NAMED_FOOD_ARTICLE_REFERENCE_ONLY"){
   assert.notEqual(c.published_value_NOT_APPLIED,null);counts.other++;
 }else{
   assert.equal(c.numeric_scope,"NO_SINGLE_NUMERIC_ARTICLE_ESTABLISHED");
   assert.equal(c.published_value_NOT_APPLIED,null);counts.none++;
 }
 assert.equal(c.source_desk_research,"COMPLETE");
 assert.equal(c.actual_product_scope,"NOT_AUTHENTICATED");
 assert.equal(c.applicable_legal_limit,"NOT_SIGNED");
 assert.equal(c.lab_method_matrix,"NOT_SIGNED");
 assert.equal(c.representative_lot_CoA,"NOT_RECEIVED");
 assert.equal(c.lot_release,"HELD");
 assert.equal(c.original_evidence_request_ids.length,5);
 for(const id of c.original_evidence_request_ids){assert.ok(!requests.has(id));requests.add(id)}
}
assert.deepEqual(counts,{P0:13,P1:22,other:23,none:12});
assert.equal(requests.size,175);
console.log("PMSV Batch128: all 35 source reviews pinned; 175 unique evidence IDs; future-effect gate and all HOLDs retained.");
