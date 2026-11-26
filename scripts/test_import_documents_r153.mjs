import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../fssai-helper/',import.meta.url),ctx=vm.createContext({});
ctx.window=ctx;
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
for(const [,name] of html.matchAll(/<script src="((?:catalogue-|full-catalogue-|review-status-data|broad-contaminants)[a-z0-9-]*\.js)\?/g)){
  vm.runInContext(fs.readFileSync(new URL(name,dir),'utf8'),ctx);
}
const imports=ctx.PMSVImportDocuments,plan=ctx.PMSVTestingPlan,egg=ctx.PMSVVeterinary.eggPowderId;
const reg=ctx.PMSV_REVIEW_REGISTER.finishedSampleReview;
assert.equal(imports.routes.size,reg.importProducts);
assert.equal(imports.exportRows('2010-01-01').length,1);
assert.equal(imports.entries('11-11-5-honey').length,0);
for(const date of ['2026-11-26','2026-12-01']){
  const open=plan.openProductRows(null,date).slice(1).filter(r=>r[3]==='Import consignment');
  assert.equal(open.length,9);
  assert(open.every(r=>r[7]===''&&r[8]===''&&imports.isSource(r[11])));
  const guidance=imports.exportRows(date).slice(1);
  assert.equal(guidance.length,reg.importDocumentRows);
  const full=plan.exportRows(undefined,date,false,{importScope:'imported',importLot:'Private-153'}).filter(r=>r[2]===imports.area);
  assert.equal(full.length,guidance.length);
  for(const row of full){
    assert(row.slice(7,9).every(v=>v==='')&&row.slice(10,14).every(v=>v===''));
    assert.equal(row[6],'Conditional import document check');assert(imports.isSource(row[14]));
    assert(!row[9].includes('Private-153'));
    assert(guidance.some(g=>g[0]===row[0]&&g[2]===date&&g[3]===row[4]&&g[4]===row[5]&&g[8]===row[14]));
  }
  const state={importScope:'imported',importLot:'Private-153',importCountry:'France',importFacility:'Site URN 153'};
  const rows=plan.exportRows(egg,date,false,state).filter(r=>r[2]===imports.area);
  assert.equal(rows.filter(r=>r[6]==='Document reference recorded').length,1);
  assert.equal(rows.filter(r=>r[6]==='Document reference pending').length,2);
  assert(rows.every(r=>r[9].includes('Private-153')&&r[9].includes('France')));
  assert(rows.find(r=>r[5]==='Foreign manufacturing facility registration')[9].includes('Site URN 153'));
  assert(imports.entries(egg,{...state,importCountry:' '}).every(r=>r.status.startsWith('Identify consignment')));
  assert(imports.entries(egg,{...state,importScope:'outside'}).every(r=>r.status==='Outside this import route'&&!r.notes.includes('Private-153')));
}
assert(!imports.isSource('https://example.com/'));
assert(imports.routes.get('coffee-chicory-mixture').form.startsWith('Incoming imported coffee beans'));
assert(imports.routes.get(plan.routeIds.cocoa).form.startsWith('Incoming imported fermented and dried cocoa beans'));
assert(!imports.isSource(imports.routes.get(egg).docs[0].source+'?redirect=1'));
