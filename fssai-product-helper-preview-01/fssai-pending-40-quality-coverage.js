"use strict";
/* Source coverage for current first-CTR-article PENDING records only.
 * FSSR quality != CTR article; neither constitutes laboratory or legal compliance PASS.
 */
function pmsvPending40QualityCoverage(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
    typeof pmsv40LegalGatesValid!=="function"||!pmsv40LegalGatesValid()||
    typeof pmsvQuality16Valid!=="function"||!pmsvQuality16Valid()||
    typeof pmsvQuality8Valid!=="function"||!pmsvQuality8Valid()||
    typeof pmsvQuality24CurrentStatusValid!=="function"||!pmsvQuality24CurrentStatusValid()||
    typeof pmsvQ15Valid!=="function"||!pmsvQ15Valid()||
    typeof pmsvQ4Valid!=="function"||!pmsvQ4Valid()||
    typeof pmsvQ10Valid!=="function"||!pmsvQ10Valid())return null;
 const q=pmsv40Queue,l=pmsv493Ledger,
   a=pmsvQuality16Data,b=pmsvQuality8Data,c=pmsvQ15Data,d=pmsvQ4Data,f=pmsvQ10Data;
 if(!q||!l||!a||!b||!c||!d||!f||
   q.review_records?.length!==40||l.records?.length!==533||
   l.partial_exact!==493||l.first_source_pending!==40||
   a.records?.length!==16||b.records?.length!==8||c.records?.length!==15||d.records?.length!==4||f.records?.length!==10||
   f.records.filter(x=>x.quality_dossier_counted).length!==1)return null;
 const joined=new Map([...a.records.map(x=>[x.catalog_id,"Q16"]),
   ...b.records.map(x=>[x.catalog_id,"Q8"]),
   ...c.records.map(x=>[x.catalog_id,"Q15"]),...d.records.map(x=>[x.catalog_id,"Q4"]),
   ...f.records.filter(x=>x.quality_dossier_counted).map(x=>[x.catalog_id,"Q10"])]);
 if(joined.size!==44)return null;
 const live=new Map(l.records.map(x=>[x.catalog_id,x])),set=new Set(),report=new Map();
 let withQuality=0;
 for(const x of q.review_records){
   const z=live.get(x.catalog_id);
   if(!z||set.has(x.catalog_id)||z.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     x.product_name!==z.product_name||String(x.fssr||"")!==String(z.fssr||"")||
     String(x.fcs||"")!==String(z.fcs||""))return null;
   const origin=joined.get(x.catalog_id)||null;
   if(origin){
     const source=origin==="Q16"?a.records:origin==="Q8"?b.records:origin==="Q15"?c.records:origin==="Q4"?d.records:f.records;
     const s=source.find(y=>y.catalog_id===x.catalog_id);
     if(!s||s.product_name!==x.product_name||
        String(s.fssr||"")!==String(x.fssr||"")||
        String(s.fcs||"")!==String(x.fcs||""))return null;
     withQuality++;
   }
   report.set(x.catalog_id,{name:x.product_name,fssr:x.fssr,fcs:x.fcs,quality_module:origin});
   set.add(x.catalog_id);
 }
 if(set.size!==40||withQuality!==31||40-withQuality!==9)return null;
 return report;
}
function pmsvPending40QualityCoverageHtml(p){
 if(!p||!pmsv40Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 const report=pmsvPending40QualityCoverage();
 if(!report)return '<div class="notice">Current pending/quality source reconciliation is unavailable. No CTR source approval or laboratory PASS.</div>';
 const x=report.get(p.id);
 if(!x||x.name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
   String(x.fcs||"")!==String(p.fcs||""))
   return '<div class="notice">Quality coverage identity mismatch. No PASS.</div>';
 const safe=v=>typeof esc==="function"?esc(String(v)):String(v).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
 const available=!!x.quality_module;
 const status=available?
   "Exact FSSR finished-product quality dossier is linked in PMSV (separate from contaminants).":
   "No separate exact FSSR finished-product quality dossier linked in PMSV yet. This does NOT mean that no legal quality standard exists.";
 return '<details class="card" style="margin-top:12px"><summary><b>Current 40-pending source coverage</b> · '+(available?"Quality reference linked":"Quality source review required")+'</summary>'+
 '<div class="notice"><b>FIRST EXACT CONTAMINANT ARTICLE STILL PENDING.</b> No numerical CTR limit auto-assigned; no finished lot verified or product approval.</div>'+
 '<p><b>Quality reference:</b> '+safe(status)+'</p>'+
 '<p><b>Source review:</b> '+(available?"Open the product-specific FSSR quality panel on this page to see values and conditions.":"Verify the precise finished-food identity, FSSR clause, subtypes, analytical bases and official amendment date before recording any limits.")+'</p>'+
 '<p><b>Independent legal review:</b> Official CTR Version IX finished-article metal/toxin/pesticide applicability and actual laboratory results remain necessary.</p>'+
 '<small>Current first-source queue: 40; separate FSSR quality references linked: 31; not yet linked: 9. Source evidence only, not regulatory PASS.</small></details>';
}
var pmsvBeforePending40QualityCoveragePanel=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvPending40QualityCoverageHtml(p)+pmsvQ4Html(p)+pmsvBeforePending40QualityCoveragePanel(p)};
