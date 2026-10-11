"use strict";
var pmsvTwentySourceDb=null;
var pmsvTwentySubtypeChoices=Object.create(null);
async function pmsvLoadTwentySourceDb(){
 try{
  const r=await fetch('./data/rules/fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json?v=20261011-branch20',{cache:'reload'});
  if(!r.ok)throw Error('Official branch evidence missing');
  const d=await r.json();
  if(d.catalogue!==533||d.partial_evidence!==415||d.pending_first_exact!==118||
   d.review_products!==20||d.records?.length!==20||d.source_articles?.length!==11||
   d.verified_distinct_article_rows!==11||d.positive_conditional_branches!==25||
   d.no_new_unconditional_first_source_promotions!==true||d.finished_compliance_passes!==0)
   throw Error('Branch evidence metadata changed');
  pmsvTwentySourceDb=d;
 }catch(e){pmsvTwentySourceDb=null;}
}
function pmsvChooseTwentyBranch(x){
 if(typeof selectedCatalogProductForContaminants!=='function')return;
 const p=selectedCatalogProductForContaminants();
 const r=pmsvTwentySourceDb?.records?.find(x=>x.catalog_id===p?.id);
 if(!r||!['unverified',...r.branches.map(x=>x.id)].includes(x))return;
 pmsvTwentySubtypeChoices[p.id]=x;
 if(typeof renderProductContaminants==='function')renderProductContaminants();
}
function pmsvTwentyAllSourcesMatch(){
 const d=pmsvTwentySourceDb,c=contaminantsDb;
 if(!d||!c||d.review_products!==20||d.records?.length!==20||
    d.positive_conditional_branches!==25||d.source_articles?.length!==11||
    d.verified_distinct_article_rows!==11||d.catalogue!==533||
    d.partial_evidence!==415||d.pending_first_exact!==118||
    d.no_new_unconditional_first_source_promotions!==true||d.finished_compliance_passes!==0||
    d.official_ctr!==c.official_sources?.[0]?.url||c.source_version!==d.source_version)return false;
 const byKey=new Map(d.source_articles.map(x=>[x.key,x]));
 if(byKey.size!==11)return false;
 for(const x of d.source_articles){
  const a=x.key==='agaric_mushroom'?c.naturally_occurring_toxic_substances?.agaric_acid:c.metal_article_rules_v9?.[x.metal];
  if(!a||a.filter(row=>row.article===x.article&&row.unit===x.unit&&Number(row.limit)===x.value).length!==1)return false;
 }
 const chapter=(Array.isArray(chapterRuleDbs)?chapterRuleDbs:[]).find(x=>x?.chapter==='2.3');
 if(!chapter||chapter.official_sources?.[0]?.url!=='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf'||
    d.official_fssr!=='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf')return false;
 if(new Set(d.records.map(x=>x.catalog_id)).size!==20)return false;
 return d.records.every(r=>{
  const st=chapter.standards.find(x=>x.key===r.rule_key);
  return !!st&&r.branches.length>0&&r.official_chapter===d.official_fssr&&
    r.official_ctr===d.official_ctr&&r.unconditional_finished_article_promotion===false&&
    r.numeric_auto_apply===false&&r.no_sample_compliance_pass===true&&
    r.branches.every(b=>b.requires?.length===3&&b.article_keys.length>0&&b.article_keys.every(key=>byKey.has(key)));
 });
}
function sourcePinnedTwentyArticleBranchesHtml(p){
 if(!p||!pmsvTwentySourceDb?.records?.some(x=>x.catalog_id===p.id))return '';
 const withheld='<div class="notice"><b>Finished-article route withheld.</b> Exact FSSR product identity, CTR named article or source version is not authenticated. No limit or compliance result assigned.</div>';
 if(!pmsvTwentyAllSourcesMatch())return withheld;
 const d=pmsvTwentySourceDb,r=d.records.find(x=>x.catalog_id===p.id);
 if(!r||r.name!==p.name||r.fssr!==p.fssr||r.fcs!==p.fcs||r.rule_key!==p.rule_key)return withheld;
 const key=pmsvTwentySubtypeChoices[p.id]||'unverified';
 const branch=r.branches.find(x=>x.id===key);
 if(key!=='unverified'&&!branch)return withheld;
 const opts=[{id:'unverified',label:'Subtype, species, or process not documented'},...r.branches].map(x=>
   '<option value="'+esc(x.id)+'"'+(x.id===key?' selected':'')+'>'+esc(x.label)+'</option>').join('');
 const articles=branch?branch.article_keys.map(k=>d.source_articles.find(x=>x.key===k)):[];
 const note=branch?'<div class="notice"><b>Conditional named FSSAI reference — NOT APPLIED:</b> '+articles.map(x=>
  esc(x.metal)+': '+esc(x.value)+' '+esc(x.unit)+' ('+esc(x.article)+') — '+esc(x.matrix)).join('; ')+
  '</div><p><b>Positive proof still required:</b></p><ul>'+branch.requires.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':
  '<div class="notice"><b>No confirmed named finished article.</b> Choose a branch only after positive evidence. The branch is a local claim, not a laboratory result or regulatory clearance.</div>';
 return '<details class="card" style="margin-top:12px"><summary><b>Exact FSSAI mushroom, fruit or tomato source route</b> — '+esc(r.regulatory_case)+
  ' / conditional only</summary><div class="notice"><b>NOT A COMPLIANCE PASS:</b> '+esc(r.prohibited_inheritance)+'</div>'+
  '<label><b>Reported actual finished-product identity (local only, not verified):</b></label>'+
  '<select aria-label="Actual finished food identity evidence" onchange="pmsvChooseTwentyBranch(this.value)" style="width:100%;max-width:100%;margin-top:6px;padding:8px;border-radius:6px">'+opts+'</select>'+
  note+'<small><a href="'+esc(d.official_fssr)+'" target="_blank" rel="noopener noreferrer">Official Chapter 2.3</a> · '+
  '<a href="'+esc(d.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official Contaminants Version IX</a></small></details>';
}
