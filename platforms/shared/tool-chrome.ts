// The same compact app frame surrounds all bundled tools. Tool logic and records stay untouched.
const routes = [
  ['updates','Updates/News','/updates','<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>'],
  ['audits','Audits','/audits/index.html','<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>'],
  ['licence','FSSAI Licence','/fssai-license/index.html','<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>'],
  ['blogs','Blogs','/blogs','<path d="M12 4c-3-2-7-2-10 0v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 0Zm0 0v16"/>'],
  ['discussions','Discussions','/discussions','<path d="M21 11a7 7 0 0 1-7 7H7l-5 4V5a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z"/><path d="M7 7h9M7 11h6"/>'],
];
const svg=(paths:string)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';
function mount(){
 const section=location.pathname.startsWith('/audits/')?'audits':location.pathname.startsWith('/fssai-license/')?'licence':null;
 if(!section||document.querySelector('.platform-masthead'))return;
 document.documentElement.dataset.pmsvNative=section;
 const links=routes.map(([key,label,url,icon])=>'<a href="'+url+'"'+(key===section?' aria-current="page"':'')+'>'+svg(icon)+'<span>'+label+'</span></a>').join('');
 const top=document.createElement('header');top.className='platform-masthead';top.innerHTML='<a class="platform-brand" href="/" aria-label="PMSV Food Safety &amp; Quality Forum home"><img src="/brand/pmsv-family.png" alt="PMSV"/><span><strong>PMSV</strong><small>Food Safety &amp; Quality Forum</small></span></a><a class="platform-home" href="/" aria-label="Home">'+svg('<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/>')+'</a>';
 const side=document.createElement('nav');side.className='platform-sidebar';side.setAttribute('aria-label','Main navigation');side.innerHTML='<span class="platform-caption">WORKSPACE</span>'+links;
 const footer=document.createElement('nav');footer.className='platform-bottom';footer.setAttribute('aria-label','Main navigation');footer.innerHTML=links;
 document.body.prepend(top,side);document.body.append(footer);
 const note=document.querySelector('.footer');if(note){const walk=document.createTreeWalker(note,NodeFilter.SHOW_TEXT);let node;while(node=walk.nextNode())node.textContent=node.textContent?.replace('locally in this browser','locally in this app')||'';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
