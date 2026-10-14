"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/",dir=root+"data/rules/";
const read=n=>JSON.parse(fs.readFileSync(dir+n,"utf8"));
const data=read("fssai-current35-legal-source-conflicts-batch17-2026-10-14.json");
const b16=read("fssai-current35-seven-named-commodity-research-batch16-2026-10-13.json");
const b14=read("fssai-current35-adjudication-workbench-batch14-2026-10-13.json");
const queue=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const code=fs.readFileSync(root+"fssai-current35-legal-source-conflicts-batch17-2026-10-14.js","utf8");
function digest(obj){const s=JSON.stringify(obj);let a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519);}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");}
function ctx(){
 const s={pmsvB16Valid:()=>true,pmsvB16Digest:digest,pmsvB16Data:b16,pmsvB14Data:b14,pmsv35Queue:queue,pmsv498Ledger:ledger,
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
 pmsvB14Esc:x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))};
 vm.createContext(s);
 vm.runInContext(code,s);s.pmsvB17Data=data;return s;
}
test("Batch 17 canonical 533/498/35 and 0 approvals",()=>{
 const c=ctx();assert.equal(c.pmsvB17Valid(),true);
 assert.equal(ledger.records.length,533);assert.equal(ledger.first_source_pending,35);
 assert.equal(data.results.new_first_source_promotions,0);assert.equal(data.results.active_numeric_limits_assigned,0);
 assert.equal(data.results.verified_lot_results,0);assert.equal(data.results.full_compliance_approvals,0);
 assert.equal(data.results.canonical_ledger_modified,false);assert.equal(data.results.wordpress_modified,false);
});
test("35 same immutable catalog IDs, 3+7+1+24 matrix, six distinct exclusions",()=>{
 assert.equal(data.all_pending_cases.length,35);
 assert.deepEqual(data.all_pending_cases.map(x=>x.catalog_id),queue.review_records.map(x=>x.catalog_id));
 assert.deepEqual(data.all_pending_cases.map(x=>x.catalog_id),b16.cases.map(x=>x.catalog_id));
 const cnt={};for(const x of data.all_pending_cases){cnt[x.research_state]=(cnt[x.research_state]||0)+1;assert.equal(x.no_limit_activated,true);assert.equal(x.source_status,"FIRST_EXACT_SOURCE_PENDING");}
 assert.deepEqual(cnt,{NO_SPECIFIC_NEW_CANDIDATE:24,PREVIOUS_THREE_CONDITIONAL:3,PREVIOUS_SEVEN_RESEARCH:7,B17_ADDITIONAL_NAMED_COMMODITY_RESEARCH:1});
 assert.equal(new Set(data.exact_nontransfer_findings.map(x=>x.catalog_id)).size,6);
});
test("Authoritative high-ash conflict, distinct total/sulphated ash and cocoa/salt/coconut guards",()=>{
 const m=Object.fromEntries(data.exact_nontransfer_findings.map(x=>[x.catalog_id,x]));
 assert.match(m["11-11-1-dried-glucose-syrup"].finding,/not more than 1\.0%/i);
 assert.match(m["11-11-1-dried-glucose-syrup"].finding,/exceeding 1\.0%/i);
 assert.match(m["11-11-1-misri"].finding,/distinct measurement/);
 assert.match(m["05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake"].finding,/dry fat-free/);
 assert.match(m["12-12-1-salt-substitutes"].finding,/not automatically/);
 assert.match(m["04-04-1-coconut-milk-powder"].finding,/not bovine/);
 assert.match(m["06-06-2-carob-powder"].finding,/different botanical/);
});
test("Coffee-chicory OTA published coffee 5 microgram/kg is research only",()=>{
 const p=data.new_legal_article_research;
 assert.equal(p.catalog_id,"coffee-chicory-mixture");assert.equal(p.analyte,"Ochratoxin A");assert.equal(p.published_source_value,5);
 assert.equal(p.published_source_unit,"µg/kg");assert.equal(p.documentary_gates.length,4);
 assert.match(p.scope_blocker,/not automatically/);assert.equal(data.future_amendment_commencement,"2026-12-01");
 assert.equal(data.future_amendment_auto_applied,false);
});
test("Product render is gated by exact ID, food name, FSSR and FCS; forged data fail closed",()=>{
 const c=ctx(),make=id=>{const p=b14.cases.find(x=>x.catalog_id===id);return {id,name:p.product_name,fssr:p.fssr,fcs:p.fcs};};
 assert.match(c.pmsvB17Html(make("coffee-chicory-mixture")),/REFERENCE ONLY/);
 assert.match(c.pmsvB17Html(make("11-11-1-dried-glucose-syrup")),/NO APPLIED LIMIT/);
 assert.equal(c.pmsvB17Html(make("10-10-2-egg-powder")),"");
 assert.match(c.pmsvB17Html({...make("coffee-chicory-mixture"),fcs:"changed"}),/identity mismatch/);
 assert.match(c.pmsvB17MatrixHtml(),/35 still pending/);
 const altered=JSON.parse(JSON.stringify(data));altered.results.full_compliance_approvals=1;c.pmsvB17Data=altered;
 assert.equal(c.pmsvB17Valid(),false);
});
test("Batch17 previews only after Batch16; no live WordPress mutation",()=>{
 const html=fs.readFileSync(root+"index.html","utf8");
 const name="fssai-current35-legal-source-conflicts-batch17-2026-10-14.js";
 assert.equal(html.split(name).length,2);
 assert.ok(html.indexOf(name)>html.indexOf("fssai-current35-seven-named-commodity-research-batch16-2026-10-13.js"));
});
