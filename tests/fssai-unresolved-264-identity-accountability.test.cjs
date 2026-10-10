"use strict";
const test=require("node:test"), assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const queue=read("FSSAI-CONTAMINANT-EVIDENCE-QUEUE-2026-10-10.md");
const index=JSON.parse(read("fssai-product-helper-preview-01/data/standard-search-index-v1.json")).products;
function queueItems(){
 const items=[];let section="";
 for(const line of queue.split(/\r?\n/)){
  const head=line.match(/^### FSSR (.+?) \((\d+)\)$/);
  if(head){section=head[1];continue;}
  const row=line.match(/^\| (.+?) \| `([^`]+)` \| ([^|]+) \|$/);
  if(row&&section)items.push({name:row[1],id:row[2],fssr:row[3].trim(),section});
 }
 return items;
}
test("All 146 unresolved exact-evidence cases have unique real catalogue identities",()=>{
 const items=queueItems(),ids=new Set(items.map(x=>x.id));
 assert.equal(index.length,533);
 assert.equal(items.length,146,"Queue count drift: regenerate dated queue rather than quietly deleting items");
 assert.equal(ids.size,146,"Duplicate unresolved identities must be reviewed");
 const byId=new Map(index.map(x=>[x.id,x]));
 for(const x of items){
  const product=byId.get(x.id);
  assert.ok(product,"Queue identity missing from catalogue: "+x.id);
  assert.equal(x.name,product.name,"Display name drift: "+x.id);
  // Special FoSCoS routes are a catalogue routing explanation, not an FSSR
  // clause: the product's fssr field can be empty or a separate legal note.
  if(x.section==="special")assert.ok(x.fssr.length>0,"Missing special-route review label "+x.id);
  else assert.equal(x.fssr,product.fssr,"FSSR drift: "+x.id);
 }
});
test("Every unresolved family subtotal agrees with its actual rows",()=>{
 const matches=[...queue.matchAll(/^### FSSR (.+?) \((\d+)\)$/gm)];
 const items=queueItems();
 assert.ok(matches.length>=10);
 for(const [,family,count] of matches)
  assert.equal(items.filter(x=>x.section===family).length,Number(count),family);
 assert.match(queue,/Products with complete contaminant compliance independently established \| 0 claimed/);
 assert.match(queue,/Status: unresolved evidence, not an exemption/);
});
