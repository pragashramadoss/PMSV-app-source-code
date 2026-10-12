"use strict";
var pmsvTenOfficialScope=null;
var pmsvTenTartaricIsomer="unknown";
var pmsvBeforeTenOfficialLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeTenOfficialLoad();
 pmsvTenOfficialScope=null;
 try{
  const res=await fetch('./data/rules/fssai-ten-official-positive-interpretation-2026-10-12.json?v=20261012-official10',{cache:'reload'});
  if(!res.ok)throw Error('Official safety references not available');
  const d=await res.json();
  if(!pmsvTenOfficialScopeValid(d))throw Error('Official FSSAI applicability verification failed');
  pmsvTenOfficialScope=d;
 }catch(e){pmsvTenOfficialScope=null;}
};
function pmsvTenOfficialScopeValid(d){
 const l=pmsvCurrent533SourceLedger,c=contaminantsDb,chap=Array.isArray(chapterRuleDbs)?chapterRuleDbs:[];
 if(!d||!l||!c||d.records?.length!==10||d.source_rows?.length!==5||
  d.catalogue!==533||d.partial!==417||d.pending!==116||d.promotions!==0||d.full_approvals!==0||
  l.partial_exact!==417||l.first_source_pending!==116||
  d.sources?.ctr!==c.official_sources?.[0]?.url||
  d.sources?.faq!=='https://www.fssai.gov.in/upload/uploadfiles/files/FAQs_Diary_12_07_2022.pdf'||
  d.source_policy!=='OFFICIAL_FSSAI_FOSCOS')return false;
 const pend=new Map(l.records.filter(x=>x.source_status==='FIRST_EXACT_SOURCE_PENDING').map(x=>[x.catalog_id,x]));
 if(pend.size!==116||new Set(d.records.map(x=>x.catalog_id)).size!==10)return false;
 const aa=d.records.filter(x=>x.kind==='corresponding_dairy_analogue_safety'),f=d.records.find(x=>x.kind==='fatspread_processing'),t=d.records.find(x=>x.kind==='stereoisomer_tartaric');
 if(aa.length!==8||new Set(aa.map(x=>x.fcs)).size!==8||
  aa.some(x=>x.faq_question!==7||x.source_url!==d.sources.faq||
     x.product_name!=='Analogue in the dairy context')||
  t?.catalog_id!=='99-99-1-acidity-regulators-l-tartaric-acid'||
  t.cas!=='87-69-4'||t.ins!=='334'||t.fssr_identity!=='3.2.10(4)'||
  t.source_url!==d.sources.chapter3||f?.catalog_id!=='02-02-2-fat-spread'||
  f.source_url!==d.sources.chapter22||f.process_fat_range?.[0]!==40||f.process_fat_range?.[1]!==80)return false;
 if(d.records.some(x=>{
  const p=pend.get(x.catalog_id);
  return !p||p.product_name!==x.product_name||String(p.fssr||'')!==String(x.fssr||'')||
   String(p.fcs||'')!==String(x.fcs||'')||x.numeric_auto_apply!==false||
   x.lab_pass!==false||x.complete_compliance!==false||x.first_exact_finished_match!==false||
   !x.requires?.length||!x.exclude||!x.source_url?.startsWith('https://')||
   !x.source_url.includes('fssai.gov.in')||x.source_keys.some(k=>!d.source_rows.some(s=>s.key===k));
 }))return false;
 const ch3=chap.find(x=>x.chapter==='3'),ch22=chap.find(x=>x.chapter==='2.2');
 const s=ch3?.identity_purity_standards?.find(x=>x.key==='3.2.10(4)'),
  fs=ch22?.standards?.find(x=>x.key==='2.2.5(3)');
 if(ch3?.official_sources?.[0]?.url!==d.sources.chapter3||ch22?.official_sources?.[0]?.url!==d.sources.chapter22||
  s?.identity?.cas!=='87-69-4'||s?.identity?.ins!=='334'||fs?.composition?.[0]?.min!==40||fs?.composition?.[0]?.max!==80)return false;
 const pinned=[
  ['tartaric-lead','Lead','L (+) -Tartaric acid',2],
  ['tartaric-arsenic','Arsenic','L (+)- Tartaric acid',3],
  ['minarine-lead','Lead','Minarine (Low Fat Spread)',0.1],
  ['minarine-arsenic','Arsenic','Minarine (Low Fat Spread)',0.1],
  ['fatspread-nickel','Nickel','All hydrogenated, partially hydrogenated, interesterified vegetable oils and fats such as vanaspati, table margarine, bakery and industrial margarine, bakery shortening, fat spread and partially hydrogenated margarine, bakery shortening, fat spread and partially hydrogenated soyabean oil',1.5]
 ];
 for(const [key,analyte,article,limit] of pinned){
  if(d.source_rows.filter(x=>x.key===key&&x.analyte===analyte&&x.article===article&&x.limit===limit&&x.unit==='mg/kg').length!==1||
   (c.metal_article_rules_v9?.[analyte]||[]).filter(x=>x.row_type==='exact'&&x.article===article&&x.limit===limit&&x.unit==='mg/kg').length!==1)return false;
 }
 if(s.requirements?.find(x=>x.parameter==='Lead')?.value!==2||
    s.requirements?.find(x=>x.parameter==='Arsenic')?.value!==3)return false;
 return true;
}
function pmsvChooseTenTartaricIsomer(key){
 if(!['unknown','l_plus_reported','other_isomer'].includes(key))return;
 pmsvTenTartaricIsomer=key;
 if(typeof renderProductContaminants==='function')renderProductContaminants();
}
function pmsvTenOfficialScopeHtml(p){
 if(!p||!pmsvTenOfficialScope?.records?.some(x=>x.catalog_id===p.id))return '';
 const d=pmsvTenOfficialScope;
 if(!pmsvTenOfficialScopeValid(d)||!pmsvCurrent533SourceProofValid(p))
  return '<div class="notice"><b>Official source withheld:</b> identity or FSSAI source mismatch; no compliance result.</div>';
 const x=d.records.find(x=>x.catalog_id===p.id);
 if(p.name!==x.product_name||String(p.fssr||'')!==String(x.fssr||'')||String(p.fcs||'')!==String(x.fcs||''))
  return '<div class="notice"><b>Official product identity mismatch: withheld.</b></div>';
 let content='';
 if(x.kind==='corresponding_dairy_analogue_safety')content='<div class="notice"><b>Positive legal interpretation — FSSAI FAQ Q7:</b> Corresponding dairy-category contaminant safety standards apply to analogues even though they are not legally milk. Exact numeric finished-food article still unresolved; no milk-only numeric limit inherited.</div>';
 else if(x.kind==='stereoisomer_tartaric'){
  const options=[['unknown','Unconfirmed L(+/−) material'],['l_plus_reported','Operator reports L(+) CAS 87-69-4 — not certified'],['other_isomer','D(-), DL/racemic or other — no source transfer']].map(([k,v])=>
    '<option value="'+k+'"'+(pmsvTenTartaricIsomer===k?' selected':'')+'>'+esc(v)+'</option>').join('');
  content='<div class="notice"><b>Exact named FSSR and CTR source for L(+) isomer only.</b> INS 334 and CAS 87-69-4 must be verified; FoSCoS L(+/−) name does not establish this identity.</div>'+
   '<label for="pmsvTenTartaric">Operator-reported isomer (not proof)</label>'+
   '<select id="pmsvTenTartaric" onchange="pmsvChooseTenTartaricIsomer(this.value)">'+options+'</select>'+
   (pmsvTenTartaricIsomer==='l_plus_reported'?
    '<div class="notice"><b>REVIEW ONLY — NOT APPLIED:</b> L(+) Lead 2 mg/kg, Arsenic 3 mg/kg. CoA/isomer and lab results must be confirmed independently.</div>':
    '<div class="notice"><b>Numeric article NOT APPLIED</b> to ambiguous or other isomers.</div>');
 }else content='<div class="notice"><b>Separate fat-source applicability:</b> FSSR Fat Spread 40–80% is not automatically Minarine (Low Fat Spread). Minarine Lead and Arsenic 0.1 mg/kg each are comparison-only; Nickel 1.5 mg/kg requires the legally named hydrogenation/interesterification article. No numeric limit applied.</div>';
 return '<details class="card" style="margin-top:12px"><summary><b>FSSAI official safety-source clarification</b> — '+esc(x.kind.replaceAll('_',' '))+'</summary>'+
  content+'<p><b>Positive evidence still needed:</b></p><ul>'+x.requires.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>'+
  '<p><b>Do not inherit:</b> '+esc(x.exclude)+'</p>'+
  '<small><a href="'+esc(x.source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI interpretation/product standard</a> · '+
  '<a href="'+esc(d.sources.ctr)+'" target="_blank" rel="noopener noreferrer">Official Version IX contaminant table</a></small>'+
  '<p><small>This establishes source-law context, not sample PASS or a full regulatory compliance assessment.</small></p></details>';
}
var pmsvBeforeTenCurrentHtml=pmsvCurrent533SourceStatusHtml;
pmsvCurrent533SourceStatusHtml=function(p){return pmsvBeforeTenCurrentHtml(p)+pmsvTenOfficialScopeHtml(p);};
