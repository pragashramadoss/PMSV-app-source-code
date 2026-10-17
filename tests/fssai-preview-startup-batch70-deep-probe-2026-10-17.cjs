"use strict";
/* Batch70 deep diagnostic: read-only browser probe; NEVER a green end-to-end certificate. */
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const server=spawn("python3",["-m","http.server","18970","--directory","fssai-product-helper-preview-01","--bind","127.0.0.1"],{stdio:"ignore"});
const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage(),pageErrors=[],failed=[];
  await page.addInitScript(()=>{
    const old=window.fetch,pend=new Map(),trace=[];
    let serial=0;
    window.__B70FetchTrace={
     snapshot:()=>{
      const now=performance.now();
      return {outstanding:[...pend.entries()].map(([id,v])=>({...v,id,age_ms:Math.round(now-v.start)}))
       .sort((a,b)=>b.age_ms-a.age_ms).slice(0,15),
      lastCompleted:trace.slice(-12),totalSeen:serial};
     }
    };
    window.fetch=function(...args){
     const id=++serial,url=String(args[0]),start=performance.now();
     pend.set(id,{url,start});
     const p=old.apply(this,args);
     p.then(res=>{
       const x=pend.get(id);if(x)pend.delete(id);
       trace.push({id,url,ms:Math.round(performance.now()-start),status:res.status});
     },e=>{
       pend.delete(id);trace.push({id,url,ms:Math.round(performance.now()-start),error:String(e).slice(0,100)});
     });
     if(trace.length>60)trace.shift();
     return p;
    };
  });
  page.on("pageerror",e=>pageErrors.push((e.stack||e.message).slice(0,300)));
  page.on("requestfailed",r=>failed.push({url:r.url().slice(0,200),err:r.failure()?.errorText}));
  let ready=false;
  for(let i=0;i<40;i++)try{
   const response=await page.goto("http://127.0.0.1:18970/",{waitUntil:"domcontentloaded",timeout:10000});
   if(response?.ok()){ready=true;break;}
  }catch(_){await nap(200)}
  if(!ready){console.log("B70_PROBE_PAGE_UNAVAILABLE");return;}
  await page.evaluate(()=>{
   window.__B70ContaminantsSettled="PENDING";
   if(typeof pmsvContaminantsLoadPromise!=="undefined")
     pmsvContaminantsLoadPromise.then(()=>window.__B70ContaminantsSettled="FULFILLED",
      e=>window.__B70ContaminantsSettled="REJECTED "+String(e));
  });
  for(const [wait,seconds] of [[0,0],[7000,7],[11000,18],[12000,30],[15000,45]]){
   await nap(wait);
   const snapshot=await page.evaluate(()=>({
    t:Math.round(performance.now()),
    dom:document.readyState,
    b22:typeof pmsvB22StartupState==="undefined"?"UNDEFINED":pmsvB22StartupState,
    b22Error:typeof pmsvB22Stats==="undefined"?"UNDEFINED":pmsvB22Stats.lastError,
    contaminants:window.__B70ContaminantsSettled,
    b14:typeof pmsvB14Valid==="function"?pmsvB14Valid():null,
    b21:typeof pmsvB21Valid==="function"?pmsvB21Valid():null,
    b59:window.pmsvB59CTRSourceCrosswalk?.valid?.()||false,
    b63:window.pmsvB63CocoaMisri?.valid?.()||false,
    b64:window.pmsvB64OriginalLawCases?.valid?.()||false,
    b68:window.pmsvB68RemainingLeadP1?.valid?.()||false,
    panelIds:["pmsv-b63-cocoa-sugar-specifics","pmsv-b64-three-originals","pmsv-b68-lead-source-review"].map(x=>!!document.getElementById(x)),
    trace:window.__B70FetchTrace?.snapshot?.()||null
   }));
   console.log("B70_PROBE_T"+seconds+" "+JSON.stringify(snapshot));
  }
  console.log("B70_PROBE_PAGE_ERRORS "+JSON.stringify(pageErrors.slice(0,8)));
  console.log("B70_PROBE_FAILED "+JSON.stringify(failed.slice(0,8)));
  console.log("B70_PROBE_DIAGNOSTIC_ONLY_NOT_FULL_STARTUP_PASS");
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error("B70_PROBE_EXCEPTION",String(e));server.kill();process.exitCode=1;});
