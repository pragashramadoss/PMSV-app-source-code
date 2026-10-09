'use strict';
// Real Chromium UI regression: type into the actual Step 2 DOM, allow every
// competing input/change/blur/keyup handler to run, and verify final selection.
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const child=spawn('python3',['-m','http.server','18777','--bind','127.0.0.1','--directory','fssai-product-helper-preview-01'],{stdio:'ignore'});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();
 page.on('console',msg=>{if(msg.type()==='error')console.log('BROWSER ERROR:',msg.text().slice(0,400));});
 page.on('pageerror',err=>console.log('PAGE EXCEPTION:',err.message.slice(0,400)));
 try {
  let loaded=false;
  for(let attempts=0;attempts<30;attempts++){
    try{const response=await page.goto('http://127.0.0.1:18777/',{waitUntil:'domcontentloaded',timeout:10000});if(response?.ok()){loaded=true;break;}}catch(e){}
    await new Promise(r=>setTimeout(r,150));
  }
  assert.ok(loaded,'Local HTTP server did not start');
  await page.waitForFunction(()=>typeof productCatalog==='function'&&productCatalog().some(p=>p.id==='06-06-1-millets'),{timeout:35000});
  // Delay long enough for the full product-master fetch to replace the quick index.
  await page.waitForFunction(()=>!!document.getElementById('productMasterStatus')?.textContent?.includes('Product selector loaded'),{timeout:35000});
  const input=page.locator('#proprietaryProductName');
  const selected=()=>page.locator('#proprietaryStandardSelect').inputValue();
  const snapshot=()=>page.evaluate(()=>({
    name:document.getElementById('proprietaryProductName')?.value,
    chosen:document.getElementById('proprietaryStandardSelect')?.value,
    suggestion:document.getElementById('proprietaryStandardSuggestion')?.innerText.slice(0,280),
    option:document.querySelector('#proprietaryStandardSelect option:checked')?.textContent,
    build:document.getElementById('buildBadge')?.textContent
  }));
  const checks=[
    ['ragi','06-06-1-millets'],
    ['Ragi Flour','06-06-2-ragi-flour'],
    ['ragi','06-06-1-millets'],
    ['Finger Millet','06-06-1-millets'],
    ['finger millet flour','06-06-2-ragi-flour'],
    ['mandua','06-06-1-millets'],
    ['Ragi','06-06-1-millets']
  ];
  for(const [query,want] of checks){
    await input.fill(query);
    await page.waitForTimeout(450); // allow deferred input handlers to run
    const got=await selected();
    console.log('QUERY',JSON.stringify(query),'EXPECTED',want,'ACTUAL',got,'UI',JSON.stringify(await snapshot()));
    assert.equal(got,want,'Wrong standardized product after full browser event sequence');
  }
  // Find action and confirmation should retain the same grain identity.
  await page.locator('#findNearestStandard').click();
  await page.waitForTimeout(700);
  assert.equal(await selected(),'06-06-1-millets','Find button changed Ragi to flour');
  await page.locator('#confirmProprietaryStandard').click();
  await page.waitForTimeout(450);
  const confirmation=await page.evaluate(()=>document.getElementById('proprietaryStandardSuggestion')?.innerText||'');
  assert.match(confirmation,/Finger Millet|Ragi/i);
  assert.ok(!confirmation.includes('Ragi Flour'),'Confirmation silently switched to flour');
  console.log('PASS: Ragi grain/browser routing and confirmation');
 }finally{await browser.close();}
})().catch(e=>{console.error('BROWSER TEST FAILURE:',e.stack||e);process.exitCode=1;}).finally(()=>{child.kill('SIGTERM');});
