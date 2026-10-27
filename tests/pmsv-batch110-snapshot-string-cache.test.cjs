"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),dir="fssai-product-helper-preview-01/";
const source=fs.readFileSync(path.join(root,dir,"fssai-source-proof-panels.js"),"utf8");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,dir,"data/rules",name),"utf8"));
const originals={
 ledger:read("fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json"),
 work:read("fssai-current-116-finished-article-proof-worklist-2026-10-12.json"),
 branches:read("fssai-2026-10-12-thirtytwo-cereal-fruit-spice-identity-source-branches.json")
};
function setup(){
 const c={console,esc:x=>String(x)};
 vm.createContext(c);vm.runInContext(source,c);return c;
}
test("all three fixed official-source fingerprints remain byte-for-byte unchanged",()=>{
 const c=setup();
 for(const kind of Object.keys(originals)){
  const d=structuredClone(originals[kind]);
  assert.equal(c.pmsvReviewSnapshotIntact(kind,d),true);
  assert.equal(c.pmsvReviewSnapshotDigest(d),vm.runInContext("pmsvReviewSnapshotDigests",c)[kind]);
 }
});
test("repeat exact content skips only the hashing loop, never the full source serialization",()=>{
 const c=setup();let hashes=0;
 const old=c.pmsvReviewSnapshotHashSerialized;
 c.pmsvReviewSnapshotHashSerialized=s=>{hashes++;return old(s)};
 const ledger=structuredClone(originals.ledger),
       work=structuredClone(originals.work),
       branches=structuredClone(originals.branches);
 assert(c.pmsvReviewSnapshotIntact("ledger",ledger));
 assert(c.pmsvReviewSnapshotIntact("work",work));
 assert(c.pmsvReviewSnapshotIntact("branches",branches));
 assert.equal(hashes,3);
 for(let i=0;i<12;i++){
  assert(c.pmsvReviewSnapshotIntact("ledger",ledger));
  assert(c.pmsvReviewSnapshotIntact("work",work));
  assert(c.pmsvReviewSnapshotIntact("branches",branches));
 }
 assert.equal(hashes,3,"Stable string content can reuse only its verified fingerprint");
 ledger.records[0].product_name+=" altered";
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",ledger),false);
 assert.equal(hashes,4);
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",ledger),false);
 assert.equal(hashes,4,"Repeated invalid content remains rejected");
 ledger.records[0].product_name=originals.ledger.records[0].product_name;
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",ledger),true);
 assert.equal(hashes,5,"Restoring good data rehashes after last invalid content");
 work.records.reverse();
 assert.equal(c.pmsvReviewSnapshotIntact("work",work),false);
 assert.equal(hashes,6,"Reordering worklist is detected");
 branches.records[0].selectable_branches[0].positive_proof[0]="Approval granted";
 assert.equal(c.pmsvReviewSnapshotIntact("branches",branches),false);
 assert.equal(hashes,7,"Altering branch narrative is detected");
 assert.equal(c.pmsvReviewSnapshotIntact("not-a-kind",ledger),false);
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",null),false);
 assert.equal(hashes,7);
});
test("changed data in an independent later action is never treated as prior verified content",()=>{
 const c=setup(),ledger=structuredClone(originals.ledger);
 assert(c.pmsvReviewSnapshotIntact("ledger",ledger));
 const rec=ledger.records.find(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING");
 const before=rec.source_status;
 rec.source_status="PARTIAL_EXACT_SOURCE_MATCH";
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",ledger),false);
 rec.source_status=before;
 assert.equal(c.pmsvReviewSnapshotIntact("ledger",ledger),true);
});
