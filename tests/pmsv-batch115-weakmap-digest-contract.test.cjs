"use strict";
/* Batch115 shipped digest: byte-exact content reuse only. Verify original
 * FSSAI fingerprints, changed/reordered content rejection and cross-turn safety. */
const {test}=require("node:test");
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const code=fs.readFileSync(root+"fssai-source-proof-panels.js","utf8");
function read(name){return JSON.parse(fs.readFileSync(root+"data/rules/"+name,"utf8"))}
const records={
 ledger:read("fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json"),
 work:read("fssai-current-116-finished-article-proof-worklist-2026-10-12.json"),
 branches:read("fssai-2026-10-12-thirtytwo-cereal-fruit-spice-identity-source-branches.json")
};
function setup(){
 const context={console,esc:x=>String(x)};
 vm.createContext(context);
 vm.runInContext(code,context);
 return context;
}
function stats(c){
 return vm.runInContext("({hits:pmsvWeakDigestHits,misses:pmsvWeakDigestMisses,invalidations:pmsvWeakDigestInvalidations})",c);
}
test("original three 16-digit fingerprints are identical and pinned source intact",()=>{
 const c=setup();
 const expected=vm.runInContext("pmsvReviewSnapshotDigests",c);
 for(const [kind,data] of Object.entries(records)){
  const row=structuredClone(data);
  assert.equal(c.pmsvReviewSnapshotDigest(row),expected[kind]);
  assert.equal(c.pmsvReviewSnapshotIntact(kind,row),true);
 }
 assert.equal(stats(c).hits,0);
 assert.equal(stats(c).misses,3);
});
test("stable same identity avoids redundant HASH loops but reserializes every call",()=>{
 const c=setup(),sample=structuredClone(records.ledger);
 const original=c.pmsvReviewSnapshotHashSerialized;
 let hashes=0,serialization=0;
 c.pmsvReviewSnapshotHashSerialized=s=>{hashes++;return original(s)};
 sample.toJSON=function(){serialization++;return {...this,toJSON:undefined}};
 const first=c.pmsvReviewSnapshotDigest(sample);
 for(let i=0;i<40;i++)assert.equal(c.pmsvReviewSnapshotDigest(sample),first);
 assert.equal(hashes,1);
 assert.equal(serialization,41,"Every call must serialize current data, even on a cache hit");
 assert.equal(stats(c).hits,40);
 // Current byte content, never object identity alone, is the cache key.
 sample.records[0].product_name+=" SAME-TURN-TAMPER";
 const changed=c.pmsvReviewSnapshotDigest(sample);
 assert.notEqual(changed,first);
 assert.equal(hashes,2);
 sample.records[0].product_name=records.ledger.records[0].product_name;
 assert.equal(c.pmsvReviewSnapshotDigest(sample),first);
 assert.equal(hashes,3);
 assert.equal(stats(c).invalidations,2);
});
test("different object identities and reordered data cannot share cached approval",()=>{
 const c=setup();
 let hashes=0;const old=c.pmsvReviewSnapshotHashSerialized;
 c.pmsvReviewSnapshotHashSerialized=s=>{hashes++;return old(s)};
 const one=structuredClone(records.work),two=structuredClone(records.work);
 const fingerprint=c.pmsvReviewSnapshotDigest(one);
 assert.equal(c.pmsvReviewSnapshotDigest(two),fingerprint);
 assert.equal(hashes,2,"Separate objects must independently establish their fingerprint");
 two.records.reverse();
 assert.notEqual(c.pmsvReviewSnapshotDigest(two),fingerprint);
 assert.equal(hashes,3);
 assert.equal(c.pmsvReviewSnapshotIntact("work",two),false);
 assert.equal(c.pmsvReviewSnapshotIntact("work",one),true);
});
test("later event and source-restoration never hide an intervening content change",async()=>{
 const c=setup(),doc=structuredClone(records.ledger);
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",doc),true);
 const stable=c.pmsvReviewSnapshotDigest(doc);
 await new Promise(resolve=>setImmediate(resolve));
 doc.records[0].product_name+=" AFTER-AWAIT-EDIT";
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",doc),false);
 assert.notEqual(c.pmsvReviewSnapshotDigest(doc),stable);
 doc.records[0].product_name=records.ledger.records[0].product_name;
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",doc),true);
 assert.equal(c.pmsvReviewSnapshotDigest(doc),stable);
});
