/* Schedule II of the Cocoa Beans Grading and Marking Rules, 1996. */
(function(root){
  'use strict';
  const {beans,mass,products}=root.PMSVCacaoResidues;
  const area='AGMARK cocoa bean purchase grades';
  const source='https://upload.indiacode.nic.in/showfile?actid=AC_CEN_23_31_00011_193701_1535099362507&filename=cocoa_beans_grading_and_marking_rules%2C_1996.pdf&type=rule#page=3';
  const scope='Use a whole fermented, dried bean sample and the grade requested on the purchase specification. General quality conditions and authorised grading are separate from these six numerical comparisons.';
  const criteria=[
    ['gradeMould','Mouldy beans','% by count','maximum',3,4,'Internal mould visible on cutting.'],
    ['gradeSlaty','Slaty beans','% by count','maximum',3,8,'Slaty colour on at least half the exposed surface.'],
    ['gradeCombined','Insect-damaged, germinated or flat beans','% by count','maximum',3,6,'Use the combined count of distinct affected beans. FSSAI 2.3.54 assesses insect damage separately from germinated and flat beans.'],
    ['gradeMoisture','Moisture','% by mass','maximum',7.5,7.5,'Use the moisture of the bean sample by weight.'],
    ['gradeWeight','Weight of 100 beans','g per 100 beans','minimum',100,90,'Weigh 100 whole beans. A count per 100 grams has a different basis.'],
    ['gradeBrown','Uniformly brown fermented beans on cutting','% by count','minimum',80,70,'Use the percentage by count showing uniform brown colour when cut.']
  ].map(([field,name,unit,direction,I,II,note])=>({field,name,unit,direction,I,II,note}));
  const fields=['gradeLot','gradeSpec','gradeReport',...criteria.map(r=>r.field)];
  const sample=id=>id===mass?'Separately sampled incoming whole cocoa beans':'Whole fermented and dried cocoa beans';
  function evaluate(r,state,grade){
    const raw=String(state[r.field]??'').trim();
    if(!raw)return 'Awaiting result';
    if(!['gradeLot','gradeSpec','gradeReport'].every(k=>String(state[k]||'').trim()))return 'Enter lot, specification and report';
    const {decimal}=root.PMSVCulinarySauces, value=decimal(raw),limit=decimal(String(r[grade]));
    if(!value||r.field==='gradeWeight'&&value.n===0n||r.unit.startsWith('%')&&value.n>100n*value.scale)return 'Check value and unit';
    const n=value.n*limit.scale, bound=limit.n*value.scale;
    return (r.direction==='minimum'?n>=bound:n<=bound)?'Meets '+r.direction:'Outside '+r.direction;
  }
  function comparisons(r,state){
    return 'Grade I: '+evaluate(r,state,'I')+' · Grade II: '+evaluate(r,state,'II');
  }
  function planRows(id,state={}){
    if(!products.has(id))return [];
    return criteria.map(r=>({area,article:'AGMARK Schedule II, columns 2–7',form:sample(id),parameter:r.name,
      status:'Purchase-grade reference for whole beans',limit:'',unit:'',source,
      notes:['Grade I '+r.direction+' '+r.I+' '+r.unit+'; Grade II '+r.direction+' '+r.II+' '+r.unit+'.',r.note,scope,
        state[r.field]?[state.gradeLot,state.gradeSpec,state.gradeReport,state[r.field]+' '+r.unit,comparisons(r,state)].filter(Boolean).join(' · '):''].filter(Boolean).join(' ')}));
  }
  function exportRows(id,state={}){
    const rows=[['Sample','Measurement','Unit','Criterion','Grade I','Grade II','Reporting basis','Scope','Source','Bean lot','Purchase specification','Lab report','Measured value','Grade I comparison','Grade II comparison']];
    if(id&&!products.has(id))return rows;
    const s=id?state:{};
    for(const r of criteria)rows.push([sample(id),r.name,r.unit,r.direction,r.I,r.II,r.note,scope,source,s.gradeLot||'',s.gradeSpec||'',s.gradeReport||'',s[r.field]||'',id?evaluate(r,s,'I'):'',id?evaluate(r,s,'II'):'']);
    return rows;
  }
  root.PMSVCocoaGrades=Object.freeze({beans,mass,products,criteria,fields,area,source,scope,sample,comparisons,planRows,exportRows});
})(globalThis);
