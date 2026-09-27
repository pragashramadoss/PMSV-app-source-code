(()=>{if(window.__pmsvForumShell)return;window.__pmsvForumShell=true;
function mount(){
 if(document.querySelector('.pmsv-forum-sidebar'))return;
 const path=location.pathname,marker='/audits/',i=path.indexOf(marker),appBase=i>=0?path.slice(0,i):'';
 const href=p=>appBase?(appBase+p):(p==='/'?'../':('../'+p.replace(/^\//,'')));
 const style=document.createElement('style');style.id='pmsvForumShellStyle';style.textContent=`
 :root{--forum-primary:#3155d9;--forum-navy:#11213e;--forum-bg:#f0f3f9;--forum-line:#e2e7f0;--forum-text:#18243e;--forum-muted:#728099}
 body{background:var(--forum-bg)!important;color:var(--forum-text)!important;padding-left:232px!important;padding-top:64px!important;min-height:100vh}
 .pmsv-forum-sidebar{position:fixed;left:0;top:0;bottom:0;width:232px;background:var(--forum-navy);z-index:2000;padding:26px 16px 20px;display:flex;flex-direction:column;gap:8px;color:#fff}
 .pmsv-forum-brand{display:flex;align-items:center;gap:11px;padding:0 10px 20px;margin-bottom:8px;border-bottom:1px solid #ffffff18;color:#fff;text-decoration:none}
 .pmsv-forum-brand b{display:grid;place-items:center;width:46px;height:46px;border-radius:13px;background:var(--forum-primary);font-size:15px;letter-spacing:.4px}
 .pmsv-forum-brand span{font-size:13px;line-height:1.25;font-weight:800}.pmsv-forum-brand small{display:block;color:#9aabc5;font-size:10.5px;font-weight:500;margin-top:4px}
 .pmsv-forum-caption{font-size:11px;letter-spacing:1.7px;color:#8f9eb8;font-weight:700;padding:10px 14px 8px}
 .pmsv-forum-link{display:flex;align-items:center;gap:12px;color:#c1cde0!important;text-decoration:none!important;padding:13px 14px;border-radius:10px;font:700 13px/1.25 Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif!important}
 .pmsv-forum-link:hover{background:#1a3051;color:#fff!important}.pmsv-forum-link.active{background:var(--forum-primary);color:#fff!important;box-shadow:0 5px 18px #080f2829}
 .pmsv-forum-icon{font-size:18px;width:22px;text-align:center}
 .pmsv-forum-topbar{position:fixed;left:232px;right:0;top:0;height:64px;background:#fff;border-bottom:1px solid var(--forum-line);z-index:1900;display:flex;align-items:center;justify-content:space-between;padding:0 28px}
 .pmsv-forum-home{color:var(--forum-primary)!important;text-decoration:none!important;font:800 13px Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif!important}
 .pmsv-forum-section{font:800 13px Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#5f6f8c}
 body>header,body>.top{background:linear-gradient(135deg,#243e79,var(--forum-primary))!important}
 body>header .back,body>.top .back,body>header a,body>.top a{color:#fff!important}
 button,.btn,#start,.finish{transition:transform .12s,box-shadow .12s}button:hover,.btn:hover,#start:hover,.finish:hover{transform:translateY(-1px)}
 @media(max-width:760px){
   body{padding-left:0!important;padding-top:126px!important}
   .pmsv-forum-sidebar{top:58px;bottom:auto;width:100%;height:68px;padding:7px 8px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
   .pmsv-forum-brand,.pmsv-forum-caption{display:none}.pmsv-forum-link{padding:8px 5px;justify-content:center;text-align:center;font-size:10.5px!important;gap:4px}.pmsv-forum-icon{font-size:15px;width:auto}
   .pmsv-forum-topbar{left:0;height:58px;padding:0 12px}.pmsv-forum-section{font-size:11px}
 }
 @media print{body{padding:0!important}.pmsv-forum-sidebar,.pmsv-forum-topbar{display:none!important}}
 `;document.head.appendChild(style);
 const side=document.createElement('aside');side.className='pmsv-forum-sidebar';side.innerHTML=
  '<a class="pmsv-forum-brand" href="'+href('/')+'"><b>PMSV</b><span>Food Safety &amp; Quality Forum<small>Food safety · Quality · Excellence</small></span></a>'+
  '<div class="pmsv-forum-caption">WORKSPACE</div>'+
  '<a class="pmsv-forum-link" href="'+href('/updates')+'"><span class="pmsv-forum-icon">📰</span><span>Food Safety/Quality<br>Updates</span></a>'+
  '<a class="pmsv-forum-link active" href="'+href('/audits/index.html')+'"><span class="pmsv-forum-icon">✓</span><span>Food Safety/Quality<br>Audits</span></a>'+
  '<a class="pmsv-forum-link" href="'+href('/blogs')+'"><span class="pmsv-forum-icon">✎</span><span>Food Safety/Quality<br>Blogs</span></a>';
 const top=document.createElement('div');top.className='pmsv-forum-topbar';top.innerHTML='<a class="pmsv-forum-home" href="'+href('/')+'">← Back to Forum Home</a><span class="pmsv-forum-section">PMSV Audits</span>';
 document.body.prepend(top);document.body.prepend(side);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();