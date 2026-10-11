"use strict";
var pmsvGrainProof=null;
async function pmsvLoadGrainProof(){
 try{
  const r=await fetch('./data/rules/fssai-other-foodgrains-b1-first-source-2026-10-11.json?v=20261011-grain415',{cache:'reload'});
  if(!r.ok)throw Error('No FSSAI grain proof');
  const d=await r.json();
  if(d.catalog_id!=='06-06-1-any-other-foodgrains'||d.positive_first_source!==true||d.partial_after!==415||d.pending_after!==118||d.complete_compliance_pass!==false||d.matched_articles?.length!==2)throw Error('FSSAI grain source mismatch');
  pmsvGrainProof=d;
 }catch(e){pmsvGrainProof=null;}
}
function pmsvGrainProofValid(p){
 const d=pmsvGrainProof,ctr=contaminantsDb;
 if(!p||p.id!=='06-06-1-any-other-foodgrains'||!d||!ctr)return false;
 if(p.name!==d.product_name||p.fssr!==d.fssr||p.fcs!==d.fcs||p.rule_key!==d.clause||
  d.source_contaminants!==ctr.official_sources?.[0]?.url||ctr.source_version!=='Version IX (03.02.2026)'||
  d.source_standard!=='https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf'||
  d.partial_after!==415||d.pending_after!==118||d.positive_first_source!==true||d.complete_compliance_pass!==false)return false;
 const chapter=(Array.isArray(chapterRuleDbs)?chapterRuleDbs:[]).find(x=>x?.chapter==='2.4');
 const parent=chapter?.standards?.find(x=>x.key==='2.4.6'),specific=chapter?.standards?.find(x=>x.key==='2.4.6(15)');
 if(!parent?.quality_rules?.some(x=>x.includes('whole or broken kernels of cereals, millets and pulses'))||
    specific?.name!==p.name||specific?.official_source_url!==d.source_standard)return false;
 const exp={aflatoxin_b1:10,total_aflatoxins:15};
 return d.matched_articles?.length===2&&d.matched_articles.every(x=>{
  const g=ctr.crop_contaminants?.[x.source_group];
  return x.limit===exp[x.source_group]&&x.unit==='µg/kg'&&g?.unit==='µg/kg'&&
   x.articles?.length===2&&['Cereal and cereal products','Pulses'].every(a=>
     x.articles.includes(a)&&(g.rules||[]).filter(r=>r.article===a&&Number(r.limit)===x.limit).length===1);
 });
}
function pmsvGrainProofHtml(p){
 if(p?.id!=='06-06-1-any-other-foodgrains')return '';
 if(!pmsvGrainProofValid(p))return '<div class="notice"><b>Grain source withheld:</b> FSSR definition, article or units could not be verified. No numeric limit or compliance PASS applied.</div>';
 const d=pmsvGrainProof;
 return '<div class="card"><div class="section-title"><h3>Positive first-source evidence — other foodgrains</h3><span>Partial evidence, not full approval</span></div>'+
 '<div class="notice">FSSR 2.4.6 covers cereal, millet and pulse kernels. The official cereal and pulse articles carry identical aflatoxin maxima. Do not apply this source to quinoa, chia, root starch, biscuits or papad by name. <b>No sample compliance PASS.</b></div>'+
 '<div class="tablewrap"><table><thead><tr><th>Contaminant</th><th>Maximum</th><th>Named source articles</th></tr></thead><tbody>'+
 d.matched_articles.map(r=>'<tr><td>'+esc(r.contaminant)+'</td><td><b>'+esc(r.limit)+' '+esc(r.unit)+'</b></td><td>'+esc(r.articles.join(' / '))+'</td></tr>').join('')+'</tbody></table></div>'+
 '<ul>'+d.still_pending.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
 '<small><a href="'+esc(d.source_standard)+'" target="_blank" rel="noopener noreferrer">FSSAI FSSR 2.4.6</a> · <a href="'+esc(d.source_contaminants)+'" target="_blank" rel="noopener noreferrer">FSSAI Version IX</a></small></div>';
}
