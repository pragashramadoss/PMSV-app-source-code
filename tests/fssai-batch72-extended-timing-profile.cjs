"use strict";
const {spawn}=require("node:child_process"),{chromium}=require("playwright");
const server=spawn("python3",["-m","http.server","18973","--directory","fssai-product-helper-preview-01","--bind","127.0.0.1"],{stdio:"ignore"});
const nap=n=>new Promise(r=>setTimeout(r,n));
(async()=>{let browser;
 try{
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage(),pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(e.message));
 await page.addInitScript(()=>{
  const origFetch=window.fetch,events=[];
  window.__b72Perf={events, get:()=>events.slice()};
  window.fetch=function(...args){
   const u=String(args[0]);const m=u.match(/fssai-current35-[^/?]+-batch([0-9]+)-/);
   const start=performance.now();
   if(m)events.push({batch:+m[1],event:"start",ms:Math.round(start)});
   return origFetch.apply(this,args).then(resp=>{
    if(m)events.push({batch:+m[1],event:"response",ms:Math.round(performance.now()),http:resp.status});
    return resp;
   },err=>{if(m)events.push({batch:+m[1],event:"failure",ms:Math.round(performance.now())});throw err;});
  };
 });
 let ready=false;
 for(let i=0;i<40;i++)try{
  const response=await page.goto("http://127.0.0.1:18973/",{waitUntil:"domcontentloaded",timeout:12000});
  if(response?.ok()){ready=true;break;}
 }catch(_){await nap(200)}
 if(!ready)throw Error("Preview not reachable");
 await page.waitForFunction(()=>typeof pmsvB22StartupState!=="undefined"&&["READY","INTEGRITY_BLOCKED"].includes(pmsvB22StartupState),null,{timeout:60000});
 const b22=await page.evaluate(()=>({s:pmsvB22StartupState,t:Math.round(performance.now())}));
 console.log("B72_PROFILE_CORE "+JSON.stringify(b22));
 if(b22.s!=="READY")throw Error("Core not ready");
 const start=Date.now();
 const pending=page.evaluate(()=>window.pmsvB70ExtendedResearch.request());
 let next=Date.now()+15000;
 while(Date.now()-start<380000){
  const done=await Promise.race([pending.then(()=>true),nap(5000).then(()=>false)]);
  if(Date.now()>=next){
   const info=await page.evaluate(()=>({
    state:window.pmsvB70ExtendedResearch.getState(),
    recent:window.__b72Perf?.events.slice(-9),
    tasks:performance.getEntriesByType("longtask").length
   }));
   console.log("B72_PROFILE_CHECKPOINT "+JSON.stringify({atSeconds:Math.floor((Date.now()-start)/1000),...info}));
   next=Date.now()+15000;
  }
  if(done)break;
 }
 const state=await page.evaluate(()=>window.pmsvB70ExtendedResearch.getState());
 const events=await page.evaluate(()=>window.__b72Perf.get());
 const started=events.filter(e=>e.event==="start");
 console.log("B72_PROFILE_RESULT "+JSON.stringify({state,seconds:Math.round((Date.now()-start)/1000),numFetches:started.length}));
 console.log("B72_PROFILE_BATCH_STARTS "+JSON.stringify(started.filter(e=>e.batch>=23).map(e=>({batch:e.batch,ms:e.ms}))));
 console.log("B72_PROFILE_ERRORS "+JSON.stringify(pageErrors.slice(0,10)));
 }catch(e){console.error("B72_PROFILE_ERROR",String(e));process.exitCode=1;}finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(String(e));server.kill();process.exitCode=1;});
