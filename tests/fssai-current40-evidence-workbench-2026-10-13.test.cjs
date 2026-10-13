"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const data=rd("fssai-current40-five-source-decisions-workbench-2026-10-13.json");
const intake=rd("fssai-current40-evidence-intake-2026-10-13.json");
const js=fs.readFileSync(path.join(root,"fssai-current40-evidence-workbench-2026-10-13.js"),"utf8");
const digest=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const mem=new Map(),listener={};
 const c={console,window:{localStorage:{getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)}},document:{addEventListener:(k,v)=>listener[k]=v},
 pmsv40ClosureIntakeValid:()=>true,pmsv40ClosureIntake:intake,pmsvReviewSnapshotDigest:digest,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"Existing evidence intact"};
 vm.createContext(c);vm.runInContext(js,c);c.pmsv40WorkbenchSources=JSON.parse(JSON.stringify(data));
 return {c,mem,listener};
}
test("Data and source identity: 40 cases, 160 flags, five legal distinctions",()=>{
 const {c}=ctx();assert.equal(c.pmsv40WorkbenchValid(),true);
 assert.equal(intake.intake_records.length,40);assert.equal(intake.minimum_document_requests,160);
 assert.equal(data.dossiers.length,5);assert.equal(data.pending,40);
 assert.equal(data.auto_numeric_thresholds,0);assert.equal(data.new_source_promotions,0);
});
test("Source statements preserve distinctions in quinoa, chia, cube sugar, misri and glucose",()=>{
 const m=new Map(data.dossiers.map(x=>[x.id,x]));
 assert.match(m.get("06-06-1-quinoa").facts,/exclude quinoa/);
 assert.match(m.get("06-06-1-chia-seeds").facts,/mint.family/);
 assert.match(m.get("11-11-1-cube-sugar").facts,/analytically distinct/);
 assert.match(m.get("11-11-1-misri").facts,/palmyrah/);
 assert.match(m.get("11-11-1-dried-glucose-syrup").facts,/more than 1.0%/);
});
test("Four manually received documents still mean NO regulatory article match or pass",()=>{
 const {c,mem}=ctx(),x=intake.intake_records[0];
 mem.set(c.pmsv40WorkbenchStorageKey,JSON.stringify({[x.catalog_id]:{documents:[true,true,true,true],reference:"Ref ID",note:"Not validated"}}));
 const v=c.pmsv40WorkbenchExportCase(x.catalog_id);
 assert.equal(v.receipt_count,4);
 assert.equal(v.status,"FIRST_EXACT_SOURCE_PENDING");
 assert.equal(v.product_regulatory_approval,false);
 assert.equal(v.verified_laboratory_result,false);
 const html=c.pmsv40WorkbenchHtml({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
 assert.match(html,/4\/4 received, unverified/);
 assert.match(html,/STILL PENDING/);
});
test("Local receipt event saves without altering canonical legal status",()=>{
 const {c,listener}=ctx(),id=intake.intake_records[0].catalog_id;
 const card={getAttribute:()=>id,querySelector:()=>null};
 listener.change({target:{closest:()=>card,getAttribute:(k)=>k==="data-pmsv40-wb-check"?"2":null,hasAttribute:()=>false,checked:true}});
 assert.equal(c.pmsv40WorkbenchExportCase(id).receipt_count,1);
 assert.equal(c.pmsv40WorkbenchExportAll().product_approvals,0);
 listener.input({target:{closest:()=>card,getAttribute:()=>null,hasAttribute:(k)=>k==="data-pmsv40-wb-note",value:"x".repeat(800)}});
 assert.equal(c.pmsv40WorkbenchExportCase(id).notes.length,500);
});
test("Corrupt local or official source records fail closed",()=>{
 const {c,mem}=ctx();
 mem.set(c.pmsv40WorkbenchStorageKey,JSON.stringify({fake:{documents:[true,true,true,true],product_regulatory_approval:true}}));
 assert.equal(Object.keys(c.pmsv40WorkbenchRead()).length,0);
 for(const f of [x=>x.dossiers[0].id="fabricated",x=>x.dossiers[1].sources=["https://evil.example","https://evil.example"],x=>x.lot_passes=1]){
  const z=ctx().c;f(z.pmsv40WorkbenchSources);assert.equal(z.pmsv40WorkbenchValid(),false);
 }
});
test("Script loaded after existing 40 intake and before future amendment control",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const a=html.indexOf("fssai-current40-evidence-intake-2026-10-13.js");
 const b=html.indexOf("fssai-current40-evidence-workbench-2026-10-13.js");
 const c=html.indexOf("fssai-2026-may-533-89-effective-date.js");
 assert.ok(a>=0&&b>a&&c>b);
});
